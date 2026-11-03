import { execSync } from "node:child_process";

export interface BuildInfo {
  /** Full commit SHA. */
  sha: string;
  /** Uncommitted changes on top of `sha` (local builds only). */
  dirty: boolean;
  /** "preview" or "dev"; null in production, where the commit speaks for itself. */
  label: string | null;
}

const git = (args: string) => execSync(`git ${args}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

/**
 * The commit this build came from. Vercel sets it on every deploy; locally it's
 * read from git on each render, so the footer follows the commit you're on.
 */
export function buildInfo(env: Record<string, string | undefined> = process.env): BuildInfo | null {
  if (env.VERCEL_GIT_COMMIT_SHA) {
    return {
      sha: env.VERCEL_GIT_COMMIT_SHA,
      dirty: false,
      label: env.VERCEL_ENV === "production" ? null : (env.VERCEL_ENV ?? "preview"),
    };
  }
  try {
    return { sha: git("rev-parse HEAD"), dirty: git("status --porcelain") !== "", label: "dev" };
  } catch {
    return null; // no git (a tarball build): hide the readout
  }
}
