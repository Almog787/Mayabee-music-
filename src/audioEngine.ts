import * as Tone from 'tone';

export interface PadConfig {
  id: number;
  name: string;
  type: string;
  synthParams: { 
    oscillatorType?: string;
    instrumentType?: 'Synth' | 'FMSynth' | 'AMSynth' | 'MembraneSynth' | 'MetalSynth' | 'NoiseSynth' | 'PluckSynth' | 'Sampler' | 'DrumKit';
    samplerUrl?: string;
    samplerInstrument?: string;
    envelope?: any;
    modulationEnvelope?: any;
    harmonicity?: number;
    modulationIndex?: number;
    volume?: number;
    filterFreq?: number;
  };
  sequence: (string | null)[];
}

export interface KitConfig {
  key: string;
  tempo: number;
  pads: PadConfig[];
}

// Built-in high-fidelity drum voice synthesizer to guarantee punchy, instant studio sound
class DrumVoiceEngine {
  private kickSynth: Tone.MembraneSynth;
  private snareNoise: Tone.NoiseSynth;
  private snareBody: Tone.MembraneSynth;
  private hihatSynth: Tone.NoiseSynth;
  private hihatFilter: Tone.Filter;
  private clapNoise: Tone.NoiseSynth;
  private percSynth: Tone.MembraneSynth;
  private output: Tone.Volume;

  constructor(targetBus: Tone.ToneAudioNode) {
    this.output = new Tone.Volume(0).connect(targetBus);

    // Kick: Punchy, deep, modern sub transient
    this.kickSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 6,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.32,
        sustain: 0.01,
        release: 0.35,
      }
    }).connect(this.output);
    this.kickSynth.volume.value = 1;

    // Snare Body: Low tone body
    this.snareBody = new Tone.MembraneSynth({
      pitchDecay: 0.02,
      octaves: 3,
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.001,
        decay: 0.12,
        sustain: 0,
        release: 0.12
      }
    }).connect(this.output);
    this.snareBody.volume.value = -4;

    // Snare Noise: Crisp top snap
    const snareFilter = new Tone.Filter(3500, "highpass").connect(this.output);
    this.snareNoise = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: 0.001,
        decay: 0.15,
        sustain: 0.01,
        release: 0.12
      }
    }).connect(snareFilter);
    this.snareNoise.volume.value = -3;

    // Hi-Hat: Filtered bright top crispness
    this.hihatFilter = new Tone.Filter(8000, "highpass").connect(this.output);
    this.hihatSynth = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: {
        attack: 0.001,
        decay: 0.045,
        sustain: 0,
        release: 0.04
      }
    }).connect(this.hihatFilter);
    this.hihatSynth.volume.value = -6;

    // Clap: Stereo-ish snappy noise burst
    const clapFilter = new Tone.Filter(2200, "bandpass").connect(this.output);
    this.clapNoise = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: 0.01,
        decay: 0.22,
        sustain: 0,
        release: 0.2
      }
    }).connect(clapFilter);
    this.clapNoise.volume.value = -4;

    // Percussion / Tom
    this.percSynth = new Tone.MembraneSynth({
      pitchDecay: 0.04,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.002,
        decay: 0.18,
        sustain: 0,
        release: 0.18
      }
    }).connect(this.output);
    this.percSynth.volume.value = -4;
  }

  setVolume(volDb: number) {
    this.output.volume.value = volDb;
  }

  trigger(note: string, duration: string, time: number) {
    const n = note.toLowerCase();
    if (n.includes('kick') || n === 'c1') {
      this.kickSynth.triggerAttackRelease("C1", "8n", time);
    } else if (n.includes('snare') || n === 'e2') {
      this.snareBody.triggerAttackRelease("G2", "16n", time);
      this.snareNoise.triggerAttackRelease("16n", time);
    } else if (n.includes('hat') || n.includes('hihat') || n === 'c2') {
      this.hihatSynth.triggerAttackRelease("32n", time);
    } else if (n.includes('openhat') || n === 'd#2') {
      this.hihatSynth.triggerAttackRelease("8n", time);
    } else if (n.includes('clap') || n === 'd2') {
      this.clapNoise.triggerAttackRelease("16n", time);
    } else if (n.includes('perc') || n.includes('tom') || n === 'a1') {
      this.percSynth.triggerAttackRelease("A2", "16n", time);
    } else {
      // Fallback
      this.kickSynth.triggerAttackRelease("C1", "8n", time);
    }
  }

  dispose() {
    this.kickSynth.dispose();
    this.snareNoise.dispose();
    this.snareBody.dispose();
    this.hihatSynth.dispose();
    this.hihatFilter.dispose();
    this.clapNoise.dispose();
    this.percSynth.dispose();
    this.output.dispose();
  }
}

class AudioEngine {
  private synths: Map<number, Tone.PolySynth | Tone.Synth | Tone.MembraneSynth | DrumVoiceEngine> = new Map();
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
  private eq!: Tone.EQ3;
  private compressor!: Tone.Compressor;
  private limiter!: Tone.Limiter;
  
  // Recording
  private recorder!: MediaRecorder;
  private audioChunks: Blob[] = [];
  private mediaStreamDestination!: MediaStreamAudioDestinationNode;

  async init() {
    if (this.isInitialized) return;
    await Tone.start();
    
    // Set default lookahead for rock-solid scheduling
    Tone.context.lookAhead = 0.08;

    // Master Bus Effects Chain
    this.filter = new Tone.Filter(20000, "lowpass");
    this.bitcrusher = new Tone.BitCrusher(4);
    this.bitcrusher.wet.value = 0;
    
    this.delay = new Tone.FeedbackDelay("8n.", 0.35);
    this.delay.wet.value = 0;
    
    this.reverb = new Tone.Freeverb({
      roomSize: 0.65,
      dampening: 3500
    });
    this.reverb.wet.value = 0.1; // Pristine studio ambience
    
    // High Quality Mastering Chain: Clean punch & warm balance
    this.eq = new Tone.EQ3({
      low: 2.0,
      mid: -1.0,
      high: 2.0
    });
    
    this.compressor = new Tone.Compressor({
      threshold: -24,
      ratio: 3.5,
      attack: 0.008,
      release: 0.15
    });
    
    this.limiter = new Tone.Limiter(-0.5); // Safe ceiling to prevent any harsh clipping
    this.masterVolume = new Tone.Volume(0).toDestination();

    // Routing: Filter -> Bitcrusher -> Delay -> Reverb -> EQ -> Compressor -> Limiter -> Output
    this.filter.chain(
      this.bitcrusher,
      this.delay,
      this.reverb,
      this.eq,
      this.compressor,
      this.limiter,
      this.masterVolume
    );

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

  async loadKit(kit: KitConfig) {
    if (!this.isInitialized) await this.init();
    this.currentKit = kit;

    // Reset transport
    Tone.Transport.stop();
    Tone.Transport.position = "0:0:0";
    this.activePadIds.clear();

    this.synths.forEach(s => s.dispose());
    this.synths.clear();
    this.sequences.forEach(s => s.dispose());
    this.sequences.clear();
    
    this.targetVolumes.clear();

    Tone.Transport.bpm.value = kit.tempo;

    kit.pads.forEach((pad) => {
      let synthInstance: any;
      const instType = pad.synthParams.instrumentType;
      
      const buildParams = () => {
        const params: any = {};
        if (pad.synthParams.oscillatorType) {
          params.oscillator = { type: pad.synthParams.oscillatorType };
        }
        if (pad.synthParams.envelope) params.envelope = pad.synthParams.envelope;
        if (pad.synthParams.modulationEnvelope) params.modulationEnvelope = pad.synthParams.modulationEnvelope;
        if (pad.synthParams.harmonicity) params.harmonicity = pad.synthParams.harmonicity;
        if (pad.synthParams.modulationIndex) params.modulationIndex = pad.synthParams.modulationIndex;
        return params;
      };

      if (pad.type === 'drum' || instType === 'DrumKit' || (pad.synthParams.samplerUrl === 'drums')) {
        // High fidelity instant drum synthesizer
        synthInstance = new DrumVoiceEngine(this.filter);
      } else if (pad.type === 'chord') {
        // Polyphonic lush synth for chords
        const chordParams = buildParams();
        synthInstance = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: (pad.synthParams.oscillatorType || 'triangle') as any },
          envelope: pad.synthParams.envelope || { attack: 0.05, decay: 0.4, sustain: 0.6, release: 1.2 }
        }).connect(this.filter);
      } else if (instType === 'AMSynth') {
        synthInstance = new Tone.AMSynth(buildParams()).connect(this.filter);
      } else if (instType === 'FMSynth') {
        synthInstance = new Tone.FMSynth(buildParams()).connect(this.filter);
      } else {
        // Monophonic synth for Bass / Leads
        synthInstance = new Tone.Synth(buildParams()).connect(this.filter);
      }
      
      const defaultVol = pad.synthParams.volume !== undefined ? pad.synthParams.volume : -6;
      this.targetVolumes.set(pad.id, defaultVol);
      
      if (typeof synthInstance.setVolume === 'function') {
        synthInstance.setVolume(-60);
      } else if (synthInstance.volume) {
        synthInstance.volume.value = -60;
      }
      
      this.synths.set(pad.id, synthInstance);

      // Setup 16-step synchronized sequence
      const seq = new Tone.Sequence((time, note) => {
        if (!this.activePadIds.has(pad.id)) return;
        if (!note || note === 'null') return;

        let duration = "16n";
        if (pad.type === 'chord') duration = "4n";
        else if (pad.type === 'lead') duration = "8n";
        else if (pad.type === 'bass') duration = "8n";

        try {
          if (synthInstance instanceof DrumVoiceEngine) {
            synthInstance.trigger(note as string, duration, time);
          } else if (pad.type === 'chord' && synthInstance instanceof Tone.PolySynth) {
            // Note could be comma-separated like "C3,E3,G3" or single note
            const notes = (note as string).includes(',') 
              ? (note as string).split(',') 
              : [note as string];
            synthInstance.triggerAttackRelease(notes, duration, time);
          } else {
            synthInstance.triggerAttackRelease(note as string, duration, time);
          }
        } catch (err) {
          console.warn("AudioEngine trigger error:", err);
        }
      }, pad.sequence, "16n");

      this.sequences.set(pad.id, seq);
      seq.start(0);
    });
  }

  private getActivePadCount(): number {
    return this.activePadIds.size;
  }

  private targetVolumes: Map<number, number> = new Map();

  playPad(id: number) {
    const synth = this.synths.get(id);
    if (!synth) return;

    const targetVol = this.targetVolumes.get(id) ?? -6;
    
    // If transport is stopped, start it in perfect phase
    if (this.getActivePadCount() === 0) {
      Tone.Transport.stop();
      Tone.Transport.position = "0:0:0";
      Tone.Transport.start("+0.02");
    }

    this.activePadIds.add(id);
    
    // Snappy, professional musical un-mute (50ms ramp prevents clicks & keeps instant sync)
    if (typeof (synth as any).setVolume === 'function') {
      (synth as any).setVolume(targetVol);
    } else if ((synth as any).volume) {
      (synth as any).volume.rampTo(targetVol, 0.05);
    }
  }

  stopPad(id: number) {
    const synth = this.synths.get(id);
    if (!synth) {
      this.activePadIds.delete(id);
      return;
    }

    // Snappy fade out
    if (typeof (synth as any).setVolume === 'function') {
      (synth as any).setVolume(-60);
      this.activePadIds.delete(id);
    } else if ((synth as any).volume) {
      (synth as any).volume.rampTo(-60, 0.05);
      setTimeout(() => {
        this.activePadIds.delete(id);
        if (this.getActivePadCount() === 0) {
          Tone.Transport.stop();
          Tone.Transport.position = "0:0:0";
        }
      }, 60);
    } else {
      this.activePadIds.delete(id);
    }

    if (this.getActivePadCount() === 0) {
      Tone.Transport.stop();
      Tone.Transport.position = "0:0:0";
    }
  }

  togglePad(id: number): boolean {
    const isCurrentlyActive = this.activePadIds.has(id);
    if (isCurrentlyActive) {
      this.stopPad(id);
      return false;
    } else {
      this.playPad(id);
      return true;
    }
  }

  setPadVolume(id: number, volumeDb: number) {
    this.targetVolumes.set(id, volumeDb);
    const synth = this.synths.get(id);
    if (!synth) return;
    
    if (this.activePadIds.has(id)) {
      if (typeof (synth as any).setVolume === 'function') {
        (synth as any).setVolume(volumeDb);
      } else if ((synth as any).volume) {
        (synth as any).volume.rampTo(volumeDb, 0.05);
      }
    }
  }

  setFilter(x: number, y: number) {
    if (!this.filter) return;
    const minFreq = 250;
    const maxFreq = 20000;
    const freq = minFreq * Math.pow(maxFreq / minFreq, x);
    this.filter.frequency.rampTo(freq, 0.05);
    this.filter.Q.rampTo(y * 12, 0.05);
  }

  setDelay(x: number, y: number) {
    if (!this.delay) return;
    this.delay.wet.rampTo(x > 0.03 || y > 0.03 ? Math.min(0.6, x * 0.7) : 0, 0.05);
    this.delay.delayTime.rampTo(Math.max(0.05, x * 0.75), 0.05);
    this.delay.feedback.rampTo(y * 0.7, 0.05);
  }

  setBitcrush(value: number) {
    if (!this.bitcrusher) return;
    this.bitcrusher.wet.rampTo(value * 0.8, 0.05);
    this.bitcrusher.bits.value = Math.max(2, Math.floor(8 - (value * 6)));
  }

  setReverb(value: number) {
    if (!this.reverb) return;
    this.reverb.wet.rampTo(value * 0.75, 0.05);
    this.reverb.roomSize.rampTo(0.3 + value * 0.6, 0.05);
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
