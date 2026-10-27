// One in-game event reaching four feeds on a timeline, the fog of war that
// makes the public feed's delay necessary as a detail, and the variable
// table. Embedded in content/books/gaming/esports-and-spectating.md.
import { sheet } from "../kit.mjs";

// Seconds after the event: B1 is illustrative [1], D1 from Riot support [3].
const B1 = 30, D1 = 180;

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gm-es", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative: real broadcast latency depends on encoding, production and the streaming platform."],
    [2, "Riot (Worlds 2019): the esports spectator system connects directly to the game server for near-zero delay."],
    [3, "Riot support (Wild Rift): friend games stream to spectators with a 3-minute delay; custom matches are live."],
    [4, "A spectator feed shows both teams; without fog of war it must be delayed past G1, or restricted to officials."],
    [5, "G1 is how long a sighting helps an opponent; set it per game and add a margin."],
    [0, "Values in seconds. The drawing carries codes; values and the rule are in the table."],
  ], { width: 690 });

  // ---- Plan view: one event, four feeds, 1 s = 3 px ----
  s.comment("Plan view: one event, four feeds");
  const k = 3, x0 = 180, X = (t) => x0 + t * k;
  const top = ny + 40, pitch = 46, h = 18;
  const lane = (i) => top + 22 + i * pitch; // bar top of lane i
  const axisY = lane(3) + h + 52;
  s.line(x0, top, x0, axisY, "ctr");
  s.text(x0 + 8, top + 6, "event · t = 0", "sl ink");

  const names = ["match server", "observer", "broadcast", "spectate"];
  names.forEach((n, i) => s.text(x0 - 16, lane(i) + h / 2 + 3, n, "sl ink", "end"));
  // Match server: the event itself.
  s.add(`<circle class="dot" cx="${x0}" cy="${lane(0) + h / 2}" r="3"/>`);
  // Observer: near zero.
  s.add(`<circle class="dot" cx="${x0 + 2}" cy="${lane(1) + h / 2}" r="3"/>`);
  s.text(x0 + 14, lane(1) + h / 2 + 3.5, "O1", "dt");
  s.nb(x0 + 40, lane(1) + h / 2, 2);
  // Broadcast.
  s.rect(X(0), lane(2), B1 * k, h, "obj fill-2");
  s.dimH(X(0), X(B1), lane(2) - 10, "B1", { from: [null, lane(2)] });
  s.nb(X(B1) + 16, lane(2) + h / 2, 1);
  // Public spectate.
  s.rect(X(0), lane(3), D1 * k, h, "obj fill-1");
  s.dimH(X(0), X(D1), lane(3) + h + 16, "D1", { from: [null, lane(3) + h], below: true, hl: true });
  s.nb(X(D1 / 2) + 22, lane(3) + h + 24.5, 3);
  s.detailRef(X(D1) - 24, lane(3) + h / 2, 16, "detail A", X(D1) - 70, lane(2) + h / 2);

  // Time axis, graduated every 30 s.
  s.line(x0, axisY, X(D1), axisY, "obj");
  for (let t = 0; t <= D1; t += 30) {
    s.line(X(t), axisY, X(t), axisY + 5, "ext");
    s.text(X(t), axisY + 16, String(t), "vs", "middle");
  }
  const CX = (x0 + X(D1)) / 2;
  s.viewTitle(CX, axisY + 50, "Plan view · one event, four feeds", "Scale 1 s = 3 px · timeline · s");
  const planBottom = axisY + 63;

  // ---- Detail A: fog of war, one map ----
  s.comment("Detail A: fog of war");
  const dy = planBottom + 62, mw = 130, mh = 80, dx0 = 60, dgap = 40;
  // Player client: own side visible, the other side fogged.
  s.rect(dx0, dy, mw, mh, "obj fill-2");
  s.rect(dx0 + mw / 2, dy, mw / 2, mh, "hatch", { fill: s.hatch });
  s.rect(dx0, dy, mw, mh, "obj");
  s.add(`<circle class="dot" cx="${dx0 + 30}" cy="${dy + 36}" r="4"/>`, `<circle class="slot" cx="${dx0 + 100}" cy="${dy + 50}" r="4"/>`);
  s.text(dx0 + (mw * 3) / 4, dy - 8, "fog", "sl ink", "middle");
  s.nb(dx0 + (mw * 3) / 4 + 22, dy - 11, 4);
  // Spectator feed: both teams visible.
  const sx = dx0 + mw + dgap;
  s.rect(sx, dy, mw, mh, "obj fill-2");
  s.add(`<circle class="dot" cx="${sx + 30}" cy="${dy + 36}" r="4"/>`, `<circle class="dot" cx="${sx + 100}" cy="${dy + 50}" r="4"/>`);
  s.text(dx0 + mw / 2, dy + mh + 16, "player client", "sl ink", "middle");
  s.text(sx + mw / 2, dy + mh + 16, "spectator feed", "sl ink", "middle");
  const dcx = (dx0 + sx + mw) / 2;
  s.viewTitle(dcx, dy + mh + 52, "Detail A · fog of war", "Not to scale · one map");
  const detailBottom = dy + mh + 65;

  // ---- Variable table ----
  s.comment("Variable table");
  const tb = s.table(440, dy, "Variables · s", [
    ["O1", "observer client delay", "~0"],
    ["B1", "broadcast to viewers", String(B1)],
    ["D1", "public spectate delay", String(D1)],
    ["G1", "sighting stays useful", "varies"],
    ["R1", "rule", "D1 > G1 + margin"],
  ]);
  s.height = Math.ceil(Math.max(tb.y, detailBottom) + 30);
  return s.toString();
}
