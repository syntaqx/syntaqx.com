// The community permission algorithm as a flowchart: the owner and
// administrator short-circuits, base permissions as an OR of roles, then the
// channel overwrites in their fixed order (the accent), implicit rules and
// the timeout strip. Embedded in
// content/books/user-generated-platforms/communities-and-permissions.md.
import { sheet } from "../kit.mjs";

const ROW2 = [
  { label: "default role\noverwrite", sub: ["deny, then", "allow"], hl: true },
  { label: "role\noverwrites", sub: ["all denies, then", "all allows"], hl: true },
  { label: "member\noverwrite", sub: ["deny, then", "allow"], hl: true },
  { label: "implicit\nrules", sub: ["no view: moot;", "no send: its", "dependents off"] },
  { label: "timeout", sub: ["view and read", "history only"] },
  { label: "effective\npermissions", end: true },
];

export default function draw() {
  const W = 760, gap = 16;
  const s = sheet({ prefix: "ugp-cpa", width: W });
  const w = (W - 40 - 5 * gap) / 6;
  const X = (i) => 20 + i * (w + gap);
  const ch = 26, r1 = 48, dh = 52, bh = 40;
  const mid1 = r1 + dh / 2;

  s.comment("Short-circuits");
  const owner = s.node(X(0), r1, w, dh, "owner?", { kind: "decision" });
  const base = s.node(X(1) + 24, mid1 - bh / 2, w, bh, "base", { sub: ["default OR roles"], cls: "sl ink" });
  const admin = s.node(X(2) + 48, r1, w, dh, "administrator?", { kind: "decision" });
  const all = s.node(X(4), mid1 - bh / 2, w, bh, "everything", { end: true, fill: 1 });
  s.connect(owner, base, { label: "no", side: "above" });
  s.connect(base, admin);
  s.wire([admin.port("r"), [X(3) + w / 2, mid1], all.port("l")], { label: "yes", side: "above" });
  s.wire([owner.port("t"), [owner.cx, ch], [all.cx, ch], all.port("t")], { label: "yes: no role or overwrite applies", side: "above", seg: 1 });

  s.comment("Channel overwrites, then the implicit rules");
  const r2 = r1 + dh + 56;
  const { nodes } = s.pipeline(20, r2, ROW2, { w, h: bh, gap });
  s.connect(admin, nodes[0], { from: "b", to: "t", label: "no", side: "right", seg: 0 });

  const fy = r2 + bh + 70;
  s.text(20, fy, "role position never enters the math; rank decides who may act on whom", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
