"use client";

import { usePathname } from "next/navigation";
import { MobileSidebar, SidebarNav, type SidebarGroup } from "@/components/sidebar-nav";

interface DocsSidebarProps {
  categories: { name: string; docs: { slug: string; navTitle: string }[] }[];
}

/** The playbook's sections, then the API reference. */
function DocsTree({ categories, onNavigate }: DocsSidebarProps & { onNavigate?: () => void }) {
  // A one-page category (Start Here) is a page of its own, beside the overview.
  const pages = categories
    .filter((c) => c.docs.length === 1)
    .map((c) => ({ href: `/docs/${c.docs[0].slug}`, label: c.docs[0].navTitle }));
  const groups: SidebarGroup[] = [
    {
      name: null,
      sections: categories.filter((c) => c.docs.length > 1).map((c) => ({
        name: c.name,
        items: c.docs.map((d) => ({ href: `/docs/${d.slug}`, title: d.navTitle })),
      })),
    },
    {
      name: "Reference",
      sections: [{ name: "API Reference", items: [{ href: "/docs/api", title: "API Reference" }] }],
    },
  ];
  return (
    <SidebarNav
      title="Documentation"
      home={{ href: "/docs", label: "Overview" }}
      pages={pages}
      groups={groups}
      onNavigate={onNavigate}
    />
  );
}

export function DocsSidebar({ categories }: DocsSidebarProps) {
  return <DocsTree categories={categories} />;
}

export function MobileDocsSidebar({ categories }: DocsSidebarProps) {
  const pathname = usePathname();
  const current =
    categories.flatMap((c) => c.docs).find((d) => pathname === `/docs/${d.slug}`)?.navTitle ?? "Documentation";

  return (
    <MobileSidebar current={current}>
      {(close) => <DocsTree categories={categories} onNavigate={close} />}
    </MobileSidebar>
  );
}
