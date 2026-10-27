"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { DocCategory } from "@/lib/docs";

interface DocsSidebarProps {
  categories: DocCategory[];
}

export const linkClass = (active: boolean) =>
  `-ml-px flex items-center gap-2 border-l py-1.5 pl-3.5 text-[0.8rem] leading-snug transition-colors ${
    active
      ? "border-accent font-semibold text-foreground"
      : "border-transparent text-dim hover:border-border-hover hover:text-foreground"
  }`;

export function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="inst mb-2.5 text-[0.55rem] leading-[1.6] text-dim">{title}</h3>
      <ul className="border-l border-border">{children}</ul>
    </div>
  );
}

/**
 * Keeps the current page's link in view: deep in a long list it starts below
 * the fold. Scrolls the rail only, never the page.
 */
export function useCurrentLinkInView() {
  const pathname = usePathname();
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
  }, [pathname]);
  return navRef;
}

/** A sidebar's links as rows: the current page is marked and highlighted. */
export function DocLinks({
  docs,
  hrefOf,
  onNavigate,
}: {
  docs: { slug: string; navTitle: string }[];
  hrefOf: (slug: string) => string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return docs.map((doc) => {
    const href = hrefOf(doc.slug);
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
}

/** The playbook's sections, then the API reference. */
function SidebarTree({ categories, onNavigate }: DocsSidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const navRef = useCurrentLinkInView();

  return (
    <nav ref={navRef} aria-label="Documentation" className="space-y-7">
      {categories.map((category) => (
        <Group key={category.name} title={category.name}>
          <DocLinks docs={category.docs} hrefOf={(slug) => `/docs/${slug}`} onNavigate={onNavigate} />
        </Group>
      ))}
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

/** Below lg, a sidebar folds into a button naming the current page. */
export function MobileSidebar({
  current,
  children,
}: {
  current: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden mb-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 border border-border bg-surface px-3 py-2.5 text-sm text-foreground"
      >
        <span className="truncate">{current}</span>
        <ChevronDown
          size={14}
          className={`text-dim shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="mt-2 border border-border bg-surface p-3">{children(() => setOpen(false))}</div>}
    </div>
  );
}

export function MobileDocsSidebar({ categories }: DocsSidebarProps) {
  const pathname = usePathname();
  const current =
    categories.flatMap((c) => c.docs).find((d) => pathname === `/docs/${d.slug}`)?.navTitle ?? "Documentation";

  return (
    <MobileSidebar current={current}>
      {(close) => <SidebarTree categories={categories} onNavigate={close} />}
    </MobileSidebar>
  );
}
