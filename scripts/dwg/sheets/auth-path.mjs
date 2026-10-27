// One card-not-present authorization through five systems: requests on the
// upper ports, responses on the lower, the ISO 8583 leg in the accent, and
// the network's stand-in dashed below. Embedded in
// content/books/payments/inside-a-processor.md.
import { sheet } from "../kit.mjs";

const SYSTEMS = [
  ["checkout", ["timeout 15 s", "or more"]],
  ["provider", ["risk, vault"]],
  ["processor", ["JSON to", "ISO 8583"]],
  ["network", []],
  ["issuer", ["averages 5 s", "or less"]],
];

export default function draw() {
  const W = 760, w = 112, h = 30, y = 44;
  const s = sheet({ prefix: "auth", width: W });
  const gap = (W - 40 - SYSTEMS.length * w) / (SYSTEMS.length - 1);

  s.comment("Systems");
  const nodes = s.row(20, y, W - 40, SYSTEMS.map(([l]) => l), { h, gap });
  let bottom = y + h;
  SYSTEMS.forEach(([, sub], i) =>
    sub.forEach((l, j) => {
      s.text(nodes[i].cx, y + h + 16 + j * 11.5, l, "sl", "middle");
      bottom = Math.max(bottom, y + h + 16 + j * 11.5 + 4);
    }),
  );

  s.comment("Requests out on the upper ports, responses back on the lower");
  nodes.slice(1).forEach((n, i) => {
    const hl = i >= 2; // processor to network to issuer: the ISO 8583 leg
    s.connect(nodes[i], n, { at: [0.3, 0.3], hl });
    s.connect(n, nodes[i], { from: "l", to: "r", at: [0.7, 0.7], hl });
  });
  s.text((nodes[2].cx + nodes[4].cx) / 2, y - 12, "0100 out, 0110 back", "sl hl", "middle");

  s.comment("Stand-in");
  const net = nodes[3];
  const sw = 108;
  const standIn = s.node(net.cx - sw / 2, bottom + 30, sw, 28, "stand-in", { kind: "ghost" });
  s.connect(net, standIn, { from: "b", to: "t", alt: true });
  ["answers if the issuer", "is down or too slow"].forEach((l, j) => s.text(standIn.x + sw + 12, standIn.cy - 2.5 + j * 11, l, "sl"));

  s.height = Math.ceil(standIn.y + standIn.h + 20);
  return s.toString();
}
