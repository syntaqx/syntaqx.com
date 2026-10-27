+++
title = "The Lease"
description = "The lease as a record: templates, addenda and disclosures, e-signature, guarantors, concessions, renewals, notices, roommates, early termination, lease states."
category = "Property Tech Industry"
order = 1712
part = "Leasing"
tags = ["property-tech", "leases", "e-signature", "renewals", "notices", "landlord-tenant-law"]
+++

The lease is the record every other part of a property platform reads. Pricing writes an offer into it, screening decides who may sign it, the ledger bills from its schedules, maintenance checks it before entering, the deposit rules of its state govern the move-out, and an eviction court asks for it as signed. It's also a document assembled from parts: a base form, a stack of addenda that depends on the building's age, location and amenities, disclosures the law requires in a given jurisdiction, sometimes a translation, and a separate guaranty for someone who doesn't live there. After it's signed it keeps changing in governed ways: roommates come and go, notices are served with deadlines that law computes, and at the end of the term it's renewed as a new lease, rolls into a month-to-month tenancy, or ends.

This chapter covers that life: the packet and how it's assembled, signing it, guarantors, concessions, roommate changes, renewals, notices, early termination, and the state machine over the lease states that [The Property Business](/books/property-tech/property-business#the-core-data-model) defined. Pricing the renewal offer is [Revenue Management & Pricing](/books/property-tech/revenue-management)'s job; deciding who may sign is [Applications & Screening](/books/property-tech/applications-and-screening)'s; moving in and out is [Move-In & Move-Out](/books/property-tech/move-in-and-move-out). Legal status here is as of October 2026, and the rules are US law unless stated.

## How the Platforms Do It

Three models supply the lease document itself, and most operators use more than one:

- **Association forms through a forms service.** State apartment associations publish lease forms for members. Blue Moon Software powers the official forms behind the Texas Apartment Association's and National Apartment Association's Click & Lease products and GAA Forms Online, with built-in e-signature to "send, receive, track and electronically sign lease packages" without transaction fees, an open API, and integrations that let the operator keep its own property management system as the main interface. The California Apartment Association offers members more than 180 rental forms with instruction sheets: a lease agreement, a month-to-month rental agreement, addenda such as a pet addendum, and notices such as the 24-hour notice to enter. Association forms carry the association's legal review, which is why operators prefer them to their own drafting.
- **Suite templates with an e-signature provider underneath.** Buildium's online leasing is "powered by Dropbox Sign," with templates "for all lease documents and addenda," more than 50 autofill fields and custom ones, and signer order, reminders and status updates. AppFolio lets staff create "customized, branded lease or renewal offers" that an applicant can e-sign on a mobile device. Entrata's SiteTablet lets prospects sign on the leasing agent's tablet "with the LeaseExecution integration." RealPage describes its Document Management product as holding "standardized forms and corporate-approved documents for your full portfolio."
- **Signable fields on the operator's own documents.** Rent Manager's Signable Documents adds "signable fields to existing letter templates or PDFs," signed through the resident portal and tracked in a register. Yardi Breeze, in a 2019 post, described uploading a file to the tenant's record for signature in the RentCafe portal.

The models connect. ResMan's Leasing Pro tier offers "online lease execution with your current legal form provider" or a Blue Moon integration, and a Pro Flex tier for properties with "custom forms and lease documents." RealPage announced its Blue Moon e-signature partnership for the official NAA and TAA leases in 2008, working "regardless of which property management software system" the operator used. The design lesson: the platform must hold a lease whose text came from somewhere else, so the record is the executed document and its evidence, not the platform's own template plus field values.

Renewals are a workflow in every suite. AppFolio supports a default renewal offer that updates "lease dates, rent amounts, and status" when the current lease expires, and bulk renewals in which residents "select from predefined offers." Rent Manager sends "updated leases to renewing tenants" through the portal. ResMan sells Bulk Renewals. RealPage's OneSite automates renewals and "move-ins, move-outs, transfers, and final account statements." Entrata's Renewals AI claims to "predict lease renewals 90 days in advance" and segment residents by intent. Incentives have moved off the lease too: RealPage's LOFT Loyalty sends "move-in gifts, thank-you incentives or renewal offers" as digital rewards, funded by the operator, with unused funds recovered automatically.

Status names differ more than the states do. Infor's eSite rent roll, for example, lists Applicant, Current, Notice (on-notice), Transfer (transfer out), Wait List, Cancelled and Previous Residents. The [lease state machine](#the-lease-state-machine) below maps those to this volume's states.

## The Lease Packet

A lease is signed as a **packet**: the base lease, the addenda that apply to this unit and household, required disclosures, any translation, and, separately, any guaranty. Every item is chosen by rules and rendered from a specific template version, and the packet as executed is the lease.

### Templates and clause libraries

Templates are [versioned entities](/docs/database/temporal-data#versioned-entities): a published version never changes, a fix is a new version, and every executed document cites the version it came from. Operators that draft their own forms usually build them from a **clause library** (late fee clause, pet clause, parking clause, utilities clause, each with jurisdiction variants), and a lease template version is then a compiled list of clause versions. When counsel changes the late fee clause for one state, the result is a new clause version, a new template version for that state, and a record of which leases were signed under each.

Association forms invert this: the association revises the form and the operator adopts the new revision. The platform records the form number and revision as the template's source and keeps the previous revision for leases already signed on it. In both cases three questions should be answerable from data: which template version a lease used, which leases are on a version known to be wrong, and which version new leases get today.

### Addenda and required disclosures

Addenda attach by rule: a pet addendum because the household has a pet, a parking addendum because a space is on the charge schedule, a lead disclosure because of the building's year, a flood disclosure because of the property's state. Those rules are data, resolved from the property's jurisdiction and attributes ([Rules as Data](/docs/architecture/rules-as-data)), and each attached addendum records the rule and version that required it.

Disclosures are where the law reaches into the packet. A sample, as of October 2026:

| Disclosure | Where | What it requires |
| --- | --- | --- |
| **Lead-based paint** | Federal (40 CFR 745 Subpart F; HUD's twin is 24 CFR 35 Subpart A) | For target housing (built before 1978, excluding housing for the elderly or people with disabilities and 0-bedroom units unless a child under 6 lives there), each lease includes the Lead Warning Statement, the lessor's disclosure of known lead-based paint or hazards (or no knowledge), a list of records given, the lessee's acknowledgment of the pamphlet, an agent statement, and dated signatures of lessor, agents and lessees. Exempt: leases of 100 days or less with no renewal possible, certified lead-free housing, and renewals where nothing new is known. Lessor and agent keep it at least 3 years from the start of the lease. |
| **Flood** | California (Gov. Code 8589.45) | For leases entered on or after July 1, 2018: a special flood hazard area disclosure if the owner has actual knowledge, the state's hazard lookup, and a recommendation to consider renter's and flood insurance, in no smaller than 8-point type. |
| **Flood** | New York (Real Property Law 231-b) | Whether the premises are in a FEMA floodplain, the 100-year or 500-year flood area, any known prior flood damage, and a prescribed notice that standard renter's insurance doesn't typically cover floods. |
| **Flood** | Texas (Property Code 92.0135) | Effective January 1, 2022: separate written notices, at or before signing, of whether the landlord is aware the dwelling is in a 100-year floodplain and whether it flooded in the last five years; a tenant who suffers substantial flood loss after a violation may terminate. |
| **Bed bugs** | California (Civil Code 1954.603) | Since July 1, 2017, before creating a new tenancy: written information on bed bugs, in at least 10-point type, including how to report a suspected infestation. |
| **Mold** | California (Health & Safety Code 26147) | Written disclosure to prospective tenants before signing when the landlord knows or has reason to believe mold exceeds permissible limits; the section takes effect only after the state health department adopts the standards it refers to. |
| **Just cause** | California (Civil Code 1946.2) | A prescribed statement of tenant protections in at least 12-point type, in the lease, an addendum, or a signed notice. The section sunsets January 1, 2030. |
| **Good Cause coverage** | New York (Good Cause Eviction Law) | Since August 18, 2024, every lease, renewal lease and legal notice from a covered landlord states whether the unit is covered and, if not, why. |
| **Early termination rights** | Texas (Property Code 92.016) | A lease without language substantially equivalent to "Tenants may have special statutory rights to terminate the lease early in certain situations" releases a tenant who terminates for family violence from delinquent rent. |

Two patterns follow. Some disclosures are **conditional on facts the platform must hold**: year built, flood zone and flood history, known lead records, known mold. Those are property attributes with sources and dates (Portfolios, Properties & Units owns them), and a missing fact should block generating the packet, not default to "no knowledge." And some are **document requirements** with type sizes, separate pages and exact text, which is the strongest argument for using association forms or counsel-maintained templates instead of letting each property edit its own.

### Translations

California requires a translation when a business negotiates a residential lease longer than one month primarily in Spanish, Chinese, Tagalog, Vietnamese or Korean: the tenant gets a translation of the contract, every term included, before signing (Civil Code 1632). A tenant who brings their own interpreter is excluded, and the remedy for a violation is rescission. The flood disclosure above is expressly subject to the same section. So the language of negotiation is a fact the leasing record carries from the guest card and application onward, the packet resolves templates by language, and a translated document is a separate rendered document linked to the one it translates, delivered before signature and kept with the lease. Association form sets often publish translations; where they don't, the translation is a template version like any other.

## Signing the Lease

The general rules for electronic signatures are in [Electronic Signatures & Records](/docs/compliance/electronic-signatures): consent to electronic records [comes first](/docs/compliance/electronic-signatures#consumer-consent-comes-first), and every signature leaves [the evidence](/docs/compliance/electronic-signatures#what-the-evidence-holds) behind. A lease adds four things.

**Every financially responsible adult signs.** Each leaseholder signs the lease; occupants, including every minor, don't. A guarantor signs the guaranty and whatever lease acknowledgments the form calls for. The lease is not signed until every required signer has signed, so the platform derives "fully signed" from the signature requests against the lease's members, never from a flag set by the first signature to come back.

**The landlord's agent countersigns, last.** The operator's staff member signs for the landlord of record after the residents and guarantors. Countersigning last means the landlord signs exactly what the household signed, and gives the operator a final check: the rent quote is still valid, the screening decision still stands, the unit is still held ([Reservations & Holds](/docs/architecture/reservations-and-holds)). The countersigner is a staff user with authority to bind that landlord entity, and the record names both.

**Signing order is a choice.** E-signature providers route by order number: recipients who share a number sign in parallel, and different numbers sign in sequence. My default is residents in parallel, then guarantors, then the countersignature, so one slow roommate delays only the end of the line. A long lag carries risk: if the quote or the hold expires before the last signature, the platform voids the packet and reissues it at the current price, rather than countersigning a stale offer.

**The executed PDF is the record.** The sealed document with the provider's certificate, stored write-once in the operator's storage with its hash ([Storage and Retrieval](/docs/compliance/electronic-signatures#storage-and-retrieval)), and a copy delivered to every signer. The lead disclosure's dated signatures of lessor, agent and lessees are part of that document. A lease signed on a leasing agent's tablet is the [seller's-device pattern](/docs/compliance/electronic-signatures#embedded-or-remote-whose-device), so the copy goes to each signer's own email or portal before the lease counts as complete.

## Guarantors

A **guaranty** is a separate promise to answer for someone else's debt, and in many states it must be in writing to be enforceable (California lists "a special promise to answer for the debt, default, or miscarriage of another" among contracts that must be, Civil Code 1624). So a guarantor isn't a leaseholder with a different label: they sign a guaranty instrument that refers to the lease, and the platform stores it as its own document.

The guaranty's terms are data the ledger and renewal flows need:

- **What it covers:** rent only, or every sum due under the lease (fees, damages, legal costs).
- **The limit:** a dollar cap, a number of months' rent, or unlimited; for a by-the-bed lease, often one resident's share (Student Housing covers parental guarantors).
- **How long:** the initial term only, or renewals and holdover too. A guaranty that ends with the initial term means the renewal flow must get a new guaranty or treat the renewal as unguaranteed.
- **Whose debt:** one leaseholder's, or all of them jointly.

Guarantors are screened as applicants with their own criteria ([Applications & Screening](/books/property-tech/applications-and-screening)). A household that can't find a guarantor may buy an institutional one instead: Entrata's Homebody Guaranty, for example, is a "guarantor waiver in place of a traditional guarantor," with coverage from 3 months up to the full lease. Those products are insurance or surety arrangements and belong to Insurance, Deposits & Guarantees; the lease records only that the guaranty requirement was satisfied and by what.

## Concessions

A **concession** is value given to sign or renew: a free month, a discount on rent, waived fees, a gift card. Its terms belong in the signed packet, because the clawback is enforceable only if the household agreed to it.

- **Upfront concessions** apply once: the first month free, a dollar credit at move-in, a specific month free. They post as a single credit on a date.
- **Recurring concessions** reduce every month's rent for some or all of the term, as a negative charge schedule beside the rent schedule, so the lease's stated rent stays the market price the household agreed to and the discount is visible on its own line.
- **Digital concessions** are rewards outside the rent: gift cards or points sent through a loyalty product, funded by the operator. They don't change the lease's rent at all, which matters when a rent cap or a rent-increase notice measures the rent charged.

Conditions decide whether the concession is earned: a minimum term, a move-in by a date, sometimes enrollment in autopay. The **clawback** decides what happens on early termination or default. Sample addenda show the strongest form, the concession becomes "void and must be repaid" if the agreement ends early for any reason; others prorate by the unserved fraction of the term, and some forgive it. My rule: the clawback method is a field on the concession, set from the signed addendum, and computed by the platform at termination with the inputs stored, never typed by staff into a ledger adjustment. A termination the law protects (an SCRA termination forbids an "early termination charge") is checked before any clawback posts; whether a clawback is such a charge is a question for counsel, so I don't let it post automatically on a protected termination. Posting the credits and the clawback, and how concessions show in effective rent, belong to Charges & Resident Ledgers.

## Roommate Changes

The household changes during the term, and [The Property Business](/books/property-tech/property-business#the-core-data-model) made `lease_members` effective-dated for that reason. A roommate change is three separate events:

- **Adding a leaseholder.** The new person applies and is screened, then signs an amendment that adds them to the lease; their membership starts on the amendment's effective date. An occupant added (a partner moving in, a child born) is a membership row without a signature, subject to the lease's occupancy limit.
- **Releasing a leaseholder.** A departing roommate stays liable on a joint lease until the landlord releases them in writing, which usually needs the remaining leaseholders' signatures and a decision on whether the remaining household still qualifies. The release is a signed amendment, and their membership ends on its effective date, not on the day they moved their boxes.
- **Splitting money.** The deposit, a share of the balance, and any concession clawback follow the release terms; the deposit rules belong to Move-In & Move-Out and Insurance, Deposits & Guarantees.

An occupant leaving needs no signature, but the membership still ends, because occupancy limits, affordable-housing household composition and entry notices read it. A roommate change that replaces everyone is often better modeled as a transfer: a new lease for a new household, which is what the core model's rule ("a renewal or a transfer is a new lease") is for.

## Renewals

A renewal is **a new lease row** with `renewal_of_lease_id` pointing at the lease it renews: same unit, same household, new term, new price, new packet, new signatures. The old lease's terms stay as signed, so a renewal increase can always be compared with the rent it replaced and with the cap in force when it was offered. The offer itself comes from `renewal_offers` in [Revenue Management & Pricing](/books/property-tech/revenue-management), and the renewal lease carries the offer it accepted.

The renewal flow is a sequence the platform runs per expiring lease: decide whether to offer, price the offer inside any cap, serve it as a notice with the period the law requires, collect the answer, then generate and sign the renewal packet, or serve a nonrenewal, or let the lease roll to month-to-month. Notice periods differ by state, and several key the period to the size of the increase or the length of the tenancy (as of October 2026):

| Jurisdiction | Notice | Rule |
| --- | --- | --- |
| California, month-to-month rent increase | 30 days if the increase is 10% or less of the lowest rent charged in the prior 12 months (combined with other increases in that period); 90 days if more | Civil Code 827; delivered personally or by mail |
| Oregon, rent increase | 90 days (7 for week-to-week); no increase in the first year; at most once in 12 months; capped at the ORS 90.324 maximum unless exempt (first certificate of occupancy under 15 years old, certain regulated affordable units) | ORS 90.323; the notice states the amount, new rent, effective date and, above the cap, the exemption |
| Washington, rent increase | 90 days (30 for subsidized tenancies); new rules of tenancy 30 days | RCW 59.18.140, as amended in 2025 |
| New York, renewal with an increase of 5% or more, or nonrenewal | 30 days if occupancy is under one year, 60 days for one to two years, 90 days for two years or more; the notice states whether the unit is covered by Good Cause and, if covered, the basis for nonrenewal or for an increase above the local rent standard | Real Property Law 226-c; a late notice extends the tenancy on existing terms until the period runs |

### Good cause laws

Some jurisdictions take away the landlord's right to simply not renew. New York's **Good Cause Eviction Law** (Real Property Law Article 6-A), in effect since April 20, 2024 in New York City and in localities that opt in, bars removing a covered tenant "by failure to renew any lease" without good cause. An increase above the **local rent standard** (the lower of 5% plus the annual change in CPI, or 10%) is presumptively unreasonable, and a tenant's refusal of a reasonable renewal offer made in writing 30 to 90 days before expiration is itself good cause. Exemptions include small landlords (no more than ten units in the state, by default), owner-occupied buildings with ten or fewer units, units with a certificate of occupancy issued on or after January 1, 2009 (for 30 years), regulated and income-restricted units, and units renting above 245% of fair market rent by default. The article is set to repeal June 15, 2034. California's Civil Code 1946.2 requires just cause, stated in the notice, to end a tenancy after 12 months of occupancy, with relocation assistance of one month's rent for no-fault terminations.

For the platform, coverage is a per-unit, per-date determination with inputs (owner's statewide unit count, owner occupancy, certificate of occupancy date, regulatory status, rent against the published fair market rent), and it decides three things: whether a nonrenewal is allowed without a stated ground, which renewal increases need a justification, and which coverage statement goes in the lease and every notice. Landlord-Tenant Law as Data owns the determination; this chapter consumes it.

### Holdover and month-to-month

A lease whose term ends with no renewal and no notice doesn't end. In California, a tenant who stays after expiration while the landlord accepts rent is presumed to have renewed on the same terms, for no more than a month when rent is monthly and never more than a year (Civil Code 1945); many leases say expressly that the tenancy then continues month to month, often at a month-to-month premium. The platform keeps the lease `current`, records the date the periodic tenancy began, adds any premium as a new charge schedule, and switches the lease's notice rules to the periodic ones: in California, a landlord ends a periodic tenancy with 60 days' notice, or 30 if the tenant has been there less than a year (Civil Code 1946.1), and just cause applies on top. Holdover is a state of the term, not a new lease, because nothing new was signed.

## Notices

Notices are how a lease changes or ends between signatures. The kinds that recur:

- **Notice to vacate** from the household, ending the lease at term end or a periodic tenancy.
- **Nonrenewal** from the landlord, with any stated cause a good cause law requires.
- **Rent increase** or **renewal offer**, with the periods above.
- **Notice of entry** before staff or vendors enter. In California, written notice stating date, approximate time and purpose; 24 hours is presumed reasonable, and mailing six days ahead is presumed reasonable; delivery by hand, to a person of suitable age, under or near the door, or by mail; and entry during normal business hours except in emergencies (Civil Code 1954). Maintenance & Work Orders schedules the entry; the lease supplies the rule and the record.
- **Rule changes** where the lease allows them (30 days in Washington).
- **Lease violation and cure,** and the pay-or-quit notices that start an eviction, which belong to Delinquency, Collections & Eviction.
- **Early termination** notices under statute, below.

### Delivery methods are law

How a notice may be served is set by state law, sometimes by the lease, and the platform has to know which. California's rent increase notice goes by personal delivery or by mail under the Code of Civil Procedure (Civil Code 827). Oregon allows personal delivery; first-class mail, which adds three days to the notice period and must say so; mail-and-attach, only if the written lease provides it for notices in both directions; and email, only under a written addendum signed after the tenant moves in, which either party may end on three days' notice, and with termination notices also sent by first-class mail (ORS 90.155).

Federal e-signature law draws a line here too. ESIGN's rule that electronic records satisfy writing requirements does not apply to notices of "default, acceleration, repossession, foreclosure, or eviction, or the right to cure" under "a rental agreement for, a primary residence of an individual" (15 U.S.C. 7003(b)(2)(B)). Those notices go on paper or by the methods state law names. For notices that may be electronic, the [consent rules](/docs/compliance/electronic-signatures#consumer-consent-comes-first) apply first. My rule: each notice kind, per jurisdiction, has a list of permitted delivery methods as data, the outbound gate refuses a method not on the list, and the portal is a convenience copy unless the rule says it counts.

### Deadlines are computed and stored

Every notice produces dates: when it takes effect, the earliest date a rent increase applies, the last day to cure, the last day the household may give notice. They're computed once at service and stored with the inputs, as [Rules as Data](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored) describes, never recomputed on read. A California rent increase above 10% served by hand on October 26, 2026:

```json
{
  "lease_id": "0194c3b1-7d2a-7f00-8e21-6a4c0f9d3b12",
  "notice": "rent_increase",
  "served_on": "2026-10-26",
  "delivery_method": "personal",
  "effective_on_earliest": "2027-01-24",
  "inputs": {
    "jurisdiction": "US-CA",
    "lowest_rent_prior_12_months": 210000,
    "new_rent": 235000,
    "increase_pct": 11.9,
    "threshold_pct": 10,
    "notice_days": 90,
    "mail_extension_days": 0
  },
  "rule_id": "0194c29f-88b0-7d2e-a4c3-5e7f1b9d2a60",
  "rule_version": 3
}
```

The same notice in Oregon sent by first-class mail would add three days and print the extension on the notice. When the household asks why the increase can't start on January 1, the answer is a lookup.

## Early Termination

Leases end early in three ways: by agreement (a buyout clause or a negotiated termination, which is a signed document like any amendment), by default (Delinquency, Collections & Eviction), and by statute. The statutory ones override the lease and are where platforms get it wrong.

**Servicemembers.** The Servicemembers Civil Relief Act lets a lessee terminate a residential lease after entering military service, or on orders for a permanent change of station or a deployment of at least 90 days (50 U.S.C. 3955). Notice is written, with a copy of the orders, delivered by hand, private carrier, return-receipt mail, or electronic means "reasonably calculated to ensure actual receipt." For a lease with monthly rent, termination takes effect 30 days after the next rent due date following delivery. The lessor "may not impose an early termination charge," rent is prorated to the termination date, prepaid rent for later periods is refunded within 30 days, and the termination also ends a dependent's obligation under a joint lease. Each of those is a rule the platform applies: a computed effective date, suppression of termination fees, proration, a refund deadline.

**Survivors of violence.** Many states let victims of domestic violence and related crimes end a lease early. California allows it for a tenant, household member or immediate family member who was a victim of domestic violence, sexual assault, stalking, human trafficking, elder or dependent adult abuse, or certain violent crimes, with written notice and documentation (a protective order, a police report, a qualified third party's statement on the statutory form, or other reasonable verification) within 180 days; the tenant owes rent for no more than 14 days after notice, and the deposit can't be withheld because of the termination (Civil Code 1946.7). Texas requires written notice, generally 30 days ahead, with a protective order or documentation from a qualified provider or advocate, and the lease-language rule above (Property Code 92.016). The documents are among the most sensitive a property platform holds: access limited to the staff who must verify them, never shown to other leaseholders, and retained on their own schedule.

The rest of the lease follows: the terminating person's membership ends, other leaseholders' liability is decided by the statute and the lease, concessions and fees are checked against the protection, and move-out proceeds.

## The Lease State Machine

The core model gives a lease seven states. Their transitions:

| From | To | When |
| --- | --- | --- |
| `draft` | `out_for_signature` | The packet is rendered from template versions and signature requests are sent |
| `out_for_signature` | `draft` | The packet is voided to correct it; every open request is voided with it |
| `out_for_signature` | `signed` | Every required signer and the countersigner have signed, and the executed document is stored |
| `draft`, `out_for_signature` | `cancelled` | Declined, withdrawn, or the quote or hold expired |
| `signed` | `current` | The start date has arrived and the household is in possession: move-in recorded, or for a renewal, the lease it renews has ended |
| `signed` | `cancelled` | Cancelled before possession, by agreement or under a rule; the reason is required |
| `current` | `notice_given` | A notice to vacate, nonrenewal or early termination notice is served |
| `notice_given` | `current` | The notice is rescinded by agreement, recorded with who agreed |
| `notice_given`, `current` | `ended` | Moved out, or replaced by its renewal or a transfer, or possession recovered after eviction or abandonment; `ended_reason` says which |

`ended` and `cancelled` are terminal. A lease past its start date that is still `signed` (nobody recorded the move-in) is an exception queue, not a state. A renewal's predecessor ends with reason `renewed` and no move-out date, and the household never leaves the unit. Holdover is `current` with a periodic start date, not a state of its own. I needed no state beyond the seven: eviction is a case attached to a lease that is `current` or `notice_given`, owned by Delinquency, Collections & Eviction, and a transfer is the end of one lease and the start of another.

Mapped to one platform's names: Infor eSite's Applicant is an application, before any lease row exists (or `draft` and `out_for_signature` once the packet is out); Current is `current`; Notice and Transfer are `notice_given`, with Transfer's next lease already in progress; Cancelled is `cancelled`; Previous Residents are `ended`. The "future resident" between signing and move-in is `signed`.

## How to Build It

The lease adds documents, templates, signatures, notices, concessions and state history to [The Core Data Model](/books/property-tech/property-business#the-core-data-model), and extends `leases` and `lease_members`. The e-signature provider owns the ceremony; the platform owns which documents, which signers, and the executed copy.

```sql
-- Templates: leases, addenda, guaranties, amendments, notices and clauses, versioned.
CREATE TABLE lease_templates (
  id                         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id                  UUID NOT NULL,
  template_key               TEXT NOT NULL,        -- 'lease.residential', 'addendum.lead_paint'
  version                    INT NOT NULL,
  kind                       TEXT NOT NULL CHECK (kind IN ('lease', 'addendum', 'disclosure',
                               'guaranty', 'amendment', 'notice', 'clause')),
  source                     TEXT NOT NULL CHECK (source IN ('own', 'association', 'provider')),
  source_ref                 TEXT,                 -- the form's number and revision, if not own
  language                   TEXT NOT NULL,        -- BCP 47, e.g. 'es-US'
  translation_of_template_id UUID REFERENCES lease_templates (id),
  clause_template_ids        UUID[] NOT NULL DEFAULT '{}',  -- clause versions compiled in
  applies_when               JSONB NOT NULL DEFAULT '{}',   -- rule inputs: jurisdiction, year built
  body_ref                   TEXT NOT NULL,        -- stored template file
  content_sha256             TEXT NOT NULL,
  published_at               TIMESTAMPTZ,          -- immutable once set
  retired_at                 TIMESTAMPTZ,
  UNIQUE (tenant_id, template_key, language, version)
);

-- One rendered document a lease relies on: the lease, a renewal, an amendment, a guaranty.
CREATE TABLE lease_documents (
  id                         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id                  UUID NOT NULL,
  lease_id                   UUID NOT NULL REFERENCES leases (id),
  template_id                UUID NOT NULL REFERENCES lease_templates (id),
  kind                       TEXT NOT NULL CHECK (kind IN ('lease', 'renewal', 'amendment',
                               'guaranty', 'translation', 'termination_agreement')),
  language                   TEXT NOT NULL,
  translation_of_document_id UUID REFERENCES lease_documents (id),
  guarantor_person_id        UUID REFERENCES people (id),  -- for a guaranty
  status                     TEXT NOT NULL CHECK (status IN ('draft', 'out_for_signature',
                               'executed', 'voided', 'superseded')),
  effective_on               DATE,                 -- amendments: when the change applies
  rendered_ref               TEXT NOT NULL,        -- the file as presented to signers
  rendered_sha256            TEXT NOT NULL,
  executed_ref               TEXT,                 -- sealed PDF, write-once storage
  executed_sha256            TEXT,
  certificate_ref            TEXT,                 -- provider's completion certificate
  provider                   TEXT,
  provider_envelope_id       TEXT,
  delivered_to_signers_at    TIMESTAMPTZ,          -- every signer has a copy
  executed_at                TIMESTAMPTZ,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status <> 'executed' OR (executed_ref IS NOT NULL AND executed_sha256 IS NOT NULL)),
  CHECK (kind <> 'guaranty' OR guarantor_person_id IS NOT NULL),
  CHECK (kind <> 'translation' OR translation_of_document_id IS NOT NULL),
  UNIQUE (tenant_id, provider, provider_envelope_id)
);

-- Which addenda and disclosures went into a document, and the rule that required each.
CREATE TABLE lease_addenda (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  lease_document_id UUID NOT NULL REFERENCES lease_documents (id),
  template_id       UUID NOT NULL REFERENCES lease_templates (id),
  is_required       BOOLEAN NOT NULL,      -- by law or policy, vs chosen by staff
  rule_id           UUID,                  -- null when chosen by staff
  rule_version      INT,
  rule_inputs       JSONB,                 -- year_built, flood_zone, has_pet, ...
  added_by_user_id  UUID,                  -- staff who added an optional addendum
  UNIQUE (lease_document_id, template_id),
  CHECK (NOT is_required OR rule_id IS NOT NULL)
);

-- One signer of one document, in a routing order.
CREATE TABLE signature_requests (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id              UUID NOT NULL,
  lease_document_id      UUID NOT NULL REFERENCES lease_documents (id),
  signer_person_id       UUID REFERENCES people (id),   -- a resident-side signer
  signer_user_id         UUID,                          -- staff countersigner (Platform Architecture)
  signs_for_entity_id    UUID REFERENCES legal_entities (id),  -- the landlord, when countersigning
  role                   TEXT NOT NULL CHECK (role IN ('leaseholder', 'guarantor',
                           'landlord_agent')),
  routing_order          INT NOT NULL,          -- same number: parallel; higher: later
  status                 TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'viewed',
                           'signed', 'declined', 'voided', 'expired')),
  esign_consent_id       UUID,                  -- consent record relied on, per the e-sign doc
  auth_method            TEXT,                  -- email link, SMS code, in-person ID check
  provider_recipient_id  TEXT,
  sent_at                TIMESTAMPTZ,
  signed_at              TIMESTAMPTZ,
  declined_reason        TEXT,
  CHECK (num_nonnulls(signer_person_id, signer_user_id) = 1),
  CHECK ((role = 'landlord_agent') = (signer_user_id IS NOT NULL)),
  CHECK (role <> 'landlord_agent' OR signs_for_entity_id IS NOT NULL),
  CHECK (status <> 'signed' OR signed_at IS NOT NULL)
);

-- Every status change, with who and why.
CREATE TABLE lease_status_history (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  lease_id     UUID NOT NULL REFERENCES leases (id),
  from_status  TEXT,                      -- null for the first row
  to_status    TEXT NOT NULL,
  reason       TEXT,                      -- required for cancelled, ended, rescinded notice
  actor_type   TEXT NOT NULL CHECK (actor_type IN ('user', 'resident', 'system', 'agent')),
  actor_id     TEXT NOT NULL,
  document_id  UUID REFERENCES lease_documents (id),
  notice_id    UUID,                      -- references lease_notices (id)
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notices served by either side, with computed dates and the rule that computed them.
CREATE TABLE lease_notices (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  lease_id              UUID NOT NULL REFERENCES leases (id),
  kind                  TEXT NOT NULL CHECK (kind IN ('notice_to_vacate', 'nonrenewal',
                          'rent_increase', 'renewal_offer', 'entry', 'rule_change',
                          'lease_violation', 'early_termination_military',
                          'early_termination_violence', 'early_termination_other',
                          'good_cause_coverage')),
  direction             TEXT NOT NULL CHECK (direction IN ('from_landlord', 'from_resident')),
  given_by_person_id    UUID REFERENCES people (id),     -- the resident who gave it
  renewal_offer_id      UUID REFERENCES renewal_offers (id),
  delivery_method       TEXT NOT NULL CHECK (delivery_method IN ('personal', 'substituted',
                          'posted', 'first_class_mail', 'certified_mail', 'mail_and_attach',
                          'email', 'portal', 'carrier')),
  served_at             TIMESTAMPTZ NOT NULL,
  effective_on          DATE,                  -- computed: when it takes effect
  deadline_on           DATE,                  -- computed: last day to cure or respond
  inputs                JSONB NOT NULL,        -- everything the computation used
  rule_id               UUID NOT NULL,
  rule_version          INT NOT NULL,
  document_ref          TEXT NOT NULL,         -- the notice as served
  document_sha256       TEXT NOT NULL,
  proof_of_service_ref  TEXT,                  -- receipt, declaration, delivery event
  supporting_doc_ref    TEXT,                  -- orders, protective order: restricted access
  rescinded_at          TIMESTAMPTZ,
  rescinded_reason      TEXT,
  CHECK (direction <> 'from_resident' OR given_by_person_id IS NOT NULL),
  CHECK (rescinded_at IS NULL OR rescinded_reason IS NOT NULL)
);

-- Concessions as signed, separate from the credits that post them.
CREATE TABLE lease_concessions (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  lease_id             UUID NOT NULL REFERENCES leases (id),
  lease_document_id    UUID NOT NULL REFERENCES lease_documents (id),  -- where it was agreed
  kind                 TEXT NOT NULL CHECK (kind IN ('upfront', 'recurring', 'digital')),
  charge_code_id       UUID REFERENCES charge_codes (id),
  schedule_id          UUID REFERENCES lease_charge_schedules (id),    -- recurring only
  amount               BIGINT NOT NULL CHECK (amount > 0),  -- per occurrence, minor units
  currency             CHAR(3) NOT NULL,
  applies_on           DATE,                  -- upfront only
  conditions           JSONB NOT NULL DEFAULT '{}',  -- min term, move-in by, autopay
  clawback_method      TEXT NOT NULL CHECK (clawback_method IN ('none', 'full', 'prorated')),
  status               TEXT NOT NULL CHECK (status IN ('promised', 'granted', 'forfeited',
                         'clawed_back', 'waived')),
  status_reason        TEXT,
  CHECK (kind <> 'recurring' OR schedule_id IS NOT NULL),
  CHECK (kind <> 'upfront' OR applies_on IS NOT NULL)
);

ALTER TABLE leases
  ADD COLUMN rent_quote_id    UUID REFERENCES rent_quotes (id),     -- new leases
  ADD COLUMN renewal_offer_id UUID REFERENCES renewal_offers (id),  -- renewals
  ADD COLUMN language         TEXT NOT NULL DEFAULT 'en-US',        -- language of negotiation
  ADD COLUMN periodic_from    DATE,           -- holdover: month-to-month began
  ADD COLUMN ended_reason     TEXT CHECK (ended_reason IN ('moved_out', 'renewed',
                                'transferred', 'early_termination', 'eviction', 'abandonment')),
  ADD CONSTRAINT renewal_offer_needs_renewal
    CHECK (renewal_offer_id IS NULL OR renewal_of_lease_id IS NOT NULL),
  ADD CONSTRAINT ended_has_reason
    CHECK ((status = 'ended') = (ended_reason IS NOT NULL)),
  ADD CONSTRAINT periodic_after_term
    CHECK (periodic_from IS NULL OR (ends_on IS NOT NULL AND periodic_from > ends_on));

ALTER TABLE lease_members
  ADD COLUMN joined_by_document_id   UUID REFERENCES lease_documents (id),  -- amendment, if mid-term
  ADD COLUMN released_by_document_id UUID REFERENCES lease_documents (id),  -- written release
  ADD COLUMN guaranty_document_id    UUID REFERENCES lease_documents (id),  -- may be on a prior lease
  ADD COLUMN guaranty_scope          TEXT CHECK (guaranty_scope IN ('rent_only', 'all_sums')),
  ADD COLUMN guaranty_limit_amount   BIGINT,   -- null: unlimited
  ADD COLUMN guaranty_covers_renewals BOOLEAN,
  ADD CONSTRAINT guaranty_fields_only_for_guarantors
    CHECK (role = 'guarantor' OR (guaranty_document_id IS NULL AND guaranty_scope IS NULL
           AND guaranty_limit_amount IS NULL AND guaranty_covers_renewals IS NULL));
```

The `signed` transition is a check, not a flag. It passes only when the lease's primary document is executed and every leaseholder and guarantor member on the signing date has a signed request:

```sql
SELECT m.person_id, m.role
FROM lease_members m
WHERE m.lease_id = $1
  AND m.role IN ('leaseholder', 'guarantor')
  AND m.valid_during @> $2::date                 -- the lease's start date
  AND NOT EXISTS (
    SELECT 1
    FROM signature_requests s
    JOIN lease_documents d ON d.id = s.lease_document_id
    WHERE d.lease_id = m.lease_id
      AND d.kind IN ('lease', 'renewal', 'guaranty')
      AND d.status = 'executed'
      AND s.signer_person_id = m.person_id
      AND s.status = 'signed');
-- Any row returned blocks the transition; so does a missing landlord_agent signature.
```

Decisions in the shape:

- **Templates are immutable versions;** every document cites one, and every addendum cites the rule that required it, so "which leases used the old late fee clause" and "why does this lease have a flood disclosure" are queries.
- **The rendered file and the executed file are both kept,** with hashes. The executed PDF is the record; the template and field values are how it was produced.
- **Signers are rows with routing orders,** and the countersigner is a staff user signing for a named landlord entity.
- **Notices store their computed dates and inputs,** with the rule version, the delivery method and proof of service. A rule fix doesn't move a deadline already served.
- **Concessions keep their signed terms apart from the credits that post them,** so a clawback is computed from what was agreed. Charges & Resident Ledgers owns the postings.
- **A guaranty is its own document** and the guarantor's limits live on their membership, so a renewal can tell whether the guaranty follows it.
- **Status changes go through one command** that checks the transition table, writes `lease_status_history` in the same transaction, and emits the event.

Events: `lease.document_executed`, `lease.signed`, `lease.cancelled`, `lease.member_added`, `lease.member_released`, `lease.notice_served`, `lease.notice_rescinded`, `lease.renewed` (on the new lease, with the old one's ID), `lease.converted_to_periodic` and `lease.ended` (with its reason), beside the core model's `lease.moved_in` and `lease.moved_out` ([Events & Async Messaging](/docs/architecture/events)).

## Auditing

A lease is evidence in rent disputes, fair housing complaints, deposit claims, eviction cases and regulator inquiries. Keep:

- **The packet as executed:** every document, its template version, the addenda and the rules that required them, translations delivered, the certificate, and delivery of the copy to each signer.
- **The lead disclosure** for at least 3 years from the start of each lease, as federal law requires, and in practice for as long as the lease file.
- **Every signature request,** including declined, voided and expired ones, with consent records and authentication methods ([What the Evidence Holds](/docs/compliance/electronic-signatures#what-the-evidence-holds)).
- **Every notice as served,** with method, proof of service, computed dates, inputs and rule version, and rescissions with who agreed.
- **Status history** with actor and reason, so occupancy, pre-leasing and eviction timelines can be rebuilt.
- **Membership changes** with the amendment or release that made each one.
- **Concession terms and clawback computations,** with the termination that triggered them.
- **Coverage determinations** under good cause laws, with their inputs as of the notice date.

Statutory termination documents (military orders, protective orders, third-party statements) are kept under restricted access with their own retention ([Data Retention & Deletion](/docs/architecture/data-retention#retention-schedules-by-record-type)). Record mechanics are in [Audit Trails](/docs/architecture/audit-trails); what each regulator asks for is in Records, Privacy & Audits.

## What This Means for the System You Build

- **Treat the executed document as the lease,** stored write-once with its hash and certificate, whether the text came from your templates, an association's forms or the operator's PDF.
- **Version templates and clauses,** and record which version and which rule put each addendum and disclosure in each packet.
- **Hold the facts disclosures depend on** (year built, flood zone and history, known lead and mold records) as sourced property attributes, and block the packet when one is missing.
- **Carry the language of negotiation** from first contact and render and deliver translations where the law requires them, before signature.
- **Derive "signed" from signature requests:** every leaseholder and guarantor, then the landlord's countersignature last, against a quote and hold that are still valid.
- **Store a guaranty as its own instrument,** with scope, limit and whether it covers renewals.
- **Keep concession terms separate from postings,** with the clawback method from the signed addendum and protected terminations checked first.
- **Make every renewal a new lease** linked to the one it renews and the offer it accepted, and model holdover as a periodic start date on the current lease.
- **Serve notices through one gate** that knows each kind's permitted delivery methods per jurisdiction, and compute and store every deadline at service.
- **Encode statutory early termination** (SCRA, survivor protections) as rules with computed effective dates, fee suppression and restricted documents.
- **Enforce the lease state machine in one command,** with history, reasons and events, and map vendor status names to it at the integration edge.

## References

**Statutes and regulations**

- [40 CFR 745.113: Certification and acknowledgment of disclosure](https://www.law.cornell.edu/cfr/text/40/745.113), the lessor's lease contents for target housing and the 3-year retention
- [40 CFR 745.103: Definitions](https://www.law.cornell.edu/cfr/text/40/745.103), target housing (pre-1978) and its exclusions for elderly and disability housing and 0-bedroom units
- [40 CFR 745.101: Scope and applicability](https://www.law.cornell.edu/cfr/text/40/745.101), exemptions for leases of 100 days or less, certified lead-free housing and renewals
- [24 CFR 35.92: Certification and acknowledgment of disclosure](https://www.law.cornell.edu/cfr/text/24/35.92), HUD's parallel lessor requirement
- [15 U.S.C. 7003: Specific exceptions](https://www.law.cornell.edu/uscode/text/15/7003), ESIGN's exclusion of default, eviction and right-to-cure notices under a primary-residence rental agreement
- [50 U.S.C. 3955: Termination of residential or motor vehicle leases](https://www.law.cornell.edu/uscode/text/50/3955), SCRA triggers, delivery methods, effective dates, no early termination charge, prepaid rent refund
- [California Civil Code 1632](https://california.public.law/codes/civil_code_section_1632), translation of leases negotiated in Spanish, Chinese, Tagalog, Vietnamese or Korean, and rescission
- [California Civil Code 827](https://california.public.law/codes/civil_code_section_827), 30- and 90-day rent increase notices and the 10% threshold over 12 months
- [California Civil Code 1624](https://california.public.law/codes/civil_code_section_1624), promises to answer for another's debt and leases over one year must be in writing
- [California Civil Code 1945](https://california.public.law/codes/civil_code_section_1945), renewal presumed by continued possession and accepted rent
- [California Civil Code 1946.1](https://california.public.law/codes/civil_code_section_1946.1), 60- and 30-day notices to end a periodic tenancy and delivery methods
- [California Civil Code 1946.2](https://california.public.law/codes/civil_code_section_1946.2), just cause after 12 months, relocation assistance, the required notice of protections and the 2030 sunset
- [California Civil Code 1946.7](https://california.public.law/codes/civil_code_section_1946.7), early termination for victims of violence, documentation, 180 days and 14 days' rent
- [California Civil Code 1954](https://california.public.law/codes/civil_code_section_1954), entry purposes, 24-hour and 6-day presumptions, delivery and business hours
- [California Civil Code 1954.603](https://california.public.law/codes/civil_code_section_1954.603), bed bug information before a new tenancy
- [California Government Code 8589.45](https://california.public.law/codes/government_code_section_8589.45), flood disclosure in residential leases from July 1, 2018
- [California Health and Safety Code 26147](https://california.public.law/codes/health_and_safety_code_section_26147), mold disclosure and its delayed effective date
- [Oregon ORS 90.323](https://oregon.public.law/statutes/ors_90.323), 90-day rent increase notice, first-year and 12-month limits, cap and exemptions
- [Oregon ORS 90.155](https://oregon.public.law/statutes/ors_90.155), service of written notices by hand, mail, mail-and-attach and email addendum
- [Washington RCW 59.18.140](https://app.leg.wa.gov/rcw/default.aspx?cite=59.18.140), 90-day rent increase notice and 30-day rule changes
- [New York Real Property Law 226-c](https://www.nysenate.gov/legislation/laws/RPP/226-C), 30-, 60- and 90-day renewal and nonrenewal notices and the Good Cause statement
- [New York Real Property Law 231-b](https://www.nysenate.gov/legislation/laws/RPP/231-B), flood disclosure in residential leases
- [New York Real Property Law Article 6-A](https://www.nysenate.gov/legislation/laws/RPP/A6-A), the Good Cause Eviction Law's sections and 2034 repeal
- [New York Real Property Law 211](https://www.nysenate.gov/legislation/laws/RPP/211), local rent standard and small landlord definitions
- [New York Real Property Law 214](https://www.nysenate.gov/legislation/laws/RPP/214), covered housing and exemptions
- [New York Real Property Law 215](https://www.nysenate.gov/legislation/laws/RPP/215), no removal or failure to renew without good cause
- [New York Real Property Law 216](https://www.nysenate.gov/legislation/laws/RPP/216), grounds for removal and reasonable renewal terms
- [Texas Property Code 92.0135](https://texas.public.law/statutes/tex._prop._code_section_92.0135), flood disclosure notices from January 1, 2022
- [Texas Property Code 92.016](https://texas.public.law/statutes/tex._prop._code_section_92.016), early termination for family violence and the required lease language

**Agency guidance**

- [New York Attorney General: New York State Good Cause Eviction Law](https://ag.ny.gov/publications/new-york-state-good-cause-eviction-law), the April 20, 2024 effective date, the 10% cap and the August 18, 2024 lease and notice statement

**In practice**

- [Blue Moon Software](https://cms.bluemoonforms.com/?p=home), official TAA, NAA and GAA forms, built-in e-signature and integrations
- [California Apartment Association: Forms](https://caanet.org/landing/forms/), 180+ rental forms including lease, month-to-month agreement, addenda and notices
- [RealPage: eSignature partnership with NAA, TAA and Blue Moon (2008)](https://www.realpage.com/news/realpage-the-naa-national-lease-program-texas-apartment-association-and-blue-moon-software-partner-to-integrate-esignatureamptrade-technology/), e-signature on official association leases across management systems
- [RealPage: Property management software](https://www.realpage.com/property-management-software/), renewals, transfers and standardized corporate-approved documents
- [RealPage: LOFT Loyalty](https://www.realpage.com/resident-portal/loyalty-rewards/), digital concessions for move-ins and renewals, operator-funded, unused funds recovered
- [Buildium: Online leasing](https://www.buildium.com/features/online-leasing/), Dropbox Sign, templates for leases and addenda, autofill fields, signer order and reminders
- [AppFolio: Management tools](https://www.appfolio.com/property-management/management-tools), lease and renewal offers e-signed on mobile, default renewal offers and bulk renewals
- [Entrata: SiteTablet](https://www.entrata.com/products/sitetablet), lease signing on the leasing agent's tablet through LeaseExecution
- [Entrata: Renewals AI](https://www.entrata.com/products/renewals-ai), renewal prediction 90 days ahead and intent segmentation
- [Entrata: Homebody Guaranty](https://www.entrata.com/products/homebody-guaranty), a guarantor waiver in place of a traditional guarantor
- [ResMan: Leasing](https://myresman.com/solutions/leasing), lease execution with the operator's form provider or Blue Moon, custom forms and bulk renewals
- [Rent Manager: Prospect & Tenant Portal](https://rentmanager.com/prospect-tenant-portal), Signable Documents and updated leases for renewing tenants
- [Yardi Breeze: 3 Benefits of eSignatures in Yardi Breeze](https://www.yardibreeze.com/?p=11826), documents signed through the RentCafe portal (2019)
- [Infor: Rent roll, residential (eSite help)](https://amsiaws.saas.infor.com/AMSIWEBG002/Areas/eSite/help/rent_roll_residential.htm), resident statuses Applicant, Current, Notice, Transfer, Cancelled and Previous Residents
- [DocuSign Community: Mastering signing order](https://community.docusign.com/tips-from-docusign-155/docusign-trainer-tips-mastering-signing-order-22771), parallel and sequential routing by order number
- [Law Insider: Concession addendum clauses](https://www.lawinsider.com/clause/concession-addendum), a concession void and repayable on early termination or nonpayment
