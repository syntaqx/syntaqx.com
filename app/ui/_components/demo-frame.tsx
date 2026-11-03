import type { ReactNode } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/cn";

/** The box every demo sits in, with a note underneath on what to try. */
export function DemoFrame({
  children,
  note,
  className,
}: {
  children: ReactNode;
  note?: ReactNode;
  className?: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className={className}>{children}</div>
      {note && (
        <div className="border-t px-6 py-3 text-xs/relaxed text-muted-foreground">{note}</div>
      )}
    </div>
  );
}

/**
 * The common way next to the better one, for patterns where feeling the
 * difference teaches more than reading about it. Stacks on narrow screens.
 */
export function Compare({ wrong, right }: { wrong: ReactNode; right: ReactNode }) {
  return (
    <div className="grid sm:grid-cols-2">
      <Side kind="wrong">{wrong}</Side>
      <Side kind="right" className="border-t border-border sm:border-t-0 sm:border-l">
        {right}
      </Side>
    </div>
  );
}

function Side({
  kind,
  children,
  className,
}: {
  kind: "wrong" | "right";
  children: ReactNode;
  className?: string;
}) {
  const Icon = kind === "wrong" ? X : Check;
  return (
    <div className={cn("p-6", className)}>
      <div
        className={cn(
          "mb-4 inline-flex items-center gap-1.5 text-xs font-medium",
          kind === "wrong" ? "text-destructive" : "text-primary",
        )}
      >
        <Icon aria-hidden className="size-3.5" />
        {kind === "wrong" ? "Common" : "Better"}
      </div>
      {children}
    </div>
  );
}
