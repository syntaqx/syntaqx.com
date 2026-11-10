+++
title = "Telematics & Usage-Based Insurance"
nav_title = "Telematics & UBI"
description = "Telematics programs, the pipeline from phone or car to a rating factor, pay-per-mile billing, California's device limit, consent, and the FTC's GM order."
category = "Insurance Industry"
order = 2722
part = "Rating and Underwriting"
tags = ["insurance", "telematics", "usage-based-insurance", "pay-per-mile", "personal-auto", "privacy"]
+++

Every other auto rating factor is a proxy for how someone drives: age, years licensed, a ticket from three years ago, a credit-based score. Telematics measures it. A phone app or a device in the car records trips, and the insurer turns hard braking, rapid acceleration, phone handling, speed, time of day and miles into a score that becomes a discount, sometimes a surcharge, or for pay-per-mile products, most of the bill. For a carrier the attraction is accuracy and self-selection (good drivers sign up). For a system it is the only rating input that is a continuous stream of sensor data about a person's location and behavior, which brings the problems of a data pipeline (noisy sensors, missing trips, the passenger who isn't driving), of a rating factor (filed, versioned, explainable, applied at the right renewal), and of a privacy regime that tightened sharply after the 2024 revelations that car makers had been selling driving data to consumer reporting agencies without drivers' knowledge.

This chapter covers the programs as their carriers describe them, the pipeline from sensor to rating factor, pay-per-mile, state limits (California's above all), and consent and privacy, including the FTC's 2026 final order against General Motors. Where telematics sits among permissible factors is What You May Rate On; telematics data held by consumer reporting agencies is Consumer Reports & Third-Party Data; location data engineering in general is [Location Tracking](/docs/building-blocks/location-tracking).

## How the Platforms Do It

Programs as their carriers' public pages describe them, as of November 2026 (marketing figures are the carrier's):

| Program | Device | What it measures | How it prices | Not available |
| --- | --- | --- | --- | --- |
| **Progressive Snapshot** | Mobile app by default; an OBD-II plug-in where the app isn't available | Hard brakes and accelerations, trips between 12 and 4 a.m., miles; phone use in some states and only with the app; only trips as the driver count | A participation discount for new customers in most states (average $164, not in NY), then a renewal adjustment after about six months (average $328 discount at completion); rates can rise, and Progressive says about 2 in 10 drivers get an increase | California |
| **State Farm Drive Safe & Save** | App with a beacon, or connected car | Acceleration, braking, cornering, phone distraction, speed (8 mph or more over the limit), annual mileage | An initial 10% participation decrease, then recalculated each renewal (typically every six months) on up to the prior 12 months of data; "may increase or decrease"; up to 30% discount, with New York capped at 30% | California, Rhode Island (the page also lists Massachusetts in one place) |
| **Nationwide SmartRide** | App or device | Miles, hard braking and acceleration, idle time, nighttime driving | A discount program, up to 40%; criteria differ in California and North Carolina; the discount may decrease at renewal in Virginia and Washington | Varies |
| **Nationwide SmartMiles** | Device or eligible connected car | Miles, plus safe-driving behavior for a renewal discount | Pay-per-mile: a base premium plus a cost per mile; only the first 250 miles a day count; up to 10% safe-driving discount at renewal | AK, HI, LA, MI, NC, NY, OK |
| **Lemonade Car** | App | Driving and location | Prices "factor in how much you drive"; in some states not using the app can affect price | Not listed |
| **Root** | Smartphone | Braking, consistency, turning, time of day, driver attentiveness, in a "two-to-four week test drive"; also continuous and third-party telematics | Driving performance is "the leading variable" in its underwriting model, per its 2025 10-K | California, per the 10-K |

The table shows three designs. **Discount-only** programs (Nationwide SmartRide) can only lower a price, which simplifies filing and consent but invites only good drivers. **Two-way** programs (Snapshot, Drive Safe & Save) can raise or lower it at renewal. **Score-to-rate** carriers (Root) make the trial score a primary underwriting and rating input from the start. Pay-per-mile (SmartMiles, Lemonade Car) makes mileage a billing quantity rather than a rating band.

## From Sensor to Rating Factor

The pipeline has five stages, and each one has its own failure mode:

1. **Collection.** A phone's accelerometer, gyroscope and GPS, a plug-in device on the OBD-II port, or the car maker's own connected-car feed. Phones need background location permission and battery management that doesn't kill the app; devices need installation; connected cars need the owner's enrollment with the manufacturer and a data-sharing agreement.
2. **Trip detection and attribution.** Turning a stream of points into trips with a start, an end and a driver. Phone programs must decide whether the phone's owner was driving or riding: Snapshot counts only trips as the driver; misattribution is the most common customer dispute.
3. **Event extraction.** Hard braking and acceleration are thresholds on deceleration and acceleration; phone handling is screen and motion state during a trip; speeding is speed versus the posted limit from a map (State Farm flags 8 mph or more over); time of day is a band (Snapshot's 12 to 4 a.m.).
4. **Scoring.** Trip summaries roll up to a period score, usually by a model the insurer files or describes in its filing, weighted by exposure (miles or hours). Root's version is a two-to-four-week trial; Progressive and State Farm score the renewal period.
5. **Rating.** The score maps to a factor through a filed table and applies at a defined point: the participation discount at enrollment, the earned adjustment at the next renewal after enough data (Progressive's "about six months"; State Farm's up to 12 months of data at each renewal).

Two rules keep the pipeline honest. First, **the rating input is the period score and its version, not the raw data**: the worksheet records score, model version, data window and trip count, and the raw trips stay in the telematics store under their own retention rule. Second, **missing data has a filed treatment**: too few trips, a phone that stopped reporting, an unenrolled household driver. The filing says what happens (no adjustment, the participation discount continues, or the discount drops), and the engine applies that, rather than scoring the trips it has.

## Pay-Per-Mile

Pay-per-mile splits the premium into a fixed part, rated like any policy, and a variable part billed on measured miles. Nationwide describes SmartMiles's monthly bill as the base premium plus the cost per mile times the miles in the prior billing cycle, with only the first 250 miles on a single day counted. A worked month, mine: base premium $45.00 a month and a filed rate of $0.060 per mile. The car drives 22 days, 31 miles a day on 21 of them, and one 410-mile road trip. Counted miles are 21 × 31 + 250 (the trip, capped) = 901, not 1,061, so the variable charge is 901 × $0.060 = $54.06 and the bill is $99.06. The cap is a rating rule applied per calendar day, so the day boundary (the driver's local time, as the product defines it) is part of the computation and belongs in the worksheet.

For the policy system, pay-per-mile means the written premium is not known at issue. The base is written at issue like any premium; the variable part is written monthly as miles arrive, as its own `premium_entries` with an earning window of the month just driven, which is a different shape from the pro rata earning of a term premium ([Written, Earned and Unearned](/books/insurance/insurance-business#written-earned-and-unearned)). Billing collects in arrears for the variable part, so a lapse leaves miles driven but unbilled, and the cancellation calculation adds them.

## State Limits

California is the decisive example. Its rating factor regulation makes annual mileage the second mandatory factor and lets insurers verify actual mileage in an optional program in which "participation by a policyholder ... shall be voluntary," by odometer readings from the insurer, a repair dealer, a smog check station or a government agency, by the insured's report, or "by a technological device." The device rule is narrow: "An insurer shall only use a technological device to collect information for determining actual miles driven," and "shall not use a technological device to collect or store information about the location of the insured vehicle," except for emergency road service, theft, map or travel services (10 CCR 2632.5(c)(2)). So a California telematics program may verify miles and nothing else: no braking, no time of day, no location in rating. Progressive and State Farm list their programs as unavailable in California, and Root's 2025 10-K describes California as prohibiting "any use of telematics," which is the company's characterization of a regime that permits mileage-only devices.

Other states shape programs at the edges, and the carriers' footnotes show where: New York appears as a cap (State Farm's 30% maximum) and as an exclusion from participation discounts (Snapshot); North Carolina's bureau rating limits premium adjustments (State Farm's note that adjustment may not be available there, and Nationwide's different criteria). Root says some jurisdictions "impose unique telematics-related requirements," some of which it "has elected not to meet at this time." In a system, these become `rating_factor_rules` rows for the telematics factor by state and use (What You May Rate On), plus product-level settings for caps and whether an increase is allowed.

## Consent and Privacy

Telematics consent has to answer what is collected (location and behavior, or miles only), who sees it (the insurer, its vendor, a consumer reporting agency), what it is used for (rating at renewal, claims, marketing), how long it is kept, and how to stop. The legal pressure point since 2024 has been data collected by someone other than the insurer:

- **The FTC's GM order.** On January 16, 2025 the FTC announced a proposed order against General Motors and OnStar, alleging GM used a misleading enrollment flow for OnStar and its Smart Driver feature, did not clearly disclose that it collected precise geolocation and driving behavior (including "every instance of hard braking, late night driving, and speeding," with location sometimes collected every three seconds), and sold the data to third parties, including consumer reporting agencies whose reports insurers used to deny coverage and set rates. The Commission finalized the order on January 14, 2026 by a 2-0 vote. It bans GM for five years from disclosing consumers' geolocation and driver behavior data to consumer reporting agencies, and for the order's 20-year life requires affirmative express consent before collecting, using or sharing connected vehicle data (with exceptions such as location for emergency responders), a way for consumers to request and delete their data, the ability to disable precise geolocation collection where the vehicle supports it, and an opt-out of geolocation and driver behavior collection.
- **Telematics data as consumer reports.** The CFPB's list of consumer reporting companies includes Arity, LexisNexis Telematics OnDemand and Connected Analytic Services among the agencies whose data property and auto insurers buy, each with a free report. When an insurer rates on a third party's driving data, the FCRA's permissible purpose, adverse action and dispute duties apply (Consumer Reports & Third-Party Data).
- **State enforcement.** Texas's attorney general is reported to have sued General Motors in August 2024 and Allstate and its data subsidiary Arity in January 2025 over the collection and sale of driving data, the first under the Deceptive Trade Practices Act and the second under the Texas Data Privacy and Security Act; I have not been able to open the filings or a current status.<!-- source-gap: tx-ag-driving-data-suits | secondary | Texas v. General Motors (Aug 2024) and Texas v. Allstate and Arity (Jan 2025): filings and current status | closes with: the Texas AG press releases or the Montgomery County district court dockets | checked: 2026-11-09 -->

My rule for a first-party program: **collect only what the filed rating factor and the stated uses need, under a consent that names each use, stored as a versioned record the pipeline checks before ingesting a trip**. A renewal score built from trips collected after a consent was withdrawn is both a privacy violation and a rating error ([Consent, Law and Retention](/docs/building-blocks/location-tracking#consent-law-and-retention)).

## How to Build It

These are deltas against [The Core Data Model](/books/insurance/insurance-business#the-core-data-model): `risks` (the vehicle and driver), `policies` and `premium_entries`, and How a Rate Is Built (`rate_tables`, `rating_steps`). This chapter adds `telematics_enrollments`, `trip_summaries` and `driving_scores`; raw sensor data stays in a separate store with its own retention.

```sql
CREATE TABLE telematics_enrollments (      -- one per driver or vehicle in a program
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  risk_stable_key    UUID NOT NULL,         -- the driver or vehicle across versions and terms
  program            TEXT NOT NULL,         -- 'behavior_two_way', 'discount_only', 'pay_per_mile',
                                            -- 'mileage_verification_only'
  source             TEXT NOT NULL CHECK (source IN ('phone_app', 'obd_device',
                       'connected_car', 'third_party_cra')),
  consent_id         UUID NOT NULL,         -- delivery_consents-style versioned consent record
  consent_scopes     TEXT[] NOT NULL,       -- 'miles', 'behavior', 'location', 'claims_use'
  enrolled_at        TIMESTAMPTZ NOT NULL,
  participation_discount_applied BOOLEAN NOT NULL DEFAULT FALSE,
  withdrawn_at       TIMESTAMPTZ,
  status             TEXT NOT NULL CHECK (status IN ('pending_install', 'active',
                       'insufficient_data', 'completed', 'withdrawn'))
);

CREATE TABLE trip_summaries (              -- derived per trip; raw points live elsewhere
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  enrollment_id      UUID NOT NULL REFERENCES telematics_enrollments (id),
  started_at         TIMESTAMPTZ NOT NULL,
  ended_at           TIMESTAMPTZ NOT NULL,
  local_date         DATE NOT NULL,         -- for daily caps such as 250 counted miles
  miles              NUMERIC(8, 2) NOT NULL,
  role               TEXT NOT NULL CHECK (role IN ('driver', 'passenger', 'unknown')),
  role_disputed      BOOLEAN NOT NULL DEFAULT FALSE,
  hard_brakes        INT NOT NULL DEFAULT 0,
  hard_accels        INT NOT NULL DEFAULT 0,
  phone_handling_sec INT,                   -- null where the state or scope excludes it
  night_minutes      INT,                   -- in the filed time band
  speeding_sec       INT,
  extractor_version  TEXT NOT NULL,
  UNIQUE (enrollment_id, started_at)
);

CREATE TABLE driving_scores (              -- the period score that becomes a rating input
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  enrollment_id      UUID NOT NULL REFERENCES telematics_enrollments (id),
  data_window        DATERANGE NOT NULL,    -- the data window the filing specifies
  trips_used         INT NOT NULL,
  miles_used         NUMERIC(10, 2) NOT NULL,
  score              NUMERIC(8, 4),         -- null when data is insufficient
  sufficiency        TEXT NOT NULL CHECK (sufficiency IN ('sufficient', 'insufficient')),
  model_id           UUID NOT NULL,         -- models (Data, AI & Privacy Rules)
  model_version      TEXT NOT NULL,
  factor             NUMERIC(8, 4) NOT NULL, -- from the filed score-to-factor table
  rate_table_id      UUID NOT NULL REFERENCES rate_tables (id),
  applies_to_term_id UUID REFERENCES policy_terms (id),  -- the renewal it rates
  computed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Counted miles for a pay-per-mile billing cycle, with the daily cap applied per local date:

```sql
SELECT SUM(LEAST(day_miles, 250)) AS counted_miles
FROM (
  SELECT ts.local_date, SUM(ts.miles) AS day_miles
  FROM trip_summaries ts
  WHERE ts.enrollment_id = :enrollment_id
    AND ts.role = 'driver'
    AND ts.local_date >= :cycle_start AND ts.local_date < :cycle_end
  GROUP BY ts.local_date
) d;
```

Design choices:

- **Ingest checks consent first.** Trips after `withdrawn_at`, or data outside `consent_scopes`, are dropped at the edge, not filtered at scoring time.
- **Scores are immutable rows with a model version and window;** a correction (a disputed passenger trip) recomputes a new score row and, if the renewal already rated, triggers an endorsement or a refund rather than editing the old score.
- **Pay-per-mile charges are premium entries per cycle** with their own earning window, reconciled to counted miles.
- **Raw data retention is shorter than score retention.** The score and its inputs are rating records kept with the policy; second-by-second location is kept only as long as disputes and the stated uses need.

## Auditing

- **Every enrollment has its consent record and scopes,** with the version the driver accepted and when it was withdrawn.
- **Every score names its model version, window, trip count and the filed table that mapped it to a factor,** and the renewal worksheet references the score row.
- **Insufficient-data cases follow the filed rule,** and an exception report lists policies where a factor was applied without a sufficient score.
- **Third-party driving data is ordered with a permissible purpose** and noticed like any consumer report.

## What This Means for the System You Build

- **Treat the period score, not raw trips, as the rating input,** versioned and stored with its window and model.
- **Encode the filed treatment for missing data and the timing of each adjustment** (participation, renewal).
- **Make state limits data:** mileage-only in California, caps and no-increase rules elsewhere.
- **Bill pay-per-mile as monthly premium entries** with per-day caps computed on a defined local date.
- **Gate ingestion on a scoped, versioned consent,** and expect regulators to ask how third-party driving data reached a rating decision.

## References

**Law and regulation**

- [10 CCR 2632.5: Rating Factors](https://www.law.cornell.edu/regulations/california/10-CCR-2632.5), mileage as the second mandatory factor, voluntary verified-mileage programs, and the technological device limit to miles driven with no location collection

**Regulators and guidance**

- [FTC: FTC takes action against General Motors for sharing drivers' precise location and driving behavior data, January 16, 2025](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-takes-action-against-general-motors-sharing-drivers-precise-location-driving-behavior-data), the allegations, the data collected and its sale to consumer reporting agencies
- [FTC: FTC finalizes order settling allegations GM and OnStar collected and sold geolocation data without consumers' consent, January 14, 2026](https://www.ftc.gov/news-events/news/press-releases/2026/01/ftc-finalizes-order-settling-allegations-gm-onstar-collected-sold-geolocation-data-without-consumers), the 2-0 vote, the five-year ban on disclosure to consumer reporting agencies and the 20-year consent, deletion and opt-out terms
- [CFPB: List of consumer reporting companies](https://www.consumerfinance.gov/consumer-tools/credit-reports-and-scores/consumer-reporting-companies/companies-list/), Arity, LexisNexis Telematics OnDemand and CAS among insurance specialty agencies

**Filings**

- [Root, Inc.: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1788882/000178888226000014/root-20251231.htm), the two-to-four week test drive, driving performance as the leading underwriting variable, and its description of California and other states' telematics requirements

**Vendor documentation**

- [Progressive: Snapshot](https://www.progressive.com/auto/discounts/snapshot/), devices, behaviors measured, participation and renewal discounts, the share of drivers with increases, and California and New York exclusions
- [State Farm: Drive Safe & Save](https://www.statefarm.com/insurance/auto/discounts/drive-safe-save), behaviors measured, the initial 10% decrease, renewal recalculation on up to 12 months, the 30% figure and New York cap, and unavailable states
- [Nationwide: SmartRide](https://www.nationwide.com/personal/insurance/auto/discounts/smartride/), measured behaviors, the discount-only design and state variations
- [Nationwide: SmartMiles](https://www.nationwide.com/personal/insurance/auto/discounts/smartmiles/), base plus per-mile premium, the 250-mile daily cap, the renewal discount and unavailable states
- [Lemonade: Car insurance](https://www.lemonade.com/car), mileage-based pricing through the app
