// One shot on a 128-tick server as a three-lane timeline (server, network,
// client), the server buffering as a detail, and the variable table.
// Embedded in content/books/gaming/netcode.md.
import { sheet } from "../kit.mjs";

const T1 = 1000 / 128; // 7.81
const L1 = 35 / 2; // 17.50, illustrative [1]
const I1 = 2 * T1; // 15.63, illustrative [1]
const S1 = 2 * T1; // 15.63 [2]
const R1 = L1 + I1 + L1 + S1; // 66.25
const C1 = L1 + S1 + L1; // 50.63
const SNAP = -(L1 + I1); // snapshot leaves the server
const PROC = L1 + S1; // server processes the shot
const CAP = SNAP - 4.6; // rewind cap, value [TBD]: drawn just past the snapshot

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gm-nst", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "L1 is half the 35 ms ping target, assuming a symmetric path. I1, two ticks of interpolation delay, is illustrative."],
    [2, "Server buffering per the published model: about two server frames (half queue wait, half network buffer, one to apply and send)."],
    [3, "Shots older than the rewind cap R2 are judged at the cap or refused. Rewind is limited; no value is published."],
    [0, "Values in ms, t = 0 at fire. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: one shot, 1 ms = 6 px ----
  s.comment("Plan view: one shot");
  const k = 6, laneX = 110, laneW = 610, t0 = -46;
  const X = (t) => laneX + (t - t0) * k;
  const h = 30;
  const sTop = ny + 92, sBot = sTop + h;
  const cTop = sBot + 92, cBot = cTop + h;

  // Rewind dims above the server lane.
  s.dimH(X(CAP), X(PROC), sTop - 50, "R2 [TBD]", { from: [sTop, sTop] });
  s.nb(X((CAP + PROC) / 2) + 36, sTop - 57.5, 3);
  s.dimH(X(SNAP), X(PROC), sTop - 22, "R1", { from: [sTop, sTop], hl: true });

  // Server lane.
  s.text(laneX - 10, sTop + h / 2 + 3, "server", "sl ink", "end");
  s.rect(laneX, sTop, laneW, h, "obj fill-2");
  s.rect(laneX, sTop, X(CAP) - laneX, h, "hatch", { fill: s.hatch });
  s.rect(X(PROC - S1), sTop, S1 * k, h, "obj fill-1");
  s.line(X(CAP), sTop - 6, X(CAP), sBot + 6, "ctr");
  for (let t = PROC; t > t0; t -= T1) s.line(X(t), sBot - 6, X(t), sBot, "obj");
  for (let t = PROC + T1; t < t0 + laneW / k; t += T1) s.line(X(t), sBot - 6, X(t), sBot, "obj");
  s.text((X(SNAP) + X(PROC - S1)) / 2, sTop + h / 2 - 1, "simulating, hitbox history", "sl ink", "middle");
  s.text(X(PROC + 4) + (laneX + laneW - X(PROC + 4)) / 2, sTop + h / 2 - 1, "hit test", "sl ink", "middle");
  s.add(`<circle class="dot" cx="${X(SNAP)}" cy="${sTop + h / 2}" r="2.2"/>`, `<circle class="dot" cx="${X(PROC)}" cy="${sTop + h / 2}" r="2.2"/>`);
  s.callout((laneX + X(CAP)) / 2, sBot - 8, (laneX + X(CAP)) / 2 + 14, sBot + 26, "refused");

  // Network: packets in flight.
  s.text(laneX - 10, (sBot + cTop) / 2 + 3, "network", "sl ink", "end");
  const ah = `url(#${s.id("ah")})`;
  const packet = (x1, y1, x2, y2, label) => {
    s.path(`M${x1},${y1}L${x2},${y2}`, "leader", { "marker-end": ah });
    s.text((x1 + x2) / 2 + 8, (y1 + y2) / 2 + 3, label, "sl ink ko", "start");
  };
  packet(X(SNAP), sBot + 3, X(SNAP + L1), cTop - 3, "snapshot");
  packet(X(0), cTop - 3, X(L1), sBot + 3, "shot, move number");
  packet(X(PROC), sBot + 3, X(PROC + L1), cTop - 3, "result");

  // Client lane.
  s.text(laneX - 10, cTop + h / 2 + 3, "client", "sl ink", "end");
  s.rect(laneX, cTop, laneW, h, "obj fill-2");
  s.rect(X(-I1), cTop, I1 * k, h, "obj fill-1");
  s.label(X(-I1), cTop, I1 * k, h, "interp");
  s.label(X(0), cTop, C1 * k, h, "awaiting confirmation");
  s.add(`<circle class="dot" cx="${X(0)}" cy="${cTop + h / 2}" r="2.2"/>`, `<circle class="dot" cx="${X(C1)}" cy="${cTop + h / 2}" r="2.2"/>`);
  s.text(X(0) - 5, cTop - 6, "fire", "sl ink", "end");

  // Chain and confirmation below the client lane.
  const xs = [SNAP, -I1, 0, L1, PROC, C1].map(X);
  s.chainH(xs, cBot + 22, ["L1", "I1", "L1", "S1", "L1"], { from: xs.map(() => cBot), below: true });
  s.dimH(X(0), X(C1), cBot + 54, "C1", { from: [cBot, cBot], below: true });
  s.nb(X(-I1 / 2) + 14, cBot + 30, 1);

  // Detail A on the server buffer.
  s.detailRef(X(PROC - S1 / 2), sTop + h / 2, 22, "detail A", X(PROC) + 22, sTop - 10);

  s.viewTitle(laneX + laneW / 2, cBot + 100, "Plan view · one shot, 128-tick server", "Scale 1 ms = 6 px · timeline · t = 0 at fire");
  const planBottom = cBot + 113;

  // ---- Detail A: server buffering, 1 ms = 18 px ----
  s.comment("Detail A: server buffering");
  const rowTop = planBottom + 48;
  let dBot;
  {
    const kd = 18, dx0 = 60, top = rowTop + 40, dh = 34;
    const parts = [[T1 / 2, "queue wait"], [T1 / 2, "net buffer"], [T1, "apply, send"]];
    let x = dx0;
    parts.forEach(([t, label]) => {
      s.rect(x, top, t * kd, dh, "obj fill-1");
      s.label(x, top, t * kd, dh, label);
      x += t * kd;
    });
    s.dimH(dx0, x, top - 26, "S1", { from: [top, top] });
    s.nb((dx0 + x) / 2 + 20, top - 33.5, 2);
    s.chainH([dx0, dx0 + T1 * kd, x], top + dh + 20, ["T1", "T1"], { from: [top + dh, top + dh, top + dh], below: true });
    s.viewTitle((dx0 + x) / 2, top + dh + 66, "Detail A · server buffering", "Scale 1 ms = 18 px · two server frames");
    dBot = top + dh + 79;
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const tb = s.table(400, rowTop + 16, "Variables · ms", [
    ["R1", "rewind depth", "L1+I1+L1+S1 = 66.25"],
    ["C1", "fire to confirmation", "L1+S1+L1 = 50.63"],
    ["R2", "rewind cap", "[TBD]"],
    ["L1", "one-way latency", "35 ÷ 2 = 17.50"],
    ["I1", "interpolation delay", "2 × T1 = 15.63"],
    ["S1", "server buffering", "2 × T1 = 15.63"],
    ["T1", "server tick, 128 Hz", "1000 ÷ 128 = 7.81"],
  ]);
  s.height = Math.ceil(Math.max(tb.y, dBot) + 30);
  return s.toString();
}
