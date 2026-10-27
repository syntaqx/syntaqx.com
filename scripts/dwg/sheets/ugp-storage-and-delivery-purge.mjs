// A takedown past the database: its scope under dedup (one asset, or every
// asset on a blob judged illegal in itself), a purge by tag of every URL,
// the verification the accent marks, and what the URL returns afterward.
// Embedded in content/books/user-generated-platforms/storage-and-delivery.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-sdp", width: W });
  const w0 = 96, w = 124, cols = 4;
  const gap = (W - 40 - w0 - cols * w) / cols;
  const X = (i) => (i === 0 ? 20 : 20 + w0 + gap + (i - 1) * (w + gap));
  const top = 24, h = 52, rowGap = 24;
  const cy = top + h + rowGap / 2;
  const mid = (hh) => cy - hh / 2;

  s.comment("Scope");
  const takedown = s.node(X(0), mid(44), w0, 44, "takedown\ndecision");
  const one = s.node(X(1), top, w, h, "this asset", { sub: ["the shared blob", "stays"] });
  const all = s.node(X(1), top + h + rowGap, w, h, "every asset\non the blob", { sub: ["hash-list match:", "blob held"] });
  s.fanOut(takedown, [one, all], {});

  s.comment("Purge and verify");
  const purge = s.node(X(2), mid(72), w, 72, "purge by tag", { sub: ["every URL: original,", "variants, formats,", "segments, playlists"] });
  s.fanIn([one, all], purge, {});
  const verify = s.node(X(3), mid(52), w, 52, "verify", { hl: true, sub: ["re-request: no", "longer a hit"] });
  s.connect(purge, verify, { hl: true });

  s.comment("What the URL returns");
  const gone = s.node(X(4), top, w, h, "410 tombstone", { sub: ["removed, or a", "placeholder image"] });
  const legal = s.node(X(4), top + h + rowGap, w, h, "451 blocked", { sub: ["for a legal", "demand"] });
  s.fanOut(verify, [gone, legal], {});

  const fy = top + 2 * h + rowGap + 30;
  s.text(20, fy, "a 200 to the purge request means received, not removed; the purge row keeps requested and confirmed times", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
