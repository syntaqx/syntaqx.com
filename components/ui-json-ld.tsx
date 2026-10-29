"use client";

import { usePathname } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { patterns } from "@/lib/ui";
import { article, pageRef } from "@/lib/schema";

/** Structured data for every /ui pattern page: each is a technical article. */
export function UiJsonLd() {
  const pathname = usePathname();
  const pattern = patterns.find((p) => p.href === pathname);
  if (!pattern) return null;

  return (
    <JsonLd
      data={article({
        headline: pattern.title,
        description: pattern.description,
        path: pattern.href,
        isPartOf: pageRef("UI Patterns", "/ui"),
        crumbs: [
          { name: "UI", path: "/ui" },
          { name: pattern.title, path: pattern.href },
        ],
      })}
    />
  );
}
