import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface/50 p-4 ${
        hover ? "transition-all hover:border-accent/30 hover:bg-surface" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
