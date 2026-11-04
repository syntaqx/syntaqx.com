import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ComponentType } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toAppImports } from "@/lib/registry";
import { CodeBlock } from "./code-block";

/**
 * A component example the way shadcn's docs show one: the live preview,
 * centered on a quiet canvas, and the example's source a tab away, with the
 * imports an installing app would have.
 */
export function ExamplePreview({ slug, Component }: { slug: string; Component: ComponentType }) {
  const source = toAppImports(
    readFileSync(join(process.cwd(), "app/ui/components/_examples", `${slug}.tsx`), "utf8"),
  );

  return (
    <Tabs defaultValue="preview">
      <TabsList variant="line">
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview">
        <div className="flex min-h-72 items-center justify-center rounded-lg border bg-background p-6 sm:p-10">
          <Component />
        </div>
      </TabsContent>
      <TabsContent value="code">
        <CodeBlock code={source} />
      </TabsContent>
    </Tabs>
  );
}
