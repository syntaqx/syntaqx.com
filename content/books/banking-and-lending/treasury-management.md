+++
title = "Treasury Management"
description = "Bank services for business cash: positive pay, ACH blocks, lockbox, ZBAs and sweeps, account analysis and ECR, BAI2 and camt reporting, cash positioning and FX."
category = "Banking & Lending Industry"
order = 2461
part = "Business Banking"
tags = ["banking", "business-banking", "treasury-management", "positive-pay", "account-analysis", "bai2"]
+++

Treasury management is what a bank sells a business beyond the account: services that protect its payments, collect its receivables, move its cash between accounts, report every balance and transaction to its systems, and invest what is left overnight. Every large bank has a treasury management division with its own portal (PINACLE at PNC, iTreasury at Regions, SinglePoint at U.S. Bank), and the fees it earns are one of a commercial bank's main fee lines ([Fee Lines](/books/banking-and-lending/bank-economics#fee-lines)). Many of those fees are never paid in cash. They are offset by an earnings credit on the balances the business keeps, through a monthly account analysis that is the commercial account's real price list.

On the other side of the relationship is the company's treasurer, for whom the bank's services are inputs: balances and transactions from every bank each morning, a cash position before the wire cutoff, a forecast for the coming weeks, a hedge for next quarter's euro payables. Mid-market companies run that work on a treasury management system (TMS) that connects to all their banks. This chapter covers both: the bank's products (payables fraud controls, lockbox, liquidity structures), account analysis with a worked statement, the reporting formats that connect the two sides (BAI2 and ISO 20022 `camt`), and cash positioning, forecasting and FX from the treasurer's seat. The rail mechanics belong to the Payments volume: receiving checks and the lockbox file in [Accepting Checks](/books/payments/checks#lockbox), issuing them with positive pay in [Vendor Payouts](/books/payments/vendor-payouts#checks-are-still-here), and the bank file pipeline in [Treasury & Bank Operations](/books/payments/treasury#bank-files).

## How the Platforms Do It

What banks publish about their treasury services, as of October 2026:

| Bank | Payables controls | Liquidity and receivables | What the public documents add |
| --- | --- | --- | --- |
| **Bank of America** | Image Positive Pay, Payee Positive Pay, Positive Pay, Reverse Positive Pay, Teller Positive Pay; ACH Positive Pay, where "An exception item is an ACH Entry not previously authorized by Client" | Zero Balance Accounts, Controlled Balance Accounts and balance-related transfers; controlled disbursement; Image, Scannable Wholesale and Wholesale Lockbox | Terms (June 2026) under which a client that declines positive pay "will bear any resulting fraud losses that would have otherwise been prevented"; exception defaults the client may choose |
| **J.P. Morgan** | Positive pay, reverse positive pay with an amount threshold, ACH debit block, Post No Checks for accounts that never issue checks | Account analysis | An account analysis statement guide defining every line, from average ledger balance to the earnings credit allowance |
| **PNC** | Check Positive Pay, ACH Positive Pay by rules, ACH Debit Block, decided in PINACLE | FX forwards, window forwards and non-deliverable forwards | A forward contract fact sheet |
| **Regions** | Positive pay and reverse positive pay exceptions in iTreasury | | Published decision deadlines: next-day exceptions load by 9:30 a.m. CT and must be decided by 2:00 p.m. CT |
| **U.S. Bank** | Positive pay exceptions by type (paid no issue, amount mismatch, duplicate, cancelled, payee mismatch) | Money market fund sweeps and multibank deposits up to $2.5 million | A demo portal showing a decision deadline and a default (pay or return) set per account |
| **Wells Fargo** | Positive Pay, Payee Validation, Reverse Positive Pay; ACH Fraud Filter in Stop or Review mode | Target balance accounts, a money market fund sweep, retail image lockbox with OCR capture | A commercial account agreement (2013 version, filed with the SEC) that treats a client declining positive pay as "having assumed the risk" of the preventable loss |

Three things stand out. **The product names differ and the products don't.** Every bank sells the same handful of controls (match presented checks to an issue file, match payee names, block or filter ACH debits, refuse checks on accounts that never write them) under its own brand names, which is why a TMS or a fintech integrating several banks maps them to one model. **Every control is a deadline with a default.** An exception the client doesn't decide by the cutoff is paid or returned by a rule chosen in advance, so the default is the most consequential setting in the service. **Declining a control moves the loss.** Bank of America's and Wells Fargo's agreements both put the preventable loss on a client that turns positive pay down, which makes the offer and the refusal records, as with wire security procedures in [Business Accounts & Startup Banking](/books/banking-and-lending/business-accounts#wires-and-security-procedures).

## Payables Fraud Controls

Business accounts are the target. FinCEN's February 2023 alert on mail theft-related check fraud reported more than 350,000 check fraud SARs in 2021, up 23%, and over 680,000 in 2022, and observed that "business checks may be more valuable because business accounts are often well-funded and it may take longer for the victim to notice the fraud." The bank-side controls:

- **Check positive pay.** The company sends an issue file of every check it writes (account, check number, amount, date); the bank compares each presented check against it and reports mismatches as exceptions. Wells Fargo's description is the standard one: it "systematically compares checks presented for payment to your issued-check files".
- **Payee positive pay.** The issue file carries the payee name, and the bank flags presented checks whose payee doesn't match, which catches a washed check with a new name written in. Bank of America notes it "may utilize a dollar threshold below which certain items may not be presented", because payee matching on images costs more.
- **Reverse positive pay.** For a company that can't send issue files, the bank sends it the presented checks (J.P. Morgan: above a threshold the client sets) and the company decides.
- **Teller positive pay and Post No Checks.** The issue file checked at the branch before cashing; and a flat block on accounts that should never see a check.
- **ACH debit block and ACH positive pay.** A block refuses every ACH debit (PNC: "restricts any ACH debit transactions from posting to an account"); a filter admits only authorized originators, optionally with amount limits, and presents the rest as exceptions (Wells Fargo's Stop mode stops "all ACH debits" except those "you specifically pre-authorize", its Review mode "presents transactions to you for pay or return decisions"). Nacha's corporate return window for an unauthorized debit is two banking days ([Returns](/books/payments/ach#returns-when-money-is-really-yours)), so the decision clock is the return clock.

### Exceptions, Deadlines and Defaults

The exception workflow is the product. Bank of America's terms are typical: on the day the bank reports exceptions, the client "must notify Bank, by the deadline specified, which checks to pay or which to dishonor and return", and if it doesn't, the items "will be handled in accordance with the prescribed default procedure (Client may choose default procedure where the choice is available)". Regions publishes its clock: next-day positive pay exceptions load by 9:30 a.m. CT and must be decided by 2:00 p.m. CT, same-day exceptions load by 3:30 p.m. CT and are decided by 2:00 p.m. CT the next business day, with decisions of pay, pay and issue, or return (fraudulent or other). U.S. Bank's demo portal shows deadlines of 2 and 3 p.m. CT on different accounts, one defaulting to pay and one to return.

Most large banks publish their deadlines only in client documentation, so a system serving several banks stores each account's cutoff and default as data and computes every exception's deadline from them ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)). Default to return is the safe choice for fraud and the dangerous one for operations: a missed review returns the company's own payroll checks.

### Who Bears the Loss

Without positive pay, a forged or altered check is allocated by the UCC's negligence rules: a customer whose failure to exercise ordinary care "substantially contributes" to an alteration or forgery is precluded from asserting it against a bank that paid in good faith, with the loss split by comparative fault (UCC 3-406), and a customer must examine its statements "with reasonable promptness" and is barred after a year (UCC 4-406). The account agreement can then reset those standards, since the parties "may determine by agreement the standards by which the bank's responsibility is to be measured" though not disclaim the bank's good faith (UCC 4-103). Banks use that room: Bank of America's terms say a client that continues without positive pay "has elected not to use the Positive Pay services offered by the Bank and will bear any resulting fraud losses that would have otherwise been prevented by proper use of available Positive Pay Services", and a 2013 Wells Fargo commercial agreement filed with the SEC says a company declining a fraud prevention service "will be treated as having assumed the risk of any loss that could have been prevented". The offer, the refusal and every exception decision are therefore evidence, kept like any other.

## Receivables: Lockbox

A lockbox is the bank opening the company's mail: customers send checks to a post office box the bank empties, the bank deposits the checks, and the company receives the remittance data and images. Retail lockbox handles coupon-based consumer payments ("loan payments, credit card bills and utility and cable bills", in Frost's description), and wholesale lockbox handles business-to-business payments, fewer and larger, often without a coupon. Bank of America's terms show what the contract governs: which payees the bank will accept checks for ("Bank will process a check only if it is made payable to an Acceptable Payee"), image and scannable variants, and how exceptions are handled; Wells Fargo's retail lockbox captures OCR data "such as account number and amount due" and transmits it in an agreed file format.

The file, its matching to open invoices and the exceptions queue are the receiver's integration and belong to [Accepting Checks](/books/payments/checks#lockbox). The bank's side is a deposit like any other: each lockbox batch posts as a credit with its own type (BAI2's code 115 is "Lockbox Deposit"), subject to [Funds Availability](/books/banking-and-lending/funds-availability) like any check deposit, and its total must equal the sum of the items in the remittance file the company receives.

## Liquidity: ZBAs, Target Balances and Sweeps

A company with many accounts (one per subsidiary, region, or purpose: payroll, payables, receipts) wants its cash in one place at night and in each account only when needed. Banks automate it:

- **Zero balance accounts (ZBA).** Subsidiary accounts are brought to zero at end of day, debits funded from and credits swept to a concentration account, so each account keeps its own transaction history while the cash sits in one balance.
- **Target and threshold balances.** Bank of America's balance-related transfer moves funds "to an account when the balance falls below a certain amount, or from an account, when the balance rises above a certain amount, or both"; Wells Fargo's target balance accounts are evaluated "At the end of each Business Day".
- **Controlled disbursement.** An account drawn on a bank or branch that receives its check presentments early, so the bank can report each morning the total of checks presented that day and the company can fund exactly that (Bank of America: information "each Business Day in order for Client to fund the net total amount"); if the company doesn't fund it, the bank "may dishonor some or all of the checks then pending payment".
- **Investment sweeps.** The concentration account's excess sweeps overnight into a money market fund (Wells Fargo lists its Stagecoach Sweep fund option; U.S. Bank notes these funds are "securities and thus not covered by FDIC insurance"), a repurchase agreement, or an insured multibank deposit. Which of those keeps a business's money insured is the subject of [Sweeps, Reciprocal Deposits & Yield](/books/banking-and-lending/sweeps-and-yield).

Each of these is a set of book transfers the bank's end of day generates, in a fixed order after the day's postings and before interest and analysis read the balances ([End of Day and the Business Date](/books/banking-and-lending/posting-holds-and-balances#end-of-day-and-the-business-date)). Each transfer is a journal entry with its rule as its source, so a ZBA sub-account's statement shows every sweep and a dispute about a missing transfer has an answer.

## Account Analysis and the Earnings Credit

For decades Regulation Q barred interest on business demand deposits, and banks paid in services instead: an earnings credit on the balance, applied against the account's fees. The ban ended in 2011 ([Interest on Business Checking](/books/banking-and-lending/deposit-accounts#interest-on-business-checking)); account analysis didn't, because it suits both sides. The business pays for services with balances it needs to keep anyway, and AFP notes the credits aren't taxable as interest would be; the bank sets the earnings credit rate (ECR), which is "typically negotiable as part of the initial bank selection process".

The monthly analysis statement, in J.P. Morgan's definitions:

| Line | Definition |
| --- | --- |
| **Average ledger balance** | "The sum of the daily ending ledger balances (positive and negative) divided by the number of days in the statement month" |
| **Average float** | "The difference between the Average Ledger Balance and the Average Collected Balance": deposited items not yet collected ([Three Balances](/books/banking-and-lending/posting-holds-and-balances#three-balances)) |
| **Average collected balance** | Average ledger balance minus average float |
| **Reserve requirement** | The share set aside for reserves; "Not currently in use by the Bank", since the Federal Reserve cut reserve requirement ratios to zero effective March 26, 2020 |
| **Average investable balance** | "The balance on which the earnings credit rate is applied" |
| **Earnings credit allowance** | Average investable balance × ECR × (days in month ÷ days in year) |
| **Balance-based service charges** | Charges "that can be offset by the earnings credit allowance" |
| **Fee-based service charges** | Charges "that cannot be offset by the earnings credit allowance" |
| **Net service credit** | Excess credit remaining after the balance-based charges, when positive |
| **Balance required** | Total charge for services ÷ ECR × (days in year ÷ days in month): the investable balance that would pay for everything |

AFP's formula is the same, EC = CB × (1 − RR) × ECR × (D ÷ 365), with CB the average collected balance. Services are identified across banks by AFP Service Codes, six-character codes created in 1986 so a company can compare analysis statements from different banks line by line. Two conventions decide what the credit is worth. **Excess credits usually expire:** AFP notes "excess credits are generally not rolled over, though some banks offer special accounts that do", so a balance above what the fees need earns nothing. **Settlement can be less frequent than monthly:** J.P. Morgan's guide shows balances brought forward within a quarterly settlement cycle, so a month's excess offsets another month's shortfall in the same quarter. Charges for deposit insurance appear as a line of their own ("deposit fees", in AFP's term), and many banks also pay a separate interest rate on the same business accounts, so the product carries both an interest rate and an ECR ([How to Build It](/books/banking-and-lending/deposit-accounts#how-to-build-it) in Deposit Accounts flags the product).

## Worked Numbers: An Analysis Statement

A company's operating account in October 2026 (31 days, a 365-day year, monthly settlement, illustrative prices). Balances:

| Line | Amount |
| --- | --- |
| Average ledger balance | $2,400,000.00 |
| Less average float | $150,000.00 |
| Average collected balance | $2,250,000.00 |
| Less reserve requirement (0%) | $0.00 |
| Average investable balance | $2,250,000.00 |
| Earnings credit at 1.50% ECR: $2,250,000 × 0.015 × 31 ÷ 365 | **$2,866.44** |

Services:

| Service | Volume | Unit price | Charge |
| --- | --- | --- | --- |
| Account maintenance | 1 | $45.00 | $45.00 |
| ACH items originated | 4,000 | $0.10 | $400.00 |
| Positive pay maintenance | 1 | $75.00 | $75.00 |
| Positive pay items | 1,200 | $0.05 | $60.00 |
| Wholesale lockbox items | 900 | $0.40 | $360.00 |
| Outgoing domestic wires | 60 | $15.00 | $900.00 |
| Prior-day BAI2 reporting | 1 | $100.00 | $100.00 |
| ZBA sub-accounts | 3 | $25.00 | $75.00 |
| **Balance-based charges** | | | **$2,015.00** |
| Deposit fee (fee-based, not offsettable) | | | $225.00 |

Settlement: the earnings credit of $2,866.44 offsets the $2,015.00 of balance-based charges in full, leaving a net service credit of $851.44 that expires at month end under monthly settlement. The $225.00 fee-based charge is debited from the account. The company paid $225.00 in cash for $2,240.00 of services.

The balance that would have exactly paid for the services is $2,015.00 ÷ 0.015 × 365 ÷ 31 = **$1,581,666.67** of investable balance. Above that, each extra dollar earned nothing this month; the company kept about $668,000 more than its fees needed, which a treasurer would sweep to an interest-bearing account or a money market fund.

Now the bank cuts the ECR to 0.75% with the same balances. The credit halves to $1,433.22, the balance-based charges exceed it by **$581.78**, and that shortfall is debited as a fee along with the $225.00; the balance required doubles to $3,163,333.33. The ECR is a deposit price the bank sets for business accounts, much as it sets deposit rates, and a falling ECR is a fee increase nobody announced ([Deposit Betas](/books/banking-and-lending/bank-economics#deposit-betas)).

## Bank Connectivity: BAI2 and camt

A company learns what its banks did from reports, and in the United States the classic report is **BAI2**, the Bank Administration Institute's Cash Management Balance Reporting Specifications Version 2. Its copyright moved to the Accredited Standards Committee X9, which revised it as the Balance and Transaction Reporting Standard (BTRS), but most banks and TMSs still speak BAI2. Its structure is a nested file of comma-delimited records ending in a slash:

| Record | Name | Holds |
| --- | --- | --- |
| `01` | File header | Sender, receiver, creation date and time, file ID |
| `02` | Group header | Accounts from one originator with the same as-of date and time |
| `03` | Account identifier and summary | Account number, currency, and status and summary amounts by type code |
| `16` | Transaction detail | One transaction: type code, amount, funds availability, bank and customer references, free text |
| `88` | Continuation | Overflow of the previous record, any type |
| `49` | Account trailer | Account control total and record count |
| `98` | Group trailer | Group control totals |
| `99` | File trailer | File control totals |

Type codes carry the meaning. Status codes 001 to 099 appear only on the `03` record (010 opening ledger, 015 closing ledger, 040 opening available, 045 closing available); 100 is total credits and 101 to 399 are credit summary and detail codes (115 lockbox deposit, 142 ACH credit received, 195 incoming money transfer); 400 is total debits and 401 to 699 are debits (451 ACH debit received, 475 check paid, 495 outgoing money transfer); 900 to 999 are bank-specific. Each amount can carry a funds type (immediate, two or more days, value dated, distributed availability or unknown), which is how a report says when deposited money becomes usable.

ISO 20022 replaces it with XML messages in the `camt` family: `camt.052` the intraday account report (replacing SWIFT's MT942), `camt.053` the end-of-day statement (replacing MT940), `camt.054` debit and credit notifications, including the detail of batch bookings. A `camt.053` carries balances by type code (OPBD opening booked, CLBD closing booked, CLAV closing available, ITBD and ITAV interim booked and available) and classifies each entry with a three-level Bank Transaction Code of domain, family and sub-family (PMNT / RCDT / XBCT is a received cross-border credit transfer). The mapping from BAI2 is mostly direct for balances (010 to OPBD, 015 to CLBD, 045 to CLAV) and lossy for transactions, where a bank's BAI2 type codes and its ISO bank transaction codes don't line up one to one, so a converter keeps both the source code and its mapping.

What a builder needs to know:

- **Prior-day versus intraday.** A prior-day statement says what happened yesterday; an intraday report says what has happened so far today. Cash positioning before a wire cutoff needs intraday, and MT940, Modern Treasury notes, "only supports prior day" reporting. J.P. Morgan presents APIs as the way "traditional next-day visibility can be transformed into real-time visibility".
- **Totals are controls.** The `49`, `98` and `99` trailers in BAI2 and the balance and entry counts in `camt` are checked before anything is imported, and a file that doesn't foot is rejected, not partly loaded ([Bank Files](/books/payments/treasury#bank-files)).
- **Reports are external records.** A TMS or a fintech reading its banks' reports imports them as external records and matches them to its ledger; the matching engine and breaks are in [Ledger & Reconciliation at Provider Scale](/books/payments/ledger-and-reconciliation#three-sources-of-truth).
- **The bank produces what the core knows.** On the bank's side the report is a rendering of `transactions` and `balance_snapshots` for the as-of time, with each transaction's kind mapped to a BAI2 type code and an ISO bank transaction code; the mapping is versioned data, because a changed code breaks every client's reconciliation rules.

## Cash Positioning, Forecasting and FX

A mid-market treasurer's day starts with the **cash position**: every account at every bank, opening available balance from the prior-day reports, plus what intraday reports and known flows say will land or leave before each bank's cutoffs, by entity and currency. Treasury management systems sell exactly that. Trovata describes "cash reporting and positioning across banks and entities", with bank data collected as "ISO20022, CAMT53, MT940, BAI2", through SWIFT, legacy sFTP and direct bank APIs; Ripple Treasury (powered by GTreasury) claims "300+ pre-built bank connectors" and visibility "always current, not at yesterday's close"; Nomentia advertises bank connectivity through Swift Business Connect.

**Forecasting** extends the position forward: short- and long-term forecasts "built from historical data, ERP inputs, and projected activity" (Trovata), receipts from open receivables, disbursements from open payables and payroll calendars, and scenarios that "test the impact of timing shifts, rate changes, funding strategies" (Trovata again). The engineering is unglamorous: forecasts are versioned snapshots, each actual is compared with what each prior forecast said, and accuracy by category and horizon is the metric that tells a treasurer which inputs to trust.

**FX** is where mid-market treasury meets Payments. Conversion, quotes and wires are in [Cross-Border Payments & FX](/books/payments/cross-border-and-fx#fx-rates-providers-and-quotes); what treasury adds is hedging a known future exposure. PNC's fact sheet defines the basic tool: "a contractual obligation to buy from or sell to PNC a fixed amount of foreign currency on a future maturity date at a predetermined exchange rate", priced from forward points, with "no upfront premium cost", to be used only "where there is a firm or definitive commitment or exposure"; a window forward allows drawdowns within a period ("typically 30 days"), and a non-deliverable forward "is net settled in U.S. dollars" for currencies that can't be delivered. U.S. Bank frames the policy choice as the hedge ratio, "the size of the hedge vs. the underlying exposure." A treasury system records each exposure (a payable in euros due in 90 days), each hedge against it with its ratio, and each settlement, so the realized rate on every payment can be traced to the decision that set it.

## How to Build It

These are deltas against `accounts`, `transactions` and `fee_assessments` in [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model), from the bank's side. `products.earnings_credit` from [Deposit Accounts & Truth in Savings](/books/banking-and-lending/deposit-accounts#how-to-build-it) marks the analyzed products, `product_fees` from [Products & Product Configuration](/books/banking-and-lending/product-configuration#how-to-build-it) holds the service prices, and sub-accounts use `accounts.primary_account_id` from [Business Accounts & Startup Banking](/books/banking-and-lending/business-accounts#how-to-build-it). The company's side (importing reports, matching, breaks) reuses Payments' `external_files`, `external_records` and `bank_statement_balances` ([Ledger & Reconciliation](/books/payments/ledger-and-reconciliation#how-to-build-it)).

```sql
CREATE TABLE tm_enrollments (              -- a treasury service on an account, with its options
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  service             TEXT NOT NULL CHECK (service IN ('check_positive_pay', 'payee_positive_pay',
                        'reverse_positive_pay', 'post_no_checks', 'ach_debit_block', 'ach_positive_pay',
                        'lockbox', 'controlled_disbursement', 'zba', 'target_balance',
                        'investment_sweep', 'prior_day_reporting', 'intraday_reporting')),
  options             JSONB NOT NULL,        -- thresholds, formats, lockbox payees, sweep vehicle
  decision_cutoff     TIME,                  -- in decision_tz
  decision_tz         TEXT,
  default_decision    TEXT CHECK (default_decision IN ('pay', 'return')),
  agreement_disclosure_id UUID NOT NULL REFERENCES disclosures (id),
  valid_during        TSTZRANGE NOT NULL
);

CREATE TABLE tm_declinations (             -- a control offered and refused: the loss-shift evidence
  account_id          UUID NOT NULL REFERENCES accounts (id),
  service             TEXT NOT NULL,
  offered_disclosure_id UUID NOT NULL REFERENCES disclosures (id),
  declined_by         UUID NOT NULL REFERENCES parties (id),  -- an authorized signer
  declined_at         TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (account_id, service, declined_at)
);

CREATE TABLE issued_checks (               -- the client's issue file, item by item
  account_id          UUID NOT NULL REFERENCES accounts (id),
  check_number        BIGINT NOT NULL,
  amount              BIGINT NOT NULL CHECK (amount > 0),
  issue_date          DATE NOT NULL,
  payee               TEXT,                  -- payee positive pay
  status              TEXT NOT NULL CHECK (status IN ('issued', 'void', 'stopped', 'paid', 'stale')),
  file_ref            TEXT NOT NULL,         -- the issue file it arrived in
  PRIMARY KEY (account_id, check_number)
);

CREATE TABLE tm_exceptions (               -- a presented item or ACH debit awaiting a decision
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  enrollment_id       UUID NOT NULL REFERENCES tm_enrollments (id),
  item_ref            TEXT NOT NULL,         -- the presented check image or ACH entry trace
  reason              TEXT NOT NULL CHECK (reason IN ('paid_no_issue', 'amount_mismatch', 'duplicate',
                        'void_or_stopped', 'payee_mismatch', 'unauthorized_originator',
                        'over_originator_limit', 'reverse_review')),
  amount              BIGINT NOT NULL,
  presented_on        DATE NOT NULL,
  decide_by           TIMESTAMPTZ NOT NULL,  -- computed from the enrollment's cutoff, stored
  default_decision    TEXT NOT NULL CHECK (default_decision IN ('pay', 'return')),
  decision            TEXT CHECK (decision IN ('pay', 'pay_and_issue', 'return_fraud', 'return_other')),
  decided_by          TEXT,                  -- a platform user, or 'default'
  decided_at          TIMESTAMPTZ,
  transaction_id      UUID REFERENCES transactions (id)   -- the posting or the return
);

CREATE TABLE balance_transfer_rules (      -- ZBA and target balance structures
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),        -- the sub-account
  concentration_account_id UUID NOT NULL REFERENCES accounts (id),
  mode                TEXT NOT NULL CHECK (mode IN ('zero_balance', 'target', 'floor', 'ceiling')),
  target_amount       BIGINT NOT NULL DEFAULT 0,
  run_order           SMALLINT NOT NULL,     -- position in end of day
  valid_during        DATERANGE NOT NULL,
  CHECK (account_id <> concentration_account_id)
);

CREATE TABLE analysis_statements (         -- one per analyzed account or relationship and period
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),        -- the lead account
  period              DATERANGE NOT NULL,
  avg_ledger          BIGINT NOT NULL,
  avg_float           BIGINT NOT NULL,
  avg_collected       BIGINT GENERATED ALWAYS AS (avg_ledger - avg_float) STORED,
  reserve_ratio       NUMERIC(7, 6) NOT NULL DEFAULT 0,
  ecr                 NUMERIC(9, 6) NOT NULL,                        -- 0.015000 for 1.50%
  days_in_period      SMALLINT NOT NULL,
  days_in_year        SMALLINT NOT NULL CHECK (days_in_year IN (360, 365, 366)),
  earnings_credit     NUMERIC(20, 6) NOT NULL,                       -- minor units, unrounded
  balance_based_total BIGINT NOT NULL,
  fee_based_total     BIGINT NOT NULL,
  brought_forward     BIGINT NOT NULL DEFAULT 0,                     -- quarterly settlement cycles
  settles_on          DATE NOT NULL,
  settlement_fee_id   UUID REFERENCES fee_assessments (id),          -- the net charge, if any
  document_ref        TEXT NOT NULL,
  UNIQUE (account_id, period)
);

CREATE TABLE analysis_lines (
  analysis_statement_id UUID NOT NULL REFERENCES analysis_statements (id),
  afp_code            CHAR(6) NOT NULL,      -- AFP Service Code
  product_fee_id      UUID NOT NULL REFERENCES product_fees (id),
  volume              BIGINT NOT NULL,
  unit_price          NUMERIC(14, 6) NOT NULL,
  charge              BIGINT NOT NULL,
  offsettable         BOOLEAN NOT NULL,      -- balance-based or fee-based
  PRIMARY KEY (analysis_statement_id, afp_code, product_fee_id)
);

CREATE TABLE report_code_mappings (        -- transaction kinds to BAI2 and ISO 20022 codes, versioned
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  transaction_kind    TEXT NOT NULL,         -- transactions.kind
  bai2_type_code      CHAR(3) NOT NULL,
  iso_btc             TEXT NOT NULL,         -- 'PMNT/RCDT/XBCT'
  valid_during        DATERANGE NOT NULL,
  PRIMARY KEY (institution_id, transaction_kind, valid_during)
);
```

Exceptions the end-of-decision job resolves by default, run at each cutoff:

```sql
UPDATE tm_exceptions
SET decision   = CASE default_decision WHEN 'pay' THEN 'pay' ELSE 'return_other' END,
    decided_by = 'default',
    decided_at = NOW()
WHERE decision IS NULL
  AND decide_by <= NOW()
RETURNING id, enrollment_id, item_ref, decision;
```

Design notes:

- **The default is a decision, recorded as one.** `decided_by = 'default'` is the record a loss dispute turns on, and an exception still undecided after its cutoff is a failed control, not a pending item.
- **Deadlines are computed when the exception is created** from the enrollment's cutoff, time zone and the business calendar, and stored ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)); an enrollment change doesn't move a deadline already set.
- **The analysis is reproducible from the ledger.** `avg_ledger` and `avg_float` are averages of `balance_snapshots` over the period, volumes are counts of `transactions` and service events, and prices come from the product fee version in force; the stored statement is what was issued, never recomputed ([Statements](/books/banking-and-lending/interest-and-statements#the-periodic-statement)).
- **Earnings credit is not interest.** It posts nowhere as income to the customer; it offsets charges, so the settlement is one `fee_assessments` row for the net charge (or none), with the analysis as its trigger, and the GL books the waived portion by the bank's policy.
- **Sweeps and ZBAs run in end of day in order,** after postings and before snapshots, each transfer a journal entry referencing its rule, so analysis and interest read post-sweep balances consistently ([End of Day and the Business Date](/books/banking-and-lending/posting-holds-and-balances#end-of-day-and-the-business-date)).
- **Report codes are versioned per institution,** because clients' reconciliation rules key on them.

## Auditing

Treasury management records are read by the bank's operational risk and audit functions, by examiners reviewing fraud controls and fee practices, and by both sides after a loss. Keep:

- **Every enrollment and declination,** with the agreement shown and the signer who accepted or refused, for as long as a loss could be claimed.
- **Every issue file and every exception,** with its deadline, default, decision, decider and the resulting posting or return.
- **Every balance transfer rule version and the transfers it produced,** so a sub-account's history explains itself.
- **Every analysis statement as issued,** with its lines, prices, ECR and the settlement charge, and the ECR history by account, because ECR changes are pricing changes clients and examiners ask about.
- **Every report file sent,** with its control totals and the code mapping version that produced it ([Make It Tamper-Evident](/docs/architecture/audit-trails#make-it-tamper-evident)).

## What This Means for the System You Build

- **Model the controls once and the banks' names as labels:** positive pay, payee match, reverse review, ACH block and filter are the same few services everywhere.
- **Store each exception's deadline and default,** and record a default as the decision it is.
- **Record offers and refusals of fraud controls,** because the account agreement moves the loss on them.
- **Generate ZBA and sweep transfers as ordered end-of-day journal entries** with their rules as source.
- **Produce analysis statements from snapshots and fee versions,** with AFP codes, and keep the ECR as a priced, versioned term.
- **Speak BAI2 and camt from one mapping,** versioned per institution, and treat trailer totals as controls.
- **Give treasurers intraday positions,** not only prior-day statements; the wire cutoff doesn't wait for tomorrow's file.

## References

**Law and regulation**

- [UCC 3-406: Negligence contributing to forged signature or alteration](https://www.law.cornell.edu/ucc/3/3-406), preclusion and comparative allocation of the loss
- [UCC 4-406: Customer's duty to discover and report](https://www.law.cornell.edu/ucc/4/4-406), reasonable promptness, comparative allocation and the one-year bar
- [UCC 4-103: Variation by agreement](https://www.law.cornell.edu/ucc/4/4-103), agreements setting the standards for the bank's responsibility, without disclaiming good faith

**Regulators and guidance**

- [FinCEN: Alert on Nationwide Surge in Mail Theft-Related Check Fraud (FIN-2023-Alert003, February 27, 2023)](https://www.fincen.gov/sites/default/files/shared/FinCEN%20Alert%20Mail%20Theft-Related%20Check%20Fraud%20FINAL%20508.pdf), check fraud SARs in 2021 and 2022 and why business checks are targeted
- [Federal Reserve: Reserve requirements](https://www.federalreserve.gov/monetarypolicy/reservereq.htm), ratios reduced to zero effective March 26, 2020

**Specifications**

- [BAI: Cash Management Balance Reporting Specifications Version 2 (2005)](https://cdn.bai.org/migrated-from-www/docs/default-source/libraries/site-general-downloads/cash_management_2005.pdf), record types 01 to 99, delimiters, type code ranges and uniform codes, funds types
- [Deutsche Bank: ISO changes on account information messages](https://corporates.db.com/in-focus/Focus-topics/iso20022/implications-for-corporate-clients/iso-changes-on-account-information-messages), camt.052, camt.053 and camt.054 and the MT942 and MT940 they replace
- [Mambu Payments: camt.053 business logic](https://docs.mambupayments.com/docs/camt053-xsd-business-logic), balance type codes and the three-level bank transaction code
- [AFP: An Introduction to Account Analysis Statements (updated June 29, 2026)](https://www.financialprofessionals.org/training-resources/resources/articles/Details/an-introduction-to-account-analysis-statements), AFP Service Codes, the earnings credit formula, negotiable ECRs, expiring excess credits and deposit fees

**Vendor documentation**

- [Bank of America: Global Transaction Services Terms and Conditions (June 2026)](https://business.bofa.com/content/dam/boamlimages/documents/PDFs/gts_terms-conditions.pdf), positive pay variants, exception deadlines and defaults, ACH Positive Pay, controlled disbursement, ZBAs and balance-related transfers, lockbox, and the loss shift for declining positive pay
- [J.P. Morgan: Account Analysis Statement Guide](https://www.jpmorgan.com/content/dam/jpmorgan/documents/payments/account-analysis-statment-guides-ps-10-16-2025.pdf), definitions of each analysis line and the earnings credit and balance required formulas
- [J.P. Morgan: Defending Against Payments Fraud Using Bank Services](https://www.jpmorgan.com/insights/fraud/fraud-mitigation/fighting-payments-fraud-using-bank-services), positive pay, reverse positive pay thresholds, ACH debit block and Post No Checks
- [J.P. Morgan: Why APIs Are a Must for the Modern-Day Treasury](https://www.jpmorgan.com/insights/payments/apis-developer-experience/apis-modern-day-treasury), real-time balances and transactions in place of next-day reporting
- [PNC: PNC PROTECT](https://www.pnc.com/en/corporate-and-institutional/treasury-management/pnc-protect.html), Check Positive Pay, ACH Positive Pay and ACH Debit Block in PINACLE
- [PNC: Forward Contract](https://www.pnc.com/content/dam/pnc-com/pdf/corporateandinstitutional/International/FX/FX-Forward-Contract.pdf), forwards, forward points, window forwards and non-deliverable forwards
- [Regions: Positive Pay decisioning help card](https://www.regions.com/-/media/pdfs/treasury-management/Help-Card_PositivePay-Decisioning-Exceptions.pdf), exception load and decision times and decision options
- [U.S. Bank: SinglePoint positive pay exceptions (demo)](https://cashmgmt.usbank.com/demo/MobileSinglePoint/positive_pay/exceptions.html), exception types, deadlines and per-account defaults
- [U.S. Bank: Protecting cash balances with sweep vehicles](https://www.usbank.com/corporate-and-commercial-banking/insights/credit-finance/liquidity/cash-balances-sweep-vehicles.html), money market fund sweeps and multibank deposits
- [U.S. Bank: Navigating foreign currency hedging risk](https://www.usbank.com/corporate-and-commercial-banking/insights/international/hedging/navigating-fx-currency-risk.html), the hedge ratio
- [Wells Fargo: Payments fraud](https://www.wellsfargo.com/com/fraud/payments-fraud/), Positive Pay, Payee Validation, Reverse Positive Pay and the ACH Fraud Filter's Stop and Review modes
- [Wells Fargo: Commercial Account Agreement and service descriptions (2013, filed with the SEC)](https://www.sec.gov/Archives/edgar/data/0001008003/000082897215000007/wellsfargoserviceagreement.htm), assumption of preventable losses, target balance accounts, the sweep fund option and retail image lockbox
- [Frost Bank: Lockbox Service](https://www.frostbank.com/dam/Docs/BusinessPDFs/LockboxService.pdf), wholesale and retail lockbox and delivery to receivables systems
- [Trovata: Multibank connector](https://trovata.io/multibank-connector), BAI2, MT940 and camt.053 collection, SWIFT, sFTP and bank APIs
- [Trovata](https://trovata.io/) and [Trovata: Cash forecasting](https://trovata.io/cash-forecasting), cash positioning across banks and entities and forecasting from history, ERP inputs and scenarios
- [Ripple Treasury, powered by GTreasury](https://treasury.ripple.com/), bank connectors, current visibility, forecasting and FX and interest rate hedging
- [Nomentia](https://www.nomentia.com/), bank connectivity and Swift Business Connect

**In practice**

- [Modern Treasury: How do banks report balances and transactions?](https://www.moderntreasury.com/journal/how-do-banks-report-balances-and-transactions), BAI2's transfer to X9 as BTRS and MT940's prior-day limit
