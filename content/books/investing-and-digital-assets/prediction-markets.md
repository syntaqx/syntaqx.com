+++
title = "Event Contracts & Prediction Markets"
nav_title = "Prediction Markets"
description = "Event contracts on CFTC-registered exchanges: Part 40.11, Kalshi's election case, sports contracts and the states, pricing, fees, settlement and resolution."
category = "Investing & Digital Assets Industry"
order = 2524
part = "Trading and Markets"
tags = ["investing", "prediction-markets", "event-contracts", "cftc", "derivatives", "regulation"]
+++

An event contract pays $1 if something happens and nothing if it doesn't. Its price, between one cent and 99 cents, is the market's probability that it will, and everything else follows from that: a buyer at 62 cents risks 62 cents to make 38, the seller of the same contract risks 38 to make 62, and the exchange holds the full dollar from the two of them until the outcome is known. The contracts are swaps or options under the Commodity Exchange Act, listed on CFTC-registered exchanges, cleared by CFTC-registered clearing houses and sold to retail through futures commission merchants, and by the third quarter of 2026 they were Robinhood's fastest-growing revenue line.

They are also the most litigated product in this volume. Whether a contract on an election, a football game or a celebrity's tweet is a lawful derivative under exclusive federal jurisdiction or illegal sports betting under state law was being decided in three federal circuits, a state supreme court and a cert petition at the Supreme Court as of November 2026, while the CFTC, under a new chairman, sued states on the exchanges' side. This chapter covers the rules (CEA §5c(c)(5)(C), Part 40.11 and self-certification), the CFTC's 2024 to 2026 rulemakings, Kalshi's election contract case, sports contracts and the states with their status dated, how Kalshi, Robinhood, Coinbase, ForecastEx and Polymarket offer them, how a contract is listed, priced, charged, settled and resolved with the numbers worked, and the data model. The FCM and segregation side is [Futures & FCMs](/books/investing-and-digital-assets/futures-and-fcms#customer-segregation); registration as a map is in [Regulators & Licenses](/books/investing-and-digital-assets/regulators-and-licenses#which-registration-each-activity-needs).

## How the Platforms Do It

As each venue or broker describes it, as of November 2026:

| Platform | Structure | Contract and fees | Notes |
| --- | --- | --- | --- |
| **Coinbase** | Coinbase Financial Markets, an FCM, "in December 2025, began offering event contracts" | Prediction markets alongside futures and perpetuals in one app | Plaintiff in *Coinbase Financial Markets v. Raoul* (N.D. Ill., decided October 2, 2026) |
| **ForecastEx** (Interactive Brokers) | Registered with the CFTC as a DCM and DCO; IBKR is a member; customers trade through an FCM on ForecastTrader | Settles at $1.00 or $0, priced $0.01 to $0.99, fully cash-collateralized; "$0.01 transaction fee per contract, charged to each side" | "Monthly incentive coupons" pass through 100% of earnings to members; no rate stated |
| **Kalshi** | A DCM; members trade with each other, "not the exchange itself" | $1 per winning contract; a fee on "expected earnings," with maker fees on orders "not immediately matched" and none to cancel | Open 24/7 except maintenance from 3:00 to 5:00 am ET Thursdays; settlement "often within about 3 hours" of the outcome |
| **Polymarket** | Settled a 2022 CFTC order; a separate Polymarket US product with its own documentation | "Each market settles at $1.00 if the outcome happens and $0.00 if it doesn't" | Its US regulatory entity isn't named on the documentation pages I read |
| **Robinhood** | Robinhood Derivatives, "a registered futures commission merchant and swap firm"; Rothera, a joint venture with Susquehanna that owns 90% of MIAXdx, renamed Rothera Exchange and Clearing | "Traded at $0.01 increments up to $1 and is worth $1 upon settlement"; a commission per contract | 16.4 billion contracts traded in Q3 2026, over 7x a year earlier; $173 million of event contract revenue, over 6x; Rothera over $100 million annualized revenue in its first full quarter |

The table's shape is the industry's. **Two layers, often owned together:** an exchange and clearing house that lists and settles, and an FCM that brings the customers. Robinhood, Coinbase and Interactive Brokers all hold the FCM layer and have moved to own or co-own the exchange layer. **Prices in cents, payouts in dollars, fully collateralized,** so there's no margin call and no leverage: the most a customer can lose is the price paid. **Fees per contract or per expected earnings,** which makes the fee a function of the price, as worked below.

The scale is real but concentrated. The CFTC's October 2026 proposal reported average monthly event contract volume across reporting DCMs of about $1.5 billion in August 2026, of which about $1.2 billion was sports, about $11 million politics and about $4 million weather. At least seven DCMs offered sports contracts to US persons as of September 1, 2026, and more than fifteen DCM applications had been filed since 2025.

## The Rules

Three provisions decide what may be listed:

- **The statute.** CEA §5c(c)(5)(C) (7 USC 7a-2(c)(5)(C)), the "special rule for review and approval of event contracts and swaps contracts," lets the CFTC "determine that such agreements, contracts, or transactions are contrary to the public interest" if they involve "activity that is unlawful under any Federal or State law," terrorism, assassination, war, gaming, or similar activity it names by rule; such a contract may not be listed or cleared, and the CFTC must act within 90 days of starting a review unless the exchange agrees to more time.
- **The rule.** 17 CFR 40.11(a)(1) bars a registered entity from listing or clearing an event contract that "involve[s], relate[s] to, or reference[s] terrorism, assassination, war, gaming, or an activity that is unlawful under any State or Federal law"; (a)(2) adds anything the CFTC finds by rule "contrary to the public interest." Under 40.11(c) the CFTC may open a 90-day review of a submitted contract, ask the exchange to suspend it, and then issue an order "approving or disapproving" it.
- **Self-certification.** Under 17 CFR 40.2 an exchange lists a new contract by filing it, its rules and a certification that it "complies with the Act and Commission regulations thereunder," received "by the open of business on the business day preceding the product's listing," with notice posted on its website. The CFTC may stay a listing, a power that can't be delegated to staff. Listing is fast by design: the burden is on the CFTC to stop a contract, not on the exchange to get it approved.

The CFTC's own explainer puts the federal position plainly: "Prediction markets are federally regulated and under federal law can operate in all 50 states." Its history runs from the Iowa Electronic Markets (1988) and a 1992 staff no-action letter, through HedgeStreet's designation as the first binary-options DCM in 2004 (renamed Nadex in 2009, bought by Crypto.com in 2022), to Dodd-Frank's 2010 special rule.

### The rulemaking, 2024 to 2026

| Date | Action | Status as of November 2026 |
| --- | --- | --- |
| June 10, 2024 | "Event Contracts" proposal (89 FR 48968): would have defined the 40.11 categories and barred contracts on elections, among others | Withdrawn February 6, 2026 (91 FR 5386); the CFTC "does not intend to issue final rules" |
| September 30, 2025 | Staff Letter 25-36, an advisory on sports contracts on certain contract markets | Withdrawn February 4, 2026; the chairman said it "inadvertently created confusion and uncertainty" |
| March 12, 2026 | Staff Letter 26-08, a prediction markets advisory calling DCMs "front-line regulators" | Staff guidance |
| March 16, 2026 | "Prediction Markets" advance notice (91 FR 12516) | Comments closed April 30, 2026; about 3,500 received |
| June 12, 2026 | "Prediction Markets; Public Interest Determinations" proposal (91 FR 35806): a contract "involves" an activity if its settlement is determined by an occurrence in it, and "gaming" means an activity done for recreation or entertainment, governed by rules, with outcomes depending on luck, skill or athletic ability | Comments closed July 27, 2026; not final |
| July 1, 2026 | Data reporting proposal for fully collateralized event contracts (91 FR 40102) | Not final |
| September 22, 2026 | Staff Letter 26-27 on mention markets, which "present a heightened risk of manipulation" | Staff guidance |
| October 19, 2026 | Interim final rule excluding casino-style gambling from "swap" (91 FR 65969), effective that day; and a proposal to define "swap" to include "Event contracts, including those based on sports-, politics-, cultural, and weather-related events" (91 FR 66022) | Interim rule in force, comments to November 18, 2026; the definition is proposed, comments due November 18, 2026 |

The direction is clear even with nothing final: the CFTC under Chairman Michael Selig treats sports, political and cultural contracts on registered exchanges as swaps within its exclusive jurisdiction, wants to define the one carve-out ("gaming") narrowly, and treats casino-style products as outside it. The October proposal passed 1-0, Chairman Selig voting in favor.

## Kalshi's Election Contracts

Kalshi self-certified contracts on which party would control the House and Senate in 2023. The CFTC reviewed them under 40.11 and on September 22, 2023 ordered them disapproved, finding they involved gaming and unlawful activity and were contrary to the public interest. Kalshi sued (*KalshiEX LLC v. CFTC*, No. 1:23-cv-03257, D.D.C.). On September 12, 2024, Judge Jia Cobb granted Kalshi summary judgment and vacated the order, holding that the contracts didn't involve unlawful activity or gaming as the statute uses those words. The CFTC appealed to the D.C. Circuit, and in May 2025, under new leadership, moved to dismiss its own appeal; the motion was granted and the case closed, as the CFTC recounted in its June 2026 proposal. <!-- source-gap: ida-kalshi-dc-circuit-docket | secondary | the D.C. Circuit docket number and the exact date the CFTC's appeal was dismissed | closes with: the D.C. Circuit docket or dismissal order on CourtListener or PACER | checked: 2026-11-05 --> I couldn't open the appellate docket, so the dismissal rests on the CFTC's own account.

The case settled the question for elections in practice: political contracts have listed since, and the 2024 proposal that would have barred them was withdrawn. It didn't settle sports, which turned on a different question: whether state gambling law can reach a contract on a federally registered exchange at all.

## Sports Contracts and the States

Sports became the bulk of the market in 2025 and 2026, and states that license sports betting moved to apply their gambling laws to it: gaming regulators and attorneys general took enforcement action, exchanges and FCMs sued them in federal court arguing the CEA preempts state law, and the cases reached the courts of appeals in 2026. Status, as of November 5, 2026:

| Court | Case | Holding or posture |
| --- | --- | --- |
| **Third Circuit** (New Jersey) | *KalshiEX, LLC v. Flaherty*, No. 25-1922, 172 F.4th 220 (April 6, 2026) | Affirmed a preliminary injunction for Kalshi: the CEA "preempts otherwise applicable state laws that purport to regulate sports-related event contracts on CFTC-licensed DCMs"; Judge Roth dissented. New Jersey petitioned for certiorari (No. 26-299, filed September 2, 2026); Kalshi's response is due December 7, 2026, and the petition hasn't been distributed for conference |
| **Ninth Circuit** (Nevada) | *KalshiEX, LLC v. Assad*, No. 25-7516 (August 28, 2026) | The opposite direction: "these sports event contracts are likely not swaps under the CEA." Rehearing en banc petition filed September 9, 2026. Companion cases went to the Supreme Court: *Robinhood Derivatives, LLC v. Dreitzer*, No. 26-338 (response due November 13, 2026), and *North American Derivatives Exchange v. Nevada*, No. 26-344 (Crypto.com's exchange; response due November 16, 2026) |
| **Sixth Circuit** (Ohio and Tennessee) | *KalshiEX LLC v. Schuler*, Nos. 26-3196 and 26-5235 (September 25, 2026) | Sports contracts are not swaps; the event must be "inherently associated with a 'financial, economic, or commercial consequence'" |
| **Massachusetts SJC** | *Commonwealth v. KalshiEx LLC*, No. SJC-13906 | The Attorney General's state-court suit; the CFTC filed an amicus brief on April 24, 2026; no decision I could open |
| **District courts** | *KalshiEX v. Johnson* (D. Ariz. 2026); *United States v. Minnesota* (D. Minn. July 27, 2026); *Coinbase Fin. Mkts. v. Raoul* (N.D. Ill. October 2, 2026) | Cited by the CFTC in its October 2026 proposal |

<!-- source-gap: ida-maryland-fourth-circuit | missing | the Fourth Circuit appeal in Kalshi's Maryland case and the Massachusetts SJC outcome as of November 2026 | closes with: the Fourth Circuit opinion or docket, and the SJC docket or decision | checked: 2026-11-05 --> Kalshi's Maryland case is reported to be on appeal to the Fourth Circuit, and the Massachusetts SJC case was pending when the CFTC filed its brief; I couldn't open either court's record, so neither has a status in the table.

The circuits are split: the Third Circuit says sports contracts on a DCM are swaps under exclusive federal jurisdiction, the Ninth and Sixth say they likely aren't. With three cert petitions pending, the Supreme Court is the likely end of it; none had been granted as of November 5, 2026.

The CFTC is now a litigant on the exchanges' side. It sued Arizona, Connecticut and Illinois on April 2, 2026, then New York (April 24), Wisconsin (April 28), Minnesota (May 19), Rhode Island (May 28), New Mexico (June 12), Kentucky (June 23) and Utah (October 27, when it counted proceedings against nine other states and briefs in four federal courts of appeal and one state supreme court). On July 14, 2026, after a Michigan state court ordered Kalshi to cancel executed trades with Michigan residents and Kalshi filed an emergency rule to comply, the CFTC stayed the rule and used its emergency authority to order the trades fulfilled: "A state cannot force a DCM to violate its obligations." It has also signed memoranda of understanding with MLB, the NHL and the NBA on integrity and information sharing.

For an engineer this is the part that changes the system. **Geography is a product setting that can change overnight,** by injunction, stay or appellate ruling, per state and per contract category. **A court can order trades unwound and a regulator can order them honored,** as Michigan and the CFTC did in the same week, so a cancellation path must exist and must be gated on a legal decision rather than a support ticket. **The broker and the exchange are separate defendants,** as Robinhood's and Crypto.com's own Nevada cases show.

## How a Contract Is Listed, Priced, Settled and Resolved

### Listing

A contract is a short rulebook: the underlying question, the outcome that pays, the **source agency** that will determine it (a league's official result, a government statistic, an index value, a weather station), the expiration and determination times, what happens if the event is canceled or postponed, and the payout. The exchange self-certifies it under 40.2 by the open of business the business day before listing, often as a series (one rule, many dated instances), and the CFTC issued an advisory on self-certifying event contract series on July 24, 2026. A contract whose source is ambiguous is the one that ends in a dispute; the source agency is the most important field in the record.

### Pricing: price as probability

A YES contract at $0.62 means the market prices the event at about 62%. The two sides of one contract:

| | Pays | Posts | Risks | Can make |
| --- | --- | --- | --- | --- |
| YES buyer at $0.62 | $1.00 if yes | $0.62 | $0.62 | $0.38 |
| NO buyer at $0.38 | $1.00 if no | $0.38 | $0.38 | $0.62 |
| Clearing house | | Holds $1.00 | | |

Every contract is fully funded at the moment of the trade, so there is no variation margin and no margin call, unlike the futures in [Futures & FCMs](/books/investing-and-digital-assets/futures-and-fcms#margin-and-daily-settlement); settlement just pays the dollar to whichever side won.

### Worked numbers: price, fee and payout

A customer buys 100 YES at $0.62 through an FCM, so the cost before fees is $62.00.

**A fee on expected earnings.** Kalshi describes its fee as a charge on "expected earnings" and publishes the formula in a fee schedule I couldn't open. <!-- source-gap: ida-kalshi-fee-formula | missing | Kalshi's trading fee formula and coefficient (reported as 0.07 x contracts x price x (1 - price), rounded up) | closes with: an opened copy of kalshi.com/docs/kalshi-fee-schedule.pdf | checked: 2026-11-05 --> Its API documentation's worked rounding example (one contract at 5.5 cents with a model fee of $0.00363825) is exactly 0.07 × 0.055 × (1 − 0.055), so I use that shape here as an illustration: fee = 0.07 × contracts × P × (1 − P).

- Model fee: 0.07 × 100 × 0.62 × 0.38 = **$1.6492**.
- Kalshi computes the trade fee to $0.000001 and, for an FCM-cleared account whose balance moves in cents, rounds the balance change down to the cent and records the difference as a rounding fee that is rebated later as it accumulates. The account moves by −$62.00 − $1.6492 = −$63.6492, aligned to **−$63.65**.
- If yes: the customer receives $100.00, a profit of $100.00 − $63.65 = **$36.35**. If no: a loss of **$63.65**.
- Breakeven: the event must be more likely than 63.65% for the trade to have positive expected value. At a true probability of 65%: 0.65 × $100 − $63.65 = **+$1.35**.

The shape matters. P × (1 − P) peaks at 0.25 when P is $0.50, so a coin-flip contract pays the most fee (0.07 × 0.25 = 1.75 cents a contract) and a long shot at $0.05 pays 0.07 × 0.0475 = 0.33 cents. The fee is proportional to the variance of the payout, not the price.

**A flat fee per contract.** The same trade on ForecastEx at $0.01 a contract per side costs $62.00 + $1.00 = $63.00, breakeven 63%. The FCM's own commission adds to either: Robinhood charges a commission per contract traded.

**The rounding is real money at scale.** Kalshi's documentation shows a fill at 5.5 cents whose balance moves 6 cents, half a cent of it fee and rounding. Robinhood's 16.4 billion contracts in a quarter make every rounding rule a revenue decision, and the rule (round per fill or per order, rebate accumulated overpayment) belongs in the fee schedule version stored with each fee ([Rounding](/docs/money/amounts#rounding)).

### Settlement and resolution

When the event resolves, the exchange determines the outcome from the source agency and settles: $1 to each winning contract, $0 to each losing one, both from collateral already held. Kalshi settles "often within about 3 hours." The hard cases are in the rules: a postponed game, a restated statistic, a source that publishes late or changes its method, a "mention" contract on whether a speaker says a word. Mention markets are why the CFTC warned in September 2026 of "a heightened risk of manipulation," and insider trading on event contracts is now an enforcement category: the CFTC's 2026 cases include a $35,000 penalty over a State of the Union contract, cases tied to Maduro-related contracts and Google search results, and a $172,000 mention-markets case.

![The event market state machine. A row of states: listed, open, closed, determined and settled, with that path accented and settled a terminal state. A dashed exit from listed down to the terminal withdrawn state labeled stay or 40.11 review. A dashed back edge over the top from determined to closed labeled source revised: re-determine.](/diagrams/ida-event-market-states.svg "A contract lists on self-certification, trades until its close, is determined from its named source and settles at $1 or $0 from collateral already held; a stay or a 40.11 review can withdraw it before trading, and a revised source sends a determination back before settlement.")

## How to Build It

The core model has `instruments` with the `event_contract` type, `orders` and `positions`, and accounts carry the `event_contracts` capability ([The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model)). Event contracts add the market (one question with its rules), its outcomes (each an instrument), the source that resolves it, and where it may be offered:

```sql
CREATE TABLE resolution_sources (          -- who decides the outcome
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  name                TEXT NOT NULL,         -- 'league official result', 'BLS CPI release'
  kind                TEXT NOT NULL CHECK (kind IN ('league', 'government_statistic',
                        'index_value', 'weather_station', 'election_authority',
                        'media_transcript', 'other')),
  url                 TEXT,
  fallback_source_id  UUID REFERENCES resolution_sources (id)
);

CREATE TABLE event_markets (               -- one question, as certified
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  venue_id            UUID NOT NULL REFERENCES venues (id),          -- the DCM
  clearing_venue_id   UUID NOT NULL REFERENCES venues (id),          -- the DCO
  series_code         TEXT NOT NULL,         -- the certified rule set
  market_code         TEXT NOT NULL,         -- this dated instance
  question            TEXT NOT NULL,
  category            TEXT NOT NULL CHECK (category IN ('sports', 'politics', 'economics',
                        'weather', 'crypto', 'culture', 'mention', 'other')),
  resolution_source_id UUID NOT NULL REFERENCES resolution_sources (id),
  rules_version       TEXT NOT NULL,         -- the rule text the trade was made under
  certified_at        TIMESTAMPTZ NOT NULL,  -- 40.2 filing
  opens_at            TIMESTAMPTZ NOT NULL,
  closes_at           TIMESTAMPTZ NOT NULL,
  expected_determination_at TIMESTAMPTZ,
  mutually_exclusive  BOOLEAN NOT NULL,      -- one and only one outcome pays
  status              TEXT NOT NULL CHECK (status IN ('listed', 'open', 'closed',
                        'determined', 'settled', 'withdrawn')),
  UNIQUE (venue_id, market_code),
  CHECK (opens_at < closes_at)
);

CREATE TABLE event_outcomes (              -- each tradable outcome is an instrument
  instrument_id       UUID PRIMARY KEY REFERENCES instruments (id),
  event_market_id     UUID NOT NULL REFERENCES event_markets (id),
  label               TEXT NOT NULL,         -- 'Yes', or a team, a range, a candidate
  payout              BIGINT NOT NULL DEFAULT 100,   -- cents per contract if it wins
  result              TEXT CHECK (result IN ('yes', 'no', 'void')),
  determined_at       TIMESTAMPTZ,
  determination_ref   TEXT,                  -- the source's publication used
  UNIQUE (event_market_id, label)
);

CREATE TABLE market_availability (         -- where a category may be offered, per entity
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),  -- the FCM
  jurisdiction        TEXT NOT NULL,         -- 'US-NJ', 'US-NV', ...
  category            TEXT NOT NULL,
  allowed             BOOLEAN NOT NULL,
  basis               TEXT NOT NULL,         -- 'injunction', 'stay', 'appellate ruling', 'policy'
  case_ref            TEXT,                  -- the case or order it rests on
  valid_during        TSTZRANGE NOT NULL,
  EXCLUDE USING gist (legal_entity_id WITH =, jurisdiction WITH =, category WITH =,
    valid_during WITH &&)
);
```

Rules the schema and jobs enforce:

- **An order checks availability at entry.** The account's jurisdiction, the market's category and the FCM's `market_availability` row decide whether the order is accepted; a ruling is a new effective-dated row, never a config change without a record.
- **Positions settle through the ledger.** Settlement is a journal entry per outcome: winning contracts converted to $1 each from the clearing house's collateral, losing contracts closed at $0; the positions view rebuilds from it like any other instrument.
- **A determination names its source and the rules version.** `event_outcomes.determination_ref` points to the publication used, so a dispute can compare it with the rule the trade was made under.
- **A court-ordered cancellation is a reversal, gated on legal approval.** It reverses executions and refunds premiums and fees with a `cases` row as its authority; a regulator's counter-order is a second case.

The fee illustration as code, in integer microdollars to keep the precision the venue uses:

```go tab="Go"
// QuadraticFeeMicros returns the model fee in microdollars for contracts
// at a price in cents, using a coefficient in basis points (700 = 0.07).
func QuadraticFeeMicros(contracts, priceCents, coeffBps int64) int64 {
	// coeff x C x P x (1 - P), with P = priceCents/100:
	// (coeffBps/10_000) x C x (priceCents/100) x ((100-priceCents)/100) x 1e6
	num := coeffBps * contracts * priceCents * (100 - priceCents) * 1_000_000
	den := int64(10_000 * 100 * 100)
	return (num + den - 1) / den // round up to the microdollar
}
```

```rust tab="Rust"
/// Returns the model fee in microdollars for contracts at a price in cents,
/// using a coefficient in basis points (700 = 0.07).
pub fn quadratic_fee_micros(contracts: i64, price_cents: i64, coeff_bps: i64) -> i64 {
    // coeff x C x P x (1 - P), with P = price_cents / 100
    let num = coeff_bps * contracts * price_cents * (100 - price_cents) * 1_000_000;
    let den: i64 = 10_000 * 100 * 100;
    (num + den - 1) / den // round up to the microdollar
}
```

For 100 contracts at 62 cents with a 700 basis point coefficient this returns 1,649,200 microdollars, the $1.6492 above. The coefficient and rounding come from the fee schedule version, never from code ([Rules as Data](/docs/building-blocks/rules-as-data)).

## Auditing

- **Every contract's rules as certified.** The series and market, the 40.2 filing time, the rules version and the source agency, for the life of every position opened under them.
- **Every determination with its evidence.** The source's publication, the time it was read, who determined the outcome, and any revision before settlement.
- **Every geography decision with its legal basis.** Which categories were offered where, when that changed, and the order or ruling behind each change, so a regulator or court can see what the firm did on any date.
- **Every fee with its schedule.** The schedule version, the model fee, the rounding fee and the rebate per fill.
- **Every surveillance case on an event market.** Insider and manipulation alerts on mention and other thin markets, with the accounts and orders involved, as `cases` rows (Market Surveillance & Manipulation covers the systems).
- **Every reversal.** Court-ordered cancellations and regulator-ordered reinstatements, each with its `cases` row and the entries it produced.

## What This Means for the System You Build

- **Treat each outcome as an instrument** priced in cents with a $1 payout, fully collateralized, settled through the ledger.
- **Store the source agency and rules version with every market,** and the source's publication with every determination.
- **Make availability per jurisdiction and category an effective-dated table** tied to the ruling that set it, checked at order entry.
- **Build the court-ordered reversal before you need it,** gated on a legal case, and expect a regulator's counter-order.
- **Compute fees from the schedule version,** including the rounding and rebate rules, and store each component.
- **Surveil thin and mention markets for insiders;** the CFTC now brings those cases.
- **Date every legal status you show customers or partners,** because the circuits are split and the Supreme Court has three petitions before it.

## References

**Law and regulation**

- [7 USC 7a-2](https://www.law.cornell.edu/uscode/text/7/7a-2), the special rule for event contracts in §5c(c)(5)(C): public interest determinations for unlawful activity, terrorism, assassination, war and gaming, and the 90-day review
- [17 CFR 40.11](https://www.law.cornell.edu/cfr/text/17/40.11), the prohibited categories, public interest additions by rule, and the 90-day review with suspension and an approving or disapproving order
- [17 CFR 40.2](https://www.law.cornell.edu/cfr/text/17/40.2), self-certification by the open of business on the business day before listing, its contents and the Commission's stay

**Regulators and guidance**

- [CFTC: Prediction markets](https://www.cftc.gov/LearnandProtect/PredictionMarkets), the federal position on all 50 states and the history from the Iowa Electronic Markets to Nadex and Crypto.com
- [CFTC: Event Contracts proposal (89 FR 48968, June 10, 2024)](https://www.federalregister.gov/api/v1/documents/2024-12125.json), the 2024 proposal
- [CFTC: Event Contracts; Withdrawal of Proposed Regulatory Action (91 FR 5386, February 6, 2026)](https://www.federalregister.gov/api/v1/documents/2026-02454.json), no final rules intended
- [CFTC: Press Release 9179-26 (February 4, 2026)](https://www.cftc.gov/PressRoom/PressReleases/9179-26), withdrawal of the 2024 proposal and Staff Letter 25-36, and the chairman's statements
- [CFTC: Press Release 9193-26 (March 12, 2026)](https://www.cftc.gov/PressRoom/PressReleases/9193-26), Staff Letter 26-08 on prediction markets
- [CFTC: Prediction Markets advance notice (91 FR 12516, March 16, 2026)](https://www.federalregister.gov/api/v1/documents/2026-05105.json), comments to April 30, 2026
- [CFTC: Prediction Markets; Public Interest Determinations (91 FR 35806, June 12, 2026)](https://www.federalregister.gov/documents/full_text/html/2026/06/12/2026-11854.html), the proposed meaning of "involves" and "gaming," the Kalshi case history including the May 2025 dismissal, the ErisX NFL contracts, and the comment count
- [CFTC: Further Definition of "Swap"; Inclusions (91 FR 66022, October 19, 2026)](https://www.federalregister.gov/documents/full_text/html/2026/10/19/2026-21377.html), the proposed inclusion of event contracts in "swap," the August 2026 volume by category, DCM counts, the Third, Ninth and Sixth Circuit and district court decisions, the 1-0 vote and comments to November 18, 2026
- [CFTC: Press Release 9302-26 (September 22, 2026)](https://www.cftc.gov/PressRoom/PressReleases/9302-26), Staff Letter 26-27 on mention markets
- [CFTC: Press Release 9267-26 (July 14, 2026)](https://www.cftc.gov/PressRoom/PressReleases/9267-26), the stay of Kalshi's emergency rule after the Michigan court order and the order to fulfill trades
- [CFTC: Press Release 9315-26 (October 27, 2026)](https://www.cftc.gov/PressRoom/PressReleases/9315-26), the suit against Utah and the count of other state proceedings and appellate briefs
- [CFTC: Press Release 9206-26 (April 2, 2026)](https://www.cftc.gov/PressRoom/PressReleases/9206-26), suits against Arizona, Connecticut and Illinois
- [CFTC: Press Release 9219-26 (April 24, 2026)](https://www.cftc.gov/PressRoom/PressReleases/9219-26), the amicus brief in *Commonwealth v. KalshiEx LLC*, SJC-13906
- [CFTC: Press Release 9289-26](https://www.cftc.gov/PressRoom/PressReleases/9289-26), the $172,000 mention markets insider case
- [CFTC: Press Release 9276-26 (July 31, 2026)](https://www.cftc.gov/PressRoom/PressReleases/9276-26), the $35,000 State of the Union contract case
- [CFTC: Press Release 9273-26 (July 24, 2026)](https://www.cftc.gov/PressRoom/PressReleases/9273-26), the advisory on self-certifying event contract series

**Courts and enforcement**

- [GovInfo: KalshiEX LLC v. CFTC, No. 1:23-cv-03257 (D.D.C.), memorandum opinion of September 12, 2024](https://api.govinfo.gov/packages/USCOURTS-dcd-1_23-cv-03257/granules/USCOURTS-dcd-1_23-cv-03257-0/summary?api_key=DEMO_KEY), summary judgment for Kalshi on the congressional control contracts
- [KalshiEX, LLC v. Flaherty, No. 25-1922 (3d Cir. April 6, 2026)](https://caselaw.findlaw.com/court/us-3rd-circuit/118272839.html), the preliminary injunction affirmed on preemption
- [Supreme Court: Flaherty v. KalshiEX, LLC, No. 26-299](https://www.supremecourt.gov/search.aspx?filename=/docket/docketfiles/html/public/26-299.html), the petition, amicus briefs and the response extended to December 7, 2026
- [Supreme Court: Robinhood Derivatives, LLC v. Dreitzer, No. 26-338](https://www.supremecourt.gov/search.aspx?filename=/docket/docketfiles/html/public/26-338.html), from Ninth Circuit No. 25-7831, decided August 28, 2026, response due November 13, 2026
- [Supreme Court: North American Derivatives Exchange v. Nevada, No. 26-344](https://www.supremecourt.gov/search.aspx?filename=/docket/docketfiles/html/public/26-344.html), from Ninth Circuit No. 25-7187, response due November 16, 2026
- [CFTC: Press Release 8478-22 (January 3, 2022)](https://www.cftc.gov/PressRoom/PressReleases/8478-22), Polymarket's $1.4 million penalty for off-exchange event-based binary options without DCM designation or SEF registration

**Filings**

- [Robinhood Markets: Q3 2026 results (October 27, 2026)](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000164/q32026robinhoodexhibit991.htm), 16.4 billion event contracts traded, $173 million of event contract revenue, the metric's definition and Rothera's revenue and volume
- [Robinhood Markets: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000023/hood-20251231.htm), the Prediction Markets Hub through its FCM, a commission per contract, and Rothera's acquisition of MIAXdx
- [Coinbase Global: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1679788/000167978826000015/coin-20251231.htm), Coinbase Financial Markets beginning event contracts in December 2025
- [Interactive Brokers Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1381197/000138119726000062/ibkr-20251231.htm), ForecastEx as a DCM and DCO and ForecastTrader

**Vendor documentation**

- [Kalshi: Fees (April 19, 2026)](https://help.kalshi.com/en/articles/13823805-fees), the fee on expected earnings, maker fees and free cancellation
- [Kalshi: Fee rounding](https://docs.kalshi.com/getting_started/fee_rounding), trade fees to $0.000001, cent alignment for FCM-cleared balances, rounding fees and rebates, and the 5.5-cent worked example
- [Kalshi: Trading hours](https://help.kalshi.com/en/articles/13823807-what-are-trading-hours), 24/7 with Thursday maintenance from 3:00 to 5:00 am ET
- [Kalshi: Who are you trading with](https://help.kalshi.com/en/articles/13823808-who-are-you-trading-with), members trade with each other, not the exchange
- [Kalshi: Market FAQs](https://help.kalshi.com/en/articles/13823821-market-faqs), source agencies and settlement often within about 3 hours
- [ForecastEx: FAQ](https://forecastex.com/faq), DCM and DCO registration, $1 or $0 settlement, full collateral, incentive coupons and the $0.01 fee per side
- [Polymarket US: Events and markets](https://docs.polymarket.us/concepts/events-and-markets.md), markets as yes/no questions settling at $1.00 or $0.00
- [Robinhood: Prediction markets](https://robinhood.com/us/en/prediction-markets/), event contracts offered by Robinhood Derivatives as an FCM and swap firm, and the categories listed
