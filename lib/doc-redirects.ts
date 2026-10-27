import fs from "node:fs";
import path from "node:path";

/**
 * Permanent redirects for docs and books, served by next.config.ts before
 * any page renders (a page-level redirect streams as a 200 with a meta
 * refresh):
 *
 *   - the books' old home under /docs/industries, to /books
 *   - each doc's or book chapter's former slugs, from its `aliases`
 *     frontmatter (former paths under /docs), to its URL
 *   - a bare section folder, like /docs/payments, to its group on /docs
 *
 * next.config.ts imports this, so it reads files directly and imports no
 * app code.
 */
export function docRedirects(root = process.cwd()) {
  const docsDir = path.join(root, "content", "docs");
  const booksDir = path.join(root, "content", "books");

  const files = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return files(full);
      return e.name.endsWith(".md") ? [full] : [];
    });

  // Books lived under /docs/industries until October 2026.
  const redirects: { source: string; destination: string; permanent: true }[] = [
    { source: "/docs/industries", destination: "/books", permanent: true },
    { source: "/docs/industries/:book", destination: "/books/:book", permanent: true },
    { source: "/docs/industries/:book/:chapter", destination: "/books/:book/:chapter", permanent: true },
  ];
  const sections = new Set<string>();

  for (const [dir, base] of [
    [docsDir, "/docs"],
    [booksDir, "/books"],
  ] as const) {
    for (const file of files(dir)) {
      const slug = path.relative(dir, file).split(path.sep).join("/").replace(/\.md$/, "");
      if (dir === docsDir && slug.includes("/")) sections.add(slug.slice(0, slug.lastIndexOf("/")));

      const aliases = fs.readFileSync(file, "utf8").match(/^aliases\s*=\s*\[([^\]]*)\]/m)?.[1] ?? "";
      for (const alias of aliases.match(/"[^"]+"/g) ?? []) {
        redirects.push({ source: `/docs/${alias.slice(1, -1)}`, destination: `${base}/${slug}`, permanent: true });
      }
    }
  }

  // A section folder goes to its group on /docs; a parent of nested sections
  // goes to its first one.
  const anchors = new Map<string, string>();
  for (const section of [...sections].sort()) {
    const parts = section.split("/");
    for (let i = 1; i <= parts.length; i++) {
      const folder = parts.slice(0, i).join("/");
      if (!anchors.has(folder)) anchors.set(folder, section.replace(/\//g, "-"));
    }
  }
  for (const [folder, anchor] of anchors) {
    redirects.push({ source: `/docs/${folder}`, destination: `/docs#${anchor}`, permanent: true });
  }

  return redirects;
}
