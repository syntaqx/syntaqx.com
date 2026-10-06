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
    <nav className="space-y-7">
      {categories.map((category) => (
        <div key={category.name}>
          <h3 className="inst mb-2.5 text-[0.55rem] text-dim">
            {category.name}
          </h3>
          <ul className="border-l border-border">
            {category.docs.map((doc) => {
              const href = `/docs/${doc.slug}`;
              const active = pathname === href;
              return (
                <li key={doc.slug}>
                  <Link
                    href={href}
                    className={`-ml-px block border-l py-1.5 pl-3.5 text-[0.8rem] leading-snug transition-colors ${
                      active
                        ? "border-accent font-semibold text-foreground"
                        : "border-transparent text-dim hover:border-border-hover hover:text-foreground"
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
        <h3 className="inst mb-2.5 text-[0.55rem] text-dim">Reference</h3>
        <ul className="border-l border-border">
          <li>
            <Link
              href="/docs/api"
              className={`-ml-px block border-l py-1.5 pl-3.5 text-[0.8rem] leading-snug transition-colors ${
                pathname === "/docs/api"
                  ? "border-accent font-semibold text-foreground"
                  : "border-transparent text-dim hover:border-border-hover hover:text-foreground"
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
          <nav className="space-y-4">
            {categories.map((category) => (
              <div key={category.name}>
                <h3 className="inst mb-2 text-[0.55rem] text-dim">
                  {category.name}
                </h3>
                <ul className="border-l border-border">
                  {category.docs.map((doc) => {
                    const href = `/docs/${doc.slug}`;
                    const active = pathname === href;
                    return (
                      <li key={doc.slug}>
                        <Link
                          href={href}
                          onClick={() => setOpen(false)}
                          className={`-ml-px block border-l py-1.5 pl-3.5 text-[0.8rem] leading-snug transition-colors ${
                            active
                              ? "border-accent font-semibold text-foreground"
                              : "border-transparent text-dim hover:border-border-hover hover:text-foreground"
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
              <h3 className="inst mb-2 text-[0.55rem] text-dim">Reference</h3>
              <ul className="border-l border-border">
                <li>
                  <Link
                    href="/docs/api"
                    onClick={() => setOpen(false)}
                    className={`-ml-px block border-l py-1.5 pl-3.5 text-[0.8rem] leading-snug transition-colors ${
                      pathname === "/docs/api"
                        ? "border-accent font-semibold text-foreground"
                        : "border-transparent text-dim hover:border-border-hover hover:text-foreground"
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
