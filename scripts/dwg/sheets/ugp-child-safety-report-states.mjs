// A clearinghouse report as a standard state machine: draft, submitted
// and finished in the accent, the preservation hold a finished report
// starts, and the dashed exits of an unfinished report (retracted, or
// deleted by the recipient on its own clock). Law and mechanics only.
// Embedded in content/books/user-generated-platforms/child-safety.md
// (Preservation).
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-cr2", width: W });

  const w = 112, sw = 180, h = 52;
  const gap = (W - 40 - 3 * w - sw) / 3;
  const X = (i) => 20 + i * (w + gap);
  const r1 = 30, r2 = 132;
  const st = (i, y, label, o = {}) => s.node(X(i), y, w, h, label, { kind: "state", code: true, ...o });

  s.comment("The report's path");
  const draft = st(0, r1, "draft", { sub: ["case confirmed,", "knowledge time"] });
  const submitted = st(1, r1, "submitted", { sub: ["report id issued;", "files uploaded"] });
  const finished = st(2, r1, "finished", { hl: true, sub: ["no files added,", "no retraction"] });
  const hold = s.node(X(3), r1, sw, h + 10, "preservation hold", {
    kind: "store", sub: ["contents and context,", "1 year from finish,", "longer voluntarily"],
  });
  s.connect(draft, submitted, { hl: true });
  s.connect(submitted, finished, { hl: true });
  s.connect(finished, hold, { hl: true, at: [0.5, h / 2 / (h + 10)], label: "on finish", side: "above" });

  s.comment("An unfinished report's exits");
  const retracted = st(0, r2, "retracted", { end: true });
  const expired = s.node(X(2), r2, X(3) - X(2) - 16, 64, "deleted unfinished", {
    kind: "ghost", end: true, sub: ["24 h after opening or", "1 h after last change,", "whichever is later"],
  });
  s.wire([submitted.port("b", 0.25), [submitted.x + w * 0.25, retracted.cy], retracted.port("r")], { alt: true, label: "retract", side: "above", seg: 1 });
  s.wire([submitted.port("b", 0.75), [submitted.x + w * 0.75, expired.cy], expired.port("l")], { alt: true, label: "not finished", side: "above", seg: 1 });

  s.comment("Legend and footnote");
  const lg = s.legend(20, expired.y2 + 30, [
    { kind: "hl", label: "the report's path" },
    { kind: "alt", label: "ends it unfinished" },
    { kind: "end", label: "terminal state" },
    { kind: "store", label: "a hold every purge skips" },
  ]);
  const fy = lg.y + 18;
  s.text(20, fy, "removal from public view is immediate and separate; the original moves to the restricted evidence store", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
