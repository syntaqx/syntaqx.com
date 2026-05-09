"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/posts", label: "posts" },
  { href: "/projects", label: "projects" },
  { href: "/about", label: "about" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-5">
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

export function Breadcrumb() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="border-b border-border/50">
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
