// The issuer's authorization decision path as a standard diagram: the
// request arrives, the issuer processor runs card checks and spend controls,
// the program's real-time webhook decides (accented), funds and risk are
// checked, and the response goes back with a hold. A webhook that misses its
// budget falls to a fallback configured in advance; an issuer that misses the
// network's limit is answered for by network stand-in. Embedded in
// content/books/payments/issuer-processing.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { head: "network", label: "request", sub: ["ISO 8583 or", "processor JSON"] },
  { head: "processor", label: "card checks", sub: ["status, expiry,", "PIN, CVV and", "cryptograms"] },
  { head: "processor", label: "spend rules", sub: ["MCC, country,", "limits, velocity"] },
  { head: "program", label: "auth webhook", sub: ["JIT funding,", "own rules"], hl: true, headHl: true },
  { head: "processor", label: "funds, risk", sub: ["balance or line,", "fraud score"] },
  { head: "issuer", label: "response", sub: ["code, approved", "amount, hold"] },
];

export default function draw() {
  const W = 760, w = 106, gap = 16, h = 28;
  const total = STAGES.length * w + (STAGES.length - 1) * gap;
  const x0 = (W - total) / 2;
  const s = sheet({ prefix: "pm-iap", width: W });

  s.comment("Decision path");
  const { nodes, bottoms } = s.pipeline(x0, 40, STAGES, { w, h, gap, hlArrows: [2, 3] });
  const [network, , , hook, , response] = nodes;

  s.comment("Fallbacks");
  const fy = Math.max(...bottoms) + 40, fh = 40, fw = 150;
  const fallback = s.node(hook.cx - fw / 2, fy, fw, fh, "configured fallback", { sub: "set before the timeout" });
  s.wire([[hook.cx, bottoms[3] + 6], fallback.port("t")], { alt: true, label: "no answer\nin budget", side: "right" });
  s.wire([fallback.port("r"), [response.cx, fallback.cy], [response.cx, bottoms[5] + 6]], { alt: true });

  const stip = s.node(network.x, fy, fw, fh, "network stand-in", { sub: "issuer's parameters" });
  s.wire([[network.cx, bottoms[0] + 6], [network.cx, stip.y]], { alt: true, label: "issuer silent\npast the limit", side: "right" });

  s.comment("Time budgets");
  const sy1 = fy + fh + 30;
  s.span(hook.x, hook.x2, sy1, "webhook budget, set by the processor", { hl: true });
  const sy2 = sy1 + 34;
  s.span(nodes[1].x, response.x2, sy2, "whole issuer answer, inside the network's time limit");

  s.height = Math.ceil(sy2 + 34);
  return s.toString();
}
