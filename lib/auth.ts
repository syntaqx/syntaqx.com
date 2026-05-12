import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { organization, username } from "better-auth/plugins";
import { db } from "@/lib/db";
import { isReservedHandle } from "@/lib/reserved";

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
