/*
 * Rally: paddle tennis in attract mode. Two AI paddles trade a ball that
 * speeds up with every hit. Each paddle reads the ball late, moves at a
 * capped speed and misjudges more as the ball gets faster, so rallies run
 * long but always end. First to seven takes the game, and a new one starts.
 */

import type { ArcadeTheme, Cabinet, CabinetFactory } from "./cabinet";

const WIN_SCORE = 7;
const TRAIL = 14;
/** The steepest return, in radians from horizontal, for a ball off a paddle's tip. */
const MAX_ANGLE = (52 * Math.PI) / 180;

interface Paddle {
  y: number;
  vy: number;
  /** Where the paddle is trying to be. */
  target: number;
  /** Seconds left before the paddle reacts to the latest read of the ball. */
  delay: number;
  /** The guess this paddle made about the incoming ball, settled once per approach. */
  error: number;
  /** Where on its face the paddle means to meet the ball, to aim the return. */
  aim: number;
  /** True once this paddle has read the current approach. */
  read: boolean;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: 0 | 1;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** A rough normal sample; the sum of uniforms is plenty for game noise. */
function noise(): number {
  return (Math.random() + Math.random() + Math.random() - 1.5) / 0.5;
}

export const createRally: CabinetFactory = (): Cabinet => {
  let w = 800;
  let h = 600;
  let s = 1;
  let top = 0;
  let bottom = 0;
  let padH = 80;
  let padW = 10;
  let leftX = 0;
  let rightX = 0;
  let r = 5;

  const paddles: [Paddle, Paddle] = [makePaddle(), makePaddle()];
  const score: [number, number] = [0, 0];
  const ball = { x: 0, y: 0, vx: 0, vy: 0, speed: 0 };
  const trail: { x: number; y: number }[] = [];
  const sparks: Spark[] = [];
  /** Seconds of quiet before the next serve, after a point or a game. */
  let pause = 1;
  let winner = -1;
  let serveDir = Math.random() < 0.5 ? -1 : 1;
  let started = false;

  function makePaddle(): Paddle {
    return { y: 300, vy: 0, target: 300, delay: 0, error: 0, aim: 0, read: false };
  }

  function baseSpeed(): number {
    return w / 2.3;
  }

  function maxSpeed(): number {
    return w / 0.8;
  }

  function serve() {
    ball.x = w / 2;
    ball.y = top + (bottom - top) * (0.3 + Math.random() * 0.4);
    ball.speed = baseSpeed();
    const a = (Math.random() - 0.5) * 0.7;
    ball.vx = Math.cos(a) * ball.speed * serveDir;
    ball.vy = Math.sin(a) * ball.speed;
    trail.length = 0;
    for (const p of paddles) p.read = false;
  }

  /** Where the ball will cross x, folding in bounces off the top and bottom walls. */
  function predictY(x: number): number {
    if (ball.vx === 0) return ball.y;
    const t = (x - ball.x) / ball.vx;
    if (t < 0) return ball.y;
    const lo = top + r;
    const span = bottom - r - lo;
    if (span <= 0) return ball.y;
    let y = ball.y + ball.vy * t - lo;
    const period = span * 2;
    y = ((y % period) + period) % period;
    return lo + (y > span ? period - y : y);
  }

  function burst(x: number, y: number, dir: number, color: 0 | 1) {
    for (let i = 0; i < 7; i++) {
      const a = (Math.random() - 0.5) * 1.6;
      const v = (60 + Math.random() * 120) * s;
      sparks.push({ x, y, vx: Math.cos(a) * v * dir, vy: Math.sin(a) * v, life: 1, color });
    }
  }

  function think(i: 0 | 1, dt: number) {
    const p = paddles[i];
    const faceX = i === 0 ? leftX + padW : rightX;
    const coming = i === 0 ? ball.vx < 0 : ball.vx > 0;
    const live = pause <= 0;

    if (live && coming) {
      if (!p.read) {
        // One read per approach: a late reaction and a guess whose spread
        // grows with the ball's speed, so fast rallies end in a miss.
        p.read = true;
        p.delay = 0.12 + Math.random() * 0.16;
        const heat = clamp((ball.speed - baseSpeed()) / (maxSpeed() - baseSpeed()), 0, 1);
        p.error = noise() * padH * (0.14 + 0.5 * heat);
        p.aim = (Math.random() - 0.5) * 1.3;
      }
      p.delay -= dt;
      if (p.delay <= 0) p.target = predictY(faceX) + p.error - p.aim * padH * 0.4;
    } else {
      p.read = false;
      // Off duty, the paddle eases back toward the middle of the court.
      p.target = (top + bottom) / 2 + (ball.y - (top + bottom) / 2) * 0.25;
    }

    const cap = h * 0.95;
    const want = clamp((p.target - p.y) * 9, -cap, cap);
    p.vy += (want - p.vy) * Math.min(1, dt * 12);
    p.y += p.vy * dt;
    const half = padH / 2;
    if (p.y < top + half) {
      p.y = top + half;
      p.vy = 0;
    } else if (p.y > bottom - half) {
      p.y = bottom - half;
      p.vy = 0;
    }
  }

  function hit(i: 0 | 1) {
    const p = paddles[i];
    const off = clamp((ball.y - p.y) / (padH / 2 + r), -1, 1);
    ball.speed = Math.min(maxSpeed(), ball.speed * 1.06);
    const a = off * MAX_ANGLE + (Math.random() - 0.5) * 0.06;
    const dir = i === 0 ? 1 : -1;
    ball.vx = Math.cos(a) * ball.speed * dir;
    ball.vy = Math.sin(a) * ball.speed;
    ball.x = i === 0 ? leftX + padW + r : rightX - r;
    burst(ball.x, ball.y, dir, i);
  }

  function point(toward: 0 | 1) {
    score[toward]++;
    serveDir = toward === 0 ? 1 : -1;
    if (score[toward] >= WIN_SCORE) {
      winner = toward;
      pause = 2.6;
    } else {
      pause = 1.1;
    }
  }

  return {
    title: "Rally",

    resize(width, height) {
      const oldW = w;
      const oldH = h;
      w = Math.max(1, width);
      h = Math.max(1, height);
      s = clamp(Math.min(w, h) / 800, 0.5, 1.8);
      top = 28 * s;
      bottom = h - 28 * s;
      padH = clamp(h * 0.13, 56, 150);
      padW = clamp(9 * s, 6, 14);
      r = clamp(5.5 * s, 4, 9);
      const inset = clamp(w * 0.05, 18, 90);
      leftX = inset;
      rightX = w - inset - padW;
      if (!started) {
        started = true;
        for (const p of paddles) p.y = p.target = h / 2;
        serve();
        pause = 0.8;
        return;
      }
      // Keep the game in progress, scaled into the new court.
      const kx = w / oldW;
      const ky = h / oldH;
      ball.x *= kx;
      ball.y = clamp(ball.y * ky, top + r, bottom - r);
      ball.vx *= kx;
      ball.vy *= ky;
      ball.speed = Math.hypot(ball.vx, ball.vy);
      for (const p of paddles) {
        p.y = clamp(p.y * ky, top + padH / 2, bottom - padH / 2);
        p.target *= ky;
        p.vy = 0;
        p.read = false;
      }
      trail.length = 0;
    },

    step(dt) {
      if (dt <= 0) return;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const k = sparks[i];
        k.x += k.vx * dt;
        k.y += k.vy * dt;
        k.vx *= 1 - dt * 3;
        k.vy *= 1 - dt * 3;
        k.life -= dt * 2.2;
        if (k.life <= 0) sparks.splice(i, 1);
      }

      if (pause > 0) {
        pause -= dt;
        think(0, dt);
        think(1, dt);
        if (pause <= 0) {
          if (winner >= 0) {
            score[0] = 0;
            score[1] = 0;
            winner = -1;
          }
          serve();
        }
        return;
      }

      think(0, dt);
      think(1, dt);

      const px = ball.x;
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.y < top + r) {
        ball.y = 2 * (top + r) - ball.y;
        ball.vy = Math.abs(ball.vy);
      } else if (ball.y > bottom - r) {
        ball.y = 2 * (bottom - r) - ball.y;
        ball.vy = -Math.abs(ball.vy);
      }

      // Sweep the face so a fast ball can't tunnel through a paddle.
      const lFace = leftX + padW + r;
      const rFace = rightX - r;
      const reach = padH / 2 + r;
      if (ball.vx < 0 && px >= lFace && ball.x < lFace) {
        if (Math.abs(ball.y - paddles[0].y) <= reach) hit(0);
      } else if (ball.vx > 0 && px <= rFace && ball.x > rFace) {
        if (Math.abs(ball.y - paddles[1].y) <= reach) hit(1);
      }

      trail.push({ x: ball.x, y: ball.y });
      if (trail.length > TRAIL) trail.shift();

      if (ball.x < -r * 4) point(1);
      else if (ball.x > w + r * 4) point(0);
    },

    draw(ctx: CanvasRenderingContext2D, theme: ArcadeTheme) {
      const lw = clamp(1.5 * s, 1.25, 2.25);
      const colors = [theme.primary, theme.amber];
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Paddles: soft fill, crisp outline, a faint additive halo in the dark.
      for (let i = 0; i < 2; i++) {
        const p = paddles[i];
        const x = i === 0 ? leftX : rightX;
        const y = p.y - padH / 2;
        const rad = Math.min(padW / 2, 4 * s);
        if (theme.dark) {
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = 0.12;
          ctx.strokeStyle = colors[i];
          ctx.lineWidth = lw * 5;
          ctx.beginPath();
          ctx.roundRect(x, y, padW, padH, rad);
          ctx.stroke();
          ctx.globalCompositeOperation = "source-over";
        }
        ctx.beginPath();
        ctx.roundRect(x, y, padW, padH, rad);
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = lw;
        ctx.stroke();
      }

      // Sparks from the last hit fade out as they slow.
      ctx.lineWidth = lw;
      for (const k of sparks) {
        ctx.globalAlpha = Math.max(0, k.life) * 0.9;
        ctx.strokeStyle = colors[k.color];
        ctx.beginPath();
        ctx.moveTo(k.x, k.y);
        ctx.lineTo(k.x - k.vx * 0.03, k.y - k.vy * 0.03);
        ctx.stroke();
      }

      if (pause <= 0 || winner < 0) {
        // The trail thins and fades behind the ball.
        if (theme.dark) ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = theme.fg;
        for (let i = 0; i < trail.length - 1; i++) {
          const t = (i + 1) / trail.length;
          ctx.globalAlpha = t * t * 0.22;
          ctx.beginPath();
          ctx.arc(trail[i].x, trail[i].y, r * (0.4 + 0.6 * t), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = pause > 0 ? 0.35 : 1;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    },
  };
};

export default createRally;
