+++
title = "Sweeps, Reciprocal Deposits & Yield"
nav_title = "Sweeps & Yield"
description = "Insuring millions past the $250K limit: deposit sweeps, IntraFi ICS and CDARS, the 2026 reciprocal deposit rule, money market funds and T-bill treasury."
category = "Banking & Lending Industry"
order = 2460
part = "Business Banking"
tags = ["banking", "business-banking", "sweeps", "reciprocal-deposits", "deposit-insurance", "money-market-funds"]
+++

A company's deposits at one bank are insured to $250,000 in total, and a startup that just raised $20 million has eighty times that in its operating account. Before March 2023 most of them left it there. At the end of 2022 about 94% of Silicon Valley Bank's deposits were uninsured, and when its depositors, a "concentrated network of VC investors and technology firms", withdrew "in a coordinated manner", the bank lost over $40 billion in a day and expected to lose over $100 billion more the next ([When Banks Fail](/books/banking-and-lending/bank-failures#anatomy-of-a-run)). Every business banking product since has answered the same question on its pricing page: how much of the customer's money is insured, and where.

Three different products hide behind the answer. A **deposit sweep** spreads one customer's balance across many insured banks, no more than $250,000 at each, so that the customer's coverage is the limit times the number of banks; the money stays deposits. A **reciprocal deposit network** does the same for a bank's own customers, and swaps matching amounts back so the relationship bank keeps the funding. A **money market fund sweep or Treasury bill product**, usually through an affiliated investment adviser, moves cash out of banks altogether into government securities, which aren't insured but don't need to be. This chapter covers all three, the 2026 change to how reciprocal deposits are treated, the ledger a sweep needs, and a worked calculation of what a sweep actually insures on a given night. The insurance rules themselves are in [Deposit Insurance](/books/banking-and-lending/deposit-insurance); pass-through coverage from a payment provider's side is in [Treasury & Bank Operations](/books/payments/treasury#fbo-accounts-and-pass-through-insurance).

## How the Platforms Do It

Public claims and terms, as of October 2026:

| Platform | Insured sweep | Off-bank yield product |
| --- | --- | --- |
| **Bluevine** | "$3,000,000 in FDIC insurance is offered by multiplying the standard $250,000 FDIC coverage across multiple banks", through Coastal Community Bank's program banks | Treasury services, which are not deposits of Coastal Community Bank |
| **Brex** (Capital One) | Not first-hand; press reports about $13 billion of customer deposits "at partner banks and money market funds" | Money market funds, per the same report |
| **Mercury** | "Up to $5M in FDIC insurance" through Choice Financial Group, Column N.A. and their sweep networks; Column's published sweep agreement names IntraFi's ICS | Mercury Treasury, from Mercury Advisory, LLC, "an SEC-registered investment adviser", in the JPMorgan U.S. Treasury Plus Money Market Fund; "up to 4.09%" with a $250,000 Mercury balance (company figure); same-day transfers by 3pm ET; two automatic transfers a month |
| **Novo** | "insured up to $5,000,000 per depositor" through Middlesex Federal Savings and its sweep network | Not offered on the page |
| **Relay** | Up to $3,000,000 "when Thread Bank places them at program banks", $250,000 per program bank "inclusive of any other deposits you may already hold" | Not offered on the page |
| **Rho** | Savings "Up to $75M in FDIC insurance" through American Deposit Management Co. and its partner banks | Rho Treasury, from RBB Treasury LLC, with custody through Apex Clearing; an annual fee from 0.15% (for $20 million or more) to 0.6%; yield quoted from 90-day Treasury bill rates |
| **U.S. Bank** (commercial) | A multibank deposit option "up to $2.5 million" | Money market fund sweeps, prime or government, which are "securities and thus not covered by FDIC insurance" |

Three things stand out. **The coverage is arithmetic.** $3 million is twelve banks at $250,000, $5 million is twenty, $75 million is three hundred; there is no larger limit, only more banks, and the claim is only as good as the placements on a given night. **The fine print moves risk to the customer.** Relay's "inclusive of any other deposits" and Column's requirement that customers exclude banks where they already hold money both mean that a deposit the customer has elsewhere can quietly cancel coverage the sweep thinks it bought. **Fintechs and banks run the same structures.** U.S. Bank's multibank deposit and a fintech's sweep are the same product; the fintech has a sponsor bank in the middle doing the placing.

## The Limit Being Multiplied

The rule a sweep works around is "$250,000 per depositor, per insured bank, for each account ownership category" ([The Ownership Categories](/books/banking-and-lending/deposit-insurance#the-ownership-categories)). For a company, three words in it do the work:

- **Per depositor.** A corporation, partnership or unincorporated association engaged in an independent activity gets $250,000, not $250,000 per owner. A startup with five founders and twenty investors is one depositor.
- **Per bank.** All of a company's accounts at one bank are added together, its sub-accounts, its CDs and anything a sweep placed there, under every brand that bank operates. This is why a sweep needs to know about the customer's other deposits at each program bank, and why the programs ask customers to exclude the banks where they have them.
- **The amount of a deposit includes accrued interest** to the day of failure (12 CFR 330.3(i)), so a placement of exactly $250,000 earning interest is over the limit by its accrued interest. Column's agreement says placements "will generally not exceed $250,000"; some programs place a little less to leave room.

Pass-through coverage is what lets a custodian's account at a program bank count as the customers' own deposits: the account is titled as custodial and each customer's interest is in records the FDIC can rely on ([Pass-Through Coverage](/books/banking-and-lending/deposit-insurance#pass-through-coverage)). A sweep is pass-through twice over: the customer's money is held by the program manager's sponsor bank as agent and custodian, and placed by it into custodial accounts at each program bank.

## How a Deposit Sweep Works

Column's Sweep Program Deposit Placement and Custodial Agreement, which Mercury publishes, is a complete public specification of one sweep, and it lines up with IntraFi's description of its own network:

- **The sponsor bank is the customer's agent and custodian.** "We will act as your agent in placing deposits for you through the Column Sweep Program", and as custodian for the deposit accounts at program banks (section 2.1). Those accounts are recorded in Column's name as custodian, or a sub-custodian's, so that each customer's share is insured as if in its own name.
- **Placements stay under the limit at each bank,** generally not over $250,000 (section 1.1(4)), at banks on a published list that changes: Column's list of program banks, a long alphabetical list with FDIC certificate numbers, was last revised December 17, 2024 and says "program banks may be added or removed".
- **Movement settles the next business day.** A deposit that triggers a placement results in a transfer to the program banks "the next Business Day", and a withdrawal is funded from them at settlement the next business day (sections 4.3 and 4.4); same-day movement may be offered with cutoffs. To cover a withdrawal before the money comes back, Column may advance funds and take a security interest in the placed deposits (section 4.5).
- **Exclusions are the customer's job.** The customer must monitor its total balance at each bank and should exclude any program bank where it holds other deposits in the same capacity; exclusions take effect within three business days of receipt (sections 6.2, 7.1 and 7.2).
- **The rate is the sponsor's to set,** "the then-current rate that we specify, which may be any rate (including zero)", and the sponsor may keep part of the interest as a fee (section 3.2).
- **The sponsor's records are the customer's only evidence.** Column's account information and statements are "the only evidence that you receive" of ownership of the placed funds (section 4.1(4)), which is the program-ledger problem at a second level: if those records are wrong, so is the coverage.
- **Reciprocal or one-way is the sponsor's choice.** Column may "choose whether to receive a Reciprocal Deposit or use One-Way Deposits" (section 5.1), through IntraFi's ICS, with The Bank of New York Mellon supporting placement.

IntraFi describes the same mechanism from the network's side: a large deposit "is divided into amounts under the standard FDIC insurance maximum of $250,000" and "placed in deposit accounts at banks that participate in the network", in demand and money market deposit accounts with daily liquidity (ICS) or CDs from 4 weeks to 3 years (CDARS); the depositor "may exclude banks"; and accounts must be "titled, and deposit account records are maintained, in accordance with FDIC regulations for pass-through coverage."

### The Settlement Window

IntraFi's disclosure names the gap every sweep has: "a depositor's balances at the institution that places deposits may exceed the SMDIA before settlement for deposits or after settlement for withdrawals". Money that arrived today sits at the sponsor bank until tomorrow's placement, uninsured above $250,000; money withdrawn today is paid from the sponsor bank before the program banks return it. So "how much of my money is insured" has an answer only for a specific moment, and the honest product shows it per business date: placed and insured, at the sponsor and insured, at the sponsor and over the limit pending settlement. [The worked example](#worked-numbers-a-4-million-sweep) puts numbers on it.

## Reciprocal Deposits and the Brokered Deposit Rule

A bank that places a customer's deposits at other banks loses the funding. Reciprocal networks fix that: the placing bank (the "agent institution") receives deposits from other network banks "with the same maturity (if any)" and "in the same aggregate amount as covered deposits placed by the agent institution in other network member banks", so its balance sheet is unchanged and its customer is insured. A one-way placement sends the deposits out without taking any back, which serves the customer and not the bank's funding.

The regulatory question is whether those received deposits are **brokered**. Section 29 of the Federal Deposit Insurance Act restricts a bank from accepting deposits through a deposit broker "unless the institution is well capitalized"; the FDIC may waive it for an adequately capitalized bank, but "the restriction cannot be waived if the institution is undercapitalized". Since 2018 a limited amount of reciprocal deposits has been excepted from the definition: until 2026, "the lesser of $5 billion or 20 percent of the total liabilities of the agent institution".

**The 2026 change.** Section 902 of the 21st Century ROAD to Housing Act, effective July 11, 2026, rewrote the exception in section 29(i), and the FDIC conformed its rule (12 CFR 337.6(e)) by interim final rule, as of October 30, 2026:

| | Before July 11, 2026 | After |
| --- | --- | --- |
| **General cap on excepted reciprocal deposits** | Lesser of $5 billion or 20% of total liabilities | 50% of the first $1 billion of liabilities, 40% of liabilities between $1 billion and $10 billion, 30% above $10 billion, at most $30 billion |
| **Which banks qualify for the general cap** | Well capitalized, with an outstanding or good composite rating | Well capitalized, with a CAMELS composite of 1, 2 or 3 |
| **Banks that don't qualify** | A special cap, set by a four-quarter average of the bank's past reciprocal deposits | The special cap, unchanged in substance |
| **Over the cap** | Excess is brokered | A bank whose reciprocal deposits exceed its special cap is no longer an agent institution, and "all of its reciprocal deposits must be reported as brokered deposits" |

- **Citation and status:** *Reciprocal Deposits: Implementing the 21st Century ROAD to Housing Act*, 91 FR 56022 (September 1, 2026), FR Doc. 2026-17865, RIN 3064-AG32. An interim final rule, effective September 1, 2026; comments closed October 1, 2026. Secondary summaries give different effective dates; the Federal Register document says September 1. As of October 30, 2026 the Federal Register shows no final rule following it.
- **Scale:** at March 31, 2026, the rule's own data show 2,089 institutions reporting $462.8 billion of reciprocal deposits, against $1.204 trillion of brokered deposits at 1,971 institutions; 331 institutions reported $91.9 billion of reciprocal deposits that counted as brokered.
- **Call reports:** no new line items; the FFIEC expects to update the instructions, and the FDIC intends to make the reciprocal deposit line in Schedule RC-O confidential.

Whether a fintech's own sweep makes its program banks' deposits brokered is a separate question, decided by the deposit broker definition and its exceptions as the FDIC's 2021 rule wrote them. The FDIC proposed tightening that definition in August 2024 and withdrew the proposal in March 2025, saying any future action would need a new proposal. For a builder the practical effect is that a sweep's program bank list depends on each bank's appetite for the deposits and their classification, which is another reason the list changes.

## Worked Numbers: A $4 Million Sweep

A startup holds $4,000,000 with a program manager whose sponsor bank keeps the first $250,000 and sweeps the rest to program banks in $250,000 placements, settling the next business day. The company also has a $180,000 account of its own at Bank G, which happens to be on the program list.

**Monday, as designed.** Sponsor bank $250,000; fifteen program banks at $250,000 each, $3,750,000. Insured: **$4,000,000**, all of it.

**Monday, as it actually is.** Nobody excluded Bank G, and the sweep placed $250,000 there. At Bank G the company is one depositor with $430,000: insured $250,000, **uninsured $180,000**. The fix is the exclusion, after which the placement moves to a sixteenth bank within the program's three business days.

**Tuesday afternoon, a $1,500,000 wire arrives.** It posts at the sponsor bank, and the sweep will place it Wednesday. Tuesday night:

| Bank | Company's deposits | Insured | Uninsured |
| --- | --- | --- | --- |
| Sponsor bank | $250,000 + $1,500,000 | $250,000 | $1,500,000 |
| Bank G (not yet excluded) | $250,000 placed + $180,000 own | $250,000 | $180,000 |
| Fourteen other program banks | $3,500,000 | $3,500,000 | $0 |
| **Total** | **$5,680,000** | **$4,000,000** | **$1,680,000** |

If the sponsor bank failed that night, $1,500,000 would be an uninsured claim on its receivership until the FDIC's determination. Wednesday the sweep places six more $250,000 placements and the company is insured again apart from Bank G until its exclusion takes effect, provided the network has six more banks with capacity that the company hasn't excluded.

**Thursday, payroll of $600,000.** The sponsor bank pays it Thursday from its own funds (advancing against the placements, under a security interest in them) and recalls $600,000 from program banks for Friday. Coverage doesn't fall during the advance; the sponsor's exposure rises, which is the sponsor's problem and the reason it takes the security interest.

**Accrued interest.** If the program banks pay interest and placements sit at exactly $250,000, each placement creeps over the limit by its accrued interest until the next rebalance. At 3% a year, a month's accrual on a $250,000 placement is $625 per bank, across the twenty-one program banks now holding the company's money, a small exposure that a placement target slightly under $250,000 removes.

The lesson is the one [Worked Numbers: One Family at One Bank](/books/banking-and-lending/deposit-insurance#worked-numbers-one-family-at-one-bank) teaches for consumers: coverage is computed per depositor, per bank, per category, on a date, from records. A sweep makes the number larger and the computation more frequent, not optional.

## Money Market Funds and Treasury Products

The alternative to insuring cash is not holding it at banks. A money market fund sweep or a Treasury bill account moves the balance into securities: insurance doesn't apply, and the credit risk is the U.S. government's (for a government fund or T-bills) instead of a bank's. SVB itself offered both sides; its "off-balance sheet client investment funds", including sweep money market accounts, were "maintained at third-party financial institutions", and the Federal Reserve's review of the failure counts them separately from deposits.

Business platforms do it through an affiliate registered as an investment adviser: Mercury Advisory, LLC buying a JPMorgan Treasury money market fund, RBB Treasury LLC (Rho Treasury) buying Treasury bills held at Apex Clearing, Bluevine's treasury services that are explicitly not deposits. The structure changes almost everything a deposit sweep's system knows:

- **It's a security, not a deposit.** A money market fund is not a money market deposit account ([The Four Shapes](/books/banking-and-lending/deposit-accounts#the-four-shapes)), and 12 CFR 328.102 requires a platform showing both close together to say the investment isn't insured, isn't a deposit and may lose value.
- **Liquidity has rules of its own.** The SEC's July 12, 2023 amendments removed money market funds' ability to suspend redemptions (gates) and required institutional prime and institutional tax-exempt funds to impose liquidity fees when daily net redemptions exceed 5% of net assets, with discretionary fees available to any non-government fund. Government funds, the kind these products buy, fall in neither group. A product built on a prime fund would need to show fees that a government fund product doesn't.
- **It moves on the fund's and the adviser's clock.** Mercury Treasury's same-day withdrawals need the transfer by 3pm ET, and automatic transfers are limited to two a month; a T-bill product's liquidity depends on selling or holding to maturity. Moving cash from an investment back to the operating account before payroll is a scheduled job with a cutoff, not a balance query.
- **The fee is explicit.** Rho Treasury's 0.15% to 0.6% annual fee is charged by the adviser on the investment, unlike a deposit sweep's spread, which the sponsor bank keeps by setting the rate.

## Why SVB Is the Reason

The products in this chapter existed before 2023; demand for them didn't. SVB served "nearly half [of] U.S. venture-backed technology and life sciences companies", and its run, over $40 billion out on March 9 and over $100 billion more expected on March 10, roughly 85% of its deposit base, dwarfed the comparisons the Federal Reserve drew: about $10 billion over 8 days at Wachovia and $19 billion over 16 days at Washington Mutual in 2008. The FDIC and the other agencies protected all of SVB's depositors under the systemic risk exception ([The Least-Cost Test and the Systemic Risk Exception](/books/banking-and-lending/bank-failures#the-least-cost-test-and-the-systemic-risk-exception)), but no company can plan on that, and the $250,000 limit hasn't changed ([Reform Options](/books/banking-and-lending/bank-failures#reform-options)). First-Citizens Bank & Trust, which assumed SVB's deposits, announced in April 2026 that the brand becomes First Citizens Innovation Banking and First Citizens Fund Banking in the fourth quarter of 2026: "Only the names will change."

What changed is the default. A startup's treasury policy now usually names a maximum per bank, a share in government money market funds or T-bills, and a sweep for operating cash, and the business banking platforms compete on how much of that they do automatically. For the system behind them, that turns insurance from a marketing number into a nightly calculation per customer.

## How to Build It

These are deltas against `accounts`, `balance_snapshots` and `institutions` in [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). At each program bank, the sponsor's custodial account is an `accounts` row at that institution with `custodial = true`, reconciled every night against a per-owner file exactly as [Program Ledgers & the Synapse Lesson](/books/banking-and-lending/program-ledgers#how-to-build-it) describes; the customer's coverage is computed by [Deposit Insurance](/books/banking-and-lending/deposit-insurance#how-to-build-it)'s determination over those lines. A company's own view of its money across banks is `bank_exposures` from [When Banks Fail](/books/banking-and-lending/bank-failures#how-to-build-it). What a sweep adds is the program, its banks, each customer's exclusions, every placement by business date, and the movements between them.

```sql
CREATE TABLE sweep_programs (              -- one sponsor's placement program
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  sponsor_institution_id UUID NOT NULL REFERENCES institutions (id),
  network             TEXT,                  -- 'intrafi_ics', 'intrafi_cdars', a sponsor's own network
  agreement_ref       TEXT NOT NULL,         -- the deposit placement and custodial agreement, by version
  sponsor_retains     BIGINT NOT NULL,       -- kept at the sponsor before sweeping, minor units
  placement_target    BIGINT NOT NULL CHECK (placement_target <= 25000000),  -- at or under $250,000
  settlement_lag_days SMALLINT NOT NULL DEFAULT 1,
  mode                TEXT NOT NULL CHECK (mode IN ('reciprocal', 'one_way', 'either')),
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE sweep_program_banks (         -- the published list, effective-dated
  sweep_program_id    UUID NOT NULL REFERENCES sweep_programs (id),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  custodial_account_id UUID NOT NULL REFERENCES accounts (id),  -- the sponsor's custodial account there
  capacity            BIGINT,                -- what the bank will take in aggregate, if limited
  valid_during        DATERANGE NOT NULL,
  PRIMARY KEY (sweep_program_id, institution_id, valid_during)
);

CREATE TABLE sweep_exclusions (            -- banks a customer won't have its money placed at
  account_id          UUID NOT NULL REFERENCES accounts (id),  -- the swept account
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  reason              TEXT NOT NULL CHECK (reason IN ('existing_deposits', 'customer_choice',
                        'program_rule')),
  requested_at        TIMESTAMPTZ NOT NULL,
  effective_on        DATE NOT NULL,         -- within the agreement's processing time
  ended_on            DATE,
  PRIMARY KEY (account_id, institution_id, requested_at)
);

CREATE TABLE sweep_placements (            -- the customer's interest at each bank, per business date
  account_id          UUID NOT NULL REFERENCES accounts (id),
  business_date       DATE NOT NULL,
  institution_id      UUID NOT NULL REFERENCES institutions (id),  -- the sponsor itself for the retained part
  principal           BIGINT NOT NULL CHECK (principal >= 0),
  accrued_interest    BIGINT NOT NULL DEFAULT 0,
  placed_as           TEXT NOT NULL CHECK (placed_as IN ('retained', 'reciprocal', 'one_way')),
  PRIMARY KEY (account_id, business_date, institution_id)
);

CREATE TABLE sweep_movements (             -- each instruction to place or recall
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  direction           TEXT NOT NULL CHECK (direction IN ('place', 'recall')),
  amount              BIGINT NOT NULL CHECK (amount > 0),
  instructed_on       DATE NOT NULL,
  settles_on          DATE NOT NULL,
  journal_entry_id    UUID REFERENCES journal_entries (id),  -- posted at settlement
  idempotency_key     TEXT NOT NULL UNIQUE,  -- e.g. 'sweep:<account>:<date>:<bank>:place'
  status              TEXT NOT NULL CHECK (status IN ('instructed', 'settled', 'failed', 'cancelled'))
);

CREATE TABLE investment_sweeps (           -- off-bank yield: a fund or T-bill account behind the deposit
  account_id          UUID NOT NULL REFERENCES accounts (id),  -- the operating account it sweeps from
  adviser             TEXT NOT NULL,         -- the registered adviser offering it
  custodian           TEXT NOT NULL,
  instrument          TEXT NOT NULL,         -- fund ticker or 't_bills'
  fund_type           TEXT CHECK (fund_type IN ('government', 'prime', 'tax_exempt')),
  same_day_cutoff     TIME,                  -- in the custodian's time zone
  auto_transfers_per_month SMALLINT,
  disclosure_id       UUID NOT NULL REFERENCES disclosures (id),  -- not a deposit, not insured
  valid_during        DATERANGE NOT NULL,
  PRIMARY KEY (account_id, valid_during)
);
```

The nightly exposure check flags any placement over the limit and any placement at a bank the customer has excluded on that date. `:smdia` is 25,000,000 minor units:

```sql
SELECT p.account_id, p.institution_id, p.placed_as,
       p.principal + p.accrued_interest                       AS at_bank,
       GREATEST(p.principal + p.accrued_interest - :smdia, 0) AS over_limit,
       (x.account_id IS NOT NULL)                             AS at_excluded_bank
FROM sweep_placements p
LEFT JOIN sweep_exclusions x
  ON x.account_id = p.account_id AND x.institution_id = p.institution_id
 AND x.effective_on <= p.business_date
 AND (x.ended_on IS NULL OR x.ended_on > p.business_date)
WHERE p.business_date = :day
  AND (p.principal + p.accrued_interest > :smdia OR x.account_id IS NOT NULL);
```

How it runs:

1. **End of day, compute each swept account's target placements** from its ledger balance, the program's retained amount and placement target, the banks valid that day with capacity, and the account's exclusions; diff against today's placements to produce `sweep_movements`, each with an idempotency key from account, date, bank and direction.
2. **Send the instructions to the network or the program banks** and post each movement's journal entry at settlement, never at instruction: until a placement settles, the money is at the sponsor, and the placements table says so.
3. **Write `sweep_placements` for every business date,** including the sponsor's retained share and anything over the limit there, so any night's coverage can be reproduced.
4. **Run the exposure check** and the insurance determination from the same rows; an over-limit placement at a program bank is a break, and an over-limit balance at the sponsor is the settlement window, reported to the customer as pending rather than insured.
5. **Reconcile each program bank's custodial account** against the sum of placements there, nightly, per [Daily Reconciliation](/books/banking-and-lending/program-ledgers#daily-reconciliation).
6. **When a program bank leaves the list,** recall its placements before its `valid_during` ends and re-place them; a bank that fails while holding placements is a [receivership weekend](/books/banking-and-lending/bank-failures#the-receivership-weekend-in-systems) in which these rows are what the FDIC's determination is built from.

Design notes:

- **Placements are facts per business date,** never a current-state table overwritten each night. "Was the company insured on the night of March 9" is the only question that matters after a failure.
- **The customer's other deposits are an input.** A swept account can't see the customer's own account at a program bank; exclusions are how the customer tells the system, and onboarding should ask for them at the start.
- **Reciprocal is a property of the placement, brokered of the receiving bank.** Recording `placed_as` lets the sponsor report reciprocal deposits received and placed against its cap, which the 2026 rule makes larger but no less real.
- **Investment sweeps never mix with deposit placements.** The fund position is not a deposit and is not in any insurance determination; it is a separate account at a custodian with its own statements, reconciled to the adviser's records ([Reconcile to the Source](/docs/architecture/data-pipelines#reconcile-to-the-source)).

## Auditing

Sweeps are examined by the sponsor bank's regulators (custodial records, reciprocal deposit reporting, deposit insurance signage and nonbank disclosures) and, in a failure, by the FDIC. Keep:

- **Every placement by business date,** with the movement and journal entry behind it, for the life of the account and the retention period after.
- **The program bank list as it was on each date,** and every exclusion with when it was requested and when it took effect.
- **Each program bank's custodial account reconciliation,** with every break and its cure.
- **Reciprocal deposit positions against the cap** each quarter, with the rule version (pre- or post-July 11, 2026) and the bank's qualification status.
- **Every insurance and yield statement shown to customers,** with the coverage figure, the bank list and the investment disclosures, by version ([12 CFR 328.102](https://www.law.cornell.edu/cfr/text/12/328.102)).

## What This Means for the System You Build

- **"Up to $5M insured" is a nightly computation,** per customer, per bank, from placements and exclusions; show customers what was insured last night, not what the plan promises.
- **Record placements per business date** and post movements at settlement, so the settlement window is visible instead of hidden.
- **Ask for the customer's other banks at onboarding** and turn them into exclusions with effective dates.
- **Keep accrued interest inside the limit** by placing slightly under $250,000 or rebalancing on accrual.
- **Effective-date the program bank list** and treat a bank leaving it as a recall job with a deadline.
- **Keep deposits and investments in separate ledgers,** with separate disclosures, cutoffs and statements.
- **Track reciprocal deposits against the 2026 caps** if you are the bank, and track the rule's status: it is interim, as of October 2026.

## References

**Law and regulation**

- [Federal Register: Reciprocal Deposits: Implementing the 21st Century ROAD to Housing Act (FDIC interim final rule, 91 FR 56022, September 1, 2026)](https://www.federalregister.gov/documents/2026/09/01/2026-17865/reciprocal-deposits-implementing-the-21st-century-road-to-housing-act), section 902, the July 11, 2026 statutory date, the tiered cap and $30 billion maximum, CAMELS 1 to 3, the special cap, definitions, call report treatment and the March 31, 2026 industry figures
- [Federal Register API: FR Doc. 2026-17865](https://www.federalregister.gov/api/v1/documents/2026-17865.json), effective September 1, 2026, comments due October 1, 2026, RIN 3064-AG32
- [Federal Register: FDIC documents on reciprocal deposits](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=reciprocal+deposits&conditions[agencies][]=federal-deposit-insurance-corporation&order=newest), checked October 30, 2026: no final rule after the interim final rule
- [Federal Register: Brokered Deposits and Interest Rate Restrictions (FDIC final rule, January 22, 2021)](https://www.federalregister.gov/documents/2021/01/22/2020-28196/unsafe-and-unsound-banking-practices-brokered-deposits-and-interest-rate-restrictions), the current deposit broker definition and its exceptions
- [Federal Register: Brokered Deposits Restrictions (FDIC proposed rule, August 23, 2024)](https://www.federalregister.gov/documents/2024/08/23/2024-18214/unsafe-and-unsound-banking-practices-brokered-deposits-restrictions), the proposal to revise the definition
- [Federal Register API: FDIC withdrawal of three proposals (March 14, 2025)](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=brokered+deposits+withdrawal&conditions[agencies][]=federal-deposit-insurance-corporation&order=newest&per_page=10), FR Doc. 2025-04088 withdrawing the brokered deposits proposal
- [12 CFR 328.102: Misrepresentation of insured status](https://www.law.cornell.edu/cfr/text/12/328.102), differentiating deposit and non-deposit products shown together
- [SEC: Money Market Fund Reforms (press release 2023-129, July 12, 2023)](https://www.sec.gov/newsroom/press-releases/2023-129), removal of gates, mandatory liquidity fees for institutional prime and tax-exempt funds above 5% daily net redemptions, discretionary fees for non-government funds

**Regulators and guidance**

- [Federal Reserve: Review of the Federal Reserve's Supervision and Regulation of Silicon Valley Bank (April 2023)](https://www.federalreserve.gov/publications/files/svb-review-20230428.pdf), 94% uninsured deposits, $40 billion on March 9 and $100 billion expected, 85% of deposits, nearly half of venture-backed companies, off-balance sheet client funds, the Wachovia and WaMu comparisons
- [FDIC: Deposits at a Glance](https://www.fdic.gov/resources/deposit-insurance/brochures/deposits-at-a-glance), $250,000 per depositor, per bank, per ownership category, and the corporation category

**Vendor documentation**

- [Column N.A.: Sweep Program Deposit Placement and Custodial Agreements (published by Mercury)](https://mercury.com/legal/column/sweep-program-deposit-placement-and-custodial-agreements), agent and custodian roles, placements generally not over $250,000, next-business-day settlement, advances and security interest, exclusions, rates, records as the only evidence, reciprocal or one-way, IntraFi ICS and BNY
- [Column N.A.: Sweep Program Network Banks](https://column.com/legal/sweep-program-network-banks/), the program bank list with FDIC certificate numbers, last revised December 17, 2024
- [IntraFi: ICS and CDARS](https://www.intrafi.com/ics-cdars), splitting deposits under $250,000, reciprocal exchange, account types and CD terms, exclusions, the settlement caveat and pass-through titling
- [Mercury: Pricing](https://mercury.com/pricing), up to $5M insurance, Mercury Treasury's adviser, fund, yield claim, 3pm ET cutoff and two automatic transfers a month
- [Rho: Pricing](https://www.rho.co/pricing), $75M savings coverage through American Deposit Management Co., Rho Treasury's adviser, custodian, fee range and T-bill yield basis
- [Relay: Pricing](https://www.relayfi.com/pricing), up to $3,000,000 through Thread Bank's program banks, inclusive of other deposits
- [Bluevine: Business checking](https://www.bluevine.com/business-checking), $3,000,000 by multiplying the limit across banks; treasury services not deposits
- [Novo](https://www.novo.co/), up to $5,000,000 through Middlesex Federal Savings and its sweep network
- [U.S. Bank: Protecting cash balances with sweep vehicles](https://www.usbank.com/corporate-and-commercial-banking/insights/credit-finance/liquidity/cash-balances-sweep-vehicles.html), money market funds as uninsured securities, prime and government funds, multibank deposits up to $2.5 million

**In practice**

- [Banking Dive: Capital One to acquire Brex (January 23, 2026)](https://www.bankingdive.com/news/capital-one-acquire-brex-5-billion-fintech/810335/), about $13 billion of customer deposits at partner banks and money market funds, as reported by The Wall Street Journal
- [First Citizens: brand alignment in Q4 2026 (April 23, 2026)](https://newsroom.firstcitizens.com/2026-04-23-First-Citizens-Bank-to-Expand-Commercial-Solutions-and-Align-Brand-Names-in-Q4-2026), SVB renamed First Citizens Innovation Banking and First Citizens Fund Banking
