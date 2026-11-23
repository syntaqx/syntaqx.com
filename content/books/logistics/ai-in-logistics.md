+++
title = "AI in Logistics"
description = "AI in freight as of November 2026: document extraction and review queues, spot pricing, ETAs, agents that book and tender, fraud, classification and governance."
category = "Logistics & Supply Chain Industry"
order = 2868
part = "Running the Platform"
tags = ["logistics", "ai", "document-extraction", "agents", "pricing", "governance"]
+++

Logistics ran on paper and phone calls long after the rest of commerce went digital, which is why AI arrived in freight as a clerk before it arrived as a strategist. A broker's operations team spends its day reading rate confirmations, bills of lading and proofs of delivery, keying weights and reference numbers into a TMS, answering "where's my truck" emails, quoting spot loads and calling carriers to book them. A customs broker's team reads commercial invoices and packing lists and proposes tariff numbers. Each of those is a document to read, a number to estimate or a message to send, and by 2026 every large broker, visibility network and software vendor describes models doing some of it: C.H. Robinson says its "fleet of more than 30 AI agents is integrated with Navisphere," and FourKites says its agent Sam "reads supplier emails and documents, creates shipments, and links them back to POs without a human in the loop."

What makes it hard is that every one of those outputs is a record somebody relies on. An extracted weight becomes a rated charge; an extracted POD signature date releases an invoice; a model's spot quote is an offer the broker must honor; an agent's "booked" is a rate confirmation that binds the broker to a carrier it may never have hauled with; a suggested tariff number is a declaration the importer makes "using reasonable care" (19 U.S.C. 1484(a)(1)). The law doesn't care which model produced the output, and the counterparty doesn't either. This chapter covers what the platforms claim, then document extraction with field confidence and review queues, pricing, ETA prediction, agents that book, negotiate and tender (autonomy levels, limits, the actions that need a person, idempotent tool calls), fraud detection, customs classification assistance, and governance: model and prompt versions on every output, evaluation sets, audit records and who is accountable. It extends `documents`, `tenders`, `shipment_events` and two tables from earlier chapters, and adds `ai_model_versions`, `document_extractions`, `document_extraction_fields`, `ai_agent_actions` and `ai_evaluation_runs`.

The general engineering is the playbook's: [LLM Features](/docs/building-blocks/llm-features) for generated and extracted content, [AI Agents in the Product](/docs/building-blocks/ai-agents) for agents with tools, [AI & LLM Security](/docs/security/ai-security) for manipulation, and [Data Science Platforms](/docs/data/data-science-platforms) for model delivery. The store-side version of this chapter is the Commerce volume's [AI in Commerce](/books/commerce/ai-in-commerce), and AI in fraud scoring and payments is [AI in Payments](/books/payments/ai-in-payments).

## How the Platforms Do It

As of November 2026, from each company's own annual report or website. Every entry is the company's claim, not a measured result:

| Company | What it says its AI does | What it says about limits or risk |
| --- | --- | --- |
| **Blue Yonder** | "AI/machine learning predictions" it puts at "27B" a day on its platform; "Cognitive Solutions" described as "Agentic AI that recommends, decides, and acts"; AI agents that "continuously monitor your end-to-end network" | Calls its AI "explainable" and "purpose-built for supply-chain complexity" |
| **C.H. Robinson** (10-K for 2025) | "Lean AI"; "more than 30 AI agents" integrated with Navisphere; large language models, generative and agentic AI automating "from giving customers a price quote, to processing orders, to setting appointments for pickup and delivery"; ETA adjustments "using AI"; "approximately 800 technologists" | Measures it in "shipments per person per day"; lists "risks associated with the usage of AI technologies" among its forward-looking factors |
| **DAT** | RateView, "The industry standard in truckload pricing data," over "a database exceeding $1 trillion in freight market transactions"; "machine learning" offered in its analytics services | Its home page makes no AI claim for its rates |
| **Descartes** | "Purpose-built AI for faster planning, outreach, and exception handling" in transportation management; Image Document Management "Using logistics-trained AI agents for customs entry and shipment creation"; AI Assist for trade compliance screening | Claims it can "Reduce screening false positives by 60%" |
| **Expeditors** (10-K for 2025) | Technology "including artificial intelligence (AI)" | "We are in the early days in the deployment of AI and we continue to work to see where it can be applied most beneficially" |
| **Flexport** | "AI-enabled freight forwarding, customs brokerage, and fulfillment"; "AI that spots problems before they happen, calculates the fix, and executes it"; an "AI Customs Classification" tool | "AI-powered filing and a dedicated broker maintain 99.8% data accuracy": the claim pairs the model with a licensed person |
| **FourKites** | Named agents: Tracy for carrier updates, Sam for supplier documents, Alan for "ETA-driven dock appointment automation," Sophie for building workflows, all on Loft, "with full audit trails and human oversight where it matters"; a counter of hours of work completed by agents, past 1.18 million on November 22, 2026 | Its mission is "one billion hours of operational work completed by AI agents over the next decade" |
| **Highway** | Continuous carrier identity verification and "Know Your Driver" at pickup | No AI claim on its home page; its fraud figure ("99.9% fraud reduction when process is followed") is conditioned on a process, not a model |
| **J.B. Hunt** (10-K for 2025) | No AI claim tied to J.B. Hunt 360 or brokerage in the business description | Risk factor: AI may bring "inaccurate or biased outputs that are difficult to detect" and "governance and model-risk challenges" |
| **Manhattan Associates** | "Manhattan Agents are autonomous, enterprise-ready AI agents for supply chain commerce"; Agent Foundry, "a no-code, enterprise-ready AI agent builder" | Says agents come with built-in guardrails; its load-building figures on the page are illustrations, not results |
| **project44** | "Decision Intelligence that orchestrates AI agents to detect, decide, and act in real time"; an Intelligent TMS with "autonomous rate negotiation"; "Mo," an AI analyst | Describes agents as "Purpose-built digital workers that turn real-time signals into autonomous action" |
| **RXO** (10-K for 2025) | "dynamic pricing algorithms that use machine learning" and a "self-learning RXO Connect® digital brokerage platform"; carriers "bid and book loads online and through our platform's mobile app" | "If we fail to successfully integrate AI into our platform and business processes," and the cost of AI regulation "could be significant" |
| **Uber Freight** (Uber's 10-K for 2025) | "upfront, transparent pricing and the ability to book a shipment with the touch of a button"; Shippers "secure capacity on demand with real-time pricing" | Uber's risk factors: its "growing use of artificial intelligence ('AI') and machine learning may present additional risks" |

Four patterns run through the table:

- **The work automated is clerical first.** Quotes, order entry, appointment setting, carrier check calls and document reading are what C.H. Robinson, FourKites and Descartes name. These are tasks with a right answer that a person can check, which is why they went first.
- **The claims sit next to risk factors.** The same 10-Ks that sell AI warn about it. J.B. Hunt's phrase, outputs "difficult to detect" when wrong, is the design brief for this chapter: every output needs a check that doesn't depend on the model.
- **Pricing is the oldest model.** RXO's and Uber Freight's machine-priced, instantly bookable loads predate generative AI; what's new is language models that read and write the emails around them, and agents that negotiate.
- **Regulated filings keep a person.** Flexport's accuracy claim names "a dedicated broker," and Descartes's customs agents create entries for a broker to file. Customs is where the law already says who is responsible.

## Document Extraction

Freight still moves on documents that arrive as PDFs, phone photos and email bodies: the carrier's rate confirmation signed back, the BOL a driver photographs at pickup, the POD with a consignee's scrawl and an exception note, a lumper receipt, a carrier invoice, and, at the border, the commercial invoice and packing list a customs entry depends on. Extraction turns each into fields. The fields that matter by document kind:

| Document | Fields extracted | What they feed |
| --- | --- | --- |
| **Rate confirmation** (signed back) | Load number, carrier name and MC or USDOT number, total rate, accessorials agreed, pickup and delivery dates, signature and date | Acceptance of the confirmation; payable charges; a carrier identity check |
| **Bill of lading** | BOL and PRO numbers, shipper, consignee, pieces and handling units, weight, NMFC item and class, hazmat description, seal number, special instructions | Shipment lines and handling units as tendered; rating; claims |
| **Proof of delivery** | Delivery date and time, receiver's printed name, signature present, pieces received, exception notes ("2 cartons damaged," "short 1 pallet") | The delivered event; billing release; OS&D exceptions and cargo claims |
| **Lumper and accessorial receipts** | Amount, payer, facility, date, receipt number | Reimbursable payable and billable receivable charges |
| **Carrier invoice** | Invoice number, load or PRO reference, line charges, remit-to | Freight audit; the payable invoice |
| **Commercial invoice** | Seller, buyer, invoice number and date, line descriptions, quantities, unit prices, currency, Incoterms, country of origin, manufacturer | Customs entry lines, valuation and origin |
| **Packing list** | Package count, marks, net and gross weights per package, contents per package | Entry quantities; reconciling cartons to the invoice |

My rule: **an extraction is a proposal, field by field, and a field becomes a fact only when a check that doesn't depend on the model passes or a person confirms it.** The mechanics, structured output and then validation, are [Structured Outputs, Then Validation](/docs/building-blocks/llm-features#structured-outputs-then-validation); the logistics specifics are the checks:

- **Match fields against what the system already knows.** A rate confirmation's load number must name a load the broker tendered to that carrier, and its total must equal the confirmation the broker sent; a POD's BOL number must match the shipment; a carrier invoice's MC number must be the carrier on the load. A match is the strongest check there is, and a mismatch is a finding even when the model is confident.
- **Confidence per field, thresholds per field and kind.** A model's confidence on "pieces received: 12" and on "delivery date" are separate numbers, and the threshold to auto-accept depends on what the field drives: a reference number that also matches the load can pass at a lower confidence than a delivery time that starts a detention clock or an amount that becomes a payable.
- **Some fields never auto-accept.** A remit-to or bank account read from an invoice, a new carrier identity on a confirmation, a hazmat description, and anything on a customs document that changes duty go to a person every time. A changed payee read from a PDF is the payment diversion pattern described in Freight Fraud & Cargo Theft, not a data-entry convenience.
- **Exceptions are the point of a POD.** A model that reads "delivered" and misses the handwritten "1 pallet refused" has produced a clean invoice for a claim. Exception notes, strike-throughs and "subject to count" stamps are extracted as their own field, and their presence routes the POD to review.
- **The document is kept as received.** Extraction writes to its own tables and points at the `documents` row; the bytes and their hash stay unchanged, because the image is the evidence in a dispute and the extraction is only someone's reading of it.

The review queue is the product, not a fallback. A reviewer sees the image with each proposed field highlighted where it was read, confirms, corrects or rejects each field, and moves on; the corrections become the next evaluation set. [Human Review Where Errors Are Costly](/docs/building-blocks/llm-features#human-review-where-errors-are-costly) sets the general rule; the freight version is to route by what the field drives (billing release, payable amount, customs value) and to measure the queue as a cost per document next to the auto-accept rate, because a threshold set too low shows up later as short pays and rebills rather than as queue time.

Billing gated on a POD (the invoice goes out only when the delivery is proved) is described in Freight Invoicing & Settlement; extraction is what lets the gate run without a person opening every image, and the gate is only as good as the POD fields it trusts.

## Pricing

A spot quote is a price for one load, good for hours, that the broker must honor if the shipper accepts ([Contract and Spot Rates](/books/logistics/rating-and-accessorials#contract-and-spot-rates)). Models price it from the lane's recent buy rates, market indexes, the load's equipment, lead time and stops, seasonality and the broker's own acceptance history; RXO describes "dynamic pricing algorithms that use machine learning," and DAT sells the market data many models start from. The rules I hold a pricing model to:

- **The model suggests a buy and a sell; rules bound them.** Floor margins, ceiling rates, lanes or customers excluded from automatic pricing, and the maximum load value priced without a person are configuration with an owner, not the model's judgment ([Decide in Code](/docs/building-blocks/ai-agents#decide-in-code)).
- **A quote records how it was made.** The rate quote carries the model version and its inputs, so "why did we quote $2,140 on this lane last Tuesday" has an answer, and a backtest can replay quotes against what the load actually bought for.
- **Measure against the buy, not the win rate.** A model that wins every quote by pricing under the market loses money on the carrier side; the metric is margin realized after the load covers, and quotes that couldn't cover at the quoted buy, by lane. Logistics Metrics owns the definitions ([Logistics Metrics](/books/logistics/logistics-metrics)).
- **Don't feed it competitors' nonpublic prices.** Algorithmic pricing on pooled nonpublic data from competitors is the antitrust question the Commerce volume covers in [Pricing Models and Their Legal Limits](/books/commerce/ai-in-commerce#pricing-models-and-their-legal-limits); a broker's own history and public or licensed market indexes are the safe inputs.

Contract pricing in an annual bid uses the same models at a different horizon; the bid itself is [Freight Procurement & Routing Guides](/books/logistics/procurement-and-routing-guides).

## ETA Prediction

An ETA is a prediction with a range and a time it was made, and it is the oldest machine learning in visibility: FourKites and project44 sell predicted ETAs, and C.H. Robinson says its ETA adjustments use AI. The modeling and the exception rules that act on ETAs belong to ETAs & Exception Management, whose `stop_etas` table already records each prediction with its source, range, coverage, `model_version` and inputs. Two points belong here. A predicted ETA from a vendor and one from an in-house model are both outputs of models someone versioned, and a customer notification sent on a late prediction is a statement the business made, so the version that drove it is kept with it. And ETA accuracy is measured against actual arrivals by lane and by hours before arrival, with the definitions in [Logistics Metrics](/books/logistics/logistics-metrics); a single accuracy number across all predictions hides that the prediction made two hours out is what customers act on.

## Agents That Book, Negotiate and Tender

An agent in freight is a model with tools that act: quote a shipper, post a load, call or email carriers, accept a counteroffer, send a rate confirmation, tender to the routing guide's next carrier, set an appointment, send a check call. C.H. Robinson describes agents across the shipment "from giving customers a price quote, to processing orders, to setting appointments"; project44 sells "autonomous rate negotiation." The design is the playbook's: the model proposes through a narrow set of tools, code decides, every step is recorded ([Tools, Not Database Access](/docs/building-blocks/ai-agents#tools-not-database-access)). What freight adds is how much each action commits.

Autonomy is set per action, not per agent:

| Level | What the agent does | Freight examples |
| --- | --- | --- |
| **Suggest** | Proposes; a person acts | A carrier shortlist for a load; a tariff number for an item; a counteroffer to send |
| **Draft** | Prepares the action; a person approves it before it leaves | A rate confirmation to a new carrier; a reply to a shipper's claim email; a customs entry for a broker to file |
| **Act within limits** | Acts alone inside written rules, and notifies | Booking a load at or under the posted rate for an approved carrier with history, the rules the brokerage chapters keep as `auto_booking_rules`; tendering down a routing guide; sending check calls; setting a dock appointment inside the facility's rules |
| **Act and report** | Acts alone; the record is reviewed after | Answering "where is my load" from visibility data; logging a carrier's status reply as an event |

The actions that need a person, whatever the agent's level:

- **A first load with a carrier,** or any load to a carrier whose onboarding, insurance or identity check isn't current. The negligent-selection exposure of the broker is the same whether a person or an agent picked the carrier.
- **Anything that changes who gets paid:** a remit-to, a factor's notice of assignment, a bank account.
- **Rates outside the bounds:** above the buy ceiling, below the sell floor, or a counteroffer outside the band the rules allow.
- **Freight the rules exclude:** hazmat, high-value or theft-targeted commodities, temperature control, cross-border moves.
- **Changes after dispatch:** cancelling a covered load (a truck-ordered-not-used charge may be owed), changing a signed confirmation, or re-tendering a load a carrier accepted.
- **Customs transmissions,** which a licensed broker files.

Three engineering rules follow from the commitments:

- **Every tool call is idempotent.** An agent that times out and retries must not book two trucks or send two tenders. Each action carries a key derived from the run, the action and its subject (one booking per load per run), the tool handler refuses a second use of the key, and the tender or confirmation it creates stores the action that created it ([Idempotency](/docs/requests/idempotency), [Idempotency Beyond the API](/docs/requests/idempotency#idempotency-beyond-the-api)).
- **The agent's word is the broker's.** A rate an agent agrees by email is an offer the broker made, the same way a chatbot's refund promise bound an airline ([The AI's Promises Are the Business's Promises](/docs/building-blocks/ai-agents#the-ai-s-promises-are-the-business-s-promises)). Negotiation tools take amounts only within the band the rules computed, and the confirmation is generated by the same code that generates a person's.
- **Say it's an AI when it talks to people.** A voice or email agent negotiating with a dispatcher is an AI system interacting with a person; the EU AI Act's Article 50 disclosure duty and the state bot laws are summarized at [The Law, at a Pointer Level](/docs/building-blocks/ai-agents#the-law-at-a-pointer-level), and the safe behavior is to disclose at the start and log that it did.

The tender itself follows the same state machine whoever sends it ([The Tender State Machine](/books/logistics/tendering#the-tender-state-machine)); an agent working the waterfall is a faster sender, not a new set of states. Handoff to a person carries the load, the conversation and every tool call, denials included ([Human Handoff Is a Product Feature](/docs/building-blocks/ai-agents#human-handoff-is-a-product-feature)).

## Fraud Detection

Freight fraud (double brokering, carrier identity theft, fictitious pickups, payment diversion) is covered in Freight Fraud & Cargo Theft, which keeps each observation as a fraud signal with its source. A model's score is one more signal: its source names the model and version, its detail holds the features that drove it, and it groups into a case like any other. Two cautions apply to models here more than anywhere. The adversary adapts, so a model trained on last year's schemes misses this year's, and the deterministic controls (verified contacts, callbacks to the number on the registry, payee changes held) stay in place underneath it. And a false positive has a victim: a legitimate small carrier blocked by a score loses the load and maybe the relationship, so a block from a model is reviewable and the carrier has a way to be heard. Highway's public framing is a useful contrast: its figure is conditioned on a process being followed, not on a model.

## Customs Classification Assistance

Classification assistance proposes a tariff number for an item from its description, materials, use and images, with the headings considered; Flexport offers "AI Customs Classification," and Descartes describes AI agents for customs entry. The method a person follows (the General Rules of Interpretation, then section and chapter notes, then rulings) is in [The General Rules of Interpretation](/books/logistics/classification-valuation-origin#the-general-rules-of-interpretation), and it is also the shape a useful suggestion takes: a number with the GRI it rests on, the notes it applied and any CROSS rulings it found. Three rules keep it lawful:

- **Reasonable care doesn't move to the model.** The importer of record files the classification "using reasonable care," and the broker owes due diligence in what it tells the client ([Reasonable Care and the Broker's Duties](/books/logistics/customs-brokers-and-bonds#reasonable-care-and-the-broker-s-duties)). A suggestion is research; the classification row records the person who approved it, and an entry line never cites a classification nobody reviewed.
- **A ruling found is not a ruling held.** A model that cites another importer's ruling has found research, not authority ([Binding Rulings](/books/logistics/classification-valuation-origin#binding-rulings)).
- **Keep what it saw.** The description, images and specification the suggestion was made from are records the entry relied on, kept with the classification for the recordkeeping period ([Recordkeeping](/books/logistics/customs-brokers-and-bonds#recordkeeping)).

## Governance

No AI statute governs freight in the US as of November 2026; the obligations come from the records the industry already owes. A broker's transaction record under 49 CFR 371.3 (the consignor, the carrier and its registration number, the BOL, the broker's compensation, the date the carrier was paid, kept three years and open to every party to the transaction) is the same whether a person or an agent booked the load. Importers keep entry records "for 5 years from the date of entry" (19 CFR 163.4), and a classification an AI suggested, with what it was made from, is one of them. Outside the US, the EU AI Act's high-risk list (Annex III) doesn't name freight pricing, ETAs or customs classification, but it does name AI used "to allocate tasks based on individual behaviour or personal traits or characteristics or to monitor and evaluate the performance and behaviour of persons" in work relationships (point 4(b)); a warehouse labor system that assigns tasks and scores pickers in the EU is in scope, with Annex III obligations applying from December 2, 2027 under the Digital Omnibus (Regulation (EU) 2026/1744).

What makes an AI feature governable is the same in every chapter of this volume:

- **A version on every output.** Every extraction, quote, ETA, agent action, fraud score and classification suggestion records the model and prompt version that produced it ([Prompts Are Versioned Code](/docs/building-blocks/llm-features#prompts-are-versioned-code)), so a regression is dated to a release and every output of a bad version can be found.
- **An evaluation set per feature, from real documents and loads.** For extraction: reviewer-confirmed fields by document kind and by sender, scored per field. For pricing: quotes replayed against realized buy rates. For agents: scripted loads and conversations graded on the system's state afterward (was the load booked once, to an approved carrier, inside the band?). A release passes a threshold on the set before it ships ([Evals](/docs/building-blocks/ai-agents#evals), [Evals Are Tests](/docs/building-blocks/llm-features#evals-are-tests)).
- **An owner per feature,** named in the model version record: the person who approved the release, the limits it runs under and the evaluation it passed. "The AI did it" is the start of an answer; the owner finishes it.
- **A fallback.** When the extraction service or the model provider is down, documents queue for people and agents stop; the TMS keeps working ([When the Model Isn't There](/docs/building-blocks/llm-features#when-the-model-isn-t-there)).
- **Know what goes to the provider.** Rate confirmations, customs invoices and carrier bank details are a customer's and a carrier's confidential data; the contract with a model provider says what it keeps and whether it trains on it ([What Goes to the Provider](/docs/building-blocks/llm-features#what-goes-to-the-provider)).

## How to Build It

Every model release is a row, every output points at the release that made it, extractions keep their fields with confidence and a decision per field, and agent actions keep their idempotency keys. The tables, in the playbook's conventions:

```sql
CREATE TABLE ai_model_versions (          -- one released model and prompt, for one feature
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  owner_party_id    UUID NOT NULL REFERENCES parties (id),  -- whose platform runs it
  feature           TEXT NOT NULL CHECK (feature IN ('document_extraction',
                      'document_classification', 'spot_pricing', 'contract_pricing',
                      'eta_prediction', 'carrier_matching', 'booking_agent', 'tender_agent',
                      'check_call_agent', 'fraud_scoring', 'customs_classification')),
  provider          TEXT NOT NULL,          -- the model vendor, or 'in_house'
  model             TEXT NOT NULL,          -- the model and version as the provider names it
  prompt_ref        TEXT,                   -- the prompt template and version, in version control
  config            JSONB NOT NULL DEFAULT '{}',  -- thresholds per field, limits, tool list
  evaluation_run_id UUID,                   -- the passing run it was released on; FK below
  approved_by       TEXT NOT NULL,          -- the feature's owner who released it
  valid_during      TSTZRANGE NOT NULL,     -- when it was the live version
  EXCLUDE USING gist (owner_party_id WITH =, feature WITH =, valid_during WITH &&)
);

CREATE TABLE ai_evaluation_runs (         -- one run of a feature's evaluation set
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  model_version_id UUID NOT NULL REFERENCES ai_model_versions (id),
  eval_set_ref     TEXT NOT NULL,           -- the set and its version
  case_count       INT NOT NULL CHECK (case_count > 0),
  metrics          JSONB NOT NULL,          -- per-field accuracy, duplicate bookings, margin error
  thresholds       JSONB NOT NULL,          -- what the release required
  passed           BOOLEAN NOT NULL,
  run_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ai_model_versions ADD CONSTRAINT ai_model_versions_eval_fkey
  FOREIGN KEY (evaluation_run_id) REFERENCES ai_evaluation_runs (id);

CREATE TABLE document_extractions (       -- one model's reading of one document
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  document_id      UUID NOT NULL REFERENCES documents (id),
  model_version_id UUID NOT NULL REFERENCES ai_model_versions (id),
  kind_detected    TEXT NOT NULL,           -- a documents.kind value, as the model read it
  page_count       SMALLINT,
  status           TEXT NOT NULL CHECK (status IN ('extracted', 'in_review', 'accepted',
                     'rejected', 'superseded')),
  routed_reason    TEXT,                    -- why it went to review: 'low_confidence',
                                            -- 'mismatch', 'always_review_field', 'exception_note'
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);
CREATE INDEX ON document_extractions (document_id);
CREATE INDEX ON document_extractions (status) WHERE status = 'in_review';

CREATE TABLE document_extraction_fields ( -- one field, as read and as decided
  extraction_id   UUID NOT NULL REFERENCES document_extractions (id),
  field           TEXT NOT NULL,            -- 'bol_number', 'delivered_at', 'pieces_received',
                                            -- 'exception_note', 'total_amount', 'remit_to'
  occurrence      SMALLINT NOT NULL DEFAULT 1,  -- line items repeat a field
  raw_value       TEXT,                     -- the text as read
  value           JSONB,                    -- normalized: a number, an instant, a code
  confidence      NUMERIC(4, 3) CHECK (confidence BETWEEN 0 AND 1),
  page            SMALLINT,
  region          JSONB,                    -- where on the page, for the reviewer's highlight
  check_result    TEXT CHECK (check_result IN ('matched', 'mismatched', 'no_reference')),
  decision        TEXT NOT NULL CHECK (decision IN ('pending', 'auto_accepted', 'confirmed',
                    'corrected', 'rejected')),
  final_value     JSONB,                    -- what the system uses; differs from value if corrected
  decided_by      TEXT,                     -- a reviewer, or 'rule:<threshold id>'
  decided_at      TIMESTAMPTZ,
  PRIMARY KEY (extraction_id, field, occurrence),
  CHECK (decision <> 'auto_accepted' OR check_result IS DISTINCT FROM 'mismatched'),
  CHECK (decision IN ('pending', 'rejected') OR final_value IS NOT NULL)
);

CREATE TABLE ai_agent_actions (           -- one tool call an agent made, allowed or not
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  model_version_id  UUID NOT NULL REFERENCES ai_model_versions (id),
  run_id            UUID NOT NULL,          -- the agent's run, across its tool calls
  tool              TEXT NOT NULL,          -- 'quote_load', 'book_carrier', 'send_tender',
                                            -- 'counter_offer', 'set_appointment', 'hand_off'
  idempotency_key   TEXT NOT NULL UNIQUE,   -- run, tool and subject: a retry finds this row
  subject_type      TEXT NOT NULL CHECK (subject_type IN ('load', 'shipment', 'tender',
                      'stop', 'rate_quote', 'carrier')),
  subject_id        UUID NOT NULL,
  input             JSONB NOT NULL,         -- the arguments as the model proposed them
  autonomy          TEXT NOT NULL CHECK (autonomy IN ('suggest', 'draft', 'act_within_limits',
                      'act_and_report')),
  policy_checks     JSONB NOT NULL,         -- each rule, its version and whether it passed
  rule_version_ref  TEXT,                   -- e.g. the auto-booking rule version applied
  result            TEXT NOT NULL CHECK (result IN ('done', 'denied', 'awaiting_approval',
                      'approved', 'rejected_by_person', 'handed_off', 'failed')),
  approved_by       TEXT,                   -- the person, when autonomy required one
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (autonomy NOT IN ('suggest', 'draft') OR result <> 'done' OR approved_by IS NOT NULL)
);
CREATE INDEX ON ai_agent_actions (subject_type, subject_id);
```

The core tables point back at the record that produced them, added live-safe:

```sql fragment
ALTER TABLE documents
  ADD COLUMN kind_source TEXT,             -- who said what kind it is
  ADD COLUMN accepted_extraction_id UUID;  -- the extraction whose fields the system used
ALTER TABLE documents ADD CONSTRAINT documents_kind_source_check
  CHECK (kind_source IS NULL OR kind_source IN ('sender', 'edi', 'model', 'person')) NOT VALID;
ALTER TABLE documents ADD CONSTRAINT documents_accepted_extraction_fkey
  FOREIGN KEY (accepted_extraction_id) REFERENCES document_extractions (id) NOT VALID;

ALTER TABLE tenders ADD COLUMN ai_agent_action_id UUID;  -- set when an agent sent it
ALTER TABLE tenders ADD CONSTRAINT tenders_ai_agent_action_fkey
  FOREIGN KEY (ai_agent_action_id) REFERENCES ai_agent_actions (id) NOT VALID;

ALTER TABLE shipment_events ADD COLUMN extraction_id UUID;  -- a delivery proved by a read POD
ALTER TABLE shipment_events ADD CONSTRAINT shipment_events_extraction_fkey
  FOREIGN KEY (extraction_id) REFERENCES document_extractions (id) NOT VALID;

ALTER TABLE rate_quotes ADD COLUMN model_version_id UUID;  -- a model-priced quote
ALTER TABLE rate_quotes ADD CONSTRAINT rate_quotes_model_version_fkey
  FOREIGN KEY (model_version_id) REFERENCES ai_model_versions (id) NOT VALID;

ALTER TABLE item_classifications ADD COLUMN model_version_id UUID;  -- a suggestion's source
ALTER TABLE item_classifications ADD CONSTRAINT item_classifications_model_version_fkey
  FOREIGN KEY (model_version_id) REFERENCES ai_model_versions (id) NOT VALID;
ALTER TABLE item_classifications ADD CONSTRAINT item_classifications_ai_reviewed_check
  CHECK (model_version_id IS NULL OR reviewed_by IS NOT NULL) NOT VALID;

CREATE INDEX CONCURRENTLY tenders_ai_agent_action_idx ON tenders (ai_agent_action_id)
  WHERE ai_agent_action_id IS NOT NULL;
ALTER TABLE documents VALIDATE CONSTRAINT documents_kind_source_check;
ALTER TABLE item_classifications VALIDATE CONSTRAINT item_classifications_ai_reviewed_check;
```

The booking tool, with the idempotency key checked before anything happens and the policy decided in code. The model supplies the load and carrier; the price comes from the rules, never from the model:

```go tab="Go"
type BookRequest struct {
	RunID     string
	LoadID    string
	CarrierID string
	Amount    int64 // minor units, as the model proposed
}

type Limits struct {
	MaxBuy           int64 // from the load's pricing bounds
	CarrierApproved  bool  // onboarding, insurance and identity current
	LoadsWithCarrier int
	MinLoadsWithUs   int // the auto-booking rule's threshold
	ExcludedFreight  bool  // hazmat, high value, temperature, cross-border
}

type Outcome string

const (
	Done             Outcome = "done"
	Denied           Outcome = "denied"
	AwaitingApproval Outcome = "awaiting_approval"
)

// BookCarrier records the action under its idempotency key first, so a retry
// returns the first outcome instead of booking a second truck.
func BookCarrier(ctx context.Context, store Store, r BookRequest, lim Limits) (Outcome, error) {
	key := fmt.Sprintf("%s:book_carrier:%s", r.RunID, r.LoadID)
	if prior, ok, err := store.ActionByKey(ctx, key); err != nil || ok {
		return prior, err
	}
	var outcome Outcome
	switch {
	case !lim.CarrierApproved || lim.ExcludedFreight || r.Amount > lim.MaxBuy:
		outcome = Denied
	case lim.LoadsWithCarrier < lim.MinLoadsWithUs:
		outcome = AwaitingApproval // a first load with a carrier goes to a person
	default:
		outcome = Done
	}
	return outcome, store.RecordAction(ctx, key, r, outcome) // tender and confirmation in the same transaction when Done
}
```

```rust tab="Rust"
pub struct BookRequest { pub run_id: String, pub load_id: String, pub carrier_id: String, pub amount: i64 }

pub struct Limits {
    pub max_buy: i64,
    pub carrier_approved: bool,
    pub loads_with_carrier: u32,
    pub min_loads_with_us: u32,
    pub excluded_freight: bool,
}

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum Outcome { Done, Denied, AwaitingApproval }

pub trait Store {
    fn action_by_key(&self, key: &str) -> Result<Option<Outcome>, StoreError>;
    fn record_action(&mut self, key: &str, r: &BookRequest, o: Outcome) -> Result<(), StoreError>;
}

/// Records the action under its idempotency key first, so a retry returns the
/// first outcome instead of booking a second truck.
pub fn book_carrier(store: &mut impl Store, r: &BookRequest, lim: &Limits) -> Result<Outcome, StoreError> {
    let key = format!("{}:book_carrier:{}", r.run_id, r.load_id);
    if let Some(prior) = store.action_by_key(&key)? {
        return Ok(prior);
    }
    let outcome = if !lim.carrier_approved || lim.excluded_freight || r.amount > lim.max_buy {
        Outcome::Denied
    } else if lim.loads_with_carrier < lim.min_loads_with_us {
        Outcome::AwaitingApproval // a first load with a carrier goes to a person
    } else {
        Outcome::Done
    };
    store.record_action(&key, r, outcome)?; // tender and confirmation in the same transaction when Done
    Ok(outcome)
}
```

The review queue's health, by sender: how often each carrier's documents need a person, and how often a person had to correct a field the model was confident about.

```sql
SELECT d.counterparty_party_id,
       d.kind,
       COUNT(DISTINCT e.id)                                          AS extractions,
       AVG((e.routed_reason IS NOT NULL)::int)                       AS review_rate,
       COUNT(*) FILTER (WHERE f.decision = 'corrected'
                          AND f.confidence >= 0.95)                  AS confident_but_wrong
FROM document_extractions e
JOIN documents d ON d.id = e.document_id
JOIN document_extraction_fields f ON f.extraction_id = e.id
WHERE e.created_at >= NOW() - INTERVAL '30 days'
GROUP BY d.counterparty_party_id, d.kind
ORDER BY confident_but_wrong DESC, review_rate DESC;
```

Loads an agent booked whose action skipped a required approval, the query an auditor runs first:

```sql
SELECT a.subject_id AS load_id, a.created_at, a.autonomy, a.result, a.rule_version_ref
FROM ai_agent_actions a
WHERE a.tool = 'book_carrier'
  AND a.result = 'done'
  AND (a.autonomy IN ('suggest', 'draft') AND a.approved_by IS NULL
       OR EXISTS (SELECT 1 FROM jsonb_array_elements(a.policy_checks) c
                  WHERE (c ->> 'passed')::boolean IS FALSE));
```

Design notes:

- **Fields are decided one by one.** `document_extraction_fields.decision` is per field, so a POD can release billing on a confirmed delivery date while its exception note waits for a claims person; the CHECK keeps a mismatched field from ever being auto-accepted.
- **Extraction never overwrites the owning record silently.** Accepted values are written to the shipment, charge or event through the same service a person's entry uses, with the extraction as the source; `shipment_events.extraction_id` and `documents.accepted_extraction_id` say which reading the system used.
- **A model version is a release.** `ai_model_versions` has one live version per feature per owner (the exclusion constraint), points at the evaluation it passed, and names who approved it, the playbook's [Automated and AI Decisions](/docs/building-blocks/audit-trails#automated-and-ai-decisions) pattern as a table.
- **ETAs keep their own table.** `stop_etas.model_version` from ETAs & Exception Management records the version as text; a platform that adopts `ai_model_versions` can add a foreign key there the same live-safe way.
- **Idempotency lives in the table, not the prompt.** `ai_agent_actions.idempotency_key` is unique, so a retried tool call reads its first result back; the tender row points at the action that sent it.
- **Agent actions are audit records.** Each is written in the same transaction as the tender, confirmation or appointment it caused, with denials kept, as [Auditing AI Actions](/docs/building-blocks/ai-agents#auditing-ai-actions) requires.

## Auditing

- **Which model made which record.** For every extraction, quote, agent action and classification suggestion, the model version, its prompt, the evaluation it was released on and the owner who approved it.
- **How each extracted field was decided.** The raw reading, confidence, the check against the system's records, the decision, the final value and who made it, kept as long as the document is (a POD for the claim and billing period, a customs invoice for five years from entry).
- **What agents did and were refused.** Every tool call with inputs, policy checks, the rule version applied, the result and the approver, including handoffs and denials.
- **The broker's transaction record,** complete for agent-booked loads as for any other: carrier, registration number, BOL, compensation, payer and the carrier's payment date, for three years (49 CFR 371.3).
- **Who reviewed each AI-suggested classification,** with what the suggestion was made from.
- **Evaluation history** per feature, so a change in error rates is dated to the release that caused it.

## What This Means for the System You Build

- **Treat every extraction as a proposal,** decided field by field, with checks against the system's own records before confidence counts.
- **Never auto-accept who gets paid,** a new carrier identity, a hazmat description or anything that changes duty.
- **Read the exceptions on a POD** as their own field, and route any exception to a person before billing.
- **Bound pricing models with rules** and record the model version and inputs on every quote.
- **Set autonomy per action,** keep first loads, payee changes, out-of-band rates and post-dispatch changes with a person, and make every tool call idempotent.
- **Remember the agent's word is the broker's,** and disclose that it's an AI when it talks to people.
- **Keep classification suggestions as research** until a person with the duty of reasonable care approves them.
- **Version every model and prompt as a release,** with an owner, an evaluation set from real documents and loads, and a fallback to people when it's down.

## References

**Filings**

- [C.H. Robinson Worldwide: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1043277/000104327726000009/chrw-20251231.htm), Lean AI, more than 30 AI agents integrated with Navisphere, automated quotes, orders and appointments, AI ETA adjustments, about 800 technologists, shipments per person per day and AI risk in forward-looking factors
- [RXO: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1929561/000192956126000013/rxo-20251231.htm), machine-learning pricing algorithms, the self-learning RXO Connect platform, carrier booking by app, and AI risk factors
- [Uber Technologies: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1543151/000154315126000015/uber-20251231.htm), Freight's upfront pricing and one-touch booking, real-time pricing for shippers, and the AI and machine learning risk factor
- [Expeditors International: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/746515/000119312526071569/expd-20251231.htm), "early days in the deployment of AI"
- [J.B. Hunt Transport Services: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/728535/000143774926005294/jbht20251231_10k.htm), AI risk factors: outputs difficult to detect, governance and model risk

**Vendors**

- [Blue Yonder](https://blueyonder.com/), 27 billion predictions a day, Cognitive Solutions and AI agents monitoring the network
- [DAT](https://www.dat.com/), RateView, its database of freight transactions and machine learning in analytics services
- [Descartes](https://www.descartes.com/), AI in transportation management, logistics-trained agents for customs entry and shipment creation, and the screening false-positive claim
- [Flexport](https://www.flexport.com/), AI-enabled forwarding and brokerage, AI Customs Classification, and AI-powered filing with a dedicated broker
- [FourKites](https://www.fourkites.ai/), its named agents, Loft's audit trails and human oversight, hours completed and its mission figure
- [Highway](https://highway.com/), continuous carrier identity, Know Your Driver and a fraud figure conditioned on process
- [Manhattan Associates](https://www.manh.com/), Manhattan Agents, Agent Foundry and illustrative agent scenarios
- [project44](https://www.project44.com/), Decision Intelligence, AI agents as digital workers and autonomous rate negotiation

**Regulations**

- [19 U.S.C. 1484: Entry of merchandise](https://www.law.cornell.edu/uscode/text/19/1484), the importer of record's reasonable care in declaring value, classification and rate of duty
- [19 CFR 163.4: Record retention period](https://www.law.cornell.edu/cfr/text/19/163.4), five years from the date of entry
- [49 CFR 371.3: Records to be kept by brokers](https://www.law.cornell.edu/cfr/text/49/371.3), the transaction record, three-year retention and each party's right to review
- [EU AI Act: Annex III](https://artificialintelligenceact.eu/annex/3/), high-risk use cases, point 4(b) on task allocation and performance monitoring in work relationships, and what isn't listed
- [EU AI Act: Digital Omnibus](https://artificialintelligenceact.eu/ai-act-explorer/digital-omnibus/), Regulation (EU) 2026/1744, in force July 27, 2026, with Annex III obligations from December 2, 2027
