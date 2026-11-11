import { 
  PlayerState, 
  Projectile, 
  Pickup, 
  Platform, 
  Particle, 
  ComicText, 
  KillEvent, 
  MapTheme, 
  CharacterId, 
  WeaponType, 
  GameSettings 
} from '../../types/game';
import { CHARACTERS, WEAPONS, MAP_THEMES } from '../../data/charactersAndWeapons';
import { soundSynth } from '../audio/soundSynth';

export class GameEngine {
  public players: PlayerState[] = [];
  public localPlayerId: string = 'p_local';
  public projectiles: Projectile[] = [];
  public pickups: Pickup[] = [];
  public platforms: Platform[] = [];
  public particles: Particle[] = [];
  public ambientParticles: Particle[] = [];
  public comicTexts: ComicText[] = [];
  public killFeed: KillEvent[] = [];
  
  public mapTheme: MapTheme = MAP_THEMES.tokyo;
  public mapWidth: number = 2400;
  public mapHeight: number = 1400;

  public cameraX: number = 0;
  public cameraY: number = 0;
  public screenShake: number = 0;
  public screenShakeDecay: number = 0.9;

  public gameTime: number = 0;
  public timeDilation: number = 1.0; // Slow-mo during ultimate cut-ins
  public ultimateBanner: { active: boolean; char: CharacterId; name: string; timer: number } = {
    active: false,
    char: 'aoi',
    name: '',
    timer: 0
  };

  public isPaused: boolean = false;
  public matchTimeRemaining: number = 300; // 5 min match
  public matchOver: boolean = false;
  public winnerId: string | null = null;

  public settings: GameSettings = {
    quality: 'high',
    joystickSize: 100,
    joystickOpacity: 0.75,
    soundVolume: 0.8,
    musicVolume: 0.5,
    haptics: true,
    screenShake: true,
    showMinimap: true,
    showDamageNumbers: true,
    botDifficulty: 'medium'
  };

  constructor() {
    this.initMap('tokyo');
  }

  // Initialize Map Platforms and Pickups
  public initMap(themeId: string) {
    this.mapTheme = MAP_THEMES[themeId] || MAP_THEMES.tokyo;
    this.platforms = [
      // Ground floor
      { x: 100, y: 1250, w: 2200, h: 80, type: 'solid' },
      
      // Tier 1 platforms
      { x: 250, y: 1050, w: 380, h: 26 },
      { x: 800, y: 1000, w: 420, h: 26 },
      { x: 1400, y: 1020, w: 380, h: 26 },
      { x: 1950, y: 1060, w: 350, h: 26 },

      // Tier 2 high platforms
      { x: 450, y: 780, w: 320, h: 26 },
      { x: 1050, y: 720, w: 400, h: 26 },
      { x: 1650, y: 760, w: 340, h: 26 },

      // Sky platforms / sniper perches
      { x: 200, y: 520, w: 240, h: 24 },
      { x: 850, y: 460, w: 320, h: 24 },
      { x: 1450, y: 480, w: 300, h: 24 },
      { x: 1950, y: 540, w: 260, h: 24 },

      // Center floating shrine / control point
      { x: 1050, y: 280, w: 300, h: 28 }
    ];

    // Pickups spawned at strategic vantage points
    this.pickups = [
      { id: 'pick_hp_1', x: 350, y: 1010, type: 'health', amount: 50, radius: 16, respawnTime: 0 },
      { id: 'pick_hp_2', x: 1800, y: 980, type: 'health', amount: 50, radius: 16, respawnTime: 0 },
      { id: 'pick_sh_1', x: 1000, y: 960, type: 'shield', amount: 50, radius: 16, respawnTime: 0 },
      { id: 'pick_sh_2', x: 600, y: 740, type: 'shield', amount: 50, radius: 16, respawnTime: 0 },
      { id: 'pick_am_1', x: 1550, y: 720, type: 'ammo', amount: 80, radius: 16, respawnTime: 0 },
      { id: 'pick_am_2', x: 1200, y: 1210, type: 'ammo', amount: 80, radius: 16, respawnTime: 0 },
      { id: 'pick_ult_1', x: 1200, y: 240, type: 'ultimate', amount: 40, radius: 18, respawnTime: 0 }
    ];

    // Seed ambient particles
    this.ambientParticles = [];
    const count = this.settings.quality === 'high' ? 45 : (this.settings.quality === 'medium' ? 25 : 12);
    for (let i = 0; i < count; i++) {
      this.spawnAmbientParticle(true);
    }
  }

  // Spawn ambient theme particle
  private spawnAmbientParticle(initial: boolean = false) {
    const pType = this.mapTheme.ambientParticle;
    const x = Math.random() * this.mapWidth;
    const y = initial ? Math.random() * this.mapHeight : -20;
    
    let vx = (Math.random() - 0.5) * 40;
    let vy = 40 + Math.random() * 60;
    let color = '#FFFFFF';

    if (pType === 'sakura') {
      vx = 30 + Math.random() * 50;
      vy = 50 + Math.random() * 40;
      color = '#FB7185';
    } else if (pType === 'speedlines') {
      vx = -120 - Math.random() * 100;
      vy = 20;
      color = '#00F0FF';
    } else if (pType === 'stars') {
      vx = 0;
      vy = -15 - Math.random() * 20;
      color = '#A855F7';
    }

    this.ambientParticles.push({
      x,
      y,
      vx,
      vy,
      color,
      size: pType === 'sakura' ? 4 + Math.random() * 3 : 2 + Math.random() * 2,
      life: 1,
      maxLife: 15 + Math.random() * 10,
      type: pType === 'sakura' ? 'sakura' : (pType === 'snow' ? 'snow' : 'star'),
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 2
    });
  }

  // Setup match with player and AI bots
  public startMatch(
    playerChar: CharacterId = 'aoi',
    playerName: string = 'Commander Ace',
    botCount: number = 5,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ) {
    this.settings.botDifficulty = difficulty;
    this.matchTimeRemaining = 300;
    this.matchOver = false;
    this.winnerId = null;
    this.killFeed = [];
    this.projectiles = [];
    this.particles = [];
    this.comicTexts = [];
    this.players = [];

    // Local human player
    const localCharDef = CHARACTERS.find(c => c.id === playerChar) || CHARACTERS[0];
    const localPlayer: PlayerState = {
      id: this.localPlayerId,
      name: playerName,
      characterId: playerChar,
      skinIndex: 0,
      isBot: false,
      team: 'blue',
      x: 300,
      y: 900,
      vx: 0,
      vy: 0,
      aimAngle: 0,
      facingLeft: false,
      health: 100,
      maxHealth: 100,
      shield: 100,
      maxShield: 100,
      fuel: 100,
      maxFuel: 100,
      isJetpacking: false,
      isGrounded: false,
      isCrouching: false,
      weapons: ['rifle', 'pistol'],
      activeWeaponIndex: 0,
      currentAmmo: [WEAPONS.rifle.clipSize, WEAPONS.pistol.clipSize],
      reserveAmmo: [140, 80],
      isReloading: false,
      reloadProgress: 0,
      lastShotTime: 0,
      ultimateCharge: 40,
      isUltimateActive: false,
      ultimateTimer: 0,
      kills: 0,
      deaths: 0,
      score: 0,
      killStreak: 0,
      expression: 'normal',
      hurtTimer: 0,
      isDead: false,
      respawnTimer: 0,
      ragdollRotation: 0,
      ragdollAngularVel: 0
    };
    this.players.push(localPlayer);

    // Spawn AI Bots from the roster of other anime characters
    const botChars = CHARACTERS.filter(c => c.id !== playerChar);
    for (let i = 0; i < botCount; i++) {
      const charDef = botChars[i % botChars.length];
      const botWeapons: [WeaponType, WeaponType] = [
        (['rifle', 'smg', 'shotgun', 'sniper', 'rocket', 'flamethrower', 'minigun'] as WeaponType[])[i % 7],
        'pistol'
      ];

      const botPlayer: PlayerState = {
        id: `bot_${i + 1}`,
        name: `[BOT] ${charDef.name}`,
        characterId: charDef.id,
        skinIndex: 0,
        isBot: true,
        team: i % 2 === 0 ? 'red' : 'free',
        x: 600 + i * 320,
        y: 800 - (i % 3) * 180,
        vx: 0,
        vy: 0,
        aimAngle: Math.PI,
        facingLeft: true,
        health: 100,
        maxHealth: 100,
        shield: 100,
        maxShield: 100,
        fuel: 100,
        maxFuel: 100,
        isJetpacking: false,
        isGrounded: false,
        isCrouching: false,
        weapons: botWeapons,
        activeWeaponIndex: 0,
        currentAmmo: [WEAPONS[botWeapons[0]].clipSize, WEAPONS[botWeapons[1]].clipSize],
        reserveAmmo: [120, 60],
        isReloading: false,
        reloadProgress: 0,
        lastShotTime: 0,
        ultimateCharge: 20,
        isUltimateActive: false,
        ultimateTimer: 0,
        kills: 0,
        deaths: 0,
        score: 0,
        killStreak: 0,
        expression: 'normal',
        hurtTimer: 0,
        isDead: false,
        respawnTimer: 0,
        ragdollRotation: 0,
        ragdollAngularVel: 0
      };
      this.players.push(botPlayer);
    }

    // Trigger match start banner
    this.addComicText('READY... FIGHT!', this.players[0].x, this.players[0].y - 80, '#FBBF24', 2.2);
    soundSynth.playAnimeVoice('victory');
    soundSynth.startBGM();
  }

  // Main 60 FPS Engine Tick
  public update(dt: number) {
    if (this.isPaused || this.matchOver) return;

    // Apply slow-motion time dilation if ultimate cinematic cut-in active
    const effectiveDt = dt * this.timeDilation;
    this.gameTime += effectiveDt;

    // Ultimate Cut-in Banner Timer
    if (this.ultimateBanner.active) {
      this.ultimateBanner.timer -= dt;
      if (this.ultimateBanner.timer <= 0) {
        this.ultimateBanner.active = false;
        this.timeDilation = 1.0;
      }
    }

    // Match Countdown Timer
    this.matchTimeRemaining -= dt;
    if (this.matchTimeRemaining <= 0) {
      this.matchTimeRemaining = 0;
      this.matchOver = true;
      this.determineWinner();
    }

    // Screen Shake decay
    if (this.screenShake > 0) {
      this.screenShake *= Math.pow(this.screenShakeDecay, dt * 60);
      if (this.screenShake < 0.2) this.screenShake = 0;
    }

    // 1. Update Players (Physics, Jetpack, Weapons, AI)
    this.players.forEach(p => {
      this.updatePlayer(p, effectiveDt);
      if (p.isBot && !p.isDead) {
        this.updateBotAI(p, effectiveDt);
      }
    });

    // 2. Update Projectiles
    this.updateProjectiles(effectiveDt);

    // 3. Update Pickups
    this.updatePickups(effectiveDt);

    // 4. Update Particles & Comic Texts
    this.updateParticles(effectiveDt);
    this.updateComicTexts(effectiveDt);

    // 5. Update Ambient Map Particles
    this.updateAmbientParticles(effectiveDt);

    // 6. Center Camera on Local Player with smooth interpolation
    const local = this.getLocalPlayer();
    if (local) {
      const targetCamX = local.x;
      const targetCamY = local.y - 40;
      this.cameraX += (targetCamX - this.cameraX) * 0.12;
      this.cameraY += (targetCamY - this.cameraY) * 0.12;
    }
  }

  // Update Individual Player Physics & Jetpack
  private updatePlayer(p: PlayerState, dt: number) {
    if (p.isDead) {
      // Ragdoll physics
      p.vy += 900 * dt; // gravity
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.95;
      p.ragdollRotation += p.ragdollAngularVel * dt;

      // Check ground collision for ragdoll
      this.platforms.forEach(plat => {
        if (p.x >= plat.x && p.x <= plat.x + plat.w && p.y >= plat.y && p.y <= plat.y + 20) {
          p.y = plat.y;
          p.vy = -p.vy * 0.3; // bounce
          p.ragdollAngularVel *= 0.6;
        }
      });

      // Respawn timer
      p.respawnTimer -= dt;
      if (p.respawnTimer <= 0) {
        this.respawnPlayer(p);
      }
      return;
    }

    // Hurt timer decay
    if (p.hurtTimer > 0) {
      p.hurtTimer -= dt;
      if (p.hurtTimer <= 0) p.expression = 'normal';
    }

    // Ultimate timer decay
    if (p.isUltimateActive) {
      p.ultimateTimer -= dt;
      if (p.ultimateTimer <= 0) {
        p.isUltimateActive = false;
        p.expression = 'normal';
      }
    }

    // Jetpack Thrust Physics
    const charDef = CHARACTERS.find(c => c.id === p.characterId) || CHARACTERS[0];
    const jetpackThrust = 1600 * (charDef.stats.jetpack / 85);
    const gravity = 850;

    if (p.isJetpacking && p.fuel > 0) {
      p.vy -= jetpackThrust * dt;
      if (!p.isUltimateActive) { // Infinite fuel during ultimate
        p.fuel = Math.max(0, p.fuel - 35 * dt);
      }
      // Sound and particle emissions
      if (Math.random() < 0.4 && p.id === this.localPlayerId) {
        soundSynth.playJetpack();
      }
      this.spawnJetpackParticle(p);
    } else {
      // Gravity pulls down
      p.vy += gravity * dt;
      // Refill fuel gradually when not thrusting
      if (p.fuel < p.maxFuel) {
        p.fuel = Math.min(p.maxFuel, p.fuel + (p.isGrounded ? 45 : 20) * dt);
      }
    }

    // Terminal velocity clamping
    p.vy = Math.max(-650, Math.min(750, p.vy));
    p.vx = Math.max(-450, Math.min(450, p.vx));

    // Move player
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Platform & Floor Collisions
    p.isGrounded = false;
    const playerHalfW = 12;
    const playerFeetY = p.y + 22;

    this.platforms.forEach(plat => {
      // Horizontal bounds check
      if (p.x + playerHalfW >= plat.x && p.x - playerHalfW <= plat.x + plat.w) {
        // Landing on top of platform
        if (p.vy >= 0 && playerFeetY >= plat.y && playerFeetY - p.vy * dt <= plat.y + 16) {
          p.y = plat.y - 22;
          p.vy = 0;
          p.isGrounded = true;
        }
      }
    });

    // Map Boundaries
    if (p.x < 120) { p.x = 120; p.vx = 0; }
    if (p.x > this.mapWidth - 120) { p.x = this.mapWidth - 120; p.vx = 0; }

    // Natural Ground / Air Friction
    p.vx *= p.isGrounded ? 0.85 : 0.94;

    // Shield passive regeneration after delay
    if (p.shield < p.maxShield && p.hurtTimer <= 0) {
      p.shield = Math.min(p.maxShield, p.shield + 12 * dt);
    }

    // Weapon Reload logic
    if (p.isReloading) {
      const activeWp = WEAPONS[p.weapons[p.activeWeaponIndex]];
      p.reloadProgress += dt / activeWp.reloadTime;
      if (p.reloadProgress >= 1.0) {
        p.isReloading = false;
        p.reloadProgress = 0;
        // Refill clip from reserve
        const ammoNeeded = activeWp.clipSize - p.currentAmmo[p.activeWeaponIndex];
        const ammoToLoad = Math.min(ammoNeeded, p.reserveAmmo[p.activeWeaponIndex]);
        p.currentAmmo[p.activeWeaponIndex] += ammoToLoad;
        p.reserveAmmo[p.activeWeaponIndex] -= ammoToLoad;
      }
    }
  }

  // Update Bot AI state machine
  private updateBotAI(bot: PlayerState, dt: number) {
    const targets = this.players.filter(other => other.id !== bot.id && !other.isDead && (bot.team === 'free' || other.team !== bot.team));
    if (targets.length === 0) return;

    // Find closest target
    let nearest = targets[0];
    let minDist = 999999;
    targets.forEach(t => {
      const dist = Math.hypot(t.x - bot.x, t.y - bot.y);
      if (dist < minDist) {
        minDist = dist;
        nearest = t;
      }
    });

    // Calculate aim angle with predictive leading based on difficulty
    const targetLeadFactor = this.settings.botDifficulty === 'hard' ? 0.25 : (this.settings.botDifficulty === 'medium' ? 0.12 : 0);
    const targetX = nearest.x + nearest.vx * targetLeadFactor;
    const targetY = nearest.y + nearest.vy * targetLeadFactor;

    const dx = targetX - bot.x;
    const dy = targetY - bot.y;
    bot.aimAngle = Math.atan2(dy, dx);
    bot.facingLeft = dx < 0;

    // Movement Decision
    const desiredDist = 280;
    const charDef = CHARACTERS.find(c => c.id === bot.characterId) || CHARACTERS[0];
    const moveSpeed = 240 * (charDef.stats.speed / 85);

    if (minDist > desiredDist + 50) {
      bot.vx += (dx > 0 ? moveSpeed : -moveSpeed) * dt * 4;
    } else if (minDist < desiredDist - 80) {
      bot.vx += (dx > 0 ? -moveSpeed : moveSpeed) * dt * 4; // Back up
    }

    // Jetpack Decision: Hover if target is above or to evade
    if (nearest.y < bot.y - 40 && bot.fuel > 25) {
      bot.isJetpacking = true;
    } else if (bot.fuel < 20 || bot.y < 400) {
      bot.isJetpacking = false;
    }

    // Firing Decision
    if (minDist < 600 && Math.abs(dy) < 300) {
      this.fireWeapon(bot);
    }

    // Ultimate Decision: Use when full
    if (bot.ultimateCharge >= 100 && !bot.isUltimateActive && minDist < 400) {
      this.activateUltimate(bot);
    }
  }

  // Fire active weapon for player
  public fireWeapon(p: PlayerState): boolean {
    if (p.isDead || p.isReloading) return false;

    const activeWpType = p.weapons[p.activeWeaponIndex];
    const weaponDef = WEAPONS[activeWpType];
    const now = Date.now();

    // Check Fire Rate cooldown
    const cooldownMs = (1 / weaponDef.fireRate) * 1000;
    if (now - p.lastShotTime < cooldownMs) return false;

    // Check Ammo
    if (p.currentAmmo[p.activeWeaponIndex] <= 0) {
      this.reloadWeapon(p);
      return false;
    }

    // Deduct ammo & update shot time
    p.currentAmmo[p.activeWeaponIndex]--;
    p.lastShotTime = now;

    // Recoil knockback
    const recoilDirX = Math.cos(p.aimAngle + Math.PI);
    const recoilDirY = Math.sin(p.aimAngle + Math.PI);
    p.vx += recoilDirX * weaponDef.recoil * 12;
    p.vy += recoilDirY * weaponDef.recoil * 6;

    // Barrel spawn coordinates
    const barrelLength = weaponDef.barrelLength + 8;
    const spawnX = p.x + Math.cos(p.aimAngle) * barrelLength;
    const spawnY = p.y - 4 + Math.sin(p.aimAngle) * barrelLength;

    // Spawn Projectiles
    const shotCount = weaponDef.burstCount || 1;
    for (let i = 0; i < shotCount; i++) {
      const spreadAngle = p.aimAngle + (Math.random() - 0.5) * weaponDef.spread;
      const speed = weaponDef.bulletSpeed * (0.95 + Math.random() * 0.1);

      this.projectiles.push({
        id: `proj_${now}_${Math.random()}`,
        ownerId: p.id,
        x: spawnX,
        y: spawnY,
        vx: Math.cos(spreadAngle) * speed,
        vy: Math.sin(spreadAngle) * speed,
        damage: weaponDef.damage,
        color: weaponDef.bulletColor,
        radius: activeWpType === 'rocket' ? 6 : (activeWpType === 'sniper' ? 3 : 4),
        lifetime: 0,
        maxLifetime: activeWpType === 'flamethrower' ? 0.45 : (activeWpType === 'shotgun' ? 0.6 : 2.5),
        isRocket: activeWpType === 'rocket',
        isFlame: activeWpType === 'flamethrower'
      });
    }

    // Audio SFX
    if (p.id === this.localPlayerId) {
      soundSynth.playShoot(activeWpType);
      if (this.settings.screenShake && weaponDef.recoil > 10) {
        this.screenShake = weaponDef.recoil * 0.4;
      }
    }

    return true;
  }

  // Reload current weapon
  public reloadWeapon(p: PlayerState) {
    if (p.isReloading || p.isDead) return;
    const activeWp = WEAPONS[p.weapons[p.activeWeaponIndex]];
    if (p.currentAmmo[p.activeWeaponIndex] >= activeWp.clipSize) return;
    if (p.reserveAmmo[p.activeWeaponIndex] <= 0) return;

    p.isReloading = true;
    p.reloadProgress = 0;
  }

  // Switch between Weapon Slot 1 & 2
  public switchWeapon(p: PlayerState) {
    if (p.isDead) return;
    p.isReloading = false;
    p.reloadProgress = 0;
    p.activeWeaponIndex = p.activeWeaponIndex === 0 ? 1 : 0;
  }

  // Throw Tactical Grenade
  public throwGrenade(p: PlayerState) {
    if (p.isDead) return;
    const throwSpeed = 620;
    const barrelX = p.x + Math.cos(p.aimAngle) * 20;
    const barrelY = p.y - 10 + Math.sin(p.aimAngle) * 20;

    this.projectiles.push({
      id: `grenade_${Date.now()}_${Math.random()}`,
      ownerId: p.id,
      x: barrelX,
      y: barrelY,
      vx: Math.cos(p.aimAngle) * throwSpeed + p.vx * 0.5,
      vy: Math.sin(p.aimAngle) * throwSpeed + p.vy * 0.5 - 120, // upward arc
      damage: 110,
      color: '#10B981',
      radius: 7,
      lifetime: 0,
      maxLifetime: 1.8, // fuse timer
      isGrenade: true,
      bounce: 0.55
    });

    if (p.id === this.localPlayerId) {
      soundSynth.playShoot('grenade');
    }
  }

  // Melee Kick / Punch Strike
  public meleeStrike(p: PlayerState) {
    if (p.isDead) return;
    const meleeRange = 55;
    const strikeX = p.x + (p.facingLeft ? -meleeRange : meleeRange);
    const strikeY = p.y;

    // Anime punch flash effect
    this.addComicText('BASH!', strikeX, strikeY - 20, '#F59E0B', 1.4);

    this.players.forEach(other => {
      if (other.id !== p.id && !other.isDead && (p.team === 'free' || other.team !== p.team)) {
        const dist = Math.hypot(other.x - strikeX, other.y - strikeY);
        if (dist < 45) {
          this.applyDamage(other, 45, p, 'melee');
          // High knockback
          other.vx = (p.facingLeft ? -450 : 450);
          other.vy = -280;
          soundSynth.playHitMarker();
        }
      }
    });
  }

  // Activate Character Signature Ultimate Move
  public activateUltimate(p: PlayerState) {
    if (p.isDead || p.ultimateCharge < 100 || p.isUltimateActive) return;

    const charDef = CHARACTERS.find(c => c.id === p.characterId) || CHARACTERS[0];
    p.ultimateCharge = 0;
    p.isUltimateActive = true;
    p.ultimateTimer = 6.0;
    p.expression = 'determined';

    // Cinematic Anime Cut-in Banner
    this.ultimateBanner = {
      active: true,
      char: charDef.id,
      name: charDef.ultimate.name,
      timer: 0.95
    };
    this.timeDilation = 0.25; // Dramatic Slow-motion

    this.addComicText(charDef.ultimate.name.toUpperCase(), p.x, p.y - 70, charDef.ultimate.color, 2.0);
    this.screenShake = 16;
    soundSynth.playUltimateActivate();
    soundSynth.playAnimeVoice('ultimate');

    // Super ability blast according to character
    if (p.characterId === 'ren') { // Phantom Laser
      for (let i = -3; i <= 3; i++) {
        const angle = p.aimAngle + i * 0.05;
        this.projectiles.push({
          id: `ult_laser_${Date.now()}_${i}`,
          ownerId: p.id,
          x: p.x,
          y: p.y - 10,
          vx: Math.cos(angle) * 1600,
          vy: Math.sin(angle) * 1600,
          damage: 120,
          color: '#EF4444',
          radius: 6,
          lifetime: 0,
          maxLifetime: 1.5
        });
      }
    } else if (p.characterId === 'ryuko') { // Meteor Shockwave
      this.addComicText('METEOR!', p.x, p.y, '#FF2E55', 2.5);
      this.triggerExplosion(p.x, p.y, 220, 150, p);
    } else if (p.characterId === 'lumiere') { // Aegis Sanctuary
      p.health = p.maxHealth;
      p.shield = p.maxShield;
    }
  }

  // Update Projectiles & Check Player / Platform Hits
  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.lifetime += dt;

      // Grenade bounce physics
      if (proj.isGrenade) {
        proj.vy += 850 * dt; // gravity
        proj.x += proj.vx * dt;
        proj.y += proj.vy * dt;

        this.platforms.forEach(plat => {
          if (proj.x >= plat.x && proj.x <= plat.x + plat.w && proj.y >= plat.y && proj.y <= plat.y + 16) {
            proj.y = plat.y - 1;
            proj.vy = -proj.vy * (proj.bounce || 0.5);
            proj.vx *= 0.8;
          }
        });

        if (proj.lifetime >= proj.maxLifetime) {
          const owner = this.players.find(p => p.id === proj.ownerId);
          this.triggerExplosion(proj.x, proj.y, 140, proj.damage, owner);
          this.projectiles.splice(i, 1);
          continue;
        }
      } else {
        // Bullet or Rocket
        proj.x += proj.vx * dt;
        proj.y += proj.vy * dt;

        // Trail particles
        if (Math.random() < 0.35) {
          this.particles.push({
            x: proj.x,
            y: proj.y,
            vx: -proj.vx * 0.05,
            vy: -proj.vy * 0.05,
            color: proj.color,
            size: proj.radius * 0.7,
            life: 0.2,
            maxLife: 0.2,
            type: 'spark'
          });
        }

        // Platform Collision
        let hitPlatform = false;
        this.platforms.forEach(plat => {
          if (proj.x >= plat.x && proj.x <= plat.x + plat.w && proj.y >= plat.y && proj.y <= plat.y + plat.h) {
            hitPlatform = true;
          }
        });

        if (hitPlatform) {
          if (proj.isRocket) {
            const owner = this.players.find(p => p.id === proj.ownerId);
            this.triggerExplosion(proj.x, proj.y, 130, proj.damage, owner);
          } else {
            this.spawnImpactSparks(proj.x, proj.y, proj.color);
          }
          this.projectiles.splice(i, 1);
          continue;
        }

        // Player Collision check
        let hitPlayer: PlayerState | null = null;
        for (const player of this.players) {
          if (player.id !== proj.ownerId && !player.isDead) {
            const dist = Math.hypot(player.x - proj.x, player.y - proj.y);
            if (dist < 24) {
              hitPlayer = player;
              break;
            }
          }
        }

        if (hitPlayer) {
          const shooter = this.players.find(p => p.id === proj.ownerId);
          if (proj.isRocket) {
            this.triggerExplosion(proj.x, proj.y, 130, proj.damage, shooter);
          } else {
            this.applyDamage(hitPlayer, proj.damage, shooter, 'rifle');
            this.spawnImpactSparks(proj.x, proj.y, proj.color);
            if (shooter?.id === this.localPlayerId) {
              soundSynth.playHitMarker();
            }
          }
          this.projectiles.splice(i, 1);
          continue;
        }

        // Expiry check
        if (proj.lifetime >= proj.maxLifetime) {
          this.projectiles.splice(i, 1);
        }
      }
    }
  }

  // Trigger Anime Explosion with comic BOOM and screen shake
  public triggerExplosion(x: number, y: number, radius: number, maxDamage: number, attacker?: PlayerState) {
    this.addComicText('BOOM!!', x, y - 30, '#F97316', 2.0);
    this.screenShake = Math.max(this.screenShake, 14);
    soundSynth.playExplosion();

    // Spawn explosion particles & shockwave
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      color: '#FFFFFF',
      size: 10,
      life: 0.35,
      maxLife: 0.35,
      type: 'shockwave'
    });

    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 100 + Math.random() * 260;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? '#F97316' : '#FDE047',
        size: 5 + Math.random() * 6,
        life: 0.45,
        maxLife: 0.45,
        type: 'flame'
      });
    }

    // Splash damage to all nearby players
    this.players.forEach(p => {
      if (!p.isDead) {
        const dist = Math.hypot(p.x - x, p.y - y);
        if (dist <= radius) {
          const falloff = 1 - dist / radius;
          const dmg = Math.round(maxDamage * falloff);
          this.applyDamage(p, dmg, attacker, 'rocket');
          // Explosion knockback impulse
          const knockAngle = Math.atan2(p.y - y, p.x - x);
          p.vx += Math.cos(knockAngle) * 550 * falloff;
          p.vy += Math.sin(knockAngle) * 450 * falloff - 120;
        }
      }
    });
  }

  // Apply Damage, Shields and Deaths
  public applyDamage(
    victim: PlayerState, 
    rawDamage: number, 
    attacker?: PlayerState, 
    weaponType: WeaponType | 'grenade' | 'melee' | 'ultimate' = 'rifle'
  ) {
    if (victim.isDead) return;

    victim.expression = 'hurt';
    victim.hurtTimer = 0.35;

    // Shield absorbs damage first
    let remainingDmg = rawDamage;
    if (victim.shield > 0) {
      if (victim.shield >= remainingDmg) {
        victim.shield -= remainingDmg;
        remainingDmg = 0;
      } else {
        remainingDmg -= victim.shield;
        victim.shield = 0;
      }
    }

    victim.health = Math.max(0, victim.health - remainingDmg);

    // Charge attacker ultimate on dealing damage
    if (attacker && attacker.id !== victim.id) {
      attacker.ultimateCharge = Math.min(100, attacker.ultimateCharge + rawDamage * 0.3);
      if (attacker.ultimateCharge >= 100 && attacker.id === this.localPlayerId) {
        soundSynth.playUltimateReady();
      }
    }

    // Death check
    if (victim.health <= 0) {
      this.handlePlayerDeath(victim, attacker, weaponType);
    }
  }

  // Handle Player Death & Kill Feed Event
  private handlePlayerDeath(
    victim: PlayerState, 
    attacker?: PlayerState, 
    weaponType: WeaponType | 'grenade' | 'melee' | 'ultimate' = 'rifle'
  ) {
    victim.isDead = true;
    victim.respawnTimer = 3.0;
    victim.deaths++;
    victim.ragdollAngularVel = (Math.random() - 0.5) * 16;
    victim.ragdollRotation = 0;

    // Anime K.O. popup
    this.addComicText('K.O.!', victim.x, victim.y - 40, '#EF4444', 2.2);
    soundSynth.playHitMarker(true);

    const killerName = attacker ? attacker.name : 'Battle Zone';
    const killerChar = attacker ? attacker.characterId : victim.characterId;

    if (attacker && attacker.id !== victim.id) {
      attacker.kills++;
      attacker.score += 100;
      attacker.killStreak++;
      attacker.ultimateCharge = Math.min(100, attacker.ultimateCharge + 25);

      if (attacker.id === this.localPlayerId) {
        if (attacker.killStreak === 2) this.addComicText('DOUBLE KILL!', attacker.x, attacker.y - 70, '#38BDF8', 1.8);
        else if (attacker.killStreak === 3) this.addComicText('TRIPLE KILL!', attacker.x, attacker.y - 70, '#F59E0B', 2.0);
        else if (attacker.killStreak >= 4) this.addComicText('RAMPAGE!!', attacker.x, attacker.y - 70, '#EF4444', 2.4);
      }
    }

    // Push Kill Event to Feed
    this.killFeed.unshift({
      id: `kill_${Date.now()}_${Math.random()}`,
      killerName,
      killerChar,
      victimName: victim.name,
      victimChar: victim.characterId,
      weapon: weaponType,
      timestamp: Date.now()
    });

    if (this.killFeed.length > 5) {
      this.killFeed.pop();
    }
  }

  // Respawn Player on random platform
  private respawnPlayer(p: PlayerState) {
    p.isDead = false;
    p.health = p.maxHealth;
    p.shield = p.maxShield;
    p.fuel = p.maxFuel;
    p.expression = 'normal';
    p.isJetpacking = false;
    p.isReloading = false;
    p.killStreak = 0;

    // Refill ammo
    p.currentAmmo = [WEAPONS[p.weapons[0]].clipSize, WEAPONS[p.weapons[1]].clipSize];
    p.reserveAmmo = [140, 80];

    // Pick random safe platform
    const plat = this.platforms[Math.floor(Math.random() * (this.platforms.length - 1)) + 1];
    p.x = plat.x + plat.w / 2;
    p.y = plat.y - 30;
    p.vx = 0;
    p.vy = 0;
  }

  // Update Pickups & Check Player Proximity
  private updatePickups(dt: number) {
    this.pickups.forEach(pick => {
      if (pick.respawnTime > 0) {
        pick.respawnTime -= dt;
        return;
      }

      this.players.forEach(p => {
        if (!p.isDead) {
          const dist = Math.hypot(p.x - pick.x, p.y - pick.y);
          if (dist < pick.radius + 18) {
            let collected = false;

            if (pick.type === 'health' && p.health < p.maxHealth) {
              p.health = Math.min(p.maxHealth, p.health + pick.amount);
              collected = true;
            } else if (pick.type === 'shield' && p.shield < p.maxShield) {
              p.shield = Math.min(p.maxShield, p.shield + pick.amount);
              collected = true;
            } else if (pick.type === 'ammo') {
              p.reserveAmmo[0] += pick.amount;
              p.reserveAmmo[1] += Math.round(pick.amount * 0.6);
              collected = true;
            } else if (pick.type === 'ultimate' && p.ultimateCharge < 100) {
              p.ultimateCharge = Math.min(100, p.ultimateCharge + pick.amount);
              collected = true;
            }

            if (collected) {
              pick.respawnTime = 15; // 15s respawn timer
              this.addComicText(`+${pick.type.toUpperCase()}`, pick.x, pick.y - 20, '#10B981', 1.2);
              if (p.id === this.localPlayerId) soundSynth.playPickup();
            }
          }
        }
      });
    });
  }

  // Update Particles
  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.type === 'shockwave') {
        p.size += 240 * dt;
      }
    }
  }

  // Update Comic Popups
  private updateComicTexts(dt: number) {
    for (let i = this.comicTexts.length - 1; i >= 0; i--) {
      const ct = this.comicTexts[i];
      ct.life -= dt;
      if (ct.life <= 0) {
        this.comicTexts.splice(i, 1);
        continue;
      }
      ct.y -= 30 * dt; // float up
      ct.alpha = Math.min(1, ct.life * 1.5);
    }
  }

  // Update Ambient Particles
  private updateAmbientParticles(dt: number) {
    this.ambientParticles.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.rotSpeed) p.rotation = (p.rotation || 0) + p.rotSpeed * dt;

      // Wrap around screen
      if (p.y > this.mapHeight + 20) p.y = -10;
      if (p.x < -20) p.x = this.mapWidth + 10;
      if (p.x > this.mapWidth + 20) p.x = -10;
    });
  }

  // Add Comic Text ("BOOM", "POW", "K.O.")
  public addComicText(text: string, x: number, y: number, color: string = '#FBBF24', scale: number = 1.5) {
    this.comicTexts.push({
      id: `ct_${Date.now()}_${Math.random()}`,
      text,
      x,
      y,
      color,
      scale,
      alpha: 1.0,
      life: 0.8
    });
  }

  // Spawn Jetpack Plume Particles
  private spawnJetpackParticle(p: PlayerState) {
    const charDef = CHARACTERS.find(c => c.id === p.characterId) || CHARACTERS[0];
    this.particles.push({
      x: p.x - (p.facingLeft ? -10 : 10),
      y: p.y - 2,
      vx: (Math.random() - 0.5) * 30 - p.vx * 0.1,
      vy: 120 + Math.random() * 80,
      color: charDef.accentColor,
      size: 4 + Math.random() * 3,
      life: 0.25,
      maxLife: 0.25,
      type: 'flame'
    });
  }

  // Spawn Star Impact Sparks
  private spawnImpactSparks(x: number, y: number, color: string) {
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 2,
        life: 0.25,
        maxLife: 0.25,
        type: 'spark'
      });
    }
  }

  // Get local player reference
  public getLocalPlayer(): PlayerState | undefined {
    return this.players.find(p => p.id === this.localPlayerId);
  }

  // Determine Match Winner
  private determineWinner() {
    let topScore = -1;
    let winnerId: string | null = null;
    for (const p of this.players) {
      if (p.score > topScore) {
        topScore = p.score;
        winnerId = p.id;
      }
    }
    this.winnerId = winnerId;
    soundSynth.playAnimeVoice('victory');
  }
}
