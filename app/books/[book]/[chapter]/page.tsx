import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { docLastModified } from "@/lib/doc-dates";
import { getAllBookChapters, getBookChapters } from "@/lib/docs";
import { getBook } from "@/lib/books";
import { ChapterCount, DocArticle } from "@/components/doc-article";

interface Props {
  params: Promise<{ book: string; chapter: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllBookChapters().map((c) => ({ book: c.section, chapter: c.slug.slice(c.section.length + 1) }));
}

async function find(params: Props["params"]) {
  const { book: bookSlug, chapter: chapterSlug } = await params;
  const book = getBook(bookSlug);
  const chapters = getBookChapters(bookSlug);
  const index = chapters.findIndex((c) => c.slug === `${bookSlug}/${chapterSlug}`);
  return book && index >= 0 ? { book, chapters, index, chapter: chapters[index] } : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await find(params);
  if (!found) return {};
  const { chapter } = found;

  const image = { url: `/og/books/${chapter.slug}`, width: 1200, height: 630, alt: chapter.title };
  const modified = docLastModified(chapter.slug, "books");
  return {
    title: chapter.title,
    description: chapter.description,
    openGraph: {
      title: chapter.title,
      description: chapter.description,
      url: `/books/${chapter.slug}`,
      type: "article",
      ...(modified && { modifiedTime: modified }),
      images: [image],
    },
    twitter: { card: "summary_large_image", creator: "@syntaqx", images: [image] },
  };
}

/** A book's chapter, in the docs' reading layout; previous and next stay within the book. */
export default async function ChapterPage({ params }: Props) {
  const found = await find(params);
  if (!found) notFound();
  const { book, chapters, index, chapter } = found;

  const cover = `/books/${book.slug}`;
  const neighbor = (c: (typeof chapters)[number] | undefined) =>
    c && { href: `/books/${c.slug}`, label: c.part ?? book.name, title: c.title };

  return (
    <DocArticle
      doc={chapter}
      path={`/books/${chapter.slug}`}
      source={`content/books/${chapter.slug}.md`}
      modified={docLastModified(chapter.slug, "books")}
      crumbs={[
        { name: "Books", path: "/books" },
        { name: book.name, path: cover },
        { name: chapter.title, path: `/books/${chapter.slug}` },
      ]}
      eyebrow={
        <>
          <Link href={cover} className="text-accent transition-colors hover:text-foreground">
            {book.name}
          </Link>
          <span aria-hidden> · </span>
          <ChapterCount index={index} total={chapters.length} />
        </>
      }
      prev={neighbor(chapters[index - 1])}
      next={neighbor(chapters[index + 1])}
    />
  );
}
