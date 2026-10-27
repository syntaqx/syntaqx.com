// A split payment schedule as a standard flowchart: trips close to
// departure are charged in full; further out, a reservation deposit at
// booking and the balance charged before departure, with the failed balance
// charge as a dashed path to cancellation under the policy. Embedded in
// content/books/user-generated-platforms/pricing-and-fees.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-ps", width: W });

  // One row for the schedule, one below for the exits; equal gaps.
  const dw = 150, dh = 64, bw = 180, ew = 116, h = 30;
  const gap = (W - 40 - dw - 2 * bw - ew) / 3;
  const r1 = 40;

  s.comment("The schedule");
  const dep = s.node(20 + dw + gap, r1, bw, null, "deposit at booking", { sub: ["50% of the trip cost, plus", "all of the service fee,", "protection and taxes"] });
  const cy = dep.cy;
  const decide = s.node(20, cy - dh / 2, dw, dh, "trip 30 days\nor less away?", { kind: "decision" });
  const balance = s.node(dep.x2 + gap, dep.y, bw, dep.h, "balance charged", { sub: ["the remaining 50%,", "30 days before departure,", "on the stored card"] });
  const paid = s.node(balance.x2 + gap, cy - h / 2, ew, h, "paid", { kind: "state", end: true, hl: true });

  s.comment("Exits below");
  const r2 = Math.max(dep.y2, decide.y2) + 56;
  const full = s.node(20, r2, dw, h, "charged in full", { kind: "state", end: true });
  const retry = s.node(balance.x, r2, bw, h, "retries, notice");
  const cancel = s.node(paid.x, r2, ew, h, "cancelled", { kind: "state", end: true, fill: 1 });

  s.comment("Connectors");
  s.connect(decide, dep, { label: "no", side: "above" });
  s.connect(decide, full, { from: "b", to: "t", label: "yes", side: "right" });
  s.connect(dep, balance, { hl: true });
  s.connect(balance, paid, { hl: true });
  s.connect(balance, retry, { from: "b", to: "t", alt: true, label: "charge fails", side: "right" });
  s.connect(retry, cancel, { alt: true });
  s.note(cancel, "after a deadline,\nunder the policy", { anchor: "right" });

  s.comment("Legend");
  const lg = s.legend(20, r2 + h + 50, [
    { kind: "hl", label: "a split payment" },
    { kind: "alt", label: "the balance fails" },
    { kind: "end", label: "outcome" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
