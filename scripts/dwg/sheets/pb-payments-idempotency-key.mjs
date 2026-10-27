// One idempotency key from claim to prune: four lanes (client attempts, key
// state, side effect, response) on one not-to-scale timeline, and the
// attempt table. Embedded in content/docs/payments/idempotency.md.
import { sheet } from "../kit.mjs";

// Not to scale: positions are an ordinal timeline, fractions of the track.
// a1..a5 attempts, the commit that ends "in progress", the prune at R1.
const T = { a1: 0, a2: 0.12, commit: 0.24, a3: 0.36, a4: 0.58, prune: 0.86, a5: 0.93, end: 1 };
const ATTEMPTS = [
  ["a1", "lost"],
  ["a2", "409"],
  ["a3", "201 replayed"],
  ["a4", "400"],
  ["a5", "new op"],
];

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pb-idem", width: W });
  const CX = W / 2;

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "One key per logical operation: generated before the first attempt, stored with the order, reused on every retry."],
    [2, "The key record and the side effect commit in one transaction, so both exist or neither does."],
    [3, "Past R1 a retry is a new decision: clients stop retrying and reconcile by fetching the object."],
    [0, "Not to scale: attempts are seconds apart, R1 is hours. Same key K throughout; the table gives each attempt."],
  ], { width: 690 });

  // ---- Plan view: one key, from claim to prune ----
  s.comment("Plan view: one key, four lanes");
  const x0 = 180, len = 530;
  const X = (t) => x0 + t * len;
  const lane = x0 - 50;
  const cy = ny + 72; // client lane (attempt dots)
  const ky = cy + 30, kh = 30; // key lane
  const ey = ky + kh + 16, eh = 24; // effect lane
  const ry = ey + eh + 26; // response lane baseline

  // R1: retention, from the first claim to the prune.
  const dy = cy - 34;
  s.dimH(X(T.a1), X(T.prune), dy, "R1", { from: [cy - 4, ky], hl: true });
  s.nb((X(T.a1) + X(T.prune)) / 2 + 18, dy - 7.5, 3);

  s.text(lane, cy + 3, "client", "sl ink", "end");
  s.text(lane, ky + kh / 2 + 3, "key", "sl ink", "end");
  s.text(lane, ey + eh / 2 + 3, "effect", "sl ink", "end");
  s.text(lane, ry, "response", "sl ink", "end");

  // Key lane: in progress, completed with the stored response, pruned.
  s.rect(X(T.a1), ky, X(T.commit) - X(T.a1), kh, "obj fill-2");
  s.rect(X(T.commit), ky, X(T.prune) - X(T.commit), kh, "obj fill-1");
  s.rect(X(T.prune), ky, X(T.end) - X(T.prune), kh, "slot");
  s.label(X(T.a1), ky, X(T.commit) - X(T.a1), kh, "in progress");
  s.label(X(T.commit), ky, X(T.prune) - X(T.commit), kh, "completed · response stored");
  s.label(X(T.prune), ky, X(T.end) - X(T.prune), kh, "pruned", "sl");

  // Effect lane: nothing until the commit, then the payment row.
  s.rect(X(T.a1), ey, X(T.commit) - X(T.a1), eh, "slot");
  s.rect(X(T.commit), ey, X(T.end) - X(T.commit), eh, "obj fill-2");
  s.label(X(T.commit), ey, X(T.end) - X(T.commit), eh, "payment row");

  // The commit: key and effect in one transaction.
  s.line(X(T.commit), cy - 8, X(T.commit), ey + eh + 8, "ctr");
  s.nb(X(T.commit) + 12, cy - 4, 2);

  // Client attempts, each an arrow into the key lane, and its response.
  for (const [code, resp] of ATTEMPTS) {
    const x = X(T[code]);
    s.add(`<circle class="dot" cx="${x}" cy="${cy}" r="2.2"/>`);
    s.path(`M${x},${cy + 3}V${ky - 1}`, "leader", { "marker-end": `url(#${s.id("ah")})` });
    s.text(x + 6, cy - 5, code, "dt");
    s.text(x, ry, resp, "sl ink", "middle");
  }
  s.nb(X(T.a1) + 28, cy - 8.5, 1);

  s.viewTitle(CX, ry + 40, "Plan view · one key, from claim to prune", "Not to scale · timeline · seconds, then hours");
  const viewBottom = ry + 53;

  // ---- Attempt table ----
  s.comment("Attempt table");
  const rows = [
    ["a1", "POST, key K, body B · key claimed", "connection drops before the reply"],
    ["a2", "retry, K, B · key in_progress", "409 Conflict, retry shortly"],
    ["a3", "retry, K, B · key completed", "201, Idempotent-Replayed: true"],
    ["a4", "K, different body · key completed", "400 Bad Request, key mismatch"],
    ["a5", "K, after R1 · key pruned", "processed as a new operation"],
    ["R1", "key retention, from creation", "at least 24 h, then pruned"],
  ];
  const widths = [32, 220, 200];
  const tw = widths.reduce((a, b) => a + b, 0);
  const tb = s.table(CX - tw / 2, viewBottom + 48, "Attempts · same key K", rows, { widths });
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
