import { box, quad, type Part, type Scene, type SceneFn, type SceneState, type V3 } from "./iso";

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

/** Home: infra, services, product, as an exploded system. */
const system: SceneFn = (s) => {
  const Z = { svc: 5.2 + s.spread * 2, app: 10 + s.spread * 4.4 };
  const cube = Z.app + 0.05 + s.spread * 1.2 + bob(s);
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 12, 12), v: 0.09, grid: 12 },
    { kind: "cable", pts: [[2.1, 7.4, 0], [5.6, 7.4, 0], [5.6, 2.4, 0], [8.6, 2.4, 0]], speed: 0.22 },
    { kind: "cable", pts: [[2.1, 9.9, 0], [6.6, 9.9, 0], [6.6, 10.6, 0]], speed: 0.16 },
    { kind: "cyl", cx: 10, cy: 2.3, z: 0, r: 1.25, h: 2.4 },
    { kind: "label", at: [10.9, 1.4, 2.4], text: "pg · primary", dx: 1.2, dy: -1.1 },
    { kind: "box", box: box(0.6, 6.1, 0, 1.4, 1.8, 3.4), slots: true },
    { kind: "box", box: box(0.6, 8.3, 0, 1.4, 1.8, 4.4), slots: true },
    ...[0, 1, 2, 3].map((i): Part => ({ kind: "box", box: box(7 + i * 1.2, 10.1, 0, 0.9, 1.3, 0.5) })),
    { kind: "label", at: [0.6, 8.3, 4.4], text: "rack · 01", dx: -1.4, dy: -1 },
    {
      kind: "plane",
      pts: quad(1.5, 1.5, Z.svc, 9, 9),
      v: 0.16,
      drops: { at: [[1.5, 1.5], [10.5, 1.5], [1.5, 10.5], [10.5, 10.5]], from: 0 },
    },
    { kind: "cable", pts: [[3.5, 4.6, Z.svc], [3.5, 5.6, Z.svc], [8.1, 5.6, Z.svc], [8.1, 4.2, Z.svc]], speed: 0.35 },
    { kind: "cable", pts: [[4.2, 7.8, Z.svc], [6.4, 7.8, Z.svc]], speed: 0.5 },
    { kind: "box", box: box(2.4, 2.4, Z.svc, 2.2, 2.2, 1.1) },
    { kind: "box", box: box(6.8, 2.4, Z.svc, 2.6, 1.8, 1.6), vents: true },
    { kind: "box", box: box(2.4, 6.6, Z.svc, 1.8, 2.4, 0.8) },
    ...[0, 1, 2, 3, 4, 5].map(
      (i): Part => ({ kind: "box", box: box(6.4 + (i % 3) * 0.95, 7.1 + Math.floor(i / 3) * 0.95, Z.svc, 0.7, 0.7, 0.7), small: true }),
    ),
    { kind: "label", at: [9.4, 2.4, Z.svc + 1.6], text: "api", dx: 1.4, dy: -1.2 },
    { kind: "label", at: [8.8, 8.9, Z.svc + 0.7], text: "queue", dx: 1.8, dy: 0.9 },
    {
      kind: "plane",
      pts: quad(3, 3, Z.app, 6, 6),
      v: 0.2,
      window: true,
      rows: { lengths: [3.6, 2.4, 4.4, 1.6, 3.2] },
      drops: { at: [[3, 3], [9, 9]], from: Z.svc + 1.1 },
      handles: true,
    },
    { kind: "box", box: box(5.3, 5.3, cube, 1.6, 1.6, 1), accent: true, handles: true },
    { kind: "label", at: [6.9, 5.3, cube + 1], text: "product", dx: 1.6, dy: -1.8, accent: true },
  ];
  return {
    parts,
    ext: [[-1.5, 13, 0], [13.5, -1, 0], [12, 12, 0], [0, 0, 0], [4, 4, cube + 2.2], [0.6, 10.1, 4.4]],
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

/** Projects: modules on a grid, one being placed. */
const modules: SceneFn = (s) => {
  const lift = 5.5 + s.spread * 2 + bob(s);
  const heights = [2.4, 1.2, 3, 1.6, 0, 0.8, 0.6, 2, 1.4];
  const parts: Part[] = [{ kind: "plane", pts: quad(0, 0, 0, 10, 10), v: 0.09, grid: 10 }];
  parts.push({ kind: "plane", pts: quad(4, 4, 0, 2, 2), v: 0, dashed: true });
  heights.forEach((h, k) => {
    if (!h) return;
    parts.push({ kind: "box", box: box(1 + (k % 3) * 3, 1 + Math.floor(k / 3) * 3, 0, 2, 2, h) });
  });
  [[4, 4], [6, 4], [4, 6], [6, 6]].forEach(([x, y]) => parts.push({ kind: "line", a: [x, y, 0], b: [x, y, lift], dashed: true, alpha: 0.35 }));
  parts.push({ kind: "box", box: box(4, 4, lift, 2, 2, 2), accent: true, handles: true });
  return { parts, ext: [[0, 10, 0], [10, 0, 0], [10, 10, 0], [0, 0, 0], [4, 4, lift + 2.4], [7, 1, 3]], axes: ground(10) };
};

/** Docs: a spec sheet lifted off its index. */
const spec: SceneFn = (s) => {
  const z = 4 + s.spread * 2 + bob(s, 0.1);
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 8, 10), v: 0.09, rows: { lengths: [4, 3, 5, 3.4, 4.4, 2.6, 4.8, 3.6, 4] } },
    { kind: "plane", pts: quad(1, 1, z, 6, 8), v: 0.2, handles: true, window: true, drops: { at: [[1, 1], [7, 1], [1, 9], [7, 9]], from: 0 }, rows: { lengths: [6, 4.2, 7, 5, 6.4, 3.4, 7.4, 5.6, 6.2, 4.6], accentRow: 4 } },
    { kind: "box", box: box(5.6, 0.4, z, 0.7, 1.4, 0.18), accent: true },
  ];
  return { parts, ext: [[0, 10, 0], [8, 0, 0], [8, 10, 0], [0, 0, 0], [1, 1, z + 1]], axes: ground(10) };
};

/** Misc: an opened box of small tools. */
const toolbox: SceneFn = (s) => {
  const lid = 4.6 + s.spread * 2.4 + bob(s);
  const parts: Part[] = [
    { kind: "plane", pts: quad(0, 0, 0, 10, 9), v: 0.09, grid: 9 },
    { kind: "box", box: box(1, 1, 0, 5, 4, 0.4) },
    { kind: "box", box: box(1.6, 1.6, 0.4, 1.4, 1.4, 1.4), accent: true },
    { kind: "box", box: box(3.6, 1.6, 0.4, 1.8, 0.8, 0.6), small: true },
    { kind: "box", box: box(3.6, 3, 0.4, 0.8, 1.4, 1), small: true },
    { kind: "box", box: box(7, 2, 0, 2, 2, 2.2) },
    { kind: "box", box: box(2, 6, 0, 3, 2, 0.8) },
    { kind: "box", box: box(6.5, 6, 0, 2.5, 2, 1.4) },
    { kind: "plane", pts: quad(1, 1, lid, 5, 4), v: 0.2, handles: true, drops: { at: [[1, 1], [6, 1], [1, 5], [6, 5]], from: 0.4 } },
  ];
  return { parts, ext: [[0, 9, 0], [10, 0, 0], [10, 9, 0], [0, 0, 0], [1, 1, lid + 1]], axes: ground(10) };
};

/** 404: the tile that should be here isn't. */
const missing: SceneFn = (s) => {
  const z = 6 + s.spread * 2 + bob(s);
  const parts: Part[] = [];
  const tiles: [number, number][] = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (!(i === 1 && j === 1)) tiles.push([i * 3, j * 3]);
  tiles.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  parts.push({ kind: "plane", pts: quad(3, 3, 0, 2.6, 2.6), v: 0, dashed: true });
  tiles.forEach(([x, y]) => parts.push({ kind: "box", box: box(x, y, 0, 2.6, 2.6, 0.5) }));
  parts.push({ kind: "line", a: [4.3, 4.3, 0], b: [4.3, 4.3, z], dashed: true, alpha: 0.4 });
  parts.push({ kind: "box", box: box(3.6, 3.6, z, 1.4, 1.4, 0.5), accent: true, handles: true });
  return { parts, ext: [[0, 9, 0], [9, 0, 0], [9, 9, 0], [0, 0, 0], [3, 3, z + 1.5]], axes: ground(9) };
};

export const scenes = { system, loop, weld, scaffold, modules, spec, toolbox, missing } satisfies Record<string, SceneFn>;
export type SceneName = keyof typeof scenes;

/** Scenes a post may use as its hero. Page scenes (home, 404, ...) are not. */
export const POST_SCENES = ["loop", "weld", "scaffold"] as const satisfies readonly SceneName[];
export type PostSceneName = (typeof POST_SCENES)[number];

export const isPostScene = (name: unknown): name is PostSceneName =>
  typeof name === "string" && (POST_SCENES as readonly string[]).includes(name);

export const sceneAt = (name: SceneName, s: SceneState): Scene => scenes[name](s);
