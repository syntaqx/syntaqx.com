// An ACATS transfer on the receiving side: the path to a closed transfer in
// the accent, a dashed exception and a dashed fail detour below.
// Embedded in content/books/investing-and-digital-assets/funding-and-transfers.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "iac", width: W });

  // Grid: six states on the main row, the exception and the fails below.
  const w = 100,
    h = 30,
    gap = 24;
  const x0 = (W - (6 * w + 5 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r1 = 24,
    r2 = 110;
  const st = (i, y, label, o = {}) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const submitted = st(0, r1, "submitted");
  const validated = st(1, r1, "validated");
  const settling = st(2, r1, "settling");
  const completed = st(3, r1, "completed");
  const residuals = st(4, r1, "residuals_open");
  const closed = st(5, r1, "closed", { end: true, hl: true });
  const exception = st(0, r2, "exception", { end: true, fill: 1 });
  const fails = st(2, r2, "fails_open");

  s.comment("The path to a closed transfer");
  s.connect(submitted, validated, { hl: true });
  s.connect(validated, settling, { hl: true });
  s.connect(settling, completed, { hl: true });
  s.connect(completed, residuals, { hl: true });
  s.connect(residuals, closed, { hl: true });

  s.comment("Exception and fails");
  s.connect(submitted, exception, {
    from: "b",
    to: "t",
    alt: true,
    label: "carrying firm\nobjects",
    side: "right",
  });
  s.connect(settling, fails, {
    from: "b",
    to: "t",
    alt: true,
    label: "lines fail",
    side: "left",
  });
  s.connect(fails, completed, {
    from: "r",
    to: "b",
    label: "fails resolved",
    side: "right",
    seg: 1,
  });

  s.comment("Legend");
  const lg = s.legend(x0, r2 + h + 40, [
    { kind: "hl", label: "the path a transfer should take" },
    { kind: "alt", label: "exception or fail" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
