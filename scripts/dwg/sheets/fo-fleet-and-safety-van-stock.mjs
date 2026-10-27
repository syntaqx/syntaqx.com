// Van stock as a ledger: supplier to branch warehouse to the van (itself a
// warehouse) to a visit, returns back to the warehouse, restocking from
// usage, and every movement as one row in the inventory journal. Embedded
// in content/books/field-operations/fleet-and-safety.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, x = 20, h = 30;
  const widths = [110, 150, 150, 120];
  const gap = (W - 2 * x - widths.reduce((a, b) => a + b, 0)) / (widths.length - 1);
  const s = sheet({ prefix: "fo-fs", width: W });
  const y = 58;

  s.comment("Locations");
  let xx = x;
  const [supplier, wh, van, visit] = ["supplier", "branch warehouse", "van (a warehouse)", "on a visit"].map((l, i) => {
    const n = s.node(xx, y, widths[i], h, l, { hl: i === 2, kind: i === 0 ? "actor" : "process" });
    xx += widths[i] + gap;
    return n;
  });
  s.connect(supplier, wh, { label: "receipt" });
  s.connect(wh, van, { hl: true, label: "transfer" });
  s.connect(van, visit, { hl: true, label: "used" });

  s.comment("Restock");
  s.connect(visit, wh, { from: "t", to: "t", via: y - 22, alt: true, label: "restock from usage or below minimum", side: "above" });

  s.comment("Returns");
  const ry = y + h + 30;
  s.wire([van.port("b", 0.3), [van.port("b", 0.3)[0], ry], [wh.port("b", 0.7)[0], ry], wh.port("b", 0.7)], {
    alt: true, seg: 1, side: "below", label: "return, damaged, swap",
  });

  s.comment("Journal");
  const jy = ry + 50;
  const journal = s.node(x, jy, W - 2 * x, h, "inventory journal: one row per movement, never edited", { kind: "store", fill: 1 });
  for (const [n, t] of [[wh, 0.3], [van, 0.7], [visit, 0.5]]) s.wire([n.port("b", t), [n.port("b", t)[0], jy]]);
  s.text(van.port("b", 0.7)[0] + 6, ry + 8, "count, adjust", "sl");
  s.height = Math.ceil(journal.y + h + 20);
  return s.toString();
}
