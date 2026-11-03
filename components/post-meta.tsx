import { format } from "date-fns";
import { postDay } from "@/lib/post-day";
import { cn } from "@/lib/cn";

interface PostMetaProps {
  date: string;
  dateFormat?: string;
  readingTimeMinutes?: number;
  /** Unpublished: only `next dev` renders these, so say so loudly. */
  draft?: boolean;
  className?: string;
}

export function PostMeta({
  date,
  dateFormat = "MMM d, yyyy",
  readingTimeMinutes,
  draft = false,
  className,
}: PostMetaProps) {
  return (
    <div
      className={cn("inst flex flex-wrap items-center gap-x-3 gap-y-1 text-dim", className)}
    >
      {draft && <span className="shrink-0 border border-pink px-1.5 text-pink">draft</span>}
      <time dateTime={date} className="shrink-0">
        {format(postDay(date), dateFormat)}
      </time>
      {readingTimeMinutes !== undefined && (
        <span className="shrink-0 before:mr-3 before:text-border-hover before:content-['/']">
          {readingTimeMinutes} min read
        </span>
      )}
    </div>
  );
}
