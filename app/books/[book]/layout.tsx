import { notFound } from "next/navigation";
import { getBookChapters } from "@/lib/docs";
import { bookParts, getBook } from "@/lib/books";
import { BookSidebar, MobileBookSidebar } from "@/components/book-sidebar";

/** A book's cover and chapters, beside the book's own table of contents. */
export default async function BookLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ book: string }>;
}) {
  const { book: slug } = await params;
  const book = getBook(slug);
  if (!book) notFound();

  // Only what the sidebar shows crosses to the client, not each chapter's text.
  const parts = bookParts(getBookChapters(slug)).map((part) => ({
    title: part.title,
    docs: part.docs.map(({ slug, navTitle }) => ({ slug, navTitle })),
  }));
  const sidebar = { book: { slug: book.slug, name: book.name }, parts };

  return (
    <div className="lg:grid lg:grid-cols-[248px_1fr] lg:gap-10">
      <aside className="hidden lg:block">
        <div className="rail-scroll sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto pr-3">
          <BookSidebar {...sidebar} />
        </div>
      </aside>
      <div className="min-w-0">
        <MobileBookSidebar {...sidebar} />
        {children}
      </div>
    </div>
  );
}
