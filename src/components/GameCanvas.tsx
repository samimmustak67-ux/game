import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/engine/gameEngine';
import { CharacterRenderer } from '../game/renderer/characterRenderer';
import { MapRenderer } from '../game/renderer/mapRenderer';
import { CHARACTERS, WEAPONS } from '../data/charactersAndWeapons';
import { CharacterId, WeaponType } from '../types/game';
import { soundSynth } from '../game/audio/soundSynth';
import { 
  Shield, 
  Heart, 
  Zap, 
  RotateCw, 
  Bomb, 
  Sparkles, 
  Pause, 
  Play, 
  Volume2, 
  VolumeX, 
  Crosshair,
  MessageSquare,
  Trophy,
  ArrowRightLeft,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameCanvasProps {
  engine: GameEngine;
  onOpenSettings: () => void;
  onOpenLoadout: () => void;
  onExitToMenu: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  engine,
  onOpenSettings,
  onOpenLoadout,
  onExitToMenu
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // HUD and state sync
  const [hudState, setHudState] = useState({
    hp: 100,
    shield: 100,
    fuel: 100,
    ammo: 28,
    maxAmmo: 28,
    reserveAmmo: 140,
    isReloading: false,
    reloadProgress: 0,
    ultimateCharge: 40,
    isUltimateActive: false,
    activeWeapon: 'rifle' as WeaponType,
    secondaryWeapon: 'pistol' as WeaponType,
    matchTime: 300,
    matchOver: false,
    winnerName: '',
    winnerChar: 'aoi' as CharacterId,
    kills: 0,
    deaths: 0,
    score: 0,
    isMuted: false,
    isPaused: false
  });

  const [showQuickChat, setShowQuickChat] = useState(false);
  const [activeChatBubble, setActiveChatBubble] = useState<{ sender: string; text: string } | null>(null);

  // Virtual Joystick touches
  const leftTouchRef = useRef<{ id: number; startX: number; startY: number; currX: number; currY: number } | null>(null);
  const rightTouchRef = useRef<{ id: number; startX: number; startY: number; currX: number; currY: number } | null>(null);

  // Keyboard state
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isMouseDownRef = useRef<boolean>(false);

  // Setup Keyboard & Mouse Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;

      const player = engine.getLocalPlayer();
      if (!player) return;

      if (e.key.toLowerCase() === 'r') {
        engine.reloadWeapon(player);
      } else if (e.key.toLowerCase() === 'q') {
        engine.switchWeapon(player);
      } else if (e.key.toLowerCase() === 'g') {
        engine.throwGrenade(player);
      } else if (e.key.toLowerCase() === 'f') {
        engine.meleeStrike(player);
      } else if (e.key.toLowerCase() === 'e') {
        engine.activateUltimate(player);
      } else if (e.key === 'Escape') {
        engine.isPaused = !engine.isPaused;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDownRef.current = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDownRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [engine]);

  // Main 60 FPS Render & Physics Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const player = engine.getLocalPlayer();
      const canvas = canvasRef.current;

      if (canvas && player && !player.isDead) {
        // 1. Process Controls (Touch or Keyboard/Mouse)
        let moveX = 0;
        let isJetpack = false;

        // Keyboard Controls
        if (keysRef.current['a'] || keysRef.current['arrowleft']) moveX -= 1;
        if (keysRef.current['d'] || keysRef.current['arrowright']) moveX += 1;
        if (keysRef.current['w'] || keysRef.current['arrowup'] || keysRef.current[' ']) isJetpack = true;

        // Virtual Touch Joystick Override
        if (leftTouchRef.current) {
          const dx = leftTouchRef.current.currX - leftTouchRef.current.startX;
          const dy = leftTouchRef.current.currY - leftTouchRef.current.startY;
          moveX = Math.max(-1, Math.min(1, dx / 40));
          if (dy < -25) isJetpack = true;
        }

        player.vx += moveX * 750 * dt;
        player.isJetpacking = isJetpack;

        // Aiming
        if (rightTouchRef.current) {
          const dx = rightTouchRef.current.currX - rightTouchRef.current.startX;
          const dy = rightTouchRef.current.currY - rightTouchRef.current.startY;
          if (Math.hypot(dx, dy) > 10) {
            player.aimAngle = Math.atan2(dy, dx);
            player.facingLeft = Math.cos(player.aimAngle) < 0;
            // Auto fire while right joystick is held
            engine.fireWeapon(player);
          }
        } else {
          // Mouse Aim
          const screenCenterX = canvas.width / 2;
          const screenCenterY = canvas.height / 2;
          const mouseDx = mousePosRef.current.x - screenCenterX;
          const mouseDy = mousePosRef.current.y - screenCenterY;
          player.aimAngle = Math.atan2(mouseDy, mouseDx);
          player.facingLeft = Math.cos(player.aimAngle) < 0;

          if (isMouseDownRef.current) {
            engine.fireWeapon(player);
          }
        }
      }

      // 2. Engine Physics Update
      engine.update(dt);

      // 3. Canvas Rendering
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Adjust canvas resolution to parent
          if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
          }

          const w = canvas.width;
          const h = canvas.height;

          ctx.clearRect(0, 0, w, h);

          // Apply Screen Shake
          ctx.save();
          if (engine.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * engine.screenShake * 2;
            const shakeY = (Math.random() - 0.5) * engine.screenShake * 2;
            ctx.translate(shakeX, shakeY);
          }

          // Camera World Translation
          const camX = engine.cameraX - w / 2;
          const camY = engine.cameraY - h / 2;

          // Parallax Background
          MapRenderer.renderBackground(ctx, engine.mapTheme, camX, camY, w, h, engine.gameTime);

          // World Objects & Platforms
          ctx.save();
          ctx.translate(-camX, -camY);

          // Platforms
          MapRenderer.renderPlatforms(ctx, engine.platforms, engine.mapTheme, engine.gameTime);

          // Strategic Pickups
          engine.pickups.forEach(pick => {
            if (pick.respawnTime > 0) return;
            ctx.save();
            ctx.translate(pick.x, pick.y + Math.sin(engine.gameTime * 4) * 5);

            // Glowing ring
            ctx.fillStyle = pick.type === 'health' ? '#EF4444' : (pick.type === 'shield' ? '#00F0FF' : (pick.type === 'ultimate' ? '#F59E0B' : '#10B981'));
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(0, 0, pick.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Icon symbol
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px "Chakra Petch", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const iconText = pick.type === 'health' ? '+' : (pick.type === 'shield' ? 'S' : (pick.type === 'ultimate' ? 'U' : 'A'));
            ctx.fillText(iconText, 0, 0);

            ctx.restore();
          });

          // Projectiles & Lasers
          engine.projectiles.forEach(p => {
            ctx.save();
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;

            if (p.isRocket) {
              // Rocket with glowing body
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
              ctx.fill();
            } else if (p.isGrenade) {
              // Tactical Grenade with blinking light
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = Math.sin(engine.gameTime * 20) > 0 ? '#EF4444' : '#10B981';
              ctx.beginPath();
              ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Energy Beam / Bullet with stretch
              const angle = Math.atan2(p.vy, p.vx);
              ctx.translate(p.x, p.y);
              ctx.rotate(angle);
              ctx.beginPath();
              ctx.roundRect(-8, -p.radius, 16, p.radius * 2, 2);
              ctx.fill();
            }
            ctx.restore();
          });

          // Particles
          engine.particles.forEach(part => {
            ctx.save();
            ctx.globalAlpha = Math.min(1, part.life / (part.maxLife * 0.4));
            if (part.type === 'shockwave') {
              ctx.strokeStyle = part.color;
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
              ctx.stroke();
            } else {
              ctx.fillStyle = part.color;
              ctx.beginPath();
              ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          });

          // Render All Anime Soldiers
          engine.players.forEach(p => {
            CharacterRenderer.renderCharacter(ctx, p, engine.gameTime);

            // Overhead player name & health bar
            if (!p.isDead) {
              ctx.save();
              ctx.translate(p.x, p.y - 42);

              // Name tag
              ctx.font = 'bold 11px "Chakra Petch", sans-serif';
              ctx.textAlign = 'center';
              ctx.fillStyle = p.id === engine.localPlayerId ? '#38BDF8' : '#FFFFFF';
              ctx.shadowColor = '#000000';
              ctx.shadowBlur = 4;
              ctx.fillText(p.name, 0, -8);

              // Health Bar
              const barW = 34;
              const barH = 4;
              ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
              ctx.fillRect(-barW / 2, 0, barW, barH);
              ctx.fillStyle = p.team === 'red' ? '#EF4444' : '#10B981';
              ctx.fillRect(-barW / 2, 0, barW * (p.health / p.maxHealth), barH);

              // Shield mini bar
              if (p.shield > 0) {
                ctx.fillStyle = '#00F0FF';
                ctx.fillRect(-barW / 2, barH + 1, barW * (p.shield / p.maxShield), 2);
              }

              ctx.restore();
            }
          });

          // Comic Popups ("BOOM!", "POW!", "K.O.!")
          engine.comicTexts.forEach(ct => {
            ctx.save();
            ctx.translate(ct.x, ct.y);
            ctx.scale(ct.scale, ct.scale);
            ctx.globalAlpha = ct.alpha;

            ctx.font = '900 22px "Mochiy Pop One", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Thick Comic Black Outline
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 6;
            ctx.strokeText(ct.text, 0, 0);

            // Bright Fill
            ctx.fillStyle = ct.color;
            ctx.fillText(ct.text, 0, 0);
            ctx.restore();
          });

          ctx.restore(); // End world transform

          // Ambient Falling Particles (Sakura, Snow, Stars) on screen
          MapRenderer.renderAmbientParticles(ctx, engine.ambientParticles);

          // Virtual Touch Joystick Visuals
          if (leftTouchRef.current) {
            ctx.save();
            const { startX, startY, currX, currY } = leftTouchRef.current;
            // Base ring
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(startX, startY, 48, 0, Math.PI * 2);
            ctx.stroke();

            // Knob
            ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(currX, currY, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          if (rightTouchRef.current) {
            ctx.save();
            const { startX, startY, currX, currY } = rightTouchRef.current;
            // Base ring
            ctx.strokeStyle = 'rgba(255, 46, 144, 0.4)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(startX, startY, 48, 0, Math.PI * 2);
            ctx.stroke();

            // Knob
            ctx.fillStyle = 'rgba(255, 46, 144, 0.8)';
            ctx.beginPath();
            ctx.arc(currX, currY, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          // Screen Shake restore
          ctx.restore();
        }
      }

      // Sync state to React HUD
      const localP = engine.getLocalPlayer();
      if (localP) {
        setHudState({
          hp: Math.round(localP.health),
          shield: Math.round(localP.shield),
          fuel: Math.round(localP.fuel),
          ammo: localP.currentAmmo[localP.activeWeaponIndex],
          maxAmmo: WEAPONS[localP.weapons[localP.activeWeaponIndex]].clipSize,
          reserveAmmo: localP.reserveAmmo[localP.activeWeaponIndex],
          isReloading: localP.isReloading,
          reloadProgress: localP.reloadProgress,
          ultimateCharge: Math.round(localP.ultimateCharge),
          isUltimateActive: localP.isUltimateActive,
          activeWeapon: localP.weapons[localP.activeWeaponIndex],
          secondaryWeapon: localP.weapons[localP.activeWeaponIndex === 0 ? 1 : 0],
          matchTime: Math.max(0, Math.round(engine.matchTimeRemaining)),
          matchOver: engine.matchOver,
          winnerName: engine.winnerId ? (engine.players.find(p => p.id === engine.winnerId)?.name || 'Player') : '',
          winnerChar: engine.winnerId ? (engine.players.find(p => p.id === engine.winnerId)?.characterId || 'aoi') : 'aoi',
          kills: localP.kills,
          deaths: localP.deaths,
          score: localP.score,
          isMuted: false,
          isPaused: engine.isPaused
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  // Touch handlers for virtual joysticks
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      if (x < rect.width * 0.45 && !leftTouchRef.current) {
        leftTouchRef.current = { id: touch.identifier, startX: x, startY: y, currX: x, currY: y };
      } else if (x > rect.width * 0.55 && !rightTouchRef.current) {
        rightTouchRef.current = { id: touch.identifier, startX: x, startY: y, currX: x, currY: y };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      if (leftTouchRef.current && leftTouchRef.current.id === touch.identifier) {
        leftTouchRef.current.currX = x;
        leftTouchRef.current.currY = y;
      }
      if (rightTouchRef.current && rightTouchRef.current.id === touch.identifier) {
        rightTouchRef.current.currX = x;
        rightTouchRef.current.currY = y;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (leftTouchRef.current && leftTouchRef.current.id === touch.identifier) {
        leftTouchRef.current = null;
      }
      if (rightTouchRef.current && rightTouchRef.current.id === touch.identifier) {
        rightTouchRef.current = null;
      }
    }
  };

  // Preset quick chat options
  const quickChatOptions = [
    'Iku zo! Follow me!',
    'Need backup at point!',
    'Nice shot, senpai!',
    'Hold your ground!',
    'GG! Good game!'
  ];

  const handleSendQuickChat = (text: string) => {
    const local = engine.getLocalPlayer();
    if (local) {
      engine.addComicText(text, local.x, local.y - 50, '#38BDF8', 1.3);
      setActiveChatBubble({ sender: local.name, text });
      setTimeout(() => setActiveChatBubble(null), 3000);
      soundSynth.playAnimeVoice('jump');
    }
    setShowQuickChat(false);
  };

  const localChar = CHARACTERS.find(c => c.id === (engine.getLocalPlayer()?.characterId || 'aoi')) || CHARACTERS[0];

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full bg-slate-950 overflow-hidden select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* 60 FPS Canvas Game Viewport */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block cursor-crosshair"
      />

      {/* TOP IN-GAME HUD */}
      <div className="absolute top-0 left-0 right-0 p-3 pointer-events-none flex items-start justify-between">
        
        {/* Left: Player Status (Health, Shield, Jetpack Fuel, Anime Portrait) */}
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-cyan-500/30 anime-box-glow">
          {/* Animated Chibi Portrait */}
          <div className="relative w-12 h-12 rounded-xl bg-slate-800 border-2 border-cyan-400 overflow-hidden flex items-center justify-center">
            <span className="text-xl font-bold text-cyan-300 pop-font">{localChar.name.charAt(0)}</span>
            {hudState.hp < 30 && (
              <span className="absolute inset-0 bg-red-500/30 animate-pulse" />
            )}
          </div>

          <div className="flex flex-col gap-1 w-36">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300 font-mono tracking-wider">{localChar.name.split(' ')[0]}</span>
              <span className="text-emerald-400 font-mono">{hudState.hp}/100</span>
            </div>

            {/* Health Bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-emerald-400 to-emerald-300 transition-all duration-100"
                style={{ width: `${hudState.hp}%` }}
              />
            </div>

            {/* Shield Bar */}
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-sky-300 transition-all duration-100"
                style={{ width: `${hudState.shield}%` }}
              />
            </div>

            {/* Jetpack Fuel Gauge */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
              <div className="flex-1 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-amber-400 transition-all duration-75"
                  style={{ width: `${hudState.fuel}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center: Match Timer & Scoreboard Banner */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-900/85 backdrop-blur-md px-5 py-1.5 rounded-full border border-amber-400/40 flex items-center gap-4 anime-skew">
            <div className="anime-unskew flex items-center gap-3 font-mono font-bold text-sm">
              <span className="text-cyan-400">KILLS: {hudState.kills}</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-300 text-base">
                {Math.floor(hudState.matchTime / 60)}:{(hudState.matchTime % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-pink-400">PTS: {hudState.score}</span>
            </div>
          </div>

          {/* Quick Chat Toast Bubble */}
          {activeChatBubble && (
            <div className="mt-2 bg-cyan-950/90 border border-cyan-400 px-4 py-1.5 rounded-xl text-cyan-200 text-xs font-bold animate-bounce shadow-lg">
              💬 {activeChatBubble.sender}: &quot;{activeChatBubble.text}&quot;
            </div>
          )}
        </div>

        {/* Right: Anime Kill Feed & Quick Controls */}
        <div className="flex flex-col items-end gap-2">
          {/* Top buttons (Pause, Mute, Settings) */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button 
              onClick={() => {
                const muted = !hudState.isMuted;
                setHudState(prev => ({ ...prev, isMuted: muted }));
                soundSynth.setMuted(muted);
              }}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white"
              title="Toggle Audio"
            >
              {hudState.isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            <button 
              onClick={() => setShowQuickChat(!showQuickChat)}
              className="p-2 rounded-xl bg-slate-900/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-950"
              title="Quick Chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            <button 
              onClick={() => {
                engine.isPaused = !engine.isPaused;
                setHudState(prev => ({ ...prev, isPaused: engine.isPaused }));
              }}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white"
              title="Pause"
            >
              {hudState.isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>

          {/* Killfeed Notifications */}
          <div className="flex flex-col gap-1 items-end pointer-events-none">
            {engine.killFeed.map((kf) => (
              <div 
                key={kf.id}
                className="bg-slate-900/85 border-l-2 border-amber-400 px-2.5 py-1 rounded text-[11px] font-mono text-slate-200 flex items-center gap-1.5 shadow-md animate-fade-in"
              >
                <span className="text-cyan-400 font-bold">{kf.killerName}</span>
                <span className="text-red-400 text-xs font-bold">[{kf.weapon.toUpperCase()}]</span>
                <span className="text-slate-400">{kf.victimName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK CHAT MODAL OVERLAY */}
      {showQuickChat && (
        <div className="absolute top-14 right-4 z-40 bg-slate-900/95 border border-cyan-400 p-3 rounded-2xl shadow-2xl flex flex-col gap-1.5 w-60">
          <div className="text-xs font-bold text-cyan-400 px-2 uppercase tracking-wider">Quick Anime Chat</div>
          {quickChatOptions.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSendQuickChat(opt)}
              className="text-left px-3 py-1.5 text-xs text-slate-200 hover:bg-cyan-950/80 hover:text-cyan-300 rounded-lg transition-colors border border-transparent hover:border-cyan-500/30"
            >
              💬 {opt}
            </button>
          ))}
        </div>
      )}

      {/* ULTIMATE MOVE CUT-IN CINEMATIC BANNER */}
      {engine.ultimateBanner.active && (
        <div className="absolute inset-x-0 top-1/3 -translate-y-1/2 z-50 pointer-events-none flex items-center justify-center">
          <div className="w-full bg-gradient-to-r from-transparent via-red-600/90 to-transparent py-4 transform -skew-y-3 flex items-center justify-center gap-6 shadow-[0_0_50px_rgba(255,46,144,0.8)] border-y-2 border-amber-300 animate-pulse">
            <div className="text-center">
              <div className="text-xs font-black tracking-widest text-amber-200 uppercase font-mono">★ ULTIMATE AWAKENING ★</div>
              <div className="text-4xl md:text-5xl font-black text-white italic tracking-wider comic-text">
                {engine.ultimateBanner.name}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM ACTION CONTROLS & WEAPON SLOTS */}
      <div className="absolute bottom-4 inset-x-4 pointer-events-none flex items-end justify-between">
        
        {/* Left Side Hint: Movement Joystick */}
        <div className="text-slate-500 text-xs font-mono hidden md:block bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <div><span className="text-cyan-400 font-bold">W / SPACE</span>: Jetpack Boost</div>
          <div><span className="text-cyan-400 font-bold">A / D</span>: Strafe Left / Right</div>
        </div>

        {/* Center: Weapons, Ammo, Reload, Grenade & Ultimate Hub */}
        <div className="flex items-center gap-3 pointer-events-auto">
          
          {/* Tactical Grenade Button */}
          <button
            onClick={() => {
              const p = engine.getLocalPlayer();
              if (p) engine.throwGrenade(p);
            }}
            className="w-13 h-13 rounded-2xl bg-slate-900/90 border-2 border-emerald-500/60 text-emerald-400 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform hover:bg-emerald-950/40"
            title="Throw Grenade [G]"
          >
            <Bomb className="w-5 h-5" />
            <span className="text-[9px] font-bold font-mono">G</span>
          </button>

          {/* Melee Strike Button */}
          <button
            onClick={() => {
              const p = engine.getLocalPlayer();
              if (p) engine.meleeStrike(p);
            }}
            className="w-13 h-13 rounded-2xl bg-slate-900/90 border-2 border-amber-500/60 text-amber-400 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform hover:bg-amber-950/40"
            title="Melee Punch [F]"
          >
            <span className="text-base font-black">👊</span>
            <span className="text-[9px] font-bold font-mono">F</span>
          </button>

          {/* Weapon Slot & Ammo Display */}
          <div className="bg-slate-900/90 border-2 border-cyan-500/60 rounded-2xl px-4 py-2.5 flex items-center gap-4 shadow-xl anime-box-glow">
            <div className="flex flex-col">
              <span className="text-[10px] text-cyan-400 uppercase font-mono font-bold tracking-wider">
                {WEAPONS[hudState.activeWeapon].name}
              </span>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-2xl font-black text-white">{hudState.ammo}</span>
                <span className="text-slate-400 text-xs">/ {hudState.reserveAmmo}</span>
              </div>
            </div>

            {/* Reload Button */}
            <button
              onClick={() => {
                const p = engine.getLocalPlayer();
                if (p) engine.reloadWeapon(p);
              }}
              disabled={hudState.isReloading}
              className={`p-2.5 rounded-xl border flex items-center justify-center active:scale-90 transition-transform ${
                hudState.isReloading 
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-spin' 
                  : 'bg-slate-800 border-slate-600 text-slate-200 hover:border-cyan-400'
              }`}
              title="Reload [R]"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Switch Weapon Slot Button */}
            <button
              onClick={() => {
                const p = engine.getLocalPlayer();
                if (p) engine.switchWeapon(p);
              }}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-600 text-slate-200 hover:border-pink-400 flex items-center justify-center active:scale-90 transition-transform"
              title="Switch Weapon [Q]"
            >
              <ArrowRightLeft className="w-5 h-5 text-pink-400" />
            </button>
          </div>

          {/* Character Signature Ultimate Button */}
          <button
            onClick={() => {
              const p = engine.getLocalPlayer();
              if (p) engine.activateUltimate(p);
            }}
            disabled={hudState.ultimateCharge < 100}
            className={`w-15 h-15 rounded-2xl flex flex-col items-center justify-center font-bold shadow-2xl transition-all duration-200 active:scale-90 ${
              hudState.ultimateCharge >= 100
                ? 'bg-gradient-to-tr from-amber-500 via-pink-500 to-cyan-400 text-white animate-bounce border-2 border-white anime-box-glow-pink cursor-pointer'
                : 'bg-slate-900/80 border-2 border-slate-700 text-slate-500 cursor-not-allowed'
            }`}
            title="Signature Ultimate [E]"
          >
            <Sparkles className="w-6 h-6" />
            <span className="text-[10px] font-mono tracking-tighter">
              {hudState.ultimateCharge >= 100 ? 'READY!' : `${hudState.ultimateCharge}%`}
            </span>
          </button>
        </div>

        {/* Right Side Hint: Aim & Fire */}
        <div className="text-slate-500 text-xs font-mono hidden md:block bg-slate-900/60 p-2 rounded-lg border border-slate-800 text-right">
          <div><span className="text-pink-400 font-bold">MOUSE AIM</span>: 360° Angle</div>
          <div><span className="text-pink-400 font-bold">LEFT CLICK</span>: Fire Weapon</div>
        </div>
      </div>

      {/* END OF MATCH VICTORY / DEFEAT MODAL */}
      {hudState.matchOver && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 p-8 rounded-3xl max-w-md w-full text-center shadow-[0_0_60px_rgba(251,191,36,0.3)] relative anime-box-glow">
            <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-3 animate-bounce" />
            <h2 className="text-4xl font-black text-amber-300 uppercase tracking-wider comic-text mb-1">
              MATCH COMPLETE!
            </h2>
            <p className="text-slate-300 text-sm mb-6 font-mono">
              MVP Champion: <span className="text-cyan-400 font-bold">{hudState.winnerName}</span>
            </p>

            {/* Match Stats */}
            <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 font-mono">
              <div>
                <div className="text-xs text-slate-400">ELIMINATIONS</div>
                <div className="text-2xl font-bold text-cyan-400">{hudState.kills}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">DEATHS</div>
                <div className="text-2xl font-bold text-red-400">{hudState.deaths}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">FINAL SCORE</div>
                <div className="text-2xl font-bold text-amber-400">{hudState.score}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  engine.startMatch(localChar.id, engine.getLocalPlayer()?.name || 'Commander Ace');
                  confetti({ particleCount: 80, spread: 60 });
                }}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Play Again
              </button>
              <button
                onClick={onExitToMenu}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors"
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAUSE MODAL */}
      {hudState.isPaused && !hudState.matchOver && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl max-w-xs w-full text-center flex flex-col gap-3">
            <h3 className="text-2xl font-bold text-white tracking-wider font-mono">GAME PAUSED</h3>
            <button
              onClick={() => {
                engine.isPaused = false;
                setHudState(prev => ({ ...prev, isPaused: false }));
              }}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl"
            >
              Resume Game
            </button>
            <button
              onClick={onOpenSettings}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl"
            >
              Settings & Controls
            </button>
            <button
              onClick={onExitToMenu}
              className="w-full py-2.5 bg-red-950/40 border border-red-500/30 hover:bg-red-900/60 text-red-200 font-bold rounded-xl"
            >
              Quit to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
