import fs from "fs";
import path from "path";

const docsDirectory = path.join(process.cwd(), "content/docs");

export interface DocData {
  /** Path under /docs, e.g. "payments/idempotency": the section folder, then the file. */
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
  tags: string[];
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
 * Every Markdown file under content/docs, as POSIX paths relative to it. One
 * recursive read of a fixed directory, so the bundler traces only content/docs
 * instead of the whole project.
 */
function docFiles(): string[] {
  return (fs.readdirSync(docsDirectory, { recursive: true }) as string[])
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.split(path.sep).join("/"));
}

export function getAllDocs(): DocData[] {
  if (!fs.existsSync(docsDirectory)) return [];

  return docFiles()
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const fileContents = fs.readFileSync(path.join(docsDirectory, file), "utf8");
      const { data, content } = parseTomlFrontmatter(fileContents);

      return {
        slug,
        section: slug.includes("/") ? slug.split("/")[0] : "",
        aliases: (data.aliases as string[]) ?? [],
        title: (data.title as string) ?? slug,
        navTitle: (data.nav_title as string) ?? (data.title as string) ?? slug,
        description: (data.description as string) ?? "",
        category: (data.category as string) ?? "General",
        order: (data.order as number) ?? 99,
        tags: (data.tags as string[]) ?? [],
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
