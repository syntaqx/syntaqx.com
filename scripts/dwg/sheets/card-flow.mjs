// The four card parties and the network between them, with the three
// message phases as lanes: authorization, clearing, settlement. A standard
// multi-party flow. Embedded in content/books/payments/card-payments.md.
import { sheet } from "../kit.mjs";

const PARTIES = [
  ["cardholder", "presents\nthe card"],
  ["merchant", "sells, then\ncaptures"],
  ["acquirer", "and its\nprocessor"],
  ["network", "routes, clears,\nrules"],
  ["issuer", "approves,\nthen pays"],
];

export default function draw() {
  const W = 760, x = 20, titleW = 150;
  const s = sheet({ prefix: "cf", width: W });
  const cw = (W - 2 * x - titleW) / PARTIES.length;
  const CX = (i) => x + titleW + (i + 0.5) * cw;
  const MER = CX(1), ISS = CX(4);

  // Lane heights follow from what each carries.
  const [P, A, C, S] = s.lanes({
    x, y: 20, w: W - 2 * x, titleW,
    lanes: [
      { label: "Parties", sub: "four parties, and the\nnetwork between them", h: 92 },
      { label: "1 · Authorization", sub: "in seconds\n0100 / 0110", h: 104 },
      { label: "2 · Clearing", sub: "capture and clearing\nin batches", h: 74 },
      { label: "3 · Settlement", sub: "settlement and funding\nlater", h: 74, hl: true },
    ],
  });

  s.comment("Parties");
  PARTIES.forEach(([name, role], i) => {
    const n = s.node(CX(i) - 46, P.y + 16, 92, 28, name, { kind: i === 3 ? "process" : "actor" });
    role.split("\n").forEach((l, j) => s.text(n.cx, n.y + n.h + 18 + j * 11, l, "vs", "middle"));
  });

  // Lifelines for the two ends of every message; the acquirer and network
  // sit on the path between them, so their lines would only cut the labels.
  for (const cx of [MER, ISS]) s.line(cx, P.y + P.h, cx, S.y + S.h, "ctr");

  s.comment("1. Authorization");
  s.wire([[MER, A.y + 36], [ISS, A.y + 36]], { start: "dot", label: "request: is this card good for this amount?" });
  s.wire([[ISS, A.y + 62], [MER, A.y + 62]], {
    start: "dot",
    side: "below",
    label: "approved with an auth code, or a decline code;\nnothing has moved yet",
  });

  s.comment("2. Capture and clearing");
  s.wire([[MER, C.y + 48], [ISS, C.y + 48]], { start: "dot", label: "the final amount, in a clearing file\nthe network matches to the authorization" });

  s.comment("3. Settlement and funding");
  s.wire([[ISS, S.y + 48], [MER, S.y + 48]], { start: "dot", hl: true, label: "money moves last, the other way,\nless interchange and fees" });

  s.height = Math.ceil(S.y + S.h + 20);
  return s.toString();
}
