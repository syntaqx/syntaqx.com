+++
title = "Deployment Strategies"
description = "Recreate, rolling, blue-green, canary and dark launches: how each one rolls back, what it costs, and why the database is usually the real constraint."
category = "Delivery"
order = 11.15
tags = ["deployment", "delivery", "rollback", "canary"]
+++

Every deployment strategy is an answer to one question: when the new version is wrong, how much damage does it do before you notice, and how fast can you undo it? The strategies differ in how much traffic sees the new version, how long both versions run side by side, and what you pay in capacity for that safety.

Pick by the cost of a bad release, not by what's fashionable. An internal tool can redeploy in place; a payment API needs to put a new version in front of a few percent of traffic and watch it before trusting it.

## The Strategies

### Recreate

Stop the old version, start the new one. [Kubernetes](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) calls this `Recreate`: every old instance is terminated before any new one is created.

- **Rollback:** recreate again with the old version, with the same downtime.
- **Costs:** downtime on every deploy. No extra capacity, and old and new never run at once.
- **Use it when** the two versions genuinely can't coexist and a short outage is acceptable, like a batch worker between runs. For anything user-facing, it's the strategy you grow out of.

### Rolling

Replace instances a few at a time. Kubernetes' default `RollingUpdate` keeps at most 25% of instances unavailable and creates at most 25% extra during the rollout (`maxUnavailable` and `maxSurge`), so capacity stays close to normal throughout.

- **Rollback:** roll forward to the old version, which takes as long as the rollout did.
- **Costs:** little extra capacity, but old and new versions **serve traffic at the same time** for the whole rollout. Every request might hit either one, so they must be compatible with each other and with the same database.
- **Blind spot:** a rolling deploy has no built-in judgment. If the new version is bad, it keeps rolling until every instance is bad, unless something stops it.

### Blue-Green

Run two full environments. Blue serves production; deploy the new version to green, test it there with production configuration, then switch traffic to green in one step. [Martin Fowler's description](https://martinfowler.com/bliki/BlueGreenDeployment.html) is the classic one.

- **Rollback:** switch traffic back to blue, which is still running. This is the fastest rollback of any strategy: no rebuild, no redeploy, just a routing change.
- **Costs:** double capacity while both are up, and the switch is all-or-nothing. The new version gets 100% of traffic the moment it gets any.
- **The catch:** both environments share data. Blue-green makes the code instantly reversible; it does nothing for a database migration that green already ran.

### Canary

Send a small slice of traffic to the new version, compare it to the old, and expand only if it behaves: 1%, then 10%, then 50%, then everyone. [Fowler's canary release](https://martinfowler.com/bliki/CanaryRelease.html) is named for the bird that warned miners before the gas reached them.

- **Rollback:** route the slice back to the old version. A bad release only ever hurt the canary's share of traffic.
- **Costs:** routing that can split traffic by percentage, monitoring that can tell the two populations apart, and time: a careful canary takes longer than a rollout.
- **Why it's the default for high-stakes services:** it's the only strategy that limits blast radius *and* gives you a comparison. You're not asking "are errors up?" in general; you're asking "are errors higher on the new version than on the old one right now?", which cancels out everything else that changed at the same time.

### Shadow and Dark Launches

Run the new code path on real traffic without users seeing its results. [Dark launching](https://martinfowler.com/bliki/DarkLaunching.html) calls new back-end behavior for existing users without them being able to tell; a shadow deployment sends a copy of real requests to the new version and discards its responses.

- **Use them for** load and correctness on real traffic before launch: a rewritten service, a new database, a search index.
- **Costs:** double the work for the shadowed traffic, and **side effects must be impossible.** A shadow that sends emails or charges cards isn't a shadow.

### Feature Flags

Deploy the code everywhere, turned off, then turn it on for a percentage of users. This separates *deploying* (the code is there) from *releasing* (users get it). See [Feature Flags & Progressive Rollout](/docs/engineering/feature-flags).

- **Rollback:** turn the flag off. Faster than any redeploy, and it works for one feature without reverting everything else in the release.
- **Costs:** flag logic in the code, and flags that must be cleaned up afterwards.

## Comparing Them

| Strategy | Blast radius of a bad release | Rollback | Extra capacity | Old and new live together? |
| -------- | ----------------------------- | -------- | -------------- | -------------------------- |
| Recreate | Everyone | Redeploy, with downtime | None | No |
| Rolling | Grows to everyone unless stopped | Roll forward again | Small | Yes, throughout |
| Blue-green | Everyone, instantly | Switch back, seconds | Double | Briefly, at the switch |
| Canary | The canary's share | Shift the slice back | Small to moderate | Yes, deliberately |
| Feature flag | Whoever the flag targets | Flip the flag | None | Yes, in the same code |

## Let the Canary Be Judged Automatically

A canary watched by a person at 2 a.m. is a canary nobody watches. The [Google SRE workbook](https://sre.google/workbook/canarying-releases/) treats canarying as an A/B test between the canary and the control population, and recommends:

- **Judge on SLIs,** like error ratio and latency, because those map to what users feel. CPU and memory are noisy and rarely tell you a release is bad (see [SLOs & Error Budgets](/docs/operations/slos)).
- **Compare canary to control at the same time,** not today to yesterday; time is its own source of noise.
- **Keep the metric set small,** a dozen at most, and **run one canary at a time** so the signal isn't muddied.
- **Automate the verdict:** if the canary diverges beyond a threshold, stop and roll back without waiting for a human. Thresholds too strict produce false alarms; too loose and bad canaries pass, so revisit them as the service changes.

## The Database Is the Real Constraint

Every strategy except recreate runs old and new code against the same database at the same time. Code can be swapped in seconds; a schema can't. So the question that decides whether a release is safe usually isn't the deployment strategy at all. It's whether the schema change is compatible with both versions.

A release that renames a column breaks the old version mid-rollout, and rolling the code back doesn't un-rename the column. The fix is to make every schema change backward compatible, through expand and contract, so any version of the code can run against any schema state in the window. See [Zero-Downtime Migrations](/docs/database/zero-downtime-migrations). With that discipline, every strategy above can roll back. Without it, none of them can.

## Immutable Deploys Make All of This Easier

Every strategy above assumes "the old version" still exists, exactly as it was, ready to receive traffic again. With [immutable artifacts](/docs/delivery/containers), it does: rolling back is pointing at the previous image, not reconstructing it. Serverless platforms take this furthest, since every deploy is a new, separately addressable build, and [continuous deployment](/docs/delivery/continuous-deployment) depends on it, because rolling back has to be routine for deploying every merge to be safe.

## This Site

Every [syntaqx.com](https://github.com/syntaqx/syntaqx.com) deploy is a new immutable Vercel deployment, so the site gets blue-green behavior without running two environments: the previous production deployment still exists, and [Vercel's Instant Rollback](https://vercel.com/docs/instant-rollback) points the domains back at it without rebuilding. Two details matter in practice: a rollback keeps the *current* environment variables rather than restoring old ones, and after a rollback Vercel stops promoting new pushes automatically until the rollback is undone, so a fix doesn't silently replace the rolled-back version.

## References

**Reference**

- [Kubernetes: Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/), Recreate and RollingUpdate, with maxUnavailable and maxSurge defaults of 25%
- [Vercel: Instant Rollback](https://vercel.com/docs/instant-rollback), rolling back by reassigning domains to a previous deployment, and what it does and doesn't restore

**In practice**

- [Martin Fowler: Blue Green Deployment](https://martinfowler.com/bliki/BlueGreenDeployment.html), two environments and a single traffic switch
- [Martin Fowler: Canary Release](https://martinfowler.com/bliki/CanaryRelease.html), exposing a release to a small subset first
- [Martin Fowler: Dark Launching](https://martinfowler.com/bliki/DarkLaunching.html), exercising new back-end behavior with real traffic, invisibly
- [Google SRE Workbook: Canarying Releases](https://sre.google/workbook/canarying-releases/), canary versus control, SLI-based evaluation and automated verdicts
