+++
title = "The Insurance Landscape"
description = "The US insurance market in NAIC numbers: premium by line and group, concentration, brokers by revenue, the insurtechs' filings, core vendors and take-privates."
category = "Insurance Industry"
order = 2702
part = "The Business"
tags = ["insurance", "property-and-casualty", "life-insurance", "market-structure", "business-models"]
+++

US insurance is one industry in the statistics and dozens in practice. The NAIC adds up every insurer's annual statement into one market of $1.11 trillion of property and casualty premium and over $800 billion of life and annuity premium, but the companies inside those totals barely compete with one another: a personal auto writer that sells through its own app, a carrier whose 19,000 agents sell only its policies, an excess and surplus lines carrier that sees only what wholesale brokers send it, a state workers' compensation fund, a life insurer owned by an asset manager. They file different statements, sell through different channels, buy different software and report different measures to investors, and a number from one of them means something only next to the definition it was computed under.

This chapter surveys the market as of November 2026, from the sources that measure it: NAIC's 2025 market share reports (built from annual statements filed by March 18, 2026), the 2025 filings of the carriers and brokers, the insurtechs' own shareholder letters, and the core vendors' filings and deal announcements. It extends `insurers` from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) with `market_share_snapshots` and `corporate_transactions`. How the money behind these figures works (written and earned premium, the ratios, float) is [How Insurers Make Money](/books/insurance/how-insurers-make-money); the legal forms the companies take are [Who Carries the Risk](/books/insurance/who-carries-the-risk).

## How the Platforms Do It

The largest P&C groups by 2025 direct premiums written, from NAIC's countrywide table, with how each sells where its own filings or pages say so:

| Rank | Group (NAIC group code) | 2025 direct premiums written | Share | Direct loss and DCC to earned | How it sells |
| --- | --- | --- | --- | --- | --- |
| 1 | **State Farm** (176) | $115.28B | 10.39% | 73.19% | Captive agents; its site cites 19,000 agents |
| 2 | **Progressive** (155) | $84.20B | 7.59% | 59.12% | More than 40,000 independent agencies and direct; direct was 57% of personal vehicle volume in 2025 |
| 3 | **Berkshire Hathaway** (31) | $64.51B | 5.81% | 65.43% | |
| 4 | **Allstate** (8) | $59.47B | 5.36% | 57.07% | Over 27,400 exclusive agents and licensed sales professionals, about 58,700 independent agent locations and about 2,200 direct sales representatives |
| 5 | **Travelers** (3548) | $43.18B | 3.89% | 56.80% | Thousands of independent agents and brokers |
| 6 | **Liberty Mutual** (111) | $42.35B | 3.82% | 53.60% | |
| 7 | **USAA** (200) | $38.54B | 3.47% | 66.82% | |
| 8 | **Chubb** (626) | $35.27B | 3.18% | 63.11% | |
| 9 | **Farmers** (69) | $29.59B | 2.67% | 54.08% | |
| 10 | **Zurich** (212) | $18.90B | 1.70% | 72.08% | |

Three things the table shows that a system builder has to know:

- **The NAIC counts groups, built from companies.** Every row is a group code summing many company codes (State Farm's group is 176, Progressive's 155), and a group's companies are licensed in different states, write different lines and may file different rates. The insurer on a policy is always one company, never the group ([The Core Data Model](/books/insurance/insurance-business#the-core-data-model)).
- **Loss ratios on this table are direct, before reinsurance and before most expenses.** State Farm's 73.19% and Progressive's 59.12% are direct losses plus defense and cost containment over direct earned premium; they say nothing yet about profit, which needs expenses, reinsurance and LAE ([The Ratios That Run the Business](/books/insurance/how-insurers-make-money#the-ratios-that-run-the-business)).
- **Channel is a company choice, not an industry fact.** The top five use five different mixes of captive agents, independent agents and direct sales, and one company can use all three ([Agents, Brokers & Channels](/books/insurance/agents-brokers-and-channels)).

## The Market in Numbers

NAIC's 2025 market share report, based on filings received by March 18, 2026 (an estimated 98.25% of P&C filers), puts US property and casualty direct premiums written at **$1,109.79 billion** and direct premiums earned at $1,087.13 billion, with a direct loss ratio of 57.03% and 60.68% including DCC. Travelers' 2025 10-K counts about 1,100 P&C groups and 2,600 companies in the US, and the concentration sits at the top: the five largest groups wrote 33.04% of premium, the ten largest 47.87% and the 25 largest 65.71%.

Life is a separate market with its own statement blank. NAIC's life and fraternal market share report for 2025 (an estimated 97.50% of filers) shows:

| Segment | 2025 direct premium | Leading groups (share) |
| --- | --- | --- |
| Life insurance | $210.24B | New York Life 7.40%, Northwestern Mutual 6.75%, MetLife 6.19%, Prudential 5.97%, Lincoln 4.36%; top ten 47.28% |
| Annuities | $618.27B | Apollo (Athene) 5.93%, New York Life 5.42%, Nationwide 4.85%, MassMutual 4.67%, AIG 4.65%; top ten 45.05% |
| Accident and health on the life blank | $233.71B | CVS 26.10%, UnitedHealth 25.94%, MetLife 4.91%, Unum 3.06%, Mutual of Omaha 2.88% |

The annuity leader is a group owned by an asset manager, and Brookfield Wealth Solutions (16th) and Global Atlantic (20th) are in the top 20; that ownership model is the subject of [Life Reserves, Capital & Private Equity](/books/insurance/life-reserves-and-capital). The accident and health column is mostly health insurers filing on the life blank, which this volume leaves to [Health Tech](/books/health-tech/payers-and-plans) ([Why Health Insurance Isn't Here](/books/insurance/insurance-business#why-health-insurance-isn-t-here)); its disability and supplemental writers (Unum, Aflac, Guardian) belong to [Group Life & Disability](/books/insurance/group-life-and-disability).

NAIC's annual life industry commentary reports a different annuity figure for the same year, $546.4 billion, because it is built on a different basis from the market share tables. Two NAIC numbers for "2025 annuities" is the normal state of insurance data: every figure needs its source, its basis and its as-of date stored with it, which is what `market_share_snapshots` below does.

### By Line

| Statement line | 2025 direct premiums written | Direct loss and DCC to earned | Top five groups (share) |
| --- | --- | --- | --- |
| Private passenger auto (total) | $371.04B | 63.36% | State Farm 18.64%, Progressive 18.60%, Berkshire Hathaway 11.56%, Allstate 10.15%, USAA 6.19% |
| Homeowners multiple peril (04) | $188.69B | 56.59% | State Farm 18.69%, Allstate 9.42%, USAA 7.02%, Liberty Mutual 5.51%, Farmers 5.46% |
| Other liability (17.1 to 18.2) | $139.51B | 78.26% | Chubb 7.19%, Travelers 4.66%, W. R. Berkley 3.98%, Berkshire Hathaway 3.95%, Fairfax 3.47% |
| Commercial auto (total) | $77.11B | 73.61% | Progressive 13.20%, Travelers 5.46%, Berkshire Hathaway 5.05%, Old Republic 4.35%, Liberty Mutual 3.64% |
| Workers' compensation (16) | $56.11B | 56.00% | Hartford 6.65%, Travelers 6.58%, AmTrust 6.27%, Zurich 4.98%, Chubb 4.31% |
| Medical professional liability (11.1, 11.2) | $13.43B | 76.12% | Berkshire Hathaway 16.27%, The Doctors Co 9.82%, CNA 6.02%, MAG Mutual 5.04%, ProAssurance 4.89% |

The lines concentrate differently. Personal auto is an oligopoly at the top (the five largest groups wrote 65.14%, the 23 largest 87.85%), which I read as a line that rewards scale in advertising, data and claims. Other liability is fragmented (the five largest wrote 23.24%), being many specialty products under one statement line. Workers' compensation includes state funds as ordinary rows: the State Insurance Fund listed seventh (2.85%), California's State Compensation Insurance Fund (1.71%), Texas Mutual (1.68%) and Oregon's SAIF (1.03%) all rank in the top 25, which is why [Workers' Compensation](/books/insurance/workers-compensation) treats competitive state funds as carriers.

The statement line codes (04, 16, 17.1, 19.2 and the rest) are the keys a statutory reporting system uses, and they are not the lines a product team uses: a homeowners product, a renters product and a condo product all report on line 04, and one commercial package policy splits across several lines. [Statutory Accounting & the Annual Statement](/books/insurance/statutory-accounting) owns the mapping; the landscape tables only make sense once a policy's coverages can be rolled up to statement lines.

### By State

NAIC's 2025 full-year results table direct premiums and pure direct loss ratios (direct losses incurred over direct premiums earned) by state, and the four largest states show how differently a single year lands:

| State | 2025 direct premiums written | Change from 2024 | Pure direct loss ratio 2025 | 2024 |
| --- | --- | --- | --- | --- |
| California | $133.85B | 7.7% | 77.9% | 61.5% |
| Texas | $105.23B | 2.3% | 57.7% | 64.9% |
| Florida | $94.44B | (1.2%) | 39.1% | 62.4% |
| New York | $72.30B | 4.6% | 62.2% | 64.5% |

California's loss ratio rose 16.4 points on the Palisades and Eaton wildfires, which NAIC calls the costliest wildfires in world history and nearly half of the year's roughly $100 billion of US insured natural catastrophe losses; Auto Club Enterprises, a Southern California writer, ran a 92.88% direct loss and DCC ratio across all lines. Florida, with no hurricane landfall in the US in 2025, fell 23.3 points to 39.1%. A national ranking hides a market that is regional by law and by weather, which is why the state is a column on every premium entry and every claim; [Stressed & Residual Markets](/books/insurance/stressed-markets) covers what happens when a state's market breaks.

## Carriers by Line

The same NAIC tables, read by line instead of by group, sort the carriers into the businesses later parts describe:

- **Personal lines specialists.** State Farm, Progressive, Allstate, GEICO (in Berkshire Hathaway), USAA, Farmers and Liberty Mutual lead both auto and homeowners. Universal Insurance Holdings (13th in homeowners at 1.07%) is the largest Florida-focused writer in the table; Progressive is 12th in homeowners with 1.77%. [Personal Auto](/books/insurance/personal-auto) and [Homeowners & Renters](/books/insurance/homeowners-and-renters) cover the products.
- **Commercial and specialty.** Chubb, Travelers, W. R. Berkley, Fairfax, Hartford, CNA, AIG, Markel and Zurich lead other liability, workers' compensation and commercial auto, and the table's other liability loss ratio (78.26%) is the casualty market's social inflation problem in one number. [The Commercial Lines Map](/books/insurance/commercial-lines) and [Excess & Surplus Lines](/books/insurance/excess-and-surplus-lines) cover them.
- **Workers' compensation.** Hartford, Travelers, AmTrust and Zurich lead a line where state funds compete as carriers and Employers Holdings (1.33%) is a monoline specialist.
- **Life and annuities.** Mutuals (New York Life, Northwestern Mutual, MassMutual, Guardian, Penn Mutual) lead life; asset-manager-owned and stock groups (Apollo's Athene, Equitable, Jackson, Brighthouse) are prominent in annuities.

## Brokers by Revenue

Brokers don't appear in the NAIC premium tables at all, because they carry no risk; their size shows up in revenue. 2025 figures from each company's fourth-quarter release or 10-K:

| Broker | 2025 revenue | Organic growth | What the revenue is |
| --- | --- | --- | --- |
| **Marsh McLennan** (branded Marsh) | $27.0B | 4% underlying | Risk & Insurance Services $17.3B (Marsh Risk $14.4B, Guy Carpenter reinsurance broking $2.5B), Mercer $6.2B, Oliver Wyman $3.6B; $403M fiduciary interest income |
| **Aon** | $17.18B | 6% | Risk Capital $11.29B, Human Capital $5.91B; $271M fiduciary investment income |
| **Arthur J. Gallagher** | $13.78B before reimbursements | 6% | Brokerage base commissions $8.02B, fees $2.65B, supplemental $466M, contingent $324M |
| **WTW** | $9.71B | 5% | Health, Wealth & Career $5.25B, Risk & Broking $4.33B; down 2% after selling TRANZACT |
| **Brown & Brown** | $5.90B | 2.8% | Core commissions and fees $5.51B, profit-sharing contingent commissions $255M |
| **Ryan Specialty** | $3.05B | 10.1% | Wholesale brokerage $1.60B, binding authority $370M, underwriting management $1.02B |
| **Baldwin Group** | $1.50B | 7% | Commissions and fees $1.49B |
| **Goosehead** | $365.3M | Not stated | Franchise royalties on new and renewal commissions, its own commissions and $38.4M of contingent commissions |

Three things in that table recur through the Distribution part. **Fiduciary income is revenue**: brokers hold premiums and claim payments in trust between receipt and remittance and keep the interest, $403 million at Marsh and $271 million at Aon in 2025, which is why [Commissions & Agency Accounting](/books/insurance/commissions-and-agency-accounting) treats trust accounts as a ledger, not a bank detail ([Trust Accounts and Fiduciary Funds](/books/insurance/commissions-and-agency-accounting#trust-accounts-and-fiduciary-funds)). **Contingent commissions are back**, reported as their own line by Gallagher, Brown & Brown and Goosehead twenty years after New York's 2004-2005 investigations ([Contingent and Profit-Sharing Commissions](/books/insurance/commissions-and-agency-accounting#contingent-and-profit-sharing-commissions)). **Wholesale and underwriting management are growing fastest**: Ryan Specialty's underwriting management revenue rose 58.5%, the MGA business [MGAs, Programs & Fronting](/books/insurance/mgas-programs-and-fronting) describes.

## The Insurtechs and What Their Filings Say

The insurance startups of the 2010s are now public companies or parts of larger ones, and their filings describe businesses more conventional than their marketing:

| Company | 2025 scale | Results | What the filing shows |
| --- | --- | --- | --- |
| **Lemonade** | $1,236.5M in force premium, 2,984,513 customers, $1,171.3M gross written premium | 64% gross loss ratio (52% in the fourth quarter); net loss of $165.5M | About 45% of 2025 gross written premium came from California, New York and Texas; ceded earned premium was about 49% of gross earned (my arithmetic); growth spend is financed by General Catalyst and repaid from a share of premium collections |
| **Root** | $1,475.5M premiums in force, 481,869 policies, $1,505.8M gross written premium | 58.0% gross loss ratio, 97.1% gross combined ratio; net income of $40.3M | Auto only, in 36 states; direct, partnership (embedded with Carvana) and independent agent channels; a Cayman reinsurance captive and a Texas county mutual fronting arrangement |
| **Hippo** | $1,108.6M gross written premium, $422.3M net written premium | 113.1% combined ratio (60.1% loss, 53.0% expense); net income of $57.7M including a gain on selling its builder distribution network | Homeowners was 34% of gross written premium; the rest is commercial, casualty and renters written for third-party MGAs on its Spinnaker carriers |

Read together, the filings make three points:

- **Most premium is ceded.** Lemonade's ceded share, Root's quota shares and Hippo's net written premium at 38% of gross all show young carriers renting reinsurers' capital, the pattern [The Capacity Stack](/books/insurance/mgas-programs-and-fronting#the-capacity-stack) explains.
- **The carrier became a platform.** Hippo's 10-K describes it as serving "as a licensed insurance carrier for MGAs," and two-thirds of its premium is other people's programs: an insurtech turned fronting carrier ([Fronting and Hybrid Fronting](/books/insurance/mgas-programs-and-fronting#fronting-and-hybrid-fronting)).
- **Distribution converged on everyone else's.** Root added independent agents and embedded partners to its direct app; Lemonade sells car, pet and homeowners on top of renters. The channels are the industry's, not new ones.

Two names from the same cohort have no public filings. Kin Insurance, a Florida-focused homeowners carrier, is private. Next Insurance, a small commercial carrier that sold online and through partners, is no longer independent: ERGO, Munich Re's primary insurance group, which already held about 29% of it, agreed on March 20, 2025 to buy all of it at a $2.6 billion valuation and completed the acquisition on July 1, 2025, when Next reported $548 million of 2024 top line and more than 600,000 customers (ERGO).

## Core Vendors

The software under the carriers is concentrated in a handful of vendors, several of them now private:

| Vendor | What it sells | Latest public figures |
| --- | --- | --- |
| **Guidewire** | InsuranceSuite (PolicyCenter, ClaimCenter, BillingCenter, PricingCenter, UnderwritingCenter), InsuranceNow, Guidewire Cloud on AWS, data products | FY ended July 31, 2026: revenue $1,475.4M (subscription and support $970.9M, license $234.6M, services $269.9M), ARR $1,237M up 19%, about 550 customers in 44 countries, 4,174 employees |
| **Duck Creek** | Policy, billing, claims and rating for P&C | Taken private by Vista Equity Partners on March 30, 2023 at $19.00 a share, about $2.6B |
| **Sapiens** | P&C and life core systems | Taken private by Advent, closed December 17, 2025 at $43.50 a share in cash; Formula Systems kept a minority stake |
| **Vertafore** | Agency management (AMS360, Sagitta, QQCatalyst), PL Rating, Sircon producer compliance | Acquired by Roper for about $5.4B in 2020 |
| **Applied Systems** | Applied Epic, EZLynx rating, Ivans carrier-to-agency connectivity | No public filings |

Guidewire's 10-K names its competitors as Duck Creek, Majesco, Origami Risk, Sapiens and DXC Technology, plus SAP, Salesforce and ServiceNow and carriers' own systems. [Core Platforms](/books/insurance/core-platforms) compares the products and how each models a policy; the agency side (Applied, Vertafore, the raters) is [Comparative Raters & Agency Systems](/books/insurance/comparative-raters-and-agency-systems).

## Consolidation and Take-Privates

Ownership keeps moving, and every move is a data migration:

- **Vendors went private.** Duck Creek (2023) and Sapiens (2025) left public markets for private equity, so their revenue and customer counts are no longer reported.
- **Carriers sold geographies.** Travelers sold its Canadian personal and most of its commercial business to Definity for about US$2.4 billion, closing January 2, 2026, per its 2025 10-K.
- **Brokers kept buying.** Brown & Brown's 22.8% revenue growth on 2.8% organic growth, and Gallagher's 21% on 6%, are mostly acquisitions; Brown & Brown's release leads with its purchase of Accession.
- **Data vendors reshuffled.** Verisk sold Verisk Marketing Solutions to ActiveProspect, the maker of the TrustedForm consent certificate, on December 31, 2025 for a net $80.0 million, per Verisk's 10-K; the Jornaya site, another consent-tracking brand lead buyers use, now carries ActiveProspect's name ([Consent Evidence](/books/insurance/leads-and-consent#consent-evidence)).

For a carrier, a transaction changes the insurer of record on policies (a book transferred to another company by assumption or novation), the producer of record (an agency bought by a broker), or the system of record (a vendor's product sunset). Each is a dated event with a before and an after, and reports run across the date need both.

## How to Build It

Market data is reference data with a source and a date; corporate events are effective-dated facts about `insurers` and `producers`:

```sql
CREATE TABLE insurer_groups (              -- NAIC group codes and their members over time
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  naic_group_code    TEXT NOT NULL UNIQUE,  -- '176', '155', ...
  name               TEXT NOT NULL
);

CREATE TABLE insurer_group_memberships (
  insurer_id         UUID NOT NULL REFERENCES insurers (id),
  group_id           UUID NOT NULL REFERENCES insurer_groups (id),
  valid_during       DATERANGE NOT NULL,    -- a company sold to another group changes here
  EXCLUDE USING gist (insurer_id WITH =, valid_during WITH &&)
);

CREATE TABLE market_share_snapshots (      -- one row per entity, line, geography and source
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  source             TEXT NOT NULL,         -- 'naic_pc_market_share', 'naic_life_market_share'
  source_url         TEXT NOT NULL,
  data_year          INT NOT NULL,          -- 2025
  filings_as_of      DATE NOT NULL,         -- 2026-03-18: NAIC's cut-off
  coverage_pct       NUMERIC(5,2),          -- 98.25: share of filers received
  entity_kind        TEXT NOT NULL CHECK (entity_kind IN ('group', 'company', 'industry')),
  naic_code          TEXT,                  -- group or company code; null for industry
  statement_line     TEXT NOT NULL,         -- '35' all lines, '04', '16', '17.1-18.2', ...
  geography          TEXT NOT NULL,         -- 'countrywide', 'US-FL', ...
  direct_written     BIGINT NOT NULL,       -- whole dollars, as published
  direct_earned      BIGINT,
  loss_ratio_bp      INT,                   -- direct losses over earned, basis points
  loss_dcc_ratio_bp  INT,                   -- with defense and cost containment
  share_bp           INT,
  UNIQUE (source, data_year, entity_kind, naic_code, statement_line, geography)
);

CREATE TABLE corporate_transactions (      -- acquisitions, take-privates, book transfers
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  kind               TEXT NOT NULL CHECK (kind IN ('acquisition', 'take_private',
                       'divestiture', 'book_transfer', 'merger', 'demutualization')),
  acquirer_party_id  UUID REFERENCES parties (id),
  target_party_id    UUID NOT NULL REFERENCES parties (id),
  announced_on       DATE,
  closed_on          DATE,                  -- null until it closes
  consideration      BIGINT,                -- minor units, when disclosed
  currency           TEXT,
  source_url         TEXT NOT NULL
);
```

Design notes:

- **Group membership is time-ranged.** A company sold from one group to another keeps its NAIC company code and changes group; a market share series by group, recomputed for an old year, uses the membership valid in that year.
- **Snapshots are immutable and sourced.** NAIC revises figures as late filings arrive; a revision is a new row with a later `filings_as_of`, never an update, so a board deck can always be reproduced from the numbers it used.
- **Ratios are stored as published, and recomputed separately.** The NAIC publishes the loss ratio to two decimals; store it in basis points as published, and compute your own from the dollar columns when you need consistency across sources.

Concentration from the snapshot is a query. The Herfindahl-Hirschman index is the sum of squared shares; for 2025 private passenger auto, the top five groups alone contribute 18.64² + 18.60² + 11.56² + 10.15² + 6.19² = 347.4 + 346.0 + 133.6 + 103.0 + 38.3 = 968 points (my arithmetic on NAIC's shares):

```sql
SELECT statement_line,
       SUM(share_bp) FILTER (WHERE rn <= 5)              AS top5_share_bp,
       ROUND(SUM(POWER(share_bp / 100.0, 2)))            AS hhi_from_listed
FROM (
  SELECT statement_line, share_bp,
         ROW_NUMBER() OVER (PARTITION BY statement_line ORDER BY share_bp DESC) AS rn
  FROM market_share_snapshots
  WHERE source = 'naic_pc_market_share' AND data_year = 2025
    AND entity_kind = 'group' AND geography = 'countrywide'
) ranked
GROUP BY statement_line;
```

The NAIC tables list only the top 25 groups per line, so an HHI from them is a lower bound; say so wherever it is shown.

## Auditing

- **Every external figure with its source.** The report, URL, data year and filings cut-off for every market figure shown to a regulator, a board or an investor, so it can be re-derived and its definition read.
- **Who owned what, when.** Group memberships, transactions and book transfers with their effective dates, so a policy's insurer, a producer's parent and a vendor's owner can be stated as of any date.
- **Definitions next to numbers.** Direct versus net, written versus earned, loss ratio with or without DCC: the basis stored on the row, because two correct figures on different bases look like a contradiction.

## What This Means for the System You Build

- **Key everything to NAIC company codes,** and roll up to groups through time-ranged memberships; never store a group as the insurer.
- **Map coverages to statement lines** early, because every industry comparison is by statement line, not by your product names.
- **Store market data as sourced, immutable snapshots** with the filings cut-off and coverage, and recompute ratios from dollars when comparing sources.
- **Expect your counterparties to change owners:** brokers acquire agencies, carriers sell books, vendors go private; model each as a dated transaction with a before and an after.
- **Read every peer figure next to its definition,** from in force premium to gross loss ratio, before putting two companies in one chart.

## References

**NAIC**

- [NAIC: 2025 Property and Casualty Market Share Report (PDF)](https://content.naic.org/sites/default/files/research-actuarial-property-casualty-market-share.pdf), industry direct premiums written and earned, direct loss and loss and DCC ratios, the top 25 groups with group codes and cumulative shares, line tables for homeowners, medical professional liability, workers' compensation, other liability, private passenger auto and commercial auto, and the March 18, 2026 filings cut-off
- [NAIC: 2025 Life and Fraternal Market Share Report (PDF)](https://content.naic.org/sites/default/files/research-actuarial-life-fraternal-market-share.pdf), life, annuity and accident and health direct premium and the top groups by segment
- [NAIC: 2025 Annual Property and Casualty and Title Insurance Industries Analysis Report (PDF)](https://content.naic.org/sites/default/files/2025-annual-property-and-casualty-and-title-insurance-industries-analysis-report.pdf), direct premiums written and pure direct loss ratios by state, roughly $100 billion of 2025 insured natural catastrophe losses and the Palisades and Eaton wildfires
- [NAIC: 2025 Annual Life Industry Commentary (PDF)](https://content.naic.org/sites/default/files/2025-annual-life-industry-commentary.pdf), the $546.4 billion annuity premium figure on the commentary's basis

**Filings**

- [Progressive: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/80661/000008066126000086/pgr-20251231.htm), more than 40,000 independent agencies, agency and direct shares of personal vehicle volume
- [Allstate: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/899051/000089905126000031/all-20251231.htm), exclusive agents, independent agent locations and direct sales representatives
- [Travelers: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/86312/000008631226000065/trv-20251231.htm), about 1,100 P&C groups and 2,600 companies, independent agents and brokers, the sale of the Canadian business to Definity
- [Lemonade: Q4 2025 shareholder letter (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1691421/000169142126000006/lmndshareholderletterq42.htm), in force premium, customers, gross written and earned premium, gross loss ratio, net loss and ceded premium
- [Lemonade: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1691421/000169142126000016/lmnd-20251231.htm), the state concentration of premium and the General Catalyst growth financing
- [Root: Q4 2025 shareholder letter (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1788882/000178888226000013/q42025shareholderletter.htm), policies and premiums in force, gross written and earned premium, gross loss and combined ratios, net income, 36 states
- [Root: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1788882/000178888226000014/root-20251231.htm), its channels, Carvana, Root Re and the Texas county mutual fronting arrangement
- [Hippo: Fourth quarter and full year 2025 results](https://investors.hippo.com/news/investor-news/news-details/2026/Hippo-Reports-Fourth-Quarter-2025-Financial-Results/default.aspx), gross and net written premium, loss, expense and combined ratios, net income and premium by line
- [Hippo: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1828105/000182810526000008/hippo-20251231.htm), serving as a licensed insurance carrier for MGAs through Spinnaker
- [Marsh McLennan: Fourth quarter 2025 results (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/62709/000006270926000014/mmc4q2025ex991newsrelease.htm), revenue by segment, underlying growth and fiduciary interest income
- [Aon: Fourth quarter 2025 results (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/315293/000162828026004273/ex991prq42025.htm), revenue, organic growth, segments and fiduciary investment income
- [Arthur J. Gallagher: Fourth quarter 2025 results (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/354190/000119312526029407/d38405dex991.htm), revenue, base commissions, fees, supplemental and contingent revenues, organic growth
- [WTW: Fourth quarter 2025 results (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1140536/000117184326000577/exh_991.htm), revenue, organic growth, segments and the TRANZACT sale
- [Brown & Brown: Fourth quarter 2025 results (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/79282/000119312526022760/bro-ex99_1.htm), revenue, organic growth, core commissions and fees, profit-sharing contingent commissions, the Accession acquisition
- [Ryan Specialty: Fourth quarter 2025 results (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1849253/000184925326000004/ryan-20251231xex991.htm), revenue, organic growth and revenue by specialty
- [Baldwin Group: Fourth quarter 2025 results (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1781755/000178175526000015/ex991bwinfy2025q4earningsr.htm), revenue, organic growth, commissions and fees
- [Goosehead Insurance: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1726978/000172697826000010/gshd-20251231.htm), revenue by type including royalties and contingent commissions
- [Guidewire: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1528396/000152839626000046/gwre-20260731.htm), products, revenue by type, ARR, customers, employees and named competitors
- [Sapiens: Press release on completing the Advent merger (Form 6-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/885740/000121390025122732/ea026966501ex99-1_sapiens.htm), closing on December 17, 2025, delisting, Formula's minority stake
- [Sapiens: Schedule 13E-3 amendment](https://www.sec.gov/Archives/edgar/data/885740/000121390025099320/ea026112001ex99-ai_sapiens.htm), the $43.50 per share cash consideration
- [Roper Technologies: Form 10-K for 2020](https://www.sec.gov/Archives/edgar/data/882835/000088283521000011/rop-20201231.htm), about $5.4 billion for the acquisition of Vertafore
- [Verisk: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1442145/000143774926004452/vrsk20251231_10k.htm), the sale of Verisk Marketing Solutions to ActiveProspect for a net $80.0 million
- [ERGO: ERGO successfully finalizes the full acquisition of NEXT Insurance, July 1, 2025](https://www.ergo.com/en/newsroom/media-information/2025/20250701-ergo-acquisition-next-insurance), the March 20, 2025 agreement at a $2.6 billion valuation, ERGO's prior 29% stake and the closing

**Vendor documentation**

- [Duck Creek: Vista Equity Partners completes acquisition of Duck Creek Technologies](https://www.duckcreek.com/news/vista-equity-partners-completes-acquisition-of-duck-creek-technologies/), March 30, 2023, $19.00 per share, about $2.6 billion, delisting
- [State Farm: About us](https://www.statefarm.com/about-us), 19,000 agents
- [Applied Systems](https://www1.appliedsystems.com/en-us/), Applied Epic, EZLynx and Ivans brands
- [Vertafore: Products](https://www.vertafore.com/), AMS360, Sagitta, QQCatalyst, PL Rating and Sircon
- [Jornaya](https://www.jornaya.com/), the site redirecting to Infutor under ActiveProspect's copyright
