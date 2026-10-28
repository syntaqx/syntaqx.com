import fs from "fs";
import path from "path";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeShiki from "@shikijs/rehype";
import { isPostScene, type PostSceneName } from "@/lib/scene/scenes";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface PostData {
  slug: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  categories?: string[];
  images?: string[];
  /** "feature" opts a post into the art-directed layout. */
  layout: "default" | "feature";
  /** The feature post's own hero scene. Never shared with other pages. */
  hero?: PostSceneName;
  content: string;
  readingTimeMinutes: number;
}

export function estimateReadingTime(markdown: string): number {
  // Count only what a reader reads as words. Code blocks are skimmed, not
  // read, so they don't count; inline code reads as part of its sentence.
  const stripped = markdown
    .replace(/```[\s\S]*?```/g, " ")
    // An image's alt text is for screen readers; its caption is on the page.
    .replace(/!\[[^\]]*\]\(\S*(?:\s+"([^"]*)")?\)/g, " $1 ")
    // Link targets, table pipes and separator rows aren't words.
    .replace(/\]\([^)]*\)/g, " ")
    .replace(/^[\s|:-]+$/gm, " ")
    .replace(/\|/g, " ")
    .replace(/`/g, "");
  const words = stripped.split(/\s+/).filter(Boolean).length;
  // 238 wpm: the average silent reading rate for English non-fiction in
  // Brysbaert's 2019 meta-analysis of reading rate.
  return Math.max(1, Math.round(words / 238));
}

/** Parse Hugo-style +++ TOML frontmatter */
function parseTomlFrontmatter(fileContents: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const match = fileContents.match(
    /^\+\+\+\s*\n([\s\S]*?)\n\+\+\+\s*\n?([\s\S]*)$/,
  );
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
    if (value === "true") {
      data[key] = true;
      continue;
    }
    if (value === "false") {
      data[key] = false;
      continue;
    }

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
    layout: data.layout === "feature" ? "feature" : "default",
    hero: isPostScene(data.hero) ? data.hero : undefined,
    content,
    readingTimeMinutes: estimateReadingTime(content),
  };
}

/**
 * Slugify a tag the way Hugo did, so legacy `/tags/<slug>` URLs keep
 * resolving: lowercase, runs of non-alphanumerics collapse to a single
 * hyphen, trimmed. e.g. "LLMs" -> "llms", "AI in Development" ->
 * "ai-in-development", "github-actions" -> "github-actions".
 */
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface TagInfo {
  /** Display label, using the casing of the first post that declared it. */
  label: string;
  slug: string;
  count: number;
}

export function getAllTags(posts: PostData[] = getAllPosts()): TagInfo[] {
  const bySlug = new Map<string, TagInfo>();
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      const slug = slugifyTag(tag);
      if (!slug) continue;
      const existing = bySlug.get(slug);
      if (existing) {
        existing.count++;
      } else {
        bySlug.set(slug, { label: tag, slug, count: 1 });
      }
    }
  }
  return [...bySlug.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );
}

export function getPostsByTag(
  slug: string,
  posts: PostData[] = getAllPosts(),
): PostData[] {
  const target = slugifyTag(slug);
  return posts.filter((post) =>
    (post.tags ?? []).some((tag) => slugifyTag(tag) === target),
  );
}

/** Canonical display label for a tag slug, or null if no post uses it. */
export function getTagLabel(
  slug: string,
  posts: PostData[] = getAllPosts(),
): string | null {
  const target = slugifyTag(slug);
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      if (slugifyTag(tag) === target) return tag;
    }
  }
  return null;
}

/**
 * Meta description for a tag archive: the count plus as many post titles as
 * fit in ~160 characters.
 */
export function tagDescription(label: string, posts: PostData[]): string {
  const n = posts.length;
  let text = `Posts about ${label} by Chase Pierce: ${n} article${n === 1 ? "" : "s"}`;
  const titles: string[] = [];
  for (const post of posts) {
    const next = `${text}, including ${[...titles, `"${post.title}"`].join(", ")}.`;
    if (next.length > 160) break;
    titles.push(`"${post.title}"`);
  }
  if (titles.length) text += `, including ${titles.join(", ")}`;
  text += ".";

  // Short archives (one or two posts) read thin, and crawlers flag
  // descriptions under ~110 characters. Borrow the newest post's own
  // description, cut at a word boundary to stay within 160.
  const extra = posts[0]?.description;
  if (text.length < 120 && extra) {
    const room = 160 - text.length - 1;
    let tail = extra;
    if (tail.length > room) {
      tail = tail.slice(0, room - 1).replace(/\s+\S*$/, "") + "…";
    }
    text += ` ${tail}`;
  }
  return text;
}

export function getPostBySlug(slug: string): PostData | undefined {
  const fileNames = fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith(".md"));

  for (const fileName of fileNames) {
    const bare = fileName.replace(/\.md$/, "");
    // Match the canonical (date-stripped) slug, or the full filename so
    // legacy `/posts/YYYY-MM-DD-<slug>` URLs still resolve. The post page
    // permanent-redirects aliases to the canonical slug.
    if (fileNameToSlug(bare) === slug || bare === slug) {
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

export interface Heading {
  id: string;
  text: string;
}

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  /** A fenced code block's info string after the language, on its `code`. */
  data?: { meta?: string | null };
}

const textOf = (n: HastNode): string =>
  n.type === "text" ? (n.value ?? "") : (n.children ?? []).map(textOf).join("");

/**
 * Give every h2 and h3 a slug id (for deep links); h2s also feed the feature
 * contents rail. The docs tests mirror this to check anchor links.
 */
function rehypeSectionIds(toc?: Heading[]) {
  return () => (tree: HastNode) => {
    const seen = new Map<string, number>();
    const walk = (n: HastNode) => {
      if (n.type === "element" && (n.tagName === "h2" || n.tagName === "h3")) {
        const text = textOf(n).trim();
        const base = slugifyTag(text) || "section";
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        const id = count ? `${base}-${count}` : base;
        n.properties = { ...n.properties, id };
        if (n.tagName === "h3") return;
        toc?.push({ id, text });
        // A link to this section, shown on hover, for sharing a deep link.
        n.children = [
          ...(n.children ?? []),
          {
            type: "element",
            tagName: "a",
            properties: { href: `#${id}`, className: ["heading-anchor"], ariaLabel: `Link to ${text}` },
            children: [{ type: "text", value: "#" }],
          },
        ];
      }
      n.children?.forEach(walk);
    };
    walk(tree);
  };
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Inline diagrams. A paragraph that is only `![alt](/diagrams/x.svg "caption")`
 * becomes a figure with the SVG inlined, so it inherits the theme's colors and
 * fonts (styled under `.diagram` in globals.css). The Markdown keeps a plain
 * image, which is what agents and other Markdown readers see.
 */
function rehypeDiagrams() {
  return (tree: HastNode) => {
    const walk = (n: HastNode) => {
      n.children = n.children?.map((child) => {
        const only = child.tagName === "p" ? child.children?.filter((c) => c.type !== "text" || c.value?.trim()) : undefined;
        const img = only?.length === 1 && only[0].tagName === "img" ? only[0] : undefined;
        const src = String(img?.properties?.src ?? "");
        if (!img || !/^\/diagrams\/[\w-]+\.svg$/.test(src)) {
          walk(child);
          return child;
        }
        const alt = escapeHtml(String(img.properties?.alt ?? ""));
        // The caption's first sentence is its lead, set in bold.
        const [lead, rest] = escapeHtml(String(img.properties?.title ?? "")).split(/(?<=\.)\s+([\s\S]*)/);
        const caption = lead ? `<figcaption><strong>${lead}</strong>${rest ? ` ${rest}` : ""}</figcaption>` : "";
        const svg = fs
          .readFileSync(path.join(process.cwd(), "public", src), "utf8")
          .replace(/^<\?xml[^>]*>\s*/, "")
          .replace("<svg ", `<svg role="img" aria-label="${alt}" `);
        return { type: "raw", value: `<figure class="diagram">${svg}${caption}</figure>` };
      });
    };
    walk(tree);
  };
}

const CALLOUT_ICONS: Record<string, string> = {
  note: '<circle cx="8" cy="8" r="6.5"/><path d="M8 7.25v4M8 4.75v.01"/>',
  tip: '<path d="M5.75 12.5h4.5M6.5 14.75h3M8 1.75a4.5 4.5 0 0 0-2.6 8.17c.4.3.6.7.6 1.2v.38h4v-.38c0-.5.2-.9.6-1.2A4.5 4.5 0 0 0 8 1.75Z"/>',
  important: '<rect x="1.75" y="1.75" width="12.5" height="10" rx="2"/><path d="M5 11.75v2.5l3-2.5M8 4.5v3.5M8 9.75v.01"/>',
  warning: '<path d="M8 1.75 1.25 13.5h13.5L8 1.75Z"/><path d="M8 6v3.5M8 11.25v.01"/>',
  caution: '<path d="M5.25 1.75h5.5l3.5 3.5v5.5l-3.5 3.5h-5.5l-3.5-3.5v-5.5l3.5-3.5Z"/><path d="M8 4.75v4M8 10.75v.01"/>',
};

/**
 * Callouts, in GitHub's alert syntax so the Markdown reads right everywhere:
 * a blockquote that opens with `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`,
 * `[!WARNING]` or `[!CAUTION]` becomes an aside with an icon. Text after the
 * marker on its line replaces the default title. Styled under `.callout`.
 */
function rehypeCallouts() {
  return (tree: HastNode) => {
    const walk = (n: HastNode) => {
      n.children?.forEach(walk);
      if (n.tagName !== "blockquote") return;
      const first = n.children?.find((c) => c.tagName === "p");
      const lead = first?.children?.[0];
      const match = lead?.type === "text" ? /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*([^\n]*)\n?/i.exec(lead.value ?? "") : null;
      if (!first || !lead || !match) return;
      const kind = match[1].toLowerCase();
      const title = escapeHtml(match[2].trim() || kind[0].toUpperCase() + kind.slice(1));
      lead.value = (lead.value ?? "").slice(match[0].length);
      if (!lead.value) first.children = first.children?.slice(1).filter((c, i) => i || c.tagName !== "br");
      if (!first.children?.some((c) => c.type !== "text" || c.value?.trim())) n.children = n.children?.filter((c) => c !== first);
      const icon = `<svg viewBox="0 0 16 16" aria-hidden="true">${CALLOUT_ICONS[kind]}</svg>`;
      n.tagName = "aside";
      n.properties = { className: ["callout", `callout-${kind}`] };
      n.children = [{ type: "raw", value: `<p class="callout-title">${icon}${title}</p>` }, ...(n.children ?? [])];
    };
    walk(tree);
  };
}

/**
 * Code tabs. Consecutive fenced blocks that each name a tab in their info
 * string (```` ```bash tab="Java" ````) become one block with a tab each, so
 * a page can show the same step in several languages. The Markdown keeps
 * plain consecutive blocks, which is what agents and other readers see. The
 * first tab shows until CodeTabsScript applies the reader's last choice.
 */
function rehypeCodeTabs() {
  const tabOf = (n: HastNode) => {
    const code = n.tagName === "pre" ? n.children?.find((c) => c.tagName === "code") : undefined;
    return /\btab="([^"]+)"/.exec(code?.data?.meta ?? "")?.[1];
  };
  const blank = (n: HastNode) => n.type === "text" && !n.value?.trim();
  return (tree: HastNode) => {
    const walk = (n: HastNode) => {
      const out: HastNode[] = [];
      const kids = n.children ?? [];
      for (let i = 0; i < kids.length; i++) {
        const group: HastNode[] = [];
        let j = i;
        while (j < kids.length && (tabOf(kids[j]) || (group.length && blank(kids[j])))) {
          if (tabOf(kids[j])) group.push(kids[j]);
          j++;
        }
        if (group.length < 2) {
          walk(kids[i]);
          out.push(kids[i]);
          continue;
        }
        const labels = group.map((pre) => tabOf(pre)!);
        out.push({
          type: "element",
          tagName: "div",
          properties: { className: ["code-tabs"], dataCodeTabs: "" },
          children: [
            {
              type: "element",
              tagName: "div",
              properties: { role: "tablist", ariaLabel: "Code examples" },
              children: labels.map((label, k) => ({
                type: "element",
                tagName: "button",
                properties: { type: "button", role: "tab", ariaSelected: String(k === 0), tabIndex: k === 0 ? 0 : -1, dataTab: label },
                children: [{ type: "text", value: label }],
              })),
            },
            ...group.map((pre, k) => ({
              type: "element",
              tagName: "div",
              properties: { role: "tabpanel", ariaLabel: labels[k], dataTab: labels[k], hidden: k > 0 },
              children: [pre],
            })),
          ],
        });
        // Back up over trailing blank text so it stays between blocks.
        while (j > i && blank(kids[j - 1])) j--;
        i = j - 1;
      }
      n.children = out;
    };
    walk(tree);
  };
}

export async function markdownToHtml(
  markdown: string,
  toc?: Heading[],
): Promise<string> {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSectionIds(toc))
    .use(rehypeDiagrams)
    .use(rehypeCallouts)
    .use(rehypeCodeTabs)
    .use(rehypeShiki, {
      themes: {
        dark: "vitesse-dark",
        light: "vitesse-light",
      },
      defaultColor: false,
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);
  return result.toString();
}
