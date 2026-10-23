+++
title = "Authentication & Sessions"
nav_title = "Authentication"
description = "How people sign in and stay signed in: passwords per NIST, passkeys, MFA, recovery, server sessions over browser JWTs, and stopping credential stuffing."
category = "Security"
order = 702
tags = ["security", "authentication", "sessions", "passkeys", "mfa", "jwt"]
+++

[API Authentication](/docs/api-design/authentication) covers machines: keys and tokens a program sends with every call. People are harder. They pick weak passwords, reuse them across sites, lose phones, fall for convincing login pages, and stay signed in on laptops they leave in taxis. Authentication for people is two problems: proving who someone is once, and then remembering it safely for every request after. Most account takeovers aren't a broken algorithm; they're a reused password, a phished code, a recovery flow that asks for a pet's name, or a session nobody could revoke. [Authorization](/docs/security/authorization) only means something once this part holds.

## Buy Before You Build

I don't write a login system from scratch for a product whose business is something else. A managed identity provider (Auth0, Okta, Cognito, Clerk, WorkOS, or a mature open-source server like Keycloak) has already built passkeys, MFA, breached-password checks, bot defenses, enterprise SSO and the hundred edge cases in between, and it gets audited for them. Signing in through it over OpenID Connect is covered in [SSO & Identity Federation](/docs/security/sso-and-federation).

Buying moves the work; it doesn't remove it. You still own the session your application creates after the provider says yes, what counts as a sensitive action, the recovery policy, the audit trail, and what happens when the provider is down. The rest of this chapter applies either way: it's what to configure if you buy, and what to build if you can't.

## Passwords, If You Must

NIST's current guidance, [SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html) (final in July 2025), overturns most of the password rules people still enforce:

- **Length, not composition.** At least 15 characters when the password is the only factor, at least 8 when it's one of two. Accept at least 64, and allow spaces and any printable character. No rules demanding a digit and a symbol: they produce `Password1!`, not strength.
- **No forced rotation.** Don't make people change passwords on a schedule; require a change only on evidence of compromise. Scheduled rotation trains people into predictable increments.
- **Screen against a blocklist.** Check every new password against known-breached and common values. [Have I Been Pwned's Pwned Passwords](https://haveibeenpwned.com/API/v3#PwnedPasswords) does it without the password leaving your system: you send the first five characters of its SHA-1 hash and compare the returned suffixes locally.
- **No hints, no security questions.** NIST forbids both. A hint helps the attacker as much as the user, and "mother's maiden name" is public record.
- **Limit failed attempts.** No more than 100 consecutive failures per account before the authenticator is disabled, and in practice far fewer, with throttling (below) doing most of the work.

**Store them so a database leak isn't a password leak.** Use a slow, memory-hard hash with a unique salt per password. [OWASP's current minimums](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html): Argon2id with 19 MiB of memory, 2 iterations and 1 degree of parallelism; scrypt where Argon2id isn't available; bcrypt only for legacy systems, with a cost of at least 10 and a hard limit of 72 bytes of input; PBKDF2 with 600,000 iterations of HMAC-SHA-256 where FIPS validation is required. A pepper, a secret mixed into every hash and kept outside the database in a vault or HSM ([HSMs & Key Management](/docs/industries/payments/key-management)), means a stolen database alone can't be cracked. Store the algorithm and parameters with each hash, and rehash on the next successful login when they change. Never anything reversible: if you can email someone their password, you're storing it wrong.

## Passkeys First

Passwords can be phished because the user types a secret into whatever page asks for it. Passkeys can't, and that's why I make them the default for new sign-ins. A passkey is a [WebAuthn](https://www.w3.org/TR/webauthn-3/) credential: a key pair whose private half never leaves the authenticator, created for one relying party. The browser and authenticator only use it on origins belonging to that relying party's ID (your registrable domain), so a pixel-perfect copy of your login page on another domain gets nothing. The server stores a public key, so a database leak exposes nothing reusable either.

- **Synced or device-bound.** [Synced passkeys](https://fidoalliance.org/passkeys/) are backed up across a user's devices by their platform (iCloud Keychain, Google Password Manager, a password manager), which solves "I lost my phone" for most people. Device-bound passkeys never leave one authenticator, such as a hardware security key, which suits administrators and regulated access. Revision 4 of NIST's guidance makes room for synced passkeys.
- **The ceremony.** Registration: the server sends a random challenge and the user's ID, the authenticator creates a key pair after a local check (fingerprint, face, PIN), and the server stores the public key and credential ID. Sign-in: the server sends a fresh challenge, the authenticator signs it, the server verifies the signature and that the origin and relying party ID match. The challenge is single-use; reusing one is replay.
- **Attestation is usually unnecessary.** Attestation proves which make and model of authenticator created the key. Consumer apps rarely need it, and requesting it adds privacy prompts and failure modes; ask for it only when policy requires specific hardware.
- **Plan for both.** Offer passkeys at sign-up and after a password sign-in, and keep a fallback for devices that can't use them, without letting the fallback become the weak door.

## Multi-Factor Authentication

Where people still use passwords, a second factor stops most takeovers, but factors aren't equal. [CISA](https://www.cisa.gov/sites/default/files/publications/fact-sheet-implementing-phishing-resistant-mfa-508c.pdf) ranks them:

| Factor | Phished? | Notes |
| ------ | -------- | ----- |
| Passkey or security key (FIDO/WebAuthn) | No | The gold standard; required for administrators |
| Authenticator app code (TOTP) | Yes, by a relay page | Good baseline; codes are short-lived |
| Push with number matching | Yes, but resists push bombing | Plain approve/deny push is weaker: users approve prompts to stop them |
| SMS or voice code | Yes, plus SIM swap and SS7 | Last resort; NIST calls telephone delivery "restricted" |

Enrolling or removing a factor is itself a sensitive action: it needs a fresh, strong sign-in and a notification to the account's existing channels.

## Recovery Is the Real Login

An account is only as strong as its weakest way in, and that's usually "forgot password." Attackers skip the passkey and go straight for recovery.

- **Recovery codes at enrollment.** Single-use codes shown once when MFA is set up, stored hashed like passwords.
- **No knowledge questions,** for the same reasons as hints.
- **Email links that are single-use, short-lived and bound to the request,** and that sign the user in to a limited state where the next step is setting a new credential, not browsing the account.
- **Notify every existing channel** when a password, email, phone or factor changes, with a way to say "this wasn't me."
- **Slow down risky recovery.** When recovery removes the last strong factor, hold the change for a waiting period with notifications, so the real owner can stop it. Support staff who can reset accounts are a recovery path too, and social engineers know it: give them the same verification steps, and log every reset.

## Sessions: The Default

After sign-in, the application has to recognize the same person on every request. For a first-party web application, the default I reach for is a server-side session:

- **An opaque, random ID** with at least 64 bits of entropy from a cryptographically secure generator ([OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)), mapped to a row in a session store with who signed in, how (password, passkey, SSO), when, and from what device.
- **In a cookie set like this:** `Set-Cookie: __Host-session=…; Secure; HttpOnly; SameSite=Lax; Path=/`. `HttpOnly` keeps it away from JavaScript, so a cross-site scripting bug can't read it. `Secure` keeps it off plain HTTP. The [`__Host-` prefix](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies) makes the browser refuse it unless it's `Secure`, has `Path=/` and no `Domain`, so a subdomain can't set or overwrite it. Set `SameSite` explicitly rather than trusting browser defaults; `Strict` where users never arrive by cross-site links.
- **A new ID at every privilege change.** Issue a fresh session ID at sign-in, at step-up, and when roles change, and invalidate the old one. Keeping the pre-login ID is session fixation.
- **Two timeouts, enforced on the server.** An idle timeout and an absolute one. OWASP suggests idle timeouts of 2 to 5 minutes for high-value applications and 15 to 30 for low-risk ones, and an absolute limit of 4 to 8 hours for an all-day tool; NIST's AAL2 asks for reauthentication at least every 24 hours and after no more than an hour of inactivity. Pick numbers per product and write them down.
- **Logout deletes the session on the server.** Clearing the cookie alone doesn't help if someone already copied it. Give users a list of their active sessions with device and location, and a button to end each one, and end all of them on a password change.

## Why Not JWTs as the Session

The common alternative is a signed JWT in the browser: the server verifies the signature and reads the claims, with no lookup. It's attractive for being stateless, and it's the wrong default for a browser session, for concrete reasons.

- **You can't take it back.** A JWT is valid until it expires, whatever happens in between: the user logs out, changes a password after a phishing scare, has a laptop stolen, or is fired. With a 24-hour token, that's up to 24 hours of access nobody can cut off.
- **The workarounds rebuild the session.** Short expiry plus a refresh token moves revocation to the refresh step, which needs server state. A denylist of revoked token IDs is a lookup on every request, which is the session store again, now with extra steps. Either can be right, but neither is stateless anymore.
- **Claims go stale.** A token minted when someone was an admin still says admin after you remove the role, until it expires. Sessions read current roles from the store; tokens freeze them.
- **Where do you keep it?** In `localStorage`, any script on the page can read and exfiltrate it, so one XSS bug becomes account takeover. In an `HttpOnly` cookie it's safe from scripts, but now it's a cookie with all of a cookie's CSRF concerns, and you've given up the main reason to use a token.
- **Size.** It travels on every request and grows with every claim. Browsers cap a cookie at about 4 KB, and teams hit that once claims accumulate.
- **Validation is easy to get wrong.** [RFC 8725](https://datatracker.ietf.org/doc/html/rfc8725) exists because libraries accepted `alg: none`, and because an attacker could switch `RS256` to `HS256` and get the RSA public key used as an HMAC secret. Pin one algorithm per key, check issuer and audience, and use explicit types. Every service that verifies tokens has to get all of it right.
- **No view of who's signed in.** Without a store there's no list of active sessions to show the user or a security team, and no "sign out everywhere."

Sessions have honest costs too: a store lookup on every request (fast in Redis, but a dependency), shared storage so any instance can serve any request, and awkwardness when many services and domains each need to know who the user is. Those costs are what the patterns below address.

## Combining Them

The patterns teams actually run keep the revocable session where the user is and use tokens where they're good.

![A server-side session at the edge with short-lived tokens inside: the browser holds only an opaque HttpOnly cookie; a backend-for-frontend or gateway holds the session store and mints a signed JWT lasting minutes for each internal call; orders, payments and accounts services verify the signature with no lookup; logging out or revoking deletes the session, so no further tokens are minted.](/diagrams/session-hybrid.svg "Revoke in one place, verify everywhere else. The browser never holds a token; the session at the edge can be ended at once, and the tokens inside expire in minutes.")

- **Session at the edge, short-lived tokens inside.** The browser holds an opaque `HttpOnly` cookie. A gateway, or a backend-for-frontend (BFF) that's part of the web app, holds the session and mints a signed access token lasting a few minutes for calls to internal services, which verify it without a lookup. Logout deletes the session, so no new tokens are minted, and outstanding ones die within minutes. [RFC 10017, OAuth 2.0 for Browser-Based Applications](https://www.rfc-editor.org/rfc/rfc10017), now strongly recommends this BFF architecture for business and sensitive applications, precisely because tokens never reach the browser. It fits most products with more than one backend service.
- **The refresh token is the session.** A short-lived access token plus a long-lived refresh token, with the refresh token stored server-side or in an `HttpOnly` cookie scoped to the refresh endpoint's path. Revocation happens at refresh. [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700) requires refresh tokens for public clients to be sender-constrained or rotated: every refresh issues a new one, and if an old one is ever presented again, the server knows one copy was stolen and revokes the active token. It fits mobile apps and API clients, where there's no browser cookie to lean on.
- **Check for revocation without a full lookup.** [Token introspection (RFC 7662)](https://datatracker.ietf.org/doc/html/rfc7662) lets a service ask the authorization server whether a token is still active; cache the answer briefly, knowing that a cached "yes" can outlive a revocation. A cheaper variant puts a session version in the token and compares it to a per-user counter in a fast cache: bump the counter on logout or password change, and every older token fails on its next use. It fits when minutes of exposure after revocation is too long.
- **Keep JWTs for what they do well:** access tokens between services and for APIs, in the interoperable [RFC 9068](https://datatracker.ietf.org/doc/html/rfc9068) profile; one-time links like email verification; and ID tokens in federation. Not the browser's session.

## CSRF

A cookie-based session brings cross-site request forgery: another site makes the browser send a request, and the cookie goes along. `SameSite=Lax` or `Strict` blocks most of it, since the cookie isn't sent on cross-site requests except top-level navigations. For state-changing requests, also verify the `Origin` header or require a CSRF token, and never change state on `GET`. [Security Headers & CSP](/docs/security/security-headers) covers the rest of the browser's defenses.

## Credential Stuffing and Enumeration

Most password attacks aren't guesses; they're username and password pairs leaked from other sites, tried at scale.

- **Throttle per account and per source.** Count failures against the account, not just the IP, or an attacker spreads attempts across thousands of addresses; and limit by IP, network and device to slow broad sweeps ([Rate Limiting](/docs/requests/rate-limiting)). Hard lockouts let anyone lock a victim out, so prefer escalating delays and step-up challenges, and keep password reset available.
- **Breached-password checks** at sign-in as well as at creation, forcing a reset when a match turns up.
- **MFA,** which [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) calls by far the best defense against password attacks. Bot detection and CAPTCHAs add friction for attackers, as defense in depth, not prevention.
- **Don't confirm which accounts exist.** One message for every failure ("Invalid email or password"), one for every reset request ("If that address has an account, we've sent a link"), the same status codes, and the same timing: hash the submitted password even when the user doesn't exist, so a fast response doesn't give it away.

## Step-Up for Sensitive Actions

A session that's hours old shouldn't be enough to change the account's email, add a payout bank account, create an API key or delete data. Require a fresh, strong authentication for those, and record which method was used and when. In OAuth terms, [RFC 9470](https://datatracker.ietf.org/doc/html/rfc9470) standardizes it: the resource answers `insufficient_user_authentication` with the required `acr_values` and `max_age`, and the client sends the user back through sign-in to meet them. Payments has a regulated version of the same idea in [Strong Customer Authentication](/docs/industries/payments/strong-customer-authentication).

## Audit Every Auth Event

Sign-ins, failures, factor changes, recoveries, new devices, session revocations and step-ups each become a structured event with the user, method, device, IP, outcome and request ID ([Observability](/docs/operations/observability)). They answer "was this account taken over, and when?", feed detection for impossible travel and stuffing waves, and give users a security page that shows what happened on their account.

## This Site

syntaqx.com has no user accounts at all, so none of this runs here: no passwords to store, no sessions to steal and no recovery flow to attack. That's a deliberate departure, recorded in [ADR 0001](https://github.com/syntaqx/syntaqx.com/blob/main/docs/adr/0001-no-authentication-or-user-identity.md), and the cheapest authentication system is the one you don't need.

## References

**Specifications**

- [NIST SP 800-63B-4: Authentication and Authenticator Management](https://pages.nist.gov/800-63-4/sp800-63b.html), password length and blocklists, no composition rules or periodic changes, no hints or KBA, the 100-attempt limit, restricted telephone delivery, and AAL2 reauthentication
- [W3C: Web Authentication Level 3](https://www.w3.org/TR/webauthn-3/), passkey ceremonies and credentials scoped to the relying party
- [RFC 10017: OAuth 2.0 for Browser-Based Applications](https://www.rfc-editor.org/rfc/rfc10017), the backend-for-frontend pattern and its cookie requirements
- [RFC 9700: OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/rfc9700), refresh token rotation and reuse detection
- [RFC 8725: JSON Web Token Best Current Practices](https://datatracker.ietf.org/doc/html/rfc8725), `alg: none`, algorithm confusion, issuer and audience checks, explicit typing
- [RFC 7662: OAuth 2.0 Token Introspection](https://datatracker.ietf.org/doc/html/rfc7662), asking whether a token is still active, and the cost of caching the answer
- [RFC 9068: JWT Profile for OAuth 2.0 Access Tokens](https://datatracker.ietf.org/doc/html/rfc9068), where JWTs belong
- [RFC 9470: OAuth 2.0 Step Up Authentication Challenge Protocol](https://datatracker.ietf.org/doc/html/rfc9470), `insufficient_user_authentication`, `acr_values` and `max_age`

**Reference**

- [OWASP: Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), Argon2id, scrypt, bcrypt and PBKDF2 parameters, and peppers
- [OWASP: Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), session ID entropy, renewal on privilege change, idle and absolute timeouts
- [OWASP: Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), generic errors, consistent timing, throttling versus lockout
- [MDN: Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies), `HttpOnly`, `Secure`, `SameSite`, the `__Host-` prefix and per-cookie size limits
- [CISA: Implementing Phishing-Resistant MFA](https://www.cisa.gov/sites/default/files/publications/fact-sheet-implementing-phishing-resistant-mfa-508c.pdf), MFA forms ranked strongest to weakest
- [FIDO Alliance: Passkeys](https://fidoalliance.org/passkeys/), synced and device-bound passkeys

**In practice**

- [Have I Been Pwned: Pwned Passwords API](https://haveibeenpwned.com/API/v3#PwnedPasswords), breached-password screening with k-anonymity
