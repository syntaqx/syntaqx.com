// A home-service agreement from the knock to collections, with the rules
// that govern each stage in a column under it, and the cancellation branch
// out of the rescission window. A standard diagram. Embedded in
// content/books/field-operations/consumer-protection.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  ["knock", ["city permit", "ID badge", "no-knock list", "local hours"]],
  ["sign", ["Cooling-Off", "state law", "ESIGN consent", "Reg Z, Holder"]],
  ["window", ["3 business days", "longer by state", "refund in 10", "no early lien"], true],
  ["term", ["ROSCA", "state ARLs", "yearly reminder", "easy cancel"]],
  ["contact", ["TCPA, state", "CAN-SPAM", "AI disclosure", "recording"]],
  ["collections", ["FDCPA", "Regulation F", "if a third", "party collects"]],
];

export default function draw() {
  const W = 760, x = 20, h = 28, gap = 18, lineH = 14;
  const s = sheet({ prefix: "fo-cpl", width: W });
  const top = 44;

  s.comment("Stages");
  s.text(x, 26, "stage", "th");
  s.line(x, 32, W - x, 32, "tbl");
  const nodes = s.row(x, top, W - 2 * x, STAGES.map(([label, , hl]) => ({ label, hl })), { h, gap });
  nodes.slice(1).forEach((n, i) => s.connect(nodes[i], n, { alt: i === nodes.length - 2 }));

  s.comment("The rules");
  const ry = top + h + 26;
  s.text(x, ry, "the rules", "th");
  s.line(x, ry + 8, W - x, ry + 8, "tbl");
  STAGES.forEach(([, rules, hl], i) =>
    rules.forEach((r, j) => s.text(nodes[i].cx, ry + 26 + j * lineH, r, hl ? "tc hl" : "tc", "middle")),
  );
  const rb = ry + 26 + 3 * lineH + 8;

  s.comment("Cancellation");
  const win = nodes[2];
  const cancel = s.node(win.cx - 60, rb + 30, 120, 26, "cancelled", { end: true, fill: 1 });
  s.wire([[win.cx, rb], cancel.port("t")], { alt: true });
  s.text(cancel.x + cancel.w + 14, cancel.cy + 3, "receipt time starts the refund clock", "sl");

  s.height = Math.ceil(cancel.y + cancel.h + 20);
  return s.toString();
}
