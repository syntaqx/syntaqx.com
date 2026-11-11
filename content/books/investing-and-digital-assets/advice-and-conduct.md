+++
title = "Advice, Reg BI & Conduct"
description = "Broker versus adviser, Reg BI's four obligations, Form CRS, the Advisers Act fiduciary duty, Form ADV, the marketing rule, FINRA 2210 and advice in an app."
category = "Investing & Digital Assets Industry"
order = 2530
part = "Wealth and Advice"
tags = ["investing", "reg-bi", "fiduciary", "form-crs", "form-adv", "marketing-rule", "finra", "advice"]
+++

The moment an app tells a customer what to buy, the firm behind it takes on a duty it didn't have when the customer chose alone. A self-directed trade in a brokerage account is the customer's decision; the broker owes best execution and honest disclosure, and little about whether the trade was wise. A recommendation changes that: a broker-dealer recommending a security, a strategy or an account to a retail customer must act in that customer's best interest under Regulation Best Interest, and an investment adviser managing or advising on a portfolio owes a fiduciary duty under the Investment Advisers Act of 1940 for the whole relationship. Which duty applies depends on which regulated entity is speaking, in what capacity, and whether what it said was a recommendation at all, and an app that blurs those three lines is how firms end up in enforcement orders.

The software consequences are concrete. A recommendation is a record, with the profile it was made against, the alternatives considered, the costs compared and the disclosure delivered before it. A communication to customers is a record that a principal approved before it ran, unless it is a type the rules exempt. An adviser's brochure and relationship summary are versioned documents with delivery clocks. A firm that sells both brokerage and advice has to know, for every screen, push notification and chat reply, which hat it was wearing.

This chapter covers that layer as of November 2026: brokers and advisers and what separates them, Regulation Best Interest and its four obligations, Form CRS, the Advisers Act fiduciary duty and the SEC's 2019 interpretation, Form ADV, the adviser marketing rule, FINRA Rule 2210 for broker communications and FINRA 2111 where Reg BI doesn't reach, the SEC's digital engagement practices proposal and its withdrawal, finfluencers, and how to build recommendations in an app. Which entity needs which registration is in [Which Registration Each Activity Needs](/books/investing-and-digital-assets/regulators-and-licenses#which-registration-each-activity-needs); the investment profile the duties rely on is in [The Investment Profile](/books/investing-and-digital-assets/opening-accounts#the-investment-profile); message capture and supervision tooling for broker-dealer communications is in Workplace & Collaboration's [Regulated Communications](/books/workplace-and-collaboration/regulated-communications#the-us-recordkeeping-rules).

## How the Platforms Do It

How firms present advice, as of November 2026:

| Firm | Entities that advise or recommend | How advice reaches the customer | What stands out |
| --- | --- | --- | --- |
| **Betterment** | Betterment LLC, an SEC-registered adviser; brokerage through Betterment Securities, which routes to Apex for clearing and execution | Questionnaire inputs to a recommended "Allocation"; discretionary management in a wrap fee program; Premium adds human financial consultants | Form ADV Part 2A dated October 27, 2026 discloses that Apex shares order flow payments with Betterment Securities, "a conflict of interest because such payments are proportional to the volume of trading" |
| **Robinhood** | Robinhood Financial and Robinhood Securities (broker-dealers); Robinhood Asset Management and Robinhood Ventures (SEC-registered advisers) | Self-directed trading by default; Robinhood Strategies as expert-managed portfolios with a management fee | One app, several entities: the same customer sees brokerage screens and an advisory product, each under its own duty |
| **Schwab** | Charles Schwab & Co. (broker-dealer and adviser) and affiliated advisers | Self-directed brokerage, robo portfolios and advised programs | The Schwab Intelligent Portfolios order shows what an adviser's disclosure has to say about its own conflicts |
| **Vanguard** | Vanguard advice entities, through Vanguard Digital Advisor and personal advisors | An automated advice program with a gross advisory fee of 0.20% for index portfolios before Vanguard's revenue credit | Fee caps stated per $10,000 invested |

The pattern: **the adviser and the broker-dealer are separate legal entities, or one dual registrant acting in two capacities,** and the product line decides which one is talking. Where an app mixes self-directed trading with managed portfolios, the seams are the account types and the screens that sell them.

## Broker or Adviser

Two regimes, built for two businesses:

| | Broker-dealer | Investment adviser |
| --- | --- | --- |
| **Statute** | Securities Exchange Act of 1934 | Investment Advisers Act of 1940 |
| **Regulator** | SEC and FINRA | SEC at $100 million or more of assets under management, the home state below ([Regulators & Licenses](/books/investing-and-digital-assets/regulators-and-licenses#which-registration-each-activity-needs)) |
| **Paid for** | Transactions: commissions, spreads, payment for order flow | Advice: an asset-based, flat or hourly fee |
| **Standard on advice** | Regulation Best Interest, at the time of each recommendation | Fiduciary duty of care and loyalty, for the whole relationship |
| **Ongoing monitoring** | Only if agreed | As the scope of the relationship requires |
| **Relationship summary** | Form CRS (Rule 17a-14) | Form CRS (Form ADV Part 3, Rule 204-5) |
| **Disclosure document** | Reg BI disclosure, confirmations, statements | Form ADV Part 2A brochure and 2B supplements |
| **Communications rule** | FINRA Rule 2210 | Marketing rule, Rule 206(4)-1 |

A **dual registrant** is registered as both and must say in which capacity it acts; a robo-adviser is an adviser that happens to deliver advice through software. The broker-dealer exclusion from the Advisers Act covers advice that is "solely incidental" to brokerage and paid for by transactions; the SEC issued an interpretation of that prong with Reg BI in June 2019. Charge an asset-based fee for advice and the firm is an adviser for that account, whatever the app calls it.

## Regulation Best Interest

Broker-dealers have had to comply with Rule 15l-1 since June 30, 2020; the SEC adopted it June 5, 2019 to "enhance the broker-dealer standard of conduct beyond existing suitability obligations." Its core sentence: a broker-dealer recommending "any securities transaction or investment strategy involving securities (including account recommendations)" to a **retail customer** "shall act in the best interest of the retail customer at the time the recommendation is made," without placing its own financial or other interest ahead of the customer's. A retail customer is a natural person, or a legal representative, who receives the recommendation and uses it "primarily for personal, family, or household purposes."

The general obligation is met by four component obligations (15l-1(a)(2)):

| Obligation | What it requires | What the system must hold |
| --- | --- | --- |
| **Disclosure** | Before or at the recommendation, "full and fair disclosure" in writing of the capacity the firm acts in, material fees and costs, the type and scope of services (including limits on what may be recommended), and material conflicts | The disclosure version delivered to this customer, and when |
| **Care** | Understand the risks, rewards and costs of the recommendation, with a reasonable basis that it suits at least some customers; a reasonable basis that it is in this customer's best interest given their investment profile; a reasonable basis that a series of recommendations is not excessive | The profile the recommendation used, the alternatives considered, the cost comparison, and for a series, the turnover and cost history |
| **Conflict of interest** | Written policies to identify and disclose or eliminate conflicts; to identify and mitigate conflicts that give the associated person an incentive to favor the firm; to disclose material limits on recommendable products and prevent them from driving recommendations; and to "identify and eliminate any sales contests, sales quotas, bonuses, and non-cash compensation that are based on the sales of specific securities or specific types of securities within a limited period of time" | The conflict inventory, its mitigations, and the compensation plans that were reviewed against the last item |
| **Compliance** | Written policies and procedures reasonably designed to achieve compliance with Reg BI as a whole | Tests, reviews and exceptions, dated |

The investment profile Reg BI relies on includes "age, other investments, financial situation and needs, tax status, investment objectives, investment experience, investment time horizon, liquidity needs, risk tolerance" and anything else the customer discloses, which is why [Opening Accounts](/books/investing-and-digital-assets/opening-accounts#the-investment-profile) keeps it versioned. Two engineering points follow from the text:

- **Account type is a recommendation.** "Including account recommendations" puts a recommendation to open an IRA, move to a managed program or roll a 401(k) over inside Reg BI, so an onboarding flow that steers a customer toward one account type is making one.
- **The obligation attaches at the time of the recommendation.** The record has to show what was known then, which means the profile version, the product's cost data and the disclosure, as of the timestamp, not as of today.

**Worked numbers: a rollover recommendation.** My illustration of the cost comparison the care obligation asks for. A customer has $200,000 in a 401(k) invested in index funds at an all-in cost of 0.05%, and is recommended to roll it into an advisory IRA at a 1.00% advisory fee over funds costing 0.10%:

| | Stay in the plan | Advisory IRA |
| --- | ---: | ---: |
| Annual cost on $200,000 | $100 | $2,200 |
| Ten years at a flat balance | $1,000 | $22,000 |

A $2,100 annual difference doesn't make the rollover wrong (the customer may want planning, wider investment choice or consolidation), but a reasonable basis for it has to name what the extra $2,100 a year buys, and the record must hold the plan's costs as the firm found them. Form CRS must be delivered again when a rollover is recommended (Rules 17a-14(c)(2) and 204-5(b)(2)), and the mechanics of the rollover itself are in [IRAs & Retirement Accounts](/books/investing-and-digital-assets/retirement-accounts#rollovers-and-the-60-day-rule).

**FINRA 2111 where Reg BI doesn't reach.** FINRA's suitability rule still applies to recommendations Reg BI doesn't cover; Supplementary Material .08 says it "shall not apply to recommendations subject to SEA Rule 15l-1." It keeps the same three-part structure (reasonable-basis, customer-specific and quantitative suitability) for customers who aren't retail customers, such as entities, with an institutional exemption where the customer "is exercising independent judgment."

## Form CRS

The relationship summary is a short document every broker-dealer and adviser serving retail investors must prepare, file and deliver. Its form instructions limit it to two pages in paper format, four for a dual registrant that combines both services, with prescribed items in order: Introduction, Relationships and Services, Fees, Costs, Conflicts and Standard of Conduct, Disciplinary History, and Additional Information, Items 2 through 5 each with required "conversation starters" (questions a customer can ask) set off with text features. An adviser must include, with emphasis, "When we act as your investment adviser, we have to act in your best interest and not put our interest ahead of yours. At the same time, the way we make money creates some conflicts with your interests."

The clocks, from the two delivery rules:

| Event | Broker-dealer (17a-14) | Adviser (204-5) |
| --- | --- | --- |
| **Initial delivery** | Before or at the earliest of a recommendation, placing an order, or opening a brokerage account | Before or at entering into the advisory contract |
| **Existing customers** | Before or at opening a new, different account, recommending a rollover, or recommending or providing a new service or investment | The same three events |
| **Amendment** | Within 30 days whenever any information becomes materially inaccurate (form instructions), filed with an exhibit highlighting the changes | Same |
| **Telling customers about the change** | Within 60 days after the amendment is required, by delivering the amended form or another disclosure | Same |
| **On request** | Within 30 days | Within 30 days |
| **Website** | Posted prominently, if the firm has one | Same |

A broker-dealer files it through Web CRD; an adviser files it as Part 3 of Form ADV. In software, Form CRS is a `disclosures` row of kind `form_crs` with a template version, and the triggering events are the same ones that create accounts and recommendations, so the delivery check belongs in those code paths, not in a nightly job.

## The Adviser's Fiduciary Duty

The Advisers Act has no single "fiduciary" section; the duty comes from Section 206's antifraud provisions as the Supreme Court read them in *SEC v. Capital Gains Research Bureau, Inc.*, 375 U.S. 180 (1963), and the SEC consolidated its view in a 2019 interpretation (Release IA-5248, 84 FR 33669, July 12, 2019). The duty "comprises a duty of care and a duty of loyalty," it "follows the contours of the relationship" the adviser and client agree to, and it can be shaped by that agreement but not waived: "an adviser's federal fiduciary duty may not be waived."

- **Care.** Advice in the client's best interest, which requires a "reasonable inquiry into the client's financial situation"; seeking best execution where the adviser selects brokers; and monitoring "at a frequency that is in the best interest of the client" given the agreed scope.
- **Loyalty.** The adviser must "not subordinate its clients' interests to its own," which means full and fair disclosure of all material facts about the relationship and conflicts, so the client can give informed consent. Saying the adviser "may" have a conflict when it does have one isn't disclosure, and disclosure and consent don't by themselves satisfy the duty to act in the client's best interest.

The interpretation addresses automated advisers, rollover advice and account type advice directly, so a robo-adviser owes the same duty as a human one, scaled to the scope it promises. Section 206(3) adds a mechanical rule worth building in: an adviser acting as principal for its own account may not sell to or buy from a client "without disclosing to such client in writing before the completion of such transaction the capacity in which he is acting" and obtaining the client's consent, so a managed account that fills fractional shares from an affiliated broker's inventory has a consent question to answer ([How Brokers Create Fractions](/books/investing-and-digital-assets/fractional-and-recurring#how-brokers-create-fractions)).

The Schwab Intelligent Portfolios order is the duty's clearest software lesson. From March 2015 to November 2018 Schwab's robo-adviser held 6% to 29.4% cash in its model portfolios, pre-set so its affiliated bank would earn a minimum spread, while the Form ADV described a "potential conflict of interest" and a "disciplined portfolio construction methodology"; the SEC found "an actual, not just potential, conflict." The mechanics and the money are in [Robo-Advisors & Model Portfolios](/books/investing-and-digital-assets/robo-advisors#cash-drag-and-the-schwab-order).

## Form ADV

Form ADV is the adviser's registration and its public disclosure, in three parts: Part 1 (registration data), Part 2A (the brochure, in plain English: services, fees, conflicts, brokerage practices, custody, discretion) and 2B (a supplement for each supervised person who advises the client), and Part 3 (Form CRS). The clocks:

- **Annual updating amendment** within 90 days of the end of the adviser's fiscal year (Rule 204-1(a)(1)), and other amendments as the form's instructions require.
- **Brochure delivery** "before or at the time you enter into an investment advisory contract" (Rule 204-3(b)(1)); each year, within 120 days of fiscal year-end, a summary of material changes with an offer of the brochure, or the brochure itself, if anything material changed (204-3(b)(2)).
- **Supplements** before or when the supervised person begins advising the client, capped at the five people with the most day-to-day responsibility on a larger team (204-3(b)(3)).
- **Disciplinary amendments** delivered promptly (204-3(b)(4)).

Several Part 2A items are system requirements in disguise. Item 5 requires the adviser to say whether it deducts fees from client assets or bills them, how often, whether fees are paid in advance and how a prepaid fee is refunded on termination; billing that differs from those words is a deficiency, as [RIA Custodians & Advisor Platforms](/books/investing-and-digital-assets/advisor-platforms#billing-advisory-fees) shows with numbers. Item 12 asks whether and how the adviser aggregates client orders, Item 15 about custody, and Item 18 requires an audited balance sheet from an adviser that requires or solicits "prepayment of more than $1,200 in fees per client, six months or more in advance."

**Internet advisers.** An adviser below the SEC's assets threshold may register with the SEC anyway if it advises all clients "exclusively through an operational interactive website," a website, app or similar platform giving software-generated advice from each client's own inputs, with only de minimis outages (Rule 203A-2(e), amended by Release IA-6578, 89 FR 24693, effective July 8, 2024). The text admits no exception for clients advised another way, so a robo-adviser registered on this basis that adds human advisers for some clients has to reconsider its registration.

## The Marketing Rule

An adviser's advertisements, "any direct or indirect communication an investment adviser makes to more than one person" offering advisory services (with exclusions such as extemporaneous live oral communications), are governed by Rule 206(4)-1. Seven general prohibitions apply to all of them: no untrue statements of material fact or misleading omissions, no material claims the adviser can't substantiate "upon demand by the Commission," no misleading implications, benefits only with fair and balanced treatment of material risks, specific advice and performance presented fairly, and nothing otherwise materially misleading. Then the specific rules:

- **Testimonials and endorsements** need clear and prominent disclosure (client or not, paid or not, material conflicts), oversight and a written agreement, and can't be paid to an ineligible (disqualified) person; promoters paid $1,000 or less in the preceding 12 months are exempt from the agreement and disqualification conditions. A paid finfluencer recommending a robo-adviser is a compensated endorsement.
- **Third-party ratings** need a reasonable belief that the survey made favorable and unfavorable answers "equally easy," plus the rating's date, period, source and any compensation.
- **Performance.** Gross performance must come with net performance "with at least equal prominence," over the same period and method; portfolio or composite performance shows one-, five- and ten-year periods ending no earlier than the most recent calendar year-end; nothing may imply the SEC approved or reviewed it; extracted performance must offer the total portfolio's; **hypothetical performance** (model, backtested, targeted or projected results "not actually achieved by any portfolio of the investment adviser") needs policies ensuring it's relevant to the audience's financial situation, with its criteria, assumptions, risks and limitations explained.

The last item governs most robo-adviser and direct indexing marketing: a "tax alpha" figure from a simulation is hypothetical performance, and a figure computed from actual client accounts is performance that needs its net counterpart. The calculations themselves are in [Portfolio Accounting & Performance](/books/investing-and-digital-assets/portfolio-accounting#fees-in-performance).

## FINRA Rule 2210 for Broker Communications

A broker-dealer's communications sort into three classes by audience (Rule 2210(a)):

| Class | Definition | Approval | Filing |
| --- | --- | --- | --- |
| **Retail communication** | Distributed or made available to "more than 25 retail investors within any 30 calendar-day period" | A principal approves each "before the earlier of its use or filing," with exceptions (a filed communication used unchanged, some posts that make no recommendation) | New members file certain retail communications 10 business days before first use in their first year; communications promoting a specific registered fund within 10 business days of first use |
| **Correspondence** | To 25 or fewer retail investors within any 30 calendar-day period | Supervised and reviewed under the firm's procedures | None |
| **Institutional communication** | Only to institutional investors | Supervised under written procedures | None |

The content standards apply to all three: communications "must be fair and balanced," may not make "any false, exaggerated, unwarranted, promissory or misleading statement or claim," and "may not predict or project performance" or imply past performance will recur, with narrow exceptions for hypothetical illustrations and some targeted-return communications. Records of retail and institutional communications are kept under Rule 17a-4(b) with first and last use dates and the approving principal.

In an app, the 25-in-30-days line means almost everything is a retail communication: a push notification template, a carousel card, an email campaign and a help article are each sent to thousands. The engineering answer is a content registry: every template that can reach customers has an approval record and a version before it can be sent, and each send names the version.

## Digital Engagement Practices and the Withdrawn Proposal

After January 2021 the SEC asked how brokers and advisers use "behavioral prompts, differential marketing, game-like features" (commonly called gamification) on retail platforms (request for information, Release 34-92766, IA-5833, 86 FR 49067, September 1, 2021), and in July 2023 it proposed a rule (Release 34-97990, IA-6353, 88 FR 53960, August 9, 2023) that would have reached far beyond games. A **covered technology** was "an analytical, technological, or computational function, algorithm, model, correlation matrix, or similar method or process" that "optimizes for, predicts, guides, forecasts, or directs investment-related behaviors or outcomes," used in an **investor interaction**, which included "exercising discretion with respect to an investor's account," providing information and soliciting. A firm would have had to "evaluate any use or reasonably foreseeable potential use" to identify conflicts, determine whether any placed the firm's interest ahead of investors', and "eliminate, or neutralize the effect of," those conflicts, with records of all of it. The release named push notifications "potentially designed to affect trading behavior" and "game-like prompts" that nudge investors.

In a notice dated June 12, 2025 and published June 17, 2025, the SEC withdrew the proposal with thirteen others (Release 33-11377, 34-103247, IA-6885, 90 FR 25531), saying it "does not intend to issue final rules with respect to these proposals" and that any future action would come as a new proposal. So as of November 2026 there is no digital engagement rule. What remains are Reg BI (a nudge toward a specific security or strategy can be a recommendation), the fiduciary duty for advisers, FINRA 2210's content standards, and enforcement; the same withdrawal ended the safeguarding proposal covered in [RIA Custodians & Advisor Platforms](/books/investing-and-digital-assets/advisor-platforms#the-custody-rule-and-the-withdrawn-safeguarding-proposal), and the SEC's new custody proposal of October 6, 2026 (Release IA-7023, 91 FR 63870, comments due December 7, 2026) is still only a proposal as of November 2026. My rule for product teams is the one the proposal would have imposed anyway: know which prompts are optimized for trading volume or asset flows, and be able to show the conflict was considered. AI assistants raise the same question in a new form, and [AI in Investing](/books/investing-and-digital-assets/ai-in-investing#the-withdrawn-predictive-data-analytics-proposal) later in this book covers them.

## Finfluencers

A firm that pays social media influencers to promote it owns what they say. In March 2025 FINRA fined Robinhood Financial and Robinhood Securities $26 million and ordered $3.75 million of restitution in a settlement that included the finding that Robinhood Financial "failed to reasonably supervise and retain social media communications promoting the firm" that were "posted by paid social media influencers," some of which "included statements that were promissory or not fair and balanced." FINRA had opened a targeted exam (sweep) of firms' customer acquisition through social media influencers in September 2021 and published observed practices from it on February 28, 2023; its social media guidance runs back to Regulatory Notices 10-06, 11-39 and 17-18.

For a broker-dealer, a paid influencer's post about the firm is a firm communication: it needs supervision under 2210 and retention under 17a-4, and the contract has to give the firm the ability to review and capture it. For an adviser, a paid influencer is a compensated endorser under the marketing rule, with disclosure, a written agreement above the $1,000 de minimis, and disqualification checks. Either way the system needs a promoter registry, the content each promoter published and the firm's review of it. Influencers promoting crypto investment scams, with no firm behind them, are User-Generated Platforms' subject ([Crypto Investment Scams](/books/user-generated-platforms/crypto-investment-scams)).

## Recommendations in an App

The hard question in a product is whether a screen is a recommendation. The rules don't define the word, so firms draw lines and document them. My working classification:

- **Not a recommendation:** a market data screen, a list of every ETF sorted by a neutral attribute the customer picked, educational content that names no security for this customer, a calculator whose inputs and outputs are the customer's.
- **Likely a recommendation:** a security, strategy or account type surfaced to this customer because of their profile or behavior; "top picks" or curated lists that call to action; a push notification naming a security with a buy button; a model portfolio proposed from a questionnaire (in an advisory account this is advice under the fiduciary duty).
- **Account recommendations:** steering toward margin, options, a managed account, an IRA or a rollover.

Each surfacing of the second and third kinds is a `recommendations` row with the profile version, the candidates and the reason, so the care obligation has evidence, and each one checks that Form CRS and the Reg BI disclosure were delivered first. Personalization models that rank securities for a customer are recommendation engines from this point of view, whatever the product team calls them.

## How to Build It

These are deltas against [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model): `disclosures` (kind `form_crs`, `reg_bi_disclosure`, `form_adv_2a`, `form_adv_2b`), `accounts`, `orders`, `parties` and `legal_entities`, with the profile from [Opening Accounts](/books/investing-and-digital-assets/opening-accounts)' `investment_profiles`. This chapter adds the recommendation and its review, the conflict inventory, and the communications registry.

```sql
CREATE TABLE recommendations (               -- one recommendation to one retail customer, as made
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),  -- who is speaking
  capacity            TEXT NOT NULL CHECK (capacity IN ('broker_dealer', 'investment_adviser')),
  standard            TEXT NOT NULL CHECK (standard IN ('reg_bi', 'finra_2111', 'fiduciary')),
  party_id            UUID NOT NULL REFERENCES parties (id),
  account_id          UUID REFERENCES accounts (id),       -- null for a recommendation to open one
  kind                TEXT NOT NULL CHECK (kind IN ('security', 'strategy', 'account_type',
                        'rollover', 'model_portfolio', 'hold', 'sell')),
  subject             JSONB NOT NULL,          -- instrument, strategy code, account type or model
  profile_id          UUID NOT NULL REFERENCES investment_profiles (id),  -- what it was made against
  channel             TEXT NOT NULL CHECK (channel IN ('screen', 'push', 'email', 'chat',
                        'phone', 'in_person', 'ai_assistant')),
  communication_version_id UUID,               -- the template, if any (foreign key added below)
  associated_person_id UUID,                   -- the representative or adviser; null when automated
  model_version       TEXT,                    -- the algorithm that produced it, when automated
  alternatives        JSONB NOT NULL DEFAULT '[]',  -- candidates considered, with costs as found
  cost_comparison     JSONB,                   -- e.g. plan costs vs the IRA's, for a rollover
  rationale           TEXT NOT NULL,
  disclosure_ids      UUID[] NOT NULL,         -- Form CRS and Reg BI disclosure, delivered first
  made_at             TIMESTAMPTZ NOT NULL,
  acted_on_order_id   UUID REFERENCES orders (id)
);

CREATE TABLE best_interest_reviews (         -- supervisory review, sampled or rule-triggered
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  recommendation_id   UUID REFERENCES recommendations (id),
  account_id          UUID REFERENCES accounts (id),        -- for a series (quantitative) review
  review_kind         TEXT NOT NULL CHECK (review_kind IN ('care', 'series', 'rollover',
                        'conflict', 'complaint')),
  review_window       DATERANGE,               -- for a series: turnover, cost-to-equity
  metrics             JSONB,                   -- turnover ratio, cost-to-equity, concentration
  outcome             TEXT NOT NULL CHECK (outcome IN ('no_issue', 'remediated', 'escalated')),
  reviewer_id         UUID NOT NULL,
  case_id             UUID REFERENCES cases (id),
  reviewed_at         TIMESTAMPTZ NOT NULL
);

CREATE TABLE conflicts (                     -- the inventory the conflict obligation requires
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  description         TEXT NOT NULL,           -- 'order flow payments shared by clearing firm', ...
  incentive_level     TEXT NOT NULL CHECK (incentive_level IN ('firm', 'associated_person')),
  treatment           TEXT NOT NULL CHECK (treatment IN ('disclosed', 'mitigated', 'eliminated')),
  mitigation          TEXT,
  disclosure_kinds    TEXT[] NOT NULL,         -- where it is disclosed: 'form_crs', 'form_adv_2a', ...
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE communications (                -- a template or piece that can reach customers
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  regime              TEXT NOT NULL CHECK (regime IN ('finra_2210', 'marketing_rule')),
  kind                TEXT NOT NULL,           -- 'push_template', 'email', 'web_page', 'promoter_post', ...
  audience            TEXT NOT NULL CHECK (audience IN ('retail', 'correspondence',
                        'institutional', 'advertisement')),
  promoter_id         UUID,                    -- paid influencer or endorser (foreign key added below)
  contains_performance BOOLEAN NOT NULL DEFAULT FALSE,
  contains_hypothetical BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE communication_versions (        -- what was approved, exactly
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  communication_id    UUID NOT NULL REFERENCES communications (id),
  version             INT NOT NULL,
  content_ref         TEXT NOT NULL,           -- the rendered content, hashed
  approved_by         UUID,                    -- the principal, for retail communications
  approved_at         TIMESTAMPTZ,
  filed_with_finra_at TIMESTAMPTZ,
  filing_due_on       DATE,
  first_used_at       TIMESTAMPTZ,
  last_used_at        TIMESTAMPTZ,
  UNIQUE (communication_id, version)
);

CREATE TABLE promoters (                     -- influencers, endorsers, solicitors
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_entity_id     UUID NOT NULL REFERENCES legal_entities (id),
  name                TEXT NOT NULL,
  is_client           BOOLEAN NOT NULL,
  agreement_ref       TEXT,                    -- required above the de minimis amount
  paid_last_12m       BIGINT NOT NULL DEFAULT 0,  -- minor units, against the $1,000 de minimis
  disqualification_checked_at TIMESTAMPTZ,
  status              TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'ended'))
);

ALTER TABLE recommendations ADD FOREIGN KEY (communication_version_id)
  REFERENCES communication_versions (id);
ALTER TABLE communications ADD FOREIGN KEY (promoter_id) REFERENCES promoters (id);
```

How it runs:

1. **Before any recommendation surface renders,** check that this party has a current Form CRS and Reg BI disclosure (or, for an advisory client, the brochure) delivered; if not, deliver it first and record the `disclosures` rows.
2. **Write the recommendation row in the same transaction** that shows it, with the profile version and alternatives, so the evidence can't lag the act.
3. **Block sends of unapproved versions.** The notification service takes a `communication_version_id`, and a retail communication version without `approved_at` can't be sent; first and last use dates are written by the sender.
4. **Run series reviews** on accounts with recommended trades: turnover and cost-to-equity over rolling windows, opening a `best_interest_reviews` row and a case above thresholds the compliance team sets.
5. **Re-deliver Form CRS** on the triggering events (new account type, rollover recommendation, new service) from the code paths that create them, and within 60 days of an amendment to everyone.

Design notes:

- **Capacity is a column, not an inference.** A dual registrant's recommendation names the entity and capacity at the time it was made, and that decides the standard.
- **Automated advice names its model version** in place of a person, because the care obligation and the fiduciary duty still apply and the firm must explain what the algorithm did.
- **Communications and recommendations meet at the version.** A push notification that names a security for a customer is both a retail communication (approved template) and possibly a recommendation (this customer, this security), and the two rows point at each other.

## Auditing

FINRA and the SEC examine Reg BI, Form CRS delivery and communications in every broker-dealer exam cycle, and the SEC examines advisers against their brochures. Keep:

- **Every recommendation** with entity, capacity, standard, profile version, alternatives, cost comparison and the disclosures delivered first, for the 17a-4 period.
- **The conflict inventory by date,** with mitigations and the compensation plans reviewed against the sales contest prohibition.
- **Every Form CRS, brochure and supplement version** with filing dates and per-customer delivery records, including the 30-day and 60-day amendment clocks.
- **Every communication version** with approval, filing, first and last use, and every send that used it.
- **Every promoter** with agreements, payments over 12 months, disqualification checks and captured posts.
- **Performance and hypothetical performance** in advertisements with the calculation behind each figure.

The records mechanics are in [Audit Trails](/docs/building-blocks/audit-trails#automated-and-ai-decisions), and rendered documents in [Generated Documents](/docs/building-blocks/generated-documents#what-was-sent-is-what-you-keep).

## What This Means for the System You Build

- **Name the entity and capacity on every recommendation,** because that decides whether Reg BI, 2111 or the fiduciary duty applies.
- **Treat account types and rollovers as recommendations,** with a cost comparison saved as found.
- **Deliver Form CRS from the code paths that trigger it,** and enforce the 30-day amendment and 60-day notice clocks.
- **Keep a conflict inventory** and point disclosures at it; "may" is not disclosure of a conflict that exists.
- **Route every customer-facing template through approval,** and let the sender refuse unapproved versions.
- **Register promoters** and capture what they publish; a paid influencer speaks for the firm.
- **Label hypothetical performance** in every advertisement and keep the calculation.
- **Assume digital engagement will be judged under Reg BI and the fiduciary duty** even with the 2023 proposal withdrawn.

## References

**Law and regulation**

- [17 CFR 240.15l-1: Regulation Best Interest](https://www.law.cornell.edu/cfr/text/17/240.15l-1), the best interest obligation, the disclosure, care, conflict of interest and compliance obligations, the sales contest prohibition, and the retail customer and investment profile definitions
- [17 CFR 240.17a-14: Form CRS for broker-dealers](https://www.law.cornell.edu/cfr/text/17/240.17a-14), delivery triggers, existing customers, 60-day communication of changes, 30 days on request, website posting and filing through Web CRD
- [17 CFR 275.204-5: Delivery of Form CRS by advisers](https://www.law.cornell.edu/cfr/text/17/275.204-5), delivery at contract, the three existing-client triggers, website posting, 60 days for changes and 30 days on request
- [17 CFR 275.204-1: Amendments to Form ADV](https://www.law.cornell.edu/cfr/text/17/275.204-1), the annual updating amendment within 90 days of fiscal year-end
- [17 CFR 275.204-3: Delivery of brochures and brochure supplements](https://www.law.cornell.edu/cfr/text/17/275.204-3), delivery at contract, the 120-day annual summary, supplements and disciplinary amendments
- [17 CFR 275.206(4)-1: Investment adviser marketing](https://www.law.cornell.edu/cfr/text/17/275.206(4)-1), the general prohibitions, testimonials and endorsements, the $1,000 de minimis, third-party ratings, performance presentation and hypothetical performance
- [17 CFR 275.203A-2: Exemptions from the prohibition on SEC registration](https://www.law.cornell.edu/cfr/text/17/275.203A-2), the internet adviser exemption and the operational interactive website definition
- [15 USC 80b-6: Advisers Act Section 206](https://www.law.cornell.edu/uscode/text/15/80b-6), the antifraud prohibitions and the principal transaction disclosure and consent requirement
- [FINRA Rule 2210: Communications with the Public](https://www.finra.org/rules-guidance/rulebooks/finra-rules/2210), the three classes, principal approval, filing deadlines, content standards and recordkeeping
- [FINRA Rule 2111: Suitability](https://www.finra.org/rules-guidance/rulebooks/finra-rules/2111), the three obligations, the institutional exemption and the carve-out for recommendations subject to Reg BI

**Regulators and guidance**

- [SEC: Press release 2019-89 (June 5, 2019)](https://www.sec.gov/newsroom/press-releases/2019-89), adoption of Reg BI, Form CRS and the two interpretations, and the June 30, 2020 compliance date
- [Federal Register: Commission Interpretation Regarding Standard of Conduct for Investment Advisers (84 FR 33669, IA-5248)](https://www.federalregister.gov/documents/full_text/html/2019/07/12/2019-12208.html), care and loyalty, non-waivability, monitoring, disclosure and consent, robo-advisers, rollovers and account types
- [SEC: Form CRS instructions](https://www.sec.gov/files/formcrs.pdf), the two-page and four-page limits, the item order, conversation starters, the required standard of conduct statements and the 30-day amendment
- [SEC: Form ADV Part 2 instructions](https://www.sec.gov/about/forms/formadv-part2.pdf), Item 5 fee disclosures, Item 12 aggregation, Item 15 custody and Item 18's $1,200 prepayment balance sheet
- [Federal Register: Exemption for Certain Investment Advisers Operating Through the Internet (89 FR 24693, IA-6578)](https://www.federalregister.gov/api/v1/documents/2024-06865.json), the July 8, 2024 effective date
- [Federal Register: Request for Information on Digital Engagement Practices (86 FR 49067, Release 34-92766, IA-5833)](https://www.federalregister.gov/api/v1/documents/2021-18901.json), behavioral prompts, differential marketing and game-like features, September 1, 2021
- [Federal Register: Conflicts of Interest Associated With the Use of Predictive Data Analytics (Release 34-97990, IA-6353)](https://www.federalregister.gov/documents/full_text/html/2023/08/09/2023-16377.html), the covered technology and investor interaction definitions, the eliminate-or-neutralize obligation, push notifications and game-like prompts
- [Federal Register: Withdrawal of Proposed Regulatory Actions (90 FR 25531, June 17, 2025)](https://www.govinfo.gov/content/pkg/FR-2025-06-17/html/2025-11110.htm), the predictive data analytics, safeguarding and other withdrawals, the June 12, 2025 notice date and the statement on future rulemaking
- [Federal Register: Adviser and Regulated Fund Custody Rules; Crypto Custody Rules (91 FR 63870, IA-7023)](https://www.federalregister.gov/api/v1/documents/2026-20466.json), the October 6, 2026 proposal and the December 7, 2026 comment deadline
- [SEC OCIE: Risk Alert, Most Frequent Advisory Fee and Expense Compliance Issues (April 12, 2018)](https://www.sec.gov/files/ocie-risk-alert-advisory-fee-expense-compliance.pdf), Sections 206(1) and 206(2) and *Capital Gains Research Bureau* as the basis of fee deficiencies
- [FINRA: Social media key topic](https://www.finra.org/rules-guidance/key-topics/social-media), the 2021 influencer sweep, the February 28, 2023 update and Regulatory Notices 10-06, 11-39 and 17-18

**Courts and enforcement**

- [SEC: In the Matter of Charles Schwab & Co. and affiliates (Rel. 34-95087, IA-6047, June 13, 2022)](https://www.sec.gov/litigation/admin/2022/34-95087.pdf), the pre-set cash allocations, the "potential" conflict language and the "actual, not just potential, conflict" finding
- [FINRA: Robinhood Financial to pay $3.75 million restitution (March 7, 2025)](https://www.finra.org/media-center/newsreleases/2025/finra-orders-robinhood-financial-pay-375-million-restitution), the $26 million fines and the paid influencer supervision findings

**Vendor documentation**

- [Betterment: Form ADV Part 2A brochure (October 27, 2026)](https://www.betterment.com/adv), the Allocation process, wrap fee program, Apex routing and the order flow payment conflict
- [Vanguard: Digital Advisor](https://investor.vanguard.com/advice/digital-advisor), gross advisory fees and per-$10,000 caps
- [Robinhood Markets: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1783879/000178387926000023/hood-20251231.htm), the broker-dealer (RHS, RHF) and SEC-registered adviser (RAM, RHV) subsidiaries and Robinhood Strategies
