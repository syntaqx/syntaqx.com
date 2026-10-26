+++
title = "Licenses & Permits"
description = "Who may do what, where: business, trade and contractor licenses, applicator and tester credentials, solicitor permits, supervision, renewals and state lookups."
category = "Field Operations Industry"
order = 1516
part = "The Rules"
tags = ["field-operations", "licensing", "permits", "compliance", "jurisdictions", "scheduling"]
+++

Every field service job sits on a stack of permissions. The company needs a license to operate in the state, sometimes one per branch office. The technician needs a license or certification for the category of work (a journeyman plumber's license, a pesticide applicator's certification, a backflow tester's license), sometimes in each state they cross into, and an apprentice needs a licensed supervisor. The salesperson knocking on the door may need a permit from the city, and in some cities a copy of the list of houses they're not allowed to knock. Each of these has a number, a holder, an issuing authority, a scope and an expiration date, and each one can quietly lapse on a Tuesday while the schedule for Wednesday is already built. The cost of getting it wrong isn't a bug report: it's an unlicensed application on a state record, a citation for a rep working without a permit, or a sale that has to be unwound.

This chapter covers the kinds of licenses and permits field operations run into, how platforms track them, and how to build a licensing model that the scheduler, the dispatcher and the sales app all respect. The materials those licenses authorize are covered in [Regulated Materials](/docs/industries/field-operations/regulated-materials).

## The Layers of Permission

Four kinds of credential show up in almost every trade, issued by different authorities with different rules.

**Business licenses** let the company operate, and in the licensed trades the business license usually rests on a named individual. In Texas, an electrical contractor must employ a master electrician of record, who can serve only one contractor unless they own more than half of it, and must name a new one within 30 business days if that master leaves. A plumbing business works under a master plumber holding the Responsible Master Plumber designation, backed by at least $300,000 of commercial liability insurance. A structural pest control business needs a license for each location, branches included, each naming a **responsible certified applicator** who can't serve any other licensee or location, and has 20 business days to request a hardship in writing if that applicator dies or leaves. A Texas pest license that isn't renewed by its expiration date lapses; it can be renewed up to a year later, but the business can't operate in between. Local business licensing varies by city and county, so check it wherever a branch operates.

**Individual licenses and certifications** let a person do a category of work, usually in tiers: apprentice, journeyman and master electricians at TDLR; tradesman-limited, journeyman and master plumbers, with endorsements such as medical gas piping, at the Texas plumbing board; **Applicators**, **Field Representatives** and **Operators** across California's three structural pest branches (fumigation, general pest, wood-destroying organisms). In pesticides the federal floor is 40 CFR 171: anyone who applies or supervises restricted use pesticides must be certified under an EPA-approved state plan, and many states certify all commercial application. Texas registers pest **apprentices** within 10 days of starting work, on a card valid 12 months from hire, by which time they must pass the technician exam. HVAC technicians who handle refrigerant need EPA Section 608 certification by appliance type.

Some credentials ride on top of a trade. A Texas backflow tester holds a TCEQ Backflow Prevention Assembly Tester license (a 40-hour course and a state exam), and a city such as Austin adds its own tester registration, registered test gauges calibrated by an approved company, and a test report filed online within five calendar days of each test: a license, a local registration and an equipment calibration, each with its own expiry. Florida separates its pool contractor licenses (commercial, residential and servicing) from the public pool service technician certification anyone servicing a public pool needs, which takes a course of at least 16 hours, "does not imply any licensure" as a contractor, and can't be delegated to uncertified employees. A commercial driver's license is a credential too, needed for vehicles above the thresholds in [Fleet, Inventory & Safety](/docs/industries/field-operations/fleet-and-safety), and it belongs in the same model as any trade license.

**Supervision relationships** let an unlicensed or lower-tier person work under someone else's license. Federal rules let a noncertified person apply a restricted product under a certified applicator's direct supervision, with training and equipment instruction in the last 12 months, label access, and a way to reach the supervisor immediately (40 CFR 171.201). Texas requires a licensed applicator physically present until an apprentice's training is done, then at least three days a week, and requires technicians to meet their supervising certified applicator in person once a week.

**Local permits** let a person sell or work in a city. Solicitor and peddler permits are the common case for door-to-door sales, covered next.

## Solicitor Permits and No-Knock Lists

Cities regulate door-to-door commercial selling through permits, and the rules are local in every sense. A few verified examples:

| City | Permit and screening | Hours | Do-not-knock |
| ---- | -------------------- | ----- | ------------ |
| Independence, MO | Online permit application, criminal history check, government photo ID carried and permit displayed | 9 AM to 6 PM | City "No Solicitors" list given on approval; skip homes with "No Solicitation" or "No Trespassing" notices |
| Glenview, IL | Registration with the police department, records check, photo ID badge; peddlers pay $60 a year, licenses expire December 31 | 9 a.m. to 9 p.m. | Skip doors with a "No Solicitor/Peddler" sign |
| La Vergne, TN | City permit, criminal background check, ID badge residents may ask to see | Not published | Commercial solicitors may not solicit at addresses on the city's "No Knock" registry |
| Rogers, AR | Peddler's permit for each salesperson | Not published | Each salesperson buys the No-Knock List and carries it with the permit; residents re-register every two years |

Check the current ordinance before relying on any of these; they change, and every municipality writes its own.

The constitutional frame explains why the rules target commercial selling. In *Watchtower Bible & Tract Society v. Village of Stratton* (2002), the Supreme Court held that a permit requirement for door-to-door advocacy violated the First Amendment as applied to religious proselytizing, anonymous political speech and handbills, while noting that an ordinance applying "only to commercial activities and the solicitation of funds" would arguably have been tailored to residents' privacy and fraud prevention, and that residents' ability to post "No Solicitation" signs already protected them. Municipal guidance such as Washington's MRSC summarizes what cities typically do as a result: license commercial solicitors, charge annual or daily fees, run background checks, limit hours, require license display, and exempt religious, political and charitable canvassers. Field service companies sell commercially, so they are squarely inside these rules. How reps work the territory, including how Do Not Knock registries suppress doors on the canvassing map, is covered in [Door-to-Door Sales](/docs/industries/field-operations/door-to-door-sales).

For a system, a solicitor permit is a license held by a staff member, scoped to one city, with an expiration, plus two location rules: allowed hours and a set of excluded addresses that comes from the city (a registry) or from the door itself (a sign the rep records).

## How the Platforms Track Licenses

Public documentation on licensing is thin across the market; the pest verticals and the enterprise schedulers document the most, and they converge on one idea: the scheduler matches **skills**, and a license is the evidence behind a skill.

| Platform | What's documented |
| -------- | ----------------- |
| FieldRoutes | Licenses on the user profile, each with a number and optional linked skills and states. A license linked to a state prints only on services in that state, one linked to a skill only on services using that skill, and the primary, additional and supervising technicians' licenses all print on the notification. An Arizona license is required before a technician can complete an Arizona termite action registration form (TARF) in the app. A Licenses API exposes the records, with states and skills linked separately. |
| PestPac (WorkWave) | "Attempting to assign a job to a technician without required licensing triggers an automatic warning"; routing uses skill types such as "termite license." |
| Jobber | Chemical tracking setup holds company licensing information and applicator license numbers, which appear on treatment records. |
| Timefold | Technician `skills` on a shift and `temporarySkillSets` that grant skills only between a `start` and an `end`; visits list `requiredSkills` with an optional `minLevel`; "Require skills" is a hard constraint, so a visit no qualified technician can take stays unassigned. |
| Salesforce Field Service | Skills on service resources with a skill level and effective start and end dates, where the end date can represent when a certification expires. |

Two gaps show in these docs. FieldRoutes' knowledge base suggests putting a sales rep's license number in permanent customer notes so it prints on the agreement, a sign of how often sales credentials end up outside the license model entirely. And its published license fields carry no issue or expiration date, which is what turns a list of numbers into something a scheduler can enforce.

## A Licensing Model

The vendor precedents combine into one workable design. Keep licenses as their own records linked to states and skills, as FieldRoutes does. Give each staff member's skills a level and a validity period, as Salesforce Field Service does. Treat a visit's required skills as a hard constraint, as Timefold does. And store what each jurisdiction requires for each kind of work as rows with their own validity, so a change in the law is a data change ([Rules as Data](/docs/architecture/rules-as-data)). The schema below adds licensing tables to the canonical model in [The Field Operations Business](/docs/industries/field-operations/field-operations-business); it doesn't redefine visits or properties.

```sql
CREATE TABLE jurisdictions (            -- each tenant loads the boundaries it works in
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id   UUID NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('state', 'county', 'city', 'tribe')),
  name        TEXT NOT NULL,
  parent_id   UUID REFERENCES jurisdictions (id),
  boundary    GEOMETRY(MULTIPOLYGON, 4326)
);

CREATE TABLE licenses (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  org_unit_id         UUID REFERENCES org_units (id),      -- held by the business or a branch
  staff_member_id     UUID REFERENCES staff_members (id),  -- held by one worker
  employer_license_id UUID REFERENCES licenses (id),       -- the business license an individual
                                                           -- license counts under, when the issuer
                                                           -- ties it to one employer
  qualified_by_license_id UUID REFERENCES licenses (id),   -- the individual license a business
                                                           -- license rests on (master of record)
  jurisdiction_id     UUID REFERENCES jurisdictions (id),  -- null for federal or private programs
  issuer              TEXT NOT NULL,   -- TDLR, state pesticide agency, city clerk, EPA-approved certifier
  license_type        TEXT NOT NULL,   -- 'Journeyman Plumber', 'Branch 2 Field Representative', 'Solicitor permit'
  license_number      TEXT NOT NULL,
  status              TEXT NOT NULL CHECK (status IN ('pending', 'active', 'renewal_window',
                        'expired', 'suspended', 'revoked')),
  valid_during        DATERANGE NOT NULL,  -- issued to expiry, closed-open
  verified_at         TIMESTAMPTZ,
  verification_source TEXT,            -- 'tda_csv:2026-10-19', 'manual_lookup'
  proof_document_id   UUID,
  CONSTRAINT licenses_one_holder CHECK (num_nonnulls(org_unit_id, staff_member_id) = 1)
);

CREATE TABLE staff_member_skills (     -- what the scheduler matches
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  staff_member_id UUID NOT NULL REFERENCES staff_members (id),
  skill           TEXT NOT NULL,       -- 'termite_treatment', 'backflow_testing', 'cdl_class_b', 'solicitation'
  level           INTEGER,
  license_id      UUID REFERENCES licenses (id),  -- the license this skill rests on, if any
  valid_during    DATERANGE NOT NULL,
  CONSTRAINT staff_member_skills_valid_during_excl
    EXCLUDE USING GIST (staff_member_id WITH =, skill WITH =, valid_during WITH &&)
);

CREATE TABLE skill_requirements (      -- what a kind of work needs, where
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id              UUID NOT NULL,
  jurisdiction_id        UUID NOT NULL REFERENCES jurisdictions (id),
  service_type_id        UUID,         -- null for a sales activity
  activity               TEXT NOT NULL,  -- 'service' or 'door_to_door_sale'
  skill                  TEXT NOT NULL,
  min_level              INTEGER,
  is_supervision_allowed BOOLEAN NOT NULL DEFAULT FALSE,
  source_url             TEXT NOT NULL,  -- the statute or rule counsel relied on
  valid_during           DATERANGE NOT NULL
);

CREATE TABLE supervisions (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id              UUID NOT NULL,
  supervisor_license_id  UUID NOT NULL REFERENCES licenses (id),
  supervisee_id          UUID NOT NULL REFERENCES staff_members (id),
  training_record_id     UUID,         -- training and equipment instruction, with dates
  presence_rule          TEXT NOT NULL,  -- 'on_site', 'reachable', 'on_site_3_days_week'
  valid_during           DATERANGE NOT NULL
);
```

The design choices:

- **Skills are what scheduling sees; licenses are the evidence.** The optimizer, the booking engine and the sales app ask one question, whether this staff member has this skill at this level on this date, which is the shape Timefold and Salesforce consume. A skill that rests on a license carries its `license_id`, and its validity can't outlast the license. Branch 2 versus Branch 3, Core versus Type 2, and permit versus registry rules then stay in the licensing data instead of leaking into routing code.
- **The alternative is skills alone,** with expiry dates typed onto each skill, which is closer to what the schedulers ship out of the box. It's simpler, and it works for a single-state business with a few license types. The cost is that the legal rule ("termite work in this state needs this category") hides inside whoever configured the skill, and a renewed license has to be re-keyed into every skill it supports. My default is the split above once a business works in more than one state.
- **Licenses belong to the right holder.** A license has exactly one holder: an org unit (the company or a branch, since Texas pest control licenses each location) or a staff member. Some individual licenses count for one employer only (a Texas pest technician must be licensed for each business employing them), so `employer_license_id` points the individual license at the business license it works under. The dependency also runs the other way: a business license that rests on a named individual (a responsible certified applicator, a master electrician of record, a Responsible Master Plumber) names that person's license in `qualified_by_license_id`, so their departure finds every business license at risk. Workers are `staff_members`, never the customer-side `people` table ([The Field Operations Business](/docs/industries/field-operations/field-operations-business)).
- **Status is stored and recomputed by a job.** The end of `valid_during` drives a daily job that moves licenses into `renewal_window` and then `expired`, and dependent skills stop qualifying the same day ([Background Jobs](/docs/architecture/background-jobs#scheduling)). Suspension and revocation come from verification or a manual action. Every change is an event.
- **Never delete a license.** Old application records and service notifications refer to the license that was valid then. Copy the number into those records at the time, as [Regulated Materials](/docs/industries/field-operations/regulated-materials) does, so renewals and corrections never rewrite history ([Temporal Data](/docs/database/temporal-data)).

## Jurisdictions Overlap

A single address falls inside a state, a county and often a city, and each can impose its own requirement. For licensing the combination is "all apply": the worker must satisfy every applicable requirement from every jurisdiction that contains the point ([Rules as Data: When Rules Overlap](/docs/architecture/rules-as-data#when-rules-overlap)).

What's field-specific is resolving the jurisdictions. Do it once, when an address is validated, by point-in-polygon against stored boundaries, and save the jurisdiction IDs on the property ([Customers, Accounts & Properties](/docs/industries/field-operations/customers-and-properties)). The Census Bureau's TIGER/Line Shapefiles are the free public source, with legal boundaries as of January 1 of the release year, updated through the annual Boundary and Annexation Survey. City limits don't follow ZIP codes, and unincorporated areas have no city at all, so a ZIP-to-city table gives wrong answers exactly where solicitor permits and local licenses change. When boundaries change, re-resolve the affected properties.

Multi-state technicians are common near borders and on commercial routes. Because requirements are keyed by jurisdiction, a technician licensed in two states simply holds two licenses, and FieldRoutes' state-linked licenses handle the printing side of the same problem.

## Supervision

Supervision is a relationship with conditions, not a checkbox. For a restricted-use application by a noncertified person, the system should be able to show, for that date, that the supervisor's certification was active, the supervisee's training and equipment instruction were within 12 months, the label was accessible (the product label synced to the device), and the two could reach each other. For Texas apprentices, it also has to know whether training is complete, because that changes the presence rule from always on site to on site three days a week.

Model it with the `supervisions` table and check it in two places. At scheduling, a visit assigned to a supervisee needs a supervisor with the required skill who is working that day and, if the rule requires presence, assigned to the same visit or nearby. At completion, the application record stores both staff members and both license numbers. If the supervisor calls in sick, the supervisee's schedule for restricted work has to change, which is a dispatch event like any other ([Dispatch & the Day of Service](/docs/industries/field-operations/dispatch)).

Other trades have the same shape under different names. A California contractor license held by a company is qualified by an individual, such as a responsible managing officer or a responsible managing employee; a Texas electrical contractor has its master electrician of record and a Texas plumbing business its Responsible Master Plumber, much like Texas's responsible certified applicator for a pest control business. Model each as a business license's `qualified_by_license_id` rather than a special case. Some credentials allow no supervision at all: Florida's public pool service certification bars delegating to uncertified employees, so its requirement row carries `is_supervision_allowed = FALSE` and an uncertified helper can't be scheduled onto the visit alone.

## Enforcing in Scheduling and Sales

![A license moves from pending to active once verified. Ahead of its expiration date it enters a renewal window where it still allows work but raises alerts. If renewed and verified it returns to active; if the date passes it becomes expired, and only a late renewal brings it back. Suspended and revoked are reachable from any state. A row beneath each state shows whether the scheduler may assign licensed work: no when pending, yes when active, yes with a warning in the renewal window, and no when expired, suspended or revoked.](/diagrams/fo-licensing-and-permits-states.svg "A license's state decides whether the skills that rest on it qualify anyone. The renewal window is the only state that allows work while demanding action.")

Enforcement belongs at every point where work or a sale is committed, because each point can be reached without the others.

- **Service types.** A service type declares the skills it needs (termite treatment, backflow testing, electrical service, public pool service, refrigerant recovery), resolved per jurisdiction from `skill_requirements`. FieldRoutes' skill-linked licenses are a working example of tying the two together.
- **Routing and booking.** Required skills become hard constraints for the optimizer, the way Timefold's "Require skills" leaves a visit unassigned rather than give it to an unqualified technician ([Route Optimization](/docs/industries/field-operations/route-optimization)). Send time-bounded skills, like Timefold's `temporarySkillSets` or Salesforce's effective dates, so a license expiring on the 14th stops qualifying the technician for visits on the 15th even in a schedule built weeks ahead.
- **Manual assignment.** A dispatcher dragging a job onto a technician sees PestPac-style warnings for soft problems and a block for hard ones. An override needs a reason and is recorded.
- **Day-of dispatch and completion.** Re-check at dispatch and again when the technician completes the visit, since licenses can change after the route was built. The completion check must work offline, so sync each technician's skills, license states and expirations to the device.
- **Sales.** A rep's app checks that they hold an active permit for the city of the address they're standing at, that the current time is within the city's hours, and that the address isn't on the city's registry or marked by a previous rep as posted. A rep without a permit for the next neighborhood shouldn't be assigned that turf in the first place ([Territories & Capacity](/docs/industries/field-operations/territories-and-capacity)).

My rule: block anything a regulator could cite, warn on internal policy, and never pass silently.

## Expirations and Renewals

Expirations are predictable; lapses are a process failure. The state machine in the diagram needs a scheduler behind it:

- **Renewal windows per license type.** Alert the holder and their manager at, say, 90, 60 and 30 days, and enter `renewal_window` when renewal is due. The window allows work but shows on dashboards and in assignment warnings.
- **Continuing education.** Recertification can be by exam or by continuing education (40 CFR 171.107), and Texas technicians need 8 hours of verifiable training each calendar year. Track hours per license and period against the requirement, with certificates attached, and warn when someone is behind with months to go.
- **Grace isn't permission.** Texas lets a pest control business renew up to a year after expiration, but not operate in the meantime. Don't let "renewable" read as "valid" anywhere in the system.
- **Changes of employer and address.** Texas requires a form within 10 days when a technician changes employer or address; hiring and offboarding flows should create those tasks.
- **Business-level dependencies.** If a business's responsible certified applicator leaves, the business license and every individual license tied to it are at risk. The same is true when a master electrician of record or a Responsible Master Plumber leaves. Model the dependency so the event raises the right alarm with the right deadline: 20 business days to request a hardship for a Texas pest business, 30 business days to name a new master for a Texas electrical contractor.

Publish the changes as events (`license.expiring`, `license.expired`, `license.renewed`) for scheduling, sales and notifications to consume ([Events](/docs/architecture/events)).

## Verifying Against State Lookups

A license number typed by an office manager is a claim. Verify it against the issuer.

- **Bulk lists.** The Texas Department of Agriculture publishes CSV reports of active structural pest control licenses for businesses, applicators, technicians and apprentices. California's Contractors State License Board (CSLB) data portal offers lists of licensed contractors by classification and county. Where a list exists, download it on a schedule, match by number and name, and update `verified_at` and `verification_source`.
- **Interactive lookups.** California's Structural Pest Control Board links a "Verify a Company or Licensee" tool, TDLR's license search covers Texas electricians, and CSLB's license check returns status and complaint disclosure. Where only a web form exists, verify by hand at onboarding and renewal and record who checked, when, and a saved result. Don't scrape a lookup whose terms don't allow it, and expect issuers to be unavailable at times.
- **Reconcile, don't overwrite.** A mismatch (expired at the state, active in your system) moves the license to review and alerts a person, rather than silently changing assignments mid-route.

## Accreditation and Manufacturer Programs

Some credentials sit outside the law but are run like licenses. NPMA's QualityPro is the pest industry's best-known accreditation: companies in business at least two years that meet the program's standards (background and motor vehicle record checks where appropriate, a drug-free workplace policy, an exam for technicians and sales employees, periodic audits). Manufacturer programs such as Certified Sentricon Specialists work the same way. The same model holds them: the accreditation as a business-level license, each employee's exam as an individual license with a skill resting on it, and background and MVR checks as dated records. How long those records are kept is set by law, not by the screening vendor's terms: EEOC rules keep personnel and hiring records for one year from the record or the personnel action, whichever is later (29 CFR 1602.14), and the FCRA's Disposal Rule governs how a consumer report is destroyed once you no longer need it (16 CFR 682.3); state law can require longer.

## Auditing

Licensing records answer three questions later: did this person hold the right license on that date, who let them do the work if they didn't, and what did the business tell the state. The field-specific records:

- **Verification events** with their source (which state list and its date, or which person ran which lookup), the result, and how any mismatch was resolved.
- **Changes to `skill_requirements`,** with who changed a jurisdiction's rule and the source cited, since a wrong rule makes every downstream check wrong.
- **Overrides** of any warning or block at assignment, completion or sale, with reason and approver; a sale by an unpermitted rep may have to be unwound and its commission reversed.
- **Training and supervision records** for as long as the rules require, such as two years from the date of use for federal direct-supervision records and two years after employment ends for Texas technician training.

The record structure and typed actors are in [Audit Trails](/docs/architecture/audit-trails), and the license snapshots on work records and their retention are in [Audit Trails & Records](/docs/industries/field-operations/audit-trails-and-records).

## What This Means for the System You Build

- **Jurisdictions with boundaries,** resolved per property by point-in-polygon and stored, with re-resolution when boundaries change.
- **Licenses, staff member skills and skill requirements as separate tables,** with `valid_during` on each and skills that can't outlast the license they rest on.
- **Exactly one holder per license:** an org unit or a staff member, with employer-scoped individual licenses and business licenses linked to the individual who qualifies them.
- **Supervision as a dated relationship** with training records and a presence rule, checked at scheduling and recorded at completion.
- **Enforcement at routing, assignment, dispatch, completion and sale,** with time-bounded skills for the optimizer, offline checks on the device, and recorded overrides.
- **Renewal windows, continuing education tracking and expiration jobs** that emit events the rest of the platform consumes.
- **Verification against issuer lists and lookups** with recorded sources, and reconciliation that flags rather than overwrites.
- **License numbers snapshotted onto every work and application record,** so history never changes when a license does.

## References

**Specifications**

- [40 CFR 171.101: Commercial applicator categories](https://www.law.cornell.edu/cfr/text/40/171.101), the federal certification categories states map onto
- [40 CFR 171.107: Recertification](https://www.law.cornell.edu/cfr/text/40/171.107), five-year certifications and recertification by exam or continuing education
- [40 CFR 171.201: Direct supervision of noncertified applicators](https://www.law.cornell.edu/cfr/text/40/171.201), training, equipment instruction, label access, communication and two-year records
- [29 CFR 1602.14: Preservation of records made or kept](https://www.law.cornell.edu/cfr/text/29/1602.14), one-year retention of personnel and hiring records
- [16 CFR 682.3: Proper disposal of consumer information](https://www.law.cornell.edu/cfr/text/16/682.3), the FCRA Disposal Rule for consumer reports such as background checks
- [Fla. Admin. Code 64E-9.018: Public pool service technician certification](https://www.law.cornell.edu/regulations/florida/Fla-Admin-Code-Ann-R-64E-9-018), who must be certified, the 16-hour course and the bar on delegating to uncertified employees
- [Fla. Stat. 489.105](https://www.flsenate.gov/Laws/Statutes/2025/489.105), the commercial, residential and servicing pool/spa contractor categories
- [Watchtower Bible & Tract Society v. Village of Stratton (2002)](https://www.law.cornell.edu/supct/html/00-1737.ZS.html), permit requirements and the line between commercial and noncommercial canvassing

**Reference**

- [EPA: Certification Standards for Pesticide Applicators](https://www.epa.gov/pesticide-worker-safety/certification-standards-pesticide-applicators), federal certification for RUPs, state-issued certifications and the 2017 rule
- [EPA: Section 608 Technician Certification](https://www.epa.gov/section608/section-608-technician-certification-0), refrigerant certification types
- [TDLR: Electricians](https://www.tdlr.texas.gov/electricians/elec.htm), individual electrician license types and electrical contractor licenses
- [TDLR: Apply for a New Electrical Contractor License](https://www.tdlr.texas.gov/electricians/apply/businesses/contractor-elec.htm), the master electrician of record, the one-contractor limit and the 30-business-day replacement
- [TSBPE: License Types](https://tsbpe.texas.gov/license-types/), tradesman, journeyman and master plumber licenses and endorsements
- [TSBPE: Responsible Master Plumber](https://tsbpe.texas.gov/responsible-master-plumber/), the designation and its $300,000 liability insurance minimum
- [Austin Water: Backflow Prevention Assembly Tester Information](https://www.austintexas.gov/department/backflow-prevention-assembly-tester-information), the TCEQ tester license, city registration, calibrated gauges and five-day test reports
- [TDA: Structural Pest Control Business](https://texasagriculture.gov/Regulatory-Programs/Pesticides/Structural-Pest-Control-Service/Structural-Pest-Control-Business), licenses per location, the responsible certified applicator, hardship requests and renewal
- [TDA: Technician and Apprentice Licensing](https://texasagriculture.gov/Regulatory-Programs/Pesticides/Structural-Pest-Control-Service/Structural-Pest-Control-Licensing/SPCS-Technician-and-Apprentice-Licensing), apprentice registration, supervision, annual training and employer-scoped licenses
- [TDA: Structural Pest Control Reports, Current Licenses](https://texasagriculture.gov/Regulatory-Programs/Pesticides/Structural-Pest-Control-Service/Structural-Pest-Control-Reports-Current-Licenses), CSV lists of active licenses by type
- [California SPCB: How do I become a licensee?](https://pestboard.ca.gov/howdoi/lic.shtml), Applicator, Field Representative and Operator licenses, the three branches, and the verification tool
- [CSLB: Check a License](https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/CheckLicense.aspx), contractor and Home Improvement Salesperson lookups
- [CSLB: Licenses for Limited Liability Companies](https://www.cslb.ca.gov/about_us/llc.aspx), licenses qualified by a responsible managing officer or employee
- [CSLB: Data Portal](https://www.cslb.ca.gov/OnlineServices/DataPortal/), contractor lists by classification and county
- [Census Bureau: TIGER/Line Shapefiles](https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.2026.html), public legal boundaries, as of January 1 of the release year
- [Census Bureau: Boundary and Annexation Survey](https://www.census.gov/programs-surveys/bas.html), the annual survey that updates governments' legal boundaries and names
- [MRSC: Regulation of Peddlers, Solicitors, Temporary Merchants](https://mrsc.org/Explore-Topics/Legal/Regulation/Regulation-of-Peddlers-Solicitors-Temporary-Merc), typical municipal permit requirements and constitutional limits
- [Independence, MO: Solicitation](https://www.independencemo.gov/government/city-departments/community-development/business-license-liquor-license-and-employee-permitting/solicitation), permit, background check, hours and the "No Solicitors" list
- [Glenview, IL: Peddlers and Solicitors](https://www.glenview.il.us/662), fee, badge, hours and December 31 expiration
- [La Vergne, TN: No Knock Registry](https://www.lavergnetn.gov/531/No-Knock-Registry), the registry, permits and exempt noncommercial canvassers
- [Rogers, AR: No-Knock List](https://www.rogersar.gov/FormCenter/City-Clerk-14/No-Knock-List-111), per-salesperson permit and list carried together
- [NPMA QualityPro: Credentials](https://www.npmaqualitypro.org/available-credentials/qualitypro/), accreditation requirements and the V6.1 standards

**In practice**

- [FieldRoutes: Techs with Multiple Licenses](https://knowledgebase.fieldroutes.com/docs/techs-with-multiple-licenses.md), licenses linked to skills and states, printing rules and the Arizona license requirement
- [FieldRoutes: Licenses API](https://knowledgebase.fieldroutes.com/apidocs/licenses.md), the license record fields and linked states and skills
- [FieldRoutes: Adding a sales user's license number to a contract](https://knowledgebase.fieldroutes.com/docs/how-can-we-add-a-sales-users-license-number-to-a-customers-contract.md), printing a rep's license on the service agreement
- [PestPac: Scheduling](https://www.pestpac.com/features/pest-control-scheduling-software), automatic warnings when assigning a technician without the required license
- [Jobber: Chemical Tracking](https://help.getjobber.com/es/articles/chemical-tracking/), company and applicator license numbers on treatment records
- [Timefold: Skills](https://docs.timefold.ai/field-service-routing/latest/visit-service-constraints/skills), required skills, levels, time-bounded skill sets and the hard constraint
- [Salesforce: ServiceResourceSkill](https://developer.salesforce.com/docs/atlas.en-us.field_service_dev.meta/field_service_dev/sforce_api_objects_serviceresourceskill.htm), skill levels and effective start and end dates for certifications
- [ServiceTitan: Expands into Enterprise Pest Control, Lawn Care and Pool and Spa](https://www.servicetitan.com/press/servicetitan-expands-into-enterprise-pest-control-lawn-care-and-pool-spa-markets), Certified Sentricon Specialists as a manufacturer program
