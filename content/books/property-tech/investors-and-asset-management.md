+++
title = "Investors, Funds & Asset Management"
nav_title = "Investors & Asset Management"
description = "The owner's side of the ledger: entity and fund structures, capital raising, capital calls, distribution waterfalls, data from third-party managers, valuations."
category = "Property Tech Industry"
order = 1705
part = "Properties, Owners and Investors"
tags = ["property-tech", "investment-management", "waterfalls", "asset-management", "valuations"]
+++

Above most large rental properties sits a stack of entities that never meets a resident. The property is owned by a single-purpose LLC; the LLC is owned by a joint venture between a sponsor who found the deal and a capital partner who funded most of it; the capital partner is a fund; the fund's money came from pension plans, endowments and wealthy families. Each layer has its own books, its own agreement about who gets paid what and in which order, and its own reporting obligations. Rent collected on the first of the month at the bottom of the stack eventually becomes a distribution to a retiree's pension at the top, and every layer in between has to be able to prove its share.

[Owners & Management Agreements](/books/property-tech/owners-and-management-agreements) treated the owner as a client who pays a manager. This chapter turns around and looks up the stack: the entity and fund structures, how capital is raised and called, how distribution waterfalls divide cash between investors and sponsors, the reporting and tax forms investors receive, how asset managers collect and normalize data from the third-party managers running their properties, how properties are valued, and why market data and benchmarks are a legal question as well as an analytical one.

## How the Platforms Do It

Investment management is sold beside property management, by the suites and by specialists:

- **RealPage** sells an investment management line: Asset Investment Management, to "collect, validate, consolidate, and analyze real estate and investment data"; Investor Management Services, with an "online capital-raising system, investor portal, performance dashboards, distribution waterfall"; Data Management Services, which handles "collecting, validating, and aggregating data from third-party managers and partners"; investment accounting; and "SaaS-based discounted cash flow valuation."
- **Yardi Breeze** lists "Investment management" as an add-on, with additional fees, in its residential, commercial, self-storage and manufactured housing editions.
- **MRI Software** offers investment accounting that automates consolidations and produces statements, capital calls and distributions, investor reporting, fund modeling with "powerful forecasting," and valuation software for complex commercial assets.
- **Juniper Square,** a specialist, describes services that create the "waterfall structure, investor groups, and distribution cash flow allocations" from governing documents, calculate preferred returns and, "as applicable, carried interest and promote," calculate capital call amounts and late-close penalties, prepare and send notices, pay distributions, and distribute K-1s on instruction. It prices deal-by-deal ("American") and open-end fund waterfalls separately, and its distribution calculations exclude tax withholding.

The pattern: the property system of record stays where it is, and the investment layer reads from it (or from many of them) and adds entities, capital, waterfalls, valuations and investor-facing reporting on top.

## Entity and Fund Structures

The structures repeat across the industry, and each is a chain of `legal_entities` linked by effective-dated `ownership_shares` in [The Core Data Model](/books/property-tech/property-business#the-core-data-model):

- **Single-asset entity.** One LLC owns one property, so a lender's collateral, a lawsuit or a sale stays contained.
- **Joint venture.** A sponsor (the managing member or general partner, who finds and runs the deal) and one or more capital partners own the property LLC together, under an operating agreement that sets contributions, control rights and the distribution waterfall. The sponsor often contributes a small share of equity and earns a disproportionate share of profits above a hurdle: the **promote**.
- **Closed-end fund.** Investors commit capital up front; the fund calls it as it buys properties, holds them for years, sells, and distributes. Waterfalls may run per deal or across the whole fund.
- **Open-end fund.** Investors enter and leave over time at a periodic net asset value, which makes valuations and their timing central.
- **Syndications and fractional ownership.** Many individual investors in one deal through an LLC, or several owners holding undivided interests directly (tenants in common), each paid and reported separately ([Owner Distributions](/books/property-tech/owners-and-management-agreements#owner-distributions)).
- **REITs and public companies,** which bring securities reporting; their management agreements are the ones visible in SEC filings.

Two modeling rules follow. **Walk the chain, don't flatten it:** an investor's indirect share of a property is the product of shares along the chain on a date, computed from `ownership_shares`, never stored as a number that goes stale when one layer changes. **Each layer keeps its own books** in the same ledger, as [The General Ledger by Entity](/books/property-tech/trust-accounting#the-general-ledger-by-entity) describes; the fund's asset is its investment in the venture, not the venture's buildings.

## Raising Capital

A sponsor raising money from investors for a private real estate deal is selling securities, and in the US usually relies on a Regulation D exemption. Under Rule 506(c), an issuer may "broadly solicit and generally advertise" an offering if all purchasers are accredited investors, the issuer takes reasonable steps to verify each purchaser's accredited status, and the other Regulation D conditions are met; purchasers receive restricted securities, the issuer files a Form D notice within 15 days of the first sale, states may require notice filings and fees, and "bad actor" disqualification applies.

That's why investor portals with online capital raising carry more than a payment form:

- **An offering record** with its exemption, first sale date and Form D filing, since the 15-day clock starts at the first sale.
- **Investor onboarding:** identity and control of entity investors, subscription documents signed electronically ([Electronic Signatures & Records](/docs/compliance/electronic-signatures)), tax forms, bank details for distributions.
- **Accreditation evidence** per investor and offering: the basis claimed and how it was verified, by whom and when. Under 506(c), a checked box isn't verification.
- **Commitments:** the amount each investor agreed to fund, by share class, with the date their capital was accepted.

My rule: treat the investor portal as a regulated onboarding flow with records an examiner can read, not as a marketing page with a checkout.

## Capital Calls and Capital Accounts

A **capital call** asks investors to fund part of their commitments, by a date, for a stated purpose (an acquisition, a renovation, a shortfall). Each investor's amount is their pro rata share of the call, adjusted for classes, prior funding and, for investors who joined in a later closing, the equalization the governing documents require; Juniper Square's services list "late close penalties" and multiple-close rebalancing as calculations in this step. The call is a notice, a receivable per investor, and a deadline with default remedies in the operating agreement.

A **capital account** is each investor's running equity in an entity: contributions, plus allocated income, minus allocated losses, minus distributions. It's what an investor statement shows and what a waterfall reads. Two versions exist side by side:

- **Book capital accounts** follow the entity's financial statements and the operating agreement's allocation rules.
- **Tax capital accounts** follow the tax return and feed the K-1, and differ from book by depreciation methods, timing and other adjustments.

Both are ledger balances per investor per entity, never a column on the investor, and both must reconcile to the entity's equity in total.

## Distribution Waterfalls

A **waterfall** divides each distribution among investors and the sponsor in ordered tiers, each filled before the next receives anything. The common tiers:

1. **Return of capital:** distributions go to investors pro rata until each has received back what they contributed.
2. **Preferred return:** then to investors until each has received a stated annual return (the "pref") on unreturned capital, simple or compounded as the documents say.
3. **Catch-up** (in some deals): then mostly or entirely to the sponsor until the sponsor has received its agreed share of everything distributed so far.
4. **Splits:** then the remainder divided between investors and sponsor at agreed percentages, sometimes with further tiers at higher return hurdles, each giving the sponsor a larger share.

The sponsor's extra share above its pro rata equity is the promote (or carried interest, in fund language). Whether the waterfall runs **per deal** (each property's cash runs through its own waterfall, the "American" style) or **across the whole fund** (investors get all capital and pref back across every deal before the sponsor's promote starts) decides when the sponsor gets paid, and is one of the largest economic terms in the documents.

An illustrative run, with numbers chosen for arithmetic, not taken from any deal: $10,000,000 of equity, 90% from the capital partner and 10% from the sponsor, an 8% simple preferred return, a sale after exactly three years with no interim distributions, $15,000,000 available, and the remainder above the pref split 80% pro rata and 20% to the sponsor as promote:

```text
tier                       amount        capital partner   sponsor
return of capital       10,000,000          9,000,000     1,000,000
8% pref x 3 years        2,400,000          2,160,000       240,000
remainder                2,600,000
  80% pro rata           2,080,000          1,872,000       208,000
  20% promote              520,000                  0       520,000
total                   15,000,000         13,032,000     1,968,000
```

The sponsor put in 10% of the capital and received about 13% of the proceeds; that difference is the promote, and it's why waterfall code is reviewed by both sides' accountants.

![A dimensional drawing of the illustrative waterfall. The first plan view shows the 15,000,000 dollars of proceeds (P) as one bar split into return of capital (T1, 10,000,000), the 8% pref over three years (T2, 2,400,000), the 80% pro rata split of the remainder (T3, 2,080,000) and the accented 20% promote (T4, 520,000). The second plan view shows the same proceeds by party at the same scale: the capital partner's bar (C, 13,032,000) made of C1, C2 and C3, its 90% of the first three tiers, and the sponsor's much shorter bar. Detail A enlarges the sponsor's share (S, 1,968,000) at four times the scale: S1 capital back (1,000,000), S2 pref (240,000), S3 pro rata (208,000) and the accented S4 promote (520,000). A variable table gives each code with its formula and value.](/diagrams/pt-inv-waterfall.svg "The same proceeds, cut by tier and by party. The promote is a small slice of the whole and over a quarter of the sponsor's take. All numbers are the illustrative run above.")

What a platform needs:

- **The waterfall as versioned data, from the governing documents,** with tiers, hurdles, compounding convention, day count, catch-up and splits, and a citation to the section each came from ([Rules as Data](/docs/architecture/rules-as-data#stages-and-ordered-rules)). Amendments create versions with effective dates.
- **Every run stored with its inputs:** the cash distributed, each investor's capital account and pref accrual before the run, the tier each dollar went through, and the result. Rerunning a past distribution never changes it.
- **IRR hurdles computed from dated cash flows,** with the method written down, since an internal rate of return depends on exactly which dates and amounts count.
- **Withholding as its own step.** Distributions to foreign investors or to investors without valid tax forms can require withholding that the waterfall's allocation doesn't handle (Juniper Square's distribution calculations exclude it), so the payment step applies it per investor ([Owner Taxes: 1099s and Foreign Owners](/books/property-tech/owners-and-management-agreements#owner-taxes-1099s-and-foreign-owners)).
- **Payment through the payout rails,** with the same bank-change controls as owner distributions.

## Investor Reporting and Tax

Investors get quarterly reports (performance, capital account statements, property updates, valuations) and annual tax documents. For entities taxed as partnerships, the entity files Form 1065, an information return (a partnership "doesn't pay tax on its income but passes through any profits or losses to its partners"), due for calendar-year partnerships on March 15, and gives each partner a Schedule K-1 with their share. The partnership's return can't be finished until its books close, which can't happen until the property entities below it close, which makes K-1 timing depend on every layer below and is a reason to close property books promptly every month rather than reconstruct them in February.

The reporting layer has two jobs worth separating. **Generation** builds statements and notices from closed books and waterfall runs, in a consistent format per entity. **Delivery** puts them in the investor portal, scoped to the investor's own positions, and logs who opened what ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)). Investor data (tax IDs, bank accounts, net worth evidence) is among the most sensitive the platform holds, and accreditation evidence in particular is collected for one purpose and should be retained only as long as the offering's records require ([Data Retention & Deletion](/docs/architecture/data-retention#retention-schedules-by-record-type)).

## Fund and Investor Accounting

The fund's books are a set of entity books in the same ledger as the properties' ([The General Ledger by Entity](/books/property-tech/trust-accounting#the-general-ledger-by-entity)), with a different shape:

- **Assets are investments,** in property entities or ventures, carried by the method the fund's accounting policy sets, alongside cash, receivables from investors on open capital calls, and payables to the sponsor.
- **Equity is capital accounts,** per investor and class, with contributions, allocations and distributions as their own accounts.
- **Income is allocated,** from the property entities upward, by each layer's ownership share and allocation rules.
- **Consolidation and eliminations** produce the fund's statements from the layers below, which only works if every layer uses mapped charts of accounts and closes on time.

The platform doesn't choose the fund's accounting policies ([The Product Keeps Facts, Finance Picks Policy](/docs/payments/accounting#the-product-keeps-facts-finance-picks-policy)); it keeps every fact those policies need, dated and by entity, so that finance can produce book and tax views from the same entries.

## Data from Third-Party Managers

An institutional owner with properties at ten managers on six platforms gets ten monthly packages in ten formats, and the asset manager's first job every month is to turn them into one set of numbers. RealPage sells this as a service ("collecting, validating, and aggregating data from third-party managers and partners," with AI checks on quality, completeness and timeliness), and owners with their own systems build it.

The pipeline:

1. **Deadlines from the agreements.** Each management agreement sets when the monthly package is due (15 days after month end in the 2010 agreement in [The Management Agreement](/books/property-tech/owners-and-management-agreements#the-management-agreement)), so the owner's system knows what's late without asking.
2. **Ingest as received.** Trial balances, rent rolls, delinquency, budgets and narratives arrive by file, API or portal; the original is kept and hashed, like any external file ([One Importer per Source](/books/payments/ledger-and-reconciliation#one-importer-per-source)).
3. **Map to the owner's chart.** Each manager's chart of accounts maps to the owner's, as versioned data per manager, and an unmapped account is a validation failure, not a silent "other" line ([The Chart of Accounts](/books/property-tech/trust-accounting#the-chart-of-accounts)).
4. **Resolve identities.** Properties and units are matched through a crosswalk of each manager's IDs ([Identity Across Sources](/books/property-tech/portfolios-properties-and-units#identity-across-sources)).
5. **Validate.** The trial balance balances; the balance sheet's opening equals last month's closing; the rent roll's unit count matches the property's; rent roll totals tie to rental income within tolerance; cash ties to the bank reconciliation; month-over-month swings above a threshold need a comment.
6. **Accept, reject or accept with exceptions,** with the result sent back to the manager, and resubmissions versioned rather than overwritten.
7. **Publish** to the owner's ledger, reports and valuation models only after acceptance.

The same rules apply in reverse for a manager: a manager whose packages fail validation every month is a manager the owner replaces, so a platform selling to third-party managers should run the owner's likely checks before sending ([Data Contracts](/docs/architecture/data-pipelines#data-contracts), [Reconcile to the Source](/docs/architecture/data-pipelines#reconcile-to-the-source)).

## Asset Management

The asset manager works for the owner and judges the property against its plan: budget versus actual, the reforecast, leasing and pricing against the market, capital projects against their returns, and the decision to hold, refinance or sell. The tools are reporting and modeling over the data above, plus the budgets and pro formas in [Budgets, Forecasts & Capital Projects](/books/property-tech/budgets-and-capital-projects), and the useful platform features are mostly about trust in the numbers: the same definitions as the operator's reports ([Owner-Reporting Metrics](/books/property-tech/operating-metrics#owner-reporting-metrics)), drill-down from a portfolio figure to the ledger lines and leases behind it, and dated versions of every plan so that "versus budget" means the approved budget, not the latest draft.

## Valuations

A property's value is an estimate with a date, a method and an author, and the platform should store it that way:

- **Appraisals** by licensed appraisers, typically annual or quarterly for funds, with the report and its assumptions.
- **Discounted cash flow models,** projecting income and a sale price and discounting them; RealPage and MRI both sell DCF-based valuation tools.
- **Direct capitalization:** a year's net operating income divided by a market capitalization rate.
- **Broker opinions and internal marks** between appraisals.

Open-end funds price investor entries and exits from valuations; closed-end funds report them; lenders test loan covenants against them; and index providers aggregate them: NCREIF, which describes itself as the institutional real estate community's "Data Central," began with the NCREIF Property Index, a property-level return index dating to 1978. A valuation feeds all of those, so it's an immutable dated record with its method, inputs, source and approver, and a revision is a new record, never an edit ([Versioned Entities](/docs/database/temporal-data#versioned-entities)).

## Market Data and Benchmarks

Asset managers want to know how their properties compare: rents, occupancy and expenses against competitors and the market. The data comes from three kinds of source, and the kind matters more than the vendor:

- **Public data:** listed asking rents and availability, public records, transaction records. Anyone can observe it.
- **Licensed survey and transaction data** from market data businesses, under license terms that limit use and redistribution ([Licensed Data](/docs/architecture/record-linkage#licensed-data)).
- **Contributed nonpublic data:** competitors' actual rents, occupancy and lease terms pooled by a vendor and returned as benchmarks.

The third is where antitrust law lives. The pricing software cases turned on competitors' nonpublic data being pooled and used to set rents ([Capital and Consolidation, as of October 2026](/books/property-tech/software-landscape#capital-and-consolidation-as-of-october-2026) notes why vendors that own data businesses sit on both sides), and benchmarking products that compare a property's performance with named or identifiable competitors from pooled nonpublic data raise the same question. [Revenue Management & Pricing](/books/property-tech/revenue-management#the-antitrust-record-as-of-october-2026) sets out the legal record and the design constraints; [Operating Metrics](/books/property-tech/operating-metrics#benchmarking-as-an-information-exchange-risk) covers benchmarking. For the asset management layer, my rule is provenance on every external dataset: who supplied it, whether it contains competitors' nonpublic data, how old it is, how aggregated, and what the license allows, so the question "did this number come from a competitor's private data" has an answer before a regulator asks it.

## How to Build It

Deltas against [The Core Data Model](/books/property-tech/property-business#the-core-data-model), using the multi-entity ledger from [Trust Accounting & the General Ledger](/books/property-tech/trust-accounting#how-to-build-it): capital accounts are ledger accounts whose `legal_entity_id` is the fund or venture and whose `beneficiary_entity_id` is the investor.

```sql
ALTER TABLE legal_entities
  DROP CONSTRAINT legal_entities_role_check,
  ADD CONSTRAINT legal_entities_role_check CHECK (role IN ('manager', 'owner', 'fund',
    'association', 'investor', 'sponsor', 'venture', 'lender'));  -- lenders: Budgets' draws

CREATE TABLE offerings (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL REFERENCES tenants (id),
  issuer_entity_id  UUID NOT NULL REFERENCES legal_entities (id),
  exemption         TEXT NOT NULL,                 -- 'reg_d_506c', 'reg_d_506b', ...
  first_sale_on     DATE,
  form_d_filed_on   DATE,                          -- due within 15 days of first_sale_on
  status            TEXT NOT NULL CHECK (status IN ('draft', 'open', 'closed'))
);

CREATE TABLE investor_verifications (               -- accreditation evidence, per offering
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  offering_id         UUID NOT NULL REFERENCES offerings (id),
  investor_entity_id  UUID NOT NULL REFERENCES legal_entities (id),
  basis               TEXT NOT NULL,                -- 'income', 'net_worth', 'professional', 'entity'
  method              TEXT NOT NULL,                -- 'tax_forms', 'third_party_letter', ...
  verified_by         UUID NOT NULL REFERENCES users (id),  -- the staff user who accepted it
  confirming_professional TEXT,                     -- the CPA, attorney or adviser, for a letter
  verified_on         DATE NOT NULL,
  evidence_uri        TEXT NOT NULL,                -- retained per the offering's schedule
  UNIQUE (offering_id, investor_entity_id)
);

CREATE TABLE commitments (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  entity_id           UUID NOT NULL REFERENCES legal_entities (id),   -- the fund or venture
  investor_entity_id  UUID NOT NULL REFERENCES legal_entities (id),
  share_class         TEXT NOT NULL DEFAULT 'common',
  amount              BIGINT NOT NULL CHECK (amount > 0),
  currency            CHAR(3) NOT NULL,
  accepted_on         DATE NOT NULL,
  closing_number      INT NOT NULL DEFAULT 1,       -- for equalization of later closings
  subscription_document_id UUID NOT NULL
);

CREATE TABLE capital_calls (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  entity_id    UUID NOT NULL REFERENCES legal_entities (id),
  purpose      TEXT NOT NULL,
  total_amount BIGINT NOT NULL,
  notice_on    DATE NOT NULL,
  due_on       DATE NOT NULL,
  status       TEXT NOT NULL CHECK (status IN ('draft', 'issued', 'funded', 'cancelled'))
);

CREATE TABLE capital_call_allocations (
  capital_call_id       UUID NOT NULL REFERENCES capital_calls (id),
  commitment_id         UUID NOT NULL REFERENCES commitments (id),
  amount                BIGINT NOT NULL,
  equalization_amount   BIGINT NOT NULL DEFAULT 0,   -- late-close adjustments
  received_amount       BIGINT NOT NULL DEFAULT 0,
  ledger_transaction_id UUID REFERENCES ledger_transactions (id),  -- the receivable
  PRIMARY KEY (capital_call_id, commitment_id)
);

CREATE TABLE waterfalls (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  entity_id       UUID NOT NULL REFERENCES legal_entities (id),
  scope           TEXT NOT NULL CHECK (scope IN ('deal', 'fund')),
  version         INT NOT NULL,
  valid_during    DATERANGE NOT NULL,
  day_count       TEXT NOT NULL,                     -- 'actual_365', '30_360'
  compounding     TEXT NOT NULL CHECK (compounding IN ('simple', 'annual', 'quarterly')),
  source_document_id UUID NOT NULL,
  UNIQUE (entity_id, version)
);

CREATE TABLE waterfall_tiers (
  waterfall_id    UUID NOT NULL REFERENCES waterfalls (id),
  position        INT NOT NULL,                      -- filled in order
  kind            TEXT NOT NULL CHECK (kind IN ('return_of_capital', 'preferred_return',
                    'catch_up', 'split')),
  hurdle_bps      INT,                               -- 800 = 8% pref or IRR hurdle
  hurdle_measure  TEXT CHECK (hurdle_measure IN ('pref_rate', 'irr', 'multiple')),
  investor_share_bps INT NOT NULL,                   -- to investors pro rata
  sponsor_share_bps  INT NOT NULL,                   -- promote, beyond the sponsor's pro rata
  source_clause   TEXT NOT NULL,
  PRIMARY KEY (waterfall_id, position),
  CHECK (investor_share_bps + sponsor_share_bps = 10000)
);

CREATE TABLE distribution_events (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  waterfall_id   UUID NOT NULL REFERENCES waterfalls (id),
  distributed_on DATE NOT NULL,
  cash_amount    BIGINT NOT NULL,
  source         TEXT NOT NULL CHECK (source IN ('operations', 'refinance', 'sale', 'other')),
  inputs         JSONB NOT NULL,                     -- capital accounts and accruals before the run
  status         TEXT NOT NULL CHECK (status IN ('calculated', 'approved', 'paid', 'void'))
);

CREATE TABLE distribution_allocations (
  distribution_event_id UUID NOT NULL REFERENCES distribution_events (id),
  tier_position         INT NOT NULL,
  investor_entity_id    UUID NOT NULL REFERENCES legal_entities (id),
  amount                BIGINT NOT NULL,
  withheld_amount       BIGINT NOT NULL DEFAULT 0,   -- applied after allocation, per investor
  payout_id             UUID REFERENCES payouts (id),
  PRIMARY KEY (distribution_event_id, tier_position, investor_entity_id)
);

CREATE TABLE manager_submissions (                   -- monthly packages from third-party managers
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  manager_entity_id  UUID NOT NULL REFERENCES legal_entities (id),
  property_id        UUID NOT NULL REFERENCES properties (id),
  period             DATE NOT NULL,
  due_on             DATE NOT NULL,                  -- from the agreement's terms
  version            INT NOT NULL,                   -- resubmissions are new versions
  external_file_id   UUID NOT NULL REFERENCES external_files (id),
  status             TEXT NOT NULL CHECK (status IN ('received', 'validating', 'accepted',
                       'accepted_with_exceptions', 'rejected', 'published')),
  UNIQUE (manager_entity_id, property_id, period, version)
);

CREATE TABLE submission_checks (
  submission_id  UUID NOT NULL REFERENCES manager_submissions (id),
  check_code     TEXT NOT NULL,                      -- 'tb_balances', 'opening_equals_prior_close',
                                                     -- 'rent_roll_ties', 'unmapped_account'
  result         TEXT NOT NULL CHECK (result IN ('pass', 'warn', 'fail')),
  detail         JSONB NOT NULL,
  PRIMARY KEY (submission_id, check_code)
);

CREATE TABLE chart_mappings (                         -- manager's or owner's chart to the master
  tenant_id       UUID NOT NULL,
  source          TEXT NOT NULL,                      -- 'manager:<entity id>', 'owner:<entity id>'
  source_account  TEXT NOT NULL,
  gl_account_id   UUID NOT NULL REFERENCES gl_accounts (id),
  valid_during    DATERANGE NOT NULL,
  EXCLUDE USING GIST (source WITH =, source_account WITH =, valid_during WITH &&)
);

CREATE TABLE valuations (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  property_id     UUID REFERENCES properties (id),
  entity_id       UUID REFERENCES legal_entities (id),       -- or an entity's equity
  as_of           DATE NOT NULL,
  method          TEXT NOT NULL CHECK (method IN ('appraisal', 'dcf', 'direct_cap',
                    'broker_opinion', 'internal')),
  value           BIGINT NOT NULL,
  currency        CHAR(3) NOT NULL,
  cap_rate_bps    INT,
  discount_rate_bps INT,
  inputs          JSONB NOT NULL,
  prepared_by     TEXT NOT NULL,                     -- the appraiser or preparer, by name
  approved_by     UUID REFERENCES users (id),
  supersedes_id   UUID REFERENCES valuations (id),
  report_uri      TEXT,
  CHECK (num_nonnulls(property_id, entity_id) = 1)
);

CREATE TABLE external_datasets (                      -- provenance for market data and benchmarks
  id                         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id                  UUID NOT NULL,
  provider                   TEXT NOT NULL,
  kind                       TEXT NOT NULL CHECK (kind IN ('public', 'licensed_survey',
                               'transactions', 'contributed_nonpublic')),
  data_as_of                 DATE NOT NULL,
  aggregation                TEXT NOT NULL,          -- 'submarket', 'property', 'unit'
  license_terms_uri          TEXT,
  contains_competitor_nonpublic BOOLEAN NOT NULL,
  approved_for_use           TEXT[] NOT NULL DEFAULT '{}'   -- 'valuation', 'reporting'; never 'pricing'
                                                            -- without legal review
);
```

How it runs:

1. **Indirect ownership is computed on a date** by walking `ownership_shares` upward, and cached only per report with the date it was computed for.
2. **Capital calls post receivables** per commitment; receipts apply to them like any payment ([Payments Are Applied, Not Assigned](/docs/payments/payment-states#payments-are-applied-not-assigned)).
3. **A waterfall run reads capital accounts as of the distribution date,** fills tiers in order, stores every allocation with its tier, posts ledger entries per investor, and only then applies withholding and creates payouts.
4. **Manager submissions publish only when accepted,** and a resubmission for a published period posts the difference into the open period, linked to the version it replaces.
5. **Datasets without provenance can't be attached** to valuations, reports or models.

## Auditing

- **Ownership chains on every date,** with the documents behind each share change.
- **Offerings, Form D dates and accreditation evidence** per investor, retained for the offering's record period and no longer.
- **Every capital call and distribution:** notices sent, amounts by investor and tier, the waterfall version, the inputs, the approvals and the payments.
- **Capital accounts reproducible** from entries, book and tax, reconciled to entity equity.
- **Manager submissions** with their files, checks, acceptance decisions and resubmissions.
- **Valuations** with method, inputs, author, approver and supersession.
- **Dataset provenance** for every external number used in a report or model.

## What This Means for the System You Build

- **Model ownership as chains of entities with dated shares,** and compute indirect ownership on a date.
- **Keep each layer's books in the same multi-entity ledger,** with capital accounts as ledger balances per investor.
- **Treat investor onboarding as regulated:** offering records, accreditation evidence and Form D timing.
- **Store waterfalls as versioned rules from the governing documents,** and store every run with inputs, tiers and allocations.
- **Apply withholding after allocation** and pay through the same controlled payout rails as owners.
- **Ingest third-party manager data as versioned submissions,** mapped, validated and accepted before it's used.
- **Record valuations as immutable dated estimates** with method and author.
- **Record provenance on every external dataset,** including whether it contains competitors' nonpublic data.

## References

**Regulation and tax**

- [SEC: General solicitation, Rule 506(c)](https://www.sec.gov/resources-small-businesses/exempt-offerings/general-solicitation-rule-506c), broad solicitation if all purchasers are accredited and verified, restricted securities, Form D within 15 days, state notice filings, bad actor provisions
- [IRS: Instructions for Form 1065](https://www.irs.gov/instructions/i1065), partnerships pass income through to partners; the March 15 due date for calendar-year partnerships

**Platforms**

- [RealPage: Investment Management](https://www.realpage.com/investment-management/), asset investment management, investor management with capital raising, portal and distribution waterfall, data management from third-party managers, investment accounting and DCF valuation
- [Yardi Breeze](https://www.yardibreeze.com/), investment management as an add-on in residential, commercial, self-storage and manufactured housing editions
- [MRI Software: Investment Management](https://www.mrisoftware.com/solutions/investment-management/), investment accounting with consolidations, capital calls and distributions, investor reporting, fund modeling and valuation software
- [Juniper Square: Description of Services (October 2021)](https://www.junipersquare.com/terms-and-policies/description-of-services-v202110), waterfall setup from governing documents, preferred return and promote calculations, capital calls with late-close penalties, distributions, K-1 distribution, withholding excluded, deal-by-deal and open-end waterfalls

**Benchmarks**

- [NCREIF](https://www.ncreif.org/), its description as the institutional real estate community's data center and the NCREIF Property Index dating to 1978
