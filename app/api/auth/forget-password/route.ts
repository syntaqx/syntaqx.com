import { errorResponse } from "@/lib/api";

/**
 * Stub forget-password endpoint.
 *
 * Always returns 403. URL matches Better Auth's future
 * `/api/auth/forget-password` route so the swap-in is mechanical.
 *
 * See: docs/architecture/auth.md
 */
export async function POST() {
  return errorResponse(
    403,
    "Password reset is currently disabled for external usage.",
  );
}
