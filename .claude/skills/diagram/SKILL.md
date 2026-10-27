---
name: diagram
description: Draw a standard diagram (flowchart, state machine, sequence or multi-party flow, swimlanes, hierarchy or tree, pipeline, ledger or money flow, landscape map) for syntaqx.com docs and books, generated as a theme-aware SVG by the site's drawing kit. Use when a doc or book chapter needs boxes and arrows, states and transitions, parties and messages, levels, stages, accounts or bands; for measured budgets, timelines, stacks and layouts use the dimensional-drawing skill instead.
---

# Standard diagrams for syntaqx.com

A standard diagram shows structure and movement: what the parts are and how
things flow between them. It uses the same kit, line weights and lettering
as the dimensional sheets (`dimensional-drawing` skill), without the sheet
trappings: no notes block, no view titles, no codes, no variable table.
Monochrome ink on paper; one accent for the one path or part that matters.

Sources are code. Each diagram is an ES module in `scripts/dwg/sheets/` that
calls `scripts/dwg/kit.mjs`; `npm run dwg` writes `public/diagrams/<name>.svg`
(with `class="dwg"`). Never hand-edit a generated SVG.

Reference sources: `payment-states` (state machine), `card-flow`
(multi-party flow in lanes), `fo-field-operations-business-hierarchy`
(indented tree with columns), `fo-route-optimization-pipeline` (pipeline
with a back edge), `funds-flow` (money flow and a T-account),
`fo-software-landscape-map` (map in bands).

## Which kind of picture

1. **No diagram** when a sentence or a short list says it as well: two
   boxes and one arrow, a linear list of steps with nothing branching, or a
   picture that repeats the table next to it.
2. **Standard diagram** (this skill) when the point is structure or
   movement: states and transitions, who sends what to whom, levels of a
   hierarchy, stages of a pipeline, where money goes, which systems sit
   where. Nothing is measured.
3. **Dimensional sheet** (`dimensional-drawing` skill) when the point is a
   quantity laid out in space or time: a budget, a timeline with durations,
   a layer stack, a layout with spacing, anything that wants dimensions and a
   variable table.

When unsure, pick the standard diagram; a sheet with nothing to measure is
just noise around a flowchart.

## Workflow

1. **List the facts first.** Every box, arrow and label the diagram must
   carry, and nothing else. When converting, these are exactly the old
   diagram's labels (see "Converting an old diagram").
2. **Pick the form** from the helpers below and sketch the grid: columns,
   rows, the one accented path.
3. **Write the source** `scripts/dwg/sheets/<name>.mjs`: default export
   `draw()` returning `s.toString()`, `sheet({ prefix, width: 760 })` with a
   short unique prefix. Compute positions from a few constants (box size,
   gap, origin); never scatter literal coordinates.
4. **Build:** `npm run dwg -- <name>`.
5. **Render and look:** `npm run dwg:render -- public/diagrams/<name>.svg
   <scratchpad>/<name>.png` (add `--dark` for the dark palette). Open the PNG
   and go through the checklist below. Fix the source, rebuild, look again.
   Repeat until the checklist passes. The renderer falls back to Arial, so
   leave a little slack: the site font sets slightly differently.
6. **Embed** as its own paragraph:
   `![Alt text.](/diagrams/<name>.svg "Caption that states the point.")`
7. **Verify:** a second `npm run dwg` leaves no diff; `npx vitest run
   lib/docs.test.ts lib/seo.test.ts` passes.

## Kit API for standard diagrams

All coordinates are sheet units (viewBox). Every helper writes theme classes
only. Nodes return `{ x, y, w, h, cx, cy, x2, y2, port(side, t) }`; `side`
is `'l' | 'r' | 't' | 'b'`, `t` the fraction along that side; `x2` / `y2`
are the outer right and bottom edges (an actor's shadow included).

| Helper | Draws |
| --- | --- |
| `s.node(x, y, w, h, label, { kind, end, hl, fill, code, sub, cls })` | a box. `kind`: `process` (default), `state` (rounded), `store` (index line at the left: account, table, queue), `actor` (offset shadow: a party outside the system), `decision` (diamond), `ghost` (dashed: optional, external). `end` doubles the outline (terminal state; on a ghost the inner outline is dashed too). `code` keeps the label's case (identifiers). `sub` is gray text under the label: `"\n"` or an array for several lines. `"\n"` breaks the label. `w: null` fits label and sub, `h: null` fits the stacked lines. Size goes only in the positional `w` / `h`: a `w`, `h` or unknown key in the options throws. A box past the 20 margin throws; an actor's 3-unit shadow counts, and its `r` / `b` ports land on the shadow's edge |
| `s.row(x, y, w, items, { h, gap, arrows, ...node })` | equal nodes spread across `w`; an item's own `h` overrides the row's. `arrows: true` connects neighbors (accented where both ends are) and throws when `gap` is under 16. Returns the nodes, with `.bottom` on the array |
| `s.connect(a, b, { from, to, at, via, ...wire })` | orthogonal route between two nodes: opposite sides jog once at the midline (or `via`), the same side twice (a back edge through channel `via`), mixed sides turn once |
| `s.wire(points, { hl, alt, arrow, start, label, seg, side, shift, off, labelCls, rotate })` | a connector through explicit points. `alt` dashed (exit, exception), `hl` accent, `arrow` `end` / `both` / `none`, `start: 'dot'`. `label` on segment `seg` (default the longest; `-1` the last), `side` `above` / `below` / `left` / `right`, `"\n"` for lines. `labelCls: 'tc'` keeps the label's case (`code_verifier`, `1..n`); `rotate: true` runs a vertical segment's label along it |
| `s.loop(node, side, { at, reach, ...wire })` | self-loop on one side |
| `s.fanOut(src, targets, { from, to, via, hl, ...wire })` | one source to several targets: stub, trunk at `via`, an arrow per branch. `hl: true` accents all of it; an index or array accents only those branches and the trunk stays ink. `label` goes on the stub. Returns `{ via }` |
| `s.fanIn(sources, dst, { from, to, via, hl, ...wire })` | a join or bus: several sources into one arrowhead through a trunk at `via`; `label` goes on the run into `dst` |
| `s.span(x1, x2, y, label, { hl, above })` | a zone along a flow as a ticked line with its title under it, instead of a boxed group a crossing connector would cut; returns the title's baseline |
| `s.bracket(y1, y2, x, label, { hl, side, depth })` | a vertical bracket beside a stack (hard rules, soft rule), label `"\n"` for lines, `side` `'r'` (default) or `'l'` |
| `s.note(node, label, { anchor, dy, cls })` | gray text under a node, `anchor` `'left'` / `'center'` / `'right'` (use left or right at the margin; a note past the margin throws); returns the last baseline |
| `s.message(x1, x2, y, label, { lifelines, near, hl, labelCls, ...wire })` | a sequence message between lifelines with a dot at the sender; when it crosses other `lifelines` its label sits in the gap next to the sender (`near: 'end'` the receiver), and a label wider than that gap throws |
| `s.bars(x, y, rows, { ax, k, ticks, tick, head, rowH, barH })` | a bar chart of durations: names at x, bars from `ax` at `k` per unit, value text beside each bar, ticks on the top and bottom rules only (no gridlines); rows `{ label, value, text, alt, hl }`; returns `{ bottom }` |
| `s.lanes({ x, y, w, h, lanes, dir, titleW, headH })` | swimlanes; `dir: 'h'` rows with titles in a left column, `'v'` columns with titles on top; each lane `{ label, sub, h \| w, hl }`, `sub` may hold `"\n"`; returns lanes with `x0` / `y0` where content starts |
| `s.tree(root, { x, y, w, h, layout, indent, rowH, levelH, gapX })` | `layout: 'indent'` one level per row (outline), `'down'` a top-down tree with bus connectors; `root` is `{ label, kind, hl, code, children }`; returns placed nodes in order |
| `s.pipeline(x, y, stages, { w, h, gap, hlArrows })` | stages left to right with arrows; each `{ label, head, headHl, sub, hl, kind }`, a sub line may be `{ text, hl }`. `hlArrows` (true or arrow indices, arrow i leaving stage i) accents arrows without accenting boxes. Returns `{ nodes, bottom, bottoms }`: `bottom` under the lowest sub text, `bottoms[i]` under stage i's own |
| `s.tAccount(x, y, w, title, left, right, { heads, hl })` | a T-account; `heads` default `IN` / `OUT` (use `DEBIT` / `CREDIT` only when the side is known) |
| `s.grid(x, y, title, head, rows, { widths, align, hl, hlHead, headH, rowH })` | a ruled table with any columns (ledger rows, value columns); `align` per column; `hl` body rows to accent (box and `tc hl`), `hlHead` columns whose head takes `th hl`, `headH` the header's height (the row offset). Returns `{ y, width, widths, rows }`, `rows[i].cy` the center of body row i for nodes level with it |
| `s.group(x, y, w, h, label, { sub, hl })` | a long-dash boundary (band, zone, trust boundary), title above top-left, sub above top-right |
| `s.legend(x, y, items)` | samples with labels: `flow`, `hl`, `alt`, `node`, `state`, `store`, `actor`, `ghost`, `end`, `group` |
| `s.text`, `s.line`, `s.nb`, `s.callout` | primitives from the sheet kit, for the odd footnote or column |

### State machine

```js
const st = (i, y, label, o = {}) => s.node(X(i), y, 108, 30, label, { kind: "state", code: true, ...o });
const pending = st(0, r1, "pending"), authorized = st(1, r1, "authorized");
const failed = st(0, r2, "failed", { end: true, fill: 1 });
s.connect(pending, authorized, { hl: true, label: "approved" });
s.connect(pending, failed, { from: "b", to: "t", alt: true, label: "declined", side: "right" });
s.connect(action, failed, { from: "l", to: "l", via: X(0) - 26, alt: true, label: "abandoned\nor expired", side: "left", seg: 1 });
s.loop(retrying, "t", { label: "backoff" });
s.legend(x, y, [{ kind: "hl", label: "the path it should take" }, { kind: "alt", label: "ends it early" }, { kind: "end", label: "terminal state" }]);
```

### Multi-party flow (sequence in lanes)

```js
const [P, A] = s.lanes({ x: 20, y: 20, w: 720, titleW: 150, lanes: [
  { label: "Parties", sub: "who takes part", h: 92 },
  { label: "1 · Authorization", sub: "in seconds", h: 104 },
] });
PARTIES.forEach(([name], i) => s.node(CX(i) - 46, P.y + 16, 92, 28, name, { kind: "actor" }));
for (const cx of [FROM, TO]) s.line(cx, P.y + P.h, cx, A.y + A.h, "ctr"); // lifelines at message ends only
s.wire([[FROM, A.y + 36], [TO, A.y + 36]], { start: "dot", label: "request" });
```

### Sequence with lifelines

```js
const LL = [BR, APP, IDP]; // lifeline xs
s.message(APP, BR, Y(1), "redirect", { lifelines: LL });
s.message(BR, IDP, Y(2), "authorize: code_challenge, state", { lifelines: LL, labelCls: "tc" }); // label in the BR-APP gap
s.message(APP, IDP, Y(6), "code + code_verifier", { lifelines: LL, labelCls: "tc", hl: true });
```

### Fan-out, joins and cardinalities

```js
s.fanOut(payable, methods, { via: bus, hl: 0 });                      // ink trunk, the default's branch accented
s.fanOut(mint, services, { via: bus, hl: true, label: "signed JWT", side: "above" });
s.fanIn(tracks.map((t) => t.at(-1)), gate, { via: joinX, hl: true }); // three tracks, one arrowhead
s.connect(account, property, { label: "1..n", labelCls: "tc" });      // case kept
s.connect(a, b, { from: "b", to: "t", label: "retry", rotate: true, side: "left" }); // along a tall drop
```

### Zones, brackets and notes

```js
s.note(shipper, "retailer, maker", { anchor: "left" });   // the box sits on the margin
s.span(20, wh.x + wh.w + 30, sy, "logistics");             // zones under the chain, not boxes
s.span(hub.x - 30, 740, sy, "field operations", { hl: true });
s.bracket(rules[0].y, rules.at(-1).y + h, bx, "hard rules:\npass or fail");
s.bracket(cand.y, cand.y + h, bx, "soft: scored", { hl: true });
```

### Durations as bars

```js
s.bars(20, 40, RECORDS.map(([label, value, text, alt]) => ({ label, value, text, alt })), {
  ax: 220, k: 84, ticks: [0, 1, 2, 3, 4, 5], tick: (yr) => (yr ? `${yr} yr` : "0"), head: "record",
});
```

### Hierarchy

```js
const rows = s.tree(root, { x: 20, y: 44, w: 160, h: 26, indent: 50, rowH: 40 }); // outline
rows.forEach((n, i) => s.text(colWhat, n.cy + 3, WHAT[i], "tc"));                // columns beside it
s.tree(root, { x: 40, y: 40, layout: "down", w: 100, levelH: 56 });               // org chart
```

### Pipeline

```js
const { nodes, bottom } = s.pipeline(x0, 40, [
  { head: "build", label: "snapshot", sub: ["visits, shifts,", "pins, version"] },
  { head: "gate", label: "version check", sub: ["versions match?"], hl: true },
], { w: 100, gap: 16, hlArrows: [0] });   // accent the first arrow, boxes stay as set
// bottoms[i]: under stage i's own sub, for a wire down from that stage alone
s.wire([[nodes[1].cx, bottom + 6], [nodes[1].cx, ly], [x0 - 16, ly], [x0 - 16, nodes[0].cy], nodes[0].port("l")], { alt: true, seg: 1, side: "below", label: "stale: re-solve" });
```

### Money flow and ledger

```js
const fbo = s.node(x, y, 210, 36, "FBO account", { kind: "store", hl: true, sub: "held for merchants" });
const res = s.node(x, y, 170, 64, "reserve", { kind: "store", sub: ["held against disputes,", "refunds and losses"] });
const g = s.grid(gx, top, null, ["arrives", "final"], ROWS, { rowH: 30, hl: [0], hlHead: [1] });
ROWS.forEach((r, i) => s.node(mx, g.rows[i].cy - 11, 130, 22, r.method)); // level with the table rows
s.connect(sponsor, fbo, { hl: true });
s.tAccount(70, 202, 330, "Ledger · who owns what", ["card settlement", "ACH debits"], ["payouts to merchants", "earned fees to operating"]);
s.grid(x, y, "Ledger", ["DATE", "ENTRY", "DR", "CR"], rows, { align: ["start", "start", "end", "end"] });
```

### Map in bands

```js
BANDS.forEach((b, i) => {
  s.group(20, tops[i], 720, 52, b.label, { sub: b.sub, hl: b.hl });
  s.row(32, tops[i] + 12, 696, b.nodes, { h: 28, kind: b.kind });
});
s.wire([[380, tops[1]], [380, tops[0] + 52]], { label: "APIs, webhooks", side: "right" });
```

## Quality bar

A diagram ships only when every item holds on the rendered PNG.

**Grid and spacing**
- Width 760; everything at least 20 inside the edge. Set `s.height` from
  the last element's bottom plus 16 to 24.
- Lay out on a grid computed from constants: one box size per role, one gap
  per direction. Siblings share size; a row's boxes share a baseline.
- Center the content or flush it to one margin on purpose. When a back edge
  or label needs a side channel, compute the origin from the far edge
  (`x0 = W - 20 - totalWidth`) so the channel gets the slack.
- Even gaps: the same distance between every pair of neighbors in a row and
  between rows. Bands, lanes and groups get equal padding (12 is the
  default).

**Lines and routing**
- Orthogonal routes only (horizontal and vertical segments). No diagonals,
  no curves.
- No crossings where a reroute avoids one. A back edge goes around the
  outside through a channel at least 16 from any box.
- Arrows end on a box edge, never inside, never short of it. Two arrows
  between the same pair use separate ports (`at: [0.3, 0.3]` and
  `[0.7, 0.7]`).
- Weights carry meaning: box outline 1 to 1.2, connector 0.9, accent 1.2,
  dashed for exits and exceptions, long-dash for boundaries, dash-dot
  (`ctr`) for lifelines. Never invent a new weight in a source.

**Labels and text**
- Lettering is small caps sans (`sl`, `lt`, `vs`); identifiers and
  mixed-case values (`requires_action`, `CSRs`, `P&L`) use `tc` or `code:
  true`, since caps would change them.
- Fit text to boxes with the estimate (`widthOf(str, cls)`); per-class
  rough widths: `sl` / `vs` caps about 6.3 per character, `lt` about 7.6,
  `th` about 5.7, `tc` lowercase about 5. Keep 12 of padding each side.
- Edge labels sit beside their segment (above, below, left, right) with
  the knockout; never on top of a line, a box or another label. Two
  parallel connectors closer than their labels' width: label the targets
  instead.
- Break multi-line labels by hand at clause boundaries (`"\n"`); auto-wrap
  leaves orphans.
- No sentence longer than the segment it labels; a longer fact goes in a
  footer line or the caption.

**Accent, brands, borders, theme**
- At most one accented subject: one path, one box, or one band. Everything
  else is ink and gray.
- No brand, company, product or studio names on the drawing; neutral class
  names instead (`open-source engine`, `trade suites`). The caption, alt
  text and References may name them.
- No border or frame; the page frames the figure.
- Theme classes only: no colors, fonts, `<style>` or inline styles; every id
  carries the prefix. Check the `--dark` render too.

**Alt text, caption, accessibility**
- Alt text describes the whole drawing in reading order: the parts, every
  label's fact, which path is accented and what dashes mean. It names only
  what is drawn. Over 40 characters.
- The caption states the point in one or two sentences and may name
  vendors or sources the drawing leaves out.
- Meaning never rests on color alone: the accented path also differs by
  weight, and a legend or the caption says what dashes and double outlines
  mean.
- Text stays at the class sizes (no scaling a group to fit); at the docs
  column width that is the smallest legible size.

## Checklist (run on every render)

1. Nothing crosses the 20 margin; nothing is clipped.
2. No label touches a line, box or another label.
3. No two connectors cross where a reroute exists; back edges run outside.
4. Every arrow ends on a box edge.
5. Siblings share size; gaps are even.
6. One accent at most; dashes mean exit or exception everywhere.
7. Identifiers and mixed-case values keep their case.
8. No brand names, no border, no colors in the source.
9. Same facts as before (when converting); alt text matches the drawing.
10. Light and dark renders both read.
11. Second `npm run dwg` leaves no diff.

## Common failure modes

| Symptom | Fix |
| --- | --- |
| Rightmost box clipped | Origin computed from the left with a fixed x; compute from the far edge or center from the total width |
| Two edge labels overlap | Parallel connectors too close; label the target boxes, or move one label to the other side |
| Label crosses a lifeline or rule | Draw lifelines only at the ends of messages, or use `s.message` with `lifelines` |
| Orphan word on a wrapped label | Break by hand with `"\n"` at a clause boundary |
| Caps mangle a value (`CSRS`, `1..N`) | Use `tc` or `code: true`; on a wire, `labelCls: 'tc'` |
| Uneven gap after a group title | Sub placed after the title by estimate; the kit puts it flush right |
| Wire from a pipeline stage runs through its sub text | Start downstream wires at `bottoms[i]` (or `bottom`) from `s.pipeline` |
| Legend wraps to a second row | Shorten legend labels; the width estimate is generous |
| Accent leaks up a shared trunk | Draw the trunk in ink and accent only the branch: `s.fanOut(..., { hl: i })` (the kit's trees do this too) |
| Note under a margin box runs past the edge | `s.note(node, text, { anchor: 'left' })` (or `'right'`) |
| A `node()` or `row()` call throws about margin, size or gap | It caught a real defect: move the box in, pass size positionally, widen the gap to 16 |
| Box looks crowded | Text within 12 of the edge: widen the box or shorten the label |

## Converting an old diagram

The older diagrams in `public/diagrams/` without `class="dwg"` are
hand-written SVGs using the older `.diagram` classes (`cell`, `ln`, `ah`,
`t`, `cap`, `n`, `zone`).

**Decide first:**
- **Dimensional sheet** only when the diagram is about a measured quantity
  (durations, budgets, sizes, a layered stack, a layout) and a variable
  table would add something. Use the `dimensional-drawing` skill.
- **Standard kit diagram** for flowcharts, state machines, sequences,
  hierarchies, pipelines, money flows and maps: everything structural.
- **Leave it alone** when it already renders cleanly at the column width,
  carries no brand names, and a rewrite would change nothing a reader
  sees. Say so in the PR.

**Then:**
1. Read the old SVG and list every text element: these are the facts.
   Grep `content/` for the filename to read its alt text and caption.
2. Map old parts to kit parts: `cell` to `s.node` (`cell hl` to `hl: true`,
   `cell ghost` to `kind: 'ghost'`, `cell end` to `end: true`, `cell band`
   to `fill: 1`), `ln` arrows to `s.connect` / `s.wire` (`ln dash` to
   `alt`, `ln hl` to `hl`), `zone` to `s.group`, `cap` headings to lane or
   group titles, `n` notes to edge labels, subs or a footer line, `t` mono
   identifiers to `code: true`.
3. Remove brand, company and product names from the drawing; move them to
   the caption ("Examples: ...") so no fact is lost.
4. Write the source with the same file name (the build overwrites the old
   SVG), build, render, run the checklist until it passes.
5. Update the alt text only where labels or views changed; keep the
   caption's point.
6. Note anything that did not convert cleanly in the PR body.

## Lessons learned

Append a dated entry whenever a review finds a new problem, so the next
diagram avoids it. Keep each to one or two lines: what went wrong, the rule.

- 2026-10-27: A state row laid out from a fixed left x ran off the right
  edge. Compute the origin from the total width.
- 2026-10-27: Caps lettering turned `CSRs` into `CSRS`; values with case go
  in `tc`.
- 2026-10-27: Two parallel drops 110 apart had their side labels collide;
  label the target boxes instead.
- 2026-10-27: Lifelines through every party cut the message labels; draw
  them only at the message ends.
- 2026-10-27: Auto-wrapped labels left one-word orphans; break by hand at
  clause boundaries.
- 2026-10-27: A sub placed after a group title by width estimate gave
  uneven gaps between bands; flush the sub right.
- 2026-10-27: Editing sources with Python on Windows rewrote the file with
  CRLF endings, and a bash heredoc mangled the middle dot; edit with the
  Edit or Write tools.
- 2026-10-27: An actor flush to the right margin put its offset shadow 3
  past it; give an actor at an edge 3 of slack. Edge labels are caps, so
  cardinalities (`1..n`) need `tc ko` text placed beside the segment.
  Resolved 2026-10-27: `node()` counts the shadow in the margin check
  (throws) and lands `r` / `b` ports on it; wires take `labelCls: 'tc'`.
- 2026-10-27: `kind: 'ghost'` with `end: true` drew a dashed box around a
  solid one and read as broken; a terminal outcome is a plain `end` box.
  Resolved 2026-10-27: a ghost's inner outline is dashed too.
- 2026-10-27: Year gridlines on a bar chart ran through the value labels;
  draw ticks on the axes only. Resolved 2026-10-27: `s.bars` draws ticks
  on the rules only.
- 2026-10-27: Centering by the nodes alone put a group boundary and side
  brackets off center or inside the margin; center on the outermost
  element (group padding, bracket labels).
- 2026-10-27: Two boxed zones side by side cut the label of the connector
  crossing between them; mark the zones as spans under the chain instead.
  Resolved 2026-10-27: `s.span`.
- 2026-10-27: Wire labels set in caps turned `code_verifier` into
  `CODE_VERIFIER`, and a short last run into a box had no room for its
  label; place identifier labels by hand in `tc`, and label the longer drop.
  Resolved 2026-10-27: `labelCls: 'tc'` on wires, `s.message` for
  sequences; `rotate: true` sets a label along a tall drop.
- 2026-10-27: Hand-rolled fan-outs, joins, brackets, multi-line subs and
  timelines with breaks drifted from sheet to sheet. Resolved 2026-10-27:
  `s.fanOut`, `s.fanIn`, `s.bracket`, `sub` arrays and `s.timeline`; use
  them before drawing paths by hand.
