+++
title = "Customer Protection, Net Capital & SIPC"
nav_title = "Protection & SIPC"
description = "Rule 15c3-3 possession or control and the reserve formula, daily computation, Rule 15c3-1 net capital, SIPC liquidations, and why crypto custody differs."
category = "Investing & Digital Assets Industry"
order = 2526
part = "Clearing and Settlement"
tags = ["investing", "customer-protection", "15c3-3", "net-capital", "sipc", "reserve-formula", "crypto", "custody"]
+++

When a broker-dealer fails, its customers don't line up with its other creditors. Their securities and cash are set apart as **customer property**, returned first and, where the property falls short, topped up by SIPC up to a limit. That only works if the firm kept customer assets apart the whole time, and the US got a set of rules for exactly that after the back-office collapses of 1968 to 1970: the customer protection rule, Rule 15c3-3, which tells a broker where customers' securities must be and how much cash it must lock away for them; the net capital rule, Rule 15c3-1, which makes the firm keep enough liquid capital to wind itself down; and the Securities Investor Protection Act, which created SIPC to run the liquidation when those fail.

All three are computations over the firm's books. Possession or control is a daily comparison of what customers own against what is in good control locations, security by security. The reserve formula is a sum of credits owed to customers less debits customers owe, deposited in a bank account the firm can't touch; since June 30, 2026 the largest firms run it every business day instead of weekly. Net capital is the firm's net worth minus everything it couldn't turn into cash in a hurry. A firm that gets the ledger right gets these nearly for free; a firm that can't say who owns what can't run any of them, which is the lesson the 1970 crisis, Lehman and MF Global all teach.

This chapter covers possession or control, the reserve formula with worked numbers and the daily computation, net capital with a worked check, SIPC coverage with worked numbers and the Lehman and MF Global liquidations, what SIPC doesn't cover, and why crypto custody protects customers in a different and weaker way. Free credit balances and sweep programs are in [Cash, Sweeps & Yield](/books/investing-and-digital-assets/cash-and-sweeps#free-credit-balances); the stock record is in [Ledgers, Positions & Buying Power](/books/investing-and-digital-assets/ledgers-and-positions#the-stock-record); the bank side of deposit insurance is Banking & Lending's [Pass-Through Coverage](/books/banking-and-lending/deposit-insurance#pass-through-coverage).

## How the Platforms Do It

What firms disclose about these protections, as of November 2026:

| Firm | Reserve computation | Capital | Customer protection disclosed |
| --- | --- | --- | --- |
| **Alpaca** | Not disclosed in the documentation read | Not read | Crypto through Alpaca Crypto LLC: "Cryptocurrencies are not securities and are not FDIC insured or protected by SIPC" |
| **Coinbase** | Not a broker-dealer for spot crypto | Not applicable to spot crypto | Takes the position that customer crypto it holds in the US is not its property and not subject to its general creditors' claims, while warning a court might disagree ([Terms Decide Bankruptcy](/books/investing-and-digital-assets/crypto-exchange-architecture#terms-decide-bankruptcy)) |
| **Interactive Brokers** | IB LLC "performs daily (i.e., instead of the required weekly) customer reserve computations" | IB LLC net capital $10,609 million against a $1,785 million requirement at December 31, 2025, excess $8,824 million | Separate bank accounts "for the exclusive benefit of customers" |
| **Robinhood** | Computed at Robinhood Securities, the clearing and carrying broker-dealer | Entity by entity | Stocks at the broker-dealer are SIPC-protected; crypto at Robinhood Crypto is not ([One Company, Many Entities](/books/investing-and-digital-assets/regulators-and-licenses#one-company-many-entities)) |

The pattern: **securities customers get a computed, audited, insured promise,** checked daily at the largest firms. **Crypto customers get a contractual and supervisory one,** which is only as strong as the terms of service, the ledger and the state regulator's custody rules.

## Possession or Control

Rule 15c3-3(b)(1) requires a broker-dealer to "promptly obtain and shall thereafter maintain the physical possession or control" of all **fully paid securities** (securities in a cash account and certain fully paid margin securities) and **excess margin securities** (margin securities worth more than "140 percent of the total of the debit balances" in the customer's margin accounts) that it carries for customers. Below that line, margin securities may be pledged to finance the customer's own loan; above it, they are the customer's and must sit where the firm can't use them.

**Good control locations** are listed in paragraph (c): a clearing corporation or depository (DTC), an omnibus account at another broker-dealer under Regulation T, items in transfer that aren't more than 40 days old, a designated foreign depository or custodian bank, a bank that acknowledges in writing that the securities are free of liens, the firm's own vault, and locations the SEC approves. A bank loan account, a stock loan to another firm, or a fail to receive is not a good control location.

**Worked numbers: a deficit in one security.** At the close on Wednesday, November 4, 2026, the firm's customers own XYZ as follows: cash-account customers 5,000 shares fully paid, margin customers 20,000 shares of which 8,000 are excess margin securities. The firm must have 13,000 in control.

| Where XYZ is | Shares | Good control? |
| --- | ---: | --- |
| DTC, the firm's account | 11,500 | Yes |
| Pledged to a bank for a firm loan | 1,000 | No |
| Lent to another broker | 2,000 | No |
| Required in control | 13,000 | |
| **Deficit** | **1,500** | |

Paragraph (d) has the firm determine the deficit "not later than the next business day," "as of the close of the preceding business day," and says what happens next: for securities under a bank loan, issue release instructions no later than the business day after that determination and have them back within two business days of the instructions; for securities on loan, issue return instructions on the same schedule and have them back within five. So on Thursday the firm finds the deficit, instructs the bank to release 1,000 and recalls 500 from the borrower. For fails to receive over 30 calendar days and stock dividends receivable over 45 calendar days the firm must take prompt steps to obtain them "through a buy-in procedure or otherwise," and short security differences found in a count must be bought in within 45 calendar days.

In the ledger, this is the location side of the stock record filtered to good control locations and compared with each security's fully paid plus excess margin quantity ([The Stock Record](/books/investing-and-digital-assets/ledgers-and-positions#the-stock-record)). The excess margin quantity changes with every price move and every debit, so the computation runs nightly from end-of-day positions and marks.

## The Reserve Formula

Possession or control protects securities. Cash is protected by the **reserve formula** in Exhibit A to the rule (Rule 15c3-3a). The firm adds up what it owes customers (credits), subtracts what customers owe it and assets it has tied up on their behalf (debits), and if credits exceed debits deposits the difference in a "Special Reserve Bank Account for the Exclusive Benefit of Customers." The logic is that customer cash may fund customer activity, mostly margin loans, but not the firm's own business.

The items:

- **Credits (items 1 to 9):** free credit balances and other credit balances in customers' accounts; bank loans collateralized by customers' securities; money payable against customers' securities loaned; customers' securities failed to receive; credit balances in firm accounts attributable to principal sales to customers; stock dividends and splits receivable over 30 days; short security count differences over 30 days; short securities and credits in suspense over 30 days; securities in transfer over 40 days not confirmed.
- **Debits (items 10 to 15):** debit balances in customers' cash and margin accounts (excluding unsecured and doubtful ones); securities borrowed to effect customers' short sales or deliver customers' fails; customers' fails to deliver not older than 30 days; margin on deposit at OCC for customer options; margin at a clearing agency or DCO for security futures; margin at a clearing agency for customers' Treasury transactions.
- **Item 16:** the excess of total credits over total debits must be on deposit in the reserve account. A firm on the alternative net capital standard reduces aggregate debits by 3% (2% if it computes daily), under Rule 15c3-1(a)(1)(ii)(A); a firm on the basic method reduces customer debit balances by 1% (Note E(3)).

There's a parallel computation for the proprietary accounts of other broker-dealers (PAB), with its own reserve account; an excess of debits in the customer computation can cover a PAB requirement, but not the other way around.

**Worked numbers: one computation.** A carrying broker on the alternative standard computes as of the close on Friday, October 30, 2026 (amounts in millions):

| Credits | | Debits | |
| --- | ---: | --- | ---: |
| Free credit balances | $1,200.0 | Customer margin debit balances | $900.0 |
| Bank loans on customer securities | $150.0 | Securities borrowed for customer shorts | $60.0 |
| Payable on customer securities loaned | $80.0 | Customer fails to deliver (≤30 days) | $35.0 |
| Customer fails to receive | $40.0 | Margin at OCC for customer options | $45.0 |
| Short differences over 30 days | $2.0 | | |
| **Total credits** | **$1,472.0** | **Total debits** | **$1,040.0** |
| | | Less 3% | −$31.2 |
| | | **Adjusted debits** | **$1,008.8** |

Required reserve: $1,472.0 − $1,008.8 = **$463.2 million**, on deposit "no later than one hour after the opening of banking business on the second following business day": Tuesday, November 3. A firm computing daily may use the 2% reduction instead: adjusted debits $1,019.2 million and a requirement of $452.8 million, $10.4 million less to lock up in exchange for running the computation every day.

### The daily computation

Weekly computation leaves a gap. On Monday, November 2, the firm's customers sell heavily and free credits rise by $250 million while margin debits don't move. The requirement is now $713.2 million, but a weekly firm doesn't compute again until Friday, November 6, and deposits the following Tuesday, November 10. For six business days customers are owed $250 million more than the reserve holds, and the firm can use that cash in its business. If the firm fails that week, the gap is customer property that isn't there.

The SEC's release found the gap is real: in 2023 the average customer reserve mismatch was 15.7% for firms above $500 million of average credits, against 6.4% below. Its answer, Release 34-102022 (adopted December 20, 2024, published at 90 FR 2790 on January 13, 2025, effective March 14, 2025), requires a firm whose **average total credits are $500 million or more** to compute daily, as of the close of the previous business day, with the same deposit timing. The average is the mean of total credits (customer plus PAB) from its 12 most recent month-end FOCUS reports; a firm that crosses the threshold has six months to start, and one that falls below may return to weekly on 60 days' notice to its examining authority. The SEC estimated 49 of 191 carrying broker-dealers above the threshold, nine of them already computing daily. The compliance date, first December 31, 2025, was extended to **June 30, 2026** (Release 34-103320, 90 FR 27990, July 1, 2025), and the rule is in force. A firm below the threshold may opt in, take the 2% reduction, and must keep computing daily unless its examining authority agrees otherwise.

For the engineering, daily means the computation is a production job, not a back-office spreadsheet: every item from the ledger at the close, by 9 or 10 the next morning, reviewed by a financial and operations principal, with a deposit or a permitted withdrawal instructed by the following business day. Withdrawals from the reserve account are allowed only if the balance left is at least the requirement, and the firm must keep the computation for every day it withdraws.

## Net Capital

Rule 15c3-1 makes a broker-dealer keep enough liquid capital to absorb losses and, if it comes to that, wind down in an orderly way. **Net capital** starts from net worth and subtracts assets not readily convertible to cash (fixed assets, prepaid items, goodwill, most unsecured receivables) and **haircuts** on the firm's own positions: for example 15% of the greater of long or short positions in securities not covered by a more specific category, and between 0% and 6% for government securities by time to maturity.

The requirement is the greater of a dollar minimum and a ratio:

- **Minimums:** $250,000 for a firm that carries customer accounts and holds funds or securities; $100,000 for a dealer or a firm exempt under (k)(2)(i); $50,000 for an introducing firm that receives but doesn't hold customer securities; $5,000 for firms with no customer funds or securities at all.
- **Basic method:** aggregate indebtedness may not exceed 1,500% of net capital (800% in the first 12 months of business).
- **Alternative standard:** net capital of at least the greater of $250,000 or 2% of aggregate debit items from the reserve formula.

Rule 17a-11 adds **early warning**: same-day notice if net capital falls below the minimum, and notice within 24 hours if aggregate indebtedness exceeds 1,200% of net capital, if an alternative-standard firm's net capital falls below 5% of aggregate debit items, or if net capital falls below 120% of its required minimum net capital. Withdrawals of capital to a parent are limited by paragraph (e) ([One Company, Many Entities](/books/investing-and-digital-assets/regulators-and-licenses#one-company-many-entities)).

**Worked numbers: a net capital check.** The same carrying firm, on the alternative standard, at the close (millions):

| Line | Amount |
| --- | ---: |
| Net worth | $180.0 |
| Less nonallowable assets (fixed assets, unsecured receivables, goodwill) | −$40.0 |
| Less haircut: 15% of $100.0 of proprietary equities | −$15.0 |
| **Net capital** | **$125.0** |
| Requirement: greater of $0.25 or 2% × $1,040.0 aggregate debits | $20.8 |
| **Excess net capital** | **$104.2** |
| Early warning: 5% of aggregate debits | $52.0 |
| Early warning: 120% of the required minimum net capital | $24.96 |

Now a trading loss of $80 million, and the haircut position marked down to $50 million. Net worth falls to $100.0 million, the haircut to $7.5 million, and net capital to $52.5 million: still well above the $20.8 million requirement, just above the $52.0 million early warning line. Another $1 million of loss and the firm owes its regulators a notice within 24 hours. The same drop raises the firm's clearing deposit: NSCC's Excess Capital Premium divides the volatility charge by net capital, so a firm whose capital fell by more than half sees that ratio more than double ([The Clearing Fund](/books/investing-and-digital-assets/clearing-and-settlement#the-clearing-fund)). Capital and clearing risk move together on bad days, and a firm's monitoring should show both on one screen.

A small introducing broker on the basic method checks the ratio instead: with $250,000 of net capital and $3.2 million of aggregate indebtedness, the ratio is 1,280%, under the 1,500% limit but over the 1,200% early warning line, so a notice is due within 24 hours.

## SIPC

If a member broker-dealer fails and customer property is short, SIPC asks a court to appoint a trustee to liquidate the firm under SIPA. Customers' **net equity** claims are paid first from customer property, ratably; where that doesn't cover a customer's net equity, SIPC advances up to **$500,000 per customer, of which no more than $250,000 may be for cash** (15 USC 78fff-3). The cash limit is the "standard maximum cash advance amount", reviewed by SIPC's board every five years against inflation (subsection (e)). Insiders, 5% owners and broker-dealer or bank customers trading for themselves get no advance.

**Separate capacities.** Each capacity is a separate customer: individual, joint, corporate, trust, IRA, Roth IRA, an estate, a guardian's account. Accounts in the same capacity are combined: two individual accounts in one name share one $500,000, while a traditional IRA and a Roth IRA at the same firm get $500,000 each.

**What SIPC protects and doesn't.** It protects "stocks, bonds, Treasury securities, certificates of deposit, mutual funds, money market mutual funds" and cash in a brokerage account "from the sale of or for the purchase of securities." It does not protect against a decline in value, commodity futures (outside portfolio margining), foreign exchange, unregistered investment contracts, or "any digital or crypto asset that does not qualify as a 'security'", and SIPA's definition of a security excludes stablecoins. Cash swept to a bank is a deposit at the bank, protected by FDIC pass-through coverage if the records are right, not by SIPC ([Bank Sweep Programs](/books/investing-and-digital-assets/cash-and-sweeps#bank-sweep-programs)).

**Worked numbers: one customer, three outcomes.** An individual account holds $420,000 of securities and $310,000 of free credit cash at the failed broker: net equity $730,000. The same person has a Roth IRA with $90,000 of securities, $60,000 in the firm's bank sweep, and $50,000 of bitcoin at the firm's crypto affiliate.

| Outcome | Individual account | Roth IRA | Bank sweep | Bitcoin |
| --- | --- | --- | --- | --- |
| **Customer property complete** (Lehman) | $730,000 returned from customer property; no SIPC advance | $90,000 returned | At the bank: FDIC, not SIPC | Not SIPC; the affiliate's estate and its terms decide |
| **Customer property 60% of claims** | $438,000 from the estate; the remaining $292,000 (by my proportional split, $168,000 securities and $124,000 cash) is within both limits, so SIPC advances it | $54,000 from the estate, $36,000 advanced | As above | As above |
| **Customer property gone** (a fraud) | SIPC advances at most $500,000, no more than $250,000 of it for cash; $230,000 is left as a general creditor claim | $90,000 advanced, a separate capacity | As above | As above |

The table makes the design point. Coverage is per capacity and in two limits, and the trustee computes it from the firm's records as of the filing date. A broker whose account titling, capacity and cash-versus-securities split are wrong in its records hands the trustee a reconstruction project.

**Lehman and MF Global.** Lehman Brothers Inc.'s customers were made whole: SIPC announced on June 7, 2013 that all securities customer claims would be 100 percent fulfilled with no advances from the SIPC Fund, because the customer property was there ([Crises & the Rules They Wrote](/books/investing-and-digital-assets/crises-and-the-rules#2008-madoff-lehman-and-dodd-frank) has the figures). MF Global, a broker-dealer and FCM that had used customer segregated funds, took over four years: SIPC reported in February 2016 that $8.1 billion had been returned to customers and creditors, about $6.9 billion of it to customer claimants, 100 percent of allowed claims, when the court approved closing the estate. Both trustees were James W. Giddens. The difference between them is the difference between a firm whose customer property was segregated and one whose wasn't: one paid in full from the estate, the other spent years recovering the shortfall.

## Crypto: Protection by Contract

None of this applies to spot crypto held by an exchange or a crypto affiliate. There is no reserve formula, no possession-or-control rule and no SIPC. What protects a crypto customer is:

- **The terms of service.** In Celsius, terms that transferred title made Earn customers unsecured creditors; Coinbase's terms and its reliance on UCC Article 8 aim at the opposite result ([Terms Decide Bankruptcy](/books/investing-and-digital-assets/crypto-exchange-architecture#terms-decide-bankruptcy)).
- **Segregation the ledger can prove.** New York's custody guidance requires segregated, customer-only omnibus wallets and an internal ledger that shows each customer's beneficial interest at all times ([What Makes It Lawful](/books/investing-and-digital-assets/crypto-exchange-architecture#what-makes-it-lawful)).
- **Proof of reserves,** which shows assets on chain but not the liabilities off it ([Proof of Reserves & Liabilities](/books/investing-and-digital-assets/proof-of-reserves)).
- **Qualified custody** at a trust company or national trust bank for institutional and fund assets ([Qualified Custody](/books/investing-and-digital-assets/qualified-custody)).

The engineering conclusion: a crypto platform can't buy SIPC, but it can build the 15c3-3 discipline anyway, as a daily computation of customer-owned quantity per asset against customer-only wallet balances, with deficits worked to zero by rule rather than by mood. That computation is the possession-or-control check with wallets as the control locations, and it's what a court, a regulator or a proof of reserves will ask for.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): `journal_lines` (owner and location lines per instrument), `positions`, `legal_entities` and `reconciliations`, plus the off-chain `custody_locations` from [How to Build It](/books/investing-and-digital-assets/ledgers-and-positions#how-to-build-it) in Ledgers, Positions & Buying Power. This chapter adds which locations count as control, daily possession deficits, reserve computations and net capital computations.

```sql
CREATE TABLE control_locations (             -- which places count as good control, and why
  custody_location_id  UUID PRIMARY KEY REFERENCES custody_locations (id),
  control_basis        TEXT NOT NULL CHECK (control_basis IN ('clearing_corporation',
                         'omnibus_broker_dealer', 'transfer_item', 'foreign_depository',
                         'bank_no_lien_letter', 'firm_vault', 'sec_approved')),
  evidence_ref         TEXT NOT NULL,            -- the bank's no-lien acknowledgment, the approval
  valid_during         TSTZRANGE NOT NULL
);

CREATE TABLE possession_deficits (           -- one row per security per day with a shortfall
  legal_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  instrument_id        UUID NOT NULL REFERENCES instruments (id),
  as_of_date           DATE NOT NULL,
  fully_paid_qty       NUMERIC(78, 0) NOT NULL,
  excess_margin_qty    NUMERIC(78, 0) NOT NULL,  -- above 140% of each customer's debit
  in_control_qty       NUMERIC(78, 0) NOT NULL,
  deficit_qty          NUMERIC(78, 0) NOT NULL CHECK (deficit_qty > 0),
  action               TEXT NOT NULL CHECK (action IN ('release_bank_loan', 'recall_stock_loan',
                         'buy_in_fail', 'buy_in_short_difference', 'other')),
  instructed_at        TIMESTAMPTZ,
  due_by               DATE NOT NULL,            -- 2 or 5 business days, 30 or 45 calendar days
  cured_on             DATE,
  PRIMARY KEY (legal_entity_id, instrument_id, as_of_date, action)
);

CREATE TABLE reserve_computations (          -- Exhibit A, customer and PAB, every run
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('customer', 'pab')),
  frequency            TEXT NOT NULL CHECK (frequency IN ('daily_required', 'daily_elected',
                         'weekly', 'monthly')),
  as_of_close          DATE NOT NULL,
  items                JSONB NOT NULL,           -- item 1..15 amounts in USD cents, with sources
  total_credits        BIGINT NOT NULL,
  total_debits         BIGINT NOT NULL,
  debit_reduction_pct  NUMERIC(4, 2) NOT NULL,   -- 3, 2 or 1
  required_deposit     BIGINT NOT NULL,          -- credits minus reduced debits, floor zero; 105% if monthly
  account_balance      BIGINT NOT NULL,          -- the reserve account before action
  action_amount        BIGINT NOT NULL,          -- signed: deposit positive, withdrawal negative
  action_due_by        TIMESTAMPTZ NOT NULL,     -- one hour after the bank opens, second business day
  through_entry_id     UUID NOT NULL REFERENCES journal_entries (id),
  approved_by          TEXT NOT NULL,            -- the financial and operations principal
  UNIQUE (legal_entity_id, kind, as_of_close)
);

CREATE TABLE net_capital_computations (
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  as_of_close          DATE NOT NULL,
  method               TEXT NOT NULL CHECK (method IN ('basic', 'alternative')),
  net_worth            BIGINT NOT NULL,          -- USD cents
  nonallowable_assets  BIGINT NOT NULL,
  haircuts             JSONB NOT NULL,           -- by rule paragraph, with positions and rates
  net_capital          BIGINT NOT NULL,
  aggregate_indebtedness BIGINT,                 -- basic method
  aggregate_debits     BIGINT,                   -- alternative: from reserve_computations
  requirement          BIGINT NOT NULL,
  early_warning_breached TEXT[] NOT NULL DEFAULT '{}',  -- 'below_minimum', 'ai_over_1200',
                                                 -- 'below_5pct_debits', 'below_120pct_minimum'
  notice_sent_at       TIMESTAMPTZ,              -- 17a-11: same day or within 24 hours
  UNIQUE (legal_entity_id, as_of_close)
);
```

The possession-or-control check, per security at the close, from the ledger:

```sql
-- customer_segregation_snapshot is derived at the close from positions and each margin
-- account's debit: the fully paid and excess margin quantity per account and instrument
WITH owed AS (                    -- what must be in control: fully paid plus excess margin
  SELECT instrument_id, SUM(fully_paid_qty + excess_margin_qty) AS qty
  FROM customer_segregation_snapshot          -- per account and instrument at the close
  WHERE legal_entity_id = :entity AND as_of_date = :d
  GROUP BY instrument_id
), held AS (                      -- settled location lines in good control locations
  SELECT jl.instrument_id, -SUM(jl.amount) AS qty
  FROM journal_lines jl
  JOIN journal_entries je ON je.id = jl.journal_entry_id
  JOIN control_locations cl ON cl.custody_location_id = jl.location_id
                           AND cl.valid_during @> (:d)::timestamptz
  WHERE je.legal_entity_id = :entity
    AND jl.ledger_account = 'omnibus'
    AND COALESCE(jl.settles_on, je.effective_date) <= :d
  GROUP BY jl.instrument_id
)
SELECT o.instrument_id, o.qty AS required, COALESCE(h.qty, 0) AS in_control,
       o.qty - COALESCE(h.qty, 0) AS deficit
FROM owed o LEFT JOIN held h USING (instrument_id)
WHERE o.qty > COALESCE(h.qty, 0);
```

Design notes:

- **Every item in the formula is a query with a name,** versioned, and its result stored with the computation, so an examiner can rerun any day's figure from the ledger as of that day's close.
- **The segregation snapshot is per account:** each margin customer's excess margin quantity depends on their own debit and their own positions' values at the close, so it is computed per account and summed, never estimated in aggregate. The snapshot is the one table this sketch assumes rather than defines; it is a nightly derivation from `positions` and marks.
- **The reserve account is a location with `customer_only` set,** and the posting rules reject any firm-asset movement into it, as for crypto omnibus wallets.
- **Thresholds are data.** The $500 million daily threshold, the debit reduction percentages, early warning levels and the SIPC limits change by rule or by board decision; they live in a versioned rules table, not in code.
- **Crypto gets the same check:** customer-owned quantity per asset against customer-only wallets, run daily, with `possession_deficits` rows when the wallets come up short.

## Auditing

These computations are filed, examined and, on a failure, the trustee's starting point:

- **Every reserve computation** (customer and PAB), with item-level sources, the reduction used, the deposit or withdrawal and its timing against the deadline, and the bank's statement for the reserve account.
- **Every day's possession or control result,** each deficit with its instruction time and cure, and every control location's evidence (no-lien letters, approvals).
- **Every net capital computation** with haircuts by position and every early warning notice with its timestamp.
- **Account titling and capacity history,** so SIPC limits can be computed per capacity from the records alone.
- **The terms of service in force for each crypto customer,** with versions and acceptance, because in a crypto bankruptcy they decide ownership.

## What This Means for the System You Build

- **Run possession or control nightly** from the ledger, per security, against locations flagged as good control, and track every deficit to its rule deadline.
- **Build the reserve formula as named, versioned item queries** and run it daily, whatever your size; the threshold is the law's floor, not a design target.
- **Compute net capital and early warning daily** and show them beside the clearing fund estimate; they fall together.
- **Record capacity on every account** so SIPC coverage is a query.
- **Keep sweep cash, securities, futures and crypto in separate entities and separate ledger accounts,** and tell customers which protection applies to which balance.
- **For crypto, build the 15c3-3 discipline without the rule:** customer-only wallets, a daily possession check and terms that say the customer owns the asset.

## References

**Law and regulation**

- [17 CFR 240.15c3-3: Customer protection, reserves and custody of securities](https://www.law.cornell.edu/cfr/text/17/240.15c3-3), (a)(3) and (a)(5) fully paid and excess margin securities at 140%, (b)(1) possession or control, (c) control locations, (d) deficit timelines, (e) reserve accounts, weekly and daily computation, the $500 million average, deposit timing, opt-in at 2%, (g) withdrawals, (h) short differences, (j)(2) sweep conditions
- [17 CFR 240.15c3-3a: Exhibit A, formula for determination of reserve requirements](https://www.law.cornell.edu/cfr/text/17/240.15c3-3a), credits 1 to 9, debits 10 to 15, item 16, Note E(3)'s 1% reduction and 105% for monthly computers
- [17 CFR 240.15c3-1: Net capital requirements](https://www.law.cornell.edu/cfr/text/17/240.15c3-1), 1,500% aggregate indebtedness, the alternative standard of $250,000 or 2% of debits, the 3% (2% if daily) debit reduction in (a)(1)(ii)(A), the dollar minimums, nonallowable assets and haircuts
- [17 CFR 240.17a-11: Notification provisions](https://www.law.cornell.edu/cfr/text/17/240.17a-11), same-day notice below minimum, 24-hour notice at 1,200%, 5% of debits and 120% of required minimum net capital
- [15 USC 78fff-3: SIPC advances](https://www.law.cornell.edu/uscode/text/15/78fff-3), $500,000 per customer, the $250,000 standard maximum cash advance amount, separate capacities, inflation review, excluded insiders and broker or bank customers
- [Federal Register: Daily Computation of Customer and Broker-Dealer Reserve Requirements, 90 FR 2790 (January 13, 2025)](https://www.federalregister.gov/documents/full_text/html/2025/01/13/2024-31178.html), Release 34-102022, effective March 14, 2025, the 15.7% and 6.4% mismatch averages, 49 of 191 firms, the 2% and 3% reductions
- [Federal Register: Extension of compliance date, 90 FR 27990 (July 1, 2025)](https://www.federalregister.gov/api/v1/documents/2025-12016.json), Release 34-103320, compliance moved from December 31, 2025 to June 30, 2026

**Regulators and guidance**

- [SIPC: What SIPC protects](https://www.sipc.org/for-investors/what-sipc-protects), $500,000 including $250,000 for cash, what is covered, futures, FX, crypto that isn't a security and stablecoins excluded, no protection against declines
- [SIPC: Investors with multiple accounts](https://www.sipc.org/for-investors/investors-with-multiple-accounts), separate capacities and the combining rule with examples
- [SIPC: Lehman customer distributions (June 7, 2013)](https://www.sipc.org/news-and-media/news-releases/20130607), all securities customer claims 100 percent fulfilled with no SIPC Fund advances, trustee James W. Giddens
- [SIPC: MF Global liquidation concluded (February 9, 2016)](https://www.sipc.org/news-and-media/news-releases/20160209), $8.1 billion returned, about $6.9 billion to customers at 100 percent of allowed claims, the court's approval

**Filings**

- [Interactive Brokers: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1381197/000138119726000062/ibkr-20251231.htm), IB LLC's daily reserve computation, exclusive-benefit bank accounts and net capital of $10,609 million against $1,785 million

**Vendor documentation**

- [Alpaca: Crypto trading](https://docs.alpaca.markets/us/docs/crypto-trading-1.md), Alpaca Crypto LLC and crypto outside FDIC and SIPC protection
