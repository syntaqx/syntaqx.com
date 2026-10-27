import Link from "next/link";
import { getBookChapters } from "@/lib/docs";
import { BOOKS, BOOK_TYPES, UPCOMING_BOOKS, formatMinutes, type BookType } from "@/lib/books";
import { BookCards } from "@/components/book-cards";
import { DocsHeader } from "@/components/docs-header";
import { JsonLd } from "@/components/json-ld";
import { itemList } from "@/lib/schema";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "/books",
  "Books",
  "Long reads that apply the playbook to one subject at a time: how an industry's rules, money and regulators shape the systems you build.",
);

/** Every book, grouped by type, and the ones still to come. */
export default function BooksPage() {
  const types = (Object.keys(BOOK_TYPES) as BookType[]).filter(
    (type) => BOOKS.some((b) => b.type === type) || UPCOMING_BOOKS.some((b) => b.type === type),
  );

  return (
    <article>
      <JsonLd data={itemList("Books", "/books", BOOKS.map((b) => ({ name: b.name, path: `/books/${b.slug}` })))} />
      <DocsHeader eyebrow="Books" title="Books">
        <p className="max-w-3xl text-dim">
          The <Link href="/docs" className="text-foreground underline decoration-accent underline-offset-4 hover:text-accent">playbook</Link>{" "}
          applies anywhere. Each book takes one subject and follows it all the way down: how an industry&apos;s rules,
          its money and its regulators shape the engineering, building on the playbook&apos;s chapters.
        </p>
      </DocsHeader>

      <div className="space-y-16">
        {types.map((type) => {
          const books = BOOKS.filter((b) => b.type === type).map((book) => {
            const chapters = getBookChapters(book.slug);
            return {
              href: `/books/${book.slug}`,
              name: book.name,
              summary: book.summary,
              chapters: chapters.length,
              readingTime: formatMinutes(chapters.reduce((sum, c) => sum + c.readingMinutes, 0)),
            };
          });
          const upcoming = UPCOMING_BOOKS.filter((b) => b.type === type).map((b) => b.name);
          return (
            <section key={type} id={type} className="scroll-mt-24">
              <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border pb-3">
                <h2 className="eyebrow">{BOOK_TYPES[type]}</h2>
                <span className="inst text-dim">{books.length}</span>
              </div>
              <BookCards books={books} upcoming={upcoming} />
            </section>
          );
        })}
      </div>
    </article>
  );
}
