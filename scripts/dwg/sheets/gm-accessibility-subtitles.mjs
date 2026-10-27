// Subtitle legibility for a console game at 1080p: the frame with its
// subtitle block, the text body height at default and 200% in detail, and
// the variable table. Embedded in content/books/gaming/accessibility.md.
import { sheet, widthOf } from "../kit.mjs";

// Sizes in px at 1080p, from XAG 101, 102 and 104.
const W0 = 1920, H0 = 1080, S1 = 26, K1 = 2;
const S5 = S1 * K1; // 52

export default function draw() {
  const W = 760, CX = W / 2;
  const s = sheet({ prefix: "gm-ax", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Guideline 104: avoid lines over 40 characters; show two lines at most (three in exceptional cases)."],
    [2, "Guideline 104: a solid background behind subtitles, color set by the player, opacity adjustable from 0 to 100%."],
    [3, "Guideline 102: on console, 52 px at 1080p is large text, so S5 needs C2 against its background; smaller text needs C1."],
    [0, "Layout illustrative. Values in px at 1080p from a console maker's accessibility guidelines 101, 102 and 104, in the table."],
  ], { width: 696 });

  // ---- Plan view: the frame at 1:4 ----
  s.comment("Plan view: one 1080p frame");
  let planBottom;
  {
    const k = 1 / 4;
    const fw = W0 * k, fh = H0 * k;
    const x0 = CX - fw / 2, top = ny + 56, bot = top + fh;
    s.rect(x0, top, fw, fh, "obj fill-2");
    s.line(CX, top + 8, CX, bot - 100, "ctr");
    s.dimH(x0, x0 + fw, top - 20, "W0", { from: [top, top] });
    s.dimV(top, bot, x0 + fw + 22, "H0", { from: [x0 + fw, x0 + fw], side: "r" });

    // Subtitle block: two lines on a solid background, near the bottom.
    const bw = 300, bh = 38, bx = CX - bw / 2, by = bot - 60;
    s.rect(bx, by, bw, bh, "obj fill-1");
    const lx = bx + 12, l1w = 276, l2w = 200;
    s.rect(lx, by + 7, l1w, 7, "obj fill-2");
    s.rect(lx, by + 23, l2w, 7, "obj fill-2");
    s.dimH(lx, lx + l1w, by - 16, "L1", { from: [by + 7, by + 7] });
    s.nb(CX + 20, by - 23.5, 1);
    s.detailRef(lx + 10, by + 10.5, 14, "detail A", x0 - 26, by - 22);

    s.callout(lx + l2w - 20, by + 26.5, CX - 60, bot + 26, "line 2 of L2", { dir: -1 });
    s.callout(bx + bw - 6, by + bh - 4, CX + 100, bot + 26, "background", { dir: 1 });
    s.nb(CX + 100 + 14 + widthOf("background", "sl") + 12, bot + 26, 2);

    s.viewTitle(CX, bot + 70, "Plan view · one 1080p frame, console", "Scale 1:4 · layout illustrative");
    planBottom = bot + 83;
  }

  // ---- Detail A: text body height, 10:1 (1 px = 2.5) ----
  s.comment("Detail A: text body height");
  const rowTop = planBottom + 50;
  let detailBottom;
  {
    const k = 2.5;
    const base = rowTop + 30 + S5 * k;
    const x0 = 52, aW = 80, bW = 100;
    const ax = x0 + 12, bx = ax + aW + 60;
    s.line(x0, base, bx + bW + 8, base, "ctr");
    s.rect(ax, base - S1 * k, aW, S1 * k, "obj fill-2");
    s.rect(bx, base - S5 * k, bW, S5 * k, "obj fill-2");
    s.label(ax, base - S1 * k, aW, S1 * k, "default");
    s.label(bx, base - S5 * k, bW, S5 * k, "at 200%");
    s.dimV(base - S1 * k, base, ax + aW + 20, "S1", { from: [ax + aW, ax + aW], side: "r" });
    s.dimV(base - S5 * k, base, bx + bW + 20, "S5", { from: [bx + bW, bx + bW], side: "r", hl: true });
    s.nb(bx + bW + 50, base - (S5 * k) / 2, 3);
    s.text(x0, base + 18, "body height = descender + x-height + ascender", "vs");
    s.viewTitle((x0 + bx + bW + 50) / 2, base + 52, "Detail A · text body height", "Scale 10:1 against the plan · 1 px = 2.5");
    detailBottom = base + 65;
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const tb = s.table(426, rowTop + 16, "Variables · px at 1080p", [
    ["W0", "frame width", String(W0)],
    ["H0", "frame height", String(H0)],
    ["S1", "console text, 1080p", String(S1)],
    ["S2", "console text, 4K", "52"],
    ["S3", "PC/VR text, 1080p", "18"],
    ["S4", "PC/VR text, 4K", "36"],
    ["K1", "text scaling, at least", "2.00"],
    ["S5", "console 1080p at K1", `S1 × K1 = ${S5}`],
    ["T1", "large text, console 1080p", "52"],
    ["C1", "contrast, standard text", "4.5:1"],
    ["C2", "contrast, large text", "3:1"],
    ["L1", "characters per line, max", "40"],
    ["L2", "lines on screen, max", "2"],
  ]);
  s.height = Math.ceil(Math.max(tb.y, detailBottom) + 30);
  return s.toString();
}
