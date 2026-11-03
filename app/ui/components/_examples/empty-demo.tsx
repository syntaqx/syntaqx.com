import { Bell } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/syntaqx/ui/empty";

export default function EmptyDemo() {
  return (
    <Empty className="w-full max-w-md border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Bell />
        </EmptyMedia>
        <EmptyTitle>No notifications</EmptyTitle>
        <EmptyDescription>
          Mentions, reviews and failed deploys show up here as they happen.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
