// Five ways to generate recurring visits, as rows: when the visit exists and
// what goes wrong, the rolling window accented as the default. No vendor
// names on the drawing; the caption names who documents each model.
// Embedded in content/books/field-operations/recurring-schedules.md.
import { sheet } from "../kit.mjs";

const MODELS = [
  ["rolling window", "N days ahead, real work", "horizon hides capacity", true],
  ["due placeholder", "due event, booked later", "unbooked work piles up"],
  ["on completion", "after the last visit", "one miss stalls the chain"],
  ["per asset", "each asset, own rule", "work orders multiply"],
  ["allowance", "on request, counted", "unused visit liability"],
];

export default function draw() {
  const W = 760, x = 20, w = 170, h = 26, rowH = 38;
  const s = sheet({ prefix: "fo-rsg", width: W });
  const colWhen = 236, colWrong = 500, top = 44;

  s.comment("Column heads");
  s.text(x, 26, "model", "th");
  s.text(colWhen, 26, "when the visit exists", "th");
  s.text(colWrong, 26, "what goes wrong", "th");
  s.line(x, 34, W - x, 34, "tbl");

  s.comment("Models");
  MODELS.forEach(([model, when, wrong, hl], i) => {
    const n = s.node(x, top + i * rowH, w, h, model, { hl, kind: "process" });
    s.text(colWhen, n.cy + 3, when, hl ? "tc hl" : "tc");
    s.text(colWrong, n.cy + 3, wrong, "tc");
    const ry = n.y + h + (rowH - h) / 2;
    s.line(colWhen, ry, W - x, ry, "tbl");
  });

  const fy = top + MODELS.length * rowH + 18;
  s.text(W - x, fy, "a sound default: real visits inside a window, due placeholders beyond it", "sl hl", "end");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
