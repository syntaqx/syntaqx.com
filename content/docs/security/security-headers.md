+++
title = "Security Headers & CSP"
description = "The response headers every site should send, a strict Content Security Policy, and how to roll CSP out safely with Report-Only mode before enforcing it."
category = "Security"
order = 707
tags = ["security", "csp", "headers", "browser"]
+++

Your code will eventually have a bug that lets an attacker inject something: a script through an unescaped field, or a compromised third-party library. Security headers decide how much that bug can do. They tell the browser what your site may load, run and share, so the browser refuses the rest even when your code doesn't.

They're cheap: a handful of headers set once at the edge. The one that matters most, Content Security Policy, is the one most sites skip, because it's the only one that can break things.

## The Baseline

Every HTML response carries these:

| Header | Value | What it stops |
| ------ | ----- | ------------- |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Downgrades to plain HTTP |
| `Content-Security-Policy` | See below | Injected scripts, clickjacking, data exfiltration |
| `X-Content-Type-Options` | `nosniff` | A browser deciding an uploaded "image" is JavaScript and running it |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | A reset token or internal ID in your URL leaking to every site a user clicks through to |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Injected code prompting for features you don't use, under your name |
| `Cross-Origin-Opener-Policy` | `same-origin` | Other windows keeping a handle to yours |
| `Cross-Origin-Resource-Policy` | `same-origin` (or `same-site`) | Other sites embedding your resources to probe them |

## HSTS and Preload

`Strict-Transport-Security` tells the browser to use HTTPS for your domain for `max-age` seconds, even if someone types `http://` or follows an old link. Without it, the first request on a coffee-shop network can be intercepted and kept on plain HTTP.

HSTS only protects visits after the browser has seen the header once. The [HSTS preload list](https://hstspreload.org/) closes that gap by shipping your domain inside browsers as HTTPS-only, and requires a `max-age` of at least one year (`31536000`), `includeSubDomains` and `preload`. It's hard to undo: removal takes a browser release cycle, and every subdomain is forced onto HTTPS, so confirm every one, including forgotten internal ones, serves HTTPS before you submit.

## Content Security Policy

CSP is an allowlist of where scripts, styles, frames and connections may come from. If an attacker injects a `<script>`, the browser refuses to run it, so a cross-site scripting bug stops being an account takeover. Escaping output is still the first line; CSP is what holds when escaping is missed once.

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

The question is how the browser tells your scripts from injected ones.

- **Nonces** are a fresh random value per response on each `<script>` tag you render. An attacker can't guess this response's nonce, so injected scripts don't run, and with `'strict-dynamic'` a trusted script can load others without listing every CDN. This is the default for server-rendered pages; the cost is rendering per request, since a cached page would reuse its nonce.
- **Hashes** list the exact contents of allowed inline scripts. They suit static pages whose scripts never change, and survive caching.
- **Host allowlists** (`script-src cdn.example.com`) are weakest: they allow *any* script on that host, including an old vulnerable library or a JSONP endpoint an attacker can turn into script execution. Big shared CDNs make it worse.

`'unsafe-inline'` allows any inline script, which is exactly what an injection produces, so it gives up most of what CSP is for. Listed alongside a nonce and `'strict-dynamic'` as a fallback for old browsers it's harmless, since browsers that understand the nonce ignore it. On its own it's a deliberate departure, and should be recorded as one.

## Rolling Out CSP

A wrong policy breaks your own site: analytics stop loading, the payment widget can't connect, a page goes blank. That's why most sites never ship CSP. The way through is to observe before enforcing:

1. **Report-Only.** Send the policy as `Content-Security-Policy-Report-Only` with a reporting endpoint. Browsers enforce nothing, but report every request the policy would have blocked.
2. **Fix and tune.** Real violations are your own inline scripts and third parties you forgot. Move scripts to nonces, add the origins you need, remove the rest, and filter out browser-extension noise.
3. **Enforce.** Once reports are clean across a release or two, send the same policy as `Content-Security-Policy`. Keep reporting on, so a regression shows up in your error tracker instead of as a support ticket.
4. **Tighten over time.** Every new third-party script is a policy change, reviewed like code, because it is code running with your origin's privileges.

## CORS Is Not a Security Boundary

CORS relaxes the browser's same-origin policy; it doesn't protect your server. `curl`, scripts and other servers ignore it, so every request is still [authorized](/docs/security/authorization) on its own merits. CORS only controls which browser origins can *read* your responses.

Keep `Access-Control-Allow-Origin` to the origins that need it, and never reflect the request's origin together with `Access-Control-Allow-Credentials: true`: that lets any website make authenticated requests as your logged-in users and read the answers.

## This Site

syntaqx.com sends the baseline above, with `Cross-Origin-Resource-Policy: same-site` so `www` and the `api` subdomain can share resources. Its Content Security Policy ran Report-Only first, and before enforcing, every page type was loaded and every interactive tool exercised against it. That found what page loads alone wouldn't: the IP lookup and hover-card demo call third-party APIs only when used, and the favicon tool reads uploads back from `data:` URLs. Those are listed explicitly, and the policy is enforced, still reporting to Sentry. Its `script-src` allows inline scripts, because nonces would mean rendering every page per request; that departure is recorded in [ADR 0004](https://github.com/syntaqx/syntaqx.com/blob/main/docs/adr/0004-csp-allows-inline-scripts.md).

## References

**Specifications**

- [W3C: Content Security Policy Level 3](https://www.w3.org/TR/CSP3/), directives, nonces, `strict-dynamic` and reporting
- [RFC 6797: HTTP Strict Transport Security](https://datatracker.ietf.org/doc/html/rfc6797), HSTS

**Reference**

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP), how CSP works
- [MDN: CSP script-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src), nonces, hashes, `strict-dynamic` and the backward-compatible policy
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
- [OWASP: Secure Headers Project](https://owasp.org/www-project-secure-headers), recommended headers and values
