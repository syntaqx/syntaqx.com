import { ImageResponse } from "next/og";
import { format } from "date-fns";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import { ogFonts, OG_SIZE } from "@/lib/og";
import { OG_COLORS as C, fieldImage, sceneImage } from "@/lib/scene/og";

export const alt = "syntaqx blog post";
export const size = OG_SIZE;
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
  const meta = [
    post?.date ? format(new Date(post.date), "MMM d, yyyy") : null,
    post ? `${post.readingTimeMinutes} min read` : null,
  ]
    .filter(Boolean)
    .join("  ·  ")
    .toUpperCase();

  // Feature posts carry their own hero scene; everything else gets the
  // plain dithered field, never another page's art.
  const art = post?.hero
    ? sceneImage(post.hero, size.width, size.height, { pitch: 6, wide: true })
    : fieldImage(size.width, size.height);
  const long = title.length > 34;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: C.bg,
        position: "relative",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={art}
        width={size.width}
        height={size.height}
        alt=""
        style={{ position: "absolute", left: 0, top: 0 }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Michroma",
            fontSize: 18,
            letterSpacing: 2.5,
            color: C.fg,
          }}
        >
          syntaqx
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: post?.hero ? 540 : 1000,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Michroma",
              fontSize: 14,
              letterSpacing: 3.5,
              color: C.acc,
              marginBottom: 22,
            }}
          >
            {meta}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Big Shoulders",
              fontSize: post?.hero ? 104 : long ? 96 : 124,
              lineHeight: 0.88,
              color: C.fg,
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>
        </div>
      </div>
    </div>,
    { ...size, fonts: ogFonts },
  );
}
