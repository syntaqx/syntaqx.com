+++
title = "Environments"
description = "Local, preview, staging and production: what each one is for, keeping them alike, test data that's never a production copy, and who may deploy where."
category = "Operations"
order = 5.96
tags = ["operations", "environments", "devops", "configuration"]
+++

Every environment exists to answer one question with less risk than production. If an environment doesn't answer a question nothing else can, it's cost: it drifts, it breaks on its own schedule, and people stop trusting what it tells them.

## The Environments

| Environment | Answers | Lifetime |
| --- | --- | --- |
| Local | "Does my change work?" | Per developer |
| Preview | "Does this pull request work, deployed, for anyone who opens the link?" | Per pull request |
| Staging | "Does this work against things preview can't reach?" Only when that's a real question | Long-lived |
| Production | Everything else | Forever |

### Local

- **One command to run.** `npm install && npm run dev`, nothing else required. Dependencies that need infrastructure fall back to in-process behavior: a no-op adapter, an in-memory store, a fake mailer.
- **The real thing on demand.** A `compose.yml` runs the actual databases and caches, the same images CI uses, for when you need to see real behavior.
- **No shared dev database.** Shared state means one person's experiment is everyone's broken afternoon.

### Preview

Every pull request deploys to its own URL before it merges. Reviewers click instead of imagining, product and design review the real thing, and end-to-end checks run against a deployment, not a laptop. It's the environment that makes [continuous deployment](/docs/delivery/continuous-deployment) safe.

### Staging

Staging is the most over-built environment in software. A long-lived copy of production drifts from it immediately: different data, different traffic, different config, deployed on a different schedule. Add one only when it answers a question preview can't, such as an integration with a partner sandbox that only allows a fixed callback URL, or a load test that needs production-sized data. Otherwise, previews plus [feature flags](/docs/engineering/feature-flags) in production cover it.

### Production

The only environment users see, and the only one whose data matters. Changes reach it through the pipeline, never by hand.

## Parity

[Dev/prod parity](https://12factor.net/dev-prod-parity) is what makes a green preview mean something:

- **Same artifact.** The build that passed CI is the build that runs everywhere. Environments differ in configuration, never in code. See [Containers & Immutable Infrastructure](/docs/delivery/containers).
- **Same backing services.** Postgres locally if Postgres in production, not SQLite "because it's easier". The same major versions, from the same images.
- **Same config shape, different values.** Every environment reads the same variables, validated at boot the same way. See [Configuration & Secrets](/docs/operations/configuration).
- **Small time gap.** A change reaches production minutes after it merges, so what you tested is what's running.

## Test Data

- **Synthetic, never copied.** Production data in a lower environment is a breach waiting for a reason. Seed scripts and factories generate realistic data instead, with deterministic IDs (see [Identifier Conventions](/docs/fundamentals/identifier-conventions)).
- **Seeded the same way everywhere.** One seed command for local, preview and staging, versioned with the code.
- **Payments and email use sandboxes.** Test card numbers, test API keys, and outbound email captured, never sent.

## Flags, Not Environments

An environment is the wrong tool for "this feature isn't ready". A feature that only works in staging is a feature nobody has tested in production. Ship it dark behind a flag, enable it for internal users, then a percentage, then everyone. See [Feature Flags & Progressive Rollout](/docs/engineering/feature-flags).

## Who Can Deploy Where

| Environment | Who deploys | How |
| --- | --- | --- |
| Local | You | Your machine |
| Preview | Anyone with a pull request | Automatically, on push |
| Staging | The pipeline | On merge, or on demand from the pipeline |
| Production | The pipeline | On merge to `main`, after CI is green |

Nobody deploys to production from a laptop. Production credentials live in the platform's secret store, scoped to the production environment, and the pipeline is the only thing that uses them. Break-glass access exists, is logged, and is reviewed afterward.

## This Site

`npm run dev` needs nothing else: without Redis, the API's rate limiter uses a no-op store that sends its headers but never blocks. `docker compose up -d` runs the real Redis behind the same REST API Upstash serves in production, and CI runs those same containers. Every pull request gets a Vercel preview deployment, and `main` deploys to production. There's no staging, because nothing here needs one.

## References

**Reference**

- [The Twelve-Factor App: Dev/prod parity](https://12factor.net/dev-prod-parity), keeping environments alike
- [The Twelve-Factor App: Config](https://12factor.net/config), config in the environment, separate from code
- [Vercel: Environments](https://vercel.com/docs/deployments/environments), local, preview and production on one platform
- [Vercel: Preview deployments](https://vercel.com/docs/deployments/preview-deployments), a deployment for every pull request
- [GitHub Actions: Managing environments](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment), environment-scoped secrets and deployment protection rules

**In practice**

- [Martin Fowler: Feature Toggles](https://martinfowler.com/bliki/FeatureToggle.html), unfinished work in production instead of a separate environment
