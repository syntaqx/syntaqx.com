import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

/**
 * When each doc last changed, from git history.
 *
 * Builds often run on a shallow clone (Vercel clones with --depth=10), where
 * the oldest fetched commit appears to add every file. A file whose latest
 * commit is that boundary would get the boundary's date, which looks right
 * and is wrong. Those files get no date instead: a missing date is honest, a
 * fabricated one isn't. scripts/git-history.mjs unshallows the clone before
 * the build so this rarely matters.
 */

const SEP = "\u0001";

/**
 * Parse `git log --format=<SEP>%H<SEP>%cI --name-only` output, newest first,
 * into each file's latest commit date. Files whose latest commit is a shallow
 * boundary are left out, because their real last change isn't in the history.
 */
export function parseLastModified(
  log: string,
  shallowBoundaries: ReadonlySet<string> = new Set(),
): Map<string, string> {
  const dates = new Map<string, string>();
  const unknown = new Set<string>();
  let commit = "";
  let date = "";

  for (const raw of log.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith(SEP)) {
      [, commit, date] = line.split(SEP);
      continue;
    }
    if (dates.has(line) || unknown.has(line)) continue;
    if (shallowBoundaries.has(commit)) unknown.add(line);
    else dates.set(line, date);
  }

  return dates;
}

let cache: Map<string, string> | undefined;

function git(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}

/** Every doc's last-modified time (ISO 8601), keyed by repo-relative path. */
export function docDates(): Map<string, string> {
  if (cache) return cache;
  try {
    const shallowFile = git(["rev-parse", "--git-path", "shallow"]).trim();
    const boundaries = new Set(
      existsSync(shallowFile)
        ? readFileSync(shallowFile, "utf8").split("\n").map((s) => s.trim()).filter(Boolean)
        : [],
    );
    const log = git(["log", `--format=${SEP}%H${SEP}%cI`, "--name-only", "--", "content/docs"]);
    cache = parseLastModified(log, boundaries);
  } catch {
    // No git (or no repository) where this runs: show no dates.
    cache = new Map();
  }
  return cache;
}

/** When `content/docs/<slug>.md` last changed, or undefined if that isn't known. */
export function docLastModified(slug: string): string | undefined {
  return docDates().get(`content/docs/${slug}.md`);
}
