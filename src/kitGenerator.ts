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

export function generateOfflineKit(vibe: string, emotion: string): KitConfig {
  const actualVibe = (!vibe || vibe === 'Vibe' || vibe === 'אווירה') ? 'Pop' : vibe;
  const actualEmotion = (!emotion || emotion === 'Emotion' || emotion === 'רגש') ? 'Happy' : emotion;

  // Map Emotion to a Key/Scale
  // Happy/שמח -> C Major
  // Sad/עצוב -> A Minor
  // Tense/מותח -> F# Minor (or G Minor)
  // Chill/רגוע -> F Major
  let selectedKey = "C Major";
  if (actualEmotion === "Sad" || actualEmotion === "עצוב") selectedKey = "A Minor";
  else if (actualEmotion === "Tense" || actualEmotion === "מותח") selectedKey = "F# Minor";
  else if (actualEmotion === "Chill" || actualEmotion === "רגוע") selectedKey = "F Major";
  
  const scale = SCALES[selectedKey] || SCALES["C Major"];
  const isMinor = selectedKey.includes("Minor");
  
  // סולם פנטטוני מבטיח שהמלודיות תמיד יישמעו טוב ביחד, ללא תווים מתנגשים.
  const pentatonic = isMinor 
    ? [scale[0], scale[2], scale[3], scale[4], scale[6]] // 1, b3, 4, 5, b7
    : [scale[0], scale[1], scale[2], scale[4], scale[5]]; // 1, 2, 3, 5, 6

  const isPop = actualVibe === 'Pop' || actualVibe === 'פופ';
  const isElectronic = actualVibe === 'Electronic' || actualVibe === 'אלקטרוני';
  const isHipHop = actualVibe === 'Hip Hop' || actualVibe === 'היפ הופ';
  
  // טמפו יציב יותר בהתאם לאווירה ולרגש
  let tempo = 120;
  if (isPop) tempo = 110 + Math.floor(Math.random() * 15);
  if (isElectronic) tempo = 122 + Math.floor(Math.random() * 10);
  if (isHipHop) tempo = 85 + Math.floor(Math.random() * 20);

  if (actualEmotion === 'Chill' || actualEmotion === 'רגוע') tempo -= 15;
  if (actualEmotion === 'Tense' || actualEmotion === 'מותח') tempo -= 5;

  const pads: PadConfig[] = [];
  const padTypes = ['drum', 'drum', 'bass', 'bass', 'chord', 'chord', 'lead', 'lead'];
  
  // --- 1. תופים (Drums) ---
  const kickSeq = new Array(16).fill(null);
  const snareSeq = new Array(16).fill(null);
  
  const isFourOnFloor = isElectronic || (isPop && Math.random() > 0.5);
  for (let i = 0; i < 16; i++) {
    if (isPop && !isFourOnFloor) {
      // Reggaeton/Pop Dembow
      if (i % 4 === 0) kickSeq[i] = "C1"; // Kick on 1, 2, 3, 4
      if (i === 3 || i === 6 || i === 11 || i === 14) snareSeq[i] = "E2"; // Dembow Snare (Tresillo)
      if (i % 2 !== 0 && Math.random() > 0.5) snareSeq[i] = "C2"; // Hi-hats
    } else if (isFourOnFloor) {
      // מקצב House / Techno / Dance Pop
      if (i % 4 === 0) kickSeq[i] = "C1"; // קיק כל רבע
      if (i % 8 === 4) snareSeq[i] = "E2"; // סנר על ה-2 וה-4
      if (i % 2 !== 0 && Math.random() > 0.3) snareSeq[i] = "C2"; // היי-האטס באוף-ביט
    } else {
      // Hip-Hop / Breakbeat
      if (i === 0 || i === 8 || (i === 10 && actualEmotion === 'Tense')) kickSeq[i] = "C1";
      if (i === 4 || i === 12) snareSeq[i] = "E2";
      if (i % 2 === 0 && i !== 0 && i !== 8) kickSeq[i] = "C2"; // היי-האטס
      if (actualEmotion === 'Chill' && i % 4 === 2) snareSeq[i] = "C2"; // Extra relaxed hats
    }
  }

  // --- 2. בס (Bass) ---
  const bassRhythm = new Array(8).fill(false);
  if (isPop && !isFourOnFloor) {
    bassRhythm[0] = true;
    bassRhythm[3] = true;
    if (Math.random() > 0.5) bassRhythm[4] = true;
  } else if (isHipHop) {
    bassRhythm[0] = true;
    if (Math.random() > 0.5) bassRhythm[3] = true;
    bassRhythm[6] = true;
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
      if (actualEmotion !== 'Chill' && Math.random() > 0.6) {
        bassSeq2[i] = `${scale[0]}3`; // אוקטבה מעל
      } else if (actualEmotion === 'Tense' && Math.random() > 0.7) {
        bassSeq2[i] = `${scale[3]}2`; // Tense interval
      } else if (Math.random() > 0.8) {
        bassSeq2[i] = `${scale[4]}2`; // קווינטה
      }
    }
  }

  // --- 3. אקורדים (Chords) ---
  const chordSeq1 = new Array(16).fill(null);
  const chordSeq2 = new Array(16).fill(null);
  const chordRhythm = new Array(8).fill(false);
  
  if (isPop && !isFourOnFloor) {
    chordRhythm[3] = true;
    chordRhythm[6] = true;
  } else if (isElectronic) {
    chordRhythm[0] = true;
    chordRhythm[4] = true;
  } else if (isHipHop && actualEmotion === 'Chill') {
    chordRhythm[0] = true; // Long held chords
  } else {
    // מקצב אקורדים קופצני (Syncopated)
    chordRhythm[2] = true;
    chordRhythm[5] = true;
    if (Math.random() > 0.7) chordRhythm[0] = true;
  }

  for(let i=0; i<16; i++) {
    if (chordRhythm[i % 8]) {
      chordSeq1[i] = `${scale[2]}3`; // טרצה
      if (actualEmotion === 'Tense') {
        chordSeq2[i] = `${scale[1]}3`; // Dissonance
      } else if (actualEmotion === 'Chill') {
        chordSeq2[i] = `${scale[6]}3`; // 7th chord feel
      } else {
        chordSeq2[i] = `${scale[4]}3`; // קווינטה
      }
    }
  }

  // --- 4. מלודיה (Leads) ---
  const leadSeq1 = new Array(16).fill(null);
  const leadSeq2 = new Array(16).fill(null);
  const leadRhythm = new Array(8).fill(false);
  
  for (let i=0; i<8; i++) {
    // Tense/Sad emotions have sparser leads, Happy has more active leads
    const chance = (actualEmotion === 'Tense' || actualEmotion === 'Sad') ? 0.3 : 0.6;
    leadRhythm[i] = Math.random() > (1 - chance);
  }
  leadRhythm[0] = true; // תמיד נתחיל חזק
  if (!leadRhythm[4]) leadRhythm[4] = Math.random() > 0.5;

  const motifNotes = leadRhythm.map(active => 
    active ? `${pentatonic[Math.floor(Math.random() * pentatonic.length)]}4` : null
  );

  for(let i=0; i<16; i++) {
    leadSeq1[i] = motifNotes[i % 8];
    if (i % 2 !== 0 && Math.random() > (actualEmotion === 'Chill' ? 0.9 : 0.8)) {
      leadSeq2[i] = `${pentatonic[Math.floor(Math.random() * pentatonic.length)]}5`;
    }
  }

  const synthTypes = ['square', 'sawtooth', 'triangle'];
  const sequences = [kickSeq, snareSeq, bassSeq1, bassSeq2, chordSeq1, chordSeq2, leadSeq1, leadSeq2];
  const names = ["Main Kick", "Snare & Hats", "Sub Bass", "Bass Groove", "Chord A", "Chord B", "Main Melody", "Accents"];

  for (let i = 0; i < 8; i++) {
    let instType: any = 'Sampler';
    let samplerUrl: string | undefined = undefined;
    let samplerInst: string | undefined = undefined;
    
    let vol = -6;
    if (padTypes[i] === 'drum') {
      samplerUrl = 'drums';
      vol = names[i].includes('Kick') ? -2 : -8;
    } else if (padTypes[i] === 'bass') {
      if (isElectronic) {
        instType = 'FMSynth';
        vol = -8;
      } else {
        samplerInst = isHipHop ? 'electric_bass_finger' : 'acoustic_bass';
        vol = -4;
      }
    } else if (padTypes[i] === 'chord') {
      if (isElectronic) {
        instType = 'AMSynth';
        vol = -10;
      } else {
        samplerInst = (i === 4 || isPop) ? 'acoustic_grand_piano' : 'acoustic_guitar_nylon';
        vol = -8;
      }
    } else if (padTypes[i] === 'lead') {
      if (isElectronic || actualEmotion === 'Tense') {
        instType = 'FMSynth';
        vol = -12;
      } else {
        samplerInst = (i === 6) ? 'flute' : 'trumpet';
        vol = -7;
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
