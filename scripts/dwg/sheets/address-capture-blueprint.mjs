// The address capture flow as a UI blueprint: four wireframed screens (saved
// addresses, search, confirm details, manual entry) with the flow between
// them and numbered notes on what each field stores and under whose license.
// The entrance pin is the accent: seeded from a storable geocode, it's the location kept.
// Embedded in content/docs/fundamentals/addresses.md (The Capture Flow).
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "acb", width: W });

  s.comment("Notes");
  const ny = s.notes(
    32,
    40,
    [
      [1, "Saved addresses carry the customer's own labels, private to them, most recent first."],
      [
        2,
        "Suggestions are for typing: only the one the customer picks may be kept, for their transaction.",
      ],
      [
        3,
        "Enter manually is always the last row; that path rejoins at confirm, so it gets a pin too.",
      ],
      [
        4,
        "Unit, building and place type come from the customer; the unit stays with the address lines.",
      ],
      [
        5,
        "The gate code opens a gate: encrypted in the application, shown only during an active job.",
      ],
      [
        6,
        "The pin starts on a geocode you may store and moves only inside a box sized by its precision.",
      ],
      [7, "Country comes first and decides the fields; no state or province is preselected."],
      [
        8,
        "Save writes the address and its geocode job in one transaction; orders copy the address.",
      ],
      [0, "Wireframes show slots, not copy. Not to scale."],
    ],
    { width: 700 },
  );

  // Four screens, evenly spaced.
  const sw = 150,
    sh = 300,
    gap = (W - 40 - 4 * sw) / 3;
  const X = (i) => 20 + i * (sw + gap);
  const top = ny + 52;
  const pad = 10,
    cw = sw - 2 * pad;
  const bottom = top + sh;

  // Wireframe pieces, in screen coordinates.
  const field = (x, y, w, h, label, cls = "obj fill-1") => {
    s.rect(x, y, w, h, cls, { rx: 3 });
    if (label) s.label(x, y, w, h, label);
  };
  const slot = (x, y, w, h, label) => {
    s.rect(x, y, w, h, "slot", { rx: 2 });
    if (label) s.label(x, y, w, h, label);
  };
  const textBar = (x, y, w) => s.rect(x, y, w, 4, "obj fill-2");
  const circle = (cx, cy, r, cls) =>
    s.path(`M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`, cls);

  s.comment("Screens");
  for (let i = 0; i < 4; i++) s.rect(X(i), top, sw, sh, "obj", { rx: 10 });

  // 1 · saved addresses
  const a = { x: X(0) + pad, y: top + 12 };
  slot(a.x, a.y, cw, 14, "title · hug");
  const search1 = a.y + 22;
  field(a.x, search1, cw, 20, "search · fill");
  const chipsY = search1 + 28;
  [0, 1, 2].forEach((k) => s.rect(a.x + k * 34, chipsY, 30, 12, "slot", { rx: 6 }));
  s.nb(a.x + cw - 6, chipsY + 6, 1);
  const rowsY = chipsY + 22;
  for (let r = 0; r < 4; r++) {
    const ry = rowsY + r * 40;
    circle(a.x + 6, ry + 12, 5, "obj");
    if (r === 0) circle(a.x + 6, ry + 12, 2.2, "dot");
    textBar(a.x + 18, ry + 6, 50);
    textBar(a.x + 18, ry + 16, 86);
    s.rect(a.x + cw - 10, ry + 7, 10, 10, "slot", { rx: 2 }); // edit
    if (r < 3) s.line(a.x, ry + 32, a.x + cw, ry + 32, "ext");
  }

  // 2 · search with suggestions
  const b = { x: X(1) + pad, y: top + 12 };
  slot(b.x, b.y, cw, 14, "title · hug");
  const search2 = b.y + 22;
  field(b.x, search2, cw, 20, "query");
  const panelY = search2 + 26;
  s.rect(b.x, panelY, cw, 4 * 30, "obj plate", { rx: 4 });
  for (let r = 0; r < 3; r++) {
    const ry = panelY + r * 30;
    textBar(b.x + 8, ry + 9, 70);
    textBar(b.x + 8, ry + 19, 96);
    s.path(`M${b.x + cw - 12},${ry + 11}l4,4l-4,4`, "obj"); // chevron
    s.line(b.x, ry + 30, b.x + cw, ry + 30, "ext");
  }
  s.nb(X(1) + sw + 10, panelY + 45, 2);
  const manualRow = panelY + 90;
  s.label(b.x, manualRow, cw, 30, "enter manually");
  s.nb(b.x + cw - 6, manualRow + 15, 3);
  for (let r = 0; r < 3; r++) slot(b.x, panelY + 130 + r * 22, cw, 14); // the list, behind

  // 3 · confirm details
  const c = { x: X(2) + pad, y: top + 12 };
  const half = (cw - 6) / 2;
  let cy = c.y;
  slot(c.x, cy, cw, 14, "picked address");
  cy += 20;
  field(c.x, cy, cw, 16, "place type · select");
  s.nb(X(2) + sw + 10, cy + 8, 4);
  cy += 22;
  field(c.x, cy, 48, 16, "unit");
  field(c.x + 54, cy, cw - 54, 16, "gate code");
  s.nb(X(2) + sw + 10, cy + 8, 5);
  cy += 22;
  field(c.x, cy, cw, 16, "building");
  cy += 22;
  const mapY = cy,
    mapH = 62;
  s.rect(c.x, mapY, cw, mapH, "obj fill-2", { rx: 3 });
  for (let k = 1; k < 4; k++)
    s.line(c.x + (k * cw) / 4, mapY, c.x + (k * cw) / 4, mapY + mapH, "ext");
  s.line(c.x, mapY + mapH / 2, c.x + cw, mapY + mapH / 2, "ext");
  const pinX = c.x + cw / 2,
    pinY = mapY + 24;
  s.rect(pinX - 30, mapY + 5, 60, 30, "phantom"); // the bound the pin may move within
  s.path(`M${pinX},${pinY + 10}l-6,-10a6,6 0 1,1 12,0z`, "obj hl"); // the pin
  s.rect(c.x + cw / 2 - 38, mapY + mapH - 18, 76, 13, "obj plate", { rx: 6 });
  s.label(c.x + cw / 2 - 38, mapY + mapH - 18, 76, 13, "adjust pin", "sl hl");
  s.nb(X(2) + sw + 10, mapY + 8, 6);
  cy += mapH + 6;
  field(c.x, cy, half, 16, "door");
  field(c.x + half + 6, cy, half, 16, "lobby", "slot");
  cy += 22;
  slot(c.x, cy, cw, 26, "instructions");
  cy += 32;
  [0, 1, 2].forEach((k) => s.rect(c.x + k * 34, cy, 30, 12, "slot", { rx: 6 }));
  cy += 20;
  const saveY = cy;
  field(c.x, saveY, cw, 20, "save");
  s.nb(c.x + cw - 6, saveY + 10, 8);

  // 4 · manual entry
  const d = { x: X(3) + pad, y: top + 12 };
  let dy = d.y;
  slot(d.x, dy, cw, 14, "title · hug");
  dy += 22;
  field(d.x, dy, cw, 16, "country");
  s.nb(d.x + cw - 6, dy + 8, 7);
  dy += 22;
  field(d.x, dy, cw, 16, "street · fill");
  dy += 22;
  field(d.x, dy, half, 16, "unit");
  field(d.x + half + 6, dy, half, 16, "city");
  dy += 22;
  field(d.x, dy, half, 16, "region");
  field(d.x + half + 6, dy, half, 16, "postcode");
  const continueY = saveY;
  field(d.x, continueY, cw, 20, "continue");

  s.comment("View titles");
  const titles = [
    ["1 · Choose", "Saved addresses"],
    ["2 · Search", "Autocomplete"],
    ["3 · Confirm", "Details and pin"],
    ["Manual entry", "When nothing matches"],
  ];
  titles.forEach(([t, sub], i) => s.viewTitle(X(i) + sw / 2, bottom + 22, t, sub));

  s.comment("Flow");
  const mid = (i) => X(i) + sw / 2;
  s.wire([
    [X(0) + sw, search1 + 10],
    [X(1), search1 + 10],
  ]);
  s.wire([
    [X(1) + sw, panelY + 15],
    [X(2), panelY + 15],
  ]);
  const chan = bottom + 58;
  const entryY = bottom - 20;
  s.wire(
    [
      [X(1) + sw, manualRow + 15],
      [X(2) - 12, manualRow + 15],
      [X(2) - 12, chan],
      [X(3) - 14, chan],
      [X(3) - 14, entryY],
      [X(3), entryY],
    ],
    { alt: true, label: "no match", side: "below", seg: 2 },
  );
  s.wire(
    [
      [X(3), continueY + 10],
      [X(2) + sw, continueY + 10],
    ],
    { alt: true },
  );
  const over = top - 18;
  s.wire(
    [
      [mid(2), top],
      [mid(2), over],
      [mid(0), over],
      [mid(0), top],
    ],
    { label: "save to the address book", side: "above" },
  );

  s.height = chan + 34;
  return s.toString();
}
