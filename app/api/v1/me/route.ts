import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { errorResponse, json } from "@/lib/api";

/**
 * GET /api/v1/me
 *
 * The first session-authenticated route. Resolves the principal from
 * either the host-locked session cookie (browser) or the Authorization
 * bearer (future PATs / OIDC tokens) — both flow through
 * `auth.api.getSession`, which is the single entry the doc calls for.
 *
 * Shape mirrors the `Principal` sketch in docs/architecture/auth.md
 * (minus permissions, which land with the registry).
 */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return errorResponse(401, "Authentication required.");
  }

  const user = session.user as typeof session.user & {
    username?: string | null;
    displayUsername?: string | null;
  };

  return json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      username: user.username ?? null,
      displayUsername: user.displayUsername ?? null,
      image: user.image ?? null,
    },
    session: {
      activeOrganizationId: session.session.activeOrganizationId ?? null,
      expiresAt: session.session.expiresAt,
    },
    source: "session" as const,
  });
}
