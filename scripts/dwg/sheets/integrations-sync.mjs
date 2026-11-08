// Three ways changes arrive from a third-party API (their webhook, a cursor
// poll, a full resync) joining one queue and one idempotent apply step.
// Embedded in content/docs/building-blocks/integrations.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "int-sync", width: W });

  const srcX = 20,
    srcW = 140,
    h = 40,
    rowGap = 22;
  const Y = (i) => 40 + i * (h + rowGap);

  s.comment("Sources");
  const hook = s.node(srcX, Y(0), srcW, h, "their webhook", {
    kind: "actor",
    sub: "a hint, not the truth",
  });
  const poll = s.node(srcX, Y(1), srcW, h, "cursor poll", { sub: "since the saved cursor" });
  const full = s.node(srcX, Y(2), srcW, h, "full resync", { sub: "on 410, nightly check" });

  s.comment("Receiver");
  const inbox = s.node(182, Y(0), 136, h, "inbox", { kind: "store", sub: "verify, dedupe, ack" });
  s.connect(hook, inbox);

  s.comment("Shared path");
  const qX = 356,
    qW = 112,
    gap = 24;
  const queue = s.node(qX, Y(1), qW, h, "change queue", { kind: "store", sub: "per connection" });
  const fetch = s.node(qX + qW + gap, Y(1), 120, h, "fetch + map", { sub: "current object" });
  const apply = s.node(fetch.x2 + gap, Y(1), W - 20 - (fetch.x2 + gap), h, "upsert", {
    hl: true,
    sub: "by external id",
  });
  s.fanIn([inbox, poll, full], queue, { via: 336 });
  s.connect(queue, fetch);
  s.connect(fetch, apply, { hl: true });

  s.height = Math.ceil(full.y2 + 20);
  return s.toString();
}
