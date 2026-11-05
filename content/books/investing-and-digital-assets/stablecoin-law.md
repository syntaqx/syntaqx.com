+++
title = "Stablecoin Law"
description = "The law on issuers: GENIUS Act paths, reserves, capital, redemption and the yield ban, the OCC rule and pending rules, state regimes, MiCA and the UK."
category = "Investing & Digital Assets Industry"
order = 2559
part = "Stablecoins"
tags = ["stablecoins", "genius-act", "occ", "mica", "nydfs", "regulation"]
+++

Until 2025 a US dollar stablecoin was regulated by whichever state licensed its issuer, under money transmission or trust law written for other things, with New York's 2022 guidance as the closest thing to a standard. The GENIUS Act, signed July 18, 2025 (Pub. L. 119-27, codified at 12 U.S.C. chapter 56, sections 5901 to 5916), replaced that with a licensing regime for one product: only a permitted payment stablecoin issuer may issue a payment stablecoin in the United States, and the statute fixes the reserve, the redemption promise, the monthly report, the ban on paying holders and the issuer's place in insolvency. The regulators then had to write the rules. As of November 2026 one has a final rule (the OCC, effective January 18, 2027), the others have proposals, and the Act takes effect on January 18, 2027.

This chapter is the law as it binds an issuer: the paths to a license and what each costs, the reserve, capital and redemption rules with the OCC's numbers, the yield ban and its edges, foreign issuers, insolvency, the state regimes, the EU's MiCA and the UK. The provider's side (which tokens a payment company may offer, its money transmission license, screening and the Travel Rule) is the Payments volume's [The Law in the United States](/books/payments/stablecoins#the-law-in-the-united-states), which also has the agencies' rulemaking table as of October 2026; this chapter brings it forward and goes deeper on the issuer. The operations the rules govern are in [Issuing a Stablecoin](/books/investing-and-digital-assets/issuing-a-stablecoin), and the freeze obligations in [Freezes, Blacklists & Seizures](/books/investing-and-digital-assets/freezes-and-onchain-compliance).

## How the Platforms Do It

Where the main issuers sit in the regimes, as of November 2026, from filings, regulator releases and issuer pages:

| Issuer | US position | EU position | Elsewhere |
| --- | --- | --- | --- |
| **Circle** | NYDFS BitLicense (Circle Internet Financial, LLC); FinCEN MSB and state money transmitter licenses; OCC preliminary conditional approval of First National Digital Currency Bank, N.A. (December 12, 2025) | Circle Internet Financial Europe SAS: French EMI license, issuing USDC and EURC as e-money tokens under MiCA | Singapore MPI, Bermuda DABA, ADGM, UK EMI |
| **Paxos** | Conditional OCC approval to convert to Paxos Trust Company, N.A. (December 12, 2025); NYDFS ordered it in 2023 to stop minting BUSD over its oversight of Binance | Paxos Issuance Europe (Finland) issues USDG under MiCA | Paxos Digital Singapore, an MAS major payment institution, issues USDG |
| **Ripple** | RLUSD issued through an NYDFS limited purpose trust company; Ripple National Trust Bank conditionally approved by the OCC | Not documented publicly | Dubai Financial Services Authority approval |
| **Tether** | USDT not issued under a US regime; USAT issued by Anchorage Digital Bank, N.A., an OCC-chartered bank, since January 27, 2026 | Not documented in the sources cited here | Tether says USDT is "progressing towards GENIUS Act compliance" |
| **Anchorage Digital Bank** | National trust bank, issuer of USAT | n/a | n/a |

The pattern is the statute's: the large US issuers are taking federal charters, because the state path closes at $10 billion outstanding and the federal path covers every state at once.

## Who May Issue

"It shall be unlawful for any person other than a permitted payment stablecoin issuer to issue a payment stablecoin in the United States" (12 U.S.C. 5902(a)); knowingly participating in a violation carries a fine of up to $1,000,000 per violation and up to five years in prison (5902(f)). A permitted issuer is one of three kinds:

| Path | Who | Applies to | Supervised by |
| --- | --- | --- | --- |
| **Subsidiary of an insured depository institution** | A bank's or credit union's subsidiary | The parent's primary federal regulator (OCC, Fed, FDIC or NCUA) | That regulator |
| **Federal qualified issuer** | A nonbank, an uninsured national bank (a national trust bank) or a federal branch of a foreign bank | The OCC | The OCC, "exclusively" (5903(b)) |
| **State qualified issuer** | A state-chartered or state-licensed issuer with $10 billion or less outstanding, under a certified state regime | The state regulator | The state, with federal backup |

The approval process (5904) has deadlines that favor the applicant: the regulator says within 30 days whether an application is substantially complete, decides a complete one within 120 days, and an application it fails to decide in time is "deemed approved." It weighs financial condition and resources to meet the requirements, felony convictions of officers and directors for listed financial and cyber crimes, the competence and integrity of management and principal shareholders, and whether the redemption policy meets the statute. Issuing on an open, public or decentralized network is not a permitted ground for denial. A denial comes with written findings within 30 days and a right to a hearing.

Two restrictions narrow the field. **A public company not predominantly engaged in financial activities** (a large technology or retail company) may issue only with a unanimous vote of the Stablecoin Certification Review Committee that its issuance poses no material risk to the banking system, financial stability or the Deposit Insurance Fund, and subject to limits on using consumer data and on tying (5903(a)(12)). **Officers and directors** convicted of the listed felonies are barred (5903(f)).

What a permitted issuer may do is listed too: issue and redeem, manage and custody the reserve, custody stablecoins and keys, and "other activities that directly support" those, with anything else needing its regulator's authorization (5903(a)(7)). It may not tie its services to other products (5903(a)(8)), may not use government names or suggest a coin is legal tender, government-issued or insured (5903(a)(9), (e)), and a product not issued under the chapter may not be marketed in the US as a payment stablecoin (5903(e)). In return, a permitted issuer's coin is not a security or a commodity under the federal securities and commodities laws, which is why Circle's third-quarter 2026 release says it relies until those amendments take effect on its own conclusion that USDC is not a security.

## The Rules for Issuers

The statute sets the frame and directs each primary federal regulator to write capital, liquidity, reserve diversification, interest rate risk and operational, compliance and IT risk rules "tailored to the business model and risk profile" (5903(a)(4)). The OCC is the only one with a final rule, so its numbers are the first concrete answer.

### Reserves

The statute: identifiable reserves at least one to one, in the short list of currency, Federal Reserve balances, insured demand deposits, Treasuries of 93 days or less, overnight repo and reverse repo backed by Treasuries, government money market funds holding only those, other regulator-approved liquid federal assets and tokenized forms of the same; no pledging or reuse except for margin on permitted investments, standard custody, or repo for redemption liquidity (5903(a)(1), (a)(2)). The OCC final rule, from Mayer Brown's summary:

| Requirement | OCC final rule (12 CFR part 15) | Proposal |
| --- | --- | --- |
| Ratio | One to one at all times, at fair value net of liabilities, no intraday exception | Same |
| On-demand liquidity | At least 5% in qualifying on-demand deposits, share accounts or Federal Reserve balances | 10% |
| Concentration | No more than 40% with one counterparty, excluding US government exposures, qualifying custodial exposures and centrally cleared repo | Proposed with further tests |
| Dropped tests | 30% weekly liquidity, 20-day weighted average maturity, a 50% cap on one institution for daily liquidity, and 0.5% insured deposits for issuers of $25 billion or more (capped at $500 million) | All proposed |
| Stress testing | Required, including significant rate rises, with demonstrated ability to monetize reserves | Added |
| Shortfall | Notify the OCC and stop new issuance until cured (moving tokens between ledgers without increasing net issuance is allowed); after 15 consecutive business days, liquidate reserves and redeem without fees, unless the OCC permits otherwise | Same, without the OCC's discretion |

### Capital and the Operational Backstop

Separately from the reserve, the OCC requires capital computed from GAAP equity less goodwill, other intangibles, deferred tax assets and the equity-funded part of the backstop, with a $5 million floor that is now permanent rather than limited to the de novo period, and an **operational backstop**: highly liquid assets equal to 12 months of total expenses, held apart from the reserve, up to half of it fundable with qualifying subordinated debt. A shortfall is reported within 24 hours; using the backstop in a disruption means notice within 24 hours, a restoration plan within seven days and restoration within 90. The reserve pays holders; the backstop pays the issuer's staff and vendors while it winds down or recovers, so that the reserve is never raided for operating costs.

### Redemption

The statute requires a public redemption policy with "clear and conspicuous procedures for timely redemption," all fees disclosed in plain language and seven days' notice of any change (5903(a)(1)(B)). The OCC's final rule makes "timely" no later than two business days after the issuer receives a redemption request from a customer whose onboarding is complete, complete when the issuer initiates the outgoing transfer or credits the customer's account; requires notice to the OCC within 24 hours when redemption requests for a brand exceed 10% of its outstanding issuance in 24 hours; dropped the proposal's automatic seven-day extension in favor of extensions the OCC may grant, deny or limit on request; and lets an issuer decline a redemption that would violate other law, such as the Bank Secrecy Act or sanctions. "Customer" in the final rule means someone who buys from or redeems directly with the issuer, while a "payment stablecoin holder" is any beneficial owner, so customer notices go to direct relationships only. Issuers must also disclose that their coins are not deposits, not insured by the FDIC or NCUA, not backed by the full faith and credit of the United States, and not legal tender.

### Reports and Certification

Monthly, on the issuer's website: total tokens outstanding and the amount and composition of reserves, with average tenor and geographic custody location per category, examined by a registered public accounting firm, and certified by the CEO and CFO, with criminal penalties for a knowingly false certification (5903(a)(1)(C), (a)(3)). An issuer with more than $50 billion outstanding that isn't already an SEC reporting company publishes audited annual GAAP statements with related-party transactions (5903(a)(10)); the OCC measures the threshold on a consolidated basis and excuses an issuer reflected in a qualifying parent's SEC reports. The OCC adds weekly confidential reports and quarterly financial condition reports, a board certification of the AML and sanctions program within 180 days of approval and annually after, and annual full-scope examinations (every 18 to 24 months for issuers under $1 billion).

### The Yield Ban

"No permitted payment stablecoin issuer or foreign payment stablecoin issuer shall pay the holder of any payment stablecoin any form of interest or yield (whether in cash, tokens, or other consideration) solely in connection with the holding, use, or retention of such payment stablecoin" (5903(a)(11)). The words that matter are *issuer* and *solely*. The OCC implemented the ban for the issuers it supervises and for foreign issuers but did not finalize its proposed rebuttable presumption that an affiliate's or related third party's payments are the issuer's; it adopted no safe harbor, kept anti-evasion authority and said it may write a rule. That leaves exchange and distributor rewards funded by revenue shares, the commercial core of [Distribution Costs](/books/investing-and-digital-assets/stablecoin-business#distribution-costs), outside the OCC's text for now. The CLARITY Act's Senate compromise, released May 1, 2026, would bar rewards "economically or functionally equivalent to the payment of interest on an interest-bearing bank deposit" while allowing activity-based ones. <!-- source-gap: ida-clarity-cloture-law | secondary | the Senate's failed 49-50 cloture vote on the CLARITY Act on September 15, 2026 | closes with: the Senate roll call vote page or the Congressional Record | checked: 2026-11-05 --> Press reports that cloture on the motion to proceed failed 49-50 on September 15, 2026; I could not open the Senate's record of the vote, and the bill is stalled. The rewards question for a platform is in [Stablecoin Interest and the Rewards Debate](/books/investing-and-digital-assets/cash-and-sweeps#stablecoin-interest-and-the-rewards-debate).

### Pending Applications and the Transition

The Act takes effect on the earlier of 18 months after enactment or 120 days after the primary federal regulators issue final rules; no final rules landed early enough to pull it forward, so the date is January 18, 2027 ([The GENIUS Act](/books/payments/stablecoins#the-genius-act)). Existing issuers aren't cut off that day. Under the OCC rule an issuer with a substantially complete application pending on or before January 18, 2027 may request a waiver of the Act's or part 15's requirements for up to 12 months from that date, granted in the public interest or extraordinary circumstances, and the OCC said it generally expects to waive prior approval for existing US issuers with a pending application; a pending application alone does not authorize continued issuance. Distribution has its own later date: from July 18, 2028, a digital asset service provider may not offer or sell a payment stablecoin in the US unless a permitted issuer issued it, or a foreign issuer qualifies under the foreign rules below (5902(b)). Stablecoins from non-permitted issuers also may not be treated as cash or cash equivalents for accounting purposes, used as eligible margin or collateral by certain intermediaries, or used as a wholesale settlement asset between banks (5902(g)).

## Federal Rulemaking Status

The issuer-side rules as of November 5, 2026, from the Federal Register:

| Agency | Action | Citation | Status |
| --- | --- | --- | --- |
| **OCC** | Requirements for national bank subsidiaries, federal qualified issuers and foreign issuers it registers (12 CFR parts 3, 6, 8, 15, 19) | 91 FR 67000, October 23, 2026, docket OCC-2025-0372 | **Final**, effective January 18, 2027 |
| **Treasury (for the Stablecoin Certification Review Committee)** | Forms and procedures for reviewing state certifications | 91 FR 61688, September 30, 2026 | **Interim final rule** |
| **Treasury** | Broad-based principles for "substantially similar" state regimes | 91 FR 16844, April 3, 2026 | Proposed |
| **Treasury** | Issuance, offer and sale under section 3 of the Act | 91 FR 53368, August 18, 2026, docket TREAS-DO-2026-0496 | Proposed; comments closed October 19, 2026 |
| **FDIC** | Applications by subsidiaries of FDIC-supervised institutions; requirements for those issuers | 90 FR 59409, December 19, 2025; 91 FR 18534, April 10, 2026 | Proposed |
| **NCUA** | Investments in and licensing of issuers; requirements for NCUA-supervised issuers | 91 FR 6531, February 12, 2026; 91 FR 28956, May 18, 2026 | Proposed |
| **Federal Reserve** | Board responsibilities and application procedures for state member bank subsidiaries | September 29, 2026 (two proposals) | Proposed |
| **FinCEN and OFAC** | AML/CFT and sanctions compliance programs for permitted issuers (new 31 CFR part 1033) | 91 FR 18582, April 10, 2026, docket FINCEN-2026-0100 | Proposed |
| **FinCEN** | Customer identification program for permitted issuers | 91 FR 37234, June 22, 2026 | Proposed |

The OCC left BSA, AML and sanctions standards, interoperability and multi-jurisdictional issuance for later rulemaking. An issuer supervised by the Fed, the FDIC or the NCUA has no final rule to build against as of this date; the statute's text and the OCC's choices are the best guide to what theirs will say.

## Foreign Issuers

A foreign issuer's coin can be offered in the US through a digital asset service provider only if the issuer has the technological capability to comply, and complies, with lawful orders, and either is registered with the OCC under a Treasury comparability determination for its home regime or fits the statute's reciprocity provisions (5902(b)(2), 5916). Under the OCC rule, a registered foreign issuer needs a Treasury comparability finding, OCC registration (deemed approved 30 days after receipt unless rejected), US reserve holdings, and no comprehensive sanctions or primary money laundering concern designation for its jurisdiction. The reserve held in the US has four options: attest that US holders have under 50% of issuance and keep at least 50% of reserves at qualifying US institutions; hold substantially all reserves at US institutions; hold enough at US institutions to meet US redemptions under normal and adverse conditions, with a buffer if needed; or an alternative the OCC approves. A foreign issuer that won't follow lawful orders can be designated noncompliant by Treasury, after which providers may not facilitate secondary trading in its coin (5907), covered in [Freezes, Blacklists & Seizures](/books/investing-and-digital-assets/freezes-and-onchain-compliance).

## Insolvency

If a permitted issuer fails, holders' claims on the required reserves have priority over every other claim, ratably among holders, limited to claims "arising directly from the holding of payment stablecoins" (12 U.S.C. 5910); the Act adds a corresponding priority to the Bankruptcy Code at 11 U.S.C. 507(e). The reserve is the holders' first, which is why the statute bars its reuse and why the OCC's backstop exists to pay everyone else. Circle's planned structure puts a trust bank in the position of collateral trustee holding a first-priority perfected security interest in the USDC reserve for holders, a second layer of the same protection.

## State Regimes

### The State Path and the $10 Billion Line

A state qualified issuer with consolidated outstanding issuance of $10 billion or less may be regulated under a state regime that Treasury's principles find "substantially similar" to the federal one (5903(c)(1)). Each state regulator submits an initial certification to the Stablecoin Certification Review Committee within one year of the effective date, and recertifies annually; the committee acts within 30 days and approves only unanimously; a denied state gets at least 180 days to cure and can appeal to the D.C. Circuit (5903(c)(4), (c)(5)). Above $10 billion, an issuer has 360 days to move under federal oversight (jointly with its state regulator) or stop issuing until it is back under the line, unless its federal regulator waives the move (5903(d)); under the OCC rule a nonbank state issuer crossing $10 billion notifies the OCC within five calendar days. The Fed (for banks) and the OCC (for nonbanks) can act against a state issuer in unusual and exigent circumstances after 48 hours' notice to the state (5906(e)).

### New York

New York's June 8, 2022 guidance remains the most detailed state standard and a model the statute followed: reserves whose market value is at least the nominal value of outstanding tokens at the end of each business day; redemption at par no later than two full business days after a compliant order; reserves limited to Treasury bills acquired three months or less from maturity, overnight Treasury reverse repo, government money market funds and deposits, segregated from the issuer's own assets and held for holders' benefit at insured banks or DFS-approved custodians; a monthly CPA examination of management's assertions testing the last business day and at least one random day, public within 30 days; an annual internal controls attestation within 120 days; and DFS's written approval before issuing. New York also shows the enforcement side: NYDFS ordered Paxos to "cease minting Paxos-issued BUSD" over "unresolved issues related to Paxos' oversight of its relationship with Binance," while requiring it to keep redeeming BUSD one to one.

### California

California's Digital Financial Assets Law requires a license (or a pending application or exemption) for digital financial asset business with California residents from July 1, 2026, covers persons who issue a digital financial asset with authority to redeem it for money, and prohibits offering stablecoins to California residents unless the stablecoin meets the law's reserve requirements; the DFPI notes that issuer requirements "depend on the characteristics of the stablecoin." Exchanges licensing under it are the volume's Licensing a Crypto Business chapter.

## The EU: MiCA

The Markets in Crypto-Assets Regulation (Regulation (EU) 2023/1114) sorts stablecoins into two kinds. An **e-money token** (EMT) references one official currency; it may be issued only by a credit institution or an electronic money institution, is deemed electronic money, must be issued at par and redeemable at any time at par without a fee, and neither issuer nor CASP may pay interest on it ([The EU and the UK](/books/payments/stablecoins#the-eu-and-the-uk)). An **asset-referenced token** (ART) references anything else: a basket of currencies, a commodity, other crypto-assets.

For an EMT issuer the reserve rules come from MiCA and the E-Money Directive together:

- **Funds received are safeguarded and invested,** at least 30% "in separate accounts in credit institutions" and the rest in "secure, low-risk assets" that are highly liquid financial instruments, in the token's own currency (Article 54).
- **A significant EMT** (one the EBA classifies as significant by size and use) brings ART-style rules to an EMI issuer: the reserve, custody and investment rules of Articles 36 to 38 and parts of Article 45 apply instead of the E-Money Directive's safeguarding article, with higher own funds, and an independent audit of the reserve every six months (Article 58(1), (2)).
- **An EMT in a non-EU currency is capped as a means of exchange.** Article 58(3) applies Articles 22, 23 and 24(3) to EMTs denominated in a currency that is not an official currency of a Member State. Under Article 23, when the quarterly average of transactions a day used as a means of exchange within a single currency area exceeds 1 million transactions and EUR 200,000,000, the issuer must stop issuing and within 40 working days submit a plan to keep usage below both thresholds; issuance resumes only when the authority has evidence usage is below them. For a dollar EMT such as USDC issued in the EU, this is the clause that limits it to something other than a euro-area payment instrument at scale.

Circle issues USDC and EURC in the EEA through its French EMI, and Paxos issues USDG through its Finnish entity; CASP transitional periods ended July 1, 2026, so an EU exchange offering the public a stablecoin whose issuer isn't authorized is out of compliance. Licensing a CASP is the volume's Beyond the US chapter.

## The UK

The UK regime under the Financial Services and Markets Act 2000 (Cryptoassets) Regulations 2026 starts on October 25, 2027, with applications from September 30, 2026 to February 28, 2027. For issuers, the FCA's PS26/10 confirms a statutory trust over backing assets for holders, removes unallocated backing fund accounts, simplifies the composition rules so issuers need not forecast redemptions, permits up to a 5% excess in the backing asset pool and limited intragroup custody, and puts safeguarding of backing assets in CASS 16 rather than CASS 7. The FCA reduced the K-SII capital coefficient from 2% to 1% in its prudential rules. Redemption timing and the Bank of England's role for systemic sterling coins are in the Payments volume's [The EU and the UK](/books/payments/stablecoins#the-eu-and-the-uk).

## How to Build It

These extend [the core data model](/books/investing-and-digital-assets/investing-business#the-core-data-model) and [Issuing a Stablecoin](/books/investing-and-digital-assets/issuing-a-stablecoin#how-to-build-it). An issuer under several regimes needs each regime's numbers as data, not code, because the OCC's final rule changed four of them from the proposal and three more agencies haven't written theirs ([Rules as Data](/docs/building-blocks/rules-as-data)).

```sql
CREATE TABLE issuer_regimes (                -- one row per entity per regime, versioned
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  instrument_id        UUID NOT NULL REFERENCES instruments (id),   -- the coin
  regime               TEXT NOT NULL CHECK (regime IN ('genius_occ', 'genius_fed',
                         'genius_fdic', 'genius_ncua', 'genius_state', 'genius_foreign',
                         'nydfs', 'ca_dfal', 'mica_emt', 'mica_art', 'uk_fca', 'other')),
  status               TEXT NOT NULL CHECK (status IN ('applied', 'pending_waiver',
                         'approved', 'conditional', 'registered', 'denied', 'withdrawn')),
  parameters           JSONB NOT NULL,        -- reserve floors and caps, redemption days,
                                              -- notice thresholds, report cadence, audit trigger
  rule_ref             TEXT NOT NULL,         -- '12 CFR part 15', 'NYDFS 2022 guidance', ...
  valid_during         DATERANGE NOT NULL,
  UNIQUE (legal_entity_id, instrument_id, regime, valid_during)
);

CREATE TABLE redemption_policies (           -- the published policy, every version
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  instrument_id        UUID NOT NULL REFERENCES instruments (id),
  version              INT NOT NULL CHECK (version > 0),
  policy_text_ref      TEXT NOT NULL,         -- the page as published
  timely_business_days SMALLINT NOT NULL,     -- 2 under the OCC rule and NYDFS
  fees                 JSONB NOT NULL,        -- plain-language fee table
  minimum_amount       BIGINT,                -- minor units; null for none
  published_at         TIMESTAMPTZ NOT NULL,
  effective_at         TIMESTAMPTZ NOT NULL,
  CHECK (effective_at >= published_at),
  UNIQUE (legal_entity_id, instrument_id, version)
);

CREATE TABLE reserve_reports (               -- the monthly report, its exam and certification
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id      UUID NOT NULL REFERENCES legal_entities (id),
  instrument_id        UUID NOT NULL REFERENCES instruments (id),
  issuer_regime_id     UUID NOT NULL REFERENCES issuer_regimes (id),
  as_of                DATE NOT NULL,         -- month end, or a random day under NYDFS
  outstanding          NUMERIC(78, 0) NOT NULL,
  composition          JSONB NOT NULL,        -- per category: amount, average tenor, custody location
  reserve_total        BIGINT NOT NULL,
  generated_from       TEXT NOT NULL,         -- the reserve_holdings query and its run id
  published_at         TIMESTAMPTZ,
  examiner             TEXT,                  -- the registered public accounting firm
  examination_ref      TEXT,
  examined_at          TIMESTAMPTZ,
  ceo_certified_at     TIMESTAMPTZ,
  cfo_certified_at     TIMESTAMPTZ,
  UNIQUE (legal_entity_id, instrument_id, issuer_regime_id, as_of)
);
ALTER TABLE redemption_requests ADD FOREIGN KEY (redemption_policy_id)
  REFERENCES redemption_policies (id);
```

Design notes:

- **Seven days is a constraint.** A fee change is a new `redemption_policies` version whose `effective_at` is at least seven days after `published_at`; enforce it in the write path, and keep every version so any redemption can show the policy that governed it.
- **One report, many regimes.** The same reserve query feeds the GENIUS monthly report, an NYDFS random-day examination and a MiCA significant-EMT audit; each regime's parameters (what to include, how to group, when it's due) come from `issuer_regimes`.
- **Thresholds are monitors.** The 10% daily redemption notice, the 5% on-demand floor, the 40% counterparty cap, the $10 billion state line and the $50 billion audit trigger are each a scheduled check over `reserve_holdings`, `redemption_requests` and outstanding supply, opening a `cases` row with the notice deadline when crossed.
- **Certifications are records.** The monthly CEO and CFO certification carries criminal penalties; store who certified which report version, when, and what they were shown ([Audit Trails](/docs/building-blocks/audit-trails)).

## Auditing

- **Each regime's status and parameters over time,** with the rule text each parameter came from, so an examiner sees which version of a requirement applied on a given day.
- **Every monthly report** with its source query, the accountant's examination and both officers' certifications.
- **Every redemption policy version,** its publication and the notice period before it took effect.
- **Threshold breaches and notices:** each day redemptions exceeded 10% of outstanding, each time a reserve test failed, and the notice sent with its time.
- **Applications, waivers and conditions:** the application file, the completeness and decision dates, conditions of approval and evidence each was met.

## What This Means for the System You Build

- **Pick the path by size and reach.** The state path ends at $10 billion; the federal path is one supervisor for every state, which is why the largest issuers are chartering.
- **Build to the OCC's final numbers** and keep them as data: one to one at all times, 5% on demand, 40% per counterparty, stress tests, a 12-month operational backstop, two-business-day redemption and the 10% notice.
- **The yield ban binds the issuer.** Distributor rewards sit in a gap the OCC left open and Congress hasn't closed; design them to survive being regulated.
- **Report and certify from records.** A monthly report an officer signs under criminal penalty should be the output of a query anyone can rerun.
- **Plan for January 18, 2027 and July 18, 2028:** the Act's effective date (with waivers for pending applications) and the date providers must stop offering non-permitted coins.
- **In the EU, a dollar coin is capped as a payment instrument,** and an issuer must count transactions per currency area to know where it stands.

## References

**Law and regulation**

- [12 U.S.C. chapter 56: Regulation of payment stablecoins](https://www.law.cornell.edu/uscode/text/12/chapter-56), the sections of the GENIUS Act as codified
- [12 U.S.C. 5902: Issuance and treatment of payment stablecoins](https://www.law.cornell.edu/uscode/text/12/5902), the issuance prohibition and penalties, the three-year rule for digital asset service providers, foreign issuers, safe harbors and treatment of non-permitted coins
- [12 U.S.C. 5903: Requirements for issuing payment stablecoins](https://www.law.cornell.edu/uscode/text/12/5903), reserves, rehypothecation, redemption policy, monthly reports and certification, permitted activities, tying, names and marketing, audited statements, the yield ban, public companies, the state option and $10 billion transition, and OCC supervision
- [12 U.S.C. 5904: Approval of subsidiaries and federal qualified issuers](https://www.law.cornell.edu/uscode/text/12/5904), who applies where, the 30- and 120-day deadlines, deemed approval, factors and denial procedures
- [12 U.S.C. 5906: State qualified payment stablecoin issuers](https://www.law.cornell.edu/uscode/text/12/5906), state authority and federal backup enforcement after 48 hours' notice
- [12 U.S.C. 5907: Anti-money laundering protections](https://www.law.cornell.edu/uscode/text/12/5907), noncompliant foreign issuers and the bar on facilitating secondary trading
- [12 U.S.C. 5910: Treatment of payment stablecoin issuers in insolvency proceedings](https://www.law.cornell.edu/uscode/text/12/5910), holders' ratable priority on required reserves and 11 U.S.C. 507(e)
- [OCC: Implementing the GENIUS Act (91 FR 67000, October 23, 2026)](https://www.federalregister.gov/api/v1/documents/2026-21706.json), citation, docket, CFR parts, RIN and effective date
- [Federal Register: payment stablecoin documents, newest first](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=payment%20stablecoin&order=newest&per_page=25), the OCC final rule, the SCRC interim final rule, the Federal Reserve proposals and other actions as of November 5, 2026
- [Treasury: GENIUS Act regulations on issuance, offer and sale (91 FR 53368, August 18, 2026)](https://www.federalregister.gov/api/v1/documents/2026-16796.json), the section 3 proposal, docket and comment dates
- [Regulation (EU) 2023/1114 (MiCA), Article 23](https://www.springlex.eu/en/packages/mica/mica-regulation/article-23/), the 1 million transactions and EUR 200 million daily thresholds and the issuer's plan
- [MiCA, Article 54](https://www.springlex.eu/en/packages/mica/mica-regulation/article-54/), investment of funds received for e-money tokens and the 30% deposit requirement
- [MiCA, Article 58](https://www.springlex.eu/en/packages/mica/mica-regulation/article-58/), obligations for issuers of significant EMTs, the six-monthly audit, and Articles 22, 23 and 24(3) for EMTs in non-EU currencies

**Regulators and guidance**

- [Mayer Brown: OCC finalizes GENIUS Act rulemaking](https://www.mayerbrown.com/en/insights/publications/2026/11/occ-finalizes-genius-act-rulemaking), the final rule's capital, backstop, reserve, shortfall, redemption, yield, customer, foreign issuer, reporting, examination, state transition and waiver provisions and the matters left for later
- [OCC: Conditional approvals for five national trust banks (December 12, 2025)](https://www.occ.gov/news-issuances/news-releases/2025/nr-occ-2025-125.html), Circle's and Ripple's de novo trust banks and the Paxos, BitGo and Fidelity Digital Assets conversions
- [NYDFS: Guidance on the issuance of US dollar-backed stablecoins (June 8, 2022)](https://www.dfs.ny.gov/industry_guidance/industry_letters/il20220608_issuance_stablecoins), backing at each business day's end, T+2 redemption, reserve assets, custody, monthly and random-day examinations and prior approval
- [NYDFS: Paxos and Binance consumer alert](https://www.dfs.ny.gov/consumers/alerts/Paxos_and_Binance), the order to cease minting BUSD and continued redemption
- [California DFPI: Digital Financial Assets Law FAQ](https://dfpi.ca.gov/regulated-industries/digital-financial-assets/digital-financial-assets-law-frequently-asked-questions/), licensing from July 1, 2026, issuers in scope and the stablecoin reserve condition
- [FCA: Cryptoasset regime policy statements](https://www.fca.org.uk/publications/policy-statements/cryptoasset-regime), PS26/10's statutory trust, 5% excess and CASS 16, the K-SII change, the application window and October 25, 2027
- [Baker McKenzie: The CLARITY Act's yield compromise](https://blockchain.bakermckenzie.com/2026/05/05/the-clarity-acts-yield-compromise-what-the-senate-actually-agreed-to-and-why-it-matters/), the May 1, 2026 rewards language
- [FinTech Weekly: What is the CLARITY Act (updated September 26, 2026)](https://www.fintechweekly.com/news/what-is-the-clarity-act-digital-asset-market-structure-explained-2026), the House vote and the failed September 15, 2026 cloture vote

**Filings**

- [Circle Internet Group: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1876042/000187604226000062/crcl-20251231.htm), Circle's licenses and entities, the national trust bank application and collateral trustee plan
- [Circle Internet Group: Third quarter 2026 results (November 4, 2026)](https://www.sec.gov/Archives/edgar/data/1876042/000187604226000309/finalq3epr-110326.htm), the GENIUS Act's exclusion of permitted issuers' coins from the securities laws and Circle's reliance until it takes effect

**Vendor documentation**

- [Global Dollar Network](https://www.globaldollar.com/), USDG's Singapore and Finnish issuing entities
- [Ripple: RLUSD](https://ripple.com/solutions/stablecoin/), the NYDFS limited purpose trust company and DFSA approval

**In practice**

- [Decrypt: Tether launches USAT issued by Anchorage Digital (January 27, 2026)](https://decrypt.co/356045/tether-launches-us-regulated-stablecoin-issued-anchorage-digital), Anchorage as issuer and Tether's statement on USDT
