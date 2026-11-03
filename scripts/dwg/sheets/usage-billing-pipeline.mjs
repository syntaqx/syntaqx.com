// The usage billing pipeline as a standard diagram: meter events, the raw
// event store, aggregation, rating, credits and commitments, invoice lines;
// disputes and corrections go back to the raw events. Embedded in
// content/docs/money/usage-based-billing.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { head: "emit", label: "meter event", sub: ["id, customer,", "meter, event time"] },
  { head: "keep", label: "raw events", sub: ["deduped by id,", "append-only"], hl: true },
  { head: "aggregate", label: "usage", sub: ["sum, max, unique,", "last per period"] },
  { head: "rate", label: "amount", sub: ["price version:", "unit, tier, package"] },
  { head: "apply", label: "balances", sub: ["credits, commits,", "ledger entries"] },
  { head: "bill", label: "invoice lines", sub: ["quantity, price,", "evidence query"] },
];

export default function draw() {
  const W = 760,
    w = 100,
    gap = 16;
  const x0 = (W - (STAGES.length * w + (STAGES.length - 1) * gap)) / 2;
  const s = sheet({ prefix: "ubp", width: W });

  s.comment("Pipeline");
  const { nodes, bottom } = s.pipeline(x0, 40, STAGES, { w, h: 28, gap, hlArrows: [0] });
  const raw = nodes[1];
  const invoice = nodes[5];

  s.comment("Disputes and corrections recompute from the raw events");
  const ly = bottom + 30;
  s.wire(
    [
      [invoice.cx, bottom + 6],
      [invoice.cx, ly],
      [raw.cx, ly],
      [raw.cx, bottom + 6],
    ],
    {
      alt: true,
      seg: 1,
      side: "below",
      label: "dispute or late event: recompute from raw events, adjust the open period",
    },
  );

  s.height = Math.ceil(ly + 32);
  return s.toString();
}
