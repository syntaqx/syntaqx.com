"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
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
 * The playbook's sidebar, or an industry's own: inside an industry volume the
 * tree swaps to that volume's chapters with a way back, and fades in on the
 * switch (the key change remounts it, which replays .sidebar-in).
 */
function SidebarTree({ categories, onNavigate }: DocsSidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const core = categories.filter((c) => !isIndustry(c.section));
  const industries = categories.filter((c) => isIndustry(c.section));
  const current = industries.find((c) => c.docs.some((d) => pathname === `/docs/${d.slug}`));

  const docLinks = (category: DocCategory) =>
    category.docs.map((doc) => {
      const href = `/docs/${doc.slug}`;
      return (
        <li key={doc.slug}>
          <Link href={href} onClick={onNavigate} className={linkClass(pathname === href)}>
            {doc.navTitle}
          </Link>
        </li>
      );
    });

  const industryList = (
    <Group title={current ? "Other industries" : "Industries"}>
      {industries
        .filter((c) => c !== current)
        .map((c) => (
          <li key={c.section}>
            <Link href={`/docs/${c.docs[0].slug}`} onClick={onNavigate} className={linkClass(false)}>
              {industryName(c.name)}
            </Link>
          </li>
        ))}
      {UPCOMING_INDUSTRIES.map((name) => (
        <li key={name} className="-ml-px flex items-center gap-2 border-l border-transparent py-1.5 pl-3.5 text-[0.8rem] leading-snug text-dim/70">
          {name}
          <span className="inst ml-auto border border-border px-1.5 py-px text-[0.45rem] text-dim">Soon</span>
        </li>
      ))}
    </Group>
  );

  if (current) {
    return (
      <nav key={current.section} className="sidebar-in space-y-7">
        <div>
          <Link
            href="/docs/playbook"
            onClick={onNavigate}
            className="inst inline-flex items-center gap-1.5 text-[0.55rem] text-dim transition-colors hover:text-accent"
          >
            <ArrowLeft size={11} aria-hidden />
            The Playbook
          </Link>
          <p className="mt-4 inst text-[0.55rem] text-accent">Industry</p>
          <p className="mt-1 text-lg font-semibold leading-tight text-foreground">{industryName(current.name)}</p>
        </div>
        <Group title="Chapters">{docLinks(current)}</Group>
        {industryList}
      </nav>
    );
  }

  return (
    <nav key="playbook" className="sidebar-in space-y-7">
      {core.map((category) => (
        <Group key={category.name} title={category.name}>
          {docLinks(category)}
        </Group>
      ))}
      {industryList}
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
