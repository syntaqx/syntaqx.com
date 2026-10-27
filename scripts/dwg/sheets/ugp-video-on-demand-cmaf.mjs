// Packaging for two adaptive formats, before and with CMAF: two segment
// sets (transport streams for HLS, fragmented MP4 for DASH) against one
// set of fragmented MP4 segments (the accent) that both an HLS playlist
// and a DASH manifest reference. Embedded in
// content/books/user-generated-platforms/video-on-demand.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, titleW = 112;
  const s = sheet({ prefix: "ugp-vcm", width: W });
  const w = 132, h = 34, rg = 14, laneH = 2 * h + rg + 32;

  const [A, B] = s.lanes({ x: 20, y: 20, w: W - 40, titleW, lanes: [
    { label: "two formats", sub: "a set of\nsegments each", h: laneH },
    { label: "CMAF", sub: "one set, two\nmanifests", h: laneH },
  ] });
  const gap = 28;
  const X = (i) => A.x0 + i * (w + gap);
  const noteX = X(3);

  const lane = (L, middle) => {
    const t = L.y0 + 16, b = t + h + rg, c = t + h + rg / 2;
    const r = s.node(X(0), c - h / 2, w, h, "renditions", { sub: "aligned keyframes" });
    const hls = s.node(X(2), t, w, h, "HLS playlists", { sub: "multivariant, media" });
    const dash = s.node(X(2), b, w, h, "DASH manifest", { sub: "the MPD" });
    return { r, hls, dash, t, b, c, m: middle(r, t, b, c, hls, dash) };
  };

  s.comment("Before: one segment set per format");
  const a = lane(A, (r, t, b, c, hls, dash) => {
    const ts = s.node(X(1), t, w, h, "TS segments", { kind: "store", sub: "transport stream" });
    const mp4 = s.node(X(1), b, w, h, "MP4 segments", { kind: "store", sub: "fragmented" });
    s.fanOut(r, [ts, mp4], {});
    s.connect(ts, hls);
    s.connect(mp4, dash);
  });
  s.text(noteX, a.c - 2, "storage doubled,", "sl");
  s.text(noteX, a.c + 11, "cache hits halved", "sl");

  s.comment("CMAF: one segment set, both manifests");
  const b = lane(B, (r, t, bb, c, hls, dash) => {
    const one = s.node(X(1), c - h / 2, w, h, "one segment set", { kind: "store", hl: true, sub: "fragmented MP4" });
    s.connect(r, one);
    s.fanOut(one, [hls, dash], { hl: true });
  });
  s.text(noteX, b.c - 2, "one object and", "sl");
  s.text(noteX, b.c + 11, "one cache key", "sl");

  s.height = Math.ceil(B.y + B.h + 20);
  return s.toString();
}
