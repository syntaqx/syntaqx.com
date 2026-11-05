+++
title = "Confirms, Statements & Tax Forms"
nav_title = "Confirms & Tax Forms"
description = "Rule 10b-10 confirmations, account statements, the 1099 composite, the 1099-DA timeline, 1042-S for foreign accounts, and corrected forms and their clocks."
category = "Investing & Digital Assets Industry"
order = 2513
part = "Accounts and Positions"
tags = ["investing", "confirmations", "statements", "1099-b", "1099-da", "1042-s", "tax-reporting", "corrections"]
+++

A broker tells the customer what happened three times. Once per trade, in a **confirmation** sent at or before the trade completes. Once a quarter at least, in an **account statement** listing positions, balances and activity. And once a year, in the **tax forms**: the 1099 composite with proceeds, basis, dividends and interest, a 1099-DA for digital assets, a 1042-S for a foreign customer. Each is a regulated document with a deadline and required contents, and each is also a copy of a record the firm keeps: the confirm of the execution, the statement of the end-of-day positions, the 1099-B of the lot closings. The engineering problem is that the documents are produced at different times from the same ledger, and the ledger keeps changing after they're sent: busted trades, late corporate actions, issuer statements in February. Each document has to be reproducible exactly as sent, and each correction has to be explainable against the original.

This chapter covers those documents on the core model of [The Investing & Digital Assets Business](/books/investing-and-digital-assets/investing-business#the-core-data-model): Rule 10b-10 confirmations and their periodic alternative, account statements under FINRA Rule 2231, the 1099 composite and its dates, the 1099-DA timeline for crypto, the 1042-S for foreign accounts, corrected forms and their timing, and crypto statements. The lot closings behind the 1099-B are built in [Cost Basis, Tax Lots & Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots#the-lot-engine); IRA forms (5498 and 1099-R) are in [IRAs & Retirement Accounts](/books/investing-and-digital-assets/retirement-accounts#forms-5498-and-1099-r); record retention for all of these is in Books, Records & the Audit Trail. The mechanics of rendering and keeping a sent document are in the playbook's [Generated Documents](/docs/building-blocks/generated-documents#what-was-sent-is-what-you-keep).

## The Year's Documents

What a US brokerage account receives, and when, as of November 2026:

| Document | Rule | When | Built from |
| --- | --- | --- | --- |
| Trade confirmation | SEC Rule 10b-10 | "At or before completion of such transaction" | The execution, its capacity, fees and the payment for order flow disclosure |
| Periodic statement for plans | Rule 10b-10(b) | "Within five business days after the end of each quarterly period," with prior written notice | The plan's executions and reinvestments for the quarter |
| Account statement | FINRA Rule 2231 | "Not less than once every calendar quarter" when there are positions, balances or activity | End-of-day position snapshots, balances and the period's entries |
| 1099-DIV, 1099-INT | General instructions | January 31 (February 2, 2026 for 2025, when the 31st fell on a Saturday) | Income entries by payer and character |
| 1099-B, 1099-DA, consolidated statement | 26 USC 6045(b) | February 15, and the composite carries the January items with it (February 17, 2026 for 2025) | Lot closings, proceeds, basis, wash sale adjustments |
| 1042-S | Chapter 3 | March 15 | US-source income paid to foreign persons and tax withheld |
| Filing with the IRS | General instructions | March 2, 2026 on paper or March 31, 2026 electronically, for 2025 | The same records, transmitted |

The dates are the 2025 instructions' (the most recent full cycle); due dates that fall on a weekend or holiday move to the next business day. Two things follow. **Every document is a projection of the ledger at a cut,** and the cut has to be recorded with the document. **The annual forms come in a fixed order with a long tail:** income forms first, the composite in mid-February, foreign forms in March, and corrections whenever the data changes after that.

## Rule 10b-10 Confirmations

SEC Rule 10b-10 requires a broker-dealer to give the customer written notice "at or before completion of such transaction" of:

- **The trade:** "the date and time of the transaction" (or that the time is available on request), the security, the price and the quantity.
- **The capacity:** whether the broker acted as agent for the customer, agent for someone else, agent for both, or as principal, and, if principal, whether it makes a market in the security.
- **For agency trades:** the counterparty (or that it's available on request), the broker's remuneration, and for NMS stocks "a statement whether payment for order flow is received" (with details available on request).
- **For certain principal trades:** the difference between the customer's price and the dealer's contemporaneous price, or the reported trade price and the difference, depending on the trade.
- **For debt:** yield and dollar price disclosures, call features and the asset-backed caveat.
- **SIPC status:** a statement if the broker, or its clearing or carrying firm, is not a SIPC member.

Paragraph (b) offers the alternative recurring investing needs: for transactions in a periodic plan or investment company plan, or in no-load money market fund shares, a statement "within five business days after the end of each quarterly period" (monthly for the money market case) covering purchases, redemptions and dividends credited or reinvested, if the customer has been told in writing beforehand. A weekly plan becomes four statements a year instead of 52 confirmations ([Recurring Plans](/books/investing-and-digital-assets/fractional-and-recurring#recurring-plans)).

**Worked numbers: what one confirm says.** Order A from the batch in Fractional Shares & Recurring Investing: $100.00 of XYZ, filled at $187.53 for 0.533248013 shares as part of an 8-share riskless principal purchase.

| Field | Value | Source |
| --- | --- | --- |
| Trade date and time | Mon, Nov 2, 2026, 11:42:07 ET | The batch execution |
| Settlement date | Tue, Nov 3, 2026 | T+1 from the instrument's rule |
| Security | XYZ common, CUSIP | `instruments` |
| Quantity | 0.533248013 | `fractional_allocations` |
| Price | $187.53 | The batch price |
| Principal amount | $100.00 | Rounded per the stated rule |
| Capacity | Riskless principal | `executions.capacity` |
| Price difference disclosure | $0.00 against the contemporaneous purchase | Same price as the market fill |
| Order handling | Not held; the firm had discretion over time and price | The order's terms |

The confirm is rendered once from those rows, stored as sent, and linked to the execution. If the trade is busted, a new confirm cancels it; the first one is never edited.

A crypto trade that isn't a securities transaction isn't under Rule 10b-10. Crypto platforms send trade receipts anyway, and the record behind them (execution, price, fee, time) is the same record the 1099-DA will read, so my default is to build crypto receipts from the same confirmation pipeline with the securities-only fields left out.

## Account Statements

FINRA Rule 2231 requires a carrying firm to send each customer a statement "with a frequency of not less than once every calendar quarter," containing "a description of any securities positions, money balances, or account activity" since the last one. The statement must advise the customer to "report promptly any inaccuracy or discrepancy," to both the introducing and the carrying firm where there are two, and the rule's supplementary material requires the firms' identities, customer service contacts, SIPC membership and opening and closing balances on the front. Non-traded direct participation programs and REITs need a per-share estimated value with its method and caveats.

A statement is a projection of the books at a period end:

- **Positions** from the end-of-day snapshot at the period's last close ([How Positions Derive From the Ledger](/books/investing-and-digital-assets/ledgers-and-positions#how-positions-derive-from-the-ledger)), on a settlement-date or trade-date basis stated on the statement, with the mark price and its source.
- **Activity** as the period's journal entries, by trade date, in a customer's words (bought, sold, dividend, transfer, fee, journal), each linked to its source.
- **Balances** opening and closing, with the reconciliation between them shown: opening plus activity equals closing, per instrument.

One customer with a brokerage account, a crypto account and a futures account at the same brand holds accounts at three legal entities, each with its own books and its own statement duties. A combined view is fine as presentation; the statement each entity owes is its own, with its own positions and its own disclosures, and SIPC coverage shown only for what it covers.

## The 1099 Composite

A brokerage account's year-end tax package is usually one document with several forms in it: **1099-B** for proceeds from sales (with basis for covered lots), **1099-DIV** for dividends and capital gain distributions, **1099-INT** for interest (on cash, bonds, sweep programs), **1099-MISC** for other income. Section 6045(b) sets February 15 for the 1099-B statement, and lets items normally due January 31 move to February 15 when furnished on a consolidated statement with it; the 2025 general instructions apply that date "to statements furnished as part of a consolidated reporting statement." That is why a broker can send one composite in mid-February instead of a 1099-DIV at the end of January.

The 1099-B is built from lot closings, one line per closing (or per lot relieved), with the boxes the instructions define: proceeds in box 1d, reduced "by commissions and transfer taxes related to the sale"; adjusted basis in box 1e unless the lot is noncovered (box 5); accrued market discount in 1f; wash sale loss disallowed in 1g; short-term or long-term in box 2 under section 1222. Covered and noncovered lines are grouped because they go to different boxes of the customer's Form 8949: basis reported to the IRS goes in box A (short) or D (long), basis not reported in B or E, and lines with no adjustments may skip Form 8949 and go "directly on either line 1a (for short-term transactions) or line 8a (for long-term transactions) of Schedule D."

**Worked numbers: one account's 2026 1099-B lines.** The account from the worked examples in Cost Basis, Tax Lots & Wash Sales and Corporate Actions & Asset Events, all covered:

| Line | Description | Acquired | Sold | 1d proceeds | 1e basis | 1g disallowed | Term | 8949 box |
| --- | --- | --- | --- | ---: | ---: | ---: | --- | --- |
| 1 | 100 sh, wash sale | Mar 2, 2026 | Oct 1, 2026 | $4,000.00 | $5,000.00 | $1,000.00 | Short | A, code W |
| 2 | 50 sh ABC, FIFO lot L1 | Jan 15, 2024 | Nov 2, 2026 | $6,000.00 | $4,000.00 | | Long | D |
| 3 | 10 sh ABC, FIFO lot L2 | Jun 10, 2025 | Nov 2, 2026 | $1,200.00 | $1,400.00 | | Long | D |

The $4.90 of cash in lieu from the reverse split isn't on the form (fractional share sales with gross proceeds under $20 need not be reported); I show it in the realized gain and loss detail that accompanies the composite, with its $55.10 loss, so the customer can report it. The detail is where everything the forms don't carry belongs: noncovered basis the firm knows, cross-account wash sale warnings, customer-provided crypto basis.

**Why composites move.** <!-- source-gap: ida-ric-reit-reclassification | missing | that late reclassification of fund and REIT distributions is the main driver of mid-February composites and of corrected 1099s | closes with: an IRS, FINRA or broker publication describing the reclassification timing | checked: 2026-11-05 --> Distributions from funds and REITs are often recharacterized by the payer after year-end (ordinary dividend, capital gain distribution, return of capital), and I found no primary source on how often this drives corrections, but the arithmetic is clear: a payer's year-end character arrives after December, a return of capital changes basis, and a basis change changes 1099-B lines already computed. A composite built in early February from data that can still change is a draft, and the system should treat it as one until the expected payer data has arrived or the date has.

## Form 1099-DA and Its Timeline

Digital assets are reported on Form 1099-DA, not 1099-B ("For sales of digital assets, complete Form 1099-DA"). The 2024 final regulations phase it in:

- **Sales on or after January 1, 2025:** brokers "must report gross proceeds." The first forms covered 2025 and were furnished with the composite in February 2026. Notice 2024-56 gave penalty relief for good-faith 2025 reporting and backup withholding relief for 2025 transactions, and for 2026 transactions where the customer's name and TIN match the IRS's records; the 2026 instructions point to Notice 2025-33 for further transitional backup withholding relief.
- **Sales on or after January 1, 2026:** brokers "must report basis on certain transactions": covered assets, which are those "acquired in an account for which the broker provided custodial services" after 2025. Units acquired earlier, or transferred in, are noncovered, and the form leaves basis blank with box 9 checked unless the broker reports it voluntarily.
- **Not yet reported:** Notice 2024-57 lets brokers skip the form for wrapping and unwrapping, liquidity provider transactions, staking, lending, short sales and notional principal contracts until further guidance; rewards earned in them are not part of that exception.

The form's boxes follow the 1099-B's with crypto additions: a nine-character digital token identifier in box 1a ("999999999" where none is registered), units sold in 1c, proceeds in 1f reduced by transaction costs, basis in 1g, wash sale loss disallowed in 1i for tokenized securities only, units and dates transferred in (12a, 12b). Qualifying stablecoin sales may be reported in aggregate when a customer's designated sales "do not exceed $10,000 for the year," specified NFTs under $600, and a processor of digital asset payments reports nothing for a customer whose sales "are less than or equal to $600 for the year." On the customer's side, Form 8949 now has boxes G to L for digital asset transactions, separate from A to F.

For the system, the 1099-DA is the 1099-B pipeline with three differences: lots are per account with the 2025 ordering rules ([Crypto Basis per Wallet and per Account](/books/investing-and-digital-assets/cost-basis-and-tax-lots#crypto-basis-per-wallet-and-per-account)), transferred-in units have no statement behind them and stay noncovered, and stablecoin and NFT lines can be aggregated under the thresholds. A platform that is both a broker-dealer and a crypto broker files both forms from two legal entities' books, and a tokenized security generally goes on the 1099-DA rather than the 1099-B, under the instructions' coordination rules.

## The 1042-S for Foreign Accounts

A customer documented as a foreign person on Form W-8BEN ([Tax Status: W-9 and W-8BEN](/books/investing-and-digital-assets/opening-accounts#tax-status-w-9-and-w-8ben)) doesn't get a 1099-DIV. US-source income paid to them, "amounts from U.S. sources paid to foreign persons," goes on Form 1042-S: dividends, interest, substitute dividends that are dividend equivalents (income codes 34 and 53), each with the chapter 3 rate applied and the tax withheld. The form must "be furnished to the recipient of the income by March 15 of the following calendar year," and the 2026 instructions add that a chapter 3 exemption code is "now required in all cases where the tax withheld is less than 30%." So every withholding decision made at a dividend's pay date (the certificate valid that day, the treaty rate it claimed) has to be stored with the payment, because the 1042-S reports them per payment type and rate a year later.

## Corrections and Their Timing

Forms are corrected when the data under them changes. The rules that set the clock:

- **Issuer statements.** A broker must take into account the issuer's statement of an organizational action affecting basis (Form 8937) and, if it has already filed, "must file a corrected Form 1099-B within 30 days of receiving the issuer statement."
- **Everything else.** The general instructions say to "correct it as soon as possible," filing the corrected return and furnishing the recipient a corrected statement.
- **The de minimis safe harbor.** Under sections 6721(c)(3) and 6722(c)(3), a dollar amount within "no more than $100" of correct (or "no more than $25" for tax withheld) is treated as correct and need not be corrected, unless the recipient "elects to receive a corrected statement," in which case the firm must file and furnish the correction.

**Worked numbers: a spinoff restatement.** The spinoff in Corporate Actions & Asset Events allocated $2,571.43 of basis to 50 Sub shares, but suppose the broker had used a provisional 15% allocation ($2,700.00) when the customer sold all 50 Sub on December 10, 2026 for $2,600.00, reporting a $100.00 loss. The issuer's final statement arrives on March 3, 2027, after the composite went out, with the 14.2857% figure. The lot engine replays: Sub's basis is $2,571.43, the sale is a $28.57 gain, and Parent's remaining basis rises from $15,300.00 to $15,428.57. The line's basis changes by $128.57, more than the $100 safe harbor, so a corrected 1099-B is due within 30 days of March 3 (by April 2, 2027). Had the statement arrived before the composite was furnished, the original form would have carried the right number and nothing would be corrected, which is the case for holding forms while issuer data is expected.

The correction itself is a new document version, never an edit: `tax_document_corrections` links the original, the replacement, the cause (the issuer statement, the trade bust, the reclassification) and the lines that changed, and the customer sees what changed and why.

## Crypto Statements

A crypto platform's documents follow the brokerage pattern with different rules behind them: trade receipts per execution, periodic account statements under its own terms and state law, the 1099-DA from its broker entity, and income reporting for rewards under the general information return rules (Crypto Tax later in this book). Two crypto-specific things belong in every statement: the cut (a 24/7 book has no close, so the statement's positions and marks are as of the platform's recorded daily cut, with a named price source) and the custody facts (which legal entity holds the assets, in what structure, and that they aren't SIPC-protected; [What SIPC Protects](https://www.sipc.org/for-investors/what-sipc-protects) excludes non-security digital assets and stablecoins).

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): `disclosures` (what was sent, which template version, when, how), `executions`, `lot_closings`, `journal_entries` and `journal_lines`, and the snapshots from [Ledgers, Positions & Buying Power](/books/investing-and-digital-assets/ledgers-and-positions#how-to-build-it). This chapter adds a record per confirm, per statement, per tax document and per correction; each points at the rendered document as sent and at the rows it was built from.

```sql
CREATE TABLE trade_confirmations (            -- one per execution or per periodic statement period
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  legal_entity_id    UUID NOT NULL REFERENCES legal_entities (id),
  kind               TEXT NOT NULL CHECK (kind IN ('trade', 'cancel', 'correction',
                       'periodic_plan_statement')),
  execution_id       UUID REFERENCES executions (id),      -- null for a periodic statement
  period             DATERANGE,                -- the quarter or month for 10b-10(b)
  capacity           TEXT,                     -- as disclosed: agent, principal, riskless principal
  pfof_statement     BOOLEAN,                  -- NMS stock agency trades
  replaces_id        UUID REFERENCES trade_confirmations (id),
  disclosure_id      UUID NOT NULL REFERENCES disclosures (id),  -- the document as delivered
  sent_at            TIMESTAMPTZ NOT NULL,
  CHECK ((kind = 'periodic_plan_statement') = (period IS NOT NULL))
);

CREATE TABLE account_statements (             -- one per account per period, at a recorded cut
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  legal_entity_id    UUID NOT NULL REFERENCES legal_entities (id),
  period             DATERANGE NOT NULL,
  as_of_close        TIMESTAMPTZ NOT NULL,     -- the snapshot cut the positions come from
  through_entry_id   UUID NOT NULL REFERENCES journal_entries (id),
  opening_value      BIGINT NOT NULL,
  closing_value      BIGINT NOT NULL,
  disclosure_id      UUID NOT NULL REFERENCES disclosures (id),
  sent_at            TIMESTAMPTZ NOT NULL,
  UNIQUE (account_id, period)
);

CREATE TABLE tax_documents (                  -- a form for an account and year, versioned
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  legal_entity_id    UUID NOT NULL REFERENCES legal_entities (id),   -- the payer or broker
  tax_year           SMALLINT NOT NULL,
  form               TEXT NOT NULL CHECK (form IN ('1099_composite', '1099_b', '1099_da',
                       '1099_div', '1099_int', '1099_misc', '1042_s', '5498', '1099_r')),
  version            INT NOT NULL CHECK (version > 0),
  status             TEXT NOT NULL CHECK (status IN ('draft', 'held', 'furnished', 'filed',
                       'superseded')),
  held_reason        TEXT,                     -- 'awaiting_issuer_statement', 'wash_window', ...
  through_entry_id   UUID NOT NULL REFERENCES journal_entries (id),  -- the ledger it was built from
  lines              JSONB NOT NULL,           -- box values per line, minor units
  furnish_due_on     DATE NOT NULL,
  furnished_at       TIMESTAMPTZ,
  filed_at           TIMESTAMPTZ,
  disclosure_id      UUID REFERENCES disclosures (id),
  UNIQUE (account_id, legal_entity_id, tax_year, form, version)
);

CREATE TABLE tax_document_corrections (       -- why version n+1 exists
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  original_id        UUID NOT NULL REFERENCES tax_documents (id),
  corrected_id       UUID NOT NULL REFERENCES tax_documents (id),
  cause              TEXT NOT NULL CHECK (cause IN ('issuer_statement', 'trade_bust',
                       'late_corporate_action', 'reclassification', 'basis_statement',
                       'recipient_request', 'error')),
  cause_ref          TEXT,                     -- the Form 8937, the busted execution, ...
  cause_received_at  TIMESTAMPTZ NOT NULL,     -- starts the 30-day clock for issuer statements
  due_on             DATE,
  max_line_difference BIGINT NOT NULL,         -- dollar amounts, against the $100 safe harbor
  max_withholding_difference BIGINT NOT NULL DEFAULT 0,  -- tax withheld, against $25
  required           BOOLEAN NOT NULL,         -- false when within the safe harbor and not requested
  changed_lines      JSONB NOT NULL,
  UNIQUE (original_id, corrected_id)
);
```

The recipient's election to receive every correction gets its own small table, and whether a restatement needs a corrected form is then one query:

```sql
CREATE TABLE tax_correction_elections (       -- the recipient's election under the safe harbor
  account_id         UUID NOT NULL REFERENCES accounts (id),
  elected_at         TIMESTAMPTZ NOT NULL,
  revoked_at         TIMESTAMPTZ,
  PRIMARY KEY (account_id, elected_at)
);

SELECT c.id,
       c.max_line_difference > 10000             -- more than $100.00, in cents
       OR c.max_withholding_difference > 2500    -- more than $25.00 withheld
       OR EXISTS (SELECT 1 FROM tax_correction_elections e
                  WHERE e.account_id = d.account_id AND e.revoked_at IS NULL)
         AS correction_required
FROM tax_document_corrections c
JOIN tax_documents d ON d.id = c.original_id
WHERE c.original_id = :original;
```

Design notes:

- **Every document records its cut.** `through_entry_id` on statements and tax documents is the last ledger entry included, so any document can be rebuilt from the ledger and compared to what was sent ([What Was Sent Is What You Keep](/docs/building-blocks/generated-documents#what-was-sent-is-what-you-keep)).
- **Versions, not edits.** A corrected 1099 is a new `tax_documents` version with a correction row; a canceled confirm is a new confirm.
- **Hold, then furnish.** A tax document stays `held` while its account has open wash windows or expected issuer statements, until the furnish date forces it out; a late change after that is a correction.
- **One pipeline, several entities.** Confirms, statements and forms are produced per legal entity, from that entity's books, even when the customer sees them together.
- **The safe harbor is a computation,** with the recipient's election to always receive corrections stored per account.

## Auditing

Confirms, statements and tax forms are records examiners sample and customers rely on. Keep:

- **Every confirmation and statement as delivered,** with its template version, delivery channel and time, and the rows it was built from, for the retention periods in Books, Records & the Audit Trail.
- **Periodic statement notices** for every plan using Rule 10b-10(b), with the customer's acknowledgment.
- **Every tax document version** with its build cut, its box values, and furnish and filing times against the due dates.
- **Every correction** with its cause, when the cause arrived, the clock it started, the line differences against the safe harbor, and when the correction was furnished and filed.
- **Withholding decisions** per payment, with the certificate relied on, for the 1099 and 1042-S.

## What This Means for the System You Build

- **Build every confirm, statement and tax form from the ledger at a recorded cut,** and keep the document exactly as sent.
- **Send confirms at or before completion,** with capacity and the order flow disclosure, and use periodic statements for plans only with prior notice.
- **Produce statements per legal entity,** at least quarterly, from end-of-day snapshots with named marks.
- **Build the 1099-B and 1099-DA from lot closings,** grouped by covered status and term, and ship a realized gain and loss detail with what the forms don't carry.
- **Hold year-end forms for open wash windows and expected issuer data,** then furnish by the date.
- **Correct by version** within 30 days of an issuer statement, apply the de minimis safe harbor as a computation, and honor recipients who elect corrections.
- **Store withholding decisions with each payment** so the 1042-S and 1099 can be built a year later.

## References

**Law and regulation**

- [17 CFR 240.10b-10: Confirmation of transactions](https://www.law.cornell.edu/cfr/text/17/240.10b-10), timing at or before completion, trade details, capacity, remuneration and payment for order flow, principal trade price differences, debt disclosures, SIPC status, and the periodic plan alternative
- [26 USC 6045: Returns of brokers](https://www.law.cornell.edu/uscode/text/26/6045), the February 15 statement, the consolidated reporting statement, basis and term reporting, covered securities
- [FINRA Rule 2231: Customer Account Statements](https://www.finra.org/rules-guidance/rulebooks/finra-rules/2231), quarterly statements, required contents, the advice to report discrepancies, front-page disclosures and DPP and REIT valuations

**Regulators and guidance**

- [IRS: General Instructions for Certain Information Returns (2025)](https://www.irs.gov/instructions/i1099gi), the February 17, 2026 date for 1099-B, 1099-DA and consolidated statements, filing dates, the 10-return electronic filing threshold, corrections, the de minimis safe harbor and the recipient election
- [IRS: Instructions for Form 1099-B (2026)](https://www.irs.gov/instructions/i1099b), boxes 1d, 1e, 1f, 1g, 2 and 5, the $20 fractional share exception, issuer statements and 30-day corrections, digital assets on 1099-DA
- [IRS: Instructions for Form 1099-DA (2026)](https://www.irs.gov/instructions/i1099da), covered digital assets, box contents including the token identifier and transfer-in boxes, stablecoin, NFT and payment processor thresholds, Notice 2025-33
- [IRS: Final regulations and related guidance for reporting by brokers on sales and exchanges of digital assets](https://www.irs.gov/newsroom/final-regulations-and-related-IRS-guidance-for-reporting-by-brokers-on-sales-and-exchanges-of-digital-assets), the gross proceeds and basis dates, Notices 2024-56 and 2024-57
- [IRS: Instructions for Form 8949 (2025)](https://www.irs.gov/instructions/i8949), boxes A to F and G to L, code W and code B, and reporting directly on Schedule D lines 1a and 8a
- [IRS: Instructions for Form 1042-S (2026)](https://www.irs.gov/instructions/i1042s), US-source income paid to foreign persons, substitute dividend income codes, the March 15 date and the exemption code requirement below 30%
- [SIPC: What SIPC Protects](https://www.sipc.org/for-investors/what-sipc-protects), the exclusion of non-security digital assets and stablecoins

**Vendor documentation**

- [Alpaca: Statements and confirms](https://docs.alpaca.markets/us/docs/statements-and-confirms.md), the requirement to deliver customer statements and trade confirms on time, and retrieval as PDFs through the Documents API
