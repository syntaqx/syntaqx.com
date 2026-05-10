import Link from "next/link";
import { getAllPosts, getNewestPostSlug } from "@/lib/posts";
import { Card } from "@/components/card";
import { PostMeta, PostTags } from "@/components/post-meta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Posts",
};

export default function PostsPage() {
  const posts = getAllPosts();
  const newestSlug = getNewestPostSlug(posts);

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
      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="group block"
          >
            <Card hover className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base font-medium text-foreground group-hover:text-accent transition-colors">
                  {post.title}
                </h2>
                {post.slug === newestSlug && (
                  <span className="shrink-0 rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
                    New
                  </span>
                )}
              </div>
              {post.description && (
                <p className="mt-2 text-xs text-dim leading-relaxed line-clamp-2">
                  {post.description}
                </p>
              )}
              <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <PostMeta
                  date={post.date}
                  readingTimeMinutes={post.readingTimeMinutes}
                />
                <PostTags tags={post.tags} max={3} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
