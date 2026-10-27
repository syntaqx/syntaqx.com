// The messages one field service job sends: job events in a row, the
// message each sends under it with its channels, and the consent class the
// messages fall in. The en-route ETA column is the accent. A standard
// diagram. Embedded in content/books/field-operations/customer-communications.md.
import { sheet } from "../kit.mjs";

const COLS = [
  ["booked", "confirmation", "SMS and email"],
  ["day before", "reminder", "SMS, email, voice"],
  ["tech en route", "on my way + ETA", "SMS, live link", true],
  ["visit complete", "service report", "email, PDF"],
  ["invoiced", "invoice, receipt", "email, pay link"],
  ["days later", "review request", "SMS or email"],
];

export default function draw() {
  const W = 760, x = 20, h = 26, gap = 16, w = W - 2 * x;
  const s = sheet({ prefix: "fo-ccl", width: W });

  const head = (y, label) => {
    s.text(x, y, label, "th");
    s.line(x, y + 8, W - x, y + 8, "tbl");
  };

  s.comment("Job events");
  head(24, "job event");
  const ev = s.row(x, 44, w, COLS.map(([label, , , hl]) => ({ label, hl })), { h, gap });
  ev.slice(1).forEach((n, i) => s.connect(ev[i], n));

  s.comment("The message each event sends");
  const my = 44 + h + 36;
  const msg = s.row(x, my, w, COLS.map(([, label, , hl]) => ({ label, hl })), { h, gap });
  ev.forEach((e, i) => s.connect(e, msg[i], { from: "b", to: "t", hl: COLS[i][3] }));
  COLS.forEach(([, , ch, hl], i) => s.text(msg[i].cx, my + h + 16, ch, hl ? "tc hl" : "tc", "middle"));

  s.comment("Consent class");
  const cy = my + h + 50;
  head(cy, "consent class");
  const by = cy + 18;
  const last = msg.at(-1);
  s.node(x, by, last.x - gap - x, 24, "informational: express consent, no promotion inside", { fill: 1 });
  s.node(last.x, by, last.w, 24, "check purpose", { kind: "ghost" });

  s.height = Math.ceil(by + 24 + 20);
  return s.toString();
}
