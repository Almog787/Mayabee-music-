import { KitConfig, PadConfig } from './audioEngine';

const SCALES: Record<string, string[]> = {
  "C Major": ["C", "D", "E", "F", "G", "A", "B"],
  "C Minor": ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
  "D Major": ["D", "E", "F#", "G", "A", "B", "C#"],
  "D Minor": ["D", "E", "F", "G", "A", "Bb", "C"],
  "E Minor": ["E", "F#", "G", "A", "B", "C", "D"],
  "F Major": ["F", "G", "A", "Bb", "C", "D", "E"],
  "F# Minor": ["F#", "G#", "A", "B", "C#", "D", "E"],
  "G Major": ["G", "A", "B", "C", "D", "E", "F#"],
  "G Minor": ["G", "A", "Bb", "C", "D", "Eb", "F"],
  "A Major": ["A", "B", "C#", "D", "E", "F#", "G#"],
  "A Minor": ["A", "B", "C", "D", "E", "F", "G"],
  "Bb Major": ["Bb", "C", "D", "Eb", "F", "G", "A"],
  "B Minor": ["B", "C#", "D", "E", "F#", "G", "A"]
};

export function generateOfflineKit(vibe: string, musicKey: string): KitConfig {
  const actualVibe = (!vibe || vibe === 'Vibe') ? 'Latin Pop Hit' : vibe;
  
  if (actualVibe === 'Latin Pop Hit') {
    const STEPS = 128; // 32 beats / 8 bars full chorus
    const kickSeq = new Array(STEPS).fill(null);
    const snareSeq = new Array(STEPS).fill(null);
    const bassSeq1 = new Array(STEPS).fill(null);
    const bassSeq2 = new Array(STEPS).fill(null);
    const chordSeq1 = new Array(STEPS).fill(null);
    const chordSeq2 = new Array(STEPS).fill(null);
    const leadSeq1 = new Array(STEPS).fill(null);
    const leadSeq2 = new Array(STEPS).fill(null);

    // 1. KICK - Merengue pop 4-on-the-floor
    for (let i = 0; i < STEPS; i += 4) kickSeq[i] = "C1";
    
    // 2. SNARE / TAMBORA - Driving syncopated rhythm
    for (let i = 0; i < STEPS; i += 4) {
      snareSeq[i + 2] = "E2"; // Upbeat
      snareSeq[i + 3] = "C2"; // Ghost note
    }

    // 3 & 4. BASS & CHORDS - Tumbao progression: F#m -> E -> Bm -> D
    const progression = [
      { bass: "F#2", bassOct: "F#3", ch1: "A3", ch2: "C#4" }, // Bar 1, 5: F#m
      { bass: "E2",  bassOct: "E3",  ch1: "G#3", ch2: "B3" }, // Bar 2, 6: E
      { bass: "B1",  bassOct: "B2",  ch1: "F#3", ch2: "B3" }, // Bar 3, 7: Bm
      { bass: "D2",  bassOct: "D3",  ch1: "F#3", ch2: "A3" }  // Bar 4, 8: D
    ];

    for (let bar = 0; bar < 8; bar++) {
      const offset = bar * 16;
      const p = progression[bar % 4];
      
      // Bass Tumbao
      bassSeq1[offset + 2] = p.bass; bassSeq1[offset + 4] = p.bass;
      bassSeq1[offset + 6] = p.bass; bassSeq1[offset + 10] = p.bass;
      bassSeq1[offset + 12] = p.bass; bassSeq1[offset + 14] = p.bass;
      bassSeq2[offset + 6] = p.bassOct; bassSeq2[offset + 14] = p.bassOct; // Octave pops

      // Chord stabs
      chordSeq1[offset + 2] = p.ch1; chordSeq1[offset + 6] = p.ch1;
      chordSeq1[offset + 10] = p.ch1; chordSeq1[offset + 14] = p.ch1;
      chordSeq2[offset + 2] = p.ch2; chordSeq2[offset + 6] = p.ch2;
      chordSeq2[offset + 10] = p.ch2; chordSeq2[offset + 14] = p.ch2;
    }

    // 5. FULL MELODY - 8 Bar Chorus Hook
    const setMelody = (step: number, note1: string, note2: string) => {
      leadSeq1[step] = note1; leadSeq2[step] = note2;
    };

    // Bar 1: "Si an-tes te hu-bie-ra co-"
    setMelody(0, "F#5", "C#5"); setMelody(2, "F#5", "C#5"); setMelody(4, "F#5", "C#5"); setMelody(6, "F#5", "C#5");
    setMelody(8, "E5", "B4"); setMelody(10, "C#5", "A4"); setMelody(12, "B4", "G#4"); setMelody(14, "A4", "F#4");
    // Bar 2: "-no-ci-do ... Se-gu-ra-"
    setMelody(16, "B4", "G#4"); setMelody(18, "C#5", "A4"); setMelody(20, "F#4", "C#4");
    setMelody(24, "E5", "C#5"); setMelody(26, "E5", "C#5"); setMelody(28, "E5", "C#5"); setMelody(30, "E5", "C#5");
    // Bar 3: "-men-te es-ta-rí-as bai-lan-do"
    setMelody(32, "E5", "C#5"); setMelody(34, "D5", "B4"); setMelody(36, "B4", "F#4"); setMelody(38, "B4", "F#4");
    setMelody(40, "D5", "B4"); setMelody(42, "C#5", "A4"); setMelody(44, "B4", "G#4"); setMelody(46, "A4", "F#4");
    // Bar 4: "con-mi-go ... No co-mo a-"
    setMelody(48, "A4", "F#4"); setMelody(50, "F#4", "D4"); setMelody(52, "F#4", "D4");
    setMelody(58, "A4", "F#4"); setMelody(60, "B4", "G#4"); setMelody(62, "C#5", "A4");
    // Bar 5: "-mi-gos ... si-no"
    setMelody(64, "C#5", "A4"); setMelody(66, "A4", "F#4");
    setMelody(72, "C#5", "A4"); setMelody(74, "C#5", "A4"); setMelody(76, "C#5", "A4"); setMelody(78, "B4", "G#4");
    // Bar 6: "co-mo o-tra co-sa"
    setMelody(80, "A4", "F#4"); setMelody(82, "B4", "G#4"); setMelody(84, "F#4", "C#4");
    setMelody(88, "A4", "F#4"); setMelody(90, "G#4", "E4"); setMelody(92, "F#4", "C#4"); // fill
    // Bar 7: Instrumental/Vocal Chops
    setMelody(96, "D5", "B4"); setMelody(98, "C#5", "A4"); setMelody(100, "B4", "F#4");
    setMelody(104, "B4", "F#4"); setMelody(106, "D5", "B4"); setMelody(108, "C#5", "A4"); setMelody(110, "B4", "G#4");
    // Bar 8: Resolve
    setMelody(112, "A4", "F#4"); setMelody(114, "F#4", "D4"); setMelody(116, "F#4", "D4");

    return {
      key: "F# Minor",
      tempo: 128,
      pads: [
        { id: 1, name: "Acoustic Kick", type: 'drum', synthParams: { instrumentType: 'Sampler', samplerUrl: 'drums', volume: -2 }, sequence: kickSeq },
        { id: 2, name: "Snare/Conga", type: 'drum', synthParams: { instrumentType: 'Sampler', samplerUrl: 'drums', volume: -8 }, sequence: snareSeq },
        { id: 3, name: "Acoustic Bass", type: 'bass', synthParams: { instrumentType: 'Sampler', samplerInstrument: 'acoustic_bass', volume: -3 }, sequence: bassSeq1 },
        { id: 4, name: "Bass Pop", type: 'bass', synthParams: { instrumentType: 'Sampler', samplerInstrument: 'electric_bass_finger', volume: -10 }, sequence: bassSeq2 },
        { id: 5, name: "Grand Piano", type: 'chord', synthParams: { instrumentType: 'Sampler', samplerInstrument: 'acoustic_grand_piano', volume: -7 }, sequence: chordSeq1 },
        { id: 6, name: "Nylon Guitar", type: 'chord', synthParams: { instrumentType: 'Sampler', samplerInstrument: 'acoustic_guitar_nylon', volume: -9 }, sequence: chordSeq2 },
        { id: 7, name: "Trumpet Melody", type: 'lead', synthParams: { instrumentType: 'Sampler', samplerInstrument: 'trumpet', volume: -1 }, sequence: leadSeq1 },
        { id: 8, name: "Flute Harmony", type: 'lead', synthParams: { instrumentType: 'Sampler', samplerInstrument: 'flute', volume: -6 }, sequence: leadSeq2 }
      ]
    };
  }

  const allKeys = Object.keys(SCALES);
  const selectedKey = (musicKey && musicKey !== 'Keys' && musicKey !== 'Random' && SCALES[musicKey]) 
    ? musicKey 
    : allKeys[Math.floor(Math.random() * allKeys.length)];
  
  const scale = SCALES[selectedKey];
  const isMinor = selectedKey.includes("Minor");
  
  // סולם פנטטוני מבטיח שהמלודיות תמיד יישמעו טוב ביחד, ללא תווים מתנגשים.
  const pentatonic = isMinor 
    ? [scale[0], scale[2], scale[3], scale[4], scale[6]] // 1, b3, 4, 5, b7
    : [scale[0], scale[1], scale[2], scale[4], scale[5]]; // 1, 2, 3, 5, 6

  const isReggaeton = actualVibe === 'Reggaeton';
  
  // טמפו יציב יותר
  let tempo = 95 + Math.floor(Math.random() * 35); // 95-130 BPM
  if (isReggaeton) {
    tempo = 90 + Math.floor(Math.random() * 15); // 90-105 BPM for Reggaeton
  }

  const pads: PadConfig[] = [];
  const padTypes = ['drum', 'drum', 'bass', 'bass', 'chord', 'chord', 'lead', 'lead'];
  
  // --- 1. תופים (Drums) ---
  // במקום אקראיות מוחלטת, נייצר מקצבים מוכרים ויציבים (ארבעה רבעים או שבירות)
  const kickSeq = new Array(16).fill(null);
  const snareSeq = new Array(16).fill(null);
  
  const isFourOnFloor = Math.random() > 0.4;
  for (let i = 0; i < 16; i++) {
    if (isReggaeton) {
      if (i % 4 === 0) kickSeq[i] = "C1"; // Kick on 1, 2, 3, 4
      if (i === 3 || i === 6 || i === 11 || i === 14) snareSeq[i] = "E2"; // Dembow Snare (Tresillo)
      if (i % 2 !== 0 && Math.random() > 0.5) snareSeq[i] = "C2"; // Hi-hats
    } else if (isFourOnFloor) {
      // מקצב House / Techno
      if (i % 4 === 0) kickSeq[i] = "C1"; // קיק כל רבע
      if (i % 8 === 4) snareSeq[i] = "E2"; // סנר על ה-2 וה-4
      if (i % 2 !== 0 && Math.random() > 0.3) snareSeq[i] = "C2"; // היי-האטס באוף-ביט
    } else {
      // מקצב Breakbeat / Hip-Hop
      if (i === 0 || i === 8 || i === 10) kickSeq[i] = "C1";
      if (i === 4 || i === 12) snareSeq[i] = "E2";
      if (i % 2 === 0 && i !== 0 && i !== 8 && i !== 10) kickSeq[i] = "C2"; // היי-האטס
    }
  }

  // --- 2. בס (Bass) ---
  // כדי שהבס ישמע טוב הוא צריך מוטיב שחוזר על עצמו כל חצי תיבה (8 צעדים) ולשבת על תו השורש
  const bassRhythm = new Array(8).fill(false);
  if (isReggaeton) {
    bassRhythm[0] = true;
    bassRhythm[3] = true;
    if (Math.random() > 0.5) bassRhythm[4] = true;
  } else {
    bassRhythm[0] = true;
    bassRhythm[3] = true;
    bassRhythm[isFourOnFloor ? 4 : 5] = true;
    if (Math.random() > 0.5) bassRhythm[6] = true;
  }

  const bassSeq1 = new Array(16).fill(null);
  const bassSeq2 = new Array(16).fill(null);
  for(let i=0; i<16; i++) {
    if (bassRhythm[i % 8]) {
      bassSeq1[i] = `${scale[0]}2`; // תו השורש של הסולם
      // הבס השני יוסיף קפיצות אוקטבה או קווינטה מדי פעם כדי לתת גרוב
      if (Math.random() > 0.6) {
        bassSeq2[i] = `${scale[0]}3`; // אוקטבה מעל
      } else if (Math.random() > 0.8) {
        bassSeq2[i] = `${scale[4]}2`; // קווינטה
      }
    }
  }

  // --- 3. אקורדים (Chords) ---
  // נשתמש בשני פדים כדי לנגן הרמוניה - פד אחד ינגן את הטרצה (התו השלישי) ופד שני את הקווינטה (החמישי)
  const chordSeq1 = new Array(16).fill(null);
  const chordSeq2 = new Array(16).fill(null);
  const chordRhythm = new Array(8).fill(false);
  
  if (isReggaeton) {
    chordRhythm[3] = true;
    chordRhythm[6] = true;
  } else {
    // מקצב אקורדים קופצני (Syncopated)
    chordRhythm[2] = true;
    chordRhythm[5] = true;
    if (Math.random() > 0.7) chordRhythm[0] = true;
  }

  for(let i=0; i<16; i++) {
    if (chordRhythm[i % 8]) {
      chordSeq1[i] = `${scale[2]}3`; // טרצה
      chordSeq2[i] = `${scale[4]}3`; // קווינטה
    }
  }

  // --- 4. מלודיה (Leads) ---
  // ניצור מוטיב של 8 צעדים ונשכפל אותו, כך זה נשמע כמו מנגינה שקל לזכור
  const leadSeq1 = new Array(16).fill(null);
  const leadSeq2 = new Array(16).fill(null);
  const leadRhythm = new Array(8).fill(false);
  
  for (let i=0; i<8; i++) {
    leadRhythm[i] = Math.random() > 0.5;
  }
  leadRhythm[0] = true; // תמיד נתחיל חזק
  if (!leadRhythm[4]) leadRhythm[4] = Math.random() > 0.5;

  // מגרילים תווים מתוך הסולם הפנטטוני בלבד עבור המוטיב
  const motifNotes = leadRhythm.map(active => 
    active ? `${pentatonic[Math.floor(Math.random() * pentatonic.length)]}4` : null
  );

  for(let i=0; i<16; i++) {
    leadSeq1[i] = motifNotes[i % 8];
    
    // ערוץ ליד שני ישמש ל"קישוטים" קטנים מדי פעם באוקטבה גבוהה
    if (i % 2 !== 0 && Math.random() > 0.8) {
      leadSeq2[i] = `${pentatonic[Math.floor(Math.random() * pentatonic.length)]}5`;
    }
  }

  // הגדרת הסינתיסייזרים והרכבת ה-Kit
  const synthTypes = ['square', 'sawtooth', 'triangle'];
  const sequences = [kickSeq, snareSeq, bassSeq1, bassSeq2, chordSeq1, chordSeq2, leadSeq1, leadSeq2];
  const names = ["Main Kick", "Snare & Hats", "Sub Bass", "Bass Groove", "Chord (3rd)", "Chord (5th)", "Main Melody", "Glitch/Arp"];

  for (let i = 0; i < 8; i++) {
    // מתאימים סוג כלי לכל תפקיד
    let instType: any = 'Sampler';
    let samplerUrl: string | undefined = undefined;
    let samplerInst: string | undefined = undefined;
    
    let vol = -6;
    if (padTypes[i] === 'drum') {
      samplerUrl = 'drums';
      vol = names[i].includes('Kick') ? -2 : -8;
    } else if (padTypes[i] === 'bass') {
      samplerInst = 'acoustic_bass';
      vol = -4;
    } else if (padTypes[i] === 'chord') {
      samplerInst = i === 4 ? 'acoustic_grand_piano' : 'acoustic_guitar_nylon';
      vol = -8;
    } else if (padTypes[i] === 'lead') {
      if (i % 2 === 0) {
        samplerInst = 'flute';
        vol = -7;
      } else {
        samplerInst = 'trumpet';
        vol = -1;
      }
    }

    pads.push({
      id: i + 1,
      name: names[i],
      type: padTypes[i],
      synthParams: { instrumentType: instType, samplerUrl: samplerUrl, samplerInstrument: samplerInst, volume: vol },
      sequence: sequences[i]
    });
  }

  return {
    key: selectedKey,
    tempo,
    pads
  };
}
