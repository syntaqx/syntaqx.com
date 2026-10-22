# 0013. Content-Security-Policy, report-only first

Status: Accepted (2026-10-22)

## Context

The site sent HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy`, but no Content-Security-Policy, the header that limits what a successful injection can do. The playbook's [Security Headers & CSP](https://www.syntaqx.com/docs/security/security-headers) says to roll one out in report-only mode first, because a policy that's wrong blocks real features, and the only way to know it's right is to watch it against real traffic.

The site loads inline scripts (Next.js bootstrapping, the theme setup, JSON-LD), Vercel Analytics and Speed Insights, Sentry, the API subdomain from the reference console, and Vercel's toolbar on previews.

## Decision

- Send `Content-Security-Policy-Report-Only` from `next.config.ts` with a policy that allows exactly what the site loads today, and `'none'` or `'self'` for everything else (`object-src`, `base-uri`, `frame-ancestors`, `form-action`).
- Report violations to Sentry's security endpoint, through both `report-uri` and the Reporting API (`Reporting-Endpoints` and `report-to`).
- `lib/csp.test.ts` pins the directives that must never loosen.

## Consequences

- Nothing can break: the browser reports violations and blocks nothing.
- Once reports are quiet, the next step is a new ADR switching to the enforcing `Content-Security-Policy` header.
- `script-src` still allows `'unsafe-inline'`, so this policy doesn't stop injected inline scripts. Replacing it with per-request nonces and `'strict-dynamic'` is the step after enforcement, and it costs static rendering for every page that needs a nonce.
- CSP reports count against Sentry's event quota. A policy that matches the site keeps them rare, and Sentry's inbound filters drop browser-extension noise.
