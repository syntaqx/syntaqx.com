// The AI call flow as a standard diagram: caller and agent, the tools the
// agent may call, the policy check in your code, the office queue for
// denials and handoffs, and the audit record every step writes to. The
// booking path is the accent. Embedded in
// content/books/field-operations/ai-in-field-operations.md.
import { sheet } from "../kit.mjs";

const TOOLS = ["find customer", "offer slots", "request booking", "hand off"];

export default function draw() {
  const W = 760, h = 26, rowH = 52, top = 44;
  const s = sheet({ prefix: "fo-aic", width: W });
  const colConv = 20, colTools = 310, colCode = 500;

  s.comment("Column heads");
  s.text(colConv, 26, "the conversation", "th");
  s.text(colTools, 26, "tools it may call", "th");
  s.text(colCode, 26, "your code decides", "th");

  s.comment("Tools");
  const tools = TOOLS.map((t, i) => s.node(colTools, top + i * rowH, 150, h, t));
  const [, , book, handoff] = tools;

  s.comment("The conversation");
  const yMain = book.y;
  const caller = s.node(colConv, yMain, 90, h, "caller", { kind: "actor" });
  const agent = s.node(140, yMain, 110, h, "AI agent");
  s.wire([[caller.x + caller.w + 3, caller.cy], agent.port("l")], { arrow: "both" });
  s.text(caller.cx, caller.y + h + 18, "told it is AI", "sl", "middle");

  s.comment("Tool calls: a bus from the agent, the booking branch in the accent");
  const bus = 282;
  s.line(bus, tools[0].cy, bus, tools[3].cy, "flow");
  for (const t of tools) if (t !== book) s.wire([[bus, t.cy], t.port("l")]);
  s.wire([agent.port("r"), book.port("l")], { hl: true });

  s.comment("Your code decides");
  const policy = s.node(colCode, yMain, 120, h, "policy check", { fill: 1 });
  s.text(policy.cx, policy.y - 8, "job type, caps, identity", "sl", "middle");
  const booked = s.node(W - 20 - 90, yMain, 90, h, "booked", { kind: "state", end: true, hl: true });
  const queue = s.node(colCode, handoff.y, 120, h, "office queue", { kind: "ghost" });
  s.connect(book, policy, { hl: true });
  s.connect(policy, booked, { hl: true });
  s.connect(policy, queue, { from: "b", to: "t", alt: true, label: "denied", side: "right" });
  s.connect(handoff, queue, { alt: true });

  s.comment("Audit");
  const ay = handoff.y + h + 44;
  const audit = s.node(agent.x, ay, W - 20 - agent.x, 36, "audit record", {
    kind: "store",
    sub: "recording, transcript, tool calls, checks, outcome, approver",
  });
  for (const n of [agent, handoff, queue, booked]) s.wire([n.port("b"), [n.cx, audit.y]]);

  s.comment("Legend");
  const lg = s.legend(agent.x, audit.y + audit.h + 28, [
    { kind: "hl", label: "a booking the check approves" },
    { kind: "alt", label: "to a person" },
    { kind: "flow", label: "writes to the record" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
