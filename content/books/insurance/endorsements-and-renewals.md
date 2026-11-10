+++
title = "Endorsements, Renewals & the Policy Transaction Model"
nav_title = "Endorsements"
description = "Midterm changes and pro rata deltas, out-of-sequence endorsements replayed, preemption, rewrites, renewal offers, conditional renewal, bitemporal versions."
category = "Insurance Industry"
order = 2726
part = "Policy Administration"
tags = ["insurance", "policy-administration", "endorsements", "renewals", "bitemporal", "out-of-sequence"]
+++

A policy changes all the time. A car is added in April, a driver removed in June, an address corrected back to January because the insured moved before the policy started, a deductible raised, a mortgagee replaced, and then the whole thing renews in December on new rates. Each change is a policy transaction with an effective date, and each one writes a premium difference for the time remaining. The hard part isn't any single change; it's that changes arrive out of order. An endorsement processed in July can be effective in April, before a change that was processed in May and effective in June, and the June change was priced on a policy that, as of now, never existed. The system has to reverse the later change, apply the earlier one, reapply the later one on top, and write only the net premium difference, while keeping a record of what it believed at every point along the way.

This is the core of policy administration and the reason the foundation's model makes the transaction the source and the version a view ([The Core Data Model](/books/insurance/insurance-business#the-core-data-model)). This chapter covers midterm changes and their premium deltas, out-of-sequence endorsements with a worked replay, preemption between concurrent changes, rewrites, renewal processing and offers, conditional renewal, bitemporal policy versions, and how vendors model transactions. Cancellation and reinstatement are [Cancellation, Nonrenewal & Notice Law](/books/insurance/cancellation-and-nonrenewal); the rating of each change is [How a Rate Is Built](/books/insurance/how-a-rate-is-built).

## How the Platforms Do It

As of November 2026, from public documentation:

| Platform | Transaction model | Out of sequence | Renewals |
| --- | --- | --- | --- |
| **Guidewire PolicyCenter** | "A policy can be created or modified only through the context of a policy transaction," the `Job` entity: Submission, Renewal, Policy Change, Cancellation, Reinstatement, Rewrite; a policy change can be reversed | Out-of-sequence transactions have an effective date before an earlier-processed transaction's; conflicts surface when quoting (a 400 response listing them) and are resolved per field with `acceptYours` or `discardYours`, all in one request; separately, when two jobs start from the same base period, "the first job to be bound preempts the second job," which must be updated and requoted | "A renewal is a policy transaction that creates a new term"; renewals with no material changes or underwriting issues bind automatically "at the appropriate time"; `pending-renew` and `pending-non-renew` start renewal and nonrenewal workflows; a policy change can preempt a draft or bound renewal, with changes optionally copied to it |
| **Socotra** | Issuance, Policy Change, Renewal, Cancellation, Reinstatement and Reversal transactions; each initialized transaction creates a segment for its coverage period; the policy at a time is "the policy segment that spans the given effective time"; pricing is stored on the transaction | "Clients do not need to declare a transaction as out-of-sequence; the system will identify the situation"; it issues an aggregate transaction containing at least one reversal and two new transactions, the OOS change and the reapplication of the reversed ones, so the result has "the same coverage details as if all transactions had been issued in-sequence"; change instructions for elements that no longer exist after reapplication are ignored | Auto-renewal plans create renewals `renewalCreateLeadDays` ahead and can accept and issue them; a "Do Not Renew" flag stops acceptance and issuance |

Both vendors land on the same design: transactions are first-class and immutable, the policy as of a date is derived, an out-of-sequence change is handled by reversal and reapplication rather than by editing history, and renewals are transactions created ahead of the term they start.

## Midterm Changes

An endorsement changes the policy from its effective date to the end of the term. The premium it writes is the difference in full-term premium between the new and old versions, times the share of the term remaining. North Carolina's bureau manual states the rule for auto: if an auto or coverage is added to expire with the policy, "the premium for such additional insurance shall be computed pro rata"; the same for a transfer from one auto to another; and the premium for a change in limits or deductibles is computed using "the rates and rules in effect at the inception of the policy or at the time the change is made," with the company's choice of inception or current rates applied consistently, not policy by policy (NCRB Personal Auto Manual Rule 9).

A worked endorsement, mine, using the collision premium from [How a Rate Is Built](/books/insurance/how-a-rate-is-built). An annual policy runs from 12:01 a.m. January 1, 2027 to 12:01 a.m. January 1, 2028, 365 days, issued without collision. On April 1, 2027 the insured adds collision with a $500 deductible, full-term premium $602. Days remaining: 275. Written premium: $602 × 275 / 365 = $453.56. The policy's written premium for the term is now the original premium plus $453.56; the new collision coverage earns over the 275 days from April 1. Day counts are the default; some filings use a pro rata table by days or months, which is a rate table like any other.

Small adjustments have rules of their own. Under the same manual, an amendment producing an adjustment of $2 or less may be waived or made subject to a $2 minimum (the actual return premium refunded if the insured asks); a $2 minimum applies when the insured asks for added coverage, a higher limit or a lower deductible; returns under $2 needn't be refunded on a cancellation, a lower limit or a higher deductible unless asked; and an adjustment arising within 30 days before the end of a six-month term, or 60 days before the end of a longer one, needn't be charged or refunded, except actual refunds on request. These are the kinds of rules that belong in the product configuration as named settings rather than in code, because each state and program sets them differently.

The pro rata step, in integer minor units with the term's actual day count:

```go tab="Go"
// ProRata returns the premium for the share of the term remaining after effective,
// rounded half away from zero to the minor unit.
func ProRata(termPremium int64, termStart, termEnd, effective time.Time) int64 {
	days := func(a, b time.Time) int64 {
		ay, am, ad := a.Date()
		by, bm, bd := b.Date()
		return int64(time.Date(by, bm, bd, 0, 0, 0, 0, time.UTC).
			Sub(time.Date(ay, am, ad, 0, 0, 0, 0, time.UTC)).Hours() / 24)
	}
	term := days(termStart, termEnd)
	left := days(effective, termEnd)
	num := termPremium * left
	q, r := num/term, num%term
	if 2*abs(r) >= term {
		if num >= 0 {
			q++
		} else {
			q--
		}
	}
	return q // ProRata(60200, Jan 1 2027, Jan 1 2028, Apr 1 2027) == 45356
}

func abs(x int64) int64 {
	if x < 0 {
		return -x
	}
	return x
}
```

```rust tab="Rust"
use chrono::NaiveDate;

/// Premium for the share of the term remaining after `effective`,
/// rounded half away from zero to the minor unit.
pub fn pro_rata(term_premium: i64, start: NaiveDate, end: NaiveDate, effective: NaiveDate) -> i64 {
    let term = (end - start).num_days();
    let left = (end - effective).num_days();
    let num = term_premium * left;
    let (mut q, r) = (num / term, num % term);
    if 2 * r.abs() >= term {
        q += num.signum();
    }
    q // pro_rata(60_200, 2027-01-01, 2028-01-01, 2027-04-01) == 45_356
}
```

The function takes local dates because the policy's days are local days at the risk; the conversion from the stored instants happens once, in the zone the policy records ([Quote, Bind & Issue](/books/insurance/quote-bind-and-issue)).

## Out-of-Sequence Endorsements

An endorsement is out of sequence when its effective date is earlier than that of a transaction already processed, as Guidewire defines it. The correct result is the one an in-sequence history would have produced, and the only safe way to get it is to reverse every transaction effective after the new one, apply the new one, and reapply the reversed ones on top, which is exactly the aggregate Socotra issues.

A worked replay, mine, on the policy above (365-day term from January 1, 2027, premium $1,444 for car 1 at issue).

1. **T2, processed March 10, effective June 1:** add car 2, full-term premium $900 in the current territory. Days remaining 214. Written: $900 × 214 / 365 = **$527.67**.
2. **T3, processed July 15, effective April 1 (out of sequence):** the insured reports moving on April 1 to a territory where car 1's full-term premium is $1,600 and car 2's would be $990.

The replay, as one aggregate transaction:

| Step | Effective | Change | Days | Written premium |
| --- | --- | --- | --- | --- |
| Reverse T2 | June 1 | Remove car 2 at $900 | 214 | **-$527.67** |
| Apply T3 | April 1 | Car 1 from $1,444 to $1,600 | 275 | $156 × 275 / 365 = **$117.53** |
| Reapply T2 on T3's state | June 1 | Add car 2 at $990 (new territory) | 214 | $990 × 214 / 365 = **$580.44** |
| **Net written by the aggregate** | | | | **$170.30** |

Check: had the moves been processed in order, the term would carry $117.53 for the move and $580.44 for car 2, $697.97 in all; T2 originally wrote $527.67, so the aggregate must write $697.97 - $527.67 = $170.30, which it does. Every row is a premium entry with its own earning window (the reversal un-earns from June 1, the move earns from April 1), so earned premium as of any date rebuilds correctly, and the accounting date of all three rows is July 15, the day the system learned of the move.

What can go wrong in a replay, and what the vendors do about it:

- **Conflicting field changes.** If T2 had also changed car 1's garaging address and T3 changes it differently, reapplying T2 would overwrite T3. Guidewire reports the conflicts at quote time and makes the user choose per field; its documentation's example shows a date of birth changed in three transactions, with the latest value winning under `acceptYours`.
- **Reapplying a change to something that no longer exists.** If the backdated change removed the car the later change modified, Socotra ignores change instructions "for elements that no longer exist as a result of reapplied transactions."
- **Rerating with which rates?** The reapplied transactions rate on the same basis (inception or current rates) the product's election says, not on whatever is current at replay time, unless the election is current rates.
- **Downstream effects.** Commissions, cessions, taxes and statistical records follow the premium entries, so they reverse and reapply too; a replay that rewrites premium without them leaves the agent's statement and the reinsurer's bordereau wrong ([Commissions & Agency Accounting](/books/insurance/commissions-and-agency-accounting); [Reinsurance Operations](/books/insurance/reinsurance-operations)).

## Preemption

Two people can start changes from the same version at once: an agent adds a driver while an underwriter changes a deductible. Guidewire calls this preemption: "the first job to be bound preempts the second job," attempts to bind the preempted job fail, and it must be updated to include the first job's changes and requoted. The same applies between a midterm change and an already-created renewal: a policy change can preempt a draft or bound renewal, and the changes can be copied to the renewal, which must then be requoted. The general mechanism is optimistic concurrency on the base version: every job records the version it started from, binding checks that the base is still the latest, and a stale job is rebased, not silently merged.

## Rewrites

A rewrite replaces a policy, or the remainder of a term, with a new term or a new policy rather than endorsing it. Carriers rewrite when a change can't be expressed as an endorsement: a move to another underwriting company in the group, a new product version that can't be reached midterm, a change of named insured, or a reinstatement after a long lapse. Guidewire models rewrite (and rewrite to a new account) as its own job type. In data, a rewrite is a cancellation of the old term at the rewrite date (pro rata, since it is the insurer's transaction) and a new business or renewal term from the same moment, linked so that claims, loss history and the insured's tenure carry across.

## Renewals

A renewal is a new term created before the current one ends. The renewal job runs in stages, each with a clock set by notice law:

1. **Create** the renewal transaction ahead of expiration: Socotra's auto-renewal plans use `renewalCreateLeadDays`; the lead time has to exceed the longest notice period the renewal might need.
2. **Underwrite**: re-run eligibility and referrals on current rules, order fresh reports where the product refreshes them (motor vehicle records, credit at the refresh interval), and decide renew, renew with changes, or nonrenew. Referral reasons attached to the policy midterm surface here ([Underwriting Rules, Referrals & Models](/books/insurance/underwriting)).
3. **Rate** on the product version and tables effective for renewals on the renewal date (`renewal_from`), with telematics or other earned adjustments that apply at renewal.
4. **Offer and notify** within the required lead time: a renewal offer with the premium, and any change notice or nonrenewal notice.
5. **Bind** on payment or automatically: Guidewire binds renewals with no material changes or underwriting issues automatically; renewals with issues need someone to act.

Lead times for the offer, from state law ([Cancellation, Nonrenewal & Notice Law](/books/insurance/cancellation-and-nonrenewal) has the full notice rules):

| State | Rule |
| --- | --- |
| **California, auto** | Renewal offer (may be verbal) at least 20 days before expiration; written nonrenewal at least 30 days before; if the insurer fails, the existing policy stays in effect, unchanged, for 30 days after the offer or notice is delivered or mailed (Ins. Code 663) |
| **California, residential** | Renewal offer at least 45 days before expiration, contingent on payment and disclosing any reduction of limits or elimination of coverage; nonrenewal at least 75 days before for policies expiring on or after July 1, 2020, or the policy continues unchanged for 75 days after a late notice (Ins. Code 678) |
| **Texas, personal auto and residential** | Unless the insurer mailed a nonrenewal or a renewal "with written notice of change in coverage" by the 60th day before expiration, it must renew on the insured's request (Ins. Code 551.105) |
| **New York, personal auto and personal lines** | Nonrenewal or conditional renewal notice at least 45 and not more than 60 days before the end of the policy period, with reasons (Ins. Law 3425(d)) |
| **New York, commercial** | Nonrenewal or conditional renewal at least 60 and not more than 120 days before expiration (30 days for excess and jumbo risks); a premium increase over 10% (excluding exposure, experience and audit changes) is a conditional renewal; a late notice keeps coverage on the expiring terms, at the lower of current or prior rates, until 60 days after it is sent (Ins. Law 3426(e)) |

### Conditional Renewal

A conditional renewal offers to renew on changed terms: a higher deductible, a reduced limit, an excluded driver, or (in New York commercial lines) a premium increase above 10% for reasons other than exposure, experience or audit. It is a notice with the same timing rules as a nonrenewal in New York, and the renewal job must treat "renew with changes" as a separate outcome with its own document, not as a quiet renewal at new terms. California's residential rule, requiring the offer to disclose any reduction of limits or elimination of coverage, is the same idea in another form.

## Bitemporal Policy Versions

Each transaction produces policy versions with two time ranges: **effective**, when the version describes the coverage, and **recorded**, when the system held it to be true ([Two Kinds of Time](/docs/database/temporal-data#two-kinds-of-time)). The replay above, as versions on car 1's policy:

| Version | Produced by | Effective | Recorded |
| --- | --- | --- | --- |
| v1 | New business | Jan 1, 2027 to Jan 1, 2028 | From issue (Dec 2026) to Mar 10 |
| v1' | T2 | Jan 1 to Jun 1 | Mar 10 to Jul 15 |
| v2 | T2 | Jun 1 to Jan 1, 2028 (two cars) | Mar 10 to Jul 15 |
| v1'' | Aggregate | Jan 1 to Apr 1 (old territory, one car) | From Jul 15 |
| v3 | Aggregate | Apr 1 to Jun 1 (new territory, one car) | From Jul 15 |
| v4 | Aggregate | Jun 1 to Jan 1, 2028 (new territory, two cars) | From Jul 15 |

Two queries make the model useful. **What was covered on a date, as the system knows it now** (a claim reported today for a May 15 loss): the version whose effective range contains May 15 and whose recorded range contains now, which is v3. **What did the system believe on a past date** (an examiner asking what the policy showed when the July 1 ID cards were printed): the version whose recorded range contains July 1, which for May 15 is v1'. Neither question is answerable from a policy row that was updated in place, and both get asked: the first by claims every day, the second by courts and regulators when something went wrong.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `policy_transactions` (with `out_of_sequence` and `reverses_id`), `policy_versions` (with `effective` and `recorded` ranges and an exclusion constraint) and `premium_entries`. This chapter adds the aggregate structure for replays, the base version for preemption, and `renewal_offers`.

```sql
ALTER TABLE policy_transactions
  ADD COLUMN base_version_id UUID REFERENCES policy_versions (id),  -- the version it started from
  ADD COLUMN aggregate_id    UUID REFERENCES policy_transactions (id), -- the replay it belongs to
  ADD COLUMN reapplies_id    UUID REFERENCES policy_transactions (id), -- the original it reapplies
  ADD COLUMN rate_basis      TEXT CHECK (rate_basis IN ('inception', 'current')),
  ADD COLUMN status          TEXT NOT NULL DEFAULT 'bound' CHECK (status IN ('draft', 'quoted',
                               'bound', 'withdrawn', 'preempted'));

CREATE TABLE transaction_conflicts (       -- field conflicts found during a replay
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  aggregate_id       UUID NOT NULL REFERENCES policy_transactions (id),
  path               TEXT NOT NULL,         -- 'risks[car1].attributes.garaging_zip'
  original_value     JSONB,
  values_in_conflict JSONB NOT NULL,
  resolution         TEXT CHECK (resolution IN ('accept_new', 'keep_reapplied')),
  resolved_by        UUID,
  resolved_at        TIMESTAMPTZ
);

CREATE TABLE renewal_offers (              -- one per renewal decision and notice
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  expiring_term_id   UUID NOT NULL REFERENCES policy_terms (id),
  renewal_transaction_id UUID REFERENCES policy_transactions (id),
  outcome            TEXT NOT NULL CHECK (outcome IN ('renew', 'renew_with_changes',
                       'conditional_renewal', 'nonrenew')),
  product_id         UUID NOT NULL REFERENCES products (id),  -- version for the new term
  renewal_premium    BIGINT,
  premium_change_bp  INT,                   -- for conditional renewal thresholds
  changes            JSONB,                 -- reduced limits, removed coverages, exclusions
  notice_id          UUID,                  -- notices (Cancellation, Nonrenewal & Notice Law)
  must_send_by       DATE NOT NULL,         -- from notice_rules for the state and outcome
  sent_at            TIMESTAMPTZ,
  accepted_at        TIMESTAMPTZ,
  late_extension_to  DATE                   -- coverage extended because the notice was late
);
```

An out-of-sequence replay, as steps in one database transaction:

1. Lock the policy term; find bound transactions with `effective_at` after the new one's.
2. Insert a reversal for each (`kind = 'reversal'`, `reverses_id`, negated premium entries), newest first.
3. Insert the new transaction, rated on the version effective at its date.
4. Reinsert each reversed transaction as a reapplication (`reapplies_id`) rated on the new state, recording any field conflicts for resolution before binding.
5. Close the recorded range of every superseded version at now and insert the new versions with recorded ranges from now.
6. Emit one event for the aggregate so billing, commissions, cessions and documents act on the net.

Coverage on a loss date, as known now:

```sql
SELECT pv.*
FROM policy_versions pv
WHERE pv.policy_term_id = :term_id
  AND pv.effective @> :loss_at::timestamptz
  AND pv.recorded  @> NOW();
```

## Auditing

- **Every transaction with its base version, effective and processed times, and premium entries;** reversals and reapplications linked to the originals and to their aggregate.
- **Every superseded version kept,** with recorded ranges that let any past view be rebuilt.
- **Every replay's conflicts and their resolutions,** with who resolved them.
- **Every preempted job,** and the rebase that followed.
- **Every renewal decision with its notice deadline and sent time,** and any extension a late notice caused.

## What This Means for the System You Build

- **Change policies only through immutable transactions,** each writing the pro rata difference in full-term premium for the time remaining.
- **Handle out-of-sequence changes by reversal and reapplication in one aggregate,** writing only the net and carrying commissions, cessions and taxes with it.
- **Use optimistic concurrency on the base version** and rebase preempted jobs.
- **Keep effective and recorded ranges on every version** and answer "covered on that date, as known when" with a query.
- **Create renewals early enough for the longest notice they may need,** and treat conditional renewal as its own outcome and notice.
- **Put small-adjustment rules and the inception-or-current rate election in product configuration.**

## References

**Law and regulation**

- [Cal. Ins. Code 663 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-663/), auto renewal offers 20 days and nonrenewal notices 30 days before expiration, and the 30-day continuation when late
- [Cal. Ins. Code 678 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-678/), residential renewal offers 45 days before expiration disclosing reduced limits, nonrenewal 75 days before, and the 75-day continuation
- [Tex. Ins. Code 551.105](https://texas.public.law/statutes/tex._ins._code_section_551.105), renewal on request unless nonrenewal or a renewal with notice of change was mailed by the 60th day before expiration
- [N.Y. Ins. Law 3425](https://www.nysenate.gov/legislation/laws/ISC/3425), personal lines nonrenewal and conditional renewal notices 45 to 60 days before the end of the period
- [N.Y. Ins. Law 3426](https://www.nysenate.gov/legislation/laws/ISC/3426), commercial nonrenewal and conditional renewal 60 to 120 days ahead, the 10% premium increase trigger, and late notice continuation

**Filings**

- [North Carolina Rate Bureau: Circular A-26-2 (PDF)](https://www.ncrb.org/Portals/0/ncrb/circular%20letters/automobile/2026/A-26-2%202026%20NC%20Personal%20Auto%20Rate%20Review%20and%20Program%20Changes.pdf?ver=8EeBogwTkuRGXminwAqqlw%3d%3d), Personal Auto Manual Rule 9: pro rata changes, the consistent inception-or-current rate election, territory transfers, and the $2 and end-of-term adjustment rules

**Vendor documentation**

- [Guidewire: Overview of modifying jobs](https://docs.guidewire.com/cloud/pc/202507/cloudapibf/cloudAPI/topics/123-PCpolicies/00-overview-of-modifying-jobs/c_overview_of_modifying_jobs.html), policies created and modified only through policy transactions, and the job types
- [Guidewire: Out-of-sequence conflicts](https://docs.guidewire.com/cloud/pc/202507/cloudapibf/cloudAPI/topics/124-PCsupport/00-out-of-sequence-conflicts/c_out-of-sequence-conflicts.html), the definition, conflicts reported at quote, and per-field resolution
- [Guidewire: Issues specific to policy changes](https://docs.guidewire.com/cloud/pc/202507/cloudapibf/cloudAPI/topics/122-PCjobTypes/03-policy-changes/c_issues_specific_to_policy_changes.html), preemption between jobs from the same base period and between policy changes and renewals
- [Guidewire: Renewals](https://docs.guidewire.com/cloud/pc/202507/cloudapibf/cloudAPI/topics/122-PCjobTypes/02-renewals/c_renewals.html), renewal jobs, automatic binding, and pending renewal and nonrenewal workflows
- [Socotra: Policy transactions](https://docs.socotra.com/features/policy-management/policy-transactions), transaction types, segments and change instructions, and pricing stored on the transaction
- [Socotra: Out-of-sequence transactions](https://docs.socotra.com/features/policy-management/out-of-sequence-transactions), automatic detection, aggregate transactions of reversals and reapplications, and ignored instructions for removed elements
- [Socotra: Renewal management and auto-renewal](https://docs.socotra.com/features/policy-management/renewal-management), auto-renewal plans, `renewalCreateLeadDays`, new terms and Do Not Renew
