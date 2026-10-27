// A platform's own incident mode as a standard pipeline: an external
// activation or internal signals declare the incident, then six steps to a
// close with a record, the incident-only band change in the accent.
// Embedded in
// content/books/user-generated-platforms/violent-extremism-and-graphic-content.md
// (Incident Response).
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-vi", width: W });

  s.comment("What starts an incident");
  const iw = 220, ih = 54;
  const ext = s.node(20, 24, iw, ih, "external activation", { kind: "actor", sub: ["industry consortium or", "government crisis protocol"] });
  const intl = s.node(20 + iw + 24, 24, iw, ih, "internal signals", { kind: "actor", sub: ["a spike in reports", "of one video"] });

  s.comment("The incident mode");
  const w = 104, gap = (W - 40 - 6 * w) / 5, y = 150;
  const { nodes, bottom } = s.pipeline(20, y, [
    { label: "declare", sub: ["start time", "and owner"] },
    { label: "load hashes", sub: ["shared ones as", "they arrive, own", "variants added"] },
    { label: "tighten bands", hl: true, sub: ["exact: remove", "near: quarantine", "new matches: held"] },
    { label: "live queue", sub: ["reviewers pulled", "in, exposure", "rules kept"] },
    { label: "suppress", sub: ["search, recs", "and trending"] },
    { label: "close", end: true, sub: ["when, why, what", "was added and", "removed, debrief"] },
  ], { w, gap, h: 30 });
  s.fanIn([ext, intl], nodes[0], { from: "b", to: "t", via: y - 40 });

  s.comment("Footnote");
  const fy = bottom + 30;
  s.text(20, fy, "the bands tighten for this incident only; matching on its hashes continues after the close", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
