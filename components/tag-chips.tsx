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
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
              isActive
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border text-dim hover:border-accent/30 hover:text-foreground"
            }`}
          >
            <span>{tag.label}</span>
            {showCounts && (
              <span className="text-[10px] text-dim">{tag.count}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
