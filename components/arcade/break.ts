/*
 * Break: a brick breaker in attract mode. The wall spells 404, and an AI
 * paddle works it down. The paddle predicts where the ball will land, walls
 * and all, and tries to meet it off center to send it at a standing brick,
 * with a guess that loosens as the ball speeds up. A cleared wall, or three
 * missed balls, rebuilds the wall after a beat.
 */

import type { ArcadeTheme, Cabinet, CabinetFactory } from "./cabinet";

const LIVES = 3;
/** The widest return, in radians from straight up, for a ball off the paddle's tip. */
const MAX_ANGLE = (60 * Math.PI) / 180;

/** Five by seven glyphs; each # is a brick. */
const GLYPHS: Record<string, string[]> = {
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
};
const WORD = "404";
const ROWS = 7;
const COLS = WORD.length * 6 - 1;

type Hue = "cyan" | "primary" | "green" | "amber" | "pink" | "purple";
/** One accent per row, top to bottom, so the wall reads as bands of color. */
const ROW_HUES: Hue[] = ["pink", "amber", "green", "cyan", "primary", "purple", "pink"];

interface Brick {
  col: number;
  row: number;
  alive: boolean;
}

interface Bit {
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number;
  spin: number;
  life: number;
  hue: Hue;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function noise(): number {
  return (Math.random() + Math.random() + Math.random() - 1.5) / 0.5;
}

function layout(): Brick[] {
  const bricks: Brick[] = [];
  for (let g = 0; g < WORD.length; g++) {
    const glyph = GLYPHS[WORD[g]];
    for (let row = 0; row < ROWS; row++) {
      for (let c = 0; c < 5; c++) {
        if (glyph[row][c] === "#") bricks.push({ col: g * 6 + c, row, alive: true });
      }
    }
  }
  return bricks;
}

export const createBreak: CabinetFactory = (): Cabinet => {
  let w = 800;
  let h = 600;
  let s = 1;
  let bw = 40;
  let bh = 20;
  let gridX = 0;
  let gridY = 0;
  let padW = 100;
  let padH = 10;
  let padY = 560;
  let r = 6;

  let bricks = layout();
  let alive = bricks.length;
  const bits: Bit[] = [];
  const ball = { x: 0, y: 0, vx: 0, vy: 0, speed: 0 };
  const trail: { x: number; y: number }[] = [];
  const paddle = { x: 400, vx: 0, target: 400, error: 0, aim: 0, read: false };
  let misses = 0;
  let score = 0;
  /** Seconds until play resumes; the ball rests on the paddle meanwhile. */
  let pause = 1;
  let rebuild = false;
  let started = false;
  let oldS = 1;

  function baseSpeed(): number {
    return 430 * s;
  }

  function maxSpeed(): number {
    return 760 * s;
  }

  function serve() {
    ball.speed = baseSpeed();
    const a = (Math.random() - 0.5) * 0.8;
    ball.vx = Math.sin(a) * ball.speed;
    ball.vy = -Math.cos(a) * ball.speed;
    ball.x = paddle.x;
    ball.y = padY - r - 1;
    trail.length = 0;
    paddle.read = false;
  }

  /** Where the ball meets the paddle's line, folding in bounces off the side walls. */
  function landing(): number {
    if (ball.vy <= 0) return ball.x;
    const t = (padY - r - ball.y) / ball.vy;
    const lo = r;
    const span = w - 2 * r;
    let x = ball.x + ball.vx * t - lo;
    const period = span * 2;
    x = ((x % period) + period) % period;
    return lo + (x > span ? period - x : x);
  }

  function brickRect(b: Brick) {
    return { x: gridX + b.col * bw, y: gridY + b.row * bh, w: bw, h: bh };
  }

  function burst(b: Brick) {
    const q = brickRect(b);
    const hue = ROW_HUES[b.row];
    for (let i = 0; i < 9; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = (40 + Math.random() * 110) * s;
      bits.push({
        x: q.x + q.w * (0.2 + Math.random() * 0.6),
        y: q.y + q.h * (0.2 + Math.random() * 0.6),
        vx: Math.cos(a) * v + ball.vx * 0.08,
        vy: Math.sin(a) * v + ball.vy * 0.08,
        a: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 10,
        life: 1,
        hue,
      });
    }
  }

  function aimPaddle(dt: number) {
    if (pause <= 0 && ball.vy > 0) {
      if (!paddle.read) {
        // One guess per descent: a little off, more so when the ball is fast,
        // and an offset meant to steer the return at a brick still standing.
        paddle.read = true;
        const heat = clamp((ball.speed - baseSpeed()) / (maxSpeed() - baseSpeed()), 0, 1);
        paddle.error = noise() * padW * (0.06 + 0.22 * heat);
        const land = landing();
        const left = bricks.filter((b) => b.alive);
        if (left.length > 0) {
          const q = brickRect(left[Math.floor(Math.random() * left.length)]);
          const ang = Math.atan2(q.x + q.w / 2 - land, padY - (q.y + q.h / 2));
          paddle.aim = clamp(ang / MAX_ANGLE, -0.85, 0.85);
        } else {
          paddle.aim = 0;
        }
      }
      paddle.target = landing() - paddle.aim * (padW / 2) + paddle.error;
    } else {
      paddle.read = false;
      // On the way up, drift loosely under the ball.
      paddle.target = w / 2 + (ball.x - w / 2) * 0.6;
    }
    const cap = w * 1.1 + 400 * s;
    const want = clamp((paddle.target - paddle.x) * 10, -cap, cap);
    paddle.vx += (want - paddle.vx) * Math.min(1, dt * 14);
    paddle.x = clamp(paddle.x + paddle.vx * dt, padW / 2, w - padW / 2);
  }

  /** Moves the ball a short distance and resolves walls, paddle and bricks. */
  function advance(dt: number) {
    const py = ball.y;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    if (ball.x < r) {
      ball.x = 2 * r - ball.x;
      ball.vx = Math.abs(ball.vx);
    } else if (ball.x > w - r) {
      ball.x = 2 * (w - r) - ball.x;
      ball.vx = -Math.abs(ball.vx);
    }
    if (ball.y < r) {
      ball.y = 2 * r - ball.y;
      ball.vy = Math.abs(ball.vy);
    }

    const face = padY - r;
    if (ball.vy > 0 && py <= face && ball.y > face) {
      const off = (ball.x - paddle.x) / (padW / 2 + r);
      if (Math.abs(off) <= 1) {
        ball.speed = Math.min(maxSpeed(), ball.speed * 1.01);
        const a = clamp(off, -1, 1) * MAX_ANGLE;
        ball.vx = Math.sin(a) * ball.speed + paddle.vx * 0.05;
        ball.vy = -Math.cos(a) * ball.speed;
        ball.y = face;
      }
    }

    for (const b of bricks) {
      if (!b.alive) continue;
      const q = brickRect(b);
      const nx = clamp(ball.x, q.x, q.x + q.w);
      const ny = clamp(ball.y, q.y, q.y + q.h);
      const dx = ball.x - nx;
      const dy = ball.y - ny;
      if (dx * dx + dy * dy > r * r) continue;
      // Bounce off the side the ball went in deepest from.
      const ox = Math.min(ball.x + r - q.x, q.x + q.w - (ball.x - r));
      const oy = Math.min(ball.y + r - q.y, q.y + q.h - (ball.y - r));
      if (ox < oy) ball.vx = ball.x < q.x + q.w / 2 ? -Math.abs(ball.vx) : Math.abs(ball.vx);
      else ball.vy = ball.y < q.y + q.h / 2 ? -Math.abs(ball.vy) : Math.abs(ball.vy);
      b.alive = false;
      alive--;
      score += 10 * (ROWS - b.row);
      ball.speed = Math.min(maxSpeed(), ball.speed * 1.015);
      const k = ball.speed / Math.hypot(ball.vx, ball.vy);
      ball.vx *= k;
      ball.vy *= k;
      burst(b);
      break;
    }

    // Never let the ball settle into a near-flat path that takes forever.
    const minVy = ball.speed * 0.32;
    if (Math.abs(ball.vy) < minVy) {
      ball.vy = (ball.vy < 0 ? -1 : 1) * minVy;
      ball.vx = Math.sign(ball.vx || 1) * Math.sqrt(ball.speed * ball.speed - minVy * minVy);
    }
  }

  return {
    title: "Break",

    resize(width, height) {
      const oldW = w;
      const oldH = h;
      w = Math.max(1, width);
      h = Math.max(1, height);
      s = clamp(Math.min(w, h) / 800, 0.5, 1.8);
      const wall = Math.min(w * 0.86, 920 * Math.max(1, s * 0.8));
      bw = wall / COLS;
      bh = bw * 0.52;
      gridX = (w - wall) / 2;
      gridY = clamp(h * 0.09, 40, 140);
      padW = clamp(w * 0.09, 64, 160);
      padH = clamp(8 * s, 6, 12);
      padY = h - clamp(h * 0.07, 36, 90);
      r = clamp(6 * s, 4, 9);
      if (!started) {
        started = true;
        oldS = s;
        paddle.x = paddle.target = w / 2;
        serve();
        return;
      }
      const kx = w / oldW;
      const ky = h / oldH;
      paddle.x = clamp(paddle.x * kx, padW / 2, w - padW / 2);
      paddle.target *= kx;
      paddle.vx = 0;
      paddle.read = false;
      ball.x = clamp(ball.x * kx, r, w - r);
      ball.y *= ky;
      ball.speed = clamp(ball.speed * (s / Math.max(0.01, oldS)), baseSpeed(), maxSpeed());
      const k = ball.speed / Math.max(1e-6, Math.hypot(ball.vx, ball.vy));
      ball.vx *= k;
      ball.vy *= k;
      oldS = s;
      trail.length = 0;
      bits.length = 0;
    },

    step(dt) {
      if (dt <= 0) return;
      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.vy += 220 * s * dt;
        b.vx *= 1 - dt * 1.5;
        b.a += b.spin * dt;
        b.life -= dt * 1.6;
        if (b.life <= 0) bits.splice(i, 1);
      }

      if (pause > 0) {
        pause -= dt;
        aimPaddle(dt);
        if (pause <= 0) {
          if (rebuild) {
            bricks = layout();
            alive = bricks.length;
            misses = 0;
            score = 0;
            rebuild = false;
          }
          serve();
        } else {
          // The ball rides on the paddle while it waits.
          ball.x = paddle.x;
          ball.y = padY - r - 1;
        }
        return;
      }

      aimPaddle(dt);
      // Sub-steps keep a fast ball from skipping through a brick.
      const dist = ball.speed * dt;
      const n = Math.max(1, Math.ceil(dist / (r * 0.8)));
      for (let i = 0; i < n; i++) advance(dt / n);

      trail.push({ x: ball.x, y: ball.y });
      if (trail.length > 12) trail.shift();

      if (alive <= 0) {
        rebuild = true;
        pause = 1.8;
      } else if (ball.y > h + r * 2) {
        misses++;
        if (misses >= LIVES) rebuild = true;
        pause = rebuild ? 1.8 : 0.9;
      }
    },

    draw(ctx: CanvasRenderingContext2D, theme: ArcadeTheme) {
      const lw = clamp(1.5 * s, 1.25, 2.25);
      ctx.save();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // Bricks: a pale fill, a sparse dot dither, and a crisp outline.
      const gap = Math.max(2, bw * 0.08);
      const dot = Math.max(1, s);
      for (const b of bricks) {
        if (!b.alive) continue;
        const q = brickRect(b);
        const x = q.x + gap / 2;
        const y = q.y + gap / 2;
        const bwi = q.w - gap;
        const bhi = q.h - gap;
        const color = theme[ROW_HUES[b.row]];
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.12;
        ctx.fillRect(x, y, bwi, bhi);
        ctx.globalAlpha = 0.45;
        const step = Math.max(5, 7 * s);
        ctx.beginPath();
        for (let dy = step / 2; dy < bhi - 1; dy += step) {
          const shift = (Math.round(dy / step) % 2) * (step / 2);
          for (let dx = step / 2 + shift; dx < bwi - 1; dx += step) {
            ctx.rect(x + dx, y + dy, dot, dot);
          }
        }
        ctx.fill();
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = color;
        ctx.lineWidth = lw;
        ctx.strokeRect(x, y, bwi, bhi);
      }
      ctx.globalAlpha = 1;

      // Shards from broken bricks tumble, fall and fade.
      ctx.lineWidth = lw;
      for (const b of bits) {
        const len = 5 * s * (0.5 + b.life * 0.5);
        ctx.globalAlpha = Math.max(0, b.life) * 0.85;
        ctx.strokeStyle = theme[b.hue];
        ctx.beginPath();
        ctx.moveTo(b.x - Math.cos(b.a) * len, b.y - Math.sin(b.a) * len);
        ctx.lineTo(b.x + Math.cos(b.a) * len, b.y + Math.sin(b.a) * len);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // The paddle, with a faint additive halo in the dark.
      const px = paddle.x - padW / 2;
      const py = padY;
      const rad = padH / 2;
      if (theme.dark) {
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.12;
        ctx.strokeStyle = theme.primary;
        ctx.lineWidth = lw * 5;
        ctx.beginPath();
        ctx.roundRect(px, py, padW, padH, rad);
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.beginPath();
      ctx.roundRect(px, py, padW, padH, rad);
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = theme.primary;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = lw;
      ctx.stroke();

      // Ball and its fading trail.
      if (ball.y < h + r) {
        if (theme.dark) ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = theme.fg;
        for (let i = 0; i < trail.length - 1; i++) {
          const t = (i + 1) / trail.length;
          ctx.globalAlpha = t * t * 0.2;
          ctx.beginPath();
          ctx.arc(trail[i].x, trail[i].y, r * (0.4 + 0.6 * t), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Score and balls left, quietly in the bottom corners.
      const size = Math.round(clamp(12 * s, 11, 18));
      ctx.font = `${size}px ${theme.mono}`;
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";
      ctx.fillStyle = theme.muted;
      const base = h - clamp(h * 0.025, 12, 28);
      ctx.fillText(String(score).padStart(4, "0"), clamp(w * 0.03, 14, 48), base);
      ctx.strokeStyle = theme.muted;
      ctx.lineWidth = lw;
      for (let i = 0; i < LIVES; i++) {
        const cx = w - clamp(w * 0.03, 14, 48) - i * size * 1.2 - size * 0.35;
        ctx.beginPath();
        ctx.arc(cx, base - size * 0.35, size * 0.3, 0, Math.PI * 2);
        if (i < LIVES - misses) {
          ctx.fillStyle = theme.muted;
          ctx.fill();
        }
        ctx.stroke();
      }

      ctx.restore();
    },
  };
};

export default createBreak;
