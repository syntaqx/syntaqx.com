import { describe, it, expect } from "vitest";
import { getAllPosts, getAllTags, slugifyTag, tagDescription } from "./posts";
import { getAllDocs } from "./docs";
import { article, breadcrumbList, itemList, siteGraph, webApplication } from "./schema";
import sitemap from "@/app/sitemap";
import { allTools, moreToolsFor } from "./tools";
import { patterns } from "./ui";

const MAX_DESCRIPTION = 160;

describe("meta descriptions", () => {
  it("keeps every post and doc description within 160 characters", () => {
    for (const item of [...getAllPosts(), ...getAllDocs()]) {
      expect(item.description, item.slug).toBeTruthy();
      expect(item.description!.length, item.slug).toBeLessThanOrEqual(
        MAX_DESCRIPTION,
      );
    }
  });

  it("gives every tag archive a description that fits", () => {
    const posts = getAllPosts();
    for (const tag of getAllTags(posts)) {
      const tagged = posts.filter((p) =>
        (p.tags ?? []).some((t) => slugifyTag(t) === tag.slug),
      );
      const d = tagDescription(tag.label, tagged);
      expect(d.startsWith(`Posts about ${tag.label} by Chase Pierce`)).toBe(true);
      // Crawlers flag descriptions under ~110 characters as too short.
      expect(d.length, `${tag.slug}: ${d}`).toBeGreaterThanOrEqual(110);
      expect(d.length, tag.slug).toBeLessThanOrEqual(MAX_DESCRIPTION);
    }
  });
});

describe("tags", () => {
  it("uses one display label per slug, so tags never collide", () => {
    const labels = new Map<string, Set<string>>();
    for (const post of getAllPosts()) {
      for (const tag of post.tags ?? []) {
        const slug = slugifyTag(tag);
        labels.set(slug, (labels.get(slug) ?? new Set()).add(tag));
      }
    }
    for (const [slug, set] of labels) expect([...set], slug).toHaveLength(1);
  });

  it("uses display-cased labels, not slugs", () => {
    for (const tag of getAllTags()) {
      expect(tag.label, tag.slug).toMatch(/^[A-Z]/);
      expect(tag.label, tag.slug).not.toContain("-");
    }
  });
});

describe("moreToolsFor()", () => {
  it("lists every other tool, plus the converters hub on converter pages", () => {
    const md = moreToolsFor("/tools/markdown").map((t) => t.href);
    expect(md).not.toContain("/tools/markdown");
    expect(md).toHaveLength(allTools.length - 1);
    expect(md).not.toContain("/tools/convert");

    const b64 = moreToolsFor("/tools/convert/base64").map((t) => t.href);
    expect(b64[0]).toBe("/tools/convert");
    expect(b64).not.toContain("/tools/convert/base64");
  });
});

describe("sitemap", () => {
  const urls = sitemap().map((e) => e.url);

  it("lists every docs page", () => {
    for (const doc of getAllDocs()) {
      expect(urls).toContain(`https://www.syntaqx.com/docs/${doc.slug}`);
    }
    expect(urls).toContain("https://www.syntaqx.com/docs/api");
  });

  it("lists every tool and UI pattern page", () => {
    for (const page of [...allTools, ...patterns]) {
      expect(urls).toContain(`https://www.syntaqx.com${page.href}`);
    }
    expect(urls).not.toContain("https://www.syntaqx.com/ui/patterns");
  });

  it("excludes noindex tag archives but keeps the /tags index", () => {
    expect(urls.filter((u) => u.includes("/tags/"))).toEqual([]);
    expect(urls).toContain("https://www.syntaqx.com/tags");
  });

  it("only uses canonical www URLs, and real dates for lastModified", () => {
    for (const entry of sitemap()) {
      expect(entry.url.startsWith("https://www.syntaqx.com")).toBe(true);
      if (entry.lastModified) {
        // Only posts (publish date) and docs (last commit) have real dates.
        expect(entry.url).toMatch(/\/(posts|docs)\//);
        expect(Number.isNaN(new Date(entry.lastModified).getTime())).toBe(false);
      }
    }
  });
});

describe("schema builders", () => {
  it("links Organization, Person and WebSite on the homepage graph", () => {
    const graph = siteGraph({ description: "d", personDescription: "p" })[
      "@graph"
    ];
    const byType: Record<string, Record<string, unknown>> = Object.fromEntries(
      graph.map((n) => [n["@type"], n]),
    );
    expect(byType.Organization).toMatchObject({
      name: "syntaqx",
      url: "https://www.syntaqx.com",
      logo: "https://www.syntaqx.com/brand.svg",
      founder: { "@id": byType.Person["@id"] },
    });
    expect(byType.Organization.sameAs).toContain("https://github.com/syntaqx");
    expect(byType.Organization.address).toEqual({
      "@type": "PostalAddress",
      addressLocality: "South Jordan",
      addressRegion: "UT",
      addressCountry: "US",
    });
    for (const node of [byType.Organization, byType.Person]) {
      expect(node.contactPoint).toMatchObject({
        "@type": "ContactPoint",
        contactType: "professional inquiries",
        email: "syntaqx@gmail.com",
      });
    }
    expect(byType.Person).toMatchObject({
      name: "Chase Pierce",
      jobTitle: "Software Engineering Leader",
    });
    expect(byType.WebSite).toMatchObject({ name: "syntaqx" });
  });

  it("numbers breadcrumbs from Home with absolute URLs", () => {
    expect(
      breadcrumbList([{ name: "Docs", path: "/docs" }]).itemListElement,
    ).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.syntaqx.com" },
      { "@type": "ListItem", position: 2, name: "Docs", item: "https://www.syntaqx.com/docs" },
    ]);
  });

  it("builds ItemLists with positions and absolute URLs", () => {
    const list = itemList("X", "/x", [
      { name: "A", path: "/a" },
      { name: "B", path: "/b" },
    ]);
    expect(list).toMatchObject({ "@type": "ItemList", numberOfItems: 2 });
    expect(list.itemListElement[1]).toEqual({
      "@type": "ListItem",
      position: 2,
      name: "B",
      url: "https://www.syntaqx.com/b",
    });
  });

  it("omits dates on articles unless one is given", () => {
    const node = article({
      headline: "H",
      description: "D",
      path: "/docs/h",
      crumbs: [],
    })["@graph"][0] as Record<string, unknown>;
    expect(node["@type"]).toEqual(["TechArticle", "Article"]);
    expect(node).not.toHaveProperty("datePublished");
    expect(node.mainEntityOfPage).toBe("https://www.syntaqx.com/docs/h");
  });

  it("marks tools as free developer web apps (and Products) with related tools", () => {
    const graph = webApplication({
      name: "T",
      description: "D",
      path: "/tools/t",
      crumbs: [],
      related: [{ name: "Other", path: "/tools/other" }],
    })["@graph"] as Record<string, unknown>[];
    expect(graph[2]).toMatchObject({
      "@type": "ItemList",
      name: "More tools",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Other", url: "https://www.syntaqx.com/tools/other" },
      ],
    });
    const node = graph[0];
    expect(node).toMatchObject({
      "@type": ["WebApplication", "Product"],
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    });
  });
});
