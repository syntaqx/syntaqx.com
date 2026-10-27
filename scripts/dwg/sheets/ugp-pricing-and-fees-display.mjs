// How a frozen quote's lines display as a standard diagram: every line is
// classified mandatory, optional, government or contingent, and only the
// mandatory class (the accent) sums into the advertised total. Embedded in
// content/books/user-generated-platforms/pricing-and-fees.md.
import { sheet } from "../kit.mjs";

const CLASSES = [
  {
    label: "mandatory",
    hl: true,
    lines: ["rental", "cleaning or prep", "platform service fee", "required protection", "screening fee"],
    note: ["in the total shown at", "search, listing and", "checkout"],
  },
  {
    label: "optional",
    lines: ["add-ons", "protection upgrades", "deposit waiver,", "where optional"],
    note: ["chosen by the guest;", "may stay out of the", "advertised total"],
  },
  {
    label: "government",
    lines: ["taxes"],
    note: ["may stay out of the", "total; disclosed", "before payment"],
  },
  {
    label: "contingent",
    lines: ["usage", "late return", "damage"],
    note: ["out of the price; the", "allowance and rate are", "disclosed before booking"],
  },
];

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-pf", width: W });

  // Four equal groups across the width; equal line boxes stacked inside.
  const gw = 165, gap = (W - 40 - 4 * gw) / 3, pad = 12, bh = 26, bgap = 8;
  const top = 40;
  const rows = Math.max(...CLASSES.map((c) => c.lines.length));
  const gh = pad * 2 + rows * bh + (rows - 1) * bgap;
  const GX = (i) => 20 + i * (gw + gap);

  CLASSES.forEach((c, i) => {
    s.comment(`Class: ${c.label}`);
    s.group(GX(i), top, gw, gh, c.label, { hl: c.hl });
    // "deposit waiver, where optional" is one line kind on two rows
    const items = c.label === "optional" ? [c.lines[0], c.lines[1], `${c.lines[2]}\n${c.lines[3]}`] : c.lines;
    let y = top + pad;
    for (const it of items) {
      const hh = it.includes("\n") ? bh + 12 : bh;
      s.node(GX(i) + pad, y, gw - 2 * pad, hh, it, { hl: c.hl });
      y += hh + bgap;
    }
    c.note.forEach((l, j) => s.text(GX(i) + gw / 2, top + gh + 18 + j * 11, l, c.hl ? "sl hl" : "sl", "middle"));
  });

  s.comment("Footer");
  const fy = top + gh + 18 + 3 * 11 + 22;
  s.text(20, fy, "the displayed price is a sum over classes, computed from the lines, never typed separately", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
