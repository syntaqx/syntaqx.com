// A payment provider's services: the synchronous authorization path across
// the top in the accent (checkout to processor, inside the networks'
// timeouts), and everything else fed asynchronously from the event log the
// authorization commits to. Embedded in
// content/books/payments/architecture-at-scale.md.
import { sheet } from "../kit.mjs";

const SYNC = [
  ["checkout", { kind: "actor" }, ["the merchant's", "customer"]],
  ["API edge", {}, ["keys, limits,", "idempotency"]],
  ["risk", {}, ["score, rules"]],
  ["authorize", {}, ["route, write state", "and event"]],
  ["vault", {}, ["detokenize,", "forward"]],
  ["processor", { kind: "actor" }, ["to the", "networks"]],
];

const ASYNC = [
  ["ledger", ["append-only", "entries"]],
  ["settlement", ["clearing files,", "batches"]],
  ["payouts", ["bank files,", "cutoffs"]],
  ["webhooks", ["at least once,", "retried"]],
  ["reporting", ["CDC to", "analytics"]],
];

export default function draw() {
  const W = 760, x = 20, h = 30, gap = 18, y = 50;
  const s = sheet({ prefix: "pmas", width: W });
  const n = SYNC.length;
  const w = Math.floor((W - 2 * x - 3 - (n - 1) * gap) / n); // 3 of slack for the actor's shadow

  s.comment("Synchronous path");
  s.text(x, 26, "synchronous: answered inside the network's timeout", "lt hl");
  const top = SYNC.map(([label, o], i) => s.node(x + i * (w + gap), y, w, h, label, o));
  top.slice(1).forEach((b, i) => s.connect(top[i], b, { hl: true }));
  let subBottom = y + h;
  SYNC.forEach(([, , sub], i) =>
    sub.forEach((l, j) => {
      const ty = y + h + 16 + j * 11.5;
      s.text(top[i].x + w / 2, ty, l, "sl", "middle");
      subBottom = Math.max(subBottom, ty + 4);
    }),
  );

  s.comment("Event log, written in the same commit as the state");
  const auth = top[3];
  const logW = 240, logY = subBottom + 40;
  const log = s.node(auth.cx - logW / 2, logY, logW, 40, "outbox to event log", { kind: "store", sub: "relayed at least once" });
  s.wire([[auth.cx, subBottom + 6], [auth.cx, log.y]], { label: "same commit", side: "right" });

  s.comment("Asynchronous consumers");
  s.text(x, log.y + 14, "asynchronous: queued, retried,", "lt");
  s.text(x, log.y + 30, "idempotent at every hop", "lt");
  const m = ASYNC.length, ag = 20, aw = (W - 2 * x - (m - 1) * ag) / m, ah = 52, ay = log.y + log.h + 52;
  const low = ASYNC.map(([label, sub], i) => s.node(x + i * (aw + ag), ay, aw, ah, label, { sub }));
  s.fanOut(log, low, { from: "b", to: "t", via: log.y + log.h + 26 });

  s.comment("Legend");
  const lg = s.legend(x, ay + ah + 34, [
    { kind: "hl", label: "a live answer or a clean failure" },
    { kind: "flow", label: "queued and replayable" },
    { kind: "actor", label: "outside the provider" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
