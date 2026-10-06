import { CYL_FRONT, circle, cylSide, type Projector, type Scene, type SceneState, type V2, type V3 } from "./iso";

/*
 * One traversal of a scene's line work, in painter's order. A Pen decides
 * what drawing means: the canvas strokes vectors, the OG renderer rasterizes
 * into cells. `occlude` erases line work already drawn under a solid face.
 */

export type Ink = "fg" | "dim" | "acc";

export interface Pen {
  occlude(pts: V2[], alpha: number): void;
  path(pts: V2[], o: { alpha: number; ink: Ink; width?: number; close?: boolean; dash?: boolean }): void;
  dot(x: number, y: number, ink: Ink, size?: number): void;
  handle(x: number, y: number): void;
  label?(from: V2, to: V2, text: string, accent: boolean): void;
  packet?(pts: V2[], at: number): void;
}

export function walk(scene: Scene, P: Projector, pen: Pen, s: SceneState) {
  const pts = (vs: readonly V3[]) => vs.map(P);
  const seg = (a: V3, b: V3, alpha: number, ink: Ink = "fg", dash = false) =>
    pen.path([P(a), P(b)], { alpha, ink, close: false, dash });

  for (const [a, b] of scene.axes) seg(a, b, 0.3, "dim", true);

  const labels: (() => void)[] = [];
  for (const p of scene.parts) {
    switch (p.kind) {
      case "plane": {
        const [x, y, z] = p.pts[0];
        if (!p.dashed) pen.occlude(pts(p.pts), 0.72);
        pen.path(pts(p.pts), { alpha: p.dashed ? 0.55 : 0.7, ink: "fg", dash: p.dashed });
        if (p.grid)
          for (let i = 1; i < p.grid; i++) {
            seg([x + i, y, z], [x + i, y + p.grid, z], 0.08);
            seg([x, y + i, z], [x + p.grid, y + i, z], 0.08);
          }
        if (p.drops) for (const [dx, dy] of p.drops.at) seg([dx, dy, p.drops.from], [dx, dy, z], 0.35, "fg", true);
        if (p.window) {
          const w = p.pts[1][0] - x;
          seg([x, y + 0.8, z], [x + w, y + 0.8, z], 0.6);
          [0, 1, 2].forEach((i) => {
            const [cx, cy] = P([x + 0.45 + i * 0.4, y + 0.4, z]);
            pen.dot(cx, cy, i ? "dim" : "acc", 3.2);
          });
        }
        if (p.rows) {
          p.rows.lengths.forEach((len, i) => {
            const yy = y + 1.5 + i * 0.55;
            seg([x + 0.5, yy, z], [x + 0.5 + len * 0.55, yy, z], i === p.rows!.accentRow ? 1 : 0.55, i === p.rows!.accentRow ? "acc" : "fg");
          });
        }
        if (p.handles) p.pts.forEach((v) => pen.handle(...P(v)));
        break;
      }
      case "box": {
        const b = p.box;
        const ink: Ink = p.accent ? "acc" : "fg";
        const alpha = p.ghost ? 0.55 : p.accent ? 1 : p.small ? 0.65 : 0.9;
        if (!p.ghost) [b.left, b.right, b.top].forEach((f) => pen.occlude(pts(f), 1));
        [b.left, b.right, b.top].forEach((f) =>
          pen.path(pts(f), { alpha, ink, width: p.accent ? 1.4 : 1, dash: p.ghost }),
        );
        if (p.slots)
          for (let k = 1; k < 9; k++) {
            const zz = b.z + (b.h * k) / 9;
            seg([b.x + 0.2, b.y + b.b, zz], [b.x + b.a - 0.5, b.y + b.b, zz], 0.5);
            pen.dot(...P([b.x + b.a - 0.25, b.y + b.b, zz - b.h / 18]), k % 3 ? "dim" : "acc", 2);
          }
        if (p.vents)
          for (let k = 1; k < 6; k++)
            seg([b.x + b.a, b.y + 0.3 + k * 0.25, b.z + 0.3], [b.x + b.a, b.y + 0.3 + k * 0.25, b.z + b.h - 0.3], 0.45);
        if (p.handles) b.top.forEach((v) => pen.handle(...P(v)));
        break;
      }
      case "cyl": {
        const [f0, f1] = CYL_FRONT;
        pen.occlude(pts(cylSide(p)), 1);
        pen.occlude(pts(circle(p.cx, p.cy, p.z + p.h, p.r)), 1);
        pen.path(pts(circle(p.cx, p.cy, p.z + p.h, p.r)), { alpha: 0.9, ink: "fg", close: false });
        pen.path(pts(circle(p.cx, p.cy, p.z, p.r, f0, f1)), { alpha: 0.9, ink: "fg", close: false });
        [0.33, 0.66].forEach((k) =>
          pen.path(pts(circle(p.cx, p.cy, p.z + p.h * k, p.r, f0, f1)), { alpha: 0.45, ink: "fg", close: false }),
        );
        [f0, f1].forEach((t) => {
          const x = p.cx + p.r * Math.cos(t);
          const y = p.cy + p.r * Math.sin(t);
          seg([x, y, p.z], [x, y, p.z + p.h], 0.9);
        });
        break;
      }
      case "cable": {
        const c = pts(p.pts);
        pen.path(c, { alpha: p.accent ? 1 : 0.42, ink: p.accent ? "acc" : "fg", close: false, width: p.accent ? 1.4 : 1 });
        if (pen.packet) for (const k of [0, 0.5]) pen.packet(c, (s.flow * p.speed + k) % 1);
        break;
      }
      case "line":
        seg(p.a, p.b, p.alpha ?? 0.5, p.accent ? "acc" : "fg", p.dashed);
        break;
      case "label":
        if (pen.label) {
          const from = P(p.at);
          const to: V2 = [from[0] + p.dx * P.sc, from[1] + p.dy * P.sc];
          labels.push(() => pen.label!(from, to, p.text, !!p.accent));
        }
        break;
    }
  }
  labels.forEach((fn) => fn());
}
