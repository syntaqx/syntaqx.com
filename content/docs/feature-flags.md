+++
title = "Feature Flags & Progressive Rollout"
description = "Separating deploy from release: flag types and lifetimes, OpenFeature for vendor-neutral evaluation, percentage and canary rollouts, kill switches, and cleanup."
category = "Engineering Practice"
order = 12.3
tags = ["process", "feature-flags", "deployment", "reliability"]
+++

Deploying code and releasing a feature are different events. Feature flags separate them: code ships dark, turns on for a few users, then everyone, and turns off in seconds if something goes wrong. Without discipline, though, flags become the most dangerous form of technical debt.

## Flag Types

Following [Pete Hodgson's categories](https://martinfowler.com/articles/feature-toggles.html), every flag has a type, and the type sets its lifetime:

| Type | Purpose | Lifetime | Who flips it |
| ---- | ------- | -------- | ------------ |
| Release | Hide unfinished or unreleased work | Days to weeks | Engineering |
| Experiment | A/B tests | Until the result is in | Product |
| Ops | Kill switches, load shedding, failover | Long-lived, by design | On-call |
| Permission | Plans, betas, per-customer access | Long-lived | Product, sales |

Most flags are release flags, and release flags must die. Ops and permission flags are product configuration and are documented like it.

## OpenFeature

Flag evaluation goes through [OpenFeature](https://openfeature.dev/), the CNCF vendor-neutral API, rather than a vendor SDK directly:

```ts
const client = OpenFeature.getClient();

const useNewRouting = await client.getBooleanValue("processor-routing-v2", false, {
  targetingKey: merchantId,
  country: "DE",
});
```

- **The provider is swappable.** A hosted service, a config file, or an in-memory provider in tests, behind the same calls.
- **Always pass a safe default.** If the flag service is unreachable, the code takes the default, so the default is the old, known-good behavior.
- **Evaluate once per request,** and pass the result down. A flag that flips mid-request produces half-old, half-new behavior.

## Progressive Rollout

New behavior earns its traffic:

1. **Internal:** employees and test accounts.
2. **[Canary](https://sre.google/workbook/canarying-releases/):** 1% of traffic, or a few low-risk customers, watched against the [SLOs](/docs/slos).
3. **Ramp:** 5%, 25%, 50%, 100%, with a pause at each step long enough to see real traffic.
4. **Done:** the flag is removed and the old path deleted.

- **Bucket by a stable key** (`targetingKey`: the account or merchant ID), so each customer gets a consistent experience instead of flipping on every request.
- **Define the abort criteria before you start.** "Authorization rate drops more than 1 point" or "p99 latency up 20%", not "if it looks bad".
- **Ramp during working hours,** when the people who can fix it are awake.

## Kill Switches

Every risky integration has an ops flag that turns it off and falls back to something safe: disable a new processor route, stop a background backfill, shed non-critical work. Kill switches:

- Are listed in the service's [runbooks](/docs/on-call), with what flipping them does.
- Take effect in seconds, without a deploy.
- Are tested regularly. A kill switch that's never been flipped is a hypothesis.

## Cleanup

- **Every release flag has an owner and an expiry date** when it's created.
- **Expired flags fail a check.** CI or a weekly report lists flags past their date, and the owner removes them.
- **Removal is part of the feature.** The ticket isn't done until the flag and the dead branch of code are gone.
- **Changes are audited.** Who flipped what, when, and why, because a flag flip is a production change. See [Configuration & Secrets](/docs/configuration).

## References

**Specifications**

- [OpenFeature Specification](https://openfeature.dev/specification/), the vendor-neutral evaluation API

**In practice**

- [Pete Hodgson: Feature Toggles](https://martinfowler.com/articles/feature-toggles.html), flag categories and lifetimes
- [Google SRE Workbook: Canarying Releases](https://sre.google/workbook/canarying-releases/), canary rollouts watched against SLOs
