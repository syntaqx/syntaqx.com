+++
title = "The Contact Center"
description = "Answering and booking calls: CSR roles, call outcomes and booking rate, routing and after-hours, outbound, recording and QA, screen pops, handoff and metrics."
category = "Field Operations Industry"
order = 1527
part = "Customers and Billing"
aliases = []
tags = ["field-operations", "contact-center", "csr", "telephony", "booking-rate", "call-recording"]
+++

In a field business the phone is the cash register. A homeowner with no air conditioning in July calls three companies, and the first one that answers and offers a time gets the job. A pest customer calls to cancel, a property manager calls to add five units, a lawn customer calls about a bill, and a plumber's after-hours line rings at 2 AM with water on the floor. The people who answer are customer service representatives (CSRs), and in a business of any size they're a contact center: queues, scripts, routing, recordings, scorecards and a booking rate every manager watches. Their tools are the field platform's tools, because nearly every call ends in a booking, a reschedule, a payment or a note on an account.

This chapter covers the field-specific side of that center: who answers, how calls are classified and how booking rate is defined, routing and after-hours coverage, outbound calls, recording and coaching, the screen in front of the CSR, handing work to dispatch, AI agents beside the CSRs, and how to measure it all. Generic support operations (ticketing, knowledge bases, staffing) are in [Customer Support](/docs/operations/customer-support). Where calls come from and how they're attributed is in [Marketing & Lead Sources](/books/field-operations/marketing-and-lead-sources); the slot search a CSR books into is [Booking Appointments](/books/field-operations/booking-appointments); texts and the shared inbox are [Customer Communications](/books/field-operations/customer-communications).

## Who Answers

The roles are few, and in a small shop one person holds them all:

- **CSR or call booker.** Answers inbound calls, identifies the caller and property, triages, books into live availability, and takes a payment or sends a link. Usually measured on booking rate.
- **Dispatcher.** Owns today's board. Takes the handoff for same-day and emergency work, and the calls from customers asking where the technician is ([Dispatch & the Day of Service](/books/field-operations/dispatch)).
- **Inside sales and renewals.** Works outbound lists (unsold estimates, expiring memberships, plan offers) and inbound sales calls, often on hourly pay plus commission ([Sales Teams & Commissions](/books/field-operations/sales-teams-and-commissions#how-sales-teams-are-organized)).
- **Retention.** Takes cancellation calls and makes save offers ([Retention Offers and Saves](/books/field-operations/collections-and-retention#retention-offers-and-saves)).
- **Billing.** Disputes, payment plans and collections calls, under the rules in [Collections & Retention](/books/field-operations/collections-and-retention).
- **After-hours answering.** An outside answering service, an on-call person or an AI agent, covered below.

A consolidator runs these as a shared center for many branches and brands, which adds a requirement no single shop has: the CSR must know which brand the caller dialed, greet in that brand's name, quote that brand's prices and book into that branch's capacity. The dialed number, not the caller, decides the brand ([Branches, Regions and the Org Chart](/books/field-operations/field-operations-business#branches-regions-and-the-org-chart)).

## How the Platforms Do It

The field suites approach telephony three ways: bring your own phone system and integrate, partner with a cloud contact center, or build phones in.

| Platform | Telephony | What the CSR gets |
| --- | --- | --- |
| ServiceTitan | Three tiers: Basic Phones ("routing lives with your own phone provider"), Phones Pro ("Routing, queues, IVR, and voicemail continue to be managed in Dialpad"), and Contact Center Pro, where "Inbound queues, IVR, and routing workflows" are managed in ServiceTitan | Call classification (booked, unbooked, excused, abandoned), recording and tracking-number attribution on every tier; Contact Center Pro "automatically links agents and jobs to calls," with AI agents for "overflow and after-hours calls" (marketed as early access) |
| Housecall Pro | Voice, built in: "a call menu (IVR), call queues, routing, and live transfers" | "call logs, notes, and recordings in one place"; CSR AI answers forwarded calls and can book if allowed |
| Workiz | Built-in phone system | "Every call in Workiz is recorded, summarized, and searchable"; Genius Answering picks up missed calls and schedules |
| GorillaDesk | VoIP "directly integrated within GorillaDesk" | Call history in the CRM, ring groups, supervisors who can "listen, barge or whisper" |
| PestPac | Dialpad integration | Dialpad "automatically searches PestPac for matching location records by phone number" and logs a note to the location after the call |
| FieldRoutes | Partner integrations (Voice for Pest on its marketplace) | "Account Screen Pop," "Intelligent Call Routing," "Automatic Noting" and "Click-to-Call" |
| Salesforce, Dynamics 365 | Enterprise contact center routing (Omni-Channel, unified routing) | Skills-based routing and overflow rules, covered below |

The convergence is clear. Whoever owns the phones, the field platform needs three things from them: the caller's number matched to accounts before the CSR says hello, the call tied to the job it produced, and the recording kept with the account. The design question is where routing lives. When it lives in a separate contact center, the platform must expose the matching and booking operations as an API the contact center calls; when it lives in the platform, the platform becomes a contact center and inherits its standards.

## Call Outcomes and Booking Rate

Every inbound call ends in an outcome, and the booking rate is computed from outcomes, so the outcome list is the most important configuration in the center. ServiceTitan's is the industry's reference:

- **Booked:** a job was booked on the call.
- **Unbooked:** "A CSR answers a customer call lasting over 60 seconds, but no job is booked."
- **Excused:** "any incoming call that was not related to a past, current, or future job" (a vendor, a wrong number, a job applicant). ServiceTitan's glossary also excuses calls under 60 seconds automatically.
- **Abandoned:** the caller hung up before reaching a CSR, or no CSR and job can be attached to the call.

A **lead call**, in ServiceTitan's glossary, is "an incoming call that lasts at least 60 seconds or is assigned the call reason, Is Lead," and its **Call Booking Rate** is "The percentage of inbound calls that result in a booked job." The working definition this volume uses, since [Operating Metrics](/books/field-operations/operating-metrics) and [AI in Field Operations](/books/field-operations/ai-in-field-operations) both rely on it:

```text
booking_rate (booked-call rate) =
  count(inbound calls with outcome = booked)
  / count(inbound calls with outcome IN (booked, unbooked))
```

Excused and abandoned calls are outside both terms: excused calls weren't opportunities, and abandoned calls are an answering problem measured separately (below). Three choices sit inside that formula, and each should be a versioned, tenant-visible setting:

- **What makes a call a lead.** A duration threshold (60 seconds), a call reason, or both. Duration alone excuses a short emergency call that booked fast, so a booked call is always a lead whatever its length.
- **Who may excuse.** Excusing a call removes it from the CSR's denominator, so it's the easiest way to inflate a booking rate. ServiceTitan's own pages disagree about manual excusal; my rule is that excusal comes from a call reason chosen on the call, and any later change is an audited edit with the editor recorded.
- **What counts as booked.** A job booked on the call. A callback that books tomorrow is a booked follow-up, credited to the outbound call, not retroactively to the inbound one. A request held for office review is unbooked until it's scheduled.

Record the **unbooked reason** too (price, no availability, out of area, just shopping, will call back). It's the list a manager reads to decide whether the problem is the CSR, the schedule or the marketing.

## Scripts and Triage

A field call follows a script whose branches come from the trade: who's calling (owner, tenant, property manager), which property, what's wrong, how urgent, and whether the customer has an agreement that changes the price or priority.

- **Emergencies skip the script.** Gas smell, carbon monoxide alarm, active flooding, no heat in a freeze, sparking panel: the CSR's screen shows the safety instruction and routes to the on-call path immediately. The trigger list and priority rules belong in data, shared with the IVR and any AI agent ([Emergencies, After Hours and On Call](/books/field-operations/repair-and-installation#emergencies-after-hours-and-on-call)).
- **Problem codes drive the booking.** The CSR picks a problem code; the code sets the job type, the duration, the skills and whether a diagnostic fee applies, so the slot search offers only technicians who can do the work ([Booking Appointments](/books/field-operations/booking-appointments)).
- **Members are recognized.** A caller with an active agreement gets member pricing and priority, which the screen pop shows before the CSR quotes anything ([Recurring Prices](/books/field-operations/pricing-and-sales-rules#recurring-prices)).
- **Prices come from the pricebook,** never from memory. A CSR quoting a diagnostic fee or a trip charge reads it from the same rules the technician's invoice will use ([Diagnostic Fees and Trip Charges](/books/field-operations/repair-and-installation#diagnostic-fees-and-trip-charges)).

## Routing, Overflow and After Hours

**The IVR** sorts calls before a person answers: new service, existing appointment, billing, emergency. Keep it short, put emergency first, and pass what the caller pressed to the CSR's screen so nobody asks twice. An IVR that takes card payments has its own rules ([Designing the IVR](/books/payments/phone-payments#designing-the-ivr)).

**Skills-based routing** sends a call to someone who can handle it: Spanish speakers, commercial accounts, a brand, billing. Salesforce describes it as matching "incoming work items to reps who have the specific skills required to handle them," with an option to relax requirements over time ("Whether skill requirements relax over time if no perfectly matched rep is available"). In a field center the skill list is short, and the important one is often the **branch or brand**, because a CSR licensed to quote one market's prices may not know another's.

**Overflow** decides what happens when everyone is busy. Dynamics 365 frames it as handling "both surge conditions and after-hours calls," triggered by being out of operating hours, a work item limit (1 to 100) or an average wait time (30 seconds to 60 minutes), with actions to assign anyway, offer a direct callback, end the call, transfer to another queue, transfer to an external number, or take voicemail. For a field business the useful order is: another branch's queue that can book the same territory, then an answering service or AI agent, then a callback offer. Voicemail is the last resort, because a homeowner with a leak doesn't leave one; they call the next company.

**After hours** is where emergencies arrive. The options are an on-call person with a forwarded line, an answering service, or an AI agent. Answering services for the trades sell exactly this split: urgent calls go "to your on-call staff based on your schedule," and "inquiries are captured for your office team to follow up on the next day" (AnswerForce, which lists ServiceTitan, Housecall Pro, Jobber and Workiz among its integrations). Whichever answers, it needs the same three things from the platform: the on-call schedule ([Crews, Shifts and Operating Hours](/books/field-operations/territories-and-capacity#crews-shifts-and-operating-hours)), the emergency triggers, and a way to create a request or a booking that the office sees in the morning. A message in someone's email is not a request.

## Outbound Calls

Outbound is where the center makes money in slow weeks, and where it takes legal risk.

- **Confirmations.** Calls or texts confirming tomorrow's window. Informational, and usually better as automated texts ([Customer Communications](/books/field-operations/customer-communications)); the CSR calls the ones that didn't confirm.
- **Renewals and memberships.** Expiring agreements and members due for a tune-up. ServiceTitan's Follow Ups screen keeps them as lists beside unsold estimates, sold estimates, surveys and recurring service events.
- **Recapture.** Unsold estimates, declined options and lost opportunities ([Outreach Campaigns](/books/field-operations/one-time-services-and-upsells#outreach-campaigns)). Housecall Pro's Pipeline automates the first touches by email or text, "depending on how the estimate was originally delivered."
- **Schedule fill.** Calling customers with flexible work to fill a cancelled slot, or offering an earlier window.

A call that sells is telemarketing, and the rules follow the purpose of the call, not the job title of the person making it: consent, do-not-call with its established business relationship windows, calling hours in the customer's time zone, and stricter state rules ([Calling Hours and Do-Not-Call](/docs/compliance/consumer-contact#calling-hours-and-do-not-call)). Put the outbound dialer behind the same gate as every other message ([Contacting Customers From the Field](/books/field-operations/consumer-protection#contacting-customers-from-the-field)). Outbound calls also have a delivery problem: carriers authenticate caller ID under STIR/SHAKEN, which the FCC required providers to implement "by June 30, 2021," with attestation levels "A, B, or C," and carriers describe analytics-based call blocking and spam labeling working "in tandem with" it. Calling from the branch's own registered numbers, consistently, is what keeps a renewal call from showing up as spam.

## Recording, Coaching and QA

**Recording consent** follows the strictest party on the call. Federal law and most states need one party's consent; the Reporters Committee's guide lists California, Delaware, Florida, Illinois, Maryland, Massachusetts, Michigan, Montana, New Hampshire, Pennsylvania and Washington as requiring all parties' consent (Michigan "at least for recordings made by a third party"), Connecticut and Nevada as all-party for phone calls, and Oregon as all-party for in-person conversations. The penalties are not civil inconveniences: Pennsylvania's is a felony, and Florida's is "a felony punishable by up to five years in prison." Mobile callers' locations are unknowable, so build to the announcement rule everywhere ([Recording Calls](/docs/compliance/consumer-contact#recording-calls)): the recording announcement plays at the start of every inbound and outbound call, its version is logged per call, and it's captured in the recording. The same applies to an AI agent's calls, and to in-home sales recordings ([The Law](/books/field-operations/ai-in-field-operations#the-law)).

**Payments on recorded lines.** A CSR who takes a card by phone puts the recording system in PCI scope unless the digits never reach it. The PCI Security Standards Council's guidance is that pause-and-resume "could reduce applicability of PCI DSS by taking the call-recording and storage systems out of scope," but "does not reduce PCI DSS applicability to the agent, the agent desktop environment, or any other systems," while "A properly designed and deployed DTMF-masking solution can take not only the telephony environment, but also the agent environment and CRM system out of scope." The simplest answer in the field is a payment link by text while the customer is on the line ([Keep the Digits Away From People](/books/payments/phone-payments#keep-the-digits-away-from-people)).

**Coaching and QA** turn recordings into scores. ServiceTitan's Voice Intelligence labels calls "Neutral, Positive, Negative, or, if a call needs special care, Attention," and its custom scorecards (in private preview) let managers "score calls against their own definition of a good call," with "Every call is scored against exactly one scorecard." Build the same shape whether a person or a model scores:

- **A versioned scorecard** with sections (greeting and recording announcement, identification, problem capture, offering the membership, booking attempt, close) and weights.
- **One scorecard version per call,** chosen by call type, so a billing call isn't scored on whether it booked.
- **Scores linked to the recording and transcript,** with the scorer (a person or a model and its version), and a calibration sample where people re-score model-scored calls.
- **Coaching as a record:** the manager's note, the CSR's acknowledgment and the follow-up score.

Scores that feed pay are metrics with all the obligations of [Auditing Metric Definitions](/books/field-operations/operating-metrics#auditing-metric-definitions).

## The CSR's Screen

The thirty seconds before the CSR speaks decide whether the call goes well. A **screen pop** looks up the caller's number and shows the match: PestPac's Dialpad integration "automatically searches PestPac for matching location records by phone number," and FieldRoutes' partner shows an "Account Screen Pop." What the screen should show, in order:

1. **Which brand and branch was dialed,** and the campaign behind the number ([Call Tracking and Dynamic Number Insertion](/books/field-operations/marketing-and-lead-sources#call-tracking-and-dynamic-number-insertion)).
2. **Every account and property the number matches.** A landlord's number matches twenty rentals and a property manager's two hundred, so the match is a list, never an auto-select ([One Number, Several Accounts](/books/field-operations/customer-communications#one-number-several-accounts)).
3. **What's live:** today's visit and its ETA, open work orders and holds, unsold estimates, the agreement and its status.
4. **What's risky:** a past-due balance or service hold, an open complaint, a recent callback, a do-not-service flag.
5. **The IVR path and any recent texts or web chats,** so the caller doesn't repeat themselves.

Identity checks scale with the action: confirming an appointment needs less than changing the payment method or the billing address. Show the CSR only what their role needs, and record every account the CSR opened during the call ([Support Access & Internal Tools](/docs/security/support-access)).

## Handing Off to Dispatch

A CSR books into the same availability engine as the portal and the AI agent, as a client of the booking API ([AI Voice Agents and Lead Sources](/books/field-operations/booking-appointments#ai-voice-agents-and-lead-sources)); `booked_via = 'csr'` marks it. The handoff to dispatch is everything the booking can't express in a slot:

- **Urgent and same-day work** goes to the dispatcher as a request with the triage result, not as a visit squeezed into a slot the CSR thinks is free.
- **Notes for the technician** (the dog, the gate code, "customer says it's making a grinding noise") go on the work order, typed by problem code where possible so they reach the technician app offline.
- **The lead and the call** are linked to the work order, so attribution and the CSR's booking credit are facts, not claims.
- **Requests that need a decision** (a commercial NTE, a job that needs a site visit to price) go to a queue with an owner and a due time, never to an inbox.

When a call is about a visit already in progress (where is my technician?), the CSR's screen reads the visit's live status and ETA link rather than calling the technician ([Talking to the Customer](/books/field-operations/dispatch#talking-to-the-customer)).

## AI Agents Beside the CSRs

AI voice agents now answer overflow, after-hours and sometimes all calls: ServiceTitan's Voice Agent, Housecall Pro's CSR AI, Jobber's Receptionist and a field of AI-native specialists. The products, the field caps on what an agent may book, emergency handling and the law (AI disclosure, recording, outbound AI-voice consent) are in [AI in Field Operations](/books/field-operations/ai-in-field-operations). Three contact-center points belong here:

- **The agent is a queue.** Route to it like any other overflow destination, with the same outcomes, so booking rate and abandonment cover the AI's calls and the people's alike.
- **Report AI and human booking rates separately,** on the same definition, and count only bookable calls for both, as ServiceTitan's Voice Intelligence does for its agent.
- **Escalation lands on a person with the context:** the transcript, the account matched and what the agent already tried, so the caller isn't asked again.

## Measuring the Center

Booking rate says how well calls are converted; the classic contact center metrics say how well calls are answered. Their definitions differ by vendor in ways that move the numbers, so define them once ([One Definition per Metric](/docs/architecture/data-pipelines#one-definition-per-metric)):

- **Abandonment rate.** Amazon Connect computes contacts abandoned ÷ contacts queued, where an abandoned contact was "disconnected by the customer while in queue," and "Contacts queued for callback are not counted as abandoned." It doesn't exclude short abandons by default; Genesys makes the **short abandon** threshold configurable and notes "The abandon rate does include short abandons." Pick a threshold (callers who hang up within a few seconds are often misdials), state it, and report both.
- **Average speed of answer.** Amazon Connect's queue answer time is the "average time that contacts waited in the queue before being answered by an agent... also known as average speed of answer (ASA)."
- **Service level.** The share of calls answered within X seconds. Amazon Connect counts a contact as within service level when it leaves the queue within X, whether "an agent answers the contact, the customer abandons the contact, or the customer requests a call back"; Genesys offers a formula of (answered − answered over the threshold) ÷ (answered + abandoned). Those are different numbers from the same calls, so name the formula with the target.
- **Booking rate,** as defined above, per CSR, per queue, per brand and per campaign.
- **Revenue per call:** revenue invoiced within a fixed horizon on work orders booked from lead calls, divided by lead calls. It catches the CSR who books fast but books the cheapest option, and the campaign whose calls book but don't sell.
- **Calls per job:** inbound calls about a work order after it was booked. Every "where's my technician?" call is a failure of the notifications upstream, and the cheapest call is the one that never had to happen.

Report by hour of day and day of week. A field center's load follows weather (the first hot day for HVAC, the first freeze for plumbing), so abandonment by hour on those days tells you where the after-hours and overflow plan has to start.

## How to Build It

The contact center adds calls, outcomes and scores to [The Core Data Model](/books/field-operations/field-operations-business#the-core-data-model). The telephony provider owns the audio and the call legs; the platform owns what the call meant.

```sql
CREATE TABLE calls (
  id                        UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id                 UUID NOT NULL,
  provider_call_id          TEXT NOT NULL,         -- the telephony system's ID
  direction                 TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  org_unit_id               UUID NOT NULL REFERENCES org_units (id),  -- brand or branch dialed
  from_number               TEXT NOT NULL,         -- E.164
  to_number                 TEXT NOT NULL,         -- the dialed number; decides brand and campaign
  campaign_id               UUID REFERENCES campaigns (id),
  lead_id                   UUID REFERENCES leads (id),
  queue                     TEXT,
  ivr_path                  TEXT[],                -- options pressed, in order
  answered_by_staff_id      UUID REFERENCES staff_members (id),
  answered_by_agent         TEXT,                  -- AI agent identity and version, if it answered
  queued_at                 TIMESTAMPTZ,
  answered_at               TIMESTAMPTZ,
  ended_at                  TIMESTAMPTZ NOT NULL,
  outcome                   TEXT NOT NULL CHECK (outcome IN ('booked', 'unbooked',
                              'excused', 'abandoned', 'voicemail', 'callback_requested')),
  call_reason               TEXT,                  -- tenant catalog; decides lead and excused
  unbooked_reason           TEXT,                  -- price, no_availability, out_of_area, ...
  is_lead                   BOOLEAN NOT NULL,      -- from the lead rule version below
  lead_rule_version         TEXT NOT NULL,
  recording_ref             TEXT,                  -- provider's object; audio stays there
  recording_announcement    TEXT,                  -- greeting version played; null if none
  UNIQUE (tenant_id, provider_call_id),
  CHECK (outcome <> 'unbooked' OR unbooked_reason IS NOT NULL),
  CHECK (outcome <> 'booked' OR is_lead)
);

CREATE TABLE call_links (                 -- what the call touched or produced
  call_id                   UUID NOT NULL REFERENCES calls (id),
  account_id                UUID REFERENCES accounts (id),
  work_order_id             UUID REFERENCES work_orders (id),
  visit_id                  UUID REFERENCES visits (id),
  agreement_id              UUID REFERENCES agreements (id),
  link_type                 TEXT NOT NULL CHECK (link_type IN ('matched', 'viewed',
                              'booked', 'rescheduled', 'cancelled', 'paid', 'noted'))
);

CREATE TABLE call_scores (
  id                        UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id                 UUID NOT NULL,
  call_id                   UUID NOT NULL REFERENCES calls (id),
  scorecard_version_id      UUID NOT NULL,         -- exactly one per call
  scored_by_staff_id        UUID REFERENCES staff_members (id),
  scored_by_model           TEXT,                  -- model and prompt version, if automated
  section_scores            JSONB NOT NULL,
  total                     NUMERIC(5, 2) NOT NULL,
  label                     TEXT CHECK (label IN ('positive', 'neutral', 'negative',
                              'attention')),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (num_nonnulls(scored_by_staff_id, scored_by_model) = 1),
  UNIQUE (call_id, scored_by_staff_id, scored_by_model)
);
```

Decisions in the shape:

- **The provider's call ID is unique,** because call events arrive as webhooks that repeat ([Webhooks](/docs/api-design/webhooks)), and the call record is written by events (ringing, queued, answered, ended) rather than once.
- **The dialed number decides brand and campaign;** the caller's number is matched, never trusted to identify the account alone.
- **Outcome and lead status are stamped with the rule version,** so a change to the 60-second threshold doesn't rewrite last quarter's booking rates.
- **The work order booked on the call is a `call_links` row,** written by the booking command in the same transaction as the visit, so booking credit can't be claimed after the fact.
- **The announcement played is a column,** the evidence in a recording consent dispute.

Events: `call.ended` (with outcome), `call.outcome_changed` (with editor and reason) and `call.scored`. The metrics pipeline builds the measures above from them.

## Auditing

Contact center records answer a customer ("I called three times"), a recording consent claim, a pay dispute over booking rate and a lead source dispute. Keep:

- **Every call, including abandoned and short ones,** with queue and answer times, so abandonment can be recomputed under any threshold.
- **Outcome and excusal edits** with the editor, time and reason. These move pay.
- **The recording announcement version per call,** and the recording itself for the retention the tenant sets, with deletion logged.
- **Accounts viewed per call,** for support access review.
- **Scorecard versions, scores and the scorer,** human or model, with calibration results.
- **Outbound calls with the consent check that cleared them,** from the outbound gate's log.

Record mechanics are in [Audit Trails](/docs/architecture/audit-trails); retention and production of field records in [Audit Trails & Records](/books/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Match the caller's number to every account and property it belongs to,** and show the list with live work, agreements and risks before the CSR speaks.
- **Let the dialed number set the brand, branch and campaign.**
- **Classify every call with a versioned outcome rule,** and define booking rate as booked ÷ (booked + unbooked) with excusal from call reasons and edits audited.
- **Book through the same availability engine** as the portal and AI agents, linking the call, lead and work order in one transaction.
- **Route by branch and skill, overflow to someone who can book,** and treat after-hours answering as a client that creates requests, not emails.
- **Announce recording on every call** and log the announcement version; keep card digits off recorded lines.
- **Score calls against one versioned scorecard per call,** human or model, with calibration.
- **Gate outbound calls on consent and calling rules,** from consistent, authenticated numbers.
- **Measure abandonment, answer time and service level with stated formulas,** beside booking rate and revenue per call, by hour.

## References

**Reference**

- [Reporters Committee for Freedom of the Press: Reporter's Recording Guide](https://www.rcfp.org/introduction-to-reporters-recording-guide/), all-party consent states and the in-person and phone-only variations
- [Reporters Committee: Pennsylvania recording law](https://www.rcfp.org/reporters-recording-guide/pennsylvania/), all-party consent for calls and felony penalties
- [Reporters Committee: Florida recording law](https://www.rcfp.org/reporters-recording-guide/florida/), all-party consent and the felony penalty
- [PCI Security Standards Council: Protecting Telephone-Based Payment Card Data (PDF)](https://listings.pcisecuritystandards.org/documents/Protecting_Telephone_Based_Payment_Card_Data_v3-0_nov_2018.pdf), pause-and-resume versus DTMF masking and what each takes out of scope
- [FCC Wireline Competition Bureau: STIR/SHAKEN triennial report (PDF)](https://docs.fcc.gov/public/attachments/DOC-416732A1.pdf), the June 30, 2021 implementation deadline, attestation levels and analytics-based labeling
- [Amazon Connect: Metrics definitions](https://docs.aws.amazon.com/connect/latest/adminguide/metrics-definitions.html), abandonment, queue answer time and service level
- [Genesys Cloud: Performance view columns](https://help.genesys.cloud/articles/view-available-columns-in-performance-views-by-category/), service level with abandons and short abandons
- [Salesforce Trailhead: Improve work distribution with Enhanced Omni-Channel](https://trailhead.salesforce.com/content/learn/modules/enhanced-omni-channel/improve-work-distribution-with-enhanced-omni-channel), skill-based routing and relaxing skill requirements
- [Microsoft Learn: Manage overflow](https://learn.microsoft.com/en-us/dynamics365/customer-service/administer/manage-overflow), overflow conditions and actions for surges and after hours

**In practice**

- [ServiceTitan: Understand call classifications](https://help.servicetitan.com/docs/understand-call-classifications), booked, unbooked, excused and abandoned calls and the 60-second lead threshold
- [ServiceTitan: Glossary](https://help.servicetitan.com/docs/servicetitan-glossary-commonly-used-servicetitan-terms), call booking rate, lead calls and excused calls
- [ServiceTitan: Identify your phone setup](https://help.servicetitan.com/docs/identify-your-phone-setup-in-servicetitan-max), Basic Phones, Phones Pro and Contact Center Pro
- [ServiceTitan: Contact Center Pro](https://www.servicetitan.com/features/pro/contact-center), calls linked to agents and jobs and AI agents for overflow and after hours
- [ServiceTitan: Use the Follow Up screen](https://help.servicetitan.com/residential-s-r/docs/use-the-follow-up-screen), unsold estimates, surveys, recurring service events and expiring memberships
- [ServiceTitan: Custom scorecards in Voice Intelligence](https://help.servicetitan.com/docs/how-to-set-up-custom-scorecards-voice-intelligence-md), one scorecard per call, private preview
- [ServiceTitan: Analyze CSR performance](https://help.servicetitan.com/how-to/analyze-csr-performance), call labels in Voice Intelligence
- [Housecall Pro: Voice](https://housecallpro.com/?p=778), IVR, queues, routing, live transfers, logs, notes and recordings
- [Housecall Pro: Getting started with CSR AI](https://help.housecallpro.com/en/articles/12996637-getting-started-with-csr-ai), forwarded calls, booking settings and escalation
- [Housecall Pro: Pipeline FAQs](https://help.housecallpro.com/en/articles/6185346-pipeline-faqs), automated estimate follow-up by email or text
- [Jobber: Receptionist](https://help.getjobber.com/en/articles/receptionistpowered-by-jobber-ai/), 24/7 answering through Online Booking and escalation transfers
- [Workiz: Phone system](https://www.workiz.com/features/phone-system/), recorded and summarized calls and Genius Answering
- [GorillaDesk: VoIP plan](https://gorilladesk.com/voip-plan/), integrated calling, ring groups and listen, barge and whisper
- [Dialpad: PestPac integration](https://ecosystem.dialpad.com/partners/pestpac/), location lookup by phone number and automatic notes
- [FieldRoutes Marketplace: Voice for Pest](https://marketplace.fieldroutes.com/partners/voice-for-pest), account screen pop, call routing, automatic noting and click-to-call
- [AnswerForce: After-hours answering](https://answerforce.com/answering-services/after-hours-answering), urgent calls to on-call staff by schedule and next-day follow-up
