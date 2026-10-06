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
  // The face is a slanted layer behind the label, so the text stays upright.
  const base =
    "inst group relative isolate inline-flex items-center gap-2.5 px-[1.4rem] py-3.5 transition-colors before:absolute before:inset-0 before:-z-10 before:slant before:border before:transition-colors [&_svg]:transition-transform [&_svg]:duration-200 [&_svg]:ease-[steps(3)] hover:[&_svg]:translate-x-1";
  const variants = {
    primary:
      "text-[#041312] before:border-accent before:bg-accent hover:text-background hover:before:border-foreground hover:before:bg-foreground",
    secondary:
      "text-foreground before:border-border before:bg-surface hover:before:border-foreground",
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
