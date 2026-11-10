+++
title = "Benefits Administration Platforms"
nav_title = "Benefits Platforms"
description = "Benefitfocus, Businessolver, Employee Navigator, Ease, Selerix and HCM suites, brokers, carrier APIs, plans, rates and eligibility as data, and payroll."
category = "Workforce Industry"
order = 2651
part = "Benefits Administration"
tags = ["benefits", "benefits-administration", "brokers", "carriers", "eligibility", "vendors"]
+++

A benefits administration platform is the system of record for who is eligible for what, what it costs, who chose what and from when. It holds the employer's plans for the year and their rates, the rules that decide eligibility by class, hours and waiting period, the enrollment experience with decision support, the life events that reopen it, and the outputs every other party depends on: carrier files or API calls, deductions and employer contributions for payroll, the monthly facts for ACA reporting, and the qualifying events for COBRA. It sits between an employer's HRIS and payroll on one side and dozens of carriers on the other, and it is usually sold through the employer's insurance broker.

The market splits along that channel. Enterprise platforms sell to large employers and health plans directly; broker-distributed platforms give brokers a tool to run their small and mid-size clients' enrollments; HCM suites build benefits into the payroll record; and connection networks sell the carrier link to all of them. This chapter covers the vendor landscape as public sources describe it, brokers as a channel, carrier APIs, the data model of plans, rates and eligibility rules, decision support, the annual renewal cycle, and integration with payroll. The rules each module enforces are in the rest of this part: Enrollment & Life Events, Carrier Connections & the 834, The ACA Employer Mandate & 1095-C, COBRA & State Continuation, 401(k) Deferrals & Remittance, and HSAs, FSAs & HRAs.

## How the Platforms Do It

The landscape, from vendors' own pages and filings, as of November 2026:

| Vendor | Position | What it publishes | Channel |
| --- | --- | --- | --- |
| **Benefitfocus (Voya)** | Enterprise benefits administration, "open-architecture and product-agnostic, enrolling and administering benefits from a variety of third-party carriers" | Voya completed the acquisition on January 24, 2023, "for a total purchase consideration of $595 million"; its Benefitplace platform had about 12.2 million employees at December 31, 2025, reported in Voya's Employee Benefits segment | Employers and health plans |
| **Businessolver** | Its Benefitsolver platform, with the company describing "benefits administration, employee guidance, compliance, communications, and reporting together" in one place | No counts on its public page when I checked | Employers |
| **Employee Navigator** | Broker-distributed benefits administration | "connects 195,000+ employers, 7,000+ brokers, and 600+ partners" | Brokers |
| **Ease** | Small group benefits administration for brokers; "Ease is now owned by Employee Navigator!" (Employee Navigator's press page dates the acquisition announcement April 4, 2023) | "2,300+ agencies," "85,000+ employer groups," "3.4 million+ employees" | Brokers |
| **Selerix** | Benefits administration and enrollment | "14 m Employees Enrolled," "1000 + Integrations," "26 k+ Companies Served," "19 b In Premium" | Brokers ("Partner with Selerix to offer your clients a better way to manage benefits") |
| **PlanSource** | Benefits administration | No counts or ownership on its public page | Employers and brokers |
| **HCM suites (ADP, Paycom, Rippling and others)** | Benefits inside payroll and HR | ADP: "Automatic payroll deductions and carrier integrations"; Paycom: Benefits to Carrier; Rippling: "our in-house brokerage, or your third-party broker" | Direct, with the suite |
| **Noyo** | Carrier connection network, "the leading benefits data platform" | API to carriers, EDI feeds where carriers need files | Sold to benefits platforms |
| **Jellyvision (ALEX)** | Decision support that "Helps employees understand and make confident choices about their benefits" | "Thousands of companies trust ALEX" | Employers and platforms |

bswift, also a long-standing enterprise platform, blocked automated access to its site. Francisco Partners announced on October 3, 2022 that it had signed a definitive agreement to acquire bswift from CVS Health, expected to close in the fourth quarter of 2022; I couldn't open a source confirming the close or bswift's current ownership and scale. <!-- source-gap: wf-bswift | status | bswift's current ownership (the 2022 Francisco Partners agreement's close) and scale | closes with: bswift's own about page or a Francisco Partners or CVS Health filing or release confirming the close, opened | checked: 2026-11-10 --> The counts above are the vendors' own marketing figures, measured differently (employers connected, groups, employees enrolled, lives), and aren't comparable to each other.

The pattern: **every platform is a rules engine over the same few records** (plans and rates for a year, eligibility rules, enrollments with effective dates, life events) **with three outputs** (carriers, payroll, compliance). The differences are the channel, the depth of each module, and how many carrier and payroll connections they maintain.

## Brokers as a Channel

Most small and mid-size employers buy group insurance through a broker, who shops carriers at renewal, recommends plans and contributions, and services the account. The broker-distributed platforms are built for that relationship: the broker licenses the software and sets up each client employer's plans in it, so a broker can run open enrollment for hundreds of groups from one system, which is how Employee Navigator reaches 195,000 employers through 7,000 brokers and Ease 85,000 groups through 2,300 agencies. HCM suites approach it from the other side: Rippling offers its own brokerage or works with the employer's broker. For a platform builder, the channel decides the tenancy model: a broker is a tenant with many employer sub-tenants, permissions per client, and a book of business that moves with the broker if the broker changes platforms or the employer changes brokers.

Broker compensation (carrier commissions and fees) shapes which carriers a broker places, but its terms aren't in the platforms' public documentation, so I leave it out of the model except as the broker of record per employer and line of coverage.

## Carrier APIs

A platform with thousands of employers on hundreds of carriers maintains thousands of file connections, each tested over weeks (Carrier Connections & the 834 covers the stages). Connection networks exist to collapse that: Noyo's pitch is "One integration; many carriers," with carrier APIs where they exist, EDI feeds generated for carriers that "require EDI file transmissions," and file testing that "typically takes up to 6 weeks with a responsive carrier." Benefitfocus describes itself as product-agnostic across "a variety of third-party carriers." The buy-or-build question for a platform is the same as for payroll tax filing: the network's breadth against one more dependency on the critical path of open enrollment.

## The Data Model: Plans, Rates and Eligibility

The platform's core is configuration, effective-dated by plan year, and most of an implementation is entering it correctly.

**Plans.** Each plan year has plans by line of coverage (medical, dental, vision, life, disability, accident, critical illness, spending accounts, retirement), each with options (an HMO and a PPO, a base and a buy-up), tiers, the carrier and group identifiers, and the cafeteria plan treatment.

**Rate tables.** Carriers price differently by line, and the rate table has to hold all of them:

| Rate basis | Used for | Worked with my own numbers |
| --- | --- | --- |
| **Composite tier rates** | Large group medical, dental, vision | Employee only $700.00, family $1,900.00 a month |
| **Per-member age rating** | Individual and small group medical under the ACA: ages 21 and over may vary at most 3:1, tobacco at most 1.5:1, and family premiums sum per member, where "the premiums for no more than the three oldest covered children must be taken into account" for children under 21 (45 CFR 147.102) | An employee 45 ($600.00), spouse 43 ($560.00) and four children at $300.00 each: $600.00 + $560.00 + 3 × $300.00 = $2,060.00 a month; the fourth child is free |
| **Average enrollee premium** | Small groups that bill a composite from per-member rates; it "does not vary during the plan year" | The group's total per-member premium divided by enrollees, applied as a flat rate |
| **Per $1,000 of volume, by age band** | Supplemental life | $0.20 per $1,000 a month at ages 40 to 44: $150,000 costs $30.00 |
| **Per $100 of covered payroll** | Long-term disability | $0.40 per $100 of a $6,000.00 monthly salary: $24.00 a month |
| **Flat per enrollee** | Accident, hospital indemnity, some voluntary products | $12.00 a month per covered person |

The age-rated plan is where systems go wrong: the rate depends on each covered person's age on a date the carrier defines (often the plan year start), the tobacco status each attests to, and the count of children, so a birth, a birthday at renewal or a tobacco attestation changes the premium. The rate table is the carrier's; the employer's contribution strategy turns it into what employees pay ([Coverage Tiers and Rates](/books/workforce/enrollment-and-life-events#coverage-tiers-and-rates)).

**Eligibility rules.** Who may enroll in what is a rule per plan and class: employment type (full-time, part-time, seasonal), hours (30 a week for medical is common, and the ACA's measurement results feed it for large employers), classes (salaried, hourly, executive, union, location or rating area), the waiting period (bounded by the 90-day limit), dependents (children to 26 for medical by law, other ages for life), and rehire rules. Rules are evaluated on events (hire, transfer, hours change, measurement result) and produce eligibility with effective dates, which opens enrollment windows and, when eligibility ends, COBRA events.

**Enrollment configuration.** Guaranteed issue limits and EOI rules for life and disability, default elections, waivable plans, dependent verification requirements, and what each life event may change.

## Decision Support

Decision support helps employees choose: plan comparisons, total cost estimates (premium plus expected out-of-pocket for a usage profile), HSA eligibility and employer money, and explanations in plain language. Jellyvision's ALEX "Helps employees understand and make confident choices about their benefits," and enterprise platforms bundle "employee guidance" (Businessolver's term). For the system, decision support reads the same plan, rate and eligibility data, so the numbers it shows must come from the same rows the enrollment saves; a recommendation priced from a stale rate table is a support ticket in January and a payroll correction in February.

## The Annual Cycle

The platform's year runs on the plan year, and every module has a date in it. For a calendar plan year (the dates are practice, and each employer's differ):

| When | What | Outputs |
| --- | --- | --- |
| Summer to early fall | Carrier renewals; the broker markets the plans; the employer decides plans and contributions | New plan year: plans, rate tables, contribution strategy, eligibility rules |
| Before open enrollment | Configuration and testing; QSEHRA and ICHRA notices at least 90 days before the year; safe harbor 401(k) notices 30 to 90 days before | Notices as documents with dates |
| Open enrollment (often two to four weeks in October or November) | Elections, EOI requests, dependent verification | Pending enrollments for January 1 |
| December | Carrier files or API calls for the new year; payroll deduction changes for the first January check | Carrier acknowledgments, deduction elections effective January 1 |
| January | First payroll with new deductions; corrections; invoice reconciliation for January | Arrears and catch-ups, the first reconciliation |
| By March 2 (for 2025 forms) | 1095-C to employees; 1094-C and 1095-C to the IRS by March 31 if electronic | Filings |

The cycle's lesson for engineering is that a plan year is a version of everything: plans, rates, rules, contribution strategy, notices. Next year's configuration is built and tested while this year's is live, and both are read by the engine depending on the effective date ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).

## Integration With Payroll

The platform and the payroll exchange two things, in opposite directions:

- **To payroll: deductions and contributions.** Per employee and plan: the employee cost per pay period, pre-tax or after-tax by type, start and stop dates, retro adjustments and arrears instructions, and the employer contribution as a memo amount. Payroll applies them by its own period rule ([From Election to Deduction](/books/workforce/enrollment-and-life-events#from-election-to-deduction)). Embedded payroll APIs show the receiving end: Check's typed benefits (`125_medical`, `hsa`, `fsa_medical` and others) fed by partners such as Benbase and SimplyInsured, and Gusto Embedded's effective-dated employee benefits.
- **From payroll: census.** Hire and termination dates, employment type, hours (for eligibility and ACA measurement), salary (for life and disability volumes and salary-based rates), and pay frequency. Unified HR APIs exist largely to carry this ([Who Reads Payroll Data, and Why](/books/workforce/unified-hr-apis#who-reads-payroll-data-and-why)).

The timing problem is the pay period close: a deduction change has to reach payroll before the run calculates, and a change made after it either waits a period (and becomes a catch-up) or forces a recalculation. The platform should know each employer's payroll calendar and say, at the moment of election, which check the change will hit. The reconciliation problem is that three copies (the platform's enrollment, payroll's deductions, the carrier's bill) must agree per employee and month, which is the reconciliation in Carrier Connections & the 834.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `benefit_plans` and `benefit_enrollments` exist; Enrollment & Life Events added `benefit_rates` (what a tier costs and who pays); this chapter adds the carrier's rate structure behind it, eligibility rules and the broker relationship.

```sql
CREATE TABLE plan_rate_tables (            -- the carrier's rates for a plan and plan year
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  benefit_plan_id     UUID NOT NULL REFERENCES benefit_plans (id),
  rate_basis          TEXT NOT NULL CHECK (rate_basis IN ('composite_tier', 'per_member_age',
                        'average_enrollee', 'per_1000_volume_age', 'per_100_covered_payroll',
                        'flat_per_enrollee')),
  age_determined_on   TEXT,                  -- 'plan_year_start', 'birthday', ...
  max_children_rated  SMALLINT,              -- 3 under the ACA's per-member rule
  rates               JSONB NOT NULL,        -- tier, age band, tobacco -> cents (or cents per unit)
  rating_area         TEXT,                  -- small group: the group's principal business address
  source_document_id  UUID REFERENCES documents (id),   -- the carrier's renewal
  valid_during        DATERANGE NOT NULL,    -- the plan year; fixed for an average enrollee premium
  EXCLUDE USING GIST (benefit_plan_id WITH =, valid_during WITH &&)
);

ALTER TABLE benefit_rates
  ADD FOREIGN KEY (source_rate_table_id) REFERENCES plan_rate_tables (id);

CREATE TABLE eligibility_rules (           -- who may enroll in a plan, and from when
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  benefit_plan_id     UUID NOT NULL REFERENCES benefit_plans (id),
  eligibility_class   TEXT NOT NULL,         -- 'full_time_salaried', 'hourly', 'union_local_12', ...
  employment_types    TEXT[] NOT NULL,       -- from employments.employment_type
  min_weekly_hours    NUMERIC(5, 2),         -- or the ACA measurement result, by flag
  use_aca_status      BOOLEAN NOT NULL DEFAULT FALSE,   -- eligible when aca_status_results says full-time
  work_location_ids   UUID[],                -- null: all locations
  waiting_period_rule TEXT NOT NULL,         -- 'first_of_month_after_60_days'; checked against 90 days
  dependent_rules     JSONB NOT NULL,        -- relationships allowed and age limits (26 for medical)
  rehire_rule         TEXT,                  -- 'reinstate_within_13_weeks', 'new_hire', ...
  rule_ref            TEXT,                  -- the plan document section
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE broker_assignments (          -- the broker of record, per employer and line
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  broker_agency       TEXT NOT NULL,
  agent_ref           TEXT,                  -- the producer, by license reference
  lines_of_coverage   TEXT[] NOT NULL,       -- 'medical', 'dental', 'life', ...
  platform_tenant_ref TEXT,                  -- the broker's tenant on a broker-distributed platform
  letter_document_id  UUID REFERENCES documents (id),   -- broker of record letter
  permissions         JSONB NOT NULL,        -- what the broker may see and change
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (employer_id WITH =, broker_agency WITH =, valid_during WITH &&)
);
```

Eligibility is evaluated on events, not on a schedule; a sketch of the rule check for one worker as of a date:

```sql
SELECT er.benefit_plan_id, er.eligibility_class
FROM eligibility_rules er
JOIN employments e ON e.worker_id = $worker_id AND e.termination_date IS NULL
JOIN job_assignments ja ON ja.employment_id = e.id AND ja.valid_during @> $as_of::DATE
WHERE er.valid_during @> $as_of::DATE
  AND e.employment_type = ANY(er.employment_types)
  AND (er.work_location_ids IS NULL OR ja.work_location_id = ANY(er.work_location_ids))
  AND (NOT er.use_aca_status OR EXISTS (
        SELECT 1 FROM aca_status_results r
        WHERE r.worker_id = $worker_id AND r.month = date_trunc('month', $as_of::DATE)::DATE
          AND r.full_time))
  AND (er.min_weekly_hours IS NULL OR ja.standard_hours >= er.min_weekly_hours);
```

Design notes:

- **A plan year is a version of the whole configuration:** plans, rate tables, eligibility rules, contribution strategy, broker assignments. Next year is built beside this one with its own `valid_during`, never by editing this year's rows ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Rates are the carrier's, contributions the employer's.** `plan_rate_tables` holds what the renewal says; `benefit_rates` holds what each tier costs the employee and employer; an enrollment points at the `benefit_rates` row it used, so a mid-year rate question has one answer.
- **Eligibility is event-driven,** recomputed on hire, transfer, hours changes, ACA measurement results and birthdays (a child turning 26), and its output is a window or a COBRA event, never a silent drop.
- **Tenancy follows the channel.** A broker is a tenant over many employers with per-employer permissions and a broker of record per line; an employer moving brokers moves an assignment, not data.
- **One change event fans out.** An enrollment change emits one event that the carrier connection, payroll deductions, the ACA monthly record and COBRA all consume ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).
- **Map, don't duplicate, the payer.** A plan here is the employer's view of a carrier's product; Health Tech's [plan design](/books/health-tech/payers-and-plans#plan-design) is the payer's view of the same plan, with benefits and networks the employer platform only describes.

## Auditing

A benefits platform's records are what an employer, broker, carrier or regulator reconstructs when coverage, cost or a notice is disputed:

- **Configuration by plan year:** plans, rate tables with their renewal documents, eligibility rules, contribution strategy, each versioned with who entered and approved it.
- **Every eligibility determination** with the facts it read, and every window it opened.
- **Every election** with the screens and costs shown (decision support output included) and the confirmation given.
- **Every output** (carrier file or call, payroll deduction, ACA record, COBRA event) tied to the enrollment change that caused it.
- **Broker access:** who at which agency saw or changed which employer's data. Mechanics in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Model the plan year as a version** of plans, rates, rules and contributions, built beside the live year.
- **Hold the carrier's rate structure as it is priced:** composite, per-member age with the three-children rule, average enrollee, per $1,000, per $100 of payroll, flat.
- **Separate the carrier's rate from the employer's contribution,** and point every enrollment at the cost it used.
- **Evaluate eligibility on events** and turn the result into windows and COBRA events.
- **Design tenancy for brokers** if the channel is brokers: many employers per broker, permissions per employer, a broker of record per line.
- **Tell the employee which check a change hits,** from the employer's payroll calendar.
- **Fan one enrollment change out to carriers, payroll, ACA and COBRA,** and reconcile the copies monthly.

## References

**Law and regulation**

- [45 CFR 147.102](https://www.law.cornell.edu/cfr/text/45/147.102), rating factors, per-member family rating with the three-oldest-children rule, rating areas and the average enrollee premium option

**Filings**

- [Voya Financial: Form 10-K for 2023](https://www.sec.gov/Archives/edgar/data/1535929/000153592924000035/voya-20231231.htm), completion of the Benefitfocus acquisition on January 24, 2023 for $595 million
- [Voya Financial: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1535929/000153592926000043/voya-20251231.htm), Benefitfocus and Benefitplace in the Employee Benefits segment, open architecture, about 12.2 million employees at December 31, 2025

**Vendor documentation**

- [Benefitfocus](https://www.benefitfocus.com/), a Voya business
- [Businessolver](https://www.businessolver.com/), Benefitsolver and the scope Businessolver describes
- [Employee Navigator: Press](https://www.employeenavigator.com/press), the April 4, 2023 announcement of the Ease acquisition
- [Francisco Partners: Francisco Partners to Acquire bswift from CVS Health (October 3, 2022)](https://www.franciscopartners.com/media/francisco-partners-to-acquire-bswift-from-cvs-health), the definitive agreement and expected close
- [Employee Navigator](https://www.employeenavigator.com/), employers, brokers and partners connected
- [Ease: About](https://www.ease.com/about/), ownership by Employee Navigator, agencies, employer groups and employees
- [Selerix](https://www.selerix.com/), employees enrolled, integrations, companies and premium, and the broker partnership
- [PlanSource](https://www.plansource.com/), benefits administration
- [Jellyvision](https://www.jellyvision.com/), ALEX decision support
- [Noyo](https://noyo.com/), the benefits data platform and its integration claims
- [Noyo: Request a group connection](https://docs.noyo.com/docs/groups/connections/request-a-group-connection.md), connection tiers and carrier testing time
- [Noyo: Feeds and feed runs](https://docs.noyo.com/docs/members/snapshot-workflow/feeds-feed-runs.md), EDI feeds for carriers that require files
- [ADP: Benefits](https://www.adp.com/what-we-offer/benefits.aspx), payroll deductions and carrier integrations
- [Paycom: Benefits administration](https://www.paycom.com/software/benefits-administration/), Benefits to Carrier
- [Rippling: Benefits](https://www.rippling.com/benefits), in-house brokerage or a third-party broker
- [Check: documentation index](https://docs.checkhq.com/llms.txt), benefit integration partners
- [Check: Types of benefits](https://docs.checkhq.com/reference/types-of-benefits.md), typed benefits received by payroll
- [Gusto Embedded: Benefit effective dating](https://docs.gusto.com/embedded-payroll/docs/benefit-effective-dating.md), effective-dated employee benefits
