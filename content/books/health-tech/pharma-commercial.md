+++
title = "Pharma Commercial & Patient Support"
nav_title = "Pharma Commercial"
description = "How drugs are sold: HCP CRM and reference data, PDMA sample rules, Open Payments, hub services and copay cards under the Anti-Kickback Statute, and DTC ad rules."
category = "Health Tech Industry"
order = 1957
part = "Pharma and Clinical Trials"
tags = ["health-tech", "pharma", "crm", "open-payments", "anti-kickback", "patient-support", "data-model"]
+++

A pharmaceutical company sells to people who don't pay and doesn't sell to the people who take the drug. Its sales representatives call on physicians, nurse practitioners and pharmacists, who prescribe; payers and PBMs decide coverage; the patient, often paying through a copay card the manufacturer funds, receives the drug from a pharmacy the manufacturer may never deal with directly. Every interaction in that chain is regulated because money and influence flow through it: what a representative may say is the approved label, what they may give is limited and reported publicly, free samples are tracked unit by unit, and help given to patients (copay support, nurse educators, help with prior authorization) can be a kickback when a federal program pays for the drug. The software that runs commercial pharma is CRM with an unusually strict compliance layer, a reference database of every prescriber in the country, a transparency reporting pipeline, and patient support "hubs" that look like a payer's call center pointed the other way.

This chapter covers HCP CRM and reference data, samples under the Prescription Drug Marketing Act, Open Payments, hub services, copay cards and patient assistance under the Anti-Kickback Statute, speaker programs, and direct-to-consumer advertising rules. Pharmacy benefits and the payer side of copay accumulators are [Pharmacy Benefits & PBMs](/books/health-tech/pharmacy-benefits#copay-assistance-and-accumulators); adverse events that support programs must forward are [Pharmacovigilance & Regulatory Submissions](/books/health-tech/pharmacovigilance-and-regulatory); the provider side of the Anti-Kickback Statute and Stark is Coding, Documentation & Compliance. It extends `practitioners` and `organizations` from [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from filings and vendor pages:

| Vendor | Product | What its public record says |
| --- | --- | --- |
| **Veeva** | Vault CRM (successor to Veeva CRM on Salesforce), OpenData, Compass | Vault CRM "connects sales, marketing, and medical teams on a single platform," with "200+ Customers" and "14 of Top 20 Biopharma"; OpenData is "reference data on healthcare professionals (HCPs), healthcare organizations (HCOs), and their affiliations"; Compass is "de-identified U.S. longitudinal patient, projected prescriber, and national data" |
| **Salesforce** | Life Sciences Cloud | "the AI-first, end-to-end engagement platform for Pharma, MedTech, Consumer and Animal Health," with HCP engagement and visit planning |
| **IQVIA** | Data, technology and contract sales | Licensed its CRM software to Salesforce, per Veeva's 10-K; contract sales and medical solutions were a $788 million segment in 2025 |
| **AssistRx** | Hub and access services | "Streamline prescription fulfillment. Speed access to therapy," with electronic prior authorization |
| **ConnectiveRx** | Affordability and hub services | "End-to-end patient affordability programs" and "Hub services and patient support" from a "single-partner solution" |

The CRM market changed hands in 2025. Veeva's 10-K: "Our agreement with Salesforce expired on September 1, 2025"; during "the wind-down period from September 1, 2025 to September 1, 2030" Veeva "may not sell applications that utilize the Salesforce platform to new customers," existing customers are capped at "150% of the seats in use by each such customer as of September 1, 2025," and Veeva CRM "will be supported until December 31, 2029" while customers migrate to Vault CRM. Salesforce, meanwhile, sells its own Life Sciences Cloud. Every large pharma company is running or planning a CRM migration through the end of the decade, which makes data portability and audit history across CRMs a live problem.

## CRM and HCP Reference Data

Pharma CRM is account management for prescribers: territories and call plans, call reports (who was visited, which products discussed, which approved materials shown), sample requests and signatures, event invitations, medical information requests routed to medical affairs (never answered by sales), consent to email, and multichannel engagement. What makes it different from ordinary CRM:

- **The customer master is licensed.** Prescribers and organizations come from reference databases (Veeva OpenData, IQVIA's, others) keyed by NPI and state license, with specialty, affiliations and addresses; the company's CRM accounts are a crosswalk onto that master ([Licensed Data](/docs/architecture/record-linkage#licensed-data)).
- **Content is approved, versioned and expiring.** A representative may show only materials approved through medical, legal and regulatory review, consistent with the label; the CRM records which version was shown, and expired materials disappear.
- **Promotion versus medical.** Sales may not promote off-label uses; an unsolicited request for off-label information becomes a medical information request handled by medical affairs and logged.
- **License checks gate actions.** A sample may go only to a practitioner licensed to prescribe it in that state, so the CRM checks license status from the reference data at the moment of the request.
- **State rules apply by practitioner location.** Vermont makes it "unlawful for any manufacturer of a prescribed product ... or any agent thereof, to offer or give any gift to a health care provider," with exceptions including samples, loans of devices for up to 120 days, peer-reviewed articles, qualifying conference sponsorship and rebates and discounts (18 V.S.A. 4631a). Massachusetts and other states have their own codes and reporting. <!-- source-gap: massachusetts-105-cmr-970 | missing | Massachusetts pharmaceutical and medical device manufacturer conduct regulation (105 CMR 970) | closes with: mass.gov regulation text readable without a 403 | checked: 2026-10-29 -->

The industry's voluntary code, the PhRMA Code on Interactions with Health Care Professionals, was last updated in August 2021 and effective January 1, 2022; companies build its limits (on meals, venues and speaker programs) into the same rules engine.

## Samples Under the PDMA

Drug samples are regulated unit by unit (21 CFR Part 203, subpart D):

- **Request first.** Before delivery, "The licensed practitioner executes and submits a written request to the manufacturer or authorized distributor of record," with the practitioner's "name, address, professional title, and signature," license or DEA number, product and strength, quantity and date (203.30(a)).
- **Receipt back.** The recipient signs a receipt returned to the sender (203.30(c)).
- **Annual inventory.** Representatives' stocks are counted: the company "shall conduct, at least annually, a complete and accurate physical inventory of all drug samples," reconciled against the prior inventory and records (203.31(d)).
- **Written procedures** for the administrative systems (203.34).
- **Loss and diversion.** Suspected falsification or diversion and "significant loss or known theft" are reported to FDA "by telephone or in writing, within 5 working days," with a written report within 30 days (203.37).
- **Lot tracking.** Each unit carries "an identifying lot or control number that will permit the tracking of the distribution of each drug sample unit" (203.38(a)).

Electronic signatures for sample requests and receipts are common, captured on the representative's tablet, and must meet Part 11's expectations for attribution ([Electronic Signatures](/books/health-tech/trial-systems-and-part-11#electronic-signatures)). The sample record is a chain of custody: shipment to the representative, count, request, delivery, receipt, inventory.

## Open Payments

The Physician Payments Sunshine Act requires manufacturers and group purchasing organizations to report payments and other transfers of value to covered recipients (physicians and certain other practitioners such as physician assistants and nurse practitioners) and teaching hospitals, which CMS publishes as Open Payments. The regulation (42 CFR 403.904):

- **Thresholds.** Small payments below a threshold are excluded unless the annual aggregate to the recipient exceeds a second threshold; the 2013 baseline was "less than $10" and "$100 in a calendar year," raised each year "by the same percentage as the percentage increase in the consumer price index." <!-- source-gap: open-payments-2026-thresholds | missing | CMS's published Open Payments small-payment and aggregate thresholds for program year 2026 | closes with: the CMS Open Payments reporting thresholds page, opened | checked: 2026-10-29 -->
- **Categories.** Each payment carries a nature of payment (consulting fee, honoraria, gift, food and beverage, travel and lodging, research, grant, royalty and others) and a form (cash, in-kind, stock).
- **Reporting.** Data is due "by the 90th day of each subsequent calendar year," attested by a senior officer as "timely, accurate, and complete," with covered recipients given at least 45 days to review and dispute (42 CFR 403.908).
- **Calendar.** CMS's cycle: submission February 1 to March 31, "Pre-publication review and dispute occurs annually from April 1 through May 15," corrections through May 30, and publication "on or by June 30"; program year 2025 data is published.
- **Penalties.** Failure to report: $1,443 to $14,432 per payment, up to $216,490 a year; knowing failure: $14,432 to $144,329 per payment, up to $1,443,275 a year (45 CFR 102.3, inflation-adjusted).

The engineering consequence: every expense system that can touch a covered recipient (CRM meals, speaker fees, consulting contracts, research payments through CROs, conference sponsorships) must tag the recipient by NPI from the reference master and the payment by nature, so the annual file is a query, not a project. Disputes come from recipients who don't recognize a meal; the evidence is the sign-in sheet or attendee list tied to the event.

## Hub Services and Patient Support

A hub is a manufacturer-funded service that takes a new prescription for a specialty drug and works it to the first fill: benefits investigation (what the patient's plan covers), prior authorization support, appeals support, enrollment in copay assistance or patient assistance, referral to the specialty pharmacy, nurse education and adherence calls. Hubs are run by vendors (AssistRx, ConnectiveRx and others) or specialty pharmacies, and they are a health tech product in every sense: intake by e-referral or fax, benefits checks, payer portals, prior authorization submissions, and patient communication.

Three rules shape them:

- **They handle PHI with authorization.** The patient signs an authorization allowing the hub (and often the manufacturer) to receive their information for the program; scope and revocation are tracked like any HIPAA authorization (Consent, Authorization & Proxies).
- **They are adverse event intake.** Any report of harm a hub hears starts the manufacturer's safety clock ([Day Zero](/books/health-tech/pharmacovigilance-and-regulatory#safety-reporting-clocks)).
- **They must not become inducements.** Free services to prescribers that save the practice money (doing the practice's prior authorization paperwork as a favor tied to prescribing) and free benefits to patients can implicate the Anti-Kickback Statute; hub designs follow OIG advisory opinions and keep sales and hub data separated.

## Copay Cards, Patient Assistance and the Anti-Kickback Statute

**Copay cards.** The OIG's September 2014 bulletin: coupons "constitute remuneration offered to consumers to induce the purchase of specific items," and when the drug is payable by a federal program "(including Medicare Part D)," the "anti-kickback statute is implicated." Manufacturers "place notices on the coupons ... that Federal program beneficiaries are not eligible to use them," but "these measures may not prevent all such use," and OIG recommended "improving the reliability of claims edits and making copayment coupons universally identifiable in pharmacy claims transactions." The card is processed as a secondary pharmacy claim through a copay card processor, with eligibility rules that exclude government coverage, and the payer side may treat it under an accumulator program ([Copay Assistance and Accumulators](/books/health-tech/pharmacy-benefits#copay-assistance-and-accumulators)).

**Patient assistance programs.** Manufacturers run free drug programs for uninsured and underinsured patients, and donate to independent charities that help with cost-sharing. OIG's 2005 bulletin (70 FR 70623) and its 2014 supplement (79 FR 31120) set the limits for independent charity programs: charities must not "define their disease funds so narrowly that the earmarking effectively results in a donor's subsidization of its own products," and must not give a donor information "that would enable a donor to correlate the amount or frequency of its donations with the number of aid recipients who use its products." The data wall between donor and charity is a design requirement.

**Speaker programs.** OIG's Special Fraud Alert of November 16, 2020 lists suspect characteristics: programs where "little or no substantive information is actually presented," where "Alcohol is available or a meal exceeding modest value is provided," venues "not conducive to an educational presentation (e.g., wineries, sports stadiums, fishing trips, golf clubs...)," repeat attendees and friends and family "who did not have a legitimate business reason to attend," and speaker pay "conditioned ... on sales targets." It describes a case where "the average food and alcohol cost per attendee was over $500." A compliant speaker program system enforces venue and meal caps, records attendance with credentials, flags repeat attendees and keeps speaker selection away from sales data.

## Direct-to-Consumer Advertising

Prescription drug advertising is regulated by FDA under 21 CFR 202.1. Broadcast ads must include "information relating to the major side effects and contraindications ('major statement')," and the brief summary is not required if "adequate provision is made for dissemination of the approved or permitted product labeling." A 2023 final rule (88 FR 80958, November 21, 2023) requires the major statement in TV and radio ads to be "presented in a clear, conspicuous, and neutral manner": consumer-friendly language, for TV "concurrently using both audio and text (dual modality)," and no elements "likely to interfere with comprehension of the major statement"; it took effect May 20, 2024 with compliance from November 20, 2024.

On September 9, 2025 FDA announced a crackdown on deceptive drug advertising, sending "thousands of letters" and "approximately 100 cease-and-desist letters" and "initiating rulemaking to close the 'adequate provision' loophole created in 1997," noting warning letters had "dropped to one in 2023 and zero in 2024." As of October 2026 the Federal Register shows no proposed rule on adequate provision. Ads on social media and influencer content follow the same rules plus the FTC's endorsement rules; telehealth companies that advertise drugs they prescribe are a recurring enforcement target (Telehealth covers the DTC telehealth side).

For software, promotional review is a workflow (submit, medical, legal, regulatory review, approve with expiry, submit to FDA's Office of Prescription Drug Promotion at first use), and every channel that can publish (CRM email, websites, social posts, ads) must publish only approved, unexpired versions.

## How to Build It

A commercial platform's tenant is the manufacturer. The core `practitioners` (with NPI) and `organizations` become a crosswalk onto licensed reference data; this chapter adds HCP profiles, sample distributions, transfers of value and hub cases:

```sql
CREATE TABLE hcp_profiles (              -- the manufacturer's view of a prescriber, keyed to reference data
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),  -- the manufacturer tenant
  practitioner_id  UUID NOT NULL REFERENCES practitioners (id),
  reference_source TEXT NOT NULL,         -- the licensed master the record came from
  reference_id     TEXT NOT NULL,
  licenses         JSONB NOT NULL,        -- per state: number, status, expiry, as of reference refresh
  open_payments_type TEXT CHECK (open_payments_type IN ('physician', 'pa', 'np', 'cns',
                     'crna', 'cnm', 'teaching_hospital', 'not_covered')),
  practice_state   TEXT,                  -- ISO 3166-2: state gift and reporting rules resolve here
  email_consent_id UUID REFERENCES consents (id),
  refreshed_at     TIMESTAMPTZ NOT NULL,
  UNIQUE (organization_id, reference_source, reference_id)
);

CREATE TABLE sample_distributions (      -- PDMA chain of custody, one row per movement
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  kind             TEXT NOT NULL CHECK (kind IN ('shipment_to_rep', 'request', 'delivery',
                     'receipt', 'inventory_count', 'return', 'loss', 'theft', 'destruction')),
  hcp_profile_id   UUID REFERENCES hcp_profiles (id),  -- requests, deliveries, receipts
  rep_id           UUID,                  -- the representative holding the stock
  ndc              CHAR(11) NOT NULL,
  lot_number       TEXT NOT NULL,         -- 203.38: every unit traceable by lot
  quantity         INT NOT NULL,
  license_checked  JSONB,                 -- state, number and status at the moment of request
  signature_id     UUID,                  -- the practitioner's request or receipt signature
  related_id       UUID REFERENCES sample_distributions (id),  -- receipt points to its delivery
  fda_report_due   TIMESTAMPTZ,           -- loss or theft: 5 working days
  occurred_at      TIMESTAMPTZ NOT NULL
);

CREATE TABLE transfers_of_value (        -- every payment or item of value to a covered recipient
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id   UUID NOT NULL REFERENCES organizations (id),
  hcp_profile_id    UUID REFERENCES hcp_profiles (id),
  teaching_hospital_org_id UUID REFERENCES organizations (id),
  amount            BIGINT NOT NULL,      -- cents
  nature            TEXT NOT NULL,        -- Open Payments nature of payment category
  form              TEXT NOT NULL CHECK (form IN ('cash', 'in_kind', 'stock', 'dividend')),
  program_year      SMALLINT NOT NULL,
  source_system     TEXT NOT NULL,        -- 'crm_meal', 'speaker_program', 'consulting', 'research'
  source_ref        TEXT NOT NULL,        -- the event, contract or invoice it came from
  related_product   TEXT,
  state_reportable  TEXT[] NOT NULL DEFAULT '{}',  -- states whose own reporting includes it
  dispute_status    TEXT CHECK (dispute_status IN ('none', 'open', 'resolved_corrected',
                      'resolved_no_change')),
  occurred_on       DATE NOT NULL
);

CREATE TABLE hub_cases (                 -- a patient's journey from prescription to first fill and beyond
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),  -- the hub vendor tenant
  manufacturer_org_id UUID NOT NULL REFERENCES organizations (id),
  patient_id         UUID NOT NULL REFERENCES patients (id),       -- in the hub's tenant only
  prescriber_id      UUID REFERENCES practitioners (id),
  authorization_id   UUID NOT NULL REFERENCES consents (id),       -- the patient's program authorization
  coverage_id        UUID REFERENCES coverages (id),
  government_coverage BOOLEAN NOT NULL,   -- decides copay card versus foundation referral
  status             TEXT NOT NULL CHECK (status IN ('intake', 'benefits_investigation',
                       'prior_auth', 'appeal', 'copay_enrolled', 'pap_enrolled',
                       'referred_to_sp', 'shipped', 'on_therapy', 'discontinued')),
  specialty_pharmacy_org_id UUID REFERENCES organizations (id),
  ae_reports         UUID[] NOT NULL DEFAULT '{}',  -- adverse_events forwarded from this case
  opened_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Design notes:

- **The reference master is the identity.** CRM accounts, transfers of value and sample requests all resolve to an `hcp_profiles` row keyed to licensed reference data and the NPI, so Open Payments, state reporting and license checks agree.
- **Compliance is a rule layer, not training.** Meal caps, venue limits, state gift bans, sample eligibility and speaker program limits are rules keyed by state and program, evaluated when the action is requested, with the rule recorded ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Sales and patient data are walled.** Hub cases live in the hub vendor's tenant; the manufacturer sees aggregates and de-identified program metrics unless the patient's authorization says otherwise, and sales never sees which prescriber's patients got assistance.
- **Transparency is a query.** Every system that can spend on a covered recipient writes `transfers_of_value` at the time, with its source, so the annual Open Payments file and state reports are generated, attested and defensible.

## Auditing

- **Samples:** every movement with lot, signatures, license check and inventory reconciliation; losses with their 5-working-day report.
- **Transfers of value:** source evidence for each, the submission, attestation and dispute outcomes.
- **Promotional content:** approval, version, expiry and every use in a call, email or ad.
- **Hub and assistance programs:** eligibility decisions (government coverage exclusions), authorizations, and the data flows between hub, manufacturer and charity, showing the walls held.
- **CRM history through migrations:** call reports and consents carried from Veeva CRM to Vault CRM or another platform with their original timestamps and actors ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).

## What This Means for the System You Build

- **Key every prescriber to licensed reference data and the NPI,** and check license status at the moment of each regulated action.
- **Track samples as a lot-level chain of custody** with requests, receipts, annual inventory and loss reports.
- **Record transfers of value at the source** with nature, form and recipient type, so Open Payments is a query.
- **Exclude federal program beneficiaries from copay cards in the eligibility rules** and make card claims identifiable.
- **Wall hub, charity and sales data** by tenant and authorization, and route adverse events from every patient-facing program.
- **Publish only approved, unexpired promotional content,** with the major statement rules built into broadcast review.
- **Plan CRM migrations with full history,** because the 2025 Veeva and Salesforce split runs to 2030.

## References

**Regulations and agency guidance**

- [21 CFR Part 203, subpart D: Samples (eCFR)](https://www.ecfr.gov/current/title-21/part-203/subpart-D), written requests, receipts, annual inventory, procedures, loss reporting within 5 working days, lot numbers
- [42 CFR 403.904: Reports of payments or other transfers of value (eCFR)](https://www.ecfr.gov/current/title-42/part-403/section-403.904), thresholds and CPI adjustment, nature of payment categories
- [42 CFR 403.908: Procedures for electronic submission of reports (eCFR)](https://www.ecfr.gov/current/title-42/part-403/section-403.908), the 90th-day deadline, attestation, 45-day review
- [45 CFR 102.3: Civil monetary penalty adjustments (eCFR)](https://www.ecfr.gov/current/title-45/part-102/section-102.3), Open Payments penalty ranges and annual caps
- [CMS: Open Payments](https://www.cms.gov/priorities/key-initiatives/open-payments), the annual submission, review, dispute, correction and publication calendar
- [21 CFR 202.1: Prescription-drug advertisements (eCFR)](https://www.ecfr.gov/current/title-21/part-202/section-202.1), the major statement, adequate provision, clear, conspicuous and neutral standards
- [Federal Register API: Direct-to-consumer prescription drug advertisements final rule (November 21, 2023)](https://www.federalregister.gov/api/v1/documents/2023-25428.json), effective May 20, 2024, compliance November 20, 2024
- [FDA: FDA launches crackdown on deceptive drug advertising (September 9, 2025)](https://www.fda.gov/news-events/press-announcements/fda-launches-crackdown-deceptive-drug-advertising), letters, rulemaking on adequate provision, warning letter counts
- [HHS OIG: Compliance alerts](https://oig.hhs.gov/compliance/alerts/), the speaker programs alert, PAP bulletins and copay coupon bulletin with dates
- [HHS OIG: Special Advisory Bulletin on copayment coupons (September 2014)](https://oig.hhs.gov/documents/special-advisory-bulletins/878/SAB_Copayment_Coupons.pdf), coupons as remuneration, federal program exclusion, claims identification
- [HHS OIG: Supplemental Special Advisory Bulletin on independent charity PAPs (May 2014)](https://oig.hhs.gov/documents/special-advisory-bulletins/879/independent-charity-bulletin.pdf), narrow disease funds, donor data limits
- [HHS OIG: Special Fraud Alert on speaker programs (November 16, 2020)](https://oig.hhs.gov/documents/special-fraud-alerts/865/SpecialFraudAlertSpeakerPrograms.pdf), suspect characteristics and the $500 per attendee example
- [Vermont 18 V.S.A. 4631a: Gift ban](https://legislature.vermont.gov/statutes/section/18/091/04631a), the prohibition and its exceptions

**Industry and vendors**

- [PhRMA: Code on Interactions with Health Care Professionals](https://phrma.org/resources/code-on-interactions-with-health-care-professionals), effective January 1, 2022, updated August 2021
- [Veeva: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1393052/000139305226000014/veev-20260131.htm), the Salesforce agreement's expiry and wind-down terms, Veeva CRM support to 2029, OpenData and Compass, IQVIA's CRM license to Salesforce
- [Veeva: Vault CRM](https://www.veeva.com/products/vault-crm/), the platform, customers and modules
- [Veeva: OpenData](https://www.veeva.com/products/opendata/), HCP and HCO reference data and coverage
- [Salesforce: Life Sciences Cloud](https://www.salesforce.com/life-sciences/), the engagement platform and HCP features
- [IQVIA: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1478242/000162828026008322/iqv-20251231.htm), the Contract Sales & Medical Solutions segment
- [AssistRx](https://www.assistrx.com/), hub and access services, electronic prior authorization
- [ConnectiveRx](https://www.connectiverx.com/), affordability programs and hub services
