"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormError } from "@/components/auth/form-error";
import { useModalClose } from "@/components/modal-context";

/**
 * Change-username form.
 *
 * GitHub-style: lives on the Account page, not Profile, because the
 * username is the sign-in identifier and the URL of `/<handle>`. The
 * server enforces format + reserved + uniqueness; this form only does
 * fast client-side rejection so the user gets immediate feedback.
 *
 * After a successful change, we hard-refresh so the layout (header
 * dropdown, settings sidebar) re-reads the session with the new
 * handle.
 */

const PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export function UsernameForm({ initialUsername }: { initialUsername: string }) {
  const router = useRouter();
  const close = useModalClose();
  const [value, setValue] = useState(initialUsername);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = value.trim();
  const dirty = trimmed.toLowerCase() !== initialUsername.toLowerCase();
  const valid = PATTERN.test(trimmed);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!dirty || !valid || pending) return;

    setError(null);
    setPending(true);

    let res: Response;
    try {
      res = await fetch("/api/v1/me/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      });
    } catch {
      setPending(false);
      setError("Network error. Please try again.");
      return;
    }

    if (!res.ok) {
      setPending(false);
      let message = "Could not change username.";
      try {
        const body = (await res.json()) as { message?: string };
        if (body.message) message = body.message;
      } catch {
        // Keep default message.
      }
      setError(message);
      return;
    }

    setPending(false);
    router.refresh();
    close();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {error && <FormError message={error} onDismiss={() => setError(null)} />}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="username"
          className="text-xs font-medium text-foreground"
        >
          Username
        </label>
        <div className="flex items-center rounded-lg border border-border bg-background focus-within:border-accent">
          <span className="select-none pl-3 pr-1 text-sm text-dim">@</span>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="off"
            spellCheck={false}
            maxLength={39}
            pattern={PATTERN.source}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={pending}
            className="w-full rounded-r-lg bg-transparent py-2 pr-3 text-sm text-foreground focus:outline-none disabled:opacity-60"
          />
        </div>
        <p className="text-xs text-dim leading-relaxed">
          Letters, numbers, and single hyphens. 1&ndash;39 characters.
        </p>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => close()}
          disabled={pending}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-border-hover disabled:opacity-60 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending || !dirty || !valid}
          className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60 enabled:cursor-pointer"
        >
          {pending ? "Saving…" : "Change username"}
        </button>
      </div>
    </form>
  );
}
