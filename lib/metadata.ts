import type { Metadata } from "next";

/** Longer descriptions are cut off in results, and crawlers flag them. */
export const MAX_DESCRIPTION = 160;

/** Title, description and the Open Graph fields that would otherwise fall back to the homepage's. */
export function pageMetadata(path: string, title: string, description: string): Metadata {
  if (description.length > MAX_DESCRIPTION) {
    console.warn(`metadata: ${path} description is ${description.length} characters (max ${MAX_DESCRIPTION})`);
  }
  return { title, description, openGraph: { title, description, url: path, siteName: "syntaqx", type: "website" } };
}

/**
 * Points agents at a docs or books page's Markdown (its path plus .md). A
 * page-level `alternates` replaces the layout's wholesale, so the RSS feed is
 * restated.
 */
export function markdownAlternates(path: string): Metadata["alternates"] {
  return {
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: "syntaqx RSS feed" }],
      "text/markdown": `${path}.md`,
    },
  };
}

/**
 * A short title says little in a results page ("Logs - syntaqx"), and crawlers
 * flag it: below 30 characters with the site suffix, add where the page sits,
 * as in "Logs · Observability".
 */
export function titleIn(title: string, context: string): string {
  return `${title} - syntaqx`.length < 30 ? `${title} · ${context}` : title;
}
