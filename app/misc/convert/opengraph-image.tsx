import { OG_SIZE } from "@/lib/og";
import { segmentCard } from "@/lib/og-card";
import { metadata } from "./layout";

export const alt = String(metadata.title);
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return segmentCard(metadata, {
    kicker: "Tools",
    scene: "toolbox",
    path: "/misc/convert",
  });
}
