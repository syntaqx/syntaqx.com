// The field operations software landscape as a standard map in three bands:
// systems of record, specialists, and the ecosystem. Classes only, no vendor
// names (the caption carries the examples). Embedded in
// content/books/field-operations/software-landscape.md.
import { sheet } from "../kit.mjs";

const BANDS = [
  {
    label: "systems of record",
    sub: "own the customer, agreement, schedule and ledger",
    hl: true,
    nodes: ["SMB horizontal", "trade suites", "property care", "enterprise", "AI-native"],
  },
  {
    label: "specialists",
    sub: "one job done deeper",
    nodes: ["scheduling engines", "delivery dispatch", "D2D field sales", "AI front office"],
  },
  {
    label: "ecosystem",
    sub: "rails and data",
    kind: "ghost",
    nodes: ["payments", "financing", "SMS, voice", "telematics", "property data", "accounting"],
  },
];

export default function draw() {
  const W = 760, x = 20, w = W - 2 * x, pad = 12, nh = 28, bandH = nh + 2 * pad, between = 52;
  const s = sheet({ prefix: "fo-sl", width: W });

  const tops = BANDS.map((_, i) => 34 + i * (bandH + between));
  BANDS.forEach((b, i) => {
    s.comment(b.label);
    s.group(x, tops[i], w, bandH, b.label, { sub: b.sub, hl: b.hl });
    s.row(x + pad, tops[i] + pad, w - 2 * pad, b.nodes, { h: nh, kind: b.kind });
  });

  s.comment("Integration");
  const ax = W / 2;
  s.wire([[ax, tops[1]], [ax, tops[0] + bandH]], { label: "APIs, webhooks, marketplaces", side: "right" });
  s.wire([[ax, tops[2]], [ax, tops[1] + bandH]], { label: "embedded or connected", side: "right" });

  const fy = tops[2] + bandH + 24;
  s.text(W - x, fy, "the record of truth sits in the top band; everything else reads from or writes to it", "sl", "end");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
