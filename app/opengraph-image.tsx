import { ImageResponse } from "next/og";

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

export const alt = "syntaqx — Chase Pierce";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
      fonts: fontData
        ? [
            {
              name: "Inter",
              data: fontData,
              style: "normal" as const,
              weight: 400 as const,
            },
          ]
        : [],
    },
  );
}
