"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/posts", label: "posts" },
  { href: "/projects", label: "projects" },
  { href: "/docs", label: "docs" },
  { href: "/misc", label: "misc" },
  { href: "/about", label: "about" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="hidden sm:flex items-center gap-5">
      {links.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm transition-colors ${
              isActive
                ? "text-accent font-medium"
                : "text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close on route change (derived state pattern)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

  // Radix Dialog owns focus-trapping, focus return, Escape, scroll lock, and
  // `aria-modal`. Because a modal dialog makes the rest of the page inert,
  // the trigger can't double as the close control (it's non-interactive
  // while open) — so the hamburger opens, hides itself while open, and the
  // panel carries its own close button. The overlay closes on outside click.
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label="Open menu"
        className="sm:hidden p-1.5 text-dim hover:text-foreground transition-colors cursor-pointer data-[state=open]:opacity-0"
      >
        <Menu size={18} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="sm:hidden fixed inset-0 z-90 bg-background/40" />
        <Dialog.Content
          aria-describedby={undefined}
          className="sm:hidden fixed inset-x-0 top-12.25 bottom-0 z-100 bg-background backdrop-blur-md outline-none"
        >
          <Dialog.Title className="sr-only">Site navigation</Dialog.Title>
          <Dialog.Close
            aria-label="Close menu"
            className="absolute right-5 top-3 p-1.5 text-dim hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={18} />
          </Dialog.Close>
          <nav className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-6">
            {links.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Dialog.Close asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={`text-lg transition-colors ${
                      isActive
                        ? "text-accent font-medium"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                </Dialog.Close>
              );
            })}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-1.5 flex items-center gap-1.5 text-xs text-dim min-w-0 overflow-hidden">
        <Link href="/" className="shrink-0 hover:text-accent transition-colors">
          home
        </Link>
        {segments.length === 0 && (
          <span className="flex items-center gap-1.5 min-w-0 shrink-0 last:shrink">
            <span>/</span>
            <span className="text-muted truncate">index</span>
          </span>
        )}
        {segments.map((segment, i) => {
          const href = "/" + segments.slice(0, i + 1).join("/");
          const isLast = i === segments.length - 1;
          return (
            <span
              key={href}
              className="flex items-center gap-1.5 min-w-0 shrink-0 last:shrink"
            >
              <span>/</span>
              {isLast ? (
                <span className="text-muted truncate">{segment}</span>
              ) : (
                <Link
                  href={href}
                  className="shrink-0 hover:text-accent transition-colors"
                >
                  {segment}
                </Link>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
