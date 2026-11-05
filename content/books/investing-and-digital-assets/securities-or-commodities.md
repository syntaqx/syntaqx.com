+++
title = "Securities, Commodities & Crypto Market Structure"
nav_title = "Crypto Market Structure"
description = "Howey and the token cases, the 2025 dismissals, the SEC's 2026 taxonomy and proposed exemptions, CLARITY's stall, CFTC spot authority and the listing check."
category = "Investing & Digital Assets Industry"
order = 2570
part = "The Rules"
tags = ["crypto", "securities-law", "howey", "sec", "cftc", "market-structure", "listings"]
+++

Every crypto product question in the US starts with one that the law answers badly: is this token a security? If it is, the SEC regulates its offering, the venues that trade it, the brokers that route orders in it and the custodians that hold it, and a platform that lists it without registering as an exchange, broker and clearing agency is breaking the Exchange Act. If it isn't, it is a commodity under the Commodity Exchange Act, the CFTC polices fraud and manipulation in it and regulates its derivatives, and the spot market in it belongs, for custody and transmission, to FinCEN and the states ([Regulators & Licenses](/books/investing-and-digital-assets/regulators-and-licenses#the-regulators)). No statute draws the line. A 1946 Supreme Court test about orange groves does, as applied by district judges who disagreed with each other, by an SEC that sued its way through 2023 and 2024 and dismissed most of those cases in 2025, and since March 23, 2026 by an interpretive release that sorts crypto assets into five categories.

For an engineer the consequence is that the answer is data with a date. A listing review records which category the platform's lawyers put a token in, under which authority, as of when, and which entity may therefore offer it; when the law moves (and it moved three times in three years), the records say which assets were reviewed under which view. This chapter covers the *Howey* test applied to two token sales, the cases that tested it (Ripple, Terraform, Coinbase), the enforcement era and its end, the SEC's 2026 taxonomy and its proposed Regulation Crypto Assets, the CLARITY Act's stall in the Senate, the CFTC's spot-market authority and its 2026 rulemaking, and what a listing team should check, and adds `asset_classifications` and `classification_reviews` to [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model). The listing process itself (New York's coin-listing rules, MiCA's white papers, the integration checklist) is [Listing & Delisting Assets](/books/investing-and-digital-assets/listing-assets); licenses are Licensing a Crypto Business; stablecoins, which have their own statute, are [Stablecoin Law](/books/investing-and-digital-assets/stablecoin-law).

## The Test

*SEC v. W.J. Howey Co.*, 328 U.S. 293, decided May 27, 1946, was about a Florida company that sold rows of citrus trees in Lake County under land sales contracts and offered buyers, mostly out-of-state people with no farming skills, a service contract under which an affiliate cultivated the groves and marketed the fruit. The Court held the package was an "investment contract," and therefore a security, defining one as "a contract, transaction[,] or scheme whereby a person [(1)] invests his money [(2)] in a common enterprise and [(3)] is led to expect profits solely from the efforts of the promoter or a third party" (the bracketed numbering is Judge Torres's in *Ripple*). Later cases read "solely" as the reasonable expectation of profits "derived from the entrepreneurial or managerial efforts of others" (*United Housing Foundation v. Forman*, 421 U.S. 837, 852 (1975)), and look at substance and economic reality rather than labels.

Three things make the test hard to apply to tokens:

- **A token isn't a contract.** The investment contract is the arrangement around the sale: the promises, the use of proceeds, the restrictions. The same token can be sold inside one and outside one. Judge Torres put it directly: "XRP, as a digital token, is not in and of itself a 'contract, transaction[,] or scheme' that embodies the *Howey* requirements of an investment contract."
- **The promoter's efforts fade.** A team that raises money to build a network makes promises; once the network runs without it, buyers on an exchange are buying a thing, not a promise. When that transition happens is the question every listing team asks, and until 2026 nobody official had answered it.
- **Secondary buyers don't know the seller.** On an order book, a buyer can't tell whether the issuer or another holder is on the other side.

## Worked Example: Two Token Sales

One hypothetical issuer, Lattice Labs, sells its token LTX twice. The facts are invented; the analysis follows the opinions and the 2026 release cited below.

**Sale A, before launch.** Lattice sells 50,000,000 tokens at $0.10 to 40 funds and family offices under written purchase agreements, raising 50,000,000 × $0.10 = $5,000,000. The deck says the proceeds fund the engineering team for two years, that the team will pursue listings on major exchanges, and that the token will rise in value as the network is adopted. The agreements lock the tokens for 12 months and then release 1/12 a month.

| Prong | Facts | Reading |
| --- | --- | --- |
| Investment of money | $5,000,000 paid in cash and stablecoins | Met |
| Common enterprise | Proceeds pooled into one treasury; every buyer holds the same token whose value depends on the network | Met: the pooling and tied fortunes Judge Torres found for Ripple's institutional buyers |
| Expectation of profits from others' efforts | Deck ties value to the team's work and to listings; buyers can't use the token yet; lockups | Met: lockups are "inconsistent with the notion that XRP was used as a currency or for some other consumptive use" |

Sale A is an offer and sale of investment contracts, and needed registration or an exemption. Under the 2026 release, the token itself is not a security: if it later functions as the release describes, it is a digital commodity sold "subject to" an investment contract, and the contract ends when the promises are kept or abandoned ([The 2026 Taxonomy](#the-2026-taxonomy)). Under the proposed Regulation Crypto Assets, $5,000,000 is exactly the startup exemption's cap over four years; a raise of $5,000,001 would need the fundraising exemption instead ([Regulation Crypto Assets](#regulation-crypto-assets-proposed)).

**Sale B, two years later.** The network has launched; validators run it; the token pays its fees; Lattice has published that it shipped the roadmap the deck described. Lattice sells 2,000,000 tokens a day through a market maker into exchange order books trading 400,000,000 tokens a day, 2,000,000 / 400,000,000 = 0.5% of volume, and buyers can't see who is selling.

| Prong | Facts | Reading |
| --- | --- | --- |
| Investment of money | Buyers pay | Met |
| Common enterprise | Buyers' money may go to Lattice or to any other seller | Weak: in *Ripple*, programmatic buyers "could not have known if their payments of money went to Ripple, or any other seller of XRP" |
| Expectation of profits from others' efforts | No promises made to these buyers; the essential work is done | Not met under *Ripple*'s reasoning, and under the release the token has separated from the investment contract by fulfillment |

Under Judge Torres's 2023 reasoning Sale B is not an investment contract offer; under the 2026 release the token has separated and trades as a digital commodity. The Terraform court read *Howey* differently, which is why a listing memo records the authority it relied on. Two changes would flip Sale B: Lattice promising buyers on the exchange that it will buy back tokens to support the price (a new representation of essential efforts at the time of sale), or Lattice announcing an unfinished roadmap with the sale proceeds earmarked for it.

## The Cases

### Ripple, 2020 to 2025

The SEC sued Ripple Labs and two executives on December 22, 2020, alleging that XRP sales were unregistered securities offerings. On July 13, 2023, Judge Analisa Torres split the sales three ways in *SEC v. Ripple Labs, Inc.*, No. 20 Civ. 10832 (S.D.N.Y.):

- **Institutional Sales,** about $728.9 million of XRP sold directly under written contracts, were investment contracts: the buyers' money was pooled, Ripple pitched XRP's value as tied to its efforts, and some contracts carried lockups or resale restrictions keyed to trading volume.
- **Programmatic Sales,** about $757.6 million sold on exchanges through "blind bid/ask transactions," were not: since 2017 they were less than 1% of global XRP volume, and "a Programmatic Buyer stood in the same shoes as a secondary market purchaser who did not know to whom or what it was paying its money." The court expressly left secondary-market sales undecided.
- **Other Distributions,** $609 million recorded as consideration other than cash (XRP paid to employees and for services), failed the first prong: nobody invested money.

The case ended without an appellate answer. On August 7, 2025, the SEC and the defendants stipulated to dismiss the SEC's appeal and Ripple's cross-appeal in the Second Circuit, leaving the district court's final judgment in place: a $125,035,150 civil penalty and an injunction against violating the Securities Act's registration provisions (Litigation Release 26369).

### Terraform, 2023 to 2024

Judge Jed Rakoff, in the same district, declined to follow the purchaser-by-purchaser distinction in *SEC v. Terraform Labs Pte. Ltd.* in July 2023. <!-- source-gap: ida-terraform-mtd-2023 | missing | Judge Rakoff's July 31, 2023 opinion in SEC v. Terraform Labs declining to follow Ripple's institutional/programmatic distinction | closes with: the opinion on CourtListener or the S.D.N.Y. site, opened and quoted | checked: 2026-11-05 --> I could not open that opinion, so I rely on what is documented: on December 28, 2023 the court found Terraform and Do Kwon liable for offering and selling crypto asset securities in unregistered transactions, a jury found them liable for fraud on April 5, 2024, and the final judgment of June 13, 2024 ordered Terraform to pay $3,586,875,883 in disgorgement, $466,952,423 in prejudgment interest and a $420,000,000 penalty (about $4.47 billion), with Kwon jointly liable for $110 million of disgorgement and $14,320,196 of interest and separately an $80 million penalty. The collapse itself is in [Crises & the Rules They Wrote](/books/investing-and-digital-assets/crises-and-the-rules#2022-terra-celsius-voyager-and-ftx).

### Coinbase, Binance and the platform cases

The 2023 platform cases alleged that exchanges were unregistered exchanges, brokers and clearing agencies because tokens on them were securities: Binance, BAM Trading and Changpeng Zhao on June 5, 2023 and Coinbase on June 6 ([The US federal question](/books/investing-and-digital-assets/listing-assets#the-us-federal-question) has the filings). On February 27, 2025 the SEC dismissed the Coinbase case by joint stipulation, "Given the pending work of the Crypto Task Force" formed on January 21, 2025, saying the dismissal did not rest on "any assessment of the merits" and "does not reflect the Commission's position on any other case." The SEC moved to dismiss the Binance case on May 29, 2025 (the filings are in the same section of Listing & Delisting Assets), and the Kraken staking settlement of 2023 is in [The SEC Record](/books/investing-and-digital-assets/staking#the-sec-record).

What the dismissals did and didn't do matters for the records a platform keeps:

- **No court held that the tokens in those complaints were not securities.** The dismissals were discretionary; the district court opinions in *Ripple* and *Terraform* still stand as the only merits rulings, and they disagree.
- **Private plaintiffs aren't bound.** A dismissal by the SEC doesn't stop a class action under the Securities Act's private remedies, so the platform's dated analysis of each token is still its defense.
- **The theory can return.** An enforcement posture is a policy of a Commission with five members; the 2026 release is the more durable statement because it is published as an interpretive rule, but it binds the Commission, not courts.

## The 2026 Taxonomy

On March 23, 2026 the SEC published "Application of the Federal Securities Laws to Certain Types of Crypto Assets and Certain Transactions Involving Crypto Assets" (Release Nos. 33-11412 and 34-105020, 91 FR 13714), effective the same day, with the CFTC joining to say it "and its staff will administer the Commodity Exchange Act consistent with the interpretation." The release says it "does not supersede or replace the *Howey* test, which is binding legal precedent," supersedes the staff's April 3, 2019 framework for investment contract analysis of digital assets, and was designated a major rule under the Congressional Review Act.

It sorts crypto assets into five categories:

| Category | What it covers | Security? |
| --- | --- | --- |
| **Digital commodity** | An asset whose value comes from "the programmatic operation of a functional crypto system," with no intrinsic economic rights such as profits or claims on an issuer | No |
| **Digital collectible** | Assets "designed to be collected and/or used" (art, in-game items, memes); fractionalized collectibles can be sold as investment contracts | No |
| **Digital tool** | An asset that "perform[s] a practical function": a membership, a ticket, a credential | No |
| **Stablecoin** | May or may not be a security by its terms; a GENIUS Act payment stablecoin from a permitted issuer is excluded from "security" by statute, and the release treats a defined class of "Covered Stablecoins" as not involving securities | Depends |
| **Digital security** | A tokenized financial instrument: "a security is a security regardless of whether it is issued, or otherwise represented, offchain or onchain" | Yes |

The release names sixteen assets as digital commodities: Aptos (APT), Avalanche (AVAX), Bitcoin (BTC), Bitcoin Cash (BCH), Cardano (ADA), Chainlink (LINK), Dogecoin (DOGE), Ether (ETH), Hedera (HBAR), Litecoin (LTC), Polkadot (DOT), Shiba Inu (SHIB), Solana (SOL), Stellar (XLM), Tezos (XTZ) and XRP.

The mechanism that matters most for platforms is **attachment and separation**. A non-security asset becomes subject to an investment contract when the issuer induces an investment of money in a common enterprise with representations of essential managerial efforts made before or at the time of the sale; statements after the sale don't convert it. In secondary trading the contract continues to attach only while buyers would reasonably expect the issuer's representations to remain connected to the asset. It separates in two ways: **fulfillment**, "once the issuer has fulfilled its representations or promises to engage in essential managerial efforts" (even if it keeps doing non-essential work), or **abandonment**, where the issuer announces "through a widely disseminated communication that it is abandoning the development," which ends the contract though not the issuer's liability for past misstatements or unregistered sales.

The release also takes positions on activities, each as an interpretation, not a statute:

- **Mining and staking.** Solo mining and pool participation are "administrative or ministerial activity." Solo staking, self-custodial staking with a third party, custodial staking and liquid staking don't involve securities transactions, with ancillary services (slashing coverage, early unbonding, alternate reward schedules, aggregation) treated the same way; a liquid staking receipt for a non-security asset "is not a receipt for a security." The 2025 staff statements these replace are in [The SEC Record](/books/investing-and-digital-assets/staking#the-sec-record).
- **Wrapping.** A redeemable wrapped token that is a receipt for a non-security asset is not a security.
- **Airdrops.** An airdrop of a non-security asset to recipients who give no money, goods, services or other consideration doesn't involve an investment of money; an airdrop conditioned on buying something or doing a task falls outside the interpretation.

Read against the worked example: Sale A is still an investment contract offering; Lattice's token, if it functions as a digital commodity, separates from that contract when Lattice ships the promised work, and Sale B happens after separation.

## Regulation Crypto Assets (Proposed)

The SEC proposed "Regulation Crypto Assets" on August 21, 2026 (Release Nos. 33-11434 and 34-106150, File No. S7-2026-27, 91 FR 54510); comments closed October 20, 2026, and as of November 5, 2026 it is a proposal, not a rule. It would add 17 CFR part 228 for "covered investment contracts" (a contract to which one crypto asset is subject, where that asset is not itself a security):

- **Rule 200, a startup exemption:** offerings up to $5 million over a period of up to four years.
- **Rules 300 to 307, a fundraising exemption:** up to $75 million in each 12-month period, in two tiers modeled largely on Regulation A, the larger with financial statements and ongoing reports.
- **Rule 103, principles-based disclosure** about the contract, the offering, the asset, management, the network and its plan of development, security and source code, economics and allocations, governance and the ecosystem; Rule 104 applies Regulation A's bad actor disqualification.
- **Rule 400, a safe harbor** under which, if its conditions are met, the asset is deemed not subject to an investment contract for purposes of the "security" definitions.
- **Rule 500,** treating purchasers as qualified purchasers to preempt state registration for covered investment contracts and certain secondary transactions.

Tokens sold under the exemptions "would not be restricted securities," so they could trade immediately; the proposed forms are 1-CRYPTO, 1-KC, 1-SC, 1-UC, TR and NOR. For a listing team the proposal matters before it is final, because an issuer that says it is relying on Rule 400 will be asking to be listed on the strength of a condition the SEC hasn't adopted.

## Congress: the CLARITY Act

The Digital Asset Market Clarity Act (H.R. 3633), introduced May 29, 2025, passed the House 294 to 134 on July 17, 2025. It would have given the CFTC supervision of spot markets in digital commodities, required exchanges, brokers and dealers in them to register, disclose risks and segregate customer funds, written a statutory taxonomy and a rule for when a token sold under an investment contract stops being treated as a security, and given limited safe harbors to DeFi developers. In the Senate, the cloture vote on the motion to proceed failed 49 to 50 on September 15, 2026, short of the 60 votes needed; Senator Tillis entered a motion to reconsider, which keeps a later vote possible, and the reported sticking points were ethics provisions for senior officials, stablecoin yield (the same fight as [The Yield Ban](/books/investing-and-digital-assets/stablecoin-law#the-yield-ban)) and illicit finance. <!-- source-gap: ida-clarity-cloture | secondary | the 49-50 cloture vote of September 15, 2026, the motion to reconsider and the sticking points | closes with: the Senate roll call vote page and congress.gov actions for H.R. 3633 | checked: 2026-11-05 --> The status rests on press tracking, because congress.gov refused my fetches; as of November 5, 2026 the bill is stalled, not enacted. What exists instead is the 2026 release, which is an interpretation the next Commission can revise.

## The CFTC and the Spot Market

The CFTC's authority over a non-security token's spot market is narrow. It polices fraud and manipulation in any commodity, and it regulates futures, options and swaps on them ([Futures & FCMs](/books/investing-and-digital-assets/futures-and-fcms#crypto-futures-in-the-us)). Its reach into spot trading runs through 7 USC 2(c)(2)(D), retail commodity transactions: a transaction with a person who is not an eligible contract participant or eligible commercial entity, "on a leveraged or margined basis" or financed by the offeror, is treated "as if" it were a futures contract, so it must be on a designated contract market, unless it "results in actual delivery within 28 days." That is why a US exchange's margin and leveraged spot products are FCM and DCM business and its unleveraged spot book is a money transmission business.

The 2025 to 2026 steps, as published in the Federal Register:

- **December 16, 2025:** withdrawal of the CFTC's June 24, 2020 interpretive guidance on "actual delivery" for retail digital asset commodity transactions.
- **June 3, 2026:** a policy statement on listing perpetual contracts, with an order covering a bitcoin spot-referenced contract (Perpetuals & Crypto Derivatives).
- **October 13, 2026:** an advance notice of proposed rulemaking, "Regulation Crypto Asset Transactions and Regulation Crypto Asset Markets" (91 FR 64811, RIN 3038-AF80, docket CFTC-2026-2179, 17 CFR parts 1, 38 and 39), seeking comment on "fit-for-purpose rules" under section 2(c)(2)(D) for crypto asset transactions and markets. Comments are due December 14, 2026; it is a notice, not a proposal.

Without CLARITY, the CFTC can't supervise unleveraged spot venues the way it supervises a DCM; the ANPRM is about the leveraged and financed retail business it already reaches and the markets that list it.

## What a Listing Team Should Check

The legal question is one row of the listing review in [The Diligence](/books/investing-and-digital-assets/listing-assets#the-diligence); this is what goes into it, as of November 2026:

1. **Category under the 2026 release,** with the facts that place it: what the token does on a functioning system, what rights it carries, whether it is one of the sixteen named digital commodities.
2. **Investment contract status:** whether the issuer or a promoter made representations of essential managerial efforts at sale, whether they are fulfilled or abandoned (with the public communication), and whether the issuer is still selling, how, and what it promises buyers now.
3. **Who sells into the platform:** issuer or affiliate sales through the platform's own book revive the *Ripple* institutional question in a new form; record whether the issuer is a customer and what it sells.
4. **Stablecoin and tokenized security carve-outs:** a stablecoin goes to the GENIUS analysis in [Stablecoin Law](/books/investing-and-digital-assets/stablecoin-law); a digital security can only be offered by the broker-dealer and venue entities that are registered for it.
5. **State and foreign overlays:** New York's coin-listing policy and Greenlist, and MiCA's white paper rule for EU customers ([The Rules](/books/investing-and-digital-assets/listing-assets#the-rules)).
6. **The authority relied on and its date:** the release, a court opinion, a proposal (not yet law), or counsel's memo, so that a later change can find every asset reviewed under the old view.
7. **Re-review triggers:** an issuer announcement, a governance change that recentralizes control, a new token sale, a court ruling, a Commission action.

## How to Build It

`instruments` and `listing_reviews` in [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) and [How to Build It](/books/investing-and-digital-assets/listing-assets#how-to-build-it) in Listing & Delisting Assets say what is listed and how it was approved; the legal classification needs its own history, because it changes when the law does, not when the asset does:

```sql
CREATE TABLE asset_classifications (       -- the platform's legal view of an asset, over time
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_id        UUID NOT NULL REFERENCES instruments (id),
  jurisdiction         TEXT NOT NULL,         -- 'US', 'US-NY', 'EEA', 'GB', ...
  category             TEXT NOT NULL CHECK (category IN ('digital_commodity',
                         'digital_collectible', 'digital_tool', 'payment_stablecoin',
                         'other_stablecoin', 'digital_security', 'mica_emt', 'mica_art',
                         'mica_other', 'undetermined')),
  investment_contract  TEXT NOT NULL CHECK (investment_contract IN ('none', 'attached',
                         'separated_fulfilled', 'separated_abandoned', 'undetermined')),
  separation_evidence  TEXT,                  -- the issuer communication or milestone relied on
  authority            TEXT NOT NULL,         -- '91 FR 13714', 'SEC v. Ripple (SDNY 2023)', 'memo'
  authority_status     TEXT NOT NULL CHECK (authority_status IN ('statute', 'final_rule',
                         'interpretation', 'court_opinion', 'proposal', 'counsel_view')),
  permitted_entity_kinds TEXT[] NOT NULL,     -- legal_entities.kind values that may offer it
  review_id            UUID NOT NULL,         -- the classification_review that decided it
  valid_during         TSTZRANGE NOT NULL,
  EXCLUDE USING gist (instrument_id WITH =, jurisdiction WITH =, valid_during WITH &&)
);

CREATE TABLE classification_reviews (      -- one legal review, its trigger and its sign-off
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  instrument_id        UUID NOT NULL REFERENCES instruments (id),
  listing_review_id    UUID REFERENCES listing_reviews (id),  -- when part of a listing
  trigger              TEXT NOT NULL CHECK (trigger IN ('new_listing', 'periodic',
                         'issuer_event', 'new_token_sale', 'court_ruling', 'agency_action',
                         'statute', 'governance_change')),
  trigger_ref          TEXT,                  -- the release, ruling or announcement
  facts                JSONB NOT NULL,        -- function, rights, issuer sales, promises found
  memo_ref             TEXT NOT NULL,         -- the dated memo, kept with the record
  status               TEXT NOT NULL CHECK (status IN ('open', 'decided', 'superseded',
                         'withdrawn')),
  decided_by           UUID,
  decided_at           TIMESTAMPTZ,
  CHECK (status <> 'decided' OR (decided_by IS NOT NULL AND decided_at IS NOT NULL))
);

ALTER TABLE asset_classifications
  ADD FOREIGN KEY (review_id) REFERENCES classification_reviews (id);
```

When the law moves, the platform finds what to re-review with one query. The day the 2026 release took effect, this listed every US-classified asset still resting on a court opinion or a counsel view alone:

```sql
SELECT i.symbol, c.category, c.investment_contract, c.authority
FROM asset_classifications c
JOIN instruments i ON i.id = c.instrument_id
WHERE c.jurisdiction = 'US'
  AND c.valid_during @> now()
  AND c.authority_status IN ('court_opinion', 'counsel_view', 'proposal')
  AND i.status IN ('active', 'close_only');
```

Design notes:

- **Gate products on classification and entity together.** An order in an instrument whose current classification is `digital_security` routes only to an entity whose `kind` is in `permitted_entity_kinds` and that holds the registrations in [How to Build It](/books/investing-and-digital-assets/regulators-and-licenses#how-to-build-it) in Regulators & Licenses; a crypto entity can't take it, whatever the app shows.
- **Proposals are not authority for a launch.** `authority_status = 'proposal'` can inform a review; a product gate should refuse to enable on it alone ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **History is the defense.** Classifications are never updated in place; a new review closes the old range and opens a new one, so a regulator's or plaintiff's question about what the platform believed on a date has one answer ([Amend, Don't Overwrite](/docs/building-blocks/audit-trails#amend-don-t-overwrite)).
- **Issuer events are inputs.** Abandonment and fulfillment are public communications; route issuer announcements for listed assets into `classification_reviews` as triggers rather than leaving them to someone's inbox.

## Auditing

- **Every listed asset's classification on any date,** with the review, the memo and the authority, per jurisdiction.
- **The trigger that opened each review** and how long it took to decide, especially after court rulings and agency releases.
- **Orders and listings against classifications:** no order in a `digital_security` was taken by an entity not permitted for it, and no asset was listed with an `undetermined` classification.
- **Issuer sales through the platform** for every listed token, matched to the classification's assumption about who sells.

## What This Means for the System You Build

- **Treat "is it a security" as a dated, sourced record,** not a boolean; the answer moved in 2023, 2025 and 2026 and is still moving.
- **Separate the token from the sale:** record investment contract status and its separation evidence apart from the asset's category.
- **Keep proposals and final rules apart** in the data, and never let a proposal enable a product.
- **Route by classification to the right entity,** so a digital security never trades in the money transmitter.
- **Watch the open items:** Regulation Crypto Assets (proposed), the CFTC ANPRM (comments due December 14, 2026) and the stalled CLARITY Act.

## References

**Law and regulation**

- [7 USC 2](https://www.law.cornell.edu/uscode/text/7/2), section 2(c)(2)(D) on retail commodity transactions: non-eligible contract participants, leverage, margin or financing, the 28-day actual delivery exception and treatment as futures
- [SEC and CFTC: Application of the Federal Securities Laws to Certain Types of Crypto Assets and Certain Transactions Involving Crypto Assets (Release Nos. 33-11412, 34-105020; 91 FR 13714, March 23, 2026)](https://www.federalregister.gov/documents/full_text/html/2026/03/23/2026-05635.html), the five categories, the sixteen named digital commodities, attachment and separation, mining, staking, wrapping and airdrops, the supersession of the 2019 framework, the major rule designation and the CFTC's statement
- [SEC: Regulation Crypto Assets, proposed rule (Release Nos. 33-11434, 34-106150; 91 FR 54510, August 21, 2026)](https://www.federalregister.gov/documents/full_text/html/2026/08/21/2026-17183.html), Rules 200, 300 to 307, 103, 104, 400 and 500, the forms and the resale treatment
- [Federal Register: Regulation Crypto Assets document record](https://www.federalregister.gov/api/v1/documents/2026-17183.json), the comment close date of October 20, 2026, the file number and RIN
- [CFTC: Regulation Crypto Asset Transactions and Regulation Crypto Asset Markets, ANPRM (91 FR 64811, October 13, 2026)](https://www.federalregister.gov/api/v1/documents/2026-20888.json), section 2(c)(2)(D), the CFR parts, the docket and the December 14, 2026 comment date
- [Federal Register: CFTC crypto documents](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=crypto&conditions[agencies][]=commodity-futures-trading-commission&order=newest&per_page=15), the December 16, 2025 withdrawal of the 2020 actual delivery guidance and the June 3, 2026 perpetual contracts policy statement

**Courts and enforcement**

- [SEC v. W.J. Howey Co., 328 U.S. 293 (1946)](https://www.law.cornell.edu/supremecourt/text/328/293), the investment contract definition, the facts and the decision date
- [SEC v. Ripple Labs, Inc., No. 20 Civ. 10832 (AT) (S.D.N.Y. July 13, 2023)](https://www.nysd.uscourts.gov/sites/default/files/2023-07/SEC%20vs%20Ripple%207-13-23.pdf), the three categories of sales and their amounts, the lockups, the blind bid/ask reasoning, the 1% share and the token-is-not-a-contract holding
- [SEC: Litigation Release No. 26369 (August 7, 2025)](https://www.sec.gov/enforcement-litigation/litigation-releases/lr-26369), the dismissal of the cross-appeals and the $125,035,150 penalty and injunction left in place
- [SEC: Press Release 2024-73 (June 13, 2024)](https://www.sec.gov/newsroom/press-releases/2024-73), the Terraform and Kwon final judgment, the December 28, 2023 liability ruling and the April 5, 2024 verdict
- [SEC: Press Release 2025-47 (February 27, 2025)](https://www.sec.gov/newsroom/press-releases/2025-47), the Coinbase dismissal, the Crypto Task Force and the not-on-the-merits language

**In practice**

- [FinTech Weekly: What is the CLARITY Act (updated September 26, 2026)](https://www.fintechweekly.com/news/what-is-the-clarity-act-digital-asset-market-structure-explained-2026), secondary: the House vote, the failed cloture vote, the motion to reconsider, the bill's provisions and the sticking points
