+++
title = "Leads, CRM, Tours & the Leasing Center"
nav_title = "Leads, CRM & Tours"
description = "Guest cards by household, lead-to-lease attribution, self-guided tours, centralized and AI leasing, recording and texting rules, and the FTC review rule."
category = "Property Tech Industry"
order = 1709
part = "Leasing"
tags = ["property-tech", "leasing", "crm", "guest-cards", "self-guided-tours", "call-tracking", "reviews"]
+++

A vacant apartment is found on a listing site, a property website or a map listing, and from that moment the operator is in a sales business with a regulated sales floor. A couple sends an inquiry through a listing site on Sunday night, one of them calls the leasing office on Monday from a different number, the other books a self-guided tour of a second property the same company manages, and a week later they sign a lease at a third. To the operator that is one household, one shopping journey and one lease, and the question every month is which listing site, campaign and person earned it. To the law it is a series of contacts, each with its own rules: who may text them, whether the call may be recorded, whether the AI that answered said it was an AI, whether the household got the same answers about availability and price that anyone else would have got, and whether the review they later wrote was asked for honestly.

This chapter covers the demand side after the listing: the **guest card** (the prospect household's record), lead sources and attribution from first touch to signed lease, agent-led, virtual and self-guided tours, call tracking, centralized leasing across properties, outsourced leasing contact centers and AI leasing agents, recording and texting rules, call QA, fair housing consistency, and reviews. Generic contact-center and attribution mechanics are covered in the Field Operations volume, and this chapter links there rather than repeating them: [The Contact Center](/books/field-operations/contact-center) and [Marketing & Lead Sources](/books/field-operations/marketing-and-lead-sources). Listings and the advertised price are [Listings, Websites & Marketing](/books/property-tech/listings-and-marketing); the price a prospect is quoted is [Revenue Management & Pricing](/books/property-tech/revenue-management); the application that follows is [Applications & Screening](/books/property-tech/applications-and-screening).

## How the Platforms Do It

Every suite has a leasing CRM; they differ in whether the record centers on the renter or the property, and in how much of the answering they sell as a service:

| Vendor | CRM and guest cards | Tours | Answering and AI |
| --- | --- | --- | --- |
| AppFolio | Leasing CRM with one guest card per lead, tracking its activity across the portfolio | Self-guided tours of vacant units | Realm-X Leasing Performer, which "Replies to every lead within minutes, 24/7" and schedules tours |
| Entrata | LeadManager: lead-source reporting, call tracking ("Track where calls are coming from, who is calling"), custom alerts, "Consolidated Lead & Contact Records"; Centralized Leasing for grouped properties (May 2024) | Communications, tours and applications for grouped properties from one place | Leasing Center, "A full-service contact center for capturing calls and turning leads into leases," including maintenance requests; Leasing AI across "text, email, SMS, voice" and chat in 30+ languages |
| Funnel | A "renter-centric" CRM: the renter as the "single 'source of truth' across all communities within a portfolio" | Not published | Since October 13, 2026, RealPage's screening, payments, pricing and availability act as the source of truth inside Funnel's application flow |
| MRI | Engage CRM with guest cards "synced with PMX Residential in real time" | Not published | An AI leasing agent that "answers, logs, and escalates calls 24/7" |
| RealPage | Knock CRM: one dashboard across communities, a Centralized Leasing Suite, Call Intelligence that will "Capture and analyze every call," and lead-source analytics | Knock Tours: "agent-guided, self-guided, or virtual," with "built-in ID and selfie verification" | Contact Center answering leasing calls and email 24/7 plus maintenance dispatch; AI Leasing Agent across chat, voice, text and email; AI Call Scoring in Demand Marketing |
| Rent Manager | Website Guest Cards that create a prospect profile; Prospect Manager for tracking prospects and campaigns | Not published | Call Center "powered by Anequim" for after-hours calls, leasing information and service tickets |
| ResMan | Lead Management and CRM AI (named in its navigation) | Not published | Contact Center: leasing calls, and maintenance triage that dispatches after hours "only" for "true emergencies" |
| Yardi | A CRM queue for follow-up and text and email to prospects (Breeze) | Not published on the pages I could open | RentCafe Chat IQ answers prospect questions with live pricing and availability |

Self-guided touring is also sold by access specialists: SmartRent says "After a prospect completes a self-guided tour, the PIN code they used is automatically invalidated," and PointCentral sends codes only after an ID and selfie check, optionally only once the prospect is "within a 2 mile radius." The convergence: a guest card per prospect that spans the portfolio, tours of three kinds, a tracking number or ILS lead ID on every inbound contact, and an answering layer (staff, central team, outsourced center or AI) that writes to the same guest card. The divergence is the unit of the record. A property-centric CRM creates one lead per property the household contacts; a renter-centric one keeps one record across the operator's portfolio. This volume's model is household-centric with one guest card per property of interest, below.

## The Guest Card

A **guest card** is the record of a prospect household's interest in a property: who they are, how to reach them, what they want (move-in date, bedrooms, budget, pets), where they came from, and everything that has happened since. The name comes from the paper card a visitor filled in at the leasing office, and every vendor still uses it.

### A Household, Not a Person

Apartments are rented by households, and households shop together. Two roommates inquire separately; a parent calls for a student; a couple uses one email and two phones. If the guest card is a person, the operator counts three leads for one lease, pays an ILS twice, and has two agents following up with the same family. The core model already separates `people` from `households` ([The Core Data Model](/books/property-tech/property-business#the-core-data-model)); the guest card hangs off the household, and each person in it has their own contact points and consent. When the household applies, the guest card's people become the application's members, and when it signs, the household is the one on the lease, so the shopping history and the residency are one story.

### Dedupe Across Channels

The same household arrives through an ILS form, a call to a tracking number, a website chat and a walk-in, each with partial identity: a name and email from the ILS, a caller ID from the phone, a first name from the chat. Matching is the playbook's problem ([Match Before Create](/docs/architecture/record-linkage#match-before-create)) with property-specific inputs:

- **Normalize contact points first:** phone numbers to E.164, emails lowercased. A phone number or email that already belongs to a person on an active guest card is a strong match; a name alone is not.
- **Match within the tenant, across properties.** The household touring two communities of one operator is one household. Matching across tenants is never done: two management companies' prospects are two companies' records.
- **Send ambiguous matches to review bands** rather than auto-merging ([Review Bands](/docs/architecture/record-linkage#review-bands)). A shared family phone, a roommate's email on a card, or a returning resident from years ago all look like duplicates and aren't always.
- **Merge reversibly,** keeping each source's lead ID, because an ILS bills per lead it sent and disputes reference its ID ([Merges, Recorded and Reversible](/docs/architecture/record-linkage#merges-recorded-and-reversible)).

### One Household, Several Properties

A household shopping an operator's portfolio is common: a central team sends it to a sister property when the first is full, or the household finds two of the operator's listings itself. My default is one household, one guest card per property of interest, and every touch recorded once on the household with the property it concerned. That keeps per-property metrics (leads, tours, leases per property, which owners pay for) honest while letting any agent see the whole journey. It also answers a third-party manager's owner question: when a lead that came in for Owner A's property leases at Owner B's, which owner's marketing paid for it, and which property's leasing fee is earned? The answer belongs in the management agreement, not in an agent's judgment ([Management Fees](/books/property-tech/owners-and-management-agreements#management-fees)); the data has to make it visible, so a cross-property referral is a recorded event, not a new lead.

## Lead Sources and Attribution

The sources are the industry's own: **ILSs** (internet listing services, the apartment search sites), the property and corporate **website** and its paid search and social, **calls** to a tracking number, **walk-ins**, **resident referrals**, apartment locators, and the operator's own other properties. How tracking numbers, UTM parameters and click IDs are captured, and how outcomes are sent back to ad platforms, is in [Call Tracking and Dynamic Number Insertion](/books/field-operations/marketing-and-lead-sources#call-tracking-and-dynamic-number-insertion) and [Attribution: From Lead to Job to Agreement](/books/field-operations/marketing-and-lead-sources#attribution-from-lead-to-job-to-agreement). Three things differ for property.

**ILS fees come in several models, and the model decides what you reconcile.** Listing sites charge a subscription per property, a fee per lead, or a fee per lease. AppFolio's Premium Listing syndicates to pay-to-list sites and "charges only for verified leads"; Apartment List sells a "lease fee connected to move-in outcomes." A per-lead source bills for each lead it delivered, so the guest card keeps the source's lead ID and the evidence for disputing duplicates and invalid leads. A per-lease source bills for leases it claims, so the operator needs its own lead-to-lease attribution to check each claim, because the site's record of who it sent and the operator's record of who signed are matched by name, email or phone, and the two will disagree. Each claim is a row with a status (matched, disputed, accepted), never a line nobody checked on a monthly invoice.

**First touch and lease-attributed source are two answers.** A household that found the property on an ILS, came back through a search ad, and called the number on the website has a first-touch source (the ILS), a last-touch source (the website number), and possibly a self-reported one ("a friend lives here"). Marketing budgets ask which source started the journeys that ended in leases; per-lease ILS invoices ask whether that site's lead is the one that leased. My rule: store every touch, compute the **first-touch source** on the guest card when it's created and never change it, compute the **lease-attributed source** when the lease is signed under a named, versioned model, and record the self-reported source as a separate field. Report all three; pay vendors under whatever their contract defines, and keep the contract's definition with the claim.

**Leases, not leads, are the unit of value.** Lead counts reward the sources that send the most inquiries; operators judge sources by cost per lease, and a lease's value by its rent and term. RealPage's Performance Reporting connects "sources, activities, and spend" to the campaigns "driving signed leases"; Entrata's LeadManager reports which sources bring the most leads and which bring the best. Lead-to-lease conversion and cost per lease are defined once in [The Leasing Funnel](/books/property-tech/operating-metrics#the-leasing-funnel); this chapter's records are their inputs.

## Tours

A tour is where a prospect decides, and the platforms offer three kinds, often for the same unit.

### Agent-Led and Virtual Tours

An **agent-led tour** is an appointment with a person: a slot on the property's calendar in the property's time zone ([Future Wall-Clock Times](/docs/fundamentals/time#future-wall-clock-times-local-time-plus-a-zone)), a reminder, a check-in, and an outcome the agent records (toured, no-show, cancelled, rescheduled). It is a booking with capacity like any other, so double-booking an agent or a model unit is prevented the same way ([Exclusion Constraints for Time](/docs/architecture/reservations-and-holds#exclusion-constraints-for-time)). A **virtual tour** is either live (an agent on video walking the unit) or recorded (a 3D or video walkthrough on the listing). A live virtual tour is a tour record with an agent; a recorded one is a listing asset, and viewing it is a touch, not a tour.

### Self-Guided Tours

A **self-guided tour** lets a prospect enter a vacant unit or a model without staff. The mechanics:

1. **Book a window.** The prospect picks a slot from the website, an ILS or an AI agent; the slot comes from the same availability as agent tours, so two strangers aren't sent into one unit at once.
2. **Verify identity before access.** The prospect scans a government ID and takes a selfie, which a verification provider compares and checks for liveness. Knock Tours advertises "built-in ID and selfie verification"; PointCentral sends codes "only after verification" and can require the prospect to be within two miles first.
3. **Grant access for the window only.** A smart-lock code or mobile credential is issued for the booked window and the unit's lock (or the building's entry and the unit's), and it expires at the window's end or when the tour is marked complete. SmartRent invalidates the PIN automatically after the tour.
4. **Record what happened:** check-in, the lock's entry events, check-out, and a follow-up message.

The lock, its provider and credential mechanics belong to [Access, Smart Buildings & Parking](/books/property-tech/access-and-smart-buildings#smart-locks-and-access-control); what this chapter owns is the **tour access grant**: which tour, which person, which lock, which window, issued after which verification, and when it was used and revoked. My rules: never issue a code before the verification passes; never reuse a code across tours; scope it to the unit and the common doors on the route, not the building; and never self-tour an occupied unit, because entering a resident's home is governed by entry-notice law and the lease, not by a prospect's convenience.

### Identity Checks and Biometric Privacy

A selfie compared with an ID photo is a face-geometry comparison, and in Illinois the Biometric Information Privacy Act requires a written release before a private entity collects a biometric identifier, with disclosure of "the purpose and length of term of collection, storage, or use of the data," and liquidated damages of $1,000 per negligent and $5,000 per intentional or reckless violation. An August 2024 amendment made repeated collection from the same person by the same method a single violation and confirmed that an electronic signature satisfies the release. Other states have their own biometric laws, and [Records, Privacy & Audits](/books/property-tech/records-privacy-and-audits#state-privacy-laws) owns that matrix. For the tour flow that means: the consent screen is the verification provider's and the operator's, versioned and logged per tour; the platform stores the provider's verification result and reference, never the face template; and retention of the result follows a schedule ([Retention Schedules by Record Type](/docs/architecture/data-retention#retention-schedules-by-record-type)).

Identity checks are also a fair housing and accessibility question. A smartphone-and-selfie gate excludes prospects without a smartphone or with some disabilities, so an agent-led alternative must exist on the same terms, and the check must apply to every self-guided tour, not to prospects an agent finds suspicious. The identity result can be reused when the household applies, which is how vendors pitch it, but an application's identity verification has its own rules and records in [Applications & Screening](/books/property-tech/applications-and-screening#income-and-identity-verification), which the tour's check feeds rather than replaces.

## Call Tracking

Most properties publish a different phone number on each ILS listing, the website (often swapped per visitor), the map listing and print, all forwarding to the leasing office or the contact center, so a call is attributed to a source and a property before anyone answers. The mechanics are in [Call Tracking and Dynamic Number Insertion](/books/field-operations/marketing-and-lead-sources#call-tracking-and-dynamic-number-insertion). The property twists are two. **The dialed number decides the property,** not only the source: a central team answering for fifty communities greets the caller with the property they called. And **tracking numbers outlive campaigns:** a number printed on a banner stays in use for years, so each number's assignment to a property and source is effective-dated, and a reassigned number never re-attributes old calls.

## Centralized Leasing

Centralized leasing moves leasing work from each property's office to a team that works many properties from one queue: answering inquiries, following up, scheduling tours, processing applications, while site staff give tours and hand over keys. Entrata's Centralized Leasing "enables property managers to manage multiple properties grouped together"; Knock lets agents "operate from a single dashboard" across communities; Funnel's case for a renter-centric record is that one profile serves every community in the portfolio. The operating-model consequences (grants by function and portfolio instead of by site, work across time zones, cost allocation under the management agreement) are in [Centralization and the Outsourced Back Office](/books/property-tech/software-landscape#centralization-and-the-outsourced-back-office). For leasing specifically:

- **Every queue item carries its property and the property's business date and zone.** A follow-up "due today" is due in the property's zone; a tour at 10:00 is 10:00 there; the agent's own zone is irrelevant ([Business Dates](/docs/fundamentals/time#business-dates-business-days-and-holidays)).
- **The agent's screen shows the property's rules, not the agent's habits.** Screening criteria, source-of-income protection, application fee caps, pet policies and fee disclosures differ by jurisdiction, so the answer to "do you take vouchers?" or "what does it cost to apply?" comes from the property's current rules as data, never from memory ([Rules as Data](/docs/architecture/rules-as-data)).
- **Prices come from the property's current quote,** which [Revenue Management & Pricing](/books/property-tech/revenue-management#what-gets-priced) produces; an agent quoting a stale price to one caller and the current one to another is both a sales problem and a fair housing exposure.
- **Record who did each piece of work for which property:** owner billing, agent productivity and fair housing reviews all ask.

## Leasing Contact Centers and AI Leasing Agents

Outsourcing the phones is common in this industry, and vendors sell it as a service: Entrata's Leasing Center, RealPage's Contact Center ("88% of our calls are answered in 25 seconds or less," by its own measure), ResMan's Contact Center and Rent Manager's Call Center. ResMan's case is the industry's usual one: "More than 70% of leasing calls go unanswered" at an average property, by its own figure. An outsourced agent needs exactly what a central agent needs (the property's availability, prices, rules and calendar) and must write to the same guest card, so the integration is a client of the platform's leasing API, not an email summary. Routing, overflow and after-hours design, and how a contact center measures itself, are in [Routing, Overflow and After Hours](/books/field-operations/contact-center#routing-overflow-and-after-hours).

**AI leasing agents** now answer the same channels. Entrata's Leasing AI responds on the channel where the lead started, schedules tours from the property calendar and works in 30+ languages; RealPage says its AI Leasing Agent works "across more than 175 management companies" and that some customers resolve "roughly nine in ten routine prospect inquiries" (August 2026); AppFolio's and MRI's agents do the same. The engineering (tools rather than database access, decisions in code, handoff, evals, audit) is in [AI Agents in the Product](/docs/architecture/ai-agents); governance, cost allocation and fair housing risk across all of a property platform's agents are in AI in Property Management ([Governance and the AI Audit Trail](/books/property-tech/ai-in-property-management#governance-and-the-ai-audit-trail), [AI Cost Allocation to Owners](/books/property-tech/ai-in-property-management#ai-cost-allocation-to-owners)). Two leasing-specific points:

- **Say it's an AI.** Entrata's page says "Renters often mistake ELI for a real person," presented as a strength. State bot laws point the other way, and the design that satisfies them is an agent that says it's an AI at the start, answers honestly when asked, and logs the greeting version ([Telling People They're Talking to an AI](/docs/compliance/consumer-contact#telling-people-they-re-talking-to-an-ai)). An AI placing outbound calls is making artificial-voice calls under the TCPA ([Artificial and AI Voices](/docs/compliance/consumer-contact#artificial-and-ai-voices)).
- **The agent's answers are the operator's answers.** An AI that tells one prospect a unit is available and another that it isn't, or that offers a concession to some callers, creates the same fair housing record a person would. Availability, price, fees and policies come from tools that read the property's data, and the agent never improvises them ([The AI's Promises Are the Business's Promises](/docs/architecture/ai-agents#the-ai-s-promises-are-the-business-s-promises)).

### After-Hours Maintenance Calls

The leasing number is the number residents know, so maintenance emergencies land in the leasing center after hours. RealPage's center acts as residents' "first responders for handling and dispatching service requests 24/7"; ResMan's associates "troubleshoot issues, triage severity, and only dispatch technicians after hours for true emergencies"; Rent Manager's agents create service tickets and follow the emergency and dispatch protocols the operator defines. For the leasing system the rules are short: recognize a resident (the caller's number matches a current lease) and route to maintenance intake rather than a guest card; never create a lead from a resident's repair call; and let the emergency triggers and on-call schedule be the maintenance system's, shared with the IVR and any AI agent ([Emergencies Skip the Model](/docs/architecture/ai-agents#emergencies-skip-the-model)). Intake, triage and dispatch are [Maintenance & Work Orders](/books/property-tech/maintenance-and-work-orders#requests-and-after-hours-intake).

## Recording, QA and Call Scoring

**Recording.** Leasing calls are recorded for coaching, disputes and fair housing defense, and a minority of states require every party's consent. Build to the announcement rule everywhere: announce at the start of every call, capture the announcement in the recording, and log its version per call ([Recording Calls](/docs/compliance/consumer-contact#recording-calls)). A central team answering for properties in several states, and callers on mobile phones anywhere, make a per-state table unworkable. The same applies to calls an AI agent answers, and to recorded video tours.

**QA and AI call scoring.** RealPage's Knock Call Intelligence records and analyzes calls for coaching, and its AI Call Scoring "identifies callers with intent to rent" and feeds "those signals back to Google"; Entrata's LeadManager evaluates how staff communicate with prospects. The scorecard mechanics (versioned scorecards, one per call, scores linked to the recording, calibration of model scores against people) are in [Recording, Coaching and QA](/books/field-operations/contact-center#recording-coaching-and-qa). The leasing scorecard adds a section most trades don't need: **fair housing consistency** (did the agent describe availability, price, fees and qualifying criteria as the property's data says, and avoid steering language about neighborhoods, schools or "who lives here"). A model scoring calls for "intent to rent" is also a model sorting prospects; if its score decides who gets a callback first, it is an automated decision about people, with the obligations in [Automated Risk Decisions](/docs/architecture/risk-scoring), and its inputs must not include proxies for protected classes such as accent or language.

## Texting Prospects

Most prospects want texts, and most leasing teams text. The rules are in [Calls, Texts & Email](/docs/compliance/consumer-contact) and the enforcement in [Notifications & Consent](/docs/architecture/notifications); what changes for leasing:

- **Replying to an inquiry is not marketing to a list.** A prospect who submitted a form or texted the property started a conversation; answering it is conversational. A drip campaign of specials to everyone who inquired in the last six months is marketing, with the consent and opt-out rules that go with it ([TCPA Consent](/docs/compliance/consumer-contact#tcpa-consent), [Texting: The Carrier Layer](/docs/compliance/consumer-contact#texting-the-carrier-layer)).
- **ILS leads carry the ILS's consent, not yours.** The form the prospect filled in on a listing site said what they agreed to; store that consent text and the site's reference with the lead, and treat a lead without it as one you contact by hand ([Purchased Leads and Consent](/books/field-operations/marketing-and-lead-sources#purchased-leads-and-consent)). The FCC's 2023 one-to-one consent rule, which would have required written consent to name a single seller, never took effect: the Eleventh Circuit vacated it in *Insurance Marketing Coalition v. FCC*, and the FCC restored the prior definition of prior express written consent in DA 25-621 (July 14, 2025). As of October 2026, consent must still authorize the seller that calls, so check that the operator or property is named.
- **Consent is per contact point, and households share them.** One roommate's consent doesn't cover the other's phone; a STOP from either is honored across every property and every agent, central or outsourced, human or AI, because they all send through one gate ([One Outbound Gate](/docs/architecture/notifications#one-outbound-gate), [Revoking Consent](/docs/compliance/consumer-contact#revoking-consent)).
- **Quiet hours are the prospect's, not the property's.** A household relocating from another time zone gets texts in its own zone.

## Fair Housing in Every Response

The Fair Housing Act makes it unlawful to discriminate "in the terms, conditions, or privileges of sale or rental of a dwelling" and to represent that a dwelling "is not available for inspection, sale, or rental when such dwelling is in fact so available," on the basis of race, color, religion, sex, handicap, familial status or national origin. The leasing conversation is where both happen, and it is tested: the Justice Department's Fair Housing Testing Program, established in 1991, sends testers "without any bona fide intent to rent or purchase housing" posing as prospects, and since 1992 has resolved 111 pattern-or-practice testing cases recovering more than $15.3 million, mostly over false information about availability or different terms by race, national origin or familial status. Private fair housing organizations test too. A tester is a guest card like any other, so the platform's records are the evidence either way.

What that means for the system:

- **Every answer about availability, price, fees, specials and criteria comes from data,** the same for every channel and agent, so two testers asking the same question on the same day get the same answer. Templates for responses are versioned, and the version used is recorded on each message.
- **Response time and follow-up are measured for parity** by property, agent, channel and language, from the same funnel events as [The Leasing Funnel](/books/property-tech/operating-metrics#the-leasing-funnel). The platform doesn't record protected traits of prospects and shouldn't; it can show that every inquiry got a response within the same window and the same number of follow-ups.
- **Steering is a scripting problem.** Agents and AI agents describe units and amenities, never neighborhoods' demographics, schools as a proxy, or which building "families prefer."

The rules, testing and the platform's broader obligations are in [Fair Housing](/books/property-tech/fair-housing#enforcement).

## Reviews and Reputation

Reviews decide which property a prospect contacts, and operators manage them as a product: Entrata's ReputationAdvisor pulls reviews from "Yelp, Google, ApartmentRatings.com, and other sites" and generates responses "with a single click"; RealPage's Reputation Management, "powered by Yext," covers "review generation and response." Residents are asked after move-in, a completed work order or a renewal. Generic review-request timing and Google's policy against selectively soliciting positive reviews are in [Direct Mail, Referrals and Reputation](/books/field-operations/marketing-and-lead-sources#direct-mail-referrals-and-reputation).

### The FTC Rule on Consumer Reviews

The FTC's Trade Regulation Rule on the Use of Consumer Reviews and Testimonials (16 CFR Part 465) took effect on October 21, 2024, and courts may impose civil penalties for knowing violations. As of October 2026, the provisions that reach a property operator:

- **Fake reviews (465.2).** Writing, creating or selling a review that misrepresents that the reviewer exists, used the property, or had the stated experience is a violation; so is buying one, or procuring reviews from officers, managers, employees or agents for third-party sites, when the business knew or should have known they misrepresented. Generalized requests to all customers are excluded.
- **Conditional incentives (465.4).** Compensation "in exchange for" reviews "expressing a particular sentiment, whether positive or negative" is a violation. The FTC's guidance says the rule "does not prohibit giving incentives for reviews" without a sentiment condition, though undisclosed incentives can still violate the FTC Act. A rent credit for any honest review is a different act from a rent credit for five stars.
- **Insider reviews (465.5).** An officer or manager writing a review without clearly disclosing the relationship is a violation, as is soliciting reviews from relatives, employees or agents in ways that lead to undisclosed relationships. Leasing staff asked to review the property they work at, or their friends, are the textbook case.
- **Review suppression (465.7).** Using "an unfounded or groundless legal threat, a physical threat, intimidation, or a public false accusation" to prevent or remove a review is a violation. So is a property website's review section that implies it shows most or all reviews while hiding them by rating or negative sentiment. Withholding by criteria applied equally to all reviews (confidential information, defamatory or abusive content, another person's personal information, discriminatory content, clearly false content, reasonably believed fakes, unrelated content) is allowed.

Review gating (asking for a rating first and sending only happy residents to a public site) isn't named in the rule, but the FTC's guidance says it "could violate the FTC Act," and Google's policy forbids it. My rule: ask every eligible resident on the same trigger, record each request, and if there's an incentive, record that it was unconditional.

**Responses** to reviews are where operators get into trouble. The FTC's guidance is that a business may respond publicly but should "watch what you say": no accusations it knows are false, no threats. For property there's a second constraint: a reply that confirms someone is a resident, mentions their balance, a complaint or an eviction discloses resident data. AI-drafted replies are drafts; a person approves each one, and the approved text and its approver are recorded.

### The Lease and the Consumer Review Fairness Act

The Consumer Review Fairness Act of 2016 (15 U.S.C. 45b) makes void any provision of a form contract that restricts a party's ability to review the business, imposes a penalty or fee for a review, or requires transferring intellectual property rights in review content (a non-exclusive license is allowed), and makes it unlawful to offer a form contract containing one. A residential lease offered on standard terms is a form contract. So a "no negative reviews" clause, a fee for disparaging the property, or a clause claiming the copyright in residents' reviews is void and offering it is a violation; the FTC and state attorneys general enforce it. The Act preserves a business's right to remove content from its own site that is confidential, defamatory, harassing, unrelated or clearly false, which matches the rule's withholding criteria above. Lease templates belong to [The Lease](/books/property-tech/the-lease#templates-and-clause-libraries); the check that no template carries such a clause belongs in its template review.

## How to Build It

This chapter extends `people` and `households` from [The Core Data Model](/books/property-tech/property-business#the-core-data-model) with contact points and household membership, and adds sources, guest cards, touches, tours, access grants, call scores and reviews. Consent is not a table here: it lives in the platform's consent ledger keyed by contact point and purpose ([The Consent Ledger](/docs/architecture/notifications#the-consent-ledger)). Staff are users defined in [Users, Roles and Grants](/books/property-tech/platform-architecture#users-roles-and-grants), referenced here as `user_id`.

```sql
CREATE TABLE contact_points (            -- how to reach a person; consent is keyed by value
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL,
  person_id   UUID NOT NULL REFERENCES people (id),
  kind        TEXT NOT NULL CHECK (kind IN ('phone', 'email')),
  value       TEXT NOT NULL,             -- E.164 or lowercased email
  verified_at TIMESTAMPTZ,
  valid_during TSTZRANGE NOT NULL DEFAULT tstzrange(NOW(), NULL),
  EXCLUDE USING GIST (tenant_id WITH =, person_id WITH =, value WITH =, valid_during WITH &&)
);
CREATE INDEX contact_points_match_idx ON contact_points (tenant_id, value);  -- dedupe lookups

-- Prospects' households before a lease; once one is signed, lease_members
-- (The Lease) is the source of truth for who lives there.
CREATE TABLE household_members (         -- who shops and lives together, over time
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  household_id UUID NOT NULL REFERENCES households (id),
  person_id    UUID NOT NULL REFERENCES people (id),
  is_primary   BOOLEAN NOT NULL DEFAULT FALSE,
  valid_during DATERANGE NOT NULL,
  EXCLUDE USING GIST (household_id WITH =, person_id WITH =, valid_during WITH &&)
);

CREATE TABLE lead_sources (              -- the tenant's catalog of where demand comes from
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL,
  code        TEXT NOT NULL,             -- 'ils_a', 'website_paid_search', 'resident_referral'
  name        TEXT NOT NULL,
  channel     TEXT NOT NULL CHECK (channel IN ('ils', 'website', 'paid_search', 'social',
                'map_listing', 'call', 'walk_in', 'resident_referral', 'locator',
                'sister_property', 'print', 'other')),
  fee_model   TEXT NOT NULL CHECK (fee_model IN ('none', 'subscription', 'per_lead',
                'per_lease', 'per_click')),
  UNIQUE (tenant_id, code)
);

CREATE TABLE tracking_numbers (          -- a dialed number decides property and source
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  e164           TEXT NOT NULL,
  property_id    UUID NOT NULL REFERENCES properties (id),
  lead_source_id UUID NOT NULL REFERENCES lead_sources (id),
  valid_during   TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (e164 WITH =, valid_during WITH &&)  -- one meaning per number at a time
);

CREATE TABLE guest_cards (               -- a household's interest in one property
  id                         UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id                  UUID NOT NULL,
  household_id               UUID NOT NULL REFERENCES households (id),
  property_id                UUID NOT NULL REFERENCES properties (id),
  status                     TEXT NOT NULL CHECK (status IN ('active', 'toured', 'applied',
                               'leased', 'lost', 'inactive')),
  first_touch_source_id      UUID NOT NULL REFERENCES lead_sources (id),  -- never changes
  first_touch_at             TIMESTAMPTZ NOT NULL,
  self_reported_source_id    UUID REFERENCES lead_sources (id),
  referred_from_card_id      UUID REFERENCES guest_cards (id),  -- sent from a sister property
  desired_move_in_on         DATE,
  desired_bedrooms           INT,
  max_rent                   BIGINT,     -- minor units, as the prospect stated it
  currency                   CHAR(3),
  assigned_user_id           UUID REFERENCES users (id), -- site or central agent
  leased_lease_id            UUID REFERENCES leases (id),
  lease_attributed_source_id UUID REFERENCES lead_sources (id),
  attribution_model          TEXT,       -- 'last_non_direct_touch@v3'
  lost_reason                TEXT,
  merged_into_id             UUID REFERENCES guest_cards (id),  -- reversible merge
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status <> 'leased' OR (leased_lease_id IS NOT NULL
         AND lease_attributed_source_id IS NOT NULL AND attribution_model IS NOT NULL)),
  CHECK (status <> 'lost' OR lost_reason IS NOT NULL)
);
CREATE UNIQUE INDEX guest_cards_one_open_idx ON guest_cards (tenant_id, household_id, property_id)
  WHERE status IN ('active', 'toured', 'applied') AND merged_into_id IS NULL;

CREATE TABLE lead_events (               -- every touch, inbound or outbound, append-only
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id              UUID NOT NULL,
  household_id           UUID NOT NULL REFERENCES households (id),
  guest_card_id          UUID REFERENCES guest_cards (id),
  property_id            UUID REFERENCES properties (id),
  lead_source_id         UUID REFERENCES lead_sources (id),
  kind                   TEXT NOT NULL CHECK (kind IN ('ils_inquiry', 'web_form', 'call',
                           'sms', 'email', 'chat', 'walk_in', 'tour_scheduled',
                           'tour_completed', 'application_started', 'referral',
                           'resident_redirected')),  -- a resident's call sent to maintenance
  direction              TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  actor_type             TEXT NOT NULL CHECK (actor_type IN ('prospect', 'site_staff',
                           'central_staff', 'contact_center', 'ai_agent', 'system')),
  actor_user_id          UUID REFERENCES users (id),  -- staff, a contact-center vendor user,
                                         -- an AI agent or a service; null for the prospect
  external_ref           TEXT,           -- ILS lead ID, provider call ID, message ID
  dialed_number          TEXT,           -- for calls: resolves tracking_numbers
  click_id               TEXT,
  utm                    JSONB,
  consent_text_ref       TEXT,           -- the ILS or form consent shown, for inbound leads
  template_version       TEXT,           -- the response template used, for consistency review
  recording_ref          TEXT,           -- the provider's object; audio stays there
  recording_announcement TEXT,           -- version played; null if none
  ai_disclosure_version  TEXT,           -- greeting version when an AI answered
  occurred_at            TIMESTAMPTZ NOT NULL,
  business_date          DATE NOT NULL,  -- in the property's zone, or the tenant's if none
  UNIQUE (tenant_id, kind, external_ref)
);

CREATE TABLE lead_fee_claims (           -- what a per-lead or per-lease source billed
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  lead_source_id UUID NOT NULL REFERENCES lead_sources (id),
  property_id    UUID NOT NULL REFERENCES properties (id),
  claim_kind     TEXT NOT NULL CHECK (claim_kind IN ('lead', 'lease')),
  external_ref   TEXT NOT NULL,          -- the source's lead or lease reference
  guest_card_id  UUID REFERENCES guest_cards (id),  -- the matched guest card, if any
  amount         BIGINT NOT NULL,
  currency       CHAR(3) NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('unmatched', 'matched', 'disputed',
                   'accepted', 'credited')),
  dispute_reason TEXT,
  UNIQUE (tenant_id, lead_source_id, claim_kind, external_ref)
);

CREATE TABLE tours (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  guest_card_id    UUID NOT NULL REFERENCES guest_cards (id),
  property_id      UUID NOT NULL REFERENCES properties (id),
  unit_id          UUID REFERENCES units (id),        -- null for a property tour
  kind             TEXT NOT NULL CHECK (kind IN ('agent_led', 'self_guided', 'virtual_live')),
  scheduled_during TSTZRANGE NOT NULL,
  agent_user_id    UUID REFERENCES users (id),        -- null for self-guided
  verification_id  UUID REFERENCES verifications (id),  -- identity check, from Applications & Screening
  status           TEXT NOT NULL CHECK (status IN ('scheduled', 'checked_in', 'completed',
                     'no_show', 'cancelled')),
  booked_via       TEXT NOT NULL CHECK (booked_via IN ('website', 'ils', 'staff',
                     'contact_center', 'ai_agent')),
  CHECK (kind <> 'self_guided' OR unit_id IS NOT NULL),
  CHECK (kind = 'self_guided' OR agent_user_id IS NOT NULL),
  EXCLUDE USING GIST (unit_id WITH =, scheduled_during WITH &&)
    WHERE (kind = 'self_guided' AND status IN ('scheduled', 'checked_in')),
  EXCLUDE USING GIST (agent_user_id WITH =, scheduled_during WITH &&)
    WHERE (agent_user_id IS NOT NULL AND status IN ('scheduled', 'checked_in'))
);

CREATE TABLE tour_access_grants (        -- a code or credential for one tour's window
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  tour_id         UUID NOT NULL REFERENCES tours (id),
  person_id       UUID NOT NULL REFERENCES people (id),  -- who was verified
  credential_id   UUID NOT NULL REFERENCES access_credentials (id),  -- purpose 'tour'
  valid_during    TSTZRANGE NOT NULL,
  issued_at       TIMESTAMPTZ NOT NULL,
  first_used_at   TIMESTAMPTZ,
  revoked_at      TIMESTAMPTZ,
  revoke_reason   TEXT CHECK (revoke_reason IN ('tour_completed', 'window_ended',
                    'cancelled', 'verification_failed', 'manual')),
  CHECK (issued_at <= lower(valid_during))
);

CREATE TABLE call_scores (               -- QA on a recorded call, by a person or a model
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  lead_event_id        UUID NOT NULL REFERENCES lead_events (id),
  scorecard_version_id UUID NOT NULL,
  scored_by            UUID NOT NULL REFERENCES users (id),  -- a reviewer, or an AI agent's user
  model_version        TEXT,             -- model and prompt version, when an AI agent scored
  section_scores       JSONB NOT NULL,   -- includes the fair housing consistency section
  total                NUMERIC(5, 2) NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE review_requests (           -- every ask, so solicitation can be shown to be uniform
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL,
  property_id      UUID NOT NULL REFERENCES properties (id),
  household_id     UUID NOT NULL REFERENCES households (id),
  trigger          TEXT NOT NULL CHECK (trigger IN ('move_in', 'work_order_completed',
                     'renewal', 'tour')),
  trigger_rule     TEXT NOT NULL,        -- versioned eligibility rule
  incentive        TEXT,                 -- null if none; never conditioned on sentiment
  template_version TEXT NOT NULL,
  sent_at          TIMESTAMPTZ NOT NULL
);

CREATE TABLE reviews (                   -- reviews of a property, on any platform
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  property_id          UUID NOT NULL REFERENCES properties (id),
  platform             TEXT NOT NULL,    -- 'google', 'own_site', an ILS
  external_review_id   TEXT NOT NULL,
  rating               NUMERIC(2, 1),
  body                 TEXT,
  posted_at            TIMESTAMPTZ NOT NULL,
  review_request_id    UUID REFERENCES review_requests (id),  -- if it answered one
  insider_relationship TEXT,             -- known employee or agent tie, if any
  own_site_display     TEXT CHECK (own_site_display IN ('displayed', 'withheld')),
  withheld_reason      TEXT CHECK (withheld_reason IN ('confidential', 'abusive',
                         'personal_information', 'discriminatory', 'clearly_false',
                         'suspected_fake', 'unrelated')),  -- 16 CFR 465.7(b) criteria only
  response_body        TEXT,
  response_drafted_by  TEXT CHECK (response_drafted_by IN ('staff', 'ai')),
  response_approved_by UUID REFERENCES users (id), -- a person, always
  responded_at         TIMESTAMPTZ,
  UNIQUE (tenant_id, platform, external_review_id),
  CHECK ((own_site_display = 'withheld') = (withheld_reason IS NOT NULL)),
  CHECK (response_body IS NULL OR response_approved_by IS NOT NULL)
);
```

Decisions in the shape:

- **The household owns the journey; the guest card owns a property's view of it.** Touches attach to the household and, where they concern one property, to its guest card, so a sister-property referral moves the household without losing who found it.
- **First touch is written once.** `first_touch_source_id` is set from the earliest touch when the card is created and never updated; the lease-attributed source is written when the lease is signed, with the model's name and version, so a model change doesn't rewrite last year's cost per lease.
- **The external reference is the idempotency key.** ILS leads and call events arrive more than once, and an ILS bills by its own lead ID ([Webhooks](/docs/api-design/webhooks)).
- **Fee claims are reconciled, not paid.** Each claim from a per-lead or per-lease source is matched to a guest card or disputed, and the match is the evidence.
- **Access grants never hold the code** and always point at a verified person and one tour; the exclusion constraint on `tours` stops two self-guided tours of one unit overlapping.
- **Withholding a review on the property's own site takes one of the rule's reasons,** and a response can't be published without a person's approval.

Events: `guest_card.created`, `guest_card.merged`, `guest_card.referred`, `tour.scheduled`, `tour.completed`, `tour_access.issued`, `tour_access.revoked`, `guest_card.leased` (with the attributed source), `review.received`. [Applications & Screening](/books/property-tech/applications-and-screening#the-application) listens for `tour.completed` to invite an application; [Operating Metrics](/books/property-tech/operating-metrics#the-leasing-funnel) builds lead-to-lease conversion from `guest_card.created` and `guest_card.leased`.

## Auditing

Leasing records answer an ILS invoice dispute, a fair housing complaint or test, a recording-consent claim, a TCPA suit, a self-guided tour incident, and an FTC review inquiry. Keep:

- **Every touch, with who answered** (site, central, outsourced or AI, and which), the template version, and the property's business date, so a tester's experience can be reconstructed message by message.
- **Guest card merges and splits** with the matcher's evidence and the person who approved them.
- **Attribution as computed:** first-touch, lease-attributed and self-reported sources, the model version, and each fee claim's match or dispute.
- **Tour access:** the verification result reference, the grant's window, the lock's entry events and the revocation, for any tour that ends in a damage, safety or trespass claim.
- **Recording announcement and AI disclosure versions per call and conversation,** with recordings kept and deleted on the tenant's schedule ([Recordings and Transcripts Are Personal Data](/docs/architecture/ai-agents#recordings-and-transcripts-are-personal-data)).
- **Review requests, withholding decisions and responses,** with the approver, so solicitation can be shown to be uniform and suppression to follow the rule's criteria.

Record mechanics, including AI decisions, are in [Audit Trails](/docs/architecture/audit-trails#automated-and-ai-decisions); which records regulators ask for, and for how long, is in [Records, Privacy & Audits](/books/property-tech/records-privacy-and-audits#retention-and-legal-holds).

## What This Means for the System You Build

- **Make the guest card a household's interest in a property,** with people and contact points underneath and one household across the operator's portfolio.
- **Match before creating** on normalized phone and email within the tenant, send ambiguous matches to review, and merge reversibly with every source's lead ID kept.
- **Store every touch and compute attribution twice:** first touch once at creation, lease-attributed source at signing under a versioned model, self-reported beside both.
- **Reconcile ILS fee claims** against your own lead-to-lease records, per lead or per lease, with disputes as rows.
- **Issue self-guided tour access only after identity verification,** for one window and one route, never for an occupied unit, and keep the provider's reference rather than the code or the face.
- **Give central, outsourced and AI agents the same data and rules,** read per property in the property's zone, and record who did each piece of work.
- **Disclose AI, announce recording, and send every text through one consent gate,** with versions logged per interaction.
- **Score calls for fair housing consistency** and measure response parity by property, agent, channel and language.
- **Route residents' after-hours repair calls to maintenance intake,** never to a guest card.
- **Ask every eligible resident for reviews on the same trigger,** never condition incentives on sentiment, withhold only on the rule's criteria, and keep review-restricting clauses out of every lease template.

## References

**Specifications**

- [16 CFR 465.2: Fake or false consumer reviews](https://www.law.cornell.edu/cfr/text/16/465.2), fake reviews, buying them, procuring insider reviews, and the generalized-solicitation exclusion
- [16 CFR 465.4: Buying positive or negative consumer reviews](https://www.law.cornell.edu/cfr/text/16/465.4), incentives conditioned on a particular sentiment
- [16 CFR 465.5: Insider consumer reviews and consumer testimonials](https://www.law.cornell.edu/cfr/text/16/465.5), officers', managers', employees' and relatives' reviews and disclosure
- [16 CFR 465.7: Review suppression](https://www.law.cornell.edu/cfr/text/16/465.7), threats, intimidation and false accusations, misrepresenting displayed reviews, and the permitted withholding criteria
- [15 U.S.C. 45b: Consumer review protection](https://www.law.cornell.edu/uscode/text/15/45b), the Consumer Review Fairness Act of 2016 (Pub. L. 114-258), void form-contract provisions, exceptions and enforcement
- [42 U.S.C. 3604](https://www.law.cornell.edu/uscode/text/42/3604), discrimination in terms and conditions, false representations of unavailability, protected classes
- [FCC: DA 25-621](https://docs.fcc.gov/public/attachments/DA-25-621A1.txt), repealing the revised one-to-one consent text after the Eleventh Circuit's vacatur in *Insurance Marketing Coalition v. FCC* and restoring the prior written consent definition (July 14, 2025)

**Reference**

- [FTC: Consumer Reviews and Testimonials Rule, questions and answers](https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers), the October 21, 2024 effective date, civil penalties for knowing violations, incentives, review gating under the FTC Act, and responding to negative reviews
- [FTC: Consumer Review Fairness Act, what businesses need to know](https://www.ftc.gov/business-guidance/resources/consumer-review-fairness-act-what-businesses-need-know), prohibited form-contract provisions and enforcement by the FTC and state attorneys general
- [U.S. Department of Justice: Fair Housing Testing Program](https://www.justice.gov/crt/fair-housing-testing-program-1), testers without bona fide intent, the program's 1991 start, 111 resolved cases and $15.3 million recovered
- [National Law Review: BIPA update, Illinois limits liability and clarifies electronic consent](https://natlawreview.com/article/bipa-update-illinois-limits-liability-and-clarifies-electronic-consent-biometric), BIPA's written release, liquidated damages and the August 2024 amendment

**In practice**

- [Entrata: LeadManager](https://www.entrata.com/products/leadmanager), lead-source reporting, call tracking, alerts and consolidated lead records
- [Entrata: Leasing Center](https://www.entrata.com/products/leasing-center), outsourced calls, guest cards, applications and maintenance requests
- [Entrata: Leasing AI](https://www.entrata.com/products/leasing-ai), channels, tour scheduling, 30+ languages and renters mistaking it for a person
- [Entrata: Centralization functionality press release](https://www.entrata.com/press/entrata-unveils-expansion-of-centralization-functionality-homebody-marketplace-and-ai), grouped properties managed together (May 2024)
- [Entrata: ReputationAdvisor](https://www.entrata.com/products/reputationadvisor), aggregated reviews and generated responses
- [RealPage: Knock CRM](https://www.realpage.com/apartment-marketing/crm/), single dashboard across communities, Call Intelligence, source analytics, three tour kinds with ID and selfie verification
- [RealPage: Contact Center](https://www.realpage.com/contact-center/), 24/7 leasing answering, maintenance dispatch and the answer-time claim
- [RealPage: Demand Marketing](https://www.realpage.com/solutions/demand-marketing/), AI Call Scoring, Reputation Management powered by Yext, reporting tied to signed leases
- [RealPage: Lumina AI suite](https://www.realpage.com/news/realpage-introduces-lumina-ai-suite/), the AI Leasing Agent's adoption and resolution claims (August 2026)
- [RealPage: Partnership with Funnel](https://www.realpage.com/news/realpage-and-funnel-announce-partnership/), RealPage data as the source of truth inside Funnel's application flow (October 13, 2026)
- [AppFolio: Marketing and leasing](https://www.appfolio.com/property-manager/marketing-leasing), one guest card per lead across the portfolio, self-guided tours, the Leasing Performer, verified-lead listings
- [MRI Software: Engage CRM](https://www.mrisoftware.com/news/unified-multifamily-comms-accelerate-retention/), guest cards synced in real time and an AI agent that answers, logs and escalates calls
- [Yardi Breeze: Residential features](https://www.yardibreeze.com/residential-features/), the CRM queue, prospect texting and RentCafe Chat IQ
- [ResMan: Contact Center](https://www.myresman.com/solutions/contact-center), unanswered leasing calls and after-hours triage for true emergencies
- [Rent Manager: Call Center](https://www.rentmanager.com/call-center), after-hours answering by Anequim, leasing information and service tickets
- [Funnel: What is a renter-centric CRM](https://funnelleasing.com/what-is-a-renter-centric-crm-and-why-is-it-important-for-leasing/), one renter profile across a portfolio's communities
- [Apartment List: Joining AppFolio Stack](https://www.apartmentlist.com/rental-management/apartment-list-joins-appfolio-stack), a lease fee connected to move-in outcomes
- [SmartRent: Self-guided tours](https://smartrent.com/product/self-guided-tours/), automated ID verification and PINs invalidated after the tour
- [PointCentral: Self-guided tours](https://www.pointcentral.com/self-guided-tours/), ID and selfie verification before codes and the optional two-mile geofence
