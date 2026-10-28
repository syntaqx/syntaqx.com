+++
title = "The CI/CD Platform Business"
description = "Who sells build minutes and how: per-minute SKUs, credits, parallel jobs and cost factors, OS multipliers, open-source free tiers, funding and shutdowns."
category = "Hosting & Cloud Industry"
order = 2135
part = "CI/CD Platforms"
tags = ["ci", "pricing", "metering", "github-actions", "gitlab", "business-models"]
+++

A CI platform sells a minute of a clean machine that starts on a commit, runs someone else's script, and disappears. That minute is the product, but most of the cost is around it: the control plane that queues jobs, streams logs, stores artifacts and caches, holds secrets and reports status, whether the machine is the vendor's or the customer's. The industry prices that bundle four different ways (per-minute SKUs, credits, parallel jobs, and cost factors on an included allowance), gives much of it away to open source as an acquisition channel, and charges macOS at roughly ten times Linux because of how Apple licenses its operating system for hosting.

This chapter covers the business: the pricing models and current rates, OS and size multipliers, free tiers, GitHub's 2026 price change and its postponed fee on self-hosted runners, the one audited set of numbers in the market (GitLab's), the private vendors' funding, the clouds' build services, and the consolidation and shutdowns. It adds the `ci_pipelines` side table and build-minute SKUs to the [core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). How the market got here is [From Tinderbox to Jenkins: How CI Began](/books/hosting-and-cloud/ci-history); the machines and their isolation are [Runners & Build Infrastructure](/books/hosting-and-cloud/runners-and-build-infrastructure); rating engines in general are Metering & Rating.

## How the Providers Do It

Prices as of October 2026, from each vendor's pricing page or billing documentation:

| Vendor | Pricing model | Representative rates | Included and free | Self-hosted runners |
| --- | --- | --- | --- | --- |
| **GitHub Actions** | Per-minute SKU by OS and size, jobs rounded up to the minute | Linux 2-core x64 $0.006, Linux 2-core arm64 $0.005, Windows 2-core $0.010, macOS 3 or 4-core $0.062; larger Linux 4-core $0.012 to 96-core $0.252; Linux GPU 4-core $0.052 | Free 2,000 minutes, Pro and Team 3,000, Enterprise Cloud 50,000; free on public repositories with standard runners | Free (a per-minute fee was announced and postponed) |
| **GitLab** | Compute minutes: job duration times a cost factor, against a monthly quota | Factors: Linux small 1, medium 2, large 3, xlarge 6, 2xlarge 12; GPU 7; macOS M1 6, M2 Pro 12 | Free tier 400 compute minutes a month; Open Source program factor 0.5; purchased minutes roll over | Own runners use no compute minutes |
| **CircleCI** | Credits per minute by resource class | Linux Medium 10 credits a minute; extra credits $15 per 25,000 (bulk $600 per 1 million) | Free: 30,000 credits a month, 5 users; open source up to 400,000 credits a month on Linux, Arm and Docker | No per-minute charge; concurrency caps 5, 20 or unlimited by plan |
| **Azure Pipelines** | Parallel jobs, unlimited minutes | $40 a month per extra Microsoft-hosted parallel job, $15 per extra self-hosted parallel job | 1 free hosted parallel job with 1,800 minutes a month; 1 free self-hosted parallel job | Priced by concurrency, not minutes |
| **Bitbucket Pipelines** | Build minutes scaled by runner size | 1,000 extra minutes $10 a month; 5 minutes on a 2x runner counts as 10 | Free 50 minutes; community and academic 500 | Not covered on the pricing page; Atlassian flags "upcoming changes to usage based pricing" without details |
| **AWS CodeBuild** | Per-minute by compute type, or reserved capacity | `general1.small` $0.005 a minute; Lambda compute $0.00001 per build-second; reserved capacity $0.003 per instance-minute with a 60-minute minimum; Mac reserved capacity with a 24-hour minimum charge | 100 build minutes a month on `general1.small` or `arm1.small` | Not applicable |
| **Google Cloud Build** | Per-minute | At launch in 2018, $0.0034 a minute | At launch, 120 free build-minutes a day | Not covered in the sources cited here |
| **Docker Build Cloud** | Build minutes included in Docker plans | No on-demand overage | Pro 200, Team 500, Business 1,500 minutes a month; pre-purchased minutes expire at term end | Not applicable |

Five patterns run through the table. **Four meters for one product:** minutes, credits, cost-factor minutes and parallel jobs all approximate machine-time, and each moves risk differently (parallel jobs make cost predictable and push queueing onto the customer; minutes do the reverse). **OS is a price dimension:** macOS costs about ten times Linux at GitHub and Travis, six to twelve times at GitLab, with Windows near two. **Open source is free almost everywhere,** within limits, because public projects are where developers form habits. **Self-hosted compute is free or nearly so,** which makes the control plane a cost the hosted minutes have to carry. **Larger runners are never free,** even for public repositories.

## Pricing Models

**Per-minute SKUs** (GitHub, CodeBuild, Cloud Build) price each machine type separately and round each job up to a whole minute, so a ten-second lint job pays for sixty seconds; that rounding is part of the margin and a reason to merge tiny jobs. **Credits** (CircleCI, and Travis since November 2020 at 10 credits a minute for Linux, 20 for Windows and 50 for macOS) put every resource class on one currency the customer buys in packs, which lets the vendor reprice a class without changing the pack price. **Cost factors on an allowance** (GitLab, Bitbucket) express each machine as a multiple of a base minute drawn from the plan's quota. **Parallel jobs** (Azure Pipelines) sell concurrency: unlimited minutes per job slot, so the bill is fixed and the cost of slow builds is waiting.

A provider can model all four with the same core records. Each machine type is a SKU with a per-minute price; an allowance is a plan version's `included` quantity in base minutes; a cost factor is how many base minutes one minute of that SKU draws; a credit is a prepaid `credit_grants` row in a non-currency unit; a parallel job is a subscription quantity enforced as a concurrency quota, not usage.

## Why macOS Costs Ten Times Linux

The multiplier is structural. Apple's macOS license since Big Sur (November 2020) permits leasing Apple hardware to developers only for a minimum of 24 consecutive hours, with the whole machine leased to one customer. AWS's Mac instances follow: bare metal on Dedicated Hosts with a 24-hour minimum allocation, one instance per host, no Spot, and CodeBuild's Mac reserved capacity carries a 24-hour minimum charge. A Linux CI minute can come from a VM packed onto a shared host and released seconds after the job; a macOS minute comes from a whole Mac held for at least a day, mostly idle between jobs. The runner mechanics are [Runners & Build Infrastructure](/books/hosting-and-cloud/runners-and-build-infrastructure#macos-fleets); the price ratio follows from them.

## GitHub's 2026 Change and the Self-Hosted Fee

GitHub's December 2025 announcement is the clearest public statement of a CI vendor's cost structure. Announced December 16, 2025, it cut hosted-runner meter prices by about 40% (up to 39% net) from January 1, 2026, folding in a new $0.002-per-minute "cloud platform charge," and said that from March 1, 2026 the same charge would apply to self-hosted runner minutes in private repositories, with public repositories and GitHub Enterprise Server exempt. GitHub said 96% of customers would see no higher bill and that hosted revenue had subsidized the self-hosted use of the same control plane, and promised a new scale-set client, multi-label support for its Kubernetes runner controller, and an Actions data stream.

Within about two days GitHub postponed the self-hosted change "to take time to re-evaluate our approach." The hosted price cuts took effect on January 1, 2026. As of October 2026 GitHub's billing documentation still says usage is free for self-hosted runners and for public repositories on standard runners, and no new date has been published.

The episode shows three things a provider should expect. The control plane has a cost per job whoever owns the machine: GitHub reported 71 million jobs a day in December 2025, up from about 23 million in early 2024, on a backend rebuilt during 2025. A fee on self-hosted minutes also reaches third-party runner vendors, because their machines register as self-hosted runners. And a price change on a free line meets resistance out of proportion to its size, which is why the notice and the exemptions matter as much as the rate.

The previous rates make the cut visible: before 2026, GitHub charged $0.008 a minute for Linux, $0.016 for Windows and $0.08 for macOS, and its included minutes were drawn at 1x, 2x and 10x. Current documentation lists prices instead of multipliers, and the ratios are now about 1.7x for Windows and 10x for macOS. Caches got their own meter on November 20, 2025: 10 GB per repository free, retained 7 days after last access with least-recently-used eviction, more billable on paid plans, and read-only if a budget is hit.

## The Audited Numbers: GitLab

GitLab is the one public company whose revenue is mostly a code host with CI. For its fiscal year ended January 31, 2026 its 10-K reports revenue of $955.2 million, up 26% from $759.2 million; subscription revenue of $864.7 million, 91% of the total; 10,682 customers above $5,000 of annual recurring revenue and 1,456 above $100,000; dollar-based net retention of 118%, down from 123%; operating cash flow of $232.9 million; and a net loss attributable to GitLab of $56.0 million. It has added usage-based "GitLab Credits" for its agent platform. The shape is a seat business with metered compute on top: compute minutes are a quota on a plan, not the revenue line.

## The Private Vendors

The rest of the independents are private, so their numbers are funding rounds and executives' claims, not audited revenue:

| Vendor | What's public | Model |
| --- | --- | --- |
| **CircleCI** | Founded 2011; $100 million Series F led by Greenspring Associates (May 2021) at a $1.7 billion valuation, more than $315 million raised in total; acquired Vamp, a 15-person team, at the same time | Hosted CI with credits and self-hosted runners |
| **Harness** | Acquired Drone.io on August 5, 2020 ("over 50,000 active users"), selling the open-source edition as Harness CI Community Edition; $230 million Series D at $3.7 billion (April 26, 2022); $240 million Series E at $5.5 billion (December 11, 2025), with the CEO saying it was on track to exceed $250 million of annual recurring revenue in 2025 | CD vendor that added CI |
| **CloudBees** | $150 million Series F at $1 billion pre-money plus a $95 million debt facility (December 9, 2021) | The commercial Jenkins company |
| **Buildkite** | Founded 2013 in Australia; $28 million round at a $200 million valuation (August 2020); US$21 million Series B (November 16, 2022) | SaaS control plane, customer-run agents |
| **Travis CI** | Acquired by Idera on January 23, 2019 | Hosted CI with credits |

## The Clouds' Build Services

AWS and Google sell build minutes as one service among hundreds, priced close to their compute. CodeBuild's general-purpose minute is $0.005 with a 100-minute monthly free tier, and its Lambda compute bills by the build-second; Google launched Cloud Build at $0.0034 a minute with 120 free minutes a day. Their advantage is the deploy target's IAM, network and audit log; their disadvantage is workflow features that lag the code hosts. AWS's source control shows how such a service can be reconsidered: CodeCommit was closed to new customers on July 25, 2024 with existing customers unaffected, and returned to general availability in November 2025, AWS saying it had learned that CodeCommit is "essential for many of you," especially in regulated industries, with pricing and its 99.9% SLA unchanged.

## Consolidation and Shutdowns

The market's churn, in order: Bamboo Cloud discontinued January 31, 2017; Travis CI to Idera in January 2019 and travis-ci.org shut down May 31, 2021; Drone to Harness in August 2020; Vamp to CircleCI in May 2021; CodeCommit closed to new customers in July 2024 and reopened in November 2025; and Google's Container Registry, shut for writes on March 18, 2025 ([Artifacts & Registries](/books/hosting-and-cloud/artifacts-and-registries#how-the-providers-do-it)). Each one forced customers to move pipelines on someone else's schedule, which is why a provider's sunset process (Migrations, Shutdowns & End of Life) is part of the product.

## The Alternatives

| Model | Who sells it | Strengths | Failure modes | Cost risk | Fits |
| --- | --- | --- | --- | --- | --- |
| **Per-minute SKUs** | GitHub, CodeBuild, Cloud Build | Pay for use; price per machine is explicit | Rounding up small jobs; surprise bills from loops | Variable, grows with activity | Spiky workloads |
| **Credits** | CircleCI, Travis | One currency across resource classes | Credits hide the per-minute price; repricing by exchange rate | Prepaid packs | Teams buying in bulk |
| **Cost factors on an allowance** | GitLab, Bitbucket | Plan includes compute; simple tiers | Overages and quota exhaustion mid-month | Plan plus top-ups | Teams on a seat plan |
| **Parallel jobs** | Azure Pipelines | Fixed bill, unlimited minutes | Queueing when slots are full | Fixed | Steady, high-volume builds |
| **Self-hosted on a SaaS control plane** | GitHub, GitLab, CircleCI, Buildkite, Azure | Own hardware, network and cost | Operations and isolation are yours; platform fees can appear | Hardware plus any platform fee | Large or regulated builds |
| **Self-run server** | Jenkins, TeamCity, Bamboo Data Center | No vendor meter at all | The server is yours to run | Hardware and people | On-premises estates |

## My Default

My default as a buyer is the code host's per-minute hosted runners for Linux, budgeted with a spending limit, with macOS minutes treated as a scarce resource (only the jobs that need Apple tooling) and self-hosted or third-party runners added when Linux minutes become the largest line. As a provider building a CI product, I'd price per minute by machine SKU, round to the minute only above a small floor, publish the OS ratios, charge for the control plane explicitly rather than hiding it in hosted minutes, and give open source a bounded free tier with a stated end condition. GitHub's reversal is the evidence that adding a fee later costs more than charging it from the start.

What would change this: build volume steady enough that parallel-job pricing is cheaper than minutes, or a regulated boundary that requires self-hosted runners regardless of price.

## How to Build It

A pipeline is a resource of kind `ci_pipeline` in [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model); its minutes are usage events rated against per-machine SKUs, and an allowance is drawn in base minutes through a cost factor. Runners and the jobs that produce the usage are [Runners & Build Infrastructure](/books/hosting-and-cloud/runners-and-build-infrastructure#how-to-build-it).

```sql
CREATE TABLE ci_pipelines (              -- side table: kind = 'ci_pipeline'
  resource_id      UUID PRIMARY KEY REFERENCES resources (id),
  repository_ref   TEXT NOT NULL,        -- the code host's repository identifier
  visibility       TEXT NOT NULL CHECK (visibility IN ('public', 'private', 'internal')),
  config_path      TEXT NOT NULL,        -- e.g. '.ci/pipeline.yml'
  default_branch   TEXT NOT NULL,
  oss_program      BOOLEAN NOT NULL DEFAULT FALSE,  -- enrolled in an open-source free tier
  concurrency_cap  INT,                  -- parallel jobs bought, if priced by concurrency
  fork_secrets     BOOLEAN NOT NULL DEFAULT FALSE   -- secrets for fork pull requests: off
);

CREATE TABLE ci_machine_types (          -- each hosted machine, its SKU and its factor
  code            TEXT PRIMARY KEY,      -- 'linux-x64-2', 'macos-arm64-4', 'linux-gpu-4'
  os              TEXT NOT NULL CHECK (os IN ('linux', 'windows', 'macos')),
  arch            TEXT NOT NULL CHECK (arch IN ('x64', 'arm64')),
  vcpus           SMALLINT NOT NULL,
  memory_gb       NUMERIC NOT NULL,
  gpu             TEXT,
  sku_id          UUID NOT NULL REFERENCES skus (id),  -- unit 'minute', billing_increment 60 s
  allowance_factor NUMERIC NOT NULL CHECK (allowance_factor > 0),  -- base minutes per minute
  public_repo_free BOOLEAN NOT NULL,     -- larger runners: false
  valid_during    TSTZRANGE NOT NULL
);
```

Each finished job emits one usage event, `meter = 'ci.job_seconds'`, with `dimensions` holding the machine type, OS, repository visibility and whether the runner was hosted or self-hosted. Rating then decides, by the price version in effect when the job ran:

- public repository on a machine with `public_repo_free`: zero, recorded with its quantity so the free tier's cost is measurable;
- covered by the plan's allowance: `included_quantity` in base minutes, `ceil(seconds / 60) * allowance_factor`;
- beyond it: the SKU's per-minute price on the rounded minutes;
- self-hosted: rated against a control-plane SKU whose price may be zero, so a future fee is a new price version with notice, not a schema change.

The open-source free tier's real cost, by machine type, which is the number a provider needs before changing it:

```sql
SELECT (e.dimensions->>'machine_type') AS machine_type,
       SUM(CEIL(e.quantity / 60.0))     AS minutes,
       SUM(CEIL(e.quantity / 60.0) * pv.unit_price) AS list_value_minor_units
FROM usage_events e
JOIN ci_machine_types m ON m.code = e.dimensions->>'machine_type'
JOIN price_versions pv  ON pv.sku_id = m.sku_id AND pv.price_book = 'list'
                       AND pv.valid_during @> lower(e.occurred_during)
WHERE e.meter = 'ci.job_seconds'
  AND e.dimensions->>'visibility' = 'public'
  AND e.occurred_during && tstzrange($1, $2)
GROUP BY 1
ORDER BY 3 DESC;
```

## Auditing

- **Every price version and its announcement date,** per machine type, including zero prices, because a fee introduced on a free line is measured against the notice given.
- **Every job's rated minutes, rounding and factor,** so a customer's bill can be rebuilt from job records.
- **Open-source program enrollment and its decisions,** with who approved, since free minutes are a cost and an abuse target.
- **Spending limits and what happened when they were hit** (jobs blocked, caches read-only), with the time.

## What This Means for the System You Build

- **Price per machine SKU and publish the ratios,** so the OS and size multipliers are explicit.
- **Round once, and say how:** per job, to the minute, above a stated floor.
- **Charge for the control plane deliberately,** from the start, rather than hiding it in hosted minutes.
- **Rate free usage at zero, not skip it,** so the open-source tier's cost is visible.
- **Give every price change notice and exemptions,** and expect a free line's change to be contested.
- **Model concurrency as a quota and minutes as usage,** so both pricing styles share one ledger.

## References

**Pricing and documentation**

- [GitHub Docs: Actions minute multipliers and rates](https://docs.github.com/en/billing/reference/actions-minute-multipliers), current per-minute rates by OS and size, rounding, larger runner rules
- [GitHub Docs: GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions), included minutes and storage, free self-hosted and public-repository usage, cache billing
- [GitHub Docs: About billing for GitHub Actions (December 2023, archived)](http://web.archive.org/web/20231202013242/https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions), the previous rates and multipliers
- [GitHub Changelog: Cache size can now exceed 10 GB](https://github.blog/changelog/2025-11-20-github-actions-cache-size-can-now-exceed-10-gb-per-repository/), November 20, 2025, retention, eviction and budget behavior
- [GitLab Docs: Compute minutes](https://docs.gitlab.com/ci/pipelines/compute_minutes/), cost factors, the free quota, open-source factors and rollover
- [CircleCI: Pricing](https://circleci.com/pricing/), plans, credits, self-hosted runner concurrency and open-source credits
- [Microsoft Azure: Azure DevOps Services pricing](https://azure.microsoft.com/en-us/pricing/details/devops/azure-devops-services/), free and paid parallel jobs
- [Atlassian: Bitbucket pricing](https://www.atlassian.com/software/bitbucket/pricing), build minutes, runner size scaling and the pending pricing change
- [AWS: CodeBuild pricing](https://aws.amazon.com/codebuild/pricing/), per-minute rates, free tier, Lambda compute, reserved capacity and the Mac 24-hour minimum
- [Docker: Pricing FAQ](https://www.docker.com/pricing/faq/), Build Cloud minutes by plan and expiry
- [AWS: Amazon EC2 Mac instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-mac-instances.html), Dedicated Hosts and the 24-hour minimum allocation
- [9to5Mac: macOS Big Sur adds leasing terms](https://9to5mac.com/2020/11/11/macos-big-sur-adds-leasing-terms-that-pull-hosting-services-like-macstadium-out-of-a-legal-gray-area/), the 24-hour minimum lease of whole machines
- [Travis CI: New billing](https://www.travis-ci.com/blog/2020-11-02-travis-ci-new-billing/), credits per minute by OS

**Announcements**

- [GitHub: 2026 pricing changes for GitHub Actions](https://github.com/resources/insights/2026-pricing-changes-for-github-actions), the December 16, 2025 announcement, the platform charge, the 96% figure and the postponement
- [GitHub Changelog: Simpler pricing for GitHub Actions](https://github.blog/changelog/2025-12-16-coming-soon-simpler-pricing-and-a-better-experience-for-github-actions/), December 16, 2025, with the postponement update
- [Techzine: GitHub delays paid self-hosting of runners](https://www.techzine.eu/news/devops/137396/github-bends-to-criticism-and-delays-paid-self-hosting-of-runners/), the reversal
- [GitHub: Let's talk about GitHub Actions](https://github.blog/news-insights/product-news/lets-talk-about-github-actions/), December 11, 2025, job volumes and the backend rebuild
- [Google Cloud: Cloud Build announcement (TechCrunch)](https://techcrunch.com/2018/07/24/google-announces-cloud-build-its-new-continuous-integration-continuous-delivery-platform/), July 24, 2018, launch pricing and free minutes
- [AWS: CodeCommit user guide history](https://docs.aws.amazon.com/codecommit/latest/userguide/history.html), closure to new customers on July 25, 2024
- [AWS DevOps Blog: AWS CodeCommit returns to general availability](https://aws.amazon.com/blogs/devops/aws-codecommit-returns-to-general-availability), November 2025, the reason and unchanged pricing and SLA

**Filings and funding**

- [GitLab: Form 10-K for fiscal year 2026](https://www.sec.gov/Archives/edgar/data/1653482/000162828026018731/gtlb-20260131.htm), revenue, subscription revenue, customer counts, net retention, cash flow and net loss
- [CircleCI: Series F](https://circleci.com/blog/series-f/), the round and the Vamp acquisition
- [TechCrunch: CircleCI raises $100M Series F](https://techcrunch.com/2021/05/11/circleci-announces-100m-series-f-on-1-7b-valuation-along-with-vamp-acquisition/), valuation and total raised
- [Harness: Harness acquires Drone.io](https://harness.io/press-and-news/harness-acquires-drone-io-for-open-source-containerized-continuous-integration), August 5, 2020, users and editions
- [Harness: Series D](https://www.harness.io/press-and-news/harness-valuation-soars-to-3-7-billion-with-230-million-in-series-d-funding), April 26, 2022
- [TechCrunch: Harness hits $5.5B valuation](https://techcrunch.com/2025/12/11/harness-hits-5-5b-valuation-with-240m-to-automate-ais-after-code-gap/), December 11, 2025, and the ARR claim
- [CloudBees: CloudBees raises $245 million](https://www.cloudbees.com/newsroom/cloudbees-raises-245-million-dollar-new-financing), December 9, 2021
- [SmartCompany: Buildkite raises $28 million](https://www.smartcompany.com.au/startupsmart/buildkite-28-million-funding/), founders, 2013 founding and the valuation
- [Startup Daily: Buildkite Series B](https://www.startupdaily.net/topic/funding/software-development-platform-buildkite-raises-31-million-series-b/), November 16, 2022
- [Travis CI: Travis CI joins Idera](https://www.travis-ci.com/blog/2019-01-23-travis-ci-joins-idera-inc/), January 23, 2019
