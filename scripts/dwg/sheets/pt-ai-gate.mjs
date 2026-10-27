// How an agent's proposed action is gated: a ceiling for actions the law
// assigns to the operator, then the level set for the workflow and property,
// then policy checks; every outcome lands in the audit record. Embedded in
// content/books/property-tech/ai-in-property-management.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, bw = 130, gap = 22, h = 44;
  const s = sheet({ prefix: "pt-aig", width: W });
  const r1 = 28;
  let x = 20;
  const next = (w) => { const at = x; x += w + gap; return at; };

  s.comment("The gate, left to right");
  const agent = s.node(next(bw), r1, bw, h, "agent proposes", { sub: "an action" });
  const ceiling = s.node(next(bw), r1 - 10, bw, h + 20, "ceiling?", { kind: "decision" });
  const level = s.node(next(bw), r1 - 4, bw, h + 8, "level", { sub: ["per workflow", "and property"] });
  const checks = s.node(next(bw), r1 - 10, bw, h + 20, "checks pass?", { kind: "decision" });
  const act = s.node(x, r1, W - 20 - x, h, "act", { sub: "within limits" });
  s.connect(agent, ceiling);
  s.connect(ceiling, level, { label: "no", side: "above" });
  s.connect(level, checks);
  s.connect(checks, act, { label: "yes", side: "above" });

  s.comment("Where a person takes over");
  const r2 = r1 + h + 70;
  const draft = s.node(ceiling.x - 10, r2, bw + 20, h + 12, "draft for approval", { hl: true, sub: ["a person approves,", "edits or rejects"] });
  const esc = s.node(checks.x, r2, bw, h + 12, "escalate", { sub: ["review queue", "of exceptions"] });
  s.connect(ceiling, draft, { from: "b", to: "t", hl: true, label: "yes", side: "right" });
  s.connect(checks, esc, { from: "b", to: "t", alt: true, label: "no", side: "right" });
  ["ceiling actions:", "deny housing,", "start a legal clock,", "decide an", "accommodation,", "move money to a", "new destination,", "change a lease"]
    .forEach((t, i) => s.text(20, r2 + 8 + i * 11.5, t, i ? "sl" : "sl hl"));

  s.comment("Every outcome is recorded");
  const r3 = r2 + h + 12 + 54;
  const audit = s.node(20, r3, W - 40, 36, "audit record", { kind: "store", sub: "agent, model, prompt version, data read, approver" });
  s.wire([draft.port("b"), [draft.cx, audit.y]]);
  s.wire([esc.port("b"), [esc.cx, audit.y]]);
  s.wire([act.port("b"), [act.cx, audit.y]]);

  s.height = Math.ceil(audit.y2 + 20);
  return s.toString();
}
