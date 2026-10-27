// A repair job's lifecycle as a standard diagram: call to closed along the
// accented path, the first visit as a group, dashed branches to declined,
// part ordered (then a return visit back to repair) and a warranty claim
// after close. Embedded in content/books/field-operations/repair-and-installation.md.
import { sheet } from "../kit.mjs";

const MAIN = ["call", "triage", "diagnose", "quote", "approved", "repair", "closed"];

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "fo-ril", width: W });

  const w = 84, h = 26, gap = 22, pad = 10;
  const x0 = 20;
  const X = (i) => x0 + i * (w + gap);
  const r1 = 50, r2 = r1 + h + 44, r3 = r2 + h + 40;

  s.comment("The first visit, and the heads either side");
  s.group(X(2) - pad, r1 - pad, 4 * w + 3 * gap + 2 * pad, h + 2 * pad, "the first visit");
  s.text(X(0), r1 - pad - 7, "the call", "lt");
  s.text(X(6), r1 - pad - 7, "office", "lt");

  s.comment("Main path");
  const main = MAIN.map((t, i) => s.node(X(i), r1, w, h, t, { hl: t === "approved", end: t === "closed" }));
  main.slice(1).forEach((n, i) => s.connect(main[i], n, { hl: true }));
  const [, triage, , quote, approved, repair, closed] = main;

  s.comment("What triage reads");
  ["triage reads: problem,", "asset, warranty,", "membership, priority"].forEach((t, i) => s.text(triage.cx, r1 + h + pad + 18 + i * 12, t, "sl", "middle"));

  s.comment("Declined: the diagnostic fee only");
  const note = (n, t) => s.text(n.cx, n.y + n.h + 16, t, "sl", "middle");
  const declined = s.node(quote.x, r2, w, h, "declined", { end: true, fill: 1 });
  s.connect(quote, declined, { from: "b", to: "t", alt: true });
  note(declined, "fee only");

  s.comment("Part on order: a return visit on the same work order");
  const part = s.node(approved.x, r2, w, h, "part ordered", { fill: 1 });
  s.connect(approved, part, { from: "b", to: "t", alt: true });
  note(part, "order on hold");
  const ret = s.node(repair.x, r2, w, h, "return visit");
  s.connect(part, ret);
  s.connect(ret, repair, { from: "t", to: "b" });
  note(ret, "same work order");

  s.comment("Warranty claim after close");
  const claim = s.node(closed.x, r2, w, h, "claim filed");
  s.connect(closed, claim, { from: "b", to: "t", alt: true });
  const credited = s.node(closed.x, r3, w, h, "credited", { end: true });
  s.connect(claim, credited, { from: "b", to: "t" });
  s.text(closed.x + w, credited.y + h + 16, "parts, sometimes labor", "sl", "end");

  s.comment("Legend and footer");
  const ly = r3 + 8;
  s.legend(x0, ly, [
    { kind: "hl", label: "the job's path" },
    { kind: "alt", label: "branch off it" },
    { kind: "end", label: "ends the work order" },
  ], { width: 500 });
  const fy = credited.y + h + 44;
  s.text(x0, fy, "the work order holds the problem and the money; each trip is a visit", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
