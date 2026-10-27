+++
title = "Stored Cards & Recurring Billing"
nav_title = "Stored Cards & Recurring"
description = "Saving a card and charging it later: the stored credential framework, network transaction IDs, network tokens, account updater, retry rules and dunning."
category = "Payments Industry"
order = 1418
part = "Taking Payments"
tags = ["payments", "cards", "recurring", "subscriptions", "tokens"]
+++

Most of the card volume on a software platform isn't a customer typing a card into checkout. It's the gym membership billed on the first of the month, the usage-based software invoice charged when it closes, the streaming plan that renews at midnight: a card saved once and charged many times by the merchant, with nobody watching. That changes three things about a payment. You have to prove the customer agreed to future charges, because the issuer will ask. You have to keep the card working as it expires and gets reissued, because a stale card is a lost customer. And you have to retry declines without being fined for it, because the networks count every attempt.

The card networks wrote a framework for exactly this, and following it is most of the job. [3-D Secure](/books/payments/strong-customer-authentication) covers authenticating the customer when they're present; this chapter is about what happens after they leave.

## Who Started the Payment

Every transaction on a stored card is one of two kinds, and the networks want to know which:

- **Customer-initiated (CIT):** the customer is there and acts: checks out with a saved card, or saves a card while paying.
- **Merchant-initiated (MIT):** the merchant charges a stored card without the customer's active involvement, under an agreement the customer made earlier.

MITs come in two families. **Standing instructions** follow a schedule or terms the customer agreed to: recurring payments at a fixed interval, installments for a single purchase, and unscheduled card-on-file charges (an account top-up when the balance runs low). **Industry practice** MITs are follow-ons to a purchase the customer already made: a delayed charge (the minibar after checkout), an incremental authorization (a hotel stay that runs long), a reauthorization when the original hold expires before shipment, a resubmission of a payment that declined for insufficient funds, and a no-show charge under a stated policy.

The flag isn't bookkeeping. An issuer treats a payment it knows is a scheduled subscription differently from a card number appearing out of nowhere: different risk models, different authentication expectations, and in Europe a correctly flagged merchant-initiated payment is outside SCA's scope ([SCA: on-session and off-session payments](/books/payments/strong-customer-authentication#on-session-and-off-session-payments)). Mislabel a CIT as an MIT to dodge a challenge and you've broken the rules; label nothing and every renewal looks like an unexpected card-not-present charge.

## The First Transaction Carries the Rest

Everything later depends on getting the first transaction right.

1. **Disclose and get consent before you store.** Tell the customer how the card will be used (the amount or how it's determined, the frequency, how to cancel) and record that they agreed. If the terms change later, tell them again.
2. **Flag the first transaction as the one that stores the credential.** If there's a payment, it's the initial CIT. If there isn't one yet (a trial, a card saved for later), run a zero-amount account verification instead, which is still a CIT and still authenticates the card.
3. **Store the network transaction ID it returns.** The network assigns the initial transaction an identifier, and each subsequent MIT sends it back. That link is how the issuer recognizes the charge as part of an agreement the cardholder authenticated, instead of a stranger with a card number. Visa's own acceptance documentation tells merchants to store and submit the original or network transaction ID for each billing agreement.

A card saved without step 3 is a liability that shows up months later. The renewal is unanchored, so issuers decline more of them, and in Europe they may demand authentication from a customer who isn't there. You find out as involuntary churn.

## Keeping the Card Alive

Cards expire, get reissued after fraud, get upgraded to a new product. Each one silently breaks a stored credential. There are two network services for this, and a mature platform uses both.

**Account updater.** Visa Account Updater (VAU) and Mastercard Automatic Billing Updater (ABU) let issuers publish changes (a new number, a new expiry date, a closed account) and let enrolled merchants, through their acquirer, ask about the cards they hold. Some versions are batch: you send the cards you'll bill this month and get updates back. Visa also offers real-time updating during authorization. Either way, coverage depends on the issuer participating, so an updater lowers expiry declines without eliminating them.

**Network tokens.** Visa Token Service (VTS) and Mastercard Digital Enablement Service (MDES) replace the card number with a network-issued token tied to your merchant (or your processor acting for you). The issuer keeps the token current when the card behind it changes, so a reissued card keeps working without an updater lookup, and each transaction carries a cryptogram that proves it came from the token's legitimate holder. Visa reports an 8% authorization uplift in Europe for tokenized e-commerce over card numbers, and an average 28% fraud reduction; those are Visa's own figures, so measure your own.

Every network token has a **token requestor**: the party registered with the network's token service to request and hold it, whether the merchant, its processor or its vault provider. The requestor decides who can use the token elsewhere, which is why [Processor Routing](/books/payments/processor-routing#tokens-decide-how-free-you-are) cares who it is.

Don't confuse a network token with the token your vault or processor gives you. A vault token ([Running a Card Vault](/books/payments/card-vault)) keeps card numbers out of your systems and PCI scope, and it's only meaningful to whoever issued it. A network token is meaningful to the card network and the issuer, and it's what improves authorization. You usually want both: a vault token in your database that maps to a network token used on the wire. Which party holds them decides how easily you can move processors, which is half of [Processor Routing](/books/payments/processor-routing).

## Declines, and the Rules on Retrying

A recurring charge declines more often than a checkout does: the card is older, the customer's balance moves, and nobody is there to try another card. What you do next is regulated.

Declines fall into two groups. A **hard decline** won't succeed no matter how often you ask: the card is lost, stolen, closed, or the cardholder revoked the agreement. A **soft decline** might succeed later: insufficient funds, an issuer system issue, a velocity limit. Treat them differently, and keep the raw response codes so you can tell them apart later.

The networks enforce the difference with fees:

- **Visa** groups decline codes into categories. Category 1 means the issuer will never approve (codes like lost, stolen, closed or revoked), and any reattempt at all is excessive. For the other categories, Visa allows a limited number of reattempts per card in a 30-day period: 20 as of 2026, raised from 15, with a fee on each one past the limit.
- **Mastercard** returns a Merchant Advice Code (MAC) alongside the decline, and it tells you exactly what to do:

| MAC | Meaning | What to do |
| --- | ------- | ---------- |
| `01` | New account information available | Get the updated card (account updater) and retry with it |
| `02` | Cannot approve at this time, try again later | Retry on your schedule |
| `03` | Do not try again | Stop |
| `21` | Payment cancellation | The cardholder stopped this agreement: stop and cancel the subscription |
| `24` to `30` | Retry after 1 hour, 24 hours, 2, 4, 6, 8 or 10 days | Retry no sooner than that |

Mastercard's Transaction Processing Excellence program charges for excessive retries (more than 10 on a card in 24 hours, or more than 35 in 30 days) and for trying again within 30 days after a `03` or `21`. The thresholds and fees change; your processor's documentation states the current ones, so build to those.

The schedule that works in practice is short and spaced: retry soft declines over days, not minutes, timed to when money tends to arrive (paydays, the start of the month), and stop at a fixed small number. Never retry a hard decline, never change the amount or other data to get a different answer, and never retry a decline the way you'd retry an outage ([Retries & Timeouts](/docs/architecture/retries-and-timeouts) draws that line).

## Dunning

Retries recover some soft declines on their own. The rest need the customer, which is what dunning is: telling them, making it easy to fix, and deciding what happens to the service meanwhile. The states, notices and grace periods are the same in every industry and live in [Subscriptions & Recurring Billing](/docs/payments/subscriptions#dunning). The card-specific part: bring the customer back on-session, with a link to update the card where they can complete any authentication the issuer wants. A new card saved there is a new initial CIT, with a new network transaction ID.

## Trials and Cancellation

Subscriptions draw rules from both the networks and the law.

**Visa's trial rules**, in force globally since April 18, 2020, apply to any merchant whose free trial or introductory offer rolls into a subscription. At enrollment the merchant sends the cardholder the terms (that they've agreed to a subscription, the start date, the amount and frequency, and a simple way to cancel online), even when nothing is charged yet. At least seven days before the first full-price charge, or before a change to price or billing period, it sends a reminder with a cancellation link. Receipts state the trial length and that the card will be charged unless the customer cancels. Visa recommends every subscription merchant adopt the same practices, and so do I: they're also what wins the disputes that follow a forgotten trial ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)).

**In US law,** the Restore Online Shoppers' Confidence Act and state automatic renewal laws apply, and the FTC's attempt at a federal "click-to-cancel" rule is still unsettled; [The Law of Automatic Renewal](/docs/payments/subscriptions#the-law-of-automatic-renewal) has the details and what to build. Make cancellation as easy as sign-up either way: the card networks already require a simple online cancellation for trials.

## Autopay Against a Balance

A subscription charges a fixed price on a schedule. Plenty of recurring bills don't work that way: a usage-based SaaS invoice changes every month, a B2B customer's open invoices add up to whatever they add up to, a clinic's patient balance moves as insurance pays its part, and a customer might pay some of it by hand before the scheduled charge runs. So the other common recurring shape charges, on a schedule, **whatever the account owes**.

Billing systems model it the same way under different names. Zuora's payment runs pick up invoices with auto-pay on and a balance above zero, charge the account's default payment method, and leave a declined balance open for the next run once the method is updated. Stripe Invoicing collects open invoices automatically, retries failed card payments on a schedule, and can mark an invoice paid when a partial payment comes within a set amount of the total. What they share is the rule that matters: the amount is decided by the ledger at run time, not by the schedule.

- **Compute the amount at execution, not at scheduling.** The customer who paid half by phone this morning owes half tonight. Read the balance in the same transaction that creates the payment, and skip the cycle, recording why, when the balance is zero or in credit.
- **Cap it.** The customer agreed to pay their bill, not any amount at all. Store a maximum with the authorization, and route anything above it to the customer for approval instead of charging it.
- **Tell consumers when the amount varies.** For a preauthorized debit from a consumer's bank account whose amount changes, Regulation E requires notice of the amount at least 10 days before the transfer, unless the consumer chose to be told only when it falls outside a range they set; Canada's pre-authorized debit rules require the same 10 days ([Payments in Canada](/books/payments/canada)). On cards, the same notice is good practice and good dispute evidence.
- **One payment per cycle.** The idempotency key is the account, the billing period and the attempt, and a unique constraint allows one successful payment per period, so a rerun after a crash can't charge twice, and a failed run feeds the same [dunning](#dunning) as any renewal.
- **Returns turn it off.** A bank debit that comes back unauthorized ends the authorization, and repeated insufficient-funds returns should pause the schedule and tell the customer, under the restrictions in [ACH & Bank Transfers](/books/payments/ach#after-a-return-fees-and-blocks).

On cards, a balance charge is an unscheduled card-on-file MIT unless it falls on a fixed interval, in which case it's recurring; flag it accordingly. Field service businesses often use both shapes on one account; the Field Operations volume's [billing chapter](/books/field-operations/billing-recurring-service) covers charging per-visit invoices and service plans. Recurring bank debits have their own authorization rules: [ACH](/books/payments/ach) standing and recurring authorizations, recurring [TEL](/books/payments/phone-payments) authorizations by phone, and Canadian pre-authorized debits. On the bank side, notifications of change do the account updater's job.

## The Credential Record

A stored card is more than a token. Keep the agreement with it:

```json
{
  "id": "0193d2c4-5e8a-7c21-9f6b-1a2b3c4d5e6f",
  "customer_id": "0193d2c4-5e8a-7c21-9f6b-0a1b2c3d4e5f",
  "vault_token": "tok_9f2c",
  "network_token": { "status": "active", "requestor": "processor" },
  "brand": "visa",
  "last4": "4242",
  "exp_month": 11,
  "exp_year": 2029,
  "usage": "recurring",
  "consent": {
    "accepted_at": "2026-10-22T14:05:00Z",
    "terms_version": "subscription-terms-2026-09",
    "channel": "web"
  },
  "initial_network_transaction_id": "583012345678901",
  "status": "active"
}
```

- **The consent is evidence.** When a cardholder disputes a renewal as unrecognized, the terms version and acceptance time are what you submit.
- **The network transaction ID belongs to the agreement,** so every MIT under it can send it.
- **`status` tracks the credential, not the subscription.** A card can be `expired` or `revoked` (after a MAC `21` or a Visa revocation decline) while the customer is still a customer.

## Renewal Jobs

Recurring billing is a scheduled job charging money, which makes it the place an at-least-once [background job](/docs/architecture/background-jobs) can double-charge someone. The safe shape (period rows created ahead, claimed with a guarded update, charged with an [idempotency key](/docs/payments/idempotency) derived from the period and the attempt, one successful charge per period enforced by a unique constraint) is in [Renewal Jobs](/docs/payments/subscriptions#renewal-jobs). What the card networks add: a retry after a soft decline is a new attempt with a new key, never a replay of the first decline, and the attempt count is recorded on the period, not held in memory, so a restarted job can't push a card past the network retry limits above.

## How to Build It

Stored credentials add the agreement behind each saved method and the schedules that charge it, as deltas on [the core data model](/books/payments/card-payments#the-core-data-model):

```sql
CREATE TABLE credential_agreements (
  id                             uuid PRIMARY KEY,
  payment_method_id              uuid NOT NULL REFERENCES payment_methods (id),
  usage                          text NOT NULL,   -- recurring, installment, unscheduled
  terms_version                  text NOT NULL,
  consent_accepted_at            timestamptz NOT NULL,
  consent_channel                text NOT NULL,   -- web, app, phone
  initial_network_transaction_id text,            -- from the initial CIT
  status                         text NOT NULL    -- active, expired, revoked
);

ALTER TABLE payment_methods
  ADD COLUMN network_token_status    text,        -- active, suspended, none
  ADD COLUMN network_token_requestor text;        -- merchant, processor, vault

ALTER TABLE payments
  ADD COLUMN credential_agreement_id uuid REFERENCES credential_agreements (id),
  ADD COLUMN mit_type                text;         -- recurring, unscheduled, resubmission, no_show

CREATE TABLE balance_schedules (
  id                      uuid PRIMARY KEY,
  customer_id             uuid NOT NULL REFERENCES customers (id),
  credential_agreement_id uuid NOT NULL REFERENCES credential_agreements (id),
  day_of_month            int NOT NULL,
  max_amount              bigint NOT NULL,         -- above this, ask the customer
  status                  text NOT NULL            -- active, paused, ended
);

CREATE TABLE balance_runs (
  balance_schedule_id uuid NOT NULL REFERENCES balance_schedules (id),
  period              date NOT NULL,
  amount              bigint,                      -- read from the ledger at run time
  outcome             text NOT NULL,               -- charged, skipped_zero, over_cap, failed
  payment_id          uuid REFERENCES payments (id),
  attempts            int NOT NULL DEFAULT 0,
  PRIMARY KEY (balance_schedule_id, period)
);
```

The primary key on `balance_runs` is the one-run-per-period guarantee, and `attempts` is the persisted retry count the network limits are checked against. A revoked agreement (after MAC `21` or a Visa Category 1 decline) stops every schedule that uses it in the same transaction.

## Auditing

Stored-credential records are evidence in "I never agreed to this" disputes, regulators' questions about cancellation and renewal notices, and network reviews of excessive retries. The general design is in [Audit Trails](/docs/architecture/audit-trails); for stored credentials, make sure the record shows:

- **The consent as it was given:** the terms text version, the disclosure shown, the time and the channel, snapshotted so a later edit to the terms doesn't rewrite it ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).
- **Every notice sent:** trial reminders, varying-amount notices and price-change notices, with what they said and when, since the rules are about timing.
- **Every attempt on a credential,** with the decline code, MAC and the rule that chose to retry or stop, so the retry count can be proven to a network.
- **Credential changes from updaters and token lifecycles,** recorded as amendments with the source, never as a silent overwrite of the card on file ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)).
- **Cancellations and revocations,** who asked, through which channel, and when charges stopped.

## What This Means for the System You Build

- **A CIT or MIT flag on every charge,** with the network transaction ID and the customer's consent stored with the credential.
- **Account updater and network tokens** to keep saved cards alive.
- **Hard and soft declines classified from the raw codes,** with per-card retry counters persisted and capped below the network limits.
- **Dunning as states,** and trial reminders sent before the first charge.
- **Renewal and balance-run keys derived from the billing period and attempt,** one successful payment per period enforced by the database, and balance charges computed at execution and capped.

## References

**Specifications**

- [Visa Acceptance: Credentialed Transactions Developer Guide](https://developer.visaacceptance.com/docs/vas/en-us/credentials/developer/ctv/rest/credentials.html), CIT and MIT definitions, standing-instruction and industry-practice MIT types, disclosure and consent, and storing the network transaction ID
- [Visa: Trial Subscription Updates (PDF)](https://usa.visa.com/content/dam/VCOM/global/support-legal/documents/visa-new-subscription-rules-flier.pdf), the April 18, 2020 requirements: enrollment terms, the seven-day reminder, receipts and online cancellation
- [12 CFR 1005.10](https://www.law.cornell.edu/cfr/text/12/1005.10), preauthorized transfers and notice of varying amounts

**Reference**

- [Visa Developer: Visa Account Updater](https://developer.visa.com/capabilities/vau/overview), what VAU exchanges between issuers, acquirers and merchants
- [Tower Federal Credit Union: Mastercard Automatic Billing Updater](https://www.towerfcu.org/credit-cards/compare-all-cards/tower-gold/automatic-billing-updater), an issuer's description of ABU: card changes shared with participating merchants, which not every merchant is
- [Mastercard Developers: MDES for Merchants](https://developer.mastercard.com/mdes-digital-enablement/documentation/use-cases/mdes-for-merchants-use-cases/), network tokens and cryptograms for merchants
- [Visa Acceptance: Token Management Service](https://www.visaacceptance.com/en-gb/solutions/payment-services/token-management-service.html), Visa's figures for authorization uplift and fraud reduction with network tokens
- [TabaPay: Mastercard Merchant Advice Codes](https://developers.tabapay.com/docs/merchant-advice-code-mac), the MAC values and meanings
- [TabaPay: Excessive Retry Rules](https://developers.tabapay.com/docs/excessive-retry-rules), Visa's Category 1 and 20-in-30-days limits and Mastercard's retry thresholds as a processor enforces them
- [PayPal: How to avoid excessive retries penalties](https://www.paypal.com/us/brc/article/avoid-excessive-retries-penalties), Visa's 20 retries in 30 days and no retries on Category 1, and Mastercard's 10-in-24-hours, 35-in-30-days and MAC `03`/`21` rules
- [Chargebacks911: Visa Excessive Reattempts Rule](https://chargebacks911.com/visa-excessive-reattempts-rule/), the increase from 15 to 20 reattempts

**In practice**

- [Zuora: Payment run does not pick up old invoices](https://docs.zuora.com/en/zuora-payments/process-payments/process-payments-with-payment-runs/troubleshoot-payment-runs/payment-run-does-not-pick-up-old-invoices), which invoices a run picks up: auto-pay on, a balance above zero, due by the target date
- [Zuora: Troubleshoot payment runs](https://docs.zuora.com/en/zuora-payments/process-payments/process-payments-with-payment-runs/troubleshoot-payment-runs), a declined balance picked up by the next run once the method is updated
- [Stripe: Automatic collection](https://docs.stripe.com/invoicing/automatic-collection), automatic recovery of open invoices, retries of failed payments, and partial payments reconciled within a set amount
