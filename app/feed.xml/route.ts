import { getAllPosts, markdownToHtml } from "@/lib/posts";
import { SITE_URL } from "@/lib/constants";

// Generated at build time alongside the rest of the static site.
export const dynamic = "force-static";

const FEED_TITLE = "syntaqx";
const FEED_DESCRIPTION =
  "Essays and notes on software engineering, architecture, engineering leadership, and building with LLMs by Chase Pierce.";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(value: string): string {
  // Split any literal `]]>` so it can't close the CDATA section early.
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

export async function GET() {
  const posts = getAllPosts();

  const items = await Promise.all(
    posts.map(async (post) => {
      const url = `${SITE_URL}/posts/${post.slug}`;
      const html = await markdownToHtml(post.content);
      const categories = [...(post.categories ?? []), ...(post.tags ?? [])]
        .map((c) => `<category>${escapeXml(c)}</category>`)
        .join("");

      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${new Date(post.date).toUTCString()}</pubDate>`,
        post.description
          ? `      <description>${cdata(post.description)}</description>`
          : "",
        `      <content:encoded>${cdata(html)}</content:encoded>`,
        categories ? `      ${categories}` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    }),
  );

  const lastBuildDate = posts[0]
    ? new Date(posts[0].date).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
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
