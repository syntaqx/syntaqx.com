// One approved payable fans out to its payment methods, each with when it
// arrives, when it is final and how it fails. ACH credit, the default, is
// the accented branch. Neutral rail names; the alt text names the instant
// rails. Embedded in content/books/payments/vendor-payouts.md.
import { sheet } from "../kit.mjs";

const METHODS = [
  ["ACH credit", "next or same day", "at settlement", "returns, undeliverable"],
  ["virtual card", "when charged", "card settles", "expires unused"],
  ["check", "days, by mail", "when cleared", "void before reissue"],
  ["wire", "same day", "immediately", "no return path"],
  ["instant payment", "seconds", "immediately", "no return path"],
];

export default function draw() {
  const W = 760, x = 20, rowH = 30, nh = 22, top = 24;
  const s = sheet({ prefix: "vp", width: W });
  const widths = [118, 112, 150];
  const gx = W - x - widths.reduce((a, b) => a + b, 0);
  const mw = 130, mx = gx - 16 - mw, bus = mx - 22;

  s.comment("Rails");
  const g = s.grid(gx, top, null, ["arrives", "final", "how it fails"], METHODS.map((m) => m.slice(1)), { widths, rowH, align: ["start", "start", "start"] });
  s.text(mx, top + rowH / 2 + 2.7, "method", "th");
  // Each method sits level with its row of the table.
  const methods = METHODS.map(([label], i) => s.node(mx, g.rows[i].cy - nh / 2, mw, nh, label, { hl: i === 0 }));

  s.comment("One payable");
  const payable = s.node(x, g.rows[2].cy - 15, 110, 30, "payable");
  s.note(payable, "approved, funded", { dy: 16 });
  s.text(x, payable.y - 12, "one payable", "lt");

  s.comment("Fan out; the trunk stays ink, the default's branch takes the accent");
  s.fanOut(payable, methods, { via: bus, hl: 0 });

  const fy = top + rowH * 6 + 22;
  s.text(W - x, fy, "ACH credit is the default: cheap, universal, carries remittance data", "sl hl", "end");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
