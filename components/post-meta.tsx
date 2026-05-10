import { format } from "date-fns";
import { Calendar } from "lucide-react";

interface PostMetaProps {
  date: string;
  tags?: string[];
  maxTags?: number;
  dateFormat?: string;
}

export function PostMeta({
  date,
  tags,
  maxTags = 2,
  dateFormat = "MMM d, yyyy",
}: PostMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-dim">
      <span className="flex items-center gap-1 shrink-0">
        <Calendar size={11} />
        <time dateTime={date}>{format(new Date(date), dateFormat)}</time>
      </span>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, maxTags).map((tag) => (
            <span
              key={tag}
              className="inline-block rounded border border-border px-1.5 py-0.5 text-[10px] text-dim"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
