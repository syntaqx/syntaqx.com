+++
title = "Move-In & Move-Out"
description = "Move-in readiness, condition inspections, keys, utility transfer, unit transfers, move-out, state deposit deadlines, damage charges and final statements."
category = "Property Tech Industry"
order = 1713
part = "Leasing"
tags = ["property-tech", "move-in", "move-out", "inspections", "security-deposits", "make-ready"]
+++

A lease is a promise about the future; move-in and move-out are the two days the promise touches a real unit. At move-in, a household that was a signed lease becomes a resident: the unit has to be ready, the money due before keys has to be paid, insurance and utilities have to be in place, the unit's condition has to be recorded, and keys or credentials have to change hands. At move-out the same steps run in reverse, against a clock. Keys come back, the unit is inspected, damage is separated from wear, and within a deadline set by the state the operator has to account in writing for every dollar of the deposit it keeps. Miss the deadline or the paperwork and, in several states, the operator loses the right to keep any of it and can owe a multiple of it.

This chapter covers the ready-to-move-in gate, condition inspections and the state laws that require them, keys and access credentials, utility transfer, transfers between units, the move-out sequence, deposit itemization deadlines as effective-dated rules, damage charges, the final account statement, unclaimed refunds and deposit alternatives at move-out. The make-ready work itself belongs to Maintenance & Work Orders; proration math to Charges & Resident Ledgers; smart locks to Access, Smart Buildings & Parking; the deposit's custody and interest to Insurance, Deposits & Guarantees and Trust Accounting & the General Ledger. The lease and its notices are [The Lease](/books/property-tech/the-lease).

## How the Platforms Do It

Every system of record has a move-in and a move-out transaction; they differ in how much of the paperwork around them they own and how much they hand to specialists.

- **Suites run the transactions and the final statement.** RealPage describes OneSite as handling "move-ins, move-outs, transfers, and final account statements," and pitches automation of move-outs alongside month-end close. AppFolio lists "Inspections & Unit Turns" in its Core plan. Yardi Breeze's inspections mark each room or area passed or failed with notes and photos, add maintenance requests from the inspection screen, and keep the history in the database; its guidance is a move-in inspection for every new resident and a move-out inspection before the deposit goes back, compared with the move-in photos.
- **Inspection apps on the suite's ledger.** Entrata's InspectionManager covers "every unit, building, and amenity," with photos and digital sign-off, and its move-out form carries a resident charges field. Specialists sell the same thing across suites: HappyCo runs move-in, move-out, make-ready and custom walks in one app, captures photos, video and voice notes offline and syncs later, and routes findings into dispatchable work orders, with two-way sync to Yardi, RealPage, ResMan and others. zInspector, an AppFolio partner, triggers inspections from AppFolio's move-in and move-out data, stores reports in the unit history and syncs issues back as work orders. RentCheck has residents complete guided inspections themselves, producing a time-stamped photo record, and integrates with AppFolio and Rent Manager.
- **Resident checklists and service bundles.** Entrata's Homebody Move is "a digital move-in and move-out checklist," and its partnership with Amenify gives residents a $50 move-in credit toward cleaning and handyman services. Yardi's RentCafe offers renters "a move-in checklist to keep you on track" alongside adding renters insurance during the lease-online flow. Bundling insurance, internet, power plans and deposit alternatives into the move-in checklist is where the resident-paid revenue in [How the Money Is Made](/books/property-tech/property-business#how-the-money-is-made) concentrates.
- **Deposit specialists inside the suite.** Rent Manager has built in Rentable, which opens per-state escrow accounts, tracks state return deadlines and interest, triggers itemized deduction statements and ACH refunds, tracks uncashed checks and escheatment, and posts all of it to the tenant ledger.

The common shape: the suite owns the lease, the ledger and the statement; inspection evidence and the deposit's custody are increasingly specialist products wired in through the partner programs in [The Software Landscape](/books/property-tech/software-landscape#partner-programs). My rule: whoever captures the evidence, the inspection record and the deductions it supports land in the system of record, linked to the lease, because that's where the deadline is tracked and where a court asks for them.

## Move-In Readiness

Move-in is a gate with several independent conditions, each owned by a different team or chapter. The keys don't go out until all of them hold on the move-in date:

| Condition | What "done" means | Owner |
| --- | --- | --- |
| Lease executed | Every leaseholder and guarantor signed; the lease is `signed` | [The Lease](/books/property-tech/the-lease) |
| Unit ready | The make-ready work orders for this unit are completed and the unit passed its make-ready inspection; where required, locks rekeyed since the last resident | Maintenance & Work Orders |
| Move-in funds paid | Deposit (or a deposit alternative bound), first month's prorated rent, and any other charges due before possession, paid in good funds | Charges & Resident Ledgers; Collecting Rent |
| Renters insurance verified | Proof of a policy meeting the lease's requirement, or enrollment in the property's program | Insurance, Deposits & Guarantees |
| Utilities in the resident's name | For each utility the resident pays directly, an active account starting on or before the move-in date | Utilities & Energy, and [Utility Transfer](#utility-transfer) below |
| Move-in inspection scheduled | Offered or scheduled as the property's state requires | [Inspections](#inspections) below |

Model each condition as a check with a status, an evidence reference and who cleared it, computed from the records that prove it rather than ticked by hand. A staff override is allowed, with a reason, because a move-in does sometimes proceed with insurance outstanding; the override is the audit record. The resident sees the same list as a checklist in the portal, which is what the vendors' move-in checklists are: the readiness gate turned outward.

"Good funds" deserves a sentence. A move-in paid by ACH can be returned days after the keys were handed over ([ACH & Bank Transfers](/books/payments/ach#returns-when-money-is-really-yours)), so many operators require certified funds or a card for move-in money, or wait for settlement. That's a policy per property, stored as data, and it has fair housing and payment-method implications that Collecting Rent covers.

The first month's rent is usually prorated from the move-in date. The math (daily rate from a 30-day month, the actual month or a 365-day year, and which charges prorate) belongs to Charges & Resident Ledgers; this chapter only fixes the date it starts from, which is `leases.moved_in_on`, the day possession actually changed hands, not the lease start date if the two differ.

## Inspections

A condition inspection is a dated, itemized record of every area and item in the unit, with photos, made at a defined point in the tenancy. The kinds a platform needs:

- **Move-in.** The baseline: the unit's condition and cleanliness when the household takes possession. Every later deduction is measured against it.
- **Pre-move-out.** An inspection before the household leaves, so they can fix what would otherwise be deducted. Some states give tenants a right to one.
- **Move-out.** After possession is returned: the record that supports deductions.
- **Make-ready and periodic.** Quality checks on turns and annual or program inspections, owned by Maintenance & Work Orders and Subsidized & Affordable Housing, using the same tables.

### What the law requires, as of October 2026

States differ on whether an inspection is required, who must ask for it, what must be signed and what happens without it:

| State | Move-in | Before or at move-out | Statute |
| --- | --- | --- | --- |
| **California** | For tenancies beginning on or after July 1, 2025, the landlord photographs the unit immediately before or at the start of the tenancy | On the tenant's request, an initial inspection no earlier than two weeks before the tenancy ends, with at least 48 hours' written notice, and an itemized statement of proposed deductions so the tenant can cure them; the landlord must tell the tenant of the option. From April 1, 2025, photos after possession is returned (before repairs or cleaning) and again after the work | Civ. Code 1950.5(f), (g) |
| **Washington** | No deposit may be collected unless the landlord gives a written checklist or statement specifically describing the condition, cleanliness and existing damage, signed and dated by both, with a copy to the tenant. Without it, the landlord is liable for the deposit amount | | RCW 59.18.260 |
| **New York** | On the tenant's request, an inspection after signing and before occupancy, with a signed written agreement on condition; the landlord cannot deduct for conditions listed in it | After either party gives notice, the landlord must tell the tenant in writing of the right to an inspection no earlier than two weeks and no later than one week before the end, with 48 hours' written notice, followed by an itemized statement of proposed deductions the tenant may cure | GOL 7-108(1-a)(c), (d) |
| **Georgia** | Before taking the deposit, a list of existing damage the tenant may inspect; signed by both, it's conclusive evidence of its accuracy except for latent defects | Within three business days after the tenancy ends, a final list of damage with estimated dollar values; the tenant may inspect within five business days | O.C.G.A. 44-7-33 |
| **Michigan** | Two blank commencement inventory checklists; the tenant returns one within 7 days of possession (unless a shorter period is agreed), with a required boldface notice on the form | A termination inventory checklist listing all damage claimed | MCL 554.608 |
| **Massachusetts** | A signed statement of the unit's condition when the deposit is taken or within ten days after the tenancy begins; the tenant may return it with additions within fifteen days | | G.L. c. 186, 15B(2)(c) |

Two design consequences. First, **the inspection is the deposit's precondition in some states,** not a nice-to-have: in Washington the checklist decides whether a deposit may be held at all, so the readiness gate has to block collecting it, not just warn. Second, **the inspection carries notices with deadlines:** New York and California require the landlord to tell the tenant about the pre-move-out inspection right when notice is given, which makes it a step triggered by the notice record in The Lease, scheduled inside a window computed from the tenancy's end date ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)). Every requirement in the table is a row of effective-dated rules data, resolved from the property's jurisdiction, so California's 2025 photo dates apply by tenancy start date and move-out date without a code change.

### Capturing the record

The mechanics of trustworthy photos (captured in the app, hashed on the device, both clocks recorded, location with accuracy, the record sealed and amended only by revision) are in Field Operations' [Proof of Service](/books/field-operations/proof-of-service#photos-and-location), and they apply unchanged. The property twists:

- **Item by item, against the baseline.** A move-out item links to the same area and item on the move-in inspection, so the comparison a judge or a resident makes is one row, two photos, two conditions. Templates are versioned per unit type, so a two-bedroom's move-out walks the same rooms as its move-in.
- **Offline first.** Inspections happen in units with no service and in basements; the vendors above sell offline capture for that reason. The device mechanics are [Offline-First Sync](/docs/architecture/offline-sync) and [The Technician App](/books/field-operations/technician-app#what-the-platforms-keep-offline).
- **Resident participation and signature.** Washington wants both signatures, Georgia makes a signed list conclusive, Michigan makes the tenant fill in the form. Capture the resident's signature or comments electronically with the evidence an e-signature needs ([Electronic Signatures & Records](/docs/compliance/electronic-signatures#what-the-evidence-holds)), and record a resident's disputes item by item, because Georgia limits a later claim to items specifically disputed in writing.
- **Resident self-inspection.** Apps like RentCheck have the resident walk the unit. That's valid evidence, and it's a different actor: record who captured each photo.
- **Findings become work.** A damaged item on a move-out or make-ready inspection opens a work order with source `inspection`, marked resident-chargeable when the inspector attributes it to the household. HappyCo, zInspector and Yardi Breeze all turn findings into work orders; the work order's cost is what the deduction later cites.
- **What's in the frame.** Inspection photos inside an occupied unit capture belongings, documents and people. Restrict who sees them and set a retention period tied to the deposit dispute window ([Data Retention](/docs/architecture/data-retention#retention-schedules-by-record-type)).

## Keys & Access

Every way into the unit is a credential with a holder, an issue date and a return or revocation date: physical keys (unit, mailbox, storage, amenity), fobs and cards, garage remotes, keypad codes and mobile credentials for smart locks. The chapter's record is the handover: what was issued to whom at move-in, and what came back or was revoked at move-out. Credential provisioning, lock integrations and the privacy of access logs are Access, Smart Buildings & Parking.

- **Issue per person, not per unit.** A roommate who leaves mid-lease returns their fob while the others keep theirs; credentials hang off `lease_members` dates, and a smart credential's validity ends no later than the member's.
- **Revoke at move-out, always.** A physical key that wasn't returned is a security problem for the next household, and a smart credential that wasn't revoked is a worse one. The move-out isn't complete until every credential is returned or revoked, and an unreturned key becomes a lock change.
- **Rekey between residents where the law requires it.** Texas requires the landlord to rekey security devices "not later than the seventh day after each tenant turnover date," at the landlord's expense; the cost can be deducted from the deposit only when a tenant breaks a written lease by moving out early and a clearly marked lease clause allows it (Prop. Code 92.156). Model the rekey as a make-ready work order and the rule as data: the readiness gate checks that a completed rekey exists after the previous household's move-out where the jurisdiction requires one.
- **Charge for lost keys by charge code.** A missing fob or key is a one-off charge from the catalog at a scheduled price, not a free-typed amount, and in Texas the rekey itself isn't the resident's cost except in the case above.

## Utility Transfer

For utilities the resident pays directly, the operator needs the resident's account to start on the move-in date and the owner's vacant-unit account to stop the same day; at move-out the reverse, so the unit never goes dark and the owner never pays a resident's usage.

- **Responsibility per utility, per lease.** Electric might be the resident's account with the utility, water billed back by the operator, trash in the rent. The lease records which, and only resident-direct utilities need a transfer; billed-back ones start a billing schedule instead (Utilities & Energy).
- **Verify the start, don't trust it.** The readiness check needs evidence that an account exists in the resident's name from the move-in date: a confirmation number the resident enters, a document, or a utility or connection-service feed. Record the method and who verified it.
- **Vacant-unit accounts.** Between residents the owner keeps service on for the make-ready. Where the utility offers a landlord revert agreement, service reverts to the owner's account when a resident closes theirs; the platform records the expected revert date at move-out and flags units where the resident's account stayed open or the revert didn't happen, because the next utility invoice lands on the owner.
- **Final readings and unpaid utilities.** At move-out, the meter reading date and any operator-billed utility balance flow into the final statement; New York, for example, allows deductions for unpaid utility charges payable directly to the landlord under the lease (GOL 7-108(1-a)(b)).

## Transfers Between Units

A transfer moves a household from one unit to another at the same property or a sister property. It's a move-out and a move-in on the same day, and the core model treats it that way: the old lease ends, a new lease starts for the same household, and the new lease records which lease it came from ([The Core Data Model](/books/property-tech/property-business#the-core-data-model)).

What makes a transfer different from two unrelated moves:

- **The deposit can carry over.** Rather than refund and re-collect, the operator transfers the held deposit to the new lease's ledger. Do it as a pair of balanced entries between the two leases' deposit liabilities, with the old lease's deductions settled first, so each lease's ledger stays complete.
- **The old unit still gets a move-out inspection and a statement.** Damage in the old unit is charged on the old lease's statement; the deadline rules apply to the old tenancy's end even though the household didn't leave, and whether a deposit carried forward counts as "returned" is a question for the jurisdiction's rules and counsel, so record what the household agreed to in writing.
- **Two units on one day.** The household may hold keys to both for a day or two; the credential records and the occupancy query both need overlapping dates to be legal for one household and nobody else.
- **Different landlord of record.** A transfer to a property owned by a different entity means the deposit moves between trust accounts, not just between ledgers (Trust Accounting & the General Ledger).

## Move-Out

Move-out starts with notice and ends with a statement. In order:

1. **Notice.** The household gives notice or the lease isn't renewed; The Lease records it, with the notice date and the intended move-out date. That record triggers the pre-move-out inspection notice where a state requires one, a reminder of the forwarding address request, and the unit's return to market for pre-leasing.
2. **Forwarding address.** Ask for it in writing and store it with its date. In Texas the landlord isn't obligated to refund or itemize until the tenant gives a written forwarding address, though the tenant doesn't forfeit the deposit merely by not giving one (Prop. Code 92.107); everywhere, it's where the statement is mailed. Standardize and validate it like any address ([Capture](/docs/fundamentals/addresses#capture)).
3. **Pre-move-out inspection,** on request or by policy, with its itemized statement of proposed deductions.
4. **Possession returned.** Keys and credentials back, the date recorded as `leases.moved_out_on`. This date, not the lease end date, usually starts the deposit clock: "after the tenant has vacated the premises" in California, "after the date the tenant surrenders the premises" in Texas, after the tenant vacates in New York, and after "termination of the rental agreement and vacation of the premises" in Washington.
5. **Move-out inspection** promptly (Georgia: within three business days), with photos before any cleaning or repair where California requires them.
6. **Deductions and statement,** before the deadline, then the refund or the balance due.

**Abandonment** changes the start of the clock and adds a property problem. Washington starts its 30 days from when the landlord learns of the abandonment; Georgia lets the landlord inspect within a reasonable time after discovering the vacancy. What the operator may do with belongings left behind (notice, storage, sale or disposal) is state law covered in Landlord-Tenant Law as Data; this chapter records when abandonment was determined and on what evidence, because that timestamp sets the deadline.

## Deposit Deadlines as Rules Data

The deposit itemization rule is the clearest case in this chapter for [Rules as Data](/docs/architecture/rules-as-data): a handful of parameters per jurisdiction, effective-dated, that change by statute and decide real money. A selection, as of October 2026, from the statutes listed in References:

| Jurisdiction | Deadline | Clock starts | Itemization and evidence | If missed or in bad faith |
| --- | --- | --- | --- | --- |
| **California** | 21 calendar days | Tenant vacates | Itemized statement; copies of bills, invoices or receipts, and for the landlord's own labor the time spent and hourly rate, unless repair and cleaning deductions total $125 or less; a good-faith estimate when repairs take longer; photos as above | Bad-faith retention: statutory damages up to twice the deposit, plus actual damages (Civ. Code 1950.5(h), (m)) |
| **Texas** | 30 days | Tenant surrenders the premises | Written description and itemized list of deductions | Missing the 30 days presumes bad faith; bad faith costs $100, three times the amount wrongfully withheld, and attorney's fees (Prop. Code 92.103, 92.109) |
| **New York** | 14 days | Tenant vacates | Itemized statement of the amount retained | The landlord forfeits any right to retain any portion; willful violation adds punitive damages up to twice the deposit (GOL 7-108(1-a)(e), (g)) |
| **Florida** | 15 days to return if no claim; 30 days to give notice of a claim | Termination of the rental agreement | Written notice of intention to impose a claim, by certified mail or e-mail under 83.505; the tenant has 15 days to object; the balance is due within 30 days of the notice | Late notice forfeits the right to impose a claim on the deposit (Stat. 83.49(3)) |
| **Washington** | 30 days | Termination and vacation, or the landlord learning of abandonment | Full and specific statement; copies of estimates received or invoices paid; for staff repairs, time and hourly rate | Liable for the full deposit if late; up to two times the deposit at the court's discretion for intentional refusal (RCW 59.18.280) |
| **New Jersey** | 30 days | Termination of the lease | Itemized list by personal delivery or registered or certified mail, with interest | Double the amount owed, plus court costs (N.J.S.A. 46:8-21.1) |

Each row's parameters are what the platform stores: deadline length and unit (calendar days, business days), the event that starts the clock, required delivery methods, the itemization threshold, the evidence required per deduction, whether a forwarding address gates the obligation, and the penalty for the record. Store the computed due date on the statement when the clock starts, with the rule version that produced it, so a later statute change doesn't move a deadline that was already running ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)). Cities add their own layers (deposit caps, interest, extra notices), and the rule resolver has to walk from the property's address to every jurisdiction that applies; Landlord-Tenant Law as Data owns that resolution and the full matrix.

**Normal wear and tear is not deductible,** everywhere in the table. California limits deductions to unpaid rent, damage beyond ordinary wear and tear, cleaning to return the unit to its move-in level of cleanliness, and, if the lease allows, restoring personal property, and bars charging for preexisting conditions (Civ. Code 1950.5(b), (e)); New York and Washington state the same exclusion. The statutes don't define the line item by item, so the platform's job is to make the call reviewable: each deduction says what was damaged, how it compares with the move-in record, and why it isn't wear.

**Interest-bearing deposits** are a pointer here. Massachusetts requires a separate interest-bearing account in a Massachusetts bank and annual interest; New Jersey's refund includes the tenant's share of interest; Florida sets interest options when a deposit is held in an interest-bearing account or under a surety bond (Stat. 83.49(1)). Insurance, Deposits & Guarantees and Trust Accounting & the General Ledger own the custody and the accrual; the final statement only adds the interest owed as a credit line.

## Damage Charges

A deduction is a charge on the resident's ledger like any other, posted from the charge catalog, and then settled by applying the deposit. That keeps the deposit statement, the resident ledger and the owner's ledger the same entries ([The Core Data Model](/books/property-tech/property-business#the-core-data-model)).

- **Charge codes, not free text.** Cleaning, carpet replacement, paint, blinds, lost keys, trash removal, rekey where lawful, unpaid utilities: each a code with a default price or a cost-based method. A price list per property makes charges consistent across residents, which is also the fair housing answer to "why did they pay more than me" (Fair Housing).
- **Cost evidence by state.** California and Washington want invoices or estimates for third-party work and time-and-rate for the landlord's own staff. The resident-billable work order from the make-ready carries both: the vendor invoice, or the technician's time and the hourly rate in force, so the deduction cites the work order rather than re-keying a number.
- **Depreciation and useful life.** Replacing a carpet that was already near the end of its life at the household's expense charges them for wear. The common practice is to prorate replacement cost by remaining useful life: store each depreciable item's install date and useful life in the asset register (Maintenance & Work Orders), and compute the chargeable share as replacement cost times remaining life over total life. The useful-life table is policy data per tenant, versioned, and the deduction records the inputs it used.
- **Photo evidence per deduction.** Each deduction links to the move-out inspection item and its move-in counterpart, with photos. California requires the landlord to provide the photographs taken under its 2025 rules with deductions for repairs or cleaning, by mail, e-mail, flash drive or an online link (Civ. Code 1950.5(h)(2)(D)); elsewhere they're simply what wins disputes.
- **Charges after the statement.** A repair whose invoice arrives after the deadline is the classic trap. California allows a good-faith estimate when repairs can't reasonably be completed within 21 days, with the documentation due within 14 days after the work is finished or the invoice received (Civ. Code 1950.5(h)(3)); Washington accepts copies of estimates received. Encode it per rule: whether estimates are allowed and the follow-up obligation they create.

## The Final Account Statement

The statement is the household's last view of its ledger: every unpaid charge, every deduction, the deposit and any interest held, and the result. In outline:

```text
deposit held                          1,500.00
+ interest owed (where required)          6.25
- unpaid rent and fees                  250.00   (from the ledger)
- damage and cleaning deductions        410.00   (itemized, each with evidence)
= refund due to the household           846.25   or a balance due if negative
```

- **Apply the deposit, then settle the difference.** The deposit is a liability to the household; at move-out it's applied to open charges like a payment, in the application order the state and lease allow (Charges & Resident Ledgers), and any remainder is a refund payable.
- **Refund to whom.** Joint leaseholders share one deposit. Some operators split the refund by leaseholder, others issue one check payable to all; the choice is lease terms and state law, and it's recorded per statement. A guarantor isn't owed the refund unless the lease says so.
- **Refund how.** ACH to an account on file is faster than a check and has a clean trail ([ACH & Bank Transfers](/books/payments/ach)); a check to the forwarding address satisfies the mailing rules. Record the method, the date sent and proof of delivery where a statute names the method (Florida's certified mail or e-mail, New Jersey's registered or certified mail).
- **Balance due.** A negative result is a receivable from a former resident. It gets a demand, a payment window, and then the path in Delinquency, Collections & Eviction (collection agencies, reporting, and the debt collection rules that start applying). The statement and its evidence are what the collector inherits, so they must be complete.
- **Unclaimed refunds.** A refund check that's never cashed is still the household's money. After the state's dormancy period it's reported and remitted as unclaimed property; Trust Accounting & the General Ledger owns escheat. This chapter's job is to flag refunds outstanding and keep the household's last known address.

**Deposit alternatives change the end.** When the household bought a surety bond or a deposit waiver instead of paying a deposit, there is no deposit to apply; the operator itemizes the same way and files a claim with the provider for the covered amount, and the provider may then pursue the household. Whether the household understood that, how claims are documented, and how the state's deposit rules treat the alternative belong to Insurance, Deposits & Guarantees. RealPage pitches its deposit alternatives as a way to "tackle bad debt," which is exactly why claim evidence has to meet the same standard as a deduction.

## How to Build It

The chapter extends `leases` and `work_orders` from [The Core Data Model](/books/property-tech/property-business#the-core-data-model), posts damage through `charges`, and adds inspection, credential, utility and statement tables. Amounts in minor units ([Money & Amounts](/docs/payments/money)); every table carries `tenant_id` under row-level security.

```sql
ALTER TABLE leases
  ADD COLUMN transferred_from_lease_id UUID REFERENCES leases (id),  -- a transfer, not a renewal
  ADD COLUMN abandonment_found_at      TIMESTAMPTZ;   -- sets the deposit clock where the rule says so

ALTER TABLE work_orders
  ADD COLUMN inspection_item_id UUID,                -- the finding this work came from
  ADD COLUMN labor_minutes      INT,                 -- staff labor, for time-and-rate itemization
  ADD COLUMN hourly_rate        BIGINT;              -- minor units, the rate in force

CREATE TABLE inspections (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  property_id         UUID NOT NULL REFERENCES properties (id),
  unit_id             UUID NOT NULL REFERENCES units (id),
  lease_id            UUID REFERENCES leases (id),   -- null for make-ready and vacant checks
  kind                TEXT NOT NULL CHECK (kind IN ('move_in', 'pre_move_out', 'move_out',
                        'make_ready', 'periodic')),
  baseline_id         UUID REFERENCES inspections (id),  -- the move-in this move-out compares to
  template_code       TEXT NOT NULL,
  template_version    INT NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('offered', 'scheduled', 'in_progress',
                        'completed', 'signed', 'disputed', 'cancelled')),
  requested_by_tenant BOOLEAN NOT NULL DEFAULT FALSE,    -- CA and NY pre-move-out are on request
  notice_sent_at      TIMESTAMPTZ,                   -- the 48-hour notice, where required
  scheduled_for       TIMESTAMPTZ,
  rule_version_id     UUID,                          -- the rule that required or shaped it
  performed_by_kind   TEXT NOT NULL CHECK (performed_by_kind IN ('staff', 'vendor', 'resident')),
  performed_by_id     UUID NOT NULL,                 -- a user or a person, per kind
  resident_present    BOOLEAN,
  completed_at        TIMESTAMPTZ,
  sealed_hash         TEXT,                          -- of the completed record and its media hashes
  supersedes_id       UUID REFERENCES inspections (id),  -- amendments are new versions
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inspection_items (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  inspection_id      UUID NOT NULL REFERENCES inspections (id),
  area               TEXT NOT NULL,                  -- 'kitchen', 'bedroom_2'
  item               TEXT NOT NULL,                  -- 'carpet', 'blinds', 'range'
  condition          TEXT NOT NULL CHECK (condition IN ('new', 'good', 'fair', 'poor',
                       'damaged', 'missing', 'dirty', 'not_present')),
  notes              TEXT,
  baseline_item_id   UUID REFERENCES inspection_items (id),
  attribution        TEXT CHECK (attribution IN ('wear', 'preexisting', 'resident', 'unknown')),
  resident_comment   TEXT,                           -- disputes are item by item
  media              JSONB NOT NULL DEFAULT '[]',    -- [{sha256, captured_at, received_at, source}]
  asset_id           UUID,                           -- the register entry, for useful life
  UNIQUE (inspection_id, area, item)
);

CREATE TABLE key_issuances (                         -- every way in, per person
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  lease_id           UUID NOT NULL REFERENCES leases (id),
  person_id          UUID NOT NULL REFERENCES people (id),
  credential_kind    TEXT NOT NULL CHECK (credential_kind IN ('physical_key', 'mailbox_key',
                       'fob', 'card', 'garage_remote', 'keypad_code', 'mobile_credential')),
  label              TEXT NOT NULL,                  -- key tag, fob serial; never a code itself
  external_ref       TEXT,                           -- the access system's credential id
  issued_at          TIMESTAMPTZ NOT NULL,
  issued_by          UUID NOT NULL,
  returned_at        TIMESTAMPTZ,
  revoked_at         TIMESTAMPTZ,
  charge_id          UUID REFERENCES charges (id),   -- lost-key charge, if any
  CHECK (returned_at IS NULL OR returned_at >= issued_at)
);

CREATE TABLE utility_transfers (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  lease_id           UUID NOT NULL REFERENCES leases (id),
  unit_id            UUID NOT NULL REFERENCES units (id),
  utility            TEXT NOT NULL CHECK (utility IN ('electric', 'gas', 'water', 'sewer',
                       'trash', 'internet')),
  direction          TEXT NOT NULL CHECK (direction IN ('start', 'stop')),
  provider_name      TEXT NOT NULL,
  account_last4      TEXT,                           -- enough to verify, not to impersonate
  effective_on       DATE NOT NULL,                  -- resident start, or stop and revert
  revert_expected    BOOLEAN NOT NULL DEFAULT FALSE, -- landlord revert agreement on file
  verified_at        TIMESTAMPTZ,
  verified_method    TEXT CHECK (verified_method IN ('resident_entered', 'document',
                       'provider_feed', 'staff_call')),
  verified_by        UUID,
  UNIQUE (lease_id, utility, direction)
);

CREATE TABLE deposit_return_rules (                  -- effective-dated, per jurisdiction
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction          TEXT NOT NULL,               -- 'US-CA', or a city code
  deadline_days         INT NOT NULL,
  deadline_unit         TEXT NOT NULL CHECK (deadline_unit IN ('calendar', 'business')),
  clock_starts          TEXT NOT NULL CHECK (clock_starts IN ('vacated', 'surrendered',
                          'termination', 'termination_and_vacated')),
  claim_notice_days     INT,                         -- FL: notice of claim within 30
  forwarding_address_gates BOOLEAN NOT NULL,         -- TX 92.107
  itemize_threshold     BIGINT,                      -- CA: receipts not required at or under $125
  receipts_required     BOOLEAN NOT NULL,
  photos_required       BOOLEAN NOT NULL,
  estimates_allowed     BOOLEAN NOT NULL,
  delivery_methods      TEXT[] NOT NULL,             -- {'first_class_mail', 'certified_mail', 'email'}
  penalty_note          TEXT NOT NULL,               -- for staff, with the citation
  citation              TEXT NOT NULL,
  valid_during          DATERANGE NOT NULL,
  EXCLUDE USING GIST (jurisdiction WITH =, valid_during WITH &&)
);

CREATE TABLE move_out_statements (                   -- the deposit itemization and final account
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  lease_id              UUID NOT NULL REFERENCES leases (id),
  rule_id               UUID NOT NULL REFERENCES deposit_return_rules (id),
  clock_started_on      DATE NOT NULL,
  due_on                DATE NOT NULL,               -- computed once, stored
  forwarding_address    JSONB,                       -- standardized; with the date received
  forwarding_received_on DATE,
  deposit_held          BIGINT NOT NULL,
  interest_owed         BIGINT NOT NULL DEFAULT 0,
  open_charges          BIGINT NOT NULL,             -- unpaid ledger balance at statement time
  deductions_total      BIGINT NOT NULL,
  result                BIGINT NOT NULL,             -- positive: refund; negative: balance due
  currency              CHAR(3) NOT NULL,
  status                TEXT NOT NULL CHECK (status IN ('draft', 'issued', 'refund_sent',
                          'refund_cashed', 'balance_due', 'sent_to_collections',
                          'escheat_pending', 'closed')),
  issued_at             TIMESTAMPTZ,
  delivery_method       TEXT,
  delivery_evidence     TEXT,                        -- tracking number, message id
  document_sha256       TEXT,                        -- the rendered statement as sent
  supersedes_id         UUID REFERENCES move_out_statements (id),
  CHECK (result = deposit_held + interest_owed - open_charges - deductions_total)
);

CREATE TABLE move_out_deductions (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  statement_id       UUID NOT NULL REFERENCES move_out_statements (id),
  charge_id          UUID NOT NULL REFERENCES charges (id),   -- posted with a charge code
  category           TEXT NOT NULL CHECK (category IN ('damage', 'cleaning', 'keys',
                       'utilities', 'other')),
  inspection_item_id UUID REFERENCES inspection_items (id),
  work_order_id      UUID REFERENCES work_orders (id),        -- the invoice or the labor
  is_estimate        BOOLEAN NOT NULL DEFAULT FALSE,
  replacement_cost   BIGINT,                                  -- before depreciation
  useful_life_months INT,
  age_months         INT,
  amount             BIGINT NOT NULL CHECK (amount > 0),
  explanation        TEXT NOT NULL                            -- why this is not wear
);
```

The readiness gate is a query, not a column, so it can't drift from the records it reads:

```sql
SELECT l.id,
       l.status = 'signed'                                         AS lease_signed,
       NOT EXISTS (SELECT 1 FROM work_orders w
                   WHERE w.unit_id = l.unit_id AND w.source = 'make_ready'
                     AND w.status NOT IN ('completed', 'cancelled'))   AS unit_ready,
       NOT EXISTS (SELECT 1 FROM charges c
                   WHERE c.lease_id = l.id AND c.due_on <= l.starts_on
                     AND c.amount > COALESCE((SELECT SUM(pa.amount)
                       FROM payment_applications pa WHERE pa.charge_id = c.id), 0))
                                                                   AS funds_paid,
       NOT EXISTS (SELECT 1 FROM utility_transfers u
                   WHERE u.lease_id = l.id AND u.direction = 'start'
                     AND u.verified_at IS NULL)                    AS utilities_verified
FROM leases l
WHERE l.tenant_id = $1 AND l.starts_on = $2;
-- insurance verification joins Insurance, Deposits & Guarantees' policies table;
-- the rekey check joins work orders after the prior lease's moved_out_on.
```

Design decisions behind it:

- **Deductions are charges.** Each `move_out_deductions` row points at a posted `charges` row, so the statement, the resident ledger and the owner's ledger reconcile by construction, and a corrected statement reverses charges rather than editing them ([Append-Only Records](/docs/payments/payment-states#append-only-records)).
- **The deadline is stored, with its rule.** `due_on` and `rule_id` are written when the clock starts. A nightly job lists statements due within a few days, and a statement past `due_on` without `issued_at` is an incident, not a report line.
- **Statements are versioned documents.** The rendered statement's hash is stored; a correction is a new statement that supersedes the old, and both stay retrievable, as Proof of Service does for service reports.
- **Inspections are sealed.** Once completed and signed, an inspection is amended only by a superseding version, because the move-in record is evidence a year later.
- **Credentials store labels, never secrets.** A keypad code or mobile credential lives in the access system; this table records that it was issued and revoked.
- **Rules carry citations.** `deposit_return_rules.citation` and `penalty_note` exist so staff can see why the deadline is what it is, and so Landlord-Tenant Law as Data can audit coverage.

Events: `lease.moved_in`, `inspection.completed`, `key.issued`, `key.revoked`, `lease.moved_out`, `move_out_statement.issued`, `move_out_statement.overdue` and `deposit_refund.uncashed` feed notifications, owner reporting and the trust ledger ([Events & Async Messaging](/docs/architecture/events)).

## Auditing

Deposit disputes, small claims cases and attorney general complaints turn on a few records:

- **The move-in baseline.** The inspection as completed and signed, its photos with hashes and both clocks, and who captured them. Without it, every move-out deduction is the operator's word against the household's.
- **The clock.** When possession was returned or abandonment determined, the forwarding address and when it arrived, the rule version that set the deadline, and when and how the statement was delivered, with proof.
- **Each deduction's chain.** Inspection item, move-in counterpart, work order, invoice or labor record, depreciation inputs and the explanation, linked rather than retyped.
- **Credential custody.** What was issued to whom, what came back, what was revoked and when, and the rekey between households where the law requires one.
- **Overrides of the readiness gate,** with the user, the reason and the condition that was outstanding.
- **Refund disposition.** Sent, cashed, returned, reissued, or reported as unclaimed.

The general mechanics are in [Audit Trails](/docs/architecture/audit-trails); how long each record is kept, and the statute of limitations it's measured against, is in Records, Privacy & Audits.

## What This Means for the System You Build

- **Make move-in a gate of computed checks** (lease, make-ready, funds, insurance, utilities, inspection, rekey) with recorded overrides, and show the same list to the resident.
- **Treat inspections as evidence:** item by item against the move-in baseline, captured offline, hashed, signed or disputed by the resident, and sealed.
- **Encode inspection and deposit laws as effective-dated rules** with citations, resolved from the property's jurisdiction, including the notices they trigger.
- **Store the deposit deadline when the clock starts,** with the rule that set it, and alert before it, never after.
- **Issue and revoke credentials per person,** and block move-out completion until every credential is returned or revoked.
- **Record utility responsibility per utility and verify starts and reverts** so the owner never pays for a resident's usage or a dark unit.
- **Post every deduction as a charge from the catalog,** citing the inspection item, the work order and its cost, prorated by useful life.
- **Render the final statement as a versioned document,** delivered by the method the state requires, with proof.
- **Follow every refund to the end:** cashed, reissued, sent to collections as a balance due, or escheated as unclaimed property.
- **Handle transfers as a move-out and a move-in** on linked leases, with the deposit moved by balanced entries.

## References

**Statutes, as of October 2026**

- [California Civil Code 1950.5 (FindLaw, current as of January 1, 2026)](https://codes.findlaw.com/ca/civil-code/civ-sect-1950-5/), permitted uses of the deposit and ordinary wear and tear, the pre-move-out inspection on request (two weeks, 48 hours' notice, itemized statement), move-in photos for tenancies from July 1, 2025 and move-out photos from April 1, 2025, the 21-day deadline, receipts and labor itemization, the $125 threshold, estimates, damages up to twice the deposit for bad faith
- [Washington RCW 59.18.260](https://app.leg.wa.gov/rcw/default.aspx?cite=59.18.260), the written move-in checklist or statement as a condition of collecting a deposit, signatures, copy to the tenant, liability for the deposit without it
- [Washington RCW 59.18.280](https://app.leg.wa.gov/rcw/default.aspx?cite=59.18.280), the 30-day statement, abandonment, delivery methods, estimates and invoices, staff time and hourly rate, wear exclusion, full deposit liability and up to twice the deposit
- [Texas Property Code 92.103](https://texas.public.law/statutes/tex._prop._code_section_92.103), refund within 30 days after surrender; advance-notice-of-surrender conditions must be conspicuous
- [Texas Property Code 92.107](https://texas.public.law/statutes/tex._prop._code_section_92.107), the written forwarding address condition, without forfeiture
- [Texas Property Code 92.109](https://texas.public.law/statutes/tex._prop._code_section_92.109), bad faith liability of $100, three times the amount withheld and attorney's fees; the 30-day presumption
- [Texas Property Code 92.156](https://texas.public.law/statutes/tex._prop._code_section_92.156), rekeying within seven days after tenant turnover at the landlord's expense, and the early-move-out exception
- [New York General Obligations Law 7-108](https://www.nysenate.gov/legislation/laws/GOB/7-108), one month's rent limit, move-in inspection on request, pre-move-out inspection notice and window, the 14-day itemized statement, forfeiture, wear and tear, unpaid utilities, burden of proof, punitive damages up to twice the deposit
- [Florida Statutes 83.49 (2025)](https://www.flsenate.gov/Laws/Statutes/2025/83.49), the 15-day return, 30-day notice of claim by certified mail or e-mail, the tenant's 15-day objection, forfeiture of the claim, interest options
- [New Jersey Statutes 46:8-21.1 (FindLaw)](https://codes.findlaw.com/nj/title-46-property/nj-st-sect-46-8-21-1/), return within 30 days with interest, itemization by personal delivery or registered or certified mail, double the amount owed
- [Georgia Code 44-7-33 (FindLaw)](https://codes.findlaw.com/ga/title-44-property/ga-code-sect-44-7-33/), the move-in list of existing damage, the move-out inspection within three business days, the tenant's five business days, signed lists as conclusive evidence, written disputes
- [Michigan Compiled Laws 554.608](https://www.legislature.mi.gov/Laws/MCL?objectName=mcl-554-608), commencement and termination inventory checklists, the 7-day return, the boldface notice
- [Fletcher Tilton: How to accept and maintain a security deposit properly from a residential tenant](https://www.fletchertilton.com/how-to-accept-and-maintain-a-security-deposit-properly-from-a-residential-tenant/), Massachusetts G.L. c. 186, 15B: the statement of condition within ten days, the tenant's fifteen days, the separate interest-bearing account and interest, treble damages for specified violations

**Platforms**

- [RealPage: Property management software](https://www.realpage.com/property-management-software/), OneSite move-ins, move-outs, transfers and final account statements; move-out automation; deposit alternatives
- [RealPage: Maintenance management](https://www.realpage.com/property-management-software/maintenance-management/), mobile inspections and offline auto-sync
- [AppFolio Property Manager](https://www.appfolio.com/property-manager), Inspections & Unit Turns in the Core plan
- [AppFolio: zInspector partner page](https://www.appfolio.com/partners/zinspector), inspections triggered from move-in and move-out data, reports in unit history, issues synced as work orders
- [Buildium: Features](https://www.buildium.com/features/), inspection reports filed in the field
- [Entrata: Facility management](https://www.entrata.com/products/facility-management), InspectionManager, photos and digital sign-off, the move-out form's resident charges, resident billing for time and materials
- [Entrata: Homebody app](https://www.entrata.com/products/homebody-app), Homebody Move, the digital move-in and move-out checklist
- [Entrata: Entrata partners with Amenify](https://www.entrata.com/press/entrata-partners-with-amenify), the $50 move-in credit and resident services
- [RentCafe](https://www.rentcafe.com/), the move-in checklist and adding renters insurance during leasing
- [Yardi Breeze: Inspections made easy](https://www.yardibreeze.com/blog/2018/11/inspections-in-yardi-breeze), pass or fail by area with notes and photos, maintenance requests from the inspection, move-in and move-out guidance
- [Rent Manager: Built-in security deposit management](https://www.rentmanager.com/security-deposits/), Rentable's per-state escrow accounts, return deadlines, interest, itemized statements, ACH refunds, uncashed checks and escheatment

**Inspection specialists**

- [HappyCo: Best mobile inspection app](https://happy.co/comparisons/best-mobile-inspection-app), move-in, move-out and make-ready walks, offline capture, findings as work orders, two-way PMS sync
- [RentCheck on the App Store](https://apps.apple.com/app/id1134017691), resident-completed inspections with time-stamped photos, AppFolio and Rent Manager integrations
