// The services of a trading platform: channels on top, the domain services
// in a row, every one of them writing through the posting service in the
// accent, and the consumers of its events below.
// Embedded in content/books/investing-and-digital-assets/trading-platform-architecture.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ips", width: W });

  const gx = 20,
    gw = W - 40,
    pad = 12,
    bandH = 30 + 2 * pad,
    bandGap = 56;
  const tops = [40, 40 + bandH + bandGap, 40 + 2 * (bandH + bandGap) + 30];

  s.comment("Channels");
  s.group(gx, tops[0], gw, bandH, "channels", { sub: "commands in" });
  const channels = s.row(
    gx + pad,
    tops[0] + pad,
    gw - 2 * pad,
    ["apps and web", "partner APIs", "FIX sessions", "support console"],
    { h: 30, gap: 16, kind: "actor" },
  );

  s.comment("Domain services");
  s.group(gx, tops[1], gw, bandH, "domain services", { sub: "each owns its tables" });
  const services = s.row(
    gx + pad,
    tops[1] + pad,
    gw - 2 * pad,
    ["accounts", "OMS and risk", "transfers", "chain watchers", "market data"],
    { h: 30, gap: 16 },
  );

  s.comment("Edge into the services");
  s.wire(
    [
      [W / 2, tops[0] + bandH],
      [W / 2, tops[1]],
    ],
    { label: "authenticated, keyed", side: "right" },
  );

  s.comment("Posting service");
  const pw = 260,
    py = tops[1] + bandH + 36;
  const post = s.node((W - pw) / 2, py, pw, 34, "posting service", {
    hl: true,
    sub: "one writer: entries, holds, outbox",
  });
  s.fanIn(services.slice(0, 4), post, { from: "b", to: "t", via: tops[1] + bandH + 16, hl: true });

  s.comment("Consumers");
  const cTop = post.y2 + 40;
  s.group(gx, cTop, gw, bandH, "consumers of events", { sub: "replay by sequence" });
  const consumers = s.row(
    gx + pad,
    cTop + pad,
    gw - 2 * pad,
    ["statements, tax", "reconciliation", "surveillance", "clearing", "metrics"],
    { h: 30, gap: 16, kind: "store" },
  );
  s.wire([post.port("b"), [post.cx, cTop]], { label: "events", side: "right" });

  s.comment("Legend");
  const lg = s.legend(gx, cTop + bandH + 36, [
    { kind: "hl", label: "every write to the ledger" },
    { kind: "actor", label: "outside caller" },
    { kind: "store", label: "consumer with its own store" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  void channels;
  void consumers;
  return s.toString();
}
