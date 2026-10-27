// One property's cutover to a new platform as a pipeline: crosswalk the
// identifiers, close the month in the old system, load open items with side
// effects off, prove the tie-outs, go live; a difference becomes a
// reconciling item, and one system holds the lease and ledger each day.
// Embedded in content/books/property-tech/switching-platforms.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { head: "map", label: "crosswalk", sub: ["every identifier,", "matched once"] },
  { head: "last month", label: "close", sub: ["statements, fee run,", "trust reconciliation"] },
  { head: "load", label: "open items", sub: ["side effects off,", "migration actor"] },
  { head: "gate", label: "tie-outs", sub: ["receivables, deposits,", "prepaid, trust, trial", "balance all agree"], hl: true },
  { head: "cut over", label: "go live", sub: ["side effects on,", "rent posts on the 1st"] },
];

export default function draw() {
  const W = 760, w = 128, gap = 20;
  const x0 = (W - (STAGES.length * w + (STAGES.length - 1) * gap)) / 2;
  const s = sheet({ prefix: "pt-spc", width: W });

  s.comment("Pipeline");
  const { nodes, bottoms, bottom } = s.pipeline(x0, 40, STAGES, { w, h: 28, gap });
  const [first, , , gate, live] = nodes;

  s.comment("A difference");
  const rw = 220;
  const recon = s.node(gate.cx - rw / 2, bottom + 34, rw, 44, "reconciling item", { sub: ["an owner and a deadline;", "never plugged to suspense"] });
  s.wire([[gate.cx, bottoms[3] + 6], recon.port("t")], { alt: true, label: "difference", side: "left" });

  s.comment("One system of record per property per day");
  const sy = recon.y2 + 24;
  s.span(first.x, gate.x2, sy, "old system holds the lease and ledger");
  s.span(live.x, live.x2, sy, "new system");

  s.height = Math.ceil(sy + 32);
  return s.toString();
}
