"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/posts", label: "posts" },
  { href: "/projects", label: "projects" },
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

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 text-dim hover:text-foreground transition-colors cursor-pointer"
        aria-label="Toggle menu"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      {open &&
        createPortal(
          <div
            className="fixed inset-x-0 top-12.25 bottom-0 z-100 bg-background backdrop-blur-md"
            onClick={() => setOpen(false)}
          >
            <nav className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-6">
              {links.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`text-lg transition-colors ${
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
          </div>,
          document.body,
        )}
    </div>
  );
}

export function Breadcrumb() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-1.5 flex items-center gap-1.5 text-xs text-dim">
        <Link href="/" className="hover:text-accent transition-colors">
          home
        </Link>
        {segments.map((segment, i) => {
          const href = "/" + segments.slice(0, i + 1).join("/");
          const isLast = i === segments.length - 1;
          return (
            <span key={href} className="flex items-center gap-1.5">
              <span>/</span>
              {isLast ? (
                <span className="text-muted">{segment}</span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-accent transition-colors"
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
