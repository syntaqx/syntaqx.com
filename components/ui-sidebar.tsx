"use client";

import { usePathname } from "next/navigation";
import { MobileSidebar, SidebarNav } from "@/components/sidebar-nav";
import { componentGroups, components, uiPages } from "@/lib/ui";

/** Every /ui page: the overview and installation, then the components by category. */
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
    [...uiPages, ...components].find((p) => p.href === pathname)?.title ??
    (pathname === "/ui" ? "Overview" : "UI");

  return (
    <MobileSidebar current={current}>{(close) => <UiTree onNavigate={close} />}</MobileSidebar>
  );
}
