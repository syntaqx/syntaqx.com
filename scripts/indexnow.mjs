// Tells IndexNow (Bing, Yandex, Seznam, Naver and the others that share it)
// which pages changed, after a production deploy. Reads the live sitemap and
// submits every URL, or with `--since <ISO date>` only those whose lastmod is
// newer: docs and book chapters date from their last commit, so a deploy
// submits what it changed. Pages without a lastmod go only in a full run.
//
// The key is INDEXNOW_KEY, and it must be served at /<key>.txt (public/), or
// the engines reject the submission. https://www.indexnow.org/documentation
import { existsSync } from "node:fs";

const HOST = "www.syntaqx.com";
const ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH = 10_000;

const key = process.env.INDEXNOW_KEY;
if (!key) {
  console.error("indexnow: INDEXNOW_KEY is not set");
  process.exit(1);
}
if (!existsSync(`public/${key}.txt`)) {
  console.error(`indexnow: public/${key}.txt is missing; the key must be served at the site root`);
  process.exit(1);
}

const sinceArg = process.argv.indexOf("--since");
const since = sinceArg > 0 ? new Date(process.argv[sinceArg + 1]) : undefined;
if (since && Number.isNaN(since.getTime())) {
  console.error(`indexnow: --since ${process.argv[sinceArg + 1]} is not a date`);
  process.exit(1);
}

const res = await fetch(`https://${HOST}/sitemap.xml`);
if (!res.ok) {
  console.error(`indexnow: sitemap returned ${res.status}`);
  process.exit(1);
}
const urls = [...(await res.text()).matchAll(/<url>([\s\S]*?)<\/url>/g)]
  .map(([, entry]) => ({
    loc: entry.match(/<loc>(.*?)<\/loc>/)?.[1],
    lastmod: entry.match(/<lastmod>(.*?)<\/lastmod>/)?.[1],
  }))
  .filter(({ loc, lastmod }) => loc && (!since || (lastmod && new Date(lastmod) > since)))
  .map(({ loc }) => loc);

console.log(`indexnow: ${urls.length} URLs${since ? ` changed since ${since.toISOString()}` : ""}`);

for (let i = 0; i < urls.length; i += BATCH) {
  const urlList = urls.slice(i, i + BATCH);
  const submit = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList }),
  });
  // 200 and 202 both mean received; 202 while the key is still being verified.
  if (submit.status !== 200 && submit.status !== 202) {
    console.error(`indexnow: ${submit.status} ${await submit.text()}`);
    process.exit(1);
  }
  console.log(`indexnow: submitted ${urlList.length} (${submit.status})`);
}
