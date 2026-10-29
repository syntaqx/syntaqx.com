"use client";

import { usePathname } from "next/navigation";
import { MobileSidebar, SidebarNav, type SidebarGroup } from "@/components/sidebar-nav";

interface DocsSidebarProps {
  categories: { name: string; docs: { slug: string; navTitle: string }[] }[];
}

/** The playbook's sections, then the API reference. */
function DocsTree({ categories, onNavigate }: DocsSidebarProps & { onNavigate?: () => void }) {
  const groups: SidebarGroup[] = [
    {
      name: null,
      sections: categories.map((c) => ({
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
