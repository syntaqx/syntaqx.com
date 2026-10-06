import { fetchGitHubStats } from "@/lib/github";

interface Stat {
  value: string;
  unit?: string;
  label: string;
  href?: string;
}

const fixed: Stat[] = [
  { value: "20", unit: "+", label: "years shipping" },
  { value: "11", label: "age at first line" },
];

const COLS: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

function Strip({ stats }: { stats: Stat[] }) {
  return (
    <section
      className={`-mx-6 mb-20 grid grid-cols-2 gap-px border-y border-border bg-border ${COLS[stats.length] ?? "md:grid-cols-4"}`}
    >
      {stats.map((s) => {
        const body = (
          <>
            <span className="font-voice text-4xl leading-[0.85] font-semibold">
              {s.value}
              {s.unit && (
                <span className="text-[0.5em] text-accent">{s.unit}</span>
              )}
            </span>
            <span className="inst text-dim transition-colors group-hover:text-accent">
              {s.label}
            </span>
          </>
        );
        return s.href ? (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group grid gap-2.5 bg-background px-6 py-5 transition-colors hover:bg-surface"
          >
            {body}
          </a>
        ) : (
          <div key={s.label} className="grid gap-2.5 bg-background px-6 py-5">
            {body}
          </div>
        );
      })}
    </section>
  );
}

/** Placeholder while the live numbers load; same shape, no layout shift. */
export function StatsStripSkeleton() {
  return (
    <Strip
      stats={[
        ...fixed,
        { value: "···", label: "github stars" },
        { value: "···", label: "open-source repos" },
      ]}
    />
  );
}

/** Two fixed facts plus live GitHub numbers. Live cells drop out on failure. */
export async function StatsStrip({ username }: { username: string }) {
  const gh = await fetchGitHubStats(username);
  const live: Stat[] = gh
    ? [
        {
          value: gh.stars.toLocaleString(),
          unit: "★",
          label: "github stars",
          href: `https://github.com/${username}?tab=repositories&sort=stargazers`,
        },
        {
          value: String(gh.repos),
          label: "open-source repos",
          href: `https://github.com/${username}?tab=repositories&type=source`,
        },
      ]
    : [];
  return <Strip stats={[...fixed, ...live]} />;
}
