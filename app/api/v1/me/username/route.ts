import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  member as memberTable,
  organization as organizationTable,
} from "@/lib/db/schema";
import { errorResponse, json } from "@/lib/api";
import { isReservedHandle } from "@/lib/reserved";

/**
 * POST /api/v1/me/username
 *
 * Change the signed-in user's handle. Validation order matches what
 * Better Auth would do, but we run it first so we can return a clean
 * 4xx instead of letting the plugin throw a generic error.
 *
 * Side effect: when the user's personal org still has slug == old
 * username AND the user is its sole member, we rename the slug too.
 * Otherwise `/<oldname>` would resolve to a stale personal org page
 * after the rename. The org rename is best-effort; if it fails the
 * user-rename still stuck.
 */

// Mirrors the regex in lib/auth.ts so the response message matches.
const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export async function POST(req: Request) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) {
    return errorResponse(401, "Authentication required.");
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, "Expected JSON body.");
  }

  const raw =
    body && typeof body === "object" && "username" in body
      ? (body as { username: unknown }).username
      : null;
  if (typeof raw !== "string") {
    return errorResponse(400, "Missing 'username' field.");
  }

  const next = raw.trim();
  if (next.length === 0) {
    return errorResponse(400, "Username cannot be empty.");
  }
  if (!USERNAME_RE.test(next)) {
    return errorResponse(
      400,
      "Username may only contain letters, numbers, and single hyphens, and must start with a letter or number.",
    );
  }
  if (isReservedHandle(next)) {
    return errorResponse(409, "That username is reserved.");
  }

  const current = session.user as typeof session.user & {
    username?: string | null;
  };
  const oldUsername = current.username ?? null;

  // No-op when only case changed and lowercased value is identical:
  // still call updateUser so displayUsername reflects the new casing.
  if (oldUsername && oldUsername.toLowerCase() === next.toLowerCase()) {
    await auth.api.updateUser({
      headers: reqHeaders,
      body: { username: next, displayUsername: next } as unknown as Record<
        string,
        unknown
      >,
    });
    return json({ username: next.toLowerCase(), displayUsername: next });
  }

  try {
    await auth.api.updateUser({
      headers: reqHeaders,
      body: { username: next, displayUsername: next } as unknown as Record<
        string,
        unknown
      >,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not update username.";
    // Better Auth surfaces "USERNAME_IS_ALREADY_TAKEN" / similar in the
    // error message; treat the taken case as 409, everything else 400.
    const taken = /already.*taken|in use/i.test(message);
    return errorResponse(taken ? 409 : 400, message);
  }

  // Best-effort personal-org rename.
  if (oldUsername) {
    const oldSlug = oldUsername.toLowerCase();
    const newSlug = next.toLowerCase();
    const org = await db.query.organization.findFirst({
      where: eq(organizationTable.slug, oldSlug),
    });
    if (org) {
      const peers = await db
        .select({ userId: memberTable.userId })
        .from(memberTable)
        .where(eq(memberTable.organizationId, org.id));
      const isSoleMember =
        peers.length === 1 && peers[0].userId === session.user.id;
      if (isSoleMember) {
        try {
          await auth.api.updateOrganization({
            headers: reqHeaders,
            body: {
              organizationId: org.id,
              data: { slug: newSlug },
            },
          });
        } catch {
          // Slug collision or other failure: leave the org as-is. The
          // username change still succeeded.
        }
      }
    }
  }

  return json({ username: next.toLowerCase(), displayUsername: next });
}
