// Territory levels for one branch as an exploded axonometric stack, with one
// geocoded property dropped through every level. Embedded in
// content/books/field-operations/territories-and-capacity.md.
import { sheet, el, widthOf } from "../kit.mjs";

// Plate 300 x 200; with a 90 step, a lower plate shows only local y > ~31,
// so every area sits in y 52..190.
const W = 300, D = 200, GAP = 90;
// The property's point, in plate coordinates; it lies in the right
// territory and in its lower leaf.
const PT = [212, 150];

// Area outlines. The branch area is split into two territories, and each
// territory into two leaves; a leaf's edge is its parent's where they meet.
const branch = "M24,58L150,52L276,68L284,182L140,190L18,180Z";
const left = "M24,58L150,52L140,190L18,180Z";
const right = "M150,52L276,68L284,182L140,190Z";
const leaves = [
  ["M24,58L150,52L145,121L21,118Z", "obj fill-2"],
  ["M21,118L145,121L140,190L18,180Z", "obj fill-2"],
  ["M150,52L276,68L280,124L145,121Z", "obj fill-2"],
  ["M145,121L280,124L284,182L140,190Z", "obj hl"], // covers the point
];

const layers = [
  {
    label: "01 · Branch service area",
    sub: "the whole map one branch serves",
    draw: (p) => [p.path(branch, "obj fill-2")],
  },
  {
    label: "02 · Territories",
    sub: "drawn areas with a priority",
    draw: (p) => [p.path(left, "obj fill-2"), p.path(right, "obj fill-1")],
  },
  {
    label: "03 · Leaf territories",
    sub: "linked by parent_id",
    draw: (p) => leaves.map(([d, cls]) => p.path(d, cls)),
  },
];

export default function draw() {
  const s = sheet({ prefix: "fo-tca", width: 760 });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "The point resolves to the leaf (accent) whose dated area covers it; parents follow parent_id."],
    [2, "Overlaps: Salesforce assigns the highest or lowest level by setting; priority breaks ties within a level."],
    [3, "Every area is versioned with valid_during, so a boundary moving on the 1st is known before it moves."],
    [0, "Not to scale. Levels separated along the stack axis; areas are schematic."],
  ], { width: 690 });

  // lift puts the point above the top plate's back edge, clear of its areas.
  const top = (layers.length - 1) * GAP, lift = 110;
  // Place the stack so the property callout sits 44 below the notes.
  const ptY = 0.17 * PT[0] + 0.47 * PT[1] - top - lift; // point height relative to ty
  const tx = 340, ty = ny + 44 + 24 - ptY;
  const labelX = 220;
  s.comment("Exploded view");
  const P = s.exploded({ tx, ty, w: W, d: D, gap: GAP, labelX, layers });

  // Territories carry the priority of note 2.
  const [, y2] = P(0, D, GAP);
  s.nb(labelX + 40, y2 - 9, 2);

  // The property: one point dropped through every level.
  s.comment("Property point");
  const [px, pTop] = P(...PT, top + lift);
  const [, pBot] = P(...PT, 0);
  s.line(px, pTop, px, pBot, "phantom");
  s.add(layers.map((_, i) => el("circle", { class: "dot", cx: px, cy: P(...PT, i * GAP)[1], r: 2.2 })));
  s.callout(px, pTop, px + 60, pTop - 24, "property", { sub: "one geocoded point" });
  s.nb(px + 60 + 14 + widthOf("property", "sl") + 12, pTop - 24, 1);

  const [left0] = P(0, D, 0);
  const [, yBot] = P(W, D, 0);
  const vy = yBot + 40;
  const vt = "Exploded view · territory levels";
  const vcx = (left0 + P(W, 0, 0)[0]) / 2;
  s.viewTitle(vcx, vy, vt, "Axonometric · not to scale · 01 at the bottom");
  s.nb(vcx + widthOf(vt, "vt") / 2 + 12, vy - 4, 3);
  s.height = Math.ceil(vy + 13 + 30);
  return s.toString();
}
