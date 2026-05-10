"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { DocCategory } from "@/lib/docs";

interface DocsSidebarProps {
  categories: DocCategory[];
}

export function DocsSidebar({ categories }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {categories.map((category) => (
        <div key={category.name}>
          <h3 className="text-[10px] font-medium uppercase tracking-widest text-dim mb-2">
            {category.name}
          </h3>
          <ul className="space-y-0.5">
            {category.docs.map((doc) => {
              const href = `/docs/${doc.slug}`;
              const active = pathname === href;
              return (
                <li key={doc.slug}>
                  <Link
                    href={href}
                    className={`block text-xs py-1.5 px-2.5 rounded-md transition-colors ${
                      active
                        ? "text-accent bg-accent/10 font-medium"
                        : "text-muted hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    {doc.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div>
        <h3 className="text-[10px] font-medium uppercase tracking-widest text-dim mb-2">
          Reference
        </h3>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/docs/api"
              className={`block text-xs py-1.5 px-2.5 rounded-md transition-colors ${
                pathname === "/docs/api"
                  ? "text-accent bg-accent/10 font-medium"
                  : "text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              API Reference
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export function MobileDocsSidebar({ categories }: DocsSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Find current doc title
  let currentTitle = "API Reference";
  for (const cat of categories) {
    for (const doc of cat.docs) {
      if (pathname === `/docs/${doc.slug}`) {
        currentTitle = doc.title;
      }
    }
  }

  return (
    <div className="lg:hidden mb-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-lg border border-border bg-surface/50 px-3 py-2.5 text-sm text-foreground"
      >
        <span className="truncate">{currentTitle}</span>
        <ChevronDown
          size={14}
          className={`text-dim shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="mt-2 rounded-lg border border-border bg-surface/50 p-3">
          <nav className="space-y-4">
            {categories.map((category) => (
              <div key={category.name}>
                <h3 className="text-[10px] font-medium uppercase tracking-widest text-dim mb-1.5">
                  {category.name}
                </h3>
                <ul className="space-y-0.5">
                  {category.docs.map((doc) => {
                    const href = `/docs/${doc.slug}`;
                    const active = pathname === href;
                    return (
                      <li key={doc.slug}>
                        <Link
                          href={href}
                          onClick={() => setOpen(false)}
                          className={`block text-xs py-1.5 px-2.5 rounded-md transition-colors ${
                            active
                              ? "text-accent bg-accent/10 font-medium"
                              : "text-muted hover:text-foreground hover:bg-surface"
                          }`}
                        >
                          {doc.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            <div>
              <h3 className="text-[10px] font-medium uppercase tracking-widest text-dim mb-1.5">
                Reference
              </h3>
              <ul className="space-y-0.5">
                <li>
                  <Link
                    href="/docs/api"
                    onClick={() => setOpen(false)}
                    className={`block text-xs py-1.5 px-2.5 rounded-md transition-colors ${
                      pathname === "/docs/api"
                        ? "text-accent bg-accent/10 font-medium"
                        : "text-muted hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    API Reference
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
