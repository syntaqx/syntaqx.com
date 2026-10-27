+++
title = "Sales Teams & Commissions"
description = "Paying the people who sell: team structures, recruiting and onboarding gates, worker classification, commission plans as data, clawbacks, payroll and disputes."
category = "Field Operations Industry"
order = 1526
part = "Selling"
tags = ["field-operations", "sales", "commissions", "payroll", "compliance"]
+++

A field-service business that grows by selling has to pay the people who sell, and the pay is never as simple as a percentage. A door-to-door rep earns on accounts that can cancel for days after signing and churn for months after that. A technician earns a spiff on the water heater they recommended. A team lead earns an override on everyone below them, a recruiter earns on the reps they brought in, and a summer contest pays a trip to whoever sells the most of the new plan. All of it depends on facts the business learns later: whether the customer cancelled, whether the first service happened, whether the first payment cleared. Get it wrong one way and reps are overpaid on sales that never became customers; get it wrong the other way and the best reps leave mid-season. And before any of that, the business has to hire, verify, screen and permit people fast enough to knock doors in May. This chapter covers the team, the onboarding, the plan and the ledger that pays it.

## How Sales Teams Are Organized

Four shapes cover most of the industry, and many businesses run more than one at once.

- **Seasonal door-to-door teams.** Reps knock from spring to late summer ([Door-to-Door Sales](/books/field-operations/door-to-door-sales)). Above them sit team leads, managers and regional leaders who earn overrides on their team's production, and recruiters who earn on the reps they bring in. The hierarchy changes weekly as reps are promoted, moved or quit.
- **Inside sales.** Call-center agents sell inbound leads and renewals by phone, typically on hourly pay plus commission; the center they work in is [The Contact Center](/books/field-operations/contact-center).
- **Technician-sold.** The technician on site recommends and sells repairs, replacements and plan upgrades (a water heater, a condenser, a variable-speed pool pump, a lawn plan's aeration add-on), and earns a commission or spiff on what they sell.
- **Office and customer service upsell.** Service reps add services or convert one-time customers to plans during calls.

The data model has to treat the org chart as history, not as a tree. An override is paid to whoever managed the rep *on the day of the sale*, so the reporting line is effective-dated, and a commission computed in September for a June sale reads the June hierarchy ([Temporal Data](/docs/database/temporal-data#as-of-queries)).

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE sales_assignments (
  id                           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id                    UUID NOT NULL,
  staff_member_id              UUID NOT NULL REFERENCES staff_members (id),  -- the rep
  role                         TEXT NOT NULL,     -- rep, team_lead, manager, regional, recruiter
  reports_to_staff_member_id   UUID REFERENCES staff_members (id),  -- manager during the range
  recruited_by_staff_member_id UUID REFERENCES staff_members (id),
  team_id                      UUID,
  market_id                    UUID,              -- the pricing zone the rep sells in
  commission_plan_version_id   UUID NOT NULL,     -- plan version in force
  valid_during                 DATERANGE NOT NULL, -- [from, to); open upper bound while current
  CONSTRAINT sales_assignments_valid_during_excl
    EXCLUDE USING GIST (tenant_id WITH =, staff_member_id WITH =, valid_during WITH &&)
);
```

Reps are `staff_members`, the same identity table as technicians and office staff, because people move between selling, servicing and managing and their history should follow them. The exclusion constraint is the standard one-row-per-moment pattern from [Temporal Data](/docs/database/temporal-data#one-naming-standard-range-columns).

## Recruiting and Onboarding

A seasonal sales business onboards hundreds of people in a few weeks, and each one passes a series of gates before they can knock a door. The gates are law, accreditation and local ordinance, and the system's job is to make sure no one is assigned a territory until every gate is closed.

![Onboarding gates for a field sales rep, left to right. After an offer is accepted, three tracks run in parallel: employment eligibility (Form I-9 Section 1 by the first day of work, Section 2 within three business days, an E-Verify case by the third business day), the tax form (W-4 for an employee or W-9 for a contractor), and screening (FCRA disclosure and authorization, then the background report and a driving record for drivers). Solicitor permits and badges come after screening. Only when every track is complete is the rep cleared to knock.](/diagrams/fo-sales-teams-and-commissions-onboarding.svg "Every track has to close before a territory is assigned. The permit usually waits on the background check, so screening sets the pace.")

**Employment eligibility.** An employee completes Section 1 of Form I-9 "any time after they accept the job offer" and "no later than their first day of employment". The employer completes Section 2 "within 3 business days of the date of hire," the first day of work for pay, and E-Verify employers may use an alternative procedure to examine documents remotely. An E-Verify case is created after the I-9 and "no later than the third business day after the employee starts work for pay". These deadlines run on business days from a start date, so store the start date, compute the deadlines, and alert before they pass.

**Tax forms.** An employee gives a Form W-4 so the employer can "withhold the correct federal income tax"; a contractor gives a Form W-9 with the TIN the payer needs for information returns. Which one you collect follows from classification, below.

**Background checks.** A background report from a consumer reporting agency is a consumer report under the FCRA. The FTC's employer guidance requires a written disclosure "in a stand-alone format," the person's written authorization, a pre-adverse action notice with a copy of the report and the summary of rights before rejecting someone, and an adverse action notice afterward naming the reporting company. State and local fair-chance laws add timing rules, so check where you hire. Screening vendors expose this as an API: Checkr's hosted flow sends the candidate an invitation to provide information and consent, a package determines what's screened, results arrive by webhook, and adverse action has its own resources.

Accreditation can add gates of its own: pest control's QualityPro requires background and motor vehicle record checks and an exam for sales employees, each a dated record per person and an exam not yet passed a gate like any other ([Licenses & Permits](/books/field-operations/licensing-and-permits#accreditation-and-manufacturer-programs)).

**Solicitor permits.** Many cities require door-to-door sellers to hold a permit and carry a badge, so an active permit for the city is one more onboarding gate: no territory assignment in a city where the rep has none. The credential model and per-city examples are in [Licenses & Permits](/books/field-operations/licensing-and-permits).

## Employee or Contractor

Whether a rep is an employee or an independent contractor decides almost everything downstream: the tax form, withholding, minimum wage and overtime, workers' compensation and how they're paid. It's a legal determination for counsel, and the rules are moving. What the system needs is to record the decision, per person and per period, and let it drive everything else.

The federal tests a counsel will weigh:

- **The FLSA economic reality test.** The Department of Labor's six factors are opportunity for profit or loss, the worker's and employer's investments, permanence, control, whether the work is integral to the business, and skill and initiative. DOL's fact sheet says the 2024 rule "remains in effect for purposes of private litigation," points to Field Assistance Bulletin 2025-1 for current enforcement, and notes a February 26, 2026 proposed rule.
- **IRS statutory nonemployees.** Direct sellers are treated as self-employed for federal tax purposes if substantially all their pay is "directly related to sales or other output" rather than hours, and they work under a written contract saying they won't be treated as employees. The statute (26 U.S.C. 3508) limits a "direct seller" to someone selling or soliciting the sale of **consumer products** in the home or otherwise than in a permanent retail establishment (or delivering newspapers). A pest, lawn or HVAC service plan is a service, not plainly a consumer product, so a rep selling service agreements may not qualify; that's a question for counsel, not an assumption to build in. Either way it's a tax rule only; it doesn't settle wage-and-hour status.
- **The outside sales exemption.** Under federal law, an employee whose primary duty is making sales and who is "customarily and regularly engaged away from the employer's place or places of business" is exempt from FLSA minimum wage and overtime, with no salary requirement; DOL's fact sheet treats door-to-door sales at a customer's home as away from the employer's place of business, while phone and internet selling generally isn't outside sales. That's the federal test only. States apply their own: California's Labor Commissioner defines an outside salesperson as one who "customarily and regularly works more than half the working time away" from the employer's place of business, a time test the federal rule doesn't use. Store the exemption decision per person, period and state.

For non-exempt employees (inside sales, most technicians), commissions "are payments for hours worked and must be included in the regular rate" used to calculate overtime, including commissions paid after the period they were earned. A commission credited in August for July hours means recomputing July's overtime; the regular-rate rules and the reallocation are in [Overtime and the Regular Rate](/books/field-operations/technician-workforce#overtime-and-the-regular-rate). State law adds more: California requires commission agreements to be in writing, to "set forth the method by which the commissions shall be computed and paid," and to be given to the employee signed, with a signed receipt kept.

## Commission Plans as Data

A **commission plan** is a versioned set of rules that turns sales events into pay. Plans change every season and often mid-season, and a dispute in October needs the plan that was in force in June, so plans are data with versions and effective dates, assigned to people through the effective-dated assignment table above.

The components the industry uses, in roughly the order they appear in a door-to-door plan:

- **Base rate:** a percentage of contract value, a flat amount per sale, or a per-product rate.
- **Tiers and accelerators:** a higher rate once a rep passes a volume threshold, applied retroactively to the season or only above the threshold (the plan must say which).
- **Adjustments:** a different rate for sales the plan treats differently, such as sales below the price floor ([Pricing & Sales Rules](/books/field-operations/pricing-and-sales-rules)).
- **Overrides:** a manager's cut of their team's production, read from the hierarchy on the sale date.
- **Splits:** two reps (or a rep and a technician) sharing one sale by percentage.
- **Advances and draws:** pay before the commission is earned, recovered from later earnings.
- **Holdback:** a share of earned commission withheld until a later date the plan names to cover cancellations.
- **Bonuses and contests:** one-time payouts for a target or a contest win.

```json
{
  "id": "0194c3c8-1e2d-7a6f-9b03-4c7e2d8f1a55",
  "plan": "example-field-sales",
  "version": 1,
  "valid_during": "[2026-01-01,)",
  "base": { "type": "percent_of_contract_value", "rate": 0.10 },
  "tiers": [{ "min_accounts": 100, "rate": 0.12, "is_retroactive": false }],
  "earn_when": ["agreement.activated", "visit.completed"],
  "holdback": { "rate": 0.20, "release_on": "2026-12-31" },
  "clawback": { "days_after_earned": 90, "on": ["agreement.terminated"] },
  "override": { "manager": 0.01 }
}
```

The numbers here are made up and deliberately round; the shape is the point. `earn_when` names the milestones the plan pays on. Contract value itself is defined by the business (initial charge plus a year of recurring charges, or the full term), and FieldRoutes shows why it needs care: when billing frequency differs from service frequency, its docs set a "Custom Production" value to the full service price "to ensure the technician gets proper credit". Commission must be computed from a declared production value, not from whatever the next invoice happens to be.

My rule: test plan changes against last season's real sales before they go live, the way CaptivateIQ describes testing against historical data. A tier change that looks small can move a top rep's pay by thousands.

## The Commission Ledger

The single most important design decision is to treat commissions as a **ledger** of immutable entries, not as a number on the sale that gets updated. A sale produces a pending entry; later events produce more entries; a rep's balance is the sum. Nothing is ever edited after it's paid, which is what makes disputes answerable.

![The commission ledger lifecycle. A signed sale creates a pending commission. If the agreement is cancelled inside the cooling-off window, the pending entry is voided. Once the agreement is active and the first visit is completed, the commission is earned; part is paid in the next pay period and part is held back. A termination within the clawback period after earning creates a negative clawback entry recovered from future pay. On the plan's release date the remaining holdback is released. The money that reaches the rep is accented; dashed arrows and boxes mark cancellations and reversals.](/diagrams/fo-sales-teams-and-commissions-ledger.svg "Each arrow is a new ledger entry, never an edit. A rep's balance is the sum of entries, so every number on a statement traces to an event.")

The events that move it come from the rest of the system ([Signing the Agreement](/books/field-operations/signing-the-agreement) publishes the first ones):

| Event | Ledger effect |
| ----- | ------------- |
| `agreement.signed` | `pending` entry at the plan's rate, with rep, overrides and splits resolved |
| `agreement.cancelled` (inside the cooling-off window, or verification failed) | `void` of the pending entry; nothing was ever owed |
| `agreement.activated` and the first `visit.completed` (a milestone, not a state) | `earned`; split into payable and holdback |
| Pay period closes | `payable` entries batched to payroll |
| `agreement.terminated` within the clawback period | `clawback` entry, negative, linked to the original |
| Any other trigger the plan names | `clawback` by the same path |
| Holdback release date | `release` of remaining holdback, net of clawbacks |
| Manual correction | `adjustment` with reason and approver |

**Clawbacks** are where trust is won or lost. QuotaPath's guidance (written for software sales) calls "a 3–4 month period post-sale" standard, recommends clawing back commission dollars rather than quota credit, and says reps should acknowledge the clause in writing and see which deals are at risk. Field-service windows are set by each business; what generalizes is that the window, the triggers and the recovery method are in the plan the rep signed, and the rep can see at-risk accounts on their statement.

Recovering a clawback means deducting from future pay, and federal and state wage laws limit deductions from an employee's wages; the plan and the recovery method need counsel's review in each state. The holdback exists partly to avoid that: a clawback nets against held money first. For a departed rep with no future pay, the system records the receivable and the business decides (with counsel) whether to pursue it; the system must never silently zero it.

Two engineering rules keep the ledger sane. Every entry carries an idempotency key derived from the triggering event (`agreement_id` + event type + plan version), so a replayed webhook can't pay twice ([Idempotency](/docs/payments/idempotency)). And amounts are integers in minor units with explicit rounding per entry, so a statement sums to the payroll export to the cent ([Money](/docs/payments/money)).

## Technician Sales and Upsells

When technicians sell, the commission rides on the job. ServiceTitan's Performance Pay credits the technician recorded as the seller with their "Sold By Rate" on the install job's base, usually the invoice subtotal; its example is a 5% rate on a $1,100 sink install with $100 of materials excluded, for a $50 commission. Pricebook items carry their own spiff as a percentage or a flat amount, split across technicians on the invoice when several worked the job, paid on completed jobs with posted invoices. ServiceTitan warns that enabling several options makes "bonus pay stack up," so a technician can be paid twice for one sale without careful configuration.

The generalizable lessons: commission on completed, invoiced work, not on estimates; let each pricebook item declare whether it pays commission and how much; record splits on the invoice, not in someone's spreadsheet; and add a rule that a single invoice line can't generate more than one commission type unless the plan explicitly says so. Because most technicians are non-exempt, every spiff feeds the regular rate for overtime ([Overtime and the Regular Rate](/books/field-operations/technician-workforce#overtime-and-the-regular-rate)).

Leads passed from technicians to sales reps (a "tech lead") need attribution too. Record the lead's source on the sale so the plan can pay a referral bonus without the technician having to claim it. How the opportunity is captured, quoted and attributed to both the finder and the seller, and the guardrails against pushy upselling, are in [One-Time Services & Upsells](/books/field-operations/one-time-services-and-upsells#upselling-as-a-system).

## Leaderboards and Contests

Leaderboards are how door-to-door teams manage motivation, and every D2D app has one. They're also the most common source of pay disputes, because a leaderboard shows sales that may never become customers. SalesRabbit and FieldRoutes both separate a **leaderboard**, which ranks reps on chosen metrics over time, from a **competition**, a specific event with rules participants must meet; FieldRoutes runs both for players and teams. The KPIs SPOTIO suggests door-to-door managers track are doors knocked per day, contact rate, conversation to demo, demo to close, average deal size and pipeline velocity, reviewed weekly.

- **Define each metric once.** "Sales" must mean the same on the leaderboard, in commissions and in finance ([Data Pipelines](/docs/architecture/data-pipelines#one-definition-per-metric)).
- **Label what's counted.** Show leaderboards in near real time, but say whether a number is signed today, net of cooling-off cancellations, first service done, or earned. A board of signed sales rewards pressure; rank on sales that survived cancellation and first service, or show both.
- **Freeze standings.** A contest result is a payout: version and publish its rules like a plan, snapshot the scoring with the metric definition version when the contest closes, and change it only through an audited adjustment entry.
- **Rank names, not customers.** Leaderboards read aggregates, never other reps' lead records ([Authorization](/docs/security/authorization)).

FieldRoutes' note that Leaderboard and Competitions need a signal is a reminder that these are server-computed views, not offline state.

## How the Platforms Do It

The tools fall into three groups: door-to-door sales apps that manage the team in the field, field-service suites that record who sold what, and incentive compensation platforms that calculate pay.

| Tool | Class | Team and pay |
| ---- | ----- | ------------ |
| Badger Maps | Field sales mapping | Scoreboard add-on |
| Enerflo | Solar suite | Sales through to install on one record |
| FieldRoutes | Vertical FSM (pest, lawn) | Each subscription has a `soldBy` field "used in commissions and sales reporting"; player and team competitions; the mobile Leaderboard and Competitions need a signal |
| Knockbase | D2D | Leaderboards, a commission calculator, live tracking |
| Knockio | D2D | Per-user plans |
| PestPac | Vertical FSM (pest) | Commissions and Sales Team Performance reports |
| RepCard | D2D | Leaderboards, sales contests, team chat; a recruiting module with onboarding documents, recruit tracker, background checks and ID badges; commissions |
| SalesRabbit | D2D | Leaderboards in Team, Pro and Enterprise; Competitions in Pro and Enterprise; "Amplify" with spot rewards and coaching |
| ServiceTitan | Trades suite (HVAC, plumbing, electrical) | Performance Pay: technician sales commission and item spiffs on completed jobs |
| SPOTIO | D2D | Gamification and leaderboards; its guide suggests training and shadowing in week one, co-selling in week two, selling alone with daily debriefs in week three and a full territory from week four |

How canvassing itself works (areas, knocks, door statuses, property data and scoring) is in [Door-to-Door Sales](/books/field-operations/door-to-door-sales).

The field-service suites record attribution; few run a full commission plan. That's what the incentive compensation platforms are for:

| Platform | What its public pages describe |
| -------- | ------------------------------ |
| CaptivateIQ | A guided plan builder; plans "versioned, tested against historical data, and validated before being deployed"; "full audit trails and calculation transparency" |
| QuotaPath | Automatic "Overpaid" records when earnings drop after a payout is scheduled; clawbacks recovered in one payout, split across several, or in installments |
| Salesforce Spiff | Real-time rep statements, "tracing" that shows how each commission component was calculated, dispute tickets on statements or deals, and an estimator on open opportunities |
| Xactly Incent | Handles "caps, clawbacks, and team-based bonuses," a built-in dispute system, a complete audit trail, and add-ons that connect to payroll, HRIS and ERP |

These platforms were built for B2B software sales: annual contracts, CRM opportunities, quarterly quotas. Field service brings different inputs (a sale is an agreement that may cancel in three days; "booked" isn't "serviced"; revenue arrives per visit), so the integration work is mapping agreement and service events into whatever the platform calls a deal.

## Paying It: Payroll Integration

Commissions leave the ledger through payroll for employees and accounts payable for contractors. For employees, each pay period's payable entries are summed per person and earning type and exported to the payroll provider. Gusto's embedded payroll API, for example, has standard earning types including "Bonus," "Tips" and "Commission," and lets a platform create company-specific earning types with `POST companies/{company_uuid}/earning_types`. Keep commission, spiffs, contest bonuses and draws as separate earning types, because they're taxed and treated for overtime differently.

Contractors are paid like vendors, by ACH or another payout rail, with the W-9 on file and year-end information returns ([Vendor Payouts](/books/payments/vendor-payouts)).

The export is a batch with a cutoff: entries earned before the cutoff go in this period, later ones wait. Lock the batch when it's exported, store the provider's reference, and reconcile what the provider actually paid against the batch. A correction after export is a new ledger entry in the next period, never a change to the locked batch.

## Auditing

Every rep checks their statement, and many dispute it. The incentive compensation platforms converge on the same answer: show the calculation. Spiff's tracing shows how each component was calculated and lets reps open tickets on statements or deals; CaptivateIQ makes "deal-level data, applied rules, and calculation steps" reviewable; Xactly describes a built-in dispute system. Build the same: a statement where every line links to its ledger entry, the event that caused it, the plan version and the rule applied, and a dispute workflow with a status, an owner, comments and a resolution that, if it changes pay, posts an adjustment entry.

The field-specific records behind that:

- **Hierarchy and attribution history:** every change to who reports to whom, and who changed `sold_by` or a split on an agreement, when, from where, before and after. Reassigning a sale after the fact is the simplest commission fraud there is.
- **Plan versions and acknowledgments:** every version's full rules, who approved it, when it took effect, and each rep's signed acknowledgment (California requires the signed receipt).
- **Onboarding records:** I-9 and E-Verify dates, FCRA disclosures, authorizations and adverse action notices, permits and their expiries, kept for the periods each rule requires.

The ledger itself is the record of every payout; record structure, actors and retention follow [Audit Trails](/docs/architecture/audit-trails), with field records in [Audit Trails & Records](/books/field-operations/audit-trails-and-records). Together they answer a wage claim, a misclassification audit, a state inspector asking whether a rep was permitted in a city on a given day, and a rep who's sure they were short-paid.

## What This Means for the System You Build

- **An effective-dated sales hierarchy,** so overrides and recruiter pay read the org chart as it was on the sale date.
- **Onboarding gates as data:** I-9, E-Verify, tax form, FCRA screening, accreditation rules and city permits, with computed deadlines, and no territory assignment until every gate is closed.
- **Worker classification recorded per person and period,** driving the tax form, pay engine, overtime treatment and payout rail.
- **Versioned commission plans,** tested against past sales before release, acknowledged by each rep, with production value defined explicitly.
- **A commission ledger of immutable entries** driven by agreement, service and payment events, with void, earn, holdback, clawback, release and adjustment as entries, idempotent per event.
- **Technician commissions on completed, invoiced work,** with per-item rules, invoice splits and a guard against stacked payouts.
- **Leaderboards that label what they count,** one metric definition shared with commissions and finance, and contests scored from frozen, versioned rules.
- **Locked payroll batches by earning type,** reconciled against what the provider paid, with corrections as new entries.
- **Statements that trace every line** to its event, plan version and rule, and a dispute workflow that posts adjustments.

## References

**Specifications**

- [USCIS: Completing Section 1, Employee Information and Attestation](https://www.uscis.gov/i-9-central/completing-form-i-9/completing-section-1-employee-information-and-attestation), Section 1 after the job offer is accepted and no later than the first day of employment
- [USCIS: Completing Section 2, Employer Review and Attestation](https://www.uscis.gov/i-9-central/completing-form-i-9/completing-section-2-employer-review-and-attestation), Section 2 within three business days of hire, and the remote alternative procedure for E-Verify employers
- [E-Verify: Create a Case](https://www.e-verify.gov/e-verify-user-manual-20-initial-verification/22-create-a-case), cases created after Form I-9 and no later than the third business day after work for pay begins
- [IRS: Statutory Nonemployees](https://www.irs.gov/businesses/small-businesses-self-employed/statutory-nonemployees), direct sellers treated as self-employed when pay relates to sales and a written contract says so
- [Cornell LII: 26 U.S.C. 3508](https://www.law.cornell.edu/uscode/text/26/3508), the statutory definition of direct seller, limited to consumer products sold in the home or outside a permanent retail establishment
- [29 CFR 778.117: Commission payments](https://www.law.cornell.edu/cfr/text/29/778.117), commissions included in the regular rate for overtime
- [California Labor Commissioner: Glossary, Outside Salesperson](https://www.dir.ca.gov/dlse/Glossary.asp?Button1=O), more than half the working time away from the employer's place of business
- [California Labor Code 2751](https://california.public.law/codes/labor_code_section_2751), written commission contracts stating the computation, a signed copy and a signed receipt

**Reference**

- [U.S. Department of Labor: Fact Sheet 13, Employee or Independent Contractor Classification](https://www.dol.gov/agencies/whd/fact-sheets/13-flsa-employment-relationship), the six economic reality factors and the status of the 2024 rule
- [U.S. Department of Labor: Independent Contractor Rulemaking](https://www.dol.gov/agencies/whd/flsa/misclassification/rulemaking), the 2024 final rule and the February 2026 proposal
- [U.S. Department of Labor: Fact Sheet 17F, Outside Sales Exemption](https://www.dol.gov/agencies/whd/fact-sheets/17f-overtime-outside-sales), primary duty of sales, away from the employer's place of business, no salary requirement
- [FTC: Using Consumer Reports, What Employers Need to Know](https://www.ftc.gov/business-guidance/resources/using-consumer-reports-what-employers-need-know), standalone disclosure, authorization, and pre-adverse and adverse action notices
- [IRS: About Form W-4](https://www.irs.gov/forms-pubs/about-form-w-4), employee federal income tax withholding
- [IRS: About Form W-9](https://www.irs.gov/forms-pubs/about-form-w-9), the TIN a payer needs for information returns

**In practice**

- [ServiceTitan: Performance Pay overview](https://help.servicetitan.com/docs/performance-pay-overview), Sold By Rate commissions, pricebook spiffs, invoice splits and stacking
- [FieldRoutes: Subscriptions API](https://knowledgebase.fieldroutes.com/apidocs/subscriptions.md), `soldBy` used in commissions and sales reporting
- [FieldRoutes: Set up recurring billing](https://knowledgebase.fieldroutes.com/docs/set-up-recurring-billing.md), Custom Production so the technician gets proper credit when billing differs from service
- [FieldRoutes: Mobile offline mode](https://knowledgebase.fieldroutes.com/docs/fieldroutes-mobile-offline-mode.md), Leaderboard and Competitions needing a signal
- [PestPac: Reporting](https://www.pestpac.com/features/pest-control-reporting-software), Commissions and Sales Team Performance reports
- [RepCard](https://www.repcard.com/), leaderboards, contests, recruiting and onboarding, commissions
- [SalesRabbit: Features](https://salesrabbit.com/features/), leaderboards and competitions by plan
- [SPOTIO: Door-to-door sales guide](https://spotio.com/blog/door-to-door-sales/), a four-week onboarding plan and the KPIs D2D managers should track
- [Knockbase](https://www.knockbase.com/), routing, live tracking, leaderboards, a commission calculator and storm data integration
- [Knockio](https://www.knockio.com/), area assignment, coverage tracking, pre-knocked data and per-user plans
- [Badger Maps](https://www.badgermapping.com/), territories, lead routing, CRM sync and GPS-verified check-ins
- [Enerflo](https://enerflo.com/), solar proposals with design, pricing and financing
- [SPOTIO](https://spotio.com/), gamification and leaderboards
- [FieldRoutes: Leaderboards and Competitions](https://knowledgebase.fieldroutes.com/docs/whats-the-difference-between-sales-leaderboards-and-competitions.md), the difference between the two
- [SalesRabbit](https://salesrabbit.com/), Amplify gamification
- [Salesforce Trailhead: Salesforce Spiff features for sales teams](https://trailhead.salesforce.com/content/learn/modules/commission-management-with-salesforce-spiff/explore-features-for-sales-teams), statements, tracing, dispute tickets and the estimator
- [CaptivateIQ: Incentives](https://captivateiq.com/incentives), versioned plans tested against historical data and audit trails
- [Xactly: Incent](https://www.xactlycorp.com/products/incent), clawbacks, disputes, audit trail and payroll integrations
- [QuotaPath: Schedule a clawback](https://help.quotapath.com/en/articles/6193646-schedule-a-clawback), automatic overpaid records and recovery in one, several or installment payouts
- [QuotaPath: Fair clawback policies](https://www.quotapath.com/blog/fair-clawback-policies/), a defined window, commission rather than quota clawbacks, and written acknowledgment
- [Checkr API](https://docs.checkr.com/), candidate invitations, packages, webhooks and adverse action resources
- [Gusto Embedded: Custom earnings](https://docs.gusto.com/embedded-payroll/docs/create-company-specific-custom-earnings), standard Commission and Bonus earning types and custom types
