"use client";

import { usePathname } from "next/navigation";
import { MobileSidebar, SidebarNav } from "@/components/sidebar-nav";
import { patternGroups, patterns, uiPages } from "@/lib/ui";

/** Every /ui page: the overview and installation, then patterns by category. */
function UiTree({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <SidebarNav
      title="UI"
      home={{ href: "/ui", label: "Overview" }}
      pages={uiPages.map((p) => ({ href: p.href, label: p.title }))}
      groups={[
        {
          name: null,
          sections: patternGroups.map((g) => ({
            name: g.category,
            items: g.items.map((p) => ({ href: p.href, title: p.title })),
          })),
        },
      ]}
      openAll
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
    [...uiPages, ...patterns].find((p) => p.href === pathname)?.title ??
    (pathname === "/ui" ? "Overview" : "UI");

  return (
    <MobileSidebar current={current}>{(close) => <UiTree onNavigate={close} />}</MobileSidebar>
  );
}
