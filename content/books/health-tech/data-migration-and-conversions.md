+++
title = "Data Migration & Conversions"
nav_title = "Data Migrations"
description = "PMS and EHR conversions: what moves (ledgers, insurance, images, notes), EHI export, legal retention after switching, archives, and the cutover weekend."
category = "Health Tech Industry"
order = 1964
part = "Running the Platform"
tags = ["health-tech", "migration", "conversion", "ehr", "pms", "retention"]
+++

A practice changes its practice management system or EHR perhaps once a decade, and the switch is called a conversion. It is the riskiest week in the practice's software life: the schedule for Monday has to be in the new system on Monday, the balances every family owes have to match to the cent, the insurance on file has to be the insurance billed, and the X-rays and charts have to be where the dentist looks for them. What doesn't convert doesn't disappear either. The old system's records are still the legal medical record for every visit they hold, the patient's right of access still reaches them, and state law says how many years they must be kept.

Conversions happen for three reasons, each with its own shape: a practice switching vendors (Dentrix to Open Dental, an on-premises PMS to a cloud one, one EHR to another); a group or DSO standardizing acquired practices onto its platform; and a vendor retiring a product and moving its customers. This chapter covers what moves and what doesn't, as one vendor documents it in detail, the certified export that ONC requires of EHRs, the conversion process from test to cutover weekend, balances and claims in flight, images and documents, retention and archives after the switch, and the platform side when you are the destination. The general method (crosswalks, side effects off, reconciliation, cutover, archives) is the playbook's [Replacing Systems](/docs/architecture/replacing-systems); the same exercise in other industries is [Replatforming & Migration](/books/commerce/replatforming) and [Switching Platforms & Acquisitions](/books/property-tech/switching-platforms). It adds `conversion_projects` and `legacy_archives` and extends the playbook's `migration_batches` for the core data model in [The Health Tech Business](/books/health-tech/health-tech-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from vendor documentation:

| Source or method | What it says moves | What it says doesn't, or moves specially | Process and price |
| --- | --- | --- | --- |
| **Open Dental, converting from Dentrix or EZ Dental** (guide updated March 11, 2026) | Patients and family information, insurance plans and benefit percentages, notes, referrals, recall (regenerated), appointments and operatories, treatment-planned and completed procedures, procedure notes, perio charts, medical alerts, prescriptions and medication lists, primary claims, payments, adjustments, payment plans (remaining balance), providers, fee schedules, carriers and lab cases | X-rays (bridged or re-imported depending on the imaging software), outstanding secondary claims and all preauthorizations (entered by hand), forms, auto notes, treatment plans, questionnaires and custom recall intervals | A free test conversion, then a final conversion typically $1,450 per database plus $400 per additional location; scanned documents and X-rays converted separately; the practice signs an acknowledgment of what doesn't convert |
| **Open Dental, other sources** | Guides for ABELDent, Datacon, Dentrix Ascend, Eaglesoft, MOGO, PracticeWorks and SoftDent | Per-source differences listed in each guide | Conversion data kept about two months, then "permanently deleted" |
| **Certified EHRs (any vendor)** | Single-patient and whole-population export of all electronic health information the product stores, under 45 CFR 170.315(b)(10) | Format is the developer's own, documented at a "publicly accessible hyperlink" | Users can create a single-patient export "without developer assistance" |
| **AWS HealthLake** | Imports FHIR R4 from S3; a data transformation agent (preview) converts C-CDA and CSV to FHIR | Only what the source can be made to express in FHIR | A managed landing zone for migration into FHIR-native products |

Three patterns run through the table:

- **The structured core converts, the edges don't.** Patients, appointments, procedures, insurance and money move; images, scanned documents, forms, templates, custom settings and anything in flight (secondary claims, preauthorizations) need their own process or don't move.
- **Balances carry forward, history stays behind.** Open Dental tells practices not to run historical reports in the new system ("Run historical reports in Dentrix or EZ Dental through the date of the conversion"), because history comes across as enough to support the account, not to reproduce the old reports.
- **The practice signs off on the gaps.** A vendor that lists what doesn't convert and has the practice acknowledge it is protecting both sides; a conversion without that document is a dispute waiting for the first missing X-ray.

## What Moves, Object by Object

| Object | How it moves | What to watch |
| --- | --- | --- |
| **Patients and families** | Converted with source IDs into `patients`, `guarantors` and `contacts`, through a crosswalk | Duplicates in the source come along unless merged first; contact consents must carry their evidence ([Two-Way Texting & Messaging](/books/health-tech/patient-texting)) |
| **Insurance** | Carriers, plans, benefit percentages and each patient's coverage order into `payers`, `plans` and `coverages` | Subscriber relationships and coverage order; dental frequencies and maximums used often need re-entry or re-verification |
| **Appointments** | Future appointments with operatory, provider and type; past ones as history | Provider and operatory mapping; Open Dental tells practices to re-run provider assignment on future hygiene appointments after setup |
| **Procedures and charting** | Completed and treatment-planned procedures with codes, teeth and surfaces; perio charts | Codes in custom "explosion" groupings may arrive without valid CDT codes attached |
| **Clinical notes and documents** | Procedure and chart notes as text; scanned documents as images, separately | Formatting, signatures and the note's original author and date must survive; scanned images may need a decrypted export from the old vendor |
| **Imaging** | X-rays and photos moved into, or bridged to, an imaging system the new PMS supports | The most common gap; the image archive often stays in the old imaging software |
| **Ledger** | Account balances, payments, adjustments and payment plans; aging carried forward | Totals must reconcile to the old A/R report; payment plans may arrive as a remaining balance only |
| **Claims** | Open primary claims; secondary claims and preauthorizations often by hand | A claim in flight at cutover is where money is lost; below |
| **Recall** | Due dates and intervals | Custom intervals may not convert and recall is regenerated from rules |
| **Users, roles and settings** | Rebuilt, not converted | Fee schedules may convert; security roles and templates are set up fresh |

## Exports the Law Requires

A practice's data is the practice's, and federal rules now say so in software:

- **EHI export for certified EHRs.** ONC's certification criterion § 170.315(b)(10) requires a certified product to let users "timely create an export file(s)" with all of one patient's electronic health information, and to export the whole population, in a computable format whose documentation is linked from the file. The HTI-5 final rule (October 2026) removed and revised many criteria and left this one in place. For a practice leaving a certified EHR, the population export is the floor of what it can take with it; [Cures Act, Information Blocking & Certification](/books/health-tech/information-blocking-and-certification) covers the criterion and information blocking around it.
- **EHI is defined by the designated record set.** Electronic health information is ePHI "to the extent that it would be included in a designated record set" (45 CFR 171.102), and the designated record set includes "the medical records and billing records about individuals" that a provider maintains (45 CFR 164.501). Billing records are in scope, which is why the ledger matters as much as the chart.
- **Information blocking reaches the old vendor.** A developer of certified health IT that makes leaving unreasonably slow or expensive (withholding exports, delaying them, charging for them outside the rules' fee exception) risks being an information blocker. Non-certified PMS vendors (much of dental and veterinary) aren't under the export criterion, and their contracts decide what a practice gets.

## The Conversion Process

The playbook's phases, as a practice conversion runs them ([Cutover and the Rollback Window](/docs/architecture/replacing-systems#cutover-and-the-rollback-window)):

1. **Inventory and contract, weeks to months before.** What the old system holds (including imaging, documents, and add-on modules), what the old vendor will export and at what cost, what the new vendor converts, and the acknowledgment of what doesn't. Request decrypted exports of scanned documents and images early; Open Dental's guide tells practices to ask the old vendor for a "decrypted scanned document backup."
2. **Test conversion.** A full copy converted into a test database, reviewed by the practice: a sample of families, appointments, ledgers and charts, read side by side. Open Dental makes the practice "responsible for checking the test conversion data" before scheduling the final.
3. **Mapping and cleanup.** Providers, operatories, appointment types, fee schedules, payers and procedure codes mapped; duplicates merged in the source, not after.
4. **The final conversion, usually a weekend.** Close the day's work in the old system; run and keep the accounts receivable report (with credit balances) and the outstanding insurance claims report, as Open Dental's final-conversion steps say; close the old software "so the current data can be copied"; take the final copy; convert; set up.
5. **Monday.** The schedule is live in the new system, staff are trained on the screens they'll use first, and the conversion specialist is on call. Open Dental includes post-conversion setup if it's finished within 30 days.
6. **Reconcile and archive.** Totals checked against the old reports; the old system set read-only and archived (below).

Larger groups convert office by office, with the group's central functions (billing office, call center) working in both systems for the overlap; the crosswalk and the reporting have to span both until the last office moves ([Big Bang, Phased or Parallel](/docs/architecture/replacing-systems#big-bang-phased-or-parallel)).

## Balances and Claims in Flight

Money is where a conversion is judged:

- **A/R ties out to the cent.** Open Dental's check is the right one: after conversion, total the aging report (with negative balances) and the payment plan report and "compare the total to the Accounts Receivable Report balance from your previous software." Family by family for the largest balances, in total for the rest.
- **Credit balances are owed money.** Patients with credits (overpayments, prepayments) carry them forward exactly, and their refund obligations don't reset because the software changed.
- **Open claims are worked to a finish.** Primary claims convert; secondary claims and preauthorizations may not. The practical rule is to let claims submitted from the old system be paid there (remittances posted in the old system through a cutoff date, or posted manually to converted balances after), and to submit new claims only from the new one. Clearinghouse enrollment (the new system's submitter ID, ERA and EFT enrollment with each payer) has to be in place before the first claim, and payer enrollment takes time; [Clearinghouses](/books/health-tech/clearinghouses#enrollment) covers enrollment.
- **Payment plans and stored cards.** Plans may arrive as a remaining balance and schedule that staff recreate; stored card tokens move processor to processor, if at all ([Moving Card Numbers](/books/payments/switching-processors#moving-card-numbers)), and [Payments in the Practice](/books/health-tech/patient-payments) covers the practice side.

## Images, Documents and Notes

Clinical content has rules structured data doesn't:

- **Notes keep their author, date and signature status.** A converted note is the original note as it was signed, attributed to its author with its original date, not a new note authored by the conversion. A note that can't be converted faithfully stays in the archive and is linked, rather than half-converted.
- **Images move with their metadata.** An X-ray without its date, tooth numbers and patient link is of little clinical use; when the imaging software stays the same, a bridge to the new PMS is usually better than moving images at all.
- **Amendments and their links come along.** An amended record and its amendment, and any statement of disagreement, stay linked, because the amendment rules require them to accompany future disclosures ([Operations, Support & Downtime](/books/health-tech/health-tech-operations)'s [Correcting Data in Clinical Records](/books/health-tech/health-tech-operations#correcting-data-in-clinical-records)).
- **Sensitive labels survive.** Part 2 and other specially protected records keep their labels through conversion; a conversion that drops them turns protected notes into ordinary ones ([Health Tech Architecture](/books/health-tech/health-tech-architecture)'s [Segmenting PHI](/books/health-tech/health-tech-architecture#segmenting-phi)).

## Retention After Switching

The old system's data is still a medical record, and how long it must be kept is set by law, not by the conversion:

- **States set record retention, and it varies.** Florida, for example, requires a physician to keep records at least five years from the last patient contact and, on closing or relocating a practice, to publish notice for four consecutive weeks of where records can be obtained (Fla. Admin. Code 64B8-10.002). Dental, optometry, therapy and veterinary boards each set their own periods, and rules for minors' records may run longer.
- **Federal programs add theirs.** Hospitals participating in Medicare keep records "for a period of at least 5 years" (42 CFR 482.24(b)(1)); payer contracts and Medicare Advantage participation can require longer.
- **Access rights reach the archive.** Records maintained "by or for" the practice remain in the designated record set, so a patient's request for their records includes what's still in the old system, and the practice has to be able to produce it within the right of access deadlines ([HIPAA in Practice](/books/health-tech/hipaa-in-practice#the-right-of-access) covers them).
- **The longest applicable period wins,** per record type, as in [Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type).

## Archives

What doesn't move goes to an archive the practice can actually use:

- **A read-only copy of the old system,** on the old vendor's terms, which works until the license lapses or the server dies.
- **A legacy data archive.** Vendors in this business extract the old database, documents and images into a searchable, read-only store with release-of-information and retention tools; it suits a hospital or group retiring an EHR it can no longer run.
- **The new platform's own archive.** The original exports, checksummed and encrypted, indexed by patient through the crosswalk, with a viewer for converted-but-unmapped content ([Keep the Old System as a Read-Only Archive](/docs/architecture/replacing-systems#keep-the-old-system-as-a-read-only-archive)).

Whichever it is, it needs the old audit logs exported before access ends, a destruction date per record computed from the retention rules, and a way to answer a records request without a former vendor's help. A conversion vendor's own copy of the data is a separate liability: Open Dental's practice of deleting conversion data after about two months is the right shape, and the BAA should say what the vendor keeps and for how long.

## When You Are the Destination

A platform that onboards practices from other systems runs conversions as a product:

- **Conversions are a pipeline per source system,** versioned, with a published list of what converts from each source, and a test conversion the practice reviews before any final.
- **Load with side effects off.** A converted appointment must not trigger a reminder, a converted balance must not send a statement, a converted recall must not start a campaign, until the practice goes live ([Load With Side Effects Off](/docs/architecture/replacing-systems#load-with-side-effects-off)). The writes carry a migration actor that every consumer ignores.
- **Consents arrive with their evidence or not at all.** A text-messaging consent converted as "yes" without its date and source is a consent you can't prove; convert it with its evidence or treat the patient as not yet consented.
- **Acquired practices are conversions too.** A DSO bringing an acquired office onto its platform has the same process plus a legal question: whether the acquiring entity is now the custodian of the old records, which the purchase agreement answers.

## How to Build It

The playbook's `migration_batches` and crosswalk carry the load; a conversion project ties them to a practice, and archives are records with retention dates:

```sql
CREATE TABLE conversion_projects (       -- one practice's move from one system
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL REFERENCES organizations (id),
  location_ids       UUID[] NOT NULL,       -- offices in this conversion
  source_system      TEXT NOT NULL,         -- 'dentrix_g7', 'eaglesoft_24', 'avimark', 'ehr_vendor_x'
  source_integration_id UUID REFERENCES integrations (id),  -- if read live during overlap
  converter_version  TEXT NOT NULL,         -- the source pipeline's release
  gaps_acknowledged_by TEXT,                -- practice signatory for the "not converted" list
  gaps_acknowledged_at TIMESTAMPTZ,
  test_reviewed_by   TEXT,
  test_reviewed_at   TIMESTAMPTZ,
  final_scheduled_for TIMESTAMPTZ,
  go_live_at         TIMESTAMPTZ,
  old_ar_total       NUMERIC(14, 2),        -- from the old system's A/R report at final
  old_open_claims    INT,                   -- from the outstanding claims report at final
  status             TEXT NOT NULL CHECK (status IN ('planning', 'test', 'final_scheduled',
                       'converting', 'live', 'reconciled', 'archived', 'cancelled'))
);

ALTER TABLE migration_batches
  ADD COLUMN tenant_id            UUID REFERENCES organizations (id),
  ADD COLUMN conversion_project_id UUID REFERENCES conversion_projects (id),
  ADD COLUMN entity               TEXT;     -- 'patients', 'appointments', 'ledger', 'claims', 'images'

CREATE TABLE legacy_archives (           -- where unconverted records live, and until when
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL REFERENCES organizations (id),
  conversion_project_id UUID REFERENCES conversion_projects (id),
  kind               TEXT NOT NULL CHECK (kind IN ('vendor_readonly', 'archive_vendor',
                       'platform_store')),
  custodian          TEXT NOT NULL,         -- who holds it, under which BAA
  contents           TEXT[] NOT NULL,       -- 'images', 'scanned_documents', 'audit_log', 'full_export'
  export_ref         TEXT,                  -- encrypted object key of the original export
  export_sha256      BYTEA,
  last_record_date   DATE NOT NULL,         -- latest date of service in the archive
  retain_until       DATE NOT NULL,         -- longest applicable retention, computed per tenant's states
  destruction_approved_by TEXT,
  destroyed_at       TIMESTAMPTZ
);
```

The A/R tie-out at go-live, from converted ledger entries against the old system's report:

```sql
-- Converted balance per guarantor from the crosswalk, against the total the old A/R
-- report gave at final. Credit balances are included as negatives.
SELECT p.old_ar_total,
       SUM(le.amount)                    AS converted_ar,
       SUM(le.amount) - p.old_ar_total   AS difference
FROM conversion_projects p
JOIN migration_batches b ON b.conversion_project_id = p.id AND b.entity = 'ledger'
JOIN ledger_entries le ON le.migration_batch_id = b.id
WHERE p.id = $1
GROUP BY p.old_ar_total;
```

Design notes:

- **The gap list is signed before the final.** `gaps_acknowledged_by` and the source pipeline's published list are what a later dispute is settled against.
- **`ledger_entries.migration_batch_id`** is a column this check assumes on the core model's ledger, so converted opening balances are distinguishable from live postings for as long as the account exists.
- **Retention dates are computed, not typed.** `retain_until` comes from the retention rules for each location's state and record type, and the latest date of service; an archive for a pediatric practice runs longer than one for an adult practice.
- **Destruction is two steps.** An archive reaches `retain_until`, a person approves destruction, and the destruction is recorded; nothing deletes on a timer alone ([Retention Windows](/docs/architecture/data-retention#retention-windows)).
- **Emit `conversion.test_ready`, `conversion.live`, `conversion.reconciled` and `legacy_archive.destroyed`.**

## Auditing

- **What came from where,** for every converted record: source system, batch, pipeline version and export checksum, kept as long as the record.
- **The gap acknowledgment and the test review,** signed by the practice.
- **The A/R and open-claims tie-out at go-live,** with accepted differences explained.
- **Every archive,** with custodian, contents, retention date and, eventually, destruction approval.
- **The old system's audit log,** exported before access ended.

## What This Means for the System You Build

- **Publish what converts from each source** and have the practice sign the list of what doesn't.
- **Run a test conversion the practice reviews,** then a final over a weekend with the old A/R and claims reports kept.
- **Tie A/R out to the cent** and finish claims in flight deliberately; enroll with the clearinghouse before the first claim.
- **Keep notes as signed, images with their metadata, and labels intact.**
- **Load with side effects off** and convert consents only with their evidence.
- **Archive what doesn't move,** retrievable by patient, with a computed retention date and approved destruction.
- **Know the export rights:** certified EHRs owe a population export; contracts decide the rest.

## References

**Regulation**

- [45 CFR 170.315 (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/170.315), (b)(10) electronic health information export
- [45 CFR 171.102 (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/171.102), the definition of electronic health information
- [45 CFR 164.501 (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/164.501), designated record set and record
- [42 CFR 482.24 (Cornell LII)](https://www.law.cornell.edu/cfr/text/42/482.24), hospital medical record retention of at least five years
- [Fla. Admin. Code R. 64B8-10.002 (Cornell LII)](https://www.law.cornell.edu/regulations/florida/Fla-Admin-Code-Ann-R-64B8-10-002), five-year retention and notice on closing or relocating a practice
- [ASTP/ONC: HTI-5 final rule removals or revisions of certification criteria (October 26, 2026)](https://healthit.gov/resources/hti-5-final-rule-removals-or-revisions-of-certification-criteria/), the criteria changed, which don't include (b)(10)

**Vendors**

- [Open Dental: Data conversions](https://www.opendental.com/site/conversions.html), source systems, fees, image conversions and data deletion after conversion
- [Open Dental: Dentrix / EZ Dental conversion guide (updated March 11, 2026)](https://www.opendental.com/resources/conversions/conversionsdentrix.pdf), what converts, what doesn't, balances, payment plans, codes and reports
- [Open Dental: Final data conversion](https://www.opendental.com/site/conversionsfinal.html), the day-of steps and the A/R comparison
- [AWS: What is AWS HealthLake?](https://docs.aws.amazon.com/healthlake/latest/devguide/what-is.html), FHIR import and the data transformation agent for C-CDA and CSV
