// A make-ready turn as a pipeline: the tasks from vacate to ready in their
// dependency order, the whole run sized by the next move-in, and the
// move-out inspection's findings feeding the deposit itemization that runs
// beside the turn. Embedded in
// content/books/property-tech/maintenance-and-work-orders.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { head: "scope", label: "inspect", sub: ["move-out", "inspection"] },
  { label: "trash-out" },
  { label: "repairs" },
  { label: "paint", sub: ["after", "repairs"] },
  { head: "vendor slots", label: "flooring", sub: ["after", "paint"] },
  { label: "clean", sub: ["last", "task"] },
  { head: "check", label: "final", sub: ["quality", "inspection"] },
  { label: "ready", hl: true, end: true },
];

export default function draw() {
  const W = 760, w = 74, gap = 18, h = 28;
  const total = STAGES.length * w + (STAGES.length - 1) * gap;
  const x0 = (W - total) / 2;
  const s = sheet({ prefix: "pt-mwt", width: W });

  s.comment("The window the turn must fit");
  const top = 84;
  s.span(x0, x0 + total, 24, "vacate date to target ready date: the next move-in, or a policy target", { above: false });

  s.comment("Tasks in order");
  const { nodes, bottoms } = s.pipeline(x0, top, STAGES, { w, h, gap, hlArrows: true });
  const [inspect, , repairs] = nodes;

  s.comment("The inspection also decides what the household is charged");
  const ry = Math.max(...bottoms) + 40;
  const dmg = s.node(x0, ry, 150, 48, "chargeable damage", { kind: "store", sub: "beyond normal wear" });
  const dep = s.node(repairs.x + 10, ry, 210, 48, "deposit itemization", { kind: "store", sub: ["runs beside the turn;", "CA: 21 days from move-out"] });
  s.wire([[inspect.cx, bottoms[0] + 6], [inspect.cx, dmg.y]]);
  s.connect(dmg, dep);
  s.wire([[repairs.cx + 4, repairs.y + h], [repairs.cx + 4, dep.y]], { alt: true, label: "invoices\nas evidence", side: "left" });

  s.height = Math.ceil(dmg.y2 + 20);
  return s.toString();
}
