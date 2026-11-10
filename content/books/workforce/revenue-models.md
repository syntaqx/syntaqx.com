+++
title = "How Payroll Providers Make Money"
nav_title = "Revenue Models"
description = "Per employee pricing, interest on client funds from 10-Ks, rate sensitivity, PEO gross billings and net revenue, insurance margins, EOR and embedded fees."
category = "Workforce Industry"
order = 2603
part = "The Business"
tags = ["payroll", "business-models", "float", "peo", "pricing", "revenue-recognition"]
+++

A payroll provider sells a monthly subscription, holds a few days of its clients' cash, and, if it is a PEO, resells insurance at a markup. Those three lines explain almost every number in a payroll company's 10-K and many of its product decisions. Subscription revenue scales with the number of people a client pays and the modules it buys, so providers price per employee per month and chase attach rates. Interest on client funds scales with the balance held and the rate earned, so a provider collects early, pays on the due date, and invests in a ladder that lags the market. PEO revenue scales with the cost of insurance, so a PEO's margin moves with health claims and workers' compensation as much as with headcount, and its reported revenue depends on what accounting lets it leave out.

Each line has a risk on the other side. Collecting later to offer faster payroll gives up float and takes on credit exposure; an unrecovered debit costs more than years of interest on the same client. A PEO that underprices a client's health plan loses more on the claims than it makes on the fee. This chapter works through each line with the figures the filings publish, as of November 2026: pricing models and modules, interest on client funds and its sensitivity to rates, float against credit losses, PEO gross billings and net revenue under ASC 606, insurance margins, EOR fees and embedded payroll economics. It extends the overview in [How the Money Works](/books/workforce/workforce-business#how-the-money-works), and the worked examples are mine, labeled as such.

## How the Platforms Do It

As of November 2026, from each company's latest annual report:

| Provider (fiscal year) | Total revenue | Interest on client funds | Float as share of revenue | How it prices | Retention as reported |
| --- | --- | --- | --- | --- | --- |
| **ADP** (June 30, 2026) | $21,947.4M | $1,354.8M | 6.2% | Contracts that "blend base fees and per-employee fees" | Employer Services client revenue retention 92.1% |
| **Paychex** (May 31, 2026) | $6,512.0M | $210.9M | 3.2% | Not stated in the 10-K; over 60% of revenue from solutions other than payroll processing | Payroll client retention 82% to 83% |
| **Paycom** (December 31, 2025) | $2,051.7M | $113.0M | 5.5% | "Based on employee headcount and the number of applications utilized" | Annual revenue retention 91% |
| **Paylocity** (June 30, 2026) | $1,771.3M | $120.0M | 6.8% | "A base fee in addition to a fee based on the number of client employees," per employee per month | Annual revenue retention above 92% for three years |
| **Dayforce** (December 31, 2024, last public year) | $1,760.0M | $200.3M "float revenue" | 11.4% | "Monthly recurring fees on a PEPM basis, generally one-month in advance" | Not compared |
| **TriNet** (December 31, 2025) | $5,010M | $67M | 1.3% | Professional service fees plus insurance service revenues | Not compared |
| **Insperity** (December 31, 2025) | $6,812M | Not compared | | A markup on gross billings | Client retention 83% |

Float shares are my arithmetic from the reported lines. Three patterns run through the table:

- **Float is a few percent of revenue and more of profit.** Interest on client funds is reported as revenue with no matching cost line beside it, so by my reading most of its 1% to 11% of revenue reaches operating income. Dayforce had the highest share in its last public year.
- **Every company prices per worker, with a base.** ADP, Paylocity, Paycom and Dayforce all describe per-employee fees, usually with a base fee per client, and small business pricing pages publish the same shape.
- **PEO revenue isn't comparable to payroll revenue, or to other PEOs'.** Insperity's revenue is its markup, ADP's PEO revenue includes zero-margin benefits pass-throughs, and TriNet's is mostly insurance billed gross. See [Gross Billings and Net Revenue](#gross-billings-and-net-revenue).

## Per Employee per Month

The base of every subscription is a count of people paid. Published small business pricing, as of November 2026:

| Product | Base per month | Per person per month | Notes |
| --- | --- | --- | --- |
| **Square Payroll** | $35 | $6 | Contractor-only plan at $6 per person with no base; $3 per mailed paper W-2 or 1099 if the employer opts in |
| **OnPay Payroll Essentials** | $49 | $6 | HR add-ons priced the same way, a base plus per worker |
| **QuickBooks Payroll with QuickBooks Simple Start** | $88 | $6.50 | Sold bundled with accounting; higher bundles $125 plus $6.50 and $203 plus $10 |
| **Rippling** | A base fee, not published | From $8 | Payroll quoted separately |
| **Deel US PEO** | None published | $125 | Co-employment, not software alone |

A worked comparison of my own for an employer paying 40 people: Square is $35 + 40 x $6 = $275 a month; OnPay is $49 + 40 x $6 = $289; the QuickBooks bundle is $88 + 40 x $6.50 = $348 including accounting software; Rippling starts at 40 x $8 = $320 plus its base. Deel's PEO is 40 x $125 = $5,000 a month, about 17 times the software price, because it buys co-employment: the PEO's HR staff, its benefit plans and, for a CPEO, the federal tax liability.

Older service bureau pricing charged per payroll run or per check, and the shape survives in fees for off-cycle runs and year-end forms; none of the current pricing pages and filings I opened prices a regular payroll per run. <!-- source-gap: wf-per-run-pricing | missing | current per-run or per-check payroll pricing | closes with: a provider pricing page or filing stating a per-run or per-check fee | checked: 2026-11-09 -->

### Modules and Attach

Payroll is the entry point, and the growth is in what's added to it. Paychex says "Over 60% of our revenue is derived from solutions other than payroll processing," and its Management Solutions segment lists payroll, HR management, talent, workforce management, benefits administration, ASO, retirement and funding solutions; it is also "a leading 401(k) recordkeeper," with more than 130,000 retirement customers and $66 billion of assets. Paycom prices on "the number of applications utilized," and ADP reports pays per control (employees paid per client) growing 1% on a same-store basis in fiscal 2026, which is the per-worker meter running on its existing base. Square lists workers' compensation, health insurance and 401(k) as add-ons. Each module is another per-worker line on the same invoice, and the invoice is only as right as the count behind it.

### What Gets Counted

A per-worker fee needs a definition of a worker for the month, and the definition is a billing decision with consequences:

- **Who counts.** Every active employee, only those paid in the month, or only those paid in a run that month. Square's "each person paid" counts payments, not records; a terminated worker who stays active in the HRIS is overbilled under an "active" definition.
- **Contractors.** Square charges contractors the same $6 without a base on its contractor plan.
- **Proration.** A worker hired on the 20th counts for the month or for a third of it.
- **Advance or arrears.** Dayforce bills "generally one-month in advance of service," so a headcount change trues up the next invoice.

My rule: the invoice line stores the count, the definition it used and the query that produced it, so a client's dispute about 41 versus 40 employees reads the rows, not a recalculation ([Revenue Metrics Are Not Revenue](/docs/money/accounting#revenue-metrics-are-not-revenue)).

## Interest on Client Funds

Float is the average balance held times the yield earned. The filings make the arithmetic checkable:

| Provider | Average balance | Yield | Balance x yield (my arithmetic) | Reported |
| --- | --- | --- | --- | --- |
| **ADP**, FY2026 | $40.4 billion | 3.4% | $1,373.6 million | $1,354.8 million |
| **Paychex**, FY2026 | $5,768.2 million | 3.5% | $201.9 million | $210.9 million, including realized gains from repositioning the portfolio |
| **Dayforce**, 2024 | $4.88 billion average float balance | Up 35 basis points on the year | | $180.2 million Dayforce, $18.8 million Powerpay, $1.3 million other |

Two ratios of my own explain why ADP's balance is seven times Paychex's with only about 1.4 times the clients:

- **Days held.** ADP moved more than $3.5 trillion of US client funds in fiscal 2026; $40.4 billion is about 4.2 days of that flow (40.4 / 3,500 x 365). Paychex moved about $1.3 trillion against $5.77 billion, about 1.6 days. The ADP figure mixes a global balance with US flow, so read it as an order of magnitude; the difference is still large, and it comes from how early each collects and how long taxes wait for their due dates.
- **Per client.** $1,354.8 million over "over 1.1 million clients" is about $1,230 a client a year at ADP; $210.9 million over about 840,000 customers is about $250 at Paychex; $113.0 million over 39,199 clients is about $2,880 at Paycom; $120.0 million over 44,400 clients is about $2,700 at Paylocity. Bigger clients, bigger balances.

The balance has two parts with different clocks. Net pay is held from the client debit until the credits settle, a day or two to four. Taxes are held until their deposit dates: semiweekly deposits wait days, monthly deposits wait weeks, and quarterly unemployment contributions wait until the month after the quarter. A worked example of my own for one invented monthly depositor: $12,000 of federal taxes withheld on a January 2 payroll is due February 15, held 44 days, worth $12,000 x 3.4% x 44 / 365 = about $49.18 at ADP's yield, while the same client's $40,000 of net pay held two days earns about $7.45. The tax calendar, not the payroll calendar, sets most of the float, which is why a provider computes every liability's due date from its rule and pays on it, never early ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)). Client Funds & Impound Accounts covers how the balance is held.

### Rate Sensitivity

The naive sensitivity is the balance times the change: 25 basis points on ADP's $40.4 billion is about $101 million a year. ADP's own estimate is a fifth of that: a 25 basis point change in short- and intermediate-term rates would have "approximately an $21.0 million impact to earnings before income taxes" over the twelve months ending June 30, 2027, and about $10.0 million from short-term rates alone. The gap is the ladder: ADP invests client funds out "to five years (in the case of the extended portfolio)" and "out to ten years (in the case of the long portfolio)," so only the cash and the maturing slice reprice within a year, and the rest carries yesterday's rates until it rolls. Paychex reports a weighted-average duration of 3.1 years for its available-for-sale securities (2.2 years a year earlier). The [Investing & Digital Assets volume's rate sensitivity](/books/investing-and-digital-assets/revenue-models#rate-sensitivity) works the same arithmetic for broker cash.

A system that projects float income needs the portfolio's maturities, not just the balance: the reprice schedule is what turns a rate move into next year's number.

## Float Against Credit Losses

Collecting earlier is worth float; collecting later is a product feature clients pay for in convenience and providers pay for in risk. The filings say plainly who holds that risk. Paychex "could be held liable for such amounts in the event the client has insufficient funds"; Paylocity debits a client's account "prior to any disbursement," yet "We typically pay client employees, taxing authorities and vendors before" those transfers settle. In embedded payroll the risk is contracted out: on Gusto Embedded's faster speeds, if a company doesn't fulfill collection of a failed 2-day debit, "the liability is transferred to you (after 90 days)," meaning the partner platform.

The economics, worked with invented numbers at ADP's 3.4%: a client paying $100,000 of net pay every two weeks moves from a 4-day to a 2-day debit. The provider gives up two days of float on $100,000, $100,000 x 3.4% x 2 / 365 = $18.63 a run, about $484 a year. One unrecovered $100,000 debit equals about 206 years of that client's lost float. Across 1,000 such clients the faster schedule costs about $484,000 a year in float, and five unrecovered debits erase it. That ratio is why debit speed is a credit decision with limits, demotion and strikes behind it; Funding a Payroll and When the Debit Fails cover them.

## Gross Billings and Net Revenue

A PEO bills its client for everything: each worksite employee's wages, the payroll taxes, the benefit premiums, the workers' compensation cost and a fee. How much of that is revenue is a principal or agent judgment under ASC 606: an entity that controls a good or service before it reaches the customer reports the gross amount, and one that arranges for another party to provide it reports its fee ([ASC 606 and IFRS 15 in Five Steps](/docs/money/accounting#asc-606-and-ifrs-15-in-five-steps); the [Commerce volume](/books/commerce/commerce-accounting#revenue-for-goods) applies the same test to marketplaces). PEOs reach different answers line by line, and the filings show them:

- **Insperity** excludes only wages. "Our PEO HR Solutions gross billings to clients include the payroll cost of each WSEE at the client location and a markup," and "Revenues, which exclude the payroll cost component of gross billings, and therefore, consist solely of the markup," which "includes pricing components associated with our estimates of payroll taxes, benefits and workers' compensation." Payroll taxes, benefits and workers' compensation are then direct costs below revenue.
- **ADP** excludes wages and payroll taxes. "PEO revenues are net of direct pass-through costs, primarily consisting of payroll wages and payroll taxes" ($81,123.2 million netted out in fiscal 2026), and the revenue it keeps includes $4,607.3 million of zero-margin benefits pass-throughs.
- **TriNet** reports professional service revenues, "fees charged to clients for processing payroll-related transactions," and insurance service revenues, "insurance-related billings and administrative fees collected from PEO clients and withheld from WSEs," with insurance costs as a separate expense.

The same PEO, presented three ways, has three revenue lines, and a per-worksite-employee revenue figure means something different at each company.

### Insperity, Worked Per Worksite Employee

Insperity's 2025 figures, per average worksite employee per month (my arithmetic over 310,089 x 12 = 3,721,068 worksite employee months, which reproduces its reported $1,831 and $242):

| Line | 2025 total | Per WSEE per month |
| --- | --- | --- |
| Gross billings | $45,565 million | $12,245 |
| Less worksite employee payroll cost (wages) | $38,753 million | $10,415 |
| **Revenue (the markup)** | **$6,812 million** | **$1,831** |
| Less direct costs: payroll taxes, benefits, workers' compensation | $5,912 million | $1,589 |
| **Gross profit** | **$900 million** | **$242** |

The markup is about 17.6% of payroll cost and about 15% of gross billings; gross profit is about 2.0% of gross billings and 13.2% of revenue. Gross profit per worksite employee per month, Insperity's "principal measurement of relative performance at the gross profit level," fell from $285 in 2024 to $242 in 2025 while revenue per worksite employee rose from $1,785 to $1,831: the price went up, and the cost underneath it (mostly benefits) went up faster.

### ADP TotalSource, Worked

From ADP's fiscal 2026 10-K: PEO Services revenue of $7,128.1 million, of which $4,607.3 million is zero-margin benefits pass-throughs, leaving $2,520.8 million (ADP's own figure, up from $2,401.4 million). Adding back the $81,123.2 million netted out gives about $88,251 million billed in all (my arithmetic). Spreading the $2,520.8 million over the "more than 770,000" year-end worksite employees, a rough figure because the count is a point in time, gives about $273 a worksite employee a month: closer to Insperity's gross profit than its revenue, because ADP's revenue excluding pass-throughs already leaves out both wages and taxes and the benefits it passes through at cost.

## Insurance Margins

Insurance is most of a PEO's revenue and much of its risk:

- **TriNet**, per average worksite employee per month in 2025 (my arithmetic over 333,886 x 12): insurance service revenues of $4,224 million are about $1,054, insurance costs of $3,835 million about $957, leaving about $97; professional service revenues of $719 million add about $179. Insurance costs were 90.8% of insurance revenues in 2025 against 89.9% in 2024 (same revenue, $3,797 million of costs), which TriNet describes as "insurance costs outpacing the growth in insurance services revenues." A one-point move in that ratio is about $42 million.
- **Paychex** reports PEO and Insurance Solutions revenue of $1,433.2 million against PEO direct insurance costs of $563.2 million, up 8% with worksite employees and insurance revenue.
- **ADP** retains workers' compensation risk through ADP Indemnity, "deductible reimbursement insurance protection" up to $1 million per occurrence, and booked a pre-tax actuarial gain of $2.8 million in fiscal 2026 ($8.8 million the year before); its PEO operating expenses rose $37.1 million on higher workers' compensation and state unemployment costs for worksite employees.
- **TriNet** likewise "assume[s] the risk for losses up to $1 million per claim occurrence (deductible layer)" for workers' compensation.

A PEO prices each client's insurance in advance and learns the cost later, as claims develop. Its system has to keep the price billed and the cost incurred on the same worksite employee, plan and period, or it can't tell which clients are profitable. [PEOs & Co-Employment](/books/workforce/peos-and-co-employment) covers the master plans behind the numbers.

## Employer of Record Fees

An EOR charges a flat monthly fee per worker on top of the full employment cost. As of November 2026: Remote's EOR starts at $599 per employee per month on annual contracts, with equity administration at $39 more; Deel's EOR starts at $599, its contractor product at $49 and contractor of record at $325; Oyster's EOR is $699. A worked example with invented numbers: a worker paid $80,000 in a country where employer contributions add 20% costs the client $96,000 plus 12 x $599 = $7,188, $103,188 in all, the fee about 7% of the total. The fee is flat, so with the same contributions it is about 13% of the total for an invented $40,000 salary and under 5% for a $120,000 one: it weighs most on lower-paid hires, and an entity of the client's own gets cheaper per head as headcount in one country grows. Employer of Record & Global Employment covers the decision.

## Embedded Payroll Economics

Embedded payroll splits the economics between a software platform that owns the customer and a payroll partner that runs the engine, the money and the filings. The partners' public pages describe the platform's side as new revenue lines more than a fee schedule: Check tells platforms they can "Unlock additional revenue streams like health benefits, 401(k), workers' comp, and more," and Zeal says platforms can "unlock new revenue streams with interest and interchange" from pay cards and wallets. The closest published revenue share is in a different channel: OnPay pays accounting firms that resell its payroll a 15% revenue share, 20% at 50 or more clients. The partner contracts that set embedded splits aren't public. <!-- source-gap: wf-embedded-revenue-share | missing | embedded payroll revenue share or wholesale pricing between payroll partners and platforms | closes with: a partner's published pricing or a filing describing the split | checked: 2026-11-09 -->

The risk side is published: on Gusto Embedded a failed fast-payroll debit that the company doesn't fulfill becomes the partner's liability after 90 days ([Float Against Credit Losses](#float-against-credit-losses)). A platform that takes a revenue share on payroll also takes a share of the credit losses unless its contract says otherwise, and its ledger needs both. Embedded Payroll covers the partner model.

## How to Build It

Price plans and subscriptions turn counts into invoices; float accruals and PEO billing lines turn the money already in the core model into revenue the provider can explain:

```sql
CREATE TABLE price_plans (                 -- a published or negotiated price
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  code                TEXT NOT NULL,          -- 'payroll_core', 'time', 'benefits_admin', 'peo', ...
  base_fee            BIGINT NOT NULL DEFAULT 0,          -- cents per month
  per_worker_fee      BIGINT NOT NULL DEFAULT 0,          -- cents per counted worker per month
  count_rule          TEXT NOT NULL CHECK (count_rule IN ('active', 'paid_in_month',
                        'paid_per_run', 'contractors_paid')),
  proration           TEXT NOT NULL CHECK (proration IN ('none', 'daily')),
  billing_timing      TEXT NOT NULL CHECK (billing_timing IN ('advance', 'arrears')),
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (code WITH =, valid_during WITH &&)
);

CREATE TABLE company_subscriptions (       -- what a company bought, over time
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  price_plan_id       UUID NOT NULL REFERENCES price_plans (id),
  discount_percent    NUMERIC(5, 2) NOT NULL DEFAULT 0,
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING GIST (company_id WITH =, price_plan_id WITH =, valid_during WITH &&)
);

CREATE TABLE pepm_invoices (               -- one line per subscription per month
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  subscription_id     UUID NOT NULL REFERENCES company_subscriptions (id),
  service_month       DATE NOT NULL,          -- first of the month
  worker_count        NUMERIC(9, 2) NOT NULL, -- prorated counts can be fractional
  count_query_ref     TEXT NOT NULL,          -- the versioned definition that produced the count
  worker_ids          UUID[] NOT NULL,        -- who was counted, for disputes
  amount              BIGINT NOT NULL,        -- cents
  money_movement_id   UUID REFERENCES money_movements (id),   -- when collected by debit
  UNIQUE (subscription_id, service_month)
);

CREATE TABLE float_income_accruals (       -- interest earned on what a run left in trust, by day
  accrual_date        DATE NOT NULL,
  employer_id         UUID NOT NULL REFERENCES employers (id),
  pay_run_id          UUID REFERENCES pay_runs (id),
  held_balance        BIGINT NOT NULL,        -- client debits settled less money paid out, cents
  portfolio_yield     NUMERIC(8, 6) NOT NULL, -- the day's blended yield on client funds
  accrued_interest    NUMERIC(14, 4) NOT NULL, -- fractional cents; rounded when summed
  PRIMARY KEY (accrual_date, employer_id, pay_run_id)
);

CREATE TABLE peo_billing_lines (           -- every component of a PEO invoice, and its treatment
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  pay_run_id          UUID NOT NULL REFERENCES pay_runs (id),
  client_employer_id  UUID NOT NULL REFERENCES employers (id),
  worker_id           UUID REFERENCES workers (id),
  component           TEXT NOT NULL CHECK (component IN ('wages', 'employer_tax', 'benefits',
                        'workers_comp', 'admin_fee', 'markup', 'other')),
  amount_billed       BIGINT NOT NULL,        -- cents, on the client's invoice
  cost_amount         BIGINT,                 -- what the PEO pays out for it, when known
  revenue_treatment   TEXT NOT NULL CHECK (revenue_treatment IN ('excluded_pass_through',
                        'gross_revenue', 'zero_margin_pass_through', 'fee')),
  pay_statement_line_id UUID REFERENCES pay_statement_lines (id),
  liability_id        UUID REFERENCES liabilities (id)
);

-- Gross billings, revenue and gross profit per client and month, from the lines.
CREATE VIEW peo_client_margin AS
SELECT b.client_employer_id,
       date_trunc('month', r.check_date)::DATE AS month,
       SUM(b.amount_billed)                                            AS gross_billings,
       SUM(b.amount_billed) FILTER (WHERE b.revenue_treatment <> 'excluded_pass_through')
                                                                       AS revenue,
       SUM(b.amount_billed - COALESCE(b.cost_amount, 0))
         FILTER (WHERE b.revenue_treatment <> 'excluded_pass_through') AS gross_profit
FROM peo_billing_lines b
JOIN pay_runs r ON r.id = b.pay_run_id
GROUP BY 1, 2;
```

Design notes:

- **Counts are queries with versions.** `count_query_ref` names the definition that produced each month's count and `worker_ids` keeps who was in it, so a changed definition applies to later months and an old invoice can be reproduced ([Recognition Schedules](/docs/money/accounting#recognition-schedules)).
- **Float accrues from the liabilities, not the bank balance.** The held balance per employer per day is what the core model already reconciles: settled client debits less net pay, remittances and other payments out ([Reconciliation](/docs/money/payment-states#reconciliation)). Accruing interest on it per run is what lets a provider say what a faster funding schedule or an earlier deposit costs, by client.
- **Accrue in fractional cents, round on the sum.** A day's interest on a small balance is a fraction of a cent; the accrual keeps four decimal places and the monthly total is rounded once ([Rounding](/docs/money/amounts#rounding)).
- **The revenue treatment is on the line.** Each PEO billing component carries whether it is excluded as a pass-through, reported gross, passed through at zero margin or a fee, so the same lines produce ADP-style, Insperity-style and TriNet-style figures, and a policy change is a mapping change, not a re-bill ([The Product Keeps Facts, Finance Picks Policy](/docs/money/accounting#the-product-keeps-facts-finance-picks-policy)).
- **Billed and cost on the same row.** A worksite employee's benefits line holds both the amount billed and the premium paid, so per-client insurance margin is a sum, and a carrier invoice that arrives later updates `cost_amount` rather than a separate ledger.
- **Invoices tie to money.** A PEPM invoice collected by debit points at its money movement; a PEO's fee is collected inside the payroll debit, so its billing lines tie to the run and its liabilities.

## Auditing

- **Every invoice reproducible:** the plan and discount in force, the count, the definition and the workers counted, for each month.
- **Float income by employer and day,** tied to the liabilities and money movements behind the held balance, so the total reconciles to interest on funds held for clients in the general ledger.
- **PEO billing lines to their sources:** each wage, tax, benefit and workers' compensation component to the statement line or liability that produced it, with its revenue treatment, so gross billings, revenue and gross profit are queries.
- **Insurance billed against insurance cost** per client, plan and period, with carrier invoices attached.
- **Reported metrics as definitions:** retention, revenue per worksite employee and float yield as published, each with its written definition and the query that computes it ([Definitions as Code, Restatements as Rows](/books/user-generated-platforms/operating-metrics#definitions-as-code-restatements-as-rows)).

## What This Means for the System You Build

- **Price per counted worker with a base, and store the counting rule** on every invoice line with the workers it counted.
- **Accrue float per employer per day from the held balance,** so funding speed and deposit timing have a price.
- **Compute every liability's due date from its rule and pay on it,** because the tax calendar sets most of the float.
- **Project rate sensitivity from the portfolio's maturities,** not the balance alone.
- **Price faster funding as credit,** with the float given up and the expected loss side by side.
- **Tag every PEO billing component with its revenue treatment,** so one set of lines produces any presentation.
- **Keep insurance billed and insurance cost on the same rows** per worksite employee, plan and period.
- **Record revenue shares and loss shares together** for embedded partners.

## References

**Filings**

- [ADP: Form 10-K for the fiscal year ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/8670/000000867026000030/adp-20260630.htm), revenue, base and per-employee fees, client revenue retention, pays per control, interest on funds held for clients, average balance and yield, the 25 basis point sensitivity, ladders, client funds moved, PEO revenue net of pass-throughs, zero-margin benefits pass-throughs, ADP Indemnity and PEO operating expenses
- [Paychex: Form 10-K for the fiscal year ended May 31, 2026](https://www.sec.gov/Archives/edgar/data/723531/000119312526307785/payx-20260531.htm), revenue, over 60% from solutions other than payroll processing, retirement customers and assets, client retention, interest on funds held for clients, average balance and rate, duration, client shortfall liability, PEO and Insurance Solutions revenue and PEO direct insurance costs
- [Paycom: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1590955/000119312526059372/payc-20251231.htm), revenue, interest on funds held for clients, pricing by headcount and applications, clients and revenue retention
- [Paylocity: Form 10-K for the fiscal year ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/1591698/000159169826000069/pcty-20260630.htm), revenue, base and per-employee fees, interest on funds held for clients, clients, retention, and paying before client transfers settle
- [Dayforce: Form 10-K for 2024](https://www.sec.gov/Archives/edgar/data/1725057/000095017025029980/day-20241231.htm), float revenue and its definition, average float balance and yield change, PEPM fees billed in advance
- [TriNet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/937098/000093709826000010/tnet-20251231.htm), professional and insurance service revenues and their descriptions, insurance costs, interest income, average worksite employees and the workers' compensation deductible layer
- [Insperity: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1000753/000100075326000011/nsp-20251231.htm), gross billings, payroll cost, revenue as markup and its components, gross profit, per-WSEE figures and client retention

**Vendor documentation**

- [Square: Payroll pricing](https://squareup.com/us/en/payroll/pricing), base and per-person fees, the contractor plan, mailed form fees and add-ons
- [OnPay: Pricing](https://onpay.com/pricing), Payroll Essentials base and per-worker fees, HR add-ons and the partner revenue share
- [QuickBooks: Payroll pricing](https://quickbooks.intuit.com/payroll/pricing/), payroll and accounting bundles with per-employee fees
- [Rippling: Pricing](https://www.rippling.com/pricing), plans from $8 per employee per month with a base fee
- [Deel: Pricing](https://www.deel.com/pricing/), EOR, contractor, contractor of record and US PEO prices
- [Remote: Employer of Record](https://remote.com/employer-of-record), EOR from $599 per employee per month and the equity add-on
- [Oyster: Pricing](https://www.oysterhr.com/pricing), EOR at $699 per employee per month
- [Gusto Embedded: 2-day vs 4-day payroll](https://docs.gusto.com/embedded-payroll/docs/2-day-vs-4-day.md), paying before the debit clears and the 90-day liability transfer to the partner
- [Check](https://www.checkhq.com/), revenue streams for platforms from benefits, 401(k) and workers' compensation
- [Zeal](https://www.zeal.com/), interest and interchange as platform revenue
