+++
title = "State Health Privacy & Sensitive Data"
nav_title = "State Health Privacy"
description = "Health privacy beyond HIPAA: consumer health data laws, California's CMIA, Part 2 for SUD records, the vacated reproductive health rule, minors and genetics."
category = "Health Tech Industry"
order = 1916
part = "Rules of the Record"
tags = ["health-tech", "privacy", "consumer-health-data", "part-2", "reproductive-health", "minors"]
+++

HIPAA is a floor with a hole in it. It sets minimum protections for covered entities and their business associates, lets states protect health information more strictly, and doesn't reach health data collected by anyone else: a period tracker, a telehealth company that takes only cash, a pharmacy coupon app, a fitness wearable, an ad network inferring pregnancy from purchases. Two layers fill the space. **Consumer health data laws** in a growing set of states cover health data wherever it lives, with consent rules far stricter than HIPAA's. **Sensitive data rules** carve out categories (substance use disorder treatment, reproductive care, HIV status, genetics, mental health, minors' confidential care) that get extra protection even inside HIPAA.

For a health software vendor the result is that **the same record can be governed by three regimes at once**, and which one depends on the patient's state, the provider's state, how the data was collected and what it reveals. This chapter covers the laws that most often change a product's design, as of October 2026. Consent records and proxies are [Consent, Authorization & Proxies](/books/health-tech/consent-and-authorization); de-identification and data sales are [De-identification, Research & Data Use](/books/health-tech/de-identification-and-data-use#outside-hipaa-the-ftc-and-the-states); the EU and UK regimes are in Beyond the US.

## How the Platforms Do It

How consumer-facing health products describe the consumer health data layer, as of October 2026:

| Platform | What its public pages describe |
| --- | --- |
| **Ro** | A separate consumer health data privacy policy naming Washington's My Health My Data Act, Nevada's consumer health data law and the Connecticut Data Privacy Act; eleven categories of consumer health data (conditions, medications, bodily functions and vital signs, reproductive or sexual health and gender-affirming care, genetic data within medical history, inferences); sharing with providers and service providers, and with advertising partners where the consumer consents; rights to confirm, access, delete, withdraw consent and correct, by webform, with appeals and then the state attorney general |
| **Apple Health** | Health data "encrypted and inaccessible by default" on a locked device; with two-factor authentication, "Apple will not be able to read your health and activity data synced to iCloud"; third-party apps must ask permission per data type, explain why, and have a privacy policy covering health data; Health Records downloads clinical records from participating providers |
| **Google Health Connect** | Read and write permissions per data type that users can grant or revoke at any time, checked before every use; apps declare the data types in the Play Console and must show a privacy policy rationale matching the store listing |
| **EHRs serving California providers** | California's Civil Code 56.101(c) required businesses storing medical information about sensitive services, by July 1, 2024, to limit access, segregate gender-affirming care, abortion and contraception information, and be able to automatically disable access from other states |

The pattern: **health data outside HIPAA is consent-gated per purpose.** Platforms ask once to collect, again to share, and in Washington, in writing, to sell; the phone platforms enforce per-type permissions at the OS level; and states that shield sensitive care now require segmentation inside the clinical record itself.

## Consumer Health Data Laws

Washington set the template, and its definitions are broad enough to catch most consumer health products. How these laws stall a vendor's sales cycle is [State Health Privacy Laws as Sales Blockers](/books/health-tech/vendor-compliance-posture#state-health-privacy-laws-as-sales-blockers), and the FTC rule that covers health apps outside HIPAA is [The FTC Health Breach Notification Rule](/books/health-tech/vendor-compliance-posture#the-ftc-health-breach-notification-rule); this section is what the laws require of the product.

**Washington's My Health My Data Act** (RCW 19.373) applies to regulated entities from March 31, 2024 and to small businesses from June 30, 2024. Its core rules:

- **Consumer health data** is personal information linked or reasonably linkable to a consumer that identifies their "past, present, or future physical or mental health status," including inferences, location data that could indicate an attempt to receive health services, and biometric and genetic data.
- **Consent to collect** for a specified purpose, unless collection is necessary to provide the product the consumer requested; **separate consent to share**; consent must be freely given, specific, informed, opt-in and unambiguous, and can't be obtained through general terms of use or deceptive design.
- **Selling requires a signed authorization,** separate from consent, with specified contents, valid for one year, kept six years by both seller and purchaser.
- **A geofence ban:** no virtual boundary within 2,000 feet of an in-person health care facility to identify or track consumers, collect their data or send them messages or ads.
- **Rights** to access, deletion and withdrawal of consent, answered within 45 days with one 45-day extension, free twice a year, with an appeal process.
- **A consumer health data privacy policy** linked prominently from the homepage.
- **Enforcement through the Consumer Protection Act,** which makes a violation an unfair or deceptive act and opens it to private suits as well as the attorney general. <!-- source-gap: mhmda-private-litigation | missing | the first private lawsuits filed under the My Health My Data Act (2025) and their status as of October 2026 | closes with: a court docket for a filed MHMDA complaint and its current status | checked: 2026-10-29 -->
- **Exemptions** for information governed by HIPAA, Washington's own health care information act and other listed regimes.

**Nevada** (NRS 603A.400 to 603A.550, from 2023 legislation) follows the same shape: affirmative voluntary consent to collect, separate consent to share, a written authorization to sell that expires after a year, and a geofence ban within 1,750 feet of medical facilities; violations are deceptive trade practices, and the statute says it does "not create a private right of action."

**Connecticut** folded consumer health data into its general privacy law: consumer health data is sensitive data under the Connecticut Data Privacy Act, consent is required to sell it, and a geofence within 1,750 feet of a mental health or reproductive or sexual health facility is prohibited (Conn. Gen. Stat. 42-515, 42-526, effective October 1, 2023 for the health provisions). Those health provisions apply to anyone doing business in Connecticut or targeting its residents, regardless of the general law's volume thresholds.

**New York** came close and stopped. The legislature passed the New York Health Information Privacy Act (S929) in January 2025, banning sales of health information and requiring separate authorization for most other processing; the governor vetoed it on December 19, 2025.

**California** reaches the same data through two laws. The California Consumer Privacy Act makes "personal information collected and analyzed concerning a consumer's health" sensitive personal information (Civil Code 1798.140), with a right to limit its use. And the Confidentiality of Medical Information Act deems certain consumer products to be health care providers (next section).

What follows for a product: **build for Washington everywhere.** A consumer app or direct-pay telehealth service can't reliably tell in advance which users a given state's law covers, and the strictest rule (separate opt-ins to collect and share, a signed authorization to sell, no geofenced ads near clinics) is also the cheapest one to operate nationally.

## California: CMIA and Sensitive Services

California's Confidentiality of Medical Information Act (Civil Code 56 and following) predates HIPAA and is stricter in places. Three provisions shape software:

- **Apps can be providers.** A business that offers software or hardware to consumers, including a mobile app, designed to maintain medical information so the individual can manage it or for diagnosis, treatment or management of a condition "shall be deemed to be a provider of health care" for the act (Civil Code 56.06(b)). AB 254 (effective January 1, 2024) added businesses offering a "reproductive or sexual health digital service" (56.06(e)).
- **EHR segmentation for sensitive services.** Businesses that store medical information about sensitive services had to develop capabilities, by July 1, 2024, to limit user access to information about gender-affirming care, abortion and abortion-related services, and contraception; prevent its disclosure to persons and entities outside California under the act's rules; segregate it from the rest of the record; and automatically disable access to it by individuals and entities in other states (Civil Code 56.101(c), as amended through 2024).
- **Audit of every change.** An EHR system must automatically record any change or deletion with who, when and what changed (56.101(b)), the state-law version of the audit trail.

California also penalizes disclosure of **HIV test results**: a negligent disclosure that identifies the person, except under written authorization or a listed statutory exception, carries a civil penalty (Health and Safety Code 120980), with higher penalties for willful disclosure. Most states have their own HIV, mental health and genetic testing confidentiality statutes; a national product loads them as rules per state, not as code.

## Part 2: Substance Use Disorder Records

**42 CFR Part 2** protects records of substance use disorder treatment from federally assisted programs, more strictly than HIPAA, because those records can be used against a patient in criminal and civil proceedings. It applies to programs that are federally assisted (including through Medicare participation or a DEA registration) and hold themselves out as providing SUD diagnosis, treatment or referral, and it follows the record: anyone who lawfully receives a Part 2 record is bound by its limits on use against the patient (42 CFR 2.12).

The **February 16, 2024 final rule** implemented the CARES Act's alignment of Part 2 with HIPAA. It was effective April 16, 2024, and **compliance was required by February 16, 2026.** What changed:

- **A single consent for all future treatment, payment and operations** uses and disclosures, with recipients that can be described as "my treating providers, health plans, third-party payers, and people helping to operate this program" (42 CFR 2.31). A covered entity or business associate that receives records under that consent may redisclose them as HIPAA permits, except for proceedings against the patient, and doesn't have to segregate them.
- **SUD counseling notes** need their own consent, which can't be combined with any other kind (2.31(b)).
- **Every disclosure with consent carries a notice** that the record is protected by federal confidentiality rules, and either a copy of the consent or a clear explanation of its scope (2.32).
- **Breach notification** on HIPAA's terms (2.16), patient rights to an accounting of disclosures and to request restrictions (2.25, 2.26), and **enforcement by OCR** with HIPAA's civil penalty structure.

**Minors under Part 2** follow state law about who may consent to treatment. Where a minor may obtain SUD treatment alone, only the minor may consent to disclosure, including to a parent for payment; where state law requires parental consent to treatment, both must consent (42 CFR 2.14). In September 2026 OCR issued guidance on when Part 2 permits state Medicaid agencies to use SUD records to verify exclusions from the Medicaid community engagement requirement, a reminder that Part 2 questions now arrive from payer workflows as well as clinics.

For software, Part 2 means a **record-level label** that survives every hop: a behavioral health clinic's PMS, a referral to a primary care practice, a claim to a payer, a message from a patient engagement platform. Specialty Practices covers where behavioral health practices meet it.

## The Reproductive Health Rule and Its Vacatur

On April 26, 2024, HHS published the HIPAA Privacy Rule to Support Reproductive Health Care Privacy (89 FR 32976). It prohibited using or disclosing PHI to investigate or impose liability on anyone for seeking, obtaining, providing or facilitating lawful reproductive health care, and required a signed **attestation** before disclosing reproductive health PHI for health oversight, judicial, law enforcement or coroner purposes (45 CFR 164.509).

On **June 18, 2025**, in *Purl v. HHS* (N.D. Tex., No. 2:24-cv-00228-Z), the court declared unlawful and vacated most of that rule. In the notice of privacy practices changes, it vacated only 164.520(b)(1)(ii)(F), (G) and (H); the other notice changes, made to align with Part 2, remain in effect, with compliance required by February 16, 2026. HHS's pages say it "will determine next steps after a thorough review," and as of October 2026 there is no replacement rule. Two traps for engineers:

- **The eCFR still prints the vacated text.** Section 164.509 and the reproductive health language in 164.502 appear in the current eCFR because a court vacatur doesn't edit the Code; HHS's own page is the status. A compliance engine that reads regulations as data must carry the court decision as an override.
- **The protection moved to the states and to Part 171.** California's segmentation and out-of-state disabling requirements (above) are state law and unaffected; the information blocking rules' protecting care access exception, from December 2024, still lets actors limit EHI to reduce legal risk to patients and providers of lawful reproductive care ([The Ten Exceptions](/books/health-tech/information-blocking-and-certification#the-ten-exceptions)).

## Minors and Their Records

HIPAA treats a parent as an unemancipated minor's **personal representative** where state law gives the parent authority over the minor's care, but where a minor may lawfully consent to a service alone, disclosure to the parent is governed by state or other law (45 CFR 164.502(g)(3)). A provider may also decline to treat someone as a personal representative where it reasonably believes the person has abused or neglected the patient or that treating them as one could endanger the patient (164.502(g)(5)). The result is a patchwork:

- **Confidential care categories** (often reproductive and sexual health, mental health, substance use) where a minor can consent alone, and the parent's portal shouldn't show them.
- **Part 2's own rule** for SUD records (above).
- **States moving the other way.** Texas's SB 1188 (signed June 20, 2025, effective September 1, 2025) requires covered entities to give a minor's parent, managing conservator or guardian "complete and unrestricted access" to the minor's electronic health record immediately, unless state or federal law or a court order restricts it. The same law requires that electronic health records be physically maintained in the United States or its territories, including records held by cloud providers, for records stored on or after January 1, 2026, and requires practitioners to disclose their use of AI for diagnostic purposes.

Proxy access design (age thresholds, the adolescent portal, what each proxy sees) is the consent chapter's ([Minors, Proxies and Personal Representatives](/books/health-tech/consent-and-authorization#minors-proxies-and-personal-representatives)); this chapter's point is that **the rule is per state and per data category,** so the filter needs both.

## Genetic, Mental Health and Other Sensitive Categories

- **Genetic information.** GINA's amendments to HIPAA make genetic information PHI and bar health plans from using or disclosing it for underwriting: eligibility, premiums, pre-existing condition exclusions (45 CFR 164.502(a)(5)(i)). Consumer genetic testing outside HIPAA falls to the consumer health data laws and state genetic privacy statutes.
- **Psychotherapy notes,** a clinician's separate notes of counseling session contents, need an authorization for almost any use and are outside the right of access ([Authorization Under HIPAA](/books/health-tech/consent-and-authorization#authorization-under-hipaa)). Most mental health records are ordinary PHI; state mental health confidentiality laws add consent rules on top.
- **HIV and sexually transmitted infection results,** with state statutes like California's above.
- **Data localization.** Texas's US-storage requirement is the first state rule in this list that touches infrastructure rather than disclosure; a vendor running backups or support tooling outside the US has to know which tenants it applies to ([Multi-Tenancy](/docs/architecture/multi-tenancy#isolation-models)).

## How to Build It

Sensitivity is a property of records, and the rules are a property of jurisdictions. Record-level labels are `sensitivity_labels` from [Health Tech Architecture](/books/health-tech/health-tech-architecture#segmenting-phi) (`part2_sud`, `reproductive`, `mental_health`, `hiv`, `genetic`, set from the source program, a code value set or by hand, and inherited by derived records); this chapter adds the label values its laws need (`sud_counseling_notes`, `psychotherapy_notes`, `gender_affirming`, `contraception`, `minor_confidential`), which rule applied each label, and the jurisdictional rules themselves. The deltas against [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model) (`contacts`, `documents`, `disclosures`):

```sql
ALTER TABLE sensitivity_labels           -- Health Tech Architecture's table
  ADD COLUMN rule_id UUID;               -- the code value set or privacy_rule_sets row that applied it

CREATE TABLE privacy_rule_sets (          -- what each jurisdiction requires, effective-dated
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction   TEXT NOT NULL,           -- 'US', 'US-WA', 'US-CA', 'US-TX'
  regime         TEXT NOT NULL,           -- 'hipaa', 'part2', 'mhmda', 'cmia', 'ccpa', 'tx_sb1188'
  rule_key       TEXT NOT NULL,           -- 'consent_to_share', 'sale_authorization',
                                          -- 'geofence_feet', 'parent_full_access', 'us_storage',
                                          -- 'segment_category', 'disable_out_of_state'
  value          JSONB NOT NULL,          -- {"feet": 2000} or {"categories": ["reproductive", ...]}
  citation       TEXT NOT NULL,           -- 'RCW 19.373.080'
  override_note  TEXT,                    -- e.g. vacated by Purl v. HHS, 2025-06-18
  valid_during   DATERANGE NOT NULL,
  EXCLUDE USING GIST (jurisdiction WITH =, regime WITH =, rule_key WITH =, valid_during WITH &&)
);

CREATE TABLE consumer_health_data_requests (  -- MHMDA-style rights outside HIPAA
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id UUID NOT NULL REFERENCES organizations (id),
  subject_contact_id UUID NOT NULL REFERENCES contacts (id),
  jurisdiction   TEXT NOT NULL,
  kind           TEXT NOT NULL CHECK (kind IN ('confirm', 'access', 'delete', 'withdraw_consent',
                   'correct', 'appeal')),
  received_at    TIMESTAMPTZ NOT NULL,
  due_at         TIMESTAMPTZ NOT NULL,    -- 45 days in Washington, from the rule set
  extended_to    TIMESTAMPTZ,
  outcome        TEXT CHECK (outcome IN ('completed', 'denied', 'partially_completed')),
  completed_at   TIMESTAMPTZ
);

ALTER TABLE disclosures
  ADD COLUMN sensitivity_labels     TEXT[] NOT NULL DEFAULT '{}',  -- the labels on what was disclosed
  ADD COLUMN part2_notice_attached  BOOLEAN,                       -- 42 CFR 2.32 statement sent
  ADD COLUMN attestation_document_id UUID REFERENCES documents (id); -- kept for state-law attestations
```

Design decisions:

- **Labels are rows, applied at the source.** A Part 2 program labels everything it creates; code-set rules label records by diagnosis, procedure or medication code (with `rule_id` recording which); clinicians can add labels; inbound records keep the labels they arrived with (FHIR security labels and C-CDA confidentiality codes carry them, covered in the interoperability part). Don't count on certified EHRs to send them: HTI-5 removed the security tags certification criteria, 170.315(b)(7) and (b)(8), effective December 28, 2026 ([The HTI Rules](/books/health-tech/information-blocking-and-certification#the-hti-rules)). A record without a label is ordinary PHI, so removing a label is an audited act. The outbound check that reads the labels against consents is the architecture chapter's ([Segmenting PHI](/books/health-tech/health-tech-architecture#segmenting-phi)).
- **Rules are data per jurisdiction and regime.** Geofence distances, consent requirements, segmentation categories, parental access, US storage: rows with citations and effective dates, plus an `override_note` for court decisions the Code doesn't reflect ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **Filters run at every exit.** Portal views, proxy access, exports, FHIR APIs, outbound messages and claims all ask the same question (who is asking, from where, for which categories) and get the same answer, logged ([Where Checks Belong](/docs/security/authorization#where-checks-belong)).
- **Disclosures carry what they carried.** The labels on each disclosure and whether the Part 2 notice went with it make a later accounting or an OCR inquiry answerable.
- **Consumer rights outside HIPAA are a separate queue.** A HIPAA access request and an MHMDA access request have different clocks, scopes and appeal rules; the playbook's erasure mechanics apply to the deletion ones ([Erasure Requests](/docs/architecture/data-retention#erasure-requests)).

## Auditing

- **Label history:** every label applied or removed, by whom or by which rule.
- **Rule versions:** which jurisdictional rule row decided each filter, consent requirement and deadline ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)).
- **Consents and authorizations for consumer health data,** with the exact text shown and the separate collect, share and sell decisions ([Consent, Authorization & Proxies](/books/health-tech/consent-and-authorization#the-consent-record)).
- **Part 2 disclosures** with the notice and consent copy that accompanied them.
- **Consumer rights requests** with deadlines and outcomes, and appeals.
- **Location data near health facilities:** if the product uses location for advertising or messaging at all, the evidence that geofences exclude facilities by the applicable distance.

## What This Means for the System You Build

- **Assume three regimes per record:** HIPAA, the state's own health privacy law, and any sensitive-category rule, and decide per record, not per tenant.
- **Build consumer health data consent to Washington's standard:** separate opt-ins to collect and to share, a signed authorization to sell, and no geofencing near care sites.
- **Label sensitive records at the source** and keep the labels through every integration and export.
- **Segment sensitive services** so they can be hidden from proxies, out-of-state requests and general users, as California requires.
- **Implement Part 2's single TPO consent, separate counseling-note consent and the disclosure notice** now that compliance is required.
- **Track court decisions as overrides** to regulation text, starting with the June 2025 reproductive health vacatur.
- **Make minors' access a rule per state and category,** including states like Texas that require full parental access.

## References

**Federal regulations and decisions**

- [LII: 42 CFR 2.12, Applicability](https://www.law.cornell.edu/cfr/text/42/2.12), federally assisted programs, holding out, lawful holders, no segregation for TPO recipients
- [LII: 42 CFR 2.14, Minor patients](https://www.law.cornell.edu/cfr/text/42/2.14), consent by the minor alone or by minor and parent per state law
- [LII: 42 CFR 2.31, Consent requirements](https://www.law.cornell.edu/cfr/text/42/2.31), required elements, the single TPO consent, SUD counseling notes
- [LII: 42 CFR 2.32, Notice and copy of consent to accompany disclosure](https://www.law.cornell.edu/cfr/text/42/2.32), the two notice statements and the consent copy
- [eCFR: 42 CFR Part 2](https://www.ecfr.gov/current/title-42/chapter-I/subchapter-A/part-2), the current sections including breach notification, accounting and restrictions
- [Federal Register: Confidentiality of Substance Use Disorder Patient Records (February 16, 2024)](https://www.federalregister.gov/documents/2024/02/16/2024-02544/confidentiality-of-substance-use-disorder-sud-patient-records), the final rule effective April 16, 2024
- [Federal Register: HIPAA Privacy Rule to Support Reproductive Health Care Privacy (April 26, 2024)](https://www.federalregister.gov/documents/2024/04/26/2024-08503/hipaa-privacy-rule-to-support-reproductive-health-care-privacy), the rule later vacated in most part
- [eCFR: 45 CFR Part 164, Subpart E](https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E), 164.509 still printed after the vacatur
- [LII: 45 CFR 164.502](https://www.law.cornell.edu/cfr/text/45/164.502), genetic information underwriting ban, personal representatives and minors, the abuse and endangerment exception

**Agencies**

- [HHS: HIPAA and reproductive health](https://www.hhs.gov/hipaa/for-professionals/special-topics/reproductive-health/index.html), the June 18, 2025 *Purl v. HHS* vacatur, the surviving notice changes due February 16, 2026
- [HHS: Understanding Part 2](https://www.hhs.gov/hipaa/part-2/index.html), effective April 16, 2024, compliance by February 16, 2026, single consent, breach notification, OCR enforcement, the September 2026 Medicaid guidance

**State law**

- [Washington RCW 19.373: My Health My Data Act](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373&full=true), definitions, consent to collect and share, authorization to sell, 2,000-foot geofence, rights and deadlines, Consumer Protection Act enforcement, exemptions, the 2024 dates
- [Nevada NRS Chapter 603A](https://www.leg.state.nv.us/nrs/nrs-603a.html), consumer health data at 603A.400 to 603A.550, consent, sale authorization, 1,750-foot geofence, no private right of action
- [Connecticut General Statutes Chapter 743jj](https://www.cga.ct.gov/current/pub/chap_743jj.htm), consumer health data as sensitive data, consent to sell, 1,750-foot geofence, scope regardless of thresholds
- [New York Senate: S929 (2025), New York Health Information Privacy Act](https://www.nysenate.gov/legislation/bills/2025/S929), passed January 2025, vetoed December 19, 2025
- [California Civil Code 56.06](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=56.06), software and apps deemed providers, reproductive or sexual health digital services (AB 254)
- [California Civil Code 56.101](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=56.101), EHR audit of changes and sensitive services segmentation by July 1, 2024
- [California Civil Code 1798.140](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1798.140), health information as sensitive personal information under the CCPA
- [California Health and Safety Code 120980](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=HSC&sectionNum=120980), penalties for disclosing HIV test results
- [Texas SB 1188 (89th Legislature), enrolled text](https://capitol.texas.gov/tlodocs/89R/billtext/html/SB01188F.htm), US storage of EHRs from January 1, 2026, parental access to minors' records, AI disclosure
- [Texas SB 1188 bill history](https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=SB1188), signed June 20, 2025, effective September 1, 2025

**In practice**

- [Ro: Consumer health data privacy policy](https://ro.co/consumer-health-data-privacy-policy/), the states named, categories, sharing, rights and appeals
- [Apple: Health app and privacy](https://www.apple.com/legal/privacy/data/en/health-app/), on-device and iCloud encryption, app permissions and privacy policies, Health Records
- [Android Developers: Get started with Health Connect](https://developer.android.com/health-and-fitness/guides/health-connect/develop/get-started), per-type permissions, Play Console declarations, the privacy policy rationale
