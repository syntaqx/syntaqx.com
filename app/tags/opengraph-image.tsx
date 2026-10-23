import { OG_SIZE } from "@/lib/og";
import { segmentCard } from "@/lib/og-card";
import { getAllTags } from "@/lib/posts";
import { metadata } from "./page";

export const alt = String(metadata.title);
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return segmentCard(metadata, {
    kicker: "Writing  ·  Topics",
    scene: "stack",
    path: "/tags",
    stat: `${getAllTags().length} topics`,
  });
}
