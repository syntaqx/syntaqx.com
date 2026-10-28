+++
title = "PaaS & Frontend Clouds"
description = "What platforms resell, how they meter (CPU time, memory, requests, credits), spend caps and pauses, Heroku's lifecycle, and where the hyperscaler shows through."
category = "Hosting & Cloud Industry"
order = 2133
part = "Deployment"
tags = ["paas", "frontend-cloud", "metering", "spend-caps", "heroku", "vercel"]
+++

A platform as a service sells the deploy, not the machine. The customer pushes code; the platform builds it, runs it, routes to it, scales it, and bills for what it consumed, and the customer never chooses an instance type or patches a kernel. Frontend clouds are the same business aimed at web front ends: static assets and server-rendered pages on a CDN, functions beside them, previews for every pull request. Almost none of them own the layer underneath. Heroku runs on AWS, Vercel's compute regions are AWS regions under other names, and the platform's margin is the difference between what it charges for convenience and what its underlay charges it for capacity.

This chapter covers the business: what PaaS and frontend clouds resell, the meters they converged on and how they differ from the clouds beneath them, the spend caps and pauses that are their answer to surprise bills, the lifecycle of a platform from free tier to maintenance mode, and where the underlay shows through. It adds a `sites` side table and project spend caps to the [core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). How the deploy itself works (releases, previews, aliases, rollback) is [Platforms Take Over the Deploy](/books/hosting-and-cloud/platform-deploys); the map of who sits on whom is [The Provider Landscape](/books/hosting-and-cloud/provider-landscape#who-resells-whom); rating engines, free tiers and surprise bills in general are the Metering and Billing part (Metering & Rating; Free Tiers, Credits & Startup Programs; Cost Data, FinOps & Surprise Bills); functions and isolates as compute are Functions, Isolates & Edge Compute.

## How the Providers Do It

Prices are as of October 2026, from each provider's own pricing documentation:

| Platform | Unit sold | Meters | What happens at the limit | Underlay |
| --- | --- | --- | --- | --- |
| **Heroku** | Dynos by tier per month: Eco $5 (personal accounts, sleeps after 30 minutes idle), Basic $7, Standard-1X $25, Standard-2X $50, Performance-M $250 up to Performance-2XL $1,500 | Dyno size and count, add-ons | The customer's own scaling; no plan cap | AWS regions (Frankfurt is `eu-central-1`) |
| **Vercel** | Plans with a monthly usage credit, then metered usage | Fluid compute: Active CPU (only while code executes), Provisioned Memory (GB-hours for the instance's life), Invocations ($0.60 per million on Pro); regional prices such as $0.128 per CPU-hour and $0.0106 per GB-hour in `iad1` | An On-Demand Budget with alerts at 50, 75 and 100% and an option to pause all production deployments | AWS regions under Vercel codes (`iad1` is `us-east-1`) |
| **Netlify** | Credit-based plans | Usage drawn down from a monthly credit allowance | All projects of a team pause when its monthly credits run out; paid plans can buy credit packs or auto-recharge | Not stated in the documents cited here |
| **Fly.io** | Machines, pay as you go | Per second while running; stopped Machines bill root filesystem at $0.15 per GB-month; volumes $0.15 per GB-month even detached; dedicated IPv4 $2 a month; egress $0.02 per GB in North America and Europe up to $0.12 in Africa and India | No plan cap; no free tier for new organizations (a trial instead) | Not stated in the documents cited here |
| **Railway** | A subscription that counts toward usage (Hobby $5 including $5 of usage, Pro $20 including $20) | RAM $10 per GB-month, CPU $20 per vCPU-month, egress $0.05 per GB, volumes $0.15 per GB-month; builds free | Usage limits the customer sets | "Railway Metal," its own hardware, after leaving Google Cloud |
| **Render** | Instance plans; a free tier | Free web services spin down after 15 minutes without inbound traffic; 750 free instance hours per workspace per month, not carried over | Free services count against monthly included outbound bandwidth | Not stated in the documents cited here |
| **Cloudflare Workers** | Free (100,000 requests a day, 10 ms CPU per invocation) and Paid ($5 a month minimum including 10 million requests and 30 million CPU milliseconds) | CPU time, not wall-clock time: $0.30 per extra million requests, $0.02 per extra million CPU milliseconds; no egress charge for Workers | A daily request limit on Free; metered overage on Paid | Cloudflare's own network |

Four patterns run through the table. **Meters converged on work done:** CPU while executing, memory while provisioned, requests, and per-second machines, rather than the instance-hour of the clouds underneath; a function waiting on a database is cheap on Vercel's Active CPU and free of CPU charges on Workers, and that difference is the product. **Plans bundle a credit and meter beyond it,** so the subscription is both a minimum and a prepayment, and Railway says so outright. **Caps are pauses:** Netlify pauses every project, Vercel can pause production deployments, Render spins services down, and a pause stops the customer's site, which is the opposite of a hyperscaler's alert-only default. **The underlay is someone else's,** which bounds the platform's margin and its reliability.

## What a Platform Resells

A platform buys capacity by the instance-hour, gigabyte-month and gigabyte transferred, and sells it in units its customers don't have to understand. Three things justify the markup, and each is a cost the platform carries:

- **The build and the deploy.** Every push becomes a build on the platform's machines and a deployment it stores, routes to and keeps for rollback. Previews multiply it: one build per push of every branch.
- **Idle and burst.** The customer pays for requests and active time; the platform pays for warm capacity, which is why the free tiers spin down (Render after 15 minutes, Heroku's Eco dynos after 30) and why per-second Machines bill a stopped Machine's disk but not its CPU.
- **Operations.** Patching, certificates, logs, routing, DDoS absorption and the support desk are in the price. Heroku's tier table lists automatic OS patching and automated certificates as features of its cheapest dyno.

The margin comes from density and from the gap between the meter and the underlay's bill: many mostly idle customers share warm capacity, and active-CPU pricing charges for the busy fraction. What erodes it is egress the platform pays for and can't fully pass on, abuse on free tiers (Free-Tier Fraud & Stolen Keys), and the underlay's own price increases.

## How the Meters Work

Vercel's Fluid compute is the clearest public description of a modern platform meter. One instance serves many concurrent requests. **Active CPU** accrues only while code is executing and pauses during I/O; **Provisioned Memory** accrues in GB-hours for the instance's lifetime until the last in-flight request finishes; **Invocations** count requests. Prices differ by region (São Paulo's `gru1` is $0.221 per CPU-hour and $0.0183 per GB-hour against `iad1`'s $0.128 and $0.0106), and Vercel's own worked example prices 4 seconds of CPU in a 10-second, 4 GB instance in São Paulo at $0.0004489. Hobby includes 4 CPU-hours, 360 GB-hours and 1 million invocations.

The other designs choose different splits. Cloudflare Workers bills CPU milliseconds and requests, with no memory or wall-clock meter, which suits isolates that share a process. Fly.io and Railway bill machine resources by time, per second, closer to a cloud with the instance types hidden. Heroku sells a fixed monthly dyno price by size, with the customer deciding the count. Netlify converts usage into credits from a plan allowance.

For the provider, each choice is a meter definition in the core model: a `usage_events.meter` such as `function.active_cpu_ms`, `function.provisioned_memory_gb_s` or `machine.seconds`, a SKU per region, and an included allowance on the plan version. The regional price is why `skus.region_id` exists; the allowance is `plan_versions.included`; the behavior at the end of it is `plan_versions.overage_mode` (`bill`, `pause`, `throttle`).

## Spend Caps and Pauses

Platforms sell to developers who fear the bill more than the outage, and their spend controls show it. Vercel's spend management lets a Pro or Enterprise team set an On-Demand Budget per billing cycle for metered usage beyond the plan's monthly credit (seats, Marketplace integrations and add-ons excluded). It sends notifications at 50, 75 and 100% (SMS at 100%), can call a signed webhook (`x-vercel-signature`) with a payload of `budgetAmount`, `currentSpend`, `teamId` and `thresholdPercent`, and can optionally pause all production deployments, which then return 503 with `DEPLOYMENT_PAUSED`; storage keeps billing, and each project must be resumed individually. Usage is checked "every few minutes," so the action lags the spend. Netlify's credit plans pause every project of a team when its monthly allowance runs out, blocking requests, forms and deploys until the next cycle or an upgrade.

The case for caps is visible in public. In February 2024 a free-plan Netlify customer reported a bill of about $104,000 after a traffic spike on a static site; the CEO said on Hacker News the user would not be charged and that Netlify's policy was to forgive such bills rather than shut down free sites, and forum users asked for spend caps. The design question a platform has to answer is which failure it prefers: an unbounded bill it may forgive, or a paused site the customer didn't expect. The general practice, budgets and anomaly alerts, is the playbook's [Budgets and Anomaly Alerts](/docs/operations/cost-and-finops#budgets-and-anomaly-alerts) and [Free Tiers and Their Cliffs](/docs/operations/cost-and-finops#free-tiers-and-their-cliffs); what a platform adds is the pause as an enforcement action, with lag, scope and resume rules that must be stated in advance.

## The Platform Lifecycle: Heroku

Heroku is the category's whole life in one company. It made `git push` the deploy and the process the unit of scale with Cedar on June 20, 2011 ([Platforms Take Over the Deploy](/books/hosting-and-cloud/platform-deploys#git-push-and-the-process-model)), and its free dynos were for a decade where developers learned to deploy. On November 28, 2022 it ended free plans; the cheapest dyno is now Eco at $5 a month, personal accounts only, sleeping after 30 minutes idle. On February 6, 2026 it announced it was "transitioning to a sustaining engineering model focused on stability, security, reliability, and support" and stopped offering Enterprise Account contracts to new customers, while honoring and renewing existing ones; no end-of-life date was given as of October 2026.

Each step has a business reason a provider can read from outside. Free tiers are an acquisition channel paid for in capacity and abuse handling, and they end when the acquisition no longer pays. A platform that runs on a hyperscaler carries the hyperscaler's price as its floor, so its margin depends on keeping density high and egress low. And a platform owned by a larger company competes for investment with that company's other products. For customers, the lesson is the one the playbook's Disaster Recovery makes about every rented layer: keep the exit written down. For providers, Migrations, Shutdowns & End of Life covers how to sunset a product without breaking the customers who stayed.

## Where the Underlay Shows Through

The underlay is visible in documentation, in incidents and in prices. Vercel lists compute regions whose codes map to AWS region names and defaults functions to `iad1`, so its customers live in `us-east-1` unless they choose otherwise; during AWS's October 19 and 20, 2025 event Vercel had two incidents of its own, as [The Provider Landscape](/books/hosting-and-cloud/provider-landscape#who-resells-whom) describes. Heroku's region API maps its Frankfurt region to AWS's `eu-central-1`. Railway made the reverse move, to its own hardware, which lets it price compute and egress independently of a cloud's rate card.

Three consequences follow for a platform on someone else's layer. Its regions record the underlay (`regions.underlay = 'aws:us-east-1'`), so a status page and a data residency answer can be generated. Its egress price is bounded below by the underlay's egress price unless it negotiates a commitment, which is a cost it must model. And its reliability is the underlay's in that region, so a platform that promises more than its underlay needs more than one underlay region, and pays for it.

## The Alternatives

| Option | Model | Strengths | Failure modes | Cost shape | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **Classic PaaS** (Heroku, Render, App Engine standard) | Processes from source, fixed sizes per month or hour | Simple mental model; mature add-ons | Price per unit of compute well above the underlay; lifecycle risk | Monthly per instance size | Small teams, internal apps |
| **Frontend cloud** (Vercel, Netlify, Cloudflare Pages) | Static assets, functions and previews on a CDN | Previews, instant rollback, global delivery | Usage spikes; caps that pause sites; function limits | Plan plus metered CPU, memory, requests, bandwidth | Web front ends, marketing sites, SaaS apps |
| **Machine platforms** (Fly.io, Railway) | Per-second VMs or containers with platform deploys | Close to cloud prices with platform ergonomics; long-running processes | More operations left to the customer | Per-second resources, egress by region | Apps needing state or regions |
| **Isolate platforms** (Cloudflare Workers) | Code in V8 isolates everywhere | CPU-time billing, no egress charge, global by default | Runtime limits; not every library runs | Requests plus CPU milliseconds | Edge logic, APIs |
| **Hyperscaler PaaS** (App Runner, Cloud Run, Azure App Service) | Containers or code on the cloud's own capacity | No reseller margin; same bill and IAM as the rest | Each cloud's own model to learn; fewer previews | Per-second or per-request at cloud prices | Teams already on that cloud |
| **Run it yourself** (Kubernetes, VMs) | Your own platform on rented or owned capacity | Lowest unit cost at scale; full control | A platform team; you rebuild previews and rollback | Capacity plus people | Large engineering organizations |

## My Default

My default for a new web product is a frontend cloud for the front end and its functions, with a spend budget set from day one and the pause action enabled for previews and staging but alert-only for production, plus a written exit to a container platform on the same hyperscaler region. For a back-end service with long-running processes, I'd pick a per-second machine platform or the hyperscaler's own container service over a classic PaaS, because the unit price gap compounds and the lifecycle risk of a platform that has stopped investing is real.

What would change this: steady, high utilization makes the platform's markup the largest line on the bill, and that is the point to move to the hyperscaler directly or to owned capacity (Repatriation); a regulated workload that needs controls the platform's plans don't offer forces the same move sooner.

## How to Build It

The chapter adds the side table for `site` resources and the spend caps a platform enforces per project. Usage, SKUs and allowances are the [core model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model)'s; Free Tiers, Credits & Startup Programs owns account-level `spending_limits` on free and credit plans, and Cost Data, FinOps & Surprise Bills owns `budgets` and `budget_alerts`. A project spend cap is the enforcement half: a threshold that triggers an action on resources.

```sql
CREATE TABLE sites (                     -- side table: kind = 'site'
  resource_id       UUID PRIMARY KEY REFERENCES resources (id),
  framework         TEXT,                -- detected or chosen: 'nextjs', 'astro', 'static'
  repository_url    TEXT,                -- the connected git repository, if any
  production_branch TEXT NOT NULL DEFAULT 'main',
  build_command     TEXT,
  output_directory  TEXT,
  runtime_regions   TEXT[] NOT NULL,     -- regions.id values; each region records its underlay
  idle_policy       TEXT NOT NULL CHECK (idle_policy IN ('always_on', 'spin_down', 'scale_to_zero')),
  idle_after        INTERVAL,            -- e.g. 15 or 30 minutes on free tiers
  previews_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
  preview_protection TEXT NOT NULL CHECK (preview_protection IN ('public', 'team_login',
                      'password')),
  CHECK ((idle_policy = 'always_on') = (idle_after IS NULL))
);

CREATE TABLE project_spend_caps (        -- a threshold on metered spend and what it does
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  project_id      UUID REFERENCES projects (id),   -- null: every project of the account
  currency        CHAR(3) NOT NULL,
  amount          BIGINT NOT NULL CHECK (amount > 0),  -- minor units per billing cycle
  scope           TEXT NOT NULL CHECK (scope IN ('metered_beyond_plan', 'all_usage')),
  thresholds      SMALLINT[] NOT NULL DEFAULT '{50,75,100}',  -- percent; notify at each
  action_at_100   TEXT NOT NULL CHECK (action_at_100 IN ('notify', 'pause_production',
                    'pause_all', 'throttle')),
  webhook_url     TEXT,                  -- signed payload: amount, current spend, threshold
  check_interval  INTERVAL NOT NULL,     -- how often spend is evaluated; disclosed to the customer
  valid_during    TSTZRANGE NOT NULL,
  set_by          TEXT NOT NULL          -- typed actor
);

CREATE TABLE spend_cap_events (          -- every threshold crossing and every enforcement
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  spend_cap_id    UUID NOT NULL REFERENCES project_spend_caps (id),
  threshold       SMALLINT NOT NULL,
  spend_at_check  BIGINT NOT NULL,       -- the rated amount the decision used
  rated_through   TIMESTAMPTZ NOT NULL,  -- how current the rated usage was: the lag
  action          TEXT NOT NULL CHECK (action IN ('notified', 'paused', 'throttled', 'resumed')),
  resource_ids    UUID[],                -- what was paused or resumed
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

A pause is enforced through the same machinery as any other restriction: the resources move to `stopped` (or their aliases return a paused response), and if the cap is account-wide an `account_holds` row with `effect = 'stop_resources'` and `reason = 'customer_request'` records it, because the customer asked for the cap. Storage keeps billing during a pause, as Vercel documents, so a cap's scope should say what it does not stop.

Spend against each cap in the current cycle, from rated usage:

```sql
SELECT c.id, c.amount, SUM(u.amount) AS spend,
       ROUND(100 * SUM(u.amount) / c.amount) AS percent
FROM project_spend_caps c
JOIN rated_usage u ON u.account_id = c.account_id
JOIN resources r   ON r.id = u.resource_id
WHERE upper_inf(c.valid_during)
  AND (c.project_id IS NULL OR r.project_id = c.project_id)
  AND u.rated_during && tstzrange(date_trunc('month', NOW()), NULL)
  AND u.currency = c.currency
GROUP BY c.id, c.amount;
```

## Auditing

- **Every spend cap and its changes,** with the action it was set to take, because a customer whose site paused will ask whether they chose that.
- **Every threshold crossing and enforcement,** with the spend figure and how current the rated usage was, so a dispute over "you paused me at 80%" can be answered with the lag stated.
- **Bill forgiveness decisions,** as credit grants with the reason and approver, so the forgiveness policy is applied consistently and visible in margin reports.
- **The underlay of every region,** dated, so an incident report or a residency answer is true for the date it covers.

## What This Means for the System You Build

- **Meter work done:** active CPU, provisioned memory, requests and seconds, with regional SKUs and plan allowances.
- **Offer a cap whose action is explicit** (notify, pause production, pause everything) and disclose how often it is checked.
- **Record every enforcement with the spend it used** and the lag behind it.
- **Keep storage billing honest during a pause** and say what a pause does not stop.
- **Record the underlay on every region,** and price egress knowing its floor.
- **Treat free tiers as a budgeted acquisition channel,** with spin-down rules and an end date you can defend.
- **Plan the sunset** of a platform product before it's needed, with notice and an export path.

## References

**Pricing and documentation**

- [Heroku: Pricing](https://www.heroku.com/pricing), dyno tiers and monthly prices, Eco sleeping after 30 minutes and personal accounts only
- [Heroku Dev Center: Regions](https://devcenter.heroku.com/articles/regions), Heroku regions mapped to AWS regions
- [Vercel: Global network and regions](https://vercel.com/docs/regions), compute region codes mapped to AWS region names and `iad1` as the default
- [Vercel: Fluid compute pricing](https://vercel.com/docs/fluid-compute/pricing), Active CPU, Provisioned Memory and Invocations, regional prices, Hobby allowances and the worked example
- [Vercel: Spend management](https://vercel.com/docs/spend-management), On-Demand Budget, thresholds, webhook payload, pausing production deployments, check frequency
- [Netlify: Resume paused projects](https://docs.netlify.com/manage/accounts-and-billing/billing/resume-paused-projects/), pausing all projects at the credit limit, credit packs and auto recharge
- [Fly.io: Pricing](https://docs.fly.io/about/pricing), per-second Machines, stopped Machine and volume storage, IPv4, egress by region, trial for new organizations
- [Railway: Plans and pricing](https://docs.railway.com/reference/pricing/plans), subscriptions counting toward usage, resource and egress prices
- [Render: Deploy for free](https://render.com/docs/free), spin-down after 15 minutes, 750 free instance hours, included bandwidth
- [Cloudflare: Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), Free and Paid plans, CPU-time billing, no Workers egress charge

**Announcements and press**

- [Heroku: Heroku's next chapter](https://www.heroku.com/blog/next-chapter/), free plans ending November 28, 2022
- [Heroku: An update on Heroku](https://www.heroku.com/blog/an-update-on-heroku/), the sustaining engineering model and Enterprise contracts, February 6, 2026
- [The Register: Heroku freeze](https://www.theregister.com/2026/02/09/heroku_freeze/), the sustaining engineering model, no end-of-life date, Heroku on AWS

**In practice**

- [Netlify Support Forums: Netlify billing horror story](https://answers.netlify.com/t/netlify-billing-horror-story/113392), the February 2024 bill of about $104,000 on a free plan and the forgiveness response
