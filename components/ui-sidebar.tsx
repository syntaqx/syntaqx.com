"use client";

import { usePathname } from "next/navigation";
import { MobileSidebar, SidebarNav } from "@/components/sidebar-nav";
import { componentGroups, components, patternGroups, patterns, uiPages } from "@/lib/ui";

/** Every /ui page: the overview and installation, then components and patterns by category. */
function UiTree({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <SidebarNav
      title="UI"
      home={{ href: "/ui", label: "Overview" }}
      pages={uiPages.map((p) => ({ href: p.href, label: p.title }))}
      groups={[
        {
          name: "Components",
          sections: componentGroups.map((g) => ({
            name: g.category,
            id: `components/${g.category}`,
            items: g.items.map((c) => ({ href: c.href, title: c.title })),
          })),
        },
        {
          name: "Patterns",
          sections: patternGroups.map((g) => ({
            name: g.category,
            id: `patterns/${g.category}`,
            items: g.items.map((p) => ({ href: p.href, title: p.title })),
          })),
        },
      ]}
      openAll
      singleRows={false}
      onNavigate={onNavigate}
    />
  );
}

export function UiSidebar() {
  return <UiTree />;
}

export function MobileUiSidebar() {
  const pathname = usePathname();
  const current =
    [...uiPages, ...components, ...patterns].find((p) => p.href === pathname)?.title ??
    (pathname === "/ui" ? "Overview" : "UI");

  return (
    <MobileSidebar current={current}>{(close) => <UiTree onNavigate={close} />}</MobileSidebar>
  );
}
