+++
title = "Commerce Glossary"
nav_title = "Glossary"
description = "Every term the commerce volume uses, defined in a line and linked to its chapter: the core model, delivery models, menus, dispatch, fees, memberships and fraud."
category = "Commerce Industry"
order = 2299
part = "Reference"
tags = ["commerce", "glossary", "reference"]
+++

Commerce borrows its words from restaurants, grocery, logistics, payments and consumer law, and the same word shifts with context: a fee is a charge to the customer in one chapter and a commission to the merchant in another, a batch is a courier's trip with several orders and a retailer's file of price changes, and "available" means in stock to a store and likely to be found to a model. Entries are grouped by the part of the volume that explains them, alphabetized within each group, and each is one line and a link to the chapter that owns the idea; a word with two meanings appears once per meaning, qualified. The volume's own names for the core records (merchant, location, item, location item, modifier group, customer, order, order line, order charge, fulfillment) are the ones in [The Core Data Model](/books/commerce/commerce-business#the-core-data-model).

## The Business

- **Channel:** where an order came from (a marketplace, the merchant's own site or app, the point of sale, the phone, a kiosk); a property of the order, never of the merchant ([The Commerce Business](/books/commerce/commerce-business#channels)).
- **Channel partner:** the marketplace or service behind a channel, such as DoorDash or Uber Eats, whose order ID is unique per partner ([The Commerce Business](/books/commerce/commerce-business#the-core-data-model)).
- **External reference:** a POS or partner ID stored on an item or order so the same record can be matched across systems and duplicate injections caught ([The Commerce Business](/books/commerce/commerce-business#the-core-data-model)).
- **Fulfillment:** how an order reaches the customer (delivery, pickup, dine-in or shipping) and by which provider, kept separate from the order so providers can change ([The Commerce Business](/books/commerce/commerce-business#the-core-data-model)).
- **Item:** something a merchant sells, defined once with its name, barcode and tax category: a dish, a packaged product, a modifier option or a bundle ([The Commerce Business](/books/commerce/commerce-business#the-core-data-model)).
- **Location:** where an order is made or picked (a store, a kitchen, a virtual brand, a dark store), and where hours, prices, availability, fee caps and tax resolve ([The Commerce Business](/books/commerce/commerce-business#who-s-who)).
- **Location item:** an item as sold at one location, with its in-store price and availability ([The Commerce Business](/books/commerce/commerce-business#the-core-data-model)).
- **Merchant:** the business that sells (a restaurant group, a grocer, a brand, or a franchisee under it), distinct from its locations ([The Commerce Business](/books/commerce/commerce-business#who-s-who)).
- **Modifier group:** a choice attached to an item, such as "choose a cheese", with minimum and maximum selections; its options are items, so they have prices, stock and their own groups ([The Commerce Business](/books/commerce/commerce-business#the-core-data-model)).
- **Order charge:** any non-goods line on an order (a fee, tax, tip, discount or commission) with its payer, payee and the rule that produced it ([The Commerce Business](/books/commerce/commerce-business#how-the-money-splits)).
- **Order line:** an item ordered, with its name and unit price snapshotted as sold and modifiers as child lines ([The Commerce Business](/books/commerce/commerce-business#the-core-data-model)).
- **Virtual brand:** a delivery-only menu cooked in another restaurant's kitchen, modeled as a location of its own merchant at the kitchen's address ([The Commerce Business](/books/commerce/commerce-business#the-core-data-model)).

## On-Demand Delivery

- **86 (to 86 an item):** restaurant slang for marking an item unavailable because it ran out; every platform has a separate, fast endpoint or webhook for it ([Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs#availability)).
- **Acceptance deadline:** the time by which a merchant must accept or cancel an order before it escalates; DoorDash holds integration partners to merchant cancel and order failure rates below 1% ([Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#the-order-lifecycle)).
- **All-in price:** a price that includes every mandatory fee; required for advertised delivery service prices in California and handled by fee disclosure safe harbors in Minnesota and Colorado ([Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law#consumer-fees-and-all-in-prices)).
- **Basic and enhanced service fees:** New York City's categories for non-delivery merchant fees, capped at 5% and 20%, the enhanced fee allowed only if a basic plan is offered ([Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law#city-commission-caps)).
- **Batching:** giving one courier two or more orders on one trip; a trade-off between courier time per order and the later customer's wait, best set as an explicit, versioned weight ([Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#assignment-and-batching)).
- **Benefit application:** the record that a membership offset a fee on an order, kept beside the fee itself so savings and program cost are sums ([Subscriptions & Loyalty](/books/commerce/delivery-subscriptions#the-benefit-order-by-order)).
- **Busy mode:** a merchant setting that adds prep time to incoming orders during a rush; Uber suggests 10 to 20 minutes ([Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#prep-time-and-etas)).
- **Commission:** the merchant's fee to a marketplace, a percentage of the order by plan, such as DoorDash's 15%, 25% or 30% ([Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law#merchant-commission-tiers)).
- **Commission cap:** a city limit on what a delivery platform may charge a restaurant per order, such as New York City's 15% delivery fee cap and Portland's 15% and 4% ([Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law#city-commission-caps)).
- **Core delivery service:** San Francisco's term for delivery without advertising, search placement, consulting or card processing, which must be offered at 15% or less for the cap not to apply ([Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law#city-commission-caps)).
- **Courier imminent:** Uber Direct's flag that the courier is one minute from pickup or dropoff ([Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#the-handoff)).
- **Delivery offer:** an assignment proposed to a contractor courier, with pay, distance and an expiry; declines and timeouts return the delivery to the pool ([Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#assignment-and-batching)).
- **Error charge:** the share of a customer refund passed to the merchant for a kitchen or store error, such as DoorDash's 25% to 100% of the item price plus tax, disputable within a window ([Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud#merchant-error-charges-and-disputes)).
- **ETA (estimated time of delivery):** the arrival time shown to the customer, a sum of predictions for acceptance, prep, courier arrival and travel, recomputed as the order progresses ([Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#prep-time-and-etas)).
- **First-party ordering:** a merchant taking orders on its own site or app, often through a vendor like Olo, with delivery by a logistics network ([The Delivery Landscape](/books/commerce/delivery-landscape#business-models)).
- **Found rate:** the share of ordered grocery items a shopper finds; the signal behind predicted availability ([Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs#grocery-catalogs)).
- **Global matching:** assigning couriers by optimizing over all open orders and couriers together, instead of greedily per order as it arrives ([Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#assignment-and-batching)).
- **GOV and GTV:** order value measures: DoorDash's Marketplace GOV ($102.0 billion in 2025) and Instacart's GTV ($37.2 billion), defined differently, so ratios built on them differ ([The Delivery Landscape](/books/commerce/delivery-landscape#take-rates-and-unit-economics)).
- **Greedy matching:** assigning the best available courier to each order as it arrives, without considering other open orders ([Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#assignment-and-batching)).
- **Inventory file (full, delta, reinventory):** a retailer's catalog upload; in full and delta files a missing row leaves an item unchanged, in a reinventory file it marks the item unavailable ([Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs#grocery-catalogs)).
- **Listing agreement:** the merchant's written consent to be listed, required before listing in California and New York City ([Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs#onboarding-merchants)).
- **Logistics only (white-label delivery):** delivery of orders taken on a merchant's own channels, such as DoorDash Drive and Uber Direct, priced per delivery ([The Delivery Landscape](/books/commerce/delivery-landscape#business-models)).
- **Marketplace:** an app listing many merchants that takes the order, charges the customer and the merchant, and usually delivers with its own couriers ([The Delivery Landscape](/books/commerce/delivery-landscape#business-models)).
- **Markup:** a higher in-app price than in-store, set by the merchant; California bars the platform from charging more than the restaurant's price ([Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs#in-app-prices-and-markups)).
- **Membership:** a monthly or yearly program (DashPass, Uber One, Instacart+, Grubhub+) that waives or reduces fees on eligible orders over a minimum ([Subscriptions & Loyalty](/books/commerce/delivery-subscriptions#how-the-platforms-do-it)).
- **Menu publication:** a record of the menu payload sent to a channel, with its hash and time, answering what a customer saw ([Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs#the-source-of-truth)).
- **Net Revenue Margin:** DoorDash's revenue as a percentage of Marketplace GOV, 13.4% in 2025 ([The Delivery Landscape](/books/commerce/delivery-landscape#take-rates-and-unit-economics)).
- **Override (menu):** a price, quantity or suspension that differs when an item appears in a particular menu, item or modifier group ([Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs#menus-modifiers-and-items)).
- **Owned inventory:** a model where the seller stocks its own micro-fulfillment centers and is the merchant, as Gopuff describes ([The Delivery Landscape](/books/commerce/delivery-landscape#business-models)).
- **Pre-modifier:** a modifier of a modifier ("no", "extra", "on the side"); among the fields Toast's DoorDash integration doesn't sync ([Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs#menus-modifiers-and-items)).
- **Prep time:** the time from acceptance to ready; nobody records it directly, so platforms start from the merchant's default and infer the rest ([Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#prep-time-and-etas)).
- **Promotion abuse:** using many accounts to claim per-person offers; enforced by linking devices, cards, addresses and phones at redemption ([Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud#promotion-abuse)).
- **Refund abuse:** false missing-item or non-delivery reports, alone or through paid refund services; tied with promotion abuse as the top consumer-side fraud in one vendor's 2025 data ([Refunds, Missing Items & Fraud](/books/commerce/refunds-and-delivery-fraud#customer-refund-abuse)).
- **Return delivery:** a second fulfillment that brings an undeliverable order back; Uber Direct gives it its own ID prefixed `ret_` ([Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#the-handoff)).
- **Self-delivery:** a marketplace listing whose orders the merchant's own drivers deliver, at a lower commission ([The Delivery Landscape](/books/commerce/delivery-landscape#business-models)).
- **Shop and deliver:** a shopper picks the order in a retailer's store, handles replacements and pays, then delivers, as on Instacart and Shipt ([Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#shop-and-deliver)).
- **Store pause:** a temporary deactivation of a location on a channel; DoorDash treats every POS-initiated deactivation as temporary, defaulting to 14 days ([Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs#availability)).
- **Substitution:** a replacement for an item the shopper couldn't find, chosen by preference or approval and recorded as a link from the original line ([Merchants, Menus & Catalogs](/books/commerce/merchants-menus-and-catalogs#substitutions)).
- **Tip:** the customer's payment to the courier; paid in full as its own line and never used to offset guaranteed pay ([Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law#tips)).
- **Transaction fee:** New York City's capped charge to restaurants for processing, 3% unless it equals the processor's charge to the platform ([Fees, Commissions & the Law](/books/commerce/delivery-fees-and-the-law#city-commission-caps)).
- **Trial conversion:** a free membership period that becomes paid unless cancelled, the point state notice rules target ([Subscriptions & Loyalty](/books/commerce/delivery-subscriptions#cancellation-law)).
- **Unassignment:** a courier dropping a delivery before pickup, which returns it to waiting; DoorDash's `created` state can recur ([Orders, Dispatch & Batching](/books/commerce/orders-dispatch-and-batching#the-order-lifecycle)).

## References

**Reference**

- [DoorDash: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1792789/000179278926000013/dash-20251231.htm), Marketplace GOV, Net Revenue Margin and Drive
- [Uber Eats Developer: Upsert menu](https://developer.uber.com/docs/eats/references/api/v2/put-eats-stores-storeid-menu), the menu, category, item, modifier group and override terms
- [Instacart Docs: Minimum catalog requirements](https://docs.instacart.com/catalog/catalog_inventory_file/specifications/minimum-catalog-requirements), inventory file types and availability
- [NYC Department of Consumer and Worker Protection: Restaurants using delivery apps](https://www.nyc.gov/site/dca/businesses/Restaurants-Using-Delivery-Apps.page), the fee categories and caps
