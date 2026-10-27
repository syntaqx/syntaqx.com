+++
title = "Vendors, Procurement & Payables"
nav_title = "Vendors & Payables"
description = "Buying for rental property: vendor compliance, bids and group buying, purchase orders, invoice capture and approval, bill pay, and payment-instruction fraud."
category = "Property Tech Industry"
order = 1722
part = "Operations"
tags = ["property-tech", "vendors", "procurement", "accounts-payable", "bill-pay", "fraud"]
+++

A property spends most of its operating budget through vendors: contractors who turn units and fix roofs, suppliers of paint, filters and appliances, landscapers, pest control, elevator companies, utilities and insurers. The operator picks them, checks they're insured and licensed, orders from them, approves their invoices and pays them, and in third-party management it does all of that with someone else's money. That last fact is what separates property payables from a generic accounts payable system: every invoice is an expense of a particular owning entity, paid from that entity's bank account, within limits set by that owner's management agreement and budget, and reported on that owner's statement. A manager with four hundred owners runs four hundred payables ledgers through one team.

This chapter covers vendor compliance, purchasing (bids, catalogs and group buying), purchase orders, invoice capture and approval, paying vendors, and the fraud that targets payables. It extends `vendors` from [the core data model](/books/property-tech/property-business#the-core-data-model) and leans on the [Payments](/books/payments/card-payments) volume's [Vendor Payouts](/books/payments/vendor-payouts) chapter for payout mechanics: methods, virtual cards, checks, funding, the payout state machine, and W-9s, TIN matching and 1099s. The work vendors do is in [Maintenance & Work Orders](/books/property-tech/maintenance-and-work-orders).

## How the Platforms Do It

The suites now sell the whole chain from requisition to payment, which the industry calls **procure-to-pay** or **source-to-pay**, and specialists sell each link. From the vendors' own pages:

- **Entrata.** Procure to Pay, launched October 16, 2024, covers purchase orders, approvals, invoice processing and payments; "Punchout Catalog Purchasing" gives access to "millions of vendor catalog items with real-time pricing"; and AI invoice processing "achieves 94% accuracy in predicting property, vendor, and GL account details" (the vendor's own figure). Vendors manage their payment preferences in a portal, VendorAccess, and NetVendor handles onboarding, document collection and ongoing compliance, with "vendor status ... always visible directly within Entrata." Bill Pay pays by "virtual card, ACH, and paper checks," pulls vendors' bank details from the portal, and is processed by "Entrata, Inc. or EntrataPay, LLC."
- **RealPage.** Spend Management automates "the entire P.O. and approval process," gives "real time visibility into spending against your budget," runs source to pay from order through receipt and invoice matching to payment, offers a managed catalog and eInvoicing, and connects customers through its eSupply program to "national vendors with deep discounts." Vendor Credentialing checks certificates of insurance (general liability, workers' compensation and auto "(if applicable)"), state trade licenses, W-9s and background checks "when required," while noting that "Vendor credentialing alone does not control spend." Its Vendor Marketplace, free to managers, lets them "send bid requests to select vendors, create public bid requests, receive bid responses and even award contracts." The AI Spend Agent, announced August 10, 2026, "continuously monitors purchasing, validates transactions against procurement policies, approved vendors and negotiated contracts, and flags off policy spend in real time."
- **ResMan.** Tracks purchase orders and inventory by unit, building and common area, and offers an AI invoice service whose terms describe it as provided through a third-party vendor.
- **Buildium.** E-files 1099-MISC and 1099-NEC forms "for both property owners and vendors" and mails paper copies.
- **Specialists.** AvidXchange sells real estate AP automation with "2-way or 3-way PO matching," invoice approval workflows "set by property or unit," payment by virtual card, ACH or check, rebates, and integrations with MRI, Rent Manager, ResMan, RealPage and Yardi. NetVendor credentials vendors (insurance outreach, expiring and missing certificates, W-9, background checks, OFAC screening, TIN matching) for operators on any of the major platforms. Outsourced AP firms such as IQ BackOffice process property managers' invoices as a service.

The pattern: credentialing, catalog buying, invoice capture and payment are each a business someone sells, sometimes with the contractor paying part of the cost, as it does when it accepts a virtual card. That makes the integration points between them the places where controls break, which is what most of this chapter is about.

## Vendor Compliance

Before a vendor works on a property, the operator wants proof that it's insured, licensed for the trade in that state, a legitimate business with a taxpayer identification number, and, for vendors entering occupied homes, that its workers have been screened. The insurance and license mechanics (certificates of insurance on the ACORD 25 form, additional insured endorsements, limits, renewals) are the same as for any facilities network and are covered in Field Operations' [Bonds and Certificates of Insurance](/books/field-operations/licensing-and-permits#bonds-and-certificates-of-insurance). The property twists:

- **Requirements vary by owner and property.** An institutional owner may demand higher limits than a small owner, a HUD property adds federal requirements, and a high-rise needs an elevator contractor with specific licenses. Requirements are data at the tenant, owner or property level, and a vendor is compliant for a property, not in general.
- **The resident's home raises the bar.** A vendor entering occupied units is a risk to residents, so background check requirements and the identity of the workers who will enter (not only the company) matter, and they connect to access: a credential for a vendor's technician is issued only for a compliant vendor and a scheduled visit ([Smart Locks and Access Control](/books/property-tech/access-and-smart-buildings#smart-locks-and-access-control)).
- **Compliance has to control spend, not just display a status.** RealPage's own page says credentialing "alone does not control spend." My rule: compliance status is checked at three gates (assigning a work order or issuing a purchase order, approving an invoice, releasing a payment) and a lapsed vendor gets a **payment hold** with a reason, released when the document arrives. Holding payment is the lever that makes vendors keep certificates current.
- **Checks repeat.** Certificates expire, licenses lapse, and sanctions lists change. Expiry dates drive reminders before the lapse, and an OFAC screen (which NetVendor lists among its checks) runs at onboarding and on every list update, not once.

## Purchasing, Bids and Group Buying

How the operator chooses what to buy and from whom depends on what it is:

- **Catalog items.** Filters, paint, appliances, plumbing parts and cleaning supplies are bought from catalogs at negotiated prices. **Punchout** is the standard integration: the buyer leaves the procurement system for the supplier's catalog site, fills a cart, and the cart returns as a requisition with prices and part numbers, using a protocol such as cXML, which lists PunchOut among its features. Entrata and RealPage both sell catalog buying, and a managed catalog restricts staff to approved items at contract prices.
- **Bids for projects and contracts.** A roof, a parking lot reseal or an annual landscaping contract goes out for bids: a scope, a list of invited (or public) vendors, a due date, responses, a comparison and an award. RealPage's marketplace does this end to end; an owner or lender may require a minimum number of bids above a dollar threshold, which is policy data on the owner or agreement.
- **Group purchasing.** A **group purchasing organization** (GPO) aggregates many buyers' volume to negotiate prices from national suppliers, as RealPage's eSupply does. A GPO may be funded by supplier fees or by rebates on members' purchases, which raises the same question as card rebates below: whose money earned it.

The control that ties these together is the budget. Every purchase is coded to a property and a general ledger account, and the procurement system shows spend against the property's budget before approval; Budgets, Forecasts & Capital Projects owns the budget itself. RealPage's AI Spend Agent is the newest form of an old control: comparing each purchase with policy, approved vendors and contract prices, and flagging the exceptions for a human.

## Purchase Orders

A **purchase order** (PO) is the operator's commitment to buy: vendor, property, lines with quantities and prices, GL coding, and the work order or project it serves. It exists so that an invoice can be checked against something agreed in advance, and so that committed spend shows against the budget before the invoice arrives.

Property twists on a standard PO:

- **One property, one paying entity.** A PO is issued for one property, so the owning entity that will pay is known at issue. A national supplier order that covers several properties is split into one PO per property (or carries property allocations on each line), because different owners' money can't pay one another's bills.
- **Approval limits come from two places.** The operator's internal authority matrix (a site manager approves up to one amount, a regional manager up to another) and the owner's management agreement, which may cap spend without owner approval. The stricter applies, and an emergency repair may be allowed to proceed with approval after the fact, recorded as such.
- **Work orders and POs link both ways.** A vendor work order is authorized by a PO, so the invoice can be matched to the job that was done and the job's completion evidence ([Proof of Service](/books/field-operations/proof-of-service)).
- **Receipt is a fact.** For goods, someone records receipt (what arrived, how much); for services, completion of the linked work order is the receipt. That record is the third leg of the match.

## Invoice Capture and Approval

Invoices arrive as PDFs by email, through vendor portals, as electronic invoices from catalog suppliers, and still on paper. Capture has three generations, all still in use: staff key invoices by hand; an outsourced team keys them as a service (outsourced AP firms and the suites' own services do this); and AI capture reads the invoice and predicts vendor, property and GL coding, which Entrata, RealPage, ResMan and AvidXchange all offer. ResMan's terms for its AI invoice service license customer data to the service provider and its vendor to create "Aggregated Data" in de-identified form, which is the kind of data-rights term worth reading before turning such a service on.

Whatever the capture method, the invoice becomes a **bill** and goes through the same checks:

- **Match.** A **two-way match** compares the invoice with the PO (vendor, items, prices); a **three-way match** adds the receipt or completed work order. Invoices within tolerance pass; others go to an exception queue. AvidXchange sells both modes; non-PO invoices (utilities, insurance, recurring contracts) are matched against contracts or prior bills instead.
- **Duplicate detection.** The same invoice arrives by email and by portal, or is resubmitted with a new number. The Payments model's unique (vendor, invoice number) catches the first case; the second needs fuzzy matching on amount, date and property.
- **Coding and allocation.** Each line is coded to a property and GL account, and an invoice that covers several properties is split by allocation into one bill per paying entity, for the reason above.
- **Approval routing.** Approvals follow the authority matrix and the owner's limits for that property, with approvals set "by property or unit" in AvidXchange's phrase. The person who entered the bill or changed the vendor's details can't approve it ([Vendor Payouts](/books/payments/vendor-payouts#how-to-build-it) enforces this in the approval transaction).
- **Owner chargebacks and markups.** On third-party managed properties, some vendor costs are rebilled to the owner with a markup set in the management agreement, and maintenance staff time is billed to the owner ([Resident Chargebacks](/books/property-tech/maintenance-and-work-orders#resident-chargebacks) covers what goes to residents). Owners & Management Agreements owns the fee terms; payables applies them.

## Paying Vendors

Paying the approved bill is a payout, and the Payments volume covers the rails: [enrollment and method choice](/books/payments/vendor-payouts#enrollment-and-method-choice), [virtual cards and who pays for the rebate](/books/payments/vendor-payouts#virtual-cards-who-pays-for-the-rebate), [checks](/books/payments/vendor-payouts#checks-are-still-here) (including uncashed checks that become unclaimed property), [funding](/books/payments/vendor-payouts#funding-whose-money-and-when), and [the payout state machine](/books/payments/vendor-payouts#a-payout-is-a-state-machine). The platforms offer the same three methods: Entrata's Bill Pay and AvidXchange both pay by virtual card, ACH or check, and both describe rebates on electronic payments as a feature.

What property adds:

- **The money is the owner's.** A vendor bill is paid from the owning entity's operating account, usually a trust account the manager controls (Trust Accounting & the General Ledger owns those accounts and their reconciliation). A payment run is therefore grouped by paying entity and bank account, and a bill can only be paid if that account holds enough of that owner's money. A manager who pays one owner's bills with another owner's cash has commingled trust funds, which is the classic trust accounting violation.
- **Rebates follow the money.** A virtual card rebate or a GPO rebate is earned on spending the owner funded. Whether the manager may keep it, must credit it to the owner, or shares it is a term of the management agreement that should be explicit and disclosed. My rule: record every rebate by the property and bill that generated it, so it can be credited or disclosed either way.
- **Who processes the payment matters.** When the software vendor or a subsidiary moves the money (Entrata's Bill Pay names "Entrata, Inc. or EntrataPay, LLC"), the owner's funds pass through a third party, which raises the [money transmission](/books/payments/becoming-a-payment-provider#holding-other-people-s-money) and trust account questions Collecting Rent and Trust Accounting & the General Ledger take up.
- **Tax reporting has two sides.** Vendors paid for services get Form 1099-NEC, now for payments of $2,000 or more for tax years beginning after 2025 (adjusted for inflation from 2027); payments to corporations are generally exempt except for legal services; and card payments are reported on Form 1099-K by the payment settlement entity, not by the payer. Separately, a property manager that collects rent for an owner must report the rent paid over to the owner on Form 1099-MISC, which Buildium's 1099 e-filing covers for "both property owners and vendors." The W-9, TIN matching and backup withholding mechanics are in [Tax: W-9s, TIN Matching and 1099s](/books/payments/vendor-payouts#tax-w-9s-tin-matching-and-1099s). The platform has to record which legal entity is the payer of record for each payment, because that's the entity whose name and TIN go on the form.

## Payment-Instruction Fraud

The fraud that costs payables the most doesn't hack a system; it asks politely. In **business email compromise** (BEC), a message that appears to come from a vendor, an owner or an executive asks to change where the next payment goes. The FBI's Internet Crime Complaint Center counted $55.5 billion in exposed losses across 305,033 BEC incidents worldwide from October 2013 to December 2023, and advises using "secondary channels and/or two-factor authentication to verify requests" for account changes. The Payments volume has the 2025 figures and the controls in [Stopping the Changed Bank Account](/books/payments/vendor-payouts#stopping-the-changed-bank-account).

Property management is exposed in specific ways. Managers pay many small vendors who email invoices from consumer accounts, so a lookalike address is easy to miss. Disbursements go out on behalf of clients, so a diverted payment is owed to the client either way. RealPage's 10-K for 2018 describes the pattern at a software vendor: in May 2018, a targeted phishing campaign led to a business email compromise that gave an outside party access to a system of a subsidiary acquired in 2017, and resulted in "the diversion of approximately $6.0 million, net of recovered funds," intended for disbursement to three of its clients. The company restored the funds to the client accounts, recorded the loss, and reported a material weakness in internal controls, remediated in the second quarter of 2018.

The controls, with the property-specific ones in bold:

- **Change of bank details is a workflow,** not a field edit: a request with its channel, an out-of-band callback to a contact already on file (never one supplied in the request), account validation, and a hold on the first payment to the new account, as [Vendor Payouts](/books/payments/vendor-payouts#stopping-the-changed-bank-account) describes. Vendor self-service in a portal (Entrata's Bill Pay pulls bank details from its vendor portal) moves the change to an authenticated channel, but the portal login then becomes the target, so the hold and notification to the prior contact still apply.
- **Separate duties** between the people who onboard vendors, change their details, approve bills and release payment runs.
- **Owners' instructions get the same treatment.** An owner's distribution account change (Owners & Management Agreements owns distributions) is the same attack aimed at the other side of the ledger, and needs the same callback and hold.
- **Watch for new-vendor patterns:** a new vendor whose bank account matches an employee's or another vendor's, invoices just under an approval limit, or a first invoice paid by rush ACH. These are rules over the payables data, with flags for a human.
- **Plan the recovery.** When a diversion is found, the IC3 advice is to contact the financial institution immediately to request a recall and file a complaint. The runbook names who calls the bank, who notifies the owner, and how the owner is made whole while recovery runs.

## How to Build It

These are deltas against [the core data model](/books/property-tech/property-business#the-core-data-model) and the Payments volume's payables tables in [Vendor Payouts](/books/payments/vendor-payouts#how-to-build-it). This volume's `vendors` table (scoped by `tenant_id`) plays the role of the Payments `vendors`, and bills, approvals, payment details and disbursements reuse the Payments tables with property and paying-entity columns added, rather than inventing a second invoice model.

```sql
ALTER TABLE vendors
  ADD COLUMN tax_classification  TEXT CHECK (tax_classification IN ('individual',
                                   'sole_proprietor', 'partnership', 'c_corporation',
                                   's_corporation', 'llc', 'other')),  -- from the W-9
  ADD COLUMN payment_hold        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN payment_hold_reason TEXT,               -- 'coi_expired', 'bank_change_pending'
  ADD COLUMN tin_token           TEXT,               -- vaulted; match result kept with it
  ADD COLUMN tin_match_status    TEXT;

CREATE TABLE vendor_requirements (       -- what an owner or property demands of vendors
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  owner_entity_id UUID REFERENCES legal_entities (id),   -- scope: an owner,
  property_id  UUID REFERENCES properties (id),          -- a property, or the whole tenant
  trade        TEXT,                                     -- null: applies to every trade
  kind         TEXT NOT NULL CHECK (kind IN ('general_liability', 'workers_comp',
                 'auto_liability', 'umbrella', 'trade_license', 'w9', 'background_check',
                 'ofac_screen', 'signed_agreement')),
  min_limits   JSONB,                                    -- per occurrence, aggregate
  additional_insured BOOLEAN NOT NULL DEFAULT FALSE,
  valid_during DATERANGE NOT NULL
);

CREATE TABLE vendor_documents (          -- evidence that a requirement is met
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  vendor_id    UUID NOT NULL REFERENCES vendors (id),
  kind         TEXT NOT NULL,                            -- same keys as vendor_requirements.kind
  issuer       TEXT,                                     -- insurer, licensing board, screener
  number       TEXT,
  limits       JSONB,
  jurisdiction TEXT,                                     -- ISO 3166-2 for a state license
  valid_during DATERANGE NOT NULL,
  file_id      UUID NOT NULL,
  verified_by  UUID,                                     -- user or credentialing service
  verified_at  TIMESTAMPTZ
);

CREATE TABLE bid_requests (
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  property_id  UUID NOT NULL REFERENCES properties (id),
  scope        TEXT NOT NULL,
  visibility   TEXT NOT NULL CHECK (visibility IN ('invited', 'public')),
  due_at       TIMESTAMPTZ NOT NULL,
  awarded_bid_id UUID,                                   -- set on award
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bids (
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id      UUID NOT NULL,
  bid_request_id UUID NOT NULL REFERENCES bid_requests (id),
  vendor_id      UUID NOT NULL REFERENCES vendors (id),
  amount         BIGINT NOT NULL,
  currency       CHAR(3) NOT NULL,
  submitted_at   TIMESTAMPTZ NOT NULL,
  file_id        UUID,
  UNIQUE (bid_request_id, vendor_id)
);

CREATE TABLE purchase_orders (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL,
  property_id     UUID NOT NULL REFERENCES properties (id),
  payer_entity_id UUID NOT NULL REFERENCES legal_entities (id),  -- whose money pays
  vendor_id       UUID NOT NULL REFERENCES vendors (id),
  work_order_id   UUID REFERENCES work_orders (id),
  bid_id          UUID REFERENCES bids (id),
  source          TEXT NOT NULL CHECK (source IN ('manual', 'punchout', 'catalog', 'bid',
                    'work_order')),
  status          TEXT NOT NULL CHECK (status IN ('draft', 'pending_approval', 'approved',
                    'sent', 'partially_received', 'received', 'closed', 'cancelled')),
  approved_under_emergency BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE purchase_order_lines (
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id         UUID NOT NULL,
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders (id),
  description       TEXT NOT NULL,
  supplier_part     TEXT,                              -- from the punchout cart
  quantity          NUMERIC(12, 3) NOT NULL,
  unit_price        BIGINT NOT NULL,                   -- minor units
  gl_account_id     UUID NOT NULL,                     -- Trust Accounting owns the chart
  received_quantity NUMERIC(12, 3) NOT NULL DEFAULT 0
);

-- Bills are the Payments volume's bills, one per paying entity and property.
ALTER TABLE bills
  ADD COLUMN tenant_id         UUID NOT NULL,
  ADD COLUMN property_id       UUID NOT NULL REFERENCES properties (id),
  ADD COLUMN payer_entity_id   UUID NOT NULL REFERENCES legal_entities (id),
  ADD COLUMN purchase_order_id UUID REFERENCES purchase_orders (id),
  ADD COLUMN work_order_id     UUID REFERENCES work_orders (id),
  ADD COLUMN capture_method    TEXT CHECK (capture_method IN ('keyed', 'outsourced_keying',
                                 'ai_capture', 'e_invoice', 'vendor_portal')),
  ADD COLUMN match_result      TEXT CHECK (match_result IN ('not_required', 'two_way',
                                 'three_way', 'exception')),
  ADD COLUMN split_from_document_id UUID;            -- the original multi-property invoice

CREATE TABLE bill_lines (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id     UUID NOT NULL,
  bill_id       UUID NOT NULL REFERENCES bills (id),
  po_line_id    UUID REFERENCES purchase_order_lines (id),
  gl_account_id UUID NOT NULL,
  amount        BIGINT NOT NULL,
  is_owner_rebill BOOLEAN NOT NULL DEFAULT FALSE,     -- rebilled to the owner under the agreement
  predicted     JSONB                                 -- AI capture's guess and confidence, kept
);

CREATE TABLE vendor_bank_change_requests (  -- the workflow that may add payment details
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id           UUID NOT NULL,
  vendor_id           UUID NOT NULL REFERENCES vendors (id),
  received_via        TEXT NOT NULL CHECK (received_via IN ('vendor_portal', 'email', 'phone',
                        'mail', 'staff')),
  requested_by        TEXT NOT NULL,                  -- as stated in the request
  callback_contact    TEXT,                           -- the contact on file that was called
  verified_by         UUID,                           -- the user who made the call
  verified_at         TIMESTAMPTZ,
  outcome             TEXT NOT NULL CHECK (outcome IN ('pending', 'verified', 'rejected',
                        'fraud_suspected')),
  payment_details_id  UUID REFERENCES vendor_payment_details (id),  -- the new row, once verified
  prior_contact_notified_at TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_rebates (           -- card and GPO rebates, traced to what earned them
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id    UUID NOT NULL,
  source       TEXT NOT NULL CHECK (source IN ('virtual_card', 'gpo', 'supplier')),
  bill_id      UUID REFERENCES bills (id),
  property_id  UUID NOT NULL REFERENCES properties (id),
  amount       BIGINT NOT NULL,
  currency     CHAR(3) NOT NULL,
  credited_to  TEXT NOT NULL CHECK (credited_to IN ('owner', 'manager', 'shared')),
  earned_on    DATE NOT NULL
);
```

Design notes:

- **Split invoices at capture.** A supplier invoice covering three owners' properties becomes three bills, each with its own `payer_entity_id`, linked by `split_from_document_id` to the original document. Payment runs group by paying entity and bank account, so trust funds never cross.
- **Compliance is a query, holds are a column.** A vendor is compliant for a property when every `vendor_requirements` row in scope on a date has a `vendor_documents` row covering it. A nightly job and every document change recompute it and set or clear `payment_hold` with a reason; the PO, approval and payment-release transactions all check it.
- **Keep the machine's guess.** `bill_lines.predicted` keeps what AI capture proposed beside what a person approved, so capture accuracy can be measured on your own invoices rather than a vendor's claim, and a miscoding can be traced.
- **Bank changes create rows, never edits.** A verified request adds a `vendor_payment_details` row (append-only in the Payments model) with its first-payment hold; a rejected or suspected one stays as evidence.
- **Approval limits are resolved, not hard-coded.** The approver check combines the operator's authority matrix with the owner's agreement limits for the property and records which limit applied.
- **Emit events.** `vendor.hold_placed`, `vendor.hold_released`, `purchase_order.approved`, `bill.exception`, `bill.approved` and `vendor.bank_change_verified` feed approvers' queues, owner reporting and fraud monitoring.

## Auditing

Payables records are evidence for owners auditing their manager, for trust account examinations, for IRS notices, for insurers after a vendor injury, and for any BEC investigation ([Audit Trails](/docs/architecture/audit-trails)):

- **Who was allowed to work.** Each vendor's compliance status for a property on a date, the documents behind it, and every hold placed and released.
- **Why each bill was paid.** The PO, receipt or completed work order, match result, approvals with the limits in force, and which paying entity and bank account funded it.
- **Every change of payment details.** The request, its channel, the callback, the verifier, the hold and the outcome, for vendors and for owners' distribution accounts.
- **Where rebates went.** Each rebate traced to the bills and property that earned it, and whether the owner was credited.
- **Tax reporting.** The payer of record, TIN match results, and 1099 totals rebuilt from disbursements.

## What This Means for the System You Build

- **Reuse the Payments payables model** for bills, approvals, payment details and disbursements, and add property and paying entity to every bill.
- **Never let one owner's money pay another's bill:** one PO and one bill per paying entity, and payment runs grouped by entity and bank account.
- **Make vendor compliance per property and enforce it at three gates** (assignment, approval, payment) with payment holds, not just a status badge.
- **Store owner and operator approval limits as data** and record which applied.
- **Match invoices two or three ways,** detect duplicates, and keep AI capture's predictions beside the approved coding.
- **Treat bank detail changes as a verified workflow** for vendors and owners alike, with callbacks, first-payment holds and separation of duties.
- **Record every rebate** against the spend that earned it and make its owner explicit.
- **Know the payer of record** for every payment, because it decides the 1099.

## References

**Regulators and law enforcement**

- [IRS: Instructions for Forms 1099-MISC and 1099-NEC](https://www.irs.gov/instructions/i1099mec), the $2,000 threshold for tax years after 2025, the corporate exemption and legal services exception, card payments on Form 1099-K, the January 31 deadline, property managers reporting rent paid over to owners
- [FBI IC3: Business Email Compromise, the $55 Billion Scam (September 2024)](https://www.ic3.gov/PSA/2024/PSA240911), exposed losses and incidents from October 2013 to December 2023, verifying account changes through secondary channels, requesting a recall
- [RealPage: Form 10-K for 2018](https://www.sec.gov/Archives/edgar/data/1286225/000128622519000007/rp-20181231x10k.htm), the May 2018 business email compromise, about $6.0 million diverted net of recoveries from disbursements to three clients, restored funds, insurance recovery and the remediated material weakness

**Specifications**

- [cXML](https://cxml.org/), the procurement document protocol and its PunchOut feature

**Platforms**

- [Entrata: Procure to Pay](https://www.entrata.com/products/procure-to-pay), punchout purchasing, invoice processing accuracy claim, VendorAccess, NetVendor compliance
- [Entrata: Homebody Rewards and Procure to Pay launch (October 16, 2024)](https://www.entrata.com/press/entrata-launches-homebody-rewards-and-procure-to-pay), millions of catalog items with real-time pricing, AI invoice processing
- [Entrata: Bill Pay](https://www.entrata.com/products/billpay), virtual card, ACH and check, bank details from the vendor portal, processing by Entrata or EntrataPay
- [RealPage: Spend Management](https://www.realpage.com/spend-management/), automated POs and approvals, spend against budget, invoice matching, managed catalog and eInvoicing, eSupply national vendor discounts
- [RealPage: Vendor Credentialing](https://www.realpage.com/vendor-credentialing/), insurance, licenses, W-9s and background checks, and that credentialing alone does not control spend
- [RealPage: Vendor Marketplace](https://www.realpage.com/vendor-marketplace/), bid requests, public bids and awards, free to property managers
- [RealPage: Lumina AI Suite (August 10, 2026)](https://www.realpage.com/news/realpage-introduces-lumina-ai-suite/), the AI Spend Agent's policy, vendor and contract checks
- [ResMan: Maintenance](https://www.myresman.com/solutions/maintenance/), purchase orders and inventory by unit, building and common area
- [ResMan: Combined terms and conditions (August 2026, PDF)](https://www.myresman.com/wp-content/uploads/2026/08/26.08.28-Residential-Combined-TCs-updated-by-legal.pdf), AI Invoice provided through a third-party vendor and the license to create aggregated, de-identified data
- [Buildium: 1099 e-Filing](https://www.buildium.com/features/1099-efiling/), 1099-MISC and 1099-NEC for owners and vendors, paper and digital copies
- [AvidXchange: AP automation for real estate](https://www.avidxchange.com/solutions/avidsuite-for-real-estate/), 2-way and 3-way matching, approvals by property or unit, virtual card, ACH and check, rebates, PMS integrations
- [NetVendor](https://www.netvendor.com/), credentialing, expiring and missing certificates, W-9, background checks, OFAC screening and TIN matching
- [IQ BackOffice: Real estate and property management](https://www.iqbackoffice.com/real-estate-and-property-management/), outsourced invoice processing and vendor payments for property managers
