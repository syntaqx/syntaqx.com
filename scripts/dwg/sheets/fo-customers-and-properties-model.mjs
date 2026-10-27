// The customer model: who pays, where the work is, what is serviced. A
// person holds roles on an account and a property; the property (the key
// record, accented) is billed to one account at a time and holds assets.
// A standard diagram. Embedded in
// content/books/field-operations/customers-and-properties.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, x = 20, w = 170, h = 28;
  const s = sheet({ prefix: "fo-cpm", width: W });
  const col = (W - 2 * x - 3 * w) / 2;
  const X = (i) => x + i * (w + col);
  const r0 = 48, r1 = 132, r2 = 216;

  s.comment("Column heads");
  ["who pays", "where the work is", "what is serviced"].forEach((t, i) => s.text(X(i), 24, t, "th"));
  s.line(x, 32, W - x, 32, "tbl");

  s.comment("Records");
  const person = s.node(X(1), r0, w, h, "person", { sub: "contact" });
  const account = s.node(X(0), r1, w, h, "account", { kind: "store", sub: "bill-to" });
  const property = s.node(X(1), r1, w, h, "property", { kind: "store", hl: true, sub: "service site" });
  const asset = s.node(X(2), r1, w, h, "asset", { sub: "equipment" });
  const parent = s.node(X(0), r2, w, h, "parent account", { kind: "ghost" });
  const key = s.node(X(1), r2, w, h, "property key", { sub: "parcel" });
  const comp = s.node(X(2), r2, w, h, "component");

  s.comment("Roles");
  s.wire([person.port("l"), [account.cx, person.cy], account.port("t")], { label: "billing role", seg: 0, side: "above" });
  s.connect(person, property, { from: "b", to: "t", label: "site role", side: "right" });

  s.comment("Billing, matching, equipment");
  s.connect(property, account, { from: "l", to: "r", hl: true, label: "one payer\nat a time", side: "below" });
  s.connect(account, parent, { from: "b", to: "t", alt: true, label: "rolls up, optional", side: "right" });
  s.connect(property, key, { from: "b", to: "t", alt: true, label: "matched to", side: "right" });
  s.connect(property, asset, { label: "installed at" });
  s.connect(asset, comp, { from: "b", to: "t", label: "contains", side: "right" });

  const fy = r2 + h + 30;
  s.text(W - x, fy, "the property carries the geocode, time zone, access notes and alerts", "sl hl", "end");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
