// The five ACH parties and what travels between them, as a multi-party flow
// in lanes: entries one way and returns back (the accent is the entry),
// then which way the money goes for a credit and a debit. Operator names
// stay in the alt text. Embedded in content/books/payments/ach.md.
import { sheet } from "../kit.mjs";

const PARTIES = [
  ["Originator", "has the\nauthorization"],
  ["ODFI", "submits,\nand is liable"],
  ["ACH operator", "the Fed, or a\nprivate operator"],
  ["RDFI", "posts\nthe entry"],
  ["Receiver", "credited\nor debited"],
];

export default function draw() {
  const W = 760, x = 20, titleW = 150;
  const s = sheet({ prefix: "achn", width: W });
  const cw = (W - 2 * x - titleW) / PARTIES.length;
  const CX = (i) => x + titleW + (i + 0.5) * cw;
  const ORIG = CX(0), RECV = CX(4);

  const [P, E, C, D] = s.lanes({
    x, y: 20, w: W - 2 * x, titleW,
    lanes: [
      { label: "Parties", sub: "five touch\nevery entry", h: 92 },
      { label: "Entries", sub: "always toward\nthe Receiver", h: 98, hl: true },
      { label: "Credit", sub: "payroll, payouts,\nrefunds", h: 62 },
      { label: "Debit", sub: "subscriptions,\ninvoices", h: 62 },
    ],
  });

  s.comment("Parties");
  PARTIES.forEach(([name, role], i) => {
    const n = s.node(CX(i) - 50, P.y + 16, 100, 28, name, { kind: i === 0 || i === 4 ? "actor" : "process" });
    role.split("\n").forEach((l, j) => s.text(n.cx, n.y + n.h + 18 + j * 11, l, "vs", "middle"));
  });

  // Lifelines at the two ends of every message only.
  for (const cx of [ORIG, RECV]) s.line(cx, P.y + P.h, cx, D.y + D.h, "ctr");

  s.comment("Entries out, returns back");
  s.wire([[ORIG, E.y + 36], [RECV, E.y + 36]], { start: "dot", hl: true, label: "entries, in files, through every party" });
  s.wire([[RECV, E.y + 62], [ORIG, E.y + 62]], { start: "dot", alt: true, side: "below", label: "returns and notifications of change, the same way back" });

  s.comment("Which way the money goes");
  s.wire([[ORIG, C.y + 38], [RECV, C.y + 38]], { start: "dot", label: "money moves with the entry" });
  s.wire([[RECV, D.y + 38], [ORIG, D.y + 38]], { start: "dot", label: "money moves against it" });

  s.height = Math.ceil(D.y + D.h + 20);
  return s.toString();
}
