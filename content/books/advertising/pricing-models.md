+++
title = "Pricing Models"
description = "CPM, vCPM, CPC, CPA, CPV, CPCV, cost per sale, flat fee, sponsorship and cost per point: what each charges for, who carries the risk and how it bills."
category = "Advertising Industry"
order = 2924
part = "Auctions and Pricing"
tags = ["advertising", "ad-tech", "pricing", "billing", "data-model"]
+++

A pricing model is the unit the buyer pays for: a thousand impressions, a thousand viewable impressions, a click, a view, a completed view, a conversion, a sale, a day on a homepage, a rating point. It is separate from the auction (which sets the price per unit) and from the goal (what the buyer wants). A line item can optimize for purchases, be priced per impression and be judged on cost per acquisition, all at once, and most of the confusion in ad billing comes from treating those three as one.

The choice matters because it moves risk. When the buyer pays per impression, it carries the risk that the impression does nothing; when it pays per click or per sale, the seller carries it, and the seller then has to predict outcomes, police fraud on the billable event, and wait for the event before it can bill. It also decides what can be promised: the IAB/4A's standard terms let a publisher guarantee impressions and owe make-goods for shortfalls, but for cost-per-acquisition, cost-per-lead and cost-per-click deliverables "guaranteed delivery, even delivery, and makegoods are not available." And it decides the billing record: what count the invoice multiplies, whose count it is, and when it is final.

This chapter covers each model (what it charges for, where it's used, who carries the risk and how it's billed), converting between them with eCPM, the billing events platforms define, guaranteed and non-guaranteed deliverables under the standard terms, flat fees, sponsorships and share of voice, and cost per point, then the schema that turns a line item's model into invoice lines. It extends `line_items` and `invoice_lines` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model), and `delivery_daily` for the counts each model bills on. Auctions that set the price per unit are [Auction Mechanics](/books/advertising/auction-mechanics); bid strategies that optimize toward a goal regardless of the billing unit are [Automated Bidding](/books/advertising/automated-bidding); counting the events is Counting Impressions & Clicks and Viewability & Attention; invoicing and reconciliation are Billing & Invoicing and Reconciliation & Discrepancies, in Contracts and Money; cost-per-sale fees from the seller's side, as charges on an order, are Commerce's [Marketplace Ads Elsewhere](/books/commerce/retail-media#marketplace-ads-elsewhere); linear TV guarantees in rating points are Linear TV, Upfronts & Addressable TV.

## How the Platforms Do It

As of November 2026, the pricing units each platform documents:

| Platform | Units offered | Notes |
| --- | --- | --- |
| **Amazon Ads** | Sponsored Brands: cost per click, cost per 1,000 viewable impressions (vCPM), or reserved share of voice with "a minimum spend commitment" | No minimum spend for CPC or vCPM |
| **Apple Ads** | Cost per tap (Advanced); cost per install (Basic) | "Pay only when a user taps your ad, up to a maximum price you choose" |
| **eBay Promoted Listings** | General: cost per sale at an ad rate "between 2% and 100%"; Priority: cost per click; Offsite: dynamic cost per click | The CPS fee applies to the "total sale amount (including item price, shipping, taxes, and any other applicable fees)" for sales within 30 days of the click |
| **Google Ads** | Cost per click; viewable CPM ("Max. CPM is no longer available as a bid strategy"); cost per view on YouTube; pay for conversions in Display for eligible accounts | Viewable means 50% on screen for 1 second (display) or 2 continuous seconds of play (video) |
| **LinkedIn** | Chargeable event follows the optimization goal: impressions, clicks, video views, sends, leads | Charged "for accumulated ad spend on a regular basis" |
| **Meta** | `billing_event` per ad set: impressions, clicks, link clicks, ThruPlay, app installs, post engagement, page likes, offer claims, purchase, listing interaction, none | Optimization goal set separately from the billing event |
| **Publisher direct sales (IAB/4A's terms)** | CPM, CPC, CPL and CPA deliverables; flat fee and fixed placements (roadblocks, time-based and share-of-voice buys, sponsorships) | Only CPM and fixed deliverables are guaranteed |

Two patterns:

- **Impressions remain the base unit, and viewable impressions are replacing raw ones.** Google stopped offering a maximum CPM strategy in favor of viewable CPM; Amazon sells Sponsored Brands in vCPM; the gardens that bill per impression mostly optimize toward something else.
- **Performance pricing is offered where the platform can see the outcome.** Clicks and installs happen on the platform's surface; sales are billed per sale only by marketplaces that own the checkout (eBay's 30-day click window) or by platforms with strict eligibility (Google's pay for conversions requires "more than 100 conversions in the last 30 days" with "90% of your conversions" within seven days of the click).

## The Models

| Model | The buyer pays per | Seller's risk | Buyer's risk | Billed from |
| --- | --- | --- | --- | --- |
| **CPM** | 1,000 impressions counted | None on outcome | The impression wasn't seen or didn't work | Impressions net of invalid traffic, on the controlling count |
| **vCPM** | 1,000 viewable impressions | Non-viewable impressions are unpaid | The viewable impression didn't work | Viewable impressions under the MRC definition, on a named measurer |
| **CPC** | Click | Impressions without clicks | The click didn't convert | Validated clicks |
| **CPV** | View (a watch threshold or an interaction) | Skipped or short plays | The view didn't work | Views under the platform's definition |
| **CPCV** | Completed view | Incomplete plays | The completion didn't work | VAST complete events, deduplicated |
| **CPA / CPL / CPI** | Conversion, lead or install | Everything before the conversion | Attribution claims a conversion the ad didn't cause | Attributed conversions under a stated window and model |
| **CPS** | A percentage of an attributed sale | Everything before the sale | Same as CPA, priced by basket value | Attributed orders, with returns |
| **Flat fee, sponsorship, share of voice** | A placement or a share for a period | Delivery shortfall within the period | Audience smaller than hoped | The period, prorated or whole |
| **Cost per point (CPP)** | One rating point: 1% of the target audience, per spot | A rating below the guarantee | Same as CPM | Ratings from the currency measurer, against the guarantee |

**CPM, cost per mille.** The price of 1,000 impressions; the cost of one impression is the CPM divided by 1,000, which is why this volume keeps prices in micros: a $2.50 CPM is 2,500,000 micros and each impression costs 2,500 micros ([Money & Amounts](/docs/money/amounts)). Impressions count when the ad begins to render under the MRC and IAB's 2017 counting rule, and only impressions net of invalid traffic bill. It is the unit programmatic auctions price in: OpenRTB's `bidfloor` is "minimum bid for this impression expressed in CPM", and a bid's price is a CPM even though it buys one impression.

**vCPM, viewable CPM.** The price of 1,000 impressions that met a viewability standard: for display, 50% of the ad's pixels on screen for one continuous second; for video, two continuous seconds of play (Google: "50 percent of your ad shows on screen for 1 second or longer for Display ads"; video "plays continuously for 2 seconds or longer"). The buyer stops paying for ads below the fold; the seller needs a measurer both sides accept and a way to bill when the measurer can't see the ad (apps without the Open Measurement SDK, some CTV). Viewability & Attention, in Measurement, owns the standard.

**CPC, cost per click.** The model search was built on. The platform ranks by expected value per impression (bid times predicted click-through) and charges only when a click happens, after validation: duplicate, robotic and accidental clicks are filtered before billing, and invalid activity found after billing comes back as a credit ([A Self-Serve Search or Social Click](/books/advertising/advertising-business#a-self-serve-search-or-social-click)). A tap on Apple Ads is the same model by another name.

**CPV and CPCV.** Video priced per view or per completed view. A "view" is a platform definition, not a standard: Google's in-stream ads count "a 30-second watch (or the full ad if it's shorter), or an interaction, whichever comes first"; in-feed ads count when a viewer clicks the thumbnail or the ad autoplays for 10 seconds; Shorts ads count at 10 seconds or an interaction. Bumper ads and non-skippable in-stream ads aren't billed as views at all. A completed view is the VAST `complete` event (VAST & Video Ads, in Channels). Meta's `THRUPLAY` billing event is its own completed-or-long-view definition.

**CPA, CPL, CPI.** The buyer pays per conversion, lead or install, so the seller must count something that happens off its surface (on the advertiser's site or in an app store), through a pixel, a conversion API or a mobile measurement partner, and attribute it to the ad. The billable count is an attribution output; its window and model are part of the price. Google's pay for conversions bills "for the conversions that you receive at your Target CPA" and not for "impressions, interactions, or clicks leading to the conversions", only for eligible accounts with fast conversion cycles; Apple Ads' Basic tier charges per install.

**CPS, cost per sale.** A percentage of the sale, charged when an order is attributed to an ad click. The marketplaces that sell it own the checkout: eBay's general Promoted Listings rate is a percentage of the "total sale amount (including item price, shipping, taxes, and any other applicable fees)" for items sold "within the 30 days after clicking on its ad." For the seller it is a commission on an order; Commerce's [Marketplace Ads Elsewhere](/books/commerce/retail-media#marketplace-ads-elsewhere) books it as an order charge, not a marketing budget, and this volume's operator books it as revenue on the attributed sale. Affiliate commissions are the same shape outside the marketplace (Commerce's [Affiliates and Influencers](/books/commerce/acquisition-and-attribution#affiliates-and-influencers)).

**Flat fee, sponsorship, share of voice.** A price for a placement and a period, not a count: a homepage takeover for a day, a section sponsorship for a month, a roadblock, 100% share of voice on a keyword set. Amazon's reserved share of voice is "a fixed, upfront price to secure top-of-search placement" for branded keywords. The IAB/4A's terms invoice "net cost ... based on actual delivery, flat-fee, or based on prorated distribution of delivery over the term of the IO, as specified on the applicable IO."

**Cost per point.** Television's unit: the price of one gross rating point (one percent of the target demographic reached, once) in a spot or a schedule, so a schedule's cost is its CPP times the GRPs it delivers, against a guarantee in the target demographic and a make-good if ratings fall short. It survives in linear and increasingly in CTV sold "on currency". Linear TV, Upfronts & Addressable TV owns the guarantees and Audience & Cross-Media Measurement the ratings.

## Converting with eCPM

Buyers and sellers compare models through **effective CPM** (eCPM): what a model earns or costs per 1,000 impressions at observed rates. eCPM = rate × billable events per 1,000 impressions. The same impression stream at example rates, priced seven ways:

| Model | Rate (example) | Event rate (example) | Billable events per 1,000 impressions | eCPM |
| --- | --- | --- | --- | --- |
| CPM | $10.00 | 100% | 1,000 impressions | $10.00 |
| vCPM | $15.00 | 60% viewable | 600 viewable | $9.00 |
| CPC | $2.00 | 0.5% click-through | 5 clicks | $10.00 |
| CPV | $0.05 | 20% view rate | 200 views | $10.00 |
| CPCV | $0.025 | 40% completion | 400 completions | $10.00 |
| CPA | $40.00 | 0.025% conversion per impression | 0.25 conversions | $10.00 |
| CPS | 10% of a $100 basket | 0.1% sales per impression | 1 sale, $100 | $10.00 |

At these rates every model pays the seller about the same, but the variance doesn't match: a 0.1-point change in click-through rate moves the CPC line by 20%, and a one-in-a-thousand sale rate means a few hundred impressions can earn nothing or several times the average. That is why auctions convert every bid into expected value per impression before ranking ([Quality-Weighted Ranking](/books/advertising/auction-mechanics#quality-weighted-ranking)), why the seller's prediction quality decides how much a performance model is worth to it, and why a seller offering CPA has to be large enough to average over many advertisers.

Two cautions on eCPM. It is backward-looking: a CPC line item's eCPM is its last period's click-through times its price, not a promise. And it hides who carries the risk: a $10 eCPM on CPM is the buyer's risk, a $10 eCPM on CPA the seller's, and a publisher's yield report that ranks demand by eCPM alone will favor performance demand in good weeks and regret it in bad ones. Publishers & Yield covers the publisher's metrics (eCPM, RPM, fill).

## Billing Events

The billable count is always one party's count of one event under one definition, and the definition is part of the contract. A platform should treat four things as separate fields, because platforms do:

- **The optimization goal**: what the bidder optimizes (purchases, link clicks, reach). Meta sets it per ad set as `optimization_goal`.
- **The billing event**: what is charged. Meta's `billing_event` enum is `APP_INSTALLS`, `CLICKS`, `IMPRESSIONS`, `LINK_CLICKS`, `NONE`, `OFFER_CLAIMS`, `PAGE_LIKES`, `POST_ENGAGEMENT`, `THRUPLAY`, `PURCHASE` and `LISTING_INTERACTION`. LinkedIn's "chargeable event depends on the optimization goal and bidding strategy": impressions, clicks, video views, sends, leads. An ad set can optimize for purchases and bill per impression, the arrangement often called optimized CPM.
- **The bid unit**: what the bid is expressed in, which may differ from the billing event when the platform converts (a cost-per-result goal bid against impression billing).
- **The measured definition**: what counts as the event. A viewable impression under the MRC standard; a Google view at 30 seconds or interaction; a completion as VAST `complete`; a conversion under a window and model; a click after validation.

Each billing event has a settlement lag and a correction path:

| Billing event | Final when | Corrected by |
| --- | --- | --- |
| Impression | Rendered and filtered for general invalid traffic, minutes to hours | Sophisticated invalid traffic found later, as credits |
| Viewable impression | The measurer's report closes | Measurer restatement; the controlling measurement decides disputes |
| Click | Validation completes, usually within the day | Invalid clicks found after billing, credited without rewriting metrics |
| View, completion | The player's beacons arrive, hours for CTV through SSAI | Duplicate and late beacons |
| Conversion, install, lead | The attribution window closes (days to weeks) | Advertiser restatements, fraud findings, returns |
| Sale | The attribution window closes and the return window passes | Returns and cancellations, which a CPS fee should follow |

The rule I'd write into any billing system: **bill on a named count of a named event after its window closes, and record every later correction as its own line.** A CPC invoice can close days after month end; a CPA or CPS invoice can't close until the attribution window for the month's last clicks has passed, which is why platforms that sell CPA tightly restrict who may buy it (Google's eligibility rules) and why a CPS fee is charged per order when the order is attributed and reversed when it's returned, not totaled at month end.

## Guaranteed and Non-Guaranteed Deliverables

The IAB/4A's Standard Terms and Conditions (version 3.0) define deliverables by model ("CPA Deliverables", "CPC Deliverables", "CPL Deliverables", "CPM Deliverables") and treat them differently:

| Term | Guaranteed CPM | Non-guaranteed (CPC, CPL, CPA, some CPM) | Flat fee and fixed placements |
| --- | --- | --- | --- |
| **Cancellation without penalty** | 14 days' prior written notice | 7 days' prior written notice | 30 days' prior written notice (roadblocks, time-based or share-of-voice buys, some sponsorships) |
| **Make-goods** | Owed when "actual Deliverables ... fall below guaranteed levels"; a credit if no make-good is agreed | "Guaranteed delivery, even delivery, and makegoods are not available" | Owed for an omitted placement |
| **Under-delivery notice** | No later than 14 days before the IO's end, where likely | Not applicable | As guaranteed |
| **Bonus impressions** | No more than 10% over the deliverables without consent when a third-party ad server counts, and never charged | Not applicable | Fixed placements run their period regardless of over-delivery unless capped |

So the pricing model on a direct-sold line item decides its delivery type: guaranteed CPM and fixed placements book as guaranteed (reserved inventory, pacing toward a goal, make-goods), and performance-priced lines are non-guaranteed by definition. The core's `line_items` already requires a goal quantity on guaranteed line items; this chapter adds the rule that a guaranteed line item's pricing model must be one a guarantee can apply to. Custom material is outside all three: an advertiser cancelling "will remain liable" for custom content completed before termination, specified "as a separate line item."

## Flat Fees, Sponsorships and Share of Voice

Fixed-price inventory looks simple and is the easiest to bill wrongly, because nothing per impression carries the price.

- **The price is per period, the delivery is still counted.** A $50,000 homepage takeover for one day bills $50,000 whatever the impressions were, but the impressions are still counted, because the buyer's eCPM, the publisher's yield, and the make-good if the takeover ran four hours instead of 24 all need them. The amount is allocated to impressions only for reporting, never for the invoice.
- **Prorating needs a rule.** A month-long sponsorship that starts on the 10th, or is cancelled with 30 days' notice on the 20th, bills a prorated share, by day or by delivery as the IO specifies (the standard terms allow "actual delivery, flat-fee, or ... prorated distribution of delivery over the term"). Store the rule on the line item, not in the invoicing code.
- **Share of voice is a share, not a count.** A 50% share of voice line item is entitled to half the impressions of its ad unit and targeting for its flight; the ad server delivers it at a priority (sponsorship priority on most ad servers) with the share as its goal ([The Life of an Impression](/books/advertising/advertising-business#the-life-of-an-impression) sketches priority classes). The make-good test is the share achieved, not an impression count.
- **Reserved placements on self-serve platforms are flat fees with a minimum.** Amazon's reserved share of voice requires "a minimum spend commitment"; the record is a commitment with a period and a placement, billed as committed.

## Rate Cards

Direct sales price from a rate card: the seller's list price per unit for each placement, format, audience and period, with negotiated discounts off it. Programmatic guaranteed and preferred deals carry a fixed price agreed from the same card, and private auctions a floor. The card matters to systems for three reasons: a proposal or IO quotes from it, an availability check prices against it (Forecasting & Avails, in Ad Serving and Creative), and an agency audit compares what was paid with what was listed. A seller with seasonal pricing (fourth quarter higher, a holiday premium) keeps those as dated versions of the card, so a September IO for December delivery is priced on the December card as of September.

## How to Build It

The core `line_items.pricing_model` lists `cpm`, `vcpm`, `cpc`, `cpa`, `cpv`, `cpcv`, `cps` and `flat_fee`, with `rate_micros` holding the fixed rate or the maximum bid. This chapter widens the list, separates the billing event and the measured definition from the model, adds the counts `delivery_daily` needs for every model, records the model and unit on each invoice line, and adds rate cards.

```sql
-- Wider pricing list, and the billing event separate from the goal.
ALTER TABLE line_items DROP CONSTRAINT line_items_pricing_model_check;
ALTER TABLE line_items ADD CONSTRAINT line_items_pricing_model_check
  CHECK (pricing_model IN ('cpm', 'vcpm', 'cpc', 'cpa', 'cpl', 'cpi', 'cpv', 'cpcv', 'cps',
    'flat_fee', 'share_of_voice', 'cpp')) NOT VALID;

ALTER TABLE line_items
  ADD COLUMN billing_event TEXT,          -- what is charged
  ADD COLUMN event_definition TEXT,       -- e.g. 'mrc_viewable_v2', 'google_view_30s', 'vast_complete',
                                          --      'click_7d_view_1d'; versioned names
  ADD COLUMN rate_bp INT,                 -- cps: percentage of the sale, basis points
  ADD COLUMN sale_basis TEXT,             -- cps: what the percentage applies to
  ADD COLUMN share_bp INT,                -- share_of_voice: 5000 = 50%
  ADD COLUMN proration TEXT,              -- flat_fee and share_of_voice: how a partial period bills
  ADD COLUMN rate_card_entry_id UUID;     -- the list price this was sold from, if direct
ALTER TABLE line_items ADD CONSTRAINT line_items_billing_event_check
  CHECK (billing_event IN ('impression', 'viewable_impression', 'click', 'view',
    'completed_view', 'conversion', 'lead', 'install', 'sale', 'period', 'rating_point'))
  NOT VALID;
ALTER TABLE line_items ADD CONSTRAINT line_items_sale_basis_check
  CHECK (sale_basis IN ('item_price', 'item_and_shipping', 'total_sale_amount')) NOT VALID;
ALTER TABLE line_items ADD CONSTRAINT line_items_proration_check
  CHECK (proration IN ('by_day', 'by_delivery', 'whole_period')) NOT VALID;
ALTER TABLE line_items ADD CONSTRAINT line_items_cps_shape_check
  CHECK (pricing_model <> 'cps' OR (rate_bp BETWEEN 1 AND 10000 AND sale_basis IS NOT NULL))
  NOT VALID;
ALTER TABLE line_items ADD CONSTRAINT line_items_sov_shape_check
  CHECK (pricing_model <> 'share_of_voice' OR share_bp BETWEEN 1 AND 10000) NOT VALID;
-- Only CPM-like and fixed deliverables can be guaranteed (IAB/4A's terms, section VI(c)).
ALTER TABLE line_items ADD CONSTRAINT line_items_guarantee_model_check
  CHECK (delivery_type <> 'guaranteed'
         OR pricing_model IN ('cpm', 'vcpm', 'flat_fee', 'share_of_voice', 'cpp')) NOT VALID;

-- Counts every model bills on, one row per source as before.
ALTER TABLE delivery_daily
  ADD COLUMN views BIGINT NOT NULL DEFAULT 0,             -- under the line item's view definition
  ADD COLUMN billable_actions BIGINT NOT NULL DEFAULT 0,  -- conversions, leads or installs billed
  ADD COLUMN attributed_sales_micros BIGINT NOT NULL DEFAULT 0,  -- cps: the sale basis, summed
  ADD COLUMN rating_points_bp INT;                        -- cpp: GRPs delivered x 100

-- Every invoice line says what it multiplied.
ALTER TABLE invoice_lines
  ADD COLUMN pricing_model TEXT,
  ADD COLUMN billing_event TEXT,
  ADD COLUMN event_definition TEXT;
ALTER TABLE invoice_lines ADD CONSTRAINT invoice_lines_media_model_check
  CHECK (kind <> 'media' OR pricing_model IS NOT NULL) NOT VALID;

CREATE TABLE rate_cards (                -- a seller's list prices, versioned by date
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  seller_org_id     UUID NOT NULL REFERENCES organizations (id),
  name              TEXT NOT NULL,        -- 'US display 2027', 'Holiday video'
  currency          CHAR(3) NOT NULL,
  effective         DATERANGE NOT NULL,   -- delivery dates the card prices
  published_at      TIMESTAMPTZ,
  UNIQUE (seller_org_id, name, effective)
);

CREATE TABLE rate_card_entries (         -- one list price
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  rate_card_id      UUID NOT NULL REFERENCES rate_cards (id),
  ad_unit_id        UUID REFERENCES ad_units (id),   -- null: any unit matching the targeting
  format            TEXT,                 -- as in creatives.format
  targeting         JSONB NOT NULL DEFAULT '{}',     -- audience or geography premiums
  pricing_model     TEXT NOT NULL,        -- as in line_items.pricing_model
  rate_micros       BIGINT CHECK (rate_micros >= 0), -- per unit; per period for flat_fee
  period            TEXT CHECK (period IN ('day', 'week', 'month', 'flight')),  -- flat_fee
  minimum_minor     BIGINT CHECK (minimum_minor >= 0),  -- minimum commitment, invoice currency
  CHECK (pricing_model <> 'flat_fee' OR period IS NOT NULL)
);

ALTER TABLE line_items ADD CONSTRAINT line_items_rate_card_entry_fk
  FOREIGN KEY (rate_card_entry_id) REFERENCES rate_card_entries (id) NOT VALID;
```

The charge for one delivery row under its line item's model is a small, total function, and it rounds once, to the invoice's minor units:

```go tab="Go"
package billing

import "fmt"

// Counts is the billable delivery for one line item, day and source (a delivery_daily row).
type Counts struct {
	Impressions, Viewable, Clicks, Views, Completed, Actions int64
	SalesMicros                                             int64 // cps: summed sale basis
}

// Terms is the pricing on the line item.
type Terms struct {
	Model      string // "cpm", "vcpm", "cpc", "cpv", "cpcv", "cpa", "cpl", "cpi", "cps"
	RateMicros int64  // per unit; per 1,000 for cpm and vcpm
	RateBP     int64  // cps: basis points of the sale
}

// Charge returns the billed quantity and amount in micros. Per-thousand models divide
// once at the end so a 2,500,000-micro CPM on 1,001 impressions is 2,502,500 micros.
func Charge(t Terms, c Counts) (quantity, amountMicros int64, err error) {
	switch t.Model {
	case "cpm":
		return c.Impressions, c.Impressions * t.RateMicros / 1000, nil
	case "vcpm":
		return c.Viewable, c.Viewable * t.RateMicros / 1000, nil
	case "cpc":
		return c.Clicks, c.Clicks * t.RateMicros, nil
	case "cpv":
		return c.Views, c.Views * t.RateMicros, nil
	case "cpcv":
		return c.Completed, c.Completed * t.RateMicros, nil
	case "cpa", "cpl", "cpi":
		return c.Actions, c.Actions * t.RateMicros, nil
	case "cps":
		return c.Actions, c.SalesMicros * t.RateBP / 10_000, nil
	}
	return 0, 0, fmt.Errorf("model %q is billed per period, not per unit", t.Model)
}

// ToMinor converts summed micros to minor units (cents for USD, 2 digits) with
// half-up rounding, once, on the invoice line.
func ToMinor(amountMicros int64, minorDigits int) int64 {
	div := int64(1_000_000)
	for i := 0; i < minorDigits; i++ {
		div /= 10
	}
	return (amountMicros + div/2) / div
}
```

```rust tab="Rust"
/// The billable delivery for one line item, day and source (a delivery_daily row).
pub struct Counts {
    pub impressions: i64,
    pub viewable: i64,
    pub clicks: i64,
    pub views: i64,
    pub completed: i64,
    pub actions: i64,
    pub sales_micros: i64, // cps: summed sale basis
}

/// The pricing on the line item.
pub struct Terms<'a> {
    pub model: &'a str,   // "cpm", "vcpm", "cpc", "cpv", "cpcv", "cpa", "cpl", "cpi", "cps"
    pub rate_micros: i64, // per unit; per 1,000 for cpm and vcpm
    pub rate_bp: i64,     // cps: basis points of the sale
}

/// Returns (quantity, amount in micros); per-thousand models divide once at the end.
pub fn charge(t: &Terms, c: &Counts) -> Result<(i64, i64), String> {
    Ok(match t.model {
        "cpm" => (c.impressions, c.impressions * t.rate_micros / 1000),
        "vcpm" => (c.viewable, c.viewable * t.rate_micros / 1000),
        "cpc" => (c.clicks, c.clicks * t.rate_micros),
        "cpv" => (c.views, c.views * t.rate_micros),
        "cpcv" => (c.completed, c.completed * t.rate_micros),
        "cpa" | "cpl" | "cpi" => (c.actions, c.actions * t.rate_micros),
        "cps" => (c.actions, c.sales_micros * t.rate_bp / 10_000),
        other => return Err(format!("model {other:?} is billed per period, not per unit")),
    })
}

/// Converts summed micros to minor units with half-up rounding, once, on the invoice line.
pub fn to_minor(amount_micros: i64, minor_digits: u32) -> i64 {
    let div = 1_000_000 / 10_i64.pow(minor_digits);
    (amount_micros + div / 2) / div
}
```

A day of 1,001 impressions at a 2,500,000-micro CPM charges 2,502,500 micros, which `ToMinor(…, 2)` turns into 250 cents; summing a month of rows in micros and converting once avoids the cent-per-day drift that rounding each day would add. Flat fees, share of voice and cost per point are deliberately not in the function: they bill per period or against a guarantee, from the line item and its delivery, in Billing & Invoicing.

Design notes:

- **Model, billing event and definition are three fields.** `pricing_model` says how the rate applies, `billing_event` what is counted, `event_definition` which definition, by a versioned name (a platform changing its view threshold, or the MRC updating viewability, is a new name with a date). A `vcpm` line item with no measured definition can't bill.
- **The guarantee follows the model.** The check that only CPM-like and fixed deliverables are guaranteed encodes section VI(c) of the standard terms; an IO that guarantees clicks is a custom contract, recorded as such in the IO's terms version.
- **Every model's count lives on the delivery row.** `views`, `billable_actions`, `attributed_sales_micros` and `rating_points_bp` join the core counts so an invoice line is always a delivery row times a rate, from the controlling source.
- **CPS follows the order.** A cost-per-sale charge is created when an order is attributed and reversed when it's returned; the delivery row's `attributed_sales_micros` is the sum after reversals for the period, and the per-order detail stays with the attribution records (Attribution, in Measurement).
- **Rate cards are dated documents.** `rate_cards.effective` is the delivery period priced, `published_at` when the card was issued; a line item sold from the card points at the entry, so a discount is the difference between the entry's rate and the line item's.
- **Amounts round once.** Micros through the delivery rows, minor units on the invoice line, the conversion in one place with the rule recorded ([Money & Amounts](/docs/money/amounts)).

## Auditing

- **What each line item was priced on.** Model, rate, billing event, definition, proration, share and the rate card entry, as they stood on each delivery day, because a dispute about a view or a completion is a dispute about its definition.
- **What each invoice line multiplied.** The model, event, definition, quantity, rate and the delivery source on every media line.
- **Every correction by event.** Invalid traffic credits, click credits, returned orders reversing CPS fees and conversion restatements, as their own lines with the reason.
- **Every guarantee and make-good.** Which line items were guaranteed under which model, notices of likely under-delivery, and the make-good or credit given.

## What This Means for the System You Build

- **Keep the pricing model, the billing event and the event definition apart,** and keep all three apart from the optimization goal.
- **Compare models in eCPM, but record who carries the risk,** and don't rank demand on eCPM alone.
- **Bill a named count after its window closes,** and record every later correction as its own line.
- **Let the model decide the guarantee:** CPM-like and fixed deliverables can be guaranteed; CPC, CPL and CPA can't under the standard terms.
- **Charge cost per sale on the order** and reverse it on the return.
- **Count delivery under flat fees and share of voice too,** and prorate by a rule stored on the line item.
- **Price direct sales from dated rate cards** and link each line item to the entry it was sold from.

## References

**Specifications**

- [IAB/4A's: Standard Terms and Conditions for Internet Advertising, version 3.0](https://www.iab.com/wp-content/uploads/2015/06/IAB_4As-tsandcs-FINAL.pdf), CPA, CPC, CPL and CPM deliverables, invoicing on actual delivery, flat fee or prorated distribution, the 14, 7 and 30 day cancellation terms, custom material, make-goods and their unavailability for CPA, CPL and CPC deliverables, under-delivery notice and bonus impressions
- [IAB Tech Lab: OpenRTB 2.6 specification](https://raw.githubusercontent.com/InteractiveAdvertisingBureau/openrtb2.x/main/2.6.md), bidfloor as a CPM
- [MRC: Viewable Ad Impression Measurement Guidelines v2.0](https://mediaratingcouncil.org/sites/default/files/Standards/081815%20Viewable%20Ad%20Impression%20Guideline_v2.0_Final.pdf), the display and video viewability thresholds
- [IAB: Revised ad measurement guidelines (2017)](https://www.iab.com/news/mrc-joined-iab-tech-lab-mma-announces-releases-revised-ad-measurement-guidelines-mobile-app-mobile-web-desktop-display/), count-on-begin-to-render

**In practice**

- [Google Ads Help: Bid on viewable impressions using viewable CPM](https://support.google.com/google-ads/answer/3499086?hl=en), paying for viewable impressions, the display and video definitions and the end of Max CPM
- [Google Ads Help: About cost-per-view bidding](https://support.google.com/google-ads/answer/2472735?hl=en), the in-stream, in-feed and Shorts view definitions and the formats not billed as views
- [Google Ads Help: Use pay for conversions in Display campaigns](https://support.google.com/google-ads/answer/7528254?hl=en), billing per conversion at the Target CPA, the 100-conversion and seven-day eligibility rules
- [Google Ads Help: Actual cost-per-click](https://support.google.com/google-ads/answer/6297?hl=en), paying per click and rounding to the billable unit
- [Meta for Developers: Ad set reference](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign/), optimization_goal and the billing_event enum
- [LinkedIn Help: Bidding strategies](https://www.linkedin.com/help/lms/answer/a427513), chargeable events by optimization goal and regular charging of accumulated spend
- [Amazon Ads: Sponsored Brands](https://advertising.amazon.com/solutions/products/sponsored-brands), CPC, vCPM and reserved share of voice with a minimum commitment
- [Apple Ads: How pricing works](https://ads.apple.com/app-store/help/advanced/0003-how-pricing-works), cost per tap and cost per install
- [eBay Developers: Promoted Listings overview](https://developer.ebay.com/api-docs/sell/static/marketing/pl-overview.html), cost-per-sale rates, the total sale amount basis, the 30-day window, and cost-per-click strategies
