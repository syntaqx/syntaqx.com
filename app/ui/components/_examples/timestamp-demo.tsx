import { Timestamp } from "@/registry/syntaqx/ui/timestamp";

export default function TimestampDemo() {
  return (
    <p className="text-sm">
      Charge succeeded{" "}
      <Timestamp
        iso="2026-05-12T14:20:00Z"
        sourceTz="America/Los_Angeles"
        sourceLabel="Merchant"
        align="start"
      />
      .
    </p>
  );
}
