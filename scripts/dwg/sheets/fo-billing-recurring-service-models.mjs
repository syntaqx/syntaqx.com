// The four recurring billing models compared on one grid: when each
// invoices, what a skipped visit does (the accented column), when cash
// arrives and when revenue is earned. A standard diagram. Embedded in
// content/books/field-operations/billing-recurring-service.md.
import { sheet } from "../kit.mjs";

const HEAD = ["model", "invoice when", "visit skipped", "cash arrives", "earned"];
const ROWS = [
  ["per visit", "visit completed", "nothing billed", "after each", "on the visit"],
  ["periodic", "billing day", "still billed", "each period", "over the term"],
  ["prepaid", "on activation", "owed a visit", "up front", "per visit"],
  ["seasonal", "each round, in season", "the round moves", "in season", "per round"],
];
const SKIP = 2;

export default function draw() {
  const W = 760, x = 20, rowH = 34, top = 36;
  const s = sheet({ prefix: "fo-brm", width: W });
  // Model column, then four value columns sharing the rest.
  const mw = 150, vw = (W - 2 * x - mw) / 4;
  const cx = (j) => (j === 0 ? x : x + mw + (j - 1) * vw);
  const hy = top + 4;

  s.comment("Column heads");
  HEAD.forEach((t, j) => s.text(cx(j) + (j ? 12 : 0), top - 8, t, "th"));
  s.line(x, hy, W - x, hy, "tbl");

  s.comment("Rows: the model as a box, its values as cells");
  ROWS.forEach((r, i) => {
    const y = hy + i * rowH;
    s.node(x, y + 5, mw - 24, rowH - 10, r[0], { fill: 1 });
    r.slice(1).forEach((v, k) => s.text(cx(k + 1) + 12, y + rowH / 2 + 3.2, v, k + 1 === SKIP ? "tc hl" : "tc"));
    s.line(x, y + rowH, W - x, y + rowH, "tbl");
  });

  s.comment("The skipped-visit column");
  const yb = hy + ROWS.length * rowH;
  s.line(cx(SKIP), hy, cx(SKIP), yb, "obj hl");
  s.line(cx(SKIP) + vw, hy, cx(SKIP) + vw, yb, "obj hl");

  const fy = yb + 26;
  s.text(cx(SKIP) + vw / 2, fy, "the visit-skipped column is where billing disputes start", "sl hl", "middle");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
