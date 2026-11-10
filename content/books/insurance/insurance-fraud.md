+++
title = "Fraud & SIU"
description = "Insurance fraud: SIU and fraud plan rules in CA, NY, FL and TX, reporting clocks, fraud bureaus, industry claim databases, analytics, rings and staged crashes."
category = "Insurance Industry"
order = 2735
part = "Claims"
tags = ["insurance", "claims", "fraud", "siu", "special-investigations", "fraud-analytics"]
+++

Insurance fraud is the one claims problem where the law obliges the insurer to look, to staff, to train, to report and to keep paying honest claims on time while it does. Most states require insurers to run a special investigations unit (SIU) or an anti-fraud plan, to refer suspected fraud to a state fraud bureau within a set number of days, to put a fraud warning on claim forms, and to file an annual report on what the unit did. The same states protect reports made in good faith from civil liability and fund fraud bureaus with assessments on insurers. Meanwhile the claim clocks keep running: a suspicion is not a reason to delay a claim unless a specific rule says so, and an SIU referral that sits for a month on a claim that turns out honest is a late claim.

This chapter covers the size of the problem as its advocates measure it, the model act, state SIU and reporting rules in California, New York, Florida and Texas with the reporting clocks compared, fraud bureaus and the industry claim database, detection with rules, models and networks, rings and staged accidents, fraud at application, and how investigations interact with the claim clocks. The general mechanics of scoring, bands and decision records are in [Risk Scoring](/docs/building-blocks/risk-scoring); payments-side fraud is in [Fraud & Risk](/books/payments/fraud-and-risk); marketplace fraud from the platform's side is in [Marketplace Fraud](/books/user-generated-platforms/marketplace-fraud).

## How the Platforms Do It

As of November 2026, from filings, regulator pages and vendor sites (vendor figures are marketing):

| Platform | What it is |
| --- | --- |
| **Verisk claims database** | The industry's shared P&C claims database: "more than 1.9 billion claim records," described as "the world's largest database of P&C claims information used for claims processing and fraud investigations," with insurers and other participants submitting more than 193,000 new claims a day. A submitted claim is matched on name, address, Social Security number, VIN, driver's license number, tax ID and other parties, and returns prior claims by the same people or businesses; analytics add predictive claim scoring, medical provider fraud detection and network analytics for organized fraud. Users include self-insurers, TPAs, "several state fraud bureaus, and many law enforcement agencies" (Verisk 10-K for 2025) |
| **NICB (National Insurance Crime Bureau)** | A member-funded nonprofit, a 501(c)(4) in Oak Brook, Illinois, with $73.3 million of revenue and $71.9 million of expenses in fiscal 2025 per its Form 990 data; it presented to NAIC's Antifraud Technology Working Group in July 2026 |
| **NAIC Online Fraud Reporting System (OFRS)** | The portal consumers and others use to report suspected fraud to state departments; Texas directs consumers to it |
| **Shift Technology** | Fraud and risk detection for claims; says all of the top five US P&C insurers are customers and it has analyzed over 4 billion policies, claims and documents |
| **FRISS** | Fraud and risk scoring "of every quote, renewal and claim in real time," 300+ implementations in 45+ countries; markets a 75% reduction in false positives |

The pattern: an industry-wide **match** (has this person, car, address or provider appeared on other claims), a carrier-side **score** (rules and models over the claim's own facts), **network** links across claims, and an **SIU workflow** that turns a referral into an investigation and, where warranted, a report to the state.

## The Size of It

The figures are advocacy estimates, and I cite them as such. The Coalition Against Insurance Fraud says fraud "steals at least $308.6B every year from American consumers" and appears in about 10% of property-casualty losses; the page doesn't give a study year or method. NAIC's consumer page repeats the $308.6 billion and cites the FBI's estimate that fraud costs a family between $4,000 and $7,000 in increased premiums over ten years. No regulator publishes an audited national figure, which is a reason to measure an insurer's own program by its outputs (referrals, confirmed fraud, savings, reports filed) rather than by a share of a national number.

## The Legal Frame

NAIC's **Insurance Fraud Prevention Model Act (Model 680)**, adopted in 1995 and amended through 2003, replaced earlier models from 1980 and 1983 and sets the pattern most states follow:

- **Mandatory reporting.** "A person engaged in the business of insurance having knowledge or a reasonable belief that a fraudulent insurance act is being, will be or has been committed shall provide to the commissioner the information required by, and in a manner prescribed by, the commissioner"; others may report (Section 6). The model sets no number of days; states do.
- **Immunity.** No civil liability for furnishing information about suspected fraud to the commissioner, law enforcement, the NAIC or anti-fraud organizations, except for statements made with actual malice (Section 7).
- **Warnings.** Claim forms and applications carry a warning that "any person who knowingly presents a false or fraudulent claim for payment of a loss or benefit or knowingly presents false information in an application for insurance is guilty of a crime and may be subject to fines and confinement in prison" (Section 4).
- **A state fraud unit** with investigators (Section 9), and **insurer antifraud initiatives** "reasonably calculated to detect, prosecute and prevent fraudulent insurance acts," which may be fraud investigators (employees or contractors) or an antifraud plan filed with the commissioner; plans are confidential and not public records (Section 11).

By the Coalition's March 2020 count, 42 states and DC have an insurance fraud bureau, 43 states and DC require insurers to report suspected fraud, and 48 states make insurance fraud a specific crime. That data is six years old, so treat the counts as approximate as of November 2026.<!-- source-gap: fraud-state-counts | secondary | counts of states with fraud bureaus, mandatory reporting and specific fraud crimes | closes with: a current NAIC or Coalition state-by-state chart dated 2025 or later | checked: 2026-11-10 -->

## State Requirements

As of November 2026, from each state's statute and regulation:

| | California | New York | Florida | Texas |
| --- | --- | --- | --- | --- |
| **Who** | Every admitted insurer must operate a unit "to investigate possible fraudulent claims" (Ins. Code 1875.20) | Auto, workers' comp and accident and health writers of 3,000 or more policies a year (Ins. Law 409) | Every admitted insurer (Stat. 626.9891) | Every insurer that collects direct written premium must adopt an antifraud plan (Ins. Code 704.051) |
| **SIU** | In-house or contracted; a contract doesn't relieve the insurer of any obligation and can't discourage referrals (10 CCR 2698.33) | A full-time SIU separate from underwriting and claims, in-house or contracted under a detailed plan; investigators need a degree or years of claims, law enforcement or insurance investigation experience (Ins. Law 409) | An anti-fraud investigative unit, in-house or contracted | Plan must describe detection, investigation and reporting procedures (704.052) |
| **Plan** | SIU procedures and written red flags for each line or product (2698.35) | A fraud prevention plan with ten elements, including a rationale for staffing by policies written and claims received; deemed approved if not returned in 120 days (Ins. Law 409, 11 NYCRR 86.6) | An anti-fraud plan including procedures for mandatory reporting | Antifraud plan under subchapter B |
| **Report suspected fraud** | Within 60 days after the insurer's determination, to the Fraud Division, on its form (Ins. Code 1872.4) | Within 30 days after determining the transaction appears fraudulent (Ins. Law 405), on form IFB-1 or the approved electronic system (86.5) | To the Division of Criminal Investigations; the statute sets no number of days (626.989, 626.9891) | In writing to the TDI fraud unit "not later than the 30th day after" the determination, directly or through an anti-fraud organization (701.051) |
| **Training** | Anti-fraud orientation within 90 days of starting for new integral staff; annual training; 5 hours of continuing anti-fraud training a year for SIU staff (2698.39) | Part of the plan | At least 2 hours initially and 1 hour a year | Not specified in the text opened |
| **Annual report** | Within 90 days after the department's notice, sent in June, in 13 categories, certified under penalty of perjury (2698.40) | By March 15 under Ins. Law 409; the regulation says January 15 (86.6) | Fraud data by March 1 | Not in the sections opened |
| **Penalties** | Not in the sections opened | Up to $2,000 a day for plan violations | Up to $2,000 a day | Not in the sections opened |
| **Funding** | An assessment of up to $1 per insured vehicle a year; of 95 cents, 34% to the Fraud Division, 15% to the Highway Patrol and 51% to district attorneys for auto fraud prosecution, plus 5 cents to the Fraud Division (1872.8) | | | |

Statuses: California's SIU regulations were last amended effective October 1, 2020; Florida's sections were last amended by ch. 2025-4; Texas's chapters 701 and 704 took effect April 1, 2005, with 701.051 amended later in 2005; New York's Ins. Law 409 and 405 show 2014 revisions on the Senate site. The New York conflict between the statute's March 15 and the regulation's January 15 annual report date is in the texts as published; my rule is to file by the earlier date.

### Worked Numbers: Reporting Clocks From One Determination

Mine. An insurer's SIU concludes on **Monday, March 1, 2027** that an auto theft claim was probably fraudulent.

| State | Rule | Report due |
| --- | --- | --- |
| New York | Within 30 days after the determination | Wednesday, March 31, 2027 |
| Texas | Not later than the 30th day after the determination | Wednesday, March 31, 2027 |
| California | Within 60 days after the determination | Friday, April 30, 2027 |
| Florida | Mandatory reporting under the plan; no statutory day count | Per the insurer's plan; I default to the shortest of the others, 30 days |

The trigger is the same word in three states ("determination"), and it is the SIU's conclusion, not the first red flag, so the system has to record when the determination was made and by whom. California's regulation requires the referral to say whether the investigation is complete (2698.37(d)), so an early report of an open investigation is lawful and is often the safer choice.

## Fraud Bureaus and the Industry Database

State fraud bureaus are law enforcement agencies inside or beside the insurance department. California's Fraud Division, established in 1979, has more than 266 staff in headquarters and nine regional offices and programs for auto, workers' compensation, property and life, and disability and health care fraud, funded by insurer assessments rather than the general fund. Texas's insurance fraud unit exists "to enforce laws relating to fraudulent insurance acts" (Ins. Code 701.101). Florida's reports go to the Division of Criminal Investigations; reporters there are immune from civil liability "in the absence of fraud or bad faith" (626.989(4)(c)).

The industry database is the other half. Insurers report claims to Verisk's database, which matches each new claim on identity fields and returns the prior claims of the same people, vehicles and businesses, so an adjuster sees that this claimant had three soft-tissue claims in two years with the same clinic. Verisk also notes its database helps insurers meet state and federal reporting checks such as delinquent child support liens. The rule for the system is the record-linkage one: the match report is evidence for a person to weigh, with its match quality, never an automatic denial ([Probabilistic Linkage](/docs/building-blocks/record-linkage#probabilistic-linkage)).

## Detection

California's regulation describes the structure most programs share. "Integral anti-fraud personnel" (adjusters, underwriters, intake staff) are responsible for identifying suspected fraud; the SIU keeps written **red flags** "specific to each line of insurance, or each insurance product" (2698.35); a referral is **credible** if it has at least one red flag, and the SIU "shall investigate each credible referral" with file analysis, interviews, industry database checks, evidence preservation and a written summary (2698.36). The regulation defines a reasonable belief of fraud as objective justification based on articulable facts (2698.30).

Automation sits on top: rules for known red flags (a policy bound days before the loss, a theft of a car with a large loan balance, a claimant represented within hours), predictive models over claim features, and network analytics that link claims sharing phone numbers, addresses, vehicles, providers or attorneys. Three governance rules from the playbook apply with insurance weight:

- **A score routes; a person decides.** A referral, a recorded statement or an examination under oath can follow a score; a denial needs facts in the file that a market conduct examiner and a court will accept ([Scores, Bands and the Human Middle](/docs/building-blocks/risk-scoring#scores-bands-and-the-human-middle)).
- **Labels arrive late.** Confirmed fraud is known months after the claim, if ever, and most honest claims are never labeled honest ([Labels Arrive Late](/docs/building-blocks/risk-scoring#labels-arrive-late)).
- **Models are AI systems under the regulators' rules.** A claims fraud model is within the NAIC AI bulletin's scope where adopted, and within Colorado's and New York's rules on external data and unfair discrimination (Data, AI & Privacy Rules). FRISS's and Shift's marketing about false positives is the regulators' concern from the other side: every false positive is an honest claimant delayed.

## Rings and Staged Accidents

Organized fraud is where the network matters. California's department publishes cases from its auto fraud task forces: four friends who "deliberately crashed their vehicles into one another" in Upland in June 2025 and then sought treatment to inflate injury claims (an estimated $36,000 loss, charged in May 2026); a second car that intentionally hit a rideshare vehicle on I-215 so its riders could file bodily injury claims against the driver's insurer (four pleaded no contest, November 2025); and a person in a bear costume who "attacked" luxury cars for a total loss to insurers of $141,839 (April 2026). Florida's criminal statute grades the offense: organizing, planning or participating in a staged crash is a second-degree felony with a civil penalty of $15,000 to $50,000 and a minimum of 2 years' imprisonment, soliciting with intent to defraud is a second-degree felony, and general insurance fraud is graded by value, third degree under $20,000, second degree from $20,000 to $99,999 and first degree at $100,000 or more (Fla. Stat. 817.234).

Rings show up as shared entities across claims that look independent one at a time: the same clinic, the same lawyer, the same tow company, the same phone number on different claimants, the same vehicle in several losses. Detecting them needs the claims of many insurers (the industry database and NICB) and the parties on each claim modeled as linked entities, not free text.

## Fraud at Application

Verisk describes its customers' need to "fight insurance fraud -- both in claims and at policy inception." Application fraud in personal lines is mostly **rate evasion**: a garaging address in a cheaper territory, an undisclosed household driver, a business use described as personal, prior losses not disclosed. It is detected at quote with the same data that rates the policy (prefill, MVRs, loss history; Consumer Reports & Third-Party Data) and at claim, when the loss reveals the real garaging address or driver. What the insurer may do then, rescind, reform the premium, or deny, is a matter of each state's misrepresentation law and the policy, and it is also a coverage position with its own notice deadlines ([First Notice, Coverage & Triage](/books/insurance/first-notice-and-triage#coverage-positions-reservations-of-rights-and-denials)). Model 680's warning covers "false information in an application" as well as false claims.

## Investigations and the Claim Clocks

An SIU referral doesn't stop the clock unless a rule says it does, and the rules that do are narrow:

- **NAIC Model 902** relieves the insurer of the 21-day decision and 45-day letters only where "there is a reasonable basis supported by specific information available for review by the insurance regulatory authority" that the claimant fraudulently caused or contributed to the loss.
- **California** extends the 40-day decision to 80 days on a documented, reasonable suspicion of fraud, and its delay notices need not disclose information that could compromise the investigation (10 CCR 2695.7(c)(2), (k)).
- **Texas** gives 30 days instead of 15 business days when the insurer has a reasonable basis to believe the loss resulted from arson (Ins. Code 542.056(b)).
- **Florida** treats the policyholder's fraud, lack of cooperation or intentional misrepresentation as a factor beyond the insurer's control (627.70131(5)(a)).

So the SIU's work runs in parallel: the adjuster keeps the claim on its clocks, the SIU documents the specific information that would justify an extension, and the extension, if taken, is an event with that documentation attached ([Catastrophe Extensions and Tolling](/books/insurance/claim-handling-law#catastrophe-extensions-and-tolling)). The fraud warning on the claim form is also a rule with state text: New York's carries a civil penalty "not to exceed five thousand dollars" plus the claim's value and goes immediately above the signature (11 NYCRR 86.4), and Texas requires a warning in comparative prominence on claim forms (Ins. Code 704.002).

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `claims`, `exposures`, `parties` and `claim_tasks`. This chapter adds `fraud_referrals`, `siu_investigations` and `fraud_reports`.

```sql
CREATE TABLE fraud_referrals (             -- a red flag or score that reached the SIU
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id           UUID REFERENCES claims (id),
  submission_id      UUID,                  -- application fraud, when at quote
  source             TEXT NOT NULL CHECK (source IN ('adjuster', 'underwriter', 'rule',
                       'model', 'industry_match', 'network', 'tip', 'law_enforcement')),
  red_flags          TEXT[] NOT NULL,       -- codes from the line's written red flag list
  model_version_id   UUID,                  -- model_versions (Data, AI & Privacy Rules)
  score              NUMERIC,
  credible           BOOLEAN NOT NULL,      -- at least one red flag (10 CCR 2698.36)
  referred_by        UUID NOT NULL,
  referred_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  disposition        TEXT CHECK (disposition IN ('accepted', 'declined', 'merged'))
);

CREATE TABLE siu_investigations (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  referral_id        UUID NOT NULL REFERENCES fraud_referrals (id),
  investigator_id    UUID NOT NULL,         -- employee or contracted SIU
  contracted_vendor  TEXT,
  steps              JSONB NOT NULL DEFAULT '[]',  -- interviews, EUO, database checks,
                                                   -- evidence preserved, each dated
  linked_claim_ids   UUID[] NOT NULL DEFAULT '{}', -- network or ring links
  determination      TEXT CHECK (determination IN ('suspected_fraud', 'no_fraud',
                       'insufficient_evidence')),
  determined_at      TIMESTAMPTZ,           -- starts the reporting clocks
  determined_by      UUID,
  summary_document_id UUID,                 -- the written summary
  savings_amount     BIGINT,                -- for the annual report
  closed_at          TIMESTAMPTZ
);

CREATE TABLE fraud_reports (               -- each report to a state, and its clock
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  investigation_id   UUID NOT NULL REFERENCES siu_investigations (id),
  state              TEXT NOT NULL,
  agency             TEXT NOT NULL,         -- 'CDI Fraud Division', 'NY DFS IFB', 'TDI', ...
  rule_ref           TEXT NOT NULL,         -- 'Cal. Ins. Code 1872.4', 'N.Y. Ins. Law 405'
  due_at             TIMESTAMPTZ NOT NULL,  -- from determined_at
  form               TEXT,                  -- 'IFB-1', department form, portal
  investigation_complete BOOLEAN NOT NULL,  -- CA 2698.37(d)
  submitted_at       TIMESTAMPTZ,
  confirmation_ref   TEXT,
  via_organization   TEXT                   -- TX: through an anti-fraud organization
);
```

Design choices:

- **The SIU lives beside the claim, not inside it.** Investigation notes are restricted to the SIU and counsel; the claim shows that a referral exists and what the adjuster must do, not the evidence, because delay notices mustn't tip off a suspect and because access is logged ([Log Access, Not Just Changes](/docs/building-blocks/audit-trails#log-access-not-just-changes)).
- **The determination is the dated event that creates the reports,** one per state whose rule applies (the loss state, and sometimes the insured's state).
- **Red flag lists are versioned per line and product,** as California requires them written, and referrals cite the codes.
- **Annual reports are queries** over referrals, investigations, determinations, savings and reports by state and year.

## Auditing

- **Every referral** with its source, red flags, model version and score, credibility and disposition.
- **Every investigation** with its steps, investigator (employee or contractor), determination, its date and its summary.
- **Every state report** with the rule, due date, submission time and confirmation, and late reports as exceptions.
- **Training records** by person against each state's hours (California's 90-day orientation and 5 annual hours, Florida's 2 and 1).
- **Claim clock extensions taken for fraud** with the documented basis, and claims that were referred but paid on time anyway.

## What This Means for the System You Build

- **Capture red flags as coded data** from versioned per-line lists, from people and from rules.
- **Run scores and matches as referrals for people to investigate,** never as denials, and govern the models as AI systems.
- **Start state reporting clocks from the SIU's dated determination,** per state: 30 days in New York and Texas, 60 in California.
- **Keep the claim on its clocks during investigation,** and take a fraud extension only with documented specific information.
- **Separate SIU records from the claim file** with logged access.
- **Model parties and their links across claims** so rings are visible.
- **Produce annual SIU reports and training records** from the data, by state.

## References

**Law and regulation**

- [Cal. Ins. Code 1872.4 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-1872-4/), reports to the Fraud Division within 60 days after the insurer's determination
- [Cal. Ins. Code 1872.8 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-1872-8/), the vehicle assessment and its split
- [Cal. Ins. Code 1875.20 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-1875-20/), the continuous SIU requirement for admitted insurers
- [10 CCR 2698.30](https://www.law.cornell.edu/regulations/california/10-CCR-2698.30), [2698.33](https://www.law.cornell.edu/regulations/california/10-CCR-2698.33), [2698.35](https://www.law.cornell.edu/regulations/california/10-CCR-2698.35), [2698.36](https://www.law.cornell.edu/regulations/california/10-CCR-2698.36), [2698.37](https://www.law.cornell.edu/regulations/california/10-CCR-2698.37), [2698.39](https://www.law.cornell.edu/regulations/california/10-CCR-2698.39) and [2698.40](https://www.law.cornell.edu/regulations/california/10-CCR-2698.40), California's SIU regulations: definitions, contracted SIUs, red flags, credible referrals and investigation steps, referral contents, training hours and the annual report, amended effective October 1, 2020
- [N.Y. Ins. Law 409](https://www.nysenate.gov/legislation/laws/ISC/409), fraud prevention plans and SIUs for writers of 3,000 or more policies, investigator qualifications, approval, penalties and the annual report
- [N.Y. Ins. Law 405](https://www.nysenate.gov/legislation/laws/ISC/405), reports within 30 days after determination
- [11 NYCRR 86.4](https://www.law.cornell.edu/regulations/new-york/11-NYCRR-86.4), [86.5](https://www.law.cornell.edu/regulations/new-york/11-NYCRR-86.5) and [86.6](https://www.law.cornell.edu/regulations/new-york/11-NYCRR-86.6), Regulation 95: the warning statement, form IFB-1 and plan contents and annual report
- [Fla. Stat. 626.9891](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0626/Sections/0626.9891.html), anti-fraud units and plans, reporting to the Division of Criminal Investigations, training hours, annual data and penalties; last amended by ch. 2025-4
- [Fla. Stat. 626.989](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0626/Sections/0626.989.html), the reporting duty and immunity absent fraud or bad faith
- [Fla. Stat. 817.234](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0800-0899/0817/Sections/0817.234.html), staged crashes, solicitation and value-graded insurance fraud penalties
- [Tex. Ins. Code 701.051](https://texas.public.law/statutes/tex._ins._code_section_701.051) and [701.101](https://texas.public.law/statutes/tex._ins._code_section_701.101), reports within 30 days and the fraud unit's purpose
- [Tex. Ins. Code 704.051](https://texas.public.law/statutes/tex._ins._code_section_704.051), [704.052](https://texas.public.law/statutes/tex._ins._code_section_704.052) and [704.002](https://texas.public.law/statutes/tex._ins._code_section_704.002), antifraud plans, their contents and the claim form warning

**NAIC**

- [NAIC: Insurance Fraud Prevention Model Act (#680) (PDF)](https://content.naic.org/sites/default/files/model-law-680.pdf), mandatory reporting, immunity, warnings, the fraud unit and insurer antifraud initiatives, and the model's history
- [NAIC: Insurance fraud](https://content.naic.org/insurance-topics/insurance-fraud), the $308.6 billion figure, the FBI premium estimate, fraud bureau counts and OFRS

**Regulators and guidance**

- [California Department of Insurance: Fraud Division overview](https://www.insurance.ca.gov/0300-fraud/0100-fraud-division-overview/), staff, offices, programs, founding and funding
- [California Department of Insurance: release of May 27, 2026](https://www.insurance.ca.gov/0400-news/0100-press-releases/2026/release020-2026.cfm), the Upland staged collision case
- [California Department of Insurance: release of November 21, 2025](https://www.insurance.ca.gov/0400-news/0100-press-releases/2025/release076-2025.cfm), the I-215 rideshare staged collision case
- [California Department of Insurance: release of April 16, 2026](https://www.insurance.ca.gov/0400-news/0100-press-releases/2026/release017-2026.cfm), the costume vandalism case and its $141,839 loss
- [Texas Department of Insurance: Fraud](https://www.tdi.texas.gov/fraud/index.html), industry reporting and consumer reports through OFRS

**Filings**

- [Verisk: 2025 Annual Report and Form 10-K (PDF)](https://www.sec.gov/Archives/edgar/data/1442145/000119312526141402/d859327dars.pdf), the claims database's size, daily submissions, match fields, analytics, users and fraud at policy inception
- [ProPublica Nonprofit Explorer: National Insurance Crime Bureau](https://projects.propublica.org/nonprofits/organizations/363776789), NICB's tax status, location and fiscal 2025 revenue and expenses

**In practice**

- [Coalition Against Insurance Fraud: Fraud stats](https://insurancefraud.org/fraud-stats/), the $308.6 billion and 10% estimates and the March 2020 state counts
- [Shift Technology](https://www.shift-technology.com/), customers and volumes analyzed
- [FRISS](https://www.friss.com/), real-time scoring, implementations and false positive claims
