+++
title = "Security Headers & CSP"
description = "The response headers every site should send, a strict Content Security Policy, and how to roll CSP out safely with Report-Only mode before enforcing it."
category = "Security"
order = 9.2
tags = ["security", "csp", "headers", "browser"]
+++

Security headers tell the browser what your site is allowed to do, so a bug in your code or a compromised script can't do more. They're cheap, they're mostly set-and-forget, and the one that matters most, Content Security Policy, is also the one most sites skip.

## The Baseline

Every HTML response carries these:

| Header | Value | What it stops |
| ------ | ----- | ------------- |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Downgrades to plain HTTP |
| `Content-Security-Policy` | See below | Injected scripts, clickjacking, data exfiltration |
| `X-Content-Type-Options` | `nosniff` | Browsers guessing a file is a script |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Full URLs (with tokens or IDs) leaking to other sites |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Features you don't use being abused |
| `Cross-Origin-Opener-Policy` | `same-origin` | Other windows getting a handle to yours |
| `Cross-Origin-Resource-Policy` | `same-origin` (or `same-site`) | Other sites embedding your resources |

## HSTS and Preload

`Strict-Transport-Security` makes the browser use HTTPS for your domain for `max-age` seconds, even if someone types `http://`. The first visit is still exposed, so submit the domain to the [HSTS preload list](https://hstspreload.org/), which ships in browsers. Preload requires a `max-age` of at least one year (`31536000`), `includeSubDomains`, and `preload`.

Preloading is hard to undo. Make sure every subdomain serves HTTPS first.

## Content Security Policy

CSP is an allowlist of where scripts, styles, frames and connections may come from. If an attacker injects a `<script>`, the browser refuses to run it.

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'nonce-r4nd0m' 'strict-dynamic';
  object-src 'none';
  base-uri 'none';
  frame-ancestors 'none';
  form-action 'self';
  upgrade-insecure-requests
```

| Directive | Why |
| --------- | --- |
| `default-src 'self'` | Fallback for everything not listed: same origin only |
| `script-src 'nonce-…' 'strict-dynamic'` | Only scripts carrying this response's random nonce run, plus scripts they load |
| `object-src 'none'` | No plugins, an old script-execution path |
| `base-uri 'none'` | An injected `<base>` tag can't redirect relative script URLs |
| `frame-ancestors 'none'` | Nobody can frame the page (clickjacking). Replaces `X-Frame-Options` |
| `form-action 'self'` | Injected forms can't post data elsewhere |
| `upgrade-insecure-requests` | Stray `http://` subresources load over HTTPS |

### Nonces vs Hashes vs Allowlists

- **Nonces** (a fresh random value per response, on each `<script>` tag) are the default for server-rendered pages. Combined with `'strict-dynamic'`, scripts you trust can load others without listing every CDN.
- **Hashes** suit static pages where inline scripts never change.
- **Host allowlists** (`script-src cdn.example.com`) are the weakest: any script on that host, including an old vulnerable library or a JSONP endpoint, is allowed. Prefer nonces.

Never use `'unsafe-inline'` for scripts. It turns CSP back off.

## Rolling Out CSP

Enforcing a policy you haven't tested breaks your own site. Roll it out in stages:

1. **Report-Only.** Send the policy as `Content-Security-Policy-Report-Only` with a reporting endpoint. Browsers enforce nothing, but report every violation.
2. **Fix and tune.** Real violations are your own inline scripts and third parties you forgot. Move them to nonces or remove them. Ignore noise from browser extensions.
3. **Enforce.** Once reports are clean for a release or two, send the same policy as `Content-Security-Policy`. Keep reporting on, so regressions show up.
4. **Tighten.** Every new third-party script is a policy change, reviewed like code.

## CORS Is Not a Security Boundary

CORS relaxes the browser's same-origin policy; it doesn't protect your server. `curl` ignores it entirely. Authorization is still checked on every request. CORS only decides which browser origins can read the responses, so keep `Access-Control-Allow-Origin` to the origins that need it, and never reflect any origin together with `Access-Control-Allow-Credentials: true`.

## This Site

syntaqx.com sends the baseline above, with `Cross-Origin-Resource-Policy: same-site` so `www` and the `api` subdomain can share resources. Its Content Security Policy is in Report-Only mode, reporting violations to Sentry through `report-uri` and the Reporting API, and switches to enforcing once the reports are clean. Its `script-src` still allows inline scripts, because nonces would mean rendering every page per request; that departure from the policy above is recorded in [ADR 0004](https://github.com/syntaqx/syntaqx.com/blob/main/docs/adr/0004-csp-allows-inline-scripts.md).

## References

**Specifications**

- [W3C: Content Security Policy Level 3](https://www.w3.org/TR/CSP3/), directives, nonces, `strict-dynamic` and reporting
- [RFC 6797: HTTP Strict Transport Security](https://datatracker.ietf.org/doc/html/rfc6797), HSTS

**Reference**

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP), how CSP works
- [MDN: Content-Security-Policy-Report-Only](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy-Report-Only), testing a policy without enforcing it
- [MDN: Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security), header syntax
- [MDN: X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Content-Type-Options), disabling MIME sniffing
- [MDN: Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy), controlling the `Referer` header
- [MDN: Permissions-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy), disabling browser features
- [MDN: Cross-Origin-Opener-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy), isolating browsing contexts
- [MDN: Cross-Origin-Resource-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Resource-Policy), blocking cross-origin embedding
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS), what CORS does and doesn't do
- [HSTS Preload List](https://hstspreload.org/), submission requirements
- [Sentry: Security Policy Reporting](https://docs.sentry.io/product/security-policy-reporting/), collecting CSP reports

**In practice**

- [web.dev: Mitigate XSS with a strict CSP](https://web.dev/articles/strict-csp), the nonce and `strict-dynamic` approach
- [OWASP: Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html), directive guidance
- [OWASP: Secure Headers Project](https://owasp.org/www-project-secure-headers/), recommended headers and values
