"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { patterns } from "@/lib/ui";

const linkClass = (active: boolean) =>
  `-ml-px flex items-center gap-2 border-l py-1.5 pl-3.5 text-[0.8rem] leading-snug transition-colors ${
    active
      ? "border-accent font-semibold text-foreground"
      : "border-transparent text-dim hover:border-border-hover hover:text-foreground"
  }`;

/** Every /ui page, grouped the way the /ui index groups them. */
function SidebarTree({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="UI" className="space-y-7">
      <ul className="border-l border-border">
        <li>
          <Link href="/ui" onClick={onNavigate} className={linkClass(false)}>
            Overview
          </Link>
        </li>
      </ul>
      <div>
        <h3 className="inst mb-2.5 text-[0.55rem] leading-[1.6] text-dim">Patterns</h3>
        <ul className="border-l border-border">
          {patterns.map((p) => (
            <li key={p.href}>
              <Link
                href={p.href}
                onClick={onNavigate}
                aria-current={pathname === p.href ? "page" : undefined}
                className={linkClass(pathname === p.href)}
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export function UiSidebar() {
  return <SidebarTree />;
}

export function MobileUiSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const currentTitle = patterns.find((p) => p.href === pathname)?.title ?? "UI";

  return (
    <div className="lg:hidden mb-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 border border-border bg-surface px-3 py-2.5 text-sm text-foreground"
      >
        <span className="truncate">{currentTitle}</span>
        <ChevronDown
          size={14}
          className={`text-dim shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-2 border border-border bg-surface p-3">
          <SidebarTree onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
