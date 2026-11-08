import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/syntaqx/ui/tabs";

const SNIPPETS = {
  npm: "npx shadcn@latest add https://www.syntaqx.com/r/tabs.json",
  pnpm: "pnpm dlx shadcn@latest add https://www.syntaqx.com/r/tabs.json",
  bun: "bunx --bun shadcn@latest add https://www.syntaqx.com/r/tabs.json",
};

export default function TabsLine() {
  return (
    <Tabs defaultValue="npm" className="w-full max-w-xl gap-0 border border-border">
      <TabsList variant="line" aria-label="Package manager" className="bg-card">
        {Object.keys(SNIPPETS).map((pm) => (
          <TabsTrigger key={pm} value={pm}>
            {pm}
          </TabsTrigger>
        ))}
      </TabsList>
      {Object.entries(SNIPPETS).map(([pm, code]) => (
        <TabsContent key={pm} value={pm} className="p-4 font-mono text-xs break-all">
          {code}
        </TabsContent>
      ))}
    </Tabs>
  );
}
