import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { slugifyTag } from "@/lib/posts";

interface PostMetaProps {
  date: string;
  dateFormat?: string;
  readingTimeMinutes?: number;
  className?: string;
}

export function PostMeta({
  date,
  dateFormat = "MMM d, yyyy",
  readingTimeMinutes,
  className = "",
}: PostMetaProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-dim ${className}`}
    >
      <span className="flex items-center gap-1 shrink-0">
        <Calendar size={11} />
        <time dateTime={date}>{format(new Date(date), dateFormat)}</time>
      </span>
      {readingTimeMinutes !== undefined && (
        <span className="flex items-center gap-1 shrink-0">
          <Clock size={11} />
          {readingTimeMinutes} min read
        </span>
      )}
    </div>
  );
}

interface PostTagsProps {
  tags?: string[];
  max?: number;
  className?: string;
  /**
   * Render each tag as a link to its `/tags/<slug>` page. Only enable
   * where the tags are NOT already nested inside an anchor (e.g. the
   * post detail header) — nesting <a> inside <a> is invalid HTML and
   * triggers hydration errors.
   */
  asLinks?: boolean;
}

export function PostTags({
  tags,
  max,
  className = "",
  asLinks = false,
}: PostTagsProps) {
  if (!tags || tags.length === 0) return null;
  const shown = max ? tags.slice(0, max) : tags;
  const chip =
    "inline-block rounded border border-border px-1.5 py-0.5 text-[10px] text-dim";
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {shown.map((tag) =>
        asLinks ? (
          <Link
            key={tag}
            href={`/tags/${slugifyTag(tag)}`}
            className={`${chip} hover:border-accent/30 hover:text-foreground transition-colors`}
          >
            {tag}
          </Link>
        ) : (
          <span key={tag} className={chip}>
            {tag}
          </span>
        ),
      )}
    </div>
  );
}
