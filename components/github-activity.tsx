export interface ContributionDay {
  date: string;
  level: number; // 0-4
}

export interface ContributionData {
  days: ContributionDay[];
  total: number;
}

export async function fetchGitHubContributions(
  username: string,
): Promise<ContributionData> {
  try {
    const res = await fetch(
      `https://github.com/users/${username}/contributions`,
      {
        headers: { Accept: "text/html" },
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) return { days: [], total: 0 };

    const html = await res.text();
    const days: ContributionDay[] = [];

    // Each <td> has data-date and data-level attributes
    const cellRegex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g;
    let match;
    while ((match = cellRegex.exec(html)) !== null) {
      days.push({ date: match[1], level: parseInt(match[2]) });
    }

    // Sort by date so we can slice recent weeks
    days.sort((a, b) => a.date.localeCompare(b.date));

    // Extract total contributions
    let total = 0;
    const totalMatch = html.match(
      /([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year/i,
    );
    if (totalMatch) {
      total = parseInt(totalMatch[1].replace(/,/g, ""));
    }

    return { days, total };
  } catch {
    return { days: [], total: 0 };
  }
}

const LEVEL_COLORS = [
  "bg-border/50",
  "bg-accent/20",
  "bg-accent/40",
  "bg-accent/60",
  "bg-accent",
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function GitHubActivity({
  username = "syntaqx",
  data,
}: {
  username?: string;
  data: ContributionData;
}) {
  const { days, total } = data;

  if (days.length === 0) return null;

  const recentDays = days;

  // Organize into columns (weeks) of 7 rows (days)
  const weeks: ContributionDay[][] = [];
  for (let i = 0; i < recentDays.length; i += 7) {
    weeks.push(recentDays.slice(i, i + 7));
  }

  // Figure out month labels
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstDay = week[0];
    if (firstDay) {
      const month = new Date(firstDay.date + "T00:00:00").getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ label: MONTHS[month], col: wi });
        lastMonth = month;
      }
    }
  });

  return (
    <div className="rounded-lg border border-border bg-surface/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium uppercase tracking-widest text-dim">
          Public Activity
        </h3>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-dim hover:text-accent transition-colors"
        >
          {total.toLocaleString()} contributions · GitHub →
        </a>
      </div>

      {/* Month labels */}
      <div className="relative h-4 mb-1">
        {monthLabels.map((m, i) => (
          <span
            key={i}
            className="text-[10px] text-dim absolute top-0"
            style={{
              left: `${(m.col / weeks.length) * 100}%`,
            }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-flow-col auto-cols-fr gap-0.75">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.75">
            {week.map((day) => (
              <div
                key={day.date}
                className={`aspect-square w-full rounded-xs ${LEVEL_COLORS[day.level]}`}
                title={day.date}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className="text-[10px] text-dim mr-1">Less</span>
        {LEVEL_COLORS.map((color, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-xs ${color}`} />
        ))}
        <span className="text-[10px] text-dim ml-1">More</span>
      </div>
    </div>
  );
}
