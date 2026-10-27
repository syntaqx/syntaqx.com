+++
title = "Addresses & Geocoding"
description = "Capturing, standardizing, validating and geocoding addresses, what vendor licenses let you store, and keeping postal city, service point and jurisdiction apart."
category = "Fundamentals"
order = 104
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

Store the precision beside the point and gate uses on it. A ZIP-level point is fine for a regional sales report and wrong for a delivery route, a flood-zone lookup or a tax boundary test. When precision is low and the location matters, get a better one from a person: the customer drops a pin, a courier or field worker confirms it on the first trip, and that pin becomes the location you route to.

## What You May Store

Read the license before you design the table. Google's Address Validation policies generally restrict caching or storing its content, "except for the place ID which can be stored indefinitely," and results shown outside a Google Map need Google's attribution ([Google: Address Validation policies](https://developers.google.com/maps/documentation/address-validation/policies)). Place IDs themselves can change, and Google recommends refreshing any older than 12 months; a `NOT_FOUND` means the ID is obsolete ([Google: Place IDs](https://developers.google.com/maps/documentation/places/web-service/place-id)). Smarty's high-accuracy geocodes are for internal business use and may be kept "only during the Subscription Term," with copies deleted within 30 days after it ends ([Smarty: Product Terms](https://www.smarty.com/legal/product-terms)).

So the shape that holds up with Google is: store the place ID as the durable reference, keep what the user typed and your own decision about it, and fetch the cleaned address and coordinates again when you need them. Coordinates you must keep for years need a source licensed for storage: a pin a person dropped, the Census Geocoder, or a vendor contract that permits it.

```sql
CREATE TABLE addresses (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  country            TEXT NOT NULL,         -- ISO 3166-1 alpha-2
  input              JSONB NOT NULL,        -- what was typed, always yours to keep
  google_place_xid   TEXT,                  -- storable indefinitely; refresh yearly
  standardized       JSONB,                 -- only from a source licensed for storage
  validation_status  TEXT NOT NULL CHECK (validation_status IN
                       ('validated', 'customer_asserted', 'overridden', 'needs_review', 'unvalidated')),
  deliverability     TEXT,                  -- vendor verdict, e.g. DPV Y, S, D or N
  location           GEOGRAPHY(POINT),      -- from a source licensed for storage
  location_source    TEXT CHECK (location_source IN ('person_pin', 'census', 'vendor')),
  location_precision TEXT CHECK (location_precision IN ('rooftop', 'parcel', 'street', 'postal_code'))
  time_zone          TEXT,                  -- IANA name, from the location
  validated_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Addresses No Vendor Knows

New construction, new streets, rural routes and private roads fail validation for months while the customer is standing in the house. Google's guide anticipates it: a user "might have entered an address not in the system, such as for new construction," and it calls it good practice to accept the original entry when the user doesn't respond to prompts. Refusing the order because a vendor hasn't caught up is the wrong answer. Accept it, and mark it for what it is:

- **A distinct status:** `customer_asserted`, not `validated` and not an error. It's used as typed and visible to whoever ships, routes or bills.
- **A location you can reach:** a pin from the customer, a driver or the office, stored as a person-sourced point.
- **Evidence when the address has legal weight** (a KYC file, a permit, a warranty): a utility bill, closing documents, a parcel number.
- **Tell the vendor which version you used.** Google's [`provideValidationFeedback`](https://developers.google.com/maps/documentation/address-validation/reference/rest/v1/TopLevel/provideValidationFeedback) takes the `responseId` from the first validation call and a conclusion: `VALIDATED_VERSION_USED`, `USER_VERSION_USED`, `UNVALIDATED_VERSION_USED` or `UNUSED`.
- **Re-check on a schedule** until a vendor confirms it, then retire the flag the way any override retires ([Matching, Merging & Many Sources](/docs/architecture/record-linkage#overrides-that-retire)).

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

Over the years an address arrives from autocomplete, a partner's import, a parcel dataset, a different geocoder, an acquired company's database and a person's pin, and they disagree at the edges. Don't let the last writer win. Keep each source's answer as an observation with its key and license, choose each field by written rules, and match before creating a new record: [Matching, Merging & Many Sources](/docs/architecture/record-linkage) is the general practice, and [Customers, Accounts & Properties](/books/field-operations/customers-and-properties) applies it to service locations in one industry.

## Checklist

- **Capture** with autofill tokens and autocomplete, a separate unit field, and an escape hatch for addresses the suggestions don't know.
- **Keep the raw input** beside every cleaned version.
- **Standardize** with CASS-certified processing in the US and a parser such as libpostal elsewhere; model addresses as lines plus levels and a country.
- **Validate,** read the verdict, and choose fix, confirm or accept by what the address is for.
- **Store precision with every point,** and replace low-precision points with a person's pin where location matters.
- **Store only what the license allows:** with Google, the place ID, refreshed yearly; vendor coordinates only under terms that permit it.
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
