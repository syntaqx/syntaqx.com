+++
title = "Collections & Retention"
description = "Collections and retention: failed payments, retries and dunning, holding service, AR aging and write-offs, agencies and Reg F, cancellations, saves and churn."
category = "Field Operations Industry"
order = 1531
part = "Customers and Billing"
tags = ["field-operations", "collections", "dunning", "churn", "retention", "cancellation"]
+++

A recurring service business loses customers two ways. Some decide to leave: the weeds came back, a neighbor's company is cheaper, they moved. Others never decided anything: their card expired, the autopay failed, three statements went to an old email, and six months later the agreement is terminated with a balance nobody will pay. The first is **voluntary churn** and the second **involuntary churn**, and they need opposite responses. Voluntary churn is a service and sales problem you can only partly win back; involuntary churn is a systems problem, mostly recoverable if the platform notices in days instead of months. Field service makes both harder than software subscriptions, because the service is physical: the house may already be treated before anyone knows the payment failed, and stopping service is a truck that doesn't roll.

The general subscription machinery (retry schedules, dunning states, the cancellation flow and the automatic renewal law behind it) is in [Subscriptions](/docs/payments/subscriptions). This chapter is what field service adds: the technician as a collection channel, the decision to keep serving or hold, delinquency across properties, collection agencies and Regulation F, cancellations that arrive at the door, and churn typed by reason. What was billed is [Billing Recurring Service](/books/field-operations/billing-recurring-service).

## Why Payments Fail

Recurring charges fail for a short list of reasons: insufficient funds, an expired or reissued card, a closed account, an issuer's fraud rule, and a customer who revoked the authorization. The first is a **soft decline** that may clear on retry; the others are **hard declines** that need a new payment method or a conversation. On ACH, the equivalent is a **return**, which arrives days after the payment looked successful. The classification rules and the networks' penalties for excessive retries are in [Declines, and the Rules on Retrying](/books/payments/stored-credentials#declines-and-the-rules-on-retrying); ACH returns and when to stop debiting are in [After a Return](/books/payments/ach#after-a-return-fees-and-blocks).

Field agreements make card decay worse than in most subscriptions: a multi-year pest or HVAC maintenance agreement outlives the card it was sold on, and a card captured on a tablet at the door may have no email beside it to warn the customer before it expires. Prevention (account updater, an expiring-card notice a month ahead, a technician prompt to update the card at the next visit) beats recovery.

## Retries: How the Platforms Do It

The field suites' public docs say less about retries than a subscription engine's do, and most of what they describe is a person following up:

| | Automatic retry | Customer told | What happens after |
| --- | --- | --- | --- |
| FieldRoutes | Manual rerun from a Failed Payment Methods report; ACH returns automated | Bad-account ACH returns emailed | Collection stages, holds, freezes |
| Housecall Pro | Not documented; plans charge the card on file on schedule | Not documented | Payments due while a plan was inactive wait until staff collect or cancel all of them |
| Jobber | None: "only attempted once," then admins are alerted | Receipt on success | The invoice stays unpaid until someone collects |
| PestPac (WorkWave) | Account updater before billing cycles | A secure link to update the card when the updater can't fix it (vendor blog) | Autopay resumes on the new token |
| ServiceTitan | None documented for membership billing; staff check the failure reason | Staff contact the customer for another method | The failed payment is removed from the membership invoice; a suspended membership leaves billing runs |
| Stripe Billing | Smart Retries (recommended default 8 tries within 2 weeks) or custom retries | Failed-payment email with an update link | Cancel, unpaid, past due or pause, per configuration |

Two details are worth copying. Prevention comes first: ServiceTitan's and WorkWave's account updater features refresh reissued cards before the charge, and ServiceTitan's own write-up calls a failed payment a risk of "involuntary churn." And the return code decides the response, the same way a decline code does on cards: on an ACH return FieldRoutes reverses the payment, reopens the invoice, flags the bank account invalid and can add a return fee, and it emails the customer only for "bad account" return codes (R02, R03, R04 and similar), not for R01 insufficient funds, where a retry or a call is the better next step. Product subscriptions run the same retries and updaters on a renewal amount that changes with every swap and add-on ([Dunning and Account Updaters](/books/commerce/subscription-commerce#dunning-and-account-updaters)).

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
3. **Hold.** A temporary stop that keeps the agreement alive. The vendors disagree on what it stops. ServiceTitan's Suspended status stops the membership's benefits and its billing runs but leaves its recurring services bookable; a FieldRoutes hold takes the subscription out of the job pool (appointments can still be forced) and also blocks billing while it lasts.
4. **End the agreement.** Nothing more is scheduled or billed. Both vendors keep the record reversible: ServiceTitan's Canceled status marks a membership inactive before it expires and stops its benefits and recurring services, and FieldRoutes' freeze stops scheduling, requires a reason and can be reversed with the account data kept. In this volume's model that's `terminated` with `churn_type = 'involuntary'`, and a later reinstatement is a win-back, not an edit.

Who moves the account is a choice too. In ServiceTitan suspending is a status a person sets; FieldRoutes offers hold reasons for past-due customers and bulk actions from its collections tools. My default is that a policy day moves the account and a person can override it with a reason, because a rule applied the same way to everyone is easier to defend than a judgment call made account by account.

Holding has consequences beyond the balance, and they differ by trade. A termite warranty with an annual inspection can lapse; a pool left untreated for two weeks in summer turns green and costs more to recover than the balance; a commercial kitchen's pest service may be required for its health inspection; an HVAC membership's spring tune-up has a narrow season. So the agreement must say what non-payment does to service ([Service Agreements & Plans](/books/field-operations/service-agreements)), and the policy days must be the same for everyone and enforced by the system, which is what makes them defensible.

![An account's delinquency states. Current, where autopay runs and visits are booked, moves to past due on a failed payment, where retries and notices run and service continues. On a policy day it moves to on hold, with no new visits and billing paused, then to written off, a bad-debt entry that is still owed, and finally to an agency with a placement file, where Regulation F applies. A payment that clears the balance returns the account to current from any state.](/diagrams/fo-collections-and-retention-delinquency.svg "Each forward step fires on a policy day set by the business. Payment at any stage returns the account to current.")

## AR Aging and Write-Offs

The aging buckets and the choices behind them (invoice date or due date, account or invoice) are defined in [Receivables](/books/field-operations/operating-metrics#receivables). The collections work list runs on them, usually one row per customer aged by its oldest unpaid invoice, with a collections stage. A collections tool needs a short set of bulk actions: fees added as new invoices (never edits to old ones), holds that can be rolled back, agency placement, a stage change, and the write-off.

A write-off is its own ledger entry with a reason and approver, never a coupon, and it doesn't forgive the debt; the direct and allowance methods are in [Write-Offs](/docs/payments/accounting#write-offs). The field twist is the agency: a recovery after placement reverses the write-off and posts the agency's fee as a collection cost.

Late fees are subject to state rules, so check them before automating fees. Maryland's consumer contract statute is an example of how specific they get: a late fee on a contract for goods or services for personal, family or household purposes generally can't be imposed until 15 days after the bill, is capped at the greater of $5 or 10% of the past-due payment per month with no more than three fees per past-due amount (or 1.5% a month under the alternative), and has to be disclosed in at least 10-point bold type. That's a per-state rule stored as data, not a constant.

## Collection Agencies and the Law

FieldRoutes says plainly that it doesn't offer a collections company, so a business exports the selected accounts, sends the file to its agency, and marks those customers' stage as sent. A **placement file** is the agency's starting record: debtor identity and contacts, service address, the itemized balance, invoice dates, last payment, the agreement, and any dispute history. After placement, the agency's payments and the business's direct payments both have to reach the same balance, so the integration needs a way back (payments, recalls, closures), not just a one-way export.

The federal rules are the Fair Debt Collection Practices Act and the CFPB's Regulation F, which apply to **debt collectors** collecting consumer debts (obligations "primarily for personal, family, or household purposes," which residential service is). A creditor collecting its own debts in its own name generally isn't a debt collector, but becomes one if it uses "any name other than its own that would indicate that a third person" is collecting. So an in-house "collections department" with a separate made-up name is a trap. Once an agency holds the account, it must, among other things:

- **Send a validation notice** in the initial communication or within five days after, itemizing the debt from a chosen itemization date, with a validation period ending 30 days after the consumer receives it; a written dispute in that period stops collection until verification is sent. Your placement file has to support that itemization (amount on the itemization date, then interest, fees, payments and credits since).
- **Limit calls.** Placing calls more than seven times within seven days, or within seven days after a phone conversation, about a debt is presumed to be harassment.
- **Avoid inconvenient times,** presumed to be before 8 a.m. and after 9 p.m. at the consumer's location, and include a simple opt-out in emails and texts.
- **Not report to credit bureaus first.** A collector can't furnish the debt to a consumer reporting agency before communicating with the consumer.

Two events must stop collection everywhere at once. A **dispute** of the debt (in writing, during validation) pauses the agency. A **bankruptcy** petition operates as an automatic stay from the moment it's filed, barring "any act to collect, assess, or recover a claim against the debtor" that arose before the case. The stay doesn't wait for the business to hear about it, so autopay, dunning, fees and agency placement all have to stop the moment notice arrives, and anything that ran in between needs review. My rule: one `collection_stop` that every collection path checks, because a stop that reaches four of five paths still violates the stay. States add their own collection laws and licensing, so check current state law before building in-house collections beyond reminders. Medical debt has its own credit reporting and state rules ([Medical Debt and Credit Reporting](/books/health-tech/patient-financial-experience#medical-debt-and-credit-reporting)).

## Cancellations

Customers cancel by phone, in the portal, by text to the technician and at the door, and a platform must treat all of them as the same request with the same outcome. The outcome depends on the agreement's state: a request before the agreement is `active` (including in the cooling-off window) moves it to `cancelled`; ending an `active` agreement moves it to `terminated`, with a churn type and a reason. The general design (one cancellation request from any channel, stamped when received, an effective date, a confirmation, a reason from a controlled list) and the automatic renewal law behind it are in [Subscriptions](/docs/payments/subscriptions#cancellation); the legal clock, the channel list and the postmark rule, including the door-to-door cooling-off right, are in [Renewal and Cancellation in the Field](/books/field-operations/consumer-protection#renewal-and-cancellation-in-the-field). This section owns the field mechanics.

Vendors make the reason and the record explicit. FieldRoutes requires a cancellation reason before a customer can be cancelled, with reasons feeding its cancellation and reinstatement reports. ServiceTitan keeps a canceled membership on file, stops its discounts and recurring services on the cancellation date (a cancellation may also mean a refund), and it advises deleting only a membership sold by mistake. What's particular to the field:

- **The technician hears it first.** "We're moving, this is the last time" said on the driveway is a cancellation request. The technician app needs a one-step "customer asked to cancel" that creates the same request, timestamped then, not when the office reads the note.
- **The route has to know.** The effective date removes future visits from the schedule in the same transaction; a technician who shows up after the customer cancelled turns a clean exit into a complaint.
- **The final bill comes from the service balance.** Work performed, the period in progress, early termination fees only if the signed agreement states them, and refunds of unearned prepayments, all computed as in [Billing Recurring Service](/books/field-operations/billing-recurring-service).
- **Some obligations outlive the agreement.** A termite warranty, a final inspection or a seasonal pool closing may still be owed or still be offered; the cancellation should say which, rather than leave the customer to find out.

![The cancellation flow. A cancel request arrives through any channel the customer signed up through, an optional reason is captured, and a save offer may be shown that one click declines. The cancellation is confirmed with an effective date set, and a final bill and notice are sent with future visits removed. If the customer accepts the offer instead, the save is logged with the offer and the request is closed.](/diagrams/fo-collections-and-retention-cancel.svg "A save offer is a step the customer can skip, never a gate. Accepted offers are logged against the request they closed.")

## Retention Offers and Saves

A **save** is a cancellation request that ends with the customer staying. The offers that work in field service are mostly service changes, not discounts:

- **A free re-service** when the reason is "the problem came back," which is often what a pest or lawn customer means.
- **A pause** for snowbirds and customers between moves: the customer asks, visits stop and billing usually stops with them. It isn't a hold, which is the company stopping service for non-payment or a dispute.
- **Frequency down** (quarterly to every other quarter, a weekly pool route to biweekly in winter) or a smaller plan for price objections.
- **A discount** for a term.
- **A different technician** or time window when the reason is the experience.

Saves must be recorded as carefully as sales: the request, the offer, who made it, what was accepted, and the terms change, because an accepted offer is a contract amendment and a sales rep's commission may depend on it ([Sales Teams & Commissions](/books/field-operations/sales-teams-and-commissions)). The rule that an offer is configuration the customer can decline in one step, and never delays the cancellation, is in [Subscriptions](/docs/payments/subscriptions#cancellation). The field addition: a save made at the door by a technician or a retention rep needs the customer's confirmation in writing, because "I never agreed to keep the service" is worse than a clean cancel.

## Win-Back

**Win-back** is selling to former customers. Keeping the ended record makes it measurable: ServiceTitan keeps a canceled membership on file so it can be reactivated if the customer returns, FieldRoutes reports reinstated subscriptions with the days between cancellation and return, and Jobber lists a client re-engagement report among its client reports.

Win-back campaigns are marketing, so they need consent under the `marketing` purpose ([Notifications & Consent](/docs/architecture/notifications#the-consent-ledger)), and a former customer who said stop must not be messaged. Segment by reason: a customer who left over price can take an offer; one who left over a damaged lawn needs an apology first; one who moved is a lead at the property they left, whose new owner the platform can reach ([Customers, Accounts & Properties](/books/field-operations/customers-and-properties)). A reinstatement should link to the original customer and its history rather than create a new account, so retention reports see a return, not a new sale. Win-back is one of the existing-customer campaigns in [Marketing to Existing Customers](/books/field-operations/marketing-and-lead-sources#marketing-to-existing-customers), which covers suppression and attributing them as retention.

## Churn Metrics

Churn definitions (logo and agreement churn, cohorts, the churn types and what's excluded) and the recovery and save rates are owned by [Retention and Churn](/books/field-operations/operating-metrics#retention-and-churn), so the retention team and the dashboard count the same way. What this chapter adds is the data they need: every `terminated` agreement carries a `churn_type` and a reason from a controlled list, every recovered payment records the channel that recovered it (retry, dunning, technician, agency), and every save records its offer. The system's job is to emit the events those metrics are computed from: `agreement.terminated` with churn type and reason (and `agreement.cancelled` for pre-active cancellations, which metrics keep out of churn), `payment.succeeded` on a recovered invoice with the channel that recovered it, and a save with its offer.

## How to Build It

Model delinquency on the account, not on each invoice, with an explicit state machine. The policy days (past due to hold, hold to write-off, write-off to placement), late fee rules and "collect before service" are per-tenant rules with effective dates, stored as data ([Rules as Data](/docs/architecture/rules-as-data)). The tables extend the canonical `accounts` and `agreements` from [The Field Operations Business](/books/field-operations/field-operations-business#the-core-data-model):

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
- **An account on hold opens a `hold` interval** in `agreement_suspensions` on each of its agreements, and each agreement's `on_hold` status derives from that interval ([Service Agreements & Plans](/books/field-operations/service-agreements#pausing-and-holding)). That's the company-initiated stop (no new visits); a customer-requested stop is a `pause` interval, and the two never share a reason list. Clearing the hold closes the intervals.
- **Any payment re-evaluates immediately.** A balance cleared by a portal payment at 7 p.m. should restore the visit on tomorrow's route, which means the dispatcher sees the change before routes publish ([Dispatch & the Day of Service](/books/field-operations/dispatch)).
- **`collection_stop` beats everything.** Retries, notices, fees, holds and placement all check it, and setting it records who and why.
- **Multiple properties, one payer.** A property manager's unpaid balance shouldn't put tenant-paid properties on hold; FieldRoutes' Bulk Freeze offers both choices for this reason. Decide per relationship and show the consequence before confirming.
- **Partial payments** reduce the balance but don't reset aging unless they clear the oldest invoice.
- **Disputes in flight.** An open card chargeback on an invoice ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)) is excluded from dunning and placement until it resolves; collecting the same money twice is the worst outcome.
- **Write-offs and recoveries are ledger entries,** and agency remittances net of the agency's fee post as a payment plus a collection cost.

Build or buy: retries and dunning emails come almost free from the processor or a subscription engine, and agencies come with their own portals and file formats. The platform's own value is the field-specific parts: the hold-versus-serve decision, technician collections, the cancel path from the driveway, and churn typed by reason.

## Auditing

Collections and cancellations are where consumer complaints, regulator inquiries and lawsuits start, and the record is the defense. The general design is in [Audit Trails](/docs/architecture/audit-trails), and field records are in [Audit Trails & Records](/books/field-operations/audit-trails-and-records). For field collections, make sure the record shows:

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
- [Maryland Commercial Law 14-1315](https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gcl&section=14-1315&enactments=false), consumer contract late fees: 15 days after the bill, the $5 or 10% monthly cap with three fees per past-due amount, the 1.5% alternative and 10-point bold disclosure
- [California Civil Code 1788.2 (FindLaw)](https://codes.findlaw.com/ca/civil-code/civ-sect-1788-2/), the Rosenthal Act's debt collector definition, which covers collecting "on behalf of that person or others"

**Reference**

- [Stripe: Automate payment retries](https://docs.stripe.com/billing/revenue-recovery/smart-retries), Smart Retries' recommended 8 tries within 2 weeks and subscription outcomes when recovery fails
- [Stripe: Automate customer emails](https://docs.stripe.com/billing/revenue-recovery/customer-emails), failed-payment and expiring-card emails and the hosted update page
- [Stripe: Pause payment collection](https://docs.stripe.com/billing/subscriptions/pause-payment), keeping a subscription active while collection is paused

**In practice**

- [ServiceTitan: Recurring billing FAQ](https://help.servicetitan.com/faq/membership-billing-faq), which payment method membership billing charges and what staff do after a failed payment
- [ServiceTitan: Edit customer memberships](https://help.servicetitan.com/docs/edit-customer-memberships), Active, Suspended, Expired and Canceled statuses and what each stops
- [ServiceTitan: Cancel and delete customer memberships](https://help.servicetitan.com/docs/cancel-and-delete-customer-memberships), cancellation dates, refunds, reactivation and deleting only mistakes
- [ServiceTitan: Membership Renewal Protection](https://www.servicetitan.com/blog/membership-renewal-protection), automatic card updates and failed payments as involuntary churn (vendor blog, 2019)
- [Housecall Pro: Service plans FAQs](https://help.housecallpro.com/en/articles/5485025-service-plans-faqs), automatic charging of the card on file and pending payments after reactivation
- [PestPac: Payment processing for pest control](https://www.pestpac.com/blog/best-payment-processing-for-pest-control), account updater before billing cycles and update links after a failed charge (vendor blog)
- [FieldRoutes: Collections](https://knowledgebase.fieldroutes.com/docs/collections.md), balance age, collection stages and exporting to a third-party agency
- [FieldRoutes: Collections Actions](https://knowledgebase.fieldroutes.com/docs/collections-actions.md), fees, bulk freeze and rollback, agency placement and write-offs
- [FieldRoutes: Failed Payment Methods](https://knowledgebase.fieldroutes.com/docs/failed-payment-methods.md), declined autopay customers and manual reruns
- [FieldRoutes: ACH Return Automation](https://knowledgebase.fieldroutes.com/docs/ach-return-automation.md), automatic reversal, return fees and which return codes email the customer
- [FieldRoutes: 3 Ways to Drastically Improve Collections](https://knowledgebase.fieldroutes.com/docs/3-ways-to-drastically-improve-collections.md), technician collections and payment before service
- [FieldRoutes: Freezing vs placing on hold](https://knowledgebase.fieldroutes.com/docs/whats-the-difference-between-freezing-and-placing-a-subscription-on-hold.md), temporary holds versus frozen subscriptions
- [FieldRoutes: How to Freeze Customer Accounts](https://knowledgebase.fieldroutes.com/docs/how-to-freeze-customer-accounts.md), required reasons and reactivation
- [FieldRoutes: Cancellation and Hold Reasons](https://knowledgebase.fieldroutes.com/docs/cancellation-reasons.md), required cancellation reasons, hold reasons for past-due customers and the reports they feed
- [FieldRoutes: Cancellation Reinstatement Report](https://knowledgebase.fieldroutes.com/docs/cancellation-reinstatement-report.md), reactivated subscriptions and measuring win-back
- [Jobber: Automatic payments](https://help.getjobber.com/en/articles/automatic-payments/), a single automatic attempt, admin notification on failure and the invoice left unpaid
- [Jobber: Reports basics](https://help.getjobber.com/en/articles/reports-basics/), the client report set including re-engagement
- [GorillaDesk: Automated email and SMS](https://intercom.help/gorilladesk/en/articles/8944155-automated-email-sms), up to six late-payment reminders with a payment link
