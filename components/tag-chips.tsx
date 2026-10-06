import Link from "next/link";
import type { TagInfo } from "@/lib/posts";

interface TagChipsProps {
  tags: TagInfo[];
  /** Slug of the currently-active tag, rendered with accent styling. */
  activeSlug?: string | null;
  /** Show the per-tag post count next to each label. */
  showCounts?: boolean;
  className?: string;
}

export function TagChips({
  tags,
  activeSlug = null,
  showCounts = false,
  className = "",
}: TagChipsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => {
        const isActive = tag.slug === activeSlug;
        return (
          <Link
            key={tag.slug}
            href={`/tags/${tag.slug}`}
            aria-current={isActive ? "page" : undefined}
            className={`inst inline-flex items-center gap-2 border px-2.5 py-1.5 transition-colors ${
              isActive
                ? "border-accent text-accent"
                : "border-border text-muted hover:border-accent hover:text-accent"
            }`}
          >
            <span>{tag.label}</span>
            {showCounts && <span className="text-dim">{tag.count}</span>}
          </Link>
        );
      })}
    </div>
  );
}
