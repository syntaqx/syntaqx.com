// An LLM call inside a product feature: versioned prompt, primary model,
// validation, result; a provider failure goes to a fallback model, and output
// that still fails validation goes to the feature's degraded mode.
// Embedded in content/docs/building-blocks/llm-features.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { head: "build", label: "prompt", sub: ["versioned,", "stable prefix first"] },
  { head: "call", label: "primary model", sub: ["streamed,", "with a deadline"] },
  { head: "check", label: "validate", sub: ["schema, refusal,", "truncation"] },
  { head: "use", label: "result", sub: ["with model and", "prompt version"], hl: true },
];

export default function draw() {
  const W = 760, w = 140, gap = 40;
  const total = STAGES.length * w + (STAGES.length - 1) * gap;
  const x0 = Math.round((W - total) / 2);
  const s = sheet({ prefix: "llm-fb", width: W });

  s.comment("Happy path");
  const { nodes, bottoms } = s.pipeline(x0, 40, STAGES, { w, h: 28, gap, hlArrows: [0, 1, 2] });
  const [, primary, validate, result] = nodes;

  s.comment("Exits");
  const rowY = Math.max(...bottoms) + 56;
  const fallback = s.node(primary.x, rowY, w, 40, "fallback model", { kind: "ghost", sub: "other provider or size" });
  const degraded = s.node(result.x, rowY, w, 40, "degraded mode", { end: true, sub: "works without AI" });

  s.wire([[primary.cx, bottoms[1] + 6], fallback.port("t")], {
    alt: true,
    label: "timeout, 429, 5xx",
    side: "right",
  });
  s.wire([fallback.port("r"), [validate.cx, fallback.cy], [validate.cx, bottoms[2] + 6]], {
    seg: 0,
    side: "above",
    label: "same checks",
  });
  s.wire([[validate.x2 - 20, bottoms[2] + 6], [validate.x2 - 20, rowY - 20], [degraded.cx, rowY - 20], degraded.port("t")], {
    alt: true,
    seg: 1,
    side: "above",
    label: "still invalid",
  });

  s.height = Math.ceil(fallback.y2 + 20);
  return s.toString();
}
