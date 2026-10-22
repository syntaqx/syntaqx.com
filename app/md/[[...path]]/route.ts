import { renderMarkdownPage } from "@/lib/markdown";

// Target of the `Accept: text/markdown` rewrites in next.config.ts. The
// path segments are the original page path, so /posts/foo arrives here as
// /md/posts/foo.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await params;
  const { status, body } = renderMarkdownPage(`/${path.join("/")}`);
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      "Cache-Control":
        status === 200
          ? "public, s-maxage=3600, stale-while-revalidate=86400"
          : "public, s-maxage=300",
    },
  });
}
