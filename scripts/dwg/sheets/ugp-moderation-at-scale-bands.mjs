// Classifier bands as a standard diagram: a logged score falls into one of
// three bands set per model, category and action (act alone, queue for a
// person in the accent, pass), each with its outcome, and the error budget
// loop that narrows a band from a daily sample. Embedded in
// content/books/user-generated-platforms/moderation-at-scale.md
// (Classifiers as Prioritizers).
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-mb", width: W });

  const top = 44, bandH = 60, gap = 14;
  const xs = 20, ws = 158; // the score
  const xb = 262, wb = 170; // the band stack
  const xo = 500, wo = 220; // outcomes

  s.comment("The score, every one logged");
  const score = s.node(xs, top + bandH * 1.5 - 30, ws, 60, "classifier result", {
    kind: "store", sub: ["every score logged:", "acted, queued, passed"],
  });

  s.comment("Bands for one model, category and action");
  s.text(xb + wb / 2, top - 12, "band", "lt", "middle");
  const bands = [
    s.node(xb, top, wb, bandH, "score ≥ act_at", { code: true, sub: ["no act threshold:", "never acts alone"] }),
    s.node(xb, top + bandH, wb, bandH, "review_at ≤ score < act_at", { code: true, hl: true }),
    s.node(xb, top + 2 * bandH, wb, bandH, "score < review_at", { code: true }),
  ];
  for (const [y, t] of [[top + bandH, "act_at"], [top + 2 * bandH, "review_at"]]) {
    s.line(xb - 8, y, xb, y, "obj");
    s.text(xb - 12, y + 3.5, t, "tc", "end");
  }
  s.wire([score.port("r"), [xb, score.cy]], { label: "per category", side: "below" });

  s.comment("Outcomes");
  const oh = bandH - gap;
  const outs = [
    s.node(xo, top + gap / 2, wo, oh, "automated action", { sub: "remove, hide, label or hold" }),
    s.node(xo, top + bandH + gap / 2, wo, oh, "a person decides", { hl: true, sub: ["queue ranked by severity ×", "probability × reach, then age"] }),
    s.node(xo, top + 2 * bandH + gap / 2, wo, oh, "passed", { sub: "logged: the denominator" }),
  ];
  bands.forEach((b, i) => s.connect(b, outs[i], { hl: i === 1 }));

  s.comment("Error budget loop");
  const ly = top + 3 * bandH + 34, lh = 40;
  const sample = s.node(xo, ly, wo, lh, "daily sample of automated", { sub: "decisions, reviewed by people" });
  const check = s.node(xb, ly, wb, lh, "false positives", { sub: "over the error budget?" });
  const ch = xo + wo + 12;
  s.wire([outs[0].port("r"), [ch, outs[0].cy], [ch, sample.cy], sample.port("r")]);
  s.connect(sample, check, { from: "l", to: "r" });
  s.wire([check.port("t"), [check.cx, top + 3 * bandH]], { alt: true, label: "narrow the band,\nor back to review", side: "left" });

  s.comment("Legend");
  const lg = s.legend(xs, ly + lh + 30, [
    { kind: "hl", label: "the band a person sees" },
    { kind: "alt", label: "a band change, reviewed and dated" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
