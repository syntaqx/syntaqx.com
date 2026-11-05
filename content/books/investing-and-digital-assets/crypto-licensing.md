+++
title = "Licensing a Crypto Business"
nav_title = "Crypto Licensing"
description = "FinCEN MSB registration, state licenses and the MTMA, the BitLicense, California's DFAL, trust and broker-dealer routes, and MiCA CASP authorization."
category = "Investing & Digital Assets Industry"
order = 2571
part = "The Rules"
tags = ["crypto", "licensing", "msb", "bitlicense", "dfal", "mica", "casp"]
+++

A US crypto exchange that holds customers' coins and moves them on instruction is, in the law's words, a money transmitter, and so it needs one federal registration and a license in nearly every state it serves, with New York and California running regimes written for crypto. An EU exchange needs one authorization from one member state and then a notice to passport it to the other twenty-nine EEA countries. The asymmetry is the whole strategic picture: in the US, licensing is a multi-year, state-by-state program with dozens of examiners; in the EU, since July 1, 2026, it is one application and a register entry, without which a firm may not serve the public at all.

For engineering, a license is a set of permissions with conditions, dates and an examiner, and the systems have to make every product decision answer to it: which entity may serve this customer in this place for this activity today, under which license, exemption, transitional period or passport. [Regulators & Licenses](/books/investing-and-digital-assets/regulators-and-licenses) maps every activity to its registration and adds `entity_registrations`; this chapter goes deeper on the crypto registrations (FinCEN's MSB rules and who they catch, state licensing and the Money Transmission Modernization Act, New York's Part 200, California's DFAL, trust charters, the broker-dealer route for tokenized securities, and MiCA's CASP authorization) and adds the application, its conditions and the resolved permissions per jurisdiction. Money transmission basics, sponsor banks and holding customer funds are the Payments volume's [Becoming a Payment Provider](/books/payments/becoming-a-payment-provider); which tokens are securities, and so which license a listing needs, is [Securities, Commodities & Crypto Market Structure](/books/investing-and-digital-assets/securities-or-commodities); the AML program each license requires is [AML & the Travel Rule for Crypto](/books/investing-and-digital-assets/crypto-aml-and-travel-rule).

## How the Platforms Do It

Licenses as the companies and registers state them, as of November 2026:

| Company | US | New York | EU (ESMA interim MiCA register) | Elsewhere |
| --- | --- | --- | --- | --- |
| **Coinbase** | FinCEN MSB; money transmitter licenses or equivalents where required | BitLicense; Coinbase Custody Trust Company, a limited purpose trust company | Coinbase Luxembourg S.A., CSSF, June 20, 2025 | FCA e-money; Bermuda; Deribit's VARA license (per its 10-K) |
| **Robinhood** | Robinhood Crypto: FinCEN-registered, state money transmitter | Supervised by NYDFS, which fined it $30 million in 2022 | Robinhood Europe UAB, Bank of Lithuania, May 29, 2025 | FCA authorization for Robinhood U.K. |
| **Kraken** | | | Payward Europe Solutions (custody, exchange, execution, placing, transfer and more) and Payward Global Solutions (trading platform), Central Bank of Ireland, June 25, 2025 | Payward FZCO on Dubai's VARA register |
| **Gemini** | | | Gemini Intergalactic EU, Malta, August 21, 2025 | |
| **OKX** | | | OKX Europe, Malta, January 27, 2025, including a trading platform | OKX Middle East Fintech FZE, VARA |
| **Crypto.com** | | | Foris DAX MT, Malta, January 27, 2025 | Foris DAX Middle East FZE, VARA; deemed licensed in Hong Kong |
| **Bitstamp** | | | Bitstamp Europe S.A., CSSF, May 15, 2025 | |
| **Binance** | Required to exit the US under its 2023 settlement | | No entity on the register | Binance FZE, VARA; Binance Japan on the FSA register |

The US columns for Coinbase and Robinhood come from their 2025 10-Ks as summarized in [One Company, Many Entities](/books/investing-and-digital-assets/regulators-and-licenses#one-company-many-entities); the EU and other columns come from the registers in References. Three patterns. **The EU entity sits in one member state and passports:** every large exchange chose a home (Luxembourg, Ireland, Malta, Lithuania, Austria) and serves the EEA from it. **Trading platforms are a separate service:** Kraken put its trading platform authorization in a second entity, and ESMA's register lists services by letter, so the service list is part of the license. **Absence from a register is a fact:** an exchange with no MiCA entity cannot serve the EU public after July 1, 2026, whatever its size.

## FinCEN: Who Is a Money Services Business

Federally, a crypto business that accepts and transmits value is a money transmitter, a kind of money services business under the Bank Secrecy Act. FinCEN's guidance FIN-2019-G001 of May 9, 2019 sorts the business models, and the sort decides who needs to register:

| Model | FinCEN's position (2019) |
| --- | --- |
| Hosted wallet provider (an exchange or custodial wallet) | "Account-based money transmitters that receive, store, and transmit" crypto for accountholders; the host "has total independent control over the value" |
| Unhosted wallet (self-custody software) | The owner "interacts with the payment system directly"; a person using one for their own purchases is not a money transmitter, and the software provider isn't either |
| Peer-to-peer exchanger buying and selling as a business | A money transmitter, even as a natural person |
| Crypto kiosk owner-operator | A money transmitter |
| DApp that accepts and transmits value | The money transmitter definition "will apply to the DApp, the owners/operators of the DApp, or both" |
| Anonymizing services provider (a custodial mixer) | A money transmitter |
| Anonymizing software provider | Not a money transmitter: "engaged in trade and not money transmission" |

The last two rows are the distinction the Tornado Cash and Samourai prosecutions tested (AML & the Travel Rule for Crypto).

Once inside the definition, the duties are the MSB rules in 31 CFR part 1022:

- **Register within 180 days** of being established (31 CFR 1022.380), renew every two years by the last day of the prior calendar year, and re-register within 180 days after a change of control that requires state re-licensing, a transfer of more than 10% of voting power or equity, or a more than 50% increase in agents. Registration is not a license: it applies to each MSB "whether or not licensed" by a state.
- **A written, risk-based AML program** (31 CFR 1022.210) with policies for verifying customers, filing reports, keeping records and responding to law enforcement, a compliance officer, training and independent review by someone other than the compliance officer; an MSB with automated systems should "integrate their compliance procedures with such systems."
- **Suspicious activity reports** on transactions of at least $2,000, filed within 30 calendar days of initial detection, kept five years (31 CFR 1022.320); Banking & Lending's [Suspicious Activity Reports](/books/banking-and-lending/bsa-aml#suspicious-activity-reports) covers the mechanics.
- **The funds Travel Rule** on transmittals of $3,000 or more (AML & the Travel Rule for Crypto).

An offshore exchange with US customers is inside the definition whether or not it registers, which is what the 2023 Binance resolution established ([Enforcement Defines the Map](/books/investing-and-digital-assets/regulators-and-licenses#enforcement-defines-the-map)).

## State Money Transmission and the MTMA

Each state licenses money transmission under its own statute, and most states read "money" or "monetary value" to reach crypto held for customers; a national exchange holds dozens of licenses, each with its own net worth, surety bond and permissible investment rules, examinations and reports. The Conference of State Bank Supervisors' Money Transmission Modernization Act is the effort to make those rules one standard: CSBS describes it as "a single set of nationwide standards" for net worth, surety bonds and permissible investments, and as of its September 3, 2026 page "thirty-one states have enacted the law in full or in part," with licensees in adopting states accounting for 99% of reported money transmission activity. CSBS also publishes interpretive guidance on "Tangible Net Worth and Virtual Currency" and "Stablecoin Tangibility" (April 2, 2026), which matters for a crypto licensee whose balance sheet is mostly tokens. How the license, the bond and permissible investments work for a payments company is in [Holding Other People's Money](/books/payments/becoming-a-payment-provider#holding-other-people-s-money); the crypto twist is that the obligations being covered are denominated in tokens, so the permissible investments and the net worth test must be marked in dollars at a price the regulator accepts.

## New York: the BitLicense

New York's Part 200 (23 NYCRR 200) requires a license for virtual currency business activity with New York or New Yorkers, or a New York limited purpose trust charter instead ([Which Registration Each Activity Needs](/books/investing-and-digital-assets/regulators-and-licenses#which-registration-each-activity-needs) has the activity list). What the rule asks for:

- **The application** (200.4): the entity and its affiliates with an organization chart, biographies and independent background reports on every director, principal officer, principal stockholder and principal beneficiary, fingerprints and photographs for them and for employees with access to customer funds, current financial statements and a one-year projected balance sheet and income statement, banking arrangements, every written policy the Part requires, a litigation affidavit, tax verification, insurance policies and "an explanation of how virtual currency is valued in fiat currency."
- **The decision** (200.6): the superintendent approves or denies within 90 days of deeming the application complete, extendable "for such additional reasonable period of time as may be required." A conditional license (200.4(c)) may be granted to an applicant that doesn't yet meet every requirement; it generally expires two years after issuance unless renewed or made unconditional.
- **Capital** (200.8): no fixed dollar amount; the superintendent sets it from the firm's assets and liabilities, volume, leverage, liquidity and products, held as cash, virtual currency or "high-quality, highly liquid, investment-grade assets."
- **Custody** (200.9): a surety bond or US dollar trust account for customers; "hold Virtual Currency of the same type and amount" owed to each customer; and a prohibition on "selling, transferring, assigning, lending, hypothecating, pledging" customer assets except at the customer's direction. That one sentence is the rule FTX and Celsius broke ([What Every Design Rule Is Guarding Against](/books/investing-and-digital-assets/exchange-collapses#what-every-design-rule-is-guarding-against)).
- **Books and records** (200.12): kept at least seven years, with each transaction's amount, date and "precise time," payment instructions, fees, and the customers' names, account numbers and addresses.
- **AML** (200.15): an annual risk assessment and independent test, records of every virtual currency transaction with the customer parties' identities and physical addresses (no threshold), identity verification for any accountholder initiating a transaction over $3,000, and a 24-hour notice to the Department when one person's virtual-currency-to-virtual-currency transactions, which have no federal currency transaction report, exceed $10,000 in a day.

Listing under the BitLicense runs through the Department's coin-listing guidance and Greenlist ([New York: coin-listing and delisting policies](/books/investing-and-digital-assets/listing-assets#new-york-coin-listing-and-delisting-policies)).

Two numbers a New York licensee's systems compute daily. **The $10,000 notice:** a customer converts 4,000 USDC to ETH at 09:00, 3,500 USDC to SOL at 13:00 and 3,000 USDC to BTC at 21:00; the day's crypto-to-crypto total is $10,500, over $10,000, so the Department is notified within 24 hours. The rule exists because crypto-to-crypto trades never touch the federal currency transaction report, which is about cash. **Custody match:** for every asset, the sum of customer balances in the ledger must be at most the units the licensee holds of that same asset, never a substitute ([Treasury Reconciliation](/books/investing-and-digital-assets/hot-and-cold-wallets#treasury-reconciliation)).

## California: the DFAL

California's Digital Financial Assets Law (enacted as AB 39 and SB 401) requires a license from the Department of Financial Protection and Innovation for digital financial asset business activity with California residents from July 1, 2026, a date AB 1934 moved from July 1, 2025. Applications go through NMLS. Exempt under Financial Code §3103 are certain banks, persons providing only connectivity software or computing power to decentralized networks, and persons who reasonably expect less than $50,000 a year from otherwise covered activity. Licensees hold minimum capital and liquidity the Department sets and a surety bond or trust account. The FAQ adds that stablecoins may not be offered to California residents unless they meet the law's reserve and redemption protections (Chapter 6; [California](/books/investing-and-digital-assets/stablecoin-law#california) in Stablecoin Law).

Kiosks got rules first, and they are math a kiosk operator's software enforces:

- **From January 1, 2024,** no more than $1,000 a day accepted from or dispensed to one customer, and a list of kiosk locations filed with the Department.
- **From January 1, 2025,** a pre-transaction disclosure and a fee cap of the greater of $5 or 15% of the US dollar value of the digital assets in the transaction. The DFPI's own example: 2 LTC at $85 is $170, so the cap is $25.50. A $20 purchase caps at $5, since 15% of $20 is $3.
- **By July 1, 2026,** operators that wanted to keep operating had to have submitted a completed license application.

## Trust Charters

A trust charter is the alternative to money transmitter licensing for custody: a New York limited purpose trust company conducts virtual currency business without a separate BitLicense and can act as a fiduciary, and a national trust bank chartered by the OCC answers to one federal regulator instead of the states for the activities its charter covers. The December 12, 2025 conditional approvals (Circle, Ripple, BitGo, Fidelity Digital Assets, Paxos) and what a charter permits are in [Trust Charters for Custody](/books/investing-and-digital-assets/regulators-and-licenses#trust-charters-for-custody) and Banking & Lending's [Trust Banks and Novel Charters](/books/banking-and-lending/charters-and-regulators#trust-banks-and-novel-charters); custody for advisers and funds is [Qualified Custody](/books/investing-and-digital-assets/qualified-custody). A charter is a different licensing project, years long, with capital and governance like a bank's, and it doesn't replace a broker-dealer registration for securities or a CASP authorization in Europe.

## Securities Routes for Tokenized Securities

A token that is a digital security ([The 2026 Taxonomy](/books/investing-and-digital-assets/securities-or-commodities#the-2026-taxonomy)) isn't money transmission at all: dealing in it needs a broker-dealer, a venue for it needs to be an exchange or an ATS, and its holder records need a transfer agent ([Which Registration Each Activity Needs](/books/investing-and-digital-assets/regulators-and-licenses#which-registration-each-activity-needs)). The SEC's statement on "Custody of Digital Asset Securities by Special Purpose Broker-Dealers," published February 26, 2021, set out conditions under which a broker-dealer that deals only in digital asset securities could treat them as in its possession or control under Rule 15c3-3; in 2026 the SEC proposed custody rules for crypto held by advisers and funds (91 FR 63870, October 6, 2026) and issued an exemptive order for trading tokenized NMS stocks ([Tokenized Stocks & 24/7 Securities](/books/investing-and-digital-assets/tokenized-stocks)). A platform that wants both tokens and tokenized stocks therefore runs both a crypto entity and a broker-dealer, and each listing is routed by classification to the entity that may carry it.

## The EU: MiCA CASP Authorization

MiCA (Regulation (EU) 2023/1114) defines ten crypto-asset services in Article 3(1)(16), and the ESMA register lists each authorization by their letters:

| Letter | Service |
| --- | --- |
| a | Custody and administration of crypto-assets on behalf of clients |
| b | Operation of a trading platform for crypto-assets |
| c | Exchange of crypto-assets for funds |
| d | Exchange of crypto-assets for other crypto-assets |
| e | Execution of orders on behalf of clients |
| f | Placing of crypto-assets |
| g | Reception and transmission of orders on behalf of clients |
| h | Providing advice on crypto-assets |
| i | Providing portfolio management on crypto-assets |
| j | Providing transfer services for crypto-assets on behalf of clients |

**Who may apply** (Article 59): a legal person with its registered office in a member state where it carries out at least part of its services, its place of effective management in the Union, and "at least one of the directors ... resident in the Union." **Existing financial firms notify instead** (Article 60), "at least 40 working days before providing those services for the first time": credit institutions for any service, investment firms for services equivalent to their MiFID II authorization, electronic money institutions for custody and transfer of the e-money tokens they issue, central securities depositories for custody, fund managers for orders, advice and portfolio management, and market operators for a trading platform; the authority checks completeness within 20 working days.

**What the application holds** (Article 62): identity and legal form, a programme of operations including where and how the services will be marketed, proof of the prudential safeguards, governance and fit and proper management, qualifying shareholders, internal control and AML/CFT, business continuity, ICT documentation, segregation of client assets, complaints handling, and service-specific policies: a custody policy, trading platform operating rules and market abuse detection, a pricing policy for exchange services, an execution policy, staff expertise for advice and portfolio management, and transfer procedures.

**The clock** (Article 63): acknowledgment within 5 working days, a completeness assessment within 25 working days, and a reasoned decision within 40 working days of a complete application; the authority may ask for more information no later than the 20th working day of its assessment, suspending the clock for up to 20 working days, and tells the applicant within 5 working days of deciding. Worked from submission, the longest path the article allows is 25 + 40 + 20 + 5 = 90 working days, about 18 weeks, before the license is in hand. Applications that come back incomplete restart the completeness step, which is why real authorizations took longer.

**Capital** (Article 67 and Annex IV): the higher of a permanent minimum by class and one quarter of the previous year's fixed overheads, as own funds, insurance or both:

| Class | Services | Permanent minimum |
| --- | --- | --- |
| 1 | Execution, placing, transfer, reception and transmission of orders, advice, portfolio management | EUR 50,000 |
| 2 | Class 1 plus custody and exchange for funds or other crypto-assets | EUR 125,000 |
| 3 | Class 2 plus operating a trading platform | EUR 150,000 |

Worked: an exchange with custody, exchange and a trading platform (class 3) whose fixed overheads last year were EUR 3,000,000 needs max(EUR 150,000, 3,000,000 / 4 = EUR 750,000) = EUR 750,000. For anything but a startup, the overhead test sets the number; a first-year firm uses its projected overheads.

**Passporting** (Article 65): the CASP tells its home authority which member states, which services and from when; the authority forwards it to the host states, ESMA and the EBA within 10 working days; the CASP may start from the authority's confirmation and at the latest from the 15th calendar day after submitting. A CASP that submits on Monday, January 4, 2027 may serve the host states from January 19, 2027 at the latest. No local entity is needed (Article 59(7)).

**The transition** (Article 143(3)): firms providing services under national law before December 30, 2024 could continue "until 1 July 2026 or until they are granted or refused an authorisation," and member states could shorten the period. ESMA's list shows 18 months in fifteen states including France, Italy, Luxembourg and Malta, 12 months in Germany, Ireland, Lithuania, Austria and Slovakia, 9 months in Sweden, and 6 months in Latvia, Hungary, the Netherlands, Poland, Slovenia and Finland. Every transitional period has now ended: since July 1, 2026, an unauthorized firm serving the EU public is out of compliance, and ESMA publishes a register of non-compliant entities alongside the CASP register. Stablecoin issuance under MiCA (e-money and asset-referenced tokens) is [The EU: MiCA](/books/investing-and-digital-assets/stablecoin-law#the-eu-mica); the UK, Singapore, Hong Kong and others are [Beyond the US](/books/investing-and-digital-assets/beyond-the-us).

## The Application as a State Machine

The regimes differ in names and clocks but share a shape: submitted, incomplete and back, under review, a conditional or full grant or a refusal, then a live registration with conditions and renewals.

![A state machine for a license application: drafting, submitted, under review and granted in a row along the accented path, with granted leading to active; information requested branching below submitted and returning to under review; conditional below granted, leading to active when conditions are met; denied and withdrawn as dashed exits ending in double-outlined terminal states.](/diagrams/ida-license-application-states.svg "The shape every license application shares, from a BitLicense to a MiCA CASP authorization: the regulator's clock pauses while information is requested, and a conditional grant is a live permission with limits.")

## How to Build It

`entity_registrations` and `activity_license_map` from [How to Build It](/books/investing-and-digital-assets/regulators-and-licenses#how-to-build-it) in Regulators & Licenses hold what a firm has and what an activity needs. A licensing program adds the applications with their clocks, the conditions attached to grants, and the resolved permission per entity, jurisdiction and activity that product gates read, which also captures the routes that aren't licenses (exemptions, transitional periods, passports, notifications):

```sql
CREATE TABLE license_applications (        -- one application to one regulator
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  regulator            TEXT NOT NULL,         -- 'fincen', 'nydfs', 'ca_dfpi', 'cssf', 'cbi', ...
  kind                 TEXT NOT NULL,         -- 'msb', 'mtl', 'bitlicense', 'dfal', 'casp', ...
  jurisdiction         TEXT NOT NULL,
  services             TEXT[],                -- MiCA letters, or the activities applied for
  regime_ref           TEXT NOT NULL,         -- '23 NYCRR 200.4', 'MiCA Art. 62', 'Cal. Fin. Code 3201'
  submitted_at         TIMESTAMPTZ,
  complete_at          TIMESTAMPTZ,           -- when the regulator deemed it complete
  decision_due_on      DATE,                  -- computed from the regime's clock, paused while
                                              -- information is requested
  status               TEXT NOT NULL CHECK (status IN ('drafting', 'submitted',
                         'info_requested', 'under_review', 'conditional', 'granted',
                         'denied', 'withdrawn')),
  registration_id      UUID REFERENCES entity_registrations (id),  -- set on a grant
  decided_at           TIMESTAMPTZ,
  CHECK (status NOT IN ('conditional', 'granted') OR registration_id IS NOT NULL)
);

CREATE TABLE license_conditions (          -- limits attached to a grant or consent order
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  registration_id      UUID NOT NULL REFERENCES entity_registrations (id),
  kind                 TEXT NOT NULL CHECK (kind IN ('capital', 'product_limit',
                         'customer_limit', 'monitor', 'reporting', 'remediation',
                         'expiry', 'other')),
  text                 TEXT NOT NULL,         -- as written in the approval or order
  machine_rule         JSONB,                 -- e.g. {"activity": "staking", "allowed": false}
  due_on               DATE,                  -- for conditions with a deadline
  status               TEXT NOT NULL CHECK (status IN ('open', 'met', 'waived', 'breached')),
  evidence_ref         TEXT
);

CREATE TABLE jurisdiction_permissions (    -- resolved: may this entity do this here, and why
  legal_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  jurisdiction         TEXT NOT NULL,         -- 'US-NY', 'US-CA', 'DE', 'FR', ...
  activity             TEXT NOT NULL,         -- as in activity_license_map
  basis                TEXT NOT NULL CHECK (basis IN ('license', 'exemption', 'transitional',
                         'passport', 'notification', 'not_required')),
  registration_id      UUID REFERENCES entity_registrations (id),
  basis_ref            TEXT NOT NULL,         -- the exemption section, passport notice or memo
  restrictions         JSONB NOT NULL DEFAULT '{}',  -- e.g. {"kiosk_daily_limit_usd": 1000}
  valid_during         TSTZRANGE NOT NULL,
  EXCLUDE USING gist (legal_entity_id WITH =, jurisdiction WITH =, activity WITH =,
                      valid_during WITH &&)
);
```

The permission table is derived, not hand-kept: a job rebuilds it from registrations, conditions with `machine_rule`, passport notifications (Beyond the US adds `passporting_notifications`) and the activity map, and every product gate reads it. Ending a transitional period is then a date already in the data: the rows with `basis = 'transitional'` for EU CASP services carried `valid_during` ranges ending no later than July 1, 2026, and a gate that read them stopped serving on time.

The MiCA clock in code, counting working days and pausing for an information request (holidays per member state come from the calendar the platform already keeps for settlement):

```go tab="Go"
// Calendar counts working days in the home member state.
type Calendar interface {
	AddWorkingDays(from time.Time, days int) time.Time
}

// DecisionDue returns the latest date a MiCA Article 63 decision is due:
// 40 working days from completeness, plus any days the clock was suspended
// (at most 20), plus 5 working days to notify the applicant.
func DecisionDue(complete time.Time, suspended int, cal Calendar) time.Time {
	if suspended > 20 {
		suspended = 20
	}
	return cal.AddWorkingDays(complete, 40+suspended+5)
}
```

```rust tab="Rust"
/// Counts working days in the home member state.
pub trait Calendar {
    fn add_working_days(&self, from: NaiveDate, days: u32) -> NaiveDate;
}

/// The latest date a MiCA Article 63 decision is due: 40 working days from
/// completeness, plus suspension (at most 20), plus 5 days to notify.
pub fn decision_due(complete: NaiveDate, suspended: u32, cal: &impl Calendar) -> NaiveDate {
    let suspended = suspended.min(20);
    cal.add_working_days(complete, 40 + suspended + 5)
}
```

Design notes:

- **One entity per regime is a design choice, not a default.** Separating the EU CASP, the US money transmitter and the broker-dealer into different `legal_entities` keeps each regulator's capital, records and examinations on its own books ([One Company, Many Entities](/books/investing-and-digital-assets/regulators-and-licenses#one-company-many-entities)).
- **Conditions are product rules.** A conditional license that bars staking, a consent order that caps new accounts, or a monitor's access requirement becomes a `machine_rule` that product gates read, with the text kept beside it.
- **Exemptions need evidence.** DFAL's $50,000 exemption is a forecast; the entity that relies on it records the forecast and tests actual revenue against it, so crossing the line opens an application rather than a finding.
- **Records follow the strictest regime.** Part 200's seven years and its precise-time requirement apply to every transaction a New York licensee touches; set retention per entity from the regimes it is under ([Retention Schedules by Record Type](/docs/building-blocks/data-retention#retention-schedules-by-record-type)).

## Auditing

- **For every customer transaction,** the entity, jurisdiction, activity and the permission row (license, exemption, transitional period or passport) that allowed it on that date.
- **Every application's history,** with submissions, information requests, the clock, the decision and the source documents.
- **Conditions and their status,** with evidence for each one marked met and the product gate that enforced each open one.
- **Daily regulatory computations:** New York's $10,000 crypto-to-crypto notices, kiosk limits and fee caps, and the custody match of customer balances to holdings per asset.

## What This Means for the System You Build

- **License before launch, per jurisdiction:** a new state or member state is an application with a clock, not a configuration change.
- **Resolve permissions into one table** that names the basis (license, exemption, transition, passport) and its end date, and gate every product on it.
- **Treat conditions as code-enforced rules** with their source text attached.
- **Build the custody match and the daily notices into the ledger,** because Part 200 and the state regimes test them on any day.
- **Plan the EU as one authorization plus passports,** and the US as many licenses plus FinCEN.

## References

**Law and regulation**

- [31 CFR 1022.380](https://www.law.cornell.edu/cfr/text/31/1022.380), MSB registration within 180 days, two-year renewal, re-registration triggers, agent lists and registration regardless of state licensing
- [31 CFR 1022.210](https://www.law.cornell.edu/cfr/text/31/1022.210), the MSB AML program, its policies, compliance officer, training, independent review and automated systems
- [31 CFR 1022.320](https://www.law.cornell.edu/cfr/text/31/1022.320), MSB SARs at $2,000, the 30-day deadline and five-year retention
- [23 NYCRR 200.4](https://www.law.cornell.edu/regulations/new-york/23-NYCRR-200.4), BitLicense application contents and conditional licenses
- [23 NYCRR 200.6](https://www.law.cornell.edu/regulations/new-york/23-NYCRR-200.6), the 90-day decision period and extensions
- [23 NYCRR 200.8](https://www.law.cornell.edu/regulations/new-york/23-NYCRR-200.8), capital set by the superintendent and its permitted forms
- [23 NYCRR 200.9](https://www.law.cornell.edu/regulations/new-york/23-NYCRR-200.9), the bond or trust account, same-type holdings and the bar on using customer assets
- [23 NYCRR 200.12](https://www.law.cornell.edu/regulations/new-york/23-NYCRR-200.12), seven-year records and their contents
- [23 NYCRR 200.15](https://www.law.cornell.edu/regulations/new-york/23-NYCRR-200.15), the AML program, transaction records, the $3,000 verification and the $10,000 24-hour notice
- [ESMA Interactive Single Rulebook: MiCA Article 3](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-3-definitions), the ten crypto-asset services
- [ESMA Interactive Single Rulebook: MiCA Article 59](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-59-authorisation), who may provide services, the residence of a director and cross-border provision
- [ESMA Interactive Single Rulebook: MiCA Article 60](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-60-provision-crypto-asset-services), the notification route for financial entities and its 40 and 20 working days
- [ESMA Interactive Single Rulebook: MiCA Article 62](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-62-application-authorisation-crypto), application contents
- [ESMA Interactive Single Rulebook: MiCA Article 63](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-63-assessment-application), the assessment timetable and suspension
- [ESMA Interactive Single Rulebook: MiCA Article 65](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-65-cross-border-provision-crypto), passporting notifications, the 10 working days and the 15th calendar day
- [ESMA Interactive Single Rulebook: MiCA Article 67](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/article-67-prudential-requirements), prudential safeguards and the quarter of fixed overheads
- [ESMA Interactive Single Rulebook: MiCA Annex IV](https://www.esma.europa.eu/publications-and-data/interactive-single-rulebook/mica/minimum-capital-requirements-crypto-asset), the three classes and their minimums

**Regulators and guidance**

- [FinCEN: FIN-2019-G001 (May 9, 2019)](https://www.fincen.gov/sites/default/files/2019-05/FinCEN%20Guidance%20CVC%20FINAL%20508.pdf), hosted and unhosted wallets, P2P exchangers, kiosks, DApps and anonymizing services and software providers
- [CSBS: Money Transmission Modernization Act](https://www.csbs.org/csbs-money-transmission-modernization-act-mtma), the nationwide standards, 31 states and the virtual currency and stablecoin guidance
- [California DFPI: Digital Financial Assets Law FAQ](https://dfpi.ca.gov/regulated-industries/digital-financial-assets/digital-financial-assets-law-frequently-asked-questions/), the July 1, 2026 date, AB 1934, NMLS, exemptions, capital and bonds, kiosk limits, the fee cap example and stablecoins
- [SEC: Custody of Digital Asset Securities by Special Purpose Broker-Dealers (published February 26, 2021)](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=%22special%20purpose%20broker-dealer%22&order=newest&per_page=10), the statement's publication and the October 6, 2026 crypto custody proposal
- [ESMA: Markets in Crypto-Assets Regulation](https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/markets-crypto-assets-regulation-mica), the interim register files, the non-compliant entities file and the end of grandfathering
- [ESMA: Interim MiCA register of CASPs](https://www.esma.europa.eu/sites/default/files/2024-12/CASPS.csv), the authorizations, dates and service letters in How the Platforms Do It
- [ESMA: List of grandfathering periods decided by Member States](https://www.esma.europa.eu/sites/default/files/2024-12/List_of_MiCA_grandfathering_periods_art._143_3.pdf), Article 143(3) and each state's period
- [VARA: Public register](https://www.vara.ae/en/licenses-and-register/public-register/), the Dubai entities in How the Platforms Do It
- [Japan FSA: Registered crypto-asset exchange service providers (as of September 30, 2026)](https://www.fsa.go.jp/en/regulated/licensed/en_kasoutuka.pdf), Binance Japan's registration
- [SFC: Lists of virtual asset trading platforms (updated October 16, 2026)](https://www.sfc.hk/en/Welcome-to-the-Fintech-Contact-Point/Virtual-assets/Virtual-asset-trading-platforms-operators/Lists-of-virtual-asset-trading-platforms), Crypto.com's deemed-licensed status
