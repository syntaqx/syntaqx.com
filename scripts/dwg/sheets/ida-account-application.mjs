// The brokerage account application state machine: the path to an open
// account in the accent, the document loop above, dashed rejections below.
// Embedded in content/books/investing-and-digital-assets/opening-accounts.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "iaa", width: W });

  // Grid: five states on the main row, the document loop above verifying,
  // the rejection below it.
  const w = 120,
    h = 30,
    gap = 30;
  const x0 = (W - (5 * w + 4 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r0 = 24,
    r1 = 110,
    r2 = 196;
  const st = (i, y, label, o = {}) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const submitted = st(0, r1, "submitted");
  const verifying = st(1, r1, "verifying");
  const pending = st(2, r1, "approval_pending");
  const approved = st(3, r1, "approved");
  const opened = st(4, r1, "opened", { end: true, hl: true });
  const action = st(1, r0, "action_required");
  const rejected = st(1, r2, "rejected", { end: true, fill: 1 });

  s.comment("The path to an open account");
  s.connect(submitted, verifying, { hl: true });
  s.connect(verifying, pending, { hl: true });
  s.connect(pending, approved, { hl: true });
  s.connect(approved, opened, { hl: true });

  s.comment("Document loop");
  s.connect(verifying, action, { from: "t", to: "b", at: [0.3, 0.3] });
  s.connect(action, verifying, {
    from: "b",
    to: "t",
    at: [0.7, 0.7],
    label: "documents\nreceived",
    side: "right",
  });

  s.comment("Rejections");
  s.connect(verifying, rejected, {
    from: "b",
    to: "t",
    alt: true,
    label: "can't verify",
    side: "left",
  });
  s.connect(pending, rejected, {
    from: "b",
    to: "r",
    alt: true,
    label: "declined",
    side: "right",
    seg: 0,
  });

  s.comment("Legend");
  const lg = s.legend(x0, r2 + h + 34, [
    { kind: "hl", label: "the path an application should take" },
    { kind: "alt", label: "ends it" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
