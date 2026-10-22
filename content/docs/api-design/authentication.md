+++
title = "API Authentication"
description = "How API callers prove who they are: prefixed API keys, restricted keys, OAuth 2.0 bearer tokens, scopes, and the line between a 401 and a 403."
category = "API Design"
order = 1.7
tags = ["api", "authentication", "oauth", "security"]
aliases = ["api-authentication"]
+++

Authentication answers "who is calling?". Authorization answers "are they allowed to do this?". Keep the two separate in code, in status codes, and in error messages.

## Credentials Go in the Authorization Header

Every credential travels in the `Authorization` header as a bearer token, per [RFC 6750](https://www.rfc-editor.org/rfc/rfc6750):

```http
GET /payments
Authorization: Bearer sk_live_4f2a9c...
```

- **Never in the URL.** Query strings end up in logs, browser history and `Referer` headers. RFC 6750 says bearer tokens "SHOULD NOT be passed in page URLs".
- **Never in a cookie** for a server-to-server API. Cookies are for browsers, and they bring CSRF with them.
- **HTTPS only.** A request with a credential over plain HTTP is rejected, and the key should be treated as leaked.

## API Keys

For server-to-server integrations, a long-lived API key is the simplest thing that works. Keys follow the same shape as [Stripe's](https://docs.stripe.com/keys):

| Prefix | Type | Safe to expose |
| ------ | ---- | -------------- |
| `pk_live_`, `pk_test_` | Publishable: identifies the account, can only create tokens | Yes |
| `rk_live_`, `rk_test_` | Restricted: only the permissions it was granted | No |
| `sk_live_`, `sk_test_` | Secret: full access | No |

- **The prefix says what it is.** Type and environment are readable at a glance, and secret scanners (like [GitHub's](https://github.blog/engineering/platform-security/behind-githubs-new-authentication-token-formats/), whose tokens use `ghp_`, `gho_` and friends) can find leaked keys by pattern.
- **Test and live never mix.** A test key can't touch live data, and the other way around.
- **Restricted keys by default.** Stripe recommends restricted keys for new integrations, and so do I. A secret key is the exception you justify, not the default.
- **Shown once.** Only a hash is stored. See [Sensitive Data](/docs/payments/sensitive-data).

## OAuth 2.0

When a third party acts on behalf of someone else's account, use [OAuth 2.0](https://www.rfc-editor.org/rfc/rfc6749) instead of asking for their API key.

| Situation | Grant |
| --------- | ----- |
| A user authorizes an app to act for them | Authorization code with [PKCE](https://www.rfc-editor.org/rfc/rfc7636) |
| A service calls another service as itself | Client credentials |
| Devices without a browser | [Device authorization](https://www.rfc-editor.org/rfc/rfc8628) |

The implicit grant and the password grant are out. Access tokens are short-lived (minutes to an hour), and refresh tokens are rotated on every use.

## Scopes

Every credential carries the smallest set of permissions it needs.

- Scopes are `resource:action`: `payments:read`, `payments:write`, `refunds:write`.
- `write` doesn't imply `read`. Grant both if both are needed.
- A token's scopes are visible to its owner, and every request is checked against them.

## 401 vs 403

| Situation | Status | Header |
| --------- | ------ | ------ |
| No credential | `401` | `WWW-Authenticate: Bearer realm="api"` |
| Credential malformed, expired or revoked | `401` | `WWW-Authenticate: Bearer error="invalid_token"` |
| Valid credential, missing scope | `403` | `WWW-Authenticate: Bearer error="insufficient_scope", scope="refunds:write"` |
| Valid credential, resource belongs to someone else | `404` | None |

The last row matters. Returning `403` for another account's resource confirms that it exists. Pretend it doesn't. The body uses the standard [error format](/docs/requests/error-responses) and never says which part of a credential was wrong.

```json
{
  "message": "This API key does not have the refunds:write permission."
}
```

## Rotation

Every credential can be replaced without downtime.

- **Overlap.** When a key is rotated, the old one keeps working for a grace period. Stripe gives up to **7 days**, and that's what I use.
- **Watch usage, then expire.** Expire the old key once its traffic has been at zero for a while, not on a timer alone.
- **Rotate on departure.** When someone with access leaves or changes roles, the keys they could see get rotated.
- **Last used, everywhere.** Every key shows when and from where it was last used, so unused keys can be found and deleted.

## References

**Specifications**

- [RFC 6750: OAuth 2.0 Bearer Token Usage](https://datatracker.ietf.org/doc/html/rfc6750), the `Authorization: Bearer` header and `WWW-Authenticate` errors
- [RFC 6749: The OAuth 2.0 Authorization Framework](https://datatracker.ietf.org/doc/html/rfc6749), grants and tokens
- [RFC 7636: PKCE](https://datatracker.ietf.org/doc/html/rfc7636), protecting the authorization code grant
- [RFC 8628: OAuth 2.0 Device Authorization Grant](https://datatracker.ietf.org/doc/html/rfc8628), sign-in for devices without a browser
- [RFC 9700: OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/rfc9700), why the implicit and password grants are out

**Reference**

- [MDN: HTTP authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication), the challenge and response framework
- [MDN: WWW-Authenticate](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/WWW-Authenticate), the header sent with every `401`

**In practice**

- [Stripe: API keys](https://docs.stripe.com/keys), key prefixes, restricted keys and rotation
- [GitHub: Behind GitHub's new authentication token formats](https://github.blog/engineering/platform-security/behind-githubs-new-authentication-token-formats/), prefixed tokens that secret scanners can find
- [GitHub REST API: Troubleshooting](https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api), returning `404` instead of `403` so private resources aren't confirmed
