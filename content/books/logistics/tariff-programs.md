+++
title = "Tariff Programs"
description = "The duties stacked on the base rate as of November 2026: Sections 301, 232, 338 and 122, IEEPA after Learning Resources and CAPE refunds, AD/CVD and Chapter 99."
category = "Logistics & Supply Chain Industry"
order = 2851
part = "Customs and Trade"
tags = ["logistics", "customs", "tariffs", "section-301", "section-232", "ieepa", "adcvd", "chapter-99"]
+++

The duty rate printed against a tariff number is where the arithmetic starts, not where it ends. Since 2018, and at a pace no system was built for since 2025, the United States has layered additional duties on imports under half a dozen statutes, each with its own agency, its own product scope, its own country list, its own exemptions and its own effective time, and each reported on the entry line as a Chapter 99 number in an order CBP prescribes. In 2026 alone, the Supreme Court held that the emergency-powers tariffs of 2025 were never authorized, CBP built a system to refund them, a temporary surcharge under a different statute ran for exactly 150 days and was held invalid for the plaintiffs who challenged it, and new tariffs under Sections 301, 232 and 338 took its place, some effective at 12:01 a.m. the day after the notice was published.

That is the design problem. A duty is a function of the line's tariff number, origin, value, entry date and the program rules in force at that minute, and the rules change faster than code deploys. A broker or importer that hard-codes rates will be wrong within a quarter; one that stores only the total duty can't answer which program a refund belongs to. This chapter covers how additional duties attach and stack, the IEEPA tariffs and their refunds after *Learning Resources, Inc. v. Trump*, the Section 122 surcharge, Section 301, Section 232, the first Section 338 action, and antidumping and countervailing duties, all dated as of November 2026, and then how to model a program as dated data and a line's duties as rows. It extends `shipment_lines` and `freight_charges` through the entry lines of [Import Entry & ACE](/books/logistics/import-entry); the classification and origin each program keys on are [Classification, Valuation & Origin](/books/logistics/classification-valuation-origin), and a merchant's view of the same changes is [Customs Entry and Duties](/books/commerce/cross-border-commerce#united-states).

## How the Regulators Do It

Each program has a statute, a deciding agency and a status, as of November 22, 2026:

| Program | Authority | Who decides | Status, as of November 2026 |
| --- | --- | --- | --- |
| **IEEPA tariffs** | International Emergency Economic Powers Act | The President | Held unauthorized on February 20, 2026 (*Learning Resources, Inc. v. Trump*); refunds through CBP's CAPE process since April 20, 2026 |
| **Section 122 surcharge** | Trade Act of 1974, section 122 (19 U.S.C. 2132) | The President | 10% from February 24 to July 24, 2026 (Proclamation 11012); held invalid by the Court of International Trade on May 7, 2026 for the plaintiffs; expired |
| **Section 301** | Trade Act of 1974, section 301 | USTR | China (latest Federal Register notice November 10, 2026), Brazil (July 20, 2026), forced labor actions on 60 economies (from July 24, 2026), Nicaragua (CSMS pending) |
| **Section 232** | Trade Expansion Act of 1962, section 232 | Commerce investigates, the President proclaims | Eight programs on CBP's list: autos and parts, medium and heavy vehicles, metals (aluminum, steel, copper), timber and lumber, semiconductors, pharmaceuticals, unmanned aircraft systems, polysilicon |
| **Section 338** | Tariff Act of 1930, section 338 | The President | 50% on listed goods of Canada, first imposed July 20, 2026; scope modified effective October 30, 2026 |
| **Antidumping and countervailing duties** | 19 U.S.C. 1671 and 1673 | Commerce (margins) and the ITC (injury); CBP collects | Case by case, by product, country and exporter |

Three patterns:

- **Every program is a Chapter 99 number with a scope.** CBP implements each action through Chapter 99 headings (9903.05.20 through 9903.05.84 for the Section 301 forced labor duties, 9903.82 headings for metals, 9903.03.12 to .14 for Section 338) and a CSMS message with the effective time and exemptions. The scope is a list of tariff numbers, countries and conditions, which is data.
- **Programs know about each other.** The Section 122 surcharge didn't apply to the part of an import subject to Section 232; the Section 301 forced labor duties exempt Section 232 metals, vehicles, wood and semiconductor articles; the Section 338 duties excluded goods already under Section 232. Stacking is a rule per pair of programs, not an addition.
- **Status is litigated.** The IEEPA duties were collected for a year before the Supreme Court held them unauthorized; the Section 122 surcharge was held invalid for three plaintiffs while everyone else paid. A duty collected is a duty that may come back, so every duty line has to stay attributable to its program.

## How Additional Duties Attach

### The Reporting Order

CBP's guidance for the Section 301 forced labor duties restates the order in which numbers are reported on an entry summary line (CSMS 69326983, July 23, 2026):

1. Chapter 98, if applicable.
2. Chapter 99 numbers for additional duties.
3. Trade remedies, in this order: "Section 301 first, then Section 122, Section 232, Section 201 duties, and Section 201 quota."
4. Chapter 99 numbers for replacement duty or other uses.
5. Chapter 99 numbers for other quotas.
6. The Chapter 1 to 97 classification, which carries the entered value unless Chapter 98 reporting requires otherwise.

Each Chapter 99 number brings its own rate and its own basis, and the duties add, unless a program's terms exclude another. A Chapter 98 entry (goods properly entered under a Chapter 98 provision) is generally outside the additional duties, except for goods repaired or processed abroad (9802.00.40, .50 and .60), where the duty applies to the value of the work, and articles assembled abroad with US components (9802.00.80), where it applies to the value less the US content.

### Two Worked Stacks

An illustrative product of China, classified in a heading with a 3.4% general rate (illustrative), entered by ocean on November 2, 2026 with an entered value of $60,000. It's on a Section 301 China list at an illustrative 25%; it falls under none of the Section 301 forced labor exemptions, so the 12.5% rate for China applies; it's not a Section 232 article:

| Line | Chapter | Rate | Amount |
| --- | --- | --- | --- |
| Section 301 China | 9903.88 heading (illustrative list) | 25% (illustrative) | $15,000.00 |
| Section 301 forced labor, China | 9903.05 heading for China | 12.5% | $7,500.00 |
| General duty | Chapter 1 to 97 number | 3.4% (illustrative) | $2,040.00 |
| Merchandise processing fee | | 0.3464% | $207.84 |
| Harbor maintenance fee | | 0.125% | $75.00 |
| **Total duties and fees** | | | **$24,822.84** |

The same entry a year earlier would have carried an IEEPA duty on top and, today, that IEEPA line is the one being refunded; the program column is what lets the refund find it.

A steel derivative article from a country outside the United Kingdom and outside General Note 3(b), entered on the same day for $60,000: since April 6, 2026, Section 232 applies 50% "on the full customs value" for headings like 9903.82.02 (CSMS 68253075), so its Section 232 duty is $30,000. The Section 301 forced labor exemption for "certain aluminum, steel, and copper articles" (9903.05.90) means no forced-labor duty stacks on it, whatever its origin. Which exemption applies is decided per line from the program's scope, before any rate is multiplied.

### Exemptions That Recur

- **In transit.** Most actions exempt goods already loaded and in transit before the effective time and entered within a few days after: for the Section 301 forced labor duties, goods "loaded onto a vessel at the port of loading and in transit" before 12:01 a.m. on July 24, 2026 and entered before 12:01 a.m. on July 28 (9903.05.85); for Section 122, goods loaded before the start and entered by February 28, 2026.
- **Foreign trade zones.** Goods subject to Section 301 and Section 338 may be admitted to a zone only in privileged foreign status unless eligible for domestic status, so the duty is fixed at admission ([Drawback, FTZs & Trade Agreements](/books/logistics/drawback-ftz-and-trade-agreements)).
- **Trade agreements.** "Section 232 duties may not be waived due to a Free Trade Agreement" unless a Chapter 99 number provides it, and "GSP or AGOA cannot be claimed on entries subject to Section 232 duties" (CBP Section 232 FAQs, modified November 17, 2026).
- **Humanitarian and informational goods.** Donations of food, clothing and medicine and informational materials recur as exemptions (9903.05.91 and .92 for the forced labor duties; Proclamation 11012's exclusions for Section 122).

## IEEPA and Learning Resources

In 2025 the President imposed tariffs under the International Emergency Economic Powers Act to address drug trafficking ("a 25% duty on most Canadian and Mexican imports and a 10% duty on most Chinese imports") and trade deficits (a "reciprocal" duty "on all imports from all trading partners" of "at least 10%, with dozens of nations facing higher rates"), and modified them repeatedly. In *Learning Resources, Inc. v. Trump*, No. 24-1287, argued November 5, 2025 and decided February 20, 2026 together with *Trump v. V.O.S. Selections, Inc.*, No. 25-250, the Supreme Court held: "IEEPA does not authorize the President to impose tariffs." The judgment in *V.O.S. Selections* (the Federal Circuit's en banc decision) was affirmed; *Learning Resources*, brought in district court, was vacated and remanded for dismissal for lack of jurisdiction, which leaves tariff challenges where they started: the Court of International Trade.

### Refunds Through CAPE

CBP built the Consolidated Administration and Processing of Entries (CAPE) in ACE to "streamline the submission and processing of valid refund requests" for IEEPA duties, as of its page modified November 2, 2026:

| Phase | Since | Entries covered |
| --- | --- | --- |
| Phase 1 | April 20, 2026 | "Certain unliquidated entries and certain entries within 80 days of liquidation" |
| Phase 2 | June 29, 2026 | Entries flagged for reconciliation (types 01, 02 and 06) without a reconciliation entry on file |
| Later deployments, undated | | Drawback-designated entries, warehouse entries (types 21 and 22), entries under open protest, entries not in ACE, AD/CVD entries pending liquidation, and entries whose liquidation is final |

A CAPE declaration holds up to 9,999 entries in a file of at most 1 MB; refunds "are generally issued within 60 - 90 days following acceptance of the CAPE Declaration," are paid only by ACH to the refund account on file in the ACE Portal, and include interest set by the IRS, generally from the deposit date to liquidation; entries liquidated more than 80 days earlier are rejected for now. The refunded liquidation can itself be protested "within 180 days after the date of liquidation or reliquidation." Whether importers of entries already finally liquidated get refunds was still being litigated in the Court of International Trade as of November 2026, and CBP lists final-liquidation entries only as a future deployment. <!-- source-gap: logistics-tariff-programs-final-liquidation-refunds | status | whether IEEPA duties on finally liquidated entries will be refunded, and on what order | closes with: a CIT or Federal Circuit decision on finally liquidated entries, or a CBP CAPE deployment covering them | checked: 2026-11-22 -->

Refunds flow downstream too. Rockwell Automation's fiscal 2026 10-K carries "Other unallocated items" of $(85) million representing estimated tariff refunds to customers, the IEEPA duties it had passed on in its prices. A distributor or manufacturer that charged surcharges for tariffs needs to know which surcharge lines tracked which program, for the same reason CBP does.

## The Section 122 Surcharge

Within hours of the ruling, the President turned to section 122 of the Trade Act of 1974, which allows a temporary import surcharge for balance-of-payments problems for up to 150 days "unless such period is extended by Act of Congress." Proclamation 11012, signed February 20, 2026, imposed "a temporary import surcharge of 10 percent ad valorem" on goods entered from 12:01 a.m. EST on February 24, 2026 through 12:01 a.m. EDT on July 24, 2026. It excluded USMCA-qualifying goods of Canada and Mexico, goods in its annexes (certain critical minerals, energy, pharmaceuticals, electronics, passenger vehicles, aerospace and agricultural products), informational materials, donations and certain CAFTA-DR textiles, and applied only to the part of an import not subject to Section 232.

On May 7, 2026 the Court of International Trade held, two judges to one, that the proclamation was invalid, but limited relief to the plaintiffs with standing, the State of Washington and two importers (*State of Oregon v. United States*, Slip Op. 26-47). The government appealed and the surcharge expired on schedule. As of November 22, 2026 I found no Federal Circuit decision, so whether other importers can recover the surcharge is open. <!-- source-gap: logistics-tariff-programs-section-122-appeal | status | the Federal Circuit's decision on the Section 122 appeal and any refund path for non-plaintiff importers | closes with: a Federal Circuit opinion in No. 26-1804 or a CBP refund notice for Section 122 duties | checked: 2026-11-22 -->

## Section 301

Section 301 lets USTR act against a country's unfair practices; the actions in force as of November 2026, per CBP's trade remedies index (modified November 18, 2026):

- **China.** Duties on products of China in several lists adopted since 2018, modified through a four-year review and exclusions, with the latest Federal Register notice at 91 FR 72610 (November 10, 2026) and CSMS 70261629 (October 22, 2026). CBP's FAQ says the duties "only apply to articles that are products of the People's Republic of China" and are "based on country of origin, not country of export"; listed products entering a zone "must be admitted as 'privileged foreign status'"; and "Section 301 duties are eligible for duty drawback." The rate per list and the exclusions in force weren't on a page opened for this chapter. <!-- source-gap: logistics-tariff-programs-301-china-rates | missing | the current Section 301 China rates by list and the exclusions in force as of November 2026 | closes with: USTR's Section 301 China notices (91 FR 72610 and the four-year review) or CBP's Section 301 China CSMS, opened and cited | checked: 2026-11-22 -->
- **Forced labor actions on 60 economies.** From 12:01 a.m. on July 24, 2026, "10 percent to 12.5 percent tariffs on imports from sixty economies" (CSMS 69326983): 12.5% for 38 economies including China, Brazil, Vietnam, Thailand and Singapore; 10% for 17 including Canada, Mexico, India, Indonesia and the United Kingdom; and floors for the EU (10%), Japan, South Korea and Switzerland (12.5%) and Taiwan (10%), where the duty brings the total to a minimum rate rather than adding a fixed one. Economy-specific exemptions and conditions follow from 9903.05.93 (Canada), 9903.05.94 (Mexico) and 9903.05.95 (CAFTA-DR textiles) onward.
- **Brazil and Nicaragua.** A Brazil action implemented by CSMS 69302472 (July 21, 2026), and a Nicaragua action published at 90 FR 60850 (December 29, 2025) whose CBP guidance was still pending.

## Section 232

Section 232 duties follow a Commerce finding that imports threaten national security; CBP's index lists eight programs, each with its own CSMS and notices. The metals program shows how they work. Since April 6, 2026, under a proclamation of April 2, 2026, duties apply to "the full customs value" of covered aluminum, steel and copper articles and derivatives, not just their metal content (CSMS 68253075):

| Rate | What it covers (selected headings) |
| --- | --- |
| 50% | Aluminum, steel and copper articles and derivative aluminum or steel articles (9903.82.02); Russian steel and copper (9903.82.14) |
| 25% | UK aluminum and steel at least 95% UK-melted (9903.82.04); copper articles and derivative articles (9903.82.09); derivatives from General Note 3(b) countries (9903.82.12) |
| 15% | UK derivatives (9903.82.05); derivatives not meeting the 95% US melt test, as a floor (9903.82.10, .11) |
| 10% | Certain copper and derivative articles (9903.82.06); derivatives meeting the 95% US melt test, as a floor (9903.82.07, .08) |
| 0% | Articles outside Chapters 72, 73, 74 and 76 with less than 15% metal by weight (9903.82.03); motorcycle parts for US motorcycle manufacturing |
| 200% | Russian aluminum and aluminum derivatives (9903.85.67, .68) |

Filers report the metal's weight in kilograms and the countries of melt and pour or smelt and cast; for derivative steel they "can report OTH for the country of melt and pour" (CBP Section 232 FAQs). Several floor headings move to the 9903.82.05, .06 and .09 rates for goods entered from January 1, 2028. The metals action was amended again by a June 2026 proclamation (91 FR 34085), with later CBP guidance on July 15, 2026 (CSMS 69252300), which this chapter doesn't take apart; the table is the April structure. The other seven programs (autos and parts, medium and heavy vehicles, timber and lumber, semiconductors, pharmaceuticals, drones and polysilicon) each have their own CSMS and Federal Register citations on CBP's index.

## Section 338

The first use of section 338 of the Tariff Act of 1930, which lets the President offset another country's discrimination against US commerce, came on July 20, 2026: three proclamations (11046, 11047 and 11048) imposing "an additional 50% tariff" on Canadian goods ranging "from wine to hockey sticks to cement," excluding energy, potash, goods already under Section 232, and certain other items (White House fact sheet). A suspension (Proclamation 11056, August 18, 2026) and modifications in September and October followed. CBP's guidance for the October 23 modification (CSMS 70314289, October 29, 2026) applies the 50% under headings 9903.03.12 to 9903.03.14 from 12:01 a.m. on October 30, 2026, removes 22 tariff numbers from scope and adds 100, keeps AD, CVD and other duties in addition, allows zone admission only in privileged foreign status for goods not eligible for domestic status, and states that the duties "are eligible for drawback." A program whose scope changes by tariff number twice in three months is the clearest case for scope as data.

## Antidumping and Countervailing Duties

Antidumping duty requires a Commerce finding that goods are sold "at less than its fair value" and an ITC finding of material injury (or threat), and equals "the amount by which the normal value exceeds the export price (or the constructed export price)" (19 U.S.C. 1673); countervailing duty offsets a foreign subsidy (19 U.S.C. 1671). Unlike the programs above, AD/CVD is specific to a product, a country and often an exporter and producer, each with its own cash deposit rate, and the duty finally owed isn't known at entry:

- **At entry,** the importer files entry type 03 (or 07, 34, 38), reports the case number under the tariff number on each line, and deposits estimated duty at the rate for its exporter and producer.
- **Liquidation is suspended** until Commerce completes an administrative review, held "at least once during each 12-month period beginning on the anniversary of the date of publication" of the order if someone requests it, and instructs CBP; then CBP liquidates within six months (19 U.S.C. 1675; 1504(d)). The final rate can be higher or lower than the deposit, with interest, years later.
- **Orders end** only after a five-year sunset review finds that revocation would not likely lead to continued dumping or subsidy and injury (1675(c)).
- **Evasion** (entering covered goods by a material false statement or omission that avoids AD/CVD deposits) is investigated by CBP under the Enforce and Protect Act: initiation within 15 business days of an allegation, interim measures within 90 calendar days (suspending liquidation, requiring cash deposits or bonds), and a determination within 300 calendar days (19 U.S.C. 1517).

An importer of AD/CVD goods carries a contingent liability per entry for years, and its bond sufficiency, cash forecasts and landed costs depend on it ([How CBP Sizes a Bond](/books/logistics/customs-brokers-and-bonds#how-cbp-sizes-a-bond)).

## How to Build It

Programs become `tariff_measures`, dated rows with a scope and stacking rules; each duty on an entry line becomes an `entry_line_duties` row that points to the measure and to the `freight_charges` line that bills it; AD/CVD cases carry per-exporter deposit rates; refund claims track the money coming back:

```sql
-- One additional duty or rate as legislated: a Chapter 99 heading with scope and dates.
CREATE TABLE tariff_measures (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  jurisdiction    TEXT NOT NULL DEFAULT 'US',
  program         TEXT NOT NULL CHECK (program IN ('general', 'section_301', 'section_232',
                    'section_338', 'section_122', 'section_201', 'ieepa', 'adcvd',
                    'special_program', 'flat_low_value', 'other')),
  action          TEXT NOT NULL,          -- 'china', 'forced_labor', 'metals', 'canada'
  heading         TEXT,                   -- the Chapter 99 number, e.g. '9903.82.02'
  report_rank     SMALLINT NOT NULL,      -- position in CBP's reporting order
  rate_kind       TEXT NOT NULL CHECK (rate_kind IN ('ad_valorem', 'specific', 'per_item',
                    'floor', 'exemption')),
  rate_bp         INT,                    -- basis points for ad valorem and floor rates
  specific_rate   BIGINT,                 -- minor units per unit or item
  value_basis     TEXT NOT NULL DEFAULT 'entered_value' CHECK (value_basis IN
                    ('entered_value', 'metal_content', 'non_us_content', 'value_of_work')),
  scope           JSONB NOT NULL,         -- tariff prefixes, origins, conditions, as published
  excludes_programs TEXT[] NOT NULL DEFAULT '{}',  -- programs this one doesn't stack on
  in_transit_rule JSONB,                  -- loaded-before and entered-by instants
  zone_status_required TEXT CHECK (zone_status_required IN ('privileged_foreign')),
  drawback_eligible BOOLEAN,
  effective_during TSTZRANGE NOT NULL,    -- by entry or withdrawal time, 12:01 a.m. Eastern
  authority_ref   TEXT NOT NULL,          -- proclamation or Federal Register citation
  guidance_ref    TEXT NOT NULL,          -- the CSMS that implemented it
  CHECK (rate_kind NOT IN ('ad_valorem', 'floor') OR rate_bp IS NOT NULL)
);
CREATE INDEX ON tariff_measures USING gist (effective_during);

-- Each duty computed on an entry line, and how it was paid or refunded.
CREATE TABLE entry_line_duties (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  customs_entry_line_id UUID NOT NULL REFERENCES customs_entry_lines (id),
  tariff_measure_id     UUID REFERENCES tariff_measures (id),  -- null: an agency fee
  heading               TEXT NOT NULL,   -- as reported on the line
  basis_amount          BIGINT NOT NULL, -- the value or quantity the rate applied to
  rate_bp               INT,
  amount                BIGINT NOT NULL, -- signed minor units
  currency              CHAR(3) NOT NULL DEFAULT 'USD',
  stage                 TEXT NOT NULL CHECK (stage IN ('deposit', 'liquidated',
                          'refund_claimed', 'refunded', 'billed')),
  freight_charge_id     UUID REFERENCES freight_charges (id),  -- the duty line it bills
  computed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rule_version          TEXT NOT NULL    -- the measure row's version used, for replay
);
CREATE INDEX ON entry_line_duties (customs_entry_line_id);
CREATE INDEX ON entry_line_duties (tariff_measure_id, stage);

-- An AD or CVD order and the deposit rates that apply by exporter and producer.
CREATE TABLE adcvd_cases (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  case_number      TEXT NOT NULL UNIQUE,  -- Commerce's number, as reported on the line
  kind             TEXT NOT NULL CHECK (kind IN ('antidumping', 'countervailing')),
  country          CHAR(2) NOT NULL,
  product          TEXT NOT NULL,
  tariff_prefixes  TEXT[] NOT NULL,       -- indicative; the order's scope language governs
  order_published_on DATE NOT NULL,       -- sets the review anniversary month
  status           TEXT NOT NULL CHECK (status IN ('investigation', 'order', 'revoked'))
);

CREATE TABLE adcvd_deposit_rates (
  adcvd_case_id      UUID NOT NULL REFERENCES adcvd_cases (id),
  exporter_party_id  UUID REFERENCES parties (id),  -- null: the all-others rate
  producer_party_id  UUID REFERENCES parties (id),
  rate_bp            INT,                  -- ad valorem deposit, basis points
  specific_rate      BIGINT,               -- or a per-unit deposit
  valid_during       TSTZRANGE NOT NULL,
  source_ref         TEXT NOT NULL,        -- the Commerce notice or CBP message
  UNIQUE NULLS NOT DISTINCT (adcvd_case_id, exporter_party_id, producer_party_id,
                             valid_during)
);

-- Money coming back: CAPE declarations, PSCs and protests that claim a refund.
CREATE TABLE tariff_refund_claims (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  importer_party_id  UUID NOT NULL REFERENCES parties (id),
  program            TEXT NOT NULL,        -- 'ieepa', 'section_122', 'section_301'
  mechanism          TEXT NOT NULL CHECK (mechanism IN ('cape', 'post_summary_correction',
                       'protest', 'court_order')),
  reference          TEXT,                 -- the CAPE declaration or protest number
  entries            UUID[] NOT NULL,      -- customs_entries ids, at most 9,999 for CAPE
  claimed_duty       BIGINT NOT NULL,
  refunded_duty      BIGINT,
  refunded_interest  BIGINT,
  currency           CHAR(3) NOT NULL DEFAULT 'USD',
  submitted_at       TIMESTAMPTZ,
  accepted_at        TIMESTAMPTZ,
  paid_at            TIMESTAMPTZ,
  protest_due_on     DATE,                 -- 180 days after the refund's liquidation
  status             TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'accepted',
                       'rejected', 'paid', 'protested', 'closed')),
  CHECK (mechanism <> 'cape' OR cardinality(entries) <= 9999)
);
```

The measures in force for a line are a query over scope and time; stacking removes measures a higher-ranked one excludes, then the rates multiply:

```sql
-- Measures that apply to one entry line at its entry time, in CBP's reporting order.
WITH line AS (
  SELECT l.*, e.entry_time
  FROM customs_entry_lines l JOIN customs_entries e ON e.id = l.customs_entry_id
  WHERE l.id = $1
), candidates AS (
  SELECT m.*
  FROM tariff_measures m, line
  WHERE m.jurisdiction = 'US'
    AND m.effective_during @> line.entry_time
    AND EXISTS (SELECT 1 FROM jsonb_array_elements_text(m.scope->'tariff_prefixes') p
                WHERE line.tariff_number LIKE p || '%')
    AND (NOT m.scope ? 'origins' OR m.scope->'origins' ? line.origin_country)
)
SELECT c.program, c.action, c.heading, c.rate_kind, c.rate_bp, c.value_basis
FROM candidates c
WHERE c.rate_kind <> 'exemption'
  AND NOT EXISTS (                         -- an exemption heading for the same action applies
    SELECT 1 FROM candidates x
    WHERE x.rate_kind = 'exemption' AND x.program = c.program AND x.action = c.action)
  AND NOT EXISTS (                         -- a stacked program this one yields to applies
    SELECT 1 FROM candidates y
    WHERE y.rate_kind <> 'exemption' AND y.program = ANY (c.excludes_programs))
ORDER BY c.report_rank;
```

Real scopes have conditions a prefix match can't express (metal weight under 15%, 95% US melt, in-transit dates, USMCA qualification), so the query narrows candidates and a rules function decides the rest, recording which measure version decided ([Record Which Rule Decided](/docs/building-blocks/rules-as-data#record-which-rule-decided)).

Design notes:

- **Programs are data with effective instants.** A CSMS saying "on or after 12:01 a.m. eastern time on October 30, 2026" is a `tariff_measures` row with that lower bound, loaded before the time arrives and reviewed by a person; deploying code for a tariff is a sign the model is wrong ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)).
- **Duties are rows per program.** An entry line with three duties has three `entry_line_duties` rows and three `freight_charges` lines of kind `duty`, so a refund of one program reverses one row and an importer's customers can be credited for the right surcharge.
- **Deposits aren't final.** AD/CVD deposits and every duty before liquidation are stage `deposit`; liquidation adds rows at stage `liquidated` with the difference, never edits.
- **Keep the scope as published.** Store the CSMS's tariff number lists and conditions verbatim with the measure, and derive the prefix index from them, so an auditor can compare the system's scope with CBP's.
- **Reprice open orders when a measure changes.** A new measure affects landed cost for goods on the water and on order; emit `tariff_measure.published` and recompute estimates for unentered shipments.

## Auditing

- **Every measure as loaded,** with its authority, CSMS, scope, rates, effective range, who loaded and who approved it.
- **Every duty per line,** with the measure version, basis, rate and stage, and the charge that billed it.
- **Every exemption claimed** (in transit, Chapter 98, agreement, zone status) with the evidence for it.
- **Every AD/CVD deposit rate used,** by case, exporter and producer, and every liquidation difference with interest.
- **Every refund claim** (CAPE, PSC, protest) with the entries, amounts claimed and received, interest, and protest deadlines.
- **Every downstream pass-through,** where duties were recharged to customers, so refunds can be passed back by program.

## What This Means for the System You Build

- **Model each tariff program as dated rows with a scope,** loaded from the CSMS and notice, effective to the minute.
- **Compute duties as one row per program per line,** in CBP's reporting order, with exclusions between programs applied before rates.
- **Keep every duty attributable to its program and measure version,** because programs get struck down and refunded.
- **Track IEEPA refunds per entry through CAPE phases,** with ACH refund accounts on file and the 180-day protest window on each refund.
- **Carry AD/CVD as contingent liabilities** with per-exporter deposit rates and years-long liquidation.
- **Recompute landed cost for goods in transit** whenever a measure publishes, and record the in-transit exemption where it applies.
- **Treat Section 122 and the final-liquidation refunds as open questions** in November 2026, and design so either answer is a data change.

## References

**Courts**

- [Supreme Court: Learning Resources, Inc. v. Trump, No. 24-1287 (February 20, 2026)](https://www.supremecourt.gov/opinions/25pdf/24-1287_4gcj.pdf), the IEEPA tariffs at issue, the holding, and the dispositions of Nos. 24-1287 and 25-250
- [Court of International Trade: State of Oregon v. United States, Slip Op. 26-47 (May 7, 2026)](https://www.cit.uscourts.gov/sites/cit/files/26-47.pdf), the Section 122 proclamation held invalid and the plaintiff-only relief

**Statutes**

- [19 U.S.C. 1673: Imposition of antidumping duties](https://www.law.cornell.edu/uscode/text/19/1673), less than fair value, injury and the duty amount
- [19 U.S.C. 1671: Countervailing duties imposed](https://www.law.cornell.edu/uscode/text/19/1671), duties offsetting subsidies
- [19 U.S.C. 1675: Administrative review of determinations](https://www.law.cornell.edu/uscode/text/19/1675), annual reviews on the anniversary month and five-year sunset reviews
- [19 U.S.C. 1517: Investigation of evasion of antidumping and countervailing duty orders](https://www.law.cornell.edu/uscode/text/19/1517), evasion, the 15-business-day, 90-day and 300-day clocks and interim measures
- [19 U.S.C. 1504: Limitation on liquidation](https://www.law.cornell.edu/uscode/text/19/1504), suspended liquidation and the six months after it lifts

**Proclamations and Federal Register**

- [Federal Register: Proclamation 11012, temporary import surcharge (February 25, 2026)](https://www.govinfo.gov/content/pkg/FR-2026-02-25/html/2026-03824.htm), the 10% rate, February 24 to July 24, 2026, and its exclusions
- [Congressional Research Service: IF13199, Section 122 (April 9, 2026)](https://www.everycrsreport.com/files/2026-04-09_IF13199_b63fa21e9bf985ab52dcc0a4973f7a19e3d4ce86.html), the statute's 150-day limit and the surcharge's timing after the ruling
- [White House: Fact sheet on additional tariffs on Canada (July 20, 2026)](https://www.whitehouse.gov/fact-sheets/2026/07/fact-sheet-president-donald-j-trump-imposes-additional-tariffs-on), Section 338, the 50% rate, the products and the exclusions

**CBP**

- [CBP: Trade remedies](https://www.cbp.gov/trade/programs-administration/trade-remedies), the programs in force with their CSMS and Federal Register citations
- [CBP: IEEPA duty refunds](https://www.cbp.gov/trade/programs-administration/trade-remedies/ieepa-duty-refunds), CAPE phases, limits, timing, ACH, interest and protests
- [CBP CSMS 69326983: Section 301 forced labor import duties (July 23, 2026)](https://content.govdelivery.com/accounts/USDHSCBP/bulletins/421d887), rates by economy, Chapter 99 ranges, exemptions, zone status and the reporting order
- [CBP CSMS 68253075: Section 232 duties on aluminum, steel and copper (April 3, 2026)](https://content.govdelivery.com/accounts/USDHSCBP/bulletins/4117593), the April 6, 2026 rates, headings and full-value basis
- [CBP CSMS 70314289: Further modifying Section 338 duties on goods of Canada (October 29, 2026)](https://content.govdelivery.com/accounts/USDHSCBP/bulletins/430e931), the proclamations, headings, scope changes, zone status and drawback
- [CBP: Section 232 FAQs](https://www.cbp.gov/trade/programs-administration/entry-summary/232-tariffs-aluminum-and-steel/faqs), no FTA waiver, no GSP or AGOA, and melt and pour reporting
- [CBP: Section 301 FAQs](https://www.cbp.gov/trade/programs-administration/entry-summary/section-301-trade-remedies/faqs), origin basis, zone status and drawback eligibility

**Filings**

- [Rockwell Automation: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1024478/000102447826000048/rok-20260930.htm), estimated customer tariff refunds
