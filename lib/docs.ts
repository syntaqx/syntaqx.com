import fs from "fs";
import path from "path";
import { estimateReadingTime } from "@/lib/posts";

const docsDirectory = path.join(process.cwd(), "content/docs");
const booksDirectory = path.join(process.cwd(), "content/books");

/**
 * A doc, or a book's chapter: books read the same Markdown the same way, from
 * content/books instead of content/docs.
 */
export interface DocData {
  /**
   * Path under /docs (or /books), e.g. "payments/idempotency": the section
   * folder, then the file. A book's folder is the book's slug.
   */
  slug: string;
  /** Short label for sidebars: frontmatter `nav_title`, or the title. */
  navTitle: string;
  /** The section folder ("payments"), or "" for a doc at the root. */
  section: string;
  /** Former slugs, permanently redirected to this doc. */
  aliases: string[];
  title: string;
  description: string;
  category: string;
  order: number;
  /** A book chapter's part of the book, e.g. "How Money Moves". */
  part?: string;
  tags: string[];
  /** Minutes to read, not counting code or the References list. */
  readingMinutes: number;
  content: string;
}

export interface DocCategory {
  name: string;
  /** The section folder, also the category's anchor on /docs. */
  section: string;
  docs: DocData[];
}

/** Parse +++ TOML frontmatter */
function parseTomlFrontmatter(fileContents: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const match = fileContents.match(
    /^\+\+\+\s*\n([\s\S]*?)\n\+\+\+\s*\n?([\s\S]*)$/,
  );
  if (!match) return { data: {}, content: fileContents };

  const raw = match[1];
  const content = match[2];
  const data: Record<string, unknown> = {};

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    let value: string | string[] | number = trimmed.slice(eqIdx + 1).trim();

    // Array
    if (typeof value === "string" && value.startsWith("[")) {
      const arrayMatch = value.match(/\[([^\]]*)\]/);
      if (arrayMatch) {
        data[key] = arrayMatch[1]
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean);
        continue;
      }
    }

    // Quoted string
    if (typeof value === "string" && value.startsWith('"')) {
      value = value.replace(/^"|"$/g, "");
    }

    // Number
    if (typeof value === "string" && /^\d+$/.test(value)) {
      data[key] = parseInt(value, 10);
      continue;
    }

    data[key] = value;
  }

  return { data, content };
}

/**
 * Every Markdown file under a content directory, as POSIX paths relative to
 * it. One recursive read of a fixed directory, so the bundler traces only
 * content/ instead of the whole project.
 */
function markdownFiles(directory: string): string[] {
  return (fs.readdirSync(directory, { recursive: true }) as string[])
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.split(path.sep).join("/"));
}

export function getAllDocs(): DocData[] {
  return readDocs(docsDirectory);
}

/** Every book's chapters, in each book's order; a chapter's section is its book's slug. */
export function getAllBookChapters(): DocData[] {
  return readDocs(booksDirectory);
}

/** One book's chapters, in reading order. */
export function getBookChapters(book: string): DocData[] {
  return getAllBookChapters().filter((c) => c.section === book);
}

/**
 * A production build reads each content directory once per process: every
 * page, its metadata, layout and OG image ask for the chapters, and reading
 * all ~400 of them took ~180ms a time. Dev reads afresh so edits show at once.
 */
const docsCache = new Map<string, DocData[]>();

function readDocs(directory: string): DocData[] {
  const cached = docsCache.get(directory);
  if (cached) return cached;
  const docs = readDocsUncached(directory);
  if (process.env.NODE_ENV === "production") docsCache.set(directory, docs);
  return docs;
}

function readDocsUncached(directory: string): DocData[] {
  if (!fs.existsSync(directory)) return [];

  return markdownFiles(directory)
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const fileContents = fs.readFileSync(path.join(directory, file), "utf8");
      const { data, content } = parseTomlFrontmatter(fileContents);

      return {
        slug,
        // The folder path, hyphenated: "payments", or "a-b" for a nested one.
        section: slug.includes("/") ? slug.slice(0, slug.lastIndexOf("/")).replace(/\//g, "-") : "",
        aliases: (data.aliases as string[]) ?? [],
        title: (data.title as string) ?? slug,
        navTitle: (data.nav_title as string) ?? (data.title as string) ?? slug,
        description: (data.description as string) ?? "",
        category: (data.category as string) ?? "General",
        order: (data.order as number) ?? 99,
        part: data.part as string | undefined,
        tags: (data.tags as string[]) ?? [],
        readingMinutes: estimateReadingTime(content.split(/^## References$/m)[0]),
        content,
      };
    })
    .sort((a, b) => a.order - b.order);
}

export function getDocBySlug(slug: string): DocData | undefined {
  return getAllDocs().find((d) => d.slug === slug);
}

export function getDocsByCategory(): DocCategory[] {
  const docs = getAllDocs();
  const categoryMap = new Map<string, DocData[]>();

  for (const doc of docs) {
    const list = categoryMap.get(doc.category) || [];
    list.push(doc);
    categoryMap.set(doc.category, list);
  }

  return Array.from(categoryMap.entries()).map(([name, docs]) => ({
    name,
    section: docs[0].section || "start-here",
    docs,
  }));
}

// Same pipeline as posts, including h2 ids for the contents rail.
export { markdownToHtml } from "@/lib/posts";
