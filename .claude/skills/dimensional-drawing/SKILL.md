---
name: dimensional-drawing
description: Draw a dimensional drawing (technical sheet with notes, coded dimensions and chain dimensions, detail views, exploded axonometric layer stacks and a variable table) for syntaqx.com docs, generated as a theme-aware SVG by the site's own drawing kit. Use when a doc needs a budget, timeline, stack, layout or architecture drawn as a measured technical sheet.
---

# Dimensional drawings for syntaqx.com

The site's signature diagram for walking through systems: a technical
sheet with notes top-left, views spread across it, each view titled and
scaled underneath, dimensions as codes, values and formulas in a table.
Monochrome ink on paper, told apart by line weight, dash and hatch; the teal
accent marks at most one subject per sheet.

Sheets are code. Each sheet is a small ES module that calls the kit in
`scripts/dwg/kit.mjs`; `npm run dwg` writes `public/diagrams/<name>.svg`.
Never hand-edit a generated SVG: change the sheet source and rebuild.

Reference sheets: `scripts/dwg/sheets/gm-frame-budget.mjs` (timeline plan
view with a code chain, a detail view, a pipelined view and a variable table)
and `scripts/dwg/sheets/gm-client-exploded.mjs` (exploded layer stack).

Not everything should be a sheet. Flowcharts, state machines, sequences,
hierarchies, pipelines, money flows and maps are standard diagrams: same
kit, same line weights and lettering, no notes, codes or tables. Use the
`diagram` skill for those. A sheet earns its place only where something is
measured: a budget, a timeline with durations, a stack, a layout.

## Workflow

1. **Decide the one idea** the sheet makes (a budget, a stack, a timeline, a
   layout). Prefer one sheet; pick the views that carry it: a plan view, a
   detail view per feature too small to read, an exploded view for layers.
2. **Gather values with sources.** Never invent a value. Cite each in the
   chapter's References; say "illustrative" in a note when the split is not
   sourced; write `[TBD]` for unknowns and draw them proportionally.
3. **Write the sheet** in `scripts/dwg/sheets/<prefix>-<name>.mjs`, default
   export `draw()` returning `s.toString()`. The file name is the output name.
   Lay views out from computed positions (a scale `k`, an origin, sums of
   parts), not hand-typed coordinates, so spacing stays even and the parts sum.
4. **Build:** `npm run dwg` (or `npm run dwg -- <name>` for one sheet).
5. **Render and look.** `npm run dwg:render -- public/diagrams/<name>.svg
   <scratchpad>/<name>.png` rasterizes the SVG with the site's diagram CSS
   inlined (add `--dark` for the dark palette; fonts fall back to Arial, so
   leave a little slack). Check: no label crosses a line, box or another label; nothing crosses
   the sheet edge; gaps between views are even. Fix in the source, rebuild,
   look again.
6. **Embed** as its own paragraph:
   `![Alt text describing the whole drawing, over 40 characters.](/diagrams/<file>.svg "Caption that states the point.")`
   Alt text names the views, the parts and the values a reader would get from
   the table.
7. **Verify:** `npm run dwg` leaves no diff, `npx vitest run lib/docs.test.ts`
   passes, and the page reads in both themes.

## House rules

1. **Monochrome plus at most one accent.** Ink, gray and two light fills.
   `hl` (accent) on one subject at most, e.g. the dimension the sheet is about.
2. **Codes, not numbers, on the drawing.** Every dimension label is a code
   (`F1`, `T1`, `S1`, `W1`). A short sum of codes is fine where a code would
   be invented only for the drawing (`T1+T2+T3`).
3. **Formulas close in the table.** The table gives CODE / VARIABLE / VALUE;
   derived values are written as formula and result (`T1+…+T5 = 16.67`), and
   the parts sum to the whole.
4. **Never invent values.** `[TBD]` for unknowns; "illustrative" when a split
   is a teaching example.
5. **Architecture, not content, for UI.** Draw slots and regions (`TITLE SLOT ·
   FLEX`, `CONTENT SLOT · FILL`, `ACTION · HUG`), never real copy. Size words:
   HUG (sized by content), FLEX (takes remaining space), FILL (parent width).
6. **Unbranded.** No logos, wordmarks, trade dress, or brand, company,
   product or studio names anywhere in the drawing; neutral terms only. The
   caption, alt text and References may name sources.
7. **No screenshots.** When a chapter wants to show a product's UI, draw the
   component's architecture instead: its slots, layers and spacing codes.
8. **No em-dashes** in labels or notes.
9. **No border.** Drawings are unframed; the page frames the figure. The
   sheet's `frame` option exists but is not used.

## Sheet layout

- `sheet({ prefix, width: 760 })`: defs with prefixed ids. No border: framing is up to the page (`frame: true` adds a rounded border only when a page asks for one).
  Set `s.height` after layout (bottom of the last view + about 30). Width 760
  matches the site's other diagrams; go wider only if a view genuinely needs it.
- **Notes top-left** at (32, 40): `s.notes(x, y, items, { width })` returns the
  y below. Numbered notes `[n, text]` get boxed numbers; the same `s.nb(x, y, n)`
  box sits on the drawing next to the feature. `[0, text]` is a general note
  (units, "not to scale", where values live).
- **Views** below the notes, each centered over its `s.viewTitle(cx, y, title,
  sub)`; the subtitle gives scale and view type (`Scale 1 ms = 30 px ·
  timeline`, `Axonometric · not to scale`).
- **Tables** beside or below the views that use them.
- Keep everything 20 inside the sheet edge; leave 40 to 50 between views.

## Kit API (`scripts/dwg/kit.mjs`)

All in sheet units; helpers append to the sheet and return it (except where
noted).

| Helper | Draws |
| --- | --- |
| `sheet({ prefix, width, height })` | the sheet; `s.toString()` returns the SVG; `s.id(name)` prefixes an id; `s.hatch` is the hatch fill url |
| `s.rect / s.line / s.path / s.text / s.add / s.comment` | primitives with classes; `s.add` takes raw markup from `el()` / `text()` |
| `s.label(x, y, w, h, str)` | a part or slot label centered in a box |
| `s.notes(x, y, [[n, text]…], { width })` | the notes block; returns the y below |
| `s.nb(x, y, n)` | boxed note number |
| `s.viewTitle(cx, y, title, sub)` | centered view title and scale subtitle |
| `s.dimH(x1, x2, y, label, { from: [y1, y2], below, dx, dy, hl })` | horizontal dimension; extension lines 3 off the feature, 4 overshoot; arrows go outside under 22 |
| `s.chainH([x0, x1, …], y, labels, { from, below })` | a chain of dims sharing extension lines |
| `s.dimV(y1, y2, x, label, { from: [x1, x2], side: 'l' \| 'r' })` | vertical dimension; no `side` rotates the label |
| `s.callout(px, py, ex, ey, label, { dir, sub })` | dot, leader, shoulder, label |
| `s.rad(cornerX, cornerY, r, 'tl' \| 'tr' \| 'bl' \| 'br', label)` | radius callout from the arc's midpoint |
| `s.detailRef(cx, cy, r, label, lx, ly)` | dashed detail circle, leader, `DETAIL A`; draw the matching view titled `Detail A · …` at a larger scale |
| `s.table(x, y, title, [[code, variable, value]…])` | CODE / VARIABLE / VALUE with light rules; returns `{ y, width }` |
| `s.grid(x, y, title, head, rows, { widths, align, hl, hlHead, headH })` | any ruled table (more or other columns, ledger rows); `align` per column; `hl` accents body rows, `hlHead` column heads (`th hl`), `headH` sets the header height; returns `{ y, width, widths, rows }` with each body row's `{ y, cy }`. `s.table` takes the same options |
| `s.timeline({ x1, x2, y, breaks, ticks, laneX, h })` | an axis with breaks (zigzag pairs at each `[b0, b1]`) and labeled ticks `[[x, label], ...]`; returns `bar(y, xa, xb, cls, label)`, which splits a box at every break it crosses and labels its first piece, and `lane(y, label)` for lane titles. Positions are yours (one scale to a break, another after) |
| `s.bars(x, y, rows, { ax, k, ticks, tick, head })` | durations as bars with value text beside them, ticks on the top and bottom rules only (no gridlines through the labels) |
| `s.node`, `s.row`, `s.connect`, `s.wire`, `s.loop`, `s.fanOut`, `s.fanIn`, `s.span`, `s.bracket`, `s.note`, `s.message`, `s.lanes`, `s.tree`, `s.pipeline`, `s.tAccount`, `s.group`, `s.legend` | boxes, orthogonal connectors, lanes, trees, pipelines, T-accounts, boundaries and legends; documented with examples in the `diagram` skill, and usable on a sheet too (a flow inside a plan view, a legend under it) |
| `s.exploded({ tx, ty, w, d, gap, labelX, layers })` | axonometric stack, bottom layer first; each layer `{ label, sub, draw(p) }` where `draw` returns content in plate coordinates via `p.rect / p.line / p.circle / p.path` (no text, it would shear); projection lines through the corners; returns `P(x, y, z)` |
| `textWidth`, `widthOf(str, cls)`, `wrap` | width estimates for layout |

Timeline with breaks (`pm-ach-return-windows`, `pad-states`):

```js
const tl = s.timeline({ x1: X(0), x2: xEnd, y: axY, breaks: [[brk0, brk1]], ticks, laneX, h: 24 });
tl.lane(y1, "state");
tl.bar(y1, X(0), X(R1), "obj fill-2", "settled");
tl.bar(y3, X(0), xEnd, "obj fill-1", "unauthorized returns"); // split at the break
s.dimH(X(0), xEnd, y3 + 24 + 18, "U1", { from: [y3 + 24, y3 + 24], below: true, hl: true });
```

Exploded views: with plate depth `d` and step `gap`, a lower plate shows only
local y > d − 1.88·gap, so put each lower layer's modules in that front band.
Give every layer its own content (what is actually in it, drawn as modules),
never identical boxes.

## Classes (`app/globals.css`, `.diagram .dwg`)

Line weights, heaviest first: `sheet` 1 · `obj` 1.2 (object outline) ·
`obj fill-1` / `obj fill-2` 1 (hug and inset fills) · `slot` 0.8 dashed ·
`detail`, `leader` 0.6 · `ctr` 0.6 dash-dot (centerlines, latches) ·
`phantom` 0.6 long dash (projection and assembly lines) · `dim` 0.5 · `ext`
0.4 · `tbl` 0.5 light rules. `hatch` takes `fill={s.hatch}` and never `obj`
(a CSS fill would beat the attribute). `obj plate` is an opaque plate.

Lettering is the site sans in small plain caps (the kit writes caps text in
caps): `vt` view title, `vs` subtitle, `sl` / `sl ink` labels, `lt` layer
title, `nt` / `nth` notes, `th` table header; `dt` dimension codes and `tc`
table cells are sans with tabular figures, `dt` with a paper knockout (`ko`
adds it to any text). Mono stays for the shared `.t` cells only.

Standard-diagram classes: `flow` 0.9 (connectors), `flow alt` dashed (exit
or exception), `flow hl` 1.2 accent; `sl hl`, `lt hl`, `th hl` and `tc hl`
accent text.

## Don't

- Don't hard-code colors, fonts or `<style>` in a sheet; classes only, every id
  prefixed (several drawings can share a page).
- Don't write full equations on the drawing; codes there, formulas in the table.
- Don't run a dimension line through spaced text and count on the knockout.
- Don't place coordinates by hand when they derive from values: compute them.
- Don't draw a border, and don't put a brand, company, product or studio
  name on a sheet.

## Converting an old diagram

The older hand-written diagrams in `public/diagrams/` (no `class="dwg"`,
classes `cell`, `ln`, `ah`, `t`, `cap`, `n`, `zone`) move to the kit one at
a time. Decide per diagram:

- **Dimensional sheet** (this skill) only when the diagram is about a
  measured quantity (durations, a budget, sizes, a layer stack, a layout)
  and codes plus a variable table would tell the reader something the old
  picture did not.
- **Standard kit diagram** (`diagram` skill) for flowcharts, state
  machines, sequences, hierarchies, pipelines, money flows and maps. Most
  old diagrams are this.
- **Leave it alone** when it already renders cleanly at the column width,
  has no brand names, and a rewrite would change nothing a reader sees.

Then follow the `diagram` skill's "Converting an old diagram" steps: list
every label as the facts to keep, map old classes to kit helpers, move brand
names to the caption, write the source under the same file name, render and
check until clean, and update the alt text only where labels changed.

## Lessons learned

Append a dated entry whenever a review finds a new problem with a sheet.
Keep each to one or two lines: what went wrong, the rule.

- 2026-10-27: Sheets were first drawn with a rounded border; the owner
  dropped it. No border; `frame` stays off.
- 2026-10-27: Flow diagrams forced into sheets (notes, codes, tables with
  nothing measured) read as noise; they are standard diagrams now.
- 2026-10-27: The ACH return windows and Canadian debit sheets each
  hand-rolled the broken axis and the box split at a break. Resolved
  2026-10-27: `s.timeline`.
