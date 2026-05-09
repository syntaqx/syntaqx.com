import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { Card } from "@/components/card";
import { PostMeta } from "@/components/post-meta";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Posts",
};

export default function PostsPage() {
  const posts = getAllPosts();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xs font-medium uppercase tracking-widest text-dim mb-2">
          All Posts
        </h1>
        <p className="text-sm text-muted">
          {posts.length} articles on engineering, devops, and the craft.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${post.slug}`}
            className="group block"
          >
            <Card hover>
              <h2 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                {post.title}
              </h2>
              <div className="mt-2">
                <PostMeta date={post.date} tags={post.tags} maxTags={3} />
              </div>
              {post.description && (
                <p className="mt-2 text-xs text-dim leading-relaxed line-clamp-2">
                  {post.description}
                </p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
