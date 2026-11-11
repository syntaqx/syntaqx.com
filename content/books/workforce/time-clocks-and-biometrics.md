+++
title = "Clocks, Kiosks, Geofences & Biometrics"
nav_title = "Clocks & Biometrics"
description = "Capturing punches: clocks, kiosks, mobile and geofenced punches, buddy punching, offline clocks, and biometric clocks under BIPA and other state laws."
category = "Workforce Industry"
order = 2628
part = "Time and Wage-Hour"
tags = ["payroll", "timekeeping", "biometrics", "bipa", "geofencing", "privacy"]
+++

A punch is a claim: this worker, at this time, at this place, started or stopped work. The capture device decides how much of that claim the employer can prove. A paper card in a mechanical clock proves a time and nothing else. A PIN on a shared tablet proves someone knew the PIN. A photo at the kiosk proves who stood there; a fingerprint or face template proves it better and turns the time clock into a store of biometric identifiers under Illinois law, where a single negligent violation is worth $1,000. A phone punch adds a location, which is evidence of where the phone was, not where the worker was, and a geofence that blocks a punch can create the off-the-clock work it was meant to prevent.

This chapter covers capture methods across vendors, identification at the clock, buddy punching and the controls against it, mobile and geofenced punches, offline clocks, biometric clocks under the Illinois Biometric Information Privacy Act (including the 2024 amendment and *Clay v. Union Pacific*), the Texas, Washington, Colorado and New York rules, and consent and retention design. What a punch means once captured (the workweek, hours worked, rounding and edits) is in [The Workweek & the Time Record](/books/workforce/time-and-attendance); punches derived from job status in field service are in Field Operations' [Time Tracking](/books/field-operations/technician-app#time-tracking); employee monitoring beyond the time clock is in Workplace & Collaboration's [Employee Monitoring & Privacy](/books/workplace-and-collaboration/employee-monitoring-and-privacy#united-states). This is a description of the rules for engineers, not legal advice.

## How the Platforms Do It

Clocks are a product line of their own: wall terminals, shared-tablet kiosks, mobile apps and point-of-sale clock-ins. Public documentation, as of November 2026:

| Platform | Capture | Identification | Location | Offline and other controls |
| --- | --- | --- | --- | --- |
| **Clockify** | Shared-device kiosk "from any browser," mobile and web timers | "4-digit PIN, 6-digit PIN, or QR code"; optional photo "when clocking in, going on break, or clocking out," admin-enabled, with the user's agreement before the first capture | Mobile only: points at timer start and stop and when the user moves "usually >500m"; "Location cannot be tracked without user knowledge/permission"; "Data older than 7 days is automatically deleted forever" | No geofence feature |
| **Deputy** | iPad kiosk and mobile app | Kiosk photo stored as a reference on the timesheet | Geo records with latitude, longitude and accuracy; a timesheet `ValidationFlag` for cases such as "clocked in far away" | |
| **Harri** | Clocks and mobile | "Biometric time clocks" | "geofenced mobile clock-in" | "offline support" |
| **Homebase** | Mobile, kiosk and point-of-sale integrations | "Photo capture at clock-in" on shared devices only, not personal phones | "GPS & geofencing" | "Kiosk & offline modes"; "early clock-in prevention" |
| **Rippling** | Time entries from its own clock and integrations | Kiosk badge endpoints in the timeclock API | | An `idempotency_key` on time entries from external systems |
| **Square** | Point-of-sale clock-in creating a `Timecard` | Team member sign-in at the register | Local time computed "based on the timecard location" | One open timecard per team member |
| **Toast** | Point-of-sale clock-in creating a `TimeEntry` | Employee sign-in at the terminal | | `autoClockedOut` at the end of the business day |
| **When I Work** | Terminal on a shared device, mobile app | Terminal users identify "by entering their email addresses or employee IDs" | | |

The spread runs from identity by knowledge (a PIN, an email) through identity by possession (a badge, a QR code, a personal phone) to identity by the body (a photo, a face, a fingerprint). Location ranges from none, through a recorded point (Clockify, Deputy), to a geofence that flags or blocks (Harri, Homebase). And only one vendor documents a consent step in its public help: Clockify asks the user to agree before the first photo. No vendor whose documentation I could reach publishes the geofence radius as an API field.

## Capture Methods

| Method | What it proves | Typical weaknesses |
| --- | --- | --- |
| **Wall clock with badge or card** | A badge was presented at a fixed device | Badges are shared; no proof of who held it |
| **Shared kiosk with PIN or QR** | Someone entered the PIN or showed the code at the device | PINs and codes are shared; kiosks can be offline |
| **Kiosk with photo** | A face was in front of the device, reviewable later | Review is manual unless faces are matched; photos are personal data |
| **Kiosk or clock with face or fingerprint matching** | The enrolled person presented their body | Biometric law (below); enrollment failures; alternate method needed |
| **Mobile app** | The worker's phone, at a reported location and time | Location spoofing and drift; device clocks can be wrong; personal phones raise expense and privacy questions |
| **Web punch** | A logged-in session at a time | No location or presence proof |
| **Point-of-sale clock-in** | A register login | Shared logins at busy terminals |
| **Derived from job status** | The worker tapped "arrive" or "complete" on a job | Gaps between jobs aren't punches; drive and wait time need their own kinds |

Most employers mix them: a kiosk at the store, mobile for drivers and field staff, web for office hourly workers. The time record needs to know which method produced each punch, because the method is the evidence. In the core model that is `time_entries.source` and `source_device`; [The Workweek & the Time Record](/books/workforce/time-and-attendance#how-to-build-it) adds `raw_punches` with the device, location and an idempotency key, and this chapter adds the devices and fences themselves.

## Buddy Punching

Buddy punching is one worker clocking in for another, and its defenses are the identification methods above, each with a cost:

- **Something you know** (PIN) is cheap and defeated by sharing.
- **Something you have** (badge, phone) is defeated by lending, though a personal phone is lent less often than a badge.
- **A photo** deters more than it prevents: someone has to look, or a matcher has to compare. Photos at shared devices only, as Homebase does, keeps cameras off personal phones.
- **A face or fingerprint match** prevents most of it and brings biometric law with it.

The control that works without any of these is the schedule. A punch that doesn't match a scheduled shift, a worker on two punches at once, or a clock-in at a location the worker isn't assigned to are exceptions a manager resolves, and early clock-in prevention (Homebase's term) keeps workers from starting the clock long before a shift without blocking legitimate work. The rule to hold onto from the hours-worked side: work an employer suffers or permits is paid, so a control that stops a punch doesn't stop the obligation if the work happened anyway. A manager who sees a worker on the floor at 8:45 and a kiosk that refused the punch until 9:00 owes the fifteen minutes.

## Mobile and Geofenced Punches

A mobile punch adds a location, and the location is a measurement with an error bar ([A Position Is a Measurement](/docs/building-blocks/location-tracking#a-position-is-a-measurement)). Deputy's API stores accuracy beside latitude and longitude for exactly that reason. A geofence turns the measurement into a yes or no, and the fence's size and shape decide how often the answer is wrong ([Fence Size and Shape](/docs/building-blocks/location-tracking#fence-size-and-shape)): too small and workers inside a large building fail, too large and the parking lot across the street passes.

Two policies are common:

- **Flag.** The punch is accepted and marked outside the fence, for a manager to review. Deputy's "clocked in far away" validation flag is this pattern.
- **Block.** The punch is refused outside the fence.

My default is flag, not block. A blocked punch from a worker who is in fact at work (GPS drift indoors, a large campus, a job site that moved) doesn't stop the work; it stops the record of it, and the worker who keeps working until the phone agrees is working off the clock. Blocking is defensible only with a fallback the worker can always use (a kiosk, a manager punch with a reason), and the fallback rate should be watched.

Location also raises privacy and retention questions on its own. Clockify's public commitments are a good template: track only at punch events and significant movement, never without the user's knowledge, and delete old points automatically (seven days in its case). For a time clock, the location that matters is the one at the punch, stored with the punch for the time record's retention; continuous tracking between punches is monitoring, with the consent and disclosure duties in [Consent, Law and Retention](/docs/building-blocks/location-tracking#consent-law-and-retention) and the Workplace & Collaboration volume.

## Offline Clocks

Kiosks lose connectivity and phones go underground, and every serious clock product buffers punches locally (Homebase's "offline modes," Harri's "offline support"). Three rules keep an offline clock honest:

- **Each punch carries an idempotency key** made of the device ID and a local sequence, so a replayed batch never creates duplicate punches ([The Device Outbox](/docs/building-blocks/offline-sync#the-device-outbox)).
- **Each punch carries two times**, the device's claimed time and the server's receipt time, because a device clock can be wrong or changed ([Two Clocks](/docs/building-blocks/offline-sync#two-clocks)). A large gap between them is an exception, not an automatic correction.
- **Conflicts are exceptions.** A worker who punched in on an offline kiosk and then on a phone has two "in" punches; the time system keeps both and asks, rather than picking one ([Conflicts: Choosing Who Wins](/docs/building-blocks/offline-sync#conflicts-choosing-who-wins)).

## Biometric Clocks and Illinois BIPA

The Illinois Biometric Information Privacy Act (740 ILCS 14) is the reason biometric clocks are a legal topic. It defines a "biometric identifier" as "a retina or iris scan, fingerprint, voiceprint, or scan of hand or face geometry," and "biometric information" as "any information, regardless of how it is captured, converted, stored, or shared, based on an individual's biometric identifier used to identify an individual." A finger-scan clock that stores a template collects both.

Section 15(b) sets the consent rule: "No private entity may collect, capture, purchase, receive through trade, or otherwise obtain a person's or a customer's biometric identifier or biometric information, unless it first" (1) informs the subject "in writing that a biometric identifier or biometric information is being collected or stored," (2) informs them "in writing of the specific purpose and length of term for which a biometric identifier or biometric information is being collected, stored, and used," and (3) "receives a written release executed by the subject." Section 15(a) requires a "written policy, made available to the public, establishing a retention schedule" and guidelines for permanently destroying the data. <!-- source-gap: wf-bipa-15a-timing | secondary | BIPA 15(a) destruction timing (when the initial purpose is satisfied or within 3 years of the last interaction) | closes with: 740 ILCS 14/15 text from ilga.gov (certificate error on Nov 9-10, 2026) | checked: 2026-11-10 --> The statute's exact destruction deadline wasn't reachable on the state's site when this was written, so check section 15(a) for it. The phrase "receive through trade, or otherwise obtain" matters for clock vendors: the vendor that hosts templates for an employer is a private entity that obtains them too.

Section 20 gives "Any person aggrieved by a violation" a private right of action, with "liquidated damages of $1,000 or actual damages, whichever is greater" for a negligent violation and "$5,000 or actual damages" for an intentional or reckless one, plus fees. Three decisions and one amendment shaped what that is worth:

- ***Rosenbach v. Six Flags*, 2019 IL 123186 (January 25, 2019).** "an individual need not allege some actual injury or adverse effect, beyond violation of his or her rights under the Act, in order to qualify as an 'aggrieved' person." A missing release is enough.
- ***Cothron v. White Castle*, 2023 IL 128004.** A claim accrues each time an entity collects or transmits a biometric identifier, so every scan is a violation; the court acknowledged the risk of "annihilative liability" and left the fix to the legislature.
- **The 2024 amendment (SB 2979, signed August 2, 2024, effective immediately).** Repeated collection or disclosure of "the same biometric identifier or biometric information from the same person using the same method of collection" is a single violation with one recovery, and consent may be given by "electronic signature," now a defined term.
- ***Clay v. Union Pacific Railroad*, No. 25-2185 (7th Cir. April 1, 2026).** The Seventh Circuit held the amendment remedial, so it applies to cases pending when it was enacted, reasoning that it changed section 20's damages and not section 15's duties; several trial courts had held it prospective only.

### Worked Numbers: Per Scan Against Per Person

An invented employer in Illinois with 200 hourly employees uses a finger-scan clock with no written release, four scans a day (in, meal out, meal in, out), 250 days a year, for three years.

| Theory | Count | Negligent ($1,000) | Reckless ($5,000) |
| --- | --- | --- | --- |
| Per scan (*Cothron*, before the amendment) | 200 × 4 × 250 × 3 = 600,000 scans | $600,000,000 | $3,000,000,000 |
| Per person (the 2024 amendment, applied retroactively in the Seventh Circuit) | 200 people | $200,000 | $1,000,000 |

The first row is the exposure per-scan accrual created; the second is what the amendment leaves. Either way, the release that would have prevented it costs a screen and a signature at enrollment.

## Other States

Other states regulate biometric collection with different triggers and remedies:

| Jurisdiction | Rule |
| --- | --- |
| **Texas** (Bus. & Com. Code 503.001) | Consent before capturing a biometric identifier for a commercial purpose; no sale; destroy within a reasonable time, no later than the first anniversary of the date the purpose expires, with an exception tied to employment; the attorney general enforces, with a civil penalty of up to $25,000 per violation |
| **Washington** (RCW 19.375.020) | No enrolling a biometric identifier in a database for a commercial purpose without notice, consent, or a mechanism to prevent later commercial use; no sale or disclosure without consent except listed cases; keep only as long as reasonably necessary; new consent for a materially inconsistent use; nothing requires notice and consent for a "security purpose" |
| **Colorado** (HB24-1130, signed May 31, 2024, effective July 1, 2025) | Restricts an employer's permissible reasons for obtaining an employee's consent to biometric collection; a written policy that "Establishes a retention schedule" with deletion guidelines and "a protocol for responding to a data security incident" |
| **New York** (Labor Law 201-a) | "no person, as a condition of securing employment or of continuing employment, shall be required to be fingerprinted," except as provided by law and for listed public and hospital employers |

New York's rule is the one a time system most often trips over without noticing: a finger-scan clock that an employee can't opt out of is a fingerprint requirement. A face or photo clock, or a finger-scan clock with a PIN or badge alternative, is the usual design. <!-- source-gap: wf-ny-201a-templates | missing | Whether New York treats a finger-scan template (not a full print) as being "fingerprinted" under Labor Law 201-a | closes with: a NY DOL opinion letter or court decision on finger-scan time clocks | checked: 2026-11-10 --> Whether a stored template rather than an image counts as being "fingerprinted" isn't settled in a source I could find, so I treat it as if it does.

## Consent and Retention Design

The rules above reduce to one design that satisfies all of them:

- **An alternative method for everyone.** Every biometric clock also accepts a PIN, badge or photo-only punch, chosen by the worker. That answers New York's rule, makes consent voluntary in substance, and gives a fallback when enrollment fails.
- **Consent before enrollment, per method and per vendor.** The worker sees a written notice of what is collected, the specific purpose (timekeeping and identity verification at the clock), the retention term and who holds it (the employer and the clock vendor by name), and signs, electronically where the law allows. The consent record keeps the notice's version, the signature and the time; a change of vendor or purpose is a new consent.
- **Templates, not images.** Store a vendor template that can't be reversed into a picture, encrypted, on the device or the vendor's service, never in the HR record and never in exports or the data warehouse ([Classify Every Field](/docs/security/sensitive-data#classify-every-field)).
- **A public retention policy with a computed destruction date.** The purpose ends at termination; the destruction date is computed from the termination date and the strictest applicable rule, and a job deletes the template from every device and service and records that it did. A legal hold suspends it, recorded with its reason ([Retention Windows](/docs/building-blocks/data-retention#retention-windows)).
- **No secondary use.** The template matches punches. It doesn't unlock doors, feed analytics or train anything unless a new consent says so (Washington's "materially inconsistent" use).
- **The jurisdiction decides at enrollment.** A clock at an Illinois site prompts for the BIPA release; a New York site enforces the alternative; a Texas site applies the destruction clock. The rule set lives with the work location, effective-dated, like any other jurisdiction rule ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model) and the time record tables in [The Workweek & the Time Record](/books/workforce/time-and-attendance#how-to-build-it). Devices and fences hang off `work_locations`; consents are `documents` with a structured row beside them; templates are references to a vault, never the data.

```sql
CREATE TABLE clock_devices (               -- a wall clock, kiosk, POS terminal or enrolled phone
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  employer_id         UUID NOT NULL REFERENCES employers (id),
  work_location_id    UUID REFERENCES work_locations (id),   -- null for personal phones
  kind                TEXT NOT NULL CHECK (kind IN ('wall_clock', 'kiosk', 'pos', 'mobile',
                        'web')),
  identification      TEXT[] NOT NULL,       -- {'pin','badge','qr','photo','face','finger'}
  vendor              TEXT,                  -- the clock vendor that processes punches
  offline_capable     BOOLEAN NOT NULL DEFAULT FALSE,
  last_clock_skew_s   INT,                   -- device time minus server time at last sync
  status              TEXT NOT NULL CHECK (status IN ('active', 'retired')),
  valid_during        DATERANGE NOT NULL
);

CREATE TABLE geofences (                   -- where a mobile punch is expected
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  work_location_id    UUID NOT NULL REFERENCES work_locations (id),
  shape               TEXT NOT NULL CHECK (shape IN ('circle', 'polygon')),
  center              POINT,                 -- for circles
  radius_m            INT,                   -- for circles
  polygon             JSONB,                 -- GeoJSON for polygons
  policy              TEXT NOT NULL DEFAULT 'flag' CHECK (policy IN ('flag', 'block')),
  fallback            TEXT NOT NULL DEFAULT 'manager_punch',   -- what a blocked worker can do
  valid_during        DATERANGE NOT NULL
);

ALTER TABLE raw_punches
  ADD COLUMN identification_used TEXT,       -- the method this punch was verified by
  ADD COLUMN photo_document_id   UUID REFERENCES documents (id),
  ADD COLUMN biometric_match     NUMERIC(4, 3),   -- the matcher's score, if any
  ADD COLUMN geofence_id         UUID REFERENCES geofences (id),
  ADD COLUMN geofence_result     TEXT,
  ADD COLUMN location_accuracy_m INT,
  -- NOT VALID: new rows checked now; validate after any backfill, without blocking writes
  ADD CONSTRAINT raw_punches_geofence_result_check
    CHECK (geofence_result IN ('inside', 'outside', 'unknown')) NOT VALID;

CREATE TABLE biometric_consents (          -- the written release, per method and vendor
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  modality            TEXT NOT NULL CHECK (modality IN ('face', 'finger', 'hand', 'iris',
                        'voice', 'photo')),
  vendor              TEXT NOT NULL,
  jurisdiction_id     UUID REFERENCES tax_jurisdictions (id),   -- the rule set applied
  notice_document_id  UUID NOT NULL REFERENCES documents (id),  -- the notice as shown
  notice_version      TEXT NOT NULL,
  purpose             TEXT NOT NULL,         -- 'timekeeping_identity'
  retention_term      TEXT NOT NULL,         -- as stated in the notice
  decision            TEXT NOT NULL CHECK (decision IN ('granted', 'declined', 'withdrawn')),
  signature_method    TEXT CHECK (signature_method IN ('wet', 'electronic')),
  decided_at          TIMESTAMPTZ NOT NULL,
  alternative_method  TEXT                   -- what the worker uses instead, if declined
);

CREATE TABLE biometric_templates (         -- a pointer to the template, never the template
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID NOT NULL REFERENCES workers (id),
  consent_id          UUID NOT NULL REFERENCES biometric_consents (id),
  vault_ref           TEXT NOT NULL,         -- the vendor or vault key
  enrolled_at         TIMESTAMPTZ NOT NULL,
  enrolled_device_id  UUID REFERENCES clock_devices (id),
  destroy_by          DATE,                  -- computed when the purpose ends
  legal_hold_id       UUID,                  -- suspends destruction
  destroyed_at        TIMESTAMPTZ,
  destruction_evidence JSONB                 -- per device and service: deleted, when, by what
);

CREATE TABLE biometric_rules (             -- per jurisdiction, effective-dated
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction_id     UUID NOT NULL REFERENCES tax_jurisdictions (id),
  requires_written_release BOOLEAN NOT NULL,
  requires_alternative     BOOLEAN NOT NULL,   -- New York's fingerprint rule
  destroy_after_purpose    INTERVAL,           -- the strictest stated limit
  public_policy_required   BOOLEAN NOT NULL,
  valid_during        DATERANGE NOT NULL
);
```

Enrollment checks `biometric_rules` for the device's work location, refuses to capture without a `granted` consent where one is required, and never makes biometric the only method on a device at a location where `requires_alternative` is true. Termination sets `destroy_by` on every template the worker has; a daily job destroys what's due and isn't on hold, and writes the evidence per device. A punch records which method verified it, so a dispute over "was that really me" has an answer.

Design notes:

- **Flag by default, block only with a fallback** that's always available, and watch the fallback rate by location.
- **A consent is per modality and per vendor,** because the notice names both, and a new vendor is a new disclosure.
- **The template never leaves the vault,** and nothing outside the clock system has a column that could hold it.
- **Location is stored at the punch,** with its accuracy, for the time record's retention; continuous tracking is a different feature with different consent.

## Auditing

The records that answer a BIPA suit, a state inquiry or a buddy-punching investigation:

- **Every consent as given,** with the notice version shown, the signature, the time, the vendor and the jurisdiction rule applied, and every declined or withdrawn consent with the alternative used.
- **Every template's life,** from enrollment to destruction, with destruction evidence from each device and service and any hold that delayed it.
- **The public retention policy's versions** and when each was published.
- **Every punch's verification method, location, accuracy and geofence result,** and every blocked punch with the fallback taken.
- **Device clock skew and offline replays,** so a late-arriving punch can be explained.

## What This Means for the System You Build

- **Record the capture method and verification on every punch,** because the method is the evidence.
- **Flag punches outside a geofence instead of blocking them,** or block only with a fallback the worker can always use.
- **Give every punch an idempotency key and two clocks** so offline devices can't duplicate or invent time.
- **Never make a biometric the only way to punch,** and never capture one before a written release where the law requires it.
- **Name the vendor and purpose in the consent,** and treat a new vendor or use as a new consent.
- **Compute a destruction date for every template when its purpose ends,** destroy it everywhere and keep the evidence.
- **Keep the jurisdiction's biometric rules as effective-dated data** on the work location, applied at enrollment.

## References

**Law and regulation**

- [Texas Business and Commerce Code chapter 503](https://statutes.capitol.texas.gov/Docs/BC/htm/BC.503.htm), section 503.001 consent, no sale, destruction by the first anniversary of the purpose expiring, and the $25,000 civil penalty
- [RCW 19.375.020: Enrollment, disclosure, and retention of biometric identifiers](https://app.leg.wa.gov/RCW/default.aspx?cite=19.375.020), notice, consent or a mechanism, disclosure limits, retention and the security purpose exception
- [Colorado General Assembly: HB24-1130, Privacy of Biometric Identifiers & Data](https://leg.colorado.gov/bills/hb24-1130), signed May 31, 2024, effective July 1, 2025, employer consent limits, retention schedule and incident protocol
- [New York Labor Law 201-a: Fingerprinting of employees prohibited](https://www.nysenate.gov/legislation/laws/LAB/201-A), the condition-of-employment ban and its exceptions

**Courts and enforcement**

- [Supreme Court of Illinois: Rosenbach v. Six Flags Entertainment Corp., 2019 IL 123186 (PDF)](https://www.illinoiscourts.gov/Opinions/SupremeCourt/2019/123186.pdf), the BIPA definitions, the section 15(b) text, section 20 damages and no actual injury required
- [Sidley Data Matters: Seventh Circuit limits potential damages under BIPA, holds 2024 amendment applies retroactively](https://datamatters.sidley.com/2026/04/08/seventh-circuit-limits-potential-damages-under-bipa-holds-2024-amendment-applies-retroactively/), Clay v. Union Pacific (No. 25-2185, April 1, 2026), Cothron v. White Castle and the single-violation amendment (law firm summary)
- [Davis Wright Tremaine: Illinois revises biometrics law to reduce the prospect of ruinous damage awards](https://dwt.com/blogs/privacy--security-law-blog/2024/08/illinois-bipa-biometrics-law-amended-for-damages), the public retention policy, the August 2, 2024 signing, the single-violation rule and electronic signatures (law firm summary)

**Agency guidance and forms**

- [DOL WHD: Fact Sheet 22, Hours worked under the FLSA](https://www.dol.gov/agencies/whd/fact-sheets/22-flsa-hours-worked), suffered or permitted work is work time whatever the reason

**Vendor documentation**

- [Clockify: Track time on kiosk](https://clockify.me/help/track-time-and-expenses/track-time-on-kiosk), PIN and QR identification and photo capture with the user's agreement
- [Clockify: GPS tracking](https://clockify.me/help/track-time-and-expenses/gps-tracking), points at start, stop and movement, permission, and seven-day deletion
- [Deputy: Timesheet](https://developer.deputy.com/docs/timesheet.md), the kiosk photo reference and validation flags
- [Deputy: Geo](https://developer.deputy.com/reference/listgeo-1.md), latitude, longitude and accuracy
- [Harri: Manage](https://harri.ai/manage/), biometric clocks, geofenced mobile clock-in and offline support
- [Homebase: Time clock](https://joinhomebase.com/time-clock/), GPS and geofencing, photo capture on shared devices, kiosk and offline modes, early clock-in prevention
- [Rippling: Time getting started](https://developer.rippling.com/documentation/rest-api/guides/time-getting-started.md), kiosk badge endpoints
- [Square: Build with the Labor API](https://developer.squareup.com/docs/labor-api/build-with-labor), one open timecard and local time from the location
- [Toast: TimeEntry schema](https://doc.toasttab.com/openapi/labor/tag/Data-definitions/schema/TimeEntry/), automatic clock-out
- [When I Work: Setting up a time clock terminal](https://help.wheniwork.com/articles/setting-up-a-time-clock-terminal/), identification by email or employee ID
