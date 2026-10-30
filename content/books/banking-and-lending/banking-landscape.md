+++
title = "The Banking Landscape"
description = "US banks by size, credit unions, core and digital banking vendors, sponsor banks and BaaS, neobanks, nonbank lenders, and who bought whom as of October 2026."
category = "Banking & Lending Industry"
order = 2402
part = "The Business"
tags = ["banking", "lending", "core-banking", "baas", "neobanks", "market-size"]
+++

US banking is a long tail with a heavy head. Eighteen banks hold most of the industry's assets, a few thousand community banks and credit unions hold the relationships in most towns, and almost none of them write their own core software: three vendors run the systems of record for most of the institutions in the country, and a second layer of vendors sells the app, the account opening flow and the loan origination system on top. Around that sits a newer layer that borrows charters instead of holding them: neobanks and business banking apps on sponsor banks, lenders that originate through a bank partner and sell the loans, and spend platforms that underwrite cards a bank issues. Each layer keeps its own copy of the customer and the account, and the work of banking engineering is mostly keeping those copies agreeing.

The landscape moves. Banks merge and fail every quarter, vendors buy each other, fintechs apply for charters and lenders become banks. This chapter maps each layer from agency data and filings, records who owns whom as of October 2026, and ends with when to build any of it. It adds `institution_events`, `technology_providers` and `institution_providers` to [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model).

## Banks by Size

The FDIC's Quarterly Banking Profile is the standard count. At June 30, 2026 there were 4,238 FDIC-insured institutions (3,728 commercial banks and 510 savings institutions) with $26.5 trillion of assets and $20.7 trillion of deposits. The count fell by 41 in the second quarter alone: four banks opened, 36 merged into other banks, four were sold to institutions that aren't FDIC-insured, and one failed. A year earlier there were 4,421.

| Asset size | Institutions | Assets | Share of industry assets |
| --- | --- | --- | --- |
| Under $100 million | 543 | $34.0 billion | 0.1% |
| $100 million to $1 billion | 2,647 | $1,024.0 billion | 3.9% |
| $1 billion to $10 billion | 890 | $2,480.2 billion | 9.4% |
| $10 billion to $250 billion | 140 | $6,071.0 billion | 22.9% |
| Over $250 billion | 18 | $16,853.0 billion | 63.7% |

The shares are my arithmetic from the QBP's table. The 4,080 institutions under $10 billion hold 13.4% of the assets, and they are most of the sponsor banks, because Regulation II's debit interchange cap exempts issuers under $10 billion ([Interchange](/books/banking-and-lending/banking-business#interchange)). The FDIC separately counts 3,818 community banks, 90% of insured institutions, which earned a 3.81% net interest margin in the quarter against 3.32% for the industry.

The Federal Reserve's ranking of domestically chartered commercial banks, as of June 30, 2026, puts the head in order:

| Rank | Bank | Consolidated assets |
| --- | --- | --- |
| 1 | JPMorgan Chase Bank, N.A. | $4,091.3 billion |
| 2 | Bank of America, N.A. | $2,654.6 billion |
| 3 | Citibank, N.A. | $1,976.2 billion |
| 4 | Wells Fargo Bank, N.A. | $1,907.9 billion |
| 5 | Goldman Sachs Bank USA | $758.8 billion |
| 6 | U.S. Bank, N.A. | $705.6 billion |
| 7 | Capital One, N.A. | $662.2 billion |
| 8 | PNC Bank, N.A. | $609.8 billion |
| 9 | Truist Bank | $548.3 billion |
| 10 | The Bank of New York Mellon | $425.1 billion |

The four largest hold about 40% of the QBP's industry assets (my arithmetic, across two releases that define their populations slightly differently). For software, size changes almost everything: the largest banks build and run their own systems, regionals buy and customize, and community banks rent a vendor's core in the vendor's data center. [Charters & Regulators](/books/banking-and-lending/charters-and-regulators#who-examines-whom) covers which agency supervises each kind of charter.

## Credit Unions

NCUA's quarterly data counts 4,214 federally insured credit unions at June 30, 2026 (2,649 federal and 1,565 state-chartered), down from 4,370 a year earlier, serving 146.1 million members with $2.50 trillion of assets, $1.76 trillion of loans and $2.13 trillion of shares and deposits, of which $1.91 trillion insured. Credit unions run on their own core product lines (Jack Henry's Symitar and Fiserv's Portico among them, below). The largest by far is Navy Federal, which reports $197.1 billion of assets at December 31, 2025 and 15.3 million members.

Two differences matter to a builder. Credit unions call their deposits shares and their customers members, and each has a field of membership that limits who may join, so eligibility is an account opening rule. NCUA reports net interest income as a share of average assets rather than earning assets, so a credit union's "margin" and a bank's NIM don't compare directly (Bank Economics & Balance Sheet Risk).

## How the Platforms Do It

As of October 2026, from filings and vendor pages, the core and the systems around it:

| Vendor | Layer | What is public (latest reported year) |
| --- | --- | --- |
| **Fiserv** | Cores, digital banking, card and payment processing | Account processing on DNA, Finxact, Premier, CoreAdvance, Portico (credit unions) and Signature, mostly Fiserv-hosted; $21.2 billion of 2025 revenue, with the Financial segment at $9.7 billion |
| **FIS** | Cores, transaction and card processing | Banking Solutions $7.3 billion of $10.7 billion 2025 revenue; bought Global Payments' Issuer Solutions business, closed January 9, 2026 |
| **Jack Henry** | Cores, digital banking (Banno), payments | SilverLake at 520 banks, CIF 20/20 at 260, Core Director at over 170, Symitar at about 715 credit unions; about 1,670 core clients; $2.38 billion of fiscal 2025 revenue |
| **Temenos** | Core, sold as software or SaaS | Temenos Core, "composable" and cloud-native, at banks in 150+ countries; names Regions, EQ Bank and others |
| **Thought Machine** | Cloud-native core (Vault Core) | One ledger for every product, products defined as code; names Lloyds, SEB, Standard Chartered, Intesa, Arvest and others |
| **10x Banking** | Cloud-native core | Names Chase UK, Westpac, The Co-operative Bank, West Brom and Old Mutual; claims 99.99% uptime |
| **Mambu** | SaaS core | A composable cloud core with public API documentation; claims customers in 65+ countries |
| **Q2** | Digital banking, and Helix as a cloud core and BaaS platform | 457 installed digital banking customers, over 1,200 financial institution customers, about 27.3 million registered users |
| **Alkami** | Digital banking, account opening (MANTL) | 301 institutions on its digital banking platform, 22.4 million registered users, $443.6 million of 2025 revenue; bought MANTL in March 2025 |
| **nCino** | Origination and onboarding on Salesforce | Over 2,700 customers, about 1,500 of them depository institutions; $594.8 million of fiscal 2026 revenue |

Four patterns run through the table:

- **Three vendors run most US cores.** Fiserv, FIS and Jack Henry sell several cores each, most of them acquired over decades, and an institution's core is typically hosted in the vendor's data center on a long contract. Jack Henry's own 10-K puts SilverLake at nearly 12% of domestic banks under $55 billion. Core Banking Systems covers what each kind of core does.
- **Cloud-native cores win greenfield and big banks first.** Thought Machine, 10x and Mambu publish their customer lists, and the names are new digital banks, large banks building a second core beside the first, and banks outside the US. A US community bank conversion to one is rare, and Core Modernization & Conversions covers why.
- **The layer above the core is a separate market.** Digital banking (Q2, Alkami, Jack Henry's Banno, the core vendors' own), account opening (Alkami's MANTL) and origination (nCino, ICE Encompass for mortgages, Blend, MeridianLink) are sold to institutions that keep their core, and each integrates with every core it supports. Digital & Mobile Banking and [Loan Origination](/books/banking-and-lending/loan-origination) cover them.
- **Cores are becoming BaaS platforms.** Q2 calls Helix "cloud-native core processing and BaaS"; Fiserv's Finxact also runs its embedded finance ledger. The same software that runs a bank's own accounts now runs programs on that bank's charter.

## Sponsor Banks and BaaS

A fintech that doesn't want a charter rents one. The sponsor bank holds the deposits and issues the cards and loans; the fintech designs, markets and services the product as program manager; sometimes a middleware platform sits between them and keeps the subledger. The public record shows the arrangement everywhere:

| Program | Bank or banks | Source of the fact |
| --- | --- | --- |
| Chime (consumer accounts, debit and secured credit cards) | The Bancorp Bank, N.A. and Stride Bank, N.A. | Chime's 10-K |
| Mercury (business accounts) | Choice Financial Group and Column N.A.; "Mercury is a fintech company, not an FDIC-insured bank" | Mercury's pricing page |
| Affirm (consumer loans) | Celtic Bank originates substantially all US platform loans; Lead Bank also originates; Cross River Bank holds the Affirm Money account | Affirm's 10-K |
| Stripe Capital (business loans in the US) | Celtic Bank or Lead Bank; merchant cash advances from YouLend | Stripe's documentation |
| Shopify Capital (US) | WebBank | Shopify's help center |

The banks on the other side are mostly small. Coastal Financial, whose CCBX segment is its BaaS business, had 28 partners at December 31, 2025 and $1.81 billion of CCBX loans, 48.1% of all its loans, on total assets of $4.74 billion: a sponsor bank's balance sheet can be half fintech. Column runs the opposite model, a national bank that "built our core, ledger, and tech stack from scratch" and sells direct access with "freedom from vendors and middleware." The middleware model is the one that broke: when Synapse failed in 2024, the records of whose money sat at which bank didn't match the banks' records, and the CFPB's case against it was about exactly that. [Banking as a Service](/books/banking-and-lending/banking-as-a-service), [Program Ledgers & the Synapse Lesson](/books/banking-and-lending/program-ledgers) and [Sponsor Bank Oversight](/books/banking-and-lending/sponsor-bank-oversight) cover the roles, the ledgers and the consent orders; [Sponsor Banks Under Scrutiny](/books/payments/card-issuing#sponsor-banks-under-scrutiny) covers the card side.

## Neobanks

Consumer fintechs split by whether they hold a charter:

- **Program managers on sponsor banks.** Chime reported 9.5 million active members and $2,186.8 million of 2025 revenue, 49% of it debit interchange, earned on cards its two partner banks issue. Block's Cash App had 59 million monthly transacting actives in December 2025; Block also owns Square Financial Services, a Utah industrial bank.
- **Fintechs that became banks.** SoFi announced on January 18, 2022 that the OCC and the Federal Reserve had approved it becoming a bank holding company by acquiring Golden Pacific Bancorp, which became SoFi Bank, N.A.; at the end of 2025 SoFi had 13.7 million members, $37.5 billion of deposits and $3,613.4 million of 2025 net revenue. Above $10 billion, SoFi's debit interchange is capped, and its model leans on deposit funding for its loans instead.
- **Applicants.** Revolut won the OCC's conditional approval for Revolut Bank US in September 2026, about six months after applying, with at least $95 million of paid-in capital and a 10% tier 1 leverage ratio for three years among the conditions, and Federal Reserve and FDIC approvals still to come.

[Neobanks & Consumer Fintech](/books/banking-and-lending/neobanks) covers the revenue models from the filings and the UK banks that hold full licenses from the start.

## Nonbank Lenders

Much of US consumer credit is made outside banks or through them only on paper:

- **Mortgages.** Independent mortgage companies made 63.1% of home-purchase loans and 67.1% of refinances in 2023 HMDA data, the latest year the CFPB has summarized. UWM, which originates only through brokers, made $163.4 billion of loans in 2025; Rocket completed its acquisition of Mr. Cooper on October 1, 2025, combining origination with a servicing portfolio of nearly 10 million homeowners. A 2024 share figure appears only in industry press so far. <!-- source-gap: hmda-imc-share-2024 | secondary | independent mortgage companies' share of 2024 originations | closes with: the CFPB's or FFIEC's summary of 2024 HMDA data | checked: 2026-10-29 -->
- **Consumer installment and BNPL.** Affirm facilitated $50.2 billion of GMV in fiscal 2026 for about 27.8 million active consumers, originating through its bank partners. Upstart's marketplace originated $4.23 billion across 558,014 loans in the second quarter of 2026 for more than 100 bank and credit union partners.
- **Lenders that became banks.** LendingClub, which described itself in its 2025 10-K as "a leading nationally chartered digital bank" (LendingClub Bank, N.A.), renamed itself Happen, Inc. in June 2026, as its EDGAR record now shows; Upstart received conditional approval for Upstart Bank, N.A. in July 2026 (below).

[The Lending Business](/books/banking-and-lending/lending-business) covers how each model makes money, and Lender Licensing & Bank Partnerships covers the licenses and the true lender question that push lenders toward charters.

## Who Owns Whom: Recent Moves

Dated facts age fast; this is the landscape as of October 2026, from each company's or agency's release, filing or the coverage cited:

| Date | Move | Why it matters |
| --- | --- | --- |
| March 10, 2023 | Silicon Valley Bank closed; on March 26 First-Citizens Bank & Trust agreed to assume its deposits and loans from the FDIC | Uninsured deposit runs become a design input ([When Banks Fail](/books/banking-and-lending/bank-failures#anatomy-of-a-run)) |
| March 2025 | Alkami acquires MANTL | Digital banking and account opening consolidate |
| May 18, 2025 | Capital One completes its acquisition of Discover, adding the Discover, PULSE and Diners Club networks | A bank owns a card network |
| October 1, 2025 | Rocket completes its acquisition of Mr. Cooper | Origination and servicing combine at scale |
| December 12, 2025 | The OCC conditionally approves new national trust banks for Circle and Ripple and conversions for BitGo, Fidelity Digital Assets and Paxos | Digital asset firms take bank charters without insured deposits |
| January 9, 2026 | FIS closes its purchase of Global Payments' Issuer Solutions business | A core vendor adds card issuer processing |
| January 2026 | The OCC conditionally approves a national bank for Nubank | A foreign neobank charters in the US |
| April 7, 2026 | Capital One completes its acquisition of Brex, announced at $5.15 billion | A bank buys a corporate card and spend platform |
| April 2026 | The OCC conditionally approves Mercury's national bank | A business banking program manager moves toward its own charter |
| June 2026 | LendingClub renames itself Happen, Inc. | A marketplace lender rebrands as a bank |
| July 10, 2026 | Circle's national trust bank receives final approval | The first of the December 2025 trust approvals completes |
| July 2026 | The OCC conditionally approves Upstart Bank, N.A. | A lending marketplace applies to hold loans on its own charter |
| September 2026 | The OCC conditionally approves Revolut Bank US | A program on US sponsor banks moves toward a charter |

Failures continue at a small-bank pace: the FDIC's list shows two in 2025 (Pulaski Savings Bank in January, The Santa Anna National Bank in June) and six in 2026 through September, the latest Nano Banc on September 25, 2026, each sold to another bank.

Three patterns run through the list. **Charters are the exit from sponsorship:** Mercury, Revolut, Nubank and Upstart applied for what SoFi bought in 2022, trading a partner's compliance program for their own and Regulation II's exemption for capital requirements ([Starting a Bank](/books/banking-and-lending/starting-a-bank#capital-liquidity-and-the-three-year-plan)). **Banks buy fintechs:** Capital One bought a network and a spend platform within a year. **Vendors bundle:** FIS added issuer processing, Alkami added account opening, Rocket added servicing; a buyer of one product increasingly buys a roadmap tied to a larger suite.

## Build, Buy or Partner

Almost every institution should buy its core; the question is what else.

**Buy** the systems of record that examiners already understand and that every institution needs the same way: the core, card processing, the regulatory reporting packages, and the networks. A community bank that writes its own core takes on a vendor's whole engineering and audit burden for no customer-visible gain.

**Partner** when the product is new and the charter is the hard part: a program on a sponsor bank, a loan program through a bank partner, a BaaS platform for the first year. The trade is control and margin for speed, and the partner's consent orders become your roadmap.

**Build** where the product is the difference: the digital experience, the decision engine, the subledger a program runs on, the servicing rules no vendor models, or the whole stack when the institution is itself the platform (Column's model, or a large bank's second core). Banking Architecture covers building it.

## How to Build It

Institutions change identity more often than a schema expects: they merge, fail, convert charters and change cores, and each event moves routing numbers, account numbers and vendors. The core model's `institutions` row gets a history, and the vendors each one runs get rows of their own:

```sql
CREATE TABLE institution_events (          -- mergers, failures, charter changes, conversions
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id        UUID NOT NULL REFERENCES institutions (id),
  kind                  TEXT NOT NULL CHECK (kind IN ('opened', 'merged_into', 'acquired',
                          'failed', 'charter_conversion', 'name_change', 'core_conversion',
                          'closed')),
  counterparty_id       UUID REFERENCES institutions (id),  -- the acquirer or assuming bank
  effective_date        DATE NOT NULL,
  routing_numbers_moved TEXT[] NOT NULL DEFAULT '{}',
  source_url            TEXT NOT NULL,       -- the FDIC, NCUA, OCC or company release
  recorded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE technology_providers (        -- core, digital, origination and processing vendors
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  name                  TEXT NOT NULL UNIQUE,
  parent_id             UUID REFERENCES technology_providers (id),  -- a product line's owner
  kind                  TEXT NOT NULL CHECK (kind IN ('core', 'digital_banking',
                          'account_opening', 'origination', 'card_processing',
                          'payments_hub', 'baas', 'data'))
);

CREATE TABLE institution_providers (       -- which system each institution runs, and when
  institution_id        UUID NOT NULL REFERENCES institutions (id),
  provider_id           UUID NOT NULL REFERENCES technology_providers (id),
  role                  TEXT NOT NULL,       -- 'deposit_core', 'loan_core', 'card_processor', ...
  hosting               TEXT CHECK (hosting IN ('vendor_hosted', 'in_house', 'saas',
                          'third_party_hosted')),
  valid_during          TSTZRANGE NOT NULL,
  contract_ref          TEXT,
  PRIMARY KEY (institution_id, role, valid_during)
);
```

Design notes:

- **Keep the regulators' identifiers.** `institutions.fdic_cert`, `ncua_charter` and `rssd_id` are how the QBP, NCUA's call report data and the Fed's releases name an institution; joining public data on them is how a builder sizes a market or checks a partner, never on a bank's name, which changes.
- **A merger is an event, not an update.** When one bank merges into another, its row stays with status `merged`, an `institution_events` row points at the survivor, and routing numbers move on a date. Payments still arrive on the old routing number for months, and the event is what lets the system find the account.
- **The core is effective-dated.** A core conversion is an `institution_providers` change on a weekend, and file formats, cutoffs and posting behavior change with it, so anything that integrates with the institution reads the provider in force on the business date ([Temporal Data](/docs/database/temporal-data#effective-dated-rows)).

## Auditing

- **Where each fact came from.** Every institution event with its source URL and effective date, so a routing change or a failure can be traced to the agency's release.
- **Which vendor ran what, when.** Every institution's core, card processor and digital platform over time, because an exam finding, an outage or a conversion error is investigated against the system in force that day (Security, Resilience & Incident Notice covers vendor concentration as a risk).
- **Market figures with their definitions.** Any count, asset total or share used in a decision, kept with its release and as-of date, since the FDIC, NCUA and the Fed count different populations.

## What This Means for the System You Build

- **Expect the institution to run vendors' systems,** usually a hosted core from one of three vendors, with separate vendors above it.
- **Key institutions by FDIC certificate, NCUA charter number and RSSD ID,** and join public data on them.
- **Record mergers, failures and conversions as dated events,** and keep routing numbers resolvable after they move.
- **Effective-date the vendor an institution runs,** so integrations follow a core conversion instead of breaking on it.
- **Read the partner's size and record before the contract,** since a sponsor bank's exemption, capital and consent orders become your constraints.
- **Buy what examiners already understand, partner for the charter, and build only where the product is the difference.**

## References

**Regulators and data**

- [FDIC: Quarterly Banking Profile, second quarter 2026](https://www.fdic.gov/news/speeches/2026/fdic-quarterly-banking-profile-second-quarter-2026), net income, margins, problem banks and the Deposit Insurance Fund
- [FDIC: Quarterly Banking Profile, second quarter 2026 (full report)](https://www.fdic.gov/quarterly-banking-profile/quarterly-banking-profile-second-quarter-2026.pdf), the institution count and its changes, assets and deposits by asset size, community banks
- [Federal Reserve: U.S. domestically chartered commercial banks ranked by consolidated assets](https://www.federalreserve.gov/releases/lbr/current/), the ten largest as of June 30, 2026
- [NCUA: Quarterly Credit Union Data Summary, 2026 Q2](https://www.ncua.gov/files/publications/analysis/quarterly-data-summary-2026-Q2.pdf), credit union counts, members, assets, loans and shares
- [Navy Federal Credit Union: Corporate fact sheet](https://www.navyfederal.org/about/corporate-fact-sheet.html), assets and members
- [FDIC: Silicon Valley Bank](https://www.fdic.gov/resources/resolutions/bank-failures/failed-bank-list/silicon-valley.html), the closing and First-Citizens' assumption
- [FDIC: Failed Bank List](https://www.fdic.gov/bank-failures/failed-bank-list), failures in 2025 and 2026
- [OCC: Conditional approvals of national trust bank charters, December 12, 2025](https://www.occ.gov/news-issuances/news-releases/2025/nr-occ-2025-125.html), Circle, Ripple, BitGo, Fidelity Digital Assets and Paxos
- [CFPB: Summary of 2023 data on mortgage lending](https://www.consumerfinance.gov/data-research/hmda/summary-of-2023-data-on-mortgage-lending/), independent mortgage companies' shares of purchase and refinance loans
- [CFPB: Synapse Financial Technologies, Inc. enforcement action](https://www.consumerfinance.gov/enforcement/actions/synapse-financial-technologies-inc/), the failure to keep records of where consumers' funds were
- [SEC EDGAR: Happen, Inc. filings](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=1409970&type=8-K), the name change from LendingClub

**Filings**

- [Fiserv: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/798354/000079835426000009/fi-20251231.htm), account processing platforms and revenue by segment
- [FIS: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1136893/000113689326000013/fis-20251231.htm), Banking Solutions revenue and the Issuer Solutions closing
- [Jack Henry: Form 10-K for fiscal 2025](https://www.sec.gov/Archives/edgar/data/779152/000077915225000055/jkhy-20250630.htm), core platforms, client counts and revenue
- [Q2 Holdings: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1410384/000141038426000006/qtwo-20251231.htm), digital banking customers, registered users and Helix
- [Alkami Technology: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1529274/000152927426000009/alk-20251231.htm), clients, registered users, revenue and the MANTL acquisition
- [nCino: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1902733/000190273326000022/ncno-20260131.htm), customers and revenue
- [Chime Financial: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1795586/000179558626000013/chym-20251231.htm), active members, revenue, debit interchange and partner banks
- [Block: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1512673/000162828026012254/xyz-20251231.htm), Cash App monthly transacting actives and Square Financial Services
- [SoFi Technologies: Fourth quarter 2025 results](https://s27.q4cdn.com/749715820/files/doc_financials/2025/q4/2025-Q4-Earnings-Release.pdf), members, deposits and net revenue
- [Affirm Holdings: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/0001820953/000162828026059279/afrm-20260630.htm), GMV, active consumers and originating banks
- [Upstart Holdings: Second quarter 2026 results](https://www.sec.gov/Archives/edgar/data/0001647639/000164763926000062/upst991prq22026.htm), originations and bank and credit union partners
- [LendingClub: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1409970/000140997026000018/lc-20251231.htm), its self-description and its bank subsidiary
- [Coastal Financial: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1437958/000143795826000013/ck1437958-20251231.htm), CCBX partners, CCBX loans and total assets
- [Capital One: Completion of the Discover acquisition (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/927628/000119312525122059/d934475dex991.htm), the May 18, 2025 closing and the networks
- [Rocket Companies: Completion of the Mr. Cooper acquisition (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1805284/000095014225002622/eh250684731_ex9901.htm), the October 1, 2025 closing and the combined servicing portfolio
- [UWM Holdings: Fourth quarter and full year 2025 results](https://investors.uwm.com/news/financial-news/news-details/2026/UWM-Holdings-Corporation-Announces-Fourth-Quarter--Full-Year-2025-Results/default.aspx), 2025 originations

**Company releases and vendor pages**

- [Capital One: Capital One to acquire Brex](https://capitalone.com/about/newsroom/capital-one-to-acquire-brex/), the $5.15 billion valuation
- [Capital One: Capital One completes acquisition of Brex](https://www.capitalone.com/about/newsroom/capital-one-completes-acquisition-of-brex/), the April 7, 2026 closing
- [SoFi: SoFi receives regulatory approval to become a national bank](https://www.sofi.com/press/sofi-receives-regulatory-approval-become-national-bank/), the Golden Pacific acquisition and SoFi Bank, N.A.
- [Temenos: Core banking](https://www.temenos.com/products/core-banking/), Temenos Core, countries and named customers
- [Thought Machine: Vault Core](https://www.thoughtmachine.net/vault-core), the single ledger and named customers
- [10x Banking](https://www.10xbanking.com/), named customers and uptime claim
- [Mambu](https://mambu.com/), the composable core and countries served
- [Mercury: Pricing](https://mercury.com/pricing), partner banks, the not-a-bank disclosure and the insurance claim
- [Column](https://column.com/), the national bank with its own core and ledger and direct access
- [Stripe: How Stripe Capital works](https://docs.stripe.com/capital), Celtic Bank and Lead Bank loans and YouLend merchant cash advances
- [Shopify: Shopify Capital in the United States](https://help.shopify.com/en/manual/finance/shopify-capital/united-states), WebBank as issuer

**In practice**

- [Banking Dive: Revolut nabs conditional OCC charter](https://www.bankingdive.com/news/revolut-nabs-conditional-occ-charter/829703/), the approval, its conditions and the remaining approvals
- [Davis Wright Tremaine: OCC signals digital asset charter momentum (August 2026)](https://www.dwt.com/blogs/financial-services-law-advisor/2026/08/occ-signals-digital-asset-charter-momentum), the 2026 conditional approvals for Nubank, Mercury and Upstart, and Circle's final approval
