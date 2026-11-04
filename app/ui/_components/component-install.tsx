import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRegistryItem } from "@/lib/registry";
import { CodeBlock } from "./code-block";

/**
 * How to add a registry item to another app, the way shadcn's docs show it:
 * the CLI command, or the dependencies and files to copy by hand.
 */
export function ComponentInstall({ name, heading = true }: { name: string; heading?: boolean }) {
  const item = getRegistryItem(name);
  const npm = item.dependencies.length ? `npm install ${item.dependencies.join(" ")}` : null;

  return (
    <div className={heading ? "mt-6" : undefined}>
      {heading && (
        <h3 className="mb-3 font-sans text-base/snug font-semibold normal-case">
          Install <code className="font-mono text-sm text-primary">{item.name}</code>
        </h3>
      )}
      <Tabs defaultValue="cli">
        <TabsList variant="line">
          <TabsTrigger value="cli">CLI</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>
        <TabsContent value="cli">
          <CodeBlock code={item.command} lang="bash" />
        </TabsContent>
        <TabsContent value="manual" className="space-y-4">
          {npm && (
            <Step n={1} title="Install the dependencies">
              <CodeBlock code={npm} lang="bash" />
            </Step>
          )}
          {item.registryDependencies.length > 0 && (
            <Step n={npm ? 2 : 1} title="Add the components it builds on">
              <CodeBlock
                code={`npx shadcn@latest add ${item.registryDependencies.join(" ")}`}
                lang="bash"
              />
            </Step>
          )}
          <Step
            n={1 + (npm ? 1 : 0) + (item.registryDependencies.length ? 1 : 0)}
            title="Copy the source into your project"
          >
            <div className="space-y-3">
              {item.files.map((f) => (
                <CodeBlock key={f.path} code={f.source} title={f.target} />
              ))}
            </div>
          </Step>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2.5 text-sm text-foreground">
        <span className="inst flex size-5 items-center justify-center border border-border text-[0.55rem] text-muted-foreground">
          {n}
        </span>
        {title}
      </p>
      {children}
    </div>
  );
}
