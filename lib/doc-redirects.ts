import fs from "node:fs";
import path from "node:path";

/**
 * Permanent redirects for docs, served by next.config.ts before any page
 * renders (a page-level redirect streams as a 200 with a meta refresh):
 *
 *   - each doc's former slugs, from its `aliases` frontmatter, to its URL
 *   - a bare section folder, like /docs/payments, to its group on /docs
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
    if (slug.includes("/")) sections.add(slug.split("/")[0]);

    const aliases = fs.readFileSync(file, "utf8").match(/^aliases\s*=\s*\[([^\]]*)\]/m)?.[1] ?? "";
    for (const alias of aliases.match(/"[^"]+"/g) ?? []) {
      redirects.push({ source: `/docs/${alias.slice(1, -1)}`, destination: `/docs/${slug}`, permanent: true });
    }
  }

  for (const section of sections) {
    redirects.push({ source: `/docs/${section}`, destination: `/docs#${section}`, permanent: true });
  }

  return redirects;
}
