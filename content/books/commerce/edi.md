+++
title = "EDI"
description = "X12 for retail: 850, 855, 856, 810, 846, 852, 860, 940 and 945, envelopes and acknowledgments, VANs and AS2, providers, GS1-128 and SSCC, partner testing."
category = "Commerce Industry"
order = 2336
part = "Wholesale and B2B"
tags = ["commerce", "edi", "x12", "wholesale", "gs1", "data-model"]
+++

Electronic data interchange is how retailers, distributors, brands and warehouses send each other business documents without a person retyping them: a purchase order, an acknowledgment, a ship notice, an invoice, a remittance, an inventory report. It predates the web, it runs on fixed standards with fixed codes, and it is not optional: Best Buy's inbound guide states that EDI is required under its vendor agreement and that the mandatory documents "must be in production prior to the first PO being cut." A brand that sells to big-box retail lives in EDI the way a direct-to-consumer brand lives in its storefront.

The documents are simple; the integration is not. Each trading partner publishes its own implementation guide for each document (which segments, which codes, which version), each expects acknowledgments inside a deadline, each charges for mistakes, and each document is evidence in a later deduction dispute ([Deductions and Disputes](/books/commerce/wholesale-and-retail-distribution#deductions-and-disputes)). This chapter covers the X12 transactions retail commerce uses, how an interchange is built and acknowledged, versions, transport (VANs, AS2, SFTP, APIs), the EDI providers, ship notices and GS1-128 carton labels, and testing with partners. It extends `documents` from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model). The business loop the documents serve is [Wholesale & Retail Distribution](/books/commerce/wholesale-and-retail-distribution#the-order-to-cash-loop); warehouse messages (940, 945, 943, 944, 947) are introduced in [Integrating With a 3PL](/books/commerce/warehouses-and-3pls#integrating-with-a-3pl); receiving against ASNs from your own suppliers is [Receiving and ASNs](/books/commerce/purchasing-and-replenishment#receiving-and-asns).

## How the Providers Do It

As of October 2026, from the providers' own pages and filings:

| Provider | Model | Scale, as published | Pricing, as published |
| --- | --- | --- | --- |
| **SPS Commerce** | Full-service retail EDI network: maps, connections and testing per trading partner, plus analytics and revenue recovery | $751.5 million 2025 revenue, 96% from about 54,600 recurring revenue customers; a network of "thousands of trading partners" | Not published; set-up fees "specific for each connection a customer has with a trading partner" |
| **TrueCommerce** | Supply chain integration platform "powered by EDI, AI, and modern API capabilities"; acquired DiCentral in 2021 | DiCentral brought 160,000 connections and about 18,000 customers | Not published |
| **Orderful** | API-first EDI: send JSON, receive X12, or the reverse | "Connect once to transact with any partner" | Not published |
| **OpenText Trading Grid** | A value-added network (VAN) with AS2, SFTP and HTTPS, X12 and EDIFACT | Over a million trading partners, by the vendor's account | Not published |
| **Direct AS2** | The brand runs its own AS2 endpoint and maps | Partner by partner | Software and staff time |

Three patterns:

- **The unit of work is the connection.** Every provider prices, maps and tests per trading partner, because each partner's guide differs. SPS's set-up fees are per connection; a brand adding a retailer adds a connection, not a feature.
- **Networks sell reach, APIs sell developer time.** SPS and VANs reach retailers already connected to them; Orderful and similar services turn X12 into JSON so a brand's engineers never parse segments. Both still need the partner's implementation guide met exactly.
- **The provider is in the evidence chain.** When a retailer says an ASN arrived late, the provider's transmission log and the partner's acknowledgment are the proof, so the brand keeps both, not just the business data.

## The Transactions

X12 numbers its transaction sets and names them exactly; the sets retail commerce uses, with their official names:

| Set | Name | Direction (brand selling to a retailer) | What it carries |
| --- | --- | --- | --- |
| **850** | Purchase Order | Retailer to brand | Items, quantities, costs, ship-to, dates, terms |
| **855** | Purchase Order Acknowledgment | Brand to retailer | Accept, change or reject each line |
| **860** | Purchase Order Change Request - Buyer Initiated | Retailer to brand | A quantity, date or line change after the 850 |
| **865** | Purchase Order Change Acknowledgment/Request - Seller Initiated | Brand to retailer | The answer to an 860, or the brand's own change request |
| **753** | Request for Routing Instructions | Brand to retailer | Ready goods, weight, cube, asking for a carrier |
| **754** | Routing Instructions | Retailer to brand | Carrier, pickup and appointment |
| **856** | Ship Notice/Manifest | Brand to retailer | What shipped, how packed, on which truck: the ASN |
| **810** | Invoice | Brand to retailer | What is billed for a shipment |
| **820** | Payment Order/Remittance Advice | Retailer to brand | What was paid against which invoices, net of deductions |
| **824** | Application Advice | Retailer to brand | A document accepted or rejected by the retailer's application, with errors |
| **832** | Price/Sales Catalog | Brand to retailer | Items, costs and attributes |
| **846** | Inventory Inquiry/Advice | Either | Stock available, by item and location |
| **852** | Product Activity Data | Retailer to brand | Units sold and on hand by store and period |
| **940** | Warehouse Shipping Order | Brand to its warehouse | Ship this order ([Integrating With a 3PL](/books/commerce/warehouses-and-3pls#integrating-with-a-3pl)) |
| **945** | Warehouse Shipping Advice | Warehouse to brand | Shipped, with what |
| **997** | Functional Acknowledgment | Every receiver | The group was received and parsed, accepted or rejected |
| **999** | Implementation Acknowledgment | Every receiver | The same, with errors against the implementation guide |

The same documents, seen from the retailer, are the core model's [selling order versus purchase order](/books/commerce/commerce-business#the-core-data-model) split: the 850 is the retailer's purchase order and the brand's order. Outside North America, retail uses UN/EDIFACT, where the purchase order is ORDERS, the despatch advice (ship notice) DESADV and the invoice INVOIC; the concepts map one to one.

**The 856 is the hard one.** It describes a shipment as a hierarchy: the shipment (carrier, bill of lading, ship date), the orders on it, the packs (pallets and cartons, each with its SSCC), and the items in each pack with quantities. A retailer's dock scans a carton's label, looks up its SSCC in the ASN, and receives its contents without opening it. If the ASN says carton 7 holds 24 units of item A and it holds 24 of item B, the receipt is wrong, the invoice won't match, and a chargeback or shortage deduction follows. Best Buy wants an ASN "for every shipment," one per pallet for LTL and one per package for parcel, arriving before the truck enters the yard, on X12 version 4030.

## Envelopes and Acknowledgments

An X12 transmission nests three envelopes:

- **Interchange (ISA ... IEA).** Who sent it to whom, when, with the **interchange control number** (ISA13, nine digits, "assigned by the interchange sender") and the **usage indicator** (ISA15): `P` for production, `T` for test, `I` for information.
- **Functional group (GS ... GE).** A batch of one kind of transaction (all the 856s), with a group control number and the X12 version.
- **Transaction set (ST ... SE).** One document (one 856), with its own control number and segment count.

An illustrative 850, trimmed:

```text
ISA*00*          *00*          *ZZ*RETAILERID     *ZZ*BRANDID        *261028*1405*U*00401*000004213*0*P*>~
GS*PO*RETAILERID*BRANDID*20261028*1405*4213*X*004010~
ST*850*0001~
BEG*00*SA*4500123456**20261028~
DTM*002*20261110~
N1*ST*DISTRIBUTION CENTER 6094*92*6094~
PO1*1*1200*EA*19.80**UP*012345678905*VN*ZG-SP-17~
CTT*1~
SE*7*0001~
GE*1*4213~
IEA*1*000004213~
```

Acknowledgments come in two layers:

- **997 or 999** (technical): the receiver's translator received the group and it parsed. A partner sends one or the other per group; the 999 adds detail against the implementation guide. Best Buy requires a 997 within 24 hours.
- **824 Application Advice** or an 855 (business): the receiver's application accepted the document's content, or rejected it with reasons (unknown item, PO closed, cost mismatch).

Rules for handling them:

- **Control numbers make receipt idempotent.** An interchange with an ISA13 already processed from the same sender is a duplicate; process once, acknowledge again. Outbound control numbers are sequential per partner and never reused.
- **An unacknowledged document isn't sent.** A 856 without a 997 inside the partner's window is treated as lost and resent (or escalated), because the retailer will charge as if it never arrived.
- **A rejection is an incident.** A 997 rejecting a group, or an 824 rejecting a document, opens a task with the error and the document, before the chargeback does.

## Versions

X12 publishes a new release every year (008040 in January 2023, 008050 in 2024, 008060 in February 2025, 008070 in March 2026), but retail runs years behind: partners pin the version in their implementation guide, and older versions such as 004010, 004030 and 005010 remain common. Best Buy's ASN is 4030; Target is described by EDI vendors as using 5010. The version is per partner per document, recorded on the partner map, and a version change is a project with testing, like any partner change.

## Transport: VANs, AS2, SFTP and APIs

How the bytes move:

- **Value-added network (VAN).** A mailbox service that both partners connect to; the sender drops an interchange in, the network routes it to the receiver's mailbox. VANs traditionally bill per kilocharacter (1,000 characters, delimiters and spaces included); an EDI provider's example prices 250 kilocharacters at $0.20 each for $50. No major VAN publishes a rate card.
- **AS2** (RFC 4130). Point-to-point over HTTP, with the payload signed and encrypted and a **message disposition notification** (MDN) as "The Internet messaging format used to convey a receipt," signed for non-repudiation. A synchronous MDN comes back in the HTTP response; an asynchronous one is posted to a URL the sender gave. Large retailers commonly require AS2 for direct connections.
- **SFTP.** Files dropped on a server, polled by the partner; simpler, with no built-in receipt, so the 997 does all the work.
- **APIs.** Providers such as Orderful expose an endpoint that "will convert JSON into X12, or X12 into JSON," so the brand integrates once over HTTPS and the provider handles each partner's transport and format.

The transport receipt (the MDN, the VAN's delivery log) proves delivery to the partner's door; the 997 proves the partner's translator accepted it; the 824 or 855 proves the application did. Disputes need all three, timestamped.

## Ship Notices and Carton Labels

A ship notice is only as good as the labels it describes. Each carton and pallet carries a **GS1-128 logistics label** whose key is the **Serial Shipping Container Code** (SSCC):

- **The SSCC** is "an 18 digit number and contains your GS1 Company prefix": an extension digit, the company prefix, a serial reference, and a check digit calculated over the previous 17 digits. It "can only be shown in a GS1-128 barcode," where Application Identifier (00) always denotes it. GS1 allows an SSCC to be reused a year after it was last used; Best Buy forbids reuse within a rolling 18 months.
- **The label layout** has a top section of free text (sender, receiver), a middle section with the SSCC and other data in human-readable form, and a bottom section of barcodes, where "The SSCC should always be shown in the lowest barcode." Retailer guides add the ship-to postal code (AI 420), the PO number and the carton count, and fix the label's size and position on the carton.
- **GTINs** identify what is inside: the consumer unit, the inner pack and the case each have their own. GS1 US licenses a company prefix by capacity: a single GTIN for $30; prefixes for 10 GTINs at $250 plus $50 a year, 100 at $750 plus $150, 1,000 at $2,500 plus $500, 10,000 at $6,500 plus $1,300 and 100,000 at $10,500 plus $2,100.

### GS1-128 Labels and SSCC

The system rules that follow:

- **The SSCC is allocated by the brand's system,** from its company prefix, with a serial counter that never repeats inside the strictest partner's window, and recorded against the pack in the shipment before the label prints.
- **The label and the ASN come from the same record.** Printing labels from the warehouse system and building the 856 from the order system is how they come to disagree; both read the pack records ([Packages](/books/commerce/shipping-and-carriers#how-to-build-it) holds the cartons).
- **Scan to verify.** A label is scanned at pack-out to confirm it reads and matches the pack record; the scan is the evidence in a label chargeback dispute.

## Partner Testing

Before production, each document is tested with each partner. Best Buy coordinates testing for all transmission types with its EDI team before the first PO; EDI providers describe retailer onboarding as connect, map to the retailer's specification, test and certify each document, then cut over to production. The mechanics:

- **Test interchanges carry `T` in ISA15,** and some partners require a separate test sender ID, so test and production traffic can't be confused on either side.
- **Each document has test cases** from the partner's guide: a normal PO, a PO with a change, a multi-pallet ASN, a partial shipment, an invoice with allowances. The partner checks each against its guide and returns errors, usually as 997s, 824s or a scorecard.
- **Certification is per document.** A brand certified for 850, 855 and 810 but not 856 isn't ready to ship.
- **Production starts watched.** The first weeks of production documents are checked by a person before sending, because the retailer's compliance clock starts with the first real PO.
- **Testing never ends.** A partner's guide change, a version upgrade, a new distribution center or a new warehouse is a retest of the affected documents.

Partner maps are configuration, not code: the segments, qualifiers, codes and version each partner expects, per document and direction, versioned with effective dates, so a guide change is a new map version tested before it is activated.

## How to Build It

`documents` already stores each business document as exchanged, with its kind, direction, counterparty, number and content reference. This chapter adds the interchanges that carry them, the maps that translate them, and the acknowledgments that prove them:

```sql
ALTER TABLE documents
  ADD COLUMN transaction_set   TEXT,         -- '850', '856', 'DESADV'
  ADD COLUMN interchange_id    UUID,         -- edi_interchanges, below
  ADD COLUMN st_control        TEXT,         -- transaction set control number
  ADD COLUMN business_status   TEXT CHECK (business_status IN ('pending', 'accepted',
                                 'accepted_with_changes', 'rejected')),  -- from 855 or 824
  ADD COLUMN parsed            JSONB;        -- the canonical parsed form

CREATE TABLE edi_partner_maps (          -- how one partner wants one document, versioned
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  trading_partner_id UUID NOT NULL REFERENCES trading_partners (id),
  transaction_set  TEXT NOT NULL,
  direction        TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  x12_version      TEXT NOT NULL,        -- '004010', '004030', '005010'
  sender_id        TEXT NOT NULL,        -- ISA06 qualifier and ID
  receiver_id      TEXT NOT NULL,
  transport        TEXT NOT NULL CHECK (transport IN ('as2', 'van', 'sftp', 'api')),
  ack_required     TEXT NOT NULL CHECK (ack_required IN ('997', '999', 'none')),
  ack_due          INTERVAL NOT NULL DEFAULT '24 hours',
  spec_ref         TEXT NOT NULL,        -- the partner's implementation guide version
  mapping          JSONB NOT NULL,       -- segment rules, qualifiers, code lists
  status           TEXT NOT NULL CHECK (status IN ('draft', 'testing', 'certified',
                     'production', 'retired')),
  valid_during     TSTZRANGE NOT NULL,
  UNIQUE (trading_partner_id, transaction_set, direction, valid_during)
);

CREATE TABLE edi_interchanges (          -- one ISA envelope, as sent or received
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  trading_partner_id UUID NOT NULL REFERENCES trading_partners (id),
  direction        TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sender_id        TEXT NOT NULL,
  receiver_id      TEXT NOT NULL,
  isa_control      CHAR(9) NOT NULL,     -- ISA13
  usage            CHAR(1) NOT NULL CHECK (usage IN ('P', 'T', 'I')),  -- ISA15
  transport        TEXT NOT NULL,
  transport_receipt TEXT,                -- AS2 MDN or VAN delivery reference
  content_ref      TEXT NOT NULL,        -- the bytes, in object storage
  received_or_sent_at TIMESTAMPTZ NOT NULL,
  status           TEXT NOT NULL CHECK (status IN ('received', 'parsed', 'failed',
                     'sent', 'delivered', 'acknowledged', 'rejected', 'duplicate')),
  UNIQUE (direction, sender_id, receiver_id, isa_control)  -- duplicates caught here
);

CREATE TABLE functional_acks (           -- 997 or 999 for each functional group
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  interchange_id   UUID NOT NULL REFERENCES edi_interchanges (id),  -- the group acknowledged
  gs_control       TEXT NOT NULL,
  kind             CHAR(3) NOT NULL CHECK (kind IN ('997', '999')),
  ack_interchange_id UUID REFERENCES edi_interchanges (id),  -- the interchange that carried it
  result           TEXT NOT NULL CHECK (result IN ('accepted', 'accepted_with_errors',
                     'partially_accepted', 'rejected')),
  errors           JSONB,                -- segment and element errors
  due_at           TIMESTAMPTZ NOT NULL, -- from the map's ack_due
  received_at      TIMESTAMPTZ,
  UNIQUE (interchange_id, gs_control)
);

CREATE TABLE sscc_allocations (          -- every SSCC issued, never reused inside the window
  sscc             CHAR(18) PRIMARY KEY,
  company_prefix   TEXT NOT NULL,
  package_id       UUID NOT NULL REFERENCES packages (id),  -- the carton or pallet
  shipment_id      UUID REFERENCES shipments (id),
  allocated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  label_scanned_at TIMESTAMPTZ           -- pack-out verification
);
```

A watcher finds documents at risk before the partner does:

```sql
-- Outbound groups whose acknowledgment is overdue:
SELECT i.trading_partner_id, i.isa_control, a.gs_control, a.due_at
FROM functional_acks a
JOIN edi_interchanges i ON i.id = a.interchange_id
WHERE i.direction = 'outbound'
  AND i.usage = 'P'
  AND a.received_at IS NULL
  AND a.due_at < NOW();
```

Design notes:

- **Bytes first, parse second.** Every inbound interchange is stored as received before parsing, so a parse failure loses nothing and the original is the evidence; the parsed form goes to `documents.parsed` and the owning tables (an 850 to `orders`, an 820 to `remittances`).
- **Duplicates fail on the envelope.** The unique key on sender, receiver and ISA13 rejects a resent interchange at insert; the handler acknowledges again without reprocessing ([Consumers Are Idempotent](/docs/architecture/events#consumers-are-idempotent)).
- **Maps are versioned like rules.** A partner's guide change is a new `edi_partner_maps` row tested under `usage = 'T'` and moved to production on a date ([Effective Dates and Versions](/docs/architecture/rules-as-data#effective-dates-and-versions)).
- **One record for label and ASN.** `sscc_allocations` ties each SSCC to the package the label was printed for and the shipment the 856 describes.
- **Events:** `edi.interchange_received`, `edi.parse_failed`, `edi.document_sent`, `edi.ack_received`, `edi.ack_overdue` and `edi.document_rejected` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the order system, the warehouse and the operations queue.

## Auditing

- **Every interchange as exchanged,** with its control numbers, transport receipt and timestamps, for the life of any deduction it could support.
- **Every acknowledgment,** with when it was due and when it arrived, so "your ASN was late" can be answered with the 997's time.
- **Every partner map version,** with its implementation guide reference and certification dates.
- **Every SSCC issued,** with its package, shipment and label scan.

## What This Means for the System You Build

- **Store every interchange's bytes before parsing,** and parse into the core tables from there.
- **Key inbound interchanges on sender, receiver and control number** so duplicates are caught at the envelope.
- **Track acknowledgments with due times,** and alert before the partner's window closes.
- **Hold partner maps as versioned configuration** per document, direction and version, tested under the test usage indicator before production.
- **Build labels and ASNs from the same pack records,** with SSCCs allocated once and verified by scan at pack-out.
- **Keep transport receipts, 997s and 824s together** as the evidence chain for disputes.
- **Choose a network, a provider API or direct AS2 per partner,** knowing the per-connection cost dominates.

## References

**Standards**

- [X12: Transaction sets](https://x12.org/products/transaction-sets), the official names of the 753, 754, 810, 820, 824, 832, 846, 850, 852, 855, 856, 860, 865, 940, 945, 997 and 999
- [X12: Release schedule](https://x12.org/news-and-events/release-schedule), annual releases through 008070
- [Stedi: X12 ISA segment](https://www.stedi.com/edi/x12/segment/ISA), the interchange header and ISA13 control number
- [Stedi: X12 element I14, usage indicator](https://www.stedi.com/edi/x12/element/I14), production, test and information values
- [Grupo Seres: EDI documents ORDERS, DESADV, RECADV, INVOIC](https://blog.groupseres.com/en/list-of-edi-documents-orders-desadv-recadv-invoic), the EDIFACT purchase order, despatch advice and invoice
- [RFC 4130: AS2](https://www.rfc-editor.org/rfc/rfc4130), signed and encrypted transfer over HTTP, MDNs and synchronous and asynchronous receipts
- [GS1 UK: Logistics labels and SSCCs (how-to guide)](https://www.gs1my.org/sites/default/files/94702_howtoguideslogistics-labels-and-ssccs_0315_fv.pdf), SSCC structure, AI (00), reuse after a year and the label layout
- [GS1 US: Get UPC barcodes](https://www.gs1us.org/upcs-barcodes-prefixes/how-to-get-a-upc-barcode/get-upc-barcodes), company prefix and single GTIN fees

**Retailer requirements**

- [Best Buy: US DDC Inbound Shipping Guide (October 2026)](https://partners.bestbuy.com/documents/20126/70924/US-DDC-Inbound-Shipping-Guide.pdf/ed16b9de-fcca-db75-fdf4-f223fe706d9b), mandatory documents before the first PO, the 997 in 24 hours, the 4030 ASN for every shipment, SSCC reuse and testing with the EDI team
- [Orderful: Target EDI requirements](https://orderful.com/blog/target-edi-requirements), Target's documents and version as an EDI vendor describes them
- [SPS Commerce: DigiKey SSCC-18 label quick reference](https://community.spscommerce.com/wp-content/uploads/2023/12/DigiKey-SPS-SSCC-18-Label-Quick-Reference.pdf), a partner label with AI 420 ship-to postal code

**Providers**

- [SPS Commerce: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1092699/000109269926000012/spsc-20251231.htm), revenue, recurring revenue customers, products, the trading partner network and per-connection set-up fees
- [TrueCommerce](https://www.truecommerce.com/), the platform's description
- [TrueCommerce: Acquires DiCentral](https://www.truecommerce.com/press-release/truecommerce-acquires-dicentral/), the 2021 acquisition, connections and customers
- [Orderful: Developer documentation](https://docs.orderful.com/), JSON to X12 conversion and connecting once
- [Orderful: Separate test ISA IDs](https://support.orderful.com/en/articles/13802240-how-to-get-a-separate-test-isa-id-for-testing-edi-transactions), test sender IDs
- [Orderful: EDI transaction fees explained](https://www.orderful.com/blog/edi-transaction-fees-explained), kilocharacter billing and its example
- [ERP Research: OpenText Trading Grid](https://www.erpresearch.com/erp-add-ons/edi/opentext-trading-grid), the VAN's protocols, standards and network size
- [TrueCommerce: How to read a 997/999](https://help.truecommerce.com/en/articles/5083010-transaction-manager-how-to-read-a-997-999-functional-acknowledgment), functional and implementation acknowledgments
- [Stacksync: True Value via SPS Commerce](https://www.stacksync.com/edi/true-value/true-value-retail-via-sps-commerce), retailer onboarding steps through an EDI network
