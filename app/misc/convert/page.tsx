import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/card";
import { JsonLd } from "@/components/json-ld";
import { converters } from "@/lib/misc-tools";
import { itemList } from "@/lib/schema";

export default function ConvertIndexPage() {
  return (
    <div>
      <JsonLd
        data={itemList(
          "Converters",
          "/misc/convert",
          converters.map((t) => ({ name: t.title, path: t.href })),
        )}
      />
      <div className="mb-8">
        <h1 className="mb-3 text-3xl leading-[0.95] sm:text-4xl">Converters</h1>
        <p className="max-w-2xl text-dim">
          Conversion tools for text, images, and more.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {converters.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col"
          >
            <Card hover className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl leading-none text-foreground transition-colors group-hover:text-accent">
                  {item.title}
                </h2>
                <ArrowRight
                  size={12}
                  className="text-dim group-hover:text-accent transition-colors"
                />
              </div>
              <p className="text-xs text-dim leading-relaxed">
                {item.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block border border-border px-1.5 py-0.5 text-[10px] text-dim"
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
