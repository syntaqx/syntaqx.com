// Common-input-ownership clustering on a small Bitcoin transaction graph:
// two transactions, the addresses one owner controls in the accent, the
// change output found by the one-time change heuristic, and a known
// exchange deposit address as the attribution.
// Embedded in content/books/investing-and-digital-assets/blockchain-analytics.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "icg", width: W });

  // Five columns: inputs, tx1, outputs of tx1, tx2, outputs of tx2.
  const aw = 112,
    ah = 40,
    tw = 84,
    gap = 34;
  const total = 3 * aw + 2 * tw + 4 * gap;
  const x0 = (W - total) / 2;
  const cx = [x0, x0 + aw + gap];
  cx.push(cx[1] + tw + gap);
  cx.push(cx[2] + aw + gap);
  cx.push(cx[3] + tw + gap);
  const R = (i) => 24 + i * 70; // rows

  const addr = (col, row, label, sub, o = {}) =>
    s.node(cx[col], R(row), aw, ah, label, { kind: "store", code: true, sub, ...o });
  const tx = (col, row, label, sub) =>
    s.node(cx[col], R(row) + 35 - 20, tw, ah, label, { code: true, sub });

  s.comment("Addresses and transactions");
  const A = addr(0, 0, "A", "0.6 BTC", { hl: true });
  const B = addr(0, 1, "B", "0.5 BTC", { hl: true });
  const t1 = tx(1, 0, "tx1", "fee 0.0001");
  const X = addr(2, 0, "X", "0.8 · exchange", { kind: "actor" });
  const C = addr(2, 1, "C", "0.2999 · change", { hl: true });
  const D = addr(2, 2, "D", "1.0 BTC", { hl: true });
  const t2 = tx(3, 1, "tx2", "fee 0.0001");
  const Y = addr(4, 1, "Y", "1.2 BTC");
  const Z = addr(4, 2, "Z", "0.0998 BTC");

  s.comment("Inputs and outputs");
  s.connect(A, t1, { to: "l", at: [0.5, 0.3] });
  s.connect(B, t1, { to: "l", at: [0.5, 0.7] });
  s.connect(t1, X, { from: "r", at: [0.3, 0.5] });
  s.connect(t1, C, { from: "r", at: [0.7, 0.5] });
  s.connect(C, t2, { to: "l", at: [0.5, 0.3] });
  s.connect(D, t2, { to: "l", at: [0.5, 0.7] });
  s.connect(t2, Y, { from: "r", at: [0.3, 0.5] });
  s.connect(t2, Z, { from: "r", at: [0.7, 0.5] });

  s.comment("Legend");
  const lg = s.legend(x0, R(2) + ah + 34, [
    { kind: "store", label: "address" },
    { kind: "actor", label: "attributed service" },
    { kind: "node", label: "transaction" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
