+++
title = "Agencies & Media Buying"
nav_title = "Agencies & Buying"
description = "Holding companies, trading desks, agent and principal buying, media plans, RFPs and IOs, commissions and fees, rebates and the K2 report, and in-housing."
category = "Advertising Industry"
order = 2903
part = "The Business"
tags = ["advertising", "agencies", "media-buying", "principal-media", "transparency", "data-model"]
+++

A media agency spends someone else's money. An advertiser hires it to decide where the budget should go (planning), to negotiate and place the buys (buying), to run the campaigns on the platforms, and to report and bill what ran. For most large advertisers the agency belongs to one of five holding companies, which pool the buying of many clients, own trading desks that buy programmatically, and increasingly buy inventory for their own account and resell it. Between the advertiser and every publisher, platform and DSP, the agency is the party that signs, operates and pays.

The software is hard because the agency's position is ambiguous by design. On one buy it is the advertiser's agent, passing media through at cost under the advertiser's name; on the next it is a principal, selling inventory it bought itself at a price the advertiser can't see behind. It may receive rebates from the sellers it buys from. It is paid by fees, commissions or incentives under an agreement the publisher never sees, while the publisher's insertion order names the agency as the buyer and limits the agency's liability to what the advertiser has paid it. An advertiser auditing its spend, a publisher chasing an unpaid invoice and an agency reporting revenue each need a different answer to "who bought this, at what price, and who owes whom", and the records have to support all three. This chapter covers the holding companies and how they buy, the agency's job from plan to invoice, agent and principal buying, trading desks, how agencies are paid, rebates and the transparency fight that followed the ANA's 2016 K2 report, and in-housing. It extends `organizations`, `ad_accounts` and `insertion_orders` from [The Core Data Model](/books/advertising/advertising-business#the-core-data-model). The insertion order's terms (cancellation, controlling measurement, the 10% rule) are [Insertion Orders & Standard Terms](/books/advertising/insertion-orders-and-terms); the revenue accounting is [Advertising Revenue Accounting](/books/advertising/advertising-revenue-accounting); the advertiser's own channel strategy and attribution are Commerce's [Acquisition & Attribution](/books/commerce/acquisition-and-attribution).

## How the Platforms Do It

As of November 2026, how the five holding companies describe their media business and its revenue, from their 2025 filings and results:

| Holding company | Media business as reported | Revenue basis | What the filing says about buying |
| --- | --- | --- | --- |
| **Dentsu** | Not broken out in the results release | Net revenue ¥1,197,530 million of ¥1,435,245 million revenue | Results release does not describe the buying basis |
| **Havas** | Havas Media, 38% of net revenue | Net revenue €2,783 million of €2,913 million revenue | Release does not describe the buying basis |
| **Omnicom** | Media & Advertising discipline, $10,015.9 million of $17,271.9 million revenue; Omnicom Media networks include OMD and PHD | Revenue net of third-party costs where acting as agent; gross where principal | Agencies buy "as an agent for a disclosed principal"; "certain media buying businesses" act "as principal when we control the buying process for the purchase of the media" |
| **Publicis** | Connected Media, 60% of net revenue | Net revenue €14,547 million; pass-through revenue €2,852 million, up 38.1% | Net revenue excludes pass-through "production & media costs" |
| **WPP** | WPP Media | Revenue less pass-through costs £10,176 million of £13,550 million revenue | Release does not describe the buying basis |

Three patterns:

- **Revenue is the agency's cut, not the media.** Every holding company headlines a net figure: revenue after media and production costs passed through to clients. The media billed through these companies is a multiple of their revenue and is not disclosed as a total.
- **Principal buying is disclosed as a policy, not a number.** Omnicom's 10-K describes when it acts as principal in media; none of the releases gives the share of media bought that way.
- **Holding companies are concentrated customers.** The Trade Desk's 10-K says "two holding companies would have each represented more than 10% of our gross billings in 2025," and Omnicom's top 100 clients were about 54% of its revenue, each served by about 55 of its agencies on average.

## The Agency's Job

From brief to invoice, a buy moves through the same stages whatever the channel:

1. **Brief and plan.** The advertiser sets a budget, a goal and an audience. The planner turns it into a **media plan**: channels, vendors and placements, flight dates, planned impressions or ratings points, planned cost and the metric each line is judged on. A plan is a forecast and a budget allocation, not a commitment.
2. **RFP and proposals.** For direct buys the agency sends requests for proposals to publishers and platforms with the audience, dates, formats, budget range and terms; sellers answer with packages, rates and added value. Programmatic lines skip this and go to a DSP or a trading desk with a budget and targeting.
3. **Negotiation and the insertion order.** Accepted proposals become **insertion orders** signed by the agency (or the advertiser), usually on the IAB/4A's standard terms or the seller's own, with rates, deliverables, the controlling measurement and the cancellation terms. Deals for programmatic buying (a PMP or programmatic guaranteed deal) are set up between the seller and the agency's or advertiser's seat.
4. **Trafficking and activation.** Creatives go to the publisher or the ad server, tracking tags are attached, line items are built in DSPs and self-serve platforms, and the agency's ad server records the placements it will count against.
5. **Optimization and reporting.** During the flight the agency moves budget between lines and platforms toward the goal and reports delivery, cost and outcomes across all of them in one view.
6. **Reconciliation and billing.** At month end the agency reconciles each seller's invoice against the controlling count, pays the sellers, and invoices the advertiser for media plus its compensation under the agency agreement.

Each stage leaves a record the next one checks: the plan line the IO fulfills, the IO the line item delivers against, the delivery the invoice bills, and the agreement the agency's own fee is computed under. A buy that skipped a stage (an IO with no plan line, a line item with no IO, a fee with no agreement) is what an audit finds first.

**Agencies on self-serve platforms.** On search and social platforms the agency is not a party to an insertion order; it operates the advertiser's account. Google Ads' manager accounts let "third parties such as agencies" view and manage many accounts, with permission levels per user, and "A manager account is required for Ads accounts using monthly invoicing." This is why the core model separates the ad account's owner (`advertiser_id`) from its operator (`operator_org_id`): the agency can change and the advertiser's history stays.

## Agent and Principal

The legal default is that a media agency buys **as an agent for a disclosed principal**: it places media in the advertiser's name, passes the cost through, and the advertiser is ultimately liable. Omnicom's 10-K uses exactly that phrase for "many of our agencies". The IAB/4A's terms build payment on it with **sequential liability**: the publisher may hold the agency liable "solely to the extent proceeds have cleared from Advertiser to Agency", and otherwise looks to the advertiser. Omnicom's 10-K says that in the US and some other markets many of its agencies' contracts with media providers say the agencies are not liable to them under sequential liability until and to the extent the client has paid.

**Principal media** reverses it. The ANA defines it as agencies that "purchase media inventory themselves and resell it to clients, rather than acting solely as agents." The agency commits to inventory in advance (often in bulk, across clients), takes the risk of not reselling it, and sells it to an advertiser at a price that includes its margin, which the advertiser doesn't see. Omnicom's revenue policy says certain media buying businesses act "as principal when we control the buying process for the purchase of the media", recognizing revenue when the media runs. For the accounting, controlling the inventory before transfer is what makes a party principal and puts the gross amount in revenue ([Advertising Revenue Accounting](/books/advertising/advertising-revenue-accounting), in Contracts and Money).

The ANA's March 2026 report on principal media, a survey of 114 client-side marketers fielded from October 2025 to January 2026, found:

| Finding | 2026 report | Prior report |
| --- | --- | --- |
| Used principal media in the past year | 58% | 47% |
| Expect to use it in the coming year | 56% | 41% |
| Use increased in the past year | 37% | 24% |
| Company has guidelines governing principal media | 57% | |
| Agency contracts address principal media | 63% | |
| Uncertain whether recommended principal media is in their best interest | 90% | 79% (2024) |
| Cite reduced costs as the main benefit | 76% | |
| Most common channels | Television 74%, digital open web 43% | |

The ANA's recommendation is to "explicitly address principal media in agency agreements" and set approval and transparency requirements before such transactions; its chief executive said marketers "should always understand whether their agency is acting as an agent or a principal in any media transaction." The 2016 K2 report put a number on the opacity: sources described "markups on media sold through principal transactions" that "can range from approximately 30% to 90%". That range comes from interviews in 2015 and 2016, not from a measured sample, and no later public study has replaced it. <!-- source-gap: adv-principal-media-markup | missing | a current measured range of agency markups on principal media | closes with: an audited industry study or regulator report measuring principal media margins | checked: 2026-11-22 -->

For the system, the rule is that **every buy carries its basis**. A line bought as agent passes through at the seller's price and the agency's compensation is a separate amount under the agreement; a line bought as principal is sold at the agency's price, the seller's price is the agency's cost, and the advertiser's consent to principal buying (where its agreement requires it) is recorded before the line runs. A report that sums the two as "media" hides the only difference the advertiser cares about.

## Trading Desks

A trading desk is the programmatic buying unit inside an agency or holding company: a team (and often a brand) that runs DSP seats, sets up deals with SSPs and publishers, manages data and verification vendors, and buys on behalf of the group's clients. Holding companies built them so programmatic spend from many clients would run through seats they control, with pooled data and negotiated supply terms.

A trading desk can work either way. As agent, it buys in the advertiser's name on a DSP seat and charges a fee; ISBA and PwC's 2020 study found an agency fee of 7% of advertiser spend on the UK programmatic path ([An Open-Auction Programmatic Impression](/books/advertising/advertising-business#an-open-auction-programmatic-impression)). As principal, it buys inventory or audience packages and resells them at a fixed CPM, and the media cost, the DSP fee and the data fees disappear into the price. The 2020 study told advertisers to "insist their agency has a separate seat for each client, and that log level data be readily available", and ISBA's second study (published January 2023) repeated the recommendation of "separate DSP seats for each advertiser". [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality) covers what the studies found at each hop.

## How Agencies Are Paid

Agency compensation is in the agency agreement between the advertiser and the agency, never in the insertion order. Omnicom's 10-K lists the forms: "fees for service on a rate per hour or per project basis", fees based on "an agreed fee or rate per hour for the level of effort expended by our employees", "commissions based on the client's spending for media purchased from third parties", and "qualitative or quantitative incentive provisions specified in the contract."

| Model | How it works | What the system must compute |
| --- | --- | --- |
| **Labor-based fee** | Hours or full-time equivalents by role, at agreed rates, often reconciled against a staffing plan | Hours or FTEs by month against the plan, overage and underage |
| **Fixed or output-based fee** | A price per deliverable or per period, regardless of hours | Deliverables completed; the period fee |
| **Media commission** | A percentage of media spend placed | Spend by line and period, on the agreed basis (gross or net media, with or without fees), times the rate |
| **Performance incentive** | A bonus or holdback tied to goals (sales, brand metrics, KPIs, qualitative reviews) | The measured result against the target, with the source, and the payout scale |
| **Principal margin** | The difference between the resale price and the agency's cost on principal lines | Nothing the advertiser sees unless the agreement requires disclosure |

The ANA's 18th Trends in Agency Compensation (December 2022, 101 marketers and 336 agency relationships) found fee-based compensation used by 82% of respondents, up from 68% in 2016; labor-based fees still the most common form, and used by 76% of smaller advertisers; fixed or output-based fees used by 53% of large advertisers ($500 million or more in annual spend), up from 5% in 2016; and performance incentives down to 41%, from 48% in 2016 and 61% in 2013.

A commission's base is where disputes start. A 5% commission (an example rate) on $1,000,000 of media is $50,000 if the base is the media cost the agency paid, and less if the base is media net of a rebate the agency received; if the agency also bought some lines as principal, the base for those lines is the resale price, which already contains the agency's margin. My rule: **the agreement names the base, and the system computes the fee from rows of that base, never from a total someone entered**, so the advertiser's auditor can recompute it.

## Rebates and Transparency

A **rebate** (also called a volume bonus, an agency volume bonus or a free-inventory credit) is value a seller gives an agency in return for the spend the agency places with it, in cash or in free media. Where the agency buys as the advertiser's agent, the advertiser's money produced the rebate, and the question is whether it was disclosed and passed back.

The ANA's Media Transparency Initiative began with a member survey in which 28% of respondents were aware of US media companies giving rebates or incentives to agencies. In June 2015 the ANA issued a request for proposals for an independent study, and K2 Intelligence, with Ebiquity and FirmDecisions, ran it from October 20, 2015 to May 31, 2016, releasing it on June 7, 2016. Its findings, from 143 interviews with 150 individuals (117 directly involved in US media buying):

- **Non-transparent practices were "pervasive" in the sample.** 59 of the 117 media-buying sources reported direct experience with them, 34 citing rebates and 33 principal transactions.
- **Rebates were described as undisclosed or not passed through.** 41 sources said rebate deals occur in the US; 34 described rebates that were undisclosed, not passed through, or demanded by agencies, ranging from 1.67% to about 20% of aggregate media spending, and K2 found corroborating documents.
- **Principal markups of about 30% to 90%** on media sold through principal transactions, as above.
- **Pressure to steer spend** to media companies in which agencies or their holding companies held equity, as former senior agency employees described it; separately, K2 found evidence that senior executives were aware of, and even mandated, some non-transparent practices.
- **A disconnect on duty:** advertisers generally believed agencies owed them more than their contracts said; some agency executives saw the relationship as defined solely by contract.

K2 found evidence across digital, out-of-home, print and television, but interviewed few television and print sources and none from radio, and says the absence of examples in those media is not conclusive. The lasting effect is contractual: advertisers' agency agreements now commonly include audit rights, rebate disclosure and pass-through clauses, and principal-buying consent, which is what an agency's systems must be able to evidence. <!-- source-gap: adv-agency-contract-clauses | missing | the prevalence of audit, rebate pass-through and principal consent clauses in US agency agreements | closes with: a published ANA or 4A's survey of agency agreement terms | checked: 2026-11-22 -->

The transparency questions have since moved into programmatic: what share of spend reaches publishers, what each intermediary keeps, and whether a buy was principal. [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality) covers the ISBA and ANA studies that answer them.

## In-Housing

The ANA's 2023 survey of its members (162 respondents, February and March 2023, released May 2, 2023) found that 82% had an in-house agency, up from 78% in 2018 (the 2013 and 2008 surveys, at 58% and 42%, asked about in-house advertising capabilities rather than an agency). In-housing rarely replaces outside agencies: 92% of those with an in-house agency still worked with external agencies, and on average 61% of the work was done in-house (58% in 2018). Media is the part most often left outside: 54% of in-house agencies handled some media planning or buying.

In-housing media changes the records more than the workflow. The advertiser's own organization becomes the operator of its ad accounts and the signatory of its IOs; DSP seats move to the advertiser's name (a direct contract with the DSP, its own fees and its own log-level data); and the agency agreement shrinks to the work the agency still does. Because the core model keeps `operator_org_id` and `buyer_org_id` separate from the advertiser, moving a function in-house is a change of operator on existing accounts and a new buyer on new IOs, not a migration of history.

## Regulation

Agencies are lightly regulated as buyers; the rules that bind them are contracts, the IAB/4A's terms and competition law. Two FTC actions now shape how holding companies may steer spend. The final consent order on Omnicom's acquisition of Interpublic (September 2025) bars Omnicom from steering advertisers' spend away from publishers based on political or ideological viewpoint unless the advertiser expressly directs it, with a compliance monitor; and in April 2026 the FTC and eight states took action against WPP, Publicis and Dentsu over alleged coordination on a common brand safety standard through GARM and the 4A's, with orders approved by the court. [Brand Safety & Suitability](/books/advertising/brand-safety-and-suitability) covers both; for the agency's systems, the consequence is that **an exclusion of a publisher or category records who directed it** (the advertiser, by name and date, or the agency's own standard), because the orders turn on that difference.

## How to Build It

The core model already separates the advertiser, its ad accounts and the operator, and gives insertion orders a buyer. What it lacks is the agency side's own contract and plan: the agreement under which the agency is paid and may buy as principal, the media plan that the buys fulfill, and the incentives sellers give the agency. The fee itself is not a column here: an agency's commission or fee is a `fee_terms` row (kind `agency_fee`, pointing at the agreement) in [Take Rates & Supply Quality](/books/advertising/take-rates-and-supply-quality), the one table for every fee one party charges another. Five new tables and two altered ones:

```sql
CREATE TABLE agency_agreements (           -- advertiser x agency: scope, pay, buying basis
  id                       UUID PRIMARY KEY DEFAULT uuidv7(),
  advertiser_id            UUID NOT NULL REFERENCES advertisers (id),
  agency_org_id            UUID NOT NULL REFERENCES organizations (id),
  scope                    TEXT[] NOT NULL CHECK (scope <@ ARRAY['planning', 'buying',
                             'programmatic', 'search', 'social', 'creative', 'data',
                             'reporting']::TEXT[] AND cardinality(scope) > 0),
  compensation_model       TEXT NOT NULL CHECK (compensation_model IN ('labor_fee', 'fixed_fee',
                             'commission', 'hybrid')),
  incentive_terms          JSONB NOT NULL DEFAULT '{}',  -- KPIs, targets, payout scale
  principal_buying         TEXT NOT NULL DEFAULT 'prohibited' CHECK (principal_buying IN
                             ('prohibited', 'per_buy_approval', 'allowed_disclosed')),
  rebates                  TEXT NOT NULL DEFAULT 'pass_through' CHECK (rebates IN
                             ('pass_through', 'disclosed_retained', 'not_addressed')),
  audit_rights             BOOLEAN NOT NULL DEFAULT TRUE,
  currency                 CHAR(3) NOT NULL,
  valid_during             DATERANGE NOT NULL,
  document_ref             TEXT NOT NULL,  -- the signed agreement and version
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  EXCLUDE USING gist (advertiser_id WITH =, agency_org_id WITH =, valid_during WITH &&)
);

CREATE TABLE media_plans (                 -- the plan the buys fulfill
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  agency_agreement_id  UUID REFERENCES agency_agreements (id),  -- null: in-house plan
  advertiser_id        UUID NOT NULL REFERENCES advertisers (id),
  name                 TEXT NOT NULL,
  currency             CHAR(3) NOT NULL,
  budget_minor         BIGINT NOT NULL CHECK (budget_minor >= 0),
  flight               DATERANGE NOT NULL,
  version              INT NOT NULL DEFAULT 1,
  status               TEXT NOT NULL CHECK (status IN ('draft', 'client_review', 'approved',
                         'superseded', 'closed')),
  approved_by          TEXT,               -- the advertiser's approver
  approved_at          TIMESTAMPTZ,
  CHECK (status <> 'approved' OR approved_at IS NOT NULL)
);

CREATE TABLE media_plan_lines (            -- one planned placement or programmatic budget
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  media_plan_id        UUID NOT NULL REFERENCES media_plans (id),
  channel              TEXT NOT NULL CHECK (channel IN ('search', 'social', 'display',
                         'video', 'ctv', 'linear_tv', 'audio', 'podcast', 'retail_media',
                         'dooh', 'print', 'other')),
  vendor_org_id        UUID REFERENCES organizations (id),  -- publisher, platform or DSP
  buy_basis            TEXT NOT NULL DEFAULT 'agent' CHECK (buy_basis IN ('agent',
                         'principal', 'advertiser_direct')),
  pricing_model        TEXT NOT NULL,       -- as line_items.pricing_model, or 'cpp' for TV
  planned_quantity     BIGINT,              -- impressions, clicks, views or rating points x100
  planned_cost_minor   BIGINT NOT NULL CHECK (planned_cost_minor >= 0),
  flight               DATERANGE NOT NULL,
  kpi                  TEXT,                -- the metric this line is judged on
  insertion_order_id   UUID REFERENCES insertion_orders (id),  -- once bought direct
  campaign_id          UUID REFERENCES campaigns (id),          -- once bought on a platform
  principal_approval   TEXT,                -- the advertiser's approval reference
  CHECK (buy_basis <> 'principal' OR principal_approval IS NOT NULL)
);

CREATE TABLE vendor_incentives (           -- rebates and volume bonuses a seller gives an agency
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  seller_org_id        UUID NOT NULL REFERENCES organizations (id),
  agency_org_id        UUID NOT NULL REFERENCES organizations (id),  -- often the holding company
  kind                 TEXT NOT NULL CHECK (kind IN ('cash_rebate', 'volume_bonus',
                         'free_inventory', 'other')),
  terms                JSONB NOT NULL,      -- tiers by spend, period, eligible products
  valid_during         DATERANGE NOT NULL,
  document_ref         TEXT NOT NULL
);

CREATE TABLE vendor_incentive_allocations (  -- each incentive traced to the advertisers whose spend earned it
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  vendor_incentive_id   UUID NOT NULL REFERENCES vendor_incentives (id),
  advertiser_id         UUID NOT NULL REFERENCES advertisers (id),
  period                DATERANGE NOT NULL,
  qualifying_spend_minor BIGINT NOT NULL,
  amount_minor          BIGINT NOT NULL,    -- the advertiser's share of the incentive
  currency              CHAR(3) NOT NULL,
  treatment             TEXT NOT NULL CHECK (treatment IN ('passed_through', 'retained_disclosed',
                          'retained')),
  invoice_line_id       UUID REFERENCES invoice_lines (id)  -- the 'rebate' credit, when passed through
);

ALTER TABLE ad_accounts ADD COLUMN agency_agreement_id UUID;
ALTER TABLE ad_accounts ADD CONSTRAINT ad_accounts_agency_agreement_fk
  FOREIGN KEY (agency_agreement_id) REFERENCES agency_agreements (id) NOT VALID;

ALTER TABLE insertion_orders
  ADD COLUMN agency_agreement_id UUID,
  ADD COLUMN buy_basis TEXT NOT NULL DEFAULT 'agent';
ALTER TABLE insertion_orders ADD CONSTRAINT insertion_orders_agency_agreement_fk
  FOREIGN KEY (agency_agreement_id) REFERENCES agency_agreements (id) NOT VALID;
ALTER TABLE insertion_orders ADD CONSTRAINT insertion_orders_buy_basis_check
  CHECK (buy_basis IN ('agent', 'principal', 'advertiser_direct')) NOT VALID;

CREATE INDEX media_plan_lines_io_idx ON media_plan_lines (insertion_order_id);

-- after backfilling agreements onto existing accounts and IOs
ALTER TABLE ad_accounts VALIDATE CONSTRAINT ad_accounts_agency_agreement_fk;
ALTER TABLE insertion_orders VALIDATE CONSTRAINT insertion_orders_agency_agreement_fk;
ALTER TABLE insertion_orders VALIDATE CONSTRAINT insertion_orders_buy_basis_check;
```

A principal line can only be created under an agreement that allows it. The check belongs in the service that writes the line, where it can read the agreement in force on the line's flight:

```go tab="Go"
var ErrPrincipalNotAllowed = errors.New("agreement does not allow principal buying")

// CheckBuyBasis rejects a plan line the agency agreement doesn't permit.
func CheckBuyBasis(a AgencyAgreement, line PlanLine) error {
	if line.BuyBasis != BasisPrincipal {
		return nil
	}
	switch a.PrincipalBuying {
	case "allowed_disclosed":
		return nil
	case "per_buy_approval":
		if line.PrincipalApproval == "" {
			return fmt.Errorf("line %s: %w without an approval", line.ID, ErrPrincipalNotAllowed)
		}
		return nil
	default: // "prohibited"
		return fmt.Errorf("line %s: %w", line.ID, ErrPrincipalNotAllowed)
	}
}
```

```rust tab="Rust"
#[derive(Debug, thiserror::Error)]
pub enum BuyBasisError {
    #[error("line {0}: agreement does not allow principal buying")]
    NotAllowed(Uuid),
    #[error("line {0}: principal buying needs an approval under this agreement")]
    NeedsApproval(Uuid),
}

/// Rejects a plan line the agency agreement doesn't permit.
pub fn check_buy_basis(a: &AgencyAgreement, line: &PlanLine) -> Result<(), BuyBasisError> {
    if line.buy_basis != BuyBasis::Principal {
        return Ok(());
    }
    match a.principal_buying {
        PrincipalBuying::AllowedDisclosed => Ok(()),
        PrincipalBuying::PerBuyApproval if line.principal_approval.is_some() => Ok(()),
        PrincipalBuying::PerBuyApproval => Err(BuyBasisError::NeedsApproval(line.id)),
        PrincipalBuying::Prohibited => Err(BuyBasisError::NotAllowed(line.id)),
    }
}
```

The commission for a billing period is a sum over delivered media at the agreement's `agency_fee` term, with rebates subtracted only when the term's basis is net media (`net_media`; a commission on media plus fees is basis `gross_spend` and also sums the fee lines, left out here). In micros of the currency, rounded once to minor units on the invoice line:

```sql
-- percentage commission owed under one agreement for one month, from its fee term
SELECT a.id AS agency_agreement_id,
       SUM(d.cost_micros) AS media_micros,
       COALESCE(r.rebate_minor, 0) AS rebates_minor,
       ROUND((SUM(d.cost_micros) / 10000.0
              - CASE WHEN f.basis = 'net_media' THEN COALESCE(r.rebate_minor, 0)
                     ELSE 0 END)
             * f.rate_bp / 10000.0) AS commission_minor  -- USD: micros / 10,000 = cents
FROM agency_agreements a
JOIN fee_terms f ON f.agency_agreement_id = a.id AND f.kind = 'agency_fee'
  AND f.method = 'percent' AND f.basis IN ('media_cost', 'net_media')
  AND f.valid_during @> $1::date
JOIN ad_accounts acc ON acc.agency_agreement_id = a.id
JOIN campaigns c ON c.ad_account_id = acc.id
JOIN line_items li ON li.campaign_id = c.id
JOIN delivery_daily d ON d.line_item_id = li.id
LEFT JOIN insertion_orders io ON io.id = c.insertion_order_id
LEFT JOIN LATERAL (
  SELECT SUM(amount_minor) AS rebate_minor
  FROM vendor_incentive_allocations v
  WHERE v.advertiser_id = a.advertiser_id AND v.treatment = 'passed_through'
    AND v.period && daterange($1, $2)
) r ON TRUE
WHERE a.id = $3
  AND d.day >= $1 AND d.day < $2
  AND d.source = COALESCE(io.controlling_measurement, 'first_party')
GROUP BY a.id, f.basis, f.rate_bp, r.rebate_minor;
```

The divisor converts micros to cents for a two-decimal currency; a real system reads the exponent from the currency table ([Exponents Come From a Table](/docs/money/amounts#exponents-come-from-a-table)) and records the rounding on the invoice line.

Design notes:

- **The agency agreement is the advertiser's contract, not the publisher's.** Insertion orders and deals reference it so a buy can be traced to the terms the agency bought under, but sellers never see its compensation fields; access to `agency_agreements` follows the advertiser and the agency, and a publisher-facing export leaves it out.
- **Buy basis lives on the buy.** `media_plan_lines.buy_basis` and `insertion_orders.buy_basis` say whether each buy was agent, principal or direct from the advertiser, so revenue reporting (gross for principal, net for agent) and the advertiser's audit read the same field.
- **Principal needs consent, recorded first.** The check constraint requires an approval reference on principal lines, and the service refuses principal lines the agreement prohibits. The approval is a dated record from the advertiser, not a flag the agency sets.
- **Rebates are traced to the spend that earned them.** A holding company's incentive is earned on pooled spend; `vendor_incentive_allocations` divides it among the advertisers whose spend qualified, by the method in the agreement, and records whether each share was passed through (as a `rebate` invoice line) or retained under disclosure. Without the allocation an advertiser can't be told what its spend earned.
- **Plans are versioned, buys point at the version they fulfilled.** A plan revised mid-flight becomes a new version; the old one is `superseded`, and lines already bought keep their link, so planned against actual compares like with like.
- **An exclusion records who directed it.** Publisher and category exclusions applied by an agency carry the directing party and date (the advertiser's instruction or the agency's own standard), because the FTC orders distinguish the two; [Brand Safety & Suitability](/books/advertising/brand-safety-and-suitability) models the lists themselves.
- **Sequential liability is a payment state, not just a term.** `insertion_orders.liability` says which rule applies; the payable to the publisher should record when the advertiser's payment cleared, because that date is when the agency's liability starts under the sequential rule. [Advertiser Payments & Credit](/books/advertising/advertiser-payments-and-credit) covers the receivable side and [Payouts & Settlement](/books/payments/payouts-and-settlement) the money movement.

## Auditing

Advertisers audit their agencies, and the audit asks for the agency's records, not the platforms':

- **Every buy's basis and approval.** For each plan line and IO, agent, principal or direct, with the advertiser's approval of every principal buy and the agreement in force on the date.
- **Cost against price on principal lines,** where the agreement grants that visibility, and the resale price on every one.
- **Compensation recomputed from rows.** Fees by hours or deliverables, commissions from the delivered media on the declared base, incentives from the measured result and its source.
- **Every incentive and its allocation.** Each vendor incentive the agency (or its holding company) received, the advertisers whose spend earned it, and what was passed through.
- **Who directed each exclusion.** The directing party and date of every publisher or category exclusion applied to the advertiser's buys.
- **The chain from plan to invoice.** Plan line to IO or campaign, to delivery, to the seller's invoice, to the agency's invoice, so an unbilled or double-billed line is visible.

[Audit Trails](/docs/building-blocks/audit-trails) covers the mechanics; the audit right itself is a field on the agreement.

## What This Means for the System You Build

- **Keep the agency agreement as its own record** with scope, compensation model and base, principal-buying permission, rebate treatment and audit rights, effective-dated per advertiser and agency.
- **Put the buy basis on every buy** (agent, principal, direct) and report gross and net from it, never a blended "media" total.
- **Refuse principal buys the agreement doesn't allow,** and store the advertiser's approval before the line runs.
- **Compute agency compensation from delivery rows** on the base the agreement names, and round once.
- **Trace every vendor incentive to the advertisers whose spend earned it,** and record whether it was passed through.
- **Separate owner from operator** on ad accounts and IOs, so changing agencies or moving media in-house keeps the advertiser's history.
- **Record who directed each exclusion,** the advertiser or the agency.

## References

**Specifications**

- [IAB/4A's: Standard Terms and Conditions for Internet Advertising, version 3.0](https://www.iab.com/wp-content/uploads/2015/06/IAB_4As-tsandcs-FINAL.pdf), sequential liability and the agency as agent for a disclosed principal

**Regulation**

- [FTC: Final consent order in the Omnicom and Interpublic merger (September 2025)](https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-alters-final-consent-order-response-public-comments-preventing-coordination-global-advertising), the bar on viewpoint-based steering of ad spend and the monitor
- [FTC: Action against WPP, Publicis and Dentsu (April 2026)](https://www.ftc.gov/news-events/news/press-releases/2026/04/ftc-takes-action-restore-competition-digital-advertising-ecosystem), the alleged coordination on a brand safety standard and the approved orders

**Filings**

- [Omnicom: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/29989/000002998926000006/omc-20251231.htm), agent for a disclosed principal, sequential liability in media contracts, principal media buying, fee and commission types, revenue by discipline, client concentration
- [The Trade Desk: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1671933/000167193326000014/ttd-20251231.htm), two holding companies over 10% of gross billings

**Reference**

- [ANA: Media Transparency Initiative and the K2 report](https://www.ana.net/content/show/id/industry-initiative-media-transparency), the study's timeline, method and findings on rebates, principal transactions and equity stakes
- [ANA: Governance around principal media failing to keep pace with adoption (March 19, 2026)](https://www.ana.net/content/show/id/pr-2026-03-principalmedia), the principal media definition, survey results and recommendations
- [ANA: Trends in Agency Compensation, 18th edition (December 13, 2022)](https://ana.net/content/show/id/76981), fee-based, fixed-fee and incentive compensation shares
- [ANA: In-house agencies are here to stay (May 2, 2023)](https://ana.net/content/show/id/79185), in-house agency prevalence, external agency use and in-house media
- [ISBA: Second programmatic supply chain study (2023)](https://www.isba.org.uk/article/isbas-programmatic-supply-chain-study-finds-match-rate-increases-and-reduction), the recommendation of separate DSP seats per advertiser, published January 2023
- [ISBA: Programmatic Supply Chain Transparency Study, executive summary (2020)](https://www.isba.org.uk/system/files/media/documents/2020-12/executive-summary-programmatic-supply-chain-transparency-study.pdf), the 7% agency fee on the programmatic path and the separate seat per client
- [Publicis Groupe: Full year 2025 results](https://www.publicisgroupe.com/sites/default/files/press-releases/2026-02/CP_FY%202025_ENG.pdf), net revenue, pass-through revenue and Connected Media's share
- [WPP: Strategy update and 2025 preliminary results](https://www.wpp.com/en/news/2026/02/strategy-update-and-2025-preliminary-results), revenue less pass-through costs and WPP Media
- [Havas: Full year 2025 results](https://www.havas.com/press_release/havas-achieves-its-2025-guidance-in-full-and-delivers-a-solid-performance-with-organic-growth-of-3-1-and-an-adjusted-ebit-margin-of-12-9-vs-12-4-last-year/), net revenue and Havas Media's share
- [Dentsu Group: FY2025 results against forecast (February 13, 2026)](https://www.group.dentsu.com/en/news/release/pdf-cms/2026004-0213en.pdf), revenue and net revenue

**In practice**

- [Google Ads: About manager accounts](https://support.google.com/google-ads/answer/6139186?hl=en), agencies managing many accounts, access levels, and manager accounts required for monthly invoicing
