+++
title = "GDPR & ePrivacy for Ads"
nav_title = "GDPR and ePrivacy"
description = "EU and UK law for ad systems: Article 5(3) and device access, lawful bases for ads, special categories, pay or consent, CNIL cookie fines and the UK's DUAA."
category = "Advertising Industry"
order = 2959
part = "Privacy and Law"
tags = ["advertising", "privacy", "gdpr", "eprivacy", "pecr", "data-model"]
+++

Two European laws apply to every ad shown to a person in the EU or the UK, and they ask different questions. The **ePrivacy Directive's Article 5(3)** (in the UK, regulation 6 of PECR) asks whether anything is stored on or read from the person's device, and allows it only with consent unless it is strictly necessary for a service the person asked for. The **GDPR** asks whether the processing of personal data that follows has a lawful basis, a purpose, a retention period and the rights that go with them. An ad request touches both: a cookie or advertising ID read from the device is the ePrivacy question; building a profile from it, selecting an ad with it, measuring the result and sharing any of it with a bidder are GDPR questions. The TCF's purposes (Consent Management & the TCF) are an industry vocabulary for answering both at once.

It is hard because the answers have been narrowing for a decade and keep narrowing. The Court of Justice ruled in 2023, in a case about Meta, that contract covers only processing that is "objectively indispensable" and that the personalized advertising financing a social network "cannot justify, as a legitimate interest" processing without consent; Ireland's regulator had already fined Meta €390 million for relying on contract. The EDPB said in 2024 that large platforms generally can't get valid consent with a choice between paying and behavioral ads. France's CNIL fined Google €325 million and Shein €150 million in September 2025 over cookie consent. And the UK went the other way at the margin: its Data (Use and Access) Act 2025 rewrote PECR's cookie rule with new exemptions in force from February 5, 2026, and the ICO has advised the government on an exemption for some advertising.

This chapter covers Article 5(3) and what counts as device access for ads, the lawful basis for each advertising purpose, special categories of data, the right to object, pay or consent, controllers and joint controllers in an ad chain, the CNIL's cookie cases, and the UK after the DUAA. It extends `organizations` and `ad_requests` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), reuses `privacy_agreements` from [US State Privacy Law for Advertising](/books/advertising/us-state-privacy-law) for controller and processor roles, and extends `storage_disclosures` from Third-Party Cookies & Browser Privacy. The playbook owns the general law: [Lawful Bases](/docs/compliance/gdpr#lawful-bases), [Controllers, Processors and the DPA](/docs/compliance/gdpr#controllers-processors-and-the-dpa), [Data Subject Rights](/docs/compliance/gdpr#data-subject-rights), and the ePrivacy and GDPR split for telemetry in [Two Rules, Two Questions](/docs/telemetry/consent-and-privacy#two-rules-two-questions), including the EDPB's 2024 guidelines on Article 5(3)'s technical scope and the CNIL's audience measurement exemption. The TCF mechanics are [Consent Management & the TCF](/books/advertising/consent-and-the-tcf); the DSA's ad rules, the DMA's consent requirement for gatekeepers and the Meta DMA decision are [DSA, DMA & Political Ads](/books/advertising/dsa-dma-and-political-ads).

## How the Platforms Do It

The positions regulators and courts have taken on advertising, as of November 2026:

| Authority | Decision | What it says about ads |
| --- | --- | --- |
| **CJEU** (C-252/21, Meta Platforms v Bundeskartellamt, July 4, 2023) | Preliminary ruling | Contract is a basis only if processing is "objectively indispensable"; personalized advertising "cannot justify, as a legitimate interest" the processing without consent; visiting sites that reveal sensitive data doesn't make it "manifestly" public |
| **CNIL** (Google, September 1, 2025) | €325 million (Google LLC €200 million, Google Ireland €125 million) | Ads styled as emails in Gmail without consent; cookie consent at account creation where it was "more difficult to refuse cookies linked to personalised advertising than to accept them" |
| **CNIL** (Shein, September 1, 2025) | €150 million | Cookies set on arrival before any interaction with the banner, incomplete information, and cookies still read after refusal |
| **EDPB** (Opinion 08/2024, April 17, 2024) | Opinion | Large online platforms generally can't obtain valid consent with a binary choice between paying and behavioral ads; they should give significant consideration to a free option without behavioral advertising |
| **Irish DPC** (Meta, decisions of December 31, 2022, announced January 4, 2023) | €210 million (Facebook) and €180 million (Instagram) | Meta "not entitled to rely on the "contract" legal basis" for behavioral advertising, following the EDPB's binding decision; three months to comply |
| **UK ICO** (consent or pay guidance, January 23, 2025; report to DSIT, May 2026) | Guidance and advice | Consent or pay is not prohibited but is assessed on power balance, fee, equivalence and design; behavioral advertising "should continue to require consent" under PECR |

Three patterns:

- **Personalized ads mean consent.** Contract was closed in 2022 and 2023, legitimate interest for profiling-based ads in 2023, and the TCF followed by removing legitimate interest for its profiling purposes in v2.2. What remains open on legitimate interest is measurement, fraud prevention and basic ad delivery.
- **Refusing must be as easy as accepting.** Both CNIL fines turned on asymmetry and on cookies that ran before or after the choice, not on the absence of a banner. A consent interface is a record of design decisions a regulator will screenshot.
- **The UK is diverging, slowly.** New exemptions exist for statistics, functionality and security; advertising is not among them, and the ICO's preferred route to one would still require consent for behavioral advertising.

## Article 5(3): Device Access

Article 5(3) of the ePrivacy Directive allows "the storing of information, or the gaining of access to information already stored, in the terminal equipment" only with consent given after "clear and comprehensive information," with two exemptions: storage or access "for the sole purpose of carrying out the transmission of a communication," and storage or access "strictly necessary" to provide a service "explicitly requested" by the user. The rule doesn't depend on the information being personal data, and the EDPB's guidelines on its technical scope (final October 16, 2024) apply it beyond cookies, to tracking pixels, tracking links and information sent back from local processing ([Two Rules, Two Questions](/docs/telemetry/consent-and-privacy#two-rules-two-questions)).

For an ad system, each of these is device access that needs consent unless an exemption fits:

| Operation | Exempt? | Why |
| --- | --- | --- |
| Setting or reading an ad server's user ID cookie | No | Not needed to deliver the page the user asked for |
| Reading the mobile advertising ID (IDFA, AAID) in an SDK | No | Access to information on the device; Mobile Ad IDs, ATT & SKAdNetwork covers the platform prompts |
| A cookie sync pixel | No | Exists to link identifiers across companies |
| A frequency capping cookie | No under the directive as written | Useful to the advertiser, not requested by the user |
| An impression or click tracking pixel that sets or reads nothing | Contested | The EDPB guidelines treat tracking pixels as in scope; the TCF's Purpose 7 on legitimate interest covers the GDPR side, not the device side |
| Storing the user's consent choice itself | Yes, as strictly necessary | The CMP has to remember the answer; TCF special purpose 3 |
| A load balancer or security cookie | Yes, as strictly necessary | Delivering the service the user asked for |
| Device fingerprinting from transmitted or requested characteristics | No | Accessing information from the device without storage is still access; TCF special feature 2 is the opt-in |

This is why the TCF makes Purpose 1 consent-only, why Google's fallback without it is limited ads with no device storage, and why Prebid's TCF enforcement blocks device access for vendors without it: there is no lawful way to set an ad cookie in the EU without consent, whatever the GDPR basis for the processing that follows. Third-Party Cookies & Browser Privacy's `storage_disclosures` lists what the system stores; this chapter adds which exemption, if any, each item relies on.

## Lawful Bases for Advertising

Each advertising purpose needs its own basis under Article 6 ([Lawful Bases](/docs/compliance/gdpr#lawful-bases)). After the cases above, the map for an ad platform:

| Purpose (TCF number) | Basis | Notes |
| --- | --- | --- |
| Device storage and access (1) | Consent (ePrivacy) | Not a GDPR basis question at all |
| Building and using ad profiles (3, 4) | Consent | C-252/21 closed legitimate interest; the DPC decisions closed contract |
| Selecting ads with limited data (2) | Consent or legitimate interest | Contextual, coarse location, frequency; the TCF allows either |
| Measuring ad performance (7) | Consent or legitimate interest | Counting impressions and clicks for billing has the strongest legitimate interest case; per-person attribution across sites the weakest |
| Audience statistics, combining sources (9) | Consent or legitimate interest | Combining with other sources tends toward profiling |
| Developing and improving services (10) | Consent or legitimate interest | Training ranking models on personal data sits here |
| Security, fraud and errors (special purpose 1) | Legitimate interest | Invalid traffic detection; like every TCF special purpose, no objection right in the TCF |
| Delivering and presenting ads (special purpose 2) | Legitimate interest | Rendering the creative the auction chose |

Legitimate interest needs the three-part test (a legitimate interest, necessity, and a balancing against the person's rights and expectations) documented before processing. The CJEU said in C-252/21 (paragraph 117) that a user "cannot reasonably expect" a platform to process their data for personalized advertising without consent; a measurement vendor counting impressions for the advertiser that bought them is a different balance. My rule is a written assessment per purpose and vendor, kept with the TCF declaration it supports, and reopened when the purpose or the data changes (`legitimate_interest_assessments` below).

**The right to object.** Where data is processed for direct marketing, which includes advertising to a person, Article 21(2) gives a right to object "at any time" to that processing, including profiling related to it, and Article 21(3) says that after an objection "the personal data shall no longer be processed for such purposes." The objection is absolute; there is no balancing. In the TCF it is the user's legitimate interest objection, cleared bits in `PurposesLITransparency`; outside the TCF (an advertiser's CRM, a logged-in platform) it is a persistent opt-out, the same `opt_out_records` row GPP, GPC & US Opt-Outs uses, with an EU jurisdiction.

**Withdrawal.** "It shall be as easy to withdraw as to give consent" (Article 7(3)). A consent given in one click on a banner must be withdrawable without hunting through a settings page; the CMP's re-open link is that mechanism, and the ad stack must stop on withdrawal, not on the next page load.

**Automated decisions.** Article 22(1) gives a right not to be subject to "a decision based solely on automated processing, including profiling" with legal or similarly significant effects. Ad selection itself generally isn't such a decision; ad delivery that excludes people from housing, credit or job opportunities is where the question is live, covered in [Sensitive Data & Discriminatory Targeting](/books/advertising/sensitive-data-and-discriminatory-targeting).

## Special Categories

Article 9(1) prohibits processing personal data "revealing racial or ethnic origin, political opinions, religious or philosophical beliefs," trade union membership, "genetic data, biometric data for the purpose of uniquely identifying a natural person, data concerning health" and data concerning "sex life or sexual orientation," unless an exception applies; for advertising, the only realistic exception is explicit consent. Three points make it reach further in ads than teams expect:

- **Inference counts.** The CJEU held in C-252/21 that data from visits to sites and apps that reveal sensitive information can be special category data, and that visiting them doesn't mean the user "manifestly makes public" that data. An interest segment for a health condition, built from browsing, is special category processing.
- **The DSA adds a flat ban for platforms.** Online platforms may not present ads "based on profiling" using special categories of data (DSA Article 26(3)), with or without consent; [DSA, DMA & Political Ads](/books/advertising/dsa-dma-and-political-ads) covers it.
- **Contextual isn't automatically clean.** An ad selected because the page is about a health condition is contextual; logging that this user read it, and adding the fact to their profile, is special category processing.

The engineering consequence is the same flag US State Privacy Law for Advertising uses, read with a different rule: a taxonomy node, targeting key or audience marked sensitive can't be used for profiling-based ads in the EU without explicit consent recorded for that purpose, and not at all on an online platform.

## Pay or Consent

Publishers that lose revenue when users refuse consent have offered a third option: pay for access without personalized ads, or accept them. Regulators have not banned it, and have drawn its limits:

- **For large platforms, the EDPB says no, generally.** Its Opinion 08/2024 says large online platforms generally can't obtain valid consent with a binary choice between paying and behavioral ads, and should give significant consideration to a free option without behavioral advertising. The DMA's gatekeeper rules and the Commission's Meta decision, in DSA, DMA & Political Ads, are the binding version for gatekeepers.
- **For others, the UK ICO's guidance** (January 23, 2025) says consent or pay isn't prohibited and assesses it on four questions: "Is there a clear power imbalance between you and the people using your product or service?"; "Have you set an appropriate fee for accessing your service without personalised advertising?"; whether the core service is "broadly equivalent" in both options; and whether the choices are presented equally. The ICO says the guidance "is under review and may be subject to change" after the DUAA.

For a publisher's system, pay or consent is an offer with a price and terms, versioned like the CMP configuration, and the consent it produces is only as good as the offer's fairness on the day it was made: `consent_or_pay_offers` below records which offer a user saw.

## Controllers in the Ad Chain

Most ad tech companies are controllers for the data they receive, not processors, because they decide how to use it (to bid, to build segments, to train models). The roles in a typical chain:

- **The publisher** is a controller for collecting the data on its site and for disclosing it into the auction.
- **The publisher and a vendor whose tag it embeds** can be joint controllers for the collection and disclosure: "Where two or more controllers jointly determine the purposes and means of processing, they shall be joint controllers" (Article 26(1)), and "the essence of the arrangement shall be made available" to the person (26(2)).
- **SSPs, DSPs and data providers** are independent controllers for what they do with the bid request, each needing its own basis (which is what the TCF records per vendor).
- **IAB Europe** is a joint controller for the recording of preferences in the TC string, per C-604/22, and not for processing "entirely within the OpenRTB protocol" per the Brussels Market Court ([The TCF in Court](/books/advertising/consent-and-the-tcf#the-tcf-in-court)).
- **Processors** are the minority: an ad server or measurement vendor processing only on the publisher's or advertiser's instructions, under an Article 28 agreement ([Controllers, Processors and the DPA](/docs/compliance/gdpr#controllers-processors-and-the-dpa)).

The record is the same `privacy_agreements` table US State Privacy Law for Advertising defines, with `regime = 'gdpr'` or `'uk_gdpr'` and a role of `controller`, `joint_controller` or `processor`. One counterparty has one current row per regime and direction, so the same DSP can be a CCPA third party and a GDPR independent controller without confusion.

## The CNIL's Cookie Cases

France's regulator has been the most active on ad cookies, and its 2025 decisions are specifications for a consent interface:

- **Google (decision of September 1, 2025, €325 million).** Two findings: ads inserted between emails in Gmail's inbox, formatted like emails, without prior consent under France's electronic marketing rule, and account creation where it was "more difficult to refuse cookies linked to personalised advertising than to accept them."
- **Shein (decision SAN-2025-005, September 1, 2025, €150 million).** Cookies set on arrival before any interaction with the banner, banners with incomplete information, and cookies still read after the user refused.

Each finding maps to a check an ad stack can run on itself: no ad cookie before `useractioncomplete` or a stored valid string; refusing in as few actions as accepting; no ad cookie read after refusal; and the banner's text listing what the GVL and the publisher's own vendors will do. Shein's case is the device side of the core rule: the ad tags ran ahead of the CMP.

## The UK After the DUAA

The UK's Data (Use and Access) Act 2025 (c. 18) section 112 substitutes a new PECR regulation 6, now "Subject to Schedule A1," and adds a regulation 6A allowing the government to vary the exceptions by regulations; it was fully in force from February 5, 2026 (S.I. 2026/82). The new Schedule A1 sets exceptions for storage and access needed for transmission, for strictly necessary purposes (including security, fraud prevention and authentication), for statistical purposes, for appearance and functionality, and for emergency assistance. The statistics exception requires that the sole purpose is improving the service, that the information is shared only for that purpose, "clear and comprehensive information", and "a simple means of objecting, free of charge" that the user hasn't used. Advertising is not among them. Consent may be signified through browser settings or another application (Schedule A1 paragraph 2(3)).

The ICO's report to the Department for Science, Innovation and Technology, dated May 2026 (published as a file dated May 5), sets out its preferred approach to an advertising exception if the government uses its power to add one; the report says "It is for government to decide if and how the law should change." It would let publishers store and access limited information without consent for specific advertising purposes, with third-party access to identifiable information only where the publisher engages the third party to assist it (for example for "counting of aggregated impressions, clicks or views"), and for targeting it would permit only "high level device and platform information (device, OS and browser, but not browser version)", "geolocation information to the city or region level", "temporal information", and contextual information "mapped to a broad taxonomy." On behavioral advertising it is explicit: storage, access and processing for it "should continue to require consent under regulation 6." As of November 2026 the report is advice; no regulation creating the exception had been made. <!-- source-gap: adv-uk-pecr-ad-exception | status | whether the UK government has made regulations under PECR regulation 6A adding an online advertising exception | closes with: a statutory instrument on legislation.gov.uk or a DSIT announcement | checked: 2026-11-22 -->

The design point is that the ICO's preferred exception describes this volume's `non_personalized` mode exactly: first-party context, coarse location, device class, time. A system that already produces that mode with clean inputs is ready for the exception if it comes, and needs no new consent logic if it doesn't.

## How to Build It

Three additions: the ePrivacy basis for each stored item, the offers a pay-or-consent publisher shows, and the legitimate interest assessments behind every purpose declared on that basis. Controller and processor roles reuse `privacy_agreements`.

```sql
ALTER TABLE storage_disclosures ADD COLUMN eprivacy_exemption TEXT NOT NULL DEFAULT 'none';
ALTER TABLE storage_disclosures ADD CONSTRAINT storage_disclosures_eprivacy_exemption_check
  CHECK (eprivacy_exemption IN ('none', 'transmission', 'strictly_necessary',
    'uk_statistics', 'uk_functionality', 'uk_emergency_assistance')) NOT VALID;
ALTER TABLE storage_disclosures ADD CONSTRAINT storage_disclosures_purpose1_check
  CHECK (eprivacy_exemption <> 'none' OR 1 = ANY (tcf_purposes)) NOT VALID;  -- else it needs consent

CREATE TABLE consent_or_pay_offers (       -- a paid alternative to personalized ads, as shown
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  property_id            UUID NOT NULL REFERENCES properties (id),
  version                INT NOT NULL,
  price_minor            BIGINT NOT NULL CHECK (price_minor >= 0),
  currency               CHAR(3) NOT NULL,
  billing_period         TEXT NOT NULL CHECK (billing_period IN ('month', 'year')),
  paid_tier_ads          TEXT NOT NULL CHECK (paid_tier_ads IN ('none', 'contextual_only')),
  free_non_personalized  BOOLEAN NOT NULL,  -- a free option without behavioral ads (EDPB 08/2024)
  equivalence_notes      TEXT NOT NULL,     -- what differs between the options, if anything
  regions                TEXT[] NOT NULL,   -- e.g. {'EEA','GB'}
  valid_during           TSTZRANGE NOT NULL,
  assessment_ref         TEXT NOT NULL,     -- the documented fee and power-balance assessment
  UNIQUE (property_id, version)
);

CREATE TABLE legitimate_interest_assessments (  -- the three-part test behind a declared basis
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  org_id                 UUID NOT NULL REFERENCES organizations (id),
  tcf_purposes           SMALLINT[] NOT NULL,   -- the purposes declared on legitimate interest
  activity               TEXT NOT NULL,         -- e.g. 'impression counting for billing'
  interest               TEXT NOT NULL,
  necessity              TEXT NOT NULL,         -- why less data wouldn't do
  balancing              TEXT NOT NULL,         -- expectations, safeguards, impact
  conclusion             TEXT NOT NULL CHECK (conclusion IN ('relies_on_li', 'requires_consent')),
  version                INT NOT NULL,
  completed_at           TIMESTAMPTZ NOT NULL,
  next_review_due        DATE NOT NULL,
  supersedes_id          UUID REFERENCES legitimate_interest_assessments (id),
  approved_by            TEXT NOT NULL,
  CHECK (NOT (tcf_purposes && ARRAY[1, 3, 4, 5, 6]::SMALLINT[])),  -- consent-only purposes
  UNIQUE (org_id, activity, version)
);

ALTER TABLE ad_requests ADD COLUMN consent_or_pay_offer_id UUID;  -- the offer the user saw, if any
ALTER TABLE ad_requests ADD CONSTRAINT ad_requests_consent_or_pay_offer_fk
  FOREIGN KEY (consent_or_pay_offer_id) REFERENCES consent_or_pay_offers (id) NOT VALID;
```

Design notes:

- **Every stored item has an ePrivacy answer.** An item in `storage_disclosures` either names its exemption or is tied to TCF Purpose 1, and the check makes "neither" impossible to record. The CMP's disclosure file and the tag's behavior are generated from the same rows, so a cookie that isn't listed can't be set by a tag that reads the list.
- **The UK exemptions are their own values.** `uk_statistics` and the others apply only in the UK (security and fraud prevention sit inside Schedule A1's strictly necessary exception, so they stay `strictly_necessary`), and the rule version decides by jurisdiction; an EU request never relies on them.
- **Legitimate interest is a document before it's a declaration.** A purpose in `gvl_vendors.leg_int_purposes` for this company's vendor ID should have a current `relies_on_li` assessment; the check refuses assessments for the consent-only purposes, and a GVL declaration without an assessment is an audit finding.
- **The offer travels with the consent.** A request on a pay-or-consent property records the offer version the user was shown, so the validity of the consent can be judged against the price and terms on that day.
- **Objections are opt-outs.** An Article 21 objection outside the TCF is an `opt_out_records` row with `jurisdiction = 'EU'` or `'GB'` and scope `profiling` or `targeted_advertising`, looked up like any other; there is no separate table.
- **Special categories reuse the sensitive flags.** The rule version marks sensitive nodes, keys and audiences as unusable for profiling in the EU without explicit consent and unusable on online platforms at all; the targeting validator reads that, not a second taxonomy.

Stored items that would need Purpose 1 consent and are set on pages where the CMP's vendor list doesn't include their owner, the Shein question as a query:

```sql
SELECT s.owner_org_id, s.identifier, s.kind, d.property_id
FROM storage_disclosures s
JOIN organizations o ON o.id = s.owner_org_id
JOIN cmp_deployments d ON now() <@ d.valid_during
WHERE s.retired_version IS NULL
  AND s.eprivacy_exemption = 'none'
  AND 'EEA' = ANY (d.regions)
  AND (o.tcf_vendor_id IS NULL OR NOT (o.tcf_vendor_id = ANY (d.vendor_ids)));
```

The join is deliberately broad (every current deployment); a real version restricts it to the properties where each vendor's tag is installed. Any row is a cookie the user can't have consented to, because its owner wasn't on the list they saw.

## Auditing

- **What was stored, on what basis.** Every storage item with its owner, lifetime, purposes and ePrivacy exemption, versioned with the disclosure file.
- **What the user saw.** The CMP configuration, the vendor list, the pay-or-consent offer and the TC string for each request, so a consent can be judged against its interface.
- **Why each legitimate interest holds.** Every assessment with its versions and approvals, tied to the purposes declared in the GVL.
- **Who each counterparty is.** Controller, joint controller or processor per regime, with the agreement and, for joint controllers, the essence of the arrangement as published.
- **Objections and withdrawals.** Every Article 21 objection and consent withdrawal, when processing stopped, and which partners were told.
- **Self-tests.** Synthetic visits from the EU and UK that check no ad cookie is set before the choice, refusing takes no more actions than accepting, and nothing is read after refusal: the three CNIL findings.

## What This Means for the System You Build

- **Answer the device question first:** no ad storage or access in the EU or UK without consent, and every stored item names its exemption or its consent purpose.
- **Use consent for profiles,** and keep legitimate interest for measurement, fraud and basic delivery, each with a written assessment.
- **Treat inferred sensitive interests as special category data,** and block them from profiling-based ads without explicit consent, and on platforms entirely.
- **Make refusing as easy as accepting** and make the tags obey both, from the first request to the last.
- **Record controller roles per regime** in the same table as the US roles.
- **Version pay-or-consent offers** and record the offer each consent was given against.
- **Build the non-personalized mode cleanly,** because it is what the law allows without consent today and what a UK advertising exemption would allow tomorrow.

## References

**Regulation**

- [Directive 2002/58/EC (ePrivacy), consolidated](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02002L0058-20091219), Article 5(3), consent and the transmission and strictly necessary exemptions
- [Regulation (EU) 2016/679 (GDPR)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R0679), Articles 7(3), 9(1), 21(2) and (3), 22(1) and 26
- [EDPB: Guidelines 2/2023 on the technical scope of Art. 5(3) ePrivacy Directive](https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-22023-technical-scope-art-53-eprivacy-directive_en), the final version of October 16, 2024
- [CJEU: Press release 113/23 on Case C-252/21, Meta Platforms v Bundeskartellamt](https://curia.europa.eu/jcms/upload/docs/application/pdf/2023-07/cp230113en.pdf), contract necessity, legitimate interest for personalized ads, sensitive data from site visits
- [CJEU: Judgment in Case C-252/21, Meta Platforms v Bundeskartellamt](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:62021CJ0252), paragraphs 73 (special categories from site visits) and 117 (users "cannot reasonably expect" personalized ads without consent)
- [EDPB: Consent or pay models should offer real choice (April 17, 2024)](https://www.edpb.europa.eu/news/news/2024/edpb-consent-or-pay-models-should-offer-real-choice_en), Opinion 08/2024
- [Data Protection Commission: Conclusion of two inquiries into Meta Ireland](https://www.dataprotection.ie/en/news-media/data-protection-commission-announces-conclusion-two-inquiries-meta-ireland), the contract basis decisions, fines and deadline
- [CNIL: Cookies and advertisements inserted between emails, Google fined €325 million](https://www.cnil.fr/en/cookies-and-advertisements-inserted-between-emails-google-fined-325-million-euros-cnil), the September 2025 decision
- [CNIL: Cookies placed without consent, Shein fined €150 million](https://www.cnil.fr/en/cookies-placed-without-consent-shein-fined-150-million-euros-cnil), decision SAN-2025-005
- [Data (Use and Access) Act 2025, section 112](https://www.legislation.gov.uk/ukpga/2025/18/section/112), the new PECR regulation 6 and 6A and commencement
- [Data (Use and Access) Act 2025, Schedule 12](https://www.legislation.gov.uk/ukpga/2025/18/schedule/12), PECR Schedule A1 exceptions and consent through browser settings

**Reference**

- [ICO: Consent or pay, about this guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/online-tracking/consent-or-pay/about-this-guidance/), the January 23, 2025 publication, the four factors and the DUAA review
- [ICO: Report for DSIT, advice on a viable approach to creating online advertising exception(s) to regulation 6 PECR (May 2026)](https://ico.org.uk/media2/yefdqvk4/20260505-report-for-dsit-on-changes-to-regulation-6-pecr-for-online-advertising.pdf), the preferred approach, permitted targeting information and consent for behavioral advertising
