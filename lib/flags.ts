/**
 * Feature flags read from environment variables.
 *
 * Single source of truth so the server config, the UI, and any
 * eventual API guards can't drift. Flags are evaluated at module
 * load — they're effectively static for the lifetime of the
 * process, which matches Vercel's deploy-per-config-change model.
 *
 * Truthy values: "1", "true", "yes", "on" (case-insensitive). Any
 * other value (including empty/unset) is false.
 */

function isTruthy(value: string | undefined): boolean {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase().trim());
}

/**
 * When true, public account creation is closed:
 *   - Better Auth's `sign-up/email` endpoint rejects requests.
 *   - The /signup page renders a "registrations are closed" notice
 *     instead of the form.
 *   - The "Need an account? Sign up" link on /login is hidden.
 *   - The MobileMenu's signed-out state hides the same link.
 *
 * Set `NEXT_PUBLIC_REGISTRATIONS_DISABLED=1` in production to lock
 * the door. The `NEXT_PUBLIC_` prefix is intentional — the flag has
 * to be readable in client components (signup form, login page) and
 * leaking "we are closed for signups" is not a secret.
 */
export const REGISTRATIONS_DISABLED = isTruthy(
  process.env.NEXT_PUBLIC_REGISTRATIONS_DISABLED,
);
