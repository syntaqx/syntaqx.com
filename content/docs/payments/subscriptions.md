+++
title = "Subscriptions & Recurring Billing"
nav_title = "Subscriptions"
description = "Subscription states, billing periods and anchors, idempotent renewals, proration, dunning, cancellation, and the automatic renewal laws that govern all of it."
category = "Payments"
order = 807
tags = ["payments", "subscriptions", "recurring", "billing", "consumer-protection"]
+++

A subscription is a promise to charge someone again, on a schedule, with nobody watching. A SaaS seat, a game's battle pass, a gym membership, a lawn care agreement and a streaming plan share one skeleton: the customer agreed once, a job charges them every period, and the business must be able to prove, months later, what they agreed to, what they paid for, and when they asked to stop. This chapter builds on [Money & Amounts](/docs/payments/money), [Idempotency](/docs/payments/idempotency) and [Payment States & Ledgers](/docs/payments/payment-states). Charging a stored card under the network rules is the layer below, in [Stored Cards & Recurring Billing](/books/payments/stored-credentials).

## Subscription States

A subscription has a `status` with a closed set of values and guarded transitions, like every other financial object. The set I default to:

| From | To | Trigger |
| --- | --- | --- |
| (new) | `trialing` | Sign-up with a trial; no charge yet |
| (new) | `active` | Sign-up and the first payment succeeds |
| `trialing` | `active` | Trial ends and the first payment succeeds |
| `trialing` | `ended` | Trial ends with no payment method, or the customer cancels during it |
| `active` | `past_due` | A renewal payment fails |
| `past_due` | `active` | A retry succeeds, or the customer pays with a new method |
| `past_due` | `ended` | The grace period runs out (involuntary churn) |
| `active` | `paused` | The customer asks for a break |
| `paused` | `active` | The pause ends, on its date or on request |
| `active`, `paused` | `ended` | A cancellation reaches its effective date |

A few rules make this hold up:

- **Cancelling is not a state.** A cancellation is a request with an effective date. Until then the subscription stays `active` with `cancel_at` set, and the customer keeps what they paid for. At that date it becomes `ended`, with an `ended_reason` (`cancelled`, `non_payment`, `term_completed`, `fraud`) that churn reporting depends on.
- **`ended` is terminal.** A returning customer gets a new subscription linked to the old one, so it reads as a win-back, not a new sale.
- **A pause is the customer's; a hold is the business's.** Both stop billing, but only one can be lifted by the customer. Model a business-initiated stop (non-payment, a dispute) as a dated hold, never as a pause with a different reason code.
- **Access is derived from state, not stored beside it.** Whether a player has the season pass is a function of status, period end and grace policy, computed in one place ([Authorization](/docs/security/authorization)). A boolean `is_premium` set by a webhook handler is how people keep access after they've stopped paying.
- **Every transition is an event** (`subscription.renewed`, `subscription.past_due`, `subscription.ended`) through the [outbox](/docs/architecture/events), so entitlements, email and the ledger react without polling.

Providers use similar shapes under other names: Stripe has `incomplete` for a first payment with 23 hours to succeed and `unpaid` after retries end; Google Play has in grace period, on hold and expired. Map theirs onto yours at the boundary.

## Periods and Anchors

A subscription bills in **periods**, and each period is a row, not a computation repeated every time someone asks:

```sql
CREATE TABLE subscription_periods (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  subscription_id UUID NOT NULL REFERENCES subscriptions (id),
  plan_version_id UUID NOT NULL REFERENCES plan_versions (id),
  valid_during    TSTZRANGE NOT NULL,   -- closed-open: [period start, next period start)
  amount          BIGINT NOT NULL,
  currency        TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('scheduled', 'charging', 'paid', 'failed', 'waived')),
  attempt_count   INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT subscription_periods_valid_during_excl
    EXCLUDE USING GIST (subscription_id WITH =, valid_during WITH &&)
);
```

A period is a `TSTZRANGE`, not a `DATERANGE`, because a billing period runs between instants: it renews at a moment, computed from the anchor in a zone, and access ends at that moment, not at some midnight. It's closed-open like every other range in [Effective Dating & History](/docs/database/temporal-data), so one period ends exactly where the next begins. The exclusion constraint (which needs `btree_gist`) means a subscription can never have two periods covering the same moment, including two rows for the same renewal.

The **billing anchor** is the reference point every period aligns to: the day of the month for monthly plans, the day and month for annual ones, defaulting to the sign-up date or the trial's end. Three things go wrong with it, and [Time & Date Formats](/docs/fundamentals/time) has the tools for each:

- **Month ends.** Clamp, don't drift: Stripe's January 31 anchor bills February 28 (or 29), then March 31, April 30.
- **Calendar durations.** A 14-day trial is `P14D` and a month is `P1M`, added with a calendar library, never 30 days of seconds.
- **Whose midnight.** "Renews on the 1st" means the 1st somewhere. Stripe's anchors are UTC; for customers who think in local days (a gym, a utility, a service plan) I store the anchor as a local date plus an IANA zone and compute each period's instants from it.

A mid-period sign-up that bills on the 1st gets a short first period, prorated or free: a product decision to write down, not a library side effect.

## Renewal Jobs

Renewal is a [scheduled background job](/docs/architecture/background-jobs#scheduling) that moves money, so it has to be safe to run twice. The pattern:

1. **Create the next period row ahead of time,** in `scheduled`, from the current plan version. The exclusion constraint means two workers can't both create it: the second insert overlaps the first and fails.
2. **Claim it with a guarded update** (`SET status = 'charging' WHERE id = $1 AND status = 'scheduled'`), so only one worker charges.
3. **Charge with an idempotency key derived from the period and the attempt,** never from the job run: `subscription_period_0194f1c2-...:attempt-1`. A crashed job that reruns sends the same key and gets the same payment back; a retry three days later after a soft decline is attempt 2, a new key and a real second try.
4. **Record the outcome on the period** before moving on, with the payment's ID, and emit the event.

No single mechanism makes a period paid at most once. The constraint guarantees there's only one row for each renewal; the guarded update guarantees only one worker charges it at a time; the idempotency key makes a retried request return the original payment instead of creating a second one. Providers expire keys, though, so the period's status carries the guarantee after that: a period already `paid` is never claimed again, and a period left in `charging` by a crashed worker is reconciled by looking up the payment under its key with the provider before anyone tries again. Before charging, the job checks the subscription's state, not just the calendar, so a subscription paused or cancelled an hour ago isn't charged because yesterday's run created its period. The payments volume walks the same job against card network rules in [Renewal Jobs](/books/payments/stored-credentials#renewal-jobs).

## Plan Changes and Proration

Plans change: a team adds seats, a player upgrades, a member drops to off-peak. Two decisions make this tractable.

**Version the terms.** Prices and contents live in `plan_versions` with effective dates, and each period records the version it billed. Editing the "Pro" price creates a version for new sign-ups; moving existing subscribers is a separate, notified price change (below).

**Decide when each kind of change takes effect.** My default, and what Apple's App Store does:

- **Upgrades apply now,** prorated: credit the unused time on the old plan, charge the remaining time on the new one. Stripe's example is a $10 plan upgraded to $20 halfway through the period: a $5 credit and a $10 charge, so $5 due.
- **Downgrades apply at the next renewal.** The customer keeps what they paid for until the period ends, and nobody has to compute or refund a negative proration.

Proration has sharp edges worth deciding once:

- **Granularity.** Stripe prorates to the second by default; most customers understand days better. Pick one, compute in integer minor units, and round per [Money & Amounts](/docs/payments/money#rounding).
- **Preview with a fixed instant.** Compute the preview at a stated `prorated_at` and apply the change with the same one, so "$4.17 due today" isn't charged as $4.18.
- **Don't credit what wasn't paid.** A change while the current period is `failed` can credit time the customer never paid for. Settle or void it first, or skip proration.
- **Credits are ledger entries,** a balance owed to the customer and applied to the next charge or refunded ([Payments Are Applied, Not Assigned](/docs/payments/payment-states#payments-are-applied-not-assigned)).

## Dunning

A renewal that fails turns into **dunning**: retrying, telling the customer, and deciding what happens to their access meanwhile. The shape is the same in every industry:

- **Retries.** Soft declines (insufficient funds, a temporary issuer problem) are retried over days, timed to when money tends to arrive; hard declines (closed account, revoked authorization) wait for a new payment method. The networks limit and fine excessive retries, and those rules live in the payments volume: [Declines, and the Rules on Retrying](/books/payments/stored-credentials#declines-and-the-rules-on-retrying). The attempt count lives on the period, so the cap survives a restart.
- **The retry path.** A declined charge moves the period from `charging` to `failed`, increments `attempt_count`, sets `next_attempt_at` from the retry schedule (or leaves it empty for a hard decline), and moves the subscription to `past_due`, all in one transaction with the event. The retry job claims due periods with the same guarded update, `SET status = 'charging' WHERE id = $1 AND status = 'failed' AND next_attempt_at <= NOW()`, and charges with the next attempt's key. A new payment method from the customer schedules an attempt for now. Success moves the period to `paid` and the subscription back to `active`; running out of attempts or grace ends it, below.
- **Notices.** Each failure sends a link that fixes the problem in one step: update the card, authenticate, pay. Prevention is cheaper: an account updater for reissued cards, and a warning before a card on file expires.
- **Grace.** A stated number of days in `past_due`, with access continuing or not: a product decision, explicit and the same for everyone. Apple offers developers a 3, 16 or 28 day billing grace period and attempts recovery for 60 days; Google Play's account hold runs to 60 days minus the grace period.
- **The end.** When grace runs out, the subscription is `ended` with `ended_reason = 'non_payment'`, and what's owed follows the collection policy. This **involuntary churn** is reported apart from customers who chose to leave: one needs better billing, the other a better product.

A customer who fixes their payment during grace returns to `active` with no gap, on the same anchor.

## Cancellation

Cancellation is where customer experience and law meet, and the law sets the floor (next section). The design that satisfies both:

- **Cancel in the medium of sign-up.** Signed up in the app or online, cancel there, from a prominent link in account settings; by phone or in person, a line or desk that answers. Accept every other channel too (an email, a chat, a word to a staff member), all creating the same `cancellation_requests` row.
- **Stamp the receipt time.** `received_at` is when the customer asked, not when staff worked the ticket. It's the legal clock and the dispute evidence.
- **Store the effective date.** `effective_on` is the period end (the default when prepaid) or immediate, with any refund computed from the plan version the customer signed, and early termination fees only if those terms contain them.
- **Confirm it** in the channel they used, with the effective date and any final amount.
- **Ask why, optionally:** a reason from a controlled list, optional for the customer and required for the record.

**Save offers are configuration, not code.** A discount, pause or cheaper plan offered during cancellation is legitimate, and some laws allow it only on conditions (below). Whether an offer may be shown, in which channel and jurisdiction, is a row someone can change, and one click or one word always declines it. An accepted offer is a change of terms, recorded like a sale.

Cancelling isn't deleting: a cancelled subscription keeps its history ([Data Retention & Deletion](/docs/architecture/data-retention)).

## The Law of Automatic Renewal

This isn't legal advice: counsel decides which rules apply to which customers. The system's job is to make their decisions enforceable and provable.

**Federal, United States.** The Restore Online Shoppers' Confidence Act, [15 U.S.C. 8403](https://www.law.cornell.edu/uscode/text/15/8403), applies to negative option sales online. It requires clear and conspicuous disclosure of the material terms before billing information is collected, the consumer's express informed consent before the charge, and simple mechanisms to stop recurring charges.

The FTC's 2024 "click-to-cancel" amendments to its Negative Option Rule never took effect: the Eighth Circuit vacated them on July 8, 2025, days before they were due to apply on July 14, on procedural grounds. The FTC started again with an advance notice of proposed rulemaking announced on March 11, 2026, published in the Federal Register on March 13, with comments due April 13, 2026. It asks whether to revive pieces of the vacated rule, among them consent record retention and a simple cancellation mechanism. As of October 2026 I can find no proposed rule. ROSCA applies in the meantime, and so do the state laws.

**State automatic renewal laws.** States add their own rules on top, and California's ([Bus. & Prof. Code 17600 to 17606](https://california.public.law/codes/business_and_professions_code_section_17602)) is the strictest well-known one, so it's the reasonable worst case to design to. As amended by AB 2863, for contracts entered into, amended or extended from July 1, 2025, section 17602 requires:

- **Express affirmative consent** to the automatic renewal terms before any charge, with the terms shown clearly beforehand and an acknowledgment the customer can keep.
- **Proof of consent** kept for at least three years, or one year after the contract ends, whichever is longer.
- **Online cancellation** for online sign-ups, at will, through a prominent link or button or a termination email, and cancellation in the medium the customer signed up with or normally uses.
- **Save offers** only with the "click to cancel" option displayed alongside online, or, by phone, after telling the customer they can cancel at any time by saying "cancel".
- **Notice of a price change** 7 to 30 days before it takes effect, with how to cancel.
- **An annual reminder** for annual plans, stating the service, the amount and frequency of charges, and how to cancel; and a notice 3 to 21 days before a free trial or promotional price longer than 31 days ends, or 15 to 45 days before a term of a year or more renews.

Goods shipped under an automatic renewal without that consent are an unconditional gift to the consumer under section 17603. The card networks add their own rules for free trials that convert to paid subscriptions ([Trials and Cancellation](/books/payments/stored-credentials#trials-and-cancellation)).

### Consent and Reminders as Data

Each of those rules turns into a record or a scheduled job:

```sql
CREATE TABLE disclosures (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  kind            TEXT NOT NULL CHECK (kind IN ('terms', 'renewal', 'cancellation', 'price_change', 'messaging_consent')),
  locale          TEXT NOT NULL,                            -- BCP 47: 'en-US', 'es-US'
  version         TEXT NOT NULL,                            -- '2026-10-01'
  content_sha256  TEXT NOT NULL,                            -- hash of the rendered text shown
  storage_key     TEXT NOT NULL,                            -- the rendered text, in WORM storage
  effective_at    TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT disclosures_kind_locale_version_key UNIQUE (kind, locale, version)
);

CREATE TABLE renewal_consents (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  subscription_id UUID NOT NULL REFERENCES subscriptions (id),
  plan_version_id UUID NOT NULL REFERENCES plan_versions (id),
  disclosure_id   UUID NOT NULL REFERENCES disclosures (id), -- the exact terms text shown
  channel         TEXT NOT NULL CHECK (channel IN ('web', 'app', 'phone', 'in_person', 'paper')),
  evidence_ref    TEXT,                                     -- checkbox event, recording, signed document
  consented_at    TIMESTAMPTZ NOT NULL,
  retain_until_on DATE NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- **Disclosures are immutable versions.** A wording change, in any locale, is a new row with its own hash and stored rendering, never an edit, the same shape as [click-through terms](/docs/compliance/electronic-signatures#click-through-terms-are-signatures-too), so a consent or a notice always resolves to the exact text the customer saw.
- **Consent is its own row,** separate from the terms of service, pointing at the versioned disclosure the customer saw, and captured again when terms change materially.
- **Retention is computed:** `retain_until_on` is extended when the subscription ends.
- **Reminders are scheduled from the period rows,** with windows stored as rules keyed by jurisdiction and effective date, sent on the transactional stream so a marketing unsubscribe never suppresses them.
- **A price change is a workflow,** not an edit: a new plan version, a logged notice per subscriber, and the new price only on periods starting after the notice window.

## App Store Subscriptions

Digital subscriptions sold inside an iOS or Android app usually go through the store, and then Apple or Google own the billing: they charge, retry, run the grace period and host the cancellation screen (on Apple, the App Store's account settings). Your system receives state rather than driving it. Treat the store as another payment provider: map its server notifications onto your states at the boundary, verify each with the store's server API before granting access, and keep its transaction ID as an external reference (`_xid`). A customer can hold a web and a store subscription at once, so entitlements are computed across both.

## Checklist

- **Closed states with guarded transitions;** cancelling sets an effective date, `ended` carries a reason.
- **Access derived from state, period and grace** in one function, never a flag.
- **Period rows as closed-open `valid_during` ranges** that can't overlap, clamped month-end anchors and calendar durations.
- **Renewals keyed by period and attempt,** claimed with a guarded update, checking state before charging, with a stuck `charging` period reconciled against the provider before any retry.
- **A failed-charge path** that records the attempt, schedules the next one, and claims it the same guarded way.
- **Versioned plans,** upgrades prorated now and downgrades at renewal, previews computed at a fixed instant, and credits posted to the ledger.
- **Dunning as retries, notices and a stated grace period,** with network retry limits respected and involuntary churn reported separately.
- **Cancellation in the medium of sign-up and every other channel,** stamped with receipt time, confirmed with an effective date, and save offers as configuration.
- **Renewal consent records, reminders and price-change notices** as data and scheduled jobs, kept as long as the strictest rule requires.

## References

**Law and regulation**

- [15 U.S.C. 8403](https://www.law.cornell.edu/uscode/text/15/8403), ROSCA's disclosure, express informed consent and simple cancellation requirements for online negative option sales
- [Cal. Bus. & Prof. Code 17602](https://california.public.law/codes/business_and_professions_code_section_17602), California's consent, consent records, online cancellation, save offers, price-change notice, annual reminder and trial and renewal notice windows
- [Cal. Bus. & Prof. Code 17603](https://california.public.law/codes/business_and_professions_code_section_17603), goods sent without affirmative consent are an unconditional gift
- [Kilpatrick: California automatic renewal law amendments](https://ktslaw.com/en/insights/alert/2024/10/california-latest-automatic-renewal-law-amendments-take-effect-in-july-2025), AB 2863's requirements and its July 1, 2025 effective date
- [Greenberg Traurig: Eighth Circuit vacates FTC's click-to-cancel rule](https://www.gtlaw.com/en/insights/2025/7/eighth-circuit-vacates-ftcs-click-to-cancel-rule), the July 8, 2025 vacatur and the July 14, 2025 date the rule would have taken effect
- [Covington: FTC launches new rulemaking on the Negative Option Rule](https://www.cov.com/en/news-and-insights/insights/2026/03/ftc-launches-new-rulemaking-on-the-negative-option-rule), the March 2026 advance notice, its Federal Register publication and comment deadline
- [Greenberg Traurig: FTC seeks comment on potential updates to Negative Option Rule](https://www.gtlaw.com/en/insights/2026/3/ftc-seeks-comment-on-potential-updates-to-negative-option-rule), the questions the advance notice asks, including consent record retention and cancellation mechanisms

**In practice**

- [Stripe: How subscriptions work](https://docs.stripe.com/billing/subscriptions/overview), subscription statuses, the 23-hour window for a first payment, and past-due outcomes
- [Stripe: Set the subscription billing renewal date](https://docs.stripe.com/billing/subscriptions/billing-cycle), billing cycle anchors, month-end clamping and UTC anchors
- [Stripe: Prorations](https://docs.stripe.com/billing/subscriptions/prorations), proration on plan changes, per-second granularity, previews at a fixed proration date, and credits for unpaid time
- [Apple: Auto-renewable subscriptions](https://developer.apple.com/app-store/subscriptions/), store-managed renewal and cancellation, billing retry, grace periods, and upgrade and downgrade timing
- [Android Developers: Subscription lifecycle](https://developer.android.com/google/play/billing/lifecycle/subscriptions), Google Play subscription states, grace period, account hold and real-time developer notifications
