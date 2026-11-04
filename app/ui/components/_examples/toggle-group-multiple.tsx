"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/registry/syntaqx/ui/toggle-group";

const SIZES = ["16", "32", "48", "64", "128", "256"];

export default function ToggleGroupMultiple() {
  const [sizes, setSizes] = useState(["16", "32", "48"]);

  return (
    <div className="flex flex-col items-start gap-3">
      <ToggleGroup
        type="multiple"
        variant="outline"
        size="sm"
        spacing={1}
        aria-label="Icon sizes"
        value={sizes}
        onValueChange={setSizes}
      >
        {SIZES.map((s) => (
          <ToggleGroupItem key={s} value={s} className="tabular-nums">
            {s}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-sm text-muted-foreground">
        {sizes.length ? `${sizes.length} selected` : "None selected"}
      </p>
    </div>
  );
}
