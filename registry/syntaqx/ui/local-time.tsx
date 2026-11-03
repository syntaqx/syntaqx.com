"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { IntentHoverCard } from "@/registry/syntaqx/ui/intent-hover-card";

// An instant rendered in the viewer's timezone with the zone abbreviation
// always visible. On intent, a card shows the same instant where it happened
// and in UTC.

export interface LocalTimeProps {
  // RFC 3339 / ISO 8601 instant.
  iso: string;
  // IANA tz where the event actually happened.
  sourceTz: string;
  // Human label for the source (e.g. "Stripe HQ").
  sourceLabel: string;
  // "datetime" shows date + time + tz abbr; "date" shows just date + tz abbr.
  // Use "date" in cramped surfaces (table cells, list rows) where the time
  // isn't load-bearing but the tz still matters.
  variant?: "datetime" | "date";
  align?: "start" | "end";
}

function formatDate(date: Date, tz: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatTime(date: Date, tz: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function tzAbbr(date: Date, tz: string) {
  // Pull the localized short tz name (e.g. "MDT", "CET", "JST"). Falls back
  // to the IANA id if the runtime doesn't expose a `timeZoneName` part for
  // this zone.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "short",
  }).formatToParts(date);
  return parts.find((p) => p.type === "timeZoneName")?.value ?? tz;
}

export function LocalTime({
  iso,
  sourceTz,
  sourceLabel,
  variant = "datetime",
  align = "end",
}: LocalTimeProps) {
  const date = new Date(iso);
  const [viewerTz, setViewerTz] = useState<string | null>(null);

  // SSR-safe: viewer tz only resolves client-side. Until hydration we render
  // in UTC so the server output matches. The setState-in-effect is the whole
  // point here: we *want* a re-render once we know the viewer's zone.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setViewerTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const displayTz = viewerTz ?? "UTC";
  const displayAbbr = tzAbbr(date, displayTz);
  const label =
    variant === "date"
      ? `${formatDate(date, displayTz)} (${displayAbbr})`
      : `${formatDate(date, displayTz)} · ${formatTime(date, displayTz)} ${displayAbbr}`;

  return (
    <IntentHoverCard
      className="w-80"
      align={align}
      trigger={
        <time
          dateTime={iso}
          className="cursor-help whitespace-nowrap text-foreground underline decoration-muted-foreground decoration-dotted underline-offset-4"
        >
          {label}
        </time>
      }
    >
      <div className="mb-2 text-[10px] font-medium text-muted-foreground">Time conversion</div>
      <div className="space-y-1.5">
        <TzRow
          label={sourceLabel}
          tz={sourceTz}
          date={formatDate(date, sourceTz)}
          time={formatTime(date, sourceTz)}
          abbr={tzAbbr(date, sourceTz)}
          highlight
        />
        <TzRow
          label="You"
          tz={displayTz}
          date={formatDate(date, displayTz)}
          time={formatTime(date, displayTz)}
          abbr={displayAbbr}
        />
        <TzRow
          label="UTC"
          tz="UTC"
          date={formatDate(date, "UTC")}
          time={formatTime(date, "UTC")}
          abbr="UTC"
        />
      </div>
    </IntentHoverCard>
  );
}

function TzRow({
  label,
  tz,
  date,
  time,
  abbr,
  highlight,
}: {
  label: string;
  tz: string;
  date: string;
  time: string;
  abbr: string;
  highlight?: boolean;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-baseline gap-x-3">
      <span className="min-w-0 truncate text-[11px] text-muted-foreground">
        {label}
        {label !== tz && <span className="ml-1 text-[10px] text-muted-foreground/70">({tz})</span>}
      </span>
      <span
        className={cn("whitespace-nowrap text-xs", highlight ? "text-primary" : "text-foreground")}
      >
        {date}
      </span>
      <span
        className={cn(
          "whitespace-nowrap text-xs tabular-nums",
          highlight ? "text-primary" : "text-foreground",
        )}
      >
        {time} <span className="text-muted-foreground">{abbr}</span>
      </span>
    </div>
  );
}
