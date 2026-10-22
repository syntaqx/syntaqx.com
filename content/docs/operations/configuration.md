+++
title = "Configuration & Secrets"
description = "Config in the environment, validated and typed at boot, secrets kept in a manager and never in the repo, and rotation designed in from day one."
category = "Operations"
order = 5.95
tags = ["operations", "configuration", "secrets", "security"]
aliases = ["configuration"]
+++

The same build runs everywhere. What changes between environments is configuration, and how you handle it decides whether a deploy is boring or a guessing game.

Config lives in the environment, strictly separate from code. The test is simple: could you open-source the repository right now without leaking a credential? If the code has a production hostname or an API key in it, the answer is no, and the same build can't run in two places without a code change. Keeping config in environment variables, the rule [The Twelve-Factor App](https://12factor.net/config) made famous, is what lets one artifact be promoted from preview to production unchanged.

## What Counts as Config

Config is anything that changes between deploys of the same code:

- Connection strings, hostnames and ports for backing services
- Credentials and API keys
- Per-environment values: timeouts, pool sizes, log levels

It is **not** config if it's the same in every environment. Routes, retry formulas and business rules are code. Behavior you want to change at runtime without a deploy belongs in a [feature flag](/docs/engineering/feature-flags), not an environment variable.

## Typed and Validated at Boot

Read the environment once, at startup, into a typed object. Fail fast if anything is missing or malformed.

```ts
import { z } from "zod";

const Config = z.object({
  DATABASE_URL: z.string().url(),
  PROCESSOR_TIMEOUT_MS: z.coerce.number().int().positive().default(80_000),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export const config = Config.parse(process.env);
```

- **Crash on boot, not on first use.** A missing variable should stop a deploy at the health check, not fail a customer's request an hour later.
- **No `process.env` outside the config module.** One place to read, one place to document.
- **Defaults only for safe values.** A default timeout is fine. A default database URL is a production incident waiting for a typo.
- **Units in the name.** `PROCESSOR_TIMEOUT_MS`, never `PROCESSOR_TIMEOUT`.

## Across Environments

- **Same variables everywhere, different values.** Every environment reads the same set of variables, validated the same way, so a misconfigured preview fails the same way production would. Which environments to have at all is covered in [Environments](/docs/operations/environments).
- **Lower environments never hold production data,** so their config never points at production systems. Synthetic data only, per [Sensitive Data](/docs/payments/sensitive-data).
- **Every variable is listed** in a committed `.env.example` with a comment, and no real values. It's the documentation a new engineer reads first, and the checklist for a new environment.

## Secrets

Secrets are config with a higher bar, because a leaked secret is an incident even if nothing has happened yet: you have to assume someone has it.

- **Never in the repository.** Not in code, not in `.env` files, not in CI YAML, not in history. Push protection and [secret scanning](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning) run on every repository.
- **Stored in a secrets manager** (cloud KMS-backed stores, Vault, or the platform's encrypted environment variables), and injected at runtime.
- **Scoped per service and environment.** A staging key can't touch production, and one service's credentials can't be used by another.
- **Prefixed so leaks are recognizable,** per [Sensitive Data](/docs/payments/sensitive-data).
- **Never logged.** The config module redacts secret fields when it prints the config at boot.

## Rotation

Every secret will need rotating eventually, usually at the worst moment. Design for it up front:

1. **Two valid at once.** Systems accept the old and new secret during an overlap window (up to 7 days for API keys per [API Authentication](/docs/api-design/authentication), 24 hours for webhook secrets per [Webhooks](/docs/payments/webhooks)).
2. **Rotate on a schedule,** so the procedure is practiced, not discovered during a leak.
3. **Rotate immediately on suspicion.** A secret pasted in a ticket, a laptop lost, an engineer leaving with access: rotate, then investigate.
4. **Prefer short-lived credentials.** Workload identity (OIDC from CI, cloud IAM roles) beats long-lived keys that need rotating at all.

## Changing Config

Config changes are deploys. They go through review, they're recorded, and they can be rolled back. "I just tweaked an environment variable in the console" shows up in more [postmortems](/docs/engineering/postmortems) than any bug, precisely because it skipped everything that catches mistakes in code.

## This Site

Every variable syntaqx.com reads is optional and documented in a committed `.env.example`: the Redis connection for rate limiting (either Upstash's own names or the `KV_REST_API_*` names the Vercel integration sets), a store override, and the rate-limit ceiling. Missing values degrade instead of failing: with no Redis configured, the limiter uses a no-op store. Production values live in Vercel's encrypted environment variables, never in the repository.

## References

**In practice**

- [The Twelve-Factor App: Config](https://12factor.net/config), config in the environment
- [OWASP: Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html), storage, access and rotation
- [GitHub: About secret scanning](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning), push protection and scanning
- [Stripe: API keys](https://docs.stripe.com/keys), key rotation with a 7-day grace period
