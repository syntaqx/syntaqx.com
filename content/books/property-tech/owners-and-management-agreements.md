+++
title = "Owners & Management Agreements"
description = "Third-party management as data: the management agreement, fee bases and fee runs, reimbursements, owner distributions and reserves, owner reporting and 1099s."
category = "Property Tech Industry"
order = 1704
part = "Properties, Owners and Investors"
tags = ["property-tech", "owner-accounting", "management-fees", "distributions", "1099"]
+++

A third-party manager runs other people's buildings with other people's money, and is paid a percentage of the money it collects for them. That one sentence produces most of the accounting a property platform does. Rent comes in for an owner and is held in trust; bills for that owner's property are paid from it; the manager takes a fee computed from a definition in a contract; a reserve is held back; whatever is left goes to the owner, with a statement explaining every dollar, and in January the owner gets a tax form. Do that for four hundred owners on the tenth of every month, with each contract defining "gross receipts" its own way, and the problem is no longer bookkeeping: it's a computation over the ledger, driven by contract terms stored as data, that has to produce the same answer when an owner's accountant reruns it two years later.

This chapter covers the owner and the operator as parties to a contract: what management agreements say, how fees are defined and computed, what the owner reimburses, how distributions, reserves and contributions work, what owners are sent, and their tax forms. Where the money sits and how it's reconciled is [Trust Accounting & the General Ledger](/books/property-tech/trust-accounting); owners who are funds with investors behind them are in [Investors, Funds & Asset Management](/books/property-tech/investors-and-asset-management); budgets the agreement requires are in [Budgets, Forecasts & Capital Projects](/books/property-tech/budgets-and-capital-projects).

## How the Platforms Do It

Every platform that sells to third-party managers has owner accounting, and the public descriptions converge on the same parts:

- **Fee calculation from the ledger, two ways.** Rent Manager documents both methods the industry uses. Its standard method attaches fees to charge types ("6% of any rent charge that gets paid" or "100% of any paid late fee") and assesses a fee on each allocated payment that has none yet; its advanced method "calculates fees against the activity of specific general ledger accounts over a fixed date range." Fee templates are assigned per managed property. Entrata's accounting product lists management fee calculations with filters by date range, template and fee type.
- **Owner payments net of reserves.** Yardi Breeze can "calculate owner payments while maintaining stipulated reserve amounts," "manage properties by owner and fraction ownership," "generate pro rata statements," pay owners by check or EFT, and "prepare and e-file 1099s." Rent Manager's owner portal shows "reserves, bank balances, distributions, and management fees."
- **Owner-level reporting in the same system as property and corporate books.** RealPage describes handling "corporate accounting, property accounting, and owner-level reporting within one platform"; Entrata lets managers "securely share information with owners, investors, and other stakeholders."
- **Negative balances as a process.** AppFolio's guidance on trust accounts calls for a process "for identifying and resolving negative balances," including asking the owner for funds and moving money between one owner's properties with permission; Buildium's describes carrying a deficit forward to be "offset by future rental income" and requesting a contribution if losses repeat.

What separates platforms is how much of the agreement is data. A fee defined as a percentage of one charge type is easy; a fee defined as a percentage of cash gross receipts excluding security deposits, insurance proceeds and capital contributions, with a monthly minimum and a separate leasing fee, needs a rule engine, and the contracts below are written like that.

## Third-Party Management

The operator is either the owner (an owner-operator) or a manager working under contract (a third-party manager), and the difference shows up in every table ([Who's Who](/books/property-tech/property-business#who-s-who)):

- **The landlord stays the owner.** The lease usually names the owning entity as landlord, with the manager as its agent. Notices, court filings and deposit obligations run to the owner, even though the manager does the work.
- **The manager is often a licensed broker.** In states such as California, Arizona and Nevada, managing rental property for others is regulated real estate activity, and the license brings trust account rules and audits by the state's real estate regulator ([State Trust Account Rules](/books/property-tech/trust-accounting#state-trust-account-rules)). An owner-operator managing its own property isn't holding money for others in that sense, though deposit statutes still apply to it as a landlord.
- **One manager, many owners; one owner, sometimes many managers.** A manager's books separate owners absolutely. An owner with properties at three managers sees three sets of statements, and combining them is the asset manager's job ([Investors, Funds & Asset Management](/books/property-tech/investors-and-asset-management#data-from-third-party-managers)).
- **The relationship has a start and an end.** Managers take over properties mid-year from other managers and hand them back. The agreement's dates bound which months a manager reports on, and the handover moves trust balances, deposits, records and open obligations ([Onboarding and Offboarding an Owner](#onboarding-and-offboarding-an-owner)).

Owner-operators run the same platform with the roles merged: the "owner" is an affiliate, the "fee" may be an intercompany charge or nothing, and distributions are transfers between related entities. Building for the third-party case and configuring it down works; the reverse doesn't.

## The Management Agreement

Management agreements filed with the SEC show what the contract governs. Two of them (a 2010 agreement between Bell Partners and a Bluerock joint venture, and a 2020 agreement between an AIR management company and one of its owning partnerships) cover the same ground with different numbers:

| Term | 2010 agreement | 2020 agreement |
| --- | --- | --- |
| Budget | Submitted no later than 90 days before the fiscal year, reasonably approved by the owner before December 31 | Proposed, approved and implemented annually per a schedule |
| Spending outside the budget | Aggregate overage capped at 5% of the total, excluding taxes, insurance and utilities; substantial variances explained within 15 days of month end | No cost or capital expenditure outside the budget without the owner's prior written approval, except emergencies |
| Emergencies | Repairs for "manifest danger to life or property" regardless of budget limits, with timely notice | Permitted outside the budget, with written notice within 24 hours |
| Monthly reports | Within 15 days of month end: balance sheet, budget comparison, income statement, general ledger, payables, rent roll, delinquency, variance | Per a schedule, with bank reconciliations in the monthly package |
| Bank accounts | Gross receipts into an operating account; security deposits always the owner's property; no commingling | Owner a signatory on every account; a security deposit account used only for tenant deposits |
| Termination | 30 days' notice either way; a termination fee of one month's management fee if the owner terminates without cause | 60 days' notice for any reason; immediate termination after a material breach |
| Audit | Owner may examine records; manager cooperates with audits | Owner may audit at its cost; the manager reimburses the audit if it finds overpayments above 5% |
| Other | Contracts cancelable on 30 days' notice; insurance claims over $1,500 need approval; signatories bonded for at least $100,000 | Contracts may not exceed budgeted costs without written approval |

Each of those is a check the platform can run or a deadline it can compute. My rule: store the agreement's operational terms as versioned data attached to the agreement, not as a PDF and a memory ([Rules as Data](/docs/architecture/rules-as-data#the-shape-of-a-rule)):

- **Dates and deadlines.** Report due days, budget submission lead time, termination notice. The platform computes and stores the due dates and shows what's late ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)).
- **Spending authority.** The budget tolerance, the approval threshold for unbudgeted items and contracts, the emergency rule. Purchase orders and invoices check against them ([Vendors, Procurement & Payables](/books/property-tech/vendors-and-payables#purchase-orders)).
- **Fee rules.** Below, with their own versions.
- **Reserve and distribution terms.** Minimum reserve, distribution timing and method.
- **Reimbursable costs.** Which payroll, which central services, at what rates.

Agreements are amended: a fee drops from 3% to 2.75% on renewal, a reserve is raised after a roof leak. Every term has a `valid_during`, and a fee run for March uses the terms in force in March, even when it's rerun in June ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).

## Management Fees

The base fee is a percentage of something, and the something is where disputes live. The 2010 agreement defines gross receipts as cash-basis receipts including rent, parking, forfeited deposits, utility reimbursements and ancillary income, and excluding refundable security deposits, loan proceeds, capital contributions, sale proceeds and most insurance proceeds ([The Manager's Money](/books/property-tech/property-business#the-manager-s-money)). The fee is therefore a function of what was collected, classified by what it was for:

```text
cash received for the property, March                     $104,600
- refundable security deposits received                     -6,000
- owner capital contribution                                -2,000
- insurance proceeds (roof claim)                           -4,000
= gross receipts under the agreement                        92,600
x base fee 3.00%                                             2,778
```

Two methods compute that basis, and they answer the questions differently:

- **By application.** Assess the fee on each payment as it's applied to a charge, by the charge's code: rent at 3%, late fees at 100% (where the agreement gives late fees to the manager), deposits at 0%. This is precise and naturally handles reversals: when a payment returns, its applications reverse, and so does the fee on them ([Payments Are Applied, Not Assigned](/docs/payments/payment-states#payments-are-applied-not-assigned)).
- **By ledger activity.** Sum the activity in a set of income accounts for the period and apply the rate. This fits agreements written in accounting terms ("3% of total income per the operating statement") and commercial agreements with fees on recoveries, and it depends on the chart of accounts being mapped right ([Trust Accounting & the General Ledger](/books/property-tech/trust-accounting#the-chart-of-accounts)).

Both need the same decisions written down per agreement:

- **Cash or accrual.** Most residential agreements charge on cash collected, so a resident who never pays generates no fee. An accrual basis charges on rent billed and has to reverse for bad debt.
- **Prepayments.** Rent paid in March for April is cash in March; the fee is usually taken when it's earned, not when it arrives, and a platform that pays fees on prepaid rent and then refunds the rent has overpaid the manager.
- **Minimums and maximums.** "3% or $250 a month, whichever is greater" for small properties; caps in some institutional agreements.
- **Returned payments.** A fee taken on a payment that bounces is reversed in the period the return posts, not by editing the old period.
- **Rounding.** Per payment or per period; the totals differ by cents across hundreds of payments, and the owner's accountant will find it ([Rounding](/docs/payments/money#rounding)).

Beyond the base fee, agreements add **leasing fees** (a flat amount or a share of first month's rent per new lease), **renewal fees**, **construction management fees** (5% of completed cost of capital projects over $10,000 per item in the 2010 agreement; [Budgets, Forecasts & Capital Projects](/books/property-tech/budgets-and-capital-projects#capital-projects-and-job-costing) computes the cost), **fees on ancillary contracts** (10% of upfront payments for cable, internet and laundry agreements in the same agreement), **setup and termination fees**, and **markups** on maintenance billed at a rate above cost. Each is a fee rule with a trigger (a lease signed, a project closed, a contract executed) rather than a percentage of a period's receipts.

A **fee run** computes every fee for a period across the portfolio, posts each as a ledger transaction moving money from the owner's funds to the manager's income, and stores its inputs: the rule version, the basis amount, the payments or ledger lines in the basis, and the result. Rerunning a closed period never changes it; a correction posts an adjustment in the open period with a link to what it corrects ([Closed Periods Stay Closed](/docs/payments/accounting#closed-periods-stay-closed)).

## Reimbursements and Allocated Costs

The owner pays the property's costs, and some of those costs are the manager's own: the 2010 agreement makes on-site payroll reimbursable because the property's employees are the manager's employees, and the 2020 agreement does the same for on-site personnel. Centralization stretches this: a central leasing team, a shared maintenance crew, an outsourced invoice-processing service or an AI tier ([AI Cost Allocation to Owners](/books/property-tech/ai-in-property-management#ai-cost-allocation-to-owners)) serve many properties, and whether each owner reimburses a share depends on wording that may only mention on-site staff ([Centralization and the Outsourced Back Office](/books/property-tech/software-landscape#centralization-and-the-outsourced-back-office)).

The platform's job is to make the allocation a rule with a citation: which cost pool, which allocation base (units, hours logged per property, work orders, AI interactions per property), which agreements allow it, and the allocation's output per property per period as ledger entries. A cost the agreement doesn't allow is the manager's expense, and the system should refuse to charge it to the owner rather than leave it to a reviewer to catch. Allocation mechanics are shared with budgets ([Allocations and Shared Costs](/books/property-tech/budgets-and-capital-projects#allocations-and-shared-costs)).

## Owner Distributions

An owner distribution pays the owner what is theirs and not needed. The calculation, per owner per property, as of the distribution date:

```text
owner's cash balance in trust                       collected less paid, from the ledger
- security deposits held for residents              not the owner's to take
- prepaid rent                                      not yet earned
- reserve required by the agreement
- payables approved and not yet paid
- pending items (payments not yet past return risk)
= available to distribute (never below zero)
```

Each line is a ledger balance, so the distribution is explained by the same entries the statement shows. Three variations recur:

- **Fractional ownership.** When a property is owned in shares (tenants in common, a family LLC whose members are paid directly), the available amount is split by the ownership shares in force on the distribution date, each holder paid and reported separately. That's `ownership_shares` from the core model, and the rounding residue goes to a named holder by rule, not to whoever sorts first.
- **Timing and method.** Monthly on a set day, after the month closes, or on demand; by ACH, wire or check, through the same payout machinery as vendors ([Vendor Payouts](/books/payments/vendor-payouts)). A changed owner bank account gets the same verification as a changed vendor account ([Stopping the Changed Bank Account](/books/payments/vendor-payouts#stopping-the-changed-bank-account)), because owner distributions are a target for payment-instruction fraud like any other payout.
- **Holds.** An owner in a dispute, an account awaiting verification, a property being sold: the run skips the owner with a recorded reason.

**Negative balances** are where owner accounting meets trust law. When a property's bills exceed its collections, its owner's balance would go below zero, and paying that bill anyway means paying it with another owner's money. In California, a broker needs the written consent of every owner of funds in the account before a disbursement that reduces the account below the aggregate trust liability; Arizona's regulator treats negative owner balances as an indication of conversion. So the platform blocks the payment, asks the owner for a **contribution**, or pays it from the manager's own funds as a recorded advance, and the default is the block ([Negative Balances and Conversion](/books/property-tech/trust-accounting#negative-balances-and-conversion)). Contributions are recorded as their own transaction type, never as income, because they're excluded from the fee basis and from income on the owner's statement.

![An owner distribution run as a pipeline with accented arrows: cash in trust (collected less paid, per owner), less held amounts (deposits, prepaid rent, reserve, payables, pending items), available (never below zero), holds (a dispute, an unverified account, a sale), split by shares (shares in force, residue by rule), and payout (ACH, wire or check, to a verified account). From holds, a dashed line leads to skipped, reason recorded. Below, when a bill exceeds the owner's balance, an owner bill that would go negative branches to three outcomes: blocked, the default; an owner contribution, not income and not in the fee basis; or a manager advance from its own funds, recorded.](/diagrams/pt-oma-distribution.svg "A distribution is a computation over ledger balances, run per owner per property. A bill the owner's balance can't cover is blocked by default, because paying it would spend another owner's money.")

## Reserves

A **reserve** is the owner's money that the manager keeps in trust instead of distributing, so that bills can be paid without a negative balance: a fixed amount ("$500 per property"), an amount per unit, or a share of monthly income until a target is reached. Reserves are set in the management agreement, shown on every statement, and are a balance, not an expense: moving money into a reserve doesn't reduce the owner's income, it reduces what's distributed, and a statement export that books it as an expense misstates the owner's income.

Lender-required replacement reserves are different: they're held by the lender or its servicer under the loan documents, funded by monthly deposits, and released for approved capital work. They belong to the capital side ([Replacement Reserves](/books/property-tech/budgets-and-capital-projects#replacement-reserves)). Association reserves for common-element replacement are a third kind, governed by state association law ([Community Associations](/books/property-tech/community-associations#reserves-and-reserve-studies)).

## Owner Reporting

The monthly owner package is the product a third-party manager sells, and its contents are close to fixed across agreements: an income statement, a balance sheet, a cash flow or statement of owner's funds, a budget comparison with variance explanations, a rent roll, a delinquency report, a general ledger, payables, and the bank reconciliation. Small-portfolio managers send a one-page statement (beginning balance, income, expenses, fees, reserve, distribution, ending balance); institutional owners want the full package in their own chart of accounts ([Investors, Funds & Asset Management](/books/property-tech/investors-and-asset-management#data-from-third-party-managers)).

My rules for owner reporting:

- **A sent statement is a snapshot.** Store the rendered document with its hash and the data version it came from, so "what was sent in March" is answered by retrieval, not recomputation ([Snapshots](/docs/database/temporal-data#snapshots)).
- **Corrections are restatements,** shown as such, with the prior version kept and the difference explained. An owner who was told $8,400 and then sees $8,250 for the same month without explanation calls a lawyer.
- **The statement ties to the trust account.** Every owner's ending balance is one of the beneficiary balances in the three-way reconciliation; a statement that doesn't tie is wrong, whichever side the error is on.
- **Owners see their own properties only,** through scoped grants in the owner portal, never a filtered view of a shared report ([Tenant Hierarchies](/docs/architecture/multi-tenancy#tenant-hierarchies)).

## Owner Taxes: 1099s and Foreign Owners

A property manager that collects rent for an owner is an information reporter. The IRS instructions for Form 1099-MISC say that when rent is paid to a real estate agent or property manager, "the real estate agent or property manager must use Form 1099-MISC to report the rent paid over to the property owner," in box 1, and for tax years beginning after 2025 the threshold for reporting rents is $2,000, which may be adjusted for inflation from 2027. The instructions don't spell out how fees and expenses netted from collections are treated, so the platform should keep both gross rents collected and net amounts paid per owner per year, and make the reported basis a setting the operator's tax adviser chooses.

That puts tax data on the owner record from onboarding:

- **A W-9 for US owners,** with the TIN vaulted and matched, as for vendors ([Tax: W-9s, TIN Matching and 1099s](/books/payments/vendor-payouts#tax-w-9s-tin-matching-and-1099s)). Fractional owners each get their own form for their share.
- **Foreign owners are a withholding problem, not a reporting one.** IRS Publication 515 says a payer must withhold under chapter 3 on rents from US real property held for the production of income "unless the foreign payee elects to treat this income as effectively connected with a U.S. trade or business," in which case the payee gives the payer Form W-8ECI. Without it, withholding is generally 30% of the gross amount, which can't be reduced by deductions, and payments are reported on Form 1042-S with an annual Form 1042. A manager distributing rent to a foreign owner without a W-8ECI on file is a withholding agent with a liability; the platform should hold the distribution until the form exists or withhold, never pay in full by default.
- **Vendors paid from the owner's funds** are reported by the payer on 1099-NEC or 1099-MISC, by payment method, as the Payments volume describes; the trust account pays them, but the reporting has to be attributable per property and owner.

Year-end is a batch with exceptions: missing TINs, owners whose share changed mid-year, properties that changed managers. Run it as a reviewed draft in December, not a surprise in January.

## Onboarding and Offboarding an Owner

**Onboarding** an owner is opening an account at a bank, in effect: verify the entity (and who controls it), collect tax forms and bank details, sign the agreement, map the property's opening balances (deposits held, prepaid rent, payables, reserves), and receive the starting reserve as a contribution. For a property arriving from another manager, the security deposits and their interest are transferred with a schedule per resident; a deposit missing from the transfer is still owed to the resident at move-out ([Trust Cutover and Deposit Transfer](/books/property-tech/switching-platforms#trust-cutover-and-deposit-transfer)).

**Offboarding** reverses it: a final statement, a final fee run under the agreement's termination terms, transfer of deposits and remaining balances to the owner or the next manager, delivery of records, and a final 1099 for the partial year ([Owners, Statements and 1099s in a Split Year](/books/property-tech/switching-platforms#owners-statements-and-1099s-in-a-split-year)). The property stays in the system, read-only, because the manager remains answerable for the period it managed.

## How to Build It

Deltas against [The Core Data Model](/books/property-tech/property-business#the-core-data-model). Money moves in the Payments volume's ledger as extended in [Trust Accounting & the General Ledger](/books/property-tech/trust-accounting#how-to-build-it), where every ledger account carries the owning entity and property; this chapter adds the contract, the rules and the runs that post to it.

```sql
CREATE TABLE management_agreements (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL REFERENCES tenants (id),
  owner_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  manager_entity_id   UUID NOT NULL REFERENCES legal_entities (id),
  document_id         UUID NOT NULL,              -- the signed agreement and amendments
  valid_during        DATERANGE NOT NULL,         -- upper bound set on termination
  fee_basis           TEXT NOT NULL CHECK (fee_basis IN ('cash', 'accrual')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE agreement_properties (                -- which properties, when; the management period
  tenant_id     UUID NOT NULL,
  agreement_id  UUID NOT NULL REFERENCES management_agreements (id),
  property_id   UUID NOT NULL REFERENCES properties (id),
  valid_during  DATERANGE NOT NULL,
  EXCLUDE USING GIST (property_id WITH =, valid_during WITH &&)   -- one manager at a time
);

CREATE TABLE agreement_terms (                     -- operational terms, versioned
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  agreement_id  UUID NOT NULL REFERENCES management_agreements (id),
  term          TEXT NOT NULL,                     -- 'report_due_days', 'budget_lead_days',
                                                   -- 'budget_tolerance_bps', 'approval_threshold',
                                                   -- 'termination_notice_days', 'reserve_minimum'
  value         JSONB NOT NULL,                    -- typed per term by a definitions table
  source_clause TEXT NOT NULL,                     -- '§2.03', 'Exhibit B'
  valid_during  DATERANGE NOT NULL,
  EXCLUDE USING GIST (agreement_id WITH =, term WITH =, valid_during WITH &&)
);

CREATE TABLE fee_rules (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  agreement_id   UUID NOT NULL REFERENCES management_agreements (id),
  kind           TEXT NOT NULL CHECK (kind IN ('base', 'leasing', 'renewal', 'construction',
                   'ancillary_contract', 'setup', 'termination', 'markup', 'other')),
  method         TEXT NOT NULL CHECK (method IN ('by_application', 'by_ledger_activity',
                   'per_event', 'flat', 'per_unit')),
  rate_bps       INT,                              -- 300 = 3.00%
  flat_amount    BIGINT,                           -- minor units
  minimum_amount BIGINT,
  maximum_amount BIGINT,
  basis          JSONB NOT NULL,                   -- charge codes or GL accounts in and out,
                                                   -- event type and threshold for per_event
  rounding       TEXT NOT NULL CHECK (rounding IN ('per_item', 'per_period')),
  version        INT NOT NULL,
  valid_during   DATERANGE NOT NULL,
  source_clause  TEXT NOT NULL,
  CHECK (rate_bps IS NOT NULL OR flat_amount IS NOT NULL)
);

CREATE TABLE fee_runs (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL,
  period      DATERANGE NOT NULL,                  -- the month, or a day for per-event fees
  kind        TEXT NOT NULL CHECK (kind IN ('scheduled', 'adjustment')),
  started_by  UUID NOT NULL REFERENCES users (id),
  started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status      TEXT NOT NULL CHECK (status IN ('draft', 'reviewed', 'posted', 'void'))
);

CREATE TABLE fee_assessments (                      -- one per property, rule and period
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  fee_run_id            UUID NOT NULL REFERENCES fee_runs (id),
  fee_rule_id           UUID NOT NULL REFERENCES fee_rules (id),
  property_id           UUID NOT NULL REFERENCES properties (id),
  basis_amount          BIGINT NOT NULL,
  amount                BIGINT NOT NULL,
  currency              CHAR(3) NOT NULL,
  inputs                JSONB NOT NULL,             -- payment applications or ledger lines in the basis
  corrects_id           UUID REFERENCES fee_assessments (id),
  ledger_transaction_id UUID REFERENCES ledger_transactions (id),
  UNIQUE NULLS NOT DISTINCT (fee_rule_id, property_id, fee_run_id, corrects_id)
);

CREATE TABLE cost_allocations (                     -- central staff, shared services, AI tiers
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  cost_pool         TEXT NOT NULL,                  -- 'central_leasing', 'ai_tier', 'invoice_processing'
  period            DATERANGE NOT NULL,
  allocation_rule_id UUID NOT NULL REFERENCES allocation_rules (id),  -- Budgets owns the rules
  allocation_base   TEXT NOT NULL CHECK (allocation_base IN ('units', 'square_feet', 'hours',
                      'work_orders', 'interactions', 'fixed_share')),  -- the rule's base, as run
  property_id       UUID NOT NULL REFERENCES properties (id),
  base_quantity     NUMERIC NOT NULL,
  amount            BIGINT NOT NULL,
  allowed_by_term_id UUID REFERENCES agreement_terms (id),  -- null: manager's own expense
  ledger_transaction_id UUID REFERENCES ledger_transactions (id)
);

CREATE TABLE owner_reserves (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  property_id   UUID NOT NULL REFERENCES properties (id),
  kind          TEXT NOT NULL CHECK (kind IN ('fixed', 'per_unit', 'percent_until_target')),
  amount        BIGINT NOT NULL,                   -- target or fixed amount, minor units
  rate_bps      INT,
  valid_during  DATERANGE NOT NULL,
  source_term_id UUID REFERENCES agreement_terms (id),
  EXCLUDE USING GIST (property_id WITH =, valid_during WITH &&)
);

CREATE TABLE owner_distributions (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  property_id           UUID NOT NULL REFERENCES properties (id),
  payee_entity_id       UUID NOT NULL REFERENCES legal_entities (id),  -- each fractional holder
  share                 NUMERIC(9, 8) NOT NULL,     -- from ownership_shares on as_of
  as_of                 DATE NOT NULL,
  calculation           JSONB NOT NULL,             -- each line of the calculation, with balances
  amount                BIGINT NOT NULL CHECK (amount >= 0),
  withheld_amount       BIGINT NOT NULL DEFAULT 0,  -- chapter 3 withholding for foreign owners
  currency              CHAR(3) NOT NULL,
  status                TEXT NOT NULL CHECK (status IN ('calculated', 'held', 'approved',
                          'paid', 'returned', 'void')),
  hold_reason           TEXT,
  payout_id             UUID REFERENCES payouts (id),
  ledger_transaction_id UUID REFERENCES ledger_transactions (id),
  UNIQUE (tenant_id, property_id, payee_entity_id, as_of)
);

CREATE TABLE owner_statements (                      -- what was sent, as sent
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  owner_entity_id UUID NOT NULL REFERENCES legal_entities (id),
  period         DATERANGE NOT NULL,
  version        INT NOT NULL,                       -- 2+ is a restatement
  restates_id    UUID REFERENCES owner_statements (id),
  restatement_reason TEXT,
  document_uri   TEXT NOT NULL,
  content_sha256 BYTEA NOT NULL,
  data_as_of     TIMESTAMPTZ NOT NULL,
  sent_at        TIMESTAMPTZ,
  UNIQUE (tenant_id, owner_entity_id, period, version)
);

CREATE TABLE tax_profiles (                           -- owners; vendors keep TIN columns on vendors
  legal_entity_id    UUID PRIMARY KEY REFERENCES legal_entities (id),
  tenant_id          UUID NOT NULL,
  us_person          BOOLEAN NOT NULL,
  tin_token          TEXT,                           -- vaulted, never the TIN
  tin_matched_at     TIMESTAMPTZ,
  form               TEXT NOT NULL CHECK (form IN ('w9', 'w8eci', 'w8ben', 'w8bene', 'none')),
  form_received_on   DATE,
  form_expires_on    DATE,                           -- W-8 forms expire
  withholding_rate_bps INT NOT NULL DEFAULT 0,        -- 3000 when a foreign owner has no W-8ECI
  CHECK (us_person OR form <> 'w9')
);
```

How it runs:

1. **Fee runs read the ledger as of the period close,** never live tables, and post one balanced transaction per assessment, from the owner's funds to the manager's fee income ([Double-Entry Ledger](/docs/payments/payment-states#double-entry-ledger)).
2. **The distribution run is after the fee run and the reconciliation,** and refuses to distribute from a trust account with an open reconciliation difference.
3. **Every distribution line is a ledger balance,** and `calculation` stores them, so the statement and the distribution explain each other.
4. **A missing or expired tax form is a hold,** not a warning; for foreign owners without a W-8ECI the run withholds at the configured rate.
5. **Statements render from the closed period** and are stored before they're sent.

## Auditing

- **The agreement in force on every date,** with the clause each term came from, and every amendment's effective date.
- **Every fee, reproducible:** the rule version, the basis items, the computation and the posting; corrections linked to what they correct.
- **Every distribution's calculation,** the approver, the payout and the bank account it went to, with any change of bank details and its verification.
- **Allocated costs with their authority,** so an owner's audit can see which clause allowed each charge.
- **Statements as sent, and restatements with reasons.**
- **Tax forms received, matched and filed,** with withholding where it applied.

Owners audit managers (the 2020 agreement makes the manager pay for the audit if it finds overpayments above 5%), and state regulators audit trust handling; both start from these records ([Auditing](/books/property-tech/trust-accounting#auditing)).

## What This Means for the System You Build

- **Store the management agreement's operational terms as versioned data** with clause references, and compute deadlines and spending limits from them.
- **Support both fee methods,** by application and by ledger activity, with cash or accrual basis, minimums, maximums and rounding per agreement.
- **Make fee runs reproducible:** read closed periods, store inputs and rule versions, and correct by adjustment, never by rerun.
- **Allocate shared costs only where an agreement allows it,** and cite the clause on every allocation.
- **Compute distributions from ledger balances** net of deposits, prepaid rent, reserves, payables and pending items, split by ownership share.
- **Block disbursements that would make an owner's balance negative,** and record contributions as their own transaction type.
- **Keep reserves as balances, not expenses.**
- **Snapshot every statement as sent** and restate visibly.
- **Collect tax forms at onboarding,** report rents on 1099-MISC, and withhold for foreign owners without a W-8ECI rather than pay in full.

## References

**Agreements**

- [Bluerock Enhanced Multifamily Trust: Property management agreement with Bell Partners (2010)](https://www.sec.gov/Archives/edgar/data/1442626/000089180410005006/exhibit1037.htm), budget timing and 5% tolerance, monthly reports within 15 days, accounts and commingling, emergencies, termination on 30 days with a one-month fee, insurance thresholds and bonding
- [Aimco OP: Property management agreement (2020)](https://www.sec.gov/Archives/edgar/data/1820878/000119312520286288/d894747dex1011.htm), budgets by schedule, owner as signatory, a security deposit account, emergencies with 24-hour notice, 60-day termination, audits with reimbursement above 5% overpayment

**Tax**

- [IRS: Instructions for Forms 1099-MISC and 1099-NEC](https://www.irs.gov/instructions/i1099mec), property managers report rent paid over to the owner in box 1; the $2,000 threshold for tax years beginning after 2025
- [IRS: Publication 515, Withholding of Tax on Nonresident Aliens and Foreign Entities](https://www.irs.gov/publications/p515), withholding on US real property rents unless the payee elects effectively connected treatment with Form W-8ECI; gross-amount withholding; Forms 1042-S and 1042

**Trust rules cited here**

- [10 CCR § 2832.1: Trust fund handling for multiple beneficiaries](https://www.law.cornell.edu/regulations/california/10-CCR-2832.1), written consent of every owner before a disbursement below aggregate trust liability
- [Arizona Department of Real Estate: Trust Compliance Quick Guide (PDF)](https://azre.gov/sites/default/files/2025-12/Trust%20Funds%20Quick%20Guide.pdf), negative owner balances as an indication of conversion

**Platforms**

- [Rent Manager: The benefits of the new standard management fees setup](https://www.rentmanager.com/the-benefits-of-the-new-standard-management-fees-setup/), fees by charge type and fees by GL activity over a date range
- [Rent Manager: Owners](https://www.rentmanager.com/owners/), fee templates per property, owner portal with reserves, balances, distributions and fees, NACHA owner payouts
- [Yardi Breeze: Residential Features](https://www.yardibreeze.com/residential-features/), owner payments with reserves, fractional ownership, pro rata statements, 1099 e-file, escrow and trust accounts
- [Entrata: Accounting](https://www.entrata.com/products/accounting), management fee calculations and sharing information with owners and investors
- [RealPage: Accounting & Financial Suite](https://www.realpage.com/property-management-software/accounting-software/), corporate, property and owner-level reporting in one platform
- [AppFolio: Navigating trust account challenges](https://www.appfolio.com/blog/trust-accounts), processes for negative balances, including owner funds and transfers between an owner's properties with permission
- [Buildium: How to manage owner distributions and statements](https://www.buildium.com/blog/owner-distributions-for-property-managers/), owner draw calculation, reserves held in trust, carrying deficits forward and owner contributions
