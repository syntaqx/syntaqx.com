// Accessibility check against a deployed site, per /docs/frontend/accessibility
// and /docs/quality/cross-platform-testing: axe (WCAG 2.0-2.2 A and AA) on one
// page per route pattern from the sitemap, in dark and light at desktop width
// and dark at 320px. Exits 1 on any violation. Error reporting is blocked so
// the run doesn't file Sentry issues.
//
//   npm run a11y -- https://syntaqxcom-git-branch-syntaqx.vercel.app
//   npm run a11y -- https://... --shard 2/4   (the second quarter of the pages)
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const args = process.argv.slice(2);
const shardArg = args.indexOf("--shard");
const [shard, shards] = shardArg >= 0 ? args.splice(shardArg, 2)[1].split("/").map(Number) : [1, 1];
const base = (args[0] ?? "https://www.syntaqx.com").replace(/\/$/, "");
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
// Each width loads a page once and checks it in every scheme listed.
const RUNS = [
  { width: 1280, schemes: ["dark", "light"] },
  { width: 320, schemes: ["dark"] },
];

/** One URL per pattern: every page two levels deep, then the first of each deeper group. */
async function pages() {
  const xml = await (await fetch(`${base}/sitemap.xml`)).text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const seen = new Set();
  const picked = [];
  for (const p of paths) {
    const parts = p.split("/").filter(Boolean);
    // /docs/section/slug, /books/book/chapter, /books/book/glossary/part
    const group = parts.length <= 2 ? p : `${parts.slice(0, 2).join("/")}/${parts.length}`;
    if (seen.has(group)) continue;
    seen.add(group);
    picked.push(p);
  }
  return picked;
}

const list = (await pages()).filter((_, i) => i % shards === shard - 1);
// CHROME_PATH runs it with an installed Chrome instead of Playwright's own.
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const failures = [];
for (const run of RUNS) {
  const context = await browser.newContext({
    viewport: { width: run.width, height: 900 },
    colorScheme: run.schemes[0],
  });
  await context.route(/ingest\.(us\.)?sentry\.io/, (r) => r.abort());
  let i = 0;
  const worker = async () => {
    while (i < list.length) {
      const path = list[i++];
      const page = await context.newPage();
      let scheme = run.schemes[0];
      try {
        await page.goto(`${base}${path}`, { waitUntil: "load", timeout: 60000 });
        await page.waitForTimeout(500);
        // Switching schemes on a loaded page fades transition-colors
        // elements; axe would read their contrast mid-fade.
        if (run.schemes.length > 1)
          await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important}" });
        for (scheme of run.schemes) {
          await page.emulateMedia({ colorScheme: scheme });
          const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
          for (const v of violations)
            failures.push(
              `${scheme} ${run.width}px ${path}: ${v.id} (${v.impact}) ${v.help}\n` +
                v.nodes
                  .slice(0, 3)
                  .map(
                    (n) =>
                      `    ${n.target.join(" ")}\n      ${n.failureSummary?.split("\n").slice(1).join(" ")}`,
                  )
                  .join("\n"),
            );
        }
      } catch (e) {
        failures.push(
          `${scheme} ${run.width}px ${path}: could not check (${String(e).split("\n")[0]})`,
        );
      } finally {
        await page.close();
      }
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  await context.close();
}
await browser.close();

const passes = RUNS.flatMap((r) => r.schemes.map((s) => `${s} ${r.width}px`));
console.log(
  `Checked ${list.length} pages${shards > 1 ? ` (shard ${shard}/${shards})` : ""} x ${passes.length} (${passes.join(", ")}) on ${base}`,
);
if (failures.length) {
  console.log(`\n${failures.length} violation(s):\n\n${failures.join("\n\n")}`);
  process.exit(1);
}
console.log("No violations.");
