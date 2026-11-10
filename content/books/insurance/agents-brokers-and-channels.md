+++
title = "Agents, Brokers & Channels"
nav_title = "Agents & Channels"
description = "Captive, independent and direct channels, brokers, wholesalers, aggregators and embedded: the economics, who the agent serves, and the surplus lines home state."
category = "Insurance Industry"
order = 2714
part = "Distribution"
tags = ["insurance", "distribution", "agents", "brokers", "surplus-lines"]
+++

An insurance policy reaches a customer through one of a handful of channels, and the channel decides who quotes it, who the customer thinks they're dealing with, who is paid for it, who owns the relationship at renewal and whose system holds the record. A captive agent sells one company's policies from an office that carries its brand; an independent agent quotes several carriers side by side and places the business with one; a direct carrier sells from its own website and call center with licensed employees; a broker represents the buyer and negotiates terms with insurers; a wholesaler places what retail agents can't place in the admitted market; an aggregator sells the customer's quote request to whoever bids for it; an embedded partner offers coverage inside another purchase. One carrier often uses all of them at once.

For the system, the channel is a property of each policy and each transaction, not of the carrier: who the producer of record is, under which appointment and license, on which commission schedule, with what binding authority, and whose system the policy came from. This chapter covers the channels and their economics, who the agent legally works for, and the surplus lines broker's role under the federal home-state rule. Licensing is [Producer Licensing & Appointments](/books/insurance/producer-licensing), money is [Commissions & Agency Accounting](/books/insurance/commissions-and-agency-accounting), the agency's software is [Comparative Raters & Agency Systems](/books/insurance/comparative-raters-and-agency-systems), and lead markets are [Leads, Aggregators & Consent](/books/insurance/leads-and-consent). It extends `producers` and `policies` from [The Core Data Model](/books/insurance/insurance-business#the-core-data-model) with `channels` and `sl_placements`.

## How the Platforms Do It

As of November 2026, from each company's 2025 filings or public pages:

| Company | Channels | What the filing says |
| --- | --- | --- |
| **State Farm** | Captive agents | "One of our 19,000 agents is ready to help" |
| **Allstate** | Exclusive agents, independent agents, direct, retail | Over 27,400 exclusive agents and licensed sales professionals, about 58,700 independent agent locations, about 2,200 direct sales representatives in contact centers and online, and Direct Auto sold in about 500 retail stores |
| **Progressive** | Independent agents and direct | More than 40,000 independent agencies; direct ("business written directly by us online or by phone") was 57% of personal vehicle volume in 2025, up from 54% in 2023 |
| **Travelers** | Independent agents and brokers | Thousands of independent agents and brokers; 80 Business Insurance field offices |
| **Erie** | Independent agents only | Independent agencies are the Exchange's sole distribution channel |
| **Goosehead** | Franchised agencies placing with many carriers | 1,009 franchises at the end of 2025; franchisees pay royalties of 20% of first-term commissions and 50% of renewal commissions |
| **Root** | Direct app, embedded partners, independent agents | An embedded product used with partners such as Carvana; independent agent new writings more than tripled in 2025 |
| **EverQuote, MediaAlpha** | Aggregators selling consumer referrals | EverQuote works with about 60 carriers and about 6,000 enrolled agencies; MediaAlpha's 2025 transaction value was $2.2 billion |

The table shows the industry's main split. Personal lines carriers choose a primary channel and add others at the margin: State Farm is captive, Progressive is agency plus direct, Allstate runs all four. In commercial lines, advice and negotiation are much of the product, and the commercial writers in the table (Travelers' business insurance, Erie's commercial book) reach those customers through independent agents and brokers.

## The Channels

**Captive (exclusive) agents.** An agent who sells only one company's products, usually as an independent contractor running a branded office, sometimes as an employee. Allstate describes its exclusive agents' pay as a monthly base commission on eligible written premium, plus variable pay for new customers and bundling and bonuses tied to profitable growth. The carrier controls the product shelf; the agent controls the local relationship. Systems are the carrier's: the agent quotes, binds and services in the carrier's own platform.

**Independent agents.** A licensed agency appointed by several carriers, quoting each for a customer and placing the business with one. Allstate pays its independent agents a monthly base commission plus an annual profit share on growth and profit targets. Progressive says its agents "cannot establish underwriting guidelines, develop rates, or settle claims." The agency runs its own agency management system and comparative rater, and receives policy and commission data from each carrier by download.

**Franchised agencies.** A variant of independent: Goosehead's franchisees operate under a ten-year franchise agreement and pay the franchisor a royalty out of their commissions, 20% in the first term and 50% on renewals, including renewals moved to a different carrier.

**Direct.** The carrier sells through its own website, app and call center with licensed employees. Progressive's direct share rose from 54% to 57% of personal vehicle volume between 2023 and 2025; Allstate has about 2,200 direct sales representatives. Root and Lemonade began direct. There is no external producer of record, but the employees who sell must still be licensed ([Who Must Be Licensed](/books/insurance/producer-licensing#who-must-be-licensed)).

**Brokers.** A producer who represents the buyer, not an insurer: it advises on the program, takes it to market and negotiates. The large brokers (Marsh, Aon, Gallagher, WTW, Brown & Brown) are mostly commercial and employee benefits businesses, and most of their revenue is still commission paid by insurers, plus fees paid by clients ([Brokers by Revenue](/books/insurance/insurance-landscape#brokers-by-revenue)).

**Wholesalers and surplus lines brokers.** A wholesaler places business for a retail agent or broker who lacks access to a market, usually the surplus lines market or a specialty program. Ryan Specialty reports wholesale brokerage, binding authority and underwriting management as its three specialties. The surplus lines broker files each placement and pays the premium tax ([Surplus Lines Brokers and the Home-State Rule](#surplus-lines-brokers-and-the-home-state-rule)).

**Aggregators and lead sellers.** Comparison sites and lead marketplaces collect a consumer's quote request and sell it, as a click, a lead or a call, to carriers and agents. EverQuote works with about 60 carriers and about 6,000 agencies, against more than 100,000 US P&C agencies it counts as its market, and some carriers subsidize their agents' referral costs. Aggregators don't usually bind; they hand the customer to someone licensed who does.

**Embedded.** Coverage offered inside another purchase (a car loan, a rental, an apartment lease, a checkout) by a partner who may be licensed, a limited lines licensee, or paid a referral fee. Root's embedded product with Carvana is an example; Embedded Insurance covers the licensing models and the API shape.

**MGAs and program administrators.** Not a sales channel to the public but a layer between the carrier and the retail agent, with underwriting authority ([MGAs, Programs & Fronting](/books/insurance/mgas-programs-and-fronting)).

## Who the Agent Works For

The legal answer depends on the role, and the system has to know which role a producer played on each transaction:

- **An agent represents the insurer.** An appointed agent acts for the insurer that appointed it, within the authority its agency contract gives (to solicit, to bind, to collect premium). The NAIC's Producer Licensing Model Act is careful that the license alone grants none of this: a license "does not create any authority, actual, apparent or inherent, in the holder to represent or commit an insurance carrier." Authority comes from the appointment and contract.
- **A broker represents the buyer.** A broker who takes compensation from the customer and also from the insurer must disclose it. The model act's compensation disclosure section (section 18) bars a producer that receives compensation from the customer, or represents the customer, from also taking insurer or third-party compensation unless it first obtains the customer's documented acknowledgment and discloses the amount, or the method and an estimate when the amount isn't known. An appointed producer paid only by the insurer is exempt if it discloses that it will be paid by the insurer or that it represents the insurer.
- **Some states require disclosure from everyone.** New York's producer compensation regulation (11 NYCRR 30, Regulation 194) requires a producer, at or before application, to disclose its role, whether the insurer or a third party will pay it based on the sale, that compensation may vary by insurer, contract, volume or profitability, and that the buyer may ask for more; on request, it must give the nature, amount and source of its compensation, including on alternative quotes, in writing at or before issuance (or within five business days of a request made within 30 days after issuance). The disclosure generally doesn't apply to renewals, and the DFS says written disclosures should be kept for three years.

Three records follow:

- **Producer of record.** On every policy and every transaction, the producer whose license and appointment the business was written under, which may differ from the producer who services it. Commissions, statistical reports and market conduct exams key on it.
- **Broker or agent of record changes.** A commercial insured can move its account to a new broker by a broker of record letter; Texas's surplus lines stamping office runs its own broker of record process for surplus lines policies. The change is effective-dated, affects renewal and often current-term commission, and needs the letter as a document.
- **Disclosures delivered.** For a broker, the compensation disclosure and acknowledgment; for New York business, the Regulation 194 disclosure, with when and how it was given.

## Channel Economics

Each channel pays for distribution differently, and the cost shows up in a different line of the income statement:

- **Commission channels** (captive, independent, franchised, brokers) pay a percentage of written premium as commission, plus contingent or bonus pay. The cost is variable and paid as premium is written ([Commission Schedules](/books/insurance/commissions-and-agency-accounting#commission-schedules)).
- **Direct** pays for advertising, its own licensed staff and its technology, mostly fixed or incurred before a sale.
- **Aggregators** charge per click, lead or call, whether or not a policy results; EverQuote recognizes referral revenue "at the time of delivery."

Progressive, which runs both agency and direct at scale, reports a GAAP combined ratio by channel: 85.4 for agency auto and 90.1 for direct auto in 2025. Both carry the full cost of distribution in the expense ratio; agency pays it as commission, direct as advertising and acquisition spend, and the difference in 2025 favored agency. The comparison is one company's in one year, and the loss experience differs between channels too, so a channel's profitability is a query by producer channel over losses and expenses, not a commission rate.

Goosehead's model shows how the renewal economics shift with the contract. On a homeowners policy paying a carrier commission of $200.00 in its first term and $200.00 at each renewal (my numbers), the franchisee keeps $160.00 the first year (Goosehead's 20% royalty is $40.00) and $100.00 each renewal year (50% royalty, $100.00). Goosehead's 2025 revenue was mostly renewal royalties, $170.8 million against $30.2 million of new business royalties, which is what a book that keeps renewing looks like.

A worked acquisition cost comparison, entirely illustrative: a six-month auto policy of $900.00. Through an independent agent at a 12% commission, distribution costs $108.00 a term, every term the policy renews. Bought as a $40.00 lead with a one-in-eight close rate, direct acquisition costs $320.00 once, plus the call center's cost, and nothing at renewal. Which is cheaper depends on how long the customer stays, which is why carriers model channel economics on lifetime premium and retention, not first-term cost.

## Surplus Lines Brokers and the Home-State Rule

When the admitted market won't write a risk, a licensed surplus lines broker can place it with a non-admitted (surplus lines) insurer, which writes on its own rates and forms. The broker, not the insurer, is the regulated party in the insured's state: it holds the surplus lines license, files the placement with the state or its stamping office, collects the tax and fees from the insured, and remits them.

Before 2011, a multistate risk owed surplus lines tax to every state where part of it sat. The Nonadmitted and Reinsurance Reform Act of 2010 (NRRA, Dodd-Frank Title V, Subtitle B) replaced that with a single rule: "No State other than the home State of an insured may require any premium tax payment for nonadmitted insurance" (15 USC 8201(a)), effective July 21, 2011; states may allocate the tax among themselves by compact. The **home state** is the state of the insured's principal place of business (an individual's principal residence), or, if 100% of the insured risk is outside that state, the state with the greatest share of the taxable premium; for an affiliated group buying together, the home state of the member with the largest share of premium (15 USC 8206). The act also limits eligibility rules states can impose on US nonadmitted insurers, and frees placements for **exempt commercial purchasers** from the diligent search requirement when the broker discloses that coverage "may or may not be available from the admitted market" and the purchaser asks in writing (15 USC 8205). An exempt commercial purchaser employs or retains a qualified risk manager, paid more than $100,000 of commercial P&C premium nationwide in the preceding twelve months, and meets one size test (net worth over $20 million, revenue over $50 million, more than 500 employees, a nonprofit or public entity with a budget of at least $30 million, or a municipality over 50,000 people), with the dollar figures adjusted for inflation every five years.

A worked placement, mine: a contractor headquartered in Texas with operations in Texas, Florida and California buys a $400,000 surplus lines general liability policy. The home state is Texas (its principal place of business, with some of the risk there), so the whole premium is taxed by Texas at its 4.85% surplus lines tax, $19,400.00, plus whatever stamping fee Texas charges, and filed through the Surplus Lines Stamping Office of Texas, whose SMART system brokers file in. Had the same company been headquartered in Florida, Florida's 4.94% tax and 0.06% stamping fee would apply to the whole premium: $19,760.00 plus $240.00. Before July 2011, each of the three states could have taxed its share. Excess & Surplus Lines covers diligent search, eligibility and stamping offices in depth.

## How to Build It

The channel belongs to the producer relationship on each transaction; a surplus lines placement is its own record with the home-state determination:

```sql
CREATE TABLE channels (                    -- how business reached the insurer
  id                 TEXT PRIMARY KEY,      -- 'captive', 'independent', 'franchise',
                                            -- 'direct_web', 'direct_phone', 'broker',
                                            -- 'wholesale', 'aggregator', 'embedded', 'program'
  producer_required  BOOLEAN NOT NULL,      -- false for direct
  name               TEXT NOT NULL
);

ALTER TABLE policy_transactions
  ADD COLUMN channel_id          TEXT REFERENCES channels (id),
  ADD COLUMN producer_id         UUID REFERENCES producers (id),   -- producer of record
  ADD COLUMN sub_producer_id     UUID REFERENCES producers (id),   -- the individual at the agency
  ADD COLUMN appointment_id      UUID REFERENCES appointments (id),
  ADD COLUMN license_id          UUID REFERENCES producer_licenses (id),
  ADD COLUMN source_system       TEXT,    -- 'carrier_portal', 'rater_bridge', 'api:partner'
  ADD COLUMN lead_id             UUID;    -- leads (Leads, Aggregators & Consent)

CREATE TABLE producer_of_record_changes (  -- broker or agent of record letters
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_id          UUID NOT NULL REFERENCES policies (id),
  from_producer_id   UUID REFERENCES producers (id),
  to_producer_id     UUID NOT NULL REFERENCES producers (id),
  effective_at       TIMESTAMPTZ NOT NULL,
  commission_rule    TEXT NOT NULL CHECK (commission_rule IN ('renewal_only',
                       'current_term_prorata', 'per_contract')),
  letter_doc_id      UUID NOT NULL
);

CREATE TABLE compensation_disclosures (    -- PLMA section 18, NY Regulation 194
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  producer_id        UUID NOT NULL REFERENCES producers (id),
  party_id           UUID NOT NULL REFERENCES parties (id),
  submission_id      UUID,
  rule_ref           TEXT NOT NULL,         -- '11 NYCRR 30.3(a)', 'PLMA s18(A)(1)'
  method             TEXT NOT NULL CHECK (method IN ('oral', 'written', 'electronic')),
  given_at           TIMESTAMPTZ NOT NULL,
  acknowledged_at    TIMESTAMPTZ,           -- customer acknowledgment where required
  document_id        UUID
);

CREATE TABLE sl_placements (               -- one nonadmitted placement and its taxes
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  policy_transaction_id UUID NOT NULL REFERENCES policy_transactions (id),
  sl_broker_id       UUID NOT NULL REFERENCES producers (id),
  sl_license_id      UUID NOT NULL REFERENCES producer_licenses (id),  -- home-state SL license
  home_state         TEXT NOT NULL,
  home_state_basis   TEXT NOT NULL CHECK (home_state_basis IN ('principal_place_of_business',
                       'principal_residence', 'greatest_taxable_premium',
                       'affiliated_group_largest')),
  exempt_commercial_purchaser BOOLEAN NOT NULL DEFAULT FALSE,
  ecp_request_doc_id UUID,                  -- the written request under 15 USC 8205
  taxable_premium    BIGINT NOT NULL,
  sl_tax             BIGINT NOT NULL,
  stamping_fee       BIGINT NOT NULL,
  filing_ref         TEXT,                  -- stamping office or state filing number
  filed_at           TIMESTAMPTZ
);
```

Design notes:

- **The channel rides on the transaction.** A policy written direct and moved to an agent by a producer of record change has two channels across its life; commissions, retention and loss ratios by channel come from the transactions, not a field on the policy.
- **The license and appointment used are recorded,** not looked up later: the check that ran at bind ([Checking Before You Bind and Pay](/books/insurance/producer-licensing#checking-before-you-bind-and-pay)) writes the rows it relied on.
- **Home state is a determination with a basis.** It is computed from the insured's principal place of business and the risk schedule at placement, stored with its basis, and used for the tax, the filing and the governing law; Excess & Surplus Lines extends `sl_placements` with diligent search records.
- **Disclosures are evidence.** A broker's compensation disclosure and the customer's acknowledgment are documents tied to the submission, because a later complaint asks whether they happened before the purchase.

## Auditing

- **Who sold every transaction.** Producer of record, sub-producer, channel, appointment and license on every policy transaction, as of its effective and processed dates.
- **Every producer change, with its letter.** Broker and agent of record changes with their effective dates, letters and commission treatment.
- **Disclosures and acknowledgments.** For brokers and for New York business, what was disclosed, how and when, retained at least as long as the rule requires.
- **Surplus lines filings and taxes.** Every placement with its home state, basis, tax computed, filing reference and remittance, reconcilable to the stamping office's records.

## What This Means for the System You Build

- **Put channel, producer of record, appointment and license on every policy transaction,** not on the policy or the carrier.
- **Know whether the producer acted as the insurer's agent or the buyer's broker,** and require the disclosures each role triggers.
- **Model producer of record changes as dated events with documents** and explicit commission treatment.
- **Measure channel economics from transactions, losses and expenses by channel,** over the customer's lifetime, not from commission rates.
- **Compute the surplus lines home state once per placement,** store its basis, and tax the whole premium there.

## References

**Law and regulation**

- [15 USC 8201](https://www.law.cornell.edu/uscode/text/15/8201), only the home state may require premium tax on nonadmitted insurance, compacts for allocation, effective July 21, 2011
- [15 USC 8204](https://www.law.cornell.edu/uscode/text/15/8204), limits on state eligibility requirements for nonadmitted insurers
- [15 USC 8205](https://www.law.cornell.edu/uscode/text/15/8205), no diligent search for exempt commercial purchasers after disclosure and a written request
- [15 USC 8206](https://www.law.cornell.edu/uscode/text/15/8206), definitions of home state and exempt commercial purchaser, with the size tests and inflation adjustment
- [11 NYCRR 30.3](https://www.law.cornell.edu/regulations/new-york/11-NYCRR-30.3), New York's producer compensation disclosure: what to disclose at application, on request, after issuance and by estimate

**NAIC**

- [NAIC: Producer Licensing Model Act (Model 218) (PDF)](https://content.naic.org/sites/default/files/model-law-218.pdf), a license creates no authority to represent an insurer, and the section 18 compensation disclosure rule and its exemption for appointed producers

**Regulators and guidance**

- [New York DFS: Regulation 194 FAQs](https://www.dfs.ny.gov/apps_and_licensing/insurance_companies/faqs/regulation_194), retention of written disclosures for three years
- [Surplus Lines Stamping Office of Texas](https://www.sltx.org/), SMART filing, broker of record and policy audits
- [WSIA and FSLSO: US Surplus Lines Service Offices 2025 Annual Assessment, March 2026 (PDF)](https://slipplus.com/wp-content/uploads/documents/WSIA-SLAS-States-Report-March-2026.ai_SW.pdf), surplus lines tax and stamping fee rates for Texas, Florida and other states

**Filings**

- [Allstate: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/899051/000089905126000031/all-20251231.htm), exclusive agents, independent agent locations, direct representatives, retail stores and how each is paid
- [Progressive: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/80661/000008066126000086/pgr-20251231.htm), independent agencies, the definition of direct, agency and direct shares, agents' lack of rating, underwriting and claims authority
- [Progressive: December 2025 and full-year results (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/80661/000008066126000071/pgr202512ex991earningsrele.htm), GAAP combined ratios for agency auto and direct auto
- [Travelers: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/86312/000008631226000065/trv-20251231.htm), independent agents and brokers and business insurance field offices
- [Erie Indemnity: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/922621/000162828026010666/erie-20251231.htm), independent agencies as the sole distribution channel
- [Goosehead Insurance: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1726978/000172697826000010/gshd-20251231.htm), the franchise agreement, royalty rates, franchise count and revenue by type
- [Root: Q4 2025 shareholder letter (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1788882/000178888226000013/q42025shareholderletter.htm), direct, partnership and independent agent channels
- [Root: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1788882/000178888226000014/root-20251231.htm), the embedded product with Carvana
- [Ryan Specialty: Fourth quarter 2025 results (Form 8-K, Exhibit 99.1)](https://www.sec.gov/Archives/edgar/data/1849253/000184925326000004/ryan-20251231xex991.htm), wholesale brokerage, binding authority and underwriting management
- [EverQuote: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1640428/000119312526066957/ever-20251231.htm), carriers and agencies served, the agency market, carrier subsidies and revenue recognized at delivery
- [MediaAlpha: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1818383/000181838326000049/max-20251231.htm), transaction value

**In practice**

- [State Farm: About us](https://www.statefarm.com/about-us), 19,000 agents
