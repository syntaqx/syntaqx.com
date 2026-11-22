import { getAllBookChapters, getAllDocs } from "@/lib/docs";
import { docFirstPublished } from "@/lib/doc-dates";
import { getBook } from "@/lib/books";
import { SITE_URL } from "@/lib/constants";
import { cdata, escapeXml } from "@/lib/rss";

// Generated at build time alongside the rest of the static site.
export const dynamic = "force-static";

/** Enough to cover a book launch without the feed growing with the library. */
const LIMIT = 50;

/**
 * New docs and book chapters, newest first, dated by when each file was
 * added in git. /feed.xml stays posts only. Pages with no known date are
 * left out rather than given one.
 */
export function GET() {
  const entries = [
    ...getAllDocs().map((doc) => ({
      doc,
      path: `/docs/${doc.slug}`,
      where: `Docs · ${doc.category}`,
      date: docFirstPublished(doc.slug),
    })),
    ...getAllBookChapters().map((doc) => ({
      doc,
      path: `/books/${doc.slug}`,
      where: getBook(doc.section)?.name ?? doc.section,
      date: docFirstPublished(doc.slug, "books"),
    })),
  ]
    .filter((e): e is typeof e & { date: string } => Boolean(e.date))
    .sort((a, b) => b.date.localeCompare(a.date) || a.path.localeCompare(b.path))
    .slice(0, LIMIT);

  const items = entries.map(({ doc, path, where, date }) => {
    const url = `${SITE_URL}${path}`;
    return [
      "    <item>",
      `      <title>${escapeXml(`${doc.title} (${where})`)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${new Date(date).toUTCString()}</pubDate>`,
      doc.description ? `      <description>${cdata(doc.description)}</description>` : "",
      `      <category>${escapeXml(where)}</category>`,
      "    </item>",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const lastBuildDate = new Date(entries[0]?.date ?? Date.now()).toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>syntaqx: new docs and book chapters</title>
    <link>${SITE_URL}/books</link>
    <description>The latest docs and book chapters on syntaqx, newest first.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/updates.xml" rel="self" type="application/rss+xml" />
${items.join("\n")}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
