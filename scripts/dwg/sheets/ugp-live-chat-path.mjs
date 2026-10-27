// A live chat message's path: the moderation layers it passes before
// delivery, cheapest first, then one publish to the channel's topic that
// each edge node receives once and writes to its own viewers' sockets (the
// accent). Embedded in
// content/books/user-generated-platforms/live-chat-and-interactivity.md.
import { sheet } from "../kit.mjs";

const LAYERS = [
  { label: "sender", kind: "actor", sub: ["one message"] },
  { label: "penalties", sub: ["banned or timed", "out here?"] },
  { label: "chat modes", sub: ["slow, followers,", "subscribers"] },
  { label: "terms,\nclassifiers", sub: ["drop or hold"] },
  { label: "hold", sub: ["hidden until a", "mod allows it"] },
  { label: "delay", sub: ["2, 4 or 6 s for", "non-moderators"] },
];

export default function draw() {
  const W = 760, gap = 16, h = 36;
  const s = sheet({ prefix: "ugp-lcp", width: W });
  const w = (W - 40 - 5 * gap) / 6;
  const X = (i) => 20 + i * (w + gap);

  s.comment("Before delivery");
  s.text(20, 32, "before delivery, cheapest first", "lt");
  const y1 = 56;
  const { nodes, bottoms } = s.pipeline(20, y1, LAYERS, { w, h, gap });

  s.comment("Fanout");
  const y2 = Math.max(...bottoms) + 40;
  s.text(20, y2 + 8, "fanout, once per edge node", "lt");
  const eh = 32, eg = 14, ey = y2 + 30;
  const edges = [0, 1, 2].map((i) => s.node(X(3), ey + i * (eh + eg), w, eh, "edge node", { hl: true }));
  const topic = s.node(X(5), edges[1].y, w, eh, "channel topic", { kind: "store", hl: true });
  s.wire([[nodes[5].cx, bottoms[5] + 6], [nodes[5].cx, topic.y]], { hl: true, label: "publish once", side: "left" });
  s.fanOut(topic, edges, { from: "l", to: "r", hl: true });
  const viewers = edges.map((e) => s.node(X(1), e.y, w, eh, "viewers", { kind: "actor" }));
  edges.forEach((e, i) => s.connect(e, viewers[i], { from: "l", to: "r", label: i === 0 ? "local sockets" : undefined, side: "above" }));

  const fy = edges[2].y2 + 30;
  s.text(20, fy, "ban notices, raid announcements and moderator messages ride a priority path; very large rooms sample", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
