// Proof of service: evidence captured on site into a completion gate, a
// sealed visit record and the service report; not completed sealed the same
// way; edits after close as amendments. Embedded in
// content/books/field-operations/proof-of-service.md.
import { sheet } from "../kit.mjs";

const EVIDENCE = ["photos", "signature, name", "notes, answers", "scans, readings", "products applied"];

export default function draw() {
  const W = 760, x = 20, ew = 134, eh = 24, egap = 6, h = 40;
  const s = sheet({ prefix: "fo-pos", width: W });
  const top = 42;

  s.comment("Captured on site");
  s.text(x, 26, "captured on site", "th");
  const ev = EVIDENCE.map((l, i) => s.node(x, top + i * (eh + egap), ew, eh, l));
  const cy = (ev[0].cy + ev.at(-1).cy) / 2;
  const bus = x + ew + 18;
  for (const n of ev) s.wire([n.port("r"), [bus, n.cy]], { arrow: "none" });
  s.line(bus, ev[0].cy, bus, ev.at(-1).cy, "flow");

  s.comment("Gate, record, report");
  const gate = s.node(bus + 22, cy - h / 2, 146, h, "completion gate", { sub: "required per task" });
  const sealed = s.node(gate.x + gate.w + 56, cy - h / 2, 166, h, "sealed visit record", { hl: true, sub: "hash, times, place" });
  const report = s.node(W - x - 136, cy - h / 2, 136, h, "service report", { sub: "email, portal" });
  s.wire([[bus, cy], gate.port("l")], { hl: true });
  s.connect(gate, sealed, { hl: true, label: "done" });
  s.connect(sealed, report, { hl: true });

  s.comment("Not completed, amendment");
  const y2 = ev.at(-1).y + eh + 24;
  const nc = s.node(gate.x, y2, gate.w, h, "not completed", { fill: 1, sub: "reason, photo" });
  s.connect(gate, nc, { from: "b", to: "t", label: "not done", side: "right" });
  s.connect(nc, sealed, { from: "r", to: "b", at: [0.5, 0.25] });
  const am = s.node(report.x, y2, report.w, h, "amendment", { kind: "ghost", sub: "new version, why" });
  s.connect(sealed, am, { from: "b", to: "t", at: [0.75, 0.5], alt: true, label: "edit after close", side: "above" });
  s.height = Math.ceil(y2 + h + 20);
  return s.toString();
}
