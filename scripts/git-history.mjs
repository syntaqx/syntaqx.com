// Fetches full git history before the build when the checkout is shallow,
// so each doc's "last updated" date comes from its real last commit.
//
// Vercel clones with --depth=10, where the oldest fetched commit appears to
// add every file. The repository is public, so history can be fetched from
// GitHub without credentials. Anything that goes wrong here is non-fatal:
// lib/doc-dates.ts shows no date rather than a wrong one.
import { execFileSync } from "node:child_process";

const REPO = "https://github.com/syntaqx/syntaqx.com.git";

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

try {
  if (git("rev-parse", "--is-shallow-repository") !== "true") {
    console.log("git-history: full history present");
  } else {
    const started = Date.now();
    git("fetch", "--unshallow", "--no-tags", REPO);
    console.log(`git-history: unshallowed in ${Date.now() - started}ms`);
  }
} catch (error) {
  console.warn(`git-history: skipped (${String(error.message ?? error).split("\n")[0]})`);
}
