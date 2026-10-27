"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, Menu, X } from "lucide-react";
import { nav, type NavGroup, type NavLink } from "@/lib/constants";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

// The active item's rail: a 2px teal line on the bar's bottom edge, spanning
// the whole item including its padding (on the left edge inside the Lab
// list). Absolutely placed, so nothing shifts when it lights up.
function Marker({ on, list = false }: { on: boolean; list?: boolean }) {
  if (!on) return null;
  return (
    <span
      aria-hidden
      className={`absolute bg-accent ${list ? "inset-y-1.5 left-0 w-0.5" : "inset-x-0 -bottom-px h-0.5"}`}
    />
  );
}

const itemClass = (active: boolean) =>
  `relative flex items-center gap-2 whitespace-nowrap px-3 transition-colors focus-visible:-outline-offset-2 ${
    active ? "text-foreground" : "text-dim hover:text-foreground"
  }`;

export function Nav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="inst hidden items-stretch lg:flex">
      {nav.map((item) => {
        if ("links" in item) {
          return (
            <NavDisclosure key={item.label} group={item} pathname={pathname} />
          );
        }
        const on = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={on ? "page" : undefined}
            className={itemClass(on)}
          >
            <Marker on={on} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

// A disclosure of plain links rather than an ARIA menu: Tab walks the links,
// Escape closes and returns focus to the button, and it closes on outside
// click, when focus leaves it, and on navigation.
function NavDisclosure({
  group,
  pathname,
}: {
  group: NavGroup;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const active = group.links.some((l) => isActive(pathname, l.href));
  const id = `nav-${group.label}`;

  // Close on route change (derived state pattern)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onOutside(e: Event) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("focusin", onOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("focusin", onOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative flex items-stretch">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={`${itemClass(active || open)} cursor-pointer uppercase`}
      >
        <Marker on={active} />
        {group.label}
        <ChevronDown
          size={10}
          aria-hidden
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <ul
        id={id}
        hidden={!open}
        className="absolute left-0 top-full z-100 min-w-full border border-border bg-surface py-1 shadow-lg"
      >
        {group.links.map((link) => {
          const on = isActive(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={on ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`${itemClass(on)} py-2.5`}
              >
                <Marker on={on} list />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
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
        className="flex w-12 items-center justify-center border-l border-border text-dim transition-colors hover:text-foreground cursor-pointer data-[state=open]:opacity-0 lg:hidden"
      >
        <Menu size={18} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="lg:hidden fixed inset-0 z-90 bg-background/40" />
        <Dialog.Content
          aria-describedby={undefined}
          className="lg:hidden fixed inset-x-0 top-12 bottom-0 z-100 bg-background outline-none"
        >
          <Dialog.Title className="sr-only">Site navigation</Dialog.Title>
          <Dialog.Close
            aria-label="Close menu"
            className="absolute -top-12 right-0 flex h-12 w-12 items-center justify-center border-l border-border text-dim transition-colors hover:text-foreground cursor-pointer"
          >
            <X size={18} />
          </Dialog.Close>
          <nav className="flex max-h-full flex-col overflow-y-auto border-t border-border">
            {nav.map((item) =>
              "links" in item ? (
                <div key={item.label} className="border-b border-border pt-4">
                  <p className="eyebrow px-6">{item.label}</p>
                  {item.links.map((link) => (
                    <MobileLink key={link.href} link={link} pathname={pathname} />
                  ))}
                </div>
              ) : (
                <MobileLink
                  key={item.href}
                  link={item}
                  pathname={pathname}
                  className="border-b border-border"
                />
              ),
            )}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MobileLink({
  link,
  pathname,
  className = "",
}: {
  link: NavLink;
  pathname: string;
  className?: string;
}) {
  const on = isActive(pathname, link.href);
  return (
    <Dialog.Close asChild>
      <Link
        href={link.href}
        aria-current={on ? "page" : undefined}
        className={`font-voice block px-6 py-4 text-3xl font-semibold uppercase leading-none transition-colors ${className} ${
          on ? "text-accent" : "text-foreground hover:text-accent"
        }`}
      >
        {link.label}
      </Link>
    </Dialog.Close>
  );
}
