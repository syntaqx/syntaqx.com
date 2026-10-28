+++
title = "Migrations, Shutdowns & End of Life"
nav_title = "Migrations & End of Life"
description = "Product sunsets from Heroku's free tier to Google Domains and Chef Infra Server: notice, forced migrations, version end of life, data export and getting out."
category = "Hosting & Cloud Industry"
order = 2211
part = "Running the Provider"
tags = ["end-of-life", "sunsets", "migrations", "data-export", "deprecation"]
+++

Every product a provider sells will end: a free tier gets withdrawn, a version stops getting fixes, a service is closed, a business is sold with its customers, a platform goes into maintenance. For the provider it is a line in a roadmap. For the customer it is unplanned work on someone else's clock, with production systems, domain names and data inside the thing that is ending. The difference between a sunset customers remember as fair and one they remember as a betrayal is rarely the decision itself. It is the notice, the migration path, whether the data can get out, and whether the dates hold.

This chapter collects the public record of sunsets in this industry, from free tiers (Heroku, PlanetScale) to hosted products (Google Domains, Container Registry, [Chef Infra Server](/books/hosting-and-cloud/chef#licensing-chef-360-and-cinc), Upstash Kafka, LiteFS Cloud, Deno Deploy Classic, travis-ci.org) to platforms put into maintenance (Heroku in 2026), the reversals (CodeCommit, Docker's Free Team), and the forced migrations that come from versions reaching end of life. It sets out the lifecycle of a sunset, what notice providers have actually given, what data export means for infrastructure, and the tables that make a sunset and an export records with dates on top of [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model).

The migration engineering is the playbook's: [Replacing Systems](/docs/architecture/replacing-systems) for strangling, cutover, the read-only archive and [vendor exports](/docs/architecture/replacing-systems#vendor-exports-and-lock-in), [Plan the Exit Before You Enter](/docs/architecture/replacing-systems#plan-the-exit-before-you-enter) for the customer's side, [Data Retention & Deletion](/docs/architecture/data-retention) for what is deleted when, and [GDPR data subject rights](/docs/compliance/gdpr#data-subject-rights) for portability. The User-Generated Platforms volume covers the same problem for user content ([Migrations, Shutdowns & Purges](/books/user-generated-platforms/migrations-and-shutdowns#ending-a-feature-or-a-service)); this chapter is the infrastructure side, where what ends is a running system rather than a profile. The legal side of leaving a cloud (egress waivers, the EU Data Act's switching rules) is [Egress & Switching](/books/hosting-and-cloud/egress-and-switching)'s.

## How the Providers Do It

| Product | Provider | What ended | Announced | Effective | Path offered |
| --- | --- | --- | --- | --- | --- |
| **Bamboo Cloud** | Atlassian | Hosted CI | May 2016 | Discontinued January 31, 2017 | Bitbucket Pipelines or self-hosted Bamboo |
| **travis-ci.org** | Travis CI (Idera) | Free hosted CI for open source on the .org site | Read-only scheduled for December 31, 2020 | Shut down May 31, 2021; history read-only | travis-ci.com on credits; many projects left for other CI |
| **Heroku free plans** | Salesforce | Free dynos, Postgres and Redis | August 25, 2022 | Inactive accounts deleted from October 26, 2022; free plans ended November 28, 2022 | Paid plans; the stated reason was "fraud and abuse of the Heroku free product plans" |
| **Docker Free Team** | Docker | Free organizations | March 2023 | Reversed March 24, 2023, with refunds | Withdrawn after the backlash ([Artifacts & Registries](/books/hosting-and-cloud/artifacts-and-registries#docker-hub-s-limits-2020-to-2025)) |
| **Google Domains** | Google, sold to Squarespace | The registrar business and its customers | June 15, 2023 | Sale closed September 7, 2023 for $180.7 million; domains migrated to Squarespace | Move with the sale, or transfer to another registrar |
| **Google Container Registry** | Google | The registry behind `gcr.io` | Deprecated May 15, 2023 | Writes ended March 18, 2025; reads ended in spring 2025 | Artifact Registry, with `gcr.io` hosting ([The Container Registry Shutdown](/books/hosting-and-cloud/artifacts-and-registries#the-container-registry-shutdown)) |
| **PlanetScale Hobby** | PlanetScale | The free database plan | About a month before | April 8, 2024 | Paid plans ([Free Tiers, Pauses and Sunsets](/books/hosting-and-cloud/serverless-and-edge-databases#free-tiers-pauses-and-sunsets)) |
| **AWS OpsWorks** | AWS | Managed Puppet Enterprise and Chef servers; OpsWorks Stacks | | Puppet Enterprise after March 31, 2024; Chef Automate on May 5, 2024; Stacks on May 26, 2024 | Self-managed servers or other tools ([CFEngine and Puppet](/books/hosting-and-cloud/cfengine-and-puppet#how-the-providers-do-it)) |
| **CodeCommit** | AWS | New customer sign-ups | | Closed to new customers July 25, 2024; returned to general availability November 2025 | A reversal ([Consolidation and Shutdowns](/books/hosting-and-cloud/ci-cd-platform-business#consolidation-and-shutdowns)) |
| **LiteFS Cloud** | Fly.io | Managed backups for LiteFS | July 15, 2024 | Available until October 15, 2024 | Self-managed backups |
| **Upstash Kafka** | Upstash | Serverless Kafka | September 6, 2024 | Support discontinued "starting in six months" (early 2025); closed to new users at once | Upstash's QStash and Workflow, with migration credits for suitable cases |
| **Salt package repository** | Broadcom (VMware) | `repo.saltproject.io` | 2024 | Moved at the end of October 2024; packages older than 3006 dropped | `packages.broadcom.com` ([Ansible and Salt](/books/hosting-and-cloud/ansible-and-salt#how-the-providers-do-it)) |
| **CDK for Terraform** | HashiCorp (IBM) | The CDKTF project | | Sunset and archived December 10, 2025 | `cdktf synth --hcl` to plain HCL, or AWS CDK ([General-Purpose Languages](/books/hosting-and-cloud/terraform-and-opentofu#general-purpose-languages-cdk-cdktf-and-pulumi)) |
| **Chef Infra Server (open source)** | Progress | The server customers self-hosted | November 26, 2025 | No fixes after October 2026; end of life November 2026 (15.x on November 30, 2026) | Chef 360, local mode, or the Cinc community fork ([Licensing, Chef 360 and Cinc](/books/hosting-and-cloud/chef#licensing-chef-360-and-cinc)) |
| **Heroku** | Salesforce | New features, and enterprise contracts for new customers | February 6, 2026 | Immediately; "no change for customers using Heroku today," no end-of-life date | Existing contracts honored and renewable ([The Platform Lifecycle](/books/hosting-and-cloud/paas-and-frontend-clouds#the-platform-lifecycle-heroku)) |
| **Deno Deploy Classic** | Deno | The first Deploy platform | | Shut down July 20, 2026; KV data not migrated automatically | The new Deno Deploy |
| **Azure Automation State Configuration** | Microsoft | The hosted DSC pull server | | Retiring September 30, 2027 (Linux DSC retired September 30, 2023) | Machine Configuration ([CFEngine and Puppet](/books/hosting-and-cloud/cfengine-and-puppet#how-the-providers-do-it)) |

Four patterns run through the table:

- **Free tiers end for abuse and cost.** Heroku said so directly, and the other free-plan removals follow the same economics: a free product is a fraud surface with a support load and no revenue ([Free-Tier Fraud & Stolen Keys](/books/hosting-and-cloud/free-tier-fraud-and-stolen-keys#free-tier-farming)).
- **Hosted control planes for open-source tools don't last.** OpsWorks, Azure's DSC pull server, Chef's open-source server and CDKTF all ended while the tools underneath carried on, which is the pattern [Open Source & the Clouds](/books/hosting-and-cloud/open-source-and-the-clouds#the-license-spectrum) describes from the licensing side.
- **Notice ranges from weeks to years.** PlanetScale gave about a month, LiteFS Cloud three months, Upstash six, Chef Infra Server about a year, and Container Registry nearly two from deprecation to the end of writes. Nothing in the market sets a floor, except contracts and, in the EU, the switching rules.
- **Sunsets get reversed.** Docker withdrew the Free Team change in about a week and AWS reopened CodeCommit after sixteen months. A provider that ends something used by regulated customers or large open-source communities should expect to be asked to undo it.

## The Kinds of Ending

The cases sort into six kinds, and each has its own customer obligations:

| Kind | Example | What the customer must do | What the provider owes |
| --- | --- | --- | --- |
| **Free tier withdrawn** | Heroku, PlanetScale Hobby | Pay, or move | Notice, a paid path at a stated price, deletion only after the date |
| **Product shut down** | Container Registry, LiteFS Cloud, Upstash Kafka, Deno Deploy Classic | Migrate to a successor or a competitor | A dated schedule, a migration path, data export until after shutdown |
| **Version end of life** | [Chef Infra Server](/books/hosting-and-cloud/chef#licensing-chef-360-and-cinc) 15.x, RDS engine versions, Kubernetes minors | Upgrade | A support calendar published in advance, and either paid extended support or a forced upgrade with notice |
| **Business sold** | Google Domains to Squarespace | Accept the new provider or transfer out | Continuity of service and security settings, and the right to leave |
| **Maintenance mode** | Heroku from February 2026 | Decide whether to stay | Clarity on what still gets fixed and for how long |
| **Location or endpoint moved** | Salt packages, `gcr.io` | Update every reference | Redirects where possible, and a cutover date |

**Version end of life** is the most common forced migration and the one providers have turned into revenue. RDS Extended Support charges per vCPU-hour to run an engine version past its end of standard support, doubling in the third year, then upgrades automatically ([Extended Support and Forced Upgrades](/books/hosting-and-cloud/managed-databases#extended-support-and-forced-upgrades)); the managed Kubernetes services charge extra for clusters on minors past standard support ([Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes#extended-support)). Hosts pass operating system end of life through the license bill: a cPanel partner listed a higher surcharge for servers on end-of-life CentOS and CloudLinux 6 and 7 from January 1, 2026 ([Control Panel Licensing & the Alternatives](/books/hosting-and-cloud/control-panel-licensing)). Extended support is a fair product when it is optional and priced in advance; it becomes a penalty when enrollment is automatic and the price appears on the bill first.

**A business sold with its customers** carries a risk the others don't: the customer's security settings may not survive the move. In July 2024, after Google Domains customers had been migrated to Squarespace, attackers took over at least a dozen domains, mostly of cryptocurrency companies; researchers said accounts could be created for migrated domains' email addresses without verification and that multi-factor authentication was off after the migration, and Squarespace attributed the attacks to an OAuth login weakness it fixed within hours. A provider buying or selling a customer base has to carry over authentication, locks and contacts as part of the migration, not after it ([Transfers, Locks & Registrar Security](/books/hosting-and-cloud/transfers-and-locks)).

## The Lifecycle of a Sunset

The public cases follow a sequence, whether or not the provider names its stages:

1. **Announce** with every date at once: when new sign-ups close, when fixes stop, when the service stops, when data is deleted. [Chef](/books/hosting-and-cloud/chef#licensing-chef-360-and-cinc)'s announcement gave the end of fixes (end of October 2026) and end of life (November 2026) together, a year ahead; Google's Container Registry schedule was revised as it went, and the read cutoff was published only in its last months.
2. **Close to new customers.** Upstash closed Kafka to new users on the day of the announcement; AWS closed CodeCommit to new customers while existing ones continued.
3. **Stop changes.** No new features, then no fixes. Heroku's sustaining model is this stage with no end date; Chef's open-source server reached it at the end of October 2026.
4. **Read-only.** travis-ci.org was scheduled to go read-only before its shutdown, and its build history stayed read-only after.
5. **Shut down.** The service stops answering; writes first, then reads, as Container Registry did.
6. **Delete,** after a stated retention window, except records under legal hold or retention rules.

The UGP volume's [sunset state machine](/books/user-generated-platforms/migrations-and-shutdowns#ending-a-feature-or-a-service) has the same shape, and the tables below follow it. Three infrastructure-specific rules sit on top:

- **Customers find out from their systems, not their inbox.** Announcements reach billing contacts; the people who run the workload learn when a build fails. AWS sends end-of-support notices as account-specific Health events in its "scheduled change" category, with the affected resources named, which is the right channel: the notice goes to the resource, not only the account.
- **References outlive the product.** Image names in manifests, package repository URLs in provisioning scripts, API endpoints in client libraries and DNS names in customers' configuration keep pointing at the old thing for years. A redirect, an error that names the replacement, or a hosted alias (as Artifact Registry did for `gcr.io`) costs the provider little and saves every customer an outage.
- **Deletion follows shutdown by a stated window.** The data stays retrievable after the service stops, because the customer who missed every notice finds out on the day it stops.

## Data Export and Getting Out

For infrastructure, export is not one archive. It is a different mechanism for each kind of resource, and the provider has to offer each:

| Resource | What getting out means | Mechanism |
| --- | --- | --- |
| Virtual machines and volumes | The disk, in a format another platform boots | Image or snapshot export to object storage, in a standard disk format |
| Object storage | Every object, with metadata | The S3-compatible API, bulk copy tools, and egress waived or priced for the move |
| Databases | A consistent dump or a replication stream | Native dumps; logical replication to the destination for a low-downtime cutover |
| Container images and artifacts | Every tag, with digests intact | Registry API pulls; the OCI format makes images portable |
| Domains | The registration | An unlocked domain and its transfer authorization code, on request ([Transfers, Locks & Registrar Security](/books/hosting-and-cloud/transfers-and-locks)) |
| DNS | Every record | A zone file export |
| Phone numbers | The numbers themselves | Port-out to another carrier ([Phone Numbers & Porting](/books/hosting-and-cloud/phone-numbers-and-porting)) |
| Configuration and IaC state | What was declared | State files and configuration exports (CDKTF's `synth --hcl` is the case) |
| Billing history | Invoices and usage | Cost and usage exports, invoices as documents |

Two clocks govern export after a customer leaves, and both should be published. The first is the account's: AWS keeps a closed account reopenable for a 90-day post-closure period, after which it deletes the content and never reuses the account ID; the other providers' clocks are in [Account Standing](/books/hosting-and-cloud/accounts-and-resellers#account-standing). The second is the product's: how long after a sunset's shutdown the data stays retrievable. Deno's note that existing KV data "is not automatically migrated" to its new platform is the honest version of a rule most providers leave unsaid: a successor product is not a migration unless the provider moves the data.

The cost of getting out is mostly egress. The waivers providers now offer for leaving, and the EU Data Act's rules on switching charges, are [Egress & Switching](/books/hosting-and-cloud/egress-and-switching)'s; for a sunset, my rule is simpler: when the provider ends the product, the provider pays the egress to move off it.

## The Alternatives

A provider that decides to end something has more options than shutting it down:

| Approach | What it means | Strengths | Failure modes | Example |
| --- | --- | --- | --- | --- |
| **Hard shutdown** | A date, then off | Clean; the cost stops | Customers who miss the notice lose service and possibly data | LiteFS Cloud, Deno Deploy Classic |
| **Maintenance mode** | No new features, fixes continue, no end date | No forced migration; existing revenue continues | Uncertainty; customers leave anyway, slowly | Heroku from February 2026 |
| **Paid extended support** | Old versions kept running for a fee, then a forced upgrade | Turns a forced migration into a choice with a price | Auto-enrollment feels like a penalty | RDS Extended Support |
| **Sale or transfer** | Customers move to another provider | Continuity for customers; value for the seller | Security settings and contacts lost in the move | Google Domains to Squarespace |
| **Open-source release or community fork** | The code continues outside the vendor | The community carries it | No one is accountable for fixes | Cinc for [Chef](/books/hosting-and-cloud/chef#licensing-chef-360-and-cinc); CDKTF's MPL code remains forkable |
| **Migration to a successor with credits** | A replacement product and money to move | Keeps the customer | The successor may not fit | Upstash's credits toward QStash |

## My Default

My default for ending a product is a published schedule with every date at once and at least twelve months between announcement and shutdown for anything running production workloads (six for a free tier), closure to new customers on the day of announcement, fixes until shutdown, data retrievable for at least 90 days after it, a redirect or a named error at every old endpoint, and egress paid by the provider for moving off. I'd send the notice to each affected resource's owners through the console, the API and email, not only to the billing contact, and repeat it on a schedule that ends with the shutdown date.

For version end of life I'd publish the support calendar for every version at its release and make extended support opt-in, priced in advance. For a sale I'd carry over authentication and locks before moving a single account. What would change this: a free tier being actively abused can justify shorter notice for new activity, as long as existing data stays retrievable on the published schedule; and a security problem that can't be fixed in an old version justifies an accelerated end, with the reason stated.

## How to Build It

The chapter adds the two tables the foundation names, `product_sunsets` and `data_exports`, plus the per-resource notices that connect a sunset to the customers it affects. The model follows the UGP volume's `service_sunsets`, with infrastructure scopes; version calendars for Kubernetes and engines live with the chapters that own those versions ([Kubernetes Architecture](/books/hosting-and-cloud/kubernetes-architecture#release-cadence-and-support-windows), [Managed Databases](/books/hosting-and-cloud/managed-databases#how-to-build-it)), and their end dates feed a `product_sunsets` row of scope `version`.

```sql
CREATE TABLE product_sunsets (           -- ending a product, plan, version, region or endpoint
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  scope            TEXT NOT NULL CHECK (scope IN ('product', 'plan', 'free_tier', 'version',
                     'region', 'feature', 'endpoint', 'business_transfer')),
  product_id       UUID REFERENCES products (id),
  plan_id          UUID REFERENCES plans (id),
  region_id        TEXT REFERENCES regions (id),
  subject          TEXT NOT NULL,        -- 'engine mysql 8.0', 'gcr.io', 'free plan'
  reason           TEXT NOT NULL CHECK (reason IN ('cost', 'abuse', 'low_adoption',
                     'replaced', 'upstream_end_of_life', 'security', 'sale', 'legal')),
  successor_product_id UUID REFERENCES products (id),
  acquirer         TEXT,                 -- for a business transfer
  announced_at     TIMESTAMPTZ NOT NULL,
  closed_to_new_at TIMESTAMPTZ,          -- no new sign-ups or resources
  fixes_end_at     TIMESTAMPTZ,          -- no further fixes
  read_only_at     TIMESTAMPTZ,
  shutdown_at      TIMESTAMPTZ,          -- the service stops
  exports_until    TIMESTAMPTZ,          -- data retrievable until
  delete_at        TIMESTAMPTZ,
  extended_support_sku_id UUID REFERENCES skus (id),  -- paid support past fixes_end_at
  migration_credit_program TEXT,         -- the credit_programs code, if credits are offered
  egress_waived    BOOLEAN NOT NULL DEFAULT FALSE,
  announcement_url TEXT NOT NULL,
  state            TEXT NOT NULL CHECK (state IN ('announced', 'closed_to_new', 'no_fixes',
                     'read_only', 'shut_down', 'deleted', 'reversed')),
  reversed_at      TIMESTAMPTZ,
  CHECK (shutdown_at IS NULL OR exports_until IS NULL OR exports_until >= shutdown_at),
  CHECK (delete_at IS NULL OR exports_until IS NULL OR delete_at >= exports_until),
  CHECK ((state = 'reversed') = (reversed_at IS NOT NULL)),
  CHECK (scope <> 'business_transfer' OR acquirer IS NOT NULL)
);

CREATE TABLE product_sunset_versions (   -- every change to the schedule, kept
  sunset_id        UUID NOT NULL REFERENCES product_sunsets (id),
  version          INT NOT NULL,
  schedule         JSONB NOT NULL,       -- every date as announced in this version
  changed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  change_reason    TEXT NOT NULL,
  PRIMARY KEY (sunset_id, version)
);

CREATE TABLE sunset_notices (            -- who was told, about what, and when
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  sunset_id        UUID NOT NULL REFERENCES product_sunsets (id),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  resource_id      UUID REFERENCES resources (id),   -- null: an account-level notice
  channel          TEXT NOT NULL CHECK (channel IN ('email', 'console', 'api_event',
                     'webhook', 'in_product_error')),
  milestone        TEXT NOT NULL,        -- 'announced', 't_minus_90', 't_minus_30',
                                         -- 'shutdown', 'exports_ending'
  schedule_version INT NOT NULL,         -- which dates the notice stated
  sent_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sunset_id, account_id, resource_id, channel, milestone)
);

CREATE TABLE data_exports (              -- getting a customer's data out
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  resource_id      UUID REFERENCES resources (id),   -- null: an account-wide export
  trigger          TEXT NOT NULL CHECK (trigger IN ('customer_request', 'sunset',
                     'account_closure', 'gdpr_art_20', 'switching_request', 'legal')),
  sunset_id        UUID REFERENCES product_sunsets (id),
  mechanism        TEXT NOT NULL CHECK (mechanism IN ('image_export', 'snapshot_export',
                     'object_copy', 'database_dump', 'replication', 'registry_pull',
                     'zone_file', 'domain_auth_code', 'number_port', 'state_export',
                     'billing_export')),
  format           TEXT,                 -- 'vmdk', 'raw', 'pg_dump', 'oci', 'bind'
  destination      TEXT,                 -- where it was delivered, as the customer gave it
  bytes            BIGINT,
  egress_waived    BOOLEAN NOT NULL DEFAULT FALSE,   -- Egress & Switching's egress_waivers
                                                     -- holds the waiver itself
  status           TEXT NOT NULL CHECK (status IN ('requested', 'running', 'ready',
                     'delivered', 'failed', 'expired')),
  requested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reauthenticated_at TIMESTAMPTZ NOT NULL,           -- an export is a takeover target
  ready_at         TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,
  operation_id     UUID REFERENCES control_plane_operations (id)  -- Provider Architecture
);
```

```sql
-- Who still runs on a sunsetting product, for the next notice and for the shutdown plan.
SELECT r.account_id, r.id AS resource_id, r.kind, r.region_id,
       MAX(n.sent_at) FILTER (WHERE n.milestone = 't_minus_30') AS told_30_days_out
FROM product_sunsets ps
JOIN skus k        ON k.product_id = ps.product_id
JOIN rated_usage u ON u.sku_id = k.id
                  AND u.rated_during && tstzrange(NOW() - INTERVAL '7 days', NOW())
JOIN resources r   ON r.id = u.resource_id AND r.state IN ('active', 'stopped')
LEFT JOIN sunset_notices n ON n.sunset_id = ps.id AND n.resource_id = r.id
WHERE ps.id = $1
  AND (ps.region_id IS NULL OR r.region_id = ps.region_id)
GROUP BY r.account_id, r.id, r.kind, r.region_id
ORDER BY told_30_days_out NULLS FIRST;
```

Notes on the sketch:

- **Every date at once, and every change kept.** `product_sunsets` holds the current schedule; `product_sunset_versions` keeps each published version, so a customer who planned against the first schedule can be shown what changed and when, the record Container Registry's revisions would have needed.
- **Close to new through the front door.** `closed_to_new_at` is enforced where quotas and holds are, at the [control plane's first step](/books/hosting-and-cloud/provider-architecture#provisioning-from-request-to-running-thing), as a `quotas` row of zero for the product's SKUs from that instant.
- **Notices go to resources.** `sunset_notices` can name a resource and records which schedule version it stated, so "we were never told" is answerable per resource, per channel and per milestone.
- **Extended support is a SKU, not a surprise.** `extended_support_sku_id` points at a priced SKU whose `price_versions` were announced in advance; opting a resource in is a subscription the customer chose.
- **Exports are operations.** Each export runs as a [control-plane operation](/books/hosting-and-cloud/provider-architecture#how-to-build-it) with a re-authentication step and an expiring result, and records whether egress was waived; the waiver itself and its conditions are [Egress & Switching](/books/hosting-and-cloud/egress-and-switching#how-to-build-it)'s `egress_waivers`.
- **Reversal is a state.** `reversed` with its date records a sunset withdrawn, as CodeCommit's and Docker's were, without deleting the history.
- **Events:** `sunset.announced`, `sunset.schedule_changed`, `sunset.state_changed`, `export.ready`, `export.expired` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to notifications, the console, the API's event stream and support.

## Auditing

- **Every schedule version as published,** with its date and reason, because customers and regulators compare what was promised with what happened.
- **Every notice per account and resource,** by channel and milestone, with the schedule version it stated.
- **Every export,** who requested it, the re-authentication, what was delivered where, and whether egress was charged.
- **What was deleted and when,** after `exports_until`, with records under hold excluded and listed ([Erasure vs Append-Only Records](/docs/architecture/data-retention#erasure-vs-append-only-records)).
- **Security settings carried in a transfer,** for a business sale: authentication, locks and contacts before and after, per account.

## What This Means for the System You Build

- **Publish every date at once,** and keep each version of the schedule when it changes.
- **Close to new customers through the control plane** on the day of the announcement.
- **Notify the resource, not just the account,** through the console, the API and email, on a repeating schedule.
- **Keep data retrievable after shutdown** for a stated window, and pay the egress when you end the product.
- **Leave a redirect or a named error** at every old endpoint, registry and repository URL.
- **Offer export per resource kind** in standard formats: images, dumps, objects, zone files, transfer codes, ports.
- **Make extended support opt-in and priced in advance,** with the version calendar published at release.
- **Carry over authentication, locks and contacts** before migrating customers in a sale.

The last migration in this volume runs the other way. Every sunset above moved a customer from one rented thing to another; the customer who has watched enough of them, or whose bill has grown steady enough, starts asking whether to rent at all. That decision, the cost model for owning, and the path back down the scaling ladder to owned metal are [Repatriation](/books/hosting-and-cloud/repatriation)'s, the chapter that closes the volume.

## References

**Sunsets and their notices**

- [Heroku: Heroku's next chapter](https://www.heroku.com/blog/next-chapter), the end of free plans and inactive-account deletion, dates and reason, August 25, 2022
- [Heroku: An update on Heroku](https://www.heroku.com/blog/an-update-on-heroku/), the sustaining engineering model, enterprise contracts for new customers, no end-of-life date, February 6, 2026
- [Chef: Chef Infra Server transitions to the Chef 360 platform](https://www.chef.io/blog/chef-infra-server-transitions-to-chef-360-platform), deprecation, the end of fixes and end of life, November 26, 2025
- [Chef: Upcoming deprecation and end-of-life updates for Progress Chef products](https://www.chef.io/blog/upcoming-deprecation-and-end-of-life-updates-for-progress-chef-products), Infra Server 15.x end of life on November 30, 2026, August 20, 2026
- [GitHub: hashicorp/terraform-cdk](https://github.com/hashicorp/terraform-cdk), the CDKTF sunset and archive, December 10, 2025, and `cdktf synth --hcl`
- [Google Cloud: Container Registry deprecation](https://docs.cloud.google.com/container-registry/docs/deprecations/container-registry-deprecation), deprecation and shutdown dates
- [Wayback Machine: Container Registry deprecation, March 2025](http://web.archive.org/web/20250304011230/https://cloud.google.com/container-registry/docs/deprecations/container-registry-deprecation), the read cutoff as published then
- [Travis CI: travis-ci.org shutdown](https://www.travis-ci.com/blog/2021-05-07-orgshutdown/), May 31, 2021 and read-only history
- [Jeff Geerling: Travis CI's new pricing plan threw a wrench in my open source works](https://www.jeffgeerling.com/blog/2020/travis-cis-new-pricing-plan-threw-wrench-my-open-source-works/), the scheduled read-only date
- [Upstash: Announcing Upstash Workflow and deprecating Upstash Kafka](https://upstash.com/blog/workflow-kafka), six months, closed to new users, migration credits, September 6, 2024
- [Fly.io community: Sunsetting LiteFS Cloud](https://community.fly.io/t/sunsetting-litefs-cloud/20829), availability until October 15, 2024
- [Deno: Migration guide](https://docs.deno.com/deploy/migration_guide/), Deploy Classic shut down July 20, 2026, KV data not migrated
- [Salt Project: Package repo migration and guidance](https://saltproject.io/blog/salt-project-package-repo-migration-and-guidance/), the move to Broadcom's repository and the dropped packages
- [PlanetScale: PlanetScale forever](https://planetscale.com/blog/planetscale-forever), the Hobby plan's retirement
- [Docker: We apologize, we did a terrible job announcing the end of Docker Free Teams](https://www.docker.com/blog/we-apologize-we-did-a-terrible-job-announcing-the-end-of-docker-free-teams/), March 16, 2023 and the March 24 reversal
- [Puppet: AWS OpsWorks end of life](https://www.puppet.com/blog/puppet-aws-opsworks), OpsWorks for Puppet Enterprise and OpsWorks Stacks end dates
- [AWS: OpsWorks for Chef Automate end of life FAQs (Wayback, August 2024)](https://web.archive.org/web/20240804192801/https://docs.aws.amazon.com/opsworks/latest/userguide/opscm-eol-faqs.html), end of life on May 5, 2024 for new and existing customers, no console or API management, backups stopped, licenses no longer valid, Chef SaaS or self-hosting as alternatives
- [Microsoft Learn: Azure Automation State Configuration overview](https://learn.microsoft.com/en-us/azure/automation/automation-dsc-overview), retirement on September 30, 2027 and Linux DSC retired September 30, 2023
- [AWS: CodeCommit user guide history](https://docs.aws.amazon.com/codecommit/latest/userguide/history.html), closure to new customers on July 25, 2024
- [AWS DevOps Blog: AWS CodeCommit returns to general availability](https://aws.amazon.com/blogs/devops/aws-codecommit-returns-to-general-availability), November 2025
- [Atlassian Community: Bamboo Cloud end of life](https://community.atlassian.com/t5/Questions/Bamboo-Cloud-end-of-life/qaq-p/450934), January 31, 2017
- [SD Times: AtlasCamp 2016 introduces Bitbucket Pipelines](https://sdtimes.com/atlascamp-2016-introduces-bitbucket-pipelines-jira-ios/), the May 2016 announcement

**Business transfer**

- [Squarespace: Alphabet selling Google Domains assets to Squarespace](https://www.squarespace.com/press-coverage/2023/6/15/alphabet-selling-google-domains-assets-to-squarespace), June 15, 2023
- [Squarespace: Form 10-Q for the third quarter of 2023](https://www.sec.gov/Archives/edgar/data/1496963/000149696323000073/sqsp-20230930.htm), closing on September 7, 2023 and $180.7 million total consideration
- [Krebs on Security: Researchers say weak security defaults enabled Squarespace domains hijacks](https://krebsonsecurity.com/2024/07/researchers-weak-security-defaults-enabled-squarespace-domains-hijacks/), July 2024 takeovers of migrated domains

**Leaving and export**

- [AWS: Close an AWS account](https://docs.aws.amazon.com/accounts/latest/reference/manage-acct-closing.html), the 90-day post-closure period, deletion and account ID reuse
- [AWS Health: Concepts](https://docs.aws.amazon.com/health/latest/ug/aws-health-concepts-and-terms.html), scheduled change events for end of support, affected entities
- [Google Cloud: GKE pricing](https://cloud.google.com/kubernetes-engine/pricing), the extended-support fee on top of cluster management
- [Tier.Net: 2026 cPanel, Plesk and WHMCS license cost increases](https://billing.tier.net/announcements/15/2026-cPanel-Plesk-and-WHMCS-license-cost-increases.html), the surcharge for servers on end-of-life operating systems from January 1, 2026
