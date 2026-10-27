// A game's life as a pipeline: prototype to sunset, live in the accent with
// its loop of patches, seasons and events, a dashed exit from prototype to
// cancelled, and under each stage what the platform must have by its end.
// Embedded in content/books/gaming/games-business.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { label: "prototype", sub: ["a playable build,", "a way to playtest"] },
  { label: "production", sub: ["pipelines, tests,", "certification"] },
  { label: "launch", sub: ["accounts, store,", "servers, support"] },
  { label: "live", sub: ["live config,", "telemetry,", "moderation"], hl: true },
  { label: "sunset", sub: ["what happens to", "purchases and data"] },
];

export default function draw() {
  const W = 760, w = 120, gap = 30, y = 70;
  const s = sheet({ prefix: "gm-gbl", width: W });
  const x0 = (W - (STAGES.length * w + (STAGES.length - 1) * gap)) / 2;

  s.comment("Stages, and what each must leave behind");
  const { nodes, bottom } = s.pipeline(x0, y, STAGES, { w, h: 30, gap });
  const [prototype, , , live] = nodes;
  s.text(x0, y - 26, "under each stage: done when the platform has", "vs");

  s.comment("Live loop");
  s.loop(live, "t", { hl: true, reach: 20, label: "patches, seasons, events" });

  s.comment("Cancelled");
  const cancelled = s.node(prototype.x, bottom + 48, w, 30, "cancelled", { end: true, fill: 1 });
  s.wire([[prototype.cx, bottom + 6], cancelled.port("t")], { alt: true, side: "right", label: "not fun" });

  s.comment("Legend, beside cancelled");
  s.legend(nodes[1].x, cancelled.cy, [
    { kind: "hl", label: "where the cost goes" },
    { kind: "alt", label: "an early exit" },
    { kind: "end", label: "terminal state" },
  ]);

  s.height = Math.ceil(cancelled.y + cancelled.h + 20);
  return s.toString();
}
