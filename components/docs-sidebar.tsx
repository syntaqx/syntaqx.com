"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { DocCategory } from "@/lib/docs";
import { UPCOMING_INDUSTRIES, industryName, isIndustry } from "@/lib/industries";

interface DocsSidebarProps {
  categories: DocCategory[];
}

const linkClass = (active: boolean) =>
  `-ml-px flex items-center gap-2 border-l py-1.5 pl-3.5 text-[0.8rem] leading-snug transition-colors ${
    active
      ? "border-accent font-semibold text-foreground"
      : "border-transparent text-dim hover:border-border-hover hover:text-foreground"
  }`;

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="inst mb-2.5 text-[0.55rem] text-dim">{title}</h3>
      <ul className="border-l border-border">{children}</ul>
    </div>
  );
}

/**
 * The playbook's sections, as they are. An industry volume is one row with a
 * caret, and opening it drills the sidebar into that volume's chapters, the
 * way Vercel's dashboard opens Settings. The back caret returns to the
 * sections without leaving the page. Each view slides in from the side it
 * came from.
 */
function SidebarTree({ categories, onNavigate }: DocsSidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  // The page the reader pressed "back" on; navigating anywhere resets it.
  const [rootOn, setRootOn] = useState<string | null>(null);
  const core = categories.filter((c) => !isIndustry(c.section));
  const industries = categories.filter((c) => isIndustry(c.section));
  const current = industries.find((c) => c.docs.some((d) => pathname === `/docs/${d.slug}`));
  const drilled = Boolean(current && rootOn !== pathname);

  // Keep the current page's link in view: deep in the book it starts below
  // the fold. Scrolls the rail only, never the page.
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = navRef.current;
    const rail = nav?.closest<HTMLElement>(".rail-scroll");
    const link = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!rail || !link) return;
    const top = link.getBoundingClientRect().top - rail.getBoundingClientRect().top + rail.scrollTop;
    if (top < rail.scrollTop || top > rail.scrollTop + rail.clientHeight - 40) {
      rail.scrollTop = top - rail.clientHeight / 3;
    }
  }, [pathname, drilled]);

  const docLinks = (category: DocCategory) =>
    category.docs.map((doc) => {
      const href = `/docs/${doc.slug}`;
      return (
        <li key={doc.slug}>
          <Link
            href={href}
            onClick={onNavigate}
            aria-current={pathname === href ? "page" : undefined}
            className={linkClass(pathname === href)}
          >
            {doc.navTitle}
          </Link>
        </li>
      );
    });

  if (current && drilled) {
    return (
      <nav ref={navRef} key={current.section} aria-label={current.name} className="sidebar-in-right space-y-4">
        <button
          type="button"
          onClick={() => setRootOn(pathname)}
          className="group flex w-full items-center gap-2 text-left text-sm font-semibold text-foreground"
        >
          <ChevronLeft size={15} aria-hidden className="text-dim transition-colors group-hover:text-accent" />
          {industryName(current.name)}
          <span className="sr-only">: back to all sections</span>
        </button>
        <ul className="border-l border-border">{docLinks(current)}</ul>
      </nav>
    );
  }

  return (
    <nav ref={navRef} key="playbook" aria-label="Documentation" className={`${current ? "sidebar-in-left " : ""}space-y-7`}>
      {core.map((category) => (
        <Group key={category.name} title={category.name}>
          {docLinks(category)}
        </Group>
      ))}
      <Group title="Industries">
        {industries.map((c) => (
          <li key={c.section}>
            <Link
              href={c === current ? pathname : `/docs/${c.docs[0].slug}`}
              onClick={() => {
                setRootOn(null);
                onNavigate?.();
              }}
              className={`group ${linkClass(c === current)}`}
            >
              {industryName(c.name)}
              <ChevronRight size={13} aria-hidden className="ml-auto text-dim transition-colors group-hover:text-accent" />
            </Link>
          </li>
        ))}
        {UPCOMING_INDUSTRIES.map((name) => (
          <li
            key={name}
            className="-ml-px flex items-center gap-2 border-l border-transparent py-1.5 pl-3.5 text-[0.8rem] leading-snug text-dim/70"
          >
            {name}
            <span className="inst ml-auto border border-border px-1.5 py-px text-[0.45rem] text-dim">Soon</span>
          </li>
        ))}
      </Group>
      <Group title="Reference">
        <li>
          <Link href="/docs/api" onClick={onNavigate} className={linkClass(pathname === "/docs/api")}>
            API Reference
          </Link>
        </li>
      </Group>
    </nav>
  );
}

export function DocsSidebar({ categories }: DocsSidebarProps) {
  return <SidebarTree categories={categories} />;
}

export function MobileDocsSidebar({ categories }: DocsSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const currentTitle =
    categories.flatMap((c) => c.docs).find((d) => pathname === `/docs/${d.slug}`)?.navTitle ?? "API Reference";

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
          <SidebarTree categories={categories} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
