"use client";

import { useState } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/registry/syntaqx/ui/field";
import { Input } from "@/registry/syntaqx/ui/input";

export default function FieldDemo() {
  const [value, setValue] = useState("syntaqx");
  const taken = value.trim().toLowerCase() === "syntaqx";

  return (
    <Field invalid={taken} required className="max-w-sm">
      <FieldLabel>Username</FieldLabel>
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <FieldDescription>Letters, numbers and dashes. You can change it later.</FieldDescription>
      <FieldError>{taken ? "That username is taken" : null}</FieldError>
    </Field>
  );
}
