+++
title = "Trust Accounting & the General Ledger"
nav_title = "Trust Accounting & the GL"
description = "Money held for others: state trust and deposit account rules, three-way reconciliation, regulator audits, entity general ledgers, and unclaimed property."
category = "Property Tech Industry"
order = 1706
part = "Properties, Owners and Investors"
tags = ["property-tech", "trust-accounting", "general-ledger", "reconciliation", "unclaimed-property"]
+++

Most of the money in a property manager's bank accounts isn't the manager's. Rent belongs to owners until their bills and fees are paid; security deposits belong to residents until move-out; prepaid rent belongs to nobody yet. State law calls this money held in trust, and it gives the manager three duties that shape the whole accounting system: keep it separate from the manager's own money, know at every moment exactly whose each dollar is, and prove both every month in a form a regulator can audit. A shortage in a trust account is not a bookkeeping error to fix next month. It means one owner's or resident's money was spent on someone else, which regulators treat as conversion, and the broker's license is what's at stake.

This chapter covers where the money sits and how the books are kept: trust and deposit account rules by state, the three-way reconciliation that proves the trust account, negative balances and why they're the most common finding, what real estate commission audits look at, general ledgers per legal entity with a shared chart of accounts, and unclaimed property. The generic mechanics (double entry, append-only records, bank file imports, matching and breaks) come from the playbook and the Payments volume, and this chapter links to them rather than repeating them: [Payment States & Ledgers](/docs/payments/payment-states#double-entry-ledger), [Accounting & Revenue Recognition](/docs/payments/accounting), [Ledger & Reconciliation at Provider Scale](/books/payments/ledger-and-reconciliation) and [Treasury & Bank Operations](/books/payments/treasury).

## How the Platforms Do It

The public descriptions are thin on mechanics and consistent in shape:

- **A general ledger with a tenant-wide chart of accounts.** Entrata's general accounting shows a "Master GL Tree" of account numbers, names, types and status, journal entries organized "by units, confidentiality, and more," and receivables and payables tracked through the general journal or through subledgers. Yardi Breeze lets users "track property and corporate general ledgers"; RealPage handles "corporate accounting, property accounting, and owner-level reporting within one platform."
- **Trust and escrow accounts per property.** Yardi Breeze's residential and association editions "maintain escrow and trust accounts for all properties."
- **Bank feeds and automated matching.** Entrata maps and clears transactions "based on your specifications." AppFolio's bank feed "automatically matches and clears" transactions with its records, which it puts at "up to 80-90%," and suggests likely matches for the rest. Entrata's bill pay funds each vendor payment with its own ACH withdrawal, which it presents as simplifying reconciliation.
- **The three-way tie-out as the monthly standard.** AppFolio's guidance calls for "a Triple Tie Out (reconciling and tying funds to owners, banks, and the general ledger)" every month, for every trust account.
- **Unclaimed property tracking.** Entrata's accounting marks payments as unclaimed, and its bill pay keeps "complete void and unclaimed property functionality even after payments have been reconciled."
- **Outsourced accounting.** RealPage and others sell accounting as a managed service ([Centralization and the Outsourced Back Office](/books/property-tech/software-landscape#centralization-and-the-outsourced-back-office)), which doesn't move the license: the broker remains responsible for trust funds whoever keys the entries.

## Whose Money It Is

Every balance in a trust account belongs to a **beneficiary**, and the platform has to name one for every dollar:

| Money | Beneficiary | Until |
| --- | --- | --- |
| Rent and other income collected | The owner of the property | Paid out for the owner's bills, fees and distributions |
| Security deposits | The resident (in states like New York and New Jersey, by statute) | Applied to charges or refunded at move-out |
| Prepaid rent | The resident | The period it pays for begins |
| Owner contributions and reserves | The owner | Spent on the owner's bills or returned |
| Unidentified deposits | Unknown, which is itself a finding | Identified and moved to a beneficiary |
| Broker's own funds (where allowed, e.g. to cover bank fees) | The broker | Withdrawn; limited and tracked |

New York's General Obligations Law says a deposit "shall continue to be the money of the person making such deposit," held in trust and not commingled; New Jersey's Rent Security Deposit Act says the same and adds that it "shall not be mingled with the personal property or become an asset of the person receiving the same." So the beneficiary is not a reporting tag: it's who has a legal claim on the cash.

That makes the trust ledger a two-sided structure the Payments volume already describes for payment providers: assets by bank account on one side, liabilities by beneficiary on the other, and the two must be equal ([A Provider's Chart of Accounts](/books/payments/ledger-and-reconciliation#a-provider-s-chart-of-accounts), [FBO Accounts and Pass-Through Insurance](/books/payments/treasury#fbo-accounts-and-pass-through-insurance)). The differences are who regulates it (a state real estate regulator, not a bank or money transmission regulator) and the granularity (each owner, property and resident is a beneficiary, and the rules are per account, per state).

## State Trust Account Rules

Real estate license law sets the rules for brokers who hold money for others, and they vary in detail while agreeing in shape. Four states as examples, from their regulations and regulator guidance:

| Rule | California | Arizona | Nevada | Florida |
| --- | --- | --- | --- | --- |
| Account designation | Trust account | All property management accounts designated as trust accounts | Trust accounts | Escrow or trust account at a Florida institution |
| Separate deposit account | Not covered here | Not covered here | Two property management accounts: one for rental operations, one solely for security deposits | Under the landlord-tenant statute's options |
| Deposit timing | Not covered here | Within three banking days of receipt | Not covered here | "Immediately," upon receipt |
| Beneficiary records | A separate record for each beneficiary or transaction, in chronological order | Client ledgers | A ledger per owner and tenant | Records under commission rules |
| Reconciliation | At least monthly, records of each kept | Monthly, bank statements to client ledgers to trust ledgers | Within 30 days of receiving the statement; an annual reconciliation report filed with the regulator | Under commission rules |
| Disbursing below liability | Needs written consent of every owner of funds in the account | Underfunding is an indication of conversion | Negative ledgers indicate conversion | Funds kept until disbursement is properly authorized |

Some details matter enough to model directly:

- **California's beneficiary record** lists the date and amount of each deposit, the date, check number and amount of each related disbursement, interest earned and credited, and the balance after each day's transactions, in chronological sequence (10 CCR § 2831.1). An automated system satisfies it if it contains those elements and supports tracing and reconciliation.
- **Arizona's regulator** disallows outstanding deposits older than one month and outstanding checks older than nine months in a reconciliation, and expects them resolved and the reconciliation rerun. It also treats overfunding as an indication of commingling, not just underfunding as conversion.
- **Nevada** requires a reconciliation of the trust account when a designated property manager leaves, covering the preceding 30 days and submitted within 15 days, and an annual trust account reconciliation report (its Form 546) filed by the broker's license anniversary, signed by the broker if an employee prepared it.
- **Delegation doesn't move liability.** Nevada's manual is explicit: the broker "is personally responsible for the supervision and maintenance of the trust fund accounts and records," and neither delegation nor ignorance relieves that. Outsourced or AI-assisted accounting changes who does the work, not who answers for it.

These are rules as data, attached to the property's state and the account's purpose ([Rules as Data](/docs/architecture/rules-as-data)): which accounts must exist, how they must be titled, deposit deadlines in banking days, reconciliation frequency and filing deadlines, outstanding-item age limits, and whether broker funds are permitted. Landlord-Tenant Law as Data owns the rules catalog; this chapter's tables consume it.

## Security Deposit Accounts

Landlord-tenant statutes add rules for deposits that apply to every landlord, licensed or not, and they decide whether deposits can share an account with operating funds:

- **New York.** Deposits must be held in trust, not commingled, and if deposited in a bank, in a New York bank, with the tenant told the bank's name and address and the amount. For buildings with six or more family dwelling units, the account must be interest-bearing, and the landlord may keep 1% a year as an administrative fee, the rest of the interest belonging to the tenant.
- **New Jersey.** Deposits go into an interest-bearing account at an insured New Jersey institution or an eligible money market fund (the money market option and variable-rate rules apply to landlords with 10 or more units). The tenant is told in writing the institution's name and address, the type of account, the current rate and the amount within 30 days of receipt, within 30 days of moving the deposit, within 30 days of a transfer of ownership, and with each annual interest payment. A landlord who fails to notify or pay interest can be told to apply the deposit plus 7% annual interest to rent.
- **Florida.** The landlord chooses one of three methods: a separate non-interest-bearing account in a Florida institution, a separate interest-bearing account paying the tenant at least 75% of the annualized average rate or 5% simple interest, or a surety bond with 5% interest to the tenant; deposits may not be commingled, and the tenant is told which method within 30 days.

So a deposit is a liability to a specific resident, in a specific account whose location, interest and notices are governed by the property's state, and sometimes by its unit count. Interest accrues per deposit and is paid or credited on the statute's schedule; changing banks triggers notices. The deposit's life at move-in and move-out (collection, itemized deductions and the return deadline) is in Move-In & Move-Out; deposit alternatives that replace the cash are in Insurance, Deposits & Guarantees.

## Three-Way Reconciliation

The test that proves a trust account is a reconciliation of three numbers that must all agree on the same date:

```text
1. adjusted bank balance   = bank statement ending balance
                             + deposits in transit
                             - outstanding checks and withdrawals
2. book balance            = the trust account's cash balance in the ledger
3. beneficiary total       = sum of every owner, resident and other beneficiary balance
                             (Arizona: owner funds + tenant funds + broker funds)

1 = 2 = 3, and no beneficiary balance is negative
```

Nevada's manual puts it plainly: the account liability, the reconciled check register and the reconciled bank statement "must all show the same balance," and if they don't, the broker must locate the error before it compounds. Two-way reconciliation (bank to book) is what every business does ([Bank Reconciliation Is Its Own Discipline](/books/payments/treasury#bank-reconciliation-is-its-own-discipline)); the third leg is what trust law adds, because a book balance can match the bank exactly while one owner's negative balance is being covered by another's positive one.

How a platform runs it:

- **The bank leg is the Payments volume's matching engine.** Statement lines import as external records, match against ledger entries, and leftovers become breaks with owners ([A Matching Engine](/books/payments/ledger-and-reconciliation#a-matching-engine), [Breaks](/books/payments/ledger-and-reconciliation#breaks)). Bank feeds make this daily instead of monthly, which in my view is the biggest improvement a platform can make to trust compliance.
- **The beneficiary leg is a query,** not a report someone exports: the sum of every liability account dimensioned by beneficiary for that bank account, as of the date.
- **Outstanding items age against the state's limits.** A deposit in transit for six weeks or a check outstanding for ten months is flagged before month end, not discovered in the reconciliation.
- **The reconciliation is a signed record,** with the three numbers, the outstanding items listed, the negative beneficiary balances listed (expected: none), the preparer, the reviewer (the broker where the state requires it) and the evidence ([Closing the Day and the Month](/books/payments/ledger-and-reconciliation#closing-the-day-and-the-month)).
- **A difference blocks money out.** No distributions or discretionary payments from a trust account with an unexplained difference, which is the same rule as the Payments volume's cash breaks holding payouts.

## Negative Balances and Conversion

A negative beneficiary balance means the platform paid something for a beneficiary who had no money, and the cash came from someone else. Regulators read it as conversion, and it's preventable in software.

A 2023 decision by California's Department of Real Estate shows the pattern. The Department's routine audit of a property management firm (about 153 residential properties with 158 units and one 10-unit apartment complex, for 106 owners, collecting about $4.5 million a year in trust funds) reconciled each of its two trust accounts as of April 30, 2021, comparing the adjusted bank balance with the sum of the separate beneficiary records:

| | Rent account | Deposit account |
| --- | --- | --- |
| Shortage | $5,916.48 | $60,395.00 |
| From negative owner balances | $3,095.59 | $8,632.83 |
| From funds received and not deposited | $619.42 and $1,000.00 | |
| Unidentified | $1,201.47 | $51,762.17 |
| Written owner consent to the shortfall | None found | None found |

The violations were the regulation requiring every owner's written consent before disbursing below aggregate liability and the statute governing trust funds; the order required the firm to pay the cost of the audit and of a follow-up audit under the Business and Professions Code. Every line in that table is something a platform can stop or catch: a disbursement that would take a beneficiary negative, a receipt recorded but not deposited, and a difference that went unexplained long enough that nobody could trace it.

My rules:

- **Disbursements check the beneficiary's available balance** at approval and at release, and a payment that would go negative is blocked, routed to the owner for a contribution, or paid from the broker's own account as a recorded advance ([Owner Distributions](/books/property-tech/owners-and-management-agreements#owner-distributions)).
- **Receipts are deposited and matched within the state's deadline,** and an unmatched receipt is a break with an owner on day one.
- **Bank fees and returned items are charged to a beneficiary** (the owner whose resident's payment returned) or covered by broker funds where the state allows it, never left to drift.
- **Unidentified money goes to a suspense beneficiary** with an aging clock, and suspense isn't distributable ([Suspense Accounts and Who Works Breaks](/books/payments/ledger-and-reconciliation#suspense-accounts-and-who-works-breaks)).

## Real Estate Commission Audits

"Commission" here means the state's real estate commission or department, and its audits are the external check on everything above. California's audits, as described in the decision above, obtain the broker's trust records, interview the broker, reconcile each trust account and test the separate beneficiary records; the cost of the audit is charged to the broker when violations are found. Arizona publishes its reconciliation form and red flags; Nevada requires the annual reconciliation filing, which is an audit trigger in itself.

What a platform needs to hand an auditor without a scramble:

- **Every trust account's reconciliation for the audit period,** as prepared and signed, not regenerated.
- **Each beneficiary's chronological record** in the state's required form, from the ledger.
- **Bank statements and the import evidence** behind each matched item.
- **Agreements and consents:** management agreements, written consents for any disbursement below liability, and authorizations for broker funds in the account.
- **The account inventory:** every trust account, its title as shown by the bank, its purpose, its signatories and their bonding.

Owners' auditors ask for the same records from the other side ([Auditing](/books/property-tech/owners-and-management-agreements#auditing)); which records each regulator wants and how long they're kept is in Records, Privacy & Audits.

## The General Ledger by Entity

A trust account proves cash; a general ledger keeps the books of each legal entity. The platform keeps many sets of books at once:

- **Each owning entity's books,** by property, usually on the owner's chosen basis (cash for small owners, accrual for institutional ones), with statements produced from them ([Owner Reporting](/books/property-tech/owners-and-management-agreements#owner-reporting)).
- **The manager's corporate books,** where fee income, payroll and overhead live. Fees are an entry in both: an expense in the owner's books, income in the manager's.
- **Funds and investment entities,** whose books hold their investment in property-owning entities ([Investors, Funds & Asset Management](/books/property-tech/investors-and-asset-management#fund-and-investor-accounting)).
- **Associations,** whose books are their own and whose funds the manager holds in trust (Community Associations).

The design that works is **one ledger, many entities**: every ledger account is dimensioned by the legal entity whose books it belongs to and the property it relates to, and each entity's trial balance is a filter, not a separate database. A transaction that crosses entities (the manager pays a vendor for two owners' properties with one check from an operating account, then is reimbursed) posts **due to / due from** entries in each entity's books that must net to zero across them, and a nightly check proves they do. Consolidation for an owner with several entities is then a sum with eliminations, not an export.

Period close is per entity: each entity's books close on its own schedule, and once closed, corrections post to the open period ([Month-End Close](/docs/payments/accounting#month-end-close), [Closed Periods Stay Closed](/docs/payments/accounting#closed-periods-stay-closed)). Cash versus accrual is a reporting basis over the same entries: accrual recognizes rent when charged, cash when paid, and both are computed from charges, payments and applications rather than kept as two ledgers ([Cash Is Not Revenue](/docs/payments/accounting#cash-is-not-revenue)).

### The Chart of Accounts

The tenant keeps a **master chart of accounts** that every property's books use, so a portfolio's income statement adds up without mapping. Owners with their own charts (institutional owners, funds, lenders) get a mapping from the master chart to theirs, kept as data and versioned, and the owner's reporting package is rendered in their chart ([Data from Third-Party Managers](/books/property-tech/investors-and-asset-management#data-from-third-party-managers)). Charge codes map to income accounts, so the resident ledger, the owner's books and the fee basis agree by construction (Charges & Resident Ledgers).

Accounts that matter for trust:

- **Cash, per bank account,** flagged as trust or operating.
- **Owner funds held,** per owner and property: the owner's equity in the trust account.
- **Security deposits held,** per lease, and **deposit interest payable,** per lease.
- **Prepaid rent,** per lease.
- **Due to / due from,** per pair of entities.
- **Suspense,** per bank account.

## Bank Accounts

Two structures coexist, and the platform has to support both:

- **Pooled trust accounts.** One trust account (or one per state, or one per purpose) holds money for many owners, with beneficiaries separated only in the ledger. This is common for single-family and small-portfolio managers and is where three-way reconciliation is essential.
- **Accounts per property or per owner.** Institutional owners often require an operating account and a deposit account per property, in the owner's name with the owner as signatory, as the 2020 agreement in [The Management Agreement](/books/property-tech/owners-and-management-agreements#the-management-agreement) does. Reconciliation is simpler per account, and there are hundreds of them.

Each account records its holder, the title as the bank shows it (trust designation is often a titling requirement), the state and location of the depository (several statutes require an in-state institution), interest terms, signatories and the properties whose money it holds over time. Payments collected through a processor land first in the processor's or the platform's FBO account and are paid out to these accounts; the trust obligation starts when the manager receives the money, which is a reason the Collecting Rent chapter cares who holds money in transit.

## Unclaimed Property

Money in a property platform goes unclaimed all the time: a deposit refund check mailed to a former resident's old address and never cashed, a credit balance left on a closed lease, an owner distribution check that bounced back, a vendor payment never deposited. After a dormancy period, state unclaimed property law requires the holder (the manager, or the owner, depending on who holds the funds) to report and remit it to the state, after first trying to reach the owner.

The mechanics differ by state and property type, and the shape is the same:

- **Dormancy periods vary by state and by property type.** Texas, for example, says abandonment "varies according to the property type."
- **Due diligence notice before reporting.** Texas requires notices by mail or email no later than 60 days before the July 1 report deadline, telling the owner the holder has the property and will deliver it to the state if it isn't claimed.
- **Report and remit on the state's cycle,** and keep records: Texas asks holders to retain records of their report for at least 10 years.
- **The voided check isn't the end of the money.** Voiding an uncashed refund check returns the cash to the trust account, but the liability to the resident remains; it moves to an unclaimed liability, not back to the owner, and from there to the state.

So unclaimed property is a lifecycle per item: outstanding payment, stale (past the account's own threshold, and past Arizona's nine months for outstanding checks), voided to unclaimed liability, due diligence sent, reported, remitted, and claimed back if the owner later surfaces with the state. The state that gets it, the dormancy and the notice rules are rules-as-data per state and property type; a ledger entry moves the liability at each step, so the trust reconciliation still ties.

## How to Build It

Deltas against [The Core Data Model](/books/property-tech/property-business#the-core-data-model) and the Payments volume's ledger and bank tables ([the core ledger](/books/payments/card-payments#the-core-data-model), [Ledger & Reconciliation](/books/payments/ledger-and-reconciliation#how-to-build-it), [Treasury](/books/payments/treasury#how-to-build-it)), which already give ledger transactions a `period`, a `created_at` and a `corrects_id`, and give bank statement lines, matches and breaks their own tables. This chapter makes the ledger multi-entity and adds trust specifics.

```sql
CREATE TABLE gl_accounts (                            -- the tenant's master chart
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL REFERENCES tenants (id),
  number         TEXT NOT NULL,                       -- '1110', '2310', '4100'
  name           TEXT NOT NULL,
  account_type   TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity',
                   'income', 'expense')),
  parent_id      UUID REFERENCES gl_accounts (id),    -- rollups for statements
  trust_role     TEXT CHECK (trust_role IN ('trust_cash', 'owner_funds', 'security_deposits',
                   'deposit_interest', 'prepaid_rent', 'suspense', 'unclaimed', 'broker_funds')),
  status         TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  UNIQUE (tenant_id, number)
);

-- Every ledger account belongs to one entity's books, and carries its dimensions.
ALTER TABLE ledger_accounts
  ADD COLUMN tenant_id               UUID REFERENCES tenants (id),
  ADD COLUMN legal_entity_id         UUID REFERENCES legal_entities (id),  -- whose books
  ADD COLUMN gl_account_id           UUID REFERENCES gl_accounts (id),
  ADD COLUMN property_id             UUID REFERENCES properties (id),
  ADD COLUMN beneficiary_entity_id   UUID REFERENCES legal_entities (id),  -- owner funds
  ADD COLUMN beneficiary_lease_id    UUID REFERENCES leases (id),          -- deposits, prepaid rent
  ADD COLUMN counterparty_entity_id  UUID REFERENCES legal_entities (id);  -- due to / due from

ALTER TABLE bank_accounts
  ADD COLUMN tenant_id          UUID REFERENCES tenants (id),
  ADD COLUMN holder_entity_id   UUID REFERENCES legal_entities (id),
  ADD COLUMN title_on_account   TEXT,                 -- as the bank shows it
  ADD COLUMN is_trust           BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN trust_purpose      TEXT CHECK (trust_purpose IN ('operating', 'security_deposits',
                                  'association', 'escrow')),
  ADD COLUMN depository_state   TEXT,                 -- ISO 3166-2 of the branch
  ADD COLUMN interest_bearing   BOOLEAN NOT NULL DEFAULT FALSE,
  DROP CONSTRAINT bank_accounts_purpose_check,
  ADD CONSTRAINT bank_accounts_purpose_check CHECK (purpose IN ('fbo', 'reserve', 'operating',
                                  'clearing', 'collateral', 'trust', 'corporate'));

CREATE TABLE bank_account_properties (               -- whose money is in which account, when
  tenant_id       UUID NOT NULL,
  bank_account_id UUID NOT NULL REFERENCES bank_accounts (id),
  property_id     UUID NOT NULL REFERENCES properties (id),
  money_kind      TEXT NOT NULL CHECK (money_kind IN ('operating', 'security_deposits')),
  valid_during    DATERANGE NOT NULL,
  EXCLUDE USING GIST (property_id WITH =, money_kind WITH =, valid_during WITH &&)
);

CREATE TABLE bank_account_signatories (
  tenant_id       UUID NOT NULL,
  bank_account_id UUID NOT NULL REFERENCES bank_accounts (id),
  user_id         UUID NOT NULL,
  bonded_amount   BIGINT,                              -- where the agreement or state requires it
  valid_during    DATERANGE NOT NULL
);

CREATE TABLE entity_periods (                          -- close per entity
  tenant_id        UUID NOT NULL,
  legal_entity_id  UUID NOT NULL REFERENCES legal_entities (id),
  period           DATE NOT NULL,                      -- first day of the month
  status           TEXT NOT NULL CHECK (status IN ('open', 'closing', 'closed')),
  closed_at        TIMESTAMPTZ,
  closed_by        UUID,
  PRIMARY KEY (legal_entity_id, period)
);

CREATE TABLE trust_reconciliations (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id              UUID NOT NULL,
  bank_account_id        UUID NOT NULL REFERENCES bank_accounts (id),
  as_of                  DATE NOT NULL,
  statement_balance      BIGINT NOT NULL,
  deposits_in_transit    BIGINT NOT NULL,
  outstanding_payments   BIGINT NOT NULL,
  adjusted_bank_balance  BIGINT NOT NULL,
  book_balance           BIGINT NOT NULL,
  beneficiary_total      BIGINT NOT NULL,
  negative_beneficiaries INT NOT NULL,                 -- expected: zero
  stale_items            INT NOT NULL,                 -- past the state's age limits
  status                 TEXT NOT NULL CHECK (status IN ('draft', 'prepared', 'reviewed',
                           'filed')),                  -- filed: submitted where a state requires it
  prepared_by            UUID,
  reviewed_by            UUID,                         -- the broker, where required
  evidence_uri           TEXT,                         -- the frozen package
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (adjusted_bank_balance = statement_balance + deposits_in_transit - outstanding_payments),
  CHECK (reviewed_by IS NULL OR reviewed_by <> prepared_by),
  UNIQUE (bank_account_id, as_of)
);

CREATE TABLE trust_reconciliation_items (               -- what made up each leg
  reconciliation_id      UUID NOT NULL REFERENCES trust_reconciliations (id),
  kind                   TEXT NOT NULL CHECK (kind IN ('deposit_in_transit', 'outstanding_payment',
                           'negative_beneficiary', 'unexplained_difference')),
  ledger_entry_id        UUID REFERENCES ledger_entries (id),
  ledger_account_id      UUID REFERENCES ledger_accounts (id),
  amount                 BIGINT NOT NULL,
  age_days               INT,
  break_id               UUID REFERENCES breaks (id)
);

CREATE TABLE unclaimed_property_items (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id              UUID NOT NULL,
  holder_entity_id       UUID NOT NULL REFERENCES legal_entities (id),
  source_type            TEXT NOT NULL CHECK (source_type IN ('deposit_refund', 'credit_balance',
                           'owner_distribution', 'vendor_payment', 'other')),
  source_id              UUID NOT NULL,                 -- the payout, lease or payable
  apparent_owner_name    TEXT NOT NULL,
  last_known_address_id  UUID REFERENCES addresses (id),
  property_type_code     TEXT NOT NULL,                 -- the state's code for this kind of property
  reporting_state        TEXT NOT NULL,
  amount                 BIGINT NOT NULL,
  currency               CHAR(3) NOT NULL,
  last_owner_contact_on  DATE NOT NULL,                 -- dormancy runs from here
  dormant_on             DATE NOT NULL,                 -- computed from the state's rule
  due_diligence_sent_on  DATE,
  status                 TEXT NOT NULL CHECK (status IN ('outstanding', 'voided_to_unclaimed',
                           'due_diligence_sent', 'claimed_by_owner', 'reported', 'remitted')),
  report_id              UUID,                          -- the state filing it went in
  ledger_transaction_id  UUID REFERENCES ledger_transactions (id)
);
```

The beneficiary leg of the reconciliation, from the ledger:

```sql
SELECT SUM(bal.balance)                          AS beneficiary_total,
       COUNT(*) FILTER (WHERE bal.balance < 0)   AS negative_beneficiaries
FROM (
  SELECT a.id, SUM(e.amount) AS balance
  FROM ledger_accounts a
  JOIN gl_accounts g          ON g.id = a.gl_account_id
  JOIN ledger_entries e       ON e.ledger_account_id = a.id
  JOIN ledger_transactions t  ON t.id = e.ledger_transaction_id AND t.status = 'posted'
  JOIN bank_account_properties bp
    ON bp.property_id = a.property_id AND bp.valid_during @> :as_of::date
   AND bp.bank_account_id = :bank_account_id
  WHERE g.trust_role IN ('owner_funds', 'security_deposits', 'deposit_interest',
                         'prepaid_rent', 'suspense', 'unclaimed', 'broker_funds')
    AND t.effective_at < :as_of::date + 1
  GROUP BY a.id
) bal;
```

How it runs:

1. **Every posting names its entity and beneficiary,** and a constraint trigger rejects a trust cash entry whose transaction has no beneficiary-side entry.
2. **Disbursement approval and release both check** the beneficiary's available balance in the same transaction as the hold, so two approvals can't both spend the last dollar ([Transactions & Concurrency](/docs/database/transactions-and-concurrency)).
3. **Bank lines import daily,** match, and open breaks; the trust reconciliation is assembled from matched items and the beneficiary query, then frozen with its evidence.
4. **The distribution and fee runs check** for an unreviewed or unbalanced reconciliation on the account before they move money.
5. **Due to / due from pairs net to zero** across entities nightly, and a nonzero result is a break.
6. **Unclaimed items are created** when an outstanding payment passes the tenant's stale threshold, and the dormancy date is computed from the state's rule.

## Auditing

- **Every trust reconciliation as prepared and signed,** with its items and evidence, and any filing made to a regulator.
- **Each beneficiary's chronological record** reproducible for any date range, in the form the state requires.
- **Every disbursement's balance check,** and every override (an advance from broker funds, an owner's written consent) with its document.
- **Bank account inventory over time:** titles, purposes, depositories, signatories and bonding, and which properties' money each held when.
- **Closed periods per entity,** with corrections posted forward and linked.
- **Unclaimed property items through their whole life,** with due diligence evidence and the report and remittance each went into.

The mechanics of append-only history and evidence are in [Audit Trails](/docs/architecture/audit-trails) and the Payments volume's [Proving It to Auditors and Sponsor Banks](/books/payments/ledger-and-reconciliation#proving-it-to-auditors-and-sponsor-banks); retention by record type is in Records, Privacy & Audits.

## What This Means for the System You Build

- **Name a beneficiary for every dollar in a trust account,** and keep liabilities by beneficiary equal to cash by bank account.
- **Encode each state's trust and deposit account rules as data:** account designation and location, deposit deadlines, interest and notices, reconciliation frequency, filings and outstanding-item limits.
- **Run three-way reconciliation from the ledger,** daily where bank feeds allow and signed monthly, and block money out of an account that doesn't tie.
- **Block disbursements that would take a beneficiary negative,** and record contributions, advances and consents explicitly.
- **Keep one ledger with entity, property and beneficiary dimensions,** due to / due from pairs that net to zero, and close per entity.
- **Keep a master chart of accounts** and version the mappings to owners' charts.
- **Model unclaimed property as a lifecycle per item,** with dormancy and notices from state rules and the liability moving in the ledger at each step.
- **Remember that the broker answers for trust funds** however the work is staffed or automated.

## References

**Regulations and regulator guidance**

- [10 CCR § 2831.1: Separate record for each beneficiary or transaction](https://www.law.cornell.edu/regulations/california/10-CCR-2831.1), the fields of the beneficiary record and when automated systems satisfy it
- [10 CCR § 2831.2: Trust account reconciliation](https://www.law.cornell.edu/regulations/california/10-CCR-2831.2), monthly reconciliation of beneficiary records to the record of trust funds received and disbursed
- [10 CCR § 2832.1: Trust fund handling for multiple beneficiaries](https://www.law.cornell.edu/regulations/california/10-CCR-2832.1), written consent of every owner before disbursing below aggregate trust liability
- [California DRE: Decision in H-7182 SAC (2023, PDF)](https://www2.dre.ca.gov/hearingfiles/H07182SAC_230831_P.pdf), the audit's scope, trust collections, shortages by cause, missing consents and audit costs under section 10148
- [Arizona Department of Real Estate: Trust Compliance Quick Guide (PDF)](https://azre.gov/sites/default/files/2025-12/Trust%20Funds%20Quick%20Guide.pdf), trust designation, deposits within three banking days, monthly three-way reconciliation, over- and underfunding, negative balances, outstanding item limits
- [Nevada Real Estate Division: Trust Fund Accounting and Record Keeping for Nevada Brokers (PDF)](https://red.nv.gov/uploadedFiles/rednvgov/Content/Publications/References/Trust-Fund-Accounting-and-Record-Keeping-for-Nevada-Brokers.pdf), two property management accounts, reconciliation within 30 days, the three balances, negative ledgers, the annual reconciliation filing, broker responsibility
- [Florida Statutes § 475.25](https://www.flsenate.gov/Laws/Statutes/2025/475.25), brokers placing entrusted funds immediately in an account until disbursement is properly authorized

**Security deposit statutes**

- [New York General Obligations Law § 7-103](https://www.nysenate.gov/legislation/laws/GOB/7-103), deposits held in trust in a New York bank, interest-bearing for six or more units, 1% administrative fee
- [New Jersey DCA: Rent Security Deposit Act (PDF)](https://www.nj.gov/dca/codes/publications/pdf_lti/sdepsit_law.pdf), deposits held in trust, account options and the 10-unit threshold, notices within 30 days and annually, the 7% remedy
- [Florida Statutes § 83.49](https://www.flsenate.gov/Laws/Statutes/2025/83.49), the three holding methods, no commingling, notice within 30 days

**Unclaimed property**

- [Texas Comptroller: How to File](https://comptroller.texas.gov/programs/unclaimed/how-to-file.php), dormancy by property type, due diligence notices 60 days before the July 1 deadline, 10-year record retention

**Platforms**

- [Entrata: General Accounting](https://www.entrata.com/products/general-accounting), the Master GL Tree, journal entries and automated bank clearing
- [Entrata: Accounting](https://www.entrata.com/products/accounting), unclaimed property tracking
- [Entrata: Bill Pay](https://www.entrata.com/products/billpay), an ACH withdrawal per payment and void and unclaimed handling after reconciliation
- [AppFolio: Automated bank reconciliations with Bank Feed](https://www.appfolio.com/articles/automated-bank-reconciliations), automatic matching of up to 80-90% and suggested matches
- [AppFolio: Accounting process KPIs](https://www.appfolio.com/blog/accounting-process-kpis), the monthly triple tie-out to owners, banks and the general ledger
- [Yardi Breeze: Associations Features](https://www.yardibreeze.com/associations-features/), escrow and trust accounts and property and corporate general ledgers
- [RealPage: Accounting & Financial Suite](https://www.realpage.com/property-management-software/accounting-software/), corporate, property and owner-level accounting on one platform
