// The chain of conditions between a balance and a payout as a standard
// pipeline: admitted, payee known, tax profile, trigger event, holds clear,
// minimum met, then the payout in the accent. Embedded in
// content/books/user-generated-platforms/paying-creators-and-sellers.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { label: "admitted", sub: ["enrollment", "decided and", "appealable"] },
  { label: "payee known", sub: ["identity and", "bank account,", "not the profile"] },
  { label: "tax profile", sub: ["W-9 or W-8;", "else a default", "withholding rate"] },
  { label: "trigger event", sub: ["month close,", "check-in, trip", "start, delivery"] },
  { label: "holds clear", sub: ["review, account,", "fraud, claim,", "new payee"] },
  { label: "minimum met", sub: ["below it, the", "balance rolls", "over"] },
  { label: "payout", hl: true, sub: ["on schedule,", "or instant", "for a fee"] },
];

export default function draw() {
  const W = 760, gap = 16;
  const w = (W - 40 - (STAGES.length - 1) * gap) / STAGES.length;
  const s = sheet({ prefix: "ugp-pc", width: W });

  s.comment("Pipeline");
  const { bottom } = s.pipeline(20, 24, STAGES, { w, h: 30, gap });

  s.comment("Footer");
  const fy = bottom + 30;
  s.text(20, fy, "exposure outlives the payout: a later refund, chargeback or claim is recovered from the next earnings first", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
