import Link from "next/link";
import { format } from "date-fns";
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
      className={`inst flex flex-wrap items-center gap-x-3 gap-y-1 text-dim ${className}`}
    >
      <time dateTime={date} className="shrink-0">
        {format(new Date(date), dateFormat)}
      </time>
      {readingTimeMinutes !== undefined && (
        <span className="shrink-0 before:mr-3 before:text-border-hover before:content-['/']">
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
  const chip = "inst inline-block border border-border px-2 py-1 text-dim";
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {shown.map((tag) =>
        asLinks ? (
          <Link
            key={tag}
            href={`/tags/${slugifyTag(tag)}`}
            className={`${chip} hover:border-accent hover:text-accent transition-colors`}
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
