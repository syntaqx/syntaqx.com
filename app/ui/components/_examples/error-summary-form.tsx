"use client";

import { useId, useState } from "react";
import { CircleCheck, RotateCcw } from "lucide-react";
import { Button } from "@/registry/syntaqx/ui/button";
import { ErrorSummary } from "@/registry/syntaqx/ui/error-summary";
import { Field, FieldError, FieldLabel } from "@/registry/syntaqx/ui/field";
import { Input } from "@/registry/syntaqx/ui/input";
import { NumberInput } from "@/registry/syntaqx/ui/number-input";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Fields = { name: string; email: string; seats: number | null };
const EMPTY: Fields = { name: "", email: "", seats: null };

function validate(f: Fields): Partial<Record<keyof Fields, string>> {
  const errors: Partial<Record<keyof Fields, string>> = {};
  if (!f.name.trim()) errors.name = "Enter your name";
  if (!EMAIL.test(f.email)) errors.email = "Enter an email address like you@example.com";
  if (f.seats === null || f.seats < 1) errors.seats = "Enter how many seats you need, 1 or more";
  return errors;
}

export default function ErrorSummaryForm() {
  const id = useId();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<ReturnType<typeof validate> | null>(null);
  // Bumped on every failed submit, so the summary takes focus each time.
  const [submits, setSubmits] = useState(0);
  const [sent, setSent] = useState(false);
  const fieldId = (key: keyof Fields) => `${id}-${key}`;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate(fields);
    if (Object.keys(next).length === 0) {
      setErrors(null);
      setSent(true);
      return;
    }
    setErrors(next);
    setSubmits((n) => n + 1);
  };

  // Once submitted, errors track the fields live so fixes clear them.
  const update = (patch: Partial<Fields>) => {
    const next = { ...fields, ...patch };
    setFields(next);
    if (errors) setErrors(validate(next));
  };

  const reset = () => {
    setFields(EMPTY);
    setErrors(null);
    setSent(false);
  };

  if (sent) {
    return (
      <div className="flex w-full max-w-2xl items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm text-primary">
          <CircleCheck className="size-4" /> Trial started
        </span>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw /> Reset
        </Button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="w-full max-w-2xl space-y-6">
      <ErrorSummary
        focusKey={submits}
        errors={(Object.keys(errors ?? {}) as (keyof Fields)[]).map((key) => ({
          fieldId: fieldId(key),
          message: errors?.[key],
        }))}
      />
      <div className="grid gap-6 sm:grid-cols-[1fr_1fr_auto]">
        <Field id={fieldId("name")} invalid={Boolean(errors?.name)} required>
          <FieldLabel>Name</FieldLabel>
          <Input
            autoComplete="name"
            value={fields.name}
            onChange={(e) => update({ name: e.target.value })}
          />
          <FieldError>{errors?.name}</FieldError>
        </Field>
        <Field id={fieldId("email")} invalid={Boolean(errors?.email)} required>
          <FieldLabel>Work email</FieldLabel>
          <Input
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={(e) => update({ email: e.target.value })}
          />
          <FieldError>{errors?.email}</FieldError>
        </Field>
        <Field id={fieldId("seats")} invalid={Boolean(errors?.seats)} required>
          <FieldLabel>Seats</FieldLabel>
          <NumberInput
            min={1}
            max={500}
            value={fields.seats}
            onValueChange={(seats) => update({ seats })}
          />
          <FieldError>{errors?.seats}</FieldError>
        </Field>
      </div>
      <Button type="submit">Start trial</Button>
    </form>
  );
}
