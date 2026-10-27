// Two booking screens for the same customer and week, drawn as wireframes:
// an open calendar where every window looks equal, and a route-aware list
// of a few recommended windows, best first (the accent). Illustrative copy.
// Embedded in content/books/field-operations/booking-appointments.md.
import { sheet } from "../kit.mjs";

const DAYS = ["Mon 2", "Tue 3", "Wed 4", "Thu 5", "Fri 6"];
const WINDOWS = ["8-10", "10-12", "12-2", "2-4"];
const FULL = new Set(["1,1", "3,3"]); // [day, window] taken
const CARDS = [
  { when: "Tue Nov 3, 10-12", note: "on your street that morning", badge: "technician nearby", hl: true },
  { when: "Wed Nov 4, 8-10", note: "two streets over that morning", badge: "technician nearby" },
  { when: "Thu Nov 5, 8-12", note: "a wider window, so the route can fit you", badge: "$15 off" },
];

export default function draw() {
  const W = 760, x = 20, between = 30, pad = 14, gy = 40, gh = 300;
  const gw = (W - 2 * x - between) / 2, iw = gw - 2 * pad;
  const s = sheet({ prefix: "fo-bao", width: W });

  // Shared screen parts: heading, a line under it, the Continue button.
  const screen = (gx, title, heading, sub, hl) => {
    s.group(gx, gy, gw, gh, title, { hl });
    s.text(gx + pad, gy + 24, heading, "tc");
    s.text(gx + pad, gy + 38, sub, "sl");
    s.node(gx + pad, gy + gh - pad - 28, iw, 28, "continue", { fill: 1 });
  };

  s.comment("a. Open calendar");
  const ax = x;
  screen(ax, "a. open calendar", "Pick a time", "any technician, any open time");
  const cw = 56, cgap = (iw - 5 * cw) / 4, ch = 26, rgap = 6, top = gy + 70;
  DAYS.forEach((d, i) => {
    const cx = ax + pad + i * (cw + cgap);
    s.text(cx + cw / 2, top - 8, d, "tc", "middle");
    WINDOWS.forEach((wnd, j) => {
      const full = FULL.has(`${i},${j}`);
      s.node(cx, top + j * (ch + rgap), cw, ch, full ? "full" : wnd, { code: !full, kind: full ? "ghost" : "process" });
    });
  });
  s.text(ax + pad, top + 4 * (ch + rgap) + 16, "18 open windows, all equal", "sl");

  s.comment("b. Route-aware");
  const bx = x + gw + between;
  screen(bx, "b. route-aware", "Recommended times", "where a technician is already nearby", true);
  const cardH = 48, cardGap = 8, ctop = gy + 52;
  CARDS.forEach((c, i) => {
    const cy = ctop + i * (cardH + cardGap);
    s.rect(bx + pad, cy, iw, cardH, c.hl ? "obj hl" : "obj fill-2");
    s.text(bx + pad + 12, cy + 19, c.when, c.hl ? "tc hl" : "tc");
    s.text(bx + pad + 12, cy + 36, c.note, "sl");
    const bw = c.badge.startsWith("$") ? 60 : 112;
    s.node(bx + pad + iw - 10 - bw, cy + 8, bw, 16, c.badge, { kind: "state", code: true, hl: c.hl, fill: 1 });
  });
  s.text(bx + pad, ctop + 3 * (cardH + cardGap) + 14, "See more times", "tc hl");

  const fy = gy + gh + 26;
  s.text(x, fy, "illustrative screens: the same customer and the same week, offered two ways", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
