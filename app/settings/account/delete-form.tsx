"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { FormError } from "@/components/auth/form-error";
import { useModalClose } from "@/components/modal-context";

/**
 * Permanent account deletion.
 *
 * Why type-the-handle instead of a password challenge: today there is
 * no email-verification flow (Resend pending), so a server-side
 * password recheck would be the only second factor — and we'd have to
 * call signInEmail server-side just to reuse Better Auth's verifier,
 * which has the side effect of creating a stray session row. The
 * type-the-handle confirmation matches GitHub's UX and is enough
 * friction to defeat the realistic accidental-deletion case. When
 * email verification ships, this form gets a password field and the
 * server-side hook switches to `sendDeleteAccountVerification`.
 */
export function DeleteAccountForm({ username }: { username: string }) {
  const router = useRouter();
  const close = useModalClose();
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matches = confirm.trim().toLowerCase() === username.toLowerCase();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!matches) return;
    setError(null);
    setPending(true);
    const { error: err } = await authClient.deleteUser();
    if (err) {
      setPending(false);
      setError(err.message ?? "Could not delete account. Please try again.");
      return;
    }
    // Server has already invalidated sessions and cleared the cookie.
    // Redirect home; the layout will re-render in signed-out state.
    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {error && <FormError message={error} onDismiss={() => setError(null)} />}

      <p className="text-sm text-foreground/90 leading-relaxed">
        Your username (<code className="text-foreground">@{username}</code>)
        becomes available for someone else to claim immediately. Organizations
        you belong to alongside other members will keep existing without you.
      </p>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirm"
          className="text-xs font-medium text-foreground"
        >
          To confirm, type <strong>{username}</strong> below.
        </label>
        <input
          id="confirm"
          name="confirm"
          type="text"
          autoComplete="off"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={pending}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-pink focus:outline-none disabled:opacity-60"
        />
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
          disabled={!matches || pending}
          className="inline-flex items-center justify-center rounded-lg border border-pink/60 bg-pink/10 px-4 py-2 text-sm font-medium text-pink transition-colors hover:bg-pink/20 disabled:cursor-not-allowed disabled:opacity-50 enabled:cursor-pointer"
        >
          {pending ? "Deleting…" : "Delete my account"}
        </button>
      </div>
    </form>
  );
}
