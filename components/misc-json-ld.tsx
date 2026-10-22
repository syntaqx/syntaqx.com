"use client";

import { usePathname } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { converters, patterns, tools } from "@/lib/misc-tools";
import { article, webApplication, type Crumb } from "@/lib/schema";

/**
 * Structured data for every /misc leaf page, from the same data that builds
 * the /misc index: tools and converters are free web apps, UI pattern pages
 * are articles. Hub pages emit their own ItemList.
 */
export function MiscJsonLd() {
  const pathname = usePathname();
  const crumbs: Crumb[] = [{ name: "Tools", path: "/misc" }];

  const converter = converters.find((t) => t.href === pathname);
  if (converter) crumbs.push({ name: "Converters", path: "/misc/convert" });

  const tool = converter ?? tools.find((t) => t.href === pathname);
  if (tool) {
    crumbs.push({ name: tool.title, path: tool.href });
    return (
      <JsonLd
        data={webApplication({
          name: tool.title,
          description: tool.description,
          path: tool.href,
          crumbs,
        })}
      />
    );
  }

  const pattern = patterns.find((t) => t.href === pathname);
  if (pattern) {
    crumbs.push({ name: pattern.title, path: pattern.href });
    return (
      <JsonLd
        data={article({
          type: "Article",
          headline: pattern.title,
          description: pattern.description,
          path: pattern.href,
          crumbs,
        })}
      />
    );
  }

  return null;
}
