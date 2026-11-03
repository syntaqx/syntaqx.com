// How a person and a pipeline reach production: SSO with device posture,
// a just-in-time grant, then a short-lived session to internal tools, hosts
// or cloud accounts; CI federates with OIDC and holds no stored keys.
// Embedded in content/docs/security/infrastructure-access.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, bw = 128, bh = 52, tw = 168, th = 44, tgap = 16;
  const s = sheet({ prefix: "iap", width: W });
  const tx = W - 20 - tw;
  const ty = 30;

  s.comment("Targets");
  const targets = [
    ["internal tools", "identity-aware proxy"],
    ["hosts", "session manager or\nSSH certificate"],
    ["cloud accounts", "role session, 1 to 12 h"],
  ].map(([label, sub], i) => s.node(tx, ty + i * (th + tgap), tw, th, label, { sub }));
  const [, hosts, cloud] = targets;

  s.comment("The human path");
  const y = hosts.cy - bh / 2;
  const person = s.node(20, y, bw, bh, "engineer", { kind: "actor", sub: "managed device" });
  const idp = s.node(188, y, bw, bh, "SSO", { sub: "phishing-resistant\nMFA, posture" });
  const jit = s.node(356, y, bw, bh, "access request", { sub: "reason, approval,\ntime limit" });
  s.connect(person, idp, { hl: true });
  s.connect(idp, jit, { hl: true });
  s.fanOut(jit, targets, { via: tx - 28, hl: true });

  s.comment("The pipeline path");
  const ci = s.node(356, cloud.y + cloud.h + 30, bw, 36, "CI job", { kind: "actor" });
  s.wire([ci.port("r"), [cloud.cx, ci.cy], [cloud.cx, cloud.y + cloud.h]], { label: "OIDC token, per job", side: "below", seg: 0 });

  s.comment("Audit");
  const sy = ci.y + ci.h + 26;
  const ly = s.span(20, W - 20, sy, "every grant, session and command lands in the audit trail");

  s.height = Math.ceil(ly + 20);
  return s.toString();
}
