/**
 * Search over everything the site publishes, for the MCP server (and later
 * ask.syntaqx.com): the playbook, posts and books, ranked by section with
 * BM25 plus a few signals for the questions people actually ask, and
 * either-or questions ("postgres or mongodb") above all:
 *
 * - Coverage: a section that matches more of the query's words ranks higher.
 * - Comparison: a section that discusses every option beats one that
 *   discusses only one, and each option keeps at least one result.
 * - Decisions: for a "which should I use" question, sections written as a
 *   decision (My Default, Choosing, X or Y, Alternatives) rank higher.
 * - Titles: a page whose title names the topic beats one that mentions it.
 *
 * For a comparison, search also reports how much the writing covers each
 * option, so a client can say "Chase hasn't written about MongoDB" instead of
 * stretching a passing mention into an opinion.
 */

import {
  KINDS,
  getIndex,
  isOpinion,
  normalize,
  tokenize,
  type Index,
  type Kind,
  type Section,
} from "@/lib/knowledge-index";
import { BOOKS } from "@/lib/books";
import { renderMarkdownPage } from "@/lib/markdown";
import { SITE_URL } from "@/lib/constants";

export { KINDS, isOpinion, tokenize, type Kind, type Section };

export interface SearchResult {
  kind: Kind;
  title: string;
  heading: string;
  url: string;
  path: string;
  anchor: string;
  book?: string;
  /** Chase's own view: the playbook, posts, and a book's "My Default" sections. */
  opinion: boolean;
  /** For a comparison: the options this section discusses. */
  covers?: string[];
  snippet: string;
  score: number;
}

export interface Comparison {
  options: { option: string; sections: number }[];
  /** Sections that discuss every option. */
  together: number;
  /** Of those, how many are Chase's own view rather than reference. */
  opinionsTogether: number;
  /** Plain-language caveat for the client to pass on, when there is one. */
  note?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  comparison?: Comparison;
}

// The playbook and posts are what this exists for; the books are ~90% of the
// words, so without a nudge they crowd out the opinions on shared topics.
const KIND_BOOST: Record<Kind, number> = { playbook: 1.3, post: 1.2, book: 1 };
/** A section that matches every query word scores up to this much more. */
const COVERAGE_BOOST = 1;
/** A section that discusses every option scores up to this much more. */
const COMPARISON_BOOST = 1.5;
const DECISION_BOOST = 0.4;
const TITLE_BOOST = 0.6;
const MAX_PER_PAGE = 2;
const K1 = 1.2;
const B = 0.75;

const DECISION_QUERY =
  /\b(or|vs\.?|versus|should|which|choose|choosing|pick|default|defaults|recommend|recommended|better|best|prefer)\b/i;
const DECISION_HEADING =
  /\b(or|vs\.?|versus|choos(e|ing)|my defaults?|how i choose|when (not )?to|alternatives|trade-?offs?|side by side|compared|which|default)\b/i;
const OPTION_SPLIT = /\s*(?:,|\bor\b|\bvs\.?(?=\s|$)|\bversus\b|\s\/\s)\s*/i;

export interface ParsedQuery {
  terms: string[];
  /** Two or more options for an either-or question, each with its own terms. */
  options: { label: string; terms: string[] }[];
  decision: boolean;
}

/**
 * Split "should I use postgres or a message broker" into its options. Words
 * shared by every option ("continuous" in "continuous delivery vs continuous
 * deployment") are context, not what tells the options apart.
 */
export function parseQuery(query: string): ParsedQuery {
  const terms = [...new Set(tokenize(query))];
  const decision = DECISION_QUERY.test(query);
  if (!/\b(or|vs\.?|versus)\b|\s\/\s/i.test(query)) return { terms, options: [], decision };
  const segments = query
    .split(OPTION_SPLIT)
    .map((s) => s.trim())
    .filter(Boolean);
  const segmentTerms = segments.map((s) => new Set(tokenize(s)));
  const options = segments
    .map((segment, i) => {
      const own = [...segmentTerms[i]].filter((t) =>
        segmentTerms.every((other, j) => j === i || !other.has(t)),
      );
      const words = (segment.match(/[a-z0-9]+/gi) ?? []).filter((w) => {
        const t = normalize(w);
        return t !== null && own.includes(t);
      });
      return { label: words.join(" "), terms: own };
    })
    .filter((o) => o.terms.length > 0);
  return { terms, options: options.length >= 2 ? options : [], decision };
}

/** Plain text around the first query term, for a result's snippet. */
function snippet(text: string, terms: string[], size = 280): string {
  const plain = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<!--[\s\S]*?-->/g, " ")
    // Tables: drop the |---|---| rule, and let cells read as a list.
    .replace(/^\s*\|?[\s:|-]*-{3,}[\s:|-]*$/gm, " ")
    .replace(/[ \t]*\|[ \t]*/g, " · ")
    .replace(/^ · | · $/gm, "")
    .replace(/[`*_>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const lower = plain.toLowerCase();
  let at = -1;
  for (const t of terms) {
    const i = lower.indexOf(t);
    if (i !== -1 && (at === -1 || i < at)) at = i;
  }
  const start = Math.max(0, at - 80);
  const cut = plain.slice(start, start + size);
  return `${start > 0 ? "…" : ""}${cut}${start + size < plain.length ? "…" : ""}`;
}

export interface SearchOptions {
  kinds?: readonly Kind[];
  /** Only this book's chapters (implies kind "book"). */
  book?: string;
  limit?: number;
}

/**
 * Sections that mention an option, with how often. A section mentions it when
 * it contains at least half its terms, so "managed containers" needs both
 * words, and "message broker for background jobs" needs two of its four.
 */
function containing(idx: Index, terms: string[]): Map<number, number> {
  const hits = new Map<number, { terms: number; count: number }>();
  for (const t of terms) {
    const list = idx.postings.get(t);
    if (!list) continue;
    list.ids.forEach((id, i) => {
      const hit = hits.get(id) ?? { terms: 0, count: 0 };
      hits.set(id, { terms: hit.terms + 1, count: hit.count + list.tfs[i] });
    });
  }
  const need = Math.ceil(terms.length / 2);
  return new Map(
    [...hits].filter(([, h]) => h.terms >= need).map(([id, h]) => [id, h.count] as const),
  );
}

/**
 * A section weighs an option, rather than naming it in passing (a list of
 * database adapters, say), when it mentions it at least twice, or names it at
 * all in a section written as a decision (My Defaults, Choosing, X or Y).
 */
const DISCUSSES = 2;
const isDecision = (s: Section) =>
  DECISION_HEADING.test(s.heading) || /^My Default/.test(s.heading);
const weighs = (idx: Index, id: number, mentions: number | undefined) =>
  mentions !== undefined && (mentions >= DISCUSSES || isDecision(idx.sections[id]));

export function searchDetailed(
  query: string,
  { kinds = KINDS, book, limit = 8 }: SearchOptions = {},
  idx: Index = getIndex(),
): SearchResponse {
  const { terms, options, decision } = parseQuery(query);
  if (!terms.length) return { results: [] };
  const allowed = new Set<Kind>(book ? ["book"] : kinds);
  const inScope = (id: number) => {
    const s = idx.sections[id];
    return allowed.has(s.kind) && (!book || s.book === book);
  };

  // BM25, counting how many query terms each section matched.
  const n = idx.sections.length;
  const bm25 = new Map<number, number>();
  const matched = new Map<number, number>();
  for (const term of terms) {
    const list = idx.postings.get(term);
    if (!list) continue;
    const idf = Math.log(1 + (n - list.ids.length + 0.5) / (list.ids.length + 0.5));
    for (let i = 0; i < list.ids.length; i++) {
      const id = list.ids[i];
      if (!inScope(id)) continue;
      const tf = list.tfs[i];
      const norm = tf + K1 * (1 - B + (B * idx.lengths[id]) / idx.avgLength);
      bm25.set(id, (bm25.get(id) ?? 0) + (idf * tf * (K1 + 1)) / norm);
      matched.set(id, (matched.get(id) ?? 0) + 1);
    }
  }

  const optionSets = options.map((o) => containing(idx, o.terms));
  const covers = (id: number) =>
    options.filter((_, i) => optionSets[i].has(id)).map((o) => o.label);

  const scored = [...bm25].map(([id, base]) => {
    const s = idx.sections[id];
    let score = base * KIND_BOOST[s.kind];
    score *= 1 + COVERAGE_BOOST * ((matched.get(id)! - 1) / Math.max(terms.length - 1, 1));
    if (options.length) {
      score *= 1 + COMPARISON_BOOST * ((covers(id).length - 1) / (options.length - 1));
    }
    if (decision && isDecision(s)) {
      score *= 1 + DECISION_BOOST;
    }
    const title = new Set(tokenize(s.title));
    score *= 1 + TITLE_BOOST * (terms.filter((t) => title.has(t)).length / terms.length);
    return { id, score };
  });
  scored.sort((a, b) => b.score - a.score);

  // At most two sections per page, so one long page can't fill the list;
  // read the page for the rest.
  const perPage = new Map<string, number>();
  const ranked = scored.filter(({ id }) => {
    const path = idx.sections[id].path;
    const count = (perPage.get(path) ?? 0) + 1;
    perPage.set(path, count);
    return count <= MAX_PER_PAGE;
  });
  const top = ranked.slice(0, limit);

  // Every option keeps a result, so one well-covered option can't hide the
  // other: swap the weakest result for the best section on a missing option.
  options.forEach((_, i) => {
    if (top.some(({ id }) => optionSets[i].has(id))) return;
    const best = ranked.find(({ id }) => optionSets[i].has(id) && !top.some((t) => t.id === id));
    if (best && top.length >= limit) top[top.length - 1] = best;
    else if (best) top.push(best);
  });

  const results = top.map(({ id, score }): SearchResult => {
    const s = idx.sections[id];
    return {
      kind: s.kind,
      title: s.title,
      heading: s.heading,
      url: `${SITE_URL}${s.path}${s.anchor ? `#${s.anchor}` : ""}`,
      path: s.path,
      anchor: s.anchor,
      ...(s.book ? { book: s.book } : {}),
      opinion: isOpinion(s),
      ...(options.length ? { covers: covers(id) } : {}),
      snippet: snippet(s.text, terms),
      score: Math.round(score * 100) / 100,
    };
  });

  if (!options.length) return { results };
  return { results, comparison: compare(idx, options, optionSets, inScope) };
}

function compare(
  idx: Index,
  options: ParsedQuery["options"],
  optionSets: Map<number, number>[],
  inScope: (id: number) => boolean,
): Comparison {
  const counts = optionSets.map((set) => [...set.keys()].filter(inScope));
  // Together means weighing each option, not naming one in passing.
  const both = counts[0].filter((id) => optionSets.every((set) => weighs(idx, id, set.get(id))));
  const together = both.length;
  const opinionsTogether = both.filter((id) => isOpinion(idx.sections[id])).length;
  const summary = options.map((o, i) => ({ option: o.label, sections: counts[i].length }));
  const labels = options.map((o) => o.label);
  const missing = summary.filter((o) => o.sections === 0).map((o) => o.option);
  const thin = summary.filter((o) => o.sections > 0 && o.sections <= 2).map((o) => o.option);
  let note: string | undefined;
  if (missing.length) {
    note = `Chase's writing doesn't mention ${list(missing, "or")}, so it has no view on ${missing.length > 1 ? "them" : "it"}.`;
  } else if (!together) {
    note = `No section weighs ${list(labels, "and")} together; the results cover each separately.`;
  } else if (!opinionsTogether) {
    note = `Only reference material (the books) compares ${list(labels, "and")}; none of Chase's own opinion sections do, so don't present a book's comparison as his view.`;
  } else if (thin.length) {
    note = `Chase's writing mentions ${list(thin, "and")} only in passing (${thin.length > 1 ? "a section or two each" : "a section or two"}).`;
  }
  return { options: summary, together, opinionsTogether, ...(note ? { note } : {}) };
}

const list = (items: string[], joiner: "and" | "or") =>
  items.length < 3
    ? items.join(` ${joiner} `)
    : `${items.slice(0, -1).join(", ")} ${joiner} ${items.at(-1)}`;

export function search(query: string, options?: SearchOptions, idx?: Index): SearchResult[] {
  return searchDetailed(query, options, idx).results;
}

/** The book slugs search can filter on. */
export const BOOK_SLUGS = BOOKS.map((b) => b.slug);

/** A site path from a path or a syntaqx.com URL, with any #anchor split off. */
export function parseTarget(target: string): { path: string; anchor: string } {
  let rest = target.trim();
  const url = rest.match(/^https?:\/\/(?:www\.)?syntaqx\.com(\/[^?]*)?(?:\?[^#]*)?(#.*)?$/i);
  if (url) rest = `${url[1] ?? "/"}${url[2] ?? ""}`;
  const [path, anchor = ""] = rest.split("#");
  return { path: `/${path.replace(/^\/+/, "").replace(/\.md$/, "")}`, anchor };
}

export type ReadResult = { ok: true; markdown: string } | { ok: false; message: string };

/**
 * A page as Markdown, or one section of it when `anchor` names a heading.
 * Pages are whatever /md serves: docs, chapters, posts and the indexes.
 */
export function read(path: string, anchor = ""): ReadResult {
  const page = renderMarkdownPage(path);
  if (page.status !== 200) {
    return { ok: false, message: `No page at ${path}. Use search to find one.` };
  }
  if (!anchor) return { ok: true, markdown: page.body };
  const section = getIndex().sections.find((s) => s.path === path && s.anchor === anchor);
  if (!section) {
    return {
      ok: false,
      message: `No section #${anchor} on ${path}. Read the page without a section to see its headings.`,
    };
  }
  return {
    ok: true,
    markdown: `# ${section.title}\n\n## ${section.heading}\n\n${section.text}\n\nSource: ${SITE_URL}${path}#${anchor}\n`,
  };
}
