+++
title = "Merchant Onboarding"
description = "Knowing who processes payments on a platform: KYC and KYB, a verification state machine, progressive onboarding, underwriting, and an API that says what's due."
category = "Payments Industry"
order = 1404
aliases = ["payments/merchant-onboarding"]
tags = ["payments", "onboarding", "kyc", "compliance"]
+++

Every rule in [the rulebook](/docs/industries/payments/payments-rulebook) assumes you know who's on the other end of a payment. A platform that lets businesses accept payments is lending them its acquirer relationship, and if one of them turns out to be a front for stolen cards, a sanctioned entity or a scheme that never ships anything, the platform carries the disputes, the fines and the regulatory exposure. Onboarding is where that risk is decided, between two failures: let a bad merchant through and you pay for their fraud; make onboarding painful and good merchants leave before their first payment.

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

Separating **accepting payments** from **receiving payouts** is the key design choice. Money taken in while a merchant is restricted stays on the platform, where it can still cover refunds and disputes; money paid out is gone. So when something is uncertain, the safe lever is to keep accepting payments and stop payouts, which protects the platform without breaking checkout. A rejected merchant's balance is still theirs, released after the [dispute window](/docs/industries/payments/disputes-and-chargebacks) has run.

## Progressive Onboarding

Asking for everything up front (ID documents, ownership structure, bank statements, a website review) kills conversion, and most of it is wasted on merchants who'll never process much. Asking for nothing is how fraud gets in. The middle path is **progressive onboarding**: collect the minimum to start, and require more as the merchant's exposure grows.

| Trigger | What's required |
| ------- | --------------- |
| Sign up | Business type, name, email, country |
| First payment | Legal entity details, representative identity, terms accepted |
| First payout | Bank account, verified identity for owners and controllers |
| Volume thresholds | Documents, ownership verification, deeper review |

A merchant who has processed $500 can't do much damage; one who has processed $500,000 has earned, and needs, a full review. Each requirement has a deadline, and missing it moves the merchant to `restricted`: payouts stop until it's resolved.

## Underwriting and Risk Tiers

Verification answers "who is this?"; underwriting answers "how much can go wrong?" A verified, legitimate business can still be risky: a travel agency takes payment months before the flight, a subscription with an awkward cancel flow generates disputes, and a high-ticket electronics seller is a fraud magnet.

Underwriting assigns a **risk tier**, and the tier sets the controls:

- **Payout timing and reserves.** Higher risk means a longer delay before funds can be paid out and a [rolling reserve](/docs/industries/payments/payouts-and-settlement), sized to the disputes and refunds the business is likely to see.
- **Volume limits** that trigger review before they're exceeded.
- **Review frequency.** Higher tiers are re-reviewed more often.

Some businesses aren't a matter of tier at all: card networks, acquirers and the law prohibit or restrict whole categories (illegal goods, some financial services, unlicensed gambling and others). Check **prohibited and restricted business lists** at onboarding against the description, website and category code, and treat a restricted category as a requirement for extra diligence such as licenses, not an automatic rejection.

## Ongoing Monitoring

Onboarding is a moment; risk is continuous. A merchant who was fine in March can change what they sell in June, be taken over, or start funneling someone else's payments.

- **Screen continuously.** Sanctions lists change; re-screen people and entities when lists update, not only at sign-up.
- **Watch for drift.** Sudden volume spikes, a jump in average ticket size, a new country mix, rising dispute or refund rates: each is a reason for review, and any of them can move a merchant back to `restricted`.
- **Re-verify on material change.** A new owner, a new bank account for payouts, a new business name. A changed payout account shortly before a large payout is a classic account-takeover cash-out.
- **Expire documents.** An ID that expires is a requirement that comes due again.

## Sensitive Data

Onboarding collects some of the most sensitive data a platform holds: government ID numbers, document images, dates of birth, bank account numbers. All of it follows [Sensitive Data](/docs/payments/sensitive-data) in full, and raw document images are kept only as long as verification or the law requires.

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
- Every change to requirements emits a `merchant.updated` [webhook](/docs/payments/webhooks), so platforms building on the API can prompt the merchant before a deadline instead of after a restriction.

Verification rules can then change per country or risk tier without any client knowing in advance. Stripe Connect's `requirements` hash works the same way.

## References

**Specifications**

- [FinCEN: Customer Due Diligence final rule](https://www.fincen.gov/resources/statutes-and-regulations/cdd-final-rule), the 25% ownership and control prongs for beneficial owners

**In practice**

- [Stripe: Handle verification with the API](https://docs.stripe.com/connect/handling-api-verification), a requirements list with currently due, eventually due and past due fields, and what happens at the deadline
- [Stripe: Prohibited and restricted businesses](https://stripe.com/legal/restricted-businesses), an example of the categories a platform has to screen for
