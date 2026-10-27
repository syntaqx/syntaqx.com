// A door's states during canvassing: unknocked to not home (revisit) or a
// conversation, the conversation's four outcomes with what happens next,
// and Do Not Knock reachable from every state. Embedded in
// content/books/field-operations/door-to-door-sales.md.
import { sheet } from "../kit.mjs";

const OUTCOMES = [
  ["not interested", "rest for a set period"],
  ["callback", "follow-up task, drip"],
  ["appointment set", "calendar, reminder"],
  ["sold", "agreement, cooling-off"],
];

export default function draw() {
  const W = 760, x = 20, h = 28, rowH = 42;
  const s = sheet({ prefix: "fo-dds", width: W });
  const cDoor = x, cKnock = 196, cOut = 400, cNext = 572;
  const wDoor = 116, wKnock = 136, wOut = 146;
  const top = 44, R = (i) => top + i * rowH;

  s.comment("Column heads");
  for (const [cx, t] of [[cDoor, "door"], [cKnock, "knock"], [cOut, "outcome"], [cNext, "next"]]) s.text(cx, 24, t, "th");

  s.comment("States");
  const unknocked = s.node(cDoor, R(1), wDoor, h, "unknocked", { kind: "state" });
  const notHome = s.node(cKnock, R(0), wKnock, h, "not home", { kind: "state" });
  const talk = s.node(cKnock, R(2), wKnock, h, "conversation", { kind: "state" });
  const outs = OUTCOMES.map(([l], i) => s.node(cOut, R(i), wOut, h, l, { kind: "state", end: i === 3, hl: i === 3 }));
  OUTCOMES.forEach(([, next], i) => s.text(cNext, outs[i].cy + 3, next, i === 3 ? "sl hl" : "sl"));

  s.comment("Knocks");
  s.connect(unknocked, notHome, { at: [0.5, 0.7] });
  s.connect(unknocked, talk, { hl: true });
  s.wire([notHome.port("l", 0.3), [unknocked.cx, notHome.port("l", 0.3)[1]], unknocked.port("t")], { alt: true, label: "revisit", seg: 0, side: "above" });

  s.comment("Outcomes");
  const mx = (talk.x + talk.w + cOut) / 2;
  outs.forEach((o, i) => s.connect(talk, o, { via: mx, hl: i === 3 }));

  s.comment("Do Not Knock, from every state");
  const dy = R(3) + h + 40;
  const dnk = s.node(x, dy, W - 2 * x, 36, "do not knock", { fill: 1, sub: "registry, sign posted, or request; suppressed until it expires" });
  for (const n of [unknocked, talk, outs[3]]) s.wire([n.port("b"), [n.cx, dy]], { alt: true });
  s.height = Math.ceil(dnk.y + dnk.h + 20);
  return s.toString();
}
