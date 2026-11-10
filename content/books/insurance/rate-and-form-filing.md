+++
title = "Filing Rates & Forms"
description = "Prior approval, file-and-use and use-and-file, Prop 103, SERFF, loss costs and multipliers, readability rules, and how a filing becomes product config."
category = "Insurance Industry"
order = 2707
part = "Regulation and Solvency"
tags = ["insurance", "regulation", "rate-filing", "serff", "prop-103", "policy-forms"]
+++

An insurer can't simply decide what to charge or what its policy says. In every state, the rates, the rating rules that apply them and the policy forms for most personal and many commercial lines are filed with the insurance department, and in about half the states most rate changes need the department's approval before they can be used. What gets filed is the product: the rating algorithm with its base rates and factor tables, the manual rules (eligibility, minimum premiums, rounding), the forms and endorsements with their edition dates, and the actuarial support showing the rates are not "excessive, inadequate, or unfairly discriminatory," the standard nearly every state's rating law uses. What comes back is an approval, a deemed approval when the department's clock runs out, a disapproval or a withdrawal, with effective dates for new business and renewals.

For the system, the filing is the source of truth for what the product may do in a state, and the gap between what was filed and what the system charged is the single most common market conduct finding in rating. This chapter covers the regulatory regimes and their clocks (with Florida, California, New York and Texas as worked examples), SERFF and the parts of a filing, advisory organization loss costs and how an insurer adopts them, form filing and readability, and how an approved filing becomes versioned product configuration. The rating algorithm itself is [How a Rate Is Built](/books/insurance/how-a-rate-is-built), what may and may not go into it is [What You May Rate On](/books/insurance/rating-factors-and-limits), and how a product is modeled is [Products, Coverages & Forms](/books/insurance/products-and-coverages).

## How the Platforms Do It

Carriers' 10-Ks for fiscal 2025 (filed early 2026) describe the same patchwork, and the core platforms build around it:

- **Progressive** says rate regulation "varies from 'use and file,' to 'file and use,' to 'prior approval,'" that some states limit rates of return or excess profitability, and that some require prior approval to withdraw from a line.
- **Travelers** says "approximately one-half of the states require prior approval of most rate changes."
- **Florida's statute** makes the trade-off explicit: file-and-use filings must be made at least 90 days before the effective date and can't be used during review, while use-and-file filings may be used first and filed within 30 days, with the department able to order the excess refunded if the rate turns out unjustified (Fla. Stat. 627.062(2)(a), (h)).
- **NAIC's SERFF** is the filing channel for nearly every jurisdiction; its Filing Access page lists the participating states plus DC, Guam and the Interstate Compact for public search of "publicly available Rate and Form Filings."
- **Advisory organizations** (ISO, AAIS, NCCI and the independent bureaus) file loss costs, rules and forms that member insurers adopt by reference. NAIC's model loss cost multiplier form (effective November 8, 2022) is the document an insurer files to adopt them.
- **Core platforms** (Guidewire, Duck Creek, Majesco, Socotra and others) version rate tables and forms per state with effective dates for new and renewal business, because that's the shape filings approve ([Core Platforms](/books/insurance/core-platforms) has the vendor detail).

## The Regimes

States sort rate regulation into a handful of regimes, often different by line in the same state (personal auto and homeowners strictest, large commercial risks often exempt):

| Regime | What it means | Who carries the risk of the wait |
| --- | --- | --- |
| **Prior approval** | The rate may not be used until approved, or until a statutory deemer period passes without action | The insurer: an inadequate rate stays in force while the filing is reviewed |
| **File-and-use** | The rate is filed, then may be used after a waiting period or immediately on filing, subject to later disapproval | Shared: the department can disapprove prospectively |
| **Use-and-file** | The rate may be used first and filed within a set period | The policyholder, offset by refund rules |
| **Flex rating** | Changes within a band are file-and-use; changes beyond it need approval | The band sets it |
| **No filing / exempt** | Rates aren't filed (often large commercial risks meeting size thresholds) | The market |

The regime decides the system's effective-date logic: under prior approval, the product version can't go live before an approval date that isn't known in advance; under file-and-use, it goes live on a date chosen at filing, and must be pulled back if the department disapproves; under use-and-file, it goes live first and the filing is a task with a deadline.

### Florida: File-and-Use, Use-and-File and a 90-Day Deemer

Florida's property, casualty and surety rate law (Fla. Stat. 627.062, most recently amended in 2024) gives the insurer the choice per filing:

- **File-and-use:** filed at least 90 days before the proposed effective date, not implemented during review. The Office of Insurance Regulation must issue a notice of intent to approve or disapprove within 90 days, and "The rate shall be deemed approved if the office does not issue a notice of intent to approve" or disapprove in that period; information requests don't toll the 90 days.
- **Use-and-file:** submitted within 30 days after the effective date and used meanwhile; if the rate proves unjustified, the office orders the portion above "that which was actuarially justified be returned" to policyholders as a credit or refund.
- **What the office weighs:** fifteen factors, including past and prospective loss experience and expenses, the degree of competition, investment income, the cost of reinsurance, trend, "a reasonable margin for underwriting profit and contingencies," and, for property, "projected hurricane losses ... estimated using a model or method" found acceptable by the Florida Commission on Hurricane Loss Projection Methodology; a residential property insurer may use a weighted or straight average of two or more accepted models, applied statewide.
- **Excessive profits:** rates are "deemed excessive if they are likely to produce a profit from Florida business" that is unreasonably high for the risk.
- **Reinsurance pass-through filings** may not raise any policyholder's premium more than 3% or the overall premium more than 15%.

### California: Proposition 103

California is the reference prior-approval regime. Proposition 103, passed by voters on November 8, 1988, rolled rates back to "at least 20% less than" their November 1987 level and made every rate change subject to the commissioner's prior approval (Cal. Ins. Code 1861.01, 1861.05). The approval statute sets the clocks:

- **Standard and burden:** no rate may be approved or remain in effect "which is excessive, inadequate, unfairly discriminatory," competition may not be considered, investment income must be reflected, and the applicant bears the burden of proving the change is justified (1861.05(a), (b)).
- **The 60-day deemer:** an application is deemed approved 60 days after public notice unless a hearing is granted or ordered.
- **Mandatory hearings:** on a timely consumer request, a hearing is mandatory when the "proposed rate adjustment exceeds 7% of the then applicable rate for personal lines or 15% for commercial lines."
- **The 180-day backstop:** otherwise the application is deemed approved 180 days after receipt, unless disapproved after a hearing or in extraordinary circumstances (1861.05(c)).
- **Intervenors:** "Any person may initiate or intervene in any proceeding," and the commissioner or a court "shall award reasonable advocacy and witness fees and expenses" to a person representing consumers who "has made a substantial contribution" to a decision, paid by the rate applicant (1861.10).

The intervenor mechanism is why California rate filings take months and why the department's 2025 Sustainable Insurance Strategy proposed intervenor reform and shorter review timelines alongside allowing catastrophe models and reinsurance costs in homeowners rates ([Stressed & Residual Markets](/books/insurance/stressed-markets#california) covers the outcome). The California statutes are cited here from a public mirror because the Legislature's own site refused automated access.<!-- source-gap: ca-prop-103-text | secondary | Cal. Ins. Code 1861.01, 1861.05 and 1861.10 text read from california.public.law, not leginfo.legislature.ca.gov | closes with: the same sections opened on leginfo.legislature.ca.gov | checked: 2026-11-09 -->

### New York: Flex Rating

New York's flex rating law (N.Y. Ins. Law 2344) lets property-casualty rate changes within limits the superintendent sets each year by regulation take effect without prior approval; filings "which produce rate level changes beyond such limitations shall not become effective until approved," but are "deemed approved unless disapproved by the superintendent within thirty days," extendable by 30 days for cause and 15 more with additional cause. Certain coverages are excluded, and the section is scheduled to expire after June 30, 2029. The system consequence: whether a filing needs approval depends on the computed overall change against that year's band, so the band is a rule row with a date and the filing's indicated change is stored with it.

### Texas: Use on Filing

Texas's rating law for most property-casualty lines (Tex. Ins. Code ch. 2251) says "An insurer may use a rate filed under this subchapter on and after the date the rate is filed," with prior approval reserved for specific circumstances in later sections. Large commercial insureds are exempt from the filing requirement altogether: those with total insured property values of $5 million or more, total annual gross revenues of $10 million or more, or premiums of $25,000 or more for property or general liability or $50,000 or more for multiperil (2251.101(c), as amended effective September 1, 2021).

## SERFF and the Parts of a Filing

SERFF (the System for Electronic Rates and Forms Filing), run by the NAIC, is how filings reach nearly every department; the NAIC calls it "the most cost-effective and efficient way to submit rates and forms filings to the states and jurisdictions" and is several years into a modernization of it. Each filing gets a SERFF tracking number, which is the key the rest of the system should carry. A filing's contents, which most states set out in checklists:

- **The filing type:** rate, rule, form, or a combination; new program, revision, or withdrawal; and the product coding (line and subline) the department uses to route it.
- **Rate and rule pages:** the manual pages as they'll be used, usually with a redline against the current version.
- **The actuarial memorandum and exhibits:** indicated versus selected change, loss development and trend, expense and profit provisions, credibility, the impact on policyholders (distribution of changes, largest increases), and for property, catastrophe model output and reinsurance cost where the state allows it.
- **Form pages:** each form with its number and edition date, a statement of variability, and readability certifications where required.
- **The department's questions (objections) and the insurer's responses,** each dated; a response clock the department sets, and in deemer states the question of whether a question tolls the deemer (Florida's statute says information requests don't).
- **The disposition:** approved, approved with modification, deemed approved, disapproved, withdrawn, filed (for informational filings), with effective dates for new and renewal business, which may differ from what was requested.

SERFF Filing Access makes publicly available filings searchable in the participating states, which is how competitors, consumer advocates and researchers read each other's rating plans.

## Advisory Loss Costs and the Multiplier

Under the McCarran-Ferguson antitrust proviso, advisory organizations may pool statistical data and publish what the industry would otherwise be prohibited from sharing, under state supervision: today that means **prospective loss costs** (the expected losses and loss adjustment expense per unit of exposure, with no expense or profit loading), plus rules and forms. Each member insurer turns loss costs into rates by filing its own **loss cost multiplier (LCM)**. The NAIC's model "Calculation of Company Loss Cost Multiplier" form (effective November 8, 2022) is the template most states use, and its steps are the formula:

1. **Declaration and rule of application.** The insurer declares it is a member, subscriber or service purchaser of the advisory organization and chooses whether its LCM applies to the current reference filing only, or to all future loss cost revisions automatically ("Some states prohibit this option," for each choice).
2. **Loss cost modification factor.** A deviation from the advisory loss costs based on the insurer's own experience: -10% is 0.900, +15% is 1.150.
3. **Expense provisions** as a percentage of premium: commission and brokerage, other acquisition, general expenses, taxes, licenses and fees, and underwriting profit and contingencies "with consideration of investment income."
4. **Permissible loss ratio** = 100% minus total expenses; **expense multiplier** = 1 / PLR.
5. **Adjustments:** a loading relative to loss (where LAE or assessments aren't in the loss costs) and the impact of expense constants and minimum premiums.
6. **Formula LCM** = (modification factor × expense multiplier) × (loading / expense constant impact), and a selected LCM, with differences explained.
7. **Percent change** = (1 + LCM change) × (1 + loss cost change) × (1 + other changes) - 1.

New Jersey's regulation spells out the consequence in its own words: "final rates shall be a combination of the prospective loss costs and the loss costs multiplier," and once filed, the LCM is deemed automatically applicable to later loss cost filings, with 30-day deadlines for adopting on a different date, revising the LCM, or filing a non-adoption form (N.J.A.C. 11:13-8.4).

### Worked Numbers: An LCM Filing

An illustration, my numbers. A commercial insurer adopts an advisory organization's revised loss costs, which rise 2.5% on its book, and refiles its multiplier:

| Step | Item | Value |
| --- | --- | --- |
| 3A | Loss cost modification (-5%) | 0.950 |
| 4A-E | Commission 15.0%, other acquisition 5.0%, general 6.0%, taxes and fees 3.0%, profit and contingencies 4.0% | 33.0% |
| 5A | Permissible loss ratio (100% - 33.0%) | 67.0% |
| 5B | Expense multiplier (1 / 0.670) | 1.4925 |
| 6A | Loading relative to loss | 1.000 |
| 6B | Impact of expense constant and minimum premiums (1.0%) | 1.010 |
| 7A | Formula LCM: (0.950 × 1.4925) × (1.000 / 1.010) | 1.4039 |
| 7B | Selected LCM | 1.404 |
| 8A | Change in LCM (current 1.350): 1.404 / 1.350 - 1 | +4.0% |
| 8B | Change in loss costs on the insurer's book | +2.5% |
| 8D | Total change: 1.040 × 1.025 - 1 | +6.6% |

A class with an advisory loss cost of $2.50 per $100 of payroll now rates at $2.50 × 1.404 = $3.51 per $100. Two system consequences: the rate table the rating engine reads is the product of two filings (the advisory organization's loss cost filing and the insurer's LCM filing), each with its own effective date and tracking number; and the 6.6% total change is what the department compares to its thresholds (a 6.6% personal lines change in California would stay under the 7% mandatory hearing trigger, a 7.1% change would not).

## Forms and Readability

Policy forms are filed like rates, and in most states for most lines must be approved (or deemed approved) before use. The issues a form review looks for are mostly legal (required provisions, prohibited exclusions, state amendatory endorsements that override the base form), but several states also score the text:

- **Florida** requires property-casualty policy forms filed on or after October 1, 1983 to achieve "a minimum score of 45 on the Flesch reading ease test" (or an equivalent test the office approves), with an officer's certification accompanying the filing; policies of 10,000 words or fewer are scored in full, longer ones by samples (Fla. Stat. 627.4145).
- **NAIC's Life and Health Insurance Policy Language Simplification Model Act (#575)** sets a minimum Flesch score of 40 and print "in not less than ten point type, one point leaded," the basis for most states' life policy readability rules.

The Flesch formula, as Florida's statute states it, is 206.835 minus 1.015 times the average words per sentence, minus 84.6 times the average syllables per word. A form section of 120 words in 8 sentences with 190 syllables scores 206.835 - 1.015 × 15 - 84.6 × 1.5833 = 57.66, passing both thresholds. Form systems compute it at authoring time so a failing draft never reaches a filing:

```go tab="Go"
// FleschReadingEase computes the score the way Fla. Stat. 627.4145(5)
// states it. Counting words, sentences and syllables follows the statute's
// rules for what counts (hyphenated words, numbers, headings); this is the
// arithmetic only.
func FleschReadingEase(words, sentences, syllables int) float64 {
	if words == 0 || sentences == 0 {
		return 0
	}
	wps := float64(words) / float64(sentences)
	spw := float64(syllables) / float64(words)
	return 206.835 - 1.015*wps - 84.6*spw
}

// Passes reports whether a form meets a state's minimum, 45 in Florida for
// property-casualty forms, 40 under NAIC Model #575 for life forms.
func Passes(score, minimum float64) bool { return score >= minimum }
```

```rust tab="Rust"
/// Computes the score the way Fla. Stat. 627.4145(5) states it. Counting
/// words, sentences and syllables follows the statute's rules; this is the
/// arithmetic only.
pub fn flesch_reading_ease(words: u32, sentences: u32, syllables: u32) -> f64 {
    if words == 0 || sentences == 0 {
        return 0.0;
    }
    let wps = f64::from(words) / f64::from(sentences);
    let spw = f64::from(syllables) / f64::from(words);
    206.835 - 1.015 * wps - 84.6 * spw
}

/// 45 in Florida for property-casualty forms, 40 under NAIC Model #575.
pub fn passes(score: f64, minimum: f64) -> bool {
    score >= minimum
}
```

## From Filing to Product Configuration

An approved filing has to become exactly what the system charges and issues, from the right date, for the right policies. The translation has four rules:

- **One product version per approved filing set.** The rate filing, the rule filing and the form filing for a product in a state may be separate SERFF filings with separate approvals; a product version goes live only when all of them that it depends on are approved for the same effective date.
- **New business and renewal dates are separate.** Departments often approve a change effective for new business on one date and renewals on another (commonly the renewal date is later, to allow for notice), so `products` carries both, as the core model's `effective_from` and `renewal_from` do.
- **Approved is not requested.** The department may approve a different overall change, cap individual increases, or strike a factor; the configuration is built from the approved exhibits, and the system stores both the requested and the approved change.
- **Every quote records the versions it used.** The rating worksheet stores the product, rate table and form versions and the filing tracking numbers behind them, so a market conduct examiner can rerate a sample and get the filed premium ([Market Conduct & Unfair Practices](/books/insurance/market-conduct#what-examiners-ask-a-system-to-produce) is what they ask for).

## How to Build It

The core model's `products` carries `rate_filing_id` and `form_filing_id`; this chapter defines the filings they point to, the objections and responses inside them, and the link from filings to the rate tables and forms they approved:

```sql
CREATE TABLE regulatory_filings (          -- one SERFF filing
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  insurer_id          UUID NOT NULL REFERENCES insurers (id),
  jurisdiction        TEXT NOT NULL REFERENCES jurisdictions (code),
  serff_tracking      TEXT UNIQUE,          -- the key regulators and the public use
  state_tracking      TEXT,                 -- the department's own number, if any
  line                TEXT NOT NULL,
  filing_type         TEXT NOT NULL CHECK (filing_type IN ('rate', 'rule', 'form',
                        'rate_rule', 'rate_rule_form', 'loss_cost_adoption', 'withdrawal')),
  regime              TEXT NOT NULL CHECK (regime IN ('prior_approval', 'file_and_use',
                        'use_and_file', 'flex', 'informational', 'exempt')),
  reference_filing_id UUID REFERENCES regulatory_filings (id),  -- the advisory filing
  requested_change_bp INT,                  -- overall change, basis points
  approved_change_bp  INT,
  requested_effective_new     DATE,
  requested_effective_renewal DATE,
  submitted_at        TIMESTAMPTZ,
  deemer_due_on       DATE,                 -- computed from the regime's rule row
  status              TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'pending_response',
                        'approved', 'approved_modified', 'deemed_approved', 'filed',
                        'disapproved', 'withdrawn')),
  disposed_at         TIMESTAMPTZ,
  effective_new       DATE,                 -- as approved
  effective_renewal   DATE,
  rule_ref            UUID REFERENCES jurisdiction_rules (id)  -- the regime and deemer rule
);

CREATE TABLE filing_objections (           -- the department's questions and the answers
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  filing_id           UUID NOT NULL REFERENCES regulatory_filings (id),
  sequence            INT NOT NULL,
  received_at         TIMESTAMPTZ NOT NULL,
  response_due_on     DATE,
  tolls_deemer        BOOLEAN NOT NULL,     -- false in Florida by statute
  objection_text      TEXT NOT NULL,
  responded_at        TIMESTAMPTZ,
  response_document_id UUID,                -- documents
  UNIQUE (filing_id, sequence)
);

CREATE TABLE filing_contents (             -- what a filing approved
  filing_id           UUID NOT NULL REFERENCES regulatory_filings (id),
  subject_type        TEXT NOT NULL CHECK (subject_type IN ('rate_table', 'form',
                        'rule', 'lcm')),
  subject_id          UUID NOT NULL,        -- rate_tables, forms, ...
  subject_version     INT NOT NULL,
  PRIMARY KEY (filing_id, subject_type, subject_id, subject_version)
);

CREATE TABLE loss_cost_multipliers (       -- an insurer's adoption of advisory loss costs
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  filing_id           UUID NOT NULL REFERENCES regulatory_filings (id),
  scope               JSONB NOT NULL,       -- line, subline, territory, class codes
  modification_factor NUMERIC(6,4) NOT NULL,  -- 0.9500
  expense_provisions  JSONB NOT NULL,       -- commission, acquisition, general, taxes, profit
  formula_lcm         NUMERIC(8,4) NOT NULL,
  selected_lcm        NUMERIC(8,4) NOT NULL,
  applies_to_future   BOOLEAN NOT NULL,     -- the rule-of-application election
  effective           DATERANGE NOT NULL
);
```

A filing's status follows a short lifecycle: `draft` to `submitted`; `submitted` to `pending_response` when an objection arrives and back when it is answered; then one terminal disposition (`approved`, `approved_modified`, `deemed_approved`, `filed`, `disapproved` or `withdrawn`). Two jobs run against it. The **deemer job** computes `deemer_due_on` from the jurisdiction's rule row and the submission date (and objections that toll it, where the state's law says they do), and flags a filing whose deemer date passed without a disposition, which under Florida's or California's law is an approval the insurer may rely on. The **go-live job** refuses to activate a product version unless every filing in its `filing_contents` is in an approved state for that effective date, and for use-and-file filings opens a task due 30 days after the effective date (in Florida) to file.

## Auditing

- **Every product version tied to its filings,** by SERFF tracking number, with the approved (not requested) change and effective dates for new business and renewals.
- **Every objection and response** with dates, so the deemer computation and the filing's history can be shown.
- **Every quote's rating worksheet** naming the product, rate table, rule and form versions, so any premium can be rerated from the filed tables.
- **LCM adoptions and their rule of application,** because an automatically applied LCM means the insurer's rates changed on the advisory organization's effective date without a new filing of its own.
- **Use-and-file refund exposure:** policies written on a use-and-file rate before disposition, so a refund order can be computed per policyholder.

## What This Means for the System You Build

- **Key every product version to the filings that approved it,** and refuse to activate one whose filings aren't all approved for the date.
- **Store new business and renewal effective dates separately,** and the approved change beside the requested one.
- **Compute deemer dates from jurisdiction rule rows,** including whether objections toll them, and alert before they pass.
- **Model advisory loss costs and the insurer's LCM as two filings** that multiply into one rate table, each with its own date.
- **Score form readability at authoring time** against each state's minimum, and keep the officer's certification with the filing.
- **Keep the filing tracking numbers on every rating worksheet,** so the rate charged can always be traced to the rate filed.

## References

**Law and regulation**

- [Fla. Stat. 627.062](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.062.html), file-and-use 90 days before the effective date, use-and-file within 30 days after, the 90-day deemer, the fifteen rating factors, hurricane models accepted by the Commission, excessive profits, refunds, and the 3% and 15% limits on reinsurance filings
- [Fla. Stat. 627.4145](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.4145.html), the 45 Flesch reading ease minimum, the formula, scoring of long policies, the officer's certification, forms filed on or after October 1, 1983
- [Cal. Ins. Code 1861.05 (public mirror)](https://california.public.law/codes/insurance_code_section_1861.05), the rate standard, burden of proof, 60-day deemer, the 7% personal lines and 15% commercial hearing triggers, and the 180-day deemer
- [Cal. Ins. Code 1861.10 (public mirror)](https://california.public.law/codes/insurance_code_section_1861.10), intervention by any person and compensation for a substantial contribution
- [Cal. Ins. Code 1861.01 (public mirror)](https://california.public.law/codes/insurance_code_section_1861.01), the Proposition 103 rollback to at least 20% below November 1987 rates
- [N.Y. Ins. Law 2344](https://www.nysenate.gov/legislation/laws/ISC/2344), flex rating limits set annually, the 30-day deemer for changes beyond them, and the 2029 expiry
- [Tex. Ins. Code 2251.101](https://texas.public.law/statutes/tex._ins._code_section_2251.101), use of a rate on and after filing and the large commercial exemption thresholds
- [N.J.A.C. 11:13-8.4](https://www.law.cornell.edu/regulations/new-jersey/N-J-A-C-11-13-8-4), final rates as loss costs combined with the LCM, automatic application to later loss cost filings, and 30-day filing deadlines
- [15 USC 1012](https://www.law.cornell.edu/uscode/text/15/1012), the antitrust proviso that applies federal antitrust law only where states don't regulate

**NAIC**

- [NAIC: SERFF](https://content.naic.org/industry/serff), SERFF as the filing channel, the modernization project, and SERFF Filing Access by participating state and the Interstate Compact
- [NAIC: Calculation of Company Loss Cost Multiplier form, effective November 8, 2022 (PDF)](https://content.naic.org/sites/default/files/lcm-form-110822%20final.pdf), the declaration, rule of application, loss cost modification, expense provisions, permissible loss ratio, formula LCM and percent change
- [NAIC: Life and Health Insurance Policy Language Simplification Model Act (#575, PDF)](https://content.naic.org/sites/default/files/model-law-575.pdf), the Flesch 40 minimum and ten point type

**Regulators and guidance**

- [California Department of Insurance: Sustainable Insurance Strategy summary, October 14, 2025 (PDF)](https://www.insurance.ca.gov/01-consumers/180-climate-change/upload/Sustainable-Insurance-Strategy-CDI-Summary-10-14-25.pdf), intervenor reform and shorter rate review timelines alongside catastrophe models and reinsurance costs in rates

**Filings**

- [Progressive: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/80661/000008066126000086/pgr-20251231.htm), use and file, file and use and prior approval regimes, rate of return limits, and prior approval to withdraw a line
- [Travelers: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/86312/000008631226000065/trv-20251231.htm), about half the states requiring prior approval of most rate changes
