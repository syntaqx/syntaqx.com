+++
title = "Delinquency, Collections & Eviction"
nav_title = "Delinquency & Eviction"
description = "From late rent to judgment: notices by state and program, payment plans, eviction filings, sealing, counsel, collections after move-out and assistance."
category = "Property Tech Industry"
order = 1720
part = "Rent and Resident Money"
tags = ["property-tech", "delinquency", "eviction", "collections", "fdcpa", "rental-assistance"]
+++

Delinquency is where every other chapter in this part is tested. A balance that ages past the grace period starts a sequence the law scripts closely: reminders, a late fee within the state's cap, a written notice with a statutory period and statutory content, sometimes a federal notice on top, a court filing, a hearing, a judgment, a writ, and only then possession. Along the way the household may pay in full and be reinstated, sign a payment plan, receive rental assistance the landlord may be required to accept, file for bankruptcy, turn out to be a servicemember, or get a lawyer the city provides. After move-out, an unpaid balance becomes a collection account, regulated as consumer debt, often handed to an agency and reported to credit bureaus. Every step leaves a record a court, a regulator or the resident's lawyer will read. This chapter covers the delinquency workflow as the platform has to run it: the notices, payment plans, filings and their aftermath, collections after move-out, and rental assistance. Collection agency basics under the FDCPA are in the Field Operations volume's [Collection Agencies and the Law](/books/field-operations/collections-and-retention#collection-agencies-and-the-law); this chapter covers what rent changes.

## How the Platforms Do It

Delinquency features cluster in three places: automated outreach, notice and filing workflows, and handoff to collections.

- **AI outreach is the newest layer.** Entrata's Payments AI handles balance inquiries, late notices and payment plans over email and SMS, with communication logs and reporting, and its page says residents "often believe they're chatting with a real person". Whether an agent discloses that it's an AI is a legal question in a growing number of places ([Telling People They're Talking to an AI](/docs/compliance/consumer-contact#telling-people-they-re-talking-to-an-ai)), and collection messages are among the most regulated a platform sends.
- **Delinquency and collections management is core.** Yardi Breeze lists managing delinquencies and collections; every suite produces aged receivables, delinquency lists and notice batches from the [resident ledger](/books/property-tech/charges-and-resident-ledgers#the-resident-ledger-and-the-general-ledger).
- **Collections are a partner category.** RealPage's integration marketplace has a "Collections" category, and Hunter Warfield, a collection agency, appears among its partners, describing a relationship that "began over a decade ago". Placement files and payment feedback run over those integrations.
- **Eviction filing is mostly outside the suites.** Operators use local counsel and filing services; the platform's job is to produce the ledger, the notices and proof of service they need, and to receive status back.

The vocabulary differs by vendor; the workflow doesn't. It's a case with stages and holds, driven by deadlines computed from the jurisdiction's rules.

## Notices

A notice to pay or quit is the hinge of the process: get it wrong and the case is dismissed and starts over, weeks later, with a larger balance. Notice rules vary by state on period, counting, content and service, as of October 2026:

| Jurisdiction | Period | How it's counted | Content the statute requires |
| --- | --- | --- | --- |
| **California** (CCP 1161(2)) | Three days | Excluding Saturdays, Sundays and judicial holidays | The amount due; the name, phone and address of the person to pay; in-person payment days and hours; or bank account and institution within five miles; or a previously established EFT procedure |
| **New York** (RPAPL 711(2)) | Fourteen days | From service under RPAPL 735 | A demand to pay or surrender possession, with a statement whether the unit is covered by the Good Cause Eviction law (and why not, if exempt), through June 15, 2034 |
| **Texas** (Property Code 24.005) | Three days' notice to vacate, unless the lease sets another period | From the day the notice is delivered | May include a demand to pay or vacate if the landlord gave a prior written notice that rent was due |
| **Covered federal properties** (CARES Act, 15 U.S.C. 9058(c)) | Thirty days before the tenant must vacate | | Applies to properties in covered federal housing programs or with federally backed mortgage loans, including Fannie Mae and Freddie Mac loans |

Federal program rules sit on top and are in motion. HUD's December 2024 final rule required public housing agencies and owners of project-based rental assistance properties to give tenants written notice 30 days before filing an eviction for nonpayment. On February 26, 2026 HUD published an interim final rule revoking that requirement (returning to pre-2021 periods of 5 to 30 days by program and state law), then on March 13, 2026 delayed its March 30 effective date indefinitely, pending a final rule, and said it would treat the interim rule as a proposed one. As of October 2026 I found no later final rule, so the 2024 requirement still governs those properties. USDA's Rural Housing Service, separately, published a rule on February 25, 2026 rescinding its own 30-day notice requirement for Section 515 and 514 properties. Federal-program notice periods are the clearest case in this book for keeping rules as effective-dated data ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)): the right answer changed three times in fifteen months.

Notices are generated, not typed:

- **The amount is computed at generation time** from the ledger, and includes only what the jurisdiction allows a nonpayment notice to demand. In Washington, possession can be conditioned only on rent; in Colorado and Oregon, unpaid late fees can't support a nonpayment termination; Oregon allows a fee on the notice only if the tenant is told they can cure by paying rent alone ([Late Fees](/books/property-tech/charges-and-resident-ledgers#late-fees)). The notice generator uses each charge code's "counts as rent" resolution for the lease and jurisdiction, and the subsidy portion of an assisted lease is never demanded from the household ([Subsidized & Affordable Housing](/books/property-tech/affordable-housing#the-owner-side)).
- **The deadline is computed and stored,** counting the jurisdiction's way (court days, calendar days, from delivery), with the property's holiday calendar ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **Content comes from versioned templates per jurisdiction,** including required statements (payment instructions in California, the Good Cause statement in New York, federal notices for covered properties), with the template version recorded.
- **Service is evidence.** Who served it, how (personal delivery, posting and mailing, electronic where allowed), when, and the proof (a signed declaration, photos, tracking). Without it, the notice didn't happen.
- **Every notice goes to every adult the lease names,** in the language the jurisdiction requires.

Landlord-Tenant Law as Data covers maintaining these rules across jurisdictions; this chapter's tables store which rule version produced each notice.

## Payment Plans

Most delinquencies end in payment, often in installments. A payment plan is an agreement: a schedule of amounts and dates, the balance it covers, whether ongoing rent must also be paid on time, what happens on a missed installment, and whether the landlord pauses notices or the case while it's kept. It's signed (by the resident, electronically, per [Electronic Signatures & Records](/docs/compliance/electronic-signatures)) because in some states the written agreement is what preserves the landlord's rights when it accepts partial payment: Oregon treats acceptance of partial rent after a nonpayment notice as a waiver unless the parties sign an agreement saying it isn't ([Partial Payments](/books/property-tech/collecting-rent#partial-payments)).

For the platform:

- **The plan is its own record** with installments, each matched to payments as they arrive, and a status (current, missed, completed, broken).
- **It changes payment acceptance.** A lease under a plan accepts partial payments again; a broken plan returns to the state the case was in ([Payment Blocking](/books/property-tech/collecting-rent#payment-blocking)).
- **It pauses the clock it should pause,** and only that: late fees on the planned balance per the agreement and law, notices and filing if the agreement says so.
- **AI agents can offer plans only inside policy.** An agent that offers a payment plan is making the business's promise ([The AI's Promises Are the Business's Promises](/docs/architecture/ai-agents#the-ai-s-promises-are-the-business-s-promises)): the terms it may offer are data the operator sets, and anything outside them goes to a person.

## Eviction Filings

When the notice period ends without payment, the landlord may file. The filing is a court case with its own parties, numbers and deadlines, and the platform's job is to hand counsel or a filing service a complete, correct package and track what follows:

- **The package.** The lease and addenda as signed, the ledger (resident portion only, with every charge's code and every payment), the notice with proof of service, the rule version used, required federal and local certifications (for example, whether the property is a CARES Act covered property), and the household's names as on the lease.
- **Who files.** Whether an entity landlord must appear through an attorney is a court rule that varies by jurisdiction; either way, the owner of record (the lease's landlord entity) is the plaintiff, not the manager ([The Core Data Model](/books/property-tech/property-business#the-core-data-model)). The case record names both.
- **Status back.** Filed, served, hearing set, settled, dismissed, judgment (for possession, for money, or both), writ issued, writ executed, appeal; with dates and the court's case number.
- **Payment acceptance follows the case.** On filing, the delinquency workflow writes a `lease_payment_acceptance` row (typically `full_balance_only` or `none` with reason `eviction_filed`) so self-service channels stop taking partial payments that could waive the case, while payments the law requires accepting still get through: Washington lets a tenant reinstate by paying rent, costs, limited late fees and awarded fees before or shortly after judgment, and requires accepting a pledge of emergency rental assistance covering the full rent before the pay-or-vacate notice expires (RCW 59.18.410). Every refused payment is logged with its reason.
- **No self-help.** Possession comes from a writ executed by an officer, never from changing locks, removing doors, or shutting off utilities. Access, Smart Buildings & Parking covers why a smart lock must not be usable to lock out a resident.

**Holds stop everything at once.** Several events must pause the case and every collection path in parallel:

- **Bankruptcy.** A petition operates as an automatic stay from the moment it's filed ([Collection Agencies and the Law](/books/field-operations/collections-and-retention#collection-agencies-and-the-law)); the eviction, late fees, autopay retries and placements stop until counsel decides.
- **Military service.** Under the Servicemembers Civil Relief Act, a landlord may not evict a servicemember or dependents from a residence with rent under a threshold (a base of $2,400 a month, adjusted annually and published by the Secretary of Defense) except by court order; the court must stay proceedings for 90 days on request when service materially affects the ability to pay, and knowingly evicting outside a court order is a crime (50 U.S.C. 3951). Military & Specialty Housing covers verification of status.
- **Pending rental assistance,** where the law or the program requires a pause (Washington requires suspending court action for 14 court days after the landlord provides payment information for a pledge).
- **A dispute or a court order.**

One `hold` concept on the case, checked by every path (notices, filings, late fees, autopay, outreach, placements), is the only reliable way to stop all of them; a hold that reaches four of five paths still violates the stay.

**Right to counsel and sealing** change what happens after filing. New York City provides free lawyers to tenants facing eviction in Housing Court and NYCHA proceedings, in every ZIP code and regardless of immigration status, and other cities and states have adopted their own right-to-counsel programs, so cases take longer and settle more often, and settlements (stipulations) need tracking as payment plans with court consequences. Courts increasingly limit public access to eviction records: California restricts access to limited civil eviction records to parties, people who can name a party and the address, residents, and court order, opening them to the public only after a judgment for the landlord on statutory timelines, and never for nonpayment cases filed between March 4, 2020 and September 30, 2021 (CCP 1161.2). Sealing matters to the platform twice: the case record should carry a `sealed` flag that limits who in the operator's organization can see it, and screening must not use records the law has masked (Applications & Screening; Records, Privacy & Audits).

## Collections After Move-Out

When a household leaves owing money (after an eviction, a skip, or a move-out with damage beyond the deposit), the balance becomes a final account: the deposit or its alternative is applied and itemized within the state's deadline (Move-In & Move-Out), claims are filed against any deposit alternative or guarantee ([Insurance, Deposits & Guarantees](/books/property-tech/insurance-deposits-and-guarantees#deposit-alternatives)), and what remains is a debt. Then:

- **In-house collection** by the landlord or manager in its own name is creditor collection. Using a different name that suggests a third party is collecting makes the creditor a debt collector under the FDCPA.
- **Placement with an agency** sends a file (debtor identity, last address, itemized balance by itemization date, the lease, the final account statement, any disputes), and the agency, a debt collector, owes the validation notice, contact limits and the rest of Regulation F. The integration needs a return path for agency payments, disputes, recalls and closures, so the ledger and the agency's balance agree ([Collection Agencies and the Law](/books/field-operations/collections-and-retention#collection-agencies-and-the-law) has the rules).
- **Licensing reaches the vendor.** States license collection agencies, and some define collection broadly enough to reach software companies that send collection messages or collect payments on a landlord's behalf. Entrata's S-1 discloses a putative class action in Prince George's County, Maryland alleging it violated the Maryland Collection Agency Licensing Act. As of October 2026, the theory is being litigated, not settled. A platform whose agents send collection messages for operators should keep, per state, whether that activity needs a license and who holds it, and route accordingly ([Submetering Law and Licensing](/books/property-tech/utilities-and-energy#submetering-law-and-licensing) has the same question for utility billers).
- **Credit reporting.** Whoever reports the debt to a bureau is a furnisher with accuracy and dispute duties, and for accounts in collection must report the date of first delinquency ([Rent Reporting](/books/property-tech/resident-financial-products#rent-reporting) covers furnishing). A collector may not report before communicating with the consumer.
- **Write-off** moves the balance to bad debt in the GL while keeping it collectible; recoveries post as payments against the written-off charges ([Write-Offs](/docs/payments/accounting#write-offs)). Bad debt is a line on the owner's statement and a metric Operating Metrics defines.
- **Disputes and stops are global.** A dispute, a bankruptcy, a death or an identity theft claim stops every collection path and every furnishing at once, through the same hold as the case.

## Rental Assistance

Rental assistance turns a delinquency into a three-party transaction: the household applies to a program, the program pays the landlord (usually directly), and the landlord accepts conditions. The federal Emergency Rental Assistance programs were the largest example: $25 billion (ERA1, Consolidated Appropriations Act, 2021) and $21.55 billion (ERA2, American Rescue Plan Act of 2021), over $46 billion in all, paying rent, arrears, utilities and home energy costs through states, territories, local governments and tribes; ERA2's period of performance ended September 30, 2025. State and local programs continue at smaller scale, and some state laws now make accepting assistance part of the eviction process: Washington requires a landlord to accept a pledge of emergency rental assistance covering the full rent owed before the pay-or-vacate notice expires, to accept a written pledge that contributes to the total after it expires, to suspend court action for 14 court days after providing payment information, and to provide documentation needed to process the assistance (RCW 59.18.410).

For the platform:

- **An award is a record** with the program, the amount, the months it covers, the conditions the landlord accepted (commonly a period without eviction for nonpayment, or forgiveness of the remainder), and the documentation provided.
- **The payment is a third-party payment** applied by the program's terms (often to specific months' rent), not by the property's default application rule.
- **Conditions become holds and acceptance rules.** A no-eviction period is a hold on the case; an agreement to forgive the remainder is a reversal with a reason.
- **Assistance isn't a resident payment for blocking purposes.** A lease set to accept nothing from the resident must still accept an assistance payment the law or the program requires.

## How to Build It

The ledger chapter's `resident_ledger` view supplies aging; [Collecting Rent](/books/property-tech/collecting-rent#how-to-build-it) supplies `lease_payment_acceptance`, which this chapter's workflow writes. This chapter adds the case and everything that hangs off it:

```sql
CREATE TABLE delinquency_cases (         -- one per lease per delinquency episode
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  lease_id         UUID NOT NULL REFERENCES leases (id),
  opened_on        DATE NOT NULL,
  stage            TEXT NOT NULL CHECK (stage IN ('reminder', 'notice', 'plan', 'filed',
                     'judgment', 'possession', 'final_account', 'placed', 'written_off',
                     'resolved')),
  balance_at_open  BIGINT NOT NULL,       -- resident portion only
  holds            TEXT[] NOT NULL DEFAULT '{}',  -- 'bankruptcy', 'scra', 'assistance_pending',
                                                  -- 'dispute', 'court_order'
  resolved_on      DATE,
  resolution       TEXT CHECK (resolution IN ('paid', 'plan_completed', 'assistance',
                     'moved_out', 'written_off', 'settled', 'dismissed'))
);

CREATE TABLE legal_notices (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  case_id           UUID NOT NULL REFERENCES delinquency_cases (id),
  kind              TEXT NOT NULL CHECK (kind IN ('pay_or_quit', 'cure_or_quit',
                      'federal_30_day', 'cares_act_vacate', 'rent_demand', 'other')),
  rule_id           UUID NOT NULL,         -- the jurisdiction rule version used
  template_version  TEXT NOT NULL,
  amount_demanded   BIGINT,
  ledger_snapshot   JSONB NOT NULL,        -- the charges the amount came from
  addressees        UUID[] NOT NULL,       -- people on the lease
  served_on         TIMESTAMPTZ,
  service_method    TEXT,
  proof_document_id UUID,
  cure_deadline     DATE                   -- computed at service, stored
);

CREATE TABLE payment_plans (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  case_id          UUID NOT NULL REFERENCES delinquency_cases (id),
  covered_balance  BIGINT NOT NULL,
  requires_current_rent BOOLEAN NOT NULL DEFAULT TRUE,
  non_waiver_clause BOOLEAN NOT NULL,      -- where a written non-waiver agreement matters
  offered_by       TEXT NOT NULL,          -- a user or an agent, as a typed actor
  policy_id        UUID,                   -- the terms the offer had to fall inside
  signed_at        TIMESTAMPTZ,
  status           TEXT NOT NULL CHECK (status IN ('offered', 'active', 'completed',
                     'broken', 'cancelled'))
);

CREATE TABLE payment_plan_installments (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL,
  plan_id     UUID NOT NULL REFERENCES payment_plans (id),
  due_on      DATE NOT NULL,
  amount      BIGINT NOT NULL,
  paid_amount BIGINT NOT NULL DEFAULT 0,
  status      TEXT NOT NULL CHECK (status IN ('scheduled', 'paid', 'partial', 'missed'))
);

CREATE TABLE eviction_filings (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  case_id            UUID NOT NULL REFERENCES delinquency_cases (id),
  plaintiff_entity_id UUID NOT NULL REFERENCES legal_entities (id),  -- landlord of record
  court              TEXT NOT NULL,
  case_number        TEXT,
  counsel            TEXT,
  filed_on           DATE,
  status             TEXT NOT NULL CHECK (status IN ('prepared', 'filed', 'served',
                       'hearing_set', 'settled', 'dismissed', 'judgment', 'writ_issued',
                       'writ_executed', 'appealed', 'withdrawn')),
  judgment           JSONB,                -- possession, money amount, costs, fees
  possession_on      DATE,
  is_sealed          BOOLEAN NOT NULL DEFAULT FALSE,
  covered_federal_property BOOLEAN NOT NULL  -- CARES Act and program certifications
);

CREATE TABLE collection_placements (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  case_id         UUID NOT NULL REFERENCES delinquency_cases (id),
  agency_vendor_id UUID NOT NULL REFERENCES vendors (id),
  placed_on       DATE NOT NULL,
  placed_balance  BIGINT NOT NULL,
  itemization     JSONB NOT NULL,          -- by itemization date, for the validation notice
  status          TEXT NOT NULL CHECK (status IN ('placed', 'recalled', 'paid', 'closed',
                    'disputed', 'stopped')),
  last_synced_at  TIMESTAMPTZ
);

CREATE TABLE rental_assistance_awards (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  lease_id       UUID NOT NULL REFERENCES leases (id),
  case_id        UUID REFERENCES delinquency_cases (id),
  program        TEXT NOT NULL,
  amount         BIGINT NOT NULL,
  months_covered DATERANGE NOT NULL,
  conditions     JSONB NOT NULL,           -- no-eviction period, forgiveness of remainder
  status         TEXT NOT NULL CHECK (status IN ('pledged', 'approved', 'paid', 'denied')),
  payment_id     UUID REFERENCES payments (id)
);
```

Decisions behind it:

- **The case is the unit of work,** with a stage and an array of holds that every action checks before it runs.
- **Notices store their rule, template, amount source and proof,** so a court challenge is answered from data.
- **The plaintiff is the landlord entity,** from the lease, never the manager by default.
- **Plans, filings, placements and awards point at the case,** so a dispute or a bankruptcy can find and stop all of them.
- **Payment acceptance is written by this workflow but owned by Collecting Rent,** so every channel enforces one state.

## Auditing

- **The full timeline per case:** every message sent (by staff or an agent), notice served, payment accepted or refused, plan offered and signed, filing event and hold, with actors and timestamps ([Audit Trails](/docs/architecture/audit-trails)).
- **Every notice's legal basis:** the rule version, the template, the computed amount and deadline, and proof of service.
- **Every hold and how fast it took effect,** because the gap between a bankruptcy filing or a servicemember's request and the last automated action is what a court examines.
- **Collection activity by actor and state,** including any vendor-sent messages, for licensing and Regulation F review.
- **Sealed records' access,** logged, since restricting who sees them only matters if you can prove it ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Run delinquency as a case** with stages, computed deadlines and holds that every path checks.
- **Generate notices from jurisdiction rules and the ledger,** demanding only what the law allows, from versioned templates, with proof of service.
- **Track federal program notice rules as effective-dated data;** the HUD 30-day rule shows why.
- **Make payment plans signed agreements** that change payment acceptance and pause what they say they pause, and constrain agents to the plans policy allows.
- **On filing, block partial self-service payments but never payments the law requires accepting,** such as reinstatement and assistance.
- **Stop everything at once** on bankruptcy, SCRA requests, disputes and court orders.
- **Keep collections, credit reporting and licensing per state as data,** with a return path from agencies.
- **Record assistance awards with their conditions** and turn the conditions into holds.

## References

**Statutes and rules**

- [California Code of Civil Procedure 1161](https://california.public.law/codes/ca_civ_proc_code_section_1161), three days excluding weekends and judicial holidays, required payment information in the notice
- [California Code of Civil Procedure 1161.2](https://california.public.law/codes/ca_civ_proc_code_section_1161.2), restricted access to eviction records, timelines for public access, the 2020 to 2021 nonpayment exception
- [New York RPAPL 711](https://www.nysenate.gov/legislation/laws/RPA/711), the fourteen-day rent demand and the Good Cause Eviction statement
- [Texas Property Code 24.005](https://texas.public.law/statutes/tex._prop._code_section_24.005), three days' notice to vacate and the demand to pay or vacate
- [Washington RCW 59.18.410](https://app.leg.wa.gov/rcw/default.aspx?cite=59.18.410), reinstatement by payment, pledges of emergency rental assistance, suspension of court action
- [15 U.S.C. 9058](https://www.law.cornell.edu/uscode/text/15/9058), the CARES Act's 30-day notice to vacate for covered properties
- [50 U.S.C. 3951](https://www.law.cornell.edu/uscode/text/50/3951), SCRA eviction protections, the 90-day stay, criminal penalties
- [HUD: 30-Day Notification Requirement Prior to Termination of Lease for Nonpayment of Rent (2024)](https://www.federalregister.gov/documents/2024/12/13/2024-28861/30-day-notification-requirement-prior-to-termination-of-lease-for-nonpayment-of-rent), the final rule for public housing and project-based rental assistance
- [HUD: Revocation of the 30-day notification requirement (2026)](https://www.federalregister.gov/documents/2026/02/26/2026-03921/revocation-of-the-30-day-notification-requirement-prior-to-termination-of-lease-for-nonpayment-of), the interim final rule
- [HUD: Indefinite delay of the revocation's effective date (2026)](https://www.federalregister.gov/documents/2026/03/13/2026-04990/revocation-of-the-30-day-notification-requirement-prior-to-termination-of-lease-for-nonpayment-of), pending a final rule
- [USDA Rural Housing Service: Rescinding 30-day notification requirements (2026)](https://www.federalregister.gov/documents/2026/02/25/2026-03716/rescinding-30-day-notification-requirements-related-to-eviction-based-on-nonpayment-of-rent-in), Section 515 and 514 properties

**Reference**

- [U.S. Treasury: Emergency Rental Assistance Program](https://home.treasury.gov/policy-issues/coronavirus/assistance-for-state-local-and-tribal-governments/emergency-rental-assistance-program), ERA1 and ERA2 amounts, uses and the ERA2 end date
- [NYC Human Resources Administration: Legal services for tenants](https://www.nyc.gov/site/hra/help/legal-services-for-tenants.page), free counsel in Housing Court and NYCHA proceedings

**Filings**

- [Entrata: Form S-1/A, Amendment No. 2](https://www.sec.gov/Archives/edgar/data/0002028464/000162828026059692/entrata-sx1a2.htm), the Maryland Collection Agency Licensing Act class action

**In practice**

- [Entrata: Payments AI](https://www.entrata.com/products/payments-ai), AI outreach for balances, late notices and payment plans
- [RealPage: Exchange](https://www.realpage.com/exchange/), a Collections partner category and a collection agency partner
- [Yardi Breeze: Residential features](https://www.yardibreeze.com/residential-features/), delinquency and collections management
