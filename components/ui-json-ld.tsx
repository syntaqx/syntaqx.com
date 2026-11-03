"use client";

import { usePathname } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { components } from "@/lib/ui";
import { article, pageRef } from "@/lib/schema";

/** Structured data for every /ui component page: each is a technical article. */
export function UiJsonLd() {
  const pathname = usePathname();
  const component = components.find((c) => c.href === pathname);
  if (!component) return null;

  return (
    <JsonLd
      data={article({
        headline: component.title,
        description: component.description,
        path: component.href,
        isPartOf: pageRef("UI", "/ui"),
        crumbs: [
          { name: "UI", path: "/ui" },
          { name: component.title, path: component.href },
        ],
      })}
    />
  );
}
