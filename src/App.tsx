import React, { useState, useEffect, useRef } from 'react';
import { audioEngine, KitConfig } from './audioEngine';
import { Square, Download, Loader2, Sparkles, Waves } from 'lucide-react';

import { generateOfflineKit } from './kitGenerator';

const TRANSLATIONS = {
  en: {
    title: "Byte Beats",
    subtitleWelcome: "Make your own retro 8-bit music beats! Pick a vibe, choose a key, and jam out on the pads. Play around with the effects to shape your sound.",
    subtitleReady: "Tap the pads below to start playing your music!",
    key: "KEY",
    vibe: "VIBE",
    generate: "CREATE MUSIC",
    synthesizing: "MAKING BEATS...",
    regenerate: "New Sounds",
    autoMix: "Auto-Mix",
    vol: "VOL",
    record: "Record",
    warmingUp: "WARMING UP",
    inTheGroove: "IN THE GROOVE",
    overdrive: "GOING CRAZY!",
    idle: "WAITING",
    tempo: "Tempo",
    status: "Status",
    filter: "FILTER",
    sweep: "SWEEP",
    space: "SPACE",
    delay: "DELAY",
    noise: "NOISE",
    crush: "CRUSH",
    room: "ROOM",
    reverb: "REVERB",
    welcomeLoading: "Welcome! Once the music pads load, tap them to create fun beats that you can record and download. Have fun!",
    credit: "Built by AlSh",
    scaleDesc: {
      major: " (Happy/Bright)",
      minor: " (Dark/Moody)",
      random: " (Surprise me)"
    },
    vibes: {
      "Latin Pop Hit": "Latin Pop Hit",
      "Reggaeton": "Reggaeton",
      "Random": "Random",
      "Boss Battle": "Boss Battle",
      "Spooky Dungeon": "Spooky Dungeon",
      "Upbeat Platformer": "Upbeat Platformer",
      "Chill Village": "Chill Village",
      "Cyberpunk City": "Cyberpunk City",
      "Underwater Level": "Underwater Level",
      "Space Shooter": "Space Shooter"
    }
  },
  he: {
    title: "בייט ביטס",
    subtitleWelcome: "צרו מוזיקת 8-ביט רטרו משלכם בקלות! בחרו אווירה, בחרו סולם מוזיקלי, ותתחילו לנגן על הפדים. שחקו עם האפקטים כדי לשנות את הסאונד.",
    subtitleReady: "לחצו על הפדים למטה כדי להתחיל לנגן!",
    key: "סולם",
    vibe: "אווירה",
    generate: "צור מוזיקה",
    synthesizing: "מייצר סאונד...",
    regenerate: "צלילים חדשים",
    autoMix: "איזון אוטומטי",
    vol: "עוצמה",
    record: "הקלט",
    warmingUp: "מתחממים",
    inTheGroove: "בגרוב",
    overdrive: "טירוף!",
    idle: "ממתין",
    tempo: "קצב",
    status: "סטטוס",
    filter: "פילטר",
    sweep: "תדר",
    space: "חלל",
    delay: "דיליי",
    noise: "רעש",
    crush: "ביטקראש",
    room: "חדר",
    reverb: "הדהוד",
    welcomeLoading: "ברוכים הבאים! כשהפדים ייטענו, תוכלו ללחוץ עליהם כדי ליצור מקצבים מגניבים שאפשר גם להקליט ולהוריד. תהנו!",
    credit: "האתר נבנה עלידי AlSh",
    scaleDesc: {
      major: " (שמח)",
      minor: " (אפל/רגשי)",
      random: " (הפתעה)"
    },
    vibes: {
      "Latin Pop Hit": "להיט פופ לטיני",
      "Reggaeton": "רגטון",
      "Random": "אקראי",
      "Boss Battle": "קרב בוס",
      "Spooky Dungeon": "צינוק מפחיד",
      "Upbeat Platformer": "פלטפורמר קצבי",
      "Chill Village": "כפר רגוע",
      "Cyberpunk City": "עיר סייברפאנק",
      "Underwater Level": "שלב מים",
      "Space Shooter": "חללית יריות"
    }
  }
};

const PixelGrid = ({ active, padId }: { active: boolean; padId: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!active) {
      if (containerRef.current) {
        const bars = containerRef.current.children;
        for (let i = 0; i < bars.length; i++) {
          (bars[i].firstChild as HTMLElement).style.height = '10%';
        }
      }
      return;
    }

    let req: number;
    let startTime = performance.now();
    
    const animate = (time: number) => {
      if (!containerRef.current) return;
      const t = (time - startTime) * 0.005;
      const bars = containerRef.current.children;
      
      const speedMult = 1 + (padId % 3) * 0.3;
      const scaledT = t * speedMult;

      for (let i = 0; i < bars.length; i++) {
        let height = 0;
        if (padId % 4 === 0) { // Kick / impact
          height = 40 + Math.sin(scaledT * 2 + i * 0.5) * 40 + Math.cos(scaledT * 4) * 20;
        } else if (padId % 4 === 1) { // Snare / chaotic
          height = 30 + Math.random() * 50 + Math.sin(scaledT + i) * 20;
        } else if (padId % 4 === 2) { // Bass / smooth wave
          height = 50 + Math.sin(scaledT * 0.8 + i * 0.3) * 45;
        } else { // Lead / sharp peaks
          height = 30 + Math.abs(Math.sin(scaledT * 1.5 + i * 0.6)) * 70;
        }
        
        height = Math.max(10, Math.min(100, height));
        (bars[i].firstChild as HTMLElement).style.height = `${height}%`;
      }
      
      req = requestAnimationFrame(animate);
    };
    
    req = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(req);
  }, [active, padId]);

  const numBars = 16;
  const colors = [
    'from-[#ff3366] to-[#ff9933]', // warm pop
    'from-[#00c6ff] to-[#0072ff]', // cool blue
    'from-[#11998e] to-[#38ef7d]', // green groove
    'from-[#8E2DE2] to-[#4A00E0]', // deep purple
    'from-[#f12711] to-[#f5af19]', // fiery red
    'from-[#fc00ff] to-[#00dbde]', // synthwave
    'from-[#ffe259] to-[#ffa751]', // golden sunset
    'from-[#4CB8C4] to-[#3CD3AD]'  // minty fresh
  ];
  // Safe indexing for padId
  const colorClass = colors[((padId || 1) - 1) % colors.length] || colors[0];

  return (
    <div 
      className="w-full h-full min-h-[80px] bg-[#1a1c23] rounded-lg flex items-end justify-between px-3 py-3 gap-[2px] overflow-hidden relative shadow-inner" 
      ref={containerRef}
    >
      {Array.from({ length: numBars }).map((_, i) => (
        <div key={i} className="w-full flex items-end justify-center h-full">
          <div 
            className={`w-full rounded-full bg-gradient-to-t ${active ? colorClass : 'from-gray-700 to-gray-600'} transition-colors duration-300`}
            style={{ height: '10%', willChange: 'height' }}
          />
        </div>
      ))}
    </div>
  );
};

const KEYS = ["Random", "C Major", "C Minor", "D Major", "D Minor", "E Minor", "F Major", "F# Minor", "G Major", "G Minor", "A Major", "A Minor", "Bb Major", "B Minor"];
const VIBES = ["Latin Pop Hit", "Reggaeton", "Random", "Boss Battle", "Spooky Dungeon", "Upbeat Platformer", "Chill Village", "Cyberpunk City", "Underwater Level", "Space Shooter"];

const XYPad = ({ title1, title2, initialX = 0.5, initialY = 0.5, onChange }: { title1: string, title2: string, initialX?: number, initialY?: number, onChange: (x: number, y: number) => void }) => {
  const [x, setX] = useState(initialX);
  const [y, setY] = useState(initialY);
  const [isDragging, setIsDragging] = useState(false);
  const padRef = useRef<HTMLDivElement>(null);

  const updatePosition = (e: React.PointerEvent) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    let newX = (e.clientX - rect.left) / rect.width;
    let newY = 1.0 - ((e.clientY - rect.top) / rect.height);
    newX = Math.max(0, Math.min(1, newX));
    newY = Math.max(0, Math.min(1, newY));
    setX(newX);
    setY(newY);
    onChange(newX, newY);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePosition(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="w-full h-full p-4 bg-[#eeeee7] inline-flex flex-col justify-start items-start gap-4">
      <div 
        ref={padRef}
        className="w-full aspect-square bg-gray-200 border-2 border-black relative cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="absolute w-full h-[1px] bg-black/20" style={{ bottom: `${y * 100}%` }} />
        <div className="absolute h-full w-[1px] bg-black/20" style={{ left: `${x * 100}%` }} />
        <div 
          className="absolute size-4 -ml-2 -mb-2 bg-black rounded-full"
          style={{ left: `${x * 100}%`, bottom: `${y * 100}%` }}
        />
      </div>
      <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-black"></div>
      <div className="self-stretch inline-flex justify-between items-center gap-2">
        <div className="justify-start text-black text-[14px] font-bold font-rose leading-4 uppercase">
          {title1}<br/>{title2}
        </div>
      </div>
    </div>
  );
};

const StudioFader = ({ title1, title2, initialValue = 0, onChange }: { title1: string, title2: string, initialValue?: number, onChange: (v: number) => void }) => {
  const [value, setValue] = useState(initialValue);
  const [isDragging, setIsDragging] = useState(false);
  const faderRef = useRef<HTMLDivElement>(null);

  const updatePosition = (e: React.PointerEvent) => {
    if (!faderRef.current) return;
    const rect = faderRef.current.getBoundingClientRect();
    let newValue = 1.0 - ((e.clientY - rect.top) / rect.height);
    newValue = Math.max(0, Math.min(1, newValue));
    setValue(newValue);
    onChange(newValue);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePosition(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updatePosition(e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="w-full h-full p-4 bg-[#eeeee7] inline-flex flex-col justify-start items-start gap-4">
      <div className="w-full aspect-square flex justify-center py-2">
        <div 
          ref={faderRef}
          className="w-8 h-full bg-gray-200 border-2 border-black relative cursor-ns-resize touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="absolute w-full h-full flex flex-col justify-between py-1">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-full h-[1px] bg-black/10" />
            ))}
          </div>
          <div 
            className="absolute w-12 h-6 -ml-2 -mb-3 bg-black rounded"
            style={{ bottom: `${value * 100}%` }}
          >
            <div className="w-full h-[2px] bg-white/50 mt-2.5" />
          </div>
        </div>
      </div>
      <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-black"></div>
      <div className="self-stretch inline-flex justify-between items-center gap-2">
        <div className="justify-start text-black text-[14px] font-bold font-rose leading-4 uppercase">
          {title1}<br/>{title2}
        </div>
        <div className="justify-start text-black text-5xl font-bold font-rose leading-6">{Math.floor(value * 99).toString().padStart(2, '0')}</div>
      </div>
    </div>
  );
};

const PadVolumeSlider = ({ padId, volume, label, onChange }: { padId: number; volume: number; label: string; onChange: (id: number, val: number) => void }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange(padId, val);
  };

  return (
    <div 
      className="mt-3 flex items-center gap-2 w-full pr-4 rtl:pl-4 rtl:pr-0" 
      onClick={e => e.stopPropagation()} 
      onPointerDown={e => e.stopPropagation()}
    >
      <span className="text-[10px] font-black font-mono-ibm text-gray-500 uppercase tracking-widest w-8">{label}</span>
      <input 
        type="range" 
        min="-30" 
        max="6" 
        step="1"
        value={volume} 
        onChange={handleChange}
        className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
        style={{
          accentColor: 'black'
        }}
      />
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'he'>('en');

  useEffect(() => {
    const userLang = navigator.language;
    if (userLang && userLang.startsWith('he')) {
      setLang('he');
      document.documentElement.dir = 'rtl';
    } else {
      setLang('en');
      document.documentElement.dir = 'ltr';
    }
  }, []);

  const t = TRANSLATIONS[lang];

  const renderKey = (k: string) => {
    let desc = "";
    if (k === "Random") {
      desc = t.scaleDesc.random;
    } else if (k.includes("Major")) {
      desc = t.scaleDesc.major;
    } else if (k.includes("Minor")) {
      desc = t.scaleDesc.minor;
    }

    if (lang !== 'he') {
      return `${k}${desc}`;
    }

    const translatedKey = k.replace('Major', "מז'ור").replace('Minor', 'מינור').replace('Random', 'אקראי');
    return `${translatedKey}${desc}`;
  };

  const [kit, setKit] = useState<KitConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [activePads, setActivePads] = useState<Set<number>>(new Set());
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);
  
  const [selectedKey, setSelectedKey] = useState("Keys");
  const [selectedVibe, setSelectedVibe] = useState("Vibe");
  
  const [padVolumes, setPadVolumes] = useState<Record<number, number>>({});
  const [isAutoMix, setIsAutoMix] = useState(true);

  useEffect(() => {
    if (!isAutoMix || !kit) return;
    const activeCount = activePads.size;
    
    const newVolumes = { ...padVolumes };
    let changed = false;
    
    kit.pads.forEach(pad => {
      let targetVol = pad.synthParams.volume ?? -6;
      
      if (activeCount > 3) {
        targetVol -= Math.min(6, (activeCount - 3) * 1.5);
      }
      
      if (pad.type === 'lead') {
        targetVol += 1.5;
      } else if (pad.type === 'bass' && activeCount > 4) {
        targetVol -= 1.5;
      }
      
      if (newVolumes[pad.id] !== targetVol) {
        newVolumes[pad.id] = targetVol;
        audioEngine.setPadVolume(pad.id, targetVol);
        changed = true;
      }
    });
    
    if (changed) setPadVolumes(newVolumes);
  }, [activePads, isAutoMix]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVolumeChange = (id: number, val: number) => {
    setPadVolumes(prev => ({ ...prev, [id]: val }));
    audioEngine.setPadVolume(id, val);
    setIsAutoMix(false);
  };

  const initAudio = async () => {
    if (!audioInitialized) {
      await audioEngine.init();
      setAudioInitialized(true);
    }
    await audioEngine.resume();
  };

  const generateKit = async () => {
    try {
      setLoading(true);
      await initAudio();
      
      // Simulate artificial delay for generation effect
      await new Promise(res => setTimeout(res, 800));
      const data = generateOfflineKit(selectedVibe, selectedKey);
      
      setKit(data);
      
      const initialVolumes: Record<number, number> = {};
      data.pads.forEach(p => {
        initialVolumes[p.id] = p.synthParams.volume ?? -6;
      });
      setPadVolumes(initialVolumes);
      setIsAutoMix(true); // reset auto mix when generating new kit

      await audioEngine.loadKit(data);
      setActivePads(new Set());
    } catch (err) {
      console.error(err);
      alert('Error generating kit. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePad = async (id: number) => {
    await initAudio();
    const isCurrentlyActive = activePads.has(id);
    if (isCurrentlyActive) {
      audioEngine.stopPad(id);
      setActivePads(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      audioEngine.playPad(id);
      setActivePads(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
  };

  const toggleRecording = async () => {
    await initAudio();
    if (isRecording) {
      setIsRecording(false);
      const blob = await audioEngine.stopRecording();
      const url = URL.createObjectURL(blob);
      setRecordedBlobUrl(url);
    } else {
      setRecordedBlobUrl(null);
      setIsRecording(true);
      audioEngine.startRecording();
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-white text-black flex flex-col font-sans">
      <div className={`max-w-4xl w-full mx-auto h-full overflow-y-auto no-scrollbar px-6 relative ${(!kit && !loading) ? 'flex flex-col justify-center' : ''}`}>
        {/* Header and Controls */}
        <div className={(!kit && !loading) ? "pb-6 mb-4 w-full" : "pt-10 pb-6 mb-4 sticky top-0 bg-white z-10"}>
          <div className="flex flex-col gap-[16px] md:items-center">
            {!loading && (
              <>
                {!kit && <h1 className="text-[52px] font-black font-display tracking-tight leading-none text-left md:text-center">{t.title}</h1>}
                <p className="text-gray-500 text-[18px] font-mono-ibm uppercase leading-relaxed tracking-wider text-left md:text-center">
                  {kit ? t.subtitleReady : t.subtitleWelcome}
                </p>
              </>
            )}

            {!kit && !loading && (
              <div className="w-full flex flex-col md:items-center gap-[16px]">
                <div className="w-full flex flex-col md:flex-row gap-[6px]">
                  <select 
                    value={selectedKey}
                    onChange={(e) => setSelectedKey(e.target.value)}
                    disabled={loading}
                    className="w-full px-8 h-16 rounded-[110px] border-4 border-black bg-white appearance-none text-center text-black text-2xl font-bold font-rose leading-6 cursor-pointer outline-none"
                  >
                    <option value="Keys">{t.key}</option>
                    {KEYS.map(k => <option key={k} value={k}>{renderKey(k)}</option>)}
                  </select>

                  <select 
                    value={selectedVibe}
                    onChange={(e) => setSelectedVibe(e.target.value)}
                    disabled={loading}
                    className="w-full px-8 h-16 rounded-[110px] border-4 border-black bg-white appearance-none text-center text-black text-2xl font-bold font-rose leading-6 cursor-pointer outline-none"
                  >
                    <option value="Vibe">{t.vibe}</option>
                    {VIBES.map(v => <option key={v} value={v}>{t.vibes[v as keyof typeof t.vibes]}</option>)}
                  </select>
                </div>

                <button 
                  onClick={generateKit}
                  disabled={loading}
                  className="w-full h-16 bg-black rounded-[110px] border-4 border-black flex items-center justify-center text-white text-2xl font-bold font-rose leading-6 disabled:opacity-50 transition-colors hover:bg-gray-800"
                >
                  {loading ? t.synthesizing : t.generate}
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center md:justify-center mt-4">
            {kit && (
              <>
                <select 
                  value={selectedKey}
                  onChange={(e) => setSelectedKey(e.target.value)}
                  disabled={loading}
                  className="px-4 py-3 h-12 rounded-full border-2 border-black bg-white text-black font-bold font-rose cursor-pointer outline-none appearance-none text-center min-w-[100px]"
                >
                  <option value="Keys">{t.key}</option>
                  {KEYS.map(k => <option key={k} value={k}>{renderKey(k)}</option>)}
                </select>

                <select 
                  value={selectedVibe}
                  onChange={(e) => setSelectedVibe(e.target.value)}
                  disabled={loading}
                  className="px-4 py-3 h-12 rounded-full border-2 border-black bg-white text-black font-bold font-rose cursor-pointer outline-none appearance-none text-center min-w-[100px]"
                >
                  <option value="Vibe">{t.vibe}</option>
                  {VIBES.map(v => <option key={v} value={v}>{t.vibes[v as keyof typeof t.vibes]}</option>)}
                </select>

                <button 
                  onClick={generateKit}
                  disabled={loading}
                  className="bg-black hover:bg-gray-800 text-white px-6 py-3 h-12 rounded-full font-bold transition-colors disabled:opacity-50"
                >
                  {loading ? t.synthesizing : t.regenerate}
                </button>
              </>
            )}
          
          {kit && (
            <button 
              onClick={toggleRecording}
              className={`flex items-center justify-center gap-2 px-6 py-3 h-12 rounded-full font-bold transition-all ${isRecording ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-black text-white hover:bg-gray-800'}`}
            >
              {isRecording ? <Square size={16} fill="currentColor" /> : <div className="w-3 h-3 rounded-full bg-red-500" />}
              <span>{isRecording ? `${recordSeconds} s` : t.record}</span>
            </button>
          )}

          {kit && (
            <button 
              onClick={() => setIsAutoMix(!isAutoMix)}
              className={`flex items-center justify-center gap-2 px-6 py-3 h-12 rounded-full font-bold transition-all ${isAutoMix ? 'bg-[#e5e5dd] text-black border-2 border-black' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border-2 border-transparent'}`}
            >
              <Waves size={16} />
              <span>{t.autoMix}</span>
            </button>
          )}

          {recordedBlobUrl && !isRecording && (
            <a 
              href={recordedBlobUrl} 
              download="arcade-jam.webm"
              className="flex items-center justify-center w-12 h-12 bg-black text-white rounded-full font-bold transition-all hover:bg-gray-800"
            >
              <Download size={20} />
            </a>
          )}
        </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center pt-24 pb-16 space-y-6">
            <div className="w-[200px] h-[100px] flex flex-col">
              <PixelGrid active={true} padId={42} />
            </div>
            <p className="text-gray-500 text-sm max-w-md text-center font-mono-ibm uppercase leading-relaxed tracking-wider">
              {t.welcomeLoading}
            </p>
          </div>
        ) : (
          <>
            {/* Status */}
            {kit && (() => {
              let statusValue = t.idle;
              let emoticon = "(-_- )";
              if (activePads.size > 0 && activePads.size <= 2) {
                statusValue = t.warmingUp;
                emoticon = "(o_O )";
              } else if (activePads.size > 2 && activePads.size <= 5) {
                statusValue = t.inTheGroove;
                emoticon = "(⌐■_■)";
              } else if (activePads.size > 5) {
                statusValue = t.overdrive;
                emoticon = "( ✧Д✧)";
              }

              return (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6 text-sm font-bold text-gray-400 uppercase tracking-widest">
                  <span>{t.key}: <span className="text-black">{renderKey(kit.key)}</span></span>
                  <span>{t.tempo}: <span className="text-black">{kit.tempo} BPM</span></span>
                  {selectedVibe !== "Vibe" && <span>{t.vibe}: <span className="text-black">{t.vibes[selectedVibe as keyof typeof t.vibes]}</span></span>}
                  <span>{t.status}: <span className="text-black">{statusValue}</span></span>
                  <span className="text-black text-lg">{emoticon}</span>
                </div>
              );
            })()}

            {/* Pads List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
              {kit && kit.pads.map((pad) => {
                const isActive = activePads.has(pad.id);
                return (
                  <div 
                    key={pad.id}
                    onClick={() => togglePad(pad.id)}
                    className={`flex w-full cursor-pointer transition-transform active:scale-[0.99] select-none`}
                  >
                    {/* Left side */}
                    <div className={`relative flex-none w-[40%] flex flex-col justify-center transition-colors ${isActive ? 'bg-[#e5e5dd]' : 'bg-[#eeeee7]'}`}>
                      {isActive && <div className="absolute left-0 rtl:left-auto rtl:right-0 top-0 bottom-0 w-4 bg-black" />}
                      <div className={`${isActive ? 'pl-[30px] pr-6 rtl:pl-6 rtl:pr-[30px]' : 'px-[30px]'}`}>
                        <h2 className="font-rose uppercase font-black text-[17px] leading-none text-black mb-0">
                          {pad.name.split(' ').map((word, i) => (
                            <React.Fragment key={i}>
                              {word}
                              {i < pad.name.split(' ').length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </h2>
                        <p className="font-sans text-gray-500 text-[14px] capitalize">
                          {pad.type}
                        </p>
                        
                        <PadVolumeSlider 
                          padId={pad.id} 
                          volume={padVolumes[pad.id] ?? (pad.synthParams.volume ?? -6)} 
                          label={t.vol}
                          onChange={handleVolumeChange}
                        />
                      </div>
                    </div>

                    {/* Right side (Pixel Grid) */}
                    <div className="w-[60%] flex flex-col">
                      <PixelGrid active={isActive} padId={pad.id} />
                    </div>
                  </div>
                );
              })}
            </div>

            {kit && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-16">
                <XYPad 
                  title1={t.filter} title2={t.sweep} 
                  initialX={1.0} initialY={0.0} 
                  onChange={(x, y) => audioEngine.setFilter(x, y)} 
                />
                <XYPad 
                  title1={t.space} title2={t.delay} 
                  initialX={0.0} initialY={0.0} 
                  onChange={(x, y) => audioEngine.setDelay(x, y)} 
                />
                <StudioFader 
                  title1={t.noise} title2={t.crush} 
                  initialValue={0.0} 
                  onChange={(v) => audioEngine.setBitcrush(v)} 
                />
                <StudioFader 
                  title1={t.room} title2={t.reverb} 
                  initialValue={0.0} 
                  onChange={(v) => audioEngine.setReverb(v)} 
                />
              </div>
            )}
          </>
        )}
        
        {/* Footer Credit */}
        <div className="w-full text-center py-6 mt-4 opacity-70 text-sm font-mono-ibm font-bold tracking-widest text-gray-500 pb-8">
          {t.credit}
        </div>
      </div>
    </div>
  );
}
