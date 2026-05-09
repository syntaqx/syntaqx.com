import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { SimpleIcon } from "@/components/simple-icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchButton } from "@/components/search";
import { Nav, MobileMenu, Breadcrumb } from "@/components/nav";
import { BackgroundEffect } from "@/components/background-effect";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
    template: "%s — syntaqx",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t==="light"?"light":t==="dark"?"dark":window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";document.documentElement.classList.add(d)}catch(e){}})()`,
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
                  className="flex items-center gap-2 group shrink-0"
                >
                  <Image
                    src="/brand.svg"
                    alt="syntaqx"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                  <span className="text-sm font-semibold text-accent">
                    syntaqx
                  </span>
                </Link>
                <span className="hidden sm:inline text-dim">/</span>
                <Nav />
              </div>
              <div className="flex items-center gap-2">
                <SearchButton />
                <ThemeToggle />
                <MobileMenu />
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
