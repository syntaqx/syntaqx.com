// An opportunity solution tree: one outcome, the opportunities under it,
// solutions under the chosen opportunity, and an assumption test under each
// solution. A standard diagram.
// Embedded in content/docs/product/discovery.md.
import { sheet } from "../kit.mjs";

const LEVELS = ["outcome", "opportunities", "solutions", "assumption tests"];

export default function draw() {
  const W = 760,
    w = 120,
    h = 40,
    gapX = 24,
    levelH = 72,
    leaves = 4;
  const s = sheet({ prefix: "ost", width: W });
  const treeW = leaves * w + (leaves - 1) * gapX;
  const colW = 130;
  const x = W - 20 - treeW - Math.round((W - 40 - colW - treeW) / 2);
  const top = 24;

  const root = {
    label: "more teams invite\na colleague",
    children: [
      {
        label: "don't know\nwho to invite",
        children: [
          {
            label: "suggest from\nwork domain",
            children: [{ label: "domain match\nin the data" }],
          },
          {
            label: "invite from\nfirst shared doc",
            children: [{ label: "5 usability\nsessions" }],
          },
        ],
      },
      {
        label: "afraid of\nspamming them",
        hl: true,
        children: [
          {
            label: "preview what\nthey'll get",
            hl: true,
            children: [{ label: "prototype\nwith 5 users", hl: true }],
          },
        ],
      },
      { label: "invite lost\nin the inbox" },
    ],
  };

  s.comment("Level names");
  LEVELS.forEach((name, i) => s.text(20, top + i * levelH + h / 2 + 3, name, "th"));

  s.comment("Tree");
  const nodes = s.tree(root, { x, y: top, w, h, layout: "down", gapX, levelH });

  const bottom = Math.max(...nodes.map((n) => n.y2));
  const fy = bottom + 26;
  s.text(20, fy, "one opportunity at a time; test assumptions, not whole ideas", "sl hl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
