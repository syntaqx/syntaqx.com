// The life of an assisted living care fee: assessment and service plan on
// the clinical side, a staff acceptance as the seam, an effective-dated
// charge on the commercial side, and reassessment looping back to the seam.
// Embedded in content/books/property-tech/senior-living.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { head: "clinical", label: "assess", sub: ["pre-admission:", "can we serve?"] },
  { head: "clinical", label: "service plan", sub: ["agreed with the", "resident"] },
  { head: "the seam", headHl: true, label: "accept", hl: true },
  { head: "commercial", label: "care fee", sub: ["effective-dated;", "notice if higher"] },
  { head: "clinical", label: "reassess", sub: ["yearly floor, or", "change of condition"] },
];

export default function draw() {
  const W = 760, w = 110, gap = 40, h = 28;
  const total = STAGES.length * w + (STAGES.length - 1) * gap;
  const x0 = (W - total) / 2;
  const s = sheet({ prefix: "pt-slc", width: W });

  s.comment("Clinical records, the seam, the commercial record");

  const { nodes, bottoms, bottom } = s.pipeline(x0, 40, STAGES, { w, h, gap, hlArrows: [1, 2] });
  const accept = nodes[2], re = nodes[4];

  s.comment("Reassessment computes a new level; people accept it or not");
  const ly = bottom + 24;
  s.wire([[re.cx, bottoms[4] + 6], [re.cx, ly], [accept.cx, ly], accept.port("b")], { label: "new computed level", side: "below", seg: 1 });

  s.height = Math.ceil(ly + 34);
  return s.toString();
}
