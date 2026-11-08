/**
 * Search over everything the site publishes, for the MCP server (and later
 * ask.syntaqx.com): the playbook, posts and books, split into sections at
 * their h2/h3 headings and ranked with BM25.
 *
 * The index is built in memory on first use (about 1.3s and 250MB over
 * ~12k sections) and kept for the life of the instance.
 */

import { getAllBookChapters, getAllDocs } from "@/lib/docs";
import { getAllPosts, slugifyTag } from "@/lib/posts";
import { BOOKS } from "@/lib/books";
import { renderMarkdownPage } from "@/lib/markdown";
import { SITE_URL } from "@/lib/constants";

/**
 * What a result is, which decides how it may be quoted:
 * - `playbook`: Chase's own defaults and opinions (/docs).
 * - `post`: Chase's essays (/posts).
 * - `book`: industry reference built from public sources (/books). It
 *   describes how an industry works; it is not Chase's opinion, except in a
 *   chapter's "My Default" section.
 */
export type Kind = "playbook" | "post" | "book";
export const KINDS: readonly Kind[] = ["playbook", "post", "book"];

export interface Section {
  kind: Kind;
  /** The page's site path, e.g. /docs/requests/idempotency. */
  path: string;
  /** The heading's anchor id, or "" for the text before the first heading. */
  anchor: string;
  title: string;
  heading: string;
  /** For books, the book's slug. */
  book?: string;
  text: string;
}

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
  snippet: string;
  score: number;
}

export const isOpinion = (s: Pick<Section, "kind" | "heading">) =>
  s.kind !== "book" || /^My Default/.test(s.heading);

const STOPWORDS = new Set(
  "a an and are as at be best but by can do does for from has have how i if in into is it its me my of on or should so that the their then there these this to use using vs was we what when where which while who why will with would you your".split(
    " ",
  ),
);

/** Lowercase word tokens with a light plural fold, so "webhooks" finds "webhook". */
export function tokenize(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.toLowerCase().match(/[a-z0-9]+/g) ?? []) {
    if (raw.length < 2 || STOPWORDS.has(raw)) continue;
    out.push(raw.length > 3 && raw.endsWith("s") && !raw.endsWith("ss") ? raw.slice(0, -1) : raw);
  }
  return out;
}

/** A heading's plain text, the way the rendered page sees it. */
function headingText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_]/g, "")
    .trim();
}

/**
 * Split a Markdown body at h2/h3 headings outside code fences. Anchors match
 * the ids the page gives its headings (see rehypeSectionIds in lib/posts).
 * The References section is left out: it is citations, not prose.
 */
export function splitSections(
  markdown: string,
): { heading: string; anchor: string; text: string }[] {
  const sections: { heading: string; anchor: string; text: string }[] = [];
  const seen = new Map<string, number>();
  let current = { heading: "", anchor: "", lines: [] as string[] };
  let fence = false;
  const flush = () => {
    const text = current.lines.join("\n").trim();
    if (text && current.heading !== "References") {
      sections.push({ heading: current.heading, anchor: current.anchor, text });
    }
  };
  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const match = !fence && line.match(/^(##|###) (.+)$/);
    if (match) {
      flush();
      const heading = headingText(match[2]);
      const base = slugifyTag(heading) || "section";
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      current = { heading, anchor: count ? `${base}-${count}` : base, lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  flush();
  return sections;
}

function collectSections(): Section[] {
  const sections: Section[] = [];
  const add = (kind: Kind, path: string, title: string, body: string, book?: string) => {
    for (const s of splitSections(body)) sections.push({ kind, path, title, book, ...s });
  };
  for (const d of getAllDocs()) add("playbook", `/docs/${d.slug}`, d.title, d.content);
  for (const p of getAllPosts()) add("post", `/posts/${p.slug}`, p.title, p.content);
  for (const c of getAllBookChapters()) {
    add("book", `/books/${c.slug}`, c.title, c.content, c.slug.split("/")[0]);
  }
  return sections;
}

interface Postings {
  ids: Uint32Array;
  tfs: Float32Array;
}

interface Index {
  sections: Section[];
  lengths: Float32Array;
  avgLength: number;
  postings: Map<string, Postings>;
}

// Title and heading words count more than body words.
const TITLE_WEIGHT = 3;
const HEADING_WEIGHT = 2;
// The playbook and posts are what this exists for; the books are ~90% of the
// words, so without a nudge they crowd out the opinions on shared topics.
const KIND_BOOST: Record<Kind, number> = { playbook: 1.3, post: 1.2, book: 1 };
const MAX_PER_PAGE = 2;
const K1 = 1.2;
const B = 0.75;

export function buildIndex(sections: Section[]): Index {
  const building = new Map<string, Map<number, number>>();
  const lengths = new Float32Array(sections.length);
  let total = 0;
  sections.forEach((s, id) => {
    const counts = new Map<string, number>();
    const bump = (text: string, weight: number) => {
      for (const t of tokenize(text)) counts.set(t, (counts.get(t) ?? 0) + weight);
    };
    bump(s.text, 1);
    // Length normalizes on the body only, so a long section's title words
    // still count (the BM25F idea, without per-field parameters).
    let length = 0;
    for (const tf of counts.values()) length += tf;
    bump(s.title, TITLE_WEIGHT);
    bump(s.heading, HEADING_WEIGHT);
    for (const [term, tf] of counts) {
      let list = building.get(term);
      if (!list) building.set(term, (list = new Map()));
      list.set(id, tf);
    }
    lengths[id] = length;
    total += length;
  });
  const postings = new Map<string, Postings>();
  for (const [term, list] of building) {
    postings.set(term, {
      ids: Uint32Array.from(list.keys()),
      tfs: Float32Array.from(list.values()),
    });
  }
  return { sections, lengths, avgLength: total / Math.max(sections.length, 1), postings };
}

let index: Index | null = null;
function getIndex(): Index {
  return (index ??= buildIndex(collectSections()));
}

/** Plain text around the first query term, for a result's snippet. */
function snippet(text: string, terms: string[], size = 280): string {
  const plain = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/[`*_>#|]/g, "")
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

export function search(
  query: string,
  { kinds = KINDS, book, limit = 8 }: SearchOptions = {},
  idx: Index = getIndex(),
): SearchResult[] {
  const terms = [...new Set(tokenize(query))];
  if (!terms.length) return [];
  const n = idx.sections.length;
  const scores = new Map<number, number>();
  for (const term of terms) {
    const list = idx.postings.get(term);
    if (!list) continue;
    const idf = Math.log(1 + (n - list.ids.length + 0.5) / (list.ids.length + 0.5));
    for (let i = 0; i < list.ids.length; i++) {
      const id = list.ids[i];
      const tf = list.tfs[i];
      const norm = tf + K1 * (1 - B + (B * idx.lengths[id]) / idx.avgLength);
      scores.set(id, (scores.get(id) ?? 0) + (idf * tf * (K1 + 1)) / norm);
    }
  }
  const allowed = new Set(book ? ["book"] : kinds);
  const perPage = new Map<string, number>();
  return (
    [...scores]
      .filter(([id]) => {
        const s = idx.sections[id];
        return allowed.has(s.kind) && (!book || s.book === book);
      })
      .map(([id, score]) => [id, score * KIND_BOOST[idx.sections[id].kind]] as const)
      .sort((a, b) => b[1] - a[1])
      // At most two sections per page, so one long page can't fill the list;
      // read the page for the rest.
      .filter(([id]) => {
        const path = idx.sections[id].path;
        const n = (perPage.get(path) ?? 0) + 1;
        perPage.set(path, n);
        return n <= MAX_PER_PAGE;
      })
      .slice(0, limit)
      .map(([id, score]) => {
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
          snippet: snippet(s.text, terms),
          score: Math.round(score * 100) / 100,
        };
      })
  );
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
