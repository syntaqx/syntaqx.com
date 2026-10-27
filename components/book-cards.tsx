import Link from "next/link";

export interface BookCard {
  href: string;
  name: string;
  summary: string;
  chapters: number;
  /** Total reading time, already formatted ("2 h 58 min"). */
  readingTime: string;
}

/** Each book as a card linking to its cover, then the ones still to come. */
export function BookCards({ books, upcoming }: { books: BookCard[]; upcoming: string[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {books.map((book) => (
        <li key={book.href}>
          <Link
            href={book.href}
            className="group block h-full border border-border p-5 transition-colors hover:border-accent"
          >
            <span className="inst block text-dim">
              {book.chapters} chapters · {book.readingTime} read
            </span>
            <span className="mt-2 block text-xl font-semibold text-foreground transition-colors group-hover:text-accent">
              {book.name}
            </span>
            <span className="mt-2 block text-sm leading-relaxed text-dim">{book.summary}</span>
          </Link>
        </li>
      ))}
      {upcoming.map((name) => (
        <li key={name} className="flex items-center justify-between border border-dashed border-border p-5 text-dim">
          {name}
          <span className="inst border border-border px-1.5 py-px text-[0.5rem]">Soon</span>
        </li>
      ))}
    </ul>
  );
}
