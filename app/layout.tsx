import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Big_Shoulders,
  Hanken_Grotesk,
  JetBrains_Mono,
  Michroma,
} from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { SimpleIcon } from "@/components/simple-icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchButton } from "@/components/search";
import { Nav, MobileMenu } from "@/components/nav";
import { TopProgressBar } from "@/components/top-progress-bar";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { footerNav, socials, SITE_URL } from "@/lib/constants";
import "./globals.css";

const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  axes: ["opsz"],
  // Next has no fallback metrics for this family. Naming the fallback
  // skips the lookup (Turbopack warns on it even with adjustFontFallback off).
  fallback: ["Hanken Grotesk", "sans-serif"],
  adjustFontFallback: false,
});

const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: "400",
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

// Deployed commit, shown in the header's status readout. Vercel sets this
// on every build; locally it's unset and the readout is hidden.
const COMMIT = process.env.VERCEL_GIT_COMMIT_SHA;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "syntaqx: Chase Pierce, Software Engineering Leader",
    template: "%s - syntaqx",
  },
  description:
    "Chase Pierce, software engineering leader, architect at heart, open sorcerer, and your favorite internet junkie. Writing on engineering, systems, and craft.",
  authors: [{ name: "Chase Pierce" }],
  alternates: {
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: "syntaqx RSS feed" }],
    },
  },
  openGraph: {
    title: "syntaqx",
    description:
      "Chase Pierce, software engineering leader, architect at heart, open sorcerer, and your favorite internet junkie. Writing on engineering, systems, and craft.",
    url: SITE_URL,
    siteName: "syntaqx",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@syntaqx",
  },
  icons: {
    icon: [{ url: "/brand.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bigShoulders.variable} ${michroma.variable} ${hanken.variable} ${jetbrains.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Theme bootstrap. CSS already handles `prefers-color-scheme`,
          so this script only runs to honor an EXPLICIT user choice
          stored in localStorage. No class is added when the user is
          on "system" (or has never picked) \u2014 the @media query in
          globals.css takes over and there is no flash.
          `suppressHydrationWarning` silences a React-19 dev nag about
          rendering <script> from a component.
        */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark"){document.documentElement.classList.add(t)}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <header
          data-pagefind-ignore
          className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md"
        >
          <div className="site-bar mx-auto grid h-12 max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-stretch sm:px-6">
            <Link
              href="/"
              className="group flex items-center gap-2.5 border-r border-border px-4 sm:pl-0 sm:pr-5"
            >
              <Image
                src="/brand.svg"
                alt=""
                width={22}
                height={22}
                className="size-5.5"
              />
              <span className="font-inst text-[0.9rem] lowercase tracking-wide text-foreground transition-colors group-hover:text-accent">
                syntaqx
              </span>
            </Link>
            <Nav />
            <div className="col-start-3 flex items-stretch">
              <SearchButton />
              <ThemeToggle />
              {COMMIT && (
                <a
                  href={`https://github.com/syntaqx/syntaqx.com/commit/${COMMIT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Deployed commit ${COMMIT.slice(0, 7)} on GitHub`}
                  className="hidden items-center gap-2 border-l border-border pl-4 font-mono text-[0.65rem] text-dim transition-colors hover:text-foreground focus-visible:-outline-offset-2 lg:flex"
                >
                  <span aria-hidden className="tick" />
                  {COMMIT.slice(0, 7)}
                </a>
              )}
              <MobileMenu />
            </div>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-12">
          {children}
        </main>
        <footer data-pagefind-ignore className="mt-auto border-t border-border">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 md:grid-cols-[1fr_auto] md:gap-16">
            <div className="grid content-start gap-4">
              <Link
                href="/"
                className="font-inst text-base lowercase tracking-wide text-foreground hover:text-accent"
              >
                syntaqx
              </Link>
              <div className="-ml-2.5 flex items-center">
                {socials.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-10 items-center justify-center text-dim transition-colors hover:text-accent"
                    aria-label={s.label}
                  >
                    <SimpleIcon name={s.icon} size={18} />
                  </a>
                ))}
              </div>
            </div>
            <nav
              aria-label="Footer"
              className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 sm:gap-x-12"
            >
              {footerNav.map((group) => (
                <div key={group.label}>
                  <p className="eyebrow mb-3">{group.label}</p>
                  <ul className="inst text-dim">
                    {group.links.map((link) => {
                      const className =
                        "block py-2 transition-colors hover:text-accent sm:py-1.5";
                      return (
                        <li key={link.href}>
                          {link.file ? (
                            <a href={link.href} className={className}>
                              {link.label}
                            </a>
                          ) : (
                            <Link href={link.href} className={className}>
                              {link.label}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
          <div className="border-t border-border">
            <p className="inst mx-auto max-w-7xl px-6 py-5 text-dim">
              &copy; {new Date().getFullYear()} Chase Pierce
            </p>
          </div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
