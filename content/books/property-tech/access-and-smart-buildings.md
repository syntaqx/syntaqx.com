+++
title = "Access, Smart Buildings & Parking"
nav_title = "Access & Smart Buildings"
description = "Smart locks and access control tied to the lease, sensors and smart devices, packages, parking and towing law, and the privacy rules on resident access data."
category = "Property Tech Industry"
order = 1723
part = "Operations"
tags = ["property-tech", "access-control", "smart-home", "iot", "parking", "privacy"]
+++

A key used to be a piece of brass the leasing office cut, handed over at move-in and asked for back at move-out. In a building with smart locks, cloud access control, a video intercom, package lockers and a gated garage, the key is a row in someone's database: a credential that opens a set of doors for a period, issued because a lease, a work order or a tour justified it, and logged every time it's used. That makes access a property-management record like any other. It has to start the day the lease says the household moves in, stop the day it says they leave, cover the maintenance technician only for the window the entry notice gave, and produce a log that's evidence in a lockout, a burglary or an eviction. It also makes it personal data: when a resident comes home, which door they used and whose face the intercom saw are exactly the facts a growing set of laws restricts.

This chapter covers the operations layer between the resident and the building: smart locks and access control, sensors and smart devices, packages, parking and towing, and the privacy rules that apply to all of it. The hardware is bought, not built; what the platform owns is the link between the lease and the device, and the records that prove who could open what, when. Self-guided tour codes belong to [Leads, CRM, Tours & the Leasing Center](/books/property-tech/leads-crm-and-tours#self-guided-tours); the entry rules a technician follows are in [Maintenance & Work Orders](/books/property-tech/maintenance-and-work-orders#entry-notice); managed Wi-Fi as a revenue line belongs to [Resident Financial Products & Ancillary Revenue](/books/property-tech/resident-financial-products#bulk-internet-and-managed-wi-fi).

## How the Platforms Do It

The suites integrate hardware rather than make it, and the access vendors integrate with every suite:

| Vendor | Kind | What its public pages describe |
| --- | --- | --- |
| **Brivo** | Cloud access control | Multifamily edition with integrations to Yardi, RealPage, Rent Manager and Entrata "to automate resident credential provisioning and move-in/out workflows"; mobile, physical, PIN and opt-in face-matching credentials |
| **ButterflyMX** | Video intercom, package rooms | Smartphone entry and video intercom, package rooms integrated with visitor entry; integrations with Yardi, RealPage, Entrata and Rent Manager |
| **DOOR** (formerly Latch) | Smart locks, intercom, readers | Unit locks, a smart intercom with "video, remote unlock, and real-time alerts," readers for common areas, integrations with Yardi, RealPage, Entrata and AppFolio; Latch hardware "continues to be fully supported" |
| **Entrata** (Access Connect) | Suite integration | Connects Entrata to smart locks for "a one-app & keyless entry experience"; residents "unlock their door with the push of a button" in the resident app; listed partners Brivo, PDK, SALTO KS, ButterflyMX and Igloo |
| **Luxer One** | Package lockers and rooms | Carriers scan each package and "the system notifies the resident"; refrigerated compartments; integrations with Yardi, Entrata and RealPage |
| **RealPage** (Smart Building, STRATIS IoT) | Suite-owned IoT layer | "Vendor-agnostic smart devices including locks, thermostats, lighting, leak sensors and submeters" from one dashboard; partner categories for managed Wi-Fi, smart access, self-guided touring, common-area access, IoT and smart meters |
| **SALTO** | Locks and access platforms | Cloud access (SALTO KS, and Homelok for residential) a data-on-card system (SALTO Space), and wire-free networked locks |
| **SmartRent** | Smart-community platform | Hub devices using Z-Wave to control third-party devices; cloud access control for building entry with temporary codes, visitor logs and door alerts; leak, parking, contact and motion sensors; community Wi-Fi; integrations with Yardi, Entrata, RealPage and Engrain. 890,870 units deployed at December 31, 2025 (10-K) |

Three patterns run through the list. **The property management system is the source of truth for who lives where,** and every access vendor advertises integrations to the same handful of suites so that move-ins and move-outs provision and revoke credentials without a person typing them twice. **One credential, many systems:** a resident's phone may open a SALTO unit lock, a Brivo garage gate and a ButterflyMX intercom, each with its own cloud, its own identifiers and its own log. **The suite is a broker, not the controller:** none of the suites in this market publicly describes making locks; they hold the lease and push grants to the systems that do, which is why the hard problems are synchronization and revocation, not cryptography.

## Smart Locks and Access Control

An access system answers one question at the door: does this credential open this access point now? The platform's job is to make the answer follow the lease.

**Access points** are the things that open: unit doors, building entries, gates, garage doors, elevators, amenity rooms, package rooms, locker banks. Each belongs to a property and, for unit doors, to a unit; parking garages and storage cages map to [rentable spaces](/books/property-tech/property-business#the-core-data-model). **Credentials** are what opens them: a mobile key, a fob or card, a PIN, a biometric template, or a physical key that's still tracked because it's still a key.

**A credential is issued for a reason, and the reason sets its life.** The reasons are few:

| Purpose | Justified by | Valid for | Revoked when |
| --- | --- | --- | --- |
| Resident | A lease member who lives there | The lease's occupancy, from move-in | Move-out, or the member leaving the lease |
| Work order | A work order and its entry notice | The entry window the notice gave | Work order completed or window closed |
| Vendor | An approved vendor on a job | The job's dates | Job closed or vendor suspended |
| Staff | An employee's role at the property | Employment at that property | Transfer or termination |
| Guest or delivery | A resident's or staff member's invitation | Hours or days | Expiry |
| Tour | A verified prospect's booking | The tour slot | Expiry; the tour's `tour_access_grants` row points at the credential |

The life-cycle events from [the core model](/books/property-tech/property-business#the-core-data-model) drive it: `lease.moved_in` issues credentials for every leaseholder and occupant old enough to hold one, a change in `lease_members` adds or removes a person mid-lease, and `lease.moved_out` revokes everything tied to the lease ([Keys & Access](/books/property-tech/move-in-and-move-out#keys-access) covers the handover). My rule: **no credential without a purpose record, and no purpose record that outlives its credential.** A fob issued at the desk with no lease behind it is how former residents, ex-partners and fired employees keep getting in.

**Revocation is the hard direction.** Issuing a credential that doesn't sync is a support call; a revocation that doesn't sync is a security incident. Vendor clouds accept a revoke and propagate it to locks on their own schedule, and offline and data-on-card locks only learn about it when a credential with fresh data touches a reader. The platform keeps each credential's sync state (pending, active, revoke pending, revoked, failed), retries failed revocations with backoff, and raises an alert when a revocation hasn't confirmed by the time the next household's move-in is scheduled. The turn checklist in [Make-Ready Turns](/books/property-tech/maintenance-and-work-orders#make-ready-turns) includes "all credentials for the prior lease confirmed revoked," the electronic version of rekeying.

Rekeying is also law. Texas requires a landlord to rekey security devices "not later than the seventh day after each tenant turnover date," at the landlord's expense, and to rekey again at the tenant's expense on request; the same subchapter lists the devices every dwelling needs (a keyed dead bolt or doorknob lock and a keyless bolting device and door viewer on each exterior door, latches on exterior windows, pin locks on sliding doors). California requires a landlord to change locks within 24 hours of a written request from a tenant protected by a qualifying order or report against someone who isn't a tenant of the unit, and lets the tenant change them and be reimbursed within 21 days if the landlord doesn't. Both are deadlines with a start event, so the platform computes and stores them ([Deadlines Are Computed and Stored](/docs/architecture/rules-as-data#deadlines-are-computed-and-stored)) and resolves which applies from the property's jurisdiction ([Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law)). Whether revoking and reissuing an electronic credential satisfies a statute written for keyed locks is a question for legal review in each state, not an assumption to bake into code.

**Staff and vendor entry is still entry.** Staff and vendor holders are platform users, scoped to properties by their grants ([Users, Roles and Grants](/books/property-tech/platform-architecture#users-roles-and-grants)). A smart lock makes it trivial to open a unit remotely, which is exactly why the entry-notice rules matter more, not less. A work-order credential is valid only inside the entry window recorded on the work order's notice, and its use is logged against that work order ([Entry Notice](/books/property-tech/maintenance-and-work-orders#entry-notice)). New York City's Tenant Data Privacy Act goes further: an owner can't require a tenant to use the smart access system to enter their own unit. The technician's side of the visit (arrival, proof, photos) is [Proof of Service](/books/field-operations/proof-of-service).

**Access logs are evidence.** Entries, denials, forced doors and doors held open are append-only events with the credential, the access point and the time the lock or reader reported them (which may be hours after the fact for an offline lock). They answer the questions that come later: did the former roommate get in after the lockout, did the technician enter outside the notice window, was the package room opened at 2 a.m. They're also the most sensitive data in this chapter, which [Resident Privacy](#resident-privacy) covers.

## Sensors and Smart Devices

Beyond locks, the in-unit and common-area devices a platform sees are thermostats, leak sensors, hubs, lighting, submeters, parking sensors and cameras. RealPage's page lists locks, thermostats, lighting, leak sensors and submeters on one dashboard; SmartRent's 10-K lists leak, parking, contact and motion sensors used "to proactively monitor and protect properties," with Z-Wave hubs controlling third-party devices.

What the property platform does with them:

- **Leak and temperature alerts become work orders.** A leak sensor's alert is triaged like any emergency request ([Triage and Priority](/books/property-tech/maintenance-and-work-orders#triage-and-priority)), with the device, the unit and the alert time attached. Alerts that fire in vacant units are often the only way anyone finds out.
- **Vacant units are managed remotely.** Thermostat setpoints and lights in vacant and model units are set by the platform from unit status, and reverted at move-in so the household isn't billed for the operator's settings.
- **Device health is maintenance.** Offline hubs, low batteries and tampered sensors are alerts with an owner and an SLA, not dashboard noise; a leak sensor with a dead battery is a liability the operator believes it doesn't have.
- **Meter data feeds billing.** Submeter reads go to resident utility billing, which [Utilities & Energy](/books/property-tech/utilities-and-energy#resident-utility-billing) owns along with the law on submetering and billing.

The integration shape is the same as access: devices live in vendor clouds with their own identifiers, the platform keeps a crosswalk ([Crosswalks of External IDs](/docs/architecture/record-linkage#crosswalks-of-external-ids)), and alerts arrive by webhook or polling ([Webhooks](/docs/api-design/webhooks)). Device control (unlock, setpoint) is a command with an actor and a reason, recorded in the [audit trail](/docs/architecture/audit-trails#typed-actors) like any other change.

**Managed Wi-Fi** is the common-area network many smart buildings run on, and it's also a revenue line. RealPage's page says operators can "earn $50 to 70 per unit per month" from it while its FAQ gives "$50 to $79," which is a reminder that vendor revenue claims aren't data. The rules, briefly and as of October 2026: the FCC's February 2022 order bars providers from exclusive and graduated revenue-sharing agreements with owners of multiple tenant environments and requires providers to disclose exclusive marketing arrangements, while leaving ordinary bulk billing in place; a 2024 proposal to let tenants opt out of bulk billing was withdrawn in January 2025. The agreements, the revenue share and how the charge appears on the lease are [Resident Financial Products & Ancillary Revenue](/books/property-tech/resident-financial-products#bulk-internet-and-managed-wi-fi).

## Packages

Package volume turned a mailroom into a system. The pattern across vendors is the same: a carrier or staff member scans a package into a locker or room, the resident is notified, and the pickup is recorded. Luxer One's page describes carriers scanning barcodes after which "the system notifies the resident," refrigerated compartments for groceries and pharmacy orders, and integrations with the major suites; ButterflyMX pairs package rooms with visitor entry; Entrata's resident portal shows package pickup alerts.

The platform's part:

- **Match the package to a household,** not to a name string. Carrier labels carry whatever the sender typed; matching runs against current lease members and recent former residents, with a manual queue for misses ([Match Before Create](/docs/architecture/record-linkage#match-before-create)).
- **Notify through the consent ledger.** A package notice is a transactional message, sent on the channel the resident chose ([Communications and Consent](/books/property-tech/resident-experience#communications-and-consent)).
- **Enforce hold periods** as policy: a package not picked up within the property's window is returned or moved, and the resident is told before, not after.
- **Handle former residents.** Packages keep arriving after move-out; the move-out flow tells the household and the package system stops matching them after a grace period.
- **Charge only what was disclosed.** A locker fee is a mandatory or optional fee like any other; if it's mandatory it belongs in the advertised price, which [Listings, Websites & Marketing](/books/property-tech/listings-and-marketing#fee-transparency-and-all-in-pricing) and [Charges & Resident Ledgers](/books/property-tech/charges-and-resident-ledgers#the-charge-catalog) own.

Pickup records (who opened which locker, when) are access events and follow the same retention and privacy rules as door logs.

## Parking and Towing

Parking is two problems: who may park where, and what the operator may do about a car that shouldn't be there.

**Who may park.** A reserved space or garage is a [rentable space](/books/property-tech/property-business#the-core-data-model) on the lease's charge schedule, and the exclusion constraint in the core model already stops two households renting it at once. Unassigned parking is a permit: a vehicle registered to a household for a period, sometimes limited per unit, sometimes with guest passes. Entrata's resident app lists "manage vehicles"; RealPage's portal lists parking among reservable items; SmartRent's 10-K lists parking sensors. State law limits what a landlord may ask for: in Texas, a landlord of a multiunit complex may require only a vehicle's "make, model, color, year, license number, and state of registration" to allow parking, must give the parking and towing rules before the lease is signed in a paragraph titled "Parking" or "Parking Rules," and may not enforce a mid-lease rule change until the 14th day after written notice, except in a construction or utility emergency; a violation costs a $100 civil penalty plus the tenant's towing and storage costs.

**What happens to a car that shouldn't be there.** Towing from private property is regulated state by state and often city by city, and the rules are specific enough to model as data (`towing_notice` in [Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#the-rules-matrix)). California's Vehicle Code section 22658 is a representative set:

- **Signage** at every entrance, at least 17 by 22 inches with one-inch lettering, stating that public parking is prohibited, that vehicles will be removed at the owner's expense, and the phone numbers of the local traffic enforcement agency and each authorized towing company.
- **Notice periods** for other grounds: a vehicle cited with a notice of parking violation may be removed only after 96 hours, and one missing parts needed to operate safely only 24 hours after police are notified.
- **Written authorization** from the owner or lessee before removal, with the authorizing person present to verify the violation (with an exception for residential rentals of 15 or fewer units with no on-site staff, where a tenant's signed request for their own assigned space suffices), listing the vehicle's make, model, VIN and plate, the authorizer's name, signature and title, the grounds, when the vehicle was first observed and when authorization was given.
- **Police notice** within one hour of authorizing the tow.
- **Liability** of double the towing or storage charges for removing a vehicle without meeting the notice conditions.

The platform turns that into a workflow: a tow request records the vehicle, the grounds, when it was first seen and by whom, any notice served and when, the authorizing user, the time police were notified and the towing company; the rule evaluation that permitted it is stored with it ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)). A tow that the record can't justify shouldn't be authorizable in the product. Residents' own vehicles are the common case: a permit that lapsed because the household renewed and nobody re-registered the car is a platform bug that ends with a resident's car in an impound lot.

**License plate readers** change parking enforcement from patrols to a database, and some states regulate the database. California defines an automated license plate recognition operator as any person, including a corporation or LLC, that operates such a system, and requires reasonable security and a usage and privacy policy available to the public in writing and posted conspicuously on the operator's website. Plate reads are location data; they get the retention and access limits in the next section.

## Resident Privacy

Access and device data says when people come and go, who visits them, and when they're asleep. Three bodies of law reach it, and the platform should be built for the strictest because the same product serves every jurisdiction.

**Smart access laws.** New York City's Tenant Data Privacy Act (Local Law 63 of 2021) applies to owners of multiple dwellings using keyless entry such as fobs, apps or biometrics. As HPD summarizes it, owners must get express consent, in writing or through a mobile app, before collecting reference data; collect only what's needed (name, unit and accessible doors, preferred contact method, biometric identifiers if the system uses them, credential identifiers, lease move-in and move-out dates, and entry time and method "solely for security purposes"); use the data only for granting access, monitoring entrances and exits, managing common-area access or limiting entry times; never use location tracking outside the building; never use the data "to harass or evict a tenant"; not sell or disclose it except as the law allows; destroy authentication data "no later than 90 days after such data has been collected or generated" unless anonymized; and give tenants a plain-language privacy and retention policy. Unlawful sale carries a private right of action of $200 to $1,000 per tenant. SmartRent's 10-K names the Act among the laws its business is subject to, alongside the CCPA, CPRA, FTC Act Section 5, GDPR and PIPEDA.

**Biometric laws.** Face-matching readers, fingerprint locks and intercoms that recognize faces collect biometric identifiers. Illinois' Biometric Information Privacy Act requires notice of the purpose and term, a written release before collection, and a public written policy with a retention schedule and destruction guidelines, with liquidated damages of up to $1,000 per violation or $5,000 per intentional or reckless one. An August 2, 2024 amendment made repeated collection of the same identifier from the same person by the same method a single violation and confirmed that an electronic signature can be the written release; as of October 2026, the Seventh Circuit has held the amendment applies to cases pending when it was enacted. Brivo's "opt-in face-matching" is the design these laws push toward: biometrics as an alternative the resident chooses, never the only way in.

**General privacy laws.** State consumer privacy laws reach resident data generally; [Records, Privacy & Audits](/books/property-tech/records-privacy-and-audits#state-privacy-laws) owns them, along with retention schedules and requests to delete.

What that means in the product:

- **Collect per purpose.** Each credential carries its purpose, and its events are usable for that purpose. A query that pulls one resident's comings and goings is a sensitive access, logged as one ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Retain by type, per jurisdiction.** Raw authentication data, routine entry logs, logs under a legal hold, plate reads and biometric templates each get their own window, resolved as `record_retention` rules for the property's jurisdiction ([Retention and Legal Holds](/books/property-tech/records-privacy-and-audits#retention-and-legal-holds)).
- **Consent is a record.** Where consent is required, it's captured per person and per data type with the policy version shown, and withdrawal falls back to a non-biometric or physical credential without penalty.
- **No location beyond the building.** Mobile keys need proximity, not GPS history; keep the app from collecting what the law forbids using ([Consent, Law and Retention](/docs/architecture/location-tracking#consent-law-and-retention)).
- **Never feed eviction or screening.** Access data used against a resident in a lease dispute is exactly what New York City prohibits; my default is to wall it off from delinquency, eviction and screening workflows everywhere, and to release it only under legal process recorded in the audit trail.
- **Vendors are processors.** Each access, intercom and locker vendor holds resident data under a contract that limits its use and deletion; the vendor list and data flows are part of the privacy policy residents receive.

## How to Build It

The schema extends [the core model](/books/property-tech/property-business#the-core-data-model): access points hang off properties, units and rentable spaces; credentials reference people, leases and work orders; device alerts open work orders; parking extends rentable spaces and households; towing records the rule evaluation from [Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#how-to-build-it). Every table carries `tenant_id` under row-level security.

```sql
CREATE TABLE access_points (             -- doors, gates, readers, locker banks
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  property_id       UUID NOT NULL REFERENCES properties (id),
  building_id       UUID REFERENCES buildings (id),
  unit_id           UUID REFERENCES units (id),            -- set for unit doors
  rentable_space_id UUID REFERENCES rentable_spaces (id),  -- a garage, a storage cage
  kind              TEXT NOT NULL CHECK (kind IN ('unit_door', 'building_entry', 'gate',
                      'garage', 'elevator', 'amenity', 'package_room', 'locker_bank')),
  name              TEXT NOT NULL,
  vendor_system     TEXT NOT NULL,       -- which access cloud controls it
  external_id       TEXT NOT NULL,
  is_offline_capable BOOLEAN NOT NULL DEFAULT FALSE,  -- learns revocations late
  UNIQUE (tenant_id, vendor_system, external_id)
);

CREATE TABLE access_credentials (        -- issued for a purpose; dies with it
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  property_id     UUID NOT NULL REFERENCES properties (id),
  holder_person_id UUID REFERENCES people (id),  -- residents, guests
  holder_user_id  UUID REFERENCES users (id),    -- staff and vendor accounts (Platform Architecture)
  purpose         TEXT NOT NULL CHECK (purpose IN ('lease', 'work_order', 'vendor', 'staff',
                    'guest', 'delivery', 'tour')),
  lease_id        UUID REFERENCES leases (id),
  work_order_id   UUID REFERENCES work_orders (id),
  entry_notice_id UUID REFERENCES entry_notices (id),  -- the window a work-order key honors
  kind            TEXT NOT NULL CHECK (kind IN ('mobile', 'fob', 'card', 'pin', 'biometric',
                    'physical_key')),
  valid_during    TSTZRANGE NOT NULL,
  vendor_system   TEXT NOT NULL,
  external_id     TEXT,                  -- set once the vendor confirms
  sync_state      TEXT NOT NULL CHECK (sync_state IN ('pending', 'active', 'revoke_pending',
                    'revoked', 'failed')),
  revoked_at      TIMESTAMPTZ,
  revoke_reason   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((holder_person_id IS NULL) <> (holder_user_id IS NULL)),
  CHECK (purpose <> 'lease' OR lease_id IS NOT NULL),
  CHECK (purpose <> 'work_order' OR (work_order_id IS NOT NULL AND entry_notice_id IS NOT NULL)),
  CHECK (kind <> 'biometric' OR holder_person_id IS NOT NULL)
);

CREATE TABLE access_credential_points (  -- which doors a credential opens
  tenant_id       UUID NOT NULL,
  credential_id   UUID NOT NULL REFERENCES access_credentials (id),
  access_point_id UUID NOT NULL REFERENCES access_points (id),
  PRIMARY KEY (credential_id, access_point_id)
);

CREATE TABLE access_events (             -- append-only; the lock's word, not ours
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  property_id     UUID NOT NULL,
  access_point_id UUID NOT NULL REFERENCES access_points (id),
  credential_id   UUID REFERENCES access_credentials (id),  -- null for forced or unknown
  result          TEXT NOT NULL CHECK (result IN ('granted', 'denied', 'forced', 'held_open',
                    'remote_unlock')),
  occurred_at     TIMESTAMPTZ NOT NULL,  -- as the device reported it
  received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- offline locks report late
  vendor_event_id TEXT NOT NULL,
  UNIQUE (tenant_id, access_point_id, vendor_event_id)  -- webhooks redeliver
);

CREATE TABLE smart_devices (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  property_id   UUID NOT NULL REFERENCES properties (id),
  unit_id       UUID REFERENCES units (id),    -- null for common areas
  kind          TEXT NOT NULL CHECK (kind IN ('hub', 'thermostat', 'leak_sensor', 'lock',
                  'submeter', 'parking_sensor', 'contact_sensor', 'camera', 'light')),
  vendor_system TEXT NOT NULL,
  external_id   TEXT NOT NULL,
  installed_on  DATE,
  last_seen_at  TIMESTAMPTZ,
  UNIQUE (tenant_id, vendor_system, external_id)
);

CREATE TABLE device_alerts (             -- leaks and dead batteries both need an owner
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  device_id       UUID NOT NULL REFERENCES smart_devices (id),
  kind            TEXT NOT NULL CHECK (kind IN ('leak', 'temperature', 'offline', 'low_battery',
                    'tamper', 'door_held_open')),
  raised_at       TIMESTAMPTZ NOT NULL,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES users (id),
  work_order_id   UUID REFERENCES work_orders (id),  -- set when it became work
  resolved_at     TIMESTAMPTZ
);

CREATE TABLE packages (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  property_id           UUID NOT NULL REFERENCES properties (id),
  lease_id              UUID REFERENCES leases (id),   -- null until matched
  addressee_text        TEXT NOT NULL,                 -- what the label said
  carrier               TEXT,
  tracking_ref          TEXT,
  storage               TEXT NOT NULL CHECK (storage IN ('locker', 'package_room', 'front_desk')),
  access_point_id       UUID REFERENCES access_points (id),  -- the locker bank or room
  received_at           TIMESTAMPTZ NOT NULL,
  notified_at           TIMESTAMPTZ,
  hold_until            TIMESTAMPTZ NOT NULL,          -- from the property's policy
  picked_up_at          TIMESTAMPTZ,
  picked_up_by_person_id UUID REFERENCES people (id),
  returned_at           TIMESTAMPTZ,
  CHECK (picked_up_at IS NULL OR returned_at IS NULL)
);

CREATE TABLE vehicles (                  -- the household's cars, as registered
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  household_id  UUID NOT NULL REFERENCES households (id),
  plate         TEXT NOT NULL,
  plate_region  TEXT NOT NULL,           -- ISO 3166-2 of the issuing state
  make          TEXT,
  model         TEXT,
  color         TEXT,
  model_year    INT,
  valid_during  DATERANGE NOT NULL
);

CREATE TABLE parking_permits (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  property_id       UUID NOT NULL REFERENCES properties (id),
  lease_id          UUID NOT NULL REFERENCES leases (id),
  vehicle_id        UUID REFERENCES vehicles (id),         -- null for a guest pass by plate
  rentable_space_id UUID REFERENCES rentable_spaces (id),  -- assigned space, if any
  permit_type       TEXT NOT NULL CHECK (permit_type IN ('assigned', 'unassigned', 'guest',
                      'accessible', 'ev')),
  valid_during      DATERANGE NOT NULL,
  EXCLUDE USING GIST (rentable_space_id WITH =, valid_during WITH &&)
    WHERE (rentable_space_id IS NOT NULL)
);

CREATE TABLE tow_actions (               -- every tow justified by a stored rule evaluation
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  property_id           UUID NOT NULL REFERENCES properties (id),
  vehicle_id            UUID REFERENCES vehicles (id),   -- if it's a resident's car
  plate                 TEXT NOT NULL,
  plate_region          TEXT,
  make_model            TEXT,
  vin                   TEXT,
  grounds               TEXT NOT NULL CHECK (grounds IN ('no_permit', 'fire_lane',
                          'blocking_access', 'assigned_space', 'violation_notice',
                          'inoperable', 'other')),
  first_observed_at     TIMESTAMPTZ NOT NULL,
  notice_served_at      TIMESTAMPTZ,                     -- when a waiting period applies
  authorized_by         UUID NOT NULL REFERENCES users (id),
  authorized_at         TIMESTAMPTZ NOT NULL,
  police_notified_at    TIMESTAMPTZ,
  towing_company        TEXT NOT NULL,
  rule_evaluation_id    UUID NOT NULL REFERENCES rule_evaluations (id),
  removed_at            TIMESTAMPTZ,
  CHECK (authorized_at >= first_observed_at)
);
```

Design decisions behind it:

- **Credentials hang off purposes, and purposes drive revocation.** A job subscribed to `lease.moved_out`, lease member changes, `work_order.completed` and vendor suspensions revokes every credential tied to the record; a nightly sweep compares each vendor cloud's active credentials with the platform's and revokes strays. The sweep finds the fob someone issued by hand in the vendor's console.
- **Sync state is explicit.** The platform's intent and the vendor's confirmed state differ for minutes, and for offline locks for days. `revoke_pending` past a threshold is an alert, and a unit can't be marked ready for the next household while any prior-lease credential is unconfirmed.
- **Events keep the device's time and the arrival time.** Offline locks upload their logs when a credential syncs them, so `occurred_at` can be days before `received_at`; reports sort by the first and alerts by the second. Vendor event IDs make webhook redelivery idempotent ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)).
- **Biometric templates aren't stored here.** A biometric credential is a reference to the vendor's enrollment; the template stays with the vendor under its processor contract, and the platform stores consent and the deletion date.
- **Tows require a rule evaluation.** `rule_evaluation_id` is not null, so the product can't authorize a tow the property's `towing_notice` rule wasn't checked against; waiting periods are computed from `notice_served_at` and stored.
- **Vehicles belong to households,** so a renewal or transfer keeps them; permits belong to leases, so they end with the lease and are reissued on renewal by the same job that rolls the charge schedule.

## Auditing

- **Who could open which door, on any date.** Credentials with their purpose, valid range, sync history and revocation reason, so a burglary or lockout claim can be answered for a past date, not just today.
- **Every entry into an occupied unit by staff or vendors,** joined to the work order and the entry notice that allowed it.
- **Remote unlocks and device commands,** with the user, the reason and the device's acknowledgement.
- **Turnover rekeys and lock-change requests,** with the deadline computed and the time each was done.
- **Every tow,** with the evidence, the authorizer, the police notice and the rule evaluation, kept for as long as a claim for wrongful towing can be brought.
- **Consents and policy versions** for smart access and biometrics, and every disclosure of access or plate data to anyone outside the operator, including law enforcement, with the legal basis.
- **Deletions,** with the retention rule that triggered them, because a destruction deadline is something a regulator checks.

## What This Means for the System You Build

- **Make the lease the source of access.** Credentials are issued and revoked by life-cycle events, never by hand in a vendor console.
- **Model every credential's purpose** (resident, work order, vendor, staff, guest, tour) and let the purpose set its life.
- **Treat revocation as the critical path,** with sync state, retries, reconciliation sweeps and a turn checklist that blocks on it.
- **Keep work-order credentials inside the entry notice window** and log their use against the work order.
- **Turn device alerts into work orders** with owners and SLAs, including dead batteries and offline hubs.
- **Match packages and vehicles to households,** not names, and end them with the lease.
- **Model towing and parking rules as effective-dated data** and require a stored rule evaluation for every tow.
- **Build privacy for the strictest jurisdiction:** consent per data type, use limited to access, per-type retention, no location outside the building, biometrics opt-in, and access data walled off from eviction and screening.
- **Keep two clocks on device events,** the device's and the platform's, and make every webhook idempotent.

## References

**Statutes and regulations**

- [NYC HPD: Tenant Data Privacy Law](https://www.nyc.gov/site/hpd/services-and-information/tenant-data-privacy-law.page), Local Law 63 of 2021: consent, permitted data, use limits, no location tracking, no use to harass or evict, 90-day destruction of authentication data, no required smart access to enter a unit, private right of action
- [Hunton Andrews Kurth: New York City Council passes Tenant Data Privacy Act](https://www.hunton.com/privacy-and-information-security-law/new-york-city-council-passes-tenant-data-privacy-act), passage on April 29, 2021, $200 to $1,000 per tenant for unlawful sale, plain-language policy, security measures
- [Davis Wright Tremaine: Illinois revises biometrics law to reduce the prospect of ruinous damage awards](https://dwt.com/blogs/privacy--security-law-blog/2024/08/illinois-bipa-biometrics-law-amended-for-damages), BIPA's written release, public retention policy and damages, the August 2, 2024 single-violation and electronic-signature amendment, and the Seventh Circuit's retroactivity holding
- [California Vehicle Code section 22658](https://california.public.law/codes/ca_veh_code_section_22658), sign size and contents, 96-hour and 24-hour notice periods, written authorization and its contents, the small-residential exception, police notice within one hour, double charges
- [Texas Property Code section 92.0131](https://texas.public.law/statutes/tex._prop._code_section_92.0131), parking rules for multiunit complexes, permitted vehicle information, 14-day notice of changes, $100 civil penalty
- [Texas Property Code section 92.153](https://texas.public.law/statutes/tex._prop._code_section_92.153), required security devices
- [Texas Property Code section 92.156](https://texas.public.law/statutes/tex._prop._code_section_92.156), rekeying within seven days after each tenant turnover
- [California Civil Code section 1941.5](https://california.public.law/codes/civil_code_section_1941.5), lock changes within 24 hours for protected tenants and 21-day reimbursement
- [California Civil Code section 1798.90.5](https://california.public.law/codes/civil_code_section_1798.90.5), ALPR operator and system definitions, including private entities
- [California Civil Code section 1798.90.51](https://california.public.law/codes/civil_code_section_1798.90.51), ALPR security and a public usage and privacy policy
- [Davis Wright Tremaine: New FCC rules affect broadband competition in multi-tenant properties](https://dwt.com/blogs/broadband-advisor/2022/02/fcc-mte-revenue-sharing-rule), the February 2022 ban on exclusive and graduated revenue sharing, exclusive marketing disclosure, bulk billing unaffected
- [Broadband Breakfast: Brendan Carr withdraws FCC's bulk billing proposal](https://broadbandbreakfast.com/brendan-carr-withdraws-fccs-bulk-billing-proposal), the March 2024 bulk billing item withdrawn in January 2025

**Filings**

- [SmartRent: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1837014/000119312526089953/smrt-20251231.htm), 890,870 units deployed, Z-Wave hub devices, cloud access control, leak, parking, contact and motion sensors, community Wi-Fi, suite integrations, privacy laws including the Tenant Data Privacy Act

**Platforms**

- [Entrata: Access Connect](https://www.entrata.com/products/access-connect), keyless entry from the resident app and partner list
- [Entrata: Homebody app](https://www.entrata.com/products/homebody-app), vehicle management in the resident app
- [Entrata: ResidentPortal](https://www.entrata.com/products/residentportal), package pickup and amenity booking alerts
- [RealPage: Smart Building](https://www.realpage.com/smart-building/), vendor-agnostic devices, partner categories, managed Wi-Fi revenue claims
- [RealPage: Resident portal](https://www.realpage.com/resident-portal/), parking, storage and amenity reservations
- [Brivo: Unified security for multifamily owners and managers](https://www.brivo.com/brivo-showcases-unified-security-for-multifamily-owners), PMS-driven credential provisioning and opt-in face matching (June 11, 2026)
- [ButterflyMX](https://butterflymx.com/), video intercom, smartphone entry, package rooms, suite integrations
- [DOOR](https://door.com/?from=latch), smart locks, intercom, readers, integrations, continued Latch hardware support
- [SALTO](https://saltosystems.com/en-us/), SALTO KS, Homelok and SALTO Space data-on-card
- [Luxer One: Multifamily](https://www.luxerone.com/multifamily/), carrier scan and notification, refrigerated lockers, suite integrations
