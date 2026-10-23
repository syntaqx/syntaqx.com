import { OG_SIZE } from "@/lib/og";
import { ogCard } from "@/lib/og-card";
import { getAllTags, getPostsByTag, getTagLabel, tagDescription } from "@/lib/posts";

export const alt = "Posts on syntaqx, by topic";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: tag.slug }));
}

export default async function Image({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const label = getTagLabel(tag) ?? tag;
  const posts = getPostsByTag(tag);
  return ogCard({
    kicker: "Writing  ·  Topic",
    title: label,
    description: tagDescription(label, posts),
    scene: "stack",
    path: `/tags/${tag}`,
    stat: `${posts.length} post${posts.length === 1 ? "" : "s"}`,
  });
}
