import { getBookChapters } from "@/lib/docs";
import { getBook } from "@/lib/books";
import { CDN_CACHED, ogCard } from "@/lib/og-card";

// The social preview for each book chapter, the docs' card with the book and
// chapter number as its kicker. A route handler, like /og/docs.

// Rendered on first request and held by the CDN, not built: prerendering
// every card cost the build most of its time. Unknown slugs 404 below.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ book: string; chapter: string }> },
) {
  const { book: bookSlug, chapter: chapterSlug } = await params;
  const book = getBook(bookSlug);
  const chapters = getBookChapters(bookSlug);
  const index = chapters.findIndex((c) => c.slug === `${bookSlug}/${chapterSlug}`);
  if (!book || index < 0) return new Response("Not found", { status: 404 });
  const chapter = chapters[index];

  return ogCard(
    {
      kicker: `${book.name}  ·  Chapter ${String(index + 1).padStart(2, "0")}`,
      title: chapter.title,
      description: chapter.description,
      scene: book.cover,
      path: `/books/${chapter.slug}`,
      stat: chapter.part,
    },
    CDN_CACHED,
  );
}
