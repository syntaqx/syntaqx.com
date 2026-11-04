import { Separator } from "@/registry/syntaqx/ui/separator";

export default function SeparatorDemo() {
  return (
    <div className="w-full max-w-xs">
      <p className="text-sm font-medium">Billing</p>
      <p className="text-sm text-muted-foreground">Invoices, payment methods and tax IDs.</p>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <span>Invoices</span>
        <Separator orientation="vertical" />
        <span>Payment methods</span>
        <Separator orientation="vertical" />
        <span>Tax</span>
      </div>
    </div>
  );
}
