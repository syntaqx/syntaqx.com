// The address pipeline as a standard diagram: typed input, standardize,
// validate, geocode, property key; a failed validation or a low-precision
// geocode goes to review. No vendor or agency product names on the drawing
// (the alt text names them). Embedded in
// content/books/field-operations/customers-and-properties.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { head: "input", label: "address as typed", sub: ["free text, any case"] },
  { head: "postal form", label: "standardize", sub: ["standard form, ZIP+4"] },
  { head: "deliverable?", label: "validate", sub: ["Y, S, D or N,", "residential flag"] },
  { head: "where", label: "geocode", sub: ["rooftop or ZIP"] },
  { head: "which property", label: "property key", sub: ["vendor or parcel ID"], hl: true },
];

export default function draw() {
  const W = 760, n = STAGES.length, w = 124, gap = (W - 40 - n * w) / (n - 1);
  const s = sheet({ prefix: "fo-cpa", width: W });

  s.comment("Pipeline");
  const { nodes, bottom } = s.pipeline(20, 40, STAGES, { w, h: 28, gap });
  const [, , validate, geocode] = nodes;

  s.comment("Failure: review");
  const ry = bottom + 34;
  const review = s.node(validate.x, ry, geocode.x + w - validate.x, 28, "no match or low precision: review", { kind: "ghost" });
  // Each drop starts under its own sub text, not the pipeline's lowest.
  for (const i of [2, 3]) {
    const nd = nodes[i];
    const top = nd.y + nd.h + 16 + (STAGES[i].sub.length - 1) * 11.5 + 10;
    s.wire([[nd.cx, top], [nd.cx, ry]], { alt: true });
  }

  const fy = ry + 28 + 30;
  s.text(W - 20, fy, "keep the raw input, the result, and which vendor version produced it", "sl", "end");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
