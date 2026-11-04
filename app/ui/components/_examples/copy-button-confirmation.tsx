import { CopyButton } from "@/registry/syntaqx/ui/copy-button";

export default function CopyButtonConfirmation() {
  const secret = "sk_test_4242424242424242";

  return (
    <div className="flex w-full max-w-md items-center justify-between gap-3">
      <code className="truncate font-mono text-sm">{secret}</code>
      <CopyButton value={secret} variant="outline" size="sm" className="shrink-0" />
    </div>
  );
}
