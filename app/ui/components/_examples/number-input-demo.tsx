"use client";

import { useState } from "react";
import { Field, FieldDescription, FieldLabel } from "@/registry/syntaqx/ui/field";
import { NumberInput } from "@/registry/syntaqx/ui/number-input";

export default function NumberInputDemo() {
  const [seats, setSeats] = useState<number | null>(5);

  return (
    <Field className="max-w-xs">
      <FieldLabel>Seats</FieldLabel>
      <NumberInput value={seats} onValueChange={setSeats} min={1} max={50} />
      <FieldDescription>1 to 50. Arrow keys step; typing past 50 settles on blur.</FieldDescription>
    </Field>
  );
}
