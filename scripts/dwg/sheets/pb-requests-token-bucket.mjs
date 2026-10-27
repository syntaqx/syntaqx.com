// Two rate limiters at the chapter's 5,000 requests per hour: a fixed
// window's boundary burst, a token bucket in section, its tokens over time,
// and the variable table. Embedded in content/docs/requests/rate-limiting.md.
import { sheet, widthOf } from "../kit.mjs";

const q = 5000; // requests per window
const w = 3600; // window, s
const BURST = 6; // min each side of the boundary, illustrative [1]
const C = 100; // bucket capacity, illustrative [2]
const r = q / w; // refill, per s
const T1 = C / r; // 72 s
const T0 = 10; // when the burst lands, s (illustrative timing)

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pb-rl", width: W });
  const CX = W / 2;
  const ah = `url(#${s.id("ah")})`;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative timing: a whole quota in the last 6 minutes of one window, another in the first 6 of the next."],
    [2, "C is illustrative; the refill rate spreads the chapter's 5,000 per hour evenly across the hour."],
    [3, "A full bucket passes a burst of C at once; after that, requests pass only as fast as tokens refill."],
    [4, "Each request spends one token; an empty bucket answers 429."],
    [0, "Quota and window from the chapter. Values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: fixed window, boundary burst, 1 min = 5 px ----
  s.comment("Plan view: fixed window, boundary burst");
  let planBottom;
  {
    const k = 5, win = (w / 60) * k;
    const x0 = CX - win, xb = CX, x2 = CX + win;
    const top = ny + 52, h = 36, bot = top + h;
    const bw = BURST * k;
    s.rect(x0, top, win - bw, h, "obj fill-2");
    s.rect(xb - bw, top, 2 * bw, h, "obj fill-1");
    s.rect(xb + bw, top, win - bw, h, "obj fill-2");
    s.label(x0, top, win - bw, h, "window 1");
    s.label(xb + bw, top, win - bw, h, "window 2");
    s.line(xb, top - 8, xb, bot + 12, "ctr");
    s.chainH([x0, xb, x2], top - 20, ["w", "w"], { from: [top, top, top] });
    s.dimH(xb - bw, xb + bw, bot + 22, "S1", { from: [bot, bot], below: true, hl: true });
    s.nb(xb + 22, bot + 30.5, 1);
    s.callout(xb - bw / 2, bot - 8, xb - bw - 40, bot + 24, "B1 inside S1", { dir: -1 });
    s.viewTitle(CX, bot + 72, "Plan view · fixed window, boundary burst", "Scale 1 min = 5 px · timeline · two windows of the chapter's limit");
    planBottom = bot + 85;
  }

  // ---- Section: token bucket, not to scale ----
  s.comment("Section: token bucket");
  const rowTop = planBottom + 64;
  let rowBottom;
  {
    const bx = 110, bw = 100, bh = 120, top = rowTop, bot = top + bh;
    s.rect(bx, top, bw, bh, "obj fill-2");
    s.rect(bx, top + bh / 2, bw, bh / 2, "obj fill-1");
    s.label(bx, top + bh / 2, bw, bh / 2, "tokens");
    const mx = bx + bw / 2;
    s.path(`M${mx},${top - 34}V${top - 4}`, "leader", { "marker-end": ah });
    s.text(mx + 8, top - 16, "r", "dt");
    s.dimV(top, bot, bx + bw + 22, "C", { from: [bx + bw, bx + bw], side: "r" });
    s.nb(bx + bw + 46, top + bh / 2, 2);
    s.path(`M${mx},${bot + 4}V${bot + 34}`, "leader", { "marker-end": ah });
    s.text(mx + 8, bot + 22, "1 per request", "sl ink");
    s.nb(mx + 8 + widthOf("1 per request", "sl") + 12, bot + 19, 4);
    rowBottom = bot + 34;
    s.viewTitle(mx + 20, rowBottom + 40, "Section · token bucket", "Not to scale");
  }

  // ---- Plan view: tokens over time, 1 s = 2.5 px ----
  s.comment("Plan view: tokens over time");
  {
    const kx = 2.5, ky = 1.2;
    const x0 = 410, y0 = rowTop + C * ky; // origin: t = 0, 0 tokens
    const X = (t) => x0 + t * kx, Y = (n) => y0 - n * ky;
    const tEnd = 120;
    s.path(`M${X(0)},${Y(C) - 10}V${y0}H${X(tEnd) + 10}`, "leader");
    s.text(X(0) - 6, Y(C) + 3.5, "C", "dt", "end");
    s.text(X(0) - 6, y0 + 3.5, "0", "dt", "end");
    s.text(X(tEnd) + 14, y0 + 3.5, "t", "dt");
    s.path(`M${X(0)},${Y(C)}H${X(T0)}V${y0}L${X(T0 + T1)},${Y(C)}H${X(tEnd)}`, "obj");
    s.callout(X(T0), Y(C * 0.6), X(T0) + 26, Y(C * 0.8), "burst");
    s.nb(X(T0) + 26 + 14 + widthOf("burst", "sl") + 12, Y(C * 0.8), 3);
    const mt = T0 + T1 * 0.55;
    s.callout(X(mt), Y(r * (mt - T0)), X(mt) + 30, Y(r * (mt - T0)) + 28, "refill");
    s.dimH(X(T0), X(T0 + T1), y0 + 20, "T1", { from: [y0, y0], below: true });
    s.viewTitle(X(tEnd / 2), rowBottom + 40, "Plan view · tokens over time", "Scale 1 s = 2.5 px · a burst, then the refill");
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const n = (v) => v.toLocaleString("en-US");
  const rows = [
    ["q", "requests allowed per window, per client", n(q)],
    ["w", "window length", `${n(w)} s`],
    ["S1", "span of the two bursts across the boundary", `${BURST} + ${BURST} = ${2 * BURST} min`],
    ["B1", "a fixed window lets through inside S1", `q + q = ${n(2 * q)}`],
    ["C", "bucket capacity, the largest burst", String(C)],
    ["r", "refill rate", `q ÷ w = ${r.toFixed(2)} / s`],
    ["T1", "time to refill an empty bucket", `C ÷ r = ${T1} s`],
    ["N1", "most a token bucket lets through in any hour", `C + r × w = ${n(C + q)}`],
  ];
  const widths = [32, 250, 150];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(CX - tw / 2, rowBottom + 53 + 48, "Variables", rows, { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
