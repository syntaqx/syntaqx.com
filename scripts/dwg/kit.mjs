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
    table(x, y, title, rows, { widths, rowH = 15, minWidths = [30, 80, 60] } = {}) {
      return s.grid(x, y, title, ["CODE", "VARIABLE", "VALUE"], rows, { widths, rowH, minWidths });
    },

    /**
     * Any ruled table: optional title (vt) above, a header row (th), then
     * rows (tc). First column left-aligned, the rest centered unless `align`
     * ('start' | 'middle' | 'end' per column) says otherwise. Returns
     * { y: bottom, width, widths }.
     */
    grid(x, y, title, head, rows, { widths, rowH = 15, minWidths = [], align = [] } = {}) {
      const all = [head, ...rows];
      const ws =
        widths ??
        head.map((_, j) => Math.max(minWidths[j] ?? 30, Math.ceil(Math.max(...rows.map((r) => widthOf(r[j] ?? "", "tc")), widthOf(head[j], "th")) + 14)));
      const w = ws.reduce((a, b) => a + b, 0);
      const h = all.length * rowH;
      if (title) s.add(text(x, y - 7, title, "vt"));
      s.rect(x, y, w, h, "tbl");
      for (let i = 1; i < all.length; i++) s.line(x, y + i * rowH, x + w, y + i * rowH, "tbl");
      let cx = x;
      for (const wj of ws.slice(0, -1)) s.line((cx += wj), y, cx, y + h, "tbl");
      all.forEach((r, i) => {
        let c = x;
        r.forEach((v, j) => {
          const cls = i ? "tc" : "th";
          const yy = y + i * rowH + rowH / 2 + (i ? 3.2 : 2.7);
          const a = align[j] ?? (j === 0 ? "start" : "middle");
          const tx = a === "start" ? c + 6 : a === "end" ? c + ws[j] - 6 : c + ws[j] / 2;
          s.add(text(tx, yy, v, cls, a));
          c += ws[j];
        });
      });
      return { y: y + h, width: w, widths: ws };
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
     * label as an identifier (sans, case kept) instead of caps; `sub` is a
     * second, gray line inside the box. A label may contain "\n". `w` null
     * sizes the box to the label. Returns the node: { x, y, w, h, cx, cy,
     * port(side, t) } with side 'l' | 'r' | 't' | 'b' and t the fraction
     * along that side (0.5 = middle).
     */
    node(x, y, w, h, label, { kind = "process", end = false, hl = false, fill, code = false, sub, cls } = {}) {
      const lines = label == null ? [] : String(label).split("\n");
      const lcls = cls ?? (code ? "tc" : "sl ink") + (hl ? " hl" : "");
      if (w == null) w = Math.ceil(Math.max(...lines.map((l) => widthOf(l, lcls)), sub ? widthOf(sub, "vs") : 0) + 28);
      const fc = `fill-${fill ?? (kind === "actor" ? 1 : 2)}`;
      const box = hl ? "obj hl" : kind === "ghost" ? "slot" : `obj ${fc}`;
      if (kind === "decision") {
        s.path(`M${f(x + w / 2)},${f(y)}L${f(x + w)},${f(y + h / 2)}L${f(x + w / 2)},${f(y + h)}L${f(x)},${f(y + h / 2)}Z`, box);
      } else {
        if (kind === "actor") s.rect(x + 3, y + 3, w, h, hl ? "obj hl" : "obj fill-1");
        s.rect(x, y, w, h, kind === "actor" && !hl ? "obj plate" : box, { rx: kind === "state" ? 6 : null });
        if (end) s.rect(x + 3, y + 3, w - 6, h - 6, hl ? "obj hl" : "obj", { rx: kind === "state" ? 4 : null });
        if (kind === "store") s.line(x + 9, y, x + 9, y + h, hl ? "obj hl" : "obj");
      }
      const dx = kind === "store" ? 4.5 : 0;
      const lh = 11.5;
      const block = lines.length * lh + (sub ? 11 : 0);
      const ty = y + h / 2 - block / 2 + lh / 2 + 3;
      lines.forEach((l, i) => s.add(text(x + w / 2 + dx, ty + i * lh, l, kind === "ghost" && !hl && !cls ? lcls.replace(" ink", "") : lcls, "middle")));
      if (sub) s.add(text(x + w / 2 + dx, ty + lines.length * lh + 0.5, sub, "vs", "middle"));
      return nodeOf(x, y, w, h);
    },

    /**
     * A row of equal nodes spread across `w` from x, `gap` apart. Items are
     * labels or { label, ...node options }; `o` applies to all. Returns the
     * nodes.
     */
    row(x, y, w, items, { h = 26, gap = 12, ...o } = {}) {
      const nw = (w - gap * (items.length - 1)) / items.length;
      return items.map((it, i) => {
        const { label, ...io } = typeof it === "string" ? { label: it } : it;
        return s.node(x + i * (nw + gap), y, nw, h, label, { ...o, ...io });
      });
    },

    /**
     * Orthogonal connector through `points` ([[x, y], ...]), arrow at the
     * end. Options: `hl` accent, `alt` dashed (an exception or exit path),
     * `arrow` 'end' (default) | 'both' | 'none', `start` 'dot' for a dot on
     * the first point, `label` (string, "\n" for lines) placed on segment
     * `seg` (default the longest) on `side` ('above' | 'below' for a
     * horizontal segment, 'right' | 'left' for a vertical one), shifted
     * along the segment by `shift` (0 = middle, -1 / 1 = the ends) and off
     * it by `off`. Labels carry a paper knockout. Returns the points.
     */
    wire(points, { hl = false, alt = false, arrow = "end", start, label, seg, side, shift = 0, off = 0, cls } = {}) {
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
        s.add(edgeLabel(segs[k < 0 ? segs.length + k : k], label, { side, shift, off, hl }));
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
     * lines of gray text under it (wrapped to the box width). An arrow is
     * accented when both its ends are. Returns { nodes, bottom } where
     * bottom is the y under the lowest sub text (start downstream wires
     * there, not at the box).
     */
    pipeline(x, y, stages, { w = 100, h = 28, gap = 16, headGap = 12, subGap = 16 } = {}) {
      const nodes = stages.map((st, i) => {
        const nx = x + i * (w + gap);
        if (st.head) s.add(text(nx + w / 2, y - headGap, st.head, "sl", "middle"));
        return s.node(nx, y, w, h, st.label, { kind: st.kind, hl: st.hl, code: st.code, end: st.end });
      });
      nodes.slice(1).forEach((n, i) => s.wire([nodes[i].port("r"), n.port("l")], { hl: stages[i].hl && stages[i + 1].hl }));
      let bottom = y + h;
      stages.forEach((st, i) => {
        const lines = st.sub == null ? [] : Array.isArray(st.sub) ? st.sub : wrap(st.sub, w + gap - 6, "sl");
        lines.forEach((l, j) => s.add(text(nodes[i].cx, y + h + subGap + j * 11.5, l, st.hl ? "sl hl" : "sl", "middle")));
        if (lines.length) bottom = Math.max(bottom, y + h + subGap + (lines.length - 1) * 11.5 + 4);
      });
      return { nodes, bottom };
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

/** A node's geometry and its ports. */
function nodeOf(x, y, w, h) {
  const port = (side, t = 0.5) =>
    ({ l: [x, y + h * t], r: [x + w, y + h * t], t: [x + w * t, y], b: [x + w * t, y + h] })[side];
  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2, port };
}

/**
 * Connector label on one segment: above / below a horizontal one, right /
 * left of a vertical one, gray caps with a paper knockout (accent with hl).
 */
function edgeLabel([[x1, y1], [x2, y2]], label, { side, shift = 0, off = 0, hl }) {
  const lines = String(label).split("\n");
  const cls = hl ? "sl hl ko" : "sl ko";
  const LH = 11;
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
