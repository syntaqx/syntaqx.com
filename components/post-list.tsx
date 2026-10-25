import Link from "next/link";
import { format } from "date-fns";
import type { PostData } from "@/lib/posts";

export type PostSummary = Pick<
  PostData,
  "slug" | "title" | "date" | "description" | "readingTimeMinutes"
>;

interface PostListProps {
  posts: PostSummary[];
  /** Slug of the post that should wear the "New" badge, if any. */
  newestSlug?: string | null;
}

export function PostList({ posts, newestSlug = null }: PostListProps) {
  return (
    <ol className="border-t border-border">
      {posts.map((post) => (
        <li key={post.slug} className="border-b border-border">
          <Link
            href={`/posts/${post.slug}`}
            className="post-row group"
          >
            <time dateTime={post.date} className="inst text-dim tabular-nums">
              {format(new Date(post.date), "yyyy.MM.dd")}
            </time>
            <div className="min-w-0">
              <h2 className="post-row-title">
                {post.title}
              </h2>
              {post.description && (
                <p className="mt-1.5 max-w-2xl text-[0.9rem] leading-snug text-dim line-clamp-2">
                  {post.description}
                </p>
              )}
            </div>
            <span className="inst flex items-center gap-3 text-dim sm:justify-end">
              {post.slug === newestSlug && (
                <span className="text-accent">new</span>
              )}
              {post.readingTimeMinutes} min
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
