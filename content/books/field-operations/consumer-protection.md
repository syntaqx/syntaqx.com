+++
title = "Consumer Protection"
description = "Consumer law at the customer's door: the Cooling-Off Rule and its exclusions, home solicitation, renewals and cancellation, field contact and privacy."
category = "Field Operations Industry"
order = 1518
part = "The Rules"
tags = ["field-operations", "compliance", "consumer-protection", "cooling-off", "subscriptions", "privacy"]
+++

A recurring home-service agreement runs into more consumer law than almost any other small purchase, and most of it comes from where the sale happens. A pest, lawn or pool plan sold on the porch is a door-to-door sale under the FTC's Cooling-Off Rule and usually under a state home-solicitation statute too. A furnace replacement quoted at the kitchen table is the same kind of sale, and if it's financed against the house, a lending rule adds a second clock. The plan then renews on its own, which brings the state automatic renewal laws. ROSCA, the federal negative-option statute, covers sales made on the internet, so it reaches a plan the customer bought on the website but not one signed at the door or on a rep's porch tablet, where state law still applies. The reminders, on-my-way texts and win-back calls around it bring the TCPA, and the AI receptionist and in-home sales recordings bring disclosure and recording law. A lead list bought for canvassing brings privacy and data broker law.

What makes this hard for software is that it's local and arithmetic. A three-business-day window depends on the state, the calendar, the type of job and sometimes the buyer's age; whether the window applies at all depends on who initiated the visit and what kind of property the work touches. And nearly every rule is enforced after the fact, from records: a regulator, a class-action lawyer or the customer's card issuer asks the business to prove it gave the notice, honored the cancellation or held the charge.

This chapter covers what's specific to field service: the door, the home, the trades' renewal habits and the data a field business collects. The general machinery is in [Calls, Texts & Email](/docs/compliance/consumer-contact), [Notifications & Consent](/docs/architecture/notifications), [Subscriptions](/docs/payments/subscriptions) and [Rules as Data](/docs/architecture/rules-as-data). None of it is legal advice: counsel decides which rules apply, and the system makes those decisions enforceable and provable.

## How the Platforms Handle It

Field service platforms ship building blocks and leave the policy to their customers, and their help pages say so.

| Platform | What its public docs describe | Where the responsibility sits |
| -------- | ----------------------------- | ----------------------------- |
| **FieldRoutes** | Online Service Cancellation from the customer portal, enabled per service type, which creates a cancellation task and a note for staff. SMS opt-in and opt-out by reply, each change logged on the customer card. An Electronic Consent Agreement the customer signs once before any other e-signature | The company writes the consent text; the docs say the system doesn't supply a vetted version |
| **ServiceTitan** | A Voice Agent that books, reschedules and cancels. Field Pro recording that can start automatically when a technician arrives at a job | "Notifying customers that they are speaking with an AI is a legal requirement in some locations," and for recording, "Two-party consent states require you to inform the customer before recording begins" |
| **Jobber** | Receptionist, an AI that answers calls and texts, with recordings and transcripts for admins | Encourages a greeting saying the phone is answered by AI and tells owners to "check any local or state regulations about recording phone calls" |
| **Housecall Pro** | CSR AI, which introduces itself as AI at the start of each call; service plans that charge the card on file "year after year" | Booking, rescheduling and cancelling are separate permissions the owner grants |

The platforms that make compliance easiest do it with defaults and records: an AI that discloses by default, an opt-out logged with its source, a cancellation request that becomes a task. None ships a rules engine that knows each state's law, and a new platform shouldn't promise one.

## The Sale at the Door

The FTC's **Cooling-Off Rule** (16 CFR Part 429) covers a **door-to-door sale**: a sale, lease or rental of consumer goods or services where the seller personally solicits the sale, even at the buyer's invitation, and the buyer agrees somewhere other than the seller's place of business. It applies at $25 or more at the buyer's home and $130 or more elsewhere. A seasonal lawn program, a termite plan or a water-treatment system sold at the house clears the threshold almost every time.

The rule's requirements are a checklist a signing flow can enforce:

- A **completed receipt or contract** at the time of sale, in the language of the presentation, with the date and the seller's name and address.
- A **cancellation statement** near the signature, in bold type of at least 10 points: the buyer may cancel "at any time prior to midnight of the third business day."
- A **Notice of Cancellation** in duplicate, filled in with the deadline, and an **oral disclosure** of the right at signing.
- No waiver or misrepresentation of the right.
- On cancellation, a **refund within 10 business days**.
- No transfer of the buyer's note to a third party **before midnight of the fifth business day**.

A **business day** under the rule is any calendar day except Sunday and federal holidays, so Saturday counts and a Friday sale can be cancelled until midnight Tuesday, unless Monday is a holiday. That calendar is one of several the platform needs; [Time](/docs/fundamentals/time#business-dates-business-days-and-holidays) covers keeping named business-day calendars as data, and [Signing the Agreement](/books/field-operations/signing-the-agreement) walks through the deadline calculation.

### The Exclusions, Read Narrowly

The definition lists transactions that aren't door-to-door sales. Three matter in the field, and two of them are easy to over-apply.

**Buyer-initiated repair of personal property.** The rule excludes a transaction where the buyer initiated the contact and specifically asked the seller to visit the home "for the purpose of repairing or performing maintenance upon the buyer's personal property." Personal property is the movable kind: a washing machine, a lawn mower, a portable generator. Most of what field businesses do is work on the house and grounds themselves (pest and termite treatment, lawn and tree care, plumbing, a ducted HVAC system), which is real property, so this exclusion doesn't reach it. Whether a particular piece of equipment is personal property or a fixture is a question for counsel, and the platform shouldn't decide it with a checkbox. Even where the exclusion applies, it stops at the repair: anything sold beyond the replacement parts the repair needs is outside it.

**Real property.** A separate exclusion covers transactions "pertaining to the sale or rental of real property." On its face that's about selling or renting the property itself, not services performed on it, so a treatment plan doesn't escape the rule because it's performed on a house.

**Bona fide emergency.** The buyer initiated contact, needs the work for a "bona fide immediate personal emergency," and gives the seller a separate, dated and signed statement in the buyer's own handwriting describing the situation and waiving the right to cancel. A burst pipe or a wasp nest over the front door might qualify; a technician's checkbox never does. Store the waiver as its own document with an image of the handwritten statement.

The sales and booking apps should therefore record, on every sale, the facts these exclusions turn on, rather than a single "cooling-off applies" flag someone can untick:

```sql
-- Columns this chapter adds to the canonical agreements table
ALTER TABLE agreements
  ADD COLUMN sold_via                 TEXT NOT NULL
    CHECK (sold_via IN ('door', 'phone', 'web', 'store', 'technician')),
  ADD COLUMN sold_by_staff_member_id  UUID REFERENCES staff_members (id),  -- null for self-serve web
  ADD COLUMN signed_via               TEXT
    CHECK (signed_via IN ('customer_device', 'seller_device')),  -- set at signing
  ADD COLUMN sale_location_kind       TEXT NOT NULL
    CHECK (sale_location_kind IN ('buyer_home', 'other_away', 'seller_premises', 'remote')),
  ADD COLUMN contact_initiated_by     TEXT NOT NULL
    CHECK (contact_initiated_by IN ('buyer', 'seller')),
  ADD COLUMN emergency_waiver_document_id UUID,     -- the handwritten statement, if any
  ADD COLUMN cooling_off_rule_id      UUID,         -- the rule counsel says applies, or null
  ADD COLUMN cancellation_deadline_at TIMESTAMPTZ,  -- computed once at signing, with its inputs
  ADD COLUMN cancellation_deadline_time_zone TEXT;  -- the buyer's IANA zone the midnight is in
```

`sold_via` is the channel (a technician selling an add-on on a service visit is `technician`), `sold_by_staff_member_id` the rep or technician who made the sale, and `signed_via` whose device the packet was signed on ([Signing the Agreement](/books/field-operations/signing-the-agreement#embedded-or-remote-whose-device)); `sale_location_kind` is where the buyer agreed, which is what the rule's $25 and $130 thresholds turn on. A technician sale in the kitchen is `technician` and `buyer_home`, and it's a door-to-door sale like any other.

Which rule applies is then a decision made from those facts by rules counsel maintains ([Rules as Data](/docs/architecture/rules-as-data)), recorded with the rule version, not a default baked into the signing screen.

### Charging Inside the Window

The canonical agreement model puts a signed agreement in `signed` while its cooling-off window is open, and no recurring-period charge runs on an agreement that isn't `active`. The rule itself doesn't forbid taking payment at signing; it requires a refund within 10 business days if the buyer cancels. So the model allows two exceptions, stated explicitly: an initial-service charge or an install deposit taken at signing, each refunded within 10 business days of a valid cancellation.

My default remains not charging anything until the agreement is active. The alternative, charging at signing and refunding on cancellation, gets cash in sooner and fails a card earlier, but it costs processing fees on refunded sales, invites disputes from customers who see a charge for a plan they cancelled, and turns every cancellation into a refund deadline someone has to meet. If the business charges at signing anyway, the refund must be a tracked task with a due date computed from the receipt of the cancellation, not a manual chore.

Service inside the window is a related choice: a customer who wants the first lawn treatment tomorrow can have it, but record that they asked, and let counsel decide what a cancellation then owes for completed work.

### State Home-Solicitation Laws

**State home-solicitation laws** layer on top, and they're often longer. California's Civil Code 1689.6 gives three business days generally and five for a senior citizen, and a home solicitation contract to repair or restore residential premises damaged by a disaster can be cancelled until midnight of the seventh business day after the buyer signs and dates it. Several states require a solicitor ID, define business days their own way or prescribe their own notice wording. That's why the cancellation deadline can't be a constant: it's a function of jurisdiction, sale type, buyer attributes and a holiday calendar, computed once at signing and stored with its inputs ([Rules as Data](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)). Collecting a buyer's age to apply a senior window is itself personal data, so ask only where a rule needs it and record why.

## Before the Sale: Knocking

Solicitor permits, hours and the constitutional frame are in [Licenses & Permits](/books/field-operations/licensing-and-permits#solicitor-permits-and-no-knock-lists), and Do Not Knock suppression on the canvassing map is in [Door-to-Door Sales](/books/field-operations/door-to-door-sales). The consumer-law consequence for the system is that the knock and the sale are one record chain. A sale made at an address on the city's registry, outside permitted hours or by a rep without a permit for that city is a sale the business may have to unwind, and a commission it may have to claw back. The sales app should block those doors, not just warn, and the agreement should carry a reference to the knock that produced it.

## Renewal and Cancellation in the Field

The general law of automatic renewal (ROSCA's disclosure, consent and simple-cancellation requirements; the FTC's vacated click-to-cancel rule and its March 2026 advance notice; California's automatic renewal law as amended by AB 2863) is in [Subscriptions](/docs/payments/subscriptions#the-law-of-automatic-renewal), along with renewal consent as its own record, reminder scheduling and cancellation as a first-class flow ([Cancellation](/docs/payments/subscriptions#cancellation)). What's specific to field service is how the trades renew, and the channels customers use to cancel.

**Two renewal habits.** Field platforms document two different shapes, and they carry different risk:

- **Automatic renewal.** Housecall Pro's service plans can continue until the customer cancels and charge the card on file each period. Pocomos has a per-customer automatic renewal toggle and creates the next contract's jobs once the last job completes. FieldRoutes' renewal subscriptions (used for termite warranties) advance the renewal date by the renewal frequency when the renewal is paid in full. These are negative-option plans, so state automatic renewal laws apply, and their requirements differ by state. California's, as amended by AB 2863 for contracts entered, amended or extended from July 1, 2025, requires express affirmative consent to the renewal terms, an annual reminder, notice 7 to 30 days before a price change, and cancellation in the medium the customer signed up through. ROSCA adds its own requirements only for plans sold online.
- **Renewal as a new sale.** ServiceTitan's expiring memberships generate renewal estimates on a follow-up list, and Aspire treats renewal as a new opportunity with refreshed pricing and takeoffs. Each renewal is a fresh agreement the customer signs, which avoids negative-option rules for the renewal itself but needs the sales effort and a fresh disclosure each time.

Neither is wrong. My default for residential plans is automatic renewal with an annual reminder sent whether or not the law requires one, because in the trades the reminder doubles as the moment to confirm the property, the plan and the card. Commercial contracts, where the buyer has a procurement process, fit the new-sale shape better. A contract clause that requires cancellation "in writing" is common in older lawn and pest agreements, and it sits poorly with California's rule that customers can cancel in the medium they signed up through; have counsel review it before copying it into a template.

**Cancellation comes through the truck.** Customers tell the technician "this is the last one," tell the rep who sold them, reply to an on-my-way text, call the office or click a portal link. A cancellation said to a technician is still a cancellation received; how the technician app captures it is in [Collections & Retention](/books/field-operations/collections-and-retention#cancellations). Every channel creates the same cancellation request, stamped with the time the customer asked, which is the legal clock ([Subscriptions: Cancellation](/docs/payments/subscriptions#cancellation)). The request's `channel` is one of `phone`, `email`, `web`, `text`, `mail`, `technician` or `ai_agent`, and a mailed cancellation also records `postmarked_on`, because the Cooling-Off Rule counts a notice mailed before the deadline. Then the field-specific consequences follow: unassign future visits, stop occurrence generation, hold any pending charge, and check whether the request arrived inside a cooling-off window, because that turns a routine cancellation into a full refund with a deadline. [Collections & Retention](/books/field-operations/collections-and-retention) covers save offers and the money side.

**The off-season isn't a cancellation.** A pool closed for winter on a seasonal plan is an `active` agreement whose recurrence is out of season, not a cancelled one; `paused` is only for a stop the customer asks for outside the plan. The customer should see in writing that the agreement continues over the winter ([Service Agreements & Plans](/books/field-operations/service-agreements#pausing-and-holding) has the states).

![A home-service agreement's life, from the knock to collections, with the consumer rule that governs each stage: Do Not Knock lists and permits at the door, the Cooling-Off Rule and state home-solicitation law at signing, renewal consent and reminders during the term, TCPA, state calling laws and CAN-SPAM for contact, and the FDCPA and Regulation F for third-party collection.](/diagrams/fo-consumer-protection-lifecycle.svg "Each stage of the agreement has its own rule, and most reduce to a deadline, a notice or a consent record the system has to get right every time.")

## Contacting Customers From the Field

The law of calls, texts, AI voices, recording and email is in [Calls, Texts & Email](/docs/compliance/consumer-contact), and consent, quiet hours and the outbound gate are in [Notifications & Consent](/docs/architecture/notifications#one-outbound-gate). What follows is how it lands on a field operation.

![Every outbound message, call or AI call passes one gate. It checks consent for the channel and purpose, then do-not-call and opt-out status, then quiet hours in the recipient's local time, then frequency caps; any failure blocks or defers with a reason. AI voice and recording add disclosure checks before sending, and every decision is written to the audit log.](/diagrams/fo-consumer-protection-contact-gate.svg "One gate for all outbound contact. Each check either passes, defers to a lawful time, or blocks with a reason, and the decision itself is logged.")

**Most field messages are informational, until they aren't.** Appointment reminders, on-my-way texts, service reports and payment reminders are informational. A completion text that adds "ask about our mosquito add-on" is marketing and needs the stronger consent. Set the purpose on the template, never at send time, and record consent per purpose ([The Consent Ledger](/docs/architecture/notifications#the-consent-ledger)). How far a STOP reaches is in [Revoking Consent](/docs/compliance/consumer-contact#revoking-consent); if the business treats any STOP as stopping everything, it needs another lawful channel for the notices it must still send, such as a renewal reminder by email.

**Shared phone numbers are normal.** A landlord's number sits on twenty rentals, a property manager's on two hundred. Consent belongs to the contact point and purpose, not the account, so an opt-out on one account suppresses the number everywhere.

**AI voices.** An AI that calls lapsed customers with a win-back offer, or any marketing call in an AI or prerecorded voice, needs the customer's prior express **written** consent (47 CFR 64.1200(a)(2) and (a)(3)); consent to appointment reminders doesn't cover it ([Artificial and AI Voices](/docs/compliance/consumer-contact#artificial-and-ai-voices)). An AI that answers the phone falls under state disclosure law instead ([Telling People They're Talking to an AI](/docs/compliance/consumer-contact#telling-people-they-re-talking-to-an-ai)). Housecall Pro's default, an AI that says it's an AI at the start of every call, is the one to copy; [AI in Field Operations](/books/field-operations/ai-in-field-operations) covers the field products.

**Recording in the home.** The field-specific case is a recording that starts in the customer's kitchen: ServiceTitan's Field Pro can start recording when the technician arrives, and its docs tell users in two-party consent states to inform the customer first. Build to the announcement rule everywhere: the technician or rep confirms in the app that they've told the customer, the app records that confirmation with time and location, and the announcement itself is captured at the start of the recording ([Recording Calls](/docs/compliance/consumer-contact#recording-calls)).

## Financing

Financing a large job (a termite treatment, a new HVAC system, a water heater) brings Regulation Z and the FTC Holder Rule into the sale; [Pricing & Sales Rules](/books/field-operations/pricing-and-sales-rules) covers presentment and disclosure. The point for the platform is sequencing, and two different rules set it. The Cooling-Off Rule bars the seller from negotiating, transferring, selling or assigning the buyer's note to a finance company or other third party before midnight of the fifth business day (16 CFR 429.1(h)). When the loan takes a security interest in the customer's principal dwelling, Regulation Z gives a right of rescission until midnight of the third business day after the latest of consummation, delivery of the rescission notice, or delivery of the material disclosures, and until that period expires "no money shall be disbursed other than in escrow, no services shall be performed and no materials delivered" (12 CFR 1026.23). The bar on funding and on starting the install comes from Regulation Z, not from the Cooling-Off Rule, and the Cooling-Off Rule itself excludes transactions where the buyer has that rescission right, which is another reason the applicable rule is a recorded decision rather than an assumption. So the system holds the note transfer until the fifth business day for a door sale, and holds funding and the install until the rescission period ends for a loan secured by the home.

## Collections

Third-party collection brings the FDCPA and the CFPB's Regulation F, including who counts as a debt collector, contact-frequency limits and inconvenient times. [Collections & Retention](/books/field-operations/collections-and-retention) owns those rules and the agency hand-off.

## Privacy in a Field Business

Field businesses hold unusually physical personal data: gate and lockbox codes, alarm instructions, photos of the inside of homes, notes on pets and when the house is empty, kitchen-table recordings, and GPS traces of which houses a technician visited. California's CCPA, as amended by the CPRA, applies to a for-profit business doing business in California that has annual gross revenue over $26,625,000 (the CPI-adjusted threshold since January 1, 2025), or that buys, sells or shares the personal information of 100,000 or more California consumers or households, or that earns half or more of its annual revenue from selling or sharing it; [GDPR & Privacy](/docs/compliance/gdpr#ccpa-and-cpra) covers the rights and the general machinery. What's specific to the field:

- **Access secrets are their own class.** A gate code is worth more to a burglar than a phone number. Encrypt access instructions, show them only to the assigned technician on the day of the visit, and log every view.
- **Photos capture more than the job.** A proof-of-service photo of a back yard can include neighbors and children. Tie photos to the visit, keep them only as long as needed, and include them in access and deletion requests.
- **Deletion meets regulated records.** A deletion request removes or pseudonymizes the identity around a pesticide application record the state requires, while the fact stays ([Audit Trails & Records](/books/field-operations/audit-trails-and-records)).
- **Purchased lists carry their source.** Vendors of homeowner and new-mover lists may be **data brokers**: California requires them to register annually, and its Delete Request and Opt-out Platform (DROP) has taken consumer requests since January 1, 2026, with brokers required to process them from August 1, 2026. Record each imported row's source, license and import date, so a deletion can be traced and the door suppressed on the canvassing map ([Customers, Accounts & Properties](/books/field-operations/customers-and-properties)).

## What Goes Wrong

- **A "cooling-off applies" checkbox** that reps untick, instead of recorded facts and a rule decision.
- **The repair exclusion stretched to cover a treatment plan,** because the customer called first.
- **A cancellation window hard-coded** to three days, with no holidays, no senior or disaster windows, and Saturdays skipped.
- **A win-back campaign in an AI voice** sent to customers who only consented to appointment reminders.
- **A cancellation told to a technician** that never reaches the office, so the next visit happens and the card is charged.
- **An in-home recording** with no record that the customer was told.

## Auditing

Consumer-law disputes are won on records: a customer says she cancelled on day two, an investigator asks for every sale a rep made last summer with its notices, a card issuer asks why the customer was charged after cancelling. The field-specific records to keep:

- **The sale's facts and the rule decision:** where it was signed, who initiated, any emergency waiver document, the cooling-off rule applied with its version, the computed deadline with its inputs, the notices delivered and the oral-disclosure confirmation.
- **Every cancellation request** with its channel (including `technician` and `ai_agent`), receipt time, any postmark and the person or agent who received it, plus any refund and when it was paid.
- **Recording announcements and AI greetings** for in-home and phone recordings, with time, location and the greeting version.
- **List imports** with source and license, and every privacy request with what was deleted and what was kept under which exception.

Consent and contact decisions are kept by the notifications system ([Notifications & Consent](/docs/architecture/notifications#the-message-log)). The record structure, typed actors and tamper evidence are in [Audit Trails](/docs/architecture/audit-trails), and field record types and retention periods are in [Audit Trails & Records](/books/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Sale facts recorded at signing,** not a cooling-off flag, with counsel's rule deciding and any handwritten emergency waiver stored as its own document.
- **Exclusions read narrowly:** the personal-property repair exclusion never applied by default to work on the house or grounds.
- **Cancellation deadlines computed and stored at signing,** with the rule version and inputs.
- **A deliberate choice about charging inside the window,** with refunds as tracked tasks if the business charges at signing.
- **Cancellation accepted from every field channel,** including the technician app, wired to unassign visits and hold charges.
- **A renewal shape chosen per plan,** automatic renewal with consent and reminders, or renewal as a new sale.
- **In-home recording behind a confirmed announcement,** note transfer held to the fifth business day, and funding and the install held through any Regulation Z rescission period.
- **Access secrets, photos and purchased lists handled as personal data,** with view logging, retention and source per row.

## References

**Specifications**

- [16 CFR 429.0: Definitions](https://www.law.cornell.edu/cfr/text/16/429.0), door-to-door sales, the $25 and $130 thresholds, business days, and the exclusions for buyer-initiated repair of personal property, emergencies, real property and credit rescission
- [16 CFR 429.1: The Rule](https://www.law.cornell.edu/cfr/text/16/429.1), the receipt, cancellation statement, duplicate notice, oral disclosure, 10-business-day refund and fifth-business-day transfer bar
- [Cal. Civ. Code 1689.6](https://california.public.law/codes/civil_code_section_1689.6), California home solicitation cancellation: three business days, five for seniors, and seven after signing for repair or restoration of disaster-damaged residential premises
- [12 CFR 1026.23](https://www.law.cornell.edu/cfr/text/12/1026.23), the right of rescission for liens on a principal dwelling and the delay of disbursement, services and materials until it expires
- [15 U.S.C. 8403: ROSCA](https://www.law.cornell.edu/uscode/text/15/8403), negative-option charges in transactions effected on the internet
- [47 CFR 64.1200](https://www.law.cornell.edu/cfr/text/47/64.1200), prior express written consent for artificial or prerecorded voice calls that advertise or telemarket
- [Cal. Bus. & Prof. Code 17602](https://california.public.law/codes/business_and_professions_code_section_17602), California's automatic renewal requirements as amended by AB 2863

**Reference**

- [FTC: Cooling-off Period for Sales Made at Home or Other Locations](https://www.ftc.gov/legal-library/browse/rules/cooling-period-sales-made-home-or-other-locations), the rule's purpose and scope for door-to-door sellers
- [California Privacy Protection Agency: CPI adjustments](https://cppa.ca.gov/regulations/cpi_adjustment.html), the $26,625,000 revenue threshold effective January 1, 2025
- [California Attorney General: CCPA](https://oag.ca.gov/privacy/ccpa), consumer rights, the revenue and "buy, sell, or share" tests, and deletion exceptions
- [California Privacy Protection Agency: California Consumer Privacy Act of 2018](https://cppa.ca.gov/regulations/pdf/cppa_act.pdf), Civil Code 1798.140(d)(1)(C), deriving 50 percent or more of annual revenue "from selling or sharing consumers' personal information"
- [California Privacy Protection Agency: Data broker registry](https://cppa.ca.gov/data_broker_registry/), annual registration, DROP from January 1, 2026 and deletion processing from August 1, 2026

**In practice**

- [FieldRoutes: Online Service Cancellation](https://knowledgebase.fieldroutes.com/docs/online-service-cancellation.md), portal cancellation requests that become staff tasks
- [FieldRoutes: Opting in or out of SMS notifications](https://knowledgebase.fieldroutes.com/docs/opting-in-or-out-of-sms-notifications.md), keyword opt-in and opt-out and their logging
- [FieldRoutes: Electronic Consent Agreements](https://knowledgebase.fieldroutes.com/docs/electronic-consent-agreements.md), consent to electronic signatures captured before other documents
- [FieldRoutes: Renewal subscriptions](https://knowledgebase.fieldroutes.com/docs/renewal-subscriptions.md), renewal dates that advance on full payment
- [ServiceTitan: Configure your Voice Agent settings](https://help.servicetitan.com/docs/configure-your-voice-agent-settings-in-servicetitan), AI booking, escalation and the account's disclosure responsibility
- [ServiceTitan: Record in the Field Pro app](https://help.servicetitan.com/docs/record-in-the-field-pro-app), automatic in-home recording and two-party consent states
- [ServiceTitan: Basic memberships workflows](https://help.servicetitan.com/docs/basic-memberships-workflows), expiring memberships and renewal estimates
- [Jobber: Receptionist](https://help.getjobber.com/hc/en-us/articles/25315927533847), AI answering with recordings and transcripts, and guidance on disclosure and recording laws
- [Housecall Pro: CSR AI overview](https://help.housecallpro.com/en/articles/9740104-csr-ai-overview), an AI receptionist that identifies itself as AI on every call
- [Housecall Pro: Service plans FAQs](https://help.housecallpro.com/en/articles/5485025-service-plans-faqs), plans that charge the card on file year after year
- [Pocomos: When will a contract auto-renew?](https://help.pocomos.com/en/articles/2496254-when-will-a-contract-auto-renew), renewal and new jobs created once the last job completes
- [Aspire: Understanding contract renewal settings](https://guide.youraspire.com/docs/understanding-contract-renewal-settings), renewal as a new opportunity with refreshed pricing
