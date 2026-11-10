// The pay run state machine an embedded payroll partner exposes, in the core
// model's names: the happy path in the accent, reopen as a back edge, dashed
// exits for a cancel, a returned client debit and a returned credit.
// Embedded in content/books/workforce/embedded-payroll.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "wfeps", width: W });

  const w = 100,
    h = 30,
    gap = 55;
  const x0 = (W - (5 * w + 4 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r1 = 80,
    r2 = 190;
  const st = (i, y, label, o = {}) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const draft = st(0, r1, "draft");
  const calculated = st(1, r1, "calculated");
  const approved = st(2, r1, "approved");
  const funding = st(3, r1, "funding");
  const paid = st(4, r1, "paid", { end: true, hl: true });
  const canceled = st(1, r2, "canceled", { end: true, fill: 1 });
  const failed = st(3, r2, "failed", { fill: 1 });
  const partial = st(4, r2, "partially_paid", { fill: 1 });

  s.comment("The happy path");
  s.connect(draft, calculated, { hl: true, label: "preview" });
  s.connect(calculated, approved, { hl: true, label: "approve" });
  s.connect(approved, funding, { hl: true, label: "deadline" });
  s.connect(funding, paid, { hl: true, label: "check\ndate" });

  s.comment("Reopen before the deadline");
  s.connect(approved, draft, {
    from: "t",
    to: "t",
    via: r1 - 34,
    label: "reopened before the deadline: inputs unlock",
    side: "above",
  });

  s.comment("Exits");
  s.connect(approved, canceled, {
    from: "b",
    to: "r",
    alt: true,
    label: "canceled",
    side: "right",
  });
  s.connect(funding, failed, {
    from: "b",
    to: "t",
    alt: true,
    label: "client debit\nreturned",
    side: "left",
  });
  s.connect(paid, partial, {
    from: "b",
    to: "t",
    alt: true,
    label: "a credit\nreturns",
    side: "right",
  });
  s.connect(failed, funding, {
    from: "r",
    to: "r",
    at: [0.5, 0.8],
    via: X(3) + w + 20,
    label: "wired",
    side: "left",
    seg: 1,
  });

  s.comment("Legend");
  const lg = s.legend(x0, r2 + h + 34, [
    { kind: "hl", label: "the path a pay run should take" },
    { kind: "flow", label: "recovery or reopen" },
    { kind: "alt", label: "exception" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
