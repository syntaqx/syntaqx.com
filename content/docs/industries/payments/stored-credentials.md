+++
title = "Stored Cards & Recurring Billing"
nav_title = "Stored Cards & Recurring"
description = "Saving a card and charging it later: the stored credential framework, network transaction IDs, network tokens, account updater, retry rules and dunning."
category = "Payments Industry"
order = 1413
part = "Taking Payments"
tags = ["payments", "cards", "recurring", "subscriptions", "tokens"]
+++

Most of the card volume on a software platform isn't a customer typing a card into checkout. It's the rent charged on the first of the month, the utility bill on autopay, the subscription that renews at midnight: a card saved once and charged many times by the merchant, with nobody watching. That changes three things about a payment. You have to prove the customer agreed to future charges, because the issuer will ask. You have to keep the card working as it expires and gets reissued, because a stale card is a lost customer. And you have to retry declines without being fined for it, because the networks count every attempt.

The card networks wrote a framework for exactly this, and following it is most of the job. [3-D Secure](/docs/industries/payments/strong-customer-authentication) covers authenticating the customer when they're present; this chapter is about what happens after they leave.

## Who Started the Payment

Every transaction on a stored card is one of two kinds, and the networks want to know which:

- **Customer-initiated (CIT):** the customer is there and acts: checks out with a saved card, or saves a card while paying.
- **Merchant-initiated (MIT):** the merchant charges a stored card without the customer's active involvement, under an agreement the customer made earlier.

MITs come in two families. **Standing instructions** follow a schedule or terms the customer agreed to: recurring payments at a fixed interval, installments for a single purchase, and unscheduled card-on-file charges (an account top-up when the balance runs low). **Industry practice** MITs are follow-ons to a purchase the customer already made: a delayed charge (the minibar after checkout), an incremental authorization (a hotel stay that runs long), a reauthorization when the original hold expires before shipment, a resubmission of a payment that declined for insufficient funds, and a no-show charge under a stated policy.

The flag isn't bookkeeping. An issuer treats a payment it knows is a scheduled subscription differently from a card number appearing out of nowhere: different risk models, different authentication expectations, and in Europe a merchant-initiated payment is out of scope for strong customer authentication altogether, because there's nobody present to challenge ([SCA: on-session and off-session payments](/docs/industries/payments/strong-customer-authentication#on-session-and-off-session-payments)). Mislabel a CIT as an MIT to dodge a challenge and you've broken the rules; label nothing and every renewal looks like an unexpected card-not-present charge.

## The First Transaction Carries the Rest

Everything later depends on getting the first transaction right.

1. **Disclose and get consent before you store.** Tell the customer how the card will be used (the amount or how it's determined, the frequency, how to cancel) and record that they agreed. If the terms change later, tell them again.
2. **Flag the first transaction as the one that stores the credential.** If there's a payment, it's the initial CIT. If there isn't one yet (a trial, a card saved for later), run a zero-amount account verification instead, which is still a CIT and still authenticates the card.
3. **Store the network transaction ID it returns.** The issuer's network assigns the initial transaction an identifier, and each subsequent MIT sends it back. That link is how the issuer recognizes the charge as part of an agreement the cardholder authenticated, instead of a stranger with a card number. Visa's own acceptance documentation tells merchants to store and submit the original or network transaction ID for each billing agreement.

A card saved without step 3 is a liability that shows up months later. The renewal is unanchored, so issuers decline more of them, and in Europe they may demand authentication from a customer who isn't there. You find out as involuntary churn.

## Keeping the Card Alive

Cards expire, get reissued after fraud, get upgraded to a new product. Each one silently breaks a stored credential. There are two network services for this, and a mature platform uses both.

**Account updater.** Visa Account Updater (VAU) and Mastercard Automatic Billing Updater (ABU) let issuers publish changes (a new number, a new expiry date, a closed account) and let enrolled merchants, through their acquirer, ask about the cards they hold. Some versions are batch: you send the cards you'll bill this month and get updates back. Visa also offers real-time updating during authorization. Either way, coverage depends on the issuer participating, so an updater lowers expiry declines without eliminating them.

**Network tokens.** Visa Token Service (VTS) and Mastercard Digital Enablement Service (MDES) replace the card number with a network-issued token tied to your merchant (or your processor acting for you). The issuer keeps the token current when the card behind it changes, so a reissued card keeps working without an updater lookup, and each transaction carries a cryptogram that proves it came from the token's legitimate holder. Visa reports an 8% authorization uplift in Europe for tokenized e-commerce over card numbers, and an average 28% fraud reduction; those are Visa's own figures, so measure your own.

Don't confuse a network token with the token your vault or processor gives you. A vault token ([Running a Card Vault](/docs/industries/payments/card-vault)) keeps card numbers out of your systems and PCI scope, and it's only meaningful to whoever issued it. A network token is meaningful to the card network and the issuer, and it's what improves authorization. You usually want both: a vault token in your database that maps to a network token used on the wire. Which party holds them decides how easily you can move processors, which is half of [Processor Routing](/docs/industries/payments/processor-routing).

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

Retries recover some soft declines on their own. The rest need the customer, which is what dunning is: telling them, making it easy to fix, and deciding what happens to the service meanwhile.

- **Model it as states,** not a flag: `active`, `past_due` while you retry and notify, then `unpaid` or `canceled` at the end of a stated grace period. Every transition is an event other systems react to, per [Payment States & Ledgers](/docs/payments/payment-states).
- **Bring the customer back on-session.** An email with a link to update the card, where they can complete any authentication the issuer wants. A new card saved there is a new initial CIT, with a new network transaction ID.
- **Decide the service policy up front.** Whether a past-due account keeps access during the grace period is a product decision; make it explicit and the same for everyone.

## Trials and Cancellation

Subscriptions draw rules from both the networks and the law.

**Visa's trial rules**, in force globally since April 18, 2020, apply to any merchant whose free trial or introductory offer rolls into a subscription. At enrollment the merchant sends the cardholder the terms (that they've agreed to a subscription, the start date, the amount and frequency, and a simple way to cancel online), even when nothing is charged yet. At least seven days before the first full-price charge, or before a change to price or billing period, it sends a reminder with a cancellation link. Receipts state the trial length and that the card will be charged unless the customer cancels. Visa recommends every subscription merchant adopt the same practices, and so do I: they're also what wins the disputes that follow a forgotten trial ([Disputes & Chargebacks](/docs/industries/payments/disputes-and-chargebacks)).

**In US law,** the FTC's 2024 "click-to-cancel" amendments to its Negative Option Rule never took effect: the Eighth Circuit vacated them on July 8, 2025, on procedural grounds, days before compliance was due. The FTC opened a new rulemaking with an advance notice in March 2026, and as of October 2026 there's no final rule. The Restore Online Shoppers' Confidence Act and state automatic renewal laws still apply. Build cancellation to be as easy as sign-up anyway: it's where the regulators are heading, and the card networks already require a simple online cancellation for trials.

## Autopay Against a Balance

A subscription charges a fixed price on a schedule. Bills don't work that way: rent changes with fees and credits, a utility bill varies every month, and a customer might pay part of it by hand before the autopay runs. So the other common recurring shape is **autopay against a balance**: on a schedule, charge whatever the account owes.

- **Compute the amount at execution, not at scheduling.** The customer who paid half by phone this morning owes half tonight. Read the balance in the same transaction that creates the payment, and skip the cycle, recording why, when the balance is zero or in credit.
- **Cap it.** The customer agreed to pay their bill, not any amount at all. Store a maximum with the authorization, and route anything above it to the customer for approval instead of charging it.
- **Tell consumers when the amount varies.** For a preauthorized debit from a consumer's bank account whose amount changes, Regulation E requires notice of the amount at least 10 days before the transfer, unless the consumer chose to be told only when it falls outside a range they set; Canada's pre-authorized debit rules require the same 10 days ([Payments in Canada](/docs/industries/payments/canada)). On cards, the same notice is good practice and good dispute evidence.
- **One payment per cycle.** The autopay's idempotency key is the account and the billing period, so a rerun after a crash can't charge twice, and a failed run feeds the same [dunning](#dunning) as any renewal.
- **Returns turn autopay off.** A bank autopay that comes back unauthorized ends the authorization, and repeated insufficient-funds returns should pause it and tell the customer, under the restrictions in [ACH & Bank Transfers](/docs/industries/payments/ach#after-a-return-fees-and-blocks).

Providers model both shapes. Payabli's autopays, for example, run either on an interval until an end date or against the open balance on a fixed day of the month, skipping the cycle when nothing is owed. Recurring bank debits have their own authorization rules: [ACH](/docs/industries/payments/ach) standing and recurring authorizations, recurring [TEL](/docs/industries/payments/phone-payments) authorizations by phone, and Canadian pre-authorized debits. On the bank side, notifications of change do the account updater's job.

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

Recurring billing is a scheduled job charging money, which makes it the place an at-least-once [background job](/docs/architecture/background-jobs) can double-charge someone. Derive the [idempotency key](/docs/payments/idempotency) from the billing period, not the run: `subscription_0193d2c4:2026-11`. A job that crashes and reruns, or two workers that pick up the same renewal, send the same key and get the same payment back. Record the outcome on the period before moving on, so a retry schedule always knows which attempt it's on and never exceeds the networks' limits because a counter lived only in memory.

## What This Means for the System You Build

- **A CIT or MIT flag on every charge,** with the network transaction ID and the customer's consent stored with the credential.
- **Account updater and network tokens** to keep saved cards alive.
- **Hard and soft declines classified from the raw codes,** with per-card retry counters persisted and capped below the network limits.
- **Dunning as states,** and trial reminders sent before the first charge.
- **Renewal and autopay keys derived from the billing period,** with balance autopay computed at execution and capped.

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

- [Latham & Watkins: Eighth Circuit Vacates FTC Click-to-Cancel Rule](https://www.lw.com/en/insights/eighth-circuit-vacates-ftc-click-to-cancel-rule), the July 8, 2025 vacatur and why
- [Greenberg Traurig: FTC Seeks Comment on Potential Updates to Negative Option Rule](https://www.gtlaw.com/en/insights/2026/3/ftc-seeks-comment-on-potential-updates-to-negative-option-rule), the March 2026 advance notice
- [Payabli: Autopays](https://docs.payabli.com/guides/pay-in-portal-autopays-create.md), scheduled and balance-driven recurring payments
