// The tenant screening pipeline as a standard diagram: fee and consent,
// staged reports (criminal history only after a conditional offer where
// fair-chance laws apply), the decision against a criteria version, its
// four outcomes, the FCRA adverse action notice and the dispute that
// supersedes the decision. Embedded in
// content/books/property-tech/applications-and-screening.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, gap = 20, h = 44, hS = 56;
  const s = sheet({ prefix: "pt-sc", width: W });
  const chX = W - 20 - 14; // the re-decide channel on the right
  const rowW = chX - 16 - 20;

  s.comment("Stages");
  const y0 = 24;
  const stages = s.row(20, y0, rowW, [
    { label: "fee and consent", sub: ["per member,", "before any report"] },
    { label: "pre-qualification", sub: ["identity, income,", "credit and", "rental history"] },
    { label: "conditional offer", sub: ["financials", "decided first"] },
    { label: "criminal history", sub: ["where allowed,", "after the offer"], kind: "ghost" },
    { label: "decision", sub: ["criteria version,", "reason codes"], hl: true },
  ], { h: hS, gap, arrows: true });
  const decision = stages[4];

  s.comment("Outcomes");
  const yO = y0 + hS + 44;
  const outs = s.row(20, yO, rowW, [
    { label: "approve" },
    { label: "approve with\nconditions", sub: "deposit, guarantor" },
    { label: "deny" },
    { label: "pending", sub: "assessment, dispute" },
  ], { h, gap: 24 });
  s.fanOut(decision, outs, { from: "b", to: "t", via: y0 + hS + 22, hl: 0 });

  s.comment("Adverse action and dispute");
  const yN = yO + h + 40;
  const nw = outs[2].x2 - outs[1].x;
  const notice = s.node(outs[1].x, yN, nw, h, "adverse action notice", { kind: "store", sub: ["agency named, free copy within 60 days,", "right to dispute"] });
  s.fanIn([outs[1], outs[2]], notice, { from: "b", to: "t", via: yO + h + 20 });
  const dispute = s.node(outs[3].x, yN, outs[3].w, h, "dispute", { kind: "actor", sub: ["agency reinvestigates", "within 30 days"] });
  s.connect(notice, dispute, { alt: true });
  s.wire([dispute.port("r"), [chX, dispute.cy], [chX, decision.cy], decision.port("r")], { alt: true });
  const ny = s.note(dispute, "corrected report:\na new decision supersedes", { anchor: "right" });

  s.comment("Legend");
  const lg = s.legend(20, ny + 24, [
    { kind: "hl", label: "approval" },
    { kind: "ghost", label: "only where the law allows" },
    { kind: "alt", label: "challenge and re-decision" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
