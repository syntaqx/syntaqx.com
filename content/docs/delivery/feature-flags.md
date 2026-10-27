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

The cost is real. Every flag is a branch in production that tests may not cover, and old flags are the most dangerous kind. In 2012, Knight Capital deployed new trading code that [repurposed a flag](https://www.sec.gov/litigation/admin/2013/34-70694.pdf) once used by functionality retired years earlier. One server never got the new code, the flag woke the old code up there, and in about 45 minutes the firm lost over $460 million. The dead code should have been deleted with its flag. Everything below is about getting the benefit without that risk.

## Flag Types

A flag hiding a half-built feature and a flag that sheds load during an incident have different owners, lifetimes and failure modes, so every flag gets a type when it's created, using [Pete Hodgson's categories](https://martinfowler.com/articles/feature-toggles.html):

| Type | Purpose | Lifetime | Who flips it |
| ---- | ------- | -------- | ------------ |
| Release | Hide unfinished or unreleased work | Days to weeks | Engineering |
| Experiment | A/B tests | Until the result is in | Product |
| Ops | Kill switches, load shedding, failover | Long-lived, by design | On-call |
| Permission | Plans, betas, per-customer access | Long-lived | Product, sales |

Release flags must die: they exist to get one change safely to 100%, and every week past that is a code path nobody exercises. Ops and permission flags are meant to stay, so they're product configuration, documented and tested like it.

## OpenFeature

A codebase that calls a flag vendor's SDK in two hundred places can't leave without touching all two hundred. So evaluation goes through [OpenFeature](https://openfeature.dev/), the CNCF's vendor-neutral API, with the vendor plugged in behind it as a provider. The cost is a thin abstraction and occasionally waiting on a vendor-specific feature, cheap next to a migration.

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

Tests prove the code does what you expected; only production proves your expectations were right. A progressive rollout limits how many people find out the hard way:

1. **Internal:** employees and test accounts.
2. **[Canary](https://sre.google/workbook/canarying-releases/):** 1% of traffic, or a few low-risk customers, watched against the [SLOs](/docs/operations/slos).
3. **Ramp:** 5%, 25%, 50%, 100%, with a pause at each step long enough to see real traffic.
4. **Done:** the flag is removed and the old path deleted.

- **Bucket by a stable key** (`targetingKey`: the account or merchant ID), so each customer gets a consistent experience instead of flipping on every request.
- **Define the abort criteria before you start.** "Authorization rate drops more than 1 point" or "p99 latency up 20%", not "if it looks bad". Half way through, everyone wants it to succeed, and a vague criterion bends to that.
- **Ramp during working hours,** when the people who can fix it are awake.

## Kill Switches

Every risky integration has an ops flag that turns it off and falls back to something safe: disable a new processor route, stop a background backfill, shed non-critical work. Kill switches:

- Are listed in the service's [runbooks](/docs/operations/on-call), with what flipping them does.
- Take effect in seconds, without a deploy.
- Are tested regularly. A kill switch that's never been flipped is a hypothesis.

## Remote Config

Remote config is the same mechanism carrying values instead of booleans: timeouts, polling intervals, limits, prices, copy, a drop rate, the order of a menu. Unity describes its service as a way "to tune your game design without deploying new versions of your application"; Firebase Remote Config does the same for apps. It's the fastest way to change production behavior, which makes it a deploy that skips most of a deploy's safety, so it needs the discipline back:

- **Typed and validated before publish.** Every key has a schema: a type, bounds and allowed values (a rate between 0 and 1, a timeout above zero, a known enum). Firebase lets you declare a parameter's type so its console validates values against it; your own service should reject a change that fails its schema in the API, not just the UI. A typo in a JSON value can take a system down as surely as a bad build.
- **Versioned, with rollback as a new version.** Every published change is a version with an author, a timestamp and a reason. Firebase keeps up to 300 versions per template and records who published each; rolling back from version 10 to version 6 creates version 11, so history only moves forward. Services report the config version they're running in their telemetry, so "what was live at 14:02?" has an answer.
- **Targeting with a defined precedence.** Values vary by platform, app version, region, tenant or percentage, with the same stable bucketing as a flag. When several conditions match, exactly one must win; Firebase uses the condition with the highest priority. Ambiguous precedence turns every incident into an argument about which value a client actually got.
- **Defaults in the code, the last good value in a cache.** The client ships with built-in defaults and caches the last config it fetched and validated, so an outage of the config service degrades to yesterday's values, never to a blank screen or a blocked launch. Firebase's guidance is to "set in-app default parameter values so that your app always behaves as expected" ([Mobile Releases](/docs/delivery/mobile-releases#flags-and-remote-config-are-your-rollback)).
- **Applied at a defined moment.** Fetch and activate are separate steps. Activate at startup or a natural boundary (the next session, the next job, the start of a match), not mid-interaction; Firebase's own loading strategies include fetching now and activating on next load for exactly that reason. A value that changes halfway through a request or a user's checkout is the half-old, half-new behavior flags avoid by evaluating once.
- **Reviewed like code for risky keys.** Changes to anything that moves money, safety or capacity need an approver, and a staged rollout to a percentage first, watched against the same abort criteria as a feature.

Remote config is not a place for legal or dated business rules with sources and effective dates; those are [rules as data](/docs/architecture/rules-as-data). And it isn't a secret store: anything a client can fetch, a user can read ([Environments & Configuration](/docs/operations/environments#configuration)).

## Cleanup

Removing a flag is never urgent until the day it is, so cleanup can't rely on anyone remembering:

- **Every release flag has an owner and an expiry date** when it's created.
- **Expired flags fail a check.** CI or a weekly report lists flags past their date, and the owner removes them.
- **Removal is part of the feature.** The ticket isn't done until the flag and the dead branch of code are gone. Never repurpose an old flag for something new: retire it and create a fresh one.
- **Changes are audited.** Who flipped what, when, and why, because a flag flip is a production change. See [Environments & Configuration](/docs/operations/environments).

## References

**Specifications**

- [OpenFeature Specification](https://openfeature.dev/specification/), the vendor-neutral evaluation API

**Reference**

- [Firebase: Remote Config templates and versioning](https://firebase.google.com/docs/remote-config/templates), 300 stored versions, who published each, and rollback as a new version
- [Firebase: Remote Config parameters and conditions](https://firebase.google.com/docs/remote-config/parameters), condition priority, in-app defaults and typed values validated in the console
- [Firebase: Remote Config loading strategies](https://firebase.google.com/docs/remote-config/loading), in-app defaults, activating on next load and avoiding mid-session UI changes
- [Unity: What is Remote Config](https://docs.unity.com/ugs/en-us/manual/remote-config/manual/WhatsRemoteConfig), tuning without new versions, key-value settings and overrides that target players

**In practice**

- [SEC: Knight Capital Americas LLC order (2013)](https://www.sec.gov/litigation/admin/2013/34-70694.pdf), the repurposed flag and the $460 million loss
- [Pete Hodgson: Feature Toggles](https://martinfowler.com/articles/feature-toggles.html), flag categories and lifetimes
- [Google SRE Workbook: Canarying Releases](https://sre.google/workbook/canarying-releases/), canary rollouts watched against SLOs
