# Auth & identity architecture

> Internal engineering doc. Not published. Captures the design we settled on
> for syntaqx auth so future work (ours or an agent's) doesn't relitigate
> the decisions.

## Status

**Today (May 2026):** Phase 2 implemented. Neon Postgres + Drizzle +
Better Auth (`lib/auth.ts`) are live. Email + password signup/sign-in
work end-to-end through Better Auth's catch-all handler at
`app/api/auth/[...all]/route.ts`. Sessions are DB-backed and the cookie
is host-locked (`__Host-syntaqx.sid` in prod, `syntaqx.sid` in dev).
The `username` and `organization` plugins are enabled; a personal org
is auto-created in the `user.create.after` database hook. The header
renders a session-aware `UserMenu` (server-side session lookup, no
flicker). `/api/v1/me` is the first protected route and returns the
resolved principal.

**Not yet built:** social providers (GitHub/Google — needs creds),
email verification + password-reset delivery (needs Resend), PATs,
permission registry, unified `getPrincipal()`, CORS lockdown, OIDC
provider, BFF→API split.

## Goals

- Sessions for the first-party UI, **never JWTs in the browser**.
- Personal Access Tokens (PATs) for non-browser API consumers.
- Symmetric server-side resolution: one helper accepts either a session
  cookie or a `Bearer pat_…` token and produces the same principal.
- Be an OIDC provider for our own future apps (and, eventually, third
  parties) — not a shared-cookie kludge across subdomains.
- Stay portable: when the API is extracted out of this Next.js BFF, the
  browser contract does not change.

## Non-goals

- Storing tokens of any kind in `localStorage` / `sessionStorage` / a
  non-`HttpOnly` cookie. Never.
- Long-lived stateless JWTs presented by the browser. The revocation,
  size-limit, and stale-permissions problems are why we don't.
- Supabase auth, Auth.js's default JWT-session mode, Lucia (deprecated),
  or rolling our own OAuth.

## Identity model

Three credential types, in expected order of how often they appear:

| Credential | Who holds it | How it's sent | Lifetime | Revocable |
|---|---|---|---|---|
| **Session** | A browser on `syntaqx.com` | `Cookie: __Host-syntaqx.sid=…` (httpOnly) | Days, rolling | Yes (delete the row) |
| **PAT** | Scripts, CLIs, third-party apps | `Authorization: Bearer pat_…` | User-chosen (7d → no expiry) | Yes (delete the row) |
| **OIDC access token** *(future)* | A registered OAuth client app | `Authorization: Bearer …` | Short (≤1h), refreshable | Yes |

All three resolve to the same `Principal` shape on the server:

```ts
type Principal = {
  userId: string;
  activeOrgId: string;
  permissions: Permission[];      // effective in active org
  source: "session" | "pat" | "oauth";
  tokenId?: string;               // for PAT / OAuth, for audit
  clientId?: string;              // OAuth only
};
```

## Cookie design

- **Name:** `__Host-syntaqx.sid`
- **Attributes:** `HttpOnly; Secure; SameSite=Lax; Path=/`
- **No `Domain` attribute** — the `__Host-` prefix forbids it. The cookie
  is host-locked to `syntaqx.com`. It is **not** sent to
  `api.syntaqx.com`, `*.syntaqx.com`, or anything else.
- **Value:** opaque random 32-byte ID, base64url-encoded. Server looks
  the row up in the `session` table. No JWT, no signed payload.

The `__Host-` prefix is a browser-enforced safety net: the browser will
refuse a `Set-Cookie` that violates the prefix's rules (`Path=/`,
`Secure`, no `Domain`), so a misconfigured deploy can't accidentally
broaden the cookie's scope.

## How the frontend talks to the API

The frontend uses **same-origin** API calls:

```ts
fetch("/api/v1/me");           // cookie attached, no CORS, no preflight
```

This works because `proxy.ts` routes `syntaqx.com/api/v1/*` to the same
handlers that serve `api.syntaqx.com/v1/*`. Both URLs are front doors to
identical handler code. The same-origin path is faster (no preflight),
simpler (no `credentials: "include"`), and safer (host-locked cookie is
sufficient).

We do **not** support `fetch("https://api.syntaqx.com/v1/me", {
credentials: "include" })` from the browser. That would require a
`Domain=.syntaqx.com` cookie, which broadens the trust boundary to every
subdomain forever. We use PATs and OIDC for non-syntaqx browser origins
instead.

## How non-browser callers talk to the API

PATs over `Authorization: Bearer pat_…`. Works against either hostname,
but the documented surface is `api.syntaqx.com/v1/*`.

**First pass — classic tokens.** A token is named, optionally
expiring, targets one org (defaults to the user's personal org), and
inherits the *full* permission set the issuing user has in that org.
No per-token scope picker. The token acts as you.

- Token value: `pat_` prefix + random body. The plaintext is shown
  exactly once at creation. The DB stores only a hash + the prefix
  for display (`pat_abcd…`).
- Revocation is immediate (delete the row, the next request 401s).
- An expiring token past its expiry 401s on use; we don't bother
  garbage-collecting expired rows until they get noisy.

**Future — fine-grained scopes.** Once a permission registry exists
(`lib/permissions.ts`), token creation gains a checkbox list of
permissions, and the token's effective set is `userPermissions ∩
tokenPermissions`. The `pat_` wire format and revocation semantics
don't change — only the mint flow and the per-request authz check.
Classic tokens stay valid; they just behave as "all permissions
selected."

## Multi-tenancy: orgs from day one

Vercel-style. Every user, on signup, gets a personal organization
auto-created. Teams are organizations with multiple members. Roles:
`owner`, `admin`, `member`, `billing`.

- Active org is tracked on the session (`session.activeOrganizationId`).
- Permissions are computed per-org: `effectivePermissions(userId,
  orgId)` returns the set granted by the user's role in that org.
- PATs target one org and act with the user's full permission set in
  that org (first pass; per-token scoping is the documented next step).

Doing this from day one is cheap (Better Auth's `organization` plugin
ships the schema and APIs) and makes the later "I want teams" or "I want
Okta SSO" pivot a config change rather than a migration.

## Future: be an OIDC provider

When we want syntaqx accounts to sign into a separate app (`tool.com`,
`app.example.com`, or even our own `app.syntaqx.com`), the answer is
**not** a shared cookie across subdomains. The answer is OAuth/OIDC.

Better Auth's OIDC Provider plugin gives us:

- `/.well-known/openid-configuration`
- `/oauth/authorize` (consent screen — reuses the session cookie to
  skip login if the user is already signed into syntaqx)
- `/oauth/token`
- `/oauth/userinfo`
- An admin UI to register client apps, set redirect URIs, scopes.

The flow:

1. `tool.com` redirects browser to
   `https://syntaqx.com/oauth/authorize?client_id=tool&...`.
2. User lands on syntaqx. If session cookie is valid → skip straight to
   consent. Otherwise → `/login` → consent.
3. Consent → redirect back to `tool.com` with auth code.
4. `tool.com` exchanges code for an access token at `/oauth/token`.
5. `tool.com` uses the access token against `api.syntaqx.com`.

The session cookie **never leaves `syntaqx.com`**. The OIDC client app
gets a scoped, revocable token with its own lifecycle. The two
credentials don't overlap.

## BFF → API split (eventual)

The API is currently the same Next.js process as the BFF, routed by
`Host` in `proxy.ts`. When we extract it (Go service, Rust service,
another Node app — TBD), this is the pattern:

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser
    participant BFF as Next.js BFF<br/>(syntaqx.com)
    participant API as API service<br/>(api.syntaqx.com)
    participant DB as Postgres

    Note over B,API: Cookie path (first-party UI)
    B->>BFF: GET /api/v1/foo<br/>Cookie: __Host-syntaqx.sid
    BFF->>DB: lookup session
    DB-->>BFF: { userId, orgId, ... }
    BFF->>BFF: mint internal JWT<br/>(aud=api, exp=+30s, sub=userId)
    BFF->>API: GET /v1/foo<br/>Authorization: Bearer <internal-jwt>
    API->>API: verify JWT signature + aud + exp
    API-->>BFF: 200 { ... }
    BFF-->>B: 200 { ... }

    Note over B,API: PAT path (CLI / third-party)
    Note left of B: Some script
    B->>API: GET /v1/foo<br/>Authorization: Bearer pat_…
    API->>DB: lookup token hash
    DB-->>API: { userId, orgId, perms }
    API-->>B: 200 { ... }
```

### Why a short-lived JWT here (and only here)

This is the **one** place JWTs are appropriate. The token:

- Is minted by the BFF and consumed by the API service, both ours.
- Lives ≤30 seconds, well below any plausible revocation window.
- Is never seen by the browser.
- Carries `{ iss, aud, sub: userId, org: activeOrgId, scopes, iat, exp,
  jti }` and is signed with a shared secret (HS256) or a key pair
  (RS256/EdDSA) rotated through a JWKS endpoint when we care to.

If we ever need to revoke mid-request, the API service can also look
up the user in the same Postgres to confirm they aren't banned — but
the short TTL means we don't need to in the hot path.

### Why not just forward the session cookie?

The API service shouldn't know about syntaqx's session cookie format
(it's a BFF implementation detail), and shouldn't share the session
table as its primary auth surface (couples deployment). The JWT is the
contract; everything on the BFF side of it can change.

### Shared identity store

Day one of the split, the API service shares the same Postgres for
user/org/PAT lookups. If/when the API service needs its own data store,
identity stays in a service the BFF and API both read (or behind an
introspection endpoint). Don't fork the user table.

## Stack

- **Postgres: Neon.** Serverless-native, HTTP driver for edge, Vercel
  preview branches.
- **ORM: Drizzle.** Type-safe, no codegen daemon, edge-compatible.
- **Auth library: Better Auth.** Sessions-first (DB, not JWT), ships the
  Organization, API Keys, and OIDC Provider plugins that match this
  doc nearly 1:1.
- **Email: Resend.** Verification, password reset, team invitations.
- **Avatars: Vercel Blob.** User-uploaded images are written to public
  Blob storage by `POST /api/v1/me/avatar`. Better Auth's `user.image`
  stores the resulting URL; the upload route is the only thing that
  knows about Blob. Requires `BLOB_READ_WRITE_TOKEN` in the
  environment. Replacing or removing an avatar deletes the previous
  blob if (and only if) it was one we uploaded — external image URLs
  (OAuth provider defaults) are left alone.

### Migrations

Schema lives in [`lib/db/schema.ts`](../../lib/db/schema.ts). It was
initially generated from the Better Auth config via
`@better-auth/cli generate`; subsequent edits are hand-applied (e.g.
adding `additionalFields`, custom tables, indexes) and the generator
isn't re-run against an evolved schema.

The workflow is **diff-and-apply**, not push-on-deploy:

| Script | When |
|---|---|
| `npm run db:generate` | After editing `lib/db/schema.ts`. Writes a new SQL file under `lib/db/migrations/` and updates `meta/_journal.json`. Commit both. |
| `npm run db:migrate` | Locally + in CI/prod. Applies any migrations newer than the last row in `drizzle.__drizzle_migrations`. |
| `npm run db:push` | **Local prototyping only.** Skips the migration history. Never run against a deployed environment. |
| `npm run db:studio` | Drizzle's data browser. |
| `npm run db:baseline` | One-shot. Used once, when the DB already had the tables from an earlier `db:push` and we needed to start tracking from the existing state forward. Idempotent — safe to leave wired up. |

The first migration (`0000_baseline.sql`) captures the entire Better
Auth schema as it existed at that moment. Every change since is a new
file. **Production deploys run `db:migrate` automatically** — the
`build` script in `package.json` chains `db:migrate && next build`, so
every Vercel deploy (preview or prod) applies pending migrations
before the app boots. If a migration fails, the deploy fails. There is
no separate production migration step to remember.

### Sign-in identifier (email vs. username)

Better Auth's core only knows how to sign in by `user.email`. The
`username` plugin adds a separate `signIn.username` endpoint. The
`/login` form picks the right one based on whether the input contains
`@`. Both produce the same session cookie; everything downstream is
identical.

### Account deletion

`POST /api/auth/delete-user` (Better Auth's built-in endpoint, exposed
via `authClient.deleteUser()`). Configured in
[`lib/auth.ts`](../../lib/auth.ts) under `user.deleteUser`. Today's
flow:

1. UI gate (`/settings/account`) requires the user to type their
   handle into a confirmation input. No password re-auth.
2. Active session is the auth gate. The cookie is HttpOnly,
   SameSite=Lax, host-locked — so the realistic non-XSS attack
   surface is "the user clicked the button on their own device."
3. `beforeDelete` hook runs:
   - Deletes the avatar blob if (and only if) the URL points at our
     own Vercel Blob store.
   - Deletes any organization where this user is the sole member.
     Always catches the auto-created personal org; safe for any
     other single-owner org. Multi-member orgs lose this user via
     the `member.userId` cascade and stay intact for the rest.
4. Better Auth deletes the `user` row. Postgres cascades clean up
   `session`, `account`, remaining `member`, and `invitation` rows.
5. Better Auth clears the session cookie in the response. The client
   redirects to `/`.

**Known gap:** no second factor beyond the active session. When email
verification ships (Resend), switch to
`user.deleteUser.sendDeleteAccountVerification` so deletion requires
clicking a one-time link sent to the account email — and add a
password input to the form for an in-page recheck.

### Future: multiple emails per account (GitHub-style)

Today: `user.email` is single-valued, unique, and serves as both the
sign-in identifier (when an `@` is present) and the contact address.

When we want a user to be able to add additional verified emails —
distinct from "the email I sign in with" — the model changes:

1. New `user_email` table: `(id, userId, email, verified, isPrimary,
   createdAt)`. Unique on `email` globally and on `(userId, isPrimary)
   where isPrimary = true`.
2. `user.email` becomes the cached primary, kept in sync via a
   database hook on `user_email` writes. We don't drop `user.email`
   because Better Auth's core sign-in path reads it directly.
3. Sign-in by any verified address: a server hook on `signIn.email`
   that resolves `email -> user.email` via `user_email` before passing
   through. Or: keep sign-in pinned to the primary and make secondary
   emails a contact-only construct.
4. UI: a `/settings/emails` page that lists addresses, lets the user
   add/verify/remove, and pick which is primary.

Why not now: the migration is mechanical but disruptive (data move,
hook ordering, sign-in path fork), and there's nothing to migrate yet.
Doing it on day one of having actual users is cheaper than doing it on
day one of having zero users — `npm run db:generate` will write the
diff cleanly when we get there.

### Alternatives considered

- **Supabase auth:** uses the client-JWT pattern this doc rejects.
  Using Supabase as just Postgres is fine; using its auth is fighting
  the product.
- **Auth.js v5:** defaults to JWT sessions, treats DB sessions as a
  second-class config. Workable but the grain is wrong for us.
- **Lucia:** effectively deprecated.
- **Roll our own OAuth + CSRF + account linking + orgs:** no.

## CORS

Currently `Access-Control-Allow-Origin: *` in `proxy.ts`. This is fine
while no auth state exists. The moment the cookie is real, this changes
to an **allowlist when credentials are involved**:

```
Origin allowlist (credentialed):
  https://syntaqx.com
  https://*-syntaqx.vercel.app   (preview pattern)
  http://localhost:3000          (dev only)
```

Non-credentialed requests (PAT callers) keep working from any origin
because they don't send cookies — they send `Authorization`.

## Permission registry (sketch)

`lib/permissions.ts` will hold the union of all permissions, grouped for
the PAT UI:

```
read:user       write:user
read:org        write:org      admin:org
read:posts      write:posts
admin:tokens
```

A `Role` is a named set of permissions; a `User` has a `Role` per org;
a `PAT` carries an explicit subset.

## Phasing

1. **Done.** Login UI shell + 401 stub.
2. **Done.** Neon + Drizzle + Better Auth core; email + password; orgs
   plugin; personal org auto-created on signup; the header renders a
   session-aware `UserMenu`; `/api/v1/me` is the first protected route.
3. **Next.** GitHub OAuth (creds), Resend (email verification + reset
   delivery), PAT UI (`/settings/tokens`), permission registry,
   unified `getPrincipal()`, CORS lockdown in `proxy.ts`.
4. **Later.** OIDC Provider plugin, SAML/Okta plugin, audit log.
5. **Eventually.** BFF→API service split per the diagram above.

## Decisions log

- **Sessions, not browser-held JWTs.** Revocation, permission freshness,
  cookie-size limits are all unsolved problems with stateless tokens.
- **Host-locked `__Host-` cookie.** Subdomain trust is a forever
  commitment; we'd rather earn it explicitly via OIDC per app.
- **Same-origin `/api/v1/*` from the frontend.** The `api.syntaqx.com`
  hostname is for non-browser callers (PATs) and future OIDC clients.
- **PATs ship as classic tokens, fine-grained later.** First pass: a
  token acts as the issuing user with their full permission set in
  the target org. Per-token scopes land once the permission registry
  exists; the wire format and revocation semantics don't change.
- **Orgs from day one.** Cheaper now than a schema migration later.
- **Short-lived signed JWT only on the BFF→API hop.** Server-to-server,
  ≤30s, never seen by the browser.
- **Better Auth.** Sessions-first + plugins for orgs/PATs/OIDC matches
  this design. Auth.js's JWT default doesn't.
- **Neon, not Supabase.** Avoids fighting Supabase's auth model.
- **Repo-only docs.** This file lives in `docs/`, not `content/docs/`
  or `app/docs/` — it's an engineering artifact, not site content.
