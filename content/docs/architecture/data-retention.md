+++
title = "Data Retention & Deletion"
description = "How long data is kept and how it is removed: soft vs hard delete, retention windows, GDPR erasure next to append-only financial records, and backups."
category = "Architecture"
order = 407
tags = ["architecture", "privacy", "gdpr", "database"]
aliases = ["data-retention"]
+++

Data you don't keep can't leak, can't be subpoenaed, and doesn't need migrating. The default in most systems is the opposite: everything is kept forever because nobody decided otherwise, and the cost shows up years later as a breach of records the business hadn't needed since 2019. So every kind of data gets a retention period on purpose, and deletion is a designed feature, not a `DELETE` someone runs by hand. This is the mechanics; [GDPR & Privacy](/docs/compliance/gdpr) covers the legal duties behind them.

## Soft vs Hard Delete

| | Soft delete | Hard delete |
| --- | ----------- | ----------- |
| How | Set `deleted_at` | Remove the row |
| Recoverable | Yes, until purged | Only from backups |
| Use for | User-facing "delete" with undo, anything other records reference | Data past retention, erasure requests |

- **Soft delete is a timestamp, not a boolean.** `deleted_at` (see [Database Naming Conventions](/docs/database/naming-conventions)) tells you when, which the purge job needs to know what's old enough. A boolean `is_deleted` answers neither question.
- **Soft-deleted rows disappear from the API.** `GET` returns `404`, lists leave them out, and a partial index (`WHERE deleted_at IS NULL`) keeps live queries fast. Every query that forgets the filter shows deleted data, one more reason to keep the window short.
- **Soft delete is not deletion.** For privacy purposes the data still exists, and telling a user it's deleted when it's a flag on a row ends up in a regulator's report. A soft delete is followed by a hard delete or anonymization on a schedule.

## Retention Windows

Every table and every log stream has a documented retention period and an automated job that enforces it. A retention policy with no job is a wish.

| Data | Example retention | Why |
| ---- | ----------------- | --- |
| Request logs | 30 days | Debugging and abuse investigation rarely need older logs |
| Idempotency keys | 24 hours | The retry window in [Idempotency](/docs/payments/idempotency) |
| Webhook events | 30 days | Replay for [Webhooks](/docs/api-design/webhooks) consumers |
| Soft-deleted user content | 30 days | An undo window, then gone |
| Financial records | Per legal requirement, often years | Tax, audit and anti-money-laundering rules |

The exact numbers come from legal and compliance, by jurisdiction. The engineering rule is that none is "forever by default", and each is short enough to explain to a customer why you still have their data.

## Retention Schedules by Record Type

Business records and [audit trails](/docs/architecture/audit-trails) are the hard case: kept for years, by rules that differ for every kind of record. Retention there isn't one number per table; it's a schedule keyed by **record type**, and one table can hold several types.

- **Each type has a minimum, a rule and a trigger.** Rules start their clocks at different events, and rarely at the row's creation. In the US, FLSA payroll records are kept [at least 3 years from the last date of entry](https://www.law.cornell.edu/cfr/text/29/516.5); the IRS says to keep employment tax records [at least 4 years after the tax is due or paid, whichever is later](https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records); Regulation Z requires a lender to keep evidence of compliance [for 2 years after the date disclosures are required to be made or action is required to be taken](https://www.law.cornell.edu/cfr/text/12/1026.25). Store the trigger date on the record (`closed_on`, `last_activity_on`), not just `created_at`, so the purge job can compute expiry.
- **The longest applicable rule wins.** A refund is a payment record, a tax record and possibly evidence in a dispute; it's kept until the last of those expires. Model it as a list of applicable rules per record, with expiry computed as the maximum, so adding a jurisdiction can only lengthen retention, never accidentally shorten it.
- **Schedules are data, not code.** Legal owns the numbers and changes them; each change is versioned and audited, and the purge job reads the current schedule.
- **Longer than the minimum is a choice.** Many businesses keep core records past every regulatory minimum to cover limitation periods for contract and consumer claims. That's counsel's call, so make it configurable per type.

**Legal holds** override every schedule. Once litigation is reasonably anticipated, the duty to preserve applies, and under [Federal Rule of Civil Procedure 37(e)](https://www.law.cornell.edu/rules/frcp/rule_37), if electronically stored information is lost because a party failed to take reasonable steps to preserve it, a court can order measures to cure the prejudice, and, on finding intent to deprive the other party of it, presume the information was unfavorable, instruct the jury to, or dismiss the case or enter a default judgment. A hold is a record of its own (matter, scope by person, account, date range and record type, who placed it, when) that the purge job checks before every delete, in the database, the archive and the backups. Placing and releasing a hold are audit entries. [Audit Trails](/docs/architecture/audit-trails#producing-records) covers exporting what a hold preserves.

## Erasure Requests

Under [GDPR Article 17](https://gdpr-info.eu/art-17-gdpr/), a person can ask for their personal data to be erased, with [one month](https://gdpr-info.eu/art-12-gdpr/) to respond. A month sounds generous until the data is spread across twelve services, three vendors and a warehouse.

- **One erasure pipeline,** not a checklist. A request fans out as an [event](/docs/architecture/events), every service holding personal data handles it and reports back, and the request isn't complete until all of them have. A checklist is followed perfectly once and then drifts.
- **Know where personal data lives.** Every field has a [classification](/docs/payments/sensitive-data), so finding personal data is a query, not an archaeology project.
- **Erase from derived stores too:** search indexes, caches, [analytics warehouses](/docs/architecture/data-pipelines), third-party processors. That's where erasure usually fails, because nobody thinks of a search index as a copy.
- **Keep proof.** Record that the request was received and completed, without keeping the data that was erased.

## Erasure vs Append-Only Records

Financial records are [append-only](/docs/payments/payment-states), and usually legally required for years, which looks like a direct conflict with erasure. GDPR anticipates it: Article 17(3)(b) exempts data needed to comply with a legal obligation, and 17(3)(e) data needed for legal claims. The workable answer is to separate identity from the record:

- **Keep personal data out of ledger rows.** A ledger entry references `customer_id`, never a name or email. Then there's nothing personal in the rows you can't delete.
- **Pseudonymize on erasure.** The customer record is scrubbed (name, email and address removed or replaced), and the ID stays, so the ledger still balances and the books still reconcile.
- **Crypto-shredding** for personal data that has to be stored alongside retained records: encrypt each person's sensitive fields with a per-person key, and delete the key on erasure. The ciphertext that remains, in the database and every copy of it, is unreadable.
- **Legal holds override retention.** Data under a hold isn't purged or erased until the hold is released, and the hold itself is recorded. A purge job that ignores holds can destroy evidence, which is its own legal problem.

## Backups

Backups are the place deleted data goes to hide.

- **Backups have retention too,** short enough that erased data ages out in a known time (35 days, for example), so "is my data really gone?" has a date.
- **Don't resurrect deleted data.** After a restore, replay the erasure log, or every restore quietly undoes a month of erasure requests.
- **Crypto-shredding covers backups for free.** Once the key is gone, old copies are unreadable without touching the backups.
- **Test restores.** A backup that has never been restored is a hope ([Disaster Recovery](/docs/operations/disaster-recovery)).

## References

**Specifications**

- [GDPR Article 17: Right to Erasure](https://gdpr-info.eu/art-17-gdpr/), erasure "without undue delay" and its exceptions
- [GDPR Article 12: Transparent Information](https://gdpr-info.eu/art-12-gdpr/), the one-month response deadline
- [GDPR Article 5: Principles](https://gdpr-info.eu/art-5-gdpr/), storage limitation and data minimization
- [GDPR Article 4: Definitions](https://gdpr-info.eu/art-4-gdpr/), what counts as personal data and pseudonymization
- [29 CFR 516.5](https://www.law.cornell.edu/cfr/text/29/516.5), three-year retention of FLSA payroll records from the last date of entry
- [12 CFR 1026.25](https://www.law.cornell.edu/cfr/text/12/1026.25), Regulation Z's two-year retention of compliance evidence
- [Federal Rule of Civil Procedure 37](https://www.law.cornell.edu/rules/frcp/rule_37), consequences of failing to preserve electronically stored information

**Reference**

- [IRS: How long should I keep records?](https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records), retention periods for tax and employment tax records
