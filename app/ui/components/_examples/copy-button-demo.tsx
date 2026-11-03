import { CopyButton } from "@/registry/syntaqx/ui/copy-button";

export default function CopyButtonDemo() {
  const key = "demo_key_7f3a9c2e1b4d";

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/40 py-1 pr-1 pl-3">
        <code className="truncate font-mono text-sm">{key}</code>
        <CopyButton value={key} size="icon-sm" />
      </div>
      <CopyButton value={key} variant="outline" size="sm" className="self-start" />
    </div>
  );
}
