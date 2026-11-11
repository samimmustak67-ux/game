import React from 'react';
import { GameEngine } from '../game/engine/gameEngine';
import { soundSynth } from '../game/audio/soundSynth';
import { X, Sliders, Volume2, Monitor, Gamepad2, Sparkles, Smartphone } from 'lucide-react';

interface SettingsModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ engine, onClose }) => {
  const settings = engine.settings;

  const handleQualityChange = (q: 'low' | 'medium' | 'high') => {
    settings.quality = q;
    engine.initMap(engine.mapTheme.id); // re-seed particles based on quality
  };

  const handleSoundVolume = (v: number) => {
    settings.soundVolume = v;
    soundSynth.setVolumes(v, settings.musicVolume);
  };

  const handleMusicVolume = (v: number) => {
    settings.musicVolume = v;
    soundSynth.setVolumes(settings.soundVolume, v);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative flex flex-col gap-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-mono">SETTINGS & CONTROLS</h3>
              <p className="text-xs text-slate-400">Graphics, Audio, Virtual Joystick & Keyboard</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          
          {/* Graphics Quality (Requested: Low/Med/High toggle for mid-range phones) */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-cyan-400" /> RENDERING QUALITY (60 FPS OPTIMIZATION)
              </span>
              <span className="text-xs font-mono text-cyan-400 uppercase font-bold">{settings.quality}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {(['low', 'medium', 'high'] as const).map(q => (
                <button
                  key={q}
                  onClick={() => handleQualityChange(q)}
                  className={`py-2 rounded-xl text-xs font-mono uppercase font-bold border transition-colors ${
                    settings.quality === q 
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400' 
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Low: disables light bloom & reduces particle count for budget Android hardware.
            </p>
          </div>

          {/* Audio Volume Sliders */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-pink-400" /> AUDIO VOLUME (SYNTHESIZED J-POP & SFX)
            </span>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>Sound Effects (SFX)</span>
                <span>{Math.round(settings.soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => handleSoundVolume(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>Background Music (BGM)</span>
                <span>{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => handleMusicVolume(parseFloat(e.target.value))}
                className="w-full accent-pink-400"
              />
            </div>
          </div>

          {/* Toggles: Screen Shake & Haptics */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-300">Tactical Screen Shake on Explosions</span>
              <button
                onClick={() => { settings.screenShake = !settings.screenShake; }}
                className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                  settings.screenShake ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.screenShake ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-mono text-slate-300">Haptic Vibration on Hits</span>
              <button
                onClick={() => { settings.haptics = !settings.haptics; }}
                className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                  settings.haptics ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.haptics ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* Keyboard Controls Guide */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs">
            <span className="text-slate-300 font-bold flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-amber-400" /> KEYBOARD & MOUSE SCHEME
            </span>
            <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1">
              <div><span className="text-cyan-400 font-bold">W / SPACE</span>: Jetpack Boost</div>
              <div><span className="text-cyan-400 font-bold">A / D</span>: Walk Left / Right</div>
              <div><span className="text-pink-400 font-bold">MOUSE AIM</span>: 360° Angle</div>
              <div><span className="text-pink-400 font-bold">LEFT CLICK</span>: Auto-Fire</div>
              <div><span className="text-amber-400 font-bold">R</span>: Reload Weapon</div>
              <div><span className="text-amber-400 font-bold">Q</span>: Switch Weapon Slot</div>
              <div><span className="text-emerald-400 font-bold">G</span>: Tactical Grenade</div>
              <div><span className="text-emerald-400 font-bold">F</span>: Melee Kick / Punch</div>
              <div><span className="text-purple-400 font-bold">E</span>: Signature Ultimate</div>
              <div><span className="text-slate-400 font-bold">ESC</span>: Pause Game</div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider font-mono"
        >
          Save & Apply
        </button>
      </div>
    </div>
  );
};
