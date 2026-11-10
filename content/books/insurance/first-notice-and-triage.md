+++
title = "First Notice, Coverage & Triage"
nav_title = "FNOL & Triage"
description = "First notice of loss channels and data, coverage verification as of the loss date, reservation of rights and denials, segmentation, assignment, the claim file."
category = "Insurance Industry"
order = 2729
part = "Claims"
tags = ["insurance", "claims", "fnol", "coverage", "reservation-of-rights", "triage"]
+++

A claim starts as a phone call, a web form, a text, an agent's email or an API call from a partner, and within minutes it has to become something a regulator would recognize: a dated notice that starts the state's clocks, a claim against the policy that was in force on the loss date, the right exposures against the right coverages, an adjuster with the license and authority to handle it, and a file that records every step. First notice of loss (FNOL) is the moment the insurer is on notice, and in most states notice to the agent is notice to the insurer, so the system's `reported_at` is a legal fact, not a convenience timestamp. Everything triage decides in the first hour (who handles the claim, whether it goes to a desk, a field adjuster, an independent adjuster or the special investigations unit, whether coverage is in question) shapes the cost of the claim and the insurer's exposure if it is handled badly.

This chapter covers the intake channels and the data FNOL captures, coverage verification against the policy as of the loss date, coverage positions (acknowledgments, reservations of rights and denials), segmentation and assignment, and the claim file that exists when intake is done. The deadlines that FNOL starts are in [Claim Handling Law & Clocks](/books/insurance/claim-handling-law), reserves and payments in [Exposures, Reserves & Payments](/books/insurance/reserves-and-payments), and fraud referrals at intake in [Fraud & SIU](/books/insurance/insurance-fraud).

## How the Platforms Do It

As of November 2026, from public documentation and vendor sites (vendor figures are their own marketing):

| Platform | FNOL and triage model |
| --- | --- |
| **Guidewire ClaimCenter** | FNOL is at least two Cloud API calls: `POST /claims` creates a draft claim with a draft number and copies the policy from the policy administration system into the claim's policy graph; optional `PATCH /claims/{claimId}` calls add data; `POST /claims/{claimId}/submit` opens the claim, assigns the claim number and runs claim setup rules that segment it, assign it and create activities. A verified policy not in force on the loss date is rejected; an unverified policy (built from the call's data) can be patched but typically can't be paid. A draft can be cancelled; an open claim can only be closed |
| **Duck Creek Claims** | A separate agentic FNOL product for conversational intake and workflow orchestration; 2,600+ open APIs across policy, billing and claims; markets 60,000+ claims a day during a catastrophe |
| **Snapsheet** | A core claims platform with AI agents and no-code workflow, virtual vehicle appraisal, total loss settlement and integrated payments, for carriers, MGAs, TPAs and fleets |
| **Five Sigma** | An AI-native cloud claims system with agents that move claims through stages within configured procedures and thresholds and surface exceptions to adjusters; sold to insurers, MGAs, TPAs and self-insureds |
| **Hi Marley** | SMS-based Conversational FNOL, Workflow Assist, Total Loss Assist and Claims Inquiry Assist; 130+ customers including 13 of the top 30 P&C carriers; carrier-reported 35-50% fewer inbound calls |
| **CCC Intelligent Solutions** | The auto claims network: more than 300 insurers, including 27 of the top 30 US auto insurers by direct written premium, and about 30,500 collision repair facilities; FNOL feeds estimating, total loss, subrogation and casualty workflows |

The shape they share, and the one to copy: **intake creates a draft, submission makes it a claim.** The draft can be edited, deduplicated or abandoned; submission assigns the claim number, stamps the notice time, resolves the policy, creates exposures and runs triage rules. Nothing that starts a regulatory clock should depend on an adjuster opening a screen.

## First Notice: Channels and Data

Notice reaches an insurer through the policyholder (phone, web, mobile app, text), the agent or broker, a third-party claimant or their lawyer, a repair shop or tow yard, a telematics crash alert, a partner platform (a rideshare company or a rental marketplace, whose side is [Damage, Claims & Settlement](/books/user-generated-platforms/damage-and-claims)) or another insurer's subrogation demand. Each channel is a different source with a different trust level, and the record keeps which one it was.

What counts as notice is law, and the definitions differ:

| Rule | What is notice |
| --- | --- |
| **NAIC Model 902** | "Notification of claim": any notification, in writing or by other means acceptable under the policy, to an insurer or its agent, by a claimant, that reasonably apprises the insurer of the facts pertinent to a claim. Notification given to an agent "shall be notification to the insurer" |
| **California, 10 CCR 2695.2** | Notice of claim is any written or oral notification to an insurer or its agent that reasonably apprises the insurer of the claim; proof of claim is any evidence or documentation in the insurer's possession |
| **Texas, Ins. Code 542.051** | Notice of claim is "any written notification provided by a claimant to an insurer" that reasonably apprises it of the facts; a phone call alone doesn't start the prompt payment subchapter's clock |
| **Florida, Stat. 627.70131(1)** | Communications to or from an insurer's authorized representative are communications to or from the insurer |

The data captured at FNOL is what triage, coverage and the clocks need, and what the claimant can tell you without a form they can't fill in:

- **When.** Loss date and time (and time zone, because coverage begins at 12:01 a.m. at the risk), and the reported date and time with the channel and the person who received it.
- **Where.** Loss location, which picks the jurisdiction whose claim rules apply (usually the state where the risk is or the policy was issued, configured per product), and which feeds catastrophe coding when an event is open ([The Life of a Property Claim](/books/insurance/insurance-business#the-life-of-a-property-claim)).
- **What happened.** Cause of loss in the insurer's code list, a narrative, and loss-type specifics: for auto, the vehicles, drivers, passengers, police report number, point of impact and drivability; for property, the damaged areas, whether water is still flowing, whether the home is habitable.
- **Who.** The reporter, the insured, claimants, injured people, witnesses, other drivers and their insurers, each a party with a role ([The Core Data Model](/books/insurance/insurance-business#the-core-data-model)).
- **Evidence.** Photos, video, documents and telematics data, stored as documents with their source and capture time.

Two practical rules. First, **record notice when it arrives, not when it is keyed.** A claim reported to an agent on Friday evening and entered on Monday was noticed on Friday; the agent integration should carry the agent's received time, and the system should start the clocks from it. Second, **match before create**: the same loss reported by the insured, the other driver's insurer and a tow yard should be one claim with three notices, not three claims, which is a record-linkage problem on policy, loss date, location, vehicles and parties ([Match Before Create](/docs/building-blocks/record-linkage#match-before-create)).

## Verifying Coverage

The first coverage question is mechanical: was there a policy in force for this risk on the loss date, as the insurer knew it then and knows it now? The answer is a bitemporal query against policy versions, because an endorsement processed after the loss can change what was covered on the loss date (adding a car the day before the accident, effective the day before), and a cancellation for nonpayment may or may not have taken effect depending on whether its notice was timely (Cancellation, Nonrenewal & Notice Law). The claim stores the policy version it was opened against, the recorded time of that version, and any later version that changed the answer.

The questions verification answers, in order:

1. **Policy and term.** A term whose effective range contains the loss time. None found is not a denial: the policy may be in another system, under another insurer in the group, or bound but not yet issued. Guidewire's distinction is useful: a **verified** policy is copied from the policy system; an **unverified** one is captured from the reporter so the claim can open, and payments wait until it is verified.
2. **Risk and coverage.** The vehicle, driver, dwelling or location is on the version, and the coverages that could respond are there with their limits and deductibles.
3. **Conditions.** Late notice, a driver excluded by endorsement, a vacancy clause, an unpaid premium in a grace period, a cause of loss the form excludes. These don't close the claim at FNOL; they become coverage issues an adjuster investigates and a position the insurer takes in writing.

Acknowledging and investigating a claim doesn't concede coverage. Florida says so in its claims administration statute: acknowledging receipt of notice, furnishing forms, and investigating or negotiating "shall [not] be deemed to constitute a waiver of any provision of a policy or of any defense of the insurer" (Fla. Stat. 627.426(1)). Model 902 adds limits on what the insurer may do with a coverage question: it may not deny for failure to give written notice within a time limit unless written notice is a policy condition or the failure is so unreasonable it breaches the duty to cooperate, and it may not deny for failure to exhibit property without documentation of the breach in the file.

## Coverage Positions: Reservations of Rights and Denials

When coverage is in doubt, the insurer tells the insured where it stands, in writing, and the timing is regulated.

**Reservation of rights.** A letter that says the insurer is investigating (or defending a liability suit) while reserving its right to deny coverage on stated grounds. For liability insurers, Florida makes the letter a condition of the defense: the insurer may not deny coverage based on a particular coverage defense unless, within 30 days after it knew or should have known of the defense, it gives the named insured written notice of reservation of rights by postal proof of mailing, registered or certified mail, Intelligent Mail barcode tracking or hand delivery, and, within 60 days of that notice or of receiving a summons and complaint naming the insured (whichever is later) and no later than 30 days before trial, it either refuses to defend in writing, obtains a nonwaiver agreement after full disclosure, or retains mutually agreeable independent counsel (Fla. Stat. 627.426(2)). New York requires an insurer disclaiming liability or denying coverage for death or bodily injury from an accident in the state to give written notice "as soon as is reasonably possible" to the insured and the injured person (N.Y. Ins. Law 3420(d)(2)). With no fixed number of days, the system can only start the task when the insurer learns the facts and escalate it daily.

### Worked Numbers: Florida Reservation of Rights Deadlines

Mine. A liability insurer learns on April 5, 2027, from a recorded statement, that the driver in an auto accident may be excluded by endorsement. The insured is served with a summons and complaint, and forwards it, on May 20, 2027.

| Step | Rule | Deadline |
| --- | --- | --- |
| Reservation of rights to the named insured | 30 days after the insurer knew or should have known (April 5) | May 5, 2027 |
| Refusal to defend, nonwaiver agreement, or independent counsel | 60 days after the later of the reservation (if sent May 5, July 4) or the summons (July 19) | July 19, 2027, and in any case at least 30 days before trial |

Two lessons for the system. The clock runs from when the insurer "knew or should have known," so the task must be created from the event that revealed the defense (the statement, the MVR, the underwriting file), with that event's date, not from the day a coverage specialist was assigned. And the proof of mailing is part of the position: a reservation sent by plain email is not one of the methods the statute names.

**Denial.** Model 902 requires that a denial on a specific policy provision, condition or exclusion refer to it, in writing, with documentation in the file, and that a claimant who objects be told in writing that the department can review the matter. California requires written denials that state the reasons and a statement that the claimant may have the matter reviewed by the California Department of Insurance (10 CCR 2695.7(b)(1), (b)(3)). Model 900 lists failing "to promptly provide a reasonable and accurate explanation of the basis" for a denial or compromise offer as an unfair practice. A denial letter is therefore a generated document with required parts: the provisions cited (form number, edition and the clause), the facts relied on, the department review statement for the state, and any limitation-period notice owed ([Claim Handling Law & Clocks](/books/insurance/claim-handling-law#the-model-regulation-s-clocks)).

My rule: **a coverage position is a record, not a letter.** It names the exposure, the coverage, the issue, the policy provisions, the position (covered, reserved, partially denied, denied), the date the insurer learned the facts, the deadline that applied, the document that carried it and its proof of delivery. Letters are rendered from it; reports and audits read it.

## Segmentation and Assignment

Triage sorts claims so each gets the handling it needs and no more. The inputs are on the claim by the end of FNOL: line and coverage, loss type, severity signals (injuries, fatalities, drivability, habitability, total loss likelihood, square footage of water damage), liability signals (rear-end collision, police citation), complexity signals (multiple claimants, commercial vehicles, attorney representation, coverage issues), the catastrophe code, and fraud indicators. Guidewire's claim setup rules run at submission and do three things in order: **segment** the claim (and each exposure), **assign** it to a group and a user, and **create activities** (the first tasks). Every major claims system has the equivalent, and Five Sigma and Snapsheet now sell agents that perform parts of it within configured thresholds.

Typical segments and where they go:

| Segment | Handling | Who |
| --- | --- | --- |
| **Fast track** | Low-severity, clear coverage, no injury: glass, towing, small property claims, photo-estimated auto damage | Desk adjusters or straight-through processing with limits |
| **Standard physical damage** | Auto repairable damage, property claims under a severity threshold | Desk adjusters with virtual inspection; field appraisal on referral |
| **Total loss** | Repair plus salvage likely to exceed value ([Auto Claims & Total Loss](/books/insurance/auto-claims-and-total-loss)) | Total loss unit, valuation vendor, salvage vendor |
| **Injury** | Bodily injury, PIP or med pay exposures | Injury adjusters; casualty specialists for represented or serious injuries |
| **Complex or large loss** | Commercial, high value, fatality, coverage dispute | Senior or large-loss adjusters, field staff, coverage counsel |
| **Catastrophe** | Claims carrying an open event's cat code | Surge teams and independent adjusting firms deployed to the area |
| **Suspicious** | Fraud score or red flags above a threshold | SIU referral, with the claim still handled on its clocks ([Fraud & SIU](/books/insurance/insurance-fraud)) |

**Desk, field and independent.** Desk adjusters work by phone, photo and video; field adjusters and appraisers inspect in person; independent adjusters (IAs) are licensed adjusters from outside firms, retained for surge, remote territory or specialty work and paid fees the insurer records as adjusting expense. An adjuster needs a license in most states (Texas, for one, forbids acting as an adjuster without a license under Ins. Code ch. 4101, and Florida licenses all-lines adjusters appointed as either independent or company employee adjusters), so assignment checks the adjuster's license for the loss state before it routes the claim, the way policy systems check producer licenses before paying commission ([Adjusters and Their Licenses](/books/insurance/claim-handling-law#adjusters-and-their-licenses)).

**Authority.** Each adjuster has reserve and payment authority by line and amount; a claim whose expected severity exceeds the assignee's authority routes to someone with enough, or carries a referral task from the start ([Exposures, Reserves & Payments](/books/insurance/reserves-and-payments#authority-and-approvals)).

Rules for the rules: segmentation is a scoring and rules problem with all the governance of one ([Risk Scoring](/docs/building-blocks/risk-scoring#scores-bands-and-the-human-middle)); keep the rule set versioned, record which rule assigned each claim and why, and treat a model that triages claims as an AI system under the NAIC bulletin where the state has adopted it (Data, AI & Privacy Rules). Reassignment is an event with a reason, because a claim that bounces between adjusters is a claim whose clocks get missed.

## The Claim File Opened

When intake is done, the claim file holds:

- **The claim** with loss and reported times, channel, cause of loss, loss state, catastrophe code, segment, handling office and adjuster.
- **The policy context**: the term and version it was opened against (verified or unverified), with the coverages, limits and deductibles as of the loss date.
- **Incidents**: what was damaged or hurt, each with its facts (general, injury, property, vehicle, or a trip for travel claims).
- **Exposures**: one claimant against one coverage, each with its own adjuster, reserve lines and status (Exposures, Reserves & Payments).
- **Parties and roles**: insured, claimants, drivers, witnesses, attorneys, vendors.
- **Coverage positions** for any open issue, with their letters.
- **Tasks** for every clock the notice started, each with its rule (Claim Handling Law & Clocks), and the first activities from setup rules.
- **Documents**: the FNOL record itself, photos, the police report, recorded statements, each noted as to date received, processed or mailed.

That last point is a model regulation requirement, not good hygiene: Model 902 requires claim files detailed enough "to permit reconstruction of the insurer's activities relative to each claim," each relevant document "noted as to date received, date processed or date mailed," and claim data (claim number, line of coverage, date of loss, date of payment, date of denial or date closed without payment) accessible for open and closed files for the current year and the two preceding years. Market conduct examiners sample claim files and reconstruct them; a system that can't produce the timeline is the finding ([Audit Trails](/docs/building-blocks/audit-trails#producing-records)).

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `claims`, `exposures`, `party_roles`, `documents` and `claim_tasks`. This chapter adds `incidents`, `coverage_positions` and the intake columns on `claims`.

```sql
ALTER TABLE claims
  ADD COLUMN channel             TEXT NOT NULL DEFAULT 'phone',  -- 'web', 'app', 'sms', 'agent',
                                                                -- 'api_partner', 'telematics', ...
  ADD COLUMN reported_by_party_id UUID REFERENCES parties (id),
  ADD COLUMN notice_received_by  TEXT,                -- 'insurer', 'agent', 'tpa', 'representative'
  ADD COLUMN jurisdiction        TEXT NOT NULL,       -- whose claim rules apply: 'US-FL'
  ADD COLUMN policy_version_id   UUID REFERENCES policy_versions (id),  -- opened against
  ADD COLUMN policy_verified     BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN segment             TEXT,                -- 'fast_track', 'total_loss', 'injury', ...
  ADD COLUMN segment_rule_ref    TEXT,                -- the rule version that segmented it
  ADD COLUMN submitted_at        TIMESTAMPTZ;         -- draft became a claim

CREATE TABLE incidents (                   -- what was damaged or hurt
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id           UUID NOT NULL REFERENCES claims (id),
  kind               TEXT NOT NULL CHECK (kind IN ('vehicle', 'property', 'injury',
                       'fixed_property', 'trip', 'general')),
  risk_id            UUID REFERENCES risks (id),  -- the insured vehicle or dwelling, if any
  owner_party_id     UUID REFERENCES parties (id),
  facts              JSONB NOT NULL,        -- drivable, point of impact, rooms, severity, ...
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE exposures
  ADD COLUMN incident_id UUID REFERENCES incidents (id),
  ADD COLUMN adjuster_id UUID;

CREATE TABLE coverage_positions (          -- where the insurer stands, per exposure and issue
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  exposure_id        UUID NOT NULL REFERENCES exposures (id),
  issue              TEXT NOT NULL,         -- 'excluded_driver', 'late_notice', 'vacancy', ...
  position           TEXT NOT NULL CHECK (position IN ('covered', 'reserved',
                       'partial_denial', 'denied', 'withdrawn')),
  provisions         JSONB NOT NULL,        -- form number, edition, clause, quoted text
  facts_known_at     TIMESTAMPTZ NOT NULL,  -- "knew or should have known"
  deadline_at        TIMESTAMPTZ,           -- from the jurisdiction's rule
  rule_ref           TEXT,                  -- 'Fla. Stat. 627.426(2)(a)'
  document_id        UUID,                  -- documents: the letter as sent
  delivery_method    TEXT,                  -- 'certified', 'postal_proof', 'imb', 'hand'
  delivered_at       TIMESTAMPTZ,
  supersedes_id      UUID REFERENCES coverage_positions (id),
  decided_by         UUID NOT NULL,
  decided_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Coverage on the loss date, as known at any time `:as_known`, is one query over the bitemporal versions:

```sql
SELECT pv.id, c.code, c.limits, c.deductible
FROM claims cl
JOIN policy_versions pv ON pv.policy_term_id = cl.policy_term_id
JOIN coverages c        ON c.policy_version_id = pv.id
WHERE cl.id = :claim_id
  AND pv.effective @> cl.loss_at
  AND pv.recorded  @> :as_known::timestamptz;
```

The claim lifecycle is a small state machine guarded in the database: `draft` (editable, cancellable, no clocks unless notice was already received), `open` (submitted, numbered, clocks running), `closed` (every exposure closed), `reopened` (a new payment or a supplemental claim; Florida treats reopened and supplemental claims as claims with their own 60-day clock). Exposures have their own `open`, `closed` and `reopened` states, and the claim's status is derived from them ([Make the States Explicit](/docs/building-blocks/workflows#make-the-states-explicit)).

Design choices:

- **Notice time is captured at the source.** Agent, partner and telematics integrations carry their received timestamp; the claim's `reported_at` is the earliest notice, and later notices attach to it.
- **Submission is idempotent.** A partner retrying `submit` gets the same claim, not a second one.
- **The policy version is pinned, and changes are visible.** If a later endorsement or reinstatement changes coverage on the loss date, the claim gets a task, not a silent update.
- **Positions supersede; they don't overwrite.** Withdrawing a reservation is a new position row that points at the old one.

## Auditing

- **Every notice** with its channel, the party who gave it, who received it and when, and the claim it attached to; duplicates merged, never deleted.
- **The coverage answer as it was:** the policy version and recorded time the claim opened against, and every later change to it.
- **Every coverage position** with the facts-known date, the deadline, the rule, the letter and its proof of delivery.
- **Every segmentation and assignment** with the rule version, inputs and reason, and every reassignment.
- **Each document** dated as received, processed or mailed, so a market conduct examiner can reconstruct the file (Market Conduct & Unfair Practices).

## What This Means for the System You Build

- **Treat `reported_at` as a legal fact**, captured where notice arrived, including at the agent.
- **Create drafts, then submit:** numbering, clocks, exposures and triage happen at submission, idempotently.
- **Verify coverage bitemporally,** against the version in force on the loss date, and pin it on the claim.
- **Record coverage positions as data** with their deadlines and proof, and render letters from them.
- **Version the triage rules** and record which one segmented and assigned each claim.
- **Check adjuster licenses and authority** before assignment.
- **Keep every document dated** so the file can be reconstructed.

## References

**Law and regulation**

- [Fla. Stat. 627.426](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.426.html), acknowledgment, forms and investigation not a waiver, reservation of rights within 30 days and refusal, nonwaiver or independent counsel within 60 days, and the mailing methods; last amended by ch. 2019-108
- [Fla. Stat. 627.70131](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.70131.html), communications with an authorized representative as communications with the insurer
- [N.Y. Ins. Law 3420](https://www.nysenate.gov/legislation/laws/ISC/3420), written notice of disclaimer or denial for death or bodily injury "as soon as is reasonably possible"
- [Tex. Ins. Code 542.051](https://texas.public.law/statutes/tex._ins._code_section_542.051), notice of claim as a written notification
- [Tex. Ins. Code 4101.051](https://texas.public.law/statutes/tex._ins._code_section_4101.051), no one may act as an adjuster without a license
- [Fla. Stat. 626.864](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0626/Sections/0626.864.html), public adjuster and all-lines adjuster licenses, and independent and company employee appointments
- [10 CCR 2695.2](https://www.law.cornell.edu/regulations/california/10-CCR-2695.2), notice of claim as written or oral notification, and proof of claim
- [10 CCR 2695.7](https://www.law.cornell.edu/regulations/california/10-CCR-2695.7), written denials with reasons and the department review statement

**NAIC**

- [NAIC: Unfair Claims Settlement Practices Act (#900) (PDF)](https://content.naic.org/sites/default/files/model-law-900.pdf), the duty to explain denials
- [NAIC: Unfair Property/Casualty Claims Settlement Practices Model Regulation (#902) (PDF)](https://content.naic.org/sites/default/files/model-law-902.pdf), notification of claim, notice to an agent as notice to the insurer, file documentation and retention, written denials citing provisions, and limits on late-notice and failure-to-exhibit denials

**Vendor documentation**

- [Guidewire: The FNOL process in Cloud API](https://docs.guidewire.com/cloud/is/202603/cloudapibf/cloudAPI/ClaimCenter/fnol/executing-fnol/c_the-FNOL-process-in-Cloud-API.html), draft creation, patching and submission, claim setup rules that segment, assign and create activities, verified and unverified policies, and cancelling drafts
- [Duck Creek: Claims](https://www.duckcreek.com/products/claims/), agentic FNOL, open APIs and catastrophe-day volumes
- [Snapsheet](https://www.snapsheetclaims.com/), claims platform, virtual appraisal, total loss and payments
- [Five Sigma](http://fivesigma.ai/), AI-native claims management and agents
- [Hi Marley](https://www.himarley.com/), conversational FNOL products, customer counts and carrier-reported results

**Filings**

- [CCC Intelligent Solutions: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1818201/000119312526067448/ccc-20251231.htm), insurers and repair facilities on the network and the claims workflows FNOL feeds
