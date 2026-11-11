import { PlayerState, AnimeCharacter } from '../../types/game';
import { CHARACTERS, WEAPONS } from '../../data/charactersAndWeapons';

export class CharacterRenderer {
  // Render full anime character on canvas with cel-shaded outlines & physics effects
  public static renderCharacter(
    ctx: CanvasRenderingContext2D,
    player: PlayerState,
    gameTime: number
  ) {
    const char = CHARACTERS.find(c => c.id === player.characterId) || CHARACTERS[0];

    ctx.save();
    ctx.translate(player.x, player.y);

    // Ragdoll death rotation
    if (player.isDead) {
      ctx.rotate(player.ragdollRotation);
      ctx.globalAlpha = Math.max(0.2, 1 - (3 - player.respawnTimer) * 0.25);
    }

    // Direction flip
    if (player.facingLeft) {
      ctx.scale(-1, 1);
    }

    // Breathing / bobbing cycle
    const isMoving = Math.abs(player.vx) > 20;
    const bob = isMoving ? Math.sin(gameTime * 14) * 3 : Math.sin(gameTime * 3) * 1.5;
    const runLean = isMoving && player.isGrounded ? (player.vx > 0 ? 0.1 : -0.1) : 0;

    ctx.rotate(runLean);

    // 1. Draw Jetpack Thrusters & Exhaust Flames
    this.drawJetpack(ctx, char, player, gameTime);

    // 2. Draw Flowing Scarf / Cape Tails (swaying with velocity + jetpack wind)
    this.drawFlowingScarf(ctx, char, player, gameTime);

    // 3. Draw Legs & Shadow
    this.drawLegs(ctx, char, player, gameTime, bob);

    // 4. Draw Torso / Military Flight Jacket
    this.drawTorso(ctx, char, player, bob);

    // 5. Draw Anime Head, Expressive Eyes & Hair
    this.drawHead(ctx, char, player, gameTime, bob);

    // 6. Draw Arms & Stylized Anime Gun
    this.drawArmAndWeapon(ctx, char, player, bob);

    // 7. Ultimate Aura if active
    if (player.isUltimateActive) {
      this.drawUltimateAura(ctx, char, gameTime);
    }

    ctx.restore();
  }

  // Draw Jetpack on back
  private static drawJetpack(
    ctx: CanvasRenderingContext2D,
    char: AnimeCharacter,
    player: PlayerState,
    gameTime: number
  ) {
    ctx.save();
    ctx.translate(-14, -14);

    // Jetpack metallic base
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-4, -12, 10, 24, 4);
    ctx.fill();
    ctx.stroke();

    // Twin energy canisters
    ctx.fillStyle = char.accentColor;
    ctx.beginPath();
    ctx.roundRect(-2, -8, 6, 16, 2);
    ctx.fill();

    // Glowing core
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(1, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    // Jetpack exhaust thruster flame when thrusting
    if (player.isJetpacking && !player.isDead) {
      const flameLength = 18 + Math.sin(gameTime * 30) * 8;
      const gradient = ctx.createLinearGradient(0, 12, 0, 12 + flameLength);
      gradient.addColorStop(0, '#FFFFFF');
      gradient.addColorStop(0.3, char.accentColor);
      gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(-4, 12);
      ctx.lineTo(6, 12);
      ctx.lineTo(1, 12 + flameLength);
      ctx.closePath();
      ctx.fill();

      // Outer anime burst ring
      ctx.strokeStyle = char.accentColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(1, 14, 6, 2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Flowing Anime Scarf reacting to velocity and jetpack thrust
  private static drawFlowingScarf(
    ctx: CanvasRenderingContext2D,
    char: AnimeCharacter,
    player: PlayerState,
    gameTime: number
  ) {
    ctx.save();
    ctx.translate(-4, -20);

    const windAngle = player.isJetpacking 
      ? 1.2 + Math.sin(gameTime * 20) * 0.3 
      : (player.vx > 20 ? 0.6 : (player.vx < -20 ? -0.4 : 0.2)) + Math.sin(gameTime * 6) * 0.15;
    
    const scarfLength = 28;

    ctx.fillStyle = char.scarfColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Bezier curve trailing back
    const c1x = -scarfLength * 0.5 * Math.cos(windAngle);
    const c1y = scarfLength * 0.5 * Math.sin(windAngle);
    const tipX = -scarfLength * Math.cos(windAngle);
    const tipY = scarfLength * Math.sin(windAngle) + Math.cos(gameTime * 12) * 4;

    ctx.quadraticCurveTo(c1x, c1y, tipX, tipY);
    ctx.lineTo(tipX + 4, tipY + 6);
    ctx.quadraticCurveTo(c1x + 3, c1y + 4, 3, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Scarf knot collar around neck
    ctx.fillStyle = char.scarfColor;
    ctx.beginPath();
    ctx.ellipse(0, 2, 7, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // Draw Anime Chibi Legs
  private static drawLegs(
    ctx: CanvasRenderingContext2D,
    char: AnimeCharacter,
    player: PlayerState,
    gameTime: number,
    bob: number
  ) {
    ctx.save();
    ctx.translate(0, bob);

    const isMoving = Math.abs(player.vx) > 20;
    const legSwing = isMoving && player.isGrounded ? Math.sin(gameTime * 16) * 10 : 0;

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = char.outfitColor;

    // Left leg
    ctx.beginPath();
    ctx.roundRect(-8 + legSwing * 0.5, 6, 6, 14, 3);
    ctx.fill();
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.roundRect(2 - legSwing * 0.5, 6, 6, 14, 3);
    ctx.fill();
    ctx.stroke();

    // Boots with glowing sci-fi rim
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(-8 + legSwing * 0.5, 16, 7, 5);
    ctx.strokeRect(-8 + legSwing * 0.5, 16, 7, 5);

    ctx.fillRect(2 - legSwing * 0.5, 16, 7, 5);
    ctx.strokeRect(2 - legSwing * 0.5, 16, 7, 5);

    // Boot sole glow
    ctx.fillStyle = char.accentColor;
    ctx.fillRect(-7 + legSwing * 0.5, 20, 5, 2);
    ctx.fillRect(3 - legSwing * 0.5, 20, 5, 2);

    ctx.restore();
  }

  // Draw Torso & Military Jacket
  private static drawTorso(
    ctx: CanvasRenderingContext2D,
    char: AnimeCharacter,
    player: PlayerState,
    bob: number
  ) {
    ctx.save();
    ctx.translate(0, bob);

    // Main jacket
    ctx.fillStyle = char.outfitColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.roundRect(-9, -12, 18, 20, 4);
    ctx.fill();
    ctx.stroke();

    // Armor chest plate / harness
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(-6, -9, 12, 8, 2);
    ctx.fill();
    ctx.stroke();

    // Tech emblem
    ctx.fillStyle = char.accentColor;
    ctx.beginPath();
    ctx.arc(0, -5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Belt and holster
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(-9, 5, 18, 4);
    ctx.strokeRect(-9, 5, 18, 4);

    // Belt buckle
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(-3, 5, 6, 4);

    ctx.restore();
  }

  // Draw Anime Head, Expressions & Stylized Hair
  private static drawHead(
    ctx: CanvasRenderingContext2D,
    char: AnimeCharacter,
    player: PlayerState,
    gameTime: number,
    bob: number
  ) {
    ctx.save();
    ctx.translate(0, -22 + bob);

    // 1. Chibi Head Base (Soft Peach/Porcelain Tone)
    ctx.fillStyle = '#FFE4D6';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    ctx.beginPath();
    // Cute curved chibi jawline
    ctx.moveTo(-11, -10);
    ctx.quadraticCurveTo(-12, 4, -4, 11);
    ctx.quadraticCurveTo(0, 13, 4, 11);
    ctx.quadraticCurveTo(12, 4, 11, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cute blush on cheeks
    ctx.fillStyle = 'rgba(255, 110, 140, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-7, 4, 3, 1.5, 0, 0, Math.PI * 2);
    ctx.ellipse(7, 4, 3, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Expressive Anime Eyes
    this.drawAnimeEyes(ctx, char, player, gameTime);

    // 3. Mouth Expression
    this.drawMouth(ctx, player);

    // 4. Stylized Anime Hair (Procedural unique hairstyles)
    this.drawHairstyle(ctx, char, gameTime);

    ctx.restore();
  }

  // Draw Expressive Anime Eyes (Huge iris, highlights, specular sparkles)
  private static drawAnimeEyes(
    ctx: CanvasRenderingContext2D,
    char: AnimeCharacter,
    player: PlayerState,
    gameTime: number
  ) {
    const isHurt = player.expression === 'hurt' || player.hurtTimer > 0;
    const isDetermined = player.expression === 'determined' || player.isUltimateActive;
    const blink = !player.isDead && Math.sin(gameTime * 1.5) > 0.96;

    if (player.isDead) {
      // Anime spiral / X eyes on death
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      // Left eye X
      ctx.beginPath();
      ctx.moveTo(-8, -2); ctx.lineTo(-2, 4);
      ctx.moveTo(-2, -2); ctx.lineTo(-8, 4);
      // Right eye X
      ctx.moveTo(3, -2); ctx.lineTo(9, 4);
      ctx.moveTo(9, -2); ctx.lineTo(3, 4);
      ctx.stroke();
      return;
    }

    if (blink) {
      // Closed happy anime slit
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-5, 0, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(5, 0, 4, 0.2, Math.PI - 0.2);
      ctx.stroke();
      return;
    }

    // Left & Right Eye Sockets
    const eyePositions = [-5, 5];

    eyePositions.forEach(xPos => {
      ctx.save();
      ctx.translate(xPos, 0);

      // Eye White
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.ellipse(0, 0, 4.5, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Iris Gradient
      const irisGradient = ctx.createLinearGradient(0, -5, 0, 5);
      irisGradient.addColorStop(0, char.eyeColor);
      irisGradient.addColorStop(1, '#0F172A');

      ctx.fillStyle = irisGradient;
      ctx.beginPath();
      ctx.ellipse(0.5, 0.5, 3.2, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0.5, 0.5, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Anime Specular Highlights (Sparkle)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-0.8, -1.8, 1.4, 0, Math.PI * 2); // Big specular
      ctx.arc(1.4, 1.8, 0.7, 0, Math.PI * 2);   // Small specular
      ctx.fill();

      // Thick Top Eyelash / Anime Eyeline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -1, 5, isDetermined ? -2.6 : -2.8, isDetermined ? -0.4 : -0.2);
      ctx.stroke();

      // Eyebrow
      ctx.strokeStyle = char.hairColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (isHurt) {
        ctx.moveTo(-3, -7);
        ctx.lineTo(3, -5);
      } else if (isDetermined) {
        ctx.moveTo(-3, -5);
        ctx.lineTo(3, -7);
      } else {
        ctx.moveTo(-3, -6);
        ctx.lineTo(3, -6);
      }
      ctx.stroke();

      ctx.restore();
    });
  }

  // Draw Mouth
  private static drawMouth(ctx: CanvasRenderingContext2D, player: PlayerState) {
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#E11D48';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    if (player.expression === 'hurt' || player.hurtTimer > 0) {
      // Small open gasping mouth
      ctx.ellipse(0, 6, 2, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (player.isUltimateActive) {
      // Open battle roar
      ctx.arc(0, 5, 3.5, 0, Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Cute confident smirk
      ctx.arc(0, 5, 2.5, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }
  }

  // Draw 8 Procedural Anime Hairstyles
  private static drawHairstyle(
    ctx: CanvasRenderingContext2D,
    char: AnimeCharacter,
    gameTime: number
  ) {
    ctx.save();
    ctx.fillStyle = char.hairColor;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    const sway = Math.sin(gameTime * 4) * 2;

    switch (char.hairStyle) {
      case 'twin_drills': { // Aoi
        // Bangs
        ctx.beginPath();
        ctx.moveTo(-11, -7);
        ctx.lineTo(-7, -2);
        ctx.lineTo(-3, -8);
        ctx.lineTo(0, -1);
        ctx.lineTo(4, -8);
        ctx.lineTo(8, -2);
        ctx.lineTo(11, -7);
        ctx.quadraticCurveTo(0, -18, -11, -7);
        ctx.fill();
        ctx.stroke();

        // Left drill
        ctx.beginPath();
        ctx.moveTo(-10, -8);
        ctx.quadraticCurveTo(-18, 0 + sway, -14, 12 + sway);
        ctx.quadraticCurveTo(-8, 6, -10, -4);
        ctx.fill();
        ctx.stroke();

        // Right drill
        ctx.beginPath();
        ctx.moveTo(10, -8);
        ctx.quadraticCurveTo(18, 0 + sway, 14, 12 + sway);
        ctx.quadraticCurveTo(8, 6, 10, -4);
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'spiky_cold': { // Ren
        ctx.beginPath();
        ctx.moveTo(-12, -6);
        ctx.lineTo(-14, -14);
        ctx.lineTo(-8, -12);
        ctx.lineTo(-6, -20);
        ctx.lineTo(0, -14);
        ctx.lineTo(5, -22);
        ctx.lineTo(7, -13);
        ctx.lineTo(13, -15);
        ctx.lineTo(11, -4);
        ctx.lineTo(6, -2);
        ctx.lineTo(0, -4);
        ctx.lineTo(-6, -2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'wild_crimson': { // Ryuko
        ctx.beginPath();
        ctx.moveTo(-12, -4);
        ctx.lineTo(-16, -12);
        ctx.lineTo(-9, -15);
        ctx.lineTo(-3, -24);
        ctx.lineTo(3, -18);
        ctx.lineTo(12, -22);
        ctx.lineTo(12, -10);
        ctx.lineTo(16, -4);
        ctx.lineTo(8, 0);
        ctx.lineTo(0, -2);
        ctx.lineTo(-8, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'ninja_ponytail': { // Hayate
        // Forehead headband
        ctx.fillStyle = '#18181B';
        ctx.fillRect(-11, -11, 22, 5);
        ctx.strokeRect(-11, -11, 22, 5);

        // High ponytail swaying behind
        ctx.fillStyle = char.hairColor;
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.quadraticCurveTo(-14 - sway, -20, -20 - sway, -4);
        ctx.quadraticCurveTo(-10 - sway, -8, 2, -12);
        ctx.fill();
        ctx.stroke();
        break;
      }

      default: {
        // Generic slick anime bangs & crown
        ctx.beginPath();
        ctx.moveTo(-12, -6);
        ctx.lineTo(-10, -16);
        ctx.lineTo(-3, -20);
        ctx.lineTo(5, -18);
        ctx.lineTo(12, -14);
        ctx.lineTo(11, -5);
        ctx.lineTo(6, -1);
        ctx.lineTo(0, -4);
        ctx.lineTo(-6, -1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
    }

    // Hair shine ring (Anime Angel Ring)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -11, 9, -2.4, -0.7);
    ctx.stroke();

    ctx.restore();
  }

  // Draw Arm holding Stylized Sci-Fi Weapon with dynamic aim angle
  private static drawArmAndWeapon(
    ctx: CanvasRenderingContext2D,
    char: AnimeCharacter,
    player: PlayerState,
    bob: number
  ) {
    ctx.save();
    ctx.translate(0, -4 + bob);

    // Aim angle
    let aim = player.aimAngle;
    if (player.facingLeft) {
      aim = Math.PI - aim;
    }

    ctx.rotate(aim);

    // Current Weapon Def
    const activeWeaponType = player.weapons[player.activeWeaponIndex];
    const weaponDef = WEAPONS[activeWeaponType] || WEAPONS.pistol;

    // Recoil kickback on recent shot
    const timeSinceShot = Date.now() - player.lastShotTime;
    const recoilOffset = timeSinceShot < 100 ? (1 - timeSinceShot / 100) * (weaponDef.recoil * 0.4) : 0;

    ctx.translate(-recoilOffset, 0);

    // Weapon Body
    ctx.save();
    ctx.translate(6, 0);

    // Weapon shadow / outline
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';

    // Stylized Sci-fi Gun
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, -4, weaponDef.barrelLength, 8);
    ctx.strokeRect(0, -4, weaponDef.barrelLength, 8);

    // Glowing energy barrel/receiver
    ctx.fillStyle = weaponDef.bulletColor;
    ctx.fillRect(4, -2, weaponDef.barrelLength - 8, 4);

    // Magazine clip
    ctx.fillStyle = '#334155';
    ctx.fillRect(8, 4, 6, 7);
    ctx.strokeRect(8, 4, 6, 7);

    // Muzzle flash when just fired
    if (timeSinceShot < 60) {
      this.drawMuzzleFlash(ctx, weaponDef.barrelLength, weaponDef.bulletColor);
    }

    ctx.restore();

    // Hand holding gun
    ctx.fillStyle = '#FFE4D6';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(6, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Arm sleeve
    ctx.fillStyle = char.outfitColor;
    ctx.beginPath();
    ctx.roundRect(-4, -3, 9, 6, 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // Draw Anime Starburst Muzzle Flash
  private static drawMuzzleFlash(
    ctx: CanvasRenderingContext2D,
    barrelX: number,
    color: string
  ) {
    ctx.save();
    ctx.translate(barrelX + 4, 0);

    // Outer star flash
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const r = i % 2 === 0 ? 12 : 5;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Inner white core
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Ultimate Aura Ring
  private static drawUltimateAura(
    ctx: CanvasRenderingContext2D,
    char: AnimeCharacter,
    gameTime: number
  ) {
    ctx.save();
    const pulse = 1 + Math.sin(gameTime * 10) * 0.15;
    ctx.strokeStyle = char.ultimate.color;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);

    ctx.beginPath();
    ctx.arc(0, 0, 32 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Glowing particles rising
    ctx.fillStyle = char.ultimate.color;
    for (let i = 0; i < 4; i++) {
      const angle = (gameTime * 3 + (i * Math.PI) / 2);
      const px = Math.cos(angle) * 26;
      const py = Math.sin(angle) * 26;
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Static Avatar Face Portrait Generator (for HUD, Killfeed, Scoreboard)
  public static drawAvatarPortrait(
    ctx: CanvasRenderingContext2D,
    charId: string,
    x: number,
    y: number,
    size: number,
    expression: 'normal' | 'determined' | 'hurt' = 'normal'
  ) {
    const char = CHARACTERS.find(c => c.id === charId) || CHARACTERS[0];
    const dummyPlayer: PlayerState = {
      id: 'avatar',
      name: char.name,
      characterId: char.id,
      skinIndex: 0,
      isBot: false,
      team: 'blue',
      x: 0,
      y: 0,
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
      isGrounded: true,
      isCrouching: false,
      weapons: ['rifle', 'pistol'],
      activeWeaponIndex: 0,
      currentAmmo: [28, 15],
      reserveAmmo: [120, 60],
      isReloading: false,
      reloadProgress: 0,
      lastShotTime: 0,
      ultimateCharge: 0,
      isUltimateActive: false,
      ultimateTimer: 0,
      kills: 0,
      deaths: 0,
      score: 0,
      killStreak: 0,
      expression: expression,
      hurtTimer: 0,
      isDead: false,
      respawnTimer: 0,
      ragdollRotation: 0,
      ragdollAngularVel: 0
    };

    ctx.save();
    ctx.translate(x + size / 2, y + size / 2 + 12);
    const scale = size / 48;
    ctx.scale(scale, scale);

    this.drawHead(ctx, char, dummyPlayer, 0, 0);

    ctx.restore();
  }
}
