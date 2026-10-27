// Ingest routing: the creator's encoder lands on a nearby ingest edge, the
// edge asks a routing service (fed by origin compute and backbone link
// capacity) where to send the stream, and the chosen origin transcodes it.
// The routing decision is the accent; draining is the dashed reconnect.
// Embedded in content/books/user-generated-platforms/live-ingest-and-transcoding.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-lir", width: W });
  const w = 150, cols = 4;
  const gap = (W - 40 - cols * w) / (cols - 1);
  const X = (i) => 20 + i * (w + gap);
  const r0 = 24, r1 = 104, r2 = 196, h = 44;

  s.comment("Capacity feeds");
  const compute = s.node(X(2), r0, w, 34, "origin compute", { sub: "net of maintenance" });
  const links = s.node(X(3), r0, w, 34, "backbone links", { sub: "utilization" });

  s.comment("Routing service");
  const route = s.node(X(2), r1, w, h + 8, "routing service", { hl: true, sub: ["picks an origin,", "recorded on the session"] });
  s.fanIn([compute, links], route, { from: "b", to: "t", via: r1 - 18 });

  s.comment("The stream's path");
  const enc = s.node(X(0), r2, w, h, "encoder", { kind: "actor", sub: "stream key" });
  const edge = s.node(X(1), r2, w, h, "ingest edge", { sub: ["terminates RTMP,", "SRT or WHIP"] });
  const origin = s.node(X(3), r2, w, h, "origin", { sub: ["transcode or", "transmux, ladder"] });
  s.connect(enc, edge);
  s.connect(edge, route, { from: "t", to: "l", label: "stream\nproperties", side: "left" });
  s.connect(route, origin, { from: "r", to: "t", hl: true, label: "origin, mode,\nladder", side: "right" });
  s.connect(edge, origin, { label: "backbone", side: "below", at: [0.5, 0.5] });

  s.comment("Draining");
  const dy = r2 + h + 30;
  s.wire([origin.port("b"), [origin.cx, dy], [enc.cx + 3, dy], [enc.cx + 3, enc.y2]], { alt: true, label: "drain: reconnect elsewhere", side: "below" });

  const lg = s.legend(20, dy + 40, [
    { kind: "hl", label: "the routing decision" },
    { kind: "alt", label: "draining an origin" },
    { kind: "actor", label: "the creator's side" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
