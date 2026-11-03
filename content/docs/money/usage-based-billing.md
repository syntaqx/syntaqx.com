+++
title = "Usage-Based Billing & Metering"
nav_title = "Usage-Based Billing"
description = "Metering events, aggregation and rating, late events and period close, credits and commitments as a ledger, spend alerts, invoice evidence, and engines."
category = "Money"
order = 807
tags = ["payments", "billing", "metering", "usage-based", "credits", "invoicing"]
+++

Usage-based billing charges for what a customer did, not for the seat they hold: API calls, tokens, gigabytes stored, minutes transcoded, messages sent. It looks like a subscription with a multiplication at the end, and it's a different system. A subscription bills a number the business set; usage bills a number the business measured, from millions of small facts produced by systems that retry, lag, crash and disagree. Every one of those facts is a line of evidence in a future argument about an invoice.

This chapter builds on [Subscriptions & Recurring Billing](/docs/money/subscriptions) (periods, anchors, plan changes, dunning), [Money & Amounts](/docs/money/amounts), [Payment States & Ledgers](/docs/money/payment-states) and [Idempotency](/docs/requests/idempotency). Revenue recognition for usage is in [Accounting & Revenue Recognition](/docs/money/accounting#performance-obligations-in-software).

## The Pipeline

Usage billing is a pipeline with six stages, and each stage's output is kept, so any invoice line can be walked back to the events under it:

1. **Emit** a meter event where the billable thing happens.
2. **Keep** it, deduplicated by its ID, in an append-only store.
3. **Aggregate** events per meter, customer and period into a quantity.
4. **Rate** the quantity against the price version in force.
5. **Apply** prepaid credits and commitments, as ledger entries.
6. **Bill** invoice lines that carry the quantity, the price and a pointer to the evidence.

![Six stages left to right: meter event (id, customer, meter, event time), raw events (deduped by id, append-only, accented), usage (sum, max, unique, last per period), amount (price version: unit, tier, package), balances (credits, commits, ledger entries) and invoice lines (quantity, price, evidence query); a dashed return from invoice lines to raw events reads dispute or late event: recompute from raw events, adjust the open period](/diagrams/usage-billing-pipeline.svg "The raw event store is the system of record. Aggregates, amounts and invoice lines are all derived from it, so a dispute or a late event is answered by recomputing, never by editing a total.")

The design rule that falls out of it: **raw events are the system of record, and everything downstream is a derivation.** A total that can't be recomputed from events is a number someone typed.

## Metering Events

A meter event is a fact: "this customer used this much of this meter at this time". Its shape:

```sql
CREATE TABLE meter_events (
  id            TEXT NOT NULL,           -- producer-assigned, stable across retries
  source        TEXT NOT NULL,           -- the producing service
  customer_id   UUID NOT NULL,
  meter         TEXT NOT NULL,           -- 'api_requests', 'input_tokens', 'storage_gb'
  quantity      NUMERIC NOT NULL,        -- the measured value, not money
  dimensions    JSONB NOT NULL DEFAULT '{}', -- model, region, tier: what the price may vary on
  occurred_at   TIMESTAMPTZ NOT NULL,    -- event time: when the usage happened
  received_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- ingestion time
  CONSTRAINT meter_events_pkey PRIMARY KEY (source, id)
);
```

Four properties carry the weight.

**Idempotent by a producer-assigned ID.** The producer names the event once, from the work it measures (`req_0194f1c2...` for a request, `job_8812:minute-14` for a transcode minute), and sends the same ID on every retry. The primary key turns a duplicate into a no-op, the same contract as [Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api). CloudEvents states the rule well: "Producers MUST ensure that `source` + `id` is unique for each distinct event", and consumers may treat a repeated pair as a duplicate. OpenMeter "deduplicates events by `id` and `source`"; Stripe lets you set an `identifier` on each meter event and generates one if you don't. Don't let it generate one: an ID minted at send time is different on every retry, which is exactly the duplicate you were trying to prevent.

**Timestamped by event time.** `occurred_at` is when the usage happened, set by the producer; `received_at` is when it arrived. Periods are assigned from event time, so an event for 23:59 on the 31st belongs to that month even if it arrives at 00:03 on the 1st. Ingestion time is still worth keeping: the gap between the two is the lag that decides how long a period stays open (below), and CloudEvents defines `time` as the "Timestamp of when the occurrence happened" for the same reason.

**Attributed to a customer and a meter at the source.** The producer knows which account made the request; a join three systems later guesses. Attribute to the billing customer (or a stable account ID that maps to one), not a user or an API key that can move between accounts. Dimensions such as model or region go in the event, because a price that varies on a dimension the events don't carry can't be computed.

**A measurement, not money.** Events carry tokens, bytes and seconds, never prices. Prices change, contracts differ by customer, and the same event may be rated twice (an estimate today, an invoice at month end). Rating is a later stage on purpose.

Emitting is part of the work being billed, so it rides the same reliability path as the work. Write the event in the same transaction as the thing it measures, through an [outbox](/docs/architecture/events), or emit it from a durable log the product already keeps. An event sent fire-and-forget from a request handler is revenue lost on every crash, and nobody notices because the system that would notice is the one that lost it.

Ingestion runs at the volume of the product, not the volume of billing. Stripe's meter event endpoint allows 1,000 calls per second per account in live mode and one concurrent call per customer per meter, and its high-throughput stream takes up to 10,000 events per second. Past that, it recommends pre-aggregating before sending. My default is to keep the raw events in my own store (a [stream](/docs/data/streaming) into a warehouse table is fine) and send a billing engine per-customer, per-meter rollups every few minutes, each with a deterministic ID such as `customer:meter:window_start`. The raw events stay mine for disputes and analytics; the engine gets what it needs to bill.

## Aggregation

A meter turns a period's events into one quantity. Four aggregations cover nearly every product:

| Aggregation | Bills for | Example |
| --- | --- | --- |
| **Sum** | total consumption | tokens, API calls, GB transferred, minutes |
| **Max** | the peak in the period | concurrent seats, peak instances |
| **Unique count** | distinct values of a property | monthly active users, devices, workspaces |
| **Last value** | the most recent reading | storage at period end, a gauge |

Engines name them differently. Stripe meters offer **Sum**, **Count** and **Last**; Lago adds **COUNT UNIQUE**, **MAX** and a **WEIGHTED SUM** that is "prorated based on time used per period", which is what a gauge like storage really wants: 100 GB for half the month and 300 GB for the other half averages 200, while last value bills 300. Pick the aggregation that matches what the customer believes they're buying, and write that sentence into the price page, because "per GB stored" means time-weighted to some customers and end-of-month to others.

Three rules keep aggregation honest:

- **One definition per meter, versioned.** The meter's filter, aggregation and dimension grouping are a metric definition with an owner and an effective date, exactly as [One Definition per Metric](/docs/data/data-pipelines#one-definition-per-metric) prescribes, and every aggregate is stamped with the definition version that built it. Stripe makes this concrete: once a meter is configured, "you can't make any changes aside from the display name". A changed meaning is a new meter.
- **Periods come from the subscription.** The billing period is the subscription period row from [Periods and Anchors](/docs/money/subscriptions#periods-and-anchors), closed-open, and an event belongs to the period whose range contains its `occurred_at`. Unique counts don't add across periods (a user active in both halves of the month is one, not two), so compute them over the billing period itself, not by summing daily uniques.
- **Reconcile to the producer.** Daily, compare the meter's totals with the producing system's own count for the same window. A gap means the pipeline dropped or duplicated events, and it's found before an invoice uses the number ([Reconcile to the Source](/docs/data/data-pipelines#reconcile-to-the-source)).

## Rating

Rating turns a quantity into an amount, using the price version in force for the period. The models:

- **Per-unit.** Quantity times unit price.
- **Graduated tiers.** Each tier's units at that tier's price. In Stripe's example, with 1 to 5 units at 700 cents, 6 to 10 at 650 and 11 and up at 600, six units cost 4,150 cents: five at 700 and one at 650.
- **Volume tiers.** Every unit at the price of the tier the total lands in, so six units cost 3,900 cents. Volume pricing has a cliff: the total can drop as usage rises past a boundary, which customers notice and some learn to game.
- **Packages.** Usage rounded up to whole packages (per 1,000 calls, per million tokens). Stripe implements this as `transform_quantity`, which it notes "Cannot be combined with `tiers`".
- **Flat fees and minimums,** a platform fee per period or per tier, layered on any of the above.

Tiny unit prices are the norm in usage billing, and they break the integer rule if you let them: a model priced per million tokens costs a fraction of a cent per token. Stripe allows a `unit_amount_decimal` "with at most 12 decimal places" for exactly this. My default keeps integers by quoting the price per package (300 cents per 1,000,000 tokens), multiplying exactly, and dividing and rounding once, per line, at the end, under the rounding rule in [Money & Amounts](/docs/money/amounts#rounding):

```go tab="Go"
// Tier prices units up to UpTo (0 means no upper bound) at UnitAmount
// minor units per Price.Per units: 300 cents per 1,000,000 tokens.
type Tier struct {
	UpTo       int64
	UnitAmount int64
}

type Price struct {
	Mode  string // "graduated" or "volume"
	Per   int64  // the package size UnitAmount is quoted for
	Tiers []Tier // ascending UpTo, the last one unbounded
}

// Rate returns the amount in minor units. The sum stays exact in
// minor units times Per and is rounded half up once, at the end.
func Rate(p Price, qty int64) (int64, error) {
	var exact int64
	switch p.Mode {
	case "volume": // every unit at the rate of the tier the total lands in
		for _, t := range p.Tiers {
			if t.UpTo == 0 || qty <= t.UpTo {
				exact = qty * t.UnitAmount
				break
			}
		}
	case "graduated": // each tier's units at that tier's rate
		var floor int64
		for _, t := range p.Tiers {
			ceil := t.UpTo
			if ceil == 0 || qty < ceil {
				ceil = qty
			}
			if ceil > floor {
				exact += (ceil - floor) * t.UnitAmount
			}
			if t.UpTo == 0 || qty <= t.UpTo {
				break
			}
			floor = t.UpTo
		}
	default:
		return 0, errors.New("unknown price mode " + p.Mode)
	}
	return (exact + p.Per/2) / p.Per, nil
}
```

```rust tab="Rust"
/// Units up to `up_to` (`None` means no upper bound) at `unit_amount`
/// minor units per `Price::per` units: 300 cents per 1,000,000 tokens.
pub struct Tier {
    pub up_to: Option<i64>,
    pub unit_amount: i64,
}

pub enum Mode {
    Graduated,
    Volume,
}

pub struct Price {
    pub mode: Mode,
    pub per: i64,         // the package size unit_amount is quoted for
    pub tiers: Vec<Tier>, // ascending up_to, the last one unbounded
}

/// The amount in minor units. The sum stays exact in minor units times
/// `per` and is rounded half up once, at the end.
pub fn rate(p: &Price, qty: i64) -> i64 {
    let mut exact = 0;
    match p.mode {
        // every unit at the rate of the tier the total lands in
        Mode::Volume => {
            if let Some(t) = p.tiers.iter().find(|t| t.up_to.map_or(true, |u| qty <= u)) {
                exact = qty * t.unit_amount;
            }
        }
        // each tier's units at that tier's rate
        Mode::Graduated => {
            let mut floor = 0;
            for t in &p.tiers {
                let ceil = t.up_to.map_or(qty, |u| u.min(qty));
                if ceil > floor {
                    exact += (ceil - floor) * t.unit_amount;
                }
                match t.up_to {
                    Some(u) if qty > u => floor = u,
                    _ => break,
                }
            }
        }
    }
    (exact + p.per / 2) / p.per
}
```

With Stripe's tiers this returns 4,150 for six graduated units and 3,900 for six volume units, and 1,234,567 tokens at 300 cents per million rate to 370 cents. Validate tier tables when a price version is created (ascending bounds, one unbounded last tier, products that fit in 64 bits at the largest quantity you accept), not when an invoice is due.

Rate against the **price version** the period was sold under, the same versioned plans as [Plan Changes and Proration](/docs/money/subscriptions#plan-changes-and-proration). A price change mid-period either splits the period into two rated segments or waits for the next one; decide which, once, and note that engines handle it with sharp edges of their own (Stripe documents that a mid-cycle price change drops usage reported during its finalization grace period).

## Late Events and Closing a Period

Events arrive late: a mobile client flushes after a flight, a batch job reports a day's work at midnight, a pipeline replays after an outage. Every usage system needs a rule for when a period stops accepting them.

**A grace window, then close.** The period stays open for a stated window after it ends, sized from the measured lag between `occurred_at` and `received_at` (the 99.9th percentile, plus slack). Then the invoice is computed and the period is closed. The engines make the same trade with different numbers: Stripe holds invoices as drafts for a default finalization grace period of one hour, configurable up to 72 hours, and accepts events timestamped within the past 35 days, but usage reported after finalization lands in meter summaries "without updating the finalized invoice or adding the usage to the next invoice". Orb accepts events "up to 12 hours after the `timestamp`", a grace period configurable per account. In both, a late event past the window is silently not billed unless you do something about it.

**After close, adjust; never edit.** A closed period's invoice is a sent document and an accounting record ([Closed Periods Stay Closed](/docs/money/accounting#closed-periods-stay-closed)). Usage that arrives after close is billed as an adjustment line on the next open period ("usage for October received after close: 18,400 calls"), referencing the period it belongs to. This is the frozen-period rule from [Versions, Stamps and Frozen Periods](/docs/data/data-pipelines#versions-stamps-and-frozen-periods), applied to invoices. Whether small late usage is billed at all is a business decision with a threshold; write it down so nobody decides it per ticket.

**Corrections are new events.** An overcount (a bug double-reported a day of usage) is corrected by appending compensating events or a correction record that excludes the bad ones, with a reason and an author, never by deleting rows. Orb's backfills work this way: replaced events "are marked as archived", still queryable but no longer used for billing. Stripe's meter event adjustments can cancel an event only within 24 hours of sending it, and a cancellation doesn't touch a finalized invoice. Engines give you a short correction window; your own raw store and adjustment lines cover everything after it.

**Overcharges become credit notes.** If a closed invoice was too high, issue a credit note against it, a ledger entry with its own reason, and let the [ledger](/docs/money/payment-states#append-only-records) do the rest.

## Credits and Balances

Prepaid credits are money the customer gave you before using anything, so they're a ledger, not a counter. "Credits remaining: 4,200" is a balance derived from entries: a grant, each draw-down by an invoice or a usage window, expirations, voids and reinstatements, each an immutable row with an amount, a reason and a source ID. Stripe's credit grants work this way: a credit grant "is backed by an immutable, append-only ledger", and voiding an invoice "reinstates the applied balance". It's the [double-entry ledger](/docs/money/payment-states#double-entry-ledger) with an account per customer grant.

Decisions to make once:

- **Units.** Credits in currency minor units are simplest; credits in abstract units ("1,000 credits") need a published conversion and a ledger in units, with the money side tracked separately for accounting.
- **Draw-down order.** When several grants apply, which goes first. Stripe orders by priority, then earliest expiration, then promotional before paid, then effective date, then creation; Metronome notes that "Lower priorities get consumed first" and that "The same usage can apply against only one commit or credit". Burning promotional and soon-expiring credits first is the customer-friendly default.
- **Scope.** Which meters or prices a grant can pay for, and whether it applies before or after discounts and tax. Stripe applies credit grants "after discounts, but before taxes".
- **Expiry.** Promotional credits usually expire; paid ones may be restricted by consumer law and your terms. Breakage on unused paid credits is an accounting question with its own rules ([Breakage](/docs/money/accounting#breakage)), and recognizing it never removes the customer's balance in the product.
- **Not stored value.** Credits redeemable only for your own service are a billing feature; credits that can be spent elsewhere, transferred or cashed out start to look like a stored-value or money-transmission product with its own regulation. Stripe's documentation for its billing credits prohibits gift card and stored-value uses for this reason. Involve counsel before credits leave your product.

Prepaid usage is recognized as it's consumed, which is why each draw-down is an entry with a date: the revenue schedule in [Recognition Schedules](/docs/money/accounting#recognition-schedules) is built from them.

## Commitments and Overages

Sales-led usage deals rarely bill pure pay-as-you-go. They commit to a spend and bill beyond it. The common shapes:

- **Prepaid commit.** The customer pays a sum up front (often annually) and usage draws it down at contracted rates. Beyond it, usage bills as **overage**, at list price or a negotiated rate. Unused commit typically expires at the end of the term.
- **Postpaid commit (minimum spend).** The customer pays in arrears and promises to spend at least an amount over the term. Metronome's example is "a postpaid commitment to spend $10,000 over the one-year contract term"; if spend falls short, "there's a final true-up invoice" for the difference.
- **Included usage.** A subscription fee that includes a quantity (100,000 calls a month), with overage beyond. This is a per-period commit, and it's simplest to model it as one rather than as a special case.

All three fit the same structure: a commitment is a balance on the ledger with a term, a funding schedule (up front or in arrears), an applicable scope and a rule for what happens to the remainder. Usage draws down at the line level, so each invoice line shows what the commit covered and what was billed as overage, which is how Metronome applies them: "credits and commits are always applied against usage at a line-item level rather than the aggregate invoice level".

The contract is the source of these terms, so every commitment row references the contract version that created it, the same as plan versions do for self-serve.

## Showing Customers Their Usage

A usage bill nobody saw coming is a support ticket, a dispute and often a churn. The cure is showing usage and spend while they accrue:

- **A live usage view** per meter and dimension, with the period's estimated amount rated at the customer's actual prices. Label it an estimate and show its freshness ("as of 14:05"), because the pipeline lags and the invoice uses the closed period.
- **Spend alerts** the customer sets: notify at 50%, 80% and 100% of a budget, or of the prepaid balance. Stripe's usage alerts fire a webhook when a customer crosses a threshold. Send them on the transactional stream ([Notifications](/docs/building-blocks/notifications)), not marketing.
- **Hard limits** where the customer asks for them, enforced in the product, not in billing. A cap is a [rate limit](/docs/requests/rate-limiting) or an [admission](/docs/architecture/admission-control) decision at the API, computed from a fast counter, because a billing aggregate minutes behind will let a runaway job through. Say on the price page whether limits are soft (alert only) or hard (requests rejected), and what a rejection looks like.
- **Threshold invoicing** for your own risk: bill mid-period when accrued usage passes an amount, so a new customer can't run up a month of usage on a card that will decline. Stripe's billing thresholds do this, with a documented trap: under volume tiers, a later threshold invoice can be negative because the whole quantity re-rates at a cheaper tier.

Show customers the same numbers the invoice will use, from the same meter definitions. A dashboard that counts differently from billing guarantees the dispute you were trying to prevent.

## Invoices and Evidence

A usage invoice line carries more than a subscription line:

- **The meter, period, quantity, price version and amount,** with tiers shown as separate lines (or a breakdown) so the customer can redo the multiplication.
- **Credits and commit draw-down** per line, as above.
- **A pointer to the evidence:** the aggregate's ID, the meter definition version and the event window, so anyone can rerun the query that produced the quantity.
- **A usage export** the customer can download: daily or hourly totals per meter and dimension, and on request the raw events for a disputed window.

Each line is also a [revenue line](/docs/money/accounting#recognition-schedules) with a period; usage recognized as delivered needs nothing more than the line's period and the per-period quantities.

## Disputes Over Counts

"We didn't make 40 million calls" is the usage billing dispute, and it's answered from data, not from opinion. What makes it answerable:

- **Keep raw events** for at least the dispute window your contracts and the card networks allow, and longer for enterprise contracts with audit rights. Aggregates alone prove nothing: they're your claim, and the events are the evidence.
- **Recompute, don't defend.** Rerun the stamped meter definition over the raw events for the period. If the recomputation differs from the invoice, the invoice is wrong, and the fix is a credit note, not an explanation.
- **Break it down** by the customer's own identifiers: API key, project, endpoint, model, hour. Most disputes end when the customer sees that a forgotten staging job made the calls.
- **Find the producer bug** when the counts are ours. Duplicate emission, a retry without a stable ID, misattribution after an account merge: each fix is a code change and a correction for every affected customer, not only the one who noticed.

When a card payment for usage is disputed with the issuer, the same breakdown is the evidence packet ([Refunds and Disputes Are Their Own Objects](/docs/money/payment-states#refunds-and-disputes-are-their-own-objects)).

## AI Token Billing

Billing for model usage is the common case today, and it exercises every section above. Anthropic's price list is a good example of the shape: separate per-million-token rates for base input tokens, cache writes, cache hits and output tokens; a 5-minute cache write at "1.25x base input price" and a cache read at "0.1x base input price" on most models; higher prices for prompts over a size threshold on some models; a Batch API at "a 50 percent discount on both input and output tokens"; and a 1.1x multiplier for US-only inference. One API call produces several meters, each varying on model and options.

What that means for a product that resells or wraps model calls:

- **Meter every token class separately** (input, cached input, cache write, output), with model, mode and region as dimensions. A single "tokens" meter can't be rated against a price list that charges five times more for output than input.
- **Emit from the provider's response,** which reports the token counts, keyed by the request ID, not from your own estimate of the prompt.
- **Version prices per model,** because providers change rates and add models often, and old periods rate at old prices.
- **Watch margin,** your price per token against your provider cost per token, per meter, as a [unit cost](/docs/operations/cost-and-finops#measure-cost-per-unit-not-just-in-total). Agents and retries multiply tokens per user action in ways a per-seat plan never priced in ([AI Agents](/docs/building-blocks/ai-agents)).
- **Prepaid credits and hard limits** are the norm for consumer and self-serve AI products, because a runaway loop can spend a month's budget in an hour.

## Billing Engines or Building

Metering looks small and isn't: ingestion at product scale, deduplication, late events, versioned meters, tiered rating, credit ledgers, commits, alerts, invoices, tax, revenue schedules and dunning. My default is **buy the billing engine and own the metering pipeline up to it.** The general reasoning is in [Build vs Buy & Vendors](/docs/development/build-vs-buy); the usage-specific options:

- **Stripe Billing meters,** if you already take payments with Stripe: meters with sum, count and last, tiered and package prices, credit grants, alerts and thresholds. Stripe completed its acquisition of Metronome on January 14, 2026, and says it will integrate Metronome's capabilities with Stripe Billing.
- **Metronome,** built for complex contracted usage: prepaid and postpaid commits, credits and line-level draw-down.
- **Orb,** usage billing with backfills and amendments for correcting past events.
- **Lago,** open source under AGPL-3.0, self-hosted or cloud, with count unique, max and weighted sum aggregations.
- **OpenMeter,** open-source metering on CloudEvents, acquired by Kong in September 2025, which says it "will remain open source under an Apache 2.0 license".

Whichever engine bills, keep three things in your own systems: the raw events (for disputes, analytics and a future migration), the meter definitions as code, and the customer's spend controls. Those are what make an engine replaceable, which is the point of [Plan the Exit Before You Enter](/docs/architecture/replacing-systems#plan-the-exit-before-you-enter).

Build the whole thing only when usage pricing is the product's differentiator and no engine can express it (a marketplace with per-transaction splits, or real-time balances that gate the product itself), and budget it as a permanent team.

## Checklist

- **Meter events with a producer-assigned ID,** event time, customer and meter, emitted through an outbox, deduplicated by `source` and `id`.
- **Raw events kept** as the system of record, for the dispute window and longer where contracts grant audit rights.
- **Versioned meter definitions** with a stated aggregation, reconciled daily against the producing system.
- **Rating against the period's price version,** in integers per package, rounded once per line.
- **A grace window sized from measured lag,** then close; late usage and corrections as adjustment lines or credit notes, never edits.
- **Credits and commitments as ledger entries,** with stated draw-down order, scope and expiry.
- **Live usage, spend alerts and hard limits** for customers, from the same definitions the invoice uses.
- **Invoice lines with evidence pointers** and a usage export.
- **A billing engine for the rest,** with events, meter definitions and spend controls kept in your own systems.

## References

**Specifications**

- [CloudEvents specification](https://github.com/cloudevents/spec/blob/main/cloudevents/spec.md), `source` plus `id` uniqueness for deduplication and `time` as when the occurrence happened

**Reference**

- [Stripe: Record usage for billing with the API](https://docs.stripe.com/billing/subscriptions/usage-based/recording-usage-api), meter event identifiers, the 35-day and 5-minute timestamp windows, rate limits and high-throughput streams
- [Stripe: Create and configure a meter](https://docs.stripe.com/billing/subscriptions/usage-based/meters/configure), sum, count and last aggregation, immutable meter configuration and 24-hour event cancellation
- [Stripe: Set up tiered pricing](https://docs.stripe.com/subscriptions/pricing-models/tiered-pricing), volume and graduated tiers with worked examples and flat fees
- [Stripe: The Price object](https://docs.stripe.com/api/prices/object), `transform_quantity` for packages and `unit_amount_decimal` to 12 decimal places
- [Stripe: Configure an invoice finalization grace period](https://docs.stripe.com/billing/subscriptions/usage-based/configure-grace-period), the one-hour default, the 72-hour maximum and usage after finalization
- [Stripe: Billing credits](https://docs.stripe.com/billing/subscriptions/usage-based/billing-credits), credit grants on an append-only ledger, draw-down order and prohibited stored-value uses
- [Stripe: Set up usage-based alerts](https://docs.stripe.com/billing/subscriptions/usage-based/alerts), usage threshold alerts by webhook
- [Stripe: Set up thresholds](https://docs.stripe.com/billing/subscriptions/usage-based/thresholds), threshold invoices and negative lines under volume tiers
- [Orb: Backfill and amend events](https://docs.withorb.com/events-and-metrics/reporting-errors), the 12-hour reporting grace period and archived replaced events
- [Metronome: Apply credits and commits](https://docs.metronome.com/pricing-packaging/apply-credits-commits/), prepaid and postpaid commits, true-ups and line-level draw-down
- [Lago: Aggregation types](https://getlago.com/docs/guide/billable-metrics/aggregation-types/overview), count, count unique, latest, max, sum and weighted sum
- [OpenMeter: Usage events](https://openmeter.io/docs/metering/events/usage-events), CloudEvents ingestion, subjects and deduplication by `id` and `source`
- [Anthropic: Pricing](https://platform.claude.com/docs/en/about-claude/pricing), token classes, cache multipliers, batch discount and data residency multiplier

**In practice**

- [Stripe: Stripe completes Metronome acquisition](https://stripe.com/newsroom/news/stripe-completes-metronome-acquisition), the January 14, 2026 close and the plan to integrate Metronome with Stripe Billing
- [Kong: Kong acquires OpenMeter](https://konghq.com/blog/news/kong-acquires-openmeter), the September 2025 acquisition and the Apache 2.0 commitment
- [Lago on GitHub](https://github.com/getlago/lago), the open-source billing engine and its AGPL-3.0 license
