+++
title = "Rules as Data"
description = "Policies that vary by jurisdiction, channel and date as versioned, sourced data: stages, final checks, precedence, stored deadlines and decision records."
category = "Architecture"
order = 414
tags = ["architecture", "rules", "compliance", "configuration"]
+++

Some logic is the same everywhere: a ledger balances, a retry backs off, an ID is unique. Other logic is the same *mechanism* with different numbers depending on where, how, why and when: the hours you may call someone, the age at which a child can consent to an online service, the price of a battle pass in Brazil, which license an electrician needs in this county, how many days past due before service stops. The mechanism belongs in code. The numbers belong in data, because they change on someone else's schedule, and a deploy per change is slow and leaves no record of what the rule was last March.

My rule: **if a value varies by jurisdiction, channel, purpose or date, it's a row with a source and an effective date, and every decision records which row made it.** This chapter is how to build that without building an unmaintainable rules engine by accident.

## What Belongs in Data

The test is whether the rule has the same shape everywhere and different parameters by context. A few examples across industries:

| Rule | Varies by | Example values |
| ---- | --------- | -------------- |
| Calling hours for telephone solicitation | Jurisdiction, channel, purpose | 8 a.m. to 9 p.m. at the called party's location under the US federal rule; 8 a.m. to 8 p.m. in Florida |
| Age of digital consent | Country | 16 by default under GDPR, lowered by a member state to as low as 13 |
| Paid random items (loot boxes) | Country, platform | Odds disclosed before purchase; not offered where counsel decides they're gambling |
| Regional price | Country, currency, date | A season pass priced per market, changing on a planned date |
| Required license | Jurisdiction, activity, date | An electrical job needs a specific license category in one state |
| Days past due before service is held | Tenant, date | 60 in one business's policy, 90 in another's |

The legal ones are verified: the US federal window is in [47 CFR 64.1200(c)(1)](https://www.law.cornell.edu/cfr/text/47/64.1200), Florida's tighter window and its limit of three calls in 24 hours on the same subject are in [Fla. Stat. 501.616(6)](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0501/Sections/0501.616.html), the consent age is [GDPR Article 8](https://gdpr-info.eu/art-8-gdpr/), and Apple's [App Review Guideline 3.1.1](https://developer.apple.com/app-store/review/guidelines/) requires apps offering loot boxes to "disclose the odds of receiving each type of item to customers prior to purchase". The point of the table isn't the values. It's that every row has the same parts: a scope (where, which channel, for what purpose), a value, a period it applies to, and a source someone can open.

What stays in code is the mechanism: how a window is checked against a recipient's local time, how a price waterfall runs. A rule that needs a new *kind* of condition is a code change; a new value for an existing condition is a row.

## The Shape of a Rule

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE contact_rules (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  rule_key       TEXT NOT NULL,          -- 'calling_window', 'max_attempts_24h'
  jurisdiction   TEXT NOT NULL,          -- 'US', 'US-FL', 'GB'
  channel        TEXT NOT NULL CHECK (channel IN ('voice', 'sms', 'email', 'door')),
  purpose        TEXT NOT NULL CHECK (purpose IN ('transactional', 'marketing', 'collections')),
  value          JSONB NOT NULL,         -- {"start": "08:00", "end": "20:00"}
  valid_during   DATERANGE NOT NULL,     -- closed-open; an open upper bound means "until further notice"
  version        INTEGER NOT NULL,
  source_url     TEXT NOT NULL,          -- the statute, ordinance or policy relied on
  approved_by_id UUID NOT NULL REFERENCES staff_users (id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT contact_rules_rule_key_jurisdiction_channel_purpose_version_key
    UNIQUE (rule_key, jurisdiction, channel, purpose, version),
  CONSTRAINT contact_rules_valid_during_excl
    EXCLUDE USING GIST (rule_key WITH =, jurisdiction WITH =, channel WITH =,
                        purpose WITH =, valid_during WITH &&)
);
```

- **The scope is columns,** not a free-text description, so resolution is a query. Jurisdictions are hierarchical codes (country, state, city); [Multi-Tenancy](/docs/architecture/multi-tenancy) adds a tenant column when each customer of a platform sets its own policy.
- **The value is typed per rule key.** `jsonb` keeps one table for many rule kinds, and a JSON Schema per `rule_key`, checked on write and in CI, keeps it honest. A rule kind that's queried heavily earns its own table.
- **Dates are dates.** Laws take effect on a calendar day, in the jurisdiction's time zone, not at midnight UTC ([Time & Date Formats](/docs/fundamentals/time#dates-without-times)). `valid_during` is a closed-open `DATERANGE`, per [Effective Dating & History](/docs/database/temporal-data), and the exclusion constraint means two rows for the same scope can never overlap in time.
- **Every row has a source.** A rule nobody can trace to a statute, a platform policy or a signed decision is an opinion, and in a dispute it reads like one. For internal policy, the source is the decision record ([Decisions & Design Docs](/docs/engineering/design-docs)).
- **Editing is a permission.** The people who own the policy (counsel, pricing, operations) change rows through a reviewed workflow with an approver, not through a database console.

## Effective Dates and Versions

A rule's value, scope and source are never edited. A change is a new row whose `valid_during` starts on the effective date, and the only update the old row ever gets is closing its range at that same date, in the same transaction ([Changing a Value](/docs/database/temporal-data#changing-a-value)). A rule that was simply wrong for a period is corrected the same way, with a new version and an audit entry saying it was retroactive. That gives three things a mutable config can't:

- **Changes ship before they take effect.** A law effective on the first of next month is entered today and switches on by itself. No deploy at midnight, no feature flag to remember to flip ([Feature Flags](/docs/delivery/feature-flags) are for rollouts, not for dated legal changes).
- **Evaluate as of the right date.** The rule that applies is the one in force on the date that matters for the decision: the sale date for a cancellation window, the service date for a license check, the send time for a calling window. Not "today", which is wrong for anything computed in advance or re-evaluated later.
- **History answers questions.** "What was the rule on March 3?" is a query, and so is "what changed in the last quarter?" Append-only rules are the same discipline as [append-only records](/docs/payments/payment-states#append-only-records).

## When Rules Overlap

A single decision usually matches several rows: a federal rule and a state rule, a country default and a platform policy, a state requirement and a city one. How they combine is part of the rule kind's definition, decided once, not per call site. There are three combinations, and mixing them up is the common bug:

| Combination | Use when | Example |
| ----------- | -------- | ------- |
| **All apply** | Each rule adds a requirement | A contractor must hold every license required by the state, county and city containing the job site; a seller must meet every disclosure rule in the countries it sells into |
| **Strictest wins** | Rules limit the same dimension | Calling window: the intersection of the federal and state windows; attempt cap: the lowest |
| **Most specific wins** | A narrower rule replaces a broader one | A member state's consent age replaces the GDPR default of 16, even when it's lower; a country price replaces the regional one |

Strictest-wins is the safe default for limits on contact, collection and anything else a regulator could cite, and it has a subtlety: you may not know exactly which rules apply. A phone number's area code suggests one state and the service address another, so evaluate both and take the strictest, and record that you did. Most-specific-wins is correct for values that *replace* rather than *limit*, and wrong anywhere a broad rule is a floor: a city rule never relaxes a state requirement unless the law says it does. When precedence is genuinely ambiguous, the rule kind gets an explicit `priority`, set by the policy owner, rather than an ordering accident in code.

## Stages and Ordered Rules

Some decisions are a sequence of rules, each reading the result of the last. Pricing is the canonical case: a list price, then a contract or member price, then promotions, then a rep's discount, then tax. Salesforce CPQ formalizes this with four evaluation events (On Initialization, Before Calculate, On Calculate, After Calculate) and an evaluation order within each, and documents the trap every rule system hits: "Every condition is evaluated before any actions are taken in a given evaluation event", so a rule whose condition depends on a value another rule sets in the same event may never fire ([Salesforce Trailhead: Sequence Price Rules](https://trailhead.salesforce.com/content/learn/modules/price-rules-in-salesforce-cpq/sequence-price-rules-for-correct-calculations)).

The design that holds up:

- **Fixed stages,** defined in code, each with a clear input and output: `base`, `segment`, `promotion`, `discount`, `final_checks`. Adding a stage is a code change, reviewed as one.
- **Ordered rules within a stage,** with an explicit `order`, and **no rule reads a field another rule in the same stage writes.** If it needs to, it belongs in the next stage.
- **Stacking is declared.** Whether a rule combines with others in its stage (`exclusive_within_stage`, `stacks`) is part of the rule, because "20% off then $5 off" and "$5 off then 20% off" are different prices.

```json
{
  "id": "0194c2a0-5d3e-7b41-8f02-6a1c9e4d7b23",
  "rule_key": "promotion",
  "version": 3,
  "conditions": [
    { "field": "item.sku", "op": "in", "value": ["season_pass"] },
    { "field": "customer.country", "op": "eq", "value": "BR" }
  ],
  "valid_during": "[2026-11-01,2026-12-01)",
  "stage": "promotion",
  "order": 20,
  "stacking": "exclusive_within_stage",
  "action": { "type": "percent_off", "value": 25 },
  "source_url": "https://wiki.example.com/decisions/2026-q4-launch-pricing"
}
```

## Final Checks

The last stage is different in kind: **final checks** are validation that no rule earlier in the pipeline can override. They state what must be true of any outcome, whatever the configuration says:

- A price is never below its floor, never negative, and rounded to the currency's minor unit ([Money & Amounts](/docs/payments/money)).
- A discount never exceeds the approving role's maximum.
- A loot box is never sold without an odds table attached, and never offered in a country whose rule says not offered.
- A message is never sent outside the resolved window; a job is never assigned to someone without the required license.

Final checks live in code, not in the rule table, because they protect against bad rule data. A typo that makes a promotion 250% off should fail a check and alert someone, not produce a negative invoice. When a check fails, the decision fails closed with a reason (blocked, or deferred until a lawful time), and the failure is logged like any other decision.

## Deadlines Are Computed and Stored

Many rules produce a date: a cancellation deadline, a renewal reminder, a credential's renewal window, the earliest day an account can be placed with a collection agency. Compute it **once, when the triggering event happens,** and store it with its inputs:

```json
{
  "agreement_id": "0194c2a3-1f7a-7c10-9e55-2b8d4a6f0c91",
  "deadline": "cancellation",
  "due_at": "2026-10-30T04:00:00Z",
  "inputs": {
    "signed_on": "2026-10-26",
    "jurisdiction": "US",
    "time_zone": "America/New_York",
    "business_days": 3,
    "calendar_id": "us-federal-holidays-2026"
  },
  "rule_id": "0194c29f-88b0-7d2e-a4c3-5e7f1b9d2a60",
  "rule_version": 2
}
```

The US FTC's door-to-door rule shows why the inputs matter: the buyer may cancel "at any time prior to midnight of the third business day after the date of this transaction" ([16 CFR 429.1](https://www.law.cornell.edu/cfr/text/16/429.1)). That's a date of sale, a definition of business day, a holiday calendar, a time zone and a midnight. Store them all. A deadline recomputed on every read silently moves when a holiday calendar is corrected or a rule is edited, and a customer who was told one date gets held to another. If a rule change should affect deadlines already computed, that's a deliberate migration with a record, not a side effect. For example, [Signing the Agreement](/books/field-operations/signing-the-agreement) walks through one such calculation.

## Record Which Rule Decided

Every decision a rule makes is recorded with the rule IDs and versions that produced it, the inputs it saw, and the outcome:

- **A price trace** per line: each stage's adjustment and the rule that made it. "Why is this $129?" is a lookup, not a debugging session.
- **A contact decision** per message or call: sent, deferred or blocked, with the window and cap that applied and the jurisdictions considered. Blocks matter as much as sends; they're the proof that the controls ran.
- **An eligibility decision** per assignment: the requirements resolved for that address and date, and the credentials that satisfied them.

These are append-only records, and they're often [events](/docs/architecture/events) too (`contact.blocked`, `price.calculated`), so audit, analytics and support all read the same facts. Copy the values that mattered into the decision record, not only the rule ID: the rule row is permanent, but a record that reads correctly on its own survives a mistaken purge, an export, and a reader without database access.

## Testing Rules

Rules in data are still logic, and they break like logic. Test at three levels:

- **The mechanism,** with ordinary unit tests in code: strictest-wins really intersects windows, stages really can't read their own writes, final checks really block ([Testing](/docs/quality/testing)).
- **The rule set,** with table-driven cases owned by the policy owner: "a marketing text to a Florida number at 8:15 p.m. is deferred", "a member in Brazil sees the promotion price on November 1 and not October 31". Run them in CI against the rule rows themselves, and require new cases with every rule change. Boundaries are where rules fail: the day before and after each end of `valid_during`, the minute before and after a window, the 3rd and 4th attempt.
- **The change,** by evaluating a proposed rule version against recent real decisions before it takes effect and reviewing the diff: how many prices move, how many messages that would have sent now defer. A rule change that unexpectedly affects every customer should be visible in review, not in support tickets.

Lint the data too: every row has a source, a scope that must always have a rule has no gaps in time (the exclusion constraint already rules out overlaps), every value matches its rule kind's schema, and no rule kind has a scope with no rule at all when a default is required.

## A Rules Engine or Code?

Everything above is a table, a resolver and a staged evaluator in your own language, and that's my default. A general-purpose **rules engine** (Drools, a decision-table product, or a policy language like those in [Authorization](/docs/security/authorization#policy-as-code)) earns its place when there are hundreds of rules, maintained by people who aren't engineers, on a release cycle of their own.

The tradeoff is real. Martin Fowler's caution is that engines make it easy to end up with a system "very hard to maintain" because "nobody can understand this implicit program flow", that the pitch of business people writing rules themselves "rarely works out in practice", and that chaining rules "can easily end up being very hard to reason about and debug" ([Martin Fowler: Rules Engine](https://martinfowler.com/bliki/RulesEngine.html)).

| | Rule table plus code | Rules engine |
| --- | ------------------- | ------------ |
| **Change a value** | Insert a row | Edit a rule |
| **Add a new kind of condition** | Code change and deploy | Often configuration |
| **Debugging** | Ordinary code, stepped through | The engine's tooling and its evaluation model |
| **Testing** | Your test suite | The engine's, plus yours around it |
| **Risk** | Under-flexible; new kinds need engineers | Implicit flow, rule chains nobody understands |

Start with the table. Most "we need a rules engine" requests are really "we need to change values without a deploy", which the table already gives you. Reach for an engine when the *kinds* of conditions change faster than engineers can add them, and keep stages, final checks and decision records around it either way.

## Checklist

- **Values that vary by place, channel, purpose or date in rows,** with typed values, a closed-open `valid_during`, a version and a source.
- **Rows never edited;** a change is a new row, entered ahead of its effective date and reviewed by the policy owner, and closing the old row's range is the only update.
- **Evaluation as of the decision's date,** in the jurisdiction's time zone.
- **A declared combination per rule kind:** all apply, strictest wins, or most specific wins.
- **Fixed stages with ordered rules,** no rule reading its own stage's writes, stacking declared.
- **Final checks in code** that no rule can override, failing closed with a reason.
- **Deadlines computed once and stored with their inputs** and the rule version.
- **Every decision recorded** with the rule IDs, versions, inputs and outcome.
- **Rule sets tested in CI** with boundary cases, and changes evaluated against real traffic before they take effect.
- **A table and code by default;** an engine only when the kinds of rules outgrow it.

## References

**Specifications**

- [Cornell LII: 47 CFR 64.1200](https://www.law.cornell.edu/cfr/text/47/64.1200), the US calling window of 8 a.m. to 9 p.m. at the called party's location
- [Fla. Stat. 501.616](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0501/Sections/0501.616.html), Florida's 8 a.m. to 8 p.m. window and three calls in 24 hours on the same subject
- [GDPR Article 8: Conditions for a Child's Consent](https://gdpr-info.eu/art-8-gdpr/), the default age of 16 and member-state ages no lower than 13
- [Cornell LII: 16 CFR 429.1](https://www.law.cornell.edu/cfr/text/16/429.1), cancellation before midnight of the third business day after a door-to-door sale

**Reference**

- [Apple: App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), Guideline 3.1.1 on disclosing loot box odds before purchase
- [Salesforce Trailhead: Sequence Price Rules](https://trailhead.salesforce.com/content/learn/modules/price-rules-in-salesforce-cpq/sequence-price-rules-for-correct-calculations), evaluation events and conditions evaluated before actions
- [Martin Fowler: Rules Engine](https://martinfowler.com/bliki/RulesEngine.html), the maintenance and debugging costs of rules engines
