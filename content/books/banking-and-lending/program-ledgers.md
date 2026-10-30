+++
title = "Program Ledgers & the Synapse Lesson"
nav_title = "Program Ledgers & Synapse"
description = "FBO accounts and per-owner subledgers, daily reconciliation against the bank's core, Synapse as an engineering post-mortem, and the FDIC custodial proposal."
category = "Banking & Lending Industry"
order = 2426
part = "Fintech and BaaS"
tags = ["banking", "baas", "ledger", "reconciliation", "fbo", "synapse"]
+++

When a fintech program pools its customers' money in one account at a bank, the bank's core knows one balance and the program's ledger knows ten thousand. The FBO (for-benefit-of) account is titled for the customers and holds their money in aggregate; the subledger above it says whose each dollar is. If the two agree to the cent every night, each customer is insured as though they had their own account and can be paid if anything fails. If they don't, nobody can say who owns what, and the money waits until someone works it out by hand.

In May 2024 that happened at scale. Synapse Financial Technologies, a middleware company keeping the subledger for dozens of fintech programs across several banks, stopped operating weeks after filing for bankruptcy, and its partner banks froze about $219 million belonging to end users while they tried to reconcile its records with their own. Some customers waited more than eight months; the shortfall, estimated at $65 million to $96 million, was never fully explained. This chapter is the design of a program ledger and its daily reconciliation, then Synapse as an engineering post-mortem from the court record, then what the FDIC's custodial accounts proposal would require. The insurance rule behind all of it is in [Pass-Through Coverage](/books/banking-and-lending/deposit-insurance#pass-through-coverage); a payment provider's FBO account is in [FBO Accounts and Pass-Through Insurance](/books/payments/treasury#fbo-accounts-and-pass-through-insurance); the arrangements between bank, middleware and program are in [Banking as a Service](/books/banking-and-lending/banking-as-a-service).

## How the Platforms Do It

Where the per-customer record lives, and what the bank sees, as documented publicly (as of October 2026):

| Platform | Per-customer record | What the bank sees | Reconciliation |
| --- | --- | --- | --- |
| **Column** | The bank's own ledger: it is the core | Every account | Internal to the bank; settlement reports in files for programs |
| **Synctera** | Synctera's subledger, with an account and routing number per sub-account | "One account balance for all of the accounts within the program" | Daily account and transaction files from the bank; the bank updates FBO balances in its core and reconciles in Synctera's platform with auto-matching |
| **Unit** | Unit's ledger: balances "calculated in real-time from an append-only list of Transactions"; wallet accounts are FBO and "aren't bank accounts" | The FBO account (for wallets) or individual deposit accounts | Not described in the public overview |
| **Synapse** (to 2024) | Synapse's ledger on MongoDB and AWS, the only per-user record for its omnibus accounts | A dashboard and a daily general ledger report (Evolve) | No per-owner reconciliation the banks could run themselves; a deficit "of tens of millions of dollars" was known by September 2023 |

The pattern is the regulation's: a pooled account is fine, a pooled account whose owners only the middleware can name is the failure the FDIC's proposal is written against.

## The Accounts on the Bank's Core

A program on an omnibus structure is a small set of accounts at the bank, whatever the app shows. Synctera's published structure is the clearest public example:

- **The FBO account,** titled for the benefit of the program's customers, which "holds the aggregate of end customer funds only." Each customer sub-account has its own account and routing numbers in the subledger and is a beneficial interest in this one account on the core.
- **A settlement account,** through which card, ACH, wire and other external activity enters and leaves the program. It is reconciled to the network and Federal Reserve settlement each day, and the day's net moves into or out of the FBO.
- **A reserve account** against fraud losses, $25,000 initially in Synctera's model ([Reserves and Credit Enhancement](/books/banking-and-lending/banking-as-a-service#reserves-and-credit-enhancement)).
- **An operating account,** the program's own money: revenue such as interchange, incentives it pays to customers, and the cash it uses to cover shortfalls.
- **Adjustment accounts** for P&L, fraud and interest.

Two rules make the structure insurable. The FBO's title and the bank's records must "expressly disclose" that it holds others' money, and the program's own money must never be in it, because commingling makes the owners' interests impossible to ascertain (12 CFR 330.5; [The Accounts You Run](/books/payments/treasury#the-accounts-you-run) has the same rule for a payment provider).

## The Subledger

The program's ledger is a double-entry ledger in which each customer's sub-account is a liability of the FBO, and the sum of the sub-accounts is what the FBO should hold. The playbook's [Double-Entry Ledger](/docs/payments/payment-states#double-entry-ledger) rules apply as they do to the bank's own books, with three additions that come from being one level removed from the money:

- **Every entry names the bank account it moves.** A credit to a customer from an ACH deposit is cash arriving in the settlement account; a card purchase is a future drawdown of the FBO; an internal transfer between two customers moves nothing at the bank. The ledger records which bank account each entry will touch and when, so in-transit amounts are positions, not guesses.
- **Money between banks is two entries at two institutions.** A program spread across several banks, or a sweep to more banks for insurance, has one FBO per bank, and each customer's balance is the sum of their interests in each. The subledger must say how much of each customer's money is at each bank on each day, because insurance is per bank and so is the payout if one fails.
- **Interest, rebates and fees the bank posts to the FBO belong to someone.** Interest credited to the pool must be allocated to customers or to the program by a rule in the program agreement, on the day it posts. Unallocated interest is cash with no owner in the records, and at Synapse it was about $31 million of the uncertainty ([The Money](#the-money)).

Balances are computed from entries, never stored as editable numbers. Unit describes its balances as calculated from an append-only list of transactions, which is the property a reconciliation needs: any day's per-owner balance can be recomputed from the entries as of that day.

## Daily Reconciliation

Every business day, after the bank's end of day, three totals must agree: the FBO account's balance on the bank's core, the sum of every owner's balance in the subledger, and the in-transit items that explain the difference between them. Synctera's guide for its banks shows the mechanics:

1. **The bank sends its files.** An accounts file and a transactions file each day, to a shared location, so the platform can show the bank's view beside the subledger.
2. **The bank posts the day's movements to the FBO** in its core: the ACH net sweep from the settlement account once it matches the Federal Reserve settlement ("now the FinTech is balanced for ACH"), and the card settlement drawdown, computed as the card amounts less network interchange plus currency conversion fees (its example: $1,782.61 = $1,815.40 − $36.42 + $3.63).
3. **The platform updates its mirror accounts** to the FBO balances the bank posted.
4. **The bank reconciles,** with auto-matching, and investigates any difference.

The FDIC's custodial accounts proposal states the same requirement as a rule: reconciliation against the beneficial ownership records "no less frequently than at the close of business daily", allowing for unposted and timing variances under standard banking practice. My rule is stricter about what counts as explained: every in-transit amount must be an itemized list of entries that will clear on a known date, and anything else is a break that the program funds from its operating account the same day while it's investigated, so the FBO never holds less than the owners are owed.

## Worked Numbers: One Night's Reconciliation

A worked example of my own. At the end of a business day, one program's records show:

| Line | Amount |
| --- | ---: |
| FBO ledger balance on the bank's core | $50,416,500.00 |
| Less: interest the bank credited to the FBO today, not yet allocated to owners | − $4,200.00 |
| Plus: ACH credits posted to owners today, still in the settlement account until tomorrow's sweep | + $18,250.00 |
| Less: card purchases debited from owners today, drawdown from the FBO tomorrow | − $2,000.00 |
| **Expected sum of owner balances** | **$50,428,550.00** |
| Sum of owner balances in the subledger | $50,431,880.00 |
| **Unexplained: owners are owed more than the bank holds** | **$3,330.00** |

Three of the four reconciling lines are timing and will clear on known dates; the interest is money with a rule, allocated tonight. The $3,330 is a break. The program wires $3,330 from its operating account into the FBO before the bank's cutoff, books it as a receivable from whatever investigation finds (a duplicated credit, a returned ACH posted to the bank but not the subledger, a card reversal missed), and the owners are whole while it's worked.

The arithmetic is trivial; the discipline isn't. A $3,330 gap left unexplained for a night is a break. Left for a year across many programs, on a ledger that the banks see only as a summary, it is the deficit Evolve and Synapse each knew about by September 2023 and still disputed when Synapse filed in April 2024.

## Synapse: A Post-Mortem

What follows is from the court record: the CFPB's complaint in the bankruptcy court, the Chapter 11 trustee's status reports, and the CFPB's and California DFPI's later notices. Where they disagree or are silent, I say so.

### The structure

Synapse sold fintech platforms an API for accounts, cards and payments, and banks the platforms' customers. Evolve Bank & Trust was its first partner bank, under a bank services agreement of April 18, 2017 and a master agreement of September 23, 2022; until the summer of 2023, Synapse gave consumers Evolve's deposit agreement. Evolve held end users' money in FBO accounts and in individual demand deposit accounts, issued the debit cards and received ACH on its routing number.

In 2023 Synapse added a **Cash Management Program**, marketed to platforms as a way to offer "increased FDIC deposit insurance through Synapse's sweeps program and partnership with multiple banks." Its broker-dealer subsidiary, Synapse Brokerage LLC, opened omnibus accounts in its own name for the benefit of end users at several banks; AMG National Trust Bank took sweep deposits from August 2023. From October 2023, for platforms that joined, Synapse moved end users' funds from Evolve to Synapse Brokerage and on to the other banks. Evolve still sponsored those customers' debit cards and still received their direct deposits on its routing number, and Synapse swept the funds onward. Lineage Bank originated their ACH and wire transfers on Synapse's instructions.

By then one customer's dollar could be received at Evolve, held at AMG, and sent from Lineage, and the only system that knew all three was Synapse's ledger. The complaint puts it as Synapse being "responsible for tracking the location of individual End User funds across Synapse Brokerage; AMG and other Partner Banks that held End User funds in omnibus accounts; Evolve; and Lineage", and for "providing the banks access to data and records regarding End User activity." Each bank saw its own accounts; none saw the whole.

### Before the filing

By September 2023 at the latest, "both Evolve and Synapse were aware that there was a deficit of tens of millions of dollars in funds that Evolve was holding for End Users"; each publicly blamed the other. The deficit was still unresolved on April 22, 2024, when Synapse filed for Chapter 11 in the Central District of California (No. 1:24-bk-10646-MB) with a buyer lined up. The buyer required the Evolve balances to be fully funded as a condition; Synapse and Evolve couldn't agree, and the sale didn't happen.

### The freeze

On May 11, 2024 Synapse failed to keep Evolve's access to the dashboard through which Evolve saw end users' balances and transactions, and stopped sending the general ledger reports it had sent Evolve daily. Evolve froze all end-user activity the same day, and Lineage did too. End users couldn't use their cards, withdraw, pay bills or receive direct deposits. On May 15 the US Trustee moved to convert the case or appoint a trustee; on May 17 Synapse sent each bank its records of how much the bank held for each end user; on May 24 the court appointed Jelena McWilliams as Chapter 11 trustee.

The May 17 file became the reference point for everything after: it is the balance date the CFPB later used for victims' eligibility. It was also inconsistent with the banks' own records. Evolve found its records for Cash Management Program customers didn't match it and hired a consultant; Lineage found the same and hired a former Synapse employee; both reconciled from their own records, Federal Reserve records, and whatever the trustee could provide.

### Reconciling after the fact

The trustee's reports describe what reconstructing a ledger looks like after its operator has gone:

- **Getting the data at all.** The ledger lived on MongoDB and AWS, and the trustee had to obtain access to the company's AWS, Slack, Google Workspace, GitHub and Atlassian accounts from former officers and employees. With the help of a former Synapse engineer, Lineage backed up the core Synapse database, restored and validated it on an independent MongoDB instance, gave every partner bank read-only access, and generated nearly 40 million end-user monthly statements for April and May 2024.
- **Paying to keep it.** The estate had no money; the trustee worked to cut the database bills by about 75% while banks still needed access, preserved cold-storage copies, offered the data to regulators and private parties ("no entity to date has agreed to view, investigate or take over the data due to the expense and complexities"), and by February 2025 was relying on a ledgering company's pro bono help for even a limited reconciliation.
- **The open items.** The July 2024 report listed what remained: FBO funds at Evolve and Lineage, interest and reserve funds whose owners weren't clear, unsettled card transactions across banks, and program overdrafts and negative balances owed to banks or the estate.

### The money

| Bank | Held for end users, May 2024 | Paid out by February 2025 (trustee's 15th report) |
| --- | ---: | --- |
| AMG National Trust | $110,290,040 | $109,992,923 (about 99%) |
| Lineage Bank | $62,094,379 | $59,112,562 (about 95%) |
| Evolve, demand deposit accounts | about $6.0 million held on May 24, 2024 (fifth report) | $9,563,888, more than the amount first reported |
| Evolve, FBO accounts | $46,926,558 | Not reported; initial payments made by December 19, 2024 to all end users its own reconciliation showed were due |
| American Bank | about $42,000 of potential commercial end-user funds | Nothing paid; still investigating |

The banks' total was about $219 million frozen. The shortfall between the cash in the FBO accounts and Synapse's trial balance was estimated at $85 million in the trustee's first report and $65 million to $96 million by the second, the range reflecting about $31 million of interest and rebate payments held at some banks whose owners couldn't yet be determined; the CFPB's complaint cites the trustee's estimate as $60 million to $90 million. By February 2025 the trustee reported that the shortfall "existed prior to Synapse's bankruptcy" and that "the exact amounts and sources of the shortfall have not been clearly established."

One line in the July 2024 report is the most useful sentence in the record for a designer: the trustee was "not aware of any reported shortfall between cash held in DDAs at the Partner Banks and the amounts owed to DDA end users." Customers with their own accounts on a bank's core were paid. The money that went missing was in the pools.

### The end of the case

The trustee asked to dismiss the case in June 2025, with no money to pay creditors and no viable bidder for the assets, and Judge Martin Barash dismissed it on November 12, 2025. Before that, the CFPB sued Synapse in the bankruptcy court on August 21, 2025 (Adv. No. 1:25-ap-01052-MB) on one count: unfair acts or practices, "failing to maintain adequate records of the location of consumers' funds and failing to ensure those records matched the records maintained by the Partner Banks." The stipulated judgment of September 12, 2025 imposed injunctive relief, including a ban on selling customer information, and a $1 civil money penalty, which is what lets the CFPB pay victims from its Civil Penalty Fund. On November 28, 2025 the CFPB allocated $46,248,291 to eligible victims (end users with a positive balance on May 17, 2024); it added nearly $9 million in August 2026, for $55.2 million in all, with Rust Consulting as claims administrator. As of September 2026 no disbursement timeline had been published, and some Yotta customers had sued Evolve in small claims court with mixed results.

<!-- source-gap: synapse-cpf-disbursement | status | whether the CFPB has opened claims or paid Synapse victims from the Civil Penalty Fund | closes with: the CFPB's Synapse enforcement page or a CFPB release announcing claims or payments | checked: 2026-10-29 -->

### What the records couldn't say

Read as an incident report, the failure has five causes, each a design decision:

1. **One ledger of record, held by the party with the least capital.** Synapse's ledger was the only per-owner record for the pooled accounts. When the company failed, the record failed with it, and the banks, which carried the legal obligations, had to rebuild it from their own transaction history.
2. **The banks saw summaries.** Evolve received a daily general ledger report and a dashboard. A summary can show that the totals disagree; it can't say which customer is short.
3. **Money moved between banks by instruction.** Funds received at one bank's routing number were swept to accounts at other banks, and payments were sent from a third, on instructions only the middleware recorded. No bank could reconcile a customer's position, because no bank held all of it.
4. **A known break was left open.** A deficit of tens of millions was known by September 2023 and disputed for seven months before the filing. Every later problem was larger because this one was carried.
5. **Pooled income had no owner.** Interest and rebates credited to omnibus accounts weren't allocated as they arrived, so about $31 million sat in the reconciliation as money whose ownership had to be argued.

Each has a direct control: the bank holds or continuously receives the per-owner record; the record is per owner, not a summary; every inter-bank movement is recorded at both banks with the owner attached; breaks are funded and closed daily; and pooled income is allocated on the day it posts. Those are, almost line for line, what the FDIC proposed.

## What the Custodial Proposal Would Require

The FDIC proposed a new 12 CFR Part 375, Recordkeeping for Custodial Accounts, on October 2, 2024 (89 FR 80135, RIN 3064-AG07). It covers **custodial deposit accounts with transactional features**: accounts held for beneficial owners, holding "commingled deposits of multiple beneficial owners", from which a beneficial owner can direct a transfer to another party. Exempted are trust accounts, government depositors, accounts of brokers, dealers and investment advisers, IOLTA accounts, employee benefit and retirement plans, real estate and title escrow accounts, mortgage servicers' accounts, accounts where law prohibits disclosing owners, deposit placement networks not used for payments, and housing security deposits.

For accounts in scope, a bank would:

- **Keep records of each beneficial owner,** their balance and their ownership category, in a standard file with one row per owner and fields set out in an appendix: account number, account holder, the beneficial owner's account number, names, tax ID and type, an alternate identifier, address, an IRA indicator, current balance, accrued interest, and ownership right and capacity.
- **Either keep them itself or through a third party,** if the bank has "direct, continuous, and unrestricted access" to them, including during the third party's business interruption, insolvency or bankruptcy, with contracts that give the bank the rights it needs, backup records and contingency plans.
- **Reconcile daily:** "Conducting reconciliations against the beneficial ownership records no less frequently than at the close of business daily."
- **Maintain internal controls and written policies,** including over third-party arrangements, and test them at least every 12 months, with independent validation of third-party records.
- **Certify and report annually:** the chief executive officer, chief operating officer or highest-ranking official certifies compliance "within 1 year of the effective date of this part and annually thereafter", with a report on the accounts, balances, beneficial owner counts, test results and third-party validations.

The FDIC estimated that 600 to 1,100 insured institutions would be directly affected, at about 2,200 hours to set up and 1,100 hours a year to maintain, roughly $220,000 for a small bank in the first year and $110,000 a year after at its assumed $100 an hour.

As of October 29, 2026 the proposal is neither final nor withdrawn: the Federal Register shows it and the extension of its comment period to January 16, 2025, and it wasn't among the four proposals the FDIC withdrew on March 3, 2025 ([Pass-Through Coverage](/books/banking-and-lending/deposit-insurance#pass-through-coverage) tracks the status). My advice is the same from either side of the arrangement: build to it now. The file it describes is the one an insurance determination, a program exit and a regulator's sample all need, and a sponsor bank that asks for it daily is asking for what Synapse's banks didn't have.

## How to Build It

These are deltas against `programs`, `accounts`, `journal_lines` and `balance_snapshots` in [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). The FBO account is a custodial `accounts` row at the bank (`custodial = true`), and its beneficial owners are `account_parties` with role `beneficial_owner`. On the program's side, each sub-account is an `accounts` row at the same institution, pointing at its omnibus account, with `system_of_record` naming the program's ledger ([Core Banking Systems](/books/banking-and-lending/core-banking-systems#how-to-build-it)); its entries are `journal_lines` like any other account's. What the bank receives and proves each day is new:

```sql
ALTER TABLE programs
  ADD COLUMN account_structure TEXT NOT NULL DEFAULT 'individual_accounts'
    CHECK (account_structure IN ('individual_accounts', 'omnibus_fbo')),
  ADD COLUMN ledger_of_record  TEXT NOT NULL DEFAULT 'bank_core'
    CHECK (ledger_of_record IN ('bank_core', 'program', 'middleware'));

ALTER TABLE accounts                       -- a sub-account is a beneficial interest in one omnibus account
  ADD COLUMN omnibus_account_id UUID REFERENCES accounts (id);

CREATE TABLE owner_balance_files (         -- the per-owner file for one omnibus account and business date
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id          UUID NOT NULL REFERENCES programs (id),
  omnibus_account_id  UUID NOT NULL REFERENCES accounts (id),
  business_date       DATE NOT NULL,
  format_version      TEXT NOT NULL,         -- e.g. 'fdic-375-appendix-a:2024-10-02'
  produced_by         TEXT NOT NULL,         -- 'bank_core', or the program or middleware
  record_count        INT NOT NULL,
  balance_total       BIGINT NOT NULL,       -- sum of current_balance, minor units
  content_hash        TEXT NOT NULL,
  archive_uri         TEXT NOT NULL,         -- the file as received, immutable
  received_at         TIMESTAMPTZ NOT NULL,
  supersedes_id       UUID REFERENCES owner_balance_files (id),  -- a corrected file, never an overwrite
  UNIQUE (omnibus_account_id, business_date, supersedes_id)
);

CREATE TABLE owner_balance_lines (         -- one row per beneficial owner, the appendix's fields
  file_id             UUID NOT NULL REFERENCES owner_balance_files (id),
  owner_ref           TEXT NOT NULL,         -- the beneficial owner's account number in the subledger
  party_id            UUID REFERENCES parties (id),  -- resolved at the bank, for aggregation
  ownership_category  TEXT NOT NULL,
  current_balance     BIGINT NOT NULL,
  accrued_interest    BIGINT NOT NULL DEFAULT 0,
  identity            JSONB NOT NULL,        -- names, tax ID token and type, address, IRA indicator
  PRIMARY KEY (file_id, owner_ref)
);

CREATE TABLE omnibus_reconciliations (     -- the nightly proof, one per omnibus account per day
  omnibus_account_id  UUID NOT NULL REFERENCES accounts (id),
  business_date       DATE NOT NULL,
  file_id             UUID NOT NULL REFERENCES owner_balance_files (id),
  bank_ledger_balance BIGINT NOT NULL,       -- from balance_snapshots
  in_transit_total    BIGINT NOT NULL,       -- signed sum of itemized in-transit entries
  unallocated_income  BIGINT NOT NULL DEFAULT 0,  -- interest or rebates not yet assigned
  owner_total         BIGINT NOT NULL,
  difference          BIGINT GENERATED ALWAYS AS
                        (owner_total - (bank_ledger_balance - unallocated_income + in_transit_total)) STORED,
  funded_by_entry_id  UUID REFERENCES journal_entries (id),  -- the program's same-day cover for a shortfall
  status              TEXT NOT NULL CHECK (status IN ('balanced', 'break_funded', 'break_open')),
  PRIMARY KEY (omnibus_account_id, business_date)
);

CREATE TABLE reconciliation_items (        -- every line that explains a difference
  omnibus_account_id  UUID NOT NULL,
  business_date       DATE NOT NULL,
  seq                 INT NOT NULL,
  kind                TEXT NOT NULL CHECK (kind IN ('ach_in_settlement', 'card_drawdown_pending',
                        'wire_in_flight', 'interbank_sweep', 'unallocated_interest', 'break')),
  amount              BIGINT NOT NULL,       -- signed, minor units
  clears_on           DATE,                  -- required unless kind = 'break'
  source_ref          TEXT NOT NULL,         -- the entries, files or messages behind it
  FOREIGN KEY (omnibus_account_id, business_date)
    REFERENCES omnibus_reconciliations (omnibus_account_id, business_date),
  PRIMARY KEY (omnibus_account_id, business_date, seq),
  CHECK (kind = 'break' OR clears_on IS NOT NULL)
);
```

The proof, as the bank runs it from the file it received and its own snapshot:

```sql
SELECT f.omnibus_account_id,
       b.ledger_balance                              AS bank_ledger_balance,
       COALESCE(SUM(i.amount) FILTER (WHERE i.kind <> 'unallocated_interest' AND i.kind <> 'break'), 0)
                                                     AS in_transit_total,
       f.balance_total                               AS owner_total
FROM owner_balance_files f
JOIN balance_snapshots b
  ON b.account_id = f.omnibus_account_id AND b.business_date = f.business_date
LEFT JOIN reconciliation_items i
  ON i.omnibus_account_id = f.omnibus_account_id AND i.business_date = f.business_date
WHERE f.business_date = :day
  AND NOT EXISTS (SELECT 1 FROM owner_balance_files g WHERE g.supersedes_id = f.id)
GROUP BY f.omnibus_account_id, b.ledger_balance, f.balance_total;
```

How it runs:

1. **The file arrives before the bank's reconciliation window,** produced from the subledger as of the business date and hashed on receipt. A missing file is itself a break, escalated the same morning.
2. **The file's total must equal the sum of its lines,** and each line's owner must resolve to a `parties` row, so the owner can be aggregated with their other deposits for insurance ([How to Build It](/books/banking-and-lending/deposit-insurance#how-to-build-it) in Deposit Insurance reads these lines).
3. **Every in-transit amount is an itemized `reconciliation_items` row** with a clearing date; an item past its date becomes a break.
4. **A shortfall is funded the same day** by an entry from the program's operating account into the omnibus account, recorded on the reconciliation, and the break stays open until its cause is found.
5. **Income posted to the pool is allocated that night** by the program agreement's rule, and `unallocated_income` above zero for more than a day is a break.
6. **Every inter-bank movement carries the owner.** A sweep from one bank's FBO to another's is a pair of entries, one per institution, each with the sub-account it belongs to, so each bank's file reconciles on its own.

## Auditing

- **Every per-owner file as received,** hashed, with every correction as a new file, so "what did the records say on the day" has one answer ([Make It Tamper-Evident](/docs/architecture/audit-trails#make-it-tamper-evident)).
- **Every nightly reconciliation** with its in-transit items, unallocated income, breaks and the entries that funded them, and who closed each break and how.
- **The bank's access to the subledger:** the contract terms, the last successful pull, and a tested restore of the program's ledger into a system the bank controls.
- **Allocation of pooled interest and rebates,** each posting with the rule that assigned it.
- **The annual certification and test results** the proposal would require, kept now as evidence for the sponsor bank's own examinations.

## What This Means for the System You Build

- **Prefer individual accounts on the bank's core;** if the structure is omnibus, the bank must hold or continuously receive the per-owner record.
- **Reconcile every omnibus account every business day** against a per-owner file in the FDIC proposal's shape, with itemized in-transit amounts.
- **Fund shortfalls the same day** from the program's own money, and close breaks rather than carry them.
- **Record every movement at every bank with its owner,** including sweeps between banks.
- **Allocate pooled income on the day it posts.**
- **Make the ledger survivable:** data, credentials and documentation the bank can use without you, rehearsed.

## References

**Law and regulation**

- [12 CFR 330.5: Recognition of deposit ownership and fiduciary relationships](https://www.law.cornell.edu/cfr/text/12/330.5), express disclosure and ascertainable interests for pass-through coverage
- [Federal Register: Recordkeeping for Custodial Accounts (FDIC proposed rule, 89 FR 80135, October 2, 2024)](https://www.federalregister.gov/documents/full_text/html/2024/10/02/2024-22565.html), scope and exemptions, the appendix A fields, direct and continuous access, daily reconciliation, certification and the cost estimates
- [Federal Register: Recordkeeping for Custodial Accounts, document record](https://www.federalregister.gov/api/v1/documents/2024-22565.json), the citation, RIN 3064-AG07 and Part 375

**Courts**

- [CFPB v. Synapse Financial Technologies, complaint (Bankr. C.D. Cal., Adv. No. 1:25-ap-01052-MB, August 21, 2025)](https://files.consumerfinance.gov/f/documents/cfpb_synapse-financial-technologies_complaint_2025-08.pdf), the Evolve agreements, the Cash Management Program, the September 2023 deficit, the May 2024 timeline, the $60 to $90 million estimate, distributions and the count
- [Chapter 11 Trustee's Fifth Status Report (July 16, 2024)](https://cravath.com/a/web/jnsbxJAeoU5kw1zPqkWkVk/9gax7m/9890-320-07_16_2024-pacer320-main-document-012731-00001-central-district-of-california.pdf), funds held and distributed by bank, the $85 million and $65 to $96 million estimates, the $31 million of interest and rebates, the DDA finding, the restored database and the open reconciliation items
- [Chapter 11 Trustee's Fifteenth Status Report (February 6, 2025)](https://cravath.com/a/web/ogvbURUX4uGN9FJ178bssS/aafskj/20250206-485-chapter-11-trustees-fifteenth-status-report.pdf), the $219 million frozen, payouts by bank, the shortfall predating the bankruptcy, MongoDB and AWS data and its cost

**Regulators and guidance**

- [CFPB: Synapse Financial Technologies, Inc. enforcement action](https://www.consumerfinance.gov/enforcement/actions/synapse-financial-technologies-inc/), the allegation, the September 12, 2025 stipulated judgment and the $1 penalty
- [California DFPI: Notice to California Yotta customers (May 2026)](https://dfpi.ca.gov/wp-content/uploads/2026/05/Notice-to-California-Yotta-Technologies-Inc.-Customers.pdf), the November 28, 2025 allocation of $46,248,291 and the May 17, 2024 eligibility date
- [FDIC: Board withdraws four outstanding proposed rules (March 3, 2025)](https://fdic.gov/news/press-releases/2025/fdic-board-directors-withdraws-four-outstanding-proposed-rules), the custodial proposal not among them

**Vendor documentation**

- [Synctera: Funds flow](https://docs.synctera.com/docs/funds-flow), the FBO, settlement, reserve, operating and adjustment accounts and the single balance the bank sees
- [Synctera: Reconciliation for banks](https://docs.synctera.com/docs/reconciliation-banks), the daily files, FBO updates, the ACH net sweep and the card settlement formula
- [Unit: Accounts overview](https://unit.co/docs/api/accounts/overview/), append-only balances and wallet accounts that aren't bank accounts

**In practice**

- [Banking Dive: Synapse bankruptcy case tossed (November 14, 2025)](https://www.bankingdive.com/news/synapse-bankruptcy-case-tossed/805575/), the dismissal, the trustee's June 2025 request and the reasons
- [Banking Dive: Synapse customers in small claims court (September 17, 2026)](https://www.bankingdive.com/news/synapse-small-claims-court-evolve-yotta-cfpb-customer-reimbursement/830655/), the $55.2 million total, Rust Consulting and the suits against Evolve
