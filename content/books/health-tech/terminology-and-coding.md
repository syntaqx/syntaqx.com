+++
title = "Terminologies & Code Sets"
nav_title = "Terminologies & Code Sets"
description = "The codes inside health records: ICD-10, CPT, HCPCS, CDT, SNOMED CT, LOINC, RxNorm, NDC, CVX and taxonomy codes, licenses, release cadence, value sets and maps."
category = "Health Tech Industry"
order = 1913
part = "Records and Interoperability"
tags = ["health-tech", "terminology", "icd-10", "cpt", "snomed-ct", "rxnorm"]
+++

Health records are coded. A diagnosis on a claim is an ICD-10-CM code, the visit it paid for is a CPT code, a filling is a CDT code, a wheelchair is a HCPCS code, a lab test is a LOINC code, the drug is an RxNorm concept and the package dispensed is an NDC, the vaccine is a CVX code, and the clinician's specialty is a taxonomy code. Each code system has an owner, a license, a release schedule and a reason to exist, and two of the most important (CPT and CDT) are copyrighted works that software must license to display. HIPAA fixes which code sets the standard transactions use, ASTP/ONC fixes which ones certified EHRs exchange, and every interface, claim and FHIR resource in this volume carries codes from them.

The engineering consequences are the same across all of them: store a code with its system and version, never as a bare string; keep the human-readable display you showed; load releases on their schedules and keep old versions, because a claim from last year was coded under last year's codes; and treat maps between systems as approximations with provenance. This chapter covers the code sets, who owns and licenses each, how often they change, value sets, mapping, and a schema for terminology; the codes' billing rules (modifiers, edits, documentation) are [Coding, Documentation & Compliance](/books/health-tech/coding-and-documentation) in Part 4.

## How the Platforms Do It

The owners and distributors, as of October 2026:

| Code system | Owner and distributor | Used for | Release cadence | License |
| --- | --- | --- | --- | --- |
| **ICD-10-CM** | WHO owns ICD-10; CDC's NCHS develops and maintains the US clinical modification | Diagnoses on every claim | Fiscal-year files effective October 1, with April 1 updates | Public |
| **ICD-10-PCS** | CMS | Inpatient hospital procedures | Fiscal-year files, with April 1 updates | Public |
| **CPT** | American Medical Association | Physician and other professional services | Annual, plus earlier releases for some codes | Copyrighted; licensed by the AMA |
| **HCPCS Level II** | CMS | Supplies, equipment, drugs, ambulance and services outside CPT | Quarterly update files | Public |
| **CDT** | American Dental Association | Dental procedures | Annual, set by the ADA's Code Maintenance Committee | Copyrighted; licensed by the ADA |
| **SNOMED CT** | SNOMED International; NLM is the US National Release Center | Clinical meaning: problems, findings, procedures | US Edition each March and September | Free to UMLS licensees in the US under an affiliate license |
| **LOINC** | Regenstrief Institute | Lab tests, observations and document types | Every six months, in February and August | Free under Regenstrief's open license, including commercial use; downloads require signing in to loinc.org |
| **RxNorm** | NLM | Normalized clinical drug names | Monthly full release, weekly updates | UMLS license terms; some sources restricted |
| **NDC** | FDA, with manufacturers | Drug packages on pharmacy claims | FDA's directory updated daily | Public |
| **CVX and MVX** | CDC's NCIRD | Vaccines administered and their manufacturers | As vaccines change | Public |
| **Provider taxonomy** | National Uniform Claim Committee | Provider type and specialty | Updated periodically | Public |

Two patterns. **Billing codes are mandated by HIPAA, clinical codes by certification.** The transaction rules require ICD-10-CM, ICD-10-PCS, CPT, HCPCS, CDT and NDC; the EHR certification program requires SNOMED CT, LOINC, RxNorm and CVX for clinical exchange. A practice system needs both families. **Licensing splits public from private.** The federal code sets are free; CPT and CDT are private property, and a product that shows their descriptors to users needs a license from the AMA or the ADA.

## The HIPAA Code Sets

HIPAA's medical data code sets, in force since October 1, 2015 (45 CFR 162.1002):

- **ICD-10-CM**, for diseases, injuries, impairments, other health problems and their causes.
- **ICD-10-PCS**, for procedures on hospital inpatients, reported by hospitals.
- **NDC**, for drugs and biologics reported by retail pharmacies.
- **CDT**, for dental services.
- **HCPCS and CPT-4** together, for physician services and other health care services (therapy, radiology, lab, hearing and vision, transportation including ambulance).
- **HCPCS**, for other substances, equipment, supplies and items (medical supplies, orthotics, prosthetics, durable medical equipment), excluding drugs.

### ICD-10-CM and ICD-10-PCS

ICD-10-CM is the diagnosis code on every claim from every setting. The WHO owns ICD-10 and authorized NCHS to develop the US clinical modification; CMS publishes the files and the payment-year schedule. The code year is the federal fiscal year: CMS's FY2027 ICD-10-CM files apply to discharges and encounters from **October 1, 2026 through September 30, 2027**. Updates also land on April 1: CMS published April 1, 2026 updates for both systems under FY2026, and its FY2027 ICD-10-PCS files apply to discharges through March 31, 2027, which implies another April update. So a coding system loads at least two versions a year and resolves a code against the version in force on the date of service, not the date of entry. ICD-10-PCS is hospital-inpatient only; practices never use it.

### CPT

CPT codes "describe medical services and procedures performed by physicians and other qualified health care professionals." The AMA maintains them, republishes them annually, and holds the copyright. Category I codes are the five-digit service codes; Category III codes are temporary codes for emerging technology; PLA codes identify proprietary laboratory analyses; and the AMA sometimes releases codes ahead of the standard schedule (its page notes a 2027 maternity care release "ahead of the standard release schedule"). The license governs the descriptors (the text that says what a code means) in software: a PMS that shows "office or other outpatient visit for the evaluation and management of an established patient" next to the code is displaying the AMA's content. Code numbers themselves appear on claims and remittances everywhere, and this volume cites them freely; reproducing the descriptor set is what requires the license.

### HCPCS Level II

HCPCS has two levels. **Level I** is CPT. **Level II** is CMS's own code set "used primarily to identify products, supplies, and services not included in the CPT codes": ambulance services, durable medical equipment, prosthetics, orthotics and supplies when used outside a physician's office, and more. Level II codes are a letter followed by four digits. CMS takes drug and biological code applications quarterly, decides non-drug items in January and July cycles, and publishes a quarterly update file, so HCPCS is the code set that changes most often mid-year.

### CDT

CDT, the ADA's Code on Dental Procedures and Nomenclature, is the HIPAA standard for dental services. It is maintained on a yearly cycle: the Code Maintenance Committee met in March 2026 to agree on changes "to be incorporated into CDT 2027," with its next meeting in March 2027. Like CPT, CDT's descriptors are the ADA's copyrighted content, and dental software licenses them. Dental claims use CDT codes with the tooth and surface fields from [EHRs, PMSs & the Clinical Record](/books/health-tech/ehr-and-pms-data#dental-teeth-surfaces-and-status), and a dental practice that also bills medical insurance (for oral surgery or sleep apnea appliances) crosses to CPT and ICD-10-CM.

### NDC

The **National Drug Code** identifies a drug package with "a unique, three-segment number": labeler, product and package. FDA publishes listed NDCs in its directory, updated daily. Today's NDCs are 10 digits whose segment lengths vary by labeler, and billing uses an 11-digit form; RxNorm's NLM-normalized NDCs use that 11-digit, no-dash HIPAA format. That changes: FDA's final rule "Revising the National Drug Code Format and Drug Label Barcode Requirements" adopts a uniform 12-digit NDC, effective **March 7, 2033**. Any table that stores NDCs as `CHAR(11)`, or any parser that infers the layout from hyphens, has a deadline. My rule: **store the NDC as text with its format recorded, and normalize at the edges.**

## The Clinical Code Sets

**SNOMED CT** is the clinical terminology: concepts for findings, disorders, procedures, body structures and organisms, related by "is a" and attribute relationships, so software can ask whether a concept is a kind of another. It is a designated standard for US federal exchange of clinical information. SNOMED International owns it; NLM is the US National Release Center and distributes it to UMLS licensees. The **US Edition** follows a twice-yearly cycle, March and September, even though the International Edition now releases monthly. The September 2026 US Edition (version 20260901, released September 1, 2026) added 286 US-specific active concepts on top of the July 2026 International Edition, included a SNOMED CT to ICD-10-CM map covering over 142,000 source concepts, and raised the maximum description length from 255 to 4,096 characters, with the first longer descriptions expected in March 2027, so any column sized for 255 characters needs widening.

**LOINC** codes lab tests, clinical observations, survey instruments and document types: a hemoglobin A1c result, a blood pressure, a PHQ-9 score, a progress note. It is what `Observation.code` and a C-CDA document's type carry.

**RxNorm** "provides normalized names for clinical drugs" and links them to the vocabularies of the commercial drug databases (First Databank, Micromedex, Multum, Gold Standard). Each concept has an **RXCUI**; term types distinguish ingredients (IN), clinical drugs (SCD: ingredient, strength and dose form) and branded drugs (SBD). The full release comes out the first Monday of each month, with weekly Wednesday updates for new FDA label data. RxNorm also carries NDCs, so it is the bridge from a prescription (an RxNorm clinical drug) to what the pharmacy dispensed (an NDC).

**CVX** is CDC's code set for vaccines administered, maintained by NCIRD, with active and inactive codes so historical immunizations can still be sent, used in HL7 2.3.1 and 2.5.1 immunization messages; pairing a CVX with an **MVX** manufacturer code identifies the trade-named vaccine.

**Provider taxonomy codes** describe what kind of provider someone is. The NUCC maintains the code set, "an external, nonmedical data code set": each code is ten alphanumeric characters with three levels (grouping, classification, area of specialization), used in HIPAA transactions and on the NPI application. It is what `practitioner_roles.taxonomy_code` holds in [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model), and a claim with the wrong taxonomy for the billing provider is a denial.

### What Certification Requires

ASTP/ONC sets minimum versions for the clinical code sets in certified health IT and lets developers support newer ones. Under HTI-1, by December 31, 2025, certified modules had to support at least SNOMED CT US Edition March 2022, LOINC version 2.72 (February 16, 2022), CVX updates through June 15, 2022, the NDC vaccine linker through July 19, 2022, UCUM revision 2.1 for units, CDC's Race and Ethnicity Code Set 1.2, and the Medicare provider and supplier taxonomy crosswalk of October 29, 2021, each for the criteria that reference it. The minimums lag the releases by years; the products in production run current releases, and their customers' outside data arrives coded under whatever version the sender had.

## Licensing

Most of US health care's codes are free, two are licensed, and one umbrella license covers the clinical terminologies:

- **The UMLS Metathesaurus license** from NLM is the gate to SNOMED CT, RxNorm's full content and VSAC. NLM's agreement states "No charges, usage fees, or royalties will be paid to NLM," and requires a brief usage report within 30 days after each calendar year of use. Some vocabularies inside the UMLS carry restriction categories, from a ban on derivative works (category 1) to internal research use only (category 3) to US-only use (category 4); RxNorm's technical documentation notes that sources with restriction levels 1 to 4 (such as GS, MMSL, MMX and NDDF) have extra terms and that SNOMED CT US has its own.
- **CPT** is licensed by the AMA for software that displays or distributes its descriptors.
- **CDT** is licensed by the ADA on the same principle for dental software.
- **ICD-10-CM, ICD-10-PCS, HCPCS Level II, NDC, CVX and taxonomy codes** are public files.

A vendor's terminology inventory is a compliance artifact: which code systems it loads, under which license, in which products, with the annual reports and royalty counts the licenses require. The licensed-data rules in the playbook's [Licensed Data](/docs/architecture/record-linkage#licensed-data) apply directly.

## Value Sets

A **value set** is a list of codes, drawn from one or more code systems, for a purpose: the diagnoses that count as diabetes for a quality measure, the LOINC codes for a lipid panel, the vaccines in a pediatric schedule. Value sets are how a measure, a profile or a rule says "any of these." NLM's **Value Set Authority Center (VSAC)** is the US repository: "a repository and authoring tool for public value sets created by external programs." It stores value sets but doesn't author their content; it distributes CMS's eCQM value sets by release (the May 2026 release was published May 14, 2026), requires a UMLS login for most downloads, and offers a FHIR API.

A value set has a **definition** (the rules: include these codes, or all descendants of this SNOMED concept) and an **expansion** (the actual codes at a point in time, against specific code system versions). Expansions change when the underlying code systems release, even if the definition doesn't, so a quality measure computed in March and recomputed in October can differ for reasons no one edited. Store expansions with the code system versions they were computed against, and compute measures against the expansion in force for the period.

## Mapping

Codes are mapped between systems constantly: SNOMED CT problems to ICD-10-CM for claims, local lab codes to LOINC, NDCs to RxNorm, ICD-10-CM codes from last year to this year, a legacy PMS's procedure codes to CDT. NLM publishes a SNOMED CT to ICD-10-CM map with the US Edition; RxNorm carries NDC links; most other maps are a lab's, a vendor's or a practice's own work.

Maps are approximations. A SNOMED concept may map to several ICD-10-CM codes depending on context the concept doesn't carry (laterality, episode of care, a combination code), and many maps are rule-based, not one-to-one. My rules:

- **Keep the source code.** A mapped code is stored next to the original, never instead of it.
- **Record the map and its version,** so a claim's ICD-10-CM code can be traced to the SNOMED concept and the map release that produced it.
- **Let a person confirm maps that touch money or care.** An automatic map proposes; a coder or clinician accepts. Billing codes chosen from clinical codes are a compliance question ([Coding, Documentation & Compliance](/books/health-tech/coding-and-documentation) in Part 4).
- **Map local codes once, centrally.** Every lab and every legacy system arrives with local codes; mapping them in a shared, reviewed table beats mapping them in every interface ([HL7 v2 & Interfaces](/books/health-tech/hl7-v2#interface-engines)).

FHIR's terminology operations (`$expand`, `$validate-code`, `$lookup`, `$translate`) are the standard interface to all of this, served by a terminology server ([FHIR](/books/health-tech/fhir#terminology-services)).

## How to Build It

The deltas against [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). Code systems are versioned and licensed rows; concepts are loaded per version; value sets keep definitions and dated expansions; maps are rows with provenance. Every coded column in the core (diagnoses on `conditions` and `claim_lines`, procedure codes on `procedures` and `charges`, `observations.code`, medication codes) already stores `code_system` (a short key such as `icd10cm`, `snomed`, `cpt`, `cdt`, `loinc`), `code` and its `display` as recorded; this chapter adds the release, as `code_version`, and the tables those keys resolve against.

```sql
CREATE TABLE code_systems (                 -- one row per system per release
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  key             TEXT NOT NULL,            -- the core's code_system value: 'snomed', 'cpt', 'icd10cm'
  uri             TEXT NOT NULL,            -- 'http://snomed.info/sct', 'http://www.ama-assn.org/go/cpt'
  version         TEXT NOT NULL,            -- '20260901', 'FY2027', '2027'
  effective_during DATERANGE NOT NULL,      -- dates of service this release applies to
  license         TEXT NOT NULL CHECK (license IN ('public', 'umls', 'ama_cpt', 'ada_cdt',
                    'other')),
  license_scope   TEXT,                     -- which products and users the license covers
  loaded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_file_sha256 BYTEA NOT NULL,
  UNIQUE (uri, version)
);

CREATE TABLE concepts (                     -- codes as released; never edited
  code_system_id  UUID NOT NULL REFERENCES code_systems (id),
  code            TEXT NOT NULL,            -- text: leading zeros, letters, dots
  display         TEXT NOT NULL,            -- long enough for 4,096-character descriptions
  status          TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'deprecated')),
  properties      JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (code_system_id, code)
);

CREATE TABLE value_sets (                  -- one definition version, expanded once
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  url             TEXT NOT NULL,            -- canonical URL or VSAC OID
  version         TEXT NOT NULL,
  definition      JSONB NOT NULL,           -- include and exclude rules as published
  source          TEXT NOT NULL,            -- 'vsac', 'us_core', 'local'
  code_system_versions JSONB NOT NULL,      -- what the expansion used: {"snomed": "20260901", ...}
  expanded_at     TIMESTAMPTZ NOT NULL,
  UNIQUE (url, version, code_system_versions)
);

CREATE TABLE value_set_members (            -- the expansion, one code per row
  value_set_id    UUID NOT NULL REFERENCES value_sets (id),
  code_system_id  UUID NOT NULL REFERENCES code_systems (id),  -- the release it came from
  code            TEXT NOT NULL,
  display         TEXT NOT NULL,
  PRIMARY KEY (value_set_id, code_system_id, code)
);

CREATE TABLE concept_maps (                 -- one source code to one target code, with provenance
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID REFERENCES organizations (id),  -- null: a published map; set: a local one
  source_system   TEXT NOT NULL,
  source_code     TEXT NOT NULL,
  target_system   TEXT NOT NULL,
  target_code     TEXT NOT NULL,
  relationship    TEXT NOT NULL CHECK (relationship IN ('equivalent', 'source_is_narrower',
                    'source_is_broader', 'related', 'not_related')),
  map_rule        TEXT,                     -- the published map's rule or advice, if any
  map_source      TEXT NOT NULL,            -- 'nlm_snomed_icd10cm_20260901', 'tenant_review'
  reviewed_by     UUID,                     -- local maps: who confirmed it
  valid_during    DATERANGE NOT NULL
);

-- the release on every coded table; conditions also keep a billing code beside the clinical one
ALTER TABLE conditions
  ADD COLUMN code_version        TEXT,      -- the release the code was chosen from
  ADD COLUMN billing_code_system TEXT CHECK (billing_code_system IN ('icd10cm')),
  ADD COLUMN billing_code        TEXT,
  ADD COLUMN billing_map_id      UUID REFERENCES concept_maps (id);

ALTER TABLE procedures   ADD COLUMN code_version TEXT;
ALTER TABLE observations ADD COLUMN code_version TEXT;
ALTER TABLE allergies    ADD COLUMN code_version TEXT;
```

Design decisions:

- **A code is a tuple.** System, code, display and version, every time; the core's short `code_system` keys resolve to a `code_systems` row by `key` and the release in force on the date of service. A bare `'E11.9'` loses which system and which year; the display shows what the clinician saw even after the descriptor changes.
- **Codes are text.** NDCs have leading zeros and are growing to 12 digits, ICD-10 and HCPCS Level II codes contain letters, and a numeric column drops what the code system put there. No numeric columns.
- **Releases are effective-dated.** `effective_during` resolves which release applies to a date of service, so a claim corrected next year validates against the codes in force when the care happened ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Concepts are loaded, never edited.** A new release is new rows; inactive codes stay, because old records reference them.
- **Licenses are tracked per system.** The `license` and `license_scope` columns let a product refuse to display CPT or CDT descriptors to a tenant whose license doesn't cover them, and produce the usage counts a license requires.
- **Expansions remember their inputs.** A `value_sets` row records the code system versions its expansion used, and `value_set_members` points at those exact releases, so a measure result can be reproduced.
- **Maps keep both sides and their source.** A billing code derived from a clinical code points at the map row that produced it; a local map records who reviewed it.

## Auditing

- **Which release coded each record:** the code system version behind every stored code, and the map version behind every derived one.
- **Code system loads:** what was loaded when, from which file (by hash), under which license.
- **Map reviews:** who confirmed or changed a local map, and which records were coded with the old one.
- **License compliance:** which tenants and users saw licensed descriptors, for the AMA and ADA reports, and the annual UMLS usage report.
- **Value set expansions** used for every quality measure or rule evaluation, with their code system versions.

## What This Means for the System You Build

- **Store every code as system, code, display and version,** as text.
- **Load releases on their schedules** (fiscal-year and April ICD-10, quarterly HCPCS, annual CPT and CDT, twice-yearly SNOMED CT US, monthly RxNorm) and keep every old one.
- **Resolve codes by date of service,** not by the date they were entered.
- **License CPT and CDT** before showing their descriptors, and track who sees them.
- **Get a UMLS license** for SNOMED CT, RxNorm and VSAC, and file the annual report.
- **Plan for the 12-digit NDC** by March 7, 2033, and widen text columns for SNOMED CT's 4,096-character descriptions.
- **Keep value set expansions and maps with their versions and provenance,** and let people confirm maps that touch billing or care.

## References

**Regulation**

- [45 CFR 162.1002: Medical data code sets (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/162.1002), the HIPAA code sets from October 1, 2015 and what each is used for
- [ASTP/ONC: HTI-1 Final Rule Overview and Key Dates (PDF, October 2025)](https://www.healthit.gov/sites/default/files/2024-03/Overview-and-Key-Dates-2024_508.pdf), minimum code set versions for certified health IT by December 31, 2025
- [FDA: National Drug Code Directory](https://www.fda.gov/drugs/drug-approvals-and-databases/national-drug-code-directory), three-segment NDCs, daily updates, the final rule adopting a 12-digit NDC effective March 7, 2033

**Code system owners**

- [CDC NCHS: ICD-10-CM](https://www.cdc.gov/nchs/icd/icd-10-cm/index.html), NCHS's role, WHO ownership of ICD-10
- [CMS: ICD-10 codes](https://www.cms.gov/medicare/coding-billing/icd-10-codes), FY2027 files for October 1, 2026 to September 30, 2027, PCS through March 31, 2027, April 1, 2026 updates
- [AMA: CPT](https://www.ama-assn.org/practice-management/cpt), what CPT describes, Category I and III and PLA codes, the early 2027 maternity release, licensing resources
- [CMS: Healthcare Common Procedure Coding System](https://www.cms.gov/medicare/coding-billing/healthcare-common-procedure-system), Level I and Level II, CMS's maintenance, application cycles and quarterly updates
- [ADA: CDT](https://www.ada.org/publications/cdt), the Code Maintenance Committee and the CDT 2027 cycle
- [NLM: SNOMED CT](https://www.nlm.nih.gov/healthit/snomedct/index.html), US National Release Center, access for UMLS licensees, the SNOMED CT to ICD-10-CM map
- [NLM: SNOMED CT US Edition](https://www.nlm.nih.gov/healthit/snomedct/us_edition.html), March and September cycle, the September 2026 release, the ICD-10-CM map size, the 4,096-character descriptions
- [NLM: RxNorm](https://www.nlm.nih.gov/research/umls/rxnorm/index.html), normalized clinical drug names and linked drug vocabularies
- [NLM: RxNorm technical documentation](https://www.nlm.nih.gov/research/umls/rxnorm/docs/techdoc.html), monthly and weekly releases, RXCUI, term types, normalized 11-digit NDCs, source restrictions
- [CDC: CVX vaccines administered](https://www2a.cdc.gov/vaccines/iis/iisstandards/vaccines.asp?rpt=cvx), NCIRD maintenance, MVX pairing, HL7 immunization messages
- [LOINC: License](https://loinc.org/kb/license/), free under an open license for commercial and non-commercial use, copyright and trademarks held by Regenstrief Institute
- [LOINC: Download LOINC](https://loinc.org/downloads/), version 2.83 released August 19, 2026, updates every six months in February and August, sign-in to download
- [NUCC: Health Care Provider Taxonomy](https://www.nucc.org/index.php/code-sets-mainmenu-41/provider-taxonomy-mainmenu-40), ten-character codes, three levels, use in HIPAA transactions and the NPI application

**Distribution and licensing**

- [NLM: UMLS Metathesaurus license agreement](https://www.nlm.nih.gov/research/umls/knowledge_sources/metathesaurus/release/license_agreement.html), no fees, the annual usage report, restriction categories
- [NLM: Value Set Authority Center](https://vsac.nlm.nih.gov/), the value set repository, eCQM releases, UMLS sign-in, FHIR API
- [HL7 FHIR R4: Terminology service](https://hl7.org/fhir/R4/terminology-service.html), the standard terminology operations
