"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Checkbox } from "@/components/checkbox";
import { FormError } from "./form-error";

type ApiError = { message?: string };

const USERNAME_PATTERN = "^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$";

export function SignupForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: username,
          username,
          email,
          password,
          marketingOptIn,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as ApiError | null;
        setError(body?.message ?? "Sign up failed. Please try again.");
        return;
      }
      // Real auth lands here later: navigate to /verify-email.
    } catch {
      setError("Sign up failed. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      {error && <FormError message={error} onDismiss={() => setError(null)} />}

      <Field
        id="username"
        label="Username"
        required
        helper="May only contain alphanumeric characters or single hyphens. Cannot begin or end with a hyphen."
      >
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          minLength={1}
          maxLength={39}
          pattern={USERNAME_PATTERN}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={pending}
          className={INPUT_CLS}
        />
      </Field>

      <Field id="email" label="Email" required>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
          className={INPUT_CLS}
        />
      </Field>

      <Field
        id="password"
        label="Password"
        required
        helper="At least 15 characters, OR at least 8 characters including a number and a lowercase letter."
      >
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={pending}
          className={INPUT_CLS}
        />
      </Field>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-xs font-medium text-foreground mb-2">
          Email preferences
        </legend>
        <Checkbox
          checked={marketingOptIn}
          onChange={setMarketingOptIn}
          label="Receive occasional product updates and announcements."
        />
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60 enabled:cursor-pointer"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-xs text-dim leading-relaxed">
        By creating an account, you agree to the{" "}
        <Link
          href="/legal/terms"
          className="text-muted hover:text-accent transition-colors underline underline-offset-2"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/legal/privacy"
          className="text-muted hover:text-accent transition-colors underline underline-offset-2"
        >
          Privacy Statement
        </Link>
        . I&apos;ll occasionally send you account-related emails.
      </p>
    </form>
  );
}

const INPUT_CLS =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-accent focus:outline-none disabled:opacity-60";

function Field({
  id,
  label,
  required,
  helper,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="text-mauve"> *</span>}
      </label>
      {children}
      {helper && <p className="text-xs text-dim leading-relaxed">{helper}</p>}
    </div>
  );
}
