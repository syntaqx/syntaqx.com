+++
title = "Prior Authorization"
description = "Asking the payer first: the 278, pharmacy ePA in NCPDP SCRIPT, CMS-0057-F's 2026 and 2027 dates, Da Vinci CRD, DTR and PAS, gold carding, and AI in review."
category = "Health Tech Industry"
order = 1925
part = "Revenue Cycle"
tags = ["health-tech", "prior-authorization", "cms-0057-f", "da-vinci", "fhir", "x12-278", "data-model"]
+++

Prior authorization is the payer's permission, requested before a service, that it will consider the service medically necessary and covered. The practice finds out whether one is needed, gathers the clinical documentation the payer wants, sends the request, waits, answers follow-up questions, and records the approval's number, scope and dates so the claim can cite it. Without it the claim is denied for "Precertification/authorization/notification/pre-treatment absent" (CARC 197), however necessary the service was. For a physical therapy clinic it is a visit count that runs out mid-plan; for an imaging center, every MRI; for a specialty pharmacy, most new prescriptions; for a dental office, mostly not prior authorization at all but its voluntary cousin, the predetermination.

The process is notoriously manual. HIPAA adopted an electronic standard for it (the X12 278) in 2000, and most requests still went by fax and portal because the 278 can carry the request but not easily the question of whether authorization is required or the documentation the payer needs. That is changing by regulation. CMS's interoperability and prior authorization final rule (CMS-0057-F) set decision deadlines for Medicare Advantage, Medicaid and marketplace plans from January 1, 2026 and requires a FHIR prior authorization API by January 1, 2027; HL7's Da Vinci project wrote the implementation guides; ONC adopted certification criteria for the provider side; and in June 2025 major insurers pledged to cut and speed up prior authorization. This chapter covers when authorization is required, the 278 and the fax reality, pharmacy ePA, CMS-0057-F, the Da Vinci guides, gold carding, AI in utilization review, and how to build it. It extends `orders`, `procedures` and `coverages` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model), and its output is the authorization number a claim cites ([The 837 Claim](/books/health-tech/claims#the-837-claim)).

## How the Platforms Do It

As of October 2026, from regulators', standards bodies' and vendors' pages:

| Program, standard or vendor | What it covers | Status or mechanics |
| --- | --- | --- |
| **X12 278** | HIPAA's adopted prior authorization transaction | Required standard; since February 28, 2024 CMS "will not take HIPAA Administrative Simplification enforcement action" against covered entities using a FHIR prior authorization API instead |
| **CMS-0057-F** | Medicare Advantage, Medicaid and CHIP fee-for-service and managed care, and marketplace (FFE) plans | Decision deadlines and metrics from 2026; Prior Authorization, Provider Access and Payer-to-Payer APIs by January 1, 2027 |
| **HL7 Da Vinci CRD, DTR, PAS** | FHIR guides for discovering requirements, completing documentation and submitting requests | PAS 2.2.1, CRD 2.2.1 and DTR 2.2.0, published March 27, 2026, all trial use |
| **ONC HTI-4** | Certification criteria for the provider side of electronic prior authorization | Finalized July 31, 2025, effective October 1, 2025 |
| **NCPDP SCRIPT ePA** | Prior authorization for prescriptions | Required for Medicare Part D sponsors and prescribers who do ePA since January 1, 2022 |
| **CMS WISeR model** | Prior authorization or pre-payment review for selected services in traditional Medicare, in six states | Runs January 1, 2026 to December 31, 2031, with technology companies "such as Artificial Intelligence (AI)" and licensed clinicians deciding non-payment |
| **Availity Essentials** | Provider portal | Prior authorization with attachments |

Three patterns:

- **Regulation is moving the transaction to FHIR.** The X12 278 stays the HIPAA standard on paper, CMS has stopped enforcing it against FHIR alternatives, and the 2027 API requirement is FHIR, implemented through the Da Vinci guides.
- **The hard part is before the request.** CRD (does this need authorization?) and DTR (what documentation does the payer want?) exist because the request itself was never the bottleneck; knowing to ask and what to send was.
- **Deadlines are now public.** Impacted payers must decide within set timeframes and report their metrics annually, so slow payers are visible.

## When Authorization Is Required

Payers publish lists of services needing authorization, by code, and the lists vary by plan, product and state, and change several times a year. Typical subjects:

- **High-cost imaging** (MRI, CT, PET) and cardiology studies, often through a radiology benefit manager.
- **Surgery and procedures,** inpatient admissions and some outpatient procedures.
- **Therapy visits** beyond an initial number, for physical, occupational and speech therapy; a 271 may report the limit as a message ([The 270 and 271](/books/health-tech/eligibility-and-benefits#the-270-and-271)).
- **Specialty drugs** and many brand drugs, through the pharmacy benefit.
- **Durable medical equipment, home health,** behavioral health services.

Dental differs. Dental plans rarely require prior authorization for routine care; instead the practice may send a **predetermination** (a pre-treatment estimate) for crowns, implants, periodontal surgery and orthodontics, which tells the patient what the plan would pay without binding the plan ([Dental Claims](/books/health-tech/claims#dental-claims)). Medicaid dental programs are the exception, with prior authorization for many services. A system serving both medical and dental practices models them as different objects: an authorization is permission, a predetermination is an estimate.

Software's first job is answering "is authorization required?" correctly. The sources, from best to worst: the payer's own answer through a CRD service or a 278 inquiry; the payer's published code lists, loaded as dated rules per plan; and the practice's own history of what was denied for lack of authorization. The answer is stored with its source and date on the order. The payer side of the same decision, who reviews a request and on what clock, is [Utilization Management](/books/health-tech/payer-operations#utilization-management) in Inside a Payer.

## The 278 and the Fax

The X12 278 request carries the patient, the requesting and servicing providers, the service (codes, quantity, dates, place), the diagnosis and, through attachments, clinical information; the response approves, denies, pends or modifies, with an authorization number and the approved scope. Payers had to support it under HIPAA, and in practice most authorizations went by payer portal, phone and fax, because the 278 didn't tell the practice whether authorization was needed or which documentation would satisfy the reviewer, and the attachment standard to carry the documentation wasn't adopted. The 2026 attachments rule (CMS-0053-F) deliberately left prior authorization attachments out, citing the FHIR API direction of CMS-0057-F ([Attachments](/books/health-tech/claims#attachments)).

The result is that today's authorization workflow, in a typical practice, is a work queue with a portal login per payer and a fax machine: identify the need, find the payer's form, attach notes from the chart, submit, call to check, record the number. Any product in this space has to support that reality (tracking, documents, reminders, number capture) while building toward the APIs.

## Pharmacy ePA

Prescription prior authorization has its own standard. NCPDP SCRIPT carries electronic prior authorization transactions between prescribers and pharmacy benefit plans: initiation, request, appeal and cancel, each with a response, so the plan can send its question set to the prescriber's system and the prescriber can answer inside the workflow. For Medicare Part D, a 2020 final rule adopted SCRIPT 2017071 for ePA: "Beginning January 1, 2022, Part D sponsors and prescribers must use the standard" when they conduct prior authorization electronically (non-electronic methods remain allowed). ONC's HTI-4 rule lets certified systems use SCRIPT 2017071 or 2023011 through December 31, 2027 and requires 2023011 from January 1, 2028. CMS proposed in April 2026 (CMS-0062-P) to extend the prior authorization API and decision timeframes to drugs, with a proposed compliance date of October 1, 2027; as of October 2026 it remains a proposal. E-prescribing itself is the Part 6 chapter [E-Prescribing & Pharmacy](/books/health-tech/e-prescribing).

## CMS-0057-F

The Interoperability and Prior Authorization final rule was released January 17, 2024. As of October 2026, from CMS's fact sheet and policy page:

**Who it covers.** Medicare Advantage organizations, state Medicaid and CHIP fee-for-service programs, Medicaid managed care plans, CHIP managed care entities, and qualified health plan issuers on the federally facilitated exchanges. Employer plans and traditional Medicare are not "impacted payers."

**From January 1, 2026:**

- **Decision timeframes** of 72 hours for expedited requests and 7 calendar days for standard requests (marketplace plans are excluded from this requirement).
- **A specific denial reason** for every denied request, whatever channel it came through.
- **Public reporting** of prior authorization metrics annually, with the first report due March 31, 2026: the share of requests approved, denied and approved after appeal, and average decision times.

**By January 1, 2027** (dates vary somewhat by payer type):

- **A Prior Authorization API** built on FHIR, so a provider's system can learn whether authorization is required, see documentation requirements, submit the request and receive the decision.
- **A Provider Access API** giving in-network providers claims, encounter and clinical data for their attributed patients, and a **Payer-to-Payer API** moving a member's data when they change plans.

**For providers,** an "Electronic Prior Authorization" measure: MIPS clinicians report it from the 2027 performance period, and hospitals and critical access hospitals from the 2027 EHR reporting period ([Value-Based Care & Quality](/books/health-tech/value-based-care#mips-and-the-quality-payment-program)).

What this means for a vendor: payers will expose the APIs, and the provider-side systems that call them need ONC's new certification criteria to count for the measure.

## Da Vinci CRD, DTR and PAS

HL7's Da Vinci project wrote three FHIR implementation guides that together replace the fax:

| Guide | Question it answers | How it works |
| --- | --- | --- |
| **Coverage Requirements Discovery (CRD)** | Does this order need authorization, documentation or a different site of care? | The provider's EHR calls the payer's CRD service as a CDS Hooks request when an order is signed or an appointment booked; the payer returns cards ("prior authorization required," "documentation needed") |
| **Documentation Templates and Rules (DTR)** | What does the payer need to know? | The payer supplies a questionnaire (FHIR Questionnaire with logic) that the EHR prefills from the chart; the clinician completes only what's missing |
| **Prior Authorization Support (PAS)** | Submit and get a decision | A FHIR Claim bundle sent to the payer's endpoint, mapped by an intermediary to the 278 where the payer still requires it, with a ClaimResponse carrying the decision |

As of October 2026, the published versions are PAS 2.2.1, CRD 2.2.1 and DTR 2.2.0 (March 27, 2026), succeeding the 2.1.0 releases of December 2024. ONC's HTI-4 rule adopted three certification criteria for the provider side, one for each: a provider prior authorization API for coverage requirements discovery, for documentation templates and rules, and for prior authorization support. FHIR, CDS Hooks and SMART are the Part 2 chapters [FHIR](/books/health-tech/fhir) and [SMART on FHIR & App Platforms](/books/health-tech/smart-on-fhir).

A small practice won't build CRD clients itself; its PMS or EHR vendor will, or a prior authorization vendor will through the EHR. What a PMS for a small practice needs is to hold the result: the order or appointment, whether authorization was required and by whose answer, the questionnaire response, the submission and the decision.

## Industry Commitments and Gold Carding

On June 23, 2025, HHS and CMS announced a pledge by health insurers, whose plans cover "nearly eight out of 10 Americans," to reduce the volume of prior authorization by January 1, 2026 and to give "real-time approvals for most requests" by 2027. AHIP's own announcement adds a standardized electronic prior authorization framework built on FHIR APIs, with the goal of having it operational by January 1, 2027; at least 80 percent of electronic prior authorization approvals (with all needed clinical documentation) answered in real time in 2027; and, from January 1, 2026, a 90-day transition in which a new plan honors existing authorizations for benefit-equivalent in-network services when a patient changes plans mid-treatment. AHIP's progress update reports that participating plans have eliminated 11% of prior authorizations across a range of medical services since the commitments, 6.5 million fewer, with a reduction of more than 15% in Medicare Advantage. These are voluntary commitments, not rules, and the progress figures are the plans' own survey.

**Gold carding** exempts a provider with a strong approval record from prior authorization for a service. Texas's HB 3459, which became law without the governor's signature on June 18, 2021 and took effect September 1, 2021, was the first broad law of this kind. As amended by HB 3812 (2025), effective September 1, 2025, Insurance Code section 4201.653 bars an HMO or insurer from requiring preauthorization for a particular service from a physician or provider if, in the most recent one-year evaluation period, it approved (or would have approved) at least 90% of that provider's requests for the service and the provider performed it at least five times; the insurer evaluates once a year and the provider doesn't have to apply. The original 2021 text used a six-month evaluation period, so material written before the amendment still describes that. Other states have since passed versions. For software, a gold card is a per-provider, per-service, per-payer exemption with dates, checked when deciding whether authorization is required, and the approval history that earns it is worth tracking by the practice itself.

## AI in Utilization Review

Payers use software to screen requests, and states have started to limit how far it goes. California's SB 1120 (Chapter 879, Statutes of 2024, signed September 28, 2024; a majority-vote, non-urgency statute, so in force from January 1, 2025) amends the Health and Safety Code for health plans and the Insurance Code for insurers: only a licensed physician or a licensed health care professional competent to evaluate the clinical issues may deny or modify a request for reasons of medical necessity, and an AI, algorithm or other software tool used in utilization review must base its determination on the enrollee's own clinical history and circumstances, not solely on a group dataset, and must not supplant the provider's decision-making. Texas went further in 2025: SB 815 added Insurance Code section 4201.156, which bars a utilization review agent from using an automated decision system to make an adverse determination in whole or in part.

In traditional Medicare, CMS's WISeR model (Wasteful and Inappropriate Service Reduction) runs from January 1, 2026 to December 31, 2031 in six states, each with one technology company (Cohere Health in Texas, Genzeon in New Jersey, Humata Health in Oklahoma, Innovaccer in Ohio, Virtix Health in Washington, Zyter in Arizona), using "enhanced technologies, such as Artificial Intelligence (AI)" for prior authorization or pre-payment review of selected services such as skin substitutes, electrical nerve stimulator implants and knee arthroscopy for osteoarthritis. CMS states that "All recommendations for non-payment are determined by appropriately licensed clinicians." A practice in those states treats the selected services as authorization-required for traditional Medicare patients, which a system holds as one more dated rule. AI used by the provider side (drafting the request, summarizing the chart) is Part 10's [AI in Health Tech](/books/health-tech/ai-in-health-tech#coding-revenue-cycle-and-prior-authorization-ai) chapter.

## How to Build It

The core `orders` (a service request) and `appointments` are what an authorization covers. This chapter adds requirement rules, the authorizations themselves and their events:

```sql
CREATE TABLE authorization_requirements ( -- "does this need authorization?", as dated data
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  payer_id         UUID NOT NULL REFERENCES payers (id),
  plan_id          UUID REFERENCES plans (id),       -- null: all the payer's plans
  program          TEXT,                              -- e.g. 'wiser_tx' for a model state
  procedure_codes  TEXT[] NOT NULL,
  place_of_service TEXT[],
  after_visits     SMALLINT,                          -- therapy: required after N visits
  source           TEXT NOT NULL CHECK (source IN ('payer_list', 'crd', '271_message',
                     'denial_history', 'regulation')),
  source_ref       TEXT,
  valid_during     DATERANGE NOT NULL
);

CREATE TABLE gold_card_exemptions (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  practitioner_id  UUID NOT NULL REFERENCES practitioners (id),
  payer_id         UUID NOT NULL REFERENCES payers (id),
  procedure_codes  TEXT[] NOT NULL,
  valid_during     DATERANGE NOT NULL,
  notice_doc_id    UUID REFERENCES documents (id)
);

CREATE TABLE prior_authorizations (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  patient_id        UUID NOT NULL REFERENCES patients (id),
  coverage_id       UUID NOT NULL REFERENCES coverages (id),
  order_id          UUID REFERENCES orders (id),
  kind              TEXT NOT NULL CHECK (kind IN ('authorization', 'predetermination',
                      'pharmacy_epa', 'referral')),
  requirement       TEXT NOT NULL CHECK (requirement IN ('required', 'not_required', 'exempt',
                      'unknown')),
  requirement_rule_id UUID REFERENCES authorization_requirements (id),
  requesting_practitioner_id UUID REFERENCES practitioners (id),
  procedure_codes   TEXT[] NOT NULL,
  diagnosis_codes   TEXT[] NOT NULL,
  quantity_requested NUMERIC,                -- visits, units
  urgency           TEXT NOT NULL CHECK (urgency IN ('standard', 'expedited')),
  channel           TEXT NOT NULL CHECK (channel IN ('fhir_pas', 'x12_278', 'ncpdp_script',
                      'portal', 'fax', 'phone', '837d')),
  questionnaire_response JSONB,              -- DTR answers, when used
  submitted_at      TIMESTAMPTZ,
  decision_due_at   TIMESTAMPTZ,             -- 72 hours or 7 days for impacted payers
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'pended',
                      'info_requested', 'approved', 'partially_approved', 'denied', 'cancelled',
                      'expired')),
  auth_number       TEXT,                    -- cited on the claim (REF*G1)
  approved_quantity NUMERIC,
  used_quantity     NUMERIC NOT NULL DEFAULT 0,
  valid_during      DATERANGE,
  denial_reason     TEXT,                    -- required to be specific from impacted payers
  decided_at        TIMESTAMPTZ
);
CREATE INDEX prior_authorizations_active_idx ON prior_authorizations (patient_id, status, valid_during);

CREATE TABLE prior_auth_events (         -- every submission, response, call and document
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  prior_auth_id    UUID NOT NULL REFERENCES prior_authorizations (id),
  kind             TEXT NOT NULL CHECK (kind IN ('requirement_checked', 'submitted', 'response',
                     'info_requested', 'info_sent', 'call', 'appeal', 'peer_to_peer', 'extended')),
  txn_id           UUID REFERENCES edi_transactions (id),  -- 278, PAS bundle, SCRIPT message
  document_ids     UUID[] NOT NULL DEFAULT '{}',
  note             TEXT,
  actor            TEXT NOT NULL,          -- typed: staff, practitioner, system, payer
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

When an appointment is booked or an order signed, the system resolves the requirement:

```sql
SELECT r.id, r.after_visits
FROM authorization_requirements r
JOIN coverages c ON c.id = $1 AND (r.plan_id IS NULL OR r.plan_id = c.plan_id)
JOIN plans p     ON p.id = c.plan_id
WHERE r.payer_id = p.payer_id
  AND r.procedure_codes && $2::text[]
  AND r.valid_during @> $3::date            -- date of service
  AND NOT EXISTS (
        SELECT 1 FROM gold_card_exemptions g
        WHERE g.practitioner_id = $4 AND g.payer_id = p.payer_id
          AND g.procedure_codes && $2::text[] AND g.valid_during @> $3::date)
ORDER BY r.plan_id NULLS LAST
LIMIT 1;
```

Design notes:

- **Requirement answers are recorded with their source,** because "the payer's CRD said not required" is a defense against a later denial and "our list said so" is weaker.
- **Count usage against approvals.** A therapy authorization for 12 visits decrements with each completed visit, and the scheduler warns before booking the visit that exceeds it, which is when a renewal request should go in.
- **Approvals expire.** An approved MRI not done in the window needs a new request; the claim builder checks the date of service against `valid_during`.
- **The claim cites the number** from the authorization valid on the date of service, and the denial classifier links CARC 197 denials back to the missing or expired authorization ([Denial Categories](/books/health-tech/denials-and-appeals#denial-categories)).
- **Deadlines for impacted payers** are computed at submission (72 hours expedited, 7 days standard), so overdue decisions are visible and reportable.

## Auditing

- **Every requirement check,** its source and answer, kept with the order.
- **Every submission and response,** raw (278, PAS bundle, SCRIPT message) or as the faxed document, with times, since decision time is now a regulated metric for impacted payers.
- **What clinical documentation was sent,** exactly, because the authorization's scope and any appeal rest on it.
- **Authorization usage and expirations** against the services billed.

## What This Means for the System You Build

- **Answer "is authorization required?" from dated rules with sources:** payer CRD, payer lists, 271 messages, gold card exemptions, model states, and denial history.
- **Model authorizations, predeterminations, pharmacy ePA and referrals as distinct kinds,** with dental predeterminations as estimates, not permissions.
- **Support the fax and portal reality** with tracking, documents and reminders, while building toward FHIR PAS, CRD and DTR.
- **Track approved quantities and windows,** warn before exceeding them, and cite the right number on the claim.
- **Compute payer decision deadlines** for CMS-0057-F's impacted payers and record specific denial reasons.
- **Watch the dates:** decision timeframes since January 1, 2026, FHIR prior authorization APIs by January 1, 2027, SCRIPT 2023011 from 2028, and the proposed drug rule.

## References

**Regulations and federal programs**

- [CMS: Interoperability and Prior Authorization final rule (CMS-0057-F) fact sheet](https://www.cms.gov/newsroom/fact-sheets/cms-interoperability-and-prior-authorization-final-rule-cms-0057-f), impacted payers, decision timeframes, metrics reporting, the APIs and dates, the provider ePA measure, the 278 enforcement discretion
- [CMS: CMS-0057-F policy page](https://www.cms.gov/priorities/key-initiatives/burden-reduction/interoperability/policies-and-regulations/cms-interoperability-and-prior-authorization-final-rule-cms-0057-f), current status and resources
- [Federal Register: CMS-0062-P proposed rule (April 14, 2026)](https://www.federalregister.gov/api/v1/documents/2026-07205.json), prior authorization for drugs, the proposed October 1, 2027 date
- [ASTP/ONC: HTI-4 final rule](https://healthit.gov/resources/hti-4-final-rule-electronic-prescribing-real-time-prescription-benefit-and-electronic-prior-authorization/), the three ePA certification criteria, SCRIPT versions and dates
- [Federal Register: Part D electronic prior authorization standard (December 31, 2020)](https://www.govinfo.gov/content/pkg/FR-2020-12-31/html/2020-28877.htm), NCPDP SCRIPT 2017071 and the January 1, 2022 requirement
- [CMS: WISeR model](https://www.cms.gov/priorities/innovation/innovation-models/wiser), dates, states, participants, covered services and the licensed clinician statement
- [CMS: Insurer pledge on prior authorization (June 23, 2025)](https://www.cms.gov/newsroom/press-releases/hhs-secretary-kennedy-cms-administrator-oz-secure-industry-pledge-fix-broken-prior-authorization), the commitments and dates
- [AHIP: Health plans take action to simplify prior authorization](https://www.ahip.org/news/press-releases/health-plans-take-action-to-simplify-prior-authorization), the plans' own description of the commitments: the FHIR framework by January 1, 2027, 80% real-time electronic approvals in 2027 and the 90-day transition
- [AHIP: Health plans reduce prior authorization, support continuity of care](https://www.ahip.org/news/articles/health-plans-reduce-prior-authorization-support-continuity-of-care-and-enhanced-consumer-communications), the progress update: 11% fewer authorizations, 6.5 million, more than 15% in Medicare Advantage
- [CMS: Claims attachments final rule fact sheet](https://www.cms.gov/files/document/nsg-attachments-final-rule-fact-sheet.pdf), prior authorization attachments left out
- [Texas Legislature: HB 3459 (87th Legislature) history](https://capitol.texas.gov/BillLookup/History.aspx?LegSess=87R&Bill=HB3459), filed without the governor's signature, effective September 1, 2021
- [Texas Medical Association: Gold card preparation](https://www.texmed.org/goldcardprep/), the exemption as summarized by the association
- [Texas Insurance Code chapter 4201](https://statutes.capitol.texas.gov/Docs/IN/htm/IN.4201.htm), section 4201.653 (90%, one-year evaluation period, at least five services, as amended by HB 3812 effective September 1, 2025) and section 4201.156 (no automated decision system for adverse determinations, SB 815)
- [California Legislature: SB 1120 (2024), chaptered text](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240SB1120), Chapter 879, approved September 28, 2024, licensed professionals decide medical necessity and the conditions on AI and algorithms

**Standards**

- [HL7 Da Vinci PAS: package list](https://hl7.org/fhir/us/davinci-pas/package-list.json), version 2.2.1
- [HL7 Da Vinci CRD: package list](https://hl7.org/fhir/us/davinci-crd/package-list.json), version 2.2.1
- [HL7 Da Vinci DTR: package list](https://hl7.org/fhir/us/davinci-dtr/package-list.json), version 2.2.0
- [X12: Claim adjustment reason codes](https://x12.org/codes/claim-adjustment-reason-codes), CARC 197

**Vendors**

- [Availity Essentials](https://www.availity.com/essentials), prior authorization with attachments
