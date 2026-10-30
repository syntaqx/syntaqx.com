import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        "border border-border bg-surface p-4",
        hover && "transition-colors hover:border-border-hover hover:handles",
        className,
      )}
    >
      {children}
    </div>
  );
}
