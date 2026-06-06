import { getAllPosts, getAllTags, getNewestPostSlug } from "@/lib/posts";
import { PostList } from "@/components/post-list";
import { TagChips } from "@/components/tag-chips";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Posts",
};

export default function PostsPage() {
  const posts = getAllPosts();
  const newestSlug = getNewestPostSlug(posts);
  const tags = getAllTags(posts);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xs font-medium uppercase tracking-widest text-dim mb-2">
          All Posts
        </h1>
        <p className="text-sm text-muted">
          Thoughts on building products, leading teams, and everything in
          between.
        </p>
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
