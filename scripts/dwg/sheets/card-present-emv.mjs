// A chip transaction as a multi-party flow in lanes: the card signs with
// an ARQC, the online round trip to the issuer (the accent) returns an
// ARPC, and an offline decision stays at the terminal (dashed).
// Embedded in content/books/payments/card-present.md.
import { sheet } from "../kit.mjs";

const PARTIES = [
  ["chip card", "a key it\nnever reveals"],
  ["terminal", "asks for\na cryptogram"],
  ["acquirer", "and its\nprocessor"],
  ["network", "routes it"],
  ["issuer", "holds the\nsame key"],
];

export default function draw() {
  const W = 760, x = 20, titleW = 150;
  const s = sheet({ prefix: "cpe", width: W });
  const cw = (W - 2 * x - titleW) / PARTIES.length;
  const CX = (i) => x + titleW + (i + 0.5) * cw;
  const CARD = CX(0), TERM = CX(1), ISS = CX(4);

  const [P, A, B, C] = s.lanes({
    x, y: 20, w: W - 2 * x, titleW,
    lanes: [
      { label: "Parties", sub: "a chip transaction", h: 92 },
      { label: "1 · The card signs", sub: "this transaction,\nand only this one", h: 74 },
      { label: "2 · Online", sub: "only the issuer\ncan check it", h: 104, hl: true },
      { label: "Offline", sub: "no issuer check", h: 74 },
    ],
  });

  s.comment("Parties");
  PARTIES.forEach(([name, role], i) => {
    const n = s.node(CX(i) - 50, P.y + 16, 100, 28, name, { kind: i === 0 ? "actor" : "process" });
    role.split("\n").forEach((l, j) => s.text(n.cx, n.y + n.h + 18 + j * 11, l, "vs", "middle"));
  });

  for (const cx of [CARD, TERM]) s.line(cx, P.y + P.h, cx, C.y + C.h, "ctr");
  s.line(ISS, P.y + P.h, ISS, B.y + B.h, "ctr");

  // Notes beside a message start right of the terminal's lifeline.
  const note = (y, lines) => lines.forEach((l, j) => s.text(TERM + 14, y + j * 11, l, "sl"));

  s.comment("1. The card signs");
  s.wire([[CARD, A.y + 40], [TERM, A.y + 40]], { start: "dot", label: "ARQC" });
  note(A.y + 37, ["signed over the amount, the date, a counter", "and the terminal's random number"]);

  s.comment("2. Online");
  s.wire([[TERM, B.y + 36], [ISS, B.y + 36]], { start: "dot", hl: true, label: "authorization with the ARQC (DE 55); the issuer recomputes it" });
  s.wire([[ISS, B.y + 66], [TERM, B.y + 66]], { start: "dot", hl: true, side: "below", label: "approved + ARPC: proof it came from the real issuer" });

  s.comment("Offline");
  s.wire([[CARD, C.y + 40], [TERM, C.y + 40]], { start: "dot", alt: true, label: "TC or AAC" });
  note(C.y + 37, ["TC approves or AAC declines at the terminal;", "the issuer only sees it in clearing"]);

  s.height = Math.ceil(C.y + C.h + 20);
  return s.toString();
}
