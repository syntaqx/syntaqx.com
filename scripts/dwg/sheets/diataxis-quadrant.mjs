// The Diataxis map as a standard diagram: four kinds of documentation on two
// axes, what the reader needs (doing or knowing) by what they're doing
// (studying or working). Embedded in content/docs/development/documentation.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "dx", width: W });

  // Grid: a column of row titles on the left, two columns of cells.
  const w = 262,
    h = 76,
    gap = 16;
  const x0 = W - 20 - (2 * w + gap);
  const X = (i) => x0 + i * (w + gap);
  const top = 50;
  const Y = (j) => top + j * (h + gap);
  const cell = (i, j, label, sub) => s.node(X(i), Y(j), w, h, label, { sub });

  s.comment("Column titles: what the reader is doing");
  s.text(X(0) + w / 2, top - 22, "studying", "lt", "middle");
  s.text(X(0) + w / 2, top - 9, "acquiring skill", "vs", "middle");
  s.text(X(1) + w / 2, top - 22, "working", "lt", "middle");
  s.text(X(1) + w / 2, top - 9, "applying skill", "vs", "middle");

  s.comment("Row titles: what the content is");
  s.text(20, Y(0) + h / 2 - 2, "action", "lt");
  s.text(20, Y(0) + h / 2 + 11, "practical steps", "vs");
  s.text(20, Y(1) + h / 2 - 2, "cognition", "lt");
  s.text(20, Y(1) + h / 2 + 11, "theoretical knowledge", "vs");

  s.comment("The four kinds");
  cell(0, 0, "Tutorials", ["a lesson with a result", "the learner is sure to reach"]);
  cell(1, 0, "How-to guides", ["steps to a goal the", "reader already has"]);
  cell(0, 1, "Explanation", ["why it works this way:", "context, history, tradeoffs"]);
  cell(1, 1, "Reference", ["the machinery, described:", "API, config, commands"]);

  s.height = Math.ceil(Y(1) + h + 20);
  return s.toString();
}
