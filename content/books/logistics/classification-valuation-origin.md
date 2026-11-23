+++
title = "Classification, Valuation & Origin"
nav_title = "Classification & Origin"
description = "The facts every duty is computed from: HTSUS classification and the GRIs, binding rulings, transaction value and its additions, country of origin and marking."
category = "Logistics & Supply Chain Industry"
order = 2850
part = "Customs and Trade"
tags = ["logistics", "customs", "htsus", "classification", "valuation", "country-of-origin", "rulings"]
+++

Every duty on every entry line is a function of three facts: what the goods are, what they are worth, and where they come from. The tariff number decides the rate, whether a partner agency gets involved, and whether a Section 232 or Section 301 duty stacks on top; the value is the base the rate is applied to; the origin decides which column of rates applies, which additional duties attach and how the goods must be marked. Get one wrong and the duty is wrong, and because the importer must use reasonable care, a pattern of wrong answers is a penalty case, not a typo ([Penalties and Prior Disclosure](/books/logistics/import-entry#penalties-and-prior-disclosure)).

None of the three is a lookup. Classification is a legal reading of headings, section and chapter notes and six General Rules of Interpretation against a physical product, and the schedule itself changes every year and is rebuilt every five. Value is the price paid adjusted by statute: plus the molds the buyer gave the factory, the royalties it pays as a condition of sale and the commissions it pays its own selling agent, minus the freight after export. Origin is where the goods were last substantially transformed, which for a laptop assembled in Vietnam from Chinese boards is an argument, not a field. This chapter covers the tariff schedule, the General Rules of Interpretation, binding rulings, valuation and its additions, related-party sales, country of origin and marking, and how to keep all three as dated, evidenced decisions per item. It extends `items` and `shipment_lines` from [The Core Data Model](/books/logistics/logistics-business#the-core-data-model). A merchant's classification of its catalog for checkout is [HS Codes and Customs Data](/books/commerce/cross-border-commerce#hs-codes-and-customs-data); preferential origin under trade agreements is [Drawback, FTZs & Trade Agreements](/books/logistics/drawback-ftz-and-trade-agreements).

## How the Regulators Do It

Four bodies own the vocabulary, as of November 2026:

| Body | What it owns | The record |
| --- | --- | --- |
| **World Customs Organization** | The Harmonized System: six-digit headings and subheadings used by "more than 200 countries and economies" | HS 2022 in force; HS 2028, with 299 sets of amendments, accepted as of January 21, 2026 and in force January 1, 2028 |
| **US International Trade Commission** | Publishes the Harmonized Tariff Schedule of the United States: the HS extended to eight-digit rate lines and ten-digit statistical reporting numbers, with the General Rules of Interpretation and general notes | "Harmonized Tariff Schedule of the United States Revision 23 (2026)," the edition current in November 2026 |
| **CBP** | Classifies, values and determines origin at entry; issues binding rulings under 19 CFR part 177, searchable in CROSS (the Customs Rulings Online Search System) | A ruling letter per request, cited on the entry line as "RLNG" plus the number |
| **Census Bureau** | Schedule B, the ten-digit export classification, and the statistical use of import data | A yearly edition for exports |

Three patterns:

- **The six digits are international, the rest are national.** A US ten-digit number, an EU eight-digit CN code and a Canadian code for the same product share the first six; everything after is each country's. Store the shared and national parts separately, per jurisdiction ([EU, UK & Canada Customs](/books/logistics/customs-outside-the-us)).
- **The schedule is versioned law.** USITC issues revisions during the year, and every fifth year the WCO rebuilds the HS; a number valid on one entry date may not exist on the next. A classification without its edition is unverifiable.
- **Binding rulings are the importer's protection.** A ruling fixes CBP's position for the transaction it describes; an importer that relies on one, and cites it, has evidence of reasonable care that a vendor's suggestion or an old spreadsheet isn't.

## The Tariff Schedule

The HTSUS is organized as sections and chapters (97 chapters of goods, plus Chapter 98 for special provisions such as articles assembled abroad with US components and Chapter 99 for additional duties and other temporary provisions). Each product line has a four-digit heading, a six-digit HS subheading, an eight-digit US subheading that carries the duty rates, and a ten-digit statistical reporting number that the entry summary requires. The Form 7501 instructions tie the levels to the line: the description must be detailed enough "to permit the classification thereof under the proper statistical reporting number in the HTS," and Chapter 98 and 99 provisions are reported alongside the Chapter 1 to 97 number, not instead of it ([The Entry Summary](/books/logistics/import-entry#the-entry-summary)).

Two things about the schedule bite systems. **The rate line is the eight digits, the statistical suffix is the last two**; drawback's substitution test, for example, works at the eight-digit level and falls back to the ten-digit number only where the eight-digit description begins with "other" (19 U.S.C. 1313(j)), so a model that stores only ten-digit strings can't answer it without parsing. **Free trade agreement rules lag the schedule.** USITC's own compiler's note warns that rules of origin for several agreements "have NOT been updated since major changes to the HTS were proclaimed," that the rule you apply "may contain HTS numbers as in effect in 2002, 2007 or 2012," and that USMCA's rules "are set forth in terms of HS 2012 and may not contain current tariff numbers for some products." A preference claim therefore needs the product's classification in the agreement's own edition, which is a second classification, not a lookup.

## The General Rules of Interpretation

Classification follows the six General Rules of Interpretation (GRIs) printed at the front of the HTSUS, applied in order:

1. **Terms of the headings and notes.** Titles are "for ease of reference only; for legal purposes, classification shall be determined according to the terms of the headings and any relative section or chapter notes," and only then by the later rules. Most products are classified by GRI 1 alone, but only after reading the section and chapter notes, which often exclude what a heading's words seem to include.
2. **Incomplete, unassembled and mixed goods.** A heading for an article includes it "incomplete or unfinished, provided that, as entered, the incomplete or unfinished article has the essential character of the complete or finished article," and includes it "entered unassembled or disassembled" (2(a)); a heading for a material includes mixtures and goods made "wholly or partly" of it, with goods of more than one material classified under rule 3 (2(b)).
3. **Goods prima facie in two headings.** First, "the heading which provides the most specific description shall be preferred to headings providing a more general description" (3(a)); if that fails, mixtures, composite goods and "goods put up in sets for retail sale" are classified by "the material or component which gives them their essential character" (3(b)); failing that, "the heading which occurs last in numerical order" among those that equally merit consideration (3(c)).
4. **Most akin.** Goods the rules above can't classify go under "the heading appropriate to the goods to which they are most akin."
5. **Cases and packing.** Specially shaped cases "suitable for long-term use and entered with the articles for which they are intended" classify with the articles (5(a)); packing classifies with the goods unless "clearly suitable for repetitive use" (5(b)).
6. **Subheadings.** The same rules apply at the subheading level, "on the understanding that only subheadings at the same level are comparable."

The Additional U.S. Rules of Interpretation add the use rules: a classification "controlled by use (other than actual use)" follows the principal use in the United States at or just before importation; one controlled by actual use is satisfied only if the use is intended, happens, and is proved "within 3 years after the date the goods are entered"; and "a provision for parts of an article covers products solely or principally used as a part of such articles," but a "parts" provision doesn't prevail over a specific provision for the part.

A worked GRI 3(b) case, with illustrative goods and no rate claimed: a retail gift set of a ceramic mug and a bag of roasted coffee beans is prima facie classifiable in a heading for ceramic tableware (Chapter 69) and one for coffee (heading 0901). Neither heading describes the set as a whole, so 3(a) treats them as equally specific; under 3(b) the set is classified by whichever component gives it its essential character, a judgment about value, bulk, role and how the set is sold. The entry summary then reports the set under the number "from which the rate of duty for the set is derived," prefixed with special program indicator "X," and each other article on a separate line prefixed "V," with "the quantity and value attributed to each article" (Form 7501 instructions). One invoice line, two entry lines: the classification decision changes the shape of the entry, not just a code.

## Binding Rulings

A ruling is "a written statement issued by the Headquarters Office or the appropriate office of Customs" that applies the law to a specific set of facts; an importer or exporter with "a direct and demonstrable interest" may request one, and "Oral opinions or advice of Customs Service personnel are not binding" (19 CFR 177.1). A ruling "represents the official position of the Customs Service with respect to the particular transaction or issue described therein," and its principle "may be cited as authority in the disposition of transactions involving the same circumstances"; a classification ruling applies to "transactions involving articles identical to the sample submitted," a valuation ruling to "the same merchandise and like facts" (19 CFR 177.9). "No other person should rely on the ruling letter," and CBP may modify or revoke it without notice to anyone but the holder, except where the notice-and-comment procedure of 177.12 applies.

For the system, a ruling is evidence with a scope: the holder, the product described (with the sample or specification), the number it sets, the date, and its status (in force, modified, revoked). Classifying an item "per ruling" means linking the classification to the ruling and checking that the item is the product the ruling describes; a ruling for another importer's product is research, not authority. Rulings are public in CROSS, and the entry line cites the ruling number when one applies.

## Valuation

### Transaction Value

Customs value follows a statutory hierarchy: transaction value, then the transaction value of identical merchandise, of similar merchandise, deductive value, computed value, and finally a value reasonably derived from those methods (19 U.S.C. 1401a(a)(1)). Nearly every commercial import uses the first. Transaction value is "the price actually paid or payable for the merchandise when sold for exportation to the United States," plus, when not already included, packing costs, selling commissions the buyer pays, assists, royalties and license fees the buyer must pay as a condition of the sale, and proceeds of a later resale that accrue to the seller (1401a(b)(1)).

The price actually paid or payable is "the total payment (whether direct or indirect" ... "made, or to be made, for imported merchandise by the buyer to, or for the benefit of, the seller," exclusive of "charges, costs, or expenses incurred for transportation, insurance, and related services" incident to the international shipment (19 CFR 152.102(f); 19 U.S.C. 1401a(b)(4)(A)). Post-importation assembly, maintenance or technical assistance, transportation after importation, and "customs duties and other Federal taxes currently payable" are excluded when identified separately from the price (1401a(b)(3)).

An assist is something the buyer supplies free or at reduced cost for the production of the goods (19 CFR 152.102(a)(1)):

- "Materials, components, parts, and similar items incorporated in the imported merchandise."
- "Tools, dies, molds, and similar items used in the production of the imported merchandise."
- "Merchandise consumed in the production of the imported merchandise."
- "Engineering, development, artwork, design work, and plans and sketches" that are "undertaken elsewhere than in the United States" and "necessary for the production of the imported merchandise."

### A Worked Entered Value

An importer buys 10,000 molded housings at $4.80 each, CIF Los Angeles, from an unrelated factory. It supplied the mold, which cost it $36,000, and expects the mold to produce 60,000 housings; it pays its own buying agent 3% and the seller's selling agent 2%; and the invoice shows $2,100 of ocean freight and insurance. The figures are illustrative:

| Component | Treatment | Amount |
| --- | --- | --- |
| Invoice price, CIF | Price actually paid or payable, before deductions | $48,000.00 |
| International freight and insurance | Excluded from the price | ($2,100.00) |
| Selling commission paid by the buyer, 2% of $48,000 | Added | $960.00 |
| Buying commission, 3% | Not a statutory addition | $0.00 |
| Assist: the mold, $36,000 over 60,000 units, for 10,000 units | Added, apportioned | $6,000.00 |
| **Transaction value** | | **$52,860.00** |

The regulation apportions an assist "in a reasonable manner appropriate to the circumstances": when the whole anticipated production is for export to the United States, the importer may put the full value on the first shipment, spread it over the units produced up to the first shipment, or spread it over the entire anticipated production, as here, or ask for another method consistent with generally accepted accounting principles; when only part of the production comes to the United States, the method depends on the documentation the importer submits (19 CFR 152.103(e)). Whichever method is chosen has to be documented and applied consistently across entries. The data point that matters: the assist's value and apportionment live outside the invoice, in the importer's tooling records, and must be pulled into each entry line's value until the mold's value is used up.

### Related Parties

Buyer and seller are related under a list that includes family, officers and directors, partners, employer and employee, anyone "directly or indirectly owning, controlling, or holding with power to vote" "five percent or more of the outstanding voting stock or shares" of the other, and persons under common control (19 CFR 152.102(g); 19 U.S.C. 1401a(g)). Between related parties, transaction value is acceptable only if "the relationship between such buyer and seller did not influence the price actually paid or payable," shown by the circumstances of the sale, or if the value "closely approximates" a test value such as the transaction value of identical or similar goods sold to unrelated US buyers (1401a(b)(2)(B)). Transfer pricing adjustments made after entry change the price, which is why the 7501 instructions say a value that isn't the final transaction value "should later be reported under a Reconciliation Entry (Type 09), if approved for reconciliation." The relationship itself is reported on every entry summary line, "Y" for related as defined in 19 CFR 152.102(g) and "N" for not, so it belongs on the party relationship, dated, and is copied to the entry, not typed by the filer. The first-sale rule, which lets a middleman's importer declare the factory's earlier sale price when that sale was for export to the US, comes from case law and CBP guidance not opened for this chapter. <!-- source-gap: logistics-classification-first-sale | missing | the first sale for export rule (Nissho Iwai) and CBP's first sale declaration requirements | closes with: CBP's first sale guidance or the Federal Circuit decision, opened and cited | checked: 2026-11-22 -->

## Country of Origin

### Substantial Transformation

Origin for most purposes is where the goods were wholly obtained or last substantially transformed. Work in a second country changes origin only if it effects "a substantial transformation," and the marking rules are written for the "ultimate purchaser," "the last person in the United States who will receive the article in the form in which it was imported" (19 CFR 134.1(b) and (d)). For goods of Canada and Mexico, CBP's Part 102 rules (a tariff-shift test, product by product) "also determine the country of origin for marking purposes" under USMCA (19 CFR 102.0).

Origin is what the 2025 and 2026 tariff programs key on. CBP's Section 301 guidance says the China duties "only apply to articles that are products of the People's Republic of China" and that "Section 301 duties are based on country of origin, not country of export"; the Section 301 forced labor duties of July 2026 are set per economy of origin; and steel, aluminum and copper lines report the country where the metal was melted and poured or smelted and cast, a different origin from the article's ([Tariff Programs](/books/logistics/tariff-programs)). A product finished in a third country may be that country's for duty and China's for its steel, and a minor operation (repacking, labeling, simple assembly) moves nothing. Every origin claim is therefore a determination with a basis and evidence: the bill of materials, the operations performed where, the suppliers of each input.

### Marking

Every article of foreign origin must be marked "in a conspicuous place as legibly, indelibly, and permanently as the nature of the article (or container) will permit," with the English name of the country of origin, and goods not properly marked and not remedied before liquidation owe "a duty of 10 per centum ad valorem" on top of any other duty (19 U.S.C. 1304(a) and (i)). Marking is a product attribute (the method, the location, the exceptions claimed) and a receiving check, and the entry's origin, the item's marking and the certificate behind a preference claim must agree.

## How to Build It

Four tables hold the decisions: the tariff schedule as data, an item's classifications by jurisdiction and edition, rulings, and origin determinations; a fifth carries the value additions on each entry line. `shipment_lines` gains the origin, manufacturer and unit price the entry needs:

```sql
-- The tariff schedule as published, one row per number per edition.
CREATE TABLE tariff_schedule_lines (
  jurisdiction  TEXT NOT NULL,           -- 'US', 'EU', 'CA', 'GB'
  edition       TEXT NOT NULL,           -- e.g. 'HTSUS-2026-R23', 'HS2022'
  number        TEXT NOT NULL,           -- digits only: '6912004400'
  level         SMALLINT NOT NULL CHECK (level IN (4, 6, 8, 10)),
  description   TEXT NOT NULL,
  unit          TEXT,                    -- the reporting unit for ten-digit numbers
  general_rate  TEXT,                    -- as printed; computed rates live in tariff_measures
  valid_during  DATERANGE NOT NULL,
  PRIMARY KEY (jurisdiction, edition, number)
);

-- An item's classification in one jurisdiction and edition, with its basis.
CREATE TABLE item_classifications (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id          UUID NOT NULL REFERENCES items (id),
  jurisdiction     TEXT NOT NULL,
  nomenclature     TEXT NOT NULL CHECK (nomenclature IN ('HS', 'HTSUS', 'SCHEDULE_B', 'CN',
                     'TARIC', 'UK_TARIFF', 'CA_TARIFF')),
  edition          TEXT NOT NULL,
  code             TEXT NOT NULL,
  basis            TEXT NOT NULL CHECK (basis IN ('gri_1', 'gri_2a', 'gri_2b', 'gri_3a',
                     'gri_3b', 'gri_3c', 'gri_4', 'gri_6', 'ruling', 'agreement_edition')),
  set_role         TEXT CHECK (set_role IN ('essential', 'other')),  -- the 7501 X and V lines
  rationale        TEXT NOT NULL,        -- headings and notes considered, why this one
  customs_ruling_id UUID,                -- when basis = 'ruling'
  classified_by    TEXT NOT NULL,        -- a person, a broker, a tool
  reviewed_by      TEXT,                 -- the licensed broker or trade lead who approved
  valid_during     DATERANGE NOT NULL,
  EXCLUDE USING gist (item_id WITH =, jurisdiction WITH =, nomenclature WITH =,
                      valid_during WITH &&)  -- needs btree_gist; one answer per day
);

-- A binding ruling: who holds it, what it describes, what it decided.
CREATE TABLE customs_rulings (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  country          CHAR(2) NOT NULL DEFAULT 'US',
  ruling_number    TEXT NOT NULL,        -- as cited on the entry, e.g. 'N123456', 'H123456'
  kind             TEXT NOT NULL CHECK (kind IN ('classification', 'valuation', 'origin',
                     'marking', 'other')),
  holder_party_id  UUID REFERENCES parties (id),  -- null: another importer's, for research
  issued_on        DATE NOT NULL,
  product          TEXT NOT NULL,        -- the goods as the ruling describes them
  decided_code     TEXT,
  decided_origin   CHAR(2),
  status           TEXT NOT NULL CHECK (status IN ('in_force', 'modified', 'revoked')),
  superseded_by_id UUID REFERENCES customs_rulings (id),
  document_id      UUID NOT NULL REFERENCES documents (id),
  UNIQUE (country, ruling_number)
);
ALTER TABLE item_classifications
  ADD FOREIGN KEY (customs_ruling_id) REFERENCES customs_rulings (id);

-- Where an item (or a lot of it) comes from, and why.
CREATE TABLE origin_determinations (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id            UUID NOT NULL REFERENCES items (id),
  lot_id             UUID REFERENCES lots (id),    -- when origin varies by production run
  manufacturer_party_id UUID REFERENCES parties (id),
  purpose            TEXT NOT NULL CHECK (purpose IN ('non_preferential', 'marking',
                       'metal_melt_pour', 'metal_smelt_cast', 'preferential')),
  country            TEXT NOT NULL,      -- ISO 3166-1 alpha-2, or 'OTH' where CBP allows it
  basis              TEXT NOT NULL CHECK (basis IN ('wholly_obtained',
                       'substantial_transformation', 'tariff_shift', 'melt_and_pour',
                       'agreement_rule', 'ruling')),
  operations         JSONB NOT NULL DEFAULT '[]',  -- where each production step happened
  customs_ruling_id  UUID REFERENCES customs_rulings (id),
  evidence_document_ids UUID[] NOT NULL DEFAULT '{}',  -- BOMs, supplier declarations
  marking_method     TEXT,               -- 'molded', 'label', 'container_only', 'exception'
  determined_by      TEXT NOT NULL,
  valid_during       DATERANGE NOT NULL
);
CREATE INDEX ON origin_determinations (item_id, purpose);

-- Statutory additions and deductions behind an entry line's value.
CREATE TABLE entry_line_value_adjustments (
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  customs_entry_line_id UUID NOT NULL REFERENCES customs_entry_lines (id),
  kind                  TEXT NOT NULL CHECK (kind IN ('assist', 'selling_commission',
                          'packing', 'royalty', 'resale_proceeds',
                          'international_freight', 'insurance', 'post_import_cost',
                          'duties_and_taxes')),
  direction             TEXT NOT NULL CHECK (direction IN ('add', 'deduct')),
  amount                BIGINT NOT NULL CHECK (amount >= 0),  -- minor units
  currency              CHAR(3) NOT NULL,
  apportionment         JSONB,           -- e.g. {"method": "units", "of": 60000, "here": 10000}
  source_document_id    UUID REFERENCES documents (id),       -- the tooling or royalty record
  CHECK ((kind IN ('international_freight', 'insurance', 'post_import_cost',
                   'duties_and_taxes')) = (direction = 'deduct'))
);

-- What the entry needs on each shipment line, and on the parties' relationship.
ALTER TABLE shipment_lines
  ADD COLUMN origin_country        CHAR(2),
  ADD COLUMN manufacturer_party_id UUID,
  ADD COLUMN unit_price            NUMERIC(14, 4),  -- invoice price per unit, minor units
  ADD CONSTRAINT shipment_lines_manufacturer_fk FOREIGN KEY (manufacturer_party_id)
    REFERENCES parties (id) NOT VALID;
```

The classification an entry uses is the one valid on the entry date, in the edition in force on that date, and a classification is only as good as the number still existing:

```sql
-- Items whose current US classification doesn't exist in the edition in force on $1.
SELECT i.sku, c.code, c.edition AS classified_in, s.edition AS in_force
FROM item_classifications c
JOIN items i ON i.id = c.item_id
JOIN LATERAL (
  SELECT DISTINCT edition FROM tariff_schedule_lines
  WHERE jurisdiction = 'US' AND valid_during @> $1::date
) s ON TRUE
WHERE c.jurisdiction = 'US' AND c.nomenclature = 'HTSUS'
  AND c.valid_during @> $1::date
  AND NOT EXISTS (
    SELECT 1 FROM tariff_schedule_lines t
    WHERE t.jurisdiction = 'US' AND t.edition = s.edition
      AND t.number = c.code AND t.level = 10
  );
```

Run it when USITC posts a revision and again before January 1, 2028: every row is an item that will fail at ABI or, worse, pass under a number that now means something else.

Design notes:

- **A classification is a decision, not an attribute.** It has a basis (the GRI or ruling), a rationale, a preparer and a reviewer, and a validity range; reclassification ends one row and starts another, so the entry filed last March can still show the classification it used ([Effective-Dated Rows](/docs/database/temporal-data#effective-dated-rows)).
- **Keep one answer per item, jurisdiction and day.** The exclusion constraint stops two current classifications; a preference claim that needs the agreement's older edition is a second row with nomenclature and edition saying so.
- **Origin has several purposes.** Non-preferential origin, marking origin, metal origin and preferential origin can differ for one item, and each has its own determination and evidence.
- **Value adjustments are lines, not a fudge factor.** The entered value on an entry line is the invoice value plus and minus its `entry_line_value_adjustments`, so an assist or royalty audit can trace every dollar.
- **The schedule is reference data with editions.** Load each USITC revision into `tariff_schedule_lines` as published, never edit in place, and compare editions as data.
- **Commerce's item customs data maps here.** The Commerce volume's per-item `item_customs` row (HS code, national codes, origin, classified by) is, in this model, one `item_classifications` row per nomenclature plus one `origin_determinations` row, with the evidence the merchant's version doesn't need.

## Auditing

- **Every classification** per item, jurisdiction and edition, with basis, rationale, preparer, reviewer, validity and the entries that used it.
- **Every ruling** held or relied on, as issued, with modifications and revocations and the date the importer learned of them.
- **Every value adjustment** per entry line, with the source record and apportionment, and the assists and royalties tracked until fully allocated.
- **Every related-party relationship,** dated, and the test value or circumstances-of-sale analysis that supported transaction value.
- **Every origin determination** by purpose, with the operations, inputs and evidence, and marking checks at receiving.

## What This Means for the System You Build

- **Store classifications per item, jurisdiction, nomenclature and edition,** with the GRI or ruling behind each and who approved it.
- **Load the tariff schedule as versioned data** and test every item against the next edition before it takes effect, including HS 2028 on January 1, 2028.
- **Link rulings to the items they actually describe,** and track their status.
- **Compute entered value from the invoice plus statutory adjustments,** each a line with its evidence and apportionment.
- **Keep related-party status on the relationship,** dated, not on the entry.
- **Determine origin per purpose** (duty, marking, metal, preference) with the operations and suppliers that justify it.
- **Treat origin as the key the tariff programs use,** because the 2026 additional duties attach by country of origin, not by where the goods shipped from.

## References

**Statutes and regulations**

- [19 U.S.C. 1401a: Value](https://www.law.cornell.edu/uscode/text/19/1401a), the valuation hierarchy, transaction value and its additions and exclusions, related parties and test values
- [19 U.S.C. 1304: Marking of imported articles and containers](https://www.law.cornell.edu/uscode/text/19/1304), the marking standard and the 10% additional duty
- [19 U.S.C. 1313: Drawback and refunds](https://www.law.cornell.edu/uscode/text/19/1313), the eight-digit substitution test and the "other" rule
- [19 CFR 152.102: Definitions (valuation)](https://www.law.cornell.edu/cfr/text/19/152.102), assists, price actually paid or payable and related persons
- [19 CFR 152.103: Transaction value](https://www.law.cornell.edu/cfr/text/19/152.103), apportioning an assist's value across production and shipments
- [19 CFR 177.1: General ruling practice and definitions](https://www.law.cornell.edu/cfr/text/19/177.1), what a ruling is, who may ask, and oral advice
- [19 CFR 177.9: Effect of ruling letters](https://www.law.cornell.edu/cfr/text/19/177.9), the scope of reliance, modification and revocation
- [19 CFR 134.1: Definitions (country of origin marking)](https://www.law.cornell.edu/cfr/text/19/134.1), substantial transformation and the ultimate purchaser
- [19 CFR 102.0: Scope (rules of origin)](https://www.law.cornell.edu/cfr/text/19/102.0), Part 102 rules for marking USMCA goods

**Government and standards**

- [USITC: General Rules of Interpretation, HTSUS Revision 23 (2026)](https://hts.usitc.gov/reststop/file?release=currentRelease&filename=General%20Rules%20of%20Interpretation), GRIs 1 to 6, the Additional U.S. Rules and the compiler's note on outdated FTA rules
- [CBP: Form 7501 and instructions (rev. 11/26)](https://www.cbp.gov/document/forms/form-7501-entry-summary-continuation-sheets), statistical reporting numbers, ruling citations and the X and V set lines
- [CBP: Customs Rulings Online Search System](https://rulings.cbp.gov/home), published rulings
- [CBP: Section 301 trade remedies FAQs](https://www.cbp.gov/trade/programs-administration/entry-summary/section-301-trade-remedies/faqs), duties based on country of origin, not country of export
- [WCO: What is the Harmonized System](https://www.wcoomd.org/en/topics/nomenclature/overview/what-is-the-harmonized-system.aspx), six-digit codes used by more than 200 countries
- [WCO: HS 2028 amendments (January 2026)](https://www.wcoomd.org/en/media/newsroom/2026/january/hs-2028-amendments-adapting-the-harmonized-system-to-global-priorities-and-trade-evolution.aspx), 299 sets of amendments in force January 1, 2028
- [Census Bureau: Schedule B](https://www.census.gov/foreign-trade/schedules/b/index.html), the export classification and its yearly edition
