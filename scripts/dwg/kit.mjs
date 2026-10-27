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
 * A sheet: viewBox, defs (arrow markers and hatch with prefixed ids) and
 * helpers that append to it. No border by default: framing is the page's
 * call; pass `frame: true` for a rounded sheet border. `toString()` returns
 * the finished SVG.
 */
export function sheet({ prefix, width, height = 0, inset = 10, radius = 10, frame = false }) {
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
    table(x, y, title, rows, { widths, rowH = 15, minWidths = [30, 80, 60], ...o } = {}) {
      return s.grid(x, y, title, ["CODE", "VARIABLE", "VALUE"], rows, { widths, rowH, minWidths, ...o });
    },

    /**
     * Any ruled table: optional title (vt) above, a header row (th), then
     * rows (tc). First column left-aligned, the rest centered unless `align`
     * ('start' | 'middle' | 'end' per column) says otherwise. `hl` lists
     * body rows (0-based) to accent: an accent box behind the row, its text
     * in `tc hl`. `hlHead` lists columns whose head takes `th hl`. `headH`
     * sets the header row's height (default rowH): the row offset that
     * lines the body rows up with a column of nodes beside the table.
     * Returns { y: bottom, width, widths, rows } where rows[i] is body row
     * i's { y, cy } (top and center), for placing nodes level with it.
     */
    grid(x, y, title, head, rows, { widths, rowH = 15, headH = rowH, minWidths = [], align = [], hl = [], hlHead = [] } = {}) {
      const all = [head, ...rows];
      const ws =
        widths ??
        head.map((_, j) => Math.max(minWidths[j] ?? 30, Math.ceil(Math.max(...rows.map((r) => widthOf(r[j] ?? "", "tc")), widthOf(head[j], "th")) + 14)));
      const w = ws.reduce((a, b) => a + b, 0);
      const h = headH + rows.length * rowH;
      const top = (i) => (i ? y + headH + (i - 1) * rowH : y); // i over all rows, head first
      if (title) s.add(text(x, y - 7, title, "vt"));
      s.rect(x, y, w, h, "tbl");
      for (let i = 1; i < all.length; i++) s.line(x, top(i), x + w, top(i), "tbl");
      let cx = x;
      for (const wj of ws.slice(0, -1)) s.line((cx += wj), y, cx, y + h, "tbl");
      for (const i of hl) s.rect(x, top(i + 1), w, rowH, "obj hl");
      all.forEach((r, i) => {
        let c = x;
        r.forEach((v, j) => {
          const cls = i ? (hl.includes(i - 1) ? "tc hl" : "tc") : hlHead.includes(j) ? "th hl" : "th";
          const yy = top(i) + (i ? rowH : headH) / 2 + (i ? 3.2 : 2.7);
          const a = align[j] ?? (j === 0 ? "start" : "middle");
          const tx = a === "start" ? c + 6 : a === "end" ? c + ws[j] - 6 : c + ws[j] / 2;
          s.add(text(tx, yy, v, cls, a));
          c += ws[j];
        });
      });
      return { y: y + h, width: w, widths: ws, rows: rows.map((_, i) => ({ y: top(i + 1), cy: top(i + 1) + rowH / 2 })) };
    },

    // ---- Standard diagrams: nodes, connectors, lanes, trees, pipelines,
    // ledgers and legends. They share the sheet's line weights and
    // lettering; use them with or without the sheet trappings (notes, view
    // titles, codes, tables). ----

    /**
     * A node box. `kind`: process (default, square box) | state (rounded) |
     * store (box with an index line at the left: an account, a table, a
     * queue) | actor (box with an offset shadow: a party outside the
     * system) | decision (diamond) | ghost (dashed: optional or external).
     * `end` doubles the outline (terminal state); `hl` takes the accent;
     * `fill` 1 or 2 picks the shade (default 2, actor 1); `code` sets the
     * label as an identifier (sans, case kept) instead of caps; `sub` is
     * gray text under the label inside the box: a string with "\n" breaks
     * or an array of lines. A label may contain "\n". `w` null sizes the
     * box to the label and sub lines, `h` null to the stacked lines. Size
     * goes in the positional `w` / `h`; a `w` or `h` (or any unknown key) in
     * the options throws rather than being ignored. An actor's shadow sits
     * 3 right of and below the box: its `r` and `b` ports land on the
     * shadow's edge, and the 20 margin counts the shadow. Returns the node:
     * { x, y, w, h, cx, cy, x2, y2, port(side, t) } with x2 / y2 the outer
     * right and bottom edges (shadow included), side 'l' | 'r' | 't' | 'b'
     * and t the fraction along that side (0.5 = middle).
     */
    node(x, y, w, h, label, opts = {}) {
      const bad = Object.keys(opts).filter((k) => !NODE_OPTS.has(k));
      if (bad.length) throw new Error(`node "${label}": unknown option ${bad.map((k) => `"${k}"`).join(", ")}; size goes in the positional w and h`);
      const { kind = "process", end = false, hl = false, fill, code = false, sub, cls } = opts;
      const lines = label == null ? [] : String(label).split("\n");
      const subs = sub == null ? [] : Array.isArray(sub) ? sub : String(sub).split("\n");
      const lcls = cls ?? (code ? "tc" : "sl ink") + (hl ? " hl" : "");
      if (w == null) w = Math.ceil(Math.max(...lines.map((l) => widthOf(l, lcls)), ...subs.map((l) => widthOf(l, "vs")), 0) + 28);
      const lh = 11.5;
      const block = lines.length * lh + subs.length * 11;
      if (h == null) h = Math.max(28, Math.ceil(block + 16));
      const sh = kind === "actor" ? 3 : 0; // the actor's offset shadow
      if (x < 20 - 0.01 || x + w + sh > s.width - 20 + 0.01)
        throw new Error(`node "${label}" (x ${f(x)} to ${f(x + w + sh)}${sh ? ", shadow included" : ""}) crosses the 20 margin of a ${s.width} sheet`);
      const fc = `fill-${fill ?? (kind === "actor" ? 1 : 2)}`;
      const box = hl ? "obj hl" : kind === "ghost" ? "slot" : `obj ${fc}`;
      if (kind === "decision") {
        s.path(`M${f(x + w / 2)},${f(y)}L${f(x + w)},${f(y + h / 2)}L${f(x + w / 2)},${f(y + h)}L${f(x)},${f(y + h / 2)}Z`, box);
      } else {
        if (kind === "actor") s.rect(x + 3, y + 3, w, h, hl ? "obj hl" : "obj fill-1");
        s.rect(x, y, w, h, kind === "actor" && !hl ? "obj plate" : box, { rx: kind === "state" ? 6 : null });
        // A ghost's inner outline is dashed too: a solid one inside a dashed box reads as broken.
        if (end) s.rect(x + 3, y + 3, w - 6, h - 6, hl ? "obj hl" : kind === "ghost" ? "slot" : "obj", { rx: kind === "state" ? 4 : null });
        if (kind === "store") s.line(x + 9, y, x + 9, y + h, hl ? "obj hl" : "obj");
      }
      const dx = kind === "store" ? 4.5 : 0;
      const ty = y + h / 2 - block / 2 + lh / 2 + 3;
      lines.forEach((l, i) => s.add(text(x + w / 2 + dx, ty + i * lh, l, kind === "ghost" && !hl && !cls ? lcls.replace(" ink", "") : lcls, "middle")));
      subs.forEach((l, j) => s.add(text(x + w / 2 + dx, ty + lines.length * lh + 0.5 + j * 11, l, "vs", "middle")));
      return nodeOf(x, y, w, h, sh);
    },

    /**
     * A row of equal nodes spread across `w` from x, `gap` apart. Items are
     * labels or { label, h, ...node options }; `o` applies to all, and an
     * item's own `h` overrides the row's. `arrows: true` connects
     * neighbors left to right (accented where both ends are), and throws
     * when `gap` is under 16, too short for a readable arrowhead. Returns
     * the nodes, with `bottom` (the lowest node's bottom edge) on the array.
     */
    row(x, y, w, items, { h = 26, gap = 12, arrows = false, ...o } = {}) {
      if (arrows && gap < 16) throw new Error(`row: gap ${gap} is too short for an arrow; use 16 or more`);
      const nw = (w - gap * (items.length - 1)) / items.length;
      const its = items.map((it) => (typeof it === "string" ? { label: it } : it));
      const nodes = its.map(({ label, h: ih, ...io }, i) => s.node(x + i * (nw + gap), y, nw, ih ?? h, label, { ...o, ...io }));
      if (arrows) nodes.slice(1).forEach((n, i) => s.connect(nodes[i], n, { hl: !!((its[i].hl ?? o.hl) && (its[i + 1].hl ?? o.hl)) }));
      nodes.bottom = Math.max(...nodes.map((n) => n.y2));
      return nodes;
    },

    /**
     * Orthogonal connector through `points` ([[x, y], ...]), arrow at the
     * end. Options: `hl` accent, `alt` dashed (an exception or exit path),
     * `arrow` 'end' (default) | 'both' | 'none', `start` 'dot' for a dot on
     * the first point, `label` (string, "\n" for lines) placed on segment
     * `seg` (default the longest) on `side` ('above' | 'below' for a
     * horizontal segment, 'right' | 'left' for a vertical one), shifted
     * along the segment by `shift` (0 = middle, -1 / 1 = the ends) and off
     * it by `off`. Labels carry a paper knockout and are gray caps (`sl`)
     * unless `labelCls` names another text class (`'tc'` keeps the case of
     * identifiers and cardinalities: `code_verifier`, `1..n`). `rotate`
     * turns a vertical segment's label to run along it (read bottom to top)
     * on its `side`, for a tall drop with no room beside it. Returns the
     * points.
     */
    wire(points, { hl = false, alt = false, arrow = "end", start, label, seg, side, shift = 0, off = 0, cls, labelCls, rotate = false } = {}) {
      const d = points.map(([x, y], i) => `${i ? "L" : "M"}${f(x)},${f(y)}`).join("");
      const m = hl ? ahHl : ah;
      s.path(d, cls ?? `flow${hl ? " hl" : ""}${alt ? " alt" : ""}`, {
        "marker-end": arrow === "none" ? null : m,
        "marker-start": arrow === "both" ? m : null,
      });
      if (start === "dot") s.add(el("circle", { class: "dot", cx: points[0][0], cy: points[0][1], r: 1.8 }));
      if (label != null) {
        const segs = points.slice(1).map((p, i) => [points[i], p]);
        const k = seg ?? segs.reduce((best, sg, i) => (len(sg) > len(segs[best]) ? i : best), 0);
        s.add(edgeLabel(segs[k < 0 ? segs.length + k : k], label, { side, shift, off, hl, labelCls, rotate }));
      }
      return points;
    },

    /**
     * Connect two nodes with an orthogonal route. `from` / `to` are sides
     * ('r', 'l', 't', 'b'; default r to l), `at` the fractions along them
     * ([0.5, 0.5]). Opposite sides route with one jog at the midline (or at
     * `via`, an x for left/right or a y for top/bottom); the same side on
     * both (a back edge) runs out to the channel `via` (default 20 past the
     * outer node) and back; a horizontal side to a vertical one turns once.
     * Other options are wire()'s. Returns the points.
     */
    connect(a, b, { from = "r", to = "l", at = [0.5, 0.5], via, ...o } = {}) {
      const p0 = a.port(from, at[0]);
      const p1 = b.port(to, at[1]);
      const H = (sd) => sd === "l" || sd === "r";
      let pts;
      if (H(from) && H(to)) {
        if (from === to) {
          const mx = via ?? (from === "r" ? Math.max(p0[0], p1[0]) + 20 : Math.min(p0[0], p1[0]) - 20);
          pts = [p0, [mx, p0[1]], [mx, p1[1]], p1];
        } else if (Math.abs(p0[1] - p1[1]) < 0.5 && via == null) pts = [p0, p1];
        else {
          const mx = via ?? (p0[0] + p1[0]) / 2;
          pts = [p0, [mx, p0[1]], [mx, p1[1]], p1];
        }
      } else if (!H(from) && !H(to)) {
        if (from === to) {
          const my = via ?? (from === "b" ? Math.max(p0[1], p1[1]) + 20 : Math.min(p0[1], p1[1]) - 20);
          pts = [p0, [p0[0], my], [p1[0], my], p1];
        } else if (Math.abs(p0[0] - p1[0]) < 0.5 && via == null) pts = [p0, p1];
        else {
          const my = via ?? (p0[1] + p1[1]) / 2;
          pts = [p0, [p0[0], my], [p1[0], my], p1];
        }
      } else if (H(from)) pts = [p0, [p1[0], p0[1]], p1];
      else pts = [p0, [p0[0], p1[1]], p1];
      return s.wire(pts, o);
    },

    /**
     * Self-loop on a node side (a state that stays in itself): out of the
     * side at fractions `at` [t0, t1], `reach` away, and back with the arrow.
     * Label beyond the loop. Other options are wire()'s.
     */
    loop(n, side = "t", { at = [0.35, 0.65], reach = 18, ...o } = {}) {
      const [p0, p1] = [n.port(side, at[0]), n.port(side, at[1])];
      const v = { t: [0, -1], b: [0, 1], l: [-1, 0], r: [1, 0] }[side];
      const pts = [p0, [p0[0] + v[0] * reach, p0[1] + v[1] * reach], [p1[0] + v[0] * reach, p1[1] + v[1] * reach], p1];
      return s.wire(pts, { seg: 1, side: { t: "above", b: "below", l: "left", r: "right" }[side], ...o });
    },

    /**
     * Lanes (swimlanes). dir 'h': rows stacked from y, each `{ label, sub,
     * h, hl }`, the lane title in a left column `titleW` wide, light rules
     * between lanes. dir 'v': columns side by side from x, each `{ label,
     * sub, w }` (default w = width / count); titles centered at the top in a
     * head `headH` tall, light rules between columns. Returns the lanes
     * with { x, y, w, h, cx, cy, x0, y0 } (x0 / y0: where content starts).
     */
    lanes({ x, y, w, h, lanes: L, dir = "h", titleW = 120, headH = 34 }) {
      const out = [];
      if (dir === "h") {
        let yy = y;
        s.line(x, yy, x + w, yy, "tbl");
        for (const ln of L) {
          s.add(text(x, yy + 17, ln.label, ln.hl ? "lt hl" : "lt"));
          subLines(ln.sub).forEach((t, i) => s.add(text(x, yy + 30 + i * 11, t, "vs")));
          out.push({ ...ln, x, y: yy, w, h: ln.h, cx: x + w / 2, cy: yy + ln.h / 2, x0: x + titleW, y0: yy });
          yy += ln.h;
          s.line(x, yy, x + w, yy, "tbl");
        }
      } else {
        const cw = w / L.length;
        let xx = x;
        s.line(x, y + headH, x + w, y + headH, "tbl");
        L.forEach((ln, i) => {
          const lw = ln.w ?? cw;
          s.add(text(xx + lw / 2, y + 15, ln.label, ln.hl ? "lt hl" : "lt", "middle"));
          subLines(ln.sub).forEach((t, i) => s.add(text(xx + lw / 2, y + 27 + i * 11, t, "vs", "middle")));
          if (i) s.line(xx, y, xx, y + h, "tbl");
          out.push({ ...ln, x: xx, y, w: lw, h, cx: xx + lw / 2, cy: y + h / 2, x0: xx, y0: y + headH });
          xx += lw;
        });
      }
      return out;
    },

    /**
     * A tree. `root` is { label, sub, kind, hl, code, children: [...] }.
     * layout 'indent': one node per row, each child `indent` right of its
     * parent, rows `rowH` apart, elbow connectors from a stub under the
     * parent. layout 'down': a top-down tree, leaves `gapX` apart, parents
     * centered over their children, levels `levelH` apart, bus connectors.
     * Nodes are `w` x `h`. Returns the placed nodes in row order, each
     * { ...node, data, depth, row }.
     */
    tree(root, { x, y, w = 150, h = 26, layout = "indent", indent = 50, rowH = 40, gapX = 16, levelH = 60, stub = 0.4, hl } = {}) {
      const placed = [];
      if (layout === "indent") {
        let row = 0;
        const walk = (d, depth, parent) => {
          const nx = x + depth * indent, ny = y + row * rowH;
          const n = s.node(nx, ny, w, h, d.label, { kind: d.kind, hl: d.hl, code: d.code, sub: d.sub, end: d.end });
          if (parent) {
            const sx = parent.x + indent * stub;
            s.path(`M${f(sx)},${f(parent.y + parent.h)}V${f(n.cy)}H${f(n.x)}`, d.hl || hl ? "flow hl" : "flow");
          }
          const p = { ...n, data: d, depth, row: row++ };
          placed.push(p);
          for (const c of d.children ?? []) walk(c, depth + 1, p);
        };
        walk(root, 0, null);
        return placed;
      }
      // 'down': assign leaf slots, center parents.
      let slot = 0;
      const pos = new Map();
      const measure = (d, depth) => {
        const kids = d.children ?? [];
        if (!kids.length) pos.set(d, { cx: x + w / 2 + slot++ * (w + gapX), depth });
        else {
          kids.forEach((c) => measure(c, depth + 1));
          pos.set(d, { cx: (pos.get(kids[0]).cx + pos.get(kids.at(-1)).cx) / 2, depth });
        }
      };
      measure(root, 0);
      const draw = (d, parent) => {
        const { cx, depth } = pos.get(d);
        const n = s.node(cx - w / 2, y + depth * levelH, w, h, d.label, { kind: d.kind, hl: d.hl, code: d.code, sub: d.sub, end: d.end });
        if (parent) {
          // The trunk is shared, so only the branch to an accented child is accented.
          const by = parent.y + parent.h + (levelH - h) / 2;
          if (d === parent.data.children[0]) s.path(`M${f(parent.cx)},${f(parent.y + parent.h)}V${f(by)}`, "flow");
          s.path(`M${f(parent.cx)},${f(by)}H${f(n.cx)}V${f(n.y)}`, d.hl ? "flow hl" : "flow");
        }
        const p = { ...n, data: d, depth, row: depth };
        placed.push(p);
        for (const c of d.children ?? []) draw(c, p);
      };
      draw(root, null);
      return placed;
    },

    /**
     * A pipeline: stages left to right, `w` x `h`, `gap` apart, arrows
     * between. Each stage { label, head, sub, kind, hl, code }: `head` is a
     * gray caps word above the box (the step's role), `sub` a string or
     * lines of gray text under it (wrapped to the box width); a line may be
     * { text, hl } to accent just that line. `headHl` accents the head. An
     * arrow is accented when both its ends are, or when `hlArrows` (true
     * for all, or the indices of arrows, arrow i leaving stage i) names it:
     * the path can take the accent while the boxes stay ink. Returns
     * { nodes, bottom, bottoms }: bottom is the y under the lowest sub text,
     * bottoms[i] the y under stage i's own (its box when it has none).
     * Start a downstream wire at its stage's bottoms[i], not at the box.
     */
    pipeline(x, y, stages, { w = 100, h = 28, gap = 16, headGap = 12, subGap = 16, hlArrows = [] } = {}) {
      const nodes = stages.map((st, i) => {
        const nx = x + i * (w + gap);
        if (st.head) s.add(text(nx + w / 2, y - headGap, st.head, st.headHl ? "sl hl" : "sl", "middle"));
        return s.node(nx, y, w, h, st.label, { kind: st.kind, hl: st.hl, code: st.code, end: st.end });
      });
      const hlA = (i) => hlArrows === true || (Array.isArray(hlArrows) && hlArrows.includes(i));
      nodes.slice(1).forEach((n, i) => s.wire([nodes[i].port("r"), n.port("l")], { hl: (stages[i].hl && stages[i + 1].hl) || hlA(i) }));
      const bottoms = stages.map((st, i) => {
        const lines = st.sub == null ? [] : Array.isArray(st.sub) ? st.sub : wrap(st.sub, w + gap - 6, "sl");
        lines.forEach((l, j) => {
          const [t, lhl] = typeof l === "object" ? [l.text, l.hl] : [l, false];
          s.add(text(nodes[i].cx, y + h + subGap + j * 11.5, t, st.hl || lhl ? "sl hl" : "sl", "middle"));
        });
        return lines.length ? y + h + subGap + (lines.length - 1) * 11.5 + 4 : y + h;
      });
      return { nodes, bottom: Math.max(y + h, ...bottoms), bottoms };
    },

    /**
     * T-account: a title (vt) centered over a heavy T, `heads` over the two
     * sides (default IN / OUT; DEBIT / CREDIT where the account's side is
     * known), entries as rows of tc text, each side left-aligned. `hl`
     * accents the T. Returns { y: bottom, width }.
     */
    tAccount(x, y, w, title, left, right, { heads = ["IN", "OUT"], rowH = 15, hl = false } = {}) {
      const n = Math.max(left.length, right.length, 1);
      const cx = x + w / 2, top = y + 16, bot = top + 4 + n * rowH;
      if (title) s.add(text(cx, y - 2, title, "vt", "middle"));
      s.add(text(x + w / 4, top - 4, heads[0], "th", "middle"), text(x + (3 * w) / 4, top - 4, heads[1], "th", "middle"));
      s.line(x, top, x + w, top, hl ? "obj hl" : "obj");
      s.line(cx, top, cx, bot, hl ? "obj hl" : "obj");
      left.forEach((t, i) => s.add(text(x + 6, top + 4 + (i + 0.5) * rowH + 3.2, t, "tc")));
      right.forEach((t, i) => s.add(text(cx + 6, top + 4 + (i + 0.5) * rowH + 3.2, t, "tc")));
      return { y: bot, width: w };
    },

    /**
     * Legend: a row of samples with labels, wrapping at `width`. Item kinds:
     * flow | hl | alt (connector samples), node | state | store | actor |
     * ghost | end (box samples), group (boundary). `width` defaults to the
     * room left before the 20 margin. Returns { y: bottom }.
     */
    legend(x, y, items, { width = s.width - 20 - x, gap = 22 } = {}) {
      let xx = x, yy = y;
      for (const it of items) {
        const iw = 30 + widthOf(it.label, "sl");
        if (xx > x && xx + iw > x + width) {
          xx = x;
          yy += 18;
        }
        const k = it.kind;
        if (k === "flow" || k === "hl" || k === "alt")
          s.wire([[xx, yy], [xx + 22, yy]], { hl: k === "hl", alt: k === "alt" });
        else if (k === "group") s.line(xx, yy, xx + 22, yy, "phantom"); // a box would show only its corners at this size
        else s.node(xx, yy - 5, 22, 10, null, { kind: k === "end" || k === "node" ? "process" : k, end: k === "end", hl: it.hl });
        s.add(text(xx + 30, yy + 3, it.label, "sl"));
        xx += iw + gap;
      }
      return { y: yy + 8 };
    },

    /**
     * Group boundary (a zone, a band, a trust boundary): a light long-dash
     * box with its title above the top-left corner, sub above the top-right.
     */
    group(x, y, w, h, label, { sub, hl = false } = {}) {
      s.rect(x, y, w, h, "phantom");
      if (label) s.add(text(x, y - 7, label, hl ? "lt hl" : "lt"));
      // Sub flush right: placing it after the title would lean on a width
      // estimate, and the gap would vary with the real font.
      if (sub) s.add(text(x + w, y - 7, sub, "vs", "end"));
      return s;
    },

    /**
     * Fan-out: one source to several targets through a shared trunk. A stub
     * leaves `src` on side `from` (default 'r') to the trunk at `via` (an x
     * for left/right, a y for top/bottom; default halfway to the nearest
     * target), the trunk spans the branches, and each branch ends in an
     * arrow on its target's side `to` (default 'l'). `hl`: true accents
     * all of it; an index or an array of indices accents only those
     * branches, and the shared stub and trunk stay ink. `label` and the
     * other wire() options go on the stub. Returns { via }.
     */
    fanOut(src, targets, { from = "r", to = "l", via, hl = false, at = 0.5, alt = false, ...o } = {}) {
      const g = fanGeom(src.port(from, at), targets.map((t) => t.port(to)), from, via);
      const all = hl === true;
      s.wire([g.p, g.T(g.c(g.p))], { hl: all, alt, arrow: "none", ...o });
      if (g.hi - g.lo > 0.5) s.wire([g.T(g.lo), g.T(g.hi)], { hl: all, alt, arrow: "none" });
      g.ends.forEach((e, i) => s.wire([g.T(g.c(e)), e], { hl: all || hl === i || (Array.isArray(hl) && hl.includes(i)), alt }));
      return { via: g.m };
    },

    /**
     * Fan-in (a join, a bus): several sources into one arrowhead. Each
     * source leaves on side `from` (default 'r') to the trunk at `via`, and
     * one arrow runs from the trunk to `dst` on side `to` (default 'l').
     * `hl`: true accents all of it; an index or array accents those
     * branches only. `label` and the other wire() options go on the last
     * run into `dst`. Returns { via }.
     */
    fanIn(sources, dst, { from = "r", to = "l", via, hl = false, at = 0.5, alt = false, ...o } = {}) {
      const g = fanGeom(dst.port(to, at), sources.map((n) => n.port(from)), to, via);
      const all = hl === true;
      g.ends.forEach((e, i) => s.wire([e, g.T(g.c(e))], { hl: all || hl === i || (Array.isArray(hl) && hl.includes(i)), alt, arrow: "none" }));
      if (g.hi - g.lo > 0.5) s.wire([g.T(g.lo), g.T(g.hi)], { hl: all, alt, arrow: "none" });
      s.wire([g.T(g.c(g.p)), g.p], { hl: all, alt, ...o });
      return { via: g.m };
    },

    /**
     * Span: a zone along a flow marked under (or over) it instead of a
     * boxed group, so connectors crossing from one zone to the next keep
     * their labels: a line from x1 to x2 with end ticks, its title (lt)
     * centered 18 below (`above: true` puts it 10 above). Returns the y
     * of the title's baseline.
     */
    span(x1, x2, y, label, { hl = false, above = false } = {}) {
      s.line(x1, y, x2, y, hl ? "flow hl" : "flow");
      s.line(x1, y - 5, x1, y + 5, "flow");
      s.line(x2, y - 5, x2, y + 5, "flow");
      const ly = above ? y - 10 : y + 18;
      if (label) s.text((x1 + x2) / 2, ly, label, hl ? "lt hl" : "lt", "middle");
      return ly;
    },

    /**
     * Bracket: a vertical bracket at x from y1 to y2, its arms reaching
     * `depth` back toward the content, and its label (sl, "\n" for lines)
     * beside it, 12 out. `side` 'r' (default: content on the left) or 'l'.
     * `hl` accents bracket and label: e.g. hard rules in ink, the soft one
     * in the accent. Returns the x where the label starts (or ends).
     */
    bracket(y1, y2, x, label, { hl = false, side = "r", depth = 6 } = {}) {
      const d = side === "l" ? depth : -depth;
      s.path(`M${f(x + d)},${f(y1)}H${f(x)}V${f(y2)}H${f(x + d)}`, hl ? "flow hl" : "flow");
      const lines = subLines(label);
      const lx = side === "l" ? x - 12 : x + 12;
      const y0 = (y1 + y2) / 2 + 3 - ((lines.length - 1) * 11) / 2;
      lines.forEach((l, i) => s.text(lx, y0 + i * 11, l, hl ? "sl hl" : "sl", side === "l" ? "end" : "start"));
      return lx;
    },

    /**
     * Note under a node: gray text (`cls`, default sl; "\n" for lines) `dy`
     * below the box, anchored to its left edge, center or right edge
     * (`anchor` 'left' | 'center' | 'right'). Use left or right for a box at
     * the margin, where a centered note would run past it; a note that
     * would cross the 20 margin throws. Returns the last line's baseline.
     */
    note(n, label, { anchor = "center", dy = 18, cls = "sl" } = {}) {
      const lines = subLines(label);
      const [x, a] = anchor === "left" ? [n.x, "start"] : anchor === "right" ? [n.x + n.w, "end"] : [n.cx, "middle"];
      for (const l of lines) {
        const tw = widthOf(l, cls);
        const [l0, l1] = a === "start" ? [x, x + tw] : a === "end" ? [x - tw, x] : [x - tw / 2, x + tw / 2];
        if (l0 < 20 - 0.01 || l1 > s.width - 20 + 0.01) throw new Error(`note "${l}" crosses the 20 margin; anchor it to the box's ${l0 < 20 ? "left" : "right"} edge`);
      }
      const y = n.y + n.h + dy;
      lines.forEach((l, i) => s.text(x, y + i * 11, l, cls, a));
      return y + (lines.length - 1) * 11;
    },

    /**
     * Sequence message: an arrow from lifeline x1 to lifeline x2 at y with
     * a dot at its start, and its label above. When the arrow crosses
     * other `lifelines` (their xs), the label sits centered in the gap next
     * to the sender (`near: 'end'` for the receiver's), never on a crossed
     * lifeline; it throws when the label is wider than that gap.
     * `labelCls` 'tc' keeps identifiers' case. Other options are wire()'s.
     * Returns the points.
     */
    message(x1, x2, y, label, { lifelines = [], near = "start", hl = false, labelCls = "sl", ...o } = {}) {
      const pts = s.wire([[x1, y], [x2, y]], { hl, start: "dot", ...o });
      if (label == null) return pts;
      const dir = Math.sign(x2 - x1);
      const inner = lifelines.filter((lx) => (lx - x1) * dir > 0.5 && (x2 - lx) * dir > 0.5).sort((a, b) => (a - b) * dir);
      const [a, b] = !inner.length ? [x1, x2] : near === "end" ? [inner.at(-1), x2] : [x1, inner[0]];
      const tw = widthOf(label, labelCls);
      if (tw > Math.abs(b - a)) throw new Error(`message "${label}" (about ${Math.round(tw)} wide) does not fit its ${Math.round(Math.abs(b - a))} gap between lifelines`);
      s.text((a + b) / 2, y - 6, label, `${labelCls}${hl ? " hl" : ""} ko`, "middle");
      return pts;
    },

    /**
     * Bars on a value axis (durations, periods): one row per item with its
     * name at x (tc), a bar from the axis origin `ax` at `k` units per
     * value, and its value text beside the bar end. The axis is ruled at
     * top and bottom with ticks at `ticks` (labels from `tick(v)` in th
     * over the top), and no gridlines, which would run through the value
     * labels. `head` labels the name column. Rows are { label, value, text,
     * alt, hl }: `alt` dashes the bar (a different kind of period), `hl`
     * accents it. Returns { bottom } (the lower axis rule).
     */
    bars(x, y, rows, { ax, k, ticks, tick = String, head, rowH = 22, barH = 10 }) {
      const bottom = y + rows.length * rowH + 4;
      const end = ax + ticks.at(-1) * k;
      if (head) s.text(x, y - 14, head, "th");
      for (const v of ticks) {
        const gx = ax + v * k;
        s.text(gx, y - 14, tick(v), "th", "middle");
        s.line(gx, y - 10, gx, y - 4, "obj");
        s.line(gx, bottom, gx, bottom + 6, "obj");
      }
      s.line(ax, y - 4, end, y - 4, "obj");
      s.line(ax, bottom, end, bottom, "obj");
      s.line(ax, y - 4, ax, bottom, "obj");
      rows.forEach((r, i) => {
        const cy = y + i * rowH + rowH / 2;
        s.text(x, cy + 3.2, r.label, "tc");
        s.rect(ax, cy - barH / 2, r.value * k, barH, r.hl ? "obj hl" : r.alt ? "slot" : "obj fill-2");
        if (r.text != null) s.text(ax + r.value * k + 8, cy + 3.2, r.text, r.hl ? "tc hl" : "tc");
      });
      return { bottom };
    },

    /**
     * Timeline with breaks: an axis at y from x1 to x2 (leader weight)
     * interrupted at `breaks` ([[b0, b1], ...] in x, each drawn as a pair
     * of zigzags), with `ticks` ([[x, label], ...]) labeled above in tc.
     * Positions are the caller's (a scale to the break, another after).
     * Returns { bar(y, xa, xb, cls, label), lane(y, label) }: bar draws a
     * box `h` tall from xa to xb, split wherever it crosses a break, with
     * the label centered in its first piece, and returns the pieces as
     * [[x1, x2], ...]; lane writes a lane title right-aligned at `laneX`.
     */
    timeline({ x1, x2, y, breaks = [], ticks = [], laneX, h = 24 }) {
      const bs = [...breaks].sort((p, q) => p[0] - q[0]);
      let a = x1;
      for (const [b0, b1] of bs) {
        s.line(a, y, b0, y, "leader");
        a = b1;
      }
      s.line(a, y, x2, y, "leader");
      if (bs.length) s.path(bs.flat().map((b) => `M${f(b - 3)},${f(y + 5)}L${f(b + 3)},${f(y - 5)}`).join(""), "leader");
      for (const [tx, t] of ticks) {
        s.line(tx, y - 4, tx, y + 4, "leader");
        s.text(tx, y - 10, t, "tc", "middle");
      }
      return {
        bar(by, xa, xb, cls = "obj fill-2", label) {
          const pieces = [];
          let p = xa;
          for (const [b0, b1] of bs) {
            if (p < b0 && xb > b1) {
              pieces.push([p, b0]);
              p = b1;
            }
          }
          pieces.push([p, xb]);
          for (const [p0, p1] of pieces) s.rect(p0, by, p1 - p0, h, cls);
          if (label) s.label(pieces[0][0], by, pieces[0][1] - pieces[0][0], h, label);
          return pieces;
        },
        lane(ly, label) {
          s.text(laneX, ly + h / 2 + 3, label, "sl ink", "end");
        },
      };
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
      const border = frame ? el("rect", { class: "sheet", x: inset, y: inset, width: w - 2 * inset, height: h - 2 * inset, rx: radius }) : "";
      return [
        `<svg xmlns="http://www.w3.org/2000/svg" class="dwg" viewBox="0 0 ${f(w)} ${f(h)}">`,
        `  <!-- Generated by scripts/dwg/build.mjs from scripts/dwg/sheets; edit the source, not this file. -->`,
        `  ${defs}`,
        ...(border ? [`  ${border}`] : []),
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

const len = ([[x1, y1], [x2, y2]]) => Math.hypot(x2 - x1, y2 - y1);
const subLines = (sub) => (sub == null ? [] : String(sub).split("\n"));

const NODE_OPTS = new Set(["label", "kind", "end", "hl", "fill", "code", "sub", "cls"]);

/**
 * A node's geometry and its ports. `sh` is an actor's shadow offset: the
 * right and bottom ports land on the shadow's edge (where it covers that
 * point of the side), so arrows stop at the silhouette, not inside it.
 */
function nodeOf(x, y, w, h, sh = 0) {
  const port = (side, t = 0.5) =>
    ({
      l: [x, y + h * t],
      r: [x + w + (h * t >= sh ? sh : 0), y + h * t],
      t: [x + w * t, y],
      b: [x + w * t, y + h + (w * t >= sh ? sh : 0)],
    })[side];
  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2, x2: x + w + sh, y2: y + h + sh, port };
}

/**
 * Shared geometry of fanOut / fanIn: `p` the single end (port), `ends` the
 * many, the trunk at `via` across the axis that `side` (p's side) faces.
 * T(c) is the trunk point at cross coordinate c; c(pt) a point's cross
 * coordinate; lo / hi the trunk's extent.
 */
function fanGeom(p, ends, side, via) {
  const H = side === "l" || side === "r";
  const ax = (pt) => (H ? pt[0] : pt[1]);
  const c = (pt) => (H ? pt[1] : pt[0]);
  const near = ends.reduce((b, e) => (Math.abs(ax(e) - ax(p)) < Math.abs(ax(b) - ax(p)) ? e : b), ends[0]);
  const m = via ?? (ax(p) + ax(near)) / 2;
  const T = (cc) => (H ? [m, cc] : [cc, m]);
  const cs = [c(p), ...ends.map(c)];
  return { p, ends, m, T, c, lo: Math.min(...cs), hi: Math.max(...cs) };
}

/**
 * Connector label on one segment: above / below a horizontal one, right /
 * left of a vertical one (or along it with `rotate`), gray caps with a
 * paper knockout (accent with hl), or `labelCls` text.
 */
function edgeLabel([[x1, y1], [x2, y2]], label, { side, shift = 0, off = 0, hl, labelCls, rotate }) {
  const lines = String(label).split("\n");
  const cls = labelCls ? `${labelCls}${hl ? " hl" : ""} ko` : hl ? "sl hl ko" : "sl ko";
  const LH = 11;
  if (rotate && Math.abs(x1 - x2) < 0.5) {
    const my = (y1 + y2) / 2 + (shift * Math.abs(y2 - y1)) / 2;
    const n = lines.length;
    // Rotated -90: the text reads bottom to top and its glyphs rise to the left of the baseline.
    const bx = (i) => (side === "right" ? x1 + 5 + off + 6.5 + i * LH : x1 - 5 - off - (n - 1 - i) * LH);
    return lines.map((l, i) => text(bx(i), my, l, cls, "middle", { transform: `rotate(-90 ${f(bx(i))} ${f(my)})` })).join("");
  }
  if (Math.abs(y1 - y2) < 0.5) {
    const mx = (x1 + x2) / 2 + (shift * Math.abs(x2 - x1)) / 2;
    const below = side === "below";
    const y0 = below ? y1 + 12 + off : y1 - 5 - off - (lines.length - 1) * LH;
    return lines.map((l, i) => text(mx, y0 + i * LH, l, cls, "middle")).join("");
  }
  const my = (y1 + y2) / 2 + (shift * Math.abs(y2 - y1)) / 2;
  const left = side === "left";
  const y0 = my + 3 - ((lines.length - 1) * LH) / 2;
  return lines.map((l, i) => text(left ? x1 - 6 - off : x1 + 6 + off, y0 + i * LH, l, cls, left ? "end" : "start")).join("");
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
