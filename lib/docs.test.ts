import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { getAllDocs } from "./docs";
import { docRedirects } from "./doc-redirects";

// The playbook's own guardrails (docs/adr/0009). A doc that breaks one of
// these fails CI with the doc's slug in the message.

const docs = getAllDocs();
const slugs = new Set([...docs.map((d) => d.slug), "api"]);
const h2s = (content: string) => [...content.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());

describe("playbook docs", () => {
  it.each(docs.map((d) => [d.slug, d] as const))("%s has complete frontmatter", (_, doc) => {
    expect(doc.title).toBeTruthy();
    expect(doc.category).not.toBe("General");
    expect(doc.order).not.toBe(99);
    expect(doc.tags.length).toBeGreaterThan(0);
    // Long enough to describe the page, short enough for search results.
    expect(doc.description.length).toBeGreaterThanOrEqual(110);
    expect(doc.description.length).toBeLessThanOrEqual(160);
  });

  it.each(docs.map((d) => [d.slug, d] as const))("%s ends with one References section", (_, doc) => {
    const headings = h2s(doc.content);
    expect(headings.filter((h) => h === "References")).toHaveLength(1);
    expect(headings.at(-1)).toBe("References");
    const references = doc.content.split(/^## References$/m)[1];
    expect(references).toMatch(/^- \[.+\]\(https?:\/\/.+\)/m);
  });

  it.each(docs.map((d) => [d.slug, d] as const))("%s has no em-dashes", (_, doc) => {
    expect(`${doc.title} ${doc.description} ${doc.content}`).not.toContain("\u2014");
  });

  it.each(docs.map((d) => [d.slug, d] as const))("%s only links to docs that exist", (_, doc) => {
    const linked = [...doc.content.matchAll(/\]\(\/docs\/([a-z0-9/-]+)/g)].map((m) => m[1]);
    for (const slug of linked) expect(slugs, `/docs/${slug}`).toContain(slug);
  });

  it.each(docs.map((d) => [d.slug, d] as const))("%s never wraps JSON in a data envelope", (_, doc) => {
    expect(doc.content).not.toMatch(/"data"\s*:/);
  });

  it("groups docs into section folders that share one category", () => {
    const bySection = new Map<string, Set<string>>();
    for (const doc of docs) {
      bySection.set(doc.section, (bySection.get(doc.section) ?? new Set()).add(doc.category));
    }
    for (const [section, categories] of bySection) {
      expect([...categories], section || "(root)").toHaveLength(1);
    }
    expect(docs.filter((d) => !d.section).map((d) => d.slug)).toEqual(["playbook"]);
  });

  it("keeps old URLs as unique aliases that never shadow a real doc", () => {
    const aliases = docs.flatMap((d) => d.aliases);
    expect(new Set(aliases).size).toBe(aliases.length);
    for (const alias of aliases) expect(slugs, alias).not.toContain(alias);
  });

  it("redirects every alias and section folder to a page that exists", () => {
    const redirects = docRedirects();
    for (const doc of docs) {
      for (const alias of doc.aliases) {
        expect(redirects, alias).toContainEqual({
          source: `/docs/${alias}`,
          destination: `/docs/${doc.slug}`,
          permanent: true,
        });
      }
    }
    for (const { destination } of redirects) {
      const [target, section] = destination.replace("/docs/", "").split("#");
      if (section) expect(docs.some((d) => d.section === section), destination).toBe(true);
      else expect(slugs, destination).toContain(target);
    }
  });

  it("gives every doc a unique order, so the index is stable", () => {
    const orders = docs.map((d) => d.order);
    expect(new Set(orders).size).toBe(orders.length);
  });
});

describe("links from outside the site", () => {
  // ADRs and the README live on GitHub, so they link to the site absolutely
  // and the site's redirects can't fix them if they break.
  const files = [
    "README.md",
    ...fs.readdirSync(path.join(process.cwd(), "docs", "adr")).map((f) => path.join("docs", "adr", f)),
  ];
  it.each(files)("%s only links to docs that exist", (file) => {
    const text = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    const linked = [...text.matchAll(/syntaqx\.com\/docs\/([a-z0-9/-]+)/g)].map((m) => m[1]);
    for (const slug of linked) expect(slugs, slug).toContain(slug);
  });
});

describe("architecture decision records", () => {
  const dir = path.join(process.cwd(), "docs", "adr");
  const files = fs.readdirSync(dir).filter((f) => /^\d{4}-.+\.md$/.test(f)).sort();
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
    expect(text).not.toContain("\u2014");
    expect(index).toContain(`](${file})`);
  });
});
