import { renderMarkdownPage } from "@/lib/markdown";
import { SITE_URL } from "@/lib/constants";

// Target of the `Accept: text/markdown` rewrites in next.config.ts. The
// path segments are the original page path, so /posts/foo arrives here as
// /md/posts/foo.
export async function GET(_request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  const page = `/${path.join("/")}`;
  const { status, body } = renderMarkdownPage(page);
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      // Every docs and books page links its Markdown (/x.md). Point search
      // engines back at the HTML page, so the copies aren't crawled and
      // weighed as ~1,100 duplicates of it.
      ...(status === 200 && { Link: `<${SITE_URL}${page === "/" ? "" : page}>; rel="canonical"` }),
      "Cache-Control":
        status === 200
          ? "public, s-maxage=3600, stale-while-revalidate=86400"
          : "public, s-maxage=300",
    },
  });
}
