+++
title = "Funding the Book"
description = "Where a lender's money comes from: balance sheet, warehouse lines, forward flow, participations and securitization, allocation and investor reporting."
category = "Banking & Lending Industry"
order = 2456
part = "Funding and Licensing"
tags = ["banking", "lending", "funding", "securitization", "warehouse-lines", "forward-flow"]
+++

Every loan is paid for by someone before the borrower pays anything back. A bank pays for it with deposits. A nonbank lender has no deposits, so it borrows against the loans it makes (a warehouse line), sells them as they're made (forward flow and whole-loan sales), sells pieces of them (participations), or pools them into a trust that issues bonds (securitization). Most lenders of any size use several at once, and each funder sets rules about which loans it will take, at what price, and what it wants to hear about them every month afterward. The lender's growth is capped by how much of its book its funders will carry, and its margin by what they charge.

For the system, funding is a set of contracts that turn into rules: eligibility criteria and concentration limits per funder, an advance rate that decides how much cash a pledged loan releases, triggers that cut a facility off when losses rise, and reporting that has to reconcile to the cent with the servicer's ledger. This chapter covers the funding sources and how public lenders use them, warehouse lines with worked borrowing-base arithmetic, forward flow and whole-loan sales, participations, securitization, the allocation decision at origination, and investor reporting. The economics these choices feed (cost of funds, gain on sale, servicing income) are in [The Lending Business](/books/banking-and-lending/lending-business); the mortgage version, where Fannie Mae, Freddie Mac and Ginnie Mae are the buyers, is [The Secondary Mortgage Market](/books/banking-and-lending/secondary-mortgage-market); and the bank whose name is on the note when a nonbank's loans are funded this way is the subject of [Lender Licensing & Bank Partnerships](/books/banking-and-lending/lender-licensing).

## How the Platforms Do It

As of October 2026, from the latest annual filings and quarterly releases:

| Lender | Who originates | How the book is funded | A figure that shows the model |
| --- | --- | --- | --- |
| **Affirm** | Partner banks (Celtic Bank and Lead Bank) for substantially all US loans | "Four primary channels": warehouse credit facilities, term and revolving securitizations (including a master trust), pass-through loan sales and forward flow sales | $14.0 billion of borrowing capacity with $8.7 billion outstanding at June 30, 2026; $21.9 billion of loans sold in fiscal 2026; equity capital 4% of the total platform portfolio |
| **BILL** (Divvy card) | Issuing banks Cross River Bank, WEX Bank and WebBank | BILL buys a 100% participation interest in every card receivable, mostly with corporate cash, partly with revolving facilities secured by the receivables | $600.0 million of facility capacity, $330.0 million drawn at June 30, 2026 |
| **Enova** | Its own state licenses and five bank partner programs | Debt facilities and securitizations | $5.38 billion of long-term debt and $1.3 billion of liquidity, including available facility capacity, at September 30, 2026 |
| **Happen** (formerly LendingClub) | Its own national bank | Deposits for loans it keeps; whole-loan sales and its Structured Program for loans it sells | About $8 billion of loans sold under the Structured Program since launch, with Happen keeping the senior securities |
| **Pagaya** | Partners (banks, marketplaces, other lenders) originate with Pagaya's models | Special purpose entities that Pagaya administers buy pools from partners and fund them with securitizations, forward flow and private placements | Holds retained securitization interests that exceed 40% of its assets excluding cash and government securities |
| **Upstart** | More than 100 bank and credit union partners | 2025 originations: 64% bought by institutional investors, 26% kept by lending partners, 10% on its balance sheet | More than 50% of funding through committed capital, under which Upstart shares in loan performance |

Three patterns stand out. **Nobody funds a large book one way.** Affirm runs four channels, Upstart three, and even Happen, a bank, sells most of what it makes. **The originator and the funder are usually different companies:** a partner bank makes the loan, holds it for days, and sells it or a participation in it to the program or its investors. **Selling doesn't end the exposure.** Affirm's loss-sharing with loan buyers is capped "based on a percentage of the principal balance of loans sold," Upstart shares "some of the risk, including the upside" with committed capital, Pagaya holds the risk retention pieces of its deals, and BILL "bears full credit risk" on receivables a bank originated.

## The Funding Sources

| Source | What the lender does | What the funder gets | Who carries the loss |
| --- | --- | --- | --- |
| **Balance sheet (deposits)** | Holds the loan, funded by deposits and equity | Depositors get interest and FDIC insurance | The lender |
| **Corporate cash and debt** | Holds the loan with equity, a revolving credit facility or corporate bonds | Interest; unsecured or secured by the company | The lender |
| **Warehouse line** | Pledges loans to a bank's revolving facility and draws a percentage of their balance | Interest over a benchmark, a senior secured claim and monthly reports | The lender, up to the haircut; the warehouse lender beyond it |
| **Forward flow** | Sells loans to an investor as they are made, under a commitment to buy a volume that meets agreed criteria | The loans, at an agreed price, usually serviced by the seller | The buyer, plus any loss-share or repurchase obligation the seller agreed to |
| **Whole-loan sale and pass-through** | Sells specific loans or pools, one deal at a time, or into certificates a trust issues | The loans, or certificates backed by them | The buyer or certificate holder |
| **Participation** | One party sells another a percentage interest in a loan it keeps legal title to | A share of the payments and losses | Each participant, in its share |
| **Securitization** | Sells a pool to a bankruptcy-remote trust that issues tranched notes; keeps the residual and the required retention | Bonds rated by tranche, paid by a waterfall | Junior tranches and the residual first, senior notes last |

Two lines run through the table. **Committed versus uncommitted.** Affirm says most of its facilities are committed, but "some facilities are uncommitted," and an uncommitted lender may cut its limit at any time; a committed forward flow buyer has agreed to a volume for a term (one to three years, in Affirm's description). The system has to know which of its capacity can disappear tomorrow. **On versus off the balance sheet.** Loans pledged to a warehouse stay the lender's loans. Loans sold to a forward flow buyer generally leave. A securitization trust a lender controls is a variable interest entity it usually consolidates, so the loans stay on its balance sheet with the notes as its debt, which is why Affirm says retained loans "are primarily funded through our consolidated securitizations and warehouse lines." The accounting conclusion is finance's to make; the system's job is to keep the facts (who owns the loan, who has a claim on it, what was retained) so finance can make it ([The Product Keeps Facts, Finance Picks Policy](/docs/payments/accounting#the-product-keeps-facts-finance-picks-policy)).

## Warehouse Lines

A warehouse line is a revolving credit facility, usually from a bank, secured by the loans it funds. The lender originates a loan, pledges it into the facility (often by selling it to a special purpose subsidiary that is the facility's borrower), and draws cash against it until the loan is sold, securitized or paid off. Nonbank mortgage lenders live on them between closing and delivery to the agencies; consumer and card lenders use them to hold loans until there are enough for a securitization.

The facility agreement is a set of rules the system must evaluate every day:

- **Eligibility criteria.** Which loans may be pledged: product, term, rate, original amount, minimum credit score or risk grade, borrower state, days past due (a loan 30 or more days delinquent usually drops out), whether it has been modified, and that it was originated under the agreed credit policy. A loan that fails a criterion after pledging becomes ineligible; Affirm warns that "failure to repurchase so-called 'ineligible loans' when required could constitute an event of default."
- **Concentration limits.** Caps on the share of the pool in one state, one risk grade, one term or one merchant, with the excess treated as ineligible even if each loan qualifies on its own.
- **Advance rate.** The percentage of eligible balance the lender may borrow. The rest, the **haircut**, is funded with the lender's own equity and is the warehouse lender's first-loss protection.
- **Borrowing base.** Eligible balance times the advance rate, computed and reported on a schedule (daily for mortgage warehouses, at least monthly for consumer facilities). If the borrowing base falls below what is drawn, the lender must pay down the difference or pledge more loans.
- **Performance triggers.** Tests on delinquency, net loss rate or excess spread over a rolling period; breaching one stops new draws or starts **early amortization**, where collections repay the facility instead of being released to the lender. Affirm notes that "certain of these covenants are tied to our consumer default rates" and a breach could let lenders "require repayment of such funding prior to its scheduled maturity."
- **Corporate covenants.** Minimum tangible net worth, maximum leverage and minimum unrestricted cash at the parent, which Affirm lists for its revolving facility.

## Worked Numbers: A Borrowing Base

An illustration of my own, with terms in the shape facility agreements use: a personal loan lender has $100,000,000 of loans pledged to a warehouse with an 85% advance rate, a 15% cap on any one state, and 30 days past due as the delinquency cutoff.

| Line | Amount | Basis |
| --- | --- | --- |
| Pledged principal | $100,000,000 | Unpaid principal of every pledged loan |
| Less: 30 or more days past due | ($2,000,000) | Ineligible under the delinquency criterion |
| Less: excess over the state cap | ($3,000,000) | One state holds $17,700,000 of the $98,000,000 still eligible; the cap is 15%, or $14,700,000 |
| **Eligible principal** | **$95,000,000** | |
| Advance rate | 85% | |
| **Borrowing base** | **$80,750,000** | $95,000,000 × 0.85 |
| Drawn | $78,000,000 | |
| **Availability** | **$2,750,000** | What the lender may still draw |
| Haircut funded by the lender | $14,250,000 | $95,000,000 − $80,750,000, plus the $5,000,000 of ineligible loans it funds entirely |

The next month $2,500,000 more of eligible loans roll past 30 days, $6,000,000 of principal is collected, and $8,000,000 of new loans are pledged (with the state mix unchanged). Eligible principal is now $95,000,000 − $2,500,000 − $6,000,000 + $8,000,000 = $94,500,000, the borrowing base is $80,325,000, and with the draw still at $78,000,000 availability is $2,325,000, less than a month earlier: the $8,000,000 pledged added $6,800,000 of borrowing base, collections removed $5,100,000 and the delinquency roll $2,125,000. (Where collections are swept to the warehouse lender, the draw falls with them and the same arithmetic runs on a smaller balance.) Two lessons from the arithmetic. **Delinquency costs cash before it costs earnings:** every dollar that rolls past the cutoff withdraws 85 cents of funding the same day it becomes ineligible, long before the loan charges off. **The haircut is the lender's equity in its own book:** at an 85% advance rate, each $100 of new loans needs $15 of the lender's cash, which is why a fast-growing nonbank's growth is limited by its equity even with unused facility commitments.

## Forward Flow and Whole-Loan Sales

A **forward flow** agreement commits an investor (a bank, an insurer, a private credit fund) to buy loans as they're originated, up to a volume over a term, at a price set by formula (par plus or minus a premium, or a price that resets with interest rates). The seller usually keeps servicing and earns a fee for it; Affirm "generally does not sell servicing rights" and its servicing income rose 44% in fiscal 2026 on $9.1 billion of average principal held by third parties and off-balance-sheet securitizations. A **whole-loan sale** is the same transfer done one pool at a time; a **pass-through** program sells the loans into a trust that issues certificates, which Upstart describes as "sponsored by certain financial institutions" and issued "from an issuer trust."

What the agreement creates in the data:

- **Purchase criteria per buyer,** like warehouse eligibility, plus the buyer's appetite: a maximum monthly volume, a mix by risk grade and term, sometimes a minimum weighted average rate.
- **A price and a settlement schedule.** The buyer pays at settlement (daily, weekly or monthly), and the gain or loss on sale is the price less the loan's carrying amount ([Gain on Sale](/books/banking-and-lending/banking-business#gain-on-sale)).
- **Representations and warranties.** The seller promises each loan met the criteria and the law when sold; a loan that didn't must be repurchased at the agreed price, usually par plus accrued interest. A repurchase is a reverse transfer with its own price and reason.
- **Loss-sharing or performance fees.** Some agreements make the seller pay buyers when losses exceed expectations, as Affirm's do up to a cap, or share upside and downside, as Upstart's committed capital does. The seller carries a contingent liability that must be measured from the sold loans' performance, so their servicing data stays as complete as for loans it owns.
- **A repricing clause.** Affirm says some loan sale agreements "reprice periodically based on interest rates," so the price a loan sells for depends on the date it is allocated, not the date it was approved.

Bank partnerships are forward flow with a bank on the selling side. OppFi's 10-K describes partner banks that "use their own capital to originate loans" and "generally hold them for about two to three days," after which OppFi acquires participation rights; Upstart's partners keep some loans and sell the rest through its marketplace. How long the bank holds the loan, what it keeps and who carries the loss are the facts a true lender challenge examines ([Lender Licensing & Bank Partnerships](/books/banking-and-lending/lender-licensing#true-lender-exposure)).

## Participations

A participation splits a loan's economics without moving its legal title. The originating bank keeps the note and the borrower relationship; the participant buys an undivided percentage interest and receives that share of every payment and loss. Commercial banks sell participations in large loans to stay within lending limits ([Commercial Lending](/books/banking-and-lending/commercial-lending#participations-syndication-and-the-lending-limit) covers participations and syndication). Card and BNPL programs use the 100% case: BILL's issuing banks sell it "a 100% participation interest in the receivable," BILL "is obligated to purchase the participation interests in all of the receivables originated through our platform" at their outstanding principal, its obligation is "secured by cash deposits" at the banks, and it funds most purchases from corporate cash and some from revolving facilities "secured by our BILL Divvy Card receivables."

The participation is why one card purchase has two owners in the data: the issuing bank, whose account it is (the `accounts.institution_id`), and the program, which owns the economics (`loans.owner`). The bank's records must still show every account as its own for Regulation Z, BSA and examination purposes, while the program's records show the receivable it bought and the cash collateral it posted ([Reserves and Credit Enhancement](/books/banking-and-lending/banking-as-a-service#reserves-and-credit-enhancement) covers the collateral side, and [Who Owns the Receivable](/books/banking-and-lending/corporate-cards#who-owns-the-receivable) the corporate card case).

## Securitization

In a securitization the lender sells a pool of loans to a bankruptcy-remote special purpose entity, which issues notes in tranches: senior notes paid first, mezzanine next, and a residual (subordinated certificates or equity) that absorbs losses first. Upstart describes selling pools "to a bankruptcy-remote special purpose entity" that issues "tranched notes and subordinated certificates"; Affirm's structures include "term, amortizing, revolving, and variable funding" deals, and its retained residual trust certificates "absorb credit losses first." Each month collections run through a **waterfall** (servicing fee, senior interest, senior principal, junior classes, reserve account top-up, then the residual), and performance triggers like a warehouse's can divert cash from the residual to the senior notes.

Three rules shape the records:

- **Risk retention.** The SEC's credit risk retention rule (17 CFR 246) requires the sponsor of a securitization to retain "an eligible vertical interest or eligible horizontal residual interest, or any combination thereof" of not less than 5 percent. A vertical interest is a slice of every class; a horizontal interest is the most junior piece, measured at fair value. Pagaya states it will hold one or the other as sponsor or through a majority-owned affiliate. The retained interest can't be sold or hedged for the period the rule sets, so the system must flag it as restricted and track it until release.
- **Disclosure for registered deals.** Regulation AB governs registered asset-backed securities. Item 1125 requires asset-level data for each asset when the pool holds residential mortgages, commercial mortgages, automobile loans or automobile leases, and Item 1121 requires each period's distribution report: collections and their sources, fees paid and to whom, delinquencies and losses, whether each performance trigger was met, advances, modifications, breaches of representations and assets repurchased, along with repurchase demands under Rule 15Ga-1. Consumer installment and card deals outside those asset classes still report most of the same data to investors under their deal documents.
- **True sale and servicing.** The trust owns the loans, and the lender usually services them for a fee under a servicing agreement with a backup servicer named. If the lender fails, the trust's loans must be separable from its own on the day it fails, which is a records requirement before it is a legal one.

## Allocation at Origination

When a loan is approved, something decides which capital takes it: the balance sheet, a warehouse, a forward flow buyer, a pass-through program or the next securitization. Upstart's 64/26/10 split and Affirm's channel mix are the outputs of that decision repeated millions of times. The decision is a rules engine with four inputs:

1. **Eligibility.** Each vehicle's criteria, evaluated on the loan's attributes as approved: product, term, rate, grade, amount, state, the originating bank, and anything the buyer excludes.
2. **Capacity.** What each vehicle can still take today: facility availability from the latest borrowing base, a forward flow buyer's remaining monthly commitment, a securitization's target pool size.
3. **Concentration.** Whether adding the loan pushes any limit over: a state cap in the warehouse, a grade mix in a buyer's agreement, a merchant concentration (Affirm's top five merchants were 44% of GMV, which every funder will cap).
4. **Priority.** The lender's preference among the eligible vehicles with room, usually by cost and by contract (a committed buyer that must receive its volume before an uncommitted one).

The allocation is a decision record like a credit decision: the loan, the vehicle, the rule version, the vehicles considered and why each was or wasn't eligible, and the time ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)). It changes later: a warehouse loan moves into a securitization, an ineligible loan is repurchased out of a sold pool, a forward flow buyer's commitment ends. Each move is a new allocation with a validity range, never an update, so the question "who funded this loan on March 31" has one answer from the records.

Allocation rules are also where a bank partnership's terms bite. Partner criteria decide which loans a bank will originate and keep, and loans a bank sells must go to buyers its agreement allows; [The Lending Business](/books/banking-and-lending/lending-business#how-to-build-it) stores those criteria on the pricing grid, and the allocation engine reads the same reference.

## Investor Reporting and Remittance

Every funder expects a monthly report and a cash remittance that agree with each other and with the servicer's ledger. A warehouse lender gets the borrowing base and the pool tape; a forward flow buyer gets a loan-level file of balances, payments, delinquency status and charge-offs, with collections less the servicing fee wired on a set date; a securitization trustee gets the servicer's report that drives the waterfall and the Item 1121 distribution report. The report is built from loan-level facts:

- **Collections by loan and type:** scheduled principal, prepayments, interest, fees, recoveries, each from the servicer's `payment_allocations` for the period.
- **Fees retained:** the servicing fee and any other fee the agreement lets the servicer keep, computed at the agreed rate on the agreed balance.
- **Status changes:** delinquency buckets, modifications, charge-offs, bankruptcies and repurchases, by loan.
- **Reconciliation:** beginning balance plus purchases less collections less charge-offs less repurchases equals ending balance, for the pool and for each loan, and the cash remitted equals the collections less fees.

A difference of one cent between the tape and the remittance is a break someone must explain, and investors audit the servicer against its own reports. The mechanics of matching two sets of books are in [Ledger & Reconciliation](/books/payments/ledger-and-reconciliation#a-matching-engine).

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model): `loans` (with `owner` and `servicer`), `programs`, `payment_allocations`, and `journal_entries` with `journal_lines`. [The Lending Business](/books/banking-and-lending/lending-business#how-to-build-it) added `loan_pricing` (with the partner criteria reference and the assumed cost of funds), `loan_economics_monthly` (whose `funding_cost` is allocated from the funding source's actual cost) and `measurement_basis` on `loans`. [Loan Servicing](/books/banking-and-lending/loan-servicing#how-to-build-it) keeps owner, servicer and subservicer as effective-dated roles in `loan_roles_history`, and servicer cutovers as `servicing_transfers` batches; this chapter adds the funders, their rules, which funder holds each loan, the priced transfers that move ownership, and what is reported to each funder.

```sql
CREATE TABLE funding_vehicles (            -- every source of capital a loan can sit in
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  kind                TEXT NOT NULL CHECK (kind IN ('balance_sheet', 'corporate_facility',
                        'warehouse', 'forward_flow', 'whole_loan_sale', 'pass_through',
                        'securitization', 'participation', 'agency')),
  name                TEXT NOT NULL,         -- 'Warehouse 3 (SPV LLC)', '2026-2 ABS trust'
  counterparty        TEXT NOT NULL,         -- the lender, buyer, trustee or bank
  borrower_entity     TEXT,                  -- the SPV that borrows or issues, if any
  agreement_ref       TEXT NOT NULL,         -- the facility, purchase or pooling agreement
  committed           BOOLEAN NOT NULL,      -- false: the funder may cut capacity at will
  commitment_amount   BIGINT,                -- facility size or purchase commitment, minor units
  advance_rate_bps    INT,                   -- warehouses: share of eligible balance lent
  consolidated        BOOLEAN NOT NULL,      -- finance's conclusion, recorded with its date
  servicer            TEXT NOT NULL,
  servicing_fee_bps   INT,
  status              TEXT NOT NULL CHECK (status IN ('revolving', 'amortizing',
                        'early_amortization', 'terminated', 'paid_off')),
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE funding_vehicle_rules (       -- eligibility, concentration and triggers, versioned
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  funding_vehicle_id  UUID NOT NULL REFERENCES funding_vehicles (id),
  version             INT NOT NULL,
  kind                TEXT NOT NULL CHECK (kind IN ('eligibility', 'concentration',
                        'performance_trigger', 'priority')),
  rule                JSONB NOT NULL,        -- {"max_dpd": 29}, {"state_share_max_bps": 1500}, ...
  source_clause       TEXT NOT NULL,         -- the agreement section it encodes
  valid_during        DATERANGE NOT NULL,
  UNIQUE (funding_vehicle_id, kind, version)
);

CREATE TABLE loan_funding_allocations (    -- which vehicle holds each loan, over time
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES loans (account_id),
  funding_vehicle_id  UUID NOT NULL REFERENCES funding_vehicles (id),
  share_bps           INT NOT NULL DEFAULT 10000 CHECK (share_bps BETWEEN 1 AND 10000),
  rule_versions       JSONB NOT NULL,        -- the rule versions evaluated, by vehicle
  candidates          JSONB NOT NULL,        -- vehicles considered and why each passed or failed
  reason              TEXT NOT NULL CHECK (reason IN ('origination', 'sale', 'securitization',
                        'repurchase', 'ineligible_removal', 'vehicle_terminated', 'payoff')),
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING gist (account_id WITH =, funding_vehicle_id WITH =, valid_during WITH &&)
);

CREATE TABLE loan_transfers (              -- the priced event behind every change of owner
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES loans (account_id),
  kind                TEXT NOT NULL CHECK (kind IN ('sale', 'participation_sale', 'pledge',
                        'release', 'repurchase', 'substitution')),
  from_party          TEXT NOT NULL,         -- the originating bank, the program, a trust
  to_party            TEXT NOT NULL,
  share_bps           INT NOT NULL DEFAULT 10000,
  principal           BIGINT NOT NULL,       -- unpaid principal transferred
  accrued_interest    BIGINT NOT NULL DEFAULT 0,
  price               BIGINT,                -- cash paid; null for a pledge or release
  servicing_retained  BOOLEAN NOT NULL,
  reason              TEXT,                  -- repurchases: the breached representation
  settlement_date     DATE NOT NULL,
  journal_entry_id    UUID REFERENCES journal_entries (id),
  idempotency_key     TEXT NOT NULL UNIQUE
);

CREATE TABLE borrowing_base_reports (      -- what a warehouse lent against, as reported
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  funding_vehicle_id  UUID NOT NULL REFERENCES funding_vehicles (id),
  as_of               DATE NOT NULL,
  pledged_principal   BIGINT NOT NULL,
  ineligible          JSONB NOT NULL,        -- amount by reason: {"dpd_30": ..., "state_cap": ...}
  eligible_principal  BIGINT NOT NULL,
  advance_rate_bps    INT NOT NULL,
  borrowing_base      BIGINT NOT NULL,
  drawn               BIGINT NOT NULL,
  triggers            JSONB NOT NULL,        -- each test, its value and whether it passed
  tape_ref            TEXT NOT NULL,         -- the loan-level file delivered
  delivered_at        TIMESTAMPTZ NOT NULL,
  UNIQUE (funding_vehicle_id, as_of)
);

CREATE TABLE investor_reports (            -- the monthly report and remittance per funder
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  funding_vehicle_id  UUID NOT NULL REFERENCES funding_vehicles (id),
  period              DATERANGE NOT NULL,
  beginning_principal BIGINT NOT NULL,
  principal_collected BIGINT NOT NULL,
  interest_collected  BIGINT NOT NULL,
  fees_collected      BIGINT NOT NULL,
  recoveries          BIGINT NOT NULL,
  charge_offs         BIGINT NOT NULL,
  transfers_in        BIGINT NOT NULL,       -- loans added in the period
  transfers_out       BIGINT NOT NULL,       -- repurchases, removals, payoffs to another vehicle
  ending_principal    BIGINT NOT NULL,
  servicing_fee       BIGINT NOT NULL,
  remitted            BIGINT NOT NULL,
  remittance_journal_entry_id UUID REFERENCES journal_entries (id),
  file_ref            TEXT NOT NULL,
  delivered_at        TIMESTAMPTZ,
  CHECK (beginning_principal - principal_collected - charge_offs + transfers_in
         - transfers_out = ending_principal),
  UNIQUE (funding_vehicle_id, period)
);
```

The borrowing base is a query over today's allocations and loan status, written to `borrowing_base_reports` when delivered; the eligibility and concentration rules supply the filters:

```sql
SELECT a.funding_vehicle_id,
       SUM(l.principal_outstanding)                                    AS pledged,
       SUM(l.principal_outstanding) FILTER (WHERE l.days_past_due >= 30) AS ineligible_dpd,
       SUM(l.principal_outstanding) FILTER (WHERE l.days_past_due < 30)  AS eligible_before_caps
FROM loan_funding_allocations a
JOIN loan_status_daily l ON l.account_id = a.account_id AND l.business_date = :as_of
WHERE a.funding_vehicle_id = :vehicle
  AND a.valid_during @> CAST(:as_of AS DATE)
GROUP BY a.funding_vehicle_id;
```

`loan_status_daily` stands for whatever daily projection the servicer keeps of principal outstanding and days past due (Loan Servicing builds it from the loan ledger); concentration excess is computed on the eligible set afterward, by state, grade and term, against the `concentration` rules.

Design notes:

- **Ownership is derived from transfers.** `loans.owner` is the current value for fast reads; the truth is the sequence of `loan_transfers`, and each sale, participation or repurchase closes one owner row in Loan Servicing's `loan_roles_history` and opens the next, whose `source_ref` cites the transfer. A sale with servicing released also opens a `servicing_transfers` batch there. A sale, a participation, a pledge and a repurchase are different events with different accounting, so `kind` is never inferred from a price.
- **Allocation is a decision with a version.** The engine evaluates every vehicle's rules as of the decision time, writes the candidates and the winner, and emits `loan.allocated`; reallocation closes the old range and opens a new one ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).
- **A pledge isn't a sale.** A warehouse pledge is a `loan_transfers` row of kind `pledge` to the SPV and an allocation to the warehouse, while `loans.owner` stays the lender; a sale moves the owner and posts a journal entry for the price, the carrying amount and the gain or loss.
- **Rules come from clauses.** Every `funding_vehicle_rules` row cites the agreement section it encodes, because when a funder disputes an eligibility call the conversation is about the clause, not the code ([Rules as Data](/docs/architecture/rules-as-data#the-shape-of-a-rule)).
- **Reports are reproducible.** `investor_reports` stores the delivered file and its totals; the job that builds it reads the period's `payment_allocations` and transfers, so rerunning it for a closed period must produce the same file, and a correction is a new report, not an edit ([Closed Periods Stay Closed](/docs/payments/accounting#closed-periods-stay-closed)).
- **Retained interests are positions.** A risk retention piece or a residual certificate is an asset with a holding restriction; track it with the vehicle and its release date rather than as a loan.
- **Funding cost flows to the loan.** Interest on a facility, allocated to the loans it funds by balance and days, is what fills `loan_economics_monthly.funding_cost`, so a loan's economics reflect the money that actually paid for it.

## Auditing

Funders, auditors, the originating bank and regulators each ask "who owns this loan and on what terms":

- **The chain of title for every loan:** each transfer with its parties, share, price, date, servicing election and journal entry, from origination to payoff or charge-off.
- **Why each loan went where it went:** the allocation decision with the rule versions and candidates, so a funder can verify that every loan it received met its criteria on the day it received it.
- **Every borrowing base and investor report as delivered,** with the tape, the trigger results and the remittance, reproducible from the ledger for that period.
- **Every repurchase** with the representation breached, who demanded it and when, and the price.
- **Retained risk:** each risk retention interest held, its form (vertical or horizontal) and its hold period.
- **Facility rules as agreed:** each rule version with the agreement section and amendment it came from.

The audit store design is in [Audit Trails](/docs/architecture/audit-trails#what-a-record-holds).

## What This Means for the System You Build

- **Treat each funder as a rulebook:** eligibility, concentration limits, triggers and priority, versioned and cited to the agreement.
- **Allocate every loan by recorded decision,** with the candidates and rule versions, and reallocate with new rows rather than edits.
- **Derive ownership from priced transfers,** keeping pledge, sale, participation and repurchase distinct.
- **Compute borrowing bases daily** from loan-level status, because delinquency withdraws funding before it shows up as loss.
- **Know which capacity is committed,** and alert on availability and trigger headroom, not just on balances.
- **Build investor reports from the servicer's allocations** and prove beginning plus activity equals ending, per loan and per pool.
- **Keep sold loans' data as complete as owned loans',** because loss-sharing, repurchases and reports keep the seller exposed after the sale.

## References

**Law and regulation**

- [Cornell LII: 17 CFR 246.4, standard risk retention](https://www.law.cornell.edu/cfr/text/17/246.4), the sponsor's eligible vertical or horizontal residual interest of not less than 5 percent
- [Cornell LII: 17 CFR 229.1125, Regulation AB Item 1125 (Schedule AL)](https://www.law.cornell.edu/cfr/text/17/229.1125), asset-level data for residential and commercial mortgages and automobile loans and leases
- [Cornell LII: 17 CFR 229.1121, Regulation AB Item 1121](https://www.law.cornell.edu/cfr/text/17/229.1121), distribution and pool performance information: collections, fees, delinquencies and losses, triggers, advances, breaches, repurchases and Rule 15Ga-1 demands

**Filings**

- [Affirm Holdings: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/0001820953/000162828026059279/afrm-20260630.htm), the four funding channels, committed and uncommitted facilities, one-to-three-year terms, $14.0 billion of capacity and $8.7 billion outstanding, US warehouses of $6.1 billion with $2.4 billion drawn, $5.3 billion available, $21.9 billion of loans sold, equity capital at 4% of the platform portfolio, capped loss-sharing, ineligible loan repurchases, default-rate covenants, repricing loan sales, retained residual certificates, servicing income and third-party balances
- [BILL Holdings: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/0001786352/000162828026058238/bill-20260630.htm), the issuing banks, the 100% participation interest and purchase obligation secured by cash deposits, $600.0 million of facility capacity with $330.0 million drawn, receivables as collateral and the limited guarantee
- [Enova International: Third quarter 2026 results (Form 8-K exhibit 99.1, October 22, 2026)](https://www.sec.gov/Archives/edgar/data/1529864/000119312526428941/enva-ex99_1.htm), long-term debt and liquidity at September 30, 2026
- [Happen (formerly LendingClub): Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1409970/000140997026000018/lc-20251231.htm), marketplace sales and the Structured Program, about $8 billion sold, senior securities retained
- [OppFi: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1818502/000181850226000019/opfi-20251231.htm), partner banks originating with their own capital, holding loans two to three days before OppFi acquires participation rights
- [Pagaya Technologies: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1883085/000188308526000018/pgy-20251231.htm), partners originating, special purpose entities buying pools, securitizations and forward flow, retained interests over 40% of assets and the vertical or horizontal retention election
- [Upstart: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1647639/000164763926000027/upst-20251231.htm), the 64/26/10 funding split, committed capital and shared performance, whole loans, pass-through certificates and securitizations through bankruptcy-remote entities, servicing for partners and investors
