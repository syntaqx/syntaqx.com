// Two clocks, one event: a device clock running ahead, an event queued
// offline, and the server deriving its time from receivedAt minus the time
// in queue. Plan view on one true-time axis, the transit in detail, and the
// variable table. Embedded in content/docs/telemetry/collection.md (Two Clocks).
import { sheet, widthOf } from "../kit.mjs";

// Illustrative values in seconds [3]; true time from an arbitrary zero.
const K1 = 30; // device clock ahead of server clock
const TRUE_CREATED = 10;
const O1 = TRUE_CREATED + K1; // 40, device clock
const S1 = 120; // device clock
const Q1 = S1 - O1; // 80
const R1 = 91; // server clock (server clock reads true time)
const T1 = R1 - Q1; // 11
const E1 = T1 - TRUE_CREATED; // 1
const SENT_TRUE = S1 - K1; // 90

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "tm-cc", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Segment: timestamp = receivedAt - (sentAt - originalTimestamp); Snowplow derived_tstamp matches."],
    [2, "Q1 is read on one clock, so the skew K1 cancels; what remains, E1, is the transit time."],
    [3, "Illustrative values in seconds from an arbitrary zero on the true clock."],
    [0, "The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: one true-time axis, 1 s = 4 px ----
  s.comment("Plan view: device and server clocks");
  const k = 4, span = 130;
  const x0 = CX - (span * k) / 2 + 20;
  const X = (t) => x0 + t * k; // true time to x
  const h = 30;
  const devY = ny + 58;
  const devAxis = devY + h + 14;
  const srvY = devAxis + 64;
  const srvAxis = srvY + h + 14;
  let planBottom;
  {
    // Device lane: the event queued offline from O1 to S1 (device clock).
    s.text(x0 - 14, devY + h / 2 + 3, "device", "sl ink", "end");
    s.rect(X(TRUE_CREATED), devY, X(SENT_TRUE) - X(TRUE_CREATED), h, "obj fill-2");
    s.label(X(TRUE_CREATED), devY, X(SENT_TRUE) - X(TRUE_CREATED), h, "queued offline");
    s.dimH(X(TRUE_CREATED), X(SENT_TRUE), devY - 22, "Q1", { from: [devY, devY] });
    s.nb((X(TRUE_CREATED) + X(SENT_TRUE)) / 2 + 20, devY - 29.5, 2);

    // Clock axes: ticks every 20 s of true time, labelled in each clock's reading.
    const axis = (y, offset, name) => {
      s.line(X(0), y, X(span), y, "obj");
      for (let t = 0; t <= span; t += 20) {
        s.line(X(t), y - 4, X(t), y + 4, "obj");
        s.text(X(t), y + 15, String(t + offset), "vs", "middle");
      }
      s.text(x0 - 14, y + 15, name, "vs", "end");
    };
    axis(devAxis, K1, "device clock");

    // Server lane.
    s.text(x0 - 14, srvY + h / 2 + 3, "server", "sl ink", "end");
    s.rect(X(0), srvY, span * k, h, "slot");
    s.add(`<circle class="dot" cx="${X(R1)}" cy="${srvY + h / 2}" r="2.6"/>`);
    s.add(`<circle class="obj hl" cx="${X(T1)}" cy="${srvY + h / 2}" r="3.5"/>`);
    s.text(X(T1) + 10, srvY + h / 2 + 3.5, "T1", "dt hl");
    s.text(X(R1) + 10, srvY + h / 2 + 3.5, "R1", "dt");
    axis(srvAxis, 0, "server clock");

    // Codes for the device bar's ends, above it on the far side of Q1.
    s.text(X(TRUE_CREATED) + 6, devY + h / 2 + 3.5, "O1", "dt", "start");
    s.text(X(SENT_TRUE) - 6, devY + h / 2 + 3.5, "S1", "dt", "end");

    // Transit: sent on the device, received on the server.
    s.path(`M${X(SENT_TRUE)},${devY + h}L${X(R1)},${srvY}`, "leader", { "marker-end": `url(#${s.id("ah")})` });
    s.detailRef(X(R1) - 1, srvY - 4, 16, "detail A", X(R1) + 60, srvY - 34);

    // Below the server axis: Q1 subtracted from R1 lands on T1.
    const qy = srvAxis + 40;
    s.dimH(X(T1), X(R1), qy, "Q1", { from: [srvY + h / 2 + 5, srvY + h / 2 + 4], below: true });
    s.nb((X(T1) + X(R1)) / 2 + 20, qy + 8.5, 1);
    s.dimH(X(0), X(T1), qy, "T1", { from: [srvAxis + 18, null], below: true, hl: true });

    s.viewTitle(CX, qy + 46, "Plan view · device and server clocks", "Scale 1 s = 4 px · one true-time axis");
    planBottom = qy + 59;
  }

  // ---- Detail A: the transit, 1 s = 60 px ----
  s.comment("Detail A: transit");
  const rowTop = planBottom + 40;
  let detailBottom;
  {
    const kd = 60, from = SENT_TRUE - 1.5, to = R1 + 1.5;
    const dx0 = 70;
    const D = (t) => dx0 + (t - from) * kd;
    const top = rowTop + 24, hh = 26, sy = top + hh + 36;
    s.rect(D(from), top, D(SENT_TRUE) - D(from), hh, "obj fill-2");
    s.text(D(SENT_TRUE) - 6, top + hh / 2 + 3.5, "S1", "dt", "end");
    s.rect(D(from), sy, D(to) - D(from), hh, "slot");
    s.add(`<circle class="dot" cx="${D(R1)}" cy="${sy + hh / 2}" r="2.6"/>`);
    s.text(D(R1) + 8, sy + hh / 2 + 3.5, "R1", "dt");
    s.path(`M${D(SENT_TRUE)},${top + hh}L${D(R1)},${sy}`, "leader", { "marker-end": `url(#${s.id("ah")})` });
    s.text((D(SENT_TRUE) + D(R1)) / 2 + 10, (top + hh + sy) / 2 + 3, "transit", "sl ink");
    s.text(D(from) - 10, top + hh / 2 + 3, "device", "sl ink", "end");
    s.text(D(from) - 10, sy + hh / 2 + 3, "server", "sl ink", "end");
    const ey = sy + hh + 22;
    s.dimH(D(SENT_TRUE), D(R1), ey, "E1", { from: [top + hh, sy + hh], below: true });
    s.nb(D(R1) + 22, ey + 8.5, 2);
    s.viewTitle((D(from) + D(to)) / 2, ey + 46, "Detail A · transit", "Scale 15:1 · 1 s = 60 px");
    detailBottom = ey + 59;
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["K1", "device clock ahead of server clock", "30.00"],
    ["O1", "created, device clock (originalTimestamp)", "40.00"],
    ["S1", "sent, device clock (sentAt)", "120.00"],
    ["Q1", "time in queue", "S1 - O1 = 80.00"],
    ["R1", "received, server clock (receivedAt)", "91.00"],
    ["T1", "event time on the server clock", "R1 - Q1 = 11.00"],
    ["E1", "error against the true time of 10.00", "T1 - 10.00 = 1.00"],
  ];
  const tw = [0, 1, 2].reduce((sum, j) => sum + Math.max([30, 80, 60][j], Math.ceil(Math.max(...rows.map((r) => widthOf(r[j], "tc"))) + 14)), 0);
  const tb = s.table(W - 32 - tw, rowTop + 24, "Variables · s", rows);
  s.height = Math.ceil(Math.max(tb.y, detailBottom) + 30);
  return s.toString();
}
