+++
title = "AP, Bill Pay & Procurement"
description = "Accounts payable as a product: intake and POs, invoice capture, approvals, 2- and 3-way match with tolerances, vendor onboarding and choosing how to pay."
category = "Banking & Lending Industry"
order = 2467
part = "Spend Management"
tags = ["banking", "spend-management", "accounts-payable", "procurement", "invoices", "controls"]
+++

Cards cover the spend that happens at a checkout. Most of a company's money leaves another way: a supplier sends an invoice, someone confirms the company owes it, and on a date the company chooses it pays by ACH, check, wire or card. That is accounts payable, and in front of it sits procurement, where an employee asks to buy something, someone approves the budget, and a purchase order commits the company before the vendor ships. Spend platforms sell both as one product (BILL, Ramp, Brex, Coupa, SAP Concur and Paylocity among them), because the controls a finance team wants on a card (who may spend, on what, up to how much, coded to which account) are the same ones it wants on an invoice, and because the payment at the end earns the platform interchange or float.

This chapter covers intake and purchase orders, invoice capture, approvals, two- and three-way matching with tolerances (with a worked price variance), vendor onboarding and bank account verification, choosing the payment method and date, and how these records extend the ones other volumes already define. The payout itself, every rail's mechanics, virtual card economics, redirect fraud and 1099s belong to the Payments volume's [Vendor Payouts](/books/payments/vendor-payouts), and this chapter links rather than repeats it. Inventory purchasing (forecasts, reorder points, receiving against ship notices, landed cost) is Commerce's [Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment); posting bills and payments to the general ledger is [Accounting Sync & the Close](/books/banking-and-lending/accounting-sync).

## How the Platforms Do It

As of October 2026, from each company's own pages and filings:

| Platform | Capture | Approvals and matching | Payment methods | ERP sync | Notes |
| --- | --- | --- | --- | --- | --- |
| **BILL** (FY2026 10-K) | "Proprietary AI capabilities" read incoming bills and pre-populate due date, amount and supplier; a dedicated inbox for emailed invoices, uploads | Policy-driven approval routing; roles of administrator, payor, approver, clerk and accountant | ACH, check, virtual card, real-time payments, wires, cross-border to over 130 countries | Two-way sync with QuickBooks Online and Desktop, NetSuite, Sage Intacct, Xero and Business Central | About 479,300 businesses and $371.3 billion of total payment volume in fiscal 2026; 9.2 million network members; state money transmitter licenses |
| **Coupa** (FY2022 10-K) | Supplier e-invoices through the Coupa Supplier Portal, "no-cost" to suppliers | Configurable "invoice approval and matching rules"; approved requests become POs "automatically sent to suppliers" | Coupa Pay: "one-time-use virtual credit cards, digital checks, and digital wallets" | Not in the sections read | More than seven million suppliers connected; customers in more than 70 countries |
| **Ramp** | OCR of header and line items ("99% accuracy", its claim); bank details extracted from invoices | Rule-routed approvals with an AI summary; 2-way (PO to invoice) and 3-way (PO, invoice and receipt) match; Procurement add-on with natural-language intake, parallel approvals and contract renewals | ACH, same-day ACH, check, Ramp card or one-time virtual card, domestic and international wire | NetSuite, QuickBooks, Sage Intacct; POs sync to QuickBooks Online and NetSuite | Flags "unexpected changes to vendor banking details"; collects W-9s before vendor approval |
| **SAP Concur Invoice** | "Automated, connected accounts payable" | PO matching and approval routing; "Prevent duplicate or incorrect payments" | Not on the page read | "300+ pre-built connectors" | Sold beside Concur Expense and Travel as one view |
| **Paylocity for Finance** (formerly Airbase) | Not in the filing sections read | Guided Procurement | Not in the sections read | Not in the sections read | Paylocity closed the Airbase acquisition in October 2024, funded with $325.0 million drawn on its revolver; sold as Headcount Planning, Expense Management, Accounts Payable Automation, Corporate Cards and Guided Procurement |

Three patterns. **The invoice is read by a machine and confirmed by a person:** every platform now extracts the header and lines, and the product question is what happens to the machine's guess when a person corrects it. **Matching needs the ERP's records:** Ramp's three-way match uses POs and item receipts that sync with NetSuite and QuickBooks Online, so whichever system records receiving is the system of record for it, and the AP product has to read it rather than keep a second copy that drifts. **The payment method is chosen per bill, late:** card, ACH, check and wire all sit behind one approve button, and the platform's revenue depends on which one the vendor accepts ([Virtual Cards: Who Pays for the Rebate](/books/payments/vendor-payouts#virtual-cards-who-pays-for-the-rebate)).

## Procure to Pay

The full cycle, which few companies run every step of for every purchase:

1. **Intake.** An employee asks to buy something: a description, an estimated amount, a vendor if known, a quote or contract. Ramp takes it in plain language and pre-fills from an uploaded quote; Coupa calls it a requisition.
2. **Approval of the request.** Rules by amount, department, budget and vendor type, often in parallel (finance, legal, security for a SaaS vendor that will hold data). Ramp runs compliance checks before the request reaches approvers.
3. **Vendor onboarding** if the vendor is new (below).
4. **Purchase order.** On approval, a PO is generated and sent to the vendor, or for a subscription, a card is issued instead ([Corporate Cards & Underwriting](/books/banking-and-lending/corporate-cards) and [Virtual Cards & Spend Controls](/books/banking-and-lending/card-controls) cover cards per vendor).
5. **Receipt.** Someone confirms the goods arrived or the service was delivered: a warehouse receipt for goods, a requester's sign-off for services.
6. **Invoice.** The vendor bills; the invoice is captured, coded and matched to the PO and receipt.
7. **Approval of the bill** and, on some products, a separate **payment-release approval** (Ramp sells it in its Plus tier).
8. **Payment** on the chosen date and method, recorded as a [disbursement](/books/payments/vendor-payouts#a-payout-is-a-state-machine).
9. **Sync** to the general ledger and close.

Most invoices skip steps 1 to 5: a utility bill, a law firm's monthly invoice, a contractor's timesheet. Those are **non-PO invoices**, approved on the invoice alone, and the policy decides which spend requires a PO (by amount, category or vendor). Contract renewals are a procurement concern too: Ramp tracks renewal dates so "nothing renews without sign-off", which is the same control as a PO, applied to an auto-renewing subscription.

## Invoice Capture

An invoice arrives as a PDF by email, a paper scan, a supplier portal entry, an EDI 810 from a supplier that trades by EDI ([The Transactions](/books/commerce/edi#the-transactions)), or a structured e-invoice. Capture turns it into a bill: vendor, invoice number, invoice date, due date or terms, currency, total, tax, and lines with description, quantity, unit price and amount, plus the remittance details printed on it.

The design rules:

- **Keep the original bytes and the extraction.** The PDF is evidence; the extracted fields are a guess with a confidence per field. Store both, and store what a person changed, so capture accuracy is measured on your own invoices rather than a vendor's claim (Property Tech's [How to Build It](/books/property-tech/vendors-and-payables#how-to-build-it) keeps the prediction beside the approved line the same way).
- **Catch duplicates at entry.** The Payments `bills` table makes (vendor, invoice number) unique, which catches the exact resend. The near duplicates (the same amount and date with a reformatted number, the PDF and the paper copy of the same invoice entered by two people) need a fuzzy check across vendor, amount, date and line content before approval, which is what Concur's "prevent duplicate or incorrect payments" is selling.
- **Bank details on an invoice are a request, not data.** Ramp extracts bank details from invoices to create vendor records; that extraction must create a pending change that goes through verification, never a payable destination, because a changed account number on an invoice is the most common business email compromise ([Stopping the Changed Bank Account](/books/payments/vendor-payouts#stopping-the-changed-bank-account)).
- **Coding is part of capture.** Each line gets a GL account and dimensions (department, location, class, project), predicted from the vendor's history and the PO, confirmed by the approver; the dimensions and their sync are in [Accounting Sync & the Close](/books/banking-and-lending/accounting-sync#gl-coding-and-dimensions).

## Approvals

Approval is where separation of duties is enforced: the person who entered a bill doesn't approve it, the person who changed a vendor's bank details doesn't approve payments to that vendor, and large bills need more than one approver ([Bills Before Payouts](/books/payments/vendor-payouts#bills-before-payouts)). On top of those, a spend platform's chains are built from the customer's org chart and budgets: the requester's manager, the budget owner of the department coded on the line, finance above an amount, and the vendor owner for a new vendor. A bill coded to two departments has two budget owners, and a chain resolved at submission must be re-resolved if the coding changes before approval, or the approval covers a bill that no longer exists in that form.

Record which rule produced each step and the thresholds in force ([Record Which Rule Decided](/docs/architecture/rules-as-data#record-which-rule-decided)), so an auditor testing "bills over $25,000 need a controller" can see the rule, not a list of names. An AI summary or recommendation (Ramp's approval agent "suggests approve or reject") is advice recorded with the decision; the approver of record is the person ([Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions)).

## Two- and Three-Way Match

A **two-way match** compares the invoice with the PO: is this vendor billing for something we ordered, at the agreed price, in a quantity not more than we ordered? A **three-way match** adds the receipt: did it arrive? The match is per line, and it pays only what all the documents support. (The Payments volume uses "three-way match" for reconciling ledger, processor and bank, [Three Sources of Truth](/books/payments/ledger-and-reconciliation#three-sources-of-truth); this is the AP sense.)

Exact matching fails on real invoices: freight added, a unit price rounded, a partial shipment billed in full. So matching has **tolerances**, and NetSuite's published version is a useful template. Its "3 Way Match Vendor Bill Approval" workflow checks a vendor bill against the PO and against the item receipt with three settings each: a **quantity tolerance** and an **amount tolerance**, each a percentage ("what percentage of the evaluated value is used as the limit"), and a **quantity difference**, an absolute number of units. They can be set on the item, the vendor and the subsidiary, and a blank field skips that criterion. A bill inside every tolerance moves to approval; one outside any of them is held as an exception.

Exceptions resolve one of four ways, each a recorded decision: the vendor sends a corrected invoice or a credit memo; a buyer amends the PO (a new PO version, never an edit to the original); the receiver posts the missing receipt; or an authorized person approves the variance, and the difference is booked where the policy says (to the expense, or to a purchase price variance account for inventory under standard costing, which [Accounting Sync & the Close](/books/banking-and-lending/accounting-sync) covers). Partial billing is normal: a line ordered for 500 can be billed 300 now and 200 later, and the match compares each bill to what remains unbilled, not to the original quantity.

### Worked Numbers: A Price Variance

A company orders 500 units at $12.00 ($6,000.00). The receiving dock accepts 480; 20 are short. The vendor invoices 500 units at $12.40, $6,200.00. The policy's tolerances on this vendor: price within 2%, quantity billed no more than quantity received.

| Check | Expected | Invoice | Variance | Result |
| --- | --- | --- | --- | --- |
| Quantity against PO | at most 500 | 500 | 0 | Passes two-way |
| Quantity against receipt | at most 480 | 500 | 20 units over received | Fails three-way |
| Unit price against PO | $12.00, up to $12.24 at 2% | $12.40 | $0.40 (3.33%) | Fails |

What the documents support is 480 x $12.00 = $5,760.00. The $440.00 difference splits into two causes that go to different people: a **quantity variance** of 20 units x $12.40 = $248.00, which goes to receiving (are the 20 units on a truck, or short?), and a **price variance** of 480 x $0.40 = $192.00, which goes to the buyer (did someone agree to $12.40?). If the buyer confirms a price increase and amends the PO to $12.40, the price check passes; if the last 20 units arrive and are received, the quantity check passes; then the bill pays $6,200.00. If neither happens, the company pays $5,760.00 against a vendor credit memo for $440.00, or short-pays with a remittance note explaining the deduction, which the vendor's receivables team then works (the vendor's side is [B2B Receivables](/books/payments/checkout-and-invoicing#b2b-receivables)).

Holding the whole bill for a 20-unit dispute is a choice too. Some teams pay the matched portion ($5,760.00) now and hold the rest, which keeps the vendor's terms and early-payment discount; that requires a ledger that allows partial payment of a bill ([Funding: Whose Money, and When](/books/payments/vendor-payouts#funding-whose-money-and-when) has the partially paid state).

## How AP Maps to Commerce's Purchasing

Commerce's [Purchasing & Replenishment](/books/commerce/purchasing-and-replenishment#purchase-orders) defines the purchase order, its acknowledgment and the goods receipt for a merchant buying inventory, with `suppliers`, `purchase_orders`, `purchase_order_lines`, `receipts` and `receipt_lines`. AP doesn't need a second PO model. The mapping:

| Commerce record | AP role | What AP adds |
| --- | --- | --- |
| `suppliers` (who the merchant buys inventory from) | The same counterparty as the Payments `vendors` row that gets paid | A link from vendor to supplier, so one company isn't two unrelated records |
| `purchase_orders`, `purchase_order_lines` | The PO the invoice is matched to | Non-inventory lines (services, software, equipment) with no `item_id`, GL coding, and the request that created it |
| `receipts`, `receipt_lines` (accepted and rejected quantities) | The receipt in a three-way match | Service confirmations, recorded as a receipt by the requester instead of a dock count |
| The supplier's invoice as a `documents` row | The bill's source document | The Payments `bills` row, its lines, match results and approvals |

So a merchant that runs both buys inventory and pays for it on one set of records: Commerce owns the quantities and their effect on stock, AP owns the money and its approvals, and the match reads both. A spend platform that doesn't run inventory either keeps these records natively (Ramp's procurement module) or mirrors them from the ERP that does, with the ERP's ID on each row.

## Vendor Onboarding and Verification

Before the first payment, a vendor needs: its legal name and taxpayer ID on a W-9 (or a W-8 for a foreign vendor), checked through IRS TIN matching; sanctions screening ([Sanctions Screening](/books/banking-and-lending/sanctions-screening)); a remittance contact; any documents the buyer requires (a certificate of insurance, a security review for a software vendor, a signed contract); and payment details with evidence the account is the vendor's. Ramp collects "W9s, payment details, and compliance documents" before a vendor is approved; Property Tech's vendor compliance is the same idea with insurance and licenses as the gate ([Vendor Compliance](/books/property-tech/vendors-and-payables#vendor-compliance)).

Bank account verification is where onboarding meets fraud. The controls are the Payments volume's: verify any new or changed account out of band through a contact already on file, validate the account by an account validation service, a prenote or micro-deposits ([Validating the Account](/books/payments/ach#validating-the-account)), hold the first payment to new details, and separate whoever changes details from whoever approves payments. Nacha's 2026 fraud monitoring rules now expect originators to watch credits for payments sent under false pretenses ([The Rules You Inherit](/books/payments/ach#the-rules-you-inherit)), and a redirected vendor payment is exactly that. A spend platform's one advantage over a bank is the network: when the same vendor already receives payments from other customers on the platform, a newly submitted account that differs from the one other payers use is a strong signal, and BILL's 9.2 million network members are partly that signal.

## Choosing the Method and the Date

The approved bill becomes a payable; when and how it's paid are separate decisions, often made at a weekly payment run.

**The method** follows the vendor's acceptance and cost: a virtual card when the vendor takes cards at an acceptable fee (it earns the payer or platform a rebate and gives the payer the card's days of float), ACH for most others, check when the vendor won't enroll, and wire for international or urgent payments. The trade-offs, cutoffs and failure modes per rail are in [The Methods](/books/payments/vendor-payouts#the-methods) and [Enrollment and Method Choice](/books/payments/vendor-payouts#enrollment-and-method-choice).

**The date** follows the terms, the cash position and any discount. Paying on the due date by a rail that arrives on the due date keeps the cash longest; paying early is worth it only when the vendor offers a discount. Terms of "2/10 net 30" mean 2% off if paid within 10 days, the full amount by day 30. Taking the discount means paying 20 days early to save 2% of the invoice, which is 2/98 for 20 days, or about 37.2% annualized (2/98 x 365/20). A company whose cost of cash is below that should take every such discount, and the payment run should know each bill's discount date as well as its due date. The arrival date depends on the rail and its cutoff (a standard ACH credit arrives the next banking day, same-day ACH the same day if submitted before the cutoff, a check by mail), so the scheduler works backward from the date the vendor must have the money to the date the payment must leave, on the banking calendar.

**Funding** is the payer's account debit before the vendor credit (good funds), a prefunded balance, or, on products that offer it, the platform's credit: Pay a bill by card when the vendor doesn't take cards (the platform pays ACH and charges the payer's card), or extend the payer terms. Each changes who carries risk, and the credit versions are lending, underwritten as [Corporate Cards & Underwriting](/books/banking-and-lending/corporate-cards) describes.

## How to Build It

These are deltas against [the core data model](/books/banking-and-lending/banking-business#the-core-data-model) and the Payments volume's payables tables in [Vendor Payouts](/books/payments/vendor-payouts#how-to-build-it) (`vendors`, `vendor_payment_details`, `vendor_field_sources`, `vendor_cards`, `bills`, `bill_approvals`, `disbursements`), which this volume reuses rather than redefines. In this volume the payer is a business `parties` row where the Payments tables say `merchants`, and approval steps for bills live with expense and card-request approvals in `expense_approvals` from [Receipts, Expense Policy & Audit](/books/banking-and-lending/expense-management#how-to-build-it), so a company's approval history is one table; the Payments `bill_approvals` is the same record in that volume's simpler model. Purchase orders and receipts are Commerce's tables (above), extended for non-inventory spend.

```sql
-- The Payments vendor, owned by a business party, linked to Commerce's supplier.
ALTER TABLE vendors
  ADD COLUMN business_id        UUID REFERENCES parties (id),     -- the payer in this volume
  ADD COLUMN supplier_id        UUID REFERENCES suppliers (id),   -- the same company in Commerce, if any
  ADD COLUMN onboarding_status  TEXT NOT NULL DEFAULT 'invited' CHECK (onboarding_status IN
                                  ('invited', 'submitted', 'in_review', 'approved', 'blocked')),
  ADD COLUMN tax_form           TEXT CHECK (tax_form IN ('w9', 'w8ben', 'w8bene', 'none')),
  ADD COLUMN sanctions_screened_at TIMESTAMPTZ,
  ADD COLUMN default_terms      TEXT,                            -- 'net_30', '2_10_net_30'
  ADD COLUMN erp_vendor_ref     TEXT;                            -- the vendor's ID in the ERP

CREATE TABLE purchase_requests (           -- intake, before any PO
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  business_id      UUID NOT NULL REFERENCES parties (id),
  requester_id     UUID NOT NULL REFERENCES parties (id),
  description      TEXT NOT NULL,
  vendor_id        UUID REFERENCES vendors (id),   -- null until chosen or onboarded
  estimated_amount BIGINT NOT NULL CHECK (estimated_amount > 0),
  currency         CHAR(3) NOT NULL,
  category         TEXT NOT NULL,         -- 'software', 'services', 'equipment', 'inventory', ...
  fulfillment      TEXT NOT NULL CHECK (fulfillment IN ('purchase_order', 'vendor_card',
                     'reimbursement', 'contract_only')),
  coding           JSONB NOT NULL,        -- GL account and dimensions, as proposed
  quote_document_ref TEXT,
  renewal_of       UUID REFERENCES purchase_requests (id),  -- a contract renewal
  status           TEXT NOT NULL CHECK (status IN ('draft', 'pending_approval', 'approved',
                     'rejected', 'fulfilled', 'canceled')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Commerce's PO and receipt, extended for spend that isn't inventory.
ALTER TABLE purchase_orders
  ADD COLUMN vendor_id            UUID REFERENCES vendors (id),
  ADD COLUMN purchase_request_id  UUID REFERENCES purchase_requests (id),
  ADD COLUMN version              INT NOT NULL DEFAULT 1,   -- an amendment is a new version
  ADD COLUMN erp_ref              TEXT;                     -- when the ERP is the system of record

ALTER TABLE purchase_order_lines
  ALTER COLUMN item_id DROP NOT NULL,                       -- services and software have no item
  ADD COLUMN description      TEXT,
  ADD COLUMN amount_based     BOOLEAN NOT NULL DEFAULT FALSE,  -- billed by amount, not units
  ADD COLUMN coding           JSONB,                        -- GL account and dimensions
  ADD COLUMN quantity_billed  INT NOT NULL DEFAULT 0;

ALTER TABLE receipts
  ALTER COLUMN location_id DROP NOT NULL,                   -- a service has no dock
  ADD COLUMN kind TEXT NOT NULL DEFAULT 'goods' CHECK (kind IN ('goods', 'service_confirmation'));

-- The Payments bill, with what AP adds.
ALTER TABLE bills
  ADD COLUMN business_id        UUID REFERENCES parties (id),
  ADD COLUMN purchase_order_id  UUID REFERENCES purchase_orders (id),  -- null: a non-PO invoice
  ADD COLUMN invoice_date       DATE,
  ADD COLUMN terms              TEXT,
  ADD COLUMN discount_by        DATE,
  ADD COLUMN discount_amount    BIGINT,
  ADD COLUMN capture_method     TEXT CHECK (capture_method IN ('keyed', 'ocr', 'email_inbox',
                                  'supplier_portal', 'edi_810', 'e_invoice', 'api')),
  ADD COLUMN source_document_ref TEXT,                    -- the invoice bytes
  ADD COLUMN match_status       TEXT CHECK (match_status IN ('not_required', 'matched',
                                  'within_tolerance', 'exception', 'variance_approved')),
  ADD COLUMN pay_on             DATE,                     -- scheduled send date, from the due date and rail
  ADD COLUMN erp_ref            TEXT;

-- Bill approval steps are expense_approvals rows with subject_kind 'bill', which already
-- carry the routing rule version, delegation and the no-self-approval check.
ALTER TABLE expense_approvals
  ADD COLUMN stage  TEXT NOT NULL DEFAULT 'approval' CHECK (stage IN ('approval',
                      'payment_release')),
  ADD COLUMN advice JSONB;                                -- an AI recommendation, if shown

CREATE TABLE bill_lines (
  id                     UUID PRIMARY KEY DEFAULT uuidv7(),
  bill_id                UUID NOT NULL REFERENCES bills (id),
  purchase_order_line_id UUID REFERENCES purchase_order_lines (id),
  description            TEXT NOT NULL,
  quantity               NUMERIC(14, 4),
  unit_price             NUMERIC(18, 6),          -- as invoiced; amounts are minor units
  amount                 BIGINT NOT NULL,
  tax_amount             BIGINT NOT NULL DEFAULT 0,
  coding                 JSONB NOT NULL,          -- GL account and dimensions, as approved
  predicted              JSONB                    -- capture's fields and confidence, kept
);

CREATE TABLE match_tolerances (            -- per business, optionally narrowed to a vendor or item
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  business_id       UUID NOT NULL REFERENCES parties (id),
  vendor_id         UUID REFERENCES vendors (id),
  item_id           UUID,                          -- Commerce item, when it applies
  against           TEXT NOT NULL CHECK (against IN ('purchase_order', 'receipt')),
  quantity_pct      NUMERIC(6, 3),                 -- null: not checked
  amount_pct        NUMERIC(6, 3),
  quantity_units    NUMERIC(14, 4),
  valid_during      DATERANGE NOT NULL
);

CREATE TABLE bill_line_matches (           -- one result per bill line per check
  bill_line_id      UUID NOT NULL REFERENCES bill_lines (id),
  against           TEXT NOT NULL CHECK (against IN ('purchase_order', 'receipt')),
  tolerance_id      UUID REFERENCES match_tolerances (id),
  expected_quantity NUMERIC(14, 4),
  expected_price    NUMERIC(18, 6),
  quantity_variance NUMERIC(14, 4) NOT NULL DEFAULT 0,
  price_variance    BIGINT NOT NULL DEFAULT 0,     -- minor units across the line
  result            TEXT NOT NULL CHECK (result IN ('pass', 'within_tolerance', 'fail')),
  resolution        TEXT CHECK (resolution IN ('credit_memo', 'po_amended', 'receipt_posted',
                      'variance_approved', 'short_paid')),
  resolved_by       UUID REFERENCES parties (id),
  evaluated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (bill_line_id, against, evaluated_at)
);
```

Design notes:

- **Reuse, and map.** The vendor, bill, payment details and disbursement are the Payments records, approval steps are `expense_approvals`, the PO and receipt are Commerce's. AP's own tables are intake, bill lines, tolerances and match results. `vendors.supplier_id` is the join that keeps a company that is both a supplier and a payee one counterparty.
- **Match on evaluation, keep every evaluation.** A bill line is re-matched when a receipt posts, a PO is amended or a credit memo arrives; each evaluation is a row, so the record shows the bill failing on Monday and passing on Thursday, and why.
- **Tolerances resolve narrowest first:** item, then vendor, then the business default, as NetSuite resolves item, vendor and subsidiary, and the match row records which one applied.
- **Separation of duties in the approval transaction.** The approver check reads who entered the bill, who last changed the vendor's `vendor_payment_details`, and who requested the PO, and refuses an approver who is any of them for that stage.
- **Schedule from the arrival date backward.** `pay_on` is computed from the due date or discount date, the method's settlement time and the bank holiday calendar, and stored; a change of method recomputes it.
- **One payable, one successful disbursement,** enforced by the Payments `one_live_disbursement` index, with partial payments as successive disbursements against the remaining amount.
- **Emit events.** `purchase_request.approved`, `purchase_order.sent`, `bill.captured`, `bill.match_exception`, `bill.approved`, `bill.payment_released` and `vendor.onboarded` drive the approvers' queues, the payment run and the ERP sync.

## Auditing

AP is the most tested area in a financial statement audit and the first place a fraud examiner looks. The Payments chapter's [Auditing](/books/payments/vendor-payouts#auditing) covers payment details and disbursements; for procurement and AP, make sure the record shows:

- **Every request, PO version and approval,** with the rule and threshold that required each approval and who approved, so "every purchase over the limit had a PO" is a query.
- **Every invoice as received,** the extracted fields and their confidence, what a person changed, and who coded each line.
- **Every match evaluation and its resolution,** with the tolerance applied, and every approved variance with its approver and the account it was booked to.
- **Every duplicate check that fired,** and who overrode it.
- **Every vendor onboarding,** the W-9 or W-8, the TIN match result, the sanctions screen, the documents collected, and the bank account evidence and verification.
- **Every payment-release decision and schedule change,** including the discount date and whether the discount was taken.

## What This Means for the System You Build

- **Reuse the Payments payables records and Commerce's PO and receipt,** and add only intake, bill lines, tolerances and match results.
- **Keep the invoice bytes, the machine's extraction and the person's corrections** side by side.
- **Match per line against the PO and the receipt with tolerances,** narrowest first, and keep every evaluation and its resolution.
- **Split a variance into quantity and price,** and route each to the person who can resolve it.
- **Treat bank details found on an invoice as a change request,** verified out of band before any payment.
- **Enforce separation of duties** across entering, changing vendor details, approving and releasing.
- **Schedule payments backward from the date the vendor must have the money,** with discount dates and the rail's cutoff.
- **Mirror the ERP's receiving records when the ERP is the system of record,** with the ERP's ID on every row.

## References

**Filings**

- [BILL Holdings: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/0001786352/000162828026058238/bill-20260630.htm), AI bill capture, approval roles, payment methods and cross-border reach, money transmitter licenses, 479,300 businesses, $371.3 billion TPV, 9.2 million network members and the accounting integrations
- [Coupa Software: Form 10-K for fiscal 2022](https://www.sec.gov/Archives/edgar/data/1385867/000138586722000010/coup-20220131.htm), requests becoming POs sent to suppliers, configurable invoice approval and matching rules, the Coupa Supplier Portal, Coupa Pay's methods, seven million suppliers
- [Paylocity: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1591698/000159169826000069/pcty-20260630.htm), the October 2024 Airbase acquisition funded with $325.0 million of revolver borrowings, and the Paylocity for Finance products

**Vendor documentation**

- [Ramp: Accounts payable](https://ramp.com/accounts-payable), OCR of line items, approval routing, 2- and 3-way match, payment methods, bank detail extraction and changed-detail flags, W-9 collection and ERP sync
- [Ramp: Procurement](https://ramp.com/procurement), natural-language intake, parallel approvals, PO generation, 3-way match, contract renewals, vendor compliance before approval and PO sync to QuickBooks Online and NetSuite
- [Ramp: Pricing](https://ramp.com/pricing), automated batch payments and payment-release approvals in Plus at $15 per user per month plus a platform fee, and procurement as an add-on
- [SAP Concur](https://www.concur.com/), Concur Invoice for automated AP and duplicate payment prevention, PO matching and approval routing, 300+ connectors
- [Oracle NetSuite: 3 Way Match Vendor Bill Approval tolerances](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4168980481.html), quantity and amount tolerances and quantity differences against the PO and the item receipt, set on item, vendor and subsidiary
- [Oracle NetSuite: record.transform types](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4267258715.html), requisition to purchase order, purchase order to item receipt and vendor bill, vendor bill to payment and credit
