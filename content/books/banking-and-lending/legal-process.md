+++
title = "Levies, Garnishments & Legal Process"
nav_title = "Legal Process"
description = "Legal process against deposit accounts: IRS levies, state garnishments, protected federal benefits under 31 CFR 212, child support, subpoenas and the RFPA."
category = "Banking & Lending Industry"
order = 2419
part = "Deposits"
tags = ["banking", "deposits", "garnishment", "levy", "legal-process", "privacy"]
+++

A bank holds other people's money, so courts, tax authorities and child support agencies come to it to take some of that money, and investigators come to it for records. Every week a bank of any size receives garnishment orders, tax levies, restraining notices, child support liens, subpoenas and search warrants. Each arrives with its own rules about which accounts it reaches, what must be protected, how long to hold before paying, whom to tell and whom not to tell. Getting it wrong costs either way: a bank that ignores a levy can owe the debt itself, and a bank that freezes protected Social Security benefits or applies the wrong state's exemptions owes the customer and its regulator.

This chapter covers the deposit account side: legal process as a case with a clock, a hold, a protected amount and a disbursement. The hold mechanics are in [Holds and Blocks](/books/banking-and-lending/posting-holds-and-balances#holds-and-blocks). The case and deadline tables are the ones [Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes#how-to-build-it) defines. Regulatory reporting a bank makes on its own initiative (SARs, CTRs, 314(a) matches) is covered in BSA/AML Programs.

## How the Platforms Do It

What cores publish about the mechanics legal process runs on, as of October 2026:

| Platform | Role | What it publishes |
| --- | --- | --- |
| **Mambu** | Core | Blocks that "prevent clients from withdrawing or transferring a specified amount", behind the `BLOCK_AND_SEIZE_FUNDS` permission; `POST /deposits/{id}/blocks` makes "the available balance... the total balance minus the blocked amount"; a block stays pending until seized with `POST /deposits/{id}/seizure-transactions` (partial seizures supported) or released with `DELETE /deposits/{id}/blocks/{ref}`; interest keeps accruing on the total balance |
| **Jack Henry Digital Core** | Core | A holds API: create with `accountId`, `amount`, `expirationDate` and a free-text `description`; holds come back with journal references and a `preAuth` flag, with no typed hold reason |

Two things stand out. **Cores provide the block and the seizure, not the law:** Mambu has the primitives a garnishment needs (a block that can exceed the available balance, a seizure that can be partial), and neither vendor models the order, the protected amount or the notice. That logic sits above the core, in a legal process system or in operations procedures. **A hold without a type is a liability:** when the only record of why money is frozen is a 50-character description, nobody can answer "which accounts are restrained under this order, and what is protected" from data. My rule is that every legal hold points at a case, and the case holds the reasons.

## What Arrives

| Process | From | What it does | Clock that matters |
| --- | --- | --- | --- |
| **Garnishment, writ of execution, restraining notice** | A court or a judgment creditor under state law | Freezes and then takes funds of the judgment debtor, subject to state exemptions and federal benefit protection | State law, plus a two-business-day federal benefits review |
| **IRS levy** (Form 668-A) | The IRS | Reaches funds on deposit when served; the bank holds, then surrenders | 21 days, then surrender |
| **State tax levy** | A state revenue department | Like an IRS levy under state law | State law |
| **Child support lien or levy** | A state child support agency, often after a quarterly data match | Encumbers or surrenders assets of a parent owing past-due support | State law; the data match is quarterly |
| **Subpoena, summons, formal written request** | A court, a party to litigation, or a federal or state agency | Demands records, not money | Return date; for federal agencies, the RFPA |
| **Search warrant, grand jury subpoena** | Law enforcement, a grand jury | Demands records, often with a bar on telling the customer | Immediate or as stated; nondisclosure |
| **Court order freezing or turning over an account** | A court, in a divorce, an estate or a forfeiture | As ordered | As ordered |

Each one is a `legal_process` case, and the first task for all of them is the same: identify the right customer and the accounts the process reaches, from the identifiers in it, and record how the match was made.

## Protected Federal Benefits: 31 CFR 212

Social Security, SSI, VA, Railroad Retirement and federal civil service benefits are protected from garnishment by their own statutes, and Treasury's rule (31 CFR 212) turns that into a procedure every bank runs before freezing anything. The benefit agencies identify their direct deposits with the character "XX" in positions 54 and 55 of the ACH entry, and that marker is what the bank looks for.

1. **Check for the federal notice.** If the order attaches a Notice of Right to Garnish Federal Benefits (Appendix B to Part 212), issued by the United States or a state child support agency, the bank follows its customary procedures. Otherwise it performs the review (212.4).
2. **Review each account within two business days** after receiving the order (212.5). A bank receiving a large batch may take longer if the creditor permits it, and must keep records that it did. The review looks for benefit payments posted during the **lookback period**: the two months ending on the day before the review. If there are none, customary procedures apply. The review is done "separately for each account", regardless of co-owners or commingled funds, and the bank "shall not trace the movement of funds between accounts."
3. **Protect the lesser** of the sum of benefit payments posted in the lookback period and the account's balance at the review (212.3, 212.6). The account holder keeps "full and customary access" to the protected amount, which is conclusively exempt. Funds above it follow state law, typically a freeze.
4. **Don't charge a garnishment fee against the protected amount.** A fee may be charged up to five business days after the review only against non-benefit funds deposited in that window, capped at that amount (212.6(h)). Don't garnish later deposits continually, and don't repeat the review when the same order is served again; a new order gets a new review.
5. **Send the account holder a notice within three business days** after the review, when a benefit payment posted in the lookback period and funds exceeded the protected amount (212.7). Its required contents include the order, the protected amount, the amount frozen, any fee, the right to claim further exemptions, and the creditor's name and contact.
6. **Keep the records** of account activity and actions taken for at least two years after receiving the order (212.11).

The rule preempts inconsistent state law and gives a safe harbor to a bank that follows it, which is why the review is worth automating exactly as written: it is a calculation on posted transactions, a hold and a notice, all with deadlines.

## Worked Numbers: A Garnishment on a Social Security Recipient

A state court garnishment order without a Notice of Right to Garnish is served on the bank on Wednesday, November 4, 2026, for a $9,000 judgment. The debtor has one checking account, with Social Security deposits marked XX of $1,900 on Wednesday, September 9 and Wednesday, October 14, 2026.

- **Review deadline:** two business days after receipt, Friday, November 6. The bank reviews on Thursday, November 5.
- **Lookback period:** the two months ending on the day before the review, so Friday, September 4 through Wednesday, November 4. Both deposits fall inside it: $3,800.
- **Protected amount:** the balance at review is $5,200, so the lesser is **$3,800**, available to the customer as usual.
- **Above the protected amount:** $1,400 is subject to the state's procedure, typically a freeze, and then turnover to the creditor if no exemption is claimed in time.
- **Notice:** within three business days of the review, by Tuesday, November 10 (Veterans Day on the 11th doesn't intervene).
- **Fee:** none from the $3,800; a garnishment fee can come only from non-benefit deposits made in the five business days after the review, up to their amount.

Had the balance at review been $2,600, the protected amount would have been all $2,600, nothing would be frozen, and no Part 212 notice would be required because no funds exceeded it. And had the October deposit landed on September 3, outside the lookback, only $1,900 would be protected.

## IRS Levies

A notice of levy on a bank account (Form 668-A) is the IRS's own process, outside the courts:

- **What it reaches:** "A levy shall extend only to property possessed and obligations existing at the time thereof" (26 USC 6331(b)). The IRS's own manual is blunt: the levy "only reaches the amount on deposit when the levy is received", and later deposits need a new levy. The IRS describes funds as "frozen as of the date and time the levy is received."
- **The 21-day hold:** a bank surrenders deposits, with interest, "only after 21 days after service of levy" (26 USC 6332(c)). The wait gives the taxpayer time to resolve the debt or show an error; the IRS may release the levy during it, and if it doesn't, the bank surrenders without further notice, the next business day after the period ends. The taxpayer can waive the wait.
- **The cost of ignoring it:** a bank that fails to surrender is personally liable for the value not surrendered, up to the tax, plus costs and interest, and failure "without reasonable cause" adds a penalty of 50 percent of that amount (26 USC 6332(d)).
- **Fees caused by an IRS error:** the taxpayer claims those from the IRS on Form 8546, not from the bank.

For a levy served on Wednesday, November 4, 2026, the 21 days end on Wednesday, November 25. Thursday, November 26 is Thanksgiving, so the surrender goes out on Friday, November 27, unless the IRS releases the levy first.

Separately, the IRS can take up to 15 percent of certain federal payments at the source under a continuous levy (26 USC 6331(h)). That happens before the money reaches the bank and isn't a levy on the account.

## State Garnishments and Restraints

State law decides how a judgment creditor reaches a bank account, what is exempt, which bank office must be served and what the bank may charge. Two examples show the range.

**New York.** A restraining notice served on a bank (CPLR 5222) restrains the debtor's property, but a bank that holds "twice the amount due on the judgment" is free as to the rest. Exempt money stays out of reach: when exempt payments were directly deposited within the 45 days before service, CPLR 5205(l) protects them up to a set amount, and separately a restraining notice doesn't reach an amount tied to 240 times the federal minimum hourly wage (CPLR 5222(i)). The Department of Financial Services adjusts the 5205(l) amount and the restraint provisions tied to it every three years; it has been **$3,425 since April 1, 2024**, and the next adjustment is scheduled for April 1, 2027. A bank that restrains funds it shouldn't "shall charge no fee to the judgment debtor... regardless of any terms of agreement."

**Texas.** A bank's registration designates the registered agent's address where claims against its customers are served, and a claim served anywhere else "is not effective as to the financial institution"; the customer, not the bank, "bears the burden of preventing or limiting" compliance, by injunction for instance (Finance Code 59.008).

**Which state's exemptions apply** is not the bank's convenience. In May 2022 the CFPB ordered Bank of America to pay a $10 million penalty and refund or cancel at least $592,000 in fees after finding that it processed out-of-state garnishments against at least 3,700 accounts under the issuing state's exemptions instead of the customer's home state, and relied on deposit agreement waivers the CFPB called unenforceable. The order record needs the customer's state at service, the exemptions that state provides, and why the order was valid against this bank.

## Child Support

Federal law requires every state's child support program to run a **financial institution data match** with banks each calendar quarter, identifying parents with past-due support who hold accounts, and requires banks to "encumber or surrender, as the case may be, assets" when the agency serves a lien or levy (42 USC 666(a)(17)). The bank may be paid a reasonable fee, not more than its actual costs, and is shielded from liability for disclosing records, freezing or surrendering funds under the program; a separate provision bars liability under any federal or state law for disclosing records to a state child support agency (42 USC 669a). A child support order that carries the Notice of Right to Garnish Federal Benefits skips the Part 212 review.

For a bank, the data match is a quarterly file exchange, and the lien that follows is an ordinary legal process case with the agency's rules for holding periods and notices.

## Records: Subpoenas and the Right to Financial Privacy Act

Requests for records are the more common kind of legal process and have their own rules.

**Federal agencies and the RFPA.** The Right to Financial Privacy Act (12 USC 3401 et seq.) governs a federal "Government authority" seeking the records of a "customer" who is "an individual or a partnership of five or fewer individuals." Businesses aren't covered, and state and local agencies follow state law. A federal agency may get the records only through the customer's authorization, an administrative subpoena or summons, a search warrant, a judicial subpoena or a formal written request (3402), and the bank may not release them "until the Government authority seeking such records certifies in writing" that it has complied (3403(b)). Customer notice may be delayed by court order for up to 90 days at a time, and the court may bar the bank from disclosing the request (3409). Grand jury subpoenas are excepted from most of the Act, but no officer, employee or agent of the bank may "directly or indirectly, notify any person named in a grand jury subpoena" of it (3420(b)). The Act also has exceptions for supervisory agencies and for reporting required by federal statute or rule (3413), and it lets a bank tell the government about a possible violation of law by giving the name, account and nature of the activity without breaching it (3403(c)).

**Getting paid.** The government reimburses costs "reasonably necessary and which have been directly incurred" in searching, reproducing and transporting records (3415), at rates the Federal Reserve sets in 12 CFR 219: $22.00 an hour for clerical and technical time, $30.00 for computer support and for managers, and $0.25 a page for photocopies, with storage media at cost.

**Getting it wrong.** A bank or agency that discloses in violation of the Act owes $100 per violation "without regard to the volume of records involved", plus actual damages, punitive damages if willful, and costs and attorney's fees; a bank that relied in good faith on the agency's certificate has a defense (3417).

**Civil subpoenas and state process** follow the issuing court's and state's rules for service, response time and customer notice, so the same records request may require telling the customer in one case and forbid it in another. My rule is that every records request is a case with a nondisclosure flag and an end date, checked by every channel that could tell the customer, including the customer service agent who sees the case.

## Freezes, Setoff and Holds

- **A legal hold is a block, typed.** It carries the target amount (the debt) and the amount secured now, can exceed the available balance, and catches later deposits only if the process reaches them: an IRS levy doesn't, and Part 212 forbids continual garnishment of new deposits ([Holds and Blocks](/books/banking-and-lending/posting-holds-and-balances#holds-and-blocks)).
- **Freezes on suspicion are not legal process.** An account frozen by a fraud model is a risk decision with consumer protection consequences, and the CFPB's 2022 action against Bank of America for freezing benefit cards "based solely" on a fraud filter is in [What Goes Wrong](/books/banking-and-lending/deposit-errors-and-disputes#what-goes-wrong).
- **A card issuer can't set off a credit card debt against the cardholder's deposits** at the same institution (12 CFR 1026.12(d)), before or after terminating the card, except under a consensual security interest, by the same attachment or levy any creditor could use, or by periodic deductions the cardholder authorized in writing. A bank's general setoff right for other debts comes from its agreement and state law, and Part 212's protected amount still applies to garnishment.

## How to Build It

These are deltas against [the core data model](/books/banking-and-lending/banking-business#the-core-data-model). Each order is a `cases` row with `kind = 'legal_process'` and `opened_at` at service. Its deadlines (benefit review, notice, surrender date, return date) are `case_deadlines` rows from [Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes#how-to-build-it), and its notices are `disclosures` with `case_id`.

```sql
-- The order as served.
CREATE TABLE legal_orders (
  case_id               UUID PRIMARY KEY REFERENCES cases (id),
  institution_id        UUID NOT NULL REFERENCES institutions (id),
  process_type          TEXT NOT NULL CHECK (process_type IN ('garnishment', 'restraining_notice',
                          'writ_of_execution', 'irs_levy', 'state_tax_levy', 'child_support',
                          'court_order', 'subpoena', 'search_warrant', 'grand_jury_subpoena',
                          'rfpa_request')),
  issuer                TEXT NOT NULL,         -- court, agency, creditor's attorney
  issuing_jurisdiction  TEXT NOT NULL,         -- 'US', 'US-NY', ...
  served_at             TIMESTAMPTZ NOT NULL,
  served_via            TEXT NOT NULL,         -- 'registered_agent', 'branch', 'mail', 'electronic'
  debtor_identifiers    JSONB NOT NULL,        -- as stated on the order; tokenized
  amount_demanded       BIGINT,                -- null for records requests
  federal_benefit_notice BOOLEAN NOT NULL DEFAULT FALSE,  -- Appendix B attached
  rfpa_certificate_at   TIMESTAMPTZ,           -- for federal records requests
  nondisclosure_until   DATE,                  -- delayed notice or grand jury; null if none
  document_ref          TEXT NOT NULL          -- the order as received
);

-- Each account the order reached, with the match and the money.
CREATE TABLE legal_order_accounts (
  case_id               UUID NOT NULL REFERENCES legal_orders (case_id),
  account_id            UUID NOT NULL REFERENCES accounts (id),
  party_id              UUID NOT NULL REFERENCES parties (id),
  match_basis           TEXT NOT NULL,         -- 'ssn_and_name', 'account_number', ...
  customer_state        TEXT,                  -- the debtor's state at service, for exemptions
  reviewed_at           TIMESTAMPTZ,           -- the 31 CFR 212 account review
  lookback              DATERANGE,
  benefit_total         BIGINT,                -- XX-marked deposits in the lookback
  balance_at_review     BIGINT,
  protected_amount      BIGINT,                -- the 212 amount: the lesser of the two
  state_exempt_amount   BIGINT,                -- any further exemption under the customer's state law
  hold_id               UUID REFERENCES holds (id),   -- reason 'legal_process'
  seized_transaction_id UUID REFERENCES transactions (id),
  released_at           TIMESTAMPTZ,
  PRIMARY KEY (case_id, account_id),
  CHECK (protected_amount IS NULL OR protected_amount = LEAST(benefit_total, balance_at_review))
);

-- Records produced for a request, and what it cost.
CREATE TABLE records_productions (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id               UUID NOT NULL REFERENCES legal_orders (case_id),
  produced_at           TIMESTAMPTZ NOT NULL,
  scope                 JSONB NOT NULL,        -- accounts, date range, record types
  archive_ref           TEXT NOT NULL,         -- what was sent, hashed and archived
  hours_clerical        NUMERIC(6, 2),
  pages                 INTEGER,
  reimbursement_claimed BIGINT
);
```

The benefit review is a query over posted transactions, not a judgment:

```sql
-- Federal benefit deposits in the lookback for one account (31 CFR 212.3, 212.5).
SELECT COALESCE(SUM(t.amount), 0) AS benefit_total
FROM transactions t
WHERE t.account_id = :account_id
  AND t.direction = 'credit'
  AND t.rail = 'ach'
  AND t.counterparty ->> 'benefit_marker' = 'XX'     -- positions 54-55 of the entry, as received
  AND t.reverses_id IS NULL
  AND t.effective_date >= (:review_date - INTERVAL '1 day' - INTERVAL '2 months')::date
  AND t.effective_date <= :review_date - 1;
```

How it runs:

1. **Intake records service** (time, channel, the office it was served on) and opens the case; for a Texas bank, service anywhere but its registered agent is recorded as ineffective, not ignored.
2. **Matching finds the accounts** from the order's identifiers and records the basis; a doubtful match goes to review rather than to a hold.
3. **For money process,** the benefit review runs within the deadline per account, the protected amount is set and stays available, and a `legal_process` hold secures what state law allows, with `secured_amount` and the target on the hold row ([Holds and Blocks](/books/banking-and-lending/posting-holds-and-balances#holds-and-blocks)). Notices go out as disclosures within their deadlines.
4. **Surrender or release** is a dated deadline: 21 days for an IRS levy, the state's period for a garnishment, the agency's for child support. Surrender posts a transaction from the account to a legal process payable GL and then the payment to the creditor or agency; a release lifts the hold with who and why.
5. **For records,** production waits for what the law requires (an RFPA certificate, a court order), the archive keeps exactly what was sent, and `nondisclosure_until` suppresses customer notices and is shown to every agent who opens the case.

## Auditing

Legal process records are evidence in the debtor's case, the creditor's case and the bank's exams, and the bank is a party to none of those disputes it wants to lose. Keep:

- **The order as received,** when and where it was served, and why it was effective against this bank.
- **The match:** which accounts, which identifiers, who confirmed it.
- **The Part 212 review per account:** the review time against its deadline, the lookback dates, the benefit deposits found, the balance, the protected amount, and the notice as sent, for at least the two years 212.11 requires.
- **Every hold, seizure, release and surrender,** with amounts, dates, the deadline it met and the journal entries.
- **Fees charged** and the funds they came from, so a fee against protected funds is impossible to hide.
- **For records requests,** the authority, the certificate or order relied on, what was produced, and the nondisclosure period, with access to the case itself logged ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Make every legal hold point at a case** that holds the order, the reasons and the deadlines; never a free-text hold.
- **Run the 31 CFR 212 review as code,** per account, within two business days, from XX-marked deposits, before any freeze.
- **Protect first, freeze second, fee last,** and never fee protected funds.
- **Store the customer's state and the exemptions applied,** not the issuing state's by default.
- **Compute surrender dates from the process type,** 21 days for an IRS levy, and hold until then unless released.
- **Treat records requests as cases** with an authority check, an archive of what was produced and an enforced nondisclosure flag.
- **Keep fraud freezes and legal holds separate,** with separate rules and owners.

## References

**Law and regulation**

- [31 CFR 212: Garnishment of accounts containing federal benefit payments](https://www.law.cornell.edu/cfr/text/31/part-212), the sections and appendices
- [31 CFR 212.3](https://www.law.cornell.edu/cfr/text/31/212.3), benefit payments marked XX, the lookback period, the protected amount and garnishment orders
- [31 CFR 212.4](https://www.law.cornell.edu/cfr/text/31/212.4), the Notice of Right to Garnish Federal Benefits and customary procedures
- [31 CFR 212.5](https://www.law.cornell.edu/cfr/text/31/212.5), the two-business-day review, separate accounts and no tracing
- [31 CFR 212.6](https://www.law.cornell.edu/cfr/text/31/212.6), customary access to the protected amount, no continual garnishment and the fee limits
- [31 CFR 212.7](https://www.law.cornell.edu/cfr/text/31/212.7), the account holder notice within three business days and its contents
- [31 CFR 212.11](https://www.law.cornell.edu/cfr/text/31/212.11), two years of records
- [26 USC 6331](https://www.law.cornell.edu/uscode/text/26/6331), a levy reaches property existing when made, and the 15 percent continuous levy on specified payments
- [26 USC 6332](https://www.law.cornell.edu/uscode/text/26/6332), the 21-day bank hold, personal liability and the 50 percent penalty
- [42 USC 666](https://www.law.cornell.edu/uscode/text/42/666), the quarterly financial institution data match, encumbering or surrendering assets, fees and liability protection
- [42 USC 669a](https://www.law.cornell.edu/uscode/text/42/669a), no liability for disclosing records to a state child support agency
- [12 USC 3401](https://www.law.cornell.edu/uscode/text/12/3401), Government authority, person and customer
- [12 USC 3402](https://www.law.cornell.edu/uscode/text/12/3402), the five ways a federal agency may obtain records
- [12 USC 3403](https://www.law.cornell.edu/uscode/text/12/3403), the certificate of compliance and notifying the government of possible violations
- [12 USC 3409](https://www.law.cornell.edu/uscode/text/12/3409), delayed notice for up to 90 days and nondisclosure orders
- [12 USC 3413](https://www.law.cornell.edu/uscode/text/12/3413), exceptions for supervisors, required reporting and grand juries
- [12 USC 3415](https://www.law.cornell.edu/uscode/text/12/3415), cost reimbursement
- [12 USC 3417](https://www.law.cornell.edu/uscode/text/12/3417), $100 per violation, damages and the good-faith defense
- [12 USC 3420](https://www.law.cornell.edu/uscode/text/12/3420), grand jury subpoenas and the bar on notifying the customer
- [12 CFR 219.3 and Appendix A](https://www.law.cornell.edu/cfr/text/12/219.3), the Federal Reserve's reimbursement rates
- [12 CFR 1026.12](https://www.law.cornell.edu/cfr/text/12/1026.12), the prohibition on offsetting credit card debt against deposits and its exceptions
- [New York CPLR 5222](https://www.nysenate.gov/legislation/laws/CVP/5222), restraining notices, twice the judgment, exempt amounts and no fees for unlawful restraint
- [New York CPLR 5205](https://www.nysenate.gov/legislation/laws/CVP/5205), exempt direct deposits within 45 days and the three-year adjustment
- [Texas Finance Code 59.008](https://texas.public.law/statutes/tex._fin._code_section_59.008), service on the registered agent and the customer's burden

**Regulators and guidance**

- [IRS: Internal Revenue Manual 5.11.4, Levy on bank accounts](https://www.irs.gov/irm/part5/irm_05-011-004), the 21 calendar days, funds on deposit when received, release during the holding period and Form 668-A instructions
- [IRS: Information about bank levies](https://www.irs.gov/businesses/small-businesses-self-employed/information-about-bank-levies), funds frozen when the levy is received and Form 8546 for bank charges
- [New York DFS: Exemption from judgments](https://www.dfs.ny.gov/industry_guidance/exemption_from_judgments), $3,425 from April 1, 2024 and the next adjustment on April 1, 2027

**Enforcement**

- [CFPB: Bank of America ordered to pay $10 million penalty for illegal garnishments (2022-CFPB-0002, May 4, 2022)](https://www.consumerfinance.gov/archive/newsroom/cfpb-orders-bank-of-america-to-pay-10-million-penalty-for-illegal-garnishments/), out-of-state garnishments under the wrong state's exemptions, unenforceable waivers and refunds

**Vendor documentation**

- [Mambu: Blocking funds in deposit accounts](https://docs.mambu.com/md/docs/blocking-funds-in-deposit-accounts.txt), blocks, seizures, partial seizure, release and interest on the total balance
- [Jack Henry Digital Core: Holds](https://jackhenry.dev/digital-core-api-docs/account-services/api-reference/v1/holds/), the hold fields and release
