+++
title = "Deposit Insurance"
description = "FDIC and NCUSIF coverage: ownership categories, the 2024 trust rule, pass-through and 330.5 records, the custodial proposal and computing insured amounts."
category = "Banking & Lending Industry"
order = 2414
part = "Deposits"
tags = ["banking", "deposits", "deposit-insurance", "fdic", "ncua", "pass-through"]
+++

Deposit insurance is a calculation the government promises to run the day a bank fails. The rule fits in a sentence, "$250,000 per depositor, per FDIC-insured bank, for each account ownership category", and every word in it is a join: *depositor* means resolving every account to the people and entities who own it, *per bank* means all of a bank's branches and brands together, and *ownership category* means sorting each account into one of a fixed set of legal capacities, each with its own formula. The same amount of money can be fully insured or a third uninsured depending on how the accounts are titled and what the bank's records say. Credit unions have the same structure through the National Credit Union Share Insurance Fund (NCUSIF), run by the NCUA.

Two limits frame everything below. Insurance covers deposits (checking, NOW, savings, money market deposit accounts, CDs, cashier's checks and money orders the bank issued) and nothing else: not securities, mutual funds, annuities, Treasuries, safe deposit box contents or crypto assets, even when an insured bank sells them. And it pays only when an insured bank fails. It doesn't protect anyone from the failure of a fintech, a broker or a middleware company standing between them and the bank, which is the whole problem of pass-through coverage.

This chapter is the bank's and the depositor's view. A payment provider's FBO account, and why its ledger decides whether pass-through coverage is real, is in [Treasury & Bank Operations](/books/payments/treasury#fbo-accounts-and-pass-through-insurance); the per-owner subledger and its daily reconciliation are in [Program Ledgers & the Synapse Lesson](/books/banking-and-lending/program-ledgers); what happens on the failure weekend is in When Banks Fail.

## How the Platforms Do It

Fintechs that hold customer money at banks describe their coverage in public terms, as of October 2026:

| Platform | Where the money sits | What it says about insurance |
| --- | --- | --- |
| **Cash App** (Block) | Card account at Sutton Bank, limited to the customer's Cash App funds | "Your funds may be eligible for FDIC pass-through insurance", with the details in the Cash App terms; the bank isn't a party to them |
| **Chime** | The Bancorp Bank, N.A. or Stride Bank, N.A. | "Chime is a financial technology company, not a bank"; "Chime is not FDIC-insured"; banking services from the two member banks |
| **Mercury** | Choice Financial Group and Column N.A., and their sweep networks | "Up to $5M in FDIC insurance"; "Mercury is a fintech company, not an FDIC-insured bank"; "Deposit insurance covers the failure of an insured bank" |
| **Wealthfront** | Swept to as many as 32 program banks at a time | "Up to $8M in FDIC insurance eligibility through program banks" ($16 million joint); "Wealthfront isn't a bank" |

The pattern is the regulation's, not a marketing choice. The FDIC's misrepresentation rule in 12 CFR 328.102 makes a nonbank that talks about deposit insurance "clearly and conspicuously disclose" that it isn't an insured institution, that "FDIC insurance only covers the failure of the FDIC-insured depository institution", that "certain conditions must be satisfied for pass-through deposit insurance coverage to apply", and which insured banks hold the money; leaving the banks out is itself an omission under the rule. The multi-million figures are arithmetic, not a bigger limit: $250,000 per bank per category, multiplied by the number of program banks a sweep spreads the balance across. Whether those dollars are insured depends on the same records as any other pass-through account, and on the sweep having actually placed no more than the limit at each bank, which is the business of [Sweeps, Reciprocal Deposits & Yield](/books/banking-and-lending/sweeps-and-yield).

## The Ownership Categories

The categories, with the rule in 12 CFR 330 that sets each one's coverage:

| Category | Coverage | What qualifies, and what trips people up |
| --- | --- | --- |
| **Single** (330.6) | $250,000 per owner, all single accounts added together | One owner and no beneficiaries. A sole proprietorship's business accounts count as the owner's single accounts; so do community property funds in one spouse's name. A deceased person's or estate's accounts are insured separately from the executor's and heirs' own |
| **Joint** (330.9) | $250,000 per co-owner, each owner's shares of all joint accounts added together | Every co-owner a natural person, each with withdrawal rights "on the same basis", and each having signed the signature card (electronically counts, or records show each can access or has used the account). CDs and accounts opened by an agent or custodian are exempt from the signature test. Shares are equal unless the records say otherwise. An account that fails the test is split into each owner's single coverage |
| **Certain retirement accounts** (330.14) | $250,000 per participant, all such accounts added together | IRAs under section 408(a), section 457 plans, and self-directed individual account plans, regardless of the number of beneficiaries |
| **Trust** (330.10) | $250,000 per eligible beneficiary per owner, up to five: at most $1,250,000 per owner for all trust accounts at the bank | Informal revocable trusts (payable on death, "in trust for"), formal revocable trusts and irrevocable trusts, one formula since April 1, 2024 |
| **Employee benefit plan** (330.14) | $250,000 for each participant's non-contingent interest | Pass-through to participants, not one limit for the plan |
| **Corporation, partnership, unincorporated association** (330.11) | $250,000 per entity | Only if it's "engaged in any independent activity"; otherwise its deposits are treated as its owners' |
| **Government** | $250,000 per official custodian | Coverage follows the custodian of the public funds, not the public unit as a whole |

Two rules apply across categories. The insured **amount of a deposit** includes principal and interest unconditionally credited plus interest accrued to the day the bank fails (330.3(i)), so a CD sitting exactly at $250,000 is over the limit by its accrued interest. And **a death doesn't change coverage for six months** (330.3(j)): accounts are insured as if the owner were alive until the estate restructures them or the six months run out, after which coverage follows actual ownership.

### The 2024 Trust Rule

Until 2024 revocable and irrevocable trusts had different, notoriously complicated rules. The FDIC's final rule of January 28, 2022 merged them into one trust category, effective April 1, 2024, and the formula is now:

> owners × distinct eligible beneficiaries (at most five per owner) × $250,000

- **Eligible beneficiaries** are natural persons, charities and other nonprofits recognized under the Internal Revenue Code. The grantor isn't one, and neither is anyone who takes only if a named beneficiary dies: contingent beneficiaries don't count.
- **Allocation doesn't matter.** A beneficiary named for 1% counts the same as one named for 99%, which is the simplification: the bank doesn't need the trust's distribution terms to compute coverage.
- **All of an owner's trust accounts at the bank are aggregated,** informal and formal, revocable and irrevocable, and the five-beneficiary cap applies to the total.
- **Informal trusts need the beneficiaries in the bank's records.** For a POD account, the beneficiaries "must be specifically named in the deposit account records".
- **It applied to existing accounts,** CDs included, whenever they were opened, which is why depositors with more than five beneficiaries or more than $1.25 million in trust accounts at one bank lost coverage on the effective date without changing anything.

Credit unions are on a later clock. The NCUA adopted the same simplification in September 2024 (89 FR 79397), effective December 1, 2026: from that date, a credit union member's trust shares are insured up to $250,000 per beneficiary, $1,250,000 at most for five or more. A core serving credit unions has to switch its insured-amount logic on that date, and any share certificate maturing after it should be checked against the new cap before then.

## Pass-Through Coverage

A deposit held by an agent, custodian or fiduciary for others can be insured as if each owner had deposited their share directly (330.7), so 10,000 customers of one fintech in one FBO account can each have their own $250,000. The FDIC recognizes the arrangement only if two conditions hold (330.5): the custodial relationship is **expressly disclosed** in the bank's deposit account records (the account title says "for the benefit of" or an equivalent), and each owner's identity and interest are **ascertainable** from the bank's records or from records the depositor or its agent keeps "in good faith and in the regular course of business". Multi-tier arrangements disclose each tier. [Treasury & Bank Operations](/books/payments/treasury#fbo-accounts-and-pass-through-insurance) is the provider's side of this; the bank's side is that if the records fail, the FBO account may be insured as a single $250,000 deposit of the fintech.

Each beneficial owner's share is then insured in the category that fits it and aggregated with that owner's other deposits at the same bank. A customer with $200,000 in a fintech's FBO account and $100,000 in a savings account at the same partner bank is a single-category depositor with $300,000 at one bank, of which $50,000 is uninsured, however separate the two products feel.

Synapse showed what ascertainable looks like when it fails. After the middleware company's 2024 bankruptcy, its partner banks couldn't reconcile its records, consumers lost access to their money for months, and the FDIC proposed a recordkeeping rule for custodial accounts with transactional features on October 2, 2024 (RIN 3064-AG07): per-owner records in a standard file layout with each owner's balance and ownership category, kept by the bank or by a third party whose records the bank can reach directly and continuously even if that third party fails; reconciliation to the account balance at the close of every business day; and an annual certification to the FDIC. Comments closed January 16, 2025. As of October 29, 2026, the Federal Register shows the proposal and the extension of its comment period, and neither a final rule nor a withdrawal; the FDIC did not include it among the proposals it withdrew on March 3, 2025. The design the proposal describes is in [Program Ledgers & the Synapse Lesson](/books/banking-and-lending/program-ledgers), and my advice for a bank is the same as Payments gives a provider: require it of every program now.

## Credit Unions

Federally insured credit unions carry NCUSIF share insurance at the same $250,000 standard maximum, with categories that parallel the FDIC's in 12 CFR 745 and the trust change above taking effect December 1, 2026. The data model doesn't need a second design: the institution's insurer is an attribute of the `institutions` row, and the category rules are versioned by insurer and effective date.

## How a Bank Computes Insured Amounts

For most banks, the FDIC computes coverage after a failure from the bank's records. The largest banks have to be able to do it themselves. Under 12 CFR 370, a bank with 2 million or more deposit accounts in two consecutive quarters (a "covered institution") must have systems that, within 24 hours after the FDIC is appointed receiver, can accurately calculate the insurance coverage of each deposit account under Part 330, produce output files in the format Part 370's Appendix B specifies, restrict access to some or all of the deposits in an account, and debit each account's uninsured amount. A newly covered bank has three years to comply.

That list is a specification for any system that wants to know its own exposure, at any size:

1. **Resolve depositors.** Every account's parties resolve to persons and entities across products, brands and acquired banks, by tax ID and identity attributes, never by name strings ([Record Linkage](/docs/architecture/record-linkage)). A bank that can't tell that two customer records are one person overstates coverage.
2. **Assign each account a category** from its title and parties: the `ownership_category`, derived and checked, not chosen. A joint account whose second owner never signed or never had access is single coverage for each owner.
3. **Split each account into owner interests:** equal shares for joint accounts unless the records say otherwise; one interest per beneficial owner for pass-through accounts, from the subledger; one interest per participant for benefit plans.
4. **Aggregate by owner and category** across the whole charter, with accrued interest to the determination date.
5. **Apply the category's formula,** including the trust formula's distinct-beneficiary count across all of an owner's trust accounts.
6. **Allocate the uninsured amount back to accounts,** because the debit and the hold land on accounts, not on people. Part 370 leaves the allocation method to the rules in Part 330; a bank needs a documented, deterministic order.

Run daily, the same calculation is the bank's estimate of uninsured deposits, which is the number a run is made of. When Banks Fail has SVB's, which was about 94% of its deposits at the end of 2022.

## Worked Numbers: One Family at One Bank

Ana and Ben are married; Carmen is Ana's mother. Ana owns a consulting company, a corporation with its own business. Their accounts at one insured bank on the day it fails:

| Account | Category | Balance |
| --- | --- | --- |
| Ana's checking | Single | $180,000 |
| Ana's CD | Single | $95,000 + $1,200 accrued interest |
| Ana and Ben's savings | Joint | $420,000 |
| Ana and Carmen's checking | Joint | $100,000 |
| Ana's POD account naming her three children | Trust | $900,000 |
| Ana's revocable living trust: the three children and two charities | Trust | $600,000 |
| Ana's IRA CD | Certain retirement | $310,000 |
| Ana's company's operating account | Corporation | $400,000 |
| Ben's savings | Single | $40,000 |

Category by category:

- **Ana, single:** $180,000 + $96,200 = $276,200. Insured $250,000; **uninsured $26,200**. The accrued interest is what pushed the CD's share over.
- **Joint:** each co-owner's interest is an equal share. Ana: $210,000 + $50,000 = $260,000, insured $250,000, **uninsured $10,000**. Ben: $210,000, insured. Carmen: $50,000, insured.
- **Ana, trust:** both trusts are aggregated, and the distinct beneficiaries across them are the three children plus two charities: five. Limit 5 × $250,000 = $1,250,000 against $1,500,000; **uninsured $250,000**. Had the living trust named only the children, the distinct count would be three, the limit $750,000, and $750,000 uninsured. Naming the same children twice adds nothing; naming new beneficiaries adds coverage up to the fifth.
- **Ana, retirement:** $310,000 against $250,000; **uninsured $60,000**.
- **Ana's company:** $400,000 against $250,000 for the corporation, separate from Ana's own coverage; **uninsured $150,000**.
- **Ben, single:** $40,000, insured. His joint share doesn't count against it, because it's a different category.

| Depositor | Deposits | Insured | Uninsured |
| --- | --- | --- | --- |
| Ana | $2,346,200 | $2,000,000 | $346,200 |
| Ana's company | $400,000 | $250,000 | $150,000 |
| Ben | $250,000 | $250,000 | $0 |
| Carmen | $50,000 | $50,000 | $0 |
| **Total** | **$3,046,200** | **$2,550,000** | **$496,200** |

Two restructurings would have insured almost all of it, both legitimate: moving the excess to a second bank, or putting it through a reciprocal deposit network that does the same thing automatically. The calculation itself never gets more generous than the categories allow, which is why a determination engine is a set of formulas over correctly titled accounts, and why the titling at account opening is where coverage is actually decided.

## How to Build It

These are deltas against [the core data model](/books/banking-and-lending/banking-business#the-core-data-model). `accounts.ownership_category` and the roles in `account_parties` already exist; insurance needs the facts that decide the category, and a stored determination.

```sql
ALTER TABLE institutions
  ADD COLUMN insurer TEXT NOT NULL CHECK (insurer IN ('fdic', 'ncusif', 'none'));  -- 'none': trust banks

ALTER TABLE account_parties
  ADD COLUMN withdrawal_rights_equal BOOLEAN,       -- joint test, 330.9
  ADD COLUMN signature_evidence      TEXT CHECK (signature_evidence IN ('signed', 'esigned', 'access_or_use', 'exempt')),
  ADD COLUMN beneficiary_eligible    BOOLEAN,        -- natural person or IRC charity or nonprofit
  ADD COLUMN beneficiary_contingent  BOOLEAN NOT NULL DEFAULT FALSE;  -- takes only if another dies: not counted

CREATE TABLE insurance_determinations (     -- one run: daily estimate or failure-date determination
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  institution_id   UUID NOT NULL REFERENCES institutions (id),
  as_of            DATE NOT NULL,
  rule_version     TEXT NOT NULL,             -- e.g. 'fdic-330:2024-04-01', 'ncusif-745:2026-12-01'
  kind             TEXT NOT NULL CHECK (kind IN ('estimate', 'part_370', 'receivership')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE insurance_lines (              -- one per depositor, category and account interest
  determination_id UUID NOT NULL REFERENCES insurance_determinations (id),
  party_id         UUID NOT NULL REFERENCES parties (id),      -- the resolved owner
  category         TEXT NOT NULL CHECK (category IN ('single', 'joint', 'retirement', 'trust',
                                        'employee_benefit', 'business', 'government')),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  interest_amount  BIGINT NOT NULL,           -- this owner's share, incl. accrued interest, minor units
  insured_amount   BIGINT NOT NULL,           -- after the category limit, allocated back to the account
  uninsured_amount BIGINT NOT NULL,
  basis            JSONB NOT NULL,            -- beneficiaries counted, joint share, pass-through source record
  CHECK (insured_amount + uninsured_amount = interest_amount),
  PRIMARY KEY (determination_id, party_id, category, account_id)
);
```

The determination is a pure function of the accounts, parties, balances and rule version as of a date, so it's recomputable: an estimate run every night and a determination run on a failure date use the same code and differ only in `kind`. For pass-through accounts, `interest_amount` comes from the program's per-owner balance file for that date, and a file that doesn't reconcile to the FBO account balance stops the run with an error rather than producing coverage for money nobody can place. Holds and debits for the uninsured portion, if it comes to that, are `holds` rows (which needs an `insurance_determination` value added to `holds.reason`) and journal entries against each account, never balance edits. Joint shares use `account_parties.share` where the records state one, equal shares otherwise; the owners behind a custodial account are its `beneficial_owner` parties, with their balances from the program file.

## Auditing

Deposit insurance is audited by the FDIC or NCUA after a failure, and before one by examiners checking Part 370 readiness, signage and advertising, and pass-through recordkeeping. Keep:

- **The evidence behind each category,** as recorded at opening and on every change: signature cards or their electronic equivalent, access records for joint owners, beneficiary designations with their dates, trust certifications ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).
- **Every determination run** with its rule version, inputs and output, so an estimate published to the board or a regulator can be reproduced.
- **Per-owner files for pass-through accounts,** as received each day, with the reconciliation to the FBO balance and every break.
- **Insurance statements made to customers:** the FDIC signs and disclosures shown in each channel, and for programs, the nonbank disclosures 328.102 requires, by version and date. The FDIC's 2026 amendments to its digital and ATM signage rule (91 FR 3801) take effect March 2, 2026, with compliance required by April 1, 2027.

## What This Means for the System You Build

- **The category is derived from facts the system stores,** title, parties, signatures, beneficiaries and entity type, and validated against them; a category nobody can justify from the records is a coverage error waiting for a failure.
- **Depositors are resolved across the whole charter,** every brand, product and acquired book, by identity, before anything is summed.
- **Insurance rules are versioned by insurer and effective date:** FDIC trust accounts changed on April 1, 2024; credit union trust shares change on December 1, 2026.
- **Run the determination nightly,** the Part 370 way, whether or not the bank is covered by Part 370; it's the uninsured-deposit number the treasury and the board need anyway.
- **Pass-through coverage is a reconciliation,** checked daily against the program's per-owner records, never a statement in the marketing copy.

## References

**Law and regulation**

- [12 CFR 330.3: General principles](https://www.law.cornell.edu/cfr/text/12/330.3), ownership rights and capacities, the amount of a deposit including accrued interest, and six months' coverage after a death
- [12 CFR 330.5: Recognition of deposit ownership and fiduciary relationships](https://www.law.cornell.edu/cfr/text/12/330.5), express disclosure and ascertainable interests for pass-through coverage
- [12 CFR 330.6: Single ownership accounts](https://www.law.cornell.edu/cfr/text/12/330.6), sole proprietorships, community property and decedents' accounts
- [12 CFR 330.7: Accounts held by an agent, nominee, guardian, custodian or conservator](https://www.law.cornell.edu/cfr/text/12/330.7), insured as if deposited by the principals
- [12 CFR 330.9: Joint ownership accounts](https://www.law.cornell.edu/cfr/text/12/330.9), qualification, the signature and access tests, equal shares and aggregation
- [12 CFR 330.10: Trust accounts](https://www.law.cornell.edu/cfr/text/12/330.10), eligible beneficiaries, the five-beneficiary maximum, aggregation and named POD beneficiaries
- [12 CFR 330.11: Accounts of a corporation, partnership or unincorporated association](https://www.law.cornell.edu/cfr/text/12/330.11), the independent activity requirement
- [12 CFR 330.14: Retirement and other employee benefit plan accounts](https://www.law.cornell.edu/cfr/text/12/330.14), IRAs, 457 plans and self-directed plans, per-participant coverage
- [12 CFR 370.2](https://www.law.cornell.edu/cfr/text/12/370.2) and [12 CFR 370.3](https://www.law.cornell.edu/cfr/text/12/370.3), covered institutions with 2 million or more deposit accounts and the 24-hour calculation, hold and debit capabilities
- [12 CFR 328.102: Misrepresentation of insured status](https://www.law.cornell.edu/cfr/text/12/328.102), the disclosures required of nonbanks that describe deposit insurance
- [12 CFR 745.4: NCUA revocable trust accounts](https://www.law.cornell.edu/cfr/text/12/745.4), the credit union rule before its December 1, 2026 amendment

**Regulators and guidance**

- [FDIC: Understanding Deposit Insurance](https://www.fdic.gov/resources/deposit-insurance/understanding-deposit-insurance), the $250,000 rule, what is and isn't covered, EDIE and BankFind
- [FDIC: Deposits at a Glance](https://www.fdic.gov/resources/deposit-insurance/brochures/deposits-at-a-glance), coverage by category and the 2024 trust rule's application to existing accounts and CDs
- [Federal Register: Simplification of Deposit Insurance Rules (FDIC final rule, January 28, 2022)](https://www.federalregister.gov/documents/2022/01/28/2022-01607/simplification-of-deposit-insurance-rules), one trust category for revocable and irrevocable trusts
- [Federal Register: Recordkeeping for Custodial Accounts (FDIC proposed rule, October 2, 2024)](https://www.federalregister.gov/documents/2024/10/02/2024-22565/recordkeeping-for-custodial-accounts), per-owner records, daily reconciliation, certification and the Synapse background
- [Federal Register: FDIC documents on custodial accounts](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=%22custodial+accounts%22&conditions[agencies][]=federal-deposit-insurance-corporation&order=newest), checked October 29, 2026: the proposal and its comment extension, no final rule or withdrawal
- [FDIC: Board withdraws four outstanding proposed rules (March 3, 2025)](https://fdic.gov/news/press-releases/2025/fdic-board-directors-withdraws-four-outstanding-proposed-rules), the custodial proposal not among them
- [Federal Register: FDIC Official Signs and Advertisement of Membership (91 FR 3801, January 29, 2026)](https://www.federalregister.gov/documents/2026/01/29/2026-01806/fdic-official-signs-advertisement-of-membership-false-advertising-misrepresentation-of-insured), digital and ATM signage amendments effective March 2, 2026
- [NCUA: Board approves simplification of share insurance for trust accounts](https://ncua.gov/newsroom/press-release/2024/board-approves-final-rules-fair-hiring-banking-and-simplification-share-insurance-trust-accounts), effective December 1, 2026, aligned with the FDIC
- [Federal Register: NCUA Simplification of Share Insurance Rules (89 FR 79397, September 30, 2024)](https://www.govinfo.gov/content/pkg/FR-2024-09-30/pdf/2024-21888.pdf), the credit union trust accounts category
- [MyCreditUnion.gov: Trust rule fact sheet](https://mycreditunion.gov/about/news-blog/trust-rule-fact-sheet-changes-ncua-share-insurance-coverage), $250,000 per beneficiary and the $1,250,000 cap from December 1, 2026
- [Federal Reserve: Review of the supervision and regulation of Silicon Valley Bank](https://www.federalreserve.gov/publications/files/svb-review-20230428.pdf), about 94% of deposits uninsured at year-end 2022

**Vendor documentation**

- [Cash App: Card agreement](https://cash.app/legal/us/en-us/card-agreement), Sutton Bank as the bank party and funds that "may be eligible for FDIC pass-through insurance"
- [Chime: SpotMe](https://www.chime.com/spotme/), disclosures naming The Bancorp Bank and Stride Bank and stating Chime is not a bank or FDIC-insured
- [Mercury: Pricing](https://mercury.com/pricing), up to $5M of coverage through partner banks' sweep networks and the not-a-bank statement
- [Wealthfront: Cash Account](https://www.wealthfront.com/cash), up to $8M through as many as 32 program banks

**In practice**

- [DWT: FDIC finalizes digital signage and advertising rule](https://www.dwt.com/blogs/financial-services-law-advisor/2026/02/fdic-finalizes-digital-signage-advertising-rule), compliance by April 1, 2027 and where the digital sign must appear
