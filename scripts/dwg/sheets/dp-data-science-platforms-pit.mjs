// One training row's point-in-time feature join on an event-time axis.
// Embedded in content/docs/data/data-science-platforms.md.
import { sheet, widthOf } from "../kit.mjs";

// Illustrative event times, hours of the day [1].
const A0 = 4, A1 = 18; // axis
const V1 = 5, U2 = 11, U3 = 16; // v1 from, v2 written, v3 written
const T0 = 14, K1 = 8;
const G1 = T0 - U2; // 3
const hh = (h) => `${String(h).padStart(2, "0")}:00`;

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "dp-ds", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative times. Feast scans back from each row's timestamp up to the TTL, never forward."],
    [2, "What happened at T0: a chargeback, a cancellation, a no-show. Features are as served then."],
    [3, "Written after T0: joining it leaks the future into training. Online, the model never sees it."],
    [0, "Event time in hours. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: 1 h = 40 px ----
  s.comment("Plan view: one training row");
  const k = 40;
  const x0 = CX - ((A1 - A0) * k) / 2 + 20;
  const X = (h) => x0 + (h - A0) * k;
  const kY = ny + 34, gY = kY + 24;
  const top = gY + 22, h = 36, bot = top + h;
  const lY = bot + 40;
  const aY = lY + 36;

  // T0: the label event; its centerline is the extension line for K1 and G1.
  s.line(X(T0), kY - 10, X(T0), aY - 8, "ctr");

  s.dimH(X(T0 - K1), X(T0), kY, "K1", { from: [top, null] });
  s.dimH(X(U2), X(T0), gY, "G1", { from: [top, null], hl: true });

  // Feature values over time; the one the join picks in accent.
  s.text(X(V1) - 10, top + h / 2 + 3, "feature", "sl ink", "end");
  s.rect(X(V1), top, (U2 - V1) * k, h, "obj fill-2");
  s.rect(X(U2), top, (U3 - U2) * k, h, "obj hl");
  s.rect(X(U3), top, (A1 - U3) * k, h, "hatch", { fill: s.hatch });
  s.label(X(V1), top, (U2 - V1) * k, h, "v1");
  s.label(X(U2), top, (T0 - U2) * k, h, "v2 used");
  const v3x = X((U3 + A1) / 2) - 8;
  s.text(v3x, top + h / 2 + 3, "v3", "sl ink ko", "middle");
  s.nb(v3x + 20, top + h / 2, 3);

  // Write times under the bar.
  s.text(X(U2), bot + 14, "U2", "dt", "middle");
  s.text(X(U3), bot + 14, "U3", "dt", "middle");

  // Label event.
  s.text(X(V1) - 10, lY + 3, "label", "sl ink", "end");
  s.add(`<circle class="dot" cx="${X(T0)}" cy="${lY}" r="2.6"/>`);
  s.callout(X(T0), lY, X(T0) + 14, lY + 12, "label event T0");
  const lx = X(T0) + 28 + widthOf("label event T0", "sl");
  s.nb(lx + 10, lY + 12, 2);

  // Axis: event time.
  s.line(X(A0), aY, X(A1), aY, "obj");
  for (let t = A0; t <= A1; t += 2) {
    s.line(X(t), aY - 4, X(t), aY + 4, "obj");
    s.text(X(t), aY + 16, hh(t), "tc", "middle");
  }

  s.viewTitle(CX, aY + 58, "Plan view · one training row", "Scale 1 h = 40 px · event time · illustrative");
  const viewBottom = aY + 58 + 13;

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["T0", "label event time", hh(T0)],
    ["K1", "feature TTL, chosen", `${K1} h`],
    ["U2", "v2 written", hh(U2)],
    ["G1", "feature age, within K1", `T0 − U2 = ${G1} h`],
    ["U3", "v3 written, after T0", hh(U3)],
  ];
  const ws = [40, 200, 120];
  const tx = CX - ws.reduce((a, b) => a + b, 0) / 2;
  const tb = s.table(tx, viewBottom + 52, "Variables · hours", rows, { widths: ws });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
