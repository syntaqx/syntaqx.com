// The volume's core data model in three rows (who and where, what was sold,
// the work) with the visit states under it. Work order to visit is the
// accented relation. Embedded in
// content/books/field-operations/field-operations-business.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, x = 20, titleW = 120, w = 94, h = 28, gap = 38;
  const X = (i) => x + titleW + i * (w + gap);
  const s = sheet({ prefix: "fo-fobm", width: W });
  const r1 = 24, r2 = r1 + 72, r3 = r2 + 84;
  const row = (y, title) => s.text(x, y + h / 2 + 3.5, title, "lt");
  const t = (i, y, label, o = {}) => s.node(X(i), y, w, h, label, { code: true, ...o });

  s.comment("Who and where");
  row(r1, "who and where");
  const [person, account, property, asset] = ["person", "account", "property", "asset"].map((l, i) => t(i, r1, l));
  s.connect(person, account, { label: "role" });
  s.connect(account, property, { label: "1..n", labelCls: "tc" });
  s.connect(property, asset, { label: "1..n", labelCls: "tc" });

  s.comment("What was sold");
  row(r2, "what was sold");
  const [plan, version, agreement, recurrence] = ["plan", "plan_version", "agreement", "recurrence"].map((l, i) => t(i, r2, l, { fill: i === 2 ? 1 : 2 }));
  s.connect(plan, version);
  s.connect(version, agreement);
  s.connect(property, agreement, { from: "b", to: "t" });
  s.connect(agreement, recurrence);
  s.text(recurrence.x + w + 12, recurrence.cy + 3, "RRULE plus window", "tc");

  s.comment("The work");
  row(r3, "the work");
  const occurrence = t(0, r3, "occurrence");
  const wo = t(1, r3, "work_order", { hl: true });
  const visit = t(2, r3, "visit", { hl: true });
  const route = t(3, r3, "route");
  s.connect(recurrence, occurrence, { from: "b", to: "t", alt: true, via: r2 + h + 26, label: "generates", side: "above" });
  s.connect(occurrence, wo);
  s.connect(wo, visit, { hl: true, label: "1..n", labelCls: "tc" });
  s.connect(visit, route);
  const resource = t(3, r3 + h + 36, "resource", { kind: "ghost" });
  s.connect(route, resource, { from: "b", to: "t", alt: true, label: "one day", side: "right" });
  s.text(wo.cx, r3 + h + 16, "also from a request or a sale", "sl", "middle");

  s.comment("Visit states");
  const vy = resource.y + h + 34;
  s.text(x, vy, "visit states", "lt");
  s.text(X(0), vy, "held, scheduled, dispatched, en_route, on_site, completed", "tc");
  s.text(W - x, vy, "exits: not_completed, cancelled", "tc", "end");
  s.height = Math.ceil(vy + 18);
  return s.toString();
}
