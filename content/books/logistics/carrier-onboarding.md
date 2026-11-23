+++
title = "Carrier Onboarding & Vetting"
nav_title = "Carrier Onboarding"
description = "How brokers and shippers qualify carriers: the packet, authority, insurance, safety and identity checks, vetting vendors, monitoring, and what to store."
category = "Logistics & Supply Chain Industry"
order = 2817
part = "Freight Brokerage"
tags = ["logistics", "freight-brokerage", "carrier-vetting", "onboarding", "compliance", "data-model"]
+++

Before a broker gives a carrier a load, it has to decide that the company on the phone is real, is the company it claims to be, may legally haul the freight, is insured for it, isn't known to be unsafe, and will be paid at an address and bank account that belong to it. That decision is carrier onboarding, and every broker, 3PL and shipper with a carrier network makes it thousands of times a year: C.H. Robinson had "more than 450,000 transportation providers" on its platform in 2025, and TQL says "about 18% of carriers are disqualified at onboarding."

It's hard because none of the evidence is the broker's own. Authority, insurance filings and safety data come from FMCSA's registries, which say what was filed, not who is filing; certificates of insurance come from agents and can be forged; contact details come from the applicant; and every one of these can change the day after the carrier is approved. Since *Montgomery v. Caribe Transport II* (May 14, 2026) the decision also carries tort exposure, because a state negligence claim for choosing an unsafe carrier isn't preempted, and the broker's defense is the record of what it checked ([Negligent Selection After *Montgomery*](/books/logistics/freight-brokerage#negligent-selection-after-montgomery)). This chapter covers the onboarding workflow and the carrier packet, each check and its source, the vendors that run them, monitoring after approval, and the records to keep. It extends `carriers`, `parties` and `documents` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model).

The regulations behind each check are owned elsewhere: authority, docket numbers, Motus and revocation in [Operating Authority & Registration](/books/logistics/operating-authority); liability minimums, BMC filings and certificates in [Bonds & Insurance Minimums](/books/logistics/financial-security-and-insurance); ratings, the SMS and inspections in [Safety Ratings, CSA & Inspections](/books/logistics/safety-and-csa); who may drive, which the carrier qualifies and the broker doesn't, in [Drivers: CDLs, Qualification & the Clearinghouse](/books/logistics/drivers-and-qualification). This chapter owns the workflow that reads them. The fraud that onboarding is meant to stop (identity theft, double brokering, fictitious pickups) is [Freight Fraud & Cargo Theft](/books/logistics/freight-fraud); the bank account and its change controls belong to [Stopping the Changed Bank Account](/books/payments/vendor-payouts#stopping-the-changed-bank-account) and, for factors, to [Paying Carriers, Quick Pay & Factoring](/books/logistics/paying-carriers).

## How the Platforms Do It

As of November 2026, from vendor pages, press releases, broker carrier pages and FMCSA's developer documentation:

| Platform | Owner | What it does, in its own words | Notes |
| --- | --- | --- | --- |
| **Carrier Assure** | Independent | Scores carriers from FMCSA data with "algorithms developed to predict the carrier's performance," flags "indicators of double brokering, poor visibility, and instability," publishes SuspectCarrier and SuspectBroker reports | Letter grades; the score "is not an indicator of safety or any type of guarantee of performance." In RMIS through an exclusive partnership announced June 22, 2023 |
| **FMCSA QCMobile API** | FMCSA | Carrier lookups by USDOT number, docket number or name, with authority, BASICs, out-of-service, cargo carried, operation classification and docket numbers | JSON, a `webKey` per caller, 50 results per search; the public source most vendors start from |
| **Highway** | Independent | Verifies "carrier identity, authority, insurance, and operational legitimacy before freight is awarded"; Know Your Driver confirms "that the person arriving for pickup is the authorized driver" and identifies "cross-network overlap" | Products include Carrier Identity Engine, Load Lock and Secure Rate Con Delivery; C.H. Robinson receives carriers' certificates "directly from your insurance agent" through Highway |
| **MyCarrierPortal** | Descartes | "carrier onboarding and risk monitoring solutions for the trucking industry" | Acquisition announced by Descartes in a release posted October 2, 2024 |
| **RMIS** | Truckstop | Insurance monitoring and compliance "since 1996"; "collects and monitors Certificate of Insurance information" and manages each client's compliance rule sets | Acquisition announced by Truckstop on March 22, 2021, joining Truckstop's own SaferWatch |

And what the brokers publish as their bar:

| Broker | Authority | Insurance | Safety | Verification |
| --- | --- | --- | --- | --- |
| **C.H. Robinson** | "An active MC/MX# or DOT#," active "for at least 7 days" | $1,000,000 auto, $100,000 cargo | Rating must be active; no threshold published | Certificate from the agent through Highway; contract changes signed "by the same individual who signed your most recent contract" |
| **Flock Freight** | Per its agreement | $1,000,000 auto, $100,000 cargo, $1,000,000 general liability | Not "Unsatisfactory" or "Conditional" | Per its agreement |
| **TQL** | "valid and active operating authority issued by the FMCSA prior to approval" | $1,000,000 auto, $100,000 cargo, "verified directly with the carrier's insurance agent" | Conditional ratings "generally avoided" | "continuously monitored thereafter" |

The patterns:

- **Federal data is the floor, not the decision.** Every vendor starts from FMCSA's registries; what they sell is history (who has this phone number been before), network data (which brokers have used this carrier, which have flagged it) and identity proofing the registry doesn't do. A broker policy decides what to do with the answers.
- **Certificates come from the agent.** C.H. Robinson and TQL above treat a certificate sent by the carrier as unverified, and RMIS's product is collecting and monitoring certificates for its clients; the certificate is requested from, or confirmed with, the producing agent.
- **Onboarding is continuous.** TQL says so; RMIS sells monitoring; Highway checks "before, during, and after every load." A carrier approved in March is a different risk in September.
- **Each broker's rules are its own.** Seven days of authority, no Conditional ratings, $100,000 of cargo cover: these are policies, not regulations, and a shipper contract can tighten them. They have to be data with versions.

## The Workflow

Onboarding is a workflow with a state per carrier per broker, not a flag on the carrier ([Make the States Explicit](/docs/building-blocks/workflows#make-the-states-explicit)). The common shape:

1. **Invitation or application.** The carrier arrives through a load board call, a rep's invitation or a vendor network, identified by USDOT or docket number. The first act is to find the existing party, if any ([Match Before Create](/docs/building-blocks/record-linkage#match-before-create)): the same carrier applying twice, or a fraudster applying under a real carrier's number, both look like a new application.
2. **Registry read.** Authority, USDOT status, the insurance filing on record and any pending cancellation, out-of-service orders, the safety rating and the published SMS measures, read from FMCSA (directly or through a vendor) and kept as returned.
3. **Identity.** The person applying is tied to the carrier: their contact details checked against the registry and the vendor's history, their authority to sign for the company confirmed, and for higher-risk profiles a document and selfie check. FMCSA now proofs identity at registration in Motus ("In April 2025, the Agency partnered with IDEMIA"; [Motus and the Rules in Flux](/books/logistics/operating-authority#motus-and-the-rules-in-flux)), which helps only for registrations made through it; the broker still has to prove the person in front of it is that registrant.
4. **The packet.** The signed broker-carrier agreement ([The Broker-Carrier Agreement](/books/logistics/freight-brokerage#the-broker-carrier-agreement)), a W-9 ([Tax: W-9s, TIN Matching and 1099s](/books/payments/vendor-payouts#tax-w-9s-tin-matching-and-1099s)), the certificate of insurance from the agent, the operating authority letter, remit-to and bank details or a factor's notice of assignment, equipment and lanes, and contacts for dispatch, billing and after hours.
5. **Insurance verification.** The certificate parsed into coverage lines and limits, checked against the broker's requirements for the freight the carrier will haul, and confirmed with the agent.
6. **Decision.** Approved, approved with restrictions (no hazmat, no high-value, no loads beyond a date the insurance expires), referred to a compliance analyst, or declined; each with the policy version and the checks behind it.
7. **Monitoring.** Subscriptions to authority, insurance and rating changes, with alerts that move the carrier back to review or block it before the next tender.

The carrier experience matters because good carriers have choices. A packet that takes twenty minutes and asks for documents the broker could have read from FMCSA loses carriers to brokers whose vendor network already holds them.

## The Checks

| Check | Source | What fails it | Notes |
| --- | --- | --- | --- |
| **Authority** | FMCSA registry (QCMobile, a vendor, or the Licensing and Insurance system) | Not active; revoked; pending revocation; authority type that doesn't fit (broker-only authority hauling freight) | Many brokers add an age floor (seven days at C.H. Robinson); the registry's grant date is the input. [Suspension, Revocation and Reinstatement](/books/logistics/operating-authority#suspension-revocation-and-reinstatement) covers the statuses |
| **USDOT status** | FMCSA | Inactive USDOT number, out-of-service order | An out-of-service order on the carrier is a hard stop; QCMobile exposes `/carriers/:dotNumber/oos` |
| **Insurance on file** | FMCSA filing record | No BIPD filing, a filing below the minimum, a pending cancellation | A cancellation takes effect at least 30 days after FMCSA receives it, and no load should deliver after that date ([Filings and Cancellations](/books/logistics/financial-security-and-insurance#filings-and-cancellations)) |
| **Certificate of insurance** | The carrier's agent | Limits below the broker's requirement or the shipper's; cargo exclusions (reefer breakdown, unattended vehicle) for the freight; policy expiring before delivery | The products are [Commercial Lines](/books/insurance/commercial-lines#the-lines); exclusions are in [Cargo Insurance in Practice](/books/logistics/financial-security-and-insurance#cargo-insurance-in-practice) |
| **Safety rating** | FMCSA | Unsatisfactory (a carrier whose rating has become final may not operate); Conditional, by policy | Unrated is not a rating: a carrier is rated only after a compliance review ([Safety Ratings and Investigations](/books/logistics/safety-and-csa#safety-ratings-and-investigations)) |
| **SMS measures and inspections** | FMCSA's Safety Measurement System | Policy thresholds on the public BASICs; recent out-of-service rates | The SMS uses "data from roadside inspections and crash reports from the last two years," updates "once a month," and keeps Crash Indicator and Hazardous Materials Compliance non-public ([The Safety Measurement System](/books/logistics/safety-and-csa#the-safety-measurement-system)) |
| **Identity** | The applicant, the registry's contacts, vendor history | Contacts that don't match the registry; an email domain or phone tied to other carriers; a registry contact change days before applying | The registry says what was filed; [The Schemes](/books/logistics/freight-fraud#the-schemes) covers why a recent change of phone or email is the tell of an identity takeover |
| **Operations** | Vendor network, ELD connection, the broker's own history | No trucks seen, no history with any broker, a fleet size that doesn't match the registry | Highway's "cross-network overlap" and Carrier Assure's "indicators of double brokering" are this check, sold |
| **Payment details** | The W-9, the bank, a factor's notice | Name mismatch with the TIN; an account not owned by the carrier or its factor | Owned by Payments and by [Paying Carriers, Quick Pay & Factoring](/books/logistics/paying-carriers) |

Two decisions inside the table need policy written down. **Conditional ratings.** A Conditional rating means FMCSA found the carrier "does not have adequate safety management controls in place" (49 CFR 385.3), the same words as Unsatisfactory, except that the inadequacy "could result in" the listed occurrences rather than "has resulted in" them; Flock Freight's agreement excludes it, TQL "generally" avoids it, and the *Montgomery* plaintiff alleged that the broker hired a carrier with a Conditional rating. **New entrants.** A carrier in its 18 months of new entrant monitoring ([New Entrants](/books/logistics/safety-and-csa#new-entrants)) has little SMS data and usually no rating; refusing them all shrinks the network, accepting them all accepts the population where identity fraud concentrates. A rule that grants new entrants restricted approval (low-value freight, tracking required, no hazmat) is the common answer, and it is a policy decision for the broker, not a fact.

## Monitoring

Approval is a snapshot; monitoring keeps it true. The events that matter:

- **Authority revoked or pending revocation,** including for lapsed insurance filings.
- **Insurance filing cancelled or pending cancellation,** with its effective date, and certificates reaching expiry.
- **Safety rating changed,** and SMS measures crossing the broker's thresholds in a monthly update.
- **Out-of-service order** on the carrier.
- **Registry contact or address change,** the precursor to most carrier identity takeovers.
- **Network signals:** another broker in the vendor's network flags the carrier, or a pattern of loads that don't track.

An alert does three things: it changes the carrier's qualification for future tenders (blocked, review, restricted), it finds open loads already tendered or in transit with that carrier and puts them in front of a person, and it records what was known when. The second matters most: a revocation discovered on Tuesday about a carrier picking up on Wednesday is a load to re-cover, and one about a load already rolling is a call to the driver and the shipper.

Monitoring has a cost model. Vendors charge per monitored carrier, and a broker that monitors every carrier it ever onboarded pays for 200,000 carriers to haul for 20,000. Monitoring the carriers with loads in the last N months, and re-running a full check on anyone dormant longer than that before their next load, is the usual trade.

## What to Store

My rule: keep every answer as it came back, keep the decision that used it, and never let a later read overwrite what an earlier decision relied on. Concretely:

- **Every registry and vendor read** with its source, time and raw response, in the tables their chapters define: `carrier_registration_checks` in [Operating Authority & Registration](/books/logistics/operating-authority#how-to-build-it), `insurance_filings`, `insurance_certificates` and `insurance_coverages` in [Bonds & Insurance Minimums](/books/logistics/financial-security-and-insurance#how-to-build-it), and `carrier_safety_snapshots` in [Safety Ratings, CSA & Inspections](/books/logistics/safety-and-csa#how-to-build-it).
- **The packet documents** as received, with hashes: agreement version, W-9, certificate, authority letter, notice of assignment.
- **Verified contacts,** each with how and when it was verified, separate from contacts the applicant typed.
- **The qualification decision** per broker and carrier, with its status, restrictions, policy version, the checks used and who decided.
- **Alerts and their handling,** including which open loads each one touched.
- **Off-boarding,** with its reason, because "do not use" lists are shared across reps and must survive a carrier reapplying under a new docket.

## How to Build It

The deltas add a qualification per broker and carrier, the onboarding case and its steps, verified contacts and monitoring alerts. Registry reads, certificates and safety snapshots are the tables their own chapters define; the rows here point at them by key. Authority age, the input to a rule like "active for at least 7 days," is the start of the authority's first `active` period in `carrier_authority_periods`, not a new column:

```sql
ALTER TABLE carriers
  ADD COLUMN registry_contact_changed_at TIMESTAMPTZ;  -- last contact change seen in the registry

CREATE TABLE carrier_qualifications (       -- one broker's or shipper's decision about one carrier
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id    UUID NOT NULL REFERENCES parties (id),   -- the broker or shipper deciding
  carrier_party_id  UUID NOT NULL REFERENCES parties (id),
  status            TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'restricted',
                      'review', 'blocked', 'offboarded')),
  restrictions      JSONB NOT NULL DEFAULT '{}',  -- {"no_hazmat": true, "max_cargo_value": 10000000}
  policy_version    TEXT NOT NULL,
  check_ids         UUID[] NOT NULL DEFAULT '{}',  -- registration, insurance and safety reads used
  reason            TEXT,
  decided_by_kind   TEXT NOT NULL CHECK (decided_by_kind IN ('user', 'rule', 'vendor')),
  decided_by        TEXT NOT NULL,
  valid_during      TSTZRANGE NOT NULL DEFAULT tstzrange(NOW(), NULL),
  CHECK (status NOT IN ('blocked', 'offboarded', 'restricted') OR reason IS NOT NULL),
  EXCLUDE USING gist (owner_party_id WITH =, carrier_party_id WITH =, valid_during WITH &&)  -- needs btree_gist
);

CREATE TABLE carrier_onboarding_cases (     -- one application, start to decision
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id    UUID NOT NULL REFERENCES parties (id),
  carrier_party_id  UUID REFERENCES parties (id),  -- null until matched or created
  applied_as        JSONB NOT NULL,      -- USDOT, docket, name and contacts as submitted
  channel           TEXT NOT NULL CHECK (channel IN ('invitation', 'self_signup', 'load_board',
                      'vendor_network', 'manual')),
  vendor            TEXT,                -- the onboarding platform used, if any
  status            TEXT NOT NULL CHECK (status IN ('started', 'awaiting_documents',
                      'awaiting_insurance', 'in_review', 'approved', 'declined', 'abandoned')),
  qualification_id  UUID REFERENCES carrier_qualifications (id),  -- the decision it produced
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at         TIMESTAMPTZ
);

CREATE TABLE carrier_onboarding_steps (     -- each check or document, with its evidence
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id           UUID NOT NULL REFERENCES carrier_onboarding_cases (id),
  step              TEXT NOT NULL CHECK (step IN ('registry', 'identity', 'agreement', 'w9',
                      'certificate', 'agent_confirmation', 'safety', 'operations',
                      'payment_details', 'review')),
  outcome           TEXT NOT NULL CHECK (outcome IN ('passed', 'failed', 'warning', 'waived',
                      'pending')),
  registration_check_id UUID REFERENCES carrier_registration_checks (id),  -- the registry read
  certificate_id    UUID REFERENCES insurance_certificates (id),  -- the certificate checked
  document_id       UUID REFERENCES documents (id),  -- the agreement, W-9 or notice received
  detail            JSONB NOT NULL DEFAULT '{}',   -- the rule results, as evaluated
  waived_by         UUID,
  waive_reason      TEXT,
  completed_at      TIMESTAMPTZ,
  CHECK (outcome <> 'waived' OR (waived_by IS NOT NULL AND waive_reason IS NOT NULL))
);

CREATE TABLE carrier_contacts (             -- who speaks for the carrier, and how that was verified
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_party_id  UUID NOT NULL REFERENCES parties (id),
  owner_party_id    UUID NOT NULL REFERENCES parties (id),  -- whose verification this is
  purpose           TEXT NOT NULL CHECK (purpose IN ('dispatch', 'billing', 'after_hours',
                      'owner', 'insurance_agent', 'factor')),
  channel           TEXT NOT NULL CHECK (channel IN ('phone', 'email', 'portal_user')),
  value             TEXT NOT NULL,       -- normalized: E.164 phone, lowercased email
  verified_how      TEXT CHECK (verified_how IN ('registry_match', 'callback_to_registry_phone',
                      'document_and_selfie', 'vendor', 'agent')),
  verified_at       TIMESTAMPTZ,
  valid_during      TSTZRANGE NOT NULL DEFAULT tstzrange(NOW(), NULL),
  source            TEXT NOT NULL CHECK (source IN ('applicant', 'registry', 'vendor', 'rep'))
);
CREATE INDEX ON carrier_contacts (value);  -- the same phone on two carriers is a signal

CREATE TABLE carrier_monitoring_alerts (    -- a change seen after approval, and its handling
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id     UUID NOT NULL REFERENCES parties (id),
  carrier_party_id   UUID NOT NULL REFERENCES parties (id),
  kind               TEXT NOT NULL CHECK (kind IN ('authority_revoked', 'authority_pending_revocation',
                       'insurance_cancelled', 'insurance_pending_cancellation',
                       'certificate_expiring', 'rating_changed', 'sms_threshold',
                       'out_of_service', 'registry_contact_changed', 'network_flag')),
  source             TEXT NOT NULL,      -- the registry or vendor that raised it
  effective_at       TIMESTAMPTZ,        -- when the change takes effect, if stated
  observed_at        TIMESTAMPTZ NOT NULL,
  received_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload            JSONB NOT NULL,     -- as received
  affected_load_ids  UUID[] NOT NULL DEFAULT '{}',  -- open loads found at the time
  resolution         TEXT CHECK (resolution IN ('blocked', 'review', 'restricted',
                       'no_action', 'false_positive')),
  resolved_by        UUID,
  resolved_at        TIMESTAMPTZ,
  dedupe_key         TEXT NOT NULL UNIQUE  -- source, carrier, kind and effective_at
);
```

The tender-time question, which carriers are fit for this load right now, reads the current qualification and its restrictions, plus the registration gate from [Operating Authority & Registration](/books/logistics/operating-authority#how-to-build-it) (a recent check showing active authority and no pending cancellation):

```sql
SELECT q.carrier_party_id
FROM carrier_qualifications q
JOIN LATERAL (                                    -- the latest registry read by this broker
  SELECT rc.authority_active, rc.pending_cancellation, rc.checked_at
  FROM carrier_registration_checks rc
  WHERE rc.carrier_party_id = q.carrier_party_id
    AND rc.checked_by_party_id = q.owner_party_id
  ORDER BY rc.checked_at DESC
  LIMIT 1
) rc ON TRUE
WHERE q.owner_party_id = $1                       -- the broker
  AND q.valid_during @> NOW()
  AND q.status IN ('approved', 'restricted')
  AND rc.authority_active
  AND NOT rc.pending_cancellation
  AND rc.checked_at > NOW() - INTERVAL '24 hours' -- the freshness default Operating Authority sets
  AND NOT (q.restrictions ? 'no_hazmat' AND $2)   -- $2: the load carries hazmat
  AND COALESCE((q.restrictions ->> 'max_cargo_value')::BIGINT, 9223372036854775807) >= $3
  AND NOT EXISTS (                                -- no unresolved alert
    SELECT 1 FROM carrier_monitoring_alerts a
    WHERE a.owner_party_id = q.owner_party_id
      AND a.carrier_party_id = q.carrier_party_id
      AND a.resolved_at IS NULL);
```

Applying an alert is one transaction: close the current qualification, open the new one, and record the open loads it affects, so nothing tenders to the carrier between the alert and a person seeing it.

```go tab="Go"
func (s *Service) ApplyAlert(ctx context.Context, a Alert) error {
	return s.tx(ctx, func(q *Queries) error {
		inserted, err := q.InsertAlert(ctx, a) // ON CONFLICT (dedupe_key) DO NOTHING
		if err != nil || !inserted {
			return err // a repeat of an alert already applied
		}
		status := s.policy.StatusFor(a.Kind) // "blocked" for revocation, "review" for a contact change
		if err := q.SupersedeQualification(ctx, a.OwnerID, a.CarrierID, status,
			"alert:"+string(a.Kind), s.policy.Version()); err != nil {
			return err
		}
		loads, err := q.OpenLoadsForCarrier(ctx, a.OwnerID, a.CarrierID)
		if err != nil {
			return err
		}
		if err := q.SetAffectedLoads(ctx, a.ID, loads); err != nil {
			return err
		}
		return q.EnqueueOutbox(ctx, "carrier_qualification.changed", a.CarrierID, loads)
	})
}
```

```rust tab="Rust"
pub async fn apply_alert(svc: &Service, a: Alert) -> Result<(), sqlx::Error> {
    let mut tx = svc.pool.begin().await?;
    if !insert_alert(&mut tx, &a).await? {
        return Ok(()); // a repeat of an alert already applied
    }
    let status = svc.policy.status_for(a.kind); // Blocked for revocation, Review for a contact change
    supersede_qualification(&mut tx, a.owner_id, a.carrier_id, status,
        &format!("alert:{}", a.kind), svc.policy.version()).await?;
    let loads = open_loads_for_carrier(&mut tx, a.owner_id, a.carrier_id).await?;
    set_affected_loads(&mut tx, a.id, &loads).await?;
    enqueue_outbox(&mut tx, "carrier_qualification.changed", a.carrier_id, &loads).await?;
    tx.commit().await
}
```

Design notes:

- **Qualification belongs to the decider.** `carrier_qualifications` is keyed by the broker or shipper as well as the carrier: one carrier is approved by one broker and blocked by another, and a software vendor serving many brokers keeps them apart ([Multi-Tenancy](/docs/architecture/multi-tenancy)). Network data a vendor shares across its customers is an input to a decision, never the decision.
- **History by range.** Each qualification is a `valid_during` range and the exclusion constraint keeps them from overlapping, so "was this carrier approved on March 3" is an as-of query ([As-Of Queries](/docs/database/temporal-data#as-of-queries)).
- **Contacts are verified facts, not profile fields.** A phone number typed by the applicant and one matched to the registry are different rows with different trust; dispatch, payment changes and rate confirmations go only to verified ones.
- **Alerts are idempotent.** Vendors resend; the `dedupe_key` makes the second copy a no-op ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)).
- **Vendor answers are leads.** A vendor score or flag feeds the policy; the qualification records which rule used it, as [Risk Scoring](/docs/building-blocks/risk-scoring#the-decision-record) describes, and the carrier's appeal reaches a person.

## Auditing

- **Every check, as returned,** with its source, time and the decision that used it.
- **Every qualification change,** with status, restrictions, policy version, reason and actor.
- **Every waiver and override,** with its approver.
- **Packet documents and agreement versions,** with hashes.
- **Alerts with the loads they touched** and what was done about each.
- **Policy versions,** so the rule a decision applied can be shown later.

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Model onboarding as a workflow with steps and evidence,** not a checkbox on the carrier.
- **Keep the decision per decider,** with ranges, so each broker's or shipper's approval history stands alone.
- **Read the registry for every fact it holds,** keep the raw answer, and ask the applicant only for what the registry can't say.
- **Take certificates from the agent,** and check limits and expiry against the load, not today.
- **Verify contacts and store how,** and route dispatch and payment changes only to verified ones.
- **Write the policy as versioned data:** authority age, rating acceptance, new entrant restrictions, insurance minimums by freight.
- **Monitor after approval** and, on every alert, find the open loads before the next tender.

## References

**Regulations and FMCSA**

- [49 CFR 385.3: Definitions and acronyms](https://www.law.cornell.edu/cfr/text/49/385.3), Satisfactory, Conditional and Unsatisfactory ratings
- [FMCSA: QCMobile API](https://mobile.fmcsa.dot.gov/QCDevsite/docs/qcApi), carrier lookup endpoints, the `webKey` and result limits
- [FMCSA: CSA, the SMS measures](https://csa.fmcsa.dot.gov/About/Measure), the BASICs, two years of data, monthly updates and non-public categories
- [Federal Register: Availability of Motus, FMCSA's new registration system (April 29, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-04-29/html/2026-08334.htm), identity proofing with IDEMIA at registration

**Courts**

- [Montgomery v. Caribe Transport II, LLC, No. 24-1238 (May 14, 2026)](https://www.supremecourt.gov/opinions/25pdf/24-1238_1b7d.pdf), negligent selection claims against brokers survive preemption

**Vendors**

- [Carrier Assure](https://www.carrierassure.com/), FMCSA-based scoring, double brokering indicators, suspect reports and the safety disclaimer
- [Highway](https://highway.com/), identity, authority and insurance verification, Know Your Driver and cross-network overlap
- [Descartes: Descartes acquires MyCarrierPortal](https://www.descartes.com/resources/news/press-release-descartes-acquires-mycarrierportal), the acquisition and MyCarrierPortal's onboarding and monitoring
- [Truckstop.com acquires Registry Monitoring Insurance Services (March 22, 2021)](https://prnewswire.com/news-releases/truckstopcom-acquires-registry-monitoring-insurance-services-rmis-301252521.html), RMIS since 1996, certificate collection and monitoring, and SaferWatch
- [Truckstop and Carrier Assure announce exclusive partnership (June 22, 2023)](https://prnewswire.com/news-releases/truckstop-and-carrier-assure-announce-exclusive-partnership-to-enhance-carrier-compliance-301857565.html), Carrier Assure scores inside RMIS

**Brokers**

- [C.H. Robinson: Carrier FAQ](https://www.chrobinson.com/en/Carriers/FAQ/), authority and its seven-day age, insurance limits, certificates through Highway and contract change signers
- [Flock Freight: Broker-carrier agreement](https://www.flockfreight.com/resources/broker-carrier-agreement), insurance limits and the rating representation
- [TQL: Carrier vetting](https://www.tql.com/carrier-vetting), authority, agent-verified insurance, conditional ratings, monitoring and the 18% disqualification rate
- [C.H. Robinson Worldwide: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1043277/000104327726000009/chrw-20251231.htm), more than 450,000 transportation providers
