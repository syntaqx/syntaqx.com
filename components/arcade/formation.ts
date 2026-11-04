/*
 * Formation: a fixed-cannon shooter against a marching grid. The invaders
 * are small network glyphs drawn as strokes; the cannon is an AI that picks
 * a column, leads its shots and steps out from under falling ones. Clearing
 * the grid marches a new one in; losing three cannons or letting the grid
 * land starts over after a beat.
 */

import type { ArcadeTheme, Cabinet, CabinetFactory } from "./cabinet";

type Accent = "primary" | "amber" | "pink" | "purple" | "cyan" | "green" | "fg";

const ROWS = 5;
// One glyph and one accent per row, top to bottom.
const ROW_COLORS: Accent[] = ["pink", "purple", "amber", "cyan", "green"];
// Bunkers are a coarse bitmap so they can erode cell by cell.
const BW = 14;
const BH = 8;
const MAX_SPARKS = 240;
// Seconds for the full grid to cross the stage once; it gets faster as it thins.
const SWEEP = 12;

interface Shot {
  x: number;
  y: number;
  vy: number;
  color: Accent;
  /** Seconds until the cannon's AI notices this shot; a few slip past it. */
  unseen: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: Accent;
}

interface Bunker {
  cells: Uint8Array;
}

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

class FormationGame implements Cabinet {
  title = "Formation";

  private w = 0;
  private h = 0;
  private started = false;

  // Layout, recomputed on every resize.
  private cell = 32;
  private rowH = 28;
  private glyphR = 10;
  private lw = 1.5;
  private cannonY = 0;
  private cannonHW = 12;
  private cannonH = 12;
  private bunkerTop = 0;
  private bunkerW = 0;
  private bunkerCount = 4;

  // The formation. gx/gy are where it is; vx/vy are where it is drawn, easing
  // toward gx/gy so each discrete march step reads as a short glide.
  private cols = 11;
  private alive: boolean[] = [];
  private gx = 0;
  private gy = 0;
  private vx = 0;
  private vy = 0;
  private dir = 1;
  private stepTimer = 0;
  private frame = 0;
  private bombTimer = 0;

  private cannonX = 0;
  private cannonV = 0;
  private dead = 0;
  private reload = 0;
  private lives = 3;

  private bullet: Shot | null = null;
  private bombs: Shot[] = [];
  private sparks: Spark[] = [];
  private bunkers: Bunker[] = [];

  private score = 0;
  private wave = 1;
  private phase: "play" | "clear" | "over" = "play";
  private phaseTimer = 0;

  resize(width: number, height: number) {
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    const fx = this.w ? w / this.w : 1;
    const fy = this.h ? h / this.h : 1;
    this.w = w;
    this.h = h;
    this.layout();
    if (!this.started) {
      this.started = true;
      this.newGame();
      return;
    }
    // Keep the round going: carry every position over proportionally.
    this.gx *= fx;
    this.vx *= fx;
    this.gy *= fy;
    this.vy *= fy;
    this.cannonX = clamp(this.cannonX * fx, this.cannonHW, w - this.cannonHW);
    for (const s of this.shots()) {
      s.x *= fx;
      s.y *= fy;
      s.vy *= fy;
    }
    for (const p of this.sparks) {
      p.x *= fx;
      p.y *= fy;
    }
    const [lo, hi] = this.aliveSpan();
    if (lo >= 0) {
      const m = this.cell * 0.6;
      this.gx = clamp(this.gx, m - lo * this.cell, w - m - hi * this.cell);
      this.vx = this.gx;
    }
  }

  step(dt: number) {
    if (!(dt > 0) || !this.started) return;
    dt = Math.min(dt, 1 / 30);

    this.stepSparks(dt);
    this.vx += (this.gx - this.vx) * (1 - Math.exp(-dt * 22));
    this.vy += (this.gy - this.vy) * (1 - Math.exp(-dt * 7));

    if (this.phase === "over") {
      this.phaseTimer -= dt;
      this.moveShots(dt);
      if (this.phaseTimer <= 0) this.newGame();
      return;
    }
    if (this.phase === "clear") {
      this.phaseTimer -= dt;
      this.moveShots(dt);
      this.driveCannon(dt, this.w / 2);
      if (this.phaseTimer <= 0) {
        this.wave++;
        this.newWave();
      }
      return;
    }

    this.updateCannon(dt);
    // The formation holds still while a lost cannon respawns.
    if (this.dead <= 0) {
      this.stepTimer -= dt;
      if (this.stepTimer <= 0) {
        this.stepTimer = this.interval();
        this.march();
      }
      this.dropBombs(dt);
    }
    this.moveShots(dt);
    this.collide();

    const left = this.alive.reduce((n, a) => n + (a ? 1 : 0), 0);
    if (left === 0) {
      this.phase = "clear";
      this.phaseTimer = 1.6;
      this.bombs = [];
    } else if (this.lowestY() + this.glyphR >= this.cannonY - this.cannonH) {
      this.burst(this.cannonX, this.cannonY - this.cannonH / 2, "primary", 26);
      this.lose();
    }
  }

  draw(ctx: CanvasRenderingContext2D, theme: ArcadeTheme, now: number) {
    if (!this.started) return;
    const t = now / 1000;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = this.lw;

    this.drawBunkers(ctx, theme);

    // The formation fades out while a lost round waits to restart.
    const fade = this.phase === "over" ? clamp(this.phaseTimer / 2.4, 0, 1) : 1;
    ctx.globalAlpha = 0.9 * fade;
    for (let r = 0; r < ROWS; r++) {
      ctx.strokeStyle = theme[ROW_COLORS[r]];
      ctx.fillStyle = theme[ROW_COLORS[r]];
      ctx.beginPath();
      for (let c = 0; c < this.cols; c++) {
        if (!this.alive[r * this.cols + c]) continue;
        const x = this.vx + c * this.cell;
        const y = this.vy + r * this.rowH;
        if (y < -this.rowH) continue;
        this.glyph(ctx, r, x, y, this.glyphR, this.frame);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (theme.dark) ctx.globalCompositeOperation = "lighter";
    // Bombs: short zigzags that wriggle as they fall.
    for (const b of this.bombs) {
      const s = this.glyphR * 0.35;
      const k = Math.sin(t * 18 + b.x) > 0 ? 1 : -1;
      ctx.strokeStyle = theme[b.color];
      ctx.beginPath();
      ctx.moveTo(b.x, b.y - s * 2);
      ctx.lineTo(b.x + s * k, b.y - s);
      ctx.lineTo(b.x - s * k, b.y);
      ctx.lineTo(b.x, b.y + s);
      ctx.stroke();
    }
    if (this.bullet) {
      const b = this.bullet;
      ctx.strokeStyle = theme.primary;
      if (theme.dark) {
        ctx.globalAlpha = 0.25;
        ctx.lineWidth = this.lw * 3;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x, b.y + this.cell * 0.4);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.lineWidth = this.lw;
      }
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + this.cell * 0.3);
      ctx.stroke();
    }

    for (const p of this.sparks) {
      const a = p.life / p.max;
      ctx.globalAlpha = a;
      ctx.strokeStyle = theme[p.color];
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    // The cannon blinks back in after a respawn.
    const visible = this.dead <= 0 || (this.dead < 0.6 && Math.sin(t * 30) > 0);
    if (visible && !(this.phase === "over" && this.lives <= 0)) {
      ctx.strokeStyle = theme.primary;
      this.drawCannon(ctx, this.cannonX, this.cannonY, 1);
    }

    // Score and spare cannons, small and out of the way.
    ctx.font = `500 11px ${theme.mono}`;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillStyle = theme.muted;
    const pad = 16;
    ctx.fillText(String(this.score).padStart(5, "0"), pad, pad);
    ctx.strokeStyle = theme.muted;
    ctx.lineWidth = 1.25;
    for (let i = 0; i < this.lives - 1; i++) {
      this.drawCannon(ctx, pad + 58 + i * 18, pad + 10, 0.5);
    }
    ctx.restore();
  }

  // Setup ---------------------------------------------------------------------

  private layout() {
    const { w, h } = this;
    this.cell = clamp(w * 0.045, 24, 48);
    this.rowH = this.cell * 0.82;
    this.glyphR = this.cell * 0.3;
    this.lw = clamp(this.cell * 0.036, 1.25, 1.9);
    this.cannonY = h - clamp(h * 0.07, 28, 64);
    this.cannonHW = this.cell * 0.42;
    this.cannonH = this.cell * 0.45;
    this.bunkerCount = w < 720 ? 3 : 4;
    this.bunkerW = this.cell * 1.7;
    this.bunkerTop = this.cannonY - this.cannonH - this.cell * 1.6 - this.bunkerCellSize() * BH;
  }

  private newGame() {
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.dead = 0;
    this.cannonX = this.w / 2;
    this.cannonV = 0;
    this.sparks = [];
    this.bunkers = [];
    for (let i = 0; i < this.bunkerCount; i++) this.bunkers.push(this.freshBunker());
    this.newWave();
  }

  private newWave() {
    this.phase = "play";
    this.cols = this.w < 720 ? 8 : 11;
    this.alive = new Array(ROWS * this.cols).fill(true);
    this.gx = (this.w - (this.cols - 1) * this.cell) / 2;
    // Later waves start a little lower, the way the genre ramps.
    const top = clamp(this.h * 0.1, 44, 120);
    this.gy = top + Math.min(this.wave - 1, 4) * this.rowH * 0.3;
    this.vx = this.gx;
    // March in from above the stage.
    this.vy = -ROWS * this.rowH - this.cell;
    this.dir = 1;
    this.stepTimer = 1;
    this.bombTimer = 2;
    this.bombs = [];
    this.bullet = null;
  }

  private freshBunker(): Bunker {
    const cells = new Uint8Array(BW * BH);
    for (let y = 0; y < BH; y++) {
      for (let x = 0; x < BW; x++) {
        // An arch: shoulders cut off the top corners, a notch under the middle.
        const corner = y < 2 && (x < 2 - y || x > BW - 3 + y);
        const notch = y >= BH - 3 && x >= 4 && x <= BW - 5;
        cells[y * BW + x] = corner || notch ? 0 : 1;
      }
    }
    return { cells };
  }

  private lose() {
    this.phase = "over";
    this.phaseTimer = 2.6;
    this.bombs = [];
    this.bullet = null;
  }

  // Formation ------------------------------------------------------------------

  private interval() {
    const left = this.alive.reduce((n, a) => n + (a ? 1 : 0), 0);
    const frac = left / this.alive.length;
    const travel = Math.max(this.cell * 4, this.w - this.cols * this.cell);
    const steps = travel / (this.cell * 0.25);
    const base = clamp(SWEEP / steps, 0.06, 0.6) * Math.max(0.6, Math.pow(0.92, this.wave - 1));
    return Math.max(0.055, base * (0.12 + 0.88 * frac));
  }

  private march() {
    const [lo, hi] = this.aliveSpan();
    if (lo < 0) return;
    const m = this.cell * 0.6;
    const dx = this.cell * 0.25 * this.dir;
    const left = this.gx + dx + lo * this.cell;
    const right = this.gx + dx + hi * this.cell;
    if ((this.dir > 0 && right > this.w - m) || (this.dir < 0 && left < m)) {
      this.gy += this.rowH * 0.5;
      this.dir = -this.dir;
    } else {
      this.gx += dx;
    }
    this.frame ^= 1;
  }

  private aliveSpan(): [number, number] {
    let lo = -1;
    let hi = -1;
    for (let c = 0; c < this.cols; c++) {
      for (let r = 0; r < ROWS; r++) {
        if (this.alive[r * this.cols + c]) {
          if (lo < 0) lo = c;
          hi = c;
          break;
        }
      }
    }
    return [lo, hi];
  }

  private bottomRow(c: number) {
    for (let r = ROWS - 1; r >= 0; r--) if (this.alive[r * this.cols + c]) return r;
    return -1;
  }

  private lowestY() {
    let y = -Infinity;
    for (let c = 0; c < this.cols; c++) {
      const r = this.bottomRow(c);
      if (r >= 0) y = Math.max(y, this.vy + r * this.rowH);
    }
    return y;
  }

  /**
   * Where the grid's origin will be t seconds from now: replays the march,
   * edge turns included, so the cannon can lead a shot into a turn.
   */
  private predictGx(t: number) {
    const [lo, hi] = this.aliveSpan();
    const m = this.cell * 0.6;
    const step = this.cell * 0.25;
    const every = this.interval();
    let gx = this.gx;
    let dir = this.dir;
    for (let s = this.stepTimer; s <= t; s += every) {
      const next = gx + step * dir;
      if (
        (dir > 0 && next + hi * this.cell > this.w - m) ||
        (dir < 0 && next + lo * this.cell < m)
      ) {
        dir = -dir;
      } else gx = next;
    }
    return gx;
  }

  private dropBombs(dt: number) {
    this.bombTimer -= dt;
    if (this.bombTimer > 0 || this.vy < this.gy - this.rowH) return;
    const left = this.alive.reduce((n, a) => n + (a ? 1 : 0), 0);
    const frac = left / this.alive.length;
    this.bombTimer = (0.55 + Math.random() * 1.1) * (0.6 + 0.4 * frac);
    const max = this.w < 720 ? 2 : 3;
    if (this.bombs.length >= max) return;
    const cols: number[] = [];
    for (let c = 0; c < this.cols; c++) if (this.bottomRow(c) >= 0) cols.push(c);
    if (!cols.length) return;
    let c = cols[Math.floor(Math.random() * cols.length)];
    // Half the time, aim at the column nearest the cannon.
    if (Math.random() < 0.5) {
      let best = Infinity;
      for (const k of cols) {
        const d = Math.abs(this.vx + k * this.cell - this.cannonX);
        if (d < best) {
          best = d;
          c = k;
        }
      }
    }
    const r = this.bottomRow(c);
    this.bombs.push({
      x: this.vx + c * this.cell,
      y: this.vy + r * this.rowH + this.glyphR,
      vy: this.h * 0.3,
      color: ROW_COLORS[r],
      unseen: Math.random() < 0.12 ? 2 + Math.random() : 0.1 + Math.random() * 0.4,
    });
  }

  // Cannon AI -----------------------------------------------------------------

  private bulletSpeed() {
    return this.h * 1.4;
  }

  private updateCannon(dt: number) {
    this.reload -= dt;
    if (this.dead > 0) {
      this.dead -= dt;
      if (this.dead <= 0) this.dead = 0;
      // Stay put while hidden; the blink-in happens where it was lost.
      if (this.dead > 0.6) return;
    }
    const aim = this.pickTarget();
    let want = aim ?? this.cannonX;
    if (this.threatened(this.cannonX, 0)) {
      want = this.safeSpot(aim ?? this.cannonX);
    } else {
      // Don't walk into a bomb on the way to the target.
      const ahead = this.cannonX + Math.sign(want - this.cannonX) * this.cannonHW;
      if (this.threatened(ahead, 0.15)) want = this.cannonX;
    }
    this.driveCannon(dt, want);
    if (
      this.dead <= 0 &&
      aim !== null &&
      !this.bullet &&
      this.reload <= 0 &&
      this.vy > this.gy - this.rowH &&
      Math.abs(this.cannonX - aim) < this.cell * 0.18
    ) {
      this.bullet = {
        x: this.cannonX,
        y: this.cannonY - this.cannonH,
        vy: -this.bulletSpeed(),
        color: "primary",
        unseen: 0,
      };
      this.reload = 0.28;
    }
  }

  private driveCannon(dt: number, want: number) {
    const vmax = clamp(this.w * 0.32, 140, 520);
    const desired = clamp((want - this.cannonX) * 7, -vmax, vmax);
    this.cannonV += (desired - this.cannonV) * (1 - Math.exp(-dt * 12));
    this.cannonX = clamp(this.cannonX + this.cannonV * dt, this.cannonHW, this.w - this.cannonHW);
  }

  /** Where to stand to hit the best column, leading for the grid's march. */
  private pickTarget(): number | null {
    let best: number | null = null;
    let bestScore = Infinity;
    for (let c = 0; c < this.cols; c++) {
      const r = this.bottomRow(c);
      if (r < 0) continue;
      const ay = this.vy + r * this.rowH;
      const t = (this.cannonY - this.cannonH - ay) / this.bulletSpeed();
      const px = this.predictGx(t) + c * this.cell;
      let score = Math.abs(px - this.cannonX) / this.cell - r * 0.4;
      // Prefer clear lanes over shooting through its own bunkers.
      if (this.bunkerAt(px, this.bunkerTop - 1)) score += 4;
      if (score < bestScore) {
        bestScore = score;
        best = px;
      }
    }
    return best;
  }

  /** True when a bomb will land on a cannon at x within the next moment. */
  private threatened(x: number, extra: number) {
    const pad = this.cannonHW + this.cell * 0.3;
    for (const b of this.bombs) {
      if (b.y > this.cannonY || b.unseen > 0) continue;
      const t = (this.cannonY - this.cannonH - b.y) / b.vy;
      if (t > 1.1 + extra || Math.abs(b.x - x) > pad) continue;
      if (this.bunkerAt(b.x, b.y)) continue;
      return true;
    }
    return false;
  }

  private safeSpot(prefer: number) {
    let best = this.cannonX;
    let bestScore = Infinity;
    const stepX = this.cell * 0.25;
    for (let x = this.cannonHW; x <= this.w - this.cannonHW; x += stepX) {
      if (this.threatened(x, 0.2)) continue;
      const score = Math.abs(x - this.cannonX) + 0.3 * Math.abs(x - prefer);
      if (score < bestScore) {
        bestScore = score;
        best = x;
      }
    }
    return best;
  }

  // Shots, bunkers and hits ------------------------------------------------------

  private shots(): Shot[] {
    return this.bullet ? [this.bullet, ...this.bombs] : this.bombs;
  }

  private moveShots(dt: number) {
    if (this.bullet) {
      this.bullet.y += this.bullet.vy * dt;
      if (this.bullet.y < -this.cell) this.bullet = null;
    }
    for (const b of this.bombs) {
      b.y += b.vy * dt;
      b.unseen -= dt;
    }
    this.bombs = this.bombs.filter((b) => b.y < this.h + this.cell);
  }

  private collide() {
    const R = this.glyphR;
    const b = this.bullet;
    if (b) {
      // Bullet against the grid.
      outer: for (let r = ROWS - 1; r >= 0; r--) {
        const ay = this.vy + r * this.rowH;
        if (Math.abs(b.y - ay) > R * 1.1) continue;
        for (let c = 0; c < this.cols; c++) {
          const i = r * this.cols + c;
          if (!this.alive[i]) continue;
          const ax = this.vx + c * this.cell;
          if (Math.abs(b.x - ax) < R * 1.15) {
            this.alive[i] = false;
            this.score += (ROWS - r) * 10;
            this.burst(ax, ay, ROW_COLORS[r], 14);
            this.bullet = null;
            break outer;
          }
        }
      }
    }
    if (this.bullet && this.erode(this.bullet.x, this.bullet.y)) this.bullet = null;
    // Bullet against bombs: both go.
    if (this.bullet) {
      const k = this.bombs.findIndex(
        (q) => Math.abs(q.x - this.bullet!.x) < R * 0.6 && Math.abs(q.y - this.bullet!.y) < R,
      );
      if (k >= 0) {
        this.burst(this.bombs[k].x, this.bombs[k].y, "fg", 6);
        this.bombs.splice(k, 1);
        this.bullet = null;
      }
    }
    // Bombs against bunkers and the cannon.
    const keep: Shot[] = [];
    for (const q of this.bombs) {
      if (this.erode(q.x, q.y)) continue;
      if (
        this.dead <= 0 &&
        q.y > this.cannonY - this.cannonH &&
        q.y < this.cannonY + 2 &&
        Math.abs(q.x - this.cannonX) < this.cannonHW
      ) {
        this.hitCannon();
        return;
      }
      keep.push(q);
    }
    this.bombs = keep;
    // A low grid grinds through the bunkers it passes over.
    if (this.lowestY() + R > this.bunkerTop) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (!this.alive[r * this.cols + c]) continue;
          const x = this.vx + c * this.cell;
          const y = this.vy + r * this.rowH;
          if (y + R > this.bunkerTop) this.clearBox(x - R, y - R, x + R, y + R);
        }
      }
    }
  }

  private hitCannon() {
    this.burst(this.cannonX, this.cannonY - this.cannonH / 2, "primary", 28);
    this.lives--;
    this.bombs = [];
    if (this.lives <= 0) {
      this.lose();
      return;
    }
    this.dead = 1.6;
    this.cannonV = 0;
  }

  private bunkerCellSize() {
    return (this.cell * 1.7) / BW;
  }

  private bunkerLeft(i: number) {
    const cx = (this.w * (i + 1)) / (this.bunkerCount + 1);
    return cx - this.bunkerW / 2;
  }

  /** The bunker and cell under a point, if any. */
  private cellAt(x: number, y: number): [Bunker, number, number] | null {
    const cs = this.bunkerCellSize();
    const cy = Math.floor((y - this.bunkerTop) / cs);
    if (cy < 0 || cy >= BH) return null;
    for (let i = 0; i < this.bunkers.length; i++) {
      const cx = Math.floor((x - this.bunkerLeft(i)) / cs);
      if (cx >= 0 && cx < BW) return [this.bunkers[i], cx, cy];
    }
    return null;
  }

  /** True when standing bunker cells lie in the column at x, below y. */
  private bunkerAt(x: number, y: number) {
    const cs = this.bunkerCellSize();
    for (let i = 0; i < this.bunkers.length; i++) {
      const cx = Math.floor((x - this.bunkerLeft(i)) / cs);
      if (cx < 0 || cx >= BW) continue;
      const from = Math.max(0, Math.floor((y - this.bunkerTop) / cs));
      for (let cy = from; cy < BH; cy++) if (this.bunkers[i].cells[cy * BW + cx]) return true;
    }
    return false;
  }

  /** Erodes a ragged crater where a shot meets a standing cell. */
  private erode(x: number, y: number) {
    const hit = this.cellAt(x, y);
    if (!hit) return false;
    const [b, cx, cy] = hit;
    if (!b.cells[cy * BW + cx]) return false;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const x2 = cx + dx;
        const y2 = cy + dy;
        if (x2 < 0 || x2 >= BW || y2 < 0 || y2 >= BH) continue;
        const d = Math.hypot(dx, dy);
        if (d <= 1 || (d <= 2.3 && Math.random() < 0.45)) b.cells[y2 * BW + x2] = 0;
      }
    }
    return true;
  }

  private clearBox(x0: number, y0: number, x1: number, y1: number) {
    const cs = this.bunkerCellSize();
    for (let i = 0; i < this.bunkers.length; i++) {
      const left = this.bunkerLeft(i);
      for (let cy = 0; cy < BH; cy++) {
        const yy = this.bunkerTop + (cy + 0.5) * cs;
        if (yy < y0 || yy > y1) continue;
        for (let cx = 0; cx < BW; cx++) {
          const xx = left + (cx + 0.5) * cs;
          if (xx >= x0 && xx <= x1) this.bunkers[i].cells[cy * BW + cx] = 0;
        }
      }
    }
  }

  // Particles ---------------------------------------------------------------------

  private burst(x: number, y: number, color: Accent, n: number) {
    for (let i = 0; i < n && this.sparks.length < MAX_SPARKS; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = this.cell * (1.5 + Math.random() * 3);
      const life = 0.3 + Math.random() * 0.45;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life,
        max: life,
        color,
      });
    }
  }

  private stepSparks(dt: number) {
    const drag = Math.exp(-dt * 3);
    for (const p of this.sparks) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= drag;
      p.vy *= drag;
    }
    this.sparks = this.sparks.filter((p) => p.life > 0);
  }

  // Drawing helpers -------------------------------------------------------------------

  private drawBunkers(ctx: CanvasRenderingContext2D, theme: ArcadeTheme) {
    // Each row of cells is drawn as stroked runs, so the bunker reads as a
    // hatched line shape that frays where it is hit.
    const cs = this.bunkerCellSize();
    ctx.strokeStyle = theme.strong;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = Math.max(1, cs * 0.5);
    ctx.beginPath();
    for (let i = 0; i < this.bunkers.length; i++) {
      const left = this.bunkerLeft(i);
      const cells = this.bunkers[i].cells;
      for (let cy = 0; cy < BH; cy++) {
        const y = this.bunkerTop + (cy + 0.5) * cs;
        let run = -1;
        for (let cx = 0; cx <= BW; cx++) {
          const on = cx < BW && cells[cy * BW + cx] === 1;
          if (on && run < 0) run = cx;
          if (!on && run >= 0) {
            ctx.moveTo(left + (run + 0.3) * cs, y);
            ctx.lineTo(left + (cx - 0.3) * cs, y);
            run = -1;
          }
        }
      }
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.lineWidth = this.lw;
  }

  private drawCannon(ctx: CanvasRenderingContext2D, x: number, y: number, k: number) {
    const hw = this.cannonHW * k;
    const h = this.cannonH * k;
    ctx.beginPath();
    ctx.moveTo(x - hw, y);
    ctx.lineTo(x + hw, y);
    ctx.lineTo(x + hw * 0.7, y - h * 0.45);
    ctx.lineTo(x - hw * 0.7, y - h * 0.45);
    ctx.closePath();
    ctx.moveTo(x - hw * 0.22, y - h * 0.45);
    ctx.lineTo(x, y - h);
    ctx.lineTo(x + hw * 0.22, y - h * 0.45);
    ctx.stroke();
  }

  /** Adds one invader glyph to the current path, centered at x, y. */
  private glyph(
    ctx: CanvasRenderingContext2D,
    row: number,
    x: number,
    y: number,
    r: number,
    frame: number,
  ) {
    const o = frame ? r * 0.12 : 0;
    switch (row) {
      case 0: {
        // </>
        ctx.moveTo(x - r * 0.45 - o, y - r * 0.6);
        ctx.lineTo(x - r - o, y);
        ctx.lineTo(x - r * 0.45 - o, y + r * 0.6);
        ctx.moveTo(x + r * 0.2, y - r * 0.75);
        ctx.lineTo(x - r * 0.2, y + r * 0.75);
        ctx.moveTo(x + r * 0.45 + o, y - r * 0.6);
        ctx.lineTo(x + r + o, y);
        ctx.lineTo(x + r * 0.45 + o, y + r * 0.6);
        break;
      }
      case 1: {
        // { }
        for (const s of [-1, 1]) {
          const bx = x + s * (r * 0.75 + o);
          const ex = bx - s * r * 0.35;
          ctx.moveTo(bx, y - r * 0.8);
          ctx.quadraticCurveTo(ex, y - r * 0.8, ex, y - r * 0.4);
          ctx.quadraticCurveTo(ex, y, ex - s * r * 0.3, y);
          ctx.quadraticCurveTo(ex, y, ex, y + r * 0.4);
          ctx.quadraticCurveTo(ex, y + r * 0.8, bx, y + r * 0.8);
        }
        break;
      }
      case 2: {
        // 404, the middle zero squeezing in and out.
        const cw = r * 0.55;
        for (const s of [-1, 1]) {
          const cx = x + s * (r * 0.72 + o * 0.5);
          ctx.moveTo(cx + cw * 0.15, y + r * 0.7);
          ctx.lineTo(cx + cw * 0.15, y - r * 0.7);
          ctx.lineTo(cx - cw * 0.5, y + r * 0.2);
          ctx.lineTo(cx + cw * 0.5, y + r * 0.2);
        }
        const zx = r * (0.24 - (frame ? 0.04 : 0));
        ctx.moveTo(x + zx, y);
        ctx.ellipse(x, y, zx, r * 0.68, 0, 0, Math.PI * 2);
        break;
      }
      case 3: {
        // [ . ] with the dot bobbing.
        for (const s of [-1, 1]) {
          const bx = x + s * r * 0.85;
          ctx.moveTo(bx - s * r * 0.35, y - r * 0.75);
          ctx.lineTo(bx, y - r * 0.75);
          ctx.lineTo(bx, y + r * 0.75);
          ctx.lineTo(bx - s * r * 0.35, y + r * 0.75);
        }
        const dy = frame ? -r * 0.2 : r * 0.2;
        ctx.moveTo(x + r * 0.16, y + dy);
        ctx.arc(x, y + dy, r * 0.16, 0, Math.PI * 2);
        break;
      }
      default: {
        // <-> with the chevrons pulsing out.
        ctx.moveTo(x - r * 0.5 - o, y - r * 0.55);
        ctx.lineTo(x - r - o, y);
        ctx.lineTo(x - r * 0.5 - o, y + r * 0.55);
        ctx.moveTo(x + r * 0.5 + o, y - r * 0.55);
        ctx.lineTo(x + r + o, y);
        ctx.lineTo(x + r * 0.5 + o, y + r * 0.55);
        ctx.moveTo(x - r * 0.35, y);
        ctx.lineTo(x + r * 0.35, y);
        break;
      }
    }
  }
}

export const createFormation: CabinetFactory = () => new FormationGame();

export default createFormation;
