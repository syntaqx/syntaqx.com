"use client";

import { useId, useState } from "react";
import { CircleCheck, RotateCcw } from "lucide-react";
import { Compare, DemoFrame } from "@/app/ui/_components/demo-frame";
import { Button } from "@/registry/syntaqx/ui/button";
import { ErrorSummary } from "@/registry/syntaqx/ui/error-summary";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldValid,
} from "@/registry/syntaqx/ui/field";
import { Input } from "@/registry/syntaqx/ui/input";
import { NumberInput } from "@/registry/syntaqx/ui/number-input";
import { PasswordInput } from "@/registry/syntaqx/ui/password-input";
import { RequirementList } from "@/registry/syntaqx/ui/requirement-list";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// Reward early, punish late
// ---------------------------------------------------------------------------
// The same email field twice. The left one validates on every keystroke, so
// it calls you wrong before you've finished typing. The right one waits for
// blur before showing an error, but confirms success the moment the value is
// valid, and once a field is in error it re-checks on every keystroke so the
// error clears as soon as it's fixed.

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

function TimingDemo() {
  return (
    <DemoFrame
      note={
        <>
          Type an address slowly into each. The first flags &ldquo;y&rdquo; as an error mid-word;
          the second waits until you leave the field, then clears its error the moment you fix it.
        </>
      }
    >
      <Compare wrong={<EagerField />} right={<RewardingField />} />
    </DemoFrame>
  );
}

// ---------------------------------------------------------------------------
// Error summary on submit
// ---------------------------------------------------------------------------
// On a failed submit, inline errors alone aren't enough: on a long form
// they're off screen, and a screen reader hears nothing. The summary takes
// focus, counts the problems and links each one to its field.

type Fields = { name: string; email: string; seats: number | null };
const EMPTY: Fields = { name: "", email: "", seats: null };

function validate(f: Fields): Partial<Record<keyof Fields, string>> {
  const errors: Partial<Record<keyof Fields, string>> = {};
  if (!f.name.trim()) errors.name = "Enter your name";
  if (!EMAIL.test(f.email)) errors.email = "Enter an email address like you@example.com";
  if (f.seats === null || f.seats < 1) errors.seats = "Enter how many seats you need, 1 or more";
  return errors;
}

function SummaryDemo() {
  const id = useId();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<ReturnType<typeof validate> | null>(null);
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
      <DemoFrame
        className="flex items-center justify-between gap-3 p-6"
        note="Valid on submit: no summary, no detour."
      >
        <span className="inline-flex items-center gap-2 text-sm text-primary">
          <CircleCheck className="size-4" /> Trial started
        </span>
        <Button variant="outline" size="sm" onClick={reset}>
          <RotateCcw /> Reset
        </Button>
      </DemoFrame>
    );
  }

  return (
    <DemoFrame
      note={
        <>
          Submit it empty. Focus jumps to the summary, each link moves focus to its field, and the
          summary shrinks as you fix things.
        </>
      }
    >
      <form noValidate onSubmit={onSubmit} className="space-y-6 p-6">
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
    </DemoFrame>
  );
}

// ---------------------------------------------------------------------------
// Rules before errors
// ---------------------------------------------------------------------------
// When a field has rules, show them before the first keystroke and tick them
// off as they're met. The reader never has to fail to find out what passes.

const USERNAME = "syntaqx";
const RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: "At least 12 characters", test: (v) => v.length >= 12 },
  { label: "A number", test: (v) => /\d/.test(v) },
  { label: "A lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "Not your username", test: (v) => v.length > 0 && !v.includes(USERNAME) },
];

function RulesDemo() {
  const [value, setValue] = useState("");

  return (
    <DemoFrame
      note={
        <>
          The rules are visible before you type, and each ticks off as it&apos;s met. The screen
          reader hears the list once, as the field&apos;s description, not after every keystroke.
        </>
      }
    >
      <div className="max-w-sm space-y-6 p-6">
        <Field>
          <FieldLabel>Username</FieldLabel>
          <Input value={USERNAME} readOnly autoComplete="username" />
        </Field>
        <Field>
          <FieldLabel>New password</FieldLabel>
          <PasswordInput
            autoComplete="new-password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <FieldDescription>
            <RequirementList
              requirements={RULES.map((r) => ({ label: r.label, met: r.test(value) }))}
            />
          </FieldDescription>
        </Field>
      </div>
    </DemoFrame>
  );
}

export { TimingDemo, SummaryDemo, RulesDemo };
