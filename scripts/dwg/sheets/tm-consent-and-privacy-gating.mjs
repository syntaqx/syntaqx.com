// Consent gates time: a first page view with four purpose lanes, then the
// lifetimes of an analytics identifier and of a refusal, and the variable
// table. Embedded in content/docs/telemetry/consent-and-privacy.md.
import { sheet, widthOf } from "../kit.mjs";

const W1 = 6; // s, illustrative wait for a choice
const BANNER_AT = 0.4; // s, banner shown
const VIEW = 8; // s, length of the page view drawn
const M1 = 13; // months, CNIL
const M2 = 6; // months, ICO

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "tm-cp", width: W });
  const CX = W / 2;
  const lx = 150; // lane labels end here

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative wait. Where consent is required, nothing non-exempt is stored or read before the choice (ICO)."],
    [2, "Refused in the banner; a Sec-GPC: 1 header also opts the device out of sale and sharing in California."],
    [3, "CNIL: audience measurement trackers exempt from consent live at most 13 months."],
    [4, "ICO: as a general guideline, about six months before asking someone who declined again."],
    [0, "Hatched = keep-out, nothing runs. The drawing carries codes; values are in the table."],
  ], { width: 690 });

  // ---- Plan view 1: first page view, 1 s = 60 px ----
  s.comment("Plan view: first page view");
  const k = 60;
  const x0 = lx + 24 + (W - 2 * 32 - lx - 24 - VIEW * k) / 2;
  const X = (t) => x0 + t * k;
  const h = 28, step = 42;
  const top = ny + 62;
  const lanes = ["banner", "necessary", "analytics", "advertising"];
  const ly = (i) => top + i * step;
  lanes.forEach((name, i) => s.text(x0 - 14, ly(i) + h / 2 + 3, name, "sl ink", "end"));

  s.rect(X(BANNER_AT), ly(0), X(W1) - X(BANNER_AT), h, "obj fill-2");
  s.label(X(BANNER_AT), ly(0), X(W1) - X(BANNER_AT), h, "consent banner");
  s.rect(X(0), ly(1), X(VIEW) - X(0), h, "obj fill-2");
  s.label(X(0), ly(1), X(VIEW) - X(0), h, "session, cart");
  s.rect(X(0), ly(2), X(W1) - X(0), h, "hatch", { fill: s.hatch });
  s.rect(X(0), ly(2), X(W1) - X(0), h, "slot");
  s.rect(X(W1), ly(2), X(VIEW) - X(W1), h, "obj fill-1");
  s.label(X(W1), ly(2), X(VIEW) - X(W1), h, "running");
  s.rect(X(0), ly(3), X(VIEW) - X(0), h, "hatch", { fill: s.hatch });
  s.rect(X(0), ly(3), X(VIEW) - X(0), h, "slot");
  s.nb(X(VIEW) + 14, ly(3) + h / 2, 2);

  // The choice: a centerline through every lane.
  s.line(X(W1), top - 8, X(W1), ly(3) + h + 8, "ctr");

  const wy = top - 24;
  s.dimH(X(0), X(W1), wy, "W1", { from: [ly(1), top - 8], hl: true });
  s.nb((X(0) + X(W1)) / 2 + 22, wy - 7.5, 1);

  const axY = ly(3) + h + 22;
  s.line(X(0), axY, X(VIEW), axY, "obj");
  for (let t = 0; t <= VIEW; t++) {
    s.line(X(t), axY - 4, X(t), axY + 4, "obj");
    s.text(X(t), axY + 15, String(t), "vs", "middle");
  }
  s.text(x0 - 14, axY + 15, "s", "vs", "end");
  s.viewTitle(CX, axY + 50, "Plan view · first page view", "Scale 1 s = 60 px · timeline");
  const v1Bottom = axY + 63;

  // ---- Plan view 2: lifetimes, 1 month = 36 px ----
  s.comment("Plan view: lifetimes");
  const km = 36;
  const m0 = x0;
  const Mx = (m) => m0 + m * km;
  const t2 = v1Bottom + 50;
  s.text(m0 - 14, t2 + h / 2 + 3, "identifier", "sl ink", "end");
  s.rect(Mx(0), t2, Mx(M1) - Mx(0), h, "obj fill-2");
  s.label(Mx(0), t2, Mx(M1) - Mx(0), h, "analytics identifier");
  const d1 = t2 + h + 20;
  s.dimH(Mx(0), Mx(M1), d1, "M1", { from: [t2 + h, t2 + h], below: true });
  s.nb((Mx(0) + Mx(M1)) / 2 + 22, d1 + 8.5, 3);

  const t3 = d1 + 34;
  s.text(m0 - 14, t3 + h / 2 + 3, "re-ask", "sl ink", "end");
  s.rect(Mx(0), t3, Mx(M2) - Mx(0), h, "obj fill-2");
  s.label(Mx(0), t3, Mx(M2) - Mx(0), h, "declined");
  const d2 = t3 + h + 20;
  s.dimH(Mx(0), Mx(M2), d2, "M2", { from: [t3 + h, t3 + h], below: true });
  s.nb((Mx(0) + Mx(M2)) / 2 + 22, d2 + 8.5, 4);

  s.viewTitle((Mx(0) + Mx(M1)) / 2, d2 + 50, "Plan view · lifetimes", "Scale 1 month = 36 px · timeline");
  const v2Bottom = d2 + 63;

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["W1", "wait for a choice, s: nothing non-exempt runs", W1.toFixed(2)],
    ["M1", "max lifetime of an exempt analytics tracker, months", M1.toFixed(2)],
    ["M2", "wait before asking a refuser again, months", M2.toFixed(2)],
  ];
  const tw = [0, 1, 2].reduce((sum, j) => sum + Math.max([30, 80, 60][j], Math.ceil(Math.max(...rows.map((r) => widthOf(r[j], "tc"))) + 14)), 0);
  const tb = s.table(CX - tw / 2, v2Bottom + 50, "Variables · W1 illustrative, M1 and M2 sourced", rows);
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
