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
    <div className="border border-border bg-card">
      <div className={className}>{children}</div>
      {note && (
        <div className="border-t border-border px-4 py-2.5 text-[10px] text-muted-foreground">
          {note}
        </div>
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
    <div className={cn("p-4", className)}>
      <div
        className={cn(
          "mb-3 inline-flex items-center gap-1 text-[10px] font-medium",
          kind === "wrong" ? "text-destructive" : "text-primary",
        )}
      >
        <Icon size={11} aria-hidden />
        {kind === "wrong" ? "Common" : "Better"}
      </div>
      {children}
    </div>
  );
}
