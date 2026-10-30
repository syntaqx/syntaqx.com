+++
title = "The Practice Business"
description = "How a small practice runs and earns: the front desk, production and collections, recall as revenue, DSOs and MSOs, corporate practice law and consolidators."
category = "Health Tech Industry"
order = 1903
part = "The Business"
tags = ["health-tech", "practice-management", "dental", "veterinary", "dso"]
+++

A small practice is a few clinicians, a front desk and a schedule. A general dental office might have two dentists, three hygienists, assistants and two people up front; a vet hospital, three veterinarians, technicians and a reception team answering the phone all day; a physical therapy clinic, therapists booked in 45-minute blocks; an optometry practice, an optician selling frames next to the exam lane. Every one of them earns only when a chair, a lane or a table is filled with a patient whose care is documented and paid for, and loses money on every empty hour and every claim that comes back denied. The software this volume describes is mostly sold to these businesses, to the people at the front desk who run them, and increasingly to the groups that own many of them.

This chapter covers how practices make money and who owns them: the roles, production and collections, recall as the revenue loop, the specialties' differences, the doctrines that decide who may own a practice, and the consolidators. [The Health Tech Business](/books/health-tech/health-tech-business#how-the-money-flows) covers how the money reaches a practice; [Business Models for Health Software](/books/health-tech/health-tech-business-models) how software vendors charge them.

## How the Platforms Do It

What each kind of practice runs on and lives by, as of October 2026:

| Practice | Who pays mostly | Typical systems | The number the owner watches |
| --- | --- | --- | --- |
| **General dentistry** | Patients and dental PPOs, against annual maximums | Dentrix, Eaglesoft, Open Dental, Curve, Denticon; Weave, NexHealth, RevenueWell, Dental Intelligence on top | Production per day, collections, hygiene reappointment, case acceptance |
| **Optometry** | Vision plans for routine exams and materials, medical insurance for eye disease, patients for frames and contacts | Compulink, Crystal PM, RevolutionEHR, Eyefinity | Exams per day, optical capture, recall |
| **Physical therapy** | Medicare, commercial plans, workers' comp, auto | WebPT, Raintree, Prompt | Visits per week, cancellations and no-shows, plan-of-care completion |
| **Veterinary** | Clients, at the counter | Cornerstone, ezyVet, AVImark, Shepherd, Digitail; PetDesk, Vetstoria, Weave | Revenue per visit, compliance with vaccine and wellness reminders |
| **Primary care** | Commercial plans, Medicare, Medicaid; capitation and shared savings in some | athenahealth, eClinicalWorks, NextGen, Elation, Epic in health systems | Visits per day, panel size, quality measures |
| **Specialty medical** | Commercial plans and Medicare, with prior authorization | ModMed, NextGen, athenahealth, specialty systems | Procedures, authorization turnaround, denial rate |

## How a Small Practice Runs

The front desk is the practice's operating system. Its roles, whatever the titles:

- **Scheduling coordinator.** Answers the phone, books and moves appointments, fills openings from a short-notice list, confirms tomorrow's schedule. In dental, keeps the hygiene schedule full; in vet, triages a client's call about a sick pet into the right slot.
- **Patient coordinator or treatment coordinator.** Presents treatment plans and their cost, arranges financing, follows up on treatment the patient hasn't scheduled.
- **Insurance coordinator or biller.** Verifies eligibility and benefits before visits, sends claims, posts remittances, works denials and aging. In small offices the same person does scheduling and billing; larger practices and groups outsource billing or centralize it.
- **Office manager.** Runs the staff schedule, payroll inputs, vendor relationships (including the software vendors), month-end reports and collections.

Their day is a sequence the software either carries or interrupts: confirm today's patients, verify insurance for tomorrow's, check patients in and collect the patient portion, check them out and book the next visit, post yesterday's payments, chase last month's balances, and answer the phone throughout. Most patient engagement features (reminders, two-way texting, online booking, intake, text-to-pay) exist to take a task off this list; their value is measured in front desk hours and in chairs filled.

## Production and Collections

Practices speak two money words, and the PMS reports both. Open Dental's production and income report defines **production** as "procedure fees for completed procedures (i.e., the gross fee billed to the patient)", **adjustments** as "adjustments attached to completed procedures or posted to accounts", **write-offs** as "write-off amounts for PPO insurance plans", and income as patient income ("the amount received from patient payments") and insurance income ("the amount received from insurance company (claim) payments"). **Scheduled production** is the "sum of treatment planned procedures fees attached to appointments with a status of scheduled": what tomorrow's schedule is worth if every patient shows and every procedure is done.

The gap between them is the practice's real revenue problem. Production is at the practice's full fee (its usual, customary and reasonable fee schedule); an in-network dental PPO pays from its own lower fee schedule, and the difference is a write-off the practice agreed to by contract. So a practice reports gross production, net production after PPO write-offs and adjustments, and collections, and the owner watches the **collection ratio** (collections over net production). Measured over the same period, it's distorted by timing, since this month's collections pay last month's production; measured honestly, it tells the owner whether claims and balances are being worked.

Two consequences for software. A dashboard that shows production without saying gross or net misleads the owner, and so does one that mixes completed with scheduled production ([Practice Analytics & AI Front Desk](/books/health-tech/practice-analytics-and-ai#metrics-defined-once)). And every number is a sum over the ledger: production is charges for completed procedures, write-offs are contractual adjustments from remittances, collections are payments, which is why [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model) keeps them as separate entries.

## Recall Is the Revenue Loop

Dental, optometry and veterinary practices run on returning patients. In dentistry, the hygiene schedule (cleanings, exams, X-rays at their intervals) is predictable revenue and the source of most restorative treatment, because the exam at a hygiene visit finds the crown or filling the patient needs. Open Dental assigns every patient a prophy recall by default, switchable to perio, with a due date calculated as "the Previous Date plus the recall interval", where the previous date comes from completed trigger procedures or insurance history; when the trigger procedure is completed, the next due date moves. A patient who leaves without booking the next visit falls onto a recall list the front desk works by phone and text. Optical recall works the same way on annual exams and contact lens renewals, and veterinary practices on vaccines and annual wellness visits, often with reminder cards and texts the PMS generates from the medical record.

The loop is: complete the visit, book the next one before the patient leaves (hygiene reappointment rate), remind and confirm, see the patient, find treatment, present it, schedule it (case acceptance), and repeat. A practice that loses track of patients due for recall loses the hygiene visit and the treatment it would have found. That is why recall reminders were the first patient engagement product and remain its core ([Reminders, Confirmations & Recall](/books/health-tech/reminders-and-recall) builds it).

## The Specialties

The workforce is small and specialized. By the Bureau of Labor Statistics' 2025 counts, dentists held 161,400 jobs (median pay $176,110 in May 2025), veterinarians 91,100 ($130,100), optometrists 45,100 ($136,570) and physical therapists 283,700 ($102,760). What differs for software:

- **Dental.** Procedures coded in CDT, recorded per tooth and surface; treatment plans and case acceptance; dental benefits with frequency limits and annual maximums; imaging bridges from the PMS to X-ray software. The DSO share is rising (below). [Dental Practice](/books/health-tech/dental-practice#dsos-and-groups) covers it.
- **Optometry.** A medical side (eye disease, billed to medical insurance) and a routine side (exams and materials, billed to vision plans), plus an optical retail business and federal rules on releasing prescriptions ([Optometry, PT & Other Specialties](/books/health-tech/specialty-practices#optometry-and-optical)).
- **Physical therapy.** A plan of care, visits in sequence, timed codes and Medicare's therapy rules; cancellation rates decide the business ([Optometry, PT & Other Specialties](/books/health-tech/specialty-practices#physical-therapy)).
- **Veterinary.** The patient is an animal and the client pays; no HIPAA; prescriptions, labs and vaccines tie the clinic to suppliers; and corporate consolidators own a large share ([Veterinary Practice](/books/health-tech/veterinary-practice#corporate-groups)).
- **Primary care and specialty medical.** EHR-centered, coded in CPT and ICD-10-CM, prior authorization in specialty care, quality programs and value-based contracts in primary care (Revenue Cycle and Care Delivery parts).

## Who Owns the Practice

Private practice is shrinking in medicine. The AMA's Physician Practice Benchmark Survey found 42.2% of physicians in private practice in 2024, against 60.1% in 2012; 34.5% worked in hospital-owned practices (23.4% in 2012), and 6.5% in practices owned by private equity firms (4.5% in 2022). Dentistry runs a similar trend through dental service organizations: the ADA's Health Policy Institute reports that affiliation with DSOs and large groups keeps growing, especially among early-career dentists. <!-- source-gap: dso-share | secondary | the share of US dentists affiliated with a DSO (about 13% in 2022 per ADA News) | closes with: the ADA HPI practice modalities data file, which is published as a spreadsheet the fetcher couldn't read | checked: 2026-10-29 -->

### DSOs and MSOs

A **dental service organization** (DSO) provides the business side (billing, scheduling, purchasing, marketing, HR, IT) to dental practices it doesn't legally own the clinical side of, under a management services agreement; in medicine the same structure is a **management services organization** (MSO). The structure exists because of the corporate practice doctrines below: an investor-backed company owns the MSO, a licensed dentist or physician owns the professional entity that employs the clinicians and bills the patients, and the agreement between them moves management fees and control. For software, a DSO or MSO is a customer with many locations, central billing and call centers, its own reporting across several PMS instances, and a buying process like an enterprise's ([Multi-Location Groups & Call Centers](/books/health-tech/multi-location-and-call-centers)).

### Corporate practice doctrines

Many states bar a business corporation from practicing medicine, dentistry or, in some states, veterinary medicine, or from employing licensed professionals to do it, on the theory that a lay owner shouldn't direct clinical judgment. The doctrine varies by state and profession (some states have little or none, some allow professional corporations owned by licensees only, some allow hospital employment), and it is why the MSO and DSO structures exist. States have started regulating the structure itself. Oregon's SB 951, signed June 9, 2025, bars an MSO from owning or controlling a majority of the medical practice it manages, bars interlocking directors and officers between them, and reserves to the practice final authority over hiring licensees, their pay and schedules, coding and billing policy, clinical standards and payer contracts; its ownership and control rules applied from January 1, 2026 to entities formed or sold after the signing date and reach existing entities on January 1, 2029. Whether a structure complies is counsel's question; for software it means the professional entity, not the MSO, is often the covered entity, the billing provider on the claim and the party whose consent governs the data, which is why [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model) separates organizations by kind and records how they're related.

### Veterinary consolidators

Veterinary medicine consolidated faster than dentistry, under corporate owners that hold hospitals across many states. Mars completed its acquisition of VCA on September 12, 2017 at $93.00 a share, after the FTC required it to divest 12 specialty and emergency clinics in 10 localities as a condition of the $9.1 billion deal. JAB Consumer Partners, owner of National Veterinary Associates, drew two FTC orders in 2022: one requiring divestitures and prior approval for its $1.1 billion acquisition of SAGE Veterinary Partners, and one, for its $1.65 billion acquisition of Ethos Veterinary Health, requiring for ten years prior approval of specialty or emergency clinic acquisitions within 25 miles of its clinics in California, Colorado, the District of Columbia, Maryland and Virginia, and 30 days' notice of smaller deals nationwide. For software, a consolidator is one customer with hundreds of hospitals, often on several PMSs inherited with each acquisition.

## Unit Economics From the Filings

The practices are mostly private, but the companies that sell to them publish numbers that show the shape of the market:

| Company | What the filing shows | Period |
| --- | --- | --- |
| **Henry Schein** | Distribution and value-added services 84.5% of sales, specialty products 11.7%, technology 5.1%; practice software at about 95,000 practices | 2025 |
| **Patterson Companies** | Dental $2,489 million and animal health $4,067 million of $6,568 million in sales; value-added services and other 12% of dental sales | Fiscal year to April 2024, the last before going private |
| **IDEXX** | $4,303.7 million of revenue, $3,953.3 million in the Companion Animal Group, $345.9 million from veterinary software, services and imaging | 2025 |
| **Covetrus** | $4,575 million of net sales, North America $2,719 million; prescription management through 503A pharmacies and an outsourcing facility | 2021, its last public year |
| **Weave** | 72% gross margin; net revenue retention 93% and gross revenue retention 89%; nearly 40,000 locations | 2025 |

Two readings matter. Suppliers own the software because software keeps them in the practice every day: Henry Schein's technology segment is a small share of its sales and the gateway to the rest, and IDEXX sells software next to the diagnostics its software orders. And practices churn slowly but do churn: Weave's gross revenue retention of 89% means about a tenth of revenue leaves each year, mostly from small practices that close, sell or switch, which is why vendors chase groups and DSOs.

## How to Build It

The practice business adds ownership and fee schedules to [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model): who manages or owns which practice, over what dates, and the fees that turn procedures into production. It extends `organizations`, `charges` and `ledger_entries`:

```sql
CREATE TABLE organization_affiliations ( -- ownership and management, with dates
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id        UUID NOT NULL REFERENCES organizations (id),  -- the practice
  related_id             UUID NOT NULL REFERENCES organizations (id),  -- the DSO, MSO, owner
  kind                   TEXT NOT NULL CHECK (kind IN ('owned_by', 'managed_by', 'member_of',
                           'franchise_of', 'acquired_by')),
  agreement_document_id  UUID REFERENCES documents (id),  -- the management services agreement
  valid_during           DATERANGE NOT NULL,
  CHECK (organization_id <> related_id),
  EXCLUDE USING gist (organization_id WITH =, kind WITH =, valid_during WITH &&)
);

CREATE TABLE fee_schedules (             -- a set of fees: the practice's own, or a payer's
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  kind             TEXT NOT NULL CHECK (kind IN ('office', 'ppo', 'medicare', 'medicaid',
                     'capitation', 'membership', 'cash_discount')),
  plan_id          UUID REFERENCES plans (id),  -- for a payer's contracted fees
  name             TEXT NOT NULL,
  valid_during     DATERANGE NOT NULL,
  CHECK ((kind IN ('ppo', 'medicare', 'medicaid', 'capitation')) = (plan_id IS NOT NULL))
);

CREATE TABLE fee_schedule_items (
  fee_schedule_id  UUID NOT NULL REFERENCES fee_schedules (id),
  code_system      TEXT NOT NULL,
  code             TEXT NOT NULL,
  location_id      UUID REFERENCES locations (id),  -- null: every location
  amount           BIGINT NOT NULL CHECK (amount >= 0),
  UNIQUE NULLS NOT DISTINCT (fee_schedule_id, code_system, code, location_id)
);

ALTER TABLE charges ADD COLUMN fee_schedule_id UUID REFERENCES fee_schedules (id);  -- the office fee used

-- Production, write-offs and collections for a month, from the ledger
SELECT
  SUM(amount) FILTER (WHERE kind = 'charge')                                   AS gross_production,
  -SUM(amount) FILTER (WHERE kind IN ('contractual_adjustment', 'adjustment')) AS adjustments,
  -SUM(amount) FILTER (WHERE kind IN ('patient_payment', 'insurance_payment')) AS collections
FROM ledger_entries
WHERE organization_id = $1
  AND posted_on >= DATE '2026-09-01' AND posted_on < DATE '2026-10-01';
```

- **Affiliations are dated.** A practice acquired by a DSO in March is managed by it from March; a report on last year must use last year's relationships, and a tenant hierarchy built from `parent_id` alone can't answer that. `parent_id` stays as the current hierarchy for access control; affiliations are the history.
- **The office fee is the production fee.** Production is charged at the office fee schedule; the payer's schedule decides the allowed amount and the write-off. Storing which schedule priced each charge lets a practice change its fees on January 1 without rewriting last year's production.
- **Collections come from the ledger, never from deposits.** A deposit can mix several payers' remittances and patient payments; the ledger entries say what each one paid against.

## Auditing

- **Who owned and managed each practice, and when,** with the management agreement on file, because the professional entity is the covered entity and the billing provider.
- **Which fee schedule priced each charge,** and every fee schedule's versions, so a production report or a payer's audit of billed charges can be reproduced.
- **Every write-off and adjustment with its reason and author,** since an adjustment is where a practice's revenue quietly leaks or where a billing error hides.

## What This Means for the System You Build

- **Design for the front desk's day,** and measure your product in hours saved and chairs filled.
- **Report production gross and net, and collections from the ledger,** never mixing completed with scheduled production.
- **Treat recall as the core loop** for dental, optometry and veterinary practices, and keep due dates computed from completed procedures.
- **Model ownership and management with dates,** and know which entity is the covered entity and billing provider when an MSO or DSO is involved.
- **Expect consolidators,** with many locations and several PMSs, and sell to them as enterprises.

## References

**Workforce and ownership**

- [BLS Occupational Outlook Handbook: Dentists](https://www.bls.gov/ooh/healthcare/dentists.htm), 161,400 jobs in 2025 and median pay
- [BLS Occupational Outlook Handbook: Veterinarians](https://www.bls.gov/ooh/healthcare/veterinarians.htm), 91,100 jobs and median pay
- [BLS Occupational Outlook Handbook: Optometrists](https://www.bls.gov/ooh/healthcare/optometrists.htm), 45,100 jobs and median pay
- [BLS Occupational Outlook Handbook: Physical therapists](https://www.bls.gov/ooh/healthcare/physical-therapists.htm), 283,700 jobs and median pay
- [AMA: Smaller share of doctors in private practice than ever](https://www.ama-assn.org/practice-management/private-practices/smaller-share-doctors-private-practice-ever), 2024 private practice, hospital-owned and private equity shares
- [AMA: A decade of change in physician practice ownership](https://www.ama-assn.org/press-center/ama-press-releases/ama-examines-decade-change-physician-practice-ownership-and), the 2012 baseline and 4.5% private equity share in 2022
- [ADA Health Policy Institute: Practice modalities among US dentists](https://www.ada.org/resources/research/health-policy-institute/dental-practice-research/practice-modalities-among-us-dentists), growing DSO and large-group affiliation

**Law and enforcement**

- [Davis Wright Tremaine: Oregon SB 951 restricts corporate medical practice](https://www.dwt.com/insights/2025/06/oregon-sb-951-restricts-corporate-medical-practice), signing date, MSO ownership and control limits and effective dates
- [FTC: Mars must divest 12 veterinary clinics to acquire VCA](https://www.ftc.gov/news-events/news/press-releases/2017/08/ftc-requires-mars-divest-12-veterinary-clinics-condition-acquiring-pet-care-company-vca-inc), the divestitures and the $9.1 billion deal
- [FTC: Final order on JAB's acquisition of SAGE Veterinary Partners](https://www.ftc.gov/news-events/news/press-releases/2022/08/ftc-approves-final-order-protecting-pet-owners-private-equity-firms-anticompetitive-acquisition), divestitures and prior approval, JAB as NVA's parent
- [FTC: Second action against JAB Consumer Partners (Ethos)](https://www.ftc.gov/news-events/news/press-releases/2022/06/ftc-takes-second-action-against-jab-consumer-partners-protect-pet-owners-private-equity-firms-rollup-of-veterinary-services-clinics), the 25-mile prior approval and nationwide notice terms

**Filings**

- [VCA Inc.: Form 8-K on completion of the Mars acquisition](https://www.sec.gov/Archives/edgar/data/0000817366/000119312517282381/d452580d8k.htm), September 12, 2017 at $93.00 a share
- [Henry Schein: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/0001000228/000100022826000013/hsic-20251227.htm), segment shares and practices using its software
- [Patterson Companies: Form 10-K for fiscal 2024](https://www.sec.gov/Archives/edgar/data/891024/000089102424000008/pdco-20240427.htm), dental and animal health sales and value-added services
- [IDEXX Laboratories: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/874716/000087471626000038/idxx-20251231.htm), revenue by segment and veterinary software revenue
- [Covetrus: Form 10-K for 2021](https://www.sec.gov/Archives/edgar/data/1752836/000175283622000018/cvet-20211231.htm), net sales by segment and prescription management
- [Weave Communications: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1609151/000160915126000016/weav-20251231.htm), gross margin, retention and locations

**In practice**

- [Open Dental Manual: Production and Income report](https://www.opendental.com/manual/reportprodinc.html), production, adjustments, write-offs, income and scheduled production defined
- [Open Dental Manual: Recall](https://www.opendental.com/manual/recall.html), recall types, the default prophy recall and the calculated due date
