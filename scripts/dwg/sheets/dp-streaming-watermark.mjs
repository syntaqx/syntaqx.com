// An event-time axis with a tumbling window, the watermark trailing the
// newest event by the chosen delay, and a late event for the closed window.
// Embedded in content/docs/data/streaming.md (watermarks).
import { sheet } from "../kit.mjs";

// Minutes after 12:00, from Spark's watermark example [1].
const W1 = 10; // window length, tumbling
const E1 = 21; // newest event time seen
const D1 = 10; // watermark delay, chosen
const M1 = E1 - D1; // 11
const LATE = 4; // late event's timestamp
const EVENTS = [2, 6, 9, 13, 15, 18, E1];
const AXIS = 25;
const hhmm = (m) => `12:${String(m).padStart(2, "0")}`;

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "dp-st", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, `Values from Spark's watermark example: a ${D1}-minute delay, newest event ${hhmm(E1)}, watermark ${hhmm(M1)}.`],
    [2, `Stamped ${hhmm(LATE)}, it arrives after M1 passed ${hhmm(W1)}: dropped, or sent to a side output.`],
    [3, "Once M1 passes a window's end, the window is emitted and its state cleared."],
    [0, "Times are event time. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: event-time axis, 1 min = 24 px ----
  s.comment("Plan view: event-time axis");
  const k = 24;
  const x0 = CX - (AXIS * k) / 2;
  const X = (m) => x0 + m * k;
  const dimY = ny + 52;
  const top = dimY + 22, h = 40, bot = top + h;
  const evY = bot + 18, axY = evY + 20;

  // Windows: the closed one and the one still open.
  s.rect(X(0), top, W1 * k, h, "obj fill-1");
  s.rect(X(W1), top, W1 * k, h, "obj fill-2");
  s.label(X(0), top, W1 * k, h, "closed window");
  s.nb(X(W1 / 2) + 50, top + h / 2, 3);
  s.label(X(W1), top, W1 * k, h, "open window");

  // Watermark: its centerline doubles as the extension line for D1.
  s.line(X(M1), dimY - 16, X(M1), axY + 6, "ctr");
  s.text(X(M1), dimY - 22, "M1 · watermark", "sl ink", "middle");

  // Dimensions: the window and the delay (the subject).
  s.dimH(X(0), X(W1), dimY, "W1", { from: [top, top] });
  s.dimH(X(M1), X(E1), dimY, "D1", { from: [null, evY], hl: true });
  s.nb((X(M1) + X(E1)) / 2 + 20, dimY - 7.5, 1);

  // Events by event time; the open circle is the late one.
  for (const m of EVENTS) s.add(`<circle class="dot" cx="${X(m)}" cy="${evY}" r="2.2"/>`);
  s.add(`<circle class="obj" cx="${X(LATE)}" cy="${evY}" r="3.5"/>`);

  // Axis with ticks every 5 minutes.
  s.line(X(0), axY, X(AXIS), axY, "leader");
  for (let m = 0; m <= AXIS; m += 5) {
    s.line(X(m), axY - 4, X(m), axY + 4, "leader");
    s.text(X(m), axY + 16, hhmm(m), "tc", "middle");
  }

  // Callouts below the axis.
  const cy = axY + 38;
  s.add(`<path class="leader" d="M${X(LATE)},${evY + 3.5}V${cy}H${X(LATE) + 10}"/>`);
  s.text(X(LATE) + 14, cy + 3, "late event", "sl ink");
  s.nb(X(LATE) + 80, cy, 2);
  s.add(`<path class="leader" d="M${X(E1)},${evY + 2.2}V${cy}H${X(E1) - 10}"/>`);
  s.text(X(E1) - 14, cy + 3, "E1 · newest event", "sl ink", "end");
  s.text(X(AXIS), cy + 3, "event time", "sl", "end");

  const vy = cy + 46;
  s.viewTitle(CX, vy, "Plan view · event-time axis", "Scale 1 min = 24 px · timeline · event time");

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["W1", "window length, tumbling", `${W1} min`],
    ["E1", "newest event time seen", hhmm(E1)],
    ["D1", "watermark delay, chosen", `${D1} min`],
    ["M1", "watermark", `E1 − D1 = ${hhmm(M1)}`],
  ];
  const widths = [50, 170, 130];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(CX - tw / 2, vy + 52, "Variables · event time", rows, { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
