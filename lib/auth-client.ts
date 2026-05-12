"use client";

import { createAuthClient } from "better-auth/react";
import {
  organizationClient,
  usernameClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

/**
 * Better Auth React client.
 *
 * Same-origin: no `baseURL` needed when the client is on `syntaqx.com`
 * and the API is at `syntaqx.com/api/auth/*`. The host-locked
 * `__Host-syntaqx.sid` cookie attaches automatically.
 *
 * Plugin set MUST mirror lib/auth.ts so the client knows about every
 * server endpoint and the inferred types stay in sync.
 *
 * See: docs/architecture/auth.md
 */
export const authClient = createAuthClient({
  plugins: [
    usernameClient(),
    organizationClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  organization: orgClient,
} = authClient;

// `requestPasswordReset` / `resetPassword` are dynamically dispatched
// via the client's path-to-object proxy and aren't surfaced on the
// destructured root type, so we re-export them with explicit bindings.
export const requestPasswordReset = authClient.requestPasswordReset;
export const resetPassword = authClient.resetPassword;
