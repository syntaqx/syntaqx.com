// Accessibility check against a deployed site, per /docs/frontend/accessibility
// and /docs/quality/cross-platform-testing: axe (WCAG 2.0-2.2 A and AA) on one
// page per route pattern from the sitemap, in dark and light at desktop width
// and dark at 320px. Exits 1 on any violation. Error reporting is blocked so
// the run doesn't file Sentry issues.
//
//   npm run a11y -- https://syntaqxcom-git-branch-syntaqx.vercel.app
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const base = (process.argv[2] ?? "https://www.syntaqx.com").replace(/\/$/, "");
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const RUNS = [
  { scheme: "dark", width: 1280 },
  { scheme: "light", width: 1280 },
  { scheme: "dark", width: 320 },
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

const list = await pages();
// CHROME_PATH runs it with an installed Chrome instead of Playwright's own.
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const failures = [];
for (const run of RUNS) {
  const context = await browser.newContext({
    viewport: { width: run.width, height: 900 },
    colorScheme: run.scheme,
  });
  await context.route(/ingest\.(us\.)?sentry\.io/, (r) => r.abort());
  let i = 0;
  const worker = async () => {
    while (i < list.length) {
      const path = list[i++];
      const page = await context.newPage();
      try {
        await page.goto(`${base}${path}`, { waitUntil: "load", timeout: 60000 });
        await page.waitForTimeout(500);
        const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        for (const v of violations)
          failures.push(
            `${run.scheme} ${run.width}px ${path}: ${v.id} (${v.impact}) ${v.help}\n` +
              v.nodes
                .slice(0, 3)
                .map(
                  (n) =>
                    `    ${n.target.join(" ")}\n      ${n.failureSummary?.split("\n").slice(1).join(" ")}`,
                )
                .join("\n"),
          );
      } catch (e) {
        failures.push(
          `${run.scheme} ${run.width}px ${path}: could not check (${String(e).split("\n")[0]})`,
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

console.log(
  `Checked ${list.length} pages x ${RUNS.length} (${RUNS.map((r) => `${r.scheme} ${r.width}px`).join(", ")}) on ${base}`,
);
if (failures.length) {
  console.log(`\n${failures.length} violation(s):\n\n${failures.join("\n\n")}`);
  process.exit(1);
}
console.log("No violations.");
