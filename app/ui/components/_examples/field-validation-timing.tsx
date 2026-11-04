"use client";

import { useState } from "react";
import { Field, FieldError, FieldLabel, FieldValid } from "@/registry/syntaqx/ui/field";
import { Input } from "@/registry/syntaqx/ui/input";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validates on every keystroke, so it calls you wrong before you've
// finished typing.
function EagerField() {
  const [value, setValue] = useState("");
  const error = value && !EMAIL.test(value) ? "Enter a valid email address" : undefined;

  return (
    <Field invalid={Boolean(error)}>
      <FieldLabel>Email</FieldLabel>
      <Input
        type="email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="you@example.com"
      />
      <FieldError>{error}</FieldError>
    </Field>
  );
}

// Waits for blur before showing an error, but confirms success the moment
// the value is valid. Once in error it re-checks on every keystroke, so the
// error clears as soon as it's fixed.
function RewardingField() {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const valid = EMAIL.test(value);
  const error = touched && value && !valid ? "Enter a valid email address" : undefined;

  return (
    <Field invalid={Boolean(error)}>
      <FieldLabel>Email</FieldLabel>
      <Input
        type="email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder="you@example.com"
      />
      <FieldError>{error}</FieldError>
      {valid && <FieldValid>Looks good</FieldValid>}
    </Field>
  );
}

export default function FieldValidationTiming() {
  return (
    <div className="grid w-full max-w-2xl gap-8 sm:grid-cols-2">
      <section className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Every keystroke</h4>
        <EagerField />
      </section>
      <section className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Reward early, punish late</h4>
        <RewardingField />
      </section>
    </div>
  );
}
