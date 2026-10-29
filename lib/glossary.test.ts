import { describe, it, expect } from "vitest";
import { getAllBookChapters } from "./docs";
import { BOOKS } from "./books";
import { MAX_DESCRIPTION } from "./metadata";
import { MAX_TITLE, glossaryIndex, glossaryPartDescription, glossaryPartTitle, glossaryParts, isGlossary } from "./glossary";

const glossaries = getAllBookChapters().filter(isGlossary);

describe("glossaries", () => {
  it("finds every book's glossary", () => {
    expect(glossaries.length).toBeGreaterThan(0);
  });

  it("splits each glossary into its parts, keeping every term and the References", () => {
    for (const glossary of glossaries) {
      const { parts, references } = glossaryParts(glossary);
      expect(parts.length, glossary.slug).toBeGreaterThan(1);
      expect(references.startsWith("## References"), glossary.slug).toBe(true);
      const terms = (glossary.content.match(/^- \*\*/gm) ?? []).length;
      expect(parts.reduce((sum, p) => sum + p.terms, 0), glossary.slug).toBe(terms);
      expect(new Set(parts.map((p) => p.slug)).size, glossary.slug).toBe(parts.length);
    }
  });

  it("keeps each part small enough to serve as one page", () => {
    // The largest part rendered at ~260 KB of HTML from ~68 KB of Markdown.
    for (const glossary of glossaries) {
      for (const part of glossaryParts(glossary).parts) {
        expect(part.content.length, `${glossary.slug}/${part.slug}`).toBeLessThan(80_000);
      }
    }
  });

  it("gives every part a description that fits", () => {
    for (const glossary of glossaries) {
      const book = BOOKS.find((b) => b.slug === glossary.section)!;
      for (const part of glossaryParts(glossary).parts) {
        const d = glossaryPartDescription(book.name, part);
        expect(d.length, `${glossary.slug}/${part.slug}: ${d}`).toBeLessThanOrEqual(MAX_DESCRIPTION);
      }
    }
  });

  it("gives every part a unique title that names its book and fits", () => {
    const titles = new Set<string>();
    for (const glossary of glossaries) {
      const book = BOOKS.find((b) => b.slug === glossary.section)!;
      for (const part of glossaryParts(glossary).parts) {
        const title = `${glossaryPartTitle(book, part)} - syntaqx`;
        expect(title.length, title).toBeLessThanOrEqual(MAX_TITLE);
        expect(titles.has(title), title).toBe(false);
        titles.add(title);
      }
    }
  });

  it("lists every part on the glossary's own page, without the terms", () => {
    for (const glossary of glossaries) {
      const index = glossaryIndex(glossary);
      for (const part of glossaryParts(glossary).parts) {
        expect(index, glossary.slug).toContain(`(/books/${glossary.slug}/${part.slug})`);
      }
      expect(index).not.toMatch(/^- \*\*/m);
    }
  });
});
