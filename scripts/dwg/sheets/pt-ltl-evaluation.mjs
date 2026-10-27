// Evaluating a rent increase against the rules as a pipeline: resolve the
// property's jurisdictions, select rule versions, check applicability,
// compute limits, constrain the offer, store the evaluation; missing facts
// block, and a figure not yet published makes the result provisional.
// Embedded in content/books/property-tech/landlord-tenant-law.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { head: "1 · resolve", label: "jurisdictions", sub: ["from the parcel,", "as of the date"] },
  { head: "2 · select", label: "rule versions", sub: ["by each rule's", "as-of date"] },
  { head: "3 · check", label: "applicability", sub: ["tenancy, increases,", "building, program"] },
  { head: "4 · compute", label: "limits", sub: ["maximum rent,", "notice deadline"] },
  { head: "5 · constrain", label: "the offer", sub: ["engine output capped,", "notice scheduled"] },
  { head: "6 · store", label: "evaluation", sub: ["versions, inputs,", "results, linked"] },
];

export default function draw() {
  const W = 760, w = 104, gap = 18;
  const x0 = W - 20 - (STAGES.length * w + (STAGES.length - 1) * gap);
  const s = sheet({ prefix: "pt-lte", width: W });

  s.comment("Pipeline");
  const { nodes, bottoms, bottom } = s.pipeline(x0, 40, STAGES, { w, h: 28, gap, hlArrows: true });
  const [, select, check, , , store] = nodes;

  s.comment("Missing facts block");
  const block = s.node(check.cx - 70, bottom + 30, 140, 28, "offer blocked", { fill: 1 });
  s.wire([[check.cx, bottoms[2] + 6], block.port("t")], { alt: true, label: "a fact missing", side: "right" });

  s.comment("Provisional: re-evaluate when the figure arrives");
  const ly = block.y2 + 30;
  s.wire([[store.cx, bottoms[5] + 6], [store.cx, ly], [select.cx, ly], [select.cx, bottoms[1] + 6]], {
    alt: true, seg: 1, side: "below",
    label: "figure not yet published: provisional, re-run when it arrives",
  });

  s.height = Math.ceil(ly + 30);
  return s.toString();
}
