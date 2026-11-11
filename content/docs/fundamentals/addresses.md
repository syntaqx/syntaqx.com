+++
title = "Addresses & Geocoding"
description = "Capturing, validating, geocoding and storing addresses: the capture flow, what vendor licenses let you keep, and an architecture that scales from day one."
category = "Fundamentals"
order = 106
tags = ["addresses", "geocoding", "data-modeling", "standards", "time-zones"]
+++

An address looks like a string and does at least four jobs: it tells a carrier where to deliver, a driver where to park, a tax engine which jurisdictions apply, and an identity check whether this person is who they say. Each job needs a different part of it, at a different precision, and a single `address TEXT` column can't serve any of them well. A shipping label, a know-your-customer check, a property listing and a service visit all start with the same pipeline: capture, standardize, validate, geocode, and store only what you're allowed to keep.

## Capture

Stop bad addresses at the keyboard, and keep what was typed.

- **Use the browser's autofill tokens.** The HTML standard defines `address-line1` to `address-line3`, `address-level1` to `address-level4`, `postal-code` and `country`, and notes that the order of levels varies by country: a US town (level 2) comes before the state (level 1), while in Japan the prefecture (level 1) comes first ([WHATWG: Autofill](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill)). [Forms & Validation](/docs/frontend/forms) covers the rest of the form.
- **Offer autocomplete.** Google's [Place Autocomplete](https://developers.google.com/maps/documentation/places/web-service/place-autocomplete) suggests addresses as the user types and returns a place ID for the one picked. For flows that need only an address and coordinates, Google suggests skipping session tokens and calling Geocoding on the selected prediction, which it says costs less when users pick within about four requests.
- **Collect the unit separately.** The same page notes that apartment and unit addresses can come back as partial predictions. The unit is the part that decides whether a parcel reaches the right door, so give it its own field and validate the whole address afterwards.
- **Never block on autocomplete.** Let people type an address the suggestions don't contain. Some of them are right and the data is late (see [Addresses No Vendor Knows](#addresses-no-vendor-knows)).

## Standardize

Standardizing turns one address written five ways into one form, so that it compares equal to itself and prints the way the post office expects.

In the US, USPS [Publication 28](https://pe.usps.com/text/pub28/welcome.htm) (current edition October 2024) defines the standard delivery line and last line, street suffix abbreviations and secondary unit designators such as APT and STE. Software that matches addresses against the USPS database is certified under [CASS](https://postalpro.usps.com/certifications/cass), which tests ZIP+4 and delivery point coding, DPV, LACSLink, SuiteLink and RDI; the current cycle's certified products guides expire July 31, 2028. Buy CASS processing, don't build it.

US rules don't generalize. The Universal Postal Union counts more than 200 address formats in the world and publishes the S42 standard of address components and per-country templates ([UPU: Addressing solutions](https://www.upu.int/en/postal-solutions/programmes-services/addressing-solutions)). Some countries have no postcodes, some put the postcode before the city, some address by block rather than street. So:

- **Model the address as ordered lines plus administrative levels,** not `street`, `city`, `state`, `zip`. A required `state` field is a bug for most of the world.
- **Store the country** as an ISO 3166-1 alpha-2 code on every address, and format for display per country.
- **Parse and normalize with a library for international data.** [libpostal](https://github.com/openvenues/libpostal) (MIT) parses free-form addresses into components with a model trained on OpenStreetMap and OpenAddresses, and expands abbreviations so "St" and "Street" compare equal. It's for matching and search, not for producing a deliverable address.

## Validate

Validation answers "is this a real, deliverable address?" and returns a cleaned version with a verdict. I default to Google's Address Validation API when the product already uses Google Maps, Smarty for US-heavy workloads where storage terms matter, and Loqate when coverage outside North America is the point. Read each verdict, not just the cleaned address:

| Vendor | What it returns |
| ------ | --------------- |
| [Google Address Validation](https://developers.google.com/maps/documentation/address-validation/overview) | Corrected, standardized components and coordinates; a verdict with granularity and flags for inferred, replaced and unconfirmed components; CASS only for US and Puerto Rico, opt-in with `enableUspsCass` |
| [Smarty US Street API](https://www.smarty.com/docs/cloud/us-street-api) | `dpv_match_code`: `Y` confirmed, `S` unit not recognized, `D` unit missing, `N` not confirmed; `enhanced_match` for non-postal matches |
| [Loqate Address Verify](https://docs.loqate.com/report-codes/address-verification-code.md) | An Address Verification Code such as `V44-I44-P3-100`: status `V` verified, `P` partial, `A` ambiguous, `R` reverted, `U` unverified, with match levels down to premise |

`D` and its equivalents are the failure worth designing for: an apartment building without the unit, which delivers to the leasing office.

What you do with the verdict depends on the job. Google's [validation logic guide](https://developers.google.com/maps/documentation/address-validation/build-validation-logic) frames it as fix (the address may not be deliverable), confirm (components were inferred or changed) or accept (confidence is high). A newsletter signup can accept almost anything; checkout should confirm a changed ZIP before shipping; a KYC flow should treat an unverified address as a reason for more evidence, not a typo to auto-correct.

## Geocode and Precision

A geocode is a coordinate plus a statement of how good it is, and the second part matters as much as the first. Google's [Geocoding API](https://developers.google.com/maps/documentation/geocoding/requests-geocoding) reports `location_type` as `ROOFTOP`, `RANGE_INTERPOLATED` (an estimate between two known points), `GEOMETRIC_CENTER` (the center of a street or region) or `APPROXIMATE`, plus `partial_match` when only part of the address matched. Smarty reports `precision` from `Zip5` through `Street` to `Rooftop`. The US Census Bureau runs a free [Census Geocoder](https://geocoding.geo.census.gov/geocoder/) for US addresses, including batches.

Store the precision beside the point and gate uses on it (the coordinate itself, its order and how to store it are in [Coordinates & Geometry](/docs/fundamentals/coordinates-and-geometry)). A ZIP-level point is fine for a regional sales report and wrong for a delivery route, a flood-zone lookup or a tax boundary test. When precision is low and the location matters, get a better one from a person: the customer drops a pin, a courier or field worker confirms it on the first trip, and that pin becomes the location you route to.

## What You May Store

Read the license before you design the table. Google's Address Validation policies generally restrict caching or storing its content, "except for the place ID which can be stored indefinitely," and results shown outside a Google Map need Google's attribution ([Google: Address Validation policies](https://developers.google.com/maps/documentation/address-validation/policies)). Place IDs themselves can change, and Google recommends refreshing any older than 12 months; a `NOT_FOUND` means the ID is obsolete ([Google: Place IDs](https://developers.google.com/maps/documentation/places/web-service/place-id)). Smarty's high-accuracy geocodes are for internal business use and may be kept "only during the Subscription Term," with copies deleted within 30 days after it ends ([Smarty: Product Terms](https://www.smarty.com/legal/product-terms)).

Coordinates are where this bites, because the obvious design (geocode once, store the point, query it forever) isn't allowed with Google's data. The [Geocoding](https://developers.google.com/maps/documentation/geocoding/policies), [Places](https://developers.google.com/maps/documentation/places/web-service/policies) and [Address Validation](https://developers.google.com/maps/documentation/address-validation/policies) policies each allow caching latitude and longitude "for up to 30 consecutive calendar days," then require deleting them. The same policies forbid creating content based on Google Maps content, and Google's own example is using Places coordinates for point-in-polygon analysis. A permanent `location` column filled from Google, queried for territories, radius searches or reports, is exactly what the terms rule out. Address Validation's standardized address follows the same 30-day limit, with one way out: after 30 days you may replace it with data the end user confirmed or corrected, and that version is yours to keep.

So the shape that holds up with Google is: store the place ID as the durable reference, keep what the user typed and your own decision about it, and fetch the cleaned address and coordinates again when you need them, holding them no longer than 30 days. Coordinates you must keep and query for years need a source licensed for storage: a pin a person dropped, the Census Geocoder, or a vendor contract that permits it. That's what `location_source` in the table below records.

```sql
CREATE TABLE addresses (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  country            TEXT NOT NULL,         -- ISO 3166-1 alpha-2
  input              JSONB NOT NULL,        -- what was typed, always yours to keep
  match_key          TEXT NOT NULL UNIQUE,  -- normalized country, lines and unit; one row per place
  google_place_xid   TEXT,                  -- storable indefinitely; refresh yearly
  place_checked_at   TIMESTAMPTZ,           -- drives the rolling refresh
  standardized       JSONB,                 -- only from a source licensed for storage
  validation_status  TEXT NOT NULL CHECK (validation_status IN
                       ('validated', 'customer_asserted', 'overridden', 'needs_review', 'unvalidated')),
  deliverability     TEXT,                  -- vendor verdict, e.g. DPV Y, S, D or N
  location           GEOGRAPHY(POINT),      -- from a source licensed for storage
  location_source    TEXT CHECK (location_source IN ('person_pin', 'census', 'vendor')),
  location_precision TEXT CHECK (location_precision IN ('rooftop', 'parcel', 'street', 'postal_code')),
  geocoded_at        TIMESTAMPTZ,           -- null until the background geocode lands
  time_zone          TEXT,                  -- IANA name, from the location
  validated_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## The Capture Flow

Four steps make a capture flow that works for the customer typing and the courier, crew or visitor arriving. Built with care, it also settles most of the storage problem in [What You May Store](#what-you-may-store): the location you keep is one the customer confirmed, on a map seeded from a source you're allowed to store.

![A UI blueprint of four wireframed screens, left to right, with numbered notes above. 1, Choose: saved addresses, with a title slot, a search field, label chips (note 1) and a list of saved rows, each with a radio, two lines of text and an edit control, the first selected. 2, Search: the query field over a panel of three suggestions, each with two lines and a chevron (note 2), and an enter manually row last (note 3), with the saved list behind it. 3, Confirm: the picked address, place type (note 4), unit and gate code (note 5), building, a map with an accented pin and an adjust pin control (note 6), door or lobby handoff, instructions, label chips, and save (note 8). Manual entry: country first (note 7), street, unit, city, region and postcode, then continue. Arrows run from the saved list's search field to search, from a suggestion to confirm, and from save back over the top to the saved addresses; a dashed no match path runs from enter manually under the screens into manual entry, and a dashed arrow returns from continue to confirm. The notes say labels are private and most recent first; only the picked suggestion may be kept, for that transaction; manual entry rejoins at confirm so it gets a pin; unit, building and place type come from the customer; the gate code is encrypted and shown only during a job; the pin starts on a geocode you may store and the confirmed point is kept; country decides the fields with no preselected region; and save writes the address and its geocode job in one transaction while orders copy the address.](/diagrams/address-capture-blueprint.svg "The capture flow as a blueprint. The accent is the pin: seeded from a geocode you may store and confirmed by the customer, it's the location the product keeps, and manual entry rejoins at confirm so typed addresses get one too.")

1. **Start from the address book.** A returning customer picks a saved address rather than typing one: a list with their own labels (home, work or a name they choose), the current choice marked, an edit control on each entry, and the search field above it. Choosing an address is one tap.
2. **Search with autocomplete.** Suggestions arrive as the customer types, each with the street on the first line and the city, region and postcode under it, ranked toward where the customer is. The last entry in the list is always "enter address manually."
3. **Confirm the details.** Picking a suggestion opens a form with the chosen address at the top and the parts no geocoder knows:
   - **The type of place** (house, apartment, office, hotel), which decides what else to ask.
   - **Unit or floor, building name, and gate or door code.**
   - **A map with a pin** and an "adjust pin" control to drag it to the entrance a courier should use. A geocode lands on a rooftop or a parcel's center; the entrance can be around the corner. Seed the pin from a geocoder whose results you may store: if it starts at a Google geocode and the customer only confirms it, the point you'd keep is still Google's coordinate.
   - **How to hand over** (leave at the door, leave in the lobby, hand to me) and **free-text instructions,** with a hint saying what belongs there and what doesn't (order changes go elsewhere).
   - **A personal label** that only the customer sees.
4. **Save.** The address joins the book, and every order copies it (see below).

Manual entry asks for the country first, because the country decides which fields exist and in what order ([Standardize](#standardize)). Don't preselect a state or province: a default that looks filled in gets submitted unchanged. Validate when the customer continues, then send them to step 3, so a typed address gets a confirmed pin like any other.

### What Each Step Stores

| Data | Comes from | May you keep it? |
| ---- | ---------- | ---------------- |
| What the customer typed | The customer | Yes |
| The address picked from Google Autocomplete | The customer's selection | For that customer's transaction: Google exempts "the end user's selected address" from its content restrictions, but not the list of suggestions ([Places policies](https://developers.google.com/maps/documentation/places/web-service/policies)) |
| Google place ID | Google | Indefinitely; refresh after 12 months |
| Coordinates from Google | Google | Up to 30 days, then delete ([What You May Store](#what-you-may-store)) |
| Coordinates from a storage-licensed geocoder | Esri with `forStorage`, Mapbox permanent, the Census Geocoder | Yes, on the vendor's terms ([Where the Stored Point Comes From](#where-the-stored-point-comes-from)) |
| The confirmed pin | The customer, on a storable seed | Yes |
| Unit, building, type, instructions, label | The customer | Yes |
| Gate or door code | The customer | Yes, encrypted, shown only when needed |

Each customer's use of a place gets its own row beside the place:

```sql
CREATE TABLE saved_addresses (           -- one customer's use of an address
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  customer_id    UUID NOT NULL REFERENCES customers (id),
  address_id     UUID NOT NULL REFERENCES addresses (id),
  label          TEXT,                    -- 'home', 'work' or the customer's own; private to them
  place_type     TEXT CHECK (place_type IN ('house', 'apartment', 'office', 'hotel', 'other')),
  building_name  TEXT,
  entrance       GEOGRAPHY(POINT),        -- the customer's confirmed pin, seeded from a storable source
  access_code    BYTEA,                   -- gate or door code, encrypted in the application
  handoff        TEXT CHECK (handoff IN ('leave_at_door', 'leave_in_lobby', 'hand_to_me')),
  instructions   TEXT,
  last_used_at   TIMESTAMPTZ,             -- orders the address book, most recent first
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

The unit stays in `addresses`, with the lines it belongs to, because it changes deliverability. Everything about how one customer uses the place, including the entrance pin and the gate code, lives in `saved_addresses`.

A gate code opens a gate. Encrypt it in the application ([Encryption at Rest](/docs/security/encryption-at-rest#envelope-encryption)), show it to the courier or technician only during an active job, never log it, and leave it out of analytics exports. Free-text instructions deserve the same caution in exports, since people type phone numbers and names into them.

**Orders copy the address.** At checkout, write the address as it stands (lines, unit, pin, code reference, instructions) onto the order. Editing the address book afterwards then changes future orders without rewriting receipts, disputes or the record of where a delivery was sent.

## Architecture That Scales From Day One

None of this needs a big system on day one, but a few decisions are cheap at the first address and expensive at the ten-millionth: one row per place, geocoding off the request path, a stored point you're licensed to keep, refreshes that trickle instead of stampede, and vendors behind an interface.

![A system diagram. Top row: the app, as an actor, sends the picked address and pin to the address API, which upserts by match key into the addresses store, which readers such as routing and tax read. Bottom row: autocomplete, an external vendor, which the app calls as the customer types; a job queue; a geocode worker; and a storage-licensed geocoder, as an actor. The accented path runs from the address API down into the queue in the same transaction, from the queue to the worker, from the worker to the geocoder in batches, and from the worker back up to the addresses store with the point, precision and source.](/diagrams/address-architecture.svg "Vendors sit at the edges: autocomplete in the client while the customer types, and the stored geocode in a background worker. Everything that reads addresses (dispatch, routing, tax, territories) reads the database and never calls a vendor.")

### One Address, Many Customers

A building with two hundred tenants is one place and two hundred saved addresses. Keep `addresses` as one row per place (lines, unit and country) and `saved_addresses` as each customer's use of it, and the geocoding, validation and refresh work scales with places, not with customers or orders.

Deduplicate on a `match_key` built only from data you're allowed to keep: the customer's input normalized with a parser such as libpostal (case, abbreviations, punctuation and unit designators made uniform), or a standardized form from a source licensed for storage. A key built from Google's standardized address would have to be deleted after 30 days along with the address it came from. Insert with the key under a unique constraint (`INSERT ... ON CONFLICT (match_key) DO NOTHING`, then read the row), so two customers saving the same building at the same moment end up on one row ([Match Before Create](/docs/building-blocks/record-linkage#match-before-create)).

### Geocode Once, in the Background

Only autocomplete belongs in the customer's request, and it runs in the client. Saving an address writes the row, the customer's pin if they placed one, and a geocode job in the same transaction ([Enqueue Transactionally](/docs/architecture/background-jobs#enqueue-transactionally)); a worker geocodes it with a storable source and writes the point, precision and source back. A slow or failing geocoder then delays a background job instead of checkout, and the job retries with backoff ([Retries & Timeouts](/docs/architecture/retries-and-timeouts)).

Key the job by `address_id`, so a retried or duplicated job geocodes a place once. Batch where the vendor allows it (Mapbox takes up to [1,000 queries per request](https://docs.mapbox.com/api/search/geocoding/), the Census Geocoder 10,000 records per file), and cap the workers' concurrency at the vendor's rate limit, which the queue enforces better than any caller can.

### Where the Stored Point Comes From

The 30-day rule applies to Google's data, not to addresses. Keeping millions of geocoded addresses doesn't require keeping Google's coordinates: use Google, or another vendor, for the typing experience, and get the stored point from a source that allows it:

- **A geocoder licensed for storage.** Esri's geocoding service says applications "are contractually prohibited" from storing results unless the request sets [`forStorage=true`](https://developers.arcgis.com/rest/geocode/find-address-candidates/), and Esri prices stored and not-stored geocodes differently. Mapbox's [Geocoding API](https://docs.mapbox.com/api/search/geocoding/) defaults to temporary results, which may not be cached; with `permanent=true`, results "are allowed to be cached and stored indefinitely," which requires a credit card on file or an enterprise contract. Smarty's terms allow keeping its geocodes for the subscription term ([What You May Store](#what-you-may-store)). Geocode once, at capture or in a batch, and keep the point with its precision and source.
- **Public data where it covers you.** The [Census Geocoder](https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html) is free for the United States, Puerto Rico and the Island Areas, with batches of up to 10,000 records per file. [OpenStreetMap](https://www.openstreetmap.org/copyright) data is open under the ODbL, which requires attribution and puts any database you build from it and distribute under the same license. The public Nominatim service isn't for volume: its [usage policy](https://operations.osmfoundation.org/policies/nominatim/) sets an absolute maximum of 1 request per second and forbids systematic queries, so bulk geocoding on OpenStreetMap means running your own Nominatim.
- **The customer's pin.** Every address that goes through step 3 of [the capture flow](#the-capture-flow) ends with a point the customer confirmed or moved. Seeded from a storable geocode, it's yours either way; seeded from Google's, a pin the customer only confirmed is still Google's coordinate. Over time these pins replace vendor geocodes for every address that matters.
- **The place ID for anything Google shows.** Keep it, and fetch fresh Google details when a customer looks at the place.

What doesn't work is re-geocoding everything with Google every 29 days. It's expensive at millions of rows, and it doesn't touch the other rule: building your own territories, radius searches or reports on Google's coordinates is creating content from Google Maps content, however fresh the coordinates are.

My default for a delivery or field-service product: Google Autocomplete (or the autocomplete of whichever map the product shows) for typing, a storage-licensed geocoder or the Census Geocoder for the stored point with its precision, the customer's pin overriding both, and the place ID kept for display.

### Refresh on a Rolling Schedule

Place IDs want refreshing after 12 months, `customer_asserted` addresses want re-checking until a vendor knows them, and vendor data improves. Done as one yearly job, that's every row at once, a rate-limit wall and a bill spike. Instead, run a daily job that takes the oldest slice (`WHERE place_checked_at < now() - interval '12 months' ORDER BY place_checked_at LIMIT n`), sized so the whole table cycles within the window. The load is flat from the first thousand rows to the hundred-millionth, and a backlog is visible as the age of the oldest row.

### Keep Vendors Swappable, and Off the Read Path

- **One geocoder interface.** Workers call your own `Geocode(address) -> (point, precision, source, license)`, with an adapter per vendor. Changing vendors, or using different ones per country, is then a configuration change plus a backfill through the same queue.
- **Every point records its source and license.** That's what tells you, the day a contract ends, which rows to re-geocode or delete; Smarty's terms, for one, end storage with the subscription ([What You May Store](#what-you-may-store)). Keep each source's answer as an observation rather than overwriting ([Observations, Not Overwrites](/docs/building-blocks/record-linkage#observations-not-overwrites)).
- **Readers never call a vendor.** Dispatch, routing, tax, territories and reports read `addresses` and `saved_addresses`, through a spatial index ([Storing Geometry: PostGIS](/docs/fundamentals/coordinates-and-geometry#storing-geometry-postgis)). The read path's latency and availability are then your database's, not a vendor's, and an address the background geocode hasn't reached yet (`geocoded_at` null) is a state the reader handles, not a call it makes.
- **Deleting a saved address deletes the customer's data, not the place.** The `saved_addresses` row, with its label, pin, code and instructions, goes on request ([Data Subject Rights](/docs/compliance/gdpr#data-subject-rights)); the `addresses` row stays while other customers or past orders use it.

## Addresses No Vendor Knows

New construction, new streets, rural routes and private roads fail validation for months while the customer is standing in the house. Google's guide anticipates it: a user "might have entered an address not in the system, such as for new construction," and it calls it good practice to accept the original entry when the user doesn't respond to prompts. Refusing the order because a vendor hasn't caught up is the wrong answer. Accept it, and mark it for what it is:

- **A distinct status:** `customer_asserted`, not `validated` and not an error. It's used as typed and visible to whoever ships, routes or bills.
- **A location you can reach:** a pin from the customer, a driver or the office, stored as a person-sourced point.
- **Evidence when the address has legal weight** (a KYC file, a permit, a warranty): a utility bill, closing documents, a parcel number.
- **Tell the vendor which version you used.** Google's [`provideValidationFeedback`](https://developers.google.com/maps/documentation/address-validation/reference/rest/v1/TopLevel/provideValidationFeedback) takes the `responseId` from the first validation call and a conclusion: `VALIDATED_VERSION_USED`, `USER_VERSION_USED`, `UNVALIDATED_VERSION_USED` or `UNUSED`.
- **Re-check on a schedule** until a vendor confirms it, then retire the flag the way any override retires ([Matching, Merging & Many Sources](/docs/building-blocks/record-linkage#overrides-that-retire)).

## Postal City, Service Point, Jurisdiction

A vendor can confidently return the "wrong" city, and usually it's answering a different question. The city in a postal address is where mail is delivered from. The Census Bureau notes that ZIP Codes are assigned to delivery routes, "a point-based dataset unsuitable for mapping," and builds ZIP Code Tabulation Areas as generalized polygons from census blocks instead ([Census: ZCTAs](https://www.census.gov/programs-surveys/geography/guidance/geo-areas/zctas.html)). So a home inside one town's limits can carry a neighboring town's mailing name, and a ZIP Code can cross city and county lines.

| Question | Answer from |
| -------- | ----------- |
| Where does the mail or parcel go? | The postal (standardized) address |
| Where does a courier, a crew or a visitor go, and which store, depot or territory serves it? | The service point: the best stored coordinate, tested against your own polygons |
| Which city, county and special districts tax, license or regulate it? | Legal boundaries, by point-in-polygon on the service point, never the postal city or ZIP |
| What does the customer call it, and what goes on the contract? | The customer, backed by documents |

Store these separately and never derive one from another. Sales tax by ZIP Code is the classic mistake: the ZIP is a mail route, and the tax belongs to whichever jurisdictions contain the point. When a customer disputes the vendor, record a field-scoped override with evidence rather than editing the vendor's answer away.

## Time Zone From the Place

An address in the future (a delivery window, an appointment, a statement date) needs a local time zone, and the zone belongs to the place, not the account, the user's browser or the office that serves it. Derive an IANA name from the coordinate and store it on the address: Smarty returns `iana_time_zone` on request, and Google's [Time Zone API](https://developers.google.com/maps/documentation/timezone/overview) takes a location and a timestamp and returns the zone ID and its offsets at that moment. Store the name, never the offset, and compute instants from local times as [Time & Date Formats](/docs/fundamentals/time) describes.

## Many Sources

Over the years an address arrives from autocomplete, a partner's import, a parcel dataset, a different geocoder, an acquired company's database and a person's pin, and they disagree at the edges. Don't let the last writer win. Keep each source's answer as an observation with its key and license, choose each field by written rules, and match before creating a new record: [Matching, Merging & Many Sources](/docs/building-blocks/record-linkage) is the general practice, and [Customers, Accounts & Properties](/books/field-operations/customers-and-properties) applies it to service locations in one industry.

## Checklist

- **Capture** with autofill tokens and autocomplete, a separate unit field, and an escape hatch for addresses the suggestions don't know.
- **Copy the four-step flow:** saved addresses, autocomplete with a manual escape, details with an entrance pin, save; orders copy the address.
- **Encrypt gate and door codes,** and show them only during an active job.
- **Keep the raw input** beside every cleaned version.
- **Standardize** with CASS-certified processing in the US and a parser such as libpostal elsewhere; model addresses as lines plus levels and a country.
- **Validate,** read the verdict, and choose fix, confirm or accept by what the address is for.
- **Store precision with every point,** and replace low-precision points with a person's pin where location matters.
- **Store only what the license allows:** with Google, the place ID, refreshed yearly, and coordinates for at most 30 days; stored points from a storage-licensed geocoder, public data or the customer's pin.
- **Accept `customer_asserted` addresses,** send validation feedback, and re-check until confirmed.
- **Keep postal address, service point and jurisdictions separate,** and never compute tax or territory from a ZIP Code.
- **Derive the IANA time zone from the location.**

## References

**Specifications**

- [USPS: Publication 28, Postal Addressing Standards](https://pe.usps.com/text/pub28/welcome.htm), standard US address form, suffix abbreviations and secondary unit designators (October 2024 edition)
- [USPS: CASS](https://postalpro.usps.com/certifications/cass), certification of address-matching software, what it tests, and the current cycle
- [UPU: Addressing solutions](https://www.upu.int/en/postal-solutions/programmes-services/addressing-solutions), the variety of national address formats and the S42 standard
- [WHATWG: HTML, Autofill](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill), address autofill tokens and country-dependent level order
- [US Census Bureau: ZIP Code Tabulation Areas](https://www.census.gov/programs-surveys/geography/guidance/geo-areas/zctas.html), ZIP Codes as delivery routes rather than areas

**Reference**

- [Google: Place Autocomplete (New)](https://developers.google.com/maps/documentation/places/web-service/place-autocomplete), session tokens, address-only flows and partial predictions for units
- [Google: Address Validation API overview](https://developers.google.com/maps/documentation/address-validation/overview), validation, standardization, geocoding and opt-in CASS for the US and Puerto Rico
- [Google: Build your validation logic](https://developers.google.com/maps/documentation/address-validation/build-validation-logic), fix, confirm and accept, and accepting new construction as entered
- [Google: provideValidationFeedback](https://developers.google.com/maps/documentation/address-validation/reference/rest/v1/TopLevel/provideValidationFeedback), reporting which address version was used
- [Google: Address Validation policies](https://developers.google.com/maps/documentation/address-validation/policies), storage restrictions, storable place IDs and attribution
- [Google: Place IDs](https://developers.google.com/maps/documentation/places/web-service/place-id), changing IDs, yearly refresh and obsolete IDs
- [Google: Geocoding API requests](https://developers.google.com/maps/documentation/geocoding/requests-geocoding), location types and partial matches
- [Google: Time Zone API](https://developers.google.com/maps/documentation/timezone/overview), the zone and offsets for a location at a timestamp
- [Smarty: US Street API](https://www.smarty.com/docs/cloud/us-street-api), DPV match codes, geocode precision, coordinate licenses and IANA time zones
- [Smarty: Product Terms](https://www.smarty.com/legal/product-terms), retention and deletion of high-accuracy geocode data
- [Loqate: Address Verification Code](https://docs.loqate.com/report-codes/address-verification-code.md), verification status, match levels and match score
- [US Census Bureau: Census Geocoder](https://geocoding.geo.census.gov/geocoder/), free single and batch geocoding of US addresses
- [libpostal](https://github.com/openvenues/libpostal), open-source international address parsing and normalization
- [Google: Places API policies](https://developers.google.com/maps/documentation/places/web-service/policies), caching limits and the exception for an end user's selected address
- [Google: Geocoding API policies](https://developers.google.com/maps/documentation/geocoding/policies), the 30-day limit on cached coordinates
- [Esri: findAddressCandidates](https://developers.arcgis.com/rest/geocode/find-address-candidates/), the `forStorage` parameter and the storage prohibition without it
- [Mapbox: Geocoding API](https://docs.mapbox.com/api/search/geocoding/), temporary versus permanent results
- [US Census Bureau: Geocoding Services API](https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html), batch format, the 10,000-record limit and coverage
- [OpenStreetMap: Copyright and License](https://www.openstreetmap.org/copyright), the ODbL, attribution and share-alike
- [OSMF: Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/), the request limit and bulk geocoding rules
