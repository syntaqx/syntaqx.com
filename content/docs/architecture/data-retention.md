+++
title = "Data Retention & Deletion"
description = "How long data is kept and how it is removed: soft vs hard delete, retention windows, GDPR erasure next to append-only financial records, and backups."
category = "Architecture"
order = 8.3
tags = ["architecture", "privacy", "gdpr", "database"]
aliases = ["data-retention"]
+++

Data you don't keep can't leak, can't be subpoenaed, and doesn't need migrating. The default in most systems is the opposite: everything is kept forever because nobody decided otherwise, and the cost shows up years later as a breach that exposed records the business hadn't needed since 2019. So every kind of data gets a retention period on purpose, and deletion is a designed feature, not a `DELETE` someone runs by hand.

## Soft vs Hard Delete

| | Soft delete | Hard delete |
| --- | ----------- | ----------- |
| How | Set `deleted_at` | Remove the row |
| Recoverable | Yes, until purged | Only from backups |
| Use for | User-facing "delete" with undo, anything other records reference | Data past retention, erasure requests |

- **Soft delete is a timestamp, not a boolean.** `deleted_at` (see [Database Naming Conventions](/docs/database/naming-conventions)) tells you when, which the purge job needs to know what's old enough. A boolean `is_deleted` answers neither question.
- **Soft-deleted rows disappear from the API.** `GET` returns `404`, lists leave them out. A partial index (`WHERE deleted_at IS NULL`) keeps queries over live rows fast. Every query that forgets the filter is a bug that shows deleted data, which is one more reason to keep the soft-delete window short.
- **Soft delete is not deletion.** For privacy purposes the data still exists. Telling a user their data is deleted when it's a flag on a row is the kind of thing that ends up in a regulator's report. A soft delete is followed by a hard delete or anonymization on a schedule.

## Retention Windows

Every table and every log stream has a documented retention period and an automated job that enforces it. A retention policy with no job is a wish.

| Data | Example retention | Why |
| ---- | ----------------- | --- |
| Request logs | 30 days | Debugging and abuse investigation rarely need older logs |
| Idempotency keys | 24 hours | The retry window in [Idempotency](/docs/payments/idempotency) |
| Webhook events | 30 days | Replay for [Webhooks](/docs/payments/webhooks) consumers |
| Soft-deleted user content | 30 days | An undo window, then gone |
| Financial records | Per legal requirement, often years | Tax, audit and anti-money-laundering rules |

The exact numbers come from legal and compliance, by jurisdiction. The engineering rule is that none of them is "forever by default", and each one is short enough that you could explain to a customer why you still have their data.

## Erasure Requests

Under [GDPR Article 17](https://gdpr-info.eu/art-17-gdpr/), a person can ask for their personal data to be erased, and it has to happen "without undue delay". [Article 12(3)](https://gdpr-info.eu/art-12-gdpr/) gives one month to respond, extendable by two more for complex cases. A month sounds generous until the data is spread across twelve services, three vendors and a warehouse.

- **One erasure pipeline,** not a checklist. A request fans out as an [event](/docs/architecture/events), every service that holds personal data handles it and reports back, and the request isn't complete until all of them have. A checklist is followed perfectly once and then drifts.
- **Know where personal data lives.** Every field has a [classification](/docs/payments/sensitive-data), so finding personal data is a query, not an archaeology project.
- **Erase from derived stores too:** search indexes, caches, analytics warehouses, third-party processors. These are where erasure usually fails, because nobody thinks of a search index as a copy.
- **Keep proof.** Record that the request was received and completed, without keeping the data that was erased.

## Erasure vs Append-Only Records

Financial records are [append-only](/docs/payments/payment-states), and you're usually legally required to keep them for years. That looks like a direct conflict with erasure. GDPR anticipates it: Article 17(3)(b) exempts data needed to comply with a legal obligation, and 17(3)(e) exempts data needed for legal claims. The workable answer is to separate identity from the record:

- **Keep personal data out of ledger rows.** A ledger entry references `customer_id`, never a name or email. Then there's nothing personal in the rows you can't delete.
- **Pseudonymize on erasure.** The customer record is scrubbed (name, email and address removed or replaced), and the ID stays, so the ledger still balances and the books still reconcile.
- **Crypto-shredding** for personal data that has to be stored alongside retained records: encrypt each person's sensitive fields with a per-person key, and delete the key on erasure. The ciphertext that remains, in the database and every copy of it, is unreadable.
- **Legal holds override retention.** Data under a hold isn't purged or erased until the hold is released, and the hold itself is recorded. A purge job that ignores holds can destroy evidence, which is its own legal problem.

## Backups

Backups are the place deleted data goes to hide.

- **Backups have retention too,** short enough that erased data ages out in a known time (35 days, for example). Then the answer to "is my data really gone?" has a date.
- **Don't resurrect deleted data.** After a restore, replay the erasure log so anything erased since the backup was taken is erased again. Otherwise every restore quietly undoes a month of erasure requests.
- **Crypto-shredding covers backups for free.** Once the key is gone, copies in old backups are unreadable too, without touching the backups.
- **Test restores regularly.** A backup that has never been restored is a hope, not a backup. See [Disaster Recovery](/docs/operations/disaster-recovery).

## References

**Specifications**

- [GDPR Article 17: Right to Erasure](https://gdpr-info.eu/art-17-gdpr/), erasure "without undue delay" and its exceptions
- [GDPR Article 12: Transparent Information](https://gdpr-info.eu/art-12-gdpr/), the one-month response deadline
- [GDPR Article 5: Principles](https://gdpr-info.eu/art-5-gdpr/), storage limitation and data minimization
- [GDPR Article 4: Definitions](https://gdpr-info.eu/art-4-gdpr/), what counts as personal data and pseudonymization
