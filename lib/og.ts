import { readFileSync } from "node:fs";
import { join } from "node:path";

// Fonts for Open Graph images, read from @fontsource so the build never has
// to reach the network. Satori needs TTF/OTF/WOFF (not WOFF2).
const file = (pkg: string, name: string) =>
  readFileSync(
    join(process.cwd(), "node_modules/@fontsource", pkg, "files", name),
  );

export const ogFonts = [
  {
    name: "Big Shoulders",
    data: file(
      "big-shoulders-display",
      "big-shoulders-display-latin-700-normal.woff",
    ),
    weight: 700 as const,
    style: "normal" as const,
  },
  {
    name: "Michroma",
    data: file("michroma", "michroma-latin-400-normal.woff"),
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Hanken Grotesk",
    data: file("hanken-grotesk", "hanken-grotesk-latin-500-normal.woff"),
    weight: 500 as const,
    style: "normal" as const,
  },
];

export const OG_SIZE = { width: 1200, height: 630 };
