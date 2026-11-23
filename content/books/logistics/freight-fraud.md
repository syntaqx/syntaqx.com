+++
title = "Freight Fraud & Cargo Theft"
nav_title = "Freight Fraud"
description = "Carrier identity theft, double brokering, fictitious pickups, payment diversion and cargo theft data, and the controls a broker or shipper builds against them."
category = "Logistics & Supply Chain Industry"
order = 2818
part = "Freight Brokerage"
tags = ["logistics", "freight-brokerage", "fraud", "cargo-theft", "identity-verification", "data-model"]
+++

Freight fraud is theft by paperwork. A criminal doesn't break into a trailer; they become the carrier the broker trusts, or a carrier the broker has never vetted closely, and the freight is handed to them at the dock with a signed bill of lading. Or they take a real carrier's load and quietly re-sell it to a second carrier, collect from the broker and never pay the one who hauled it. Or they leave the freight alone and change where the money goes. Verisk CargoNet recorded 547 supply chain crime incidents in the US and Canada in the third quarter of 2026, with estimated losses of $230.1 million, and fictitious pickups, "incidents in which deception is used to obtain a shipment," were about a quarter of them.

It's hard because every control a broker has is built on records someone else controls. The carrier's identity lives in FMCSA's registry, which says what was filed and, until recently, never who filed it; contact details come from the applicant; the rate confirmation goes to an email address; the driver who arrives at the dock is whoever shows up with the right load number; and the remit-to address and bank account are a form the carrier, or someone pretending to be the carrier, fills in. Each step is ordinary, and fraud is an ordinary step done by the wrong person. This chapter covers the schemes (identity theft, double brokering, fictitious pickups, payment diversion and straight theft), what the public data says about them, the controls at onboarding, at tender, at pickup and at payment, and the records that let a broker detect, stop and later prove what happened. It extends `carriers`, `tenders` and `freight_invoices` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model).

Vetting is [Carrier Onboarding & Vetting](/books/logistics/carrier-onboarding); the contract terms that make re-brokering a breach are in [The Broker-Carrier Agreement](/books/logistics/freight-brokerage#the-broker-carrier-agreement); bank-detail change controls belong to [Stopping the Changed Bank Account](/books/payments/vendor-payouts#stopping-the-changed-bank-account); notices of assignment and factors as payees are Paying Carriers, Quick Pay & Factoring; cargo claims after a theft are [Cargo Liability & Claims](/books/logistics/cargo-claims); the registry and Motus are [Operating Authority & Registration](/books/logistics/operating-authority); and the general case of consumer and business scams is in [Account Takeover & Scams](/books/banking-and-lending/account-takeover-and-scams#how-the-platforms-do-it).

## How the Platforms Do It

As of November 2026, from vendor pages, press releases and FMCSA's notice:

| Platform or actor | Where it acts | What it does, in its own words |
| --- | --- | --- |
| **Carrier Assure** | Carrier vetting | Flags "indicators of double brokering, poor visibility, and instability"; publishes SuspectCarrier and SuspectBroker reports |
| **FMCSA (Motus)** | Registration | Identity document capture and face scan through IDEMIA since April 2025, and business verification through CLEAR since September 2025; FMCSA reports "a significant increase in the occurrence of presumed fraudulent activity," some "perpetrated by foreign actors" |
| **Highway** | Carrier identity, tender and pickup | Verifies identity, authority and insurance before award; Load Lock; Secure Rate Con Delivery; Know Your Driver confirms "that the person arriving for pickup is the authorized driver" and flags "cross-network overlap before freight changes hands" |
| **MyCarrierPortal (Descartes)** | Carrier onboarding and monitoring | Acquired, per Descartes, to help brokers and shippers address carrier fraud and cargo theft |
| **RMIS (Truckstop)** | Onboarding and monitoring, with Carrier Assure scores | Carrier Assure's data in RMIS is meant to "help identify risk factors for double brokering, cargo theft and other nefarious activities," per the 2023 partnership announcement |
| **Verisk CargoNet** | Theft reporting and recovery | Has "collected and analyzed reported cargo theft incidents across the U.S. and Canada since 2010"; quarterly analyses |

The patterns:

- **Identity is the product.** Every vendor in the table sells some form of "is this the carrier it says it is": at registration (FMCSA), at onboarding (the vetting platforms), and at pickup (driver verification). The registry alone answers a different question.
- **Network data beats single-broker data.** A phone number, email domain, device or truck seen across many carriers is visible only to someone who sees many brokers' onboarding. That's what "cross-network overlap" and "indicators of double brokering" mean.
- **Controls move to the edge of the transfer.** Securing the rate confirmation's delivery, locking the load to the vetted carrier and verifying the driver at the dock put the check at the moment freight or money changes hands, not only at onboarding.

## The Numbers

Public data on freight fraud is thin and mostly from one source. Verisk CargoNet's third-quarter 2026 analysis, released November 4, 2026:

- **Incidents:** 547 in the quarter, "down 33 percent year over year and 19 percent from the previous quarter"; 2,072 through September against 2,755 a year earlier (down 25%).
- **Losses:** $230.1 million in the quarter (up 12% from $205.1 million) and $718.9 million through September (up 39%). Through September, the average value of incidents with a documented value rose "approximately 72 percent, from $261,115 to $448,456."
- **Fictitious pickups:** 138 incidents against 147 a year earlier, "raising their share of reported activity from 18 percent to approximately 25 percent."
- **High-value targeting:** 19 thefts with documented values of $1 million or more, against nine in the third quarter of 2025, "many involving high-value electronics and data center materials."
- **Commodities:** food and beverage led with 94 incidents (down from 178); metals second with 63, copper 34 of them; cosmetics thefts up from nine to 14.
- **Places:** California, Illinois, New Jersey and Texas were 57% of incidents, with California about a third (182).
- **Methods:** earlier in 2026, CargoNet documented "compromised business email accounts, internet-based phone systems and transportation industry applications" used "to impersonate legitimate companies, obtain shipment information or redirect freight."

For the full year 2025 Verisk estimated losses of $725 million. Its figures cover reported incidents, are filtered by report date, and are revised as late reports arrive, so a quarter's numbers change after publication.

What no public source counts: double-brokered loads, carrier identity takeovers, or payments diverted to fraudulent accounts. Brokers, vetting vendors and factors each see their own, and there is no published industry total. <!-- source-gap: logistics-freight-fraud-double-brokering-volume | missing | no public count or loss estimate for double brokering, carrier identity theft or freight payment diversion | closes with: a published FMCSA, TIA or vendor dataset with method and period | checked: 2026-11-22 -->

## The Schemes

**Carrier identity theft.** The criminal poses as a real, established carrier: one with years of authority, clean safety data and insurance on file, because that's what passes vetting. The forms vary: a lookalike email domain and a new phone number put on the carrier's FMCSA record through a compromised registry account (the gap Motus's identity proofing is meant to close, [Motus and the Rules in Flux](/books/logistics/operating-authority#motus-and-the-rules-in-flux)); a dormant carrier's account taken over; or a carrier's packet copied from a broker portal. The tell is change: contacts that don't match those the broker verified, a registry contact or address updated days before the carrier asks for loads, a carrier that hauled reefer in Ohio suddenly bidding high-value van freight out of Southern California.

**Double brokering.** A carrier, or someone posing as one, accepts a load and re-tenders it to a second carrier without the broker's consent, often under the first carrier's name and paperwork. The second carrier hauls it, the first invoices the broker (or sells the invoice to a factor), and the second is never paid; it then claims against the broker, the shipper, or the cargo. The term is the industry's, not the statute's. It breaches the broker-carrier agreement ("shall not re-broker, co-broker, subcontract, assign, interline, or transfer the transportation," in Flock Freight's; "forfeiture of payment," in Arrive's), and a carrier that brokers without broker registration and financial security is brokering unlawfully: whoever knowingly permits it owes civil penalties and every valid claim of the injured parties, jointly and severally with the entity's "individual officers, directors, and principals" (49 U.S.C. 14916). The broker usually learns of it when the real hauler calls asking to be paid, or when tracking shows a truck the broker never saw.

**Fictitious pickups.** The freight is the target. A criminal books the load (often after identity theft), sends a driver and truck that look right, signs the bill of lading and drives away; the shipper believes it released freight to the broker's carrier. A variant works from the shipper side: an email that appears to come from the broker changes the pickup carrier at the last minute.

**Payment diversion.** The freight moves correctly and the money goes wrong: an email from the carrier's "accounting" changes the remit-to and bank account; a forged notice of assignment names a factor the carrier never used; or a real factor's notice is ignored, the broker pays the carrier directly, and it still owes the factor, paying the same invoice twice ([How the Money Splits](/books/logistics/logistics-business#how-the-money-splits) explains why a notice moves the obligation, under UCC 9-406). The defenses are the payee controls in Payments ([Stopping the Changed Bank Account](/books/payments/vendor-payouts#stopping-the-changed-bank-account)) applied to carriers and factors.

**Straight and strategic theft.** Trailers stolen from yards, truck stops and drop lots, and organized crews that target specific commodities, lanes and times (holidays, weekends, when facilities are closed). CargoNet's quarter shows food and beverage and metals as perennial targets and electronics and data center materials at the top of the high-value list.

## Controls

Every control below is a step in a workflow that already exists; the work is to put the check where the transfer happens and to keep its evidence.

**At onboarding** ([Carrier Onboarding & Vetting](/books/logistics/carrier-onboarding)):

- Verify contacts against the registry and through a callback to a number the broker didn't get from the applicant, and treat a registry contact changed in the last weeks as a reason for review.
- Check the applicant's phone, email domain, devices and bank against every other carrier the broker (or its vendor's network) has seen.
- Restrict new or newly changed carriers: no high-value or theft-target freight, tracking required, payment held until delivery is confirmed by the consignee.

**At tender and booking:**

- Send the rate confirmation only to a verified contact, through a channel that proves who opened it, and treat a request to change the contact on a booked load as a change of carrier.
- Require tracking for the freight that's targeted, from an ELD integration or an app tied to the carrier's own account, and match the tracked vehicle to the carrier's registered equipment where the data allows.
- Flag the patterns of re-brokering: a carrier accepting more loads than its fleet, a truck seen in tracking that belongs to another carrier, a pickup location ping from the wrong state.

**At pickup:**

- Give the shipper the expected carrier name, USDOT number, driver name, tractor and trailer numbers before the truck arrives, and a way to check them at the gate; a pickup number alone is a password the criminal has.
- Verify the driver against what the carrier sent (Highway's Know Your Driver is one product of this; a shipper's gate check against a pre-shared list is another), and record the result.
- Hold release on any mismatch until the broker confirms by phone with the carrier's verified contact.

**At payment:**

- Change payee details only out of band, through the verified contact, with a hold on the first payment to new details.
- Verify every notice of assignment with the factor directly, through a contact the broker has for that factor, and apply it from the date verified.
- Pay only after proof of delivery from the consignee's side, where the freight is targeted, not only a POD image from the carrier.

**When it happens:**

- Stop the load: tell the shipper and consignee, block the carrier, freeze payment, and preserve tracking, documents and messages.
- Report: to law enforcement, to the shipper's and broker's insurers, to CargoNet or the vetting vendor's network, and to FMCSA where the carrier's registration was hijacked.
- Pay the real hauler or not, by policy and contract: a double-brokered load leaves the broker with a carrier it never contracted and a claim it may still face.

## How to Build It

The deltas add verification state to tenders and invoices, a pickup verification record, signals and cases:

```sql
ALTER TABLE tenders
  ADD COLUMN delivered_to_contact_id UUID REFERENCES carrier_contacts (id),  -- where the offer and rate con went
  ADD COLUMN tracking_required       BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN risk_tier               TEXT;  -- 'standard', 'elevated', 'high'
ALTER TABLE tenders ADD CONSTRAINT tenders_risk_tier_check
  CHECK (risk_tier IN ('standard', 'elevated', 'high')) NOT VALID;

ALTER TABLE freight_invoices
  ADD COLUMN payee_verified_at  TIMESTAMPTZ,  -- the payee on this invoice was confirmed out of band
  ADD COLUMN payment_hold       TEXT;  -- why payment waits, while it waits
ALTER TABLE freight_invoices ADD CONSTRAINT freight_invoices_payment_hold_check
  CHECK (payment_hold IN ('new_payee', 'fraud_case', 'delivery_unconfirmed',
    'notice_unverified', 'conflicting_notices')) NOT VALID;

ALTER TABLE carriers
  ADD COLUMN fraud_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE carriers ADD CONSTRAINT carriers_fraud_status_check
  CHECK (fraud_status IN ('none', 'watch', 'suspected_impersonation',
    'confirmed_impersonation', 'confirmed_fraud')) NOT VALID;

CREATE TABLE pickup_verifications (         -- who actually took the freight
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  stop_id            UUID NOT NULL REFERENCES stops (id),
  load_id            UUID NOT NULL REFERENCES loads (id),
  expected           JSONB NOT NULL,     -- carrier, USDOT, driver, tractor, trailer as sent ahead
  observed           JSONB NOT NULL,     -- as checked at the gate or by the driver app
  method             TEXT NOT NULL CHECK (method IN ('gate_check', 'driver_app_identity',
                       'vendor', 'phone_callback', 'none')),
  vendor             TEXT,
  outcome            TEXT NOT NULL CHECK (outcome IN ('matched', 'mismatch_released',
                       'mismatch_held', 'refused')),
  released_by        TEXT,               -- the shipper's gate or dock user, as recorded
  position           GEOGRAPHY(Point, 4326),
  occurred_at        TIMESTAMPTZ NOT NULL,
  received_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  evidence_ids       UUID[] NOT NULL DEFAULT '{}',  -- photos, signed BOL, app check
  CHECK (outcome <> 'mismatch_released' OR released_by IS NOT NULL)
);

CREATE TABLE fraud_signals (                -- one observation that may mean fraud
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id     UUID NOT NULL REFERENCES parties (id),
  carrier_party_id   UUID REFERENCES parties (id),
  load_id            UUID REFERENCES loads (id),
  kind               TEXT NOT NULL CHECK (kind IN ('registry_contact_changed',
                       'contact_shared_with_other_carrier', 'unverified_contact_request',
                       'rate_con_forwarded', 'tracking_vehicle_mismatch', 'tracking_off_route',
                       'pickup_mismatch', 'capacity_exceeds_fleet', 'payee_change_request',
                       'notice_unverified', 'third_party_payment_claim', 'network_flag')),
  source             TEXT NOT NULL,      -- 'rule', a vendor, or the reporting user
  detail             JSONB NOT NULL,
  observed_at        TIMESTAMPTZ NOT NULL,
  received_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  case_id            UUID                -- set when grouped into a case; FK added below
);
CREATE INDEX ON fraud_signals (carrier_party_id, observed_at);

CREATE TABLE fraud_cases (                  -- an investigation, from suspicion to outcome
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id     UUID NOT NULL REFERENCES parties (id),
  scheme             TEXT CHECK (scheme IN ('identity_theft', 'double_brokering',
                       'fictitious_pickup', 'payment_diversion', 'theft', 'other')),
  status             TEXT NOT NULL CHECK (status IN ('open', 'contained', 'confirmed',
                       'cleared', 'closed')),
  load_ids           UUID[] NOT NULL DEFAULT '{}',
  carrier_party_ids  UUID[] NOT NULL DEFAULT '{}',  -- the impersonated and the impersonator
  cargo_value        BIGINT CHECK (cargo_value >= 0),
  currency           CHAR(3),
  reported_to        JSONB NOT NULL DEFAULT '[]',  -- [{"to": "police", "ref": "...", "at": "..."}]
  opened_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at          TIMESTAMPTZ,
  outcome_note       TEXT,
  CHECK (status NOT IN ('cleared', 'closed') OR outcome_note IS NOT NULL)
);
ALTER TABLE fraud_signals ADD CONSTRAINT fraud_signals_case_id_fkey
  FOREIGN KEY (case_id) REFERENCES fraud_cases (id);
```

Two queries the controls depend on. Contacts shared across carriers, the strongest single impersonation signal:

```sql
SELECT cc.value, array_agg(DISTINCT cc.carrier_party_id) AS carriers
FROM carrier_contacts cc
WHERE cc.owner_party_id = $1
  AND cc.valid_during @> NOW()
  AND cc.channel IN ('phone', 'email')
GROUP BY cc.value
HAVING count(DISTINCT cc.carrier_party_id) > 1;
```

And loads at risk now: targeted freight, booked with a carrier whose contacts or registry record changed recently, picking up in the next day:

```sql
SELECT l.id, l.number, l.carrier_party_id, s.appointment
FROM loads l
JOIN stops s ON s.load_id = l.id AND s.kind = 'pickup'
JOIN carriers c ON c.party_id = l.carrier_party_id
JOIN tenders t ON t.load_id = l.id AND t.status = 'accepted'
WHERE l.owner_party_id = $1
  AND l.status = 'covered'
  AND lower(s.appointment) < NOW() + INTERVAL '24 hours'
  AND t.risk_tier IN ('elevated', 'high')
  AND (c.registry_contact_changed_at > NOW() - INTERVAL '30 days'
       OR c.fraud_status <> 'none');
```

Pickup verification is the control with a deadline, because the truck is at the gate. The check compares what was sent ahead with what arrived, and only a matched result or a named person's release lets the freight go:

```go tab="Go"
type PickupCheck struct {
	StopID   uuid.UUID
	Expected Party // carrier, USDOT, driver, tractor, trailer
	Observed Party
	Method   string
}

func (s *Service) VerifyPickup(ctx context.Context, c PickupCheck) (Outcome, error) {
	mismatches := c.Expected.Diff(c.Observed) // fields that differ, normalized
	outcome := OutcomeMatched
	if len(mismatches) > 0 {
		outcome = OutcomeMismatchHeld // release needs a callback to the verified contact
	}
	err := s.tx(ctx, func(q *Queries) error {
		if err := q.InsertPickupVerification(ctx, c, outcome); err != nil {
			return err
		}
		if outcome == OutcomeMismatchHeld {
			if err := q.InsertFraudSignal(ctx, "pickup_mismatch", c.StopID, mismatches); err != nil {
				return err
			}
			return q.EnqueueOutbox(ctx, "pickup.held", c.StopID, mismatches)
		}
		return nil
	})
	return outcome, err
}
```

```rust tab="Rust"
pub struct PickupCheck {
    pub stop_id: Uuid,
    pub expected: Party, // carrier, USDOT, driver, tractor, trailer
    pub observed: Party,
    pub method: Method,
}

pub async fn verify_pickup(svc: &Service, c: PickupCheck) -> Result<Outcome, sqlx::Error> {
    let mismatches = c.expected.diff(&c.observed); // fields that differ, normalized
    let outcome = if mismatches.is_empty() {
        Outcome::Matched
    } else {
        Outcome::MismatchHeld // release needs a callback to the verified contact
    };
    let mut tx = svc.pool.begin().await?;
    insert_pickup_verification(&mut tx, &c, outcome).await?;
    if outcome == Outcome::MismatchHeld {
        insert_fraud_signal(&mut tx, "pickup_mismatch", c.stop_id, &mismatches).await?;
        enqueue_outbox(&mut tx, "pickup.held", c.stop_id, &mismatches).await?;
    }
    tx.commit().await?;
    Ok(outcome)
}
```

Design notes:

- **Signals are observations; cases are decisions.** A shared phone number or an off-route ping is a signal with a source and a time; a person groups signals into a case and decides. Blocking a carrier on one unreviewed signal punishes the real carrier whose identity was stolen ([Scores, Bands and the Human Middle](/docs/building-blocks/risk-scoring#scores-bands-and-the-human-middle)).
- **The impersonated carrier is a victim.** A case names both the carrier whose identity was used and the party that used it, and the real carrier's qualification is restored once its contacts are re-verified; `carriers.fraud_status` distinguishes "someone is pretending to be this carrier" from "this carrier is the fraud."
- **Expected values are sent before the event.** A pickup check is only as good as the data the shipper had before the truck arrived; the `expected` snapshot is what was sent, with when and to whom.
- **Payment holds are reasons, not flags.** Each hold names why, so finance can release them in bulk when the reason clears (a verified notice, a confirmed delivery) and the carrier hears the real reason.
- **Keep the evidence untouched.** Messages, tracking pings, BOL images and confirmations in a case are evidence for police, insurers and a later lawsuit; they are kept as exchanged, with hashes, and a case freezes them against retention rules ([Make It Tamper-Evident](/docs/building-blocks/audit-trails#make-it-tamper-evident)).

## Auditing

- **Every pickup verification,** with what was expected, what was observed, who released the freight and how.
- **Every rate confirmation delivery,** to which verified contact and through which channel.
- **Every payee change and notice of assignment,** with how it was verified, by whom and when the first payment to it was released.
- **Every signal and case,** with its sources, the actions taken (blocked carrier, held payment, notified shipper) and the reports made with their reference numbers.
- **What the registry showed** when the carrier was approved and when the load was booked, from the `carrier_registration_checks` rows ([Operating Authority & Registration](/books/logistics/operating-authority#how-to-build-it)) that onboarding and tendering write.

The mechanics are in [Audit Trails](/docs/building-blocks/audit-trails).

## What This Means for the System You Build

- **Treat identity as a fact with evidence,** separate from the registry record, and re-verify it whenever contacts change.
- **Send confirmations, pickup details and payments only to verified contacts and payees,** and treat a request to change any of them as a fraud signal until proven otherwise.
- **Put a check where freight or money changes hands:** expected carrier, driver and equipment shared before pickup, a recorded match at the gate, a verified payee before the first payment.
- **Look across carriers,** for shared phones, emails, devices, trucks and bank accounts.
- **Separate signals from cases** and keep the impersonated carrier distinct from the impersonator.
- **Restrict the freight criminals target** to carriers with history, tracking and verified contacts.
- **Preserve evidence as exchanged** and record every report made.

## References

**Data**

- [Verisk: Fewer cargo thefts, bigger losses, Q3 2026 (November 4, 2026)](https://s29.q4cdn.com/767340216/files/doc_news/Fewer-Cargo-Thefts-Bigger-Losses-Average-Theft-Value-Jumps-72-Percent-Year-to-Date-2026.pdf), incidents, losses, fictitious pickups, million-dollar thefts, commodities, states, methods and methodology
- [Verisk: Cargo theft losses surge to an estimated $725 million in 2025](https://www.verisk.com/company/newsroom/cargo-theft-losses-surge-to-estimated-$725-million-in-2025-verisk-cargonet-analysis-reveals/), the 2025 loss estimate

**Statutes and FMCSA**

- [49 U.S.C. 14916: Unlawful brokerage activities](https://www.law.cornell.edu/uscode/text/49/14916), brokering without registration and security, and personal liability
- [Federal Register: Availability of Motus, FMCSA's new registration system (April 29, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-04-29/html/2026-08334.htm), identity verification through IDEMIA and CLEAR and FMCSA's statement on fraudulent activity
- [UCC 9-406: Discharge of account debtor](https://www.law.cornell.edu/ucc/9/9-406), payment after a notice of assignment

**Vendors**

- [Highway](https://highway.com/), identity and authority verification, Load Lock, Secure Rate Con Delivery and Know Your Driver
- [Carrier Assure](https://www.carrierassure.com/), double brokering indicators and suspect reports
- [Descartes: Descartes acquires MyCarrierPortal](https://www.descartes.com/resources/news/press-release-descartes-acquires-mycarrierportal), onboarding and monitoring against carrier fraud and cargo theft
- [Truckstop and Carrier Assure announce exclusive partnership (June 22, 2023)](https://prnewswire.com/news-releases/truckstop-and-carrier-assure-announce-exclusive-partnership-to-enhance-carrier-compliance-301857565.html), scores in RMIS aimed at double brokering and cargo theft

**Brokers**

- [Flock Freight: Broker-carrier agreement](https://www.flockfreight.com/resources/broker-carrier-agreement), the re-brokering prohibition
- [Arrive Logistics: Rate confirmation terms and conditions](https://www.arrivelogistics.com/temporary-rate-confirmation-terms-and-conditions/), forfeiture of payment for double brokering
