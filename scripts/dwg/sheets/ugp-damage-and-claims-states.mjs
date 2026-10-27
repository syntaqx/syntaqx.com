// A damage claim's states as a standard diagram: the counterparty's turn
// with its three exits (accepted, disputed, no response), review, and
// settlement or denial. Embedded in
// content/books/user-generated-platforms/damage-and-claims.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-dc", width: W });

  // Three columns; disputed above review, the early ends below.
  const w = 120, h = 30, x0 = 150, gap = (W - 20 - x0 - 3 * w) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r0 = 24, r1 = 124, r2 = 224;
  const st = (i, y, label, o = {}) => s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const disputed = st(1, r0, "disputed");
  const awaiting = st(0, r1, "awaiting_response");
  const review = st(1, r1, "in_review");
  const settled = st(2, r1, "settled", { end: true, hl: true });
  const accepted = st(0, r2, "accepted", { end: true, fill: 1 });
  const denied = st(1, r2, "denied", { end: true, fill: 1 });

  s.comment("Filing");
  s.wire([[20, awaiting.cy], awaiting.port("l")], { start: "dot", label: "host files\nin the window", side: "above" });

  s.comment("The counterparty's three answers");
  s.connect(awaiting, disputed, { from: "t", to: "l", label: "guest\ncontests", side: "left" });
  s.connect(awaiting, review, { label: "no response\nby the deadline", side: "above" });
  s.connect(awaiting, accepted, { from: "b", to: "t", label: "guest pays", side: "right" });

  s.comment("Review and its outcomes");
  s.connect(disputed, review, { from: "b", to: "t", label: "both sides'\nevidence", side: "right" });
  s.connect(review, settled, { hl: true, label: "approved, whole\nor by item", side: "above" });
  s.connect(review, denied, { from: "b", to: "t", alt: true, label: "with reasons", side: "right" });

  s.comment("Notes");
  s.note(accepted, "from the deposit, the card\non file or directly", { anchor: "center" });
  s.note(settled, "ordered sources; lienholder\nfirst on a total loss", { anchor: "right" });

  s.comment("Legend and footer");
  const lg = s.legend(20, r2 + h + 64, [
    { kind: "hl", label: "approved claim" },
    { kind: "alt", label: "ends it without payment" },
    { kind: "end", label: "terminal state" },
  ]);
  const fy = lg.y + 20;
  s.text(20, fy, "a high risk score routes to inspection or reimbursement only, never to denial by itself", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
