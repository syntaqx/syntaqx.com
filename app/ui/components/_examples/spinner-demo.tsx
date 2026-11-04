import { Spinner } from "@/registry/syntaqx/ui/spinner";

export default function SpinnerDemo() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner />
      Waiting for the payment provider
    </div>
  );
}
