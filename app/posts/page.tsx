import { getAllPosts, getAllTags, getNewestPostSlug } from "@/lib/posts";
import { PostList } from "@/components/post-list";
import { TagChips } from "@/components/tag-chips";
import { SimpleIcon } from "@/components/simple-icon";
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
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xs font-medium uppercase tracking-widest text-dim mb-2">
            All Posts
          </h1>
          <p className="text-sm text-muted">
            Thoughts on building products, leading teams, and everything in
            between.
          </p>
        </div>
        <a
          href="/feed.xml"
          className="flex shrink-0 items-center gap-1.5 text-xs text-dim hover:text-accent transition-colors"
          aria-label="Subscribe via RSS"
        >
          <SimpleIcon name="rss" size={14} />
          RSS
        </a>
      </div>
      {tags.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[10px] font-medium uppercase tracking-widest text-dim mb-3">
            Browse by tag
          </h2>
          <TagChips tags={tags} />
        </div>
      )}
      <PostList posts={posts} newestSlug={newestSlug} />
    </div>
  );
}
