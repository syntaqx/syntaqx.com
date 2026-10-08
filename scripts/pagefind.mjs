// Builds the Pagefind search index from Next's prerendered HTML.
//
// Next writes prerendered pages to one of two layouts:
//   - .next/server/app/<route>.html (plain `next build`)
//   - .next/server/route-cache/<kind>/<hash>/$/<route>.html (when a
//     deployment adapter is active, e.g. on Vercel, since Next 16.3.8)
// The adapter layout's paths don't map to URLs, so each file is indexed
// with an explicit URL derived from its route.
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import * as pagefind from "pagefind";

const serverDir = ".next/server";
const routeCacheDir = path.join(serverDir, "route-cache");
const appDir = path.join(serverDir, "app");

async function htmlFiles(dir) {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".html"))
    .map((e) => path.join(e.parentPath, e.name));
}

// "/index" is how Next names the root route on disk.
function toUrl(route) {
  const url = route.replace(/\\/g, "/").replace(/\.html$/, "");
  return url === "/index" ? "/" : url;
}

const pages = [];
if (existsSync(routeCacheDir)) {
  for (const file of await htmlFiles(routeCacheDir)) {
    // Keep the separator after "$": it's the route's leading slash.
    const route = file.slice(file.indexOf(`${path.sep}$`) + 2);
    pages.push({ file, url: toUrl(route) });
  }
} else {
  for (const file of await htmlFiles(appDir)) {
    pages.push({ file, url: toUrl(`/${path.relative(appDir, file)}`) });
  }
}

if (pages.length === 0) {
  throw new Error("pagefind: no prerendered HTML found under .next/server");
}

const { index } = await pagefind.createIndex();
let indexed = 0;
for (const { file, url } of pages) {
  const content = await readFile(file, "utf8");
  // Legacy-slug aliases prerender as static 308 stubs; they'd show up as
  // duplicate, empty results.
  if (content.includes('id="__next-page-redirect"')) continue;
  await index.addHTMLFile({ url, content });
  indexed++;
}
await index.writeFiles({ outputPath: "public/pagefind" });
await pagefind.close();

console.log(`pagefind: indexed ${indexed} pages`);
