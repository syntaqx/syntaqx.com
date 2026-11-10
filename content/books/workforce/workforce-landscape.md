+++
title = "The Payroll & HR Landscape"
nav_title = "The Landscape"
description = "Payroll and HR providers by clients, workers paid and revenue from filings, private players by what they publish, the segments, consolidation and switching."
category = "Workforce Industry"
order = 2602
part = "The Business"
tags = ["payroll", "hr", "hcm", "peo", "employer-of-record", "market-structure"]
+++

Payroll looks like one market from the outside and is several underneath. A sole proprietor paying two employees and a contractor buys software for $35 a month and a few dollars a person. A 300-person company buys a suite with payroll, time, benefits administration and HR on one database, priced per employee. An enterprise with 40,000 employees in 30 countries buys an HCM platform with a payroll engine in the countries it can cover and partners in the rest. A 25-person startup that wants a large company's health plan joins a PEO and stops being the only employer of its own staff. A company hiring its first engineer in Portugal pays an employer of record. And a vertical software company that sells to restaurants or clinics embeds payroll from an API so its customers never see the payroll company at all.

The same handful of companies show up in several of those markets, often under different brands, and the market keeps consolidating: Paychex bought Paycor in 2025, Thoma Bravo took Dayforce private in February 2026, and the HCM suites keep buying the modules they don't have. This chapter maps the landscape as of November 2026: the public providers by clients, workers paid and revenue from their filings, the private ones by what they publish, the segments and who sells into each, the consolidation with dates, how the published counts are defined, and how employers buy and switch, which is where the landscape meets the data model. [How Payroll Providers Make Money](/books/workforce/revenue-models) covers the economics of each segment, and [Who Runs Payroll: Agents & Liability](/books/workforce/who-runs-payroll) covers the tax arrangement each one operates under.

## How the Platforms Do It

The public providers, as of November 2026, from each company's latest annual report:

| Provider (fiscal year end) | Segment | Clients | Workers | Revenue |
| --- | --- | --- | --- | --- |
| **ADP** (June 30, 2026) | Small business to enterprise HCM, PEO (ADP TotalSource), global payroll | "Over 1.1 million clients" in more than 140 countries and territories; over 980,000 small businesses on RUN; over 90,000 mid-sized and large businesses on Workforce Now in North America; TotalSource more than 19,000 clients | Over 42 million paid, about 26 million in the US ("approximately 1 out of every 6"); TotalSource more than 770,000 worksite employees | $21,947.4M: Employer Services $14,831.4M, PEO Services $7,128.1M |
| **Paychex**, with Paycor (May 31, 2026) | Small business and mid-market, HR outsourcing, PEO, retirement | About 840,000 customers, about 800,000 of them payroll clients | "We pay 1 in 11 U.S. private sector workers"; about 2.6 million worksite employees supported by HR Outsourcing Solutions | $6,512.0M: Management Solutions $4,867.9M, PEO and Insurance Solutions $1,433.2M |
| **Workday** (January 31, 2026) | Enterprise HCM and finance | "More than 11,500 organizations," "more than 65% of the Fortune 500" | "More than 75 million users under contract" | $9,552M, of which subscription $8,833M |
| **Paycom** (December 31, 2025) | Mid-market HCM | 39,199 clients; 20,321 by parent company grouping | Not reported as workers paid | $2,051.7M |
| **Paylocity** (June 30, 2026) | Mid-market HCM | About 44,400 | Not reported as workers paid | $1,771.3M |
| **Dayforce** (December 31, 2024, last 10-K before going private) | Enterprise HCM | 6,876 live Dayforce customers | Not compared | $1,760.0M |
| **Insperity** (December 31, 2025) | PEO | Not compared; client retention 83% | 310,089 average worksite employees paid per month | $6,812M (the markup on $45,565M of gross billings) |
| **TriNet** (December 31, 2025) | PEO and ASO | Not compared | 333,886 average worksite employees; about 39,700 ASO users | $5,010M |

Three patterns run through the table:

- **Two giants and a long tail.** ADP's revenue is more than three times Paychex's and more than ten times any mid-market specialist's, and ADP alone pays about one in six US workers while Paychex pays about one in eleven.
- **Everyone counts differently.** ADP counts clients and workers paid, Paycom counts clients two ways, Workday counts organizations and users under contract, PEOs count worksite employees as an average or at year end. None of these are the same unit, and a comparison across rows is a comparison of definitions first ([What Gets Counted](#what-gets-counted)).
- **The big names span segments.** ADP sells RUN to small businesses, Workforce Now to the mid-market, enterprise suites, a PEO and global payroll; Paychex sells payroll, HR outsourcing, a PEO and 401(k) recordkeeping. A company's segment is a property of each product, not of the company.

## Private Players by What They Publish

Many of the companies employers know best publish no audited figures. What follows is what each states on its own pages or in a public filing, dated; self-reported marketing figures are labeled:

| Company | What it is | What's public |
| --- | --- | --- |
| **Check** | Embedded payroll API for vertical software | "1 Million+ employees paid," "50,000+ businesses," "$15 Billion+ processed annually" (self-reported, November 2026) |
| **Deel** | EOR, contractor management, global payroll, US PEO | "40,000+ companies," "650,000+ workers hired," "$17.3B processed payments," 150 countries (self-reported, undated about page); EOR from $599 and US PEO at $125 per employee per month |
| **Gusto** | Small business payroll, HR and benefits; Gusto Embedded for partners | No filings; its developer documentation publishes the embedded API, payroll speeds and partner terms |
| **Justworks** | PEO | More than 9,000 customers and over 160,000 worksite employees at May 31, 2022, in an S-1 it withdrew in July 2022; CPEO entities on the IRS list |
| **Oyster** | EOR | EOR at $699 per employee per month |
| **Remote** | EOR, contractor management, payroll | EOR from $599 per employee per month on annual contracts |
| **Rippling** | HR, IT and payroll on one employee record | Plans "start at $8 per employee per month, with a monthly base fee"; no customer or revenue figures on its about page |
| **UKG** | Enterprise HCM and workforce management | No filings |
| **Zeal** | Embedded payroll API | "Multi-jurisdiction tax handling across all 50 states"; "automatically batches, processes, and settles funds on the pay date - and files taxes on the employer's behalf" |

A gap like UKG's matters for the book's method: where a company publishes nothing, the volume describes the segment from companies that do and names the private one only for what it states itself. <!-- source-gap: wf-private-scale | missing | customer, worker and revenue figures for Gusto, Rippling and UKG | closes with: a company newsroom, filing or audited disclosure with dated figures | checked: 2026-11-09 -->

## The Segments

**Small business.** Self-serve or lightly assisted payroll for employers with a few to a few dozen people, priced as a monthly base plus a per-person fee: Square Payroll at $35 plus $6, OnPay Payroll Essentials at $49 plus $6, QuickBooks Payroll bundled with accounting, RUN Powered by ADP, Paychex, Gusto. The buyer is the owner or the bookkeeper, sales are online or through accountants (OnPay's pricing page now addresses accounting partners and offers them a revenue share), and the product's job is to make the first payroll and the first tax filing work without a payroll department. Vertical point-of-sale vendors such as Square sell payroll to their own merchants.

**Mid-market.** Single-database suites for employers from dozens to a few thousand employees: Paycom, Paylocity, Paycor (now Paychex), ADP Workforce Now, isolved, UKG Ready and others, priced per employee per month with a base and modules. The buyer is HR or finance, the sale involves demos and an implementation project, and the product is payroll plus time, benefits administration, onboarding, performance and learning on one record.

**Enterprise HCM.** Global suites for large employers: Workday, Dayforce, Oracle HCM, SAP SuccessFactors, UKG Pro and ADP's enterprise products. Payroll is one module, often run natively in the largest countries and through partners in the rest: Workday introduced Workday GO Global Payroll in fiscal 2026 with ADP, Remote and Strada as global payroll partners. Sales cycles are long, implementations run through systems integrators, and the HCM is the record of truth that payroll, identity and benefits read from. The HRIS as Record of Truth covers that role.

**PEO.** Co-employment for small and mid-sized businesses: ADP TotalSource, Insperity, TriNet, Justworks, Paychex PEO and about 500 others (NAPEO counts 502 PEOs and about 233,000 client businesses). The buyer wants benefits and HR expertise more than software, and the price is a markup or a per-employee fee over the full employment cost. [PEOs & Co-Employment](/books/workforce/peos-and-co-employment) covers it.

**Employer of record.** Legal employment in countries where the client has no entity: Deel, Remote, Oyster, Papaya Global, Velocity Global, Globalization Partners and others, priced as a flat fee per worker per month. Employer of Record & Global Employment covers it.

**Embedded payroll.** Payroll engines sold as APIs and components to vertical software: Check, Gusto Embedded, Zeal and others. The buyer is a software company that wants payroll revenue and stickiness without becoming a payroll company; the employer signs the payroll partner's authorizations inside the platform's product. Embedded Payroll covers it.

Around these sit the layers other chapters cover: tax engines and filing services sold to anyone who runs payroll (ADP SmartCompliance, MasterTax, Symmetry, Vertex: Tax Engines & Filing Services), unified HR and payroll APIs that read from all of the above (Finch, Merge: Unified HR & Payroll APIs), and time, ATS, background check and benefits administration vendors that integrate with payroll.

## Consolidation

The landscape's recent deals, dated from filings and the companies' releases:

| Date | Deal | Terms | What it changed |
| --- | --- | --- | --- |
| October 1, 2024 | Paylocity completes its acquisition of Airbase | About $325 million (announced September 4, 2024) | Added to Paylocity's mid-market suite |
| October 2024 | ADP acquires WorkForce Software | Net cash outlay of $1,158.3 million | Workforce management software added to ADP's products |
| April 14, 2025 | Paychex completes its acquisition of Paycor | $22.50 a share in cash, about $4.1 billion enterprise value; over $80 million of expected fiscal 2026 cost savings | A mid-market HCM inside Paychex; Paycor contributed about 12 points of Paychex's 17% revenue growth in fiscal 2026 |
| September 2025 | Workday acquires Paradox | $1.1 billion | Added to Workday's HCM suite |
| November 2025 | Workday acquires Sana | $1.1 billion | Added to Workday's suite |
| February 4, 2026 | Thoma Bravo completes its acquisition of Dayforce | $70.00 a share in cash, about $12.3 billion (announced August 21, 2025, with an ADIA minority investment) | An enterprise HCM delisted from the NYSE and TSX; no further periodic reports |

Two directions show in the table. The suites buy breadth (time, spend, recruiting, AI) so one contract covers more of the employee lifecycle, and private equity takes public HCM companies private. A third, private companies buying each other, is harder to date from primary sources. <!-- source-gap: wf-private-deals | missing | dates and terms of 2025-2026 acquisitions by private payroll and HR companies (Gusto, Rippling, Deel, isolved and others) | closes with: each acquirer's press release | checked: 2026-11-09 -->

For a system, an acquisition is a data event, not a news item: a client's provider changes name and sometimes platform, contract terms carry over or don't, and integrations keyed to the old company's IDs need mapping. When a provider migrates acquired clients to its own platform, each client is a mid-year conversion with year-to-date to load (Changing Providers Mid-Year).

## What Gets Counted

Every headline number in the tables above has a definition, and comparisons fail on the definitions first:

- **Clients.** Paycom reports 39,199 clients and 20,321 "based on parent company grouping"; the first counts billing or tax entities, the second corporate families. ADP's "over 1.1 million clients" and Paychex's 840,000 "total customers" don't say which.
- **Workers paid.** ADP counts workers paid, including outside the US. Paychex states a share of US private sector workers.
- **Worksite employees.** Insperity's 310,089 is an average of worksite employees paid per month; TriNet reports the average (333,886) and year end (about 323,200); ADP gives TotalSource's year-end count. Paychex's 2.6 million "worksite employees" supported by HR Outsourcing Solutions is broader than co-employed PEO employees.
- **Users.** Workday's "users under contract" are seats a customer licensed, not workers paid by Workday.
- **Retention.** ADP reports Employer Services client revenue retention (92.1%) and estimates average client retention of about 13 years in Employer Services and about 6 in its PEO; Paychex reports payroll client retention of 82% to 83% of its beginning client base; Paycom reports annual revenue retention of 91% ("the percentage of revenues that we retain from our existing clients"); Paylocity says its annual revenue retention rate has been above 92% for three years; Insperity reports client retention of 83%. Client retention and revenue retention measure different things, and small business payroll loses clients that simply close.

A system that tracks the market or reports its own metrics stores each figure with its definition, the period and the source, and treats a changed definition as a new series ([Definitions as Code, Restatements as Rows](/books/user-generated-platforms/operating-metrics#definitions-as-code-restatements-as-rows)). Payroll & HR Metrics covers the operating metrics.

## The Buying Cycle

How employers buy differs by segment, and the cycle sets the dates the system has to handle:

- **Who decides.** In small business, the owner or the accountant, often in an afternoon. In the mid-market, HR and finance together, with demos, references and a security review. In enterprise, a selection project with consultants, followed by an implementation by a systems integrator that can take most of a year.
- **Contracts.** Paychex's customer agreements "generally have no specified contract period" and can be terminated by either party on 30 days' notice; Paycom's clients can cancel "for any or no reason" on 30 days' notice; ADP sells some products on contracts of "typically two to seven years." Small business and mid-market payroll is month to month in practice, which makes retention the business.
- **When.** A switch is cleanest at a calendar year boundary, when the old provider closes the year and files the W-2s and the new one starts with no year to date; next cleanest at a quarter boundary, when the old provider files the quarter's returns and the new one starts the next quarter. A mid-quarter start means two providers' data in one quarter's returns. Changing Providers Mid-Year covers the procedures.
- **What moves.** The employer's EIN, state accounts, deposit schedule and year-to-date totals stay the same: the employer is the same taxpayer. What changes is who is authorized to act for it: a new Form 8655 ends the prior reporting agent's authority "for tax periods beginning on or after" its effective date, while the prior agent keeps earlier periods (Rev. Proc. 2012-32, section 5.04), and each state's agent authorization changes the same way.

### Switching, Seen From the Provider Being Left

The provider an employer leaves has its own checklist, and embedded payroll APIs publish theirs as fields. Gusto Embedded's company suspension takes a `reason` (`switching_provider`, `shutting_down` and others), `leaving_for` ("Which competitor the company is joining instead," required when switching), whether Gusto should still file the quarterly and yearly forms (`file_quarterly_forms`, `file_yearly_forms`), and a `reconcile_tax_method` of `pay_taxes` or `refund_taxes`, which must be `refund_taxes` when switching to a new payroll provider: taxes collected for liabilities the new provider will pay go back to the employer rather than to the agency. Those four questions (why, to whom, who files what is left, what happens to money already collected) are the ones every provider answers when a client leaves, and the answers decide which filings and remittances stay on the old provider's calendar.

A worked switch of my own: an employer leaves its provider effective July 1, 2026, after paying wages on June 26. The old provider deposits the June 26 taxes (due July 1 for a semiweekly depositor paying on a Friday), files the second-quarter 941 by July 31, and files the state's second-quarter wage report. The new provider files the third and fourth quarters and the 2026 W-2s, which cover the whole year under the employer's EIN, so it loads January through June from the old provider's records before its first payroll. Any tax the old provider collected for a period it won't file is refunded to the employer or handed over, and both providers' authorization records show who owned which quarter.

## How to Build It

The landscape enters the data model in three places: which provider a company came from or left for, the published figures a provider tracks about its market, and the deals that change who owns which clients:

```sql
CREATE TABLE provider_profiles (           -- payroll and HR providers, as the market knows them
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  name                TEXT NOT NULL,
  parent_profile_id   UUID REFERENCES provider_profiles (id),   -- a brand under a parent
  segments            TEXT[] NOT NULL,        -- 'small_business', 'mid_market', 'enterprise_hcm',
                                              -- 'peo', 'eor', 'embedded', 'tax_filing', 'unified_api'
  ownership           TEXT NOT NULL CHECK (ownership IN ('public', 'private', 'pe_owned',
                        'subsidiary')),
  sec_cik             TEXT,                   -- for public filers
  cpeo                BOOLEAN NOT NULL DEFAULT FALSE,   -- from the IRS list, checked quarterly
  status              TEXT NOT NULL CHECK (status IN ('active', 'acquired', 'defunct'))
);

CREATE TABLE provider_metrics (            -- a published figure with its definition and source
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  provider_profile_id UUID NOT NULL REFERENCES provider_profiles (id),
  metric              TEXT NOT NULL,          -- 'clients', 'clients_parent_grouping',
                                              -- 'workers_paid', 'avg_wse', 'revenue_retention', ...
  definition          TEXT NOT NULL,          -- as the source states it
  value               NUMERIC NOT NULL,
  unit                TEXT NOT NULL,          -- 'count', 'usd', 'percent'
  period              DATERANGE NOT NULL,     -- the fiscal year or the as-of date
  source_url          TEXT NOT NULL,
  source_kind         TEXT NOT NULL CHECK (source_kind IN ('10k', '10q', 's1', 'press_release',
                        'company_page', 'self_reported')),
  retrieved_on        DATE NOT NULL,
  UNIQUE (provider_profile_id, metric, period, source_url)
);

CREATE TABLE provider_transactions (       -- acquisitions, take-privates, mergers
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  acquirer_profile_id UUID NOT NULL REFERENCES provider_profiles (id),
  target_profile_id   UUID NOT NULL REFERENCES provider_profiles (id),
  announced_on        DATE,
  completed_on        DATE,
  consideration       TEXT,                   -- '$22.50 a share in cash', ...
  enterprise_value    BIGINT,                 -- cents, when stated
  source_url          TEXT NOT NULL
);

ALTER TABLE companies
  ADD COLUMN segment                  TEXT CHECK (segment IN ('small_business', 'mid_market',
                                        'enterprise', 'peo_client', 'eor_client', 'embedded')),
  ADD COLUMN prior_provider_id        UUID REFERENCES provider_profiles (id),
  ADD COLUMN acquired_via_transaction_id UUID REFERENCES provider_transactions (id),
  ADD COLUMN churned_to_provider_id   UUID REFERENCES provider_profiles (id),
  ADD COLUMN churn_reason             TEXT;

ALTER TABLE employers
  ADD COLUMN prior_provider_id        UUID REFERENCES provider_profiles (id),
  ADD COLUMN provider_started_on      DATE;   -- the first period this provider filed for
```

Design notes:

- **Prior and next provider are facts about the company and the employer.** A conversion needs the prior provider to know what export to expect and who filed which quarters; churn analysis needs the next one. Both are captured at the moment they are known (the sales record, the suspension request) and never inferred later.
- **Metrics keep their definitions.** A figure without its definition, period and source can't be compared or restated; `provider_metrics` makes the definition part of the row, and a self-reported number is labeled as one.
- **Deals are dated rows.** A client acquired with a provider keeps `acquired_via_transaction_id`, so a migration cohort, a contract carried over from the acquired company and a change in support model are queries, not tribal knowledge.
- **The employer's start with a provider is a period boundary.** `provider_started_on` is the first period the provider files for, which ties to the authorization ranges in Who Runs Payroll: Agents & Liability and the year-to-date loads in Changing Providers Mid-Year ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).

## Auditing

- **Every published figure with its source and retrieval date,** so a board deck or a sales comparison can be traced to the filing it came from.
- **Every switch with its dates:** the prior provider, the first period filed, the last period the prior provider filed, and the authorization records for both.
- **Every departure with its answers:** reason, destination, who files the remaining quarter and year, and what happened to taxes already collected, as recorded at the time ([Audit Trails](/docs/building-blocks/audit-trails)).

## What This Means for the System You Build

- **Treat segment as a property of the product and the client,** since one provider sells into several.
- **Store every market figure with its definition, period and source,** and never compare two that don't share a definition.
- **Record the prior provider, the start period and the next provider** on the company and the employer.
- **Plan switches at year and quarter boundaries,** with authorization ranges that hand each period to exactly one filer.
- **Make leaving a structured request:** reason, destination, who files what remains and what happens to collected taxes.
- **Model acquisitions as dated events** that clients and contracts point back to.

## References

**Agency guidance and forms**

- [IRS: Rev. Proc. 2012-32, in Internal Revenue Bulletin 2012-34](https://www.irs.gov/irb/2012-34_IRB), a new reporting agent's authority for later tax periods and the prior agent's for earlier ones
- [IRS: Active CPEOs (as of August 2026)](https://www.irs.gov/pub/irs-sbse/active-cpeos.pdf), the Justworks entities and their effective dates

**Filings**

- [ADP: Form 10-K for the fiscal year ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/8670/000000867026000030/adp-20260630.htm), clients, workers paid, RUN and Workforce Now clients, ADP TotalSource, segment revenue, client revenue retention, average client retention and contract terms
- [ADP: Form 10-K for the fiscal year ended June 30, 2025](https://www.sec.gov/Archives/edgar/data/8670/000000867025000037/adp-20250630.htm), the October 2024 acquisition of WorkForce Software and its net cash outlay
- [Paychex: Form 10-K for the fiscal year ended May 31, 2026](https://www.sec.gov/Archives/edgar/data/723531/000119312526307785/payx-20260531.htm), customers, 1 in 11 US private sector workers, HR Outsourcing worksite employees, segment revenue, the Paycor contribution, client retention and contract terms
- [Paychex: Press release on completing the Paycor acquisition (Form 8-K exhibit)](https://www.sec.gov/Archives/edgar/data/723531/000095010325004790/dp227639_ex9901.htm), April 14, 2025, $22.50 a share, about $4.1 billion and expected cost savings
- [Workday: Form 10-K for the fiscal year ended January 31, 2026](https://www.sec.gov/Archives/edgar/data/1327811/000132781126000014/wday-20260131.htm), organizations, users under contract, Fortune 500 share, revenue, Workday GO Global Payroll and its partners, and the Paradox and Sana acquisitions
- [Paycom: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1590955/000119312526059372/payc-20251231.htm), clients by entity and by parent company grouping, revenue, revenue retention and its definition, cancellation on 30 days' notice
- [Paylocity: Form 10-K for the fiscal year ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/1591698/000159169826000069/pcty-20260630.htm), clients, revenue and revenue retention
- [Paylocity: Press release announcing the Airbase acquisition (Form 8-K exhibit)](https://www.sec.gov/Archives/edgar/data/1591698/000159169824000222/pcty-202408298xkexhibit991.htm), September 4, 2024, about $325 million
- [Paylocity: Press release on first quarter fiscal 2025 results (Form 8-K exhibit)](https://www.sec.gov/Archives/edgar/data/1591698/000159169824000276/pcty-20241030xex991.htm), the Airbase acquisition completed on October 1, 2024
- [Dayforce: Form 10-K for 2024](https://www.sec.gov/Archives/edgar/data/1725057/000095017025029980/day-20241231.htm), live customers and revenue
- [Dayforce: Press release announcing the Thoma Bravo agreement (Form 8-K exhibit)](https://www.sec.gov/Archives/edgar/data/1725057/000119312525184632/d949165dex991.htm), August 21, 2025, $70.00 a share, $12.3 billion and the ADIA investment
- [Dayforce: Press release on completing the Thoma Bravo acquisition (Form 8-K exhibit)](https://www.sec.gov/Archives/edgar/data/1725057/000114036126003628/ef20064744_ex99-2.htm), February 4, 2026
- [Insperity: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1000753/000100075326000011/nsp-20251231.htm), revenue, gross billings, average worksite employees and client retention
- [TriNet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/937098/000093709826000010/tnet-20251231.htm), revenue, average and year-end worksite employees and ASO users
- [Justworks: Form S-1/A (June 27, 2022)](https://www.sec.gov/Archives/edgar/data/1623414/000162828022018013/justworkss-1a4.htm), customers and worksite employees
- [Justworks: Registration withdrawal request (July 13, 2022)](https://www.sec.gov/Archives/edgar/data/1623414/000162828022018872/0001628280-22-018872-index.htm), the withdrawn IPO

**Vendor documentation**

- [Square: Payroll pricing](https://squareup.com/us/en/payroll/pricing), small business base and per-person pricing
- [OnPay: Pricing](https://onpay.com/pricing), Payroll Essentials pricing and the accounting partner program
- [Rippling: Pricing](https://www.rippling.com/pricing), plans from $8 per employee per month with a base fee
- [Rippling: About](https://www.rippling.com/about), no published customer or revenue figures
- [Deel: About](https://www.deel.com/about/), self-reported companies, workers hired, payments processed and countries
- [Deel: Pricing](https://www.deel.com/pricing/), EOR and US PEO prices
- [Remote: Employer of Record](https://remote.com/employer-of-record), EOR pricing
- [Oyster: Pricing](https://www.oysterhr.com/pricing), EOR pricing
- [Check](https://www.checkhq.com/), self-reported employees paid, businesses and annual volume
- [Zeal: Documentation](https://docs.zeal.com/), tax handling across all 50 states, settlement on the pay date and filing on the employer's behalf
- [Gusto Embedded: Suspend a company's account](https://docs.gusto.com/embedded-payroll/reference/post-companies-company_uuid-suspensions.md), suspension reasons, the competitor joined, remaining filings and the refund of collected taxes when switching

**In practice**

- [NAPEO: Industry statistics](https://www.napeo.org/what-is-a-peo/about-the-peo-industry/industry-statistics), the number of PEOs and client businesses
