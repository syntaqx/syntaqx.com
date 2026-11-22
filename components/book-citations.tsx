import Link from "next/link";
import { getBook } from "@/lib/books";
import { bookCitations } from "@/lib/book-citations";

/**
 * At the foot of a doc: the book chapters that build on it, so readers (and
 * crawlers) who land on the doc find where it's applied. Nothing when no
 * chapter cites it.
 */
export function BookCitations({ docSlug }: { docSlug: string }) {
  const { chapters, total, books } = bookCitations(docSlug);
  if (!chapters.length) return null;
  const more = total - chapters.length;
  return (
    <section data-pagefind-ignore aria-labelledby="in-the-books" className="mt-16">
      <h2 id="in-the-books" className="inst text-muted-foreground">
        In the books
      </h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {chapters.map((chapter) => (
          <li key={chapter.slug}>
            <Link
              href={`/books/${chapter.slug}`}
              className="group block h-full border border-border p-4 transition-colors hover:border-primary"
            >
              <span className="inst block text-muted-foreground">
                {getBook(chapter.section)?.name ?? chapter.section}
              </span>
              <span className="mt-1 block group-hover:text-primary">{chapter.title}</span>
            </Link>
          </li>
        ))}
      </ul>
      {more > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Cited by {total} chapters across {books} {books === 1 ? "book" : "books"}.
        </p>
      )}
    </section>
  );
}
