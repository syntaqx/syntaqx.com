+++
title = "Brokerage as a Service"
description = "Alpaca, Apex, Atomic and DriveWealth; disclosed versus omnibus accounts, who owns CIP, statements and records, crypto-as-a-service, and changing providers."
category = "Investing & Digital Assets Industry"
order = 2529
part = "Clearing and Settlement"
tags = ["investing", "brokerage-as-a-service", "embedded-investing", "clearing", "omnibus", "crypto-as-a-service", "apis"]
+++

Most apps that let customers buy a stock or a bitcoin are not brokers or exchanges. A neobank, a payroll app, a robo-adviser or a foreign broker reaching US markets puts its own screens in front of a regulated provider that carries the accounts, clears the trades, holds the assets and, for crypto, holds the licenses. The provider sells an API; the app sells the customer experience. This is the brokerage version of banking as a service, and it carries the same question the Synapse collapse made unavoidable: when the customer's money and shares sit with a provider and the app keeps its own records, whose ledger is the truth?

The answer is set by the structure, and there are two. In a **fully disclosed** setup the provider opens an account in each end customer's name, knows who they are, and carries the books; the app is an introducing broker or a referral partner. In an **omnibus** setup the app (itself a regulated broker or a foreign one) holds one account at the provider for all its customers and keeps the customer-level books; the provider sees one customer. Every obligation in the earlier chapters (CIP, suitability, confirms and statements, the stock record, the reserve formula, CAT reporting, tax forms, SIPC records) lands on whichever party holds the customer-level ledger, and the carrying agreement must say so.

This chapter covers the providers, the two structures, who owns which obligation, crypto-as-a-service for apps that want to offer crypto without a license per state, the contracts, and what moving providers involves. Clearing itself is in [Clearing & Settlement](/books/investing-and-digital-assets/clearing-and-settlement#self-clearing-and-introducing-brokers); the bank version of the same model, and Synapse, is Banking & Lending's [Synapse: A Post-Mortem](/books/banking-and-lending/program-ledgers#synapse-a-post-mortem).

## How the Platforms Do It

Public descriptions, as of November 2026 (alphabetical):

| Provider | Offers | Structures | Public detail |
| --- | --- | --- | --- |
| **Alpaca** | Broker API for US equities, options and crypto | Broker-dealer fully disclosed or omnibus, and RIA | Fully disclosed partners run their own CIP, which Alpaca reviews; in omnibus "end customer information (e.g. name, address) is not disclosed to Alpaca"; for RIAs "the account approval process is owned by Alpaca"; crypto through Alpaca Crypto LLC |
| **Apex Fintech Solutions** | AscendOS, "cloud-native, API-first clearing, custody, and trading" | Clearing and custody for brokers and fintechs | $280 billion or more of assets under custody, 200 or more clients and 42 million or more brokerage accounts as of September 30, 2026; 1.1 billion or more trades in the 12 months to July 31, 2026 |
| **Atomic** | Embedded investing: custom indexing, bond ladders, cash sweep, money market funds, Treasury bills, fractional stocks, funds | An "SEC-licensed investment advisor and FINRA-registered broker-dealer" (Atomic Brokerage and Atomic Invest) | Assets held at BNY Pershing and The Bank of New York Mellon |
| **DriveWealth** | Embedded investing API: US equities, ETFs, funds, fixed income, options, $1 fractional | Individual, bulk, cashless and omnibus models | In omnibus "DriveWealth has no knowledge of your individual customers" and provides "only the underlying execution and clearing infrastructure" |
| **Paxos** | Crypto brokerage and custody for other firms | A US national trust bank regulated by the OCC | "Paxos never trades against your clients"; custody "on a fiduciary basis"; Interactive Brokers is one client |
| **Zero Hash** (zerohash) | Crypto and stablecoin infrastructure | Licensed provider behind partner apps | A money transmitter "in 51 U.S. jurisdictions," a NYDFS BitLicense holder, a FinCEN and FINTRAC MSB |
| **Bakkt** | Digital asset trading, stablecoin payments, custody for partners | Licensed provider behind partner apps | Bakkt Financial Solutions I holds a New York BitLicense and money transmitter licenses where required; sold its custody trust company in 2025 |

Three patterns. **The provider's license is the product.** A partner app gets clearing memberships, a broker-dealer registration, a trust charter or 51 money transmitter licenses by contract instead of by application. **Structure decides who is the record keeper,** and the providers say so plainly in their docs. **Crypto and securities usually come from different entities,** even at one provider (Alpaca Securities and Alpaca Crypto), because the licenses and the protections differ ([One Company, Many Entities](/books/investing-and-digital-assets/regulators-and-licenses#one-company-many-entities)).

## Fully Disclosed and Omnibus

**Fully disclosed.** Each end customer has an account at the carrying broker in their own name. The carrying broker knows the customer's identity, holds the assets in its stock record against that account, sends or makes available statements and confirms, issues the 1099, includes the customer's free credits in its reserve formula, and reports the customer to CAT. The partner may be an introducing broker-dealer (which then owns suitability and its own supervision) or a non-broker app that refers customers and presents the provider's account. DriveWealth's "individual" model, in which "DriveWealth handles all cash custody and tracks each customer's balance independently," is the disclosed shape; Alpaca's fully disclosed setup makes the partner run "a robust Customer Identification Program (CIP)" that Alpaca reviews, so identity work is shared but the account is still in the customer's name at Alpaca.

**Omnibus.** The partner, a registered broker-dealer or a foreign firm, holds one account at the provider, and its own ledger divides it among its customers. Alpaca's omnibus setup is "one firm trading account" with a sub-tag on each order, and the partner does local tax reporting; DriveWealth's omnibus client handles "customer onboarding and KYC" and its own books and records. The provider executes, clears and custodies; the partner is the one that must keep the stock record by customer, run possession or control and the reserve formula for its customers if it's a US carrying broker, send statements, and know who owns what if either firm fails.

**Hybrids.** DriveWealth's bulk model has the partner hold customer cash and settle with one net wire a day; its cashless model has the partner check buying power before orders. Alpaca's journals (`JNLC` to journal cash and `JNLS` to journal securities between a firm account and a customer account) let a partner prefund a firm account and fund customers instantly from it. These split cash and securities duties differently from the clean disclosed case, and each needs its own reconciliation.

**Worked numbers: a prefunded instant-funding day.** A partner on a disclosed setup prefunds a firm account at the provider with $1,000,000 and funds customers instantly by cash journal, while its own customers' bank transfers settle to the partner later.

| Time | Event | Firm account at provider | Customer accounts at provider | Partner's receivable from customers' banks |
| --- | --- | ---: | ---: | ---: |
| 08:00 | Opening prefund | $1,000,000 | $0 | $0 |
| 09:30 | 1,200 customers deposit $250 each; 1,200 cash journals | $700,000 | $300,000 | $300,000 |
| 14:00 | 300 deposits of $1,000 | $400,000 | $600,000 | $600,000 |
| 17:00 | ACH settles for all but 9 returns ($4,500) | $400,000 | $600,000 | $4,500 |
| Next day | Partner wires $595,500 to top up the firm account | $995,500 | | $4,500 |

The $4,500 of returns is the partner's loss to chase: the customers already have the money at the provider, and the partner's receivable from them is the instant-deposit credit described in [Instant Deposits Are Credit](/books/investing-and-digital-assets/funding-and-transfers#instant-deposits-are-credit), now sitting with a different firm than the one holding the account. The provider's reconciliation is three-way: firm account, customer accounts, and the journals between them, every one of which needs a counterpart in the partner's ledger.

## Who Owns Which Obligation

FINRA Rule 4311 requires every agreement for carrying accounts to be approved by FINRA in advance and to allocate, at a minimum: "Opening and approving accounts", "Acceptance of orders", "Transmission of orders for execution", "Execution of orders", "Extension of credit", "Receipt and delivery of funds and securities", "Preparation and transmission of confirmations", "Maintenance of books and records" and "Monitoring of accounts". The carrying firm must take responsibility for safeguarding funds and securities under Rule 15c3-3 and for customer account statements; an introducing firm may prepare or send statements only with FINRA's prior written approval.

A typical allocation by structure, as I'd draw it from the rule and the providers' documentation:

| Obligation | Fully disclosed, partner is an introducing broker | Omnibus, partner is a broker-dealer | Non-broker app on a provider's accounts |
| --- | --- | --- | --- |
| CIP and KYC | Allocated by agreement; often the introducing broker, reviewed by the carrying firm | Partner | Provider (the app collects data for it) |
| Suitability, Reg BI, options approval | Introducing broker | Partner | Provider, or nobody if no recommendation is made |
| Order acceptance and routing | By agreement | Partner, routing through the provider | Provider |
| Extension of credit (margin) | Carrying firm extends, introducing firm monitors as agreed | Partner to its customers; provider to the partner | Provider |
| Custody, possession or control, reserve | Carrying firm | Partner for its customers; provider for the omnibus account | Provider |
| Confirms and statements | Carrying firm, unless FINRA approves otherwise | Partner | Provider |
| Books and records, stock record by customer | Carrying firm (customer level) and introducing firm (its own) | Partner | Provider |
| CAT reporting of customers | Both, for the events each handles | Partner for its customers' orders | Provider |
| 1099s | Carrying firm | Partner | Provider |
| SIPC protection | Each customer at the carrying firm | The partner's customers at the partner; the partner is the provider's customer | Each customer at the provider |

The last row hides the risk. In an omnibus structure, the provider's SIPC customer is the partner, and SIPA excludes broker-dealer customers from advances unless the trustee establishes the claim arose from transactions for their own customers, who are then treated as separate customers ([SIPC](/books/investing-and-digital-assets/customer-protection#sipc)). That works only if the partner's records say who those customers are. An omnibus ledger that can't is the Synapse failure in a brokerage.

## Crypto as a Service

An app that wants to offer crypto in the US without its own money transmitter licenses in every state and a BitLicense uses a licensed provider. The provider holds the licenses, custodies the assets in omnibus wallets, executes or routes the trades, and treats the app's users as its own customers for licensing and KYC purposes; the app presents the experience. Interactive Brokers' 10-K is a clear public example: its customers trade crypto "through Paxos Trust Company or Zero Hash LLC, which execute, clear and custody the cryptocurrencies." Alpaca does the same in-house with a separate entity, Alpaca Crypto LLC, with a separate crypto agreement and the disclosure that crypto is "not FDIC insured or protected by SIPC."

What the app must get right:

- **Whose customer is it.** For licensing, the provider's; for the customer, the app's. Disclosures must name the provider and say what protection applies, and the app's terms can't promise more than the provider's.
- **Two ledgers that must agree.** The provider's ledger is the legal record of the customer's crypto; the app's ledger is what the customer sees. Reconcile per customer and per asset daily, and keep the provider's daily statements ([Reconciliation and Break](/books/investing-and-digital-assets/investing-business#the-core-data-model)).
- **What happens when the provider leaves.** Bakkt's 10-Q for the second quarter of 2026 reports that Webull, then its largest digital assets client, gave notice of non-renewal on March 14, 2025, effective June 14, 2025, with a limited amended agreement continuing. A provider relationship can end on a notice period, and the app's customers' assets must move somewhere in that window.

## Contracts and Moving Providers

The contract is the system's spec. The terms that become engineering:

- **The allocation of obligations,** the Rule 4311 list for securities and the equivalent for crypto, which decides what each party's systems must do.
- **Data rights and formats.** Who owns customer data, daily files (positions, cash, activity, corporate actions, tax data) and their formats and deadlines, and API rate limits and service levels.
- **Funding mechanics.** Prefunding, settlement accounts, net wires and who bears ACH returns.
- **Termination and transition assistance.** Notice periods, cooperation on transfers, and how long the provider keeps serving accounts during a migration.

**Moving providers** is a mass account transfer. For securities, accounts move by ACATS from the old carrying firm to the new one, in batches, with positions, cash and cost basis ([ACATS Transfers](/books/investing-and-digital-assets/funding-and-transfers#acats-transfers)); assets the new firm doesn't support must be liquidated or left behind by customer instruction, and fractional shares often can't transfer as shares. For crypto, assets move on chain between the providers' wallets or by the old provider liquidating and the new one repurchasing, which is a taxable sale unless the assets move in kind. An omnibus partner moves one account, but must restate its own ledger's locations; a disclosed partner moves thousands of accounts and every customer's statement history. [Conversions, Shutdowns & Distributions](/books/investing-and-digital-assets/conversions-and-shutdowns#brokerage-conversions) covers large conversions.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): `legal_entities` (the partner and the provider are both entities, one of them external) and `accounts`. This chapter adds the program, the allocation of obligations, and the customer-level sub-accounts an omnibus partner keeps.

```sql
CREATE TABLE partner_programs (              -- one provider relationship
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  ledger_entity_id     UUID NOT NULL REFERENCES legal_entities (id),   -- whose books these rows are
  counterparty         TEXT NOT NULL,            -- the provider or the partner, as named in the contract
  ledger_side          TEXT NOT NULL CHECK (ledger_side IN ('provider', 'partner')),
  structure            TEXT NOT NULL CHECK (structure IN ('fully_disclosed', 'omnibus', 'ria',
                         'bulk_cash', 'cashless', 'crypto_custodial')),
  products             TEXT[] NOT NULL,          -- 'equities', 'options', 'crypto', 'mutual_funds', ...
  agreement_ref        TEXT NOT NULL,            -- the carrying agreement, and FINRA's approval
  finra_approved_on    DATE,                     -- Rule 4311(b)(1) for carrying agreements
  firm_account_id      UUID REFERENCES accounts (id),  -- the omnibus or prefunded firm account
  provider_location_id UUID REFERENCES custody_locations (id),  -- the partner's view of the omnibus account
  status               TEXT NOT NULL CHECK (status IN ('onboarding', 'live', 'notice_given',
                         'migrating', 'ended')),
  notice_given_on      DATE,
  ends_on              DATE
);

CREATE TABLE obligation_allocations (        -- the Rule 4311 list, and the crypto equivalent
  partner_program_id   UUID NOT NULL REFERENCES partner_programs (id),
  obligation           TEXT NOT NULL CHECK (obligation IN ('cip_kyc', 'account_approval',
                         'suitability', 'order_acceptance', 'order_transmission', 'execution',
                         'credit', 'funds_securities_movement', 'safeguarding', 'confirms',
                         'statements', 'books_records', 'account_monitoring', 'cat_reporting',
                         'tax_reporting', 'aml_monitoring', 'travel_rule', 'complaints')),
  owner                TEXT NOT NULL CHECK (owner IN ('provider', 'partner', 'shared')),
  detail               TEXT,                     -- what "shared" means, from the contract
  evidence_feed        TEXT,                     -- the file or API that proves the owner did it
  valid_during         TSTZRANGE NOT NULL,
  PRIMARY KEY (partner_program_id, obligation, valid_during)
);

CREATE TABLE omnibus_subaccounts (           -- the partner's customers inside one provider account
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  partner_program_id   UUID NOT NULL REFERENCES partner_programs (id),
  account_id           UUID NOT NULL REFERENCES accounts (id),          -- the partner's customer account
  provider_subtag      TEXT NOT NULL,            -- the tag sent on orders (Alpaca's sub-tag)
  opened_at            TIMESTAMPTZ NOT NULL,
  closed_at            TIMESTAMPTZ,
  UNIQUE (partner_program_id, provider_subtag)
);
```

The omnibus invariant on the partner's books, per instrument at the close: the location lines at the provider's omnibus account equal what the provider's daily statement reports. The owner side (customers plus the partner's own position) balances against those location lines by construction, so this one comparison proves both.

```sql
SELECT jl.instrument_id,
       -SUM(jl.amount)  AS ledger_at_provider,   -- location lines are negative when held
       ps.quantity      AS provider_reports
FROM journal_lines jl
JOIN journal_entries je ON je.id = jl.journal_entry_id
JOIN partner_programs pp ON pp.provider_location_id = jl.location_id
JOIN provider_statements ps ON ps.partner_program_id = pp.id
                           AND ps.instrument_id = jl.instrument_id
                           AND ps.as_of_date = :d
WHERE pp.id = :program
  AND jl.ledger_account = 'omnibus'
  AND COALESCE(jl.settles_on, je.effective_date) <= :d
GROUP BY jl.instrument_id, ps.quantity
HAVING -SUM(jl.amount) <> ps.quantity;
-- provider_statements holds the provider's daily position file as loaded, unchanged;
-- each row returned is a recon_break on the program's reconciliation
```

Design notes:

- **Model the counterparty as a location.** The provider's omnibus account is a `custody_locations` row (or a wallet for crypto) on the partner's books, so the partner's ledger has owner lines per customer and one location line at the provider ([Double Entry in Many Units](/books/investing-and-digital-assets/ledgers-and-positions#double-entry-in-many-units)).
- **Load the provider's daily files unchanged** and reconcile against them every day, at the instrument and, for disclosed accounts, the account level.
- **Every obligation has an owner and an evidence feed.** If the provider sends statements, the partner still keeps proof they were sent; if the partner does CIP, the provider keeps proof it reviewed the program.
- **Carry the provider's status codes in the order and account state machines** (Alpaca's account statuses run from `ONBOARDING` and `SUBMITTED` to `ACTIVE` and `ACCOUNT_CLOSED`; its journals from `queued` to `executed` or `rejected`) and map them to the core model's states in one place.
- **Plan the exit at onboarding.** Keep customer-level positions, basis and statement history in the partner's own store, so a migration is an export, not a request.

## Auditing

Both sides of the program answer to examiners:

- **The carrying agreement and FINRA's approval,** and the allocation table in force on any date.
- **Daily provider files and reconciliations,** with breaks and their resolution, per instrument and per account.
- **Evidence for each allocated obligation:** CIP results and the provider's review, statement and confirm delivery, CAT submissions, tax forms.
- **For omnibus, the customer-level stock record** and the partner's possession and reserve computations where it is a carrying broker.
- **For crypto-as-a-service, the provider's statements per customer and asset,** the disclosures naming the provider, and the terms each customer accepted.
- **Notices, migrations and transfers** when a program ends, with every account's outcome.

## What This Means for the System You Build

- **Know which structure you're in** and therefore whose ledger is the legal record of each customer's assets.
- **Write the obligation allocation into data,** with an owner and an evidence feed for each obligation.
- **Reconcile to the provider daily,** at the customer level where you hold it.
- **In omnibus, keep the customer-level books a trustee would need,** because the provider can't.
- **Disclose the provider and the protection** for each product, and never promise more than the provider's terms.
- **Keep your own copy of positions, basis and history,** and plan the migration before you sign.

## References

**Law and regulation**

- [15 USC 78fff-3: SIPC advances](https://www.law.cornell.edu/uscode/text/15/78fff-3), the exclusion for broker-dealer customers unless the claim arose from transactions for their own customers, who are then separate customers

**Regulators and guidance**

- [FINRA Rule 4311: Carrying agreements](https://www.finra.org/rules-guidance/rulebooks/finra-rules/4311), prior approval, the minimum allocation list, safeguarding and statements at the carrying firm, FINRA approval for an introducing firm to send statements

**Filings**

- [Interactive Brokers: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1381197/000138119726000062/ibkr-20251231.htm), crypto through Paxos Trust Company or Zero Hash LLC, which execute, clear and custody it
- [Bakkt: Form 10-Q for the quarter ended June 30, 2026](https://www.sec.gov/Archives/edgar/data/1820302/000162828026055275/bakkt-20260630.htm), the business, Bakkt Financial Solutions I's licenses, the 2025 sale of Bakkt Trust, Webull's non-renewal notice of March 14, 2025

**Vendor documentation**

- [Alpaca: About Broker API](https://docs.alpaca.markets/docs/about-broker-api), fully disclosed, omnibus and RIA setups
- [Alpaca: Broker API use cases](https://docs.alpaca.markets/us/docs/use-cases.md), the partner's CIP under fully disclosed, undisclosed end customers and sub-tags under omnibus, Alpaca's account approval for RIAs
- [Alpaca: Account statuses](https://docs.alpaca.markets/us/docs/accounts-statuses.md), the account status values
- [Alpaca: Funding via journals](https://docs.alpaca.markets/us/docs/funding-via-journals.md), JNLC and JNLS between firm and customer accounts, instant funding and journal statuses
- [Alpaca: Crypto trading](https://docs.alpaca.markets/us/docs/crypto-trading-1.md), Alpaca Crypto LLC, the separate agreement, no FDIC or SIPC protection
- [Apex Fintech Solutions](https://apexfintechsolutions.com/), AscendOS and the September 30, 2026 metrics
- [Atomic](https://atomicvest.com/), the adviser and broker-dealer, products, and custody at BNY Pershing
- [DriveWealth: Choosing your integration model](https://developer.drivewealth.com/apis/docs/choosing-your-integration-model.md), the individual, bulk, cashless and omnibus models and what each party handles
- [Paxos](https://www.paxos.com/), Paxos Trust Company as an OCC-regulated national trust bank
- [Paxos: Crypto brokerage](https://www.paxos.com/crypto-brokerage), never trading against clients, fiduciary custody, named clients
- [Zero Hash](https://zerohash.com/), its licenses and registrations
