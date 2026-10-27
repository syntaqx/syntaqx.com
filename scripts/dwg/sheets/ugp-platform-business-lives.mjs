// The three lives the volume follows (a post, a live stream, a booking) as
// three pipelines in lanes, one stage per step of the chapter's walkthrough
// and a gray line of what happens there. Stages share one column grid so the
// lanes read against each other. Embedded in
// content/books/user-generated-platforms/platform-business.md.
import { sheet } from "../kit.mjs";

const POST = [
  { label: "upload", sub: ["signed URL,", "bytes straight", "to storage"] },
  { label: "scan", sub: ["hash, match", "known lists,", "classify"] },
  { label: "process", sub: ["variants,", "strip GPS,", "GIF to video"] },
  { label: "publish", sub: ["a ranking", "candidate"] },
  { label: "vote,\nspread", sub: ["comments,", "embeds cost", "egress"] },
  { label: "report,\ndecide", sub: ["case, notice,", "appeal"] },
  { label: "age out\nor purge", sub: ["the case", "outlives it"] },
];

const STREAM = [
  { label: "go live", sub: ["stream key,", "ingest edge"] },
  { label: "transcode,\ndeliver", sub: ["ladder, CDN,", "latency tier"] },
  { label: "interact", sub: ["chat fanout,", "payments"] },
  { label: "moderate\nlive", sub: ["sampled frames", "and audio"] },
  { label: "end\nand keep", sub: ["VOD, clips,", "music muted"] },
];

const BOOKING = [
  { label: "supply", sub: ["identity, bank,", "tax, eligible", "vehicle"] },
  { label: "search\nand book", sub: ["free dates,", "risk score,", "all-in price"] },
  { label: "hold\nthe money", sub: ["until check-in,", "deposit hold"] },
  { label: "hand off", sub: ["photos, signed", "agreement,", "payout trigger"] },
  { label: "return\nand claim", sub: ["photos again,", "claim in a", "short window"] },
  { label: "review", sub: ["hidden until", "both submit"] },
  { label: "cancel,\ndispute", sub: ["refund policy", "set at booking"] },
];

export default function draw() {
  const W = 760, x = 20, gap = 16, h = 36, cols = 7;
  const s = sheet({ prefix: "ugp-pbl", width: W });
  const w = (W - 40 - (cols - 1) * gap) / cols;
  const laneH = 136, top = 48; // box top inside a lane, under its title

  s.comment("Lanes, titles over the content");
  const [P, L, B] = s.lanes({ x, y: 20, w: W - 40, titleW: 0, lanes: [
    { label: "a post", sub: "a content item in a community", h: laneH },
    { label: "a live stream", sub: "an encoder to every viewer", h: laneH },
    { label: "a booking", sub: "two parties, money held between them", h: laneH },
  ] });

  s.comment("One pipeline per lane");
  s.pipeline(x, P.y0 + top, POST, { w, h, gap });
  s.pipeline(x, L.y0 + top, STREAM, { w, h, gap });
  s.pipeline(x, B.y0 + top, BOOKING, { w, h, gap });

  s.height = Math.ceil(B.y + B.h + 20);
  return s.toString();
}
