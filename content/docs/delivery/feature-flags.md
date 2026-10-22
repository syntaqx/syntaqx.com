+++
title = "Feature Flags & Progressive Rollout"
nav_title = "Feature Flags"
description = "Separating deploy from release: flag types and lifetimes, OpenFeature for vendor-neutral evaluation, percentage and canary rollouts, kill switches, and cleanup."
category = "Delivery"
order = 1102
tags = ["process", "feature-flags", "deployment", "reliability"]
aliases = ["feature-flags", "engineering/feature-flags"]
+++

Deploying code and releasing a feature are different events. Feature flags separate them: code ships dark, turns on for a few users, then everyone, and turns off in seconds if something goes wrong. That separation is what makes [continuous deployment](/docs/delivery/ci-pipelines) safe, because unfinished work can merge and deploy every day without anyone seeing it.

The cost is real, though. Every flag is a branch in production that tests may not cover, and old flags are the most dangerous kind. In 2012, Knight Capital deployed new trading code that [repurposed a flag](https://www.sec.gov/litigation/admin/2013/34-70694.pdf) once used by functionality retired years earlier. One server never got the new code, the flag woke the old code up there, and in about 45 minutes the firm lost over $460 million. The dead code should have been deleted with its flag. Everything below is about getting the benefit without that risk.

## Flag Types

Flags aren't one thing. A flag hiding a half-built feature and a flag that sheds load during an incident have different owners, different lifetimes and different failure modes, so every flag gets a type when it's created, using [Pete Hodgson's categories](https://martinfowler.com/articles/feature-toggles.html):

| Type | Purpose | Lifetime | Who flips it |
| ---- | ------- | -------- | ------------ |
| Release | Hide unfinished or unreleased work | Days to weeks | Engineering |
| Experiment | A/B tests | Until the result is in | Product |
| Ops | Kill switches, load shedding, failover | Long-lived, by design | On-call |
| Permission | Plans, betas, per-customer access | Long-lived | Product, sales |

Most flags are release flags, and release flags must die: they exist to get one change safely to 100%, and every week they live past that is a code path nobody exercises. Ops and permission flags are the opposite. They're meant to stay, so they're product configuration, documented and tested like it.

## OpenFeature

Flag vendors come and go, and a codebase that calls a vendor's SDK in two hundred places can't leave without touching all two hundred. Flag evaluation goes through [OpenFeature](https://openfeature.dev/), the CNCF's vendor-neutral API, and the vendor plugs in behind it as a provider. The tradeoff is a thin layer of abstraction and occasionally waiting for a provider to support a vendor-specific feature, which is cheap next to a migration.

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

Tests prove the code does what you expected. Only production proves your expectations were right. A progressive rollout limits how many people find out the hard way, so new behavior earns its traffic:

1. **Internal:** employees and test accounts.
2. **[Canary](https://sre.google/workbook/canarying-releases/):** 1% of traffic, or a few low-risk customers, watched against the [SLOs](/docs/operations/slos).
3. **Ramp:** 5%, 25%, 50%, 100%, with a pause at each step long enough to see real traffic.
4. **Done:** the flag is removed and the old path deleted.

- **Bucket by a stable key** (`targetingKey`: the account or merchant ID), so each customer gets a consistent experience instead of flipping on every request.
- **Define the abort criteria before you start.** "Authorization rate drops more than 1 point" or "p99 latency up 20%", not "if it looks bad". Once a rollout is half done, everyone involved wants it to succeed, and a vague criterion bends to that.
- **Ramp during working hours,** when the people who can fix it are awake.

## Kill Switches

Every risky integration has an ops flag that turns it off and falls back to something safe: disable a new processor route, stop a background backfill, shed non-critical work. Kill switches:

- Are listed in the service's [runbooks](/docs/operations/on-call), with what flipping them does.
- Take effect in seconds, without a deploy.
- Are tested regularly. A kill switch that's never been flipped is a hypothesis.

## Cleanup

Cleanup is where flag programs fail, because removing a flag is never urgent until the day it is. So it can't rely on anyone remembering:

- **Every release flag has an owner and an expiry date** when it's created.
- **Expired flags fail a check.** CI or a weekly report lists flags past their date, and the owner removes them.
- **Removal is part of the feature.** The ticket isn't done until the flag and the dead branch of code are gone. Never repurpose an old flag for something new: retire it and create a fresh one.
- **Changes are audited.** Who flipped what, when, and why, because a flag flip is a production change. See [Configuration & Secrets](/docs/operations/environments).

## References

**Specifications**

- [OpenFeature Specification](https://openfeature.dev/specification/), the vendor-neutral evaluation API

**In practice**

- [SEC: Knight Capital Americas LLC order (2013)](https://www.sec.gov/litigation/admin/2013/34-70694.pdf), the repurposed flag and the $460 million loss
- [Pete Hodgson: Feature Toggles](https://martinfowler.com/articles/feature-toggles.html), flag categories and lifetimes
- [Google SRE Workbook: Canarying Releases](https://sre.google/workbook/canarying-releases/), canary rollouts watched against SLOs
