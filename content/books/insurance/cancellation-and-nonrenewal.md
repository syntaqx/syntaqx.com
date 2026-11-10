+++
title = "Cancellation, Nonrenewal & Notice Law"
nav_title = "Cancellation & Notices"
description = "Who may cancel and when, notice days by state and reason, proof of mailing, a notice-date calculation, pro rata vs short rate refunds, and reinstatement."
category = "Insurance Industry"
order = 2727
part = "Policy Administration"
tags = ["insurance", "policy-administration", "cancellation", "nonrenewal", "notice-law", "return-premium"]
+++

An insured can end a policy whenever they like. An insurer can't. Every state limits why an insurer may cancel a personal auto or homeowners policy midterm, how much notice it must give, how the notice must be delivered and proved, what reasons it must state, and how much premium it must return; most also limit why and with how much notice it may decline to renew. The rules differ by state, by line, by reason (nonpayment gets the shortest notice almost everywhere) and by how long the policy has been in force (the first 60 days are often an underwriting period with fewer restrictions). A notice mailed a day late is not a notice: the cancellation fails, coverage continues, and a claim in the gap is covered. That is why cancellation and nonrenewal are the most deadline-dense code in a policy system, and why the dates must be computed from rules with citations, stored, and proven.

This chapter covers who may cancel and on what grounds, notice periods by state and reason with a worked calculation across states, proof of mailing and electronic delivery, return premium (pro rata versus short rate, with the numbers), reinstatement and lapse, and notices to lienholders and mortgagees. Premium finance cancellations, which run through a finance company's power of attorney, are in [Billing & Premium Finance](/books/insurance/billing-and-premium-finance); renewal offers and conditional renewal are in [Endorsements, Renewals & the Policy Transaction Model](/books/insurance/endorsements-and-renewals#renewals).

## How the Platforms Do It

As of November 2026, from public documentation:

| Platform | Cancellation model |
| --- | --- |
| **Guidewire PolicyCenter** | A cancellation is "a policy transaction that terminates an existing policy prior to its expiration date," started with a reason code, a source (such as carrier) and an effective date, and created in the Quoted state; it can bind now, or be scheduled with `pending-cancel` for a future date and then rescheduled, rescinded or withdrawn; reinstatement is its own job |
| **Socotra** | Cancellation and Reinstatement are transaction types, alongside Reversal |
| **North Carolina Rate Bureau** | The bureau's amendatory endorsement sets the refund method (short rate when the insured or a premium finance company cancels, pro rata when the insurer cancels) and nonrenewal notice periods; the manual carries pro rata and short rate tables |

The model the vendors share, and the one to copy: a cancellation is a transaction with a source (insured, insurer, finance company), a reason, and an effective date that is computed from the notice rule when the insurer initiates it; a pending cancellation is a scheduled transaction that payment can rescind; and the notice is a document with its own deadline and proof.

## Who May Cancel, and When

**The insured** may cancel at any time, effective on the date requested (not earlier than the request, in most programs), and gets the refund the contract and state law allow.

**The insurer** may cancel only on the grounds the state permits, after the notice the state requires:

- **Texas** (personal auto, homeowners, farm and ranch owners, one- and two-family dwelling fire and some public entity policies): any policy may be cancelled for nonpayment of premium when due, a fraudulent claim, or a department determination that continuing it would violate the law; any policy except personal auto for an increase in a hazard within the insured's control that would raise the premium; personal auto for suspension or revocation of the license or registration of the named insured or a regular driver. Such a cancellation "does not take effect until the 10th day after the date the insurer mails notice." A personal auto policy may also be cancelled effective on a 12-month anniversary of its original effective date with at least 60 days' notice (Tex. Ins. Code 551.102, 551.104).
- **New York** (personal auto and personal lines): in the first 60 days, for a stated specific reason; after that, auto only for nonpayment, license suspension or revocation during the required policy period, or fraud or material misrepresentation, and personal lines only for nonpayment, conviction of a crime increasing the hazard, fraud or misrepresentation, willful or reckless acts increasing the hazard, physical changes making the property uninsurable, or a superintendent's determination. The required policy period is one year for auto and three years for personal lines, and a personal lines nonrenewal generally can't take effect inside it except on a cancellation ground (N.Y. Ins. Law 3425).
- **Florida** (personal auto): cancellation must rest on a statutory ground; the license or registration suspension ground does not apply to a new policy in effect fewer than 60 days. For residential property, after the first 60 days only for material misstatement, nonpayment, failure to meet pre-coverage underwriting requirements within 60 days, substantial change in risk, or an entire class (Fla. Stat. 627.728(2), 627.4133(2)(b)).
- **California** (auto): a cancellation is effective only on listed grounds, among them nonpayment, suspension or revocation of the license of the named insured or a household driver, and fraud or material misrepresentation (Ins. Code 661). Residential property in effect 60 days or renewed may be cancelled for nonpayment, conviction of a crime increasing a hazard, discovered fraud or material misrepresentation, discovered gross negligence increasing a hazard, or physical changes making the property uninsurable (Ins. Code 675, 676).

**Nonrenewal** is less restricted than cancellation but not free. Florida bars nonrenewing auto "for reasons based entirely on the sex, occupation, marital status," residence, military service or age of the insured, on race, color, creed or national origin, or "for any reason which is arbitrary or capricious" (627.728(4)(c)). New York caps auto nonrenewals and conditional renewals each calendar year at "two percent of the total number of covered policies" per rating territory, with one more allowed for every two new policies voluntarily written in the territory (3425(f)). A cap like that is a portfolio constraint the renewal job must check before it sends a nonrenewal, not a per-policy rule.

## Notice Periods by State and Reason

The notice periods, each from the state's statute or the bureau form, as of November 2026:

| State | Line | Cancellation: nonpayment | Cancellation: other | Nonrenewal |
| --- | --- | --- | --- | --- |
| **Florida** | Personal auto | At least 10 days | At least 45 days | At least 45 days |
| **Florida** | Personal residential property | At least 10 days | 20 days in the first 60 days; otherwise at least 120 days | At least 120 days; renewal premium notice at least 45 days |
| **Florida** | Other P&C and workers' comp | 10 days | 20 days in the first 60 days; otherwise at least 45 days | At least 45 days |
| **Texas** | Personal auto, homeowners, dwelling | Effective no earlier than the 10th day after mailing | Same 10th day; 60 days for a personal auto anniversary cancellation | Renew on request unless notice mailed by the 60th day before expiration |
| **California** | Auto | At least 10 days | At least 20 days | At least 30 days (renewal offer at least 20) |
| **California** | Residential property | At least 10 calendar days (also for fraud) | At least 20 calendar days | At least 75 days for policies expiring on or after July 1, 2020 (renewal offer at least 45) |
| **California** | Commercial (675.5 policies) | At least 10 days (also for fraud) | At least 30 days | Not covered here |
| **New York** | Personal auto | 15 days; payment within 15 days after mailing is timely | At least 20 days after mailing; specific reasons in the first 60 days, listed grounds after | 45 to 60 days before the end of the period (at least 20 days for other than a natural person's non-business vehicle) |
| **New York** | Other personal lines | Payment within 15 days after mailing is timely | Specific reasons in the first 60 days; listed grounds after | 45 to 60 days before the end of the period |
| **New York** | Commercial | 15 days after mailing (after the first 60 days), stating the amount due | 20 days in the first 60 days; 15 days after, on listed grounds | 60 to 120 days (30 for excess and jumbo risks) |
| **North Carolina** | Personal auto: liability, medical payments, UM/UIM | At least 15 days | 60 days | At least 60 days |
| **North Carolina** | Personal auto: other coverages | At least 10 days | At least 10 days | At least 10 days |

New York's personal lines cancellation notice days are not in 3425 (which sets grounds, reasons, the 15-day payment window and proof). For auto they come from the Vehicle and Traffic Law: cancellation takes effect at least 20 days after mailing, with 15 days enough for nonpayment, and the insurer files the termination with the motor vehicle commissioner within 30 days after it takes effect ([N.Y. VTL 313](https://www.nysenate.gov/legislation/laws/VAT/313)). For homeowners and other personal lines the days come from the department's regulations, which I have not opened.<!-- source-gap: ny-ca-cancel-days | missing | New York homeowners and other non-auto personal lines cancellation notice days (11 NYCRR) | closes with: the regulation text | checked: 2026-11-10 -->

## A Notice-Date Calculation Across States

Two worked examples, mine, using the rules above. "At least N days before" an effective date means the notice is mailed no later than the effective date minus N days; "the Nth day after mailing" means the earliest effective date is mailing plus N.

**Nonrenewal of a homeowners policy expiring 12:01 a.m. June 1, 2027:**

| State | Rule | Latest mailing date |
| --- | --- | --- |
| Florida | At least 120 days before | February 1, 2027 |
| California | At least 75 days before | March 18, 2027 |
| Texas | By the 60th day before | April 2, 2027 |
| New York | 45 to 60 days before | No earlier than April 2 and no later than April 17, 2027 |

A carrier writing all four states runs its homeowners nonrenewal underwriting at least four months before expiration in Florida and can wait until mid-April in New York, but in New York it also can't mail early: a notice mailed March 25 is outside the window. And a renewal job that creates renewals 60 days ahead, fine for Texas, has already missed Florida and California. My rule: **the renewal lead time is the longest notice period the product's states can need, plus processing time**, computed from the rule table, not chosen by feel.

**Nonpayment cancellation of a personal auto policy, notice mailed Wednesday, March 3, 2027:**

| State | Rule | Earliest effective date |
| --- | --- | --- |
| Florida | At least 10 days | March 13, 2027 |
| Texas | Not until the 10th day after mailing | March 13, 2027 |
| California | At least 10 days | March 13, 2027 |
| North Carolina (liability) | At least 15 days | March 18, 2027 |
| New York | Payment within 15 days after mailing is timely | Payment received through March 18 cures it |

The effective time is the policy's 12:01 a.m. at the risk on that date unless the state or form says otherwise, and the notice states the date and time. A cancellation notice computed to the minimum is fragile: a mail vendor that posts a day late breaks it. A carrier that adds a buffer of a few days should keep it in the product configuration, separate from the legal minimum, so an audit can see both.

The calculator is small; the rule data is the hard part:

```go tab="Go"
type NoticeRule struct {
	Days      int    // statutory days
	Mode      string // "before_effective" or "after_mailing"
	MailDays  int    // days a rule adds for mailing, if any
	Buffer    int    // the carrier's own margin, configured separately
	Citation  string // "Fla. Stat. 627.4133(2)(b)", ...
}

// MailBy returns the latest date a notice may be mailed for an action effective on eff.
func MailBy(r NoticeRule, eff time.Time) time.Time {
	return eff.AddDate(0, 0, -(r.Days + r.MailDays + r.Buffer))
}

// EarliestEffective returns the first date an action may take effect for a notice mailed on mailed.
func EarliestEffective(r NoticeRule, mailed time.Time) time.Time {
	return mailed.AddDate(0, 0, r.Days+r.MailDays+r.Buffer)
}

// MailBy(NoticeRule{Days: 120, Mode: "before_effective"}, June 1 2027) == February 1 2027
```

```rust tab="Rust"
use chrono::{Days, NaiveDate};

pub struct NoticeRule {
    pub days: u64,          // statutory days
    pub mail_days: u64,     // days a rule adds for mailing, if any
    pub buffer: u64,        // the carrier's own margin, configured separately
    pub citation: &'static str,
}

/// Latest date a notice may be mailed for an action effective on `eff`.
pub fn mail_by(r: &NoticeRule, eff: NaiveDate) -> NaiveDate {
    eff - Days::new(r.days + r.mail_days + r.buffer)
}

/// First date an action may take effect for a notice mailed on `mailed`.
pub fn earliest_effective(r: &NoticeRule, mailed: NaiveDate) -> NaiveDate {
    mailed + Days::new(r.days + r.mail_days + r.buffer)
}

// mail_by(&NoticeRule { days: 120, .. }, 2027-06-01) == 2027-02-01
```

Calendar days are the norm in these statutes; a rule that counts business days (Texas's premium finance rule gives the insurer until the 2nd business day to notify third parties) needs a holiday calendar per state, which is another table.

## Proof of Mailing and Delivery

Cancellation law is mailing law. New York: mailing to the named insured at the policy address "shall be sufficient proof of the giving of notice," a notice missing a required provision isn't effective, and a copy goes to the agent or broker "within seven days of the time such notice is mailed to the named insured" (3425(h)). Florida accepts "United States postal proof of mailing, certified or registered mailing" as sufficient proof (627.728(5)). Texas counts from the date the insurer mails. California's commercial cancellation rule applies the Code of Civil Procedure's mailing rules (677.2), and its auto rule requires notice to the named insured, lienholder or additional interest (662). Electronic delivery can substitute where the state's e-commerce law allows it: NCOIL's model treats proper electronic delivery as equivalent to certified mail or a certificate of mailing, with consent, receipt measures and a paper fallback ([Quote, Bind & Issue](/books/insurance/quote-bind-and-issue)).

What the system keeps for each notice: the rendered notice, the address used and where it came from (the policy address as of the mailing date), the mail vendor's batch and acceptance record or the USPS certificate of mailing (or the e-delivery consent and provider receipt), the date and time mailed, the agent copy and its date, and the computed deadline with the rule that set it. Returned mail is a signal the renewal and billing teams need, whatever its legal effect in the state.

## Return Premium: Pro Rata and Short Rate

When a policy cancels midterm, the unearned premium goes back. **Pro rata** returns exactly the unearned share. **Short rate** returns less, keeping a penalty for early cancellation, by a table or a percentage. The usual rule, and North Carolina's amendatory endorsement states it in the contract: "If the named insured or a premium finance company cancels this policy, the premium owed or premium refund due will be calculated according to the short rate provisions contained in our manuals. If we cancel this policy, any premium owed or premium refund will be calculated on a pro-rata basis." The NCRB manual carries one-year, three-month and six-month short rate tables. States limit the penalty: Florida prohibits short rate tables or procedures that return less than 90% of the pro rata unearned premium without actuarial or other justification, and prohibits fully earned premium provisions except for specialized, short-term coverage (crop hail, flood, events) and minimum premium policies (Fla. Admin. Code 69O-170.010). California requires pro rata, not short rate, when a financed policy is cancelled, with exceptions (Ins. Code 673(g)).

A worked refund, mine, on the $1,444 annual policy from [How a Rate Is Built](/books/insurance/how-a-rate-is-built), effective January 1, 2027. Cancellation effective August 20, 2027: 231 days used, 134 days unearned.

| Cancelled by | Method | Return premium |
| --- | --- | --- |
| Insurer (nonpayment, underwriting) | Pro rata | $1,444 × 134 / 365 = **$530.13** |
| Insured, in Florida, on a short rate procedure | At least 90% of pro rata | At least **$477.11** |
| Insured, on a filed short rate table | The table's factor for 231 days | Per the filed table |
| Premium finance company in New York, 20 days into the term | Pro rata to the finance company, less minimum earned | Earned pro rata is $79.12, below the minimum of the greater of 10% ($144.40) or $60, so the insurer keeps $144.40 and returns **$1,299.60** |

The last row is New York Banking Law 576: the insurer returns gross unearned premium, computed pro rata, to the finance agency within 60 days after the effective date of cancellation, and may retain a minimum earned premium of 10% of the gross premium or $60, whichever is greater ([Billing & Premium Finance](/books/insurance/billing-and-premium-finance)). Return premium is a set of negative `premium_entries` on the cancellation transaction, each with its earning window, and the refund itself is a billing event: it may first apply to an outstanding balance, and it carries a commission clawback ([Commissions & Agency Accounting](/books/insurance/commissions-and-agency-accounting)). Policy fees and inspection fees that the state treats as fully earned stay out of the refund, which is why fees are separate entry kinds in the foundation model.

## Reinstatement and Lapse

A **reinstatement** puts a cancelled policy back in force, usually with no gap if the insured pays before or soon after the cancellation date. Rules vary: North Carolina's manual says that if an auto or coverage cancelled at the insured's request is reinstated within 30 days, "the premium shall be the same as the amount that was returned at the time of cancellation"; California requires an insurer to accept or reject a reinstatement request after a finance company cancellation within 15 days (Ins. Code 673(k)); Guidewire and Socotra both model reinstatement as its own transaction. If the insurer reinstates with a gap, the reinstatement's effective date is later than the cancellation's, and the policy version for the gap has no coverage, which a claim on a gap date must see. My rule: **a reinstatement is a new transaction, never the deletion of the cancellation**, and with a gap it records a no-known-loss statement for the gap.

A **lapse** is the end of coverage because a renewal wasn't paid, not because anyone cancelled. It needs no cancellation notice in most states (the expiration was on the declarations) but often has a grace rule: the NFIP's flood policy requires the renewal premium within 30 days of the expiration date. Lapse status matters downstream: state insurance verification systems for auto, mortgagees and lenders, and the next insurer's prior insurance question.

## Lienholders and Mortgagees

A lender with an interest in the property gets its own notice. California's auto cancellation notice must be mailed or delivered "to the named insured, lienholder, or additional interest" at least 20 days before (10 for nonpayment) (Ins. Code 662). When a premium finance company cancels, Texas requires the insurer to give any notice owed to a governmental agency, mortgagee or other third party on or before the 2nd business day after receiving the finance company's notice, and to set the effective date to allow for it (Tex. Ins. Code 651.161(f)); New York's finance law has the insurer honor any longer notice period owed to third parties (Banking Law 576(1)(e)). On the lender's side, a mortgage servicer that doesn't receive proof of coverage may force-place hazard insurance after two notices, 45 and 15 days ahead ([Mortgage Servicing](/books/banking-and-lending/mortgage-servicing#force-placed-insurance); the property side is [Property Tech](/books/property-tech/insurance-deposits-and-guarantees#master-and-force-placed-policies)). For the policy system, every mortgagee, lienholder and additional interest is a `party_roles` row with its own notice address and its own notice rules, and a cancellation computes one notice per interest, each with its own deadline: the effective date is the latest of them.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `policy_transactions` (`kind` cancellation, reinstatement, nonrenewal; `reason`), `party_roles`, `premium_entries`, and `documents` ([Quote, Bind & Issue](/books/insurance/quote-bind-and-issue)). This chapter defines `notice_rules` and `notices`.

```sql
CREATE TABLE notice_rules (                -- the law, as data, with its citation
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  state              TEXT NOT NULL,
  lines              TEXT[] NOT NULL,       -- 'personal_auto', 'homeowners', 'commercial', ...
  coverage_codes     TEXT[],                -- NC: liability coverages differ from others
  action             TEXT NOT NULL CHECK (action IN ('cancellation', 'nonrenewal',
                       'conditional_renewal', 'renewal_offer', 'renewal_premium',
                       'premium_finance_intent')),
  reason_class       TEXT,                  -- 'nonpayment', 'underwriting_period', 'other', ...
  policy_age_max_days INT,                  -- applies while in force fewer than N days
  recipient          TEXT NOT NULL CHECK (recipient IN ('named_insured', 'lienholder',
                       'mortgagee', 'additional_interest', 'agent', 'finance_company')),
  mode               TEXT NOT NULL CHECK (mode IN ('before_effective', 'after_mailing',
                       'window_before_effective', 'within_days_after_mailing')),
  min_days           INT NOT NULL,
  max_days           INT,                   -- NY: no more than 60 days before
  mail_days          INT NOT NULL DEFAULT 0,
  business_days      BOOLEAN NOT NULL DEFAULT FALSE,
  must_state_reason  BOOLEAN NOT NULL,
  delivery_methods   TEXT[] NOT NULL,       -- 'first_class', 'certificate_of_mailing',
                                            -- 'certified', 'electronic_with_consent'
  late_consequence   TEXT,                  -- 'continue_30_days', 'renew_on_request', ...
  citation           TEXT NOT NULL,         -- 'Fla. Stat. 627.4133(2)(b)'
  source_url         TEXT NOT NULL,
  effective_from     DATE NOT NULL,         -- e.g. CA 678(c): expiring on or after 2020-07-01
  effective_to       DATE,
  checked_on         DATE NOT NULL
);

CREATE TABLE notices (                     -- each required notice, its deadline and proof
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  transaction_id     UUID REFERENCES policy_transactions (id),  -- the pending action
  notice_rule_id     UUID NOT NULL REFERENCES notice_rules (id),
  recipient_party_id UUID NOT NULL REFERENCES parties (id),
  action_effective_at TIMESTAMPTZ NOT NULL,
  must_mail_by       DATE,                  -- computed for before_effective rules
  may_mail_from      DATE,                  -- computed for windows (NY 45 to 60 days)
  carrier_buffer_days INT NOT NULL DEFAULT 0,
  reasons            TEXT[],
  document_id        UUID NOT NULL,         -- documents: the notice as rendered
  mailed_at          TIMESTAMPTZ,
  proof              JSONB,                 -- certificate of mailing, vendor batch, e-delivery receipt
  agent_copy_sent_at TIMESTAMPTZ,           -- NY: within seven days
  deadline_met       BOOLEAN GENERATED ALWAYS AS
                       (mailed_at IS NOT NULL AND must_mail_by IS NOT NULL
                        AND mailed_at::date <= must_mail_by) STORED,
  returned_at        TIMESTAMPTZ,
  rescinded_at       TIMESTAMPTZ            -- payment cured, cancellation withdrawn
);
```

An insurer-initiated cancellation is computed backward from the rules: for each recipient, find the governing rule (state, line, coverage, action, reason, policy age, effective date), compute the earliest lawful effective date from the planned mailing date, and set the cancellation's effective date to the latest across recipients. The pending transaction and its notices are created together; payment received before the effective date rescinds both. A daily job finds notices about to miss their date:

```sql
SELECT n.id, n.policy_id, n.must_mail_by, r.citation
FROM notices n
JOIN notice_rules r ON r.id = n.notice_rule_id
WHERE n.mailed_at IS NULL
  AND n.rescinded_at IS NULL
  AND n.must_mail_by <= CURRENT_DATE + 2
ORDER BY n.must_mail_by;
```

Design choices:

- **The cancellation date is derived from the notice, never typed.** A user can choose a later date; the system refuses an earlier one.
- **Rules are versioned with effective dates and recheck dates,** like rating factor rules, and the product's amendatory endorsement is tested against them ([Products, Coverages & Forms](/books/insurance/products-and-coverages)).
- **Return premium uses the method the source implies** (insured, insurer, finance company) and the state floor, computed from premium entries, with fees by their earning rule.
- **Portfolio caps run before mailing:** New York's 2% per territory nonrenewal cap is a count the renewal job checks.

## Auditing

- **Every notice with the rule, deadline, buffer, mailing time, proof, recipient address and agent copy;** `deadline_met` false is an incident, and the cancellation it supported must be reviewed.
- **Every cancellation with its source, reason, grounds, notices and computed effective date,** and the refund method and amounts.
- **Every reinstatement with its gap, if any,** and the no-known-loss statement.
- **Every nonrenewal counted against any cap** and checked against prohibited bases.
- **Every rule with its citation, effective window and the date someone last reread the statute.**

## What This Means for the System You Build

- **Encode notice law as rules with citations and effective dates** by state, line, coverage, action, reason, recipient and policy age.
- **Compute cancellation dates from the notices,** one per recipient, taking the latest; never accept an earlier typed date.
- **Keep proof of mailing for every notice,** or the e-delivery consent and receipt that substitutes for it.
- **Return premium by the method the canceller and the state require** (pro rata, short rate with floors, finance company minimums), from entries.
- **Make reinstatement a transaction** and record any gap.
- **Set renewal lead times from the longest notice period in the product's states.**

## References

**Law and regulation**

- [Fla. Stat. 627.728](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.728.html), personal auto cancellation grounds, 10 and 45 days' notice, 45 days' nonrenewal notice, prohibited nonrenewal bases and proof of mailing
- [Fla. Stat. 627.4133](https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.4133.html), 45 days for other P&C, 120 days for residential nonrenewal and cancellation, 10 days for nonpayment, 20 days in the first 60 days, and hurricane extensions
- [12 CFR 1024.37](https://www.law.cornell.edu/cfr/text/12/1024.37), a mortgage servicer's force-placed insurance notices 45 and 15 days before charging
- [Fla. Admin. Code 69O-170.010](https://www.law.cornell.edu/regulations/florida/Fla-Admin-Code-Ann-R-69O-170-010), short rate returning less than 90% of pro rata prohibited without justification, and fully earned premium limits
- [Tex. Ins. Code 551.104](https://texas.public.law/statutes/tex._ins._code_section_551.104), cancellation grounds, the 10th day after mailing, anniversary cancellation with 60 days' notice and the first-60-day rules
- [Tex. Ins. Code 551.105](https://texas.public.law/statutes/tex._ins._code_section_551.105), nonrenewal or notice of change by the 60th day before expiration
- [Tex. Ins. Code 551.102](https://texas.public.law/statutes/tex._ins._code_section_551.102), the policies the cancellation and nonrenewal subchapter covers
- [Tex. Ins. Code 651.161](https://texas.public.law/statutes/tex._ins._code_section_651.161), third-party notices by the 2nd business day after a finance company's cancellation
- [N.Y. Ins. Law 3425](https://www.nysenate.gov/legislation/laws/ISC/3425), personal lines cancellation grounds, required policy periods, the 15-day payment window, 45 to 60 day nonrenewal notices, the 2% territory cap, proof of mailing and agent copies
- [N.Y. Ins. Law 3426](https://www.nysenate.gov/legislation/laws/ISC/3426), commercial cancellation in and after the first 60 days, nonpayment notices with the amount due, and 60 to 120 day nonrenewal notices
- [N.Y. Vehicle and Traffic Law 313](https://www.nysenate.gov/legislation/laws/VAT/313), auto cancellation 20 days after mailing (15 for nonpayment), nonrenewal notice periods and the 30-day termination filing
- [N.Y. Banking Law 576](https://www.nysenate.gov/legislation/laws/BNK/576), pro rata return of gross unearned premium to the finance agency within 60 days and the 10% or $60 minimum earned premium
- [Cal. Ins. Code 661 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-661/), auto cancellation grounds
- [Cal. Ins. Code 662 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-662/), auto cancellation notice of 20 days, 10 for nonpayment, to the named insured, lienholder or additional interest
- [Cal. Ins. Code 663 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-663/), auto nonrenewal notice of 30 days
- [Cal. Ins. Code 676 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-676/), residential cancellation grounds after 60 days
- [Cal. Ins. Code 677.4](https://california.public.law/codes/insurance_code_section_677.4), residential (675 policy) cancellation notice of 20 calendar days, 10 for nonpayment or fraud
- [Cal. Ins. Code 677.2 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-677-2/), commercial cancellation notice of 30 days, 10 for nonpayment or fraud, and mailing rules
- [Cal. Ins. Code 678 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-678/), residential nonrenewal of 75 days and renewal offers of 45 days
- [Cal. Ins. Code 673 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-673/), pro rata return on financed policy cancellations and 15-day reinstatement replies
- [44 CFR Appendix A(1) to Part 61](https://www.law.cornell.edu/cfr/text/44/appendix-A(1)_to_part_61), the flood policy's 30-day renewal payment rule

**Regulators and guidance**

- [North Carolina Department of Insurance: FAQs About Auto Insurance](https://www.ncdoi.gov/consumers/auto-and-vehicle-insurance/faqs-about-auto-insurance), cancellation notice of 15 days for nonpayment and 60 days otherwise for liability, medical payments and UM/UIM, and 10 days for other coverages

**Filings**

- [North Carolina Rate Bureau: Circular A-26-2 (PDF)](https://www.ncrb.org/Portals/0/ncrb/circular%20letters/automobile/2026/A-26-2%202026%20NC%20Personal%20Auto%20Rate%20Review%20and%20Program%20Changes.pdf?ver=8EeBogwTkuRGXminwAqqlw%3d%3d), the amendatory endorsement's short rate and pro rata refund provisions and 60-day and 10-day nonrenewal notices, the manual's short rate tables, and Rule 9's reinstatement within 30 days

**Standards**

- [NCOIL: Insurance E-Commerce Model Act (PDF)](https://ncoil.org/wp-content/uploads/2023/02/NCOIL-E-Commerce-Model-FINAL-3-8-20.pdf), electronic delivery as equivalent to certified mail and certificates of mailing

**Vendor documentation**

- [Guidewire: Cancellations (PolicyCenter Cloud API)](https://docs.guidewire.com/cloud/pc/202507/cloudapibf/cloudAPI/topics/122-PCjobTypes/04-cancellations-reinstatements/c_cancellations.html), reason codes, sources, effective dates, and scheduling, rescheduling, rescinding and withdrawing cancellations
- [Socotra: Policy transactions](https://docs.socotra.com/features/policy-management/policy-transactions), cancellation and reinstatement transaction types
