// The regulated application record as a standard diagram: four inputs feed
// four checks at entry; passing checks (accented) save the record with its
// snapshot, which feeds the slip, the state report, inventory and the audit
// trail; a failed check blocks or takes an override with a reason. Embedded
// in content/books/field-operations/regulated-materials.md.
import { sheet } from "../kit.mjs";

const INPUTS = ["product, label version", "applicator licenses", "jurisdiction rules", "weather, GPS, time"];
const CHECKS = ["allowed in jurisdiction", "certified or supervised", "rate within label", "required fields present"];
const OUTPUTS = ["customer service slip", "state report", "truck inventory", "audit trail"];

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "fo-rmr", width: W });

  const h = 26, rowH = 34, y0 = 48;
  const inX = 20, inW = 170;
  const ckX = 240, ckW = 190;
  const busIn = (inX + inW + ckX) / 2;
  const busOut = ckX + ckW + 18;
  const recX = 500, recW = W - 20 - recX;
  const Y = (i) => y0 + i * rowH;

  s.comment("Column heads");
  s.text(inX + inW / 2, y0 - 14, "inputs", "sl", "middle");
  s.text(ckX + ckW / 2, y0 - 14, "checks at entry", "sl", "middle");
  s.text(recX + recW / 2, y0 - 14, "saved", "sl", "middle");

  s.comment("Inputs, into a bus, out to every check");
  const ins = INPUTS.map((t, i) => s.node(inX, Y(i), inW, h, t));
  const cks = CHECKS.map((t, i) => s.node(ckX, Y(i), ckW, h, t, { fill: 1 }));
  ins.forEach((n) => s.wire([n.port("r"), [busIn, n.cy]], { arrow: "none" }));
  s.wire([[busIn, ins[0].cy], [busIn, ins.at(-1).cy]], { arrow: "none" });
  cks.forEach((n) => s.wire([[busIn, n.cy], n.port("l")]));

  s.comment("Checks pass: the record");
  const rec = s.node(recX, (cks[1].cy + cks[2].cy) / 2 - 19, recW, 38, "application record", { hl: true, sub: "product and license snapshot" });
  cks.forEach((n) => s.wire([n.port("r"), [busOut, n.cy]], { arrow: "none", hl: true }));
  s.wire([[busOut, cks[0].cy], [busOut, cks.at(-1).cy]], { arrow: "none", hl: true });
  s.wire([[busOut, rec.cy], rec.port("l")], { hl: true, label: "pass", side: "above" });

  s.comment("What the record feeds");
  const trunk = rec.x + 24;
  const oy = rec.y + rec.h + 18;
  const outs = OUTPUTS.map((t, i) => s.node(rec.x + 48, oy + i * 32, recW - 48, 24, t));
  s.wire([[trunk, rec.y + rec.h], [trunk, outs.at(-1).cy]], { arrow: "none" });
  outs.forEach((n) => s.wire([[trunk, n.cy], n.port("l")]));

  s.comment("A failed check");
  const last = cks.at(-1);
  const fail = s.node(ckX, last.y + h + 38, ckW, h, "block, or override + reason", { kind: "ghost" });
  s.wire([last.port("b"), fail.port("t")], { alt: true, label: "fails", side: "right" });

  s.comment("Footer");
  const fy = Math.max(fail.y + fail.h, outs.at(-1).y + 24) + 28;
  s.text(inX, fy, "overrides are saved on the record; corrections append an amendment, never an edit", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
