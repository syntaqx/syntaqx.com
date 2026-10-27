// The AT Protocol's separately operated services as a map: personal data
// servers feed a relay's firehose, an AppView indexes it and serves apps,
// feed generators hand it ranked post identifiers to hydrate, and labelers
// attach signed labels the app applies by the user's choice. Embedded in
// content/books/user-generated-platforms/federation.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-fat", width: W });
  const w = 140, cols = 4;
  const gap = (W - 43 - cols * w) / (cols - 1);
  const X = (i) => 20 + i * (w + gap);
  const r0 = 24, r1 = 120, r2 = 216, h = 44;

  s.comment("Personal data servers");
  const ph = 36, pg = 12;
  const pcy = r1 + h / 2;
  const pds = [-1, 0, 1].map((k) => s.node(X(0), pcy - ph / 2 + k * (ph + pg), w, ph, "PDS", { kind: "store", sub: "signed repository" }));
  s.text(X(0), pds[0].y - 10, "an account's DID names its PDS", "sl");

  s.comment("Relay, AppView, app");
  const relay = s.node(X(1), r1, w, h, "relay", { sub: "the firehose" });
  const appview = s.node(X(2), r1, w, h, "app view", { sub: ["threads, counts,", "search"] });
  const app = s.node(X(3), r1, w, h, "app", { kind: "actor", sub: "the user's choices" });
  s.fanIn(pds, relay, { via: X(0) + w + gap / 2 });
  s.connect(relay, appview, { label: "index", side: "above" });
  s.connect(appview, app, { label: "views", side: "above" });

  s.comment("Feed generators and labelers");
  const feed = s.node(X(2), r0, w, h, "feed generator", { sub: "anyone can run one" });
  const labeler = s.node(X(2), r2, w, h, "labeler", { hl: true, sub: "signed labels" });
  s.connect(feed, appview, { from: "b", to: "t", label: "ranked post\nidentifiers", side: "right" });
  s.connect(labeler, appview, { from: "t", to: "b", hl: true, label: "labels", side: "right" });
  s.wire([labeler.port("r"), [app.cx, labeler.cy], [app.cx, app.y2]], { hl: true, label: "hide, blur, warn", side: "below", seg: 0 });

  const fy = labeler.y2 + 34;
  s.text(20, fy, "the app's own moderation service is always subscribed; others are added like accounts", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
