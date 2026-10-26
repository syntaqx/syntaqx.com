"use client";

import { usePathname } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { converters, moreToolsFor, tools } from "@/lib/tools";
import { webApplication, type Crumb } from "@/lib/schema";

/**
 * Structured data for every /tools leaf page, from the same data that builds
 * the /tools index: tools and converters are free web apps. Hub pages emit
 * their own ItemList.
 */
export function ToolsJsonLd() {
  const pathname = usePathname();
  const crumbs: Crumb[] = [{ name: "Tools", path: "/tools" }];

  const converter = converters.find((t) => t.href === pathname);
  if (converter) crumbs.push({ name: "Converters", path: "/tools/convert" });

  const tool = converter ?? tools.find((t) => t.href === pathname);
  if (!tool) return null;

  crumbs.push({ name: tool.title, path: tool.href });
  return (
    <JsonLd
      data={webApplication({
        name: tool.title,
        description: tool.description,
        path: tool.href,
        crumbs,
        related: moreToolsFor(tool.href).map((t) => ({
          name: t.title,
          path: t.href,
        })),
      })}
    />
  );
}
