+++
title = "Drivers: CDLs, Qualification & the Clearinghouse"
nav_title = "Drivers & Qualification"
description = "CDL classes and endorsements, the qualification file, medical certificates, the Clearinghouse, entry-level training, English proficiency and non-domiciled CDLs."
category = "Logistics & Supply Chain Industry"
order = 2824
part = "Carrier Regulation"
tags = ["logistics", "trucking", "fmcsa", "cdl", "driver-qualification", "clearinghouse", "compliance"]
+++

A motor carrier may put a driver behind the wheel of a commercial motor vehicle only when a stack of separate facts are all true on that day: the driver holds the right class of commercial driver's license with the right endorsements, issued by one state and not downgraded; a medical examiner on FMCSA's National Registry has certified the driver within the last 24 months (or less), and the state has posted that certification to the driver's record; the carrier has a qualification file holding an application, the driver's motor vehicle records, a road test or its equivalent and an annual review; previous employers have been asked about the driver's safety and drug and alcohol history; the Drug and Alcohol Clearinghouse has been queried and shows no prohibition; and, for a new driver, an entry-level training provider has certified the training. Each fact has its own source (a state licensing agency, the National Registry, the Clearinghouse, the Training Provider Registry, a former employer), its own clock and its own retention rule, and any one of them lapsing makes the driver unqualified without anyone touching the driver's record.

That is why qualification is hard to build. The rules live in at least four parts of title 49 (383 for licenses, 391 for qualification, 382 for drug and alcohol testing, 380 for training), they have been moving: the Clearinghouse went live for states on November 18, 2024, paper medical certificates stopped counting for CDL drivers in 49 states on October 12, 2026, English language proficiency became an out-of-service violation at the roadside in June 2025, and non-domiciled CDLs were cut back by a rule that took effect March 16, 2026 and is still in court. A carrier's system has to treat every one of these as a dated rule that applies from a day, not as a field on the driver. This chapter covers the license, the qualification file, medical certification, the Clearinghouse, entry-level driver training, English proficiency, non-domiciled CDLs and leased-on owner-operators, then the tables that hold them. Hours limits are in [Hours of Service](/books/logistics/hours-of-service), the carrier's safety record in [Safety Ratings, CSA & Inspections](/books/logistics/safety-and-csa), and service vans that cross the CMV line in Field Operations' [When a Service Van Is a Commercial Motor Vehicle](/books/field-operations/fleet-and-safety#when-a-service-van-is-a-commercial-motor-vehicle).

## How the Regulators Do It

Driver qualification is a set of federal and state registries that a carrier queries and that query each other. As of November 2026, from the regulations, Federal Register notices and the systems' own pages:

| System | Run by | What it holds | Who reads it | What the carrier does with it |
| --- | --- | --- | --- | --- |
| **CDLIS** (Commercial Driver's License Information System) | States, through the national pointer system | Each CDL holder's one license record: class, endorsements, restrictions, downgrades, and since June 23, 2025 the medical certification posted from the National Registry | States before issuing (383.73), carriers through the driver's motor vehicle record | Verifies the self-certified operation type and a valid medical certificate from the CDLIS record (391.23(m)(2)) |
| **PDPS** (Problem Driver Pointer System) | States | Pointers to disqualifications and convictions in other states | States before issuing a CLP or CDL (383.73(b)(3)) | Nothing directly; it is why a driver can hold only one license |
| **National Registry of Certified Medical Examiners** | FMCSA | Every examiner certified to perform driver physicals, and the results each examiner transmits "by midnight (local time) of the next calendar day" (391.43) | Carriers checking the examiner; states receiving results | Confirms the examiner was listed on the date the certificate was issued (391.23(m)(1)) |
| **Drug and Alcohol Clearinghouse** | FMCSA | Verified positive tests, alcohol results of 0.04 or more, refusals, actual-knowledge violations, return-to-duty and follow-up status | Employers (full and limited queries), states before licensing | A full query before hire and at least a limited query once a year for every driver (382.701); $1.25 a query |
| **Training Provider Registry** | FMCSA | Entry-level training providers and each trainee's completion certificate, filed "by midnight of the second business day" after training (380.717) | States before a skills test or H knowledge test (383.73) | Nothing to query after licensing; keeps the certificate in the file. 18,385 active providers and 2,089,330 drivers trained since February 2022, per the registry's page in November 2026 |
| **Pre-Employment Screening Program** | FMCSA | Crash and inspection history from MCMIS, released only "with the operator-applicant's written consent" (49 U.S.C. 31150) | Carriers and screening services | An optional pre-hire check; it is not part of the required file |
| **SAVE** | DHS | Immigration status | States issuing a non-domiciled CLP or CDL since March 16, 2026 (383.73(m)) | Nothing directly; the license's expiry date reflects it |

Three patterns:

- **The record of truth moved to the state.** Medical certification used to be a paper card the driver carried and the carrier copied; since the National Registry integration took effect on June 23, 2025, the examiner sends the result to FMCSA, FMCSA sends it to the state, and the state posts it to CDLIS. A carrier that still keys medical expiry off a scanned card is reading a copy of a record it can no longer rely on.
- **Every check is a query with a date.** The Clearinghouse, the motor vehicle record and the National Registry all answer "as of when I asked"; the regulations require the carrier to ask on schedules (before hire, every 12 months, within 24 hours of a limited query that found something) and to keep the answer. The system stores queries and results, not a driver's current status.
- **The state enforces the employer's rules.** Clearinghouse-II made states downgrade a prohibited driver's license, and the non-domiciled rule made them verify immigration status in SAVE. A driver can therefore stop being qualified because a state acted, with no event inside the carrier, which is why the annual motor vehicle record is a floor, not a schedule.

## The License

A CDL is required for the vehicle groups in 49 CFR 383.91:

| Group | Vehicle | Threshold |
| --- | --- | --- |
| **A** (combination) | A combination with a gross combination weight rating of 26,001 pounds or more | When the vehicle or vehicles towed are rated above 10,000 pounds |
| **B** (heavy straight) | A single vehicle rated 26,001 pounds or more | Or such a vehicle towing a vehicle rated not over 10,000 pounds |
| **C** (small) | A vehicle that is neither A nor B | Designed for 16 or more passengers including the driver, or carrying hazardous materials that require placards |

Endorsements add a vehicle or cargo type, each with its own test (383.93): **T** double and triple trailers, **P** passenger, **N** tank vehicle, **H** hazardous materials, **X** the combined tank and hazmat endorsement, and **S** school bus. Restrictions narrow the license: **L** no air brakes, **Z** no full air brakes, **E** no manual transmission, **O** no tractor-trailer, **M** no Class A passenger vehicle, **N** no Class A and B passenger vehicles, **K** intrastate only and **V** a medical variance (383.153). The two N codes are different fields, one an endorsement and one a restriction, which is a reason to store endorsements and restrictions as separate arrays rather than one string. The H endorsement also needs a TSA security threat assessment, which [Hazardous Materials in Transport](/books/logistics/hazmat-in-transport) covers.

A state may issue a CDL valid "for no more than 8 years," must check CDLIS and PDPS before issuing it, and since November 18, 2024 "must request information from the Drug and Alcohol Clearinghouse" first (383.73). At issuance and renewal the driver self-certifies one of four operation types (383.71(b)(1)): **non-excepted interstate** (subject to part 391 and required to hold a medical certificate), **excepted interstate** (interstate but only in operations that 390.3(f), 391.2, 391.68 or 398.3 except from part 391), **non-excepted intrastate** and **excepted intrastate** (subject to state rules). A for-hire carrier's interstate drivers are non-excepted interstate almost without exception, and a CDLIS record that shows anything else for one of them is a disqualifying mismatch, not a data quirk.

A driver can lose the license's commercial privilege through disqualification: under 383.51, a first major offense (alcohol, leaving the scene, a felony using a CMV) is one year, three if the driver was hauling placarded hazmat, and a second is lifetime; a second serious traffic violation in three years is 60 days and a third 120; violating an out-of-service order is 180 days to one year for a first offense, 180 days to two years with hazmat or passengers. Part 391 has its own parallel list for the carrier (391.15). The carrier learns of most of these from the driver, who must report a lost privilege "by the end of the next business day," or from the next motor vehicle record.

## The Driver Qualification File

Every carrier keeps a qualification file for each driver it employs (49 CFR 391.51), and an employee under the safety rules includes "an independent contractor while in the course of operating a commercial motor vehicle" (390.5), so a leased-on owner-operator gets a file too. The file holds:

| Item | Rule | When | May be removed |
| --- | --- | --- | --- |
| Employment application | 391.21 | Before driving | No |
| Motor vehicle record from every state the driver held a license in over the preceding 3 years | 391.23(a)(1) | Requested within 30 days of the start of employment | No |
| Road test certificate, or a license or certificate accepted as equivalent | 391.31, 391.33 | Before driving | No |
| Safety performance history from previous DOT-regulated employers, 3 years back | 391.23(a)(2), (d), (e) | Investigation in the file within 30 days of start | Kept with the file |
| Annual motor vehicle record, covering at least the preceding 12 months | 391.25(a) | At least once every 12 months | 3 years after execution |
| Note of the annual review, naming the reviewer and the date | 391.25(c)(2) | Every 12 months | 3 years after execution |
| Medical examiner's certificate, or for CDL drivers the CDLIS record showing certification, and any variance | 391.43(g), 391.51(b)(7) | Before driving; renewed at expiry | 3 years after execution |
| Note verifying the examiner was on the National Registry | 391.23(m) | Before driving | 3 years after execution |

The file is kept "for as long as a driver is employed by that motor carrier and for three years thereafter," and the items marked removable may be purged three years after they were executed (391.51(c), (d)). The application, the pre-hire record and the road test stay for the whole life of the file.

**The annual review.** At least once every 12 months the carrier gets each driver's record from every state that licensed the driver and reviews it for disqualifying offenses, "any evidence that the driver has violated any applicable Federal Motor Carrier Safety Regulations," and the driver's accident and traffic history, giving "great weight" to violations such as speeding, reckless driving and operating under the influence (391.25(b)). The review's output is a note with a reviewer and a date; the system's job is to make sure the record it reviewed is the one fetched for that cycle and that the reviewer saw it. The motor vehicle record itself is a consumer report when an insurer reads it ([Motor Vehicle Records](/books/insurance/consumer-reports-and-third-party-data#motor-vehicle-records) covers that use); for a carrier it is a qualification record.

**Previous employers.** For each DOT-regulated employer that used the driver in the preceding three years, the carrier asks for the driver's accident history and, under 391.23(e), whether the driver violated the drug and alcohol prohibitions, failed to complete a substance abuse professional's return-to-duty program, and, for a driver who completed one and stayed with that employer, any alcohol result of 0.04 or more, verified positive test or refusal. The former employer must answer "within 30 days," including a confirmation when it has no data (391.23(g)(1)). A missing answer is documented as a good-faith effort, not ignored. Since January 6, 2023, employers subject to the Clearinghouse use it for the drug and alcohol part of this history (391.23(e)(4)), which is why a pre-hire inquiry today is a Clearinghouse full query plus a safety history request, and the old letter-based drug and alcohol inquiry survives only for the years before the Clearinghouse held them. A driver who refuses consent to either may not drive (391.23(f)).

## Medical Certification

A driver must have been "medically examined and certified" within the preceding 24 months (391.45(b)); a driver with insulin-treated diabetes or certified under the alternative vision standard is re-examined within 12 months, and an examiner can certify for less. The examiner records the exam on Form MCSA-5875, issues the certificate on MCSA-5876, and transmits the results on MCSA-5850 to FMCSA through the National Registry "by midnight (local time) of the next calendar day after" the exam (391.43). A driver an examiner finds not qualified is reported, and every certificate previously issued to that driver stops being valid (391.43(g)(3)).

The National Registry integration changed where the certificate lives. FMCSA's rule postponed the integration's compliance date from June 22, 2021 to June 23, 2025 to finish the systems, and from that day examiners stopped issuing paper certificates to CLP and CDL holders; FMCSA sends results "electronically from the National Registry" to state licensing agencies, which post them to the driver's CDLIS record. A carrier verifies a CDL driver's medical status from that record (391.23(m)(2)); the paper copy the rule allowed as a 15-day bridge applied "through June 22, 2025." CVSA asked FMCSA to let drivers carry paper while states caught up, and FMCSA granted a nationwide six-month exemption allowing a paper certificate for up to 60 days from April 11 to October 11, 2026, then renewed it for Alaska alone, "the only State that has not implemented" the integration, through October 12, 2027. From October 12, 2026, a CDL driver licensed in any other state, and the driver's carrier, can no longer rely on a paper certificate "for any period." A driver without a CDL (a CMV between 10,001 and 26,000 pounds) still receives a paper certificate from the examiner (391.43(g)(2)), and the carrier still files a copy.

What the system keeps per certification: the exam date, the expiry the examiner set, the examiner's registry number and the date the carrier confirmed it was on the Registry, any variance (a vision or diabetes exemption, a Skill Performance Evaluation certificate), and the source it was read from (the CDLIS record, or a paper certificate for a non-CDL or Alaska driver). The expiry drives dispatch, so it is checked against the CDLIS record before it is trusted, because a state can post a different date than the one the driver reported, or none.

## The Drug and Alcohol Clearinghouse

Part 382 requires drug and alcohol testing of CDL drivers (pre-employment, random, post-accident, reasonable suspicion, return-to-duty and follow-up), and the Clearinghouse is the national record of violations. Who reports what, and how fast:

- **Medical review officers** report verified positive, adulterated or substituted drug results and some refusals "within 2 business days" of the determination (382.705(a)).
- **Employers** report alcohol results of 0.04 or more, refusals, negative return-to-duty results, completion of follow-up testing and actual knowledge of on-duty, pre-duty or post-accident alcohol use or drug use "by the close of the third business day" after learning of them (382.705(b)).
- **Substance abuse professionals** report the initial assessment and the driver's eligibility for return-to-duty testing by the close of the next business day (382.705(d)).

Employers query it in two ways (382.701). A **full query**, which needs the driver's "specific consent" given electronically inside the Clearinghouse, is required before a driver first performs safety-sensitive functions for the employer and returns the records themselves. A **limited query** says only whether records exist, needs a written consent the employer collects outside the Clearinghouse that may be "effective for more than one year," and satisfies the requirement to query "at least once per year for information for all employees." If a limited query finds information, the employer runs a full query "within 24 hours"; until it does and the record shows no prohibition, the driver may not keep driving. Each query costs $1.25 whether limited or full, bought in plans directly from FMCSA, and a full query that follows a limited one is charged once. The employer keeps a record of each query for three years (382.701(e)) and each consent for three years from the last query it covered (382.703(a)).

**Clearinghouse-II.** The 2021 final rule (effective November 8, 2021, compliance required November 18, 2024) made the states use the Clearinghouse: a state licensing agency may not "issue, renew, upgrade, or transfer" a CDL or CLP for a driver who is prohibited, and when FMCSA notifies it that a driver is prohibited, it removes the commercial privilege and records the downgrade on CDLIS "within 60 days." The prohibition itself starts "as soon as the drug and alcohol program violation occurs," not when the state acts, so the carrier's obligation to stop the driver starts at the violation, and the downgrade is a second, later event the next motor vehicle record will show. After return-to-duty and a negative test reported to the Clearinghouse, the driver reapplies to the state and drives again only when "fully licensed to do so."

## Entry-Level Driver Training

Since February 7, 2022, a person applying "for the first time" for a Class A or B CDL, upgrading to one, or seeking a first P, S or H endorsement must complete training from "a provider listed on the Training Provider Registry" (380.609). The provider files the certificate (the trainee's name and license number, the class or endorsement, theory or behind-the-wheel and the clock hours, the provider's registry number and the completion dates) by midnight of the second business day after completion (380.717), and the state may not give the skills test, or the hazmat knowledge test, "until the State verifies electronically" that the training was completed (383.73). The carrier's interest is narrower than the state's: a carrier that runs a training school is a provider with its own registry obligations, and a carrier hiring a new CDL holder keeps the evidence in the file, but it does not re-verify what the state checked before testing.

## English Language Proficiency

A driver must be able to "read and speak the English language sufficiently to converse with the general public, to understand highway traffic signs and signals in the English language, to respond to official inquiries, and to make entries on reports and records" (391.11(b)(2)). The rule is old; its enforcement is new. Executive Order 14286 of April 28, 2025 directed FMCSA to ensure violations result in out-of-service orders, and CVSA added 391.11(b)(2) to the North American Standard Out-of-Service Criteria effective June 25, 2025. FMCSA's August 10, 2026 proposed rule to codify that (doc 2026-16288) reports what changed: from January 2025 to June 24, 2025, 7,812 English proficiency violations and 33 out-of-service orders; from June 25, 2025 to March 19, 2026, 60,399 violations and 19,045 out-of-service orders, none of them inside the U.S.-Mexico border commercial zones, where 44,354 violations in the same period were cited without one. The proposal would keep that border zone exception for trips that stay inside the zones; comments closed October 9, 2026, and the Federal Register shows no final rule as of November 22, 2026. At the roadside the inspector begins in English, interviews the driver to test responses to official inquiries, and then gives a highway sign recognition assessment, including electronic message signs.

Enforcement is uneven by state as well: the California Highway Patrol's inspection manual, revised July 2025, says 391.11 "is not adopted by California" and that the requirement "shall not be enforced" on its inspection reports. A carrier's system records an English proficiency out-of-service order as an inspection result like any other ([Safety Ratings, CSA & Inspections](/books/logistics/safety-and-csa)); what it should not do is record a driver's language ability as a field set at hiring, because the rule is assessed at the roadside, by the inspector, on the day.

## Non-Domiciled CDLs

A non-domiciled CDL is issued by a state to a person domiciled outside the United States, and must say "Non-domiciled CDL" or "Non-domiciled Commercial Driver's License" prominently on its face (383.153(c)). FMCSA's interim final rule of September 29, 2025 limited eligibility for foreign-domiciled applicants to three employment-based nonimmigrant statuses; the D.C. Circuit stayed it administratively on November 10, 2025 and pending review on November 13, 2025 (No. 25-1215), so the prior rules applied. The final rule, published February 13, 2026 (91 FR 7044) and effective March 16, 2026, kept the core of the interim rule: foreign-domiciled applicants must hold H-2A, H-2B or E-2 status and present an unexpired foreign passport and I-94 at every issuance, transfer, renewal and upgrade (employment authorization documents no longer count); the state verifies status through SAVE; the license expires on the I-94 date or one year after issuance, whichever is sooner; every transaction is in person; and a state that learns a holder has lost status must downgrade the license within 30 days (383.73(f)). The rule also rescinded 2023 guidance that had let Mexican DACA recipients obtain non-domiciled CDLs.

Challengers petitioned for review (Rivera Lujan v. FMCSA, No. 26-1032, consolidated with 26-1046). On May 5, 2026 a divided panel denied stays of the final rule pending review, Judge Wilkins noting he would grant them, and expedited the case. As of November 22, 2026 I found no merits decision. <!-- source-gap: logistics-drivers-and-qualification-nondomiciled-merits | status | merits outcome of Rivera Lujan v. FMCSA, No. 26-1032, on the non-domiciled CDL final rule | closes with: a D.C. Circuit opinion or docket entry in 26-1032 | checked: 2026-11-22 --> For a carrier the rule's practical effect is a license with a short, hard expiry: a non-domiciled CDL's expiry tracks an immigration document, so the system has to read it from the license record and alert on it like a medical card, never assume the standard eight years.

## Leased-On Owner-Operators

An owner-operator leased to a carrier drives under the carrier's authority, so the carrier qualifies the driver exactly as it qualifies an employee: the same file, the same Clearinghouse queries and the same medical checks. The lease itself is governed by 49 CFR 376: it must give the carrier "exclusive possession, control, and use of the equipment for the duration of the lease," state when it begins and ends, and set out compensation and chargebacks ([The Logistics Business](/books/logistics/logistics-business#an-asset-carrier-load) covers the pay terms in 376.12). The regulation says that control "is not intended to affect whether the lessor or driver provided by the lessor is an independent contractor or an employee"; that question belongs to state and federal employment law, which Workforce owns in [ABC Tests](/books/workforce/worker-classification#abc-tests). In the data model a leased owner-operator is a `drivers` row with `engagement = 'leased_owner_operator'` and a person party; Truckload covers the lease's operational side.

## How to Build It

The extensions below add licenses, medical certificates, qualification items, previous employer inquiries and Clearinghouse queries to the core `drivers` and `documents` tables. Two extensions to the core tables, written to run on a live database as [The Core Data Model](/books/logistics/logistics-business#the-core-data-model) explains:

```sql
ALTER TABLE drivers
  ADD COLUMN hired_on     DATE,                -- starts the 30-day pre-hire clocks
  ADD COLUMN separated_on DATE,                -- starts the 3-year file retention
  ADD COLUMN qualification_checked_at TIMESTAMPTZ;  -- last run of the qualification view
ALTER TABLE drivers ADD CONSTRAINT drivers_separated_after_hired_check
  CHECK (separated_on IS NULL OR hired_on IS NULL OR separated_on >= hired_on) NOT VALID;
ALTER TABLE drivers VALIDATE CONSTRAINT drivers_separated_after_hired_check;

ALTER TABLE documents
  ADD COLUMN retain_until DATE,                 -- the earliest date it may be purged; null: keep
  ADD COLUMN legal_hold   BOOLEAN NOT NULL DEFAULT FALSE;  -- a claim, audit or suit overrides retain_until
CREATE INDEX CONCURRENTLY documents_retain_until_idx ON documents (retain_until)
  WHERE legal_hold = FALSE;
```

`documents.retain_until` is the column every chapter in this part uses for its retention rules (a qualification file, a shipping paper, a claim file); purging reads it and never deletes a row on hold. The regulatory papers themselves (a medical certificate, a motor vehicle record, a road test) are `documents` rows of kind `'other'` holding the bytes and hash, and the tables below say what each one is, so the core `kind` check doesn't grow by one value for every regulated paper.

```sql
CREATE TABLE driver_licenses (            -- each license a driver has held, as verified
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  driver_id          UUID NOT NULL REFERENCES drivers (id),
  kind               TEXT NOT NULL CHECK (kind IN ('cdl', 'clp', 'non_cdl')),
  country            CHAR(2) NOT NULL,
  subdivision        TEXT NOT NULL,       -- the issuing state, ISO 3166-2
  number_ref         TEXT NOT NULL,       -- a vault reference, never the number
  class              CHAR(1) CHECK (class IN ('A', 'B', 'C')),
  endorsements       TEXT[] NOT NULL DEFAULT '{}' CHECK (endorsements <@
                       ARRAY['T', 'P', 'N', 'H', 'X', 'S']::TEXT[]),
  restrictions       TEXT[] NOT NULL DEFAULT '{}' CHECK (restrictions <@
                       ARRAY['L', 'Z', 'E', 'O', 'M', 'N', 'K', 'V']::TEXT[]),
  non_domiciled      BOOLEAN NOT NULL DEFAULT FALSE,
  operation_type     TEXT CHECK (operation_type IN ('non_excepted_interstate',
                       'excepted_interstate', 'non_excepted_intrastate',
                       'excepted_intrastate')),  -- the 383.71(b)(1) self-certification
  issued_on          DATE,
  expires_on         DATE NOT NULL,
  hazmat_expires_on  DATE,                -- the H endorsement's own renewal date
  status             TEXT NOT NULL CHECK (status IN ('valid', 'downgraded', 'suspended',
                       'revoked', 'cancelled', 'expired')),
  verified_via       TEXT NOT NULL CHECK (verified_via IN ('cdlis_mvr', 'state_mvr',
                       'license_image')),
  verified_at        TIMESTAMPTZ NOT NULL,
  document_id        UUID REFERENCES documents (id),  -- the record it was read from
  CHECK ((kind = 'non_cdl') = (class IS NULL)),
  CHECK (hazmat_expires_on IS NULL OR 'H' = ANY (endorsements) OR 'X' = ANY (endorsements))
);

CREATE TABLE driver_medical_certificates (  -- a medical certification, from wherever it was read
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  driver_id              UUID NOT NULL REFERENCES drivers (id),
  examined_on            DATE NOT NULL,
  expires_on             DATE NOT NULL,   -- as the examiner set it; 24 months or less
  examiner_registry_number TEXT NOT NULL,
  examiner_verified_at   TIMESTAMPTZ,     -- the 391.23(m) National Registry check
  variance               TEXT NOT NULL DEFAULT 'none' CHECK (variance IN ('none',
                           'vision_standard', 'insulin_treated_diabetes',
                           'skill_performance_evaluation', 'medical_exemption')),
  source                 TEXT NOT NULL CHECK (source IN ('cdlis_mvr', 'paper_certificate')),
  read_at                TIMESTAMPTZ NOT NULL,
  superseded_at          TIMESTAMPTZ,     -- a later exam, or a not-qualified finding
  document_id            UUID REFERENCES documents (id),
  CHECK (expires_on > examined_on),
  CHECK (expires_on <= examined_on + INTERVAL '24 months')
);

CREATE TABLE driver_qualification_items (  -- one required record in the 391.51 file
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  driver_id       UUID NOT NULL REFERENCES drivers (id),
  kind            TEXT NOT NULL CHECK (kind IN ('employment_application', 'pre_hire_mvr',
                    'road_test', 'annual_mvr', 'annual_review', 'medical_certificate',
                    'registry_verification', 'eldt_certificate',
                    'safety_performance_history')),
  cycle_start     DATE,                   -- the 12-month cycle an annual item covers
  due_on          DATE NOT NULL,
  completed_at    TIMESTAMPTZ,
  completed_by    UUID REFERENCES parties (id),  -- the reviewer the annual note must name
  good_faith_note TEXT,                   -- when a state or employer never answered
  removable_on    DATE,                   -- 391.51(d): 3 years after execution, for some kinds
  document_id     UUID REFERENCES documents (id),
  UNIQUE (driver_id, kind, cycle_start)
);

CREATE TABLE driver_employer_inquiries (  -- 391.23(d) and (e), per previous employer
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  driver_id           UUID NOT NULL REFERENCES drivers (id),
  employer_party_id   UUID NOT NULL REFERENCES parties (id),
  employed_during     DATERANGE NOT NULL,  -- as the application states it
  covers_drug_alcohol BOOLEAN NOT NULL,    -- false for years the Clearinghouse holds
  requested_at        TIMESTAMPTZ NOT NULL,
  response_due_at     TIMESTAMPTZ NOT NULL,  -- requested_at plus 30 days
  responded_at        TIMESTAMPTZ,
  outcome             TEXT CHECK (outcome IN ('history_provided', 'no_data_confirmed',
                        'no_response_good_faith')),
  document_id         UUID REFERENCES documents (id)
);

CREATE TABLE clearinghouse_queries (      -- every query, its consent and its answer
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  driver_id            UUID NOT NULL REFERENCES drivers (id),
  employer_party_id    UUID NOT NULL REFERENCES parties (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('full_pre_employment', 'limited_annual',
                         'full_follow_up')),
  consent_document_id  UUID REFERENCES documents (id),  -- the written limited-query consent
  consented_at         TIMESTAMPTZ NOT NULL,  -- for full queries, in the Clearinghouse
  queried_at           TIMESTAMPTZ NOT NULL,
  result               TEXT NOT NULL CHECK (result IN ('no_record', 'record_exists',
                         'prohibited', 'not_prohibited')),
  follow_up_due_at     TIMESTAMPTZ,        -- 24 hours after a limited query with a record
  follows_query_id     UUID REFERENCES clearinghouse_queries (id),
  fee                  BIGINT NOT NULL DEFAULT 125,  -- minor units; $1.25 a query
  currency             CHAR(3) NOT NULL DEFAULT 'USD',
  retain_until         DATE NOT NULL,      -- 3 years from the query
  CHECK ((kind = 'limited_annual') = (consent_document_id IS NOT NULL)),
  CHECK (follow_up_due_at IS NULL OR (kind = 'limited_annual' AND result = 'record_exists'))
);

CREATE INDEX ON driver_qualification_items (driver_id, kind, due_on);
CREATE INDEX ON clearinghouse_queries (driver_id, queried_at DESC);
CREATE INDEX ON driver_medical_certificates (driver_id, expires_on DESC)
  WHERE superseded_at IS NULL;
```

Qualification is a view over these rows, evaluated on a date, never a flag someone sets:

```sql
CREATE VIEW driver_qualification AS      -- who may drive a CMV today, and why not
SELECT d.id AS driver_id,
       d.carrier_party_id,
       ARRAY_REMOVE(ARRAY[
         CASE WHEN l.id IS NULL OR l.status <> 'valid' OR l.expires_on < CURRENT_DATE
              THEN 'license' END,
         CASE WHEN m.id IS NULL OR m.expires_on < CURRENT_DATE
              THEN 'medical_certificate' END,
         CASE WHEN m.id IS NOT NULL AND m.examiner_verified_at IS NULL
              THEN 'registry_verification' END,
         CASE WHEN q.id IS NULL OR q.queried_at < NOW() - INTERVAL '12 months'
              THEN 'clearinghouse_query' END,
         CASE WHEN q.result IN ('prohibited', 'record_exists')
              THEN 'clearinghouse_result' END,
         CASE WHEN a.completed_at IS NULL OR a.completed_at < NOW() - INTERVAL '12 months'
              THEN 'annual_review' END
       ], NULL) AS blockers
FROM drivers d
LEFT JOIN LATERAL (SELECT * FROM driver_licenses
                   WHERE driver_id = d.id AND kind = 'cdl'
                   ORDER BY verified_at DESC LIMIT 1) l ON TRUE
LEFT JOIN LATERAL (SELECT * FROM driver_medical_certificates
                   WHERE driver_id = d.id AND superseded_at IS NULL
                   ORDER BY expires_on DESC LIMIT 1) m ON TRUE
LEFT JOIN LATERAL (SELECT * FROM clearinghouse_queries
                   WHERE driver_id = d.id AND employer_party_id = d.carrier_party_id
                   ORDER BY queried_at DESC LIMIT 1) q ON TRUE
LEFT JOIN LATERAL (SELECT * FROM driver_qualification_items
                   WHERE driver_id = d.id AND kind = 'annual_review'
                   ORDER BY completed_at DESC NULLS LAST LIMIT 1) a ON TRUE
WHERE d.status IN ('onboarding', 'active');
```

A driver with an empty `blockers` array may be dispatched; dispatch reads the view at assignment time and records `qualification_checked_at`. A first-year driver has no annual review due yet, so a production version keys the annual checks off `hired_on`; the sketch shows the shape. And the compliance team's weekly list, every item coming due in the next 30 days:

```sql
SELECT d.id, i.kind, i.due_on
FROM driver_qualification_items i
JOIN drivers d ON d.id = i.driver_id
WHERE d.carrier_party_id = $1
  AND d.status = 'active'
  AND i.completed_at IS NULL
  AND i.due_on < CURRENT_DATE + 30
UNION ALL
SELECT m.driver_id, 'medical_certificate', m.expires_on
FROM driver_medical_certificates m
JOIN drivers d ON d.id = m.driver_id
WHERE d.carrier_party_id = $1 AND d.status = 'active'
  AND m.superseded_at IS NULL AND m.expires_on < CURRENT_DATE + 30
ORDER BY 3;
```

Design notes:

- **Dates come from the rule, and the rule is data.** The 24-month medical maximum, the 12-month review cycle, the 30-day inquiry window, the 24-hour follow-up query and the three-year retentions each belong in a rules table with an effective date, so the October 12, 2026 end of paper certificates or a final English proficiency rule is a new row, not a deploy ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **Read the state's record, store what was read.** A license or medical certificate row is a reading of a CDLIS motor vehicle record on a date, with the document it came from. A newer reading supersedes it; it is never edited.
- **Prohibition outranks every other field.** A Clearinghouse result of `prohibited`, or a `record_exists` without its full query inside 24 hours, blocks dispatch the moment it is recorded, whatever the license row says, because the state's downgrade can lag by 60 days.
- **The CDL number and test results are sensitive.** The license number stays in a vault as in the core `drivers` table, and Clearinghouse results and medical variances are health and test data: restrict who can read them, log every read, and keep them out of the dispatch view, which needs only the blockers ([Classify Every Field](/docs/security/sensitive-data#classify-every-field)).
- **Emit the changes dispatch cares about.** `driver.qualification_lapsed`, `driver.qualification_restored`, `clearinghouse_query.record_found` and `driver_license.downgraded` are what dispatch, hours of service and the onboarding workflow subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

An FMCSA investigation of a carrier's driver qualification asks for the file of a sample of drivers, so the records have to reconstruct the file as it stood on any past date:

- **Each required item, with its due date and the date it was completed,** including the reviewer named on every annual review and the good-faith note wherever a state or previous employer never answered.
- **Every Clearinghouse query** with its kind, consent, timestamp, result and the follow-up full query where one was required, for three years.
- **Every license and medical reading,** with the record it was read from, so a dispatch on a given day can be shown to have relied on a valid license and certificate as known then.
- **Every dispatch decision against the qualification view,** with the blockers it saw, so an out-of-service order or a crash involving an unqualified driver can be traced to the record that should have stopped it.
- **Retention honored, not guessed:** items purged only after `removable_on` or `retain_until`, the file kept three years past separation, and holds respected.

The record mechanics are in [Audit Trails](/docs/building-blocks/audit-trails) and retention schedules in [Retention Schedules by Record Type](/docs/building-blocks/data-retention#retention-schedules-by-record-type).

## What This Means for the System You Build

- **Compute qualification as a view over dated records,** and check it at dispatch, not at hire.
- **Treat CDLIS as the source for CDL medical status** since June 23, 2025, and for every CDL driver outside Alaska stop accepting paper certificates as of October 12, 2026.
- **Store every Clearinghouse query with its consent and result,** and block a driver when a limited query finds a record until the full query clears it.
- **Keep the qualification file's items with due dates, reviewers and removal dates,** and keep the file three years after the driver leaves.
- **Store endorsements and restrictions as separate code lists** from the license record, with the hazmat endorsement's own expiry.
- **Model a non-domiciled CDL's short expiry** from the license record, never a default term.
- **Record English proficiency where it is decided,** as a roadside inspection result, not a hiring attribute.
- **Qualify a leased owner-operator like an employee,** and leave the employment question to the employment rules.

## References

**Regulations**

- [49 CFR 380.609: General requirements for entry-level driver training](https://www.law.cornell.edu/cfr/text/49/380.609), who must train, the Training Provider Registry and the February 7, 2022 start
- [49 CFR 380.717: Training certification](https://www.law.cornell.edu/cfr/text/49/380.717), what a provider files and the second-business-day deadline
- [49 CFR 382.701: Drug and Alcohol Clearinghouse queries](https://www.law.cornell.edu/cfr/text/49/382.701), pre-employment full queries, annual limited queries, the 24-hour follow-up and three-year records
- [49 CFR 382.703: Driver consent](https://www.law.cornell.edu/cfr/text/49/382.703), written and electronic consent, its retention and refusal
- [49 CFR 382.705: Reporting to the Clearinghouse](https://www.law.cornell.edu/cfr/text/49/382.705), what MROs, employers and SAPs report and their deadlines
- [49 CFR 383.51: Disqualification of drivers](https://www.law.cornell.edu/cfr/text/49/383.51), major offenses, serious traffic violations and out-of-service order violations
- [49 CFR 383.71: Driver application and certification procedures](https://www.law.cornell.edu/cfr/text/49/383.71), the four operation-type self-certifications
- [49 CFR 383.73: State procedures](https://www.law.cornell.edu/cfr/text/49/383.73), CDLIS and PDPS checks, the Clearinghouse query, training verification, eight-year validity and non-domiciled rules
- [49 CFR 383.91: Commercial motor vehicle groups](https://www.law.cornell.edu/cfr/text/49/383.91), Groups A, B and C
- [49 CFR 383.93: Endorsements](https://www.law.cornell.edu/cfr/text/49/383.93), endorsement types and tests
- [49 CFR 383.153: Information on the CLP and CDL documents](https://www.law.cornell.edu/cfr/text/49/383.153), endorsement and restriction codes and the non-domiciled marking
- [49 CFR 391.11: General qualifications of drivers](https://www.law.cornell.edu/cfr/text/49/391.11), the English language requirement
- [49 CFR 391.15: Disqualification of drivers](https://www.law.cornell.edu/cfr/text/49/391.15), disqualifying offenses and reporting by the next business day
- [49 CFR 391.23: Investigation and inquiries](https://www.law.cornell.edu/cfr/text/49/391.23), state records, previous employers, the 30-day response, the Clearinghouse from January 6, 2023 and National Registry verification
- [49 CFR 391.25: Annual inquiry and review of driving record](https://www.law.cornell.edu/cfr/text/49/391.25), the 12-month record and review note
- [49 CFR 391.43: Medical examination; certificate of physical examination](https://www.law.cornell.edu/cfr/text/49/391.43), forms, next-day transmission and the June 23, 2025 change
- [49 CFR 391.45: Persons who must be medically examined and certified](https://www.law.cornell.edu/cfr/text/49/391.45), the 24-month and 12-month cycles
- [49 CFR 391.51: General requirements for driver qualification files](https://www.law.cornell.edu/cfr/text/49/391.51), contents, retention and removable items
- [49 CFR 390.5: Definitions](https://www.law.cornell.edu/cfr/text/49/390.5), an employee includes an independent contractor operating a CMV
- [49 CFR 376.12: Written lease requirements](https://www.law.cornell.edu/cfr/text/49/376.12), exclusive possession and control and the classification disclaimer

**Statutes**

- [49 U.S.C. 31150: Safety performance history screening](https://www.law.cornell.edu/uscode/text/49/31150), pre-employment screening access and written consent

**Federal Register**

- [Drug and Alcohol Clearinghouse; Clearinghouse-II final rule (October 7, 2021)](https://www.govinfo.gov/content/pkg/FR-2021-10-07/html/2021-21928.htm), the November 18, 2024 compliance date, state queries and the 60-day downgrade
- [FMCSA: Federal Register documents on Medical Examiner's Certification Integration](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=%22Medical+Examiner%27s+Certification+Integration%22&order=newest&per_page=10), the June 23, 2025 compliance date (doc 2021-13177) and the CVSA paper certificate exemptions (docs 2026-07173 and 2026-20649)
- [Qualification of Drivers; CVSA; Application for Exemption (October 8, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-10-08/html/2026-20649.htm), electronic certification since June 23, 2025, the Alaska exemption and the October 12, 2026 end of paper for other states
- [English Language Proficiency; Out of Service Criteria, proposed rule (August 10, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-08-10/html/2026-16288.htm), E.O. 14286, the June 25, 2025 CVSA criteria, enforcement counts, the border zone exception and the roadside assessment
- [FMCSA: Federal Register documents on English language proficiency](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=%22English+language+proficiency%22&conditions[agencies][]=federal-motor-carrier-safety-administration&order=newest&per_page=10), no final rule after the August 2026 proposal as of November 22, 2026
- [Restoring Integrity to the Issuance of Non-Domiciled CDLs, final rule (February 13, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-02-13/html/2026-02965.htm), eligibility, documents, SAVE, expiry, the March 16, 2026 effective date and the stay of the interim rule

**Courts**

- [D.C. Circuit: order in Rivera Lujan v. FMCSA, No. 26-1032 (May 5, 2026)](https://media.cadc.uscourts.gov/orders/docs/2026/05/26-1032LDSN2.pdf), stays of the final rule denied, Judge Wilkins dissenting from the denial, expedited briefing

**Agencies**

- [FMCSA Drug and Alcohol Clearinghouse: Query plans](https://clearinghouse.fmcsa.dot.gov/Query/Plan), $1.25 a query, limited and full queries and consent
- [FMCSA Training Provider Registry](https://tpr.fmcsa.dot.gov/), provider and trainee counts and the certification deadline
- [California Highway Patrol: HPM 82.6, Chapter 3, Inspection Policies (revised July 2025)](https://www.chp.ca.gov/siteassets/policy/hpm/hpm-82.6/hpm-82.6-ch-3.pdf), 391.11's English requirement not enforced in California
