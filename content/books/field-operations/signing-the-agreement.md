+++
title = "Signing the Agreement"
description = "Closing the sale: ESIGN consent at the door, customer-device signing, state templates, cooling-off deadlines, payment timing, B2B contracts and the handoff."
category = "Field Operations Industry"
order = 1525
part = "Selling"
tags = ["field-operations", "sales", "e-signature", "consumer-protection", "contracts"]
+++

The signature is the moment a sale becomes a customer, and it's the record every later argument goes back to. Months after a rep's driveway pitch, a customer disputes a charge, an inspector asks for the contract, a rep claims commission on an account that cancelled, or a regulator asks whether the buyer was told they could cancel. Each question is answered by what the system captured in the few minutes around the signature: which document and version, who signed, on whose device, what they were shown, and what happened next. Signing is also where the hardest consumer rules bite. A pest or lawn plan sold at the door, a furnace replacement signed at the kitchen table and a solar contract closed in the living room are all sold away from the seller's place of business, which brings the federal Cooling-Off Rule and its state cousins into the sale.

## What Gets Signed

A signed agreement is a **signing packet**: several documents executed together, each with its own legal job.

- **The service agreement:** the services, the initial and recurring price, the billing frequency, the term, renewal, and termination terms ([Service Agreements & Plans](/books/field-operations/service-agreements) covers the agreement as data).
- **The right-to-cancel disclosures:** for a door-to-door sale, the receipt, cancellation statement and duplicate Notice of Cancellation the Cooling-Off Rule requires ([Consumer Protection](/books/field-operations/consumer-protection#the-sale-at-the-door) lists them).
- **Consent to electronic records:** a notice the law requires in writing (like the cancellation notice) counts electronically only after ESIGN consent, below.
- **The payment authorization:** consent to store a card or bank account and charge it on a schedule ([Stored Cards & Recurring Billing](/books/payments/stored-credentials)).
- **State, trade and product addenda:** termite warranty terms, chemical notices, an equipment registration for an HVAC manufacturer's warranty, financing disclosures, a state-required clause.

The packet is a unit. A service agreement signed without its cancellation notice is a defective sale, and a system that lets a rep send one without the other has built the defect in.

**Commercial contracts sign differently.** A service contract with a business (a restaurant's pest plan, a property manager's landscaping, a hospital's HVAC maintenance) isn't a consumer sale, so the Cooling-Off Rule, which covers goods and services bought "primarily for personal, family, or household purposes," doesn't apply and the packet has no cancellation notice. The paperwork comes from the buyer as often as from the seller: a master services agreement sets the terms once, and each site or job is a work order or statement of work under it, often released against the customer's purchase order, whose number the customer's accounts payable expects on every invoice. The question that replaces "was the buyer told they could cancel" is "could this person bind the company": record the signer's name, title and email domain, and for large or multi-site contracts ask for a signature from someone the customer's procurement office names. [Repair, Install & Commercial Work](/books/field-operations/repair-and-installation) covers the contract terms that follow (SLAs, not-to-exceed amounts).

## The Law, Applied at the Door

ESIGN and UETA, consumer consent, attribution and signing evidence are in [Electronic Signatures & Records](/docs/compliance/electronic-signatures). The part that bites field sales is [Consumer Consent Comes First](/docs/compliance/electronic-signatures#consumer-consent-comes-first): the cancellation notice is a disclosure the law requires in writing, so an electronic copy counts only if the customer's consent shows they can open it where it will be delivered. Consent tapped on the rep's tablet for a notice that arrives by email is the weak case, and it surfaces later as "the customer was never validly told they could cancel." Store the rendered PDF exactly as signed, with its hash and the provider's certificate.

## How the Platforms Do It

Field-service platforms split into those that own the signing experience and those that hand it to an e-signature provider.

| Platform | Where the customer signs | What the public docs say |
| -------- | ------------------------ | ------------------------ |
| Enerflo | Email or in person | "Docflo" compiles a solar sale's documents into one signing packet |
| FieldRoutes | Rep's device, in the field | "You can sign an agreement offline," but only one opened while online can be viewed, and "creating a new contract requires a connection" |
| Jobber | Client hub, on the customer's device | The client approves a quote and signs by drawing or typing a name; a required deposit turns the button into "Approve and Pay Deposit"; editing an approved quote removes the signature and saves the signed version as a PDF note |
| SalesRabbit | Rep's device | "Digital Contracts" builds contracts, and "Mobile eSignature" is a paid add-on |
| ServiceTitan | Customer's own device, by link | Forms are sent by email or text, customers "review and sign on their own devices," signed documents go to the job audit trail, and sending requires a connection |

ServiceTitan's offline guide saves form signatures locally but needs a connection for contracts, proposals and financing. That split is common: a signature image is easy offline; a complete packet with a delivered copy isn't. Platforms that want a portable, independently verifiable record embed an e-signature provider (DocuSign, Dropbox Sign, Acrobat Sign), and all of them put the same thing on you in embedded mode: identifying the signer. In remote signing the provider's link is evidence that the signer controls that inbox or phone; in embedded signing the provider records that your application said it checked, and nothing more.

## Embedded or Remote: Whose Device

The field industry's signature problem is a tablet. A rep finishes the pitch, turns the tablet around, scrolls to the signature box and hands over a stylus. It's fast and it works without the customer's email. The law doesn't ban signing on a seller's device, but a complaint that the customer never saw the terms or the price ([Consumer Protection](/books/field-operations/consumer-protection) covers what regulators look for) is easier to make, and harder to rebut, when the customer never held a copy.

| Pattern | Evidence of identity | Customer keeps a copy | Works offline | Risk |
| ------- | -------------------- | --------------------- | ------------- | ---- |
| Signature on the rep's tablet, copy emailed later | Rep's word, GPS, photo | Only if the email arrives | Yes | Customer can say they never saw the terms |
| Embedded provider session on the rep's tablet | Provider certificate plus your declared auth method | At completion, if delivered | Rarely | Same, with better tamper evidence |
| Link to the customer's own phone | Control of the phone or inbox | Yes, before and after signing | No | Needs signal and a working contact |

My default is the last row: send the packet to the customer's phone, let them read it on their own screen, and sign there, as ServiceTitan and Jobber do. Keep the tablet for when there's no signal, and then require delivery of the copy and cancellation notice to a verified contact before the sale counts as complete. An undelivered copy belongs in a visible exception queue, not a quiet new customer. The cost is real: some door sales are lost to a dead phone or a customer who won't share a number, and a business that weighs that higher can sign on the tablet with more evidence (a photo, GPS, the provider certificate) and accept the weaker position in a dispute.

## Templates by State

Contract terms vary by state, trade and product, so the agreement is assembled from a **template** chosen by rules, not picked by a rep. State home-solicitation laws differ in the length of the window, who gets a longer one, the wording of the notice and what counts as a business day ([Consumer Protection](/books/field-operations/consumer-protection#state-home-solicitation-laws) has the federal baseline and California's example). Accreditation can add its own clauses, such as QualityPro's termite agreement requirement ([Licenses & Permits](/books/field-operations/licensing-and-permits#accreditation-and-manufacturer-programs)). Check current state law with counsel; don't ship a fifty-state table you haven't verified.

The model that survives this has three parts: a **clause library** (each clause versioned, with the jurisdictions, trades and products it applies to), **templates** that compose clauses and are versioned as a whole, and a **resolution rule** that picks the template from the service address's state, the product, the sale channel (`sold_via`: `door`, `phone`, `web`, `store` or `technician`) and buyer attributes like age where a state makes them matter ([Rules as Data](/docs/architecture/rules-as-data)). The resolved template version is pinned on the agreement at the moment it's generated. Never re-resolve a signed agreement against today's templates. The one table this chapter adds hangs signing documents off the canonical `agreements` table from [The Field Operations Business](/books/field-operations/field-operations-business):

```sql
CREATE TABLE agreement_documents (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  agreement_id     UUID NOT NULL REFERENCES agreements (id),
  template_id      UUID NOT NULL,
  template_version INTEGER NOT NULL,       -- pinned at generation
  jurisdiction     TEXT NOT NULL,          -- e.g. 'US-CA'
  rendered_sha256  TEXT NOT NULL,          -- hash of the exact bytes shown
  provider         TEXT,                   -- 'docusign', 'dropbox_sign', 'in_house'
  provider_ref     TEXT,                   -- envelope or signature request id
  status           TEXT NOT NULL,          -- draft, sent, signed, declined, expired, voided
  signed_at        TIMESTAMPTZ,
  certificate_uri  TEXT                    -- provider's audit certificate
);
```

## Computing the Cooling-Off Deadline

The deadline is a computation, and the system should own it rather than leave it to the rep's pen. Under the federal rule a **business day** is "any calendar day except Sunday or any federal holiday," so Saturdays count, and the buyer may cancel until midnight at the end of the third business day after the day of the transaction. The FTC's consumer page works four examples:

![Four rows of a two-week calendar, one per FTC example. A Monday sale counts Tuesday, Wednesday and Thursday, so the deadline is midnight Thursday. A Monday sale with a Tuesday federal holiday skips Tuesday and ends Friday. A Friday sale counts Saturday, skips Sunday, and ends Tuesday. A Friday sale with a Monday holiday counts Saturday, skips Sunday and Monday, and ends Wednesday. Skipped days are dashed, and the accented deadline day closes at midnight, buyer's local time.](/diagrams/fo-signing-the-agreement-deadline.svg "The FTC's four worked examples. Saturdays count; Sundays and federal holidays don't; the window closes at midnight at the end of the third counted day.")

```text
deadline(sale_date, rules):
  day = sale_date
  counted = 0
  while counted < rules.days:            # 3 federally; longer under some state laws
    day = day + 1
    if day is Sunday or day in rules.holidays(jurisdiction, year): continue
    counted += 1
  return end_of_day(day, service_address_timezone)
```

The traps are all in the inputs. Holidays come from a calendar table per jurisdiction and year, maintained ahead of time, because a state rule may use state holidays rather than federal ones, and this business day isn't the banking one ([Time](/docs/fundamentals/time#business-dates-business-days-and-holidays)). "Midnight" is local to the buyer, so the time zone comes from the service address, not the server or the rep. And the deadline must be printed on both copies of the notice (the federal rule requires the seller to fill in the date of the transaction and the last day to cancel), so it's computed before signing and stored with its inputs and the rule version, not derived later ([Rules as Data](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).

The deadline is stored as `cancellation_deadline_at` with `cancellation_deadline_time_zone`, the zone its midnight is in. A mailed cancellation is checked against it by its `postmarked_on` date, not the day it arrived ([Consumer Protection](/books/field-operations/consumer-protection#renewal-and-cancellation-in-the-field) has the channels and the postmark rule).

## Taking Payment at Signing

Most recurring-service sales collect something at signing: the initial service fee, a deposit, or just a payment method for autopay. Where the card is typed decides PCI DSS scope, and the questionnaire follows the architecture ([PCI DSS: Which SAQ](/docs/compliance/pci-dss#which-saq-architecture-decides)). At the door that means three cases:

- **The customer types on their own device into a provider-hosted page.** That's the SAQ A shape, with its script-attack criterion if the provider's form is embedded in your page ([Payment Page Scripts](/docs/compliance/pci-dss#payment-page-scripts)).
- **The rep keys the card into a web virtual terminal.** SAQ C-VT is meant for merchants who manually enter one transaction at a time by keyboard into a third-party-hosted virtual terminal, on an isolated device. A shared sales tablet running other apps fits that poorly.
- **The rep taps or dips the card on a reader or the phone.** That's card-present acceptance, with its own validated-solution path ([Card-Present Payments](/books/payments/card-present)).

The pattern that keeps reps out of scope and customers in control is the same one as for signing: the payment step is a hosted page on the customer's phone, opened from the same link as the packet, and the app never sees a card number. Store only the provider's token, brand, last four and expiry ([Sensitive Data](/docs/payments/sensitive-data)).

Timing matters as much as scope: signing stores the payment method, and nothing is charged before the agreement is `active` except the two refundable exceptions in [Consumer Protection](/books/field-operations/consumer-protection#charging-inside-the-window).

**Financing** follows the same principle with higher stakes: the customer applies in the lender's flow on their own phone, and the rep's app records only that an application was sent, its status and the approved terms ([Pricing & Sales Rules](/books/field-operations/pricing-and-sales-rules#financing-presentment), with the sequencing in [Consumer Protection](/books/field-operations/consumer-protection#financing)).

## Verification Calls

Door-to-door operators often add a step the law doesn't require: someone other than the rep confirms the sale with the customer. A 2023 Pest Control Technology article on door-to-door selling describes one company that requires every door-to-door sale to pass both a phone verification and a technician verification, "a checks-and-balance [procedure] in place to ensure the customer is onboarding with correct information." Treat it as an operating practice, not a legal requirement.

A verification is a short structured interview, not a sales call: it confirms the key terms of the deal and that the customer received the agreement and the cancellation notice. Build it as a form with a versioned script, an answer per question, and an outcome: **verified** (proceed), **corrected** (a new agreement version for the customer to accept, never an edit to the signed one), **disputed** (the customer describes a different deal; hold the commission and route to a manager), **cancelled** (a cancellation inside the window) or **unreachable** (policy decides whether the first visit proceeds).

Recording the call is a state-law consent question ([Calls, Texts & Email](/docs/compliance/consumer-contact#recording-calls)). Outcomes also feed the rep's record: a pattern of disputed verifications is the earliest signal a manager gets.

## After Signing: The Handoff

A signed packet starts processes owned elsewhere: the first visit, billing, the welcome message, the rep's commission. The cleanest design is an agreement state machine whose transitions publish events that downstream systems react to, rather than calls made inline from the signing screen ([Events](/docs/architecture/events)). The states are `draft`, `out_for_signature`, `signed` (window open, not billable) and `active`, with side exits to `void` (never signed, or expired) and `cancelled` (before it became active, reason recorded); after activation an agreement can be `paused`, `on_hold` or `terminated` ([Service Agreements & Plans](/books/field-operations/service-agreements)). The first visit is a milestone, not a state.

![The agreement state machine. Draft moves to out for signature when the packet is sent. Out for signature moves to signed when every party signs, or to void when it is declined or expires. Signed means the cancellation window is open; when the deadline passes (and any verification the business requires is done), the agreement becomes active, which starts recurring billing and moves the rep toward earning the commission; that step is accented. From signed, a buyer cancellation or failed verification moves it to cancelled, which requires a refund within 10 business days.](/diagrams/fo-signing-the-agreement-states.svg "Signed isn't active. The window between them is when the buyer can still walk away, so anything started there has to be undoable.")

The event uses the CloudEvents envelope, with the agreement as the body:

```http
ce-specversion: 1.0
ce-id: 0194c3c0-5b7e-7f12-8a40-1d9e6b2c7f35
ce-source: /agreements
ce-type: agreement.signed
ce-subject: 0194c3bf-2a61-7c08-b5d3-8e4f0a1c9b26
ce-time: 2026-10-26T18:42:10Z
Content-Type: application/json

{
  "id": "0194c3bf-2a61-7c08-b5d3-8e4f0a1c9b26",
  "account_id": "0194c3be-9d10-7e44-a7f2-3c5b8d0e6a19",
  "status": "signed",
  "cancellation_deadline_at": "2026-10-30T03:59:59Z",
  "cancellation_deadline_time_zone": "America/New_York",
  "sold_via": "door",
  "signed_via": "customer_device",
  "sold_by_staff_member_id": "0194c3a2-4f8b-7b30-9c61-2e7d5a0f8c44"
}
```

What each consumer does with it:

- **Scheduling** books the first visit. There's a business reason to book fast (one pest control owner in the PCT piece aims to complete the first service within 24 hours of the sale, "before the customer changes their mind") and a legal reason to be careful: a visit inside the window is performed while the buyer can still cancel. The rule's exclusions are narrow and are covered in [Consumer Protection](/books/field-operations/consumer-protection#the-exclusions-read-narrowly). Decide with counsel whether you serve inside the window and what you charge if the buyer then cancels; never let a rep mark a routine sale as an "emergency" to skip the window. [Booking Appointments](/books/field-operations/booking-appointments) covers the booking itself.
- **Billing** creates the billing schedule and stores the payment method, and charges according to the payment design chosen above ([Billing Recurring Service](/books/field-operations/billing-recurring-service)).
- **Communications** sends the welcome message with the packet and the cancellation notice if they weren't delivered at signing, and records delivery.
- **Commissions** creates a pending commission that only becomes earned after the window and the first service ([Sales Teams & Commissions](/books/field-operations/sales-teams-and-commissions)).

Publish events with an outbox in the same transaction as the state change, so a crash between "signed" and "event sent" can't lose a customer ([Events](/docs/architecture/events#the-transactional-outbox)). Make every consumer idempotent on the agreement ID, because e-signature webhooks retry and arrive out of order ([Webhooks](/docs/api-design/webhooks)). And treat the provider's webhook as the trigger to fetch the envelope's status, not as the truth itself.

## Cancellation and Rescission

A cancellation inside the window is the reverse of the handoff, and every downstream effect needs an undo: cancel the booked visit and release its slot, void the pending commission, stop the billing schedule, refund anything collected within 10 business days, and cancel any financing application. Model it as an `agreement.cancelled` event with a reason (`buyer_cooling_off`, `verification_failed`, `rescission`, `duplicate`) that every consumer handles, and a saga that tracks each step to completion so a stuck refund is visible.

Cancellations arrive on every channel ([Consumer Protection](/books/field-operations/consumer-protection#renewal-and-cancellation-in-the-field) has the legal clock and the channels, [Collections & Retention](/books/field-operations/collections-and-retention#cancellations) the field mechanics and the `cancelled` versus `terminated` split). The signing-specific point: inside the window the cancellation is a right, not a negotiation, so no save offer runs before the deadline, and a script that argues with it misrepresents that right.

## Auditing

The agreement is the record most likely to be subpoenaed, disputed or inspected. The field-specific records, append-only:

- **The packet as signed:** exact bytes and hash, template and clause versions, the jurisdiction resolution and its inputs, the provider's certificate, and whose device it was signed on.
- **ESIGN consent and delivery:** the disclosure version, the channel consent was demonstrated on, and where and when the copy and the cancellation notice were delivered.
- **The deadline and its undo:** the computed deadline with its holiday calendar version (and any override, with approver), the verification script, answers and outcome, and for a cancellation the channel, postmark, reason and each undo step, including the refund date against its 10-business-day limit.

Signing evidence in general is in [Electronic Signatures & Records](/docs/compliance/electronic-signatures#what-the-evidence-holds); record structure and retention follow [Audit Trails](/docs/architecture/audit-trails), with field records in [Audit Trails & Records](/books/field-operations/audit-trails-and-records). Together they answer a chargeback ([Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)), a regulator's request for the contract and notice, and a commission dispute.

## What This Means for the System You Build

- **A signing packet as one unit,** with the agreement, cancellation disclosures, ESIGN consent and payment authorization executed and delivered together.
- **Customer-device signing by default,** with tablet signing as an offline fallback that can't complete until a copy reaches a verified contact.
- **Templates resolved by rule and pinned by version,** from a versioned clause library keyed by jurisdiction, trade, product, channel and buyer attributes.
- **Cancellation deadlines computed by the system** from a jurisdiction holiday calendar and the service address's time zone, printed on the notice and stored with their inputs.
- **Payment and financing on hosted pages on the customer's device,** storing tokens only, and nothing charged before activation beyond the two refundable exceptions.
- **An agreement state machine with outbox events** that scheduling, billing, communications and commissions consume idempotently, and a cancellation saga that undoes each of them.
- **Commercial contracts recorded as such:** no cooling-off notice, the MSA and purchase order referenced, and the signer's authority captured.
- **Verification as a scripted, recorded workflow** with outcomes that can hold a commission or cancel a sale.

## References

**Specifications**

- [15 U.S.C. 7001: Electronic Signatures in Global and National Commerce](https://www.law.cornell.edu/uscode/text/15/7001), the consumer consent and "reasonably demonstrates" requirement for records the law requires in writing
- [eCFR: 16 CFR 429.1, The Cooling-Off Rule](https://www.law.cornell.edu/cfr/text/16/429.1), the cancellation notice with the transaction date and last day to cancel, no misrepresentation of the right, and refunds within 10 business days of cancellation
- [eCFR: 16 CFR 429.0, Definitions](https://www.law.cornell.edu/cfr/text/16/429.0), consumer goods and services bought primarily for personal, family or household purposes, and business days excluding Sundays and federal holidays
- [PCI SSC: FAQ 1229, SAQ C-VT](https://www.pcisecuritystandards.org/faqs/1229), the eligibility criteria for manually keyed virtual terminal transactions

**Reference**

- [FTC: Buyer's Remorse, the Cooling-Off Rule](https://consumer.ftc.gov/articles/buyers-remorse-ftcs-cooling-rule-may-help), Saturdays counting as business days, the four worked deadline examples, postmarked cancellations and exclusions

**In practice**

- [ServiceTitan: Send forms for e-signature](https://help.servicetitan.com/release-hub/docs/send-forms-for-e-signature-in-the-servicetitan-field-mobile-app), customers signing on their own devices with signed documents in the job audit trail
- [ServiceTitan: Field Mobile App offline capabilities](https://help.servicetitan.com/docs/servicetitan-field-mobile-app-offline-capabilities), signatures saved offline while contracts, proposals and financing need a connection
- [FieldRoutes: Mobile offline mode](https://knowledgebase.fieldroutes.com/docs/fieldroutes-mobile-offline-mode.md), agreements signable offline, viewable only if opened online, and new contracts needing a connection
- [Jobber: Quote approvals](https://help.getjobber.com/en/articles/quote-approvals/), drawn or typed signatures, approve and pay deposit, and signatures removed when an approved quote is edited
- [SalesRabbit: Features](https://salesrabbit.com/features/), Digital Contracts and the Mobile eSignature add-on
- [Enerflo](https://enerflo.com/), Docflo signing packets for solar sales
- [PCT: Door-to-door sales in the pest control industry](https://www.pctonline.com/news/door-to-door-sales-pest-control-industry), phone and technician verification of every sale, and first service within 24 hours
