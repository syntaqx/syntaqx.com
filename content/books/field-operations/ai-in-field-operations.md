+++
title = "AI in Field Operations"
description = "AI in field service: call answering and booking against live capacity, coaching, dispatch, summaries and diagnostics, what vendors ship, law and audit."
category = "Field Operations Industry"
order = 1533
part = "Running the Platform"
tags = ["field-operations", "ai", "voice", "scheduling", "compliance", "audit"]
+++

The office of a field service business is mostly a phone. Customers call to book, reschedule, ask when the technician will arrive, dispute a bill or report a burst pipe at 11 PM, and every unanswered call is a job that goes to a competitor. That makes the office the first place AI has landed in this industry, followed by sales coaching, dispatch, diagnostics and the paperwork technicians hate. The difficulty isn't getting a model to talk. It's that the model now writes to a live schedule with real capacity and travel, makes promises the business is bound by, records people in their homes, places calls the FCC treats as artificial voice, and occasionally gets things wrong with total confidence. The general engineering of an agent that acts (narrow tools, typed results, decisions in code, identity checks, handoff, evals) is in [AI Agents in the Product](/docs/architecture/ai-agents), and defending it against manipulation is in [AI & LLM Security](/docs/security/ai-security). This chapter is what field work adds: the schedule the agent writes to, the trades' emergencies, the records it touches, what vendors ship, and where the law bites.

## How It Works

Every documented product converges on the same shape: a model holds the conversation, calls a small set of tools your platform exposes, and your code, not the model, decides whether each action is allowed.

![AI call flow: the caller talks to an AI agent disclosed as AI; the agent calls tools to find the customer, offer slots, request a booking or hand off; a policy check in your code approves the booking or sends it to an office queue; every step writes to an audit record.](/diagrams/fo-ai-in-field-operations-call.svg "The model proposes; deterministic code checks job type, caps and identity before anything is written. Every step, including denials and handoffs, lands in the audit record.")

In field service, three parts of that shape carry most of the weight.

**The slots come from the availability engine.** A booking tool offers only slots the scheduling engine already accepts, and the engine is where field service is hard: skills (a technician certified for gas furnaces, a licensed applicator for termite work), territories, job durations by service type and property size, and the drive time a new stop adds to a route that's already full. ServiceTitan requires its Adaptive Capacity to be set up before its voice agent can book; Jobber books only through its Online Booking settings. The pattern is consistent: the AI books into the same engine a customer portal uses, never around it. If that engine can't express skills, territories, durations and travel, the AI books bad appointments faster ([Booking Appointments](/books/field-operations/booking-appointments)).

**The caps are field caps.** Per-action, per-job-type permissions, off by default, as ServiceTitan, Jobber and Housecall Pro all ship, plus limits that only exist in this industry: a maximum drive time a booking may add to a route, no same-day emergency slots without a dispatcher, no bookings outside the service area, no booking a job type (a sewer line replacement, a whole-house repipe, a commercial bid) that needs a site visit before it can be priced. "Offer to reschedule before cancelling," a ServiceTitan option, is a step in the cancellation flow your code enforces, not a line in the prompt.

**The trades have emergencies that skip the model.** Gas smell, carbon monoxide alarm, active flooding, no heat in a freeze, a sparking panel: deterministic triggers (keywords, a menu option, a dedicated line) transfer to a person or page the on-call technician, and the model's next turn isn't consulted. Some AI-native vendors sell exactly this: Broccoli AI, built for plumbing and HVAC companies, lists emergency alerts to technicians beside phone answering and booking. The greeting can say emergencies go straight to a person, which also tells the caller what to do.

The rest is general: identity verification proportional to the action, payment by link so the model never hears a card number ([Phone Payments](/books/payments/phone-payments)), handoff with the summary and transcript, and evals before every prompt, model or tool change, graded against the schedule's state ([AI Agents in the Product](/docs/architecture/ai-agents#evals)). Two field details on evals: count only bookable calls toward booking rate ([Call Outcomes and Booking Rate](/books/field-operations/contact-center#call-outcomes-and-booking-rate); the formula is in [Operating Metrics](/books/field-operations/operating-metrics#calls-and-leads)), as ServiceTitan's Voice Intelligence does, or a wave of wrong numbers and vendor calls looks like a collapse; and include callers the trades actually get, such as a landlord booking for a tenant, a caller who doesn't know the equipment's make, and a Spanish speaker.

## Use Cases, and What's Real

**Answering and booking.** The most mature use. The agent identifies the caller (by phone number, or name and address; ServiceTitan by caller ID before it texts a payment link), answers from a knowledge base of services, hours and service area, offers slots from live availability and writes the booking. Every published product describes escalation: keyword triggers, transfers, after-hours rules, and a summary to the office when no booking happened. The real gap is not speech quality; it's availability quality.

**Outbound.** Speed-to-lead callbacks, unsold-estimate follow-up, membership renewals and filling cancelled slots (Avoca's campaigns, Netic's membership and upsell outreach, Hatch's re-engagement, Podium's membership coordinator). This is where the law bites hardest, because an AI-voice call is an artificial-voice call under the TCPA (below).

**Coaching.** Scoring calls and sales conversations against a scorecard: ServiceTitan Voice Intelligence flags a "service gap" when a scorecard section scores low; Rilla and Siro do the same for in-home sales visits, where a technician presenting repair-or-replace options on a furnace is a salesperson in someone's kitchen. This is real and measurable, and it depends entirely on recording, so consent rules apply ([Sales Teams & Commissions](/books/field-operations/sales-teams-and-commissions)); the scorecard, calibration and coaching records are in [Recording, Coaching and QA](/books/field-operations/contact-center#recording-coaching-and-qa).

**Dispatch and scheduling.** Two different things share the label. One is optimization: an overnight auto-scheduler that weighs drive time, skills, windows and preferences, with locks, a freeze window and a dry-run preview, which is a solver with good controls, the same family as the engines in [Route Optimization](/books/field-operations/route-optimization). The other is a language model proposing actions: Agentforce proposes appointments to fill a gap and the dispatcher chooses. Probook's framing (deciding which tech takes which job, in what order, at what expected ticket size) spans both. My rule: the language model calls a solver, and never does arithmetic on routes itself. It can explain a plan, collect a constraint ("Mrs. Alvarez can't do mornings") or propose a swap, but the sequence, the drive times and the capacity check come from the engine, which can be tested and reproduced.

**Diagnostics and technician assistance.** For repair and install work, the promise is a technician who arrives knowing more: ServiceTitan's Field Pro covers "pre-job prep and AI-guided diagnostics," Atlas answers in the technician app, and Agentforce troubleshoots from manuals, past repairs and photos. The vendors' own caveat applies: ServiceTitan says Atlas "may generate inaccurate, incomplete, or outdated responses." Advice to a technician working on gas, refrigerant or electrical equipment must cite its source document (the manufacturer's manual, the model-specific bulletin), so the technician checks the source, not the summary. The useful version is narrow: the equipment's service history at this property, the last technician's notes, the parts used last time, and the manual for the model on the nameplate.

**Summaries and records.** Pre-work briefs, post-work summaries, call summaries, and work order updates by speech (Dynamics' preview updates booking status, times, tasks and line items from what the technician says). Useful and low-risk when the human confirms, high-risk when the summary becomes a customer-facing completion report or a legal record unreviewed. A cleaning crew's or a lawn technician's dictated note that becomes the customer's service report is the low end of the risk; a commercial customer's SLA record is the high end.

**Regulated record capture.** Dictating "two ounces of product X around the foundation" into a pesticide application record is attractive and dangerous. The application record is a regulated document the licensed applicator is responsible for ([Regulated Materials](/books/field-operations/regulated-materials)). AI may draft it from speech; the applicator confirms each field against the product label, and the system validates rates deterministically, with no model involved. The same holds for refrigerant recovery logs and backflow test reports: the model drafts, the certified person confirms, the code checks the numbers.

## Who Ships What

The market splits into four groups: AI built into the FSM suites, AI-native startups that sit beside (or replace) them, communication platforms adding agents, and enterprise suites adding copilots and agents.

| Product | Kind | What its public docs say it does | Human control described |
| --- | --- | --- | --- |
| Avoca | AI-native, voice and coaching | Inbound AI CSR, outbound campaigns, speed-to-lead, Coach scoring calls in real time | Certified ServiceTitan app; also listed on FieldRoutes' marketplace |
| Broccoli AI | AI-native, plumbing and HVAC | Phone answering, booking, lead follow-up, emergency alerts to technicians | Not published |
| Dynamics 365 Field Service Copilot | Enterprise | Work order updates by text or speech (preview), summaries, inspection templates from PDFs, agent feed | Agent feed: humans complete, accept or dismiss agent tasks |
| Hatch (Yelp) | AI-native, voice and follow-up | Answers calls, responds to leads, follows up on estimates, re-engages past customers; syncs with ServiceTitan booking | Routes complex conversations to staff |
| Housecall Pro CSR AI | SMB suite, voice | Answers calls, summarizes, flags urgency; can book, reschedule or cancel if permitted | Per-action permissions; escalation to a number or an HCP Assist agent; introduces itself as AI |
| Jobber Receptionist | SMB suite, voice and text | Answers 24/7, books through Online Booking settings, reschedules, cancels, takes messages | "For actions that are turned off, Receptionist will ask before taking action"; transcripts and recordings for admins |
| Netic | AI-native, revenue | Books across calls, text, web chat; outbound membership and upsell campaigns; call scoring | Bookings "following the company's operational rules" |
| Rilla, Siro | In-person sales coaching | Record in-home conversations, score against your process, coach | Rilla lists states where the customer must be told |
| Salesforce Agentforce for Field Service | Enterprise | Customer self-scheduling in chat, schedule-gap proposals, pre-work briefs, troubleshooting with photos, post-work summaries | "The dispatcher can then choose from these options"; technician refines summaries |
| ServiceTitan Atlas and Field Pro | Suite, assistant and coaching | Answers in technician mobile, AI-guided diagnostics, capacity rules in plain language; records in-home sales visits | Admin access by company position; accuracy warning; customers informed in two-party consent states |
| ServiceTitan Voice Agent | Suite, voice | Books, confirms, reschedules and cancels; books after hours; sends payment links by SMS after caller-ID verification | Per-capability and per-job-type toggles; keyword escalation paths; email when a call ends without a booking |
| Solea | AI-native FSM (pest control) | Voice agent checks the live schedule and writes bookings; overnight auto-scheduling | Booking rules per service, cap on added travel time, dry-run preview, locks, escalation rules |

A few things stand out from reading the help centers rather than the launch posts:

- **Pricing follows conversations.** Jobber sells Receptionist by the conversation, Goodcall prices by unique customers a month rather than minutes, and ServiceTitan bills test calls. Evaluations cost money, so budget for them.
- **Outcome numbers are self-reported.** "Avoca handles 70% of our entire call volume" is a customer quote; Netic's "91% booking rate" is a counter on its home page; Probook's customer reportedly cut dispatchers from 22 to 10 (a Fortune report, unverified); Workiz claims automation of "up to 80%" of call-management tasks. None is independently measured, and they're useful mainly as the metrics vendors think buyers care about.

[The Software Landscape](/books/field-operations/software-landscape) dates the funding rounds and acquisitions behind these companies and places them in the wider market.

## Build, Buy or Integrate

Buying the suite's agent gets you the tightest integration with its scheduling engine, its job types and its capacity rules, at the cost of the suite's pace and its pricing per conversation. A specialist (Avoca, Netic, Hatch) may be stronger on voice and outbound, but it writes through the FSM's API, so ask exactly what it reads and writes, whether it books against live capacity or a cached copy, and what happens when the API is down at 2 AM; FieldRoutes' marketplace listing for Avoca doesn't say. Building makes sense when your availability engine and policies are your differentiator; then the model is the easy part, and the tool layer, policy checks, evals and audit are the work. NIST's AI Risk Management Framework (Govern, Map, Measure, Manage) and its Generative AI Profile are a reasonable checklist for the governance around any of the three.

My default for a platform vendor: expose booking, rescheduling and status as a documented API with the same permissions and caps your own agent uses, and let tenants choose your agent or a specialist's. Tenants will connect a specialist anyway; the question is whether it goes through your policy layer or around it.

## The Law

This is a summary for engineers, not legal advice; the rules vary by state and change quickly, and [Calls, Texts & Email](/docs/compliance/consumer-contact) covers them properly. The field-specific points:

- **Outbound AI voice needs consent.** Estimate follow-up, renewal and win-back calls in an AI voice are artificial-voice calls, checked for consent in code before the call is placed; [Consumer Protection](/books/field-operations/consumer-protection#contacting-customers-from-the-field) owns the rule.
- **Recording in the home is still recording.** Federal law needs one party's consent, but a minority of states require every party's, and in-home sales recording falls under the same statutes as calls. ServiceTitan's Field Pro documentation says "two-party consent states require you to inform the customer before recording begins," and Rilla lists the states where the customer must be told. The design that works everywhere: announce recording at the start of every call and every in-home conversation, and record the announcement ([Recording Calls](/docs/compliance/consumer-contact#recording-calls)).
- **Disclosing AI.** ServiceTitan's docs note that telling callers they're speaking with AI "is a legal requirement in some locations." State laws differ in trigger and scope; the one behavior that satisfies them is the agent saying it's AI at the start of every call (as Housecall Pro's does) and answering honestly when asked ([Telling People They're Talking to an AI](/docs/compliance/consumer-contact#telling-people-they-re-talking-to-an-ai)).

My default is one script for every call and every recorded visit, everywhere: announce the recording and the AI at the start. One script is easier to get right than a map of states, and no caller is harmed by knowing. The alternative, disclosing only where required, saves a few seconds per call and adds a jurisdiction lookup that has to be right every time, including for the customer whose number has a different area code from the property.

What the agent promises binds the business, and transcripts and recordings are personal data with retention and erasure; [AI Agents in the Product](/docs/architecture/ai-agents#the-ai-s-promises-are-the-business-s-promises) covers both. In field service the promise is usually a price or an arrival time, so the agent quotes only from the pricebook and the availability engine, and a job that needs a site visit to price gets a visit, not a number. Vendors differ on where recordings go: ServiceTitan's Atlas page says conversations may be stored and shared with third-party service providers, and Siro says its AI providers are contractually barred from training on its data.

## Auditing

When a customer says "your system cancelled my termite treatment" or a state inspector asks who recorded an application, "the AI did it" must be the start of an answer, not the end. The vendors show the floor: Jobber keeps a transcript and recording of every conversation for admins; ServiceTitan keeps call details with overview, transcript and playbook tabs; Dynamics' agent feed separates tasks completed by agents from tasks completed by users, and its insights chart shows the split over 7, 14 or 30 days.

Record the agent as its own actor, with model and prompt version, every tool call including denials, the approver and the transcript, as [Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions) describes. What field operations adds:

- **Regulated records name the licensed person.** A pesticide application, refrigerant or backflow record drafted by AI records who confirmed it, when, and whether they edited the draft. An unreviewed draft and an applicator-confirmed record are different evidence, and only the second is a regulatory record.
- **Disclosure and consent per call and per visit.** Whether the AI disclosure and the recording announcement played, on the phone and in the home, kept with the recording as proof in a consent dispute.
- **Bookings carry their policy checks.** The job-type permission, the drive-time cap and the service-area check that passed, so "why did the AI book a two-hour drive" has an answer.
- **Attribution for pay.** Whether the AI or a CSR booked the job and who sold the membership, because commissions and CSR bonuses depend on it ([Sales Teams & Commissions](/books/field-operations/sales-teams-and-commissions)).

[Audit Trails & Records](/books/field-operations/audit-trails-and-records) covers retention and production of the field records these actions touch.

## What This Means for the System You Build

- **One availability engine.** The AI books through the same engine, skills, territories, durations and travel as the customer portal, and never around it.
- **Field caps in code.** Per-action, per-job-type permissions off by default, a cap on added drive time, no same-day emergency slots or site-visit-only job types without a person.
- **Trade emergencies skip the model.** Gas, carbon monoxide, flooding and no-heat triggers transfer or page the on-call technician deterministically.
- **The model calls a solver.** Sequences, drive times and capacity come from the routing engine; the model explains, collects constraints and proposes.
- **Diagnostics cite sources.** Advice on gas, refrigerant or electrical equipment links the manual or bulletin it came from, for the model on the nameplate.
- **AI drafts regulated records; licensed people confirm them.** Rates and limits are validated deterministically, and the confirmer is recorded.
- **Disclose AI and announce recording** on every call and every recorded in-home conversation, and check consent before any outbound AI call.
- **Audit the agent as its own actor,** per [Audit Trails](/docs/architecture/audit-trails#automated-and-ai-decisions), with policy checks, disclosure and attribution on every booking.

The general requirements (typed tools, identity checks, handoff, evals, injection defenses) are in [AI Agents in the Product](/docs/architecture/ai-agents#checklist).

## References

**Specifications**

- [FCC: Declaratory Ruling on AI-generated voices under the TCPA (FCC 24-17)](https://docs.fcc.gov/public/attachments/FCC-24-17A1.pdf), AI voices are "artificial or prerecorded voice"

**Reference**

- [NIST: AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework), AI RMF 1.0 and the Generative AI Profile

**In practice**

- [ServiceTitan: Configure your voice agent settings](https://help.servicetitan.com/docs/configure-your-voice-agent-settings-in-servicetitan), per-job-type booking toggles, Adaptive Capacity, escalation, disclosure responsibility, billed test calls
- [ServiceTitan: Atlas](https://help.servicetitan.com/docs/atlas), Atlas surfaces, accuracy caveat, data sharing
- [ServiceTitan: Voice Intelligence](https://help.servicetitan.com/docs/monitor-call-performance-with-voice-intelligence-in-servicetitan.md), scorecards, service gaps, bookable calls
- [ServiceTitan: Record in the Field Pro app](https://help.servicetitan.com/docs/record-in-the-field-pro-app), in-home recording and two-party consent states
- [ServiceTitan: Fall 2025 release guide](https://www.servicetitan.com/blog/fall-2025-release-guide), Field Pro's AI-guided diagnostics
- [Jobber: Receptionist](https://help.getjobber.com/hc/en-us/articles/25315927533847), capabilities, approval for disabled actions, per-conversation pricing, transcripts, escalation
- [Housecall Pro: CSR AI overview](https://help.housecallpro.com/en/articles/9740104-csr-ai-overview), AI introduction on every call, permissions, call log
- [ACHR News: Workiz's AI receptionist](https://www.achrnews.com/articles/163805-jessica-is-the-new-ai-receptionist-for-contractors), Genius Answering launch and vendor claims
- [Solea: AI voice](https://www.solea.ai/product/ai-voice), live-schedule booking, travel caps, escalation, transcripts and actions
- [Solea: Scheduling and dispatch](https://www.solea.ai/product/scheduling-dispatch), overnight auto-scheduling, locks, freeze window, dry runs
- [Avoca](https://www.avoca.ai/), inbound, outbound and coaching products, the customer-reported share of calls, ServiceTitan certified app
- [FieldRoutes Marketplace: Avoca](https://marketplace.fieldroutes.com/partners/avoca-ai.md), call intake, booking and grading on a vertical platform
- [Netic](https://www.netic.ai/), multi-channel booking and campaigns, vendor counters
- [Y Combinator: Broccoli AI](https://ycombinator.com/companies/broccoli-ai), phone answering, booking, follow-up and emergency alerts to technicians for plumbing and HVAC
- [Fortune: Probook raises $40 million](https://www.fortune.com/2026/06/23/exclusive-this-startup-wants-to-be-the-ai-brain-for-home-services-and-it-just-raised-40-million-from-sequoia-and-a16z/), dispatch-first AI and unverified customer claims
- [Hatch: The new Hatch](https://www.usehatchapp.com/blog/the-new-hatch) and [Hatch: What is Hatch](https://docs.usehatchapp.com/getting-started/intro-to-hatch/what-is-hatch.md), acquisition by Yelp, AI CSRs and CRM sync
- [Goodcall: Pricing](https://www.goodcall.com/pricing), pricing by unique customers instead of minutes
- [Podium: Home services](https://homeservices.podium.com/), AI employee and membership coordinator
- [Rilla: Home services](https://rilla.com/industry/home-services), in-home conversation recording and notice states
- [Siro](https://www.siro.ai/), in-person recording, coaching, and no-training terms with AI providers
- [Salesforce: Agentforce for Field Service](https://www.salesforce.com/news/stories/agentforce-for-field-service-announcement/), capabilities, troubleshooting from manuals and photos, dispatcher choice
- [Microsoft Learn: Copilot in Field Service](https://learn.microsoft.com/en-us/dynamics365/field-service/copilot-overview), work order updates, summaries, inspection templates
- [Microsoft Learn: Supervise agents with agent feed](https://learn.microsoft.com/en-us/dynamics365/field-service/supervise-agents-with-agent-feed), human actions, agent versus user insights
