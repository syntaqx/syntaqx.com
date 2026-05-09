import fs from "fs";
import path from "path";
import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

/** Recursively find all static page routes under app/. */
function discoverStaticRoutes(dir: string, base = ""): string[] {
  const routes: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      // Skip dynamic segments — those are handled separately
      if (entry.name.startsWith("[")) continue;
      routes.push(
        ...discoverStaticRoutes(
          path.join(dir, entry.name),
          `${base}/${entry.name}`,
        ),
      );
    } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
      routes.push(base || "/");
    }
  }
  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://syntaqx.com";
  const appDir = path.join(process.cwd(), "app");

  const staticPages = discoverStaticRoutes(appDir).map((route) => ({
    url: `${baseUrl}${route === "/" ? "" : route}`,
    lastModified: new Date(),
  }));

  const posts = getAllPosts().map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  return [...staticPages, ...posts];
}
