// Work order intake and triage: requests from every source become one
// request, emergencies go to a person before any model, triage sets
// category, priority and who does it, deadlines are stored, and vendor work
// over the owner's cap waits for approval. Embedded in
// content/books/property-tech/maintenance-and-work-orders.md.
import { sheet } from "../kit.mjs";

const SOURCES = [
  { label: "residents", sub: "portal, app, text, phone" },
  { label: "staff", sub: "walks and inspections" },
  { label: "schedules", sub: "preventive and turns" },
  { label: "devices", sub: "leak and no-heat sensors" },
];

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pt-mwi", width: W });

  s.comment("Where requests come from");
  const src = s.row(20, 20, 720, SOURCES, { h: 40, gap: 16 });

  s.comment("One request, then the emergency check");
  const rB = 116, hB = 44;
  const request = s.node(40, rB, 130, hB, "request", { sub: "source, channel" });
  const emergency = s.node(220, rB - 8, 120, hB + 16, "emergency?", { kind: "decision" });
  const intake = s.node(390, rB, 160, hB, "intake", { sub: "AI agent or staff" });
  s.fanIn(src, request, { from: "b", to: "t", via: src.bottom + 18 });
  s.connect(request, emergency);
  s.connect(emergency, intake, { label: "no", side: "above" });

  s.comment("Emergencies skip the model; everything lands in triage");
  const rC = 212;
  const human = s.node(215, rC, 130, 48, "human path", { hl: true, sub: ["on-call person,", "before any model"] });
  const triage = s.node(390, rC, 160, 48, "triage", { sub: "category, priority, who" });
  s.connect(emergency, human, { from: "b", to: "t", hl: true, label: "yes", side: "right" });
  s.connect(intake, triage, { from: "b", to: "t" });
  s.connect(human, triage, { hl: true });

  s.comment("Who does it");
  const ox = 584, ow = W - 20 - ox;
  const staff = s.node(ox, rC - 50, ow, 40, "staff technician", { sub: "dispatch" });
  const vendor = s.node(ox, rC + 58, ow, 40, "vendor", { sub: "purchase order" });
  s.fanOut(triage, [staff, vendor], { via: 567 });
  const owner = s.node(ox, vendor.y2 + 40, ow, 48, "owner approval", { sub: ["spend cap in the", "management agreement"] });
  s.connect(vendor, owner, { from: "b", to: "t", alt: true, label: "over cap", side: "left" });

  s.comment("Deadlines are computed once and stored");
  const dl = s.node(390, owner.y, 160, 48, "respond_by, complete_by", { code: true, kind: "store", sub: "stricter of SLA and law" });
  s.connect(triage, dl, { from: "b", to: "t" });

  s.height = Math.ceil(owner.y2 + 20);
  return s.toString();
}
