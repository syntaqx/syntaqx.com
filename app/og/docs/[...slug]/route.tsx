import { ImageResponse } from "next/og";
import { getAllDocs, getDocBySlug, getDocsByCategory } from "@/lib/docs";
import { ogFonts, OG_SIZE } from "@/lib/og";
import { OG_COLORS as C, sceneImage } from "@/lib/scene/og";

// The social preview for each doc. A route handler rather than an
// opengraph-image file: under the [...slug] catch-all, the image route would
// put a segment after the catch-all, which Next doesn't allow.

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllDocs().map((doc) => ({ slug: doc.slug.split("/") }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const slug = (await params).slug.join("/");
  const doc = getDocBySlug(slug);
  if (!doc) return new Response("Not found", { status: 404 });

  const section = getDocsByCategory().find((c) => c.name === doc.category)?.name ?? "Docs";
  const art = sceneImage("spec", 560, OG_SIZE.height, { pitch: 6 });
  const long = doc.title.length > 26;

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
        width={560}
        height={OG_SIZE.height}
        alt=""
        style={{ position: "absolute", right: 0, top: 0 }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px",
          width: 760,
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
        <div style={{ display: "flex", flexDirection: "column" }}>
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
            {`PLAYBOOK  ·  ${section.toUpperCase()}`}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Big Shoulders",
              fontSize: long ? 92 : 116,
              lineHeight: 0.88,
              color: C.fg,
              textTransform: "uppercase",
            }}
          >
            {doc.title}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Hanken Grotesk",
              fontSize: 24,
              lineHeight: 1.35,
              color: C.dim,
              marginTop: 26,
            }}
          >
            {doc.description}
          </div>
        </div>
      </div>
    </div>,
    { ...OG_SIZE, fonts: ogFonts },
  );
}
