// EU notice and action as a standard pipeline: four kinds of notifier into
// one notice (the trusted flagger's priority lane in the accent), then the
// decision, the statement of reasons, the internal complaint and a
// certified dispute body, whose outcome is implemented and recorded.
// Embedded in
// content/books/user-generated-platforms/regulators-and-enforcement.md
// (Trusted Flaggers).
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-rn", width: W });

  s.comment("Who sends the notice");
  const nw = 130, nh = 28, ngap = 8, ny = 30;
  const kinds = ["member", "non-user", "trusted flagger", "authority"].map((k, i) =>
    s.node(20, ny + i * (nh + ngap), nw, nh, k, { kind: "actor", hl: i === 2 }));
  const stackMid = ny + (4 * (nh + ngap) - ngap) / 2;

  s.comment("Notice to dispute body");
  const x0 = 196, w = 96, n = 5;
  const gap = (W - 20 - x0 - n * w) / (n - 1);
  const ph = 30, py = stackMid - ph / 2;
  const { nodes, bottoms } = s.pipeline(x0, py, [
    { label: "notice", sub: ["the sender's kind", "sets the lane"] },
    { label: "decision", sub: ["legal ground,", "territorial scope"] },
    { label: "statement", sub: ["to the user, and", "to the public", "database"] },
    { label: "complaint", sub: ["internal", "complaint system"] },
    { label: "dispute body", sub: ["certified; 90 days,", "180 if complex"] },
  ], { w, gap, h: ph });
  s.fanIn(kinds, nodes[0], { via: (20 + nw + 3 + x0) / 2, hl: 2 });

  s.comment("The outcome");
  const bw = 200, by = Math.max(...bottoms) + 34;
  const last = nodes[n - 1];
  const impl = s.node(W - 20 - bw, by, bw, 60, "implement and record", { sub: ["restore if overturned;", "the platform pays the", "fees if the user wins"] });
  s.wire([[last.cx, bottoms[n - 1] + 6], [last.cx, by]], {});

  s.comment("Footnotes");
  const fy = impl.y2 + 26;
  s.text(20, fy, "a trusted flagger's notice, in its field, takes the priority lane", "sl");
  s.text(20, fy + 16, "a platform that can't supply the content, decision and statement loses by default", "sl");
  s.height = Math.ceil(fy + 34);
  return s.toString();
}
