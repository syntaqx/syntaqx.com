import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { docFirstPublished, docLastModified } from "@/lib/doc-dates";
import { getBookChapters } from "@/lib/docs";
import { BOOKS, getBook } from "@/lib/books";
import { glossaryPartDescription as description, glossaryParts, isGlossary } from "@/lib/glossary";
import { titleIn } from "@/lib/metadata";
import { bookRef } from "@/lib/schema";
import { DocArticle } from "@/components/doc-article";

interface Props {
  params: Promise<{ book: string; part: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return BOOKS.flatMap((book) => {
    const glossary = getBookChapters(book.slug).find(isGlossary);
    return glossary ? glossaryParts(glossary).parts.map((p) => ({ book: book.slug, part: p.slug })) : [];
  });
}

async function find(params: Props["params"]) {
  const { book: bookSlug, part: partSlug } = await params;
  const book = getBook(bookSlug);
  const glossary = getBookChapters(bookSlug).find(isGlossary);
  if (!book || !glossary) return undefined;
  const { parts } = glossaryParts(glossary);
  const index = parts.findIndex((p) => p.slug === partSlug);
  return index >= 0 ? { book, glossary, parts, index, part: parts[index] } : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await find(params);
  if (!found) return {};
  const { book, glossary, part } = found;

  const title = `${part.title} Glossary`;
  const image = { url: `/og/books/${glossary.slug}`, width: 1200, height: 630, alt: glossary.title };
  return {
    title: titleIn(title, book.name),
    description: description(book.name, part),
    openGraph: {
      title,
      description: description(book.name, part),
      url: `/books/${glossary.slug}/${part.slug}`,
      type: "article",
      images: [image],
    },
    twitter: { card: "summary_large_image", creator: "@syntaqx", images: [image] },
  };
}

/** One part of a book's glossary; previous and next walk the parts, starting from the glossary's page. */
export default async function GlossaryPartPage({ params }: Props) {
  const found = await find(params);
  if (!found) notFound();
  const { book, glossary, parts, index, part } = found;

  const cover = `/books/${book.slug}`;
  const home = `/books/${glossary.slug}`;
  const path = `${home}/${part.slug}`;
  const neighbor = (p: (typeof parts)[number] | undefined) =>
    p && { href: `${home}/${p.slug}`, label: "Glossary", title: p.title };

  return (
    <DocArticle
      doc={{
        ...glossary,
        title: `${part.title} Glossary`,
        description: description(book.name, part),
        content: part.content,
        readingMinutes: part.readingMinutes,
      }}
      path={path}
      source={`content/books/${glossary.slug}.md`}
      published={docFirstPublished(glossary.slug, "books")}
      modified={docLastModified(glossary.slug, "books")}
      isPartOf={bookRef(book.name, cover)}
      crumbs={[
        { name: "Books", path: "/books" },
        { name: book.name, path: cover },
        { name: glossary.title, path: home },
        { name: part.title, path },
      ]}
      eyebrow={
        <>
          <Link href={cover} className="text-accent transition-colors hover:text-foreground">
            {book.name}
          </Link>
          <span aria-hidden> · </span>
          <Link href={home} className="text-accent transition-colors hover:text-foreground">
            {glossary.title}
          </Link>
          <span aria-hidden> · </span>
          Part {index + 1} of {parts.length}
        </>
      }
      prev={index === 0 ? { href: home, label: book.name, title: glossary.title } : neighbor(parts[index - 1])}
      next={neighbor(parts[index + 1])}
    />
  );
}
