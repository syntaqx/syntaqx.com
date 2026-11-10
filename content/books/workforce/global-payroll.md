+++
title = "International Payroll"
description = "Global payroll through aggregators and in-country partners, UK, Canada and Germany worked, EU rules that touch pay, currencies and rails, and data residency."
category = "Workforce Industry"
order = 2655
part = "Contractors and Global"
tags = ["global-payroll", "international", "paye", "canada-payroll", "fx", "data-residency"]
+++

Every country runs payroll differently, and every country runs it as precisely as the United States does. The United Kingdom wants a Full Payment Submission to HM Revenue & Customs on or before each payday, with income tax computed cumulatively from a tax code and National Insurance on per-period thresholds. Canada wants Canada Pension Plan contributions, a second CPP tier, Employment Insurance premiums and income tax withheld, remitted on a schedule set by the employer's average monthly withholding from two years earlier, and T4 slips by the end of February. Germany wants a wage tax return filed electronically by the tenth day after each period and social insurance contributions computed against ceilings that differ by branch. No provider writes all of those rules itself for every country, and no chapter can cover them all.

What is common is the shape. Global payroll is either run on a provider's own engine in the countries it has built, or aggregated: inputs collected centrally, sent to an in-country partner that calculates and files, and results returned as a gross-to-net report normalized across countries. Either way the employer's system holds the worker record, the changes, the results, the money and the reconciliation, in many currencies and under data protection law that limits where the data may go. This chapter covers how the platforms do it, aggregators and partners, country basics for the UK, Canada and Germany with worked numbers and India, Mexico and Brazil at the level the sources I opened state, the EU rules that touch payroll, currencies and rails, and data residency, without pretending to cover every country. Employing people in a country where the client has no entity is in [Employer of Record & Global Employment](/books/workforce/employer-of-record). Cross-border money movement as a rail is the Payments volume's [Cross-Border & FX](/books/payments/cross-border-and-fx).

## How the Platforms Do It

As of November 2026, from the providers' public pages (counts are vendor claims):

| Provider | Coverage | Model, as stated | Notes |
| --- | --- | --- | --- |
| **ADP Global Payroll** | "140+ countries and territories" | A "hybrid technology and service model" | ADP doesn't say on the page which countries run on its own engine and which through partners |
| **Deel Global Payroll** | "150+ countries"; "$20B+" processed | Not stated | Its API's global payroll resources include employment and worker information, adjustments, shifts, gross-to-net (G2N) reports and payslips |
| **Remote Payroll** | "100+ countries and jurisdictions"; from $19 per employee per month | Remote "builds the platform, runs the compliance systems, and employs the specialists" | Claims to be "a regulated payments institution in Canada, the UK, and the EEA" |
| **Rippling Global Payroll** | Not stated | Payroll "via Rippling entities" (EOR) or "via your entities" | |

<!-- source-gap: wf-global-papaya | missing | Papaya Global's global payroll model (owned engine or partners), coverage and API | closes with: Papaya Global's product or developer pages, opened (403 on Nov 10, 2026) | checked: 2026-11-10 --> Papaya Global's pages weren't reachable when I checked.

The vocabulary the APIs share is telling: Deel exposes "G2N reports" as a resource, because the gross-to-net result from each country is the unit the employer receives, reconciles and books. Rippling's split is the line that matters for any global payroll buyer: payroll for workers employed by the provider's entities (EOR) and payroll for the employer's own entities are different products with different liability, even when the screens look the same.

## Aggregators and In-Country Partners

A global payroll provider either computes a country's payroll on its own engine or sends it to a partner in the country. The aggregated flow, each cycle:

1. **Inputs are collected centrally:** new hires, terminations, salary changes, one-time payments, hours and allowances, absences, bank details, from the employer's HRIS and time systems, in a common format.
2. **The partner calculates** gross to net under local law, produces payslips and the employer's statutory returns, and sends results back.
3. **Results are normalized** into a common G2N report: per worker, earnings, employee deductions, employer contributions, net pay, by local code mapped to a common catalog.
4. **The employer approves,** funds the net pay and the liabilities, and the provider or partner pays workers and authorities in local currency.
5. **Filings and remittances** happen in country, under the employer's local registrations, by the partner or the provider.

The design problems are the domestic ones with a translation layer added. Local codes must map to a common catalog (as company codes map to `pay_item_types` at home) so a global labor cost report sums like with like. Partner results must be reconciled to the inputs sent: a raise sent and not applied is a common partner error. Each country's calendar (pay dates, input cutoffs, filing dates) is data. And the employer's legal liability for withholding and contributions stays with the employer of record in the country, which is either the employer's own entity or an EOR, never the aggregator unless it's also the employer.

## Country Basics

Three countries in depth, from the tax authorities' own pages, and three at the level the sources I could reach support.

### United Kingdom

**Reporting.** Employers report each payment through Real Time Information: "Send the FPS on or before your employees' payday." An Employer Payment Summary claims reductions (statutory payment recoveries, the Employment Allowance) by the 19th of the following tax month, and PAYE is paid to HMRC by the 22nd electronically (the 19th by post). The tax year runs April 6 to April 5.

**Rates for 2026-27.** The personal allowance is £12,570 (£1,048 a month), with emergency code 1257L applied on a week 1 or month 1 basis. In England, Wales and Northern Ireland, income tax is 20% on the first £37,700 of taxable income, 40% to £125,140 and 45% above; Scotland has six bands from 19% to 48%. Class 1 National Insurance thresholds:

| Threshold | Weekly | Monthly | Annual |
| --- | --- | --- | --- |
| Lower earnings limit | £129 | £559 | £6,708 |
| Primary threshold (employee NI starts) | £242 | £1,048 | £12,570 |
| Secondary threshold (employer NI starts) | £96 | £417 | £5,000 |
| Upper earnings limit | £967 | £4,189 | £50,270 |

Employees pay 8% between the primary threshold and the upper earnings limit and 2% above; employers pay 15% above the secondary threshold. The Employment Allowance is £10,500 a year. Statutory Sick Pay is £123.25 a week (or 80% of average weekly earnings if lower); Statutory Maternity Pay is 90% of average weekly earnings for six weeks, then £194.32. Student loan deductions are 9% above plan thresholds (Plan 1 £26,900, Plan 2 £29,385, Plan 4 £33,795, Plan 5 £25,000) and 6% for postgraduate loans above £21,000.

**Worked numbers.** An invented employee in England on code 1257L is paid £5,000 in month 1 of 2026-27, with no student loan:

| Item | Computation | Amount |
| --- | --- | --- |
| Free pay (1257L, month 1) | £12,570 / 12 | £1,047.50 |
| Taxable pay | £5,000.00 − £1,047.50 | £3,952.50 |
| Income tax at 20% | £37,700 / 12 = £3,141.67 x 20% | £628.33 |
| Income tax at 40% | (£3,952.50 − £3,141.67) x 40% | £324.33 |
| **Income tax** | | **£952.66** |
| Employee NI at 8% | (£4,189 − £1,048) x 8% | £251.28 |
| Employee NI at 2% | (£5,000 − £4,189) x 2% | £16.22 |
| **Employee NI** | | **£267.50** |
| **Employer NI** | (£5,000 − £417) x 15% | **£687.45** |
| **Net pay** | £5,000.00 − £952.66 − £267.50 | **£3,779.84** |

HMRC's own tables round free pay and tax slightly differently, so a real engine uses HMRC's published method and tables rather than this arithmetic; the structure (cumulative income tax by tax code, per-period NI on thresholds, employer NI on top) is the point. Income tax is cumulative across the tax year: month 2's tax is computed on two months' pay and allowance, less month 1's tax, which is why a UK engine needs year-to-date by tax year, not by calendar year.

### Canada

**Source deductions.** Employers outside Quebec withhold CPP, the second additional CPP contribution (CPP2), EI premiums and income tax, and match CPP and CPP2 and pay 1.4 times the employee's EI. For 2026:

| Item | Rate | Base | Maximum each |
| --- | --- | --- | --- |
| CPP | 5.95% employee and employer | Earnings from $3,500 (basic exemption) to $74,600 (YMPE) | $4,230.45 |
| CPP2 | 4% employee and employer | Earnings from $74,600 to $85,000 (YAMPE) | $416.00 |
| EI, outside Quebec | 1.63% employee; employer 1.4x | Insurable earnings to $68,900 | $1,123.07 employee, $1,572.30 employer |
| EI, Quebec | 1.30% employee; employer 1.4x | Same | $895.70 employee, $1,253.98 employer |

**Remittance.** Due dates depend on the remitter type, set from the employer's average monthly withholding amount (AMWA), generally from two years earlier: quarterly remitters (AMWA under $3,000 with a perfect compliance record) by the 15th of April, July, October and January; regular remitters (under $25,000) by "the 15th day of the next month"; threshold 1 ($25,000 to $99,999.99) by the 25th for the first half of the month and the 10th of the next month for the second half; threshold 2 ($100,000 or more) by the third working day after the 7th, 14th, 21st and last day of the month. It's the same idea as the IRS's lookback period with different numbers ([The Deposit Schedule](/books/workforce/deposits-and-returns#the-deposit-schedule)).

**Year-end.** T4 slips and the summary are due "the last day of February after the preceding calendar year," moving to the next business day when it falls on a weekend or holiday: for 2026, Monday, March 1, 2027, since February 28, 2027 is a Sunday.

**Worked numbers.** An invented employee outside Quebec paid $90,000 in 2026 reaches every maximum:

| Item | Computation | Employee | Employer |
| --- | --- | --- | --- |
| CPP | ($74,600 − $3,500) x 5.95% | $4,230.45 | $4,230.45 |
| CPP2 | ($85,000 − $74,600) x 4% | $416.00 | $416.00 |
| EI | $68,900 x 1.63%; employer x 1.4 | $1,123.07 | $1,572.30 |
| **Total before income tax** | | **$5,769.52** | **$6,218.75** |

Per pay period, the basic exemption is prorated (on a biweekly payroll, $3,500 / 26), and contributions stop when the year's maximum is reached, the same crossover logic as the US Social Security wage base.

### Germany

**Wage tax.** The employer files a wage tax return (Lohnsteuer-Anmeldung) "spätestens am zehnten Tag nach Ablauf eines jeden Lohnsteuer-Anmeldungszeitraums," no later than the tenth day after each period, electronically ("durch Datenfernübertragung"), and pays by the same date. The period is monthly by default, quarterly if the prior year's wage tax was over €1,080 and up to €5,000, and annual if it was €1,080 or less (§41a EStG).

**Social insurance.** Contributions are computed on pay up to ceilings (Beitragsbemessungsgrenzen) that for 2026 are €8,450 a month (€101,400 a year) for pension and unemployment insurance (€10,400 for the miners' scheme) and €5,812.50 a month (€69,750 a year) for health and long-term care insurance; the threshold above which an employee may leave statutory health insurance is €6,450 a month (€77,400 a year). Contribution rates include 18.6% for pension, a 14.6% general rate for health insurance (plus a fund-specific supplement) and 3.6% for long-term care (4.2% for the childless).

**Worked numbers.** For an invented employee earning €9,000 a month in 2026, pension contributions apply to €8,450: 18.6% x €8,450 = €1,571.70 in total, divided between employer and employee; health insurance's general rate applies to €5,812.50: 14.6% x €5,812.50 = €848.63 before the fund's supplement. The €550 above the pension ceiling and the €3,187.50 above the health ceiling bear none of those contributions. A German engine needs each branch's ceiling separately, by month, with annualization rules for one-off payments. <!-- source-gap: wf-germany-elstam-split | missing | ELStAM retrieval of employees' tax data and the employer and employee shares of each social insurance branch | closes with: BZSt or ELSTER pages on ELStAM and a Deutsche Rentenversicherung or GKV page on contribution shares, opened | checked: 2026-11-10 --> The employer and employee shares and the electronic retrieval of employees' tax attributes (ELStAM) aren't in the sources I opened, so the example gives totals.

### India, Mexico and Brazil

These countries' payroll is mandatory, electronic and detailed: India withholds income tax at source on salary and requires provident fund contributions; Mexico withholds income tax and pays social security contributions to IMSS, with payroll receipts issued as electronic tax documents (CFDI de nómina) through the tax authority's system; Brazil reports payroll and labor events through eSocial, the "Escrituração Digital das Obrigações Fiscais, Previdenciárias e Trabalhistas," with a mandatory thirteenth salary and employer deposits to the FGTS severance fund. <!-- source-gap: wf-india-mexico-brazil | missing | India (TDS on salary, EPF rates, the Income-tax Act 2025's start date, Form 16), Mexico (ISR withholding, IMSS, CFDI de nomina) and Brazil (FGTS rate, the thirteenth salary under Lei 4.090/1962) rules and rates | closes with: incometaxindia.gov.in, epfindia.gov.in, sat.gob.mx, imss.gob.mx and planalto.gov.br pages, opened (403 or 404 on Nov 10, 2026) | checked: 2026-11-10 --> I could open only Brazil's eSocial page among these countries' official sources, so the rates and deadlines aren't stated here; the model doesn't depend on them, and a country profile row per country holds them when sourced.

## EU Rules That Touch Payroll

EU directives bind employers through national law, so a payroll system meets them as each member state's transposition:

- **Pay transparency.** Directive (EU) 2023/970 required transposition by June 7, 2026, with pay ranges for applicants, pay level information on request and gender pay gap reports from 2027 for employers with 250 or more workers; its payroll data needs (gross annual and hourly pay by worker) are worked through in [The EU Pay Transparency Directive](/books/workforce/pay-transparency-and-equity#the-eu-pay-transparency-directive).
- **Adequate minimum wages.** On November 11, 2025, the Court of Justice (case C-19/23) confirmed "the validity of a large part" of Directive (EU) 2022/2041 but annulled the provision listing the criteria member states with statutory minimum wages must consider when setting them and the rule preventing indexed minimum wages from falling (Articles 5(2) and 5(3)). Minimum wages remain national rates, set and changed by each country, and belong in the same dated rate tables as US minimum wages ([Minimum Wage as Data](/books/workforce/minimum-wage-as-data)).
- **Working conditions and posting.** EU law also sets what an employment contract's written terms must include and the pay rules for workers posted temporarily to another member state. <!-- source-gap: wf-eu-1152-posting | missing | Directive (EU) 2019/1152 written information requirements and the Posting of Workers Directive 96/71/EC as amended by 2018/957, as they bind payroll | closes with: the directives' texts on EUR-Lex, opened (empty responses and 429 on Nov 10, 2026) | checked: 2026-11-10 --> I couldn't open those directives' texts, so their specifics are left to the member states' rules in each country profile.

## Currencies and Payment Rails

A global payroll is funded in the employer's currency and paid in each worker's. The decisions:

- **Pay in local currency** through local rails where possible: in-country transfers arrive on the payday and cost less than an international wire, which is why providers hold local bank accounts or licenses (Remote's claim to be a regulated payments institution in Canada, the UK and the EEA is that capability). The rails themselves are covered in [Settling and Paying Out in Many Currencies](/books/payments/cross-border-and-fx#settling-and-paying-out-in-many-currencies).
- **Convert once, at a recorded rate.** The employer funds an amount in its currency; the provider converts at a quoted rate with a margin; the worker receives the local net pay exactly. The rate, the quote time, the margin and both amounts are a record, because the employer books labor cost in its own currency and the country books it in local currency ([FX Rates, Providers and Quotes](/books/payments/cross-border-and-fx#fx-rates-providers-and-quotes)).
- **Liabilities in local currency.** Taxes and contributions are owed in local currency on local due dates, so a late or short conversion is a late tax payment in that country.
- **Salary in which currency.** A worker whose contract states pay in USD but who is paid in local currency bears FX risk each payday; one paid a fixed local amount shifts the risk to the employer. The contract's currency is a field, and the payroll's computation currency follows the country's law.

## Data Residency

Payroll data is personal data at its most sensitive (identity numbers, bank accounts, health-related absences, union dues), and moving it to a provider, a partner or a group parent in another country is a transfer under the data protection law of the country it leaves. Under the GDPR, a transfer to a country without an adequacy decision needs "appropriate safeguards," such as the "standard data protection clauses adopted by the Commission" (Article 46). The playbook's [International Transfers](/docs/compliance/gdpr#international-transfers) covers the mechanisms; for global payroll, the practical rules are to know where each country's payroll data is stored and processed, to have a transfer basis for each flow (employer to aggregator, aggregator to partner, partner back), to keep data in-region where a provider offers it, and to send partners only what they need to calculate.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model), building on [Employer of Record & Global Employment](/books/workforce/employer-of-record#how-to-build-it), which adds country-level `tax_jurisdictions` and foreign `employers`. A country profile holds what's needed to run or check payroll there; partner imports hold what a partner calculated; FX conversions record every currency change.

```sql
CREATE TABLE country_payroll_profiles (    -- what running payroll in a country requires
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),   -- level 'country'
  currency            CHAR(3) NOT NULL,
  tax_year_start      TEXT NOT NULL,         -- '04-06' (UK), '01-01' (Canada, Germany)
  cumulative_tax      BOOLEAN NOT NULL,      -- UK PAYE is cumulative by tax year
  per_payment_filing  TEXT,                  -- 'uk_fps_on_or_before_payday'
  remittance_rule     JSONB NOT NULL,        -- Canada's remitter types from AMWA, Germany's
                                             -- 10th-day rule by prior-year wage tax
  year_end_forms      JSONB NOT NULL,        -- [{"form": "T4", "due": "last_day_feb_next_bd"}]
  run_by              TEXT NOT NULL CHECK (run_by IN ('own_engine', 'partner', 'eor')),
  country_partner_id  UUID REFERENCES country_partners (id),
  input_cutoff_rule   JSONB NOT NULL,        -- days before pay date the partner needs inputs
  data_location       TEXT NOT NULL,         -- where the country's payroll data is processed
  transfer_basis      TEXT,                  -- 'adequacy', 'sccs', ... for data leaving
  source_refs         JSONB NOT NULL,
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (jurisdiction_id WITH =, valid_during WITH &&)
);

CREATE TABLE partner_payroll_imports (     -- a partner's G2N result for one run
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  pay_run_id          UUID NOT NULL REFERENCES pay_runs (id),
  country_partner_id  UUID NOT NULL REFERENCES country_partners (id),
  inputs_sent_at      TIMESTAMPTZ NOT NULL,
  inputs_hash         TEXT NOT NULL,         -- what was sent, to compare with what came back
  received_at         TIMESTAMPTZ,
  raw_document_id     UUID REFERENCES documents (id),   -- the G2N report as delivered
  code_mapping_version TEXT NOT NULL,        -- local codes to pay_item_types
  worker_count        INT,
  gross_total         BIGINT,                -- minor units of the country currency
  net_total           BIGINT,
  employer_cost_total BIGINT,
  variances           JSONB NOT NULL DEFAULT '[]',  -- inputs not reflected, unexpected lines
  status              TEXT NOT NULL CHECK (status IN ('awaiting', 'received', 'mapped',
                        'variance_review', 'approved', 'rejected'))
);

CREATE TABLE fx_conversions (              -- every currency change behind a payroll
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  pay_run_id          UUID REFERENCES pay_runs (id),
  money_movement_id   UUID REFERENCES money_movements (id),
  sell_currency       CHAR(3) NOT NULL,
  sell_amount         BIGINT NOT NULL,       -- minor units
  buy_currency        CHAR(3) NOT NULL,
  buy_amount          BIGINT NOT NULL,
  rate                NUMERIC(18, 10) NOT NULL,
  reference_rate      NUMERIC(18, 10),       -- a mid-market or published rate, for the margin
  margin_bps          NUMERIC(8, 2),
  provider            TEXT NOT NULL,
  quoted_at           TIMESTAMPTZ NOT NULL,
  executed_at         TIMESTAMPTZ
);

ALTER TABLE pay_runs
  ADD COLUMN currency       CHAR(3) NOT NULL DEFAULT 'USD',
  ADD COLUMN partner_import_id UUID REFERENCES partner_payroll_imports (id);

ALTER TABLE money_movements
  ADD COLUMN currency       CHAR(3) NOT NULL DEFAULT 'USD';
```

A partner-run country's pay run is created from the inputs, marked `calculating` while the partner works, and populated from the import: each local line mapped to a `pay_item_types` row and written as `pay_statement_lines` in the country's currency, with variances held for review before approval. Funding creates an `fx_conversions` row and the money movements in each currency. Year-to-date for a cumulative country is keyed by its tax year, read from the profile, not the calendar year.

Design notes:

- **Make the country a jurisdiction and a profile row,** with its tax year, cumulative rules, remittance rule and forms as data.
- **Map every local pay code to the common catalog** with a versioned mapping.
- **Reconcile partner results to inputs** before approval, every cycle.
- **Carry currency on every amount** and record every conversion with its rate and margin.
- **Know where each country's data is processed** and the transfer basis for each flow.

## Auditing

A local tax audit, a group finance close or a data protection review asks:

- **Every partner import** as delivered, its mapping version and the variances resolved.
- **Per-payment and periodic filings** in each country, with acknowledgments, against the profile's rules.
- **Remittances in local currency** against local due dates.
- **FX conversions** with rates, margins and the amounts in both currencies, reconciled to labor cost in the books.
- **Data flows** per country with their transfer basis and the partners' processing terms.

## What This Means for the System You Build

- **Decide per country whether you run the engine, use a partner or use an EOR,** and record it.
- **Normalize every country's results into the same statement lines,** through a versioned code map.
- **Treat partner results as inputs to reconcile,** not as truth.
- **Key year-to-date by each country's tax year** and handle cumulative systems like PAYE.
- **Pay in local currency on local rails,** converting once at a recorded rate.
- **Map every cross-border data flow** to a legal transfer basis, and send partners only what they need.

## References

**Law and regulation**

- [Germany: Einkommensteuergesetz §41a](https://www.gesetze-im-internet.de/estg/__41a.html), the wage tax return by the tenth day, electronic filing and the monthly, quarterly and annual periods
- [Court of Justice of the EU: Press release 136/25, Case C-19/23 (PDF)](https://curia.europa.eu/site/upload/docs/application/pdf/2025-11/cp250136en.pdf), the Adequate Minimum Wages Directive largely upheld and Articles 5(2) and 5(3) annulled
- [European Commission: statement on the minimum wages judgment (November 11, 2025)](https://employment-social-affairs.ec.europa.eu/news/commission-welcomes-judgment-eu-court-largely-confirming-validity-directive-adequate-minimum-wages-2025-11-11_en), the directive adopted on a correct legal basis

**Agency guidance and forms**

- [GOV.UK: Running payroll, reporting to HMRC](https://www.gov.uk/running-payroll/reporting-to-hmrc), the FPS on or before payday, the EPS and payment dates
- [GOV.UK: Rates and thresholds for employers 2026 to 2027](https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027), the personal allowance, income tax bands, NI thresholds and rates, the Employment Allowance, SSP, SMP and student loans
- [Canada Revenue Agency: CPP contribution rates, maximums and exemptions](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp/cpp-contribution-rates-maximums-exemptions.html), the 2026 YMPE, basic exemption, rate and maximum
- [Canada Revenue Agency: Second additional CPP contribution rates and maximums](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/calculating-deductions/making-deductions/second-additional-cpp-contribution-rates-maximums.html), the 2026 YAMPE, rate and maximum
- [Canada Revenue Agency: EI premium rates and maximums](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei/ei-premium-rates-maximums.html), 2026 insurable earnings, rates and the employer's 1.4 times
- [Canada Revenue Agency: When and how to remit source deductions](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/remitting-source-deductions/how-when-remit-due-dates.html), remitter types and due dates
- [Canada Revenue Agency: When to file information returns](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/file-information-returns-slip-summaries/when-to-file.html), the T4 due date
- [Bundesregierung: Beitragsbemessungsgrenzen 2026](https://www.bundesregierung.de/breg-de/aktuelles/beitragsbemessungsgrenzen-2386514), the 2026 social insurance ceilings
- [Deutsche Rentenversicherung: Werte der Rentenversicherung](https://www.deutsche-rentenversicherung.de/DRV/DE/Experten/Zahlen-und-Fakten/Werte-der-Rentenversicherung/werte-der-rentenversicherung_node.html), contribution rates
- [Brazil: eSocial](https://www.gov.br/esocial/pt-br), the digital payroll and labor reporting system

**Vendor documentation**

- [ADP: Global Payroll](https://www.adp.com/what-we-offer/products/adp-global-payroll.aspx), coverage and the hybrid model
- [Deel: Global Payroll](https://www.deel.com/global-payroll/), coverage and volume processed
- [Deel: Global Payroll API](https://developer.deel.com/api/global-payroll), employment, adjustments, G2N reports and payslips
- [Remote: Global Payroll](https://remote.com/global-payroll), coverage, pricing, model and payments licensing
- [Rippling: Global Payroll](https://www.rippling.com/global-payroll), payroll via Rippling's entities or the customer's

**In practice**

- [GDPR-Info: Article 46, Transfers subject to appropriate safeguards](https://gdpr-info.eu/art-46-gdpr/), appropriate safeguards and standard contractual clauses (an unofficial copy of the regulation's text)
