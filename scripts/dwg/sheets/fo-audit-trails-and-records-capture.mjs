// Audit capture as a standard diagram: a write runs one transaction that
// holds the state change, the application's audit entry and the row-level
// capture; both entries land in the append-only store, which feeds the
// write-once archive and exports. Reads are logged into the same store.
// Embedded in content/books/field-operations/audit-trails-and-records.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, h = 26, gapY = 10, pad = 12;
  const s = sheet({ prefix: "fo-atc", width: W });

  // Columns: the command, the transaction, the store.
  const cmdX = 20, cmdW = 150;
  const gx = 210, gw = 230, gy = 40;
  const sx = 490, sw = W - 20 - sx;

  s.comment("One transaction");
  const rows = ["state change", "audit entry: who, why", "row capture, before/after"].map((t, i) =>
    s.node(gx + pad, gy + pad + i * (h + gapY), gw - 2 * pad, h, t),
  );
  const [, entry, capture] = rows;
  const gh = 2 * pad + 3 * h + 2 * gapY;
  s.group(gx, gy, gw, gh, "one transaction");

  s.comment("The write");
  s.text(cmdX, entry.y - 8, "a write", "lt");
  const cmd = s.node(cmdX, entry.y, cmdW, h, "command: who, why", { fill: 1 });
  s.wire([cmd.port("r"), [gx, cmd.cy]], { hl: true });

  s.comment("Into the audit store");
  const store = s.node(sx, entry.y - 13, sw, capture.y + h + 13 - (entry.y - 13), "append-only audit store", {
    kind: "store",
    hl: true,
    sub: "hash-chained per tenant, day",
  });
  s.wire([entry.port("r"), [sx, entry.cy]], { hl: true });
  s.wire([capture.port("r"), [sx, capture.cy]], { hl: true });

  s.comment("Archive and export");
  const aw = 170;
  const archive = s.node(store.cx - aw / 2, store.y + store.h + 40, aw, 36, "WORM archive", { fill: 1, code: false, sub: "retention by type, holds" });
  s.wire([[archive.cx, store.y + store.h], archive.port("t")]);
  const exp = s.node(archive.x, archive.y + archive.h + 30, aw, h, "export with hash manifest");
  s.connect(archive, exp, { from: "b", to: "t" });

  s.comment("Reads");
  const reads = s.node(cmdX, archive.y + 10, cmdW, h, "exports, views, logins");
  s.text(cmdX, reads.y - 8, "reads", "lt");
  const rx = store.x + 18; // clear of the archive under the store
  s.wire([reads.port("r"), [rx, reads.cy], [rx, store.y + store.h]], { seg: 0, side: "below", label: "access is logged into the same store" });

  s.height = Math.ceil(exp.y + exp.h + 22);
  return s.toString();
}
