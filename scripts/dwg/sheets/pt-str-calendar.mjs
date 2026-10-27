// One calendar for a short-term rental: three ways stays arrive, one
// table with an exclusion constraint, an outbox that pushes availability to
// every channel, and overbookings from the channels kept outside the
// constraint as cases. Embedded in
// content/books/property-tech/short-term-rentals.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, sw = 150, sh = 40, gapY = 20;
  const s = sheet({ prefix: "pt-stc", width: W });

  s.comment("Where stays come from");
  const top = 24;
  const Y = (i) => top + i * (sh + gapY);
  const direct = s.node(20, Y(0), sw, sh, "direct site", { sub: "hold with an expiry" });
  const api = s.node(20, Y(1), sw, sh, "API channel", { sub: "messages as they happen" });
  const ical = s.node(20, Y(2), sw, sh, "iCal channel", { kind: "ghost", code: true, sub: "polled; dates only" });

  s.comment("The calendar is a view over stays");
  const sx = 300;
  const stays = s.node(sx, Y(0), 140, Y(2) + sh - Y(0), "stays", { kind: "store", hl: true, sub: ["one calendar;", "exclusion", "constraint on", "unit and dates"] });
  s.wire([direct.port("r"), [sx, direct.cy]], { label: "hold, then confirm", side: "above" });
  s.wire([api.port("r"), [sx, api.cy]], { label: "confirmed", side: "above" });
  s.wire([ical.port("r"), [sx, ical.cy]], { alt: true, label: "dates, lagging", side: "above" });

  s.comment("Every change goes out to every channel");
  const outbox = s.node(480, stays.cy - 25, 110, 50, "outbox", { kind: "store", sub: ["same", "transaction"] });
  const out = s.node(620, stays.cy - 25, W - 20 - 620, 50, "every channel", { sub: ["idempotent,", "in order"] });
  s.connect(stays, outbox);
  s.connect(outbox, out);

  s.comment("A channel's confirmed booking that collides");
  const over = s.node(stays.x, stays.y2 + 56, stays.w, 40, "overbooked", { sub: "a case for a person" });
  s.connect(stays, over, { from: "b", to: "t", alt: true, label: "exclusion violation", side: "right" });

  s.height = Math.ceil(over.y2 + 20);
  return s.toString();
}
