import { OG_SIZE } from "@/lib/og";
import { segmentCard } from "@/lib/og-card";
import { metadata } from "./page";

export const alt = String(metadata.title);
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return segmentCard(metadata, {
    kicker: "Patterns",
    scene: "layers",
    path: "/ui/patterns/feedback",
  });
}
