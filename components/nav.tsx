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
    <nav className="inst hidden items-stretch overflow-x-auto [scrollbar-width:none] sm:flex [&::-webkit-scrollbar]:hidden">
      {links.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`relative flex items-center whitespace-nowrap px-3.5 transition-colors after:absolute after:inset-x-3.5 after:-bottom-px after:h-0.5 after:origin-left after:bg-accent after:transition-transform after:duration-300 after:ease-[steps(6)] ${
              isActive
                ? "text-foreground after:scale-x-100"
                : "text-dim hover:text-foreground after:scale-x-0 hover:after:scale-x-100"
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
        className="flex w-12 items-center justify-center border-l border-border text-dim transition-colors hover:text-foreground cursor-pointer data-[state=open]:opacity-0 sm:hidden"
      >
        <Menu size={18} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="sm:hidden fixed inset-0 z-90 bg-background/40" />
        <Dialog.Content
          aria-describedby={undefined}
          className="sm:hidden fixed inset-x-0 top-14 bottom-0 z-100 bg-background outline-none"
        >
          <Dialog.Title className="sr-only">Site navigation</Dialog.Title>
          <Dialog.Close
            aria-label="Close menu"
            className="absolute -top-14 right-0 flex h-14 w-12 items-center justify-center border-l border-border text-dim transition-colors hover:text-foreground cursor-pointer"
          >
            <X size={18} />
          </Dialog.Close>
          <nav className="flex flex-col border-t border-border">
            {links.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Dialog.Close asChild key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`font-voice border-b border-border px-6 py-4 text-3xl font-semibold uppercase leading-none transition-colors ${
                      isActive
                        ? "text-accent"
                        : "text-foreground hover:text-accent"
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
