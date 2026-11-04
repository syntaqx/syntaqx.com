"use client";

import * as React from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

// The GOV.UK error summary: on a failed submit, a box at the top of the form
// takes focus, says how many problems there are, and links each one to its
// field. Inline errors stay too: the summary is for finding problems, the
// inline message is for fixing them.
//
// Pass a new `focusKey` (a submit counter works) to move focus to the
// summary again on every failed submit.

export interface ErrorSummaryItem {
  /** The id of the field the message is about. */
  fieldId: string;
  message: React.ReactNode;
}

function ErrorSummary({
  errors,
  focusKey,
  title,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  errors: ErrorSummaryItem[];
  focusKey?: React.Key;
  /** Defaults to "There is 1 problem" / "There are N problems". */
  title?: React.ReactNode;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const headingId = React.useId();
  const hasErrors = errors.length > 0;

  React.useEffect(() => {
    if (hasErrors && focusKey !== undefined) ref.current?.focus();
    // Focus follows submits, not every edit that changes the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey]);

  if (!hasErrors) return null;

  const heading =
    title ?? (errors.length === 1 ? "There is 1 problem" : `There are ${errors.length} problems`);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      aria-labelledby={headingId}
      data-slot="error-summary"
      className={cn(
        "rounded-md border border-destructive/60 bg-destructive/5 p-4 outline-none focus:ring-3 focus:ring-destructive/25",
        className,
      )}
      {...props}
    >
      <p
        id={headingId}
        className="mb-2 flex items-center gap-2 text-sm font-semibold text-destructive"
      >
        <CircleAlert aria-hidden className="size-4 shrink-0" />
        {heading}
      </p>
      <ul className="space-y-1 pl-6">
        {errors.map((e) => (
          <li key={e.fieldId}>
            <a
              href={`#${e.fieldId}`}
              onClick={(event) => {
                const field = document.getElementById(e.fieldId);
                if (!field) return;
                event.preventDefault();
                field.focus({ preventScroll: true });
                field.scrollIntoView({ block: "center", behavior: "smooth" });
              }}
              className="text-sm text-destructive underline underline-offset-4 hover:decoration-2"
            >
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { ErrorSummary };
