+++
title = "The Spend Management Business"
description = "How corporate card and expense platforms make money: commercial interchange, rewards as a share of it, subscriptions, float, losses and who owns the receivable."
category = "Banking & Lending Industry"
order = 2462
part = "Spend Management"
tags = ["banking", "spend-management", "corporate-cards", "interchange", "rewards", "fintech"]
+++

Spend management is a corporate card with software around it: cards issued per employee, vendor or purpose, controls on what each may buy, receipts matched to every purchase, approvals, reimbursements, bill pay and an accounting sync. The software is usually free or cheap. What pays for it is the card: every purchase on a commercial card earns interchange, the highest the networks pay on any card product, and the card is a charge card paid in full each cycle, so the receivable stays short. The companies selling it range from card-first startups to expense software vendors that added a card, travel agencies that added expense, and banks that bought one: Capital One completed its acquisition of Brex on April 7, 2026 ([The Banking Landscape](/books/banking-and-lending/banking-landscape#who-owns-whom-recent-moves)).

This part of the volume covers that business. This chapter is the economics: who the players are, where commercial interchange goes, how much of it rewards hand back, what subscriptions, float and deposits add, what losses and funding cost, and how the filings present each line. [Corporate Cards & Underwriting](/books/banking-and-lending/corporate-cards) covers the credit (limits from cash balances, payment cycles, liability, who owns the receivable), [Virtual Cards & Spend Controls](/books/banking-and-lending/card-controls) the policy layer that decides who may spend what, and [Receipts, Expense Policy & Audit](/books/banking-and-lending/expense-management) what happens after the purchase. The issuing stack underneath (BIN sponsors, program managers, processors, the law of commercial cards) is the Payments volume's [Card Issuing](/books/payments/card-issuing#what-gets-built-on-issuing), and the authorization path is its [Issuer Processing](/books/payments/issuer-processing#spend-controls). Business deposit accounts, sweeps and treasury, which most of these platforms also sell, are the Business Banking part (Business Accounts & Startup Banking, Sweeps, Reciprocal Deposits & Yield, Treasury Management).

## How the Platforms Do It

What the public filings and company pages say about each platform's card and revenue, as of October 2026:

| Company | Card and issuing banks | Revenue lines disclosed | Scale disclosed |
| --- | --- | --- | --- |
| **BILL** (Spend & Expense, formerly Divvy) | Visa and Mastercard charge cards issued by Cross River Bank, WEX Bank and WebBank; BILL underwrites under its credit policies and buys a 100% participation in each receivable | Interchange (gross or net of issuing bank fees by principal or agent), with rewards as an expense; interest on funds held for customers | About $26.4 billion of card volume and $675.6 million of Spend & Expense transaction revenue in fiscal 2026 (year to June 30) |
| **Expensify** | Expensify Card, a Visa corporate card issued by The Bancorp Bank, N.A. | Subscriptions billed per active member; interchange recognized gross as principal; cash back as contra revenue | $142.1 million of 2025 revenue, $21.3 million of it interchange; 650,000 paid members across 39,700 companies in Q4 2025 |
| **Ramp** | Visa corporate charge card; issuing bank not named on the pages I opened | A portion of interchange, the Ramp Plus subscription, and fees for services such as international and same-day payments; no interest income | 85,000 businesses and more than $2 billion of annualized revenue (company blog, October 15, 2026) |
| **Brex** (Capital One since April 7, 2026) | Brex's own terms not retrievable this round | Not disclosed separately by Capital One | About 25,000 companies and about $13 billion of customer deposits at partner banks and money market funds, at announcement |
| **Navan** | Navan corporate card offered by partner issuers, which its 10-K names as Brex, Rho, Citi, Barclays and Citizens Bank | Usage-based travel revenue (supplier commissions), subscriptions for expense, and fees from payment partners on card spend volume | $702.3 million of revenue in fiscal 2026 (year to January 31), $9.1 billion of gross booking volume, $4.1 billion of payment volume |
| **American Express** | Its own corporate, purchasing and virtual products, as issuer and network | Discount revenue, card fees and B2B payment products in its Commercial Services segment | Bought Center, an expense management software company, in 2025; integrates with SAP Concur and Emburse |
| **WEX** | WEX Bank, a Utah industrial bank, funds much of its fleet and corporate payments business | Fleet: a percentage of fuel volume or a fee per transaction, account servicing fees and finance charges on overdue accounts; corporate payments: mainly net interchange | Closed-loop fleet network at more than 90% of US fuel locations |

<!-- source-gap: brex-card-terms | missing | Brex's card terms, issuing bank, underwriting basis, payment cadence and guarantee policy | closes with: brex.com legal and help center pages, which returned HTTP 429 on every attempt (and Wayback was unreachable) | checked: 2026-10-29 -->

Three things stand out. **Every one of them is a program on someone else's charter** except Amex and, now, Brex inside Capital One: the bank issues, and the platform underwrites, services and shares the interchange, which is the sponsor model in [Banking as a Service](/books/banking-and-lending/banking-as-a-service) pointed at businesses. **The revenue is interchange first and software second:** Navan earns more from bookings than from software, BILL's card revenue outgrew its subscriptions, and Ramp's own help center lists interchange before its subscription. **The same economics are presented three ways.** BILL books rewards as a sales and marketing expense (until its September 2026 quarter), Expensify nets cash back against revenue, and an agent presenting interchange net of the bank's share shows a smaller number for the same business. Comparing platforms means rebuilding each one's lines on a common basis, which is what the worked numbers below do.

## The Players

The market sorts by what each company sold first, because that decides where it's strong and what it bolts on:

- **Card-first platforms** (Ramp, Brex, BILL's Divvy, Mercury's IO card) started with a charge card underwritten on the company's cash, then added expense, bill pay, procurement, travel and business accounts. Their revenue is mostly interchange, so they push spend onto the card.
- **Expense software that added a card** (Expensify, SAP Concur, Emburse) started from receipts and reports. Their revenue is mostly subscriptions; a card adds interchange and puts the transaction feed under their control instead of a bank's card file. Concur's "Bank Card Feeds" import transactions from cards issued by others, which is the model a card-first platform replaces.
- **Travel-led platforms** (Navan, Amex GBT) earn supplier commissions and fees on bookings, and add expense and cards to keep the trip and its spend in one system. Business Travel & Duty of Care covers the travel side.
- **Banks and networks** (American Express, Capital One, the large commercial card issuers) hold the charter and the balance sheet. Amex's purchase of Center in 2025 and Capital One's of Brex in 2026 are the same move from opposite ends: the bank buying the software layer.
- **Payroll and HR platforms** fold spend into the employee record, and **fleet and payables specialists** (WEX, Corpay) run closed networks and virtual card payables; payables economics are in the Payments volume's [Vendor Payouts](/books/payments/vendor-payouts#virtual-cards-who-pays-for-the-rebate).

## Commercial Interchange

Interchange on a commercial card is higher than on consumer credit, and it depends on the data the merchant sends: Visa's current schedule prices a card-not-present commercial payment at 2.70% + $0.10, a payment with full line-item data in its top enhanced-data category at 1.75% + $0.10, and a non-qualifying one at 2.95% + $0.10. The tables and the Level 3 program are in [Level 2 and Level 3 Data](/books/payments/interchange-and-pricing#level-2-and-level-3-data); for the issuer, the point is that the same dollar of spend earns different amounts by merchant, channel and data, so revenue per dollar is a measured mix, not a constant.

The interchange arrives at the issuing bank, which keeps its share and remits the rest under the program agreement ([The Economics](/books/payments/card-issuing#the-economics)):

- **The bank's share** is a percentage of volume, a per-transaction fee, a share of net revenue or a monthly minimum; the volume's `program_revenue_terms` records it the same way for a consumer debit program ([Neobanks & Consumer Fintech](/books/banking-and-lending/neobanks#interchange)).
- **Network and processor fees** come out next: per transaction, per card, per service.
- **What's left goes to the program manager,** which may share it again with a platform that distributes its cards.

**Gross or net is an accounting judgment, not a fact about the cash.** BILL says it recognizes interchange "gross or net of fees paid to the Issuing Banks" depending on whether it's the principal or the agent under each agreement; Expensify recognizes interchange gross because it's the principal in the card program. A program manager that controls the card product, sets the rewards and carries the credit risk usually concludes it's the principal; one that refers cards for a bank usually doesn't. The ledger has to carry the gross interchange, the bank's share and each fee as separate lines whatever the income statement shows, because the program agreement settles on gross and the auditors decide the presentation ([The Product Keeps Facts, Finance Picks Policy](/docs/payments/accounting#the-product-keeps-facts-finance-picks-policy)).

## Rewards as a Share of Interchange

Cash back and points are how card-first platforms compete, and they're paid out of interchange. The filings give the size:

- **BILL:** rewards expense rose from 49% to **51%** of Spend & Expense interchange revenue in fiscal 2026, mainly from higher reward rates. BILL recorded it in sales and marketing expense, and on August 19, 2026 announced it would "net rewards expense directly from core revenue (and total revenue)" starting with the quarter ending September 30, 2026, guiding to **$401.5 million** of rewards expense for fiscal 2027.
- **Expensify:** cash back cost **$10.1 million** in 2025 against **$21.3 million** of interchange, about 47%, recorded as contra revenue because it's consideration payable to a customer. The rate is tiered by the customer's spend: 2% on US purchases for companies with more than $250,000 of monthly settled US spend, 1% below.
- **Ramp** says it doesn't profit from interest on carried balances, so interchange less rewards and costs is most of its card margin.

Two consequences for a system. **A reward is a price,** set per customer tier and changed by contract, so it belongs in versioned rules with effective dates, like any price ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)). And **the rate a customer earns depends on their volume over a period,** which means a month's rewards can't be final until the month's spend is: accrue at the expected tier, true up at period end, and keep the inputs. Whether rewards then show as expense or contra revenue is the accountants' choice, which BILL changed mid-2026 without changing a dollar of what customers earned.

## Subscriptions and Software Fees

Software revenue is smaller for the card-first players and larger for the rest:

- **Ramp** lists a free plan at $0 per user per month, Plus at $15 per user per month plus a platform fee based on team size, and custom Enterprise pricing; procurement is an add-on to Plus or Enterprise.
- **Expensify** bills its plans at the start of each month on the prior month's active policy members, and subscription fees were about $130.5 million of its 2025 revenue.
- **Navan** earned $61.9 million of subscription revenue in fiscal 2026 against $640.4 million of usage-based revenue.

A subscription priced per active user means the platform must define "active" exactly (a member who submitted an expense, held a card, or approved one) and keep the count that produced each invoice. The billing mechanics (periods, proration, dunning, renewal law) are the playbook's [Subscriptions](/docs/payments/subscriptions); the industry twist is that rewards can pay the subscription, so the rewards ledger and the billing system have to agree on what was redeemed.

## Float, Deposits and Funding

Money sitting with the platform earns, and receivables owed to it cost:

- **Float.** BILL earned $148.4 million of interest on funds held for customers in fiscal 2026, about 9% of revenue, down from $161.8 million (11%) as rates fell. That's payables float (money between the payer's debit and the vendor's credit) more than card float, and it moves with the federal funds rate.
- **Deposits.** A platform that also runs business accounts earns a share of what the sponsor bank pays on the balances, or an advisory fee on money market sweeps: Brex held about $13 billion of customer deposits at partner banks and money market funds when Capital One agreed to buy it. How those balances are insured and swept is Sweeps, Reciprocal Deposits & Yield.
- **Funding the receivable.** A charge card is credit for a cycle, and someone funds it. BILL buys its issuing banks' receivables and funds them mostly from its own cash plus revolving credit facilities with **$600.0 million** of capacity, **$330.0 million** drawn at June 30, 2026, secured by its Divvy card receivables with a limited guaranty from the parent. The cost of that money is a line in the program's economics, and the shorter the payment cycle, the smaller it is ([Corporate Cards & Underwriting](/books/banking-and-lending/corporate-cards#daily-weekly-or-monthly)). How such facilities work is [Warehouse Lines](/books/banking-and-lending/funding-the-book#warehouse-lines).

## Losses

Charge cards lose less than consumer revolving cards because they're paid monthly or faster and limits follow cash, but they lose. BILL reported a fraud and credit loss rate of about **0.23%** of Divvy card payment volume in fiscal 2026, and a total provision for expected credit losses of $71.1 million, of which the provision on acquired card receivables rose $9.0 million with portfolio growth. Fraud on the card is issuer fraud ([Issuer-Side Fraud](/books/payments/issuer-processing#issuer-side-fraud)); credit loss is a business that stops paying, usually because it ran out of cash, which is why underwriting watches the cash ([Limits From Cash](/books/banking-and-lending/corporate-cards#limits-from-cash)). Employee misuse is a third kind of loss that lands on the customer rather than the issuer ([Expense Fraud](/books/banking-and-lending/expense-management#expense-fraud)). How losses are reserved is [Credit Losses & CECL](/books/banking-and-lending/credit-losses-and-cecl); the lending view of loss rates is in [The Lending Business](/books/banking-and-lending/lending-business#credit-losses).

## Worked Numbers: Where a Month of Interchange Goes

A program manager's month on $1,000,000 of commercial card spend, with every assumption labeled:

| Line | Basis | Amount | Share of spend |
| --- | --- | --- | --- |
| Gross interchange | 2.50% blended (my assumption, between Visa's 1.75% enhanced-data and 2.70% standard card-not-present commercial rates) | $25,000 | 2.50% |
| Issuing bank share and network and processor fees | 0.30% of volume (my assumption; set by the program agreement) | -$3,000 | -0.30% |
| Rewards | 51% of interchange (BILL's fiscal 2026 ratio) | -$12,750 | -1.28% |
| Fraud and credit losses | 0.23% of volume (BILL's fiscal 2026 rate) | -$2,300 | -0.23% |
| Funding the receivable | Monthly terms: half a cycle of spend before the statement plus about two weeks to pay, so an average receivable of about one month of spend, $1,000,000, at 5% a year (my assumption) | -$4,167 | -0.42% |
| **Card contribution** | | **$2,783** | **0.28%** |

Change the payment terms and the funding line almost disappears: on daily terms the average receivable is about one day of spend, roughly $33,000, which costs about $137 a month at the same rate, and contribution rises to about $6,813 (0.68% of spend). That's the economic reason card-first platforms push customers toward daily or weekly payment and cash-secured limits, and it's before any subscription revenue.

The same month presented three ways:

- **Gross, rewards as expense** (BILL before September 2026): revenue $25,000, with $12,750 in sales and marketing.
- **Gross, rewards as contra revenue** (Expensify, and BILL from September 2026): revenue $12,250.
- **Net of the bank's share, rewards as contra revenue:** revenue $9,250 if the bank's share and fees are netted too.

Contribution is $2,783 in all three. A dashboard that compares "revenue" across programs on different conventions is comparing presentations, which is why the ledger keeps each line and derives the presentation.

## How to Build It

These are deltas against [The Core Data Model](/books/banking-and-lending/banking-business#the-core-data-model). A spend program is a `programs` row at the issuing institution (product scope including `'commercial_charge'`), and the Payments volume's `card_programs` row for the same program points at it; cards, card accounts and authorizations stay in [Card Issuing](/books/payments/card-issuing#how-to-build-it) and [Issuer Processing](/books/payments/issuer-processing#how-to-build-it). The bank's share of interchange reuses `program_revenue_terms` and `program_revenue_statements` from [Neobanks & Consumer Fintech](/books/banking-and-lending/neobanks#how-to-build-it) with `line = 'credit_interchange'`; subscriptions post through `fee_assessments`. This chapter adds the link between the two program tables, the rewards rules and ledger, and the monthly economics.

```sql
ALTER TABLE card_programs                    -- the Payments program, mapped to the bank's program record
  ADD COLUMN program_id UUID REFERENCES programs (id);

CREATE TABLE card_rewards_rules (            -- a reward is a price: versioned, effective-dated
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  program_id          UUID NOT NULL REFERENCES programs (id),
  rule_key            TEXT NOT NULL,         -- stable across versions, e.g. 'cashback-us-tiered'
  version             INT NOT NULL,
  kind                TEXT NOT NULL CHECK (kind IN ('cash_back', 'points', 'statement_credit')),
  tier_basis          TEXT NOT NULL CHECK (tier_basis IN ('none', 'monthly_settled_spend',
                        'trailing_90d_spend', 'contract')),
  tiers               JSONB NOT NULL,        -- [{"min_spend": 25000000, "rate_bps": 200}, {"min_spend": 0, "rate_bps": 100}]
  scope               JSONB NOT NULL,        -- which spend earns: domestic only, excluded MCCs, card types
  accounting_treatment TEXT NOT NULL CHECK (accounting_treatment IN ('contra_revenue', 'expense')),
  valid_during        TSTZRANGE NOT NULL,
  UNIQUE (rule_key, version)
);

CREATE TABLE card_rewards_entries (          -- append-only: earned, trued up, redeemed, forfeited
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  card_account_id     UUID NOT NULL REFERENCES card_accounts (id),
  rule_id             UUID REFERENCES card_rewards_rules (id),
  clearing_record_id  UUID REFERENCES clearing_records (id),  -- the purchase that earned it
  kind                TEXT NOT NULL CHECK (kind IN ('accrual', 'tier_true_up', 'reversal',
                        'redemption', 'forfeiture')),
  amount              BIGINT NOT NULL,       -- minor units; negative for reversals and redemptions
  period              DATERANGE NOT NULL,    -- the tier period it counts toward
  redeemed_as         TEXT CHECK (redeemed_as IN ('statement_credit', 'cash', 'subscription',
                        'travel', 'gift_card')),
  journal_entry_id    UUID NOT NULL REFERENCES journal_entries (id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE card_program_economics_monthly (  -- every line kept, presentation derived
  program_id          UUID NOT NULL REFERENCES programs (id),
  month               DATE NOT NULL,
  spend_volume        BIGINT NOT NULL,       -- cleared purchases less refunds
  gross_interchange   BIGINT NOT NULL,
  bank_share          BIGINT NOT NULL,       -- from program_revenue_statements
  network_processor_fees BIGINT NOT NULL,
  rewards             BIGINT NOT NULL,       -- sum of card_rewards_entries for the month
  credit_losses       BIGINT NOT NULL,       -- charge-offs net of recoveries
  fraud_losses        BIGINT NOT NULL,
  average_receivable  BIGINT NOT NULL,       -- from daily balances of the card accounts
  funding_cost        BIGINT NOT NULL,       -- interest on the facility or the cost of cash used
  subscription_revenue BIGINT NOT NULL,
  float_income        BIGINT NOT NULL,
  computed_at         TIMESTAMPTZ NOT NULL,
  inputs_ref          TEXT NOT NULL,         -- the snapshot the row was computed from
  PRIMARY KEY (program_id, month)
);
```

Design notes:

- **One program, two records, one link.** The bank sees a `programs` row with its agreement and scope; the issuing stack sees a `card_programs` row with its BIN, processor and network. `card_programs.program_id` lets a sponsor bank's oversight queries ([Sponsor Bank Oversight](/books/banking-and-lending/sponsor-bank-oversight#how-to-build-it)) and the card economics join without copying either.
- **Rewards post when they're earned, not when they're paid.** Each cleared purchase writes an `accrual` at the rate the current tier implies; period end writes a `tier_true_up` when the customer's spend landed in a different tier; a refund writes a `reversal`. The liability for unredeemed rewards is the sum of the entries, never a balance column, and each entry posts a journal entry to a rewards liability GL account, so the presentation choice (`accounting_treatment`) changes the income statement mapping, not the entries.
- **Redemptions that pay the subscription** are a `redemption` entry and a `fee_assessments` row settled by it, so the billing system and the rewards ledger reconcile by a join.
- **Economics are derived and frozen.** `card_program_economics_monthly` is computed from the ledger, the bank's revenue statements, the loss records and the daily receivable balances, with the inputs snapshot kept, so a board deck's contribution number can be rebuilt ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).

## Auditing

The issuing bank, the platform's auditors, investors who fund the receivables and, for a public company, the SEC all read these numbers. The general design is in [Audit Trails](/docs/architecture/audit-trails). Make sure the record shows:

- **Interchange by source:** what the bank received, what it retained under which term version, what it remitted, and the reconciliation of the remittance to the program's own transactions.
- **Every reward earned and redeemed,** with the rule version, the tier and the spend that qualified, and the true-up at period end.
- **The principal or agent conclusion** behind gross or net presentation, with the agreement terms it rests on, and the date of any change in presentation.
- **Subscription invoices with their active-user counts** and the definition of active in force.
- **Losses by kind** (fraud, credit, customer-borne misuse) and the receivable balances and funding cost each month's economics used.

## What This Means for the System You Build

- **Treat interchange as a measured mix,** by card product, merchant category, channel and data level, never a single rate.
- **Keep gross interchange, the bank's share, fees and rewards as separate ledger lines,** and derive gross or net presentation from them.
- **Version rewards as prices,** with tiers by period spend, accruals at the expected tier and true-ups at period end.
- **Model funding cost against the payment cycle,** because monthly terms can cost more than the losses.
- **Link the issuing program to the bank's program record,** so oversight and economics query the same thing.
- **Freeze each month's program economics with their inputs,** so the numbers in front of investors and the bank can be rebuilt.

## References

**Filings**

- [BILL Holdings: Form 10-K for the fiscal year ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/0001786352/000162828026058238/bill-20260630.htm), the issuing banks (Cross River Bank, WEX Bank, WebBank), underwriting under BILL's policies, the 100% participation and purchase obligation, about $26.4 billion of card volume, $675.6 million and $555.0 million of Spend & Expense transaction fees, rewards rising from 49% to 51% of interchange, gross or net recognition by principal or agent, the 0.23% fraud and credit loss rate, the $71.1 million provision, $148.4 million of interest on customer funds (about 9% of revenue), and the $600.0 million facilities with $330.0 million drawn, secured by card receivables with a limited guaranty
- [BILL Holdings: Fiscal fourth quarter 2026 results (Form 8-K exhibit 99.1, August 19, 2026)](https://www.sec.gov/Archives/edgar/data/0001786352/000162828026057932/bill-20260630xexx991.htm), netting rewards expense from revenue from the quarter ending September 30, 2026 and $401.5 million of fiscal 2027 rewards guidance
- [Expensify: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1476840/000147684026000009/exfy-20251231.htm), The Bancorp Bank as issuer, 650,000 paid members across 39,700 companies, billing on active members, $21.3 million of interchange recognized gross as principal, $10.1 million of cash back as contra revenue, the 2% and 1% tiers at $250,000 of monthly spend, and $142.1 million of revenue
- [Navan: Form 10-K for the fiscal year ended January 31, 2026](https://www.sec.gov/Archives/edgar/data/1639723/000162828026023250/navn-20260131.htm), the card issuers named, fees on corporate card spend volume, $702.3 million of revenue, usage-based and subscription revenue, $9.1 billion of gross booking volume and $4.1 billion of payment volume
- [American Express: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/4962/000000496226000080/axp-20251231.htm), B2B payment and expense management solutions, the 2025 acquisition of Center, and the Emburse and SAP Concur integrations
- [WEX: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1309108/000130910826000010/wex-20251231.htm), the closed-loop fleet network at more than 90% of fuel locations, fleet revenue sources, net interchange in corporate payments, and WEX Bank's funding role

**Company statements**

- [Capital One: Capital One completes acquisition of Brex (April 7, 2026)](https://www.capitalone.com/about/newsroom/capital-one-completes-acquisition-of-brex/), the closing and the "integrated combination" of cards, software and banking
- [Banking Dive: Capital One to acquire Brex for $5.15B (January 23, 2026)](https://www.bankingdive.com/news/capital-one-acquire-brex-5-billion-fintech/810335/), the price, about 25,000 companies and about $13 billion of customer deposits (citing the Wall Street Journal)
- [Ramp: Ramp at $60B (October 15, 2026)](https://ramp.com/blog/ramp-at-60-billion), 85,000 businesses and more than $2 billion of annualized revenue
- [Ramp: How Ramp makes money](https://support.ramp.com/how-ramp-makes-money), a portion of interchange, Ramp Plus, supplementary services, and no interest on carried balances
- [Ramp: Pricing](https://ramp.com/pricing), Free, Plus at $15 per user per month plus a platform fee, Enterprise, and the procurement add-on
- [SAP Concur](https://www.concur.com/), its expense, travel and invoice products and Bank Card Feeds

**Related chapters**

- [Payments: Level 2 and Level 3 Data](/books/payments/interchange-and-pricing#level-2-and-level-3-data), Visa's commercial rates of 1.75%, 2.70% and 2.95% plus $0.10
