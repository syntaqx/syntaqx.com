// A canary release: traffic share per stage over time with a gate after
// each bake, the same release judged bad at g2, the exposure before the
// rollback in detail, and the variable table. Embedded in
// content/docs/delivery/deployment-strategies.md.
import { sheet, el, f, widthOf } from "../kit.mjs";

// Shares from the chapter; B illustrative [1].
const S = [0.01, 0.1, 0.5, 1];
const B = 30; // min
const AFTER = 60; // min of 100% drawn after the last gate
const R1 = 3 * B; // 90
const X1 = (S[0] + S[1]) * B; // 3.3

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pb-dep", width: W });
  const CX = W / 2;
  const k = 4; // px per min
  const x0 = CX - ((R1 + AFTER) * k) / 2;
  const X = (m) => x0 + m * k;
  const titled = (cx, y, t, sub, n) => {
    s.viewTitle(cx, y, t, sub);
    if (n) s.nb(cx + widthOf(t, "vt") / 2 + 14, y - 4, n);
  };
  const tick = (y, code) => {
    s.line(x0 - 5, y, x0, y, "ext");
    s.text(x0 - 9, y + 3.5, code, "dt", "end");
  };

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Stages from the chapter; the 30-minute bake is illustrative: long enough for the SLIs to separate."],
    [2, "At each gate the verdict compares canary to control at the same time, on SLIs, and rolls back by itself."],
    [3, "Routing the slice back to the old version: the bad release only ever reached the canary's share."],
    [4, "Exposure counts minutes of full traffic: each stage's share times the time it served, summed."],
    [0, "Shares in percent of traffic, time in min. The drawing carries codes; values and formulas are in the table."],
  ], { width: 690 });

  // ---- Plan view: the release passes every gate, 100% = 200 px ----
  s.comment("Plan view: release passes");
  let passBottom;
  {
    const H = 200, top = ny + 56, bot = top + H;
    const Y = (p) => bot - p * H;
    s.rect(X(0), top, R1 * k, H, "obj fill-2");
    S.slice(0, 3).forEach((p, i) => s.rect(X(i * B), Y(p), B * k, p * H, "obj fill-1"));
    s.rect(X(R1), top, AFTER * k, H, "obj fill-1");
    s.text(X(R1 / 2), Y(0.8) + 3, "control", "sl ink", "middle");
    s.text(X(2.5 * B), Y(0.25) + 3, "canary", "sl ink", "middle");
    s.text(X(R1 + AFTER / 2), Y(0.5) + 3, "new version", "sl ink", "middle");
    S.forEach((p, i) => tick(Y(p), `s${i + 1}`));

    [1, 2, 3].forEach((g) => {
      s.line(X(g * B), top - 10, X(g * B), bot + 8, "ctr");
      s.text(X(g * B), top - 15, `g${g}`, "dt", "middle");
    });
    s.nb(X(B) + 20, top - 18.5, 2);

    const xs = [0, 1, 2, 3].map((i) => X(i * B));
    s.chainH(xs, bot + 20, ["B", "B", "B"], { from: xs.map(() => bot + 8), below: true });
    s.dimH(X(0), X(R1), bot + 50, "R1", { from: [bot + 24, bot + 24], below: true });
    titled(CX, bot + 96, "Plan view · canary stages, release passes", "Scale 1 min = 4 px · 100% = 200 px · bake time illustrative", 1);
    passBottom = bot + 109;
  }

  // ---- Plan view: the release is judged bad at g2, 100% = 100 px ----
  s.comment("Plan view: rolled back at g2");
  let failBottom;
  {
    const H = 100, top = passBottom + 70, bot = top + H;
    const Y = (p) => bot - p * H;
    s.rect(X(0), top, (R1 + AFTER) * k, H, "obj fill-2");
    s.rect(X(0), Y(S[0]), B * k, S[0] * H, "obj fill-1");
    s.rect(X(B), Y(S[1]), B * k, S[1] * H, "obj fill-1");
    s.path(`M${f(X(2 * B))},${f(Y(S[1]))}V${f(Y(S[2]))}H${f(X(R1))}V${f(Y(1))}H${f(X(R1 + AFTER))}`, "phantom");
    s.text(X(R1 + AFTER / 2), Y(0.75) + 3, "planned, never run", "sl", "middle");
    s.text(X(B), Y(0.72) + 3, "control", "sl ink", "middle");
    tick(Y(1), "s4");
    tick(Y(S[1]), "s2");

    s.line(X(2 * B), top - 10, X(2 * B), bot + 8, "ctr");
    s.text(X(2 * B), top - 15, "g2", "dt", "middle");
    s.callout(X(2 * B), Y(0.05), X(2 * B) + 28, Y(0.3), "rolled back");
    s.nb(X(2 * B) + 42 + widthOf("rolled back", "sl") + 12, Y(0.3), 3);

    s.detailRef(X(B), bot - 6, 14, "detail A", X(B) - 44, Y(0.38));
    titled(CX, bot + 46, "Plan view · release judged bad at the second gate", "Scale 1 min = 4 px · 100% = 100 px", 0);
    failBottom = bot + 59;
  }

  // ---- Detail A: exposure before the rollback, 10% = 100 px ----
  s.comment("Detail A: exposure");
  const rowTop = failBottom + 50;
  let detailBottom;
  {
    const ky = 1000, xd = 76, bot = rowTop + 150;
    const Xd = (m) => xd + m * k;
    s.line(Xd(0) - 10, bot, Xd(2 * B) + 10, bot, "ext");
    s.rect(Xd(0), bot - S[0] * ky, B * k, S[0] * ky, "obj hl");
    s.rect(Xd(B), bot - S[1] * ky, B * k, S[1] * ky, "obj hl");
    s.dimV(bot - S[0] * ky, bot, Xd(0) - 14, "s1", { from: [Xd(0), null], side: "l" });
    s.dimV(bot - S[1] * ky, bot, Xd(2 * B) + 14, "s2", { from: [Xd(2 * B), null], side: "r" });
    const xs = [0, 1, 2].map((i) => Xd(i * B));
    s.chainH(xs, bot + 20, ["B", "B"], { from: xs.map(() => bot), below: true });

    // X1: both slivers, one label.
    const ex = Xd(B) - 20, ey = bot - 72;
    s.callout(Xd(1.5 * B), bot - 50, ex, ey, "X1", { cls: "dt" });
    s.add(el("circle", { class: "dot", cx: Xd(B / 2), cy: bot - 5, r: 1.6 }), el("path", { class: "leader", d: `M${f(Xd(B / 2))},${f(bot - 5)}L${f(ex)},${f(ey)}` }));
    s.nb(ex - 44, ey, 4);

    titled(Xd(B), bot + 72, "Detail A · exposure before the second gate", "Scale 10:1 vertical · 10% = 100 px", 0);
    detailBottom = bot + 85;
  }

  // ---- Variable table ----
  s.comment("Variable table");
  const rows = [
    ["s1", "canary share, stage 1", "1%"],
    ["s2", "canary share, stage 2", "10%"],
    ["s3", "canary share, stage 3", "50%"],
    ["s4", "everyone", "100%"],
    ["B", "bake per stage, against control", `${B} min`],
    ["g1-g3", "verdict gate after each bake", "automated"],
    ["R1", "first canary to everyone", `3 × B = ${R1} min`],
    ["X1", "exposure, rolled back at g2", `(s1 + s2) × B = ${X1.toFixed(1)} min`],
  ];
  const widths = [40, 176, 140];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(W - 32 - tw, rowTop + 16, "Variables · stages from the chapter", rows, { widths });
  s.height = Math.ceil(Math.max(tb.y, detailBottom) + 30);
  return s.toString();
}
