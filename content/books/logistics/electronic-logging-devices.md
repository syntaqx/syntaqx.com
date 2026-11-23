+++
title = "ELDs & Telematics"
description = "The ELD rule: who must use one, what it records, edits and unassigned driving, malfunctions, roadside transfer, registration and revocations, and vendor APIs."
category = "Logistics & Supply Chain Industry"
order = 2823
part = "Carrier Regulation"
tags = ["logistics", "trucking", "fmcsa", "eld", "telematics", "hours-of-service", "integrations"]
+++

An electronic logging device is the regulated recorder behind every hours of service log. Since the compliance date of the 2015 ELD rule, December 18, 2017, a motor carrier whose drivers must keep records of duty status "must install and require each of its drivers to use an ELD" (49 CFR 395.8(a)(1)); carriers that had installed an older automatic onboard recording device (AOBRD) before that date could keep using it "through December 16, 2019." An ELD connects to the truck's engine control module, records duty status changes with the engine's hours and miles and an approximate location, makes an hourly record while the truck moves, and hands the whole record to an inspector at the roadside in a standard file. In practice it is a telematics product: the same vendors' gateways also report GPS positions, diagnostics, fuel, driver behavior and camera events, and those feeds are what visibility, dispatch and fuel tax systems consume.

The rule is unusual in two ways that shape how systems handle it. It is a **self-certified standard**: the vendor certifies its own device against the technical specification in Appendix A to subpart B of part 395 and registers it with FMCSA, which can later remove it from the registered list, at which point every carrier using it has 60 days to replace it. And the record it produces is **editable but never erasable**: drivers annotate and edit, carriers propose edits a driver must accept, unidentified driving is assigned later, and the original is kept. A system that reads ELD data has to know which version of a record it holds, which device produced it, and whether that device was registered when it did. This chapter covers who must use an ELD, what it records, edits and unidentified driving, malfunctions, roadside transfer, the registered list and revocations, the rule's open review, telematics beyond the log, and the tables. The limits the log is judged against are in [Hours of Service](/books/logistics/hours-of-service); the telematics market as a field service company integrates it is in Field Operations' [The Telematics Market](/books/field-operations/fleet-and-safety#the-telematics-market) and [Integrating Telematics Into Field Operations](/books/field-operations/fleet-and-safety#integrating-telematics-into-field-operations).

## How the Platforms Do It

Carriers buy ELDs as part of a telematics subscription, and the systems around them read the vendor's APIs. As of November 2026, from FMCSA's lists and the vendors' developer documentation:

| Vendor or list | Logs and events | Clocks | Edits and status | Notes |
| --- | --- | --- | --- | --- |
| **FMCSA registered and revoked lists** | Each device by name, model number, ELD identifier and provider | | Registered, revoked or self-revoked, with the date | The revoked list showed a batch dated November 12, 2026 at the top when checked |
| **Geotab** | `DutyStatusLog` with `eventType` 1 to 7 and an `eventCode` "referenced to the ELD Final Rule," plus `engineHours`, `odometer`, `location` and `malfunction` | `DutyStatusAvailability` | `eventRecordStatus` 1 (active), 2 (inactive, changed), 3 (inactive, change requested), 4 (inactive, change rejected); `parentId` on an edit; `editRequestedByUser`; `verifyDateTime` | `isIgnored` logs don't affect availability |
| **Motive** | `GET /v1/logs`: per driver and day, `events` with `type`, `start_time`, `end_time`, `location` and `is_manual`, and daily durations | `GET /v1/hours_of_service`; `v1/hos_violations` | `driver_signed_at` on the log | Durations in seconds |
| **Samsara** | `GET /fleet/hos/logs`: `hosStatusType`, `logStartTime`, `logEndTime`, `codrivers`, `remark`, `logRecordedLocation`, `vehicle` | `GET /fleet/hos/clocks` | Advises waiting "a couple of days" after a log is created for driver app uploads | Needs a token with Read ELD Compliance Settings (US) |

Three patterns:

- **The vendor speaks the rule's vocabulary, partly.** Geotab exposes the rule's event types and record statuses almost directly; Samsara and Motive expose duty status periods and leave the raw events inside the product. A carrier or broker integrating several vendors maps each to the rule's event model, not to one vendor's shape ([Mapping Their Schema to Yours](/docs/building-blocks/integrations#mapping-their-schema-to-yours)).
- **Records arrive late and change.** Driver apps upload when they connect, drivers certify days later, and edits supersede earlier records. Every vendor's feed is a stream of versions, so consumers upsert by the vendor's ID and keep the history, as [The Telematics Market](/books/field-operations/fleet-and-safety#the-telematics-market) describes for Geotab's versioned feed.
- **The registered list is part of the integration.** A device that falls off FMCSA's list makes its logs a violation after the 60-day replacement window, whatever the API returns; the carrier's compliance system checks every installed device against the list, not just at purchase.

## Who Must Use One

Every driver required to keep records of duty status under 395.8 uses an ELD, with four exceptions in 395.8(a)(1)(ii)(A) that may keep paper logs instead:

- A driver "requiring completion of a record of duty status on not more than 8 days within any 30-day period."
- A driveaway-towaway driver where the vehicle driven is part of the shipment being delivered.
- A driveaway-towaway driver transporting a motor home or recreation vehicle trailer.
- A driver of a vehicle "manufactured before model year 2000, as reflected in the vehicle identification number."

Drivers who qualify for a short-haul exception keep no record of duty status at all, and so need no ELD ([Exceptions](/books/logistics/hours-of-service#exceptions)); most local delivery and service fleets fall here, and use the same telematics hardware without the ELD function.

## What an ELD Records

The device is "integrally synchronized with the engine": it monitors the engine to "automatically capture the engine's power status, vehicle's motion status, miles driven value, and engine hours value" (Appendix A, 4.2), linking to the engine control module on model year 2000 and later vehicles. At each recorded event it captures the data elements in 395.26(b): date, time, CMV geographic location, engine hours, vehicle miles, and driver, vehicle and motor carrier identification; login, logout and malfunction events record all of them except location.

| Event type | What it records | Rule |
| --- | --- | --- |
| **1. Duty status change** | Off duty, sleeper berth, driving, on duty not driving | 4.5.1.1 |
| **2. Intermediate log** | A record while moving when there has been no duty status change or intermediate log "in the previous 1-hour period" | 4.5.1.2, 395.26(d) |
| **3. Change in driving conditions** | Personal use (authorized personal conveyance) and yard moves, on and off | 4.5.1.3 |
| **4. Certification** | The driver's certification of a day's records | 4.5.1.4 |
| **5. Login and logout** | Each authenticated session | 4.5.1.5 |
| **6. Engine power up and shut down** | Each start and stop | 4.5.1.6 |
| **7. Malfunctions and data diagnostics** | Each detected and cleared problem | 4.5.1.7 |

The measurement rules are precise. Driving is detected automatically: the in-motion threshold "must not be configurable to greater than 5 miles per hour," and the vehicle stays in motion until it has been at 0 mph for 3 consecutive seconds (4.3.1.2). Vehicle miles are whole miles and engine hours tenths of an hour (4.3.1.3, 4.3.1.4). Position must be "accurate to ±0.5 mile of absolute position of the CMV," about ±1 mile once reporting precision is included, and during personal use the coordinates are reduced to one decimal place (4.3.1.6, 4.7.3), about 11 kilometers of latitude. The location description shown to the driver and the inspector names a nearby place with a population of 5,000 or more (4.4.2). A missing position is logged as "X," a manually entered one as "M." The driver manually enters annotations, a location description when prompted and an output file comment when an officer asks for one, and enters or verifies the power unit number, trailer numbers and shipping document number (395.24(c)).

The shipping document number is the bridge between the log and the freight: it's how an auditor ties a day of driving to a bill of lading, and how a broker's system could tie a carrier's log to its load, if the driver entered it.

## Edits, Certification and Unidentified Driving

Three rules keep the record honest while allowing corrections:

- **Certification.** The driver certifies each 24-hour record by selecting "Agree," "immediately after the final required entry has been made or corrected for the 24-hour period" (395.30(b)(2)).
- **Edits are annotated, and the original stays.** "Subject to the edit limitations of an ELD, a driver may edit," and "The driver or support personnel must annotate each change or addition to a record" (395.30(c)); a carrier may propose changes, but "A driver must confirm or reject any proposed change," then recertify (395.30(d)). The carrier "must not alter or erase, or permit or require alteration or erasure of, the original information collected" (395.30(f)). The regulation's one explicit provision on editing driving time lets it be reassigned between team drivers when it went to the wrong one (395.30(c)(3)); otherwise what may be edited is set by "the edit limitations of an ELD" in the specification.
- **Unidentified driving is assigned or explained.** Driving with no one logged in is recorded against an unidentified driver. At login the driver must review unassigned time and either "Assume any records that belong to the driver" or indicate they don't (395.32(b)); the carrier must review what remains and either annotate why it is unassigned or assign it to the right driver, and keep "unidentified driving records for each ELD for a minimum of 6 months" (395.32(c)). The device raises a data diagnostic event when "more than 30 minutes of driving in a 24-hour period show unidentified driver," cleared at "15 minutes or less" (4.6.1.6).

Each of these is a state on a record. Geotab's record statuses (active, inactive changed, change requested, change rejected) are a direct reflection of them, and a system that keeps only the active version can't answer an auditor's "what did the original say."

## Malfunctions

The device monitors itself for power, engine synchronization, timing, positioning, data recording and data transfer problems (4.6.1). A positioning malfunction, for example, is set when valid positions are missing for a cumulative 60 minutes in 24 hours; an engine synchronization malfunction when a required source is lost for more than 30 minutes in 24 hours. When one occurs, the duties split (395.34):

- **The driver** notes it and gives "written notice of the malfunction to the motor carrier within 24 hours"; reconstructs "the record of duty status for the current 24-hour period and the previous 7 consecutive days" on paper unless it can be retrieved; keeps paper logs until the device is fixed; and shows those to an inspector. For a data diagnostic event, the driver follows "the motor carrier's and ELD provider's recommendations."
- **The carrier** corrects, repairs or replaces the device within 8 days of discovering the malfunction or the driver's notice, whichever is first. If it needs longer, it asks the FMCSA Division Administrator for its home state within 5 days of the driver's notice, with each device's make, model and serial number, the dates and locations, and its repair efforts; a compliant request keeps the carrier in compliance while FMCSA decides.

The 8-day and 5-day clocks are deadlines a fleet system computes and stores at the moment the driver's notice arrives ([Deadlines Are Computed and Stored](/docs/building-blocks/rules-as-data#deadlines-are-computed-and-stored)).

## Roadside Transfer

At an inspection, the driver must "produce and transfer from an ELD" the hours of service records on request (395.24(d)). The device must support one of two transfer options, and the officer chooses among the certified mechanisms (4.9.1):

- **Option 1, telematics:** wireless web services and email.
- **Option 2, local:** USB 2.0 and Bluetooth.

What moves is the ELD output file: "a single comma-delimited file" in ASCII with a header and segments for drivers, vehicles, events, malfunctions and diagnostics, logins and logouts, and unidentified driver records (4.8.2.1), named with a 25-character filename (4.8.2.2). Two fields make the file verifiable: a mandatory 4-character hexadecimal **file data check value** meant to "identify cases where an ELD file may have been inappropriately modified after its original creation" (7.27), and an optional **output file comment** of up to 60 characters that an officer can supply to "link the requested data to an inspection, inquiry, or other enforcement action" (7.38).

The truck carries an instruction sheet for data transfer, an instruction sheet for reporting malfunctions, and blank graph-grid logs "for a minimum of 8 days" (395.22(h)). The requirement to keep the ELD's user manual in the vehicle was rescinded by a rule published June 22, 2026 and effective July 22, 2026 (91 FR 37050), on the reasoning that ELDs have been in use since December 2019 and drivers already know them.

## Self-Certification, the Registered List and Revocations

An ELD provider registers online with its company details and the person authorized to certify, and FMCSA issues "a unique ELD registration ID" with authentication keys; the provider then certifies each model and version, disclosing the product name, model number, software version, ELD identifier, supported transfer mechanisms, a malfunction summary and how it was tested (Appendix A, section 5). The carrier "must use only an ELD that is listed on the Federal Motor Carrier Safety Administration's registered ELDs list" (395.22(a)).

FMCSA removes devices that don't meet the specification. Its May 20, 2026 notice is typical: FMCSA "removed 12 ELDs from the list of Registered Electronic Logging Devices" for failing "the minimum requirements established in Title 49 CFR Appendix A to Subpart B of Part 395," and told carriers using them to stop, "revert to paper logs or logging software," and replace them "before July 20, 2026"; continuing on or after that date is a violation of 395.8(a)(1), "No record of duty status," and drivers "will be placed out-of-service." If a provider fixes the deficiencies, FMCSA puts the device back on the list. The revoked list FMCSA publishes shows entries marked "Revoked" and "Self Revoked" by date, with a batch dated November 12, 2026 at the top when I checked; DOT's announcement of that batch as the largest revocation in FMCSA's history, 133 devices, I could see only in a search summary. <!-- source-gap: logistics-electronic-logging-devices-nov-2026-revocation | secondary | DOT's November 12, 2026 removal of 133 ELDs (121 revoked, 12 self-revoked) | closes with: the transportation.gov or FMCSA announcement or notice PDF for November 12, 2026, opened | checked: 2026-11-22 -->

For a carrier, a revocation is a dated work order across the fleet: which units have the device, who drives them, and a replacement date 60 days out. For a broker or shipper, a carrier running a revoked device after the deadline is operating with no legal log, which is worth a monitoring flag where the vetting data includes the carrier's ELD provider.

## The Rule Under Review

FMCSA opened a review of the ELD rule with an advance notice of proposed rulemaking on September 16, 2022 (87 FR 56921), asking whether and how the rule should apply to vehicles with pre-2000 engines (the current exemption keys on the vehicle's model year), how malfunctions should be handled, how certification works, and how devices are removed from the list. As of November 2026 no proposed rule has followed in the Federal Register; the only ELD rule changes since are the manual rescission and the technical amendments. Individual exemption applications continue (a Federation of Professional Truckers application was noticed on September 30, 2026), and an exemption granted to a carrier is, like hours exemptions, a rule override with an expiry.

## Telematics Beyond the Log

The ELD is the regulated slice of a telematics stream that carries far more:

- **Positions.** The gateway reports GPS positions far more precisely and often than the ELD's ±1 mile record. Positions feed visibility as `shipment_events` with source `eld` in the core model ([The Core Data Model](/books/logistics/logistics-business#the-core-data-model)); how positions become arrivals and ETAs is in Visibility & Tracking and [Arrival and Departure Detection](/docs/building-blocks/location-tracking#arrival-and-departure-detection). A broker usually gets them through a visibility network the carrier authorizes rather than from the ELD vendor directly.
- **Diagnostics and fuel.** Fault codes, odometer and fuel used feed maintenance, IFTA mileage by jurisdiction (Fuel, Tolls & Fuel Cards) and cost per mile.
- **Safety events and video.** Harsh events and camera footage are covered in [Safety Scores and Dashcams](/books/field-operations/fleet-and-safety#safety-scores-and-dashcams), and are evidence in crash and cargo claims.
- **Driver communications.** Dispatch messages through the fleet management system are a supporting document category under 395.11, so the message log is part of the hours record.

Two rules apply to all of it. The ELD rule prohibits harassment: a carrier may not use ELD data or communications in a way it knew or should have known would push a driver to violate the fatigue rule or hours limits (390.36(b), from the 2015 rule), and drivers may file written complaints. And the carrier must retain ELD records "so as to protect a driver's privacy" (395.22(i)(2)), keeping a back-up copy "on a device separate from that on which the original data are stored" for 6 months (395.22(i)). Positions outside working time (personal conveyance, a truck taken home) are personal data, and the reduced precision the rule applies to personal use is a reasonable default for every downstream copy ([Consent, Law and Retention](/docs/building-blocks/location-tracking#consent-law-and-retention)).

## How to Build It

ELD data extends `drivers`, `equipment_units` and `shipment_events`, and adds the device registry, installations, raw events and the carrier's obligations around them. The raw events are the source; [Hours of Service](/books/logistics/hours-of-service#how-to-build-it)' `hos_duty_periods` is derived from them.

```sql
CREATE TABLE eld_devices (                -- a registered ELD model and version, as FMCSA lists it
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  provider_party_id UUID NOT NULL REFERENCES parties (id),
  name             TEXT NOT NULL,         -- as listed
  model_number     TEXT NOT NULL,
  eld_identifier   TEXT NOT NULL,         -- the six-character identifier in the listing
  software_version TEXT,
  registration_id  TEXT,                  -- the provider's FMCSA registration ID
  transfer_option  TEXT CHECK (transfer_option IN ('telematics', 'local')),
  UNIQUE (eld_identifier, model_number)
);

CREATE TABLE eld_device_listings (        -- the device's status on FMCSA's lists, over time
  eld_device_id    UUID NOT NULL REFERENCES eld_devices (id),
  status           TEXT NOT NULL CHECK (status IN ('registered', 'revoked', 'self_revoked')),
  listed_on        DATE NOT NULL,         -- the date on the list or notice
  replace_by       DATE,                  -- 60 days after a revocation
  notice_document_id UUID REFERENCES documents (id),
  PRIMARY KEY (eld_device_id, listed_on)
);

CREATE TABLE eld_installations (          -- which device is in which unit, when
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  equipment_id     UUID NOT NULL REFERENCES equipment_units (id),  -- the power unit
  eld_device_id    UUID NOT NULL REFERENCES eld_devices (id),
  serial_number    TEXT,
  installed_during TSTZRANGE NOT NULL,
  EXCLUDE USING gist (equipment_id WITH =, installed_during WITH &&)  -- needs btree_gist
);

CREATE TABLE eld_events (                 -- each ELD event record, every version kept
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  carrier_party_id UUID NOT NULL REFERENCES parties (id),
  driver_id        UUID REFERENCES drivers (id),  -- null: unidentified driver
  equipment_id     UUID REFERENCES equipment_units (id),
  installation_id  UUID REFERENCES eld_installations (id),
  vendor           TEXT NOT NULL,         -- 'geotab', 'motive', 'samsara', 'output_file'
  vendor_ref       TEXT NOT NULL,         -- the vendor's ID for this record
  vendor_version   TEXT,                  -- the vendor's version or sequence, for upserts
  parent_event_id  UUID REFERENCES eld_events (id),  -- the original, when this is an edit
  event_type       SMALLINT NOT NULL CHECK (event_type BETWEEN 1 AND 7),
  event_code       TEXT NOT NULL,         -- as recorded: duty status, PC or YM on/off, ...
  record_status    TEXT NOT NULL CHECK (record_status IN ('active', 'inactive_changed',
                     'inactive_change_requested', 'inactive_change_rejected')),
  record_origin    TEXT CHECK (record_origin IN ('automatic', 'driver', 'other_user',
                     'unidentified_assumed')),
  occurred_at      TIMESTAMPTZ NOT NULL,
  engine_hours     NUMERIC(8, 1),         -- tenths of an hour
  vehicle_miles    INT,                   -- whole miles
  position         GEOGRAPHY(Point, 4326),  -- as recorded; reduced during personal use
  position_flag    TEXT CHECK (position_flag IN ('automatic', 'manual', 'unavailable',
                     'malfunction')),
  location_text    TEXT,
  malfunction_code TEXT,                  -- type 7: the malfunction or diagnostic code
  annotation       TEXT,
  shipping_doc_ref TEXT,                  -- the shipping document number the driver entered
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (vendor, vendor_ref, vendor_version)
);
CREATE INDEX ON eld_events (driver_id, occurred_at);
CREATE INDEX ON eld_events (equipment_id, occurred_at) WHERE driver_id IS NULL;

CREATE TABLE eld_malfunction_cases (      -- a malfunction and the carrier's 395.34 clocks
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  equipment_id     UUID NOT NULL REFERENCES equipment_units (id),
  installation_id  UUID REFERENCES eld_installations (id),
  first_event_id   UUID REFERENCES eld_events (id),
  driver_notice_at TIMESTAMPTZ,           -- the driver's written notice (due within 24 hours)
  discovered_at    TIMESTAMPTZ NOT NULL,
  repair_due_at    TIMESTAMPTZ NOT NULL,  -- 8 days from discovery or notice, whichever is first
  extension_due_at TIMESTAMPTZ,           -- 5 days from the driver's notice
  extension_requested_at TIMESTAMPTZ,
  resolved_at      TIMESTAMPTZ,
  resolution       TEXT CHECK (resolution IN ('repaired', 'replaced', 'extension_granted',
                     'cleared'))
);

CREATE TABLE eld_unidentified_reviews (   -- 395.32(c): assign or annotate unassigned driving
  eld_event_id     UUID PRIMARY KEY REFERENCES eld_events (id),
  outcome          TEXT NOT NULL CHECK (outcome IN ('assigned', 'annotated',
                     'driver_rejected')),
  assigned_driver_id UUID REFERENCES drivers (id),
  reason           TEXT,                  -- the annotation, for an unassigned record
  reviewed_by      UUID NOT NULL,         -- the user who decided
  reviewed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((outcome = 'assigned') = (assigned_driver_id IS NOT NULL))
);

ALTER TABLE shipment_events
  ADD COLUMN eld_event_id UUID;            -- the ELD record a position or status came from
ALTER TABLE shipment_events ADD CONSTRAINT shipment_events_eld_event_fkey
  FOREIGN KEY (eld_event_id) REFERENCES eld_events (id) NOT VALID;
ALTER TABLE shipment_events VALIDATE CONSTRAINT shipment_events_eld_event_fkey;

ALTER TABLE drivers
  ADD COLUMN eld_exempt_reason TEXT;       -- '8_in_30', 'driveaway_towaway', 'pre_2000_vehicle',
                                           -- or null; short-haul is on drivers.short_haul
```

Two queries run daily. Units carrying a revoked device, with the date they must be replaced:

```sql
SELECT e.id AS equipment_id, e.identifier, d.name, d.model_number, l.listed_on, l.replace_by
FROM eld_installations i
JOIN equipment_units e ON e.id = i.equipment_id
JOIN eld_devices d ON d.id = i.eld_device_id
JOIN LATERAL (
  SELECT * FROM eld_device_listings x
  WHERE x.eld_device_id = d.id ORDER BY x.listed_on DESC LIMIT 1
) l ON TRUE
WHERE i.installed_during @> now()
  AND l.status IN ('revoked', 'self_revoked')
ORDER BY l.replace_by;
```

And vehicles whose unidentified driving in the last 24 hours exceeds the 30 minutes that raises a diagnostic, before the inspector sees it, reading driving status changes with no driver and summing to the next event on the unit (a window function over `eld_events` by `equipment_id`).

Design notes:

- **Keep every version.** `UNIQUE (vendor, vendor_ref, vendor_version)` lets a feed resend without duplicates and an edit arrive as a new row with `parent_event_id`; the active record is the one with `record_status = 'active'`.
- **The device's registration status is time-based.** A log made on a device while it was registered, or within the 60-day window, is valid; `eld_device_listings` with `eld_installations` answers that for any date.
- **Positions inherit the personal use rule.** When `event_code` marks personal conveyance, store the reduced precision the device recorded and never backfill a precise position from the gateway's GPS feed for that interval.
- **Map vendors to the rule.** The event types, record statuses and origins are the rule's; each vendor adapter maps into them, and unmapped vendor fields go to a JSONB column only when something needs them ([Integrations](/docs/building-blocks/integrations)).
- **Idempotent webhook consumers.** Vendor webhooks redeliver; consumers dedupe on the vendor's ID and version ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent), [Webhooks](/docs/api-design/webhooks)).

## Auditing

- **ELD records and their back-up, six months,** kept on a separate device and protecting the driver's privacy (395.22(i)), with every version and annotation.
- **Unidentified driving records, six months,** with each review's outcome (395.32(c)).
- **Malfunctions and their clocks,** the driver's notice, the repair or replacement date and any extension request, because an inspector seeing paper logs will ask why.
- **Device registration history,** each installation and the device's status on FMCSA's lists on each day, with the revocation notice.
- **Who looked.** Access to drivers' location and duty data outside compliance and dispatch, logged ([Log Access, Not Just Changes](/docs/building-blocks/audit-trails#log-access-not-just-changes)).

## What This Means for the System You Build

- **Store ELD events in the rule's model,** with event types, codes, record statuses and origins, and map each vendor into it.
- **Keep every version of every record,** with the edit's parent and annotation; never overwrite the original.
- **Check installed devices against FMCSA's registered and revoked lists daily,** and schedule replacements inside the 60-day window.
- **Track unidentified driving and malfunctions as cases with deadlines,** before an inspector finds them.
- **Use the shipping document number** to tie logs to loads, and positions from the gateway for visibility.
- **Treat drivers' positions and hours as personal data,** with the personal use precision rule carried into every copy.

## References

**Regulations**

- [49 CFR 395.8: Driver's record of duty status](https://www.law.cornell.edu/cfr/text/49/395.8), the ELD requirement and the four exceptions
- [49 CFR 395.22: Motor carrier responsibilities, in general](https://www.law.cornell.edu/cfr/text/49/395.22), registered devices only, user accounts, calibration, portable mounting, in-vehicle information and back-up retention with privacy
- [49 CFR 395.24: Driver responsibilities, in general](https://www.law.cornell.edu/cfr/text/49/395.24), manual entries and producing records at the roadside
- [49 CFR 395.26: ELD data automatically recorded](https://www.law.cornell.edu/cfr/text/49/395.26), the eight data elements and which events record them
- [49 CFR 395.30: ELD record submissions, edits, annotations, and data retention](https://www.law.cornell.edu/cfr/text/49/395.30), certification, annotated edits, carrier-proposed edits, team reassignment and the unaltered original
- [49 CFR 395.32: Non-authenticated driver logs](https://www.law.cornell.edu/cfr/text/49/395.32), reviewing, assigning and annotating unidentified driving and six-month retention
- [49 CFR 395.34: ELD malfunctions and data diagnostic events](https://www.law.cornell.edu/cfr/text/49/395.34), the driver's 24-hour notice and reconstruction, the carrier's 8 days and the 5-day extension request
- [Appendix A to subpart B of part 395: Functional specifications for ELDs](https://www.law.cornell.edu/cfr/text/49/appendix-A_to_subpart_B_of_part_395), engine synchronization, driving detection, position accuracy, event types, unidentified driving diagnostics, malfunction thresholds, transfer options, the output file, the check value and comment, and provider registration and certification

**Federal Register**

- [Electronic Logging Devices and Hours of Service Supporting Documents (December 16, 2015)](https://www.govinfo.gov/content/pkg/FR-2015-12-16/html/2015-31336.htm), 80 FR 78292: effective February 16, 2016, compliance December 18, 2017, AOBRDs through December 16, 2019, and the harassment prohibition
- [Electronic Logging Device Revisions, ANPRM (September 16, 2022)](https://www.federalregister.gov/api/v1/documents/2022-20095.json), 87 FR 56921: pre-2000 engines, malfunctions, certification and removal from the list
- [Rescinding the Requirement for ELD Operator's Manual Located in CMVs (June 22, 2026)](https://www.federalregister.gov/api/v1/documents/2026-12448.json), 91 FR 37050, effective July 22, 2026
- [Federal Register search: FMCSA ELD rules and proposals since 2022](https://www.federalregister.gov/api/v1/documents.json?conditions%5Bterm%5D=%22electronic+logging+device%22&conditions%5Bagencies%5D%5B%5D=federal-motor-carrier-safety-administration&conditions%5Btype%5D%5B%5D=PRORULE&conditions%5Btype%5D%5B%5D=RULE&conditions%5Bpublication_date%5D%5Bgte%5D=2022-01-01&fields%5B%5D=title&fields%5B%5D=document_number&fields%5B%5D=publication_date&fields%5B%5D=type&fields%5B%5D=citation&per_page=40), no proposed rule after the 2022 ANPRM
- [FMCSA documents, May to November 2026 (Federal Register API)](https://www.federalregister.gov/api/v1/documents.json?conditions%5Bagencies%5D%5B%5D=federal-motor-carrier-safety-administration&conditions%5Bpublication_date%5D%5Bgte%5D=2026-05-01&per_page=100&order=newest&fields%5B%5D=title&fields%5B%5D=document_number&fields%5B%5D=publication_date&fields%5B%5D=type), the September 30, 2026 ELD exemption application notice

**Agencies**

- [FMCSA: Revoked ELDs, 12 devices (May 20, 2026)](https://eld.fmcsa.dot.gov/File/OpenKey/REVOKED_ELDs_12_ELDs_May20_2026), the removal, the 60-day replacement before July 20, 2026, the 395.8(a)(1) violation and out-of-service, and reinstatement after fixes
- [FMCSA: Revoked devices list](https://eld.fmcsa.dot.gov/List/Revoked), revoked and self-revoked devices by date, with entries dated November 12, 2026

**Vendors**

- [Geotab: DutyStatusLog](https://developers.geotab.com/myGeotab/apiReference/objects/DutyStatusLog), event types and codes, record statuses, parent IDs, edit requests, engine hours, odometer and malfunction flags
- [Geotab: DutyStatusAvailability](https://developers.geotab.com/myGeotab/apiReference/objects/DutyStatusAvailability), the clock object
- [Motive: List the HOS logs of the drivers](https://developer.gomotive.com/reference/list-the-hours-of-service-hos-logs-of-the-drivers), `v1/logs`, events, manual flag and driver signature
- [Motive: List company drivers with Hours of Service](https://developer.gomotive.com/reference/fetch-a-list-of-company-drivers-with-hours-of-service-hos), `v1/hours_of_service` and its durations
- [Samsara: Get HOS logs](https://developers.samsara.com/reference/gethoslogs), log entries, status types and upload delay
- [Samsara: Get HOS clocks](https://developers.samsara.com/reference/gethosclocks), the clocks endpoint and the ELD compliance scope
