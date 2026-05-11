import { errorResponse } from "@/lib/api";

/**
 * Stub sign-up endpoint.
 *
 * Always returns 403. Sign-ups are not open while there's no DB and no
 * real auth wired up. URL matches Better Auth's future
 * `/api/auth/sign-up/email` route so the swap-in is mechanical.
 *
 * See: docs/architecture/auth.md
 */
export async function POST() {
  return errorResponse(
    403,
    "Sign ups are currently disabled. syntaqx is not accepting new accounts at this time.",
  );
}
