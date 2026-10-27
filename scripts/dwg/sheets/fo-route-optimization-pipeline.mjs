// The route optimization pipeline as a standard diagram: snapshot, travel
// matrix, async solve, candidate plan, version gate, commit; unassigned work
// to a pool, stale results back to a new snapshot. Embedded in
// content/books/field-operations/route-optimization.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { head: "build", label: "snapshot", sub: ["visits, shifts,", "pins, version"] },
  { head: "engine", label: "travel matrix", sub: ["open-source engine", "or vendor API"] },
  { head: "solver", label: "async job", sub: ["time limit,", "poll or webhook"] },
  { head: "result", label: "candidate", sub: ["routes, ETAs,", "unassigned"] },
  { head: "gate", label: "version check", sub: ["versions match?", "diff reviewed?"], hl: true },
  { head: "commit", label: "apply", sub: ["one transaction,", "run id on stops"], hl: true },
];

export default function draw() {
  const W = 760, w = 100, gap = 16;
  const x0 = W - 30 - (STAGES.length * w + (STAGES.length - 1) * gap); // the stale loop's channel takes the left margin
  const s = sheet({ prefix: "fo-ro", width: W });

  s.comment("Pipeline");
  const { nodes, bottom } = s.pipeline(x0, 40, STAGES, { w, h: 28, gap });
  const [snapshot, , , candidate, gate] = nodes;

  s.comment("Unassigned work");
  const pool = s.node(candidate.cx - 60, bottom + 34, 120, 26, "pool + reasons", { kind: "store", fill: 1 });
  s.wire([[candidate.cx, bottom + 6], pool.port("t")]);

  s.comment("Stale: discard and rebuild");
  const ly = pool.y + pool.h + 26;
  s.wire([[gate.cx, bottom + 6], [gate.cx, ly], [x0 - 16, ly], [x0 - 16, snapshot.cy], snapshot.port("l")], {
    alt: true,
    seg: 1,
    side: "below",
    label: "a version changed while it ran: discard the result, re-solve from a new snapshot",
  });

  s.height = Math.ceil(ly + 32);
  return s.toString();
}
