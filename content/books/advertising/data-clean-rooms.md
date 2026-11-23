+++
title = "Data Clean Rooms"
description = "Clean room models, PAIR and ADMaP, AWS Clean Rooms, Snowflake, Ads Data Hub and Amazon Marketing Cloud, thresholds, differential privacy and query logs."
category = "Advertising Industry"
order = 2930
part = "Identity and Audiences"
tags = ["advertising", "ad-tech", "clean-rooms", "privacy", "measurement", "data-model"]
+++

A data clean room is an environment where two or more companies run agreed computations over each other's data without either seeing the other's records. An advertiser and a publisher want to know how many of the advertiser's customers saw the publisher's campaign and bought; a retailer wants to sell an audience of its shoppers to a brand without handing over the list; a streaming service wants to show a buyer reach and frequency against the buyer's CRM. Each side contributes a table keyed on some identifier, the room enforces rules about which joins and which outputs are allowed, and what comes out is an aggregate, a noised number, or a list that only one party may activate.

It is hard because "without seeing the other's records" is a property of the outputs, not of the setting. An aggregate over five people can identify one of them; two aggregates that differ by one person identify that person; a list of overlapping users is the overlap. So every clean room is a set of controls: which columns can be joined on, which functions are allowed, the minimum number of people behind each output row, noise added to results, a budget on how much can be learned over time, approval of the queries themselves, and logs of everything run. Those controls differ by vendor, they interact with consent and with each party's contracts, and the outputs then have to land in measurement and targeting systems that were built for row-level data.

This chapter covers what a clean room is and the deployment models, the IAB Tech Lab's guidance and the PAIR and ADMaP protocols (PAIR replaced Open Private Join and Activation), the controls the main platforms document (AWS Clean Rooms, Snowflake, Google Ads Data Hub, Amazon Marketing Cloud), minimum aggregation thresholds and differential privacy in practice, the common use cases, and the records a party keeps so it can show what was computed over its data. It extends `organizations` and `conversions` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). Identifiers used as join keys are Identifiers After Cookies; audiences that come out of a clean room are First-Party Data & Audiences; lift and attribution methods run inside one are Attribution and Incrementality & Lift; retail media clean rooms from the network's side are Retail Media Networks. The generic rules that a hashed or pseudonymous key is still personal data and that aggregates can leak are in [Pseudonymous Is Not Anonymous](/docs/telemetry/consent-and-privacy#pseudonymous-is-not-anonymous).

## How the Platforms Do It

As of November 2026, from each platform's documentation and IAB Tech Lab's pages.

| Platform or standard | Model | Output controls | Privacy over time |
| --- | --- | --- | --- |
| **Amazon Marketing Cloud** | "A suite of marketing tools and services offered by Amazon Web Services", with advertisers' CRM and first-party data integrated | Custom audience segments and campaign analysis; Amazon's public guide gives no numeric threshold | Not documented in the public guide |
| **AWS Clean Rooms** | Cloud-native collaborations; each member's data stays in its own account | Aggregation rule (COUNT, SUM, AVG; equality INNER JOINs; minimum COUNT DISTINCT per output, at least 2); list rule for row-level overlap; custom rules with minimum aggregation thresholds of 2 to 100,000 | Differential privacy with a privacy budget and noise per query |
| **Google Ads Data Hub** | Google-hosted queries over Google's ad event data joined with the advertiser's | About 20 users per row with noise injection; about 50 with legacy difference checks; about 10 for click and conversion only queries | A data access budget per piece of data |
| **IAB Tech Lab** | Guidance v1.0; PAIR for matching across rooms; ADMaP for attribution | Recommended practices, not enforcement | Not specified |
| **Snowflake** | Data sharing within Snowflake, plus Snowflake Data Clean Rooms templates | Aggregation policies with a minimum group size; undersized groups merged into a remainder group | Differential privacy policies with per-user budgets and refresh periods |

Three patterns run through the table:

- **Every platform thresholds outputs, and the numbers differ by an order of magnitude.** AWS lets the data owner choose from 2 to 100,000, Google uses about 20 with noise, Snowflake lets the owner set a minimum group size. A threshold is a contract term, not a constant.
- **Noise and budgets replace hand-checked queries.** Google calls difference checks "legacy" and recommends noise injection; AWS and Snowflake offer differential privacy with budgets. The shift is from blocking suspicious queries to bounding what any sequence of queries can reveal.
- **The match is the first computation.** Every collaboration starts by joining on an identifier, and interoperability between rooms run by different parties needs a protocol for matching without exchanging keys, which is what PAIR is.

## What a Clean Room Is, and the Models

IAB Tech Lab describes clean rooms as "mechanisms to facilitate data sharing for organizations with first party data", and released Data Clean Rooms: Guidance and Recommended Practices, Version 1.0, which its page dates to July 2024. The common deployment models:

- **Walled-garden hosted.** The platform holds its own ad data and lets advertisers run constrained queries against it joined with their uploads: Google Ads Data Hub, Amazon Marketing Cloud, and similar offerings from other large platforms. One party writes the rules, and the advertiser cannot take event-level data out.
- **Cloud-native collaboration.** A cloud provider runs the computation over tables that stay in each party's own account, with rules each data owner attaches to its own tables: AWS Clean Rooms, Snowflake's data clean rooms. Rules are symmetric in principle; who may query and who receives results are roles.
- **Independent clean room vendors.** Software that runs on top of the clouds or in its own infrastructure, often adding identity resolution, templates and activation connectors.
- **Trusted execution and cryptographic matching.** Computation inside a trusted execution environment (TEE) whose code both parties attest, or private set intersection and commutative encryption so the parties learn only the intersection or an aggregate. PAIR and ADMaP use these.

What every model shares is the shape of a collaboration: members, each with a role (contributes data, may query, receives results, pays), configured tables with rules, a set of allowed analyses (sometimes pre-approved templates), and logs of every query and output.

## IAB Tech Lab: PAIR, ADMaP and the End of OPJA

**PAIR** (Publisher Advertiser Identity Reconciliation) is "a privacy-centric approach to enable advertisers and publishers to reconcile their first-party data" for advertising without third-party cookies. It was originally developed by the Google Ads team and donated to IAB Tech Lab, where the Rearc Addressability and PETs Working Group developed it as an open industry standard. It uses commutative cryptography, "which makes it possible to match the multiple-encrypted join keys" without decrypting them to cleartext, so clean rooms run by different administrative parties can interoperate; the specification also covers TEE operations. Version 1.0 was finalized in January 2025; Tech Lab's clean room page says "PAIR version 1.1 was finalized in July 2025", adding an Open PAIR module for Prebid integration.

The mechanics of commutative encryption explain why PAIR works without a shared key. If each party has a secret key and encryption commutes, an email hashed and encrypted by the advertiser and then by the publisher equals the same email encrypted by the publisher and then by the advertiser. Each side encrypts its own list, sends it to the other to encrypt again, and compares the doubly encrypted values: matches are customers in common, and neither side ever holds the other's plaintext or its key. The publisher can then recognize the advertiser's matched customers on its own inventory through an identifier derived from the match, without the advertiser's list leaving the advertiser's room in usable form.

**OPJA** (Open Private Join and Activation), the Tech Lab specification released with the first clean room guidance, is superseded: Tech Lab says it "has ceased to support" OPJA now that PAIR is "the designated standard", and its clean room page lists OPJA v1.0 as deprecated as of July 2025. Documents and vendor pages that still describe OPJA as current are out of date.

**ADMaP** (Attribution Data Matching Protocol) 1.0, finalized in February 2025 per Tech Lab's page, applies privacy-enhancing technologies such as private set intersection and TEEs to attribution: matching ad exposures on one side with conversions on the other. Attribution covers how its outputs are used.

## The Controls Platforms Document

**AWS Clean Rooms.** A data owner attaches one analysis rule to each configured table:

- **Aggregation.** Queries may use only `COUNT`, `SUM` and `AVG`, join with `INNER JOIN` on equality only, and may not use subqueries, CTEs, `UNION` or `LIMIT`. The output constraint is a minimum `COUNT(DISTINCT column)` per output row, with a minimum of 2, so the owner can require, say, that every row reflects at least 100 distinct users.
- **List.** Queries output "row-level lists of the overlap" between the owner's table and the querying member's, for enrichment and audience building. `SELECT DISTINCT` is required, at least one `INNER JOIN` to a table the querying member owns is required (directly or transitively), only columns designated `joinColumns` may be joined on and only `listColumns` selected or filtered, a column cannot be both, and subqueries, CTEs, `GROUP BY`, `HAVING` and `ORDER BY` are not supported.
- **Custom.** Arbitrary SQL that the data owner approves (reviewing each new analysis, or allowing any analysis by named collaborators), with optional minimum aggregation thresholds: `minimumIdentityCount` from 2 to 100,000, per-column overrides (0 exempts a column), and a `LEFT ANTI JOIN` against a protected right-hand table rejected.
- **Differential privacy** (on custom rules). AWS adds "a carefully calibrated amount of noise to query results at runtime", using the SampCert sampler, and limits the number of queries by a "Privacy budget" and the "Noise added per query"; it tracks the estimated remaining queries "similar to the gas gauge in a car". A member cannot join tables from two providers that both have differential privacy on, and differential privacy cannot be combined with minimum aggregation thresholds.

The list rule's example in AWS's documentation shows the shape of a typical enrichment collaboration: company A's CRM table and company B's segment table both declare an identifier from an identity vendor as a join column, company B allows its segments as list columns, and A queries for its internal IDs with B's segments for the overlap, with both parties reviewing query logs afterward.

**Snowflake.** An aggregation policy is "a schema-level object that controls what type of query can access data from a table or view": queries must aggregate into groups of a minimum size, allowed functions are `AVG`, `COUNT` (including `DISTINCT`), `HLL` and `SUM`, and groups below the minimum are merged into a remainder group whose key "is NULL". Window functions, recursive CTEs, `ROLLUP`, `CUBE` and `GROUPING SETS` are blocked, and most set operators except `UNION ALL`. Pairing a policy with an entity key protects an entity "even if information about that entity appears in multiple rows". Snowflake's differential privacy uses a schema-level privacy policy with a per-user privacy budget and refresh period, privacy domains, noise added once per query, and treats row counts as public; Snowflake Data Clean Rooms define collaborations in YAML with JinjaSQL templates. The policy features need Enterprise Edition.

**Google Ads Data Hub.** Every result row needs enough users: "Noise injection requires approximately 20 unique users per result row", difference checks about 50, and queries over click and conversion data only about 10. Rows below the threshold are filtered, events with zeroed or null user IDs don't count toward it, noised `COUNT`s come back as non-negative integers, and each piece of data has an access budget, with a `DATA_ACCESS_BUDGET_IS_NEARLY_EXHAUSTED` notice as it runs out. Difference checks, which filter rows that would reveal a difference between overlapping results, are the legacy mode Google says "often leads to significant and unpredictable data redaction". The figure "50 users" often quoted for Ads Data Hub applies only to that legacy mode.

**Amazon Marketing Cloud.** Amazon describes AMC as "a suite of marketing tools and services offered by Amazon Web Services (AWS)" in which advertisers integrate CRM and first-party data, build custom audience segments and analyze campaigns. Amazon's public guide does not publish an aggregation threshold, and the "100" sometimes cited comes from AWS Clean Rooms examples, a different product. <!-- source-gap: adv-amc-aggregation-threshold | missing | Amazon Marketing Cloud's minimum aggregation threshold per output row | closes with: an Amazon Ads public documentation page stating AMC's aggregation threshold | checked: 2026-11-22 -->

## Thresholds and Differential Privacy in Practice

A minimum aggregation threshold says each output row must reflect at least k distinct people. It stops the simplest leak (a row describing one person) and not the next one: two queries whose populations differ by one person, each above k, differ by that person's contribution. Difference checks tried to catch such pairs; noise addresses all of them at once.

Differential privacy bounds how much any one person's data can change a result. A mechanism with privacy loss epsilon guarantees that the probability of any output changes by at most a factor of e to the epsilon when one person is added or removed; noise scaled to a query's sensitivity divided by epsilon achieves it for counts and sums. Each query spends some epsilon, the total over a collaboration or period is the budget, and when the budget is spent the data cannot be queried again until it refreshes. The practical consequences:

- **Noise is per query, so precision has a price.** A count of 35 can return 38 (Google's own example); small segments become unusable before large ones. Analysts break results into fewer, larger cells.
- **Budgets make query plans a product decision.** A collaboration that will measure twelve weekly results needs to budget for twelve, and an exploratory query spends the same budget as the production one.
- **Thresholds and noise don't stack freely.** AWS does not allow differential privacy and minimum aggregation thresholds on the same rule, and does not allow joining two differentially private providers; designs that assume both are wrong for that platform.
- **Row counts may be public.** Snowflake treats row counts as public under its differential privacy; a design that relies on hiding the size of a table must check what the platform reveals.

A threshold step with a remainder group, the behavior Snowflake documents, applied by a party that post-processes its own outputs before sharing them:

```go tab="Go"
type Cell struct {
	Key         string // e.g. "campaign=123|region=US-CA"; empty for the remainder
	DistinctIDs int64  // distinct people behind the cell
	Conversions int64
}

// Suppress merges every cell below k distinct people into one remainder
// cell with an empty key, and drops the remainder too if it is below k.
func Suppress(cells []Cell, k int64) []Cell {
	out := make([]Cell, 0, len(cells))
	var rest Cell
	for _, c := range cells {
		if c.DistinctIDs >= k {
			out = append(out, c)
			continue
		}
		rest.DistinctIDs += c.DistinctIDs // an upper bound: people may repeat across cells
		rest.Conversions += c.Conversions
	}
	if rest.DistinctIDs >= k {
		out = append(out, rest)
	}
	return out
}
```

```rust tab="Rust"
#[derive(Clone, Debug, Default)]
pub struct Cell {
    pub key: String,      // e.g. "campaign=123|region=US-CA"; empty for the remainder
    pub distinct_ids: i64, // distinct people behind the cell
    pub conversions: i64,
}

/// Merges every cell below k distinct people into one remainder cell with an
/// empty key, and drops the remainder too if it is below k.
pub fn suppress(cells: &[Cell], k: i64) -> Vec<Cell> {
    let mut out = Vec::with_capacity(cells.len());
    let mut rest = Cell::default();
    for c in cells {
        if c.distinct_ids >= k {
            out.push(c.clone());
        } else {
            rest.distinct_ids += c.distinct_ids; // upper bound: people may repeat across cells
            rest.conversions += c.conversions;
        }
    }
    if rest.distinct_ids >= k {
        out.push(rest);
    }
    out
}
```

The comment matters: summing distinct counts across cells overstates the remainder's distinct people when a person appears in several cells, so a remainder computed this way can pass a threshold it should fail. The platforms compute the remainder's distinct count from the underlying rows; a party doing it after the fact should recompute from rows or treat the remainder as suppressed.

## What Clean Rooms Are Used For

- **Overlap and reach.** How many of the advertiser's customers the publisher can reach, and the incremental reach of a campaign over another, as aggregates.
- **Measurement and attribution.** Exposures on the publisher's side joined to conversions on the advertiser's, reported as aggregate conversions, conversion rates or lift by campaign and segment. The output is an aggregate with a threshold and possibly noise; it is never a set of `conversions` rows, and it lands as an aggregate result attached to the campaign (Attribution and Incrementality & Lift cover the methods).
- **Audience activation.** The overlap, or a model built over it, is turned into a targetable audience on one side's platform without the other side receiving the list: a list rule in AWS, an audience output in a walled-garden room, a PAIR match on a publisher. First-Party Data & Audiences covers the audience record.
- **Enrichment.** One party's attributes attached to the other's overlapping records, which is row-level disclosure of personal data to the receiving party under its contracts and the law, the most sensitive use and the one regulators would recognize as sharing.
- **Retail and commerce media.** A retailer's shopper and sales data with a brand's exposures or CRM, the standard measurement offer of a retail media network (Retail Media Networks).

A clean room does not change who is a controller or whether there is a sale. Joining two parties' personal data on a hashed email is processing by both under the GDPR, and activating the overlap can be a sale or a share under US state laws (US State Privacy Law for Advertising); the room limits outputs, not legal roles, and each party still needs a lawful basis and honors opt-outs before contributing a person's row ([Lawful Bases](/docs/compliance/gdpr#lawful-bases)).

## How to Build It

The core model has `organizations` (every member of a collaboration is one) and `conversions` (row-level outcomes). A clean room adds records of the collaboration itself, each member's role, the tables each contributed and the rules on them, every query run with what it returned and suppressed, and the privacy budget spent. The aggregate outputs are stored as aggregates, linked to the campaign or line item they measure, never written into `conversions`.

```sql
CREATE TABLE clean_room_collaborations (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  platform_org_id    UUID NOT NULL REFERENCES organizations (id),  -- AWS, Snowflake, Google, Amazon, a vendor
  external_ref       TEXT,                 -- the platform's collaboration ID
  name               TEXT NOT NULL,
  purpose            TEXT NOT NULL CHECK (purpose IN ('overlap', 'measurement', 'attribution',
                       'audience_activation', 'enrichment', 'modeling')),
  agreement_ref      TEXT NOT NULL,        -- the data collaboration agreement version
  match_method       TEXT NOT NULL CHECK (match_method IN ('hashed_email', 'raw_uid2', 'rampid',
                       'pair', 'platform_id', 'other')),
  privacy_mode       TEXT NOT NULL CHECK (privacy_mode IN ('threshold', 'differential_privacy',
                       'difference_checks', 'list')),
  min_distinct_people INT CHECK (min_distinct_people >= 2),  -- the agreed threshold, if any
  status             TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'ended')),
  started_at         TIMESTAMPTZ,
  ended_at           TIMESTAMPTZ
);

CREATE TABLE clean_room_members (
  collaboration_id   UUID NOT NULL REFERENCES clean_room_collaborations (id),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  can_query          BOOLEAN NOT NULL DEFAULT FALSE,
  receives_results   BOOLEAN NOT NULL DEFAULT FALSE,
  contributes_data   BOOLEAN NOT NULL DEFAULT FALSE,
  pays_compute       BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at          TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (collaboration_id, organization_id)
);

CREATE TABLE clean_room_datasets (       -- a table one member contributed, with its rule
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  collaboration_id   UUID NOT NULL REFERENCES clean_room_collaborations (id),
  owner_org_id       UUID NOT NULL REFERENCES organizations (id),
  name               TEXT NOT NULL,
  rule_kind          TEXT NOT NULL CHECK (rule_kind IN ('aggregation', 'list', 'custom',
                       'platform_default')),
  rule               JSONB NOT NULL,       -- join columns, list columns, allowed functions, thresholds
  join_columns       TEXT[] NOT NULL,
  min_distinct_people INT CHECK (min_distinct_people >= 2),
  differential_privacy BOOLEAN NOT NULL DEFAULT FALSE,
  row_count_at_load  BIGINT,
  consent_filter_ref TEXT NOT NULL,        -- which consent and opt-out filter produced the rows
  loaded_at          TIMESTAMPTZ NOT NULL,
  retired_at         TIMESTAMPTZ,
  CHECK (NOT (differential_privacy AND min_distinct_people IS NOT NULL))
                                           -- AWS: DP and minimum thresholds don't combine
);

CREATE TABLE privacy_budgets (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  collaboration_id   UUID NOT NULL REFERENCES clean_room_collaborations (id),
  dataset_id         UUID REFERENCES clean_room_datasets (id),  -- null: collaboration-wide
  epsilon_total_micros BIGINT NOT NULL CHECK (epsilon_total_micros > 0),  -- epsilon x 1,000,000
  epsilon_spent_micros BIGINT NOT NULL DEFAULT 0 CHECK (epsilon_spent_micros >= 0),
  period             TEXT NOT NULL CHECK (period IN ('collaboration', 'monthly', 'custom')),
  refreshes_at       TIMESTAMPTZ,
  CHECK (epsilon_spent_micros <= epsilon_total_micros)
);

CREATE TABLE clean_room_query_runs (      -- every query run, by whoever ran it
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  collaboration_id   UUID NOT NULL REFERENCES clean_room_collaborations (id),
  run_by_org_id      UUID NOT NULL REFERENCES organizations (id),
  template_ref       TEXT,                 -- the approved analysis template, if any
  query_hash         BYTEA NOT NULL,       -- SHA-256 of the SQL as run
  parameters         JSONB NOT NULL DEFAULT '{}',
  approved_by        UUID[] NOT NULL DEFAULT '{}',  -- members whose approval it carried
  campaign_id        UUID REFERENCES campaigns (id),  -- what it measured, if anything
  output_kind        TEXT NOT NULL CHECK (output_kind IN ('aggregate', 'list', 'audience',
                       'model')),
  rows_returned      INT,
  rows_suppressed    INT,                  -- filtered below threshold or merged into remainder
  epsilon_spent_micros BIGINT NOT NULL DEFAULT 0,
  privacy_budget_id  UUID REFERENCES privacy_budgets (id),
  result_location    TEXT,                 -- where the output was written; never conversions
  status             TEXT NOT NULL CHECK (status IN ('submitted', 'rejected', 'running',
                       'succeeded', 'failed')),
  rejection_reason   TEXT,                 -- e.g. 'analysis rule: subquery not allowed'
  started_at         TIMESTAMPTZ NOT NULL,
  finished_at        TIMESTAMPTZ,
  CHECK (epsilon_spent_micros = 0 OR privacy_budget_id IS NOT NULL)
);
```

Spending a budget is a transaction: the run is recorded and the budget decremented together, and a run that would exceed it is rejected before it starts:

```sql
-- Reserve epsilon for a run; zero rows updated means the budget would be exceeded.
UPDATE privacy_budgets
SET epsilon_spent_micros = epsilon_spent_micros + $2
WHERE id = $1
  AND epsilon_spent_micros + $2 <= epsilon_total_micros
RETURNING epsilon_total_micros - epsilon_spent_micros AS remaining_micros;
```

Design notes:

- **The collaboration is a contract with a record.** Purpose, agreement version, match method, privacy mode and threshold are columns, so the question of what each party was allowed to compute is answered from data, and a collaboration's rules can be compared with what its query log shows.
- **Rules belong to the data owner and travel with the dataset.** `clean_room_datasets.rule` mirrors what the platform enforces (AWS's analysis rule, Snowflake's policy), and the dataset records which consent filter produced its rows, because a person who opted out must not be contributed in the first place.
- **Every run is logged by its hash, with its outcome.** Rejected queries are kept with the reason; succeeded queries keep rows returned and suppressed. Suppression counts are the early warning that a collaboration is slicing too finely to be useful.
- **Epsilon is an integer.** Budgets are stored in micros of epsilon, the same integer discipline as money, so sums across many runs are exact; the platform's own gauge is authoritative and this record is the party's copy.
- **Aggregates never become rows.** A clean room conversion count lands at `result_location` (a measurement results table keyed by campaign and period, owned by Attribution) and is labeled as aggregate and possibly noised; writing it into `conversions` would invent row-level outcomes that never existed.
- **Lists are disclosures.** An `output_kind` of `list` or `audience` is row-level output to a member, recorded as such and checked against the collaboration's purpose; an enrichment run is the moment personal data moves, and the record of it is what a regulator or a partner audit asks for.
- **Join keys are identifiers with their own rules.** A collaboration matching on raw UID2s follows UID2's participant terms and rotation; one matching on hashed emails follows each party's normalization; PAIR matches on encrypted keys. Identifiers After Cookies owns those rules, and `match_method` records which applied.

## Auditing

- **Every collaboration and its terms.** Members and roles, agreement version, purpose, match method, privacy mode and thresholds, with start and end, so a party can show what it agreed to.
- **What each party contributed.** Each dataset version with its rule, row count, consent filter and load time, so an opt-out can be shown to have been excluded.
- **Every query, approved or rejected.** Query hash, template, parameters, approvals, outcome, rows returned and suppressed, and privacy budget spent. AWS's own example has both parties review query logs; the records here are a party's own copy, kept as long as its contracts require.
- **Where every output went.** Aggregates to measurement results, lists and audiences to which platform, under which purpose.

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Treat outputs, not the room, as the privacy boundary.** Thresholds, noise and budgets on outputs are what keep a clean room private; the environment alone does not.
- **Make the threshold a negotiated, recorded term.** AWS allows 2 to 100,000, Google uses about 20 with noise, Snowflake lets the owner choose; write down the number each collaboration uses.
- **Prefer noise with a budget over difference checks.** Google calls difference checks legacy for a reason; budget queries in advance and spend epsilon transactionally.
- **Use PAIR, not OPJA, for cross-room matching.** OPJA is deprecated; PAIR is the Tech Lab standard, and ADMaP covers attribution matching.
- **Filter for consent before contributing.** A clean room does not change controllers, sales or lawful bases; people who opted out never enter the dataset.
- **Keep aggregates as aggregates.** Clean room measurement results are noised, thresholded counts tied to campaigns and periods, never `conversions` rows.
- **Record lists as the disclosures they are.** Enrichment and audience outputs move personal data; log them with purpose and destination.

## References

**Specifications**

- [IAB Tech Lab: Data Clean Rooms](https://iabtechlab.com/datacleanrooms), the Guidance and Recommended Practices v1.0, OPJA deprecated, PAIR 1.1 finalized July 2025 and ADMaP 1.0 finalized February 2025
- [IAB Tech Lab: PAIR](https://iabtechlab.com/pair/), the protocol, commutative cryptography, TEE operations, v1.0 January 2025, the Open PAIR Prebid module and OPJA superseded

**Reference**

- [AWS Clean Rooms: Aggregation analysis rule](https://docs.aws.amazon.com/clean-rooms/latest/userguide/analysis-rules-aggregation.html), allowed functions and joins, disallowed constructs and the minimum COUNT DISTINCT output constraint
- [AWS Clean Rooms: List analysis rule](https://docs.aws.amazon.com/clean-rooms/latest/userguide/analysis-rules-list.html), row-level overlap lists, join and list columns, required joins and unsupported clauses, the enrichment example
- [AWS Clean Rooms: Custom minimum aggregation thresholds](https://docs.aws.amazon.com/clean-rooms/latest/userguide/custom-min-agg-thresholds.html), minimumIdentityCount from 2 to 100,000, per-column overrides and rejected anti joins
- [AWS Clean Rooms: Differential Privacy](https://docs.aws.amazon.com/clean-rooms/latest/userguide/differential-privacy.html), noise at runtime, SampCert, privacy budget and noise per query, and the two-provider join limit
- [Snowflake: Aggregation policies](https://docs.snowflake.com/en/user-guide/aggregation-policies), minimum group size, the NULL-keyed remainder group, allowed and blocked constructs, entity-level privacy and Enterprise Edition
- [Snowflake: Differential privacy overview](https://docs.snowflake.com/en/user-guide/diff-privacy/differential-privacy-overview), privacy policies, per-user budgets and refresh, privacy domains and public row counts
- [Snowflake: Data Clean Rooms introduction](https://docs.snowflake.com/en/user-guide/cleanrooms/introduction), YAML collaborations and JinjaSQL templates
- [Google Ads Data Hub: Privacy checks](https://developers.google.com/ads-data-hub/guides/privacy-checks), the 20, 50 and 10 user thresholds, filtered rows, noise injection, difference checks and the data access budget
- [Amazon Ads: Amazon Marketing Cloud](https://advertising.amazon.com/library/guides/amazon-marketing-cloud), what AMC is and what its public guide covers
