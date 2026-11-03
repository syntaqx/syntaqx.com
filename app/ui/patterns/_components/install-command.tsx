import { SITE_URL } from "@/lib/constants";
import { CopyButton } from "@/registry/syntaqx/ui/copy-button";

/** The shadcn CLI command that adds a registry item to someone else's app. */
export function InstallCommand({ name }: { name: string }) {
  const command = `npx shadcn@latest add ${SITE_URL}/r/${name}.json`;
  return (
    <div className="mt-3 flex items-center gap-3 border border-border bg-background px-3 py-2">
      <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
        <span className="text-primary select-none">$ </span>
        {command}
      </code>
      <CopyButton text={command} size="sm" />
    </div>
  );
}
