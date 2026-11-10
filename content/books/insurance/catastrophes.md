+++
title = "Catastrophe Events"
description = "PCS event designation and estimates, cat codes on claims, surge operations and emergency adjusters, insured cat loss figures, and emergency orders by state."
category = "Insurance Industry"
order = 2738
part = "Reserving, Catastrophe and Reinsurance"
tags = ["insurance", "catastrophe", "claims", "pcs", "property-and-casualty", "emergency-orders"]
+++

A catastrophe is a claims event measured in thousands of policies at once. On an ordinary day a homeowners carrier opens claims one at a time, each from an independent loss; after a hurricane, a hailstorm across a metro area or a wildfire, it opens tens of thousands in a week, all from one cause, in one region, all wanting an adjuster, an advance for living expenses and a decision on the same clocks. Everything about the event is correlated: the losses, the demand for contractors and adjusters, the reinsurance recoveries, the regulator's attention and the press. An insurer's year is often decided by two or three of them.

The system work is to treat the event as a first-class record. Every claim from the storm carries the same event code so it can be counted, staffed, reserved, reported to the industry estimator and billed to reinsurers together; the claim clocks change when the state declares an emergency; temporary adjusters get licenses and authority for weeks; and the event's loss estimate moves for a year or more after landfall. This chapter covers how industry events are designated and estimated (Verisk's PCS), cat codes on claims, surge operations, the insured loss figures by year and the trends behind them, and the emergency orders states issue. Models of events that haven't happened are Catastrophe Models & Their Regulators; how the losses flow to reinsurers is Reinsurance Structures and Reinsurance Operations.

## How the Platforms Do It

Three kinds of organizations define, count and estimate catastrophes, as of November 2026:

| Source | What it publishes | How it is used |
| --- | --- | --- |
| **Verisk Property Claim Services (PCS)** | US (and Canada, Mexico, Turkey, Japan, APAC) catastrophe designations with serial numbers, and industry insured loss and claim count estimates by state and line | Insurers code claims to PCS events; industry loss warranties and index-triggered cat bonds settle on PCS estimates |
| **Reinsurers' annual reviews** | Swiss Re Institute sigma and Munich Re NatCat figures: global insured and economic losses by year, by peril and by event | Benchmarks for trends, pricing and rating agency analysis |
| **Broker reports** | Aon and Gallagher Re annual catastrophe reports | The same, from the buyer's side; figures differ from reinsurers' by method and timing |
| **Regulators** | Emergency orders and bulletins (Florida OIR, California CDI, Texas TDI and others); the NAIC's catastrophe event lists for the RBC catastrophe charge | Extended claim clocks, moratoria on cancellation, temporary licensing, capital charges |
| **The insurer's own event codes** | An internal code per event, often mapped to the PCS serial number | Staffing, reserving, reinsurance recovery, statistical and regulatory reporting |

The figures differ between sources for real reasons: what counts as insured (NFIP flood, crop and state pools in or out), the date each source cut off, and whether the figure is nominal or inflation-adjusted. A system that reports a cat loss should store which source and as-of date it used.

## How an Event Becomes a Catastrophe

Verisk's PCS methodology paper sets the US rule: when PCS believes an event "is likely to cause more than US$25 million in damage in the United States and affect a significant number of policyholders and insurers," it assigns a catastrophe number and the event becomes a "PCS identified catastrophe." The thresholds elsewhere are C$25 million in Canada, TRY30 million in Turkey, US$2 billion in Japan, US$2.5 billion for the rest of APAC and MX$300 million in Mexico. An event affecting two countries has to meet each country's threshold to be designated in both, with cross-referencing serial numbers in each bulletin.

What PCS counts:

- **Included:** personal property, vehicle and commercial property policies, covering real property, contents, time element (business interruption and additional living expenses), vehicles, boats and property under certain inland marine and specialty policies, plus losses insured by state wind pools, joint underwriting associations and some other residual market mechanisms.
- **Excluded:** uninsured damage (including public property and utilities), agriculture, aircraft, ocean marine and offshore energy, and flood losses covered by the NFIP or its Write Your Own program, which PCS reports in a separate database fed by FEMA. Flood losses under ordinary policies (auto comprehensive, commercial property) are included.
- **Reinsurance is not counted** separately, "as it merely offsets covered cedent losses," and neither are collateralized reinsurance, industry loss warranties or cat bonds. Loss adjustment expense is estimated and published but kept out of the loss estimate.

PCS surveys primary insurers with business in the affected states, aiming for data from at least 70% of the market by premium in every affected state, and builds a 100% industry estimate per state from reported losses, carriers' catastrophe reserves, market shares and other sources. For US events of at least US$1 billion it publishes the market share it captured by class.

### The Estimate Timeline

The loss estimate is a series, not a number:

1. **Designation** on or after the event, with extension bulletins if the event continues.
2. **Preliminary estimate,** "approximately 15 days after the event designation or after the last extension bulletin," through the subscription ISOnet platform.
3. **Resurveys every 60 days** for events with preliminary estimates above US$250 million in the US.
4. **Close** when two consecutive resurveys produce the same estimate and carriers confirm they are no longer receiving claims; there is no set duration.

A worked timeline, mine: a hurricane makes landfall and is designated on September 10. The preliminary estimate comes around September 25. Above US$250 million, resurveys follow around November 24, January 23 and March 24; if the January and March figures match, March's becomes the final resurvey. An index-triggered cat bond or an industry loss warranty that references this event can't settle on the preliminary number; its terms name which PCS estimate (often a reported estimate at a stated date) determines the payout, and the system tracking the instrument has to record each PCS estimate with its date (Cat Bonds, ILS & State Cat Funds).

## Cat Codes on Claims

The core data model's `claims.cat_code` exists because an insurer counts, staffs and recovers by event. The rules a claims system needs:

- **Assign at first notice when the cause and date fit an open event.** A wind claim in the declared counties dated inside the event window is coded; triage rules propose the code and an adjuster confirms ([Rules as Data](/docs/building-blocks/rules-as-data#the-shape-of-a-rule)).
- **The event has a window and a footprint.** An event record carries start and end times, perils, states and counties, the PCS serial number once assigned, and its own internal code. A claim outside the window or footprint isn't coded to it, which matters when a reinsurance contract defines a loss occurrence as losses within a set number of hours (the hours clause) and an insurer must group claims into occurrences the way the treaty says.<!-- source-gap: hours-clause-durations | missing | the typical hours clause durations (windstorm, earthquake, riot) in property catastrophe treaty wordings | closes with: a public treaty wording or a regulator-published reinsurance contract with its loss occurrence clause | checked: 2026-11-10 -->
- **Recoding is a dated transaction.** A claim moved from one event to another (two storms a week apart) changes reserves and recoveries on both events, so the change is a new row with who and why, not an edit.
- **Coded claims carry the event's deductible.** A hurricane or named storm deductible applies only to losses from the defined event (Homeowners & Renters), so the cat code drives the deductible applied, the reserve, and later the statistical record.

## Surge Operations

An event changes the claims operation's shape for weeks:

- **Adjuster capacity.** Staff adjusters are supplemented by independent adjusting firms and temporary adjusters licensed for the emergency. Florida lets the Department of Financial Services license **catastrophe or emergency adjusters** "In the event of a catastrophe or emergency": residents or nonresidents, at least 18, designated and certified as qualified by an authorized insurer or by a licensed independent adjusting firm contracted with one, licensed "for the period of emergency as it shall determine" (Fla. Stat. 626.874). The system has to hold those temporary licenses with their end dates and stop assignments when they lapse.
- **Triage by severity and access.** Claims are segmented by estimated severity, total loss likelihood, habitability (who needs additional living expense now) and whether the area is reachable at all. PCS's own paper notes that access drives estimate timing: after Superstorm Sandy, adjusters couldn't reach heavily affected parts of New Jersey for weeks.
- **Fast-track payments.** Advances for living expenses, desk-adjusted small claims and imagery-based estimates reduce the queue for field adjusters; each still records the exposure, coverage and cost type of every payment.
- **Claim clocks shift.** Emergency extensions (below) move deadlines for every claim in the event, so diary dates are computed from rules that check for an active emergency on the claim's state and date.
- **Reserves move fast and in bulk.** Initial event reserves are often set by formula (claim count times an average severity by segment) and replaced by case reserves as inspections arrive, which is why event-level IBNR is tracked separately (Loss Reserving & Development).

## Insured Catastrophe Losses

The annual figures, as published by the two largest reinsurers' research arms:

| Measure | 2025 | Source |
| --- | --- | --- |
| Global insured natural catastrophe losses | US$107 billion | Swiss Re sigma, March 2026 |
| Same | US$108 billion (vs inflation-adjusted US$147 billion in 2024) | Munich Re, January 2026 |
| Global economic losses | US$220 billion, about 49% insured | Swiss Re |
| Same | US$224 billion (vs US$368 billion in 2024) | Munich Re |
| Severe convective storm insured losses | US$51 billion, the third costliest year after 2023 and 2024 | Swiss Re |
| Share from secondary perils (non-peak perils such as severe storms, wildfire and flood) | 92%, a record | Swiss Re |
| Palisades and Eaton fires (Los Angeles, January) | US$40 billion insured, the costliest event of 2025 | Swiss Re; Munich Re names it the costliest insured event |
| Flood insured losses | US$3.4 billion, against a US$15.4 billion five-year average | Swiss Re |

Swiss Re puts the long-term trend of insured losses at 5% to 7% a year in real terms, with wildfire the fastest-growing peril at about 12% a year, and estimated 2026 losses at US$148 billion if they return to trend. Munich Re notes the US "avoided hurricanes" in 2025 but remained first in loss statistics, with days-long thunderstorms across central and southern states in March the second costliest insured event.

Two readings matter for the system. First, the US loss is increasingly many medium events rather than one hurricane: severe convective storms (hail, tornado, straight-line wind) produce dozens of PCS events a year, each below most per-occurrence reinsurance retentions, which pushes insurers toward aggregate covers (Reinsurance Structures) and makes event coding and aggregation more important, not less. Second, the US Treasury's Federal Insurance Office reports that lower insured catastrophe losses in 2025, with lower auto severity, drove the P&C sector's sharp underwriting gain; a single year's event count moves industry results, so a cat load in pricing and a cat budget in planning are both computed from models rather than last year (Catastrophe Models & Their Regulators).

## Emergency Orders and Extended Clocks

States change the rules after a declared emergency, and the rules differ in what triggers them and what they change:

| State | Rule | Trigger | Effect |
| --- | --- | --- | --- |
| **Texas** | Tex. Ins. Code 542.059(b) | "a weather-related catastrophe or major natural disaster, as defined by the commissioner" | Every claim-handling deadline in the prompt payment subchapter is "extended for an additional 15 days" |
| **Florida** | Fla. Stat. 252.63 | The Governor declares a state of emergency | The Commissioner of Insurance Regulation may issue general orders for insurers serving the affected area, effective on issuance for 120 days, extendable once by 120 days, each published with how its "modification or suspension will facilitate recovery from the emergency" |
| **Florida** | Fla. Stat. 626.874 | A catastrophe or emergency | Temporary catastrophe adjuster licenses for the emergency period |
| **California** | Cal. Ins. Code 675.1(b) | A wildfire and a declared state of emergency | No cancellation or nonrenewal of residential property policies in ZIP codes within or adjacent to the fire perimeter "for one year after the declaration of a state of emergency," when based solely on the wildfire location; the commissioner publishes the ZIP codes by bulletin |
| **California** | Cal. Ins. Code 675.1(a) | A total loss to the primary insured structure from a disaster | Renewal offered for at least two annual renewal periods and "no less than 24 months of coverage from the date of the loss" |

A worked deadline, mine, under Texas law: a homeowner reports hail damage on October 1, during a weather-related catastrophe the commissioner has defined. Section 542.055 requires the insurer, "Not later than the 15th day" after notice, to acknowledge the claim, begin the investigation and request the items it needs; 542.059(b) adds 15 days. The acknowledgment task is due October 31 instead of October 16. The diary rule is the base rule plus a conditional extension keyed on an emergency record for the state and date, and the task stores both citations ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)). Claim Handling Law & Clocks has the base deadlines.

Moratoria reach the policy system, not just claims: a California ZIP code list from a commissioner bulletin becomes a block on nonrenewal and cancellation transactions for policies in force at the declaration, for one year, with the statute's exceptions (Cancellation, Nonrenewal & Notice Law).

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `claims.cat_code` and `claim_tasks.rule_ref` exist. This chapter adds `cat_events` (the event, mapped to PCS), `cat_event_estimates` (each industry estimate as published), `cat_claim_codings` (the history of a claim's event assignment) and `emergency_declarations` (the trigger for extended clocks and moratoria).

```sql
CREATE TABLE cat_events (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  internal_code      TEXT NOT NULL UNIQUE,  -- 'CAT-2026-014'
  pcs_serial         TEXT UNIQUE,           -- once PCS designates
  name               TEXT NOT NULL,
  perils             TEXT[] NOT NULL,       -- '{wind,hail}', '{wildfire}', ...
  starts_at          TIMESTAMPTZ NOT NULL,
  ends_at            TIMESTAMPTZ,           -- extended by bulletins
  states             TEXT[] NOT NULL,
  counties           TEXT[],                -- FIPS codes of the footprint
  deductible_trigger TEXT CHECK (deductible_trigger IN ('hurricane', 'named_storm',
                       'windstorm_hail', 'earthquake', 'none')),
  status             TEXT NOT NULL CHECK (status IN ('open', 'closed'))
);

CREATE TABLE cat_event_estimates (         -- industry and own estimates over time
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  cat_event_id       UUID NOT NULL REFERENCES cat_events (id),
  source             TEXT NOT NULL CHECK (source IN ('pcs', 'own', 'model', 'broker')),
  kind               TEXT NOT NULL,         -- 'preliminary', 'resurvey', 'final'
  published_on       DATE NOT NULL,
  insured_loss       BIGINT NOT NULL,       -- minor units
  claim_count        INT,
  by_state           JSONB,                 -- {"US-FL": ..., "US-GA": ...}
  UNIQUE (cat_event_id, source, kind, published_on)
);

CREATE TABLE cat_claim_codings (           -- a claim's event, as a history
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  claim_id           UUID NOT NULL REFERENCES claims (id),
  cat_event_id       UUID REFERENCES cat_events (id),  -- null: removed from events
  proposed_by        TEXT NOT NULL CHECK (proposed_by IN ('rule', 'adjuster')),
  reason             TEXT NOT NULL,
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by        UUID NOT NULL
);

CREATE TABLE emergency_declarations (      -- what changes the clocks and the rules
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  state              TEXT NOT NULL,
  kind               TEXT NOT NULL CHECK (kind IN ('governor_emergency',
                       'commissioner_catastrophe', 'commissioner_order',
                       'moratorium_bulletin')),
  authority_ref      TEXT NOT NULL,         -- 'TX 542.059(b)', 'FL 252.63', 'CA 675.1(b)'
  document_ref       TEXT,                  -- order or bulletin number
  effective          DATERANGE NOT NULL,    -- 120 days in FL; 1 year in CA 675.1(b)
  zip_codes          TEXT[],                -- moratorium scope, when listed
  counties           TEXT[],
  cat_event_id       UUID REFERENCES cat_events (id)
);
```

`claims.cat_code` holds the current assignment for queries; the codings table is the history behind it. A diary rule checks for a declaration in the claim's state covering the notice date before computing the due date, and records both rules in `rule_ref`. Event-level reporting (claim counts, paid, case and IBNR by event) reads `cat_claim_codings` as of a date, so a recoding after a reinsurance submission shows up as a change rather than silently altering the submitted figures.

## Auditing

- **Every coded claim fits its event** (date in the window, location in the footprint, peril in the event's list) or carries a documented override.
- **Event totals tie out.** Paid, case and IBNR by event match the claims ledger and the amounts billed to cat reinsurers; recodings after a billing are listed with their effect.
- **Extended clocks have their trigger.** Every task due date using an emergency extension references a declaration record with its source document.
- **Moratoria held.** No cancellation or nonrenewal transaction processed for a policy in a moratorium ZIP code during the period without one of the statute's exceptions recorded.
- **Temporary adjusters were licensed** on every day they handled a claim.

## What This Means for the System You Build

- **Make the catastrophe event a record** with a window, footprint, perils and PCS serial, and code claims to it with a history.
- **Store industry estimates as dated series** from each source, never one overwritten figure.
- **Model emergency declarations as data** that diary rules and policy transaction rules read, with citations.
- **Group claims into occurrences the way each reinsurance contract defines them,** which may differ from the event code.
- **Track temporary adjuster licenses with end dates** and stop assignments when they lapse.
- **Report cat losses with their source, basis and as-of date,** because sources legitimately disagree.

## References

**Law and regulation**

- [Tex. Ins. Code 542.055](https://texas.public.law/statutes/tex._ins._code_section_542.055), acknowledgment, investigation and requests within 15 days of notice of a claim (30 business days for eligible surplus lines insurers)
- [Tex. Ins. Code 542.059](https://texas.public.law/statutes/tex._ins._code_section_542.059), the 15-day extension of claim-handling deadlines after a weather-related catastrophe or major natural disaster as defined by the commissioner
- [Fla. Stat. 252.63](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0200-0299/0252/Sections/0252.63.html), the Commissioner of Insurance Regulation's emergency orders: 120 days, one 120-day extension, publication and the statement of how the order facilitates recovery
- [Fla. Stat. 626.874](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0626/Sections/0626.874.html), catastrophe or emergency adjuster licenses and their qualifications and duration
- [Cal. Ins. Code 675.1 (FindLaw)](https://codes.findlaw.com/ca/insurance-code/ins-sect-675-1/), the one-year wildfire moratorium on cancellation and nonrenewal in and adjacent to the fire perimeter, and renewal for two periods and 24 months after a total loss

**NAIC**

- [NAIC: Catastrophe Risk (E) Subgroup](https://content.naic.org/cmte_e_cat_risk_sg.htm), the catastrophe event lists for the RBC catastrophe charge, built from events with insured losses above US$25 million in PCS, Munich Re or Swiss Re data

**Regulators and guidance**

- [US Treasury, Federal Insurance Office: Annual Report on the Insurance Industry, September 2026 (PDF)](https://home.treasury.gov/system/files/311/2026-FIO-AR.pdf), lower insured catastrophe losses and auto severity behind the 2025 P&C underwriting gain

**Standards**

- [Verisk: PCS Consolidated Methodology Paper (PDF)](https://www.verisk.com/siteassets/media/pcs/pcs-consolidated-methodology-paper.pdf), the US$25 million designation threshold and other countries' thresholds, included and excluded losses (NFIP and WYO flood excluded), the 70% survey target, the preliminary estimate at about 15 days, resurveys every 60 days above US$250 million, the two-matching-resurveys close and the Sandy access example

**In practice**

- [Claims Journal: Swiss Re sigma on 2025 natural catastrophe losses, March 24, 2026](https://amp.claimsjournal.com/news/national/2026/03/24/336448.htm), US$107 billion insured, secondary perils 92%, severe convective storms US$51 billion, the Los Angeles fires US$40 billion, flood, economic losses, the 5% to 7% trend, wildfire at about 12% and the 2026 estimate
- [Insurance Journal: Munich Re on 2025 natural catastrophe losses, January 13, 2026](https://amp.insurancejournal.com/news/international/2026/01/13/854041.htm), US$108 billion insured and US$224 billion overall, the 2024 comparisons, the Los Angeles wildfires and the March US thunderstorms
