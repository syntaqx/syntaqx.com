+++
title = "Artifacts & Registries"
description = "Docker Hub's pull limits and reversals, GHCR, ECR, the Container Registry shutdown, Artifactory, Nexus, npm and PyPI, and what storing artifacts costs."
category = "Hosting & Cloud Industry"
order = 2146
part = "CI/CD Platforms"
tags = ["registries", "containers", "artifacts", "rate-limits", "egress"]
+++

Once the image became the unit of deployment, the registry became part of production. Every deploy, every autoscaling event and every CI job pulls from one, so a registry's rate limit, outage or price change reaches systems that never signed a contract with it. And a registry is an unusual product to run: storage grows forever because nobody deletes old tags, reads are dominated by machines rather than people, most traffic is anonymous, and the operator pays egress on every pull while the puller pays nothing.

This chapter covers the registry business and how it works: Docker Hub's limits from 2020 to 2025 and the two retreats, the code hosts' and clouds' registries, Google's Container Registry shutdown, universal artifact repositories (Artifactory and Nexus), npm and PyPI as donated infrastructure, and the mechanics a provider needs (pull accounting, retention, pull-through caches, egress). It adds the `artifact_registries` side table and pull and storage meters to the [core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Building and trusting images is the playbook's [Containers](/docs/delivery/containers#building-images); admission policy is [Image Policy](/docs/operations/kubernetes#image-policy); signing and provenance are [Pipeline Supply-Chain Security](/books/hosting-and-cloud/pipeline-supply-chain-security); Docker and OCI origins are [From chroot to Containers](/books/hosting-and-cloud/containers); egress pricing in general is [Egress & Switching](/books/hosting-and-cloud/egress-and-switching).

## How the Providers Do It

Limits and prices as of October 2026:

| Registry | Who runs it | Limits and prices | What it shows |
| --- | --- | --- | --- |
| **Docker Hub** | Docker | Unauthenticated 100 pulls per 6 hours per IPv4 address or IPv6 /64; Personal 200 per 6 hours; Pro, Team and Business no cap (fair use); a separate abuse limit "in the order of thousands of requests per minute" returning a bare 429 | The public default; limits by account and by address |
| **GitHub Container Registry** | GitHub | `ghcr.io`; storage and bandwidth "currently free," with at least a month's notice before any change; private by default; `GITHUB_TOKEN` publishes from workflows | Free registry as a feature of the code host |
| **Amazon ECR** | AWS | Storage about $0.10 per GB-month; same-region transfer free; internet egress billed; free tier 500 MB private for 12 months and 50 GB public; ECR Public free to the internet up to 500 GB a month anonymously or 5 TB with an AWS account, and free to AWS compute in any region | The cloud prices pulls by where they go |
| **Google Artifact Registry** | Google | Successor to Container Registry, which Google shut down in 2025 | A registry migration forced on customers |
| **JFrog Artifactory** | JFrog | Universal repository for many package formats, self-hosted or cloud | The enterprise artifact business |
| **Sonatype Nexus Repository** | Sonatype | Community Edition limited to 40,000 total components or 100,000 requests a day | Free edition with a usage ceiling |
| **npm and PyPI** | GitHub (npm), the Python Software Foundation (PyPI) | Free to publish and pull; PyPI's bandwidth is donated by Fastly | Public package registries as shared infrastructure |

Four patterns run through the table. **A pull is a manifest request:** Docker counts pulls by manifest, not by layer, which is what makes per-pull limits enforceable and why layer caches don't reduce the count. **Limits key on account and address,** so CI fleets behind one NAT address share an anonymous quota. **Free registries are a feature of something else** (a code host, a cloud account, a foundation's donated CDN), and their terms say "currently." **Retention is the hidden cost:** storage only grows, and every vendor that tried to charge for it met resistance.

## Docker Hub's Limits: 2020 to 2025

Docker's August 24, 2020 announcement set the pattern. Docker said roughly 30% of all downloads on Hub came from only 1% of its anonymous users, defined a pull as a manifest request (layers not counted), and from November 1, 2020 limited free anonymous users to 100 pulls per six hours and free authenticated users to 200, with enforcement phased in over the following weeks from November 2. The Register reported the limits enforced on November 19, 2020, with Docker saying only 1.5% of users were affected. Because the limit keys on the address for anonymous pulls, CI fleets and clusters behind one NAT address share a single quota, which is what pushed authenticated pulls and pull-through caches into ordinary infrastructure.

On March 16, 2023 Docker apologized for how it had announced the end of its Free Team organizations, which affected "less than 2% of our users," and on March 24, 2023 it reversed the decision and offered refunds. On September 12, 2024 it announced pull and storage limits with consumption pricing, affecting "less than 3% of accounts," saying Hub stores over 60 petabytes, handles billions of pulls a month and had cost more than $100 million in investment; a November 5, 2024 update moved the start to March 1, 2025. On April 8, 2025 Docker said the April 1 changes would not be enforced: the 100 and 200 per six hours limits stayed, paid plans got unlimited pulls under fair use, pull consumption charges were cancelled entirely, storage charges were delayed indefinitely, and any future enforcement would come with six months' notice. (Docker reused the 2020 post's address for the 2024 post, so the 2020 text survives only in archives.)

The sequence shows what a public registry can and can't charge for. Rate limits on anonymous traffic held, because they target the free riders the operator can identify; charges on stored bytes and on paid customers' pulls didn't, because the customers' alternative was to move their images.

## The Code Host and Cloud Registries

The registries attached to something else priced themselves out of that fight. GitHub's Container Registry publishes from workflows with the job's `GITHUB_TOKEN`, defaults to private, and its billing documentation says container image storage and bandwidth are currently free, with at least one month's notice before any change. Amazon ECR charges for storage and for egress to the internet but not for transfer in the same region, and ECR Public gives anonymous pullers 500 GB a month to the internet (5 TB with an AWS account) and AWS compute in any region free pulls: the cloud makes the public registry free where it costs AWS least.

## The Container Registry Shutdown

Google deprecated Container Registry effective May 15, 2023. From May 15, 2024, Artifact Registry hosted `gcr.io` for projects that hadn't used Container Registry before; from March 18, 2025, Container Registry was shut down and writing images to it was unavailable; in the schedule published in March 2025, existing images became inaccessible after April 22, 2025, and `gcr.io` domains already hosted on Artifact Registry were unaffected. The reads ended in spring 2025. Every deployment, Helm chart and CI job that referenced a `gcr.io` image in an unmigrated project had to be updated on Google's timeline, which is the risk a registry name embedded in thousands of manifests carries. [Migrations, Shutdowns & End of Life](/books/hosting-and-cloud/migrations-and-end-of-life#the-lifecycle-of-a-sunset) covers the provider side of such a sunset.

## Universal Artifact Repositories

Enterprises store more than images: Maven and npm packages, Python wheels, Helm charts, binaries, and proxies of every public registry they depend on. JFrog's Artifactory is the largest business built on that need. For fiscal 2025 JFrog reported revenue of $531.8 million, up 24%; cloud revenue of $243.3 million, up 45%, and 48% of fourth-quarter revenue; 74 customers above $1 million of annual recurring revenue; and remaining performance obligations of $566 million, up 40% (press release, February 12, 2026). The shift to cloud matters for the hosting reader: the artifact repository is moving from a server the customer runs to a metered service.

Sonatype's Nexus Repository renamed its free edition Community Edition as of version 3.77.0 (February 4, 2025) and limited it to 40,000 total components or 100,000 requests a day; over the limit, users can't add new components until usage is back under both. A usage ceiling on a free self-hosted product is the registry version of a free tier.

## Public Registries as Shared Infrastructure

npm and PyPI are what every build pulls from, run by a company (GitHub operates npm) and a foundation. Their scale shows how much a public registry costs to serve. In May 2021 PyPI served nearly 900 terabytes over more than 2 billion requests a day, with bandwidth donated by Fastly that was estimated at $1.8 million a month; Fastly's undated case study cites 66 petabytes of traffic a month and a 99% cache-hit ratio. Without the donation, PyPI's operating model would be a bandwidth bill no foundation could pay, which is why public registries depend on CDN sponsorship and why their policies (token lifetimes, trusted publishing, provenance) are security infrastructure for everyone ([Pipeline Supply-Chain Security](/books/hosting-and-cloud/pipeline-supply-chain-security#registries-as-the-control-point)).

## How a Registry Works for the Operator

The OCI distribution model is a content-addressed store with a naming layer. Blobs (layers and configs) are stored once by digest and shared across repositories; manifests name the blobs that make an image; tags are mutable pointers to manifests; a pull is a manifest fetch followed by blob fetches for layers the client lacks. That shape decides the operator's meters and policies:

- **Pull accounting** counts manifest requests per principal and, for anonymous traffic, per IPv4 address or IPv6 /64, in a sliding window.
- **Storage** is the sum of unique blobs, not the sum of image sizes, so deduplication is the operator's margin; garbage collection removes blobs no manifest references, after untagged manifests are deleted by a retention policy.
- **Retention policies** delete untagged manifests after a period, keep the newest N tags per repository, and never delete digests pinned by a running deployment.
- **Egress** is billed by destination: same region, other regions, the internet. A pull-through cache in the customer's region turns repeated internet pulls into one.
- **Tags move, digests don't:** deployments should reference digests, which is also what lets a retention policy know what's in use.

## The Alternatives

| Option | Model | Strengths | Failure modes | Cost and ownership | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **Docker Hub** | Public default registry with plan limits | Every tool defaults to it; official images | Anonymous rate limits; policy changes | Docker; free tier plus paid plans | Public images, small teams |
| **Code host registry** (GHCR, GitLab) | Registry beside the code and CI | Same identity and permissions as CI | "Currently free" terms; tied to the host | Included in plans | Teams on that host |
| **Cloud registry** (ECR, Artifact Registry, Azure) | Registry in the deploy target's cloud | Same-region pulls free; IAM | Egress out of the cloud; migrations like GCR's | Storage and egress | Teams deploying in that cloud |
| **Universal repository** (Artifactory, Nexus) | One store for every package format plus proxies | Proxies public registries; governance | License cost or free-tier ceilings; one more system | Commercial or capped free edition | Enterprises |
| **Self-run OCI registry** (Distribution, Harbor) | Registry software on your own storage | Full control, no rate limits | Storage, GC and availability are yours | Open source plus infrastructure | Air-gapped and cost-sensitive estates |
| **Pull-through cache** | A local mirror of an upstream registry | Avoids rate limits and egress; survives upstream outages | Stale or poisoned cache if not verified | Storage in your region | CI fleets, clusters |

## My Default

My default is a private registry in the same cloud region as the clusters that pull from it, with images referenced by digest, a retention policy that keeps the last N tags plus anything a live deployment pins, and a pull-through cache for every public upstream (Docker Hub, the language registries) so CI and autoscaling never depend on an anonymous quota. I'd publish public images to more than one registry. As a provider running a registry, I'd meter storage on unique blobs and pulls on manifests, rate-limit anonymous traffic by address, and give paid customers predictable unlimited pulls; Docker's two retreats are the evidence that charging paying customers per pull and per stored byte after the fact doesn't hold.

What would change this: an air-gapped or regulated environment that needs a self-run registry with its own signing, or an estate with many package formats where a universal repository's governance earns its license.

## How to Build It

A registry is a resource of kind `registry` in [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Its side table is `artifact_registries`, because the Domains part's [ICANN, Registries & Registrars](/books/hosting-and-cloud/icann-registries-and-registrars) owns a `registries` table for domain registries. Pulls and storage are usage events; retention is a versioned policy.

```sql
CREATE TABLE artifact_registries (       -- side table: kind = 'registry'
  resource_id       UUID PRIMARY KEY REFERENCES resources (id),
  hostname          TEXT NOT NULL UNIQUE,      -- also a resource_identifiers 'hostname' row
  formats           TEXT[] NOT NULL,           -- 'oci', 'npm', 'pypi', 'maven', 'helm'
  visibility        TEXT NOT NULL CHECK (visibility IN ('private', 'public')),
  upstream_url      TEXT,                      -- set for a pull-through cache
  immutable_tags    BOOLEAN NOT NULL DEFAULT FALSE,
  anonymous_pull_limit INT,                    -- manifest requests per window; null: none
  anonymous_window  INTERVAL,                  -- e.g. 6 hours
  anonymous_key     TEXT CHECK (anonymous_key IN ('ipv4', 'ipv6_64')),
  CHECK ((anonymous_pull_limit IS NULL) = (anonymous_window IS NULL))
);

CREATE TABLE registry_retention_policies (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  registry_id        UUID NOT NULL REFERENCES resources (id),
  repository_pattern TEXT NOT NULL,             -- glob over repository names
  keep_last_tags     INT,
  delete_untagged_after INTERVAL,
  protect_deployed   BOOLEAN NOT NULL DEFAULT TRUE,  -- never delete a digest a live deployment pins
  valid_during       TSTZRANGE NOT NULL,
  set_by             TEXT NOT NULL
);

CREATE TABLE registry_deletions (        -- what retention or a person removed, and why
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  registry_id     UUID NOT NULL REFERENCES resources (id),
  repository      TEXT NOT NULL,
  digest          TEXT NOT NULL,
  tags            TEXT[] NOT NULL,
  policy_id       UUID REFERENCES registry_retention_policies (id),  -- null: manual
  deleted_by      TEXT NOT NULL,         -- typed actor
  deleted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Meters, each a `usage_events.meter` with SKUs per region: `registry.manifest_pulls` (dimensions: principal or anonymous key, repository), `registry.blob_egress_bytes` (dimensions: destination `same_region`, `cross_region`, `internet`), and `registry.stored_bytes` sampled daily on unique blobs and rated as GB-months. Anonymous rate limiting reads a sliding-window counter, not the usage table, but every 429 it returns is logged as an event so limits can be tuned from data.

The protection that keeps retention from breaking production is a join against live deployments:

```sql
-- Digests a retention run must not delete: anything a serving deployment pins.
SELECT DISTINCT d.artifact_digest
FROM deployments d
JOIN deployment_aliases a ON a.deployment_id = d.id
WHERE upper_inf(a.assigned_during)
  AND d.artifact_digest IS NOT NULL;
```

## Auditing

- **Every deletion,** with digest, tags, the policy version or person behind it, because "who deleted the image production was pinned to" is the first question after a failed rollback.
- **Pushes and tag moves,** with the principal and the digest before and after, since a moved tag is how a compromised publisher reaches consumers.
- **Rate-limit refusals by key,** so a customer behind a shared address can be shown why pulls failed.
- **Visibility changes,** because flipping a repository public is a data exposure.

## What This Means for the System You Build

- **Reference images by digest** and let tags be labels.
- **Run a pull-through cache** in-region for every public upstream.
- **Meter storage on unique blobs and pulls on manifests,** and bill egress by destination.
- **Rate-limit anonymous pulls by address,** and keep paid pulls predictable.
- **Retain by policy and protect what's deployed:** never delete a digest a live deployment pins.
- **Give long notice before charging for what was free,** and expect to retreat if you don't.
- **Plan registry migrations** as product sunsets, with dates customers can schedule against.

## References

**Announcements and policy**

- [Docker: Scaling Docker to serve millions more developers (August 24, 2020, archived)](http://web.archive.org/web/20200901163048/https://www.docker.com/blog/scaling-docker-to-serve-millions-more-developers-network-egress/), the 30% from 1% figure, the 100 and 200 limits, manifest requests as pulls
- [Docker: What you need to know about upcoming Docker Hub rate limiting (archived)](http://web.archive.org/web/20201101001754/https://www.docker.com/blog/what-you-need-to-know-about-upcoming-docker-hub-rate-limiting/), phased enforcement from November 2, 2020
- [The Register: Docker pull rate limits enforced](https://www.theregister.com/2020/11/19/docker_pull_rate_enforced/), November 19, 2020, 1.5% of users affected
- [Docker: We apologize, we did a terrible job announcing the end of Docker Free Teams](https://www.docker.com/blog/we-apologize-we-did-a-terrible-job-announcing-the-end-of-docker-free-teams/), March 16, 2023 and the March 24 reversal
- [Docker: Docker Hub plans and consumption pricing](https://www.docker.com/blog/scaling-docker-to-serve-millions-more-developers-network-egress/), September 12, 2024, 60 petabytes, billions of pulls, $100 million invested, the March 1, 2025 start
- [Docker: Revisiting Docker Hub policies](https://www.docker.com/blog/revisiting-docker-hub-policies-prioritizing-developer-experience/), April 8, 2025, limits kept, consumption charges cancelled, storage charges delayed, six months' notice
- [Google Cloud: Container Registry deprecation](https://docs.cloud.google.com/container-registry/docs/deprecations/container-registry-deprecation), deprecation, Artifact Registry hosting `gcr.io`, the March 18, 2025 shutdown
- [Google Cloud: Container Registry deprecation (March 2025, archived)](http://web.archive.org/web/20250304011230/https://cloud.google.com/container-registry/docs/deprecations/container-registry-deprecation), the read cutoff after April 22, 2025

**Documentation and pricing**

- [Open Container Initiative: About](https://opencontainers.org/about/overview/), the image, runtime and distribution specifications
- [Docker Docs: Docker Hub usage and limits](https://docs.docker.com/docker-hub/usage/), current limits by plan, the IPv6 /64 key and the abuse limit
- [GitHub Docs: Working with the Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry), `ghcr.io`, `GITHUB_TOKEN` and default visibility
- [GitHub Docs: GitHub Packages billing](https://docs.github.com/en/billing/concepts/product-billing/github-packages), container storage and bandwidth currently free, with notice before change
- [AWS: Amazon ECR pricing](https://aws.amazon.com/ecr/pricing/), storage, transfer, free tier and ECR Public allowances
- [Sonatype: Nexus Repository 3.77.0 release notes](https://help.sonatype.com/en/sonatype-nexus-repository-3-77-0-release-notes.html), Community Edition
- [Sonatype: Usage center](https://help.sonatype.com/en/usage-center.html), the component and request limits and what happens over them

**Filings and figures**

- [JFrog: Fourth quarter and fiscal 2025 results](https://jfrog.com/press-room/jfrog-announces-fourth-quarter-and-fiscal-2025-results/), February 12, 2026, revenue, cloud revenue, large customers and RPO
- [Simon Willison: PyPI bandwidth](https://simonwillison.net/2021/May/14/), May 2021, 900 TB over 2 billion requests a day and the $1.8 million a month estimate
- [Fastly: Python Software Foundation case study](https://www.fastly.com/customers/python-software-foundation), 66 petabytes a month and the cache-hit ratio (vendor figures)
