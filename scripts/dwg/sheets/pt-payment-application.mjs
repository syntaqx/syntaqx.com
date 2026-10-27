// Payment application order as a standard diagram: the rule resolved from
// the jurisdiction's mandatory order and the operator's policy (the law
// wins), the rent-first steps it runs, and below, what fees-first does to
// a full rent payment. Embedded in
// content/books/property-tech/charges-and-resident-ledgers.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pt-pa", width: W });

  const h = 40, vgap = 14;
  const c0 = 20, w0 = 176;
  const w2 = 226, c2 = W - 20 - w2;
  const w1 = 176, c1 = (c0 + w0 + c2) / 2 - w1 / 2;
  const top = 56;
  const Y = (i) => top + i * (h + vgap);
  const midY = Y(1) + h / 2;

  s.comment("Inputs to the rule");
  const law = s.node(c0, midY - vgap / 2 - h, w0, h, "jurisdiction", { sub: "mandatory order, if any" });
  const policy = s.node(c0, law.y2 + vgap, w0, h, "operator policy", { sub: "the lease's order" });

  s.comment("The rule");
  const rule = s.node(c1, midY - 26, w1, 52, "application rule", { kind: "store", sub: ["the law wins;", "version on every row"] });
  s.fanIn([law, policy], rule, { via: (law.x2 + rule.x) / 2 });
  const pay = s.node(rule.x + (w1 - 120) / 2, 20, 120, 28, "payment", { kind: "actor" });
  s.connect(pay, rule, { from: "b", to: "t" });

  s.comment("Steps, in order");
  const steps = [
    s.node(c2, Y(0), w2, h, "1 · rent", { sub: "oldest due date first", hl: true }),
    s.node(c2, Y(1), w2, h, "2 · everything else", { sub: "oldest due date first" }),
    s.node(c2, Y(2), w2, h, "3 · left over", { kind: "store", sub: "unapplied credit, a liability" }),
  ];
  s.fanOut(rule, steps, { hl: 0 });

  s.comment("Fees first, as leases often say");
  const yF = steps[2].y2 + 52;
  s.text(c0, yF - 12, "fees first, as many leases say:", "sl");
  const fw = 200, fgap = (W - 40 - 3 * fw) / 2;
  const f = [
    s.node(c0, yF, fw, h, "full rent payment", { kind: "ghost", sub: "applied to fees first" }),
    s.node(c0 + fw + fgap, yF, fw, h, "rent left short", { kind: "ghost" }),
    s.node(c0 + 2 * (fw + fgap), yF, fw, h, "new late fee", { kind: "ghost", sub: "and a nonpayment notice" }),
  ];
  s.connect(f[0], f[1], { alt: true });
  s.connect(f[1], f[2], { alt: true });

  s.height = Math.ceil(f[2].y2 + 20);
  return s.toString();
}
