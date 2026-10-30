+++
title = "Payments in the Practice"
description = "Patient payments: text-to-pay, card on file, payment plans, financing, surcharging, HSA and FSA cards, terminals, payer virtual cards and PMS posting."
category = "Health Tech Industry"
order = 1936
part = "Practice Management and Patient Engagement"
tags = ["health-tech", "payments", "text-to-pay", "financing", "hsa", "pms", "data-model"]
+++

A practice collects from two payers on every visit, and neither pays on the day in a way the software can predict. The insurer pays its share weeks later, after adjudicating a claim, sometimes by an electronic transfer, sometimes by a check, sometimes by a virtual card the practice never asked for. The patient (or for a child or an animal, the guarantor who pays for them) owes whatever is left, which at the front desk is an estimate: a copay, a deductible guess, a dental coinsurance percentage of a fee the plan may downgrade. So a practice's payments product has three jobs the card rails don't do for it: take money before the bill is final and reconcile it after, collect balances from people who have already left the building, and post every payment back to the practice management system's ledger, which is where the practice, its accountant and the next statement read the truth.

Most small practices run patient-pay volume that matters. Dental, optometry and veterinary care are heavily or entirely patient-paid ([Cash pay, memberships and the patient-pay specialties](/books/health-tech/health-tech-business#cash-pay-memberships-and-the-patient-pay-specialties)), and a medical practice's patient share has grown with high-deductible plans. This chapter covers the practice side: the vendors, text-to-pay, card on file before adjudication, payment plans, patient financing, surcharging, HSA and FSA cards, terminals at the front desk, payer virtual cards, and posting to the PMS. The card mechanics are the Payments volume's: [Surcharging & Fees](/books/payments/surcharging-and-fees), [Card-Present Payments](/books/payments/card-present), [Phone Payments](/books/payments/phone-payments) and [Payments for Software Platforms](/books/payments/software-platforms), whose rules apply here unchanged; the healthcare-specific network and HIPAA rules are in [Payments by Vertical: Healthcare](/books/payments/payments-by-vertical#healthcare). Statements, good faith estimates, medical debt law and collections belong to [Patient Statements, Estimates & Collections](/books/health-tech/patient-financial-experience) in the revenue cycle part. This chapter extends `payments`, `ledger_entries`, `patient_statements` and `guarantors` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from each vendor's own pages:

| Vendor | What it is | Collection methods | Posting to the PMS | Published price |
| --- | --- | --- | --- | --- |
| **Weave** | Patient engagement suite with payments | Text to pay, card on file, payment plans, wireless terminal, tap to pay on a phone, scan to pay; Sunbit, Affirm and CareCredit offered | Bulk Collections named for Dentrix Enterprise, Fuse and Eaglesoft | "No upfront fees, recurring fees or hidden fees"; rates not published |
| **Rectangle Health** | Healthcare payments platform (Practice Management Bridge) | Text to pay, payment vault (card on file), automated payment plans, terminals | "Automatic posting" to the patient's EMR or PMS account; integrations with Eaglesoft, Open Dental, athenahealth, NextGen and Greenway named | Demo only |
| **NexHealth** | Patient engagement and booking platform | Text to pay in batches, card on file, installment plans signed in the payment request, in-office terminal | "Every payment automatically syncs" for Eaglesoft, Open Dental and Dentrix; other systems "won't sync to your ledger just yet" | Terminal 2.6% + 7¢; text to pay 2.9% + 30¢ |
| **Podium** | Messaging platform for local businesses, health included | Text to pay invoice links, recurring payments and autopay, card readers and tap to pay, buy now pay later | Not described | Not published |
| **InstaMed** | Healthcare payments network, a J.P. Morgan subsidiary | Text to pay, online portals, contactless terminals | Through EHR and PMS integrations | Not published |
| **PetDesk** | Veterinary client app and engagement | Checkout and overdue invoice follow-up by SMS, email or the app | Syncing "your payment system with your PIMS"; systems not named on the page | Not published |
| **Open Dental** | Dental PMS with integrated processors | EdgeExpress (Global Payments Integrated), PayConnect (DentalXChange) and PaySimple inside the PMS | Native: the payment is a PMS record; a public Payments API for third parties | Processor's rates |

Three patterns run through the table:

- **Every vendor sells the same four methods.** Text to pay, card on file, payment plans and a terminal at the desk are table stakes; vendors differ on financing partners, which PMSs they post to, and whether pricing is published at all. NexHealth is unusual in publishing card rates.
- **Posting is the product.** A payment that lands in the processor but not the PMS ledger is a payment someone retypes, and the vendors list which PMSs they post to because the answer differs by system. NexHealth says plainly that some systems don't sync; Rectangle Health counts its integrations ("30+ solutions and works with 500+ systems").
- **The PMS may already be a payments product.** Open Dental integrates its own card processors, and Dentrix's publisher sells payments that post to Dentrix's ledger. An engagement vendor's payments compete with the PMS's own, which is one reason PMS vendors control write access ([Integrating with Practice Management Systems](/books/health-tech/pms-integration#gatekeeping-fees-and-the-law) covers the gatekeeping).

## Money Before the Bill Is Final

A practice takes patient money at three points, each against a different number:

| When | What's collected | Against what |
| --- | --- | --- |
| **Booking or check-in** | A deposit, a copay, or an estimated patient portion | An estimate from eligibility and the fee schedule |
| **Checkout** | The estimated patient portion of the day's procedures | Charges posted that day, less the expected insurance payment |
| **After adjudication** | The balance the insurer left | The remittance: the allowed amount, the insurer's payment and the adjustments |

The first two are estimates, so the third reconciles. When the insurer pays more than expected, the patient has a **credit balance** the practice owes back (a refund, or a credit applied to a future visit if the patient agrees and state law allows it). When it pays less, the patient owes more, and the practice sends a statement or charges the card on file. Each of those is a ledger event, and the payment record has to say which estimate it was taken against so the difference can be explained.

### Card on File and the Preauthorized Health Care Transaction

The card on file is how a practice collects the post-adjudication balance without chasing the patient. Visa's **Preauthorized Health Care Transaction** is the network's shape for it: an order form describing the services, permission to charge the balance after the insurer pays, a time period of no more than a year, and no authorization until the insurer's notice of adjudication arrives ([Balances After Insurance, Plans and Financing](/books/payments/payments-by-vertical#balances-after-insurance-plans-and-financing)). On the card rails that charge is a merchant-initiated transaction on a stored credential ([Who Started the Payment](/books/payments/stored-credentials#who-started-the-payment)).

What the practice adds:

- **The consent names a cap or a range.** "Charge my card for balances after insurance, up to $300 per visit, for 12 months" is the consent a patient understands and a dispute reviewer accepts. Above the cap, the system sends a text-to-pay request instead of charging.
- **The trigger is the remittance, not the calendar.** The charge job reads posted remittances, computes the patient balance per visit, and charges only what that remittance left, never a running account total that might include a disputed or older balance.
- **Tell the patient before charging.** A text a few days ahead ("Your insurer paid its part of your March 4 visit. We'll charge $84.20 to the card ending 4242 on March 30 unless you call us") turns a surprise charge into a notice, and the notice is the evidence.
- **Some states restrict it.** New York's General Business Law § 519-a bars providers from requiring a card on file or a preauthorization as a condition of emergency or medically necessary care; the statute page was not read for this chapter, so its exact conditions aren't stated here. <!-- source-gap: ny-gbl-519a | secondary | New York GBL 519-a bars requiring a credit card on file or pre-authorization before emergency or medically necessary care, and requires a notice of the risks of paying by credit card | closes with: the statute text on nysenate.gov opened and quoted | checked: 2026-10-29 -->

My default: the card on file is optional, consented per guarantor with a cap and an expiry, charged only from a posted remittance, and preceded by a notice. A practice that makes it mandatory at check-in turns a convenience into the kind of practice the New York statute was written about.

## Text-to-Pay

Text-to-pay is a link to a hosted payment page sent by SMS or email, for a statement balance, a copay before a telehealth visit, or a deposit. The rules for the link are the Payments volume's ([Send a Link Instead](/books/payments/phone-payments#send-a-link-instead)): single use, bound to an amount and payee, expiring, no personal data in the URL, and an idempotency key so two taps pay once. Texting a patient brings TCPA, carrier registration and HIPAA rules that [Two-Way Texting & Messaging](/books/health-tech/patient-texting) covers; a balance reminder to a patient who gave their number for account messages is the kind of message the FCC's healthcare exemption and the TCPA's informational category contemplate, and adding a promotion makes it marketing ([TCPA Consent](/docs/compliance/consumer-contact#tcpa-consent)).

The health twist is what the message and the page reveal:

- **The SMS says the least.** "Your balance with Smith Family Dental is ready to pay" plus a link; no procedure, no amount if the practice prefers, nothing a person glancing at a lock screen learns about the patient's care. The amount and visit detail appear only after the link is opened.
- **The page asks before it shows.** A link texted to a phone number can be opened by whoever holds the phone. Showing the balance after a light check (the patient's date of birth, or the last name on the account) keeps an itemized statement from reaching a household member.
- **The guarantor is the recipient.** For a child, the parent who is the responsible party gets the link; for a vet patient, the client. A divorced parent who is the patient's contact but not the guarantor shouldn't get the bill. The recipient comes from `guarantors`, not from the patient's phone.
- **Batch sends are statements.** NexHealth sends requests "in batches or one at a time"; a batch text is a statement run and inherits [Patient Statements, Estimates & Collections](/books/health-tech/patient-financial-experience#statements)' rules on what a statement says and how often it goes.

## Payment Plans

A practice's own payment plan is an installment agreement on the practice's receivable: no lender, usually no interest, a schedule of charges against a balance. The plan record and its place in the statement cycle are [Patient Statements, Estimates & Collections](/books/health-tech/patient-financial-experience#payment-plans)'; this section is the payments side. The vendors build it in: NexHealth lets patients "split any balance into installments and sign inside the NexHealth payment request," Rectangle Health automates plans "on your patients' terms," and Open Dental's API creates "a payment plan for the patient with the specified terms," so a plan created outside the PMS can exist inside it.

The rules that keep a plan honest:

- **The plan is on the PMS ledger, or it is two plans.** Dental PMSs model payment plans natively (Open Dental's dynamic plans, applied by its Payments API to "an eligible payment plan"), so a plan the engagement platform runs has to be the PMS's plan, or the PMS shows the full balance as overdue while the patient pays installments the PMS doesn't know about.
- **Compute each installment from the balance at run time.** Insurance can pay late, the patient can pay a lump sum by phone, a procedure can be adjusted off; each installment charges the lesser of the scheduled amount and what's still owed, and the plan ends at zero. This is autopay against a balance, with its cap and its one-payment-per-period key ([Autopay Against a Balance](/books/payments/stored-credentials#autopay-against-a-balance)).
- **Interest makes it credit.** Regulation Z treats a person who regularly extends consumer credit "subject to a finance charge or is payable by written agreement in more than four installments" as a creditor under the Truth in Lending Act, so a practice that runs many long plans can become one; a practice that wants to charge interest should use a lender rather than become one. My default is that a practice plan carries no interest and no fee, and anything else goes to a financing partner.
- **Missed installments are dunning.** Retry on the network's rules, tell the guarantor with a one-step fix, and after a stated number of misses, end the plan and return the balance to the normal statement cycle. Collections law, credit reporting and when a balance may go to an agency are [Patient Statements, Estimates & Collections](/books/health-tech/patient-financial-experience)'.

## Patient Financing

Financing moves the balance to a lender: the patient applies, the lender approves and pays the practice (less a merchant fee), and the patient owes the lender. The products differ on interest structure, which is the part regulators watch:

| Lender | How it's offered, as of October 2026 | Terms published |
| --- | --- | --- |
| **CareCredit** (Synchrony) | A health credit card accepted at enrolled providers; the provider chooses which promotions to offer in its Provider Center | "No Interest if Paid in Full" on purchases of $200 or more over 6, 12, 18 or 24 months; reduced-APR fixed-payment plans from 17.90% (24 months, $1,000 or more) to 20.90% (60 months, $2,500 or more); providers paid "within two business days" |
| **Sunbit** | Point-of-sale installment financing, applied for at the practice | "90% of people are approved"; APR "from 0% to 35.99%"; 3, 6 or 12-month plans, with 6 to 72 months for dental; no hard credit check, with account openings and payment activity reported to a credit bureau |
| **Cherry** | Point-of-sale payment plans through a technology platform that isn't the lender | APR "of 0% to 35.99%, terms between 1 and 60 months"; a zero-interest pay-in-four offer for everyone approved; no hard credit check |

The distinction that matters is **deferred interest**. CareCredit's "No Interest if Paid in Full" promotion charges interest from the purchase date on the whole amount if any balance remains when the promotional period ends; a 0% APR installment plan charges no interest at all. The CFPB's 2023 report on medical credit cards found patients used deferred-interest products to pay for almost $23 billion of health care from 2018 to 2020 and paid $1 billion in deferred interest; that people incurred interest on 20 percent of health care purchases made with deferred-interest products between 2015 and 2020, and about 34 percent for those with credit scores below 619; and that the typical medical credit card's APR was 26.99 percent against about 16 percent for general-purpose cards.

States have started regulating the point of sale. New York's General Business Law § 349-g prohibits a hospital or health care provider, or its employee or agent, from completing "any portion of an application for medical financial products for the patient," defined as "medical credit cards and third-party medical installment loans." Its effective date (October 2024) comes from secondary summaries. <!-- source-gap: ny-gbl-349g-effective | secondary | New York GBL 349-g effective October 20, 2024 | closes with: the chapter law or a New York state agency notice stating the effective date | checked: 2026-10-29 -->

What a platform that offers financing builds:

- **The patient applies on their own device.** A link to the lender's application, never a staff member typing the patient's income into a tablet. New York requires it; it's also the only way the platform can show it didn't steer the application.
- **The practice's own plan is shown first.** If the practice offers an interest-free plan, it appears before any lender's product, and a deferred-interest promotion shows the date interest would start and the amount that would be charged.
- **Two ledgers, never one.** A financed balance is paid off on the practice's ledger by the lender's funding (a payment of type `financing`, net of the merchant fee, which is a practice expense, not a patient credit); what the patient owes the lender is not on the practice's books. A refund after financing goes back to the lender, not to the patient's card.
- **Credit reporting is the lender's, not the practice's.** The CFPB's January 2025 rule barring medical debt from credit reports was vacated by the Eastern District of Texas on July 11, 2025, on the joint request of the Bureau and the plaintiffs; state laws on medical debt reporting are covered in [Patient Statements, Estimates & Collections](/books/health-tech/patient-financial-experience#medical-debt-and-credit-reporting).

The lender's side of these products (underwriting, TILA disclosures, servicing) is credit, and belongs to the Banking & Lending volume: a medical credit card's deferred-interest promotion is one of a card's [balance segments](/books/banking-and-lending/credit-cards#balance-segments-and-aprs), governed by [the CARD Act rules](/books/banking-and-lending/credit-cards#the-card-act-rules), and a point-of-sale plan is an [installment loan](/books/banking-and-lending/installment-loans#the-product-and-its-disclosures) with its own disclosures and [state rate caps](/books/banking-and-lending/installment-loans#state-rate-caps-as-data).

## Surcharging at the Front Desk

Practices ask for surcharges because their margins on large dental or veterinary invoices are thin, and the rules are the Payments volume's without a healthcare exception: credit only, never debit or prepaid, a cap (3% under Visa's rules), 30 days' notice, disclosure, and state prohibitions ([What the Networks Allow](/books/payments/surcharging-and-fees#what-the-networks-allow), [What State Law Allows](/books/payments/surcharging-and-fees#what-state-law-allows)). A flat fee for paying online is a convenience fee, charged to every method in that channel, never face-to-face and never on recurring payments, which rules it out on payment plans ([Convenience and Service Fees](/books/payments/surcharging-and-fees#convenience-and-service-fees)).

What changes in a practice:

- **HSA and FSA cards are debit cards.** Benefits cards run on debit networks, so they can never be surcharged. A surcharge engine that classifies by BIN gets this right; one that asks the patient "credit or debit?" doesn't.
- **The fee is not a charge for care.** A surcharge posts to the ledger as its own line, not as part of a procedure fee, so it never appears on a claim, never changes a fee schedule, and isn't an amount an insurer or an HSA administrator is asked to reimburse.
- **Payer contracts may forbid it.** Some participation agreements, Medicaid programs and state rules restrict charging patients amounts beyond their cost share. The surcharge rule set needs a payer dimension as well as a state one, and when in doubt, the default is off.

## HSA and FSA Cards

Patients pay a large share of dental, vision and medical bills with health savings account (HSA) and flexible spending arrangement (FSA) cards. IRS Publication 502 lists what counts: amounts paid "for the prevention and alleviation of dental disease," eyeglasses and contact lenses "needed for medical reasons," and most clinic services; it says "you generally can't include veterinary fees," with an exception for a guide dog or other service animal. A vet clinic that advertises "use your HSA" is telling its clients something the IRS doesn't say.

Clinics don't run the inventory information approval system (IIAS) that pharmacies and big-box stores need for mixed baskets ([FSA and HSA Cards at the Counter](/books/payments/payments-by-vertical#fsa-and-hsa-cards-at-the-counter)); they sell services under medical merchant category codes, and the benefits administrator substantiates later. What a practice's system owes the patient is the **itemized receipt**: patient name, provider, date of service, a description of each service and its amount, and the payment, because that's what the administrator asks for when it substantiates a charge. Two traps:

- **Prepayments and memberships aren't services yet.** A deposit or a membership fee charged to an FSA card before care may not be substantiable until the service happens. Under the 2025 tax law, direct primary care fees within the IRS's caps are payable from an HSA from 2026, which [In-Office Membership Plans & Cash Pay](/books/health-tech/membership-plans#direct-primary-care-hsas-and-the-2026-change) covers.
- **Cosmetic services aren't medical care.** Teeth whitening, most med spa services and elective cosmetic procedures generally aren't eligible, and a receipt that blurs them into a medical visit exposes the patient, not the practice, to the tax consequence. Itemize so the patient can tell.

## Terminals at the Front Desk

A practice's terminal should be semi-integrated: the PMS or engagement platform sends the amount, the terminal talks to the processor, and only the result and a token come back ([Terminals and Where the POS Sits](/books/payments/card-present#terminals-and-where-the-pos-sits)). Every vendor in the table sells one, and the health twist is mostly about the desk:

- **The PMS workstation is not a payments device.** Front desk computers run the PMS, imaging bridges, email and the occasional personal browser; if card data never touches them, they stay out of PCI scope.
- **The amount comes from the ledger.** Staff choose a patient and a balance (or the day's estimated portion), and the terminal is driven from that, so the amount on the terminal and the amount posted can't diverge through a typo.
- **Tap to pay on a phone serves the chairside and mobile cases:** a mobile vet, a home health visit, a hygienist checking out a patient at the chair.

## Payer Virtual Cards

Some health plans and their payment vendors pay providers with a **virtual credit card**: a single-use card number sent by fax, mail or portal, which the practice keys into its terminal and pays a card fee on (the AMA has cited fees "as high as 5 percent" per transaction). CMS's guidance is that the provider can refuse: when a provider asks a health plan to pay through the ACH network using the adopted EFT standard, 45 CFR 162.925(a)(1) "requires the health plan to comply with the request," and the provider must enroll for EFT and ERA with each plan. CMS also notes that the 835 remittance's payment method codes identify ACH, check and wire, but not virtual card, so a card payment arrives disconnected from its remittance.

For the practice's software this means:

- **Track the payment method per payer,** and surface virtual card payments as a cost: the fee is money lost on a contracted rate, and the report that shows it is the practice's evidence when it requests EFT.
- **Reassociate by hand, then by rule.** A virtual card payment has to be matched to its remittance by payer, amount and date; ERA and EFT reassociation by trace number is the cleaner path ([Remittance & Posting](/books/health-tech/remittance-and-payment-posting#eft-and-reassociation) covers it).
- **Insurance payments aren't patient payments.** They post to the claim, not the patient's balance, and an engagement platform's payment API (Open Dental's Payments endpoint, for one, does not support insurance payments) is the wrong door for them.

## Posting to the PMS Ledger

The payment isn't finished until it's on the PMS ledger. Open Dental's public Payments API shows what posting involves: `POST /payments` creates a patient payment with a required amount and patient, a payment type from the practice's own definitions, an optional set of procedures or a payment plan to apply it to, and a source; it applies the payment "FIFO" to outstanding charges, and "Overpayments are inserted as unearned income." A `MerchantFee` field (added in version 25.4.15) is "For display purposes only." Refunds and partial updates arrived in later versions. In the PMS's own card flow, a declined payment's amount and splits are zeroed rather than deleted, so the record stays.

From that and the other vendors, the rules:

- **Post once, by key.** The processor's transaction ID is the idempotency key for the posting; a retry after a timeout must find the existing PMS payment, not create a second. A sync agent that writes into an on-premises PMS database has the same rule ([Integrating with Practice Management Systems](/books/health-tech/pms-integration#writing-back) has the agent's side).
- **Let the PMS allocate, or allocate explicitly.** A payment applied FIFO lands on the oldest charges; one applied to a specific visit or plan names it. Choose per payment type, and record which was used, so a patient asking "what did my payment cover?" gets the same answer from both systems.
- **Post net or gross, consistently.** The patient paid $100; the processor deposited $97.10. The PMS payment is $100, and the $2.90 fee is the practice's expense in its accounting, never a patient adjustment.
- **Unposted payments are an exception queue.** A PMS that's offline, a patient who can't be matched, a closed accounting period: each payment that fails to post sits in a queue staff can see, with the reason, until it posts or someone resolves it by hand.
- **Refunds and reversals post too.** A refund, a chargeback and a chargeback reversal are each ledger events with their own type, linked to the original payment.
- **Reconcile daily.** Processor deposits, PMS payments and the platform's own payment records should tie out per location per day ([Reconciliation for Two Audiences](/books/payments/software-platforms#reconciliation-for-two-audiences)).

## Who Holds the Merchant Account

A practice's payments usually run through an engagement vendor or PMS acting as a managed payfac or an ISV reseller ([Four Ways In](/books/payments/software-platforms#four-ways-in)). Three health-specific decisions follow:

- **One merchant account per legal entity and tax ID,** which in a group means per practice entity, not per location, while deposits and reporting can still be per location ([The Hierarchy](/books/payments/software-platforms#the-hierarchy)). A DSO's affiliated practices are often separate professional corporations, whose money can't be pooled ([Multi-Location Groups & Call Centers](/books/health-tech/multi-location-and-call-centers#why-groups-are-shaped-the-way-they-are) covers the structure).
- **The descriptor names the practice, not the specialty.** A statement line that says "Smith Family Dental" is fine; one that says "Westside Oncology" discloses something. Payments processing sits inside HIPAA's section 1179 exemption, and products that carry clinical detail beyond it are business associate work ([HIPAA: When a Payments Provider Signs a BAA](/books/payments/payments-by-vertical#hipaa-when-a-payments-provider-signs-a-baa)).
- **Payment metadata carries no clinical fields.** The processor gets an amount, a patient or guarantor reference and a location; procedure codes and notes stay in the platform, under its BAA with the practice.

## How to Build It

The core `payments` table already records who paid (`guarantor_id`), the source, the method (`card`, `hsa_fsa_card`, `virtual_card`, `financing` among them) and a `processor_ref` into the Payments volume's records, and `ledger_entries` is the guarantor's append-only ledger. Payment plans belong to [Patient Statements, Estimates & Collections](/books/health-tech/patient-financial-experience#payment-plans), which creates `payment_plans`; this chapter adds the front-desk channel and fees to payments, the stored card and its consent, payment requests, the plan's installment runs and financing, and points each payment at its PMS write-back:

```sql
ALTER TABLE payments
  ADD COLUMN location_id        UUID REFERENCES locations (id),
  ADD COLUMN channel            TEXT CHECK (channel IN ('front_desk', 'terminal', 'text_to_pay',
                                  'portal', 'card_on_file', 'payment_plan', 'phone', 'mail')),
  ADD COLUMN card_funding       TEXT CHECK (card_funding IN ('credit', 'debit', 'prepaid')),
                                         -- from the BIN, for the surcharge rule
  ADD COLUMN surcharge_amount   BIGINT NOT NULL DEFAULT 0,  -- credit only; never on hsa_fsa_card
  ADD COLUMN processor_fee      BIGINT,  -- the practice's expense, never a patient adjustment
  ADD COLUMN estimate_ref       UUID,    -- the estimate a pre-adjudication payment was taken against
  ADD COLUMN payment_method_id  UUID,    -- payment_methods, below, for a stored card
  ADD COLUMN payment_plan_id    UUID,    -- payment_plans, from Patient Statements, Estimates & Collections
  ADD COLUMN reverses_id        UUID REFERENCES payments (id),  -- refund or chargeback of an earlier one
  ADD COLUMN pms_allocation     TEXT CHECK (pms_allocation IN ('pms_fifo', 'explicit')),
  ADD COLUMN pms_applied_to     JSONB,   -- procedures or plan named, when explicit
  ADD COLUMN writeback_request_id UUID,  -- writeback_requests, from Integrating with PMSs
  ADD COLUMN pms_payment_ref    TEXT;    -- the PMS's own ID once posted

CREATE UNIQUE INDEX payments_processor_ref_uq ON payments (organization_id, processor_ref)
  WHERE processor_ref IS NOT NULL;      -- the posting key: one PMS payment per processor payment

CREATE TABLE payment_methods (            -- a card or bank account on file, per guarantor
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  guarantor_id     UUID NOT NULL REFERENCES guarantors (id),
  kind             TEXT NOT NULL CHECK (kind IN ('card', 'hsa_fsa_card', 'ach')),
  processor_token  TEXT NOT NULL,         -- never a card or account number
  brand            TEXT,
  last4            CHAR(4) NOT NULL,
  card_funding     TEXT CHECK (card_funding IN ('credit', 'debit', 'prepaid')),
  expires          DATE,
  network_txn_id   TEXT,                  -- the first, customer-initiated transaction
  status           TEXT NOT NULL CHECK (status IN ('active', 'expired', 'removed'))
);

CREATE TABLE card_on_file_consents (      -- permission to charge balances after insurance
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  payment_method_id  UUID NOT NULL REFERENCES payment_methods (id),
  consent_id         UUID NOT NULL REFERENCES consents (id),  -- kind 'financial'; wording in disclosure_texts
  scope              TEXT NOT NULL CHECK (scope IN ('post_adjudication', 'payment_plan',
                       'membership', 'deposits')),
  cap_per_charge     BIGINT,              -- above it, send a payment request instead
  valid_from         DATE NOT NULL,
  valid_until        DATE NOT NULL CHECK (valid_until <= valid_from + 366),  -- Visa: at most a year
  notice_days        SMALLINT NOT NULL DEFAULT 3,  -- notice before each charge
  revoked_at         TIMESTAMPTZ
);

CREATE TABLE payment_requests (           -- text-to-pay and email-to-pay links
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  guarantor_id     UUID NOT NULL REFERENCES guarantors (id),
  statement_id     UUID REFERENCES patient_statements (id),
  amount           BIGINT NOT NULL CHECK (amount > 0),
  purpose          TEXT NOT NULL CHECK (purpose IN ('statement', 'copay', 'deposit',
                     'estimate', 'plan_installment', 'membership')),
  token_hash       BYTEA NOT NULL UNIQUE, -- the link's secret, hashed; nothing personal in the URL
  verify_with      TEXT NOT NULL DEFAULT 'dob' CHECK (verify_with IN ('dob', 'last_name', 'none')),
  communication_id UUID REFERENCES communications (id),  -- the text or email that carried it
  expires_at       TIMESTAMPTZ NOT NULL,
  paid_payment_id  UUID REFERENCES payments (id),
  status           TEXT NOT NULL CHECK (status IN ('sent', 'opened', 'paid', 'expired', 'cancelled'))
);

ALTER TABLE payment_plans                 -- the plan record is Patient Statements' table
  ADD COLUMN payment_method_id UUID REFERENCES payment_methods (id),  -- null: paid by link
  ADD COLUMN pms_plan_ref      TEXT,      -- the same plan in the PMS; one plan, not two
  ADD COLUMN max_missed        SMALLINT NOT NULL DEFAULT 2;

CREATE TABLE payment_plan_runs (          -- one row per installment due date
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  payment_plan_id  UUID NOT NULL REFERENCES payment_plans (id),
  due_on           DATE NOT NULL,
  amount_due       BIGINT NOT NULL,       -- least of installment and balance, computed at run time
  payment_id       UUID REFERENCES payments (id),
  status           TEXT NOT NULL CHECK (status IN ('scheduled', 'paid', 'skipped_zero_balance',
                     'failed', 'waived')),
  PRIMARY KEY (payment_plan_id, due_on)
);

CREATE TABLE financing_applications (     -- a lender's product offered at the practice
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  guarantor_id     UUID NOT NULL REFERENCES guarantors (id),
  lender           TEXT NOT NULL,         -- 'carecredit', 'sunbit', 'cherry'
  amount_requested BIGINT NOT NULL,
  offer_shown      JSONB NOT NULL,        -- terms as displayed, deferred-interest date included
  practice_plan_offered BOOLEAN NOT NULL, -- was the practice's own plan shown first
  applied_by       TEXT NOT NULL CHECK (applied_by IN ('patient_device')),  -- never staff
  lender_ref       TEXT,
  funded_payment_id UUID REFERENCES payments (id),  -- source and method 'financing'
  merchant_fee     BIGINT,
  status           TEXT NOT NULL CHECK (status IN ('started', 'approved', 'declined', 'funded',
                     'cancelled', 'refunded_to_lender'))
);
```

The post-adjudication charge job runs after remittances post. Remittance lines reach the guarantor's ledger as `insurance_payment` and `contractual_adjustment` entries, and charges carry the encounter:

```sql
-- Encounters whose balance a recent remittance settled, chargeable under an active consent:
SELECT l.guarantor_id, ch.encounter_id, SUM(l.amount) AS balance,
       c.id AS consent_id, c.cap_per_charge
FROM ledger_entries l
JOIN charges ch ON ch.id = l.charge_id
JOIN payment_methods m ON m.guarantor_id = l.guarantor_id AND m.status = 'active'
JOIN card_on_file_consents c ON c.payment_method_id = m.id
  AND c.scope = 'post_adjudication' AND c.revoked_at IS NULL
  AND CURRENT_DATE BETWEEN c.valid_from AND c.valid_until
WHERE l.organization_id = $1
  AND ch.encounter_id IN (
    SELECT ch2.encounter_id
    FROM ledger_entries r
    JOIN remittance_lines rl ON rl.id = r.remittance_line_id
    JOIN remittances rm ON rm.id = rl.remittance_id
    JOIN charges ch2 ON ch2.id = r.charge_id
    WHERE r.organization_id = $1 AND rm.received_at > $2)
GROUP BY l.guarantor_id, ch.encounter_id, c.id, c.cap_per_charge
HAVING SUM(l.amount) > 0;
```

For each row it sends the notice, waits `notice_days`, rereads the balance, charges the lesser of the balance and the cap with the encounter and remittance as the idempotency key, and sends a payment request for anything above the cap.

Design notes:

- **The guarantor is the payer everywhere.** Payment methods, consents, requests, plans and financing hang off `guarantors`, never `patients`, so a parent pays for a child and a client for an animal without either becoming the other.
- **Payments post to the PMS by processor key.** The write-back is a `writeback_requests` row in the integration layer ([Integrating with Practice Management Systems](/books/health-tech/pms-integration#writing-back) owns it), created in the same transaction as the payment through the outbox ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)); payments without a `pms_payment_ref` past a threshold are the front desk's exception queue.
- **Consent wording is versioned once.** The card-on-file permission is a `consents` row whose exact text is a `disclosure_texts` version; `card_on_file_consents` adds only the payment terms (scope, cap, expiry, notice).
- **The rules are data.** Surcharge eligibility by state, card type and payer, consent caps and notice days are effective-dated rules, so a fee charged in March can be explained by the rule in force in March ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Events:** `payment.received`, `payment.posted_to_pms`, `payment.posting_failed`, `payment_request.sent`, `payment_plan.installment_failed`, `financing.funded` and `card_consent.revoked` feed the ledger, messaging and reporting.

## Auditing

- **What the guarantor agreed to.** Each card-on-file consent and payment plan with the document as shown, its cap, its expiry and every revocation.
- **Every charge and its trigger.** For a post-adjudication charge, the remittance and encounter it came from, the notice sent and when, and the balance read at charge time, so "you charged me for a visit insurance covered" is answered with a query.
- **What each text revealed.** The message text sent, the link's verification step and when it was opened, linked to `communications`.
- **Every fee.** Surcharges with the card classification, state and payer rule versions behind them; processor and financing fees as practice expenses.
- **Every posting.** Each payment's PMS write, attempts and errors, and every payment that was posted by hand, by whom.
- **Financing offers.** Terms shown, whether the practice's plan was offered first, and that the patient applied on their own device.

## What This Means for the System You Build

- **Post every payment to the PMS ledger by the processor's transaction ID,** with an exception queue for what fails, and reconcile processor, PMS and platform daily per location.
- **Hang every payment record off the guarantor,** not the patient, so the right person is billed and texted.
- **Charge a card on file only from a posted remittance,** within a consented cap and expiry, after a notice, and send a link for anything above the cap.
- **Keep the text minimal and the page gated:** no clinical detail in the SMS, a light identity check before the balance shows.
- **Make the practice's own plan the PMS's plan,** computed from the balance at each run and interest-free; send credit products to a lender.
- **Offer financing so the patient applies on their own device,** show deferred-interest terms plainly, and keep the lender's money and the practice's ledger separate.
- **Surcharge only what the Payments rules allow,** never benefits cards, as its own ledger line, with a payer dimension in the rules.
- **Itemize receipts for HSA and FSA substantiation,** and don't tell vet clients their HSA pays for the dog.
- **Track payer virtual cards as a cost** and give the practice the evidence to demand EFT.

## References

**Regulation and guidance**

- [IRS: Publication 502, Medical and Dental Expenses](https://www.irs.gov/publications/p502), dental, eyeglass and contact lens expenses as medical care, veterinary fees generally excluded except for service animals
- [CMS: HIPAA Administrative Simplification FAQ on Guidance Letter 2022-04 (PDF)](https://www.cms.gov/files/document/gl-2022-04-go-answers-faq.pdf), health plans must comply with a provider's request for EFT through the ACH network under 45 CFR 162.925(a)(1), and 835 payment method codes don't identify virtual cards
- [CFPB: Medical credit cards and financing plans (May 2023)](https://www.consumerfinance.gov/data-research/research-reports/medical-credit-cards-and-financing-plans/), deferred-interest volumes, interest incurred and typical APRs ([PDF](https://files.consumerfinance.gov/f/documents/cfpb_medical-credit-cards-and-financing-plans_2023-05.pdf))
- [CFPB: Finalizes rule to remove medical bills from credit reports (archived)](https://www.consumerfinance.gov/archive/newsroom/cfpb-finalizes-rule-to-remove-medical-bills-from-credit-reports/), the January 7, 2025 rule and the notice of its July 11, 2025 vacatur
- [ABA Banking Journal: Texas federal judge vacates CFPB's medical debt rule](https://bankingjournal.aba.com/2025/08/texas-federal-judge-vacates-cfpbs-medical-debt-rule/), Cornerstone Credit Union League v. CFPB and the court's reasoning
- [eCFR: 12 CFR 1026.2](https://www.ecfr.gov/current/title-12/chapter-X/part-1026/subpart-A/section-1026.2), Regulation Z's creditor definition: a finance charge or more than four installments
- [New York General Business Law § 349-g](https://www.nysenate.gov/legislation/laws/GBS/349-G), the ban on providers completing medical financial product applications for patients, and its definition
- [AMA: Physicians protected from health plan credit card fees (2017)](https://www.ama-assn.org/practice-management/digital-health/physicians-protected-health-plan-credit-card-fees), CMS's statement that a plan can't require virtual card acceptance, and fees as high as 5 percent

**Vendor documentation**

- [Open Dental: API Payments](https://www.opendental.com/site/apipayments.html), creating patient payments, FIFO allocation, unearned income for overpayments, payment plans, `MerchantFee` for display only, no insurance payments, version history
- [Open Dental: API PayPlans](https://www.opendental.com/site/apipayplans.html), creating payment plans with specified terms
- [Open Dental: Patient credit card payments](https://www.opendental.com/manual/paymentpatientcreditcard.html), integrated processors, posting to the patient account, declined payments zeroed
- [NexHealth: Payments](https://www.nexhealth.com/features/payments), text to pay, card on file, installment plans, terminal, which PMSs sync, published rates
- [Rectangle Health: Practice Management Bridge](https://www.rectanglehealth.com/platform/practice-management-bridge/), automatic posting, text to pay, payment vault, plans, integration counts, BAA storage
- [Weave: Payments](https://www.getweave.com/weave-payments/), text to pay, card on file, plans, terminals, financing partners, Bulk Collections systems
- [Podium: Payments](https://www.podium.com/product/payments/), text to pay, recurring payments, card readers, buy now pay later
- [InstaMed](https://www.instamed.com/), J.P. Morgan ownership, text to pay, portals and terminals
- [PetDesk: Payments](https://petdesk.com/product/feature/payments), checkout and overdue invoice follow-up, PIMS sync

**Financing**

- [CareCredit: For providers](https://www.carecredit.com/providers/), promotional and reduced-APR plans, thresholds, provider funding time, promotion management
- [Sunbit: How it works](https://sunbit.com/how-it-works/), approval rate, APR range, plan lengths, credit bureau reporting
- [Cherry](https://withcherry.com/), APR range and terms, pay-in-four, the platform as not the lender
