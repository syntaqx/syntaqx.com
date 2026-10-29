import { estimateReadingTime, slugifyTag } from "@/lib/posts";
import type { DocData } from "@/lib/docs";
import type { Book } from "@/lib/books";

/** Results pages cut titles off past about this many characters. */
export const MAX_TITLE = 65;

/**
 * A book's glossary is one Markdown file, grouped by part under `##`
 * headings. As one page the biggest ran to 1.4 MB of HTML, so each part is
 * served on its own page under /books/<book>/glossary/<part>, and the
 * glossary's own page keeps the intro, a list of the parts and the References.
 */

export interface GlossaryPart {
  title: string;
  /** The URL segment under /books/<book>/glossary/. */
  slug: string;
  /** The part's entries, as Markdown. */
  content: string;
  terms: number;
  readingMinutes: number;
}

export const isGlossary = (doc: DocData) => doc.slug.endsWith("/glossary");

/** The glossary's intro, its parts in order, and its References section (with heading). */
export function glossaryParts(doc: DocData): { intro: string; parts: GlossaryPart[]; references: string } {
  const [intro, ...sections] = doc.content.split(/^(?=## )/m);
  let references = "";
  const parts: GlossaryPart[] = [];
  for (const section of sections) {
    const title = section.slice(3, section.indexOf("\n")).trim();
    if (title === "References") {
      references = section;
      continue;
    }
    const content = section.slice(section.indexOf("\n") + 1);
    parts.push({
      title,
      slug: slugifyTag(title),
      content,
      terms: (content.match(/^- \*\*/gm) ?? []).length,
      readingMinutes: estimateReadingTime(content),
    });
  }
  return { intro, parts, references };
}

/** The glossary's own page: the intro, then a link to each part, then the References. */
export function glossaryIndex(doc: DocData): string {
  const { intro, parts, references } = glossaryParts(doc);
  const list = parts
    .map((p) => `- [${p.title}](/books/${doc.slug}/${p.slug}): ${p.terms} ${p.terms === 1 ? "term" : "terms"}`)
    .join("\n");
  return `${intro.trimEnd()}\n\n## Parts\n\n${list}\n\n${references}`;
}

/** A part's meta description. */
export function glossaryPartDescription(bookName: string, part: { title: string; terms: number }): string {
  return `${part.terms} terms from the ${bookName} book's ${part.title} part, each defined in a line and linked to the chapter that explains it.`;
}

/**
 * A part's page title: parts share names across books ("The Business",
 * "Running the Platform"), so it always names the book, by its short name if
 * the full one would run past MAX_TITLE with the site's " - syntaqx".
 */
export function glossaryPartTitle(book: Pick<Book, "name" | "shortName">, part: { title: string }): string {
  const title = (name: string) => `${part.title} Glossary · ${name}`;
  const full = title(book.name);
  return `${full} - syntaqx`.length > MAX_TITLE && book.shortName ? title(book.shortName) : full;
}
