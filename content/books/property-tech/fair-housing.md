+++
title = "Fair Housing"
description = "Fair housing for property platforms: protected classes as data, advertising, reasonable accommodations, disparate impact in algorithms, and enforcement."
category = "Property Tech Industry"
order = 1732
part = "The Rules"
tags = ["property-tech", "fair-housing", "compliance", "algorithms", "accessibility"]
+++

Fair housing law touches every screen a prospect or resident sees. The federal Fair Housing Act makes it unlawful to refuse to rent, to set different terms, to publish an advertisement that indicates a preference, or to falsely say a unit isn't available, because of race, color, religion, sex, disability, familial status or national origin, and it treats a refusal to make a reasonable accommodation for a disabled person as discrimination in its own right. States and cities add classes of their own, source of income the most consequential for software. None of this is a module a platform can buy. It's a property of the listing copy, the ad audience, the screening criteria, the pricing model, the AI agent's replies, the pet fee, the parking assignment and the reply to a resident's email asking for a ground-floor unit.

This chapter covers what the platform has to get right: protected classes resolved per property as data, advertising and the delivery of ads, reasonable accommodations and modifications as a tracked process with deadlines, disparate impact and the algorithms that can produce it, and how complaints and enforcement reach an operator. The legal record moved fast in 2025 and 2026, as HUD withdrew guidance and proposed removing its disparate impact regulation, so every status below is dated October 2026. The statute itself didn't change. [Applications & Screening](/books/property-tech/applications-and-screening#fair-housing-and-disparate-impact) owns the screening criteria and FCRA; [Listings, Websites & Marketing](/books/property-tech/listings-and-marketing#fair-housing-in-advertising) owns the listing; this chapter owns the fair housing questions that run through both.

## How the Platforms Do It

Vendors rarely sell "fair housing" as a product. It shows up as positioning on products that make or shape decisions, and as partner integrations for the one process that is unambiguously a fair housing workflow, assistance animals:

- **Screening models.** RealPage markets an AI screening score built on "over 30 million lease outcome records" from its rental history database and calls it "An Unbiased Addition to Your Team"; the page doesn't describe how the model is tested for disparate impact. Scored screening is where fair housing litigation against software has landed: in Louis v. SafeRent Solutions, a tenant screening score was challenged under the Fair Housing Act for its effect on housing voucher holders, and the case settled (below).
- **AI leasing agents.** Entrata's leasing AI answers leads by text, email, voice and chat in "30+ languages" and says renters "often mistake ELI for a real person." An agent that answers availability questions is making statements a housing provider is responsible for, in every language it speaks, which [AI in Property Management](/books/property-tech/ai-in-property-management#language-access) covers and the advertising section below applies.
- **Assistance animals.** Entrata announced a partnership with PetScreening in October 2024, and PetScreening says it reviews "reasonable accommodation requests for service animals and support animals following HUD & FHAct guidelines." Routing accommodation requests to a specialist is common; the obligation to decide them stays with the housing provider.
- **Ad platforms.** The largest change in housing advertising came from the ad platform side: Meta's 2022 settlement with the Justice Department ended a targeting tool for housing ads and required a system to reduce demographic skew in delivery (below).

What the market doesn't sell, and what this chapter adds, is the bookkeeping: which classes are protected at this property today, which requests for accommodation are open and how old they are, which criteria and models were tested and with what result, and which complaints are pending.

## Protected Classes

The federal list is in 42 U.S.C. 3604: race, color, religion, sex, familial status and national origin throughout, and handicap (the statute's word; HUD and this volume say disability) in the advertising, availability and disability-specific subsections. State and local law adds more. California's Fair Employment and Housing Act protects, among others, citizenship, immigration status, primary language, sexual orientation, gender identity and expression, genetic information, marital status, source of income (including Section 8 vouchers), military or veteran status and age, and protects people perceived to have a characteristic or associated with someone who has one.

Source of income is the class that changes software most, because it reaches the income test, the minimum credit score and the screening score. The Poverty & Race Research Action Council keeps the standard compendium of state and local source-of-income laws; its March 2026 update says over 57% of voucher holders are now covered, and lists New York, California, Colorado, Rhode Island, Maryland, Virginia and Illinois as states added since December 2018. The count changes every legislative session, which is the point: protected classes are rules with effective dates, resolved per property, never a hard-coded list.

The model follows [Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#rules-as-effective-dated-data). Each jurisdiction's classes are a `legal_rules` row of type `protected_classes`, with `params` listing the classes and any definitions that matter to software (for example whether "source of income" includes housing vouchers), and `source_of_income` rules carry what the law requires of the income test. A property's protected classes on a date are the union across the jurisdictions it sits in: federal, state, county and city. Union is the right operator here because fair housing laws stack rather than preempt; the stricter local protection applies alongside the federal one ([Conflicts and Preemption](/books/property-tech/landlord-tenant-law#conflicts-and-preemption)).

Exemptions exist but rarely help a platform's customers. The Act exempts an individual owner renting a single-family home without a broker and owner-occupied buildings of four or fewer units, but the exemption expressly excludes 3604(c), so even an exempt owner can't publish a discriminatory ad; and an operator using a management company is by definition using an agent. Housing for older persons may exclude families with children if it qualifies under 3607(b): all residents 62 or older, or 55-plus housing where at least 80% of occupied units have a resident 55 or older, with published policies and occupancy verification by surveys and affidavits. That verification is a recurring data job, and [Senior Living](/books/property-tech/senior-living#the-continuum) owns it.

What the platform does with protected-class data is as important as knowing the list. My rule: protected characteristics are collected only where a program requires it (HUD-assisted properties collect race and ethnicity on applications), stored apart from the decision records, and never available as inputs to screening, pricing or ad targeting. HUD's own occupancy handbook calls it good practice to keep race, ethnicity, gender and family size off the waiting list even though they are in the file, because they are "not directly relevant to tenant selection." The same separation makes fairness testing possible later without contaminating the decision.

## Advertising

Section 3604(c) makes it unlawful to "make, print, or publish" any notice, statement or advertisement indicating a preference, limitation or discrimination on a protected basis, and HUD's regulation at 24 CFR 100.75 extends it to written and oral statements, to "words, phrases, photographs, illustrations, symbols or forms," and to "selecting media or locations for advertising" in ways that deny people information about housing. For a platform that means four surfaces:

- **Copy.** Listing descriptions, website text, email and SMS templates, and AI-generated replies. Phrases that describe the people wanted ("perfect for young professionals," "no kids") rather than the property are the classic problem; a pre-publish review that flags them is cheap and catches the obvious cases.
- **Audience.** Who sees an ad. In United States v. Meta Platforms, the Justice Department alleged that Meta's ad delivery algorithms relied in part on protected characteristics when choosing who saw housing ads. Under the settlement entered June 27, 2022, Meta stopped using its Special Ad Audience tool for housing ads, agreed not to offer housing advertisers targeting options that describe or relate to protected characteristics, built a Variance Reduction System to reduce disparities in delivery, and paid $115,054, the maximum penalty then available. A platform that buys media for operators should assume the same: no targeting by protected characteristics or obvious proxies for them, and records of what audience settings each campaign used.
- **Statements about availability.** Section 3604(d) makes it unlawful to tell someone on a protected basis that a dwelling isn't available when it is. A leasing agent, human or AI, that quotes different availability or different specials to different prospects is the risk; availability and pricing answers come from the system of record, the same for everyone, the conversation is logged, and response times are compared across channels and languages ([The Leasing Funnel](/books/property-tech/operating-metrics#the-leasing-funnel) defines speed to lead; [Telling People They're Talking to an AI](/docs/compliance/consumer-contact#telling-people-they-re-talking-to-an-ai) covers the disclosure side).
- **Language.** Translation broadens access, and inconsistent translation creates differences in what people were told. My rule: translated listing and agent content is generated from the same structured facts (price, fees, availability, criteria) as the English version, never free-written per language.

Affirmative marketing adds obligations on HUD-assisted properties. HUD's occupancy handbook requires owners to follow a HUD-approved Affirmative Fair Housing Marketing Plan, market to those "least likely to apply," include the Equal Housing Opportunity logo, slogan or statement in all advertising, depict members of all eligible protected classes when advertising depicts people, review the plan every five years, and keep records (copies of media and marketing materials, records of activities) to show during compliance reviews. Those are data requirements the marketing module can meet by keeping every published ad with its date, channel and audience.

Guidance status, as of October 2026: HUD's May 2024 guidance on applying the Act to advertising through digital platforms was withdrawn by HUD's Office of Fair Housing and Equal Opportunity effective September 2025, and the withdrawal was published in the Federal Register on April 6, 2026 (91 FR 17291). The statute and 24 CFR 100.75 are unchanged.

## Reasonable Accommodations and Modifications

Disability is the protected class with an affirmative duty. Section 3604(f)(3) defines discrimination to include refusing "reasonable accommodations in rules, policies, practices, or services" needed for a person with a disability to have equal opportunity to use and enjoy a dwelling, and refusing to permit "reasonable modifications of existing premises" at the disabled person's expense (with a restoration condition allowed for rental interiors where reasonable). HUD's regulation gives the two canonical examples: allowing a guide dog in a no-pets building, and assigning a reserved parking space near the unit of a resident with a mobility impairment in a first-come lot.

The 2004 Joint Statement of HUD and the Justice Department on reasonable accommodations, which was not among the documents HUD withdrew in 2025 and 2026, describes the process a platform has to support:

- **A request needs no form and no magic words.** Requests can be oral or written, and a provider can't refuse one because the requester didn't use its form. Any channel the platform offers (portal, email, a maintenance request, a leasing chat, an AI agent) can receive one, and each has to route it.
- **Verification is limited.** If the disability and the need are obvious, the provider generally can't ask for more. If not, it may ask for reliable verification of the disability, a description of the needed accommodation and the connection between them; medical records are usually unnecessary, and the information must be kept confidential.
- **Denial is narrow, and alternatives come first.** A provider may deny a request that would impose an undue financial and administrative burden or fundamentally alter its operations, but should discuss alternatives that meet the need, and failing to reach agreement is effectively a denial.
- **Delay is denial.** Undue delay in responding can be treated as a failure to accommodate.
- **No fees.** A provider can't charge an extra fee or deposit for an accommodation, though it may charge for damage if it normally charges residents for damage.

The 2008 Joint Statement covers modifications (structural changes, usually at the resident's expense in private housing). Assistance animals are the highest-volume request in practice. HUD withdrew its 2020 notice on assessing assistance animal requests (FHEO-2020-01) and its 2013 notice on service and assistance animals effective September 2025, published April 6, 2026 (91 FR 17291). The duty to accommodate, the regulation's guide-dog example and the 2004 Joint Statement remain.

![A reasonable accommodation request as a case. Five channels (portal, email, work order, leasing chat, AI agent) join into a case that records the received date and a respond-by date, with a note that undue delay counts as denial. A decision asks whether the need is obvious: yes goes straight to the interactive process (offers and alternatives); no goes first to verification, a store that is sealed with access logged, and then to the interactive process. The accented path leads to grant, which becomes configuration: waive pet fees, assign a space, move a clock. A dashed path marked no agreement leads to deny, a terminal box, for undue burden or fundamental alteration.](/diagrams/pt-fh-accommodation.svg "Any channel can open the case, and its clock starts when the request arrives. Verification is asked for only when the need isn't obvious and is kept sealed; a denial is reachable only through the alternatives step.")

For the system, an accommodation is a case with a clock, not a note on the resident's file:

- **Capture from every channel.** A maintenance request that says "I use a wheelchair and need a ramp," a chat message asking to keep an emotional support animal, an email asking to pay on the fifth because benefits arrive on the third: each opens an accommodation request, flagged by staff or by the intake model and confirmed by a person.
- **Track the interactive process.** Every request has a received date, a response-by date set by tenant policy, the verification asked for (if any) and when it arrived, each offer and alternative, and the decision with its reason and decider. The case can't be closed as "denied" without an alternatives step recorded.
- **Turn decisions into configuration.** A granted assistance animal waives pet rent, pet fees and pet deposits for that animal on that lease; a granted parking accommodation assigns a space; a granted payment-date change moves the late fee clock. The ledger and the lease read the decision; staff don't remember it.
- **Keep the medical part sealed.** Verification documents live in restricted storage with access logged ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)), visible to the people deciding and nobody else, and never shared with screening or with the owner's reports ([Tenant Data](/books/property-tech/records-privacy-and-audits#tenant-data)).

## Disparate Impact and Algorithms

Disparate impact liability means a practice can violate the Fair Housing Act because of its effects, without intent. The Supreme Court recognized such claims under the Act in Texas Department of Housing and Community Affairs v. Inclusive Communities Project (2015). HUD codified a three-step test at 24 CFR 100.500: the challenger shows the practice "caused or predictably will cause a discriminatory effect"; the respondent must then prove the practice is necessary to achieve a substantial, legitimate, nondiscriminatory interest; and the challenger can still prevail by showing that interest could be served by a practice with a less discriminatory effect.

Status as of October 2026:

- **Executive Order 14281** (April 23, 2025), "Restoring Equality of Opportunity and Meritocracy," set a federal policy of eliminating disparate impact liability "to the maximum degree possible" and directed agencies to identify regulations to amend or repeal.
- **HUD's proposed repeal.** On January 14, 2026, HUD proposed removing 24 CFR part 100 subpart G (section 100.500) and the related sentence in 100.5(b), leaving disparate impact standards to the courts (Docket FR-6540-P-01, 91 FR 1475; comments closed February 13, 2026). The proposal doesn't say disparate impact claims are invalid.
- **Supplemental proposal.** On August 10, 2026, HUD proposed removing disparate impact provisions from its Title VI regulations for recipients of HUD funding and reopened comment on the January proposal for related topics (Docket FR-6540-P-02, 91 FR 51416; comments closed October 9, 2026).
- **No final rule** under docket FR-6540 appears in the Federal Register as of late October 2026, so section 100.500 is still in the regulations, and Inclusive Communities remains the Supreme Court's reading of the statute either way.

For software, the regulatory swing changes less than it seems. Removing HUD's codified test doesn't remove the statute, the Supreme Court decision, private suits or state law, and a screening or pricing model has a multi-year life that will outlast at least one more change of direction. My default is to build as if the three-step test applies, because each step maps to a record the platform can keep: the effect (outcome rates by group), the interest (what the criterion or model predicts, and the evidence it does), and the alternatives (what was tried and what it cost).

Where algorithms create the risk:

- **Screening scores and criteria.** The live example is Louis v. SafeRent Solutions (D. Mass., No. 1:22-cv-10800), in which voucher holders alleged that a tenant screening score disproportionately harmed Black and Hispanic applicants and voucher users. The Justice Department and HUD filed a statement of interest in January 2023, and the court granted final approval on November 20, 2024 to a $2,275,000 settlement that, per plaintiffs' counsel, includes injunctive relief protecting Massachusetts voucher holders from assessment through the score. The design lesson is narrow and concrete: a credit-weighted score applied to an applicant whose rent is mostly paid by a voucher measures the wrong risk, and source-of-income laws increasingly say so. [Applications & Screening](/books/property-tech/applications-and-screening#source-of-income) owns the criteria; this chapter owns the testing.
- **Pricing.** A pricing model that sets different prices by unit features is lawful; one whose inputs include, or proxy for, neighborhood demographics invites an effects claim. [Revenue Management & Pricing](/books/property-tech/revenue-management#what-gets-priced) owns the model; the fairness test below applies to it.
- **Ad delivery.** Delivery optimization can skew audiences without any targeting choice, which is what Meta's Variance Reduction System exists to counter.
- **AI agents.** An agent that steers, answers differently by name or language, or treats an accommodation request as a pet request creates intent-based exposure, not only effects. Its replies are tested with paired prompts, the way testers test people (below), and [AI in Property Management](/books/property-tech/ai-in-property-management#fair-housing-screening-and-pricing-risk) covers the agent side.

A **fairness test** runs a decision process over a population and compares outcomes across groups. Three sources of group membership exist, each with limits: **observed** data where the program collects it (HUD-assisted applications), **proxies** built from public data (the CFPB publishes a methodology that estimates race and ethnicity from publicly available census data for fair lending analysis, because lenders generally can't collect it), and **paired tests**, synthetic applicants or prompts identical except for a protected characteristic or its signal. Results are recorded with the method, the population and period, the comparison, the threshold the operator or vendor set for review, and what was done about it. The record is what answers the second and third steps of the test years later, and it belongs next to the model's version, as [Automated Risk Decisions](/docs/architecture/risk-scoring#the-decision-record) describes for every scored decision.

## Enforcement

A fair housing claim can reach an operator by four routes, and the platform's records are the evidence in each:

- **HUD complaints.** An aggrieved person may file with HUD within one year of the practice; HUD must complete its investigation within 100 days unless impracticable, and must try to conciliate from filing until a charge or dismissal. State and local fair housing agencies also take complaints under their own laws.
- **Private suits.** An aggrieved person may sue within two years, whether or not a HUD complaint was filed, for actual and punitive damages, injunctions and attorney's fees.
- **The Justice Department.** The Attorney General may sue over a pattern or practice of discrimination or a denial of rights raising an issue of general public importance, with civil penalties in the statute of up to $50,000 for a first violation and $100,000 for a subsequent one, adjusted for inflation by regulation.
- **Testers.** Fair housing organizations send paired testers, in person or by phone, email and chat, to see whether people are treated differently, often funded by HUD's Fair Housing Initiatives Program. FHIP funding has been in litigation since HUD terminated 78 grants on February 27, 2025; as of October 2026, a District of Massachusetts court had on August 26, 2026 vacated HUD's FY2025 FHIP funding notices by temporary restraining order, and the challenge to the FY2026 notices was pending.

Federal posture changed in 2025 and 2026, as of October 2026: HUD's Office of General Counsel withdrew 13 guidance documents effective September 25, 2025 (published July 17, 2026, 91 FR 44867), including its 2016 guidance on criminal records, its 2016 guidance on limited English proficiency, its 1990 memorandum of understanding with the Justice Department on enforcement, its 2011 memo on referring pattern-or-practice cases, and its November 2024 guidance on source-of-income restrictions. Withdrawn guidance was HUD's interpretation, not law; private plaintiffs, state agencies and courts were never bound by it. My rule is to design for the statute and the courts and to treat federal guidance as a description of current enforcement priorities, which is exactly why the rules engine carries sources and dates.

When a complaint arrives, the platform's job is to preserve and produce: open a complaint record, place a legal hold on the property's records for the relevant period ([Retention and Legal Holds](/books/property-tech/records-privacy-and-audits#retention-and-legal-holds)), and be able to show the listing as published, the criteria in force, the screening decision and its inputs, the accommodation case, and every message exchanged, each as of the dates in question.

## How to Build It

This extends the [core data model](/books/property-tech/property-business#the-core-data-model) and resolves law through [Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#how-to-build-it). Protected classes and source-of-income rules are `legal_rules` rows; the tables below hold the operator's cases and tests.

```sql
-- Protected classes at a property on a date: union across its jurisdictions.
SELECT DISTINCT jsonb_array_elements_text(r.params -> 'classes') AS protected_class
FROM property_jurisdictions pj
JOIN legal_rules r ON r.jurisdiction_id = pj.jurisdiction_id
WHERE pj.property_id = $1
  AND pj.valid_during @> $2::date
  AND r.rule_type = 'protected_classes'
  AND r.status = 'approved'
  AND r.valid_during @> $2::date;

CREATE TABLE accommodation_requests (     -- a case with a clock
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  property_id          UUID NOT NULL REFERENCES properties (id),
  person_id            UUID NOT NULL REFERENCES people (id),  -- the person with the need
  requested_by_person_id UUID REFERENCES people (id),         -- a household member or advocate
  lease_id             UUID REFERENCES leases (id),           -- null for an applicant
  kind                 TEXT NOT NULL CHECK (kind IN ('accommodation', 'modification')),
  category             TEXT NOT NULL CHECK (category IN ('assistance_animal', 'parking',
                         'unit_assignment', 'transfer', 'payment_timing', 'communication',
                         'policy_exception', 'structural', 'other')),
  summary              TEXT NOT NULL,      -- what was asked, in the requester's terms
  received_at          TIMESTAMPTZ NOT NULL,
  received_via         TEXT NOT NULL CHECK (received_via IN ('oral', 'written', 'portal',
                         'email', 'chat', 'ai_agent', 'work_order', 'application')),
  source_ref           TEXT,               -- the message or work order it came from
  need_is_obvious      BOOLEAN,            -- if so, no verification may be requested
  respond_by           DATE NOT NULL,      -- from tenant_policies; overdue is reportable
  status               TEXT NOT NULL CHECK (status IN ('received', 'verification_requested',
                         'in_dialogue', 'granted', 'granted_alternative', 'denied',
                         'withdrawn')),
  decided_at           TIMESTAMPTZ,
  decided_by           UUID REFERENCES users (id),
  decision_basis       TEXT CHECK (decision_basis IN ('not_disability_related',
                         'undue_burden', 'fundamental_alteration', 'direct_threat',
                         'no_verification')),  -- required when denied
  CHECK (status <> 'denied' OR decision_basis IS NOT NULL)
);

CREATE TABLE accommodation_events (       -- the interactive process, append-only
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  request_id          UUID NOT NULL REFERENCES accommodation_requests (id),
  kind                TEXT NOT NULL CHECK (kind IN ('note', 'verification_requested',
                        'verification_received', 'meeting', 'alternative_offered',
                        'alternative_declined', 'decision', 'reconsideration')),
  detail              TEXT,               -- never medical detail
  sealed_document_id  UUID,               -- verification, in restricted storage
  actor_user_id       UUID REFERENCES users (id),
  occurred_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE accommodation_effects (      -- what the decision changes, so systems obey it
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  request_id     UUID NOT NULL REFERENCES accommodation_requests (id),
  effect         TEXT NOT NULL CHECK (effect IN ('waive_charge_code', 'assign_space',
                   'change_due_day', 'change_contact_method', 'transfer_priority',
                   'approve_modification')),
  charge_code_id UUID REFERENCES charge_codes (id),       -- pet rent, pet deposit
  rentable_space_id UUID REFERENCES rentable_spaces (id),
  params         JSONB NOT NULL DEFAULT '{}',
  valid_during   DATERANGE NOT NULL
);

CREATE TABLE fairness_tests (             -- evidence for effect, interest and alternatives
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID,                  -- null for a platform-run test of a shared model
  subject_kind      TEXT NOT NULL CHECK (subject_kind IN ('screening_criteria',
                      'screening_model', 'pricing_model', 'ad_campaign', 'ai_agent')),
  subject_ref       TEXT NOT NULL,         -- criteria set id or model version
  population        TEXT NOT NULL,         -- which decisions, which properties
  period            DATERANGE NOT NULL,
  method            TEXT NOT NULL CHECK (method IN ('observed', 'census_proxy', 'paired_test')),
  protected_class   TEXT NOT NULL,         -- 'race', 'national_origin', 'source_of_income'
  results           JSONB NOT NULL,        -- outcome rate and count per group
  comparison        TEXT NOT NULL,         -- e.g. 'ratio of approval rates to reference group'
  review_threshold  NUMERIC,               -- set by the operator or vendor
  outcome           TEXT NOT NULL CHECK (outcome IN ('pass', 'review', 'fail')),
  interest_evidence TEXT,                  -- what the criterion predicts, and the evidence
  alternatives      JSONB,                 -- variants tried and their results
  reviewed_by       UUID REFERENCES users (id),
  run_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fair_housing_complaints (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  property_id          UUID NOT NULL REFERENCES properties (id),
  source               TEXT NOT NULL CHECK (source IN ('resident', 'applicant', 'tester',
                         'hud', 'state_agency', 'local_agency', 'doj', 'court', 'internal')),
  agency_case_number   TEXT,
  bases                TEXT[] NOT NULL,    -- protected classes alleged
  issues               TEXT[] NOT NULL,    -- 'refusal_to_rent', 'terms', 'advertising',
                                           -- 'accommodation', 'harassment', 'retaliation'
  practice_occurred    DATERANGE,          -- what the hold must cover
  received_on          DATE NOT NULL,
  status               TEXT NOT NULL CHECK (status IN ('open', 'investigating',
                         'conciliation', 'charged', 'litigation', 'closed')),
  legal_hold_id        UUID REFERENCES legal_holds (id),  -- Records, Privacy & Audits
  closed_on            DATE,
  resolution           TEXT
);
```

The accommodation effects are what the rest of the system reads. The rent run skips a waived charge code for the life of the effect, and a guard query catches the mistake before a resident does:

```sql
-- Pet charges posted on a lease with a granted assistance-animal accommodation.
SELECT c.id, c.lease_id, c.amount
FROM charges c
JOIN accommodation_requests ar ON ar.lease_id = c.lease_id
JOIN accommodation_effects ae ON ae.request_id = ar.id
WHERE ae.effect = 'waive_charge_code'
  AND ae.charge_code_id = c.charge_code_id
  AND ae.valid_during @> c.posted_on
  AND ar.status IN ('granted', 'granted_alternative')
  AND c.reverses_charge_id IS NULL;
```

Design decisions:

- **Requests from any channel.** Intake classifiers on messages, work orders and agent conversations propose an accommodation request; a person confirms it, and the received time is the original message's, not the confirmation's, because the clock started when the resident asked.
- **Overdue is a queue.** Open requests past `respond_by` appear on a daily list for the property manager and the compliance team, the same way an emergency work order does.
- **Protected data stays out of decisions.** Columns that hold demographic data collected for HUD programs live in a separate table with its own grants; screening, pricing and targeting features are built from an allowlist that can't include them ([Classifying Personal Data](/docs/data/data-governance#classifying-personal-data)).
- **Tests run on versions.** A screening criteria set or model version can't go live without a fairness test on record, and a test that ends in `review` or `fail` needs a reviewer's note before the version is promoted, the same gate [Changing Rules and Models Safely](/docs/architecture/risk-scoring#changing-rules-and-models-safely) describes.
- **Ads are records.** Every published listing, ad creative and audience setting is kept with its dates and channel, because 3604(c) claims and HUD affirmative marketing reviews both ask what was published, where and to whom.

## Auditing

- **Accommodations.** Count, category, median and worst time to decision, share granted, granted as an alternative and denied, and every denial's basis, by property and month. Any denial without a recorded alternatives step is an exception.
- **Charges against accommodations.** The guard query above runs nightly; any row is a refund and an incident.
- **Fairness tests.** For each live criteria set, model and AI agent version: when it was last tested, by which method, with what result, and who signed off. A live version with no test is an exception.
- **Advertising.** Published copy flagged by review and what happened to it; campaign audience settings; for HUD-assisted properties, the marketing records the Affirmative Fair Housing Marketing Plan requires.
- **Complaints.** Open complaints by age and stage, each with a legal hold, and the evidence package produced for it.

## What This Means for the System You Build

- **Resolve protected classes per property** from effective-dated rules, as the union of federal, state and local law, never as a constant.
- **Keep protected characteristics out of every decision path,** stored apart, with access logged, and available only to fairness testing and program reporting.
- **Run accommodations as cases with clocks** from every intake channel, with verification limits, an alternatives step and decisions that change charges and assignments automatically.
- **Test screening criteria, pricing models, ad delivery and AI agents** for disparate effects before release and on a schedule, and keep the evidence for all three steps of the test.
- **Generate every language and every agent answer from the same facts,** so availability, price and criteria never differ by who asked.
- **Keep every published ad with its audience** and every complaint with a legal hold.
- **Date every regulatory status** and design for the statute and the courts rather than for this year's guidance.

## References

**Statutes and regulations**

- [42 U.S.C. 3604: Discrimination in the sale or rental of housing](https://www.law.cornell.edu/uscode/text/42/3604), refusal to rent, terms, advertising, false unavailability, reasonable modifications and accommodations
- [42 U.S.C. 3603: Effective dates of certain prohibitions](https://www.law.cornell.edu/uscode/text/42/3603), the single-family and owner-occupied exemptions and their exclusion of 3604(c)
- [42 U.S.C. 3607: Religious organization or private club exemption](https://www.law.cornell.edu/uscode/text/42/3607), housing for older persons, 62-plus and 55-plus with 80% occupancy and verification
- [42 U.S.C. 3610: Administrative enforcement](https://www.law.cornell.edu/uscode/text/42/3610), one year to file, 100-day investigation, conciliation
- [42 U.S.C. 3613: Enforcement by private persons](https://www.law.cornell.edu/uscode/text/42/3613), two years to sue, damages, injunctions, fees
- [42 U.S.C. 3614: Enforcement by the Attorney General](https://www.law.cornell.edu/uscode/text/42/3614), pattern or practice suits and civil penalties of $50,000 and $100,000
- [24 CFR 100.75: Discriminatory advertisements, statements and notices](https://www.law.cornell.edu/cfr/text/24/100.75), words, images, media selection
- [24 CFR 100.204: Reasonable accommodations](https://www.law.cornell.edu/cfr/text/24/100.204), the guide dog and reserved parking examples
- [24 CFR 100.500: Discriminatory effect prohibited](https://www.law.cornell.edu/cfr/text/24/100.500), the three-step burden-shifting test
- [California Civil Rights Department: Housing](https://calcivilrights.ca.gov/housing/), protected characteristics in housing under California law

**Agency actions, as of October 2026**

- [Federal Register: HUD's Implementation of the Fair Housing Act's Disparate Impact Standard (91 FR 1475)](https://www.federalregister.gov/documents/2026/01/14/2026-00590/huds-implementation-of-the-fair-housing-acts-disparate-impact-standard), proposed repeal of 24 CFR 100.500, Docket FR-6540-P-01, comments closed February 13, 2026
- [Federal Register: Amendments to HUD's Title VI Regulations (91 FR 51416)](https://www.federalregister.gov/documents/2026/08/10/2026-16228/huds-implementation-of-the-fair-housing-acts-disparate-impact-standard-amendments-to-huds-title-vi), supplemental proposal, Docket FR-6540-P-02, comments closed October 9, 2026
- [Federal Register: Notification of Withdrawal of Fair Housing and Equal Opportunity Guidance Documents (91 FR 17291)](https://www.federalregister.gov/documents/2026/04/06/2026-06624/notification-of-withdrawal-of-fair-housing-and-equal-opportunity-guidance-documents), the FHEO withdrawals published April 6, 2026
- [Federal Register: Notice of the Withdrawal of OGC Guidance Documents (91 FR 44867)](https://www.federalregister.gov/documents/2026/07/17/2026-14432/notice-of-the-withdrawal-of-ogc-guidance-documents), 13 Office of General Counsel documents withdrawn effective September 25, 2025
- [NLIHC: HUD publishes notice removing fair housing guidance documents](https://nlihc.org/resource/hud-publishes-notice-removing-fair-housing-guidance-documents), the eight FHEO documents, including the digital advertising guidance and FHEO-2020-01
- [HUD: HUD Issues Fair Housing Act Guidance on Applications of Artificial Intelligence (May 2, 2024)](https://archives.hud.gov/news/2024/pr24-098.cfm), the screening and digital advertising guidance as announced
- [LeadingAge: HUD withdraws wide-ranging fair housing policies](https://leadingage.org/hud-withdraws-wide-ranging-fair-housing-policies/), the September 17, 2025 FHEO memo and its list
- [Consumer Financial Services Law Monitor: HUD proposes to rescind Fair Housing Act disparate impact regulations](https://www.consumerfinancialserviceslawmonitor.com/2026/01/hud-proposes-to-rescind-fair-housing-act-disparate-impact-regulations/), the proposal's scope and Executive Order 14281
- [Spencer Fane: HUD moves to dismantle its disparate impact framework](https://www.spencerfane.com/insight/hud-moves-to-dismantle-its-disparate-impact-framework-under-the-fair-housing-act/), Inclusive Communities (2015) and the proposal's status

**Guidance in force**

- [HUD and DOJ: Joint Statement on Reasonable Accommodations under the Fair Housing Act](https://www.justice.gov/crt/about/hce/jointstatement_ra.php), oral or written requests, verification limits, alternatives, delay, no fees
- [HUD and DOJ: Joint Statement on Reasonable Modifications under the Fair Housing Act (PDF)](https://www.justice.gov/crt/about/hce/documents/reasonable_modifications_mar08.pdf), structural modifications (March 5, 2008)
- [HUD Handbook 4350.3 REV-1, Chapter 4 (PDF)](https://www.hud.gov/sites/documents/43503c4hsgh.pdf), Affirmative Fair Housing Marketing Plans, advertising and logo requirements, marketing records, keeping demographics off waiting lists
- [CFPB: Using publicly available information to proxy for unidentified race and ethnicity](https://www.consumerfinance.gov/data-research/research-reports/using-publicly-available-information-to-proxy-for-unidentified-race-and-ethnicity/), a census-based proxy method for fair lending analysis
- [PRRAC: Appendix B, State, Local and Federal Laws Barring Source-of-Income Discrimination](https://prrac.org/appendixb/), March 2026 update, over 57% of voucher holders covered, states added since 2018

**Cases and enforcement**

- [DOJ: United States v. Meta Platforms](https://www.justice.gov/crt/case/united-states-v-meta-platforms-inc-fka-facebook-inc-sdny), ad delivery allegations, Special Ad Audience, Variance Reduction System, $115,054 penalty, judgment entered June 27, 2022
- [Cohen Milstein: Louis et al. v. SafeRent Solutions](https://cohenmilstein.com/case-study/louis-et-al-v-saferent-solutions-et-al), D. Mass. No. 1:22-cv-10800, $2.275 million final approval November 20, 2024, DOJ and HUD statement of interest
- [Lawyer Monthly: Judge approves settlement in AI discrimination lawsuit over rental scoring algorithm](https://lawyer-monthly.com/2024/11/judge-approves-settlement-in-ai-discrimination-lawsuit-over-rental-scoring-algorithm), the allegations about vouchers and credit weighting
- [National Fair Housing Alliance: court order on FY2025 FHIP notices](https://nationalfairhousing.org/?p=12400), the August 26, 2026 temporary restraining order and the pending FY2026 challenge
- [NAR: Fair housing groups sue HUD over grant cancellations](https://www.nar.realtor/washington-report/fair-housing-groups-sue-hud-over-grant-cancellations), the February 2025 FHIP terminations

**In practice**

- [RealPage: AI Screening](https://www.realpage.com/apartment-marketing/resident-screening/ai-screening/), a score built on over 30 million lease outcome records
- [Entrata: Leasing AI](https://www.entrata.com/products/leasing-ai), 30+ languages and renters mistaking the agent for a person
- [Entrata: Entrata partners with PetScreening](https://www.entrata.com/press/entrata-partners-with-petscreening), assistance animal and pet screening integration (October 21, 2024)
- [PetScreening](https://www.petscreening.com/), reviewing assistance animal accommodation requests
