// Inside the tenant, two trees cross at the property: the operator's
// portfolio tree, down which configuration inherits, and the owner's tree of
// entities and shares, up which money rolls; shared reference data sits
// outside every tenant. Embedded in
// content/books/property-tech/platform-architecture.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pt-ptt", width: W });

  const nw = 170, nh = 36, gx = 40, top = 44;
  const lx = gx + 24, rx = W - gx - 24 - nw;
  const row = (i) => top + 20 + i * (nh + 28);

  s.comment("Operator's tree");
  const tenant = s.node(lx, row(0), nw, nh, "management company", { sub: "the tenant, the operator" });
  const region = s.node(lx, row(1), nw, nh, "portfolio", { sub: "region, district, fund" });
  const owner = s.node(rx, row(0), nw, nh, "owner", { sub: "person, fund or investors" });
  const entity = s.node(rx, row(1), nw, nh, "legal entity", { sub: "ownership shares" });
  const pw = 190;
  const prop = s.node(W / 2 - pw / 2, row(2) + 18, pw, nh + 4, "property", { hl: true, sub: "rules, permissions, reports meet" });

  s.connect(tenant, region, { from: "b", to: "t" });
  s.connect(region, prop, { from: "b", to: "l" });
  s.connect(prop, entity, { from: "r", to: "b", label: "title", side: "above" });
  s.connect(entity, owner, { from: "t", to: "b" });

  s.bracket(tenant.y, region.y2, lx + nw + 14, "configuration\ninherits down");
  s.bracket(owner.y, entity.y2, rx - 14, "money\nrolls up", { side: "l" });

  const gb = prop.y2 + 20;
  s.group(gx, top, W - 2 * gx, gb - top, "one tenant", { sub: "every row carries the tenant" });

  s.comment("Shared reference data");
  const ref = s.node(W / 2 - 160, gb + 48, 320, nh, "shared reference data", { kind: "ghost", sub: "jurisdictions, rules, income limits: no tenant" });
  s.connect(ref, prop, { from: "t", to: "b", label: "read by every tenant", side: "right", shift: 0.45 });

  s.height = Math.ceil(ref.y2 + 20);
  return s.toString();
}
