import fs from "fs";
import path from "path";
import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { getAllBookChapters, getAllDocs } from "@/lib/docs";
import { docLastModified } from "@/lib/doc-dates";
import { BOOKS } from "@/lib/books";
import { glossaryParts, isGlossary } from "@/lib/glossary";
import { SITE_URL } from "@/lib/constants";

/** Recursively find all static page routes under app/. */
function discoverStaticRoutes(dir: string, base = ""): string[] {
  const routes: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      // Skip dynamic segments — those are handled separately
      if (entry.name.startsWith("[")) continue;
      // Route groups like (pages) and private folders like _foo are invisible
      // to routing: recurse into them but don't add them to the URL path.
      const isTransparent =
        (entry.name.startsWith("(") && entry.name.endsWith(")")) ||
        entry.name.startsWith("_");
      routes.push(
        ...discoverStaticRoutes(
          path.join(dir, entry.name),
          isTransparent ? base : `${base}/${entry.name}`,
        ),
      );
    } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
      routes.push(base || "/");
    }
  }
  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;
  const appDir = path.join(process.cwd(), "app");

  // No lastModified for static pages or docs: there's no real date for
  // them, and a build timestamp would claim every page changed on deploy.
  const staticPages = discoverStaticRoutes(appDir).map((route) => ({
    url: `${baseUrl}${route === "/" ? "" : route}`,
  }));

  // Same source as the docs route's generateStaticParams. lastModified comes
  // from git and is omitted when it isn't known (never guessed).
  const docs = getAllDocs().map((doc) => {
    const modified = docLastModified(doc.slug);
    return {
      url: `${baseUrl}/docs/${doc.slug}`,
      ...(modified && { lastModified: new Date(modified) }),
    };
  });

  const allPosts = getAllPosts();

  const posts = allPosts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  // Per-tag archive pages are noindex (thin content — see app/tags/[tag]),
  // so they're intentionally omitted here. The /tags index stays.
  // Each book's cover and chapters (dynamic routes, so not discovered above).
  const covers = BOOKS.map((b) => ({ url: `${baseUrl}/books/${b.slug}` }));
  const chapters = getAllBookChapters().map((chapter) => {
    const modified = docLastModified(chapter.slug, "books");
    return {
      url: `${baseUrl}/books/${chapter.slug}`,
      ...(modified && { lastModified: new Date(modified) }),
    };
  });

  // A glossary's parts are pages of their own, dated by the glossary's file.
  const glossaryPages = getAllBookChapters()
    .filter(isGlossary)
    .flatMap((glossary) => {
      const modified = docLastModified(glossary.slug, "books");
      return glossaryParts(glossary).parts.map((part) => ({
        url: `${baseUrl}/books/${glossary.slug}/${part.slug}`,
        ...(modified && { lastModified: new Date(modified) }),
      }));
    });

  return [...staticPages, ...docs, ...covers, ...chapters, ...glossaryPages, ...posts];
}
