+++
title = "When Banks Fail"
description = "SVB, Signature and First Republic, uninsured runs, FDIC resolution, the least-cost test and its exception, the special assessment, and failure in systems."
category = "Banking & Lending Industry"
order = 2407
part = "The Business"
tags = ["banking", "bank-failures", "fdic", "deposit-insurance", "resolution", "liquidity"]
+++

Banks fail on Fridays. The chartering authority closes the bank, the FDIC is appointed receiver, and over the weekend the FDIC either hands the deposits to another bank or to a bank it charters for the purpose, so that on Monday insured depositors have their money and the branches, cards, app and direct deposits keep working under a new name. Most failures are small and nearly invisible. In March and May 2023 three of the largest failures in US history happened in eight weeks: Silicon Valley Bank, Signature Bank and First Republic Bank, with $548.5 billion of assets between them at their last reported dates, each brought down by a run of uninsured depositors, two of them resolved with every depositor protected under a systemic risk exception, and the cost charged back to the banking industry by a special assessment that ran through March 2026.

For an engineer, a failure is the moment every record has to be right at once. The FDIC must know, within a weekend, which deposits are insured, which belong to whom behind a custodial account, and which balances to hold; the acquirer must take over accounts, payments in flight and card programs; and every fintech, business and payroll provider with money at the bank has to know where it stands on Monday. This chapter covers the 2023 failures, how the FDIC resolves a bank, the least-cost test and its exception, the special assessment, and what the receivership weekend does to systems. How the FDIC computes insured amounts per depositor is in Deposit Insurance; the risks that cause failures are in [Bank Economics](/books/banking-and-lending/bank-economics).

## How the Platforms Do It

The failures, from the FDIC's releases and reviews, as of October 2026:

| Bank | Closed | Closed by | Size at failure (FDIC release) | Uninsured share | Resolution | Estimated DIF cost |
| --- | --- | --- | --- | --- | --- | --- |
| Silicon Valley Bank | Friday, March 10, 2023 | California DFPI | $209.0B assets, $175.4B deposits (December 31, 2022) | About 94% of deposits at year-end 2022 | Deposit Insurance National Bank of Santa Clara, then Silicon Valley Bridge Bank (March 13); sold to First-Citizens (March 26) | About $20B at sale |
| Signature Bank | Sunday, March 12, 2023 | New York DFS | $110.4B assets, $88.6B deposits (December 31, 2022) | 90% of deposits at year-end 2022 | Signature Bridge Bank; deposits (except about $4B of digital asset deposits) to Flagstar (March 19) | About $2.5B at sale |
| First Republic Bank | Monday, May 1, 2023 | California DFPI | $229.1B assets, $103.9B deposits (April 13, 2023) | Concentrated, per the OIG | All deposits and substantially all assets to JPMorgan Chase | About $13B at sale; $15.6B recorded June 5, 2023 |

Combined, the FDIC put the cost of SVB and Signature at $23.6 billion as of December 31, 2023, about $20.4 billion of it from covering uninsured depositors. Since 2023 failures have been small community banks: two in 2024, two in 2025 and six in 2026 through September ([Failures Since 2023](#failures-since-2023)).

## Anatomy of a Run

**Silicon Valley Bank.** SVB's holding company tripled in size between 2019 and 2021 on deposits from venture-backed technology and life sciences companies, mostly uninsured, and invested them largely in long-duration securities. When rates rose in 2022, deposits flowed out and unrealized losses grew. On March 8, 2023 SVB announced it had sold $21 billion of available-for-sale securities at a $1.8 billion after-tax loss and would raise capital. The next day it lost over $40 billion of deposits, and management expected over $100 billion more on March 10, "roughly 85 percent of the bank's deposit base," in a run the Federal Reserve's review described as coordinated withdrawals by a "concentrated network of VC investors and technology firms who, fueled by social media, withdrew uninsured deposits." The review's diagnosis: governance, liquidity and interest rate risk failures at the bank, and supervisors who didn't act "with sufficient force and urgency."

**Signature Bank.** The FDIC's review found "the root cause of SBNY's failure was poor management," with illiquidity from contagion after Silvergate's announced wind-down and SVB's failure as the immediate cause. Signature had lost $17.6 billion of deposits in 2022, 62% of it digital asset related; at year-end 2022 uninsured deposits were 90% of the total and liquid assets 34%. On March 10 withdrawal requests reached 20% of deposits, and by Sunday the wires queued for Monday had grown to $7.9 billion against $3 billion of available liquidity, 4% of deposits. New York closed it within 53 hours of SVB's failure.

**First Republic Bank.** The FDIC's Inspector General attributed the failure to a contagion-driven run, a concentration of uninsured deposits and interest rate risk, and found the FDIC "missed opportunities" to act earlier and downgrade component ratings.

The common thread is the one [Bank Economics](/books/banking-and-lending/bank-economics#liquidity) draws: uninsured, concentrated, digitally connected depositors can leave in hours, faster than any contingency funding plan written for the runs of 2008, and a bank whose securities are underwater can't sell them to pay without crystallizing the loss.

## How the FDIC Resolves a Bank

The chartering authority (the OCC or a state) closes a bank and appoints the FDIC as receiver. The FDIC's Resolutions Handbook describes a process that "generally takes 90 days or less in a capital failure scenario," shortened sharply when the failure is a liquidity run, and a bank must generally be closed within 90 days of becoming critically undercapitalized. Its options:

- **Purchase and assumption (P&A).** A healthy bank, chosen by bid, assumes some or all deposits and buys some or all assets, sometimes with loss sharing on the assets. This is the usual outcome: insured depositors "immediately become depositors of the assuming bank," and branches "usually reopen the next business day."
- **Deposit payoff.** No buyer; the FDIC pays insured depositors directly, "Generally, funds are paid the next business day," by check or through a nearby bank that takes over direct deposits temporarily. Outstanding checks and payment requests presented after the failure "will be returned unpaid."
- **Bridge bank.** A "new, temporary depository institution chartered by the OCC" that the FDIC runs while it arranges a final transaction. The statute (12 USC 1821(n)) gives a bridge bank two years, extendable by up to three one-year periods. A deposit insurance national bank (DINB) is the narrower version that holds only insured deposits, as SVB's did for its first weekend.

Uninsured depositors in a P&A that doesn't assume all deposits, or in a payoff, get a receiver's certificate for the excess and are paid as the receivership sells assets; at SVB the FDIC initially promised "an advance dividend within the next week." The closing announcement told SVB's loan customers to "continue to make their payments as usual" and said its official checks "will continue to clear." Post-closing settlement between the receiver and the acquirer can run "up to 364 days."

A worked example of a depositor's position in a failure without full protection, for one person with a single-ownership account of $1,200,000:

| | Amount |
| --- | --- |
| Insured (single ownership, $250,000 limit) | $250,000, available at the assuming bank or by FDIC payment |
| Uninsured | $950,000, a claim on the receivership |
| An advance dividend, if the FDIC declares one at, say, 50% | $475,000 soon after closing |
| The remaining claim | Paid, in part or full, as assets are sold |

The same depositor with a joint account, retirement accounts and trust accounts at the same bank would have more coverage, one limit per ownership category; Deposit Insurance has the categories and the 2024 trust rule.

## The Least-Cost Test and the Systemic Risk Exception

The FDIC must choose the resolution that is "the least costly to the Deposit Insurance Fund of all possible methods" (12 USC 1823(c)(4)). Least cost usually means uninsured depositors bear losses, unless an acquirer pays enough of a premium to take all deposits, as First-Citizens and JPMorgan effectively did for theirs.

The statute's only exception is the systemic risk determination, and it is deliberately hard: a written recommendation by two-thirds of the FDIC Board and two-thirds of the Federal Reserve Board, and a determination by the Treasury Secretary, "in consultation with the President," that following the least-cost rule would have serious adverse effects on economic conditions or financial stability and that the action would avoid or mitigate them. Any loss to the DIF from the exception must be recovered by special assessments on insured institutions, Treasury documents the determination, the GAO reviews it, and the congressional banking committees are notified within three days.

On Sunday, March 12, 2023, the Treasury, the Federal Reserve and the FDIC invoked it for SVB and then Signature: the FDIC would resolve SVB in a way that "fully protects all depositors," with access to all their money from Monday, March 13; "No losses associated with the resolution of Silicon Valley Bank will be borne by the taxpayer"; shareholders and certain unsecured debtholders were not protected and senior management was removed; and losses would be recovered by a special assessment. On Monday, Silicon Valley Bridge Bank, N.A. took over all deposits, "both insured and uninsured."

## The Special Assessment

The FDIC's final rule (88 FR 83329, November 29, 2023, effective April 1, 2024) recovered the estimated $16.3 billion of uninsured-depositor losses at SVB and Signature at an annual rate of about 13.4 basis points: 3.36 basis points a quarter for eight quarters starting with the first quarter of 2024, on each banking organization's estimated uninsured deposits as of December 31, 2022, excluding the first $5 billion. Banks with less than $5 billion of uninsured deposits paid nothing.

An interim final rule of December 19, 2025 (90 FR 59369) closed it out: with the estimated loss at $16.7 billion as of September 30, 2025, the eighth and final quarterly rate fell from 3.36 to 2.97 basis points (paid March 30, 2026, $246 million less in total), the provision to extend collection was removed, any excess will come back as credits against regular assessments once the SVB Financial Trust litigation and the receiverships are resolved, and a shortfall at termination would mean one final special assessment on at least 45 days' notice. Regions, for one, reported its fourth-quarter 2025 FDIC assessment expense down 80% "attributable to an update by the FDIC of member banks' special insurance assessment."

The arithmetic, for a banking organization that reported $25 billion of estimated uninsured deposits at December 31, 2022:

| | Amount |
| --- | --- |
| Assessment base: $25B minus the $5B exclusion | $20B |
| Quarters 1 to 7: $20B x 0.000336 | $6.72M a quarter, $47.04M |
| Quarter 8: $20B x 0.000297 | $5.94M |
| Total | $52.98M |

The base was fixed at a past date, so it couldn't be managed down after the rule. That is the kind of figure a bank's assessment system has to compute from a historical call report, not the current one.

## The Receivership Weekend in Systems

What happens to the running systems between Friday's close and Monday's opening, as the FDIC's releases and rules describe it:

1. **Friday, at or after close of business.** The chartering authority closes the bank; the FDIC takes control of premises, books and systems. The core keeps running, now under the FDIC's direction.
2. **Deposits move.** Insured deposits (or all deposits) transfer to the assuming bank, bridge bank or DINB as of the closing. The account numbers and routing numbers usually keep working; the acquirer accepts the failed bank's checks and deposit slips "for a short time" and later issues its own.
3. **Uninsured balances are held.** Large banks must be able to place provisional holds automatically: 12 CFR 360.9 applies to banks with at least $2 billion of deposits and either 250,000 or more deposit accounts or $20 billion or more of assets, and requires the holds to be in place by 9 a.m. local time on the business day after the FDIC's cutoff. Banks with 2 million or more deposit accounts must be able to "calculate the amount of deposit insurance coverage available for each deposit account in the event of its failure" under 12 CFR Part 370.
4. **Payments keep flowing where they can.** Direct deposits are redirected to the assuming bank; official checks clear; loan payments are still due; in a payoff, checks and payment requests presented after the failure are returned unpaid.
5. **Monday.** Branches reopen under the assuming bank's name (SVB's as the bridge bank on March 13; First Republic's 84 offices as Chase on the same day it failed), and digital banking resumes.
6. **Months later.** The acquirer converts the failed bank's accounts to its own core, a conversion with its own weekend (Core Modernization & Conversions).

The hard cases are the accounts the bank's own records can't settle in a weekend. A custodial or FBO account holding thousands of fintech customers' money is insured per owner only if the bank's records "expressly disclose" the custodial relationship and each owner's interest is ascertainable from records kept "in good faith and in the regular course of business" (12 CFR 330.5), which may be a fintech's or a middleware's ledger rather than the bank's. If those records are incomplete or late, the FDIC can't pay those owners promptly, and the program's customers wait (Program Ledgers & the Synapse Lesson covers what happens when the records themselves fail; the Payments volume's [Treasury & Bank Operations](/books/payments/treasury#fbo-accounts-and-pass-through-insurance) covers FBO accounts from a provider's side).

For a business with operating cash at a failing bank, the weekend question is simpler and harder: how much is insured, how much is held, and where payroll will come from on Monday. Sweeps, Reciprocal Deposits & Yield covers the products that spread balances across banks for that reason.

## Failures Since 2023

From the FDIC's failed bank list, as of October 2026:

| Closed | Bank | Location | Acquirer |
| --- | --- | --- | --- |
| April 26, 2024 | Republic First Bank (Republic Bank) | Philadelphia, PA | Fulton Bank, N.A. |
| October 18, 2024 | The First National Bank of Lindsay | Lindsay, OK | First Bank & Trust Co. |
| January 17, 2025 | Pulaski Savings Bank | Chicago, IL | Millennium Bank |
| June 27, 2025 | The Santa Anna National Bank | Santa Anna, TX | Coleman County State Bank |
| January 30, 2026 | Metropolitan Capital Bank & Trust | Chicago, IL | First Independence Bank |
| May 1, 2026 | Community Bank and Trust - West Georgia | LaGrange, GA | Anchor Bank |
| July 10, 2026 | Kentland Federal Savings and Loan Association | Kentland, IN | Kentland Bank |
| July 17, 2026 | Small Business Bank | Lenexa, KS | The Farmers State Bank of Oakley, Kansas |
| August 21, 2026 | Tioga-Franklin Savings Bank | Philadelphia, PA | Second Federal Savings and Loan Association of Philadelphia |
| September 25, 2026 | Nano Banc | Irvine, CA | Sunwest Bank |

Every one found an acquirer. The Deposit Insurance Fund stood at $161.1 billion at June 30, 2026, a reserve ratio of 1.48% of insured deposits, with 47 banks on the Problem Bank List.

## Reform Options

On May 1, 2023 the FDIC published three options for deposit insurance reform: limited coverage (today's structure, possibly with a higher limit), unlimited coverage for all depositors, and targeted coverage, in which "business payment accounts receive significantly higher coverage" than other deposits. The FDIC judged targeted coverage the best balance of stability against cost and moral hazard; most of it would need Congress. As of October 2026 the $250,000 limit is unchanged, and the industry's response has been products rather than law: reciprocal deposit networks and sweeps that place balances at many banks (Sweeps, Reciprocal Deposits & Yield).

## How to Build It

These are deltas against the core model's `institutions`, `accounts`, `account_parties` and `holds` ([The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model)), with failures recorded as `institution_events` ([The Banking Landscape](/books/banking-and-lending/banking-landscape#how-to-build-it)). The computation of insured amounts per owner and category belongs to Deposit Insurance; this chapter adds what a failure needs on top: the hold, the extract, and, for anyone with money at a bank, the exposure view.

```sql
-- A failure-day hold is a hold like any other, with its own reason.
ALTER TABLE holds DROP CONSTRAINT holds_reason_check;
ALTER TABLE holds ADD CONSTRAINT holds_reason_check CHECK (reason IN (
  'card_authorization', 'deposit_availability', 'legal_process', 'fraud', 'collateral',
  'manual', 'provisional_insurance'));     -- 12 CFR 360.9 provisional hold

CREATE TABLE failure_readiness_extracts (  -- the files the FDIC would need, produced on schedule
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  program_id          UUID REFERENCES programs (id),  -- per-owner files for custodial programs
  kind                TEXT NOT NULL CHECK (kind IN ('part_370_output', 'part_360_9_holds',
                        'pass_through_owner_file', 'depositor_listing')),
  as_of               TIMESTAMPTZ NOT NULL,          -- the cutoff it represents
  row_count           INT NOT NULL,
  total_balance       BIGINT NOT NULL,
  reconciles_to       BIGINT NOT NULL,               -- the custodial or GL balance it must equal
  content_hash        TEXT NOT NULL,
  storage_uri         TEXT NOT NULL,
  produced_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (total_balance = reconciles_to)
);

CREATE TABLE bank_exposures (              -- a company's view: money at each bank, by day
  as_of_date          DATE NOT NULL,
  institution_id      UUID NOT NULL REFERENCES institutions (id),
  holder              TEXT NOT NULL,                 -- the legal entity whose money it is
  ownership_category  TEXT NOT NULL,
  balance             BIGINT NOT NULL,
  insured_estimate    BIGINT NOT NULL,
  PRIMARY KEY (as_of_date, institution_id, holder, ownership_category)
);
```

Design notes:

- **The extract that must balance is checked when it's produced.** A per-owner file that doesn't sum to the custodial account's balance is a failed control today, not a discovery during a receivership; the `CHECK` makes the job fail loudly ([Reconcile to the Source](/docs/architecture/data-pipelines#reconcile-to-the-source)).
- **Produce it daily, keep every one.** "What did the records say at the close on the day the bank failed" has to have an exact, hashed answer, which is the same file the Payments volume asks a provider to send its bank daily.
- **Holds on failure use the normal path.** A provisional insurance hold is a `holds` row against available balance, released or converted when the FDIC determines insurance, so the core, digital banking and card authorization all see it the same way and nothing special-cases the failure ([Payment States & Ledgers](/docs/payments/payment-states#holds-that-change-size)).
- **Record the failure as an event with a date and a counterparty**, so routing numbers, accounts and file formats can be followed to the acquirer for the months the old identifiers keep arriving.
- **Exposure is per bank, per legal entity, per category.** A business or fintech treasury that can't answer "how much do we have at this bank, and how much is insured" before Friday's close is the depositor the 2023 runs were made of.

## Auditing

- **Every readiness extract with its hash, cutoff and reconciliation,** retained, so the records as of any failure date can be produced exactly.
- **Holds placed and released on and after a failure,** with the determination that released each one.
- **Bank exposure history** by bank and entity, with any decision to exceed an internal limit.
- **The acquirer handover:** which accounts, programs and payment flows moved, when, and under which agreement.

## What This Means for the System You Build

- **Design for the weekend.** If the bank under your accounts failed on Friday, the FDIC and the acquirer would need per-owner records, holds and payment flows working by Monday; build and test that path before you need it ([Runbooks and Game Days](/docs/operations/disaster-recovery#runbooks-and-game-days)).
- **Keep per-owner records that reconcile daily.** Pass-through insurance depends on them, and a program's customers are paid as fast as its records can be trusted.
- **Watch uninsured concentration.** The 2023 runs were uninsured, concentrated and fast; measure it per bank and per depositor, daily.
- **Treat a failure as an identity change.** Routing numbers, institution names and file formats move to an acquirer; keep the event and the mapping, because old identifiers arrive for months.
- **Spread what you can't insure.** Businesses and fintechs holding more than the limit at one bank should know it, every day, and decide it on purpose.

## References

**Law and regulation**

- [12 USC 1821: Insurance Funds](https://www.law.cornell.edu/uscode/text/12/1821), bridge banks, their term and extensions, and payment of insured deposits
- [12 USC 1823: Corporation monies](https://www.law.cornell.edu/uscode/text/12/1823), the least-cost requirement, the systemic risk exception and recovery by special assessment
- [12 CFR 330.5: Recognition of deposit ownership and fiduciary relationships](https://www.law.cornell.edu/cfr/text/12/330.5), the records pass-through insurance depends on
- [12 CFR 360.9: Large-bank deposit insurance determination modernization](https://www.law.cornell.edu/cfr/text/12/360.9), provisional holds and their deadline
- [12 CFR 370: Recordkeeping for timely deposit insurance determination](https://www.law.cornell.edu/cfr/text/12/370.1), covered institutions with 2 million or more deposit accounts
- [FDIC: Special Assessments Pursuant to Systemic Risk Determination, final rule (88 FR 83329, November 29, 2023)](https://www.federalregister.gov/api/v1/documents/2023-25813.json), the rate, base, $5 billion exclusion and eight quarters
- [FDIC: Special Assessment Collection, interim final rule (90 FR 59369, December 19, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-12-19/html/2025-23425.htm), the $16.7 billion estimate, the reduced final rate, credits and a possible final assessment

**Regulators and guidance**

- [Federal Reserve: Review of the Federal Reserve's Supervision and Regulation of Silicon Valley Bank (April 28, 2023)](https://www.federalreserve.gov/publications/files/svb-review-20230428.pdf), SVB's growth, the March 8 restructuring, the run and the diagnosis
- [FDIC: Supervision of Signature Bank (April 28, 2023)](https://www.fdic.gov/news/press-releases/2023/pr23033.html), root cause, 2022 outflows, uninsured share, the run and the closing
- [FDIC OIG: Material Loss Review of First Republic Bank (EVAL-24-03)](https://www.fdicoig.gov/news/summary-announcements/material-loss-review-first-republic-bank), causes, the $15.6 billion estimated loss and missed opportunities
- [Joint Statement by the Treasury, Federal Reserve and FDIC (March 12, 2023)](https://www.fdic.gov/news/press-releases/2023/pr23017.html), the systemic risk exception for SVB and Signature
- [FDIC: Silicon Valley Bank closed; DINB created (March 10, 2023)](https://www.fdic.gov/news/press-releases/2023/pr23016.html), assets, deposits, insured access, advance dividend, official checks and loan payments
- [FDIC: Silicon Valley Bridge Bank receives all deposits (March 13, 2023)](https://www.fdic.gov/news/press-releases/2023/pr23019.html), the bridge bank and full deposit transfer
- [FDIC: First-Citizens acquires Silicon Valley Bridge Bank (March 26, 2023)](https://www.fdic.gov/news/press-releases/2023/pr23023.html), the sale terms and estimated cost
- [FDIC: Signature Bank closed; Signature Bridge Bank (March 12, 2023)](https://www.fdic.gov/news/press-releases/2023/pr23018.html), assets and deposits
- [FDIC: Flagstar acquires Signature Bridge Bank deposits (March 19, 2023)](https://www.fdic.gov/news/press-releases/2023/pr23021.html), the excluded digital asset deposits and estimated cost
- [FDIC: JPMorgan Chase acquires First Republic Bank (May 1, 2023)](https://www.fdic.gov/news/press-releases/2023/pr23034.html), assets, deposits, loss share, estimated cost and reopened offices
- [FDIC: Oversight of Prudential Regulators, testimony (May 16, 2024)](https://www.fdic.gov/news/speeches/2024/oversight-prudential-regulators), the $23.6 billion combined cost and the $20.4 billion attributable to uninsured depositors
- [FDIC: Resolutions Handbook](https://www.fdic.gov/bank-failures/resolutions-handbook.pdf), resolution timing, bridge banks, payouts and post-closing settlement
- [FDIC: Payment to depositors](https://www.fdic.gov/bank-failures/payment-depositors), transfers to assuming banks, direct deposits, checks and uninsured claims
- [FDIC: Failed Bank List](https://www.fdic.gov/bank-failures/failed-bank-list), failures and acquirers since 2023
- [FDIC: Options for Deposit Insurance Reform (May 1, 2023)](https://www.fdic.gov/analysis/options-deposit-insurance-reforms), limited, unlimited and targeted coverage
- [FDIC: Quarterly Banking Profile, Second Quarter 2026](https://www.fdic.gov/quarterly-banking-profile), the DIF balance, reserve ratio and problem banks

**Filings**

- [Regions Financial: 4Q25 earnings release](https://s202.q4cdn.com/476346942/files/doc_financials/2025/q4/4Q25-Earnings-Press-Release_For-Website.pdf), the FDIC assessment decrease from the special assessment update
