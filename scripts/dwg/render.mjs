// Renders a kit SVG to PNG with the site's diagram CSS inlined, for checking
// a drawing without running the site. Light theme by default, --dark for the
// dark palette (approximations of the --fig-* variables; fonts fall back to
// Arial). Usage:
//   npm run dwg:render -- public/diagrams/<name>.svg <out.png> [--dark]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const dark = args.includes("--dark");
const [inp, out] = args.filter((a) => !a.startsWith("--"));
if (!inp || !out) {
  console.error("usage: node scripts/dwg/render.mjs <in.svg> <out.png> [--dark]");
  process.exit(1);
}

const css = fs.readFileSync(path.join(root, "app", "globals.css"), "utf8");
let rules = css
  .slice(css.indexOf(".diagram .frame"), css.indexOf("/* GFM tables */"))
  .replace(/\.diagram \.dwg /g, "")
  .replace(/\.diagram /g, "");
const light = { paper: "#fcfbfd", shade: "#f2f1f3", shade2: "#e7e6e8", ink: "#2a2a2e", line: "#8a8a90", accent: "#0f8a85", accentFill: "#dff0ee" };
const night = { paper: "#121214", shade: "#1b1b1e", shade2: "#242428", ink: "#d6d6da", line: "#8a8a90", accent: "#3fb8b0", accentFill: "#15302e" };
const c = dark ? night : light;
const vars = {
  "--fig-paper": c.paper,
  "--fig-shade": c.shade,
  "--fig-shade-2": c.shade2,
  "--fig-ink": c.ink,
  "--fig-line": c.line,
  "--fig-accent": c.accent,
  "--fig-accent-fill": c.accentFill,
  "--font-mono": "monospace",
  "--font-inst": "Arial",
  "--font-sans": "Arial",
};
for (const [k, v] of Object.entries(vars)) rules = rules.split(`var(${k})`).join(v);

const svg = fs
  .readFileSync(inp, "utf8")
  .replace(/(<svg[^>]*>)/, `$1<style><![CDATA[${rules}]]></style><rect width="100%" height="100%" fill="${c.paper}"/>`);
await sharp(Buffer.from(svg), { density: 200 }).png().toFile(out);
console.log(out);
