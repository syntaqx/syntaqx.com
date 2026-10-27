// The issuing stack as a standard diagram: the authorization path from the
// cardholder through the acceptance side and the network to the issuer
// processor and the program manager, with the issuing leg in the accent;
// the sponsor bank, card production and risk vendors underneath. Embedded in
// content/books/payments/card-issuing.md.
import { sheet } from "../kit.mjs";

const PARTIES = [
  ["cardholder", ["card, PIN or", "wallet token"], "actor"],
  ["acquirer", ["for the merchant:", "the other side"]],
  ["card network", ["routes, clears,", "settles"]],
  ["issuer processor", ["authorizes, posts,", "keeps the ledger"]],
  ["program manager", ["funds or decides", "in real time"]],
];

const SUPPORT = [
  // [column, label, sub lines, wire label]
  [2, "sponsor bank", ["BIN, funds,", "liability"], "settlement"],
  [3, "card production", ["emboss, chip,", "PIN mailer, ship"], "card file"],
  [4, "risk vendors", ["KYC, sanctions,", "fraud scores"], "checks"],
];

export default function draw() {
  const W = 760, n = PARTIES.length, w = 128, h = 30, y = 44;
  const s = sheet({ prefix: "iss", width: W });
  const gap = (W - 40 - 3 - n * w) / (n - 1); // 3 of slack for the actor's shadow at the left
  const X = (i) => 20 + i * (w + gap);

  s.comment("The authorization path");
  const nodes = PARTIES.map(([label, , kind], i) => s.node(X(i), y, w, h, label, { kind: kind ?? "process" }));
  let bottom = y + h;
  PARTIES.forEach(([, sub], i) =>
    sub.forEach((l, j) => {
      s.text(nodes[i].cx, y + h + 16 + j * 11.5, l, "sl", "middle");
      bottom = Math.max(bottom, y + h + 16 + j * 11.5 + 4);
    }),
  );

  s.comment("Requests on the upper ports, responses on the lower; the issuing leg in the accent");
  nodes.slice(1).forEach((nd, i) => {
    const hl = i >= 2; // network to issuer processor to program manager
    s.connect(nodes[i], nd, { at: [0.3, 0.3], hl });
    s.connect(nd, nodes[i], { from: "l", to: "r", at: [0.7, 0.7], hl });
  });
  s.text((nodes[2].cx + nodes[4].cx) / 2, y - 12, "authorization: request out, answer back in seconds", "sl hl", "middle");

  s.comment("What stands behind the issuer");
  const sy = bottom + 44, sh = 30;
  let last = sy + sh;
  SUPPORT.forEach(([col, label, sub, wl]) => {
    const top = nodes[col];
    const box = s.node(top.x, sy, w, sh, label, { kind: col === 2 ? "store" : "process" });
    s.wire([[top.cx, bottom + 6], box.port("t")], { label: wl, side: "left" });
    sub.forEach((l, j) => {
      s.text(box.cx, sy + sh + 16 + j * 11.5, l, "sl", "middle");
      last = Math.max(last, sy + sh + 16 + j * 11.5 + 4);
    });
  });

  s.height = Math.ceil(last + 20);
  return s.toString();
}
