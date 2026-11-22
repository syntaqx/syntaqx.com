import { describe, expect, it } from "vitest";
import { bookCitations } from "./book-citations";

describe("bookCitations", () => {
  it("lists one chapter per book before a second from any book", () => {
    const { chapters, total, books } = bookCitations("money/amounts");
    expect(chapters.length).toBe(6);
    expect(total).toBeGreaterThan(chapters.length);
    const firstBooks = chapters.slice(0, Math.min(books, 6)).map((c) => c.section);
    expect(new Set(firstBooks).size).toBe(firstBooks.length);
  });

  it("finds nothing for a doc no chapter links", () => {
    expect(bookCitations("no/such-doc")).toEqual({ chapters: [], total: 0, books: 0 });
  });
});
