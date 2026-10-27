// Builds every dimensional drawing sheet: each scripts/dwg/sheets/<name>.mjs
// default-exports a function that returns the SVG, written to
// public/diagrams/<name>.svg. Usage: npm run dwg [-- <name> ...]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const sheets = path.join(here, "sheets");
const out = path.join(here, "..", "..", "public", "diagrams");
const only = process.argv.slice(2);

for (const file of fs.readdirSync(sheets).filter((f) => f.endsWith(".mjs")).sort()) {
  const name = file.replace(/\.mjs$/, "");
  if (only.length && !only.includes(name)) continue;
  const { default: draw } = await import(pathToFileURL(path.join(sheets, file)).href);
  const svg = String(draw());
  fs.writeFileSync(path.join(out, `${name}.svg`), svg);
  console.log(`public/diagrams/${name}.svg`);
}
