+++
title = "Matching, Merging & Many Sources"
nav_title = "Record Linkage"
description = "Reconciling one real thing reported by many sources: observations, per-field survivorship, crosswalks, match-before-create, reversible merges and overrides."
category = "Architecture"
order = 412
tags = ["architecture", "data-modeling", "record-linkage", "deduplication", "data-quality"]
+++

Any system that lives long enough learns about the same real thing from more than one place. A player signs in with Steam on Monday and a console account on Friday. A home for sale arrives in two listing feeds with different keys. A supplier's catalog and a marketplace seller describe the same product with different titles. A customer exists in the CRM, the billing system, the support desk and a spreadsheet from the acquired company. An address comes back from three geocoders with three slightly different answers.

The shortcut is one row per thing, overwritten by whichever source wrote last. It fails in both directions at once: the same customer exists twice because nothing matched them, two different people are fused because something matched them too eagerly, and nobody can say why a field holds the value it does. This chapter is the general practice for holding many sources' views of one thing and deriving a record you can explain. [Addresses & Geocoding](/docs/fundamentals/addresses) applies it to addresses, the most common case.

## Observations, Not Overwrites

Store what each source said as an **observation** of the entity, and compute the entity's working record from its observations. The entity row is a derived view with its own stable ID; the observations are the evidence.

```sql
CREATE TABLE customer_observations (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL REFERENCES tenants (id),
  customer_id        UUID NOT NULL REFERENCES customers (id),
  source             TEXT NOT NULL,   -- crm | billing | support | import:acme | override (open-ended, so no CHECK)
  source_xid         TEXT,            -- the source's own key, kept as text
  observed_at        TIMESTAMPTZ NOT NULL,
  attributes         JSONB NOT NULL,  -- what the source said, field by field
  license            TEXT,            -- the terms this row was received under
  license_expires_at TIMESTAMPTZ,     -- when it must be refreshed or dropped
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX customer_observations_customer_id_idx ON customer_observations (customer_id);
```

Three things follow. A new answer from a source is a new row, never an update in place, so you can see when a vendor changed its mind. The working record can be recomputed after you change the rules, which is the only way to fix a bad rule retroactively. And each observation carries its own license, which matters more than it sounds (see [Licensed Data](#licensed-data)).

Keep the entity's own ID independent of every source's key: [UUID v7](/docs/fundamentals/identifier-conventions), minted by you. Source keys go in the crosswalk.

## Crosswalks of External IDs

A crosswalk maps each source's key to your entity, one row per source key. It replaces the `legacy_id` column that every table grows and that holds only one source:

```sql
CREATE TABLE customer_external_ids (
  tenant_id     UUID NOT NULL REFERENCES tenants (id),
  source        TEXT NOT NULL,
  source_xid    TEXT NOT NULL,       -- leading zeros intact
  customer_id   UUID NOT NULL REFERENCES customers (id),
  linked_at     TIMESTAMPTZ NOT NULL,
  unlinked_at   TIMESTAMPTZ,
  link_reason   TEXT NOT NULL
                  CHECK (link_reason IN ('exact_key', 'standardized', 'reviewed', 'merge')),
  CONSTRAINT customer_external_ids_pkey PRIMARY KEY (tenant_id, source, source_xid, linked_at)
);

-- one open link per source key at a time
CREATE UNIQUE INDEX customer_external_ids_tenant_id_source_source_xid_idx
  ON customer_external_ids (tenant_id, source, source_xid)
  WHERE unlinked_at IS NULL;

CREATE INDEX customer_external_ids_customer_id_idx ON customer_external_ids (customer_id);
```

- **External IDs are text.** They're in a format the vendor controls, and a numeric column drops leading zeros and breaks the day the vendor adds a letter. The `_xid` suffix says so, per [Database Naming Conventions](/docs/database/naming-conventions).
- **Links are dated, not deleted.** When a link turns out to be wrong, close it with `unlinked_at` instead of deleting it, so history still resolves.
- **Vendor keys move.** Google says its place IDs "may change over time" and recommends refreshing any older than 12 months ([Google: Place IDs](https://developers.google.com/maps/documentation/places/web-service/place-id)). Overture Maps keeps its address IDs out of its stable ID registry because its matching relies on identical values ([Overture: Addresses](https://docs.overturemaps.org/guides/addresses/)). A changed key is a new crosswalk row, not an edit.
- **Distinguish the immediate source from the origin.** Data that has passed through an aggregator has two keys. The RESO Data Dictionary used by real estate listing feeds defines `ListingKey` as "the local key of the system" and points to separate `SourceSystemKey` and `OriginatingSystemKey` fields for carrying the original keys ([RESO: ListingKey](https://dd.reso.org/DD2.0/Property/ListingKey/)). Store both, because the same listing syndicated through two aggregators shares an origin key and nothing else.

A crosswalk also makes migrations idempotent: re-running an import finds the rows it created by source key instead of inserting duplicates ([Idempotency](/docs/payments/idempotency)).

## Survivorship Per Field

The working record picks a value for each field, and the rule is **per field, not per source**. A billing system is the best source for the legal name and the worst for the phone number a support agent confirmed yesterday. Rules I default to:

- **Rank sources per field,** then break ties by quality signals (verified over unverified, a confirmed unit over a missing one), then by recency.
- **Write the rules as configuration,** applied in one function, not as `if` statements scattered across import jobs.
- **Record the winner.** For each field, store which observation won and under which rule. "Why does this customer have this email?" should be a query.

```yaml
customer:
  legal_name:   [override, billing, crm]
  email:        [override, verified:*, support, crm]   # verified beats any unverified source
  phone:        [override, verified:*, newest]
  birth_on:     [override, kyc_provider]               # one trusted source, no fallback
```

```sql
CREATE TABLE customer_field_winners (
  customer_id    UUID NOT NULL REFERENCES customers (id),
  field          TEXT NOT NULL,
  observation_id UUID NOT NULL REFERENCES customer_observations (id),
  rule           TEXT NOT NULL,
  decided_at     TIMESTAMPTZ NOT NULL,
  CONSTRAINT customer_field_winners_pkey PRIMARY KEY (customer_id, field)
);
```

When the winner of a field changes, emit an event only if the value changed. A higher-ranked source confirming the same value is provenance, not news.

## Match Before Create

Every incoming record from every source looks for an existing entity before creating one, in order of strength:

1. **Exact key.** The source key is already in the crosswalk. Link and stop.
2. **Standardized key.** The same normalized email, phone in E.164, address plus unit after standardization, or product GTIN. Normalize both sides the same way, with the same library version, or identical things won't compare equal.
3. **Fuzzy match plus gates.** Similar names or titles, close coordinates, overlapping attributes. PostgreSQL's [pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html) gives a `similarity()` score from 0 to 1 with GIN and GiST index support, which is enough for many systems. Then apply **gates**: hard disagreements that veto a match whatever the score. "123 Main St" and "123 Main St Apt 4" are near-identical strings and different homes; two players with the same display name and different dates of birth are different people; two catalog items with the same title and different pack sizes are different products.

Fuzzy matching across a whole table is quadratic, so compare only within **blocks**: candidates sharing a postal code, a name prefix, a brand. Pick blocking keys that true matches almost always share, and check the blocks' sizes, because one giant block (everyone with no postal code) turns the job back into a full comparison.

## Review Bands

A match score is not a decision. Turn it into one with two thresholds:

| Score | Action |
| ----- | ------ |
| Above the upper threshold, and no gate fails | Link automatically |
| Between the thresholds | Queue for a person to decide |
| Below the lower threshold | Create a new entity |

This is the shape of the classic theory: Fellegi and Sunter's 1969 paper defines three decisions for a comparison pair, a link, a non-link and a "possible link" when the evidence is insufficient at the chosen error levels ([Fellegi & Sunter: A Theory for Record Linkage](https://cs.cornell.edu/~shmat/courses/cs6434/fellegi-sunter.pdf)). The thresholds trade false merges against duplicates, and the right trade depends on the cost of each. A duplicate marketing contact is cheap; a merged bank customer who now sees a stranger's balance is an incident.

- **Show the reviewer the evidence,** field by field, with each side's source, not just two names and a score.
- **Store "not a match" decisions** as well as matches, so the same pair isn't asked again on the next import.
- **Measure the bands.** Sample auto-links to estimate the false merge rate, and watch the queue's size; a queue nobody clears is a create-everything policy with extra steps.
- **Never auto-merge** two entities that both have live obligations attached (active subscriptions, stored payment credentials, open orders). Link them for review instead.

## Probabilistic Linkage

When sources pile up all at once (an acquisition, a platform switch, a backlog of unvalidated imports), matching record by record at import time is too slow and too inconsistent. Treat it as a batch record-linkage job.

Fellegi-Sunter scores each field comparison with two probabilities: **m**, the chance the fields agree when the records are a match (a measure of data quality), and **u**, the chance they agree when they aren't (a measure of coincidence). Each comparison contributes a match weight of log₂(m/u), and assuming fields are independent, the weights add up to a score that converts to a match probability ([Splink: The Fellegi-Sunter model](https://moj-analytical-services.github.io/splink/topic_guides/theory/fellegi_sunter.html)). Agreement on date of birth counts for far more than agreement on a common surname, and **term frequency adjustments** go further, lowering the weight for a match on "Smith" and raising it for a rare name ([Splink: Term frequency adjustments](https://moj-analytical-services.github.io/splink/topic_guides/comparisons/term-frequency.html)).

My default tool for the batch is [Splink](https://moj-analytical-services.github.io/splink/index.html), an open-source Python package that implements the model, trains without labelled data, and runs on DuckDB locally or Spark for larger jobs; its documentation says it links a million records on a laptop in about a minute. Run it over the observations, send the uncertain middle to the same review queue, and write the outcome as crosswalk rows and recorded merges, never as silent overwrites.

## Merges, Recorded and Reversible

A merge folds a duplicate (the loser) into a survivor. Most products implement it as "move the children, delete the loser", which can't be explained afterwards and can't be undone. Instead:

- **Record the merge:** survivor, loser, who, when, why, and the list of every child record re-pointed.
- **Keep the loser's ID as a tombstone** that redirects to the survivor. Payment processors, portals, webhooks, old emails and other services' caches still hold it; a `GET` on the old ID answers with the survivor (or a `301` to it) rather than a `404`.
- **Keep the loser's observations.** They become observations of the survivor, and survivorship recomputes every field. Nothing is copied by hand.
- **Publish it.** A `customer.merged` [event](/docs/architecture/events) with both IDs lets every other service re-key its copies.
- **Make unmerge possible.** With the re-pointing list and the loser's observations intact, an unmerge restores both entities, even if the UI never exposes it.
- **Never merge across tenants.** Two tenants' customers who are the same person are two customers, one per tenant; matching and merging run inside one tenant's data only ([Multi-Tenancy](/docs/architecture/multi-tenancy)).

```http
ce-specversion: 1.0
ce-id: 019a2f61-3c7e-7d42-8b1a-6f0e2d9c4a10
ce-source: /customers
ce-type: customer.merged
ce-subject: 01932c6c-7616-7590-a8db-cb4b0e4d1c8a
ce-time: 2026-10-26T15:02:11Z
Content-Type: application/json

{
  "survivor_id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "loser_id": "0193a1e2-55d0-7b3c-9f41-2c7d8e6a0b55",
  "merge_id": "019a2f61-3c80-7e11-a2c4-91b7f3d05e28",
  "reason": "reviewed"
}
```

Some merges need domain rules on top. Merging two game accounts with purchases from different storefronts must keep each purchase's entitlement tied to the store that sold it. Merging two payers with stored cards needs a decision on which mandate stays valid ([Stored Cards & Recurring Billing](/books/payments/stored-credentials) is an example). Merging two patient charts is the strictest case, since an overlay puts one person's records in another's chart ([Patient Matching & Identity](/books/health-tech/patient-matching-and-identity)).

## Overrides That Retire

Sometimes a person knows better than every source: the customer, the deed and the county all say the house is in one city and the geocoder says another; a seller corrects a catalog attribute the supplier feed gets wrong. Record that as an **override**: an observation from the `override` source, with the highest precedence, scoped to named fields only, with who made it, the evidence, and what the source said at the time. The source's answer stays recorded beside it, and later refreshes don't silently revert it.

An override is a standing question, not a permanent pin. A scheduled job re-asks the sources and compares each new answer with the override field by field, after normalizing both sides the same way. Each comparison lands in one of three outcomes:

- **Converged.** The source now says what the override says. Record the agreement, mark the override confirmed with the observation that confirmed it, and hand the field back to normal survivorship. Adopt anything new the source now offers (a key, a quality code). Nothing anyone sees changes, so emit no changed event; the only visible difference is that the flag disappears.
- **Partly converged.** Some fields agree and others don't. Retire the override only for the fields that agree; the rest stay overridden and in review.
- **Diverged.** The source still disagrees, or now disagrees differently. Keep the override, record the new answer, and if the source's answer changed, show it to a person, because something real may have moved.

Retiring matters because an override that lives forever blocks legitimate change later: a boundary that really moves, a product that really is reformulated. Review overrides in bulk now and then too. A cluster of them in one region or from one supplier usually means the source changed, not that a hundred people made the same mistake.

## Licensed Data

Data you buy or receive comes with terms, and the terms differ per source. Google's Address Validation policies generally restrict storing its content "except for the place ID which can be stored indefinitely" ([Google: Address Validation policies](https://developers.google.com/maps/documentation/address-validation/policies)). Smarty's terms for its high-accuracy geocodes allow keeping them "only during the Subscription Term" and require deleting copies within 30 days after it ends ([Smarty: Product Terms](https://www.smarty.com/legal/product-terms)). A purchased contact list may permit service messages and forbid marketing.

So the license is a property of each observation, not of the entity:

- **Every imported row carries its source and license,** and a `license_expires_at` where the terms set one.
- **A scheduled job refreshes or drops** observations whose license has lapsed, then recomputes survivorship. What you own (a customer's own entry, a measurement your staff took, a seller's correction, a reviewer's decision) is untouched.
- **Survivorship can't pick what you may not use.** If a field's only source is an observation licensed for internal use, it doesn't flow into an export, a partner feed or a [data pipeline](/docs/architecture/data-pipelines) that leaves the company.
- **Ending a contract is a data event.** Know before signing which observations disappear with the vendor, and what replaces them.

## Checklist

- **Store observations, derive the record.** Each source's answer is a dated row with its source key and license; the entity is computed from them.
- **Keep a crosswalk** of every source's key, as text, dated, with the reason each link was made.
- **Choose per field.** Written survivorship rules, applied in one place, with the winning observation recorded for every field.
- **Match before you create:** exact key, then standardized key, then fuzzy matching with gates that veto false matches.
- **Use review bands.** Auto-link above, review in the middle, create below; store "not a match" decisions and measure the false merge rate.
- **Reconcile backlogs as record linkage,** with a Fellegi-Sunter tool such as Splink, and write results as links and recorded merges.
- **Make merges recorded and reversible,** with tombstones that redirect, the re-pointing list, a merge event, and never across tenants.
- **Let overrides retire** field by field once sources converge.
- **Track licenses per observation** and enforce expiry with a job.

## References

**Specifications**

- [RESO Data Dictionary: ListingKey](https://dd.reso.org/DD2.0/Property/ListingKey/), local keys versus source and originating system keys in listing feeds
- [Fellegi & Sunter: A Theory for Record Linkage](https://cs.cornell.edu/~shmat/courses/cs6434/fellegi-sunter.pdf), the 1969 model with link, non-link and possible link decisions at stated error levels (Journal of the American Statistical Association, vol. 64)

**Reference**

- [Splink](https://moj-analytical-services.github.io/splink/index.html), open-source probabilistic record linkage without labelled data, on DuckDB or Spark
- [Splink: The Fellegi-Sunter model](https://moj-analytical-services.github.io/splink/topic_guides/theory/fellegi_sunter.html), m and u probabilities and additive match weights
- [Splink: Term frequency adjustments](https://moj-analytical-services.github.io/splink/topic_guides/comparisons/term-frequency.html), weighting common and rare values differently
- [PostgreSQL: pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html), trigram similarity, thresholds and GIN and GiST indexes
- [Google: Place IDs](https://developers.google.com/maps/documentation/places/web-service/place-id), place IDs that change over time and the 12-month refresh advice
- [Google: Address Validation policies](https://developers.google.com/maps/documentation/address-validation/policies), storage restrictions and indefinitely storable place IDs
- [Smarty: Product Terms](https://www.smarty.com/legal/product-terms), internal use, retention during the subscription term and deletion of high-accuracy geocode data
- [Overture Maps: Addresses](https://docs.overturemaps.org/guides/addresses/), an open dataset whose address IDs aren't yet stable
