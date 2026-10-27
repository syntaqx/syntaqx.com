// A visit's day as a state row: what moves each state above it, the path
// from dispatched to completed in the accent, dashed exits to not completed
// (whose work goes back to the pool) and to cancelled. Embedded in
// content/books/field-operations/dispatch.md.
import { sheet } from "../kit.mjs";

const STATES = [
  ["scheduled", "booked, windowed"],
  ["dispatched", "route published"],
  ["en route", "tap or geofence"],
  ["on site", "check-in or dwell"],
  ["completed", "proof captured"],
];

export default function draw() {
  const W = 760, w = 116, h = 30, gap = 30;
  const x0 = (W - (STATES.length * w + (STATES.length - 1) * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const s = sheet({ prefix: "fo-dv", width: W });
  const y0 = 44, bus = y0 + h + 30, y1 = bus + 30;

  s.comment("What moves each state");
  STATES.forEach(([, why], i) => s.text(X(i) + w / 2, y0 - 12, why, "sl", "middle"));

  s.comment("The day");
  const st = STATES.map(([l], i) => s.node(X(i), y0, w, h, l, { kind: "state", end: i === 4, hl: i === 4 }));
  st.slice(1).forEach((n, i) => s.connect(st[i], n, { hl: i > 0 }));

  s.comment("Ends without the work");
  const nc = s.node(st[2].cx - 75, y1, 150, h, "not completed", { kind: "state", end: true, fill: 1 });
  for (const n of [st[1], st[3]]) s.wire([n.port("b"), [n.cx, bus], [st[2].cx, bus]], { alt: true, arrow: "none" });
  s.connect(st[2], nc, { from: "b", to: "t", alt: true });
  const pool = s.node(X(4) + w - 160, y1, 160, h,"work order to pool", { kind: "store", fill: 1 });
  s.connect(nc, pool, { alt: true });
  s.text(nc.x, y1 + h + 18, "reason: not home, no access, weather, unsafe", "sl");

  s.comment("Cancelled");
  const cancelled = s.node(X(0), y1, w, h, "cancelled", { kind: "state", end: true, fill: 1 });
  s.connect(st[0], cancelled, { from: "b", to: "t", alt: true });

  const fy = y1 + h + 50;
  s.text(x0, fy, "running late is a flag on the visit, not a state: an ETA past the window end sends a notice", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
