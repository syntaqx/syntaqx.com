import { box, quad, type Box, type Part, type Scene, type SceneFn, type SceneState, type V3 } from "./iso";

/*
 * Scene registry. Each is a function of animation state returning parts in
 * painter's order (back to front, bottom to top). Feature posts pick theirs
 * with `hero = "<name>"` in front matter; every post scene is its own.
 */

const bob = (s: SceneState, amp = 0.18) => Math.sin(s.t * 1.4) * amp;
const ground = (n = 12): [V3, V3][] => [
  [[-14, 0, 0], [n + 16, 0, 0]],
  [[0, -14, 0], [0, n + 16, 0]],
  [[n, -14, 0], [n, n + 16, 0]],
  [[-14, n, 0], [n + 16, n, 0]],
];

const ease = (k: number) => k * k * (3 - 2 * k);

/** An open-topped box on the ground: far walls, then what's inside, then near walls. */
const tray = (x: number, y: number, a: number, b: number, h: number, inside: Part[], t = 0.15): Part[] => [
  { kind: "plane", pts: quad(x, y, 0, a, b), v: 0.12 },
  { kind: "box", box: box(x, y, 0, a, t, h) },
  { kind: "box", box: box(x, y, 0, t, b, h) },
  ...inside,
  { kind: "box", box: box(x, y + b - t, 0, a - t, t, h) },
  { kind: "box", box: box(x + a - t, y, 0, t, b, h) },
];

/**
 * Home: a production system exploded into four tiers: product, the edge
 * (dns, cdn, s3) outside the network, then the app and data subnets. The
 * request path (teal) runs product, the cdn, a load balancer, an app
 * cluster, then postgres. The cdn serves static files from s3. dns comes
 * first but is a lookup (dashed), not a hop: the product asks it, it
 * resolves to the cdn, and traffic goes straight to the cdn. The cluster also reads redis and queues work
 * for a worker, and the primary replicates to a read replica.
 */
const system: SceneFn = (s) => {
  const Z = { app: 4.2 + s.spread * 1.8, edge: 7.8 + s.spread * 3.6, product: 11.2 + s.spread * 5.2 };
  // the app cluster: four instances in a band, leaving the middle clear
  // for the drop from the cdn to the lb
  const apps = [-5, -2.4, 2.4, 5].map((u) => [(11.8 + u) / 2 - 0.6, (11.8 - u) / 2 - 0.6] as const);
  const parts: Part[] = [
    // data subnet
    { kind: "plane", pts: quad(0, 0, 0, 12, 12), v: 0.09, grid: 12 },
    { kind: "cable", pts: [[9.9, 5.75, 0], [9.9, 8.7, 0]], speed: 0.16 },
    { kind: "cyl", cx: 9.8, cy: 4.6, z: 0, r: 1.15, h: 2.2 },
    { kind: "cyl", cx: 10.1, cy: 9.6, z: 0, r: 0.9, h: 1.6 },
    { kind: "box", box: box(2.4, 9.9, 0, 1.4, 1.4, 1), slots: true },
    { kind: "label", at: [10.6, 3.8, 2.2], text: "pg · primary", dx: 1.2, dy: -1.4 },
    { kind: "label", at: [11, 9.6, 0.8], text: "pg · replica", dx: 1.2, dy: 0.8 },
    { kind: "label", at: [2.4, 11.3, 0.5], text: "redis", dx: -1.2, dy: 1 },
    // app subnet
    {
      kind: "plane",
      pts: quad(1.5, 1.5, Z.app, 9, 9),
      v: 0.16,
      drops: { at: [[1.5, 1.5], [10.5, 1.5], [1.5, 10.5], [10.5, 10.5]], from: 0 },
    },
    // lb to the cluster, along a bus on each side
    { kind: "cable", pts: [[7.7, 8.3, Z.app], [apps[0][0] + 1.2, 8.3, Z.app]], speed: 0.5, accent: true },
    { kind: "cable", pts: [[8.3, 7.7, Z.app], [8.3, apps[3][1] + 1.2, Z.app]], speed: 0.5, accent: true },
    { kind: "line", a: [apps[1][0] + 0.6, 8.3, Z.app], b: [apps[1][0] + 0.6, apps[1][1] + 1.2, Z.app], accent: true },
    { kind: "line", a: [8.3, apps[2][1] + 0.6, Z.app], b: [apps[2][0] + 1.2, apps[2][1] + 0.6, Z.app], accent: true },
    // the cluster queues work for the worker
    { kind: "cable", pts: [[apps[0][0] + 0.9, apps[0][1] + 1.2, Z.app], [apps[0][0] + 0.9, 9.95, Z.app], [4.3, 9.95, Z.app]], speed: 0.35 },
    { kind: "cable", pts: [[5.8, 9.95, Z.app], [6.3, 9.95, Z.app]], speed: 0.35 },
    ...apps.map(([x, y]): Part => ({ kind: "box", box: box(x, y, Z.app, 1.2, 1.2, 1), vents: true })),
    { kind: "box", box: box(4.3, 9.6, Z.app, 0.7, 0.7, 0.7), small: true },
    { kind: "box", box: box(5.1, 9.6, Z.app, 0.7, 0.7, 0.7), small: true },
    { kind: "box", box: box(6.3, 9.4, Z.app, 1, 1.1, 0.8) },
    { kind: "box", box: box(7.7, 7.7, Z.app, 1.2, 1.2, 0.5), accent: true },
    // down to the data subnet: writes to the primary, cache reads from redis
    { kind: "cable", pts: [[apps[3][0] + 1.2, 4, Z.app], [9.9, 4, Z.app], [9.9, 4, 2.2]], speed: 0.3, accent: true },
    { kind: "cable", pts: [[apps[0][0] + 0.3, apps[0][1] + 1.2, Z.app], [apps[0][0] + 0.3, 10.6, Z.app], [apps[0][0] + 0.3, 10.6, 1]], speed: 0.3 },
    { kind: "label", at: [apps[3][0] + 1.2, apps[3][1], Z.app + 1], text: "apps", dx: 1.4, dy: -1.6 },
    { kind: "label", at: [4.3, 10.3, Z.app + 0.7], text: "queue", dx: -1.4, dy: 0.4 },
    { kind: "label", at: [6.3, 10.5, Z.app + 0.4], text: "worker", dx: -1.2, dy: 1.6 },
    { kind: "label", at: [8.9, 8.9, Z.app + 0.5], text: "lb", dx: 1.6, dy: 1 },
    // edge: the cdn takes all traffic, serving static files from s3 and
    // passing the rest to the lb
    { kind: "cable", pts: [[8.4, 8.4, Z.edge], [8.4, 8.4, Z.app + 0.5]], speed: 0.3, accent: true },
    { kind: "plane", pts: quad(2.5, 2.5, Z.edge, 7, 7), v: 0.14 },
    { kind: "cable", pts: [[7.9, 8.05, Z.edge], [6.5, 8.05, Z.edge]], speed: 0.4 },
    // dns resolves to the cdn, passing in front of the bucket
    { kind: "line", a: [4.1, 8.7, Z.edge], b: [7.9, 8.7, Z.edge], dashed: true, alpha: 0.7 },
    { kind: "box", box: box(3, 7.9, Z.edge, 1.1, 1.2, 0.7) },
    { kind: "cyl", cx: 5.9, cy: 7.6, z: Z.edge, r: 0.42, h: 0.8, rt: 0.6 },
    { kind: "box", box: box(7.9, 7.9, Z.edge, 1, 1, 0.5) },
    { kind: "label", at: [3, 9.1, Z.edge + 0.7], text: "dns", dx: -1.4, dy: -0.4 },
    { kind: "label", at: [5.3, 7.6, Z.edge + 0.8], text: "s3", dx: -2.6, dy: 1.2 },
    { kind: "label", at: [8.9, 7.9, Z.edge + 0.5], text: "cdn", dx: 1, dy: -1.4 },
    // product resolves through dns, then sends everything to the cdn
    { kind: "line", a: [3.6, 8.5, Z.product], b: [3.6, 8.5, Z.edge + 0.7], dashed: true, alpha: 0.7 },
    { kind: "cable", pts: [[8.4, 8.4, Z.product], [8.4, 8.4, Z.edge + 0.5]], speed: 0.3, accent: true },
    {
      kind: "plane",
      pts: quad(3.5, 3.5, Z.product, 5, 5),
      v: 0.2,
      window: true,
      rows: { lengths: [3, 2, 3.6, 1.4] },
      handles: true,
    },
    { kind: "label", at: [8.5, 3.5, Z.product], text: "product", dx: 1.4, dy: -1.6, accent: true },
  ];
  return {
    parts,
    ext: [[-1.5, 13, 0], [13.5, -1, 0], [12, 12, 0], [0, 0, 0], [3.5, 3.5, Z.product + 0.8]],
    axes: ground(),
  };
};

/**
 * The Thinking Tax: the debugging loop (break, confuse, dig, guess, test,
 * understand), where "understand" is missing and a teal shortcut runs from
 * the break straight to the fix.
 */
const loop: SceneFn = (s) => {
  const names = ["break", "confuse", "dig", "guess", "test", "understand"];
  const R = 3.7;
  const nodes = names.map((name, i) => {
    const a = (Math.PI * 2 * i) / names.length + Math.PI * 0.75;
    return { name, x: 6 + R * Math.cos(a), y: 6 + R * Math.sin(a), h: 0.6 + (i % 3) * 0.3 };
  });
  const ring: V3[] = [];
  for (let i = 0; i <= 48; i++) {
    const a = (Math.PI * 2 * i) / 48 + Math.PI * 0.75;
    ring.push([6 + R * Math.cos(a), 6 + R * Math.sin(a), 0]);
  }
  const plateZ = 5.6 + s.spread * 2.4;
  const fixZ = plateZ + s.spread * 1.2 + bob(s);
  const brk = nodes[0];
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 12, 12), v: 0.09, grid: 12 },
    { kind: "cable", pts: ring, speed: 0.12 },
    ...[...nodes]
      .sort((a, b) => a.x + a.y - (b.x + b.y))
      .map((n): Part =>
        n.name === "understand"
          ? { kind: "box", box: box(n.x - 0.6, n.y - 0.6, 0, 1.2, 1.2, 0.9), ghost: true }
          : { kind: "box", box: box(n.x - 0.6, n.y - 0.6, 0, 1.2, 1.2, n.h) },
      ),
    ...nodes
      .filter((n) => ["break", "understand", "guess"].includes(n.name))
      .map((n): Part => ({
        kind: "label",
        at: [n.x, n.y, n.name === "understand" ? 0.9 : n.h],
        text: n.name === "understand" ? "understand · missing" : n.name,
        dx: n.x - n.y > 0 ? 1.4 : -1.4,
        dy: -1,
      })),
    {
      kind: "plane",
      pts: quad(4.4, 4.4, plateZ, 3.2, 3.2),
      v: 0.2,
      handles: true,
      drops: { at: [[4.4, 4.4], [7.6, 7.6]], from: 0 },
    },
    { kind: "cable", pts: [[brk.x, brk.y, brk.h], [brk.x, brk.y, plateZ], [5.4, 5.4, plateZ]], speed: 0.6, accent: true },
    { kind: "box", box: box(5.4, 5.4, fixZ, 1.2, 1.2, 0.8), accent: true, handles: true },
    { kind: "label", at: [6.6, 5.4, fixZ + 0.8], text: "fix · 10 min", dx: 1.6, dy: -1.4, accent: true },
  ];
  return { parts, ext: [[0, 12, 0], [12, 0, 0], [12, 12, 0], [0, 0, 0], [5.4, 5.4, fixZ + 2.4]], axes: ground() };
};

/**
 * Control Isn't Success: a legacy vendor welded to a new platform, a product
 * shipped early above it, and the problem statement it was meant to answer
 * left as an empty outline.
 */
const weld: SceneFn = (s) => {
  const lift = 5.2 + s.spread * 2.6;
  const shipZ = lift + s.spread * 1 + bob(s);
  const zig: V3[] = [];
  for (let i = 0; i <= 18; i++) zig.push([3.9, 1.2 + i * 0.47, i % 2 ? 0.5 : 2.6]);
  const mods: Part[] = [];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 4; j++)
      mods.push({ kind: "box", box: box(5.2 + i * 2.1, 1.6 + j * 2.1, 0.4, 1.5, 1.5, 0.5 + ((i * 3 + j) % 4) * 0.35) });
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 12, 12), v: 0.09, grid: 12 },
    { kind: "box", box: box(0.6, 1, 0, 3.2, 10, 3.2), vents: true },
    { kind: "label", at: [0.6, 6, 3.2], text: "legacy vendor", dx: -1.6, dy: -1.1 },
    { kind: "plane", pts: quad(4.6, 1, 0.4, 6.8, 10), v: 0.16 },
    { kind: "cable", pts: zig, speed: 0.08, accent: true },
    { kind: "cable", pts: [[5.95, 2.35, 0.4], [5.95, 9.7, 0.4], [10.15, 9.7, 0.4]], speed: 0.3 },
    ...mods,
    { kind: "label", at: [11.4, 6, 0.4], text: "platform", dx: 1.4, dy: 0.9 },
    { kind: "plane", pts: quad(5, 2.4, lift, 3, 3), v: 0.2, handles: true, drops: { at: [[5, 2.4], [8, 5.4]], from: 1.6 } },
    { kind: "box", box: box(5.8, 3.2, shipZ, 1.4, 1.4, 1), accent: true, handles: true },
    { kind: "label", at: [7.2, 3.2, shipZ + 1], text: "shipped · a year early", dx: 1.4, dy: -1.4, accent: true },
    { kind: "plane", pts: quad(8.6, 6.4, lift, 3, 3), v: 0, dashed: true },
    { kind: "box", box: box(9.4, 7.2, lift, 1.4, 1.4, 1), ghost: true },
    { kind: "label", at: [10.8, 8.6, lift + 1], text: "problem statement · ?", dx: 1.2, dy: 1.1 },
  ];
  return { parts, ext: [[0, 12, 0], [12, 0, 0], [12, 12, 0], [0, 0, 0], [5.8, 3.2, shipZ + 2.6]], axes: ground() };
};

/**
 * Growing Together in the Age of LLMs: a tiny v1 next to the tower of work
 * that comes after it, wrapped in scaffolding.
 */
const scaffold: SceneFn = (s) => {
  const gap = 0.25 + s.spread * 0.5;
  const layers = ["schema", "auth", "migrations", "edge cases"];
  const H = 1.2;
  const zAt = (i: number) => i * (H + gap);
  const top = zAt(layers.length);
  const poles = (corner: [number, number]): Part => ({ kind: "line", a: [corner[0], corner[1], 0], b: [corner[0], corner[1], top + 1.4], alpha: 0.55 });
  const rails = (side: "back" | "front"): Part[] => {
    const out: Part[] = [];
    for (let k = 1; k <= layers.length + 1; k++) {
      const z = Math.min(top + 1.2, k * (H + gap) - gap / 2);
      if (side === "back") {
        out.push({ kind: "line", a: [1.6, 1.6, z], b: [8.4, 1.6, z], alpha: 0.35 });
        out.push({ kind: "line", a: [1.6, 1.6, z], b: [1.6, 8.4, z], alpha: 0.35 });
      } else {
        out.push({ kind: "line", a: [8.4, 1.6, z], b: [8.4, 8.4, z], alpha: 0.45 });
        out.push({ kind: "line", a: [1.6, 8.4, z], b: [8.4, 8.4, z], alpha: 0.45 });
        out.push({ kind: "line", a: [8.4, 1.6 + (k % 2) * 6.8, z - H], b: [8.4, 8.4 - (k % 2) * 6.8, z], alpha: 0.2 });
      }
    }
    return out;
  };
  const v1Z = bob(s, 0.12) + s.spread * 0.6;
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 12, 12), v: 0.09, grid: 12 },
    poles([1.6, 1.6]),
    ...rails("back"),
    ...layers.map((name, i): Part => ({ kind: "box", box: box(2.2, 2.2, zAt(i), 5.6, 5.6, H), vents: i % 2 === 0 })),
    { kind: "box", box: box(2.2, 2.2, top, 5.6, 5.6, H), ghost: true },
    poles([8.4, 1.6]),
    poles([1.6, 8.4]),
    poles([8.4, 8.4]),
    ...rails("front"),
    ...layers.map((name, i): Part => ({ kind: "label", at: [7.8, 2.2, zAt(i) + H / 2], text: name, dx: 1.4, dy: -0.3 })),
    { kind: "box", box: box(9.4, 9.4, v1Z, 1.1, 1.1, 0.8), accent: true, handles: true },
    { kind: "label", at: [10.5, 9.4, v1Z + 0.8], text: "v1 · day one", dx: 1.2, dy: -1.2, accent: true },
  ];
  return { parts, ext: [[0, 12, 0], [12, 0, 0], [12, 12, 0], [0, 0, 0], [2.2, 2.2, top + 2.2]], axes: ground() };
};

/**
 * We Called It Progress: every abstraction stacked on the last, machine code
 * up through the cloud, with english being lowered on top and the job that
 * sits on it left as an open question.
 */
const stack: SceneFn = (s) => {
  const layers = ["machine code", "assembly", "compilers", "frameworks", "cloud"];
  const H = 0.5;
  const gap = 0.45 + s.spread * 1;
  const zAt = (i: number) => i * (H + gap);
  const top = zAt(layers.length - 1) + H;
  const next = top + 1.6 + s.spread * 1.6 + bob(s);
  const corners: [number, number][] = [[3.4, 3.4], [8.6, 3.4], [3.4, 8.6], [8.6, 8.6]];
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 12, 12), v: 0.09, grid: 12 },
    ...layers.map((_, i): Part => ({ kind: "box", box: box(3.4, 3.4, zAt(i), 5.2, 5.2, H), vents: i === 0 })),
    ...layers.map((name, i): Part => ({ kind: "label", at: [8.6, 3.4, zAt(i) + H / 2], text: name, dx: 1.4, dy: -0.3 })),
    ...corners.map(([x, y]): Part => ({ kind: "line", a: [x, y, top], b: [x, y, next], dashed: true, alpha: 0.35 })),
    { kind: "box", box: box(3.4, 3.4, next, 5.2, 5.2, H), accent: true, handles: true },
    { kind: "label", at: [8.6, 3.4, next + H / 2], text: "english", dx: 1.4, dy: -0.3, accent: true },
    { kind: "box", box: box(5.3, 5.3, next + H, 1.4, 1.4, 1.1), ghost: true },
    { kind: "label", at: [6.7, 5.3, next + H + 1.1], text: "the job · ?", dx: 1.4, dy: -1.2 },
  ];
  return { parts, ext: [[0, 12, 0], [12, 0, 0], [12, 12, 0], [0, 0, 0], [3.4, 3.4, next + 3.2]], axes: ground() };
};

/**
 * Projects: what I've built as modules on a grid (Flagon the tower, the
 * community the round one), wired together along the gutters, with the
 * next one being lowered into the empty slot the wiring runs to.
 */
const modules: SceneFn = (s) => {
  const lift = 4.6 + s.spread * 2 + bob(s);
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 },
    { kind: "cable", pts: [[3, 2, 0], [3.5, 2, 0], [3.5, 5, 0], [4, 5, 0]], speed: 0.3 },
    { kind: "cable", pts: [[8, 3, 0], [8, 3.5, 0], [5, 3.5, 0], [5, 4, 0]], speed: 0.25 },
    { kind: "cable", pts: [[2, 7, 0], [2, 6.5, 0], [6.5, 6.5, 0], [6.5, 5, 0], [6, 5, 0]], speed: 0.2 },
    { kind: "plane", pts: quad(4, 4, 0, 2, 2), v: 0, dashed: true },
    { kind: "box", box: box(1, 1, 0, 2, 2, 1.1) },
    { kind: "box", box: box(4, 1, 0, 2, 2, 1.8), slots: true },
    { kind: "box", box: box(1, 4, 0, 2, 2, 2.2), vents: true },
    { kind: "box", box: box(7, 1, 0, 2, 2, 3.4), vents: true },
    { kind: "box", box: box(1, 7, 0, 2, 2, 1.3) },
    { kind: "box", box: box(7, 4, 0, 2, 2, 0.9) },
    { kind: "box", box: box(4, 7, 0, 2, 2, 0.6), small: true },
    { kind: "cyl", cx: 8, cy: 8, z: 0, r: 0.95, h: 1.2 },
    { kind: "label", at: [9, 1, 3.4], text: "flagon", dx: 1.4, dy: -1 },
    { kind: "label", at: [1, 6, 1.6], text: "serve", dx: -1.4, dy: 0.4 },
    { kind: "label", at: [9, 5, 0.9], text: "cookie", dx: 1.2, dy: 0.2 },
    { kind: "label", at: [8.7, 8.7, 0.6], text: "slc devs", dx: 1, dy: 1 },
    ...[[4, 4], [6, 4], [4, 6], [6, 6]].map(([x, y]): Part => ({ kind: "line", a: [x, y, 0], b: [x, y, lift], dashed: true, alpha: 0.35 })),
    { kind: "box", box: box(4, 4, lift, 2, 2, 2), accent: true, handles: true },
    { kind: "label", at: [6, 4, lift + 2], text: "next", dx: 1.4, dy: -1.2, accent: true },
  ];
  return { parts, ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [4, 4, lift + 2.4], [7, 1, 3.6]], axes: ground(10) };
};

/**
 * Docs: the playbook as a stack of bound volumes, with one lifted off the
 * top and floating open, turning its own pages.
 */
const shelf: SceneFn = (s) => {
  // [x, y, length, depth, thickness, name]: lying flat, spines facing right
  const vols: [number, number, number, number, number, string?][] = [
    [2.6, 2.4, 5, 3.6, 0.7, "industries"],
    [2.9, 2.6, 4.4, 3.2, 0.5],
    [2.7, 2.5, 4.8, 3.4, 0.6, "security"],
    [3.1, 2.8, 4.2, 3, 0.45],
    [2.8, 2.6, 4.6, 3.3, 0.55, "fundamentals"],
  ];
  const parts: Part[] = [{ kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 }];
  const labels: Part[] = [];
  let top = 0;
  vols.forEach(([x, y, a, b, h, name], i) => {
    parts.push({ kind: "box", box: box(x, y, top, a, b, h) });
    // page edges along the front, bands across the spine
    for (let k = 1; k < 4; k++) parts.push({ kind: "line", a: [x + 0.15, y + b, top + (h * k) / 4], b: [x + a - 0.1, y + b, top + (h * k) / 4], alpha: 0.3 });
    for (const yy of [y + 0.4, y + b - 0.4]) parts.push({ kind: "line", a: [x + a, yy, top], b: [x + a, yy, top + h], alpha: 0.6 });
    if (name) labels.push({ kind: "label", at: [x + a, y + b / 2, top + h / 2], text: name, dx: 1.6, dy: (2 - i) * 0.5 });
    top += h;
  });

  const z = top + 1.8 + s.spread * 2 + bob(s, 0.12);
  const [cx, L, w] = [5, 3.2, 2.6];
  const y0 = 2.5;
  const gap = y0 + L / 2;
  const open = 0.32 + s.spread * 0.15;
  // a page turns in the first third of every few seconds
  const k = Math.min(1, (s.t % 3.2) / 3.2 / 0.32);
  const turn = open + (Math.PI - 2 * open) * k * k * (3 - 2 * k);
  const page = (phi: number): Part[] => {
    const at = (d: number, yy: number): V3 => [cx + d * Math.cos(phi), yy, z + d * Math.sin(phi)];
    return [
      { kind: "plane", pts: [at(0, y0), at(w, y0), at(w, y0 + L), at(0, y0 + L)], v: 0.2 },
      ...[1.6, 1.2, 1.7, 0.9, 1.5, 1.65, 1.1].map((len, i): Part => ({
        kind: "line",
        a: at(0.3, y0 + 0.5 + i * 0.32),
        b: at(0.3 + len, y0 + 0.5 + i * 0.32),
        alpha: i === 2 ? 1 : 0.5,
        accent: i === 2,
      })),
    ];
  };
  const turning = page(turn);
  parts.push(
    ...[y0, y0 + L].map((yy): Part => ({ kind: "line", a: [cx, yy, top], b: [cx, yy, z - 0.25], dashed: true, alpha: 0.35 })),
    { kind: "box", box: box(cx - 0.12, y0, z - 0.25, 0.24, L, 0.25), accent: true },
    ...page(Math.PI - open),
    ...(turn > Math.PI / 2 ? [...turning, ...page(open)] : [...page(open), ...turning]),
    ...labels,
    { kind: "label", at: [cx + w * Math.cos(open), y0, z + w * Math.sin(open)], text: "playbook", dx: 1.4, dy: -1.2, accent: true },
  );
  return { parts, ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [cx, y0, z + w + 0.4], [cx, gap, z + w + 0.4]], axes: ground(10) };
};

/** Posts: a pen writing out a page line by line, lifted off the drafts. */
const writing: SceneFn = (s) => {
  const z = 2.4 + s.spread * 2;
  const lines = [9.6, 8.2, 10, 6.4, 9, 7.6, 4.2];
  // a line every few seconds; the page starts over once it's full
  const at = (s.t * 0.3) % lines.length;
  const done = Math.floor(at);
  const [px, py] = [1.5 + lines[done] * (at - done) * 0.55, 2.5 + done * 0.55];
  const tip = z + s.spread * 1.4 + bob(s, 0.04 + s.spread * 0.12);
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 },
    { kind: "plane", pts: quad(1.6, 1.4, 0.4, 7, 8), v: 0.12, rows: { lengths: [8, 6.4, 9.4, 5, 8.6, 7, 9, 3.6] } },
    {
      kind: "plane",
      pts: quad(1, 1, z, 7, 8),
      v: 0.2,
      handles: true,
      drops: { at: [[1, 1], [8, 1], [1, 9], [8, 9]], from: 0.4 },
      rows: { lengths: lines.slice(0, done) },
    },
    { kind: "line", a: [1.5, py, z], b: [px, py, z], alpha: 1, accent: true },
    { kind: "line", a: [px, py, z], b: [px, py, tip], dashed: true, alpha: 0.4 },
    // nib, then barrel
    { kind: "cyl", cx: px, cy: py, z: tip, r: 0.04, h: 0.8, rt: 0.25 },
    { kind: "box", box: box(px - 0.25, py - 0.25, tip + 0.8, 0.5, 0.5, 3.6), accent: true, handles: true },
  ];
  return { parts, ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [1, 1, z + 5.6], [7, 3, z + 5.6]], axes: ground(10) };
};

/**
 * Tools: an open toolbox. The tools take turns popping up to show their
 * name, and a top spins beside it, for the toys.
 */
const toolbox: SceneFn = (s) => {
  const [x0, y0, A, B, H] = [1.2, 2.6, 6, 3.8, 1.1];
  const tools: { name: string; at: [number, number]; size: V3; round?: boolean }[] = [
    { name: "jwt", at: [1.8, 3.1], size: [1.2, 1.2, 1.5] },
    { name: "uuid", at: [3.9, 3.6], size: [0.5, 0, 1.8], round: true },
    { name: "whoami", at: [5.4, 3.1], size: [1.2, 1.1, 1.2] },
    { name: "beautify", at: [1.8, 4.9], size: [1.8, 0.8, 1.3] },
    { name: "markdown", at: [4.2, 4.9], size: [1.1, 1, 1.6] },
    { name: "convert", at: [6.3, 5.4], size: [0.45, 0, 1.4], round: true },
  ];
  // offset so the resting frame (and the OG image) has a tool up
  const T = 2.6;
  const now = s.t + T * 0.5;
  const up = Math.floor(now / T) % tools.length;
  const ph = (now % T) / T;
  const lift = (ph < 0.25 ? ease(ph / 0.25) : ph > 0.8 ? ease((1 - ph) / 0.2) : 1) * (2.2 + s.spread * 1.2);
  const tool = (i: number, z: number): Part => {
    const { at: [x, y], size: [a, b, h], round } = tools[i];
    const accent = i === up;
    return round
      ? { kind: "cyl", cx: x, cy: y, z, r: a, h, accent }
      : { kind: "box", box: box(x, y, z, a, b, h), accent, small: !accent };
  };
  // clear of the walls, the raised tool draws over them
  const out = lift > H;
  const { at: [ax, ay], size: [aa, ab, ah], round: ar } = tools[up];
  const [mx, my] = ar ? [ax, ay] : [ax + aa / 2, ay + ab / 2];
  const lid = 1.8 + s.spread * 0.3;
  const hinge = (u: number, v: number): V3 => [x0 + u, y0 + v * Math.cos(lid), H + v * Math.sin(lid)];
  // the top wobbles on its tip; a mark on its crown shows the spin
  const [tx, ty] = [8.9 + Math.cos(s.t * 2.2) * 0.16, 4.6 + Math.sin(s.t * 2.2) * 0.16];
  const spin = s.t * 9;

  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 },
    { kind: "plane", pts: [hinge(0, 0), hinge(A, 0), hinge(A, B), hinge(0, B)], v: 0.3, handles: true },
    { kind: "plane", pts: [hinge(0.35, 0.35), hinge(A - 0.35, 0.35), hinge(A - 0.35, B - 0.35), hinge(0.35, B - 0.35)], v: 0.22 },
    { kind: "line", a: hinge(A / 2 - 0.8, B - 0.18), b: hinge(A / 2 + 0.8, B - 0.18), alpha: 0.9 },
    ...tray(x0, y0, A, B, H, tools.flatMap((_, i) => (out && i === up ? [] : [tool(i, i === up ? lift : 0)]))),
    { kind: "box", box: box(x0 + A / 2 - 0.4, y0 + B, H - 0.5, 0.8, 0.12, 0.35), small: true },
    { kind: "line", a: [mx, my, H], b: [mx, my, Math.max(H, lift)], dashed: true, alpha: 0.4 },
    ...(out ? [tool(up, lift)] : []),
    { kind: "cyl", cx: tx, cy: ty, z: 0, r: 0.04, h: 0.8, rt: 0.9 },
    { kind: "cyl", cx: tx, cy: ty, z: 0.8, r: 0.9, h: 0.28 },
    { kind: "line", a: [tx, ty, 1.08], b: [tx + Math.cos(spin) * 0.8, ty + Math.sin(spin) * 0.8, 1.08], alpha: 0.9, accent: true },
    { kind: "cyl", cx: tx, cy: ty, z: 1.08, r: 0.08, h: 0.6 },
  ];
  if (lift > 0.3) parts.push({ kind: "label", at: [ax + aa, ay, lift + ah], text: tools[up].name, dx: 1.4, dy: -1.2, accent: true });
  return {
    parts,
    ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], hinge(0, B + 0.4), hinge(A, B + 0.4), [4, 4, H + 5.4]],
    axes: ground(10),
  };
};

/**
 * About: the desk. Code types itself out on the screen, a key lighting
 * with each keystroke, next to a controller and a mug.
 */
const desk: SceneFn = (s) => {
  const [sx, sy, sw, sh] = [1.4, 3.2, 5.6, 3.4];
  const sz = 1.2 + s.spread * 1.2;
  const face = sy + 0.35;
  const indent = [0, 0.4, 0.8, 0.8, 0.4, 0.4, 0];
  const lines = [2.4, 2.8, 2.2, 3.2, 1.4, 2.6, 0.8];
  // a line a beat, then a pause before the screen clears
  const at = (s.t * 0.7) % (lines.length + 2);
  const done = Math.min(lines.length, Math.floor(at));
  const typing = done < lines.length;
  const row = (i: number) => sz + sh - 0.55 - i * 0.36;
  const x0 = sx + 0.5;
  const cur: V3 = typing
    ? [x0 + indent[done] + lines[done] * (at - done), face + 0.01, row(done) - 0.08]
    : [x0, face + 0.01, row(done) - 0.08];
  const capZ = 0.2 + s.spread * 0.6;
  const key = Math.floor(s.t * 9) % 40;
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 },
    { kind: "box", box: box(3.3, 2.4, 0, 1.8, 1.3, 0.12) },
    { kind: "box", box: box(4, 2.85, 0.12, 0.4, 0.35, 1.08) },
    { kind: "line", a: [4.2, 3.03, 1.2], b: [4.2, 3.03, sz], dashed: true, alpha: 0.4 },
    { kind: "box", box: box(sx, sy, sz, sw, 0.35, sh) },
    { kind: "plane", pts: [[sx + 0.2, face, sz + 0.2], [sx + sw - 0.2, face, sz + 0.2], [sx + sw - 0.2, face, sz + sh - 0.2], [sx + 0.2, face, sz + sh - 0.2]], v: 0.03 },
    ...lines.slice(0, done).map((len, i): Part => ({ kind: "line", a: [x0 + indent[i], face, row(i)], b: [x0 + indent[i] + len, face, row(i)], alpha: 0.7 })),
    ...(typing ? [{ kind: "line", a: [x0 + indent[done], face, row(done)], b: [cur[0], face, row(done)], alpha: 1, accent: true } as Part] : []),
    ...(typing || Math.floor(s.t * 2.5) % 2 ? [{ kind: "line", a: cur, b: [cur[0] + 0.25, cur[1], cur[2]], alpha: 1, accent: true } as Part] : []),
    // keyboard, its keycaps lifting off on hover
    { kind: "box", box: box(1.8, 4.6, 0, 4.4, 1.5, 0.15) },
    { kind: "plane", pts: quad(1.95, 4.75, capZ, 4.1, 1.2), v: 0.2, drops: { at: [[1.95, 4.75], [6.05, 5.95]], from: 0.15 } },
    ...[1, 2, 3].map((k): Part => ({ kind: "line", a: [1.95, 4.75 + k * 0.3, capZ], b: [6.05, 4.75 + k * 0.3, capZ], alpha: 0.35 })),
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((j): Part => ({ kind: "line", a: [1.95 + j * 0.41, 4.75, capZ], b: [1.95 + j * 0.41, 5.95, capZ], alpha: 0.35 })),
    ...(typing ? [{ kind: "box", box: box(1.95 + (key % 10) * 0.41, 4.75 + Math.floor(key / 10) * 0.3, capZ, 0.41, 0.3, 0.06), accent: true } as Part] : []),
    // controller
    { kind: "box", box: box(6.9, 6.9, 0, 1.7, 1, 0.25), small: true },
    { kind: "cyl", cx: 7.3, cy: 7.4, z: 0.25, r: 0.17, h: 0.12 },
    { kind: "cyl", cx: 8.2, cy: 7.4, z: 0.25, r: 0.17, h: 0.12 },
    // mug, steaming
    ...[0, 1].map((k): Part => ({ kind: "line", a: [7.7 + k * 0.25, 5.2, 1.1], b: [7.7 + k * 0.25 + Math.sin(s.t * 1.6 + k * 2) * 0.2, 5.2, 1.9 + k * 0.2], dashed: true, alpha: 0.4 })),
    { kind: "cyl", cx: 7.8, cy: 5.3, z: 0, r: 0.45, h: 0.95 },
  ];
  return { parts, ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [sx, sy, sz + sh + 0.4], [sx + sw, sy, sz + sh + 0.4]], axes: ground(10) };
};

/**
 * Contact: a plug (you) seats itself in a socket (me), with messages
 * flowing down its cable; the socket's light is on while they're connected.
 */
const plug: SceneFn = (s) => {
  const ph = (s.t % 4.2) / 4.2;
  const down = ph < 0.3 ? ease(ph / 0.3) : ph < 0.7 ? 1 : 1 - ease((ph - 0.7) / 0.3);
  const on = down > 0.98;
  const plate = 0.5;
  const up = 2.4 + s.spread * 1.6 + bob(s);
  const tip = plate - 0.55 + (up - plate + 0.55) * (1 - down);
  const body = tip + 1.1;
  const prongs = [4.4, 5.4];
  const top = body + 1.7;
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 },
    { kind: "box", box: box(2.6, 2.6, 0, 4.8, 4.8, plate) },
    { kind: "plane", pts: quad(3.1, 3.1, plate, 3.8, 3.8), v: 0.2 },
    ...prongs.map((x): Part => ({ kind: "plane", pts: quad(x - 0.05, 4.3, plate, 0.4, 1), v: 0 })),
    { kind: "box", box: box(6.3, 3.3, plate, 0.4, 0.4, 0.12), accent: on, small: !on },
    ...(on ? [] : prongs.map((x): Part => ({ kind: "line", a: [x + 0.15, 4.8, plate], b: [x + 0.15, 4.8, tip], dashed: true, alpha: 0.4 }))),
    ...prongs.map((x): Part => ({ kind: "box", box: box(x, 4.35, Math.max(tip, plate), 0.3, 0.9, body - Math.max(tip, plate)) })),
    { kind: "box", box: box(4, 4, body, 2.1, 1.6, 1), accent: true, handles: true },
    { kind: "cyl", cx: 5.05, cy: 4.8, z: body + 1, r: 0.6, h: 0.7, rt: 0.22, accent: true },
    { kind: "cable", pts: [[5.05, -1.5, top + 1], [5.05, 4.8, top + 1], [5.05, 4.8, top]], speed: 0.45, accent: true },
    { kind: "label", at: [6.1, 4, body + 1], text: "you", dx: 1.4, dy: -1, accent: true },
    { kind: "label", at: [7.4, 7.4, plate], text: on ? "me · connected" : "me", dx: 1, dy: 1, accent: on },
  ];
  return { parts, ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [5.05, 2, up + 3.8], [4, 4, up + 2.2]], axes: ground(10) };
};

/**
 * Resume: the career as a skyline along a timeline, a block per role,
 * rising with scope. A playhead walks it, lighting each role in turn, and
 * ends on the open slot for what's next.
 */
const career: SceneFn = (s) => {
  const yr = (y: number) => (y - 2011) * 0.75;
  const roles: [string, number, number, number][] = [
    ["softwaremedia", 2011.25, 2012.8, 0.7],
    ["betterservers", 2012.85, 2013.45, 0.6],
    ["bluehost", 2013.85, 2014.35, 0.8],
    ["riot games", 2014.35, 2016.5, 1.4],
    ["imgur", 2016.8, 2018.35, 1.7],
    ["even", 2018.5, 2018.95, 1.4],
    ["outdoorsy", 2019.1, 2019.8, 1.6],
    ["trugolf", 2020, 2021.25, 1.9],
    ["entrata", 2021.35, 2023.7, 2.4],
    ["aptive", 2023.7, 2026.7, 3.1],
  ];
  const next = [2026.9, 2027.7, 3.4];
  const [y0, depth] = [3, 2];
  const end = yr(next[1]) + 0.6;
  // starts mid-career, so the resting frame (and the OG image) has a role lit
  const px = ((s.t * 0.08 + 0.55) % 1) * end;
  const lit = roles.findIndex(([, a, b]) => px >= yr(a) && px <= yr(b));
  const parts: Part[] = [
    { kind: "plane", pts: quad(-0.4, 1.8, 0, end + 0.8, 4.4), v: 0.09 },
    ...Array.from({ length: 17 }, (_, k): Part => ({ kind: "line", a: [yr(2011 + k), 6, 0], b: [yr(2011 + k), 6.2, 0], alpha: k % 5 === 4 ? 0.8 : 0.35 })),
    { kind: "line", a: [px, 1.8, 0], b: [px, 6.2, 0], alpha: 1, accent: true },
  ];
  roles.forEach(([name, a, b, h], i) => {
    const z = i === lit ? s.spread * 1 : 0;
    if (z) parts.push({ kind: "line", a: [yr(a), y0 + depth, 0], b: [yr(a), y0 + depth, z], dashed: true, alpha: 0.4 });
    parts.push({ kind: "box", box: box(yr(a), y0, z, Math.max(0.2, yr(b) - yr(a) - 0.06), depth, h), accent: i === lit, vents: h > 2 && i !== lit });
    if (i === lit) parts.push({ kind: "label", at: [yr(b), y0, z + h], text: name, dx: 1.2, dy: -1.2, accent: true });
  });
  parts.push({ kind: "box", box: box(yr(next[0]), y0, 0, yr(next[1]) - yr(next[0]), depth, next[2]), ghost: true });
  if (px > yr(next[0])) parts.push({ kind: "label", at: [yr(next[1]), y0, next[2]], text: "next · ?", dx: 1.2, dy: -1.2, accent: true });
  return { parts, ext: [[-0.4, 1.8, 0], [end + 0.4, 1.8, 0], [-0.4, 6.2, 0], [end + 0.4, 6.2, 0], [yr(next[0]), y0, next[2] + 2.4], [0, y0, 2.4]], axes: [] };
};

/**
 * Topics: posts ride a belt and drop into the bin for their topic, the
 * belt's slats sliding underneath.
 */
const sorter: SceneFn = (s) => {
  const bins: [string, number, number][] = [["llms", 1.2, 3], ["ai in dev", 4.2, 2], ["engineering", 7.2, 2]];
  const belt = 2;
  const deck = belt + 0.25;
  const T = 3.4;
  const n = Math.floor(s.t / T) % bins.length;
  const ph = (s.t % T) / T;
  const [, bx, held] = bins[n];
  const tx = bx + 0.75;
  const rest = 0.04 + held * 0.08;
  const x = ph < 0.55 ? 0.5 + (tx - 0.5) * (ph / 0.55) : tx;
  const y = ph < 0.55 ? 4.1 : 4.1 + 2.75 * ease(Math.min(1, (ph - 0.55) / 0.15));
  const z = ph < 0.7 ? deck : deck + (rest - deck) * ease(Math.min(1, (ph - 0.7) / 0.15));
  const sheet: Part = { kind: "box", box: box(x, y, z, 0.9, 0.7, 0.06), accent: true };
  const inBin = ph >= 0.7;
  const slide = (s.t * 0.9) % 0.6;
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 },
    ...[0.8, 5, 9.2].map((lx): Part => ({ kind: "box", box: box(lx, 4.2, 0, 0.3, 0.3, belt) })),
    { kind: "box", box: box(0.3, 3.9, belt, 9.6, 1.1, 0.25) },
    ...Array.from({ length: 16 }, (_, k): Part => ({ kind: "line", a: [0.3 + slide + k * 0.6, 3.9, deck], b: [0.3 + slide + k * 0.6, 5, deck], alpha: 0.3 })),
    ...(ph < 0.55 ? [sheet] : []),
  ];
  bins.forEach(([name, b, count], i) => {
    const stack = Array.from({ length: count }, (_, k): Part => ({ kind: "box", box: box(b + 0.7 + (k % 2) * 0.1, 6.8 - (k % 2) * 0.08, 0.04 + k * 0.08, 0.9, 0.7, 0.06), small: true }));
    parts.push(...tray(b, 6.2, 2.4, 2, 1.1, i === n && inBin ? [...stack, sheet] : stack));
    parts.push({ kind: "label", at: [b + 1.2, 8.2, 0.55], text: name, dx: -0.9, dy: 1.2, accent: i === n });
  });
  if (ph >= 0.55 && !inBin) parts.push(sheet);
  return { parts, ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [0.3, 3.9, deck + 1], [9.9, 3.9, deck + 1]], axes: ground(10) };
};

/**
 * UI: an interface exploded into its layers. The layout at the bottom, the
 * components on it, and the pattern on top: a button that a cursor comes
 * down to press, every few seconds.
 */
const layers: SceneFn = (s) => {
  const z1 = 2.4 + s.spread * 1.2;
  const z2 = 5 + s.spread * 2.4;
  // offset so the resting frame (and the OG image) has the cursor close
  const T = 3.2;
  const ph = ((s.t + T * 0.3) % T) / T;
  const ease = (k: number) => k * k * (3 - 2 * k);
  const down = ph < 0.4 ? ease(ph / 0.4) : ph < 0.55 ? 1 : ph < 0.9 ? 1 - ease((ph - 0.55) / 0.35) : 0;
  const pressed = ph >= 0.4 && ph < 0.55;
  const [bx, by, ba, bb, bh] = [5.2, 6.4, 3, 1.2, 0.4];
  const bz = z2 - (pressed ? 0.2 : 0);
  const [cx, cy] = [bx + ba * 0.62, by + bb * 0.5];
  const tip = bz + bh + (1 - down) * 2.4;
  const corners = (x: number, y: number, a: number, b: number): [number, number][] => [[x, y], [x + a, y], [x, y + b], [x + a, y + b]];

  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 },
    // layout: the window, its title bar and controls
    { kind: "plane", pts: quad(0.8, 0.8, 0.3, 8.4, 8.4), v: 0.12 },
    { kind: "line", a: [0.8, 1.8, 0.3], b: [9.2, 1.8, 0.3], alpha: 0.6 },
    ...[0, 1, 2].map((i): Part => ({ kind: "cyl", cx: 1.4 + i * 0.5, cy: 1.3, z: 0.3, r: 0.14, h: 0.06 })),
    // components, lifted off the layout
    ...corners(1.2, 2.4, 7.6, 6.2).map(([x, y]): Part => ({ kind: "line", a: [x, y, 0.3], b: [x, y, z1], dashed: true, alpha: 0.3 })),
    { kind: "plane", pts: quad(1.2, 2.4, z1, 2.2, 6.2), v: 0.16, rows: { lengths: [1.5, 1.1, 1.6, 1.3, 0.9, 1.4] } },
    { kind: "plane", pts: quad(4, 2.4, z1, 4.8, 3.2), v: 0.2, handles: true, rows: { lengths: [3.6, 2.6, 4, 1.8], accentRow: 0 } },
    { kind: "plane", pts: quad(4, 6.4, z1, 1.2, 1.2), v: 0.16 },
    // the slot the button composes into
    { kind: "plane", pts: quad(bx, by, z1, ba, bb), v: 0, dashed: true },
    // the pattern on top
    ...corners(bx, by, ba, bb).map(([x, y]): Part => ({ kind: "line", a: [x, y, z1], b: [x, y, bz], dashed: true, alpha: 0.35 })),
    { kind: "box", box: box(bx, by, bz, ba, bb, bh), accent: true, handles: pressed },
    // the cursor: a tip, then its tail
    { kind: "line", a: [cx, cy, tip], b: [cx, cy, tip + 2], dashed: true, alpha: 0.4 },
    { kind: "cyl", cx, cy, z: tip, r: 0.04, h: 0.9, rt: 0.32 },
    { kind: "label", at: [0.8, 9.2, 0.3], text: "layout", dx: -1.4, dy: 0.6 },
    { kind: "label", at: [8.8, 2.4, z1], text: "components", dx: 1.4, dy: -0.4 },
    { kind: "label", at: [bx + ba, by + bb, bz + bh], text: pressed ? "pressed" : "pattern", dx: 1.4, dy: -1.2, accent: true },
  ];
  return {
    parts,
    ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [cx, cy, z2 + 5], [bx, by, z2 + 3]],
    axes: ground(10),
  };
};

/**
 * 404: the tile that should be here isn't. A search bot circles the hole
 * with a flashlight, looking in it; the tile it's looking for drifts
 * overhead, just out of view.
 */
const missing: SceneFn = (s) => {
  const z = 6 + s.spread * 2 + bob(s);
  const parts: Part[] = [];
  const tiles: [number, number][] = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (!(i === 1 && j === 1)) tiles.push([i * 3, j * 3]);
  tiles.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  parts.push({ kind: "plane", pts: quad(3, 3, 0, 2.6, 2.6), v: 0, dashed: true });
  tiles.forEach(([x, y]) => parts.push({ kind: "box", box: box(x, y, 0, 2.6, 2.6, 0.5) }));

  // the bot walks the ring of tiles around the hole, hopping as it goes
  const a = s.t * 0.45 + 0.6;
  const [px, py] = [4.3 + Math.cos(a) * 2.75, 4.3 + Math.sin(a) * 2.75];
  const foot = 0.5 + Math.abs(Math.sin(s.t * 4)) * 0.12;
  // the beam sweeps the floor of the hole
  const [hx, hy] = [4.3 + Math.cos(s.t * 1.7) * 0.8, 4.3 + Math.sin(s.t * 1.3) * 0.8];
  const head = foot + 1.1;
  const blink = Math.floor(s.t * 2) % 2 === 0;
  parts.push(
    // where the light lands
    { kind: "plane", pts: quad(hx - 0.45, hy - 0.45, 0, 0.9, 0.9), v: 0.55 },
    { kind: "box", box: box(px - 0.5, py - 0.5, foot, 1, 1, 0.8), small: true },
    { kind: "box", box: box(px - 0.4, py - 0.4, foot + 0.8, 0.8, 0.8, 0.6), handles: true },
    { kind: "line", a: [px, py, head + 0.65], b: [px, py, head + 1.3], alpha: 0.8 },
    { kind: "cyl", cx: px, cy: py, z: head + 1.3, r: 0.14, h: 0.18, accent: blink },
    { kind: "line", a: [px, py, head], b: [hx, hy, 0], alpha: 0.9, accent: true },
    { kind: "line", a: [px, py, head], b: [hx + 0.5, hy - 0.3, 0], dashed: true, alpha: 0.35 },
    { kind: "line", a: [px, py, head], b: [hx - 0.3, hy + 0.5, 0], dashed: true, alpha: 0.35 },
  );

  // the tile drifts in a slow circle above, never over the hole for long
  const [tx, ty] = [3.6 + Math.cos(s.t * 0.6) * 0.6, 3.6 + Math.sin(s.t * 0.6) * 0.6];
  parts.push({ kind: "line", a: [tx + 0.7, ty + 0.7, 0], b: [tx + 0.7, ty + 0.7, z], dashed: true, alpha: 0.25 });
  parts.push({ kind: "box", box: box(tx, ty, z, 1.4, 1.4, 0.5), accent: true, handles: true });
  parts.push({ kind: "label", at: [tx + 1.4, ty, z + 0.5], text: "your page", dx: 1.4, dy: -1, accent: true });
  return { parts, ext: [[0, 9, 0], [9, 0, 0], [9, 9, 0], [0, 0, 0], [3, 3, z + 1.5], [8.6, 4.3, 3]], axes: ground(9) };
};

/*
 * Book covers: one small scene per book, drawn at card size, so a few
 * strong forms and no labels.
 */

/**
 * Payments: a card taps the terminal and the authorization runs out
 * through the processor and the card network to the issuer and back. The
 * approval ticks the terminal's screen and posts a row to the ledger above.
 * On hover the network's layers part and the ledger lifts.
 */
const tender: SceneFn = (s) => {
  const T = 4;
  const ph = (s.t % T) / T;
  const n = Math.floor(s.t / T);
  // the card comes down, taps, waits for the answer, then lifts
  const [tx, ty, tz] = [6.4, 6.2, 0.9];
  const down = ph < 0.18 ? ease(ph / 0.18) : ph < 0.82 ? 1 : 1 - ease((ph - 0.82) / 0.18);
  const cz = tz + 0.12 + (1 - down) * (1.4 + s.spread * 1.2);
  const approved = ph >= 0.78;
  // terminal, processor, network, issuer, along the ground
  const route: V3[] = [[7.4, ty, 0], [7.4, 2.6, 0], [7.4, 2.2, 0], [4.5, 2.2, 0], [3.4, 3.5, 0], [3.4, 6.5, 0], [2.9, 6.5, 0]];
  const lens = route.slice(1).map((p, i) => Math.hypot(p[0] - route[i][0], p[1] - route[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  const along = (k: number): [number, number] => {
    let d = k * total;
    let i = 0;
    while (i < lens.length - 1 && d > lens[i]) d -= lens[i++];
    const f = lens[i] ? d / lens[i] : 0;
    return [route[i][0] + (route[i + 1][0] - route[i][0]) * f, route[i][1] + (route[i + 1][1] - route[i][1]) * f];
  };
  // out to the issuer, then back with the answer
  const trip = ph < 0.2 || ph > 0.76 ? -1 : ph < 0.48 ? (ph - 0.2) / 0.28 : 1 - (ph - 0.48) / 0.28;
  const [qx, qy] = along(Math.max(0, trip));
  const layer = (k: number) => k * (0.42 + s.spread * 0.5);
  const lz = 1.7 + s.spread * 1.6 + bob(s, 0.1);
  const row = (((approved ? n : n - 1) % 4) + 4) % 4;
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 },
    ...route.slice(1).map((p, i): Part => ({ kind: "line", a: route[i], b: p, alpha: 0.6 })),
    // the processor, then the network's three layers
    { kind: "box", box: box(6.6, 0.8, 0, 1.6, 1.6, 1.7), vents: true },
    ...[0, 1, 2].map((k): Part => ({ kind: "cyl", cx: 3.4, cy: 2.3, z: layer(k), r: 1.05, h: 0.32 })),
    ...(trip >= 0 ? [{ kind: "box", box: box(qx - 0.22, qy - 0.22, 0, 0.44, 0.44, 0.3), accent: true } as Part] : []),
    // the issuer
    { kind: "box", box: box(1, 5.6, 0, 1.9, 1.9, 2.1), slots: true },
    // the ledger, floating over the middle
    {
      kind: "plane",
      pts: quad(3.9, 3.6, lz, 3.2, 3.2),
      v: 0.2,
      handles: true,
      drops: { at: [[3.9, 6.8], [7.1, 6.8], [7.1, 3.6]], from: 0 },
      rows: { lengths: [4.2, 3, 3.7, 2.2], accentRow: row },
    },
    // the terminal: its screen, with a tick once approved, then the keypad
    { kind: "box", box: box(tx, ty, 0, 2, 2.6, tz) },
    { kind: "plane", pts: quad(tx + 0.25, ty + 0.25, tz, 1.5, 1), v: 0.03 },
    ...(approved
      ? [
          { kind: "line", a: [tx + 0.55, ty + 0.7, tz], b: [tx + 0.85, ty + 1, tz], alpha: 1, accent: true } as Part,
          { kind: "line", a: [tx + 0.85, ty + 1, tz], b: [tx + 1.45, ty + 0.45, tz], alpha: 1, accent: true } as Part,
        ]
      : []),
    { kind: "plane", pts: quad(tx + 0.25, ty + 1.45, tz, 1.5, 0.95), v: 0.2 },
    ...[1, 2].map((k): Part => ({ kind: "line", a: [tx + 0.25 + k * 0.5, ty + 1.45, tz], b: [tx + 0.25 + k * 0.5, ty + 2.4, tz], alpha: 0.4 })),
    { kind: "line", a: [tx + 1, ty + 0.75, tz], b: [tx + 1, ty + 0.75, cz], dashed: true, alpha: 0.4 },
    { kind: "box", box: box(tx + 0.1, ty + 0.15, cz, 1.8, 1.2, 0.08), accent: true, handles: true },
  ];
  return { parts, ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [3.9, 3.6, lz + 0.6], [tx, ty, tz + 3]], axes: ground(10) };
};

/**
 * Field Operations: a truck runs its route around a block of houses, the
 * next stop marked by a pin. On hover the roofs and the cargo lift off.
 */
const route: SceneFn = (s) => {
  const [lo, hi, R] = [1.5, 8.5, 1.2];
  // the loop is a rounded square: per side, a straight run then a quarter turn
  const run = hi - lo - 2 * R;
  const piece = run + (Math.PI / 2) * R;
  const heading: [number, number][] = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const corner: [number, number][] = [[hi, lo], [hi, hi], [lo, hi], [lo, lo]];
  const along = (d: number): [number, number, number, number] => {
    const k = Math.floor(d / piece) % 4;
    const w = d % piece;
    const [ax, ay] = heading[k];
    const [bx, by] = heading[(k + 1) % 4];
    const [cx, cy] = corner[k];
    if (w < run) return [cx - ax * (R + run - w), cy - ay * (R + run - w), ax, ay];
    const f = (w - run) / R;
    const [c, n] = [Math.cos(f), Math.sin(f)];
    return [cx - ax * R + bx * R + (ax * n - bx * c) * R, cy - ay * R + by * R + (ay * n - by * c) * R, ax * c + bx * n, ay * c + by * n];
  };
  const loop = piece * 4;
  const d = (s.t * 1.1 + 10) % loop;
  const seg = Math.floor(d / piece);
  const [px, py, hx, hy] = along(d);
  // a world point at u along the heading, v across it
  const at = (u: number, v: number, z: number): V3 => [px + hx * u - hy * v, py + hy * u + hx * v, z];
  // a box turned to the heading: the two sides facing the viewer become its left and right faces
  const slab = (u0: number, u1: number, w: number, z: number, h: number): Box => {
    const foot = [at(u0, -w, z), at(u1, -w, z), at(u1, w, z), at(u0, w, z)];
    const up = (p: V3): V3 => [p[0], p[1], z + h];
    const sides = [0, 1, 2, 3]
      .map((i) => {
        const [p, q] = [foot[i], foot[(i + 1) % 4]];
        const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
        const [nx, ny] = [(q[1] - p[1]) / len, (p[0] - q[0]) / len];
        return { face: [p, q, up(q), up(p)], toward: nx + ny, lean: ny - nx };
      })
      .sort((m, n) => n.toward - m.toward)
      .slice(0, 2)
      .sort((m, n) => n.lean - m.lean);
    const xs = foot.map((p) => p[0]);
    const ys = foot.map((p) => p[1]);
    const [x, y] = [Math.min(...xs), Math.min(...ys)];
    return { x, y, z, a: Math.max(...xs) - x, b: Math.max(...ys) - y, h, left: sides[0].face, right: sides[1].face, top: foot.map(up) };
  };
  // a pane on the face at u (front or back) or v (a side), drawn only when that face is in view
  const pane = (pts: V3[], nx: number, ny: number): Part[] => (nx + ny > 0.05 ? [{ kind: "plane", pts, v: 0.03 }] : []);
  const [W, base] = [0.42, 0.34];
  const cargo = base + s.spread * 0.8;
  const front = 1.2;
  const glass = (u: number): V3[] => [at(u, -0.3, 0.64), at(u, 0.3, 0.64), at(u, 0.3, 0.88), at(u, -0.3, 0.88)];
  const sideGlass = (v: number): V3[] => [at(0.5, v, 0.64), at(0.8, v, 0.64), at(0.8, v, 0.88), at(0.5, v, 0.88)];
  const depth = (u: number) => u * (hx + hy);
  const pieces: [number, Part[]][] = [
    [depth(-0.4), [
      ...(s.spread > 0.05 ? [{ kind: "line", a: at(-0.4, 0, base), b: at(-0.4, 0, cargo), dashed: true, alpha: 0.4 } as Part] : []),
      { kind: "box", box: slab(-1.15, 0.36, W, cargo, 0.78), accent: true, soft: true },
    ]],
    [depth(0.62), [
      { kind: "box", box: slab(0.42, 0.85, W, base, 0.6) },
      ...pane(glass(0.851), hx, hy),
      ...[W + 0.001, -W - 0.001].flatMap((v) => pane(sideGlass(v), -hy * Math.sign(v), hx * Math.sign(v))),
    ]],
    [depth(1.02), [{ kind: "box", box: slab(0.85, front, W, base, 0.3) }]],
  ];
  const truck: Part[] = [
    ...[-0.75, 0.82]
      .sort((m, n) => depth(m) - depth(n))
      .map((u): Part => ({ kind: "box", box: slab(u - 0.22, u + 0.22, W, 0, 0.26), small: true })),
    { kind: "box", box: slab(-1.15, front, W - 0.04, 0.24, 0.1), small: true },
    ...pieces.sort((m, n) => m[0] - n[0]).flatMap(([, p]) => p),
  ];
  const houses: [number, number][] = [[2.6, 2.6], [5.6, 2.6], [5.6, 5.6], [2.6, 5.6]];
  const stop = (seg + 1) % 4;
  const [a, b, h, r] = [1.8, 1.8, 0.9, 0.7];
  const zr = h + s.spread * 0.9;
  const house = ([x, y]: [number, number]): Part[] => [
    { kind: "box", box: box(x, y, 0, a, b, h) },
    ...(s.spread > 0.05 ? [{ kind: "line", a: [x + a, y + b, h], b: [x + a, y + b, zr], dashed: true, alpha: 0.35 } as Part] : []),
    { kind: "plane", pts: [[x, y, zr], [x + a, y, zr], [x + a, y + b / 2, zr + r], [x, y + b / 2, zr + r]], v: 0.3 },
    { kind: "plane", pts: [[x, y + b / 2, zr + r], [x + a, y + b / 2, zr + r], [x + a, y + b, zr], [x, y + b, zr]], v: 0.45 },
    { kind: "plane", pts: [[x + a, y, zr], [x + a, y + b, zr], [x + a, y + b / 2, zr + r]], v: 0.2 },
  ];
  const [sx, sy] = houses[stop];
  const pin = zr + r + 0.5 + bob(s, 0.15);
  const behind = seg === 0 || seg === 3;
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 },
    { kind: "line", a: [5.05, lo, 0], b: [5.05, hi, 0], alpha: 0.3 },
    { kind: "line", a: [lo, 5.05, 0], b: [hi, 5.05, 0], alpha: 0.3 },
    { kind: "cable", pts: Array.from({ length: 65 }, (_, i): V3 => {
      const [x, y] = along((i / 64) * loop);
      return [x, y, 0];
    }), speed: 0.05, accent: true },
    ...(behind ? truck : []),
    ...[...houses].sort((p, q) => p[0] + p[1] - (q[0] + q[1])).flatMap(house),
    { kind: "line", a: [sx + a / 2, sy + b / 2, zr + r], b: [sx + a / 2, sy + b / 2, pin], dashed: true, alpha: 0.5 },
    { kind: "cyl", cx: sx + a / 2, cy: sy + b / 2, z: pin, r: 0.03, h: 0.45, rt: 0.12, accent: true, soft: true },
    { kind: "cyl", cx: sx + a / 2, cy: sy + b / 2, z: pin + 0.45, r: 0.34, h: 0.3, accent: true, soft: true },
    ...(behind ? [] : truck),
  ];
  return { parts, ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [5, 5, h + r + 2.2 + s.spread * 0.9]], axes: ground(10) };
};

/**
 * Gaming: two soldiers trade fire across a low wall among trees, rocks and
 * crates, watched by a pixel drone, the game servers that run the match
 * wired in from the back edge. On hover the drone climbs.
 */
// an original sprite: a round drone with an antenna, its eye glancing side to
// side and its thrusters flickering
const DRONE = [
  [".....X.....", "....XXX....", "..XXXXXXX..", ".XX.....XX.", ".X..XXX..X.", ".XX.....XX.", "..XXXXXXX..", "...X...X..."],
  [".....X.....", "....XXX....", "..XXXXXXX..", ".XX.....XX.", ".X...XXX.X.", ".XX.....XX.", "..XXXXXXX..", "..X.....X.."],
];
const arcade: SceneFn = (s) => {
  const T = 1.2;
  const n = Math.floor(s.t / T);
  const p = (s.t - n * T) / T;
  // a soldier at x facing dir (+1 or -1): legs, torso, head and a rifle at the shoulder
  const gz = 1.05;
  const soldier = (x: number, y: number, dir: number, firing: boolean, opts: { accent?: boolean } = {}): Part[] => {
    const kick = firing && p < 0.15 ? -0.08 * dir : 0;
    const rifle: Part = { kind: "box", box: box(dir > 0 ? x + 0.1 + kick : x - 1.3 + kick, y + 0.2, gz, 1.2, 0.14, 0.14), small: true };
    return [
      ...(dir < 0 ? [rifle] : []),
      { kind: "box", box: box(x - 0.25, y + 0.05, 0, 0.2, 0.2, 0.6), small: true },
      { kind: "box", box: box(x - 0.25, y + 0.35, 0, 0.2, 0.2, 0.6), small: true },
      { kind: "box", box: box(x - 0.3, y, 0.6, 0.6, 0.6, 0.7), ...opts },
      { kind: "box", box: box(x - 0.18, y + 0.12, 1.3, 0.36, 0.36, 0.36), ...opts },
      ...(dir > 0 ? [rifle] : []),
    ];
  };
  const [ax, bx] = [2.6, 7.4];
  const ay = 6.2 + Math.sin(s.t * 0.8) * 0.5;
  const by = 5.4 + Math.sin(s.t * 0.8 + 2) * 0.5;
  const aFires = n % 2 === 0;
  // the tracer: from the shooter's muzzle to the other's chest
  const [m, t] = aFires ? [[ax + 1.3, ay + 0.27], [bx - 0.3, by + 0.3]] : [[bx - 1.3, by + 0.27], [ax + 0.3, ay + 0.3]];
  const at = (k: number): V3 => [m[0] + (t[0] - m[0]) * k, m[1] + (t[1] - m[1]) * k, gz + 0.07];
  // the drone: one bar per run of pixels in a row, bottom row first
  const [px, ix, iy] = [0.36, 2.4, 3.4];
  const iz = 2.4 + s.spread * 1.4 + bob(s, 0.2);
  const pixels = DRONE[Math.floor(s.t / 0.6) % 2].toReversed().flatMap((row, r) =>
    [...row.matchAll(/X+/g)].map((run): Part => ({ kind: "box", box: box(ix + run.index * px, iy, iz + r * px, run[0].length * px, 0.08, px), accent: true })),
  );
  // scenery: a trunk under two stacked cones, low rocks, crates and a barrel
  const tree = (x: number, y: number, h: number): [number, Part[]] => [x + y, [
    { kind: "cyl", cx: x, cy: y, z: 0, r: 0.12, h: 0.5 },
    { kind: "cyl", cx: x, cy: y, z: 0.5, r: 0.6, h: h * 0.6, rt: 0.15 },
    { kind: "cyl", cx: x, cy: y, z: 0.5 + h * 0.45, r: 0.45, h: h * 0.55, rt: 0.02 },
  ]];
  const rock = (x: number, y: number, a: number, b: number, h: number): [number, Part[]] => [x + y + (a + b) / 2, [{ kind: "box", box: box(x, y, 0, a, b, h), small: true }]];
  const things: [number, Part[]][] = [
    tree(1.5, 5.2, 2), tree(9, 3.4, 2.1), tree(8.7, 5.5, 1.5), tree(8.4, 7.9, 1.8), tree(1.6, 8.3, 1.5),
    rock(5.6, 1.6, 0.8, 0.6, 0.3), rock(1.3, 3, 0.6, 0.9, 0.35), rock(6.2, 8.2, 0.9, 0.5, 0.25),
    [8.9, [{ kind: "box", box: box(5.8, 2.5, 0, 0.6, 0.6, 0.6) }, { kind: "box", box: box(6.4, 2.6, 0, 0.55, 0.55, 0.55) }, { kind: "box", box: box(5.95, 2.6, 0.6, 0.5, 0.5, 0.5) }]],
    [11.6, [{ kind: "cyl", cx: 3.7, cy: 7.9, z: 0, r: 0.3, h: 0.7 }]],
    [ix + iy + 2, [{ kind: "line", a: [ix + 2, iy, 0], b: [ix + 2, iy, iz], dashed: true, alpha: 0.35 }, ...pixels]],
    [bx + by, soldier(bx, by, -1, !aFires)],
    [4.65 + 5.9, [{ kind: "box", box: box(4.4, 4.6, 0, 0.5, 2.6, 0.55), small: true }]],
    [ax + ay + 0.3, soldier(ax, ay, 1, aFires, { accent: true })],
  ];
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 },
    // the game servers on the back edge, and the link into the match
    ...[0, 1, 2].map((i): Part => ({ kind: "box", box: box(6 + i * 1.2, 0.2, 0, 1, 1, 1.3), slots: true })),
    { kind: "cable", pts: [[7.7, 1.2, 0], [7.7, 4, 0], [4.65, 4, 0], [4.65, 4.6, 0]], speed: 0.5, accent: true },
    ...things.sort((a, b) => a[0] - b[0]).flatMap(([, ps]) => ps),
    ...(p < 0.15 ? [{ kind: "box", box: box(m[0] - 0.12, m[1] - 0.12, gz - 0.05, 0.24, 0.24, 0.24), accent: true } as Part] : []),
    { kind: "line", a: at(Math.max(0, p * 1.4 - 0.3)), b: at(Math.min(1, p * 1.4)), accent: true },
  ];
  return { parts, ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [ix, iy, iz + 3.2], [ix + 4, iy, iz + 3.2]], axes: ground(10) };
};

/**
 * Property Tech: a mid-rise whose floors part on hover. One unit's window
 * lights as it's leased, the lease runs into the database beside it, and
 * the matching row lights on the rent roll floating above, one unit at a
 * time.
 */
const tenancy: SceneFn = (s) => {
  const [x0, y0, a, b] = [1, 3.6, 4.4, 3.4];
  const [fx, fy] = [x0 + a, y0 + b];
  const gap = 0.06 + s.spread * 0.75;
  const [lobbyH, H, floors] = [0.9, 1, 3];
  const zAt = (f: number) => lobbyH + gap + f * (H + gap);
  const roof = zAt(floors - 1) + H;
  const T = 2.8;
  const lit = Math.floor(s.t / T) % (floors * 3);
  const [litF, litU] = [Math.floor(lit / 3), lit % 3];
  const ww = a / 3;
  const front = (x: number, z: number, h = 0.45): Part => ({ kind: "plane", pts: [[x, fy, z], [x + ww - 0.5, fy, z], [x + ww - 0.5, fy, z + h], [x, fy, z + h]], v: 0.03 });
  const side = (y: number, z: number): Part => ({ kind: "plane", pts: [[fx, y, z], [fx, y + 0.9, z], [fx, y + 0.9, z + 0.45], [fx, y, z + 0.45]], v: 0.03 });
  const sheetZ = 3.2 + s.spread * 1.4 + bob(s, 0.1);
  // the database under the rent roll: platters that part on hover
  const [dx, dy, dr, dh] = [8.3, 2.5, 0.95, 0.32];
  const dgap = 0.08 + s.spread * 0.3;
  const dbTop = 3 * dh + 2 * dgap;
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 },
    // the walk from the door to the database
    { kind: "cable", pts: [[x0 + a / 2, fy, 0], [x0 + a / 2, 8.6, 0], [dx, 8.6, 0], [dx, dy + dr, 0]], speed: 0.35, accent: true },
    // lobby: a band of glass and the door
    { kind: "box", box: box(x0, y0, 0, a, b, lobbyH) },
    { kind: "plane", pts: [[x0 + 0.3, fy, 0.2], [x0 + a / 2 - 0.5, fy, 0.2], [x0 + a / 2 - 0.5, fy, 0.65], [x0 + 0.3, fy, 0.65]], v: 0.03 },
    { kind: "plane", pts: [[x0 + a / 2 - 0.3, fy, 0], [x0 + a / 2 + 0.3, fy, 0], [x0 + a / 2 + 0.3, fy, 0.7], [x0 + a / 2 - 0.3, fy, 0.7]], v: 0.03 },
    { kind: "plane", pts: [[x0 + a / 2 + 0.5, fy, 0.2], [fx - 0.3, fy, 0.2], [fx - 0.3, fy, 0.65], [x0 + a / 2 + 0.5, fy, 0.65]], v: 0.03 },
  ];
  for (let f = 0; f < floors; f++) {
    const z = zAt(f);
    if (s.spread > 0.05) parts.push({ kind: "line", a: [fx, fy, z - gap], b: [fx, fy, z], dashed: true, alpha: 0.4 });
    parts.push({ kind: "box", box: box(x0, y0, z, a, b, H) });
    for (let u = 0; u < 3; u++) {
      const x = x0 + u * ww + 0.25;
      if (f === litF && u === litU) parts.push({ kind: "box", box: box(x - 0.1, fy, z + 0.18, ww - 0.3, 0.45 + s.spread * 0.4, 0.7), accent: true, handles: true });
      else parts.push(front(x, z + 0.3));
    }
    parts.push(side(y0 + 0.4, z + 0.3), side(y0 + 1.9, z + 0.3));
  }
  for (let k = 0; k < 3; k++) parts.push({ kind: "cyl", cx: dx, cy: dy, z: k * (dh + dgap), r: dr, h: dh });
  parts.push({ kind: "line", a: [dx, dy, dbTop], b: [dx, dy, sheetZ], dashed: true, alpha: 0.4 });
  // the rent roll: one row per unit on the visible floor
  parts.push({
    kind: "plane",
    pts: quad(6.6, 0.8, sheetZ, 3.4, 3.4),
    v: 0.2,
    handles: true,
    drops: { at: [[6.6, 4.2], [10, 4.2], [10, 0.8]], from: 0 },
    rows: { lengths: [2.8, 1.9, 2.4], accentRow: litU },
  });
  return { parts, ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [x0, y0, roof + 0.4], [10, 0.8, sheetZ + 0.4]], axes: ground(10) };
};

/**
 * User-Generated Platforms: uploads drop onto a belt and pass under the
 * trust and safety scanner. Most rise into the feed scrolling on the phone
 * behind; every so often one is flagged and pushed off into quarantine. On
 * hover the phone lifts and the scanner opens.
 */
const feed: SceneFn = (s) => {
  const T = 3.2;
  const ph = (s.t % T) / T;
  const flagged = Math.floor(s.t / T) % 4 === 3;
  const belt = 0.45;
  const [x0, x1, by] = [0.8, 6.6, 6.4];
  const [ax, beamZ] = [3.7, 1.9 + s.spread * 0.6];
  const [fx, fy] = [7, 3];
  const pz = 0.6 + s.spread * 1.4;
  const [screenB, screenT] = [pz + 0.3, pz + 4.6];
  const tile = (x: number, y: number, z: number, accent: boolean): Part => ({ kind: "box", box: box(x, y, z, 1, 0.8, 0.12), accent, small: !accent });
  // the upload: drop on, ride under the scanner, then up to the feed or off to the bin
  let at: V3;
  if (ph < 0.15) at = [x0 + 0.3, by + 0.2, belt + (1 - ease(ph / 0.15)) * 2.4];
  else if (ph < 0.55) at = [x0 + 0.3 + (5 - x0 - 0.3) * ((ph - 0.15) / 0.4), by + 0.2, belt];
  else if (flagged) {
    const k = ease(Math.min(1, (ph - 0.55) / 0.2));
    at = [5 - k * 0.3, by + 0.2 + k * 1.8, belt + (0.05 - belt) * k + Math.sin(k * Math.PI) * 0.5];
  } else {
    const k = ease(Math.min(1, (ph - 0.55) / 0.4));
    at = [5 + (fx - 0.5 - 5) * k, by + 0.2 + (fy + 0.4 - by - 0.2) * k, belt + (screenT - belt) * k];
  }
  const scanning = at[0] > ax - 1 && at[0] < ax + 0.6 && at[2] <= belt + 0.01;
  const binned = flagged && ph >= 0.75;
  const moving = tile(...at, !(flagged && ph >= 0.45));
  // the feed: cards scrolling up the screen, cut off at its edges
  const face = fy + 0.36;
  const pitch = 1.3;
  const off = ((s.t / T) * pitch) % pitch;
  const [lo0, hi0] = [screenB + 0.15, screenT - 0.45];
  const cards: Part[] = [];
  for (let k = -1; k < 4; k++) {
    const lo = Math.max(lo0, lo0 + k * pitch + off);
    const hi = Math.min(hi0, lo0 + k * pitch + off + 1.05);
    if (hi - lo > 0.08) cards.push({ kind: "plane", pts: [[fx - 1.1, face, lo], [fx + 1.1, face, lo], [fx + 1.1, face, hi], [fx - 1.1, face, hi]], v: 0.2 });
  }
  const slide = (s.t * 0.9) % 0.6;
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 },
    // the phone on its stand, the feed on its screen, a live dot up top
    { kind: "box", box: box(fx - 0.8, fy - 0.4, 0, 1.6, 1, 0.12) },
    { kind: "line", a: [fx, fy + 0.2, 0.12], b: [fx, fy + 0.2, pz], dashed: true, alpha: 0.4 },
    { kind: "box", box: box(fx - 1.4, fy, pz, 2.8, 0.36, 5) },
    { kind: "plane", pts: [[fx - 1.25, face, screenB], [fx + 1.25, face, screenB], [fx + 1.25, face, screenT], [fx - 1.25, face, screenT]], v: 0.03 },
    ...cards,
    { kind: "box", box: box(fx - 1.05, face, screenT - 0.32, 0.2, 0.02, 0.2), accent: true },
    { kind: "line", a: [fx - 0.7, face, screenT - 0.22], b: [fx + 0.2, face, screenT - 0.22], alpha: 0.6 },
    // the scanner's back post, the belt and its sliding slats
    { kind: "box", box: box(ax, by - 0.45, 0, 0.3, 0.3, 1.9) },
    { kind: "box", box: box(x0, by, 0, x1 - x0, 1.2, belt) },
    ...Array.from({ length: 10 }, (_, k): Part => ({ kind: "line", a: [x0 + slide + k * 0.6, by, belt], b: [x0 + slide + k * 0.6, by + 1.2, belt], alpha: 0.3 })),
    ...(binned || ph >= 0.97 ? [] : [moving]),
    { kind: "box", box: box(ax, by + 1.35, 0, 0.3, 0.3, 1.9) },
    ...(s.spread > 0.05 ? [{ kind: "line", a: [ax + 0.15, by + 1.65, 1.9], b: [ax + 0.15, by + 1.65, beamZ], dashed: true, alpha: 0.4 } as Part] : []),
    { kind: "box", box: box(ax - 0.05, by - 0.45, beamZ, 0.4, 2.1, 0.3), accent: scanning, small: !scanning },
    // quarantine, in front of the scanner
    ...tray(4.2, by + 1.6, 1.6, 1.2, 0.6, binned ? [tile(4.5, by + 1.8, 0.05, false)] : [], 0.12),
  ];
  return { parts, ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [fx - 1.4, fy, screenT + 0.6], [fx + 1.4, fy, screenT + 0.6], [x0 + 0.3, by, 3]], axes: ground(10) };
};

/**
 * Health Tech: a bedside monitor sweeps a heartbeat across its screen, fed
 * by the patient's chart beside it, a pill bottle at its foot. On hover the
 * screen rises off its stand.
 */
// one beat as [along, height]: a small wave, the spike, a wider wave
const BEAT: [number, number][] = [[0, 0], [0.12, 0], [0.17, 0.12], [0.22, 0], [0.34, 0], [0.38, -0.15], [0.44, 1], [0.5, -0.3], [0.54, 0], [0.66, 0], [0.75, 0.22], [0.84, 0], [1, 0]];
const pulse: SceneFn = (s) => {
  const [sx, sy, sw, sh] = [1.4, 3.4, 5.2, 2.8];
  const sz = 1.6 + s.spread * 1.2;
  const face = sy + 0.36;
  const beats = 3;
  const trace = BEAT.flatMap(([u, v], i) => Array.from({ length: beats }, (_, k): [number, number] => [(k + u) / beats, v]).filter((_, k) => k === 0 || i > 0)).sort((p, q) => p[0] - q[0]);
  const on = (u: number, v: number): V3 => [sx + 0.4 + u * (sw - 0.8), face, sz + 1.1 + v * 1.2];
  const height = (u: number) => {
    const i = trace.findIndex(([w]) => w >= u);
    if (i <= 0) return trace[0][1];
    const [[u0, v0], [u1, v1]] = [trace[i - 1], trace[i]];
    return v0 + ((v1 - v0) * (u - u0)) / (u1 - u0 || 1);
  };
  const piece = (a: number, b: number, accent: boolean): Part[] => {
    const pts: [number, number][] = [[a, height(a)], ...trace.filter(([u]) => u > a && u < b), [b, height(b)]];
    return pts.slice(1).map(([u, v], i): Part => ({ kind: "line", a: on(...pts[i]), b: on(u, v), alpha: accent ? 1 : 0.35, accent }));
  };
  // the sweep writes the new trace over the old, leaving a small gap ahead of it
  // offset so the resting frame (and a Soon card) has a trace drawn
  const w = (s.t * 0.3 + 0.7) % 1;
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 },
    // the chart feeds the monitor
    { kind: "cable", pts: [[7, 7, 0], [4.1, 7, 0], [4.1, 4.4, 0]], speed: 0.35 },
    { kind: "box", box: box(3.2, 3, 0, 1.8, 1.4, 0.14) },
    { kind: "box", box: box(3.9, 3.4, 0.14, 0.4, 0.36, sz - 0.14) },
    { kind: "box", box: box(sx, sy, sz, sw, 0.36, sh) },
    { kind: "plane", pts: [[sx + 0.2, face, sz + 0.2], [sx + sw - 0.2, face, sz + 0.2], [sx + sw - 0.2, face, sz + sh - 0.2], [sx + 0.2, face, sz + sh - 0.2]], v: 0.03 },
    ...piece(0, w, true),
    ...(w + 0.06 < 1 ? piece(w + 0.06, 1, false) : []),
    { kind: "line", a: [sx + sw - 0.75, face, sz + sh - 0.5], b: [sx + sw - 0.35, face, sz + sh - 0.5], alpha: 1, accent: true },
    { kind: "line", a: [sx + sw - 0.55, face, sz + sh - 0.7], b: [sx + sw - 0.55, face, sz + sh - 0.3], alpha: 1, accent: true },
    // a pill bottle and its cap
    { kind: "cyl", cx: 8.4, cy: 4.4, z: 0, r: 0.45, h: 0.85 },
    { kind: "cyl", cx: 8.4, cy: 4.4, z: 0.85, r: 0.5, h: 0.25, accent: true },
    // the chart: a stack of folders, the top one tabbed
    ...[0, 1, 2].map((k): Part => ({ kind: "box", box: box(7 + (k % 2) * 0.08, 6.2 - (k % 2) * 0.06, k * 0.16, 1.8, 1.4, 0.14), small: true })),
    { kind: "box", box: box(7.2, 6.14, 0.48, 0.6, 0.2, 0.06), small: true },
  ];
  return { parts, ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [sx, sy, sz + sh + 0.4], [sx + sw, sy, sz + sh + 0.4]], axes: ground(10) };
};

/**
 * Commerce: products wait on a shelf, and one at a time is picked off it
 * and dropped into a shopping bag, its slot restocked behind it. On hover
 * the shelf rises.
 */
const basket: SceneFn = (s) => {
  const zs = 1 + s.spread * 1.2;
  // [x, y, height, round], back row first
  const items: [number, number, number, boolean][] = [
    [1.3, 1.3, 0.9, false], [2.9, 1.3, 1.2, true], [4.5, 1.3, 0.7, false],
    [1.3, 2.9, 1.3, true], [2.9, 2.9, 0.8, false], [4.5, 2.9, 1.1, false],
  ];
  const T = 3;
  const ph = (s.t % T) / T;
  const pick = [4, 0, 5, 2, 3, 1][Math.floor(s.t / T) % items.length];
  const [bx, by, ba, bb, bh] = [6.2, 5.8, 2.4, 2, 1.8];
  const product = ([x, y, h, round]: (typeof items)[number], z: number, accent = false): Part =>
    round ? { kind: "cyl", cx: x + 0.5, cy: y + 0.5, z, r: 0.45, h, accent } : { kind: "box", box: box(x, y, z, 1, 1, h), accent, small: !accent };
  // the pick: lift off the shelf, arc over to the bag, drop in
  const [ix, iy, ih] = items[pick];
  const [tx, ty] = [bx + ba / 2 - 0.5, by + bb / 2 - 0.5];
  const lift = ease(Math.min(1, ph / 0.2));
  const across = ease(Math.min(1, Math.max(0, (ph - 0.2) / 0.45)));
  const drop = ease(Math.min(1, Math.max(0, (ph - 0.65) / 0.2)));
  const top = bh + 1.4;
  const moving: (typeof items)[number] = [ix + (tx - ix) * across, iy + (ty - iy) * across, ih, items[pick][3]];
  const mz = ph < 0.2 ? zs + lift * 1.2 : ph < 0.65 ? zs + 1.2 + (top - zs - 1.2) * across + Math.sin(across * Math.PI) * 0.8 : top + (0.15 - top) * drop;
  const inBag = mz < bh;
  const held = ph >= 0.85;
  // a handle arches over each long wall
  const handle = (y: number): Part[] =>
    Array.from({ length: 8 }, (_, k): Part => {
      const at = (u: number): V3 => [bx + 0.6 + u * (ba - 1.2), y, bh + Math.sin(u * Math.PI) * 0.8];
      return { kind: "line", a: at(k / 8), b: at((k + 1) / 8), alpha: 0.9 };
    });
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 },
    { kind: "plane", pts: quad(0.8, 0.8, zs, 5.2, 3.6), v: 0.16, drops: { at: [[0.8, 4.4], [6, 4.4], [6, 0.8]], from: 0 } },
    ...items.map((it, i): Part => (i === pick && !held ? { kind: "plane", pts: quad(it[0], it[1], zs, 1, 1), v: 0, dashed: true } : product(it, zs))),
    ...handle(by + 0.15),
    ...tray(bx, by, ba, bb, bh, [product([bx + 0.4, by + 0.4, 0.6, false], 0.15), ...(inBag ? [product(moving, mz, true)] : [])]),
    ...handle(by + bb - 0.15),
    ...(inBag ? [] : [product(moving, mz, true)]),
  ];
  return { parts, ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [1.3, 1.3, zs + 2.6], [bx, by, top + 1.6]], axes: ground(10) };
};

/**
 * Banking & Lending: a bank on its plinth, columns along the front, and
 * stacks of coins beside it, one coin at a time dropping onto a stack. On
 * hover the roof lifts off the columns.
 */
const bank: SceneFn = (s) => {
  const [x0, y0, a, b] = [1, 2, 5.2, 4];
  const [x1, y1] = [x0 + a, y0 + b];
  const floor = 0.55;
  const colH = 1.9;
  const rz = floor + colH + s.spread * 1.2;
  const [px0, py0, px1, py1] = [x0 + 0.3, y0 + 0.3, x1 - 0.3, y1 - 0.3];
  const pz = rz + 0.35;
  const xm = (px0 + px1) / 2;
  const ridge = 0.9;
  const cols: [number, number][] = [
    ...[0, 1, 2, 3].map((i): [number, number] => [x0 + 0.75 + (i * (a - 1.5)) / 3, y1 - 0.75]),
    [x1 - 0.75, y0 + 0.9],
    [x1 - 0.75, y0 + 2.1],
  ];
  // coin stacks: [x, y, coins]; one coin drops onto each in turn
  const stacks: [number, number, number][] = [[7.6, 2.6, 4], [8.2, 4.6, 6], [7.4, 6.8, 3]];
  const T = 2.4;
  const ph = (s.t % T) / T;
  const n = Math.floor(s.t / T) % stacks.length;
  const [ch, step] = [0.14, 0.17];
  const coin = (x: number, y: number, z: number, accent = false): Part => ({ kind: "cyl", cx: x, cy: y, z, r: 0.55, h: ch, accent });
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 },
    // plinth and step, then the hall behind the columns
    { kind: "box", box: box(x0, y0, 0, a, b, 0.3) },
    { kind: "box", box: box(x0 + 0.3, y0 + 0.3, 0.3, a - 0.6, b - 0.6, 0.25) },
    { kind: "box", box: box(x0 + 0.8, y0 + 0.7, floor, a - 2.2, b - 2.2, colH) },
    { kind: "plane", pts: [[xm - 0.8, y1 - 1.5, floor], [xm, y1 - 1.5, floor], [xm, y1 - 1.5, floor + 1.3], [xm - 0.8, y1 - 1.5, floor + 1.3]], v: 0.03 },
    ...cols
      .sort((p, q) => p[0] + p[1] - (q[0] + q[1]))
      .map(([cx, cy]): Part => ({ kind: "cyl", cx, cy, z: floor, r: 0.24, h: colH })),
    ...(s.spread > 0.05 ? cols.map(([cx, cy]): Part => ({ kind: "line", a: [cx, cy, floor + colH], b: [cx, cy, rz], dashed: true, alpha: 0.4 })) : []),
    // the roof: a beam, both slopes, then the gable over the front
    { kind: "box", box: box(px0, py0, rz, px1 - px0, py1 - py0, 0.35) },
    { kind: "plane", pts: [[px0, py0, pz], [px0, py1, pz], [xm, py1, pz + ridge], [xm, py0, pz + ridge]], v: 0.3 },
    { kind: "plane", pts: [[xm, py0, pz + ridge], [xm, py1, pz + ridge], [px1, py1, pz], [px1, py0, pz]], v: 0.22 },
    { kind: "plane", pts: [[px0, py1, pz], [px1, py1, pz], [xm, py1, pz + ridge]], v: 0.4 },
  ];
  stacks.forEach(([x, y, count], i) => {
    for (let k = 0; k < count; k++) parts.push(coin(x, y, k * step));
    if (i !== n) return;
    // the new coin falls, lands, and sits lit until the next one
    const land = count * step;
    const fall = ease(Math.min(1, ph / 0.45));
    const z = land + (1 - fall) * 3;
    if (fall < 1) parts.push({ kind: "line", a: [x, y, land + ch], b: [x, y, z], dashed: true, alpha: 0.35 });
    parts.push(coin(x, y, z, true));
  });
  return { parts, ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [xm, py0, pz + ridge + 0.4 + s.spread * 0.4], [8.2, 4.6, 4.2]], axes: ground(10) };
};

/**
 * Hosting & Cloud: racks of real servers under a cloud, wired out to the
 * websites they serve. One site at a time deploys, rising into place lit.
 * On hover the cloud lifts off the servers it's made of.
 */
// the cloud's outline as circles along it, [along, radius, center height]
const PUFFS: [number, number, number][] = [[1, 0.9, 0.9], [2.4, 1.3, 1.3], [3.9, 1.05, 1.15], [5, 0.75, 0.75]];
const cloud: SceneFn = (s) => {
  const T = 3;
  const n = Math.floor(s.t / T);
  const ph = (s.t % T) / T;
  const rack = (i: number) => 0.8 + i * 1.25;
  // the cloud: a flat outline standing over the racks, thick enough to read as a sign
  const [cx0, cy0, cz0] = [0.5, 1.2, 3.3 + s.spread * 1.6 + bob(s, 0.1)];
  const top = (u: number) => Math.max(...PUFFS.map(([c, r, h]) => (Math.abs(u - c) < r ? h + Math.sqrt(r * r - (u - c) ** 2) : 0)));
  const [l, r] = [PUFFS[0], PUFFS[PUFFS.length - 1]];
  const outline: [number, number][] = [
    ...Array.from({ length: 49 }, (_, i): [number, number] => {
      const u = l[0] - l[1] + ((r[0] + r[1] - l[0] + l[1]) * i) / 48;
      return [u, top(u)];
    }),
    ...Array.from({ length: 9 }, (_, i): [number, number] => [r[0] + Math.cos((i / 8) * (Math.PI / 2)) * r[1], r[2] - Math.sin((i / 8) * (Math.PI / 2)) * r[1]]),
    ...Array.from({ length: 9 }, (_, i): [number, number] => [l[0] - Math.sin((i / 8) * (Math.PI / 2)) * l[1], l[2] - Math.cos((i / 8) * (Math.PI / 2)) * l[1]]),
  ];
  const face = (y: number, v: number): Part => ({ kind: "plane", pts: outline.map(([u, h]): V3 => [cx0 + u, y, cz0 + h]), v });
  // the sites: [x, y], each a browser window standing on its own feed from the racks
  const sites: [number, number, V3[]][] = [
    [6.6, 3.6, [[rack(3) + 1.1, 1.4, 0], [7.8, 1.4, 0], [7.8, 3.7, 0]]],
    [7, 6.6, [[rack(3) + 0.3, 2.6, 0], [rack(3) + 0.3, 6.7, 0], [8.2, 6.7, 0]]],
    [3, 7.6, [[rack(1) + 0.55, 2.6, 0], [rack(1) + 0.55, 7.7, 0], [4.2, 7.7, 0]]],
  ];
  const live = n % sites.length;
  const [w, h] = [2.4, 1.6];
  const site = ([x, y]: [number, number, V3[]], i: number): Part[] => {
    const lit = i === live;
    const z = 0.8 + s.spread * 0.6 + (lit ? -0.8 * (1 - ease(Math.min(1, ph / 0.35))) : 0);
    const f = y + 0.13;
    return [
      { kind: "line", a: [x + w / 2, y + 0.1, 0], b: [x + w / 2, y + 0.1, z], dashed: true, alpha: 0.4 },
      { kind: "box", box: box(x, y, z, w, 0.12, h), accent: lit, small: !lit },
      { kind: "line", a: [x, f, z + h - 0.38], b: [x + w, f, z + h - 0.38], alpha: 0.7, accent: lit },
      ...[0, 1, 2].map((k): Part => ({ kind: "box", box: box(x + 0.18 + k * 0.24, f, z + h - 0.26, 0.13, 0.01, 0.13), small: true })),
      { kind: "plane", pts: [[x + 0.25, f, z + 0.25], [x + 1.25, f, z + 0.25], [x + 1.25, f, z + h - 0.6], [x + 0.25, f, z + h - 0.6]], v: lit ? 0.45 : 0.25 },
      ...[0.95, 0.7, 0.45].map((zz, k): Part => ({ kind: "line", a: [x + 1.45, f, z + zz], b: [x + 1.45 + [0.75, 0.5, 0.65][k], f, z + zz], alpha: 0.6 })),
    ];
  };
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 },
    ...[0, 1, 2, 3].map((i): Part => ({ kind: "box", box: box(rack(i), 0.8, 0, 1.1, 1.8, 2.4), slots: true })),
    ...(s.spread > 0.05 ? [0.8, 5.85].map((x): Part => ({ kind: "line", a: [x, 2.6, 2.4], b: [x, 2.6, cz0], dashed: true, alpha: 0.35 })) : []),
    face(cy0, 0.2),
    face(cy0 + 0.35, 0.4),
    ...sites.map(([, , route], i): Part => ({ kind: "cable", pts: route, speed: 0.4, accent: i === live })),
    ...sites
      .map((st, i) => [st, i] as const)
      .sort(([p], [q]) => p[0] + p[1] - (q[0] + q[1]))
      .flatMap(([st, i]) => site(st, i)),
  ];
  return { parts, ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [cx0, cy0, cz0 + 2.6], [cx0 + 5.8, cy0, cz0 + 2.6]], axes: ground(10) };
};

/**
 * Workplace & Collaboration: a board of three columns, a card working its
 * way across and arcing back to the start, under a chat where someone's
 * typing. Every third pass the card is blocked in the middle column and
 * turns red. On hover the columns step apart.
 */
const board: SceneFn = (s) => {
  const [y0, depth, cw] = [2.4, 5.4, 2.6];
  const xs = [0.8, 3.7, 6.6];
  const zc = (i: number) => 0.15 + s.spread * 0.5 * i;
  const slot = (c: number, k: number): V3 => [xs[c] + 0.3, y0 + 0.8 + k * 1.05, zc(c)];
  const card = ([x, y, z]: V3, o: { accent?: boolean; warn?: boolean } = {}): Part => ({ kind: "box", box: box(x, y, z, cw - 0.6, 0.8, 0.1), ...o, handles: o.accent || o.warn, small: !o.accent && !o.warn });
  const counts = [3, 2, 1];
  // rest, move across, rest (blocked, some passes), move, rest, arc back
  const T = 8;
  const ph = ((s.t + 0.6) % T) / T;
  const blocked = Math.floor((s.t + 0.6) / T) % 3 === 2;
  const [a, b, c] = [slot(0, 3), slot(1, 2), slot(2, 1)];
  const legs: [number, V3, V3, number][] = [
    [0.13, a, a, 0],
    [0.3, a, b, 0.8],
    [0.55, b, b, 0],
    [0.7, b, c, 0.8],
    [0.84, c, c, 0],
    [1, c, a, 2],
  ];
  const li = legs.findIndex(([end]) => ph < end);
  const start = li ? legs[li - 1][0] : 0;
  const [end, from, to, lift] = legs[li];
  const k = ease((ph - start) / (end - start));
  const stuck = blocked && li === 2;
  const shake = stuck ? Math.sin(s.t * 28) * 0.06 : 0;
  const pos: V3 = [from[0] + (to[0] - from[0]) * k + shake, from[1] + (to[1] - from[1]) * k, from[2] + (to[2] - from[2]) * k + Math.sin(k * Math.PI) * lift];
  // the chat: speech bubbles standing behind the board
  const [cy, bz] = [y0 - 0.1, 1.9 + s.spread * 1.2];
  const bubble = (x: number, z: number, w: number, tail: number): Part[] => [
    { kind: "plane", pts: [[x + tail, cy, z - 0.4], [x + tail + 0.5, cy, z], [x + tail - 0.1, cy, z]], v: 0.2 },
    { kind: "plane", pts: [[x, cy, z], [x + w, cy, z], [x + w, cy, z + 1.2], [x, cy, z + 1.2]], v: 0.2 },
  ];
  const dot = (i: number): Part => {
    const up = Math.max(0, Math.sin(s.t * 6 - i * 0.9)) * 0.15;
    return { kind: "box", box: box(5.9 + i * 0.55, cy, bz + 0.95 + up, 0.26, 0.02, 0.26), accent: true };
  };
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 },
    ...bubble(1, bz + 0.5, 3.6, 0.6),
    { kind: "line", a: [1.4, cy, bz + 1.3], b: [4, cy, bz + 1.3], alpha: 0.6 },
    { kind: "line", a: [1.4, cy, bz + 0.95], b: [3.2, cy, bz + 0.95], alpha: 0.6 },
    ...bubble(5.5, bz, 2.4, 1.5),
    ...[0, 1, 2].map(dot),
  ];
  xs.forEach((x, c) => {
    if (c && s.spread > 0.05) parts.push({ kind: "line", a: [x, y0 + depth, 0], b: [x, y0 + depth, zc(c)], dashed: true, alpha: 0.35 });
    parts.push(
      { kind: "plane", pts: quad(x, y0, zc(c), cw, depth), v: 0.14 },
      { kind: "line", a: [x + 0.3, y0 + 0.45, zc(c)], b: [x + 1.3, y0 + 0.45, zc(c)], alpha: 0.8 },
    );
    for (let k = 0; k < counts[c]; k++) parts.push(card(slot(c, k)));
  });
  // the moving card rides over the board, so nothing it passes covers it
  parts.push(card(pos, stuck ? { warn: true } : { accent: true }));
  return { parts, ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [1, cy, bz + 2], [7.9, cy, bz + 1.6], [0.8, y0, zc(0) + 2.8]], axes: ground(10) };
};

/**
 * Books index: a bookcase of two shelves pulled apart, the volumes standing
 * with their spines out, one lifted off the top shelf to read.
 */
const library: SceneFn = (s) => {
  const [x0, y0, len, dep, t] = [1.2, 3.4, 7.6, 2.4, 0.3];
  const top = 3.9 + s.spread * 2;
  // [thickness, depth, height] per volume, left to right
  const rows: [number, number, number][][] = [
    [[0.8, 2, 2.4], [0.6, 1.8, 2.1], [0.9, 2.1, 2.6], [0.5, 1.7, 1.9], [0.7, 2, 2.3], [0.8, 1.9, 2.5], [0.6, 1.8, 2]],
    [[0.7, 1.9, 2.2], [0.9, 2.1, 2.6], [0.6, 1.8, 2], [0.8, 2, 2.4], [0.5, 1.7, 1.8], [0.9, 2.1, 2.5]],
  ];
  const pick = 3;
  const lift = 0.8 + s.spread * 1 + bob(s, 0.12);
  const shelf = (z: number, books: [number, number, number][], upper: boolean): Part[] => {
    const gap = 0.06 + s.spread * 0.18;
    const parts: Part[] = [{ kind: "box", box: box(x0, y0, z, len, dep, t), small: true }];
    let x = x0 + 0.3;
    books.forEach(([a, b, h], i) => {
      const lit = upper && i === pick;
      const zz = z + t + (lit ? lift : 0);
      const y = y0 + dep - b - 0.1;
      if (lit) parts.push({ kind: "line", a: [x + a / 2, y + b, z + t], b: [x + a / 2, y + b, zz], dashed: true, alpha: 0.4 });
      parts.push({ kind: "box", box: box(x, y, zz, a, b, h), accent: lit, handles: lit });
      // bands across the spine
      for (const k of [0.18, 0.82]) parts.push({ kind: "line", a: [x, y + b, zz + h * k], b: [x + a, y + b, zz + h * k], alpha: lit ? 0.9 : 0.45, accent: lit });
      x += a + gap;
    });
    return parts;
  };
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 },
    ...shelf(0, rows[0], false),
    ...[[x0, y0 + dep], [x0 + len, y0 + dep], [x0 + len, y0]].map(([x, y]): Part => ({ kind: "line", a: [x, y, t], b: [x, y, top], dashed: true, alpha: 0.35 })),
    ...shelf(top, rows[1], true),
  ];
  return { parts, ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [x0, y0, top + t + 3.6 + s.spread], [x0 + len, y0, top + t + 2.6]], axes: ground(10) };
};

export const scenes = { system, loop, weld, scaffold, stack, modules, shelf, writing, toolbox, layers, desk, plug, career, sorter, missing, tender, route, arcade, tenancy, feed, pulse, basket, bank, cloud, board, library } satisfies Record<string, SceneFn>;
export type SceneName = keyof typeof scenes;

/** Book covers, one per book (written or Soon), never shared with a post or a page. */
export const BOOK_SCENES = ["tender", "route", "arcade", "tenancy", "feed", "pulse", "basket", "bank", "cloud", "board"] as const satisfies readonly SceneName[];
export type BookSceneName = (typeof BOOK_SCENES)[number];

/** The books index's own scene, shared with nothing else. */
export const BOOKS_INDEX_SCENE = "library" satisfies SceneName;

/** Scenes a post may use as its hero. Page scenes (home, 404, ...) are not. */
export const POST_SCENES = ["loop", "weld", "scaffold", "stack"] as const satisfies readonly SceneName[];
export type PostSceneName = (typeof POST_SCENES)[number];

export const isPostScene = (name: unknown): name is PostSceneName =>
  typeof name === "string" && (POST_SCENES as readonly string[]).includes(name);

export const sceneAt = (name: SceneName, s: SceneState): Scene => scenes[name](s);
