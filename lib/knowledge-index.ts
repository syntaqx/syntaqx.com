/**
 * The search index behind lib/knowledge: every h2/h3 section of the
 * playbook, posts and books, with BM25 postings.
 *
 * `npm run build` writes it to .generated/knowledge (scripts/knowledge-index.mts)
 * so production loads it from disk instead of building it on a cold start.
 * Anywhere else, or if the files are missing, it is built in memory on first
 * use (about 1.3s locally).
 */

import fs from "node:fs";
import path from "node:path";
import { getAllBookChapters, getAllDocs } from "@/lib/docs";
import { getAllPosts, slugifyTag } from "@/lib/posts";

/**
 * What a section is, which decides how it may be quoted:
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

export const isOpinion = (s: Pick<Section, "kind" | "heading">) =>
  s.kind !== "book" || /^My Default/.test(s.heading);

const STOPWORDS = new Set(
  "a an and are as at be best but by can do does for from has have how i if in into is it its me my of on or should so that the their then there these this to use using vs was we what when where which while who why will with would you your".split(
    " ",
  ),
);

/**
 * Spellings of one thing that should match each other. Each canonical form
 * maps to itself too, so the plural fold never turns "postgres" into
 * "postgre" or "kubernetes" into "kubernete".
 */
const ALIASES: Record<string, string> = {
  postgres: "postgres",
  postgresql: "postgres",
  kubernetes: "kubernetes",
  k8s: "kubernetes",
  mongodb: "mongodb",
  mongo: "mongodb",
  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  ts: "typescript",
  node: "node",
  nodejs: "node",
  repo: "repository",
};

/** Plural to singular, loosely: "policies" → "policy", "webhooks" → "webhook". */
function fold(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

/** One word's index form: lowercase, aliases, else a light plural fold. */
export function normalize(word: string): string | null {
  const raw = word.toLowerCase();
  if (raw.length < 2 || STOPWORDS.has(raw)) return null;
  if (ALIASES[raw]) return ALIASES[raw];
  const folded = fold(raw);
  return ALIASES[folded] ?? folded;
}

/** Index terms for a text, so "Webhooks in PostgreSQL" finds "webhook" and "postgres". */
export function tokenize(text: string): string[] {
  const out: string[] = [];
  for (const word of text.match(/[a-z0-9]+/gi) ?? []) {
    const term = normalize(word);
    if (term) out.push(term);
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

export function collectSections(): Section[] {
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

export interface Postings {
  ids: Uint32Array;
  tfs: Float32Array;
}

export interface Index {
  sections: Section[];
  /** Body length in terms, per section, for BM25's length normalization. */
  lengths: Float32Array;
  avgLength: number;
  postings: Map<string, Postings>;
}

// Title and heading words count more than body words.
const TITLE_WEIGHT = 3;
const HEADING_WEIGHT = 2;

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

// ---------------------------------------------------------------------------
// On disk: meta.json (sections, terms and offsets) and postings.bin (every
// term's section ids, then their term frequencies, then section lengths), so
// loading is one JSON parse plus zero-copy typed-array views.
// ---------------------------------------------------------------------------

const FORMAT = 1;
export const INDEX_DIR = path.join(process.cwd(), ".generated", "knowledge");

interface Meta {
  format: number;
  avgLength: number;
  sections: Section[];
  terms: string[];
  /** offsets[i]..offsets[i + 1] is terms[i]'s slice of the postings. */
  offsets: number[];
}

export function writeIndex(idx: Index, dir = INDEX_DIR): { meta: number; postings: number } {
  const terms = [...idx.postings.keys()];
  const offsets = [0];
  for (const t of terms) offsets.push(offsets.at(-1)! + idx.postings.get(t)!.ids.length);
  const total = offsets.at(-1)!;
  const ids = new Uint32Array(total);
  const tfs = new Float32Array(total);
  terms.forEach((t, i) => {
    const p = idx.postings.get(t)!;
    ids.set(p.ids, offsets[i]);
    tfs.set(p.tfs, offsets[i]);
  });
  const meta: Meta = {
    format: FORMAT,
    avgLength: idx.avgLength,
    sections: idx.sections,
    terms,
    offsets,
  };
  const json = JSON.stringify(meta);
  const bin = Buffer.concat([
    Buffer.from(ids.buffer),
    Buffer.from(tfs.buffer),
    Buffer.from(idx.lengths.buffer, idx.lengths.byteOffset, idx.lengths.byteLength),
  ]);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "meta.json"), json);
  fs.writeFileSync(path.join(dir, "postings.bin"), bin);
  return { meta: json.length, postings: bin.length };
}

/** The prebuilt index, or null when it is missing or from another format. */
export function loadIndex(dir = INDEX_DIR): Index | null {
  let meta: Meta;
  let bin: Buffer;
  try {
    meta = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8"));
    bin = fs.readFileSync(path.join(dir, "postings.bin"));
  } catch {
    return null;
  }
  if (meta.format !== FORMAT) return null;
  // Copy into a fresh, aligned buffer: a Buffer from readFileSync can sit at
  // an offset that isn't a multiple of 4 inside a shared pool.
  const buffer = new ArrayBuffer(bin.byteLength);
  new Uint8Array(buffer).set(bin);
  const total = meta.offsets.at(-1)!;
  const ids = new Uint32Array(buffer, 0, total);
  const tfs = new Float32Array(buffer, total * 4, total);
  const lengths = new Float32Array(buffer, total * 8, meta.sections.length);
  const postings = new Map<string, Postings>();
  meta.terms.forEach((t, i) => {
    const [from, to] = [meta.offsets[i], meta.offsets[i + 1]];
    postings.set(t, { ids: ids.subarray(from, to), tfs: tfs.subarray(from, to) });
  });
  return { sections: meta.sections, lengths, avgLength: meta.avgLength, postings };
}

let index: Index | null = null;

/** The index: prebuilt in production, built in memory otherwise. */
export function getIndex(): Index {
  return (index ??=
    (process.env.NODE_ENV === "production" ? loadIndex() : null) ?? buildIndex(collectSections()));
}
