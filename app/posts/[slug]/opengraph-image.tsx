import { ImageResponse } from "next/og";
import { getPostBySlug, getAllPosts } from "@/lib/posts";

async function loadFont(): Promise<ArrayBuffer | undefined> {
  try {
    const res = await fetch(
      "https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const css = await res.text();
    const match = css.match(/src: url\(([^)]+)\)/);
    if (!match?.[1]) return undefined;
    return await fetch(match[1]).then((r) => r.arrayBuffer());
  } catch {
    return undefined;
  }
}

export const alt = "syntaqx blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.title ?? slug;
  const date = post?.date ?? "";
  const tags = post?.tags ?? [];

  const fontData = await loadFont();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        backgroundColor: "#0d0d0d",
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Label */}
      <div
        style={{
          fontSize: 14,
          color: "#00D1CA",
          textTransform: "uppercase",
          letterSpacing: 3,
          marginBottom: 24,
        }}
      >
        Blog Post
      </div>
      {/* Title */}
      <div
        style={{
          fontSize: 52,
          fontWeight: 700,
          color: "#e0e0e0",
          lineHeight: 1.15,
          marginBottom: 32,
          maxWidth: 900,
        }}
      >
        {title}
      </div>
      {/* Meta row */}
      <div
        style={{
          display: "flex",
          gap: 24,
          fontSize: 18,
          color: "#6b7280",
        }}
      >
        {date && (
          <span>
            {new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        )}
        {tags.length > 0 && <span>{tags.slice(0, 3).join(" · ")}</span>}
      </div>
      {/* Bottom brand */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 80,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ width: 40, height: 3, backgroundColor: "#00D1CA" }} />
        <div
          style={{
            fontSize: 20,
            color: "#00D1CA",
            fontWeight: 700,
          }}
        >
          syntaqx.com
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: "Inter",
              data: fontData,
              style: "normal" as const,
              weight: 700 as const,
            },
          ]
        : [],
    },
  );
}
