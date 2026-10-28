// Lists every `<!-- source-gap: ... -->` marker in content/, so claims we
// couldn't source can be rechecked later. Marker format, one line:
//   <!-- source-gap: id | missing|secondary|status | claim | closes with: ... | checked: YYYY-MM-DD -->
// Usage: node scripts/source-gaps.mjs [--json] [--stale DAYS]
// Exits 1 on a malformed marker or a duplicate id.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(import.meta.dirname, "..", "content");
const args = process.argv.slice(2);
const json = args.includes("--json");
const staleAt = args.indexOf("--stale");
const staleDays = staleAt === -1 ? null : Number(args[staleAt + 1]);

const marker = /<!--\s*source-gap:(.*?)-->/g;
const kinds = new Set(["missing", "secondary", "status"]);

function* files(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (entry.name.endsWith(".md")) yield path;
  }
}

const gaps = [];
const errors = [];
for (const path of files(root)) {
  const lines = readFileSync(path, "utf8").split("\n");
  lines.forEach((text, i) => {
    for (const [, body] of text.matchAll(marker)) {
      const where = `${relative(process.cwd(), path)}:${i + 1}`;
      const [id, kind, claim, closes, checked] = body.split("|").map((s) => s.trim());
      const closesWith = closes?.replace(/^closes with:\s*/, "");
      const checkedOn = checked?.replace(/^checked:\s*/, "");
      if (!id || !kinds.has(kind) || !claim || !closesWith || !/^\d{4}-\d{2}-\d{2}$/.test(checkedOn ?? "")) {
        errors.push(`${where}: malformed source-gap marker`);
        continue;
      }
      gaps.push({ id, kind, claim, closesWith, checked: checkedOn, where });
    }
  });
}

const seen = new Map();
for (const gap of gaps) {
  if (seen.has(gap.id)) errors.push(`${gap.where}: duplicate id ${gap.id} (also ${seen.get(gap.id)})`);
  seen.set(gap.id, gap.where);
}

const ageDays = (date) => Math.floor((Date.now() - Date.parse(date)) / 86_400_000);
const shown = staleDays === null ? gaps : gaps.filter((g) => ageDays(g.checked) >= staleDays);

if (json) console.log(JSON.stringify(shown, null, 2));
else for (const g of shown) console.log(`${g.id} [${g.kind}] checked ${g.checked}\n  ${g.where}\n  ${g.claim}\n  closes with: ${g.closesWith}\n`);

for (const e of errors) console.error(e);
if (!json) console.error(`${shown.length} of ${gaps.length} gaps shown`);
process.exit(errors.length ? 1 : 0);
