import { errorResponse } from "@/lib/api";

/**
 * Stub sign-in endpoint.
 *
 * Always returns 401 with a generic "Invalid email or password." message.
 * The URL shape (`/api/auth/sign-in/email`) matches Better Auth's real
 * route so that when real auth lands, this file is deleted and replaced
 * by `app/api/auth/[...all]/route.ts` mounting Better Auth's handler —
 * the client code does not change.
 *
 * See: docs/architecture/auth.md
 */
export async function POST() {
  return errorResponse(401, "Invalid email or password.");
}
