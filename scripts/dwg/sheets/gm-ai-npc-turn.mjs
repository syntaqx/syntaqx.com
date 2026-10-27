// Latency budget for one voice NPC conversation turn as a timeline, the
// per-sentence output filter in detail, and the variable table. Embedded in
// content/books/gaming/ai-in-games.md.
import { sheet } from "../kit.mjs";

// Illustrative budget in ms [1].
const T = [300, 150, 50, 400, 50, 200];
const L1 = T.reduce((a, b) => a + b, 0); // 1,150

export default function draw() {
  const W = 760, CX = W / 2;
  const s = sheet({ prefix: "gm-ai", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "Illustrative budget, not a measurement: real values come from your vendors, models and network."],
    [2, "T1 is the silence the client waits for before deciding the player has finished speaking."],
    [3, "A blocked sentence never reaches TTS: a scripted fallback line plays and the turn is logged."],
    [4, "Each sentence is checked before it is spoken; S1 plays while S2 is still being generated."],
    [0, "Values in ms. The drawing carries codes; values and formulas are in the table."],
  ], { width: 696 });

  // ---- Plan view: one turn, 1 ms = 0.5 px ----
  s.comment("Plan view: one conversation turn");
  let planBottom;
  {
    const k = 0.5;
    const x0 = CX - (L1 * k) / 2;
    const xs = T.reduce((acc, t) => [...acc, acc[acc.length - 1] + t * k], [x0]);
    const top = ny + 76, h = 36, bot = top + h;
    const fills = ["fill-2", "fill-2", "fill-1", "fill-2", "fill-1", "fill-2"];
    T.forEach((_, i) => s.rect(xs[i], top, xs[i + 1] - xs[i], h, `obj ${fills[i]}`));
    s.label(xs[0], top, xs[1] - xs[0], h, "end of speech");
    s.label(xs[1], top, xs[2] - xs[1], h, "ASR");
    s.label(xs[3], top, xs[4] - xs[3], h, "LLM");
    s.label(xs[5], top, xs[6] - xs[5], h, "TTS");

    const ly = top - 40;
    s.dimH(xs[0], xs[6], ly, "L1", { from: [top, top], hl: true });
    s.nb(CX + 18, ly - 7.5, 1);
    s.callout((xs[2] + xs[3]) / 2, top + h / 2, xs[2] - 16, top - 14, "input filter", { dir: -1 });
    s.callout((xs[4] + xs[5]) / 2, top + 8, xs[4] - 22, top - 14, "output filter", { dir: -1 });
    s.detailRef((xs[4] + xs[5]) / 2, top + h / 2, 15, "detail A", (xs[4] + xs[5]) / 2 + 20, top - 24);

    s.chainH(xs, bot + 20, ["T1", "T2", "T3", "T4", "T5", "T6"], { from: xs.map(() => bot), below: true });
    s.nb((xs[0] + xs[1]) / 2 + 20, bot + 28.5, 2);
    s.viewTitle(CX, bot + 70, "Plan view · one conversation turn", "Scale 1 ms = 0.5 px · timeline");
    planBottom = bot + 83;
  }

  // ---- Detail A: the output filter, per sentence ----
  s.comment("Detail A: output filter");
  const rowTop = planBottom + 50;
  let detailBottom;
  {
    const lx = 52, x0 = 110, cw = 74, ch = 22, gate = 26;
    const yL = rowTop + 16, yF = yL + ch + 22, yT = yF + 20 + 22;
    s.text(lx, yL + ch / 2 + 3, "LLM", "sl ink");
    s.text(lx, yF + 10 + 3, "filter", "sl ink");
    s.text(lx, yT + ch / 2 + 3, "TTS", "sl ink");
    for (let i = 0; i < 3; i++) {
      const x = x0 + i * cw, cx = x + cw / 2;
      if (i === 2) s.rect(x, yL, cw, ch, "hatch", { fill: s.hatch });
      else s.rect(x, yL, cw, ch, "obj fill-2");
      s.text(cx, yL + ch / 2 + 3, `S${i + 1}`, i === 2 ? "sl ink ko" : "sl ink", "middle");
      s.rect(cx - gate / 2, yF, gate, 20, "obj");
      s.path(`M${cx},${yL + ch + 2}V${yF - 2}`, "leader", { "marker-end": `url(#${s.id("ah")})` });
      s.path(`M${cx},${yF + 22}V${yT - 2}`, "leader", { "marker-end": `url(#${s.id("ah")})` });
      s.rect(x, yT, cw, ch, i === 2 ? "obj fill-1" : "obj fill-2");
      s.label(x, yT, cw, ch, i === 2 ? "fallback" : `S${i + 1}`);
    }
    const gx = x0 + 2.5 * cw + gate / 2;
    s.nb(gx + 12, yF + 10, 3);
    s.nb(x0 + 3 * cw + 14, yL + ch / 2, 4);
    const cx = x0 + 1.5 * cw;
    s.viewTitle(cx, yT + ch + 40, "Detail A · output filter", "Not to scale · gated per sentence");
    detailBottom = yT + ch + 53;
  }

  s.comment("Variable table");
  const tb = s.table(400, rowTop + 16, "Variables · ms, illustrative", [
    ["T1", "end of speech", String(T[0])],
    ["T2", "ASR final text", String(T[1])],
    ["T3", "input moderation", String(T[2])],
    ["T4", "LLM first sentence", String(T[3])],
    ["T5", "output moderation", String(T[4])],
    ["T6", "TTS first audio", String(T[5])],
    ["L1", "speech end to voice", `T1+…+T6 = ${L1.toLocaleString("en-US")}`],
  ]);
  s.height = Math.ceil(Math.max(tb.y, detailBottom) + 30);
  return s.toString();
}
