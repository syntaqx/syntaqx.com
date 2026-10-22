# 0004. Content-Security-Policy allows inline scripts, for now

Status: Accepted (2026-10-22)

## Context

[Security Headers & CSP](https://www.syntaqx.com/docs/security/security-headers) recommends `script-src 'nonce-…' 'strict-dynamic'`: only scripts carrying the response's random nonce run, so an injected `<script>` doesn't. It also says to roll a new policy out in report-only mode before enforcing it.

This site renders most pages statically. Next.js bootstraps with inline scripts, and the site adds its own (theme setup, JSON-LD). A nonce has to be unique per response, which means rendering every page per request and giving up static rendering and CDN caching.

## Decision

Enforce the policy with `script-src 'self' 'unsafe-inline'`, reporting violations to Sentry. It ran report-only first; before enforcing, every page type and the interactive tools were exercised against it, which found four origins and `data:` the tools genuinely need (`connect-src`), now listed. Every other directive follows the playbook: `default-src 'self'`, `object-src 'none'`, `base-uri 'none'`, `frame-ancestors 'none'`, `form-action 'self'`. `lib/csp.test.ts` keeps those from loosening.

## Consequences

- The policy blocks anything outside its list, and its reports show what tried.
- It doesn't stop injected inline scripts. The site renders no user input, which keeps that risk low, but it's the gap between this policy and the playbook's.
- Next step: move to nonces if the site ever renders untrusted content.
