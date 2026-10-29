// Tells IndexNow (Bing, Yandex, Seznam, Naver and the others that share it)
// which pages changed, after a production deploy.
//
// A page changed when what it renders changed: its title, description,
// canonical URL, structured data or visible text. Each run hashes every page
// in the live sitemap into a manifest (--out) and submits the pages whose
// hash differs from the previous run's (--manifest), so a template or title
// change counts even though the page's Markdown, and its sitemap lastmod,
// didn't move. Without a previous manifest (the first run, or one expired),
// and with --all, it submits every URL. --dry-run prints what it would submit
// and sends nothing. --commit <sha> waits until production serves that
// commit before hashing.
//
// The key is INDEXNOW_KEY, and it must be served at /<key>.txt (public/), or
// the engines reject the submission. https://www.indexnow.org/documentation
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const HOST = "www.syntaqx.com";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH = 10_000;
const CONCURRENCY = 8;

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const fail = (message) => {
  console.error(`indexnow: ${message}`);
  process.exit(1);
};

const dryRun = flag("--dry-run");
const key = process.env.INDEXNOW_KEY;
if (!dryRun && !key) fail("INDEXNOW_KEY is not set");
if (key && !existsSync(`public/${key}.txt`)) fail(`public/${key}.txt is missing; the key must be served at the site root`);

const previousPath = option("--manifest");
const previous = previousPath && existsSync(previousPath) ? JSON.parse(readFileSync(previousPath, "utf8")) : undefined;

// A deploy reports success as production switches over: wait until it serves this commit.
const commit = option("--commit");
if (commit) {
  for (let attempt = 1; ; attempt++) {
    const home = await fetch(`https://${HOST}/`, { cache: "no-store" }).then((r) => r.text());
    if (home.includes(`/commit/${commit}`)) break;
    if (attempt === 12) fail(`production isn't serving ${commit.slice(0, 7)} after 2 minutes`);
    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }
}

const res = await fetch(`https://${HOST}/sitemap.xml`);
if (!res.ok) fail(`sitemap returned ${res.status}`);
const locs = [...(await res.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(([, loc]) => loc);

/**
 * What a page shows a crawler, without what changes from build to build
 * (asset names, the flight data in scripts, the deployed commit in the header).
 */
function rendered(html) {
  const pick = (re) => html.match(re)?.[1] ?? "";
  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const text = html
    .replace(/<a [^>]*href="https:\/\/github\.com\/syntaqx\/syntaqx\.com\/commit\/[^"]*"[\s\S]*?<\/a>/g, "")
    .replace(/<(script|style|template)\b[\s\S]*?<\/\1>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return [
    pick(/<title>([^<]*)<\/title>/),
    pick(/<meta name="description" content="([^"]*)"/),
    pick(/<link rel="canonical" href="([^"]*)"/),
    ...jsonLd,
    text,
  ].join("\n");
}

// Hash every page when there's a manifest to write or one to compare against.
const manifest = {};
if (option("--out") || previous) {
  const queue = [...locs];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let loc = queue.shift(); loc; loc = queue.shift()) {
        const page = await fetch(loc).catch(() => undefined);
        if (page?.ok) {
          manifest[loc] = createHash("sha256").update(rendered(await page.text())).digest("hex");
        } else {
          // Unknown this run: keep the old hash, so the page is compared again next time.
          console.warn(`indexnow: ${loc} returned ${page?.status ?? "no response"}`);
          if (previous?.[loc]) manifest[loc] = previous[loc];
        }
      }
    }),
  );
  if (option("--out")) writeFileSync(option("--out"), `${JSON.stringify(manifest, null, 2)}\n`);
}

const compare = previous && !flag("--all");
const urls = compare ? locs.filter((loc) => manifest[loc] && manifest[loc] !== previous[loc]) : locs;
const basis = compare ? "rendered content changed since the previous manifest" : previous ? "--all" : "no previous manifest";
console.log(`indexnow: ${urls.length} of ${locs.length} URLs (${basis})`);
if (dryRun) {
  for (const url of urls) console.log(url);
  process.exit(0);
}
if (urls.length === 0) {
  console.log("indexnow: nothing changed, nothing submitted");
  process.exit(0);
}

for (let i = 0; i < urls.length; i += BATCH) {
  const urlList = urls.slice(i, i + BATCH);
  const submit = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList }),
  });
  // 200 and 202 both mean received; 202 while the key is still being verified.
  if (submit.status !== 200 && submit.status !== 202) fail(`${submit.status} ${await submit.text()}`);
  console.log(`indexnow: submitted ${urlList.length} (${submit.status})`);
}
