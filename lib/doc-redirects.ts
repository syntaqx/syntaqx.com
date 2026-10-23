import fs from "node:fs";
import path from "node:path";

/**
 * Permanent redirects for docs, served by next.config.ts before any page
 * renders (a page-level redirect streams as a 200 with a meta refresh):
 *
 *   - each doc's former slugs, from its `aliases` frontmatter, to its URL
 *   - a bare section folder, like /docs/payments, to its group on /docs
 *     (industry folders are pages: the Industries list and each cover)
 *
 * next.config.ts imports this, so it reads files directly and imports no
 * app code.
 */
export function docRedirects(root = process.cwd()) {
  const docsDir = path.join(root, "content", "docs");

  const files = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return files(full);
      return e.name.endsWith(".md") ? [full] : [];
    });

  const redirects: { source: string; destination: string; permanent: true }[] = [];
  const sections = new Set<string>();

  for (const file of files(docsDir)) {
    const slug = path.relative(docsDir, file).split(path.sep).join("/").replace(/\.md$/, "");
    if (slug.includes("/")) sections.add(slug.slice(0, slug.lastIndexOf("/")));

    const aliases = fs.readFileSync(file, "utf8").match(/^aliases\s*=\s*\[([^\]]*)\]/m)?.[1] ?? "";
    for (const alias of aliases.match(/"[^"]+"/g) ?? []) {
      redirects.push({ source: `/docs/${alias.slice(1, -1)}`, destination: `/docs/${slug}`, permanent: true });
    }
  }

  // A section folder goes to its group on /docs; a parent of nested sections
  // goes to its first one. Industry folders are pages of their own (the
  // Industries list and each volume's cover), so they're left alone.
  const anchors = new Map<string, string>();
  for (const section of [...sections].filter((s) => !s.startsWith("industries")).sort()) {
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
