// The affordable certification cycle as a standard diagram: a household's
// certifications as a chain of immutable records (move-in, interim, annual,
// other events), the event that opens each one above it, and the missed
// annual below. Embedded in content/books/property-tech/affordable-housing.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pt-ac", width: W });

  const n = 4, w = 156, gap = (W - 40 - n * w) / (n - 1), h = 46;
  const X = (i) => 20 + i * (w + gap);
  const yE = 24, eh = 50, yC = yE + eh + 40;

  s.comment("Events that open a certification");
  const events = [
    s.node(X(0), yE, w, eh, "application", { sub: "household moves in" }),
    s.node(X(1), yE, w, eh, "change", { sub: "income or household" }),
    s.node(X(2), yE, w, eh, "anniversary", { sub: "notices months ahead" }),
    s.node(X(3), yE, w, eh, "other event", { sub: ["transfer, rent change,", "termination"] }),
  ];

  s.comment("The chain of certifications");
  const certs = [
    s.node(X(0), yC, w, h, "move-in", { kind: "store", sub: "every program's tests" }),
    s.node(X(1), yC, w, h, "interim", { kind: "store", sub: "past the threshold" }),
    s.node(X(2), yC, w, h, "annual", { kind: "store", sub: "recertification", hl: true }),
    s.node(X(3), yC, w, h, "new record", { kind: "store", sub: "for that event" }),
  ];
  events.forEach((e, i) => s.connect(e, certs[i], { from: "b", to: "t", hl: i === 2 }));
  certs.slice(1).forEach((c, i) => s.connect(certs[i], c));

  s.comment("Missed annual");
  const yM = yC + h + 40;
  const missed = s.node(X(2), yM, w, 50, "missed annual", { end: true, fill: 1, sub: ["rent changes,", "often to market"] });
  s.wire([[certs[2].cx, certs[2].y2], missed.port("t")], { alt: true, label: "no response", side: "right" });

  s.comment("Immutable records");
  const sy = yM + 10;
  const ty = s.span(X(0), X(1) + w, sy, "immutable: inputs, rule version, outputs");
  s.text((X(0) + X(1) + w) / 2, ty + 14, "a correction is a new certification", "sl", "middle");

  s.height = Math.ceil(Math.max(missed.y2, ty + 14) + 20);
  return s.toString();
}
