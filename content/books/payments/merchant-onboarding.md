+++
title = "Merchant Onboarding"
description = "Knowing who processes payments on a platform: KYC and KYB, a verification state machine, progressive onboarding, underwriting, and an API that says what's due."
category = "Payments Industry"
order = 1415
part = "Taking Payments"
aliases = ["payments/merchant-onboarding"]
tags = ["payments", "onboarding", "kyc", "compliance"]
+++

Every rule in [the rulebook](/books/payments/payments-rulebook) assumes you know who's on the other end of a payment. A platform that lets businesses accept payments is lending them its acquirer relationship, and if one of them turns out to be a front for stolen cards, a sanctioned entity or a scheme that never ships anything, the platform carries the disputes, the fines and the regulatory exposure. Onboarding is where that risk is decided, between two failures: let a bad merchant through and you pay for their fraud; make onboarding painful and good merchants leave before their first payment.

## Know Who You're Paying

Two kinds of verification, for two kinds of customer:

- **KYC (know your customer)** verifies a person: legal name, date of birth, address, government ID number, and sometimes a document and a selfie.
- **KYB (know your business)** verifies an entity: legal name, registration, tax ID, address, what it sells, and the people behind it.

In the US the floor comes from the Bank Secrecy Act, and it reaches a platform through its sponsor bank's contract more often than by statute ([The Financial Crime Layer](/books/payments/payments-rulebook#the-financial-crime-layer)). The bank's **Customer Identification Program** rule sets the minimum: name, date of birth, address and an identification number for a person (a taxpayer ID for US persons; a passport or other government ID number otherwise), and name, address and identification number for an entity. It allows two ways to verify them, and a good onboarding flow uses both:

- **Documentary:** an unexpired government photo ID for a person; articles of incorporation, a business license or a partnership agreement for an entity. In software, a document scan with a liveness selfie.
- **Non-documentary:** matching what the applicant typed against a credit bureau, a public database or another financial institution, or contacting them. This is the cheap, invisible check that clears most applicants; documents are the fallback for the ones it can't match.

The rule also requires a check against government terrorist lists and records kept five years after the account closes, which is why verification results are stored, not just acted on.

The people behind a business matter most, because a company is easy to create and a person is not. FinCEN's customer due diligence rule defines **beneficial owners** two ways: every individual who owns **25% or more** of the entity (the ownership prong), and one individual with significant responsibility to control it, such as a CEO, managing member or treasurer (the control prong). Ownership alone would let a business with five 20% owners have none; control alone would miss the person who owns most of it from the background. Don't confuse this with the Corporate Transparency Act's beneficial ownership reports, which companies filed with FinCEN directly: as of October 2026, a final rule (effective August 2026) exempts US companies and US persons from those reports, leaving only some foreign companies registered in the US. It removed nothing from the CDD rule a bank applies to its own customers, so a platform still collects owners itself.

**Enhanced due diligence** is the step up for higher-risk applicants: a restricted category, a complicated ownership chain, a cash-heavy business, a foreign owner, a negative news hit. It means more documents (financial statements, licenses, proof of the source of funds), a person reviewing instead of an automated pass, and more frequent re-review. **Politically exposed persons** (senior officials, their families and close associates) are one trigger. US rules don't define a PEP or require a separate regime, and bank examiners expect risk-based treatment; elsewhere, anti-money-laundering law often defines PEPs and prescribes the extra checks. A PEP match is a reason for scrutiny, not a rejection, and like sanctions it's screened again over time (see [Ongoing Monitoring](#ongoing-monitoring)).

## A State Machine, Not a Checkbox

"Verified" isn't a boolean. A merchant moves through states, and each state decides what they're allowed to do. Following [Payment States & Ledgers](/docs/payments/payment-states), the transitions are explicit and the capabilities follow from the state:

![Merchant states as a grid of what each allows. Pending: payments limited or no, payouts no. Active: payments and payouts yes. Restricted: payments yes or limited, payouts no. Rejected: payments no, payouts of the remaining balance after a hold. Pending becomes active once verified; active becomes restricted when a requirement is overdue and returns to active when it is met; any state can become rejected for failed verification, a prohibited business or confirmed fraud. The way to active is accented, dashed arrows restrict or reject, and rejected is drawn as a terminal state.](/diagrams/merchant-states.svg "A merchant's state decides what it can do. Only an active merchant can both take payments and receive payouts; a restricted one keeps selling while its payouts wait for the overdue requirement.")

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

The networks set one volume threshold themselves. A platform onboarding sub-merchants as a payment facilitator signs them on its acquirer's behalf, but Visa requires the acquirer to be added to the merchant agreement once a sponsored merchant's annual Visa sales pass US$1,000,000 (or the local equivalent), and Mastercard requires a direct agreement above US$10,000,000 a year in combined Mastercard and Maestro volume, unless the facilitator meets the rule's exception conditions ([The Hierarchy](/books/payments/software-platforms#the-hierarchy)). The facilitator can keep processing and settling for that merchant, so this is a contract and a requirement with a deadline, not an offboarding. Track each merchant's trailing twelve months per network so the requirement appears before the threshold passes.

**Approval provisions the merchant; it doesn't just flag it.** An approved application becomes accounts elsewhere: a merchant ID (MID) and merchant category code (MCC) at the acquirer ([How Card Payments Work](/books/payments/card-payments#merchant-identity)), a statement descriptor, Apple Pay domain registration ([Wallets & Local Payment Methods](/books/payments/wallets-and-local-methods#wallets-are-cards-in-disguise)), ACH origination limits ([ACH & Bank Transfers](/books/payments/ach#the-rules-you-inherit)), and any fee program the merchant's category needs, such as surcharge notice or Visa service-fee registration ([Surcharging & Fees](/books/payments/surcharging-and-fees)). A Canadian merchant adds Canada's registrations ([Payments in Canada](/books/payments/canada#who-regulates-you)). Each is a separate step that can fail, so track them as requirements on the merchant, not as a script that ran once.

## The Application Is Not the Merchant

Model the **application** and the **merchant** as separate objects. An application is a request, with its own states (draft, submitted, verifying, pending documents, in review, approved, declined, withdrawn) and a history of what was asked and answered; a merchant is what an approved application creates, with capabilities that change over its whole life. Keeping them apart lets a merchant reapply, add a line of business, or change ownership without rewriting the record of how it was first approved. The **legal entity** is a third object, linked to the people who own and control it, and one person can be behind several businesses, which is exactly the link fraud reviews want to see.

The providers draw the same lines with their own nouns. Adyen separates the **legal entity** that's verified from the **account holder** that holds capabilities and the balance accounts that hold money. Finix verifies an **Identity** for the business, with an associated identity for each 25% owner, and creates a **Merchant** under it that starts in a provisioning state and moves to approved or rejected as review completes. Stripe keeps the business on an account and each owner, director and representative as a separate person with their own verification. In each, verification attaches to the entity and the people, and the ability to take payments is a separate object that can be granted, limited or revoked. [Software Platforms](/books/payments/software-platforms#the-hierarchy) maps the same nouns onto a platform's tree.

Templates belong here too. A platform rarely onboards every merchant the same way: a template decides which fields an application asks for and which pricing it carries, by segment or vertical, so a food truck and a sixty-location restaurant group answer different questions on the way to the same kind of merchant. On a platform with resellers or franchise groups, templates follow the tree: Payabli's boarding templates are edited in its portal, versioned on every save as immutable snapshots, and available to an organization both from its own set and from its ancestor organizations, with the API marking which are inherited. Record the template version each application was answered against, so a later edit to the template doesn't change what the record says a merchant was asked.

Onboarding collects some of the most sensitive data a platform holds: government ID numbers, document images, dates of birth, bank account numbers. All of it follows [Sensitive Data](/docs/payments/sensitive-data) in full, and raw document images are kept only as long as verification or the law requires. The taxpayer data a platform needs for 1099-K reporting (the IRS form for payment volume) gets the same treatment: a legal name and taxpayer identification number (TIN), matched against the IRS before the year ends ([Software Platforms](/books/payments/software-platforms#1099-k-and-taxpayer-data)).

## Underwriting and Risk Tiers

Verification answers "who is this?"; underwriting answers "how much can go wrong?" A verified, legitimate business can still be risky: a travel agency takes payment months before the flight, a subscription with an awkward cancel flow generates disputes, and a high-ticket electronics seller is a fraud magnet.

What underwriting looks at, beyond identity:

- **What's sold and how,** from the description, the website and the merchant category code: some categories carry more disputes and fraud by nature.
- **When it's delivered.** Money taken today for goods or services delivered months later (travel, events, furniture, annual memberships) is exposure: if the merchant fails before delivering, every customer disputes, and the platform pays.
- **History,** from prior processing statements: volume, average ticket, refund and dispute rates.
- **Financial strength,** for larger or riskier merchants: financial statements, credit, and how long the business has operated.
- **Policies:** refund and cancellation terms, and whether they're visible to customers.

### Reviewing the Website

For an online business, the website is the underwriting document the merchant didn't write for you. A reviewer (or a crawler first, a person second) checks that the site matches the application: the products are the ones described, prices are in the range of the stated average ticket, and the business name, contact details, refund policy, terms and delivery times are published, since card network rules require an online merchant to show much of this before a customer pays. Mismatches are the finding: a supplement shop that underwrote as "health and wellness content", a domain registered last week, a checkout that posts to someone else's site. Store a dated capture of what was reviewed, because the site will change, and re-crawl periodically, which is how [transaction laundering](/books/payments/fraud-and-risk#merchant-fraud) is caught.

### Exposure and Reserves

Exposure is the money that can still come back: unfulfilled volume plus what delivered volume may yet lose to refunds and disputes. Stripe's Connect risk guidance defines a connected account's exposure the same way and suggests estimating it from refund and dispute rates and average payment size when delivery isn't visible. A worked example, for a furniture retailer:

| Input | Value |
| ----- | ----- |
| Monthly card volume | $200,000 |
| Average time from payment to delivery | 1.5 months |
| Refund and dispute rate on delivered orders | 2% |
| Window those arrive in | 4 months |

Undelivered orders at any moment are about $200,000 × 1.5 = **$300,000**; expected refunds and disputes on delivered orders are $200,000 × 4 × 2% = **$16,000**. Exposure is roughly **$316,000**, and that's what the platform loses if the merchant closes tomorrow.

A **rolling reserve** holds a percentage of each payment for a fixed period, so at steady state it holds volume × percentage × hold period. To cover half the exposure (about $158,000) with a four-month hold, the percentage is $158,000 ÷ ($200,000 × 4) ≈ **20%**. A shorter hold needs a higher percentage for the same cover, and a **fixed reserve** (a set amount, held once) suits a known date such as an event. Providers cap the hold: Stripe's connected-account reserves can't hold funds longer than 180 days. Recompute exposure as volume and delivery times change, and size the reserve to the share of exposure the platform won't absorb.

Underwriting assigns a **risk tier**, and the tier sets the controls:

- **Payout timing and reserves.** Higher risk means a longer delay before funds can be paid out and a [reserve](/books/payments/payouts-and-settlement#payout-schedules-holds-and-reserves) sized as above.
- **Volume limits** that trigger review before they're exceeded. Payabli, for example, sets a per-transaction threshold and volume parameters from the average ticket and monthly volume on the boarding application, declines a payment above the threshold, and has merchants ask support to pre-approve a larger one.
- **Review frequency.** Higher tiers are re-reviewed more often.

Some businesses aren't a matter of tier at all: card networks, acquirers and the law prohibit or restrict whole categories (illegal goods, some financial services, unlicensed gambling and others). Check **prohibited and restricted business lists** at onboarding against the description, website and category code, and treat a restricted category as a requirement for extra diligence such as licenses, not an automatic rejection.

Check **terminated-merchant lists** too. Mastercard's MATCH list records merchants an acquirer terminated for cause (excessive chargebacks, fraud, laundering), and a merchant on it is one some other acquirer already learned about the hard way. The duty runs both ways: merchants you terminate for a listed reason go on the list.

## Ongoing Monitoring

Onboarding is a moment; risk is continuous. A merchant who was fine in March can change what they sell in June, be taken over, or start funneling someone else's payments.

- **Screen continuously.** Sanctions and PEP lists change; re-screen people and entities when lists update, not only at sign-up.
- **Watch for drift.** Sudden volume spikes, a jump in average ticket size, a new country mix, rising dispute or refund rates: each is a reason for review, and any of them can move a merchant back to `restricted`.
- **Re-verify on material change.** A new owner, a new bank account for payouts, a new business name. A changed payout account re-verifies before the next payout, with the controls in [Vendor Payouts](/books/payments/vendor-payouts#stopping-the-changed-bank-account).
- **Expire documents.** An ID that expires is a requirement that comes due again.

### Changing the Settlement Account

The bank account a merchant is paid into is the single field most worth stealing: change it, and every future payout goes to someone else, through a flow that otherwise looks normal. So a change to it is a case with a lifecycle, not an edit. Payabli models it this way: a bank account change moves from submitted through automatic verification (that the account exists, is open and belongs to the expected holder) to auto-approved, or to pending review when verification is inconclusive, where a reviewer can assign, escalate or ask the merchant for more before approving or denying; the switch then runs and completes when the processor confirms it. Its docs split who decides by partner type: a platform partner submits and tracks cases while Payabli makes the risk decision, and an enterprise partner reviews and approves or denies its own. The account and routing numbers are write-only, tokenized on submission and never returned in any response, and a change can be scheduled up to 30 days ahead. When automated verification can't confirm a vendor's or customer's account, Payabli falls back to microdeposits of $0.01 to $0.20 that the account holder confirms, logged in its risk center.

My default follows the same shape whatever the provider: the old account keeps receiving payouts until the new one is verified and approved, a change made soon after a login from a new device or an email change goes to a person, the merchant is told on the contact details on file before the change, not the ones just submitted, and the case, its verification result and the reviewer are kept as the record of why money went where it did.

## The Merchant Agreement

Every merchant signs terms, and the networks dictate part of them: Visa's rules, for example, require merchant agreements to ban laundering transactions for other businesses. The engineering cares about the terms that become behavior: authorization to debit the merchant's bank account for fees and negative balances, the reserve and payout rights the platform can exercise, notice periods for price changes, data use, and termination, including what happens to the balance afterward. Store which version of the terms each merchant accepted, when and how, because a dispute with a merchant turns on exactly that, and collect acceptance again when the terms change materially ([Re-acceptance on Change](/docs/compliance/electronic-signatures#re-acceptance-on-change)).

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
- Every change to requirements emits an `account.updated` [webhook](/docs/api-design/webhooks), so platforms building on the API can prompt the merchant before a deadline instead of after a restriction.

Verification rules can then change per country or risk tier without any client knowing in advance. Stripe Connect's `requirements` hash works the same way. Adyen reaches the same result through capabilities: each has a verification status (pending, valid, invalid or rejected) and can be used only when it's both allowed and enabled, a failed check returns a `problems` object with verification errors and remediating actions on the legal entity, and the account holder webhooks carry the changes. A rejected status is final; an invalid one can be fixed with new data, sometimes while the capability stays usable until a deadline.

## How to Build It

Onboarding adds the application, the entity and its people, requirements with deadlines, and the risk settings underwriting decides, as deltas on [the core data model](/books/payments/card-payments#the-core-data-model):

```sql
CREATE TABLE legal_entities (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_name    TEXT NOT NULL,
  country       CHAR(2) NOT NULL,
  tax_id_token  TEXT,                    -- vaulted, never plaintext
  website_url   TEXT
);

CREATE TABLE persons (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  full_name       TEXT NOT NULL,
  date_of_birth   DATE,
  id_number_token TEXT                   -- vaulted
);

CREATE TABLE entity_persons (
  legal_entity_id UUID NOT NULL REFERENCES legal_entities (id),
  person_id       UUID NOT NULL REFERENCES persons (id),
  ownership_bps   INT,                   -- 2500 and up is a beneficial owner
  is_controller   BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (legal_entity_id, person_id)
);

CREATE TABLE merchant_applications (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id  UUID NOT NULL REFERENCES legal_entities (id),
  merchant_id      UUID REFERENCES merchants (id),   -- set on approval
  template_version UUID NOT NULL,        -- the segment's questions and pricing, as answered
  status           TEXT NOT NULL,        -- draft, submitted, verifying, pending_documents,
                                         -- in_review, approved, declined, withdrawn
  submitted_at     TIMESTAMPTZ
);

CREATE TABLE merchant_requirements (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id  UUID NOT NULL REFERENCES merchants (id),
  code         TEXT NOT NULL,            -- representative.id_number, visa_direct_agreement
  status       TEXT NOT NULL,            -- eventually_due, currently_due, pending_verification,
                                         -- satisfied, past_due
  due_by       TIMESTAMPTZ,
  satisfied_at TIMESTAMPTZ
);

CREATE TABLE settlement_account_changes (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id       UUID NOT NULL REFERENCES merchants (id),
  bank_token        TEXT NOT NULL,       -- vaulted; numbers are never read back
  status            TEXT NOT NULL,       -- submitted, verifying, pending_review, approved,
                                         -- completed, denied
  verification      JSONB,               -- the provider's result codes, as returned
  reviewed_by       UUID,                -- NULL when verification approved it cleanly
  scheduled_for     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ
);

ALTER TABLE merchants
  ADD COLUMN legal_entity_id    UUID REFERENCES legal_entities (id),
  ADD COLUMN risk_tier          TEXT,
  ADD COLUMN payouts_enabled    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN reserve_bps        INT NOT NULL DEFAULT 0,
  ADD COLUMN reserve_hold_days  INT NOT NULL DEFAULT 0,
  ADD COLUMN terms_version      TEXT,
  ADD COLUMN terms_accepted_at  TIMESTAMPTZ;
```

The merchant's `status` is derived from its requirements: any `past_due` row restricts it, and `payouts_enabled` is cleared in the same transaction. A settlement account change switches the merchant's payout account only in the transaction that marks it `completed`, so a payout run in between still pays the verified account. Verification results (which check, which provider, what it returned) go in their own append-only table, one row per check.

## Auditing

Onboarding records are evidence in sponsor bank exams, network audits, merchant disputes over a restriction, and law-enforcement requests about a merchant that turned out to be a front. The general design is in [Audit Trails](/docs/architecture/audit-trails); for onboarding, make sure the record shows:

- **Every verification check and its result,** with the provider, the data sent and the match outcome, kept for the five years after closure the CIP rule requires.
- **Who approved, restricted or rejected a merchant,** and whether a person or an automated rule did it, with the score and rules that decided ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).
- **What underwriting saw:** the website capture, the statements reviewed and the exposure estimate behind the reserve, snapshotted rather than linked, since all three change ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).
- **Changes to owners, bank accounts and terms acceptance,** as amendments with the before and after, never overwrites ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)).
- **Who viewed ID documents and unmasked tax IDs** ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Merchant state as a state machine,** with capabilities derived from it and payouts stoppable independently of acceptance.
- **Application, merchant and legal entity as separate records,** with owners and controllers linked to the entity and templates deciding what each segment is asked.
- **CIP-grade identity checks,** non-documentary first and documents as the fallback, with EDD for the applicants that need it.
- **Requirements by exposure,** each with a deadline, collected progressively, including network thresholds like Visa's direct-agreement volume.
- **A risk tier and a reserve computed from exposure,** setting payout delay, limits and review cadence.
- **Continuous sanctions, PEP and terminated-merchant screening,** and re-verification on any owner, bank or name change.
- **A settlement account change as a reviewed case,** verified before it takes effect, with the old account paid until it completes.
- **Sensitive data and document images kept only as long as required.**
- **An API and webhooks that say what's due,** so the platform can show it in its own product.

## References

**Specifications**

- [31 CFR 1020.220: Customer identification programs for banks](https://www.law.cornell.edu/cfr/text/31/1020.220), the minimum identifying information, documentary and non-documentary verification, list checks and five-year retention
- [FinCEN: Customer Due Diligence final rule](https://www.fincen.gov/resources/statutes-and-regulations/cdd-final-rule), the 25% ownership and control prongs for beneficial owners
- [Visa: Visa Acceptance Entities (PDF)](https://usa.visa.com/dam/VCOM/global/support-legal/documents/visa-acceptance-entities.pdf), payment facilitators and sponsored merchants, and the US$1,000,000 threshold for adding the acquirer to the agreement
- [Visa Core Rules and Visa Product and Service Rules](https://usa.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), required merchant agreement terms
- [Mastercard Rules, 2 June 2026 (archived PDF)](https://web.archive.org/web/20260928113643/https://www.mastercard.com/content/dam/mccom/shared/business/support/rules-pdfs/mastercard-rules.pdf), Rule 7.8 Payment Facilitator Obligations: the USD 10,000,000 sponsored merchant threshold and its exception conditions

**Reference**

- [Adams and Reese: FinCEN finalizes exemption of US companies from beneficial ownership reporting](https://www.adamsandreese.com/insights/fincen-finalizes-exemption-of-us-companies-from-beneficial-ownership-reporting), the August 2026 final rule limiting CTA reports to some foreign companies
- [OCC Bulletin 2021-59: BSA/AML examination manual updates](https://occ.gov/news-issuances/bulletins/2021/bulletin-2021-59.html), the revised politically exposed persons section and the absence of a PEP-specific US regulation

**In practice**

- [Stripe: Handle verification with the API](https://docs.stripe.com/connect/handling-api-verification), a requirements list with currently due, eventually due and past due fields, and what happens at the deadline
- [Stripe: Manage risk on Connect](https://docs.stripe.com/connect/manage-risk), exposure as unfulfilled volume subject to refunds and disputes, and estimating it from rates and average payments
- [Stripe: Connected account reserves](https://docs.stripe.com/connect/connected-account-reserves), rolling and fixed reserves and the 180-day limit
- [Stripe: Prohibited and restricted businesses](https://stripe.com/legal/restricted-businesses), an example of the categories a platform has to screen for
- [Adyen: Verification status and capabilities](https://docs.adyen.com/platforms/verification-overview/capabilities), pending, valid, invalid and rejected statuses, allowed and enabled, the `problems` object with verification errors and remediating actions, deadlines, and the account holder webhooks
- [Adyen: Platform account structure](https://docs.adyen.com/platforms/account-structure-resources/), account holders, balance accounts and stores linked to a verified legal entity
- [Finix: Seller onboarding via API](https://docs.finix.com/guides/platform-payments/onboarding-sellers/seller-onboarding-via-api), an Identity with associated identities for owners, and a Merchant created and reviewed under it
- [Payabli: Bank account change lifecycle](https://docs.payabli.com/guides/pay-ops-bank-account-changes-overview), the case states, platform and enterprise partner roles, automatic verification, write-only account numbers, and scheduling between 1 hour and 30 days ahead
- [Payabli: Verify bank accounts with microdeposits](https://docs.payabli.com/guides/pay-ops-microdeposit-portal-bank-account-verification), the $0.01 to $0.20 microdeposit fallback when automated verification can't confirm ownership, and the verification log
- [Payabli: Manage boarding templates](https://docs.payabli.com/guides/pay-ops-developer-templates-manage), templates inherited from ancestor organizations and immutable versions on every save
- [Payabli: Understanding thresholds](https://docs.payabli.com/guides/pay-ops-thresholds-overview), per-transaction thresholds and volume parameters set from the boarding application
