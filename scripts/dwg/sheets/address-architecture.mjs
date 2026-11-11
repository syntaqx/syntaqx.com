// Address architecture: vendors at the edges. Autocomplete runs from the
// client; saving upserts one row per place and enqueues a geocode job in the
// same transaction; a worker geocodes with a storage-licensed source and
// writes the point back (accented); readers only read the database.
// Embedded in content/docs/fundamentals/addresses.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "aar", width: W });

  // Four columns, two rows.
  const w = 128,
    h = 40,
    gap = (W - 40 - 3 - 4 * w) / 3; // 3 of slack for the actors' shadows
  const X = (i) => 20 + i * (w + gap);
  const r0 = 30,
    r1 = 170;

  s.comment("Request path");
  const app = s.node(X(0), r0, w, h, "app", { kind: "actor", sub: "address book, pin" });
  const api = s.node(X(1), r0, w, h, "address API");
  const db = s.node(X(2), r0, w, h, "addresses", { kind: "store", sub: "one row per place" });
  const readers = s.node(X(3), r0, w, h, "readers", { sub: "routing, tax" });

  s.comment("Edges and the background path");
  const auto = s.node(X(0), r1, w, h, "autocomplete", {
    kind: "ghost",
    sub: "vendor, from client",
  });
  const queue = s.node(X(1), r1, w, h, "job queue", { kind: "store" });
  const worker = s.node(X(2), r1, w, h, "geocode worker", { hl: true });
  const geo = s.node(X(3), r1, w, h, "geocoder", { kind: "actor", sub: "licensed to store" });

  s.connect(app, api, { label: "save" });
  s.connect(api, db, { label: "upsert" });
  s.connect(db, readers, { label: "read" });
  s.connect(app, auto, { from: "b", to: "t", label: "as you type", side: "right" });
  s.connect(api, queue, {
    from: "b",
    to: "t",
    hl: true,
    label: "same\ntransaction",
    side: "right",
  });
  s.connect(queue, worker, { hl: true });
  s.connect(worker, geo, { hl: true, label: "batch" });
  s.connect(worker, db, {
    from: "t",
    to: "b",
    hl: true,
    label: "point, precision,\nsource",
    side: "right",
  });

  s.height = r1 + h + 30;
  return s.toString();
}
