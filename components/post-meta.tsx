import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";

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
}

export function PostTags({ tags, max, className = "" }: PostTagsProps) {
  if (!tags || tags.length === 0) return null;
  const shown = max ? tags.slice(0, max) : tags;
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {shown.map((tag) => (
        <span
          key={tag}
          className="inline-block rounded border border-border px-1.5 py-0.5 text-[10px] text-dim"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
