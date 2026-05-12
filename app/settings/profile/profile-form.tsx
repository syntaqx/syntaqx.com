"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { FormError } from "@/components/auth/form-error";

/**
 * Display-name editor. The username is fixed (changing it shifts
 * `/<username>` and break inbound links — that lands on the Account
 * page later), and email is on its own page (Emails). Display name is
 * what the rest of the UI shows; it's safe to edit freely.
 */
export function ProfileForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setPending(true);
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setError("Display name cannot be empty.");
      setPending(false);
      return;
    }
    const { error: err } = await authClient.updateUser({ name: trimmed });
    setPending(false);
    if (err) {
      setError(err.message ?? "Update failed. Please try again.");
      return;
    }
    setSaved(true);
  }

  const dirty = name.trim() !== initialName.trim();

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 max-w-md"
      noValidate
    >
      {error && <FormError message={error} onDismiss={() => setError(null)} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-xs font-medium text-foreground">
          Display name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={120}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          disabled={pending}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-accent focus:outline-none disabled:opacity-60"
        />
        <p className="text-xs text-dim leading-relaxed">
          Your display name appears in the header, on your profile, and on
          anything you publish.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || !dirty}
          className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60 enabled:cursor-pointer"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {saved && <span className="text-xs text-accent">Saved.</span>}
      </div>
    </form>
  );
}
