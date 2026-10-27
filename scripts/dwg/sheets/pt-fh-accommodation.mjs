// A reasonable accommodation request as a case: any channel opens it,
// verification only when the need isn't obvious and sealed when asked for,
// alternatives before any denial, and a grant that becomes configuration.
// Embedded in content/books/property-tech/fair-housing.md.
import { sheet } from "../kit.mjs";

const CHANNELS = ["portal", "email", "work order", "leasing chat", "AI agent"];

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pt-fha", width: W });

  s.comment("Any channel, no form required");
  const ch = s.row(20, 20, 720, CHANNELS, { h: 28, gap: 16 });

  s.comment("The case and its clock");
  const r2 = 104, h2 = 44;
  const kase = s.node(20, r2, 140, h2, "case", { sub: "received, respond-by" });
  const obvious = s.node(200, r2 - 8, 116, h2 + 16, "obvious?", { kind: "decision" });
  const inter = s.node(356, r2, 150, h2, "interactive", { sub: "offers, alternatives" });
  const grant = s.node(560, r2 - 8, W - 20 - 560, h2 + 16, "grant", { hl: true, sub: ["waive pet fees, assign", "a space, move a clock"] });
  s.fanIn(ch, kase, { from: "b", to: "t", via: ch.bottom + 18 });
  s.connect(kase, obvious);
  s.connect(obvious, inter, { label: "yes", side: "above" });
  s.connect(inter, grant, { hl: true });
  s.note(kase, "undue delay\ncounts as denial", { anchor: "left", dy: 20 });

  s.comment("Verification, sealed; denial only after alternatives");
  const r3 = r2 + h2 + 50;
  const verify = s.node(obvious.cx - 80, r3, 160, h2, "verification", { kind: "store", sub: "sealed, access logged" });
  s.connect(obvious, verify, { from: "b", to: "t", label: "no", side: "right" });
  s.connect(verify, inter, { from: "r", to: "b", at: [0.5, 0.3] });
  const deny = s.node(560, r3 + 20, W - 20 - 560, h2, "deny", { end: true, sub: "burden or alteration" });
  s.connect(inter, deny, { from: "b", to: "l", at: [0.75, 0.5], alt: true, label: "no agreement", side: "above", seg: 1 });

  s.height = Math.ceil(deny.y2 + 20);
  return s.toString();
}
