// The control path, request path and data path of an ad platform as three
// lanes: snapshots flow down into the request path, every request-path
// record is emitted to the stream, and the budget controller feeds
// allocations back up. Embedded in
// content/books/advertising/ad-platform-architecture.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760,
    x = 20,
    titleW = 130,
    bw = 100,
    bh = 40;
  const s = sheet({ prefix: "advrp", width: W });
  const cw = (W - 2 * x - titleW) / 5;
  const X = (i) => x + titleW + i * cw + (cw - bw) / 2;

  const [C, R, D] = s.lanes({
    x,
    y: 20,
    w: W - 2 * x,
    titleW,
    lanes: [
      { label: "Control path", sub: "UI and API,\ntransactional", h: 84 },
      { label: "Request path", sub: "under the bid deadline:\nsnapshots and KV only", h: 86 },
      { label: "Data path", sub: "event time; late\ndata restates", h: 86 },
    ],
  });

  s.comment("Control path");
  const ctl = ["campaign\nmanagement", "review and\npolicy", "snapshot\nbuilder"].map((l, i) =>
    s.node(X(i), C.y + 14, bw, bh, l),
  );
  s.connect(ctl[0], ctl[1]);
  s.connect(ctl[1], ctl[2]);

  s.comment("Request path");
  const req = ["ingress", "consent\nparser", "decision", "auction", "bidder"].map((l, i) =>
    s.node(X(i), R.y + 30, bw, bh, l),
  );
  for (let i = 0; i < 4; i++) s.connect(req[i], req[i + 1]);
  s.fanOut(ctl[2], req, {
    from: "b",
    to: "t",
    via: R.y + 14,
  });
  // Labeled in the control lane, clear of the lane rule the stub crosses.
  s.text(ctl[2].cx + 8, ctl[2].y2 + 17, "versioned snapshots", "sl");

  s.comment("Data path");
  const stream = s.node(X(0), D.y + 30, bw, bh, "event stream", { kind: "store" });
  const ivt = s.node(X(1), D.y + 30, bw, bh, "IVT and\nattribution");
  const agg = s.node(X(2), D.y + 30, bw, bh, "aggregation\nand billing", { kind: "store" });
  const pacing = s.node(X(4), D.y + 30, bw, bh, "pacing and\nbudget");
  s.connect(stream, ivt);
  s.connect(ivt, agg);
  s.connect(agg, pacing, { label: "provisional\ndelivery" });

  s.fanIn(req, stream, { from: "b", to: "t", via: D.y + 14, hl: true });
  s.connect(pacing, req[4], { from: "t", to: "b", at: [0.8, 0.8] });

  const ly = D.y + D.h + 22;
  s.legend(x, ly, [
    { kind: "hl", label: "every record emitted async, never a synchronous write" },
    { kind: "store", label: "log or ledger" },
  ]);
  s.height = ly + 20;
  return s.toString();
}
