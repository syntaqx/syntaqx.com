import { ImageResponse } from "next/og";
import type { Metadata } from "next";
import { ogFonts, OG_SIZE } from "@/lib/og";
import { OG_COLORS as C, sceneImage } from "@/lib/scene/og";
import type { SceneName } from "@/lib/scene/scenes";

// The social card every page shares: section kicker, the page's title and
// description, its scene on the right, and where it lives along the bottom.

const ART = 520;

type Card = {
  kicker: string;
  title: string;
  description?: string;
  scene: SceneName;
  path: string;
  /** A count or fact for the footer, such as "30 chapters". */
  stat?: string;
};

export function ogCard({ kicker, title, description, scene, path, stat }: Card) {
  const art = sceneImage(scene, ART, OG_SIZE.height, { pitch: 6 });
  const titleSize = title.length > 40 ? 76 : title.length > 22 ? 94 : 120;
  const host = `syntaqx.com${path === "/" ? "" : path}`;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: C.bg, position: "relative" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={art} width={ART} height={OG_SIZE.height} alt="" style={{ position: "absolute", right: 0, top: 0 }} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 0 112px 72px",
          width: 1200 - ART + 40,
        }}
      >
        <div style={{ display: "flex", fontFamily: "Michroma", fontSize: 18, letterSpacing: 2.5, color: C.fg }}>
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
              marginBottom: 20,
            }}
          >
            {kicker.toUpperCase()}
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Big Shoulders",
              fontSize: titleSize,
              lineHeight: 0.88,
              color: C.fg,
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                display: "flex",
                fontFamily: "Hanken Grotesk",
                fontSize: titleSize > 100 ? 24 : 22,
                lineHeight: 1.35,
                color: C.dim,
                marginTop: 24,
                paddingRight: 24,
              }}
            >
              {description}
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 72,
          right: 72,
          bottom: 52,
          display: "flex",
          alignItems: "center",
          fontFamily: "Michroma",
          fontSize: 12,
          letterSpacing: 2.5,
          color: C.dim,
        }}
      >
        <div style={{ display: "flex", flexShrink: 0, width: 24, height: 2, backgroundColor: C.acc, marginRight: 14 }} />
        {stat && <div style={{ display: "flex", flexShrink: 0, color: C.fg, marginRight: 18 }}>{stat.toUpperCase()}</div>}
        <div style={{ display: "block", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
          {host.toUpperCase()}
        </div>
      </div>
    </div>,
    { ...OG_SIZE, fonts: ogFonts },
  );
}

/** A segment's opengraph-image, carded from its own metadata. */
export function segmentCard(metadata: Metadata, card: Omit<Card, "title" | "description">) {
  return ogCard({ ...card, title: String(metadata.title), description: metadata.description ?? undefined });
}
