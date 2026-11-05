// A subscription or redemption order in a tokenized fund: the path to a
// settled order in the accent, a dashed after-cutoff wait, dashed rejections
// and a dashed resubmission when the on-chain mint or burn reverts.
// Embedded in content/books/investing-and-digital-assets/tokenized-funds.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ifo", width: W });

  // Grid: five states on the main row, the wait above, the rejection below.
  const w = 112,
    h = 30,
    gap = 30;
  const x0 = (W - (5 * w + 4 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r0 = 40,
    r1 = 118,
    r2 = 212;
  const st = (i, y, label, o = {}) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const requested = st(0, r1, "requested");
  const accepted = st(1, r1, "accepted");
  const pending = st(2, r1, "pending_agent");
  const onchain = st(3, r1, "onchain");
  const settled = st(4, r1, "settled", { end: true, hl: true });
  const nextWindow = st(1, r0, "next_window");
  const rejected = st(2, r2, "rejected", { end: true, fill: 1 });

  s.comment("The path to a settled order");
  s.connect(requested, accepted, { hl: true });
  s.connect(accepted, pending, { hl: true });
  s.connect(pending, onchain, { hl: true });
  s.connect(onchain, settled, { hl: true });

  s.comment("After the cutoff: wait for the next window");
  s.connect(requested, nextWindow, {
    from: "t",
    to: "l",
    alt: true,
    label: "after cutoff",
    side: "left",
  });
  s.connect(nextWindow, accepted, {
    from: "b",
    to: "t",
    alt: true,
    label: "window opens",
    side: "right",
  });

  s.comment("Rejections");
  s.connect(requested, rejected, {
    from: "b",
    to: "l",
    alt: true,
    label: "not eligible or\nnot allowlisted",
    side: "left",
  });
  s.connect(pending, rejected, {
    from: "b",
    to: "t",
    alt: true,
    label: "agent refused",
    side: "right",
  });

  s.comment("Reverted mint or burn goes back to the agent");
  s.connect(onchain, pending, {
    from: "t",
    to: "t",
    via: r1 - 26,
    alt: true,
    label: "reverted: resubmit",
    side: "above",
    seg: 1,
  });

  s.comment("Legend");
  const lg = s.legend(x0, r2 + h + 34, [
    { kind: "hl", label: "the path an order should take" },
    { kind: "alt", label: "wait, rejection or retry" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
