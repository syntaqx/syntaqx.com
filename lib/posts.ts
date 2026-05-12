import fs from "fs";
import path from "path";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeShiki from "@shikijs/rehype";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface PostData {
  slug: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  categories?: string[];
  images?: string[];
  content: string;
  readingTimeMinutes: number;
}

function estimateReadingTime(markdown: string): number {
  // Strip code fences and inline code so they don't inflate the count.
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ");
  const words = stripped.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** Parse Hugo-style +++ TOML frontmatter */
function parseTomlFrontmatter(fileContents: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const match = fileContents.match(/^\+\+\+\s*\n([\s\S]*?)\n\+\+\+\s*\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: fileContents };
  }

  const raw = match[1];
  const content = match[2];
  const data: Record<string, unknown> = {};

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;

    const key = trimmed.slice(0, eqIdx).trim();
    let value: string | string[] | boolean = trimmed.slice(eqIdx + 1).trim();

    // Multi-line string with backslash continuation
    if (typeof value === "string" && value.startsWith('"""')) {
      value = value.slice(3).replace(/"""$/, "").trim();
    }

    // Array of strings: ["a", "b"]
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
      value = value.replace(/^"|"$/g, "").replace(/\\"/g, '"');
      // Handle multi-line descriptions with backslash
      value = value.replace(/\\\s*$/, "").trim();
    }

    // Boolean
    if (value === "true") { data[key] = true; continue; }
    if (value === "false") { data[key] = false; continue; }

    // Date (ISO-like)
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      data[key] = value;
      continue;
    }

    data[key] = value;
  }

  return { data, content };
}

export function getPostSlugs(): string[] {
  return fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

function fileNameToSlug(fileName: string): string {
  // Hugo permalink was posts/:slug which strips the date prefix
  return fileName.replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

export function getAllPosts(): PostData[] {
  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith(".md"));

  return fileNames
    .map((fileName) => getPostByFileName(fileName))
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

function getPostByFileName(fileName: string): PostData {
  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = parseTomlFrontmatter(fileContents);

  const slug = fileNameToSlug(fileName.replace(/\.md$/, ""));

  return {
    slug,
    title: (data.title as string) ?? slug,
    date: (data.date as string) ?? "",
    description: (data.description as string) ?? "",
    tags: (data.tags as string[]) ?? [],
    categories: (data.categories as string[]) ?? [],
    images: (data.images as string[]) ?? [],
    content,
    readingTimeMinutes: estimateReadingTime(content),
  };
}

export function getPostBySlug(slug: string): PostData | undefined {
  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith(".md"));

  for (const fileName of fileNames) {
    if (fileNameToSlug(fileName.replace(/\.md$/, "")) === slug) {
      return getPostByFileName(fileName);
    }
  }
  return undefined;
}

// "New" badge window: most recent post is highlighted for two weeks after publish.
// Captured at module load so render stays pure for the React Compiler. On a
// statically generated site this resolves to build time, which is what we want.
const NEW_POST_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
const BUILD_TIME = Date.now();

export function getNewestPostSlug(posts: PostData[]): string | null {
  const newest = posts[0];
  if (!newest) return null;
  return BUILD_TIME - new Date(newest.date).getTime() < NEW_POST_WINDOW_MS
    ? newest.slug
    : null;
}

// Module-level cache: post content is immutable for the lifetime of a
// deployment, and Shiki highlighting is the single slowest thing this
// app does (hundreds of ms per post). Without this, every request to
// /posts/[slug] re-runs the pipeline because the root layout's
// session lookup opts the whole tree out of static rendering.
const htmlCache = new Map<string, string>();

export async function markdownToHtml(markdown: string): Promise<string> {
  const cached = htmlCache.get(markdown);
  if (cached !== undefined) return cached;

  const result = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeShiki, {
      themes: {
        dark: "vitesse-dark",
        light: "vitesse-light",
      },
      defaultColor: false,
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  const html = result.toString();
  htmlCache.set(markdown, html);
  return html;
}
