+++
title = "Customers, Accounts & Properties"
nav_title = "Accounts & Properties"
description = "Who a field business serves: accounts and service locations, contacts and roles, address standardization, geocoding, property keys, assets, merges and privacy."
category = "Field Operations Industry"
order = 1503
part = "How the Work Flows"
tags = ["field-operations", "crm", "addresses", "geocoding", "data-modeling", "privacy"]
+++

A software company's customer is an email address and a card. A field business's customer is three different things that most people collapse into one: the **party who pays**, the **place where the work happens**, and the **people** who answer the door, approve the quote and read the invoice. A homeowner is all three at once, which is why the shortcut works until the first landlord with twelve rentals, the first tenant who isn't allowed to authorize a repair, the first house that sells mid-contract, or the first restaurant chain whose kitchens are serviced locally and billed at headquarters. Routing needs a coordinate and a time zone, billing a responsible party, compliance a treated address. And the history (treatments, installed equipment, warranties, the water heater replaced in 2023) belongs to the house, not to whoever owned it when the work was done. Get the shape wrong and each system grows its own workaround.

This chapter covers how platforms model customers and sites, how addresses become coordinates and property keys, what attaches to a property, and how duplicates, history and privacy requests are handled. The general address pipeline is in [Addresses & Geocoding](/docs/fundamentals/addresses) and the general practice of reconciling many sources is in [Matching, Merging & Many Sources](/docs/architecture/record-linkage); this chapter is the field-specific part. What the customer buys is the next chapter, [Service Agreements & Plans](/books/field-operations/service-agreements).

## Payer, Site and People

The vendors split along one question: is the site a child of the customer, or its own record with its own history? The answer decides where equipment, history and jobs attach.

**ServiceTitan** separates them cleanly. The customer is the bill-to and financial party (invoices, payments, payment methods, membership status, balance) and the location is the physical site (service address, zone, equipment, recurring services, preferred technician, job history). Each location belongs to exactly one customer, because "only one party is financially responsible for a service location." Jobs are booked only from a location, equipment lives only on locations, and a location can be moved to a different customer when the site changes hands. **FieldRoutes**, built for pest and lawn, keeps a customer card per property, distinguishes service contacts from billing contacts, lets a subscription name a billing account other than itself and links multi-site customers under a master account.

The SMB tools (Jobber, Housecall Pro) start from the homeowner and add properties or sub-customers under a client. The enterprise suites make the site a first-class object that several accounts can share: in **Salesforce Field Service** an AssociatedLocation joins accounts to locations, so "a shopping center location may have multiple customer accounts," and **Dynamics 365** separates the service account (with defaults such as price list and territory) from the billing account, with functional locations nesting campus, building, floor and room.

| Vendor | Payer vs site | Multi-site | Where equipment lives |
| ------ | ------------- | ---------- | --------------------- |
| Dynamics 365 | Service account and billing account | Billing account shared across service accounts | Asset in a functional location tree |
| FieldRoutes | Customer card per property; billing account can be another card | Linked properties under a master; multi-unit | Customer card, units |
| Housecall Pro | Billing address flag, or parent and sub-customers | Addresses or sub-customers | Not published |
| Jobber | Client owns properties | Many properties per client | Not published |
| Salesforce | Account linked to locations through associated locations | Many accounts per location and vice versa | Asset, with maintenance plans linked to a location |
| ServiceTitan | Customer (bill-to) owns many locations; a location has one customer | Many locations per customer | Location |

The column that decides your design is the last one. Equipment, treatment history and warranties attach to the place, so the place has to be its own record with a stable identity, and the payer has to be a link that can change underneath it.

![The customer model: a person holds a billing role on an account and a site role on a property; the property, the key record, is billed to one account at a time, matched to a property key, and holds assets that contain components; an account can roll up to a parent account.](/diagrams/fo-customers-and-properties-model.svg "Three kinds of record, joined by roles. The property is where work, history and equipment accumulate; the payer can change underneath it.")

## Addresses for Service Work

Every address goes through the same pipeline: capture with autocomplete and a separate unit field, standardize to USPS Publication 28 with CASS-certified processing, validate, geocode, and store only what the vendor's license allows. [Addresses & Geocoding](/docs/fundamentals/addresses) covers each step. Three points are specific to field service.

**The unit is the failure that costs a truck roll.** Validators report a missing secondary unit explicitly: Smarty's `dpv_match_code` of `D` and Google's `uspsData.dpvConfirmation` of `D` both mean the building is real and the apartment number is missing. For a parcel carrier that's a package at the leasing office. For a pest or plumbing company it's a technician knocking on the leasing office door with a work order for an unknown unit, so a `D` should block booking until someone supplies the unit, not merely warn.

**Choose the vendor by what you must keep.** Google Maps Platform is a common default for field platforms because dispatchers and technicians already look at Google maps and one vendor covers autocomplete, validation (with CASS opt-in for the US and Puerto Rico) and geocoding. My criteria for choosing are storage rights, CASS, coverage and cost, in that order. Google's Address Validation policies generally restrict storing its content except the place ID, which "can be stored indefinitely." Smarty is US-focused and returns the same DPV codes, and its terms let you keep high-accuracy geocodes "only during the Subscription Term" for internal business purposes, deleting every copy within 30 days after it ends unless you bought a perpetual license. Loqate is the usual pick when properties sit outside North America; its Address Verification Code grades each result from verified to unverified with a match level down to premise or delivery point. A route is planned on stored coordinates every night for years, so storage rights matter more here than in a checkout form: with Google, store the place ID and refresh; for the coordinate you route on, use a source you may keep (a technician's pin, the Census Geocoder, or a vendor contract that permits storage), and plan to re-geocode if a time-limited license ends.

**A technician's pin outranks every rooftop.** A rooftop geocode is the center of the roof, not the gate, the side door or the meter. Store the precision with every point, flag anything below rooftop or parcel, and ask the technician to drop a pin on the first visit. That pin is the service point you route to from then on.

![Address pipeline: the address as typed is standardized to standard postal form with ZIP+4 (USPS Publication 28), validated for deliverability (DPV codes Y, S, D or N) with a residential flag, geocoded at rooftop or ZIP precision, and matched to a vendor or parcel property key; a failed validation or low-precision geocode goes to human review.](/diagrams/fo-customers-and-properties-address.svg "Four steps, each a vendor call. Keep what was typed beside what came back, because the vendor's answer changes over time.")

## Property Keys and Enrichment

The address is not a stable identifier. Cotality's identifier guide notes that assessor parcel numbers (APNs) "differ in format across ~3,000 US counties" and can change, and that "a single address can sometimes resolve to more than one CLIP when a parcel has been subdivided or re-platted." ATTOM's notes say the street address identifies about 90% of properties and that "a county may decide at any time to change its numbering system." So each property data vendor publishes its own persistent key:

| Key | Vendor | What it identifies |
| --- | ------ | ------------------ |
| ATTOM ID | ATTOM | A property, fixed once assigned; matches to boundaries |
| CLIP | Cotality (formerly CoreLogic) | A parcel; addresses normalized to Publication 28 before matching |
| PreciselyID | Precisely | An addressable location, the key to its data portfolio |
| SmartyKey | Smarty | An address, with enrichment datasets keyed to it |
| `ll_uuid` | Regrid | A parcel geometry, stable over time |

Store the vendor key as `property_xid` (with `property_vendor`) beside your own property ID, never instead of it, and store the county APN and FIPS code when you have them: you may change vendors, and an inspector or title company will ask for the APN, not the vendor's ID.

Enrichment is what the key buys, and in field service it **prices work**. Smarty's address enrichment returns year built, building and lot square footage, owner occupancy, pool and roof attributes; Regrid adds parcel geometry, zoning and a FEMA flood zone field. Lot size sets a lawn or pest quote, linear feet a termite treatment, square footage a cleaning bid or a duct-cleaning estimate, structure age the likely furnace generation an HVAC tech will find. Measured pricing tables read these attributes directly ([Pricebooks: Where Prices Come From](/books/field-operations/pricing-and-sales-rules#pricebooks-where-prices-come-from)).

Measure match rates on your own addresses rather than trusting coverage claims, read the license (Regrid's terms prohibit using its USPS vacancy data for direct mail), and record source and date on every attribute: a technician's on-site measurement wins over an assessor's record, and a disputed quote has to show which one it used.

## Addresses From Many Sources

No platform that runs for years gets its addresses from one place. The web form uses one vendor's autocomplete; partner leads arrive validated by another; a canvassing app drops a pin on a parcel; an acquired branch arrives with ten years of unvalidated addresses; a technician drags a pin because the geocode lands in the neighbor's driveway. Overwriting the property's address columns with whichever source wrote last is how a recurring customer ends up on the wrong route with nobody able to say why. The general answer is in [Observations, Not Overwrites](/docs/architecture/record-linkage#observations-not-overwrites): store each source's answer as a dated observation with its key and license, keep a crosswalk of every source's ID, and derive the property's working address by written rules.

The rules are where field service differs. Survivorship per field, as [Survivorship Per Field](/docs/architecture/record-linkage#survivorship-per-field) describes, looks like this for a property:

- **Mailing lines** from the CASS-processed result.
- **Unit** from whichever source confirmed it (a `Y` over a `D`).
- **Service point** from a technician's pin over any vendor rooftop, and a rooftop over an interpolated or ZIP-level point.
- **Measurements** from a technician's on-site measurement over the assessor or enrichment vendor.
- **Linkage**: match before creating, with address plus unit as the strongest signal, and never auto-merge two properties that both have active agreements. Send them to review instead.

The tables extend the canonical `properties` table from [The Field Operations Business](/books/field-operations/field-operations-business) with only the columns this chapter needs. The core `location` column is the service point and `time_zone` is derived from it; this chapter adds where the point came from and how precise it is:

```sql
ALTER TABLE properties
  ADD COLUMN google_place_xid   TEXT,              -- storable indefinitely; refresh yearly
  ADD COLUMN validation_status  TEXT NOT NULL DEFAULT 'unvalidated',
                                                   -- validated | customer_asserted | overridden | needs_review | unvalidated
  ADD COLUMN dpv_code           TEXT,              -- Y | S | D | N
  ADD COLUMN rdi                TEXT,              -- residential | commercial
  ADD COLUMN location_source    TEXT,              -- technician_pin | customer_pin | census | vendor
  ADD COLUMN location_precision TEXT,              -- rooftop | parcel | street | postal_code
  ADD COLUMN property_xid       TEXT,              -- vendor key, e.g. a SmartyKey
  ADD COLUMN property_vendor    TEXT,
  ADD COLUMN apn                TEXT,
  ADD COLUMN county_fips        TEXT;

CREATE TABLE property_address_observations (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id          UUID NOT NULL,
  property_id        UUID NOT NULL REFERENCES properties (id),
  source             TEXT NOT NULL,     -- google | smarty | regrid | import:acme | technician | override
  source_xid         TEXT,              -- place ID, SmartyKey, ll_uuid, legacy ID
  observed_at        TIMESTAMPTZ NOT NULL,
  input              JSONB,             -- what was sent
  result             JSONB,             -- what came back, if the license allows keeping it
  dpv_code           TEXT,
  location           GEOGRAPHY(POINT),
  location_precision TEXT,
  license_expires_at TIMESTAMPTZ        -- when this result must be refreshed or dropped
);
```

A scheduled job refreshes or drops observations whose license has lapsed and recomputes the working address, without touching what you own, such as a technician's pin ([Licensed Data](/docs/architecture/record-linkage#licensed-data)). Re-validation is a new observation to review, never an update to apply: postal data changes monthly, and a silent rewrite can move a pin across a territory boundary and re-route a recurring customer.

## When No Vendor Knows the Address

A builder hands over a subdivision, and the first homeowners want termite pre-treatment (often on the slab, before there's a mailbox), a new lawn, a first HVAC service or a move-in clean before the street exists in anyone's data. Every validator says no. The customer is right and the data is late, and refusing the sale is the wrong answer. [Addresses No Vendor Knows](/docs/fundamentals/addresses#addresses-no-vendor-knows) has the general handling: a `customer_asserted` status, a pin someone dropped, validation feedback to the vendor, and a re-check until a vendor confirms it.

The field-specific part is **evidence**. A termite warranty, a building permit and a pesticide application record all name an address with legal weight, and they're often created at the moment the address is least verifiable. Attach what proves it: the builder's lot and plat reference, the county parcel number, the permit, the closing documents. When the street finally validates, the warranty and the application record still have to point at the same property, which is why the property's identity is yours and the address is only an observation of it.

Rural routes, private roads and properties whose mailing address is a PO box take the same path: the service point and the mailing address are different fields, and only one of them needs to be deliverable.

## When the Vendor Is Wrong

The harder case is a vendor that confidently returns the wrong answer. Google puts the house in one city; the customer, the deed and the county say another. Usually both are right about different things: the postal city is where mail is delivered from, and ZIP Codes are delivery routes, not areas ([Postal City, Service Point, Jurisdiction](/docs/fundamentals/addresses#postal-city-service-point-jurisdiction)). For a field business, which place is right depends on the question:

| Question | Answer from |
| --- | --- |
| Where does the mail go? | The postal (CASS) result |
| Which territory, route and branch? | The service point, by point-in-polygon on your own territories |
| Which city or county licenses, permits and sales tax apply? | Legal boundaries ([Licenses & Permits](/books/field-operations/licensing-and-permits) uses Census TIGER/Line), confirmed against the customer's documents when they disagree |
| What does the customer call it, and what goes on the agreement? | The customer, backed by the deed or county record |

The licensing row is the one that bites. A pest company licensed in one county, or a plumber who pulls permits from the city, can't let the postal city decide which authority's rules apply: a home in unincorporated county land often carries a city's mailing name. Store the postal address, the service point and the jurisdiction set separately, and never derive the legal city from the postal one.

When a customer disputes a vendor's answer, record a field-scoped override with the evidence and the vendor's answer beside it, and retire it field by field when the vendor converges, as [Overrides That Retire](/docs/architecture/record-linkage#overrides-that-retire) describes. Convergence is about the address, not where the truck parks: a technician's pin still outranks a vendor rooftop after the vendor agrees on the city.

## What Lives on the Property

The property is the record that accumulates. Beyond the address, service point and property key:

- **Time zone.** An IANA name derived from the service point, not the branch: a branch near a zone line serves customers in both ([Time Zone From the Place](/docs/fundamentals/addresses#time-zone-from-the-place)). Appointment windows are stored as local times in that zone.
- **Service attributes.** Square footage, lot size, construction type, number of units, pool volume, structure age: the measurements quotes and chemical rates depend on, each with its source (assessor, vendor, technician measured, customer stated).
- **Access and hazards.** Gate codes, lockbox locations, pets, "use side door", parking. Technicians need these offline, and gate codes deserve the handling of other secrets ([Sensitive Data](/docs/payments/sensitive-data)): encrypted, shown only on today's route, and logged when viewed. Safe-place and access instructions are standing on the property but can be overridden for a single order, below whatever the shipper requires ([Last-Mile Delivery & Distribution](/books/field-operations/last-mile-delivery)).
- **Routing defaults.** Zone, branch, preferred technician, preferred day. Each preference is a constraint the router must honor, so record only the ones the customer asked for ([Territories & Capacity](/books/field-operations/territories-and-capacity)).
- **Assets.** Furnaces, condensers, water heaters, backflow devices, pool pumps, bait stations. The asset record, its warranty terms and registration are owned by [Equipment Is an Asset](/books/field-operations/repair-and-installation#equipment-is-an-asset). The property's part is where an asset sits: on the property, never the account, so it survives a sale, and on a large site inside the site's own structure, as Dynamics nests assets in functional locations (campus, building, floor, room).

## People, Roles and Preferences

Model the person once and the relationship many times. A **person** is a human with channels (phones, emails, a mailing address). A **contact role** joins a person to an account or a property with a type: billing, site contact, owner, tenant, property manager, emergency. FieldRoutes' service contact is "the individual directly involved with the property"; its billing contact is "responsible for receiving and paying the invoices." Jobber attaches communication settings to each contact so a tenant gets arrival texts and the owner gets invoices.

Preferences belong on the contact point and the role, not on the account: channel, language, which kinds of message. Consent to text or call is a separate, append-only ledger with its own evidence, in [Notifications & Consent](/docs/architecture/notifications) and [Consumer Protection](/books/field-operations/consumer-protection). The tenant case is the one to test: a tenant may let a technician in and receive reminders, but signing an agreement or approving a $2,000 water heater replacement usually needs the owner or manager, so **authority is a role attribute** the signing and approval flows check ([Signing the Agreement](/books/field-operations/signing-the-agreement)).

```sql
CREATE TABLE property_accounts (          -- who pays, over time
  tenant_id    UUID NOT NULL,
  property_id  UUID NOT NULL REFERENCES properties (id),
  account_id   UUID NOT NULL REFERENCES accounts (id),
  valid_during DATERANGE NOT NULL,
  CONSTRAINT property_accounts_valid_during_excl
    EXCLUDE USING GIST (property_id WITH =, valid_during WITH &&)
);

CREATE TABLE contact_roles (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id             UUID NOT NULL,
  person_id             UUID NOT NULL REFERENCES people (id),
  scope_type            TEXT NOT NULL,    -- account | property
  scope_id              UUID NOT NULL,
  role                  TEXT NOT NULL,    -- billing | site | owner | tenant | manager | emergency
  is_authorized_to_approve BOOLEAN NOT NULL DEFAULT FALSE,
  valid_during          DATERANGE NOT NULL
);
```

The exclusion constraint enforces ServiceTitan's one-payer rule over time; [Effective Dating & History](/docs/database/temporal-data) covers the range conventions.

## Notes and Alerts

Every platform has free-text notes and most have something louder, an alert, which in some platforms can be turned into an office task (FieldRoutes' alerts can). Separate notes by:

- **Scope:** account, property, asset or person.
- **Audience:** office only, technician visible, or customer visible. A note printed on a service report is customer-facing whether you meant it or not.
- **Severity:** informational, or an alert acknowledged before a job starts ("dog in yard", "disputed invoice, collect nothing on site").
- **Expiry:** a past-due alert clears when the balance does; a dog alert doesn't expire on its own.

Notes are where sensitive personal data leaks in (health conditions, family disputes), so give structured fields for the common cases and treat notes as in scope for privacy requests.

## Duplicates and Merges

Duplicates arrive from online bookings, double imports, spouses calling under different names and accounting syncs. The SMB and vertical platforms merge destructively: FieldRoutes' merge moves appointments, payments, charges and documents to a master account, keeps the master's address, contact info and billing profiles, removes the other account, and "cannot be undone"; Housecall Pro groups likely duplicates by name, phone or email, merges tags, notes, addresses, emails and attachments, carries a Do not service flag onto the survivor, and says "You cannot unmerge customers after completing this step."

In this industry, **address plus unit is the strongest match signal**, stronger than name; then normalized phone and email; then fuzzy name similarity. Two people at one address are not duplicates (a sold house, roommates): review candidates, and auto-merge only exact matches created minutes apart ([Review Bands](/docs/architecture/record-linkage#review-bands)). The merge itself should be recorded and reversible, with a tombstone that redirects the loser's ID, as [Merges, Recorded and Reversible](/docs/architecture/record-linkage#merges-recorded-and-reversible) describes. Two field rules sit on top: never merge two properties that both hold active agreements without deciding which agreement survives, and never merge two accounts that both hold stored payment methods without checking which mandate stays valid ([Stored Cards & Recurring Billing](/books/payments/stored-credentials)).

## Ownership Changes and History

When a house sells, the new owner inherits the property's history (termite treatments, installed equipment, transferable warranties) but not the seller's balance, payment methods or contact details. Close the old `property_accounts` range, open a new one, and leave work orders, chemical applications and assets on the property, as ServiceTitan's move-location operation does. Never edit the old customer's name into the new owner's: invoices, service reports and pesticide application records already produced must still show who they were issued to. A termite warranty that transfers with the house is an agreement event as well ([Service Agreements & Plans](/books/field-operations/service-agreements)).

## How to Build It

**Buy** address capture, validation and geocoding; CASS certification and rooftop data aren't worth building. **Buy** property data if your pricing depends on measurements, and keep `property_xid` swappable. **Build** the account, property, person and role model yourself: it's the core of the platform, and every vendor's shape is a compromise for someone else's market. Partition by tenant ([Multi-Tenancy](/docs/architecture/multi-tenancy)), index the service point with PostGIS, and emit events (`property.created`, `property.address_changed`, `property.account_changed`, `account.merged`) so routing, billing and search update without polling ([Events & Async Messaging](/docs/architecture/events)). Emit `property.address_changed` only when a winning value changes, not when a vendor confirms what you already had.

The failure to design out first is one payer column with no history: the first house sale rewrites who past invoices went to.

## Privacy

Which privacy laws reach a field business (the CCPA's thresholds among them) is in [Consumer Protection](/books/field-operations/consumer-protection#privacy-in-a-field-business), with the general machinery in [GDPR & Privacy](/docs/compliance/gdpr). What it means for this model:

- **Deletion has field-specific exceptions.** Pesticide application records, invoices and tax records have their own retention periods ([Data Retention & Deletion](/docs/architecture/data-retention)). Delete or pseudonymize the person while keeping the property's regulated records with the minimum identity the rule requires.
- **Find everything.** A request has to reach notes, call recordings, message logs, job photos and the search index, so index personal data by person ID.
- **The property outlives the person.** A deleted former owner's identity leaves; the house's treatment and equipment history stays for the next owner.

## Auditing

Disputes start here ("the invoice went to my ex-husband," "your technician treated the wrong house"). ServiceTitan's audit trail on customers and locations logs user, field, timestamp, old and new value for each change. Beyond that baseline, record:

- **Service point changes with their source** (vendor, technician pin, office drag) and the validation result before and after, because a moved pin explains a wrong-house treatment or a missed visit.
- **Overrides of vendor data and linkage decisions,** with the evidence and the vendor's answer beside them, and every merge with its re-pointing list.
- **Payer and role changes,** especially who may approve work, since they decide whose signature was valid.
- **Views of gate codes and other secrets.**

[Audit Trails](/docs/architecture/audit-trails) covers the record shape, capture and tamper evidence; [Audit Trails & Records](/books/field-operations/audit-trails-and-records) covers field records and retention.

## What This Means for the System You Build

- **Separate payer, site and people.** An account pays, a property is serviced, a person holds roles on either. Book work, attach equipment and keep history on the property.
- **One payer per property at a time, with history.** A `valid_during` link with an exclusion constraint, so a sale moves the site without rewriting old records.
- **Block booking on a missing unit.** A DPV `D` sends a technician to the leasing office.
- **Choose the address vendor by storage rights first,** and route on a coordinate you're allowed to keep.
- **Route on the technician's pin.** It outranks any vendor rooftop, before and after the vendor converges.
- **Store a stable property key and sourced measurements.** Vendor key, APN and county FIPS beside your own ID.
- **Accept new construction with evidence.** `customer_asserted` with a pin, plus the plat, parcel or permit when a warranty or regulated record depends on it.
- **Keep postal city, service point and jurisdictions separate.** Licenses, permits and tax follow legal boundaries, never the mailing city.
- **Model contact roles with authority** that signing and approval check.
- **Never auto-merge properties with active agreements;** make merges recorded and reversible.
- **Delete the person, keep the property's regulated record.**

## References

**Specifications**

- [USPS: Publication 28, Postal Addressing Standards](https://pe.usps.com/text/pub28/welcome.htm), the standard form of US addresses and secondary unit designators (October 2024 edition)
- [USPS: CASS](https://postalpro.usps.com/certifications/cass), certification of address-matching software and what it tests

**Reference**

- [ServiceTitan: Customer and location records overview](https://help.servicetitan.com/docs/customer-and-location-records-overview.md), the customer as bill-to party, the location as service site, one payer per location
- [ServiceTitan: Audit trail on customer and location records](https://help.servicetitan.com/docs/use-the-audit-trail-on-customer-and-location-records), fields logged with user, timestamp, old and new values
- [FieldRoutes: Contacts overview](https://knowledgebase.fieldroutes.com/docs/contacts-overview.md), service, billing and additional contact types
- [FieldRoutes: Properties tab, merge and link](https://knowledgebase.fieldroutes.com/docs/the-customer-card-properties-tab-merge-and-link.md), master accounts, linked properties and irreversible merges
- [FieldRoutes: Adding a service type subscription](https://knowledgebase.fieldroutes.com/docs/adding-a-service-type-subscription.md), billing accounts other than the subscription's own
- [FieldRoutes: Alerts](https://knowledgebase.fieldroutes.com/docs/alerts.md), alerts converted into tasks
- [Jobber: Client basics](https://help.getjobber.com/en/articles/client-basics/), clients, properties and contact roles
- [Housecall Pro: Manage and merge duplicate customers](https://help.housecallpro.com/en/articles/8500499-manage-and-merge-duplicate-customers), duplicate groups, what a merge combines, and no unmerge
- [Housecall Pro: Sub-customers vs multiple addresses](https://help.housecallpro.com/en/articles/932653-what-is-the-difference-between-sub-customers-and-multiple-addresses), the two multi-site patterns
- [Salesforce: Field Service Developer Guide](https://resources.docs.salesforce.com/latest/latest/en-us/sfdc/pdf/field_service_dev.pdf), Location, AssociatedLocation and assets
- [Microsoft: Create and manage customer accounts in Field Service](https://learn.microsoft.com/en-us/dynamics365/field-service/accounts), service and billing accounts and work order defaults
- [Microsoft: Create functional locations](https://learn.microsoft.com/en-us/dynamics365/field-service/functional-locations), location hierarchies and assets
- [Google: Address Validation API overview](https://developers.google.com/maps/documentation/address-validation/overview), validation, geocoding and opt-in CASS for the US and Puerto Rico
- [Google: Address Validation validateAddress reference](https://developers.google.com/maps/documentation/address-validation/reference/rest/v1/TopLevel/validateAddress), USPS DPV confirmation codes
- [Google: Address Validation policies](https://developers.google.com/maps/documentation/address-validation/policies), storage restrictions and indefinitely storable place IDs
- [Smarty: US Street API](https://www.smarty.com/docs/cloud/us-street-api), DPV match codes, RDI and geocode precision
- [Smarty: Product Terms](https://www.smarty.com/legal/product-terms), high-accuracy geocodes kept only during the subscription term for internal business purposes and deleted within 30 days after
- [Smarty: US Address Enrichment API](https://www.smarty.com/docs/cloud/us-address-enrichment-api), property attributes keyed by SmartyKey
- [Loqate: Address Verification Code](https://docs.loqate.com/report-codes/address-verification-code.md), verification status and match levels down to premise and delivery point
- [US Census Bureau: Census Geocoder](https://geocoding.geo.census.gov/geocoder/), free single and batch geocoding of US addresses
- [Cotality: Identifiers](https://develop.cotality.com/ontology/identifiers), CLIP, APN variation across counties and parcel splits
- [ATTOM: Matching properties to boundaries](https://cloud-help.attomdata.com/article/678-matching-properties-to-boundaries), ATTOM ID, APN changes and address match rates
- [Precisely: Precisely Properties](https://www.precisely.com/product/precisely-properties/), the PreciselyID persistent key
- [Regrid: Parcel schema](https://support.regrid.com/parcel-data/schema), `ll_uuid`, parcel attributes and flood zone
- [Regrid: Terms of use](https://www.regrid.com/terms), restrictions on USPS vacancy data
