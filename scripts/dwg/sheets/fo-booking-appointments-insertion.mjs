// Insertion cost as a standard diagram: the same new visit inserted where
// a route already is (left, the accent) and across town (right). Each panel
// shows the leg it replaces (dashed) and the two legs that replace it, then
// what it adds. Illustrative numbers. Embedded in
// content/books/field-operations/booking-appointments.md.
import { sheet } from "../kit.mjs";

const PANELS = [
  {
    title: "tuesday 10-12: Bob is nearby",
    from: "prev stop",
    to: "next stop",
    replaced: "6 min, 2.5 mi",
    legs: ["4 min, 1.5 mi", "5 min, 2.0 mi"],
    rows: [["added", "3 min, 1.0 mi"], ["cost", "$2.25 + $0.76 = $3.01"], ["day", "+63 min, 60 of them on site"]],
    hl: true,
  },
  {
    title: "thursday 8-10: across town",
    from: "home",
    to: "first stop",
    replaced: "12 min, 7 mi",
    legs: ["36 min, 23 mi", "36 min, 23 mi"],
    rows: [["added", "60 min, 39 mi"], ["cost", "$45.00 + $29.64 = $74.64"], ["day", "7.0 h to 9.0 h, 1 h overtime"]],
  },
];

export default function draw() {
  const W = 760, x = 20, between = 30, pad = 16, h = 26, sw = 76, nw = 50;
  const gw = (W - 2 * x - between) / 2, gy = 40;
  const r1 = gy + 26, r2 = r1 + h + 42, gh = r2 + h + 30 - gy;
  const s = sheet({ prefix: "fo-bam", width: W });

  PANELS.forEach((p, i) => {
    const gx = x + i * (gw + between);
    s.comment(p.title);
    s.group(gx, gy, gw, gh, p.title, { hl: p.hl });

    const a = s.node(gx + pad, r1, sw, h, p.from);
    const b = s.node(gx + gw - pad - sw, r1, sw, h, p.to);
    const n = s.node(gx + gw / 2 - nw / 2, r2, nw, h, "new", { hl: p.hl, fill: 1 });

    s.comment("The leg it replaces");
    s.wire([a.port("r"), b.port("l")], { alt: true });
    s.text((a.x + a.w + b.x) / 2, r1 + h / 2 - 6, p.replaced, "tc", "middle");
    s.text((a.x + a.w + b.x) / 2, r1 + h / 2 + 14, "(replaced)", "sl", "middle");

    s.comment("The two legs that replace it");
    s.wire([a.port("b"), [a.cx, n.cy], n.port("l")], { hl: p.hl });
    s.wire([n.port("r"), [b.cx, n.cy], b.port("b")], { hl: p.hl });
    s.text((a.cx + n.x) / 2, n.cy + 16, p.legs[0], p.hl ? "tc hl" : "tc", "middle");
    s.text((n.x + n.w + b.cx) / 2, n.cy + 16, p.legs[1], p.hl ? "tc hl" : "tc", "middle");

    s.comment("What it adds");
    p.rows.forEach(([k, v], j) => {
      const y = gy + gh + 26 + j * 17;
      s.text(gx, y, k, "th");
      s.text(gx + 50, y, v, p.hl && k === "cost" ? "tc hl" : "tc");
    });
  });

  const fy = gy + gh + 26 + 2 * 17 + 30;
  s.text(x, fy, "illustrative: added = prev to new + new to next - prev to next; $0.75/min labor, $0.76/mi", "tc");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
