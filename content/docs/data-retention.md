+++
title = "Data Retention & Deletion"
description = "How long data is kept and how it is removed: soft vs hard delete, retention windows, GDPR erasure next to append-only financial records, and backups."
category = "Architecture"
order = 8.3
tags = ["architecture", "privacy", "gdpr", "database"]
+++

Data you don't keep can't leak, can't be subpoenaed, and doesn't need migrating. Every kind of data gets a retention period on purpose, and deletion is a designed feature, not a `DELETE` someone runs by hand.

## Soft vs Hard Delete

| | Soft delete | Hard delete |
| --- | ----------- | ----------- |
| How | Set `deleted_at` | Remove the row |
| Recoverable | Yes, until purged | Only from backups |
| Use for | User-facing "delete" with undo, anything referenced by other records | Data past retention, erasure requests |

- **Soft delete is a timestamp, not a boolean.** `deleted_at` per [Database Naming Conventions](/docs/database-naming-conventions), so you know when, and a purge job knows what's old enough.
- **Soft-deleted rows disappear from the API.** `GET` returns `404`, lists leave them out. A partial index (`WHERE deleted_at IS NULL`) keeps queries fast.
- **Soft delete is not deletion.** For privacy purposes the data still exists. A soft delete must be followed by a hard delete or anonymization on a schedule.

## Retention Windows

Every table and every log stream has a documented retention period and an automated job that enforces it.

| Data | Example retention | Why |
| ---- | ----------------- | --- |
| Request logs | 30 days | Debugging, abuse investigation |
| Idempotency keys | 24 hours | [Idempotency](/docs/idempotency) |
| Webhook events | 30 days | [Webhooks](/docs/webhooks) replay |
| Soft-deleted user content | 30 days | Undo window |
| Financial records | Per legal requirement, often years | Tax, audit, anti-money-laundering rules |

The exact numbers come from legal and compliance, by jurisdiction. The engineering rule is that none of them is "forever by default".

## Erasure Requests

Under [GDPR Article 17](https://gdpr-info.eu/art-17-gdpr/), a person can ask for their personal data to be erased, and it has to happen "without undue delay". [Article 12(3)](https://gdpr-info.eu/art-12-gdpr/) gives one month to respond, extendable by two more for complex cases.

- **One erasure pipeline,** not a checklist. A request fans out as an [event](/docs/events), and every service that holds personal data handles it and reports back.
- **Know where personal data lives.** Every field has a [classification](/docs/sensitive-data), so finding personal data is a query, not an archaeology project.
- **Erase from derived stores too:** search indexes, caches, analytics warehouses, third-party processors.
- **Keep proof.** Record that the request was received and completed, without keeping the data that was erased.

## Erasure vs Append-Only Records

Financial records are [append-only](/docs/payment-states), and you're often legally required to keep them. GDPR anticipates this: Article 17(3)(b) exempts data needed to comply with a legal obligation, and 17(3)(e) exempts data needed for legal claims. So the answer is to separate identity from the record:

- **Keep personal data out of ledger rows.** A ledger entry references `customer_id`, never a name or email.
- **Pseudonymize on erasure.** The customer record is scrubbed (name, email and address replaced or removed), and the ID stays so the ledger still balances.
- **Crypto-shredding** for data that has to be retained in encrypted form: encrypt each person's sensitive fields with a per-person key, and delete the key on erasure. The ciphertext that remains is unreadable.
- **Legal holds override retention.** Data under a hold isn't purged or erased until the hold is released, and the hold itself is recorded.

## Backups

Backups are the place deleted data goes to hide.

- **Backups have retention too,** and it's short enough that erased data ages out in a known time (for example, 35 days).
- **Don't restore deleted data back into production.** After a restore, replay the erasure log so anything erased since the backup is erased again.
- **Crypto-shredding covers backups for free.** Once the key is gone, the copies in old backups are unreadable as well.
- **Test restores regularly.** A backup that has never been restored is a hope, not a backup.
