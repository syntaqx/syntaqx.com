// From code to live payments as a pipeline: what each certification stage
// proves under it, production in the accent, and the dashed recertification
// loop back over the top. Network program names stay in the alt text.
// Embedded in content/books/payments/network-certification.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { label: "your tests", sub: ["unit tests,", "contract tests per", "certification script"] },
  { label: "processor", sub: ["the test plan on", "its test host,", "field by field"] },
  { label: "network, EMV", sub: ["host: interface and", "chip data tests;", "terminals: Level 3"] },
  { label: "pilot", sub: ["a few merchants,", "real cards,", "watched closely"] },
  { label: "production", sub: ["credentials earned", "for what was", "certified, no more"], hl: true },
];

export default function draw() {
  const W = 760, w = 128, gap = 20, y = 80;
  const s = sheet({ prefix: "cp", width: W });
  const x0 = (W - (STAGES.length * w + (STAGES.length - 1) * gap)) / 2;

  s.comment("Stages");
  const { nodes, bottom } = s.pipeline(x0, y, STAGES, { w, h: 30, gap });
  const [, processor, , , production] = nodes;

  s.comment("Recertification, back over the top");
  s.connect(production, processor, {
    from: "t",
    to: "t",
    via: y - 22,
    alt: true,
    seg: 1,
    label: "recertify: an April or October network release,\na new terminal or kernel, a new transaction type or message field",
  });

  s.height = Math.ceil(bottom + 20);
  return s.toString();
}
