// The address capture flow as four steps: choose a saved address, search
// with autocomplete, confirm details and the entrance pin (accented: the
// step that makes the location yours), save to the address book. Manual
// entry is the dashed escape when suggestions miss. Embedded in
// content/docs/fundamentals/addresses.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "acf", width: W });

  const w = 152,
    gap = 24,
    x0 = (W - (4 * w + 3 * gap)) / 2;

  const { nodes, bottoms } = s.pipeline(
    x0,
    40,
    [
      {
        head: "1 · choose",
        label: "saved addresses",
        sub: ["labels: home, work,", "custom, recent first"],
      },
      {
        head: "2 · search",
        label: "autocomplete",
        sub: ["suggestions as you type,", "near the user"],
      },
      {
        head: "3 · confirm",
        label: "details and pin",
        sub: ["unit, gate code, entrance", "pin, instructions, label"],
        hl: true,
      },
      { head: "4 · save", label: "address book", sub: ["orders keep a copy", "of the address"] },
    ],
    { w, gap, hlArrows: [1] },
  );

  s.comment("Manual entry: the escape when suggestions miss");
  const my = Math.max(...bottoms) + 40;
  const manual = s.node(nodes[1].x, my, w, null, "manual entry", {
    kind: "ghost",
    sub: ["country first,", "then its fields"],
  });
  s.wire(
    [
      [nodes[1].cx, bottoms[1] + 6],
      [nodes[1].cx, manual.y],
    ],
    { alt: true, label: "no match", side: "left" },
  );
  s.wire([manual.port("r"), [nodes[2].cx, manual.cy], [nodes[2].cx, bottoms[2] + 6]], {
    alt: true,
    label: "validate,\nthen pin",
    seg: 1,
    side: "right",
  });

  s.height = manual.y2 + 20;
  return s.toString();
}
