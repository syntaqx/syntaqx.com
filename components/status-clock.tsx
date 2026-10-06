"use client";

import { useEffect, useState } from "react";
import { OWNER_TZ } from "@/lib/constants";

const format = () =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: OWNER_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

/** The owner's local time, for the header status bar. */
export function StatusClock() {
  // Rendered empty on the server and filled in after mount, so the markup
  // never disagrees with the client about what minute it is.
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setTime(format());
    update();
    const id = setInterval(update, 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="inst hidden items-center gap-2 border-l border-border px-4 text-dim lg:flex"
      title="Local time in Salt Lake City"
    >
      slc
      <time className="min-w-[5ch] tabular-nums text-foreground">
        {time ?? "--:--"}
      </time>
    </span>
  );
}
