import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { organization, username } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import {
  member as memberTable,
  organization as organizationTable,
} from "@/lib/db/schema";
import { isReservedHandle } from "@/lib/reserved";
import { REGISTRATIONS_DISABLED } from "@/lib/flags";

/**
 * Better Auth server config.
 *
 * Mounted at app/api/auth/[...all]/route.ts. The chosen surface matches
 * docs/architecture/auth.md:
 *
 *   - DB-backed sessions (no browser-held JWTs).
 *   - Host-locked cookie: `__Host-syntaqx.sid` in production. The
 *     `__Host-` prefix forces Secure + Path=/ + no Domain — browser
 *     enforces this, so a misconfigured deploy can't broaden scope.
 *     In dev (HTTP), Secure cookies don't work, so we drop the prefix
 *     and use `syntaqx.sid`.
 *   - Username plugin: signup form already collects a GitHub-style
 *     handle, so usernames are first-class.
 *   - Organization plugin: orgs from day one. A personal org is
 *     auto-created on user creation via the database hook below.
 *
 * Social providers and email verification are intentionally not wired
 * yet — credentials/Resend pending. The UI registry in
 * components/auth/providers.ts gates them; flipping `enabled: true`
 * once env vars exist is sufficient.
 */

const isProd = process.env.NODE_ENV === "production";

// GitHub-style handle pattern, mirrored from components/auth/signup-form.tsx
// so server-side validation matches the client's `pattern` attribute.
const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Server-side gate. When true, POST /api/auth/sign-up/email returns
    // a Better Auth "signups disabled" error regardless of what the UI
    // does. Pair with NEXT_PUBLIC_REGISTRATIONS_DISABLED so the form
    // hides too — see lib/flags.ts.
    disableSignUp: REGISTRATIONS_DISABLED,
  },

  session: {
    /**
     * Sign the session payload into the cookie itself for a short
     * window so `getSession()` is an HMAC verify instead of a DB
     * lookup. This is the difference between every /settings/*
     * navigation paying ~50–100ms for a session round trip vs. ~1ms.
     *
     * Better Auth invalidates the cached cookie automatically on any
     * session-mutating action (sign in/out, password change, account
     * delete, etc.), so the only staleness window is for fields read
     * straight off `session.user` (name, image, username) — those can
     * lag behind a profile edit by up to `maxAge` seconds. Acceptable
     * for the avatar in the settings sidebar.
     *
     * 5 minutes matches the better-auth example default and is short
     * enough that a logged-out cookie can't be replayed for long if
     * exfiltrated, while long enough to cover a normal nav burst
     * across settings tabs.
     */
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  user: {
    additionalFields: {
      marketingOptIn: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: true,
      },
    },
    /**
     * GDPR right-to-erasure. The endpoint is POST /api/auth/delete-user;
     * the React client calls it via `authClient.deleteUser()`. Today the
     * gate is the active session plus a username-confirmation step in
     * the UI — no password re-auth, because we don't yet have email
     * verification wired (Resend is pending). When email lands, switch
     * to `sendDeleteAccountVerification` for a two-step confirm-by-link
     * flow. See docs/architecture/auth.md → Account deletion.
     *
     * `beforeDelete` runs inside the same request as the user-row
     * delete; throwing aborts the deletion. We use it to remove the
     * data Postgres FK cascades won't touch:
     *   1. Avatars in Vercel Blob (URL is just text in user.image).
     *   2. Organizations where this user is the sole member — always
     *      true for the auto-created personal org, and the right call
     *      for any single-owner org they made later. Multi-member orgs
     *      lose this user's membership via the member.userId cascade
     *      and stay intact for the remaining members.
     */
    deleteUser: {
      enabled: true,
      beforeDelete: async (user) => {
        const image = (user as { image?: string | null }).image;
        if (image && image.includes(".public.blob.vercel-storage.com/")) {
          try {
            await del(image);
          } catch {
            // Best effort. A leftover blob is cheaper than a failed
            // erasure (the user still ends up gone from the DB).
          }
        }

        const memberships = await db
          .select({ organizationId: memberTable.organizationId })
          .from(memberTable)
          .where(eq(memberTable.userId, user.id));

        for (const m of memberships) {
          const peers = await db
            .select({ id: memberTable.id })
            .from(memberTable)
            .where(eq(memberTable.organizationId, m.organizationId));
          if (peers.length === 1) {
            await db
              .delete(organizationTable)
              .where(eq(organizationTable.id, m.organizationId));
          }
        }
      },
    },
  },

  plugins: [
    username({
      minUsernameLength: 1,
      maxUsernameLength: 39,
      // Format check + reserved-handle check. Reserved names would
      // otherwise be shadowed by static routes (e.g. signing up as
      // "settings" gives the user a profile URL they can never visit).
      usernameValidator: (u) => USERNAME_RE.test(u) && !isReservedHandle(u),
    }),
    organization({
      // Personal org is created in the user.create.after hook below so
      // that every user has at least one org from t=0.
      allowUserToCreateOrganization: true,
    }),
    // nextCookies() must be the LAST plugin so its hook wraps responses
    // from server actions and forwards Set-Cookie headers correctly.
    nextCookies(),
  ],

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Personal org per user. Slug uses the username when present,
          // falls back to user id. Vercel-style.
          const slug =
            (user as { username?: string }).username ?? `u-${user.id}`;
          await auth.api.createOrganization({
            body: {
              name: user.name || slug,
              slug,
              userId: user.id,
            },
          });
        },
      },
    },
  },

  advanced: {
    // Cookie name resolves to `${cookiePrefix}.${cookies[k].name}` =>
    // `__Host-syntaqx.sid` in prod, `syntaqx.sid` in dev. Matches the
    // name documented in docs/architecture/auth.md.
    cookiePrefix: isProd ? "__Host-syntaqx" : "syntaqx",
    useSecureCookies: isProd,
    cookies: {
      session_token: { name: "sid" },
    },
    defaultCookieAttributes: {
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secure: isProd,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
