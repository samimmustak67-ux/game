import { MapTheme, Platform, Particle } from '../../types/game';
import { MAP_THEMES } from '../../data/charactersAndWeapons';

export class MapRenderer {
  // Render Parallax Background & Themed Structures
  public static renderBackground(
    ctx: CanvasRenderingContext2D,
    theme: MapTheme,
    cameraX: number,
    cameraY: number,
    viewportW: number,
    viewportH: number,
    gameTime: number
  ) {
    // 1. Sky Gradient Base
    const sky = ctx.createLinearGradient(0, 0, 0, viewportH);
    sky.addColorStop(0, theme.skyGradient[0]);
    sky.addColorStop(0.5, theme.skyGradient[1]);
    sky.addColorStop(1, theme.skyGradient[2]);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, viewportW, viewportH);

    // 2. Far Parallax Layer (clouds, mountains, distant skyline - speed 0.1)
    this.renderFarLayer(ctx, theme, cameraX * 0.1, cameraY * 0.05, viewportW, viewportH, gameTime);

    // 3. Mid Parallax Layer (pagodas, billboards, floating islands - speed 0.3)
    this.renderMidLayer(ctx, theme, cameraX * 0.3, cameraY * 0.15, viewportW, viewportH, gameTime);
  }

  // Far layer rendering
  private static renderFarLayer(
    ctx: CanvasRenderingContext2D,
    theme: MapTheme,
    offsetX: number,
    offsetY: number,
    w: number,
    h: number,
    gameTime: number
  ) {
    ctx.save();
    ctx.translate(-offsetX % w, offsetY);

    if (theme.id === 'tokyo') {
      // Distant cyberpunk skyscrapers silhouettes with glowing windows
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      for (let i = -1; i < 3; i++) {
        const bx = i * 200;
        ctx.fillRect(bx, h * 0.45, 90, h * 0.6);
        ctx.fillRect(bx + 100, h * 0.35, 75, h * 0.7);

        // Holographic neon glow bar
        ctx.fillStyle = (i % 2 === 0) ? 'rgba(0, 240, 255, 0.15)' : 'rgba(244, 63, 94, 0.15)';
        ctx.fillRect(bx + 20, h * 0.48, 50, 4);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      }
    } else if (theme.id === 'sakura') {
      // Mount Fuji sunset silhouette & golden sun
      ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.45, 90, 0, Math.PI * 2);
      ctx.fill();

      // Mountain peak
      ctx.fillStyle = 'rgba(45, 27, 54, 0.6)';
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h * 0.8);
      ctx.lineTo(w * 0.5, h * 0.4);
      ctx.lineTo(w * 0.8, h * 0.8);
      ctx.closePath();
      ctx.fill();
    } else if (theme.id === 'space_station') {
      // Earth curvature in background
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 1.5, h * 1.1, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();

      // Earth atmosphere glow
      const earthGlow = ctx.createRadialGradient(w * 0.5, h * 1.5, h * 0.9, w * 0.5, h * 1.5, h * 1.15);
      earthGlow.addColorStop(0, 'rgba(14, 165, 233, 0.3)');
      earthGlow.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = earthGlow;
      ctx.fill();
    } else {
      // Fluffy anime clouds floating
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = -1; i < 3; i++) {
        const cx = i * 350 + Math.sin(gameTime * 0.2 + i) * 30;
        ctx.beginPath();
        ctx.arc(cx, h * 0.4, 60, 0, Math.PI * 2);
        ctx.arc(cx + 50, h * 0.35, 75, 0, Math.PI * 2);
        ctx.arc(cx + 110, h * 0.4, 55, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  // Mid layer rendering
  private static renderMidLayer(
    ctx: CanvasRenderingContext2D,
    theme: MapTheme,
    offsetX: number,
    offsetY: number,
    w: number,
    h: number,
    gameTime: number
  ) {
    ctx.save();
    ctx.translate(-offsetX % (w * 1.5), offsetY);

    if (theme.id === 'sakura') {
      // Floating Torii Gates
      ctx.fillStyle = '#DC2626';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;

      for (let i = 0; i < 3; i++) {
        const tx = i * 450 + 100;
        const ty = h * 0.45 + Math.sin(gameTime + i) * 8;

        // Pillars
        ctx.fillRect(tx, ty, 8, 55);
        ctx.strokeRect(tx, ty, 8, 55);
        ctx.fillRect(tx + 45, ty, 8, 55);
        ctx.strokeRect(tx + 45, ty, 8, 55);

        // Top crossbeam with curve
        ctx.fillRect(tx - 10, ty - 6, 73, 8);
        ctx.strokeRect(tx - 10, ty - 6, 73, 8);
      }
    } else if (theme.id === 'tokyo') {
      // Japanese Kanji Holographic signs: "戦い" (Battle), "撃て" (Shoot), "勝利" (Victory)
      ctx.font = 'bold 24px "Mochiy Pop One", sans-serif';
      ctx.textAlign = 'center';

      const signs = [
        { text: '電脳戦', color: '#00F0FF', x: 220, y: h * 0.4 },
        { text: '勝撃', color: '#F43F5E', x: 620, y: h * 0.35 },
        { text: '超戦士', color: '#FACC15', x: 1040, y: h * 0.42 }
      ];

      signs.forEach(s => {
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 12;
        ctx.fillText(s.text, s.x, s.y);
        ctx.shadowBlur = 0;
      });
    }

    ctx.restore();
  }

  // Render Combat Platforms with Cel-shaded borders and neon trim
  public static renderPlatforms(
    ctx: CanvasRenderingContext2D,
    platforms: Platform[],
    theme: MapTheme,
    gameTime: number
  ) {
    platforms.forEach((p, index) => {
      ctx.save();

      // Platform body
      ctx.fillStyle = theme.platformColor;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.w, p.h, 6);
      ctx.fill();
      ctx.stroke();

      // Glowing anime edge line on top
      ctx.strokeStyle = theme.platformBorder;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(p.x + 4, p.y + 2);
      ctx.lineTo(p.x + p.w - 4, p.y + 2);
      ctx.stroke();

      // Subtle tech grip notches or cherry blossom engraving
      ctx.fillStyle = theme.platformBorder;
      ctx.globalAlpha = 0.5 + Math.sin(gameTime * 3 + index) * 0.2;
      for (let x = p.x + 16; x < p.x + p.w - 16; x += 32) {
        ctx.fillRect(x, p.y + 4, 8, 2);
      }

      ctx.restore();
    });
  }

  // Render Ambient Anime Particles (Falling Sakura petals, blizzard flakes, speed lines)
  public static renderAmbientParticles(
    ctx: CanvasRenderingContext2D,
    particles: Particle[]
  ) {
    particles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);
      if (p.rotation !== undefined) {
        ctx.rotate(p.rotation);
      }

      const alpha = Math.min(1, p.life / (p.maxLife * 0.3));
      ctx.globalAlpha = alpha;

      if (p.type === 'sakura') {
        // Delicate pink petal shape
        ctx.fillStyle = '#FB7185';
        ctx.strokeStyle = '#E11D48';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 1.8, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (p.type === 'snow') {
        // Soft white snowflake
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'star') {
        // 4-point anime twinkle star
        ctx.fillStyle = p.color;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2;
          const r = i % 2 === 0 ? p.size * 2 : p.size * 0.6;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // Glowing spark
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }
}
