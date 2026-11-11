+++
title = "Accounting for Crypto & Treasury Companies"
nav_title = "Crypto Accounting"
description = "Crypto on the books: the impairment model, ASU 2023-08 fair value worked through a quarter, SAB 121 and 122, custody disclosures and treasury company mNAV."
category = "Investing & Digital Assets Industry"
order = 2556
part = "Institutional Crypto"
tags = ["crypto", "accounting", "fair-value", "asu-2023-08", "sab-122", "treasury-companies", "mnav"]
+++

Accounting decides what a company's crypto looks like to everyone who reads its financial statements, and for most of crypto's history the answer was misleading in both directions. A company that bought bitcoin carried it as an intangible asset at cost, wrote it down whenever the price dipped, and could never write it back up, so a company sitting on large gains reported a string of impairment losses. A company that held bitcoin for customers was told in 2022 to put all of it on its balance sheet as both an asset and a liability, which made a custodian look as large as its clients and kept banks out of custody. Both rules are gone: from 2025, in-scope crypto held for a company's own account is measured at fair value through net income under ASU 2023-08, and SAB 121 was rescinded by SAB 122 in January 2025.

The rules matter to an engineer because the books are built from the ledger. Fair value needs a price per asset per reporting date from a defined principal market; deferred taxes need the cost basis by lot; a custodian's disclosures need customer holdings by asset at fair value; and a digital asset treasury company's investors need holdings, cost and per-share figures every week. This chapter covers the old impairment model, ASU 2023-08 with a worked quarter under both models, deferred taxes, SAB 121 and SAB 122, custody disclosures, digital asset treasury companies with mNAV worked, audits and reserve reports, and how a platform's books show customer crypto. It extends `journal_lines` and `legal_entities` with `fair_value_measurements` and `safeguarding_assessments`. General revenue and close mechanics are the playbook's [Accounting](/docs/money/accounting); the tax lot engine is [Cost Basis, Tax Lots & Wash Sales](/books/investing-and-digital-assets/cost-basis-and-tax-lots).

## How Companies Report It

How companies with large crypto positions report them, from their latest filings:

| Company | Holding | Accounting | Figures |
| --- | --- | --- | --- |
| **Strategy** (formerly MicroStrategy) | Bitcoin, own account | ASU 2023-08 adopted January 1, 2025, prospectively, with a cumulative-effect adjustment; fair value from Coinbase as principal market, Level 1 | About 847,666 BTC at September 30, 2026, cost $63.9 billion, fair value $70.8 billion; Q3 2026 gain on digital assets $20.9 billion |
| **BitMine Immersion** | Ether, own account | Adopted early, September 1, 2024, no cumulative effect; fair value at the Coinbase price at midnight UTC; FIFO cost | About 1,874,927 ETH carried at $8.26 billion at August 31, 2025 |
| **SharpLink** | Ether natively staked and liquid staking tokens | ETH at fair value; liquid staking tokens outside ASC 350-60, at "cost, net of any impairment losses" | 632,784 ETH at fair value $989 million against cost $2.43 billion; LsETH and weETH carried after $268 million of impairments (June 30, 2026) |
| **Coinbase** | Customer crypto, in custody | SAB 122 adopted as of December 31, 2024, retrospectively; customer crypto not on the balance sheet; no contingent liability because "the risk of loss is remote" | $376.1 billion of customer crypto and stablecoins at fair value at December 31, 2025 ($404.0 billion a year earlier) |
| **iShares Bitcoin Trust** | Bitcoin, the fund's own asset | Fair value at the benchmark rate; unrealized gains and losses through the statement of operations | 770,792 BTC at fair value $67.4 billion; 2025 unrealized loss $11.4 billion |

The split that runs through the chapter: what a company owns is on its balance sheet at fair value, what it holds for customers isn't, and the second needs disclosure and a loss-contingency judgment rather than a balance.

## The Old Model

Before ASU 2023-08, companies treated crypto as indefinite-lived intangible assets. Strategy's 2024 10-K states the model plainly: it "accounts for its digital assets, which are comprised solely of bitcoin, as indefinite-lived intangible assets"; an impairment is measured against "the lowest price of one bitcoin quoted on the active exchange at any time since acquiring"; once written down, "this new cost basis will not be adjusted upward for any subsequent increase in fair value"; and "Gains (if any) are not recorded until realized upon sale." Strategy recorded $115.9 million of digital asset impairment losses, net of gains on sale, in 2023, and under the model no later price rise could reverse them.

The model's two defects are both about the intraday low. A company had to know the lowest price since acquisition for every lot, which made impairment a data job over every tick on the principal exchange, and a flash crash minutes long permanently lowered the carrying amount even when the quarter ended higher. The balance sheet showed the worst moment, not the asset.

## ASU 2023-08

The FASB issued ASU 2023-08, Subtopic 350-60, in December 2023. For in-scope crypto assets it requires measurement "at fair value," "with gains and losses from changes in the fair value of such crypto assets recognized in net income each reporting period," presentation separate from other intangibles, and "certain interim and annual disclosures," as Strategy's filings describe it. Adoption is through "a cumulative-effect adjustment to the opening balance of retained earnings," without restating prior periods. Scope is set by criteria in ASC 350-60-15-1: an intangible asset, which gives no enforceable right to underlying goods or services, created or residing on a distributed ledger, secured through cryptography, fungible, and not created or issued by the reporting entity or its related parties. The effective date is annual periods beginning after December 15, 2024, including interim periods, with early adoption permitted (BitMine's 10-K quotes it). I state the scope criteria as the standard sets them; the FASB's text didn't open for me, and the filings below confirm their application rather than their wording. <!-- source-gap: asu-2023-08-text | secondary | the six scope criteria of ASC 350-60-15-1 and the disclosure list | closes with: the ASU 2023-08 text on fasb.org (403 and an unreadable PDF when fetched) | checked: 2026-11-05 -->

What the filings show about applying it:

- **The adoption entry.** Strategy's January 1, 2025 adjustment raised digital assets by $17,881 million (from $23,909 million to $41,790 million), lowered deferred tax assets by $1,166 million, raised deferred tax liabilities by $3,969 million, and raised retained earnings by $12,746 million, from a $2,167 million deficit to $10,580 million.
- **Early adoption.** BitMine adopted on September 1, 2024, at the start of its fiscal year.
- **The enforceable-rights criterion.** SharpLink's liquid staking tokens "do not fall in the scope of ASC 350-60" because each carries "an enforceable right to redeem ETH for which it was exchanged," failing ASC 350-60-15-1(b); they stay under the old model, at cost less impairment with no write-up. Natively staked ETH is in scope. The same asset economically, held two ways, is measured two ways.
- **Stablecoins.** A fiat-backed stablecoin gives its holder a right to redeem from the issuer, which is why stablecoins sit outside the crypto asset subtopic and are classified by their own terms; Coinbase changed its policy effective December 31, 2025 to classify payment stablecoins (USDC, EURC, PYUSD) as cash equivalents rather than financial instruments under ASC 310, applied retrospectively.
- **The price.** Fair value is a Level 1 measurement in the principal market: Strategy names Coinbase as principal market; BitMine uses the Coinbase price at midnight UTC. Crypto has no close, so the policy must name the market and the time.

### Worked numbers: a quarter under both models

My own example. A company buys 100 BTC on January 2 at $85,000 ($8,500,000). The intraday low during the first quarter is $76,000; March 31 closes at $82,000; June 30 at $95,000; the company sells all 100 BTC on July 15 at $95,000.

```text
                         old model (impairment)              ASU 2023-08 (fair value)
Q1  carrying amount      8,500,000 → 7,600,000 at the low    8,200,000 at March 31
    P&L                  impairment −900,000                 fair value loss −300,000
Q2  carrying amount      7,600,000 (no write-up)             9,500,000 at June 30
    P&L                  0                                   fair value gain +1,300,000
Q3  sale at 9,500,000    realized gain +1,900,000            gain on sale 0 (already at fair value)
total P&L                +1,000,000                          +1,000,000
```

Both models earn the same $1,000,000 over the holding period; they disagree about when. The impairment model front-loads a loss to the worst minute of the quarter and back-loads all the gain to the sale, so a holder who never sells shows only losses. Fair value shows what the asset was worth on each balance sheet date. For the system the difference is in the data: the old model needed the lowest tick since acquisition per lot; fair value needs one price per asset per reporting date from a named market at a named time, which is the same `price_marks` a platform already keeps ([Chain Data & Indexing](/books/investing-and-digital-assets/chain-data-and-indexing)).

### Deferred taxes

Fair value gains aren't taxable until sale, so they create deferred tax liabilities. At an assumed 21% rate, the Q2 gain above of $1,300,000 creates $273,000 of deferred tax expense and liability, reversed when the coins are sold and the gain becomes current tax. At scale this is large: Strategy's adoption entry moved deferred taxes by $5.1 billion net, its third quarter of 2026 carried a $1,409 million tax provision on a $20.9 billion digital asset gain, and its deferred tax liabilities stood at $1,404 million at September 30, 2026 (down from $1,926 million at December 31, 2025). The tax basis comes from the lot engine, not the fair value book, so the two have to be kept side by side per lot.

## SAB 121 and SAB 122

SAB 121, issued in March 2022, said "it would be appropriate for entities with an obligation to safeguard crypto assets to record a safeguarding liability," with a matching asset, at fair value, as the SEC's 2026 custody release summarizes it. For an exchange, the result was a balance sheet grossed up by every coin held for customers; for a bank subject to capital rules, a liability that made custody uneconomic.

SAB 122, released January 23, 2025 and effective January 30, 2025, rescinded SAB 121 (Topic 5.FF). An entity now decides whether to recognize a liability for the risk of loss on safeguarded assets under ASC 450-20 (US GAAP) or IAS 37 (IFRS), as for any other contingency, applied "fully retrospective basis in annual periods beginning after December 15, 2024," with earlier application allowed and the effects disclosed. Coinbase adopted "as of December 31, 2024 on a retrospective basis," and its 2025 10-K shows the outcome: customer crypto and stablecoins of $376.1 billion at fair value "are not recognized in the Consolidated Balance Sheets," with "a corresponding unrecognized liability," and "since the risk of loss is remote, the Company did not recognize a contingent liability."

For a custodian's system, the change moved the work from the balance sheet to the evidence. "Remote" is a judgment management makes each period and auditors test, and it rests on records: segregation, key controls, insurance, loss history, the legal analysis of title. The `safeguarding_assessments` table below is that judgment as a record.

## Custody Disclosures

What a reader of a custodian's or a fund's filing expects to find, and what the system has to produce for it:

- **Customer holdings at fair value**, in total and, where significant, by asset. Coinbase discloses the $376.1 billion total; I didn't find a per-asset breakdown in the sections I read.
- **Where the assets are and who holds them.** The ETP filings name every custodian, the Vault and Trading Balances, the trade credit lien, and the liability cap; [Qualified Custody](/books/investing-and-digital-assets/qualified-custody) covers what those terms mean.
- **The title position.** Coinbase's UCC Article 8 statement and its warning that crypto "may be considered to be the property of a bankruptcy estate."
- **Hot wallet exposure.** Coinbase seeks to hold "no more than 2% of assets under custody" in hot wallets.
- **Rollforwards for own holdings.** IBIT's bitcoin rollforward for 2025 (354,176 bought, 133,644 sold for redemptions, 1,658 sold for expenses) and Strategy's quarterly purchases and sales are the pattern: opening units, additions, dispositions, closing units, cost and fair value.

## Digital Asset Treasury Companies

A digital asset treasury company is a listed company whose main asset is a crypto position bought with the proceeds of stock, convertible notes and preferred stock. Strategy is the largest and calls itself "the world's first and largest Bitcoin Treasury Company"; 2025 brought a wave of companies doing the same with ether and other assets, among them BitMine, whose ether strategy began "late June 2025," and SharpLink.

Strategy's capital stack at September 30, 2026 shows what funds the position:

| Layer | Detail | Amount |
| --- | --- | --- |
| Bitcoin | About 847,666 BTC; cost $63.9 billion (about $75,437 each); fair value $70.8 billion | Asset |
| Convertible notes | 2028, 2029, 2030A, 2030B, 2031 and 2032 series | $6,714 million principal |
| Preferred stock | STRF (10%), STRC (variable, 12% as of October 2026), STRK (8%), STRD (10%), and STRE (listed in Luxembourg) | $14,110 million liquidation preference |
| Common stock | 402,714,357 Class A and 19,640,250 Class B (October 25, 2026) | 422,354,607 shares |
| USD Reserve | Cash held for dividends and interest (October 25, 2026) | $4.83 billion |

The 8-K of November 2, 2026 reported 849,327 BTC at an aggregate cost of $64.08 billion, $75,451 each "inclusive of fees and expenses."

Treasury companies report their own KPIs alongside GAAP. Strategy's definitions: "BTC Yield represents the percentage change in BPS (in Sats) over a period," where Bitcoin Per Share is "the ratio between the Company's gross bitcoin holdings and its Assumed Diluted Shares Outstanding"; "BTC Gain represents the BTC Yield for a period in gross bitcoin terms." Year to date to October 25, 2026, Strategy reported a BTC Yield of (3.7)%: its bitcoin per diluted share fell even as its holdings grew, because shares and their equivalents grew faster. SharpLink's equivalent is "ETH Concentration," Total ETH Holdings per 1,000 basic-equivalent shares, counting liquid staking tokens "on an as-if-redeemed basis."

### Worked numbers: mNAV

The market's measure of a treasury company is mNAV: what the market pays for the company relative to the crypto it holds. The filings I opened don't define it, and companies and analysts compute it differently, so the definition below is the common one and the share price is assumed.

```text
bitcoin NAV                 847,666 BTC at fair value           70,824,007,000
shares (basic)              402,714,357 + 19,640,250            422,354,607
share price (assumed)       250.00
market capitalization       422,354,607 × 250.00                105,588,651,750

mNAV, market cap basis      105,588,651,750 / 70,824,007,000    1.49
enterprise value            market cap + converts 6,713,659,000 + preferred 14,109,839,000
                            − USD reserve 4,830,000,000          121,582,149,750
mNAV, enterprise basis      121,582,149,750 / 70,824,007,000    1.72

bitcoin per share (basic)   847,666 / 422,354,607                0.00200700 BTC (200,700 sats)
NAV per share               70,824,007,000 / 422,354,607         167.69
```

The two bases give different answers because converts and preferreds have claims on the bitcoin ahead of common stock; an mNAV that ignores them overstates how much bitcoin each common share is backed by. The engine of the model is the premium: above 1.0, issuing stock at market and buying bitcoin raises bitcoin per share for existing holders; below 1.0, issuing stock dilutes them, and the company's options turn to buybacks (SharpLink repurchased 2,132,773 shares in its second quarter of 2026) or selling the asset. A treasury company's investor page is a daily job that joins holdings, the capital stack and the share price, and the definitions behind each KPI need to be published and versioned like a fee schedule.

## Audits and Reserve Reports

A financial statement audit and a reserve report answer different questions ([Attestation Versus Audit](/books/investing-and-digital-assets/proof-of-reserves#attestation-versus-audit)). For crypto on a balance sheet the auditor tests existence (the company controls the keys to addresses holding the units, at the date), rights (the coins aren't pledged or held for others), and valuation (the principal market and the price). Existence is tested on chain: signed messages from the addresses or transactions the company makes on request, and balances at the balance sheet block. Rights are tested in the records: Strategy discloses bitcoin "pledged under trade credit arrangements," with none outstanding at September 30, 2026. Valuation is the easy part once the policy names the market.

For customer crypto off the balance sheet, the audit question is the safeguarding judgment and the disclosure, and the evidence is the custody records: holdings by customer reconciled to the chain, the controls, the insurance. A proof of reserves can complement that and can't replace it.

## How a Platform's Books Show Customer Crypto

A platform keeps two books of the same coins. The operational ledger is double entry in every asset: a customer's 2 BTC is a customer line in BTC balanced by an omnibus line in the wallet where the coins sit ([Omnibus and Segregated](/books/investing-and-digital-assets/ledgers-and-positions#omnibus-and-segregated)). The GAAP books don't carry those coins at all after SAB 122, only the platform's own crypto at fair value, its fees and its revenue. The mapping between the two is a rule per `ledger_account`:

| Operational ledger account | GAAP treatment |
| --- | --- |
| `customer` lines and the `omnibus` lines that hold them | Off balance sheet; disclosed at fair value; safeguarding contingency assessed |
| `firm` lines in crypto | Own crypto assets at fair value (in scope of ASU 2023-08) or other classification (stablecoins, liquid staking tokens) |
| `fees` in crypto | Revenue when earned, at fair value then; the coins become own crypto |
| Customer collateral pledged to the firm | Off balance sheet unless the firm may sell or repledge it ("customer collateral not recognized," as Coinbase reports) |
| Crypto the firm borrowed | Liability at fair value (Coinbase's crypto asset borrowings) |

A coin that moves from a `customer` line to a `fees` line changes GAAP treatment at that moment, so the GAAP export reads journal lines by ledger account, never wallet balances.

## How to Build It

Fair value is a measurement per instrument per reporting date; safeguarding is a dated judgment with its evidence:

```sql
CREATE TABLE fair_value_measurements (     -- one price per instrument per reporting cut
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id       UUID NOT NULL REFERENCES legal_entities (id),
  instrument_id         UUID NOT NULL REFERENCES instruments (id),
  measured_at           TIMESTAMPTZ NOT NULL,      -- the policy's cut: 00:00 UTC, 16:00 ET, ...
  principal_market      TEXT NOT NULL,             -- venue named in the policy
  price_cents_per_unit  NUMERIC(38, 12) NOT NULL,  -- per whole unit
  level                 SMALLINT NOT NULL CHECK (level IN (1, 2, 3)),
  scope                 TEXT NOT NULL CHECK (scope IN ('asc_350_60', 'stablecoin',
                          'out_of_scope_intangible', 'investment_company')),
  price_mark_id         UUID,                      -- the stored mark it came from
  UNIQUE (legal_entity_id, instrument_id, measured_at)
);

CREATE TABLE safeguarding_assessments (    -- the SAB 122 / ASC 450-20 judgment, per period
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id       UUID NOT NULL REFERENCES legal_entities (id),
  period_end            DATE NOT NULL,
  customer_assets_cents BIGINT NOT NULL,           -- at fair value, for the disclosure
  by_instrument         JSONB NOT NULL,            -- units and fair value per significant asset
  loss_likelihood       TEXT NOT NULL CHECK (loss_likelihood IN ('remote',
                          'reasonably_possible', 'probable')),
  liability_cents       BIGINT NOT NULL DEFAULT 0,
  evidence              JSONB NOT NULL,            -- reconciliations, attestations, policies, legal memos
  approved_by           UUID NOT NULL REFERENCES parties (id),
  UNIQUE (legal_entity_id, period_end),
  CHECK (loss_likelihood <> 'remote' OR liability_cents = 0)
);

ALTER TABLE journal_lines ADD COLUMN gaap_treatment TEXT,
  -- NOT VALID: new rows checked now; validate after any backfill, without blocking writes
  ADD CONSTRAINT journal_lines_gaap_treatment_check
    CHECK (gaap_treatment IN ('on_balance_sheet', 'off_balance_sheet', 'revenue', 'liability')) NOT VALID;
```

The period-end close for crypto then runs in a fixed order: freeze the ledger at the cut, take `fair_value_measurements` for every instrument the entity holds for itself, compute the fair value change against the prior measurement per lot and post it (with the deferred tax entry from the lot engine's tax basis), aggregate customer holdings by instrument at the same prices for the disclosure, and record the safeguarding assessment with its evidence. The `scope` column is set per instrument when it's listed and reviewed when its terms change, because a token's classification decides which model measures it, and SharpLink's two kinds of staked ether show how easily one economic position splits across both.

## Auditing

What an auditor of a crypto-holding company or a custodian asks for:

- **Every fair value measurement** with its market, time, level and source mark, and the policy that chose them.
- **Existence evidence** for own holdings: addresses, balances at the reporting block, and control proofs.
- **Rights evidence**: pledges, liens and trade credits outstanding at the date.
- **The scope decision per instrument** and when it changed.
- **The safeguarding assessment** per period with its evidence, and customer holdings reconciled to the chain.
- **Tax basis by lot** alongside the fair value book, and the deferred tax computed from the difference.

## What This Means for the System You Build

- Name the principal market and the measurement time in the policy, and store one measurement per instrument per cut.
- Keep tax basis per lot next to fair value, because deferred taxes come from the difference.
- Classify every instrument for accounting scope at listing: in-scope crypto, stablecoin, or a token with enforceable rights.
- Map ledger accounts to GAAP treatment, and build the GAAP export from journal lines, not wallet balances.
- Record the safeguarding judgment as a dated assessment with its evidence; "remote" is something to prove every period.
- For a treasury company, publish KPI definitions, compute them daily from holdings and the capital stack, and version them.

## References

**Regulators and guidance**

- [SEC: Staff Accounting Bulletin 122](https://www.sec.gov/rules-regulations/staff-guidance/staff-accounting-bulletins/staff-accounting-bulletin-122), release and effective dates, rescission of Topic 5.FF, ASC 450-20 and IAS 37, and transition
- [SEC: Adviser and Regulated Fund Custody Rules; Crypto Custody Rules, proposed rule (October 6, 2026)](https://www.federalregister.gov/documents/2026/10/06/2026-20466/adviser-and-regulated-fund-custody-rules-crypto-custody-rules), the description of SAB 121 and its rescission

**Filings**

- [Strategy: Form 10-K for 2024, digital assets policy (Note 2)](https://www.sec.gov/Archives/edgar/data/1050446/000095017025021814/R12.htm), the indefinite-lived intangible model, lowest-price impairment, no write-up and gains on sale
- [Strategy: Form 10-K for 2024, recent accounting standards (Note 3)](https://www.sec.gov/Archives/edgar/data/1050446/000095017025021814/R13.htm), ASU 2023-08 issuance, adoption plan and the expected retained earnings increase
- [Strategy: Form 10-K for 2024](https://www.sec.gov/Archives/edgar/data/1050446/000095017025021814/mstr-20241231.htm), 2023 impairment losses ([Note 1](https://www.sec.gov/Archives/edgar/data/1050446/000095017025021814/R11.htm): the "first and largest Bitcoin Treasury Company")
- [Strategy: Form 10-Q for the first quarter of 2025, Note 2](https://www.sec.gov/Archives/edgar/data/1050446/000095017025063536/R10.htm), adoption on January 1, 2025, fair value through net income and the cumulative-effect adjustment ([adoption schedule](https://www.sec.gov/Archives/edgar/data/1050446/000095017025063536/R36.htm))
- [Strategy: Form 10-Q for the third quarter of 2026](https://www.sec.gov/Archives/edgar/data/1050446/000105044626000060/mstr-20260930.htm), holdings, cost and fair value, principal market, gains, tax provision, deferred tax liabilities, shares, preferred stock, convertible notes and pledged bitcoin
- [Strategy: Third quarter 2026 earnings release (8-K exhibit)](https://www.sec.gov/Archives/edgar/data/1050446/000105044626000047/mstr-20261029x8kxex9912.htm), BTC Yield, BTC Gain and Bitcoin Per Share definitions, year-to-date figures and the USD Reserve
- [Strategy: Form 8-K (November 2, 2026)](https://www.sec.gov/Archives/edgar/data/1050446/000119312526442707/mstr-20261102.htm), holdings and average cost
- [BitMine Immersion Technologies: Form 10-K for the year ended August 31, 2025](https://www.sec.gov/Archives/edgar/data/1829311/000149315225024679/form10-k.htm), early adoption, the ASU's effective date, the Coinbase midnight UTC price, FIFO cost, holdings and the start of the ether strategy
- [SharpLink: Form 10-Q for the second quarter of 2026](https://www.sec.gov/Archives/edgar/data/1981535/000149315226036620/form10-q.htm), native and liquid staked ETH, the ASC 350-60 scope exclusion, impairments, ETH Concentration and the buyback
- [Coinbase Global: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/coin-20251231.htm), SAB 122 adoption, customer crypto not recognized, the remote-loss conclusion, the UCC Article 8 position, the hot wallet target and the payment stablecoin reclassification
- [Coinbase Global: Form 10-Q for the third quarter of 2026](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000122/coin-20260930.htm), customer collateral not recognized and crypto asset borrowings
- [iShares Bitcoin Trust: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1980994/000143774926006058/bit20251231_10k.htm), fair value, unrealized loss and the 2025 bitcoin rollforward
