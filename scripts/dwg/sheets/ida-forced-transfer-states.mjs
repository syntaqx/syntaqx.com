// An agent override on a permissioned token (forced transfer, recovery,
// freeze): the path to a posted override in the accent, dashed rejections,
// and a dashed re-sign loop when the on-chain call reverts.
// Embedded in content/books/investing-and-digital-assets/transfer-agents-and-permissioned-tokens.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ift", width: W });

  // Grid: five states on the main row, the rejection below.
  const w = 112,
    h = 30,
    gap = 30;
  const x0 = (W - (5 * w + 4 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r1 = 56,
    r2 = 160;
  const st = (i, y, label, o = {}) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const received = st(0, r1, "received");
  const reviewed = st(1, r1, "reviewed");
  const approved = st(2, r1, "approved");
  const executed = st(3, r1, "executed");
  const posted = st(4, r1, "posted", { end: true, hl: true });
  const rejected = st(2, r2, "rejected", { end: true, fill: 1 });

  s.comment("The path to a posted override");
  s.connect(received, reviewed, { hl: true });
  s.connect(reviewed, approved, { hl: true });
  s.connect(approved, executed, { hl: true });
  s.connect(executed, posted, { hl: true });

  s.comment("Rejections");
  s.connect(reviewed, rejected, {
    from: "b",
    to: "l",
    alt: true,
    label: "no authority or\nrecipient unverified",
    side: "left",
  });
  s.connect(approved, rejected, {
    from: "b",
    to: "t",
    alt: true,
    label: "quorum withdrawn",
    side: "right",
  });

  s.comment("Reverted call goes back for a new signature");
  s.connect(executed, approved, {
    from: "t",
    to: "t",
    via: r1 - 26,
    alt: true,
    label: "reverted: re-sign",
    side: "above",
    seg: 1,
  });

  s.comment("Legend");
  const lg = s.legend(x0, r2 + h + 34, [
    { kind: "hl", label: "the path an override should take" },
    { kind: "alt", label: "rejection or retry" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
