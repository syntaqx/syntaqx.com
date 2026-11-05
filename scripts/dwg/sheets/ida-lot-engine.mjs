// The lot engine as a pipeline: inputs fan into five stages, the wash sale
// scan accented, and a dashed restatement edge back to the start.
// Embedded in content/books/investing-and-digital-assets/cost-basis-and-tax-lots.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { label: "open or adjust", sub: ["buys, events,", "transfers in"] },
  { label: "apply method", sub: ["FIFO default,", "standing orders"] },
  { label: "scan 30 days", sub: ["both ways,", "same account"], hl: true },
  { label: "adjust lots", sub: ["basis and", "holding period"] },
  { label: "closings", sub: ["proceeds, basis,", "term, wash loss"] },
];

export default function draw() {
  const W = 760,
    w = 116,
    gap = 22;
  const total = STAGES.length * w + (STAGES.length - 1) * gap;
  const x0 = W - 20 - total - 10; // the restatement channel takes the left slack
  const s = sheet({ prefix: "ile", width: W });

  s.comment("Inputs");
  const inputs = s.row(x0, 20, total, ["executions", "asset events", "transfers", "elections"], {
    h: 26,
    gap: 24,
    kind: "store",
  });

  s.comment("Pipeline");
  const top = 86;
  const { nodes, bottom } = s.pipeline(x0, top, STAGES, { w, h: 28, gap });
  s.fanIn(inputs, nodes[0], { from: "b", to: "t", via: 66 });

  s.comment("Restatement");
  const ly = bottom + 26;
  s.wire(
    [
      [nodes[4].cx, bottom + 6],
      [nodes[4].cx, ly],
      [x0 - 16, ly],
      [x0 - 16, nodes[0].cy],
      nodes[0].port("l"),
    ],
    {
      alt: true,
      seg: 1,
      side: "below",
      label: "issuer statement or late trade: replay from the earliest date it touches",
    },
  );

  s.height = Math.ceil(ly + 32);
  return s.toString();
}
