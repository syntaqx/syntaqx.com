+++
title = "Deployment Strategies"
description = "Recreate, rolling, blue-green, canary and dark launches: how each one rolls back, what it costs, and why the database is usually the real constraint."
category = "Delivery"
order = 1103
tags = ["deployment", "delivery", "rollback", "canary"]
+++

Every deployment strategy answers one question: when the new version is wrong, how much damage does it do before you notice, and how fast can you undo it? They differ in how much traffic sees the new version, how long both versions run side by side, and what that safety costs in capacity. With [continuous deployment](/docs/delivery/ci-pipelines), every merge goes through it.

Pick by the cost of a bad release. An internal tool can redeploy in place; a payment API needs to put a new version in front of a few percent of traffic and watch it before trusting it.

## The Strategies

### Recreate

Stop the old version, start the new one. [Kubernetes](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) calls this `Recreate`: every old instance is terminated before any new one is created.

- **Rollback:** recreate again with the old version, with the same downtime.
- **Costs:** downtime on every deploy. No extra capacity, and old and new never run at once.
- **Use it when** the versions genuinely can't coexist and a short outage is acceptable, like a batch worker between runs.

### Rolling

Replace instances a few at a time. Kubernetes' default `RollingUpdate` keeps at most 25% of instances unavailable and creates at most 25% extra during the rollout (`maxUnavailable` and `maxSurge`), so capacity stays close to normal throughout.

- **Rollback:** roll forward to the old version, which takes as long as the rollout did.
- **Costs:** little extra capacity, but old and new versions **serve traffic at the same time** for the whole rollout. Every request might hit either one, so they must be compatible with each other and with the same database.
- **Blind spot:** a rolling deploy has no built-in judgment. If the new version is bad, it keeps rolling until every instance is bad, unless something stops it.

### Blue-Green

Run two full environments. Blue serves production; deploy the new version to green, test it there with production configuration, then switch traffic to green in one step. [Martin Fowler's description](https://martinfowler.com/bliki/BlueGreenDeployment.html) is the classic one.

- **Rollback:** switch traffic back to blue, still running. The fastest rollback of any strategy: just a routing change.
- **Costs:** double capacity while both are up, and the switch is all-or-nothing. The new version gets 100% of traffic the moment it gets any.
- **The catch:** both environments share data. Blue-green makes the code instantly reversible; it does nothing for a database migration that green already ran.

### Canary

Send a small slice of traffic to the new version, compare it to the old, and expand only if it behaves: 1%, then 10%, then 50%, then everyone. [Fowler's canary release](https://martinfowler.com/bliki/CanaryRelease.html) is named for the bird that warned miners before the gas reached them.

![Dimensional drawing of a canary release. Traffic to the new version steps from 1 to 10 to 50 percent, with an automated verdict gate after each stage and an illustrative 30-minute bake per stage, reaching everyone 90 minutes after the first canary. A second view shows a release judged bad at the second gate: it served 1 and then 10 percent of traffic before being routed back, an exposure of 3.3 minutes of full traffic, while the planned later stages never run. A detail view enlarges those two slices, whose areas sum to the exposure, and a table gives the shares, the bake, the rollout time and the exposure formula.](/diagrams/pb-delivery-canary.svg "Each stage has to earn the next; a release that fails a gate has only ever reached the canary's share.")

- **Rollback:** route the slice back to the old version. A bad release only ever hurt the canary's share of traffic.
- **Costs:** routing that can split traffic by percentage, monitoring that can tell the two populations apart, and time: a careful canary takes longer than a rollout.
- **Why it's the default for high-stakes services:** it's the only strategy that limits blast radius *and* gives you a comparison. Not "are errors up?" but "are errors higher on the new version than the old one right now?", which cancels out everything else that changed at the same time.

### Shadow and Dark Launches

Run the new code path on real traffic without users seeing its results. [Dark launching](https://martinfowler.com/bliki/DarkLaunching.html) calls new back-end behavior for existing users without them being able to tell; a shadow deployment sends a copy of real requests to the new version and discards its responses.

- **Use them for** load and correctness on real traffic before launch: a rewritten service, a new database, a search index.
- **Costs:** double the work for the shadowed traffic, and **side effects must be impossible.** A shadow that sends emails or charges cards isn't a shadow.

### Feature Flags

Deploy the code everywhere, turned off, then release it to a percentage of users. Rollback is flipping the flag, for one feature, without reverting anything else. [Feature Flags](/docs/delivery/feature-flags) covers rollout and cleanup.

## Comparing Them

| Strategy | Blast radius of a bad release | Rollback | Extra capacity | Old and new live together? |
| -------- | ----------------------------- | -------- | -------------- | -------------------------- |
| Recreate | Everyone | Redeploy, with downtime | None | No |
| Rolling | Grows to everyone unless stopped | Roll forward again | Small | Yes, throughout |
| Blue-green | Everyone, instantly | Switch back, seconds | Double | Briefly, at the switch |
| Canary | The canary's share | Shift the slice back | Small to moderate | Yes, deliberately |
| Feature flag | Whoever the flag targets | Flip the flag | None | Yes, in the same code |

## Let the Canary Be Judged Automatically

A canary watched by a person at 2 a.m. is a canary nobody watches. The [Google SRE workbook](https://sre.google/workbook/canarying-releases/) treats canarying as an A/B test between canary and control, and recommends:

- **Judge on SLIs,** like error ratio and latency, because those map to what users feel. CPU and memory are noisy and rarely tell you a release is bad (see [SLOs & Error Budgets](/docs/operations/slos)).
- **Compare canary to control at the same time,** not today to yesterday; time is its own source of noise.
- **Keep the metric set small,** a dozen at most, and **run one canary at a time** so the signal isn't muddied.
- **Automate the verdict:** if the canary diverges beyond a threshold, roll back without waiting for a human, and revisit thresholds as the service changes.

## The Database Is the Real Constraint

Every strategy except recreate runs old and new code against the same database at once. Code swaps in seconds; a schema can't. So whether a release is safe usually depends less on the strategy than on whether the schema change works with both versions. A renamed column breaks the old version mid-rollout, and rolling the code back doesn't un-rename it. With every change backward compatible through [expand and contract](/docs/database/zero-downtime-migrations), every strategy above can roll back. Without it, none can.

## Immutable Deploys Make All of This Easier

Every strategy above assumes "the old version" still exists, exactly as it was. With [immutable artifacts](/docs/delivery/containers) it does: rolling back is pointing at the previous image, not reconstructing it. Serverless platforms take this furthest, since every deploy is a new, separately addressable build.

## Versioning a Set of Services Together

Everything above deploys one service at a time, and for independent services that's right. Some changes span several: a client, a server and three backend services that changed their contract on the same day. Each one rolling out on its own schedule produces combinations nobody tested. Riot's account of running its online services puts it bluntly: "Allowing unaligned streams of changes into a distributed system will eventually lead to preventable incidents," and its partner-operated shards, where operators assembled service versions themselves, had more incidents traced to microservice versions that weren't compatible with each other.

The fix is to version the set. Riot calls its unit an environment, a bundle of "all the declarative metadata required to fully specify, deploy, configure, run, and operate" a product's services, versioned as a whole and never changed in place:

```json
{
  "environment": "prod-eu",
  "version": "2026.10.27-3",
  "services": {
    "accounts": { "image": "accounts@sha256:4c1d...e2", "replicas": 12 },
    "orders":   { "image": "orders@sha256:9a07...51",   "replicas": 20 },
    "billing":  { "image": "billing@sha256:b3f2...0c",  "replicas": 6 }
  },
  "config_overrides": ["base", "region/eu"]
}
```

- **Pin by digest, not tag.** Kubernetes documents why: tags "can be moved to point to different images, but digests are fixed," so a set pinned by digest runs the same code every time it starts. A set of mutable tags is not a version.
- **One version per environment at a time.** Rolling forward or back moves the whole set, and a hotfix to one service is a new set version, not a side-channel deploy. Two environments on the same version are known to be identical.
- **Layered overrides for what legitimately differs** (region, credentials, scale) on top of the versioned base, so a deployment stays traceable to the set that was tested. Riot describes the same layering.
- **The set is still rolled out with the strategies above.** A new set version can go to one region or shard first as a canary, with the previous set version kept ready to switch back to.

A **release train** is the same idea on a calendar: changes that are ready by a cut-off ship together on a fixed cadence, and anything that misses waits for the next one. Chrome ships a new milestone to stable every two weeks, and features that aren't complete by branch point "should be punted to the following milestone." Trains suit products where shipping is expensive per release (store-reviewed apps, game clients, appliances, on-premises software; see [Mobile Releases](/docs/delivery/mobile-releases#release-trains)). For backend services that can each deploy many times a day, keep services independently deployable with backward-compatible contracts ([API Versioning](/docs/api-design/versioning)), and reserve set versioning for the changes that genuinely have to move together.

## References

**Reference**

- [Kubernetes: Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/), Recreate and RollingUpdate, with maxUnavailable and maxSurge defaults of 25%
- [Vercel: Instant Rollback](https://vercel.com/docs/instant-rollback), rolling back by reassigning domains to a previous deployment, and what it does and doesn't restore
- [Kubernetes: Images](https://kubernetes.io/docs/concepts/containers/images/), mutable tags, immutable digests and pinning an image by digest
- [Chromium: Release cycle](https://chromium.googlesource.com/chromium/src/+/master/docs/process/release_cycle.md), a stable milestone every two weeks and features punted past the branch point

**In practice**

- [Martin Fowler: Blue Green Deployment](https://martinfowler.com/bliki/BlueGreenDeployment.html), two environments and a single traffic switch
- [Martin Fowler: Canary Release](https://martinfowler.com/bliki/CanaryRelease.html), exposing a release to a small subset first
- [Martin Fowler: Dark Launching](https://martinfowler.com/bliki/DarkLaunching.html), exercising new back-end behavior with real traffic, invisibly
- [Google SRE Workbook: Canarying Releases](https://sre.google/workbook/canarying-releases/), canary versus control, SLI-based evaluation and automated verdicts
- [Riot Games: Running Online Services at Riot, Part VI](https://www.riotgames.com/en/news/running-online-services-riot-part-vi), deploying a product as one immutably versioned environment with layered overrides, and incidents from unaligned changes
