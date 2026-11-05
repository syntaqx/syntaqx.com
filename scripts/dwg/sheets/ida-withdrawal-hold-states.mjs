// A withdrawal hold placed on an account takeover signal: confirmation with
// the customer and review on the accented path to release, the timer skip
// above, and dashed exits to an upheld hold below.
// Embedded in content/books/investing-and-digital-assets/account-security.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "iwh", width: W });

  const w = 120,
    h = 30,
    gap = 80;
  const x0 = (W - (4 * w + 3 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r1 = 64,
    r2 = 170;
  const st = (i, y, label, o = {}) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const placed = st(0, r1, "placed");
  const awaiting = st(1, r1, "awaiting_customer");
  const review = st(2, r1, "under_review");
  const released = st(3, r1, "released", { end: true, hl: true });
  const upheld = st(2, r2, "upheld", { end: true, fill: 1 });

  s.comment("The path to release");
  s.connect(placed, awaiting, { hl: true, label: "notice to\nold contact", side: "above" });
  s.connect(awaiting, review, { hl: true, label: "customer\nconfirms", side: "above" });
  s.connect(review, released, { hl: true, label: "signals\ncleared", side: "above" });

  s.comment("Timer skip over the top");
  const top = 24;
  s.wire([placed.port("t"), [placed.cx, top], [released.cx, top], released.port("t")], {
    label: "cooling period ends, no other signal",
    side: "above",
    seg: 1,
  });

  s.comment("Exits");
  s.connect(awaiting, upheld, {
    from: "b",
    to: "l",
    alt: true,
    label: "customer says\nnot me",
    side: "left",
  });
  s.connect(review, upheld, {
    from: "b",
    to: "t",
    alt: true,
    label: "takeover\nconfirmed",
    side: "right",
  });

  s.comment("Legend");
  const lg = s.legend(x0, r2 + h + 40, [
    { kind: "hl", label: "the path a held withdrawal should take" },
    { kind: "alt", label: "withdrawal stopped" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
