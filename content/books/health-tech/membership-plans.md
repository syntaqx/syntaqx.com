+++
title = "In-Office Membership Plans & Cash Pay"
nav_title = "Membership Plans & Cash Pay"
description = "Dental membership plans, direct primary care, concierge medicine and vet wellness plans: discount plan and insurance law, HSAs, benefits tracking and billing."
category = "Health Tech Industry"
order = 1937
part = "Practice Management and Patient Engagement"
tags = ["health-tech", "membership-plans", "direct-primary-care", "wellness-plans", "subscriptions", "data-model"]
+++

An in-office membership plan is a practice selling its own care by subscription. A dental office charges uninsured patients a monthly or annual fee that covers two cleanings, exams and routine X-rays and takes a percentage off everything else. A direct primary care (DPC) physician charges a flat monthly fee for unlimited primary care and bills no insurer at all. A concierge practice charges an annual access fee and keeps billing insurance for the visits. A vet clinic sells a wellness plan: a year of vaccines, exams and preventive care for a monthly payment. Each turns patients without insurance (or with insurance they don't want to use) into predictable recurring revenue, and each sits close to a line the law draws: a promise to pay for care that hasn't happened yet looks like insurance, and insurance needs a license.

The billing itself is ordinary subscription billing, and the mechanics (plans, periods, renewals, dunning, cancellation, automatic renewal law) are the Commerce volume's [Subscription Commerce](/books/commerce/subscription-commerce) and [Auto-Renewal & Cancellation Law](/books/commerce/auto-renewal-law), on the playbook's [Subscriptions & Recurring Billing](/docs/payments/subscriptions). This chapter covers what's different about selling care: what each kind of plan is, the insurance and discount plan law that decides how it may be sold, Medicare's rules for concierge fees, HSAs and the 2026 DPC change, tracking benefits against the PMS's procedures, and the billing details that differ. It extends `patients`, `guarantors`, `procedures` and `payments` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from each vendor's own pages:

| Platform | What it is | Who sets the plan | Who collects | Published price | Notable |
| --- | --- | --- | --- | --- | --- |
| **Clerri** (kleer.com now redirects to it) | Dental membership platform for independents and DSOs | The practice: "Your practice can build and offer its own membership plans" | Auto-billed through Stripe; members "pay dental providers directly for services rendered" | Not published | Connects to 13 PMSs; shows eligible patients in the schedule; claims through DentalXChange; Clerri LLC administers plans as a "discount medical plan operator," except in California; "25,000+ Dentists" and "200+ Groups" |
| **BoomCloud** | Membership software for dental practices | The practice: tiers, pricing, fee schedules, covered services | Card and ACH recurring billing, retries, renewals and receipts | $197 or $397 a month flat; per-member and processing fees built into member dues | Chairside or online enrollment, "unlimited membership offerings" |
| **Banfield Optimum Wellness Plans** | A vet hospital chain's own wellness plans | Banfield | "12-month monthly payment plan with AutoPay, which automatically renews your pet's plan each year" | Per plan | Billing dates on the 5th, 12th, 19th or 26th; marketed as "Totally not pet insurance" |
| **DPC practices** | Independent primary care on a membership fee | The practice | The practice, usually on a general subscription biller | Per practice | 3,259 DPC practices across all 50 states and DC on the DPC Frontier mapper, read October 29, 2026 |

The pattern: the platforms are thin. The plan is the practice's, priced by the practice, and the platform's value is enrollment at the chair, billing, and tracking which covered services a member has used, which only works if it can read the PMS's procedures. Clerri's disclosures show the other half of the job: the platform carries the regulatory posture (not insurance, administered as a discount plan, a different administrator in California) so each practice doesn't have to.

## Four Kinds of Plan

| | Dental membership | Direct primary care | Concierge | Vet wellness |
| --- | --- | --- | --- | --- |
| **The fee buys** | Listed preventive services plus a discount on the rest | All primary care in scope, no per-visit bill | Access (longer visits, same-day, a phone number) | A package of preventive services over a year |
| **Insurance billed?** | No, for covered services | No | Yes, for covered visits | Not applicable; pet insurance is separate |
| **Typical term** | Monthly or annual | Monthly | Annual | 12 months, monthly payments |
| **The law it lives under** | Discount plan and in-office plan statutes; state insurance codes | State DPC statutes; the 2026 HSA rules | Medicare assignment and opt-out rules; state law | Pet insurance law's wellness program carve-outs |
| **What the system tracks** | Benefits used per member per term; the discount applied | Enrollment and scope; what's outside it | Fee paid; nothing about covered visits | Services used against the package; early cancellation balance |

The ADA's description of the dental model is the shortest version of all four: "the patient pays the doctor or dental office a fixed amount of money on a monthly or annual basis," and receives care for it from that office, with no third party in between.

## Is It Insurance?

A plan that pays for unpredictable care in exchange for a premium is insurance, and selling insurance takes a license the practice doesn't have. The membership models survive by staying on the right side of three distinctions:

- **The practice provides the care; it doesn't pay for it.** A membership covers services the same practice performs; it never reimburses another provider. A dental plan that paid for an oral surgeon down the street would be paying claims.
- **The fee buys predictable care, not protection against the unexpected.** Two cleanings a year are certain; a crown after a fall is not. The NAIC's Pet Insurance Model Act draws the line explicitly for animals: a wellness program is "a subscription or reimbursement-based program that is separate from an insurance policy that provides goods and services to promote the general health, safety, or wellbeing of the pet," and if a program covers fortuitous events, "it is transacting in the business of insurance."
- **Discounts are discounts.** A percentage off non-covered services is a price, not a benefit paid. Many states regulate **discount medical plan organizations** (businesses that sell access to discounts from a network of providers), and a platform that markets one practice's plan to the public, or several practices' plans together, may become one; Clerri administers its practices' plans as a discount medical plan operator.

Some states have written the distinction into statute. Arizona's says "A direct primary care agreement for medical or dental services does not constitute the transaction of insurance business," and Illinois has an In-Office Membership Care Agreement Act whose text was not readable for this chapter. <!-- source-gap: illinois-815-ilcs-628 | missing | Illinois 815 ILCS 628, in-office membership care agreements are not insurance, and neither party may bill an insurer for services under the agreement | closes with: the statute page on ilga.gov opened and quoted | checked: 2026-10-29 --> The ADA's in-office plan toolkit includes a list of regulations by state, which a platform should treat as a starting point for its own rules table, not as the rules. <!-- source-gap: ada-in-office-plan-state-list | missing | The ADA's state-by-state list of regulations on in-office dental plans (Appendix A of its toolkit) | closes with: the appendix PDF opened and its states summarized | checked: 2026-10-29 -->

The engineering consequence: the plan builder enforces the safe shape. Covered services are listed procedure codes performed by this organization, the discount applies only to this organization's fees, nothing reimburses a third party, and the disclosures the state requires ("not insurance," the administrator's name) are attached to the plan version and shown at enrollment. A practice that wants a plan outside that shape needs a lawyer, not a setting.

## Who May Join

Membership plans exist for patients without coverage, and the rules about who may enroll follow from that:

- **Insured patients and billing.** A dental membership's covered services can't also be billed to the patient's insurer: the patient has paid for them. Illinois's act, as summarized, bars billing an insurer for services under the agreement, and a payer contract may bar the practice from charging a covered patient for services the plan covers. The safe default is that an insured patient isn't offered a membership for their covered services, and the enrollment flow checks `coverages` first.
- **Medicare and Medicaid patients.** A practice enrolled in Medicare can't sell a Medicare patient a membership that charges for Medicare-covered services (the next section). Medicaid programs generally bar charging beneficiaries beyond their cost share. Vet plans never meet this and dental plans rarely do, but a medical practice's DPC or concierge plan meets it on every Medicare patient.
- **Families and households.** Plans are sold per person with household pricing; the payer is the guarantor, and each member is a `patients` row with their own benefits.

## Concierge Fees and Medicare

A concierge practice that keeps billing Medicare charges its patients an annual fee for things Medicare doesn't cover: extra access, longer visits, a wellness program. The OIG warned in 2004 that the line is the content of the fee: "Medicare participating providers can charge Medicare beneficiaries extra for items and services that are not covered by Medicare," but "when participating providers request any other payment for covered services from Medicare patients they are liable for substantial penalties and exclusion." Its example was a physician charging "an annual fee of $600" under a contract whose listed services included some Medicare already covered.

For the system:

- **The fee's contents are a list of non-covered items,** each named, versioned with the plan and shown to the patient, so the practice can show what the fee bought.
- **Covered visits bill normally,** through the practice's claims, with no discount or waiver tied to membership (a routine waiver of cost sharing raises its own fraud and abuse questions, covered in [Coding, Documentation & Compliance](/books/health-tech/coding-and-documentation#anti-kickback-and-stark-for-software)).
- **A DPC practice that wants Medicare patients** generally has to opt out of Medicare and use private contracts, which is a provider enrollment decision with its own rules; the membership platform records the practice's Medicare status as a plan-level fact and refuses to enroll Medicare beneficiaries into a plan whose practice hasn't decided.

## Direct Primary Care, HSAs and the 2026 Change

Until 2026, a DPC membership could cost a patient their HSA: the IRS treated DPC as a health plan, which made the patient ineligible to contribute. The 2025 tax law (Public Law 119-21, July 4, 2025, section 71308) changed that for months beginning after December 31, 2025, and IRS Notice 2026-5 explains it:

- **A direct primary care service arrangement** provides "medical care ... consisting solely of primary care services provided by primary care practitioners ... if the sole compensation for such care is a fixed periodic fee." Primary care practitioners are physicians in family, internal, geriatric or pediatric medicine, nurse practitioners, clinical nurse specialists and physician assistants.
- **Excluded services:** "procedures that require the use of general anesthesia," "prescription drugs other than vaccines," and "laboratory services not typically administered in an ambulatory primary care setting."
- **The cap:** the arrangement doesn't qualify if "the aggregate fees for all DPCSAs for the individual for a month exceed $150 (or $300 for any such arrangement that covers more than one individual)," indexed for inflation after 2026. A longer billing period is measured by its monthly equivalent: for 2026, "$1,800 for a year; $900 for six months; or $450 for three months."
- **Billing anything separately breaks it.** An arrangement that bills separately for items and services, through insurance or otherwise, isn't a DPC service arrangement.
- **Over the cap:** fees above it are still reimbursable medical expenses, but disqualify the patient "from eligibility for making HSA contributions while the individual is enrolled."
- **Fees are payable from the HSA:** the fee isn't treated as insurance, so the patient can pay it with HSA money.

The platform turns the notice into checks: the plan records whether it's meant to qualify; if so, the fee per member per month is validated against the year's cap (household plans against the family cap), the scope excludes the listed services, nothing in the plan bills per service, and the enrollment screen tells the patient whether the plan is designed to qualify. Whether a patient's own HSA situation qualifies is theirs and their tax adviser's to decide; the platform states the plan's design, not the patient's tax outcome.

Dental and vet memberships aren't DPC arrangements. A dental membership fee paid from an HSA or FSA is a question of whether a prepayment for future care is a medical expense when paid, which the IRS hasn't answered for this shape; the practice's receipts should itemize the services as they're used, so the patient can substantiate them ([HSA and FSA Cards](/books/health-tech/patient-payments#hsa-and-fsa-cards)).

## Vet Wellness Plans

A vet clinic's wellness plan is the same promise for an animal: a year of preventive care (exams, vaccines, parasite testing, sometimes dental cleanings) for a monthly payment. Banfield's is the best-known example of the structure: a 12-month plan paid monthly with autopay, which "automatically renews your pet's plan each year," with the first payment due at enrollment.

The law around it comes from pet insurance. The NAIC's Pet Insurance Model Act (adopted 2022) bars an insurer or producer from marketing "a wellness program as pet insurance," requires a disclosure "in 12-point boldface type" that "wellness programs are not insurance" when they're sold alongside it, and treats "wellness" benefits inside an insurance policy as insurance. States adopt the model one at a time; the NAIC's state chart dated Spring 2023 lists Maine, and later adopters weren't verified for this chapter. <!-- source-gap: naic-633-adopters | status | States that have enacted the NAIC Pet Insurance Model Act (#633) after Spring 2023 | closes with: a current NAIC state page for model 633 or each state's statute | checked: 2026-10-29 -->

Two vet-specific mechanics:

- **Early cancellation settles the services used.** A 12-month package priced below the services' retail total is a discount for the commitment; when a client cancels in month four after the vaccines and dental cleaning were done, the plan's terms decide whether they owe the difference between what they paid and what they used. The system computes it from benefits used at retail versus payments made, and the terms are shown at enrollment.
- **The plan belongs to the animal, the bill to the client.** The membership is on the patient (the animal), the payments on the guarantor (the owner); an animal that dies or is rehomed ends the plan, and the cancellation rules for a deceased pet are a kindness the terms should state. [Veterinary Practice](/books/health-tech/veterinary-practice#the-client-and-the-animal) covers the owner-animal model.

## Tracking Benefits Against the PMS

A membership is only as accurate as its knowledge of what the member has used. The plan says "two cleanings and one set of bitewings per term"; the PMS records the procedures performed. The platform has to read completed procedures from the PMS, match them to the plan's covered codes, and decrement the member's benefits, and when the next cleaning is the third, tell the front desk before checkout that it's charged at the member discount, not free.

- **Benefits are counted per term, by code, from completed procedures.** A scheduled or treatment-planned procedure doesn't use a benefit; a completed one does, on its date of service.
- **The fee schedule is a membership fee schedule.** Dental PMSs price procedures by fee schedule ([The Practice Business](/books/health-tech/practice-business#how-to-build-it) models them as `fee_schedules`, with a `membership` kind), and BoomCloud's plan builder sets "fee schedules" per tier; the membership's discount is a fee schedule assigned to members in the PMS, so the ledger is right without a manual adjustment at every visit.
- **The ledger shows the value.** The member's statement or portal shows what the covered services would have cost at the practice's standard fees, which is how members are kept at renewal.
- **Terms are anniversaries or calendars.** A plan that resets benefits on the enrollment anniversary needs per-member terms; one that resets on January 1 needs a proration rule for mid-year joiners. Both are plan settings.

## Billing That's Different

The renewal job, dunning and cancellation are the Commerce volume's ([Renewal Billing and Stored Credentials](/books/commerce/subscription-commerce#renewal-billing-and-stored-credentials), [Dunning and Account Updaters](/books/commerce/subscription-commerce#dunning-and-account-updaters)), and the state automatic renewal laws apply to memberships sold to consumers like any other subscription ([State Laws](/books/commerce/auto-renewal-law#state-laws)). What differs:

- **Annual is common, and it's a large charge.** An annual dental membership renewing on a card is the kind of charge that draws disputes; several states require a reminder before renewals of a year or more ([Notices and Reminders](/books/commerce/auto-renewal-law#notices-and-reminders)).
- **A lapsed membership changes prices at the chair.** When dunning fails, the member's fee schedule reverts on a stated date, and an appointment after it is priced at standard fees. The front desk needs to see the lapse before the patient is seated, not at checkout.
- **Prepaid annual fees are deferred revenue.** A year paid upfront is earned over the year, or as benefits are used, depending on the practice's accounting policy ([Prepaid Plans and Their Accounting](/books/commerce/subscription-commerce#prepaid-plans-and-their-accounting)).
- **Refunds follow services used.** A cancellation refund is computed from what was paid and what was used at the membership's values, under the terms the member accepted.
- **No surcharges or convenience fees on recurring payments.** The card rules forbid a convenience fee on recurring payments ([Convenience and Service Fees](/books/payments/surcharging-and-fees#convenience-and-service-fees)), which rules out the fee many practices try to add to membership dues.

## How to Build It

The membership is a subscription on a patient paid by a guarantor, with a benefit ledger read from the PMS's procedures:

```sql
CREATE TABLE membership_plans (           -- an offer, versioned like a price
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  code               TEXT NOT NULL,
  version            INT NOT NULL,
  kind               TEXT NOT NULL CHECK (kind IN ('dental_membership', 'dpc', 'concierge',
                       'vet_wellness', 'other')),
  audience           TEXT NOT NULL CHECK (audience IN ('adult', 'child', 'household', 'animal')),
  fee                BIGINT NOT NULL,
  billing_period     TEXT NOT NULL CHECK (billing_period IN ('month', 'quarter', 'year')),
  term_basis         TEXT NOT NULL CHECK (term_basis IN ('anniversary', 'calendar')),
  min_term_months    SMALLINT,          -- vet wellness: a 12-month commitment
  fee_schedule_id    UUID REFERENCES fee_schedules (id),  -- kind 'membership': members' prices
  hsa_dpc_designed   BOOLEAN NOT NULL DEFAULT FALSE,  -- meant to meet the IRS DPC rules
  medicare_status    TEXT CHECK (medicare_status IN ('not_enrolled', 'opted_out',
                       'participating', 'non_participating')),  -- the practice's, at this version
  early_cancel_rule  TEXT NOT NULL CHECK (early_cancel_rule IN ('none', 'settle_used_at_retail',
                       'refund_unused_pro_rata')),
  disclosure_text_id UUID NOT NULL REFERENCES disclosure_texts (id),  -- "not insurance", state text
  administrator      TEXT,              -- a discount plan operator, where one is used
  terms_document_id  UUID NOT NULL REFERENCES documents (id),
  valid_during       TSTZRANGE NOT NULL,
  UNIQUE (organization_id, code, version)
);

CREATE TABLE membership_plan_benefits (   -- what the fee covers, by procedure code
  organization_id UUID NOT NULL REFERENCES organizations (id),
  plan_id         UUID NOT NULL REFERENCES membership_plans (id),
  code_system     TEXT NOT NULL CHECK (code_system IN ('cdt', 'cpt', 'hcpcs', 'local')),
  code            TEXT NOT NULL,
  per_term        SMALLINT,             -- null: unlimited within scope
  retail_value    BIGINT NOT NULL,      -- standard fee, for value statements and settlements
  PRIMARY KEY (plan_id, code_system, code)
);

CREATE TABLE memberships (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  plan_id         UUID NOT NULL REFERENCES membership_plans (id),
  patient_id      UUID NOT NULL REFERENCES patients (id),     -- the member; for vet, the animal
  guarantor_id    UUID NOT NULL REFERENCES guarantors (id),   -- who pays
  household_id    UUID,                 -- members billed together
  location_id     UUID REFERENCES locations (id),             -- where it's honored, if limited
  coverage_checked_at TIMESTAMPTZ NOT NULL,  -- insured patients weren't enrolled for covered care
  payment_method_id UUID REFERENCES payment_methods (id),  -- Payments in the Practice
  term_start      DATE NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'lapsed', 'cancelled',
                    'ended')),
  lapsed_on       DATE,                 -- fee schedule reverts from this date
  cancel_reason   TEXT CHECK (cancel_reason IN ('member', 'non_payment', 'patient_deceased',
                    'moved', 'practice')),
  enrolled_via    TEXT NOT NULL CHECK (enrolled_via IN ('chairside', 'online', 'phone'))
);

CREATE TABLE membership_terms (           -- one row per benefit term
  organization_id UUID NOT NULL REFERENCES organizations (id),
  membership_id   UUID NOT NULL REFERENCES memberships (id),
  term_no         INT NOT NULL,
  starts_on       DATE NOT NULL,
  ends_on         DATE NOT NULL,
  fees_paid       BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (membership_id, term_no)
);

CREATE TABLE membership_benefit_uses (    -- a completed procedure counted against a term
  organization_id UUID NOT NULL REFERENCES organizations (id),
  membership_id   UUID NOT NULL,
  term_no         INT NOT NULL,
  procedure_id    UUID NOT NULL UNIQUE REFERENCES procedures (id),  -- counted once
  code            TEXT NOT NULL,
  covered         BOOLEAN NOT NULL,     -- false: over the limit, charged at the member discount
  retail_value    BIGINT NOT NULL,
  FOREIGN KEY (membership_id, term_no) REFERENCES membership_terms (membership_id, term_no)
);

ALTER TABLE payments
  ADD COLUMN membership_id UUID REFERENCES memberships (id);  -- dues

ALTER TABLE charges
  ADD COLUMN membership_id UUID REFERENCES memberships (id);  -- priced or covered under it
```

The benefit check before checkout:

```sql
-- Remaining covered uses for a member's term, per code:
SELECT b.code, b.per_term,
       b.per_term - COUNT(u.procedure_id) FILTER (WHERE u.covered) AS remaining
FROM memberships m
JOIN membership_terms t ON t.membership_id = m.id AND CURRENT_DATE BETWEEN t.starts_on AND t.ends_on
JOIN membership_plan_benefits b ON b.plan_id = m.plan_id
LEFT JOIN membership_benefit_uses u ON u.membership_id = m.id AND u.term_no = t.term_no
  AND u.code = b.code
WHERE m.patient_id = $1 AND m.status = 'active'
GROUP BY b.code, b.per_term;
```

Design notes:

- **Uses come from completed procedures.** The PMS sync ([Integrating with Practice Management Systems](/books/health-tech/pms-integration)) emits completed procedures; a job inserts `membership_benefit_uses`, and the unique `procedure_id` makes a re-sync idempotent. A procedure deleted or changed in the PMS reverses its use.
- **Plans are versioned; members stay on theirs.** A price increase is a new version and a renewal-time migration with notice, as Commerce's [Price Changes on a Running Subscription](/books/commerce/subscription-commerce#price-changes-on-a-running-subscription) describes.
- **The DPC check is a validation, not a flag.** When `hsa_dpc_designed` is true, saving the plan checks the monthly-equivalent fee against the year's cap for its audience, that no benefit is in the excluded categories, and that the plan has no per-service billing.
- **Events:** `membership.enrolled`, `membership.renewed`, `membership.payment_failed`, `membership.lapsed`, `membership.benefit_used` and `membership.cancelled` go to the PMS (fee schedule assignment), messaging and reporting.

## Auditing

- **What the member agreed to.** Plan version, terms and disclosures as shown, the enrollment channel, and the automatic renewal consent.
- **Why they were eligible.** The coverage check at enrollment, and for medical practices the Medicare status the plan carried.
- **Every benefit used.** The procedure, its date and code, covered or discounted, so a dispute about "my second cleaning was supposed to be free" is answerable.
- **Every fee and refund.** Charges per term, failed attempts, lapses, and each cancellation settlement with its computation.
- **Plan design checks.** For DPC-designed plans, the cap and scope validation results per version.

## What This Means for the System You Build

- **Enforce the non-insurance shape in the plan builder:** covered services are this organization's own listed codes, discounts apply to its own fees, nothing reimburses a third party, and state disclosures ride on the plan version.
- **Check coverage before enrollment** and keep insured patients' covered services out of memberships; record Medicare status for medical practices.
- **Count benefits from completed PMS procedures,** idempotently, per term, and show remaining benefits before checkout.
- **Price members through a PMS fee schedule,** so the ledger is right without manual adjustments, and revert it on a stated lapse date.
- **Validate DPC plans against the IRS rules** (cap, scope, no per-service billing) and state the plan's design, never the patient's tax outcome.
- **Settle early cancellations from services used** under the terms shown, and handle a vet patient's death kindly and by rule.
- **Bill like any subscription,** under Commerce's renewal and dunning rules and the automatic renewal laws, with no convenience fees on recurring charges.

## References

**Law and guidance**

- [IRS: Notice 2026-5 (PDF)](https://www.irs.gov/pub/irs-drop/n-26-05.pdf), direct primary care service arrangements under section 223(c)(1)(E): definition, practitioners, excluded services, the $150 and $300 caps, longer billing periods, separate billing, over-cap fees and HSA payment
- [IRS: One, Big, Beautiful Bill provisions](https://www.irs.gov/newsroom/one-big-beautiful-bill-provisions), DPC enrollees eligible to contribute to HSAs and pay DPC fees from them from January 1, 2026
- [IRS: Treasury, IRS provide guidance on new tax benefits for HSA participants (IR-2025-119)](https://www.irs.gov/newsroom/treasury-irs-provide-guidance-on-new-tax-benefits-for-health-savings-account-participants-under-the-one-big-beautiful-bill), the December 9, 2025 guidance release
- [HHS OIG: OIG Alerts Physicians About Added Charges for Covered Services (2004, PDF)](https://oig.hhs.gov/fraud/docs/alertsandbulletins/2004/FA033104AssignViolationI.pdf), extra charges for non-covered items allowed, for covered services prohibited, and the $600 annual fee example
- [Arizona Revised Statutes § 44-1799.96](https://www.azleg.gov/ars/44/01799-96.htm), direct primary care agreements for medical or dental services are not insurance
- [NAIC: Pet Insurance Model Act (#633, PDF)](https://content.naic.org/sites/default/files/model-law-633.pdf), the wellness program definition, the fortuitous-events test, marketing restrictions and the boldface disclosure
- [NAIC: Pet Insurance Model Act state page (Spring 2023, PDF)](https://content.naic.org/sites/default/files/model-law-state-page-633.pdf), state adoption as of Spring 2023

**Industry**

- [ADA: Is an in-office dental plan right for your practice?](https://www.ada.org/resources/practice/dental-insurance/is-an-in-office-dental-plan-right-for-your-practice), the in-office plan model and the toolkit's state regulation list
- [DPC Frontier: Mapper](https://mapper.dpcfrontier.com/), the live count of DPC practices across all 50 states and DC

**Vendors**

- [Clerri](https://clerri.com/), practice-built plans, Stripe billing, PMS integrations, the not-insurance disclosures and discount medical plan operator role, scale
- [BoomCloud](https://www.boomcloudapps.com/), recurring billing, plan tiers and fee schedules, flat pricing
- [Banfield: Optimum Wellness Plan FAQs](https://www.banfield.com/products/optimum-wellness-plan/FAQs), 12-month plans with autopay and annual renewal, payment dates, not pet insurance
