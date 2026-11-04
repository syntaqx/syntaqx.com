// Snapshot shadcn's source for every registry item that forks one of its
// components, into registry-upstream/. lib/registry.test.ts checks each fork
// still offers everything the original does, so it installs as a drop-in
// replacement. Rerun (`npm run registry:upstream`) to compare against a newer
// shadcn; items shadcn doesn't have are skipped.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const STYLE = "new-york-v4";
// Forks taken from a newer shadcn style than the default above.
const STYLES = { button: "radix-vega" };
const registry = JSON.parse(readFileSync("registry.json", "utf8"));
mkdirSync("registry-upstream", { recursive: true });

for (const { name } of registry.items) {
  const url = `https://ui.shadcn.com/r/styles/${STYLES[name] ?? STYLE}/${name}.json`;
  const res = await fetch(url);
  if (res.status === 404) continue;
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  const item = await res.json();
  const file = item.files.find((f) => f.type === "registry:ui");
  if (!file?.content) throw new Error(`${url}: no ui file`);
  writeFileSync(`registry-upstream/${name}.tsx`, `// ${url}\n${file.content}`);
  console.log(`${name}: ${url}`);
}
