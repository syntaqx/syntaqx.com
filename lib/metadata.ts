import type { Metadata } from "next";

/** Longer descriptions are cut off in results, and crawlers flag them. */
export const MAX_DESCRIPTION = 160;

/** A page-level `alternates` replaces the layout's wholesale, so pages restate the feed. */
const RSS = [{ url: "/feed.xml", title: "syntaqx RSS feed" }];

/**
 * Title, description, canonical URL, and the Open Graph fields that would
 * otherwise fall back to the homepage's. The canonical keeps query-string
 * variants (`/about?x=1`) from reading as duplicates.
 */
export function pageMetadata(path: string, title: string, description: string): Metadata {
  if (description.length > MAX_DESCRIPTION) {
    console.warn(
      `metadata: ${path} description is ${description.length} characters (max ${MAX_DESCRIPTION})`,
    );
  }
  return {
    title,
    description,
    alternates: { canonical: path, types: { "application/rss+xml": RSS } },
    openGraph: { title, description, url: path, siteName: "syntaqx", type: "website" },
  };
}

/**
 * The canonical URL of a docs or books page, and its Markdown for agents (its
 * path plus .md).
 */
export function markdownAlternates(path: string): Metadata["alternates"] {
  return {
    canonical: path,
    types: {
      "application/rss+xml": RSS,
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
