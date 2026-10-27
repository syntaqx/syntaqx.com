// A credential's sync state: issued at move-in, revoked at move-out, with
// the revocation retried until the lock confirms it. Embedded in
// content/books/property-tech/access-and-smart-buildings.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, w = 104, h = 30, gap = 96;
  const x0 = (W - (4 * w + 3 * gap)) / 2;
  const X = (i) => x0 + i * (w + gap);
  const s = sheet({ prefix: "pt-acr", width: W });
  const r1 = 62, r2 = 156;
  const st = (i, y, label, o = {}) => s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("States");
  const pending = st(0, r1, "pending");
  const active = st(1, r1, "active");
  const revokePending = st(2, r1, "revoke pending");
  const revoked = st(3, r1, "revoked", { end: true, hl: true });
  const failed = st(2, r2, "failed", { fill: 1 });

  s.comment("Issue and revoke follow the lease");
  s.wire([[pending.cx, 22], pending.port("t")], { start: "dot", label: "lease.moved_in", labelCls: "tc", side: "right" });
  s.connect(pending, active, { label: "synced", side: "above" });
  s.connect(active, revokePending, { label: "lease.moved_out", labelCls: "tc", side: "above" });
  s.connect(revokePending, revoked, { hl: true, label: "lock confirms", side: "above" });

  s.comment("A revocation that doesn't confirm is retried");
  s.connect(revokePending, failed, { from: "b", to: "t", at: [0.3, 0.3], alt: true, label: "not confirmed", side: "left" });
  s.connect(failed, revokePending, { from: "t", to: "b", at: [0.7, 0.7], label: "retry, backoff", side: "right" });
  const ny = s.note(failed, "alert if still unconfirmed\nby the next move-in", { dy: 20 });

  s.comment("Legend");
  const lg = s.legend(X(0), ny + 30, [
    { kind: "hl", label: "revocation, the hard direction" },
    { kind: "alt", label: "sync failed" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
