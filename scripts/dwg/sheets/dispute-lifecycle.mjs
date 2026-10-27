// The dispute lifecycle as a standard state machine: an optional inquiry,
// the dispute, the response with evidence that wins (the accent), the
// dashed losses and escalations, and arbitration ruling either way.
// Embedded in content/books/payments/disputes-and-chargebacks.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, h = 28, pad = 12;
  const s = sheet({ prefix: "dsp", width: W });

  // Columns and rows on one grid; the right channel takes the last 20.
  const cInq = 20 + pad, cDsp = 230, cRsp = 420, cOut = 626;
  const wInq = 100, wDsp = 100, wRsp = 124, wOut = 94;
  const yTop = 34, r0 = 50, r1 = 110, r2 = 200;
  const st = (x, y, w, label, o = {}) => s.node(x, y, w, h, label, { kind: "state", ...o });

  s.comment("Inquiry: some networks only");
  const inquiry = st(cInq, r1, wInq, "inquiry");
  const gx = cInq - pad, gy = r1 - pad, gw = wInq + 2 * pad, gh = h + 2 * pad;
  s.group(gx, gy, gw, gh, "some networks only");
  ["answer it and", "many go away"].forEach((l, j) => s.text(gx + gw / 2, gy + gh + 16 + j * 11, l, "sl", "middle"));

  s.comment("States");
  const dispute = st(cDsp, r1, wDsp, "dispute");
  ["amount and fee", "debited at once"].forEach((l, j) => s.text(dispute.cx, r1 + h + 16 + j * 11, l, "sl", "middle"));
  const response = st(cRsp, r1, wRsp, "response");
  const prearb = st(cRsp, r2, wRsp, "pre-arbitration");
  const lost = st(cOut, r0, wOut, "lost", { end: true, fill: 1 });
  const won = st(cOut, r1, wOut, "won", { end: true, hl: true });
  const arb = st(cOut, r2, wOut, "arbitration");
  ["the network rules;", "the loser pays its fee"].forEach((l, j) => s.text(arb.x + arb.w, r2 + h + 16 + j * 11, l, "sl", "end"));

  s.comment("Main path");
  // Center the label on the part of the segment outside the group.
  const segMid = (inquiry.x + inquiry.w + dispute.x) / 2, outMid = (gx + gw + dispute.x) / 2;
  s.connect(inquiry, dispute, { label: "unanswered", shift: (outMid - segMid) / ((dispute.x - inquiry.x - inquiry.w) / 2) });
  s.connect(dispute, response, { hl: true, label: "evidence,\n7 to 21 days" });
  s.connect(response, won, { hl: true, label: "accepted" });

  s.comment("Losses");
  s.connect(response, lost, { from: "t", to: "l", alt: true, seg: 0, side: "right", label: "rejected" });
  s.connect(dispute, lost, { from: "t", to: "t", via: yTop, alt: true, seg: 1, label: "no response by the deadline loses by default" });

  s.comment("Escalation");
  s.connect(response, prearb, { from: "b", to: "t", alt: true, side: "left", label: "if rejected,\neither side escalates" });
  s.connect(prearb, arb, { alt: true, label: "unresolved" });
  s.connect(arb, won, { from: "t", to: "b" });
  s.connect(arb, lost, { from: "r", to: "r", via: W - 20 });

  s.comment("Legend");
  const lg = s.legend(20, r2 + h + 64, [
    { kind: "hl", label: "a response with evidence wins" },
    { kind: "alt", label: "a loss, or an escalation" },
    { kind: "end", label: "outcome" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
