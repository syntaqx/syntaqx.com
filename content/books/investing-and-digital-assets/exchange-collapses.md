+++
title = "FTX, Celsius & the 2022 Collapse"
nav_title = "FTX, Celsius & 2022"
description = "The 2022 crypto collapse as engineering failure: Terra, Celsius, Voyager, BlockFi, Genesis and FTX from court records, and the design rule each one motivates."
category = "Investing & Digital Assets Industry"
order = 2551
part = "Crypto Exchanges"
tags = ["crypto", "ftx", "celsius", "bankruptcy", "controls", "custody", "ledgers"]
+++

In 2022 the largest crypto lenders and one of the largest exchanges failed within seven months of each other, and the bankruptcy courts then did what no regulator had done: they opened the books. What they found reads less like a market crash than a list of missing controls. FTX's code let one customer, its founder's trading firm, run a negative balance with a borrow limit of $65 billion and exempted it from liquidation; there were no logs of who set the value. Its customers' dollars went to bank accounts held by that trading firm and a shell company, and the liability sat in an internal account called `fiat@ftx.com`; about $8.7 billion of customer assets were misappropriated by the debtors' count. Celsius's terms of use had transferred ownership of about $4.2 billion of customer crypto to Celsius, so when it failed the customers were unsecured creditors of the estate, not owners. Voyager told customers they were FDIC-insured. None of these is a market risk. Each is a ledger, a flag, a term or a disclosure, and each is a design rule in this volume.

This chapter tells the collapse from the court and regulatory record: Terra, Three Arrows, Celsius, Voyager, BlockFi, Genesis and Gemini Earn, and FTX in detail, then recoveries, then a table mapping each failure to the rule that guards against it and the chapter where it lives. It adds no tables to [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) in The Investing & Digital Assets Business; its How to Build It is a set of invariants over the core tables, which [Trading Platform Architecture](/books/investing-and-digital-assets/trading-platform-architecture) runs as `invariant_checks`. Bank failures in the same period are Banking & Lending's [Bank Failures](/books/banking-and-lending/bank-failures); Synapse, the fintech ledger failure of 2024, is [Synapse: A Post-Mortem](/books/banking-and-lending/program-ledgers#synapse-a-post-mortem); the hacks are [Exchange Security & Hacks](/books/investing-and-digital-assets/exchange-security#the-hack-record).

## How It Unwound

The sequence, from the sources this chapter cites:

| When | What | Source |
| --- | --- | --- |
| February 14, 2022 | BlockFi agrees to pay $100 million to the SEC and 32 states over its unregistered crypto lending product | SEC Press Release 2022-26 |
| May 2022 | TerraUSD loses its peg; the collapse "wiped out $40 billion in market value nearly overnight" | SEC Press Release 2024-73 |
| July 2022 | Celsius files for Chapter 11; about 600,000 Earn accounts held about $4.2 billion of crypto as of July 10, 2022 | Celsius Earn opinion |
| July 28, 2022 | The FDIC and the Federal Reserve demand Voyager stop saying it is FDIC-insured | FDIC Press Release PR-56-2022 |
| November 2, 2022 | CoinDesk reports that Alameda's balance sheet holds a large position in FTT, FTX's own token | SEC complaint against Bankman-Fried |
| November 6 to 9, 2022 | Binance announces it will sell its FTT; FTX tweets that it is fine; FTX pauses withdrawals on November 8; Binance drops a proposed acquisition | SEC complaint |
| November 11, 2022 | FTX, Alameda and affiliates file for bankruptcy; a cyberattack drains about $432 million the same day | Ray's first interim report |
| November 2022 | Genesis stops Gemini Earn investors from withdrawing about $900 million | SEC Press Release 2023-7 |
| January 4, 2023 | The Celsius court holds that Earn assets belong to the estate | Celsius Earn opinion |
| April 9 and June 26, 2023 | FTX's new CEO files reports on control failures and on the misuse of customer deposits | Ray's first and second interim reports |

The contagion ran through loans: lenders borrowed customers' coins to lend to trading firms, trading firms borrowed against tokens whose prices depended on their own buying, and when Terra's collapse took the collateral, the defaults moved down the chain. Three Arrows Capital, a hedge fund that borrowed from several of these lenders and defaulted in June 2022, is the link I couldn't source from a primary record on this pass. <!-- source-gap: three-arrows-capital | missing | Three Arrows Capital's default and liquidation, its borrowings from Voyager, Genesis and others, and amounts | closes with: the BVI liquidators' reports, the Voyager or Genesis bankruptcy filings, or the Singapore or BVI court records | checked: 2026-11-05 -->

## Terra

TerraUSD (UST) was an algorithmic stablecoin: it held no reserve of dollars and kept its peg through a mint-and-burn relationship with LUNA, the chain's own token. When holders ran, the mechanism minted LUNA to absorb UST redemptions, LUNA's price fell, and the loop accelerated. In May 2022 UST de-pegged and the collapse wiped out about $40 billion of value. After a jury found Terraform Labs and Do Kwon liable for securities fraud on April 5, 2024, they agreed in June 2024 to pay more than $4.5 billion to the SEC: Terraform $3,586,875,883 of disgorgement, $466,952,423 of prejudgment interest and a $420,000,000 penalty, and Kwon $110,000,000 of disgorgement (jointly and severally with Terraform), $14,320,196 of prejudgment interest and an $80,000,000 penalty. The criminal case followed in the US; I couldn't open its record on this pass. <!-- source-gap: do-kwon-criminal | missing | Do Kwon's guilty plea and sentence in SDNY | closes with: DOJ SDNY press releases (justice.gov returned empty on 2026-11-05) or the docket | checked: 2026-11-05 --> The design lessons are in [Depegs, Runs & Synthetic Dollars](/books/investing-and-digital-assets/depegs-and-synthetic-dollars#terra-s-ust); for an exchange, Terra is the reason a stablecoin's listing review asks what backs it and how redemption works, not just what it trades at.

## Celsius: the Terms Decided

Celsius offered Earn accounts that paid interest on deposited crypto. On January 4, 2023, Chief Judge Martin Glenn of the Bankruptcy Court for the Southern District of New York decided who owned the roughly $4.2 billion in about 600,000 Earn accounts. The answer was in the Terms of Use, which 99.86% of Earn holders had accepted in version 6 or later. They said customers granted Celsius "all right and title to such Eligible Digital Assets, including ownership rights, and the right, without further notice to you, to hold such Digital Assets in Celsius' own Virtual Wallet or elsewhere, and to pledge, re-pledge, hypothecate, rehypothecate, sell, lend, or otherwise transfer or use any amount of such Digital Assets". The court held the terms unambiguous: the Earn assets became Celsius's property when deposited and the estate's on the petition date, and Earn holders were unsecured creditors.

The engineering point is that a balance on a screen says nothing about ownership. The same "1 BTC" row in a ledger is a custodial holding or a loan to the platform depending on the product's terms, and the platform's ledger, disclosures and proof of reserves must say which. Celsius's examiner later reported on how the business was run; I couldn't open that report on this pass. <!-- source-gap: celsius-examiner | missing | the Celsius examiner's final report (January 2023) findings on how Earn deposits were used | closes with: the examiner's report on the Celsius docket (CourtListener HTML returned 403 on 2026-11-05) | checked: 2026-11-05 -->

## Voyager: What Was Insured

Voyager kept a deposit account "for the benefit of its customers at Metropolitan Commercial Bank" and told customers, in effect, that Voyager itself was FDIC-insured. On July 28, 2022 the FDIC and the Federal Reserve called those representations "false and misleading" and demanded that Voyager "cease and desist from making false and misleading statements." FDIC insurance covers depositors when an insured bank fails; it never covered Voyager's failure or any crypto. The rule is Banking & Lending's [Pass-Through Coverage](/books/banking-and-lending/deposit-insurance#pass-through-coverage): a platform may say a customer's cash is held at an insured bank only when the records support pass-through coverage, and must never imply coverage of the platform or of crypto. [Customer Protection, Net Capital & SIPC](/books/investing-and-digital-assets/customer-protection) covers the broker side, where SIPC doesn't cover non-security crypto either.

## BlockFi and Genesis: Lending Customers' Coins

BlockFi's interest accounts (BIAs) let investors lend crypto to BlockFi for a variable monthly interest payment, offered from March 4, 2019. The SEC found in February 2022 that BlockFi had offered unregistered securities and "operated for more than 18 months as an unregistered investment company," with more than 40% of its total assets, excluding cash, in investment securities; it agreed to pay $100 million, $50 million to the SEC and $50 million to 32 states.

Genesis was the lender behind Gemini Earn. The SEC charged both on January 12, 2023: Gemini Earn had 340,000 investors; Genesis lent their crypto out and paid Gemini an agent fee "as high as 4.29 percent"; and in November 2022 "Genesis announced that it would not allow its Gemini Earn investors to withdraw," freezing "approximately $900 million in investor assets." The New York Attorney General sued Gemini, Genesis and their parent in October 2023 and announced settlements of $2 billion with Genesis in May 2024 and $50 million with Gemini in June 2024.

The structure is the same in both: an exchange or app collects customer coins into a yield product, a lender takes them, and the lender's solvency becomes the customer's risk, usually without the customer having chosen the lender. [Cash, Sweeps & Yield](/books/investing-and-digital-assets/cash-and-sweeps#crypto-yield-blockfi-celsius-and-gemini-earn) covers the yield programs, and [Prime Brokerage, OTC & Crypto Lending](/books/investing-and-digital-assets/crypto-prime-and-lending) covers institutional lending after 2022.

## FTX: the Engineering Failures

John J. Ray III, FTX's chief executive in bankruptcy, filed two interim reports in 2023 that read as a negative specification of an exchange. They describe, in systems, what a missing control looks like.

### The Alameda exception

FTX.com's customer database had a field called `borrow`, which set how far an account could go negative before trading restrictions or automatic liquidation applied. "Most retail customers had a borrow value of zero"; certain preferred customers and market makers had values "in amounts up to $150 million"; "Alameda alone had a borrow value set to $65 billion." Two more settings made the exception total. `can_withdraw_below_borrow` and `allow_negative`, which Ray's report says were added to the codebase "on July 23, 2019 and July 31, 2019, respectively," let an account withdraw "an unlimited amount of crypto assets ... while having a net-negative account balance" and "exempted the customer from the FTX.com exchange's automatic liquidation processes." "As of the petition date, Alameda was the only customer on FTX.com for which allow_negative was set to 'true.'" Alameda could "withdraw virtually unlimited assets, regardless of the size of its account balance and without risk of its positions being liquidated." (The SEC's complaint dates the negative-balance code to "in or around August 2019, and updated in or around May 2020," and the liquidation exemption to about May 2020; the two records differ on dates, not on what the code did.)

And there was no history: "Due to the FTX Group's failure to maintain appropriate database logs, it is not possible to determine precisely when these particular borrow values for Alameda were configured, or by whom." An employee recalled talk in summer 2022 of reducing it to $1 billion, still about seven times any other customer's; the database showed $65 billion on the petition date.

The SEC's complaint described the result as "a virtually unlimited 'line of credit' funded by the platform's customers." In ledger terms, a customer was allowed to hold a negative balance with no collateral check, the negative balance was netted against everyone else's positive ones, and the netting hid the hole.

### The `fiat@` account and the bank accounts

Customers who wired dollars to FTX often wired them to bank accounts that were not FTX's. Ray's second report found that the "Primary Deposit Accounts" for customer funds were in the names of Alameda Research, FTX Digital Markets and North Dimension, Inc., a shell company the FTX Group falsely told a bank was a crypto trading firm; by December 31, 2021 the North Dimension accounts "had received at least $1 billion in customer deposits," and FTX Digital Markets accounts served as a "pass-through vehicle to funnel at least $5.4 billion in customer deposits to FTX Trading Ltd." The SEC's complaint describes how the liability for those deposits was recorded: in "an internal account in the FTX database that was not tied to Alameda but was instead called 'fiat@ftx.com.'" When FTX tried in 2022 to split Alameda's share out of that account, the share "amounted to more than $8 billion in FTX customer assets that had been deposited into Alameda-controlled bank accounts," and it was moved to an account associated with an individual with no apparent connection to Alameda, so that it would not be charged interest. When Bankman-Fried sought emergency funding that November, the balance sheet he circulated carried "a negative $8 billion entry labeled as a 'hidden, poorly internally labeled `fiat@ account.''"

Ray's second report put the total at about $8.7 billion of customer assets misappropriated from FTX.com, "the vast majority of which was in the form of cash and stablecoin": "over $6.4 billion" of the deficit was fiat and stablecoin.

### Wallets and keys

FTX told the world in 2019 it used a "standard hot wallet/cold wallet setup," and told advisers in 2022 that hot wallets held enough "to cover two days of trading activities" with the rest "stored offline in air gapped encrypted laptops, which are geographically distributed." Ray's report: "These representations were false." FTX "kept virtually all crypto assets in hot wallets"; internal messages gave inconsistent splits for different audiences ("we say 10% in hot wallet, and 90% in cold wallet"), and "neither of these assertions about cold storage use was true." Keys to over $100 million of ETH sat "in plain text and without encryption on an FTX Group server"; single-signature keys "to billions of dollars in crypto assets" were in a cloud secrets manager or a password vault; virtually all FTX.com bitcoin sat "in a single Bitcoin Core wallet node" whose passwords were "committed to the code repository." The debtors' search of the environment turned up, by April 2023, "over a billion dollars' worth of crypto assets as to which few or no records existed." [Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing#backups-and-recovery) covers the key controls these violate.

### Access and the petition-date hack

FTX "did not enforce the use of MFA" on Google Workspace or 1Password, ran FTX.com, FTX US and Alameda in "a single, shared AWS account," had no alerting on root logins, and had GuardDuty "not enabled at all." On the petition date, a cyberattack "drained approximately $432 million worth of crypto assets in hours"; FTX US lost about $139 million of it because its migration out of the shared AWS account was unfinished, and FTX "did not learn of the November 2022 Breach until the Debtors' restructuring advisor alerted employees after observing, via Twitter" that funds were moving.

### The books

"Fifty-six entities within the FTX Group did not produce financial statements of any kind. Thirty-five FTX Group entities used QuickBooks"; about 80,000 transactions sat "as unprocessed accounting entries in catch-all QuickBooks accounts titled 'Ask My Accountant'"; and "Expenses and invoices of the FTX Group were submitted on Slack and were approved by 'emoji,'" including transfers "in the tens of millions of dollars."

### The run

The run took a week. CoinDesk's November 2 report on Alameda's FTT holdings, Binance's November 6 announcement that it would sell its FTT, a November 7 tweet that "FTX is fine. Assets are fine," a pause of all withdrawals on November 8, and Binance's withdrawal from a proposed acquisition on November 9; the SEC's complaint puts customer withdrawals at about $5 billion in a single day of that week. A firm with customer assets intact can survive a $5 billion day; one whose customer dollars were in someone else's bank account can't survive any.

## Recoveries and Distributions

By June 2023 FTX's debtors had "recovered approximately $7 billion in liquid assets." FTX's plan, its distributions, and Bankman-Fried's criminal case and appeal have public records I couldn't open on this pass, so I state no recovery percentages or outcomes here. <!-- source-gap: ftx-distributions-and-appeal | missing | FTX plan effective date, distribution rounds and recovery percentages measured at petition-date prices, and the Second Circuit decision in United States v. Bankman-Fried | closes with: the FTX Recovery Trust notices, the plan and confirmation order on the D. Del. docket, and the Second Circuit opinion | checked: 2026-11-05 --> How long a distribution takes depends on records: Mt. Gox, whose losses were found in 2014, is still repaying creditors with a deadline of October 31, 2027 ([Mt. Gox](/books/investing-and-digital-assets/exchange-security#mt-gox)). [Conversions, Shutdowns & Distributions](/books/investing-and-digital-assets/conversions-and-shutdowns#bankruptcies-and-distributions) covers running a distribution, in kind or in cash.

## What Every Design Rule Is Guarding Against

| Failure | The rule | Where it lives |
| --- | --- | --- |
| A customer with a $65 billion borrow limit and `allow_negative` | No account may go negative without a margin agreement, collateral and the same liquidation rules as everyone; no per-account exemption flags | [Perpetuals & Crypto Derivatives](/books/investing-and-digital-assets/perpetuals-and-crypto-derivatives); [Margin & Short Selling](/books/investing-and-digital-assets/margin-and-short-selling) |
| No logs of who changed the borrow value | Every change to a risk parameter or account flag is a versioned, approved, logged event | [Audit Trails](/docs/building-blocks/audit-trails) |
| Customer dollars in Alameda and North Dimension bank accounts | Customer cash only in accounts titled for customers' benefit at the customers' legal entity, reconciled daily | [Ledgers, Positions & Buying Power](/books/investing-and-digital-assets/ledgers-and-positions); [Cash, Sweeps & Yield](/books/investing-and-digital-assets/cash-and-sweeps) |
| A liability hidden in `fiat@ftx.com` | Every customer liability is on a customer ledger line, by account; no unmapped internal accounts | [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) |
| Negative balances netted against positive ones | Proof of liabilities with non-negative leaves | [The Negative-Balance Attack](/books/investing-and-digital-assets/proof-of-reserves#the-negative-balance-attack) |
| "90% cold" said, almost all hot held | Wallet tiers with limits, reported from the wallet inventory, not from statements | [Hot, Warm & Cold Wallets](/books/investing-and-digital-assets/hot-and-cold-wallets) |
| Keys in plain text and secrets managers | Keys generated and held in HSMs, enclaves or MPC; quorum signing; backups of shares | [Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing#generating-a-key) |
| One shared cloud account, no MFA, no alerts | Separate accounts per entity, enforced MFA, alerting on privileged access | [Just-in-Time Access and Break-Glass](/docs/security/infrastructure-access#just-in-time-access-and-break-glass) |
| Celsius's terms transferring title | Custody products keep title with the customer, in terms, ledger and disclosures; yield products say plainly that the customer is a lender | [Qualified Custody](/books/investing-and-digital-assets/qualified-custody); Cash, Sweeps & Yield |
| Voyager's FDIC claims | Insurance statements only where records support them | [Pass-Through Coverage](/books/banking-and-lending/deposit-insurance#pass-through-coverage) |
| Gemini Earn's lender freezing withdrawals | A customer's counterparty risk disclosed by name, with exposure limits | [Prime Brokerage, OTC & Crypto Lending](/books/investing-and-digital-assets/crypto-prime-and-lending#the-genesis-and-three-arrows-lessons) |
| Terra's unbacked peg | Listing review of what backs a stablecoin and how it redeems | [Listing & Delisting Assets](/books/investing-and-digital-assets/listing-assets); [Depegs, Runs & Synthetic Dollars](/books/investing-and-digital-assets/depegs-and-synthetic-dollars) |
| Brand entities sharing books | Every account, wallet and entry carries one legal entity | [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) |

## How to Build It

The failures above are invariants, not features, and the place to enforce them is a set of checks over the core tables that run continuously and block or page on any result. Each query below must return no rows; [Trading Platform Architecture](/books/investing-and-digital-assets/trading-platform-architecture#invariants-checked-continuously) stores them as `invariant_checks` with their schedule and owner.

```sql
-- 1. No customer balance below zero without a margin capability (the allow_negative check)
SELECT p.account_id, p.instrument_id
FROM positions p JOIN accounts a ON a.id = p.account_id
WHERE p.settled_quantity + p.unsettled_quantity < 0
  AND NOT ('margin' = ANY (a.capabilities) OR 'futures' = ANY (a.capabilities));

-- 2. Customer holdings covered per instrument and legal entity by what the latest
--    chain and custodian reconciliations found (ledger vs location, sign-independent)
WITH owed AS (
  SELECT a.legal_entity_id, p.instrument_id,
         SUM(p.settled_quantity + p.unsettled_quantity) AS owed
  FROM positions p JOIN accounts a ON a.id = p.account_id
  WHERE p.settled_quantity + p.unsettled_quantity > 0
  GROUP BY a.legal_entity_id, p.instrument_id
), held AS (
  SELECT DISTINCT ON (r.wallet_id) r.legal_entity_id, r.instrument_id, r.external_total
  FROM reconciliations r
  WHERE r.source IN ('chain', 'custodian') AND r.wallet_id IS NOT NULL
  ORDER BY r.wallet_id, r.as_of DESC
)
SELECT o.legal_entity_id, o.instrument_id
FROM owed o
LEFT JOIN (SELECT legal_entity_id, instrument_id, SUM(external_total) AS held
           FROM held GROUP BY legal_entity_id, instrument_id) h
  USING (legal_entity_id, instrument_id)
WHERE COALESCE(h.held, 0) < o.owed;

-- 3. Nothing parked in suspense (no fiat@-style account holding what customers are owed)
SELECT jl.instrument_id, SUM(jl.amount)
FROM journal_lines jl JOIN journal_entries je ON je.id = jl.journal_entry_id
WHERE jl.ledger_account = 'suspense' AND je.posted_at < NOW() - INTERVAL '2 days'
GROUP BY jl.instrument_id
HAVING SUM(jl.amount) <> 0;

-- 4. The latest chain reconciliation for every wallet is matched and recent
SELECT w.id FROM wallets w
LEFT JOIN LATERAL (SELECT status, as_of FROM reconciliations r
                   WHERE r.wallet_id = w.id ORDER BY as_of DESC LIMIT 1) r ON TRUE
WHERE w.status = 'active' AND (r.status IS DISTINCT FROM 'matched' OR r.as_of < NOW() - INTERVAL '1 day');
```

Notes on the sketch:

- **Coverage reads positions, not signs.** Check 2 compares what customers are owed (positive positions) with what the latest reconciliation of each wallet found on chain or at the custodian, so it doesn't depend on the ledger's sign convention; fiat follows the same pattern with bank reconciliations.
- **Exemptions are data, and visible.** If the business needs an exception (a market maker's credit line), it is a `risk_limits` row approved by a quorum, with collateral and an expiry, listed in a report the board sees, never a boolean on an account.
- **Suspense is a clock.** An amount in `suspense` is a liability nobody has assigned; check 3 makes it visible after two days instead of never.
- **The checks are evidence.** Each run is stored with its result, so the firm can show an examiner or a trustee that the invariant held every day, which is the record FTX couldn't produce.
- **Events:** `invariant.violated` through the [outbox](/docs/architecture/events#the-transactional-outbox) pages the controller and the risk lead, and for check 2 freezes the affected entity's outbound transfers pending review.

## Auditing

- **Daily invariant results** for every legal entity, retained.
- **Every risk parameter and account flag change,** with approver, reason and before and after.
- **Every bank account holding customer cash,** its titling, its legal entity and its daily reconciliation.
- **Every product's terms by version,** with which customers accepted which version, because the terms decide ownership.
- **Every public statement about custody, insurance and reserves,** matched to the records that support it.

## What This Means for the System You Build

- **Ban per-account exemptions** from negative-balance and liquidation rules; make credit a collateralized, approved, expiring limit.
- **Log every change to every risk parameter** with who and why; a value with no history is a control failure.
- **Keep customer cash in accounts titled for customers** at the right entity, and reconcile daily.
- **Put every customer liability on a customer ledger line;** run a check that finds unmapped internal accounts.
- **Run coverage invariants per instrument and entity** continuously, and freeze outflows on a breach.
- **Write terms that match the ledger:** custody keeps title with the customer; yield products say the customer is a lender.
- **Say only what the records support** about cold storage, insurance and reserves.

## References

**Regulators and guidance**

- [FDIC: FDIC and Federal Reserve issue letter demanding Voyager Digital cease and desist (PR-56-2022, July 28, 2022)](https://www.fdic.gov/news/press-releases/2022/pr22056.html), Voyager's insurance representations, the deposit account at Metropolitan Commercial Bank, and the demand
- [SEC: Press Release 2022-26, BlockFi agrees to pay $100 million (February 14, 2022)](https://www.sec.gov/news/press-release/2022-26), BlockFi interest accounts, the investment company finding and the penalties
- [SEC: Press Release 2023-7, SEC charges Genesis and Gemini (January 12, 2023)](https://www.sec.gov/news/press-release/2023-7), Gemini Earn's investors, the agent fee, the November 2022 withdrawal halt and the $900 million
- [SEC: Press Release 2024-73, Terraform and Kwon to pay $4.5 billion following fraud verdict (June 13, 2024)](https://www.sec.gov/newsroom/press-releases/2024-73), the $40 billion collapse and the disgorgement, interest and penalties
- [SEC: Press Release 2022-219, SEC charges Samuel Bankman-Fried (December 13, 2022)](https://www.sec.gov/news/press-release/2022-219), the "virtually unlimited line of credit" and the diversion of customer funds
- [New York Attorney General: press releases on Genesis and Gemini](https://ag.ny.gov/press-releases?search_api_fulltext=Genesis%20Gemini), the October 2023 suit and the May 2024 and June 2024 settlements, by title and date

**Courts and enforcement**

- [SEC v. Bankman-Fried, No. 1:22-cv-10501 (S.D.N.Y.), complaint (December 13, 2022)](https://www.sec.gov/litigation/complaints/2022/comp-pr2022-219.pdf), the `fiat@ftx.com` account, the negative-balance code and liquidation exemption, the November 2022 timeline and the $8 billion entry
- [In re FTX Trading Ltd., First Interim Report of John J. Ray III on Control Failures (D. Del. 22-11068, Doc 1242-1, April 9, 2023)](https://storage.courtlistener.com/recap/gov.uscourts.deb.188450/gov.uscourts.deb.188450.1242.1.pdf), the borrow field, `can_withdraw_below_borrow` and `allow_negative`, missing logs, hot wallets, keys, access controls, accounting and the petition-date cyberattack
- [In re FTX Trading Ltd., Second Interim Report of John J. Ray III: the commingling and misuse of customer deposits at FTX.com (Doc 1704-1, June 26, 2023)](https://storage.courtlistener.com/recap/gov.uscourts.deb.188450/gov.uscourts.deb.188450.1704.1.pdf), the deposit accounts, North Dimension, the $8.7 billion misappropriated and the recoveries to date
- [*In re Celsius Network LLC*, No. 22-10964 (MG) (Bankr. S.D.N.Y. Jan. 4, 2023), memorandum opinion on ownership of Earn account assets](https://www.nysb.uscourts.gov/sites/default/files/opinions/312902_1822_opinion.pdf), the Earn accounts and balances, the Terms of Use and the holding
- [Mt. Gox Trustee: Notice of October 16, 2026](https://www.mtgox.com/img/pdf/20261016_b3a13e0f-55f6-4653-913b-be80762390e8_announcement_en.pdf), the repayment deadline moved to October 31, 2027
