// Portal access: four people, each holding a grant (role and scope) that
// points into one bill-to account or one of its properties. The owner's
// admin grant is the accented path. A standard diagram. Embedded in
// content/books/field-operations/customer-self-service.md.
import { sheet } from "../kit.mjs";

const ROWS = [
  ["account owner", "admin, all properties", "bill-to account"],
  ["spouse", "billing, all", "property A"],
  ["tenant", "booking, property B", "property B"],
  ["site auditor", "read-only, site 14", "site 14"],
];

export default function draw() {
  const W = 760, x = 20, h = 26, rowH = 40, top = 52, pad = 10;
  const s = sheet({ prefix: "fo-cssa", width: W });
  const pw = 150, gx = 250, gw = 180, aw = 180, ax = W - x - pad - aw;
  const Y = (i) => top + i * rowH;

  s.comment("Column heads");
  s.text(x, 24, "people who sign in", "th");
  s.text(gx, 24, "grant: role and scope", "th");
  s.text(ax - pad, 24, "one account", "th");
  s.line(x, 32, W - x, 32, "tbl");

  s.comment("One account and its properties");
  s.group(ax - pad, top - pad, aw + 2 * pad, 3 * rowH + h + 2 * pad, null);
  const targets = ROWS.map(([, , t], i) => s.node(ax, Y(i), aw, h, t, i === 0 ? { kind: "store", fill: 1 } : {}));

  s.comment("People and grants");
  ROWS.forEach(([who, grant], i) => {
    const hl = i === 0;
    const p = s.node(x, Y(i), pw, h, who, { hl, kind: "actor" });
    const g = s.node(gx, Y(i), gw, h, grant, { hl });
    s.wire([[p.x + p.w + 3, p.cy], g.port("l")], { hl }); // start past the actor shadow
  });
  const grants = ROWS.map((_, i) => ({ y: Y(i), r: (t) => [gx + gw, Y(i) + h * t] }));

  s.comment("Grants point into the account");
  const ch = (gx + gw + ax - pad) / 2;
  s.wire([grants[0].r(0.3), [ax, Y(0) + h * 0.3]], { hl: true });
  s.wire([grants[1].r(0.5), [ch, Y(1) + h / 2], [ch, Y(0) + h * 0.7], [ax, Y(0) + h * 0.7]]);
  s.wire([grants[2].r(0.5), targets[2].port("l")]);
  s.wire([grants[3].r(0.5), targets[3].port("l")]);

  const fy = Y(3) + h + pad + 26;
  s.text(x, fy, "a person is not the account: grants are rows, revocable one at a time", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
