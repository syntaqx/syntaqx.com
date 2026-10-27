+++
title = "Listings, Websites & Marketing"
description = "ILS syndication, property websites and AI search, paid media, accessibility, fair housing in ads, and the all-in rent laws behind every advertised price."
category = "Property Tech Industry"
order = 1708
part = "Leasing"
tags = ["property-tech", "listings", "ils", "marketing", "fee-transparency", "accessibility"]
+++

A vacant apartment earns nothing, and the first job of a leasing platform is to make sure that everyone looking for a home in the area can find it, see what it costs and ask about it. That happens on many surfaces at once: the property's own website, the large listing networks, smaller listing sites, map and directory listings, paid search and social ads, and now AI assistants that answer "find me a two-bedroom near the light rail under $2,400" by reading whatever machine-readable data they can find. Each surface shows a price, and each price is a legal statement. Since 2024 the FTC has extracted $48 million from Invitation Homes and $24 million from Greystar over advertised rents that left out mandatory monthly fees, warned thirteen property management software providers that their products may be stopping operators from advertising the total price, and opened a rulemaking on rental fees; several states and cities now require the all-in monthly amount in every rental ad.

This chapter covers how listings are syndicated, how property websites are built for search engines and AI answers, how paid media is bought and fed back with conversion data, virtual tours and media, website accessibility, fair housing in advertising at a pointer level, and the fee-transparency laws that decide what number a listing may show. The model at its center is a snapshot: which price, built from which charges, was shown on which channel at which time. What happens once a prospect responds (guest cards, attribution, tours, reviews) is in [Leads, CRM, Tours & the Leasing Center](/books/property-tech/leads-crm-and-tours); where the asking rent comes from is in [Revenue Management & Pricing](/books/property-tech/revenue-management).

## How the Platforms Do It

Every suite syndicates listings and hosts property websites; they differ in whether they also own a listing site, how they talk about AI search, and how far they connect marketing to pricing. From each vendor's own pages, as of October 2026:

| Vendor | Websites | Syndication and listing sites | Paid media and search | Price display |
| --- | --- | --- | --- | --- |
| **AppFolio** | AppFolio Sites, "mobile-responsive" and integrated with the platform; 3D virtual tours and interactive property maps on the site | Syndicates to "major rental platforms including Zillow, Apartments.com, and Zumper"; Premium Listing places listings on "dozens of the top pay-to-list websites," paying only for verified leads | Not described on the page | Bulk Pricing updates prices across units, unit types and campaigns |
| **Entrata** | ProspectPortal with "AI-driven SEO meta tagging" and an AI Website Builder; "GPT-optimized ProspectPortal indexing" announced October 2025 | Syndicates "real-time property pricing to all major Internet Listing Services" and property data to directories; Vacancy.com, "a reimagined Internet Listing Service built for AI-powered search" | Estimates revenue by lead source to guide spend | A Cost Estimation Calculator shows prospects "their all-in lease cost upfront," including optional add-ons |
| **MRI Software** | Not described on the pages opened | An ILS Syndication product in its marketing and leasing line | Not described | Not described |
| **RealPage** | "Agentic Websites," built "machine-readable and citable," with structured data, WCAG compliance and fee transparency support | No listing site of its own; the Apartments.com Network and Zillow Lease Connect appear as integrations in its partner marketplace | Agentic Search Optimization (SEO, GEO and AEO); AI Call Scoring that "feeds those signals back to Google"; DemandX Advertising aligns spend "with future exposure" | Fee transparency options on websites |
| **Rent Manager** | Custom sites and templates integrated with the database | ILS Advertising pushes "unit and property information" to ILS platforms, and "all data changes" update each ILS automatically | Not described | Not described |
| **Yardi** | RentCafe property and corporate websites with online applications and leasing | Owns RentCafe.com, a renter search site; Breeze lists available units "on popular listing sites, including RentCafe.com" | Not verified (yardi.com blocks automated access) | Not verified |

Three patterns stand out. **Syndication is table stakes, and real-time is the claim:** the suites compete on how quickly a price or availability change reaches every channel, because a stale price is both a lost lead and, under the laws below, a misstatement. **Vendors own demand as well as software:** Yardi's RentCafe and Entrata's Vacancy.com put the system of record and a listing marketplace under one owner, the dual role [The Software Landscape](/books/property-tech/software-landscape#capital-and-consolidation-as-of-october-2026) describes. **Marketing is being joined to pricing and to the call:** RealPage describes ad spend driven by the pricing model's exposure forecast and call scores sent back to the ad platform, which turns two marketing features into data-sharing and fair housing questions covered below.

## Listings and Syndication

A **listing** is the marketable statement of what is for rent: a unit, a floor plan or a whole property, with its price, availability date, features, media and policies. **Syndication** sends listings from the platform to channels, each with its own format and rules. Most of the work is the same everywhere: map the platform's properties, units and floor plans to the channel's schema, send changes, record what the channel accepted, and pull back leads.

**The networks.** Rental listing networks (internet listing services, ILSs) are the largest channel for apartment demand, and they are a concentrated market. Zillow's Rentals Feed Integrations program lets property managers and their software send listings to the Zillow Rental Network by automated feed, free, after an integration request is approved; it takes an XML feed to its own Rental Listing Bulk Feed Guide or "MITS format," supports photos, virtual tours, pricing and availability, offers real-time syndication as an add-on, and describes four to six weeks of testing against production data before listings go live. In September 2025 the FTC sued Zillow and Redfin, alleging that Zillow paid Redfin $100 million and other compensation to stop competing in multifamily rental advertising for up to nine years and act as an exclusive syndicator of Zillow listings; as of October 2026 I've confirmed the complaint, not an outcome. For a platform, concentration means one channel's schema and policies shape what the whole market can show, including whether fees can be shown at all.

**Feeds, APIs and real-time.** Channels take data three ways: a periodic bulk file (XML, often a channel-specific schema or the MITS multifamily format), an API the platform calls on change, or a real-time push. My rule: build syndication as an outbox that emits a change event per listing and lets each channel adapter batch or stream it, never as a nightly export, because price and availability change intraday under revenue management and the law treats every channel's display as an advertisement. Record each send, the channel's acknowledgment and the channel's own listing ID, so a complaint about "the price on the listing site" can be answered with what was sent and when.

**Unit-level versus floor-plan listings.** Large communities advertise either individual units (unit 214, available November 15, $2,310) or floor plans (the two-bedroom "B2," from $2,245, four available). Unit-level listings are precise and churn constantly; floor-plan listings are stable but their "from" price depends on which unit, which lease term and which move-in date produces the minimum. Revenue management prices by unit, term and date ([Revenue Management & Pricing](/books/property-tech/revenue-management)), so a floor-plan "from" price is a query over those quotes, and the snapshot has to record which quote it came from. Single-family and small-portfolio listings are almost always unit-level, one house per listing. My default is unit-level data in the platform, with floor-plan rollups computed for channels that want them.

**What a listing carries.** Price and availability; beds, baths and area; amenities and policies (pets, parking); accessibility features of the unit and building; photos, floor plan drawings and tours; and the fee disclosures below. Accessibility features belong on the listing as structured facts (step-free entrance, roll-in shower, elevator), because a prospect who needs them filters on them, and an inaccurate claim is a fair housing problem as well as a lost lease.

**Reputation and directory listings.** Beyond rental networks, a property is listed in map and business directories (Google Business Profile among them), and its name, address, phone, hours and website must match everywhere. RealPage's reputation product, powered by Yext, offers "listing syndication across 50+ directories," and Entrata's marketing hub pushes property information to "publishing sites and directories." For this chapter a directory entry is one more publication of the property's facts; the reviews that come with those listings, and the rules on soliciting and answering them, belong to [Leads, CRM, Tours & the Leasing Center](/books/property-tech/leads-crm-and-tours).

## Property Websites, Search and AI Answers

The property website is the one channel the operator fully controls: its own domain, its own copy, live pricing and availability, an application link. Vendors sell templated sites per property and per management company (RentCafe property and corporate websites, AppFolio Sites, ProspectPortal, Rent Manager's templates), and they now sell AI-assisted site building: Entrata's AI Website Builder "helps teams create and manage" its sites "with less manual effort."

**Classic search.** The fundamentals don't change for rental housing: one indexable page per property and per floor plan, fast pages, a correct and consistent name, address and phone, and content that answers renters' questions. What is specific to the industry is that the most valuable content (price, availability, fees) changes daily, so pages must render it from the platform rather than from a CMS someone edits by hand, and every page that shows a price shows the same price the feeds do.

**Structured data and machine-readable pages.** AI assistants and answer engines quote what they can parse. Schema.org has types for the domain: `ApartmentComplex` (a `Residence`) carries `numberOfAccommodationUnits`, `numberOfAvailableAccommodationUnits`, `numberOfBedrooms`, `petsAllowed` and `tourBookingPage`, and `FloorPlan` holds per-plan counts. RealPage markets sites "machine-readable and citable from the ground up" under an "Agentic Search Optimization" practice combining "SEO, GEO, and AEO" (search, generative and answer engine optimization); Entrata announced "GPT-optimized" site indexing and Vacancy.com, a listing service "built for AI-powered search." Whatever the acronym, the engineering is the same: publish accurate, structured, current facts at stable URLs. My rule: generate the structured data and the visible page from the same price computation, and include the total monthly price wherever a price appears, because an assistant that reads only a base rent from your markup will repeat it to a renter as your advertised price.

**AI agents as a channel.** When a renter's assistant reads your site or a listing service's data and answers on your behalf, you don't control the sentence it writes, but you do control the data it read. Treat AI-oriented surfaces (structured data, any feed you publish for AI search, a listing service built for assistants) as channels in the publication model, with snapshots like any other. The leasing agent that answers on the operator's own behalf is a different system, covered in [Leads, CRM, Tours & the Leasing Center](/books/property-tech/leads-crm-and-tours#leasing-contact-centers-and-ai-leasing-agents) and [AI in Property Management](/books/property-tech/ai-in-property-management#agents-by-function).

## Paid Media and the Ad Platforms

Operators buy search ads, social and display ads, video and paid placement on listing networks, through in-house teams, agencies or the suites' managed services. Generic mechanics (tracking numbers, click IDs, attribution models, cost per lead) are the same as in any local-service business, and [Marketing & Lead Sources](/books/field-operations/marketing-and-lead-sources#attribution-from-lead-to-job-to-agreement) in the Field Operations volume covers them. Three things are specific to rental housing.

### Offline conversion feedback

Ad platforms bid toward whatever conversions they are told about. A lease is signed weeks after the click, off the ad platform, so operators send outcomes back: Google's enhanced conversions for leads "uses user-provided data, such as email addresses, to supplement imported offline conversion data," hashed with SHA-256 and matched against signed-in Google accounts. RealPage's AI Call Scoring identifies callers with "intent to rent" and "feeds those signals back to Google to sharpen campaign targeting." That loop is effective and it carries three obligations:

- **Disclosure and consent.** Google's customer data policies require advertisers to "disclose to customers that you share their information with third-parties" for ad measurement and to "obtain customer consent for such third-party sharing and use where legally required," and Google recommends populating the consent field on every upload. In California, sharing personal information for cross-context behavioral advertising carries an opt-out right ([Consent & Privacy](/docs/telemetry/consent-and-privacy#california-opt-out-of-sale-and-sharing)).
- **Call recordings.** A scored call is a recorded and analyzed call, so the recording consent rules apply before any score exists ([Recording Calls](/docs/compliance/consumer-contact#recording-calls)); the score is derived personal data, and sending it to an ad platform is a further use the caller should have been told about.
- **What the bidder learns.** An ad platform optimizing toward "people like the ones who leased" can reproduce the delivery skew the Fair Housing Act prohibits, which is what the 2022 Justice Department settlement with Meta was about (below). My rule: send only funnel events (a qualified inquiry, a booked tour, an application started, a lease signed), never screening outcomes, approval decisions, income, or anything inferred about a protected characteristic, and record every upload with its consent basis so the operator can show what it sent.

### Exposure-driven spend

**Exposure** is the units vacant or on notice and not yet leased over a horizon, as defined in [Occupancy, Leased and Exposure](/books/property-tech/operating-metrics#occupancy-leased-and-exposure). Revenue management forecasts it, because exposure drives price. Marketing can use the same forecast to set spend: RealPage's DemandX Advertising claims to "align advertising spend with future exposure," "solving for vacancy before it even happens," and Entrata estimates "how much revenue your properties can make from each lead source" to guide where spend goes. The design point is a single forecast: if pricing and marketing each forecast demand separately, one cuts rent while the other cuts ads for the same week. My default is to read the exposure forecast from [Revenue Management & Pricing](/books/property-tech/revenue-management#inputs-own-public-and-pooled-data) and record which forecast each budget was set from, so a weekly budget change can be explained. The antitrust constraints on what data that forecast may use apply to marketing too, since it is the same model.

### Housing ad targeting

Housing is a special ad category on the major platforms. Google's personalized advertising policy says certain demographics ("age, gender, marital status, parental status") may not be used to target housing ads in the US and Canada, and "ZIP code location targeting cannot be used" for them. Meta retired its Special Ad Audiences tool for housing and built a "variance reduction system" under its June 2022 settlement with the Justice Department, which had alleged that its delivery algorithm discriminated in violation of the Fair Housing Act. A platform that builds or buys campaigns for operators should mark every housing campaign as such and refuse targeting options the platforms prohibit, not rely on the operator to know.

## Virtual Tours and Media

Photos, floor plan drawings, video, 3D tours and interactive maps are now expected on every listing. AppFolio offers 3D virtual tours on its sites, virtual showings and interactive property maps; RealPage's Creative Studio builds interactive 3D property maps; Zillow's feed carries virtual tours alongside photos. Self-guided and live virtual tours, which put a prospect in a building, are in [Leads, CRM, Tours & the Leasing Center](/books/property-tech/leads-crm-and-tours#tours).

Media is data like any other listing attribute. Each item belongs to a unit, a floor plan or the property, has a capture date, and stays accurate only while the unit does: a renovated kitchen makes old photos misleading. My rules: tag media as representative (a model or a sister unit) or actual, never show a representative photo as the specific unit, give every image a text alternative and every video captions, and keep the floor plan's dimensions and features as text, not only in a drawing or a 3D tour, so the facts reach screen readers and the structured data.

## Website Accessibility

Property websites and listing pages are where most renters first deal with a property, and they're sued over accessibility like any consumer website. The Justice Department's position, in guidance dated March 18, 2022, is that Title III of the ADA applies to the goods and services of public accommodations "including those offered on the web," while noting it has no regulation setting a web technical standard and pointing to WCAG. Seyfarth Shaw counted 3,117 website accessibility lawsuits filed in federal court in 2025, up from 2,452 in 2024. Whether a particular leasing website is covered by Title III is a question for counsel; the volume of suits is the reason to build as if it is. Public housing authorities are state and local government entities, covered by the Justice Department's Title II web rule published April 24, 2024.

The engineering standard is [WCAG 2.2 AA](/docs/frontend/accessibility#the-baseline-wcag-2-2-aa), and the playbook's accessibility guide covers how to build and test to it ([It's the Law, Too](/docs/frontend/accessibility#it-s-the-law-too) has the legal summary). What's specific to a property site:

- **Third-party embeds.** Availability widgets, 3D tours, chat, scheduling and payment frames are each a vendor's code on your page, and the page fails if they do. Put accessibility conformance in every embed vendor's contract and test pages with embeds loaded.
- **Maps, site plans and floor plans.** An interactive site map or unit picker must have a list or table alternative with the same data.
- **The application flow.** Online applications are forms with timeouts, identity checks and document upload, which run straight into WCAG 2.2's new criteria (Redundant Entry, Accessible Authentication, Target Size).
- **Overlays don't fix it.** A script that claims to make a site accessible on load doesn't change the underlying markup that a screen reader reads; build the templates right instead.

Accessibility of the website is one thing; accessible units are another. A listing that advertises accessible features must describe them accurately, and [Fair Housing](/books/property-tech/fair-housing#reasonable-accommodations-and-modifications) covers the design and accommodation rules for the units themselves.

## Fair Housing in Advertising

Every listing, ad, website page and social post is an advertisement under the Fair Housing Act, and the rules apply to the platform that generates them. At a pointer level (the full treatment is in [Fair Housing](/books/property-tech/fair-housing#advertising)):

- **The statute.** 42 U.S.C. 3604(c) makes it unlawful "to make, print, or publish, or cause to be made, printed, or published any notice, statement, or advertisement" with respect to the sale or rental of a dwelling that indicates a preference, limitation or discrimination based on a protected characteristic. State and local laws add characteristics, source of income among the most common.
- **HUD's regulation.** 24 CFR 100.75 extends the rule to oral and written statements, and its examples include using "photographs, illustrations, symbols or forms" that convey a preference and "selecting media or locations for advertising" that deny particular segments of the market information about available housing.
- **Ad delivery.** The 2022 Meta settlement established that the delivery algorithm, not only the advertiser's targeting choices, can produce discriminatory advertising. A platform that runs campaigns or sends conversion data inherits that question.
- **Copy and AI-written copy.** Listing descriptions are increasingly generated. Phrases like "perfect for young professionals," "no Section 8" where source of income is protected, or "ideal for singles" are classic violations, and a model trained on old listings will produce them. My rule: run every generated or edited listing description through a reviewed word-and-phrase check before publication and record which version was published where.

## Fee Transparency and All-In Pricing

This is the legal core of the chapter, because it decides the number. The rule across federal enforcement and state law, as of October 2026, is converging on one shape: **if you advertise a monthly price, it includes every fixed mandatory recurring charge, and every other fee is disclosed with its amount and purpose before you take any money.** The details differ by jurisdiction, so they belong in data.

### Federal enforcement

- **Invitation Homes (2024).** The FTC alleged the largest single-family rental owner misrepresented the total cost of renting by excluding mandatory monthly fees from the advertised price and failing to disclose them, among other claims; it was ordered to pay $48 million for consumer redress.
- **Greystar (December 2025).** On December 2, 2025, the FTC and Colorado announced a $24 million settlement ($23 million to the FTC for refunds, $1 million to Colorado) with Greystar over a "deceptively low rental price" that left out "several fixed, mandatory monthly fees." The stipulated order requires Greystar, when it advertises base rent or other partial pricing, to disclose the total monthly leasing price more prominently, and, before collecting any payment such as a nonrefundable application fee, to disclose clearly and conspicuously each fee's amount, its purpose, whether it is mandatory, and the total monthly leasing price. Both cases also pleaded the Gramm-Leach-Bliley Act's ban on false statements used to obtain customer financial information, on the theory that a false price induced applicants to hand over card or bank details for application fees. [How the Money Is Made](/books/property-tech/property-business#how-the-money-is-made) lists the fees involved.
- **The software letters (December 2025).** On December 9, 2025 the FTC announced warning letters to 13 property management software providers. The letter, dated December 8, says "available information suggests that property management software providers are limiting the ability of rental property managers and owners to accurately advertise the total monthly rental price, inclusive of all mandatory fees," names two failure modes (not accurately displaying complete pricing "across websites hosted on their platforms," and restricting owners' and managers' "ability to aggregate or convey accurate cost information" on third-party listing sites), and asks each recipient to review its "website hosting platforms and any software or coding controlling the flow of information from your software to internet listing sites." It cites civil penalties of up to $53,088 per violation of the Gramm-Leach-Bliley Act and states that receipt does not suggest illegal conduct. For a platform builder this is the most direct statement in the record: the fee model, the website and the feed are the regulator's concern, not only the operator's ad copy.
- **Rulemaking.** The FTC sent a draft advance notice of proposed rulemaking on rental housing fees to OMB on January 30, 2026, issued it on March 12, and published it in the Federal Register on March 13, 2026 (RIN 3084-AB88, docket FTC-2026-0266), with comments due April 13, 2026. It asks about fees across the lease from application to move-out, including whether total rent with mandatory fees is disclosed and whether each fee's "nature, purpose, amount, refundability, optionality, and recurrence" are accurate. As of October 2026 the Federal Register shows no proposed rule following the advance notice. Separately, the FTC's general Rule on Unfair or Deceptive Fees, effective May 12, 2025, requires total-price disclosure for short-term lodging and live-event tickets, which reaches [Short-Term Rentals](/books/property-tech/short-term-rentals#nightly-pricing) but not long-term rental housing.

### State and city laws

As of October 2026, from the statutes and official pages I opened:

| Jurisdiction | Rule | In effect | What the advertised price must do | Notable exclusions |
| --- | --- | --- | --- | --- |
| **Minnesota** | Minn. Stat. 504B.120 (2023) | In force | An advertised unit must disclose the "nonoptional fees included with the total amount for rent" in any advertisement or posting; the lease lists rent plus all nonoptional fees as the "Total Monthly Payment" on its first page; ads and leases say whether utilities are included | Treble damages and attorney fees for violations |
| **Massachusetts** | 940 CMR 38.00, the Attorney General's unfair and deceptive fees regulations | September 2, 2025 | Advertise the Total Price, "the maximum price a consumer must pay," which for a rental may be a monthly price stated with the lease duration; disclose optional fees with their nature, purpose and amount and how to avoid them, and disclose the Total Price before collecting personal or billing information | Government charges; courts have not yet applied the regulations to residential leases |
| **Colorado** | HB25-1090, deceptive pricing practices (Session Law Chapter 94) | January 1, 2026 | Clearly disclose "the maximum total (total price) of all amounts that a person may pay"; violations are deceptive trade practices under the Colorado Consumer Protection Act; the act also bars charging tenants prohibited fees | A landlord need not include the actual amount charged for utility services; government and shipping charges |
| **Connecticut** | Conn. Gen. Stat. 47a-7d, added by Public Act 25-44 | Advertising rule in the 2026 statutes; rental terms summary from April 1, 2026 | No advertising rent "in an amount that excludes any fee, charge or cost" the tenant must pay periodically; such charges are prorated and included in the advertised rent; a standardized rental terms summary is the first page of written leases | Payment processing fees when a free option exists, pet fees and deposits, submetered or directly billed variable utilities, damage charges, lockout and similar service fees; civil penalty of one month's rent |
| **Seattle** | Junk fee ordinance passed August 2026 | July 1, 2027 | Disclose fees in advertised rent; leases and renewals state rent, concessions and their duration, utilities, all mandatory and optional fees and "the total monthly cost to be paid by the tenant" | Bans certain fees outright, including administrative service charges, pet rent and package fees; the City Attorney can recover three times the illegal fees |
| **Virginia** | Va. Code 55.1-1204.1, fee disclosure statement | In force | A lease-stage rule, not an advertising one: the first page of the written lease itemizes the deposit, rent per period and one-time charges, under a statement that nothing else may be charged unless listed or added by addendum | Advertising is left to federal law |
| **California** | SB 611 (Chapter 287, Statutes of 2024) and the Honest Pricing Law (SB 478, Civil Code 1770(a)(29)) | SB 611 provisions from 2025; SB 478 from July 1, 2024 | SB 611 as enacted bars fees for serving termination notices and for paying rent or deposits by check, and adds servicemember deposit rules; the total-rent advertising language in earlier drafts is not in the enacted summary. The Attorney General says SB 478 applies to "the sale or lease of most goods and services" for personal use but does not address residential rent specifically | Treat California residential advertising as a question for counsel, and default to the all-in rule |

Other states and cities are moving the same way, and the FTC's advance notice drew comments from 27 state attorneys general urging a federal rule that leaves room for stricter state law. My rule: assume the strictest common denominator everywhere (the all-in monthly price, every mandatory recurring fee included, every other fee disclosed with amount and purpose before any payment) and let jurisdiction rules add requirements, never subtract them.

### The model: classifying every charge

The legal question for each charge a prospect could face is the same three facts, and they belong on the property's fee terms, effective-dated, not in someone's spreadsheet:

| Obligation | Recurrence | Examples | Advertised monthly price | Disclosure |
| --- | --- | --- | --- | --- |
| Mandatory | Monthly, fixed | Valet trash, pest control, package service, technology or amenity fee, required renters insurance through the property's program | **Included** in every jurisdiction above | Itemized with the total |
| Mandatory | Monthly, variable | Submetered or allocated water, sewer, trash billed by usage | Excluded from the number in Colorado and Connecticut; Minnesota requires saying whether utilities are included | Disclosed with how it's calculated and a typical range |
| Mandatory | One-time | Application fee, administrative fee, move-in fee | Not part of a monthly number | Amount and purpose before any payment is collected (the Greystar order); some are banned outright in some places (Connecticut's move-in fee ban, Seattle's administrative charges) |
| Optional | Monthly | Parking, storage, pet rent where pets are optional | Excluded | Amount, purpose and how to decline (Massachusetts) |
| Conditional | Per event | Late fee, lockout, damage, returned payment | Excluded | In the lease; amount caps are in [Charges & Resident Ledgers](/books/property-tech/charges-and-resident-ledgers#late-fees) |

The hard cases are the ones operators get wrong: a fee that is "optional" only in name (renters insurance required unless the household proves its own policy is still a requirement; a technology package nobody can decline is mandatory), a fee bundled into a "package" that varies by unit, and a concession that makes the advertised net price lower than the first bill. My rules: **mandatory means the household can't sign without paying it,** whatever its name; **compute the total from the same fee terms that the lease will schedule,** so the advertised price and the first month's mandatory charges can be reconciled mechanically; and **advertise gross price with the concession stated separately,** with its amount and duration, never a net effective rent alone. The charge catalog itself, proration and fee caps belong to [Charges & Resident Ledgers](/books/property-tech/charges-and-resident-ledgers#the-charge-catalog); this chapter decides which charges are in the advertised price.

### The snapshot

When a prospect, a regulator or a class action asks what price was shown, the answer must be a record, not a reconstruction. For every publication, store the price as shown: base rent, total monthly price, each component and how it was treated (included, disclosed separately, excluded) and why, the lease term and move-in date the price assumed, the concession, which rule version classified the fees, and a hash of the payload sent. Store a new snapshot whenever any of those change, and close the previous one, so "what did the listing site show on March 3 at noon" is a range query. The FTC letter's focus on "software or coding controlling the flow of information" to listing sites means the feed is evidence, and so is the record of which fields a channel could not carry.

## How to Build It

The listing model extends the core with a property's fee terms, listings, channels, publications and price snapshots. It references `units`, `properties` and `charge_codes` from the [core data model](/books/property-tech/property-business#the-core-data-model), `rent_quotes` and `pricing_models` from [Revenue Management & Pricing](/books/property-tech/revenue-management#how-to-build-it), and `guest_cards` from [Leads, CRM, Tours & the Leasing Center](/books/property-tech/leads-crm-and-tours#how-to-build-it). Floor plans are owned by [Portfolios, Properties & Units](/books/property-tech/portfolios-properties-and-units#buildings-floor-plans-and-units); this sketch carries a `floor_plan_id` where a listing is scoped to a plan.

```sql
CREATE TABLE fee_terms (                 -- what a prospect at this property will be charged
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  property_id    UUID NOT NULL REFERENCES properties (id),
  charge_code_id UUID NOT NULL REFERENCES charge_codes (id),
  obligation     TEXT NOT NULL CHECK (obligation IN ('mandatory', 'optional', 'conditional')),
  recurrence     TEXT NOT NULL CHECK (recurrence IN ('monthly', 'one_time', 'per_event',
                   'usage_based')),
  amount         BIGINT,                 -- minor units; null when usage-based
  amount_max     BIGINT,                 -- the most it can be, for a range or a usage estimate
  currency       CHAR(3) NOT NULL,
  purpose        TEXT NOT NULL,          -- shown to the prospect; regulators ask what it's for
  is_refundable  BOOLEAN NOT NULL,
  valid_during   DATERANGE NOT NULL,
  CHECK (recurrence = 'usage_based' OR amount IS NOT NULL),
  EXCLUDE USING GIST (property_id WITH =, charge_code_id WITH =, valid_during WITH &&)
);

CREATE TABLE listings (                  -- what is marketed: a unit, a floor plan or a property
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id              UUID NOT NULL,
  property_id            UUID NOT NULL REFERENCES properties (id),
  scope                  TEXT NOT NULL CHECK (scope IN ('unit', 'floor_plan', 'property')),
  unit_id                UUID REFERENCES units (id),
  floor_plan_id          UUID REFERENCES floor_plans (id),  -- Portfolios, Properties & Units
  status                 TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused',
                           'withdrawn')),
  available_on           DATE,
  headline               TEXT NOT NULL,
  description            TEXT NOT NULL,
  description_version    INT NOT NULL DEFAULT 1,  -- bumped on every edit; reviewed per version
  description_reviewed_at TIMESTAMPTZ,   -- the fair housing phrase check passed
  accessibility_features TEXT[] NOT NULL DEFAULT '{}',  -- from units.accessibility: 'mobility', ...
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((scope = 'unit') = (unit_id IS NOT NULL)),
  CHECK (scope <> 'floor_plan' OR floor_plan_id IS NOT NULL),
  CHECK (status <> 'active' OR description_reviewed_at IS NOT NULL)
);

CREATE UNIQUE INDEX listings_one_active_per_unit
  ON listings (unit_id) WHERE status = 'active';

CREATE TABLE listing_channels (          -- where listings go
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  name              TEXT NOT NULL,       -- 'Property website', 'Zillow Rental Network'
  kind              TEXT NOT NULL CHECK (kind IN ('own_website', 'listing_network',
                      'directory', 'ad_platform', 'structured_data', 'ai_search')),
  feed_format       TEXT NOT NULL CHECK (feed_format IN ('mits', 'channel_schema', 'api',
                      'page_markup', 'manual')),
  delivery          TEXT NOT NULL CHECK (delivery IN ('real_time', 'batch')),
  carries_fee_lines BOOLEAN NOT NULL,    -- can it show the total and its components?
  listing_scopes    TEXT[] NOT NULL,     -- which scopes it accepts: unit, floor_plan
  cost_model        TEXT CHECK (cost_model IN ('free', 'flat', 'per_lead', 'per_lease')),
  UNIQUE (tenant_id, name)
);

CREATE TABLE listing_publications (      -- a listing on a channel, over time
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id            UUID NOT NULL,
  listing_id           UUID NOT NULL REFERENCES listings (id),
  channel_id           UUID NOT NULL REFERENCES listing_channels (id),
  external_id          TEXT,             -- the channel's ID once accepted
  status               TEXT NOT NULL CHECK (status IN ('pending', 'live', 'rejected',
                         'withdrawn')),
  live_during          TSTZRANGE,        -- null until the channel acknowledges
  last_sent_at         TIMESTAMPTZ,
  last_acknowledged_at TIMESTAMPTZ,
  last_error           TEXT,
  EXCLUDE USING GIST (listing_id WITH =, channel_id WITH =, live_during WITH &&)
    WHERE (live_during IS NOT NULL)
);

CREATE TABLE advertised_prices (         -- the price as shown on one publication, over time
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  publication_id      UUID NOT NULL REFERENCES listing_publications (id),
  rent_quote_id       UUID REFERENCES rent_quotes (id),  -- the quote this price came from
  shown_during        TSTZRANGE NOT NULL,
  lease_term_months   INT NOT NULL,
  move_in_on          DATE NOT NULL,
  base_rent           BIGINT NOT NULL,
  total_monthly_price BIGINT NOT NULL,   -- base rent plus every fixed mandatory monthly fee
  currency            CHAR(3) NOT NULL,
  concession          JSONB,             -- {amount, duration_months, terms}; never netted in
  components          JSONB NOT NULL,    -- [{charge_code, amount, amount_max, treatment, reason}]
  rule_evaluation_id  UUID NOT NULL REFERENCES rule_evaluations (id),  -- fee_disclosure rules applied
  payload_sha256      BYTEA NOT NULL,    -- hash of exactly what the channel received
  CHECK (total_monthly_price >= base_rent),
  EXCLUDE USING GIST (publication_id WITH =, shown_during WITH &&)
);
```

Two tables connect marketing to the rest of the platform: the conversion signals sent to ad platforms, and the budgets set from the pricing forecast.

```sql
CREATE TABLE ad_conversion_uploads (     -- what the platform told an ad platform, and why
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  channel_id     UUID NOT NULL REFERENCES listing_channels (id),  -- kind = 'ad_platform'
  guest_card_id  UUID NOT NULL REFERENCES guest_cards (id),
  event          TEXT NOT NULL CHECK (event IN ('qualified_inquiry', 'tour_booked',
                   'application_started', 'lease_signed')),  -- funnel events only
  click_id       TEXT,                   -- as received with the lead
  sent_hashed_identifiers BOOLEAN NOT NULL,  -- email or phone, SHA-256, if any
  consent_basis  TEXT NOT NULL CHECK (consent_basis IN ('consented', 'disclosed_not_required',
                   'opted_out')),
  status         TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'rejected', 'suppressed')),
  value          BIGINT,                 -- minor units, if a value is sent
  sent_at        TIMESTAMPTZ,
  CHECK (consent_basis <> 'opted_out' OR status = 'suppressed')
);

CREATE TABLE marketing_budgets (         -- spend set from the exposure forecast
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id              UUID NOT NULL,
  property_id            UUID NOT NULL REFERENCES properties (id),
  channel_id             UUID NOT NULL REFERENCES listing_channels (id),
  period                 DATERANGE NOT NULL,
  amount                 BIGINT NOT NULL,
  currency               CHAR(3) NOT NULL,
  pricing_model_id       UUID REFERENCES pricing_models (id),  -- the forecast it was set from
  forecast_as_of         TIMESTAMPTZ,
  forecast_exposed_units INT,
  set_by                 UUID NOT NULL REFERENCES users (id),  -- staff, or the job's service user
  EXCLUDE USING GIST (property_id WITH =, channel_id WITH =, period WITH &&)
);
```

The check that matters most compares what was advertised with what the lease charges. A lease carries the `rent_quote_id` it was priced from ([The Lease](/books/property-tech/the-lease#how-to-build-it) adds the column), so every signed lease can be reconciled against the snapshots built from the same quote:

```sql
-- Leases whose first-month mandatory monthly charges exceed the total that was advertised
SELECT l.id AS lease_id, ap.publication_id, ap.total_monthly_price,
       SUM(s.amount) AS scheduled_mandatory_monthly
FROM leases l
JOIN advertised_prices ap ON ap.rent_quote_id = l.rent_quote_id
JOIN lease_charge_schedules s
  ON s.lease_id = l.id AND s.frequency = 'monthly' AND s.amount > 0
     AND s.valid_during @> l.starts_on
JOIN charge_codes cc ON cc.id = s.charge_code_id
LEFT JOIN fee_terms ft
  ON ft.property_id = l.property_id AND ft.charge_code_id = s.charge_code_id
     AND ft.valid_during @> l.starts_on
WHERE l.tenant_id = $1
  AND (cc.category = 'rent' OR (ft.obligation = 'mandatory' AND ft.recurrence = 'monthly'))
GROUP BY l.id, ap.publication_id, ap.total_monthly_price
HAVING SUM(s.amount) > ap.total_monthly_price;
```

A second check finds channels that disagree with the property website at the same instant, which is the failure the FTC letter describes:

```sql
SELECT p.listing_id, c.name, ap.total_monthly_price, site.total_monthly_price AS website_total
FROM advertised_prices ap
JOIN listing_publications p ON p.id = ap.publication_id
JOIN listing_channels c ON c.id = p.channel_id
JOIN listing_publications sp ON sp.listing_id = p.listing_id
JOIN listing_channels sc ON sc.id = sp.channel_id AND sc.kind = 'own_website'
JOIN advertised_prices site ON site.publication_id = sp.id
  AND site.shown_during @> $2::timestamptz
WHERE ap.tenant_id = $1
  AND ap.shown_during @> $2::timestamptz
  AND c.kind <> 'own_website'
  AND ap.total_monthly_price <> site.total_monthly_price;
```

Design decisions behind it:

- **Fee terms are per property and effective-dated.** The same charge code is mandatory at one community and optional at another, and changes over time; the advertised total for any past date is computable from the terms in force ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).
- **Jurisdiction rules classify, data doesn't hard-code.** Which components are included, disclosed or excluded, and which fees are banned outright, comes from rules resolved from the property's jurisdiction, versioned, with the version stored on every snapshot ([Rules as Data](/docs/architecture/rules-as-data#record-which-rule-decided)). [Landlord-Tenant Law as Data](/books/property-tech/landlord-tenant-law#the-rules-matrix) holds the rules; this chapter applies them.
- **A channel that can't carry fee lines still gets the total.** `carries_fee_lines` records the channel's limit; when it's false, the adapter sends the total monthly price as the price and links to the itemization, and the snapshot records that. Sending base rent because the channel has no fee field is exactly what the FTC letters warn about.
- **One price computation.** The website page, its structured data, every feed and the leasing agent's answer all call the same function over `rent_quotes` and `fee_terms`; no channel adapter computes its own price.
- **Snapshots are append-only ranges.** A change closes the open snapshot and opens a new one; nothing is updated in place ([Snapshot What Changes Underneath You](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).
- **Conversion uploads are a consented outbound flow.** They pass the same consent check as any other outbound use of a person's data, at send time, with suppression recorded rather than silently skipped ([The Consent Ledger](/docs/architecture/notifications#the-consent-ledger)).

Events: `listing.published`, `listing.withdrawn`, `advertised_price.changed`, `publication.rejected` and `ad_conversion.sent`, consumed by channel adapters, the leasing center's availability view and the audit store ([Events & Async Messaging](/docs/architecture/events)).

## Auditing

Listings produce the records that fee-transparency enforcement, fair housing complaints and accessibility suits ask for:

- **The price shown, per channel, per moment.** Every `advertised_prices` snapshot with its components, rule version and payload hash, kept for as long as a lease priced from it might be disputed, and the reconciliation of each signed lease against the price advertised for its quote.
- **Fee terms over time.** Which charges were mandatory, optional or conditional at each property on each date, with amounts and stated purposes, and who changed them.
- **What each channel could carry and what it rejected.** Channel capability records and rejection messages show whether a missing fee line was the operator's choice or the channel's limit.
- **Listing copy as published.** Each description version, its review, and where it ran: the evidence in a 3604(c) complaint.
- **Ad campaigns and conversion uploads.** Housing category flags and targeting settings per campaign, and every conversion sent to an ad platform with its event type and consent basis.
- **Accessibility.** Test results for templates and embeds by release, and the accessibility statement in force on each date.

The mechanics (typed actors, append-only history, retention) are in [Audit Trails](/docs/architecture/audit-trails); retention periods and records requests are in [Records, Privacy & Audits](/books/property-tech/records-privacy-and-audits#retention-and-legal-holds).

## What This Means for the System You Build

- **Compute one price, everywhere:** website pages, structured data, every feed and every agent answer read the same computation over rent quotes and fee terms.
- **Advertise the total monthly price,** with every fixed mandatory recurring fee in it, every other fee itemized with amount and purpose, and concessions stated separately; let jurisdiction rules add requirements, never remove them.
- **Classify every charge by obligation and recurrence per property,** effective-dated, and treat "optional only in name" as mandatory.
- **Snapshot what each channel showed and when,** with components, rule version and a payload hash, and reconcile every signed lease against it.
- **Syndicate from an outbox in near real time,** and record each send, acknowledgment, external ID and rejection.
- **Never let a channel's missing fee field turn the total into base rent:** send the total and link the itemization.
- **Publish machine-readable facts** (schema.org types, stable URLs) from the same data as the page, because AI answers will quote them.
- **Send ad platforms funnel events only,** with consent recorded, and never screening outcomes or inferred characteristics.
- **Set marketing spend from the pricing model's exposure forecast,** and record which forecast each budget used.
- **Build to WCAG 2.2 AA, embeds included,** and keep unit facts in text, not only in tours and drawings.
- **Review every listing description before it publishes,** generated or not, and flag every housing campaign as a special ad category.

## References

**Federal enforcement and rulemaking**

- [FTC: Greystar agrees to pay $24 million to stop deceptive advertising practices](https://ftc.gov/news-events/news/press-releases/2025/12/greystar-agrees-pay-24-million-stop-deceptive-advertising-practices-result-ftc-colorado-lawsuit), the December 2, 2025 settlement, the split between the FTC and Colorado, and the order's total monthly leasing price and pre-payment disclosure terms
- [FTC: FTC sends warning letters to 13 property management software providers nationwide](https://www.ftc.gov/news-events/news/press-releases/2025/12/ftc-sends-warning-letters-13-property-management-software-providers-nationwide), the December 9, 2025 announcement and the number of recipients
- [FTC: Warning letter template for property management software providers (PDF)](https://www.ftc.gov/system/files/ftc_gov/pdf/ftc-letter-to-pms_12032025.pdf), the December 8, 2025 letter: the concern about hosted websites and listing-site data flows, the request to review feed code, the $53,088 penalty, the Invitation Homes $48 million and Greystar case summaries, and the statement that receipt does not suggest illegal conduct
- [FTC: FTC submits draft ANPRM related to rental housing fees to OMB for review](https://www.ftc.gov/news-events/news/press-releases/2026/01/ftc-submits-draft-anprm-related-rental-housing-fees-omb-review), the January 30, 2026 referral
- [FTC: FTC seeks public comment on proposed rulemaking regarding unfair or deceptive rental housing fee practices](https://ftc.gov/news-events/news/press-releases/2026/03/ftc-seeks-public-comment-proposed-rulemaking-regarding-unfair-or-deceptive-rental-housing-fee), the March 12, 2026 advance notice and the fee attributes it asks about
- [Federal Register API: Rule on Unfair or Deceptive Rental Housing Fee Practices (2026-04907)](https://www.federalregister.gov/api/v1/documents/2026-04907.json), publication on March 13, 2026, RIN 3084-AB88, comments due April 13, 2026
- [Federal Register API: FTC rental housing fee documents, newest first](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=rental+housing+fee&conditions[agencies][]=federal-trade-commission&order=newest), no proposed rule after the advance notice as of October 2026
- [Federal Register API: Trade Regulation Rule on Unfair or Deceptive Fees (2024-30293)](https://www.federalregister.gov/api/v1/documents/2024-30293.json), total-price rule for live-event tickets and short-term lodging, effective May 12, 2025
- [Gibson Dunn: 27 state attorneys general urge FTC to pursue rulemaking on rental housing fees](https://www.gibsondunn.com/27-state-attorneys-general-urge-ftc-to-pursue-rulemaking-on-rental-housing-fees/), the attorneys general's April 2026 comments and docket FTC-2026-0266
- [FTC: FTC sues Zillow and Redfin over illegal agreement to suppress rental advertising competition](https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-sues-zillow-redfin-over-illegal-agreement-suppress-rental-advertising-competition), the September 30, 2025 complaint, the $100 million payment and exclusive syndication allegations

**State and city law**

- [Minnesota Statutes 504B.120](https://www.revisor.mn.gov/statutes/cite/504B.120), nonoptional fees in advertisements, the Total Monthly Payment on the lease's first page, utilities disclosure, treble damages
- [Hudson Cook: New Massachusetts business rule continues recent regulation of rental price disclosures](https://www.hudsoncook.com/article/new-massachusetts-business-rule-continues-recent-regulation-of-rental-price-disclosures/), 940 CMR 38.00's September 2, 2025 effective date, Total Price definition, monthly price for rentals, optional fee and pre-collection disclosure
- [Choate: Massachusetts unfair and deceptive fee regulations and residential real estate](https://www.choate.com/?p=4645), application to residential leases not yet tested, consequences under Chapter 93A (March 10, 2026)
- [Colorado General Assembly: HB25-1090, Protections Against Deceptive Pricing Practices](https://leg.colorado.gov/bills/hb25-1090), signed April 21, 2025, effective January 1, 2026, total price definition, utility exception, Consumer Protection Act enforcement
- [Connecticut General Statutes, 2026 Supplement, Chapter 830](https://www.cga.ct.gov/2026/sup/chap_830.htm), Section 47a-7d (P.A. 25-44): periodic charges in advertised rent, exclusions, rental terms summary from April 1, 2026, one month's rent penalty
- [Connecticut General Statutes, Chapter 830](https://www.cga.ct.gov/current/pub/chap_830.htm), Section 47a-4d: limits on payments demanded from prospective tenants and the ban on move-in and move-out fees
- [Multifamily Dive: Seattle bans rental junk fees](https://www.multifamilydive.com/news/seattle-ban-rental-junk-fees/827816/), the 8-0 vote, July 1, 2027 effective date, banned fees, lease disclosures including total monthly cost, treble recovery
- [KUOW: Seattle bans landlords from charging junk fees like pet rent](https://www.kuow.org/governing/2026-08-11/seattle-bans-landlords-from-charging-junk-fees-like-pet-rent), fees disclosed in advertised rent, effective date (August 11, 2026)
- [Code of Virginia 55.1-1204.1](https://law.lis.virginia.gov/vacode/title55.1/chapter12/section55.1-1204.1/), the fee disclosure statement on the lease's first page
- [Digital Democracy: SB 611 (2023-2024)](https://calmatters.digitaldemocracy.org/bills/ca_202320240sb611), chaptered September 19, 2024 as Chapter 287; notice fees, check-payment fees and servicemember deposits
- [California Attorney General: Hidden fees (SB 478)](https://oag.ca.gov/hiddenfees), the Honest Pricing Law from July 1, 2024 and its scope over "the sale or lease of most goods and services"

**Fair housing and ad platforms**

- [42 U.S.C. 3604 (LII)](https://www.law.cornell.edu/uscode/text/42/3604), subsection (c) on discriminatory notices, statements and advertisements
- [24 CFR 100.75 (LII)](https://www.law.cornell.edu/cfr/text/24/100.75), HUD's advertising regulation, including photographs and selection of media or locations
- [Nextgov: Meta settles with Justice on discriminatory housing ads](https://www.nextgov.com/digital-government/2022/06/meta-settles-justice-discriminatory-housing-ads/368441/), the June 2022 settlement, retirement of Special Ad Audiences, the variance reduction system
- [Google Ads: Restricted targeting in personalized advertising](https://support.google.com/adspolicy/answer/143465?hl=en), demographic and ZIP code targeting restrictions for US and Canadian housing ads
- [Google Ads: Enhanced conversions for leads](https://support.google.com/google-ads/answer/11021502), user-provided data supplementing offline conversion imports, SHA-256 hashing, the consent field
- [Google Ads: Customer data policies](https://support.google.com/adspolicy/answer/7475709), disclosure of third-party sharing and consent where legally required

**Accessibility**

- [ADA.gov: Guidance on web accessibility and the ADA](https://www.ada.gov/resources/web-guidance/), March 18, 2022: Title III and the web, no regulatory technical standard, WCAG as guidance, the April 24, 2024 Title II rule
- [W3C: Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/), the current Recommendation and its new success criteria
- [Mondaq (Seyfarth Shaw): Federal court website accessibility lawsuit filings bounce back in 2025](https://www.mondaq.com/unitedstates/discrimination-disability-sexual-harassment/1766320/federal-court-website-accessibility-lawsuit-filings-bounce-back-in-2025), 3,117 federal filings in 2025 and 2,452 in 2024 (March 30, 2026)

**Specifications**

- [Zillow Group: Rentals Feed Integrations](https://www.zillowgroup.com/developers/api/rentals/), approval, the bulk XML feed or MITS format, photos, tours, pricing and availability, real-time syndication, four to six weeks of testing
- [Schema.org: ApartmentComplex](https://schema.org/ApartmentComplex), unit counts, available units, bedrooms, pets and tour booking page properties, and the FloorPlan type

**Platforms**

- [AppFolio: Marketing and leasing](https://www.appfolio.com/property-manager/marketing-leasing), syndication to Zillow, Apartments.com and Zumper, Premium Listing, AppFolio Sites, 3D tours, maps, virtual showings, Bulk Pricing
- [Entrata: ProspectPortal](https://www.entrata.com/products/prospectportal), AI-driven SEO tagging, AI Website Builder, the all-in Cost Estimation Calculator, real-time pricing and availability
- [Entrata: Marketing Strategy Hub](https://www.entrata.com/products/marketing-strategy), real-time pricing syndication to ILSs, directory syndication, revenue estimates by lead source
- [Entrata: AI-powered platforms at Summit 2025](https://www.entrata.com/press/entrata-unveils-ai-powered-platforms-at-summit-2025-bringing-autonomous-property-management-tm-closer-to-reality), Vacancy.com and GPT-optimized indexing (October 3, 2025)
- [MRI Software: ILS Syndication](https://www.mrisoftware.com/products/ils-syndication/), the product in its marketing and leasing line
- [RealPage: Demand Marketing](https://www.realpage.com/solutions/demand-marketing/), machine-readable websites, WCAG and fee transparency, Agentic Search Optimization, AI Call Scoring fed to Google, Yext-powered syndication to 50+ directories, 3D maps
- [RealPage: Demand Generation](https://www.realpage.com/solutions/demand-generation/), DemandX Advertising and Leasing aligned with future exposure
- [RealPage Exchange](https://www.realpage.com/exchange/), the Apartments.com Network and Zillow Lease Connect among integration partners
- [Rent Manager: Marketing and leasing](https://www.rentmanager.com/marketing-leasing/), ILS Advertising with automatic updates, website services
- [Yardi Breeze: Residential features](https://www.yardibreeze.com/residential-features/), listing on RentCafe.com, RentCafe property and corporate websites, online applications and leases
