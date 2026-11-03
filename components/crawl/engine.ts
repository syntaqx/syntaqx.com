/*
 * Crawl: the 404 page's game. Chains of packets in a round arena, eating to
 * grow, dying when their head touches another chain's body. Twenty-eight AI
 * crawlers play each other behind the 404, and anyone can join.
 *
 * No React here: the component in ./crawl-404.tsx hands this a canvas and
 * shows the page's copy over it.
 */

const TAU = Math.PI * 2;

// Tuning -----------------------------------------------------------------------
const ARENA = 3200; // world radius
const FOOD = 2600; // natural packets kept on the floor
const FOOD_CAP = 7000; // with kill drops and boost trails on top
const BOTS = 28;
const START_MASS = 12;
const SPEED = 175;
const BOOST = 370;
const MIN_BOOST_MASS = 11;
// Size from mass: a thin, short chain to start; long and thick when big.
const radiusFor = (m: number) => Math.min(30, 6 + Math.sqrt(m) * 0.34);
const lengthFor = (m: number) => 46 + m * 2.4;
const turnFor = (r: number) => 6.6 / (1 + (r - 6) / 12);
// Boosting burns a flat amount of length a second, whatever your size, the
// way the genre does it: costly when you're small, a fair trade when you're
// huge. At 11 or less you can't boost at all.
const BURN = 6;

interface Hue {
  edge: string;
  body: string;
}
// Chain colors from the site's palette: a bright edge, a dark body of the same hue.
const HUES: Hue[] = [
  { edge: "#00d1ca", body: "#0b3b39" },
  { edge: "#f2b13c", body: "#3a2c10" },
  { edge: "#ff9cc7", body: "#3a1a28" },
  { edge: "#c4a7ff", body: "#2a2140" },
  { edge: "#7edcdc", body: "#163636" },
  { edge: "#a9d5a0", body: "#1e3020" },
  { edge: "#e6ece9", body: "#22292a" },
  { edge: "#9cc3cf", body: "#1a2a30" },
];
const YOU: Hue = { edge: "#00d1ca", body: "#0c4f4b" };
const WALL = "#f2b13c";
const NAMES = [
  "crawler-07",
  "indexer",
  "health-check",
  "retry-loop",
  "cron",
  "webhook",
  "prefetch",
  "load-test",
  "scraper",
  "link-checker",
  "uptime-bot",
  "sitemap",
  "canary",
  "backfill",
  "replayer",
  "warmup",
  "spider",
  "fetcher",
  "poller",
  "heartbeat",
  "rate-limiter",
  "sidecar",
  "daemon",
  "queue-worker",
  "rebalancer",
  "migrator",
  "archiver",
  "monitor",
  "probe",
  "gc",
  "watchdog",
  "batch-job",
];

interface Kind {
  kind: string;
  food: number;
  hunt: number;
  coil: number;
  feast: number;
  you: number;
  think: number;
}
// What each kind of bot wants. Every bot sees as far and reacts as fast; they differ in appetite.
const KINDS: Kind[] = [
  { kind: "forager", food: 1.6, hunt: 0.5, coil: 0.6, feast: 0.8, you: 1.0, think: 0.07 },
  { kind: "hunter", food: 0.8, hunt: 1.7, coil: 1.2, feast: 0.6, you: 1.3, think: 0.055 },
  { kind: "vulture", food: 1.1, hunt: 0.6, coil: 0.5, feast: 1.8, you: 1.0, think: 0.06 },
  { kind: "shadow", food: 0.9, hunt: 1.3, coil: 1.0, feast: 0.7, you: 2.4, think: 0.055 },
  { kind: "bully", food: 1.0, hunt: 1.2, coil: 1.9, feast: 0.8, you: 1.4, think: 0.06 },
];

interface Point {
  x: number;
  y: number;
}
interface Snake {
  name: string;
  bot: boolean;
  mass: number;
  dir: number;
  want: number;
  boost: boolean;
  boosting: boolean;
  alive: boolean;
  hue: Hue;
  kind: Kind | null;
  trail: Point[];
  segs: Point[];
  r: number;
  killer: Snake | null;
  nextThink: number;
  boostLeft: number;
  drop: number;
  coilSide: number;
}
interface Food {
  ax: number;
  ay: number;
  x: number;
  y: number;
  v: number;
  color: string;
  r: number;
  vx: number;
  vy: number;
  phase: number;
  wob: number;
  ws: number;
  drop: boolean;
  born: number;
  by: Snake | null;
  t: number;
}
interface Seg {
  s: Snake;
  i: number;
  x: number;
  y: number;
  r: number;
}
interface Feast {
  until: number;
  path: Point[];
}

export interface CrawlResult {
  /** Length at the end, as shown on the leaderboard. */
  length: number;
  /** The chain it ran into, or null for the arena's edge. */
  killer: string | null;
}

export interface CrawlOptions {
  canvas: HTMLCanvasElement;
  /** Shown while playing on touch screens; held to boost. */
  boostButton?: HTMLElement | null;
  /** Called when your chain dies, or you leave with Escape. */
  onEnd: (result: CrawlResult | null) => void;
  /** Draw one still frame instead of running (prefers-reduced-motion). */
  still?: boolean;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const angleDiff = (a: number, b: number) => {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
};
const inArena = (margin = 100): Point => {
  const a = rand(0, TAU);
  const r = Math.sqrt(Math.random()) * (ARENA - margin);
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
};

// Spatial hashes -------------------------------------------------------------
const CELL = 80;
const OFF = 2048;
const cellKey = (cx: number, cy: number) => (cx + OFF) * 4096 + (cy + OFF);
function put<T>(grid: Map<number, T[]>, x: number, y: number, v: T) {
  const k = cellKey(Math.floor(x / CELL), Math.floor(y / CELL));
  const a = grid.get(k);
  if (a) a.push(v);
  else grid.set(k, [v]);
}
/** Calls fn for everything in the cells around (x, y); fn returns true to stop. */
function near<T>(
  grid: Map<number, T[]>,
  x: number,
  y: number,
  r: number,
  fn: (v: T) => boolean | void,
) {
  const x0 = Math.floor((x - r) / CELL),
    x1 = Math.floor((x + r) / CELL);
  const y0 = Math.floor((y - r) / CELL),
    y1 = Math.floor((y + r) / CELL);
  for (let cx = x0; cx <= x1; cx++)
    for (let cy = y0; cy <= y1; cy++) {
      const a = grid.get(cellKey(cx, cy));
      if (a) for (let i = 0; i < a.length; i++) if (fn(a[i]) === true) return;
    }
}

export function createCrawl({ canvas, boostButton, onEnd, still = false }: CrawlOptions) {
  const ctx = canvas.getContext("2d")!;
  let snakes: Snake[] = [];
  let food: Food[] = [];
  let feasts: Feast[] = [];
  let player: Snake | null = null;
  let nameBag: string[] = [];
  let VW = 1280,
    VH = 720;
  const cam = { x: 0, y: 0, z: 0.55 };
  let state: "attract" | "play" = "attract";
  let follow: Snake | null = null,
    followUntil = 0;
  let pointer: Point | null = null,
    held = false,
    keyTurn = 0,
    boostHeld = false;
  let raf = 0,
    last = 0,
    running = false,
    visible = true;
  const timers = new Set<ReturnType<typeof setTimeout>>();

  // Theme: the floor and text follow the site's tokens, light or dark.
  const theme = {
    bg: "#0a0c0c",
    grid: "#1c2423",
    text: "#84908e",
    panel: "rgba(15,19,19,.85)",
    strong: "#2f3a39",
    fg: "#e6ece9",
    dark: true,
  };
  const readTheme = () => {
    const css = getComputedStyle(document.documentElement);
    const v = (n: string, f: string) => css.getPropertyValue(n).trim() || f;
    theme.bg = v("--background", theme.bg);
    theme.grid = v("--border", theme.grid);
    theme.strong = v("--border-hover", theme.strong);
    theme.text = v("--muted-foreground", theme.text);
    theme.fg = v("--foreground", theme.fg);
    const hex = theme.bg.replace("#", "");
    const lum =
      hex.length >= 6
        ? (parseInt(hex.slice(0, 2), 16) * 0.3 +
            parseInt(hex.slice(2, 4), 16) * 0.59 +
            parseInt(hex.slice(4, 6), 16) * 0.11) /
          255
        : 0;
    theme.dark = lum < 0.5;
    theme.panel = theme.dark ? "rgba(15,19,19,.85)" : "rgba(219,224,221,.9)";
  };
  readTheme();

  const speedOf = (s: Snake) => (s.boosting ? BOOST : SPEED);

  // Chains -------------------------------------------------------------------
  // A chain is a head that leaves a trail; its body is laid at even spacing
  // along that trail, so the body goes exactly where the head went.
  const layBody = (s: Snake) => {
    s.r = radiusFor(s.mass);
    const len = lengthFor(s.mass),
      gap = Math.max(3, s.r * 0.5),
      t = s.trail,
      segs = s.segs;
    let n = 0,
      want = gap,
      acc = 0,
      cut = 0;
    let px = t[t.length - 1].x,
      py = t[t.length - 1].y;
    segs[n++] = { x: px, y: py };
    for (let i = t.length - 2; i >= 0; i--) {
      const qx = t[i].x,
        qy = t[i].y,
        d = Math.hypot(qx - px, qy - py);
      while (d > 0 && acc + d >= want && want <= len) {
        const k = (want - acc) / d;
        segs[n++] = { x: px + (qx - px) * k, y: py + (qy - py) * k };
        want += gap;
      }
      acc += d;
      px = qx;
      py = qy;
      if (acc > len + 20) {
        cut = i;
        break;
      }
    }
    segs.length = n;
    if (cut > 64) t.splice(0, cut - 2);
  };

  const makeSnake = (o: {
    name: string;
    bot: boolean;
    mass: number;
    at: Point;
    dir: number;
    hue: Hue;
    kind: Kind | null;
  }): Snake => {
    const s: Snake = {
      ...o,
      want: o.dir,
      boost: false,
      boosting: false,
      alive: true,
      trail: [],
      segs: [],
      r: radiusFor(o.mass),
      killer: null,
      nextThink: 0,
      boostLeft: 0,
      drop: 0,
      coilSide: Math.random() < 0.5 ? 1 : -1,
    };
    for (let d = lengthFor(o.mass) + 40; d >= 0; d -= 4)
      s.trail.push({ x: o.at.x - Math.cos(o.dir) * d, y: o.at.y - Math.sin(o.dir) * d });
    layBody(s);
    return s;
  };

  const nextName = () => {
    if (!nameBag.length) nameBag = NAMES.slice().sort(() => Math.random() - 0.5);
    return nameBag.pop()!;
  };

  // Where a chain can appear: clear of every head and body, and while you
  // play, off your screen and never in the cone ahead of you.
  const spotScore = (p: Point) => {
    let score = Infinity;
    for (const s of snakes) {
      if (!s.alive) continue;
      const h = s.segs[0],
        dh = Math.hypot(h.x - p.x, h.y - p.y);
      if (dh < 500) return -1;
      for (let i = 0; i < s.segs.length; i += 4)
        if (Math.hypot(s.segs[i].x - p.x, s.segs[i].y - p.y) < 160 + s.r) return -1;
      score = Math.min(score, dh);
    }
    if (player?.alive) {
      const h = player.segs[0],
        d = Math.hypot(p.x - h.x, p.y - h.y);
      const view = Math.hypot(VW, VH) / 2 / cam.z + 200;
      if (d < view) return -1;
      if (Math.abs(angleDiff(player.dir, Math.atan2(p.y - h.y, p.x - h.x))) < 0.8 && d < view * 2.4)
        return -1;
    }
    return score;
  };
  const clearSpot = (margin = 400) => {
    let best: Point | null = null,
      bestScore = -1;
    for (let i = 0; i < 50; i++) {
      const p = inArena(margin),
        sc = spotScore(p);
      if (sc > bestScore) {
        best = p;
        bestScore = sc;
      }
    }
    return best ?? inArena(margin);
  };
  // A realistic spread: lots of small chains, a few big ones.
  const spawnMass = () => Math.min(1600, 8 + -Math.log(1 - Math.random()) * 110);
  const spawnBot = () => {
    const at = clearSpot();
    const away = player?.alive
      ? Math.atan2(at.y - player.segs[0].y, at.x - player.segs[0].x)
      : Math.atan2(-at.y, -at.x);
    return makeSnake({
      name: nextName(),
      bot: true,
      mass: spawnMass(),
      at,
      dir: away + rand(-0.6, 0.6),
      hue: pick(HUES),
      kind: pick(KINDS),
    });
  };

  // Packets ----------------------------------------------------------------------
  // Each packet hovers around an anchor on its own slow wobble, breathes in
  // size and brightness, fades in when it appears, and when a mouth takes it
  // it streams in and shrinks instead of vanishing. Kill drops burst out from
  // the body and settle.
  const addFood = (x: number, y: number, v: number, color: string, drop = false, vx = 0, vy = 0) =>
    food.push({
      ax: x,
      ay: y,
      x,
      y,
      v,
      color,
      r: 2 + Math.sqrt(v) * 2.3,
      vx,
      vy,
      phase: rand(0, TAU),
      wob: rand(1.5, 4.5),
      ws: rand(0.0011, 0.0026),
      drop,
      born: performance.now(),
      by: null,
      t: 0,
    });
  const seedFood = () => {
    const p = inArena(30);
    addFood(p.x, p.y, rand(0.5, 1.6), Math.random() < 0.82 ? pick(HUES).edge : HUES[6].edge);
  };

  const kill = (s: Snake, by: Snake | null) => {
    if (!s.alive) return;
    s.alive = false;
    s.killer = by;
    // The whole body spills as big packets in its color, bursting outward: a feast.
    const drops = Math.max(4, Math.floor(s.segs.length / 2));
    const each = Math.min(14, (s.mass * 0.85) / drops);
    for (let i = 0; i < s.segs.length; i += 2) {
      const g = s.segs[i],
        a = rand(0, TAU),
        sp = rand(30, 140);
      addFood(
        g.x + rand(-s.r, s.r) * 0.6,
        g.y + rand(-s.r, s.r) * 0.6,
        each * rand(0.7, 1.3),
        (s === player ? YOU : s.hue).edge,
        true,
        Math.cos(a) * sp,
        Math.sin(a) * sp,
      );
    }
    feasts.push({
      until: performance.now() + 9000,
      path: s.segs.filter((_, i) => i % 8 === 0).map((g) => ({ x: g.x, y: g.y })),
    });
    if (s.bot) {
      const t = setTimeout(
        () => {
          timers.delete(t);
          snakes.push(spawnBot());
        },
        rand(800, 2400),
      );
      timers.add(t);
    }
  };

  // AI -------------------------------------------------------------------------
  // Each think, a bot measures free distance along 20 headings (bodies, the
  // wall, and where nearby heads are about to be), prefers wide-open space
  // to narrow gaps, and then weighs what it wants:
  //   food   packets ahead, big ones counting for more;
  //   feast  a fresh kill nearby, raced to before others eat it;
  //   hunt   cutting in front of a smaller chain's head;
  //   coil   circling a much smaller chain and tightening the loop;
  //   flee   turning away from a bigger head coming at it.
  // A reflex every frame forces a rethink when something is right ahead.
  const RAYS = 20;
  const LOOK = 320;
  const clearance = new Float32Array(RAYS);
  const segGrid = new Map<number, Seg[]>();
  const foodGrid = new Map<number, Food[]>();

  interface Head {
    o: Snake;
    d: number;
    x: number;
    y: number;
    px: number;
    py: number;
    r: number;
  }

  const castRays = (s: Snake, heads: Head[]) => {
    const head = s.segs[0],
      r = s.r;
    for (let k = 0; k < RAYS; k++) {
      const a = s.dir + (k / RAYS) * TAU,
        cx = Math.cos(a),
        cy = Math.sin(a);
      let free = LOOK;
      for (let t = r + 8; t < LOOK; t += 15) {
        const px = head.x + cx * t,
          py = head.y + cy * t;
        if (px * px + py * py > (ARENA - r - 14) ** 2) {
          free = t;
          break;
        }
        let hit = false;
        near(segGrid, px, py, r + 34, (g) => {
          if (g.s !== s && (g.x - px) ** 2 + (g.y - py) ** 2 < (g.r + r + 6) ** 2)
            return (hit = true);
        });
        if (!hit)
          for (const h of heads) {
            const rr = (h.r + r + 22) ** 2;
            if (
              (h.px - px) ** 2 + (h.py - py) ** 2 < rr ||
              (h.x - px) ** 2 + (h.y - py) ** 2 < rr
            ) {
              hit = true;
              break;
            }
          }
        if (hit) {
          free = t;
          break;
        }
      }
      clearance[k] = free;
    }
  };

  const think = (s: Snake, now: number) => {
    if (now < s.nextThink || !s.kind) return;
    const K = s.kind,
      head = s.segs[0],
      r = s.r;
    // Bots far from the camera think less often; nobody's watching closely.
    const far = Math.hypot(head.x - cam.x, head.y - cam.y) > 2600;
    s.nextThink = now + K.think * 1000 * (far ? 2.5 : 1) * rand(0.85, 1.15);

    const heads: Head[] = [];
    for (const o of snakes) {
      if (o === s || !o.alive) continue;
      const h = o.segs[0],
        d = Math.hypot(h.x - head.x, h.y - head.y);
      if (d > 700) continue;
      const lead = speedOf(o) * 0.35;
      heads.push({
        o,
        d,
        x: h.x,
        y: h.y,
        px: h.x + Math.cos(o.dir) * lead,
        py: h.y + Math.sin(o.dir) * lead,
        r: o.r,
      });
    }
    castRays(s, heads);

    let prey: Head | null = null,
      preyScore = 0,
      threat: Head | null = null,
      threatScore = 0;
    for (const h of heads) {
      const toward = Math.cos(angleDiff(h.o.dir, Math.atan2(head.y - h.y, head.x - h.x)));
      if (h.o.mass < s.mass * 0.9 && h.d < 560) {
        const sc = (1 - h.d / 560) * (h.o === player ? K.you : 1);
        if (sc > preyScore) {
          preyScore = sc;
          prey = h;
        }
      } else if (h.o.mass > s.mass * 1.3 && h.d < 340 && toward > 0.3) {
        const sc = (1 - h.d / 340) * toward;
        if (sc > threatScore) {
          threatScore = sc;
          threat = h;
        }
      }
    }
    let target: Point | null = null,
      coiling = false;
    if (prey) {
      if (s.mass > prey.o.mass * 3 && prey.d < 320 && K.coil > 0.8) {
        coiling = true;
        const around = Math.atan2(head.y - prey.y, head.x - prey.x) + s.coilSide * 0.75;
        const radius = Math.max(prey.r * 5, Math.min(220, prey.d * 0.8));
        target = { x: prey.x + Math.cos(around) * radius, y: prey.y + Math.sin(around) * radius };
      } else {
        const lead = Math.max(70, Math.min(260, prey.d * 0.65));
        target = {
          x: prey.x + Math.cos(prey.o.dir) * lead,
          y: prey.y + Math.sin(prey.o.dir) * lead,
        };
      }
    }
    let feast: Point | null = null,
      feastD = Infinity;
    for (const f of feasts) {
      if (f.until < now) continue;
      for (const p of f.path) {
        const d = Math.hypot(p.x - head.x, p.y - head.y);
        if (d < 1100 && d < feastD) {
          feastD = d;
          feast = p;
        }
      }
    }

    const boxedIn = clearance[0] < r * 5 + 40;
    let best = s.dir,
      bestScore = -Infinity;
    for (let k = 0; k < RAYS; k++) {
      const a = s.dir + (k / RAYS) * TAU,
        turn = Math.abs(angleDiff(s.dir, a));
      const gap = Math.min(
        clearance[(k + RAYS - 1) % RAYS],
        clearance[k],
        clearance[(k + 1) % RAYS],
      );
      let area = 0;
      for (let j = -3; j <= 3; j++) area += clearance[(k + j + RAYS) % RAYS];
      area /= 7;
      let score = (gap / LOOK) * 4 + (area / LOOK) * 2.5;
      const turnRoom = speedOf(s) * 0.6 + r * 2.5;
      if (gap < turnRoom) score -= 8 + (turnRoom - gap) / 10;
      if (!boxedIn) {
        const cx = Math.cos(a),
          cy = Math.sin(a);
        let f = 0;
        for (const t of [90, 220, 380])
          near(foodGrid, head.x + cx * t, head.y + cy * t, 110, (o) => {
            const dx = o.x - head.x,
              dy = o.y - head.y,
              d = Math.hypot(dx, dy) + 1;
            if ((dx * cx + dy * cy) / d > 0.55) f += Math.pow(o.v, 1.4) / (d * 0.012 + 1);
          });
        score += Math.min(f, 40) * 0.07 * K.food;
        const aim = (p: Point, w: number) => {
          const da = Math.abs(angleDiff(a, Math.atan2(p.y - head.y, p.x - head.x)));
          score += (1 - da / Math.PI) * w;
        };
        if (target) aim(target, (coiling ? 4 * K.coil : 3 * K.hunt) * Math.max(0.4, preyScore));
        if (feast) aim(feast, 2.2 * K.feast * (1 - feastD / 1100));
        if (threat) {
          const away = Math.abs(angleDiff(a, Math.atan2(head.y - threat.y, head.x - threat.x)));
          score += (1 - away / Math.PI) * 3 * threatScore;
        }
        const edge = Math.hypot(head.x, head.y) / ARENA;
        if (edge > 0.82)
          score +=
            (1 - Math.abs(angleDiff(a, Math.atan2(-head.y, -head.x))) / Math.PI) *
            (edge - 0.82) *
            14;
        score -= turn * 0.42;
      } else score -= turn * 0.08;
      if (score > bestScore) {
        bestScore = score;
        best = a;
      }
    }
    s.want = best;
    // Boost to strike, to beat others to a feast, or to run straight from a
    // threat: only with clear road ahead, never while boxed in, and only when
    // it's long enough that the cost won't cripple it.
    if (s.mass > 50 && !boxedIn && clearance[0] > 260) {
      const striking =
        target &&
        !coiling &&
        Math.hypot(target.x - head.x, target.y - head.y) < 260 &&
        Math.abs(angleDiff(s.dir, Math.atan2(target.y - head.y, target.x - head.x))) < 0.45;
      const racing =
        feast &&
        feastD < 420 &&
        feastD > 120 &&
        Math.abs(angleDiff(s.dir, Math.atan2(feast.y - head.y, feast.x - head.x))) < 0.4;
      if (striking) s.boostLeft = 0.45;
      else if (racing || (threat && threatScore > 0.5)) s.boostLeft = 0.3;
    }
  };

  const blockedAhead = (s: Snake) => {
    const head = s.segs[0],
      r = s.r,
      reach = speedOf(s) * 0.3 + r * 2,
      cx = Math.cos(s.dir),
      cy = Math.sin(s.dir);
    for (const t of [reach * 0.5, reach]) {
      const px = head.x + cx * t,
        py = head.y + cy * t;
      if (px * px + py * py > (ARENA - r - 8) ** 2) return true;
      let hit = false;
      near(segGrid, px, py, r + 34, (g) => {
        if (g.s !== s && (g.x - px) ** 2 + (g.y - py) ** 2 < (g.r + r + 4) ** 2)
          return (hit = true);
      });
      if (hit) return true;
    }
    return false;
  };

  // Simulation --------------------------------------------------------------------
  const step = (dt: number, now: number) => {
    segGrid.clear();
    foodGrid.clear();
    for (const s of snakes)
      if (s.alive)
        for (let i = 0; i < s.segs.length; i++)
          put(segGrid, s.segs[i].x, s.segs[i].y, { s, i, x: s.segs[i].x, y: s.segs[i].y, r: s.r });
    // Packets move first: bursts settle, wobble continues, swallowed ones stream in.
    const settle = Math.exp(-dt * 4);
    for (const f of food) {
      if (f.by) {
        f.t += dt * 7;
        const s = f.by,
          h = s.segs[0],
          mx = h.x + Math.cos(s.dir) * s.r * 0.6,
          my = h.y + Math.sin(s.dir) * s.r * 0.6;
        f.x += (mx - f.x) * Math.min(1, dt * 18);
        f.y += (my - f.y) * Math.min(1, dt * 18);
        continue;
      }
      if (f.vx || f.vy) {
        f.ax += f.vx * dt;
        f.ay += f.vy * dt;
        f.vx *= settle;
        f.vy *= settle;
        if (Math.abs(f.vx) + Math.abs(f.vy) < 2) f.vx = f.vy = 0;
      }
      f.x = f.ax + Math.cos(now * f.ws + f.phase) * f.wob;
      f.y = f.ay + Math.sin(now * f.ws * 1.3 + f.phase) * f.wob;
      put(foodGrid, f.x, f.y, f);
    }
    feasts = feasts.filter((f) => f.until > now);

    for (const s of snakes) {
      if (!s.alive) continue;
      if (s.bot) {
        if (blockedAhead(s)) {
          s.nextThink = 0;
          s.boostLeft = 0;
        }
        think(s, now);
        s.boostLeft = Math.max(0, s.boostLeft - dt);
        s.boost = s.boostLeft > 0;
      }
      s.boosting = s.boost && s.mass > MIN_BOOST_MASS;
      const turn = turnFor(s.r) * (s.boosting ? 0.9 : 1);
      s.dir += Math.max(-turn * dt, Math.min(turn * dt, angleDiff(s.dir, s.want)));
      const head = s.trail[s.trail.length - 1],
        v = speedOf(s);
      s.trail.push({ x: head.x + Math.cos(s.dir) * v * dt, y: head.y + Math.sin(s.dir) * v * dt });
      // Boosting burns mass and sheds it from the tail as a trail of packets.
      if (s.boosting) {
        const burn = dt * BURN;
        s.mass = Math.max(MIN_BOOST_MASS - 0.5, s.mass - burn);
        s.drop += burn;
        if (s.drop > 1.1) {
          const t = s.segs[s.segs.length - 1],
            back = s.dir + Math.PI + rand(-0.6, 0.6);
          addFood(
            t.x,
            t.y,
            s.drop * 0.85,
            (s === player ? YOU : s.hue).edge,
            false,
            Math.cos(back) * 60,
            Math.sin(back) * 60,
          );
          s.drop = 0;
        }
      }
      layBody(s);
    }

    // Eating: packets near a mouth are drawn toward it, then swallowed.
    for (const s of snakes) {
      if (!s.alive) continue;
      const h = s.segs[0],
        mx = h.x + Math.cos(s.dir) * s.r * 0.5,
        my = h.y + Math.sin(s.dir) * s.r * 0.5,
        reach = s.r * 2.4 + 30;
      near(foodGrid, mx, my, reach, (f) => {
        if (f.by) return;
        const dx = mx - f.x,
          dy = my - f.y,
          d = Math.hypot(dx, dy);
        if (d < s.r * 0.8 + f.r * 0.5) {
          f.by = s;
          s.mass += f.v;
          return;
        }
        if (d < reach) {
          const pull = Math.min(1, (560 * dt) / Math.max(d, 1)) * (1 - (d / reach) * 0.5);
          f.ax += dx * pull;
          f.ay += dy * pull;
          f.wob *= 0.9;
        }
      });
    }

    // Collisions: a head into any other chain's body, or into the wall.
    for (const s of snakes) {
      if (!s.alive) continue;
      const h = s.segs[0],
        r = s.r;
      if (h.x * h.x + h.y * h.y > (ARENA - r) ** 2) {
        kill(s, null);
        continue;
      }
      let hit: Snake | null = null,
        headOn = false;
      near(segGrid, h.x, h.y, r + 34, (g) => {
        if (g.s === s || !g.s.alive) return;
        if ((g.x - h.x) ** 2 + (g.y - h.y) ** 2 < (g.r + r * 0.7) ** 2) {
          hit = g.s;
          headOn = g.i < 2;
          return true;
        }
      });
      if (hit) {
        if (headOn) kill(hit, s);
        kill(s, hit);
      }
    }

    food = food.filter((f) => !(f.by && (f.t >= 1 || !f.by.alive)));
    let natural = 0;
    for (const f of food) if (!f.drop && !f.by) natural++;
    while (natural++ < FOOD) seedFood();
    if (food.length > FOOD_CAP) food.splice(0, food.length - FOOD_CAP);
    snakes = snakes.filter((s) => s.alive || s === player);
  };

  // Rendering ---------------------------------------------------------------------
  const fit = () => {
    const rect = canvas.getBoundingClientRect(),
      dpr = Math.min(window.devicePixelRatio || 1, 2);
    VW = Math.max(320, rect.width);
    VH = Math.max(320, rect.height);
    canvas.width = VW * dpr;
    canvas.height = VH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // Glow sprites, one per color, drawn once: a bright core and a soft halo.
  const sprites = new Map<string, HTMLCanvasElement>();
  const glow = (color: string) => {
    let c = sprites.get(color);
    if (c) return c;
    c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!,
      grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.12, color);
    grad.addColorStop(0.3, color);
    grad.addColorStop(0.4, color + "66");
    grad.addColorStop(1, color + "00");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    sprites.set(color, c);
    return c;
  };

  const MONO = '"JetBrains Mono", ui-monospace, monospace';
  const INST = 'var(--font-michroma), "Hanken Grotesk", sans-serif';
  const text = (
    s: string,
    x: number,
    y: number,
    size: number,
    color: string,
    align: CanvasTextAlign = "center",
    font = MONO,
  ) => {
    ctx.font = `${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillText(s, x, y);
  };

  const drawSnake = (s: Snake, now: number) => {
    const hue = s === player ? YOU : s.hue,
      segs = s.segs,
      r = s.r;
    if (s.boosting) {
      ctx.globalCompositeOperation = theme.dark ? "lighter" : "source-over";
      ctx.globalAlpha = 0.16;
      for (let i = segs.length - 1; i >= 0; i -= 2)
        ctx.drawImage(glow(hue.edge), segs[i].x - r * 2.4, segs[i].y - r * 2.4, r * 4.8, r * 4.8);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
    const lit = s.boosting ? 0.3 + 0.2 * Math.sin(now / 50) : 0;
    ctx.lineWidth = Math.max(1, r * 0.14);
    for (let i = segs.length - 1; i >= 0; i--) {
      const g = segs[i];
      ctx.beginPath();
      ctx.arc(g.x, g.y, r, 0, TAU);
      ctx.fillStyle = hue.body;
      ctx.fill();
      // Bands every few segments read as the chain's links.
      ctx.globalAlpha = Math.min(1, (Math.floor(i / 3) % 2 ? 0.55 : 0.95) + lit);
      ctx.strokeStyle = hue.edge;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    const h = segs[0];
    ctx.beginPath();
    ctx.arc(h.x, h.y, r * 1.04, 0, TAU);
    ctx.fillStyle = hue.body;
    ctx.fill();
    ctx.lineWidth = Math.max(1.4, r * 0.18);
    ctx.strokeStyle = hue.edge;
    ctx.stroke();
    const look =
      s === player && pointer ? Math.atan2(pointer.y - VH / 2, pointer.x - VW / 2) : s.want;
    for (const side of [-1, 1]) {
      const ex =
        h.x + Math.cos(s.dir) * r * 0.32 + Math.cos(s.dir + (side * Math.PI) / 2) * r * 0.45;
      const ey =
        h.y + Math.sin(s.dir) * r * 0.32 + Math.sin(s.dir + (side * Math.PI) / 2) * r * 0.45;
      ctx.beginPath();
      ctx.arc(ex, ey, r * 0.27, 0, TAU);
      ctx.fillStyle = "#e6ece9";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex + Math.cos(look) * r * 0.1, ey + Math.sin(look) * r * 0.1, r * 0.13, 0, TAU);
      ctx.fillStyle = "#0a0c0c";
      ctx.fill();
    }
  };

  const draw = (now: number) => {
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, VW, VH);
    ctx.save();
    ctx.translate(VW / 2, VH / 2);
    ctx.scale(cam.z, cam.z);
    ctx.translate(-cam.x, -cam.y);
    const halfW = VW / 2 / cam.z,
      halfH = VH / 2 / cam.z;
    // Floor: the site's dot grid inside the arena; outside it, a darker void.
    const grid = 56,
      dot = Math.max(1.5, 1.6 / cam.z);
    ctx.fillStyle = theme.grid;
    for (let x = Math.floor((cam.x - halfW) / grid) * grid; x < cam.x + halfW; x += grid)
      for (let y = Math.floor((cam.y - halfH) / grid) * grid; y < cam.y + halfH; y += grid)
        if (x * x + y * y < ARENA * ARENA) ctx.fillRect(x - dot / 2, y - dot / 2, dot, dot);
    ctx.beginPath();
    ctx.arc(0, 0, ARENA, 0, TAU);
    ctx.rect(cam.x + halfW, cam.y - halfH, -halfW * 2, halfH * 2);
    ctx.fillStyle = theme.dark ? "rgba(0,0,0,.45)" : "rgba(0,0,0,.06)";
    ctx.fill("evenodd");
    ctx.beginPath();
    ctx.arc(0, 0, ARENA, 0, TAU);
    ctx.strokeStyle = WALL;
    ctx.lineWidth = 3 / cam.z;
    ctx.setLineDash([18 / cam.z, 12 / cam.z]);
    ctx.stroke();
    ctx.setLineDash([]);
    // Packets, additively in the dark, so clusters and kill drops bloom where they overlap.
    ctx.globalCompositeOperation = theme.dark ? "lighter" : "source-over";
    for (const f of food) {
      if (Math.abs(f.x - cam.x) > halfW + 40 || Math.abs(f.y - cam.y) > halfH + 40) continue;
      const age = Math.min(1, (now - f.born) / 450);
      const breathe = 1 + 0.16 * Math.sin(now * 0.0042 + f.phase);
      const twinkle = 0.72 + 0.28 * Math.sin(now * 0.0031 + f.phase * 3);
      const gone = f.by ? Math.max(0, 1 - f.t) : 1;
      const size = f.r * 2.9 * breathe * age * gone;
      if (size < 0.5) continue;
      ctx.globalAlpha = (f.drop ? 0.95 : 0.78) * twinkle * gone;
      ctx.drawImage(glow(f.color), f.x - size, f.y - size, size * 2, size * 2);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    const onScreen = snakes
      .filter(
        (s) =>
          s.alive &&
          s.segs.some(
            (g, i) =>
              i % 6 === 0 &&
              Math.abs(g.x - cam.x) < halfW + 60 &&
              Math.abs(g.y - cam.y) < halfH + 60,
          ),
      )
      .sort((a, b) => a.mass - b.mass);
    for (const s of onScreen) drawSnake(s, now);
    ctx.restore();
    for (const s of onScreen) {
      const h = s.segs[0],
        sx = (h.x - cam.x) * cam.z + VW / 2,
        sy = (h.y - cam.y) * cam.z + VH / 2 - s.r * cam.z - 14;
      if (sx < -60 || sx > VW + 60 || sy < -20 || sy > VH + 20) continue;
      text(s === player ? "you" : s.name, sx, sy, 11, s === player ? YOU.edge : theme.text);
    }
    if (state === "play") drawHud();
  };

  const score = (s: Snake) => Math.floor(s.mass);
  const drawHud = () => {
    const ranked = snakes.filter((s) => s.alive).sort((a, b) => b.mass - a.mass);
    const x = VW - 16;
    text("LEADERBOARD", x, 20, 8, theme.text, "right", INST);
    ranked.slice(0, 10).forEach((s, i) => {
      const you = s === player;
      text(
        `${i + 1}  ${you ? "you" : s.name}  ${score(s).toLocaleString("en-US")}`,
        x,
        40 + i * 16,
        11,
        you ? YOU.edge : theme.text,
        "right",
      );
    });
    if (player?.alive) {
      const rank = ranked.indexOf(player) + 1;
      if (rank > 10)
        text(
          `${rank}  you  ${score(player).toLocaleString("en-US")}`,
          x,
          40 + 10 * 16 + 4,
          11,
          YOU.edge,
          "right",
        );
      text(
        `Your length ${score(player).toLocaleString("en-US")}`,
        16,
        VH - 36,
        13,
        player.boosting ? WALL : theme.fg,
        "left",
      );
      text(
        player.boosting ? "Boosting: burning length" : `Rank ${rank} of ${ranked.length}`,
        16,
        VH - 17,
        11,
        player.boosting ? WALL : theme.text,
        "left",
      );
    }
    const mr = Math.min(52, VW * 0.065),
      mx = 16 + mr,
      my = 16 + mr;
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, TAU);
    ctx.fillStyle = theme.panel;
    ctx.fill();
    ctx.strokeStyle = theme.strong;
    ctx.lineWidth = 1;
    ctx.stroke();
    for (const s of ranked.slice(0, 12)) {
      const h = s.segs[0];
      ctx.beginPath();
      ctx.arc(
        mx + (h.x / ARENA) * mr,
        my + (h.y / ARENA) * mr,
        1.4 + Math.min(2.5, s.r / 12),
        0,
        TAU,
      );
      ctx.fillStyle = theme.text;
      ctx.fill();
    }
    if (player?.alive) {
      const h = player.segs[0];
      ctx.beginPath();
      ctx.arc(mx + (h.x / ARENA) * mr, my + (h.y / ARENA) * mr, 3.2, 0, TAU);
      ctx.fillStyle = YOU.edge;
      ctx.fill();
    }
  };

  // Camera -------------------------------------------------------------------------
  // You, else whoever got you for a moment, else a rotating pick of the leaders.
  const moveCamera = (dt: number, now: number) => {
    let target: Snake | null = player?.alive ? player : null;
    if (!target && follow?.alive && now < followUntil) target = follow;
    if (!target) {
      if (!follow?.alive || now > followUntil) {
        const top = snakes.filter((s) => s.alive).sort((a, b) => b.mass - a.mass);
        follow = top.length ? pick(top.slice(0, 4)) : null;
        followUntil = now + 10000;
      }
      target = follow;
    }
    if (!target) return;
    const h = target.segs[0],
      ease = state === "play" ? 7 : 1.2;
    cam.x += (h.x - cam.x) * Math.min(1, dt * ease);
    cam.y += (h.y - cam.y) * Math.min(1, dt * ease);
    // Pull out as the chain grows, so a long chain can see around itself,
    // and a little more on small screens.
    const fitScreen = Math.min(1, Math.min(VW, VH) / 720) * 0.35 + 0.65;
    const grown = Math.max(0.3, 1.1 * Math.pow(1 + target.mass / 120, -0.4));
    const z = (state === "play" ? grown : 0.55) * fitScreen;
    cam.z += (z - cam.z) * Math.min(1, dt * 1.5);
  };

  // Loop ----------------------------------------------------------------------------
  const frame = (now: number) => {
    raf = 0;
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    if (player?.alive) {
      if (keyTurn) player.want = player.dir + keyTurn * 1.3;
      else if (pointer) player.want = Math.atan2(pointer.y - VH / 2, pointer.x - VW / 2);
      player.boost = held || boostHeld;
    }
    step(dt, now);
    if (state === "play" && player && !player.alive) {
      state = "attract";
      follow = player.killer;
      followUntil = now + 4000;
      onEnd({ length: score(player), killer: player.killer?.name ?? null });
    }
    moveCamera(dt, now);
    draw(now);
    schedule();
  };
  const schedule = () => {
    if (running && visible && !document.hidden && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };

  // Input ----------------------------------------------------------------------------
  const toCanvas = (e: PointerEvent): Point => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (VW / r.width), y: (e.clientY - r.top) * (VH / r.height) };
  };
  const onMove = (e: PointerEvent) => {
    pointer = toCanvas(e);
  };
  const onDown = (e: PointerEvent) => {
    pointer = toCanvas(e);
    if (state === "play" && e.pointerType === "mouse") held = true;
  };
  const onUp = () => {
    held = false;
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (state !== "play") return;
    if ([" ", "ArrowLeft", "ArrowRight", "ArrowUp"].includes(e.key)) e.preventDefault();
    if (e.key === " " || e.key === "ArrowUp") held = true;
    if (e.key === "ArrowLeft") {
      keyTurn = -1;
      pointer = null;
    }
    if (e.key === "ArrowRight") {
      keyTurn = 1;
      pointer = null;
    }
    if (e.key === "Escape") quit();
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === " " || e.key === "ArrowUp") held = false;
    if ((e.key === "ArrowLeft" && keyTurn === -1) || (e.key === "ArrowRight" && keyTurn === 1))
      keyTurn = 0;
  };
  const onBoostDown = (e: PointerEvent) => {
    e.preventDefault();
    boostHeld = true;
  };
  const onBoostUp = () => {
    boostHeld = false;
  };
  const onVisibility = () => schedule();
  const onResize = () => {
    fit();
    if (!running) draw(performance.now());
  };

  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerdown", onDown);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);
  boostButton?.addEventListener("pointerdown", onBoostDown);
  boostButton?.addEventListener("pointerup", onBoostUp);
  boostButton?.addEventListener("pointercancel", onBoostUp);
  // Pause while the arena is scrolled out of view.
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  });
  io.observe(canvas);
  // Follow the theme toggle.
  const themeWatch = new MutationObserver(() => {
    readTheme();
    if (!running) draw(performance.now());
  });
  themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  const scheme = matchMedia("(prefers-color-scheme: dark)");
  const onScheme = () => {
    readTheme();
    if (!running) draw(performance.now());
  };
  scheme.addEventListener("change", onScheme);

  // Start ------------------------------------------------------------------------------
  fit();
  for (let i = 0; i < BOTS; i++) snakes.push(spawnBot());
  for (let i = 0; i < FOOD; i++) seedFood();
  for (let i = 0; i < 150; i++) step(1 / 30, performance.now() + i * 33); // open mid-game
  const lead = snakes.slice().sort((a, b) => b.mass - a.mass)[0];
  cam.x = lead.segs[0].x;
  cam.y = lead.segs[0].y;
  if (still) draw(performance.now());
  else {
    running = true;
    schedule();
  }

  function start() {
    snakes = snakes.filter((s) => s.bot);
    player = null;
    player = makeSnake({
      name: "you",
      bot: false,
      mass: START_MASS,
      at: clearSpot(600),
      dir: rand(0, TAU),
      hue: YOU,
      kind: null,
    });
    snakes.push(player);
    pointer = null;
    held = false;
    keyTurn = 0;
    state = "play";
    canvas.focus({ preventScroll: true });
    running = true;
    schedule();
  }

  function quit() {
    if (player?.alive) kill(player, null);
    player = null;
    state = "attract";
    onEnd(null);
  }

  function destroy() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    for (const t of timers) clearTimeout(t);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointerup", onUp);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisibility);
    boostButton?.removeEventListener("pointerdown", onBoostDown);
    boostButton?.removeEventListener("pointerup", onBoostUp);
    boostButton?.removeEventListener("pointercancel", onBoostUp);
    io.disconnect();
    themeWatch.disconnect();
    scheme.removeEventListener("change", onScheme);
  }

  return { start, quit, destroy };
}
