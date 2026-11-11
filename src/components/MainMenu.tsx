import React, { useState } from 'react';
import { CHARACTERS, MAP_THEMES } from '../data/charactersAndWeapons';
import { CharacterId } from '../types/game';
import { soundSynth } from '../game/audio/soundSynth';
import { 
  Play, 
  Users, 
  Crosshair, 
  ShieldAlert, 
  Settings, 
  Code2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Bot, 
  Globe,
  Flame,
  ArrowRight
} from 'lucide-react';

interface MainMenuProps {
  onStartGame: (charId: CharacterId, mapId: string, botCount: number, difficulty: 'easy' | 'medium' | 'hard') => void;
  onOpenMultiplayer: () => void;
  onOpenLoadout: () => void;
  onOpenCodeExplorer: () => void;
  onOpenSettings: () => void;
  selectedChar: CharacterId;
  onSelectChar: (id: CharacterId) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartGame,
  onOpenMultiplayer,
  onOpenLoadout,
  onOpenCodeExplorer,
  onOpenSettings,
  selectedChar,
  onSelectChar
}) => {
  const [selectedMap, setSelectedMap] = useState<string>('tokyo');
  const [botCount, setBotCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isMuted, setIsMuted] = useState(false);

  const charDef = CHARACTERS.find(c => c.id === selectedChar) || CHARACTERS[0];

  const handleLaunchOffline = () => {
    soundSynth.playAnimeVoice('victory');
    onStartGame(selectedChar, selectedMap, botCount, difficulty);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-y-auto overflow-x-hidden flex flex-col justify-between p-4 md:p-8">
      
      {/* Background Anime Grid & Speed Lines */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP BAR */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-pink-500 flex items-center justify-center shadow-lg anime-box-glow">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black italic tracking-wider comic-text">
              CALL OF BATTLE
            </h1>
            <div className="text-[10px] md:text-xs font-mono font-bold tracking-widest text-cyan-400">
              電脳戦線・ANIME MULTIPLAYER 2D SHOOTER
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const muted = !isMuted;
              setIsMuted(muted);
              soundSynth.setMuted(muted);
            }}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
            title="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={onOpenCodeExplorer}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 flex items-center gap-2 text-xs font-bold font-mono transition-all"
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Android & Server Code</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* MAIN HERO CONTENT */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center py-6">
        
        {/* Left Column: Game Mode Selection & Match Config */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              60 FPS LIBGDX / SURFACEVIEW NATIVE KOTLIN ARCHITECTURE
            </div>
            <h2 className="text-4xl md:text-5xl font-black italic tracking-wide text-white">
              ENGAGE IN DUAL-JOYSTICK JETPACK COMBAT
            </h2>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Experience fast-paced 2D tactical combat with gravity mechanics, recoil physics, 8 weapons, 
              character signature Ultimates, and real-time 30 tick/s online multiplayer.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Play Offline vs Bots Button */}
            <div className="bg-slate-900/90 border border-slate-700 hover:border-cyan-500/80 p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all hover:bg-slate-850 shadow-xl group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <Bot className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    INSTANT PLAY
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Offline Battle vs Bots
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Practice against Easy, Medium, or Hard AI with full weapon & jetpack simulation.
                </p>
              </div>

              {/* Bot match options */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Difficulty:</span>
                  <div className="flex gap-1">
                    {(['easy', 'medium', 'hard'] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold transition-colors ${
                          difficulty === d ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Map Arena:</span>
                  <select
                    value={selectedMap}
                    onChange={(e) => setSelectedMap(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs rounded px-2 py-1 text-slate-200 outline-none"
                  >
                    {Object.values(MAP_THEMES).map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleLaunchOffline}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 uppercase tracking-wider"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Launch Match
                </button>
              </div>
            </div>

            {/* Play Online Multiplayer Button */}
            <div className="bg-slate-900/90 border border-slate-700 hover:border-pink-500/80 p-5 rounded-2xl flex flex-col justify-between gap-4 transition-all hover:bg-slate-850 shadow-xl group">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
                    <Globe className="w-5 h-5" />
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                    30 TICK/S AUTHORITATIVE
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-pink-300 transition-colors">
                  Online Multiplayer
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Quick match matchmaking or create private 8-player room with 6-digit codes.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <button
                  onClick={onOpenMultiplayer}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 uppercase tracking-wider"
                >
                  <Users className="w-4 h-4" />
                  Multiplayer Lobby
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Anime Character Showcase */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-sm bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 p-6 rounded-3xl anime-box-glow flex flex-col items-center">
            
            {/* Header Badge */}
            <div className="w-full flex items-center justify-between mb-4">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-[11px] font-mono font-bold border border-cyan-500/40">
                ROLE: {charDef.role.toUpperCase()}
              </span>
              <button
                onClick={onOpenLoadout}
                className="text-xs text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 font-mono"
              >
                Inspect All 8 <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Character Anime Card */}
            <div className="w-36 h-36 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-cyan-400 flex flex-col items-center justify-center p-3 shadow-inner relative overflow-hidden mb-4">
              <div 
                className="w-16 h-16 rounded-full border-2 border-white/80 shadow-lg flex items-center justify-center text-3xl font-black text-white pop-font"
                style={{ backgroundColor: charDef.hairColor }}
              >
                {charDef.name.charAt(0)}
              </div>
              <div className="mt-2 text-xs font-black text-white text-center tracking-wide font-mono">
                {charDef.name}
              </div>
              <div className="text-[10px] text-cyan-400 font-mono text-center">
                {charDef.title}
              </div>
            </div>

            {/* Quote */}
            <div className="text-center italic text-xs text-slate-300 px-4 mb-4 font-mono">
              &quot;{charDef.voiceQuote}&quot;
            </div>

            {/* Stats Bars */}
            <div className="w-full space-y-2 font-mono text-xs mb-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Speed</span>
                <span className="text-cyan-400 font-bold">{charDef.stats.speed}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: `${charDef.stats.speed}%` }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Jetpack Thrust</span>
                <span className="text-amber-400 font-bold">{charDef.stats.jetpack}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: `${charDef.stats.jetpack}%` }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Ultimate</span>
                <span className="text-pink-400 font-bold">{charDef.ultimate.name}</span>
              </div>
            </div>

            {/* Character Selector Thumbnails */}
            <div className="flex items-center gap-2 overflow-x-auto w-full py-1">
              {CHARACTERS.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectChar(c.id);
                    soundSynth.playJump();
                  }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                    selectedChar === c.id 
                      ? 'border-2 border-cyan-400 scale-110 shadow-[0_0_12px_rgba(0,240,255,0.6)]' 
                      : 'border border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hairColor, color: '#0F172A' }}
                  title={c.name}
                >
                  {c.name.charAt(0)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono pt-4 border-t border-slate-800/80 gap-2">
        <div>Call of Battle: Anime Edition • Native Kotlin Android + Node.js WebSocket Engine</div>
        <div className="flex items-center gap-4">
          <button onClick={onOpenCodeExplorer} className="hover:text-cyan-400 transition-colors">
            Source Code Hub
          </button>
          <span>•</span>
          <button onClick={onOpenLoadout} className="hover:text-cyan-400 transition-colors">
            Armory & Characters
          </button>
          <span>•</span>
          <button onClick={onOpenSettings} className="hover:text-cyan-400 transition-colors">
            Control Settings
          </button>
        </div>
      </footer>
    </div>
  );
};
