// Onboarding gates for a field sales rep as a standard diagram: three
// tracks run in parallel after the offer (eligibility, tax form, screening)
// and join at the gate, which is in the accent. Embedded in
// content/books/field-operations/sales-teams-and-commissions.md.
import { sheet } from "../kit.mjs";

const TRACKS = [
  { label: "eligibility", steps: ["I-9 sec 1: day 1", "I-9 sec 2: +3 bd", "E-Verify: +3 bd"] },
  { label: "tax form", steps: ["W-4 or W-9"] },
  { label: "screening", steps: ["FCRA consent", "report, MVR", "permit, badge"] },
];

export default function draw() {
  const W = 760, h = 28, gap = 20, rowH = 64, top = 40;
  const ew = 118, cw = 128; // the offer and the gate
  const forkX = 20 + ew + 20, x0 = forkX + 20;
  const cx0 = W - 20 - cw, joinX = cx0 - 20, xEnd = joinX - 20;
  const w = (xEnd - x0 - 2 * gap) / 3;
  const s = sheet({ prefix: "fo-sto", width: W });
  const ys = TRACKS.map((_, i) => top + i * rowH);
  const midY = ys[1] + h / 2;

  s.comment("Offer and gate");
  const offer = s.node(20, midY - h / 2, ew, h, "offer accepted", { fill: 1 });
  const gate = s.node(cx0, midY - h / 2, cw, h, "cleared to knock", { hl: true });

  const tracks = TRACKS.map((t, i) => {
    s.comment(t.label);
    s.text(x0, ys[i] - 8, t.label, "sl");
    const nodes = t.steps.map((l, j) => s.node(x0 + j * (w + gap), ys[i], w, h, l, { code: true }));
    nodes.slice(1).forEach((nd, j) => s.connect(nodes[j], nd));
    return nodes;
  });

  s.comment("The offer forks into the tracks; they join at the gate");
  s.fanOut(offer, tracks.map((n) => n[0]), { via: forkX });
  s.fanIn(tracks.map((n) => n.at(-1)), gate, { via: joinX, hl: true });

  s.comment("Footer");
  const fy = ys[2] + h + 30;
  s.text(20, fy, "bd: business days after work for pay begins; screening rules vary by state and city", "tc");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
