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

  // טמפו יציב יותר
  const tempo = 95 + Math.floor(Math.random() * 35); // 95-130 BPM

  const pads: PadConfig[] = [];
  const padTypes = ['drum', 'drum', 'bass', 'bass', 'chord', 'chord', 'lead', 'lead'];
  
  // --- 1. תופים (Drums) ---
  // במקום אקראיות מוחלטת, נייצר מקצבים מוכרים ויציבים (ארבעה רבעים או שבירות)
  const kickSeq = new Array(16).fill(null);
  const snareSeq = new Array(16).fill(null);
  
  const isFourOnFloor = Math.random() > 0.4;
  for (let i = 0; i < 16; i++) {
    if (isFourOnFloor) {
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
  bassRhythm[0] = true;
  bassRhythm[3] = true;
  bassRhythm[isFourOnFloor ? 4 : 5] = true;
  if (Math.random() > 0.5) bassRhythm[6] = true;

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
  
  // מקצב אקורדים קופצני (Syncopated)
  chordRhythm[2] = true;
  chordRhythm[5] = true;
  if (Math.random() > 0.7) chordRhythm[0] = true;

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
    // מתאימים סוג גל לכל תפקיד
    let oscType = synthTypes[i % synthTypes.length];
    if (padTypes[i] === 'bass') oscType = 'triangle'; // בס נשמע הכי טוב ופחות צורם במשולש
    if (padTypes[i] === 'chord') oscType = 'sawtooth';
    if (padTypes[i] === 'lead') oscType = 'square';

    pads.push({
      id: i + 1,
      name: names[i],
      type: padTypes[i],
      synthParams: { oscillatorType: oscType },
      sequence: sequences[i]
    });
  }

  return {
    key: selectedKey,
    tempo,
    pads
  };
}
