// Drawing kit for dimensional drawings (<svg class="dwg">). Each helper
// returns SVG markup that uses only the classes in app/globals.css under
// `.diagram .dwg`, so sheets follow the site theme: no colors, fonts or
// <style> in the output, and every id carries the sheet's prefix.
//
// Units are sheet units (the viewBox). Conventions: extension lines start 3
// off the feature and overshoot the dimension line by 4; arrowheads are 6;
// dimension labels sit above (or beside) their line with a paper knockout.

const GAP = 3; // extension line gap from the feature
const OVER = 4; // extension line overshoot past the dimension line
const ARROWS_INSIDE = 22; // spans shorter than this get arrows outside
const TAIL = 10; // length of an outside arrow's tail

/** Round to two decimals so output is stable and readable. */
export const f = (n) => String(Math.round(n * 100) / 100);

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** One element. `attrs` with null/undefined values are skipped; numbers are rounded. */
export function el(tag, attrs = {}, inner) {
  const a = Object.entries(attrs)
    .filter(([, v]) => v != null && v !== false)
    .map(([k, v]) => ` ${k}="${typeof v === "number" ? f(v) : esc(v)}"`)
    .join("");
  return inner == null ? `<${tag}${a}/>` : `<${tag}${a}>${inner}</${tag}>`;
}

// Classes set in caps; their text is written in caps too, so the source
// reads like the drawing and renderers without text-transform agree.
const CAPS = new Set(["vt", "vs", "sl", "lt", "nt", "nth", "th", "cap"]);

/** Text. `anchor`: start | middle | end. Baseline is y (no dominant-baseline). */
export const text = (x, y, s, cls, anchor, extra = {}) =>
  el(
    "text",
    { class: cls, x, y, "text-anchor": anchor && anchor !== "start" ? anchor : null, ...extra },
    esc(CAPS.has(String(cls).split(" ")[0]) ? String(s).toUpperCase() : s),
  );

/**
 * Estimated advance width of a string in the site sans at `size`, with the
 * class's letter-spacing in em. Deliberately a little generous so layout
 * leaves room; used for wrapping notes and sizing table columns.
 */
export function textWidth(s, size, tracking = 0, caps = false) {
  let w = 0;
  for (const ch of caps ? String(s).toUpperCase() : String(s)) {
    if (ch === " ") w += 0.28;
    else if (/[MW]/.test(ch)) w += 0.86;
    else if (/[A-Z]/.test(ch)) w += 0.68;
    else if (/[0-9]/.test(ch)) w += 0.58;
    else if (/[mw]/.test(ch)) w += 0.8;
    else if (/[a-z]/.test(ch)) w += 0.53;
    else if (/[.,:;'|!()[\]]/.test(ch)) w += 0.3;
    else w += 0.6;
    w += tracking;
  }
  return w * size;
}

// Font metrics of the kit's text classes (size, tracking em, caps); keep in
// step with app/globals.css.
export const TYPE = {
  vt: [11, 0.08, true],
  vs: [8.5, 0.06, true],
  sl: [8.5, 0.06, true],
  lt: [10, 0.08, true],
  dt: [10, 0.03, false],
  nt: [9, 0.06, true],
  nth: [10, 0.06, true],
  th: [7.5, 0.08, true],
  tc: [9, 0.02, false],
};
export const widthOf = (s, cls) => textWidth(s, ...TYPE[cls.split(" ")[0]]);

/**
 * A sheet: viewBox, defs (arrow markers and hatch with prefixed ids), the
 * rounded sheet border, and helpers that append to it. `toString()` returns
 * the finished SVG.
 */
export function sheet({ prefix, width, height = 0, inset = 10, radius = 10 }) {
  const parts = [];
  const id = (s) => `${prefix}-${s}`;
  const ah = `url(#${id("ah")})`;
  const ahHl = `url(#${id("ah-hl")})`;
  const marker = (name, cls) =>
    el(
      "marker",
      { id: id(name), viewBox: "0 0 10 10", refX: 10, refY: 5, markerWidth: 6, markerHeight: 6, markerUnits: "userSpaceOnUse", orient: "auto-start-reverse" },
      el("path", { class: cls, d: "M0,1.6L10,5L0,8.4Z" }),
    );
  const defs = el(
    "defs",
    {},
    [
      marker("ah", "ah ink"),
      marker("ah-hl", "ah hl"),
      el("pattern", { id: id("hatch"), width: 5, height: 5, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, el("path", { class: "hatch-ln", d: "M0,0V5" })),
    ].join(""),
  );

  const s = {
    prefix,
    width,
    height,
    id,
    hatch: `url(#${id("hatch")})`,
    /** Append raw markup (from el/text or a helper below). */
    add(...m) {
      parts.push(...m.flat().filter(Boolean));
      return s;
    },
    comment(c) {
      return s.add(`<!-- ${c} -->`);
    },
    rect(x, y, w, h, cls, extra = {}) {
      return s.add(el("rect", { class: cls, x, y, width: w, height: h, ...extra }));
    },
    line(x1, y1, x2, y2, cls) {
      return s.add(el("path", { class: cls, d: `M${f(x1)},${f(y1)}L${f(x2)},${f(y2)}` }));
    },
    path(d, cls, extra = {}) {
      return s.add(el("path", { class: cls, d, ...extra }));
    },
    text(x, y, str, cls, anchor, extra) {
      return s.add(text(x, y, str, cls, anchor, extra));
    },
    /** Centered label inside a box (slot and part labels). */
    label(x, y, w, h, str, cls = "sl ink") {
      return s.add(text(x + w / 2, y + h / 2 + 3, str, cls, "middle"));
    },

    /** Boxed note number, centered on (x, y). */
    nb(x, y, n) {
      return s.add(el("rect", { class: "nb", x: x - 5.5, y: y - 5.5, width: 11, height: 11 }), text(x, y + 2.7, String(n), "nbt", "middle"));
    },

    /**
     * Notes block, top-left of the sheet: "NOTES: (UNLESS OTHERWISE SPECIFIED)"
     * then [n, text] items (n = 0 for an unnumbered general note), wrapped to
     * `width`. Returns the y below the last line.
     */
    notes(x, y, items, { width = 600, lineH = 13, gap = 4 } = {}) {
      s.add(text(x, y, "NOTES:", "nth"), text(x + widthOf("NOTES:", "nth") + 6, y, "(UNLESS OTHERWISE SPECIFIED)", "nt"));
      let yy = y + 22;
      for (const [n, t] of items) {
        const tx = x + 18;
        for (const [i, ln] of wrap(t, width - 18, "nt").entries()) {
          if (i === 0 && n) s.nb(x + 5.5, yy - 3.2, n);
          s.add(text(tx, yy, ln, "nt"));
          yy += lineH;
        }
        yy += gap;
      }
      return yy - gap;
    },

    /** View title centered on cx with its subtitle (scale, view type) under it. */
    viewTitle(cx, y, title, sub) {
      return s.add(text(cx, y, title, "vt", "middle"), sub ? text(cx, y + 13, sub, "vs", "middle") : null);
    },

    /**
     * Horizontal dimension from x1 to x2 on line y. `from` gives the feature
     * y of each extension line ([y1, y2], null = no extension line). Label
     * above the line, or below with `below`. Spans under 22 get arrows
     * outside. `hl` uses the accent.
     */
    dimH(x1, x2, y, label, { from = [null, null], below = false, dx = 0, dy = 0, hl = false, cls } = {}) {
      [
        [x1, from[0]],
        [x2, from[1]],
      ].forEach(([x, e]) => {
        if (e == null) return;
        const sg = Math.sign(y - e) || 1;
        s.line(x, e + sg * GAP, x, y + sg * OVER, "ext");
      });
      s.add(arrowLine([x1, y], [x2, y], hl));
      if (label != null) s.add(text((x1 + x2) / 2 + dx, (below ? y + 12 : y - 4) + dy, label, cls ?? (hl ? "dt hl" : "dt"), "middle"));
      return s;
    },

    /** Consecutive horizontal dims sharing extension lines: xs = [x0, x1, ...], labels per span. */
    chainH(xs, y, labels, { from, below = false, offsets = [], hl = [] } = {}) {
      xs.slice(1).forEach((x2, i) => {
        const x1 = xs[i];
        const fr = from ? [i === 0 ? from[i] : null, from[i + 1]] : [null, null];
        s.dimH(x1, x2, y, labels[i], { from: fr, below, dx: offsets[i]?.[0] ?? 0, dy: offsets[i]?.[1] ?? 0, hl: hl.includes(i) });
      });
      return s;
    },

    /**
     * Vertical dimension from y1 to y2 on line x. `side` 'l' or 'r' writes
     * the label horizontally beside the line; otherwise it is rotated.
     */
    dimV(y1, y2, x, label, { from = [null, null], side, dx = 0, dy = 0, hl = false, cls } = {}) {
      [
        [y1, from[0]],
        [y2, from[1]],
      ].forEach(([yy, e]) => {
        if (e == null) return;
        const sg = Math.sign(x - e) || 1;
        s.line(e + sg * GAP, yy, x + sg * OVER, yy, "ext");
      });
      s.add(arrowLine([x, y1], [x, y2], hl));
      if (label == null) return s;
      const c = (y1 + y2) / 2;
      const k = cls ?? (hl ? "dt hl" : "dt");
      if (side) s.add(text(side === "r" ? x + 6 + dx : x - 6 + dx, c + 3.5 + dy, label, k, side === "r" ? "start" : "end"));
      else s.add(text(x - 4 + dx, c + dy, label, k, "middle", { transform: `rotate(-90 ${f(x - 4 + dx)} ${f(c + dy)})` }));
      return s;
    },

    /** Callout: dot on the feature, leader to (ex, ey), shoulder, label. `dir` 1 = right, -1 = left. */
    callout(px, py, ex, ey, label, { dir, cls = "sl ink", sub } = {}) {
      const d = dir ?? (ex >= px ? 1 : -1);
      s.add(
        el("circle", { class: "dot", cx: px, cy: py, r: 1.6 }),
        el("path", { class: "leader", d: `M${f(px)},${f(py)}L${f(ex)},${f(ey)}H${f(ex + d * 10)}` }),
        text(ex + d * 14, ey + 3, label, cls, d > 0 ? "start" : "end"),
        sub ? text(ex + d * 14, ey + 14, sub, "vs", d > 0 ? "start" : "end") : null,
      );
      return s;
    },

    /** Radius callout from the middle of a corner arc. (cx, cy) is the corner of the bounding box. */
    rad(cx, cy, r, corner, label, len = 18) {
      const sx = corner.includes("l") ? -1 : 1;
      const sy = corner.includes("t") ? -1 : 1;
      const px = cx - sx * r + sx * r * Math.SQRT1_2;
      const py = cy - sy * r + sy * r * Math.SQRT1_2;
      return s.callout(px, py, px + sx * len, py + sy * len, label, { dir: sx, cls: "dt" });
    },

    /** Detail reference: dashed circle on the feature, leader out to its label. */
    detailRef(cx, cy, r, label, lx, ly) {
      const a = Math.atan2(ly - cy, lx - cx);
      const left = lx < cx;
      s.add(
        el("circle", { class: "detail", cx, cy, r }),
        el("path", { class: "leader", d: `M${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}L${f(lx)},${f(ly)}` }),
        text(lx + (left ? -4 : 4), ly + 3, label, "sl ink", left ? "end" : "start"),
      );
      return s;
    },

    /**
     * Variable table: title, then CODE / VARIABLE / VALUE with light rules.
     * Column widths fit the content unless `widths` is given. Returns
     * { y: bottom, width }.
     */
    table(x, y, title, rows, { widths, rowH = 15, minWidths = [30, 80, 60] } = {}) {
      const all = [["CODE", "VARIABLE", "VALUE"], ...rows];
      const ws =
        widths ??
        [0, 1, 2].map((j) => Math.max(minWidths[j], Math.ceil(Math.max(...rows.map((r) => widthOf(r[j], "tc")), widthOf(all[0][j], "th")) + 14)));
      const w = ws.reduce((a, b) => a + b, 0);
      const h = all.length * rowH;
      s.add(text(x, y - 7, title, "vt"));
      s.rect(x, y, w, h, "tbl");
      for (let i = 1; i < all.length; i++) s.line(x, y + i * rowH, x + w, y + i * rowH, "tbl");
      let cx = x;
      for (const wj of ws.slice(0, -1)) s.line((cx += wj), y, cx, y + h, "tbl");
      all.forEach((r, i) => {
        let c = x;
        r.forEach((v, j) => {
          const cls = i ? "tc" : "th";
          const yy = y + i * rowH + rowH / 2 + (i ? 3.2 : 2.7);
          s.add(j === 0 ? text(c + 6, yy, v, cls) : text(c + ws[j] / 2, yy, v, cls, "middle"));
          c += ws[j];
        });
      });
      return { y: y + h, width: w };
    },

    /**
     * Exploded axonometric stack. Layers are listed bottom first; each is a
     * plate `w` x `d` lifted by `gap` per layer, drawn with
     * matrix(.94k .17k -.34k .47k tx ty-z) so upper plates cover lower ones.
     * `draw(p)` returns the layer's content in plate coordinates using p.rect /
     * p.line / p.circle / p.path (no text: it would shear). Projection lines
     * run through the plate corners behind the plates. Labels go to the left
     * at `labelX` with a leader from the plate's front-left corner. Returns
     * the screen point helper P(x, y, z).
     */
    exploded({ tx, ty, w, d, gap, k = 1, labelX, layers, plateCls = "obj plate" }) {
      const a = 0.94 * k, b = 0.17 * k, c = -0.34 * k, e = 0.47 * k;
      const P = (x, y, z) => [tx + a * x + c * y, ty + b * x + e * y - z];
      const top = (layers.length - 1) * gap;
      for (const [x, y] of [[0, 0], [w, 0], [w, d], [0, d]]) {
        const [x1, y1] = P(x, y, 0);
        const [, y2] = P(x, y, top);
        s.line(x1, y1, x1, y2, "phantom");
      }
      const p = {
        rect: (x, y, ww, hh, cls, rx) => el("rect", { class: cls, x, y, width: ww, height: hh, rx }),
        line: (x1, y1, x2, y2, cls) => el("path", { class: cls, d: `M${f(x1)},${f(y1)}L${f(x2)},${f(y2)}` }),
        circle: (cx, cy, r, cls) => el("circle", { class: cls, cx, cy, r }),
        path: (dd, cls) => el("path", { class: cls, d: dd }),
      };
      layers.forEach((L, i) => {
        const z = i * gap;
        s.comment(`${L.label}`);
        s.add(
          el(
            "g",
            { class: "iso", transform: `matrix(${f(a)} ${f(b)} ${f(c)} ${f(e)} ${f(tx)} ${f(ty - z)})` },
            [p.rect(0, 0, w, d, plateCls, L.rx), ...[L.draw?.(p) ?? []].flat()].join(""),
          ),
        );
        const [ax, ay] = P(L.anchor?.[0] ?? 0, L.anchor?.[1] ?? d, z);
        s.add(
          el("circle", { class: "dot", cx: ax, cy: ay, r: 1.6 }),
          el("path", { class: "leader", d: `M${f(ax)},${f(ay)}H${f(labelX + 8)}` }),
          text(labelX, ay - 2, L.label, "lt", "end"),
          L.sub ? text(labelX, ay + 10, L.sub, "vs", "end") : null,
        );
      });
      return P;
    },

    toString() {
      const { width: w, height: h } = s;
      const frame = el("rect", { class: "sheet", x: inset, y: inset, width: w - 2 * inset, height: h - 2 * inset, rx: radius });
      return [
        `<svg xmlns="http://www.w3.org/2000/svg" class="dwg" viewBox="0 0 ${f(w)} ${f(h)}">`,
        `  <!-- Generated by scripts/dwg/build.mjs from scripts/dwg/sheets; edit the source, not this file. -->`,
        `  ${defs}`,
        `  ${frame}`,
        ...parts.map((p) => `  ${p}`),
        `</svg>`,
        ``,
      ].join("\n");
    },
  };

  function arrowLine([x1, y1], [x2, y2], hl) {
    const m = hl ? ahHl : ah;
    const cls = hl ? "dim hl" : "dim";
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len >= ARROWS_INSIDE) return el("path", { class: cls, d: `M${f(x1)},${f(y1)}L${f(x2)},${f(y2)}`, "marker-start": m, "marker-end": m });
    const ux = (x2 - x1) / (len || 1), uy = (y2 - y1) / (len || 1);
    return [
      el("path", { class: cls, d: `M${f(x1)},${f(y1)}L${f(x2)},${f(y2)}` }),
      el("path", { class: cls, d: `M${f(x1 - ux * TAIL)},${f(y1 - uy * TAIL)}L${f(x1)},${f(y1)}`, "marker-end": m }),
      el("path", { class: cls, d: `M${f(x2 + ux * TAIL)},${f(y2 + uy * TAIL)}L${f(x2)},${f(y2)}`, "marker-end": m }),
    ].join("");
  }

  return s;
}

/** Greedy word wrap by estimated width for a kit text class. */
export function wrap(t, width, cls) {
  const lines = [];
  let cur = "";
  for (const word of String(t).split(/\s+/)) {
    const next = cur ? `${cur} ${word}` : word;
    if (cur && widthOf(next, cls) > width) {
      lines.push(cur);
      cur = word;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}
