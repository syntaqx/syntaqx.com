// Who is who in a community association: the manager contracts with the
// association and runs its accounts as agent; owners are members with an
// ownership account per unit; an owner's tenant is bound by the rules but
// its fines land on the owner. Embedded in
// content/books/property-tech/community-associations.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, bw = 170, h = 48;
  const A = 20, B = 275, C = W - 23 - bw;
  const s = sheet({ prefix: "pt-cap", width: W });

  s.comment("The three parties");
  const r1 = 24;
  const mgr = s.node(A, r1, bw, h, "management company", { sub: "the tenant; the agent" });
  const assoc = s.node(B, r1, bw, h, "association", { hl: true, sub: "the client; acts by its board" });
  const owners = s.node(C, r1, bw, h, "owners", { kind: "actor", sub: "members; elect the board" });
  s.connect(mgr, assoc, { label: "management\nagreement", side: "above" });
  s.connect(owners, assoc, { from: "l", to: "r", label: "members", side: "above" });

  s.comment("The association's money, held in trust");
  const r2 = r1 + h + 52, sw = 88, gx = B - 10;
  s.group(gx, r2 - 10, 2 * sw + 8 + 20, 40 + 20, "held in trust");
  s.node(B, r2, sw, 40, "reserve", { kind: "store", sub: "restricted" });
  const operating = s.node(B + sw + 8, r2, sw, 40, "operating", { kind: "store" });
  const by = r2 + 40 + 12 + 22;
  s.wire([mgr.port("b"), [mgr.cx, by], [operating.cx, by], operating.port("b")], { label: "runs books and banks as agent", side: "below", seg: 1 });

  s.comment("Owners, units and occupants");
  const acct = s.node(C, r2 - 4, bw, h, "ownership account", { kind: "store", sub: ["one per owner per unit;", "closes at sale"] });
  s.connect(owners, acct, { from: "b", to: "t" });
  s.connect(acct, operating, { from: "l", to: "r", label: "assessments", side: "above" });
  const occ = s.node(C, acct.y2 + 44, bw, 40, "occupant", { kind: "ghost", sub: "an owner's tenant" });
  s.connect(occ, acct, { from: "t", to: "b", alt: true, label: "fines land here", side: "left" });

  s.height = Math.ceil(Math.max(occ.y2, by + 18) + 20);
  return s.toString();
}
