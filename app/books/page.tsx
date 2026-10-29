import Link from "next/link";
import { getBookChapters } from "@/lib/docs";
import { BOOKS, BOOK_TYPES, CONSIDERING_BOOKS, UPCOMING_BOOKS, formatMinutes, type BookType } from "@/lib/books";
import { BookCards, type BookCard } from "@/components/book-cards";
import { DocsHeader } from "@/components/docs-header";
import { JsonLd } from "@/components/json-ld";
import { itemList } from "@/lib/schema";
import { markdownAlternates, pageMetadata } from "@/lib/metadata";

export const metadata = {
  ...pageMetadata(
    "/books",
    "Books",
    "Long reads that apply the playbook to one subject at a time: how an industry's rules, money and regulators shape the systems you build.",
  ),
  alternates: markdownAlternates("/books"),
};

function SectionHead({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border pb-3">
      <h2 className="eyebrow">{title}</h2>
      <span className="inst text-dim">{count}</span>
    </div>
  );
}

/** Every book, grouped by type, then the ones still to come and the ones I'm weighing. */
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
          const written = BOOKS.filter((b) => b.type === type);
          const cards: BookCard[] = [
            ...written.map((book) => {
              const chapters = getBookChapters(book.slug);
              const minutes = chapters.reduce((sum, c) => sum + c.readingMinutes, 0);
              return {
                href: `/books/${book.slug}`,
                cover: book.cover,
                eyebrow: `${chapters.length} chapters · ${formatMinutes(minutes)} read`,
                name: book.name,
                summary: book.summary,
              };
            }),
            ...UPCOMING_BOOKS.filter((b) => b.type === type).map((b) => ({ cover: b.cover, eyebrow: "Soon", name: b.name, summary: b.summary })),
          ];
          return (
            <section key={type} id={type} className="scroll-mt-24">
              <SectionHead title={BOOK_TYPES[type]} count={written.length} />
              <BookCards books={cards} />
            </section>
          );
        })}

        {CONSIDERING_BOOKS.length > 0 && (
          <section id="considering" className="scroll-mt-24">
            <SectionHead title="Considering" count={CONSIDERING_BOOKS.length} />
            <p className="-mt-2 mb-6 max-w-3xl text-sm text-dim">
              Industries I might write next, each with its own ledger and rules. One moves up to Soon once I commit to it.
            </p>
            <BookCards books={CONSIDERING_BOOKS.map((b) => ({ eyebrow: "Considering", name: b.name, summary: b.summary }))} />
          </section>
        )}
      </div>
    </article>
  );
}
