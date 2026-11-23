// One SIVT finding and the adjustments it causes, hop by hop back up the
// chain that was paid for the impressions, with the worked example's
// amounts. Embedded in
// content/books/advertising/invalid-traffic-and-ad-fraud.md.
import { sheet } from "../kit.mjs";

const PARTIES = [
  ["advertiser", "credited on the April\ninvoice from the DSP"],
  ["DSP", "its $1,500 fee\nreversed with the media"],
  ["exchange", "its own $2,000 fee\nreversed in revenue"],
  ["seller", "deducted from March\nearnings, or clawed\nback from April's"],
];
const FWD = ["$11,500", "$10,000", "$8,000"];
const BACK = ["credit $11,500", "refund $10,000", "clawback $8,000"];

export default function draw() {
  const W = 760,
    x = 20,
    aw = 90,
    ah = 56,
    right = W - 20 - 3; // an actor's shadow sits 3 past its box
  const s = sheet({ prefix: "advivt", width: W });
  const gap = (right - x - PARTIES.length * aw) / (PARTIES.length - 1);
  const AX = (i) => x + i * (aw + gap);

  s.comment("The finding");
  const finding = s.node(W / 2 - 110, 20, 220, null, "SIVT finding", {
    sub: "400,000 impressions, March 1-20",
  });

  s.comment("The chain");
  const ay = finding.y2 + 52;
  const actors = PARTIES.map(([name], i) => s.node(AX(i), ay, aw, ah, name, { kind: "actor" }));
  s.fanOut(finding, actors, { from: "b", to: "t", via: finding.y2 + 24, alt: true });

  for (let i = 0; i < actors.length - 1; i++) {
    s.connect(actors[i], actors[i + 1], { at: [0.3, 0.3], label: FWD[i] });
    s.connect(actors[i + 1], actors[i], {
      from: "l",
      to: "r",
      at: [0.75, 0.75],
      hl: true,
      label: BACK[i],
      side: "below",
    });
  }

  s.comment("What each ledger records");
  let bottom = 0;
  PARTIES.forEach(([, note], i) => {
    const anchor = i === 0 ? "left" : i === PARTIES.length - 1 ? "right" : "center";
    bottom = Math.max(bottom, s.note(actors[i], note, { anchor, dy: 28 }));
  });

  const ly = bottom + 30;
  s.legend(x, ly, [
    { kind: "flow", label: "paid for the impressions" },
    { kind: "hl", label: "adjustment, each in its own ledger" },
    { kind: "alt", label: "the finding" },
  ]);
  s.height = ly + 20;
  return s.toString();
}
