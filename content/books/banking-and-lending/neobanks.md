+++
title = "Neobanks & Consumer Fintech"
description = "US and UK neobanks from their filings: interchange, liquidity fees, lending and float, the Durbin line and its litigation, and program manager versus charter."
category = "Banking & Lending Industry"
order = 2424
part = "Fintech and BaaS"
tags = ["banking", "fintech", "neobanks", "interchange", "durbin", "sponsor-banks"]
+++

A neobank is a bank account sold as an app, and in the United States it's usually not a bank. Chime, Cash App, Dave, MoneyLion and Current hold no charter: each is a program manager whose accounts and cards belong to one or more sponsor banks, and whose own ledger mirrors the bank's. SoFi and Varo hold national charters, Block owns an industrial bank for its lending, and Revolut and Mercury are part way through the OCC's process. In the UK the same companies start the other way round: Monzo and Starling are licensed banks, so there is no sponsor layer to rent and no sponsor to blame.

The choice between renting a charter and holding one is mostly an economic one, and the economics are unusually legible because the large neobanks file with the SEC. This chapter reads the filings for how the money is made (interchange, fees on liquidity products, lending, and float), follows the one regulatory line that shapes the whole US model (Regulation II's $10 billion exemption, and the litigation that may move it), and sets out what program manager versus charter means for the system. The sponsor bank's side of the arrangement is [Banking as a Service](/books/banking-and-lending/banking-as-a-service); the path to a charter is [Starting a Bank](/books/banking-and-lending/starting-a-bank); the market map is [The Banking Landscape](/books/banking-and-lending/banking-landscape#neobanks).

## How the Platforms Do It

What the companies disclose about their structure and money, as of October 2026:

| Company | Structure | Bank behind the account | Main revenue lines (from its own filings or pages) |
| --- | --- | --- | --- |
| **Chime** | Program manager | The Bancorp Bank, N.A. and Stride Bank, N.A. | Interchange (debit 49% and credit 20% of 2025 revenue), MyPay, outbound instant transfers |
| **Cash App** (Block) | Program manager for the card; Block owns an industrial bank | Sutton Bank issues the Cash App Card; Square Financial Services originates Cash App Borrow from Q2 2025 | Card interchange and Cash App Borrow, among others |
| **Current** | Program manager | Choice Financial Group and/or Cross River Bank | Not in a public filing |
| **Dave** | Program manager | Evolve Bank & Trust, moving to Coastal Community Bank | ExtraCash fees ($554.2 million of 2025 operating revenue in all) |
| **MoneyLion** (Gen Digital) | Program manager | Pathward, N.A. | Instacash Turbo fees and optional tips, paid memberships |
| **SoFi** | National bank (SoFi Bank, N.A., since 2022) | Its own | Lending, deposits' net interest income, Galileo and Technisys platform |
| **Varo** | National bank (2020) | Its own | Not broken out here; a $20.8 million loss in the fourth quarter of 2025 |
| **Revolut US** | Preliminary conditional OCC approval for a national bank, September 2, 2026 | Not yet its own; final OCC approval, FDIC insurance and Federal Reserve stock still to come | Not in a US filing |
| **Monzo** (UK) | Licensed UK bank | Its own | £1.2bn of revenue on £16.6bn of deposits |
| **Starling** (UK) | Licensed UK bank | Its own | Not covered here; fined by the FCA in 2024 ([The UK Contrast](#the-uk-contrast)) |

Three things stand out. **The US program managers sit on smaller banks:** Chime's 10-K says both of its banks are under the $10 billion line where the cap on debit interchange starts ([The Durbin Line](#the-durbin-line)). **The charter holders earn on the balance sheet:** SoFi's Financial Services segment reported $207.8 million of net interest income in the fourth quarter of 2025 alone, which a program manager earns only if its bank agreement shares it. **Most of them lend,** whether it calls the product a loan, an overdraft, an advance or earned wage access, because interchange alone pays for the account and not much more.

## How Neobanks Make Money

### Interchange

Chime is the clearest case. Its 2025 revenue was $2,186.8 million, up 31% from $1,673.3 million, and its 10-K says plainly that "a substantial majority of our revenue has been derived from interchange fees": debit card interchange was 49% of revenue in 2025 (55% in 2024) and credit card interchange another 20%. The cards are issued by its two partner banks, and the contracts "entitle Chime to receive from such banks the fees generated from these card programs, less costs associated with our members' transactions and certain fixed fees." That sentence is the whole program-manager model: the bank receives the interchange as issuer, keeps a fee and a share of costs, and remits the rest. How a card program splits interchange with its processor and network is in [The Economics](/books/payments/card-issuing#the-economics); what the bank charges the program for the charter is in [Banking as a Service](/books/banking-and-lending/banking-as-a-service#how-the-money-flows).

Interchange makes the account free and makes the debit card the product. It also makes active use the metric that matters: Chime reports 9.5 million Active Members and says most use it as their primary account, and Block reports Cash App's 59 million monthly transacting actives. A deposit account that isn't used to spend earns the program manager almost nothing.

### Liquidity products

The second line is short-term liquidity, sold in forms that are carefully not called loans:

- **Fee-free overdraft within a limit.** Chime's SpotMe "allows eligible members to overdraft fee-free within their available limit"; Chime bears the loss risk on it. How it differs from bank overdraft, and the eligibility models behind it, are in [Overdraft, NSF & Fees](/books/banking-and-lending/overdraft-and-fees#how-the-platforms-do-it).
- **Advances priced as a percentage.** Dave's ExtraCash provides "up to $500 of credit in the form of a discretionary overdraft", and since February 2025 carries "a mandatory 5% overdraft service fee, including a $5 minimum" in place of its previous optional fee model. Dave's operating revenue went from $259.1 million in 2023 to $347.1 million in 2024 and $554.2 million in 2025.
- **Earned wage access.** Chime's MyPay lets members draw "a portion of their earned pay on demand before payday", free within 24 hours or instantly for a fee; its full launch in July 2024 drove a $212.5 million increase in Chime's platform-related revenue, which reached $686.2 million in 2025. MoneyLion's Instacash advertises up to $500 (up to $1,000 with qualifying activity), with optional tips and a Turbo fee of 7.5% capped at $14.99 to its own account or 9% to an external one. Whether such products are credit is the subject of [Earned Wage Access and the Credit Question](#earned-wage-access-and-the-credit-question).
- **Instant transfer fees.** Moving money out of the app now rather than by ACH is a fee: Chime's outbound instant transfers, launched in the first quarter of 2025, brought in $38.0 million that year.

In each case the program manager, not the bank, usually carries the loss. Chime's 10-K says it "bears certain risk of loss from the liquidity products offered through our platform" and is liable to its partner banks for member defaults, which is the credit enhancement structure [Banking as a Service](/books/banking-and-lending/banking-as-a-service#reserves-and-credit-enhancement) describes from the bank's side.

### Lending

Lending is where a charter starts to pay. Cash App Borrow "provides eligible customers with access to short-term loans for a fixed fee"; Block originated it through a third-party industrial bank and, from the second quarter of 2025, also through its own Square Financial Services, a Utah industrial bank ([Industrial Loan Companies](/books/banking-and-lending/charters-and-regulators#industrial-loan-companies)). SoFi's personal and student loans are funded by its own deposits. A program manager without a charter lends through its sponsor bank, which originates the loan and often sells it back ([Banks, Nonbanks and Partners](/books/banking-and-lending/lending-business#banks-nonbanks-and-partners) covers the partnership model, and [Lender Licensing & Bank Partnerships](/books/banking-and-lending/lender-licensing) the law behind it).

### Float

The spread on deposits belongs to whoever holds them. SoFi, with $37.5 billion of deposits at the end of 2025, earned $207.8 million of Financial Services net interest income in the fourth quarter, "driven by growth in consumer deposits." A program manager earns float only as a negotiated share of what its bank earns, and the program pays for any interest it promises customers. Varo shows the other side: a charter that holds deposits without enough lending to earn on them. Its fourth-quarter 2025 call report showed a $20.8 million quarterly loss and $211.4 million of net deposits, down 37.2% in a year, and it raised $123.9 million of new capital.

### Platform revenue

Several neobanks sell their stack to others: SoFi's Technology Platform segment (Galileo processing and Technisys cores), MoneyLion's marketplace, and Starling's Engine software. That revenue is volatile in a way consumer revenue isn't; SoFi's enabled accounts fell 23% in the fourth quarter of 2025 after a large client left.

## The Durbin Line

The Durbin Amendment (15 USC 1693o-2) requires debit interchange to be "reasonable and proportional to the cost incurred by the issuer", and the Federal Reserve's Regulation II sets the cap at 21 cents plus 5 basis points of the transaction (12 CFR 235.3(b)), plus a fraud-prevention adjustment of up to 1 cent (235.4). The cap doesn't apply to "any issuer that, together with its affiliates, has assets of less than $10,000,000,000." The statute also exempts government-administered cards and reloadable general-use prepaid cards that are not linked to an account held for the cardholder, are not marketed as gift cards and meet the regulation's other conditions (235.5(c)).

Chime's 10-K puts the consequence in one sentence: the rules "exempt banks with under $10 billion in assets, which include both of our bank partners." The Federal Reserve's 2024 data show what that's worth: the average interchange on an exempt debit transaction was $0.51 against $0.23 on a covered one. A program manager earning interchange through an exempt bank earns about twice what the same card would earn at a large bank, and that gap pays for the free account.

### When the line moves

The exemption is tested once a year. An issuer is exempt for a transaction if, with its affiliates, it had "assets of less than $10 billion as of the end of the calendar year" before it, and an issuer that crosses the line "must begin complying with §§ 235.3, 235.4, and 235.6 no later than July 1 of the succeeding calendar year." A worked example of my own: a sponsor bank reports $10.2 billion of consolidated assets at December 31, 2026. Its debit interchange stays at network rates through June 30, 2027, and is capped from July 1, 2027. A program with 2 million active cards averaging 30 purchases a month, at the 2024 averages, goes from about 2,000,000 × 30 × $0.51 = $30.6 million a month of gross interchange to about 2,000,000 × 30 × $0.23 = $13.8 million. Programs grow sponsor banks, so the program that succeeds is the one most likely to push its bank over the line; Chime's 10-K lists the risk that a new partner "may not be exempt."

The structure has two answers. A program can spread across several exempt banks, which is part of why the large neobanks have two or more, or it can leave the model: SoFi, far above $10 billion, accepts regulated interchange and earns on deposits and loans instead.

### The litigation

As of October 2026 the cap itself is in court:

- **The 2023 proposal.** The Federal Reserve proposed on November 14, 2023 to lower the cap to a 14.4-cent base, 4.0 basis points and a 1.3-cent fraud adjustment, with updates every other year from issuer survey data. It was never finalized.
- **Corner Post v. Board of Governors (D.N.D.).** On August 6, 2025 the district court held Regulation II contrary to the statute, because the Fed counted costs beyond those the Durbin Amendment allows, and vacated it, staying the vacatur pending appeal "to prevent interchange transaction fees from becoming a completely unregulated market."
- **The Eighth Circuit.** On October 26, 2026 the court of appeals unanimously affirmed and remanded for the Fed to set a fee standard consistent with the statute's transaction-specific cost test. It set no new cap, and its decision takes effect only when the mandate issues; rehearing or a petition for certiorari can delay it. Until then, the 21-cent standard applies.
- **Linney's Pizza v. Board of Governors (E.D. Ky.).** The district court went the other way in September 2025 and upheld Regulation II; the Sixth Circuit heard the appeal (No. 25-6038) on October 22, 2026 and hadn't decided it. An affirmance there would split the circuits.

My reading, dated October 2026: the courts are arguing over what the Fed may count, and a cap built only from transaction-specific costs is likely to be lower than 21 cents, not higher. A lower cap on covered issuers widens the exempt-bank advantage the model rests on. A system should hold interchange assumptions per bank and per period as data, as in [How to Build It](#how-to-build-it), so a new cap is a configuration change rather than a rewrite.

## Program Manager or Charter

The two models put the same records in different hands:

| | Program manager on a sponsor bank | Own charter |
| --- | --- | --- |
| **Who holds the deposit** | The bank, often in one FBO account per program | The neobank's own bank |
| **Ledger of record** | The bank's core, or the program's subledger reconciled to it ([Program Ledgers & the Synapse Lesson](/books/banking-and-lending/program-ledgers)) | Its own core |
| **Who owns CIP, BSA, Reg E, Reg DD** | The bank, with tasks delegated to the program by contract | The neobank, directly |
| **Debit interchange** | Exempt if the bank is under $10 billion | Capped once its own assets reach $10 billion |
| **Float and lending** | A negotiated share; loans originated by the bank | All of it, against its own capital |
| **Regulators** | Indirectly, through the bank's examiners; directly by the CFPB and states for its own conduct | Directly: the OCC or state, the FDIC, the Fed, the CFPB above $10 billion |
| **Time to launch** | Months | Years ([Starting a Bank](/books/banking-and-lending/starting-a-bank#the-path)) |
| **What can stop it** | The bank's regulator, through the bank ([Sponsor Bank Oversight](/books/banking-and-lending/sponsor-bank-oversight)) | Its own regulator |

Either way the conduct rules reach the brand. The CFPB's January 16, 2025 order against Block required up to $120 million of redress and a $55 million penalty because Cash App didn't fully investigate unauthorized-transaction disputes under the Electronic Fund Transfer Act and told users to ask their banks instead ([Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes) is the workflow that should have run); its May 7, 2024 order against Chime ($3.25 million penalty, at least $1.3 million redress) was over refunds of closed accounts' balances that often took more than 14 days and in thousands of cases more than 90. A program manager is a "covered person" to the CFPB in its own right, and its customer agreement doesn't move its Reg E obligations to the bank.

The 2025 and 2026 charter wave (Nubank, Mercury, Upstart and others conditionally approved by the OCC; Revolut on September 2, 2026 with at least $95 million of initial capital and a 10% Tier 1 leverage ratio for its first three years) is in [Fintechs That Chartered](/books/banking-and-lending/starting-a-bank#fintechs-that-chartered). The engineering consequence of moving is the same as moving between sponsor banks, with a new institution at the end: [Moving Between Sponsor Banks](/books/banking-and-lending/banking-as-a-service#moving-between-sponsor-banks).

## The UK Contrast

The UK has no sponsor-bank layer for consumer current accounts: a neobank that wants to hold deposits gets a banking licence, and the ones that scaled did. Monzo reported £1.2 billion of revenue (up 48%), £113.9 million of adjusted profit before tax, more than 12 million customers and £16.6 billion of deposits in its 2025 annual report. The licence brings the deposits and the obligations together: the FCA fined Starling £28,959,426 on October 2, 2024 (£40,959,426 before a 30% settlement discount) after it opened more than 54,000 accounts for about 49,000 high-risk customers between September 2021 and November 2023 in breach of an agreed restriction, and found in January 2023 that its automated sanctions screening had checked only a fraction of the list since 2017. That is the same failure as the US sponsor bank orders, growth outrunning financial crime controls, with no bank in between to receive the order ([BSA/AML Programs](/books/banking-and-lending/bsa-aml) and [Sanctions Screening](/books/banking-and-lending/sanctions-screening) cover the controls). UK payment institutions and e-money firms that don't take deposits safeguard customer funds instead, under the regime in [Safeguarding Outside the US](/books/payments/treasury#safeguarding-outside-the-us).

## Earned Wage Access and the Credit Question

Every liquidity product above raises one question: is it credit? If it is, the Truth in Lending Act's disclosures and APR apply, and state lending law may follow. The answer is product by product: an overdraft line priced as a fee sits in Regulation Z's overdraft exceptions and the fee rules in [Overdraft, NSF & Fees](/books/banking-and-lending/overdraft-and-fees); an advance with a mandatory fee and a repayment obligation is credit by its terms; and earned wage access has its own federal history and state statutes, which [Earned Wage Access](/books/banking-and-lending/earned-wage-access#the-federal-arc) covers. The design rule for a neobank is to decide the classification per product with counsel before launch, record it with the product version ([Products & Product Configuration](/books/banking-and-lending/product-configuration)), and build the disclosures it implies, because changing the classification later means re-disclosing to every customer.

## How to Build It

These are deltas against `programs` and `accounts` in [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). The neobank's own concerns are which model it runs, how revenue is shared under each program agreement, and the issuing bank's Regulation II status by year, since interchange depends on it:

```sql
ALTER TABLE programs
  ADD COLUMN model TEXT NOT NULL DEFAULT 'program_manager'
    CHECK (model IN ('program_manager', 'own_charter', 'affiliate_bank'));  -- affiliate: an ILC the parent owns

-- Regulation II status of each issuing institution, tested at each year end.
CREATE TABLE institution_asset_tests (
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  year_end            DATE NOT NULL,         -- December 31 of the test year
  assets_with_affiliates BIGINT NOT NULL,    -- minor units, from the call report or Y-9C
  source_ref          TEXT NOT NULL,         -- the filing it came from
  exempt              BOOLEAN GENERATED ALWAYS AS (assets_with_affiliates < 1000000000000) STORED,  -- $10 billion
  regulated_from      DATE,                  -- July 1 of the next year when the line is crossed
  PRIMARY KEY (institution_id, year_end)
);

-- How each revenue line is shared under a program agreement, versioned.
CREATE TABLE program_revenue_terms (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id          UUID NOT NULL REFERENCES programs (id),
  line                TEXT NOT NULL CHECK (line IN ('debit_interchange', 'credit_interchange',
                        'deposit_spread', 'loan_interest', 'fees', 'instant_transfer')),
  basis               TEXT NOT NULL CHECK (basis IN ('percent_of_volume', 'per_transaction',
                        'net_of_costs', 'percent_of_revenue', 'fixed_monthly')),
  bank_rate           NUMERIC(9, 6),         -- the bank's share or rate, by basis
  bank_fixed_fee      BIGINT,                -- minor units per period, if any
  minimum_monthly     BIGINT,
  agreement_ref       TEXT NOT NULL,         -- the clause in the program agreement
  valid_during        DATERANGE NOT NULL,
  EXCLUDE USING gist (program_id WITH =, line WITH =, valid_during WITH &&)
);

-- What the bank actually remitted each period, to reconcile against the program's own count.
CREATE TABLE program_revenue_statements (
  program_id          UUID NOT NULL REFERENCES programs (id),
  period              DATERANGE NOT NULL,
  line                TEXT NOT NULL,
  gross_amount        BIGINT NOT NULL,       -- interchange or revenue as the bank measured it
  bank_retained       BIGINT NOT NULL,
  remitted            BIGINT NOT NULL,
  expected_remitted   BIGINT NOT NULL,       -- computed from the program's transactions and the terms
  journal_entry_id    UUID REFERENCES journal_entries (id),
  statement_ref       TEXT NOT NULL,         -- the bank's statement, as received
  PRIMARY KEY (program_id, period, line)
);
```

Design notes:

- **Interchange is a forecast input and a reconciliation target.** The program computes what it expects from its own card transactions under the terms in force and the issuer's exemption for that date, and compares it with what the bank remits; a difference is a break, as in [Breaks](/books/payments/ledger-and-reconciliation#breaks).
- **Liquidity products are accounts.** SpotMe-style overdraft, an advance or a credit-builder line is an `accounts` row of kind `line` (or `loan`) under its own product version, not a negative balance on the deposit account, so its losses, fees and disclosures are separable; the deposit account and the line are joined through `account_parties` on the same party.
- **Revenue terms are effective-dated.** A renegotiated split, a new bank or a new cap is a new row ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)), so last year's statements still recompute under last year's terms.

## Auditing

- **The bank's exemption, year by year,** with the filing behind each test, because a misclassified issuer misprices every debit transaction for a year.
- **Every revenue statement from each bank** as received, with the program's own expected figure and the explanation of any difference.
- **The classification of each liquidity product** (overdraft, credit, earned wage access) with the analysis behind it and the product version it applies to.
- **Dispute and refund timelines** for the program's own conduct, since the CFPB's orders against Cash App and Chime were about the program's handling, not the bank's.

## What This Means for the System You Build

- **Know which bank issues every card and holds every account,** by date, and whether it was exempt from Regulation II that day.
- **Model revenue sharing as versioned terms** and reconcile the bank's remittance against your own count every period.
- **Keep liquidity products as their own accounts** with their own product versions, losses and disclosures.
- **Plan for the bank to cross $10 billion,** or for the cap to move, as a configuration change with a July 1 date.
- **Treat Reg E and refund clocks as yours** even when the bank is the account holder.
- **Decide program manager or charter on the records each needs,** not only the economics: a charter means you are the ledger of record and the examined party.

## References

**Law and regulation**

- [15 USC 1693o-2](https://www.law.cornell.edu/uscode/text/15/1693o-2), the reasonable-and-proportional standard, the $10 billion small issuer exemption and the government and reloadable prepaid exemptions
- [12 CFR 235.3](https://www.law.cornell.edu/cfr/text/12/235.3), the 21-cent plus 5 basis point standard
- [12 CFR 235.5](https://www.law.cornell.edu/cfr/text/12/235.5), assets measured at the end of the preceding calendar year, compliance by July 1 after crossing, and the prepaid conditions

**Regulators and guidance**

- [Federal Reserve: Average debit card interchange fee by payment card network](https://www.federalreserve.gov/paymentsystems/regii-average-interchange-fee.htm), 2024 averages of $0.51 exempt and $0.23 covered
- [Federal Register: Debit Card Interchange Fees and Routing (proposed rule, November 14, 2023)](https://www.govinfo.gov/content/pkg/FR-2023-11-14/html/2023-24034.htm), the 14.4-cent, 4.0 basis point and 1.3-cent proposal and biennial updates
- [CFPB: Orders operator of Cash App to pay $175 million (January 16, 2025)](https://www.consumerfinance.gov/about-us/newsroom/cfpb-orders-operator-of-cash-app-to-pay-175-million-and-fix-its-failures-on-fraud/), dispute investigation failures under the EFTA, redress and penalty
- [CFPB: Chime Financial, Inc. enforcement action](https://www.consumerfinance.gov/enforcement/actions/chime-financial-inc/), the May 7, 2024 order on delayed refunds of closed accounts
- [FCA: Starling Bank fined for financial crime failings (October 2, 2024)](https://www.fca.org.uk/news/press-releases/fca-fines-starling-bank-failings-financial-crime-systems-and-controls), the fine, the high-risk accounts and the sanctions screening gap

**Filings**

- [Chime Financial: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1795586/000179558626000013/chym-20251231.htm), revenue and its lines, interchange share, partner banks and their exemption, the revenue sharing sentence, SpotMe, MyPay and loss risk
- [Dave: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1841408/000119312526085370/dave-20251231.htm), operating revenue, ExtraCash and its fee, Evolve and Coastal Community Bank
- [Block: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1512673/000162828026012254/xyz-20251231.htm), Cash App monthly transacting actives, Cash App Borrow and Square Financial Services
- [SoFi Technologies: Fourth quarter 2025 results](https://s27.q4cdn.com/749715820/files/doc_financials/2025/q4/2025-Q4-Earnings-Release.pdf), deposits, Financial Services net interest income and Technology Platform accounts

**Courts**

- [Cooley: District court vacates Regulation II (August 15, 2025)](https://www.cooley.com/news/insight/2025/2025-08-15-district-court-vacates-regulation-iis-debit-card-interchange-fee-standard), Corner Post's August 6, 2025 vacatur and its stay pending appeal
- [Consumer Finance Monitor: Eighth Circuit invalidates the 21-cent cap (October 28, 2026)](https://www.consumerfinancemonitor.com/2026/10/28/eighth-circuit-invalidates-federal-reserves-21-cent-debit-card-interchange-fee-cap-holding-that-the-durbin-amendment-requires-a-transaction-specific-cost-analysis/), the October 26 affirmance, the remand, the mandate, and Linney's Pizza's argument in the Sixth Circuit
- [Orrick InfoBytes: Sixth Circuit to receive Regulation II case (November 14, 2025)](https://infobytes.orrick.com/2025-11-14/sixth-circuit-to-receive-regulation-ii-interchange-fee-case-after-plaintiffs-appeal/), the E.D. Kentucky judgment upholding Regulation II and the appeal

**Charter decisions**

- [OCC: Corporate Decision #1390, Revolut Bank US, N.A. (September 2, 2026)](https://www.occ.gov/topics/charters-and-licensing/interpretations-and-decisions/2026/cd1390.pdf), preliminary conditional approval, $95 million of capital, the 10% leverage ratio and the FDIC and Federal Reserve steps

**Company pages**

- [Cash App: Card agreement](https://cash.app/legal/us/en-us/card-agreement), Sutton Bank as issuer
- [Current](https://current.com/), banking services from Choice Financial Group and/or Cross River Bank
- [MoneyLion: Instacash](https://www.moneylion.com/instacash/), limits, Turbo fees, optional tips and Pathward
- [Monzo: Annual report 2025](https://www.monzo.com/annual-report/2025), revenue, adjusted profit before tax, customers and deposits

**In practice**

- [American Banker: Varo's funding round and fourth-quarter call report](https://www.americanbanker.com/news/varo-funding-round-2025q4-call-report?position=2), the quarterly loss, deposits and new capital
