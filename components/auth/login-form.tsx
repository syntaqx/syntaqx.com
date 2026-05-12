"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signIn } from "@/lib/auth-client";
import { FormError } from "./form-error";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    // Pick the right Better Auth endpoint based on whether the input
    // looks like an email. The `username` plugin exposes
    // `signIn.username`; the core ships `signIn.email`. Both produce
    // the same session cookie, so the rest of the flow is identical.
    const isEmail = identifier.includes("@");
    const { error: err } = isEmail
      ? await signIn.email({ email: identifier, password })
      : await signIn.username({ username: identifier, password });
    setPending(false);
    if (err) {
      setError(err.message ?? "Invalid email or password.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {error && <FormError message={error} onDismiss={() => setError(null)} />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="identifier" className="text-xs text-muted">
          Username or email
        </label>
        <input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          required
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={pending}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-accent focus:outline-none disabled:opacity-60"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className="text-xs text-muted">
            Password
          </label>
          <Link
            href="/forgot-password"
            // Skip in tab order so Tab from the identifier field lands
            // on the password input, not this auxiliary link.
            tabIndex={-1}
            className="text-xs text-dim hover:text-accent transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={pending}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-accent focus:outline-none disabled:opacity-60"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60 enabled:cursor-pointer"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
