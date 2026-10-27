// The send-time gates for a scheduled customer message as a standard
// diagram: six stages left to right, each gate with a dashed exit and its
// reason. Embedded in content/books/field-operations/customer-communications.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { label: "message due" },
  { label: "job unchanged?", exit: "drop: stale", why: "cancelled, moved" },
  { label: "consent ok?", exit: "suppress", why: "STOP, no opt-in" },
  { label: "send window?", exit: "defer", why: "quiet hours" },
  { label: "render, link", exit: "fallback text", why: "missing locale" },
  { label: "hand off", exit: "retry or stop", why: "provider error", hl: true },
];

export default function draw() {
  const W = 760, n = STAGES.length, w = 104, h = 28, gap = (W - 40 - n * w) / (n - 1);
  const s = sheet({ prefix: "fo-ccs", width: W });
  const X = (i) => 20 + i * (w + gap);
  const y = 42, ey = y + h + 34;

  s.comment("Checked at send time, in this order");
  s.text(20, y - 14, "checked at send time, in this order", "lt");
  const nodes = STAGES.map((st, i) => s.node(X(i), y, w, h, st.label, { hl: st.hl }));
  nodes.slice(1).forEach((nd, i) => s.connect(nodes[i], nd, { hl: true }));

  s.comment("Exits");
  STAGES.forEach((st, i) => {
    if (!st.exit) return;
    const e = s.node(X(i), ey, w, h, st.exit, { kind: "ghost" });
    s.wire([nodes[i].port("b"), e.port("t")], { alt: true });
    s.text(e.cx, ey + h + 16, st.why, "sl", "middle");
  });

  const fy = ey + h + 16 + 30;
  s.text(W - 20, fy, "every outcome, sent or not, is written to the message log", "sl", "end");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
