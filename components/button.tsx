import Link from "next/link";
import type { ReactNode } from "react";

interface ButtonProps {
  href: string;
  variant?: "primary" | "secondary";
  children: ReactNode;
  external?: boolean;
}

export function Button({
  href,
  variant = "primary",
  children,
  external = false,
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-colors";
  const variants = {
    primary: "bg-accent text-background hover:bg-accent/90",
    secondary:
      "border border-border text-muted hover:text-foreground hover:border-border-hover",
  };

  const className = `${base} ${variants[variant]}`;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
