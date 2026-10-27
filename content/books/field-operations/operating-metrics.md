+++
title = "Operating Metrics"
description = "The numbers field operations runs on: first-time fix, arrival windows, SLAs, utilization, job cost, close and booking rates, lead cost, churn, AR, safety."
category = "Field Operations Industry"
order = 1534
part = "Running the Platform"
tags = ["field-operations", "metrics", "analytics", "retention", "data-pipelines", "reporting"]
+++

Every field operations business is run from a short list of numbers: did the work get done the first time, did the technician arrive when promised, how much of the paid day was spent working, did the job cost what it was priced at, how many visits turned into sales, how many customers stayed, how much money is still owed, and how safely the trucks were driven. The platform produces every input as a side effect of running the business. The hard part is that each number has a dozen reasonable definitions, and the same branch can look excellent or failing depending on which denominator a report uses. When a technician's commission, a manager's bonus, a commercial customer's SLA credit or a buyer's valuation depends on the number, the definition is a contract. This chapter covers those metrics across recurring routes, repair and install work, commercial contracts and delivery, with formulas you can adopt. How to define a metric once, version it and compute it without slowing the product is general practice, in [One Definition per Metric](/docs/architecture/data-pipelines#one-definition-per-metric); what follows is the field-specific part.

## Why the Same Metric Disagrees

Three things make field service metrics slippery.

- **The unit differs.** FieldRoutes' Retention Report counts subscriptions, not customers: a customer with two subscriptions who cancels both appears twice, and subscriptions moved to as-needed or one-time are excluded. Stripe counts a customer with several subscriptions as one subscriber. Neither is wrong; they answer different questions.
- **The threshold differs.** ServiceTitan counts a job as converted only when its subtotal passes a configurable **sold threshold**, "the minimum subtotal dollar amount when you consider a job or estimate to be converted," with a $100 fallback when the setting is implausible. Two tenants with different thresholds have incomparable close rates.
- **The clock differs.** A technician's day can be measured from clock-in, from the first arrival, or from scheduled start; on-site time can come from what the technician typed or from the app's check-in events. FieldRoutes reports both, "Total Reported Time on Site" from recorded time in and out and "Total Actual Time on Site" from check-in and check-out times the technician cannot modify.

The design consequence: every metric is a named, versioned definition with a unit, a numerator, a denominator, inclusion rules and a clock, and every report that shows it computes it the same way. [What a Definition Contains](/docs/architecture/data-pipelines#what-a-definition-contains) lists the parts.

![A dimensional drawing of a technician's eight-hour clocked-in day, C1, split into coded load, drive, on-site, break and unload segments: 4.0 hours on site over three stops, 2.25 hours driving over four legs and 1.75 hours of load, break and unload. Tables give each segment's hours and the metrics from the same day: utilization V / C1 = 50%, drive share D / C1 = 28%, stops per hour N / C1 = 0.38.](/diagrams/fo-operating-metrics-day.svg "The same day yields different numbers depending on the denominator. Define the clock (clocked in, paid, or route hours) once and use it in every efficiency metric.")

## How the Platforms Report

The range runs from SMB tools with fixed report menus to configurable enterprise analytics, and from trade suites that measure the sale to delivery platforms that measure the stop.

| Platform | What its public docs report | How definitions are set |
| --- | --- | --- |
| Bringg | On-time percentage and consumer ratings; on-time is configurable as ETA and ETL within window, only ETA within window, or allow late | Tenant choice |
| Dynamics 365 Field Service | SLA KPIs on work orders, such as arrival time and resolution, with warning and failure durations | Tenant defines each SLA, its start field, business hours and pause conditions |
| FieldRoutes | Technician Stats (completion, re-service, cancels caused by tech), Route Summary (drive and on-site efficiency, flags), Retention, AR, Commission, Sales, Knocking reports | Fixed formulas documented per report; filters and grouping by office, tech, source |
| Geotab | Driver Safety Scorecard, 0 to 100 from weighted rule violations | Tenant adjusts weights (must total 100%) and risk bands |
| Jobber | Financial, Work and Client reports under Insights, web only, for admins or users with a Reports permission | Fixed report set by plan |
| ServiceTitan | Technician performance boards: revenue, jobs, close rate, average sale by service or replacement, replacement rate, holds, cancels; membership reports | Tenant sets sold threshold and service/replacement threshold; Dispatch Pro scores technicians against job-type medians |
| Upper | Routes and stops completed, on-time rate ("Share of deliveries completed within the time window"), missed or skipped stops, average stops per route, average service time per stop | Fixed cards; on-time named "On-Time Service Rate" in service workspaces |

Two patterns stand out. The trade suites (ServiceTitan, FieldRoutes) attribute outcomes to people, because pay and coaching depend on it: FieldRoutes charges a subscription cancel to the technician who "was the last to service before cancellation." The delivery platforms (Upper, Bringg, Spoke) measure the stop and the window, because their customers' contracts are written in those terms. A platform that serves both needs both views over the same facts.

## Service Delivery

**Completion rate** is the plainest number and still needs rules. FieldRoutes defines Completion % as appointments serviced divided by appointments scheduled, where scheduled includes pending and no-show appointments but excludes cancelled and rescheduled ones. The exclusion matters: a dispatcher who reschedules every at-risk visit can keep completion near 100% while customers wait. Track reschedules as their own rate, by who initiated them (customer, office, technician, weather).

**First-time fix rate** is the share of jobs resolved without going back. ServiceTitan's metrics guide defines it as jobs not requiring a follow-up visit divided by total jobs. For recurring service the industry inverts it: FieldRoutes reports **Re-service %**, re-services caused by the technician divided by the average services per period, and lets the office record the technician as the reason for a re-service. The unit is the work order, not the visit, because the work order is what was promised. A workable definition for both repair and recurring work:

```text
first_time_fix_rate =
  count(work orders completed on their first completed visit
        with no callback work order within N days)
  / count(completed work orders whose callback window has closed)
```

Two things can spoil a first-time fix, and they're recorded differently:

- **A second visit on the same work order.** The technician diagnosed the water heater but the right one was at the supply house: the first visit is `completed`, the work order stays open with `hold_reason = 'part_needed'` (or `approval_needed`, `permit_needed`), and a second visit finishes it. That's not a callback. It fails first-time fix as a stocking or diagnosis problem, and the hold reason tells you what to stock on the truck.
- **A callback.** The work was finished and the problem came back: a new work order with `source = 'callback'` and `callback_of_work_order_id` pointing at the original, set when the callback is booked, never inferred later from "same address within 30 days," which counts a new problem as a failure. Code its cause (`workmanship`, `diagnosis_wrong`, `equipment_failure`); the workmanship number is the one that belongs in a scorecard.

N is a tenant setting by service type (a pest re-service guarantee might run to the next scheduled visit; an HVAC repair warranty might be 30 days), and the metric covers only work orders whose window has closed. Report first-time fix overall and split by the two causes.

**Arrival window adherence** measures whether the technician arrived inside the promised window. ServiceTitan defines the arrival window as "the time frame when a technician is supposed to arrive at the service location for the job," which makes arrival the event to measure. Delivery platforms differ: Upper counts completion within the window, and Bringg lets the tenant choose whether both ETA and ETL (estimated time leaving) must fall inside it. A workable definition:

```text
arrival_window_adherence =
  count(visits where window_starts_at <= arrived_at <= window_ends_at)
  / count(visits with a promised window and a recorded arrival)
```

Report early and late separately (an early arrival at a customer who isn't home is a failed visit in disguise), and use the arrival the platform observed (geofence entry or check-in at the location) over a tapped status. FieldRoutes' Route Summary flags a check-in more than a mile from the appointment's location and a recorded time that differs from check-in by more than two minutes; the same checks belong in your arrival fact before it feeds a metric. Visits with no window (anytime routes) are excluded from the denominator, not counted as on time. The window is stored as local time at the property with its time zone ([Time & Date Formats](/docs/fundamentals/time)) and converted to instants once, in the fact.

**Actual vs scheduled duration** is the planning metric. FieldRoutes reports the average difference between actual on-site time and scheduled duration, with flags for "left early" and "stayed long" and a fluctuation flag above 30%. Scheduled durations that run consistently short break every downstream route ([Route Optimization](/books/field-operations/route-optimization)); feed the actuals back into duration estimates per service type and property size.

## Contracts, Bids and Job Cost

**SLA compliance.** A commercial maintenance contract promises response, not a window: on site within four hours of an emergency work order. Dynamics 365 Field Service models it with KPIs such as work order arrival time, an "applicable from" field that starts the clock (the work order's creation, for example), optional business hours and pause conditions, and warning and failure durations, so a work order shows "nearing noncompliance" before it fails. What settles disputes:

- **The clock start** is a named field, stored with the result: creation, first contact and customer approval give different answers for the same job.
- **Pauses come from the contract** and happen only through a recorded status with a reason (customer unreachable, part on order), so the customer can see why.
- **Success is an observed event:** arrival from check-in, resolution from completion, not a status the office set afterwards.
- **Report compliance per contract,** because the SLA credit is computed per contract, and per priority, because a perfect record on routine calls hides a failing emergency response.

**Estimated vs actual job cost.** Bid work lives on whether the job cost what it was priced at. Aspire, built for commercial landscaping, compares estimated labor and material with actual job cost from the division down to the individual work ticket. Janitorial tools make the same comparison per site: Swept tracks the variance between scheduled and actual hours "to spot underbid sites." A workable definition is a margin variance per job or per site and period: estimated cost minus actual cost (labor from clocked time at the loaded rate, materials from what was used), divided by estimated cost. Recurring sites with a persistent negative variance are a repricing list ([Pricing & Sales Rules](/books/field-operations/pricing-and-sales-rules)).

**Materials per stop.** Pool Brain tracks chemical cost "by customer, job, property, body of water, technician and total company spend," and its route profit report flags routes making good profit, low profit or losing money against a target percentage. The same idea works for any trade with consumables: product per lawn round, chemical per pest service, filters per HVAC maintenance visit. Compute it from recorded material use, the same record that feeds [Regulated Materials](/books/field-operations/regulated-materials) for pesticides.

**Warranty claim recovery.** Appliance and HVAC servicers doing manufacturer or home-warranty work get paid by a claim, not the customer. ServicePower's claims tooling adjudicates claims automatically with "built-in validation" so "only valid claims are approved for payment." The servicer's metrics are claims submitted per warranty job, approval on first submission, rejection reasons and days to payment. A rejected claim is free labor, often for missing evidence (a serial number, a failed part's photo) the technician app could have required before completion ([Proof of Service](/books/field-operations/proof-of-service)).

## Route Efficiency

Efficiency metrics share one denominator problem, drawn above. ServiceTitan's guide defines **technician utilization** as time on field jobs divided by total time worked, and FieldRoutes' Route Summary divides both drive and on-site time by clocked-in time. Workable definitions, all on one clock:

- **Utilization** = on-site time ÷ clocked-in time. Paid time is the alternative denominator; choose one and name it in the metric.
- **Drive share** = drive time ÷ clocked-in time, where drive time is time moving between the first departure and the last arrival, from telematics or app location, not from planned route legs.
- **Stops per hour** = completed stops ÷ clocked-in hours. Vendors don't publish a formula for this one; Upper reports average stops per route and average service time per stop instead.
- **Revenue per route hour** = production value of completed visits ÷ clocked-in hours. Dividing by hours is what makes a dense route and a sparse one comparable.
- **Planned vs actual** drive and duration per route, which Track-POD exposes as plan and actual fields, is how you tell a bad plan from a bad day.

Exclude re-services and no-charge callbacks from production value, or a technician who causes callbacks looks more productive. A delivery or cleaning route adds failed stops by reason (not home, no access, refused), which Spoke reports alongside late stops and cost per delivery; a failed stop costs the drive and earns nothing. For delivery, **first-attempt delivery rate** is delivery work orders completed on their first visit ÷ delivery work orders closed (completed, or returned after a failed attempt), and cost per stop is reported beside cost per delivery so the gap shows what failed attempts cost ([Last-Mile Delivery & Distribution](/books/field-operations/last-mile-delivery)).

## Sales and Memberships

**Close rate** (conversion rate) in ServiceTitan's Dispatch Pro is jobs sold above the sold threshold divided by jobs completed, excluding recall and warranty jobs. **Average ticket** is the technician's "Job Avg," the total income from completed jobs divided by all completed, convertible jobs, and Dispatch Pro compares it with the job type's median average ticket and multiplies the two into a technician job score. That design is worth copying: comparing a technician with the median for the job types they ran removes the advantage of being dispatched the lucrative calls. **Replacement rate** is ServiceTitan's "Rep. Rate," completed jobs whose total passes both the sold threshold and a separate service/replacement threshold, over all completed jobs. On replacement work (a furnace, a water heater, a pool heater) report it per diagnostic visit next to close rate, because a technician who recommends replacement on every old unit closes big tickets and loses customers who needed a repair.

**Membership conversion** is the share of eligible visits where a non-member bought a membership or service agreement. ServiceTitan doesn't publish a formula for it. A workable definition:

```text
membership_conversion =
  count(eligible visits where a membership was sold on the visit)
  / count(completed visits to non-member properties, excluding recalls)
```

Credit the sale to the visit and seller recorded on the agreement, as FieldRoutes' API does with a subscription's `soldBy` field, "used in commissions and sales reporting." Decide in the definition whether renewals count. They usually shouldn't: a renewal is retention, not conversion. [Service Agreements & Plans](/books/field-operations/service-agreements) covers the agreement record.

The one-time and upsell numbers from [One-Time Services & Upsells](/books/field-operations/one-time-services-and-upsells) are defined here too:

```text
attach_rate =
  count(active recurring agreements at period end with at least one add-on line in their current terms)
  / count(active recurring agreements at period end)

one_time_to_plan_conversion (cohort, window W days) =
  count(properties in the cohort with a recurring agreement that reached active
        within W days of the one-time work order's completion)
  / count(properties with a one-time work order completed in the cohort period
          and no active recurring agreement on the completion date)

revenue_per_visit =
  sum(net invoiced amount attributed to completed visits in the period, after credits)
  / count(completed visits in the period, excluding callbacks)
```

- **Attach rate** is per agreement. A per-visit variant (completed plan visits on which an extra was sold, over completed plan visits) answers a different question, technician behavior rather than book composition; report it under its own name.
- **One-time-to-plan conversion** counts agreements that reached `active`, so a sale cancelled inside the window doesn't count, and it needs a lag: a cohort can't be judged until its window closes. ServiceM8's quote win rate shows the shape: the share of quotes created 28 to 56 days ago that became work orders or completed within 28 days of creation. It isn't ServiceTitan's conversion rate, which is close rate on repair tickets.
- **Revenue per visit** spreads periodic plan billing across visits at the per-visit value from the service balance ([Billing Recurring Service](/books/field-operations/billing-recurring-service#service-driven-or-calendar-driven-and-the-gap-between-them)), so a monthly-billed lawn or pool plan doesn't make winter visits look free. Split it into base and upsell revenue to see what upselling adds.

Booking rate and the marketing numbers that feed the top of the sales funnel are in [Calls and Leads](#calls-and-leads) below.

Door-to-door teams run a [funnel](/docs/telemetry/product-analytics#funnels) instead (SPOTIO lists doors knocked, contact rate, conversation to demo, demo to close and deal size). The rate that matters most is the one the funnel leaves out: the share of sales that are still paying customers after the first service and after a fixed window the business picks, because a sale that cancels early still cost the commission and the visit. [Sales Teams & Commissions](/books/field-operations/sales-teams-and-commissions) covers clawbacks against that number.

## Calls and Leads

Two chapters produce these inputs: [The Contact Center](/books/field-operations/contact-center) classifies every call as booked, unbooked, excused or abandoned, and [Marketing & Lead Sources](/books/field-operations/marketing-and-lead-sources) ties each lead to a source, a campaign and its spend. The definitions live here so the CSR scorecard, the marketing dashboard and the commission run read the same numbers.

**Booking rate** measures the phone, not the truck. ServiceTitan's legacy dashboard defines inbound call booking rate as "the percent of call leads that are booked into jobs," where a call lead is a call of at least 60 seconds or one marked as a lead; its Voice Intelligence version, which replaces the legacy number on Max accounts, is "the percentage of bookable calls that resulted in a booked job." Both leave out calls that were never a chance to book. I call mine **booked-call rate** to keep it apart from a scheduler's bookings:

```text
booking_rate (booked_call_rate) =
  count(inbound calls with outcome = booked)
  / count(inbound calls with outcome IN (booked, unbooked))
  -- excused and abandoned calls are in neither term
```

A call is booked when a work order was booked on the call; a callback that books tomorrow is credited to the outbound call, not retroactively to the inbound one. Unbooked is a lead call that didn't book, with its reason (price, no availability, out of area, just shopping); excused is a call that was never an opportunity (a vendor, a wrong number, a job applicant). What makes a call a lead, who may excuse it and what counts as booked are versioned settings, described in [Call Outcomes and Booking Rate](/books/field-operations/contact-center#call-outcomes-and-booking-rate). Report it per CSR, queue, brand and campaign, with human and AI-answered calls separate on the same definition ([AI in Field Operations](/books/field-operations/ai-in-field-operations)), and by unbooked reason: a rise in `out_of_area` is a marketing problem, not a CSR one.

**Answering metrics** say how well calls are answered, and vendors define them differently in ways that move the numbers:

- **Abandonment rate.** Amazon Connect computes contacts abandoned ÷ contacts queued, where an abandoned contact was "disconnected by the customer while in queue," and "Contacts queued for callback are not counted as abandoned." It doesn't exclude short abandons by default; Genesys makes the **short abandon** threshold configurable and notes "The abandon rate does include short abandons." Pick a threshold (callers who hang up within a few seconds are often misdials), state it, and report both.
- **Average speed of answer.** Amazon Connect's queue answer time is the "average time that contacts waited in the queue before being answered by an agent... also known as average speed of answer (ASA)."
- **Service level.** The share of calls answered within X seconds. Amazon Connect counts a contact as within service level when it leaves the queue within X, whether "an agent answers the contact, the customer abandons the contact, or the customer requests a call back"; Genesys offers a formula of (answered − answered over the threshold) ÷ (answered + abandoned). Those are different numbers from the same calls, so name the formula with the target.

**What a call is worth** completes the phone picture:

```text
revenue_per_call = sum(revenue invoiced within the horizon on work orders booked from lead calls)
                   / count(lead calls)
calls_per_job    = count(inbound calls about a work order after it was booked)
                   / count(booked work orders)
```

Revenue per call catches the CSR who books fast but books the cheapest option, and the campaign whose calls book but don't sell. Calls per job counts failures upstream: every "where's my technician?" call is a notification that didn't go out.

**Lead and campaign metrics** follow the lead from its source to revenue:

```text
cost_per_lead        = spend(campaign, period) / count(leads from campaign in period)
                       -- leads net of duplicates; credited leads excluded from both terms
lead_booking_rate    = count(leads with a booked work order) / count(leads)
cost_per_booked_job  = spend(campaign, period) / count(leads that booked a work order)
attributed_revenue   = sum(invoiced revenue within the horizon on work orders attributed
                         to the campaign) + first-year value of agreements sold from them
roi                  = (attributed_revenue - spend) / spend
customer_acq_cost    = spend(source, period) / count(new accounts from source in period)
```

Housecall Pro's formula, "ROI = (Selected earnings − Marketing spend) ÷ Marketing spend," is the same shape. The choices inside them:

- **Spend for pay-per-lead sources** is the sum of lead charges net of credits, by the lead's date, not the source's invoice date; exposure spend (clicks, mail) is the campaign's monthly spend.
- **The horizon is fixed,** for example revenue in the first 12 months with an agreement counted at its first-year contract value. First invoice undervalues plans; lifetime revenue rewards old campaigns forever. The attribution model and its version are stored with each result ([Attribution: From Lead to Job to Agreement](/books/field-operations/marketing-and-lead-sources#attribution-from-lead-to-job-to-agreement)).
- **Existing customers are out of acquisition.** Repeat work from an existing customer is reported under its own source, as retention, so the campaign that owns the main phone number doesn't take credit for the customer base.
- **ROI on margin** for any trade with real material costs. ROI on revenue overstates return for a replacement-heavy HVAC business.

Report cost per booked job beside cost per lead: two sources with the same cost per lead can differ several times over in how many leads book.

## Retention and Churn

Stripe defines **subscriber churn rate** as churned subscribers in the past 30 days divided by active subscribers 30 days ago plus new subscribers in the past 30 days. FieldRoutes' **Cxl Rate** is cancelled subscriptions over active subscriptions per period, and its Retention Calendar groups cancellations by the period the subscription was added, which is a cohort view ([Cohorts and Retention Curves](/docs/telemetry/product-analytics#cohorts-and-retention-curves)).

The definitions that work for field service:

- **Logo churn** = accounts whose last active agreement ended in the period ÷ accounts active at the start plus accounts added during it. Count the account once, as Stripe does.
- **Agreement churn** = agreements `terminated` in the period ÷ agreements active at the start plus agreements activated during it, counted per agreement like FieldRoutes' Retention Report, for product decisions ("which plan loses customers"). A homeowner who keeps an HVAC membership but ends a separate plumbing plan is agreement churn and not logo churn.
- **Cohort retention** by sale month, sales rep, lead source and service type, which is where door-to-door seasonality and rep quality show.
- **Churn typed and reason-coded.** Churn is an `active` agreement ending as `terminated`, and every termination carries a `churn_type` and a reason; one without them is a gap in the data. The first two types are standard subscription-billing vocabulary: Chargebee defines voluntary churn as "the purposeful cancellation of a subscription" and involuntary churn as a payment failure "leading to their subscription being canceled," Recurly describes involuntary churn as loss "caused by factors outside their direct intent," and ServiceTitan uses the same term for memberships lost to failed payments. The third is my own addition:
  - `voluntary`: the customer chose to leave (price, dissatisfied, competitor, moved). A customer who moves is voluntary churn unless the agreement transfers to the new owner of the property, in which case nothing churned.
  - `involuntary`: payment failure or non-payment, fixed by billing, not service ([Collections & Retention](/books/field-operations/collections-and-retention)).
  - `administrative`: ended for reasons neither side's behavior explains, such as a deceased customer, a property demolished, or the company leaving the service area. A separate type keeps them out of both the retention team's and the billing team's numbers.
- **Recovery rate** = failed amounts later recovered ÷ failed amounts, by channel (retry, dunning, technician, agency) and with days to recovery, from the channel recorded on each recovered payment ([Collections & Retention](/books/field-operations/collections-and-retention#retries-how-the-platforms-do-it)).
- **Save rate** = cancellation requests ending `saved` ÷ cancellation requests received, by offer and by reason, with the 90-day survival of saved agreements beside it. A saved request is not churn, but it is a signal, and the offer's cost belongs next to it ([Retention Offers and Saves](/books/field-operations/collections-and-retention#retention-offers-and-saves)).

Two field-specific cautions. Cancellations before activation, including inside the cooling-off window, are `cancelled`, not churn: the agreement never became `active`, and counting them inflates churn in exactly the months door-to-door sales peak. They belong in the sales funnel. And seasonal plans (lawn rounds, mosquito, pool opening and closing) go quiet every year by design, but they don't end: the off-season is the recurrence's season, and the agreement stays `active` through it unless its term ends there. A quiet winter is not churn, so count a seasonal agreement as churned only when it is `terminated`, and measure seasonal retention season over season.

Attribution of a termination to a technician ("last to service before cancellation") is useful for coaching and dangerous for pay: a customer who moves away is not the last technician's fault. Use it on voluntary terminations with a service reason only.

## Receivables

**Accounts receivable aging** groups unpaid balances by how long they have been outstanding, usually in 30-day buckets (current, 1 to 30, 31 to 60 days and so on). Collections works from it as a list, one row per customer aged by its oldest unpaid invoice ([Collections & Retention](/books/field-operations/collections-and-retention#ar-aging-and-write-offs)). FieldRoutes' AR report shows the decisions a definition must make: age measured from invoice date or due date, and the whole account balance placed in the bucket of the oldest unpaid invoice or each invoice aged separately. The two choices produce different totals per bucket from the same ledger. Your platform should produce aging as of any past date, which means computing it from the ledger's entries and their dates, never from current balances ([Payment States & Ledgers](/docs/payments/payment-states)).

A common collection-speed metric is **days sales outstanding**, `DSO = (ending AR ÷ credit revenue for the period) × days in the period`, reported alongside the share of recurring revenue on autopay, since a residential book on stored cards has little AR to age and a commercial book on net-30 terms has a lot. Report residential and commercial separately; blended, a few large commercial invoices dominate the number.

## Safety

Fleet safety scores come from telematics vendors, and the formula is theirs. Geotab's Driver Safety Scorecard scores drivers 0 to 100 "based on how frequently they trigger these events," using six rules with default weights: hard acceleration, harsh braking and harsh cornering at 10% each, seatbelt and speeding at 20% each, and excessive speeding at 30%; default risk bands are 90 to 100 low, 75 to 90 mild, 60 to 75 medium and below 60 high. Samsara's safety score endpoints return the raw harsh-event counts and distance with the score.

Store the raw events and the exposure (miles and drive hours), not just the vendor's score. Scores change when the vendor or tenant changes weights, and a comparison across a weight change is meaningless unless you can recompute it. Report **events per 1,000 miles** next to the vendor score so a technician with a long rural route isn't compared on raw counts with one who drives six miles a day. [Fleet, Inventory & Safety](/books/field-operations/fleet-and-safety) covers the telematics integration.

## Building the Pipeline

Metrics that drive pay and SLA credits need a pipeline that is complete, replayable and kept off the production database ([Separating Production and Analytics](/docs/data/separating-production-and-analytics)); [Data Pipelines & Analytics](/docs/architecture/data-pipelines) covers each step. The field-specific parts are which facts to model ([Facts and Dimensions](/docs/data/data-modeling#facts-and-dimensions) covers grain and modeling in general) and two common holes.

![The metrics pipeline: platform database changes captured from the log into an append-only raw layer, then staging and marts, then one set of metric definitions feeding dashboards, commission runs, in-app scorecards and customer exports.](/diagrams/fo-operating-metrics-pipeline.svg "Metrics are defined once, after the marts, and every consumer reads the same definition, so the dashboard and the commission run cannot disagree.")

The core marts are a visit fact (one row per visit with scheduled, arrived, completed and cancelled times, window, technician, route, service type and production value), a route-day fact (clock in and out, drive, on-site, miles), a work order fact for first-time fix, SLA and job cost (callback link, holds, clock start, pauses, estimated and actual cost), an agreement history (one row per agreement state interval) and a ledger-based AR fact. The visit and work order facts are derived from the canonical `visits` and `work_orders` models, with the columns metrics need:

```sql
-- One row per visit; the route day is the branch's business date
CREATE TABLE fct_visits (
  visit_id               UUID PRIMARY KEY,
  tenant_id              UUID NOT NULL,
  work_order_id          UUID NOT NULL,
  branch_id              UUID NOT NULL,
  business_on            DATE NOT NULL,          -- branch-local, assigned once
  resource_id            UUID,                   -- the technician or crew
  route_id               UUID,
  service_type           TEXT NOT NULL,
  status                 TEXT NOT NULL,          -- completed, not_completed, cancelled
  status_reason          TEXT,                   -- not_home, no_access, weather, ...
  window_starts_at       TIMESTAMPTZ,            -- converted once from local window + zone
  window_ends_at         TIMESTAMPTZ,
  arrived_at             TIMESTAMPTZ,            -- observed check-in, not typed
  is_arrived_on_location BOOLEAN,
  completed_at           TIMESTAMPTZ,
  production_amount      BIGINT NOT NULL DEFAULT 0,  -- minor units
  currency               CHAR(3) NOT NULL,
  definition_version     TEXT NOT NULL           -- which metric rules built this row
);

-- One row per work order; first-time fix is computed here, not per visit
CREATE TABLE fct_work_orders (
  work_order_id             UUID PRIMARY KEY,
  tenant_id                 UUID NOT NULL,
  source                    TEXT NOT NULL,       -- occurrence, request, sale, callback
  callback_of_work_order_id UUID,                -- set when the callback is booked
  callback_cause            TEXT,                -- workmanship, diagnosis_wrong, equipment_failure
  hold_reasons              TEXT[],              -- part_needed, approval_needed, ...
  completed_visit_count     INTEGER NOT NULL,
  completed_at              TIMESTAMPTZ,
  is_first_time_fix         BOOLEAN,             -- null until the callback window closes
  definition_version        TEXT NOT NULL
);
```

The two holes. **Hard deletes:** a cancelled visit that was hard-deleted disappears from a polling extract and quietly raises the completion rate, which is why the capture is log-based ([Change Data Capture](/docs/architecture/data-pipelines#change-data-capture)). **The route day:** a technician's day belongs to the branch's local date, and an evening emergency call converted to UTC lands on tomorrow's report ([Assign the Business Date Once](/docs/architecture/data-pipelines#assign-the-business-date-once)).

**Buy or build.** On a vendor platform the warehouse still works: Fivetran's ServiceTitan connector syncs jobs, invoices, payments and appointments incrementally, captures deletes for customers, locations, memberships and technicians, and re-imports contact tables weekly to catch deletes. An incremental sync without delete capture has the same hard-delete hole as polling. If you build the platform, ship the export yourself.

## Auditing Metric Definitions

A metric that sets pay or an SLA credit will be disputed. Versioning definitions, stamping outputs, freezing paid periods and logging overrides are covered in [Versions, Stamps and Frozen Periods](/docs/architecture/data-pipelines#versions-stamps-and-frozen-periods), and the audit record itself in [Audit Trails](/docs/architecture/audit-trails). What field operations adds:

- **Tenant settings are definitions.** ServiceTitan's sold threshold, Geotab's weights, a callback window per service type and an SLA's clock start and pause conditions change a metric without touching code, so each change is logged with who, when and the before and after values.
- **Reclassifications move pay.** Marking a re-service as "not caused by tech," excusing a late arrival for weather, pausing an SLA clock or recoding a cancellation reason is an attributed action with a reason, reviewable by someone other than the person it benefits.
- **Watch for gaming.** Rising reschedules alongside a perfect completion rate, check-ins far from the property, recorded times that diverge from app events, SLA pauses clustered just before the failure time, and terminations coded to reasons that carry no clawback are the patterns to alert on.

[Audit Trails & Records](/books/field-operations/audit-trails-and-records) covers the field records these metrics are built from.

## What This Means for the System You Build

- **Every metric is a versioned definition.** Unit, numerator, denominator, inclusion rules, clock and owner, stored as code, with tenant settings that affect it logged.
- **One computation, every consumer.** Dashboards, technician scorecards, commission runs, SLA credits and exports read the same definition.
- **Observed events over typed ones.** Arrival, on-site and drive time come from check-in, geofence and telematics events; typed times are kept and compared, never preferred.
- **First-time fix per work order.** Callbacks are work orders with `source = 'callback'` and `callback_of_work_order_id` set at booking, a tenant-configured window per service type, and second visits for parts (a work order hold, not a callback) reported apart from workmanship.
- **SLA clocks as data.** Start field, business hours, pauses with reasons, warning and failure durations, and success from an observed event, reported per contract and priority.
- **Job cost against the estimate.** Labor from clocked time and materials from recorded use, per job, site and route, so underbid work is visible.
- **Sales numbers defined once:** close rate, average ticket, replacement rate, membership and one-time-to-plan conversion, attach rate and revenue per visit.
- **Phone and marketing numbers defined once:** booked-call rate with versioned outcome rules, abandonment with a stated short-abandon threshold, ASA and service level with named formulas, revenue per call, and cost per booked job and ROI over a fixed horizon.
- **Count accounts and agreements separately.** Logo churn, agreement churn, cohort retention, and terminations typed voluntary, involuntary or administrative with a reason, with pre-activation cancellations and seasonal ends excluded.
- **AR as of any date.** Aging and DSO computed from ledger entries, with the invoice-date or due-date choice named in the definition.
- **Raw safety events and exposure.** Vendor scores, raw events and miles kept so scores can be recomputed and normalized.

## References

**Reference**

- [Debezium: Features](https://debezium.io/documentation/reference/stable/features.html), log-based change data capture that captures all changes, deletes and old record state without polling
- [Stripe: Billing analytics](https://docs.stripe.com/billing/subscriptions/analytics), subscriber churn rate, counting a customer with several subscriptions once
- [Chargebee: Voluntary and involuntary churn rate](https://support.chargebee.com/support/solutions/articles/257268-difference-between-voluntary-involuntary-churn-rate), voluntary churn as purposeful cancellation and involuntary churn as cancellation after a payment failure
- [Amazon Connect: Metrics definitions](https://docs.aws.amazon.com/connect/latest/adminguide/metrics-definitions.html), abandonment, queue answer time and service level
- [Genesys Cloud: Performance view columns](https://help.genesys.cloud/articles/view-available-columns-in-performance-views-by-category/), service level with abandons and short abandons
- [Recurly: Involuntary churn](https://docs.recurly.com/recurly-subscriptions/docs/involuntary-churn), customer loss from factors outside the customer's intent, such as expired cards and failed payments

**In practice**

- [ServiceTitan: Dispatch Pro technician performance report](https://help.servicetitan.com/v1/docs/dispatch-pro-technician-performance-report-template), conversion rate and average ticket formulas, the sold threshold and its $100 fallback, job-type medians
- [ServiceTitan: Technician's close or conversion rate does not look correct](https://help.servicetitan.com/docs/technicians-close-or-conversion-rate-does-not-look-correct), job opportunities, converted opportunities and the sold threshold
- [ServiceTitan: Modular dashboard call metrics](https://help.servicetitan.com/how-to/modular-dashboard-call-metrics), inbound call booking rate over call leads of 60 seconds or marked as leads
- [ServiceTitan: Monitor call performance with Voice Intelligence](https://help.servicetitan.com/docs/monitor-call-performance-with-voice-intelligence-in-servicetitan), booking rate over bookable calls, replacing the legacy rate on Max accounts
- [Housecall Pro: Marketing dashboard ROI table](https://help.housecallpro.com/en/articles/14890593-marketing-dashboard-roi-table), the ROI formula per lead source
- [ServiceTitan: Membership Renewal Protection](https://www.servicetitan.com/blog/membership-renewal-protection), failed payments described as involuntary churn (vendor blog, 2019)
- [ServiceTitan: Technician Performance Board](https://help.servicetitan.com/commercial/docs/technician-performance-board-legacy-report), revenue, close rate, job average and the replacement rate (Rep. Rate) definition
- [ServiceTitan: Field service metrics](https://www.servicetitan.com/blog/field-service-metrics), first-time fix rate and technician utilization definitions
- [ServiceTitan: Set up arrival windows](https://help.servicetitan.com/docs/set-up-arrival-windows.md), the arrival window definition
- [ServiceTitan: Memberships workflows](https://help.servicetitan.com/docs/basic-memberships-workflows), membership reports
- [FieldRoutes: Technician Stats key indicators](https://knowledgebase.fieldroutes.com/docs/technician-stats-report-technician-stats-and-key-indicators.md), completion %, re-service %, reported vs actual time on site, cancels caused by tech
- [FieldRoutes: Route Summary Report](https://knowledgebase.fieldroutes.com/docs/route-summary-report.md), drive and on-site efficiency over clocked-in time, actual vs scheduled, location and timing flags
- [FieldRoutes: Retention Report](https://knowledgebase.fieldroutes.com/docs/retention-report.md), subscription-level cancellation rate and retention calendar
- [FieldRoutes: Accounts Receivable Report](https://knowledgebase.fieldroutes.com/docs/accounts-receivable-report.md), aging by invoice date or due date, by account or invoice
- [FieldRoutes API: Subscriptions](https://knowledgebase.fieldroutes.com/apidocs/subscriptions.md), the subscription `soldBy` field used in commissions and sales reporting
- [Microsoft Learn: SLAs for work orders](https://learn.microsoft.com/en-us/dynamics365/field-service/sla-work-orders), arrival and resolution KPIs, the applicable-from clock start, business hours, pause and resume, warning and failure durations
- [Aspire: Job costing and estimating](https://www.youraspire.com/go/job-costing-estimating), estimated labor and materials against actual job cost from division to work ticket
- [Swept: Time tracking](https://sweptworks.com/cleaning-company-time-tracking-app), geofenced clock-in and scheduled vs actual hours to spot underbid sites
- [Pool Brain: Features](https://www.poolbrain.com/features/), chemical cost by customer, property, body of water and technician; route profit report and technician scorecards
- [ServicePower: Warranty claims processing](https://www.servicepower.com/glossary/warranty-claims-processing), automated claim adjudication and validation before payment
- [ServiceM8: Quote Win Rate in the Business Dashboard report](https://support.servicem8.com/hc/en-us/articles/360001157415-Quote-Win-Rate-in-the-Business-Dashboard-Report), a lagged cohort: quotes created 28 to 56 days ago that converted within 28 days
- [Track-POD: API schema](https://api.track-pod.com/swagger/v1/swagger.json), planned vs actual cost, distance and times on routes
- [Jobber: Reports basics](https://help.getjobber.com/en/articles/reports-basics/), financial, work and client reports and who can see them
- [Upper: Available KPIs and metrics](https://support.upperinc.com/docs/crew/analytics/available-kpis-and-metrics), on-time rate as completion within the window, stops per route, service time per stop
- [Spoke: Late and failed stop analytics](https://spoke.com/dispatch/product-updates/analyze-late-and-failed-stops-and-track-delivery-costs-with-additional-analytics-reports), late stop percentage, failure reasons, cost per delivery
- [Bringg: Optimization settings](https://help.bringg.com/docs/optimization-settings-overview), the three on-time definitions
- [Geotab: Safety Scorecard](https://support.geotab.com/mygeotab/doc/safety-scorecard), rule weights and risk bands
- [Samsara: Driver behavior guide](https://developers.samsara.com/docs/driver-behavior-guide), safety scores with raw event counts and exposure
- [SPOTIO: Door-to-door sales](https://spotio.com/blog/door-to-door-sales/), the knock-to-close funnel metrics (vendor blog)
- [Fivetran: ServiceTitan connector](https://fivetran.com/docs/connectors/applications/servicetitan), incremental sync, delete capture and weekly re-imports
