// One product in a tank mix: the concentrate measure into a tank of finished
// mix in section, the variable table, and the rate check against the label
// range in plan. Embedded in
// content/books/field-operations/regulated-materials.md.
import { sheet, widthOf } from "../kit.mjs";

// From the chapter's example [1]; a and the label range are [TBD].
const R1 = 0.8, F1 = 2; // fl oz per gal, gal
const C1 = R1 * F1; // 1.6 fl oz

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "fo-rmt", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Rate and tank from the chapter example; the AI share and range come from the label version in force that day."],
    [2, "Not to scale: 1.6 fl oz is under 1% of the 256 fl oz in a 2 gal tank."],
    [3, "Entered: product, mix and F1. From the label version: R1 and the AI share. Computed and stored: C1 and A1, with the entered values and the formula version; a tank mix gets one line per product."],
    [0, "Volumes in fl oz and gallons. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Section view: one tank, not to scale ----
  s.comment("Section view: one tank");
  const rowTop = ny + 28;
  let secBottom;
  {
    const tw = 130, th = 190, tx = 210, ty = rowTop + 10;
    const fill = ty + 30; // fill line
    s.rect(tx, fill, tw, ty + th - fill, "obj fill-2");
    s.path(`M${tx},${ty}V${ty + th}H${tx + tw}V${ty}`, "obj");
    s.text(tx + tw / 2, fill - 8, "fill line", "sl", "middle");
    s.label(tx, fill, tw, ty + th - fill, "finished mix");
    s.text(tx + tw / 2, (fill + ty + th) / 2 + 16, "water plus C1", "vs", "middle");

    // F1: the finished mix, fill line to floor.
    const dx = tx + tw + 26;
    s.dimV(fill, ty + th, dx, "F1", { from: [tx + tw, tx + tw], side: "r" });
    s.nb(dx + 30, (fill + ty + th) / 2 - 0.5, 1);

    // C1: the concentrate measure, poured in (the subject).
    const mw = 36, mh = 54, mx = tx - 110, my = ty + th - mh;
    s.rect(mx, my, mw, mh, "obj hl");
    s.text(mx + mw / 2, my + mh + 16, "concentrate", "sl ink", "middle");
    const ax = mx + mw / 2, ay = my - 10, ey = fill + 40;
    s.path(`M${ax},${ay}V${ey + 16}Q${ax},${ey} ${ax + 16},${ey}H${tx - 8}`, "leader", { "marker-end": `url(#${s.id("ah")})` });
    s.text(mx - 8, my + mh / 2 + 3.5, "C1", "dt hl", "end");
    s.nb(mx - 30, my + mh / 2, 3);

    secBottom = ty + th + 50;
    const vt = "Section view · one tank", vcx = (mx - 36 + dx + 36) / 2;
    s.viewTitle(vcx, secBottom, vt, "Not to scale · fl oz and gallons");
    s.nb(vcx + widthOf(vt, "vt") / 2 + 12, secBottom - 4, 2);
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const tb = s.table(450, rowTop + 30, "Variables · per product", [
    ["R1", "label rate per gal", `${R1} fl oz`],
    ["F1", "finished mix applied", `${F1} gal`],
    ["C1", "concentrate", `R1 × F1 = ${C1} fl oz`],
    ["a", "AI share of C1", "[TBD]"],
    ["A1", "active ingredient", "C1 × a = [TBD]"],
    ["Rmin", "label minimum rate", "[TBD]"],
    ["Rmax", "label maximum rate", "[TBD]"],
    ["L1", "label range", "Rmax − Rmin = [TBD]"],
  ]);

  // ---- Plan view: rate check at entry, proportional ----
  s.comment("Plan view: rate check");
  {
    const top = Math.max(secBottom + 13, tb.y) + 70, h = 26;
    const out = 150, inside = 300; // [TBD] range, drawn proportionally
    const x0 = (W - (2 * out + inside)) / 2;
    const xs = [x0, x0 + out, x0 + out + inside, x0 + 2 * out + inside];
    s.rect(xs[0], top, out, h, "hatch", { fill: s.hatch });
    s.rect(xs[2], top, out, h, "hatch", { fill: s.hatch });
    s.rect(xs[1], top, inside, h, "obj fill-2");
    s.text((xs[0] + xs[1]) / 2, top + h / 2 + 3, "warn or block", "sl ink ko", "middle");
    s.text((xs[2] + xs[3]) / 2, top + h / 2 + 3, "warn or block", "sl ink ko", "middle");
    s.label(xs[1] + inside * 0.3, top, inside * 0.7, h, "within label");

    s.dimH(xs[1], xs[2], top - 20, "L1", { from: [top, top] });
    // Range ends and the entered rate, coded below the bar.
    const ly = top + h + 22;
    s.text(xs[1], ly, "Rmin", "dt", "middle");
    s.text(xs[2], ly, "Rmax", "dt", "middle");
    const rx = xs[1] + inside * 0.28;
    s.line(rx, top - 8, rx, top + h + 8, "ctr");
    s.add(`<circle class="dot" cx="${rx}" cy="${top + h}" r="2.2"/>`);
    s.text(rx, ly, "R1", "dt", "middle");

    const vy = ly + 40;
    const vt = "Plan view · rate check at entry";
    s.viewTitle(W / 2, vy, vt, "Proportional · label range from the label version");
    s.nb(W / 2 + widthOf(vt, "vt") / 2 + 12, vy - 4, 1);
    s.height = Math.ceil(vy + 13 + 30);
  }
  return s.toString();
}
