// The order pipeline as events: one synchronous write (checkout to the order
// and its outbox row), then a relay and broker fanning out to the contexts
// that react. The checkout-to-outbox path is the accent. Embedded in
// content/books/commerce/commerce-architecture.md.
import { sheet } from "../kit.mjs";

const CONSUMERS = [
  ["inventory", "commit stock"],
  ["sourcing", "fulfillments"],
  ["payments", "capture on ship"],
  ["messages", "notify customer"],
  ["webhooks", "apps, partners"],
  ["ERP, ledger", "journal entries"],
];

export default function draw() {
  const W = 760, x = 20, w = W - 2 * x;
  const s = sheet({ prefix: "cm-arch", width: W });

  s.comment("Synchronous write");
  const top = 40;
  const { nodes, bottom } = s.pipeline(x, top, [
    { head: "browser", label: "storefront", sub: ["catalog, cart"] },
    { head: "sync", label: "checkout", sub: ["freeze total,", "reserve, authorize"] },
    { head: "one transaction", headHl: true, label: "order + outbox", sub: ["the order and", "its placed event"], hl: true, kind: "store" },
    { head: "at least once", label: "relay, broker", kind: "store" },
  ], { w: 150, gap: 40, hlArrows: [1, 2] });

  s.comment("Consumers");
  const cy = bottom + 64;
  const consumers = s.row(x, cy, w, CONSUMERS.map(([label, sub]) => ({ label, sub })), { h: 46, gap: 16 });
  s.fanOut(nodes[3], consumers, { from: "b", to: "t", via: cy - 24 });

  const fy = cy + 46 + 30;
  s.text(W - x, fy, "each consumer dedupes by event ID and emits its own events through its own outbox", "sl", "end");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
