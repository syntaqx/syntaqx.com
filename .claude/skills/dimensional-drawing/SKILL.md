---
name: dimensional-drawing
description: Draw a dimensional drawing (technical sheet with coded dimensions, chain dimensions, exploded axonometric layer stacks, detail circles, numbered notes and a variable table) as an inline SVG diagram for syntaqx.com docs. Use when a doc needs a budget, timeline, stack, layout or architecture drawn as a measured technical sheet.
---

# Dimensional drawings for syntaqx.com

The site's signature diagram style for walking through systems: product-style
technical sheets (plan views, timelines treated as plan views, exploded
axonometric stacks, dimension chains with coded measurements, detail views,
numbered notes, variable tables), built natively on the site's inline-SVG diagram
system and theme tokens. Monochrome ink on paper; the teal accent marks at most
one subject per sheet.

## Workflow

1. Decide the one idea the sheet makes (a budget, a stack, a timeline, a layout).
   One idea per sheet; prefer one sheet.
2. Gather real values with sources. Never invent values: cite them in the
   chapter's References, label a sheet "illustrative" when values aren't sourced,
   and use `[TBD]` for unknowns drawn proportionally.
3. Write the SVG in `public/diagrams/<prefix>-<name>.svg` from the skeleton below,
   with `class="dwg"` on the root and every `id` prefixed.
4. Embed it as its own paragraph:
   `![Alt text describing the whole drawing, over 40 characters.](/diagrams/<file>.svg "Caption that states the point.")`
5. Verify: run `npx vitest run lib/docs.test.ts` (diagram rules), then view the
   page in light and dark themes and check that no label crosses a box or another
   label (a script that compares `getBBox()` of every `<text>` against the
   smallest enclosing `<rect>` and against other text catches most problems).

Reference sheets: `public/diagrams/gm-frame-budget.svg` and
`public/diagrams/gm-client-exploded.svg`. CSS lives in `app/globals.css` under
`.diagram .dwg`.

## Classes

Drawing classes (only inside `<svg class="dwg">`, rules in `app/globals.css`):

| Class | Use | Look |
| --- | --- | --- |
| `obj` | object outline (bars, plates, parts) | ink, 1.6, no fill |
| `obj fill-1` | "hug" element, the heavier fill | shade-2 |
| `obj fill-2` | inset surface, the lighter fill | shade |
| `obj hl` | the one subject, if any | accent stroke + accent fill |
| `dim` | dimension line (on `path`/`line` only) | ink, 0.7 |
| `dim hl` | the subject's dimension | accent, 0.7 |
| `ext` | extension line | ink, 0.55 |
| `slot` | slot / hidden edge | ink, 1, dash 4 3 |
| `ctr` | centerline, envelope, latch/axis | line gray, 0.7, dash-dot |
| `phantom` | region, assembly line, ghost position | line gray, 0.9, long dash |
| `detail` | detail circle | ink, 0.9, dash 5 3 |
| `leader` | leader line + shoulder | ink, 0.7 |
| `dot` | leader dot, event marks | ink fill |
| `hatch` | keep-out / cut section outline; fill comes from `fill="url(#…)"` | ink, 1 |
| `hatch-ln` | the line inside the hatch `<pattern>` | line gray, 0.7 |
| `note-box` | notes block frame | paper fill, line gray 0.8 |
| `iso` | group with the axonometric matrix; children get non-scaling strokes | |
| `vt` | view title | Michroma 12, caps, ink |
| `vs` | view subtitle (scale, view type) | Michroma 9.5, caps, gray |
| `sl` / `sl ink` | slot and part labels | Michroma 9, caps, gray / ink |
| `dt` / `dt hl` | dimension text, with paper knockout | mono 11, ink / accent |
| `ko` | add the paper knockout to any other text | paint-order stroke |

Shared site classes that fit drawings and are reused, not duplicated:
`cap`/`cap ink` (title strip, table header), `t`/`t b` (table cells, formulas, `[n]`
markers), `n` (note sentences, leader descriptions), `cell`/`cell band` (table cells,
small modules inside a part), `ln`/`ln ink` (title strip rules, plain arrows),
`ah ink`/`ah hl` (arrowhead marker paths).

## Skeleton

Copy, rename the prefix (`xx-yy` → your drawing's own prefix, e.g. `gm-fb`), delete
what you don't use. Every `id` must be prefixed: several drawings can be inlined into
one page and ids are page-global.

```svg
<svg xmlns="http://www.w3.org/2000/svg" class="dwg" viewBox="0 0 760 560">
  <defs>
    <marker id="xx-yy-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path class="ah ink" d="M0,0.8L10,5L0,9.2Z"/></marker>
    <pattern id="xx-yy-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path class="hatch-ln" d="M0,0V6"/></pattern>
  </defs>

  <!-- Title strip -->
  <path class="ln" d="M20,12H740M20,36H740"/>
  <text class="cap ink" x="30" y="24" dominant-baseline="central">XX-YYY-001</text>
  <text class="cap" x="380" y="24" text-anchor="middle" dominant-baseline="central">drawing title</text>
  <text class="cap" x="730" y="24" text-anchor="end" dominant-baseline="central">sheet 1 of 1</text>

  <!-- Plan view -->
  <text class="vt" x="40" y="64">Plan view: subject</text>
  <text class="vs" x="40" y="80">Scale 1 ms = 33 px · timeline · values in ms</text>
  <rect class="obj fill-2" x="100" y="128" width="200" height="40"/>
  <rect class="obj fill-1" x="300" y="128" width="200" height="40"/>
  <text class="sl ink" x="200" y="148" text-anchor="middle" dominant-baseline="central">part a</text>

  <!-- A dimension: extension lines start 3 off the feature and overshoot the dim line by 5 -->
  <path class="ext" d="M100,125V95M500,125V95"/>
  <path class="dim" d="M100,100H500" marker-start="url(#xx-yy-ah)" marker-end="url(#xx-yy-ah)"/>
  <text class="dt" x="300" y="96" text-anchor="middle">W1 = A1 + A2 = 6.00 + 6.00 = 12.00</text>

  <!-- A dimension too small for its text: arrow outside, text outside on the line -->
  <path class="dim" d="M80,192H100" marker-end="url(#xx-yy-ah)"/>
  <text class="dt" x="76" y="192" text-anchor="end" dominant-baseline="central">A0 = 0.50</text>

  <!-- Detail circle and its label -->
  <circle class="detail" cx="300" cy="148" r="20"/>
  <text class="sl ink" x="276" y="122" text-anchor="end" dominant-baseline="central">detail A</text>

  <!-- Leader: dot, leader, shoulder, text -->
  <circle class="dot" cx="450" cy="148" r="2"/>
  <path class="leader" d="M450,148L462,136H520"/>
  <text class="sl ink" x="524" y="136" dominant-baseline="central">part b [1]</text>

  <!-- Hatched keep-out: the element carries the fill; never add obj to it -->
  <rect class="hatch" x="500" y="128" width="60" height="40" fill="url(#xx-yy-hatch)"/>

  <!-- Exploded layer: one per layer, drawn bottom layer first so upper plates cover lower ones.
       ty steps by about 62 for a 300 x 200 plate; label the layer at local point (10,185),
       which stays visible: screen (tx - 53.5, ty + 88.65). -->
  <g class="iso" transform="matrix(.94 .17 -.34 .47 363 300)">
    <rect class="obj fill-2" width="300" height="200"/>
    <rect class="cell band" x="20" y="100" width="80" height="60"/>
  </g>
  <circle class="dot" cx="309.5" cy="388.65" r="2"/>
  <path class="leader" d="M309.5,388.65L297.5,376.65H270"/>
  <text class="sl ink" x="264" y="376.65" text-anchor="end" dominant-baseline="central">01 layer name</text>
  <text class="n" x="264" y="392.65" text-anchor="end">what is in it, three items</text>

  <!-- Variable table -->
  <text class="vt" x="420" y="262">Variables</text>
  <text class="vs" x="420" y="278">Illustrative [1] · ms</text>
  <rect class="cell band" x="420" y="288" width="50" height="22"/>
  <rect class="cell band" x="470" y="288" width="180" height="22"/>
  <rect class="cell band" x="650" y="288" width="70" height="22"/>
  <text class="cap ink" x="430" y="299" dominant-baseline="central">code</text>
  <text class="cap ink" x="480" y="299" dominant-baseline="central">item</text>
  <text class="cap ink" x="710" y="299" text-anchor="end" dominant-baseline="central">value</text>
  <path class="cell" d="M420,310H720V354H420Z"/>
  <path class="ln ink" d="M470,310V354M650,310V354"/>
  <path class="ln" d="M420,332H720"/>
  <text class="t b" x="430" y="321" dominant-baseline="central">W1</text>
  <text class="t" x="480" y="321" dominant-baseline="central">whole: A1 + A2</text>
  <text class="t b" x="710" y="321" text-anchor="end" dominant-baseline="central">12.00</text>
  <text class="t" x="430" y="343" dominant-baseline="central">A1</text>
  <text class="t" x="480" y="343" dominant-baseline="central">part a</text>
  <text class="t" x="710" y="343" text-anchor="end" dominant-baseline="central">6.00</text>

  <!-- Notes -->
  <rect class="note-box" x="40" y="500" width="680" height="44"/>
  <text class="sl ink" x="52" y="518">notes</text>
  <text class="n" x="52" y="536">[1] What the marker means, in one sentence.</text>
</svg>
```

## Sizing

- viewBox width 760 (like other site diagrams); a sheet that genuinely needs more may
  go wider, but the figure scales to the column (min 560 px, then scrolls), so text
  shrinks with it. Height: whatever the content needs, 20 px margin under the last box.
- Margins: keep content inside x 20..740; titles start at x 40.
- Text widths per character (measured with the site fonts, caps where the class
  uppercases; budget a little over):
  - `vt` 13 · `vs` 10.3 · `sl` 9.8 · `cap` 8.7 (Michroma is wide: "SIMULATION" as `sl` is 98)
  - `dt` 6.6 · `t` 6.0 (mono, exact)
  - `n` about 5.2 on average, budget 5.8 (proportional)
- A label fits its box when chars x width + 10 <= box width. A dimension's text fits
  between its arrows when chars x 6.6 + 14 (two 7 px arrowheads) + 6 <= span; if not,
  put the arrow and the text outside (see the A0 example).
- Arrowheads are 7 user units; extension lines start 3 off the feature and overshoot
  the dimension line by 5.
- Rows in tables: 22 high, text at row top + 11 with `dominant-baseline="central"`.
- Axonometric: `matrix(.94 .17 -.34 .47 tx ty)` maps a W x D plate to a shape
  0.94W + 0.34D wide and 0.17W + 0.47D tall (300 x 200 → 350 x 145). With a vertical
  step s between layers, the layer above covers a lower layer except where its local
  y > 200 - 1.88 s (for s = 62, local y > 83), so put modules and the leader dot in the front part.

## Do

- Make every measurement a code (`F1`, `T1`, `S1`, `W1`, `L1`) and define each code in the
  variable table (or a Markdown table right after the figure when it is long; keep the
  codes identical).
- Write derived values as formulas with results, and make the parts sum to the whole
  (`F1 = T1 + ... + T5 = 16.67`). Say "illustrative" (subtitle or a note) when values are
  not from a cited source; use `[TBD]` for unknowns, drawn proportionally.
- Put dimension text above its line (`y` 4 above the line, no `dominant-baseline`); the
  `dt` knockout then only has to clear extension lines and hatch.
- Number notes `[1]`, `[2]` next to the feature and explain them in the notes box or
  the caption.
- Put the scale and view type in the `vs` subtitle (`Scale 10:1 · 1 ms = 330 px`,
  `Not to scale`).
- Use the accent for at most one subject (e.g. the F1 dimension), or not at all.
- Prefix every `id` (markers, patterns) with the drawing's own prefix.
- Alt text describes the whole drawing (over 40 characters); the caption states the point.
- Check the rendered page in both themes for overlaps.

## Don't

- Don't put `obj` (or any class with a CSS `fill`) on a hatched shape: CSS beats the
  `fill="url(#…)"` attribute and the hatch disappears. Use `hatch` alone.
- Don't run a dimension line through spaced text and count on the knockout: the paper
  stroke hugs glyphs, so the line shows between words.
- Don't put text inside an `iso` group (it would be sheared); label with leaders outside.
- Don't use `dim` on a `<text>` (inside `.dwg` it means a line; the site's `t dim` gray
  text still works because the line rule skips text, but prefer `sl` or `n` there).
- Don't hard-code colors, `<style>` blocks or fonts in the SVG; use the classes.
- No logos, wordmarks or product screenshots; neutral names only.
- No em-dashes in labels or notes.
