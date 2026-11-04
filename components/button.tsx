import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button as UIButton } from "@/registry/syntaqx/ui/button";

interface ButtonProps {
  href: string;
  variant?: "primary" | "secondary";
  children: ReactNode;
  external?: boolean;
  /** Save the target as a file instead of navigating to it. */
  download?: boolean;
}

// The site's call-to-action link: the registry Button in its slant shape,
// with the site's type, padding, hover and arrow nudge layered on through
// className, the same way any project would customize it.
const base =
  "inst h-auto gap-2.5 px-[1.15rem] py-2.5 text-[0.6rem] font-normal [&_svg]:transition-transform [&_svg]:duration-200 [&_svg]:ease-[steps(3)] hover:[&_svg]:translate-x-1";
const variants = {
  primary: "hover:bg-foreground hover:text-background",
  secondary: "border-border hover:border-foreground",
};

export function Button({
  href,
  variant = "primary",
  children,
  external = false,
  download = false,
}: ButtonProps) {
  const link = download ? (
    <a href={href} download>
      {children}
    </a>
  ) : external ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <Link href={href}>{children}</Link>
  );

  return (
    <UIButton
      asChild
      shape="slant"
      variant={variant === "primary" ? "default" : "secondary"}
      className={cn(base, variants[variant])}
    >
      {link}
    </UIButton>
  );
}
