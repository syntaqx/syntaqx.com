// The per-client consent handshake for a partner integration as a state
// machine: keys from the program, testing on a clone, terms per client,
// pending until the client accepts, denies or lets it lapse, then active
// until revoked. Embedded in
// content/books/property-tech/platform-architecture.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pt-pac", width: W });

  const w = 150, h = 44, cols = 4;
  const gap = (W - 40 - cols * w) / (cols - 1);
  const X = (i) => 20 + i * (w + gap);
  const r0 = 20, r1 = r0 + h + 60, r2 = r1 + h + 44;
  const st = (i, y, label, sub, o = {}) => s.node(X(i), y, w, h, label, { kind: "state", sub, ...o });

  s.comment("States");
  const reg = st(0, r0, "registered", "keys from the program");
  const test = st(1, r0, "testing", "on a clone of client data");
  const terms = st(2, r0, "terms accepted", "per approved client");
  const pending = st(3, r0, "pending", "no access to client data");
  const canceled = st(1, r1, "canceled", "no answer in 30 days", { end: true, fill: 1 });
  const denied = st(2, r1, "denied", "the client denies", { end: true, fill: 1 });
  const active = st(3, r1, "active", "scoped to its properties", { hl: true });
  const revoked = st(3, r2, "revoked", "the operator revokes", { end: true, fill: 1 });

  s.comment("Transitions");
  s.connect(reg, test, { hl: true });
  s.connect(test, terms, { hl: true });
  s.connect(terms, pending, { hl: true });
  s.fanOut(pending, [canceled, denied, active], { from: "b", to: "t", via: r0 + h + 26, hl: 2 });
  s.connect(active, revoked, { from: "b", to: "t" });

  s.comment("Legend");
  const lg = s.legend(20, r2 + 14, [
    { kind: "hl", label: "the path to access" },
    { kind: "end", label: "terminal state" },
  ], { width: X(3) - 40 });
  s.height = Math.ceil(Math.max(lg.y, revoked.y2) + 20);
  return s.toString();
}
