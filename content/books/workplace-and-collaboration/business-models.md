+++
title = "Business Models & Unit Economics"
nav_title = "Business Models"
description = "Per-seat SaaS, freemium and product-led growth, land and expand, usage and AI credits, and the metrics vendors report, read from their filings."
category = "Workplace & Collaboration Industry"
order = 2003
part = "The Business"
tags = ["business-models", "unit-economics", "saas", "product-led-growth", "metrics"]
+++

Almost every workplace vendor sells the same thing: a seat, per month, on a plan, renewed by contract. What differs is how the first seat is sold and how the next hundred follow. Slack and Atlassian grew by letting teams adopt the product themselves and pay on a card, then expanding inside the company; Microsoft and Google sell the whole employer at once through IT and partners; Zoom sells both, with a card-paying Online business beside an Enterprise one; Figma and monday.com grow mostly by expanding inside customers they already have. On top of the seat, AI has added a second meter, usage measured in credits, that doesn't follow headcount.

The economics are hard to read from the outside because each vendor defines its own metrics. A net retention rate can be a trailing four-quarter average or a point in time, cover every customer or only those above a revenue threshold, and count annual recurring revenue or recognized revenue. This chapter lays out the models, the land-and-expand motion, usage and AI credits, and the metrics, with figures from each company's latest annual report as of October 2026 and the definition each one uses. Plan and seat mechanics are [Plans, Pricing & Seats](/books/workplace-and-collaboration/plans-pricing-and-seats); the metrics a vendor runs internally, and what a customer measures, are [Workplace Metrics](/books/workplace-and-collaboration/workplace-metrics).

## How the Platforms Do It

| Vendor | First sale | Expansion | Usage meter | Metric the filing leads with |
| --- | --- | --- | --- | --- |
| **Slack (Salesforce)** | Free workspace, upgraded on a card by a team | More members, then an Enterprise contract | AI features tiered by plan | Pre-acquisition: paid customers and net dollar retention rate |
| **Atlassian** | Free plan for 10 users, then self-serve purchase | More users and products, then Enterprise and partners | Rovo credits per user per month | Customers over $10,000 Cloud ARR, Subscription ARR |
| **Microsoft 365** | Enterprise agreement or a CSP partner, rarely a card | Higher suites (E3 to E5 to E7), add-ons like Copilot | Copilot and agents | Microsoft 365 Commercial cloud revenue growth, Copilot paid seats |
| **Google Workspace** | Self-serve signup or a reseller, flexible or annual | Higher editions, more users | Gemini included in plans | Not disclosed separately from Google Cloud |
| **Zoom** | Free Basic, then Online card purchase, or an Enterprise sale | Seats, phone, contact center, AI | AI features by plan | Enterprise net dollar expansion rate, Online monthly churn |
| **Asana** | Free, then self-serve | Seats and higher tiers | AI features by plan | Core customers, dollar-based net retention rate |
| **monday.com** | Self-serve with seat minimums | Seats, products (CRM, Dev, Service) | AI features by plan | Net dollar retention rate by customer size |
| **Figma** | Free Starter, then Professional seats | Organization and Enterprise, more seat types | AI credits per seat | Net dollar retention rate for customers over $10,000 ARR |
| **Dropbox** | Free individual account, then paid plans | Teams plans | Storage | Paying users, ARPU, total ARR |

Sources for each row are in the sections below.

## Per-Seat SaaS

A seat is a license for one user for one period. Pricing per seat ties the vendor's revenue to the customer's headcount, which is the reason it dominates: the buyer can forecast it, the vendor's revenue grows when the customer hires, and the price is easy to compare across vendors. It also ties the vendor to the customer's layoffs, and to arguments about who counts. monday.com's annual report describes its contracts in the standard form, subscriptions that "generally include a fixed number of users and fixed price per user" ([monday.com 20-F 2025](https://www.sec.gov/Archives/edgar/data/1845338/000117891326000870/zk2634436.htm)).

Revenue is recognized ratably over the term, so a three-year contract signed today shows up as revenue month by month, and the signed but unrecognized amount is a liability and a disclosure: Box reported $1.71 billion of remaining performance obligations at January 31, 2026, up 17% ([Box 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1372612/000119312526098466/box-20260131.htm)). Annual recurring revenue (ARR) is the run rate of the active contracts at a point in time, the number most vendors manage to; Atlassian defines its Cloud ARR as Cloud monthly recurring revenue "multiplied by 12" and reported Subscription ARR of $6.61 billion at June 30, 2026 ([Atlassian 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm)).

The margin structure is the reason investors pay for seats. Gross margins across the public independents run from 77% (Zoom) to 89% (Asana, monday.com) ([The Collaboration Landscape](/books/workplace-and-collaboration/workplace-landscape#market-size-from-the-filings)); the cost of serving one more seat is compute, storage and support, and the largest costs are research and development and sales. Atlassian spent 50% of its fiscal 2026 revenue on research and development ([Atlassian 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm)). The free tier is a cost line too: Salesforce's 10-K notes that the costs of Slack's free user base sit in its cost of subscription and support revenues ([Salesforce 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1108524/000110852426000060/crm-20260131.htm)).

## Freemium and Product-Led Growth

Product-led growth means the product, not a salesperson, makes the first sale. A free plan or trial lets a team adopt it without asking anyone; limits built into the free plan (history, users, integrations, storage) create the reason to pay; a self-serve checkout takes a card; and the vendor watches usage to decide where sales should call. Slack's 2019 prospectus put it plainly: usage "is typically initially driven bottoms-up, by end users," the company offers "a self-service approach, for both free and paid subscriptions," and it works to convert "organizations on our free version to upgrade to paid versions" ([Slack S-1](https://www.sec.gov/Archives/edgar/data/1764925/000162828019004786/slacks-1.htm)). At January 31, 2019 Slack had more than 88,000 paid customers, 575 of them paying over $100,000 a year and contributing about 40% of revenue, and more than 10 million daily active users across free and paid plans ([Slack S-1](https://www.sec.gov/Archives/edgar/data/1764925/000162828019004786/slacks-1.htm)).

Atlassian is the other reference case, and its filings describe the model without the label: "automated and low-touch customer service" for new customers, a "land-and-expand" strategy, self-service purchasing, and a business that does "not have to solely rely on a traditional, commissioned direct sales force" until a customer reaches a certain size, after which a direct sales force works with large customers ([Atlassian 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm)). The same filing says over half of revenue now comes through channel partners, which is the point: product-led growth lands the customer, and partners and salespeople expand it.

Free plans have to be designed as products with their own economics:

- **The limit is the upgrade trigger.** Slack's free plan keeps 90 days of message history and 10 app integrations ([Slack: pricing](https://slack.com/pricing)); Jira's is free for 10 users ([Jira pricing](https://www.atlassian.com/software/jira/pricing)); Zoom's Basic plan caps meetings at 40 minutes ([Zoom: pricing](https://zoom.us/pricing)); Figma's Starter plan rations AI credits per day ([Figma: pricing](https://www.figma.com/pricing/)). Each limit is chosen to hit when a team is already dependent on the product.
- **Free users cost money.** Storage, compute, support and abuse handling all scale with free accounts, so the free tier is budgeted, not incidental. Abuse of free tiers is its own problem ([Fraud Exposure](/books/hosting-and-cloud/free-tiers-and-credits#fraud-exposure)).
- **Card-paying customers churn monthly.** Zoom's Online customers, mostly self-serve, churned an average of 2.8% a month in fiscal 2026, against 2.9% a year earlier ([Zoom 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1585521/000158552126000030/zm-20260131.htm)). That is the cost of a business with no contract term; monthly plans are priced above annual ones partly for it.
- **The admin arrives late.** A product-led customer has content and habits before it has an administrator. The vendor needs the claiming and consolidation path ([The Life of a Customer](/books/workplace-and-collaboration/workplace-business#the-life-of-a-customer)) as much as the signup page.

## Bottom-Up and Top-Down

The two motions sell the same product to different buyers:

| | Bottom-up (product-led, land and expand) | Top-down (enterprise sales) |
| --- | --- | --- |
| **First buyer** | A team lead with a card | IT, procurement and security, after an evaluation |
| **First deal** | A few seats, monthly | Hundreds or thousands of seats, annual or multi-year |
| **Sales cost** | Low per deal; marketing and product do the work | High per deal; account executives, solutions engineers, security reviews |
| **Expansion** | More teams adopt; workspaces consolidate | More products and higher editions on the same contract |
| **Contract** | Online terms, card, self-serve changes | Negotiated order form, DPA, invoice, purchase order |
| **Risk** | Monthly churn, shadow IT, scattered workspaces | Long cycles, discounting, seat shelfware |

Most vendors run both. Zoom reports them as two businesses: Enterprise customers produced 60.3% of fiscal 2026 revenue and Online customers 39.7% ([Zoom 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1585521/000158552126000030/zm-20260131.htm)). Microsoft and Google run almost entirely top-down for large customers, through enterprise agreements and partners, with self-serve for small businesses (Microsoft caps its Business suites at 300 licenses across the Basic, Standard and Premium family ([Microsoft Learn: pricing and offers](https://learn.microsoft.com/en-us/partner-center/pricing/pricing-and-offers)); Google's Business editions stop at 300 users ([Google Workspace: pricing](https://workspace.google.com/pricing))). The independents run bottom-up to land and top-down to expand, which is why [From Self-Serve to Enterprise](/books/workplace-and-collaboration/selling-to-enterprises) exists as a chapter.

The cost of acquiring a customer (CAC) and the time it takes for that customer's gross margin to pay it back (CAC payback) are the numbers that decide which motion works. None of the vendors in this chapter discloses either in its annual report; they are reconstructed by analysts from sales and marketing spend and new ARR, and the reconstruction depends on assumptions the filings don't state. My rule is to compute CAC payback per motion, not blended: a bottom-up seat and an enterprise seat have different acquisition costs, and a blended average hides which motion is subsidizing the other.

## Retention and Expansion

Net dollar retention (NDR, also net revenue retention or net dollar expansion) is the metric that tells whether existing customers spend more over time: take a cohort's recurring revenue a year ago, take the same customers' revenue now, including expansion, contraction and churned customers at zero, and divide. Above 100% means the installed base grows even with no new customers. The definitions, as each filing states them:

| Company | Metric and value | Definition |
| --- | --- | --- |
| **Figma** | Net Dollar Retention Rate, 136% at December 31, 2025 (134% a year earlier) | Current ARR of customers who were above $10,000 ARR twelve months earlier, divided by their ARR then ([Figma 10-K 2025](https://www.sec.gov/Archives/edgar/data/1579878/000162828026009228/fig-20251231.htm)) |
| **monday.com** | Net dollar retention rate, 110% overall, 116% for customers over $50,000 and over $100,000 ARR | Same customers' ARR now over twelve months ago, a weighted average of the four quarterly calculations ([monday.com 20-F 2025](https://www.sec.gov/Archives/edgar/data/1845338/000117891326000870/zk2634436.htm)) |
| **Zoom** | Trailing 12-month net dollar expansion rate for Enterprise customers, 98% at January 31, 2026 | Current Period ARR from the Enterprise customers of twelve months earlier divided by their Prior Period ARR, averaged over the trailing twelve months ([Zoom 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1585521/000158552126000030/zm-20260131.htm)) |
| **Asana** | Dollar-based net retention rate, 96% overall and for customers spending $100,000 or more; 97% for Core customers | The simple average of four quarterly rates, each comparing current-quarter revenue from customers who also had revenue in the prior-year quarter against that group's prior-year revenue, excluding new customers ([Asana 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1477720/000147772026000021/asan-20260131.htm)) |
| **Slack, 2019** | Net Dollar Retention Rate, 143% at January 31, 2019 | Expansion within the Paid Customer base, sales-driven and organic ([Slack S-1](https://www.sec.gov/Archives/edgar/data/1764925/000162828019004786/slacks-1.htm)) |

The differences matter more than the numbers. Figma's rate excludes customers below $10,000 ARR a year earlier, which removes the smallest and most volatile accounts; Asana's uses recognized revenue, not ARR, and covers every paying customer; Zoom's covers only Enterprise customers and leaves the Online business to the churn rate. A 96% that includes everyone and a 136% that excludes small customers aren't measurements of the same thing. Gross retention (the same calculation with expansion capped at zero) is the number that isolates churn and contraction, and few workplace vendors disclose it. Salesforce discloses an attrition rate of about eight percent and excludes "Slack self-service" from it ([Salesforce 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1108524/000110852426000060/crm-20260131.htm)).

Expansion comes from four sources, and a vendor's mix says what kind of business it is: more seats (headcount and adoption), more products (the suite play: Zoom Phone, Jira Service Management, monday CRM), higher editions (Microsoft's ladder from E3 to E5 to E7, with E7 including E5, Copilot, Agent 365 and the Entra Suite at $99 a user a month ([Microsoft 365 Enterprise plans](https://www.microsoft.com/en-us/microsoft-365/enterprise/microsoft-365-plans-and-pricing))), and price increases at renewal. Contraction has the mirror sources: layoffs, seat reclaim by license-management tools, downgrades, and consolidation onto a suite.

Customers above a revenue threshold are the other expansion signal the filings share: Atlassian had 57,334 customers above $10,000 of Cloud ARR at June 30, 2026, against 51,978 a year earlier ([Atlassian 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm)); Figma 1,405 above $100,000 ARR, up 46% ([Figma 10-K 2025](https://www.sec.gov/Archives/edgar/data/1579878/000162828026009228/fig-20251231.htm)); monday.com 1,756 above $100,000, up from 1,207 ([monday.com 20-F 2025](https://www.sec.gov/Archives/edgar/data/1845338/000117891326000870/zk2634436.htm)); Asana 817 spending $100,000 or more, up from 726 ([Asana 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1477720/000147772026000021/asan-20260131.htm)); Zoom 4,468 contributing more than $100,000 of trailing revenue, 32.8% of the total ([Zoom 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1585521/000158552126000030/zm-20260131.htm)).

## Seat Contraction and the Per-User Ceiling

Per-seat pricing has a ceiling the vendor doesn't control: the customer's headcount. When customers cut staff, seats fall at renewal regardless of how much the product is used, and a vendor whose expansion depended on seat growth sees net retention fall below 100%. Asana's and Zoom's sub-100% rates in the table above are what that looks like in a filing. Dropbox, the most consumer-weighted business in the set, reported paying users down from 18.22 million to 18.08 million in 2025 and attributed part of its revenue decline to "a difficult Teams environment" ([Dropbox 10-K 2025](https://www.sec.gov/Archives/edgar/data/1467623/000146762326000008/dbx-20251231.htm)).

Vendors respond in three ways, all visible in current pricing: charging per seat type so cheaper seats replace removed ones (Figma's Collab and Dev seats), charging per unit of usage that doesn't track headcount (AI credits, phone minutes, storage), and raising the edition rather than the seat count (bundling AI into higher tiers). Each changes what the billing system has to count, which is why [Plans, Pricing & Seats](/books/workplace-and-collaboration/plans-pricing-and-seats) treats seat definitions as a design problem.

## Usage and AI Credits

AI broke the seat model's cost assumption. A seat used to cost the vendor roughly the same whether its holder sent ten messages or a thousand; a seat whose holder asks an assistant to summarize every thread costs the vendor model inference each time. Vendors priced the first generation of AI as per-seat add-ons, then moved most of it into plans with a usage allowance:

- **Credits per seat, included.** Atlassian includes Rovo credits per user per month by plan (25 on Standard, 70 on Premium, 150 on Enterprise) and says in its annual report it made Rovo "available at no additional cost" to Standard, Premium and Enterprise customers ([Jira pricing](https://www.atlassian.com/software/jira/pricing), [Atlassian 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm)). Figma includes monthly AI credits by seat type, 3,000 for a Full seat on Professional and 500 for Dev and Collab seats ([Figma: pricing](https://www.figma.com/pricing/)).
- **AI in the plan, tiered.** Slack lists basic AI on Free and Pro and advanced AI on Business+ ([Slack: pricing](https://slack.com/pricing)); Notion puts its agent, meeting notes and enterprise search in the Business plan ([Notion: pricing](https://www.notion.com/pricing)); Google moved Gemini into Workspace Business and Enterprise plans in January 2025, so a Business Standard customer who had paid $32 a user a month with the Gemini Business add-on paid $14 ([Google Workspace blog, January 2025](https://workspace.google.com/blog/product-announcements/empowering-businesses-with-AI)).
- **A paid add-on that stays.** Microsoft 365 Copilot remains $30 a user a month on top of a suite, or arrives inside the E7 bundle ([Microsoft 365 Enterprise plans](https://www.microsoft.com/en-us/microsoft-365/enterprise/microsoft-365-plans-and-pricing)), and Microsoft reported over 30 million paid Copilot seats for the quarter ended June 30, 2026 ([Microsoft FY26 Q4 release](https://www.microsoft.com/en-us/investor/earnings/FY-2026-Q4/press-release-webcast)).

Credits turn a per-seat business into a hybrid one: a committed seat fee plus metered usage against an allowance, with overage, top-ups or hard stops when the allowance runs out. The rating and invoicing mechanics are the Hosting & Cloud volume's ([Allowances, Tiers and Monthly Caps](/books/hosting-and-cloud/metering-and-rating#allowances-tiers-and-monthly-caps)); the workplace twist is that the consumer of the credits is a member, the payer is the organization, and the admin wants to cap, allocate and report usage per team. AI cost also shows up in gross margin: Figma's fell from 88% to 82% in 2025 ([Figma 10-K 2025](https://www.sec.gov/Archives/edgar/data/1579878/000162828026009228/fig-20251231.htm)).

## Marketplaces and Partners

Two revenue streams sit beside the seat. A marketplace takes a share of third-party apps sold to the vendor's customers; Atlassian reported $330.7 million of "Marketplace and other" revenue in fiscal 2026, up 10% ([Atlassian 10-K FY2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm)). Partners and resellers take a margin in exchange for selling, billing and often administering the customer, which lowers the vendor's revenue per seat and its sales cost at the same time; [Apps & Marketplaces](/books/workplace-and-collaboration/apps-and-marketplaces) and [Billing, Seats & Resellers](/books/workplace-and-collaboration/billing-and-seat-management#resellers-and-the-microsoft-csp-channel) cover each. Cloud marketplaces add a third route, letting an enterprise buy a workplace product against its committed cloud spend ([Marketplaces](/books/hosting-and-cloud/commitments-and-marketplaces#marketplaces)).

## How to Build It

Unit economics are computed from the subscription history in [the core data model](/books/workplace-and-collaboration/workplace-business#the-core-data-model), not stored as numbers someone typed. This chapter adds a monthly ARR snapshot per organization, the classified movement between snapshots, and the retention view built from them, plus the acquisition channel on the organization.

```sql
ALTER TABLE organizations
  ADD COLUMN acquisition_channel TEXT CHECK (acquisition_channel IN ('self_serve', 'sales',
    'partner', 'marketplace')),           -- how the first paid seat was sold
  ADD COLUMN first_paid_at TIMESTAMPTZ;

CREATE TABLE arr_snapshots (             -- recurring revenue per organization, month end
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  as_of            DATE NOT NULL,         -- the last day of the month
  seat_arr         BIGINT NOT NULL DEFAULT 0 CHECK (seat_arr >= 0),   -- minor units, annualized
  addon_arr        BIGINT NOT NULL DEFAULT 0 CHECK (addon_arr >= 0),
  committed_usage_arr BIGINT NOT NULL DEFAULT 0 CHECK (committed_usage_arr >= 0),
  paid_seats       INT NOT NULL DEFAULT 0 CHECK (paid_seats >= 0),
  currency         CHAR(3) NOT NULL,      -- converted at a fixed planning rate for reporting
  PRIMARY KEY (organization_id, as_of)
);

CREATE TABLE arr_movements (             -- why ARR changed between two snapshots
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id  UUID NOT NULL REFERENCES organizations (id),
  as_of            DATE NOT NULL,
  kind             TEXT NOT NULL CHECK (kind IN ('new', 'expansion_seats', 'expansion_product',
                     'expansion_edition', 'price_increase', 'contraction_seats', 'downgrade',
                     'churn', 'reactivation')),
  amount           BIGINT NOT NULL,       -- signed, minor units, annualized
  subscription_id  UUID REFERENCES subscriptions (id),  -- the change that caused it
  UNIQUE (organization_id, as_of, kind, subscription_id)
);

CREATE VIEW net_dollar_retention AS      -- trailing twelve months, cohort = paying a year ago
SELECT (prior.as_of + INTERVAL '12 months')::DATE AS as_of,
       COALESCE(SUM(now_s.seat_arr + now_s.addon_arr + now_s.committed_usage_arr), 0)::NUMERIC
         / NULLIF(SUM(prior.seat_arr + prior.addon_arr + prior.committed_usage_arr), 0)
         AS ndr                           -- churned organizations add zero to the numerator
FROM arr_snapshots prior
LEFT JOIN arr_snapshots now_s
  ON now_s.organization_id = prior.organization_id
 AND now_s.as_of = (prior.as_of + INTERVAL '12 months')::DATE
WHERE prior.seat_arr + prior.addon_arr + prior.committed_usage_arr > 0
GROUP BY prior.as_of;
```

Design notes:

- **Snapshots come from subscriptions, never the reverse.** A nightly job prices each organization's active subscriptions and add-ons at month end; `arr_snapshots` is derived and reproducible. If a past snapshot changes, it's because a subscription was corrected, and the movement rows are recomputed.
- **Classify every movement.** The difference between two snapshots is the sum of its movements, and each movement points at the subscription change that caused it. That is what lets the same data answer "why did ARR fall in March" and "what share of expansion came from AI."
- **Keep the definition in the query.** The view above is one definition (cohort of organizations paying twelve months earlier, ARR basis, churned customers count at zero through the outer join). A threshold variant (Figma's customers above $10,000) or a revenue-basis variant (Asana's) is a different view with a different name, never a parameter that changes silently.
- **Usage is ARR only when committed.** A committed credit pack or minimum usage fee is recurring; metered overage is revenue but not ARR. Mixing them makes NDR move with one customer's busy month.
- **Separate the motions.** `acquisition_channel` lets every metric split by self-serve, sales, partner and marketplace, which is the only way to see CAC payback per motion ([Seat Contraction and the Per-User Ceiling](#seat-contraction-and-the-per-user-ceiling) explains why blended numbers mislead).

## What This Means for the System You Build

- **Price per seat, but count seats as assignments over time,** so expansion, contraction and credits come from rows.
- **Design the free plan's limits as upgrade triggers,** and budget the free tier's cost like any other product line.
- **Build both the self-serve path and the enterprise path,** with a claiming flow that joins them.
- **Snapshot ARR monthly from subscriptions,** classify every movement, and keep each retention definition as its own named query.
- **Separate committed usage from metered overage** before either appears in ARR.
- **Plan for the per-seat ceiling:** seat types, usage allowances and editions are how the vendors in this chapter grow when headcount doesn't.

## References

**Filings**

- [Slack Technologies: Form S-1 (2019)](https://www.sec.gov/Archives/edgar/data/1764925/000162828019004786/slacks-1.htm), bottoms-up adoption, self-service, paid customers, customers over $100,000, daily active users and the 143% net dollar retention rate
- [Atlassian: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1650372/000165037226000036/team-20260630.htm), low-touch and land-and-expand language, channel partners, R&D share, Cloud ARR definition, Subscription ARR, customers over $10,000 Cloud ARR, Rovo at no additional cost and Marketplace revenue
- [Zoom Communications: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1585521/000158552126000030/zm-20260131.htm), Enterprise and Online revenue shares, online average monthly churn, net dollar expansion rate and its definition, customers over $100,000
- [Asana: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1477720/000147772026000021/asan-20260131.htm), dollar-based net retention rate and its definition, customers spending $100,000 or more
- [monday.com: Form 20-F for 2025](https://www.sec.gov/Archives/edgar/data/1845338/000117891326000870/zk2634436.htm), contract structure, net dollar retention rates and definition, customers over $100,000
- [Figma: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1579878/000162828026009228/fig-20251231.htm), net dollar retention rate and definition, customers over $100,000 and gross margin change
- [Dropbox: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1467623/000146762326000008/dbx-20251231.htm), paying users and the Teams environment
- [Box: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1372612/000119312526098466/box-20260131.htm), remaining performance obligations
- [Salesforce: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1108524/000110852426000060/crm-20260131.htm), Slack free user costs and the attrition rate excluding Slack self-service
- [Microsoft: FY26 fourth quarter earnings release](https://www.microsoft.com/en-us/investor/earnings/FY-2026-Q4/press-release-webcast), Copilot paid seats

**Vendor pricing and documentation**

- [Slack: Pricing](https://slack.com/pricing), free plan limits and AI by plan
- [Atlassian: Jira pricing](https://www.atlassian.com/software/jira/pricing), the free plan and Rovo credits per plan
- [Zoom: Pricing](https://zoom.us/pricing), the Basic plan's 40-minute meetings
- [Figma: Pricing](https://www.figma.com/pricing/), AI credits by seat type
- [Notion: Pricing](https://www.notion.com/pricing), AI features in the Business plan
- [Google Workspace blog: AI included in Business and Enterprise plans (January 2025)](https://workspace.google.com/blog/product-announcements/empowering-businesses-with-AI), the $32 and $14 Business Standard comparison
- [Google Workspace: Pricing](https://workspace.google.com/pricing), the 300-user limit on Business editions
- [Microsoft 365 Enterprise: plans and pricing](https://www.microsoft.com/en-us/microsoft-365/enterprise/microsoft-365-plans-and-pricing), E7 contents and price, the Copilot add-on price
- [Microsoft Learn: Pricing and offers](https://learn.microsoft.com/en-us/partner-center/pricing/pricing-and-offers), the 300-license limit across Business Basic, Standard and Premium
