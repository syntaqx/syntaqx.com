// One day of support requests split by a bot, and one ticket's timeline
// before automation, from a studio's published 2017 figures. Embedded in
// content/books/gaming/player-support.md.
import { sheet } from "../kit.mjs";

const Q1 = 12000, B1 = 2400, H1 = Q1 - B1; // requests a day
const L1 = 25, L2 = 72, L3 = L2 - L1; // hours

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "gm-ps", width: W });
  const CX = W / 2;
  const ah = `url(#${s.id("ah")})`;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "One studio's published 2017 support-bot figures: a dated baseline, not current. B1 is 20% of Q1."],
    [2, "Classifiers trained on about 100k completed tickets per major language; C1 and C2 are at launch."],
    [3, "Before automation, as \"up to\" values. L3 is derived from L2 and L1. Denials stayed with agents."],
    [4, "E1: the bot's share equals the daily output of about 50 agents."],
    [0, "Values in requests per day and hours. The drawing carries codes; values and formulas are in the tables."],
  ], { width: 690 });

  // ---- Plan view: one day of requests, 1,000 = 30 px ----
  s.comment("Plan view: one day of requests");
  let dayBottom;
  {
    const k = 30 / 1000;
    const bw = 116, ag = 32, h = 34;
    const total = bw + ag + bw + ag + Q1 * k;
    const x0 = CX - total / 2;
    const top = ny + 56, bot = top + h, mid = top + h / 2;
    const xc = x0 + bw + ag, xs = xc + bw + ag;
    const xb = xs + B1 * k, xe = xs + Q1 * k;

    s.rect(x0, top, bw, h, "obj fill-2");
    s.label(x0, top, bw, h, "intake");
    s.rect(xc, top, bw, h, "obj fill-2");
    s.label(xc, top, bw, h, "classifier");
    s.nb(xc + bw / 2, top - 11, 2);
    s.path(`M${x0 + bw + 3},${mid}H${xc - 3}`, "leader", { "marker-end": ah });
    s.path(`M${xc + bw + 3},${mid}H${xs - 3}`, "leader", { "marker-end": ah });
    s.rect(xs, top, B1 * k, h, "obj hl");
    s.rect(xb, top, H1 * k, h, "obj fill-2");
    s.label(xs, top, B1 * k, h, "bot");
    s.label(xb, top, H1 * k, h, "agents");

    s.dimH(xs, xe, top - 22, "Q1", { from: [top, top] });
    s.nb((xs + xe) / 2 + 20, top - 29.5, 1);
    const cy = bot + 20;
    s.dimH(xs, xb, cy, "B1", { from: [bot, bot], below: true, hl: true });
    s.dimH(xb, xe, cy, "H1", { from: [null, bot], below: true });
    s.nb(xs + (B1 * k) / 2 + 18, cy + 8.5, 4);

    s.viewTitle(CX, cy + 46, "Plan view · one day of requests", "Scale 1,000 requests = 30 px · flow");
    dayBottom = cy + 59;
  }

  // ---- Plan view: one ticket before automation, 1 h = 8 px ----
  s.comment("Plan view: one ticket before automation");
  let ticketBottom;
  {
    const k = 8;
    const x0 = CX - (L2 * k) / 2;
    const x1 = x0 + L1 * k, x2 = x0 + L2 * k;
    const top = dayBottom + 64, h = 30, bot = top + h, mid = top + h / 2;
    s.rect(x0, top, L1 * k, h, "obj fill-2");
    s.rect(x1, top, L3 * k, h, "obj fill-1");
    s.label(x0, top, L1 * k, h, "queue");
    s.label(x1, top, L3 * k, h, "back and forth");

    s.dimH(x0, x2, top - 22, "L2", { from: [top, top] });
    s.nb(CX + 18, top - 29.5, 3);
    const cy = bot + 20;
    s.chainH([x0, x1, x2], cy, ["L1", "L3"], { from: [bot, bot, bot], below: true });

    // Events on a centerline through the bar ends.
    for (const [x, t] of [[x0, "opened"], [x1, "first reply"], [x2, "resolved"]]) {
      s.add(`<circle class="dot" cx="${x}" cy="${mid}" r="2.2"/>`);
      s.text(x, cy + 30, t, "sl ink", "middle");
    }

    s.viewTitle(CX, cy + 64, "Plan view · one ticket before automation", "Scale 1 h = 8 px · timeline");
    ticketBottom = cy + 77;
  }

  // ---- Variable tables ----
  s.comment("Variable tables");
  const ty = ticketBottom + 56;
  const t1 = s.table(52, ty, "Variables · one day", [
    ["Q1", "requests a day", "B1 + H1 = 12,000"],
    ["B1", "routed or answered by bot", "20% × Q1 = 2,400"],
    ["H1", "left for agents", "Q1 − B1 = 9,600"],
    ["E1", "bot work, in agents", "~50"],
    ["F1", "solved at first touch", "70%"],
    ["K1", "category chosen right", "~80%"],
    ["C1", "recovery tickets caught", "52%"],
    ["C2", "accuracy on those", "~93%"],
  ]);
  const t2 = s.table(462, ty, "Variables · hours", [
    ["L1", "first response, up to", "25"],
    ["L3", "reply to resolution", "L2 − L1 = 47"],
    ["L2", "resolution, up to", "72 (3 days)"],
  ]);
  s.height = Math.ceil(Math.max(t1.y, t2.y) + 30);
  return s.toString();
}
