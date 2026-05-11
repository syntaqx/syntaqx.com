export const socials = [
  { href: "https://github.com/syntaqx", icon: "github", label: "GitHub" },
  {
    href: "https://www.linkedin.com/in/syntaqx/",
    icon: "linkedin",
    label: "LinkedIn",
  },
  { href: "https://x.com/syntaqx", icon: "x", label: "X" },
  {
    href: "https://stackoverflow.com/users/1295839/syntaqx",
    icon: "stackoverflow",
    label: "Stack Overflow",
  },
];

export const nav = [
  { href: "/posts", label: "posts" },
  { href: "/projects", label: "projects" },
  { href: "/docs", label: "docs" },
  { href: "/misc", label: "misc" },
  { href: "/about", label: "about" },
];

// Vacation ranges (inclusive start, exclusive end) used to annotate the
// GitHub activity graph. Zero-contribution days inside these windows are
// rendered as vacation rather than as quiet days.
export const vacations: { label: string; start: string; end: string }[] = [
  { label: "Rome", start: "2026-04-04", end: "2026-04-14" },
];
