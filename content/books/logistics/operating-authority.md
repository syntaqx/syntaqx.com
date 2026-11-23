+++
title = "Operating Authority & Registration"
nav_title = "Operating Authority"
description = "USDOT numbers, MC and FF dockets, Motus, the BOC-3, UCR, new entrants, biennial updates, suspension and revocation, and how to model a carrier's registration."
category = "Logistics & Supply Chain Industry"
order = 2820
part = "Carrier Regulation"
tags = ["logistics", "trucking", "fmcsa", "registration", "operating-authority", "compliance"]
+++

Before a truck can haul freight across a state line for pay, the company behind it needs two different things from the Federal Motor Carrier Safety Administration. A **USDOT number** says the company exists as a regulated entity: it is the identifier on every inspection, crash, audit and insurance filing, and every interstate motor carrier, private or for-hire, needs one. **Operating authority** says the company may sell transportation: a for-hire motor carrier is registered under 49 U.S.C. 13902 only if it is "willing and able to comply with" the safety, safety fitness and financial responsibility requirements, a broker under 13904 and a freight forwarder under 13903, and each grant has historically come with a docket number (MC for motor carriers and brokers, FF for forwarders, MX for Mexico-domiciled carriers). Around those two sit a process agent designation (the BOC-3), the insurance and bond filings in [Bonds & Insurance Minimums](/books/logistics/financial-security-and-insurance), an annual Unified Carrier Registration fee and a biennial update of the carrier's census data.

It's hard to build against for three reasons. The rules are in flux: the 2015 Unified Registration System rule was suspended in 2017, so several sections of the Code of Federal Regulations as printed are not the ones in force, and FMCSA replaced its registration software with **Motus** in 2025 and 2026 without yet changing the rules or eliminating MC numbers. The identifiers are reused and duplicated: a company can hold one USDOT number and several dockets, and a fraudster can present a real company's numbers. And the status changes without the carrier doing anything: an insurer files a cancellation, a civil penalty goes unpaid for 90 days, a biennial update is missed, and the registration that was active when a broker onboarded the carrier no longer is when the truck shows up. This chapter covers who needs what, Motus and the forms it still accepts, applying and the new entrant period, process agents, keeping registration current, suspension and revocation, and the records a broker, shipper or carrier keeps. Insurance and bonds are in [Bonds & Insurance Minimums](/books/logistics/financial-security-and-insurance), the new entrant safety audit and ratings in [Safety Ratings, CSA & Inspections](/books/logistics/safety-and-csa), and hazmat registration with PHMSA in [Hazardous Materials in Transport](/books/logistics/hazmat-in-transport).

## How the Regulators Do It

A motor carrier's federal and interstate registration is several records, filed with different bodies, on different clocks. As of November 2026, from the regulations, statutes and Federal Register notices:

| Record | Who keeps it | Who needs it | Form or channel | Clock |
| --- | --- | --- | --- | --- |
| **USDOT number** | FMCSA | Every motor carrier subject to the regulations, private and for-hire, plus brokers, forwarders, intermodal equipment providers and cargo tank manufacturers and repairers (the suspended 390.201 lists them; 390.19T is the filing rule in force) | MCS-150 (and 150B, 150C) in the legacy forms; Motus since its release | Before operations, then every 24 months (390.19T) |
| **Operating authority** | FMCSA | For-hire motor carriers of regulated freight, brokers, freight forwarders, and Mexico-domiciled and non-North America-domiciled carriers (13902 to 13904, 365.101) | OP-1 and its variants: OP-1(P), OP-1(FF), OP-1(MX), OP-1(NNA) | A $300 fee per application (360.3T); insurance and BOC-3 due within 20 days of the preliminary grant (365.109T) |
| **Process agents** | FMCSA | Every registrant: carriers for each state they operate in and traverse, brokers for each state with an office or where contracts are written (366.4T) | BOC-3, usually a blanket designation filed by a process agent company | Before authority is granted; on change |
| **Financial security** | FMCSA, filed by the insurer or surety | Carriers (public liability, and cargo for household goods), brokers and forwarders ($75,000 bond or trust) | BMC-91, 91X, 34, 82, 83, 84, 85 and their cancellations | Continuous; 30 days' notice to cancel ([Bonds & Insurance Minimums](/books/logistics/financial-security-and-insurance)) |
| **Unified Carrier Registration** | The UCR Plan, a state board under federal law | Interstate motor carriers, private and for-hire, brokers, forwarders and leasing companies | Annual registration, a fee by fleet bracket | Each registration year; new fees for 2027 effective October 1, 2026 |
| **Hazmat registration and permits** | PHMSA; FMCSA for safety permits | Carriers and shippers of hazmat above the thresholds | PHMSA registration; the hazmat safety permit | Yearly ([Hazardous Materials in Transport](/books/logistics/hazmat-in-transport)) |

Three patterns:

- **Two identifiers, two meanings.** The USDOT number identifies the company to safety enforcement; the docket number identifies a grant of authority. FMCSA's April 2026 Motus notice says the agency "will continue to identify all regulated entities by a USDOT Number as the unique identifier," and in the same paragraph that Motus's phase II "will not include ... the elimination of MC/FF numbers." A registration record needs both, and a company can have several dockets (a carrier docket and a broker docket) under one USDOT number.
- **The regulation in the book is not always the regulation in force.** The 2015 URS rule rewrote parts 360, 365, 366, 387 and 390, and when FMCSA suspended its later phases in January 2017 it restored the earlier text as temporary sections marked "T." Cornell's copies of 360.3, 365.109, 366.4, 387.313 and 390.19 carry suspension notes, and the operative text is the T section beside each (360.3T, 365.109T, 366.4T, 387.313T, 390.19T). 390.19 was amended and "again suspended indefinitely" in November 2023, and 390.201, which has no T sibling, was "suspended indefinitely, effective Nov. 17, 2023." Citing or encoding the wrong version is an easy mistake; this chapter cites the T sections where they apply.
- **Registration is a snapshot a counterparty keeps re-checking.** Every status in the table changes from outside the carrier's system: the insurer files a cancellation, FMCSA publishes a suspension in its Register, the UCR year turns over. A broker or shipper stores what it checked and when, not a boolean.

## Who Needs What

The split that decides everything is **for-hire versus private** and **interstate versus intrastate**:

- **A private carrier** hauls its own goods in its own trucks (a manufacturer's fleet, a grocery chain's DCs to its stores). Operating in interstate commerce, it needs a USDOT number and must comply with the safety regulations, but it needs no operating authority because it isn't selling transportation. It still carries the 387.9 minimums when it hauls hazmat, because that table's hazmat rows apply to "For-hire and Private" carriers.
- **A for-hire carrier** hauls other people's goods for pay. Interstate, it needs a USDOT number and operating authority unless the freight or operation is exempt from economic registration; the URS rule's list of registrants itself names "an exempt for-hire motor carrier, a non-exempt for-hire motor carrier" (390.201(b)(1), suspended, but the distinction stands). An exempt for-hire carrier still needs the USDOT number and the safety compliance.
- **A broker** arranges transportation by motor carrier for compensation (13102(2)) and needs broker authority and the $75,000 security. It needs a USDOT number but runs no trucks. A carrier that brokers loads it can't cover needs broker authority for those loads too; [How Freight Brokerage Works](/books/logistics/freight-brokerage) covers where the line sits.
- **A freight forwarder** assembles and consolidates shipments and takes responsibility from receipt to destination (13102(8)), needs forwarder authority (an FF docket) and the same $75,000 security (13906(c)(4)).
- **Intrastate carriers** are registered by their states, many of which require a USDOT number for intrastate commercial vehicles too; the federal rules here govern interstate commerce.

Whether a vehicle is a commercial motor vehicle at all (10,001 pounds and up, the passenger counts, placarded hazmat) is the 390.5 definition, explained for service fleets in [When a Service Van Is a Commercial Motor Vehicle](/books/field-operations/fleet-and-safety#when-a-service-van-is-a-commercial-motor-vehicle). A for-hire carrier running only vehicles under 10,001 pounds is still a motor carrier and still needs authority; its liability minimum differs (the 387.9 table has no general-freight row below 10,001 pounds), as [Bonds & Insurance Minimums](/books/logistics/financial-security-and-insurance) explains.

## Motus and the Rules in Flux

FMCSA's registration has run on four generations of systems and two generations of rules, and in November 2026 they overlap:

- **The 2015 URS rule** created a single online application (Form MCSA-1) to replace the MCS-150 and OP-1 family. Its first phase took effect December 12, 2015; the phases for existing registrants were suspended on January 17, 2017, which is why the T sections exist.
- **The FMCSA Portal and the legacy Licensing and Insurance systems** carried registration from then until 2026.
- **Motus**, announced in a Federal Register notice of April 29, 2026 (91 FR 23144, with a docket-number correction on May 6, 2026), replaces "URS as well as the FMCSA Portal." Phase I "was released on December 8, 2025" for a limited set of users; phase II, "planned for the second quarter of 2026," opens it "to all regulated entities." FMCSA's preparation notice to carriers asked company officials to update their FMCSA Portal accounts "by May 14, 2026" and warned that only the Portal company official using the same Login.gov email "will be permitted to claim an account in Motus for the first time." Trade press reported the launch to all users on that date; I found no FMCSA primary source for the launch itself that WebFetch could open. <!-- source-gap: logistics-operating-authority-motus-launch | secondary | Motus opened to all users and the legacy systems were retired on May 14, 2026 | closes with: an FMCSA page or Federal Register notice stating the phase II launch date, opened | checked: 2026-11-22 -->

What Motus changes is the channel and identity proofing; what it doesn't change is the rules. The notice is explicit that phase II "will not include the implementation of safety registration," "the elimination of MC/FF numbers, or changes to the Form BOC-3 filing process," and that FMCSA keeps accepting "OP-1, OP-1(P), OP-1(FF), OP-1(NNA), OP-1(MX), MCS-150, MCS-150B, MCS-150C, MCSA-5889, OCE-46, and BOC-3" until a regulatory change. That change was to come as a proposed rule expected in "Spring of 2026," requiring Motus for all registrants and eliminating the listed forms. As of November 22, 2026 no such proposal appears among FMCSA's Federal Register rules and proposed rules for 2026, so the paper-era forms, the MC and FF dockets and the T sections remain the law.

The identity layer is the part that matters to anyone vetting carriers. "In April 2025, the Agency partnered with IDEMIA to perform identity document capture and verification services": an applicant photographs a government-issued ID and takes "a photo of themself by scanning their face." "In September 2025, FMCSA partnered with CLEAR who will conduct the business verification services." About 800,000 existing registrants are verified when they first access Motus, and FMCSA tells new applicants to expect "a minimum timeframe of eight business days for the initial review and processing." The stated reason is fraud: FMCSA "has seen a significant increase in the occurrence of presumed fraudulent activity," some of which "may be perpetrated by foreign actors." Verification at registration narrows who can get a number; it doesn't stop someone presenting a real carrier's number on a load board, which is what [Freight Fraud & Cargo Theft](/books/logistics/freight-fraud) and [Carrier Onboarding & Vetting](/books/logistics/carrier-onboarding) deal with.

## The Docket Number Isn't Gone

Retiring MC and FF numbers in favor of the USDOT number alone is a change the Motus notice expressly leaves out of phase II. Until it happens, the docket number is what brokers' carrier packets ask for, what rate confirmations print, what insurers file against and what the FMCSA Register publishes grants and revocations under. C.H. Robinson's carrier requirements read "An active MC/MX# or DOT#," and its threshold for new carriers is that "Your MC authority must be active for at least 7 days." A system that keys carriers on the docket will break twice: once when a company with two dockets (carrier and broker) appears as one party, and again when new registrants stop receiving dockets. The core model already keys `carriers` on the party with `usdot_number` unique and `docket_number` a plain column ([The Core Data Model](/books/logistics/logistics-business#the-core-data-model)); the authorities themselves go in their own table below, one row per docket and kind.

## Applying: The Preliminary Grant and the New Entrant Period

An application for authority is reviewed, published and then completed by the applicant's filings. Under 365.109T, FMCSA staff review it "for correctness, completeness, and adequacy of the evidence," reject an applicant with an Unsatisfactory safety rating, and publish a summary "as a preliminary grant of authority in the FMCSA Register" so that the public has notice "in case anyone wishes to oppose the application." The applicant then has 20 days from that publication to have its insurer file evidence of financial responsibility and to file the BOC-3 ((a)(5) and (a)(6)). The fee is $300 per application for motor carrier, broker or forwarder authority (360.3T(f)(1)). Authority becomes effective only once both filings are in, so the state an onboarding system sees in the gap is "pending": a docket exists, the grant is published, and the carrier may not yet operate under it.

A new motor carrier then enters the **new entrant safety assurance program**: 18 months of safety monitoring (385.307) with a safety audit that the statute requires within 12 months of a property carrier beginning operations (49 U.S.C. 31144(g)), which [Safety Ratings, CSA & Inspections](/books/logistics/safety-and-csa#new-entrants) covers with its failure modes. The new entrant period is why brokers' carrier policies treat authority age as a risk factor; C.H. Robinson's seven days is a published floor, and [Carrier Onboarding & Vetting](/books/logistics/carrier-onboarding) compares others.

## Process Agents and the BOC-3

A process agent is the person in a state on whom court papers can be served for the carrier. Under 366.4T, "Every motor carrier (of property or passengers) shall make a designation for each State in which it is authorized to operate," and for each state traversed; brokers designate one "for each State in which its offices are located or in which contracts will be written." The designation is filed on Form BOC-3, which the regulation text doesn't name but the Motus notice lists among the forms FMCSA still accepts. Almost every small carrier uses a process agent company that files a blanket designation covering every state (366.5 provides for blanket designations); the system records the filing's date and the agent company, because a missing BOC-3 is one of the reasons an authority stays pending or is revoked.

## Keeping Registration Current

Three recurring obligations keep a registration alive:

- **The biennial update.** Every carrier files an updated MCS-150 "Every 24 months," on a schedule keyed to its USDOT number (390.19T(b)): the last digit sets the month (1 for January through 9 for September, 0 for October), and the next-to-last digit sets the year, odd digits in odd-numbered years and even digits in even years. A carrier that misses it is subject to penalties under 49 U.S.C. 521(b)(2)(B) "and deactivation of its USDOT Number" (390.19T(b)(4)). The schedule is computable, so the system computes it ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)). The suspended 390.19 carries the same digit schedule, so the schedule survives whichever version applies; I recheck it when the registration rulemaking lands.
- **Unified Carrier Registration.** Interstate carriers, brokers, forwarders and leasing companies register with the UCR Plan each year and pay a fee set by FMCSA rule. The final rule of September 1, 2026, effective October 1, sets the 2027 fees by the number of commercial motor vehicles owned or operated:

| Bracket | Vehicles | 2025 and 2026 | 2027 onward |
| --- | --- | --- | --- |
| B1 | 0-2 (and every broker and leasing company; forwarders pay by fleet size) | $46 | $55 |
| B2 | 3-5 | $138 | $167 |
| B3 | 6-20 | $276 | $333 |
| B4 | 21-100 | $963 | $1,163 |
| B5 | 101-1,000 | $4,592 | $5,548 |
| B6 | 1,001 and above | $44,836 | $54,165 |

- **Changes.** A change of name, address or form of business, a new docket kind, or a change in fleet size is an update filing; the fee table lists a name change at $14 (360.3T(f)(7)). A change of legal entity (a sole proprietor incorporating, an acquisition) usually needs new authority rather than an update, which is why an acquired carrier can appear under a new docket with the old one revoked.

Fuel tax (IFTA) and apportioned plates (IRP) are state-run interstate registrations that sit beside these; [Fuel, Tolls & Fuel Cards](/books/logistics/fuel-and-fuel-cards) covers them.

## Suspension, Revocation and Reinstatement

Registration ends or pauses in a handful of ways, and each arrives as a different event:

- **Insurance or bond cancelled.** Registration stays in effect only while the security requirements are met (13906(a)(1)), and the Secretary may suspend for failure to comply with 13906 (13905(f)). An insurer must give 30 days' notice on Form BMC-35 (policies) or BMC-36 (bonds), counted from the date FMCSA actually receives it (387.313T(d)). For a broker, a drawdown below $75,000 suspends authority within 7 business days of notice unless cured (387.307(e)). The cancellation notice is the earliest warning a counterparty can see, and it arrives roughly 30 days before the authority goes inactive.
- **Unpaid civil penalty.** A carrier that doesn't pay "within 90 days after the date specified for payment by FMCSA's final agency order" is "prohibited from operating in interstate commerce starting on the next (i.e., the 91st) day," until "the FMCSA has received full payment" (386.83). The statute separately allows withholding, suspending or revoking a registration for failure "to pay a civil penalty" (13905(d)(2)(B)).
- **Unsafe or unfit.** The Secretary "shall revoke the registration of a motor carrier that has been prohibited from operating" for failing the safety fitness requirements of 31144, and shall revoke on finding operations that are "an imminent hazard" (13905(f)); an Unsatisfactory rating's prohibition is in [Safety Ratings, CSA & Inspections](/books/logistics/safety-and-csa#safety-ratings-and-investigations).
- **Willful noncompliance.** On complaint or on its own initiative, after "notice and an opportunity for a proceeding," FMCSA may suspend, amend or revoke for "willful failure to comply" (13905(d)), and revocation by order follows when the registrant "willfully does not comply with the order for a period of 30 days" (13905(e)).
- **Biennial update missed.** The USDOT number is deactivated (390.19T(b)(4)), which isn't revocation of the docket but stops operation just the same.
- **Voluntary revocation.** A carrier that closes, or that moves its trucks under another carrier, asks FMCSA to revoke its authority on Form OCE-46 ("Request for Revocation of Authority Granted," in the Motus notice's list and the subject of FMCSA's 2026 information collection renewals).

Operating while inactive has an immediate consequence on the road: a vehicle providing transportation that requires authority "must not be operated" without it or beyond its scope, and the carrier "shall be ordered out of service" (392.9a), with review "not later than 10 days after issuance" of the order. Reinstatement of revoked authority is a petition with a fee of $80 (360.3T(f)(52)), and the insurance and process agent filings have to be current again first. For the system, reinstatement creates a new active period on the same authority row, not a new carrier; the history of gaps is itself a vetting signal.

## How to Build It

Registration facts extend the core `carriers` row and add per-docket authorities, filings and checks. The checks are the heart of it: a broker or shipper records every registry lookup as a row, so the question "was this carrier authorized when the load was tendered" has an answer later. Live-database `ALTER`s follow the pattern in [The Core Data Model](/books/logistics/logistics-business#the-core-data-model).

```sql
ALTER TABLE carriers
  ADD COLUMN entity_kinds     TEXT[] NOT NULL DEFAULT '{}',  -- as registered: carrier, broker, freight_forwarder
  ADD COLUMN operation_class  TEXT,          -- authorized_for_hire, exempt_for_hire, private, intrastate_only
  ADD COLUMN usdot_status     TEXT,          -- active, inactive, out_of_service, deactivated
  ADD COLUMN mcs150_filed_on  DATE,          -- the last biennial update FMCSA shows
  ADD COLUMN mcs150_due_on    DATE,          -- computed from the USDOT number (390.19T)
  ADD COLUMN power_units      INT;           -- as reported on the MCS-150
ALTER TABLE carriers ADD CONSTRAINT carriers_usdot_status_check
  CHECK (usdot_status IN ('active', 'inactive', 'out_of_service', 'deactivated')) NOT VALID;
ALTER TABLE carriers ADD CONSTRAINT carriers_operation_class_check
  CHECK (operation_class IN ('authorized_for_hire', 'exempt_for_hire', 'private',
         'intrastate_only')) NOT VALID;
ALTER TABLE carriers ADD CONSTRAINT carriers_power_units_check
  CHECK (power_units >= 0) NOT VALID;
ALTER TABLE carriers VALIDATE CONSTRAINT carriers_usdot_status_check;
ALTER TABLE carriers VALIDATE CONSTRAINT carriers_power_units_check;
ALTER TABLE carriers VALIDATE CONSTRAINT carriers_operation_class_check;

CREATE TABLE carrier_authorities (        -- one grant of authority: a docket and its kind
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_party_id UUID NOT NULL REFERENCES parties (id),
  docket_prefix    TEXT NOT NULL CHECK (docket_prefix IN ('MC', 'FF', 'MX')),
  docket_number    TEXT NOT NULL,         -- digits only; the prefix is its own column
  kind             TEXT NOT NULL CHECK (kind IN ('motor_carrier_property', 'motor_carrier_passenger',
                     'household_goods', 'broker_property', 'broker_household_goods',
                     'freight_forwarder', 'mexico_domiciled', 'non_north_america_domiciled')),
  common_or_contract TEXT CHECK (common_or_contract IN ('common', 'contract', 'both')),
  applied_on       DATE,
  preliminary_grant_on DATE,              -- published in the FMCSA Register; 20 days to file (365.109T)
  UNIQUE (docket_prefix, docket_number, kind)
);

CREATE TABLE carrier_authority_periods (  -- when an authority was in each status
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_authority_id UUID NOT NULL REFERENCES carrier_authorities (id),
  status              TEXT NOT NULL CHECK (status IN ('pending', 'active', 'suspended',
                        'revoked', 'inactive')),
  reason              TEXT CHECK (reason IN ('granted', 'insurance_cancelled', 'bond_drawdown',
                        'boc3_missing', 'unpaid_penalty', 'unsatisfactory_rating',
                        'imminent_hazard', 'voluntary', 'reinstated', 'other')),
  valid_during        TSTZRANGE NOT NULL,
  source_check_id     UUID,               -- the registry check that showed it
  EXCLUDE USING gist (carrier_authority_id WITH =, valid_during WITH &&)  -- needs btree_gist
);

CREATE TABLE process_agent_designations ( -- a BOC-3 on file
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_party_id UUID NOT NULL REFERENCES parties (id),
  agent_party_id   UUID REFERENCES parties (id),  -- the process agent company
  blanket          BOOLEAN NOT NULL DEFAULT TRUE,  -- a blanket designation of every state (366.5)
  subdivisions     TEXT[],                -- ISO 3166-2 codes when not blanket
  filed_on         DATE NOT NULL,
  superseded_on    DATE
);

CREATE TABLE ucr_registrations (          -- one registration year with the UCR Plan
  carrier_party_id  UUID NOT NULL REFERENCES parties (id),
  registration_year SMALLINT NOT NULL,
  bracket           TEXT NOT NULL CHECK (bracket IN ('B1', 'B2', 'B3', 'B4', 'B5', 'B6')),
  fee               BIGINT NOT NULL CHECK (fee >= 0),  -- minor units
  currency          CHAR(3) NOT NULL DEFAULT 'USD',
  paid_on           DATE,
  PRIMARY KEY (carrier_party_id, registration_year)
);

CREATE TABLE carrier_registration_checks ( -- every registry lookup, as returned
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_party_id   UUID NOT NULL REFERENCES parties (id),
  checked_by_party_id UUID NOT NULL REFERENCES parties (id),  -- the broker or shipper that looked
  purpose            TEXT NOT NULL CHECK (purpose IN ('onboarding', 'tender', 'pickup',
                       'monitoring', 'payment', 'manual')),
  source             TEXT NOT NULL,       -- the registry or vetting vendor queried
  usdot_number       TEXT NOT NULL,       -- as queried
  response           JSONB NOT NULL,      -- the full answer, kept as received
  usdot_status       TEXT,                -- parsed: the fields decisions read
  authority_active   BOOLEAN,
  insurance_on_file  BOOLEAN,
  pending_cancellation BOOLEAN,
  checked_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  load_id            UUID REFERENCES loads (id)  -- set when the check gated a tender
);
CREATE INDEX ON carrier_registration_checks (carrier_party_id, checked_at DESC);

ALTER TABLE carrier_authority_periods ADD CONSTRAINT carrier_authority_periods_source_check_fkey
  FOREIGN KEY (source_check_id) REFERENCES carrier_registration_checks (id);
```

The biennial due date is a function of the USDOT number, the last filing and the schedule, computed once and stored on the row so a monitoring job can index it:

```sql
CREATE FUNCTION mcs150_due_on(usdot TEXT, last_filed DATE) RETURNS DATE
LANGUAGE sql IMMUTABLE AS $$
  -- 390.19T(b): last digit picks the month (0 = October), next-to-last digit's parity the year
  WITH d AS (
    SELECT CASE right(usdot, 1)::INT WHEN 0 THEN 10 ELSE right(usdot, 1)::INT END AS month,
           (substr(usdot, length(usdot) - 1, 1)::INT % 2) AS odd
  ), y AS (
    SELECT month, odd,
           extract(year FROM last_filed)::INT + 1 AS y1  -- the next year after the last filing
    FROM d
  )
  SELECT (make_date(CASE WHEN y1 % 2 = odd THEN y1 ELSE y1 + 1 END, month, 1)
          + INTERVAL '1 month' - INTERVAL '1 day')::DATE   -- the last day of that month
  FROM y
$$;
```

The tender gate reads the latest check, not the carrier row, and refuses a stale one; my default is a check no older than 24 hours at tender and a fresh one at pickup for a carrier new to the broker:

```sql
SELECT c.carrier_party_id,
       c.checked_at,
       c.authority_active,
       c.pending_cancellation
FROM carrier_registration_checks c
WHERE c.carrier_party_id = $1
ORDER BY c.checked_at DESC
LIMIT 1;
-- tender only when authority_active AND NOT pending_cancellation
-- AND checked_at > now() - interval '24 hours'; otherwise run a new check first
```

Design notes:

- **Store the answer, then parse it.** The registry's response changes shape (Motus, vendor APIs, the legacy lookups), so `response` keeps it whole and the parsed columns are what rules read ([Mapping Their Schema to Yours](/docs/building-blocks/integrations#mapping-their-schema-to-yours)).
- **Authority status is a period, not a field.** `carrier_authority_periods` uses an exclusion constraint so periods never overlap, and an as-of query answers "active on the pickup date" ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).
- **A docket is not a key.** It can be revoked and a company reinstated under it, a company can hold several, and new registrants may stop receiving them; the party is the key, the docket a unique identifier within its prefix and kind.
- **Emit the changes.** `carrier.authority_suspended`, `carrier.insurance_cancellation_pending` and `carrier.usdot_deactivated` are what tendering, dispatch and payment subscribe to, so an open tender or an unpaid invoice to a carrier that just lost authority is flagged the same day ([The Transactional Outbox](/docs/architecture/events#the-transactional-outbox)).

## Auditing

- **What the registry said, when, and to whom.** Every check with its full response, purpose and the load it gated: a negligent selection claim, a cargo claim and a fraud investigation all ask whether the carrier was authorized and insured when it was chosen.
- **Every authority period with its reason,** including suspensions and reinstatements, kept for the life of the relationship plus the claim window.
- **The filings the carrier made or relied on:** BOC-3 date and agent, UCR years and fees, MCS-150 dates, and for a carrier's own compliance team the confirmation numbers and copies of each filing.
- **Overrides.** Any tender made against a failed or stale check, with who approved it and why ([Audit Trails](/docs/building-blocks/audit-trails)).

## What This Means for the System You Build

- **Key carriers on the party and keep the USDOT number unique,** with dockets in their own table, one row per prefix, number and kind.
- **Model authority as effective-dated periods with reasons,** so status on any past date is a query.
- **Record every registry check with its full response,** and gate tenders and pickups on a fresh one.
- **Compute the MCS-150 due date and track UCR years,** for your own fleet and as monitoring signals for carriers you use.
- **Treat insurance cancellation notices as the early warning** for an authority going inactive in about 30 days.
- **Encode the rules in force, not the rules printed:** the T sections, the forms Motus still accepts and MC numbers that still exist, and revisit when FMCSA's registration rulemaking is published.

## References

**Statutes**

- [49 U.S.C. 13102: Definitions](https://www.law.cornell.edu/uscode/text/49/13102), broker, freight forwarder and motor carrier
- [49 U.S.C. 13902: Registration of motor carriers](https://www.law.cornell.edu/uscode/text/49/13902), "willing and able to comply," withholding registration and out-of-service orders for unregistered operation
- [49 U.S.C. 13905: Effective periods of registration](https://www.law.cornell.edu/uscode/text/49/13905), amendment, suspension and revocation, unpaid penalties, the 30-day order and mandatory revocation for safety fitness and imminent hazards
- [49 U.S.C. 13906: Security of motor carriers, motor carrier brokers, and freight forwarders](https://www.law.cornell.edu/uscode/text/49/13906), registration only while security is filed and the forwarder's $75,000
- [49 U.S.C. 31144: Safety fitness of owners and operators](https://www.law.cornell.edu/uscode/text/49/31144), the new entrant safety review deadline

**Regulations**

- [49 CFR 360.3T: Filing fees](https://www.law.cornell.edu/cfr/text/49/360.3T), $300 per application for authority, $14 name change and $80 reinstatement
- [49 CFR 360.3: Filing fees (suspended URS version)](https://www.law.cornell.edu/cfr/text/49/360.3), the suspended schedule with a $300 USDOT registration fee
- [49 CFR 365.101: Applications governed by these rules](https://www.law.cornell.edu/cfr/text/49/365.101), the application types for carriers, brokers, forwarders and foreign-domiciled carriers
- [49 CFR 365.109T: FMCSA review of the application](https://www.law.cornell.edu/cfr/text/49/365.109T), review, rejection for an Unsatisfactory rating, the preliminary grant and 20 days for insurance and the BOC-3
- [49 CFR 365.109: FMCSA review of the application (suspended)](https://www.law.cornell.edu/cfr/text/49/365.109), the 2017 suspension note
- [49 CFR 366.4T: Required designations](https://www.law.cornell.edu/cfr/text/49/366.4T), process agents for carriers and brokers by state
- [49 CFR 386.83: Sanction for failure to pay civil penalties](https://www.law.cornell.edu/cfr/text/49/386.83), the 90-day deadline and the 91st-day prohibition
- [49 CFR 387.313T: Forms and procedures](https://www.law.cornell.edu/cfr/text/49/387.313T), BMC-35 and BMC-36 cancellations on 30 days' notice from FMCSA's actual receipt
- [49 CFR 387.313: Forms and procedures (suspended)](https://www.law.cornell.edu/cfr/text/49/387.313), the suspension note
- [49 CFR 387.307: Property broker surety bond or trust fund](https://www.law.cornell.edu/cfr/text/49/387.307), suspension within 7 business days of a drawdown notice
- [49 CFR 390.19T: Motor carrier identification report](https://www.law.cornell.edu/cfr/text/49/390.19T), the MCS-150 every 24 months, the digit schedule, penalties and deactivation
- [49 CFR 390.19: Motor carrier identification report (suspended)](https://www.law.cornell.edu/cfr/text/49/390.19), the 2017 and 2023 suspension notes and the same digit schedule
- [49 CFR 390.201: USDOT Registration](https://www.law.cornell.edu/cfr/text/49/390.201), who registers and the November 17, 2023 suspension
- [49 CFR 392.9a: Operating authority](https://www.law.cornell.edu/cfr/text/49/392.9a), operating without authority, out-of-service orders and 10-day review

**Federal Register**

- [Availability of Motus, FMCSA's New Registration System (April 29, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-04-29/html/2026-08334.htm), 91 FR 23144: phases, the USDOT number as unique identifier, what phase II excludes, accepted forms, IDEMIA and CLEAR verification, 800,000 registrants, eight business days, the expected rulemaking and fraud
- [Availability of Motus, correction (May 6, 2026)](https://www.federalregister.gov/api/v1/documents/2026-08819.json), 91 FR 24643, the docket-number correction
- [FMCSA rules and proposed rules, June 2025 to April 2026 (Federal Register API)](https://www.federalregister.gov/api/v1/documents.json?conditions%5Bagencies%5D%5B%5D=federal-motor-carrier-safety-administration&conditions%5Bpublication_date%5D%5Bgte%5D=2025-06-01&conditions%5Bpublication_date%5D%5Blte%5D=2026-04-30&conditions%5Btype%5D%5B%5D=RULE&conditions%5Btype%5D%5B%5D=PRORULE&per_page=100&fields%5B%5D=title&fields%5B%5D=document_number&fields%5B%5D=publication_date&fields%5B%5D=type), no registration rulemaking proposed
- [FMCSA documents, May to November 2026 (Federal Register API)](https://www.federalregister.gov/api/v1/documents.json?conditions%5Bagencies%5D%5B%5D=federal-motor-carrier-safety-administration&conditions%5Bpublication_date%5D%5Bgte%5D=2026-05-01&per_page=100&order=newest&fields%5B%5D=title&fields%5B%5D=document_number&fields%5B%5D=publication_date&fields%5B%5D=type), the Request for Revocation of Authority Granted collection and no registration proposal through November 20, 2026
- [Fees for the Unified Carrier Registration Plan and Agreement (September 1, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-09-01/html/2026-17893.htm), the 2027 brackets and fees, the 2025 and 2026 fees and the October 1, 2026 effective date

**Agencies**

- [FMCSA: Prepare for Motus, the USDOT Registration System (via IFTA, Inc.)](https://www.iftach.org/bulletins/FMCSA%20Motus%20Notice%20combined.pdf), the May 14, 2026 deadline for Portal actions and the Login.gov company official rule

**In practice**

- [C.H. Robinson: Carrier FAQ](https://www.chrobinson.com/en/Carriers/FAQ/), "An active MC/MX# or DOT#" and seven days of active authority before hauling
