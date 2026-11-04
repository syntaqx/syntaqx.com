/*
 * Chase: a maze collector. Every round grows a new maze, mirrored left to
 * right and braided so there are loops everywhere. A collector clears the
 * dots by path search while steering away from four chasers, each with its
 * own way of hunting; a power dot turns the tables for a few seconds.
 */

import type { ArcadeTheme, Cabinet, CabinetFactory } from "./cabinet";

type Accent = "amber" | "pink" | "purple" | "cyan";

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];
const CHASER_COLORS: Accent[] = ["amber", "pink", "purple", "cyan"];
// Tiles a second.
const SPEED = { collector: 5.6, chaser: 5.0, fright: 3.0, eaten: 11, leave: 3.5 };
const FRIGHT = 6;
// Global chaser rhythm: scatter to corners, then hunt.
const SCATTER = 6;
const HUNT = 18;

interface Mover {
  x: number;
  y: number;
  nx: number;
  ny: number;
  t: number;
  speed: number;
  /** The tile it came from, so roaming never doubles straight back. */
  last: number;
}

interface Chaser extends Mover {
  kind: number;
  mode: "pen" | "leave" | "roam" | "eaten";
  fright: boolean;
  timer: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: Accent | "primary";
}

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

class ChaseGame implements Cabinet {
  title = "Chase";

  private w = 0;
  private h = 0;
  private started = false;

  // Maze, in tiles. open: 1 where a mover can be. pen: 1 inside the chaser
  // pen, 2 on its door; the collector never enters either.
  private cols = 0;
  private rows = 0;
  private open = new Uint8Array(0);
  private pen = new Uint8Array(0);
  private dots = new Uint8Array(0);
  private dotsLeft = 0;
  private toExit = new Int32Array(0);
  private toPen = new Int32Array(0);
  private exitTile = 0;
  private penTile = 0;
  private startTile = 0;

  // Layout in CSS pixels.
  private tile = 20;
  private ox = 0;
  private oy = 0;

  private collector: Mover = { x: 0, y: 0, nx: 0, ny: 0, t: 0, speed: SPEED.collector, last: -1 };
  private heading: [number, number] = [0, 0];
  private reverseCooldown = 0;
  private chasers: Chaser[] = [];
  private sparks: Spark[] = [];

  private frightTimer = 0;
  private combo = 0;
  private modeTimer = 0;
  private scatter = true;

  private score = 0;
  private lives = 3;
  private round = 1;
  private phase: "play" | "caught" | "clear" | "over" = "play";
  private phaseTimer = 0;

  resize(width: number, height: number) {
    this.w = Math.max(1, width);
    this.h = Math.max(1, height);
    if (!this.started) {
      this.started = true;
      this.newRound(true);
      return;
    }
    // Refit the current maze; if it would now be cramped, grow one that fits.
    const ideal = this.idealGrid()[2];
    this.fit();
    if (this.tile < ideal * 0.7 || this.tile > ideal * 1.6) this.newRound(false);
  }

  step(dt: number) {
    if (!(dt > 0) || !this.started) return;
    dt = Math.min(dt, 1 / 30);
    this.stepSparks(dt);

    if (this.phase !== "play") {
      this.phaseTimer -= dt;
      if (this.phaseTimer > 0) return;
      if (this.phase === "caught") this.resetMovers();
      else if (this.phase === "clear") {
        this.round++;
        this.newRound(false);
      } else this.newRound(true);
      return;
    }

    this.modeTimer -= dt;
    if (this.modeTimer <= 0) {
      this.scatter = !this.scatter;
      this.modeTimer = this.scatter ? SCATTER : HUNT;
      for (const g of this.chasers) if (g.mode === "roam") this.reverse(g);
    }
    if (this.frightTimer > 0) {
      this.frightTimer -= dt;
      if (this.frightTimer <= 0) for (const g of this.chasers) g.fright = false;
    }

    this.reverseCooldown -= dt;
    this.dodge();
    this.advance(this.collector, dt, () => this.collectorArrive());
    for (const g of this.chasers) {
      g.speed = this.chaserSpeed(g);
      if (g.mode === "pen") {
        g.timer -= dt;
        if (g.timer <= 0) g.mode = "leave";
        continue;
      }
      this.advance(g, dt, () => this.chaserArrive(g));
    }
    this.collide();
  }

  draw(ctx: CanvasRenderingContext2D, theme: ArcadeTheme, now: number) {
    if (!this.started) return;
    const t = now / 1000;
    const s = this.tile;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Walls: a soft wide trace under a thin bright one, joined at every
    // neighbor so corners come out rounded. The maze flashes on a clear.
    const flash = this.phase === "clear" && Math.sin(t * 16) > 0;
    this.wallPath(ctx);
    ctx.strokeStyle = theme.line;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = s * 0.42;
    ctx.stroke();
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = flash ? theme.primary : theme.strong;
    ctx.lineWidth = clamp(s * 0.07, 1.25, 2);
    ctx.stroke();

    // The pen door.
    const [dx, dy] = this.xy(this.exitTile);
    ctx.strokeStyle = theme.muted;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(this.px(dx) - s * 0.35, this.py(dy + 1));
    ctx.lineTo(this.px(dx) + s * 0.35, this.py(dy + 1));
    ctx.stroke();

    // Dots in one path; power dots pulse on their own.
    const dr = Math.max(1.2, s * 0.07);
    ctx.fillStyle = theme.fg;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    const power: number[] = [];
    for (let i = 0; i < this.dots.length; i++) {
      if (this.dots[i] === 0) continue;
      if (this.dots[i] === 2) {
        power.push(i);
        continue;
      }
      const x = this.px(i % this.cols);
      const y = this.py(Math.floor(i / this.cols));
      ctx.moveTo(x + dr, y);
      ctx.arc(x, y, dr, 0, Math.PI * 2);
    }
    ctx.fill();
    const pulse = 0.75 + 0.25 * Math.sin(t * 5);
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = theme.green;
    ctx.fillStyle = theme.green;
    ctx.lineWidth = clamp(s * 0.06, 1.25, 2);
    for (const i of power) {
      const x = this.px(i % this.cols);
      const y = this.py(Math.floor(i / this.cols));
      ctx.beginPath();
      ctx.arc(x, y, s * 0.2 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, s * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const lw = clamp(s * 0.075, 1.5, 2.2);
    ctx.lineWidth = lw;
    for (const g of this.chasers) this.drawChaser(ctx, theme, g, t);
    if (this.phase !== "over") this.drawCollector(ctx, theme, t);

    if (theme.dark) ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = 1.5;
    for (const p of this.sparks) {
      ctx.globalAlpha = p.life / p.max;
      ctx.strokeStyle = theme[p.color];
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    // Score over the maze's top left, lives over its top right.
    ctx.font = '500 11px "JetBrains Mono", ui-monospace, monospace';
    ctx.textBaseline = "bottom";
    ctx.textAlign = "left";
    ctx.fillStyle = theme.muted;
    ctx.fillText(String(this.score).padStart(5, "0"), this.ox, this.oy - 6);
    ctx.strokeStyle = theme.primary;
    ctx.lineWidth = 1.25;
    ctx.globalAlpha = 0.8;
    const right = this.ox + this.cols * s;
    for (let i = 0; i < this.lives - 1; i++) {
      ctx.beginPath();
      ctx.arc(right - 5 - i * 14, this.oy - 11, 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Maze generation ------------------------------------------------------------

  /** Columns, rows and tile size that suit the stage. */
  private idealGrid(): [number, number, number] {
    const m = clamp(Math.min(this.w, this.h) * 0.05, 16, 64);
    const aw = this.w - 2 * m;
    const ah = this.h - 2 * m - 20;
    const target = clamp(Math.min(aw, ah) / 17, 18, 34);
    // Mirroring needs the center column on an odd index: cols = 4k + 3.
    let c = clamp(Math.floor(aw / target), 11, 43);
    while (c % 4 !== 3) c--;
    let r = clamp(Math.floor(ah / target), 11, 31);
    if (r % 2 === 0) r--;
    return [c, r, Math.min(aw / c, ah / r)];
  }

  private fit() {
    const m = clamp(Math.min(this.w, this.h) * 0.05, 16, 64);
    const aw = this.w - 2 * m;
    const ah = this.h - 2 * m - 20;
    this.tile = Math.max(2, Math.min(aw / this.cols, ah / this.rows));
    this.ox = (this.w - this.tile * this.cols) / 2;
    this.oy = (this.h - this.tile * this.rows) / 2 + 10;
  }

  private newRound(reset: boolean) {
    if (reset) {
      this.score = 0;
      this.lives = 3;
      this.round = 1;
    }
    const [c, r] = this.idealGrid();
    this.generate(c, r);
    this.fit();
    this.sparks = [];
    this.resetMovers();
  }

  private generate(C: number, R: number) {
    this.cols = C;
    this.rows = R;
    const n = C * R;
    const open = new Uint8Array(n);
    const pen = new Uint8Array(n);
    const half = (C - 1) / 2;
    const at = (x: number, y: number) => y * C + x;
    const set = (x: number, y: number, v: number) => {
      open[at(x, y)] = v;
      open[at(C - 1 - x, y)] = v;
    };
    const inner = (x: number, y: number) => x > 0 && y > 0 && x < C - 1 && y < R - 1;

    // A spanning tree over the left half's rooms (odd x, odd y), center
    // column included, mirrored to the right. The shared center column
    // stitches the two halves into one connected maze.
    const seen = new Uint8Array(n);
    const sx = 1 + 2 * Math.floor(Math.random() * ((half + 1) / 2));
    const sy = 1 + 2 * Math.floor(Math.random() * ((R - 1) / 2));
    const stack: number[] = [at(sx, sy)];
    seen[at(sx, sy)] = 1;
    set(sx, sy, 1);
    while (stack.length) {
      const cur = stack[stack.length - 1];
      const cx = cur % C;
      const cy = Math.floor(cur / C);
      const next: number[] = [];
      for (const [dx, dy] of DIRS) {
        const x = cx + dx * 2;
        const y = cy + dy * 2;
        if (x < 1 || x > half || y < 1 || y > R - 2 || seen[at(x, y)]) continue;
        next.push(at(x, y));
      }
      if (!next.length) {
        stack.pop();
        continue;
      }
      const nb = next[Math.floor(Math.random() * next.length)];
      const nx = nb % C;
      const ny = Math.floor(nb / C);
      seen[nb] = 1;
      set((cx + nx) / 2, (cy + ny) / 2, 1);
      set(nx, ny, 1);
      stack.push(nb);
    }

    // Braid: knock through every dead end, plus a few extra walls, so the
    // collector always has a way around a chaser.
    const degree = (x: number, y: number) =>
      DIRS.reduce((k, [dx, dy]) => k + open[at(x + dx, y + dy)], 0);
    for (let y = 1; y < R - 1; y += 2) {
      for (let x = 1; x <= half; x += 2) {
        if (degree(x, y) > 1) continue;
        const walls = DIRS.filter(
          ([dx, dy]) => inner(x + dx * 2, y + dy * 2) && !open[at(x + dx, y + dy)],
        );
        if (!walls.length) continue;
        const [dx, dy] = walls[Math.floor(Math.random() * walls.length)];
        set(x + dx, y + dy, 1);
      }
    }
    for (let y = 1; y < R - 1; y++) {
      for (let x = 1; x <= half; x++) {
        if ((x + y) % 2 === 0 || open[at(x, y)]) continue;
        if (Math.random() < 0.06) set(x, y, 1);
      }
    }

    // The pen: a short room in the middle with a door on top, ringed by a
    // corridor so chasers come out into the open.
    let cy = Math.floor(R / 2);
    if (cy % 2 === 0) cy--;
    for (let y = cy - 2; y <= cy + 2; y++) {
      for (let x = half - 4; x <= half; x++) {
        const ring = y === cy - 2 || y === cy + 2 || x === half - 4;
        const wall = y === cy - 1 || y === cy + 1 || x === half - 3;
        set(x, y, ring ? 1 : wall ? 0 : 1);
      }
    }
    for (let x = half - 2; x <= half + 2; x++) pen[at(x, cy)] = 1;
    open[at(half, cy - 1)] = 1;
    pen[at(half, cy - 1)] = 2;

    // Repair: the ring and pen walls can cut corridors; open walls between
    // separated regions until every walkable tile is reachable.
    for (let guard = 0; guard < n; guard++) {
      const reach = this.flood(open, pen, C, R, at(1, 1));
      let fixed = false;
      for (let y = 1; y < R - 1 && !fixed; y++) {
        for (let x = 1; x < C - 1 && !fixed; x++) {
          const i = at(x, y);
          if (open[i] || (Math.abs(y - cy) <= 1 && Math.abs(x - half) <= 3)) continue;
          let inside = false;
          let outside = false;
          for (const [dx, dy] of DIRS) {
            const j = at(x + dx, y + dy);
            if (!open[j] || pen[j]) continue;
            if (reach[j]) inside = true;
            else outside = true;
          }
          if (inside && outside) {
            set(x, y, 1);
            fixed = true;
          }
        }
      }
      if (!fixed) break;
    }

    this.open = open;
    this.pen = pen;
    this.exitTile = at(half, cy - 2);
    this.penTile = at(half, cy);
    this.startTile = at(half, cy + 2);
    this.toExit = this.distances(this.exitTile, true);
    this.toPen = this.distances(this.penTile, true);

    this.dots = new Uint8Array(n);
    this.dotsLeft = 0;
    for (let i = 0; i < n; i++) {
      if (!open[i] || pen[i] || i === this.startTile) continue;
      this.dots[i] = 1;
      this.dotsLeft++;
    }
    for (const i of [at(1, 1), at(C - 2, 1), at(1, R - 2), at(C - 2, R - 2)]) {
      if (this.dots[i]) this.dots[i] = 2;
    }
  }

  private flood(open: Uint8Array, pen: Uint8Array, C: number, R: number, from: number) {
    const reach = new Uint8Array(C * R);
    const q = [from];
    reach[from] = 1;
    for (let k = 0; k < q.length; k++) {
      const i = q[k];
      for (const [dx, dy] of DIRS) {
        const j = i + dy * C + dx;
        if (j < 0 || j >= C * R || reach[j] || !open[j] || pen[j]) continue;
        reach[j] = 1;
        q.push(j);
      }
    }
    return reach;
  }

  /** Breadth-first steps to a tile over open tiles, pen included if asked. */
  private distances(from: number, withPen: boolean) {
    const d = new Int32Array(this.open.length).fill(-1);
    const q = [from];
    d[from] = 0;
    for (let k = 0; k < q.length; k++) {
      const i = q[k];
      for (const j of this.neighbors(i)) {
        if (d[j] >= 0 || (!withPen && this.pen[j])) continue;
        d[j] = d[i] + 1;
        q.push(j);
      }
    }
    return d;
  }

  private neighbors(i: number) {
    const x = i % this.cols;
    const y = Math.floor(i / this.cols);
    const out: number[] = [];
    for (const [dx, dy] of DIRS) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= this.cols || ny >= this.rows) continue;
      const j = ny * this.cols + nx;
      if (this.open[j]) out.push(j);
    }
    return out;
  }

  // Movement -----------------------------------------------------------------

  private resetMovers() {
    this.phase = "play";
    const [sx, sy] = this.xy(this.startTile);
    this.collector = { x: sx, y: sy, nx: sx, ny: sy, t: 0, speed: SPEED.collector, last: -1 };
    this.heading = [0, 0];
    const [px, py] = this.xy(this.penTile);
    const kinds = [0, 1, 2, 3];
    this.chasers = kinds.map((kind) => {
      // The first chaser starts outside; the rest wait their turn in the pen.
      const [x, y] = kind === 0 ? this.xy(this.exitTile) : [px - 1 + (kind - 1), py];
      return {
        kind,
        x,
        y,
        nx: x,
        ny: y,
        t: 0,
        speed: SPEED.chaser,
        mode: kind === 0 ? ("roam" as const) : ("pen" as const),
        fright: false,
        timer: kind * 2.5,
        last: -1,
      };
    });
    this.frightTimer = 0;
    this.scatter = true;
    this.modeTimer = SCATTER;
  }

  /** Moves along the current edge; at each tile center asks for the next one. */
  private advance(m: Mover, dt: number, arrive: () => void) {
    if (m.nx === m.x && m.ny === m.y) {
      arrive();
      if (m.nx === m.x && m.ny === m.y) return;
    }
    m.t += m.speed * dt;
    for (let guard = 0; m.t >= 1 && guard < 4; guard++) {
      m.x = m.nx;
      m.y = m.ny;
      m.t -= 1;
      arrive();
      if (m.nx === m.x && m.ny === m.y) {
        m.t = 0;
        break;
      }
    }
  }

  private reverse(m: Mover) {
    if (m.nx === m.x && m.ny === m.y) return;
    [m.x, m.nx] = [m.nx, m.x];
    [m.y, m.ny] = [m.ny, m.y];
    m.t = 1 - m.t;
    m.last = m.y * this.cols + m.x;
  }

  private pos(m: Mover): [number, number] {
    return [m.x + (m.nx - m.x) * m.t, m.y + (m.ny - m.y) * m.t];
  }

  private chaserSpeed(g: Chaser) {
    if (g.mode === "eaten") return SPEED.eaten;
    if (g.mode === "leave") return SPEED.leave;
    if (g.fright) return SPEED.fright;
    return SPEED.chaser * Math.min(1.12, 1 + (this.round - 1) * 0.03);
  }

  // Collector AI ---------------------------------------------------------------

  private collectorArrive() {
    const c = this.collector;
    const i = c.y * this.cols + c.x;
    if (this.dots[i]) {
      if (this.dots[i] === 2) {
        this.score += 50;
        this.frightTimer = Math.max(3, FRIGHT - (this.round - 1) * 0.4);
        this.combo = 0;
        for (const g of this.chasers) {
          if (g.mode !== "roam") continue;
          g.fright = true;
          this.reverse(g);
        }
      } else this.score += 10;
      this.dots[i] = 0;
      this.dotsLeft--;
      if (this.dotsLeft <= 0) {
        this.phase = "clear";
        this.phaseTimer = 1.8;
        return;
      }
    }
    const next = this.plan(i);
    c.nx = next % this.cols;
    c.ny = Math.floor(next / this.cols);
    this.heading = [c.nx - c.x, c.ny - c.y];
  }

  /** Chooses the collector's next tile from tile i. */
  private plan(i: number): number {
    const n = this.open.length;
    // How close each tile is to a chaser that can still catch it.
    const sources: number[] = [];
    const hunt: number[] = [];
    for (const g of this.chasers) {
      if (g.mode === "pen" || g.mode === "eaten") continue;
      const a = g.y * this.cols + g.x;
      const b = g.ny * this.cols + g.nx;
      if (g.fright && this.frightTimer > 1) hunt.push(a, b);
      else if (!g.fright) {
        sources.push(a, b);
        // And one tile further along, where it will be by the time we get close.
        const ax = g.nx + (g.nx - g.x);
        const ay = g.ny + (g.ny - g.y);
        if (
          ax >= 0 &&
          ay >= 0 &&
          ax < this.cols &&
          ay < this.rows &&
          this.open[ay * this.cols + ax]
        )
          sources.push(ay * this.cols + ax);
      }
    }
    const near = new Int32Array(n).fill(99);
    const q: number[] = [];
    for (const s of sources) {
      if (near[s] === 0) continue;
      near[s] = 0;
      q.push(s);
    }
    for (let k = 0; k < q.length; k++) {
      const a = q[k];
      if (near[a] >= 9) continue;
      for (const j of this.neighbors(a)) {
        if (near[j] <= near[a] + 1) continue;
        near[j] = near[a] + 1;
        q.push(j);
      }
    }
    const danger = (j: number) => {
      const d = near[j];
      return d <= 1 ? 200 : d === 2 ? 60 : d <= 7 ? (8 - d) * (8 - d) * 2 : 0;
    };

    // Dijkstra with danger as extra cost: the cheapest dot is near and safe.
    const cost = new Float64Array(n).fill(Infinity);
    const from = new Int32Array(n).fill(-1);
    const heap = new MinHeap();
    cost[i] = 0;
    heap.push(i, 0);
    while (heap.size) {
      const [a, ca] = heap.pop();
      if (ca > cost[a]) continue;
      for (const j of this.neighbors(a)) {
        if (this.pen[j]) continue;
        const cj = ca + 1 + danger(j);
        if (cj < cost[j]) {
          cost[j] = cj;
          from[j] = a;
          heap.push(j, cj);
        }
      }
    }

    // Pick a goal: a frightened chaser while the power lasts, else the best
    // dot, with power dots worth a detour when a chaser is close.
    const threatened = near[i] <= 6;
    let goal = -1;
    let best = Infinity;
    for (const h of hunt) {
      if (h !== i && cost[h] < 18 && cost[h] - 10 < best) {
        best = cost[h] - 10;
        goal = h;
      }
    }
    for (let j = 0; j < n; j++) {
      if (!this.dots[j] || cost[j] === Infinity) continue;
      const v = cost[j] - (this.dots[j] === 2 && threatened ? 12 : 0);
      if (v < best) {
        best = v;
        goal = j;
      }
    }
    if (goal >= 0 && from[goal] >= 0) {
      let j = goal;
      while (from[j] !== i && from[j] >= 0) j = from[j];
      return j;
    }
    // Nothing worth going for: step to the safest neighbor.
    let pick = i;
    let far = -1;
    for (const j of this.neighbors(i)) {
      if (this.pen[j]) continue;
      if (near[j] > far) {
        far = near[j];
        pick = j;
      }
    }
    return pick;
  }

  /** Turns back mid-corridor when a chaser is coming the other way. */
  private dodge() {
    const c = this.collector;
    if (this.reverseCooldown > 0 || (c.nx === c.x && c.ny === c.y)) return;
    const [cx, cy] = this.pos(c);
    for (const g of this.chasers) {
      if (g.fright || g.mode === "pen" || g.mode === "eaten") continue;
      const [gx, gy] = this.pos(g);
      const ahead = Math.hypot(gx - c.nx, gy - c.ny);
      const here = Math.hypot(gx - cx, gy - cy);
      if (here < 2.6 && ahead < here) {
        this.reverse(c);
        this.heading = [c.nx - c.x, c.ny - c.y];
        this.reverseCooldown = 0.4;
        return;
      }
    }
  }

  // Chaser AI ---------------------------------------------------------------------

  private chaserArrive(g: Chaser) {
    const i = g.y * this.cols + g.x;
    if (g.mode === "leave") {
      if (i === this.exitTile) g.mode = "roam";
      else return this.stepDown(g, this.toExit);
    }
    if (g.mode === "eaten") {
      if (i === this.penTile) {
        g.mode = "pen";
        g.timer = 1.2;
        g.nx = g.x;
        g.ny = g.y;
        return;
      }
      return this.stepDown(g, this.toPen);
    }
    // Roaming: never into the pen, never straight back unless cornered.
    const options = this.neighbors(i).filter((j) => !this.pen[j]);
    const forward = options.filter((j) => j !== g.last);
    const choices = forward.length ? forward : options;
    if (!choices.length) {
      g.nx = g.x;
      g.ny = g.y;
      return;
    }
    let pick = choices[0];
    if (g.fright) {
      pick = choices[Math.floor(Math.random() * choices.length)];
    } else {
      const [tx, ty] = this.targetFor(g);
      let best = Infinity;
      for (const j of choices) {
        const d = Math.hypot((j % this.cols) - tx, Math.floor(j / this.cols) - ty);
        if (d < best) {
          best = d;
          pick = j;
        }
      }
    }
    g.last = i;
    g.nx = pick % this.cols;
    g.ny = Math.floor(pick / this.cols);
  }

  private stepDown(g: Chaser, field: Int32Array) {
    const i = g.y * this.cols + g.x;
    let pick = i;
    for (const j of this.neighbors(i)) if (field[j] >= 0 && field[j] < field[pick]) pick = j;
    g.last = i;
    g.nx = pick % this.cols;
    g.ny = Math.floor(pick / this.cols);
  }

  /** Each chaser's idea of where to go: its personality. */
  private targetFor(g: Chaser): [number, number] {
    const C = this.cols;
    const R = this.rows;
    const corners: [number, number][] = [
      [C - 2, -2],
      [1, -2],
      [C - 2, R + 1],
      [1, R + 1],
    ];
    if (this.scatter) return corners[g.kind];
    const c = this.collector;
    const [hx, hy] = this.heading;
    switch (g.kind) {
      case 0:
        // Direct pursuit.
        return [c.nx, c.ny];
      case 1:
        // Ambush: aim where the collector is heading.
        return [c.nx + hx * 4, c.ny + hy * 4];
      case 2: {
        // Flank: mirror the first chaser across a point ahead of the collector.
        const a = this.chasers[0];
        const qx = c.nx + hx * 2;
        const qy = c.ny + hy * 2;
        return [qx * 2 - a.x, qy * 2 - a.y];
      }
      default: {
        // Wander: chase from afar, lose interest up close.
        const d = Math.hypot(g.x - c.x, g.y - c.y);
        if (d > 7) return [c.nx, c.ny];
        return corners[3];
      }
    }
  }

  private collide() {
    const [cx, cy] = this.pos(this.collector);
    for (const g of this.chasers) {
      if (g.mode !== "roam" && g.mode !== "leave") continue;
      const [gx, gy] = this.pos(g);
      if (Math.hypot(gx - cx, gy - cy) > 0.6) continue;
      if (g.fright) {
        g.fright = false;
        g.mode = "eaten";
        this.score += 200 * 2 ** Math.min(this.combo, 3);
        this.combo++;
        this.burst(this.px(gx), this.py(gy), CHASER_COLORS[g.kind], 14);
        continue;
      }
      this.burst(this.px(cx), this.py(cy), "primary", 26);
      this.lives--;
      this.phase = this.lives <= 0 ? "over" : "caught";
      this.phaseTimer = this.lives <= 0 ? 2 : 1.6;
      return;
    }
  }

  // Particles and drawing ----------------------------------------------------------

  private burst(x: number, y: number, color: Spark["color"], k: number) {
    for (let i = 0; i < k && this.sparks.length < 200; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = this.tile * (2 + Math.random() * 4);
      const life = 0.35 + Math.random() * 0.5;
      this.sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life, max: life, color });
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

  private xy(i: number): [number, number] {
    return [i % this.cols, Math.floor(i / this.cols)];
  }

  private px(x: number) {
    return this.ox + (x + 0.5) * this.tile;
  }

  private py(y: number) {
    return this.oy + (y + 0.5) * this.tile;
  }

  /** One path through every wall tile's center, linked to its wall neighbors. */
  private wallPath(ctx: CanvasRenderingContext2D) {
    const C = this.cols;
    ctx.beginPath();
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < C; x++) {
        if (this.open[y * C + x]) continue;
        const right = x + 1 < C && !this.open[y * C + x + 1];
        const down = y + 1 < this.rows && !this.open[(y + 1) * C + x];
        const X = this.px(x);
        const Y = this.py(y);
        if (right) {
          ctx.moveTo(X, Y);
          ctx.lineTo(this.px(x + 1), Y);
        }
        if (down) {
          ctx.moveTo(X, Y);
          ctx.lineTo(X, this.py(y + 1));
        }
        if (!right && !down) {
          // A lone post or a run's end: a zero-length line still gets a round cap.
          ctx.moveTo(X, Y);
          ctx.lineTo(X + 0.01, Y);
        }
      }
    }
  }

  private drawCollector(ctx: CanvasRenderingContext2D, theme: ArcadeTheme, t: number) {
    const s = this.tile;
    const [x, y] = this.pos(this.collector);
    const X = this.px(x);
    const Y = this.py(y);
    const r = s * 0.3;
    // A slight stretch along the heading while it moves.
    const [hx, hy] = this.heading;
    const moving = this.phase === "play" && (hx !== 0 || hy !== 0);
    const k = moving ? 0.06 + 0.04 * Math.sin(t * 22) : 0;
    ctx.save();
    ctx.translate(X, Y);
    if (moving) ctx.rotate(Math.atan2(hy, hx));
    if (this.phase === "caught") ctx.globalAlpha = Math.max(0, this.phaseTimer / 1.6);
    ctx.strokeStyle = theme.primary;
    ctx.fillStyle = theme.primary;
    if (theme.dark) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha *= 0.22;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha /= 0.22;
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.beginPath();
    ctx.ellipse(0, 0, r * (1 + k), r * (1 - k), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(r * 0.25 * (moving ? 1 : 0), 0, r * 0.38, 0, Math.PI * 2);
    ctx.fill();
    // While powered, a ring that breathes.
    if (this.frightTimer > 0) {
      ctx.globalAlpha *= 0.4 + 0.3 * Math.sin(t * 9);
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.45, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawChaser(ctx: CanvasRenderingContext2D, theme: ArcadeTheme, g: Chaser, t: number) {
    const s = this.tile;
    const [x, y] = this.pos(g);
    const bob = g.mode === "pen" ? Math.sin(t * 5 + g.kind) * s * 0.18 : 0;
    const X = this.px(x);
    const Y = this.py(y) + bob;
    const hw = s * 0.27;
    const ending = this.frightTimer < 2 && Math.sin(t * 14) > 0;
    const body = g.fright ? (ending ? theme.fg : theme.muted) : theme[CHASER_COLORS[g.kind]];

    if (g.mode !== "eaten") {
      ctx.save();
      ctx.translate(X, Y);
      // Two of them are diamonds, two rounded squares.
      if (g.kind % 2 === 1) ctx.rotate(Math.PI / 4);
      const e = g.kind % 2 === 1 ? hw * 0.9 : hw;
      const rr = e * 0.4;
      ctx.strokeStyle = body;
      ctx.beginPath();
      ctx.moveTo(-e + rr, -e);
      ctx.lineTo(e - rr, -e);
      ctx.quadraticCurveTo(e, -e, e, -e + rr);
      ctx.lineTo(e, e - rr);
      ctx.quadraticCurveTo(e, e, e - rr, e);
      ctx.lineTo(-e + rr, e);
      ctx.quadraticCurveTo(-e, e, -e, e - rr);
      ctx.lineTo(-e, -e + rr);
      ctx.quadraticCurveTo(-e, -e, -e + rr, -e);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // Eyes look where it is going; frightened ones look nowhere in particular.
    const dx = g.fright ? 0 : g.nx - g.x;
    const dy = g.fright ? 0 : g.ny - g.y;
    const er = Math.max(1, s * 0.055);
    ctx.fillStyle = g.mode === "eaten" ? theme[CHASER_COLORS[g.kind]] : theme.fg;
    ctx.beginPath();
    for (const side of [-1, 1]) {
      const ex = X + side * hw * 0.38 + dx * s * 0.06;
      const ey = Y - hw * 0.12 + dy * s * 0.06;
      ctx.moveTo(ex + er, ey);
      ctx.arc(ex, ey, er, 0, Math.PI * 2);
    }
    ctx.fill();
  }
}

/** A small binary heap of [tile, cost] pairs for the collector's path search. */
class MinHeap {
  private items: number[] = [];
  private costs: number[] = [];

  get size() {
    return this.items.length;
  }

  push(item: number, cost: number) {
    const a = this.items;
    const c = this.costs;
    a.push(item);
    c.push(cost);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (c[p] <= c[i]) break;
      [a[p], a[i]] = [a[i], a[p]];
      [c[p], c[i]] = [c[i], c[p]];
      i = p;
    }
  }

  pop(): [number, number] {
    const a = this.items;
    const c = this.costs;
    const top: [number, number] = [a[0], c[0]];
    const lastA = a.pop()!;
    const lastC = c.pop()!;
    if (a.length) {
      a[0] = lastA;
      c[0] = lastC;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && c[l] < c[m]) m = l;
        if (r < a.length && c[r] < c[m]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        [c[m], c[i]] = [c[i], c[m]];
        i = m;
      }
    }
    return top;
  }
}

export const createChase: CabinetFactory = () => new ChaseGame();

export default createChase;
