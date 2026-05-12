"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { FormError } from "@/components/auth/form-error";

/**
 * Change password.
 *
 * Better Auth's `changePassword` requires the current password (so a
 * stolen-cookie attacker can't reset credentials) and accepts an
 * optional `revokeOtherSessions`. We default that to true: a password
 * change implies "I'm rotating because something might be wrong" more
 * often than it implies "casual maintenance".
 */
export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [revoke, setRevoke] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (next.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (next !== confirm) {
      setError("New passwords don't match.");
      return;
    }
    if (next === current) {
      setError("New password must be different from your current password.");
      return;
    }

    setPending(true);
    const { error: err } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: revoke,
    });
    setPending(false);

    if (err) {
      setError(err.message ?? "Password change failed.");
      return;
    }

    setSaved(true);
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 max-w-md"
      noValidate
    >
      {error && <FormError message={error} onDismiss={() => setError(null)} />}

      <Field id="current" label="Current password">
        <input
          id="current"
          name="current"
          type="password"
          autoComplete="current-password"
          required
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          disabled={pending}
          className={INPUT_CLS}
        />
      </Field>

      <Field id="new" label="New password" helper="At least 8 characters.">
        <input
          id="new"
          name="new"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          disabled={pending}
          className={INPUT_CLS}
        />
      </Field>

      <Field id="confirm" label="Confirm new password">
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={pending}
          className={INPUT_CLS}
        />
      </Field>

      <label className="flex items-start gap-2.5 text-xs text-muted">
        <input
          type="checkbox"
          checked={revoke}
          onChange={(e) => setRevoke(e.target.checked)}
          disabled={pending}
          className="mt-0.5"
        />
        <span>
          Sign out other devices. Recommended after a password change.
        </span>
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60 enabled:cursor-pointer"
        >
          {pending ? "Updating…" : "Update password"}
        </button>
        {saved && (
          <span className="text-xs text-accent">Password updated.</span>
        )}
      </div>
    </form>
  );
}

const INPUT_CLS =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-accent focus:outline-none disabled:opacity-60";

function Field({
  id,
  label,
  helper,
  children,
}: {
  id: string;
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </label>
      {children}
      {helper && <p className="text-xs text-dim leading-relaxed">{helper}</p>}
    </div>
  );
}
