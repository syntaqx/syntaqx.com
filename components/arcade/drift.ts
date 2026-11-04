/*
 * Drift: a rock-field shooter in attract mode. A line-art ship with inertia
 * works a field of drifting rocks that split when shot. The ship's AI dodges
 * rocks on a collision course first, then turns to lead the best target and
 * fires, thrusting only to close range or keep a safe gap. Space wraps at
 * the edges. A hit ship breaks apart and returns at a safe spot after a
 * beat; a cleared field brings a new wave in from the edges.
 */

import type { ArcadeTheme, Cabinet, CabinetFactory } from "./cabinet";

const LABEL = '"Michroma", sans-serif';
const TAU = Math.PI * 2;

interface Rock {
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number;
  spin: number;
  /** 3 is the largest; 1 is the last size before a rock is gone. */
  size: 1 | 2 | 3;
  r: number;
  /** Radial offsets around the rim, which give each rock its outline. */
  shape: number[];
}

interface Shot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  rate: number;
  ship: boolean;
}

/** A piece of the ship's hull, tumbling away after a hit. */
interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  a: number;
  spin: number;
  len: number;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** The signed difference between two angles, folded into -PI..PI. */
function turnTo(from: number, to: number): number {
  let d = (to - from) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

export const createDrift: CabinetFactory = (): Cabinet => {
  let w = 800;
  let h = 600;
  let s = 1;
  let shipR = 12;
  let shotSpeed = 520;
  const shotLife = 0.85;

  const ship = { x: 400, y: 300, vx: 0, vy: 0, a: -Math.PI / 2, alive: true, thrust: false };
  /** Seconds of respawn shielding left; the ship blinks while it lasts. */
  let shield = 2;
  let respawn = 0;
  let cooldown = 0;
  /** A small, slowly wandering aim error, so not every shot connects. */
  let wobble = 0;
  let wobbleT = 0;
  /**
   * Every so often the pilot fixates on its target and stops watching for
   * danger for a moment. Without these lapses it would almost never die.
   */
  let focus = 10;
  let lapse = 0;
  const rocks: Rock[] = [];
  const shots: Shot[] = [];
  const sparks: Spark[] = [];
  const shards: Shard[] = [];
  let wave = 0;
  let waveDelay = 0;
  let started = false;

  function rockRadius(size: 1 | 2 | 3): number {
    return (size === 3 ? 44 : size === 2 ? 25 : 13) * s;
  }

  /** The shortest offset from a to b across the wrapped field. */
  function wrapD(d: number, span: number): number {
    if (d > span / 2) return d - span;
    if (d < -span / 2) return d + span;
    return d;
  }

  function makeRock(x: number, y: number, size: 1 | 2 | 3, vx: number, vy: number): Rock {
    const n = 8 + Math.floor(Math.random() * 4);
    const shape: number[] = [];
    for (let i = 0; i < n; i++) shape.push(0.72 + Math.random() * 0.34);
    return {
      x,
      y,
      vx,
      vy,
      a: Math.random() * TAU,
      spin: (Math.random() - 0.5) * 0.7,
      size,
      r: rockRadius(size),
      shape,
    };
  }

  /** Large rocks per wave, sized to the stage so small screens stay readable. */
  function waveCount(): number {
    const base = clamp(Math.round((w * h) / 330000), 2, 5);
    return Math.min(base + Math.floor(wave / 2), base + 3);
  }

  function spawnWave() {
    wave++;
    const n = waveCount();
    for (let i = 0; i < n; i++) {
      // Enter from an edge, well clear of the ship, drifting into the field.
      let x = 0;
      let y = 0;
      for (let tries = 0; tries < 12; tries++) {
        if (Math.random() < 0.5) {
          x = Math.random() * w;
          y = Math.random() < 0.5 ? -rockRadius(3) : h + rockRadius(3);
        } else {
          x = Math.random() < 0.5 ? -rockRadius(3) : w + rockRadius(3);
          y = Math.random() * h;
        }
        if (Math.hypot(wrapD(x - ship.x, w), wrapD(y - ship.y, h)) > 220 * s) break;
      }
      const toward = Math.atan2(h / 2 - y, w / 2 - x) + (Math.random() - 0.5) * 1.4;
      const v = (30 + Math.random() * 34) * s * (1 + Math.min(wave, 6) * 0.05);
      rocks.push(makeRock(x, y, 3, Math.cos(toward) * v, Math.sin(toward) * v));
    }
  }

  function burst(x: number, y: number, n: number, speed: number, isShip: boolean) {
    for (let i = 0; i < n && sparks.length < 260; i++) {
      const a = Math.random() * TAU;
      const v = speed * (0.3 + Math.random() * 0.7) * s;
      sparks.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: 1,
        rate: 1.2 + Math.random() * 1.2,
        ship: isShip,
      });
    }
  }

  function split(i: number) {
    const k = rocks[i];
    rocks.splice(i, 1);
    burst(k.x, k.y, 6 + k.size * 3, 70 + k.size * 20, false);
    if (k.size === 1) return;
    const next = (k.size - 1) as 1 | 2;
    const base = Math.atan2(k.vy, k.vx);
    const v = Math.hypot(k.vx, k.vy) * 1.25 + 14 * s;
    for (const side of [-1, 1]) {
      const a = base + side * (0.5 + Math.random() * 0.5);
      rocks.push(makeRock(k.x, k.y, next, Math.cos(a) * v, Math.sin(a) * v));
    }
  }

  function explode() {
    ship.alive = false;
    respawn = 2.2;
    burst(ship.x, ship.y, 26, 140, true);
    // Three hull edges break off and tumble with the ship's momentum.
    for (let i = 0; i < 3; i++) {
      const a = ship.a + (i * TAU) / 3;
      shards.push({
        x: ship.x + Math.cos(a) * shipR * 0.5,
        y: ship.y + Math.sin(a) * shipR * 0.5,
        vx: ship.vx * 0.5 + Math.cos(a) * 40 * s,
        vy: ship.vy * 0.5 + Math.sin(a) * 40 * s,
        a: a + Math.PI / 2,
        spin: (Math.random() - 0.5) * 5,
        len: shipR * 1.4,
      });
    }
  }

  /** Puts the ship back where rocks will be farthest away a second from now. */
  function placeShip() {
    let best = { x: w / 2, y: h / 2, d: -1 };
    for (let gy = 1; gy <= 4; gy++) {
      for (let gx = 1; gx <= 5; gx++) {
        const x = (gx / 6) * w;
        const y = (gy / 5) * h;
        let d = Infinity;
        for (const k of rocks) {
          const fx = k.x + k.vx * 1.2;
          const fy = k.y + k.vy * 1.2;
          d = Math.min(d, Math.hypot(wrapD(fx - x, w), wrapD(fy - y, h)) - k.r);
        }
        if (d > best.d) best = { x, y, d };
      }
    }
    ship.x = best.x;
    ship.y = best.y;
    ship.vx = 0;
    ship.vy = 0;
    ship.a = -Math.PI / 2;
    ship.alive = true;
    shield = 2;
  }

  function pilot(dt: number) {
    ship.thrust = false;
    // Danger first: the rock that will pass closest, soonest.
    let threat: Rock | null = null;
    let threatT = Infinity;
    let nearest = Infinity;
    for (const k of rocks) {
      const px = wrapD(k.x - ship.x, w);
      const py = wrapD(k.y - ship.y, h);
      const vx = k.vx - ship.vx;
      const vy = k.vy - ship.vy;
      const d = Math.hypot(px, py) - k.r;
      if (d < nearest) nearest = d;
      const vv = vx * vx + vy * vy;
      const t = vv > 1e-6 ? -(px * vx + py * vy) / vv : 0;
      if (t < 0 || t > 1.3) continue;
      const cx = px + vx * t;
      const cy = py + vy * t;
      if (lapse <= 0 && Math.hypot(cx, cy) < k.r + shipR * 2.2 && t < threatT) {
        threat = k;
        threatT = t;
      }
    }

    let heading = ship.a;
    let wantThrust = false;
    let fire = false;

    // Pick a target: the cheapest to reach by distance plus how far to turn.
    let target: Rock | null = null;
    let aimX = 0;
    let aimY = 0;
    let bestCost = Infinity;
    for (const k of rocks) {
      const px = wrapD(k.x - ship.x, w);
      const py = wrapD(k.y - ship.y, h);
      const vx = k.vx - ship.vx;
      const vy = k.vy - ship.vy;
      // Lead the shot: solve for when a bullet and the rock meet.
      const a = vx * vx + vy * vy - shotSpeed * shotSpeed;
      const b = 2 * (px * vx + py * vy);
      const c = px * px + py * py;
      const disc = b * b - 4 * a * c;
      if (disc < 0 || a === 0) continue;
      const sq = Math.sqrt(disc);
      const t1 = (-b - sq) / (2 * a);
      const t2 = (-b + sq) / (2 * a);
      const t = t1 > 0 && t2 > 0 ? Math.min(t1, t2) : Math.max(t1, t2);
      if (t <= 0) continue;
      const ix = px + vx * t;
      const iy = py + vy * t;
      const turn = Math.abs(turnTo(ship.a, Math.atan2(iy, ix)));
      const cost = Math.hypot(ix, iy) + turn * 120 * s + (4 - k.size) * 20 * s;
      if (cost < bestCost) {
        bestCost = cost;
        target = k;
        aimX = ix;
        aimY = iy;
      }
    }

    const range = shotSpeed * shotLife * 0.95;
    if (threat) {
      // Steer square to the threat's path and burn out of its way.
      const px = wrapD(threat.x - ship.x, w);
      const py = wrapD(threat.y - ship.y, h);
      const vx = threat.vx - ship.vx;
      const vy = threat.vy - ship.vy;
      const cx = px + vx * threatT;
      const cy = py + vy * threatT;
      const away = Math.hypot(cx, cy) > 1 ? Math.atan2(-cy, -cx) : Math.atan2(-vx, vy);
      heading = away;
      wantThrust = Math.abs(turnTo(ship.a, away)) < 0.7;
      // A rock dead ahead is still worth a shot on the way.
      fire = Math.abs(turnTo(ship.a, Math.atan2(py, px))) < 0.1;
    } else if (target) {
      heading = Math.atan2(aimY, aimX) + wobble;
      const dist = Math.hypot(aimX, aimY);
      const err = Math.abs(turnTo(ship.a, heading));
      fire = err < 0.07 && dist < range;
      const speed = Math.hypot(ship.vx, ship.vy);
      // Close in when the target is out of range, never while crowded.
      // A fixated pilot chases its target instead, which is how it gets caught.
      if (lapse > 0 && dist > range * 0.25 && speed < 170 * s && err < 0.4) wantThrust = true;
      else if (dist > range * 0.9 && nearest > 150 * s && speed < 120 * s && err < 0.4)
        wantThrust = true;
    } else {
      // An empty field: drift back toward the middle and wait for the wave.
      const cx = w / 2 - ship.x;
      const cy = h / 2 - ship.y;
      if (Math.hypot(cx, cy) > Math.min(w, h) * 0.2) {
        heading = Math.atan2(cy, cx);
        wantThrust =
          Math.abs(turnTo(ship.a, heading)) < 0.3 && Math.hypot(ship.vx, ship.vy) < 50 * s;
      }
    }

    const d = turnTo(ship.a, heading);
    const rate = 3.6;
    ship.a += clamp(d * 8, -rate, rate) * dt;

    if (wantThrust) {
      ship.thrust = true;
      const acc = 260 * s;
      ship.vx += Math.cos(ship.a) * acc * dt;
      ship.vy += Math.sin(ship.a) * acc * dt;
    }
    const cap = 220 * s;
    const sp = Math.hypot(ship.vx, ship.vy);
    if (sp > cap) {
      ship.vx *= cap / sp;
      ship.vy *= cap / sp;
    }

    if (fire && cooldown <= 0 && shots.length < 4) {
      cooldown = 0.4;
      const nx = Math.cos(ship.a);
      const ny = Math.sin(ship.a);
      shots.push({
        x: ship.x + nx * shipR,
        y: ship.y + ny * shipR,
        vx: ship.vx + nx * shotSpeed,
        vy: ship.vy + ny * shotSpeed,
        life: shotLife,
      });
    }
  }

  /** Space is a torus: everything lives in 0..w by 0..h and wraps the same way. */
  function wrap(o: { x: number; y: number }) {
    o.x = ((o.x % w) + w) % w;
    o.y = ((o.y % h) + h) % h;
  }

  return {
    title: "Drift",

    resize(width, height) {
      const oldW = w;
      const oldH = h;
      const oldS = s;
      w = Math.max(1, width);
      h = Math.max(1, height);
      s = clamp(Math.sqrt(w * h) / 1000, 0.6, 1.6);
      shipR = 12 * s;
      shotSpeed = 520 * s;
      if (!started) {
        started = true;
        ship.x = w / 2;
        ship.y = h / 2;
        spawnWave();
        return;
      }
      // Carry the field over, scaled to the new stage.
      const kx = w / oldW;
      const ky = h / oldH;
      const ks = s / oldS;
      ship.x *= kx;
      ship.y *= ky;
      ship.vx *= ks;
      ship.vy *= ks;
      for (const k of rocks) {
        k.x *= kx;
        k.y *= ky;
        k.vx *= ks;
        k.vy *= ks;
        k.r = rockRadius(k.size);
      }
      shots.length = 0;
      // A smaller stage can't hold as many rocks; drop the smallest extras.
      const limit = waveCount() * 4;
      if (rocks.length > limit) {
        rocks.sort((p, q) => q.size - p.size);
        rocks.length = limit;
      }
      shield = Math.max(shield, 1);
    },

    step(dt) {
      if (dt <= 0) return;
      cooldown -= dt;
      lapse -= dt;
      focus -= dt;
      if (focus <= 0) {
        focus = 6 + Math.random() * 10;
        lapse = 1.5 + Math.random() * 1.5;
      }
      wobbleT -= dt;
      if (wobbleT <= 0) {
        wobbleT = 0.5 + Math.random();
        wobble = (Math.random() - 0.5) * 0.16;
      }

      for (const k of rocks) {
        k.x += k.vx * dt;
        k.y += k.vy * dt;
        k.a += k.spin * dt;
        wrap(k);
      }

      if (ship.alive) {
        pilot(dt);
        ship.vx *= 1 - dt * 0.35;
        ship.vy *= 1 - dt * 0.35;
        ship.x += ship.vx * dt;
        ship.y += ship.vy * dt;
        wrap(ship);
        if (shield > 0) shield -= dt;
        else {
          for (const k of rocks) {
            const d = Math.hypot(wrapD(k.x - ship.x, w), wrapD(k.y - ship.y, h));
            if (d < k.r * 0.9 + shipR * 0.7) {
              explode();
              break;
            }
          }
        }
      } else {
        respawn -= dt;
        if (respawn <= 0) placeShip();
      }

      for (let i = shots.length - 1; i >= 0; i--) {
        const b = shots[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;
        wrap(b);
        let hit = -1;
        for (let j = 0; j < rocks.length; j++) {
          const k = rocks[j];
          if (Math.hypot(wrapD(k.x - b.x, w), wrapD(k.y - b.y, h)) < k.r * 0.92) {
            hit = j;
            break;
          }
        }
        if (hit >= 0) {
          split(hit);
          shots.splice(i, 1);
        } else if (b.life <= 0) shots.splice(i, 1);
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 1 - dt * 2;
        p.vy *= 1 - dt * 2;
        p.life -= dt * p.rate;
        if (p.life <= 0) sparks.splice(i, 1);
      }
      for (let i = shards.length - 1; i >= 0; i--) {
        const p = shards[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.a += p.spin * dt;
        p.len -= dt * shipR * 0.6;
        if (p.len <= 0) shards.splice(i, 1);
      }

      if (rocks.length === 0) {
        if (waveDelay <= 0) waveDelay = 2;
        waveDelay -= dt;
        if (waveDelay <= 0) spawnWave();
      }
    },

    draw(ctx: CanvasRenderingContext2D, theme: ArcadeTheme, now: number) {
      const lw = clamp(1.5 * s, 1.25, 2.25);
      ctx.save();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = lw;

      // Rocks: quiet outlines, so the ship and its shots carry the color.
      ctx.strokeStyle = theme.muted;
      ctx.globalAlpha = 0.85;
      for (const k of rocks) {
        // A rock across an edge shows on both sides, as wrapped space should.
        const xs = k.x < k.r ? [0, w] : k.x > w - k.r ? [0, -w] : [0];
        const ys = k.y < k.r ? [0, h] : k.y > h - k.r ? [0, -h] : [0];
        for (const ox of xs) {
          for (const oy of ys) {
            ctx.beginPath();
            const n = k.shape.length;
            for (let i = 0; i < n; i++) {
              const a = k.a + (i / n) * TAU;
              const rr = k.r * k.shape[i];
              const x = k.x + ox + Math.cos(a) * rr;
              const y = k.y + oy + Math.sin(a) * rr;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      if (theme.dark) ctx.globalCompositeOperation = "lighter";

      // Bullets: short streaks along their path.
      ctx.strokeStyle = theme.fg;
      ctx.beginPath();
      for (const b of shots) {
        const sp = Math.hypot(b.vx, b.vy) || 1;
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - (b.vx / sp) * 7 * s, b.y - (b.vy / sp) * 7 * s);
      }
      ctx.stroke();

      for (const p of sparks) {
        ctx.globalAlpha = Math.max(0, p.life) * 0.9;
        ctx.strokeStyle = p.ship ? theme.primary : theme.amber;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025);
        ctx.stroke();
      }
      ctx.strokeStyle = theme.primary;
      for (const p of shards) {
        ctx.globalAlpha = clamp(p.len / (shipR * 1.4), 0, 1);
        const dx = (Math.cos(p.a) * p.len) / 2;
        const dy = (Math.sin(p.a) * p.len) / 2;
        ctx.beginPath();
        ctx.moveTo(p.x - dx, p.y - dy);
        ctx.lineTo(p.x + dx, p.y + dy);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // The ship: a simple triangle, blinking while its respawn shield holds.
      const blink = shield > 0 && Math.floor(now / 120) % 2 === 0;
      if (ship.alive && !blink) {
        const c = Math.cos(ship.a);
        const sn = Math.sin(ship.a);
        const pt = (fx: number, fy: number): [number, number] => [
          ship.x + (c * fx - sn * fy) * shipR,
          ship.y + (sn * fx + c * fy) * shipR,
        ];
        if (ship.thrust) {
          const flick = 0.8 + 0.4 * Math.sin(now / 35);
          ctx.strokeStyle = theme.amber;
          ctx.beginPath();
          ctx.moveTo(...pt(-0.6, -0.35));
          ctx.lineTo(...pt(-0.6 - 0.9 * flick, 0));
          ctx.lineTo(...pt(-0.6, 0.35));
          ctx.stroke();
        }
        if (theme.dark) {
          ctx.globalAlpha = 0.14;
          ctx.lineWidth = lw * 4;
          ctx.strokeStyle = theme.primary;
          ctx.beginPath();
          ctx.moveTo(...pt(1.2, 0));
          ctx.lineTo(...pt(-0.85, -0.75));
          ctx.lineTo(...pt(-0.85, 0.75));
          ctx.closePath();
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.lineWidth = lw;
        }
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = theme.primary;
        ctx.beginPath();
        ctx.moveTo(...pt(1.2, 0));
        ctx.lineTo(...pt(-0.85, -0.75));
        ctx.lineTo(...pt(-0.6, 0));
        ctx.lineTo(...pt(-0.85, 0.75));
        ctx.closePath();
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";

      // The wave number, small in a corner.
      const size = Math.round(clamp(9 * s, 9, 13));
      ctx.font = `${size}px ${LABEL}`;
      ctx.letterSpacing = `${(size * 0.3).toFixed(1)}px`;
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = theme.muted;
      ctx.fillText(
        `WAVE ${String(wave).padStart(2, "0")}`,
        clamp(w * 0.03, 14, 48),
        h - clamp(h * 0.03, 14, 32),
      );
      ctx.letterSpacing = "0px";

      ctx.restore();
    },
  };
};

export default createDrift;
