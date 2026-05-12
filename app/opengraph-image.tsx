import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// See note in app/posts/[slug]/opengraph-image.tsx — same vendored
// Geist Mono font, no network at build time.
const geistMonoRegular = readFileSync(
  join(
    process.cwd(),
    "node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf",
  ),
);

export const alt = "syntaqx, by Chase Pierce";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
        fontFamily: "GeistMono, monospace",
      }}
    >
      {/* Accent line */}
      <div
        style={{
          width: 60,
          height: 4,
          backgroundColor: "#00D1CA",
          marginBottom: 40,
        }}
      />
      <div
        style={{
          fontSize: 64,
          fontWeight: 700,
          color: "#e0e0e0",
          lineHeight: 1.1,
          marginBottom: 24,
        }}
      >
        Chase Pierce
      </div>
      <div
        style={{
          fontSize: 24,
          color: "#95B1AE",
          lineHeight: 1.5,
        }}
      >
        VP of Software Engineering. Architect at heart, open sorcerer.
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
          data: geistMonoRegular,
          style: "normal" as const,
          weight: 400 as const,
        },
      ],
    },
  );
}
