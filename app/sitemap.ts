import fs from "fs";
import path from "path";
import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";
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

// Routes that exist but must never appear in the sitemap: auth-gated areas
// (a crawler without a session only ever sees a redirect) and auth entry
// pages that carry no SEO value. Matched exactly or as a path prefix.
const NOINDEX_PREFIXES = [
  "/settings",
  "/login",
  "/signup",
  "/forgot-password",
];

function isIndexable(route: string): boolean {
  return !NOINDEX_PREFIXES.some(
    (prefix) => route === prefix || route.startsWith(`${prefix}/`),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;
  const appDir = path.join(process.cwd(), "app");

  const staticPages = discoverStaticRoutes(appDir)
    .filter(isIndexable)
    .map((route) => ({
      url: `${baseUrl}${route === "/" ? "" : route}`,
      lastModified: new Date(),
    }));

  const allPosts = getAllPosts();

  const posts = allPosts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  const tags = getAllTags(allPosts).map((tag) => ({
    url: `${baseUrl}/tags/${tag.slug}`,
    lastModified: new Date(),
  }));

  return [...staticPages, ...posts, ...tags];
}
