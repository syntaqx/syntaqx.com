"use client";

import { useState } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/checkbox";
import { PostList, type PostSummary } from "@/components/post-list";
import type { TagInfo } from "@/lib/posts";

interface PostsBrowserProps {
  posts: (PostSummary & { tagSlugs: string[] })[];
  tags: TagInfo[];
  newestSlug: string | null;
}

/** The post list with a topic rail beside it; picking topics shows posts in any of them. */
export function PostsBrowser({ posts, tags, newestSlug }: PostsBrowserProps) {
  const [picked, setPicked] = useState<string[]>([]);
  const shown = picked.length
    ? posts.filter((post) => post.tagSlugs.some((slug) => picked.includes(slug)))
    : posts;
  const toggle = (slug: string, on: boolean) =>
    setPicked((prev) => (on ? [...prev, slug] : prev.filter((s) => s !== slug)));

  const rail = (
    <ul className="grid gap-2.5">
      {tags.map((tag) => (
        <li key={tag.slug} className="flex items-center justify-between gap-3">
          <Checkbox
            label={tag.label}
            checked={picked.includes(tag.slug)}
            onChange={(on) => toggle(tag.slug, on)}
          />
          <span className="inst text-dim tabular-nums">{tag.count}</span>
        </li>
      ))}
    </ul>
  );

  const header = (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <Link href="/tags" className="eyebrow transition-colors hover:text-accent">
        topics
      </Link>
      {picked.length > 0 && (
        <button
          type="button"
          onClick={() => setPicked([])}
          className="inst text-dim transition-colors hover:text-accent"
        >
          clear
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_13rem]">
      <aside aria-label="Filter by topic" className="lg:order-last">
        <details className="border border-border px-4 py-3 lg:hidden">
          <summary className="inst cursor-pointer text-dim">
            filter by topic{picked.length > 0 && ` · ${picked.length}`}
          </summary>
          <div className="mt-4">
            {header}
            {rail}
          </div>
        </details>
        <div className="sticky top-24 hidden lg:block">
          {header}
          {rail}
        </div>
      </aside>
      <div className="min-w-0">
        {picked.length > 0 && (
          <p className="inst mb-4 text-dim" aria-live="polite">
            {shown.length} of {posts.length} posts
          </p>
        )}
        <PostList posts={shown} newestSlug={newestSlug} />
      </div>
    </div>
  );
}
