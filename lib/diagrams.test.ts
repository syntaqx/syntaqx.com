import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const sheets = path.join(process.cwd(), "scripts", "dwg", "sheets");
const out = path.join(process.cwd(), "public", "diagrams");
const names = fs
  .readdirSync(sheets)
  .filter((f) => f.endsWith(".mjs"))
  .map((f) => f.replace(/\.mjs$/, ""));
const read = (name: string) =>
  fs.readFileSync(path.join(out, `${name}.svg`), "utf8").replace(/\r\n/g, "\n");

describe("diagram sheets", () => {
  it("each have a committed SVG that matches a fresh build", async () => {
    for (const name of names) {
      const { default: draw } = await import(pathToFileURL(path.join(sheets, `${name}.mjs`)).href);
      expect(read(name), `${name}: run npm run dwg -- ${name}`).toBe(String(draw()));
    }
  }, 60_000);

  it("draw with theme classes only, so they follow light and dark", () => {
    for (const name of names) {
      const svg = read(name);
      expect(svg, name).not.toMatch(/<style|\sstyle=|font-family=|font-size=|#[0-9a-fA-F]{3,8}"/);
      expect(svg, name).not.toMatch(/="[^"]*\d\.\d{3,}/);
    }
  });

  it("have no SVG without a sheet", () => {
    const svgs = fs.readdirSync(out).filter((f) => f.endsWith(".svg"));
    expect(svgs.map((f) => f.replace(/\.svg$/, "")).sort()).toEqual([...names].sort());
  });
});
