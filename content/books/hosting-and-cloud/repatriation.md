+++
title = "Repatriation"
description = "Leaving the cloud for owned hardware: Dropbox's Magic Pocket and S-1, 37signals' numbers, exit egress waivers, and a cost model for when owning wins."
category = "Hosting & Cloud Industry"
order = 2213
part = "Running the Provider"
tags = ["repatriation", "cloud-exit", "cost-model", "colocation", "egress"]
+++

This volume started with one server in a closet and followed it outward: to a colocation cage, to rented bare metal, to a cloud billed by the second, and into every product a provider builds on top. [Migrations, Shutdowns & End of Life](/books/hosting-and-cloud/migrations-and-end-of-life) ended with customers moved from one rented thing to another on someone else's clock, and [Total Cost of Ownership](/books/hosting-and-cloud/total-cost-of-ownership) priced every stage of that path as bill plus people, through a [worked comparison](/books/hosting-and-cloud/total-cost-of-ownership#a-worked-tco) of one workload in four placements. This last chapter is the move the other way, back down the path to owned metal.

Repatriation is moving a workload from rented cloud capacity back to hardware the company owns or leases, usually in colocation. The word arrived with the trade press; one of the engineers who has done it at scale objects to it ("I'm not a nation state, therefore I don't understand why it's called repatriation"), and the objection is fair, because what's happening is a placement decision made again with better data. A company that started in the cloud for good reasons (no capital, no lead time, unknown demand) reaches a size and a load shape where the provider's margin on steady capacity is larger than the cost of owning that capacity and the people to run it. At that point the same arithmetic that justified renting says to own.

The public record is thin and storage-heavy. Two cases have numbers a reader can check: Dropbox, whose S-1 reported the audited effect of moving user data off a third-party provider, and 37signals, whose founders published their bill, their hardware order and their colocation cost before and after. A few more have figures from conference talks and company blogs relayed by the press, and some widely cited "repatriation" stories aren't repatriation at all. This chapter separates those, walks the history to dated primary sources, sets out the cost model (utilization, steadiness, staff, capital and depreciation, colocation, discounts and commitments, egress and licensing), covers what the providers now waive for customers who leave, and ends with a comparison query over the [core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). It adds no tables. The building side is [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation); the machines are [Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers); the middle path of cloud hardware in your own building is [Hybrid & On-Prem Cloud](/books/hosting-and-cloud/hybrid-and-on-prem-cloud).

## How the Providers Do It

The "providers" here are the companies that left, and the clouds that changed their exit terms. The public cases, read precisely:

| Company | What moved | Dated figures | Source | What it shows |
| --- | --- | --- | --- | --- |
| **Dropbox** | "The vast majority of user data" from a third-party provider to "custom-built infrastructure in co-location facilities," completed in Q4 2016 | A net infrastructure cost decrease of $39.5 million in 2016 and a further $35.1 million in 2017; gross margin from 33% (2015) to 54% (2016) to 67% (2017) | Form S-1, February 2018 (audited financials) | Storage at exabyte scale is where owning pays first |
| **37signals** | HEY and Basecamp compute and databases (2023), then about 10 PB of S3 files (2025) | 2022 cloud bill $3.2 million; projected savings about $1.5 million a year (February 21, 2023); bill down to a $1.3 million run rate (October 17, 2024); S3 "just shy of $1.5 million/year" before its exit (March 26, 2025) | The founders' posts and the company's podcast | Medium scale with steady load, the same ops team, and a published model |
| **GEICO** | A move from about 80% cloud back toward two owned, active-active data centers, on OpenStack and Kubernetes | "Prices had gone up for serving approximately the same load by 300%"; average utilization about 12% in one cloud of over 200,000 cores | QCon San Francisco talk by its VP of platform and infrastructure engineering (InfoQ, 2025) | An enterprise rebalancing after a lift-and-shift, driven by storage and utilization |
| **Ahrefs** | Nothing: it never moved to the cloud | Claimed $400 million saved over three years versus an AWS equivalent, from 850 servers at $1,500 a month each in colocation | The company's blog, March 2023, as reported by The Register | A counterfactual, not a repatriation, and one The Register advised reading with "a big pinch of salt" |
| **Prime Video** | A monitoring service from Step Functions and S3 to a single process on EC2 and ECS | "Reduced our infrastructure cost by over 90%" | Prime Video tech blog, as reported by DevClass, May 5, 2023 | Not repatriation: an architecture change inside AWS |

Four patterns run through the table. **The audited and published cases are storage-first.** Dropbox moved user files, 37signals finished with files, and GEICO named storage the most expensive thing to run in the cloud. **Steady load is the precondition.** 37signals' original post called renting "a bad deal for medium-sized companies like ours with stable growth" and named irregular, spiky or unknown load as what the cloud is good for. **The team size didn't change.** 37signals reported the same operations team before and after; the cases where owning paid were ones where the people already existed. **The press merges different things.** A company that never left (Ahrefs) and a company that changed architecture within one cloud (Prime Video) aren't evidence about leaving; this chapter counts only moves off rented infrastructure.

## How It Got Here

### Dropbox builds Magic Pocket (to 2016)

Dropbox stored file content on Amazon S3 and built its own storage system, Magic Pocket, to replace it. Its announcement post (March 14, 2016) reported over 500 million signups and 500 petabytes of user data, more than 90% of it on Dropbox's own infrastructure by October 7, 2015 (ahead of an October 30 goal), with design targets of over 99.9999999999% annual durability and over 99.99% availability. The reasons it gave were performance from owning the whole stack, unit economics from customizing hardware and software at its scale, and control over reliability and security; it said it would keep using AWS "where it makes sense for our users, particularly globally," including storage in Germany for European business customers. A follow-up, "Inside the Magic Pocket" (May 6, 2016), described the design: blocks stored in at least two of three US zones and replicated within a second of upload, cells of about 50 PB raw, 1 GB buckets, replicated recent data and erasure-coded older data, and storage machines holding "over a petabyte of data in a single machine, or over 8 PB per rack." **What it solved:** the largest line in Dropbox's cost of revenue. **What it cost:** a storage engineering organization, its own data center operations in colocation, and years of build.

### The audited result (February 2018)

Dropbox's S-1 called the program "Infrastructure Optimization": migrating "the vast majority of user data stored on the infrastructure of third-party service providers" to its own infrastructure, "until we completed the migration in the fourth quarter of 2016." For 2016 against 2015, it reported "a net decrease of $39.5 million in our infrastructure costs," made of "a $92.5 million decrease in expense related to our third-party datacenter service provider" "offset by a $53.0 million increase in depreciation, facilities, and support expense related to our infrastructure"; for 2017 against 2016, a further "$35.1 million decrease." The two years sum to $74.6 million. Gross margin rose "from 33% during 2015 to 54% during 2016 primarily due to our Infrastructure Optimization" and a 40% revenue increase, then to 67% in 2017. The filing is the only audited account of a repatriation's effect at this scale, and it shows the mechanism exactly: an operating expense paid to a provider becomes depreciation and facilities cost on the company's own books, smaller in total. **What it solved:** a public, audited number for an argument that had been anecdote. **What it cost:** nothing further for Dropbox; for everyone else, a benchmark that only applies at exabyte scale.

### The argument goes public (2021)

Sarah Wang and Martin Casado of Andreessen Horowitz published "The Cost of Cloud, a Trillion Dollar Paradox" on May 27, 2021, with the line "you're crazy if you don't start in the cloud; you're crazy if you stay on it." Its claims, as an argument rather than findings: that committed cloud spend averaged about 50% of cost of revenue among software companies that disclose it; that practitioners converged on a rule of thumb that "repatriation results in one-third to one-half the cost of running equivalent workloads in the cloud"; and that across 50 top public software companies about $100 billion of market value was lost to cloud-driven margin pressure. The authors call the analysis back-of-the-envelope and directional, assume repatriation halves cloud spend and committed spend equals actual spend, value gross profit at about 24 to 25 times (May 2021 multiples), and say explicitly that they aren't arguing for repatriation. Dropbox is their main example. **What it solved:** it gave finance teams a frame (infrastructure as a first-class margin metric) rather than a decision. **What it cost:** its assumptions became the debate.

### 37signals leaves (2022 to 2026)

David Heinemeier Hansson announced on October 19, 2022 that 37signals was leaving the cloud: it was paying "over half a million dollars per year for database (RDS) and search (ES) services from Amazon," "the savings promised in reduced complexity never materialized," and renting was "(mostly) a bad deal for medium-sized companies like ours with stable growth." On February 21, 2023 he published the model: a 2022 cloud bill of $3.2 million, about $1 million of it for 8 PB of files in S3 and about $2.3 million for app, cache, database and search servers; a Dell order of about $600,000 amortized over five years; about $60,000 a month for eight racks in two data centers from Deft; about $840,000 a year in total for bandwidth, power and hardware; and so about $1.5 million a year saved, "without changing the size of our ops team," or about $7 million over five years after a $500,000 reserve. The company's podcast "Leaving the Cloud: The Finale" (July 12, 2023) reported compute and databases out, with Basecamp's search cluster and logging still on AWS for some weeks and the 8 PB still in S3.

On October 17, 2024 the bill was down from $3.2 million to a $1.3 million run rate, all of it S3 (about 10 PB under a four-year contract from 2021), with about $700,000 of hardware paid back during 2023 and a plan for 18 PB of Pure Storage across two data centers costing about one year of S3. On March 26, 2025, with S3 "just shy of $1.5 million/year" and the contract ending June 30, Hansson put the Pure hardware at about $1.5 million plus a bit under $1 million over five years for support, and said AWS's "free 60-day egress window" made moving almost 6 PB cost nothing. The Register (May 9, 2025) put the waived egress at $250,000 and quoted him: "we'll be able to delete our entire AWS account this summer." The company's engineering podcast "Moving Mountains of Data off S3" (January 8, 2026) confirmed the transfer finished: about 10 PB in aggregate, about 5 PB of unique objects after deduplication, copied in less than 10 days, with "no downtime"; it describes the window as negotiated ("We negotiated 90 days"). **What it solved:** a published, line-item model at a scale most companies recognize. **What it cost:** two colocation contracts, hardware on the balance sheet, and storage the team now runs.

> [!NOTE]
> The two 37signals sources disagree on the waiver window (Hansson's "free 60-day egress window" and the January 2026 episode's "We negotiated 90 days"), and the $250,000 figure is The Register's. I state the window as negotiated and the amount as reported. Hansson confirmed the account closure himself on October 20, 2025: "we finally NUKED our entire AWS account," following compute and databases in 2023 and S3 that summer.

### The clouds lower the exit fee (2024)

Two of the three largest clouds announced free data transfer out for customers who leave within eight weeks of each other: Google Cloud on January 11, 2024, for customers moving to another provider or on premises, globally, while arguing that licensing, not egress, is the bigger barrier; and AWS on March 5, 2024, through a support request and credits. Microsoft's pricing page offers the same, as of October 2026, for customers taking data out of Azure "via the internet" to "switch to another cloud provider or an on-premises data center," claimed as a credit. The terms are covered in [Leaving](#leaving-egress-commitments-and-licenses) below; the regulation that preceded them, the EU Data Act's switching chapter, belongs to [Egress & Switching](/books/hosting-and-cloud/egress-and-switching#exit-waivers-2024). **What it solved:** the one-time cost of moving data out, which for a storage-heavy exit had been the largest single obstacle. **What it cost:** nothing to the providers' ongoing egress revenue, because the waivers apply only to leaving.

### Enterprises rebalance (2025)

GEICO's VP of platform and infrastructure engineering, Rebecca Weekly, described the other kind of exit in a QCon San Francisco talk published by InfoQ in 2025: a company that went "all in" on the cloud from 2013 and was about 80% there by 2020, found that "prices had gone up for serving approximately the same load by 300%," found average utilization of about 12% in one cloud with over 200,000 cores and over 30,000 instances, and was consolidating six on-premises data centers into two active-active sites (the first coming online in July 2025) on Kubernetes and OpenStack, with roughly 103 cloud instance types collapsed into three primary hardware SKUs. Storage drove it: financial regulation requires long retention, and "storage is very expensive in the cloud." She framed it as cost to serve, not a rejection of the cloud. **What it solved:** a lift-and-shift that had kept on-premises habits (old instance types, idle capacity) at cloud prices. **What it cost:** building a private cloud team and two data centers.

## How the Numbers Work

Every published comparison sets two annual costs against each other for the same delivered capacity. The terms that decide it:

**Rented side.** The effective rate actually paid, after commitments and discounts, times the capacity used, plus data transfer out, support plans, and managed-service premiums (37signals' half million a year for RDS and Elasticsearch was a managed-service premium on top of compute). The trap is pricing the rented side at list, a difference that alone can move the answer; Ahrefs' own post (March 8, 2023) says it "compared the lowest price of a three-year reserved" instance, so its comparison already assumed commitments. The other trap is idle rented capacity: GEICO's 12% average utilization means the rented side was paying for about seven idle cores per busy one, which an owned design shouldn't copy, but which also isn't the cloud's fault.

**Owned side.** Hardware capital spread over a useful life (37signals amortized over five years, a defensible default for general compute; accelerators deserve less), colocation priced mostly per kilowatt (37signals' published line was about $60,000 a month for eight racks), network, spares, warranty and refresh, the licenses the cloud bundled, the change in staff, and the cost of capital on money spent up front; [Buying the Servers](/books/hosting-and-cloud/total-cost-of-ownership#buying-the-servers) prices each of those lines.

**Capacity.** The owned side is sized to peak plus headroom (N+1, failure domains, growth during the procurement lead time), and it costs the same whether it's busy or not. The rented side, done well, is sized to use. That asymmetry is why load shape matters more than unit price.

## A Cost Model for Owning

Reduced to its terms, owning a block of capacity for a year costs the following; [Year over Year](/books/hosting-and-cloud/total-cost-of-ownership#year-over-year) runs the same terms month by month, with capital in month zero, to a break-even month:

- **Owned annual cost** = hardware ÷ useful life + colocation (kW × price per kW-month × 12) + network + support and spares + licenses + staff change + cost of capital on the hardware.
- **Rented annual cost** for the same work = effective rate × capacity actually used + transfer out + managed-service premiums.

Owning wins when the owned annual cost, sized for peak, is below the rented cost of the work it would carry. Two ratios decide it:

- **Utilization of the owned fleet** (average used ÷ capacity owned). If an owned server costs a third of renting its equivalent all year, owning wins at any average utilization above about a third, and loses below it; a16z's practitioners' range of a third to a half is this ratio stated as a rule.
- **Steadiness** (typical load ÷ peak load). The closer the median is to the peak, the less idle capacity owning carries. A load that runs at its median most of the year and doubles for a week is a candidate to own the median and rent the peak.

37signals' February 2023 model is the clearest worked case in public: about $840,000 a year owned (hardware at about $120,000 a year over five years, colocation at about $720,000) against about $2.3 million a year rented for the same servers, so owning cost about 37% of renting at their utilization, inside a16z's range, with no staff change. Their October 2024 report beat the model because the new hardware fit in existing racks and power. Dropbox's 2016 numbers have the same shape at a different scale: $92.5 million less paid to the provider against $53.0 million more in depreciation, facilities and support, owning at about 57% of renting in the first year, while the build was still being absorbed.

Owning tends to win when:

1. **The load is steady and large enough** that the median is close to the peak and the owned fleet runs busy; storage is the clearest case, because data grows predictably and doesn't spike.
2. **The team exists** or the incremental headcount is small against the savings.
3. **The rented side's discounts have been taken** and it's still dearer: committed-use and reserved pricing are what the owned side should beat, not list price ([Commitments, Discounts & Marketplaces](/books/hosting-and-cloud/commitments-and-marketplaces#enterprise-commitments-and-shortfalls) covers them).
4. **The hardware can be run for its useful life,** five years for general compute, and the colocation contract and power fit it.
5. **Egress or a license is a large share of the rented bill,** because those are the lines owning removes outright.

Renting tends to win when the load is unknown, spiky or shrinking, when the company would have to build an infrastructure team from nothing, when the workload depends on managed services with no owned equivalent the team can run, or when capital is scarcer than margin. The answer isn't fixed: a company's load and size move it across the line in both directions, which is why the model should be rerun, not written once.

## Leaving: Egress, Commitments and Licenses

The one-time costs of leaving are separate from the run-rate comparison and can block a move that the run rate favors.

**Data transfer out.** As of October 2026:

- **AWS** (announced March 5, 2024, updated September 30, 2025 and October 8, 2026): the customer contacts AWS Support, because AWS can't tell a routine transfer from a move to another provider or on premises; approved requests receive credits for the data migrated. The program covers moving all data off AWS from all eligible accounts, or all data for a particular service; an eligible account is a payer account in good standing; customers outside the EU have 180 days to complete the move, and EU customers follow the process in Section 2.3 of AWS's EU Data Act Addendum (UK customers have a UK Customer Switching and Portability Addendum). The account needn't be closed, and AWS says it will scrutinize repeat requests. Separately, AWS counts 100 GB a month of transfer out from Regions and 1 TB from CloudFront as free, and says "over 90 percent" of its customers pay nothing for data transfer out.
- **Google Cloud** (January 11, 2024): free network data transfer for customers leaving for another provider or on premises, globally, with the request process on Google's exit page.
- **Microsoft Azure**: free egress for customers taking data out "via the internet" to "switch to another cloud provider or an on-premises data center," claimed as a credit through a documented process: a support request naming the planned start date and volume, 60 days from that date to move the data (more on request), every subscription cancelled afterwards, and a credit for at most 60 calendar days of egress charges, 180 days for UK billing addresses moving data from UK datacenters, per the Microsoft Learn page dated June 7, 2026; the first 100 GB a month are free for every customer. A separate at-cost credit for in-parallel multicloud transfer applies to EEA, EFTA and UK billing addresses.

These are waivers for leaving, not changes to egress pricing: a hybrid design that keeps sending data between an owned site and a cloud pays normal rates, except where the EU and UK arrangements apply. The waiver's window is the schedule: 37signals' transfer took less than 10 days on a negotiated window because it had built the target first.

**Commitments.** A committed-spend contract or reserved capacity with time left is a cost of leaving early: the shortfall is billed whether or not the workload is there. 37signals timed its S3 exit to the end of a four-year contract, and missing the date would have cost about $5,000 a day. The core model's `commitments.term` and `shortfall_mode` say when a move can happen without paying for capacity twice.

**Licenses.** Google's exit announcement argued that "restrictive and unfair licensing practices," not data transfer, are the larger barrier to switching; the cases and the complaints behind that argument belong to [Licensing Disputes](/books/hosting-and-cloud/licensing-disputes#microsoft-and-the-listed-providers). For a repatriation the practical question is the reverse: which software the cloud bundled into its price must now be bought, and on what metric (per core, per socket, per node).

## The Alternatives

| Model | Strengths | Failure modes | Ownership and licensing | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **Stay and optimize** (rightsizing, newer instance types, commitments) | No migration; keeps managed services and elasticity | Commitments lock in a forecast; utilization habits persist | Rented | Effective rate after discounts | Most companies, first ([cost levers](/docs/operations/cost-and-finops#the-levers-that-actually-matter)) |
| **Own the baseline, rent the burst** | Owned capacity runs busy; peaks and unknowns stay elastic | Two platforms to run; transfer between them is billed at normal rates | Mixed | Owned baseline plus rented peak | Companies with a steady core and seasonal peaks |
| **Owned hardware in colocation** | Lowest unit cost at steady load; full hardware choice | Capital, lead times, spares and a team; no elasticity | Owned hardware, leased space | Amortization plus colo, network, support, staff | Dropbox, 37signals, GEICO |
| **Rented dedicated servers** | No capital; the provider handles parts | One provider's configurations and network; the provider can [exit the product](/books/hosting-and-cloud/migrations-and-end-of-life#the-kinds-of-ending) | Rented by the month | Per server per month | Hosts and steady workloads ([Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers#the-alternatives)) |
| **Cloud hardware on site** (Outposts and peers) | The cloud's APIs, owned site | Term commitment; still the cloud's price for capacity | Provider-owned in the customer's building | Term subscription | Latency and residency, not cost ([Hybrid & On-Prem Cloud](/books/hosting-and-cloud/hybrid-and-on-prem-cloud#the-alternatives)) |
| **Bought rack-scale computer or private cloud stack** (Oxide, OpenStack, Nutanix, VMware) | Cloud-style self-service on owned hardware | The customer operates the platform; license terms for the commercial stacks | Owned; open source or subscription | Capital plus support or subscription | Companies replacing a cloud or a VMware estate |
| **Never move in** | No migration either way | Lead times and capacity planning from day one | Owned or leased | As owned | Ahrefs, by its own account |

## My Default

My default is to start in the cloud and keep a written exit: a cost model rerun every year against the effective rates actually paid, the commitment end dates, the egress the data would cost to move, and the team that would run it. I'd move a workload out when its load has been steady for a year or more, its owned cost at a five-year life and realistic utilization is under about half of its rented cost after discounts, and the people exist or the savings pay for them with margin (counted as the change in staff, per [Counting People](/books/hosting-and-cloud/total-cost-of-ownership#counting-people), with the work each platform leaves the team from [Staffing by Platform](/books/hosting-and-cloud/total-cost-of-ownership#staffing-by-platform)). Storage is the first candidate, because it is steady, large and the least dependent on managed services; general compute follows; managed databases, queues and anything with spiky load come last or not at all. I'd own the baseline and rent the peak before owning the peak, and I'd time the move to the end of a commitment term and inside an exit waiver window, with the target built first so the transfer is days, not months.

What would change it: a company without an infrastructure team, where the staff line erases the saving; a load still growing or changing shape fast enough that a five-year hardware forecast is a guess; or a dependency on a managed service with no equivalent the team can operate. In those cases optimizing the rented side wins, and the exit stays on paper.

## How to Build It

Repatriation adds no tables. The comparison is a query over the core model, with one convention: **the provider's own underlay bill is rated usage of its internal account.** A provider that runs on a cloud loads that cloud's bill (its [cost export](/books/hosting-and-cloud/finops-and-surprise-bills#cost-exports-cur-and-focus)) as `usage_events` from a source such as `underlay:aws`, rated at a price book named for its contract, under the internal account that already holds its own cabinets and hosts ([The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation#how-to-build-it), [Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers#how-to-build-it)). The rented side is then a sum like every other cost, at the effective rate after commitments, and the demand profile comes from the same rows.

```sql
-- Rent versus own, per compute SKU on the underlay, over the last 12 months.
-- Parameters are the owned-side assumptions, stated and dated in the decision record:
--   :internal_account_id  the provider's own account
--   :units_per_server     instances of the SKU one owned server replaces at the same load
--   :server_year_cost     hardware / useful life + kW x colo price x 12 + support and spares,
--                         in minor units; colo from facility_contracts, hardware from quotes
--   :staff_delta_year     the change in staff cost, in minor units
--   :headroom             peak multiplier for N+1 and growth during procurement, e.g. 1.25

WITH hourly AS (                         -- concurrent instances per hour, and what they cost
  SELECT ru.sku_id,
         lower(ru.rated_during)            AS hour,       -- rated hourly for this account
         SUM(ru.quantity) / 3600.0         AS instances,  -- sku unit = 'second'
         SUM(ru.amount)                    AS amount
  FROM rated_usage ru
  JOIN skus s ON s.id = ru.sku_id
  WHERE ru.account_id = :internal_account_id
    AND s.unit = 'second'
    AND lower(ru.rated_during) >= NOW() - INTERVAL '12 months'
  GROUP BY ru.sku_id, lower(ru.rated_during)
),
profile AS (
  SELECT sku_id,
         percentile_cont(0.50) WITHIN GROUP (ORDER BY instances) AS p50,
         percentile_cont(0.95) WITHIN GROUP (ORDER BY instances) AS p95,
         SUM(instances)                                          AS instance_hours,
         SUM(amount)                                             AS rented_amount,
         SUM(amount) / NULLIF(SUM(instances), 0)                 AS effective_rate
  FROM hourly
  GROUP BY sku_id
),
sized AS (
  SELECT p.*,
         CEIL(p.p95 * :headroom / :units_per_server) AS servers_for_peak,
         CEIL(p.p50 / :units_per_server)             AS servers_for_base
  FROM profile p
)
SELECT k.code                                                   AS sku,
       ROUND((z.p50 / NULLIF(z.p95, 0))::numeric, 2)            AS steadiness,
       ROUND((z.instance_hours
              / NULLIF(z.servers_for_peak * :units_per_server * 8760, 0))::numeric, 2)
                                                                AS owned_utilization,
       z.rented_amount                                          AS rent_all,
       z.servers_for_peak * :server_year_cost + :staff_delta_year
                                                                AS own_all,
       z.servers_for_base * :server_year_cost + :staff_delta_year
         + (SELECT COALESCE(SUM(GREATEST(h.instances - z.servers_for_base * :units_per_server, 0)), 0)
            FROM hourly h WHERE h.sku_id = z.sku_id) * z.effective_rate
                                                                AS own_base_rent_burst
FROM sized z
JOIN skus k ON k.id = z.sku_id
ORDER BY z.rented_amount DESC;

-- What blocks leaving before a date: open commitments on the internal account.
SELECT c.kind, c.amount, c.currency, upper(c.term) AS ends_at, c.shortfall_mode, c.contract_ref
FROM commitments c
WHERE c.account_id = :internal_account_id
  AND upper(c.term) > NOW()
ORDER BY upper(c.term);
```

Notes on the sketch:

- **Three answers, not one.** `rent_all`, `own_all` and `own_base_rent_burst` are the rows of [The Alternatives](#the-alternatives) as numbers; with `steadiness` and `owned_utilization` next to them, the query shows why one wins, not just which.
- **The rented side is the effective rate.** Because the underlay bill is rated at the contract's price book, `amount` already reflects committed and negotiated rates, which is the comparison the published critiques say most models skip. `commitment_id` on `rated_usage` shows which spend sat under a commitment.
- **Storage uses the same shape.** For SKUs with unit `gb_month`, replace concurrent instances with stored gigabytes and `units_per_server` with usable capacity per storage node after replication or erasure coding; growth, not peak, sets the headroom.
- **Egress and licenses are separate lines.** Transfer-out SKUs on the underlay are what the owned side removes; licenses the cloud bundled are what it adds. Both belong in `server_year_cost` or beside it, not hidden in it.
- **Hourly rating is assumed.** If the underlay bill is rated by day, the percentiles describe days, and peaks inside a day disappear; load the bill at hourly granularity before trusting the steadiness figure.
- **Events:** `usage.rated` for the internal account's underlay rows feeds the comparison; a rerun of this query is a decision record with its parameters, kept with the [FinOps](/docs/operations/cost-and-finops#cost-in-design-reviews) review that acts on it.

## Auditing

- **The decision record.** The parameters, the query output, the date and who decided, because the assumptions (useful life, utilization, staff) are what a later review will challenge.
- **The exit waiver.** The request, approval, window and credits, because the credit arrives after the transfer and the conditions (all data, all eligible accounts) must be shown to have been met.
- **Commitment end dates and notices,** so a move is timed to the contract rather than paying a shortfall.
- **Hardware capitalization.** Purchase, depreciation schedule and disposal per asset ([Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers#auditing)), because the saving shows up as depreciation, as Dropbox's S-1 did.

## What This Means for the System You Build

- **Keep a written exit** for every rented layer, with the cost model that says when to take it, and rerun it yearly ([Total Cost of Ownership](/books/hosting-and-cloud/total-cost-of-ownership#how-to-build-it) keeps its inputs as effective-dated rows).
- **Compare against the effective rate,** after commitments and discounts, never list price.
- **Size the owned side to peak and judge it by utilization,** because idle owned capacity is the cost the cloud was hiding, and judge the move by its break-even month, not one year's saving ([Year over Year](/books/hosting-and-cloud/total-cost-of-ownership#year-over-year)).
- **Count only the staff change,** and count a whole team if none exists ([Counting People](/books/hosting-and-cloud/total-cost-of-ownership#counting-people)).
- **Use a realistic useful life:** five years for general compute, less for accelerators, and model the refresh after it ([Buying the Servers](/books/hosting-and-cloud/total-cost-of-ownership#buying-the-servers)).
- **Move storage first,** steady compute next, managed services last.
- **Time the move** to commitment end dates and inside an exit waiver window, with the target built first.
- **Be precise about cases:** a company that never moved in, or changed architecture inside one cloud, isn't evidence about leaving.

The path this volume followed runs in both directions. Dropbox built Magic Pocket and moved its users' files home; 37signals moved compute, then about 10 PB out of S3, and deleted its AWS account; Ahrefs never moved in. Each placed the same workload again with better numbers, the decision a homelab operator makes when the closet runs out of power and a provider makes when it chooses what to build, buy or rent. The model in this volume serves every point on that path, because the same account, resource and usage records describe a server at home, a cabinet in colocation and a virtual machine in a region.

## References

**Filings**

- [Dropbox: Form S-1 (February 2018)](https://www.sec.gov/Archives/edgar/data/0001467623/000119312518055809/d451946ds1.htm), Infrastructure Optimization, the $39.5 million and $35.1 million infrastructure cost decreases with their components, the Q4 2016 completion and gross margin by year

**Provider documentation**

- [AWS News Blog: Free data transfer out to internet when moving out of AWS](https://aws.amazon.com/blogs/aws/free-data-transfer-out-to-internet-when-moving-out-of-aws/), March 5, 2024, updated September 30, 2025 and October 8, 2026, the support request, credits, eligible accounts, 180 days, the EU and UK addenda and the free baseline
- [Microsoft Azure: Bandwidth pricing](https://azure.microsoft.com/en-us/pricing/details/bandwidth/), free egress when leaving Azure and the first 100 GB a month, as of October 2026
- [Microsoft Learn: Cancel and delete your Azure subscription](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/cancel-azure-subscription), the exit request, the 60-day window and credit cap and the UK 180-day variant (page dated June 7, 2026)
- [Microsoft Learn: Azure data transfer fees](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/data-transfer-fees), the at-cost multicloud credit for EEA, EFTA and UK billing addresses

**Announcements and release notes**

- [Google Cloud: Removing data transfer fees when moving off Google Cloud](https://cloud.google.com/blog/products/networking/eliminating-data-transfer-fees-when-migrating-off-google-cloud), January 11, 2024, free transfer for leaving customers and the licensing argument
- [Dropbox Tech: Scaling to exabytes and beyond](https://dropbox.tech/infrastructure/magic-pocket-infrastructure), March 14, 2016, Magic Pocket, 500 PB, the October 7, 2015 milestone, design targets and continued AWS use
- [Dropbox Tech: Inside the Magic Pocket](https://dropbox.tech/infrastructure/inside-the-magic-pocket), May 6, 2016, zones, cells, buckets, replication and erasure coding, and per-machine and per-rack capacity
- [37signals: Why we're leaving the cloud](https://world.hey.com/dhh/why-we-re-leaving-the-cloud-654b47e0), October 19, 2022
- [37signals: We stand to save $7m over five years from our cloud exit](https://world.hey.com/dhh/we-stand-to-save-7m-over-five-years-from-our-cloud-exit-53996caa), February 21, 2023, the 2022 bill, hardware, colocation and the projected savings
- [37signals: Leaving the Cloud: The Finale](https://37signals.com/podcast/leaving-the-cloud-the-finale/), July 12, 2023, compute out and 8 PB still in S3
- [37signals: Our cloud-exit savings will now top ten million over five years](https://world.hey.com/dhh/our-cloud-exit-savings-will-now-top-ten-million-over-five-years-c7d9b5bd), October 17, 2024, the $1.3 million run rate, the S3 contract and the storage plan
- [DHH on X: the 37signals AWS account deleted](https://x.com/dhh/status/1980406035543388259), October 20, 2025
- [37signals: It's five grand a day to miss our S3 exit](https://world.hey.com/dhh/it-s-five-grand-a-day-to-miss-our-s3-exit-b8293563), March 26, 2025, S3 cost, the Pure Storage purchase, the June 30 contract end and the 60-day egress window
- [37signals Dev: Moving Mountains of Data off S3](https://dev.37signals.com/moving-mountains-of-data-off-s3/), January 8, 2026, the completed transfer, volumes, duration and the negotiated window

**In practice**

- [Andreessen Horowitz: The Cost of Cloud, a Trillion Dollar Paradox](https://a16z.com/the-cost-of-cloud-a-trillion-dollar-paradox/), May 27, 2021, the argument, its rule of thumb and its stated assumptions
- [The Register: 37signals is completing its on-prem move](https://www.theregister.com/2025/05/09/37signals_cloud_repatriation_storage_savings), May 9, 2025, the reported $250,000 egress waiver and the account deletion plan
- [InfoQ: Rebecca Weekly on GEICO's platform and cloud infrastructure (QCon San Francisco)](https://www.infoq.com/presentations/platform-cloud-infrastructure), 2025, cost growth, utilization, the data center consolidation and storage
- [Ahrefs: How Ahrefs saved US$400M in 3 years by not going to the cloud](https://tech.ahrefs.com/how-ahrefs-saved-us-400m-in-3-years-by-not-going-to-the-cloud-8939dd930af8), Efim Mirochnik, March 8, 2023, the three-year reserved instance comparison
- [The Register: Ahrefs claims $400 million saved by not using the cloud](https://www.theregister.com/2023/03/13/ahrefs_on_prem_savings/), March 13, 2023, the comparison, its figures and caveats
- [DevClass: Reduce costs by 90% by moving from microservices to monolith](https://devclass.com/2023/05/05/reduce-costs-by-90-by-moving-from-microservices-to-monolith-amazon-internal-case-study-raises-eyebrows/), May 5, 2023, the Prime Video monitoring service on EC2 and ECS
</content>
</invoke>
