import Link from "next/link";
import { ChapterKeys } from "@/components/chapter-keys";

export interface Neighbor {
  href: string;
  /** What it belongs to, after "Previous ·" or "Next ·". */
  label: string;
  title: string;
}

/**
 * Previous and next at the foot of a page, with ← and → bound to them.
 * Renders only the sides that exist, and nothing when neither does.
 */
export function Pager({ prev, next }: { prev?: Neighbor | null; next?: Neighbor | null }) {
  if (!prev && !next) return null;
  return (
    <>
      <nav data-pagefind-ignore
        aria-label="Previous and next (or use the arrow keys)"
        className="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
      >
        {prev && (
          <Link
            href={prev.href}
            className="group border border-border p-4 transition-colors hover:border-accent"
          >
            <span className="inst block text-dim">Previous · {prev.label}</span>
            <span className="mt-1 block group-hover:text-accent">{prev.title}</span>
          </Link>
        )}
        {next && (
          <Link
            href={next.href}
            className="group border border-border p-4 text-right transition-colors hover:border-accent sm:col-start-2"
          >
            <span className="inst block text-dim">Next · {next.label}</span>
            <span className="mt-1 block group-hover:text-accent">{next.title}</span>
          </Link>
        )}
      </nav>
      <ChapterKeys prev={prev?.href} next={next?.href} />
    </>
  );
}
