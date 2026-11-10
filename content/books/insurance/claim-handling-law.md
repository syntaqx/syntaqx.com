+++
title = "Claim Handling Law & Clocks"
nav_title = "Claim Law & Clocks"
description = "The NAIC unfair claims models, state claim deadlines in CA, TX, FL and NY computed on one claim, catastrophe extensions, Texas 542 interest, adjuster licenses."
category = "Insurance Industry"
order = 2730
part = "Claims"
tags = ["insurance", "claims", "claim-handling", "unfair-claims-practices", "deadlines", "prompt-payment"]
+++

Every state tells insurers how fast to handle a claim, and almost none of them say it the same way. One rule counts calendar days from the notice of claim, another counts business days from the receipt of the last document the insurer asked for, a third runs from the proof of loss, a fourth from the day the insurer accepted the claim; one extends every deadline 15 days after a declared weather catastrophe, another stops the clock while the policyholder sits on a document request; one makes late payment cost 18% a year, another makes it a market conduct finding with no private remedy at all. The insurer that writes in many states doesn't get to pick the strictest rule and apply it everywhere, because the rules don't nest: the shortest clock in one state starts from an event that another state's clock ignores.

That is why a claims system's diary is a rules engine. This chapter covers the NAIC's unfair claims settlement practices act and model regulation that most states' rules descend from, the deadlines in California, Texas, Florida and New York with one claim worked through all of them, catastrophe extensions and tolling, the Texas prompt payment interest with numbers, adjuster licensing as it touches the claim file, and how to build the diary so every deadline is computed from a cited rule and the event that started it. Coverage positions and denials are in [First Notice, Coverage & Triage](/books/insurance/first-notice-and-triage#coverage-positions-reservations-of-rights-and-denials); bad faith, where a missed clock becomes damages, is in [Bad Faith & Litigation](/books/insurance/bad-faith-and-litigation).

## The Rules at a Glance

As of November 2026, from the statutes and regulations as published (each opened for this chapter):

| Rule | Acknowledge | Decide | If more time is needed | Pay | Counting |
| --- | --- | --- | --- | --- | --- |
| **NAIC Model 902** | 15 days from notification, unless paid | 21 days after proof of loss (first party) | Notice within 21 days, then a letter at 45 days from notification and every 45 days | 30 days after affirming liability, if the amount is determined and undisputed | Calendar days |
| **California, 10 CCR 2695.5 and 2695.7** | 15 days from notice: acknowledge, send forms, begin investigation | 40 days after proof of claim | Written notice within the 40 days, then every 30 days | 30 days after acceptance | Calendar days, weekends and holidays included |
| **Texas, Ins. Code 542.055-.058** | 15 days from notice: acknowledge, begin investigation, request items (30 business days for eligible surplus lines insurers) | 15 business days after receiving all items (30 days if arson is suspected) | Notice within the same period, then decide within 45 days | 5 business days after notice of acceptance (20 for surplus lines); 60 days after all items before 542.060 damages run | Business days exclude weekends and Texas holidays |
| **Florida, Stat. 627.70131** (residential and small commercial property) | 7 days from any claim communication | Pay or deny within 60 days of notice of the initial, reopened or supplemental claim | Begin investigating within 7 days and inspect within 30 days of proof of loss; send any detailed estimate within 7 days | Within the 60 days; late payment bears statutory interest from the notice date | Calendar days |
| **New York, 11 NYCRR 216.4 and 216.6** | 15 business days | 15 business days after proof of loss (30 for suspected arson) | Notice within 15 business days, then status every 90 days | 5 business days after receiving the settlement agreement | Business days |

Two things stand out. The **starting events differ**: notice, proof of loss, "all items, statements, and forms required by the insurer," acceptance, a settlement agreement, the generation of an estimate. And the **units differ**: calendar days in California and Florida, business days with a state holiday calendar in Texas and New York. A rule engine that stores "15 days" without the unit and the event is wrong in at least two of these states.

## The Unfair Claims Settlement Practices Act

NAIC's **Unfair Claims Settlement Practices Act (Model 900)** was adopted as a free-standing act in June 1990, separating claims practices from the Unfair Trade Practices Act. It excludes workers' compensation, fidelity, suretyship and boiler and machinery, and it lists fourteen unfair claims practices (Section 4, A through N), among them knowingly misrepresenting facts or policy provisions; failing to acknowledge pertinent communications with reasonable promptness; failing to adopt and implement reasonable standards for prompt investigation; "not attempting in good faith to effectuate prompt, fair and equitable settlement of claims submitted in which liability has become reasonably clear"; compelling suits by offering substantially less than is ultimately recovered; refusing to pay without a reasonable investigation; failing to affirm or deny within a reasonable time after investigation; making payments "without indicating the coverage under which each payment is being made"; requiring duplicative proof of loss and verification; failing to explain denials and compromise offers; failing to provide claim forms within fifteen calendar days of a request; and failing to assure workmanlike repairs by a repairer the insurer owns or requires.

The standard of violation is the part engineers underestimate. An act is an unfair claims practice under Section 3 if it is committed "flagrantly and in conscious disregard" of the act or its rules, or "with such frequency to indicate a general business practice." One late letter is a mistake; a system that sends late letters on every third claim in a state is a general business practice. That is how market conduct examiners work: they sample claim files, count exceptions against the deadlines, and a pattern becomes the finding and the fine ([Market Conduct & Unfair Practices](/books/insurance/market-conduct)). Penalties under Section 6 are up to $1,000 per violation and $100,000 in aggregate, or, if the violations were flagrant and in conscious disregard, up to $25,000 per violation and $250,000 in aggregate, plus suspension or revocation of the license; violating a cease and desist order adds up to $25,000 per act (Section 7). The companion model regulation says it creates no private cause of action, and that a state wanting one "should consider a different statutory scheme"; Texas, Florida and Washington did, which is where [Bad Faith & Litigation](/books/insurance/bad-faith-and-litigation) begins.

The NAIC's state pages list 47 jurisdictions in the model adoption column for Model 900 (Fall 2022 edition, Maine and Tennessee in part) and 23 for Model 902 (Fall 2023 edition, Kansas with exceptions); states such as California, Georgia, Illinois, Maryland and Texas appear under related activity for 902 because they wrote their own claim regulations ([NAIC: Unfair Claims Settlement Practices Act state page (PDF)](https://content.naic.org/sites/default/files/model-law-state-page-900.pdf); [NAIC: Unfair Property/Casualty Claims Settlement Practices Model Regulation state page (PDF)](https://content.naic.org/sites/default/files/model-law-state-page-902.pdf)). The state rules below were each opened directly.

## The Model Regulation's Clocks

**Model 902, the Unfair Property/Casualty Claims Settlement Practices Model Regulation** (adopted 1990, amended 1991), turns Model 900's standards into days. "Days" means calendar days. Its clocks:

- **Acknowledge** notification of a claim within 15 days, unless the claim is paid in that time; a non-written acknowledgment must be noted and dated in the file; notice to an agent is notice to the insurer (Section 6A).
- **Respond** to a department inquiry within 21 days, and to other pertinent communications that reasonably suggest a response is expected within 15 days (6B, 6C).
- **Provide forms**, instructions and reasonable assistance promptly; doing so within 15 days of notification satisfies the acknowledgment rule (6D).
- **Accept or deny** a first-party claim within 21 days after receipt of properly executed proofs of loss; a denial on a specific provision must cite it, in writing (7A).
- **Explain the delay**: if more time is needed, notify the claimant within 21 days with the reasons, and if the investigation remains incomplete, send a letter "forty-five (45) days from the initial notification and every forty-five (45) days thereafter" (7C). Note the change of starting event: the first letter runs from proof of loss, the recurring letters from initial notification.
- **Warn about limitation periods**: an unrepresented claimant must be told in writing of a statute of limitations at least 30 days (first party) or 60 days (third party) before it expires (7E).
- **Pay** within 30 days of affirming liability if the amount is determined and not in dispute, and pay undisputed amounts under separate coverages within 30 days when the payee is known (7F).
- **Tell the claimant about the department** if they object to a rejection (7H).

A reasonable-basis fraud exception relieves the insurer of the 21-day decision and the 45-day letters, though the claimant must still be told within a reasonable time. Model 902 also sets the auto total loss valuation methods ([Auto Claims & Total Loss](/books/insurance/auto-claims-and-total-loss#valuation-rules)), deductible sharing in subrogation ([Subrogation, Salvage & Recovery](/books/insurance/subrogation-and-salvage#deductible-recovery)) and matching and actual cash value rules for property ([Property Claims](/books/insurance/property-claims#replacement-cost-and-actual-cash-value)).

## The State Rules

**California.** The Fair Claims Settlement Practices Regulations (10 CCR 2695.1 and following) were filed December 15, 1992 and became effective January 14, 1993; 2695.7 was amended in 1997, 2003 (amendments a court enjoined, removed under a 2004 settlement) and 2006, with a non-substantive change filed July 14, 2021. Within 15 calendar days of notice of claim the insurer must acknowledge it (unless paying in that time), provide forms, instructions and reasonable assistance, and begin any necessary investigation (2695.5(e)); it must answer claimant communications within 15 calendar days and department inquiries within 21 (2695.5(a), (b)). It must accept or deny within 40 calendar days after receiving proof of claim, which the regulation defines broadly as "any evidence or documentation in the possession of the insurer" (2695.2(s), 2695.7(b)); if it needs more time, it gives written notice within those 40 days and every 30 calendar days until it decides (2695.7(c)(1)). A documented, reasonable suspicion of fraud extends the 40 days to 80 (2695.7(k)). Payment follows acceptance within 30 calendar days (2695.7(h)). Limitation-period notices are due at least 60 days before expiry, 30 for uninsured motorist claims (2695.7(f)). Calendar days include "Saturdays, Sundays, Federal and California State Holidays," and I found nothing in the regulations that moves a deadline landing on a weekend to Monday.

**Texas.** Chapter 542, Subchapter B, the Prompt Payment of Claims Act, took its current form in the 2003 recodification effective April 1, 2005, and applies to first-party claims paid directly to the insured or a beneficiary. Notice of claim must be written (542.051). Within 15 days after notice the insurer acknowledges the claim, begins its investigation and requests the items, statements and forms it reasonably believes it will need (542.055; 30 business days for an eligible surplus lines insurer). It accepts or rejects in writing within 15 business days after receiving all of them, or 30 days if it has a reasonable basis to believe the loss was arson; a rejection states its reasons; if it needs more time, it says why within the same period and then decides within 45 days of that notice (542.056). Having accepted, it pays within 5 business days (542.057). If payment is delayed more than 60 days after it received everything it asked for, or longer than another statute allows, it owes the damages in 542.060 (542.058). A business day is "a day other than a Saturday, Sunday, or holiday recognized by this state," and Texas recognizes, besides the national holidays, Confederate Heroes Day (January 19), Texas Independence Day (March 2), San Jacinto Day (April 21), Emancipation Day (June 19), Lyndon Baines Johnson Day (August 27), the Friday after Thanksgiving, December 24 and December 26 (Gov't Code 662.003).

**Florida.** Section 627.70131 applies to residential property insurers and, for its 60-day pay-or-deny rule, to commercial property claims for structures or contents of 10,000 square feet or less (excluding multistate commercial policies), and to surplus lines insurers writing residential coverage. The insurer acknowledges any claim communication within 7 calendar days, with forms, instructions and a phone number for a new claim (627.70131(1), (2)); begins a reasonably necessary investigation within 7 days after proof of loss; makes any physical inspection within 30 days after proof of loss, giving the policyholder the adjuster's name and state license number; and sends the policyholder a copy of any detailed estimate within 7 days after the adjuster generates it (3). It pays or denies an initial, reopened or supplemental claim within 60 days after notice, with a written explanation that addresses any gap between the payment and a detailed estimate; late payment bears interest at the section 55.03 rate from the notice date (7)(a). Preliminary estimates and partial payments must carry a prescribed statement in at least 12-point bold uppercase type that the claim is still under evaluation (6). The insurer keeps a log of every adjuster who communicates with the policyholder and records the dates of every communication, proof of loss, request, inspection, estimate, tolling period and payment or denial (4). The section's history runs from 2005 through ch. 2021-104 and two 2022 acts (ch. 2022-268 and ch. 2022-271, Senate Bill 2-A).

**New York.** Regulation 64 (11 NYCRR 216) uses business days: acknowledge within 15 business days, reply to other communications within 15 and to the Department of Financial Services within 10 (216.4); accept or reject within 15 business days after a properly executed proof of loss, 30 if arson is suspected, and if more time is needed say so within 15 business days and then every 90 days from that first letter; pay within five business days of receiving the settlement agreement (216.6, as amended effective February 1, 2017 and June 9, 2021).

### Worked Numbers: One Claim, Four Rulebooks

Mine. A homeowner reports wind damage on **Monday, November 15, 2027** (written notice, so Texas's clock starts too). The insurer receives the signed proof of loss and the last document it requested on **Monday, December 6, 2027**. Texas holidays in the window: Thanksgiving (November 25), the Friday after (November 26), December 24, December 25 (a Saturday) and December 26 (a Sunday), and January 1, 2028 (a Saturday).

| Clock | NAIC Model 902 | California | Texas | Florida |
| --- | --- | --- | --- | --- |
| Acknowledge | Nov 30, 2027 (15 days from notice) | Nov 30, 2027 (15 days, with forms and investigation begun) | Nov 30, 2027 (15 days, with item requests) | Nov 22, 2027 (7 days) |
| Begin investigation | Not separately timed | Nov 30, 2027 | Nov 30, 2027 | Dec 13, 2027 (7 days after proof of loss) |
| Inspect | Not timed | Not timed for property | Not timed | Jan 5, 2028 (30 days after proof of loss) |
| Accept or deny | Dec 27, 2027 (21 days after proof of loss) | Sat, Jan 15, 2028 (40 calendar days after proof of claim) | Tue, Dec 28, 2027 (15th business day after all items) | Pay or deny by Fri, Jan 14, 2028 (60 days after notice) |
| If more time is needed | Notice by Dec 27; letters Dec 30, 2027 (45 days from notice), Feb 13, 2028, every 45 days | Notice by Jan 15; then Feb 14, 2028 and every 30 days | Notice by Dec 28; decide by Feb 11, 2028 (45 days later) | No extension; tolling only (below) |
| Pay after acceptance (if accepted on the decision date) | Within 30 days | Within 30 days | Tue, Jan 4, 2028 (5th business day after Dec 28) | Within the 60 days |
| Statutory damages start | None (regulatory) | None (regulatory) | After Fri, Feb 4, 2028 (60 days after all items) | Interest from Nov 15, 2027 on any late payment |
| With a declared weather catastrophe | No change | No change | Each deadline 15 days later: decision Jan 12, 2028 | Office of Insurance Regulation order may add up to 30 days |
| Suspected fraud | Reasonable time | Decision by Feb 24, 2028 (80 days) | 30 days if arson: Jan 5, 2028 | Fraud or noncooperation is a factor beyond control |

Read across the decision row. Florida's 60 days from **notice** expires on January 14, a day before California's 40 days from **proof**, even though Florida's number is larger; Texas's 15 **business** days end December 28, a day after the Model's 21 **calendar** days. If proof of loss had arrived in early January, Florida's deadline wouldn't have moved at all and California's would have slid to February. Any shortcut ("use the shortest number") fails one of these states. The weather extension in Texas is "an additional 15 days"; the statute doesn't say business or calendar, and I count calendar days, which is the conservative reading because 15 business days would end later.

## Catastrophe Extensions and Tolling

Catastrophes are when claim clocks break, because claim counts jump by orders of magnitude in a week, and the law gives some slack, but not much and not automatically.

- **Texas** extends all of Subchapter B's deadlines by 15 days "in the event of a weather-related catastrophe or major natural disaster, as defined by the commissioner," and lets a court extend them for a guaranty association on good cause (542.059). The trigger is the commissioner's definition, so the system needs the declaration (its date, the counties and the perils) as data, and applies the extension to claims whose loss falls inside it.
- **Florida** treats as "factors beyond the control of the insurer" a Governor's state of emergency, a reportable data breach or an information technology issue, but only when the Office of Insurance Regulation issues an order granting more time, capped at 30 additional days; it also covers the policyholder's fraud, lack of cooperation or intentional misrepresentation (627.70131(5)(a)). The deadlines toll during mediation under 627.7015 or policy-required alternative dispute resolution, and when the policyholder fails to provide requested material information within 10 days, until the insurer receives it, but the second kind applies only if the request was sent at least 15 days before the 60-day deadline (627.70131(8)).
- **California** has no general catastrophe extension in 2695.7; the 80-day fraud extension is per claim and needs a documented basis. The catastrophe rules California does have sit in the policy terms (longer periods to collect replacement cost and file proof of loss after a declared state of emergency, in [Property Claims](/books/insurance/property-claims#replacement-cost-and-actual-cash-value)).

My rule: **an extension or a toll is an event with a source, never an edit to a due date.** The task keeps its original due date and gets a computed effective due date from the events applied to it (declaration, order, mediation start and end, information request and receipt), so an examiner can see the base deadline, the extension and the authority for it.

## Texas Chapter 542 Interest

When a Texas insurer that is liable for a claim doesn't comply with the subchapter, it pays, in addition to the claim, "interest on the amount of the claim at the rate of 18 percent a year as damages," plus reasonable attorney's fees (542.060(a)). For claims in actions under Chapter 542A (certain property damage claims, added by the 2017 amendments effective September 1, 2017), the interest is simple interest at the Finance Code 304.003 judgment rate plus five percent, set as of the judgment date, accruing "beginning on the date the claim was required to be paid" (542.060(c)). The judgment rate is the prime rate as published by the Federal Reserve, with a floor of 5% and a cap of 15%, computed monthly by the consumer credit commissioner; it was 7.00% for November 2026.

### Worked Numbers: Interest on a Late Texas Claim

Mine, continuing the claim above. The insurer receives all items on December 6, 2027; 60 days later is **February 4, 2028**. It disputes the claim, is found liable for $48,000, and pays on **June 2, 2028**, 119 days after payment was due.

| Basis | Rate | Interest |
| --- | --- | --- |
| 542.060(a), general | 18% a year | 48,000 × 0.18 × 119 / 365 = **$2,816.88** |
| 542.060(c), a 542A property action, if the judgment rate were November 2026's 7.00% | 7.00% + 5% = 12% simple | 48,000 × 0.12 × 119 / 365 = **$1,877.92** |

Plus attorney's fees in both cases (capped for 542A actions by the fee formula in 542A.007, in [Bad Faith & Litigation](/books/insurance/bad-faith-and-litigation)), plus prejudgment interest as the law otherwise allows. The engineering point is that the accrual date is a computed deadline the claim already had: the system that stored "pay by February 4, 2028, per 542.058" can price its own lateness to the day; the one that didn't has to reconstruct it in litigation.

## Adjusters and Their Licenses

Claim law reaches the person handling the claim. Texas forbids anyone to "act as or represent that the person is an adjuster in this state" without a license (Ins. Code 4101.051) and defines an adjuster broadly: someone who investigates or adjusts losses for an insurer as an employee or independent contractor (of an adjustment bureau, an association, an independent contractor, an insurer or an MGA), supervises the handling of claims, or handles workers' compensation claims (4101.001). Florida licenses public adjusters and all-lines adjusters, and appoints all-lines adjusters as independent or company employee adjusters, not both at once (Fla. Stat. 626.864); its claim statute requires the assigned adjuster's name and state license number on the inspection notice and later claim communications (627.70131(3)(b), (c)). Public adjusters, who work for the policyholder, are in [Property Claims](/books/insurance/property-claims#public-adjusters).

For the system that means three checks, the same shape as producer licensing ([Producer Licensing & Appointments](/books/insurance/producer-licensing)): an adjuster record with licenses by state, type and expiry; an assignment rule that won't route a claim to someone unlicensed for the loss state (with the emergency and temporary licenses states issue after catastrophes as their own license type); and the license number rendered into the letters that need it.

## The Diary as a Rules Engine

A claim diary is the list of tasks with due dates. Built badly it is a to-do list adjusters fill in; built well it is the output of a rules engine that watches claim events and creates, extends, satisfies or cancels tasks, each citing its rule ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)). Each rule is:

- **Jurisdiction and scope**: state, lines, first or third party, claim type, insurer basis (admitted or surplus lines), effective window.
- **Trigger event**: `notice_received`, `communication_received`, `proof_of_loss_received`, `all_items_received`, `estimate_generated`, `accepted`, `agreement_received`, `extension_notice_sent`, `limitation_date_known`.
- **Offset and unit**: days, calendar or business, and the holiday calendar for business days.
- **Satisfied by**: the event that completes it (`acknowledged`, `decided`, `paid`, `status_letter_sent`), and what it spawns (California's notice spawns another in 30 days; the Model's letter another in 45).
- **Modifiers**: catastrophe extension, fraud extension, tolling events.
- **Citation** and the date someone last reread it.

Satisfaction is a fact about the claim, not a checkbox: "acknowledged" is the timestamp of the acknowledgment document or the dated note of a phone acknowledgment, and "paid" is the payment's issue time. The business-day arithmetic is small and has to be exact:

```go tab="Go"
// AddBusinessDays returns the date n business days after start (start excluded),
// skipping weekends and the jurisdiction's holidays (Tex. Gov't Code 662.003 for Texas).
func AddBusinessDays(start time.Time, n int, holidays map[string]bool) time.Time {
	d := start
	for n > 0 {
		d = d.AddDate(0, 0, 1)
		if d.Weekday() == time.Saturday || d.Weekday() == time.Sunday {
			continue
		}
		if holidays[d.Format("2006-01-02")] {
			continue
		}
		n--
	}
	return d
}

// Texas 542.056(a): AddBusinessDays(2027-12-06, 15, txHolidays) == 2027-12-28
```

```rust tab="Rust"
use chrono::{Datelike, Days, NaiveDate, Weekday};
use std::collections::HashSet;

/// The date `n` business days after `start` (start excluded), skipping weekends
/// and the jurisdiction's holidays (Tex. Gov't Code 662.003 for Texas).
pub fn add_business_days(start: NaiveDate, mut n: u32, holidays: &HashSet<NaiveDate>) -> NaiveDate {
    let mut d = start;
    while n > 0 {
        d = d + Days::new(1);
        if matches!(d.weekday(), Weekday::Sat | Weekday::Sun) || holidays.contains(&d) {
            continue;
        }
        n -= 1;
    }
    d
}

// Texas 542.056(a): add_business_days(2027-12-06, 15, &tx_holidays) == 2027-12-28
```

Whether a holiday that falls on a weekend is observed on a weekday, and whether a deadline landing on a weekend rolls forward, are questions for each rule's text; California's definition of calendar days says weekends count, and I store a `roll_forward` flag per rule, false unless the source says otherwise.

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `claim_tasks` gains the rule and event it came from, and this chapter defines `claim_clock_rules`, `claim_events` and `holiday_calendars`. Jurisdiction-level rules elsewhere in the book live in `jurisdiction_rules` ([The State System](/books/insurance/the-state-system)); claim clocks get their own table because they carry triggers and modifiers that other rules don't.

```sql
CREATE TABLE claim_clock_rules (           -- one deadline in one rulebook, cited
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction       TEXT NOT NULL,         -- 'US-TX', 'US-CA', or 'NAIC-902' as a default
  lines              TEXT[] NOT NULL,       -- 'homeowners', 'personal_auto', ...
  party              TEXT NOT NULL CHECK (party IN ('first', 'third', 'any')),
  insurer_basis      TEXT,                  -- 'admitted', 'surplus_lines_eligible'
  task_kind          TEXT NOT NULL,         -- 'acknowledge', 'begin_investigation', 'inspect',
                                            -- 'decide', 'status_letter', 'pay', 'sol_notice'
  trigger_event      TEXT NOT NULL,         -- 'notice_received', 'all_items_received', ...
  offset_days        INT NOT NULL,          -- negative for "before" rules (SOL notices)
  day_unit           TEXT NOT NULL CHECK (day_unit IN ('calendar', 'business')),
  holiday_calendar   TEXT,                  -- 'US-TX' for business days
  roll_forward       BOOLEAN NOT NULL DEFAULT FALSE,
  satisfied_by       TEXT[] NOT NULL,       -- events that complete the task
  repeats_every_days INT,                   -- CA 30, NAIC 45, NY 90
  fraud_offset_days  INT,                   -- CA 80 replaces 40; TX arson 30
  cat_extension_days INT,                   -- TX 15
  tolls_on           TEXT[],                -- 'mediation', 'info_request_outstanding'
  citation           TEXT NOT NULL,         -- 'Tex. Ins. Code 542.056(a)'
  source_url         TEXT NOT NULL,
  effective_from     DATE NOT NULL,
  effective_to       DATE,
  checked_on         DATE NOT NULL
);

CREATE TABLE holiday_calendars (
  calendar           TEXT NOT NULL,         -- 'US-TX', 'US-NY'
  holiday_on         DATE NOT NULL,
  name               TEXT NOT NULL,
  citation           TEXT NOT NULL,         -- 'Tex. Gov't Code 662.003(b)'
  PRIMARY KEY (calendar, holiday_on)
);

CREATE TABLE claim_events (                -- the facts the clocks run on
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id           UUID NOT NULL REFERENCES claims (id),
  exposure_id        UUID REFERENCES exposures (id),
  kind               TEXT NOT NULL,         -- trigger and satisfaction events, plus
                                            -- 'cat_declared', 'toll_started', 'toll_ended'
  occurred_at        TIMESTAMPTZ NOT NULL,  -- when it happened (receipt, mailing)
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  document_id        UUID,                  -- the letter, the proof of loss, the order
  source             JSONB                  -- declaration id, order number, request id
);

ALTER TABLE claim_tasks
  ADD COLUMN rule_id           UUID REFERENCES claim_clock_rules (id),
  ADD COLUMN exposure_id       UUID REFERENCES exposures (id),
  ADD COLUMN trigger_event_id  UUID REFERENCES claim_events (id),
  ADD COLUMN base_due_at       TIMESTAMPTZ,  -- before extensions and tolls
  ADD COLUMN adjustments       JSONB NOT NULL DEFAULT '[]',  -- each with its event and days
  ADD COLUMN satisfied_by_event_id UUID REFERENCES claim_events (id),
  ADD COLUMN met               BOOLEAN;     -- set when satisfied or when it lapses
```

The engine runs on every claim event: find rules whose trigger matches for the claim's jurisdiction, line, party and date; create tasks with base and effective due dates; apply extensions and tolls already on the claim; mark tasks satisfied by the event; and for repeating rules, create the next. A daily job finds tasks about to lapse:

```sql
SELECT t.claim_id, t.kind, t.due_at, r.citation
FROM claim_tasks t
JOIN claim_clock_rules r ON r.id = t.rule_id
WHERE t.done_at IS NULL
  AND t.due_at < NOW() + INTERVAL '2 days'
ORDER BY t.due_at;
```

Design choices:

- **The rule decides the date; adjusters can't type one.** An adjuster can set an earlier follow-up, never a later legal deadline ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).
- **Events are facts with recorded times.** A proof of loss received on Friday and logged on Monday was received on Friday, and the event says both.
- **Every lapse is measured.** `met = false` is a reportable exception, counted by state and rule, because the general business practice standard is a frequency.
- **Rules are rechecked.** Each carries `checked_on`; a quarterly job lists rules not reread in a year, like the `notice_rules` of [Cancellation, Nonrenewal & Notice Law](/books/insurance/cancellation-and-nonrenewal).

## Auditing

- **Every task with its rule, trigger event, base due date, adjustments and the event that satisfied it,** so the examiner's sample can be timed exactly.
- **Every extension and toll with its authority:** the commissioner's catastrophe definition, the Office of Insurance Regulation's order, the mediation dates, the information request and its receipt.
- **Lapse rates by jurisdiction, rule and month,** as the insurer's own early warning of a general business practice.
- **Every adjuster on the claim with their license for the loss state** on the date they acted.
- **Every rule with its citation, effective window and last check.**

## What This Means for the System You Build

- **Model deadlines as rules keyed on events,** with the unit (calendar or business), the holiday calendar and the citation.
- **Store the events, not just the dates:** notice, proof of loss, all items received, acceptance, agreement, estimate generated.
- **Apply catastrophe extensions and tolls as dated events with a source,** never by editing due dates.
- **Compute statutory interest from the stored deadline** (Texas 542.060 at 18%, or the judgment rate plus 5% for 542A actions).
- **Check adjuster licenses at assignment** and render license numbers where the state requires them.
- **Measure lapse rates,** because regulators judge frequency.

## References

**Law and regulation**

- [10 CCR 2695.2](https://www.law.cornell.edu/regulations/california/10-CCR-2695.2), calendar days including weekends and holidays, notice of claim and proof of claim
- [10 CCR 2695.5](https://www.law.cornell.edu/regulations/california/10-CCR-2695.5), 15 calendar days to acknowledge, provide forms and begin investigating, 15 to answer claimants and 21 to answer the department
- [10 CCR 2695.7](https://www.law.cornell.edu/regulations/california/10-CCR-2695.7), 40 days to accept or deny, 30-day notices, 30 days to pay, 80 days on suspected fraud, limitation notices, and the section's filing history from 1992 to 2021
- [Tex. Ins. Code 542.051](https://texas.public.law/statutes/tex._ins._code_section_542.051), business day, claim and notice of claim
- [Tex. Ins. Code 542.055](https://texas.public.law/statutes/tex._ins._code_section_542.055), acknowledgment, investigation and requests within 15 days (30 business days for surplus lines)
- [Tex. Ins. Code 542.056](https://texas.public.law/statutes/tex._ins._code_section_542.056), acceptance or rejection within 15 business days, 30 days for arson, and the 45-day extension
- [Tex. Ins. Code 542.057](https://texas.public.law/statutes/tex._ins._code_section_542.057), payment within 5 business days of acceptance (20 for surplus lines)
- [Tex. Ins. Code 542.058](https://texas.public.law/statutes/tex._ins._code_section_542.058), delay beyond 60 days after all items, and life insurance interpleader within 90 days
- [Tex. Ins. Code 542.059](https://texas.public.law/statutes/tex._ins._code_section_542.059), 15-day extension for weather catastrophes and court extensions for guaranty associations
- [Tex. Ins. Code 542.060](https://texas.public.law/statutes/tex._ins._code_section_542.060), 18% interest as damages and attorney's fees, and the judgment rate plus 5% for 542A actions, as amended in 2017
- [Tex. Fin. Code 304.003](https://texas.public.law/statutes/tex._fin._code_section_304.003), the judgment rate: prime, floor 5%, cap 15%
- [Tex. Gov't Code 662.003](https://texas.public.law/statutes/tex._gov't_code_section_662.003), national and state holidays
- [Tex. Ins. Code 4101.001](https://texas.public.law/statutes/tex._ins._code_section_4101.001) and [4101.051](https://texas.public.law/statutes/tex._ins._code_section_4101.051), the definition of adjuster and the license requirement
- [Fla. Stat. 627.70131](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.70131.html), 7-day acknowledgment, 7-day investigation, 30-day inspection, 7-day estimate copy, 60-day pay or deny, interest, required statements, records, factors beyond control, tolling and scope
- [Fla. Stat. 626.864](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0626/Sections/0626.864.html), adjuster license types and appointments
- [11 NYCRR 216.4](https://www.law.cornell.edu/regulations/new-york/11-NYCRR-216.4), 15 business days to acknowledge and 10 to answer the department
- [11 NYCRR 216.6](https://www.law.cornell.edu/regulations/new-york/11-NYCRR-216.6), 15 business days to decide, 90-day status letters and payment within five business days, with 2017 and 2021 amendments

**NAIC**

- [NAIC: Unfair Claims Settlement Practices Act (#900) (PDF)](https://content.naic.org/sites/default/files/model-law-900.pdf), scope, the general business practice standard, the fourteen practices and penalties
- [NAIC: Unfair Property/Casualty Claims Settlement Practices Model Regulation (#902) (PDF)](https://content.naic.org/sites/default/files/model-law-902.pdf), calendar days, the 15, 21, 45 and 30-day clocks, the fraud exception, limitation notices and no private cause of action

**Regulators and guidance**

- [Texas Office of Consumer Credit Commissioner: Interest rates](https://occc.texas.gov/publications/interest-rates), the 7.00% post-judgment rate for November 2026
