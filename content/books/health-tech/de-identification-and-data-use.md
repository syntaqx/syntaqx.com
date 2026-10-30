+++
title = "De-identification, Research & Data Use"
nav_title = "De-identification & Data Use"
description = "Safe Harbor and Expert Determination in practice, limited data sets and DUAs, tokenized linkage, research and IRBs, sale of PHI, and FTC and state law."
category = "Health Tech Industry"
order = 1965
part = "Running the Platform"
tags = ["health-tech", "de-identification", "privacy", "research", "data-brokers", "hipaa"]
+++

Every health platform eventually wants to use its data for something other than the service it sells: benchmarks for its customers, analytics for its product team, training data for a model, a research partnership, a data product sold to pharma or payers. The data was collected to treat patients and bill for it, and HIPAA lets it flow to other uses through a short list of doors, each with its own conditions: de-identify it so it isn't PHI anymore, strip it to a limited data set and sign a data use agreement, get an institutional review board's waiver for research, or get each patient's authorization. Outside HIPAA, the FTC and a growing set of state laws reach health data that HIPAA never covered, and their enforcement has been aimed squarely at selling and sharing it.

The playbook's [De-identification](/docs/compliance/hipaa#de-identification) section states the two methods; this chapter is the practice. It covers what the industry does with health data, the two methods as OCR explains them, limited data sets, research uses, tokenization and linkage across sources, the sale of PHI, the FTC's and the states' rules for health data outside HIPAA, and building a governed release pipeline. Where the PHI boundary sits in the architecture is [Health Tech Architecture](/books/health-tech/health-tech-architecture#segmenting-phi); clinical trials themselves are Clinical Trials. It adds `data_use_agreements`, `expert_determinations` and `data_releases` to the core data model in The Health Tech Business.

## How the Industry Does It

As of October 2026, from public sources:

| Actor | What it does with data | Legal path | Public detail |
| --- | --- | --- | --- |
| **Tokenization and linkage networks** (Datavant and others) | Link records about the same person across sources without sharing identity | De-identified data, tokens created where the data is held | Datavant describes tokens created from PII that are "unique, irreversible, and site-specific," software run "on-premise" or in the data holder's cloud, and "1 trillion records tokenized annually" |
| **Cloud health services** | Detect and remove PHI from text and records | Tools for the covered entity or business associate | Azure's de-identification service will "tag, redact, or surrogate" PHI in unstructured text; AWS HealthLake's NLP extracts PHI entities from medical text |
| **EHR and practice software vendors** | Benchmarks, product analytics, model training | De-identification under the BAA's permission, or aggregate data | Depends on each customer's BAA; a business associate may de-identify "only to the extent such activity is authorized" by it (OCR) |
| **Researchers and academic centers** | Studies on records | IRB waiver, limited data set with a DUA, de-identified data, or authorization | 45 CFR 164.512(i), 164.514(e), the Common Rule |
| **Consumer health apps and ad tech** | Advertising, analytics | Outside HIPAA; FTC Act, Health Breach Notification Rule, state health data laws | FTC orders against GoodRx (2023), BetterHelp (2023) and data brokers selling location data from clinic visits (X-Mode, 2024) |

Three patterns run through the table:

- **De-identification is a process, not a property.** The same data set is de-identified for one recipient and not for another, depending on what that recipient could link it to; OCR's guidance says so, and the industry's linkage products are built around it.
- **Linkage is where the value is.** Health data is valuable when one person's records from a pharmacy, a lab and a payer can be joined; tokenization lets that happen without names leaving their source, and also makes re-identification risk the central question.
- **Outside HIPAA, sharing for advertising is what gets enforced.** Every FTC health privacy case of the last few years has been about disclosure to advertising platforms or sale of sensitive data, not about breaches in the classic sense.

## The Two Methods, as OCR Reads Them

HIPAA's standard is that information is de-identified if it doesn't identify a person and there's "no reasonable basis to believe" it can be used to (45 CFR 164.514(a)), met by one of two methods. OCR's guidance answers the questions a builder asks:

**Safe Harbor** removes 18 kinds of identifiers of the individual and of relatives, employers and household members, and requires no "actual knowledge" that what remains could identify someone. The details that catch implementations:

- **Geography.** Nothing smaller than a state, except the first three digits of a ZIP code when the three-digit area has more than 20,000 people; areas with 20,000 or fewer become `000`. OCR lists the 17 restricted three-digit prefixes from the 2000 Census and tells covered entities not to rely on that list "if more current data has been published."
- **Dates.** Every element of a date except the year (birth, admission, discharge, death, and test dates), and ages over 89 collapse into "90 or older."
- **"Any other unique identifying number, characteristic, or code."** Record numbers, device serial numbers, URLs and IP addresses are on the list; so is anything unique enough to single someone out, which is how a rare diagnosis in a small town fails Safe Harbor despite having no names.
- **Free text.** Notes and comments carry names, dates and places; Safe Harbor requires them to be removed there too, which is why text de-identification tools exist.

**Expert Determination** has a qualified person apply statistical methods, determine that the risk is "very small" that an "anticipated recipient" could identify anyone, and document the methods and results. OCR's answers matter more than the rule's text:

- **No credential is required.** "There is no specific professional degree or certification program" for an expert; OCR would look at their experience and training.
- **No number is set.** "There is no explicit numerical level of identification risk" that counts as very small; the expert sets it for the recipient and context.
- **Determinations can expire.** The rule doesn't require an expiration, but OCR describes practitioners using "time-limited certifications," and a recurring feed to the same recipient may need a fresh look.
- **Recipient and environment are part of the analysis.** The same data can be de-identified for one recipient and not another; an expert may also require a data use agreement or access controls as part of the solution.
- **Codes derived from PHI can be allowed.** A covered entity may disclose hashed codes derived from PHI in a de-identified set if an expert determines it's de-identified and "the keys associated with such functions are not disclosed." That sentence is the regulatory foundation of tokenization.

Two numbers from OCR's guidance explain why demographics are the risk: the combination of year of birth, sex and three-digit ZIP is estimated unique for about 0.04% of US residents, and date of birth, sex and five-digit ZIP for "over 50%." Safe Harbor's date and geography rules exist to move data from the second situation to the first.

**Re-identification codes.** A covered entity may keep a code to re-identify de-identified data itself, if the code isn't derived from information about the person and the mechanism isn't disclosed (45 CFR 164.514(c)). That code is a key the de-identified data set must never contain in a recoverable form.

## Limited Data Sets and Data Use Agreements

Between PHI and de-identified data sits the limited data set: PHI with 16 kinds of direct identifiers removed (names, street addresses, phone and fax numbers, email addresses, Social Security, medical record, health plan and account numbers, license, vehicle and device identifiers, URLs, IP addresses, biometrics and full-face photos) but allowed to keep dates and the town, state and ZIP code (45 CFR 164.514(e)). It may be used or disclosed only for "research, public health, or health care operations," and only under a data use agreement in which the recipient agrees to the permitted uses, to safeguards, to report misuse, to bind its agents, and to "not identify the information or contact the individuals."

For analytics that need dates (time to treatment, readmission intervals, seasonality), a limited data set under a DUA is often the right tool where Safe Harbor's date rule would destroy the analysis and an expert determination is more than the project warrants.

## Research Uses

Research under HIPAA is a systematic investigation designed to contribute to generalizable knowledge (45 CFR 164.501), and PHI reaches researchers through:

- **Authorization** from each patient.
- **An IRB or privacy board waiver,** granted when the use involves "no more than a minimal risk to the privacy of individuals" (with a plan to protect and destroy identifiers and assurances against reuse), the research "could not practicably be conducted without the waiver," and it "could not practicably be conducted without access to and use of" the PHI (45 CFR 164.512(i)).
- **Reviews preparatory to research,** where a researcher looks at PHI only to design a protocol and removes none of it, and **research on decedents' information,** each on the researcher's written representations.
- **A limited data set** under a DUA, or **de-identified data.**

The Common Rule (45 CFR 46) governs federally funded human subjects research and overlaps: its exemption for secondary research covers information that is publicly available, recorded so that identities "cannot readily be ascertained" with no contact or re-identification, or used under HIPAA for health care operations, research or public health (§ 46.104(d)(4)), and it allows broad consent for storing and reusing identifiable data with a limited IRB review (§ 46.104(d)(7) and (8)). A vendor partnering with an academic center meets both regimes through the center's IRB.

## Tokenization and Linkage

Privacy-preserving record linkage lets two data holders discover that they have records about the same person without exchanging identities. The shape the industry uses:

1. **Tokens are made where the data is.** Software at each source normalizes identifying fields (name, date of birth, sex, ZIP) and computes keyed hashes from combinations of them; the identifiers never leave.
2. **Tokens are site-specific.** Each source's tokens are transformed with a key unique to that source, so two sources' tokens can't be joined directly; Datavant describes its tokens as "unique, irreversible, and site-specific."
3. **Linkage happens in transit or at the recipient.** Tokens are re-keyed for a specific recipient or linkage environment, where matching records from different sources share a token.
4. **The linked set is reviewed.** An expert determination covers the joined data, because a set that is de-identified per source can become identifying when combined.

What this means for a platform:

- **Keys are the crown jewels.** The keys that turn identifiers into tokens are what OCR's guidance says must not be disclosed; they live in a key management service with narrow access, and a leaked key turns every token into a re-identification code ([Key Hierarchy](/docs/security/encryption-at-rest#the-key-hierarchy)).
- **Linkage is matching.** Token-based matching inherits every problem of patient matching (typos, name changes, twins); Patient Matching & Identity covers it, and [Probabilistic Linkage](/docs/architecture/record-linkage#probabilistic-linkage) is the method.
- **A joined set needs its own determination.** Each new combination of sources is a new risk analysis.

## Selling Data and Secondary Use

- **Sale of PHI needs authorization.** A covered entity or business associate "may not sell protected health information" without the patient's authorization, and a sale is any disclosure for which it receives remuneration, directly or indirectly, from or on behalf of the recipient (45 CFR 164.502(a)(5)(ii)). The exceptions are narrow: public health, research for a cost-based fee only, treatment and payment, the sale of the business itself, business associate services paid for as services, disclosures to the patient, those required by law, and others for a reasonable cost-based fee.
- **De-identified data isn't PHI,** and OCR's guidance says the Privacy Rule "does not restrict the use or disclosure of de-identified health information," which is why de-identified data products exist.
- **A business associate's rights come from its BAA.** A vendor may de-identify its customers' PHI only if the BAA authorizes it, and what it may then do with the result is usually in the same contract. Many practices' agreements don't grant it; check before building a benchmark or a training set.
- **Customers and patients still care.** A legal de-identified data product can be a reputational and sales problem when practices learn about it from the press; my rule is that any secondary use is disclosed in the customer agreement in plain words, and a customer can opt out of benchmarks and training.

## Outside HIPAA: The FTC and the States

Health data that no covered entity or business associate holds (a consumer app, a wearable, a wellness program run outside a health plan, a website's tracking data) isn't PHI, and other laws reach it:

- **The Health Breach Notification Rule.** The FTC's rule covers vendors of personal health records not covered by HIPAA. Its 2024 amendments, finalized April 26, 2024, confirm that it applies to health apps and that a "breach of security" includes an unauthorized disclosure, not only a hack; notices to consumers are due within 60 calendar days, and the FTC is notified at the same time for 500 or more people.
- **The FTC's health privacy orders.** GoodRx (February 1, 2023) was the first enforcement under the Health Breach Notification Rule, with a $1.5 million penalty and a permanent ban on sharing health information for advertising after it shared users' medications and conditions with advertising platforms. BetterHelp (March 2, 2023) paid $7.8 million after sharing email addresses, IP addresses and health questionnaire answers with advertising platforms. X-Mode (January 9, 2024) was the FTC's "first settlement with a data broker concerning the collection and sale of sensitive location information," which could reveal visits to "medical and reproductive health clinics," and requires a sensitive-locations program and deletion.
- **State consumer health data laws.** Washington's My Health My Data Act (chapter 19.373 RCW) restricts collecting and sharing consumer health data, requires a separate "valid authorization" to sell it, restricts geofencing around health facilities, and is enforced under the state's consumer protection act; State Health Privacy & Sensitive Data covers it with Nevada's and Connecticut's.
- **Data broker registration and deletion.** California's Delete Act requires data brokers to register and pay the annual fee in January (for 2026, between January 1 and 31) and, from August 1, 2026, to process deletion requests from the state's single deletion platform (DROP) "at least once every 45 days."

For a platform, the practical consequence is that the same data can be PHI in one product and consumer health data in another: a practice's patient list in your engagement product is PHI under the BAA; the same person's data from your consumer-facing app may be under the FTC and Washington instead. The data map has to say which regime applies to each source ([CCPA and CPRA](/docs/compliance/gdpr#ccpa-and-cpra) covers the California baseline).

## How to Build It

Secondary use runs as governed releases: every data set that leaves the PHI boundary is a release with a legal basis, a method, a recipient and a record:

```sql
CREATE TABLE data_use_agreements (       -- the contract behind a limited data set or a release
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  recipient        TEXT NOT NULL,          -- organization receiving the data
  kind             TEXT NOT NULL CHECK (kind IN ('limited_data_set_dua', 'deidentified_terms',
                     'research_waiver', 'baa_permission')),
  permitted_uses   TEXT[] NOT NULL,        -- 'research', 'public_health', 'operations', 'benchmark'
  no_reidentify    BOOLEAN NOT NULL,       -- recipient agrees not to identify or contact
  irb_ref          TEXT,                   -- approving IRB or privacy board, for waivers
  signed_at        DATE NOT NULL,
  expires_at       DATE,
  document_ref     TEXT NOT NULL
);

CREATE TABLE expert_determinations (     -- one expert's determination for one release design
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  expert           TEXT NOT NULL,          -- name and qualifications as documented
  recipient        TEXT NOT NULL,          -- the anticipated recipient the risk was assessed for
  design_ref       TEXT NOT NULL,          -- fields, generalizations, suppression and k used
  risk_threshold   NUMERIC(8, 6) NOT NULL, -- the expert's "very small" for this context
  conditions       TEXT[] NOT NULL,        -- 'dua_required', 'no_linkage_with_x', 'access_controlled'
  valid_until      DATE,                   -- time-limited certifications expire
  report_ref       TEXT NOT NULL           -- methods and results, available to OCR on request
);

CREATE TABLE data_releases (             -- every data set that leaves the PHI boundary
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  method           TEXT NOT NULL CHECK (method IN ('safe_harbor', 'expert_determination',
                     'limited_data_set', 'aggregate', 'authorization')),
  tenant_ids       UUID[] NOT NULL,        -- practices whose data is in it
  tenant_basis     TEXT NOT NULL,          -- the BAA clause or customer consent permitting it
  dua_id           UUID REFERENCES data_use_agreements (id),
  determination_id UUID REFERENCES expert_determinations (id),
  token_key_ref    TEXT,                   -- KMS key alias for site or recipient tokens, never the key
  excluded_labels  TEXT[] NOT NULL DEFAULT '{part2_sud}',  -- sensitivity labels left out
  zip3_table_ref   TEXT,                   -- Census data version used for the 20,000 rule
  row_count        BIGINT NOT NULL,
  min_cell_size    INT,                    -- for aggregates
  output_ref       TEXT NOT NULL,
  output_sha256    BYTEA NOT NULL,
  released_by      UUID NOT NULL,
  approved_by      UUID NOT NULL,
  released_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (approved_by <> released_by),
  CHECK (method <> 'limited_data_set' OR dua_id IS NOT NULL),
  CHECK (method <> 'expert_determination' OR determination_id IS NOT NULL)
);
```

A Safe Harbor transform for a visit-level extract, using the current ZIP3 population table and collapsing ages:

```sql
-- zip3_population(zip3, population, census_vintage) is loaded from current Census data.
SELECT
  CASE WHEN z.population > 20000 THEN LEFT(pa.postal_code, 3) ELSE '000' END AS zip3,
  CASE WHEN date_part('year', age(e.started_at, pa.birth_date)) > 89 THEN '90+'
       ELSE date_part('year', age(e.started_at, pa.birth_date))::text END     AS age_at_visit,
  date_part('year', e.started_at)                                            AS visit_year,
  pr.code                                                                    AS procedure_code
FROM encounters e
JOIN patients pa ON pa.id = e.patient_id
JOIN procedures pr ON pr.encounter_id = e.id
LEFT JOIN zip3_population z ON z.zip3 = LEFT(pa.postal_code, 3)
WHERE e.tenant_id = ANY ($1)
  AND NOT EXISTS (SELECT 1 FROM sensitivity_labels l
                  WHERE l.tenant_id = e.tenant_id AND l.record_table = 'encounters'
                    AND l.record_id = e.id AND l.label = ANY ($2));
```

Design notes:

- **Releases need a basis per tenant.** `tenant_basis` records the BAA clause or customer consent that allowed each practice's data in; a tenant without one is excluded by the job, not by memory.
- **The constraints are the rules.** A limited data set without a DUA or an expert-determined release without a determination can't be recorded, and the person who runs a release can't approve it.
- **A ZIP prefix isn't safe forever.** The 20,000 rule is applied from a loaded, versioned population table, and the version is stored with the release.
- **Free text is excluded by default.** Notes and messages stay out of Safe Harbor releases unless a text de-identification step with its own validation runs, because names and dates in text are where Safe Harbor fails.
- **Sensitive labels default out.** Part 2 records and other labeled data are excluded unless a release specifically allows them under their own rules.
- **Tokens use a key by reference.** `token_key_ref` names the KMS key; the release job requests tokenization from a service that holds it, and the key never appears in the release environment.
- **Emit `data_release.created` and `expert_determination.expiring`;** an expiring determination pauses recurring releases that depend on it.

## Auditing

- **Every release,** with method, basis per tenant, agreement, determination, row count, checksum, releaser and approver, kept as long as the longest agreement it relied on.
- **Every expert determination,** with the report, the conditions and the recipient it covered.
- **Every agreement,** with permitted uses and expiry, and the releases made under it.
- **Every use of a tokenization key,** logged by the key service ([Logging Key Use](/docs/security/encryption-at-rest#logging-key-use)).
- **Every opt-out** by a customer from benchmarks or training, and the releases that honored it.

## What This Means for the System You Build

- **Treat every data set leaving the PHI boundary as a release** with a recorded method, basis and approver.
- **Check the BAA before de-identifying** a customer's data, and disclose secondary uses in plain words with an opt-out.
- **Apply Safe Harbor from current Census data,** strip free text, and collapse ages over 89.
- **Use limited data sets with DUAs** when dates matter, and expert determinations for linked or recurring data, renewed when they expire.
- **Keep tokenization keys in a key service** and get a new determination for every new combination of sources.
- **Know which regime each source falls under:** HIPAA, the FTC's rules, or state consumer health data laws.
- **Never share health data with advertising platforms** without the authorization or consent the applicable law requires.

## References

**Regulation and guidance**

- [HHS OCR: Guidance regarding methods for de-identification](https://www.hhs.gov/hipaa/for-professionals/special-topics/de-identification/index.html), Safe Harbor, Expert Determination, ZIP codes, experts, risk thresholds, expiring certifications, hashed codes and the uniqueness estimates
- [45 CFR 164.501 (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/164.501), the definition of research
- [45 CFR 164.514 (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/164.514), limited data sets and data use agreement contents
- [45 CFR 164.502 (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/164.502), the sale of PHI and its exceptions
- [45 CFR 164.512 (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/164.512), research waivers, preparatory reviews and decedents
- [45 CFR 46.104 (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/46.104), Common Rule exemptions for secondary research and broad consent
- [RCW 19.373: Washington My Health My Data Act](https://app.leg.wa.gov/RCW/default.aspx?cite=19.373), sections on sharing, valid authorization to sell and geofencing
- [California Privacy Protection Agency: Data brokers](https://cppa.ca.gov/data_brokers/), registration, DROP and the 45-day processing requirement from August 1, 2026

**Enforcement**

- [FTC: Enforcement action against GoodRx (February 1, 2023)](https://www.ftc.gov/news-events/news/press-releases/2023/02/ftc-enforcement-action-bar-goodrx-sharing-consumers-sensitive-health-info-advertising), first Health Breach Notification Rule case, penalty and advertising ban
- [FTC: Order against BetterHelp (March 2, 2023)](https://www.ftc.gov/news-events/news/press-releases/2023/03/ftc-ban-betterhelp-revealing-consumers-data-including-sensitive-mental-health-information-facebook), $7.8 million and the data shared for advertising
- [FTC: Health Breach Notification Rule changes (April 26, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/04/ftc-finalizes-changes-health-breach-notification-rule), coverage of health apps, unauthorized disclosure as a breach and notice timing
- [FTC: Order against X-Mode Social (January 9, 2024)](https://www.ftc.gov/news-events/news/press-releases/2024/01/ftc-order-prohibits-data-broker-x-mode-social-outlogic-selling-sensitive-location-data), sensitive location data and the required program

**Vendors**

- [Datavant: Connect linkage](https://www.datavant.com/life-sciences/connect-linkage), site-specific tokens created from PII and local deployment
- [Datavant](https://www.datavant.com/), records tokenized annually and network scale
- [Microsoft Learn: What is Azure Health Data Services?](https://learn.microsoft.com/en-us/azure/healthcare-apis/healthcare-apis-overview), the de-identification service
- [AWS: What is AWS HealthLake?](https://docs.aws.amazon.com/healthlake/latest/devguide/what-is.html), NLP extraction of PHI entities from medical text
