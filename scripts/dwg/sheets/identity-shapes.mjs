// Who runs what in each identity shape (hosted, self-hosted, library) as a
// ruled table; the application session, yours in every shape, is the
// accented row. Embedded in content/docs/security/identity-providers.md.
import { sheet } from "../kit.mjs";

const SHAPES = ["hosted", "self-hosted", "library"];
const ROWS = [
  ["sign-in pages", "vendor, themed", "server, themed", "you"],
  ["user records", "vendor", "your server's db", "your db"],
  ["MFA, passkeys", "vendor", "server", "plugins you wire"],
  ["enterprise SSO, SCIM", "vendor, often extra", "server", "plugins, or you"],
  ["upgrades, on-call", "vendor", "you", "you"],
];
const SESSION = ["your app's session", "you", "you", "you"];
const WHERE = [
  ["users live with", "the vendor"],
  ["users live in your", "infrastructure"],
  ["users live in", "your database"],
];

export default function draw() {
  const W = 760, x = 20, firstW = 210, rowH = 28, top = 40;
  const s = sheet({ prefix: "ids", width: W });
  const cw = (W - 2 * x - firstW) / SHAPES.length;
  const CX = (j) => x + firstW + (j + 0.5) * cw;
  const RY = (i) => top + i * rowH; // top of body row i

  s.comment("Column heads");
  s.text(x + 8, top - 12, "who runs what", "th");
  SHAPES.forEach((h, j) => s.text(CX(j), top - 12, h, "lt", "middle"));
  s.line(x, top, W - x, top, "tbl");

  const row = (i, cells, hl) => {
    const by = RY(i) + rowH / 2 + 3.2;
    s.text(x + 8, by, cells[0], hl ? "sl ink hl" : "sl ink");
    cells.slice(1).forEach((v, j) => s.text(CX(j), by, v, hl ? "tc hl" : "tc", "middle"));
  };

  s.comment("Rows");
  ROWS.forEach((r, i) => {
    row(i, r);
    s.line(x, RY(i + 1), W - x, RY(i + 1), "tbl");
  });

  s.comment("The one thing that never moves");
  const sy = RY(ROWS.length) + 6;
  s.rect(x, sy, W - 2 * x, rowH, "obj hl");
  row(ROWS.length + 6 / rowH, SESSION, true);
  s.text(x + 8, sy + rowH + 18, "always yours", "sl hl");

  s.comment("Where the users live");
  const wy = sy + rowH + 18;
  WHERE.forEach((ls, j) => ls.forEach((l, k) => s.text(CX(j), wy + k * 11, l, "vs", "middle")));
  s.height = Math.ceil(wy + 11 + 18);
  return s.toString();
}
