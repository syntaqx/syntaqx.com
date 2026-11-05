// A license application as a state machine: the path to an active
// registration in the accent, the information-request detour and the
// conditional grant below, denial and withdrawal as dashed exits.
// Embedded in content/books/investing-and-digital-assets/crypto-licensing.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ila", width: W });

  // Grid: five states on the main row, two detours and two exits below.
  const w = 116,
    h = 30,
    gap = 32;
  const x0 = (W - (5 * w + 4 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const r1 = 24,
    r2 = 116,
    r3 = 260;
  const st = (i, y, label, o = {}) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const drafting = st(0, r1, "drafting");
  const submitted = st(1, r1, "submitted");
  const review = st(2, r1, "under_review");
  const granted = st(3, r1, "granted");
  const active = st(4, r1, "active", { hl: true });
  const info = st(1, r2, "info_requested");
  const conditional = st(3, r2, "conditional");
  const denied = st(2, r3, "denied", { end: true, fill: 1 });
  const withdrawn = st(1, r3, "withdrawn", { end: true, fill: 1 });

  s.comment("The path to an active registration");
  s.connect(drafting, submitted, { hl: true });
  s.connect(submitted, review, { hl: true });
  s.connect(review, granted, { hl: true });
  s.connect(granted, active, { hl: true });

  s.comment("Information requests pause the clock");
  s.connect(submitted, info, { from: "b", to: "t", label: "incomplete", side: "left" });
  s.connect(info, review, {
    from: "r",
    to: "b",
    at: [0.5, 0.2],
    label: "answered",
    side: "left",
    seg: 1,
  });

  s.comment("Conditional grant");
  s.connect(review, conditional, { from: "b", to: "l", at: [0.8, 0.5] });
  s.connect(conditional, active, {
    from: "r",
    to: "b",
    label: "conditions\nmet",
    side: "left",
    seg: 1,
  });

  s.comment("Exits");
  s.connect(review, denied, {
    from: "b",
    to: "t",
    at: [0.5, 0.5],
    alt: true,
    label: "refused",
    side: "right",
  });
  s.connect(info, withdrawn, { from: "b", to: "t", alt: true, label: "withdrawn", side: "left" });

  s.comment("Legend");
  const lg = s.legend(x0, r3 + h + 36, [
    { kind: "hl", label: "the path an application should take" },
    { kind: "alt", label: "ends it" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
