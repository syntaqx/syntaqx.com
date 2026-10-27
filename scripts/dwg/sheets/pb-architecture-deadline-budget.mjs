// One request's deadline budget: three attempts and two backoffs inside the
// caller's deadline, the full-jitter backoff in detail, fresh timeouts
// against a propagated deadline, and the variable table. Embedded in
// content/docs/architecture/retries-and-timeouts.md.
import { sheet } from "../kit.mjs";

// D1, base and cap from the chapter; T1, T2 and three attempts illustrative [5].
const D1 = 10, T1 = 0.5, T2 = 0.5, BASE = 0.5, CAP = 5;
const J = [0, 1].map((n) => Math.min(CAP, BASE * 2 ** n)); // ceilings 0.50, 1.00
const A = (D1 - T1 - J[0] - J[1] - T2) / 3; // 2.50
const FRESH = 10; // each call's own timeout in the fresh-timeout policy [4]

const s2 = (n) => n.toFixed(2);

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pb-rt", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "The API promises a response within D1; every call it makes spends from that one budget."],
    [2, "The attempt hits its timeout A. A deadline header tells the callee how long it has left."],
    [3, "Full jitter: J = random(0, min(cap, base × 2^n)), base 0.50 and cap 5.00, drawn at its ceiling."],
    [4, "Each call gets its own 10 s: the user can wait 30 s and the request still fails."],
    [5, "T1, T2 and the three-attempt plan are illustrative; A follows from them and closes the chain."],
    [0, "Values in s, worst case. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: one request, 1 s = 60 px ----
  s.comment("Plan view: one request, three attempts");
  let planBottom;
  {
    const k = 60;
    const parts = [
      [T1, "obj fill-2", null],
      [A, "obj fill-1", "attempt 1"],
      [J[0], "hatch", null],
      [A, "obj fill-1", "attempt 2"],
      [J[1], "hatch", null],
      [A, "obj fill-1", "attempt 3"],
      [T2, "obj fill-2", null],
    ];
    const x0 = CX - (D1 * k) / 2;
    const xs = parts.reduce((acc, [t]) => [...acc, acc[acc.length - 1] + t * k], [x0]);
    const top = ny + 56, h = 36, bot = top + h;
    parts.forEach(([, cls, l], i) => {
      const w = xs[i + 1] - xs[i];
      if (cls === "hatch") s.rect(xs[i], top, w, h, "hatch", { fill: s.hatch });
      else s.rect(xs[i], top, w, h, cls);
      if (l) s.label(xs[i], top, w, h, l);
    });
    s.nb(xs[2] - 12, top + 10, 2);

    const dy = top - 22;
    s.dimH(xs[0], xs[7], dy, "D1", { from: [top, top], hl: true });
    s.nb(CX + 18, dy - 7.5, 1);
    s.chainH(xs, bot + 20, ["T1", "A", "J1", "A", "J2", "A", "T2"], { from: xs.map(() => bot), below: true });

    s.detailRef((xs[4] + xs[5]) / 2, top + h / 2, 27, "detail A", xs[5] + 36, top - 8);
    s.viewTitle(CX, bot + 64, "Plan view · one request, three attempts", "Scale 1 s = 60 px · timeline · worst case");
    planBottom = bot + 77;
  }

  // ---- Section: three calls, two timeout policies, 1 s = 20 px ----
  s.comment("Section: fresh timeouts against one propagated deadline");
  let secBottom;
  {
    const k = 20, h = 24;
    const x0 = CX - (3 * FRESH * k) / 2;
    const X = (t) => x0 + t * k;
    const fy = planBottom + 62, py = fy + h + 62;

    s.text(x0, fy - 8, "fresh timeouts", "sl ink");
    s.nb(x0 + 92, fy - 11, 4);
    [0, 1, 2].forEach((i) => {
      s.rect(X(i * FRESH), fy, FRESH * k, h, "obj fill-1");
      s.label(X(i * FRESH), fy, FRESH * k, h, `call ${i + 1}`);
    });
    s.dimH(X(0), X(3 * FRESH), fy + h + 20, "W1", { from: [fy + h, fy + h], below: true });

    s.text(x0, py - 8, "deadline propagated", "sl ink");
    s.rect(X(0), py, D1 * k, h, "obj fill-1");
    s.label(X(0), py, D1 * k, h, "call 1");
    s.rect(X(D1), py, 2 * FRESH * k, h, "slot");
    s.text((X(D1) + X(3 * FRESH)) / 2, py + h / 2 + 3, "calls 2 and 3 never start", "sl", "middle");
    s.dimH(X(0), X(D1), py + h + 20, "W2", { from: [py + h, py + h], below: true });

    // The caller's deadline, through both rows.
    s.line(X(D1), fy - 18, X(D1), py + h + 30, "ctr");
    s.text(X(D1) + 6, fy - 8, "caller deadline", "sl");

    s.viewTitle(CX, py + h + 60, "Section · three calls, two timeout policies", "Scale 1 s = 20 px · timeline");
    secBottom = py + h + 73;
  }

  // ---- Detail A: backoff J2, full jitter, 1 s = 120 px ----
  s.comment("Detail A: backoff J2");
  const rowTop = secBottom + 44;
  let detailBottom;
  {
    const k = 120, x0 = 56, top = rowTop + 46, h = 36;
    const end = x0 + J[1] * k;
    s.rect(x0, top, end - x0, h, "hatch", { fill: s.hatch });
    s.callout(end - 12, top + 10, end + 10, top + 10, "drawn at ceiling");
    s.dimH(x0, end, top - 20, "J2", { from: [top, top] });
    s.nb((x0 + end) / 2 + 20, top - 27.5, 3);
    // One possible draw, anywhere in 0..J2.
    const draw = x0 + 0.38 * J[1] * k;
    s.line(draw, top - 6, draw, top + h + 8, "ctr");
    s.dimH(x0, draw, top + h + 20, "J", { from: [top + h, null], below: true });
    s.text(draw + 4, top + h + 30, "random(0, J2)", "sl", "start");
    s.viewTitle((x0 + end) / 2, top + h + 70, "Detail A · backoff J2", "Scale 2:1 · 1 s = 120 px · full jitter");
    detailBottom = top + h + 83;
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const tb = s.table(312, rowTop + 16, "Variables · s", [
    ["D1", "caller deadline, passed to every hop", s2(D1)],
    ["T1", "API work before the first call", s2(T1)],
    ["A", "per-attempt timeout", `(D1 − T1 − J1 − J2 − T2) ÷ 3 = ${s2(A)}`],
    ["J1", "backoff ceiling before attempt 2", `min(cap, base × 2^0) = ${s2(J[0])}`],
    ["J2", "backoff ceiling before attempt 3", `min(cap, base × 2^1) = ${s2(J[1])}`],
    ["T2", "reserve to build and send the response", s2(T2)],
    ["C1", "chain, closes on D1", `T1 + 3A + J1 + J2 + T2 = ${s2(T1 + 3 * A + J[0] + J[1] + T2)}`],
    ["W1", "worst wait, fresh 10 s timeout per call", `3 × ${s2(FRESH)} = ${s2(3 * FRESH)}`],
    ["W2", "worst wait, one propagated deadline", `D1 = ${s2(D1)}`],
  ], { widths: [32, 196, 188] });
  s.height = Math.ceil(Math.max(tb.y, detailBottom) + 30);
  return s.toString();
}
