// A property catastrophe reinsurance tower as a standard diagram: the
// gross hurricane loss through a 30% quota share, then the net loss
// against a retention and three excess of loss layers drawn to scale.
// Embedded in content/books/insurance/reinsurance-structures.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "rt", width: W });

  // Tower: heights proportional to dollars, bottom at yBase.
  const k = 0.8; // sheet units per $1M
  const top = 40;
  const total = 350;
  const yBase = top + total * k;
  const tx = 330,
    tw = 230;
  const Y = (m) => yBase - m * k; // y of a dollar level, $M

  s.comment("Tower");
  const layers = [
    { from: 0, to: 50, label: "retention", sub: "insurer keeps $50M" },
    { from: 50, to: 100, label: "layer 1 · $50M xs $50M", sub: "exhausted" },
    { from: 100, to: 200, label: "layer 2 · $100M xs $100M", sub: "exhausted" },
    { from: 200, to: 350, label: "layer 3 · $150M xs $200M", sub: "uses $10M of $150M" },
  ];
  const boxes = layers.map((l) =>
    s.node(tx, Y(l.to), tw, (l.to - l.from) * k, l.label, {
      kind: l.from === 0 ? "store" : "process",
      sub: l.sub,
    }),
  );
  for (const m of [0, 50, 100, 200, 350]) {
    s.text(tx - 10, Y(m) + 3.5, `$${m}M`, "vs", "end");
  }

  s.comment("Event net loss against the tower");
  const bx = tx + tw + 16;
  s.bracket(Y(210), Y(0), bx, "event net loss\n$210M: $160M\nrecovered", { hl: true });

  s.comment("Gross to net");
  const nx = 40,
    nw = 170,
    nh = 40;
  const gross = s.node(nx, Y(330), nw, nh, "hurricane", { kind: "actor", sub: "gross loss $300M" });
  const qs = s.node(nx, Y(250), nw, nh, "quota share 30%", { sub: "cedes $90M" });
  s.connect(gross, qs, { from: "b", to: "t" });
  s.wire([qs.port("b"), [qs.cx, Y(170)], [tx, Y(170)]], {
    label: "net $210M",
    seg: 1,
    side: "above",
  });

  s.height = Math.ceil(yBase + 24);
  void boxes;
  return s.toString();
}
