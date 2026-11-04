"use client";

import { useState } from "react";
import { Check, Inbox, RotateCcw } from "lucide-react";
import { Button } from "@/registry/syntaqx/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/syntaqx/ui/empty";

const TASKS = ["Review the payout PR", "Reply to the vendor", "Approve the rollout"];

export default function EmptyAllDone() {
  const [done, setDone] = useState<string[]>([]);
  const remaining = TASKS.filter((t) => !done.includes(t));

  return (
    <div className="w-full max-w-md rounded-lg border">
      {remaining.length > 0 ? (
        <ul className="divide-y">
          {remaining.map((t) => (
            <li key={t} className="flex items-center gap-3 px-4 py-3">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={`Mark "${t}" done`}
                onClick={() => setDone((d) => [...d, t])}
                className="text-transparent hover:border-primary hover:bg-transparent hover:text-primary focus-visible:text-primary"
              >
                <Check />
              </Button>
              <span className="text-sm">{t}</span>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon" className="text-primary">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>All caught up</EmptyTitle>
            <EmptyDescription>Nothing needs you right now.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" onClick={() => setDone((d) => d.slice(0, -1))}>
              <RotateCcw /> Undo last
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
