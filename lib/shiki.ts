/**
 * Shiki options for every code surface: Markdown code blocks (lib/posts),
 * CodeHighlight and the /ui CodeBlock. The vitesse themes, with the token
 * colors that fall under WCAG AA's 4.5:1 replaced by the nearest same-hue
 * color that passes on the backgrounds code sits on: each theme's own panel
 * and the site's card (#121212 and #0f1313 dark, #ffffff and #dbe0dd light).
 * lib/shiki.test.ts checks every emitted color against those backgrounds.
 */

const DARK: Record<string, string> = {
  "#758575dd": "#748374", // comments
  "#666666": "#808080", // punctuation
  "#c98a7d77": "#9f766d", // string quotes
  "#b8a96577": "#897f51",
  "#24292e": "#70808f",
  "#2f363d": "#6f8090",
  "#6872ab": "#727bb0",
};

const LIGHT: Record<string, string> = {
  "#a0ada0": "#566356", // comments
  "#999999": "#616161", // punctuation
  "#a65e2b": "#8e5025",
  "#59873a": "#466a2e",
  "#1e754f": "#1c6d4a",
  "#ab5959": "#954b4b",
  "#b56959": "#904e40",
  "#b5695977": "#914e41",
  "#99841877": "#685f2e",
  "#998418": "#6d5e11",
  "#b07d48": "#7d5933",
  "#2e8f82": "#236c62",
  "#b05a78": "#954762",
  "#fafbfc": "#49627b",
  "#ab5e3f": "#915035",
  "#bda437": "#6e5f20",
  "#2f798a": "#296877",
  "#2e808f": "#256874",
  "#22863a": "#1c6e2f",
  "#e36209": "#9e4406",
  "#f6f8fa": "#476481",
  "#393a3490": "#5f5f5c",
  "#5a6aa6": "#4f5d92",
};

/** Themes emit some colors in upper case; match either. */
const bothCases = (map: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(map).flatMap(([k, v]) => [
      [k, v],
      [k.toUpperCase(), v],
    ]),
  );

export const SHIKI_THEMES = { dark: "vitesse-dark", light: "vitesse-light" } as const;

/** Spread into codeToHtml or rehypeShiki's options. */
export const shikiOptions = {
  themes: SHIKI_THEMES,
  defaultColor: false as const,
  colorReplacements: {
    "vitesse-dark": bothCases(DARK),
    "vitesse-light": bothCases(LIGHT),
  },
};

/** The backgrounds code sits on, per theme, for the contrast test. */
export const CODE_BACKGROUNDS = {
  dark: ["#121212", "#0f1313"],
  light: ["#ffffff", "#dbe0dd"],
} as const;
