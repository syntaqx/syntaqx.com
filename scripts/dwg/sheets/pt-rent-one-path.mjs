// Every rent channel posts through one path, as a standard diagram: seven
// channels join one trunk, then match to a lease, check the lease's
// acceptance, apply by the rule and emit payment.applied; unmatched items
// wait in suspense and blocked payments are declined. Embedded in
// content/books/property-tech/collecting-rent.md.
import { sheet } from "../kit.mjs";

const CHANNELS = ["portal and app", "autopay", "text to pay", "cash network", "lockbox", "office check scan", "third-party payer"];

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pt-r1", width: W });

  s.comment("Channels");
  const cw = 130, ch = 22, cg = 8, top = 24;
  const chans = CHANNELS.map((c, i) => s.node(20, top + i * (ch + cg), cw, ch, c));
  const midY = (chans[0].y + chans.at(-1).y2) / 2;

  s.comment("One path");
  const n = 4, sw = 116, sh = 44, sg = 24;
  const x0 = W - 20 - (n * sw + (n - 1) * sg);
  const y = midY - sh / 2;
  const match = s.node(x0, y, sw, sh, "match", { sub: "to a lease" });
  const accept = s.node(x0 + (sw + sg), y, sw, sh, "acceptance", { sub: "lease not blocked" });
  const apply = s.node(x0 + 2 * (sw + sg), y, sw, sh, "apply", { sub: "by the lease's rule" });
  const event = s.node(x0 + 3 * (sw + sg), y, sw, sh, "payment.applied", { code: true, kind: "store" });
  s.fanIn(chans, match, { via: (20 + cw + x0) / 2, hl: true });
  s.connect(match, accept, { hl: true });
  s.connect(accept, apply, { hl: true });
  s.connect(apply, event, { hl: true });

  s.comment("Off the path");
  const oy = y + sh + 44;
  const suspense = s.node(match.x, oy, sw, sh, "suspense", { kind: "store", sub: "worked daily" });
  const declined = s.node(accept.x, oy, sw, sh, "declined", { end: true, fill: 1, sub: "with the reason" });
  s.connect(match, suspense, { from: "b", to: "t", alt: true, label: "unmatched", side: "right" });
  s.connect(accept, declined, { from: "b", to: "t", alt: true, label: "blocked", side: "right" });

  s.height = Math.ceil(Math.max(chans.at(-1).y2, declined.y2) + 20);
  return s.toString();
}
