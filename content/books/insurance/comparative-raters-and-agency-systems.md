+++
title = "Comparative Raters & Agency Systems"
nav_title = "Raters & Agency Systems"
description = "Comparative raters, bridging to carrier portals, prefill, Ivans and AL3 downloads, agency management systems, and the carrier APIs agents quote and bind on."
category = "Insurance Industry"
order = 2717
part = "Distribution"
tags = ["insurance", "distribution", "integrations", "agency-management", "rating"]
+++

An independent agent's day runs on two systems the carrier doesn't own. The **comparative rater** takes a customer's details once and returns prices from many carriers side by side, then hands the chosen quote to that carrier to bind. The **agency management system** (AMS) is the agency's book: clients, policies, activities, commissions and the premium trust account, kept current by **downloads** of policy, claim, commission and document data from every carrier the agency represents. Between them run the integrations a carrier has to support to be sold at all: rating requests from raters, a bridge into its own quoting portal, prefill from data vendors, and a nightly or real-time feed back to the agency.

A carrier that wants independent agents to sell its products competes inside these systems, and a carrier's integration quality shows up as quote volume. An agency evaluates carriers through them, and a broker or MGA builds on them. This chapter surveys the vendors as of November 2026, then covers how comparative rating and bridging work, prefill, downloads (Ivans and ACORD AL3), the AMS, and the quote and bind APIs that are replacing portal bridges. It extends `quotes` and `producers` from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) with `rater_requests` and `downloads`; how a carrier computes the price behind each response is How a Rate Is Built.

## How the Platforms Do It

As of November 2026, from each vendor's own pages and filings (their figures, undated unless shown):

| Vendor | Owner | Products | What the vendor says |
| --- | --- | --- | --- |
| **Applied Systems** | Not stated on its site | Applied Epic (AMS), EZLynx (rater and AMS), Ivans (carrier-to-agency connectivity), Epic Quotes Commercial Lines (formerly Tarmika) | Applied Epic powers "9 of the top 10 largest U.S. insurance brokerages" (September 2026); EZLynx's rater reaches over 330 carriers in 48 states |
| **Vertafore** | Roper Technologies (about $5.4B, 2020) | AMS360, Sagitta, QQCatalyst (AMS), PL Rating, AgencyZoom (sales automation), ImageRight, Sircon | 98 of the top 100 agencies, 96 of the top 100 carriers, 200 million+ annual rating transactions |
| **Zywave** | Not stated on its site | TurboRater (personal lines rater), Agency Matrix AMS, MGA Hub, cyber and enterprise quoting APIs | 1,000+ live carrier connections |
| **HawkSoft** | Independently owned | AMS for independent agencies since 1995, and a rater | "Thousands of agencies" |
| **Bold Penguin** | Not stated on its site | Commercial lines digital exchange (DeX ai) | 735,000+ submissions a year, $12.45B of facilitated premium over the trailing twelve months |
| **Semsee** | Whole Co Services, a licensed producer | Small commercial (BOP) appetite, quote and bind | 46 carriers shown |
| **Ivans** | Applied Systems | Policy, claims, commission and document downloads; Ivans Distribution Platform API | "Thousands of agencies, carriers and MGAs" |

The market has consolidated into two large agency software groups (Applied and Vertafore), each with an AMS, a personal lines rater and a carrier connectivity layer, plus specialists for commercial quoting. For a carrier that means a short list of integrations reaches most independent agents, and each is a contract and an engineering project.

## How Comparative Rating Works

EZLynx describes the flow most personal lines raters share: the agent enters the risk once, gets "real-time quotes from multiple carriers with just one entry," then **bridges** to the carrier's site to bind and issue. Underneath, each request runs a pipeline the carrier has to support:

1. **Common data entry.** The rater collects one superset of fields (drivers, vehicles, prior insurance, dwelling characteristics, coverages wanted), prefilled where possible.
2. **Mapping to each carrier.** The rater translates the common fields into each carrier's rating inputs: its own codes for vehicle use, prior carrier, construction type, territory. A carrier that needs a question the rater doesn't ask either gets a default or returns an incomplete quote.
3. **Rating.** The carrier's rating runs against its filed rates for the state and date, and returns a premium, the coverages priced, any eligibility messages and a quote reference.
4. **Comparison.** The rater shows the results side by side; the agent picks one.
5. **Bridge.** The rater passes the quote, with the carrier's quote reference and the data entered, to the carrier's own portal, where the agent completes underwriting questions, binds, takes payment and issues.

What makes this hard for a carrier is that the rater's quote is a promise. If the carrier's portal, after the bridge, comes back with a different price because it ordered a consumer report the rater's call didn't, or because the rater mapped a field differently, the agent loses trust in the carrier's rater quotes. Three rules follow:

- **Rate from the same engine and the same version.** The rater response and the portal quote run through the same rating service, the same product version and the same rating worksheet, so a difference is explained by a changed input, never by a different calculation ([The Core Data Model](/books/insurance/insurance-business#the-core-data-model) keeps the worksheet on every quote).
- **Say what was assumed.** A rater response states which inputs were defaulted and which reports were (or weren't) ordered, so the agent knows which quotes are firm.
- **Make the bridge idempotent and stateful.** The bridge carries the quote reference; opening it twice resumes the same quote rather than starting a new submission ([Idempotency](/docs/requests/idempotency)).

Commercial lines are different enough to need their own tools. Small commercial (BOP, workers' compensation, general liability) has class codes, appetite rules and underwriting questions that vary by carrier, so the commercial raters (Epic Quotes Commercial Lines, Bold Penguin, Semsee) add an **appetite** step before rating: which carriers will write this class in this state at all. Applied notes that its commercial quoting requires the agency's direct appointments with each carrier, a reminder that a rater is software, not a market access agreement.

## Prefill

Prefill fills the rater's form from data vendors so the agent doesn't type, and so the carrier rates on verified facts. EZLynx lists LexisNexis, Fenris, MSB and Google Maps as prefill sources for drivers, vehicles and building data. Every prefill call is a data pull with rules of its own: driver and vehicle data drawn from consumer reporting agencies needs a permissible purpose under the FCRA, building data comes under the vendor's license, and what was prefilled versus entered matters if the application later turns out wrong. Consumer Reports & Third-Party Data owns the law; for the integration, store each prefill call with its vendor, request, response and which fields the agent then changed, so the quote's inputs carry their provenance.

## Downloads

Once a policy is bound, the agency needs it in its own system, and so do every endorsement, renewal, cancellation, claim, commission and document after that. Ivans, now part of Applied, moves that data from carriers and MGAs into agency management systems:

| Download | What it carries |
| --- | --- |
| **Policy download** | Policy and transaction data for commercial lines (agricultural package, auto, BOP, crime, general liability, inland marine, property, umbrella, workers' compensation) and personal lines (auto, dwelling fire, flood, homeowners, inland marine, mobile home, package, umbrella, watercraft) |
| **Claims download** | "Claims adjustments, settlement information and incoming claims" |
| **Direct Bill Commission Statement (DBCS)** | The carrier's commission statement, for monthly reconciliation ([Commission Statements and Downloads](/books/insurance/commissions-and-agency-accounting#commission-statements-and-downloads)) |
| **eDocs and messages** | Declarations pages, notices, alerts, surety bonds |

Ivans says the data lands "directly into your management system," and offers Ivans Exchange, "a complimentary online tool," for agencies to track their download connections. Its developer portal exposes the same content as APIs: an Ivans Download API for eDocs, commission statements and policy download, translation APIs (commission, policy, claims and eDoc), an Exchange API in JSON, and a Bookroll API.

The format most of this traffic was built on is ACORD's AL3, a batch standard for policy and commission data that carriers generate and agency systems parse; ACORD's own pages describing AL3 couldn't be opened for this chapter, so I describe it only at that level. <!-- source-gap: acord-al3 | missing | ACORD AL3 as a one-way batch format still carrying much download traffic; its record structure | closes with: an ACORD standards page or published AL3 specification excerpt (acord.org returned 403) | checked: 2026-11-09 --> ACORD & Data Standards covers ACORD's XML and newer standards.

What a carrier has to get right in its downloads:

- **Every transaction, in order, once.** A download is a stream of policy transactions with their effective and processed dates; an endorsement sent twice or a cancellation sent before the endorsement it follows breaks the agency's copy. Send stable transaction identifiers, so the agency side can be idempotent.
- **The agency's identifiers.** The producer code the carrier knows the agency by, and the policy number as the agency recorded it at bind (which may be a quote number until issuance).
- **Out-of-sequence changes as replays.** When a backdated endorsement changes later transactions (Endorsements, Renewals & the Policy Transaction Model), the download must carry the reversal and replay, not only the new state, or the agency's commissions and the carrier's DBCS disagree.

A **book roll** (moving an agency's block of policies from one carrier to another at renewal) is the download problem in reverse: the agency sends its book to the new carrier to be quoted and rewritten. Travelers lists book rolls among its production incentives, and Ivans offers a Bookroll API.

## Agency Management Systems

The AMS is the agency's system of record, and the carrier's integrations exist to keep it right. What it holds:

- **Clients and policies** across every carrier, with the downloads applied, the agency's own notes and the producer and service representative on each account.
- **Activities and workflows**: renewals coming up, certificates to issue, documents to send, claims to follow.
- **Accounting**: agency bill invoices and the account current to each carrier, direct bill commission reconciliation, the premium trust account, producer splits ([Commissions & Agency Accounting](/books/insurance/commissions-and-agency-accounting)).
- **Compliance records**: producer licenses and appointments for the agency's staff, compensation disclosures, E&O documentation.

Applied Epic and Vertafore's AMS360 and Sagitta serve larger agencies and brokers; QQCatalyst, HawkSoft, EZLynx's management system and Zywave's Agency Matrix serve smaller ones. For a carrier, the AMS is a destination, not a source: the carrier's own records are authoritative for its policies, and an agency's AMS reconciles to them through downloads and statements.

## Quote and Bind APIs

Portal bridges are giving way to APIs that let a rater, an AMS or a partner's own software quote and bind directly. Ivans' Distribution Platform API lists endpoints for appetite, submission, bind and refer, NAICS and class code lookups and VIN lookup; Zywave lists an enterprise quoting API; Root's 10-K describes a "fully integrated embedded product utilized with some partners, such as Carvana"; and Lemonade's 10-K claims that "AI Maya and our APIs sell 98% of Lemonade's policies." The shape is the same everywhere, because the insurance lifecycle is:

| Call | What it does | What the carrier must store |
| --- | --- | --- |
| **Appetite** | Will we write this class, state and size at all | The appetite rules version that answered |
| **Quote** | Rate a submission; return premium, coverages, eligibility messages and an expiry | The submission, the quote, the product version and the full rating worksheet |
| **Refer** | Hand a quote outside authority to an underwriter | The referral with its reason (Underwriting Rules, Referrals & Models) |
| **Bind** | Accept a quote, take payment details, bind coverage at a stated effective time | The binder, the producer's license and appointment check, the payment, an idempotency key |
| **Issue and documents** | Return the policy number, declarations and ID cards | Documents as rendered, with delivery proof |
| **Service** | Endorse, cancel, renew | Policy transactions, like any other channel |

API design is the playbook's ([Idempotency](/docs/requests/idempotency), [Webhooks](/docs/api-design/webhooks), [Versioning](/docs/api-design/versioning)); the insurance twist is that a quote is a priced offer under a filed rate on a date, so it carries an expiry and a product version, and binding after the rate changes must either honor the quoted rate (if the filing allows the quote's date to govern) or re-rate and say so. The partner calling the API is a producer or a distribution partner, so every bind still passes the license check for whoever is selling ([Checking Before You Bind and Pay](/books/insurance/producer-licensing#checking-before-you-bind-and-pay)).

## How to Build It

Each rater call is a request with its mapping and response; each download is a batch with items matched to transactions:

```sql
CREATE TABLE carrier_connections (         -- an integration with a rater, AMS or partner
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  counterparty       TEXT NOT NULL,         -- 'ezlynx', 'pl_rating', 'turborater', 'ivans',
                                            -- 'bold_penguin', 'partner:<name>'
  kind               TEXT NOT NULL CHECK (kind IN ('rater', 'download', 'quote_bind_api',
                       'bookroll')),
  mapping_version    TEXT NOT NULL,         -- the field mapping in force
  status             TEXT NOT NULL CHECK (status IN ('testing', 'live', 'paused', 'retired')),
  valid_during       TSTZRANGE NOT NULL
);

CREATE TABLE rater_requests (              -- one carrier's response to one rater call
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  connection_id      UUID NOT NULL REFERENCES carrier_connections (id),
  external_ref       TEXT NOT NULL,         -- the rater's request ID
  producer_id        UUID REFERENCES producers (id),  -- the agency, by its producer code
  state              TEXT NOT NULL,
  product_id         UUID REFERENCES products (id),   -- the version rated
  request            JSONB NOT NULL,        -- as received
  mapped_inputs      JSONB NOT NULL,        -- after mapping, what the rating engine saw
  defaulted_fields   TEXT[] NOT NULL DEFAULT '{}',
  reports_ordered    TEXT[] NOT NULL DEFAULT '{}',    -- 'mvr', 'clue', 'insurance_score'
  quote_id           UUID REFERENCES quotes (id),     -- the quote it created
  result             TEXT NOT NULL CHECK (result IN ('quoted', 'ineligible', 'incomplete',
                       'error')),
  premium            BIGINT,
  messages           JSONB NOT NULL DEFAULT '[]',
  latency_ms         INT NOT NULL,
  received_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (connection_id, external_ref)
);

CREATE TABLE bridges (                     -- a rater quote opened in the carrier's portal
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  rater_request_id   UUID NOT NULL REFERENCES rater_requests (id),
  token_hash         TEXT NOT NULL UNIQUE,  -- single-use handoff, stored hashed
  opened_at          TIMESTAMPTZ,
  submission_id      UUID,                  -- the submission it resumed
  premium_changed    BOOLEAN,               -- portal premium differed from rater premium
  change_reason      TEXT                   -- 'report_ordered', 'input_changed', ...
);

CREATE TABLE downloads (                   -- batches sent to agencies
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  connection_id      UUID NOT NULL REFERENCES carrier_connections (id),
  producer_id        UUID NOT NULL REFERENCES producers (id),
  kind               TEXT NOT NULL CHECK (kind IN ('policy', 'claim', 'commission',
                       'document')),
  format             TEXT NOT NULL,         -- 'al3', 'acord_xml', 'json'
  sequence_no        BIGINT NOT NULL,       -- per producer and kind, gapless
  file_ref           TEXT NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('built', 'sent', 'acknowledged',
                       'rejected')),
  built_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (producer_id, kind, sequence_no)
);

CREATE TABLE download_items (
  download_id        UUID NOT NULL REFERENCES downloads (id),
  policy_transaction_id UUID REFERENCES policy_transactions (id),
  claim_id           UUID,
  commission_id      UUID,
  document_id        UUID,
  item_key           TEXT NOT NULL,         -- stable ID the agency dedupes on
  PRIMARY KEY (download_id, item_key)
);

-- Transactions not yet sent to the agency of record.
SELECT pt.id, pt.kind, pt.effective_at, pt.processed_at
FROM policy_transactions pt
WHERE pt.producer_id = :agency
  AND NOT EXISTS (
    SELECT 1 FROM download_items di
    JOIN downloads d ON d.id = di.download_id
    WHERE di.policy_transaction_id = pt.id AND d.status IN ('sent', 'acknowledged'))
ORDER BY pt.processed_at;
```

Design notes:

- **The mapped inputs are evidence.** When an agent says the rater quoted $1,140 and the portal said $1,310, `mapped_inputs`, `defaulted_fields` and `reports_ordered` on the rater request, and `change_reason` on the bridge, answer it.
- **Downloads are sequenced per agency and kind.** A gapless sequence number lets the agency detect a missing file and the carrier resend exactly what was lost; items carry stable keys for deduplication.
- **Downloads follow processed order, not effective order.** The agency replays transactions as the carrier processed them, including reversals for out-of-sequence changes.
- **Mappings are versioned like rate tables,** because a mapping change changes prices ([Mapping Their Schema to Yours](/docs/building-blocks/integrations#mapping-their-schema-to-yours)).

## Auditing

- **Every rater price reproducible.** For each rater request, the request as received, the mapped inputs, the product version and the quote with its worksheet, so a price can be re-derived.
- **Every bridge outcome.** Whether the portal price matched the rater's, and why not when it didn't.
- **Every transaction delivered.** For each agency, every policy transaction, claim, commission and document sent, in sequence, with acknowledgment.
- **Prefill provenance.** Each prefill call with its vendor, permissible purpose and the fields the agent changed.

## What This Means for the System You Build

- **Run rater responses, portal quotes and API quotes through one rating service** and one product version, with the worksheet kept.
- **Store what was mapped, defaulted and ordered** for every rater request, and why a bridged price changed.
- **Treat downloads as a sequenced, idempotent stream** of policy transactions, including reversals and replays.
- **Design quote and bind APIs around expiry, product version and license checks,** with idempotent bind.
- **Keep prefill provenance on every input** that came from a data vendor.
- **Version every field mapping** with each rater and AMS as you version rate tables.

## References

**Filings**

- [Roper Technologies: Form 10-K for 2020](https://www.sec.gov/Archives/edgar/data/882835/000088283521000011/rop-20201231.htm), about $5.4 billion for the acquisition of Vertafore
- [Roper Technologies: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/882835/000088283526000009/rop-20251231.htm), Vertafore in the Application Software segment
- [Root: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1788882/000178888226000014/root-20251231.htm), the fully integrated embedded product used with Carvana
- [Lemonade: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1691421/000169142126000016/lmnd-20251231.htm), the company's claim that its AI and APIs sell 98% of its policies

**Vendor documentation**

- [EZLynx: Rating Engine](https://www.ezlynx.com/products/rating-engine/), one entry for real-time quotes from 330+ carriers in 48 states, bridging to bind, and prefill from LexisNexis, Fenris, MSB and Google Maps
- [Applied Systems](https://www1.appliedsystems.com/en-us/), Applied Epic, EZLynx, Ivans and the "9 of the top 10" brokerages claim
- [Tarmika (Applied Epic commercial quoting)](https://www.tarmika.com/), multi-carrier commercial quoting by line and the direct appointment requirement
- [Vertafore](https://www.vertafore.com/), AMS360, Sagitta, QQCatalyst, PL Rating, AgencyZoom and the scale claims
- [Zywave](https://www.zywave.com/), TurboRater, Agency Matrix, MGA Hub, quoting APIs and carrier connections
- [HawkSoft](https://www.hawksoft.com/), agency management since 1995 and its rater
- [Bold Penguin](https://www.boldpenguin.com/), the commercial exchange, submissions and facilitated premium
- [Semsee](https://www.semsee.com/), small commercial appetite, quote and bind, and its licensed producer entity
- [Ivans: Ivans Download](https://www.ivans.com/for-agents/products/ivans-download/), policy, claims, commission and document downloads by line, and Ivans Exchange
- [Ivans: Developer portal](https://api.ivans.com/), the Download, translation, Exchange, Bookroll and Distribution Platform APIs
- [Travelers: Producer compensation disclosure](https://www.travelers.com/w3c/legal/Producer_Compensation_Disclosure.html), book rolls among production incentives
