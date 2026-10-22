+++
title = "API Authentication"
description = "How API callers prove who they are: prefixed, hashed API keys, restricted by default, OAuth 2.0 for delegated access, scopes, and 401 vs 403 vs 404."
category = "API Design"
order = 1.7
tags = ["api", "authentication", "oauth", "security"]
aliases = ["api-authentication"]
+++

Authentication answers "who is calling?". Authorization answers "are they allowed to do this?". They fail differently, so keep them separate in code, in status codes and in error messages. Most API breaches aren't broken cryptography; they're a valid credential reaching data it shouldn't, which is an authorization bug ([API Security](/docs/security/api-security)).

## Credentials Go in the Authorization Header

```http
GET /payments
Authorization: Bearer sk_live_4f2a9c...
```

- **Never in the URL.** Query strings are written to access logs, proxy logs, browser history and `Referer` headers on every outbound link. A key in a URL is a key in a dozen places you don't control. [RFC 6750](https://datatracker.ietf.org/doc/html/rfc6750) says bearer tokens "SHOULD NOT be passed in page URLs".
- **Not in a cookie,** for a server-to-server API. Browsers attach cookies automatically, which is what makes CSRF possible; an API called by servers gains nothing from that and inherits the risk.
- **HTTPS only.** A credential sent over plain HTTP should be rejected and treated as leaked, because it was.

## API Keys

For one server talking to another as itself, a long-lived API key is the simplest thing that works. The details are where keys go wrong.

### Prefixes Say What a Key Is

| Prefix | Type | Safe to expose |
| ------ | ---- | -------------- |
| `pk_live_`, `pk_test_` | Publishable: identifies the account, can only create tokens | Yes |
| `rk_live_`, `rk_test_` | Restricted: only the permissions it was granted | No |
| `sk_live_`, `sk_test_` | Secret: full access | No |

A prefix costs a few characters and pays off three ways. A person who finds a key in a log knows at a glance whether it's live and how bad the leak is. Secret scanners (GitHub's, and your own pre-commit hooks) find leaked keys by pattern, so a distinctive prefix gets yours revoked within minutes of a public push. And a test key can be refused by live infrastructure before any lookup. Stripe's keys and GitHub's tokens (`ghp_`, `gho_`) use the same idea for the same reasons.

### Restricted by Default

A secret key with full access is the worst case of every leak. So new integrations get **restricted keys** with only the permissions they need, and a full-access key is the exception someone has to justify. The integration that only creates refunds can't read your customer list when its key shows up in a pastebin.

### Store a Hash, Show the Key Once

The API never needs to read a key back, only to recognize it. So store a hash and show the plaintext exactly once, at creation.

- **Plain SHA-256 is right here,** unlike for passwords. Slow hashes like bcrypt exist because passwords are guessable; a randomly generated 32-byte key isn't, so a fast hash is just as safe and doesn't add latency to every request.
- **Look up by prefix, compare in constant time.** Store a short non-secret identifier with the hash so lookups are indexed, then compare hashes with a constant-time function so response timing doesn't leak how much of a guess was right.
- **Show the last four characters** in dashboards, so people can tell keys apart without ever seeing one again.

## OAuth 2.0 for Delegated Access

When a third-party app acts on someone else's account, don't ask the account owner for their API key. A pasted key is all-or-nothing, never expires, and can't be revoked for one app without breaking every other. [OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749) issues each app its own scoped, revocable token:

| Situation | Grant |
| --------- | ----- |
| A user authorizes an app to act for them | Authorization code with [PKCE](https://datatracker.ietf.org/doc/html/rfc7636) |
| A service calls another service as itself | Client credentials |
| A device without a browser (a CLI, a TV) | [Device authorization](https://datatracker.ietf.org/doc/html/rfc8628) |

The implicit and password grants are out: the first leaks tokens through redirects, the second trains users to type their password into third-party apps. The [OAuth security BCP](https://datatracker.ietf.org/doc/html/rfc9700) retires both. Access tokens live minutes to an hour, and refresh tokens rotate on every use, so a stolen refresh token stops working the moment the legitimate client uses it.

## Scopes

Every credential carries the smallest set of permissions it needs.

- Scopes are `resource:action`: `payments:read`, `payments:write`, `refunds:write`. Readable in a consent screen and in a log.
- `write` doesn't imply `read`. A webhook relay that only creates objects shouldn't be able to list them.
- Every request is checked against the credential's scopes, and the owner can see which scopes each credential has.

## 401, 403 or 404

| Situation | Status | Header |
| --------- | ------ | ------ |
| No credential | `401` | `WWW-Authenticate: Bearer realm="api"` |
| Credential malformed, expired or revoked | `401` | `WWW-Authenticate: Bearer error="invalid_token"` |
| Valid credential, missing scope | `403` | `WWW-Authenticate: Bearer error="insufficient_scope", scope="refunds:write"` |
| Valid credential, resource belongs to someone else | `404` | None |

`401` means "I don't know who you are" and tells the client how to authenticate (`WWW-Authenticate` is required on every `401`). `403` means "I know who you are, and you can't do this", and the scope hint tells the developer exactly what to request.

The last row is the one that matters most. Returning `403` for another account's resource confirms the resource exists, and an attacker iterating IDs learns which ones are real. So a resource you can't see is a resource that doesn't exist: `404`, the same response as for an ID that was never issued. GitHub does this for private repositories.

Error bodies use the standard [error format](/docs/requests/error-responses), say which permission is missing, and never say which part of a credential was wrong:

```json
{ "message": "This API key does not have the refunds:write permission." }
```

## Rotation

Every credential can be replaced without downtime, because one day it will have to be, in a hurry.

- **Overlap.** A rotated key keeps working for a grace period so deployments can pick up the new one. I use up to 7 days: long enough for a weekly deploy cycle, short enough that a leaked key doesn't linger. Stripe's rolling keys allow the same window.
- **Expire on evidence.** Retire the old key once its traffic has been at zero for a while, not when a timer says so.
- **Rotate on departure.** When someone with access leaves or changes roles, the keys they could see get rotated.
- **Show last use.** Every key shows when and from where it was last used, so forgotten keys can be found and deleted before they leak.

## This Site

The syntaqx API is a set of public, stateless tools with no accounts, so it has no authentication at all, a deliberate departure recorded in [ADR 0001](https://github.com/syntaqx/syntaqx.com/blob/main/docs/adr/0001-no-authentication-or-user-identity.md). Abuse is handled by per-IP [rate limiting](/docs/operations/rate-limiting) instead.

## References

**Specifications**

- [RFC 6750: OAuth 2.0 Bearer Token Usage](https://datatracker.ietf.org/doc/html/rfc6750), the `Authorization: Bearer` header and `WWW-Authenticate` errors
- [RFC 6749: The OAuth 2.0 Authorization Framework](https://datatracker.ietf.org/doc/html/rfc6749), grants and tokens
- [RFC 7636: PKCE](https://datatracker.ietf.org/doc/html/rfc7636), protecting the authorization code grant
- [RFC 8628: OAuth 2.0 Device Authorization Grant](https://datatracker.ietf.org/doc/html/rfc8628), sign-in for devices without a browser
- [RFC 9700: OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/rfc9700), why the implicit and password grants are out
- [RFC 9110: HTTP Semantics, 401](https://datatracker.ietf.org/doc/html/rfc9110#name-401-unauthorized), `WWW-Authenticate` on every `401`

**Reference**

- [MDN: HTTP authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication), the challenge and response framework
- [MDN: WWW-Authenticate](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/WWW-Authenticate), the header sent with every `401`

**In practice**

- [Stripe: API keys](https://docs.stripe.com/keys), key prefixes, restricted keys and rolling keys
- [GitHub: Behind GitHub's new authentication token formats](https://github.blog/engineering/platform-security/behind-githubs-new-authentication-token-formats/), prefixed tokens that secret scanners can find
- [GitHub REST API: Troubleshooting](https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api), returning `404` instead of `403` so private resources aren't confirmed
