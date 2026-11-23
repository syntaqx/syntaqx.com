+++
title = "The Google Ad Tech Cases"
nav_title = "Google Ad Tech Cases"
description = "US v. Google on ad tech: liability, the 2026 remedies, the EU 2025 decision, the other cases, and what changes for engineers building ad servers and exchanges."
category = "Advertising Industry"
order = 2921
part = "Programmatic"
tags = ["advertising", "ad-tech", "programmatic", "antitrust", "google", "data-model"]
+++

The open-web ad stack has been shaped since 2008 by one company holding both sides of the market: Google bought DoubleClick, whose publisher ad server (DFP, now part of Google Ad Manager) then held 60% of publisher ad serving and served nine of the top ten US sites, and built AdX, the largest open-web display exchange, and Google Ads and DV360, the largest buyers. In April 2025 a federal court in Virginia found that Google had unlawfully monopolized two of those markets and tied them together; in September 2026 the same court ordered behavioral remedies and declined to order a sale of AdX. In September 2025 the European Commission fined Google €2.95 billion for self-preferencing in the same stack.

The cases matter to engineers because the conduct the court found unlawful was implemented in auction code and configuration: who gets the first look at an impression, who sees the winning bid before answering, whether a publisher may set different floors for different exchanges, and which bids reach which ad server. The remedies are requirements on that code, and they change what a publisher ad server, an exchange and a header bidding setup can do and must record. This chapter covers the US case (what was alleged, what the court found, what it rejected), the remedies, the EU decision, the other cases, and the engineering consequences, then the records an ad server or exchange keeps to show which auction rules applied.

It extends `auctions` and `deals` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model) and `bids` as [OpenRTB](/books/advertising/openrtb#how-to-build-it) and [Demand-Side Platforms](/books/advertising/demand-side-platforms#how-to-build-it) extend them. The mechanics referred to here are covered in [How Programmatic Works](/books/advertising/how-programmatic-works), [SSPs & Ad Exchanges](/books/advertising/ssps-and-exchanges#the-exchange-auction) and [Header Bidding & Prebid](/books/advertising/header-bidding-and-prebid); dynamic allocation and line item priorities are sketched in [The Life of an Impression](/books/advertising/advertising-business#the-life-of-an-impression) and covered in [Ad Servers](/books/advertising/ad-servers); auction theory is [Auction Mechanics](/books/advertising/auction-mechanics); floors are [Floors & Yield Optimization](/books/advertising/floors-and-yield-optimization). Google's other competition cases (search, Android, app stores) are outside this volume; the Hosting & Cloud volume's [Competition Cases](/books/hosting-and-cloud/competition-cases) covers cloud-market cases. Nothing here is legal advice; the court documents are the authority.

## How the Platforms Do It

As of November 2026, the proceedings and their status:

| Proceeding | Forum | Status | What it found or seeks |
| --- | --- | --- | --- |
| **Canada: Commissioner of Competition v. Google** | Competition Tribunal | Application filed November 2024; status not public on reachable pages | Divestiture of DFP and AdX and a penalty, per secondary reports |
| **EU: Case AT.40670 (Google Adtech)** | European Commission | €2.95 billion fine, September 5, 2025; Google given 60 days to propose measures | Self-preferencing AdX in DFP and in Google Ads and DV360 bidding "between at least 2014 and today" |
| **Texas v. Google (ad tech)** | E.D. Tex., No. 4:20-cv-00957 | Jury trial stayed until final judgment in the Virginia case, per secondary reports | State antitrust and deceptive practices claims over the same stack |
| **United States v. Google LLC (ad tech)** | E.D. Va., No. 1:23-cv-00108 | Liability opinion April 17, 2025; remedies order and memorandum September 2, 2026, unsealed September 16, 2026 | Monopolization of publisher ad server and ad exchange markets and an unlawful tie; behavioral remedies for six years, no AdX divestiture |
| **Private and competitor suits** | Various | Pending | Magnite reports its own litigation against Google LLC in its 2025 results |

Two patterns:

- **Behavioral, not structural.** Both the US court and, so far, the Commission have left Google owning DFP and AdX and changed what it may do with them. The work therefore lands on engineers: interoperability, data exports and the removal of specific auction advantages.
- **The open-web market is defined narrowly.** The US court's markets are "open-web display": they exclude search, social, retail media and CTV, which is why most advertising spend and most of Google's advertising revenue (Search & other was $224.5 billion in 2025; Network, the line holding AdX and Ad Manager, $29.8 billion) are outside the remedies.

## The US Case

**Parties and procedure.** The United States and eight states sued on January 24, 2023; nine more states joined in an amended complaint on April 17, 2023, for 17 states in all. The case was tried to Judge Leonie M. Brinkema without a jury in September 2024: the opinion describes a "three-week bench trial" with 39 live witnesses, and the jury demand was struck after the plaintiffs' damages claim was dismissed. The 115-page memorandum opinion (Dkt. 1410) was filed April 17, 2025.

**Markets.** The court found two relevant product markets and rejected a third:

- the **open-web display publisher ad server market** (DFP's market): Google's US share was 86.5-92.3% by the plaintiffs' expert's measures and 84-90% by Google's internal estimates;
- the **open-web display ad exchange market** (AdX's market): AdX handled 63-71% of worldwide open-web display transactions among reporting exchanges from 2018 to 2022, an estimated 54-65% of all, about nine times the next rival's 6%;
- the plaintiffs "failed to prove that there is a relevant market for open-web display advertiser ad networks", the market Google Ads would have been measured in.

**Findings.** The court held that Google willfully acquired and maintained monopoly power in the two markets in violation of Section 2 of the Sherman Act and unlawfully tied DFP and AdX in violation of Sections 1 and 2. It found that the DoubleClick (2008) and Admeld acquisitions were not shown to be anticompetitive "when viewed in isolation." The conduct the opinion walks through is the engineering in this chapter:

- **The tie.** AdX's real-time bids from Google Ads demand were available in full only to publishers using DFP, and DFP gave AdX advantages no other exchange had.
- **First Look.** AdX got the first opportunity to bid on DFP impressions, even when publishers preferred other exchanges.
- **Last Look.** When header bidding spread (the opinion dates its "widespread adoption by large publishers" to 2015, with the winning header bid often entered into DFP as a floor against AdX), AdX could see the best header bid and outbid it.
- **Unified Pricing Rules (2019).** Google removed publishers' ability to set different floors for AdX and other exchanges. The court found UPR "did not require a level playing field", because it still let publishers set higher floors on third-party exchanges than on AdX, and that it increased the impressions AdX won and the revenue it received.
- **Open Bidding (2018).** Google's in-DFP alternative to header bidding was not a substitute, the court found, because of its "5% fee", its ban on rival exchanges' own DSP bids, and the bid data it shared with Google.
- **Project Poirot (2017).** DV360 shaded its bids on non-AdX exchanges; after a second version in late 2018, DV360 bids on rivals fell by up to 90% and rivals' DV360 revenue fell 15% on average, with OpenX's down 40%.

The opinion also records the money: AdX took "around 20%" overall, varied per impression under dynamic revenue share, while publisher ad server fees for large publishers "typically average about 1% to 2%" of the impression's revenue, and "typically, between $20 to $40 of every $100 spent on digital advertising goes to the ad tech companies." By early 2014, AdX won 53% of the inventory DFP made available for auction.

## The Remedies

The remedies phase produced a two-page order and a 106-page memorandum (Dkt. 1858) filed September 2, 2026; the memorandum was unsealed September 16, 2026. The memorandum on the public docket is a scanned image; the summary below follows reporting on the unsealed opinion, checked against the scan's machine-read (OCR) text where that text was legible, which is not the same as reading the entered final judgment. The final judgment's entry date and any appeal were not confirmed on reachable pages as of November 22, 2026. <!-- source-gap: adv-google-remedies-primary | secondary | the remedies granted and denied, effective date and duration in US v. Google (ad tech), from the court's own text | closes with: a text-searchable copy of Dkt. 1858 or the entered final judgment | checked: 2026-11-22 --> <!-- source-gap: adv-google-remedies-appeal | status | the entry date of the final judgment and whether Google or the plaintiffs appealed | closes with: the E.D. Va. or Fourth Circuit docket | checked: 2026-11-22 -->

**Denied**:

- divestiture of AdX, which the court found "neither realistic nor needed";
- open-sourcing DFP's final auction logic;
- a contingent divestiture of DFP;
- an escrow of half of AdX and DFP net revenue;
- remedies on DV360, and data sharing extended to all ad formats;
- broad anti-circumvention and anti-retaliation provisions, as too vague;
- the plaintiffs' 15-year term.

**Granted**, for six years, worldwide (per the reporting), effective 60 days after entry:

- **No tie.** Google may not condition DFP on AdX or AdX on DFP, or recreate the tie by other means; publishers using DFP need not use AdX to reach Google Ads demand.
- **No First Look, Last Look or Unified Pricing Rules** for indirect (non-direct-sold) transactions.
- **Per-exchange floors.** Publishers may set different floors on different exchanges.
- **Prebid interoperability.** Google must build integrations that let Prebid solicit real-time AdX bids for "all indirect open-web display inventory", and DFP publishers must be able to route indirect and programmatic direct demand through Prebid.
- **AdX bids to rival ad servers** on the same terms DFP receives them.
- **Data.** Publishers may export their DFP data to competing ad servers and receive AdX bid data, including losing bids; Google must document how DFP selects ads and provide a per-ad data file with candidate prices, adjustments and the reason the winner was chosen.
- **Buy side.** Remedies on Google Ads (AdWords) bidding, which may favor AdX only for advertiser return on investment and not because Google owns it; none on DV360, which the court found played no role in the liability phase.
- **Oversight.** A Monitor with access to documents, employees and source code, supported by a Technical Committee and an Internal Compliance Officer.

The court found that, with only behavioral remedies, the final judgment "should be implemented within 15 months." A plaintiffs' expert estimated that removing Unified Pricing Rules alone would lower AdX's take rate from 20% to roughly 16.6%. Magnite's guidance for 2027, given in its third-quarter 2026 results, excludes "upside from Google remedies."

## The EU Decision

On September 5, 2025 the European Commission fined Google €2.95 billion in Case AT.40670 for abusing dominant positions by favoring its own exchange, "between at least 2014 and today": DFP favored AdX in ad selection, for example by "informing AdX in advance of the value of the best bid from competitors which it had to beat to win the auction", and "Google Ads was avoiding competing ad exchanges and mainly placing bids on AdX." The Commission gave Google 60 days to propose how it would comply, and stated a preliminary view that "only the divestment by Google of part of its services would address the situation of inherent conflicts of interest", without ordering one. Reports describe Google proposing behavioral measures in November 2025 and the Commission publishing the decision's public version on January 14, 2026; I found no Commission remedies decision through November 2026. <!-- source-gap: adv-eu-adtech-remedies | status | whether the European Commission accepted Google's November 2025 measures or ordered other remedies in AT.40670 | closes with: a Commission press release or decision on the measures | checked: 2026-11-22 -->

## The Other Cases

**Texas and the states.** Texas, leading a group of states, sued Google over ad tech in the Eastern District of Texas (No. 4:20-cv-00957, Judge Sean Jordan); reports describe the jury trial as stayed in July 2025 until final judgment in the Virginia case. Texas's $1.375 billion settlement with Google in May 2025 resolved privacy suits, not this case, which press summaries sometimes conflate. <!-- source-gap: adv-texas-privacy-settlement | secondary | Texas's May 2025 $1.375 billion settlement with Google covered privacy suits, not the ad tech case | closes with: the Texas Attorney General's release or the settlement agreement | checked: 2026-11-22 --> <!-- source-gap: adv-texas-adtech-status | secondary | the stay and current status of Texas v. Google (ad tech) | closes with: the E.D. Tex. docket or an order | checked: 2026-11-22 -->

**Canada.** The Commissioner of Competition applied to the Competition Tribunal in November 2024 seeking divestiture of DFP and AdX and a penalty; the Bureau's release and the Tribunal's pages were not reachable for this chapter. <!-- source-gap: adv-canada-adtech-status | secondary | the Canada Competition Bureau's Google ad tech application and its status | closes with: the Competition Tribunal file or a Bureau release | checked: 2026-11-22 -->

**Private suits.** Publishers and ad tech companies have sued for damages, building on the liability findings; Magnite's 2025 results list litigation expense in its own suit against Google LLC.

## What Changes for Engineers

The remedies are written about Google's products, but they set expectations every publisher ad server, exchange and wrapper will be measured against, and the MRC's auction transparency standards, final in January 2026, point the same way for everyone.

**1. Auction rules become versioned, disclosed configuration.** Whether any participant gets a first look, whether the ad server compares header bids before or after its own exchange answers, whether floors are uniform or per exchange: each is now a rule a publisher, a monitor or a court can ask about by date. An ad server or exchange should hold these as rule versions with effective dates and record on each auction which version decided it ([Effective Dates and Versions](/docs/building-blocks/rules-as-data#effective-dates-and-versions)). The MRC's standards already require disclosing the auction type, how a bid becomes a clearing price, and reserves, which "should not be set on a per-buyer basis."

**2. No participant sees others' bids first.** Last Look was an information advantage: one bidder answering after seeing the price to beat. The general rule for any unified auction is that every source answers under the same information, and where a source can't (a header bid that arrives as a key-value before the ad server's exchange runs), the asymmetry is stated in the rules and recorded.

**3. Floors are set per exchange, on a stated basis.** Per-exchange floors return to Ad Manager for indirect demand; a publisher's floor configuration then needs per-exchange values and a basis (gross or net of each exchange's fee), and the auction record must show which floor applied to each bid. [Floors & Yield Optimization](/books/advertising/floors-and-yield-optimization) covers setting them.

**4. Google demand arrives through Prebid.** When AdX bids can be solicited by Prebid, AdX becomes one more bidder in the header auction for indirect display, competing on the same timeout and price granularity as any SSP, and a publisher can use a rival ad server and still receive AdX bids. The integration details were not public as of November 2026; the engineering consequence is that a publisher's header bidding configuration, price buckets and line item setup should be ready to treat Google's exchange like any other demand source ([Header Bidding & Prebid](/books/advertising/header-bidding-and-prebid)). <!-- source-gap: adv-adx-prebid-adapter | status | the technical form of the court-ordered Prebid interoperability for AdX bids (adapter, server-side, timing) | closes with: Google or Prebid.org documentation of the integration | checked: 2026-11-22 -->

**5. Losing bids and decision reasons are publisher data.** The remedies give publishers AdX bid data including losing bids, and a per-ad file with candidate prices, adjustments and the reason the winner was chosen. Any ad server can offer the same: every candidate (line items, header bids, exchange bids) with its price, every adjustment applied (fee, floor, priority, a temporary CPM under dynamic allocation) and the deciding rule. That is a log the auction already computes; storing it is a retention and privacy decision, not new logic.

**6. Data export is a product.** Publishers may take their DFP configuration and history to a competing ad server. Line items, creatives, targeting, deals, floors and delivery history in a documented export format, with the IDs mapped, are what makes switching possible, and the same [imports and exports](/docs/building-blocks/imports-and-exports) discipline applies.

## How to Build It

The records the remedies and the MRC's standards ask for are the auction rules in force and, per auction, every candidate's price and the adjustments that turned it into the value compared. The core model has the auction and its bids; this chapter adds the rule version that governed each auction, the adjustments on each bid, the per-exchange floors a publisher sets on a deal or an exchange, and the exports a publisher takes away.

```sql
CREATE TABLE auction_rule_versions (     -- the rules an ad server or exchange applied, by date
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  runner_org_id          UUID NOT NULL REFERENCES organizations (id),
  scope_org_id           UUID REFERENCES organizations (id),  -- one publisher network; null = all
  version                INT NOT NULL,
  auction_kind           TEXT NOT NULL,  -- as in auctions.kind
  first_look             BOOLEAN NOT NULL DEFAULT FALSE,  -- any source offered the impression first
  first_look_source      TEXT,           -- who, when first_look is true
  sees_other_bids        BOOLEAN NOT NULL DEFAULT FALSE,  -- any source bids after seeing a rival price
  floors_per_exchange    BOOLEAN NOT NULL DEFAULT TRUE,   -- false: one floor for every exchange (UPR-style)
  floor_basis            TEXT NOT NULL CHECK (floor_basis IN ('gross', 'net')),
  header_bids_compared   TEXT NOT NULL CHECK (header_bids_compared IN ('before_exchange',
                           'with_exchange', 'after_exchange')),
  fees_applied           TEXT NOT NULL CHECK (fees_applied IN ('pre_auction', 'post_auction')),
  applies_to             TEXT NOT NULL CHECK (applies_to IN ('indirect', 'direct', 'all')),
  disclosure_url         TEXT,           -- where the rules are published to buyers and sellers
  effective              TSTZRANGE NOT NULL,
  approved_by            TEXT NOT NULL,
  UNIQUE (runner_org_id, scope_org_id, version),
  CHECK (first_look = (first_look_source IS NOT NULL))
);

ALTER TABLE auctions ADD COLUMN auction_rule_version_id UUID;
ALTER TABLE auctions ADD CONSTRAINT auctions_rule_version_fk
  FOREIGN KEY (auction_rule_version_id) REFERENCES auction_rule_versions (id) NOT VALID;

ALTER TABLE bids
  ADD COLUMN source_kind TEXT,           -- 'line_item', 'header_bid', 'exchange', 'open_bidding', 'deal'
  ADD COLUMN compared_cpm_micros BIGINT, -- the value the decision compared, after adjustments
  ADD COLUMN adjustments JSONB NOT NULL DEFAULT '[]',
             -- ordered: [{"kind":"fee","cpm_micros":-750000,"ref":"fs-..."},
             --           {"kind":"temporary_cpm","cpm_micros":4200000}]
  ADD COLUMN floor_cpm_micros BIGINT,    -- the floor this bid was held to
  ADD COLUMN decided_by TEXT;            -- the rule that ranked it: 'price', 'priority', 'deal_guarantee'
ALTER TABLE bids ADD CONSTRAINT bids_source_kind_check CHECK (source_kind IN ('line_item',
  'header_bid', 'exchange', 'open_bidding', 'deal')) NOT VALID;

CREATE TABLE exchange_floors (           -- a publisher's floor for one exchange, the per-exchange remedy
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  publisher_org_id   UUID NOT NULL REFERENCES organizations (id),
  exchange_org_id    UUID NOT NULL REFERENCES organizations (id),
  ad_unit_id         UUID REFERENCES ad_units (id),   -- null: every unit
  floor_cpm_micros   BIGINT NOT NULL CHECK (floor_cpm_micros >= 0),
  currency           CHAR(3) NOT NULL,
  basis              TEXT NOT NULL CHECK (basis IN ('gross', 'net')),
  effective          TSTZRANGE NOT NULL,
  set_by             TEXT NOT NULL,
  UNIQUE NULLS NOT DISTINCT (publisher_org_id, exchange_org_id, ad_unit_id, effective)
);

CREATE TABLE data_exports (              -- a publisher's configuration or history, exported on request
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  publisher_org_id   UUID NOT NULL REFERENCES organizations (id),
  scope              TEXT NOT NULL CHECK (scope IN ('configuration', 'delivery_history',
                       'bid_data', 'decision_log')),
  period             TSTZRANGE,          -- null for configuration snapshots
  format_version     TEXT NOT NULL,      -- the documented export schema
  requested_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at       TIMESTAMPTZ,
  location           TEXT,               -- where the files were delivered
  row_count          BIGINT,
  checksum           TEXT
);
```

The decision log the remedies describe (every candidate, its adjustments and why the winner won) is a query over these rows, not a separate system:

```sql
-- One auction's candidates, in the order the decision compared them.
SELECT b.source_kind,
       b.buyer_seat_id,
       b.line_item_id,
       b.price_cpm_micros,
       b.adjustments,
       b.floor_cpm_micros,
       b.compared_cpm_micros,
       b.outcome,
       b.loss_reason,
       b.decided_by,
       r.version AS rule_version
FROM auctions a
JOIN bids b                    ON b.auction_id = a.id AND b.auction_started_at = a.started_at
JOIN auction_rule_versions r   ON r.id = a.auction_rule_version_id
WHERE a.started_at = $1 AND a.id = $2
ORDER BY b.compared_cpm_micros DESC NULLS LAST;
```

Design notes:

- **Every auction points at its rules.** `auction_rule_version_id` makes "which rules applied to this impression" a join, not a reconstruction from deploy history; a rule change is a new version with an effective range, approved by a named person.
- **Adjustments are ordered amounts.** The fee, the floor comparison and any temporary CPM (dynamic allocation's stand-in price for a guaranteed line item) are recorded as signed micros in order, so `compared_cpm_micros` is the bid plus its adjustments and can be recomputed. A check in the writer that the sum matches catches an adjustment applied but not logged.
- **Floors are per exchange with a basis.** `exchange_floors` holds a publisher's floor for each exchange and unit with gross or net basis; a uniform floor is the same value on every row, not a missing table.
- **Exports are records.** Each export's scope, period, format version, row count and checksum are kept, so a publisher's switch to another ad server can be shown to have been supported.
- **Retention follows the obligation.** Decision logs are large; keep them whole for the period a remedy or contract requires and sampled after, with the consent signals on the request governing any personal data in them ([Retention](/docs/telemetry/consent-and-privacy#retention)).

## Auditing

- **The rules in force on any date.** Every auction rule version with its effective range, disclosure and approver, because a monitor, a regulator or a publisher will ask what the rules were on a past day.
- **Every candidate and adjustment.** For each auction, every bid and line item considered, its adjustments, its floor and why the winner won, for the publisher's per-ad data and for disputes.
- **Every floor change.** Per-exchange floors with who set them and when, since uniform floors were part of the conduct the court found.
- **Every export.** What was exported, when, in which format, to show interoperability obligations were met.

## What This Means for the System You Build

- **Version your auction rules** (first look, who sees which bids, floor scope and basis, fee timing) and point each auction at the version that decided it.
- **Give every source the same information** in a unified auction, or state and record the asymmetry.
- **Support floors per exchange** with an explicit gross or net basis.
- **Log every candidate with its adjustments** so a decision can be explained per ad.
- **Treat Google's exchange as one more header bidder** in configuration, price buckets and line items.
- **Make configuration and history exportable** in a documented format.

## References

**Court records**

- [United States v. Google LLC, No. 1:23-cv-00108 (E.D. Va.), Memorandum Opinion, Dkt. 1410 (April 17, 2025)](https://storage.courtlistener.com/recap/gov.uscourts.vaed.533508/gov.uscourts.vaed.533508.1410.0.pdf), parties and procedure, the markets and shares, the rejected advertiser ad network market, the tie, First Look, Last Look, Unified Pricing Rules, Open Bidding, Project Poirot, AdX and publisher ad server fees, the DoubleClick acquisition and AdX's 2014 win share
- [United States v. Google LLC, No. 1:23-cv-00108 (E.D. Va.), Remedies Memorandum Opinion, Dkt. 1858 (September 2, 2026)](https://storage.courtlistener.com/recap/gov.uscourts.vaed.533508/gov.uscourts.vaed.533508.1858.0.pdf), the filing date and length of the remedies memorandum, and (from the scan's OCR text) the rejection of structural relief as "neither realistic nor needed", the Prebid and rival ad server integrations, data sharing, the AdWords-only buy-side remedies, the six-year term, the 60-day effective date, the 15-month implementation and the 16.6% UPR take-rate estimate

**Regulation**

- [European Commission: Commission fines Google €2.95 billion over abusive practices in online advertising technology (IP/25/1992, September 5, 2025)](https://ec.europa.eu/commission/presscorner/api/documents?reference=IP/25/1992&language=en), Case AT.40670, the conduct, the period, the preliminary view on divestment and the 60 days to propose measures
- [US Department of Justice: Department of Justice prevails in landmark antitrust case against Google](https://www.justice.gov/opa/pr/department-justice-prevails-landmark-antitrust-case-against-google), the liability ruling and the trial

**Standards**

- [MRC: Digital Advertising Auction Transparency Standards (January 2026)](https://mediaratingcouncil.org/sites/default/files/Standards/MRC_Digital_Advertising_Auction_Transparency_Standards_FINAL_0.pdf), disclosure of auction type, clearing and reserves not set per buyer

**Filings**

- [Alphabet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm), Search & other and Network revenue
- [Magnite: Fourth quarter 2025 results](https://www.sec.gov/Archives/edgar/data/1595974/000159597426000010/a991-earningsq42025.htm), litigation against Google LLC
- [Magnite: Third quarter 2026 results](https://www.sec.gov/Archives/edgar/data/1595974/000159597426000039/a991-earningsq32026.htm), 2027 guidance excluding upside from Google remedies

**Secondary**

- [National Law Review: Court declines to order AdX divestiture in Google ad tech case](https://natlawreview.com/article/court-declines-order-adx-divestiture-google-ad-tech-case), the remedies granted and denied, the unsealing date, effective date, duration, the 15-month implementation finding and the UPR take-rate estimate
- [Tech Policy Press: A deep dive into the antitrust remedies that spared Google's ad tech business](https://techpolicy.press/a-deep-dive-into-the-antitrust-remedies-that-spared-googles-ad-tech-business), the unbundling, Prebid, data and DV360 provisions as read by the author
