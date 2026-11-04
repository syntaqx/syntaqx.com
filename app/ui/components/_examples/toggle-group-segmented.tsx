"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/registry/syntaqx/ui/toggle-group";

export default function ToggleGroupSegmented() {
  const [mode, setMode] = useState("decode");

  return (
    <div className="flex flex-col items-start gap-3">
      <ToggleGroup
        type="single"
        variant="outline"
        aria-label="Mode"
        value={mode}
        // Radix lets a second click clear a single group; a mode always has a value.
        onValueChange={(next) => next && setMode(next)}
      >
        <ToggleGroupItem value="decode">Decode</ToggleGroupItem>
        <ToggleGroupItem value="encode">Encode</ToggleGroupItem>
      </ToggleGroup>
      <p className="text-sm text-muted-foreground">Mode: {mode}</p>
    </div>
  );
}
