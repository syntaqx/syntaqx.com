// The matching path: gateways, the sequencer and its replicated input log,
// the single-threaded core in the accent, and the outputs it fans out to;
// snapshots and replay below, dashed, rebuild the core.
// Embedded in content/books/investing-and-digital-assets/order-books-and-matching.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "imp", width: W });

  const w = 140,
    h = 30,
    gap = 30,
    y0 = 64;
  const outW = 180,
    outH = 30,
    outGap = 16;
  const bus = 26; // trunk offset right of the core
  const x0 = 20;

  s.comment("Pipeline");
  const { nodes, bottom } = s.pipeline(
    x0,
    y0,
    [
      {
        head: "order entry",
        label: "gateways",
        sub: ["FIX, REST, WebSocket", "sessions, risk checks"],
      },
      { head: "order", label: "sequencer", sub: ["one order for all inputs,", "log to a quorum"] },
      {
        head: "state",
        label: "matching core",
        sub: ["one thread per book,", "in memory"],
        hl: true,
        headHl: true,
      },
    ],
    { w, h, gap, hlArrows: [1] },
  );
  const [, seq, core] = nodes;

  s.comment("Outputs");
  const ox = W - 20 - outW;
  const oy = core.cy - outH / 2 - (outH + outGap);
  const outs = ["execution reports", "market data", "ledger postings"].map((label, i) =>
    s.node(ox, oy + i * (outH + outGap), outW, outH, label),
  );
  s.fanOut(core, outs, { from: "r", to: "l", via: core.x2 + bus });

  s.comment("Recovery, dashed");
  const ry = bottom + 40;
  const snap = s.node(seq.x, ry, w, h, "snapshots", { kind: "store", sub: "taken on a follower" });
  const replay = s.node(core.x, ry, w, h, "replay", { sub: "inputs after it" });
  s.wire([[seq.cx, bottom + 6], snap.port("t")], { alt: true, label: "input log", side: "left" });
  s.connect(snap, replay, { alt: true });
  s.wire([replay.port("t"), [core.cx, bottom + 6]], {
    alt: true,
    label: "rebuilds",
    side: "right",
  });

  s.comment("Legend");
  const lg = s.legend(x0, Math.max(replay.y2, snap.y2) + 40, [
    { kind: "hl", label: "the live path" },
    { kind: "alt", label: "recovery" },
    { kind: "store", label: "durable store" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
