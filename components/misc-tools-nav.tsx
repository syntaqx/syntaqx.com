"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { allMiscTools } from "@/lib/misc-tools";

// Hub/index pages already list everything, so don't repeat the nav there.
const HUB_PATHS = new Set(["/misc", "/misc/convert"]);

/**
 * Cross-links every /misc tool page to its siblings. Without this each tool
 * had a single incoming internal link (from the /misc index); this gives each
 * one a link from every other tool, which both helps discovery and clears
 * Ahrefs' "only one dofollow incoming internal link" flag.
 */
export function MiscToolsNav() {
  const pathname = usePathname();
  if (HUB_PATHS.has(pathname)) return null;

  const others = allMiscTools.filter((tool) => tool.href !== pathname);
  if (others.length === 0) return null;

  return (
    <nav
      aria-label="More tools"
      className="mt-16 border-t border-border pt-8"
    >
      <h2 className="text-xs font-medium uppercase tracking-widest text-dim mb-4">
        More tools
      </h2>
      <ul className="flex flex-wrap gap-2">
        {others.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="inline-block rounded border border-border px-2.5 py-1 text-xs text-muted hover:border-accent hover:text-accent transition-colors"
            >
              {tool.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
