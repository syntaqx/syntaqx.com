// Canonical origin for the public site. www is the primary domain in Vercel;
// the apex (syntaqx.com) 307-redirects to it. Every canonical/OG/sitemap URL
// MUST use this so we never emit a URL that immediately redirects.
export const SITE_URL = "https://www.syntaqx.com";

export const CONTACT_EMAIL = "syntaqx@gmail.com";

export const socials = [
  { href: "https://github.com/syntaqx", icon: "github", label: "GitHub" },
  {
    href: "https://www.linkedin.com/in/syntaqx/",
    icon: "linkedin",
    label: "LinkedIn",
  },
  {
    href: "https://stackoverflow.com/users/1295839/syntaqx",
    icon: "stackoverflow",
    label: "Stack Overflow",
  },
  { href: "https://x.com/syntaqx", icon: "x", label: "X" },
];

// Homepage bio. Also rendered into the Markdown homepage (lib/markdown.ts).
export const bio = [
  {
    label: "currently",
    text: "I lead software engineering orgs, own architecture and delivery, and still write code. The architecture needs to be right to enable building the right products. Without it, you're fighting the system instead of building on it. Problem clarity tells you what to build. Then the architecture circles back to provide the right solution, and when requirements change, that should be a configuration change, not a bug.",
  },
  {
    label: "previously",
    text: "Writing code since I was 11. Over 20 years across gaming, social media, fintech, e-commerce, proptech, hosting, travel, sports tech, and more. The problems are universal. The fun part is solving them.",
  },
  {
    label: "otherwise",
    text: "Open sorcerer. Perpetually online. Obsessed with technology, hooked on shipping. Your favorite internet junkie with a love of all things digital and bacon-based.",
  },
];

export const nav = [
  { href: "/posts", label: "posts" },
  { href: "/projects", label: "projects" },
  { href: "/docs", label: "docs" },
  { href: "/misc", label: "misc" },
  { href: "/about", label: "about" },
];

// Site owner's timezone. GitHub's contributions HTML pads the trailing week
// with level-0 cells for days that haven't happened in the owner's local
// time yet; we use this to trim them off so "no activity" can't be confused
// with "hasn't happened."
export const OWNER_TZ = "America/Denver";

// Vacation ranges (inclusive start, exclusive end) used to annotate the
// GitHub activity graph. Zero-contribution days inside these windows are
// rendered as vacation rather than as quiet days.
export const vacations: { label: string; start: string; end: string }[] = [
  { label: "Rome", start: "2026-04-04", end: "2026-04-14" },
  // `end` is exclusive, so this covers Sep 12-14.
  { label: "Camping", start: "2026-09-12", end: "2026-09-15" },
];
