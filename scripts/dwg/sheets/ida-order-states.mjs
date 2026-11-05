// An order's states in the OMS: the path to filled in the accent, pending
// cancel and replace requests below, and the dashed rejection.
// Embedded in content/books/investing-and-digital-assets/orders-and-order-types.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ios", width: W });

  // Grid: five columns, three rows.
  const w = 116,
    h = 30,
    gap = 24;
  const x0 = (W - (5 * w + 4 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r1 = 24,
    r2 = 124,
    r3 = 204;
  const st = (i, y, label, o = {}) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const created = st(0, r1, "new");
  const accepted = st(1, r1, "accepted");
  const routed = st(2, r1, "routed");
  const partial = st(3, r1, "partially_filled");
  const filled = st(4, r1, "filled", { end: true, hl: true });
  const rejected = st(1, r2, "rejected", { end: true, fill: 1 });
  const cancelPending = st(2, r2, "cancel_pending");
  const replacePending = st(3, r2, "replace_pending");
  const canceled = st(2, r3, "canceled", { end: true });
  const replaced = st(3, r3, "replaced", { end: true });

  s.comment("The path to filled");
  s.connect(created, accepted, { hl: true });
  s.connect(accepted, routed, { hl: true });
  s.connect(routed, partial, { hl: true });
  s.connect(partial, filled, { hl: true });

  s.comment("Rejection");
  s.connect(accepted, rejected, {
    from: "b",
    to: "t",
    alt: true,
    label: "risk or venue\nrejects",
    side: "left",
  });

  s.comment("Cancel and replace requests, answered by the venue");
  s.connect(routed, cancelPending, {
    from: "b",
    to: "t",
    at: [0.3, 0.3],
    label: "cancel\nrequested",
    side: "left",
  });
  s.connect(cancelPending, routed, {
    from: "t",
    to: "b",
    at: [0.7, 0.7],
    label: "venue\nrejects",
    side: "right",
  });
  s.connect(cancelPending, canceled, {
    from: "b",
    to: "t",
    label: "venue confirms",
    side: "right",
  });
  s.connect(partial, replacePending, {
    from: "b",
    to: "t",
    at: [0.7, 0.7],
    label: "replace\nrequested",
    side: "right",
  });
  s.connect(replacePending, replaced, {
    from: "b",
    to: "t",
    label: "venue confirms",
    side: "right",
  });

  s.comment("Legend");
  const lg = s.legend(x0, r3 + h + 40, [
    { kind: "hl", label: "the path an order should take" },
    { kind: "alt", label: "rejected before routing" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
