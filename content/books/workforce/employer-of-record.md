+++
title = "Employer of Record & Global Employment"
nav_title = "Employer of Record"
description = "EOR mechanics, owned entities and partners, contractor of record, permanent establishment risk, terminations abroad, pricing and when to open an entity."
category = "Workforce Industry"
order = 2654
part = "Contractors and Global"
tags = ["employer-of-record", "global-employment", "permanent-establishment", "eor", "contractors", "international"]
+++

A company that wants to hire one engineer in Portugal has three choices: open a Portuguese subsidiary, register for payroll taxes and social security, find a local payroll provider and accountant, and learn Portuguese employment law; engage the engineer as a contractor and accept the classification risk; or pay an employer of record (EOR) to employ the engineer for it. The EOR is the legal employer in the country: it signs the employment contract under local law, runs payroll, withholds and pays the country's income tax and social contributions, provides statutory benefits, and handles the termination when it comes, while the client directs the work day to day and pays the EOR the full employment cost plus a monthly fee per worker. Published EOR prices start at $599 to $699 per employee per month as of November 2026.

The model is simple to describe and full of edges. The EOR may employ through its own entity in the country or through a local partner, and the difference decides who holds the money, the payroll data and the liability. Some countries restrict what is effectively labor leasing. An EOR doesn't make the client's own tax presence in the country disappear, so a salesperson who concludes contracts can still create a permanent establishment. Equity grants, benefits and terminations follow local law, not the client's US handbook. This chapter covers EOR mechanics, owned entities and partners, contractor of record, permanent establishment risk at the level public sources state it, benefits and equity, terminations abroad with worked numbers, pricing, and when to open your own entity. Running payroll in another country, which an EOR does for its clients and a company with its own entity does for itself, is in [International Payroll](/books/workforce/global-payroll); the PEO, the domestic co-employment cousin, is in [PEOs & Co-Employment](/books/workforce/peos-and-co-employment#aso-and-eor-the-contrasts).

## How the Platforms Do It

As of November 2026, from each provider's public pages (country counts and ownership claims are the vendors' own):

| Provider | EOR price | Countries | Entities | Other products |
| --- | --- | --- | --- | --- |
| **Deel** | From $599 per month | EOR in 130+ of 150+ countries | "100+ owned entities worldwide" plus "a global network of local entities and partners" | Contractor management from $49; contractor of record $325; US PEO $125 |
| **Globalization Partners (G-P)** | Not published | "180+ countries covered" | "200+ global partners" | An AI agent product |
| **Oyster** | "USD 699" a month, with unpriced annual discounts | EOR in 120+ countries; contractors in 180+ | No owned-entity claim on the pages I read | Contractors from USD 29 |
| **Pebl (formerly Velocity Global)** | Not published | "185+ countries" | "90% of employees supported through Pebl-owned entities" | |
| **Remote** | From $599 per employee per month on annual contracts; no setup or onboarding fee | EOR in "90+ countries" | "100% owned entities, no third parties" | Contractor management $29 and $99; contractor of record $325; global payroll $19; US PEO $99; equity administration $39 |
| **Rippling** | Not published | EOR in "115 countries" | Not stated | Global payroll "via Rippling entities" or "via your entities" |

<!-- source-gap: wf-eor-papaya-multiplier | missing | Papaya Global and Multiplier EOR pricing, country counts and entity models | closes with: their public pricing or EOR pages, opened (papayaglobal.com 403 and multiplier HTTP 530 on Nov 10, 2026) | checked: 2026-11-10 --> Papaya Global's and Multiplier's pages weren't reachable when I checked, so they aren't in the table.

The table shows where the market competes: owned entities as a quality claim (Remote's "no third parties," Pebl's 90%), coverage as a reach claim (G-P's 180 countries with 200 partners), and flat monthly pricing in a narrow band. Velocity Global's rebrand to Pebl is recent enough that both names appear in contracts and procurement records.

## EOR Mechanics

An EOR engagement has three parties and two contracts:

- **The client and the EOR** sign a services agreement: the EOR employs named workers in named countries for the client, the client directs their work and pays the employment cost, the fee and any deposit, and the agreement allocates liabilities (intellectual property assignment through to the client, confidentiality, data protection, indemnities).
- **The EOR and the worker** sign a local employment contract that meets the country's law: notice periods, probation, working time, paid leave, statutory benefits and mandatory clauses. The EOR is the employer of record for every legal purpose in the country.
- **The client and the worker** have a working relationship but no employment contract. In Remote's description, the client manages day-to-day work and Remote leads terminations and severance; Deel describes its EOR as taking "on all legal and tax responsibilities," including contracts, classification and termination.

Every month the EOR runs local payroll, pays the worker in local currency, pays the country's withholding and social contributions under its own registrations, and invoices the client for gross pay, employer contributions, benefits, the fee and FX. The invoice is the client's only accounting record of the worker: the payroll detail lives at the EOR. For a client system, an EOR worker is therefore a person and a worker whose `employer_id` is the EOR's local entity, not the client's, with the client's company relationship recorded on the engagement, and whose cost arrives as an invoice rather than as pay statement lines computed by the client.

## Owned Entities Versus Partners

An EOR employs in a country either through its own subsidiary or through a partner, an in-country employer (often a local payroll or staffing firm) that signs the employment contract on the EOR's behalf. The difference matters for:

- **Who the legal employer is.** With a partner, the worker's contract, payslips and tax registrations name the partner, and the client's agreement is with the EOR, so there's a chain of two service agreements between the client and the employer.
- **Who holds the money.** The client funds the EOR, which funds the partner, which pays the worker and the authorities; a failure anywhere in the chain is a failure to pay wages and taxes, the global version of a payroll provider failure ([When Payroll Providers Fail](/books/workforce/when-providers-fail)).
- **Where the data goes.** Payroll and HR data passes to the partner, which is a processor or controller under local data protection law, with its own transfer mechanisms.
- **Consistency.** Benefits, contract templates and response times vary by partner.

Vendors' claims run from all owned (Remote) to mostly owned (Pebl, Deel's 100+ owned entities alongside partners) to partner networks (G-P's 200+ partners). For a buyer, the question per country is which entity will sign the contract, and for a builder, the answer is a row per country with the entity, its ownership and, where it's a partner, the partner firm.

### Germany and Labor Leasing

Some countries regulate employing a worker who works for someone else as labor leasing. Germany's Arbeitnehmerüberlassungsgesetz (AÜG) requires a lessor to hold a permit ("bedürfen der Erlaubnis," §1(1)) and bars assigning the same worker to the same hirer "länger als 18 aufeinander folgende Monate," more than 18 consecutive months (§1(1b)). An EOR arrangement in which the worker is integrated into the client's business can fall under it, which is why German EOR engagements are structured with care. <!-- source-gap: wf-eor-germany-structure | missing | how EOR providers structure German engagements under the AÜG (licensing, the 18-month limit, alternatives) | closes with: an EOR provider's or German labor authority's public page on EOR and the AÜG, opened | checked: 2026-11-10 --> I haven't found a provider's public statement of how it structures German engagements under the AÜG, so I state only the statute; the engagement record should carry the country's leasing rules (a license reference and an assignment clock) where they apply.

## Contractor of Record

A contractor of record (COR) sits between direct contracting and EOR: the provider contracts with the independent contractor, pays them and takes on the classification review and some of the misclassification risk, and the client pays the provider. Deel and Remote both list it at $325 per month as of November 2026, between their contractor management tools ($49 and $29 or $99) and their EOR ($599). The worker stays a contractor, so the local classification test still decides whether that's right; a COR doesn't make an employee into a contractor, and when the facts look like employment the answer is the EOR. Contractor management tools, by contrast, only pay and document a contractor the client engages directly, with the classification risk staying with the client ([Worker Classification](/books/workforce/worker-classification)).

## Permanent Establishment Risk

Corporate income tax follows a company's taxable presence in a country, which tax treaties define as a permanent establishment (PE). The US Model Income Tax Convention (2016), Article 5, states the classic tests:

- **A fixed place of business,** "through which the business of an enterprise is wholly or partly carried on" (5(1)), excluding activities "of a preparatory or auxiliary character" (5(4)).
- **A dependent agent** who "has and habitually exercises" in the country "an authority to conclude contracts that are binding on the enterprise" (5(5)); an independent agent acting in the ordinary course of its business doesn't create one (5(6)).

The OECD revised its model's agent test in 2017 to reach people who play the principal role in concluding contracts as well as those who sign them; treaties based on the newer text are broader. <!-- source-gap: wf-oecd-art5-2017 | missing | the 2017 OECD Model Tax Convention Article 5 text (principal role leading to the conclusion of contracts, anti-fragmentation) | closes with: the OECD Model Tax Convention 2017 text on oecd.org, opened (403 on Nov 10, 2026) | checked: 2026-11-10 --> The OECD's own text wasn't reachable when I checked, so the wording above is the US model's.

An EOR employs the worker, but the worker works for the client, and the vendors say plainly that the EOR doesn't remove the client's PE risk. Deel calls EOR not suitable where PE risk is clear, such as C-level hires, and Oyster lists PE triggers that survive an EOR (a fixed place of business, staff who negotiate or conclude contracts, core revenue activity, long-term activity, senior leadership roles) and concludes that "EORs protect your company, but the protection isn't absolute." For a system, PE risk is a review attached to each engagement: the role, whether it negotiates or signs contracts, seniority, duration and headcount in the country, flagged for tax review when any trigger applies.

## Benefits and Equity Abroad

Benefits under an EOR are the country's statutory benefits (pension contributions, health insurance where it's employment-based, paid leave, sick pay, parental leave) plus whatever supplementary benefits the EOR offers or the client funds. The client's US benefit plans don't extend to the worker, so offering comparable benefits means funding local plans through the EOR, priced per country.

Equity is harder because the EOR, not the client, is the employer. Remote sells equity administration at $39 per employee per month for EOR employees with equity, handling vesting, exercise and withholding at settlement, with Carta or Pulley; Deel says equity "really depends on the country" and that in the US, where Deel is the employer on paper, grants are NSOs only. The tax event at vest or exercise is employment income in the country, withheld through the EOR's payroll, which means the client's equity system must send the EOR each event, the fair market value and the currency in time for the pay period ([Allocating Wages by Day, Including Equity](/books/workforce/multi-state-and-remote-work#allocating-wages-by-day-including-equity) covers the US multi-state version).

## Terminations Abroad

Terminations are where EOR costs surprise clients, because notice, process and severance are statutory and often generous. Two countries' rules from their official pages:

- **United Kingdom.** Statutory notice is one week for service of one month to two years, one week per year of service from two to twelve years, and twelve weeks at twelve years or more. Statutory redundancy pay requires two years' service and pays, per complete year, half a week's pay for years under age 22, one week's pay from 22 to 40, and one and a half weeks' pay at 41 or older, counting at most 20 years, with weekly pay capped at £751 for redundancies on or after April 6, 2026, a maximum of £22,530.
- **France.** Statutory severance (indemnité de licenciement) requires eight months of uninterrupted service and pays one quarter of a month's salary per year of service up to ten years and one third of a month per year after ten.

### Worked Numbers: Two Redundancies

Invented employees, statutory minimums only (contracts and collective agreements often give more):

**UK.** An employee aged 45 with 7 complete years of service and weekly pay of £900 is made redundant in November 2026. Notice: 7 weeks (one per year between 2 and 12), paid at the actual £900, £6,300. Redundancy pay, counting back from the redundancy date: the 4 years at ages 41 to 44 at 1.5 weeks and the 3 years at ages 38 to 40 at 1 week, 9 weeks, at the capped £751 a week: £6,759. Statutory total £13,059.

**France.** An employee with 12 years of service and a monthly reference salary of €4,000: 10 years x 1/4 month + 2 years x 1/3 month = 2.5 + 0.667 = 3.167 months, €12,666.67.

The engagement record needs the inputs these formulas read (hire date, date of birth, the reference pay as the country defines it) and the EOR's termination process with its own clock; the client's system can't compute the final number, but it can predict it closely enough to budget and to check the EOR's invoice.

## Pricing

An EOR charges a flat fee per worker per month on top of the full employment cost: gross pay, the country's employer contributions, benefits, and FX margin where the client pays in another currency. The flat fee weighs most on lower-paid hires, and deposits (often a month or more of employment cost) and termination costs are separate ([Employer of Record Fees](/books/workforce/revenue-models#employer-of-record-fees) works the fee as a share of total cost). A client reconciling an EOR invoice checks each line against an expectation: gross pay against the agreed salary, employer contributions against the country's rates ([International Payroll](/books/workforce/global-payroll#country-basics)), the fee against the contract, and FX against a reference rate on the invoice date.

## When to Open Your Own Entity

Opening an entity trades the fee for fixed costs and obligations: incorporation, a registered office, local accounting and audit, payroll registration, a local payroll provider or in-house team, employment contracts and policies, and the corporate tax return, plus a PE that is now intended. The vendors frame EOR as suited to market testing and an entity to long-term presence (Oyster), and the economics follow from the flat fee.

### Worked Numbers: The Break-Even Headcount

Invented figures: an entity in a mid-cost country costs $30,000 to set up, written off over three years, and $60,000 a year to run (accounting, audit, local payroll provider, registered office, legal), $70,000 a year in all; the EOR fee is $599 a month, $7,188 a year per worker. Break-even is $70,000 / $7,188 = 9.7 workers: at 10 or more in the country the entity is cheaper on fees alone, before counting the entity's corporate tax filings and the PE it creates. Below that, the EOR is cheaper unless the roles create a PE anyway (a country manager, a sales team), in which case the entity may be needed regardless of the arithmetic.

Moving workers from an EOR to the new entity is a transfer of employment: a new contract with the new employer, recognition of prior service where local law or the agreement requires it, and a new payroll from a cutover date, with the EOR's final payroll and year-end documents closing the old employment.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). A foreign legal entity that employs people (the EOR's subsidiary, a partner, or the client's own entity abroad) is an `employers` row with a country and local registrations instead of an EIN; the engagement ties the client's `companies` row to the worker and the employing entity.

```sql
ALTER TABLE tax_jurisdictions
  DROP CONSTRAINT tax_jurisdictions_level_check,
  ADD CONSTRAINT tax_jurisdictions_level_check CHECK (level IN ('country', 'federal', 'state',
    'county', 'city', 'school_district', 'transit_district', 'other_local')),
  DROP CONSTRAINT tax_jurisdictions_code_scheme_check,
  ADD CONSTRAINT tax_jurisdictions_code_scheme_check CHECK (code_scheme IN ('iso_3166_1',
    'iso_3166_2', 'fips', 'gnis', 'psd', 'vendor'));

ALTER TABLE employers
  ADD COLUMN country               CHAR(2) NOT NULL DEFAULT 'US',   -- ISO 3166-1 alpha-2
  ADD COLUMN local_registrations   JSONB NOT NULL DEFAULT '{}',     -- tax and social security ids
  ALTER COLUMN ein DROP NOT NULL,
  ALTER COLUMN federal_return DROP NOT NULL,
  ALTER COLUMN deposit_schedule DROP NOT NULL,
  ALTER COLUMN deposit_schedule_year DROP NOT NULL,
  ADD CONSTRAINT us_employer_fields CHECK (country <> 'US' OR (ein IS NOT NULL
    AND federal_return IS NOT NULL AND deposit_schedule IS NOT NULL));

CREATE TABLE country_partners (            -- in-country firms that employ or run payroll
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_name          TEXT NOT NULL,
  country             CHAR(2) NOT NULL,
  services            TEXT[] NOT NULL,       -- 'employment', 'payroll', 'benefits', 'accounting'
  agreement_document_id UUID REFERENCES documents (id),
  dpa_document_id     UUID REFERENCES documents (id),   -- data processing terms
  assurance_reports   JSONB NOT NULL DEFAULT '[]',      -- audits received, with periods
  status              TEXT NOT NULL CHECK (status IN ('onboarding', 'active', 'suspended',
                        'terminated')),
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE eor_entities (                -- who signs the employment contract, per country
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),   -- the foreign legal employer
  country             CHAR(2) NOT NULL,
  ownership           TEXT NOT NULL CHECK (ownership IN ('owned', 'partner', 'client_owned')),
  country_partner_id  UUID REFERENCES country_partners (id),
  leasing_license_ref TEXT,                  -- where labor leasing rules apply (Germany's AUG)
  max_assignment_months SMALLINT,            -- 18 in Germany for the same hirer
  valid_during        DATERANGE NOT NULL,
  CHECK ((ownership = 'partner') = (country_partner_id IS NOT NULL))
);

CREATE TABLE eor_engagements (             -- one client, one worker, one employing entity
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),   -- the client
  worker_id           UUID NOT NULL REFERENCES workers (id),     -- employed by the EOR entity
  eor_entity_id       UUID NOT NULL REFERENCES eor_entities (id),
  product             TEXT NOT NULL CHECK (product IN ('eor', 'contractor_of_record')),
  role_title          TEXT NOT NULL,
  pe_review           JSONB NOT NULL,        -- {"concludes_contracts": false, "senior": false,
                                             --  "revenue_role": false, "reviewed_on": "..."}
  salary_amount       BIGINT NOT NULL,       -- minor units of salary_currency
  salary_currency     CHAR(3) NOT NULL,
  fee_amount          BIGINT NOT NULL,       -- per month, minor units of fee_currency
  fee_currency        CHAR(3) NOT NULL,
  deposit_amount      BIGINT,
  employment_contract_document_id UUID REFERENCES documents (id),
  equity_admin        BOOLEAN NOT NULL DEFAULT FALSE,
  starts_on           DATE NOT NULL,
  assignment_clock_starts_on DATE,           -- for leasing limits
  ended_on            DATE,
  end_reason          TEXT CHECK (end_reason IN ('resignation', 'termination', 'redundancy',
                        'transfer_to_entity', 'contract_end')),
  severance_estimate  JSONB,                 -- the formula inputs and result, by country rule
  transferred_to_worker_id UUID REFERENCES workers (id)   -- the row at the client's new entity
);
```

The client's view of an EOR worker is the engagement, the monthly invoice (reconciled line by line against expectations from the country's rates) and the events it must send the EOR: raises, bonuses, equity events, leave and terminations. The EOR's own platform runs the local payroll that [International Payroll](/books/workforce/global-payroll#how-to-build-it) models. An engagement with any PE trigger set is routed for tax review before it starts, and an engagement in a country with a leasing limit raises an alert as the clock approaches it.

Design notes:

- **Model foreign legal employers as employers** with country registrations, so EOR, partner and own-entity employment share one shape.
- **Record the entity that signs each contract,** its ownership and any partner behind it.
- **Store salaries and fees in their own currencies** ([Currency Is Always Explicit](/docs/money/amounts#currency-is-always-explicit)).
- **Attach a PE review to every engagement** and re-run it when the role changes.
- **Keep the inputs for statutory termination costs** to budget and check invoices.
- **Plan entity transfers as new employments** with service recognized where required.

## Auditing

A client's finance team, a tax authority or an acquirer's diligence asks:

- **Every engagement** with its country, employing entity, ownership, contract and dates.
- **Monthly invoices reconciled** to salary, contributions, fees and FX, with variances explained.
- **PE reviews** for each engagement and their outcomes.
- **Partners' agreements, data processing terms and assurance reports,** current for each country used.
- **Terminations** with notice, severance and the statutory computation behind them.
- **Equity events** sent to the EOR and the withholding that followed.

## What This Means for the System You Build

- **Know who signs each worker's contract,** whether an owned entity or a partner, by country.
- **Treat the EOR invoice as the payroll record** you can check, and reconcile every line.
- **Review PE risk per engagement,** especially for sales, senior and long-term roles.
- **Carry country rules into engagements:** leasing limits, notice and severance formulas.
- **Route equity events to the EOR** in time for local withholding.
- **Compute the entity break-even per country** and plan transfers as new employments.

## References

**Law and regulation**

- [US Treasury: United States Model Income Tax Convention (2016) (PDF)](https://home.treasury.gov/system/files/131/Treaty-US-Model-2016_1.pdf), Article 5, fixed place of business, preparatory or auxiliary activities and dependent agents
- [Germany: Arbeitnehmerüberlassungsgesetz §1](https://www.gesetze-im-internet.de/a_g/__1.html), the permit requirement and the 18-month limit

**Agency guidance and forms**

- [GOV.UK: Giving staff notice](https://www.gov.uk/staff-redundant/giving-staff-notice), statutory notice periods
- [GOV.UK: Redundancy pay](https://www.gov.uk/redundancy-your-rights/redundancy-pay), eligibility, age bands, the 20-year limit and the £751 weekly cap from April 6, 2026
- [Service-Public.fr: Indemnité de licenciement](https://www.service-public.gouv.fr/particuliers/vosdroits/F987), eight months' service and one quarter and one third of a month per year

**Vendor documentation**

- [Remote: Pricing](https://remote.com/pricing), EOR from $599, contractor products, contractor of record $325, global payroll, US PEO and equity at $39
- [Remote: Employer of Record](https://remote.com/employer-of-record), owned entities in 90+ countries, day-to-day management by the client and terminations led by Remote
- [Deel: Pricing](https://www.deel.com/pricing), EOR from $599, contractors $49, contractor of record $325 and US PEO $125
- [Deel: Employer of Record](https://www.deel.com/employer-of-record/), countries, owned entities and equity by country
- [Deel: Using an employer of record to mitigate permanent establishment risk](https://www.deel.com/blog/using-an-employer-of-record-to-mitigate-permanent-establishment-risk/), legal and tax responsibilities, partners and when EOR doesn't suit
- [Oyster: Pricing](https://www.oysterhr.com/pricing), EOR at USD 699 and coverage
- [Oyster: Employer of record and permanent establishment](https://www.oysterhr.com/library/employer-of-record-permanent-establishment), PE triggers with an EOR and EOR versus entity
- [Globalization Partners](https://www.globalization-partners.com/), coverage and partners
- [Pebl (formerly Velocity Global)](https://hellopebl.com/), the rebrand, coverage and owned-entity share
- [Rippling: Employer of Record](https://www.rippling.com/employer-of-record), country coverage
