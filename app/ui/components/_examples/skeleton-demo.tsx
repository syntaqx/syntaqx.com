import { Skeleton } from "@/registry/syntaqx/ui/skeleton";

export default function SkeletonDemo() {
  return (
    <div className="flex w-full max-w-xs items-center gap-3">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
