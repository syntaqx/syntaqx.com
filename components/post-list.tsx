import Link from "next/link";
import { format } from "date-fns";
import type { PostData } from "@/lib/posts";

interface PostListProps {
  posts: PostData[];
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
            className="group relative grid gap-x-8 gap-y-2 px-0 py-6 transition-colors before:absolute before:top-1/2 before:-left-4 before:size-1.5 before:-translate-y-1/2 before:scale-0 before:bg-accent before:transition-transform before:duration-200 before:ease-[steps(3)] hover:bg-surface hover:before:scale-100 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-baseline sm:px-4"
          >
            <time dateTime={post.date} className="inst text-dim tabular-nums">
              {format(new Date(post.date), "yyyy.MM.dd")}
            </time>
            <div className="min-w-0">
              <h2 className="text-2xl leading-none text-foreground transition-[color,translate] duration-200 ease-[steps(4)] group-hover:translate-x-1.5 group-hover:text-accent sm:text-[1.65rem]">
                {post.title}
              </h2>
              {post.description && (
                <p className="mt-2 max-w-2xl text-[0.95rem] leading-snug text-dim line-clamp-2">
                  {post.description}
                </p>
              )}
            </div>
            <span className="inst flex items-center gap-3 text-dim sm:justify-end">
              {post.layout === "feature" && (
                <span className="text-accent">feature</span>
              )}
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
