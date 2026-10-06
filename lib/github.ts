export interface GitHubStats {
  /** Stars across the user's own (non-fork) public repos. */
  stars: number;
  /** Count of the user's own (non-fork) public repos. */
  repos: number;
}

interface Repo {
  fork: boolean;
  stargazers_count: number;
}

/**
 * Public repo stats from the GitHub REST API. Unauthenticated, so it's
 * cached for a day to stay well inside the rate limit. Returns null on any
 * failure; callers should leave the numbers out rather than show a guess.
 */
export async function fetchGitHubStats(
  username: string,
): Promise<GitHubStats | null> {
  try {
    const own: Repo[] = [];
    for (let page = 1; page <= 5; page++) {
      const res = await fetch(
        `https://api.github.com/users/${username}/repos?type=owner&per_page=100&page=${page}`,
        {
          headers: { Accept: "application/vnd.github+json" },
          next: { revalidate: 86400 },
        },
      );
      if (!res.ok) return null;
      const batch = (await res.json()) as Repo[];
      own.push(...batch.filter((r) => !r.fork));
      if (batch.length < 100) break;
    }
    return {
      stars: own.reduce((sum, r) => sum + r.stargazers_count, 0),
      repos: own.length,
    };
  } catch {
    return null;
  }
}
