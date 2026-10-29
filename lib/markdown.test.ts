import { describe, it, expect } from "vitest";
import { notFoundMarkdown, renderLlmsTxt, renderMarkdownPage } from "./markdown";
import { getAllBookChapters, getAllDocs, getBookChapters } from "./docs";
import { glossaryParts, isGlossary } from "./glossary";
import { getAllPosts } from "./posts";
import { GET as markdownRoute } from "@/app/md/[[...path]]/route";
import { GET as llmsRoute } from "@/app/llms.txt/route";
import { BOOKS } from "@/lib/books";

describe("renderMarkdownPage()", () => {
  it("renders the homepage with an H1, bio, posts and site links", () => {
    const { status, body } = renderMarkdownPage("/");
    expect(status).toBe(200);
    expect(body.startsWith("# Chase Pierce\n")).toBe(true);
    expect(body).toContain("## Currently");
    expect(body).toContain("https://www.syntaqx.com/openapi.json");
    expect(body).toContain("https://www.syntaqx.com/llms.txt");
    for (const post of getAllPosts()) {
      expect(body).toContain(`https://www.syntaqx.com/posts/${post.slug}`);
    }
  });

  it("renders a post from its source Markdown", () => {
    const post = getAllPosts()[0];
    const { status, body } = renderMarkdownPage(`/posts/${post.slug}`);
    expect(status).toBe(200);
    expect(body.startsWith(`# ${post.title}\n`)).toBe(true);
    expect(body).toContain(post.content.trim().slice(0, 200));
  });

  it("renders docs, the docs index, the API reference and contact", () => {
    const doc = getAllDocs()[0];
    expect(renderMarkdownPage(`/docs/${doc.slug}`).body).toContain(
      `# ${doc.title}`,
    );
    expect(renderMarkdownPage("/docs").body).toContain(
      `https://www.syntaqx.com/docs/${doc.slug}`,
    );
    expect(renderMarkdownPage("/docs/api").body).toContain("# syntaqx API");
    expect(renderMarkdownPage("/docs/api").body).toContain(
      "## Versioning and deprecation",
    );
    const versioning = renderMarkdownPage("/docs/api-design/versioning").body;
    expect(versioning).toContain("## The Lifecycle");
    // Header versioning is the primary recommendation; the URL is the fallback.
    expect(versioning.indexOf("## Header Versioning")).toBeGreaterThan(0);
    expect(versioning.indexOf("## Header Versioning")).toBeLessThan(
      versioning.indexOf("## URL Versioning (Fallback)"),
    );
    expect(renderMarkdownPage("/contact").body).toContain("# Contact");
    expect(renderMarkdownPage("/contact").body).toContain(
      "mailto:syntaqx@gmail.com",
    );
    expect(renderMarkdownPage("/posts").status).toBe(200);
  });

  it("renders books: the index, a cover, a chapter, a glossary and its parts", () => {
    const book = BOOKS[0];
    const chapters = getBookChapters(book.slug);
    expect(renderMarkdownPage("/books").body).toContain(`https://www.syntaqx.com/books/${book.slug}`);
    expect(renderMarkdownPage(`/books/${book.slug}`).body).toContain(`# ${book.name}`);
    const chapter = chapters.find((c) => !isGlossary(c))!;
    expect(renderMarkdownPage(`/books/${chapter.slug}`).body).toContain(`# ${chapter.title}`);

    // As on the site, the glossary's page lists its parts; each part has its own.
    const glossary = getAllBookChapters().find(isGlossary)!;
    const index = renderMarkdownPage(`/books/${glossary.slug}`);
    expect(index.status).toBe(200);
    expect(index.body).toContain("## Parts");
    for (const part of glossaryParts(glossary).parts) {
      expect(index.body).toContain(`https://www.syntaqx.com/books/${glossary.slug}/${part.slug}`);
      const page = renderMarkdownPage(`/books/${glossary.slug}/${part.slug}`);
      expect(page.status).toBe(200);
      expect(page.body.startsWith(`# ${part.title} Glossary\n`)).toBe(true);
    }
    expect(renderMarkdownPage(`/books/${glossary.slug}/nope`).status).toBe(404);
  });

  it("makes content links and images absolute", () => {
    const doc = getAllDocs().find((d) => d.content.includes("](/"))!;
    const chapter = getAllBookChapters().find((c) => c.content.includes("](/diagrams/"))!;
    for (const path of [`/docs/${doc.slug}`, `/books/${chapter.slug}`]) {
      const { body } = renderMarkdownPage(path);
      expect(body, path).not.toContain("](/");
      expect(body, path).toContain("](https://www.syntaqx.com/");
    }
  });

  it("returns a Markdown 404 for unknown paths", () => {
    for (const path of [
      "/__ora-404-probe",
      "/posts/does-not-exist",
      "/docs/nope",
      "/contact/extra",
      "/posts/a/b",
    ]) {
      const { status, body } = renderMarkdownPage(path);
      expect(status, path).toBe(404);
      expect(body, path).toContain("# 404 Not Found");
    }
  });
});

describe("notFoundMarkdown()", () => {
  it("explains the error and links to llms.txt and the sitemap", () => {
    const body = notFoundMarkdown("/missing");
    expect(body.length).toBeGreaterThan(20);
    expect(body).toContain("`/missing`");
    expect(body).toContain("https://www.syntaqx.com/llms.txt");
    expect(body).toContain("https://www.syntaqx.com/sitemap.xml");
  });

  it("keeps the echoed path inert", () => {
    const body = notFoundMarkdown("/a`b\n# injected");
    expect(body).not.toContain("\n# injected");
    expect(body).toContain("`/ab# injected`");
  });
});

describe("app/md route", () => {
  const call = (path?: string[]) =>
    markdownRoute(new Request("http://localhost/md"), {
      params: Promise.resolve({ path }),
    });

  it("serves Markdown with Content-Type text/markdown and Vary: Accept", async () => {
    const res = await call();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    expect(res.headers.get("Vary")).toBe("Accept");
    expect(await res.text()).toMatch(/^# Chase Pierce/);
  });

  it("serves a Markdown 404 for unknown paths", async () => {
    const res = await call(["__ora-404-probe-x"]);
    expect(res.status).toBe(404);
    expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    expect(res.headers.get("Vary")).toBe("Accept");
    expect(await res.text()).toContain("# 404 Not Found");
  });
});

describe("llms.txt", () => {
  it("follows the llmstxt.org layout: H1, blockquote summary, H2 link lists", () => {
    const body = renderLlmsTxt();
    const lines = body.split("\n");
    expect(lines[0]).toBe("# syntaqx");
    expect(lines[2]).toMatch(/^> \S/);
    expect(body.match(/^# /gm)).toHaveLength(1);
    for (const h of ["## API", "## Docs", "## Posts", "## Optional"]) {
      expect(body).toContain(`\n${h}\n`);
    }
    // Every list item in an H2 section is a Markdown link, optionally
    // followed by ": notes". The preamble before the first H2 is free-form.
    const sections = lines.slice(lines.findIndex((l) => l.startsWith("## ")));
    for (const line of sections.filter((l) => l.startsWith("- "))) {
      expect(line).toMatch(/^- \[[^\]]+\]\(https:\/\/[^)\s]+\)(: .+)?$/);
    }
  });

  it("tells agents when to use the site, before the link sections", () => {
    const body = renderLlmsTxt();
    const guidance = body.indexOf("**When to use this site.**");
    expect(guidance).toBeGreaterThan(0);
    expect(guidance).toBeLessThan(body.indexOf("\n## "));
    expect(body).toContain("**How to call it.**");
    expect(body).toContain("**When not to use it.**");
    expect(body).toContain("https://www.syntaqx.com/docs/api-design/versioning");
  });

  it("lists each book's cover, not its chapters", () => {
    const body = renderLlmsTxt();
    const section = body.slice(body.indexOf("\n## Books\n"), body.indexOf("\n## Posts\n"));
    const links = section.match(/\(https:\/\/www\.syntaqx\.com\/books\/[^)]+\)/g) ?? [];
    expect(links).toHaveLength(BOOKS.length);
    for (const link of links) expect(link).toMatch(/\/books\/[a-z-]+\)$/);
  });

  it("is served as text/plain", async () => {
    const res = llmsRoute();
    expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    expect(await res.text()).toBe(renderLlmsTxt());
  });
});
