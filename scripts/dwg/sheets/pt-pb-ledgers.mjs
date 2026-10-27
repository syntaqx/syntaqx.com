// The three ledgers that must never mix, as a money flow in bands: the
// property's (the owner's money, held in trust), the manager's (fees under
// each agreement) and the software vendor's (subscriptions and transaction
// revenue). Embedded in content/books/property-tech/property-business.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pt-pbl", width: W });

  // Bands on the right; the resident sits outside them on the left.
  const bx = 190, bw = W - 20 - bx, bh = 72, bgap = 64;
  const top = 40;
  const B = (i) => top + i * (bh + bgap);
  const lw = 230, lh = 44, lx = bx + 24;
  const rw = 150, rx = bx + bw - 24 - rw;
  const ly = (i) => B(i) + (bh - lh) / 2;

  s.comment("Bands");
  s.group(bx, B(0), bw, bh, "the property's money", { sub: "owner's, held in trust", hl: true });
  s.group(bx, B(1), bw, bh, "the manager's money", { sub: "per management agreement" });
  s.group(bx, B(2), bw, bh, "the software's money", { sub: "per unit, plan or transaction" });

  s.comment("Ledgers");
  const prop = s.node(lx, ly(0), lw, lh, "property ledger", { kind: "store", hl: true, sub: "rent, other income, expenses" });
  const mgr = s.node(lx, ly(1), lw, lh, "manager's ledger", { kind: "store", sub: "fees earned" });
  const sw = s.node(lx, ly(2), lw, lh, "vendor's ledger", { kind: "store", sub: "subscription, transaction revenue" });

  s.comment("Parties");
  const resident = s.node(20, ly(0) + 6, 120, 32, "resident", { kind: "actor" });
  const owner = s.node(rx, ly(0) + 6, rw, 32, "owner", { kind: "actor" });
  const staff = s.node(rx, ly(1) + 6, rw, 32, "on-site staff", { kind: "actor" });

  s.comment("Flows");
  s.connect(resident, prop, { hl: true, label: "rent, fees", side: "above" });
  s.connect(prop, owner, { hl: true, label: "distribution", side: "above" });
  s.connect(prop, mgr, { from: "b", to: "t", at: [0.75, 0.75], label: "management fee,\npayroll reimbursed", side: "left" });
  s.connect(mgr, staff, { label: "payroll", side: "above" });
  s.connect(mgr, sw, { from: "b", to: "t", at: [0.75, 0.75], label: "subscription", side: "left" });
  s.connect(sw, mgr, { from: "t", to: "b", at: [0.92, 0.92], label: "revenue share,\nby contract", side: "right" });
  // Transaction fees a resident pays straight to the vendor bypass the property's ledger.
  const [tx] = resident.port("b", 0.15);
  s.wire([[tx, resident.y2], [tx, sw.cy], sw.port("l")], {
    seg: 1, side: "above", shift: -0.12, label: "convenience, screening,\ninsurance, reporting",
  });

  s.height = Math.ceil(B(2) + bh + 20);
  return s.toString();
}
