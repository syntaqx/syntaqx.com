import { getAllPosts, getAllTags, getNewestPostSlug } from "@/lib/posts";
import { PostList } from "@/components/post-list";
import { TagChips } from "@/components/tag-chips";
import { SimpleIcon } from "@/components/simple-icon";
import { PageHeader } from "@/components/page-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Posts",
  description:
    "Essays and notes on software engineering, architecture, engineering leadership, and building with LLMs: everything I write, gathered in one place.",
};

export default function PostsPage() {
  const posts = getAllPosts();
  const newestSlug = getNewestPostSlug(posts);
  const tags = getAllTags(posts);

  return (
    <div>
      <PageHeader label="posts" title="Writing">
        <p>
          Thoughts on building products, leading teams, and everything in
          between.
        </p>
        <a
          href="/feed.xml"
          className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs text-dim transition-colors hover:text-accent"
          aria-label="Subscribe via RSS"
        >
          <SimpleIcon name="rss" size={13} />
          rss
        </a>
      </PageHeader>
      {tags.length > 0 && (
        <div className="mb-12">
          <h2 className="eyebrow mb-4">browse by tag</h2>
          <TagChips tags={tags} />
        </div>
      )}
      <PostList posts={posts} newestSlug={newestSlug} />
    </div>
  );
}
