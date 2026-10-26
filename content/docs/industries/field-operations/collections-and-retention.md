+++
title = "Collections & Retention"
description = "Collections and retention: failed payments, retries and dunning, holding service, AR aging and write-offs, agencies and Reg F, cancellations, saves and churn."
category = "Field Operations Industry"
order = 1528
part = "Customers and Billing"
tags = ["field-operations", "collections", "dunning", "churn", "retention", "cancellation"]
+++

A recurring service business loses customers two ways. Some decide to leave: the bugs came back, a neighbor's company is cheaper, they moved. Others never decided anything: their card expired, the autopay failed, three statements went to an old email, and six months later the agreement is terminated with a balance nobody will pay. The first is **voluntary churn** and the second **involuntary churn**, and they need opposite responses. Voluntary churn is a service and sales problem you can only partly win back; involuntary churn is a systems problem, mostly recoverable if the platform notices in days instead of months. Field service makes both harder than software subscriptions, because the service is physical: the house may already be treated before anyone knows the payment failed, and stopping service is a truck that doesn't roll.

The general subscription machinery (retry schedules, dunning states, the cancellation flow and the automatic renewal law behind it) is in [Subscriptions](/docs/payments/subscriptions). This chapter is what field service adds: the technician as a collection channel, the decision to keep serving or hold, delinquency across properties, collection agencies and Regulation F, cancellations that arrive at the door, and churn typed by reason. What was billed is [Billing Recurring Service](/docs/industries/field-operations/billing-recurring-service).

## Why Payments Fail

Recurring charges fail for a short list of reasons: insufficient funds, an expired or reissued card, a closed account, an issuer's fraud rule, and a customer who revoked the authorization. The first is a **soft decline** that may clear on retry; the others are **hard declines** that need a new payment method or a conversation. On ACH, the equivalent is a **return**, which arrives days after the payment looked successful. The classification rules and the networks' penalties for excessive retries are in [Declines, and the Rules on Retrying](/docs/industries/payments/stored-credentials#declines-and-the-rules-on-retrying); ACH returns and when to stop debiting are in [After a Return](/docs/industries/payments/ach#after-a-return-fees-and-blocks).

Field agreements make card decay worse than in most subscriptions: a multi-year pest or HVAC maintenance agreement outlives the card it was sold on, and a card captured on a tablet at the door may have no email beside it to warn the customer before it expires. Prevention (account updater, an expiring-card notice a month ahead, a technician prompt to update the card at the next visit) beats recovery.

## Retries: How the Platforms Do It

Vendors range from no automatic retry at all to machine-learned scheduling:

| | Automatic retry | Customer told | What happens after |
| --- | --- | --- | --- |
| Jobber | None: one attempt, then admins are alerted | Receipt on success | Manual collection |
| FieldRoutes | Manual rerun from a Failed Payment Methods report; ACH returns automated | Bad-account ACH returns emailed | Collection stages, holds, freezes |
| Stripe Billing | Smart Retries (recommended default 8 tries within 2 weeks) or custom retries | Failed-payment email with an update link | Cancel, unpaid, past due or pause, per configuration |

FieldRoutes' ACH automation is the detail worth copying. On a return it reverses the payment, reopens the invoice, flags the bank account invalid and can add a return fee, and it emails the customer only for "bad account" return codes (R02, R03, R04 and similar), not for R01 insufficient funds, where a retry or a call is the better next step. The return code decides the response, the same way a decline code does on cards.

My default for a field platform is the processor's retry shape with field timing: soft declines retried over days, timed to paydays and the start of the month, hard declines never retried, and the attempt count persisted per invoice so the network limits are never crossed ([Subscriptions](/docs/payments/subscriptions#dunning)). What changes in the field is that a retry schedule competes with the route: if the next visit is in four days, a retry the evening before the visit, and a technician prompt the morning of, are worth more than a retry a week later.

## Dunning: The Technician Is a Channel

**Dunning** is the sequence of notices that turns a failed payment into a fixed one: a schedule, channels, and a link that fixes the problem in one step. GorillaDesk runs up to six late-payment reminders on day ranges the business sets, each with a payment link; Stripe emails after each failed payment with a hosted update page. That part is the same as any subscription.

Field service adds a channel software companies lack: **the technician**, who sees a recurring customer four to twelve times a year. FieldRoutes' Tech Collections report compares each technician's collection opportunities with what they collected, and it notes that some companies require past-due amounts to be paid before service starts. For the system, that means:

- **The day's route shows the balance.** A visit for a past-due account carries the amount and a one-tap payment link the technician can text, or a card-present payment on the device.
- **The technician isn't a debt collector.** The prompt is "there's a balance on the account; want to take care of it now?", not pressure at the door. Scripted wording, no threats about stopping service unless the policy says so, and nothing collected in cash without a receipt.
- **Commercial accounts are different.** A facilities client paying net 30 through its accounts-payable portal isn't delinquent on day 31; dunning for commercial accounts follows the purchase order's terms and goes to the AP contact, not the site manager the technician meets.

Notices go out through the outbound gate under the `collections` purpose ([Notifications & Consent](/docs/architecture/notifications#purpose-decides-everything)), which keeps them separate from marketing opt-outs; calling hours and consent are in [Calls, Texts & Email](/docs/compliance/consumer-contact). A business collecting its own debt in its own name is generally not a federal "debt collector" (below), but borrowing Regulation F's conventions costs nothing, and state collection laws don't always follow the federal definition. California's Rosenthal Act is the usual example: it defines a debt collector as anyone who regularly collects debts "on behalf of that person or others," so a business collecting its own residential accounts in California is a debt collector under it.

## Holding Service for Non-Payment

The decision unique to field service is what to do with the next visit. Options, from softest to hardest:

1. **Keep serving** through a grace period. Stripe's pause collection models this: the subscription stays active while collection pauses.
2. **Collect at the door.** The technician takes payment before or at the visit.
3. **Hold.** FieldRoutes distinguishes a hold from a freeze. A held subscription is a temporary suspension: it leaves the job pool (appointments can still be forced), shows as active, and the company is meant to resolve the dispute or collect meanwhile; customers can't be billed while on hold.
4. **Terminate.** The agreement ends and nothing more is scheduled. FieldRoutes calls its version a freeze: a frozen subscription can't be scheduled, freezing requires a reason, and it can be reversed with the account data kept.

Holding has consequences beyond the balance, and they differ by trade. A termite warranty with an annual inspection can lapse; a pool left untreated for two weeks in summer turns green and costs more to recover than the balance; a commercial kitchen's pest service may be required for its health inspection; an HVAC membership's spring tune-up has a narrow season. So the agreement must say what non-payment does to service ([Service Agreements & Plans](/docs/industries/field-operations/service-agreements)), and the policy days must be the same for everyone and enforced by the system, which is what makes them defensible.

![An account's delinquency states. Current, where autopay runs and visits are booked, moves to past due on a failed payment, where retries and notices run and service continues. On a policy day it moves to on hold, with no new visits and billing paused, then to written off, a bad-debt entry that is still owed, and finally to an agency with a placement file, where Regulation F applies. A payment that clears the balance returns the account to current from any state.](/diagrams/fo-collections-and-retention-delinquency.svg "Each forward step fires on a policy day set by the business. Payment at any stage returns the account to current.")

## AR Aging and Write-Offs

**Accounts receivable (AR) aging** groups unpaid balances by how long they've been outstanding (current, 1 to 30, 31 to 60 days and so on). FieldRoutes' Collections report ages each customer from the oldest unpaid invoice (due dates come from the service type's net billing days) and tracks a collections stage per customer. A collections tool needs a short set of bulk actions: fees added as new invoices (never edits to old ones), holds that can be rolled back, agency placement, a stage change, and the write-off.

Model the write-off as its own ledger entry with a reason and approver, rather than a credit or coupon: a coupon-based write-off makes bad debt look like a sales concession, and a later agency recovery needs something to reverse. The entry shown here (debit bad-debt expense, credit receivables) is the **direct write-off method**. A business reporting under GAAP uses the **allowance method** instead: it estimates uncollectible receivables each period into an allowance, and a write-off then debits the allowance rather than expense. The system should support both, because the bookkeeper picks, not the platform. Writing off doesn't forgive the debt. Late fees are subject to state rules, so check them before automating fees.

## Collection Agencies and the Law

FieldRoutes says plainly that it doesn't offer a collections company, so a business exports the selected accounts, sends the file to its agency, and marks those customers' stage as sent. A **placement file** is the agency's starting record: debtor identity and contacts, service address, the itemized balance, invoice dates, last payment, the agreement, and any dispute history. After placement, the agency's payments and the business's direct payments both have to reach the same balance, so the integration needs a way back (payments, recalls, closures), not just a one-way export.

The federal rules are the Fair Debt Collection Practices Act and the CFPB's Regulation F, which apply to **debt collectors** collecting consumer debts (obligations "primarily for personal, family, or household purposes," which residential service is). A creditor collecting its own debts in its own name generally isn't a debt collector, but becomes one if it uses "any name other than its own that would indicate that a third person" is collecting. So an in-house "collections department" with a separate made-up name is a trap. Once an agency holds the account, it must, among other things:

- **Send a validation notice** in the initial communication or within five days after, itemizing the debt from a chosen itemization date, with a validation period ending 30 days after the consumer receives it; a written dispute in that period stops collection until verification is sent. Your placement file has to support that itemization (amount on the itemization date, then interest, fees, payments and credits since).
- **Limit calls.** Placing calls more than seven times within seven days, or within seven days after a phone conversation, about a debt is presumed to be harassment.
- **Avoid inconvenient times,** presumed to be before 8 a.m. and after 9 p.m. at the consumer's location, and include a simple opt-out in emails and texts.
- **Not report to credit bureaus first.** A collector can't furnish the debt to a consumer reporting agency before communicating with the consumer.

Two events must stop collection everywhere at once. A **dispute** of the debt (in writing, during validation) pauses the agency. A **bankruptcy** petition operates as an automatic stay from the moment it's filed, barring "any act to collect, assess, or recover a claim against the debtor" that arose before the case. The stay doesn't wait for the business to hear about it, so autopay, dunning, fees and agency placement all have to stop the moment notice arrives, and anything that ran in between needs review. My rule: one `collection_stop` that every collection path checks, because a stop that reaches four of five paths still violates the stay. States add their own collection laws and licensing, so check current state law before building in-house collections beyond reminders.

## Cancellations

Customers cancel by phone, in the portal, by text to the technician and at the door, and a platform must treat all of them as the same request with the same outcome. The outcome depends on the agreement's state: a request before the agreement is `active` (including in the cooling-off window) moves it to `cancelled`; ending an `active` agreement moves it to `terminated`, with a churn type and a reason. The general design (one cancellation request from any channel, stamped when received, an effective date, a confirmation, a reason from a controlled list) and the automatic renewal law behind it are in [Subscriptions](/docs/payments/subscriptions#cancellation); the field rules, including the door-to-door cooling-off right, are in [Consumer Protection](/docs/industries/field-operations/consumer-protection).

FieldRoutes requires a cancellation reason before a customer can be cancelled, with reasons configured per office or globally and feeding its cancellation and reinstatement reports. Its online cancellation creates a task for staff, and its article advises consulting counsel on subscription disclosure and consent requirements. What's particular to the field:

- **The technician hears it first.** "We're moving, this is the last time" said on the driveway is a cancellation request. The technician app needs a one-step "customer asked to cancel" that creates the same request, timestamped then, not when the office reads the note.
- **The route has to know.** The effective date removes future visits from the schedule in the same transaction; a technician who shows up after the customer cancelled turns a clean exit into a complaint.
- **The final bill comes from the service balance.** Work performed, the period in progress, early termination fees only if the signed agreement states them, and refunds of unearned prepayments, all computed as in [Billing Recurring Service](/docs/industries/field-operations/billing-recurring-service).
- **Some obligations outlive the agreement.** A termite warranty, a final inspection or a seasonal pool closing may still be owed or still be offered; the cancellation should say which, rather than leave the customer to find out.

![The cancellation flow. A cancel request arrives through any channel the customer signed up through, an optional reason is captured, and a save offer may be shown that one click declines. The cancellation is confirmed with an effective date set, and a final bill and notice are sent with future visits removed. If the customer accepts the offer instead, the save is logged with the offer and the request is closed.](/diagrams/fo-collections-and-retention-cancel.svg "A save offer is a step the customer can skip, never a gate. Accepted offers are logged against the request they closed.")

## Retention Offers and Saves

A **save** is a cancellation request that ends with the customer staying. The offers that work in field service are mostly service changes, not discounts:

- **A free re-service** when the reason is "the problem came back," which is often what a pest or lawn customer means.
- **A pause** for snowbirds and customers between moves: the customer asks, visits stop and billing usually stops with them. It isn't a hold, which is the company stopping service for non-payment or a dispute.
- **Frequency down** (quarterly to every other quarter, a weekly pool route to biweekly in winter) or a smaller plan for price objections.
- **A discount** for a term.
- **A different technician** or time window when the reason is the experience.

Saves must be recorded as carefully as sales: the request, the offer, who made it, what was accepted, and the terms change, because an accepted offer is a contract amendment and a sales rep's commission may depend on it ([Sales Teams & Commissions](/docs/industries/field-operations/sales-teams-and-commissions)). The rule that an offer is configuration the customer can decline in one step, and never delays the cancellation, is in [Subscriptions](/docs/payments/subscriptions#cancellation). The field addition: a save made at the door by a technician or a retention rep needs the customer's confirmation in writing, because "I never agreed to keep the service" is worse than a clean cancel.

## Win-Back

**Win-back** is selling to former customers. FieldRoutes' Cancellation Reinstatement report lists subscriptions cancelled and later reactivated with the days between and the cancellation notes, and suggests using it to measure win-back tactics; Jobber lists a client re-engagement report among its client reports.

Win-back campaigns are marketing, so they need consent under the `marketing` purpose ([Notifications & Consent](/docs/architecture/notifications#the-consent-ledger)), and a former customer who said stop must not be messaged. Segment by reason: a customer who left over price can take an offer; one who left over a damaged lawn needs an apology first; one who moved is a lead at the property they left, whose new owner the platform can reach ([Customers, Accounts & Properties](/docs/industries/field-operations/customers-and-properties)). A reinstatement should link to the original customer and its history rather than create a new account, so retention reports see a return, not a new sale.

## Churn Metrics

Churn definitions (logo and agreement churn, cohorts, the churn types and what's excluded) are owned by [Operating Metrics](/docs/industries/field-operations/operating-metrics#retention-and-churn), so the retention team and the dashboard count the same way. What this chapter adds is the data they need:

- **Every `terminated` agreement carries a `churn_type`** (`voluntary`, `involuntary` or `administrative`) and a reason from a controlled list. Non-payment is involuntary; a customer who moves is voluntary unless the agreement transfers to the new owner. A pre-activation `cancelled` agreement is a sales outcome, not churn.
- **Recovery rate:** failed amounts recovered by retries, by dunning, by technicians and by agencies, and the time each took.
- **Save rate** by offer and by reason, and the 90-day survival of saved customers.

This system's job is to emit the events those metrics are computed from: `agreement.terminated` with churn type and reason (and `agreement.cancelled` for pre-active cancellations, which metrics keep out of churn), `payment.succeeded` on a recovered invoice with the channel that recovered it, and a save with its offer.

## How to Build It

Model delinquency on the account, not on each invoice, with an explicit state machine. The policy days (past due to hold, hold to write-off, write-off to placement), late fee rules and "collect before service" are per-tenant rules with effective dates, stored as data ([Rules as Data](/docs/architecture/rules-as-data)). The tables extend the canonical `accounts` and `agreements` from [The Field Operations Business](/docs/industries/field-operations/field-operations-business#the-core-data-model):

```sql
CREATE TABLE account_collections (
  account_id      UUID PRIMARY KEY REFERENCES accounts (id),
  tenant_id       UUID NOT NULL,
  state           TEXT NOT NULL CHECK (state IN
                    ('current', 'past_due', 'on_hold', 'written_off', 'placed')),
  oldest_due_on   DATE,
  collection_stop TEXT CHECK (collection_stop IN ('dispute', 'bankruptcy', 'deceased')),
  agency_id       UUID,
  placed_at       TIMESTAMPTZ,
  state_since_at  TIMESTAMPTZ NOT NULL
);

CREATE TABLE cancellation_requests (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  agreement_id  UUID NOT NULL REFERENCES agreements (id),
  received_at   TIMESTAMPTZ NOT NULL,
  channel       TEXT NOT NULL CHECK (channel IN ('phone', 'email', 'web', 'text',
                  'mail', 'technician', 'ai_agent')),
  postmarked_on DATE,             -- mail only
  reason_code   TEXT,
  reason_text   TEXT,
  offer_id      UUID,             -- the save offer shown, if any
  outcome       TEXT CHECK (outcome IN ('cancelled', 'terminated', 'saved', 'withdrawn')),
  churn_type    TEXT CHECK (churn_type IN ('voluntary', 'involuntary', 'administrative')),
  effective_on  DATE
);
```

Rules for the machinery:

- **A daily evaluator moves accounts forward** by policy days and emits an event per transition ([Events](/docs/architecture/events)); scheduling, the portal, the technician app, dunning and agency export subscribe instead of each computing delinquency themselves.
- **An account on hold opens a `hold` interval** in `agreement_suspensions` on each of its agreements, and each agreement's `on_hold` status derives from that interval ([Service Agreements & Plans](/docs/industries/field-operations/service-agreements#pausing-and-holding)). That's the company-initiated stop (no new visits); a customer-requested stop is a `pause` interval, and the two never share a reason list. Clearing the hold closes the intervals.
- **Any payment re-evaluates immediately.** A balance cleared by a portal payment at 7 p.m. should restore the visit on tomorrow's route, which means the dispatcher sees the change before routes publish ([Dispatch & the Day of Service](/docs/industries/field-operations/dispatch)).
- **`collection_stop` beats everything.** Retries, notices, fees, holds and placement all check it, and setting it records who and why.
- **Multiple properties, one payer.** A property manager's unpaid balance shouldn't put tenant-paid properties on hold; FieldRoutes' Bulk Freeze offers both choices for this reason. Decide per relationship and show the consequence before confirming.
- **Partial payments** reduce the balance but don't reset aging unless they clear the oldest invoice.
- **Disputes in flight.** An open card chargeback on an invoice ([Disputes & Chargebacks](/docs/industries/payments/disputes-and-chargebacks)) is excluded from dunning and placement until it resolves; collecting the same money twice is the worst outcome.
- **Write-offs and recoveries are ledger entries,** and agency remittances net of the agency's fee post as a payment plus a collection cost.

Build or buy: retries and dunning emails come almost free from the processor or a subscription engine, and agencies come with their own portals and file formats. The platform's own value is the field-specific parts: the hold-versus-serve decision, technician collections, the cancel path from the driveway, and churn typed by reason.

## Auditing

Collections and cancellations are where consumer complaints, regulator inquiries and lawsuits start, and the record is the defense. The general design is in [Audit Trails](/docs/architecture/audit-trails), and field records are in [Audit Trails & Records](/docs/industries/field-operations/audit-trails-and-records). For field collections, make sure the record shows:

- **Every collection-state transition** with the rule version or person that caused it and the balance at that moment, including the notices sent before service was held. That's the proof the customer was told before the truck stopped coming.
- **Collection stops** (dispute, bankruptcy notice) with the document received, who set and cleared the stop, and every path that honored it.
- **Placement files as sent,** and every recall and remittance back.
- **Cancellation requests from the moment received,** including those a technician entered on site, with the offer shown, the response, the effective date and the visits removed.

## What This Means for the System You Build

- **A churn type and controlled reason** on every terminated agreement, kept apart from pre-activation cancellations, with the definitions in Operating Metrics.
- **Retries that follow decline and return codes,** persisted attempt counts, and timing aware of the next visit.
- **The technician as a collection channel:** the balance and a payment link on the day's route, with scripted, low-pressure wording.
- **An account-level collection state machine** driven by tenant policy days stored as rules, emitting events that scheduling, portal and dispatch obey, with a per-trade view of what holding service costs.
- **A collection stop** for disputes, bankruptcy and similar events that stops every collection path at once.
- **Write-offs as ledger entries,** recoverable later, and agency placement files with Regulation F itemization data plus a return path.
- **Cancellation requests from every channel, the driveway included,** that remove future visits and compute the final bill from the service balance.
- **Saves and win-backs recorded as contract changes,** linked to the original customer and request.

## References

**Specifications**

- [12 CFR 1006.2 (Cornell LII)](https://www.law.cornell.edu/cfr/text/12/1006.2), who is a debt collector under Regulation F, consumer debts, and the creditor that collects under another name
- [12 CFR 1006.14 (Cornell LII)](https://www.law.cornell.edu/cfr/text/12/1006.14), the presumption of no more than seven calls within seven days, and none within seven days after a conversation
- [12 CFR 1006.6 (Cornell LII)](https://www.law.cornell.edu/cfr/text/12/1006.6), contact before 8 a.m. or after 9 p.m. presumed inconvenient, and opt-outs in electronic messages
- [12 CFR 1006.30 (Cornell LII)](https://www.law.cornell.edu/cfr/text/12/1006.30), no furnishing to a consumer reporting agency before communicating with the consumer
- [CFPB: Regulation F, 1006.34 Validation of debts](https://www.consumerfinance.gov/rules-policy/regulations/1006/34/), the validation notice, its itemization, timing and the validation period
- [11 U.S.C. 362 (Cornell LII)](https://www.law.cornell.edu/uscode/text/11/362), a filed petition operates as a stay of any act to collect a pre-petition claim
- [California Civil Code 1788.2 (FindLaw)](https://codes.findlaw.com/ca/civil-code/civ-sect-1788-2/), the Rosenthal Act's debt collector definition, which covers collecting "on behalf of that person or others"

**Reference**

- [Stripe: Automate payment retries](https://docs.stripe.com/billing/revenue-recovery/smart-retries), Smart Retries' recommended 8 tries within 2 weeks and subscription outcomes when recovery fails
- [Stripe: Automate customer emails](https://docs.stripe.com/billing/revenue-recovery/customer-emails), failed-payment and expiring-card emails and the hosted update page
- [Stripe: Pause payment collection](https://docs.stripe.com/billing/subscriptions/pause-payment), keeping a subscription active while collection is paused

**In practice**

- [FieldRoutes: Collections](https://knowledgebase.fieldroutes.com/docs/collections.md), balance age, collection stages and exporting to a third-party agency
- [FieldRoutes: Collections Actions](https://knowledgebase.fieldroutes.com/docs/collections-actions.md), fees, bulk freeze and rollback, agency placement and write-offs
- [FieldRoutes: Failed Payment Methods](https://knowledgebase.fieldroutes.com/docs/failed-payment-methods.md), declined autopay customers and manual reruns
- [FieldRoutes: ACH Return Automation](https://knowledgebase.fieldroutes.com/docs/ach-return-automation.md), automatic reversal, return fees and which return codes email the customer
- [FieldRoutes: 3 Ways to Drastically Improve Collections](https://knowledgebase.fieldroutes.com/docs/3-ways-to-drastically-improve-collections.md), technician collections and payment before service
- [FieldRoutes: Freezing vs placing on hold](https://knowledgebase.fieldroutes.com/docs/whats-the-difference-between-freezing-and-placing-a-subscription-on-hold.md), temporary holds versus frozen subscriptions
- [FieldRoutes: How to Freeze Customer Accounts](https://knowledgebase.fieldroutes.com/docs/how-to-freeze-customer-accounts.md), required reasons and reactivation
- [FieldRoutes: Cancellation and Hold Reasons](https://knowledgebase.fieldroutes.com/docs/cancellation-reasons.md), required cancellation reasons, hold reasons for past-due customers and the reports they feed
- [FieldRoutes: Online Service Cancellation](https://knowledgebase.fieldroutes.com/docs/online-service-cancellation.md), portal cancellation requests that create staff tasks
- [FieldRoutes: Cancellation Reinstatement Report](https://knowledgebase.fieldroutes.com/docs/cancellation-reinstatement-report.md), reactivated subscriptions and measuring win-back
- [Jobber: Automatic payments](https://help.getjobber.com/en/articles/automatic-payments/), a single automatic attempt and admin notification on failure
- [Jobber: Reports basics](https://help.getjobber.com/en/articles/reports-basics/), the client report set including re-engagement
- [GorillaDesk: Automated email and SMS](https://intercom.help/gorilladesk/en/articles/8944155-automated-email-sms), up to six late-payment reminders with a payment link
