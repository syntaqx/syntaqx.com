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
import { PageHeader } from "@/components/page-header";
import { SITE_URL } from "@/lib/constants";

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

  const url = `${SITE_URL}/tags/${tag}`;
  return {
    title: `Posts tagged "${label}"`,
    description: `All posts tagged ${label}.`,
    alternates: { canonical: url },
    // Thin archive pages: keep them browsable, but don't ask Google to index
    // them. Also excluded from the sitemap (see app/sitemap.ts).
    robots: { index: false, follow: true },
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
      <PageHeader label="tagged" title={label}>
        <p>
          {tagged.length} post{tagged.length === 1 ? "" : "s"}
        </p>
      </PageHeader>
      <PostList posts={tagged} newestSlug={newestSlug} />
    </div>
  );
}
