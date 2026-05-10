import { TodayHighlight } from "@/components/today-highlight";

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

  // Pad current month with future days so it shows the full month
  const today = new Date();
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const lastDataDate =
    recentDays.length > 0
      ? new Date(recentDays[recentDays.length - 1].date + "T00:00:00")
      : today;

  // Add placeholder days from tomorrow to end of month
  const futureDays: ContributionDay[] = [];
  const nextDay = new Date(lastDataDate);
  nextDay.setDate(nextDay.getDate() + 1);
  while (nextDay <= lastDayOfMonth) {
    futureDays.push({
      date: `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, "0")}-${String(nextDay.getDate()).padStart(2, "0")}`,
      level: -1, // sentinel for "future"
    });
    nextDay.setDate(nextDay.getDate() + 1);
  }

  // Add future days into the last partial week or create new weeks
  if (futureDays.length > 0) {
    const lastWeek = weeks[weeks.length - 1];
    if (lastWeek && lastWeek.length < 7) {
      const remaining = 7 - lastWeek.length;
      lastWeek.push(...futureDays.splice(0, remaining));
    }
    for (let i = 0; i < futureDays.length; i += 7) {
      weeks.push(futureDays.slice(i, i + 7));
    }
  }

  // Group weeks by month
  const monthGroups: { label: string; weeks: ContributionDay[][] }[] = [];
  weeks.forEach((week) => {
    const firstDay = week[0];
    if (!firstDay) return;
    const month = new Date(firstDay.date + "T00:00:00").getMonth();
    const label = MONTHS[month];
    const last = monthGroups[monthGroups.length - 1];
    if (last && last.label === label) {
      last.weeks.push(week);
    } else {
      monthGroups.push({ label, weeks: [week] });
    }
  });

  return (
    <div className="rounded-lg border border-border bg-surface/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium uppercase tracking-widest text-dim">
          GitHub Activity
        </h3>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-dim hover:text-accent transition-colors"
        >
          {total.toLocaleString()} contributions →
        </a>
      </div>

      {/* Grid — clips older months from the left, shows most recent */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-surface/50 to-transparent z-10 pointer-events-none" />
        <div className="flex justify-end py-0.5">
          {monthGroups.map((group, gi) => (
            <div
              key={gi}
              className={`flex flex-col shrink-0 ${gi > 0 ? "border-l border-border/50 pl-0.75" : ""}`}
            >
              {/* Month label */}
              <span className="text-[10px] text-dim mb-1 text-center">
                {group.label}
              </span>
              {/* Weeks in this month */}
              <div
                className="grid grid-flow-col auto-cols-[10px] sm:auto-cols-[12px] md:auto-cols-[13px] gap-0.75"
                style={{ gridTemplateRows: "repeat(7, 1fr)" }}
              >
                {group.weeks.map((week) =>
                  week.map((day) => (
                    <div
                      key={day.date}
                      data-date={day.date}
                      className={`aspect-square rounded-xs ${
                        day.level === -1
                          ? "bg-border/20 border border-dashed border-border/30"
                          : LEVEL_COLORS[day.level]
                      }`}
                      title={day.date}
                    />
                  )),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className="text-[10px] text-dim mr-1">Less</span>
        {LEVEL_COLORS.map((color, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-xs ${color}`} />
        ))}
        <span className="text-[10px] text-dim ml-1">More</span>
      </div>

      <TodayHighlight />
    </div>
  );
}
