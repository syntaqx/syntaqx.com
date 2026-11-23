+++
title = "Safety Ratings, CSA & Inspections"
nav_title = "Safety, CSA & Inspections"
description = "How FMCSA measures carriers: SMS BASICs and the enhanced SMS, safety ratings, new entrants, roadside inspections, out-of-service orders, DataQs and crashes."
category = "Logistics & Supply Chain Industry"
order = 2825
part = "Carrier Regulation"
tags = ["logistics", "trucking", "fmcsa", "csa", "roadside-inspections", "safety", "compliance"]
+++

A motor carrier's safety record is built by people who never see its systems. A state trooper writes up a brake out of adjustment at a weigh station; a city police officer files a crash report after a car rear-ends a trailer at a light; an FMCSA safety investigator spends two days in a carrier's office sampling driver files and logs. Each of those reports lands in FMCSA's Motor Carrier Management Information System under the carrier's USDOT number, and once a month FMCSA's Safety Measurement System (SMS) turns the last two years of them into percentiles that decide which carriers get a warning letter or an investigation. Brokers, shippers and insurers read what is public of the same record when they decide whether to use the carrier, which is why a carrier's inspection history is a commercial asset as much as a compliance one, and why carriers spend real money contesting reports they think are wrong.

The software is hard because the carrier never owns the record. The inspection report is the state's document, the violation codes are the CFR sections the inspector chose, the percentiles are FMCSA's computation over every carrier in a peer group, and the methodology itself has been rewritten: FMCSA approved an enhanced SMS in November 2024 that replaces the BASICs with "compliance categories," regroups 959 violations into 116, and changes the severity weights, and as of November 2026 it still hasn't launched. A carrier's system mirrors the government's records, ties them to its own drivers and equipment, tracks the repairs and challenges it owes on each, and predicts what the next monthly snapshot will show. This chapter covers SMS and the enhanced SMS, safety ratings and investigations, the new entrant program, roadside inspections and out-of-service orders, DataQs, crash preventability, and the tables that hold them. Who may drive is in [Drivers: CDLs, Qualification & the Clearinghouse](/books/logistics/drivers-and-qualification); hours violations come from [Hours of Service](/books/logistics/hours-of-service) and [ELDs & Telematics](/books/logistics/electronic-logging-devices). Field Operations covers service vans that cross the CMV line ([When a Service Van Is a Commercial Motor Vehicle](/books/field-operations/fleet-and-safety#when-a-service-van-is-a-commercial-motor-vehicle)) and telematics safety scores ([Safety Scores and Dashcams](/books/field-operations/fleet-and-safety#safety-scores-and-dashcams)), which this chapter doesn't repeat.

## How the Regulators Do It

Carrier safety oversight is a pipeline of programs run by different bodies. As of November 2026, from the regulations, Federal Register notices and FMCSA's CSA site:

| Program | Run by | What it does | Cadence and window | Status as of November 2026 |
| --- | --- | --- | --- | --- |
| **Roadside inspections** | State enforcement agencies under CVSA's North American Standard program | Eight inspection levels; violations cited by CFR section; out-of-service orders under CVSA's criteria | Each inspection; reports flow to FMCSA's MCMIS | In use; Level VIII (electronic, in motion) defined, adopted by each state as its infrastructure allows |
| **Safety Measurement System** | FMCSA | Seven BASICs ranked into percentiles to prioritize carriers for intervention | Updated monthly over 24 months of inspections and crashes | In use; FMCSA tells carriers to keep using it "until the updated system is in effect" |
| **Enhanced SMS** | FMCSA | Compliance categories, 116 violation groups, severity weights of 1 or 2, proportionate percentiles | Same data | Approved by notice of November 20, 2024; in "Phase 2: Revise Prioritization," no launch date |
| **Interventions** | FMCSA and state investigators | Warning letters, offsite and onsite investigations, cooperative safety plans, notices of violation and claim | When a carrier is prioritized, or on a complaint or crash | In use |
| **Safety ratings** | FMCSA | Satisfactory, Conditional or Unsatisfactory from a compliance review against the safety fitness standard (49 CFR 385) | Only after an onsite review; most carriers are Unrated | In use; an Unsatisfactory rating ends operation on day 46 or 61 |
| **New entrant program** | FMCSA | 18 months of monitoring and a safety audit for every new USDOT number | Audit within 12 months of starting operations for property carriers (49 U.S.C. 31144(g)) | In use |
| **DataQs** | States, with FMCSA's system | Requests for data review of inspections and crashes | Three review stages, 21 to 45 days each | Revised requirements published April 16, 2026, effective with the system release about 150 days later |
| **Crash Preventability Determination Program** | FMCSA | Reviews eligible crashes; not-preventable ones leave the Crash Indicator calculation | 21 crash types for crashes on or after December 1, 2024 | In use, through DataQs |

Three patterns:

- **One record, many readers.** The same inspection feeds the carrier's SMS percentiles, its driver's pre-employment screening record, an investigator's sampling and a broker's vetting. A carrier's system that mirrors inspections by report number and refreshes them monthly sees what every reader sees; one that records only its own drivers' accounts of them doesn't.
- **The methodology is versioned, and the version changes the answer.** The enhanced SMS renames the categories, moves Controlled Substances and Alcohol into Unsafe Driving, splits Vehicle Maintenance in two, and FMCSA's own analysis says it would prioritize 3 percent more carriers. Every stored percentile needs the methodology that produced it.
- **Challenges are the carrier's lever.** DataQs requests and crash preventability reviews are the only ways a carrier changes its record, and both now run on fixed timelines with stages and burdens of proof. They are workflows with deadlines, not emails.

## The Safety Measurement System

SMS groups inspection violations and crashes into seven Behavior Analysis and Safety Improvement Categories (BASICs): **Unsafe Driving**, **Crash Indicator**, **Hours-of-Service Compliance**, **Vehicle Maintenance**, **Controlled Substances/Alcohol**, **Hazardous Materials Compliance** and **Driver Fitness**. It draws on roadside inspections and crash reports from "the last two years," refreshes monthly, ranks each carrier against others with similar exposure, and assigns a percentile per BASIC that FMCSA uses to prioritize interventions. Not all of it is public: "The Crash Indicator BASIC is not public," Hazardous Materials Compliance is restricted too, and complete SMS results are limited to enforcement users and to a carrier logged into its own profile. FMCSA's published SMS methodology sets the weights and the intervention thresholds by BASIC and carrier type; I don't reproduce the thresholds here because the CSA site's page on them returned an error when checked. <!-- source-gap: logistics-safety-and-csa-thresholds | missing | current SMS intervention thresholds by BASIC and carrier type (general, passenger, hazmat) | closes with: FMCSA's SMS Methodology document or the CSA site's prioritization page | checked: 2026-11-22 -->

What reaches each BASIC, in the data:

- **Unsafe Driving:** moving violations at the roadside (speeding, following too close, hand-held phone use).
- **Hours-of-Service Compliance:** log and hours violations, including the "no record of duty status" violation that a revoked ELD produces ([ELDs & Telematics](/books/logistics/electronic-logging-devices)).
- **Vehicle Maintenance:** brakes, lights, tires and the rest of part 393 and 396, from inspections.
- **Controlled Substances/Alcohol:** possession and use violations at the roadside.
- **Hazardous Materials Compliance:** shipping papers, placards, marking and securement ([Hazardous Materials in Transport](/books/logistics/hazmat-in-transport)).
- **Driver Fitness:** license, medical certificate and qualification violations. The English language requirement is itself a qualification rule (391.11), so its roadside violations sit with the driver's qualification record ([English Language Proficiency](/books/logistics/drivers-and-qualification#english-language-proficiency)); I haven't confirmed on an FMCSA page which BASIC they score in. <!-- source-gap: logistics-safety-and-csa-elp-basic | missing | which SMS BASIC 391.11(b)(2) English proficiency violations are assigned to | closes with: FMCSA's SMS methodology violation table, opened | checked: 2026-11-22 -->
- **Crash Indicator:** state-reported crashes that meet the reportable threshold, less those found not preventable.

FMCSA's interventions escalate in steps (the CSA site's own list): a **warning letter** about performance and compliance problems; a **targeted roadside inspection** aimed at the carrier's specific problems; an **offsite investigation**, where an investigator reviews documents remotely; an **onsite focused investigation** on specific problems; an **onsite comprehensive investigation** of the whole operation; and follow-on actions, a voluntary **cooperative safety plan**, a **notice of violation** ("severe enough to warrant formal action, but not civil penalties") or a **notice of claim** ("severe enough to warrant assessment and civil penalties").

### The Enhanced SMS

FMCSA's November 20, 2024 notice approved changes previewed in 2023: BASICs become "compliance categories"; Controlled Substances/Alcohol and all operating-while-out-of-service violations move into Unsafe Driving; Vehicle Maintenance splits into **Vehicle Maintenance: Driver Observed** and **Vehicle Maintenance**; Driver Fitness is segmented by straight and combination carriers, and Hazardous Materials by cargo tank and non-cargo tank carriers; the 959 roadside violations collapse into 116 groups; the 1-to-10 severity scale becomes weights of 1 or 2; proportionate percentiles replace safety event groups; percentiles are computed only for carriers with violations in the past 12 months in that category; and the utilization factor cap rises from 200,000 to 250,000 vehicle miles per power unit. FMCSA estimated the change would prioritize 3 percent more carriers, with a crash rate of 7.77 crashes per 100 power units for the prioritized group against a national rate of 5.00. A follow-up Federal Register notice is to announce the launch. As of November 22, 2026, the CSA site still reads "Coming Soon: An Enhanced Safety Measurement System," lists the program in "Phase 2: Revise Prioritization (Current Phase)" with no date for Phase 3, and says carriers should keep monitoring the current SMS "until the updated system is in effect."

For the system this means two methodologies with the same inputs. Store each violation with both its BASIC and, once FMCSA publishes the crosswalk in production, its compliance category and group; store each snapshot with the methodology that produced it; and don't compare a percentile across the switch without saying so.

## Safety Ratings and Investigations

A safety rating is FMCSA's determination of whether a carrier meets the safety fitness standard, made after a compliance review, "an examination of motor carrier operations" covering hours of service, maintenance, driver qualification, accidents and hazmat (49 CFR 385.3). There are three ratings and an absence of one:

- **Satisfactory:** the carrier "has in place and functioning adequate safety management controls."
- **Conditional:** the carrier "does not have adequate safety management controls in place," in a way that could lead to the occurrences 385.5 lists.
- **Unsatisfactory:** the same finding, where the lack of controls has already led to them.
- **Unrated:** "a safety rating has not been assigned."

An Unsatisfactory rating is a countdown. A carrier transporting placardable hazmat or passengers is prohibited from operating "beginning on the 46th day after the date of the FMCSA notice of proposed 'unsatisfactory' rating," and other carriers on the 61st day, which FMCSA may extend by up to 60 days for a carrier making a good-faith effort (385.13). The carrier's system holds the proposed rating, its date and the computed prohibition date as a deadline, because brokers and shippers who see the proposal will stop tendering before the date arrives. A carrier is rated only after a compliance review, so a broker's rule that requires "Satisfactory" excludes every Unrated carrier, new entrants included; [Carrier Onboarding & Vetting](/books/logistics/carrier-onboarding) covers how brokers read ratings.

## New Entrants

Every carrier with a new USDOT number is a new entrant. Part 385 subpart D puts it under monitoring "for a period of 18 months" and schedules a safety audit "once it has been in operation for enough time to have sufficient records," which "will generally be at least 3 months" (385.307). The statute sets the outer deadline: the safety review must happen "not later than 12 months after" a property carrier begins operations under its registration, 120 days for passenger carriers (49 U.S.C. 31144(g)(1)). Some violations expedite the process (385.308): a new entrant that commits one before its audit is scheduled for one "as soon as practicable," and one already audited gets a notice to submit evidence of corrective action "within 30 days of the service date of the notice." New entrant registration that is revoked ends the carrier's authority to operate, which [Operating Authority & Registration](/books/logistics/operating-authority) covers. For a broker's vetting rules, the new entrant flag and the registration date are the two facts that matter: a carrier a few weeks old has no inspection history for SMS to rank.

## Roadside Inspections

States inspect under the CVSA North American Standard inspection program; members sign a memorandum of understanding to follow its inspection procedures, operational policies and out-of-service standards, which FMCSA has approved and which every member jurisdiction in the U.S., Canada and Mexico uses. The levels, as the California Highway Patrol's inspection manual describes them from CVSA Operational Policy 5:

| Level | Name | What it covers |
| --- | --- | --- |
| **I** | North American Standard Inspection | The primary inspection at a fixed inspection facility, and the one CHP wants done in the field whenever possible |
| **II** | Walk-Around Driver/Vehicle Inspection | Driver and vehicle, used where location, weather or temperature preclude a Level I, or when a Level III turns up mechanical violations |
| **III** | Driver/Credential/Administrative Inspection | Driver-related violations only, such as qualifications and moving violations; the minimum for a vehicle stopped at the roadside |
| **IV** | Special Inspection | A one-time examination of a particular item, usually for a study or an enforcement campaign |
| **V** | Vehicle-Only Inspection | The vehicle only; the primary inspection at a carrier's terminal |
| **VI** | Transuranic Waste and Highway Route Controlled Quantities of Radioactive Materials | Inspection of these radioactive shipments by specially trained inspectors |
| **VII** | Jurisdictional Mandated Commercial Vehicle Inspection | A state-mandated program that meets no other level; no CVSA decal |
| **VIII** | Electronic Inspection | Conducted "electronically or wirelessly while the vehicle is in motion without direct interaction with an inspector" |

A vehicle that passes an inspection without a critical defect can receive a **CVSA decal**, which other jurisdictions honor (none is issued with a Level VII, or when a raised lift axle has a critical defect); CHP's manual says vehicles "displaying valid CVSA decals should not be subject to Level I inspections during the current month of the decal and the following two months," and that the decal is removed if a mechanical out-of-service violation is found. Level VIII arrives state by state: CHP's manual says it "will be implemented when the Department has the infrastructure in place to support this type of inspection."

**Out-of-service orders.** CVSA's North American Standard Out-of-Service Criteria set the conditions under which an inspector puts a driver or vehicle out of service; they are "not regulations," but FMCSA incorporates the radioactive materials handbook edition by reference (the April 1, 2024 edition, with the April 1, 2025 edition proposed in November 2025 and, as of November 22, 2026, no final rule adopting it in the Federal Register), and states enforce the criteria through their own law. A vehicle declared out of service gets an "Out-of-Service Vehicle" sticker, may not be operated (towing counts, except by crane or hoist) until the repairs are done, and nobody may remove the sticker before then (49 CFR 396.9(c)). The driver delivers the inspection report to the carrier, and to the intermodal equipment provider if there is one, and within 15 days the carrier certifies that "all violations noted have been corrected" and keeps a copy for 12 months (396.9(d)). A driver out of service (for hours, for no valid medical certificate, for English proficiency since June 2025) may not drive until the condition clears.

Inspections are not the only vehicle checks. Drivers prepare daily vehicle inspection reports and every vehicle needs a periodic inspection within the preceding 12 months (396.11, 396.17); Field Operations' [When a Service Van Is a Commercial Motor Vehicle](/books/field-operations/fleet-and-safety#when-a-service-van-is-a-commercial-motor-vehicle) covers both, and [Carrier Dispatch & Asset Management](/books/logistics/carrier-operations) covers maintenance programs for a fleet.

**Speed limiters.** FMCSA and NHTSA withdrew the 2016 proposal to require speed limiting devices on heavy vehicles over 26,000 pounds, and FMCSA its 2022 supplemental advance notice, on July 24, 2025 (90 FR 34822), citing policy and safety concerns and data gaps. A carrier's governed speed is a company policy and a telematics setting, not a federal requirement.

## Crashes

A crash counts for FMCSA when it involves a CMV on a highway and results in "a fatality," bodily injury to someone who "immediately receives medical treatment away from the scene," or disabling damage requiring a vehicle to be towed away; boarding and alighting, and loading and unloading, are excluded (49 CFR 390.5). The carrier keeps an **accident register** "for 3 years after the date of each accident," with the date, the city and state, the driver, the number of injuries and fatalities, whether hazmat (other than the vehicle's own fuel) was released, and copies of the reports governments and insurers required (390.15). States report crashes to FMCSA, and they reach the Crash Indicator BASIC whether or not the carrier was at fault.

**Crash preventability.** The Crash Preventability Determination Program lets a carrier or driver ask FMCSA to review an eligible crash. For crashes on or after December 1, 2024, 21 crash types are eligible, among them being struck in the rear, struck while legally stopped or parked, a motorist driving the wrong way or not stopping in traffic, an impaired, sleeping, distracted or medically incapacitated other driver, cargo or debris from another vehicle, infrastructure failure, animal strikes, crashes with a non-motorist, and any other crash where video shows the sequence of events. A request needs a police accident report; documents FMCSA asks for are due within 14 calendar days or the result may be "Undecided"; and a preventable or undecided result can be reopened once. A not-preventable crash stays on the public SMS website in a separate table, leaves the Crash Indicator calculation, and is the only kind of determination noted on the driver's Pre-Employment Screening Program record. Dashcam video is what turns most of these from undecided to not preventable, which is the telematics argument Field Operations makes in [Safety Scores and Dashcams](/books/field-operations/fleet-and-safety#safety-scores-and-dashcams).

## DataQs

DataQs is "the online system for motor carriers, commercial motor vehicle (CMV) drivers, and other interested parties" to ask for review of federal and state crash and inspection data they think is wrong. In 2024 it received 8,314 requests about crashes and 63,548 about inspections and violations, against roughly 3 million inspections, 5 million violations and more than 180,000 vehicles in reportable crashes published each year. FMCSA's April 16, 2026 notice tied revised requirements to states' Motor Carrier Safety Assistance Program grants:

- **Three stages.** Initial review (the issuing officer can't alone close a request with no change), reconsideration by someone independent of the first decision and not the officer or the officer's supervisor, and final review by an uninvolved decision-maker or panel, whose decision FMCSA treats as final.
- **Clocks.** The state opens a request within 7 days, decides initial reviews and reconsiderations within 21 days and final reviews within 45; the requester appeals within 30 days of a decision and answers a request for information within 14, which pauses the state's clock rather than restarting it.
- **Limits.** Inspection requests are accepted within 3 years of the inspection and crash requests within 5 years; the requester bears the burden of proof; new evidence on appeal sends the request back to initial review; every decision states the decision-maker, evidence, decision and reasons.
- **Timing.** States submit implementation plans and the new requirements take effect with a DataQs system release, which the notice schedules on a 60, 120 and 150 day sequence from publication. <!-- source-gap: logistics-safety-and-csa-dataqs-release | status | whether the revised DataQs system release and requirements took effect around September 2026 as scheduled | closes with: an FMCSA announcement or DataQs release note dated after September 2026 | checked: 2026-11-22 -->

## How to Build It

The extensions below mirror the government's records (inspections, violations, crashes, monthly snapshots) and track the carrier's obligations on each (repairs, certifications, challenges). First, the rating facts on the core `carriers` table and an out-of-service flag source on `equipment_units`:

```sql
ALTER TABLE carriers
  ADD COLUMN safety_rating      TEXT,
  ADD COLUMN safety_rating_on   DATE,
  ADD COLUMN proposed_rating_on DATE;      -- notice of proposed unsatisfactory, starts the clock
ALTER TABLE carriers ADD CONSTRAINT carriers_safety_rating_check
  CHECK (safety_rating IN ('satisfactory', 'conditional', 'unsatisfactory', 'unrated'))
  NOT VALID;
ALTER TABLE carriers VALIDATE CONSTRAINT carriers_safety_rating_check;

ALTER TABLE equipment_units
  ADD COLUMN out_of_service_since TIMESTAMPTZ;  -- set from an inspection, cleared by repair
```

Then the records themselves:

```sql
CREATE TABLE roadside_inspections (       -- a state's inspection report, as published
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_party_id     UUID NOT NULL REFERENCES parties (id),
  report_number        TEXT NOT NULL,       -- the state's report number
  jurisdiction         TEXT NOT NULL,       -- ISO 3166-2 of the inspecting state or province
  level                SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 8),
  inspected_at         TIMESTAMPTZ NOT NULL,
  location             TEXT,                -- as reported
  position             GEOGRAPHY(Point, 4326),
  driver_id            UUID REFERENCES drivers (id),  -- matched; null until matched
  tractor_id           UUID REFERENCES equipment_units (id),
  trailer_id           UUID REFERENCES equipment_units (id),
  load_id              UUID REFERENCES loads (id),
  hazmat_placarded     BOOLEAN NOT NULL DEFAULT FALSE,
  driver_out_of_service  BOOLEAN NOT NULL DEFAULT FALSE,
  vehicle_out_of_service BOOLEAN NOT NULL DEFAULT FALSE,
  decal_issued         BOOLEAN NOT NULL DEFAULT FALSE,
  repairs_certified_at TIMESTAMPTZ,         -- the 396.9(d) certification
  certification_due_at TIMESTAMPTZ NOT NULL,  -- inspected_at plus 15 days, stored on insert
  source               TEXT NOT NULL CHECK (source IN ('driver_report', 'fmcsa_data',
                         'state_portal', 'telematics_level_viii')),
  received_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  document_id          UUID REFERENCES documents (id),
  UNIQUE (jurisdiction, report_number),
  CHECK (NOT decal_issued OR (level <> 7 AND NOT vehicle_out_of_service))
);

CREATE TABLE inspection_violations (      -- each violation cited on a report
  id                      UUID PRIMARY KEY DEFAULT uuidv7(),
  roadside_inspection_id  UUID NOT NULL REFERENCES roadside_inspections (id),
  cfr_section             TEXT NOT NULL,   -- as cited, e.g. '393.47(e)' or '391.11(b)(2)'
  description             TEXT NOT NULL,
  unit                    TEXT NOT NULL CHECK (unit IN ('driver', 'tractor', 'trailer',
                            'cargo', 'carrier')),
  out_of_service          BOOLEAN NOT NULL DEFAULT FALSE,
  basic                   TEXT CHECK (basic IN ('unsafe_driving', 'hos_compliance',
                            'vehicle_maintenance', 'controlled_substances_alcohol',
                            'hazmat_compliance', 'driver_fitness')),
  compliance_category     TEXT,            -- the enhanced SMS category, once published
  violation_group         TEXT,            -- the enhanced SMS group of 116
  severity_weight         SMALLINT,        -- as FMCSA's methodology assigned it, snapshot
  methodology             TEXT NOT NULL DEFAULT 'sms_2010' CHECK (methodology IN
                            ('sms_2010', 'sms_enhanced')),
  corrected_at            TIMESTAMPTZ
);

CREATE TABLE crash_reports (              -- an accident register row, and FMCSA's view of it
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_party_id      UUID NOT NULL REFERENCES parties (id),
  occurred_at           TIMESTAMPTZ NOT NULL,
  city                  TEXT NOT NULL,     -- or the nearest place, as 390.15 asks
  subdivision           TEXT NOT NULL,
  driver_id             UUID REFERENCES drivers (id),
  tractor_id            UUID REFERENCES equipment_units (id),
  load_id               UUID REFERENCES loads (id),
  fatalities            SMALLINT NOT NULL DEFAULT 0 CHECK (fatalities >= 0),
  injuries              SMALLINT NOT NULL DEFAULT 0 CHECK (injuries >= 0),
  towaway               BOOLEAN NOT NULL DEFAULT FALSE,
  hazmat_released       BOOLEAN NOT NULL DEFAULT FALSE,  -- other than the vehicle's own fuel
  state_report_number   TEXT,
  police_report_document_id UUID REFERENCES documents (id),
  preventability        TEXT NOT NULL DEFAULT 'not_requested' CHECK (preventability IN
                          ('not_requested', 'requested', 'not_preventable', 'preventable',
                           'undecided', 'not_eligible')),
  cpdp_crash_type       SMALLINT CHECK (cpdp_crash_type BETWEEN 1 AND 21),
  retain_until          DATE NOT NULL,     -- 3 years after the crash
  CHECK (fatalities > 0 OR injuries > 0 OR towaway)  -- below that it isn't a 390.5 accident
);

CREATE TABLE data_review_requests (       -- a DataQs request and its stages
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  roadside_inspection_id UUID REFERENCES roadside_inspections (id),
  crash_report_id        UUID REFERENCES crash_reports (id),
  kind                   TEXT NOT NULL CHECK (kind IN ('inspection_correction',
                           'violation_dispute', 'crash_correction', 'crash_preventability',
                           'wrong_carrier')),
  external_ref           TEXT,             -- the DataQs request number
  stage                  TEXT NOT NULL CHECK (stage IN ('initial_review', 'reconsideration',
                           'final_review')),
  submitted_at           TIMESTAMPTZ NOT NULL,
  decision_due_at        TIMESTAMPTZ,      -- 21 days, or 45 at final review, plus pauses
  info_requested_at      TIMESTAMPTZ,      -- the requester's 14 days run from here
  decided_at             TIMESTAMPTZ,
  outcome                TEXT CHECK (outcome IN ('data_corrected', 'no_change',
                           'no_requester_response', 'not_preventable', 'preventable',
                           'undecided')),
  appeal_by              TIMESTAMPTZ,      -- 30 days after a decision
  CHECK ((roadside_inspection_id IS NULL) <> (crash_report_id IS NULL))
);

CREATE TABLE carrier_safety_snapshots (   -- one month's published measure, per category
  carrier_party_id UUID NOT NULL REFERENCES parties (id),
  snapshot_on      DATE NOT NULL,          -- the SMS run date
  methodology      TEXT NOT NULL CHECK (methodology IN ('sms_2010', 'sms_enhanced')),
  category         TEXT NOT NULL,          -- a BASIC or a compliance category
  measure          NUMERIC(8, 2),
  percentile       NUMERIC(5, 2) CHECK (percentile BETWEEN 0 AND 100),
  inspections      INT,
  above_threshold  BOOLEAN,
  publicly_visible BOOLEAN NOT NULL,       -- Crash Indicator and HM are not
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (carrier_party_id, snapshot_on, methodology, category)
);

CREATE INDEX ON roadside_inspections (carrier_party_id, inspected_at DESC);
CREATE INDEX ON inspection_violations (roadside_inspection_id);
CREATE INDEX ON crash_reports (carrier_party_id, occurred_at DESC);
```

The compliance team's morning list, every out-of-service inspection whose repair certification is still open:

```sql
SELECT i.report_number, i.jurisdiction, i.inspected_at, i.certification_due_at,
       e.identifier AS tractor
FROM roadside_inspections i
LEFT JOIN equipment_units e ON e.id = i.tractor_id
WHERE i.carrier_party_id = $1
  AND (i.vehicle_out_of_service OR EXISTS (
        SELECT 1 FROM inspection_violations v
        WHERE v.roadside_inspection_id = i.id AND v.corrected_at IS NULL))
  AND i.repairs_certified_at IS NULL
ORDER BY i.certification_due_at;
```

And a carrier's own out-of-service rates over the same 24 months SMS uses:

```sql
SELECT COUNT(*) AS inspections,
       COUNT(*) FILTER (WHERE vehicle_out_of_service) AS vehicle_oos,
       COUNT(*) FILTER (WHERE driver_out_of_service)  AS driver_oos,
       ROUND(100.0 * COUNT(*) FILTER (WHERE vehicle_out_of_service)
             / NULLIF(COUNT(*) FILTER (WHERE level IN (1, 2, 5)), 0), 1) AS vehicle_oos_pct
FROM roadside_inspections
WHERE carrier_party_id = $1
  AND inspected_at > NOW() - INTERVAL '24 months';
```

Vehicle out-of-service rates count only levels that examine the vehicle, which is why the denominator filters to I, II and V.

Design notes:

- **The state's report is the key.** An inspection is identified by its jurisdiction and report number, not by this system's driver or truck; the driver's account comes first and is matched to the published record when it arrives, with the match kept and reviewable.
- **Snapshots are append-only.** A monthly percentile is a fact about that run; a later DataQs correction changes next month's snapshot, never last month's row ([Snapshots](/docs/database/temporal-data#snapshots)).
- **Clocks are deadlines on rows.** The 15-day repair certification, the 46th or 61st day after a proposed Unsatisfactory rating, the DataQs stages and the 14-day CPDP document window are computed and stored when the triggering event is recorded, with escalation before they pass ([Timers, Deadlines and Escalations](/docs/building-blocks/workflows#timers-deadlines-and-escalations)).
- **Out of service is a dispatch blocker.** `equipment_units.out_of_service_since` and a driver out-of-service order feed the same checks that [Drivers: CDLs, Qualification & the Clearinghouse](/books/logistics/drivers-and-qualification) uses, and clear only with the repair or the condition that ends the order.
- **Emit what others act on.** `inspection.recorded`, `inspection.out_of_service`, `crash.recorded`, `data_review.decided` and `safety_snapshot.threshold_crossed` are what maintenance, dispatch, safety coaching and insurance reporting subscribe to ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

A compliance review samples exactly these records, and a plaintiff's lawyer after a crash asks for them too:

- **Every inspection report as received,** with its matched driver and equipment, the repair certification and its date against the 15-day deadline, and the 12-month copy.
- **The accident register,** three years per crash, with the government and insurer reports attached.
- **Every DataQs and preventability request,** with what was submitted, each stage's decision and reasons, and the outcome.
- **Every monthly snapshot,** with its methodology, so the carrier can show what FMCSA's system said about it on the day a broker or investigator relied on it.
- **The link from violation to action:** the coaching, repair or policy change that followed each out-of-service order, which is what an investigator looks for as evidence of safety management controls.

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Mirror the government's records by their own keys,** jurisdiction and report number for inspections, and refresh them monthly with the SMS run.
- **Store every percentile with its methodology,** and plan for BASICs and compliance categories side by side when the enhanced SMS launches.
- **Treat out-of-service orders as dispatch blockers** for the driver or vehicle until the repair or condition clears, and track the 15-day certification.
- **Keep the accident register** with the 390.5 thresholds as a check, and the documents a preventability request needs.
- **Run DataQs and preventability requests as workflows** with stages, deadlines and stored reasons.
- **Compute a proposed Unsatisfactory rating's prohibition date** the day the notice arrives.
- **Don't build for speed limiter mandates;** the rulemaking was withdrawn in July 2025.

## References

**Regulations**

- [49 CFR 385.3: Definitions and acronyms](https://www.law.cornell.edu/cfr/text/49/385.3), the rating definitions and compliance review
- [49 CFR 385.13: Unsatisfactory rated motor carriers](https://www.law.cornell.edu/cfr/text/49/385.13), the 46th- and 61st-day prohibitions and the 60-day extension
- [49 CFR 385.307: New entrant safety monitoring procedures](https://www.law.cornell.edu/cfr/text/49/385.307), 18 months of monitoring and an audit after generally at least 3 months
- [49 CFR 385.308: Expedited safety audits and compliance reviews of new entrants](https://www.law.cornell.edu/cfr/text/49/385.308), an expedited audit as soon as practicable and 30 days for corrective action
- [49 CFR 390.5: Definitions](https://www.law.cornell.edu/cfr/text/49/390.5), the accident definition and its exclusions
- [49 CFR 390.15: Assistance in investigations and special studies](https://www.law.cornell.edu/cfr/text/49/390.15), the accident register and its three years
- [49 CFR 396.9: Inspection of motor vehicles and intermodal equipment in operation](https://www.law.cornell.edu/cfr/text/49/396.9), out-of-service stickers, the driver's report and the 15-day certification

**Statutes**

- [49 U.S.C. 31144: Safety fitness of owners and operators](https://www.law.cornell.edu/uscode/text/49/31144), the 12-month and 120-day new entrant safety review deadlines

**Federal Register**

- [Revised Safety Measurement System, approved changes (November 20, 2024)](https://www.govinfo.gov/content/pkg/FR-2024-11-20/html/2024-27087.htm), compliance categories, violation groups, severity weights, percentiles, crash rates and the launch by later notice
- [Crash Preventability Determination Program (December 4, 2024)](https://www.govinfo.gov/content/pkg/FR-2024-12-04/html/2024-28377.htm), the 21 crash types from December 1, 2024, the 14-day document window and SMS and PSP treatment
- [Revisions to DataQs Requirements for MCSAP Grant Funding (April 16, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-04-16/html/2026-07429.htm), the three stages, timelines, limits, implementation schedule and 2024 request volumes
- [Speed Limiting Devices; Withdrawal (July 24, 2025)](https://www.federalregister.gov/api/v1/documents/2025-13928.json), 90 FR 34822 withdrawing the 2016 proposal and 2022 supplemental notice
- [Incorporation by Reference; North American Standard Out-of-Service Criteria; Hazardous Materials Safety Permits (November 19, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-11-19/html/2025-20282.htm), the criteria as "not regulations," the 2024 edition in force and the 2025 edition proposed

**Agencies**

- [FMCSA CSA: Measure](https://csa.fmcsa.dot.gov/About/Measure), the seven BASICs, two years of data, monthly updates and what is not public
- [FMCSA CSA: Intervene](https://csa.fmcsa.dot.gov/About/Intervene), warning letters, targeted roadside inspections, investigations, cooperative safety plans and notices
- [FMCSA CSA: Prioritization preview](https://csa.fmcsa.dot.gov/prioritizationpreview), the enhanced SMS "Coming Soon," the current phase and SMS still in use, checked November 22, 2026
- [California Highway Patrol: HPM 82.6, Chapter 3, Inspection Policies (revised July 2025)](https://www.chp.ca.gov/siteassets/policy/hpm/hpm-82.6/hpm-82.6-ch-3.pdf), CVSA membership and out-of-service standards, the eight inspection levels, Level VIII adoption and decal practice
