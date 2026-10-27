// A processor router as a standard diagram: checkout into the router (rules,
// health, vault), three routes out (primary in the accent, failover dashed),
// every settlement file into one ledger. Embedded in
// content/books/payments/processor-routing.md.
import { sheet } from "../kit.mjs";

const PARTS = [
  ["rules", "BIN, cost, region, contract"],
  ["health", "approval rate, latency, errors"],
  ["vault", "tokens any route can use"],
];
const ROUTES = [
  ["processor A", "best cost and approval rate", { hl: true }],
  ["processor B", "failover, once A's outcome is known", { alt: true }],
  ["debit network", "US debit: the merchant may choose it", {}],
];

export default function draw() {
  const W = 760, x = 20, nh = 40, rowGap = 10, pad = 10, titleH = 22;
  const s = sheet({ prefix: "pr", width: W });
  const chan = W - x - 10; // settlement channel, inside the margin
  const pw = 230, px = chan - 20 - pw; // processors flush to the channel
  const rw = 210, routerW = rw + 2 * pad, top = 20;
  const routerH = titleH + PARTS.length * nh + (PARTS.length - 1) * rowGap + pad;

  s.comment("Router");
  const cw = 100;
  const gap = (px - x - cw - routerW) / 2;
  const rx = x + cw + gap;
  const router = s.node(rx, top, routerW, routerH, null, { fill: 1 });
  s.text(rx + pad, top + 15, "router", "lt");
  const parts = PARTS.map(([l, sub], i) => s.node(rx + pad, top + titleH + i * (nh + rowGap), rw, nh, l, { sub }));

  s.comment("Checkout");
  const checkout = s.node(x, router.cy - 15, cw, 30, "checkout");
  s.connect(checkout, router, { hl: true });

  // Routes leave the router as a whole (not from one part), fanning out at
  // the midline so no route reads as belonging to the part beside it.
  s.comment("Routes, one per processor");
  const procs = ROUTES.map(([l, sub, o], i) => {
    const n = s.node(px, parts[i].y, pw, nh, l, { sub, hl: o.hl });
    const t = i === 1 ? (n.cy - router.y) / router.h : [0.38, , 0.68][i];
    s.connect(router, n, { at: [t, 0.5], ...o });
    return n;
  });

  s.comment("Settlement into one ledger");
  const ledger = s.node(px, router.y + router.h + 30, pw, 30, "one ledger");
  s.wire([procs[0].port("r"), [chan, procs[0].cy], [chan, ledger.cy], ledger.port("r")]);
  procs.slice(1).forEach((p) => s.wire([p.port("r"), [chan, p.cy]], { arrow: "none" }));
  s.text(px - 12, ledger.cy + 3, "every settlement file, reconciled daily", "sl", "end");

  s.comment("Legend");
  const lg = s.legend(x, ledger.y + ledger.h + 30, [
    { kind: "hl", label: "primary route" },
    { kind: "alt", label: "failover, only after the first outcome" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
