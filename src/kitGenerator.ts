import { KitConfig, PadConfig } from './audioEngine';

interface TemplateBlueprint {
  key: string;
  tempo: number;
  // 4 chord harmonic progression across the 16 steps (steps 0-3, 4-7, 8-11, 12-15)
  chords: string[]; // Polyphonic chord strings like "C3,E3,G3,C4"
  rootNotes: string[]; // Bass roots for each bar: e.g. ["C2", "G1", "A1", "F1"]
  fifthNotes: string[]; // Bass 5ths
  octaveNotes: string[]; // Bass 8ths
  leadNotes: string[][]; // Melodic motif options per chord
  arpNotes: string[][]; // High arpeggio sparkle notes per chord
  kickRhythm: number[]; // Step indices for kick
  snareRhythm: number[]; // Step indices for snare
  hatRhythm: number[]; // Step indices for hi-hats
  percRhythm?: number[]; // Step indices for percs
  bassRhythm: number[]; // Step indices for sub bass
  bassGrooveRhythm: number[]; // Step indices for bass lick
  chordRhythm: number[]; // Step indices for main chords
  pluckRhythm: number[]; // Step indices for rhythmic plucks
  leadRhythm: number[]; // Step indices for lead
  arpRhythm: number[]; // Step indices for high sparkle
  soundDesign: {
    bassOsc: string;
    bassEnv: any;
    leadOsc: string;
    leadEnv: any;
    pluckOsc: string;
    pluckEnv: any;
  };
}

const TEMPLATES: Record<string, TemplateBlueprint> = {
  // -------------------------------------------------------------
  // 1. POP + HAPPY (118 BPM, C Major - Euphoric, uplifting radio pop)
  // -------------------------------------------------------------
  "Pop_Happy": {
    key: "C Major",
    tempo: 118,
    chords: [
      "C3,G3,C4,E4",     // I (C)
      "G2,D3,G3,B3",     // V (G)
      "A2,E3,A3,C4",     // vi (Am)
      "F2,C3,F3,A3"      // IV (F)
    ],
    rootNotes: ["C2", "G1", "A1", "F1"],
    fifthNotes: ["G2", "D2", "E2", "C2"],
    octaveNotes: ["C3", "G2", "A2", "F2"],
    leadNotes: [
      ["E4", "G4", "C5", "G4"],
      ["D4", "G4", "B4", "D5"],
      ["C4", "E4", "A4", "C5"],
      ["A4", "C5", "F5", "E5"]
    ],
    arpNotes: [
      ["C5", "E5", "G5", "C6"],
      ["B4", "D5", "G5", "B5"],
      ["A4", "C5", "E5", "A5"],
      ["F5", "A5", "C6", "F6"]
    ],
    kickRhythm: [0, 4, 8, 12], // Solid 4-on-the-floor pop drive
    snareRhythm: [4, 12],      // Crisp backbeat on 2 & 4
    hatRhythm: [2, 6, 10, 14], // Driving offbeat hats
    percRhythm: [7, 15],
    bassRhythm: [0, 3, 4, 8, 11, 12], // Bouncy pop bass
    bassGrooveRhythm: [3, 6, 11, 14],
    chordRhythm: [0, 4, 8, 12], // Pumping on-beat chords
    pluckRhythm: [2, 5, 7, 10, 13, 15], // Syncopated 16th chops
    leadRhythm: [0, 2, 4, 6, 8, 10, 12, 14],
    arpRhythm: [1, 3, 5, 7, 9, 11, 13, 15],
    soundDesign: {
      bassOsc: "sawtooth",
      bassEnv: { attack: 0.01, decay: 0.25, sustain: 0.3, release: 0.4 },
      leadOsc: "triangle",
      leadEnv: { attack: 0.03, decay: 0.2, sustain: 0.6, release: 0.8 },
      pluckOsc: "square",
      pluckEnv: { attack: 0.005, decay: 0.12, sustain: 0.05, release: 0.2 }
    }
  },

  // -------------------------------------------------------------
  // 2. POP + SAD (96 BPM, A Minor - Emotive, acoustic pop ballad)
  // -------------------------------------------------------------
  "Pop_Sad": {
    key: "A Minor",
    tempo: 96,
    chords: [
      "A2,E3,G3,C4",     // Am7
      "F2,C3,E3,A3",     // Fmaj7
      "C3,G3,C4,E4",     // C
      "G2,D3,G3,B3"      // G
    ],
    rootNotes: ["A1", "F1", "C2", "G1"],
    fifthNotes: ["E2", "C2", "G2", "D2"],
    octaveNotes: ["A2", "F2", "C3", "G2"],
    leadNotes: [
      ["E4", "C4", "B3", "A3"],
      ["A4", "G4", "E4", "D4"],
      ["G4", "E4", "D4", "C4"],
      ["B3", "D4", "G4", "E4"]
    ],
    arpNotes: [
      ["E5", "A5", "C6", "E6"],
      ["E5", "A5", "C6", "F6"],
      ["E5", "G5", "C6", "E6"],
      ["D5", "G5", "B5", "D6"]
    ],
    kickRhythm: [0, 6, 8, 14], // Gentle heartbeat kick
    snareRhythm: [4, 12],
    hatRhythm: [0, 2, 4, 6, 8, 10, 12, 14], // Flowing 8th hats
    percRhythm: [10],
    bassRhythm: [0, 4, 8, 12], // Sustained deep emotional roots
    bassGrooveRhythm: [6, 14],
    chordRhythm: [0, 4, 8, 12], // Lush piano/felt chords
    pluckRhythm: [2, 6, 10, 14],
    leadRhythm: [0, 3, 6, 8, 11, 14],
    arpRhythm: [1, 3, 5, 7, 9, 11, 13, 15],
    soundDesign: {
      bassOsc: "sine",
      bassEnv: { attack: 0.05, decay: 0.5, sustain: 0.8, release: 1.0 },
      leadOsc: "sine",
      leadEnv: { attack: 0.08, decay: 0.4, sustain: 0.7, release: 1.2 },
      pluckOsc: "triangle",
      pluckEnv: { attack: 0.01, decay: 0.25, sustain: 0.1, release: 0.5 }
    }
  },

  // -------------------------------------------------------------
  // 3. POP + TENSE (122 BPM, D Minor - Driving suspense & pulse)
  // -------------------------------------------------------------
  "Pop_Tense": {
    key: "D Minor",
    tempo: 122,
    chords: [
      "D3,A3,D4,F4",     // Dm
      "Bb2,F3,Bb3,D4",   // Bb
      "G2,D3,G3,Bb3",    // Gm
      "A2,E3,A3,C#4"     // A (Dominant tension)
    ],
    rootNotes: ["D2", "Bb1", "G1", "A1"],
    fifthNotes: ["A2", "F2", "D2", "E2"],
    octaveNotes: ["D3", "Bb2", "G2", "A2"],
    leadNotes: [
      ["F4", "E4", "D4", "F4"],
      ["D4", "F4", "Bb4", "A4"],
      ["G4", "Bb4", "D5", "C#5"],
      ["E5", "C#5", "A4", "G4"]
    ],
    arpNotes: [
      ["D5", "F5", "A5", "D6"],
      ["D5", "F5", "Bb5", "D6"],
      ["D5", "G5", "Bb5", "D6"],
      ["C#5", "E5", "A5", "C#6"]
    ],
    kickRhythm: [0, 4, 8, 12], // Heavy stomp kick
    snareRhythm: [4, 12],
    hatRhythm: [0, 2, 4, 6, 8, 10, 12, 14],
    percRhythm: [3, 7, 11, 15],
    bassRhythm: [0, 2, 4, 6, 8, 10, 12, 14], // Relentless 8th driving bass
    bassGrooveRhythm: [1, 3, 5, 7, 9, 11, 13, 15],
    chordRhythm: [0, 4, 8, 12],
    pluckRhythm: [0, 3, 6, 8, 11, 14], // Dramatic clockwork pulse
    leadRhythm: [0, 2, 4, 7, 8, 10, 12, 15],
    arpRhythm: [0, 2, 4, 6, 8, 10, 12, 14],
    soundDesign: {
      bassOsc: "sawtooth",
      bassEnv: { attack: 0.005, decay: 0.18, sustain: 0.2, release: 0.3 },
      leadOsc: "sawtooth",
      leadEnv: { attack: 0.01, decay: 0.25, sustain: 0.5, release: 0.6 },
      pluckOsc: "square",
      pluckEnv: { attack: 0.002, decay: 0.1, sustain: 0.0, release: 0.1 }
    }
  },

  // -------------------------------------------------------------
  // 4. POP + CHILL (102 BPM, F Major - Sunny, breezy acoustic pop)
  // -------------------------------------------------------------
  "Pop_Chill": {
    key: "F Major",
    tempo: 102,
    chords: [
      "F2,C3,E3,A3",     // Fmaj7
      "D3,A3,C4,F4",     // Dm7
      "G2,D3,F3,Bb3",    // Gm7
      "C3,G3,Bb3,E4"     // C7
    ],
    rootNotes: ["F1", "D2", "G1", "C2"],
    fifthNotes: ["C2", "A2", "D2", "G2"],
    octaveNotes: ["F2", "D3", "G2", "C3"],
    leadNotes: [
      ["A4", "C5", "D5", "C5"],
      ["F4", "A4", "C5", "A4"],
      ["G4", "Bb4", "D5", "Bb4"],
      ["E4", "G4", "C5", "E5"]
    ],
    arpNotes: [
      ["A4", "C5", "E5", "A5"],
      ["F4", "A4", "C5", "F5"],
      ["G4", "Bb4", "D5", "G5"],
      ["G4", "C5", "E5", "G5"]
    ],
    kickRhythm: [0, 6, 8, 14],
    snareRhythm: [4, 12],
    hatRhythm: [2, 4, 6, 10, 12, 14],
    percRhythm: [8, 15],
    bassRhythm: [0, 3, 6, 8, 11, 14], // Laid back walking bass
    bassGrooveRhythm: [3, 7, 11, 15],
    chordRhythm: [2, 6, 10, 14], // Sweet offbeat comping
    pluckRhythm: [0, 4, 8, 12],
    leadRhythm: [0, 3, 6, 8, 10, 14],
    arpRhythm: [1, 3, 5, 7, 9, 11, 13, 15],
    soundDesign: {
      bassOsc: "triangle",
      bassEnv: { attack: 0.02, decay: 0.35, sustain: 0.4, release: 0.6 },
      leadOsc: "sine",
      leadEnv: { attack: 0.05, decay: 0.3, sustain: 0.6, release: 1.0 },
      pluckOsc: "triangle",
      pluckEnv: { attack: 0.01, decay: 0.18, sustain: 0.05, release: 0.3 }
    }
  },

  // -------------------------------------------------------------
  // 5. ELECTRONIC + HAPPY (126 BPM, F Major - Euphoric Festival House)
  // -------------------------------------------------------------
  "Electronic_Happy": {
    key: "F Major",
    tempo: 126,
    chords: [
      "F3,A3,C4,F4",     // IV (F)
      "C3,G3,C4,E4",     // I (C)
      "D3,F3,A3,D4",     // vi (Dm)
      "Bb2,F3,Bb3,D4"    // IV (Bb)
    ],
    rootNotes: ["F1", "C2", "D2", "Bb1"],
    fifthNotes: ["C2", "G2", "A2", "F2"],
    octaveNotes: ["F2", "C3", "D3", "Bb2"],
    leadNotes: [
      ["A4", "C5", "F5", "A5"],
      ["G4", "C5", "E5", "G5"],
      ["F4", "A4", "D5", "F5"],
      ["F4", "Bb4", "D5", "F5"]
    ],
    arpNotes: [
      ["F5", "A5", "C6", "F6"],
      ["E5", "G5", "C6", "E6"],
      ["D5", "F5", "A5", "D6"],
      ["D5", "F5", "Bb5", "D6"]
    ],
    kickRhythm: [0, 4, 8, 12], // Powerful 4-on-the-floor
    snareRhythm: [4, 12],      // Big 909 Snare & Clap
    hatRhythm: [2, 6, 10, 14], // Crisp open-style offbeat 909 hats
    percRhythm: [0, 2, 4, 6, 8, 10, 12, 14],
    bassRhythm: [2, 6, 10, 14], // Classic House offbeat pumping bass!
    bassGrooveRhythm: [1, 3, 5, 7, 9, 11, 13, 15],
    chordRhythm: [0, 3, 6, 8, 11, 14], // Syncopated piano house stabs
    pluckRhythm: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // Rolling 16th EDM arp
    leadRhythm: [0, 2, 4, 6, 8, 10, 12, 14],
    arpRhythm: [1, 3, 5, 7, 9, 11, 13, 15],
    soundDesign: {
      bassOsc: "square",
      bassEnv: { attack: 0.005, decay: 0.2, sustain: 0.1, release: 0.25 },
      leadOsc: "sawtooth",
      leadEnv: { attack: 0.02, decay: 0.25, sustain: 0.7, release: 0.9 },
      pluckOsc: "sawtooth",
      pluckEnv: { attack: 0.002, decay: 0.1, sustain: 0.0, release: 0.15 }
    }
  },

  // -------------------------------------------------------------
  // 6. ELECTRONIC + SAD (122 BPM, E Minor - Melodic Techno / Future Bass)
  // -------------------------------------------------------------
  "Electronic_Sad": {
    key: "E Minor",
    tempo: 122,
    chords: [
      "E3,G3,B3,D4",     // Em7
      "C3,G3,B3,E4",     // Cmaj7
      "G2,D3,G3,B3",     // G
      "D3,A3,D4,F#4"     // D
    ],
    rootNotes: ["E1", "C2", "G1", "D2"],
    fifthNotes: ["B1", "G2", "D2", "A2"],
    octaveNotes: ["E2", "C3", "G2", "D3"],
    leadNotes: [
      ["B4", "G4", "E4", "D4"],
      ["E5", "D5", "B4", "G4"],
      ["D5", "B4", "G4", "E4"],
      ["F#5", "D5", "A4", "F#4"]
    ],
    arpNotes: [
      ["E5", "G5", "B5", "E6"],
      ["E5", "G5", "C6", "E6"],
      ["D5", "G5", "B5", "D6"],
      ["D5", "F#5", "A5", "D6"]
    ],
    kickRhythm: [0, 4, 8, 12],
    snareRhythm: [4, 12],
    hatRhythm: [0, 2, 4, 6, 8, 10, 12, 14],
    percRhythm: [7, 15],
    bassRhythm: [0, 3, 6, 8, 11, 14], // Reese sidechain bass
    bassGrooveRhythm: [4, 12],
    chordRhythm: [0, 4, 8, 12], // Deep lush supersaw pads
    pluckRhythm: [2, 5, 7, 10, 13, 15],
    leadRhythm: [0, 3, 6, 8, 11, 14],
    arpRhythm: [1, 3, 5, 7, 9, 11, 13, 15],
    soundDesign: {
      bassOsc: "sawtooth",
      bassEnv: { attack: 0.04, decay: 0.4, sustain: 0.6, release: 0.8 },
      leadOsc: "triangle",
      leadEnv: { attack: 0.05, decay: 0.3, sustain: 0.5, release: 1.1 },
      pluckOsc: "sine",
      pluckEnv: { attack: 0.005, decay: 0.18, sustain: 0.05, release: 0.3 }
    }
  },

  // -------------------------------------------------------------
  // 7. ELECTRONIC + TENSE (130 BPM, F# Minor - Cyberpunk / Darkwave)
  // -------------------------------------------------------------
  "Electronic_Tense": {
    key: "F# Minor",
    tempo: 130,
    chords: [
      "F#3,C#4,F#4,A4",  // F#m
      "E3,B3,E4,G#4",    // E
      "D3,A3,D4,F#4",    // D
      "C#3,G#3,C#4,E4"   // C#m
    ],
    rootNotes: ["F#1", "E1", "D1", "C#1"],
    fifthNotes: ["C#2", "B1", "A1", "G#1"],
    octaveNotes: ["F#2", "E2", "D2", "C#2"],
    leadNotes: [
      ["C#5", "A4", "G#4", "F#4"],
      ["B4", "G#4", "E4", "F#4"],
      ["A4", "F#4", "D4", "E4"],
      ["G#4", "E4", "C#4", "G#4"]
    ],
    arpNotes: [
      ["F#5", "A5", "C#6", "F#6"],
      ["E5", "G#5", "B5", "E6"],
      ["D5", "F#5", "A5", "D6"],
      ["C#5", "E5", "G#5", "C#6"]
    ],
    kickRhythm: [0, 4, 8, 12],
    snareRhythm: [4, 12],
    hatRhythm: [1, 3, 5, 7, 9, 11, 13, 15], // 16th rolling hats
    percRhythm: [2, 6, 10, 14],
    bassRhythm: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // Rolling 16th Cyberpunk Bassline!
    bassGrooveRhythm: [0, 3, 6, 8, 11, 14],
    chordRhythm: [0, 4, 8, 12],
    pluckRhythm: [0, 2, 4, 6, 8, 10, 12, 14],
    leadRhythm: [0, 2, 4, 7, 8, 10, 12, 15],
    arpRhythm: [0, 2, 4, 6, 8, 10, 12, 14],
    soundDesign: {
      bassOsc: "sawtooth",
      bassEnv: { attack: 0.002, decay: 0.12, sustain: 0.15, release: 0.2 },
      leadOsc: "sawtooth",
      leadEnv: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.5 },
      pluckOsc: "square",
      pluckEnv: { attack: 0.001, decay: 0.08, sustain: 0.0, release: 0.1 }
    }
  },

  // -------------------------------------------------------------
  // 8. ELECTRONIC + CHILL (116 BPM, A Minor / D Dorian - Deep House)
  // -------------------------------------------------------------
  "Electronic_Chill": {
    key: "A Minor",
    tempo: 116,
    chords: [
      "A2,E3,G3,B3,C4",  // Am9
      "D3,A3,C4,F4",     // Dm7
      "E3,B3,D4,G4",     // Em7
      "A2,E3,G3,C4"      // Am7
    ],
    rootNotes: ["A1", "D2", "E1", "A1"],
    fifthNotes: ["E2", "A2", "B1", "E2"],
    octaveNotes: ["A2", "D3", "E2", "A2"],
    leadNotes: [
      ["E4", "G4", "A4", "B4"],
      ["F4", "A4", "C5", "D5"],
      ["G4", "B4", "D5", "E5"],
      ["C5", "B4", "A4", "E4"]
    ],
    arpNotes: [
      ["E5", "G5", "B5", "C6"],
      ["F5", "A5", "C6", "F6"],
      ["G5", "B5", "D6", "G6"],
      ["E5", "A5", "C6", "E6"]
    ],
    kickRhythm: [0, 4, 8, 12],
    snareRhythm: [4, 12],
    hatRhythm: [2, 6, 10, 14],
    percRhythm: [3, 7, 11, 15],
    bassRhythm: [0, 3, 6, 8, 11, 14], // Deep House bouncy sine bass
    bassGrooveRhythm: [2, 6, 10, 14],
    chordRhythm: [0, 4, 8, 12], // Warm Rhodes / Filtered House Chords
    pluckRhythm: [3, 7, 11, 15],
    leadRhythm: [0, 3, 6, 8, 11, 14],
    arpRhythm: [1, 3, 5, 7, 9, 11, 13, 15],
    soundDesign: {
      bassOsc: "triangle",
      bassEnv: { attack: 0.01, decay: 0.3, sustain: 0.3, release: 0.5 },
      leadOsc: "sine",
      leadEnv: { attack: 0.06, decay: 0.35, sustain: 0.6, release: 1.0 },
      pluckOsc: "triangle",
      pluckEnv: { attack: 0.005, decay: 0.2, sustain: 0.05, release: 0.3 }
    }
  },

  // -------------------------------------------------------------
  // 9. HIP HOP + HAPPY (94 BPM, G Major - Funky West Coast Bounce)
  // -------------------------------------------------------------
  "Hip Hop_Happy": {
    key: "G Major",
    tempo: 94,
    chords: [
      "G2,D3,F#3,B3",    // Gmaj7
      "C3,G3,B3,E4",     // Cmaj7
      "A2,E3,G3,C4",     // Am7
      "D3,A3,C4,F#4"     // D7
    ],
    rootNotes: ["G1", "C2", "A1", "D2"],
    fifthNotes: ["D2", "G2", "E2", "A2"],
    octaveNotes: ["G2", "C3", "A2", "D3"],
    leadNotes: [
      ["B4", "D5", "E5", "G5"], // High G-Funk Whistle Lead!
      ["E5", "G5", "A5", "B5"],
      ["C5", "E5", "G5", "A5"],
      ["A5", "F#5", "D5", "B4"]
    ],
    arpNotes: [
      ["G5", "B5", "D6", "G6"],
      ["G5", "C6", "E6", "G6"],
      ["A5", "C6", "E6", "A6"],
      ["F#5", "A5", "D6", "F#6"]
    ],
    kickRhythm: [0, 6, 8, 10], // Funky swing boom-bap kick
    snareRhythm: [4, 12],
    hatRhythm: [0, 2, 4, 6, 8, 10, 12, 14],
    percRhythm: [7, 15],
    bassRhythm: [0, 6, 8, 10, 14], // Deep sliding 808/Moog bass
    bassGrooveRhythm: [3, 7, 11, 15],
    chordRhythm: [2, 5, 10, 13], // Swung funky piano/organ stabs
    pluckRhythm: [0, 4, 8, 12],
    leadRhythm: [0, 3, 6, 8, 11, 14],
    arpRhythm: [1, 3, 5, 7, 9, 11, 13, 15],
    soundDesign: {
      bassOsc: "sine",
      bassEnv: { attack: 0.02, decay: 0.4, sustain: 0.7, release: 0.8 },
      leadOsc: "sine",
      leadEnv: { attack: 0.05, decay: 0.3, sustain: 0.8, release: 1.2 }, // Classic Portamento vibe
      pluckOsc: "triangle",
      pluckEnv: { attack: 0.005, decay: 0.15, sustain: 0.05, release: 0.25 }
    }
  },

  // -------------------------------------------------------------
  // 10. HIP HOP + SAD (82 BPM, C Minor - Melodic Emo Trap / Lo-Fi)
  // -------------------------------------------------------------
  "Hip Hop_Sad": {
    key: "C Minor",
    tempo: 82,
    chords: [
      "C3,G3,Bb3,Eb4",   // Cm7
      "Ab2,Eb3,G3,C4",   // Abmaj7
      "F2,C3,Eb3,Ab3",   // Fm7
      "G2,D3,F3,Bb3"     // Gm7
    ],
    rootNotes: ["C2", "Ab1", "F1", "G1"],
    fifthNotes: ["G2", "Eb2", "C2", "D2"],
    octaveNotes: ["C3", "Ab2", "F2", "G2"],
    leadNotes: [
      ["Eb4", "D4", "C4", "G4"], // Melodic crying flute motif
      ["C5", "Bb4", "Ab4", "G4"],
      ["Ab4", "G4", "F4", "Eb4"],
      ["D4", "Eb4", "F4", "G4"]
    ],
    arpNotes: [
      ["Eb5", "G5", "Bb5", "Eb6"],
      ["Eb5", "Ab5", "C6", "Eb6"],
      ["Eb5", "F5", "Ab5", "C6"],
      ["D5", "G5", "Bb5", "D6"]
    ],
    kickRhythm: [0, 7, 10], // Modern trap kick bounce
    snareRhythm: [4, 12],
    hatRhythm: [0, 2, 4, 6, 8, 10, 12, 14],
    percRhythm: [11],
    bassRhythm: [0, 7, 10], // Heavy Sub 808
    bassGrooveRhythm: [4, 12, 15],
    chordRhythm: [0, 4, 8, 12], // Dusty Lo-Fi felt piano
    pluckRhythm: [2, 6, 10, 14],
    leadRhythm: [0, 3, 6, 8, 11, 14],
    arpRhythm: [1, 3, 5, 7, 9, 11, 13, 15],
    soundDesign: {
      bassOsc: "sine",
      bassEnv: { attack: 0.01, decay: 0.6, sustain: 0.8, release: 0.9 },
      leadOsc: "triangle",
      leadEnv: { attack: 0.08, decay: 0.4, sustain: 0.5, release: 1.0 },
      pluckOsc: "triangle",
      pluckEnv: { attack: 0.01, decay: 0.22, sustain: 0.05, release: 0.4 }
    }
  },

  // -------------------------------------------------------------
  // 11. HIP HOP + TENSE (88 BPM, D Minor - Dark Trap / Drill 808)
  // -------------------------------------------------------------
  "Hip Hop_Tense": {
    key: "D Minor",
    tempo: 88,
    chords: [
      "D3,A3,D4,F4",     // Dm
      "Eb3,Bb3,Eb4,G4",  // Eb (Dark Phrygian Tension)
      "D3,A3,D4,F4",     // Dm
      "G2,D3,G3,Bb3"     // Gm
    ],
    rootNotes: ["D1", "Eb1", "D1", "G1"],
    fifthNotes: ["A1", "Bb1", "A1", "D2"],
    octaveNotes: ["D2", "Eb2", "D2", "G2"],
    leadNotes: [
      ["F4", "Eb4", "D4", "A4"],
      ["G4", "F4", "Eb4", "D4"],
      ["F4", "Eb4", "D4", "C4"],
      ["D5", "C5", "Bb4", "A4"]
    ],
    arpNotes: [
      ["D5", "F5", "A5", "D6"],
      ["Eb5", "G5", "Bb5", "Eb6"],
      ["D5", "F5", "A5", "D6"],
      ["D5", "G5", "Bb5", "D6"]
    ],
    kickRhythm: [0, 6, 8, 11], // Drill style sliding kick
    snareRhythm: [4, 12],
    hatRhythm: [0, 2, 4, 6, 8, 10, 12, 14],
    percRhythm: [3, 9, 15],
    bassRhythm: [0, 6, 8, 11], // Grimy 808 Slides
    bassGrooveRhythm: [2, 5, 10, 14],
    chordRhythm: [0, 4, 8, 12], // Dark cinematic brass & choir stabs
    pluckRhythm: [2, 5, 7, 10, 13, 15],
    leadRhythm: [0, 2, 4, 7, 8, 10, 12, 15],
    arpRhythm: [0, 2, 4, 6, 8, 10, 12, 14],
    soundDesign: {
      bassOsc: "sawtooth",
      bassEnv: { attack: 0.01, decay: 0.35, sustain: 0.5, release: 0.6 },
      leadOsc: "sawtooth",
      leadEnv: { attack: 0.02, decay: 0.25, sustain: 0.4, release: 0.6 },
      pluckOsc: "square",
      pluckEnv: { attack: 0.002, decay: 0.1, sustain: 0.0, release: 0.1 }
    }
  },

  // -------------------------------------------------------------
  // 12. HIP HOP + CHILL (78 BPM, Eb Major - Neo-Soul Lo-Fi Beats)
  // -------------------------------------------------------------
  "Hip Hop_Chill": {
    key: "Eb Major",
    tempo: 78,
    chords: [
      "Eb2,Bb2,D3,G3,Bb3", // Ebmaj9
      "C3,G3,Bb3,D4,Eb4",  // Cm9
      "F2,C3,Eb3,Ab3,C4",  // Fm9
      "Bb2,Ab3,C4,D4,G4"   // Bb13 (Rich jazz 2-5-1 resolution)
    ],
    rootNotes: ["Eb1", "C2", "F1", "Bb1"],
    fifthNotes: ["Bb1", "G2", "C2", "F2"],
    octaveNotes: ["Eb2", "C3", "F2", "Bb2"],
    leadNotes: [
      ["G4", "Bb4", "C5", "Eb5"], // Warm mellow sax/flute tone
      ["Eb5", "D5", "Bb4", "G4"],
      ["Ab4", "C5", "Eb5", "F5"],
      ["G5", "F5", "D5", "Bb4"]
    ],
    arpNotes: [
      ["G5", "Bb5", "D6", "G6"],
      ["G5", "C6", "Eb6", "G6"],
      ["Ab5", "C6", "Eb6", "Ab6"],
      ["F5", "Ab5", "D6", "F6"]
    ],
    kickRhythm: [0, 7, 10], // Unhurried dusty boom-bap kick
    snareRhythm: [4, 12],
    hatRhythm: [2, 4, 6, 10, 12, 14],
    percRhythm: [8, 15],
    bassRhythm: [0, 3, 7, 10, 14], // Warm electric jazz bass
    bassGrooveRhythm: [3, 8, 13],
    chordRhythm: [0, 4, 8, 12], // Lush Fender Rhodes EP chords
    pluckRhythm: [2, 6, 10, 14],
    leadRhythm: [0, 3, 6, 8, 10, 14],
    arpRhythm: [1, 3, 5, 7, 9, 11, 13, 15],
    soundDesign: {
      bassOsc: "triangle",
      bassEnv: { attack: 0.03, decay: 0.45, sustain: 0.5, release: 0.8 },
      leadOsc: "sine",
      leadEnv: { attack: 0.08, decay: 0.4, sustain: 0.7, release: 1.2 },
      pluckOsc: "triangle",
      pluckEnv: { attack: 0.01, decay: 0.25, sustain: 0.05, release: 0.4 }
    }
  }
};

export function generateOfflineKit(vibe?: string, emotion?: string): KitConfig {
  const actualVibe = (!vibe || vibe === 'Vibe' || vibe === 'אווירה') ? 'Pop' : vibe;
  const actualEmotion = (!emotion || emotion === 'Emotion' || emotion === 'רגש') ? 'Happy' : emotion;

  // Normalize Hebrew to English template keys
  let normVibe = actualVibe;
  if (normVibe === 'פופ') normVibe = 'Pop';
  else if (normVibe === 'אלקטרוני') normVibe = 'Electronic';
  else if (normVibe === 'היפ הופ') normVibe = 'Hip Hop';

  let normEmotion = actualEmotion;
  if (normEmotion === 'שמח') normEmotion = 'Happy';
  else if (normEmotion === 'עצוב') normEmotion = 'Sad';
  else if (normEmotion === 'מותח') normEmotion = 'Tense';
  else if (normEmotion === 'רגוע') normEmotion = 'Chill';

  const templateKey = `${normVibe}_${normEmotion}`;
  const tpl = TEMPLATES[templateKey] || TEMPLATES["Pop_Happy"];

  // 16-Step sequence builders
  const kickSeq = new Array(16).fill(null);
  const snareSeq = new Array(16).fill(null);
  const subBassSeq = new Array(16).fill(null);
  const bassGrooveSeq = new Array(16).fill(null);
  const chordSeq = new Array(16).fill(null);
  const pluckSeq = new Array(16).fill(null);
  const leadSeq = new Array(16).fill(null);
  const arpSeq = new Array(16).fill(null);

  // 1. Kick Sequence
  tpl.kickRhythm.forEach(step => {
    kickSeq[step] = "kick";
  });

  // 2. Snare & Hats Sequence
  tpl.snareRhythm.forEach(step => {
    snareSeq[step] = "snare";
  });
  tpl.hatRhythm.forEach(step => {
    if (!snareSeq[step]) {
      snareSeq[step] = "hihat";
    }
  });
  if (tpl.percRhythm) {
    tpl.percRhythm.forEach(step => {
      if (!snareSeq[step]) snareSeq[step] = "perc";
    });
  }

  // 3 & 4. Bass Sequences (Synchronized with 4-chord progression roots)
  for (let bar = 0; bar < 4; bar++) {
    const root = tpl.rootNotes[bar % tpl.rootNotes.length];
    const fifth = tpl.fifthNotes[bar % tpl.fifthNotes.length];
    const oct = tpl.octaveNotes[bar % tpl.octaveNotes.length];
    const startStep = bar * 4;

    tpl.bassRhythm.forEach(step => {
      if (step >= startStep && step < startStep + 4) {
        subBassSeq[step] = root;
      }
    });

    tpl.bassGrooveRhythm.forEach(step => {
      if (step >= startStep && step < startStep + 4) {
        // Melodic bass groove variation
        bassGrooveSeq[step] = (step % 2 === 0) ? fifth : oct;
      }
    });
  }

  // 5. Main Harmony Chords Sequence (Full lush polyphonic chords)
  for (let bar = 0; bar < 4; bar++) {
    const chord = tpl.chords[bar % tpl.chords.length];
    const startStep = bar * 4;
    tpl.chordRhythm.forEach(step => {
      if (step >= startStep && step < startStep + 4) {
        chordSeq[step] = chord;
      }
    });
  }

  // 6. Rhythmic Plucks / Chops Sequence
  for (let bar = 0; bar < 4; bar++) {
    const chord = tpl.chords[bar % tpl.chords.length];
    const startStep = bar * 4;
    tpl.pluckRhythm.forEach(step => {
      if (step >= startStep && step < startStep + 4) {
        pluckSeq[step] = chord;
      }
    });
  }

  // 7. Main Lead Hook Sequence
  for (let bar = 0; bar < 4; bar++) {
    const motif = tpl.leadNotes[bar % tpl.leadNotes.length];
    const startStep = bar * 4;
    let noteIdx = 0;
    tpl.leadRhythm.forEach(step => {
      if (step >= startStep && step < startStep + 4) {
        leadSeq[step] = motif[noteIdx % motif.length];
        noteIdx++;
      }
    });
  }

  // 8. High Arpeggio / Ear-Candy Sparkle
  for (let bar = 0; bar < 4; bar++) {
    const arpNotes = tpl.arpNotes[bar % tpl.arpNotes.length];
    const startStep = bar * 4;
    let noteIdx = 0;
    tpl.arpRhythm.forEach(step => {
      if (step >= startStep && step < startStep + 4) {
        arpSeq[step] = arpNotes[noteIdx % arpNotes.length];
        noteIdx++;
      }
    });
  }

  const names = [
    "Kick & Beat",
    "Snare & Hats",
    "Sub Bass",
    "Bass Groove",
    "Lush Chords",
    "Rhythm Pluck",
    "Lead Hook",
    "Top Sparkle"
  ];

  const types = [
    "drum",
    "drum",
    "bass",
    "bass",
    "chord",
    "chord",
    "lead",
    "lead"
  ];

  const sequences = [
    kickSeq,
    snareSeq,
    subBassSeq,
    bassGrooveSeq,
    chordSeq,
    pluckSeq,
    leadSeq,
    arpSeq
  ];

  const pads: PadConfig[] = [];

  for (let i = 0; i < 8; i++) {
    let synthParams: any = {};

    if (types[i] === 'drum') {
      synthParams = {
        instrumentType: 'DrumKit',
        volume: i === 0 ? 0 : -3
      };
    } else if (types[i] === 'bass') {
      synthParams = {
        instrumentType: 'Synth',
        oscillatorType: tpl.soundDesign.bassOsc,
        envelope: tpl.soundDesign.bassEnv,
        volume: i === 2 ? -2 : -4
      };
    } else if (types[i] === 'chord') {
      synthParams = {
        instrumentType: 'Synth',
        oscillatorType: i === 4 ? 'triangle' : tpl.soundDesign.pluckOsc,
        envelope: i === 4 
          ? { attack: 0.04, decay: 0.4, sustain: 0.7, release: 1.2 }
          : tpl.soundDesign.pluckEnv,
        volume: i === 4 ? -8 : -10
      };
    } else if (types[i] === 'lead') {
      synthParams = {
        instrumentType: 'Synth',
        oscillatorType: i === 6 ? tpl.soundDesign.leadOsc : 'triangle',
        envelope: i === 6 
          ? tpl.soundDesign.leadEnv 
          : { attack: 0.005, decay: 0.15, sustain: 0.2, release: 0.4 },
        volume: i === 6 ? -6 : -8
      };
    }

    pads.push({
      id: i + 1,
      name: names[i],
      type: types[i],
      synthParams,
      sequence: sequences[i]
    });
  }

  return {
    key: tpl.key,
    tempo: tpl.tempo,
    pads
  };
}
