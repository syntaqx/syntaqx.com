import { getAllBookChapters, type DocData } from "@/lib/docs";

/** A Markdown link to a doc, e.g. `](/docs/money/amounts#rounding)`: captures the slug. */
const DOC_LINK = /\]\(\/docs\/([^)#?\s]+)/g;

export interface Citation {
  chapter: DocData;
  /** How many times the chapter links the doc. */
  links: number;
}

let index: Map<string, Citation[]> | undefined;

/** Every chapter that links each doc, keyed by the doc's slug. */
function citationIndex(): Map<string, Citation[]> {
  if (index) return index;
  index = new Map();
  for (const chapter of getAllBookChapters()) {
    const counts = new Map<string, number>();
    for (const [, slug] of chapter.content.matchAll(DOC_LINK)) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
    for (const [slug, links] of counts) {
      index.set(slug, [...(index.get(slug) ?? []), { chapter, links }]);
    }
  }
  return index;
}

/**
 * The book chapters that cite a doc, for its "In the books" list: the chapter
 * that leans on it most from each book first, so one book can't fill the list,
 * then the rest by the same measure. Also the totals, for "and N more".
 */
export function bookCitations(docSlug: string, limit = 6) {
  const all = citationIndex().get(docSlug) ?? [];
  const ranked = [...all].sort(
    (a, b) => b.links - a.links || a.chapter.slug.localeCompare(b.chapter.slug),
  );
  const seen = new Set<string>();
  const firsts = ranked.filter((c) => !seen.has(c.chapter.section) && seen.add(c.chapter.section));
  const rest = ranked.filter((c) => !firsts.includes(c));
  return {
    chapters: [...firsts, ...rest].slice(0, limit).map((c) => c.chapter),
    total: all.length,
    books: seen.size,
  };
}
