/**
 * Pure helpers for scripts/check-doc-links.mjs, the weekly check that every
 * source the playbook cites still resolves (see /docs/delivery/ci-pipelines).
 * Kept free of imports and non-erasable TypeScript so Node can run it
 * directly with type stripping.
 */

export type LinkStatus = "ok" | "dead" | "uncertain";

/** Fenced code blocks hold illustrative URLs (api.example.com/...), not citations. */
function stripCodeFences(markdown: string): string {
  return markdown.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, "");
}

/**
 * External URLs cited as Markdown link targets, without fragments, deduped.
 * Bare URLs and code samples are examples, not sources, so they're skipped.
 */
export function extractLinks(markdown: string): string[] {
  const urls = new Set<string>();
  // Allows one level of balanced parentheses, as Markdown does: Apple's docs
  // live at URLs like .../applicationdidenterbackground(_:).
  const link = /\]\((https?:\/\/(?:[^()\s]|\([^()\s]*\))+)\)/g;
  for (const match of stripCodeFences(markdown).matchAll(link)) {
    urls.add(match[1].split("#")[0]);
  }
  return [...urls];
}

/** DNS and connection failures that mean the host is gone, not just unhappy with us. */
const DEAD_ERROR_CODES = new Set(["ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED", "ERR_INVALID_URL"]);

/**
 * Classify one check. Only a definite "this doesn't exist" is dead. Bot walls
 * (401, 403, 429), server errors and timeouts are uncertain: many sources the
 * playbook cites (IETF datatracker, Stripe, Google) block automated clients,
 * and failing the job on those would teach everyone to ignore it.
 */
export function classify(result: { status?: number; errorCode?: string }): LinkStatus {
  if (result.errorCode) return DEAD_ERROR_CODES.has(result.errorCode) ? "dead" : "uncertain";
  const status = result.status ?? 0;
  if (status >= 200 && status < 400) return "ok";
  if (status === 404 || status === 410) return "dead";
  return "uncertain";
}

export interface LinkResult {
  url: string;
  status: LinkStatus;
  detail: string;
  citedBy: string[];
}

/** A Markdown report grouped by status, dead first. */
export function renderReport(results: LinkResult[], { deadOnly = false } = {}): string {
  const groups: [LinkStatus, string][] = [
    ["dead", "Dead"],
    ["uncertain", "Uncertain (bot walls, rate limits, server errors, timeouts)"],
    ["ok", "OK"],
  ];
  const counts = Object.fromEntries(groups.map(([s]) => [s, results.filter((r) => r.status === s).length]));
  const lines = [
    `# Playbook link check`,
    "",
    `${results.length} cited URLs: ${counts.dead} dead, ${counts.uncertain} uncertain, ${counts.ok} OK.`,
  ];
  for (const [status, title] of groups) {
    if (deadOnly && status !== "dead") continue;
    const group = results.filter((r) => r.status === status).sort((a, b) => a.url.localeCompare(b.url));
    if (group.length === 0 || status === "ok") continue;
    lines.push("", `## ${title}`, "");
    for (const r of group) lines.push(`- ${r.url} (${r.detail}), cited in ${r.citedBy.map((f) => `\`${f}\``).join(", ")}`);
  }
  return lines.join("\n") + "\n";
}
