// Checks every external source the playbook cites (Markdown link targets in
// content/docs and docs/adr) and prints a Markdown report grouped by status.
// Exits 1 only when a link is definitely dead (404, 410, unknown host); bot
// walls and timeouts are reported as uncertain without failing the run.
//
//   node scripts/check-doc-links.mjs [--dead-report <file>]
//
// --dead-report also writes just the dead links to a file, for the issue body.
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { classify, extractLinks, renderReport } from "../lib/doc-links.ts";

const ROOTS = ["content/docs", "docs/adr"];
const TIMEOUT_MS = 15_000;
const CONCURRENCY = 8;
const USER_AGENT =
  "Mozilla/5.0 (compatible; syntaqx-link-check/1.0; +https://github.com/syntaqx/syntaqx.com)";

async function markdownFiles(dir) {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => path.join(e.parentPath, e.name).split(path.sep).join("/"));
}

async function request(url, method) {
  const res = await fetch(url, {
    method,
    redirect: "follow",
    headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml,*/*" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  await res.body?.cancel();
  return res.status;
}

async function check(url) {
  try {
    let status = await request(url, "HEAD");
    // Plenty of servers mishandle HEAD (405, 403, even 404); confirm with GET.
    if (status >= 400) status = await request(url, "GET");
    return { status, detail: String(status) };
  } catch (error) {
    const errorCode = error?.cause?.code ?? (error?.name === "TimeoutError" ? "TIMEOUT" : error?.name);
    return { errorCode, detail: errorCode ?? "error" };
  }
}

async function main() {
  const deadReportIndex = process.argv.indexOf("--dead-report");
  const deadReportPath = deadReportIndex > -1 ? process.argv[deadReportIndex + 1] : undefined;

  const citedBy = new Map();
  for (const root of ROOTS) {
    for (const file of await markdownFiles(root)) {
      for (const url of extractLinks(await readFile(file, "utf8"))) {
        citedBy.set(url, [...(citedBy.get(url) ?? []), file]);
      }
    }
  }

  const urls = [...citedBy.keys()];
  const results = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < urls.length) {
        const url = urls[next++];
        const outcome = await check(url);
        results.push({ url, status: classify(outcome), detail: outcome.detail, citedBy: citedBy.get(url) });
      }
    }),
  );

  process.stdout.write(renderReport(results));
  if (deadReportPath) await writeFile(deadReportPath, renderReport(results, { deadOnly: true }));
  process.exitCode = results.some((r) => r.status === "dead") ? 1 : 0;
}

await main();
