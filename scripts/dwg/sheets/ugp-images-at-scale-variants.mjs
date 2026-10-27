// The hybrid variant policy: eager sizes made at upload before the asset
// goes ready, and everything else made on first request through a size
// allowlist, then written back so the second request is a read (the
// accented path). Embedded in
// content/books/user-generated-platforms/images-at-scale.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, titleW = 124;
  const s = sheet({ prefix: "ugp-imv", width: W });
  const w = 112, h = 36, cols = 4;

  s.comment("Lanes");
  const [E, L] = s.lanes({ x: 20, y: 20, w: W - 40, titleW, lanes: [
    { label: "eager", sub: "at upload, before\nthe asset is ready", h: 92 },
    { label: "lazy, kept", sub: "on first request,\nthen stored", h: 168 },
  ] });
  const gap = (W - 20 - E.x0 - cols * w) / (cols - 1);
  const X = (i) => E.x0 + i * (w + gap);

  s.comment("Eager: the sizes every new post needs");
  const ey = E.y0 + 22;
  const original = s.node(X(0), ey, w, h + 10, "original", { kind: "store" });
  const eager = s.node(X(1), ey, w, h + 10, "eager sizes", { sub: ["thumbnail,", "feed widths"] });
  const ready = s.node(X(2), ey, w, h + 10, "ready", { kind: "state", code: true, end: true });
  s.connect(original, eager);
  s.connect(eager, ready);

  s.comment("Lazy: everything else, through the allowlist");
  const ly = L.y0 + 22, ly2 = ly + 84;
  const request = s.node(X(0), ly, w, h, "request", { kind: "actor", sub: "size, format" });
  const snap = s.node(X(1), ly, w, h, "snap width", { sub: "to the allowlist" });
  const stored = s.node(X(2), ly - 6, w, h + 12, "stored?", { kind: "decision" });
  const serve = s.node(X(3), ly, w, h, "serve", { sub: "a read" });
  const refuse = s.node(X(1), ly2, w, h, "refuse", { end: true, fill: 1 });
  const encode = s.node(X(2), ly2, w, h, "encode once", { hl: true });
  const write = s.node(X(3), ly2, w, h, "write variant", { kind: "store", hl: true, sub: "row and storage" });
  s.connect(request, snap);
  s.connect(snap, stored);
  s.connect(stored, serve, { label: "yes", side: "above" });
  s.connect(snap, refuse, { from: "b", to: "t", alt: true, label: "not on the list", side: "right" });
  s.connect(stored, encode, { from: "b", to: "t", hl: true, label: "no", side: "right" });
  s.connect(encode, write, { hl: true });
  s.connect(write, serve, { from: "t", to: "b", hl: true });

  const lg = s.legend(20, L.y + L.h + 24, [
    { kind: "hl", label: "first request: encode, then keep" },
    { kind: "alt", label: "refused" },
    { kind: "store", label: "stored" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
