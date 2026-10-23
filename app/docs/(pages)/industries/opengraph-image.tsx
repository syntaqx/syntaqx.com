import { OG_SIZE } from "@/lib/og";
import { segmentCard } from "@/lib/og-card";
import { INDUSTRIES } from "@/lib/industries";
import { metadata } from "./page";

export const alt = String(metadata.title);
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return segmentCard(metadata, {
    kicker: "The playbook  ·  Industries",
    scene: "stack",
    path: "/docs/industries",
    stat: `${INDUSTRIES.length} volume${INDUSTRIES.length === 1 ? "" : "s"}`,
  });
}
