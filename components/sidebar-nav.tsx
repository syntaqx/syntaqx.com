"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * The docs' and books' sidebar. A title band, an overview link, then each
 * section (a docs category, a book's part) as a collapsible row; the one
 * holding the current page starts open. A section with a single page is a
 * direct link row instead, and a named group (Reference) gets a band of its own.
 */

export interface SidebarItem {
  href: string;
  title: string;
  /** A chapter's place in its book, shown as "03". */
  number?: number;
  /** Pages below this one (a glossary's parts) count as this one too. */
  nested?: boolean;
}

export interface SidebarSection {
  name: string;
  items: SidebarItem[];
}

export interface SidebarGroup {
  /** null: sections at the top, with no band above them. */
  name: string | null;
  sections: SidebarSection[];
}

const isActive = (item: SidebarItem, pathname: string) =>
  pathname === item.href || (!!item.nested && pathname.startsWith(`${item.href}/`));

const rowClass = (active: boolean) =>
  `flex items-baseline gap-2.5 px-2.5 py-1.5 text-[0.8rem] leading-snug transition-colors ${
    active ? "bg-foreground/7 font-medium text-foreground" : "text-dim hover:bg-foreground/4 hover:text-foreground"
  }`;

const bandClass = "inst border-b border-border bg-surface px-4 py-2.5 text-[0.55rem] leading-[1.6] text-dim";

const sectionRowClass =
  "inst group flex w-full items-center gap-2 py-3 pr-4 pl-4 text-left text-[0.55rem] leading-[1.6] transition-colors hover:bg-surface hover:text-foreground";

/**
 * Keeps the current page's link in view: deep in a long list it starts below
 * the fold. Scrolls the rail only, never the page.
 */
function useCurrentLinkInView() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = navRef.current;
    const rail = nav?.closest<HTMLElement>(".rail-scroll");
    const link = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!rail || !link) return;
    const top = link.getBoundingClientRect().top - rail.getBoundingClientRect().top + rail.scrollTop;
    if (top < rail.scrollTop + 80 || top > rail.scrollTop + rail.clientHeight - 40) {
      rail.scrollTop = top - rail.clientHeight / 3;
    }
  }, [pathname]);
  return navRef;
}

export function SidebarNav({
  title,
  back,
  home,
  pages = [],
  groups,
  onNavigate,
}: {
  title: string;
  /** A link back up a level, as a chevron before the title. */
  back?: { href: string; label: string };
  home: { href: string; label: string };
  /** Pages that stand alone, listed under the overview (the playbook's intro). */
  pages?: { href: string; label: string }[];
  groups: SidebarGroup[];
  /** Called when a link is followed (closes the mobile panel). */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const navRef = useCurrentLinkInView();
  const sections = groups.flatMap((g) => g.sections);
  const activeSection = sections.find((s) => s.items.some((i) => isActive(i, pathname)))?.name;

  const [open, setOpen] = useState<string[]>(activeSection ? [activeSection] : []);
  // Open the current page's section on navigation, leaving the rest as the
  // reader left them.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (activeSection && !open.includes(activeSection)) setOpen([...open, activeSection]);
  }

  return (
    <nav ref={navRef} aria-label={title}>
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3 text-sm font-semibold text-foreground">
        {back && (
          <Link
            href={back.href}
            onClick={onNavigate}
            aria-label={back.label}
            className="-ml-1.5 text-dim transition-colors hover:text-accent"
          >
            <ChevronLeft size={15} aria-hidden />
          </Link>
        )}
        <span className="truncate">{title}</span>
      </div>
      <ul className="flex flex-col gap-px border-b border-border p-2">
        {[home, ...pages].map((page) => (
          <li key={page.href}>
            <Link
              href={page.href}
              onClick={onNavigate}
              aria-current={pathname === page.href ? "page" : undefined}
              className={rowClass(pathname === page.href)}
            >
              {page.label}
            </Link>
          </li>
        ))}
      </ul>

      <Accordion.Root type="multiple" value={open} onValueChange={setOpen}>
        {groups.map((group) => (
          <div key={group.name ?? "_top"}>
            {group.name && <p className={bandClass}>{group.name}</p>}
            {group.sections.map((section) =>
              section.items.length === 1 ? (
                <SingleRow key={section.name} item={section.items[0]} pathname={pathname} onNavigate={onNavigate} />
              ) : (
                <Section
                  key={section.name}
                  section={section}
                  pathname={pathname}
                  current={section.name === activeSection}
                  onNavigate={onNavigate}
                />
              ),
            )}
          </div>
        ))}
      </Accordion.Root>
    </nav>
  );
}

/** A one-page section: its page, as a row level with the section rows. */
function SingleRow({
  item,
  pathname,
  onNavigate,
}: {
  item: SidebarItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isActive(item, pathname);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={pathname === item.href ? "page" : undefined}
      className={`${sectionRowClass} border-b border-border ${active ? "bg-surface text-accent" : "text-dim"}`}
    >
      <span className="w-3.5 shrink-0" aria-hidden />
      {item.title}
    </Link>
  );
}

function Section({
  section,
  pathname,
  current,
  onNavigate,
}: {
  section: SidebarSection;
  pathname: string;
  /** Holds the current page: marked even while collapsed. */
  current: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Accordion.Item value={section.name} className="border-b border-border">
      <Accordion.Header>
        <Accordion.Trigger
          // Transparent while closed, so opening doesn't fade the border in from white.
          className={`${sectionRowClass} cursor-pointer border-b border-transparent data-[state=open]:border-border ${
            current ? "text-accent" : "text-dim data-[state=open]:text-foreground"
          }`}
        >
          <ChevronRight
            size={14}
            strokeWidth={2}
            aria-hidden
            className="shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90"
          />
          <span className="flex-1">{section.name}</span>
          <span className="text-dim tabular-nums">{section.items.length}</span>
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="acc-content overflow-hidden">
        <ul className="flex flex-col gap-px p-2">
          {section.items.map((item) => {
            const active = isActive(item, pathname);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={pathname === item.href ? "page" : undefined}
                  // Unnumbered, the title lines up with the section's name.
                  className={`${rowClass(active)} ${item.number === undefined ? "pl-7.5" : ""}`}
                >
                  {item.number !== undefined && (
                    <span className={`w-5 shrink-0 font-mono text-[0.65rem] tabular-nums ${active ? "text-accent" : "text-dim"}`}>
                      {String(item.number).padStart(2, "0")}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Accordion.Content>
    </Accordion.Item>
  );
}

/** Below lg, the sidebar folds into a button naming the current page. */
export function MobileSidebar({
  current,
  children,
}: {
  current: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 border border-border bg-surface px-3 py-2.5 text-sm text-foreground"
      >
        <span className="truncate">{current}</span>
        <ChevronDown size={14} className={`shrink-0 text-dim transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="rail-scroll mt-2 max-h-[70vh] overflow-y-auto border border-border bg-background">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
