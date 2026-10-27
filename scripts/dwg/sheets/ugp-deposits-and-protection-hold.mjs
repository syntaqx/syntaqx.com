// A rental deposit's clock as a dimensional sheet: the hold the business
// needs (lead, trip, release window), one card authorization's validity
// against it, and the extension when a claim is filed, with the variable
// table. Embedded in
// content/books/user-generated-platforms/deposits-and-protection.md.
import { sheet, widthOf } from "../kit.mjs";

// Values from the chapter (Security Deposit Holds). The trip is its example.
const L1 = 2; // hold placed before the trip, days
const T1 = 7; // example trip, days
const R1 = 7; // released after the trip ends without a claim, days
const A1 = 7; // online, customer-initiated authorization, days (generally)
const E1 = 30; // furthest extension with a claim, days from the trip's end

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-dp", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "The business clock: placed before pickup, released on schedule after return unless a claim is filed."],
    [2, "The card clock: one authorization lapses first, so a deposit is a sequence of authorizations."],
    [3, "A claim extends the hold; a declined re-authorization becomes a task and a notice, not a silent gap."],
    [0, "Days from the trip's start. The trip length is an example. Codes on the drawing; values in the table."],
  ], { width: 690 });

  // ---- Plan view: 1 day = 30 px to the break ----
  s.comment("Plan view: three clocks on one booking");
  const k = 30, x0 = 170;
  const X = (d) => x0 + (d + L1) * k;
  const end = T1, rel = T1 + R1;
  const brk0 = X(rel) + 12, brk1 = brk0 + 14;
  const xEnd = brk1 + 50; // end + E1, past the break
  const axY = ny + 46, h = 24, laneX = x0 - 14;

  const ticks = [[X(-L1), "−2"], [X(0), "start"], [X(end), "end"], [X(rel), "end + 7"], [xEnd, "end + 30"]];
  const tl = s.timeline({ x1: X(-L1), x2: xEnd, y: axY, breaks: [[brk0, brk1]], ticks, laneX, h });

  s.comment("The hold the business needs");
  const y1 = axY + 26;
  tl.lane(y1, "deposit hold");
  tl.bar(y1, X(-L1), X(0), "obj fill-2", "lead");
  tl.bar(y1, X(0), X(end), "obj fill-1", "trip");
  tl.bar(y1, X(end), X(rel), "obj fill-2", "release window");
  const c1 = y1 + h + 18;
  s.chainH([X(-L1), X(0), X(end), X(rel)], c1, ["L1", "T1", "R1"], { from: [y1 + h, y1 + h, y1 + h, y1 + h], below: true });
  s.dimH(X(-L1), X(rel), c1 + 24, "H1", { from: [c1, c1], below: true, hl: true });
  s.nb(X(rel) + 14, y1 + h / 2, 1);

  s.comment("One card authorization");
  const y2 = c1 + 64;
  tl.lane(y2, "authorization");
  tl.bar(y2, X(-L1), X(-L1 + A1), "obj fill-1", "one authorization");
  tl.bar(y2, X(-L1 + A1), X(rel), "slot", "re-authorize or extend");
  s.dimH(X(-L1), X(-L1 + A1), y2 + h + 18, "A1", { from: [y2 + h, y2 + h], below: true });
  s.nb(X(rel) + 14, y2 + h / 2, 2);

  s.comment("With a claim");
  const y3 = y2 + h + 50;
  tl.lane(y3, "with a claim");
  tl.bar(y3, X(-L1), xEnd, "obj fill-2", "held for the claim");
  s.dimH(X(end), xEnd, y3 + h + 18, "E1", { from: [y3 + h, y3 + h], below: true });
  s.nb(xEnd + 14, y3 + h / 2, 3);

  const vy = y3 + h + 66;
  s.viewTitle((laneX - widthOf("authorization", "sl") + xEnd + 20) / 2, vy, "Plan view · one deposit on one booking", `Scale 1 day = ${k} px to the break · not to scale after it`);

  s.comment("Variable table");
  const rows = [
    ["L1", "hold placed before the trip", `${L1} days`],
    ["T1", "the trip (example)", `${T1} days`],
    ["R1", "released after the trip ends, no claim", `${R1} days`],
    ["H1", "hold the business needs", `L1+T1+R1 = ${L1 + T1 + R1} days`],
    ["A1", "online customer-initiated authorization", `about ${A1} days`],
    ["E1", "furthest hold with a claim, from the trip's end", `${E1} days`],
  ];
  const widths = [40, 300, 150];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(W / 2 - tw / 2, vy + 52, "Variables · days", rows, { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
