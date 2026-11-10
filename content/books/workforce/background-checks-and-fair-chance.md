+++
title = "Background Checks, Fair Chance & Drug Testing"
nav_title = "Background Checks"
description = "FCRA disclosure, authorization and adverse action, screening provider APIs, fair chance sequencing in California and NYC, cannabis testing laws and monitoring."
category = "Workforce Industry"
order = 2637
part = "Hiring and HR Records"
tags = ["background-checks", "fcra", "fair-chance", "drug-testing", "adverse-action", "hiring"]
+++

A background check is a consumer report, and the employer that orders one becomes a user of consumer reports under the Fair Credit Reporting Act. That single fact sets the workflow: a disclosure the candidate reads on its own, an authorization they sign, a certification the employer gives the consumer reporting agency (CRA), and, if the report might cost the candidate the job, a copy of the report and a summary of their rights before the decision, then a notice after it. Fair chance laws add a second layer on top: no questions about conviction history until a conditional offer, an individualized assessment of anything the report shows, and a written chance to respond before the offer is withdrawn. Drug testing adds a third, where state cannabis laws now protect off-duty use and bar acting on tests that detect only inactive metabolites.

The legal risk is in the sequence, not the content. FCRA class actions are built on disclosure forms that carried a liability waiver, adverse action letters sent the same day as the pre-adverse notice, and reports pulled before authorization; fair chance complaints are built on a conviction question on an application or a withdrawal without the assessment. A system that gets the order and the clocks right removes most of the exposure, which is why this chapter is mostly about state and timing. The credit-side version of the same notices, and the FCRA's adverse action duty as lenders run it, is in Banking & Lending's [Adverse Action Notices](/books/banking-and-lending/adverse-action#what-the-fcra-adds); this chapter covers the employment side.

## How the Platforms Do It

What background screening providers publish about their APIs and workflows, as of November 2026:

| Provider | Objects and flow | Adverse action | Ongoing checks |
| --- | --- | --- | --- |
| **Certn** | Its developer docs say "All endpoints in this API are deprecated as of April 13, 2026," replaced by the CertnCentric API | Not described on the legacy docs | Not described |
| **Checkr** | Candidates, reports, packages ("Information requirements depend strictly on the Package requested"), and invitations to a "Checkr-Hosted Apply Flow"; the customer "Engages or Adverse Actions the Candidate, based on an individualized assessment" | An adverse actions API in which "National and local laws control the Adverse Action process and define the sequence and timing"; the record carries `post_notice_scheduled_at` and `post_notice_ready_at`, and an `adverse_action.paused` webhook means the post-notice "has been temporarily halted" | Continuous Check "runs a monthly check for pointers to new records" and "generates a full Report only if new reportable information is found," for criminal and motor vehicle records |

Checkr's docs also warn that it "does not guarantee the delivery of events in the order in which they are generated," which applies to every consumer of screening webhooks: order by the report's own timestamps and states, never by arrival.

<!-- source-gap: wf-bgc-cra-docs | missing | public API and adverse action workflow documentation for First Advantage, HireRight, Sterling and other large CRAs | closes with: a public developer or help page from each describing objects, waiting periods and monitoring | checked: 2026-11-09 -->

The shape that matters is Checkr's: the CRA produces a report; the employer, not the CRA, decides; and the adverse action process is a scheduled two-step workflow whose timing the employer's jurisdiction sets. Every CRA integration needs the same three things from the employer's side: a record of the disclosure and authorization before the order, the decision and its reasons after the report, and the two notices with their dates.

## The FCRA Workflow

**Disclosure.** Before procuring a report, the employer must give "a clear and conspicuous disclosure" in writing "in a document that consists solely of the disclosure" that a report may be obtained for employment purposes (15 USC 1681b(b)(2)). The FTC's guidance adds that "The notice cannot be in an employment application," and allows only brief extra details that don't confuse or distract. The "solely" requirement is the most litigated sentence in the statute: a disclosure that also releases the employer or the CRA from liability, or carries state notices that overwhelm it, is the classic willful violation. My rule: the disclosure is its own screen and its own document version, with nothing on it but the disclosure and, where a state requires its own notice, that notice on a separate screen.

**Authorization.** The candidate authorizes in writing, which the FTC says "can be in the same document as the notice." If the authorization is meant to cover checks during employment as well as at hire, the FTC says to say so clearly. The one exception to a written authorization is the transportation case below.

**Certification.** The employer certifies to the CRA that it gave the disclosure, obtained authorization, will follow the adverse action steps and won't use the report in violation of equal employment law (1681b(b)(1)). In an integration this is an account-level attestation plus a per-order flag that the disclosure and authorization exist; the order should be impossible to submit without the authorization's document id.

**Investigative reports.** A report built from personal interviews about "character, general reputation, personal characteristics, and mode of living" is an investigative consumer report. Its disclosure goes out "not later than three days after the date on which the report was first requested," and the candidate may request a "complete and accurate disclosure of the nature and scope of the investigation requested," answered within five days (1681d). Reference checks run through a CRA are the usual example.

**What a report may contain.** The FCRA bars reporting most adverse items older than seven years (civil suits, judgments and arrest records, paid tax liens, collection accounts and "any other adverse item"), and bankruptcies older than ten, but the seven-year limit carves out "records of convictions of crimes" (1681c(a)). The limits don't apply at all for "the employment of any individual at an annual salary which equals, or which may reasonably be expected to equal $75,000, or more" (1681c(b)). State law is often stricter: California's Fair Chance Act bars considering conviction history "more than seven years old" (below). When a CRA reports public record information likely to hurt the candidate, it must either notify the consumer at the time or "maintain strict procedures" to keep the information "complete and up to date" (1681k).

**Before adverse action.** "Before taking any adverse action based in whole or in part on the report," the employer must give the candidate "a copy of the report" and "a description in writing of the rights of the consumer," which is the CFPB's *A Summary of Your Rights Under the Fair Credit Reporting Act* (1681b(b)(3)). This is the pre-adverse action notice. It exists so the candidate can dispute an error before the decision is final: a namesake's conviction, a dismissed charge reported as pending, a record that belongs to someone else.

**The wait.** The statute names no waiting period between the pre-adverse notice and the decision. The FTC staff's 1998 opinion letter to Sidney Lewis said the FCRA "does not specify how long an employer must wait," and that the right period "will vary depending upon the circumstances." A wait of several business days is the common practice, and Checkr's API models it as a scheduled post-notice rather than a fixed number. Fair chance laws do set minimums, and where they apply they govern the wait.

**After adverse action.** The final notice, oral, written or electronic, must give the CRA's name, address and telephone number; a statement that the CRA "did not make the decision" and can't explain it; and the candidate's right to a free copy of the report within 60 days and to dispute its accuracy or completeness with the CRA (1681m(a)).

**Remote applications.** One narrow exception replaces both steps. For a position where "the Secretary of Transportation has the power to establish qualifications and maximum hours of service" (or one under a state transportation agency's safety rules), when "the only interaction" with the applicant has been by mail, phone, computer or similar means, consent may be oral, written or electronic, and the adverse action notice may instead be given "within 3 business days of taking such action" (1681b(b)(2)(C), (b)(3)(B)). Everyone else gets the standard two-step process.

**Liability.** A willful violation exposes the employer to actual damages or statutory damages "not less than $100 and not more than $1,000" per consumer, punitive damages, and attorney's fees (1681n). Across a class of every applicant who saw a defective disclosure, the per-person range is what makes the form design a seven-figure decision.

## Fair Chance Sequencing

Fair chance laws (often called ban-the-box) move conviction history out of the application and into a structured step after a conditional offer. The two most detailed regimes:

| Rule | California Fair Chance Act | New York City Fair Chance Act |
| --- | --- | --- |
| **Who is covered** | Public employers and private employers with five or more employees, including temporary agencies and labor contractors; applicants, people who start work before the check, and employees up for promotion or otherwise being checked | Employers with four or more employees; since Local Law 4 took effect July 29, 2021, current employees and pending cases too |
| **Before the offer** | No conviction questions on applications, no background check or internet search for criminal history, no "No Felons" postings | "criminal history may not be sought or considered by employers before a conditional offer of employment" |
| **Never considered** | Arrests not resulting in conviction (with limited exceptions), sealed, dismissed or expunged convictions, records cleared after diversion, and conviction history "more than seven years old" | Analyzed under Article 23-A factors for convictions and the city's own factors for pending cases |
| **Assessment** | An individualized assessment of the nature and gravity of the conviction, time passed, and the nature of the job and its duties | A written Fair Chance Analysis evaluating "each relevant fair chance factor" |
| **Preliminary notice** | The convictions relied on, a copy of the report, the right to respond with evidence of rehabilitation and mitigation, and the deadline | A copy of the criminal history inquiry, the Fair Chance Notice and the analysis |
| **Time to respond** | "At least five business days from the date the notice is received and at least ten days if the job seeker is challenging the accuracy of the background check" | "at least five business days to respond," starting when the applicant receives the inquiry and the Notice |
| **Final notice** | In writing, with any procedure to challenge the decision and the right to file a complaint with the Civil Rights Department | Under the city's process |
| **Source** | Gov. Code 12952; 2 CCR 11017.1 | NYC Commission on Human Rights guidance |

California also fixes when a mailed notice counts as received: five calendar days after mailing for a California address, ten for elsewhere in the United States and twenty outside it, unless delivery confirms receipt (2 CCR 11017.1(c)(2)(E), as the Civil Rights Department's fact sheet cites it). Many other states, counties and cities have their own fair chance rules with different employer sizes, timing and notices; a screening workflow needs them as rules keyed by the work location and, where the law reaches it, the applicant's residence.

### Worked Numbers: One Withdrawal, Both Laws

The dates are invented. A California employer extends a conditional offer on Tuesday, September 8, 2026, and orders a check the same day after the candidate signs the standalone disclosure and authorization. The report arrives Thursday, September 10, showing a five-year-old conviction. The hiring manager completes the individualized assessment and finds a direct and adverse relationship to the job's duties.

| Step | Date | Rule |
| --- | --- | --- |
| Conditional offer | Tue, Sep 8 | Fair Chance Act: no conviction inquiry before it |
| Disclosure and authorization signed; check ordered | Tue, Sep 8 | 1681b(b)(2): before procuring the report |
| Report received; assessment completed | Thu, Sep 10 | Gov. Code 12952: individualized assessment |
| Preliminary notice mailed with the report, the Summary of Rights and the conviction list | Mon, Sep 14 | 1681b(b)(3) pre-adverse notice and the Fair Chance Act preliminary notice, combined |
| Notice deemed received | Sat, Sep 19 | Five calendar days after mailing to a California address |
| Response deadline, no dispute | Fri, Sep 25 | Five business days after receipt: Sep 21, 22, 23, 24, 25 |
| Response deadline if the candidate disputes accuracy | Tue, Sep 29 | "At least ten days"; counted here as ten calendar days from receipt, the shorter reading, so my rule is to allow the longer one where it is unclear |
| Final notice | Wed, Sep 30 at the earliest | 1681m(a) adverse action notice and the Fair Chance Act final notice |

Sent by email with confirmed receipt the same Monday, the notice is received September 14 and the five business days end Monday, September 21. The FCRA alone would have allowed a shorter, undefined wait; the state law sets the clock, and the two notices are drafted to satisfy both statutes at once. A system that computes these dates should take the delivery method as an input, count business days with a holiday calendar, and refuse to release the final notice early.

## Drug Testing and Cannabis

Drug testing is regulated mostly by states, and the big change of the last few years is cannabis. As of November 2026, three examples show the range:

| State | Law | Protection | Carve-outs |
| --- | --- | --- | --- |
| **California** | Gov. Code 12954 (AB 2188, SB 700), operative January 1, 2024 | No discrimination for "use of cannabis off the job and away from the workplace" or for a test "that has found the person to have nonpsychoactive cannabis metabolites"; no asking about past cannabis use | Building and construction trades; jobs requiring federal background investigations or clearances; jobs where state or federal law requires testing; no protection for use, possession or impairment at work |
| **New York** | Labor Law 201-d | No discrimination for "legal use of consumable products, including cannabis in accordance with state law" outside work hours, off premises and without employer property | The employee "manifests specific articulable symptoms" of impairment, or acting otherwise would violate federal law or cost a federal contract or funding |
| **Washington** | RCW 49.44.240, effective January 1, 2024 | No refusal to hire for off-the-job use or for a pre-employment screen detecting "nonpsychoactive cannabis metabolites" | Federal background or clearance jobs, law enforcement and corrections, first responders and dispatchers, airline and aerospace, and safety-sensitive roles identified before the application; employers may still test for other substances without receiving cannabis results |

For a system, cannabis rules change the test panel and the result routing, not only the policy text. In Washington an employer may test applicants for other substances as long as it doesn't receive the cannabis result, so the order sent to the lab must exclude it or the result must be suppressed before the employer sees it. In California a test that detects only metabolites can't be the basis of a decision, so the result codes from the lab need to distinguish impairment-indicating tests from metabolite tests. Federally mandated testing (safety-sensitive transportation jobs are the main example) sits outside these state protections by the statutes' own carve-outs, so the position, not just the state, decides which rules apply. A drug test result is also medical information: it is stored with medical records, not in the personnel file (Employee Records, Privacy & Retention covers the separation).

## Continuous Monitoring and Rechecks

Checks don't stop at hire. Employers recheck drivers' motor vehicle records, licensed professionals and people in regulated roles, and CRAs sell continuous monitoring: Checkr's Continuous Check runs monthly for pointers to new criminal or motor vehicle records and produces a full report only when it finds something reportable. Each recheck is a new consumer report, so:

- **The authorization must cover it.** The FTC says an authorization meant to cover the whole employment should say so clearly; otherwise each recheck needs a new disclosure and authorization.
- **The adverse action steps apply to employees.** A pre-adverse notice with the report and the Summary of Rights, a wait, and a final notice before disciplining or discharging an employee because of the report.
- **Fair chance laws apply too.** California's covers employees "otherwise undergoing a background check," and New York City's covers current employees since 2021.
- **New findings need the same assessment.** A monitoring hit is a report to assess, not a decision; the system should route it to the same individualized assessment and notices as a pre-hire report.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). A check belongs to a person and, before hire, to an application from Recruiting, ATS & AI in Hiring; reports, disclosures and notices are `documents`.

```sql
CREATE TABLE fcra_authorizations (         -- the standalone disclosure and the signature
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  person_id           UUID NOT NULL REFERENCES persons (id),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  disclosure_document_id UUID NOT NULL REFERENCES documents (id),  -- the version shown, alone
  state_notice_document_ids UUID[] NOT NULL DEFAULT '{}',          -- separate state notices
  investigative_notice_document_id UUID REFERENCES documents (id), -- 1681d, when applicable
  scope               TEXT NOT NULL CHECK (scope IN ('pre_hire', 'pre_hire_and_employment')),
  method              TEXT NOT NULL CHECK (method IN ('written', 'electronic', 'oral')),
  authorized_at       TIMESTAMPTZ NOT NULL,
  revoked_at          TIMESTAMPTZ
);

CREATE TABLE background_checks (           -- one order to one CRA, and its report
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  person_id           UUID NOT NULL REFERENCES persons (id),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  application_id      UUID REFERENCES applications (id),          -- pre-hire
  worker_id           UUID REFERENCES workers (id),               -- recheck or monitoring
  fcra_authorization_id UUID NOT NULL REFERENCES fcra_authorizations (id),
  conditional_offer_id UUID REFERENCES offers (id),               -- fair chance: before ordering
  cra                 TEXT NOT NULL,
  package             TEXT NOT NULL,         -- the searches ordered
  kind                TEXT NOT NULL CHECK (kind IN ('pre_hire', 'recheck', 'monitoring_hit')),
  external_ref        TEXT,                  -- the CRA's report id
  status              TEXT NOT NULL CHECK (status IN ('ordered', 'pending', 'complete',
                        'canceled', 'disputed')),
  result              TEXT CHECK (result IN ('clear', 'consider', 'suspended')),
  report_document_id  UUID REFERENCES documents (id),
  ordered_at          TIMESTAMPTZ NOT NULL,
  completed_at        TIMESTAMPTZ,
  retention_until     DATE NOT NULL,
  CHECK ((application_id IS NULL) <> (worker_id IS NULL))
);

CREATE TABLE individualized_assessments (  -- the employer's decision, with its reasons
  background_check_id UUID PRIMARY KEY REFERENCES background_checks (id),
  rule_set            TEXT NOT NULL,         -- 'fcra_only', 'ca_fair_chance', 'nyc_fair_chance', ...
  findings            JSONB NOT NULL,        -- each record considered, excluded or relied on
  factors             JSONB NOT NULL,        -- nature and gravity, time elapsed, job duties
  decision            TEXT NOT NULL CHECK (decision IN ('proceed', 'preliminary_adverse')),
  decided_by          TEXT NOT NULL,
  decided_at          TIMESTAMPTZ NOT NULL
);

CREATE TABLE adverse_action_notices (      -- the pre-adverse and the final, with their clocks
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  background_check_id UUID NOT NULL REFERENCES background_checks (id),
  stage               TEXT NOT NULL CHECK (stage IN ('pre_adverse', 'final', 'rescinded')),
  document_id         UUID NOT NULL REFERENCES documents (id),     -- includes the report and rights
  delivery_method     TEXT NOT NULL CHECK (delivery_method IN ('email_confirmed', 'email',
                        'mail_in_state', 'mail_out_of_state', 'mail_international', 'hand')),
  sent_at             TIMESTAMPTZ NOT NULL,
  deemed_received_on  DATE NOT NULL,         -- computed from the delivery rule
  respond_by          DATE,                  -- pre-adverse: computed from the strictest rule
  dispute_respond_by  DATE,                  -- when the candidate disputes accuracy
  rule_ref            TEXT NOT NULL,         -- which rules set the dates
  candidate_response_document_id UUID REFERENCES documents (id),
  UNIQUE (background_check_id, stage)
);

CREATE TABLE drug_tests (                  -- a lab order and result: medical, stored apart
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  person_id           UUID NOT NULL REFERENCES persons (id),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  reason              TEXT NOT NULL CHECK (reason IN ('pre_employment', 'random', 'post_accident',
                        'reasonable_suspicion', 'return_to_duty', 'follow_up')),
  regulated_program   TEXT,                  -- a federal mandate, or null
  panel               TEXT[] NOT NULL,       -- substances ordered; cannabis excluded where required
  suppressed_results  TEXT[] NOT NULL DEFAULT '{}',   -- received by the lab, hidden from the employer
  result              TEXT CHECK (result IN ('negative', 'positive', 'dilute', 'canceled',
                        'refused')),
  result_detail       JSONB,                 -- analyte and whether it indicates impairment
  collected_at        TIMESTAMPTZ,
  resulted_at         TIMESTAMPTZ,
  medical_record_id   UUID,                  -- the confidential medical file (Records chapter)
  retention_until     DATE NOT NULL
);
```

The final notice can't be released early. The check is one query over the notice rows:

```sql
SELECT n.background_check_id
FROM adverse_action_notices n
WHERE n.stage = 'pre_adverse'
  AND n.background_check_id = $1
  AND CURRENT_DATE > GREATEST(n.respond_by, n.dispute_respond_by)   -- GREATEST skips nulls
  AND NOT EXISTS (SELECT 1 FROM adverse_action_notices f
                  WHERE f.background_check_id = n.background_check_id AND f.stage = 'final');
```

Design notes:

- **No order without an authorization.** `background_checks.fcra_authorization_id` is required, and a pre-hire check under a fair chance rule also requires `conditional_offer_id`, so the two most common violations can't be stored.
- **Dates come from rules, with the delivery method as input.** `deemed_received_on`, `respond_by` and `dispute_respond_by` are computed from the strictest rule for the work location and stored with `rule_ref` ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).
- **The assessment is a record, not a checkbox.** Which records were excluded by law, which were relied on and why, and who decided, because that is what a fair chance complaint asks for.
- **Webhooks are reconciled by state.** CRA events arrive out of order, so `background_checks.status` advances only along allowed transitions and a late event for an earlier state is ignored ([Ordering](/docs/architecture/events#ordering)).
- **The analogy with credit is exact.** An `adverse_action_notices` row with `stage = 'final'` carries the same CRA identity, no-decision statement and 60-day rights as a lender's FCRA notice ([How to Build It](/books/banking-and-lending/adverse-action#how-to-build-it)); the employment version adds the pre-adverse step lenders don't have.

## Auditing

Background check records are reviewed in FCRA litigation, state civil rights complaints and CRA audits of their customers. Keep:

- **The disclosure exactly as shown,** its version, and the signed authorization, with timestamps before the order.
- **Every order and report,** with the package, the CRA's id and the report as received.
- **The individualized assessment** with the records excluded and relied on, the factors and the decider.
- **Both notices,** the delivery method, computed dates, any response and what the employer did with it.
- **Drug test orders and results** in the medical record, with any suppressed results and the rule that required suppression.
- **Secure disposal.** The FTC's disposal guidance applies to reports: shred paper and make electronic data unreadable when retention ends.

## What This Means for the System You Build

- **Make the disclosure its own document and screen,** with nothing on it but the disclosure.
- **Block every order without a signed authorization,** and, under fair chance rules, without a conditional offer.
- **Run adverse action as a two-step workflow with computed clocks,** using the delivery method, business days and the strictest applicable rule.
- **Record the individualized assessment as data:** what was excluded by law, what was relied on and why.
- **Treat rechecks and monitoring hits as new reports** with the same notices, and confirm the authorization covers them.
- **Route drug test panels and results by state and position,** suppress what the law bars the employer from seeing, and store results as medical records.
- **Order CRA events by their own timestamps,** not by arrival.

## References

**Law and regulation**

- [15 USC 1681b](https://www.law.cornell.edu/uscode/text/15/1681b), subsection (b): certification, the standalone disclosure, authorization, the pre-adverse copy and rights, and the remote application exception
- [15 USC 1681c](https://www.law.cornell.edu/uscode/text/15/1681c), the seven- and ten-year limits, the conviction carve-out and the $75,000 salary exception
- [15 USC 1681d](https://www.law.cornell.edu/uscode/text/15/1681d), investigative consumer reports: the three-day disclosure and the nature and scope request
- [15 USC 1681k](https://www.law.cornell.edu/uscode/text/15/1681k), public record information for employment purposes
- [15 USC 1681m](https://www.law.cornell.edu/uscode/text/15/1681m), the adverse action notice: the CRA's contact information, the no-decision statement and the 60-day free report and dispute rights
- [15 USC 1681n](https://www.law.cornell.edu/uscode/text/15/1681n), statutory damages of $100 to $1,000 for willful noncompliance, punitive damages and fees
- [California Government Code 12954](https://california.public.law/codes/government_code_section_12954), cannabis use and metabolite tests, the prior-use inquiry ban and the carve-outs, operative January 1, 2024
- [New York Labor Law 201-d](https://www.nysenate.gov/legislation/laws/LAB/201-D), legal off-duty activities including cannabis and the impairment and federal law exceptions
- [RCW 49.44.240](https://app.leg.wa.gov/rcw/default.aspx?cite=49.44.240), Washington's hiring protection for off-duty cannabis use and metabolite screens, effective January 1, 2024

**Agency guidance and forms**

- [FTC: Using consumer reports, what employers need to know](https://www.ftc.gov/business-guidance/resources/using-consumer-reports-what-employers-need-know), the disclosure outside the application, authorization for the whole employment, certification, both notices, investigative reports and disposal
- [FTC: Advisory opinion to Lewis (June 11, 1998)](https://www.ftc.gov/legal-library/browse/advisory-opinions/advisory-opinion-lewis-06-11-98), no specified waiting period after the pre-adverse disclosures
- [California Civil Rights Department: Fair Chance Act](https://calcivilrights.ca.gov/fair-chance-act/), employers with five or more employees, effective January 1, 2018, and the fact sheets and sample forms
- [California Civil Rights Department: Criminal history and employment fact sheet (June 2025)](https://calcivilrights.ca.gov/wp-content/uploads/sites/32/2025/07/Fair-Chance-Act-Factsheet_English.pdf), coverage, what can never be considered, the assessment factors, the preliminary notice, the five-business-day and ten-day response periods, receipt by mail and the final notice
- [NYC Commission on Human Rights: Fair Chance Act](https://www.nyc.gov/site/cchr/law/fair-chance-act.page), the conditional offer, the Fair Chance Notice and analysis, Article 23-A, five business days, Local Law 4 and the four-employee threshold

**Vendor documentation**

- [Checkr: API documentation](https://docs.checkr.com/), candidates, packages, invitations, reports, adverse actions and their scheduling and pause events, Continuous Check and event ordering
- [Certn: API documentation](https://docs.certn.co/), the legacy API's deprecation on April 13, 2026
