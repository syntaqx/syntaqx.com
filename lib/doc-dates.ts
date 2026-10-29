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
 * Parse `git log --format=<SEP>%H<SEP>%cI --name-status -M` output, newest
 * first, into each file's latest commit date. Files whose latest commit is a
 * shallow boundary are left out, because their real last change isn't in the
 * history. A pure move (R100) isn't an edit: the file keeps the date of its
 * last change under the old path. Plain `--name-only` lines also parse.
 */
export function parseLastModified(
  log: string,
  shallowBoundaries: ReadonlySet<string> = new Set(),
): Map<string, string> {
  return parseHistory(log, shallowBoundaries).modified;
}

/**
 * The same log, into the date each file was first added, following moves back
 * to the original path. A file first seen at a shallow boundary may be older
 * than the history shows, so it's left out; one deleted and added again dates
 * from the newer add.
 */
export function parseFirstAdded(
  log: string,
  shallowBoundaries: ReadonlySet<string> = new Set(),
): Map<string, string> {
  return parseHistory(log, shallowBoundaries).added;
}

function parseHistory(log: string, shallowBoundaries: ReadonlySet<string>) {
  const dates = new Map<string, string>();
  const unknown = new Set<string>();
  const added = new Map<string, string>();
  // Paths deleted before their current file was added: older history is another file's.
  const recreated = new Set<string>();
  // Older paths of files that moved, mapped to where they live now.
  const movedTo = new Map<string, string>();
  const current = (path: string) => movedTo.get(path) ?? path;
  let commit = "";
  let date = "";

  for (const raw of log.split("\n")) {
    const entry = raw.trim();
    if (!entry) continue;
    if (entry.startsWith(SEP)) {
      [, commit, date] = entry.split(SEP);
      continue;
    }
    const fields = entry.split("\t");
    const line = current(fields[fields.length - 1]);
    if (fields[0] === "D") {
      if (added.has(line)) recreated.add(line);
      continue;
    }
    if (!recreated.has(line)) {
      if (shallowBoundaries.has(commit)) added.delete(line);
      else added.set(line, date);
    }
    if (fields[0].startsWith("R")) {
      movedTo.set(fields[1], line);
      if (fields[0] === "R100") continue;
    }
    if (dates.has(line) || unknown.has(line)) continue;
    if (shallowBoundaries.has(commit)) unknown.add(line);
    else dates.set(line, date);
  }

  return { modified: dates, added };
}

let cache: { modified: Map<string, string>; added: Map<string, string> } | undefined;

function git(args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}

/** Every doc's last-modified and first-added times (ISO 8601), keyed by repo-relative path. */
export function docDates(): { modified: Map<string, string>; added: Map<string, string> } {
  if (cache) return cache;
  try {
    const shallowFile = git(["rev-parse", "--git-path", "shallow"]).trim();
    const boundaries = new Set(
      existsSync(shallowFile)
        ? readFileSync(shallowFile, "utf8").split("\n").map((s) => s.trim()).filter(Boolean)
        : [],
    );
    const log = git(["log", `--format=${SEP}%H${SEP}%cI`, "--name-status", "-M", "--", "content/docs", "content/books"]);
    cache = parseHistory(log, boundaries);
  } catch {
    // No git (or no repository) where this runs: show no dates.
    cache = { modified: new Map(), added: new Map() };
  }
  return cache;
}

/** When `content/<root>/<slug>.md` last changed, or undefined if that isn't known. */
export function docLastModified(slug: string, root: "docs" | "books" = "docs"): string | undefined {
  return docDates().modified.get(`content/${root}/${slug}.md`);
}

/** When `content/<root>/<slug>.md` was first added, or undefined if that isn't known. */
export function docFirstPublished(slug: string, root: "docs" | "books" = "docs"): string | undefined {
  return docDates().added.get(`content/${root}/${slug}.md`);
}
