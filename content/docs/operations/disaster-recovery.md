+++
title = "Disaster Recovery"
description = "Recovery targets set from business impact, backups you've actually restored, the four DR strategies and their cost, and infrastructure rebuilt from code."
category = "Operations"
order = 1206
tags = ["operations", "reliability", "backups", "disaster-recovery"]
+++

[Incident response](/docs/operations/incident-response) assumes the system is still there to fix. Disaster recovery is the plan for when it isn't: a deleted table, a corrupted backup, a compromised account, a lost region. Nobody gets credit for it until the day it's the only thing that matters, so it has to be planned, priced and practiced before that day.

## Set Targets From Impact

Every system gets two numbers, agreed with the people who own the business impact, not picked by engineering:

| Target | Question | Example |
| --- | --- | --- |
| **RTO** (recovery time objective) | How long can it be down? | 4 hours |
| **RPO** (recovery point objective) | How much data can we lose? | 5 minutes |

Set them per system (the ledger and the marketing site don't deserve the same budget), make the cost of tighter targets an explicit trade, and write them down next to the system's [SLOs](/docs/operations/slos).

## Backups

- **3-2-1:** three copies of the data, on two different kinds of storage, one of them off-site. Add one copy that's **immutable**: write-once storage or a separate account the production credentials can't touch, so ransomware or a compromised key can't delete your way out of recovery.
- **Point-in-time recovery** for databases: continuous log archiving, so you can restore to the minute before the bad migration, not last night. See [PostgreSQL continuous archiving](https://www.postgresql.org/docs/current/continuous-archiving.html).
- **Back up everything needed to rebuild,** not just data: configuration, secrets (in their own secure store), DNS, and the code that defines the infrastructure.
- **Replication isn't a backup.** A replica faithfully copies the `DELETE` too. You need history, not just copies.

## Restores Are What Matter

As the [Google SRE book](https://sre.google/sre-book/data-integrity/) puts it: "No one really wants to make backups; what people really want are restores."

Restore on a schedule, automatically, into a scratch environment, and verify the result: row counts, checksums, an application smoke test. Time it, because the restore time is your real RTO whatever the document says, and alert when a drill fails like any other production failure. A backup that has never been restored is a hope.

## Strategies

Four broad strategies trade rising cost for falling recovery time. The names are [AWS's](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html), but the tradeoff holds anywhere: you pay continuously for capacity in the recovery location to buy back time on the day you need it.

| Strategy | What's running in the recovery region | Recovery |
| --- | --- | --- |
| **Backup and restore** | Nothing but backups | Hours: rebuild infrastructure, restore data |
| **Pilot light** | Data replicated; core infrastructure provisioned but switched off | Tens of minutes: switch on and scale up |
| **Warm standby** | A scaled-down, fully working copy | Minutes: scale up |
| **Multi-site active/active** | Full production, serving traffic | Near zero for infrastructure loss |

Choose from the RTO and RPO, not from ambition. Most systems need backup and restore done properly. Even active/active needs backups: a data corruption replicates to every region, and the recovery point is always before it was discovered.

## Rebuild From Code

Infrastructure that exists only as clicks in a console has to be recovered by remembering those clicks under pressure. With [infrastructure as code](/docs/delivery/infrastructure-as-code) for networks, databases, queues, DNS and permissions, recovery is running the same code in a new account or region, and with [immutable artifacts](/docs/delivery/containers), rebuilding is redeploying.

Know your dependencies' DR too. Your RTO can't beat your payment processor's, identity provider's or DNS host's: list them, read their commitments, and decide what you do while each one is down.

## Runbooks and Game Days

Each scenario (region loss, database corruption, compromised credentials, a dependency outage) gets a [runbook](/docs/operations/on-call) saying who decides, the exact steps, and how to verify recovery. Game days rehearse them for real: fail over a region, restore the database, rotate every secret, on a scheduled day with everyone watching. The gaps you find on a game day are gaps you didn't find in an incident, and every real incident's [postmortem](/docs/operations/incident-response) updates the plan.

## References

**Reference**

- [AWS: Disaster recovery options in the cloud](https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html), backup and restore, pilot light, warm standby, multi-site active/active
- [AWS Well-Architected: Plan for disaster recovery](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/plan-for-disaster-recovery-dr.html), defining RTO and RPO
- [PostgreSQL: Continuous archiving and point-in-time recovery](https://www.postgresql.org/docs/current/continuous-archiving.html), restoring to a moment, not a nightly snapshot

**In practice**

- [Google SRE Book: Data Integrity](https://sre.google/sre-book/data-integrity/), restores over backups
- [Veeam: The 3-2-1 backup rule](https://www.veeam.com/blog/321-backup-rule.html), three copies, two media, one off-site, plus an immutable copy
- [Principles of Chaos Engineering](https://principlesofchaos.org/), testing recovery on purpose
