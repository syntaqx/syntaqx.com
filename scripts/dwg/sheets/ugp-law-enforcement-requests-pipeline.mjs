// The legal request operating model as a standard pipeline in two rows:
// intake to preservation (in the accent, with the preservation clocks),
// then legal review to close, with the exits in footnotes.
// Embedded in
// content/books/user-generated-platforms/law-enforcement-requests.md (The
// Operating Model).
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-le", width: W });

  const w = 124, gap = (W - 40 - 5 * w) / 4, h = 30;

  s.comment("Row 1: intake to preservation");
  const r1 = s.pipeline(20, 30, [
    { label: "1 intake", sub: ["one channel; the", "document kept", "uneditable"] },
    { label: "2 classify", sub: ["process type, data", "categories; due 8 h", "or 10 days (EU)"] },
    { label: "3 verify", sub: ["the requester and,", "for emergencies,", "the emergency"] },
    { label: "4 resolve", sub: ["identifiers to", "accounts as of", "the date"] },
    { label: "5 preserve", hl: true, sub: ["hold before review:", "90 days, +90 (US);", "60 days, +30 (EU)"] },
  ], { w, gap, h });

  s.comment("Row 2: review to close");
  const y2 = r1.bottom + 64;
  const r2 = s.pipeline(20, y2, [
    { label: "6 legal review", sub: ["valid, sufficient,", "narrow enough?"] },
    { label: "7 produce", sub: ["approved categories,", "hashed manifest"] },
    { label: "8 notify user", sub: ["unless prohibited;", "scheduled for later"] },
    { label: "9 close, count", end: true, sub: ["transparency report,", "cost recovery"] },
  ], { w, gap, h });

  s.comment("The turn between rows");
  const p = r1.nodes[4], q = r2.nodes[0];
  const ty = r1.bottom + 22;
  s.wire([[p.cx, r1.bottoms[4] + 4], [p.cx, ty], [q.cx, ty], [q.cx, y2]], { hl: false });

  s.comment("Footnotes");
  const fy = r2.bottom + 30;
  s.text(20, fy, "a request that fails verification closes as fraudulent, reported and counted", "sl");
  s.text(20, fy + 16, "review can object, narrow or reject; a preservation discloses nothing until valid process follows", "sl");
  s.height = Math.ceil(fy + 34);
  return s.toString();
}
