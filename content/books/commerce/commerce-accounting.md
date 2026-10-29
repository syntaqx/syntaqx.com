+++
title = "Commerce Accounting"
description = "ASC 606 for goods, the shipping election, returns reserves, gift card and loyalty liabilities, COGS and landed cost, payout reconciliation, sales tax and close."
category = "Commerce Industry"
order = 2358
part = "Running the Platform"
tags = ["commerce", "accounting", "asc-606", "inventory-valuation", "reconciliation"]
+++

A store's books are made of the same few events the rest of this volume records: an order placed, a payment authorized and captured, a box shipped and delivered, a return received, a gift card sold and redeemed, a pallet received with its freight bill, a payout landing in the bank. Accounting turns those events into revenue, cost of goods sold, liabilities and cash, at the moment each standard says they happened. Most of the difficulty is timing and grain: the card is charged before the goods ship, the revenue is earned when control passes, the returns reserve is an estimate of refunds not yet asked for, the freight bill arrives after the goods were sold, and the payout nets a week of sales, refunds, fees and chargebacks into one deposit.

This chapter covers revenue recognition for goods under ASC 606, the shipping and handling election, sales tax as a liability, discounts, returns reserves, gift card, loyalty, membership and prepaid subscription liabilities (each owned by its own chapter), cost of goods sold and inventory valuation under FIFO and weighted average, landed cost capitalization, marketplace and processor payout reconciliation, and the period close. The general model is the playbook's [Accounting](/docs/payments/accounting) (facts versus policy, the five steps, breakage, recognition schedules, syncing and close); the Payments volume owns the ledger and matching engine of a payment provider ([Ledger & Reconciliation](/books/payments/ledger-and-reconciliation)). The ERP that holds the general ledger is [ERP & Integrations](/books/commerce/erp-and-integrations). It extends `order_charges`, `order_payments` and `inventory_items` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and adds `journal_entries`, `journal_lines`, `inventory_cost_layers`, `cost_layer_draws`, `deferred_revenue_schedules` and `payout_reconciliations`. Nothing here is accounting advice; the policies are finance's, and the system's job is to keep the facts they run on.

## How the Platforms Do It

What the systems a store runs on give finance, as of October 2026, from their documentation:

| System | What it reports | Grain | What finance still has to do |
| --- | --- | --- | --- |
| **Stripe** | The payout reconciliation report: each automatic payout with "every payment, refund, dispute, fee, and other balance transaction included in the payout," grouped by reporting category, with gross, fee and net | One row per balance transaction, tied to a payout ID | Match balance transactions to orders (by metadata or the PaymentIntent) and reconcile instant payouts itself, since Stripe "can't identify which transactions are included" in them |
| **Shopify Payments** | An activity report with "a breakdown of your Shopify Payments transactions, fees, and payouts for a selected date range and currency," and per-payout detail | Per transaction and payout | Tie payouts to orders and to the bank; book fees, refunds and chargebacks that land in later payouts |
| **Amazon, other marketplaces** | Settlement reports, one line per transaction and amount type ([Selling on Amazon](/books/commerce/selling-on-amazon#how-to-build-it)) | Per order, fee and account-level line | Book gross revenue and fees from the lines, and clear the marketplace receivable against the deposit |
| **NetSuite** | Sales orders, item fulfillments, cash sales, invoices and customer deposits, each posting to the ledger | Per record | Decide the posting grain and keep the commerce system's IDs on each record ([Summary or Detail](/books/commerce/erp-and-integrations#summary-or-detail)) |
| **Business Central's Shopify Connector** | Sales orders or invoices from Shopify orders; credit memos or return orders from returns | Per order | The same, plus payouts, which arrive outside the order sync |

The pattern: the payment and marketplace systems report money at the grain of their own balance transactions, the ERP books at the grain of its documents, and nothing on the list books revenue at the moment control passes, applies the shipping election, estimates returns or computes cost of goods sold from landed cost layers. Those are the commerce system's facts to supply and finance's policies to apply.

## Revenue for Goods

ASC 606's five steps ([ASC 606 and IFRS 15 in Five Steps](/docs/payments/accounting#asc-606-and-ifrs-15-in-five-steps)) applied to a store order:

1. **The contract** is the order: the customer's acceptance at checkout of the items, prices and terms (the return policy version, the shipping promise) the order records.
2. **The performance obligations** are the goods, usually one obligation per line or one for the order delivered together, plus anything distinct the store promised: an extended warranty sold separately, a service, loyalty points that give a material right, a gift card (which is not a sale of goods at all).
3. **The transaction price** is what the store expects to be entitled to: line prices less discounts, plus shipping charged, less expected returns, and excluding sales tax collected for the state when the store makes that election.
4. **The allocation** splits the price by standalone selling price where there is more than one obligation (a bundle with a warranty, an order earning points).
5. **Recognition** happens when the customer obtains control of the goods. For a parcel order that is shipment or delivery, depending on terms and who bears the risk in transit; for a store sale, the counter; for a wholesale PO, the delivery terms (FOB origin or destination) on the purchase order.

Three questions decide most commerce revenue policies:

- **When does control pass?** Many US stores recognize at shipment, because the carrier has the goods and the store's terms put title and risk on the customer then; others recognize at delivery. The system keeps both dates (`shipments.shipped_at` and `delivered_at`) so the policy can be applied and changed, and a quarter-end cutoff can be tested against either.
- **Principal or agent?** A seller that controls the goods before they transfer is the principal and books gross revenue with fees as costs; an intermediary is an agent and books its fee. Amazon states both sides in one filing: product sales from its own inventory at gross, and third-party seller services as its "net share" of what those sellers sold ([How the Money Splits](/books/commerce/commerce-business#how-the-money-splits)). A marketplace seller is the principal on its own sales and books the referral and fulfillment fees as expenses; an operator of its own marketplace books commission revenue ([Running Your Own Marketplace](/books/commerce/running-a-marketplace)); a brand selling through a merchant-of-record service abroad sells to the provider, not the shopper ([The Merchant of Record](/books/commerce/cross-border-commerce#the-merchant-of-record)).
- **Is the cash earned?** Money captured at checkout for goods not yet shipped is a contract liability (NetSuite records it as a customer deposit, "a liability until you deliver the goods"), not revenue. Prepaid subscription boxes are the same at scale ([Subscription Commerce](/books/commerce/subscription-commerce)).

My rule is the playbook's: the commerce system keeps the facts at the finest grain (each line as sold, each charge with payer and payee, each shipment and delivery time, each return) and the policy that turns them into revenue runs over them as versioned code, so a change of policy recomputes rather than rewrites ([The Product Keeps Facts, Finance Picks Policy](/docs/payments/accounting#the-product-keeps-facts-finance-picks-policy)).

## Shipping and Handling

ASC 606 gives US preparers an election for shipping: shipping and handling that happens after the customer has obtained control of the goods may be treated as a cost of fulfilling the promise to transfer the goods rather than as a separate service. PwC's guide puts the consequences plainly: an entity that elects it includes any shipping fee in the transaction price and recognizes revenue "when control of the good transfers," and the related costs are generally presented "within costs of revenue." If control transfers only on delivery, shipping before then "is not a promised service to the customer" in any case. IFRS 15 has no equivalent election, so an IFRS reporter decides whether post-control shipping is a separate obligation.

For the system:

- **Shipping charged is a charge line** (`order_charges.kind = 'shipping_fee'`, payer customer, payee merchant) and part of the transaction price; whether it posts to product revenue or a shipping revenue account is a mapping, not a different record.
- **Shipping paid is a cost on the shipment.** The label cost and any carrier adjustment are on `shipments` ([Shipping & Carriers](/books/commerce/shipping-and-carriers#how-to-build-it)), and a 3PL's fulfillment fee is a charge paid by the merchant; under the election both accrue when the revenue they relate to is recognized, which for a carrier invoice that arrives weeks later means an accrual from the label cost at purchase, trued up by the invoice.
- **Free shipping is a price, not a cost.** A free-shipping promotion reduces the shipping charge to zero or allocates a discount to it ([Allocating Discounts to Lines](/books/commerce/promotions-and-gift-cards#allocating-discounts-to-lines)); the label still costs what it cost.

## Sales Tax Is Not Revenue

Sales tax a store collects belongs to the state. Under ASC 606-10-32-2A an entity may elect to exclude from the transaction price all taxes "imposed on and concurrent with a specific revenue-producing transaction and collected by the entity from a customer" (sales, use, value added and some excise taxes), but not taxes "assessed on an entity's total gross receipts or imposed during the inventory procurement process." Most stores make the election, so collected tax goes straight to a sales tax payable account by jurisdiction and never touches revenue.

The commerce twists are about whose liability it is:

- **Marketplace-collected tax is not the seller's.** Where a marketplace facilitator collects and remits, the tax is the marketplace's liability; the seller's books show the sale and nothing payable ([Marketplace Facilitator Laws](/books/commerce/sales-tax-vat-and-duties#marketplace-facilitator-laws)). The `remitter` column on each tax charge is what keeps those amounts off the merchant's return.
- **Refunds reverse the tax they charged.** A refunded line's tax comes back out of the payable account at the rate and base stored on the charge, not at today's rate.
- **The payable reconciles to the returns filed.** The sum of tax charges by jurisdiction and period, net of refunds and of amounts other parties remit, is what the return should show; a tax engine's filing is checked against it, not trusted alone ([Tax Engines and Filing](/books/commerce/sales-tax-vat-and-duties#tax-engines-and-filing)). Gross receipts taxes and taxes paid on purchases sit outside the election and are the merchant's own expense.

## Discounts and Promotions

A discount reduces the transaction price; it is not an expense. The core model already stores it the way the books want it: an order-level discount is a charge (payer merchant, payee customer) and its allocations split it across the lines that earned it, so each line's net revenue is its price less its allocated discount, and a refund reverses the allocation ([Promotions, Discounts & Gift Cards](/books/commerce/promotions-and-gift-cards#how-to-build-it)). Two cases need care:

- **Funding by someone else.** A manufacturer-funded coupon or a marketplace-funded promotion is reimbursed; the promotion's `funded_by` decides whether the merchant books the reimbursement as part of the transaction price or a receivable from the funder.
- **Free goods are goods.** A gift with purchase or the free unit in a BOGO is a delivered item with a cost; its share of the price comes from the allocation, and its cost leaves inventory like any other unit.

## Returns Reserves

A right of return makes part of every sale variable consideration ([Return-Rate Economics](/books/commerce/returns-and-exchanges#return-rate-economics)): the store recognizes revenue for what it expects to keep, a refund liability for what it expects to give back, and an asset for the right to recover the goods, at their carrying amount less recovery costs and expected loss in value, all remeasured each period. Retailers say so in their filings: merchandise sales "net of expected returns."

The estimate is a finance calculation over the system's history:

- **The base:** sales still inside the return window at period end, by channel and category, from `orders`, `order_lines` and the return policy pinned to each order.
- **The rate:** returns as a share of sales by the same cuts and by age since delivery, from `returns` and `return_lines`, including returns that became exchanges or store credit rather than refunds.
- **The recovery:** the share of returned units restocked, refurbished, liquidated or destroyed, and the cost of processing, from `return_inspections`, which sets the value of the return asset.

At period end the reserve is a pair of entries (reduce revenue and book the refund liability; reduce cost of goods sold and book the return asset); actual returns then draw the liability down as they're refunded. A merchant that offers store credit or exchanges instead of refunds still has a liability, just to a different account.

## Gift Cards, Loyalty and Other Liabilities

Several commerce products take cash or grant value now for goods later. Each is owned by its chapter; the accounting is a liability that becomes revenue when the goods transfer, and breakage where it applies:

| Liability | Created by | Becomes revenue | Breakage and escheat | Owning chapter |
| --- | --- | --- | --- | --- |
| **Gift cards** | The sale of a card (not revenue, generally not a taxable sale of goods) | When redeemed for goods, at the goods' recognition | Expected breakage recognized "in proportion to the pattern of rights exercised"; amounts owed to a state under unclaimed property law are a liability, not revenue | [Breakage](/books/commerce/promotions-and-gift-cards#breakage), [Unclaimed property](/books/commerce/promotions-and-gift-cards#unclaimed-property) |
| **Store credit** | A return refunded as credit, a goodwill adjustment | When spent | Per jurisdiction; often treated like gift cards | [Store credit](/books/commerce/promotions-and-gift-cards#store-credit) |
| **Loyalty points** | A share of each earning sale's price, by relative standalone selling price | As points are redeemed, adjusted for expected redemption | Through the redemption-adjusted standalone price; estimates updated each period | [Points as Material Rights](/books/commerce/memberships-and-loyalty#points-as-material-rights), [Breakage](/books/commerce/memberships-and-loyalty#breakage) |
| **Paid memberships** | The membership fee | Over the membership term | Refund policy decides the liability | [Memberships & Loyalty](/books/commerce/memberships-and-loyalty#how-to-build-it) (`deferred_fee_schedules`) |
| **Prepaid subscriptions** | A charge for several future shipments | As each shipment is delivered | Refund rules on cancellation | [Subscription Commerce](/books/commerce/subscription-commerce#how-to-build-it) (`prepaid_periods`) |
| **Customer deposits** | A capture at checkout before shipment; a B2B deposit | At shipment or delivery | None | [Taking Payment in Commerce](/books/commerce/taking-payment#capture-policies) |

PwC's loyalty example shows the arithmetic finance runs: points granted on $1,000,000 of spend with 75% expected redemption get an allocated $56,604 of the price; when 40,000 of the 60,000 points expected to be redeemed have been, $37,736 has been recognized and $18,868 remains a contract liability; when the expected redemption rises to 70,000 points, the next period's revenue is computed against the new estimate. The system's job is the ledger behind those numbers: every grant, redemption, reversal and expiry with its date, cohort and order line, so the redemption curve is a query.

## COGS and Inventory Valuation

Cost of goods sold is the cost of the units that left: the inventory value that moved from the balance sheet to the income statement when control of each unit passed. The cost flow assumption decides which cost a shipped unit carries:

- **Specific identification** for units tracked individually (serialized electronics, vehicles), at each unit's own cost.
- **FIFO (first in, first out)**: "the items you purchased or produced first are the first items you sold," in the IRS's words. Shipped units draw from the oldest receipt layers at that location.
- **Weighted average**: each receipt resets the item's average cost at the location (perpetual moving average), and shipped units carry the current average.
- **LIFO (last in, first out)**: allowed under US GAAP and for US tax (by filing Form 970 to adopt it, and subject to the conformity rule that a taxpayer using LIFO for tax use it in its reports to owners and creditors), and not among the methods IFRS allows, which are FIFO and weighted average for interchangeable items. Large US retailers combine it with the retail inventory method, which values inventory from retail prices and a cost-to-retail ratio: Target accounts for the vast majority of its inventory "under the retail inventory accounting method using the last-in, first-out method (LIFO)."

Measurement after cost follows the method: inventory under FIFO or average cost is carried at the lower of cost and net realizable value (ASU 2015-11), while LIFO and the retail method keep the older lower of cost or market. Shrink, damage and obsolescence write inventory down: a cycle-count variance, a damaged disposition and a write-off are inventory movements with reasons ([Movements, Not Overwrites](/books/commerce/inventory#movements-not-overwrites)), and each one's value comes from the layers it draws.

For the system, valuation is a function over two append-only records the volume already keeps: `inventory_movements` (every unit in and out, by item, location, lot and reason) and receipt costs with their landed cost allocations ([Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment#how-to-build-it)). Cost layers are created by receipts and drawn by shipments, write-offs and transfers; COGS for a period is the sum of draws by shipments that period; the inventory balance is the sum of what remains. The ERP may be the valuation system of record instead, in which case the commerce system sends movements and receives cost, and `inventory_items.unit_cost` is the ERP's current number, not a computation.

Tax has its own rules on top: the IRS lets a small business taxpayer meeting the gross receipts test (indexed for inflation) choose not to keep inventories in the usual way, and the uniform capitalization rules of section 263A decide which additional costs larger taxpayers capitalize into inventory for tax. Both are reasons the valuation method is a setting per entity and book, not a constant.

## Landed Cost Capitalization

Inventory cost is everything spent to bring the goods to their present location and condition: the supplier's price plus inbound freight, insurance, duties, brokerage and handling. IAS 2 states the principle in those words ("other costs incurred in bringing the inventories to their present location and condition"), US GAAP's inventory guidance follows the same idea, and the IRS counts "transportation or other charges incurred in acquiring the goods" in a purchase's cost. Outbound shipping to customers is not inventory cost; it is a fulfillment cost (above).

The costs arrive late and in pieces, which is why [Landed Cost](/books/commerce/purchasing-and-replenishment#landed-cost) allocates them to receipt lines by a split method after the fact. The accounting consequence is a revaluation:

- **Allocation at receipt time where the costs are known,** so the layer starts at landed cost.
- **Allocation after receipt for invoices that come later** (the ocean freight bill, the broker's invoice, a duty adjustment): the share belonging to units still on hand raises the remaining layer's cost; the share belonging to units already sold goes to cost of goods sold in the period the invoice is booked. ERPNext's landed cost voucher describes the posture: it "updates inventory valuation without rewriting the original receipt."
- **An accrual until the invoice arrives,** where the amount is material: an estimate from the freight quote or the duty calculation, reversed when the actual posts.

## Payout and Marketplace Reconciliation

Revenue is booked from orders; cash arrives from processors and marketplaces as net deposits. Between the two is a clearing account per payment source (a processor receivable, a marketplace receivable) that every order, refund, fee, chargeback and payout moves through, and reconciliation is proving that account clears:

1. **Order to balance transaction.** Each capture and refund in `order_payments` matches a processor balance transaction (Stripe's balance transaction ID, Shopify Payments' transaction) by the payment reference; each marketplace order matches its settlement lines. Unmatched on either side is a break.
2. **Balance transactions to payout.** The processor says which transactions each payout settled (Stripe's itemized report lists them per automatic payout); their net must equal the payout, and the fees in them must equal the fees the merchant expected ([Payouts & Settlement](/books/payments/payouts-and-settlement#reconciliation)).
3. **Payout to bank.** The payout's amount and date match a bank deposit, by trace ID where the processor provides one.

What makes commerce payouts hard is timing and netting: a refund or chargeback lands in a later payout than the sale it reverses, a reserve holds back part of a payout, a marketplace's deferred transactions pay out days after delivery, and account-level lines (subscriptions, storage, advertising) have no order at all ([Selling on Amazon](/books/commerce/selling-on-amazon#how-to-build-it)). The fix is to reconcile per transaction, not per payout: a payout that is $3 short says nothing, while a fee line that differs from the expected charge says what to dispute. The matching engine, its breaks and suspense accounts are the Payments volume's ([A Matching Engine](/books/payments/ledger-and-reconciliation#a-matching-engine), [Breaks](/books/payments/ledger-and-reconciliation#breaks)); wholesale remittances net of deductions are the same problem with an 820 instead of a settlement report ([Wholesale & Retail Distribution](/books/commerce/wholesale-and-retail-distribution#how-to-build-it)).

## Period Close

A store's month end adds commerce cutoffs to the playbook's close ([Month-End Close](/docs/payments/accounting#month-end-close)):

- **Shipped versus delivered.** Orders shipped in the last days of the month under a delivery-based policy are revenue next month; the cutoff query reads shipment and delivery times in the reporting time zone.
- **Captured but not shipped.** Deposits for unshipped orders stay liabilities; authorizations that were never captured are not entries at all.
- **Accruals for invoices not yet received:** carrier invoices from label costs, 3PL fees from order charges, marketplace fees from expected charges, landed costs from estimates.
- **Estimates refreshed:** the returns reserve, gift card and loyalty breakage, the inventory reserve for obsolete and damaged stock.
- **Subledgers tied out:** inventory valuation to the ledger's inventory account, the gift card and loyalty ledgers to their liability accounts, the sales tax payable to the returns being filed, each clearing account to zero or to listed open items.
- **Closed periods stay closed.** A late settlement or a backdated return posts in the open period with its original date recorded ([Closed Periods Stay Closed](/docs/payments/accounting#closed-periods-stay-closed)).

## How to Build It

The ledger here is the commerce system's subledger: balanced journal entries generated from the volume's records, posted to the ERP in detail or summary. Cost layers value inventory, schedules hold deferred revenue, and reconciliations close the loop with cash:

```sql
CREATE TABLE journal_entries (           -- one balanced posting, generated from one source
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id      UUID NOT NULL REFERENCES merchants (id),
  entity           TEXT NOT NULL,          -- the legal entity whose books it is
  book             TEXT NOT NULL DEFAULT 'gaap' CHECK (book IN ('gaap', 'tax', 'ifrs')),
  kind             TEXT NOT NULL CHECK (kind IN ('sale', 'shipment', 'refund', 'fee',
                     'payout', 'settlement', 'cogs', 'receipt', 'landed_cost', 'adjustment',
                     'reserve', 'deferral', 'recognition', 'breakage', 'accrual', 'reversal')),
  source_kind      TEXT NOT NULL,          -- 'order', 'shipment', 'return', 'payout',
                                           -- 'settlement', 'receipt', 'gift_card_transaction', ...
  source_id        UUID NOT NULL,
  business_date    DATE NOT NULL,          -- in the entity's reporting time zone, assigned once
  period           DATE NOT NULL,          -- first day of the open period it posts to
  policy_version   TEXT NOT NULL,          -- the recognition or valuation rule that produced it
  reverses_id      UUID REFERENCES journal_entries (id),
  sync_job_id      UUID REFERENCES sync_jobs (id),  -- the ERP posting that carried it
  idempotency_key  TEXT NOT NULL UNIQUE,   -- source, kind, book and revision
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE journal_lines (             -- debits positive, credits negative; sums to zero
  journal_entry_id UUID NOT NULL REFERENCES journal_entries (id),
  line_no          SMALLINT NOT NULL,
  account          TEXT NOT NULL,          -- this system's account; mapped to the ERP's chart
  amount           BIGINT NOT NULL,        -- signed, minor units
  currency         CHAR(3) NOT NULL,
  order_id         UUID REFERENCES orders (id),
  order_line_id    UUID REFERENCES order_lines (id),
  order_charge_id  UUID REFERENCES order_charges (id),
  location_id      UUID REFERENCES locations (id),
  channel          TEXT,
  jurisdiction     TEXT,                   -- for tax payable lines
  schedule_id      UUID,                   -- deferred_revenue_schedules, below
  cost_layer_id    UUID,                   -- inventory_cost_layers, below
  PRIMARY KEY (journal_entry_id, line_no)
);

CREATE TABLE inventory_cost_layers (     -- units received at one landed cost
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  item_id          UUID NOT NULL REFERENCES inventory_items (item_id),
  location_id      UUID NOT NULL REFERENCES locations (id),
  book             TEXT NOT NULL DEFAULT 'gaap',
  method           TEXT NOT NULL CHECK (method IN ('fifo', 'weighted_average',
                     'specific', 'lifo')),
  receipt_line_id  UUID REFERENCES receipt_lines (id),  -- null: opening balance, transfer in
  lot              TEXT,
  serial           TEXT,                   -- for specific identification
  quantity_in      INT NOT NULL CHECK (quantity_in > 0),
  unit_cost        NUMERIC(18, 6) NOT NULL,  -- landed, fractional minor units
  currency         CHAR(3) NOT NULL,
  received_at      TIMESTAMPTZ NOT NULL,   -- orders FIFO draws
  UNIQUE (receipt_line_id, book)
);

CREATE TABLE cost_layer_draws (          -- which layer each outbound movement consumed
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  cost_layer_id    UUID NOT NULL REFERENCES inventory_cost_layers (id),
  movement_id      UUID REFERENCES inventory_movements (id),  -- null: a revaluation
  kind             TEXT NOT NULL CHECK (kind IN ('shipped', 'write_off', 'transfer_out',
                     'shrinkage', 'revaluation', 'return_restock')),
  quantity         INT NOT NULL,           -- negative restores units to the layer
  amount           BIGINT NOT NULL,        -- the value moved, minor units
  landed_cost_allocation_id UUID REFERENCES landed_cost_allocations (id),  -- for revaluations
  journal_entry_id UUID REFERENCES journal_entries (id),
  drawn_at         TIMESTAMPTZ NOT NULL
);

CREATE TABLE deferred_revenue_schedules (  -- value received now, earned later
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id      UUID NOT NULL REFERENCES merchants (id),
  source_kind      TEXT NOT NULL CHECK (source_kind IN ('order_line', 'gift_card',
                     'store_credit', 'loyalty_grant', 'membership_fee', 'prepaid_period',
                     'customer_deposit')),
  source_id        UUID NOT NULL,          -- the order line, card, ledger entry or period
  obligation       TEXT NOT NULL CHECK (obligation IN ('point_in_time', 'over_term',
                     'per_shipment', 'stored_value')),
  allocated_amount BIGINT NOT NULL,        -- after allocation by standalone selling price
  currency         CHAR(3) NOT NULL,
  recognize_on     TEXT NOT NULL,          -- the event that releases it: 'shipped',
                                           -- 'delivered', 'redeemed', 'period_elapsed'
  term             TSTZRANGE,              -- for over_term
  breakage_rate_bp INT,                    -- finance's current estimate, for stored_value
  policy_version   TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_kind, source_id, policy_version)
);

CREATE TABLE payout_reconciliations (    -- one deposit, proven against its transactions
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  connected_system_id UUID NOT NULL REFERENCES connected_systems (id),
  payout_ref       TEXT NOT NULL,          -- the processor's payout ID or the settlement ID
  settlement_id    UUID REFERENCES marketplace_settlements (id),
  expected_net     BIGINT NOT NULL,        -- from our captures, refunds and expected fees
  reported_net     BIGINT NOT NULL,        -- from the processor's or marketplace's report
  deposited        BIGINT,                 -- from the bank statement
  currency         CHAR(3) NOT NULL,
  unmatched_ours   INT NOT NULL DEFAULT 0, -- our rows with no reported transaction
  unmatched_theirs INT NOT NULL DEFAULT 0, -- reported transactions with no row of ours
  fee_variance     BIGINT NOT NULL DEFAULT 0,
  status           TEXT NOT NULL CHECK (status IN ('open', 'matched', 'variance',
                     'resolved')),
  journal_entry_id UUID REFERENCES journal_entries (id),  -- the payout's clearing entry
  reconciled_at    TIMESTAMPTZ,
  UNIQUE (connected_system_id, payout_ref)
);
```

A shipped line under FIFO draws the oldest layers with units left, in one transaction with the movement and the COGS entry:

```sql
-- Serialize draws per item and location first (the level row the movement already locks
-- does this), then read the layers with units remaining, oldest first.
SELECT l.id, l.unit_cost,
       l.quantity_in - COALESCE(SUM(d.quantity), 0) AS remaining
FROM inventory_cost_layers l
LEFT JOIN cost_layer_draws d ON d.cost_layer_id = l.id AND d.kind <> 'revaluation'
WHERE l.item_id = $item AND l.location_id = $location AND l.book = 'gaap'
GROUP BY l.id
HAVING l.quantity_in - COALESCE(SUM(d.quantity), 0) > 0
ORDER BY l.received_at, l.id;
-- Draw from each in turn until the shipped quantity is covered, insert cost_layer_draws,
-- then post: debit cost_of_goods_sold, credit inventory, for the sum of the draws.

-- Every entry balances; a nightly job asserts it.
SELECT journal_entry_id FROM journal_lines
GROUP BY journal_entry_id HAVING SUM(amount) <> 0;
```

The entries a DTC parcel order produces, with capture at shipment and the shipping election made (amounts in cents):

| Event | Debit | Credit | Amount |
| --- | --- | --- | --- |
| Shipment, goods | `processor_receivable` | `product_revenue` | 6,000 |
| Shipment, shipping charged | `processor_receivable` | `shipping_revenue` | 599 |
| Shipment, tax collected | `processor_receivable` | `sales_tax_payable` (by jurisdiction) | 495 |
| Shipment, cost of the unit | `cost_of_goods_sold` | `inventory` | 2,140 |
| Label bought | `fulfillment_cost` | `carrier_payable` | 812 |
| Processor fee | `payment_processing_fees` | `processor_receivable` | 228 |
| Payout | `cash` | `processor_receivable` | 6,866 |
| Month end, returns reserve | `product_revenue` and `return_asset` | `refund_liability` and `cost_of_goods_sold` | By the estimate |

A marketplace sale replaces the processor with a marketplace receivable, books the referral and fulfillment fees from settlement lines as expenses, and has no tax payable where the marketplace remits.

Design notes:

- **Entries are generated, never typed.** Each journal entry comes from one source row by a versioned rule, with an idempotency key from source, kind, book and revision; a correction is a reversing entry plus a new one, both in the open period ([Append-Only Records](/docs/payments/payment-states#append-only-records)).
- **Lines carry the commerce dimensions.** Order, line, charge, location, channel and jurisdiction on every line are what let a summary posted to the ERP be drilled back to orders, and margin by channel be computed from the books instead of beside them ([Business Models & Unit Economics](/books/commerce/business-models#how-to-build-it)).
- **Layers are per book.** A merchant on LIFO for tax and FIFO for its lenders, or reporting under both GAAP and IFRS, has two sets of layers from the same movements; the movements never fork.
- **Revaluations are draws.** A late freight invoice allocated to a receipt line becomes a `revaluation` draw: the units still on hand get a higher cost, the units already shipped post their share to COGS now.
- **Schedules are the commerce form of the playbook's revenue lines.** A deferred schedule names its source, its obligation and the event that releases it; recognition is a journal entry whose lines point back at the schedule, so the deferred balance is a sum, never a column ([Recognition Schedules](/docs/payments/accounting#recognition-schedules)).
- **Reconcile per payout, explain per transaction.** A reconciliation row is matched only when expected, reported and deposited agree and nothing is unmatched on either side; anything else opens a break for the Payments volume's matching engine and a person.
- **Policy lives in versions.** When control passes, the shipping election, the returns rate, the breakage rate and the cost method are each a versioned rule recorded on the entries they produced, so finance can change a policy and see exactly which entries it affects.

## Auditing

- **Every entry traced to its source.** Each journal entry with the order, shipment, return, receipt, payout or settlement that produced it and the rule version, so an auditor sampling revenue lands on an order and its shipment time.
- **Cost layers and draws.** Every receipt's landed cost, every allocation that changed it, every unit drawn, so inventory value and COGS can be rebuilt from movements.
- **Estimates with their inputs.** The returns reserve, breakage rates and inventory reserves each month, with the history and the parameters they were computed from.
- **Liabilities tied out monthly.** Gift card, store credit, loyalty, membership, prepaid and deposit balances against their ledgers, and sales tax payable against filed returns by jurisdiction.
- **Every payout reconciled,** with breaks, who resolved them and how.

## What This Means for the System You Build

- **Keep the facts the policies need:** shipment and delivery times, charges with payer and payee, allocations, return history, receipts with landed costs, and every balance's grants and uses.
- **Book revenue when control passes,** under a versioned rule, and treat money captured before then as a liability.
- **Make the shipping election explicit,** keep shipping charged as a charge and shipping paid as a cost on the shipment, and accrue carrier invoices from label costs.
- **Keep sales tax out of revenue,** by jurisdiction and remitter, and reverse refunded tax at the original rate.
- **Value inventory from layers and movements,** per book, with late landed costs as revaluations.
- **Leave each liability with its chapter's ledger** and book from it: gift cards, store credit, points, memberships, prepaid boxes and deposits.
- **Reconcile every payout per transaction** through a clearing account per source, and close periods that stay closed.

## References

**Standards and regulators**

- [PwC Viewpoint: Shipping and handling fees (10.4)](https://viewpoint.pwc.com/dt/us/en/pwc/accounting_guides/revenue_from_contrac/revenue_from_contrac_US/chapter_10_principa_US/10_4_shipping_and_hand_US.html), the shipping and handling election, recognition and presentation
- [Deloitte DART: Sales taxes and similar taxes collected from customers (6.7)](https://dart.deloitte.com/USDART/home/codification/revenue/asc606-10/roadmap-revenue-recognition/chapter-6-step-3-determine-transaction/6-7-sales-taxes-similar-taxes), the ASC 606-10-32-2A election and its scope
- [PwC Viewpoint: Unexercised rights (7.4)](https://viewpoint.pwc.com/dt/us/en/pwc/accounting_guides/revenue_from_contrac/revenue_from_contrac_US/chapter_7_options_to_US/74unexercised_rights_US.html), breakage recognition, the loyalty point example and unclaimed property
- [PwC Viewpoint: ASU 2015-11, Simplifying the measurement of inventory](https://viewpoint.pwc.com/dt/us/en/fasb_financial_accou/asus_fulltext/2015/asu_201511inventory_/asu_201511inventory__US/asu_201511inventory__US.html), lower of cost and net realizable value for FIFO and average cost, excluding LIFO and the retail method
- [IFRS Foundation: IAS 2 Inventories](https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/), costs of bringing inventories to their location and condition, and the FIFO and weighted average formulas
- [IRS: Publication 538, Accounting Periods and Methods](https://www.irs.gov/publications/p538), inventory identification methods, cost including transportation, Form 970, and the small business exception
- [26 U.S.C. 472: Last-in, first-out inventories](https://www.law.cornell.edu/uscode/text/26/472), the LIFO conformity requirement

**Platform documentation**

- [Stripe: Payout reconciliation report](https://docs.stripe.com/reports/payout-reconciliation), transactions per automatic payout, reporting categories and instant payouts
- [Shopify Help Center: Shopify Payments payouts](https://help.shopify.com/en/manual/payments/shopify-payments/payouts), the activity report of transactions, fees and payouts
- [Oracle NetSuite: Customer deposits](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N1296349.html), deposits as a liability applied to the invoice
- [Oracle NetSuite: Cash sales and invoices](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N1221414.html), the records fulfillment creates
- [Microsoft Learn: Synchronize and fulfill sales orders](https://learn.microsoft.com/en-us/dynamics365/business-central/shopify/synchronize-orders), sales orders, invoices and credit memos from Shopify orders
- [ERPNext documentation: Purchase receipt](https://docs.frappe.io/erpnext/user/manual/en/purchase-receipt), the Landed Cost Voucher revaluing inventory without rewriting the receipt

**Filings**

- [Target: Form 10-K for fiscal 2025](https://www.sec.gov/Archives/edgar/data/27419/000002741926000016/tgt-20260131.htm), merchandise sales net of expected returns, and inventory under the retail inventory method using LIFO
