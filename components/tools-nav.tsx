"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { moreToolsFor } from "@/lib/tools";

// Hub/index pages already list everything, so don't repeat the nav there.
const HUB_PATHS = new Set(["/tools", "/tools/convert"]);

/**
 * Cross-links every /tools page to its siblings. Without this each tool
 * had a single incoming internal link (from the /tools index); this gives each
 * one a link from every other tool, which both helps discovery and clears
 * Ahrefs' "only one dofollow incoming internal link" flag.
 */
export function ToolsNav() {
  const pathname = usePathname();
  if (HUB_PATHS.has(pathname)) return null;

  const others = moreToolsFor(pathname);
  if (others.length === 0) return null;

  return (
    <nav aria-label="More tools" className="mt-16 border-t border-border pt-8">
      <h2 className="eyebrow mb-4">More tools</h2>
      <ul className="flex flex-wrap gap-2">
        {others.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="inst inline-block border border-border px-2.5 py-1.5 text-muted hover:border-accent hover:text-accent transition-colors"
            >
              {tool.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
