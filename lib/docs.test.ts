import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { getAllBookChapters, getAllDocs, type DocData } from "./docs";
import { docRedirects } from "./doc-redirects";
import { slugifyTag } from "./posts";
import { BOOKS, bookParts } from "./books";
import { SIDEBAR_LABELS, SIDEBAR_LABEL_MAX, sidebarLabel } from "./sidebar-labels";

// The playbook's own guardrails (see /docs/delivery/ci-pipelines). A doc or
// book chapter that breaks one of these fails CI with its slug in the message.

const docs = getAllDocs();
const chapters = getAllBookChapters();
const slugs = new Set([...docs.map((d) => d.slug), "api"]);
/** Everything under /books: each cover and each chapter. */
const bookSlugs = new Set([...BOOKS.map((b) => b.slug), ...chapters.map((c) => c.slug)]);
const h2s = (content: string) => [...content.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());

/** The ids the renderer gives h2 and h3 headings (lib/posts.ts), outside code blocks. */
function headingIds(content: string) {
  const seen = new Map<string, number>();
  return [...content.replace(/^```[\s\S]*?^```/gm, "").matchAll(/^###? (.+)$/gm)].map((m) => {
    const base = slugifyTag(m[1].replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")) || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  });
}

/**
 * Advance widths (px) of printable ASCII, space to ~, in the sidebar's page
 * labels: Hanken Grotesk 500 at 14px, measured in the browser. A label's
 * width is their sum; kerning is left out, which NAV_MAX's margin covers.
 */
const NAV_GLYPHS = [
  3.64, 3.42, 4.86, 9.76, 7.84, 10.4, 9.67, 2.52, 3.36, 3.36, 5.57, 7.84, 3.36, 4.58, 3.36, 5.87,
  7.84, 7.84, 7.84, 7.84, 7.84, 7.84, 7.84, 7.84, 7.84, 7.84, 3.36, 3.36, 7.84, 7.84, 7.84, 7.22,
  12.24, 9.09, 8.46, 9.88, 9.51, 8.16, 7.88, 10.25, 9.56, 3.53, 7.74, 9.02, 6.97, 11.83, 9.52,
  10.47, 7.8, 10.89, 8.44, 7.95, 8.2, 9.18, 9.25, 13.5, 9.11, 8.54, 8.26, 3.81, 6.36, 3.81, 8.08,
  6.08, 4.19, 7.59, 8.16, 7.27, 8.16, 7.56, 4.75, 7.24, 7.74, 3.25, 3.25, 7.57, 3.77, 11.66, 7.74,
  8.05, 8.16, 8.16, 5.78, 6.59, 4.94, 7.74, 7.36, 10.5, 7.38, 7.36, 6.61, 3.56, 3.67, 3.56, 7.84,
];
const navWidth = (label: string) =>
  [...label].reduce((sum, ch) => sum + (NAV_GLYPHS[ch.charCodeAt(0) - 32] ?? 13.5), 0);
/** The label's 180px in the 248px rail, less 4px for kerning. */
const NAV_MAX = 176;

/** The rules every page of Markdown content follows, in /docs and in /books. */
function contentRules(all: DocData[]) {
  const each = all.map((d) => [d.slug, d] as const);

  it.each(each)("%s has complete frontmatter", (_, doc) => {
    expect(doc.title).toBeTruthy();
    // Sidebars are narrow: a wider label is cut off. Set a shorter nav_title.
    expect(navWidth(doc.navTitle), `nav label "${doc.navTitle}" (px)`).toBeLessThanOrEqual(NAV_MAX);
    expect(doc.category).not.toBe("General");
    expect(doc.order).not.toBe(99);
    expect(doc.tags.length).toBeGreaterThan(0);
    // Long enough to describe the page, short enough for search results.
    expect(doc.description.length).toBeGreaterThanOrEqual(110);
    expect(doc.description.length).toBeLessThanOrEqual(160);
  });

  it.each(each)("%s ends with one References section", (_, doc) => {
    const headings = h2s(doc.content);
    expect(headings.filter((h) => h === "References")).toHaveLength(1);
    expect(headings.at(-1)).toBe("References");
    const references = doc.content.split(/^## References$/m)[1];
    expect(references).toMatch(/^- \[.+\]\(https?:\/\/.+\)/m);
  });

  it.each(each)("%s has no em-dashes", (_, doc) => {
    expect(`${doc.title} ${doc.description} ${doc.content}`).not.toContain("—");
  });

  it.each(each)("%s only links to docs and books that exist", (_, doc) => {
    for (const [, slug] of doc.content.matchAll(/\]\(\/docs\/([a-z0-9/-]+)/g)) {
      expect(slugs, `/docs/${slug}`).toContain(slug);
    }
    for (const [, slug] of doc.content.matchAll(/\]\(\/books\/([a-z0-9/-]+)/g)) {
      expect(bookSlugs, `/books/${slug}`).toContain(slug);
    }
  });

  it.each(each)("%s only links to sections that exist", (_, doc) => {
    for (const [, base, slug, anchor] of doc.content.matchAll(
      /\]\(\/(docs|books)\/([a-z0-9/-]+)#([a-z0-9-]+)\)/g,
    )) {
      const target = (base === "docs" ? docs : chapters).find((d) => d.slug === slug);
      if (target)
        expect(headingIds(target.content), `/${base}/${slug}#${anchor}`).toContain(anchor);
    }
  });

  it.each(each)("%s never wraps JSON in a data envelope", (_, doc) => {
    expect(doc.content).not.toMatch(/"data"\s*:/);
  });

  it.each(each)("%s draws diagrams as SVGs with alt text and a caption", (_, doc) => {
    // Box-drawing characters mean an ASCII diagram; those are SVGs in public/diagrams.
    expect(doc.content).not.toMatch(/[─-╿▶►▼◄]/);
    for (const [, alt, src, caption] of doc.content.matchAll(
      /!\[([^\]]*)\]\((\/diagrams\/[^\s)]+)(?: "([^"]*)")?\)/g,
    )) {
      expect(fs.existsSync(path.join("public", src)), src).toBe(true);
      expect(alt.length, `${src} alt text`).toBeGreaterThan(40);
      expect(caption, `${src} caption`).toBeTruthy();
    }
  });

  it("groups pages into section folders that share one category", () => {
    const bySection = new Map<string, Set<string>>();
    for (const doc of all) {
      bySection.set(doc.section, (bySection.get(doc.section) ?? new Set()).add(doc.category));
    }
    for (const [section, categories] of bySection) {
      expect([...categories], section || "(root)").toHaveLength(1);
    }
  });

  it("keeps old URLs as unique aliases that never shadow a real doc", () => {
    const aliases = all.flatMap((d) => d.aliases);
    expect(new Set(aliases).size).toBe(aliases.length);
    for (const alias of aliases) expect(slugs, alias).not.toContain(alias);
  });

  it("gives every page a unique order, so the index is stable", () => {
    const orders = all.map((d) => d.order);
    expect(new Set(orders).size).toBe(orders.length);
  });
}

describe("playbook docs", () => {
  contentRules(docs);

  it("keeps only the playbook's start at the root", () => {
    expect(docs.filter((d) => !d.section).map((d) => d.slug)).toEqual(["playbook"]);
  });

  it("redirects every alias and section folder to a page that exists", () => {
    const redirects = docRedirects();
    for (const [all, base] of [
      [docs, "/docs"],
      [chapters, "/books"],
    ] as const) {
      for (const doc of all) {
        for (const alias of doc.aliases) {
          expect(redirects, alias).toContainEqual({
            source: `/docs/${alias}`,
            destination: `${base}/${doc.slug}`,
            permanent: true,
          });
        }
      }
    }
    for (const { destination } of redirects) {
      // The /docs/industries patterns carry their segments through to /books.
      if (destination.includes(":") || destination === "/books") continue;
      if (destination.startsWith("/books/")) {
        expect(bookSlugs, destination).toContain(destination.slice("/books/".length));
        continue;
      }
      const [target, section] = destination.replace("/docs/", "").split("#");
      if (section)
        expect(
          docs.some((d) => d.section === section),
          destination,
        ).toBe(true);
      else expect(slugs, destination).toContain(target);
    }
  });

  it("sends the books' old /docs/industries URLs to /books", () => {
    expect(docRedirects()).toEqual(
      expect.arrayContaining([
        { source: "/docs/industries", destination: "/books", permanent: true },
        { source: "/docs/industries/:book", destination: "/books/:book", permanent: true },
        {
          source: "/docs/industries/:book/:chapter",
          destination: "/books/:book/:chapter",
          permanent: true,
        },
      ]),
    );
  });
});

describe("books", () => {
  contentRules(chapters);

  it("gives every book folder an entry in lib/books.ts, and every entry a folder", () => {
    const folders = [...new Set(chapters.map((c) => c.section))].sort();
    expect(BOOKS.map((b) => b.slug).sort()).toEqual(folders);
    // A book is one folder of chapters, never nested.
    for (const chapter of chapters) expect(chapter.slug.split("/"), chapter.slug).toHaveLength(2);
  });

  it("puts every chapter in a part, and keeps each part's chapters together", () => {
    for (const book of BOOKS) {
      const own = chapters.filter((c) => c.section === book.slug);
      for (const chapter of own) expect(chapter.part, chapter.slug).toBeTruthy();
      const titles = bookParts(own).map((p) => p.title);
      expect(new Set(titles).size, `${book.slug} parts out of order: ${titles.join(", ")}`).toBe(
        titles.length,
      );
    }
  });
});

describe("sidebar", () => {
  const names = new Set([...docs.map((d) => d.category), ...chapters.map((c) => c.part ?? "")]);

  it("fits every section name on one line, shortened where it runs long", () => {
    for (const name of names) {
      expect(
        sidebarLabel(name).length,
        `"${name}" needs a short label in lib/sidebar-labels.ts`,
      ).toBeLessThanOrEqual(SIDEBAR_LABEL_MAX);
    }
  });

  it("keeps no short label for a name that no longer exists", () => {
    for (const name of Object.keys(SIDEBAR_LABELS)) expect(names.has(name), name).toBe(true);
  });
});

describe("links from outside the site", () => {
  // ADRs and the README live on GitHub, so they link to the site absolutely
  // and the site's redirects can't fix them if they break.
  const files = [
    "README.md",
    ...fs
      .readdirSync(path.join(process.cwd(), "docs", "adr"))
      .map((f) => path.join("docs", "adr", f)),
  ];
  it.each(files)("%s only links to docs and books that exist", (file) => {
    const text = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    for (const [, slug] of text.matchAll(/syntaqx\.com\/docs\/([a-z0-9/-]+)/g))
      expect(slugs, slug).toContain(slug);
    for (const [, slug] of text.matchAll(/syntaqx\.com\/books\/([a-z0-9/-]+)/g))
      expect(bookSlugs, slug).toContain(slug);
  });
});

describe("architecture decision records", () => {
  const dir = path.join(process.cwd(), "docs", "adr");
  const files = fs
    .readdirSync(dir)
    .filter((f) => /^\d{4}-.+\.md$/.test(f))
    .sort();
  const index = fs.readFileSync(path.join(dir, "README.md"), "utf8");

  it("are numbered without gaps", () => {
    expect(files.map((f) => Number(f.slice(0, 4)))).toEqual(files.map((_, i) => i + 1));
  });

  it.each(files)("%s has a title, a status and the Nygard sections, and is indexed", (file) => {
    const text = fs.readFileSync(path.join(dir, file), "utf8");
    expect(text).toMatch(new RegExp(`^# ${file.slice(0, 4)}\. .+`, "m"));
    expect(text).toMatch(/^Status: (Proposed|Accepted|Deprecated|Superseded by \[\d{4}\]\(.+\))/m);
    for (const section of ["Context", "Decision", "Consequences"]) {
      expect(h2s(text), section).toContain(section);
    }
    expect(text).not.toContain("—");
    expect(index).toContain(`](${file})`);
  });
});
