// Renders a kit SVG to PNG the way the site shows it: the diagram CSS from
// app/globals.css, the theme's real tokens (read from the .light and .dark
// blocks), color-mix and the real fonts, through headless Chrome. Light theme
// by default, --dark for the dark palette, --width for a column width in CSS
// px (default: the sheet's own width). Set CHROME to the browser binary if it
// isn't in a usual place. Needs network for the fonts (Google Fonts).
//   npm run dwg:render -- public/diagrams/<name>.svg <out.png> [--dark] [--width 680]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const dark = args.includes("--dark");
const wi = args.indexOf("--width");
const [inp, out] = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--width");
if (!inp || !out) {
  console.error("usage: node scripts/dwg/render.mjs <in.svg> <out.png> [--dark] [--width px]");
  process.exit(1);
}

const chrome = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((p) => p && fs.existsSync(p));
if (!chrome) {
  console.error("no Chrome found; set CHROME to a Chrome or Chromium binary");
  process.exit(1);
}

const css = fs.readFileSync(path.join(root, "app", "globals.css"), "utf8");
const rules = css
  .slice(css.indexOf("/* Diagrams: SVGs inlined"), css.indexOf("/* GFM tables */"))
  .split("var(--font-sans)")
  .join('"Hanken Grotesk", sans-serif')
  .split("var(--font-mono)")
  .join('"JetBrains Mono", monospace')
  .split("var(--font-inst)")
  .join('"Michroma", sans-serif');
const block = css.match(new RegExp(`\\n\\.${dark ? "dark" : "light"} \\{([^}]*)\\}`))?.[1] ?? "";
const tokens = ["--background", "--foreground", "--primary", "--muted-foreground"]
  .map((t) => `${t}:${block.match(new RegExp(`${t}:\\s*([^;]+);`))?.[1]}`)
  .join(";");

const svg = fs.readFileSync(inp, "utf8");
const [, vw, vh] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/) ?? [];
const W = wi >= 0 ? Number(args[wi + 1]) : Math.ceil(Number(vw));
const H = Math.ceil((W * Number(vh)) / Number(vw)) + 2;
const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400&family=Michroma&display=block">
<style>:root{${tokens}}html,body{margin:0;background:var(--background)}.diagram{margin:0;width:${W}px}.diagram svg{display:block;width:100%;height:auto}${rules}</style>
</head><body><figure class="diagram">${svg.replace(/^<\?xml[^>]*>\s*/, "")}</figure></body></html>`;
const page = path.join(os.tmpdir(), `dwg-render-${process.pid}.html`);
fs.writeFileSync(page, html);
try {
  execFileSync(
    chrome,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=2",
      "--virtual-time-budget=15000",
      `--window-size=${W},${H}`,
      `--screenshot=${path.resolve(out)}`,
      pathToFileURL(page).href,
    ],
    { stdio: "ignore" },
  );
} finally {
  fs.unlinkSync(page);
}
console.log(out);
