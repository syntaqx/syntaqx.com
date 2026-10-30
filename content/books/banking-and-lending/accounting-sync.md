+++
title = "Accounting Sync & the Close"
description = "Getting spend into the books: GL coding and dimensions, the QuickBooks, NetSuite, Xero and Sage Intacct object models, idempotent sync, accruals and close."
category = "Banking & Lending Industry"
order = 2469
part = "Spend Management"
tags = ["banking", "spend-management", "accounting", "erp", "integrations", "month-end-close"]
+++

A spend platform's customer doesn't keep its books in the spend platform. It keeps them in an accounting system or ERP (QuickBooks Online for most small companies, Xero for many outside the US, NetSuite and Sage Intacct as companies grow), and every card swipe, bill, reimbursement and card payment has to arrive there coded to the right account and dimensions, once, in the right period. "Accounting sync" is how a spend platform earns the finance team's loyalty or loses it: a controller who closes the month in three days because the card spend arrived coded and reconciled won't switch, and one who spends a week fixing duplicates will.

This chapter covers GL coding and dimensions, each ERP's object model for the records spend produces, what to post as what, sync mechanics (idempotency, concurrency, limits and closed periods), accruals and the month-end close, with a worked card accrual. It is the customer's books, not the institution's: the bank's own chart of accounts and its daily GL feed from the core are in [Core Banking Systems](/books/banking-and-lending/core-banking-systems). The general pattern of syncing a product's facts to an accounting system, summary or detail, sync logs and idempotent posting, is the playbook's [Accounting](/docs/payments/accounting#syncing-to-the-accounting-system); this chapter covers what spend adds.

## How the Platforms Do It

As of October 2026, the four accounting systems spend platforms most often sync to, from each vendor's own developer documentation and published API schemas:

| | QuickBooks Online | Oracle NetSuite | Xero | Sage Intacct |
| --- | --- | --- | --- | --- |
| **Vendor bill** | `Bill`, "an AP transaction representing a request-for-payment from a third party" | `vendorbill`, transformed from a `purchaseorder` | `Invoice` with `Type` `ACCPAY` | `APBILL` with `APBILLITEM` lines |
| **Bill payment** | `BillPayment` | `vendorpayment`, transformed from a `vendorbill` | `Payment` against the invoice | AP payment |
| **Card or cash spend** | `Purchase`, with `PaymentType` `Cash`, `Check` or `CreditCard` | A transaction or journal entry, by design | `BankTransaction` with `Type` `SPEND` | A journal entry or AP record, by design |
| **Expense report** | No separate object in the schema read | `expensereport`, transformed from an `employee` | No separate object in the schema read | `EEXPENSES`, with a reimbursement currency |
| **Journal entry** | `JournalEntry` | `journalentry` | `ManualJournal`, with a required narration | `GLBATCH` with `GLENTRY` lines (at least one debit and one credit) and an optional `REVERSEDATE` |
| **Dimensions** | Class on expense lines; Department (labeled location) on the transaction | Subsidiary (primary with OneWorld), department, class, location, and "an unlimited number of custom segments" | Tracking categories, "a maximum of 2" per line | Department, location, project, task, cost type, customer, vendor, employee, item, class, contract, warehouse, plus user-defined `GLDIM` dimensions |
| **Concurrency and retries** | `SyncToken` version: an update with an older token fails | `X-NetSuite-idempotency-key` header; duplicates return `IDEMPOTENCY_ERROR`; account-level concurrency limit | `Idempotency-Key` header (128 characters); 5 concurrent, 60 calls a minute, 5,000 a day per organization | `controlid` with `uniqueid="true"`, so "a request cannot be repeated" |
| **Period control** | Not in the schema read | Closed periods block all GL posting; A/P, A/R and payroll can be locked separately | `PeriodLockDate` and `EndOfYearLockDate` | Not in the pages read |

And from the spend side, BILL describes "two-way sync" with QuickBooks Online and Desktop, NetSuite, Sage Intacct, Xero and Microsoft Dynamics 365 Business Central, and Ramp syncs bills, vendors and POs to NetSuite, QuickBooks and Sage Intacct and uses the ERP's POs and item receipts for its three-way match ([AP, Bill Pay & Procurement](/books/banking-and-lending/accounts-payable#two-and-three-way-match)).

Three things follow. **Dimensions don't translate one to one:** a company coding spend to department, location, project and a custom "cost center" can carry all four into NetSuite or Sage Intacct, two into Xero, and class plus location into QuickBooks Online, so the platform's coding model must be the richest one and each connector must say which dimensions it drops or maps. **Card spend has no common object:** QuickBooks has a card purchase, Xero a bank transaction against the card's account, and the larger ERPs leave it to the integration's design, so the same swipe lands as different record types. **Each API has its own retry contract:** an idempotency header in NetSuite and Xero, a unique control ID in Sage Intacct, an optimistic version token in QuickBooks, and a sync that ignores them posts duplicates under exactly the conditions (timeouts, rate limits) it will meet every day.

## The Customer's Chart Is Not the Platform's

The core model's `gl_accounts` is an institution's chart of accounts: the bank's deposit liability lines and loan asset lines, which the core posts to. A spend platform's customer has its own chart in its own ERP, and the platform never owns it. So spend records are coded against a **mirror** of the customer's chart and dimensions, pulled from the ERP, with the ERP's internal IDs, active flags and types, refreshed on a schedule and on demand. When the controller deactivates an account in the ERP, codings that point at it must fail before sync, not when the ERP rejects the batch on the last day of the month.

The two sets of books meet at the card and the bank account. The card balance the platform's issuing bank carries as a receivable ([Corporate Cards & Underwriting](/books/banking-and-lending/corporate-cards)) is, on the customer's books, a credit card liability account; the business's deposit account at the platform's partner bank ([Business Accounts & Startup Banking](/books/banking-and-lending/business-accounts)) is a bank account in the customer's chart. Each side reconciles to the other through the statement.

## GL Coding and Dimensions

Coding assigns each spend line a GL account and a value for each dimension the customer uses. On a card transaction it comes from, in rough order of precedence:

- **The line's own source:** the PO line it's matched to, or the bill line's coding as approved.
- **Rules:** by vendor or merchant, merchant category code, card (a card issued for one vendor or project carries that coding), or employee (a default department). Ramp auto-fills GL coding only at high confidence or when a rule applies; that conservatism is the right default for any predicted coding.
- **The employee's choice** on submission, where the policy allows it.
- **A reviewer's correction,** which should feed the rules or the model, not just this line.

Split lines are normal: one hotel folio is lodging, meals and parking, three GL accounts; one software invoice is shared by three departments. A split is a set of child lines whose amounts sum exactly to the parent, with the rounding remainder assigned to one line by a stated rule ([Money & Amounts](/docs/payments/money)).

Required-dimension rules belong in the coding model, checked before sync: NetSuite requires each classification to be associated with a subsidiary, Sage Intacct requires a location in a multi-entity company, and a customer's own policy may require a project for every client-billable line (QuickBooks carries a billable status and customer on expense lines for rebilling). A line the ERP will reject should be caught where a person can fix it.

## What to Post as What

The core events, mapped to each system (a refund posts as the reverse of its purchase):

| Event | Customer's books | QuickBooks Online | Xero | NetSuite and Sage Intacct |
| --- | --- | --- | --- | --- |
| **Card transaction settles** | Debit expense (coded), credit card liability | `Purchase`, `PaymentType` `CreditCard`, against the card account | `BankTransaction` `SPEND` on the card account | A card transaction record or a journal entry, per the integration's design |
| **Bill approved** | Debit expense or asset (coded), credit accounts payable | `Bill` | `Invoice` `ACCPAY` | `vendorbill` / `APBILL` |
| **Bill paid** | Debit accounts payable, credit bank (or card liability if paid by card) | `BillPayment` | `Payment` | `vendorpayment` / AP payment |
| **Reimbursement** | Debit expense (coded), credit employee payable; then debit employee payable, credit bank | A bill to the employee as a vendor (one design), then its payment | An `ACCPAY` invoice to the employee (one design), then its payment | `expensereport` / `EEXPENSES`, then its payment |
| **Card statement paid** | Debit card liability, credit bank | A transfer or bill payment to the card account | A transfer | A journal entry or transfer |

Two rules keep this sane. **Post each fact once, from the system that owns it:** if the ERP already imports the bank feed and the platform also posts the card payment, the payment lands twice; the connector must know which side owns bank transactions and which owns the spend. **Post the card payment as a transfer between the bank and the card liability, never as an expense:** the expenses were posted transaction by transaction, and the card statement is only the settlement of a liability already recorded.

Whether to post detail or summaries is the playbook's [Summary Journals or Detail](/docs/payments/accounting#summary-journals-or-detail) question. Spend almost always goes in detail (one record per transaction, with the receipt attached), because the controller and the auditor need to open one expense from the GL; payment platforms, by contrast, often post summaries of thousands of small sales.

## Sync Mechanics

A sync engine for spend is a set of per-object pipelines, each mapping one platform record to one ERP record, with the ERP's ID written back.

- **Idempotency per ERP.** Derive a key from the platform record and its version, and send it the way each API expects: NetSuite's `X-NetSuite-idempotency-key` header (a duplicate returns `IDEMPOTENCY_ERROR` pointing at the earlier job), Xero's `Idempotency-Key` header, a unique Sage Intacct `controlid`. Where an API offers no such contract in the documentation you can read, look the record up by the external reference you wrote on it before creating it again. The general rules are in [Idempotent Sync](/docs/payments/accounting#idempotent-sync) and [Idempotency](/docs/payments/idempotency).
- **Optimistic concurrency.** QuickBooks increments an entity's `SyncToken` on every change, and "an attempt to modify an entity specifying an older SyncToken will fail." An update from the platform must carry the token it last read, and a failure means someone edited the record in the ERP: re-read, decide which side wins for each field (the coding usually belongs to the platform until the period closes, the ERP's edits after that), and record the conflict.
- **Rate limits and concurrency.** Xero allows 5 calls in progress, 60 a minute and 5,000 a day per connected organization, returning 429 with `Retry-After`; NetSuite governs concurrent web services requests at the account level. A month-end catch-up of 20,000 transactions into a Xero organization is four days of daily allowance, so the engine must batch where the API allows, spread syncs through the month, and expose the queue to the customer. Back off as [Retries & Timeouts](/docs/architecture/retries-and-timeouts) describes.
- **Edits and deletions after sync.** A recoded transaction updates the ERP record (with its version token); a voided bill voids, not deletes, the ERP record. Never delete an ERP record the customer's books have relied on; post the correction.
- **Closed periods.** A NetSuite period in Closed status "prevents posting to the general ledger for any dates included in the period, by anyone", and A/P can be locked on its own; Xero has a period lock date. A late-arriving October transaction after the October close posts in the first open period with its original date in the memo, or waits for the controller's decision, by policy, and the platform shows which. Mirror the ERP's lock dates so the platform stops recoding locked transactions too ([Closed Periods Stay Closed](/docs/payments/accounting#closed-periods-stay-closed)).
- **Attachments.** The receipt or invoice image goes with the record (QuickBooks' attachable references, NetSuite and Xero file attachments), because the ERP is where the auditor will look.

## Accruals and the Close

Month-end close for spend is mostly cutoff: getting every expense into the month it was incurred, whichever statement or sync it arrives on. Three dates rarely line up, as Spendesk's guidance on card accruals puts it: the card statement's closing date decides which charges are on that statement, the calendar month-end is the reporting cutoff, and the payment due date only decides when cash leaves. "Receipt or consumption of the goods or services is the accounting trigger."

The accruals spend produces:

- **Card spend not yet posted:** settled transactions still uncoded or unsynced at month-end, and pending authorizations for goods or services already received (a hotel checked out on the 31st). Holds that never settle into a charge (a car rental deposit) are left out.
- **Goods received, not billed:** a three-way-matched PO whose receipt posted but whose invoice hasn't arrived. With perpetual inventory the receipt itself books the liability (Commerce's [Purchase Orders](/books/commerce/purchasing-and-replenishment#purchase-orders) shows ERPNext's "Stock Received But Not Billed"); for services, the accrual comes from the PO.
- **Expenses incurred, not submitted:** reimbursable expenses and mileage employees haven't filed yet, usually estimated from history and trued up.
- **Prepaid travel:** airfare for next month's trip, paid this month, is a prepaid asset until the trip ([Paying for Travel](/books/banking-and-lending/business-travel#paying-for-travel)).

Accruals are journal entries dated the last day of the month that **reverse on the first day of the next**, so when the real transaction posts in the new month it isn't counted twice. Sage Intacct's journal API carries the reversal date on the entry itself (`REVERSEDATE`, which must be after the batch date; its example entry is dated March 31 and reverses April 1), and other systems post the reversal as its own entry. Spendesk's advice for missing receipts is to park those charges in a card clearing account temporarily, then "do not leave a material clearing balance in place" at close: allocate it to the right accounts first.

A spend platform's close checklist, in the order a controller works it: every card transaction coded, receipted and synced; the card liability in the ERP reconciled to the issuer's statement and the platform's balance; bills matched and approved through the cutoff; accruals posted with reversal dates; bank accounts reconciled ([Month-End Close](/docs/payments/accounting#month-end-close)); the period locked in the ERP; and the platform's lock mirrored.

### Worked Numbers: An October Card Accrual

A company's card statement closes on the 25th of each month; its spend platform syncs each transaction to the ERP once it settles and is coded. At the close of business on October 31:

| Card activity | Amount | Treatment |
| --- | --- | --- |
| Settled, coded and synced through October 31 | $41,300.00 | Already in October's expense; nothing to accrue |
| Settled, uncoded (missing receipts), in the card clearing account | $6,150.00 | Reclassify to expense by each cardholder's default department before close |
| Pending authorizations, hotel stays checked out by October 31 | $1,900.00 | Accrue: the service was received in October |
| Pending authorization, car rental deposit hold | $580.00 | Exclude: a hold, not a charge |

The two October 31 entries, both on the customer's books:

| Entry | Debit | Credit |
| --- | --- | --- |
| Reclassify clearing (no reversal) | Travel and other expense by department, $6,150.00 | Card clearing, $6,150.00 |
| Accrue received hotel stays (reverses November 1) | Travel: lodging, $1,900.00 | Accrued card liabilities, $1,900.00 |

October's card-funded expense is $41,300.00 + $6,150.00 + $1,900.00 = $49,350.00. On November 1 the $1,900.00 accrual reverses (debit accrued card liabilities, credit lodging), and when the hotel charges settle in November and sync as card purchases, November's lodging nets to the difference between the final charges and the estimate. If the hotels settle at $1,962.40 (a late minibar charge), November carries $62.40 of October's lodging, a variance small enough that the policy treats it as immaterial. The $6,150.00 that arrives with receipts in November is recoded from the default department to the right one in November, by a reclassification entry, because October is locked.

## How to Build It

These are deltas against [the core data model](/books/banking-and-lending/banking-business#the-core-data-model). The customer is a business `parties` row; its ERP's chart and dimensions are mirrored rather than held in `gl_accounts`, which stays the institution's chart. Source records are the ones earlier chapters define: `expenses` (card and out-of-pocket) from [Receipts, Expense Policy & Audit](/books/banking-and-lending/expense-management#how-to-build-it), Payments `bills` with their `bill_lines`, `disbursements`, and `reimbursements`. `expenses.coding` and `bill_lines.coding` hold the coding as approved; `line_codings` below normalizes it to one row per split, which is what the sync reads. Summary journals, where a customer wants them, use the playbook's `accounting_sync_batches` ([One Log Per Sync Batch](/docs/payments/accounting#one-log-per-sync-batch)).

```sql
CREATE TABLE erp_connections (             -- one customer's link to one ERP entity
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  business_id     UUID NOT NULL REFERENCES parties (id),
  erp             TEXT NOT NULL CHECK (erp IN ('quickbooks_online', 'netsuite', 'xero',
                    'sage_intacct', 'business_central', 'csv')),
  external_tenant TEXT NOT NULL,           -- realm, account, organisation or company ID
  entity_ref      TEXT,                    -- NetSuite subsidiary or Intacct entity, if multi-entity
  credentials_ref TEXT NOT NULL,           -- vaulted OAuth tokens
  card_posting    TEXT NOT NULL CHECK (card_posting IN ('native_card_record', 'bank_transaction',
                    'journal_entry')),
  owns_bank_feed  BOOLEAN NOT NULL,        -- true: the ERP imports bank lines; don't post payments twice
  status          TEXT NOT NULL CHECK (status IN ('active', 'reauth_required', 'paused',
                    'disconnected')),
  lock_date       DATE,                    -- mirrored from the ERP's closed period or lock date
  UNIQUE (business_id, erp, external_tenant, entity_ref)
);

CREATE TABLE erp_accounts (                -- the customer's chart, mirrored
  connection_id   UUID NOT NULL REFERENCES erp_connections (id),
  external_id     TEXT NOT NULL,
  number          TEXT,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL,           -- the ERP's own type: expense, credit card, AP, bank, ...
  active          BOOLEAN NOT NULL,
  refreshed_at    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (connection_id, external_id)
);

CREATE TABLE erp_dimensions (              -- class, department, location, tracking category, GLDIM...
  connection_id   UUID NOT NULL REFERENCES erp_connections (id),
  dimension       TEXT NOT NULL,           -- the platform's name: 'department', 'project', ...
  erp_field       TEXT NOT NULL,           -- 'ClassRef', 'department', 'Tracking[1]', 'GLDIMCOSTCENTER'
  level           TEXT NOT NULL CHECK (level IN ('line', 'header')),
  required_when   JSONB,                   -- e.g. location required for a multi-entity company
  PRIMARY KEY (connection_id, dimension)
);

CREATE TABLE erp_dimension_values (
  connection_id   UUID NOT NULL,
  dimension       TEXT NOT NULL,
  external_id     TEXT NOT NULL,
  name            TEXT NOT NULL,
  active          BOOLEAN NOT NULL,
  PRIMARY KEY (connection_id, dimension, external_id),
  FOREIGN KEY (connection_id, dimension) REFERENCES erp_dimensions (connection_id, dimension)
);

CREATE TABLE coding_rules (                -- how a line gets its account and dimensions
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  connection_id   UUID NOT NULL REFERENCES erp_connections (id),
  priority        INT NOT NULL,            -- lower wins
  match           JSONB NOT NULL,          -- vendor, merchant, MCC, card, employee, PO, category
  account_external_id TEXT NOT NULL,
  dimensions      JSONB NOT NULL DEFAULT '{}',  -- dimension name to external value ID
  created_from    TEXT NOT NULL CHECK (created_from IN ('admin', 'reviewer_correction', 'model')),
  valid_during    TSTZRANGE NOT NULL
);

CREATE TABLE line_codings (                -- the coding of one spend line, as approved
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  source_kind     TEXT NOT NULL CHECK (source_kind IN ('expense', 'bill_line', 'accrual')),
  source_id       UUID NOT NULL,
  split_index     SMALLINT NOT NULL DEFAULT 0,
  amount          BIGINT NOT NULL,         -- splits of one source sum to its amount
  account_external_id TEXT NOT NULL,
  dimensions      JSONB NOT NULL,
  coded_by        TEXT NOT NULL,           -- 'rule:<id>', 'model:<version>', or a person
  confidence      NUMERIC(4, 3),
  UNIQUE (source_kind, source_id, split_index)
);

CREATE TABLE erp_sync_records (            -- one platform record and its ERP counterpart
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  connection_id   UUID NOT NULL REFERENCES erp_connections (id),
  source_kind     TEXT NOT NULL,           -- 'expense', 'bill', 'disbursement', 'reimbursement',
                                           -- 'card_statement_payment', 'accrual', 'vendor', 'purchase_order'
  source_id       UUID NOT NULL,
  source_version  INT NOT NULL,            -- bumps on recode or edit
  erp_object      TEXT NOT NULL,           -- 'Purchase', 'Bill', 'ACCPAY', 'vendorbill', 'GLBATCH', ...
  external_id     TEXT,                    -- written back on success
  external_version TEXT,                   -- QuickBooks SyncToken, or the ERP's last-modified marker
  idempotency_key TEXT NOT NULL,           -- source, version and connection
  posting_date    DATE NOT NULL,           -- may differ from the source date after a lock
  status          TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'synced', 'conflict',
                    'rejected', 'skipped_owned_by_erp')),
  error           TEXT,
  synced_at       TIMESTAMPTZ,
  UNIQUE (connection_id, idempotency_key),
  UNIQUE (connection_id, source_kind, source_id, source_version)
);

CREATE TABLE close_periods (               -- the platform's mirror of each customer's close
  business_id     UUID NOT NULL REFERENCES parties (id),
  period          DATERANGE NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('open', 'closing', 'locked')),
  card_liability_reconciled_at TIMESTAMPTZ,
  accruals_posted_at TIMESTAMPTZ,
  locked_by       UUID REFERENCES parties (id),
  locked_at       TIMESTAMPTZ,
  PRIMARY KEY (business_id, period)
);
```

Design notes:

- **Mirror, don't own, the customer's chart.** `erp_accounts` and `erp_dimension_values` are refreshed from the ERP and referenced by external ID; an inactive account fails coding validation before sync.
- **Code once, sync many.** `line_codings` holds the approved coding per line and split; `erp_sync_records` holds each attempt to put it in an ERP, versioned, so a recode produces a new version and an update with the stored `external_version`.
- **The idempotency key is the source, its version and the connection,** sent in each ERP's own retry mechanism and unique in the table, so a timeout followed by a retry can't create a second bill.
- **Ownership is explicit.** `owns_bank_feed` decides whether the platform posts payments and statement payments or skips them as `skipped_owned_by_erp`, which keeps the two feeds from posting the same cash twice.
- **Locks are mirrored.** A source in a locked period can't be recoded on the platform, and a late source gets a `posting_date` in the first open period with its original date carried in the memo.
- **Accruals are sources too.** The month-end accrual and its reversal are `line_codings` with `source_kind = 'accrual'` and two sync records, so the reversal is as traceable as the accrual.
- **Emit events.** `coding.approved`, `sync.rejected`, `sync.conflict`, `erp.reauth_required` and `period.locked` drive the customer's exceptions queue and the close checklist.

## Auditing

The ERP is the customer's book of record, and the spend platform is the subledger behind a large share of its expense lines, so its records support the customer's financial statement audit. The general design is in [Audit Trails](/docs/architecture/audit-trails); make sure the record shows:

- **For every spend line,** the coding, who or what produced it (rule, model version, person), and every recode with before and after.
- **For every sync,** what was sent, when, under which key, the ERP's ID and version back, and every rejection and conflict with its resolution.
- **The chart and dimension mirror as of each sync,** so a coding to a since-deactivated account can be explained.
- **Every accrual and its reversal,** with the inputs (clearing balance, pending authorizations included and excluded) and who approved it.
- **Each period's close,** with the card liability reconciliation, the accrual posting and the lock, and every posting after the lock with its reason.

## What This Means for the System You Build

- **Keep the customer's chart as a mirror,** refreshed from the ERP, and validate codings against it before sync.
- **Model the richest dimension set,** and map per connector what each ERP keeps and drops (two tracking categories in Xero).
- **Choose per ERP how card spend posts,** and post card statement payments as transfers to the liability, never as expense.
- **Decide who owns the bank feed** so payments aren't posted twice.
- **Use each API's retry contract** (idempotency headers, unique control IDs, version tokens) with a key derived from the source and its version.
- **Respect rate limits by design,** syncing continuously rather than at month-end.
- **Mirror closed periods and lock dates,** and route late items to the first open period with their original date.
- **Post accruals with reversal dates,** keep clearing balances immaterial at close, and treat accruals as sync sources.

## References

**Vendor documentation**

- [Intuit: QuickBooks V3 Java SDK, Finance.xsd](https://raw.githubusercontent.com/intuit/QuickBooks-V3-Java-SDK/develop/ipp-v3-java-data/src/main/xsd/Finance.xsd), the Bill, BillPayment, Purchase and JournalEntry entities, PaymentType values, Class, Customer and billable status on expense lines, and DepartmentRef as location tracking
- [Intuit: QuickBooks V3 Java SDK, IntuitBaseTypes.xsd](https://raw.githubusercontent.com/intuit/QuickBooks-V3-Java-SDK/develop/ipp-v3-java-data/src/main/xsd/IntuitBaseTypes.xsd), SyncToken versioning and the failure of updates with an older token, and attachable references
- [Oracle NetSuite: Idempotency for REST web services](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/subsect_164494900632.html), the X-NetSuite-idempotency-key header and the IDEMPOTENCY_ERROR response
- [Oracle NetSuite: Asynchronous request execution](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_161251386312.html), the idempotency retry mechanism and REST request size limits
- [Oracle NetSuite: Web services concurrency governance](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1504769959.html), the account-level concurrent request limit
- [Oracle NetSuite: record.transform types](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4267258715.html), purchase order to item receipt and vendor bill, vendor bill to payment, employee to expense report
- [Oracle NetSuite: Classifications](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N261486.html), departments, classes and locations, subsidiaries as the primary classification in OneWorld, and unlimited custom segments
- [Oracle NetSuite: Accounting period close and locking](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N1452509.html), closed periods blocking GL posting, A/P, A/R and payroll locks, and the override permission
- [Xero: Accounting API OpenAPI specification](https://raw.githubusercontent.com/XeroAPI/Xero-OpenAPI/master/xero_accounting.yaml), invoice and bank transaction types, invoice statuses, at most two tracking categories per line, the 128-character Idempotency-Key, period and year-end lock dates, and manual journal narration
- [Xero: API limits](https://developer.xero.com/faq/limits), 5 concurrent calls, 60 a minute, 5,000 a day and the app-wide minute limit, with 429 and Retry-After
- [Sage Intacct: AP bills](https://developer.intacct.com/api/accounts-payable/bills/), APBILL and APBILLITEM with standard and user-defined dimensions
- [Sage Intacct: Journal entries](https://developer.intacct.com/api/general-ledger/journal-entries/), GLBATCH and GLENTRY, at least one debit and one credit, and REVERSEDATE with its March 31 to April 1 example
- [Sage Intacct: Expense reports](https://developer.intacct.com/api/employee-expenses/expense-reports/), EEXPENSES with employee, expense types and reimbursement currency
- [Sage Intacct: Web services requests](https://developer.intacct.com/web-services/requests/), control IDs and uniqueid preventing a repeated function
- [Ramp: Accounts payable](https://ramp.com/accounts-payable), ERP sync with NetSuite, QuickBooks and Sage Intacct
- [Ramp: Automate receipts and expense requirements](https://support.ramp.com/automate-receipts-and-expense-requirements), memo and accounting fields filled only when "high confidence or follows an existing rule"

**Filings**

- [BILL Holdings: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/0001786352/000162828026058238/bill-20260630.htm), two-way sync with QuickBooks Online and Desktop, NetSuite, Sage Intacct, Xero and Business Central

**In practice**

- [Spendesk: How to accrue credit card expenses at month-end](https://www.spendesk.com/blog/how-to-accrue-credit-card-expenses-month-end/), receipt of goods as the trigger, the three dates, pending authorizations, the accrual entry and its reversal, and clearing accounts
