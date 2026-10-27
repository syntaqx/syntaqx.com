import { OG_SIZE } from "@/lib/og";
import { ogCard } from "@/lib/og-card";
import { getBookChapters } from "@/lib/docs";
import { BOOKS, BOOK_TYPES, bookParts, getBook } from "@/lib/books";

export const alt = "A book from syntaqx";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return BOOKS.map((b) => ({ book: b.slug }));
}

export default async function Image({ params }: { params: Promise<{ book: string }> }) {
  const slug = (await params).book;
  const book = getBook(slug)!;
  const chapters = getBookChapters(slug);
  const parts = bookParts(chapters).filter((p) => p.title).length;
  return ogCard({
    kicker: `Books  ·  ${BOOK_TYPES[book.type].replace(/s$/, "")}`,
    title: book.name,
    description: book.summary,
    scene: "stack",
    path: `/books/${slug}`,
    stat: `${chapters.length} chapters${parts ? `  ·  ${parts} parts` : ""}`,
  });
}
