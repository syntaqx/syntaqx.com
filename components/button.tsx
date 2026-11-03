import Link from "next/link";
import type { ReactNode, Ref } from "react";

interface ButtonProps {
  /** Where it goes. Without one it's a button, for onClick. */
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  ref?: Ref<HTMLButtonElement>;
  variant?: "primary" | "secondary";
  children: ReactNode;
  external?: boolean;
  /** Save the target as a file instead of navigating to it. */
  download?: boolean;
}

export function Button({
  href,
  variant = "primary",
  children,
  external = false,
  download = false,
  onClick,
  disabled,
  ref,
}: ButtonProps) {
  // The face is a slanted layer behind the label, so the text stays upright.
  const base =
    "inst group relative isolate inline-flex items-center gap-2.5 px-[1.15rem] py-2.5 transition-colors before:absolute before:inset-0 before:-z-10 before:slant before:border before:transition-colors [&_svg]:transition-transform [&_svg]:duration-200 [&_svg]:ease-[steps(3)] hover:[&_svg]:translate-x-1";
  const variants = {
    primary:
      "text-primary-foreground before:border-primary before:bg-primary hover:text-background hover:before:border-foreground hover:before:bg-foreground",
    secondary: "text-foreground before:border-border before:bg-card hover:before:border-foreground",
  };

  const className = `${base} ${variants[variant]}`;

  if (!href) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`${className} cursor-pointer disabled:pointer-events-none disabled:opacity-50`}
      >
        {children}
      </button>
    );
  }

  if (download) {
    return (
      <a href={href} download className={className}>
        {children}
      </a>
    );
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
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
