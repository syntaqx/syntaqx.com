+++
title = "B2B Commerce"
description = "Selling to businesses: company accounts and buyer roles, net terms and credit, quotes, punchout over cXML and OCI, contract catalogs, approvals and platforms."
category = "Commerce Industry"
order = 2337
part = "Wholesale and B2B"
tags = ["commerce", "b2b", "punchout", "net-terms", "quotes", "data-model"]
+++

Business-to-business commerce is selling to companies that buy for their own use: a distributor selling fasteners to contractors, a manufacturer selling supplies to dental offices, a brand selling displays to salons, an office supplier selling to a university. The buyer is not a person with a card but an organization with locations, several people allowed to order, a negotiated price list, a budget, an approval chain and an accounts payable department that pays invoices on terms. Some of those buyers shop a website; others never leave their own procurement system and expect the seller's catalog to appear inside it.

That changes almost every assumption a consumer storefront makes. Price depends on who is logged in. Checkout may end in a purchase order and an invoice, not a payment. An order may need a manager's approval before it exists. A quote negotiated by a sales rep may be the real starting point, and the website just the place to accept it. This chapter covers company accounts and buyer roles, net terms and credit, quotes, contract catalogs and price lists, approval flows, punchout to procurement systems, and the B2B features of the main platforms. It extends `companies`, `company_contacts` and `price_lists` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). Selling to retailers who resell is [Wholesale & Retail Distribution](/books/commerce/wholesale-and-retail-distribution); invoices and B2B receivables are the Payments volume's [B2B Receivables](/books/payments/checkout-and-invoicing#b2b-receivables); commercial service contracts are Field Operations' [Commercial Contracts and SLAs](/books/field-operations/service-agreements#commercial-contracts-and-slas).

## How the Platforms Do It

As of October 2026, from each platform's documentation:

| Platform | Company model | Pricing and catalogs | Payment | Quotes and approvals |
| --- | --- | --- | --- | --- |
| **Shopify B2B** | Companies with company locations and contacts; on Basic, Grow, Advanced and Plus plans | B2B catalogs (3 active below Plus, unlimited on Plus), volume pricing, quantity rules | Net 7, 15, 30, 45, 60 or 90 days, due on fulfillment, or a fixed date; vaulted cards charged from the admin; deposits and partial payments on Plus | Draft orders sent as invoices; checkout to draft for review |
| **BigCommerce B2B Edition** | Company accounts with a hierarchy and buyer roles; sales rep masquerade | Price lists per company group, shared shopping lists | An invoice portal for paying open invoices | Quotes, shopping list approvals |
| **Adobe Commerce B2B** | Company accounts with divisions, teams and roles | Shared catalogs with custom prices | Company credit, "Pay on Account" | Negotiable quotes, requisition lists, purchase orders with approval rules, quick order by SKU |
| **Salesforce B2B Commerce** | Accounts as buyers, grouped into buyer groups | Entitlement policies linking buyer groups to products (view product, view price) and price books | Through the order and billing stack | Through the platform's workflow |

Three patterns:

- **The company is a tree.** Every platform models the buyer as a company with locations (Shopify), divisions (Adobe) or a hierarchy (BigCommerce), and people with roles inside it. Orders, addresses, terms and approvals hang off a location or a division, not the person.
- **Catalogs are entitlements.** Shopify's catalogs, Adobe's shared catalogs and Salesforce's entitlement policies all answer two questions per company: which products can it see, and at what price. B2B pricing is a lookup by buyer, not a column on the product.
- **Payment defaults to later.** Net terms are a first-class payment method; cards are vaulted and charged when the seller decides; checkout can end in a draft for the seller to review. The order and the money separate further than in consumer commerce.

## Company Accounts and Buyer Roles

A B2B customer has three layers:

- **The company,** the legal buyer: its name, tax status (resale or exempt, with certificates per [Exemption Certificates](/books/commerce/sales-tax-vat-and-duties#exemption-certificates)), its credit, its terms, its account number in the seller's ERP.
- **Its locations,** where goods ship and, often, who is billed: a contractor's three branches, a hospital system's clinics, each with its own ship-to, sometimes its own catalog, terms or tax treatment. Shopify attaches payment terms and catalogs at the company location.
- **Its contacts,** the people who log in, each with a role at one or more locations: a buyer who can build carts and place orders up to a limit, an approver who approves others' orders, an administrator who manages users and addresses, a viewer who sees order history and invoices.

The rules that make this work:

- **Permissions are role per location.** A regional manager approves for three branches; a site buyer orders for one. `company_contacts` gains a location and a role; the effective permission is a function of both ([Authorization](/docs/security/authorization)).
- **A person can belong to several companies.** A bookkeeper who buys for two clients, a consultant, a franchisee with two entities. The customer record stays one person; their company memberships are separate, and every cart says which company and location it buys for.
- **Sales reps act on behalf.** BigCommerce's masquerade lets a rep see the storefront as a buyer and place orders for them. Every such action records both the rep and the buyer, because commission, approvals and audits need to know who did it; commission plans and their clawbacks are Field Operations' [Commission Plans as Data](/books/field-operations/sales-teams-and-commissions#commission-plans-as-data).
- **Onboarding is an application.** A new business buyer applies, the seller checks the business (and its credit, if terms are wanted), approves it and assigns a catalog, terms and a rep. Until then the buyer sees retail prices or nothing.

## Net Terms and Credit

Most B2B orders aren't paid at checkout. The buyer receives goods and an invoice and pays later on terms:

- **Net terms.** Payment due a number of days after the invoice or order date: Shopify's options are net 7, 15, 30, 45, 60 and 90 days from the order date, due on fulfillment, or a fixed date.
- **Early payment discounts.** "2/10 net 30" means 2% off if paid within 10 days, otherwise the full amount by day 30. Giving up the discount to keep the money 20 more days costs the buyer about 37% a year, which is why disciplined buyers take it and why a seller offering it should expect to pay it.
- **Credit limits.** The most a company may owe at once. An order that would push open receivables past the limit is held for review, not rejected, because the buyer is often good for it and the hold is a conversation.
- **Credit checks.** A business credit report informs the limit; Dun & Bradstreet's PAYDEX, "a dollar-weighted indicator intended to reflect a business's past payment performance," scores from 1 to 100, with higher scores for paying earlier.
- **Outsourced terms.** Providers such as Resolve, Balance and TreviPay underwrite the buyer, pay the seller early and collect from the buyer on terms, for a fee. Resolve publishes no fixed rate: its advance fees are "risk-based" and its advance rates "Typically 90%, 75%, 50%." The seller trades margin for cash flow and credit risk off its books.

Terms move the risk from fraud to collection. The system needs an open receivables balance per company, aging buckets, and holds that stop new orders (or new shipments) when a company is past due or over its limit. The invoice, payment application and dunning mechanics are the Payments volume's [The Invoice Lifecycle](/books/payments/checkout-and-invoicing#the-invoice-lifecycle) and [Applying Money to Invoices](/books/payments/checkout-and-invoicing#applying-money-to-invoices); a purchase order number from the buyer goes on every invoice, because the buyer's accounts payable team matches against it, the same three-way match the seller runs on its own purchases ([Purchase Orders](/books/commerce/purchasing-and-replenishment#purchase-orders)).

## Quotes

Large or unusual orders start with a quote: a buyer asks for a price on 500 units, a rep proposes a discount, the buyer counters, the quote is accepted and becomes an order. Adobe Commerce calls these negotiable quotes; Shopify's version is a draft order sent as an invoice; BigCommerce's B2B Edition has quotes the buyer can request from the storefront.

A quote is a document with its own life:

- **Lines with proposed prices,** each possibly below the buyer's catalog price, with the rep's discount and any approval it needed (a margin floor, a manager's sign-off over a threshold).
- **Validity.** An expiry date after which prices are re-quoted, because costs and stock move.
- **Versions.** Each counter is a new version; the accepted version is the one that becomes the order, and earlier versions stay for the record.
- **Conversion.** Accepting a quote creates a cart or an order at the quoted prices, and the order lines reference the quote lines, so a later dispute over price points at what was agreed.
- **Taxes and shipping are estimates** until the order, and the quote says so.

## Contract Catalogs and Price Lists

A company's price is usually one of: a list price less a percentage for its customer group, a contract price list negotiated item by item, volume breaks by quantity, or a quoted price. The core `price_lists` (with `kind` `wholesale` or `contract`) and `price_list_items` (with `min_quantity` breaks) hold them; `companies.price_list_id` points at a company's own list. B2B adds:

- **Visibility as well as price.** A contract catalog can restrict what a company sees to the items in its contract. Salesforce's entitlement policies separate the two (`CanViewProduct`, `CanViewPrice`), and so should the model: an assignment says which catalog applies to which company or location, and the catalog says which items and prices.
- **Resolution order.** When several lists apply (a contract list, a group discount, a promotion, a quote), the order of precedence is a rule, written down: usually quote, then contract price, then the best of group and volume pricing, then list. The price shown, the price in the cart and the price on the invoice come from the same resolver.
- **Quantity rules.** Minimums, maximums and increments (sold in cases of 12), which Shopify calls quantity rules. A cart line that breaks them is fixed in the cart, not rejected at the warehouse.
- **Contract terms end.** A contract price list has a validity range; when it ends, prices revert or a renewal applies, and orders placed after the end are priced from the next list, not the expired one.

[Pricing & Price Lists](/books/commerce/pricing#price-lists-price-books-and-b2b-prices) owns price list assignment, precedence, derived lists and confidential B2B prices across channels; this chapter uses its `price_list_assignments` with `scope` set to `company` or `company_location`. Contract prices that differ between competing resellers also need a reason on file under the Robinson-Patman Act ([Business buyers: Robinson-Patman](/books/commerce/pricing#business-buyers-robinson-patman)).

## Approval Flows

Many B2B buyers require approval before an order is placed. Adobe Commerce turns an order into a purchase order that routes through approval rules; BigCommerce lets a buyer submit a shopping list for approval. The rule shapes:

- **By amount.** Orders over $5,000 need a manager; over $25,000 a director.
- **By category or item.** Capital equipment or restricted items always need approval.
- **By budget.** Orders that would exceed a location's monthly budget need approval.
- **By role.** Some buyers can only submit; approvers can place.

The order doesn't exist until approved: the approval request holds a cart snapshot with its prices, the approver approves or rejects (with a comment), and approval converts it to an order at the snapshot prices, re-priced only if the snapshot expired. Approval rules are data per company ([Rules as Data](/docs/architecture/rules-as-data)), and each decision is recorded with the approver and the rule that required it.

## Punchout

Large buyers purchase through e-procurement systems (SAP Ariba, Coupa, Oracle, Jaggaer) and don't want their employees on supplier websites. **Punchout** lets the employee leave the procurement system, shop the supplier's site with the buyer's catalog and prices, and bring the cart back as a requisition the procurement system approves and turns into a purchase order.

**cXML** (current version 1.2.071, updated August 2026) defines the round trip:

1. **PunchOutSetupRequest.** The procurement system posts a request with the buyer's credentials, an operation (`create`, `edit` or `inspect`; Coupa supports create and inspect), a `BuyerCookie` identifying the session, and a `BrowserFormPost` URL to return to.
2. **PunchOutSetupResponse.** The supplier answers with a start URL for a session logged in as that buyer.
3. **Shopping.** The employee shops the supplier's site, seeing the buyer's catalog and contract prices.
4. **PunchOutOrderMessage.** On "checkout," the supplier posts the cart back to the `BrowserFormPost` URL, keyed by the `BuyerCookie`. No order exists yet.
5. **Approval in the procurement system.** The requisition routes through the buyer's own approvals.
6. **OrderRequest.** The approved purchase order arrives at the supplier as a cXML OrderRequest (or an EDI 850), and that is the order.

**SAP OCI** (Open Catalog Interface) does the same with HTML form fields: the procurement system sends a `HOOK_URL` to return to, and the supplier posts the cart back as `NEW_ITEM-DESCRIPTION[n]`, `NEW_ITEM-QUANTITY[n]`, `NEW_ITEM-PRICE[n]`, `NEW_ITEM-UNIT[n]` and similar fields per line. The purchase order still comes separately.

**Static catalogs** avoid punchout entirely: the supplier uploads its catalog and contract prices into the procurement system (Ariba's Catalog Interchange Format is a structured file of items), and employees shop inside the procurement system. SAP describes punchout levels: level 1 sends the employee to the supplier's site to browse, level 2 lets them search the supplier's items inside Ariba and then punch out to the item. Static catalogs are simpler and slower to update; punchout always shows live prices and stock.

The system rules:

- **The punchout cart is not an order.** It is a `punchout_sessions` row with the cart returned; the order arrives later, may differ (lines removed in approval, quantities changed), and must be matched to the session by the buyer's PO and the cart's references.
- **Prices must hold.** The price returned in the cart is the price the buyer's approver sees; an order arriving days later at that price is honored if the session's price validity says so.
- **Credentials are per buyer organization,** shared secrets in the setup request, rotated and stored like any API credential ([API Authentication](/docs/api-design/authentication)).

## How to Build It

`companies`, `company_contacts` and `price_lists` from the core model hold the buyer and its contract prices. Pricing's `price_list_assignments` assigns contract catalogs to companies and locations. This chapter adds locations, roles per location, terms, credit, catalog visibility, quotes, approvals and punchout:

```sql
CREATE TABLE company_locations (         -- a branch, clinic or site that orders and receives
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id      UUID NOT NULL REFERENCES companies (id),
  name            TEXT NOT NULL,
  ship_to         JSONB NOT NULL,
  bill_to         JSONB,                 -- null: the company's
  exemption_certificate_id UUID REFERENCES exemption_certificates (id),  -- resale or exempt
  payment_terms_id UUID,                 -- payment_terms, below; null: the company's
  external_ref    TEXT,                  -- the ERP's ship-to number
  status          TEXT NOT NULL CHECK (status IN ('active', 'on_hold', 'closed'))
);

ALTER TABLE company_contacts             -- one row per contact, role and location
  DROP CONSTRAINT company_contacts_pkey,
  ADD COLUMN id            UUID PRIMARY KEY DEFAULT uuidv7(),
  ADD COLUMN location_id   UUID REFERENCES company_locations (id),  -- null: all locations
  ADD COLUMN order_limit   BIGINT;                                  -- per order, minor units
CREATE UNIQUE INDEX company_contacts_role_key
  ON company_contacts (company_id, customer_id, role, COALESCE(location_id, '00000000-0000-0000-0000-000000000000'));

CREATE TABLE payment_terms (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id     UUID NOT NULL REFERENCES merchants (id),
  code            TEXT NOT NULL,         -- 'net_30', '2_10_net_30', 'due_on_fulfillment'
  due_basis       TEXT NOT NULL CHECK (due_basis IN ('order_date', 'invoice_date',
                    'fulfillment', 'fixed_date')),
  due_days        SMALLINT,
  discount_bps    INT,                   -- 200 for 2%
  discount_days   SMALLINT,              -- 10
  UNIQUE (merchant_id, code)
);

CREATE TABLE credit_limits (             -- versioned: a new row per change
  company_id      UUID NOT NULL REFERENCES companies (id),
  limit_amount    BIGINT NOT NULL CHECK (limit_amount >= 0),
  currency        CHAR(3) NOT NULL,
  source          TEXT NOT NULL CHECK (source IN ('internal', 'bureau', 'terms_provider')),
  provider_ref    TEXT,                  -- a terms provider's approval
  approved_by     TEXT NOT NULL,
  valid_during    TSTZRANGE NOT NULL,
  PRIMARY KEY (company_id, valid_during)
);

ALTER TABLE price_list_assignments      -- Pricing's table; a contract catalog can also restrict what is seen
  ADD COLUMN restrict_visibility BOOLEAN NOT NULL DEFAULT FALSE;  -- only listed items are visible

CREATE TABLE quotes (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id      UUID NOT NULL REFERENCES companies (id),
  location_id     UUID REFERENCES company_locations (id),
  requested_by    UUID REFERENCES customers (id),
  rep             TEXT,                  -- the sales rep, typed actor
  number          TEXT NOT NULL,
  version         SMALLINT NOT NULL DEFAULT 1,
  status          TEXT NOT NULL CHECK (status IN ('draft', 'requested', 'proposed',
                    'countered', 'accepted', 'expired', 'declined', 'converted')),
  currency        CHAR(3) NOT NULL,
  valid_until     TIMESTAMPTZ NOT NULL,
  order_id        UUID REFERENCES orders (id),  -- once converted
  UNIQUE (company_id, number, version)
);

CREATE TABLE quote_lines (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  quote_id        UUID NOT NULL REFERENCES quotes (id),
  item_id         UUID NOT NULL REFERENCES items (id),
  quantity        NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
  list_price      BIGINT NOT NULL,       -- the buyer's catalog price at quoting
  quoted_price    BIGINT NOT NULL,
  approval_ref    TEXT                   -- who approved a price under the margin floor
);

CREATE TABLE approval_rules (            -- per company: what needs approval, by whom
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id      UUID NOT NULL REFERENCES companies (id),
  location_id     UUID REFERENCES company_locations (id),
  condition       JSONB NOT NULL,        -- {"order_total_over": 500000} or {"category": "capital"}
  approver_role   TEXT NOT NULL CHECK (approver_role IN ('approver', 'admin')),
  sequence        SMALLINT NOT NULL DEFAULT 1,  -- multi-level chains
  valid_during    TSTZRANGE NOT NULL
);

CREATE TABLE approval_requests (         -- a cart waiting for approval
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  cart_id         UUID NOT NULL REFERENCES carts (id),
  rule_id         UUID NOT NULL REFERENCES approval_rules (id),
  snapshot        JSONB NOT NULL,        -- lines and prices as submitted
  priced_until    TIMESTAMPTZ NOT NULL,
  decision        TEXT CHECK (decision IN ('approved', 'rejected')),
  decided_by      UUID REFERENCES customers (id),
  comment         TEXT,
  decided_at      TIMESTAMPTZ,
  order_id        UUID REFERENCES orders (id)
);

CREATE TABLE punchout_sessions (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id      UUID NOT NULL REFERENCES companies (id),
  protocol        TEXT NOT NULL CHECK (protocol IN ('cxml', 'oci')),
  operation       TEXT NOT NULL CHECK (operation IN ('create', 'edit', 'inspect')),
  buyer_cookie    TEXT NOT NULL,         -- cXML BuyerCookie; OCI session reference
  return_url      TEXT NOT NULL,         -- BrowserFormPost or HOOK_URL
  user_ref        TEXT,                  -- the procurement user, as sent
  cart_id         UUID REFERENCES carts (id),
  cart_returned_at TIMESTAMPTZ,
  price_valid_until TIMESTAMPTZ,
  order_id        UUID REFERENCES orders (id),  -- matched when the OrderRequest or 850 arrives
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (company_id, buyer_cookie)
);

ALTER TABLE orders
  ADD COLUMN company_location_id UUID REFERENCES company_locations (id),
  ADD COLUMN buyer_po_number     TEXT,
  ADD COLUMN payment_terms_id    UUID REFERENCES payment_terms (id),
  ADD COLUMN quote_id            UUID REFERENCES quotes (id),
  ADD COLUMN placed_by_rep       TEXT;   -- set when a rep placed it on the buyer's behalf
```

The credit check at order placement:

```sql
-- Open receivables plus this order against the limit in force:
SELECT cl.limit_amount
       - COALESCE(SUM(inv.amount_due), 0)
       - $2 AS headroom
FROM credit_limits cl
LEFT JOIN open_invoices inv ON inv.company_id = cl.company_id  -- a view over the Payments model
WHERE cl.company_id = $1
  AND cl.valid_during @> NOW()
GROUP BY cl.limit_amount;
```

A negative headroom puts the order on a credit hold ([Holds](/books/commerce/order-management#holds)) for the credit team, rather than rejecting it.

Design notes:

- **The location is the unit.** Terms, catalog, ship-to, tax status and approvals resolve at the company location, falling back to the company.
- **One price resolver.** Catalog, contract, volume, quote and promotion precedence is computed by one function at a stated instant and stored on the line with the source that won.
- **Quotes and approvals are snapshots.** Both store the lines and prices as proposed, with a validity, and convert into orders at those prices.
- **Punchout carts and orders are matched, not assumed.** The OrderRequest carries the buyer's PO; the session holds the cart; the order records both.
- **Events:** `company.approved`, `quote.proposed`, `quote.accepted`, `approval.requested`, `approval.decided`, `punchout.cart_returned`, `order.credit_hold` and `order.placed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the ERP, the rep's CRM and accounts receivable.

## Auditing

- **Who can buy what.** Each company's contacts, roles, locations and limits over time.
- **Every price's source.** For each order line, the catalog, contract, quote or rule that set its price, with versions.
- **Every quote version and approval,** with the rep, the margin approvals and the buyer's acceptance.
- **Every credit decision.** Limits, holds and releases, with who approved them.
- **Every punchout session,** with the cart returned and the order that matched it.
- **Actions taken on behalf.** Every order or change a rep made for a buyer, with both identities.

## What This Means for the System You Build

- **Model the buyer as company, locations and contacts with roles per location,** and resolve terms, catalogs and approvals at the location.
- **Treat catalogs as entitlements:** which items a company sees and at what price, assigned with precedence and validity.
- **Make net terms a payment method** with credit limits checked at order time and holds, not rejections, when over.
- **Keep quotes as versioned documents** that convert to orders at quoted prices, with expiry.
- **Hold carts for approval as snapshots** under per-company rules, and record each decision.
- **Support punchout over cXML and OCI,** and match the later purchase order to the session instead of treating the returned cart as an order.
- **Put the buyer's PO number on every order and invoice,** because their accounts payable matches on it.
- **Record reps' actions on behalf of buyers** with both identities, for approvals, commissions and audit.

## References

**Platform documentation**

- [Shopify Help Center: B2B](https://help.shopify.com/en/manual/b2b), the plans B2B is available on
- [Shopify Help Center: B2B plan features](https://help.shopify.com/en/manual/b2b/getting-started/plan-features), companies, locations, catalogs by plan, quantity rules, volume pricing, vaulted cards, draft orders, deposits
- [Shopify Help Center: Payment terms](https://help.shopify.com/en/manual/b2b/payment-terms), net terms options, due on fulfillment and fixed dates
- [BigCommerce: Intro to the B2B buyer portal](https://docs.bigcommerce.com/developer/learn/courses/b2b-buyer-portal/overview/intro-to-the-buyer-portal), company accounts, roles, quotes, shopping lists and the invoice portal
- [BigCommerce: B2B Edition buyer functions](https://support.bigcommerce.com/articles/en_US/Knowledge/B2B-Edition-Buyer-Functions), buyer roles, masquerade and approvals
- [Adobe Experience League: Adobe Commerce B2B introduction](https://experienceleague.adobe.com/en/docs/commerce-admin/b2b/introduction), company accounts, shared catalogs, company credit, negotiable quotes, requisition lists, purchase order approvals, quick order
- [Salesforce: B2B and D2C Commerce data model](https://developer.salesforce.com/docs/atlas.en-us.242.0.b2b_b2c_comm_dev.meta/b2b_b2c_comm_dev/b2b_b2c_dev_data_model.htm), buyer groups, entitlement policies, view-product and view-price permissions

**Punchout and procurement**

- [cXML.org](https://cxml.org/), the current cXML version
- [Coupa: Punchout catalogs](https://docs.coupa.com/en/supplier-documentation/coupa-for-suppliers/the-coupa-supplier-portal-or-csp/features-and-processes-in-the-coupa-supplier-portal/catalogs/punchout-catalogs), the supported operations
- [Optimizely: PunchOut setup request and response](https://docs.developers.optimizely.com/configured-commerce/v1.5.45-b2b-sdk/docs/punchout-setup-request-and-response), the setup request, BuyerCookie, BrowserFormPost and the order message
- [Unite: OCI technical information (version 1.9)](https://unite.eu/assets/support/it/technical-information-oci-version-1_9_en.pdf), the HOOK_URL and NEW_ITEM fields
- [PunchOut Commerce: Catalog Interchange Format](https://punchoutcommerce.com/guides/catalogs/catalog-interchange-format-cif/), Ariba's CIF static catalog file
- [SAP Learning: Working with punchout catalogs](https://learning.sap.com/courses/loading-catalogs/working-with-punchout-catalogs_e7638548-6f70-4ffb-b4af-7b5e2171f867), level 1 and level 2 punchout

**Terms and credit**

- [Resolve: Pricing](https://resolvepay.com/pricing), risk-based advance fees and advance rates
- [Business Wire: TreviPay to acquire Apruve (December 8, 2022)](https://www.businesswire.com/news/home/20221208005906/en/), consolidation among B2B terms providers
- [Dun & Bradstreet: What is a PAYDEX score](https://www.dnb.com/en-us/smb/resources/credit-scores/what-is-paydex-score.html), the dollar-weighted payment indicator and its 1 to 100 range
- [Stampli: Early payment discounts](https://www.stampli.com/resources/early-payment-discounts/), 2/10 net 30 and its implied annual cost
