import { OG_SIZE } from "@/lib/og";
import { segmentCard } from "@/lib/og-card";
import { BOOKS } from "@/lib/books";
import { BOOKS_INDEX_SCENE } from "@/lib/scene/scenes";
import { metadata } from "./page";

export const alt = String(metadata.title);
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return segmentCard(metadata, {
    kicker: "Books",
    scene: BOOKS_INDEX_SCENE,
    path: "/books",
    stat: `${BOOKS.length} book${BOOKS.length === 1 ? "" : "s"}`,
  });
}
