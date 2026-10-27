// Webhook delivery in two lanes: the platform sending (write and outbox in
// one transaction, relay, sign and POST, retries) and the receiver (verify,
// dedupe, acknowledge, process later). Embedded in
// content/books/field-operations/platform-architecture.md.
import { sheet } from "../kit.mjs";

const SEND = [
  ["write + outbox row", "one transaction"],
  ["relay", null],
  ["sign, POST", null],
  ["retry with backoff", "then disable, notify"],
];
const RECV = [
  ["verify signature", "reject stale timestamps"],
  ["dedupe event id", "duplicates are normal"],
  ["return 2xx", "before real work"],
  ["process from queue", "order not guaranteed"],
];

export default function draw() {
  const W = 760, x = 20, titleW = 130, w = 128, h = 28;
  const s = sheet({ prefix: "fo-paw", width: W });
  const gap = (W - x - (x + titleW) - 4 * w) / 3;
  const X = (i) => x + titleW + i * (w + gap);
  const [A, B] = s.lanes({
    x, y: 20, w: W - 2 * x, titleW,
    lanes: [
      { label: "sending", sub: "the platform", h: 118 },
      { label: "receiving", sub: "the receiver", h: 84 },
    ],
  });

  const row = (lane, items, dy, o = () => ({})) =>
    items.map(([l, sub], i) => {
      const n = s.node(X(i), lane.y + dy, w, h, l, o(i));
      if (sub) s.text(n.cx, n.y + h + 16, sub, "sl", "middle");
      return n;
    });

  s.comment("Sending");
  const snd = row(A, SEND, 40, (i) => (i === 3 ? { kind: "ghost" } : {}));
  s.connect(snd[0], snd[1], { hl: true });
  s.connect(snd[1], snd[2], { hl: true });
  s.connect(snd[2], snd[3], { alt: true });
  s.connect(snd[3], snd[2], { from: "t", to: "t", via: snd[2].y - 16, alt: true, label: "non-2xx: try again", side: "above" });

  s.comment("Receiving");
  const rcv = row(B, RECV, 22);
  s.connect(rcv[0], rcv[1], { hl: true });
  s.connect(rcv[1], rcv[2], { hl: true });
  s.connect(rcv[2], rcv[3]);

  s.comment("Delivery");
  const jy = A.y + A.h - 14;
  s.wire([snd[2].port("b"), [snd[2].cx, jy], [rcv[0].cx, jy], rcv[0].port("t")], { hl: true });

  s.height = Math.ceil(B.y + B.h + 20);
  return s.toString();
}
