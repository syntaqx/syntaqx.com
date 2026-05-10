import fs from "fs";
import path from "path";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeShiki from "@shikijs/rehype";

const docsDirectory = path.join(process.cwd(), "content/docs");

export interface DocData {
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
  tags: string[];
  content: string;
}

export interface DocCategory {
  name: string;
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

export function getAllDocs(): DocData[] {
  if (!fs.existsSync(docsDirectory)) return [];

  return fs
    .readdirSync(docsDirectory)
    .filter((f) => f.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(docsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = parseTomlFrontmatter(fileContents);

      return {
        slug,
        title: (data.title as string) ?? slug,
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
  const docs = getAllDocs();
  return docs.find((d) => d.slug === slug);
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
    docs,
  }));
}

export async function markdownToHtml(markdown: string): Promise<string> {
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
  return result.toString();
}
