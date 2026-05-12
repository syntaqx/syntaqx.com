import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getPostBySlug, getAllPosts } from "@/lib/posts";

// Use Geist Mono — same family as the rest of the site — read straight
// from the `geist` npm package so the build never has to reach the
// network for fonts. Satori needs real TTF/OTF (not woff2), which the
// package conveniently ships.
const geistMonoBold = readFileSync(
  join(
    process.cwd(),
    "node_modules/geist/dist/fonts/geist-mono/GeistMono-Bold.ttf",
  ),
);

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
        fontFamily: "Inter, sans-serif",
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
      fonts: [
        {
          name: "GeistMono",
          data: geistMonoBold,
          style: "normal" as const,
          weight: 700 as const,
        },
      ],
    },
  );
}
