+++
title = "Best Interest, Replacements & 1035 Exchanges"
nav_title = "Best Interest & 1035s"
description = "Model #275 best interest and adoption, Reg BI overlap, the DOL fiduciary rule to its vacatur, Model #613 replacements, 1035 exchanges and DTCC transfers."
category = "Insurance Industry"
order = 2760
part = "Life and Annuities"
tags = ["insurance", "annuities", "best-interest", "model-275", "replacements", "1035-exchange"]
+++

Annuities are sold, not bought, and the sale is where regulators look hardest. A deferred annuity locks money up for years behind surrender charges, pays its producer a commission large enough to matter, and is often recommended to people near or in retirement who are moving savings out of something else to buy it. Three bodies of law govern that moment. The states' Suitability in Annuity Transactions Model Regulation (#275), revised in 2020 into a best-interest standard, governs every annuity recommendation by a producer. The SEC's Regulation Best Interest governs recommendations of registered annuities by broker-dealers, and the state model treats compliance with it as a safe harbor. And the Department of Labor's fiduciary rules for retirement money, rewritten in 2024, were stayed by two Texas courts and then vacated, leaving the 1975 definition in place.

Most annuity sales also replace something: an older annuity or a life policy surrendered or exchanged to fund the new one. The Life Insurance and Annuities Replacement Model Regulation (#613) makes a replacement a tracked event with notices, deadlines and a 30-day right to return, and section 1035 of the tax code lets the exchange happen without tax if the money moves contract to contract, which in practice means carrier to carrier through DTCC. This chapter covers the best-interest standard and its four obligations, the insurer's supervision system, Reg BI and the safe harbor, the DOL rule's history and status as of November 2026, replacements, and 1035 exchanges and their plumbing, with the `suitability_records` and `replacements` tables, against the core model's `submissions` and `parties`. The tax math of exchanges is [Life Insurance & the Tax Code](/books/insurance/life-insurance-and-tax#1035-exchanges-and-basis); the products are [Annuities & Riders](/books/insurance/annuities).

## How the Platforms Do It

The sale runs across the producer, the distributor, the insurer and the shared plumbing between them. What each publishes, as of November 2026:

| Party or service | Role in the sale | What its public material shows |
| --- | --- | --- |
| **DTCC Insurance & Retirement Services** | Industry hub between carriers and distributors | Applications and Premium Settlement (applications and same-day premium settlement), Settlement for Insurance Distributions (carrier-to-carrier replacements), Asset Transfer (1035) offerings "from transfer notice through settlement," Licensing & Appointments, Commissions Settlement; "50%+ of the annuity industry," 19.4 billion transactions and $358.4 billion of settlements processed (as of Q2 2026) |
| **Hexure FireLight** | Sales platform: e-application, forms, e-delivery, post-issue for life, annuities, LTC and DI | Carrier forms sorted into new business, service and marketing; an Embedded API so firms "build products and business rules once" |
| **iPipeline** | Quotes, illustrations, e-application, new business, e-signature | 100+ carriers, 2,500+ distribution partners |
| **FINRA member broker-dealers** | Sell registered annuities | Rule 2330: suitability for deferred VAs, the 36-month exchange question, principal review within seven business days |
| **Insurers** | Issue the contract and supervise the producer | Model #275 Section 6C: a supervision system reviewing each recommendation before issue |

The pattern: **the suitability evidence is collected in the sales platform and judged by the insurer**, so the record has to travel with the application in good order, and **the money in a replacement moves carrier to carrier**, never through the customer, so the 1035 status survives.

## Model #275: The Best-Interest Standard

The NAIC's 2020 revision of Model #275 (Spring 2020 edition) requires producers, when making a recommendation of an annuity, to "act in the best interest of the consumer," and insurers to run a system to supervise recommendations. It is explicit about what it isn't: nothing in it creates a private cause of action or subjects a producer to civil liability "under the best interest standard of care" or "under standards governing the conduct of a fiduciary or a fiduciary relationship" (Section 1B), and the care obligation's requirements "do not create a fiduciary obligation" (6A(1)(d)).

A producer satisfies the best-interest obligation by meeting four obligations (Section 6A):

1. **Care.** Know the consumer's financial situation, insurance needs and financial objectives; understand the available recommendation options; have a reasonable basis to believe the recommended option effectively addresses them over the life of the product; and communicate the basis of the recommendation. The care obligation doesn't require recommending "the annuity with the lowest one-time or multiple occurrence compensation structure."
2. **Disclosure.** Before the recommendation, using the Appendix A form ("Insurance Agent (Producer) Disclosure for Annuities") or similar: the role of the producer, the products the producer is licensed and authorized to sell, the insurers it is appointed with, and "a description of the sources and types of cash compensation and non-cash compensation," with a reasonable estimate of cash compensation and whether it is one-time or multiple occurrence on the consumer's request.
3. **Conflict of interest.** Identify and avoid, or reasonably manage and disclose, material conflicts of interest, including those arising from ownership interests; cash and non-cash compensation are excluded from the definition of "material conflict of interest" (5I(2)) and handled through disclosure.
4. **Documentation.** Make a written record of any recommendation and the basis for it at the time; obtain a signed statement on the Appendix B form if the consumer refuses to provide consumer profile information, and on the Appendix C form if the consumer buys an annuity that wasn't recommended.

**Consumer profile information** is the evidence the care obligation runs on, and #275 lists the minimum (5C): age; annual income; financial situation and needs, including debts and other obligations; financial experience; insurance needs; financial objectives; intended use of the annuity; financial time horizon; existing assets or financial products, including investment, annuity and insurance holdings; liquidity needs; liquid net worth; risk tolerance, including willingness to accept non-guaranteed elements; financial resources used to fund the annuity; and tax status. For an exchange or replacement, the producer must consider the whole transaction (6A(1)(j)): whether the consumer will incur a surrender charge, be subject to a new surrender period, lose existing benefits or pay higher fees, whether the new annuity would substantially benefit the consumer over its life, and whether the consumer has had another annuity exchange or replacement, "in particular, an exchange or replacement within the preceding 60 months."

## The Insurer's Supervision System

The insurer may not issue a recommended annuity unless there is a reasonable basis to believe it would effectively address the consumer's situation based on the consumer profile information (6C(1)), and it must establish and maintain a supervision system (6C(2)) that includes:

- written procedures for producers and product-specific training and training materials;
- procedures to review each recommendation **before issuing the annuity**, which may use automated screens (age, income, liquid net worth, concentration, surrender period against time horizon) to send exceptions to human review;
- reasonable procedures to detect recommendations that aren't in compliance, such as confirmations, surveys, interviews and internal monitoring;
- procedures to assess, before or on issue or delivery, whether a producer gave the required disclosures;
- procedures to identify and address suspicious consumer refusals to provide profile information;
- procedures "to identify and eliminate any sales contests, sales quotas, bonuses, and non-cash compensation" based on the sales of specific annuities within a limited period of time (6C(2)(h)).

**Training** is part of the license to sell. A producer must complete a one-time four-credit annuity training course approved by the department before selling annuities (Section 7), with a separate one-time course for producers trained under the earlier version, and the insurer must verify both the general course and its product-specific training. The license and appointment (the core model's `producer_licenses` and `appointments`, [The Core Data Model](/books/insurance/insurance-business#the-core-data-model)) and a training record are all checked at application, and a missing course is a hard stop, not a referral.

## Adoption and State Variations

The 2020 revision is the most widely adopted best-interest standard in insurance. NAIC's implementation map for the 2020 revisions shows status as of February 1, 2026, and its state page for #275 (Summer 2025) lists each state's citations under model adoption, previous version and related activity; New York appears under its own regulation rather than the model. <!-- source-gap: naic-275-count | secondary | exact count of states adopting the 2020 revision of Model 275 as of Feb 1, 2026 (map colors not machine-readable) | closes with: an NAIC text listing or chart of adopting jurisdictions | checked: 2026-11-10 --> The map is a picture, and I couldn't extract a reliable count from it, so the chapter gives the status date without the number.

Two state versions show what varies:

- **Florida** writes the standard into statute (Fla. Stat. 627.4554): the best-interest duty without a fiduciary obligation, disclosure of role, licensing, insurer relationships and compensation before a recommendation, conflicts, documentation, whole-transaction review of replacements, a one-time four-hour training course that insurers must verify, records kept for five years after the transaction, no private cause of action, and, for consumers 65 or older, a cap on surrender charges of 10% and no charge after the 10th policy year ([Annuities & Riders](/books/insurance/annuities#surrender-charges-free-withdrawals-and-mvas)).
- **New York**'s Regulation 187 (11 NYCRR Part 224, "Suitability and Best Interests in Life Insurance and Annuity Transactions," amended effective August 1, 2018) applies the best-interest standard to life insurance as well as annuities: insurers must set standards and procedures so that recommendations serve the consumer's best interest, producers must follow the standard, and the insurer follows it where no producer is involved (224.0). Records follow Regulation 152 (224.7).

A national carrier runs one sales workflow with state overlays: which disclosure form, which retention period, whether life sales are in scope, which senior protections apply. That is a rules table by state and effective date, the same shape as every other state rule in this volume.

## Regulation Best Interest and the Safe Harbor

The SEC's Regulation Best Interest (17 CFR 240.15l-1, adopted 2019, effective September 10, 2019) requires a broker-dealer recommending a securities transaction or strategy to a retail customer to "act in the best interest of the retail customer at the time the recommendation is made," without placing its own interest ahead of the customer's, through four component obligations: disclosure, care, conflict of interest and compliance. Its conflict obligation includes eliminating "sales contests, sales quotas, bonuses, and non-cash compensation" based on specific securities within a limited time, mirroring #275. A variable annuity or RILA recommended by a registered representative is a securities recommendation under Reg BI and an annuity recommendation under the state rule at once. [Investing & Digital Assets](/books/investing-and-digital-assets/advice-and-conduct#regulation-best-interest) covers Reg BI's obligations and the broker-dealer's records.

Model #275 resolves the overlap with a **safe harbor** (6E): recommendations and sales made in compliance with "comparable standards," which include a broker-dealer's obligations under Reg BI and FINRA's rules and an investment adviser's fiduciary duty, satisfy the model, provided the insurer monitors the financial professional or the supervising entity and provides it with information about the product. For the system, the safe harbor is a branch in the insurer's review: for a registered product sold through a broker-dealer, the insurer records reliance on comparable standards, the supervising broker-dealer and the monitoring evidence, instead of re-running its own care review on the representative's recommendation.

## The DOL Fiduciary Rule: History and Status

Annuities funded with retirement money (an IRA rollover, a 401(k) distribution) also fall under ERISA and the tax code's prohibited transaction rules, which the Department of Labor interprets. The status as of November 2026:

- **1975.** The DOL's five-part regulatory definition of investment advice fiduciary, which most one-time annuity sales don't meet, became the baseline.
- **April 2024.** The DOL finalized the Retirement Security Rule, expanding the definition (including one-time rollover recommendations) and amending the prohibited transaction exemptions insurance agents rely on, to take effect in September 2024.
- **July 2024.** Two federal district courts in Texas stayed it: the Northern District of Texas nationwide, in *American Council of Life Insurers v. DOL*, and the Eastern District of Texas, more narrowly, a day earlier, in *Federation of Americans for Consumer Choice v. DOL*.
- **September 2025.** The DOL announced plans to replace the rule through its regulatory agenda.
- **November 28, 2025.** The Fifth Circuit granted the DOL's unopposed motion to withdraw its defense of the rule on appeal.
- **By March 2026.** The Fifth Circuit issued an order vacating the 2024 rule and its related exemptions, and the DOL removed the rule from the Code of Federal Regulations; the 1975 definition continues to apply, and the DOL said it has no current plans to regulate the investment activities of securities brokers and insurance agents (Haynes Boone, March 26, 2026). <!-- source-gap: dol-vacatur-date | secondary | exact date of the Fifth Circuit vacatur order and of the DOL's removal of the 2024 rule from the CFR | closes with: the Fifth Circuit order or the Federal Register removal notice | checked: 2026-11-10 -->

For a system built in 2026, the practical rule is that the state best-interest regulation (and Reg BI for registered products) governs the sale, and the 1975 test governs whether a particular advice relationship makes the producer an ERISA fiduciary. The history is worth keeping in the rules table anyway: the 2016 and 2024 rules were each written, contested and vacated within a few years, and a fourth attempt would land in the same place in the workflow.

## Replacements under Model 613

A **replacement** is a transaction in which a new policy or contract is to be purchased and the existing one has been or is to be lapsed, forfeited, surrendered or partially surrendered, assigned to the replacing insurer or otherwise terminated; converted to reduced paid-up or extended term, or continued with a stop in premiums; amended to reduce benefits or term; reissued with a reduction in cash value; or used in a **financed purchase** (Model #613, Section 2J). A financed purchase uses withdrawals, surrenders or loans from an existing policy to pay the new one's premiums, and when the same policyholder's values are tapped within four months before or 13 months after the new policy's effective date at the same company, that is prima facie evidence of intent (2D).

Each party has its duties (2nd Quarter 2015 edition):

- **The producer** (Section 3) asks whether the purchase involves a replacement, presents the "Important Notice: Replacement of Life Insurance or Annuities" (Appendix A), signed by the applicant and producer, lists the policies being replaced, and leaves copies of sales material.
- **Insurers that use producers** (Section 4) require the forms, monitor each producer's replacements and can produce, on request, life replacements as a percentage of the producer's annual life sales, lapses as a percentage of sales, annuity replacements as a percentage of annuity sales, unreported replacements detected, and replacements indexed by producer and existing insurer.
- **The replacing insurer** (Section 5) verifies the forms; notifies each existing insurer "within five (5) business days of receipt of a completed application indicating replacement" (or of identifying one), and sends its illustration, policy summary or disclosure document within five business days of an existing insurer's request; keeps the replacement notifications, indexed by producer, for at least five years or until the next domiciliary examination; and gives the owner a **30-day right to return** with an unconditional refund of premiums and fees, or for variable and MVA contracts the cash surrender value plus fees and charges deducted. Where the replacing and existing insurers are the same or affiliated, it credits the time already elapsed under the old policy's incontestability and suicide periods, up to the old face amount.
- **The existing insurer** (Section 6) keeps the replacement notifications, indexed by replacing insurer, for at least five years; sends the owner a letter on the right to receive information about the existing contract's values, including an in force illustration if available or a policy summary if one can't be produced within five business days of the replacement notice, and provides it within five business days of the owner's request; and, on any request to borrow, surrender or withdraw values, warns that releasing them may affect the policy's guaranteed and non-guaranteed elements, face amount or surrender value.

Direct response sales have their own appendices and duties (Section 7). A **conservation** attempt by the existing insurer, persuading the owner to keep the old contract, is legitimate and common; it has to use the same disclosure discipline, and its outcome is a field on the replacement record.

**Worked numbers: what the replacement costs.** Mine: a 68-year-old owns a deferred annuity with $150,000 of account value, a 4% surrender charge remaining and a GMDB of $160,000. A producer recommends a new FIA with a 5% premium bonus and a 10-year surrender schedule. Surrendering costs $6,000, so $144,000 moves; the bonus adds $7,200, a first-year value of $151,200. On paper the owner is $1,200 ahead, but the owner gave up a $160,000 death benefit for one of about $151,200, started a new 10-year surrender period at 68, and (in Florida, at 68) the new contract's surrender charges are capped at 10% and must end after the 10th year. The best-interest record has to show that those numbers were computed, disclosed and weighed: the surrender charge paid, the benefit lost, the new liquidity horizon against the consumer's stated time horizon, and why the bonus or the new features justify it. A supervision rule that flags any replacement where the death benefit falls, or the surrender period restarts past a stated age, catches exactly this case.

## 1035 Exchanges and DTCC Transfers

Section 1035 lets the owner swap contracts without recognizing gain: life for life, endowment or annuity (or qualified long-term care); endowment for endowment, annuity or qualified LTC; annuity for annuity or qualified LTC; qualified LTC for qualified LTC (26 USC 1035(a)). Annuity to life is not on the list. The new contract takes the old one's basis (1035(d) referring to 1031(d)), so the deferred gain carries over, and the tax chapter works the basis, partial exchanges and boot ([1035 Exchanges and Basis](/books/insurance/life-insurance-and-tax#1035-exchanges-and-basis)).

To keep the exchange tax-free, the money must move from the old insurer to the new one without the owner taking it. The mechanics:

1. **Application and transfer paperwork.** The new application marks a replacement and a 1035 exchange; the owner signs an absolute assignment or transfer request naming the new insurer, plus the replacement notice.
2. **Transfer request to the existing insurer.** Sent electronically through DTCC's Asset Transfer service (or on paper), with the owner's signature and the new contract details. The existing insurer validates ownership, signatures and any spousal or collateral assignee consent, sends its five-business-day values letter, and may attempt conservation.
3. **Release of funds.** The existing insurer surrenders the old contract and pays the new insurer directly, through DTCC's settlement or by check payable to the new insurer, reporting the exchange to the owner on Form 1099-R with distribution code 6 and the old contract's premiums paid in box 5; the instructions say to enter "the total value of the contract in box 1, -0- (zero) in box 2a, the total premiums paid in box 5."
4. **Issue.** The new insurer applies the funds as premium with the carried-over basis, issues the contract, and starts the 30-day replacement free look.

Partial exchanges of annuities, moving part of one contract into another, are tax-free if no amount is received from either contract within 180 days of the transfer, other than annuity payments for 10 years or more or for life (Rev. Proc. 2011-38, for transfers completed on or after October 24, 2011), with basis allocated ratably between the contracts (Rev. Rul. 2003-76). The 180-day window is a hold the system places on both contracts and checks on every withdrawal request.

Two failure modes matter. **A check sent to the owner** breaks the exchange: the owner has received the money, and the surrender is taxable. **A slow existing insurer** delays the new contract and the owner's interest crediting, which is why transfer turnaround is a service metric between carriers and one of the reasons DTCC's transfer service exists.

## How to Build It

The sale extends the core model's `submissions` (the application, defined in [Underwriting Rules, Referrals & Models](/books/insurance/underwriting#how-to-build-it)) and `parties`; disclosures given to the consumer reuse `compensation_disclosures` from [Agents, Brokers & Channels](/books/insurance/agents-brokers-and-channels#how-to-build-it); producer license, appointment and training checks use `producer_licenses`, `appointments` and the continuing education records (`ce_records`) of [Producer Licensing & Appointments](/books/insurance/producer-licensing#how-to-build-it). This chapter adds the suitability record and the replacement record:

```sql
CREATE TABLE suitability_records (         -- the best-interest file for one recommendation
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  submission_id      UUID NOT NULL,         -- the application (submissions)
  consumer_party_id  UUID NOT NULL REFERENCES parties (id),
  producer_id        UUID REFERENCES producers (id),
  standard           TEXT NOT NULL CHECK (standard IN ('naic_275_2020', 'ny_reg_187',
                       'fl_627_4554', 'comparable_reg_bi', 'comparable_ria')),
  basis_of_sale      TEXT NOT NULL CHECK (basis_of_sale IN ('recommended',
                       'not_recommended', 'profile_refused')),  -- Appendix B and C forms
  profile            JSONB NOT NULL,        -- the 5C items, as captured, with as-of
  profile_captured_at TIMESTAMPTZ NOT NULL,
  options_considered JSONB NOT NULL,        -- products compared, with reasons
  rationale          TEXT NOT NULL,         -- the basis of the recommendation
  disclosure_ids     UUID[] NOT NULL,       -- Appendix A and any compensation estimate
  conflicts          JSONB NOT NULL DEFAULT '[]',
  is_replacement     BOOLEAN NOT NULL,
  training_verified  BOOLEAN NOT NULL,      -- general course and product training
  insurer_review     TEXT NOT NULL CHECK (insurer_review IN ('pending', 'auto_approved',
                       'approved', 'returned_for_info', 'declined', 'safe_harbor')),
  reviewed_by        UUID,
  reviewed_at        TIMESTAMPTZ,
  screens            JSONB NOT NULL,        -- every automated rule and its result
  retain_until       DATE NOT NULL          -- per the state rule
);

CREATE TABLE replacements (                -- one existing contract being replaced
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  submission_id      UUID NOT NULL,
  new_policy_id      UUID REFERENCES policies (id),
  existing_insurer   TEXT NOT NULL,         -- NAIC code where known
  existing_contract  TEXT NOT NULL,
  kind               TEXT NOT NULL CHECK (kind IN ('replacement', 'financed_purchase',
                       'internal', 'conversion')),
  is_1035            BOOLEAN NOT NULL,
  partial_exchange   BOOLEAN NOT NULL DEFAULT FALSE,
  notice_signed_at   TIMESTAMPTZ,           -- Appendix A
  existing_notified_due DATE NOT NULL,      -- five business days from application
  existing_notified_at TIMESTAMPTZ,
  values_letter_at   TIMESTAMPTZ,           -- existing insurer's letter, if this insurer is it
  conservation       TEXT CHECK (conservation IN ('none', 'attempted', 'retained')),
  transfer_channel   TEXT CHECK (transfer_channel IN ('dtcc_asset_transfer', 'paper')),
  transfer_requested_at TIMESTAMPTZ,
  funds_received_at  TIMESTAMPTZ,
  funds_received     BIGINT,
  carried_basis      BIGINT,                -- from the existing insurer
  free_look_ends_on  DATE,                  -- 30 days from delivery
  hold_until         DATE,                  -- 180 days for partial annuity exchanges
  status             TEXT NOT NULL CHECK (status IN ('identified', 'notified',
                       'transfer_requested', 'funds_received', 'issued', 'returned',
                       'withdrawn'))
);
```

The replacement's clocks are business days, and a holiday calendar decides them. A small function, used for the existing-insurer notice and the values letter alike ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)):

```go tab="Go"
import "time"

// AddBusinessDays returns the date n business days after start, skipping
// weekends and the given holidays (dates in the same location as start).
func AddBusinessDays(start time.Time, n int, holidays map[string]bool) time.Time {
	d := start
	for n > 0 {
		d = d.AddDate(0, 0, 1)
		if wd := d.Weekday(); wd == time.Saturday || wd == time.Sunday {
			continue
		}
		if holidays[d.Format("2006-01-02")] {
			continue
		}
		n--
	}
	return d
}
```

```rust tab="Rust"
use chrono::{Datelike, Duration, NaiveDate, Weekday};
use std::collections::HashSet;

/// The date n business days after start, skipping weekends and holidays.
pub fn add_business_days(start: NaiveDate, mut n: u32, holidays: &HashSet<NaiveDate>) -> NaiveDate {
    let mut d = start;
    while n > 0 {
        d += Duration::days(1);
        if matches!(d.weekday(), Weekday::Sat | Weekday::Sun) || holidays.contains(&d) {
            continue;
        }
        n -= 1;
    }
    d
}
```

An application received Wednesday, November 25, 2026, with Thanksgiving on the 26th in the holiday set, gives a notice due date of Thursday, December 3, 2026 (the 27th, 30th, December 1st, 2nd and 3rd). Which holidays count is a state and company rule, stored with the deadline.

The workflow is a state machine on the application: profile captured, disclosures given, screens run, insurer review, issue or return, and, for replacements, notice, transfer, funds and free look, each with timers ([Workflows](/docs/building-blocks/workflows#timers-deadlines-and-escalations)). The insurer review is a decision record in the shape of [Risk Scoring](/docs/building-blocks/risk-scoring#the-decision-record): which screens fired, what the reviewer saw, what they decided and why.

## Auditing

Market conduct examiners test annuity sales by sample, and each file has to answer:

- **Was there a recommendation, and what was it based on?** The consumer profile as captured with its date, the options considered, the rationale, and the Appendix B or C form where the consumer refused information or bought without a recommendation.
- **What was disclosed, when?** The producer disclosure before the recommendation, compensation estimates given on request, and conflicts.
- **Did the insurer review before issue?** The review status and timestamp before the issue date, the screens and their results, and the reviewer.
- **Was the producer qualified?** License, appointment and both training requirements as of the sale date.
- **Replacement discipline.** The signed notice, the existing-insurer notification within five business days, the values letter, the transfer path, the 30-day free look and the replacement ratios by producer that #613 Section 4 requires the insurer to produce on request.
- **No banned incentives.** Evidence that sales contests, quotas, bonuses and non-cash compensation tied to specific annuities within a limited period were identified and eliminated.

## What This Means for the System You Build

- **Capture the consumer profile as structured, dated data,** item by item from #275 5C, and keep the record of the recommendation with it at the time of sale.
- **Make the insurer's review a gate before issue,** with automated screens sending exceptions to people, and record the safe harbor branch for registered products sold through broker-dealers.
- **Treat training, license and appointment as hard checks** at application, as of the sale date.
- **Model replacements as their own records** with business-day clocks, the existing insurer's duties when you're the one being replaced, and conservation outcomes.
- **Move 1035 money carrier to carrier** through DTCC or a check payable to the new insurer, carry the basis, and hold partial annuity exchanges for 180 days.
- **Keep the standard per state as rules by effective date,** including New York's life sales and Florida's senior caps, and keep the federal history there too.

## References

**Law and regulation**

- [17 CFR 240.15l-1](https://www.law.cornell.edu/cfr/text/17/240.15l-1), Regulation Best Interest: the general obligation, the disclosure, care, conflict of interest and compliance obligations, and the definition of retail customer
- [Federal Register: Regulation Best Interest: The Broker-Dealer Standard of Conduct, July 12, 2019](https://www.federalregister.gov/api/v1/documents/2019-12164.json), the publication and the September 10, 2019 effective date
- [26 USC 1035](https://www.law.cornell.edu/uscode/text/26/1035), the tax-free exchanges and the reference to section 1031(d) for basis
- [Fla. Stat. 627.4554](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.4554.html), Florida's best-interest statute: duties, training, five-year records, no private cause of action and the senior surrender charge limits
- [11 NYCRR 224.0](https://www.law.cornell.edu/regulations/new-york/11-NYCRR-224.0), New York Regulation 187's purpose and best-interest standard for life insurance and annuities
- [11 NYCRR 224.7](https://www.law.cornell.edu/regulations/new-york/11-NYCRR-224.7), records kept under Regulation 152

**NAIC**

- [NAIC: Suitability in Annuity Transactions Model Regulation (#275), Spring 2020 (PDF)](https://content.naic.org/sites/default/files/model-law-275.pdf), the best-interest obligation, the no-fiduciary clause, consumer profile information, the four obligations, insurer supervision, the safe harbor, training and recordkeeping
- [NAIC: Implementation of 2020 Revisions to Model #275, status as of February 1, 2026 (PDF)](https://content.naic.org/sites/default/files/inline-files/275%20Final%20Map_2020_February%201%202026.pdf), the adoption map
- [NAIC: Model #275 state page, Summer 2025 (PDF)](https://content.naic.org/sites/default/files/model-laws-state-page-275.pdf), state citations by model adoption, previous version and related activity
- [NAIC: Life Insurance and Annuities Replacement Model Regulation (#613), 2nd Quarter 2015 (PDF)](https://content.naic.org/sites/default/files/model-law-613.pdf), the definitions of replacement and financed purchase, producer and insurer duties, the five-business-day clocks, five-year records, replacement monitoring and the 30-day right to return

**Regulators and guidance**

- [FINRA Rule 2330](https://www.finra.org/rules-guidance/rulebooks/finra-rules/2330), deferred variable annuity suitability, the 36-month exchange question and principal review
- [IRS: Internal Revenue Bulletin 2011-30 (Rev. Proc. 2011-38)](https://www.irs.gov/irb/2011-30_IRB), the 180-day rule for partial annuity exchanges, its effective date and the ratable basis allocation of Rev. Rul. 2003-76
- [IRS: Instructions for Forms 1099-R and 5498 (2026)](https://www.irs.gov/instructions/i1099r), reporting a section 1035 exchange with code 6

**Vendor documentation**

- [DTCC: Insurance & Retirement Services](https://www.dtcc.com/wealth-management-services/insurance-and-retirement-services), Applications and Premium Settlement, Settlement for Insurance Distributions, Asset Transfer (1035), Licensing & Appointments and Commissions, and its Q2 2026 figures
- [Hexure](https://www.hexure.com/), FireLight, the Carrier Forms Engine and the Embedded API
- [iPipeline](https://www.ipipeline.com/), e-application, new business and its customer counts

**In practice**

- [Haynes Boone: DOL Retirement Security fiduciary rule vacated, March 26, 2026](https://www.haynesboone.com/news/blogs/dol-retirement-security-fiduciary-rule-vacated), the Fifth Circuit vacatur, removal from the CFR, the continuing 1975 definition and the DOL's statement on brokers and insurance agents
- [PLANADVISER: Federal appeal of DOL fiduciary rule ends in circuit court, December 1, 2025](https://www.planadviser.com/federal-appeal-of-dol-fiduciary-rule-ends-in-circuit-court/), the July 2024 Texas stays, the November 28, 2025 order and the DOL's replacement plans
