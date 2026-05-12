import { TodayHighlight } from "@/components/today-highlight";
import { OWNER_TZ, vacations } from "@/lib/constants";

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

const VACATION_RING = "ring-1 ring-amber-500/60 ring-inset";
const HOLIDAY_RING = "ring-1 ring-sky-400/60 ring-inset";

/** Returns the matching vacation label for a date string, or null. */
function vacationFor(date: string): string | null {
  for (const v of vacations) {
    if (date >= v.start && date < v.end) return v.label;
  }
  return null;
}

/** nth weekday of a month, e.g. 3rd Monday of January. */
function nthWeekdayOfMonth(
  year: number,
  month: number, // 0-indexed
  weekday: number, // 0=Sun ... 6=Sat
  n: number,
): string {
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  const day = 1 + offset + (n - 1) * 7;
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Last weekday of a month, e.g. last Monday of May. */
function lastWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
): string {
  const last = new Date(year, month + 1, 0);
  const offset = (last.getDay() - weekday + 7) % 7;
  const day = last.getDate() - offset;
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Shift a fixed-date holiday to the federally observed weekday.
 *  Saturday is observed on the preceding Friday; Sunday on the following Monday. */
function observed(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const dow = d.getDay();
  if (dow === 0)
    d.setDate(d.getDate() + 1); // Sun -> Mon
  else if (dow === 6) d.setDate(d.getDate() - 1); // Sat -> Fri
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function holidaysForYear(year: number): Record<string, string> {
  return {
    [observed(`${year}-01-01`)]: "New Year's Day",
    [nthWeekdayOfMonth(year, 0, 1, 3)]: "MLK Day",
    [nthWeekdayOfMonth(year, 1, 1, 3)]: "Presidents' Day",
    [lastWeekdayOfMonth(year, 4, 1)]: "Memorial Day",
    [observed(`${year}-06-19`)]: "Juneteenth",
    [observed(`${year}-07-04`)]: "Independence Day",
    [nthWeekdayOfMonth(year, 8, 1, 1)]: "Labor Day",
    [nthWeekdayOfMonth(year, 9, 1, 2)]: "Columbus Day",
    [observed(`${year}-11-11`)]: "Veterans Day",
    [nthWeekdayOfMonth(year, 10, 4, 4)]: "Thanksgiving",
    [observed(`${year}-12-25`)]: "Christmas",
  };
}

/** Cached holiday map keyed by date string across the relevant years. */
const HOLIDAY_MAP: Record<string, string> = (() => {
  const now = new Date();
  const out: Record<string, string> = {};
  for (let y = now.getFullYear() - 1; y <= now.getFullYear() + 1; y++) {
    Object.assign(out, holidaysForYear(y));
  }
  return out;
})();

function holidayFor(date: string): string | null {
  return HOLIDAY_MAP[date] ?? null;
}

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

  // GitHub's contributions HTML returns the full calendar week the owner is
  // in, padding the trailing days of that week with level-0 cells. Those
  // look identical to "a day with no commits," so we trim anything past the
  // owner's local today. Anchored on the owner because that's whose day
  // GitHub is binning — not the server's UTC, not the viewer's clock.
  const ownerToday = new Intl.DateTimeFormat("en-CA", {
    timeZone: OWNER_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const recentDays = days.filter((d) => d.date <= ownerToday);

  if (recentDays.length === 0) return null;

  // Organize into columns (weeks) of 7 rows (days)
  const weeks: ContributionDay[][] = [];
  for (let i = 0; i < recentDays.length; i += 7) {
    weeks.push(recentDays.slice(i, i + 7));
  }

  // No future-day padding: the grid ends at the last day GitHub returned.
  // Drawing dashed sentinel cells for "the rest of the month" reads as
  // activity that hasn't happened yet, which is misleading.

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

      {/* Grid — scrollable when content overflows */}
      <div className="relative overflow-x-auto" style={{ direction: "rtl" }}>
        <div
          className="flex py-0.5"
          style={{ direction: "ltr", width: "max-content", marginLeft: "auto" }}
        >
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
                  week.map((day) => {
                    const vacation = vacationFor(day.date);
                    const holiday = !vacation ? holidayFor(day.date) : null;
                    const base = LEVEL_COLORS[day.level];
                    const className = vacation
                      ? `${base} ${VACATION_RING}`
                      : holiday
                        ? `${base} ${HOLIDAY_RING}`
                        : base;
                    const title = vacation
                      ? `${day.date}: Vacation (${vacation})`
                      : holiday
                        ? `${day.date}: ${holiday}`
                        : day.date;
                    return (
                      <div
                        key={day.date}
                        data-date={day.date}
                        className={`aspect-square rounded-xs ${className}`}
                        title={title}
                      />
                    );
                  }),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-xs ring-1 ring-accent ring-inset" />
          <span className="text-[10px] text-dim">Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2.5 h-2.5 rounded-xs bg-border/50 ${VACATION_RING}`}
          />
          <span className="text-[10px] text-dim">Vacation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2.5 h-2.5 rounded-xs bg-border/50 ${HOLIDAY_RING}`}
          />
          <span className="text-[10px] text-dim">US Holiday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-dim">Less</span>
          {LEVEL_COLORS.map((color, i) => (
            <div key={i} className={`w-2.5 h-2.5 rounded-xs ${color}`} />
          ))}
          <span className="text-[10px] text-dim">More</span>
        </div>
      </div>

      <TodayHighlight />
    </div>
  );
}
