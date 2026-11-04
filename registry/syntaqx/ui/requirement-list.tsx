import * as React from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

// A field's rules, shown before the first keystroke and ticked off as each
// is met, so nobody has to fail to learn what passes. Point the control's
// aria-describedby at its id (a FieldDescription around it does that): the
// list is read once, not after every keystroke.

export interface Requirement {
  label: React.ReactNode;
  met: boolean;
}

function RequirementList({
  requirements,
  className,
  ...props
}: React.ComponentProps<"ul"> & { requirements: Requirement[] }) {
  return (
    <ul data-slot="requirement-list" className={cn("space-y-1.5", className)} {...props}>
      {requirements.map((r, i) => (
        <li
          key={i}
          data-met={r.met || undefined}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors data-met:text-primary"
        >
          {r.met ? (
            <Check aria-hidden className="size-4 shrink-0" />
          ) : (
            <Circle aria-hidden className="size-4 shrink-0 scale-50" />
          )}
          <span>
            {r.label}
            <span className="sr-only">{r.met ? " (met)" : " (not met)"}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export { RequirementList };
