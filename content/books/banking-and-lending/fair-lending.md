+++
title = "Fair Lending, HMDA & 1071"
description = "Fair lending after the 2026 Reg B rule: ECOA and the Fair Housing Act, redlining enforcement, the HMDA LAR, the revised 1071 rule and testing as records."
category = "Banking & Lending Industry"
order = 2446
part = "Origination and Underwriting"
tags = ["banking", "lending", "fair-lending", "ecoa", "hmda", "section-1071", "compliance"]
+++

Fair lending law says a lender may not treat applicants differently because of who they are, and the data laws make lenders prove it in public. The Equal Credit Opportunity Act covers every kind of credit, consumer and business; the Fair Housing Act covers loans tied to homes; the Home Mortgage Disclosure Act makes mortgage lenders publish a record of every application and its outcome; and Section 1071 of Dodd-Frank will do the same for small business credit from 2028. None of it is a module a lender buys. It runs through the eligibility rules, the pricing grid, the exception process, the marketing plan, the branch map, the model's inputs and the field on the application that asks an applicant's race, which by law nobody deciding the loan should be able to see.

The ground moved in 2026. The CFPB's revised Regulation B, effective July 21, 2026, says ECOA doesn't support disparate impact liability, narrows discouragement to statements, and limits special purpose credit programs; the revised 1071 rule of May 2026 cut the small business data collection to a narrower set of lenders, businesses and fields. The Fair Housing Act, state laws and private suits didn't move. This chapter covers both statutes and who they reach, the 2026 rule and its status, discouragement and special purpose programs, redlining enforcement and its unwinding, the HMDA register, the 1071 rule, and fair lending testing as a record the lender keeps. Every status is as of October 2026. The models behind the decisions are in [Model Risk Management](/books/banking-and-lending/model-risk); the notice a declined applicant gets is in [Adverse Action & Explaining Decisions](/books/banking-and-lending/adverse-action); the Fair Housing Act's reach into rentals is in Property Tech's [Fair Housing](/books/property-tech/fair-housing).

## How the Platforms Do It

Fair lending shows up in the market as testing software, data filing tools and the disclosures lenders make about their own models. As of October 2026, from public pages and filings:

| Who | What | Public detail |
| --- | --- | --- |
| **CFPB (Regulation C)** | Filing, the public data | Lenders file the loan/application register electronically by March 1 and tell the public their modified register is on the Bureau's website |
| **FairPlay** | Bias testing and validation | "Bias detection across protected classes and geographies," with a search to "surface less discriminatory alternatives" and automated fair lending reporting |
| **SolasAI** | Disparity testing | Disparity testing, "the generation of justifiable alternatives," and monitoring of deployed models for drift and fairness risk |
| **Upstart** | A lender's own statement | Says it performs "fairness testing on our models to help satisfy lending partners' regulatory obligations" |
| **ValidMind** | Model governance | An AI and model risk platform with inventories, validation and documentation, positioned for SR 26-2 |

Two things to notice. The testing vendors sell the same three steps a disparate impact case has always run (measure the disparity, justify the criterion, search for a less discriminatory alternative), and one of them is a plaintiff in the suit challenging the 2026 rule (below). And the lender that runs a model for bank partners treats fairness testing as the partners' regulatory obligation it serves, which is how most fair lending work in partnerships is divided: the bank answers to the examiner, the platform produces the evidence.

## The Two Statutes

**ECOA and Regulation B** make it unlawful for a creditor to discriminate against an applicant "in any aspect of a credit transaction" on the basis of race, color, religion, national origin, sex, marital status or age (if the applicant can contract), because income comes from public assistance, or because the applicant exercised a right under the consumer credit laws (15 U.S.C. 1691(a)). It covers consumer and business credit, every product, and every step: marketing, application, underwriting, pricing, servicing and collections.

**The Fair Housing Act** makes it unlawful for anyone whose business includes residential real estate-related transactions to discriminate in making them available or in their terms, on the basis of race, color, religion, sex, handicap, familial status or national origin (42 U.S.C. 3605). A residential real estate-related transaction is making or buying a loan to purchase, build, improve, repair or maintain a dwelling, or a loan secured by residential real estate, and it includes appraising residential property. So a mortgage, a HELOC and a home improvement loan sit under both statutes; a credit card, an auto loan and a small business term loan sit under ECOA alone (unless the business loan is secured by a home).

The two statutes overlap but differ where the 2026 rule cuts. ECOA has marital status, age and public assistance income; the FHA has familial status and disability. And the FHA's disparate impact standard comes from the Supreme Court's reading of that statute in *Inclusive Communities* (2015), which a Regulation B amendment can't touch. Property Tech's [Disparate Impact and Algorithms](/books/property-tech/fair-housing#disparate-impact-and-algorithms) covers HUD's codified three-step test, its proposed repeal and why the statute outlasts the regulation; the same analysis applies to a mortgage lender's pricing model.

Discrimination is proven three ways, and each maps to records:

- **Overt evidence:** a statement or written policy that treats a group differently. The record is the policy, the script, the ad and the agent's reply.
- **Comparative evidence of disparate treatment:** similar applicants treated differently, shown by matched-pair file comparisons or regression on outcomes. The record is the decision with its inputs and the exceptions granted.
- **Disparate impact:** a neutral criterion with a disproportionate adverse effect on a protected group that isn't justified by business necessity or could be served by a less discriminatory alternative. The record is the testing.

## Disparate Impact and the 2026 Reg B Rule

The CFPB's final rule amending Regulation B was published April 22, 2026 (91 FR 21620, Docket CFPB-2025-0039) and took effect July 21, 2026. It concluded that "under the best reading of the statute, disparate-impact claims are not cognizable under ECOA" and changed three things:

- **The effects test is out of Regulation B.** Section 1002.6(a) now says "The Act does not provide that the 'effects test' applies" to discrimination determinations. New comment 6(a)-2 says the Act doesn't prohibit facially neutral practices "except to the extent that facially neutral criteria function as proxies for protected characteristics." A criterion chosen because it tracks race is still discrimination; a criterion that merely correlates with race is no longer an ECOA violation under the Bureau's reading.
- **Discouragement is a statement.** Section 1002.4(b) now covers an oral or written statement directed at applicants "that the creditor knows or should know would cause a reasonable person to believe that the creditor would deny" credit or offer worse terms on a prohibited basis. Branch location, advertising footprint and community events are excluded as general business decisions, and "encouraging statements directed at one group of consumers cannot discourage other consumers."
- **Special purpose credit programs narrowed** (below).

Status, as of October 2026:

- **In force.** The rule took effect on schedule. The CFPB also rescinded its December 2020 advisory opinion on for-profit special purpose credit programs on June 17, 2026 (91 FR 36518), and the agencies rescinded their interagency statement on such programs on August 25, 2026 (91 FR 54875).
- **Challenged.** *National Fair Housing Alliance v. CFPB* (No. 1:26-cv-01820, D.D.C.), filed May 27, 2026 by the National Fair Housing Alliance, Rise Economy, BLDS and SolasAI, argues the Bureau exceeded its authority. The plaintiffs didn't seek a preliminary injunction; cross-motions for summary judgment run from September 29, 2026 to a final reply due January 12, 2027. A ruling for the plaintiffs could vacate the rule and restore the prior text.
- **States disagree.** The New York Department of Financial Services issued an industry letter the day the rule was published, reminding its licensees that "covered credit decisions that result in a disparate impact may constitute an unlawful discriminatory practice" under state law. New York's Executive Law 296-a and Illinois's Human Rights Act (775 ILCS 5/4-012) bar credit discrimination and have been read to reach effects.
- **The Fair Housing Act still applies** to dwelling-related credit, and HUD's regulation is proposed for removal, not removed ([Disparate Impact and Algorithms](/books/property-tech/fair-housing#disparate-impact-and-algorithms)).

For a lender, the rule changes the federal consumer-credit regulator's position, not the population of rules a model has to survive. A card or personal loan lender licensed in New York, any mortgage lender, and any bank whose prudential regulator or partner bank asks still runs disparate impact testing. My default is to keep running it for every product and to record it the same way, because a model in production for five years will see at least one more change of direction, the plaintiffs' suit may succeed, and the evidence is cheap to keep and impossible to reconstruct.

## Discouragement and Special Purpose Credit Programs

**Discouragement** was the theory behind several redlining cases: a lender that markets to some neighborhoods and not others, or a broker who says something on a podcast, discourages applicants who never apply. After the 2026 rule, Regulation B's version reaches statements, not footprints. A statement is still a record: ad copy, call scripts, chatbot replies, social posts by loan officers, each versioned and retained. Marketing geography still matters under the Fair Housing Act and to CRA examiners ([CRA](/books/banking-and-lending/exams-and-supervision#cra)).

**Special purpose credit programs** let a creditor extend credit to a class of people who would otherwise not get it, using a characteristic that would otherwise be a prohibited basis, under a written plan (12 CFR 1002.8). The 2026 rule says a for-profit program "shall not use the race, color, national origin, or sex" of applicants as an eligibility criterion, requires that participants would actually be denied credit under the creditor's standards (dropping the "less favorable terms" alternative), and expands the written plan; programs defined by income or geography without a prohibited basis remain possible. A lender with a program built on the old guidance (many were, after 2021) has to restructure or close it, and the system has to know which applications were decided under the program and which plan version applied.

## Redlining Enforcement

Redlining is refusing or discouraging lending in neighborhoods because of their racial or ethnic composition. The Justice Department's Combating Redlining Initiative, announced in October 2021, produced a run of settlements with banks and nonbank lenders, typically built around a loan subsidy fund for the affected neighborhoods and often a civil money penalty. Trustmark National Bank's October 2021 order, for example, carried a $3.85 million loan subsidy fund and a $5 million civil money penalty and was scheduled to run to October 2026.

The posture reversed in 2025. Executive Order 14281 (April 23, 2025) set a policy of eliminating disparate impact liability where possible, and the DOJ and CFPB moved to end orders early. As of mid-2025, courts had granted early termination of Trustmark's order, of Ameris Bank's (October 2023, after it disbursed its full $7.5 million subsidy fund) on May 20, 2025, of Evolve Bank & Trust's (September 2022) on May 29, 2025, and of Patriot Bank's (January 2024) on June 6, 2025. Not every request succeeded: in the Townstone Financial case, the court denied the CFPB's motion to vacate the November 2024 settlement. Lending patterns are still public in HMDA data, and private plaintiffs, state attorneys general and fair housing organizations can read them as easily as the DOJ.

For the system, an enforcement order is an obligation with milestones: a subsidy fund that must be disbursed and reported, branch and marketing commitments with dates, and reporting until termination. That is the same shape as any supervisory finding ([Findings: MRAs and Violations](/books/banking-and-lending/exams-and-supervision#findings-mras-and-violations)).

## HMDA: Who Reports and What

**Who.** A depository institution reports if it is above an asset threshold ($59 million for 2026), has an office in a metropolitan statistical area, and originated at least 25 closed-end mortgage loans or 200 open-end lines in each of the two preceding years; a nondepository mortgage lender reports on the same loan-volume and location tests with no asset test (12 CFR 1003.2(g)). An application under Regulation C is an oral or written request for a covered loan under the lender's procedures; a prequalification request isn't one.

**What.** Each covered application or loan is a row on the loan/application register (LAR), with up to 38 data points (1003.4(a)): the universal loan identifier, application date, loan type, purpose, preapproval, construction method, occupancy, amount, action taken and date, property location to census tract, each applicant's ethnicity, race and sex (and whether collected by visual observation or surname), age and income, the purchaser type, the rate spread against the average prime offer rate, HOEPA status, lien status, credit scores and the scoring model, the principal reasons for denial, total loan costs or points and fees, origination charges, discount points and lender credits, interest rate, prepayment penalty term, debt-to-income and combined loan-to-value ratios, loan term, introductory rate period, non-amortizing features, property value, manufactured home details, units, application channel, the loan originator's NMLS ID, the automated underwriting system and its result, and reverse mortgage, open-end and business-purpose flags.

**Partial exemptions.** Insured banks and credit unions that originated fewer than 500 closed-end loans (or fewer than 500 open-end lines) in each of the two preceding years may skip the ULI, the property address and most of the pricing and underwriting fields, (a)(12) and (a)(15) through (a)(30) and (a)(32) through (a)(38); a bank with a "needs to improve" CRA rating in its last two exams, or "substantial noncompliance" in its last, loses the exemption (1003.3(d)).

**When.** The lender records each row within 30 calendar days after the end of the quarter in which it took final action (1003.4(f)), files the year's register electronically by March 1 with an officer's certification, files quarterly within 60 days of each of the first three quarters if it reported at least 60,000 loans and applications, keeps its submission for three years, and posts a lobby notice that its modified register is on the Bureau's website (1003.5).

Most fields are already in the loan file, but HMDA has its own definitions: the "action taken" date, the rate spread computed against the APOR for the rate-set date, the "income relied on," and the denial reasons the underwriter recorded. My rule is to derive the LAR from the system of record by a versioned mapping, never to key it, and to run the edits the filing platform will run before quarter end rather than in February.

## Demographic Data and the Firewall

Regulation B generally forbids asking an applicant's race, color, religion, national origin or sex (12 CFR 1002.5(b)). The exceptions are the collections the law requires: for an application to buy or refinance a principal dwelling, the creditor must ask ethnicity, race, sex, marital status and age for monitoring, must tell the applicant the federal government requests it to monitor compliance, can't require an answer, and, if the applicant declines, must note ethnicity, race and sex on the basis of visual observation or surname to the extent possible (1002.13); HMDA records how it was collected; and Section 1071 will require the same questions of small businesses.

Section 1071 adds a **firewall** in the statute: where feasible, no underwriter or other employee involved in the credit decision may have access to the applicant's answers about whether the business is women- or minority-owned, or its principal owners' race, sex and ethnicity, and a lender that decides such access is necessary must tell the applicant and state that it may not discriminate on that basis (15 U.S.C. 1691c-2(d)). The statute also requires the answers to be kept separate from the application.

In the system that's an access-control boundary, not a form layout. The answers live in their own table, readable by the reporting and testing roles and not by the underwriting service or the people who use it, and every read is logged ([Least Privilege](/docs/security/authorization#least-privilege)). The decision engine never receives them as input, which is also the cleanest evidence that a model didn't use them.

## Section 1071

Section 1071 amended ECOA in 2010 to require lenders to collect and report data on credit applications from women-owned, minority-owned and small businesses (15 U.S.C. 1691c-2): application number and date, credit type and purpose, amount applied for and approved, action taken and date, census tract of the principal place of business, gross annual revenue, and the race, sex and ethnicity of principal owners, submitted annually, kept at least three years, and published by the Bureau. The CFPB's 2023 rule was stayed in litigation and its dates extended twice in 2025 (90 FR 25874; 90 FR 47514). The revised final rule was published May 1, 2026 (91 FR 23530), effective June 30, 2026:

- **Compliance:** a single date, January 1, 2028, for every covered lender, with data collected for calendar 2028 onward and good-faith errors generally not penalized during 2028.
- **Coverage:** lenders that originated at least **1,000** covered credit transactions in each of the two preceding calendar years (the 2023 rule said 100).
- **Small business:** gross annual revenue of **$1 million or less** (the 2023 rule said $5 million).
- **Excluded:** merchant cash advances, agricultural credit, transactions of $1,000 or less, trade credit, HMDA-reportable loans, insurance premium financing, incidental credit, factoring, true leases, and purchases of loans or interests in them.
- **Dropped data points:** application method, application recipient, denial reasons, pricing, number of workers and LGBTQI+-owned status; the anti-discouragement and related monitoring provisions were removed. The statutory data points remain, with modified collection of ownership status and principal owners' demographics.

The MCA exclusion matters for embedded and alternative lenders: a provider that buys receivables doesn't report, a provider that makes loans does, and the line is the same legal distinction [Merchant Cash Advances](/books/banking-and-lending/small-business-lending#merchant-cash-advances) and [Loans and Advances on One Engine](/books/banking-and-lending/embedded-lending#loans-and-advances-on-one-engine) draw. A platform near the 1,000-transaction line has to count originations per calendar year by the rule's definition of a covered transaction, and the count is itself a record.

## Fair Lending Testing

Testing turns the three proofs into scheduled analysis. The common forms, all of which predate the 2026 rule and survive it under the FHA, state law and partner banks' programs:

- **Underwriting outcome analysis:** approval and denial rates by group, controlled for the credit factors the policy uses, to find unexplained differences.
- **Pricing analysis:** rate, fees and dealer or broker compensation by group, controlled the same way; discretionary pricing (exceptions, overrides, markup) is where disparities concentrate.
- **Matched-pair file review:** similar applicants with different outcomes, read by a person.
- **Redlining analysis:** applications, originations and marketing by census tract minority share, against peers in the same market from public HMDA data.
- **Model disparity testing:** a model's approval or score distributions by group, with a search for a less discriminatory alternative model of comparable accuracy, and a record of what was found and chosen.
- **Proxy methods** where the product doesn't collect demographics (every non-mortgage consumer product): group membership estimated from surname and geography, with known error that the analysis has to carry.

Each test is a record: the scope (product, period, population), the method and its version, the group definitions and their source (collected or proxied), the controls, the metric and its value per group, the threshold the lender set for review, the finding, and what was done. The record answers the questions an examiner, a court or a partner bank asks years later, and it belongs beside the decision record and the model version it tested ([The Decision Record](/docs/architecture/risk-scoring#the-decision-record), [Measuring It](/docs/architecture/risk-scoring#measuring-it)).

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). Fair lending reads `applications` and `credit_decisions` and adds four tables: the demographic answers behind the firewall, the HMDA register rows, the 1071 register rows, and the tests.

```sql
CREATE TABLE demographic_responses (         -- behind the firewall: no underwriting role may read
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  application_id        UUID NOT NULL REFERENCES applications (id),
  party_id              UUID NOT NULL REFERENCES parties (id),     -- the applicant or principal owner
  regime                TEXT NOT NULL CHECK (regime IN ('reg_b_1002_13', 'hmda', 'section_1071')),
  ethnicity             TEXT[],                -- the categories as answered
  race                  TEXT[],
  sex                   TEXT,
  marital_status        TEXT,                  -- 1002.13 only
  age                   SMALLINT,
  business_ownership    TEXT[],                -- 1071: 'women_owned', 'minority_owned', ...
  declined              BOOLEAN NOT NULL DEFAULT FALSE,
  collection_method     TEXT NOT NULL CHECK (collection_method IN ('self_reported',
                          'visual_observation_or_surname', 'not_provided')),
  channel               TEXT NOT NULL,         -- 'in_person', 'online', 'phone', 'mail'
  form_version          TEXT NOT NULL,
  collected_at          TIMESTAMPTZ NOT NULL
);

CREATE TABLE hmda_lar_records (              -- one row per covered application or loan per year
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id        UUID NOT NULL REFERENCES institutions (id),
  application_id        UUID NOT NULL REFERENCES applications (id),
  activity_year         SMALLINT NOT NULL,
  uli                   TEXT,                  -- null when partially exempt and not reported
  action_taken          TEXT NOT NULL,         -- 'originated', 'approved_not_accepted', 'denied', ...
  action_taken_date     DATE NOT NULL,
  fields                JSONB NOT NULL,        -- the 1003.4(a) data points, by field name
  exempt_fields         TEXT[] NOT NULL DEFAULT '{}',  -- 1003.3(d) fields not reported
  mapping_version       TEXT NOT NULL,         -- how the row was derived from the loan file
  edit_results          JSONB,                 -- syntactical, validity, quality, macro edits
  recorded_at           TIMESTAMPTZ NOT NULL,  -- within 30 days of quarter end
  submission_ref        TEXT,                  -- the filing it went out in
  UNIQUE (institution_id, application_id, activity_year)
);

CREATE TABLE sblar_records (                 -- Section 1071, from January 1, 2028
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id        UUID NOT NULL REFERENCES institutions (id),
  application_id        UUID NOT NULL REFERENCES applications (id),
  reporting_year        SMALLINT NOT NULL,
  gross_annual_revenue  BIGINT,              -- decides small business status, minor units
  fields                JSONB NOT NULL,        -- the statutory data points
  rule_version          TEXT NOT NULL,         -- '2026-05-01 final rule'
  recorded_at           TIMESTAMPTZ NOT NULL,
  submission_ref        TEXT,
  UNIQUE (institution_id, application_id, reporting_year)
);

CREATE TABLE fair_lending_tests (            -- every analysis, with its method and result
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id        UUID NOT NULL REFERENCES institutions (id),
  program_id            UUID REFERENCES programs (id),
  kind                  TEXT NOT NULL CHECK (kind IN ('underwriting', 'pricing', 'matched_pair',
                          'redlining', 'model_disparity', 'marketing')),
  scope                 JSONB NOT NULL,        -- products, period, channels, geography
  model_version         TEXT,                  -- for model_disparity: the version tested
  policy_version        TEXT,
  group_source          TEXT NOT NULL CHECK (group_source IN ('collected', 'proxy', 'paired_test')),
  method_ref            TEXT NOT NULL,         -- the method document and its version
  results               JSONB NOT NULL,        -- metric per group, controls, significance
  review_threshold      JSONB NOT NULL,        -- what the lender set as needing review
  finding               TEXT NOT NULL CHECK (finding IN ('no_disparity', 'explained',
                          'needs_review', 'remediation')),
  alternatives_ref      TEXT,                  -- the less discriminatory alternatives tried
  action_taken          TEXT,
  legal_basis           TEXT[] NOT NULL,       -- 'fha', 'ny_exec_296a', 'partner_program', ...
  run_at                TIMESTAMPTZ NOT NULL,
  reviewed_by           TEXT
);
```

How it runs:

1. **Demographic answers are collected once and stored apart.** The application flow writes `demographic_responses` through a service the underwriting path can't call, with the form version and how each answer was obtained. Access is granted to the reporting and testing roles only, and every read is logged.
2. **The register is derived, not keyed.** A quarterly job builds `hmda_lar_records` from the application, decision, loan and disclosure records through a versioned mapping, runs the filing edits, and leaves exceptions for review well before the 30-day recording deadline. A correction after filing is a new version with its reason, and a resubmission references it ([Amend, Don't Overwrite](/docs/architecture/audit-trails#amend-don-t-overwrite)).
3. **1071 coverage is counted every year.** A job counts covered originations per calendar year under the rule's definition and records the result, so the lender knows by January whether it reports for the year after next.
4. **Tests run on a calendar and on change.** Every model release, policy change or new channel triggers a model disparity or underwriting test, and pricing and redlining tests run quarterly. A test whose finding is `needs_review` opens a case with an owner and a due date.
5. **Programs are applications' attributes.** A special purpose credit program decision carries the program and plan version on the `credit_decisions` row's terms, so the program's population can be produced and tested.

## Auditing

Fair lending examinations and suits ask for the same few things, by product and period:

- **Every decision with its inputs and reasons,** including overrides and pricing exceptions with who granted them.
- **The demographic answers,** how each was collected, and proof that the underwriting path couldn't read them.
- **The HMDA register as filed,** each row's derivation, edits and corrections, and the 1071 coverage count each year.
- **Every fair lending test,** with its method, population, group source, results, threshold, finding and action, beside the model and policy versions it tested.
- **Marketing and statements:** ad copy, scripts and automated replies as published, by version and date.
- **Special purpose programs:** the written plan by version and the decisions made under it.
- **Enforcement obligations:** each order's milestones and their evidence until termination.

## What This Means for the System You Build

- **Design for both statutes,** ECOA for every product and the Fair Housing Act for anything touching a home, and treat the 2026 Reg B rule as one regulator's reading, not the end of effects testing.
- **Keep demographic answers behind a real access boundary,** in their own table, unreadable by the decision path, with every read logged.
- **Derive HMDA and 1071 rows from the system of record** by a versioned mapping, and run the edits every quarter.
- **Count 1071 coverage yearly** against the 1,000-transaction threshold, and keep MCAs and loans distinct in the data.
- **Record every fair lending test** with method, population, group source, results, threshold and action, keyed to the model and policy version.
- **Version statements as records:** ads, scripts and chatbot replies are where discouragement now lives.
- **Track special purpose programs and enforcement orders** as obligations with versions and milestones.

## References

**Law and regulation**

- [15 U.S.C. 1691](https://www.law.cornell.edu/uscode/text/15/1691), ECOA's prohibited bases
- [42 U.S.C. 3605](https://www.law.cornell.edu/uscode/text/42/3605), the Fair Housing Act's coverage of residential real estate-related transactions and its protected bases
- [15 U.S.C. 1691c-2](https://www.law.cornell.edu/uscode/text/15/1691c-2), Section 1071: the inquiry, separate storage, the underwriter firewall, the data points and reporting
- [12 CFR 1002.5](https://www.law.cornell.edu/cfr/text/12/1002.5), the bar on inquiring about race, color, religion, national origin or sex, and its exceptions
- [12 CFR 1002.13](https://www.law.cornell.edu/cfr/text/12/1002.13), monitoring information for dwelling applications and visual observation or surname
- [12 CFR 1003.2 (Regulation C)](https://www.consumerfinance.gov/rules-policy/regulations/1003/2/), who reports: the 25 and 200 loan thresholds, the 2026 asset threshold, and what an application is
- [12 CFR 1003.3](https://www.law.cornell.edu/cfr/text/12/1003.3), partial exemptions and the CRA condition
- [12 CFR 1003.4](https://www.law.cornell.edu/cfr/text/12/1003.4), the LAR data points and quarterly recording within 30 days
- [12 CFR 1003.5 (Regulation C)](https://www.consumerfinance.gov/rules-policy/regulations/1003/5/), the March 1 filing, quarterly filing at 60,000, retention and the modified LAR notice

**Federal Register**

- [CFPB: Equal Credit Opportunity Act (Regulation B), final rule, 91 FR 21620 (April 22, 2026)](https://www.federalregister.gov/documents/2026/04/22/2026-07804/equal-credit-opportunity-act-regulation-b), the effects test, discouragement and special purpose credit programs, effective July 21, 2026
- [CFPB: Regulation B final rule, full text](https://www.federalregister.gov/documents/full_text/html/2026/04/22/2026-07804.html), the amended 1002.4(b), 1002.6(a), comment 6(a)-2 and 1002.8
- [CFPB: Special Purpose Credit Programs; Rescission, 91 FR 36518 (June 17, 2026)](https://www.federalregister.gov/documents/2026/06/17/2026-12149/equal-credit-opportunity-regulation-b-special-purpose-credit-programs-rescission), the 2020 advisory opinion rescinded
- [Interagency Rescission of the Statement on Special Purpose Credit Programs, 91 FR 54875 (August 25, 2026)](https://www.federalregister.gov/documents/2026/08/25/2026-17307/interagency-rescission-of-the-interagency-statement-on-special-purpose-credit-programs-under-the), the interagency statement withdrawn
- [CFPB: Small Business Lending Under ECOA, final rule, 91 FR 23530 (May 1, 2026)](https://www.federalregister.gov/documents/2026/05/01/2026-08494/small-business-lending-under-the-equal-credit-opportunity-act-regulation-b), the revised Section 1071 rule, effective June 30, 2026
- [CFPB: 1071 Extension of Compliance Dates, 90 FR 25874 (June 18, 2025)](https://www.federalregister.gov/documents/2025/06/18/2025-11244/small-business-lending-under-the-equal-credit-opportunity-act-regulation-b-extension-of-compliance), the first 2025 extension
- [CFPB: 1071 Extension of Compliance Dates, 90 FR 47514 (October 2, 2025)](https://www.federalregister.gov/documents/2025/10/02/2025-19370/small-business-lending-under-the-equal-credit-opportunity-act-regulation-b-extension-of-compliance), the second 2025 extension

**Analysis and litigation**

- [Greenberg Traurig: CFPB final rule revises ECOA framework (May 2026)](https://www.gtlaw.com/en/insights/2026/5/cfpb-final-rule-revises-ecoa-framework-narrows-disparate-impact-and-discouragement-standards), the discouragement exclusions, SPCP standards, the NYDFS letter and New York and Illinois law
- [Mayer Brown: CFPB issues final Section 1071 rule (May 2026)](https://www.mayerbrown.com/en/insights/publications/2026/05/cfpb-issues-final-section-1071-rule-on-small-business-lending-data-collection), compliance date, grace period, thresholds, exclusions and dropped data points
- [Consumer Finance Monitor: Lawsuit challenging CFPB's revised ECOA rule moves forward (August 10, 2026)](https://www.consumerfinancemonitor.com/2026/08/10/lawsuit-challenging-cfpbs-revised-ecoa-rule-moves-forward-under-lengthy-summary-judgment-schedule/), NFHA v. CFPB, its plaintiffs, no preliminary injunction and the summary judgment schedule
- [Consumer Finance Monitor: Trustmark redlining consent order terminated (May 30, 2025)](https://www.consumerfinancemonitor.com/2025/05/30/trustmark-redlining-consent-order-terminated/), the order's subsidy fund, penalty and early termination
- [Consumer Finance Monitor: More early terminations of redlining consent orders (June 17, 2025)](https://www.consumerfinancemonitor.com/2025/06/17/more-early-terminations-of-redlining-consent-orders/), Ameris, Evolve and Patriot terminations and the Townstone denial

**Vendors and filings**

- [FairPlay](https://fairplay.ai/), bias testing, less discriminatory alternatives and fair lending reporting
- [SolasAI](https://www.solas.ai/), disparity testing, alternative generation and model monitoring
- [ValidMind](https://validmind.com/), AI and model risk governance positioned for SR 26-2
- [Upstart Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1647639/000164763926000027/upst-20251231.htm), fairness testing for lending partners
