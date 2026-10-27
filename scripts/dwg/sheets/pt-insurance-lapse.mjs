// Renters insurance compliance per lease as a standard diagram: covered,
// a carrier notice moves the policy to pending cancellation, a lapse
// starts a cure period, then landlord-placed coverage or a violation
// notice; new approved proof returns the lease to covered. Embedded in
// content/books/property-tech/insurance-deposits-and-guarantees.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pt-il", width: W });

  const w = 150, h = 44, gap = (W - 40 - 4 * w) / 3;
  const X = (i) => 20 + i * (w + gap);
  const yIn = 24, yS = yIn + 40 + 40;

  s.comment("Input that starts the slide");
  const notice = s.node(X(1), yIn, w, 40, "carrier notice", { kind: "actor", sub: "cancellation, nonrenewal" });

  s.comment("States");
  const st = (i, y, label, o = {}) => s.node(X(i), y, w, h, label, { kind: "state", ...o });
  const covered = st(0, yS, "covered", { sub: "program policy or\napproved proof", hl: true });
  const pending = st(1, yS, "pending\ncancellation", {});
  const lapsed = st(2, yS, "lapsed", { sub: "a cure period runs" });
  const og = 16;
  const placed = st(3, yS - h / 2 - og / 2, "landlord-placed", { sub: "with its charge", end: true });
  const violation = st(3, yS + h / 2 + og / 2, "violation notice", { end: true, fill: 1 });
  s.connect(notice, pending, { from: "b", to: "t" });
  s.connect(covered, pending, { alt: true });
  s.connect(pending, lapsed, { alt: true });
  s.fanOut(lapsed, [placed, violation], { alt: true });

  s.comment("Back to covered");
  const ch = lapsed.y2 + 28;
  s.wire([[lapsed.cx, lapsed.y2], [lapsed.cx, ch], [covered.cx, ch], covered.port("b")], { hl: true, seg: 1, label: "new proof approved", side: "below" });

  s.comment("Legend");
  const lg = s.legend(20, Math.max(ch + 30, violation.y2) + 24, [
    { kind: "hl", label: "back to compliance" },
    { kind: "alt", label: "toward a gap" },
    { kind: "end", label: "lease and jurisdiction decide which" },
  ]);
  s.text(20, lg.y + 14, "compliance is computed daily per lease; move-out ends the requirement and any charge", "sl");
  s.height = Math.ceil(lg.y + 30);
  return s.toString();
}
