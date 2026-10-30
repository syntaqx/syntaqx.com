+++
title = "Senior Living"
description = "Independent, assisted and memory care: assessment-driven care fees, census, payer sources, state licensing, Medicaid waivers and the HIPAA boundary."
category = "Property Tech Industry"
order = 1727
part = "Other Property Types"
tags = ["property-tech", "senior-living", "assisted-living", "hipaa", "medicaid", "care-levels"]
+++

Senior living sells an apartment plus help. An independent living community rents apartments with meals, housekeeping, transportation and activities to older adults who need little or no personal care. An assisted living community adds help with the activities of daily living (bathing, dressing, medication, getting to meals), delivered by staff around the clock under a state license. Memory care is assisted living for residents with dementia, in a secured building or neighborhood with more staff and its own rules. Skilled nursing, the nursing home, is the boundary: a federally certified health care provider that bills Medicare and Medicaid as a clinical facility, and a different industry's software. A continuing care retirement community, now often called a life plan community, puts several of these on one campus under one contract, usually with an entrance fee.

Most of the core data model in [The Property Business](/books/property-tech/property-business#the-core-data-model) still fits: there are properties, units, leases (usually called residency agreements), households, charges and a resident ledger. Four things change. **Revenue is per resident, not per unit:** two people in one apartment each have their own care needs, care fee and payer, so the core's per-lease money has to resolve to a person. **The price moves with the resident's health:** a care assessment produces a level, the level is a charge, and a fall or a hospital stay can change the bill next month. **Several payers can share one resident's month:** private pay, a Medicaid waiver that pays for services but never for room and board, long-term care insurance, and veterans' benefits that arrive as the resident's income. **Clinical records sit beside the rent roll:** medication administration, care plans and incident reports are health information, and whether HIPAA applies depends on how the operator bills, not on what the data says. And the buyer is usually not the resident: a daughter or son tours, negotiates, signs as a representative, and wants a portal.

## How the Platforms Do It

The market splits between the enterprise property suites with a senior edition, senior-specific platforms that grew from the clinical side, and point solutions for sales and family communication. As of October 2026:

| Vendor | What its public pages describe |
| --- | --- |
| **Aline** | Formed when Enquire, Glennis Solutions and Sherpa CRM merged (announced October 2022) and renamed the combined company; sells a senior living CRM, a clinical record that runs "from initial assessment through daily care plans," eMAR, and leasing, billing, payments and accounting, with move-in triggering billing |
| **ALIS (Medtelligent)** | Clinical charting and eMAR (med pass, PRN tracking, digital physician orders, eFax refills), pharmacy integrations, state forms and compliance alerts, billing and A/R, CRM, move-in packets and occupancy monitoring |
| **Carefeed** | A family-facing layer: a community-branded family portal for communication, surveys and grievance documentation, family payments with AutoPay, working alongside the EHR (a listed PointClickCare integration) |
| **MatrixCare (senior living)** | An integrated EHR with eMAR and point-of-care charting; "automatically create resident service plans from assessments"; billing, census and marketing alongside; a senior living CRM |
| **PointClickCare (senior living)** | A senior living EHR platform "uniting operations and wellness coordination," integrated pharmacy orders, integrated medication management, billing with "resident-friendly statements," move-in e-signature, eligibility verification, lab and imaging results |
| **RealPage Senior Living** | A care assessment tool and "automatic calculation of care fee charges based on the acuity score of the assessment," with accepted care fees updating the resident ledger; an interface to the operator's existing eMAR; census (move-in, move-out, resident location); incident documentation with trend reporting on falls and altercations; caregiver task monitoring; staff management; lead tracking and a senior living contact center; independent living, assisted living and memory care |
| **Yardi** | A public API catalog lists a Yardi Senior Living EHR interface for exchange with pharmacy networks and laboratory systems, including NCPDP SCRIPT 10.6; Yardi's own product pages were not opened for this chapter |

Three patterns recur. **The assessment drives the bill.** RealPage computes care fees from the assessment's acuity score; MatrixCare builds the service plan from the assessment; Aline starts the clinical record at the initial assessment. The assessment is the one record that is both clinical and financial, which is why the boundary design later in this chapter centers on it. **Medication is an interface, not a feature.** RealPage lets operators keep the eMAR they know; PointClickCare and ALIS sell pharmacy integration as a headline; the Yardi interface entry names NCPDP SCRIPT. Pharmacies serving senior living fill from their own systems, and the community's record has to agree with them. **Sales is its own product.** Every vendor above sells or integrates a senior CRM, because the funnel runs weeks or months through adult children, hospital discharge planners and referral agencies before a deposit. Software Landscape lists senior among the enterprise suites' editions ([Specialists by Segment](/books/property-tech/software-landscape#specialists-by-segment)); in practice the clinical-first vendors are as central as the property suites.

## The Continuum

The settings differ in what is sold, who licenses it, and who pays:

| Setting | What's sold | Licensed by | Typical payers |
| --- | --- | --- | --- |
| **Active adult** | Age-restricted apartments or homes, amenities, no services | Ordinary landlord-tenant law | Private pay |
| **Independent living** | Apartment plus meals, housekeeping, activities, transportation | Usually landlord-tenant law; some states license if services are bundled | Private pay |
| **Assisted living** | Apartment plus personal care, medication help, 24-hour staff | The state, under its own definition | Private pay, Medicaid waivers or state plan for services, LTC insurance, VA pension income |
| **Memory care** | Assisted living in a secured setting for dementia | The state, often as an endorsement or special license | As assisted living |
| **Skilled nursing** | Clinical nursing and rehabilitation | The state, plus federal certification | Medicare for short post-hospital stays, Medicaid, private pay |
| **Life plan community (CCRC)** | Residence across levels under one long-term contract | State continuing care statutes, plus each level's license | Entrance fee plus monthly fee, then as each level |

GAO's 2026 report states that "there is no single definition of assisted living facilities": each state licenses and defines the setting itself, which is why assisted living has no national schema the way skilled nursing does. GAO also cites about 1 million Americans living in assisted living facilities in 2022, with facilities averaging 41 beds, 82% for-profit and 57% chain-affiliated.

Skilled nursing is the boundary for property software. Medicare Part A covers skilled nursing facility care on a short-term basis after a qualifying inpatient hospital stay of at least three days in a row, up to 100 days in each benefit period, while GAO notes Medicare "does not typically cover assisted living services or room and board costs." A skilled nursing facility is a covered health care provider billing claims on clinical data; its software is an EHR with a billing engine, not a property system with a care module. A life plan community that runs a nursing wing alongside its apartments therefore runs two kinds of system, and the property platform's job is to own the residency, the apartments and the money, and to integrate with the nursing side rather than become it.

**Life plan communities** add a contract shape the rest of the volume doesn't have. New York's Department of Financial Services describes three types: a **Type A** (all-inclusive, life care) contract provides housing, services and specified health care with a monthly fee that doesn't rise as care needs increase, apart from normal operating and inflation adjustments; a **Type B** (modified) contract covers a specified number of days of nursing care before per diem rates apply; and a **Type C** (fee-for-service) contract covers housing and amenities with all health care paid as used. The same page describes entrance fees that "may be substantial" plus a monthly fee. Refundable entrance fees are regulated where a state has a continuing care statute. Florida's section 651.055 is a worked example of how much arithmetic that is: a 7-day rescission period with funds held in escrow; a refund before occupancy of the whole fee less a processing fee of up to 5%; after occupancy, a pro rata refund in which the provider may retain up to 2% per month of occupancy plus the processing fee; and payment timing tied either to the vacated unit or to the receipt of the next entrance fee for a like unit, with different deadlines for contracts entered on or after January 1, 2016. Those are rules per jurisdiction and per contract version, never code ([Rules as Data](/docs/architecture/rules-as-data#effective-dates-and-versions)).

## Levels of Care and Assessment-Driven Fees

The monthly bill in assisted living has two parts: a base rate for the apartment, meals and basic services, and a care fee for the help the resident needs. How the care fee is set is the operator's pricing model, and a property may run more than one (one for assisted living, another for memory care). A Place for Mom's consumer guide names the three families: **all-inclusive** ("the monthly fee includes room and board, care services, and all other services and amenities"), **tiered or levels of care** ("different levels of care at different price points"), and **à la carte** (a base fee, with services added or removed "as residents' needs change"). In practice the tiered model has a common variant, **points-based**: the assessment scores each need (medication administration, transfers, incontinence care, behaviors, two-person assists), the points total falls in a band, and the band is a level with a price. RealPage's "acuity score of the assessment" driving the care fee is this model.

The life of a care fee:

1. **Pre-admission assessment.** Before move-in, a nurse or qualified assessor evaluates the prospect. Washington requires a preadmission assessment covering medical history, medications, diagnoses, behaviors needing special care, the level of personal care needed, and preferences for activities, food and routine (WAC 388-78A-2060). The outcome decides whether the community can serve the person at all (the license sets an upper bound) and quotes the starting level.
2. **Service plan.** The assessment becomes a plan the resident (or representative) agrees to. Washington calls it the negotiated service agreement and lists its contents: how the facility will monitor and address identified risks, help with activities of daily living, nursing and health support services if provided, timing and frequency of services, a communication plan, whether the resident may leave unsupervised, and a ban on asking the resident to sign away rights or liability (WAC 388-78A-2140). MatrixCare sells generating the plan from the assessment.
3. **Care fee.** The level or the selected services become recurring charges on the residency agreement for that resident, effective on a date. RealPage's flow is explicit: the assessment computes the fee, staff accept it, and acceptance updates the ledger.
4. **Reassessment.** States set a floor and change of condition sets the rest. Washington requires a full assessment at least annually, at least semi-annually for residents with dementia in a certified memory care setting, and a focused assessment on a change of condition, when the service agreement no longer meets the resident's needs, or after an injury requiring a practitioner's intervention (WAC 388-78A-2100). Florida's resident contract must say residents are assessed on admission and every 3 years thereafter, or after a significant change (Florida Administrative Code 59A-36.018(k)). Two states, two intervals, two triggers: a reassessment due date is a computed deadline from a rule row, stored with the rule that set it ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
5. **Fee change notice.** A higher level is a price increase, and contracts and states regulate notice. Florida requires the contract to provide at least 30 days' written notice of a rate increase, but says a new service or accommodation the resident wasn't previously charged for does not require the 30-day notice, and any extra charge must be itemized in writing in advance with a dated, signed addendum (section 429.24(2); rule 59A-36.018). Whether a level change is a "rate increase" or a "new service" under a given state's rule is a legal question, and the system has to record which treatment was applied, by whom, and the notice sent.

![The life of a care fee as a pipeline. Assess, clinical: pre-admission, can we serve? Service plan, clinical: agreed with the resident. Accept, accented and headed the seam. Care fee, commercial: effective-dated, with notice if higher. Reassess, clinical: a yearly floor, or a change of condition. A line from reassess returns to accept, labeled new computed level. The arrows into and out of accept are accented.](/diagrams/pt-sl-care-fee.svg "The assessment is a clinical record and the fee is a commercial one; the staff acceptance between them is where people decide what is billed. Every reassessment comes back through that seam rather than changing the fee directly.")

Two design consequences follow. The level is **effective-dated per resident**, never a column on the lease: a resident who moves up a level on the 17th is billed for the old level through the 16th, and the proration is the core charge engine's job ([Proration](/books/property-tech/charges-and-resident-ledgers#proration)). And the **assessment and the price are separate records**: the assessment is clinical, the accepted level is commercial. RealPage's "accept" step is the seam, and it is where an operator's people decide whether the computed level is the one they will bill (communities may hold a level for a family conversation, or decline to raise a fee for a short illness). RealPage even markets performing assessments "only as needed" to avoid cost creep, which is a reminder that the assessment schedule is also a cost and a revenue lever, and an auditor will ask whether fees moved only when the record supports it.

## Census

Census is senior living's word for occupancy, and it counts people, not units; the general occupancy measures are defined in [Operating Metrics](/books/property-tech/operating-metrics#occupancy-leased-and-exposure), and what follows is what senior living adds. For example, a 100-apartment community with 92 apartments occupied, ten of them companion suites shared by two unrelated residents and a dozen by couples, has 114 residents in house. The counts operators and owners ask for:

- **Occupancy by care setting:** physical occupancy by unit, computed for independent, assisted and memory care separately, because each has its own price, staffing and demand.
- **Resident census:** residents in house, by care level and by payer, against the license's capacity. A state license caps residents, not apartments, so a second person can be a licensing question as well as a pricing one.
- **Second persons.** A spouse or companion in the same apartment pays a second-person fee for meals and services and has their own care level if they need care. In the core model they are both `lease_members`; the difference is that each is a resident with their own care record, so the lease member row isn't enough on its own (see How to Build It).
- **Respite stays.** A short stay, often while a family caregiver travels or after a hospital discharge, under its own agreement and usually a daily rate. Washington requires a negotiated service agreement for respite residents too, developed with the individual "to maintain or improve the individual's health and functional status during their stay" (WAC 388-78A-2208). A respite stay is a lease with an end date, counted in census while it lasts.
- **Hospital leave and bed holds.** A resident admitted to a hospital or a skilled nursing facility for rehab is still a resident, their apartment is not available, and the rent usually keeps running. Florida requires a written bed hold policy where a facility agrees to reserve a bed for a resident admitted to a nursing home, health care facility or psychiatric facility, lets the facility keep charging the agreed rate until the resident or responsible party gives written notice the resident won't return, and requires a refund of unused prepaid time, prorated on the daily rate, within 45 days after transfer, discharge or death (59A-36.018(h); section 429.24(3)). Whether the care fee stops, drops or continues during an absence is the operator's policy, separate from the base rate, which is one more reason care fees and base rent must be separate schedules.
- **Move-ins and move-outs by reason:** a move-out to a higher level of care, to a hospital, or by death is the norm, not an exception, and the reason matters for refunds, for the deposit and for the sales team's forecast.

Census is a query over residency agreements, lease members and absences, exactly as occupancy is a query over leases in the core ([The Life of a Unit](/books/property-tech/property-business#the-life-of-a-unit)). What senior living adds is a nightly snapshot as reported, because census drives staffing, food ordering, owner reports and, for operators with Medicaid residents, the days billed.

## Payer Sources

One resident's month can involve four payers, each with different rules about what it pays for and to whom:

- **Private pay.** The resident or family pays the full bill from savings, income or the sale of a home. GAO reports that most assisted living residents pay out of pocket.
- **Medicaid.** GAO found 43 states and the District of Columbia covered assisted living services as of March 2025, 29 of the 44 through home and community-based services waivers and the rest through other Medicaid authorities. A **1915(c) waiver** lets a state offer services such as personal care, homemaker, case management and respite to people who meet an institutional level of care, in their home or community; CMS lists about 257 active waivers. The federal rule is precise about what it won't fund: no federal financial participation for "the cost of room and board," except as part of respite care in a state-approved facility that isn't a private residence, or a share of rent and food attributable to a live-in caregiver (42 CFR 441.310(a)(2)). So a Medicaid resident's bill splits in two: the state or a managed care plan pays the service rate, and the resident pays room and board, often from Supplemental Security Income or other income (GAO lists SSI, HUD vouchers and VA benefits; Oregon uses state-only funds for some). Where a state sets the room and board amount a waiver resident may be charged, that is a rule row for the property's jurisdiction.
- **Long-term care insurance.** The federal LongTermCare.gov guide describes policies that "reimburse policyholders a daily amount (up to a pre-selected limit)" for help with activities of daily living, though benefits can be paid to a recipient or to a care provider. A reimbursement policy is not a payer the community bills: the resident pays, and the community produces itemized statements and care documentation for the claim. An assigned-benefit policy is a payer the community bills directly.
- **VA Aid and Attendance.** VA describes Aid and Attendance as "monthly payments added to the amount of a monthly VA pension" for qualified veterans and survivors who need help with daily activities, among other criteria. It's paid to the veteran, so it's the resident's income, not a receivable; the community records it as a payer source because families and sales teams plan around it, and because a resident whose application is pending is a collections risk.

The HCBS rule reaches into the residency agreement itself. In a provider-owned or controlled residential setting, the person must have a specific place "owned, rented, or occupied under a legally enforceable agreement" with at least the protections tenants have under landlord-tenant law, or a written residency agreement with comparable eviction protections where that law doesn't apply; and privacy in their unit, lockable doors, and a choice of roommates (42 CFR 441.301(c)(4)(vi)). States implement it in their own licensing: Washington requires a written residency agreement for residents with Medicaid as a payer, signed on admission, committing the facility to the state's transfer and discharge requirements and telling residents of their right to legal counsel (WAC 388-78A-2651). The data-model consequence: a Medicaid resident's agreement is a lease in the full sense, with the notice and eviction machinery of [The Lease](/books/property-tech/the-lease#notices) and [Delinquency, Collections & Eviction](/books/property-tech/delinquency-and-eviction#eviction-filings), not a care contract outside it.

Private pay versus subsidized also changes the sales funnel. A community that accepts Medicaid may limit how many Medicaid residents it takes, and needs to know, before move-in, whether a private-pay resident is likely to spend down to Medicaid eligibility; that conversion is a payer change on an existing agreement, effective on the date eligibility begins, and it often arrives retroactively, which the ledger handles with reversing charges rather than edits ([Append-Only Records](/docs/payments/payment-states#append-only-records)).

## Clinical Records and the HIPAA Boundary

Assisted living produces clinical records every shift: medication administration records, care notes, vital signs, incident reports, physician orders, service plans. An **EHR** holds the chart; an **eMAR** (electronic medication administration record) records each dose given, refused or held, against the pharmacy's orders; a **pharmacy interface** receives orders and sends refill requests, over a standard such as NCPDP SCRIPT, which the Yardi interface entry names. None of this belongs in the property system's tables. Whether HIPAA governs it depends on who the operator is.

**When a senior living operator is a covered entity.** HIPAA covers health plans, clearinghouses, and "a health care provider who transmits any health information in electronic form in connection with a transaction covered by this subchapter," where a health care provider includes anyone "who furnishes, bills, or is paid for health care in the normal course of business" (45 CFR 160.103). CMS puts it plainly: "Providers who submit HIPAA transactions, like claims, electronically are covered," listing nursing homes among its examples. So:

- A **private-pay assisted living community** that sends no standard electronic transactions is generally not a covered entity, even though it holds health information. Its records are still protected by state law: Washington requires facilities to keep resident records confidential under state statutes, release them only on the written consent of the resident or representative unless law provides broader access, and lets a management company use them "solely for the purpose of providing care and services to residents" (WAC 388-78A-2400).
- A community that **bills Medicaid electronically** for waiver services, or provides **skilled services it bills as claims**, is a health care provider conducting covered transactions and is a covered entity.
- A **life plan community with a skilled nursing wing** is likely a covered entity for that wing. HIPAA's hybrid entity rule lets it designate its health care components, which must not disclose protected health information to the rest of the organization where the rules would bar disclosure between separate entities, and requires that designation to be documented (45 CFR 164.105).
- A **software vendor** whose customer is a covered entity, and whose system creates, receives, maintains or transmits that customer's PHI, is a business associate and needs a BAA with the customer and with its own subcontractors ([The Business Associate Agreement](/docs/compliance/hipaa#the-business-associate-agreement)).

Whether a given operator is covered is counsel's call, and one platform will host both kinds of customer. My rule: **design every tenant as if it were covered**, because the same code serves both, an operator can become covered by enrolling one Medicaid resident, and state confidentiality law asks for most of the same controls anyway ([Who It Applies To](/docs/compliance/hipaa#who-it-applies-to)). The industry depth on covered entities, business associates and everyone else is [Covered, Associate, or Neither](/books/health-tech/hipaa-in-practice#covered-associate-or-neither) in the Health Tech volume, which maps the parties in [Who's Who](/books/health-tech/health-tech-business#who-s-who).

The boundary that design produces:

- **Clinical data lives in a separate system or a segregated store.** Most operators run a separate EHR and eMAR (the vendors above), and the property platform integrates with it. A platform that builds its own clinical module puts it in its own schema or database, with its own encryption keys, access roles and audit log, under BAAs that cover every service it touches ([What It Means for a System](/docs/compliance/hipaa#what-it-means-for-a-system)).
- **The property side keeps identifiers and outcomes, not content.** It knows a resident exists, their apartment, their accepted care level, their payer, and the dates of an absence. It doesn't know diagnoses, medications or why they went to the hospital. The care level is the minimum necessary for billing; the assessment's answers stay clinical.
- **Integration is census and orders, not copies.** Move-in, transfer, leave and move-out events flow from the property platform to the EHR and pharmacy (the ADT feed of health care integration); accepted care levels or assessment outcomes flow back. Each feed is an inventory entry with a BAA and a field list. Hospital discharges into a community are the clinical side of the same move-in ([Post-Acute Handoffs](/books/health-tech/referrals-and-care-coordination#post-acute-handoffs)).
- **Everything that touches residents assumes PHI.** Support tickets, error trackers, notification providers and AI tools see resident names next to care events; either they are under a BAA or the boundary scrubs them ([AI Agents in the Product](/docs/architecture/ai-agents#recordings-and-transcripts-are-personal-data)). An email subject that says "Mom's medication change" is a disclosure.

## State Licensing

Assisted living is licensed by each state under its own definition, and the license shapes the software in five places:

- **What the community may do and for whom.** Washington's rules have a section on the resident characteristics a facility may serve (WAC 388-78A-2050); Florida's contract must say that a resident who needs services beyond what the facility is licensed to provide will be told in writing and must arrange a transfer (59A-36.018). The license type and its endorsements (Florida's limited nursing and extended congregate care, for example) belong on the property, effective-dated, with a licensed capacity.
- **The resident agreement.** Florida requires a contract executed at or before admission, listing services, accommodations and rates, 30 days' notice of rate increases, a refund policy, any religious affiliation, and kept on file for at least 5 years after it expires; advance deposits must be held in a separate in-state account and the resident notified in writing within 30 days of receiving one (section 429.24). The contract's required clauses are template data per state, and the deposit account is a trust account question for [Trust Accounting & the General Ledger](/books/property-tech/trust-accounting#security-deposit-accounts).
- **Disclosure.** Washington requires facilities to disclose the scope of care and services on the department's approved disclosure forms, and requires at least 30 days' written notice of a decrease in services, or 90 days if the decrease will discharge residents (WAC 388-78A-2710). A disclosure is a versioned document attached to the property, with a record of who received which version.
- **Assessments and service plans,** with the timing above (WAC 388-78A-2100, 2140; 59A-36.018(k)).
- **Records, staffing and training.** Washington's chapter alone has sections on resident records and their retention, residents' review of records, the resident register, staff, background checks, training and administrator qualifications (chapter 388-78A WAC). Staff credentials and background checks are workforce data that HR or scheduling systems own; the property platform needs the resident register and roster those rules require, and a retention schedule per record type ([Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type)).

My default: a state is a rule set, not a code branch. Reassessment intervals, rate-increase notice periods, service-decrease notice periods, bed hold terms, refund deadlines, required contract clauses and record retention are rows keyed by the property's licensing state and license type, effective-dated, each with its citation, as [Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#rules-as-effective-dated-data) describes for the volume as a whole.

## Families, Representatives and the Portal

Most residents have someone acting for them, and the authority each person has differs:

- A **financial power of attorney** can sign the agreement and pay; a **health care power of attorney** or proxy can make health decisions; a **guardian or conservator** is appointed by a court; a **responsible party** has agreed to pay or to be contacted; a **family contact** has no authority at all, only a relationship. Florida's bed hold rule assumes a "responsible party" who can give notice for a resident who can't; HCBS planning lets an "authorized representative" help lead the person-centered plan (42 CFR 441.301(c)(1)); Washington's rules let a resident's representative consent to record release (WAC 388-78A-2400).
- **Authority is scoped and dated.** A daughter may see the bill but not the chart; a son with health care authority may see care updates but not pay; a guardianship ends or changes by court order. Each grant has a document behind it, a verification step, and an effective range.
- **The portal shows what the grant allows.** A family portal (Carefeed's branded portal for communication, surveys, grievances and payments is the pattern) offers statements, payments, messages, event calendars and, where authorized and the clinical system permits, care updates. Billing access derives from financial authority; care updates derive from health authority and run through the clinical system's own access controls, not the property platform's.

A representative is not a guarantor. A person who signs as the resident's agent under a power of attorney isn't personally liable the way a guarantor on `lease_members` is, and the record must show in which capacity each signature was given ([Electronic Signatures & Records](/docs/compliance/electronic-signatures#what-the-evidence-holds)). Notification consent is per person: the resident, the payer and the health care agent each opt in to their own messages ([Notifications & Consent](/docs/architecture/notifications#the-consent-ledger)).

## Move-In as a Sales Funnel

A senior living sale is a family decision made under stress, often after a fall or a hospital stay, and it runs through more people than an apartment lease: the prospect, one or more adult children, and referral sources (hospital discharge planners, placement agencies, physicians). Senior CRMs model that: Aline describes qualifying families "at the moment of interest" and connecting every step "from first inquiry to scheduled tour," with move-in triggering billing; ALIS lists CRM, prospecting, move-in packets and occupancy monitoring; MatrixCare lists a senior living CRM; RealPage pairs lead tracking with a dedicated senior living contact center.

The funnel's stages: inquiry, discovery call, tour, assessment, deposit (to hold an apartment), move-in date, paperwork (agreement, disclosure, physician statement, medication list), move-in. Its differences from multifamily leasing: the decision-maker and the resident are different people, so a prospect record holds several contacts with roles; the **assessment is a gate** in the funnel, because the price and the admission decision depend on it; referral source attribution matters more than listing sources, and where an agency is paid a placement fee on move-in, that fee is a vendor payable; and the timeline is set by health, so "lost" prospects return months later after another event. [Leads, CRM, Tours & the Leasing Center](/books/property-tech/leads-crm-and-tours#the-guest-card) owns the prospect model; senior living adds contact roles, referral organizations, assessment scheduling, and the hold deposit.

## How to Build It

The deltas against [The Core Data Model](/books/property-tech/property-business#the-core-data-model). A senior property is `property_type = 'multifamily'` with `properties.segment = 'senior'` (the column [Student Housing](/books/property-tech/student-housing#how-to-build-it) adds). Nothing clinical appears here: the clinical record lives in an EHR or a segregated store, and this schema holds identifiers, accepted outcomes and money.

```sql
CREATE TABLE care_licenses (             -- a state license the property operates under
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  property_id       UUID NOT NULL REFERENCES properties (id),
  subdivision       TEXT NOT NULL,       -- ISO 3166-2 of the licensing state; rules resolve from here
  license_type      TEXT NOT NULL,       -- the state's own category, never a national one
  endorsements      TEXT[] NOT NULL DEFAULT '{}',  -- e.g. memory care, limited nursing
  license_number    TEXT NOT NULL,
  licensed_capacity INT NOT NULL CHECK (licensed_capacity > 0),  -- residents, not units
  valid_during      DATERANGE NOT NULL,
  EXCLUDE USING GIST (property_id WITH =, license_type WITH =, valid_during WITH &&)
);

ALTER TABLE units                        -- which setting an apartment is licensed and sold as
  ADD COLUMN care_setting      TEXT CHECK (care_setting IN ('independent', 'assisted',
                                 'memory_care', 'skilled_nursing')),
  ADD COLUMN care_license_id   UUID REFERENCES care_licenses (id),
  ADD COLUMN resident_capacity INT CHECK (resident_capacity > 0);  -- companion suites hold 2

ALTER TABLE leases                       -- the residency agreement
  ADD COLUMN residency_type TEXT NOT NULL DEFAULT 'standard'
    CHECK (residency_type IN ('standard', 'respite', 'trial'));

CREATE TABLE care_pricing_schemes (      -- how a property turns assessed need into a price
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  property_id  UUID NOT NULL REFERENCES properties (id),
  care_setting TEXT NOT NULL,
  model        TEXT NOT NULL CHECK (model IN ('all_inclusive', 'tiered', 'points', 'a_la_carte')),
  valid_during DATERANGE NOT NULL,
  EXCLUDE USING GIST (property_id WITH =, care_setting WITH =, valid_during WITH &&)
);

CREATE TABLE care_rates (                -- a priced level, or a priced service for a la carte
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  scheme_id      UUID NOT NULL REFERENCES care_pricing_schemes (id),
  kind           TEXT NOT NULL CHECK (kind IN ('level', 'service')),
  code           TEXT NOT NULL,          -- 'L3', 'MED-ADMIN'
  name           TEXT NOT NULL,
  min_points     INT,                    -- points model: the band this level covers
  max_points     INT,
  charge_code_id UUID NOT NULL REFERENCES charge_codes (id),
  amount         BIGINT NOT NULL,        -- minor units per frequency
  currency       CHAR(3) NOT NULL,
  frequency      TEXT NOT NULL CHECK (frequency IN ('monthly', 'daily')),
  UNIQUE (tenant_id, scheme_id, code),
  CHECK (min_points IS NULL OR max_points >= min_points)
);

CREATE TABLE care_assessments (          -- the business side of an assessment; answers stay clinical
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  property_id  UUID NOT NULL REFERENCES properties (id),
  person_id    UUID NOT NULL REFERENCES people (id),
  lease_id     UUID REFERENCES leases (id),    -- null before admission
  reason       TEXT NOT NULL CHECK (reason IN ('pre_admission', 'scheduled', 'change_of_condition',
                 'return_from_leave', 'requested')),
  instrument   TEXT NOT NULL,          -- the tool and its version, or the state's form
  clinical_ref TEXT,                   -- opaque id of the full assessment in the clinical system
  total_points INT,                    -- only what pricing needs
  completed_at TIMESTAMPTZ NOT NULL,
  next_due_on  DATE,                   -- computed from the licensing state's rule
  due_rule_evaluation_id UUID REFERENCES rule_evaluations (id)  -- what set next_due_on
);

CREATE TABLE care_level_determinations ( -- the care a resident is billed for, over time
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  lease_id         UUID NOT NULL REFERENCES leases (id),
  person_id        UUID NOT NULL REFERENCES people (id),
  care_rate_id     UUID NOT NULL REFERENCES care_rates (id),
  is_level         BOOLEAN NOT NULL,     -- copied from care_rates.kind for the constraint
  assessment_id    UUID REFERENCES care_assessments (id),  -- null: a documented manual decision
  status           TEXT NOT NULL CHECK (status IN ('proposed', 'accepted', 'declined',
                     'superseded')),
  notice_treatment TEXT CHECK (notice_treatment IN ('rate_increase', 'new_service',
                     'decrease', 'none')),
  notice_sent_on   DATE,
  decided_by       UUID REFERENCES users (id), -- the staff user who accepted or declined
  valid_during     DATERANGE NOT NULL,
  EXCLUDE USING GIST (lease_id WITH =, person_id WITH =, valid_during WITH &&)
    WHERE (is_level AND status = 'accepted'),          -- one level per resident at a time
  EXCLUDE USING GIST (lease_id WITH =, person_id WITH =, care_rate_id WITH =,
    valid_during WITH &&) WHERE (status = 'accepted')
);

CREATE TABLE payers (                    -- a Medicaid agency, managed care plan, insurer, VA
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  kind             TEXT NOT NULL CHECK (kind IN ('medicaid_state', 'medicaid_managed_care',
                     'ltc_insurer', 'va', 'state_program', 'other')),
  name             TEXT NOT NULL,
  payer_identifier TEXT                  -- the payer's ID for electronic claims, if billed that way
);

CREATE TABLE payer_coverages (           -- who pays which part of a resident's stay
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  lease_id          UUID NOT NULL REFERENCES leases (id),
  person_id         UUID NOT NULL REFERENCES people (id),   -- the resident covered
  source            TEXT NOT NULL CHECK (source IN ('private', 'medicaid_waiver',
                      'medicaid_state_plan', 'ltc_insurance', 'va_pension', 'state_supplement',
                      'other')),
  payer_id          UUID REFERENCES payers (id),            -- null for private pay
  covers            TEXT NOT NULL CHECK (covers IN ('care_services', 'room_and_board', 'all')),
  bill_to           TEXT NOT NULL CHECK (bill_to IN ('payer', 'resident')),  -- assigned or reimbursed
  authorization_ref TEXT,                -- waiver authorization, policy or claim number
  authorized_amount BIGINT,              -- per month, if the authorization caps it
  currency          CHAR(3),
  status            TEXT NOT NULL CHECK (status IN ('pending', 'active', 'denied', 'ended')),
  valid_during      DATERANGE NOT NULL,
  CHECK (source <> 'private' OR payer_id IS NULL),
  CHECK (authorized_amount IS NULL OR currency IS NOT NULL)
);

ALTER TABLE lease_charge_schedules
  ADD COLUMN responsible_person_id       UUID REFERENCES people (id),  -- per-resident fees
  ADD COLUMN care_level_determination_id UUID REFERENCES care_level_determinations (id),
  ADD COLUMN payer_coverage_id           UUID REFERENCES payer_coverages (id),  -- null: household
  DROP CONSTRAINT lease_charge_schedules_frequency_check,
  ADD CONSTRAINT lease_charge_schedules_frequency_check
    CHECK (frequency IN ('monthly', 'weekly', 'annual', 'daily'));

-- charges.responsible_person_id (Charges & Resident Ledgers) names the resident.
ALTER TABLE charges
  ADD COLUMN payer_coverage_id UUID REFERENCES payer_coverages (id);  -- whose receivable

CREATE TABLE resident_absences (         -- hospital, rehab and other leaves; still a resident
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  lease_id          UUID NOT NULL REFERENCES leases (id),
  person_id         UUID NOT NULL REFERENCES people (id),
  kind              TEXT NOT NULL CHECK (kind IN ('hospital', 'skilled_nursing', 'psychiatric',
                      'family', 'other')),
  bed_hold          BOOLEAN NOT NULL,
  no_return_notice_on DATE,              -- written notice the resident won't return
  valid_during      DATERANGE NOT NULL,  -- open upper bound while away
  EXCLUDE USING GIST (person_id WITH =, valid_during WITH &&)
);

CREATE TABLE census_snapshots (          -- the nightly count, as reported
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  property_id        UUID NOT NULL REFERENCES properties (id),
  business_date      DATE NOT NULL,
  care_setting       TEXT NOT NULL,
  units_available    INT NOT NULL,
  units_occupied     INT NOT NULL,
  residents_in_house INT NOT NULL,
  residents_on_leave INT NOT NULL,
  respite_residents  INT NOT NULL,
  licensed_capacity  INT,
  residents_by_source JSONB NOT NULL,    -- {"private": 61, "medicaid_waiver": 9, ...}
  UNIQUE (tenant_id, property_id, business_date, care_setting)
);

CREATE TABLE resident_representatives (  -- who may act for a resident, in what capacity
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  resident_id       UUID NOT NULL REFERENCES people (id),
  representative_id UUID NOT NULL REFERENCES people (id),
  authority         TEXT NOT NULL CHECK (authority IN ('financial_poa', 'health_care_poa',
                      'health_care_proxy', 'guardian', 'conservator', 'responsible_party',
                      'family_contact')),
  scopes            TEXT[] NOT NULL,     -- 'billing', 'sign', 'care_updates', 'emergency'
  document_ref      TEXT,                -- the instrument or court order on file
  verified_by       UUID REFERENCES users (id),
  verified_at       TIMESTAMPTZ,
  valid_during      DATERANGE NOT NULL,
  CHECK (resident_id <> representative_id),
  EXCLUDE USING GIST (resident_id WITH =, representative_id WITH =, authority WITH =,
    valid_during WITH &&)
);

CREATE TABLE entrance_fee_contracts (    -- a life plan community's entrance fee and refund terms
  id                       UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id                UUID NOT NULL,
  lease_id                 UUID NOT NULL UNIQUE REFERENCES leases (id),
  contract_type            TEXT NOT NULL CHECK (contract_type IN ('type_a', 'type_b', 'type_c',
                             'rental')),
  entrance_fee             BIGINT NOT NULL,
  currency                 CHAR(3) NOT NULL,
  refundable_floor_bps     INT NOT NULL CHECK (refundable_floor_bps BETWEEN 0 AND 10000),
  amortization_bps_per_month INT NOT NULL,
  processing_fee_bps       INT NOT NULL,
  covered_care_days        INT,           -- type B: nursing days before per diem rates
  rescission_ends_on       DATE NOT NULL,
  refund_rule_evaluation_id UUID NOT NULL REFERENCES rule_evaluations (id),  -- refund rule at signing
  signed_on                DATE NOT NULL
);

CREATE TABLE entrance_fee_refunds (      -- computed once, paid once
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL,
  contract_id UUID NOT NULL REFERENCES entrance_fee_contracts (id),
  reason      TEXT NOT NULL CHECK (reason IN ('rescission', 'cancelled_before_occupancy',
                'termination', 'death', 'transfer_to_higher_care')),
  amount      BIGINT NOT NULL,
  currency    CHAR(3) NOT NULL,
  due_on      DATE NOT NULL,            -- from the rule: vacated unit or next like-unit fee
  inputs      JSONB NOT NULL,           -- months of occupancy, fee, rule version: the arithmetic
  paid_on     DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clinical_system_links (     -- the only bridge to clinical systems: ids, not content
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL,
  person_id   UUID NOT NULL REFERENCES people (id),
  system      TEXT NOT NULL CHECK (system IN ('ehr', 'emar', 'pharmacy', 'family_portal')),
  external_id TEXT NOT NULL,
  linked_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, system, external_id)
);
```

Design decisions:

- **Senior living is a segment, not a property type.** Independent, assisted and memory care buildings are apartment communities with services; `care_setting` on the unit and the license on the property carry the difference. Skilled nursing appears only as a unit setting in a life plan community, with its clinical and billing systems outside.
- **Money resolves to a person.** Per-resident schedules and charges carry `responsible_person_id`, so a couple sharing an apartment has one residency agreement and one household, two care levels and possibly two payers. Base rent and the second-person fee stay at the lease level.
- **The care level is a determination, separate from the assessment.** `care_assessments` holds only what pricing and scheduling need (reason, instrument, points, due date) and an opaque pointer to the clinical record; `care_level_determinations` holds what the operator accepted, when, with which notice treatment. One accepted level per resident at a time is a constraint, and the care fee schedule points at the determination that created it.
- **Payers are coverages on a resident, effective-dated.** A charge carries the coverage whose receivable it is, so the resident ledger, a Medicaid receivable and an insurer's statement are views over the same entries ([Double-Entry Ledger](/docs/payments/payment-states#double-entry-ledger)). Validation refuses a Medicaid waiver or state plan coverage that `covers` room and board unless the residency is a respite stay in a qualifying facility (42 CFR 441.310(a)(2)); that check lives in the rule layer because its exceptions are the regulation's, not the schema's.
- **Reimbursed versus billed.** `bill_to = 'resident'` covers reimbursement policies and VA pension income: the coverage is tracked for planning and statements, but the resident's receivable is the one charged. Converting private pay to Medicaid is ending one coverage and starting another on the eligibility date, with reversing charges for the retroactive months.
- **Census is derived, then snapshotted.** Lease members, absences and residency types answer "who is here tonight"; the snapshot keeps what was reported to owners, staff schedulers and payers on that date, because those numbers are not allowed to change when a late move-out is keyed in.
- **Representatives are authority, not membership.** `lease_members` says who is party to the agreement and who is liable; `resident_representatives` says who may act for a resident and for what. Portal access derives from scopes; signatures record the capacity in which each was given.
- **Entrance fees keep their arithmetic.** The contract stores the rule version in force at signing; each refund stores its inputs and the due date its rule produced. The accounting for entrance fees (a refundable portion as a liability, the rest recognized over time) is the finance team's policy, applied to these facts ([The Product Keeps Facts, Finance Picks Policy](/docs/payments/accounting#the-product-keeps-facts-finance-picks-policy)).
- **The clinical bridge is a crosswalk.** `clinical_system_links` maps residents to EHR, eMAR, pharmacy and portal identifiers ([Crosswalks of External IDs](/docs/architecture/record-linkage#crosswalks-of-external-ids)). Events flow out (`resident.moved_in`, `resident.leave_started`, `resident.leave_ended`, `resident.transferred`, `resident.moved_out`) and accepted outcomes flow back; content does not.
- **State rules are rows.** Reassessment intervals, rate and service-change notice periods, bed hold terms, deposit handling, refund deadlines, required agreement clauses and record retention are keyed by licensing state and license type, effective-dated, and the row that decided is recorded on the result ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).

## Auditing

Senior living's disputes are about money tied to care, and its inspections are about whether the record matches what was promised:

- **Assessment to fee.** For every care fee change: the assessment (by pointer), the computed level, the accepted level, who accepted it, the notice treatment, the notice sent, and the effective date. Families challenge level increases; surveyors check that service plans follow assessments; an auditor checks fees didn't move without one.
- **Reassessment timeliness.** Every resident's due date, the rule that set it, and when the assessment happened. A missed annual or change-of-condition assessment is a licensing finding.
- **Agreements, disclosures and notices.** The agreement as signed with the state's required clauses, the disclosure version given, rate-increase and service-decrease notices with their dates, and the capacity in which each signer acted ([Audit Trails](/docs/architecture/audit-trails)).
- **Payer history.** Every coverage with its dates, authorization numbers and status, and the charges posted against it, so a Medicaid audit or an insurance claim can be rebuilt from entries.
- **Census as reported.** The nightly snapshots, absences with bed hold decisions and no-return notices, and refunds computed under the bed hold and refund rules.
- **Access to resident records.** Who viewed which resident's records, in both stores, including reads ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)); representative grants with their verification.
- **Entrance fee refunds.** Inputs, rule version, due date and payment for every refund.

Record retention follows the strictest applicable rule: Florida keeps contracts at least 5 years after expiration, Washington's chapter has its own record retention section, and a covered entity adds HIPAA's documentation requirements ([Data Retention & Deletion](/docs/architecture/data-retention)).

## What This Means for the System You Build

- **Treat senior living as a segment of multifamily** with care settings on units and licenses on properties, not as a separate product line with its own core.
- **Resolve money to the resident,** with per-person care fees and payers under a shared residency agreement, so couples and second persons work.
- **Keep the assessment and the price apart:** the assessment is clinical and stays there; the accepted care level is commercial, effective-dated, and drives the charge schedule.
- **Model payers as effective-dated coverages** that split a resident's month between room and board and services, and never let a Medicaid waiver pay room and board outside its exceptions.
- **Derive census from agreements and absences,** snapshot it nightly, and treat hospital leave and bed holds as states of a resident, not move-outs.
- **Design every tenant as a HIPAA covered entity,** keep clinical data in a separate system or segregated store under BAAs, and pass identifiers and outcomes across the boundary, never content.
- **Load state licensing as rules:** reassessment intervals, notice periods, bed holds, refunds, required clauses and retention per state and license type, with citations.
- **Separate authority from membership:** representatives with scoped, verified, dated authority; guarantors and leaseholders on the lease; portal access derived from the scopes.
- **Keep entrance fee arithmetic reproducible:** the rule version at signing and the inputs to every refund.
- **Integrate, don't absorb, the clinical stack:** EHR, eMAR and pharmacy are interfaces fed by census events, and senior CRM is a funnel with families, referral sources and an assessment gate.

## References

**Regulations and statutes**

- [45 CFR 160.103: Definitions (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/160.103), covered entity and health care provider definitions
- [45 CFR 164.105: Organizational requirements (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/164.105), hybrid entities, health care components, no disclosure to other components, documented designation
- [42 CFR 441.310: Limits on federal financial participation (Cornell LII)](https://www.law.cornell.edu/cfr/text/42/441.310), no FFP for room and board in HCBS waivers, the respite and live-in caregiver exceptions, the definition of board
- [42 CFR 441.301: Contents of request for a waiver (Cornell LII)](https://www.law.cornell.edu/cfr/text/42/441.301), person-centered planning with an authorized representative, provider-owned settings with a legally enforceable agreement and landlord-tenant protections, privacy, lockable doors, roommate choice
- [Washington chapter 388-78A WAC: Assisted living facility licensing rules](https://app.leg.wa.gov/wac/default.aspx?cite=388-78A), the chapter's sections on resident characteristics, assessments, service agreements, respite, disclosure, records, staff, training and the Medicaid residency agreement
- [WAC 388-78A-2060: Preadmission assessment](https://app.leg.wa.gov/wac/default.aspx?cite=388-78A-2060), required preadmission assessment and its contents
- [WAC 388-78A-2100: Ongoing assessments](https://app.leg.wa.gov/wac/default.aspx?cite=388-78A-2100), annual full assessments, semi-annual for dementia residents in memory care, change-of-condition triggers
- [WAC 388-78A-2140: Negotiated service agreement contents](https://app.leg.wa.gov/wac/default.aspx?cite=388-78A-2140), required contents and the ban on waiver of rights
- [WAC 388-78A-2208: Respite, negotiated service agreement](https://app.leg.wa.gov/wac/default.aspx?cite=388-78A-2208), service agreements for respite stays
- [WAC 388-78A-2400: Protection of resident records](https://app.leg.wa.gov/wac/default.aspx?cite=388-78A-2400), confidentiality under state statutes, written consent for release, limits on management company use
- [WAC 388-78A-2651: Written residency agreement, residents with Medicaid as a payor](https://app.leg.wa.gov/wac/default.aspx?cite=388-78A-2651), signed on admission, transfer and discharge requirements, right to counsel
- [WAC 388-78A-2710: Disclosure of services](https://app.leg.wa.gov/wac/default.aspx?cite=388-78A-2710), approved disclosure forms, 30 and 90 days' notice of service decreases
- [Florida Statutes section 429.24: Contracts (2024)](https://www.flsenate.gov/Laws/Statutes/2024/429.24), contract contents, 30 days' rate increase notice and the new-service exception, deposits in a separate in-state account, 45-day prorated refunds, bed reservations, 5-year retention
- [Florida Administrative Code 59A-36.018: Resident contracts (Cornell LII)](https://www.law.cornell.edu/regulations/florida/Fla-Admin-Code-Ann-R-59A-36-018), required contract provisions, assessment on admission and every 3 years or after a significant change, bed hold policy, itemized additional charges, services beyond the license
- [Florida Statutes section 651.055: Continuing care contracts (2024)](https://www.flsenate.gov/Laws/Statutes/2024/651.055), 7-day rescission and escrow, pre-occupancy and post-occupancy refunds, 2% per month retention, 5% processing fee, like-unit refund timing, the 2016 contract cutover

**Agencies**

- [CMS: Are you a covered entity?](https://www.cms.gov/priorities/key-initiatives/burden-reduction/administrative-simplification/hipaa/covered-entities), providers that submit HIPAA transactions like claims electronically are covered, nursing homes among the examples
- [Medicaid.gov: Home and community-based services 1915(c)](https://www.medicaid.gov/medicaid/home-community-based-services/home-community-based-services-authorities/home-community-based-services-1915c), what waivers are, institutional level of care, listed services, about 257 active waivers
- [GAO-26-107884: Assisted Living Facilities, Information on Federal Spending and Medicaid Coverage](https://files.gao.gov/reports/GAO-26-107884/index.html), no single definition, 44 states covering assisted living services as of March 2025 and 29 through waivers, no room and board, other federal programs, about 1 million residents and facility characteristics in 2022
- [GAO WatchBlog: Long-term and assisted care, what Medicare and Medicaid do and do not cover](https://www.gao.gov/blog/long-term-and-assisted-care-heres-what-medicare-and-medicaid-do-and-do-not-cover), Medicare doesn't typically cover assisted living, 43 states and DC, Medicaid can't cover room and board (July 7, 2026)
- [Medicare.gov: Skilled nursing facility care](https://www.medicare.gov/coverage/skilled-nursing-facility-care), 3-day qualifying stay, short-term coverage, 100 days per benefit period
- [VA: Aid and Attendance and Housebound benefits](https://www.va.gov/pension/aid-attendance-housebound/), monthly payments added to a VA pension, eligibility criteria
- [ACL LongTermCare.gov: What is long-term care insurance](https://acl.gov/ltc/costs-and-who-pays/what-is-long-term-care-insurance), daily reimbursement up to a pre-selected limit, benefits paid to a recipient or a provider
- [New York DFS: About continuing care retirement communities](https://www.dfs.ny.gov/consumers/health_insurance/long_term_care_insurance/about_ccrc), Type A, B and C contracts, entrance fees and monthly fees

**In practice**

- [RealPage: Senior Living](https://www.realpage.com/senior/), assessments, acuity-based care fee calculation updating the ledger, eMAR interface, census, incidents, staff management, senior contact center
- [PointClickCare: Senior Living](https://www.pointclickcare.com/senior-living/), senior living EHR, integrated pharmacy orders and medication management, billing, move-in signing, eligibility verification
- [MatrixCare: Senior Living](https://www.matrixcare.com/senior-living/), EHR with eMAR and point of care, service plans from assessments, billing, census, CRM
- [ALIS: Senior living software](https://www.go-alis.com/), clinical and eMAR, pharmacy integrations, state forms and compliance alerts, billing, CRM and move-in packets
- [Aline: Senior living operations platform](https://alineops.com/), CRM, clinical record from initial assessment, eMAR, leasing and billing, move-in triggering billing
- [Aline: Enquire, Glennis Solutions, and Sherpa CRM rebrand as Aline](https://alineops.com/press-releases/enquire-glennis-solutions-and-sherpa-crm-rebrand-as-aline/), the merger announced October 2022 and the combined name
- [API Evangelist: Yardi API catalog](https://github.com/api-evangelist/yardi), the Yardi Senior Living EHR interface entry, pharmacy and lab exchange, NCPDP SCRIPT 10.6
- [Carefeed](https://www.carefeed.com/), branded family portal, family payments, PointClickCare integration
- [A Place for Mom via KEYT: How much does assisted living cost? A state-by-state guide](https://keyt.com/stacker-longevity/2026/08/03/how-much-does-assisted-living-cost-a-state-by-state-guide/), all-inclusive, tiered and à la carte pricing models (August 3, 2026)
