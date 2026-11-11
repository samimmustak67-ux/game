import React, { useState } from 'react';
import { CHARACTERS, WEAPONS } from '../data/charactersAndWeapons';
import { CharacterId, WeaponType } from '../types/game';
import { soundSynth } from '../game/audio/soundSynth';
import { 
  X, 
  Sparkles, 
  Volume2, 
  Zap, 
  Shield, 
  Crosshair, 
  Flame, 
  Check, 
  CheckCircle, 
  Info,
  Layers
} from 'lucide-react';

interface LoadoutModalProps {
  onClose: () => void;
  selectedChar: CharacterId;
  onSelectChar: (id: CharacterId) => void;
}

export const LoadoutModal: React.FC<LoadoutModalProps> = ({
  onClose,
  selectedChar,
  onSelectChar
}) => {
  const [activeTab, setActiveTab] = useState<'characters' | 'weapons'>('characters');
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponType>('rifle');

  const charDef = CHARACTERS.find(c => c.id === selectedChar) || CHARACTERS[0];
  const weaponDef = WEAPONS[selectedWeapon];

  const handleTestVoice = () => {
    soundSynth.playAnimeVoice('ultimate');
  };

  const handleTestGunSound = (wpType: string) => {
    soundSynth.playShoot(wpType);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-cyan-500/40 w-full max-w-4xl max-h-[90vh] rounded-3xl p-6 shadow-2xl relative anime-box-glow flex flex-col gap-5 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-mono tracking-wide">
                ARMORY & ANIME ROSTER
              </h3>
              <div className="text-xs text-slate-400">
                8 Original Anime Warriors • 8 Stylized Sci-Fi Weapons • Signature Ultimates
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('characters')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
                  activeTab === 'characters' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Anime Warriors
              </button>
              <button
                onClick={() => setActiveTab('weapons')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
                  activeTab === 'weapons' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Weapon Arsenal
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB 1: 8 ANIME CHARACTERS */}
        {activeTab === 'characters' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto pr-1">
            
            {/* Left 8 Character Roster Grid */}
            <div className="md:col-span-5 grid grid-cols-2 gap-2.5">
              {CHARACTERS.map(c => {
                const isSelected = selectedChar === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectChar(c.id);
                      soundSynth.playJump();
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div 
                        className="w-10 h-10 rounded-xl border border-white/40 flex items-center justify-center font-black text-lg pop-font text-slate-950 shadow"
                        style={{ backgroundColor: c.hairColor }}
                      >
                        {c.name.charAt(0)}
                      </div>
                      {isSelected && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-mono leading-tight">{c.name}</div>
                      <div className="text-[10px] text-cyan-400 font-mono">{c.role}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Character Detailed Profile */}
            <div className="md:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                      {charDef.role.toUpperCase()} CLASS
                    </span>
                    <h4 className="text-2xl font-black text-white mt-1 font-mono tracking-wide">{charDef.name}</h4>
                    <p className="text-xs text-pink-400 font-mono font-bold">{charDef.title}</p>
                  </div>

                  <button
                    onClick={handleTestVoice}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-pink-400 text-pink-400 flex items-center gap-1.5 text-xs font-mono"
                    title="Play Synthesized Voice"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Voice Preview</span>
                  </button>
                </div>

                <div className="my-3 p-3 rounded-xl bg-slate-900/80 border-l-2 border-cyan-400 text-xs italic text-slate-300 font-mono">
                  &quot;{charDef.voiceQuote}&quot;
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {charDef.bio}
                </p>
              </div>

              {/* Stats */}
              <div className="space-y-2.5 font-mono text-xs bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div>
                  <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                    <span>AGILITY & SPEED</span>
                    <span className="text-cyan-400 font-bold">{charDef.stats.speed}/100</span>
                  </div>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${charDef.stats.speed}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                    <span>JETPACK THRUST RATING</span>
                    <span className="text-amber-400 font-bold">{charDef.stats.jetpack}/100</span>
                  </div>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${charDef.stats.jetpack}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 text-[11px] mb-1">
                    <span>DURABILITY & HEALTH</span>
                    <span className="text-emerald-400 font-bold">{charDef.stats.health}/100</span>
                  </div>
                  <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400" style={{ width: `${charDef.stats.health}%` }} />
                  </div>
                </div>
              </div>

              {/* Signature Ultimate Move */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/20 to-slate-900 border border-pink-500/30 flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-amber-400 font-bold tracking-wider">
                    SIGNATURE ULTIMATE
                  </div>
                  <div className="text-sm font-black text-white font-mono">{charDef.ultimate.name}</div>
                  <p className="text-xs text-slate-400 mt-0.5">{charDef.ultimate.description}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectChar(charDef.id);
                  onClose();
                }}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider font-mono shadow-lg transition-transform active:scale-95"
              >
                Equip {charDef.name}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: 8 WEAPONS ARSENAL */}
        {activeTab === 'weapons' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto pr-1">
            {/* Left Weapon List */}
            <div className="md:col-span-5 grid grid-cols-2 gap-2.5">
              {Object.values(WEAPONS).map(w => {
                const isSelected = selectedWeapon === w.type;
                return (
                  <button
                    key={w.type}
                    onClick={() => {
                      setSelectedWeapon(w.type);
                      handleTestGunSound(w.type);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-pink-950/60 border-pink-400 shadow-[0_0_15px_rgba(255,46,144,0.3)]' 
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white font-mono">{w.name}</div>
                    <div className="text-[10px] text-pink-400 font-mono">{w.japaneseName}</div>
                    <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span>DMG: {w.damage}</span>
                      <span>SPD: {w.bulletSpeed}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Weapon Specs */}
            <div className="md:col-span-7 bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-pink-400 bg-pink-950 px-2 py-0.5 rounded border border-pink-500/30">
                      SCI-FI WEAPON SPECS
                    </span>
                    <h4 className="text-2xl font-black text-white mt-1 font-mono">{weaponDef.name}</h4>
                    <p className="text-xs text-slate-400 font-mono">{weaponDef.japaneseName}</p>
                  </div>

                  <button
                    onClick={() => handleTestGunSound(weaponDef.type)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-400 flex items-center gap-1.5 text-xs font-mono"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Fire SFX</span>
                  </button>
                </div>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  {weaponDef.description}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">BASE DAMAGE</div>
                  <div className="text-lg font-bold text-red-400">{weaponDef.damage} HP</div>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">FIRE RATE</div>
                  <div className="text-lg font-bold text-cyan-400">{weaponDef.fireRate} shots/sec</div>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">MAGAZINE CAPACITY</div>
                  <div className="text-lg font-bold text-amber-400">{weaponDef.clipSize} rounds</div>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500">RELOAD SPEED</div>
                  <div className="text-lg font-bold text-emerald-400">{weaponDef.reloadTime}s</div>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Firing Mode:</span>
                <span className="text-white font-bold">{weaponDef.isAutomatic ? 'Full Automatic' : 'Semi-Automatic'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
