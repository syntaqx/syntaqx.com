+++
title = "Environments & Configuration"
nav_title = "Environments & Config"
description = "One build everywhere: what each environment is for, config validated at boot, secrets in a manager and never the repo, rotation built in, and who deploys where."
category = "Operations"
order = 1201
tags = ["operations", "environments", "devops", "configuration", "secrets"]
aliases = ["operations/configuration", "configuration"]
+++

The same build runs everywhere. What differs between environments is configuration, and how you handle both decides whether a green preview means anything and whether a deploy is boring or a guessing game. Every environment exists to answer one question with less risk than production; one that doesn't answer a question nothing else can is just cost, drifting and breaking on its own schedule until nobody trusts it.

## The Environments

| Environment | Answers | Lifetime |
| --- | --- | --- |
| Local | "Does my change work?" | Per developer |
| Preview | "Does this pull request work, deployed, for anyone with the link?" | Per pull request |
| Staging | "Does this work against things preview can't reach?" Only when that's a real question | Long-lived |
| Production | Everything else | Forever |

- **Local runs with one command.** Dependencies that need infrastructure fall back to in-process behavior (a no-op adapter, an in-memory store, a fake mailer), and a `compose.yml` runs the real databases and caches, the same images CI uses, when you need real behavior. No shared dev database: shared state makes one person's experiment everyone's broken afternoon.
- **Every pull request deploys to its own preview URL.** Reviewers click instead of imagining, and end-to-end checks run against a deployment, not a laptop. Previews are what make [continuous deployment](/docs/delivery/ci-pipelines) safe.
- **Staging is the most over-built environment in software.** A long-lived copy of production drifts immediately: different data, traffic, config and deploy schedule. Add one only for a question preview can't answer, such as a partner sandbox that allows one fixed callback URL. Otherwise previews plus [feature flags](/docs/delivery/feature-flags) in production cover it.

An environment is also the wrong tool for "this feature isn't ready". A feature that only works in staging has never been tested in production; ship it dark behind a flag instead.

## Parity

Every difference between environments is a place a bug passes in one and fails in the next, and the ones that bite are the ones nobody remembers exist. [Twelve-Factor](https://12factor.net/dev-prod-parity) names three gaps to close: time, people and tools.

- **Same artifact.** The build that passed CI runs everywhere; environments differ in configuration, never code ([Containers & Immutable Infrastructure](/docs/delivery/containers)).
- **Same backing services.** Postgres locally if Postgres in production, same major versions, same images.
- **Same config shape, different values,** validated the same way, so a misconfigured preview fails the way production would.
- **Small time gap.** A change reaches production minutes after it merges.

Test data is synthetic, never copied: production data in a lower environment is a breach waiting for a reason. One versioned seed command generates realistic data with deterministic IDs ([Identifier Conventions](/docs/fundamentals/identifier-conventions)), and payments and email use sandboxes: test cards, test keys, outbound mail captured.

## Configuration

Config is anything that changes between deploys of the same code: connection strings, credentials, per-environment timeouts and pool sizes. It lives in the environment, strictly separate from code, the rule [Twelve-Factor](https://12factor.net/config) made famous. The test: could you open-source the repository right now without leaking a credential? Routes, retry formulas and business rules are the same everywhere, so they're code; behavior you want to change at runtime without a deploy is a [feature flag](/docs/delivery/feature-flags).

Read the environment once, at startup, into a typed object, and fail fast:

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
- **Defaults only for safe values.** A default timeout is fine; a default database URL is an incident waiting for a typo.
- **Units in the name:** `PROCESSOR_TIMEOUT_MS`, never `PROCESSOR_TIMEOUT`.
- **Every variable listed** in a committed `.env.example` with a comment and no real values: the first thing a new engineer reads, and the checklist for a new environment.

Config changes are deploys: reviewed, recorded, reversible. "I just tweaked a variable in the console" shows up in more [postmortems](/docs/operations/incident-response) than any bug, because it skipped everything that catches mistakes in code.

## Secrets

A leaked secret is an incident even if nothing has happened yet, because you have to assume someone has it.

- **Never in the repository:** not in code, `.env` files, CI YAML or history. Push protection and [secret scanning](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning) run on every repository.
- **In a secrets manager** (a KMS-backed store, Vault, or the platform's encrypted variables), injected at runtime, scoped per service and environment, and redacted whenever the config is printed. Prefixes make leaks recognizable ([Sensitive Data](/docs/payments/sensitive-data)).
- **Rotation designed in.** Systems accept old and new during an overlap window (up to 7 days for API keys per [API Authentication](/docs/api-design/authentication), 24 hours for [webhook secrets](/docs/payments/webhooks)). Rotate on a schedule so the procedure is practiced, and immediately on suspicion: rotate, then investigate.
- **Short-lived credentials beat rotation.** Workload identity (OIDC from CI, cloud IAM roles) means there's no long-lived key to rotate at all.

## Who Deploys Where

Anyone with a pull request gets a preview, automatically. Production deploys come from the pipeline, on merge to `main` after CI is green, and from nowhere else. Production credentials live in the platform's secret store, scoped to production, and the pipeline is the only thing that uses them. Break-glass access exists, is logged, and is reviewed afterward.

## This Site

`npm run dev` needs nothing else: every variable is optional and documented in `.env.example`, and without Redis the API's rate limiter uses a no-op store that sends its headers but never blocks. `docker compose up -d` runs the real Redis behind the same REST API Upstash serves in production, and CI runs those same containers. Every pull request gets a Vercel preview, `main` deploys to production, production values live in Vercel's encrypted environment variables, and there's no staging, because nothing here needs one.

## References

**Reference**

- [The Twelve-Factor App: Dev/prod parity](https://12factor.net/dev-prod-parity), keeping environments alike
- [The Twelve-Factor App: Config](https://12factor.net/config), config in the environment, separate from code
- [Vercel: Preview deployments](https://vercel.com/docs/deployments/environments#preview-environment-pre-production), a deployment for every pull request
- [GitHub Actions: Managing environments](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment), environment-scoped secrets and deployment protection rules
- [GitHub: About secret scanning](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning), push protection and scanning

**In practice**

- [OWASP: Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html), storage, access and rotation
- [Stripe: API keys](https://docs.stripe.com/keys), key rotation with a 7-day grace period
- [Martin Fowler: Feature Toggles](https://martinfowler.com/bliki/FeatureToggle.html), unfinished work in production instead of a separate environment
