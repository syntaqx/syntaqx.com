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
only. Nodes return `{ x, y, w, h, cx, cy, port(side, t) }`; `side` is `'l'
| 'r' | 't' | 'b'`, `t` the fraction along that side.

| Helper | Draws |
| --- | --- |
| `s.node(x, y, w, h, label, { kind, end, hl, fill, code, sub, cls })` | a box. `kind`: `process` (default), `state` (rounded), `store` (index line at the left: account, table, queue), `actor` (offset shadow: a party outside the system), `decision` (diamond), `ghost` (dashed: optional, external). `end` doubles the outline (terminal state). `code` keeps the label's case (identifiers). `sub` is a gray second line. `"\n"` breaks lines. `w: null` fits the label |
| `s.row(x, y, w, items, { h, gap, ...node })` | equal nodes spread across `w`; returns the nodes |
| `s.connect(a, b, { from, to, at, via, ...wire })` | orthogonal route between two nodes: opposite sides jog once at the midline (or `via`), the same side twice (a back edge through channel `via`), mixed sides turn once |
| `s.wire(points, { hl, alt, arrow, start, label, seg, side, shift, off })` | a connector through explicit points. `alt` dashed (exit, exception), `hl` accent, `arrow` `end` / `both` / `none`, `start: 'dot'`. `label` on segment `seg` (default the longest), `side` `above` / `below` / `left` / `right`, `"\n"` for lines |
| `s.loop(node, side, { at, reach, ...wire })` | self-loop on one side |
| `s.lanes({ x, y, w, h, lanes, dir, titleW, headH })` | swimlanes; `dir: 'h'` rows with titles in a left column, `'v'` columns with titles on top; each lane `{ label, sub, h \| w, hl }`, `sub` may hold `"\n"`; returns lanes with `x0` / `y0` where content starts |
| `s.tree(root, { x, y, w, h, layout, indent, rowH, levelH, gapX })` | `layout: 'indent'` one level per row (outline), `'down'` a top-down tree with bus connectors; `root` is `{ label, kind, hl, code, children }`; returns placed nodes in order |
| `s.pipeline(x, y, stages, { w, h, gap })` | stages left to right with arrows; each `{ label, head, sub, hl, kind }`; returns `{ nodes, bottom }`, where `bottom` is under the sub text |
| `s.tAccount(x, y, w, title, left, right, { heads, hl })` | a T-account; `heads` default `IN` / `OUT` (use `DEBIT` / `CREDIT` only when the side is known) |
| `s.grid(x, y, title, head, rows, { widths, align })` | a ruled table with any columns (ledger rows, value columns); `align` per column |
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
], { w: 100, gap: 16 });
s.wire([[nodes[1].cx, bottom + 6], [nodes[1].cx, ly], [x0 - 16, ly], [x0 - 16, nodes[0].cy], nodes[0].port("l")], { alt: true, seg: 1, side: "below", label: "stale: re-solve" });
```

### Money flow and ledger

```js
const fbo = s.node(x, y, 210, 36, "FBO account", { kind: "store", hl: true, sub: "held for merchants" });
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
| Label crosses a lifeline or rule | Draw lifelines only at the ends of messages, or move the label between rules |
| Orphan word on a wrapped label | Break by hand with `"\n"` at a clause boundary |
| Caps mangle a value (`CSRS`) | Use `tc` or `code: true` |
| Uneven gap after a group title | Sub placed after the title by estimate; the kit puts it flush right |
| Wire from a pipeline stage runs through its sub text | Start downstream wires at `bottom` from `s.pipeline` |
| Legend wraps to a second row | Shorten legend labels; the width estimate is generous |
| Accent leaks up a shared trunk | Draw the trunk in ink and accent only the branch (the kit's trees do) |
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
- 2026-10-27: `kind: 'ghost'` with `end: true` drew a dashed box around a
  solid one and read as broken; a terminal outcome is a plain `end` box.
- 2026-10-27: Year gridlines on a bar chart ran through the value labels;
  draw ticks on the axes only.
