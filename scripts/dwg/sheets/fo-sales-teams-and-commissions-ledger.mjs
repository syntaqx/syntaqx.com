// The commission ledger lifecycle as a standard diagram: sale, pending,
// earned, paid now, with the holdback released on the plan's date; dashed exits
// to void and clawback entries; the money that reaches the rep in the
// accent. Embedded in content/books/field-operations/sales-teams-and-commissions.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, w = 108, h = 28, cols = 4;
  const gap = (W - 40 - cols * w) / (cols - 1);
  const X = (i) => 20 + i * (w + gap);
  const r1 = 44, r2 = 124, r3 = 204;
  const s = sheet({ prefix: "fo-stl", width: W });
  const n = (i, y, label, o = {}) => s.node(X(i), y, w, h, label, o);

  s.comment("Entries");
  const sale = n(0, r1, "sale");
  const pending = n(1, r1, "pending", { fill: 1 });
  const earned = n(2, r1, "earned", { hl: true });
  const paid = n(3, r1, "paid now", { hl: true });
  const held = n(3, r2, "held back");
  const voided = n(1, r3, "void", { kind: "ghost" });
  const clawback = n(2, r3, "clawback (-)", { kind: "ghost" });
  const released = n(3, r3, "released", { hl: true });

  s.comment("Money path");
  s.connect(sale, pending, { label: "signed" });
  s.connect(pending, earned, { hl: true, label: "active,\nfirst visit" });
  s.connect(earned, paid, { hl: true, label: "pay period" });
  s.connect(earned, held, { at: [0.75, 0.5] });
  s.connect(held, released, { from: "b", to: "t", hl: true, label: "release date", side: "right" });

  s.comment("Cancellations");
  s.connect(pending, voided, { from: "b", to: "t", alt: true, label: "cancelled\nin window", side: "left" });
  s.text(voided.cx, r3 + h + 15, "nothing was owed", "sl", "middle");
  s.connect(earned, clawback, { from: "b", to: "t", alt: true, label: "terminated in\nclawback period", side: "left" });
  s.connect(clawback, released, { alt: true, label: "nets against\nholdback first" });

  s.comment("Legend");
  const lg = s.legend(20, r3 + h + 44, [
    { kind: "hl", label: "money that reaches the rep" },
    { kind: "alt", label: "cancellation or reversal" },
    { kind: "ghost", label: "nothing paid, or a negative entry" },
  ]);
  s.height = Math.ceil(lg.y + 14);
  return s.toString();
}
