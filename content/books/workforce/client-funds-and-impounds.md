+++
title = "Client Funds & Impound Accounts"
nav_title = "Client Funds & Impounds"
description = "Where a payroll provider holds clients' money: trust accounts, impounding, investment ladders, liquidity, client funds obligations and the daily reconciliation."
category = "Workforce Industry"
order = 2622
part = "Moving the Money"
tags = ["payroll", "client-funds", "trust-accounts", "float", "treasury", "reconciliation"]
+++

Between the employer debit and the last payment out, a payroll provider holds money that isn't its own: net pay for a few days, federal taxes until the next deposit date, quarterly state unemployment until the end of the month after the quarter, and garnishments until the disbursement unit's deadline. At the scale of the largest providers that is tens of billions of dollars on any given day. ADP's 10-K for the fiscal year ended June 30, 2026 reports an average client funds balance of $40.4 billion and $1,354.8 million of interest earned on it; at June 30 it owed $44,415.5 million of client funds obligations, to be paid in the following fiscal year. The money is held in trust structures, invested in laddered portfolios, and paid out partly from the next day's collections, and every dollar of it is owed to a named payee on a computed date.

This chapter covers how the money is held and managed: trust accounts and trust banks, what is impounded and for how long, commingled pools and the subledger that keeps them apart, investment policy and ladders from the 10-Ks, liquidity through commercial paper and repurchase agreements, client funds obligations on the balance sheet, interest income against the risks taken for it, and the daily reconciliation of funds held to obligations. How the money comes in is [Funding a Payroll](/books/workforce/funding-a-payroll); what it earns as a business line is [How Payroll Providers Make Money](/books/workforce/revenue-models#interest-on-client-funds), which this chapter doesn't repeat; the bank-side mechanics of pooled accounts held for others are in Payments' [FBO Accounts and Pass-Through Insurance](/books/payments/treasury#fbo-accounts-and-pass-through-insurance).

## How the Platforms Do It

What providers disclose about holding client funds, from their latest annual filings, as of November 2026:

| Provider | Structure | Investment policy | Liquidity |
| --- | --- | --- | --- |
| **ADP** (FY ended June 30, 2026) | ADP Trust Bank is "the sole trustee of ADP Client Trust, our grantor trust which holds U.S. client funds"; average client funds $40.4 billion | Ladders "out to five years (in the case of the extended portfolio)" and "out to ten years (in the case of the long portfolio)," a maximum maturity of 10 years at purchase, 7 years for BBB-rated securities, AAA minimum for asset-backed securities | Commercial paper program "for the issuance of up to $11.7 billion," averaging $4.2 billion of daily borrowings at 4.0% in fiscal 2026; reverse repurchase agreements "from overnight to up to ten business days"; daily collections used "to satisfy other unrelated client funds obligations" |
| **Paychex** (FY ended May 31, 2026) | Funds held for clients, average $5,768.2 million | "highly liquid, investment-grade fixed income securities"; "no exposure to high-risk or non-liquid investments"; available-for-sale weighted-average duration 3.1 years (2.2 the year before) | Has "periodically borrowed against available credit arrangements to meet short-term liquidity needs" |
| **Paycom** (FY 2025) | Paycom National Trust Bank is "the sole trustee of Paycom Client Trust, our grantor trust," which holds "substantially all client payroll and related funds," its fiduciary activities "subject to comprehensive ongoing oversight and regulation by the OCC" | Not reached in the sections I read | Not reached |
| **Paylocity** (FY ended June 30, 2026) | Funds held for clients "deposited in consolidated accounts on behalf of our clients" | Corporate bonds, commercial paper and "other securities with credit quality ratings of A-1 or higher," and money market funds | A $550.0 million revolving credit facility, $81.3 million drawn at June 30, 2026 |
| **Check** | Embedded payroll API | Not disclosed | A Tax Deposit is paid only if `funded`, so client cash is matched to each deposit before it goes out |

Three patterns stand out. **The big providers own a trust bank.** ADP and Paycom hold client money in a grantor trust whose sole trustee is a trust bank they own, regulated as a bank, which puts a fiduciary and a regulator between the client's payroll and the provider's corporate cash. **The portfolio is longer than the obligations.** Obligations are due within days to months, but ADP ladders out to ten years and Paychex's duration was 3.1 years, because the balance as a whole is stable even though every dollar in it turns over. **Liquidity comes from borrowing, not selling.** ADP borrows in commercial paper and repo when payments due exceed collections that day, rather than selling securities that may be under water. My rule: model the portfolio as one pool with a per-client subledger of obligations, and never let the portfolio's maturities be the reason a payment is late.
<!-- source-gap: wf-payroll-mtl | missing | Which states regulate payroll service providers holding client funds (money transmitter exemptions, payroll processor registration or bonding) | closes with: state money transmission statutes or banking department pages addressing payroll processors | checked: 2026-11-09 -->

## Trust Accounts and Trust Banks

The structure answers one question: if the provider failed, whose money would it be? A grantor trust holding client funds, with a regulated trust bank as sole trustee, says it is the clients' and their payees', held for them, not the provider's to lend or pledge. ADP and Paycom both use that structure, and Paycom's trust bank is chartered and supervised by the OCC. Providers without a trust bank hold funds in custodial or "for the benefit of" accounts at a commercial bank, titled for the clients, the shape Paylocity describes as "consolidated accounts on behalf of our clients" and the shape every embedded payroll API and small provider uses. Payments' [Treasury](/books/payments/treasury#fbo-accounts-and-pass-through-insurance) chapter covers what FBO titling does and doesn't do for deposit insurance, and the daily records it requires.

What the structure doesn't change: the employer still owes its taxes. The IRS says "The employer is ultimately responsible for the deposit and payment of federal tax liabilities" even when a provider holds the money ([Who Runs Payroll: Agents & Liability](/books/workforce/who-runs-payroll#who-stays-liable-worked)). A trust protects the money from the provider's creditors; it doesn't protect the employer from a provider that never deposits it, which is When Payroll Providers Fail's subject.

## What Is Impounded, and for How Long

To **impound** is to collect a payee's amount from the employer ahead of its due date and hold it until paid. Every component of the cash requirement has its own holding period, set by its due date:

| Component | Collected | Paid | Typical hold |
| --- | --- | --- | --- |
| Net pay | With the client debit, 1 to 4 banking days before the check date | Credits settle on the check date | 0 to 4 days |
| Federal income tax withheld and FICA, semiweekly depositor | With the debit | The Wednesday or Friday after the payday | 4 to 7 days from the check date |
| Federal taxes, monthly depositor | With the debit | The 15th of the following month | 2 to 6 weeks |
| FUTA | With the debit | Quarterly, by the end of the month after the quarter, if over $500 | Up to 4 months |
| State unemployment | With the debit | With the quarterly report | Up to 4 months |
| Child support | With the debit, when the provider remits | The state disbursement unit, within 7 business days of payday | About 1 to 2 weeks |
| 401(k) deferrals, when the provider remits | With the debit | On the DOL timing rule for participant contributions | Days |

The federal and support dates are in [Deposits, Returns & the Tax Calendar](/books/workforce/deposits-and-returns#when-deposits-are-due) and [Child Support Withholding](/books/workforce/child-support-withholding#remitting-to-the-state-disbursement-unit); 401(k) Deferrals & Remittance covers the plan timing. ADP describes the principle as "generally impounding the client's funds by the time we pay such client's obligation." The long tails (monthly depositors, FUTA, SUI) are where the balance comes from: a dollar of net pay is held for days, a dollar of quarterly unemployment tax for months.

### Worked Numbers: One Employer's Impound

An invented monthly depositor pays $40,000 of net pay and $12,000 of federal taxes on each biweekly payday, with a 4-day debit, at ADP's 3.4% average yield for illustration:

| Payday | Debit | Net pay held | Federal taxes due | Taxes held | Interest on net pay | Interest on taxes |
| --- | --- | --- | --- | --- | --- | --- |
| Fri Oct 9, 2026 | Mon Oct 5 | 3 days (credits Thu Oct 8) | Mon Nov 16 (Nov 15 is a Sunday) | 42 days | $11.18 | $46.95 |
| Fri Oct 23, 2026 | Mon Oct 19 | 3 days (credits Thu Oct 22) | Mon Nov 16 | 28 days | $11.18 | $31.30 |
| **October total** | | | | | **$22.36** | **$78.25** |

Each figure is amount x 3.4% x days / 365, mine. The taxes are 23% of the money and earn 78% of the interest, because they stay four to six weeks; the net pay turns over in days. Move the employer to a 2-day debit and the net pay interest falls by two thirds, about $15 a month, while the tax interest is unchanged: the float cost of faster funding is only ever the net pay piece ([Float Against Credit Losses](/books/workforce/revenue-models#float-against-credit-losses)). Promote the same employer to semiweekly deposits and the tax interest collapses to about a week per payday. The provider earns most on its smallest, slowest-depositing clients, and the deposit schedule computed each year from the lookback period moves the number.

## Commingled Funds and the Subledger

The money is pooled: one trust, a handful of accounts, thousands of employers. ADP's statement that it uses "the daily collection of funds from our clients to satisfy other unrelated client funds obligations" describes how a pool works: Tuesday's tax deposits for one employer may leave the account on the same day as another employer's net pay arrives. Pooling is efficient and lawful when the books say, at every moment, how much of the pool belongs to each employer and payee. That is the subledger:

- **Per employer, per obligation.** Each liability (an IRS deposit, a state payment, a disbursement unit remittance, a worker's returned credit) is an obligation of the pool to a payee on behalf of one employer, with its due date.
- **Cash in and cash out by employer.** Each client debit credits the employer's position; each payment out debits it. A failed client debit is a negative position the provider has funded, a receivable from the employer, not a reduction in another employer's money ([When the Debit Fails](/books/workforce/failed-debits-and-recovery)).
- **No negative positions funded by other clients.** Where the provider fronts a payroll, it funds the shortfall from corporate money or a credit line and books a receivable; taking it silently from the pool would be using one client's taxes to pay another client's employees.

## Investment Policy and Ladders

The pool is invested, and the 10-Ks describe the policies:

- **Laddering.** ADP's strategy "involves... laddering the maturities of our investments out to five years (in the case of the extended portfolio)" and "out to ten years (in the case of the long portfolio)," with a maximum maturity of 10 years at purchase. A ladder buys a slice maturing each period, so a fixed fraction matures every month and is reinvested at the current rate. That makes yield lag rates in both directions: when rates rise, the ladder's average yield climbs only as old slices mature, and when they fall it stays high for a while. ADP's average yield rose from 3.2% in fiscal 2025 to 3.4% in fiscal 2026.
- **Credit floors.** ADP requires AAA at purchase for asset-backed securities and caps BBB-rated securities at 7 years; Paylocity invests in securities rated "A-1 or higher" and money market funds; Paychex says it holds "highly liquid, investment-grade fixed income securities" with "no exposure to high-risk or non-liquid investments."
- **Duration.** Paychex extended the weighted-average duration of its available-for-sale portfolio from 2.2 to 3.1 years in fiscal 2026 and booked realized gains from repositioning the portfolio, which pushed interest on funds held for clients up 30% to $210.9 million.
- **The tail stays short.** Some of the pool is the same-week net pay and semiweekly taxes, so part of it is held in cash and money market funds whatever the strategy for the rest.

A provider's policy is data the treasury system enforces at purchase: allowed instruments, minimum rating by instrument, maximum maturity by rating, concentration limits by issuer, and the target ladder.

## Liquidity: Commercial Paper and Repo

A ladder works only if the provider never has to sell before maturity, and some days payments due exceed collections: the January W-2 season, quarter-end state payments, the day after a holiday. ADP's answer is to borrow short: short-term liquidity "obtained on an unsecured basis through the issuance of commercial paper" and "on a secured basis through the use of reverse repurchase agreements," with a commercial paper program of up to $11.7 billion that averaged $4.2 billion of daily borrowings at 4.0% in fiscal 2026 (against $4.1 billion at 4.8% the year before), repo terms "from overnight to up to ten business days," and $7.5 billion available on a committed basis in the US. The reason is in the same filing: net unrealized pre-tax losses on ADP's available-for-sale securities were $459.2 million at June 30, 2026. Selling to meet a Wednesday tax deposit would realize those losses; borrowing against the securities for a few days doesn't.

That makes the provider's daily cash forecast a schedule built from data the payroll system already has: every open liability's due date and amount, every client debit's expected settlement, and the maturities in the ladder. The gap on each day is the borrowing.

## Client Funds Obligations on the Balance Sheet

The pool appears on both sides of the provider's balance sheet. ADP at June 30, 2026:

| Line | Amount |
| --- | --- |
| Client funds obligations, "expected to be paid in fiscal 2027" | $44,415.5 million |
| Cash, cash equivalents and marketable securities "to satisfy such obligations" | $43,957.8 million |
| Difference | $457.7 million |
| Net unrealized pre-tax losses on available-for-sale securities | $459.2 million |

The arithmetic is mine: the shortfall of funds held against obligations is within $1.5 million of the portfolio's unrealized losses, consistent with a portfolio carried at fair value against obligations carried at face. Paychex's net unrealized losses on its available-for-sale securities were $52.5 million at May 31, 2026 and, it says, about $69.9 million at July 15, 2026. The obligations are owed in full, on time, whatever the portfolio is worth that day; the securities are held to maturity in practice so the loss never turns into cash, and the liquidity lines exist to keep it that way.

## Interest Income Against the Risks

The return is balance times yield; the risks are what earn it:

- **Rate risk.** Income moves with rates through the ladder. ADP's $40.4 billion at its 3.4% average is about $1,374 million by my arithmetic against $1,354.8 million reported; Paychex's $5,768.2 million at 3.5% is about $202 million against $210.9 million reported, the difference being the realized gains it disclosed. A provider's own model should be the per-day balance times the per-day yield of the holdings, not an average.
- **Market and liquidity risk.** Unrealized losses become real if the provider must sell, which is what the borrowing programs prevent.
- **Credit risk on investments,** bounded by rating floors and concentration limits.
- **Client credit risk,** the shortfalls from failed debits, which the float has to cover.
- **Regulatory timing risk.** Paychex notes that "allowing less time to remit taxes" to agencies "could adversely impact our interest income": the balance exists because the law gives employers days or weeks to deposit.

## Reconciling Funds Held to Obligations

The control that matters is daily and simple to state: for each employer, cash collected less cash paid out equals obligations open plus net pay in flight, and across the pool, the bank and custody balances equal the sum of every employer's position plus the provider's own funding of shortfalls. A difference is a break with an owner. The core model writes it as one of its design notes (funds held equal liabilities open); [Reconciliation](/docs/money/payment-states#reconciliation) covers the mechanics. The breaks that recur:

- **A returned client debit** after the credits went out: the employer's position goes negative; book the receivable, don't net it against other employers.
- **A returned employee credit:** cash came back into the pool for one worker; it is an obligation to that worker until resolved.
- **A tax payment that settled for a different amount** than the liability, or a liability canceled by a void after the cash was impounded: an overpayment to refund or apply.
- **Timing:** a deposit initiated but not yet settled, or a client debit settled at the bank but not yet matched.
- **Interest:** the pool's earnings are the provider's under its agreements, swept out of the trust on a schedule, never left mixed with obligations.

A report that ties the trust's balance to the subledger every morning, with aged breaks, is what an auditor tests in a SOC 1 (Controls, Audits & SOC 1) and what would have shown a provider diverting impounds months before it collapsed ([When Payroll Providers Fail](/books/workforce/when-providers-fail)).

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). Client money lives in `trust_accounts`; each employer's share is a position derived from `money_movements` and `liabilities`; holdings and their policy are the treasury side; the daily reconciliation is its own record.

```sql
-- The accounts that hold client money: a trust, an FBO or custodial account.
CREATE TABLE trust_accounts (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  name                TEXT NOT NULL,
  structure           TEXT NOT NULL CHECK (structure IN ('grantor_trust', 'fbo_custodial',
                        'custody_securities', 'operating_settlement')),
  bank                TEXT NOT NULL,         -- the trust bank or depository
  trustee             TEXT,                  -- for a trust: its sole trustee
  purpose             TEXT NOT NULL CHECK (purpose IN ('collections', 'disbursements',
                        'tax', 'investment', 'mixed')),
  opened_on           DATE NOT NULL,
  closed_on           DATE
);

ALTER TABLE money_movements ADD COLUMN trust_account_id UUID REFERENCES trust_accounts (id);

-- Each employer's position in the pool, per day: what it put in, what was paid for it.
CREATE TABLE client_fund_positions (
  employer_id         UUID NOT NULL REFERENCES employers (id),
  as_of               DATE NOT NULL,
  collected           BIGINT NOT NULL,       -- settled client debits and wires, cumulative
  disbursed           BIGINT NOT NULL,       -- settled payments made for it, cumulative
  obligations_open    BIGINT NOT NULL,       -- impounded liabilities not yet paid
  net_pay_in_flight   BIGINT NOT NULL,
  provider_funded     BIGINT NOT NULL DEFAULT 0,  -- shortfalls fronted: a receivable, never pool money
  PRIMARY KEY (employer_id, as_of),
  CHECK (collected + provider_funded - disbursed = obligations_open + net_pay_in_flight)
);

-- What the pool is invested in.
CREATE TABLE investment_holdings (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  trust_account_id    UUID NOT NULL REFERENCES trust_accounts (id),
  instrument          TEXT NOT NULL CHECK (instrument IN ('cash', 'money_market', 'treasury',
                        'agency', 'corporate', 'asset_backed', 'commercial_paper', 'cd',
                        'municipal')),
  cusip               CHAR(9),
  rating_at_purchase  TEXT,
  par                 BIGINT NOT NULL,
  cost                BIGINT NOT NULL,
  purchased_on        DATE NOT NULL,
  matures_on          DATE,
  ladder              TEXT,                  -- 'client_short', 'extended', 'long'
  policy_check        JSONB NOT NULL         -- the policy rule version and result at purchase
);

-- The daily tie-out of the pool to its obligations.
CREATE TABLE funds_reconciliations (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  as_of               DATE NOT NULL UNIQUE,
  bank_and_custody    BIGINT NOT NULL,       -- statement balances at cost
  sum_obligations     BIGINT NOT NULL,       -- all employers' obligations_open + in flight
  provider_receivables BIGINT NOT NULL,      -- shortfalls fronted
  provider_earnings   BIGINT NOT NULL,       -- interest not yet swept
  difference          BIGINT NOT NULL,       -- must be 0, or broken down in breaks
  breaks              JSONB NOT NULL DEFAULT '[]',  -- {employer_id, kind, amount, age_days, owner}
  reviewed_by         TEXT,
  reviewed_at         TIMESTAMPTZ,
  CHECK (difference = bank_and_custody - sum_obligations + provider_receivables - provider_earnings)
);

-- Cash need by day: obligations due less expected collections, for the borrowing plan.
SELECT li.due_on,
       SUM(li.amount)                                  AS due_out,
       COALESCE(c.expected_in, 0)                      AS expected_in,
       SUM(li.amount) - COALESCE(c.expected_in, 0)     AS gap
FROM liabilities li
LEFT JOIN (
  SELECT effective_date, SUM(amount) AS expected_in
  FROM money_movements
  WHERE purpose = 'client_debit' AND status IN ('pending', 'sent')
  GROUP BY effective_date
) c ON c.effective_date = li.due_on
WHERE li.status = 'impounded'
GROUP BY li.due_on, c.expected_in
ORDER BY li.due_on;
```

Design notes:

- **Positions are derived, not typed.** `client_fund_positions` is computed each day from settled movements and liabilities; the CHECK enforces the identity, and a row that can't satisfy it is a break, not a fix ([Reconciliation](/docs/money/payment-states#reconciliation)).
- **Provider funding is its own column.** A shortfall fronted for one employer is a receivable from that employer on the provider's books, so it never hides inside another employer's position.
- **Policy at purchase is data.** Every holding records which version of the investment policy it passed and how; a policy change doesn't rewrite old holdings ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).
- **Forecast from liabilities.** The borrowing plan reads `liabilities.due_on`, which the deposit and remittance rules computed, so treasury and payroll share one calendar.
- **Sweep earnings on a schedule.** Interest is the provider's revenue under its agreements; sweeping it out daily or monthly keeps the pool equal to obligations, and How Payroll Providers Make Money's accruals book it ([Cash Is Not Revenue](/docs/money/accounting#cash-is-not-revenue)).

## Auditing

- **The trust structure:** the trust agreement, trustee and account titling for every account that holds client money.
- **Every movement in and out of each trust account,** tied to an employer and a liability or a client debit.
- **Daily positions and reconciliations,** with each break, its owner, its age and its resolution; a break that ages is the first sign of misuse.
- **Holdings with their policy checks,** and every exception approved.
- **Borrowings** for liquidity, with the day's gap they covered.
- **Interest sweeps** with the computation behind each.

## What This Means for the System You Build

- **Hold client money in a structure titled for clients,** a trust or custodial account, apart from operating cash.
- **Keep a per-employer subledger of the pool** and never fund one employer's shortfall from another's money.
- **Impound each liability until its computed due date** and pay it on that date, not before or after.
- **Reconcile funds held to obligations every day,** with breaks aged and owned.
- **Encode the investment policy as data checked at purchase:** instruments, ratings, maturities, concentrations, ladder.
- **Plan liquidity from the liability calendar** and borrow short rather than sell long when a day's payments exceed its collections.
- **Report the float per employer** from actual holding periods; it explains pricing, funding speed and deposit schedule effects.

## References

**Filings**

- [ADP: Form 10-K for the fiscal year ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/8670/000000867026000030/adp-20260630.htm), ADP Trust Bank and ADP Client Trust, impounding, average client funds balance and yield, interest on funds held for clients, the extended and long ladders, maturity and rating limits, the commercial paper program and average borrowings, reverse repurchase terms and committed capacity, client funds obligations and the funds to satisfy them, and net unrealized losses
- [Paychex: Form 10-K for the fiscal year ended May 31, 2026](https://www.sec.gov/Archives/edgar/data/723531/000119312526307785/payx-20260531.htm), investment policy, duration, average funds held and rate, interest on funds held for clients and realized gains, unrealized losses, borrowing for short-term liquidity, and the effect of shorter remittance periods
- [Paycom: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1590955/000119312526059372/payc-20251231.htm), Paycom National Trust Bank as sole trustee of Paycom Client Trust and OCC oversight
- [Paylocity: Form 10-K for the fiscal year ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/1591698/000159169826000069/pcty-20260630.htm), consolidated accounts on behalf of clients, instruments rated A-1 or higher, interest income on funds held for clients and the revolving credit facility

**Agency guidance and forms**

- [IRS: Outsourcing payroll duties](https://www.irs.gov/businesses/small-businesses-self-employed/outsourcing-payroll-duties), the employer's ultimate responsibility for deposits made by a provider

**Vendor documentation**

- [Check: Tax deposits](https://docs.checkhq.com/docs/tax-deposits.md), tax deposits created at approval and paid only when funded
