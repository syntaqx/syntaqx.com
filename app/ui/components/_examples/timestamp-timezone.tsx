import { Timestamp } from "@/registry/syntaqx/ui/timestamp";

export default function TimestampTimezone() {
  // One event, fixed. Only the reader's own timezone changes what renders.
  const event = {
    iso: "2026-05-12T14:20:00Z",
    sourceTz: "America/Los_Angeles",
    sourceLabel: "Stripe HQ",
  } as const;

  return (
    <dl className="w-full max-w-md space-y-4 text-sm">
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-muted-foreground">Created</dt>
        <dd>
          <Timestamp {...event} />
        </dd>
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-muted-foreground">Created (date only)</dt>
        <dd>
          <Timestamp {...event} variant="date" />
        </dd>
      </div>
    </dl>
  );
}
