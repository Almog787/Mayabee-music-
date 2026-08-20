import * as Tone from 'tone';

export interface PadConfig {
  id: number;
  name: string;
  type: string;
  synthParams: { 
    oscillatorType?: string;
    instrumentType?: 'Synth' | 'FMSynth' | 'AMSynth' | 'MembraneSynth' | 'MetalSynth' | 'NoiseSynth' | 'PluckSynth' | 'Sampler';
    samplerUrl?: string;
    samplerInstrument?: string;
    envelope?: any;
    modulationEnvelope?: any;
    harmonicity?: number;
    modulationIndex?: number;
    volume?: number;
  };
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
    
    // Set default lookahead for better scheduling
    Tone.context.lookAhead = 0.1;

    // Master Bus
    this.filter = new Tone.Filter(20000, "lowpass");
    this.bitcrusher = new Tone.BitCrusher(4);
    this.bitcrusher.wet.value = 0; // default off
    
    this.delay = new Tone.FeedbackDelay("8n", 0.5);
    this.delay.wet.value = 0;
    
    this.reverb = new Tone.Freeverb({
      roomSize: 0.6,
      dampening: 3000
    });
    this.reverb.wet.value = 0.12; // Natural room ambiance
    
    // High Quality Mastering Chain
    this.eq = new Tone.EQ3({
      low: 3.5, // Warmer, fuller bass punch
      mid: -1.5, // Less muddy mid-range
      high: 2.5 // Crisper, airier highs
    });
    
    this.compressor = new Tone.Compressor({
      threshold: -28,
      ratio: 4,
      attack: 0.005, // Fast enough to catch peaks, slow enough to let kick punch
      release: 0.2  // Smooth glue pumping
    });
    
    this.limiter = new Tone.Limiter(-1); // Prevent clipping

    this.masterVolume = new Tone.Volume(0).toDestination();

    // Routing: Filter -> Effects -> EQ -> Compressor -> Limiter -> Output
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
    
    this.stopTimeouts.forEach(t => clearTimeout(t));
    this.stopTimeouts.clear();
    this.targetVolumes.clear();

    Tone.Transport.bpm.value = kit.tempo;

    kit.pads.forEach((pad) => {
      let synth;
      const instType = pad.synthParams.instrumentType;
      
      const getSynthClass = (type?: string) => {
        switch(type) {
          case 'FMSynth': return Tone.FMSynth;
          case 'AMSynth': return Tone.AMSynth;
          case 'PluckSynth': return Tone.PluckSynth;
          case 'MetalSynth': return Tone.MetalSynth;
          case 'NoiseSynth': return Tone.NoiseSynth;
          case 'MembraneSynth': return Tone.MembraneSynth;
          default: return Tone.Synth;
        }
      };

      const SynthClass = getSynthClass(instType);
      
      const buildParams = () => {
        const params: any = {};
        if (pad.synthParams.oscillatorType && instType !== 'PluckSynth' && instType !== 'MetalSynth' && instType !== 'NoiseSynth') {
          params.oscillator = { type: pad.synthParams.oscillatorType };
        }
        if (pad.synthParams.envelope) params.envelope = pad.synthParams.envelope;
        if (pad.synthParams.modulationEnvelope) params.modulationEnvelope = pad.synthParams.modulationEnvelope;
        if (pad.synthParams.harmonicity) params.harmonicity = pad.synthParams.harmonicity;
        if (pad.synthParams.modulationIndex) params.modulationIndex = pad.synthParams.modulationIndex;
        return params;
      };

      if (instType === 'Sampler') {
        if (pad.synthParams.samplerUrl === 'drums') {
          synth = new Tone.Sampler({
            urls: {
              "C1": "kick.mp3",
              "E2": "snare.mp3",
              "C2": "hihat.mp3",
              "A1": "tom1.mp3",
              "G1": "tom2.mp3",
              "F1": "tom3.mp3"
            },
            baseUrl: "https://tonejs.github.io/audio/drum-samples/acoustic-kit/"
          }).connect(this.filter);
        } else {
          const instName = pad.synthParams.samplerInstrument || 'acoustic_grand_piano';
          synth = new Tone.Sampler({
            urls: {
              "A2": "A2.mp3",
              "C3": "C3.mp3",
              "F3": "F3.mp3",
              "C4": "C4.mp3",
              "F4": "F4.mp3",
              "C5": "C5.mp3",
              "F5": "F5.mp3",
              "C6": "C6.mp3"
            },
            baseUrl: `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/${instName}-mp3/`,
            attack: 0.01,
            release: pad.type === 'chord' ? 1.5 : (pad.type === 'bass' ? 0.8 : 0.5),
            curve: "exponential"
          }).connect(this.filter);
        }
      } else if (instType === 'NoiseSynth' || instType === 'MetalSynth') {
        synth = new (SynthClass as any)(buildParams()).connect(this.filter);
      } else if (pad.type === 'drum') {
        synth = new (SynthClass as any)(buildParams()).connect(this.filter);
      } else if (pad.type === 'chord') {
        synth = new Tone.PolySynth(SynthClass as any, buildParams()).connect(this.filter);
      } else {
        synth = new (SynthClass as any)(buildParams()).connect(this.filter);
      }
      
      if (pad.synthParams.volume !== undefined) {
        synth.volume.value = pad.synthParams.volume;
      } else {
        synth.volume.value = -6; // default fallback
      }
      
      this.synths.set(pad.id, synth);

      // Setup Sequence
      const seq = new Tone.Sequence((time, note) => {
        if (!this.activePadIds.has(pad.id)) return;
        if (note && note !== 'null') {
          // Calculate a musical duration based on the pad type
          let duration = "16n";
          if (pad.type === 'chord') duration = "4n"; // ring out for a full beat
          else if (pad.type === 'lead' || pad.type === 'bass') duration = "8n"; // ring out for half beat
          
          if (instType === 'NoiseSynth' || instType === 'MetalSynth') {
            (synth as any).triggerAttackRelease(duration, time);
          } else if (instType === 'Sampler') {
            (synth as Tone.Sampler).triggerAttackRelease(note, duration, time);
          } else if (pad.type === 'drum') {
            (synth as Tone.MembraneSynth).triggerAttackRelease(note, duration, time);
          } else if (pad.type === 'chord') {
            (synth as Tone.PolySynth).triggerAttackRelease([note], duration, time);
          } else {
            (synth as any).triggerAttackRelease(note, duration, time);
          }
        }
      }, pad.sequence, "16n");

      this.sequences.set(pad.id, seq);
      seq.start(0);
    });
    
    // Wait for all Samplers (and other buffers) to load before returning
    await Tone.loaded();
  }

  private getActivePadCount(): number {
    return this.activePadIds.size;
  }

  private triggerSynthNote(pad: PadConfig, note: string, time: number) {
    const synth = this.synths.get(pad.id);
    if (!synth) return;
    const instType = pad.synthParams.instrumentType;
    try {
      let duration = "16n";
      if (pad.type === 'chord') duration = "4n";
      else if (pad.type === 'lead' || pad.type === 'bass') duration = "8n";

      if (instType === 'NoiseSynth' || instType === 'MetalSynth') {
        (synth as any).triggerAttackRelease(duration, time);
      } else if (instType === 'Sampler') {
        (synth as Tone.Sampler).triggerAttackRelease(note, duration, time);
      } else if (pad.type === 'drum') {
        (synth as Tone.MembraneSynth).triggerAttackRelease(note, duration, time);
      } else if (pad.type === 'chord') {
        (synth as Tone.PolySynth).triggerAttackRelease([note], duration, time);
      } else {
        (synth as any).triggerAttackRelease(note, duration, time);
      }
    } catch (e) {
      console.warn("Failed to trigger note", e);
    }
  }

  private targetVolumes: Map<number, number> = new Map();
  private stopTimeouts: Map<number, NodeJS.Timeout> = new Map();

  playPad(id: number) {
    const synth = this.synths.get(id);
    if (!synth) return;

    // Cancel any pending stop timeout
    if (this.stopTimeouts.has(id)) {
      clearTimeout(this.stopTimeouts.get(id)!);
      this.stopTimeouts.delete(id);
    }

    const targetVol = this.targetVolumes.get(id) ?? -6;
    
    if (this.getActivePadCount() === 0 && !this.activePadIds.has(id)) {
      Tone.Transport.stop();
      Tone.Transport.position = "0:0:0";
      Tone.Transport.start("+0.05");
    }

    if (!this.activePadIds.has(id)) {
      synth.volume.value = -60;
      this.activePadIds.add(id);
    }
    
    // Smoothly fade in over a half note
    synth.volume.rampTo(targetVol, "2n");
  }

  stopPad(id: number) {
    const synth = this.synths.get(id);
    if (!synth) {
      this.activePadIds.delete(id);
      return;
    }

    // Fade out over a half note
    synth.volume.rampTo(-60, "2n");
    
    // Schedule removal from active loop after fade finishes (approx 1000ms at 120bpm)
    const timeout = setTimeout(() => {
      this.activePadIds.delete(id);
      if (this.getActivePadCount() === 0) {
        Tone.Transport.stop();
        Tone.Transport.position = "0:0:0";
      }
      this.stopTimeouts.delete(id);
    }, 1000);
    
    this.stopTimeouts.set(id, timeout);
  }

  togglePad(id: number): boolean {
    const seq = this.sequences.get(id);
    if (!seq) return false;
    // We consider it "active" if it's in activePadIds AND not scheduled to stop
    const isActuallyActive = this.activePadIds.has(id) && !this.stopTimeouts.has(id);
    
    if (isActuallyActive) {
      this.stopPad(id);
      return false;
    } else {
      this.playPad(id);
      return true;
    }
  }

  setPadVolume(id: number, volumeDb: number) {
    this.targetVolumes.set(id, volumeDb);
    if (!this.synths.has(id)) return;
    
    const synth = this.synths.get(id)!;
    // Only apply immediately if it's fully active (not stopping)
    if (this.activePadIds.has(id) && !this.stopTimeouts.has(id)) {
      synth.volume.rampTo(volumeDb, 0.1);
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
