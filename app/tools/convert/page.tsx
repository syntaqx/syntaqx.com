import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/card";
import { JsonLd } from "@/components/json-ld";
import { converters } from "@/lib/tools";
import { itemList } from "@/lib/schema";
import { ToolHeader } from "@/components/tool-header";

export default function ConvertIndexPage() {
  return (
    <div>
      <JsonLd
        data={itemList(
          "Converters",
          "/tools/convert",
          converters.map((t) => ({ name: t.title, path: t.href })),
        )}
      />
      <ToolHeader eyebrow="tools · converters" title="Converters">
        <p className="max-w-2xl text-muted-foreground">
          Conversion tools for text, images, and more.
        </p>
      </ToolHeader>
      <div className="grid gap-3 sm:grid-cols-2">
        {converters.map((item) => (
          <Link key={item.href} href={item.href} className="group flex flex-col">
            <Card hover className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl leading-none text-foreground transition-colors group-hover:text-primary">
                  {item.title}
                </h2>
                <ArrowRight
                  size={12}
                  className="text-muted-foreground group-hover:text-primary transition-colors"
                />
              </div>
              <p className="text-xs/relaxed text-muted-foreground ">{item.description}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
