import { ImageResponse } from "next/og";
import { ogFonts, OG_SIZE } from "@/lib/og";
import { OG_COLORS as C, sceneImage } from "@/lib/scene/og";

export const alt = "syntaqx, by Chase Pierce";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const art = sceneImage("system", 640, 630, { pitch: 6 });

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
        width={640}
        height={630}
        alt=""
        style={{ position: "absolute", right: 0, top: 0 }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 0 60px 72px",
          width: 640,
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
              fontSize: 13,
              letterSpacing: 4,
              color: C.dim,
              marginBottom: 22,
            }}
          >
            SOFTWARE ENGINEERING LEADER · UTAH
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "Big Shoulders",
              fontSize: 150,
              lineHeight: 0.84,
              color: C.fg,
            }}
          >
            <span>CHASE</span>
            <span style={{ color: C.acc }}>PIERCE</span>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Hanken Grotesk",
              fontSize: 26,
              color: C.dim,
              marginTop: 28,
              maxWidth: 520,
            }}
          >
            Architect at heart, open sorcerer. Writing on engineering, systems,
            and craft.
          </div>
        </div>
      </div>
    </div>,
    { ...size, fonts: ogFonts },
  );
}
