import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { getBookChapters } from "@/lib/docs";
import { Button } from "@/components/button";
import { DocsHeader } from "@/components/docs-header";
import { SceneArt } from "@/components/scene-art";
import { JsonLd } from "@/components/json-ld";
import { collectionPage } from "@/lib/schema";
import { BOOKS, bookParts, formatMinutes, getBook } from "@/lib/books";

interface Props {
  params: Promise<{ book: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return BOOKS.map((b) => ({ book: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = getBook((await params).book);
  if (!book) return {};
  const title = book.type === "industry" ? `${book.name} Industry` : book.name;
  return {
    title,
    description: book.summary,
    openGraph: { title, description: book.summary, url: `/books/${book.slug}`, siteName: "syntaqx", type: "website" },
  };
}

/** A book's cover: what it covers, how it reads, every chapter. */
export default async function BookCover({ params }: Props) {
  const slug = (await params).book;
  const book = getBook(slug);
  const chapters = getBookChapters(slug);
  if (!book || chapters.length === 0) notFound();

  const minutes = chapters.reduce((sum, d) => sum + d.readingMinutes, 0);
  const cover = `/books/${book.slug}`;

  return (
    <article>
      <JsonLd
        data={collectionPage({
          name: book.name,
          description: book.summary,
          path: cover,
          crumbs: [
            { name: "Books", path: "/books" },
            { name: book.name, path: cover },
          ],
          items: chapters.map((c) => ({ name: c.title, path: `/books/${c.slug}` })),
          book: true,
        })}
      />
      <DocsHeader
        title={book.name}
        eyebrow={
          <>
            <Link href="/books" className="text-accent transition-colors hover:text-foreground">
              Books
            </Link>
            <span aria-hidden> · </span>
            {chapters.length} chapters
            <span aria-hidden> · </span>
            {formatMinutes(minutes)} read
          </>
        }
      >
        <div className="grid gap-x-10 lg:grid-cols-[minmax(0,1fr)_13rem]">
          <div>
            <div className="max-w-3xl space-y-3 text-muted">
              {book.intro.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
            <div className="mt-5">
              <Button href={`/books/${chapters[0].slug}`}>
                Start reading
                <ArrowRight size={13} aria-hidden />
              </Button>
            </div>
          </div>
          <SceneArt scene={book.cover} label={`${book.name} cover art`} className="aspect-square self-start max-lg:hidden" />
        </div>
      </DocsHeader>

      {bookParts(chapters).map((part) => (
        <section key={part.title || "chapters"}>
          {part.title && <h2 className="inst border-b border-border pt-8 pb-3 text-[0.6rem] text-dim">{part.title}</h2>}
          <ol className="divide-y divide-border border-b border-border">
            {part.docs.map((doc) => {
              const i = chapters.indexOf(doc);
              return (
                <li key={doc.slug}>
                  <Link
                    href={`/books/${doc.slug}`}
                    className="group grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto]"
                  >
                    <span className="inst pt-1 text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block font-semibold text-foreground transition-colors group-hover:text-accent">
                        {doc.title}
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-dim">{doc.description}</span>
                    </span>
                    <span className="inst col-start-2 mt-2 text-dim sm:col-start-3 sm:mt-0 sm:pt-1">
                      {doc.readingMinutes} min
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </article>
  );
}
