"use client";

import { useState, type FormEvent } from "react";
import { requestPasswordReset } from "@/lib/auth-client";
import { FormError } from "./form-error";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    // Email delivery isn't wired yet (no Resend creds). Better Auth will
    // create the verification token row but the user won't get a link
    // until sendResetPassword is configured in lib/auth.ts.
    const { error: err } = await requestPasswordReset({
      email,
      redirectTo: "/login",
    });
    setPending(false);
    if (err) {
      setError(err.message ?? "Request failed. Please try again.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <p className="text-center text-sm text-muted">
        If an account exists for {email}, a reset link is on its way.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {error && <FormError message={error} onDismiss={() => setError(null)} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-accent focus:outline-none disabled:opacity-60"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60 enabled:cursor-pointer"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
