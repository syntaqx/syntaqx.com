import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllPosts,
  getAllTags,
  getNewestPostSlug,
  getPostsByTag,
  getTagLabel,
} from "@/lib/posts";
import { PostList } from "@/components/post-list";

interface Props {
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: tag.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  const label = getTagLabel(tag);
  if (!label) return { title: "Tag not found", robots: { index: false } };

  const url = `https://syntaqx.com/tags/${tag}`;
  return {
    title: `Posts tagged "${label}"`,
    description: `All posts tagged ${label}.`,
    alternates: { canonical: url },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const posts = getAllPosts();
  const label = getTagLabel(tag, posts);
  if (!label) notFound();

  const tagged = getPostsByTag(tag, posts);
  const newestSlug = getNewestPostSlug(posts);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xs font-medium uppercase tracking-widest text-dim mb-2">
          Tagged
        </h1>
        <p className="text-2xl font-semibold tracking-tight text-foreground">
          {label}
        </p>
        <p className="mt-2 text-sm text-muted">
          {tagged.length} post{tagged.length === 1 ? "" : "s"}
        </p>
      </div>
      <PostList posts={tagged} newestSlug={newestSlug} />
    </div>
  );
}
