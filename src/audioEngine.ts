import * as Tone from 'tone';

export interface PadConfig {
  id: number;
  name: string;
  type: string;
  synthParams: { oscillatorType: string };
  sequence: (string | null)[];
}

export interface KitConfig {
  key: string;
  tempo: number;
  pads: PadConfig[];
}

class AudioEngine {
  private synths: Map<number, Tone.PolySynth | Tone.Synth | Tone.MembraneSynth> = new Map();
  private sequences: Map<number, Tone.Sequence> = new Map();
  private activePadIds: Set<number> = new Set();
  private isInitialized = false;
  private currentKit: KitConfig | null = null;

  // Effects
  private filter!: Tone.Filter;
  private bitcrusher!: Tone.BitCrusher;
  private delay!: Tone.FeedbackDelay;
  private reverb!: Tone.Freeverb;
  private masterVolume!: Tone.Volume;
  
  // Recording
  private recorder!: MediaRecorder;
  private audioChunks: Blob[] = [];
  private mediaStreamDestination!: MediaStreamAudioDestinationNode;

  async init() {
    if (this.isInitialized) return;
    await Tone.start();
    
    // Master Bus
    this.filter = new Tone.Filter(20000, "lowpass");
    this.bitcrusher = new Tone.BitCrusher(4);
    this.bitcrusher.wet.value = 0; // default off
    
    this.delay = new Tone.FeedbackDelay("8n", 0.5);
    this.delay.wet.value = 0;
    
    this.reverb = new Tone.Freeverb();
    this.reverb.wet.value = 0;

    this.masterVolume = new Tone.Volume(0).toDestination();

    // Routing
    this.filter.connect(this.bitcrusher);
    this.bitcrusher.connect(this.delay);
    this.delay.connect(this.reverb);
    this.reverb.connect(this.masterVolume);

    // Setup Recording
    const context = Tone.context.rawContext as AudioContext;
    this.mediaStreamDestination = context.createMediaStreamDestination();
    this.masterVolume.connect(this.mediaStreamDestination);
    
    this.recorder = new MediaRecorder(this.mediaStreamDestination.stream);
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.audioChunks.push(e.data);
    };

    this.isInitialized = true;
  }

  async resume() {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
  }

  loadKit(kit: KitConfig) {
    if (!this.isInitialized) return;
    this.currentKit = kit;

    // Clear existing
    Tone.Transport.stop();
    Tone.Transport.position = "0:0:0";

    this.activePadIds.clear();

    this.synths.forEach(s => s.dispose());
    this.synths.clear();
    this.sequences.forEach(s => s.dispose());
    this.sequences.clear();

    Tone.Transport.bpm.value = kit.tempo;

    kit.pads.forEach((pad) => {
      let synth;
      // Setup Synth
      if (pad.type === 'drum') {
        synth = new Tone.MembraneSynth().connect(this.filter);
      } else if (pad.type === 'chord') {
        synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: pad.synthParams.oscillatorType as any }
        }).connect(this.filter);
      } else {
        synth = new Tone.Synth({
          oscillator: { type: pad.synthParams.oscillatorType as any },
          envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 1 }
        }).connect(this.filter);
      }
      this.synths.set(pad.id, synth);

      // Setup Sequence
      const seq = new Tone.Sequence((time, note) => {
        if (!this.activePadIds.has(pad.id)) return;
        if (note && note !== 'null') {
          if (pad.type === 'drum') {
            (synth as Tone.MembraneSynth).triggerAttackRelease(note, "16n", time);
          } else if (pad.type === 'chord') {
            (synth as Tone.PolySynth).triggerAttackRelease([note], "16n", time);
          } else {
            (synth as Tone.Synth).triggerAttackRelease(note, "16n", time);
          }
        }
      }, pad.sequence, "16n");

      this.sequences.set(pad.id, seq);
      seq.start(0);
    });
  }

  private getActivePadCount(): number {
    return this.activePadIds.size;
  }

  private triggerSynthNote(pad: PadConfig, note: string, time: number) {
    const synth = this.synths.get(pad.id);
    if (!synth) return;
    try {
      if (pad.type === 'drum') {
        (synth as Tone.MembraneSynth).triggerAttackRelease(note, "16n", time);
      } else if (pad.type === 'chord') {
        (synth as Tone.PolySynth).triggerAttackRelease([note], "16n", time);
      } else {
        (synth as Tone.Synth).triggerAttackRelease(note, "16n", time);
      }
    } catch (e) {
      console.warn("Failed to trigger note", e);
    }
  }

  playPad(id: number) {
    if (this.activePadIds.has(id)) return;

    const pad = this.currentKit?.pads.find(p => p.id === id);
    const firstNote = pad?.sequence.find(n => n && n !== 'null') || (pad?.type === 'drum' ? 'C1' : 'C4');

    if (this.getActivePadCount() === 0) {
      Tone.Transport.stop();
      Tone.Transport.position = "0:0:0";
      Tone.Transport.start();
      this.activePadIds.add(id);

      if (pad && firstNote && (pad.sequence[0] === null || pad.sequence[0] === 'null')) {
        this.triggerSynthNote(pad, firstNote, Tone.now());
      }
    } else {
      this.activePadIds.add(id);
      if (pad && firstNote) {
        try {
          const parts = Tone.Transport.position.toString().split(':');
          const beat = parseInt(parts[1] || "0", 10);
          const sixteenth = parseInt(parts[2] || "0", 10);
          const currentStep = (beat * 4 + sixteenth) % 16;
          if (pad.sequence[currentStep] === null || pad.sequence[currentStep] === 'null') {
            this.triggerSynthNote(pad, firstNote, Tone.now());
          }
        } catch (e) {
          this.triggerSynthNote(pad, firstNote, Tone.now());
        }
      }
    }
  }

  stopPad(id: number) {
    this.activePadIds.delete(id);
    if (this.getActivePadCount() === 0) {
      Tone.Transport.stop();
      Tone.Transport.position = "0:0:0";
    }
  }

  togglePad(id: number): boolean {
    const seq = this.sequences.get(id);
    if (!seq) return false;
    if (this.activePadIds.has(id)) {
      this.stopPad(id);
      return false;
    } else {
      this.playPad(id);
      return true;
    }
  }

  setFilter(x: number, y: number) {
    // x: cutoff (0-1), y: resonance (0-1)
    if (!this.filter) return;
    const minFreq = 200;
    const maxFreq = 20000;
    const freq = minFreq * Math.pow(maxFreq / minFreq, x);
    this.filter.frequency.rampTo(freq, 0.1);
    this.filter.Q.rampTo(y * 20, 0.1); // Resonance 0 to 20
  }

  setDelay(x: number, y: number) {
    // x: time (0-1), y: feedback (0-1)
    if (!this.delay) return;
    this.delay.wet.rampTo(x > 0.05 || y > 0.05 ? 1 : 0, 0.1);
    this.delay.delayTime.rampTo(x * 1.0, 0.1); // up to 1 second
    this.delay.feedback.rampTo(y * 0.9, 0.1); // up to 90% feedback
  }

  setBitcrush(value: number) {
    // value 0 to 1
    if (!this.bitcrusher) return;
    this.bitcrusher.wet.rampTo(value, 0.1);
    this.bitcrusher.bits.value = Math.max(1, Math.floor(8 - (value * 7))); // 8 to 1 bits
  }

  setReverb(value: number) {
    // value 0 to 1
    if (!this.reverb) return;
    this.reverb.wet.rampTo(value, 0.1);
    this.reverb.roomSize.rampTo(value * 0.9, 0.1);
  }

  startRecording() {
    if (this.recorder && this.recorder.state === "inactive") {
      this.audioChunks = [];
      this.recorder.start();
    }
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.recorder || this.recorder.state === "inactive") {
        resolve(new Blob());
        return;
      }
      this.recorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        resolve(blob);
      };
      this.recorder.stop();
    });
  }
}

export const audioEngine = new AudioEngine();
