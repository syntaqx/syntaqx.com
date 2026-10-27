// The delivery chain: first and middle mile under a logistics span, the hub
// and the last mile's three endings under a field operations span, and
// failed attempts back to the hub. Spans, not boxed zones: the middle mile
// crosses from one to the other, and a zone edge would cut its label.
// Embedded in content/books/field-operations/last-mile-delivery.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, x = 20, h = 32;
  const s = sheet({ prefix: "fo-lmd", width: W });
  const cy = 86;

  s.comment("First and middle mile");
  const shipper = s.node(x, cy - h / 2, 86, h, "shipper", { kind: "actor" });
  const wh = s.node(182, cy - h / 2, 104, h, "warehouse");
  const hub = s.node(376, cy - 20, 116, 40, "hub or depot", { sub: "load by stop" });
  s.note(shipper, "retailer, maker", { anchor: "left" }); // at the margin: centered, it would run past it
  s.note(wh, "store, pick, pack");
  s.connect(shipper, wh, { label: "first mile" });
  s.connect(wh, hub, { label: "middle mile" });

  s.comment("Last mile");
  const dw = 148, dx = W - x - dw, dh = 30, step = 46;
  const ends = ["recipient signs", "safe place, photo", "locker or counter"].map((l, i) => s.node(dx, cy - dh / 2 + (i - 1) * step, dw, dh, l));
  s.fanOut(hub, ends, { via: dx - 24, hl: true, label: "last mile", side: "above" });

  s.comment("Failed attempts");
  const fy = ends[2].y + dh + 22;
  s.wire([ends[2].port("b"), [ends[2].cx, fy], [hub.cx, fy], hub.port("b")], {
    alt: true, seg: 1, side: "below", label: "failed: retry, hold at a\npickup point, or return",
  });

  s.comment("Spans");
  const sy = fy + 54;
  s.span(x, wh.x + wh.w + 30, sy, "logistics: TMS and WMS");
  const ly = s.span(hub.x - 30, W - x, sy, "field operations: routes, proof", { hl: true });
  s.height = Math.ceil(ly + 18);
  return s.toString();
}
