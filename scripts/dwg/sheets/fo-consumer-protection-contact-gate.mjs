// One gate for all outbound contact: a column of checks on the accented
// path to send, each failure exiting right to a block, defer or hold, and
// every decision written to the audit log. A standard diagram. Embedded in
// content/books/field-operations/consumer-protection.md.
import { sheet } from "../kit.mjs";

const CHECKS = [
  ["channel and purpose", "consent on file?", "block: no consent", true],
  ["internal and national DNC", "not revoked or listed?", "block: opted out", true],
  ["recipient's local time", "inside calling window?", "defer to window open", false],
  ["per 24 hours, per week", "under frequency cap?", "defer to next slot", false],
  ["AI voice, recording", "disclosure in place?", "hold: fix the template", true],
];

export default function draw() {
  const W = 760, x = 20, h = 26, step = 44;
  const s = sheet({ prefix: "fo-cpg", width: W });
  const gx = 230, gw = 200, ox = 480, ow = 190, ch = W - x - 30; // audit channel
  const top = 44;

  s.comment("Column heads");
  s.text(x, 24, "what it checks", "th");
  s.text(gx, 24, "the gate", "th");
  s.text(ox, 24, "if it fails", "th");
  s.line(x, 32, W - x, 32, "tbl");

  s.comment("Request");
  const req = s.node(gx, top, gw, h, "call, text, email, AI call", { fill: 1 });

  s.comment("Checks and exits");
  let prev = req;
  const outs = [];
  CHECKS.forEach(([what, q, out, end], i) => {
    const y = top + (i + 1) * step;
    const n = s.node(gx, y, gw, h, q);
    s.connect(prev, n, { from: "b", to: "t", hl: true });
    s.text(x, n.cy + 3, what, "sl");
    const o = s.node(ox, y, ow, h, out, end ? { end, fill: 1 } : { kind: "ghost" });
    s.connect(n, o, { alt: true });
    outs.push(o);
    prev = n;
  });

  s.comment("Send and the audit log");
  const sy = top + (CHECKS.length + 1) * step + 6;
  const send = s.node(gx, sy, gw, 28, "send", { hl: true });
  s.connect(prev, send, { from: "b", to: "t", hl: true });
  const audit = s.node(ox, sy, ow, 28, "audit log", { kind: "store", fill: 1 });
  s.connect(send, audit);
  outs.forEach((o) => s.wire([o.port("r"), [ch, o.cy]], { alt: true, arrow: "none" }));
  s.wire([[ch, outs[0].cy], [ch, audit.cy], audit.port("r")], { alt: true });

  s.comment("Footer");
  const fy = sy + 28 + 22;
  s.text(audit.cx, fy, "every decision, blocks included,", "sl", "middle");
  s.text(audit.cx, fy + 12, "with the rule that made it", "sl", "middle");
  s.legend(x, fy - 3, [
    { kind: "hl", label: "passes" },
    { kind: "alt", label: "fails" },
    { kind: "end", label: "stops it" },
    { kind: "ghost", label: "tries later" },
  ], { width: ox - x - 20 });
  s.height = Math.ceil(fy + 12 + 18);
  return s.toString();
}
