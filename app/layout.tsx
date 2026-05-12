import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { SimpleIcon } from "@/components/simple-icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchButton } from "@/components/search";
import { Nav, MobileMenu, Breadcrumb } from "@/components/nav";
import { BackgroundEffect } from "@/components/background-effect";
import { UserMenu } from "@/components/auth/user-menu";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { auth } from "@/lib/auth";
import { nav, socials } from "@/lib/constants";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://syntaqx.com"),
  title: {
    default: "syntaqx",
    template: "%s - syntaqx",
  },
  description:
    "VP of Software Engineering. Architect at heart, open sorcerer, and your favorite internet junkie.",
  authors: [{ name: "Chase Pierce" }],
  openGraph: {
    title: "syntaqx",
    description:
      "VP of Software Engineering. Architect at heart, open sorcerer, and your favorite internet junkie.",
    url: "https://syntaqx.com",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });
  // Better Auth's username plugin adds `username`; the inferred
  // server-side user type doesn't surface plugin fields here, so widen.
  const user = session?.user as
    | (NonNullable<typeof session>["user"] & {
        username?: string | null;
        image?: string | null;
      })
    | undefined;
  const handle = user ? (user.username ?? user.name) : null;
  return (
    <html
      lang="en"
      className={`${geistMono.variable} h-full`}
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
        <BackgroundEffect />
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md">
          <div className="border-b border-border">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 relative">
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="flex items-center gap-2 group shrink-0 brand-flicker"
                >
                  <Image
                    src="/brand.svg"
                    alt="syntaqx"
                    width={24}
                    height={24}
                    className="w-6 h-6 brand-flicker-target"
                  />
                  <span className="text-sm font-semibold text-accent transition-colors group-hover:text-foreground brand-flicker-target">
                    syntaqx
                  </span>
                </Link>
                <span className="hidden sm:inline text-dim">/</span>
                <Nav />
              </div>
              <div className="flex h-8 items-center gap-3">
                <SearchButton />
                <ThemeToggle />
                {handle && user ? (
                  <div className="hidden sm:flex items-center pl-3 ml-2 border-l border-border">
                    <UserMenu
                      username={handle}
                      displayName={user.name || handle}
                      image={user.image}
                    />
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex h-8 items-center rounded-lg border border-border bg-surface/50 px-3 text-xs text-dim hover:text-muted hover:border-border-hover transition-colors"
                  >
                    Sign in
                  </Link>
                )}
                <MobileMenu
                  username={handle}
                  displayName={user?.name ?? null}
                  image={user?.image ?? null}
                />
              </div>
            </div>
          </div>
          <Breadcrumb />
        </header>
        <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-12">
          {children}
        </main>
        <footer className="border-t border-border mt-auto">
          <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-dim">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-accent transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <p className="text-xs text-dim">
              &copy; {new Date().getFullYear()} Chase Pierce
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/docs/api"
                className="text-xs text-dim hover:text-accent transition-colors"
              >
                API
              </Link>
              <Link
                href="/legal/terms"
                className="text-xs text-dim hover:text-accent transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/legal/privacy"
                className="text-xs text-dim hover:text-accent transition-colors"
              >
                Privacy
              </Link>
              <span className="text-border">|</span>
              {socials.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dim hover:text-accent transition-colors"
                  aria-label={s.label}
                >
                  <SimpleIcon name={s.icon} size={18} />
                </a>
              ))}
            </div>
          </div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
