+++
title = "Door-to-Door Sales"
description = "Selling at the door: canvass areas, the knock log and door statuses, property data, propensity scores, Do Not Knock lists, data licensing and rep safety."
category = "Field Operations Industry"
order = 1520
part = "Selling"
tags = ["field-operations", "sales", "door-to-door", "geospatial", "lead-scoring", "compliance"]
+++

Most field service companies sell through a website, a phone line, referrals and paid leads. A minority grow at the front door: a rep walks a neighborhood, knocks on every house, and signs an agreement on a tablet in the driveway. Pest control is the best-known case; solar, security, storm roofing, lawn care and fiber do it too. It works for recurring service because every house signed on a street makes that route denser. It's hard because it runs on thin information at speed: hundreds of doors a day per rep, most of them "not home" or "no", under local solicitation ordinances, on patchy signal. The software is a geospatial system first, a data system second and a compliance system throughout: it decides who knocks where, records every door, keeps reps away from homes they must not knock, and turns a season of knocks into next season's plan.

## Who Sells at the Door

Door-to-door is a minority channel, even in the industry most associated with it. In a 2023 PCT magazine reader poll, 26% of responding pest control operators said they use door-to-door sales professionals and 74% said they don't; PCT describes D2D as a rapid-growth strategy built on seasonal teams. The occupation is small in the federal statistics: BLS counted about 6,220 employed door-to-door sales workers in May 2023, with telecommunications the largest employing industry, and its count excludes the self-employed. Many field reps are paid as independent contractors on commission, so official counts understate the workforce; plan for that in how you model reps ([Sales Teams & Commissions](/docs/industries/field-operations/sales-teams-and-commissions)).

The verticals differ in what a sale is:

| Vertical | What's sold at the door | Ticket | What happens next |
| --- | --- | --- | --- |
| Pest control | A recurring service agreement, often with an initial treatment | Low, recurring | Initial service within days; recurring billing |
| Solar | A system design, financed or leased | Very high, one-time | Site survey, design, permits, install, utility interconnection |
| Home security | Equipment plus a monitoring contract | Medium, recurring | Install appointment |
| Roofing | An inspection, then an insurance claim or a cash job | High, one-time | Inspection, estimate, claim, install |
| Lawn and fiber | A recurring plan or a subscription | Low, recurring | First visit or installation |

The recurring verticals optimize for density and retention; the high-ticket verticals optimize for appointments set and design accuracy. Same canvassing tools, very different back ends.

## Territories and Areas

A canvassing map is a hierarchy of polygons: a branch's **territory** contains team areas, which contain the **canvass areas** reps work this week, with addresses as pins. FieldRoutes draws these on **layers** (assignment layers place reps, reporting layers track areas, system layers show knocks); SPOTIO draws by ZIP, county or custom shape. Sales areas are separate from service territories ([Territories & Capacity](/docs/industries/field-operations/territories-and-capacity)) and are redrawn every few weeks, so assignments are effective-dated ([Temporal Data](/docs/database/temporal-data)).

```sql
CREATE TABLE canvass_areas (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  parent_area_id  UUID REFERENCES canvass_areas (id),  -- team area above it
  org_unit_id     UUID NOT NULL REFERENCES org_units (id),  -- the branch
  name            TEXT NOT NULL,
  area            GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
  valid_during    DATERANGE NOT NULL
);

CREATE TABLE area_assignments (
  id                       UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id                UUID NOT NULL,
  area_id                  UUID NOT NULL REFERENCES canvass_areas (id),
  rep_id                   UUID NOT NULL REFERENCES staff_members (id),
  assigned_by_staff_member_id UUID NOT NULL REFERENCES staff_members (id),
  valid_during             DATERANGE NOT NULL
);
```

- **Clip children to parents.** A canvass area across a team boundary creates double coverage. Clip on save (PostGIS `ST_Intersection`); the result can be a multipolygon.
- **Keep assignment as history.** `area_assignments` answers "who worked this street in June" for commissions and disputes. A rep is a `staff_members` row like any technician; `rep_id` is named for its role here.
- **Separate soft and hard exclusions.** FieldRoutes documents that "Blocks are visual only," which suits rep-to-rep boundaries. It isn't enough for a town where the company has no permit or an address on a Do Not Knock registry. A **soft exclusion** warns; a **hard exclusion** blocks a lead or sale at that address, on the device, offline.
- **Rate areas from data.** SalesRabbit lets managers "rate and assign areas"; SPOTIO advises assigning by "opportunity, not just geography." Ratings should come from scores and history, not memory.

## Knocks, Statuses and the Door's Memory

A **knock** is one visit to one door: who, when, where the device was, and the outcome. Most doors aren't customers yet, so a knock keys to the vendor property key (`property_xid`, the same column [Customers, Accounts & Properties](/docs/industries/field-operations/customers-and-properties) adds to `properties`) and gains a `property_id` when the door becomes a property you serve. A **door status** is the door's current state, derived from its knocks. Keep the two separate. Knocks are an append-only log; the status is a projection you can rebuild.

![State diagram of a door during canvassing: an unknocked door moves to not home, which loops back for a revisit, or to a conversation, which ends in not interested, callback, appointment set, or sold; any state can move to do not knock, which suppresses the address until its registration expires.](/diagrams/fo-door-to-door-sales-door-states.svg "A door's status is derived from its knocks. Do Not Knock is reachable from every state and overrides everything else until it expires.")

FieldRoutes' knocking report shows the outcome mix most systems converge on: "Not Home," "Call Back," "Gave Pitch," "Made Sales," "Not Interested" and "Never Knock," with ratios for doors to pitch, pitches to sale and doors to sale. SPOTIO's funnel is the same shape: doors knocked, conversations, demos, closes. Each knock in FieldRoutes carries a unique ID and a timestamp, and a count of knocks per door.

```sql
CREATE TABLE knocks (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  property_xid  TEXT NOT NULL,        -- vendor property key, as properties.property_xid
  property_id   UUID REFERENCES properties (id),  -- set once the door is a property you serve
  rep_id        UUID NOT NULL REFERENCES staff_members (id),
  area_id       UUID REFERENCES canvass_areas (id),
  outcome       TEXT NOT NULL,        -- not_home, not_interested, callback, appointment_set, sold, do_not_knock
  knocked_at    TIMESTAMPTZ NOT NULL,  -- device clock
  received_at   TIMESTAMPTZ NOT NULL,  -- server clock
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  accuracy_m    REAL,
  distance_m    REAL,                 -- device position to the address point
  client_op_id  UUID NOT NULL UNIQUE  -- idempotency for offline retries
);
```

- **Configurable codes, fixed semantics.** Map each tenant's custom status to system meanings (contact made, positive, terminal) so funnels and scores stay comparable.
- **Verify location, don't reject on it.** SPOTIO tracks activity "with location verification", Badger Maps "GPS-verified check-ins". Store position, accuracy and distance to the address point and flag outliers; GPS under trees is poor, and an honest rep shouldn't lose a sale to it.
- **Two clocks.** Device time for the rep's day, server time for ordering and fraud checks ([Offline Sync](/docs/architecture/offline-sync#two-clocks)).
- **Revisit rules are dated tenant policy**, not code: how many "not home" knocks before a door rests, how long "not interested" suppresses it ([Rules as Data](/docs/architecture/rules-as-data)).
- **Emit events** (`knock.recorded`, and `agreement.signed` when the door closes a sale) for CRM, commissions and scoring ([Events](/docs/architecture/events)).

## How the Platforms Do It

Two kinds of product cover the door. Dedicated canvassing apps (SalesRabbit, SPOTIO, RepCard, Knockbase and others) handle maps, territories, knocks and team motivation, and sync into a CRM or field service system. Vertical suites build canvassing into the operational system, so a sale at the door becomes an account, an agreement and a first visit without an integration: FieldRoutes (owned by ServiceTitan) does this for pest and lawn, GorillaDesk offers a door-to-door app called DoorMamba, and Enerflo does it for solar, where the sale carries a system design and a financing product. The product-by-product comparison, including team and pay features, is in [Sales Teams & Commissions](/docs/industries/field-operations/sales-teams-and-commissions#how-the-platforms-do-it).

The products confirm the three patterns above. **Areas are polygons with history**: FieldRoutes' Region Stats report sold contract value, serviced sales value and current and past reps per region. **Every door has a status that drives the next action**: SPOTIO's one-tap "Not Home" creates a follow-up task, and RepCard's guide gives each outcome its own next step, with a 30 to 60 day drip for people who postpone. **The app works offline**: SPOTIO's "Download My Day" and FieldRoutes' offline mode let reps log knocks without signal, and FieldRoutes also creates customers, subscriptions (its term for agreements) and signed contracts offline.

## Property and Consumer Data

The best canvassing systems know something about a door before anyone knocks. The data comes from four kinds of vendor, and joining it to doors is most of the work.

| Kind | Examples | What it provides |
| --- | --- | --- |
| Assessor and recorder data | ATTOM, Cotality (formerly CoreLogic), Precisely, Melissa, Smarty, BatchData | Year built, square footage, lot size, pool, roof cover, owner occupancy, sale dates, assessed value, mortgage records, building permits |
| Parcels | Regrid | Standardized parcel geometry with ownership, zoning, building counts and flood zone |
| Mover and household data | Speedeon, Experian, Data Axle | New movers and pre-movers, homeowner status, modeled household attributes |
| Imagery and computer vision | Nearmap, EagleView, Google Solar API | Roof condition, age, material and pitch; pools; vegetation; solar potential |

Property keys, address validation and enrichment licensing in general are covered in [Customers, Accounts & Properties](/docs/industries/field-operations/customers-and-properties); key every knock, lead and sale to the same stable property key, never a raw address or APN. What's specific to the door:

- **Coverage and cadence are vendor claims.** Recorder data arrives county by county on each vendor's schedule, and Experian's own pages give both weekly and monthly mover cadences. A stale owner or a missed move-in sends a rep to the wrong door, so measure staleness against your own knocks.
- **Owner occupancy is the workhorse field.** Precisely codes absentee, probable owner-occupied and owner-occupied; BatchData sells owner-occupied, absentee and recently sold lists. A renter can't sign for the building.
- **Imagery answers what records can't.** Nearmap detects roof condition and damage from imagery captured up to six times a year; EagleView sells roof age from historical imagery; Google's Solar API returns roof segments, pitch and sunshine hours. Verisk's roof reports are insurance underwriting products, not marketing data.
- **Licenses decide where a field may go.** Google's Solar API policies generally restrict caching or storage, so you can call it at the door but not build a roof table from it. Regrid's terms bar its USPS vacancy data from direct mail campaigns. The USPS NCOALink acknowledgement says the service "may not be used to create or maintain new movers' lists," so ask any mover vendor how its list is sourced (Speedeon cites change-of-address forms from subscriptions, county records and utility connects). A field licensed for scoring mustn't flow into a mail export.

## Building a Propensity Score

A **propensity score** estimates how likely a door is to buy. SalesRabbit sells "Buyer Scores" for homes and areas; RepCard lists lead scoring; Cotality's property lists filter on "likelihood-to-sell" indicators; Faraday, a consumer data and modeling vendor, describes its method publicly. You can buy the score, build it, or both.

![Pipeline for scoring doors: vendor property, mover and imagery data plus the company's own knock and sale history are matched to a stable property key, turned into features, scored by a model, aggregated into area grid cells with neighbor effects, then filtered by Do Not Knock lists, permits and license rules before reaching the rep's map.](/diagrams/fo-door-to-door-sales-scoring.svg "Scores are built per door, aggregated per area cell, and filtered last. The legal filters run after the model so no score can put an excluded door on a map.")

**Labels.** Your knock history is the training set: a door with a conversation is an example, and a sale that survived the cooling-off period and first service is a positive. Faraday treats about 100 closed deals as a rough minimum and uses train, validation and holdout splits. Split by time (train on last season), since random splits leak neighborhood effects.

**Features.** Owner occupancy, year built, living area, pool, roof age, length of ownership, recent sale or move-in, prior customer at the address, nearby customer density, and area data such as ACS housing age (table B25034) down to block group.

**Neighbor effects.** Studying California solar, Bollinger and Gillingham calculated that "10 extra installations in a zip code increase the probability of an adoption by 7.8 percent," through visibility and word of mouth. For recurring service, neighbors also share a route. Encode active customers and recent sales in the same and adjacent cells.

**Aggregate on an area grid.** Managers choose neighborhoods, not doors, so door scores roll up to an area grid: H3, S2, geohash or census block groups. The choice is a tradeoff. H3's hexagons have equidistant neighbors, so neighbor rings approximate distance and gradients look smoother than on squares, and a resolution 9 cell averages about 0.105 km², a few blocks. S2 cells nest cleanly from level 0 to 30 and are built for spatial indexing. A geohash is a sortable text prefix that PostGIS computes directly. Census block groups are the smallest unit ACS detailed tables reach, so area features attach directly, but they vary widely in size. My default is whichever grid the rest of the platform already uses for maps, at a resolution of a few blocks: score doors, roll up to cells for area ratings and heat maps, and use adjacent cells for neighbor features.

**Models and metrics.** Faraday names logistic regression, random forests, gradient boosting and neural networks, uses boosted trees itself, reports AUC, lift, precision at k and calibration, and retrains at least quarterly. For canvassing, calibration and top-decile lift matter most: a manager choosing between neighborhoods needs honest expected sales per hundred doors.

**Holdout in the field.** A score may only predict where your best reps already went. Assign a random set of areas without the score each season and compare sales per door. RepCard's guide: if every street closes under 5%, "your problem is not the rep. It is the map."

**Knock recency is a policy.** I'd treat it as tenant policy rather than model output: rest doors after "not interested", lower priority after repeated "not home", and record the policy version with each assignment so you can test it.

## The Legal Limits

Data and doors both have rules. None of this is legal advice; the specifics change and vary by place.

**FCRA.** A **consumer report** is information from a consumer reporting agency bearing on a person's creditworthiness, character, personal characteristics or mode of living, used for eligibility for credit, insurance, employment or another permissible purpose. Marketing isn't a permissible purpose. The exception is **prescreening**: a company sets criteria, a credit bureau returns matching consumers, and the company must make a "firm offer of credit or insurance," with an opt-out the FTC describes at optoutprescreen.com. The FTC has treated target-marketing lists built from credit data as consumer reports, upheld in Trans Union Corp. v. FTC (D.C. Cir. 2001). For canvassing that means: don't buy lists or scores derived from credit files for selecting doors unless you're making a prescreened firm offer under the rules. Faraday describes its home-services "credit score proxy" as not bureau data; ask any vendor the same question in writing.

**State privacy and data broker laws.** The CCPA lets consumers opt out of the sale or sharing of personal information and excludes information from government records. It applies to a business that buys, sells, or shares the personal information of 100,000 or more California consumers or households, among other tests; [Consumer Protection](/docs/industries/field-operations/consumer-protection#privacy-in-a-field-business) has the thresholds. Data brokers register with California (annually in January; brokers had to start processing DROP deletion requests on August 1, 2026), Vermont, Texas and Oregon; Speedeon's site identifies it as a Texas data broker. If your platform sells enriched lead lists to tenants, check whether you've become one. The federal Driver's Privacy Protection Act separately bars marketing use of DMV records without express consent.

**Knocking law.** Cities regulate the knock itself with solicitor permits, allowed hours and Do Not Knock registries; the law and its limits are in [Consumer Protection](/docs/industries/field-operations/consumer-protection#before-the-sale-knocking), and the permit and credential model in [Licenses & Permits](/docs/industries/field-operations/licensing-and-permits). What lands on the canvassing app is data:

- **Each registry is a source** with an effective date, a refresh rule and an expiry rule, matched to your property key. The rules differ: Novi, MI requires permitted solicitors to download the list each day, and Lakewood, OH registrations expire every December 31.
- **A posted sign is an entry.** A "No Solicitation" sign is notice in many places (Beacon, NY's FAQ says so), so a rep-recorded "sign posted" outcome suppresses the door like a registry entry.
- **Permits and hours grey out the map** in areas where a rep holds no permit and after the local cutoff hour.

**The sale itself** triggers the FTC Cooling-Off Rule and state home solicitation laws; see [Consumer Protection](/docs/industries/field-operations/consumer-protection) and [Signing the Agreement](/docs/industries/field-operations/signing-the-agreement).

## Gamification and Leaderboards

Door-to-door teams run on competition, and the knock log is what feeds it: doors per day, contact rate and pitch-to-sale ratios come straight from `knocks`. Leaderboards, contests and the rule that a "sale" means the same thing on the board, in commissions and in finance are in [Sales Teams & Commissions](/docs/industries/field-operations/sales-teams-and-commissions#leaderboards-and-contests).

## Rep Safety and Verification

Reps work alone, outdoors, in unfamiliar neighborhoods; customers open the door to a stranger. Protect both.

**Make the rep verifiable.** Permits commonly require a visible photo ID badge, and RepCard's recruiting module includes background checks and badges. One operator PCT interviewed requires every door-to-door sale to pass a phone verification and a technician verification. Build the equivalents: a badge QR code that resolves to a company page with the rep's photo and permit status, a welcome call or message (separate from the rep) confirming price, term and cancellation right, and the technician confirming the agreement on the first visit.

**Know where reps are.** Live location on shift, shift check-ins, an alert when a device goes silent too long, and a one-tap unsafe-door flag that suppresses the door for everyone. Grey out the map after the local ordinance cutoff. Heat is the quiet hazard: NIOSH lists hot outdoor work, exertion, dehydration and lack of acclimatization as heat stress risk factors, and new reps in their first summer weeks are the unacclimatized group. Location data is sensitive too: collect it only on shift, disclose it, and retain it for a defined period ([Data Retention](/docs/architecture/data-retention)).

## Auditing

Door-to-door produces disputes in every direction: a customer who says they never agreed, a city that says a registered home was knocked, two reps claiming one sale. The field-specific records:

- **Every knock, append-only**: rep, property key, outcome, both clocks, position, accuracy and distance to the address point. Corrections are new knocks referencing the original.
- **Exclusion evidence**: the registry version loaded on the device at the time of the knock, and whether the app warned or blocked.
- **Area assignments and score lineage**: who assigned which rep to which polygon version and when (it settles ownership and commission disputes), and the vendor attributes, licenses and model version behind a score that put a door on a map.

Permits per rep are credential records ([Licenses & Permits](/docs/industries/field-operations/licensing-and-permits)). Record structure, actors and retention follow [Audit Trails](/docs/architecture/audit-trails), with field records in [Audit Trails & Records](/docs/industries/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Key everything to a stable property key.** The same key the rest of the platform uses, never a raw address or APN.
- **Separate the knock log from door status.** Append-only knocks with both clocks, location and idempotency keys; status is a rebuildable projection.
- **Enforce legal exclusions as hard blocks, offline.** Registries, sign-posted doors and unpermitted jurisdictions block leads and sales on the device.
- **Track licensing per attribute.** Vendor, license, fetch date and permitted uses, enforced in exports, caches and model training.
- **Build scores you can test.** Time-based splits, calibrated output, area-grid roll-ups with neighbor features, a field holdout every season.
- **Keep credit data out of door selection** unless the program is a prescreened firm offer under FCRA.
- **Model Do Not Knock registries as dated sources** with refresh and expiry rules, and read permits and ordinance hours from the credential model.
- **Count sales one way everywhere**, with cancellation and first-service status visible.
- **Make reps verifiable and safe**: badge lookup, independent sale verification, check-ins and silence alerts.

## References

**Specifications**

- [Cornell LII: 15 U.S.C. 1681a](https://www.law.cornell.edu/uscode/text/15/1681a), the FCRA definitions of consumer report and firm offer of credit or insurance
- [Cornell LII: 15 U.S.C. 1681b](https://www.law.cornell.edu/uscode/text/15/1681b), permissible purposes and the prescreening exception for consumer-uninitiated transactions
- [Cornell LII: 18 U.S.C. 2721](https://www.law.cornell.edu/uscode/text/18/2721), the Driver's Privacy Protection Act limit on bulk marketing use of DMV records
- [eCFR: 16 CFR 429.0, Definitions](https://www.law.cornell.edu/cfr/text/16/429.0), the FTC's definition of a door-to-door sale and its thresholds
- [California Attorney General: CCPA](https://oag.ca.gov/privacy/ccpa), opt-out of sale or sharing, the buys, sells, or shares threshold, the government records exclusion and the data broker definition
- [California Privacy Protection Agency: Data Broker Registry](https://cppa.ca.gov/data_broker_registry/), annual registration and the DROP deletion processing date
- [Vermont Statutes: 9 V.S.A. 2446](https://legislature.vermont.gov/statutes/section/09/062/02446), data broker registration, fees and penalties
- [Texas Business and Commerce Code 509.005](https://texas.public.law/statutes/tex._bus._&_com._code_section_509.005), data broker registration with the Secretary of State
- [Oregon DFR: Data Broker Registry](https://dfr.oregon.gov/business/licensing/data-broker-registry), registration before collecting or selling brokered personal data
- [USPS: Combined Processing Acknowledgement Form (PDF)](https://postalpro.usps.com/mnt/glusterfs/2023-04/Combined_PAF_v4.pdf), NCOALink limited to mailing list correction and barred from building new mover lists

**Reference**

- [BLS: Door-to-Door Sales Workers, May 2023](https://www.bls.gov/oes/2023/may/oes419091.htm), employment, wages and top industries, excluding the self-employed
- [FTC: What To Know About Prescreened Offers](https://consumer.ftc.gov/articles/what-know-about-prescreened-offers-credit-and-insurance), how prescreening works and the consumer opt-out
- [FindLaw: Trans Union Corp. v. FTC (D.C. Cir. 2001)](https://caselaw.findlaw.com/court/us-dc-circuit/1375325.html), target marketing lists built from credit data treated as consumer reports
- [H3: Introduction](https://h3geo.org/docs/), hierarchical hexagonal indexing
- [H3: Aggregation](https://h3geo.org/docs/highlights/aggregation), equidistant neighbors and smoother gradients than squares
- [H3: Tables of Cell Statistics Across Resolutions](https://h3geo.org/docs/core-library/restable), average cell areas at resolutions 9 and 10
- [S2 Geometry: S2Cell Hierarchy](https://s2geometry.io/devguide/s2cell_hierarchy), cells from level 0 to 30 used for spatial indexing
- [PostGIS: ST_GeoHash](https://postgis.net/docs/ST_GeoHash.html), a sortable, prefix-searchable text encoding of a location
- [PostGIS: ST_Intersection](https://postgis.net/docs/ST_Intersection.html), clipping one geometry by another
- [Census Bureau: ACS 5-Year Data](https://www.census.gov/data/developers/data-sets/acs-5year.html), detailed tables down to block group
- [NIOSH: About Heat Stress](https://www.cdc.gov/niosh/heat-stress/about/index.html), heat stress risk factors including lack of acclimatization
- [ATTOM: Property Data](https://www.attomdata.com/data/property-data/), property fields and building permit data
- [Precisely: Property Attributes Data Dictionary](https://docs.precisely.com/docs/sftw/precisely-apis/main/en-us/webhelp/apis/Appendix/appendix_v2_csvformat.html), absentee owner codes, roof fields and keys
- [Smarty: US Address Enrichment API](https://www.smarty.com/docs/cloud/us-address-enrichment-api), property attributes keyed by SmartyKey
- [Melissa: Property Reference Guide](https://docs.melissa.com/cloud-api/property/property-reference-guide.html), property groups and the owner occupied code
- [BatchData: Property Search Quick Lists](https://help.batchdata.io/en/articles/14795031), owner occupancy, equity and recently sold lists
- [Regrid: Terms of Use](https://www.regrid.com/terms), limits on USPS vacancy data for direct mail and on AI training
- [Speedeon: Mover Data](https://speedeondata.com/mover-data/), daily new mover refresh and the Texas data broker notice
- [Experian: Buy a Mailing List](https://www.experian.com/small-business/buy-mailing-list), homeowner lists from public records and weekly new movers
- [Data Axle: Consumer Data](https://www.data-axle.com/?p=1819), household and homeowner coverage and sources
- [Nearmap: Roofing](https://nearmap.com/au/solutions/roofing), AI roof condition and damage detection and capture frequency
- [EagleView: Property Data](https://www.eagleview.com/product/property-data/), roof age, material, condition and pitch attributes
- [Google: Solar API Overview](https://developers.google.com/maps/documentation/solar/overview), building insights and data layers
- [Google: Solar API Policies](https://developers.google.com/maps/documentation/solar/policies), caching limits, Google Map display and attribution
- [Verisk: Roof Underwriting Report](https://www.verisk.com/insurance/products/prometrix/roof-underwriting-report/), roof scoring for insurance underwriting
- [Faraday: Predictive Lead Scoring](https://faraday.ai/blog/predictive-lead-scoring-consumer-brands), labels, splits, model families, metrics and retraining
- [Faraday: Home Services Predictive Data Layer](https://faraday.ai/blog/home-services-crm-predictive-data-layer), home services features and the non-bureau credit proxy
- [ScienceDaily: Peer Effects in Solar Adoption](https://sciencedaily.com/releases/2012/10/121018162213.htm), Bollinger and Gillingham's neighbor effect estimate
- [FieldRoutes: Area Management](https://knowledgebase.fieldroutes.com/docs/area-management.md), layers, blocked regions that are visual only, and Region Stats
- [FieldRoutes: Knocking Reports](https://knowledgebase.fieldroutes.com/docs/knocking-reports.md), knock outcomes and conversion ratios
- [FieldRoutes: Mobile Offline Mode](https://knowledgebase.fieldroutes.com/docs/fieldroutes-mobile-offline-mode.md), knocks, customers, subscriptions and agreements offline
- [SalesRabbit](https://salesrabbit.com/), DataGrid Buyer Scores and area rating
- [SPOTIO](https://spotio.com/), territories by ZIP, county or custom map
- [SPOTIO: Door-to-Door Sales Software](https://demo.spotio.com/ppc-d2d-sales-software/), color-coded statuses, location verification and offline knocking
- [SPOTIO: Door-to-Door Sales](https://spotio.com/blog/door-to-door-sales/), territory setup guidance and the door funnel
- [RepCard](https://www.repcard.com/), canvassing maps, lead scoring, background checks and ID badges
- [Badger Maps](https://www.badgermapping.com/), GPS-verified check-ins
- [RepCard: Door-to-Door Canvassing](https://repcard.com/glossary/door-to-door-canvassing.md), outcome-specific next steps, neighborhood scoring and permit notes
- [Enerflo](https://enerflo.com/), solar proposals with design, pricing and financing
- [GorillaDesk: DoorMamba](https://intercom.help/gorilladesk/en/collections/15836875-doormamba), GorillaDesk's door-to-door app

**In practice**

- [PCT: Door-to-Door Sales in the Pest Control Industry](https://www.pctonline.com/news/door-to-door-sales-pest-control-industry), the 26% poll result and phone and technician verification of every sale
- [Novi, MI: Do Not Knock Registry](https://www.cityofnovi.org/services/city-clerk/do-not-knock-registry), daily download requirement for permitted solicitors
- [Lakewood, OH: Do Not Knock](https://lakewoodoh.gov/do-not-knock/), annual expiry of registrations
- [Beacon, NY: No Knock FAQ (PDF)](https://beaconny.gov/wp-content/uploads/2021/05/No_Knock_FAQ.pdf), a posted sign as notice
