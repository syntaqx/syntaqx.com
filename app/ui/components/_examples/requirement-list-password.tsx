"use client";

import { useState } from "react";
import { Field, FieldDescription, FieldLabel } from "@/registry/syntaqx/ui/field";
import { Input } from "@/registry/syntaqx/ui/input";
import { PasswordInput } from "@/registry/syntaqx/ui/password-input";
import { RequirementList } from "@/registry/syntaqx/ui/requirement-list";

const USERNAME = "syntaqx";
const RULES: { label: string; test: (v: string) => boolean }[] = [
  { label: "At least 12 characters", test: (v) => v.length >= 12 },
  { label: "A number", test: (v) => /\d/.test(v) },
  { label: "A lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "Not your username", test: (v) => v.length > 0 && !v.includes(USERNAME) },
];

export default function RequirementListPassword() {
  const [value, setValue] = useState("");

  return (
    <div className="w-full max-w-sm space-y-6">
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
        {/* As the field's description, a screen reader hears the list once,
            not after every keystroke. */}
        <FieldDescription>
          <RequirementList
            requirements={RULES.map((r) => ({ label: r.label, met: r.test(value) }))}
          />
        </FieldDescription>
      </Field>
    </div>
  );
}
