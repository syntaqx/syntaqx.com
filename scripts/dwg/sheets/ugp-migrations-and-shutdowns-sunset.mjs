// A sunset as a standard state machine: the service_sunsets states from
// announced to deleted in the accent, with what users can still do under
// each, and records under holds kept past the erasure job. Embedded in
// content/books/user-generated-platforms/migrations-and-shutdowns.md
// (Ending a Feature or a Service).
import { sheet } from "../kit.mjs";

const STATES = [
  ["announced", ["date, export, money,", "links and embeds"]],
  ["frozen", ["no new accounts,", "uploads or bookings;", "content readable"]],
  ["read_only", ["viewable and", "exportable,", "no writes"]],
  ["closed", ["content hidden,", "exports for a period,", "APIs off"]],
  ["deleted", ["erasure job runs,", "URLs answer 410", "or redirect"]],
];

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-sun", width: W });

  const n = STATES.length, w = 112, h = 30;
  const gap = (W - 40 - n * w) / (n - 1);
  const X = (i) => 20 + i * (w + gap);
  const y = 30;

  s.comment("States");
  const nodes = STATES.map(([label], i) =>
    s.node(X(i), y, w, h, label, { kind: "state", code: true, end: i === n - 1 }));
  nodes.slice(1).forEach((b, i) => s.connect(nodes[i], b, { hl: true }));

  s.comment("What each state means");
  let bottom = 0;
  STATES.forEach(([, note], i) => {
    const anchor = i === 0 ? "left" : i === n - 1 ? "right" : "center";
    bottom = Math.max(bottom, s.note(nodes[i], note.join("\n"), { anchor }));
  });

  s.comment("Holds survive the erasure");
  const del = nodes[n - 1];
  const hy = bottom + 30, hw = 236;
  const held = s.node(W - 20 - hw, hy, hw, 30, "records under holds or retention", { kind: "store" });
  s.wire([[del.cx, bottom + 8], [del.cx, hy]], { alt: true, label: "kept, reported", side: "left" });

  s.comment("Legend");
  const lg = s.legend(20, held.y + held.h / 2, [
    { kind: "hl", label: "dated sequence" },
    { kind: "alt", label: "skips the erasure" },
    { kind: "end", label: "terminal state" },
  ], { width: held.x - 40 });
  s.height = Math.ceil(Math.max(lg.y, held.y2) + 18);
  return s.toString();
}
