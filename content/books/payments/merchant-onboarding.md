+++
title = "Merchant Onboarding"
description = "Knowing who processes payments on a platform: KYC and KYB, a verification state machine, progressive onboarding, underwriting, and an API that says what's due."
category = "Payments Industry"
order = 1412
part = "Taking Payments"
aliases = ["payments/merchant-onboarding"]
tags = ["payments", "onboarding", "kyc", "compliance"]
+++

Every rule in [the rulebook](/books/payments/payments-rulebook) assumes you know who's on the other end of a payment. A platform that lets businesses accept payments is lending them its acquirer relationship, and if one of them turns out to be a front for stolen cards, a sanctioned entity or a scheme that never ships anything, the platform carries the disputes, the fines and the regulatory exposure. Onboarding is where that risk is decided, between two failures: let a bad merchant through and you pay for their fraud; make onboarding painful and good merchants leave before their first payment.

## Know Who You're Paying

Two kinds of verification, for two kinds of customer:

- **KYC (know your customer)** verifies a person: legal name, date of birth, address, government ID number, and sometimes a document and a selfie.
- **KYB (know your business)** verifies an entity: legal name, registration, tax ID, address, what it sells, and the people behind it.

The people behind a business matter most, because a company is easy to create and a person is not. In the US, FinCEN's customer due diligence rule defines **beneficial owners** two ways: every individual who owns **25% or more** of the entity, and one individual with significant control (a CEO, managing member or similar). Ownership alone would let a business with five 20% owners have none; control alone would miss the person who owns most of it from the background. Every person and entity is also screened against sanctions lists (and politically exposed person lists where relevant), and not just once (see [Ongoing Monitoring](#ongoing-monitoring)).

## A State Machine, Not a Checkbox

"Verified" isn't a boolean. A merchant moves through states, and each state decides what they're allowed to do. Following [Payment States & Ledgers](/docs/payments/payment-states), the transitions are explicit and the capabilities follow from the state:

![Merchant states as a grid of what each allows. Pending: payments limited or no, payouts no. Active: payments and payouts yes. Restricted: payments yes or limited, payouts no. Rejected: payments no, payouts of the remaining balance after a hold. Pending becomes active once verified; active becomes restricted when a requirement is overdue and returns to active when it is met; any state can become rejected for failed verification, a prohibited business or confirmed fraud.](/diagrams/merchant-states.svg "A merchant's state decides what it can do. Only an active merchant can both take payments and receive payouts; a restricted one keeps selling while its payouts wait for the overdue requirement.")

| State | Accept payments | Receive payouts | Meaning |
| ----- | --------------- | --------------- | ------- |
| `pending` | Limited, or no | No | Required information is missing or being verified |
| `active` | Yes | Yes | Everything currently required is verified |
| `restricted` | Yes, or limited | No | Something new is due (a document, a re-verification, a review) and its deadline passed |
| `rejected` | No | Remaining balance only, after a hold | Failed verification, prohibited business, or confirmed fraud |

Separating **accepting payments** from **receiving payouts** is the key design choice. Money taken in while a merchant is restricted stays on the platform, where it can still cover refunds and disputes; money paid out is gone. So when something is uncertain, the safe lever is to keep accepting payments and stop payouts, which protects the platform without breaking checkout. A rejected merchant's balance is still theirs, released after the [dispute window](/books/payments/disputes-and-chargebacks#the-lifecycle) has run, or the longest delivery horizon of what it sold, whichever is later.

## Progressive Onboarding

Asking for everything up front (ID documents, ownership structure, bank statements, a website review) kills conversion, and most of it is wasted on merchants who'll never process much. Asking for nothing is how fraud gets in. The middle path is **progressive onboarding**: collect the minimum to start, and require more as the merchant's exposure grows.

| Trigger | What's required |
| ------- | --------------- |
| Sign up | Business type, name, email, country |
| First payment | Legal entity details, representative identity, terms accepted |
| First payout | Bank account, with authorization to debit it for negative balances and fees, and verified identity for owners and controllers |
| Volume thresholds | Documents, ownership verification, deeper review |

A merchant who has processed $500 can't do much damage; one who has processed $500,000 has earned, and needs, a full review. Each requirement has a deadline, and missing it moves the merchant to `restricted`: payouts stop until it's resolved.

**Approval provisions the merchant; it doesn't just flag it.** An approved application becomes accounts elsewhere: a MID and MCC at the acquirer ([How Card Payments Work](/books/payments/card-payments#merchant-identity)), a statement descriptor, Apple Pay domain registration ([Wallets & Local Payment Methods](/books/payments/wallets-and-local-methods#wallets-are-cards-in-disguise)), ACH origination limits ([ACH & Bank Transfers](/books/payments/ach#the-rules-you-inherit)), and any fee program the merchant's category needs, such as surcharge notice or Visa service-fee registration ([Surcharging & Fees](/books/payments/surcharging-and-fees)). A Canadian merchant adds Canada's registrations ([Payments in Canada](/books/payments/canada#who-regulates-you)). Each is a separate step that can fail, so track them as requirements on the merchant, not as a script that ran once.

## The Application Is Not the Merchant

Model the **application** and the **merchant** as separate objects. An application is a request, with its own states (draft, submitted, verifying, pending documents, in review, approved, declined, withdrawn) and a history of what was asked and answered; a merchant is what an approved application creates, with capabilities that change over its whole life. Keeping them apart lets a merchant reapply, add a line of business, or change ownership without rewriting the record of how it was first approved. The **legal entity** is a third object, linked to the people who own and control it, and one person can be behind several businesses, which is exactly the link fraud reviews want to see. Payabli's boarding model makes the same split: applications, merchants, businesses and people are distinct records, and an application submitted through a hosted form or the API produces the same application and the same merchant.

Templates belong here too. A platform rarely onboards every merchant the same way: a template decides which fields an application asks for and which pricing it carries, by segment or vertical, so a small landlord and a national management company answer different questions on the way to the same kind of merchant.

Onboarding collects some of the most sensitive data a platform holds: government ID numbers, document images, dates of birth, bank account numbers. All of it follows [Sensitive Data](/docs/payments/sensitive-data) in full, and raw document images are kept only as long as verification or the law requires. The taxpayer data a platform needs for 1099-K reporting (the IRS form for payment volume) gets the same treatment: a legal name and taxpayer identification number (TIN), matched against the IRS before the year ends ([Software Platforms](/books/payments/software-platforms#1099-k-and-taxpayer-data)).

## Underwriting and Risk Tiers

Verification answers "who is this?"; underwriting answers "how much can go wrong?" A verified, legitimate business can still be risky: a travel agency takes payment months before the flight, a subscription with an awkward cancel flow generates disputes, and a high-ticket electronics seller is a fraud magnet.

What underwriting looks at, beyond identity:

- **What's sold and how,** from the description, the website and the merchant category code: some categories carry more disputes and fraud by nature.
- **When it's delivered.** Money taken today for goods or services delivered months later (travel, events, furniture, subscriptions paid annually) is exposure: if the merchant fails before delivering, every customer disputes, and the platform pays. Stripe defines a merchant's exposure as unfulfilled volume still subject to refunds and disputes.
- **History,** from prior processing statements: volume, average ticket, refund and dispute rates.
- **Financial strength,** for larger or riskier merchants: financial statements, credit, and how long the business has operated.
- **Policies:** refund and cancellation terms, and whether they're visible to customers.

Underwriting assigns a **risk tier**, and the tier sets the controls:

- **Payout timing and reserves.** Higher risk means a longer delay before funds can be paid out and a [rolling reserve](/books/payments/payouts-and-settlement#payout-schedules-holds-and-reserves), sized to the disputes and refunds the business is likely to see.
- **Volume limits** that trigger review before they're exceeded.
- **Review frequency.** Higher tiers are re-reviewed more often.

Some businesses aren't a matter of tier at all: card networks, acquirers and the law prohibit or restrict whole categories (illegal goods, some financial services, unlicensed gambling and others). Check **prohibited and restricted business lists** at onboarding against the description, website and category code, and treat a restricted category as a requirement for extra diligence such as licenses, not an automatic rejection.

Check **terminated-merchant lists** too. Mastercard's MATCH list records merchants an acquirer terminated for cause (excessive chargebacks, fraud, laundering), and a merchant on it is one some other acquirer already learned about the hard way. The duty runs both ways: merchants you terminate for a listed reason go on the list.

## Ongoing Monitoring

Onboarding is a moment; risk is continuous. A merchant who was fine in March can change what they sell in June, be taken over, or start funneling someone else's payments.

- **Screen continuously.** Sanctions lists change; re-screen people and entities when lists update, not only at sign-up.
- **Watch for drift.** Sudden volume spikes, a jump in average ticket size, a new country mix, rising dispute or refund rates: each is a reason for review, and any of them can move a merchant back to `restricted`.
- **Re-verify on material change.** A new owner, a new bank account for payouts, a new business name. A changed payout account re-verifies before the next payout, with the controls in [Vendor Payouts](/books/payments/vendor-payouts#stopping-the-changed-bank-account).
- **Expire documents.** An ID that expires is a requirement that comes due again.

## The Merchant Agreement

Every merchant signs terms, and the networks dictate part of them: Visa's rules, for example, require merchant agreements to ban laundering transactions for other businesses. The engineering cares about the terms that become behavior: authorization to debit the merchant's bank account for fees and negative balances, the reserve and payout rights the platform can exercise, notice periods for price changes, data use, and termination, including what happens to the balance afterward. Store which version of the terms each merchant accepted, when and how, because a dispute with a merchant turns on exactly that.

## An API That Says What's Due

A merchant's requirements change by country, business type, volume and whatever a reviewer asked for. Hard-coding the onboarding form in every client makes every rule change a client release, and some clients never update. The better pattern is for the API to say what's needed and the client to render it:

```json
{
  "id": "01932c6c-7616-7590-a8db-cb4b0e4d1c8a",
  "status": "pending",
  "can_accept_payments": true,
  "can_receive_payouts": false,
  "requirements": {
    "currently_due": ["representative.id_number", "external_account"],
    "eventually_due": ["company.verification.document"],
    "past_due": [],
    "pending_verification": ["representative.verification.document"],
    "current_deadline": "2026-11-05T00:00:00Z",
    "errors": [
      {
        "requirement": "representative.verification.document",
        "code": "document_unreadable",
        "message": "The ID image couldn't be read. Upload a clearer photo."
      }
    ]
  }
}
```

- `currently_due` is what has to be resolved by `current_deadline` to stay active. `eventually_due` is what will be needed if the merchant grows. `past_due` is what already caused a restriction. `pending_verification` is what's submitted and being checked.
- Errors name the requirement they belong to, so the client can show the message next to the right field. Validation failures on submitted fields are `422`s in the [standard error format](/docs/requests/error-responses).
- Every change to requirements emits a `account.updated` [webhook](/docs/api-design/webhooks), so platforms building on the API can prompt the merchant before a deadline instead of after a restriction.

Verification rules can then change per country or risk tier without any client knowing in advance. Stripe Connect's `requirements` hash works the same way.

## What This Means for the System You Build

- **Merchant state as a state machine,** with capabilities derived from it and payouts stoppable independently of acceptance.
- **Application, merchant and legal entity as separate records,** with templates deciding what each segment is asked.
- **Requirements by exposure,** each with a deadline, collected progressively.
- **A risk tier that sets payout delay, reserve, limits and review cadence.**
- **Continuous sanctions and terminated-merchant screening,** and re-verification on any owner, bank or name change.
- **Sensitive data and document images kept only as long as required.**
- **An API and webhooks that say what's due,** so the platform can show it in its own product.

## References

**Specifications**

- [FinCEN: Customer Due Diligence final rule](https://www.fincen.gov/resources/statutes-and-regulations/cdd-final-rule), the 25% ownership and control prongs for beneficial owners

**In practice**

- [Stripe: Handle verification with the API](https://docs.stripe.com/connect/handling-api-verification), a requirements list with currently due, eventually due and past due fields, and what happens at the deadline
- [Stripe: Prohibited and restricted businesses](https://stripe.com/legal/restricted-businesses), an example of the categories a platform has to screen for
- [Payabli: Boarding object model](https://docs.payabli.com/guides/pay-ops-boarding-object-model-overview.md), applications, merchants, businesses and people as separate records

**Reference**

- [Visa Core Rules and Visa Product and Service Rules](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), required merchant agreement terms
