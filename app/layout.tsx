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
import { nav, socials, SITE_URL } from "@/lib/constants";
import "./globals.css";

const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  axes: ["opsz"],
  // Next has no fallback metrics for this family; skip the override.
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
        <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
          <div className="mx-auto grid h-14 max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-stretch sm:px-6">
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
            <div className="flex items-stretch">
              <SearchButton />
              <ThemeToggle />
              <MobileMenu />
            </div>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-12">
          {children}
        </main>
        <footer className="mt-auto border-t border-border">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-[1fr_auto] md:items-end">
            <div className="grid gap-4">
              <Link
                href="/"
                className="font-inst text-base lowercase tracking-wide text-foreground hover:text-accent"
              >
                syntaqx
              </Link>
              <nav className="inst flex flex-wrap gap-x-6 gap-y-2 text-dim">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/docs/api"
                  className="transition-colors hover:text-accent"
                >
                  api
                </Link>
                <Link
                  href="/legal/terms"
                  className="transition-colors hover:text-accent"
                >
                  terms
                </Link>
                <Link
                  href="/legal/privacy"
                  className="transition-colors hover:text-accent"
                >
                  privacy
                </Link>
              </nav>
            </div>
            <div className="grid gap-4 md:justify-items-end">
              <div className="flex items-center gap-4">
                <a
                  href="/feed.xml"
                  className="text-dim transition-colors hover:text-accent"
                  aria-label="RSS feed"
                >
                  <SimpleIcon name="rss" size={18} />
                </a>
                {socials.map((s) => (
                  <a
                    key={s.href}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dim transition-colors hover:text-accent"
                    aria-label={s.label}
                  >
                    <SimpleIcon name={s.icon} size={18} />
                  </a>
                ))}
              </div>
              <p className="inst text-dim">
                &copy; {new Date().getFullYear()} Chase Pierce
              </p>
            </div>
          </div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
