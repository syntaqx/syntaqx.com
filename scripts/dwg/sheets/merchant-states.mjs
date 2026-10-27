// Merchant states and what each allows, as a standard diagram: the four
// states in a row with their transitions above, payments and payouts per
// state in a grid below. Embedded in content/books/payments/merchant-onboarding.md.
import { sheet } from "../kit.mjs";

const STATES = [
  { label: "pending", payments: "limited or no", payouts: "no", fill: 1 },
  { label: "active", payments: "yes", payouts: "yes", hl: true },
  { label: "restricted", payments: "yes or limited", payouts: "no", fill: 1 },
  { label: "rejected", payments: "no", payouts: "balance, after a hold", end: true, fill: 1 },
];

export default function draw() {
  const W = 760, x = 20, headW = 90, w = 110, h = 30;
  const s = sheet({ prefix: "mst", width: W });
  const gap = (W - 2 * x - headW - STATES.length * w) / (STATES.length - 1);
  const X = (i) => x + headW + i * (w + gap);
  const busY = 40, r = 96;

  s.comment("States");
  const [pending, active, restricted, rejected] = STATES.map((st, i) =>
    s.node(X(i), r, w, h, st.label, { kind: "state", code: true, hl: st.hl, end: st.end, fill: st.fill }),
  );

  s.comment("Transitions");
  s.connect(pending, active, { hl: true, label: "verified" });
  s.connect(active, restricted, { alt: true, label: "overdue" });
  s.connect(restricted, active, { from: "t", to: "t", at: [0.25, 0.75], via: r - 24, label: "requirement met", side: "above" });

  s.comment("From any state to rejected");
  const drops = [pending.port("t", 0.5), active.port("t", 0.25), restricted.port("t", 0.75)];
  s.wire([drops[0], [drops[0][0], busY], [rejected.cx, busY], rejected.port("t")], {
    alt: true,
    seg: 1,
    label: "from any state: failed verification, a prohibited business, or confirmed fraud",
  });
  drops.slice(1).forEach((p) => s.wire([p, [p[0], busY]], { alt: true, arrow: "none" }));

  s.comment("What each state allows");
  const rowH = 24, t0 = r + h + 10;
  [["payments", "payments"], ["payouts", "payouts"]].forEach(([head, key], j) => {
    const cy = t0 + j * rowH + rowH / 2;
    s.text(x, cy + 3, head, "th");
    STATES.forEach((st, i) => s.text(X(i) + w / 2, cy + 3, st[key], st.hl ? "tc hl" : "tc", "middle"));
  });
  for (let j = 0; j <= 2; j++) s.line(x, t0 + j * rowH, W - x, t0 + j * rowH, "tbl");

  s.comment("Legend");
  const lg = s.legend(X(0), t0 + 2 * rowH + 26, [
    { kind: "hl", label: "the way to active" },
    { kind: "alt", label: "restricts or rejects" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
