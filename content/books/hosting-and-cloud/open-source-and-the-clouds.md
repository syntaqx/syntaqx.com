+++
title = "Open Source & the Clouds"
description = "The license wars: SSPL, Elastic and OpenSearch, Redis and Valkey, HashiCorp and OpenTofu, NATS, each side's case, and foundations as the settlement."
category = "Hosting & Cloud Industry"
order = 2138
part = "Managed Services"
tags = ["open-source", "licensing", "valkey", "opensearch", "opentofu", "foundations"]
+++

Most managed services in this part are open-source software run by someone other than its authors. RDS runs PostgreSQL and MySQL, ElastiCache ran Redis, Amazon OpenSearch Service began as Elasticsearch, MSK runs Kafka, and every managed Kubernetes runs Kubernetes. That arrangement has a structural tension: the company that writes an engine has to earn money from it, usually by running it as a service, and the clouds can run the same engine as a service too, next to the customer's other infrastructure, on the same bill, often at a lower price. Between 2018 and 2025 a series of engine companies changed their licenses to stop the clouds from doing that without a deal, the clouds answered by forking the last open release into a neutral foundation, and several of the companies later added an open license back.

This is the market's version of a long-running fight about what "open source" means, and it matters to every provider in this volume in two directions. A provider that resells an engine as a service has to know what license each version ships under, and what it allows. A provider that writes an engine has to choose a license knowing what the clouds did with each one. This chapter walks the license spectrum, the chronology case by case (MongoDB, Elastic, Redis, HashiCorp and the smaller ones), each side's stated arguments, the foundations that became the settlement, the choices a vendor has, and extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with license fields on `products`. The detail of Terraform, OpenTofu and Vault belongs to the Infrastructure as Code part ([Provisioning: Terraform, OpenTofu & the Alternatives](/books/hosting-and-cloud/terraform-and-opentofu); [Testing, Policy, Secrets & IaC Platforms](/books/hosting-and-cloud/iac-testing-policy-and-secrets)); the provider-side contract disputes (Microsoft and CISPE, Broadcom and VMware) are the [Licensing Disputes](/books/hosting-and-cloud/licensing-disputes) chapter.

The engineering side of licenses (checking dependency licenses in CI, vetting what you add) is the playbook's [Dependencies & Upgrades](/docs/engineering/dependencies#adding-a-dependency).

## How the Providers Do It

How each engine company and the clouds settled, as of October 2026:

| Engine | License move | The clouds' response | Where it stands |
| --- | --- | --- | --- |
| **MongoDB** | AGPL to SSPL, 16 Oct 2018 | Compatible reimplementations (Amazon DocumentDB, Azure DocumentDB); Atlas runs on all three clouds | SSPL; Atlas is 73% of MongoDB's revenue |
| **Elasticsearch, Kibana** | Apache 2.0 to SSPL or Elastic License, 14 Jan 2021 | AWS forks 7.10 as OpenSearch; Linux Foundation hosts the OpenSearch Software Foundation from 16 Sep 2024 | Elastic added AGPL as an option, 29 Aug 2024 |
| **Redis** | BSD-3 to RSALv2 or SSPL, 20 Mar 2024 | Linux Foundation launches Valkey, 28 Mar 2024; AWS and Google ship Valkey at lower prices; Microsoft signs a licensing deal | Redis 8 added AGPLv3 as an option, 1 May 2025 |
| **HashiCorp (Terraform, Vault, Nomad, Packer)** | MPL 2.0 to BSL 1.1, 10 Aug 2023 | OpenTofu under the Linux Foundation, 20 Sep 2023 (CNCF Sandbox 2025); OpenBao forks Vault | BSL, with IBM as licensor since 27 Feb 2025 |
| **Confluent components (KSQL and others)** | Apache 2.0 to Confluent Community License, 14 Dec 2018 | (Apache Kafka unaffected) | Confluent part of IBM since 17 Mar 2026 |
| **Grafana, Loki, Tempo** | Apache 2.0 to AGPLv3, 20 Apr 2021 | | AGPL |
| **CockroachDB** | Core retired; single Enterprise license from 24.3, Nov 2024 | | Source available; free for businesses under $10 million in revenue |
| **NATS** | Proposed move to BUSL in 2025 | CNCF defends the project and its trademarks | Apache 2.0; trademarks at the Linux Foundation |
| **Redpanda** | BSL from the start, barring "Streaming or Queueing Service" resale | | BSL, converting to Apache 2.0 after four years per release |

Three patterns run through the table:

- **The license changes target the service, not the user.** Every new license lets a company run the engine for its own purposes; what it restricts is offering the engine to third parties as a service.
- **The forks go to foundations.** OpenSearch, Valkey and OpenTofu all landed at the Linux Foundation, with the clouds among the backers, so no single company owns the fork.
- **Several vendors came back to an open license** once the forks existed: Elastic and Redis to AGPL, each saying the original goal had been met.

## The License Spectrum

The licenses in this chapter, from most to least permissive for someone running the software as a service:

| Kind | Examples | Running it as a service for others | OSI-approved |
| --- | --- | --- | --- |
| **Permissive** | MIT, BSD-3, Apache 2.0 | Allowed, no obligation to share changes | Yes |
| **Weak copyleft** | MPL 2.0 | Allowed; a covered file distributed in executable form "must also be made available in Source Code Form" | Yes |
| **Network copyleft** | AGPLv3 | Allowed; a modified version "must prominently offer all users interacting with it remotely through a computer network" its source | Yes |
| **Service-source** | SSPL | Allowed only if the provider releases the "Service Source Code" for its whole stack | No |
| **Non-compete source-available** | RSALv2, Elastic License 2.0, Confluent Community License, BSL with an Additional Use Grant, FSL | Not allowed as a competing service | No |
| **Delayed open source** | BSL (converts after up to four years), FSL (two years) | Restricted until the change date, then open | The converted version is |

Two of the licenses define the edges of the fight:

- **The SSPL.** MongoDB's Server Side Public License applies to "all MongoDB Community Server patch releases and versions released on or after October 16, 2018." Its Section 13 says that offering the program "as a service" requires releasing the "Service Source Code," which includes "management software, user interfaces, application program interfaces, automation software, monitoring software, backup software, storage software and hosting software": in practice, a cloud's whole control plane. Internal use is not a service.
- **The BSL.** The Business Source License, which MariaDB's FAQ says was "created by David Axmark and Michael Widenius," first used for MaxScale 2.0 in 2016, makes source available, allows non-production use, lets the licensor set an Additional Use Grant, and converts to a named open-source Change License on the Change Date or four years after first release, whichever comes first. Sentry's **Functional Source License** (17 Nov 2023) is a fixed-term version: anything is permitted except a "Competing Use," and each release converts to Apache 2.0 or MIT after two years, in Sentry's words "you can do anything with FSL software except economically undermine its producer through harmful free-riding."

The Open Source Initiative's position is that none of the non-compete licenses is open source. On 19 Jan 2021 it wrote that "the SSPL is Not an Open Source License," that it fails the "any field of endeavor" criterion, and that its license steward withdrew it from review "when it became clear that the license would not be approved." OSI's March 2019 review summary records that Eliot Horowitz announced "MongoDB retracts the SSPL from the OSI approval process, citing a lack of community support."

## MongoDB and the SSPL

MongoDB's FAQ gives its reasoning plainly: it was "too easy for large cloud vendors to capture all the value but contribute nothing back," cloud vendors "test the boundaries of the AGPL," and "rather than litigating this issue in the courts, we are issuing a new license." Earlier versions stayed under the AGPL. The clouds didn't adopt the SSPL; they built MongoDB-compatible services that accept MongoDB drivers without running MongoDB's server ([Managed Document Databases](/books/hosting-and-cloud/managed-databases#managed-document-databases)). MongoDB's fiscal 2026 10-K treats the license as both a moat (it limits "the appeal to other parties" of monetizing MongoDB without a license) and a risk factor (it may harm adoption).

## Elasticsearch and OpenSearch

The longest fight, in steps:

- **11 Mar 2019:** AWS launched Open Distro for Elasticsearch, with Adrian Cockcroft writing that "since June 2018, we have witnessed significant intermingling of proprietary code into the code base," and that distributions should stay "open and free of proprietary code."
- **27 Sep 2019:** Elasticsearch, Inc. and elasticsearch B.V. sued Amazon.com and Amazon Web Services for trademark infringement and false advertising in the Northern District of California (No. 3:19-cv-06158), over Amazon Elasticsearch Service and Open Distro for Elasticsearch.
- **14 Jan 2021:** Elastic moved Elasticsearch and Kibana from Apache 2.0 to a dual SSPL and Elastic License from version 7.11, to stop cloud providers offering them as a service "without contributing back."
- **19 Jan 2021:** Shay Banon's "Amazon: NOT OK" called Amazon Elasticsearch Service (launched 2015) "a pretty obvious trademark violation," said Elastic had sued, and alleged that Open Distro contained code copied from Elastic's commercial features.
- **21 Jan 2021:** AWS said it would create and maintain an Apache 2.0 fork from 7.10, called Elastic's "free and open" claim misleading, cited more than 230 Lucene contributions in 2020, and pointed to Grafana (a fork of Kibana 3) as a healthy fork precedent.
- **3 Jun 2021:** Elastic introduced Elastic License 2.0 and moved more components to it.
- **8 Sep 2021:** Amazon Elasticsearch Service became Amazon OpenSearch Service, supporting the Apache-licensed Elasticsearch versions through 7.10 and OpenSearch 1.0.
- **16 Feb 2022:** Elastic and Amazon announced a "mutually-agreeable resolution" of the trademark suit, with Amazon removing "Elasticsearch" from its service and project names.
- **29 Aug 2024:** Elastic added AGPL as a third option, under the headline "Elasticsearch is Open Source, Again." It said it had changed in 2021 because of "issues with AWS and the market confusion their offering was causing," that "we are simply adding another option, and not removing anything," and that its partnership with AWS was "stronger than ever."
- **16 Sep 2024:** the Linux Foundation launched the OpenSearch Software Foundation, with AWS, SAP and Uber as premier members and Aiven, Canonical, DigitalOcean, Instaclustr and others as general members, citing "over 700 million downloads."

Trademark did as much work as copyright in this case: the settlement changed names, not code.

## Redis and Valkey

On 20 Mar 2024 Redis moved from BSD-3 to a dual RSALv2 and SSPLv1 license from version 7.4. Its explanation was about channels: "the majority of Redis' commercial sales are channeled through the largest cloud service providers, who commoditize Redis' investments," and cloud providers "will be able to deliver Redis 7.4 only after agreeing to licensing terms." Its FAQ conceded "Redis is no longer open source under the OSI definition," renamed "Redis OSS" to "Redis Community Edition," and barred product names using "Redis." Microsoft was quoted as a partner continuing its Redis service under agreement.

Eight days later, on 28 Mar 2024, the Linux Foundation announced Valkey, continuing from Redis 7.2.4 under BSD-3, backed by AWS, Google Cloud, Oracle, Ericsson and Snap. The clouds moved their caches to it with price cuts: ElastiCache for Valkey (8 Oct 2024) at 33% less for serverless, Memorystore for Valkey GA on 18 Apr 2025 ([Managed Caches](/books/hosting-and-cloud/managed-databases#managed-caches)).

On 1 May 2025 Redis 8 added AGPLv3 as an option. Rowan Trollope wrote that the SSPL move "achieved our goal: AWS and Google now maintain their own fork," but had "hurt our relationship with the Redis community"; Redis's creator, antirez, had rejoined the company in November 2024, and Redis Stack features moved into the core under the AGPL. The result in late 2026 is two engines with a shared ancestor: Redis (AGPL, RSAL or SSPL) from its company, and Valkey (BSD) from a foundation, sold at a discount by the clouds that backed it.

## HashiCorp and OpenTofu

On 10 Aug 2023 HashiCorp moved all future releases of its products from MPL 2.0 to BSL 1.1, keeping "HashiCorp APIs, SDKs, and almost all other libraries" under MPL, and saying competitors "will no longer be able to incorporate future releases, bug fixes, or security patches." The BSL files now name the licensor as "International Business Machines Corporation (IBM)," allow production use except offering to third parties "on a hosted or embedded basis" in competition with IBM's paid versions, and convert to MPL 2.0 four years after each release. Terraform from 1.6.0, Packer from 1.10.0 and Vault from 1.15.0 are BSL; Nomad's releases moved with the rest.

The community answer was fast. The OpenTofu manifesto called the BSL "a poison pill" and asked HashiCorp to return to an open license; when it didn't by 25 Aug 2023, the fork went ahead, and the Linux Foundation announced OpenTofu on 20 Sep 2023 with more than 140 organizations pledging support. It joined the CNCF as a Sandbox project on 23 Apr 2025 under an exception to the CNCF's IP policy that allowed its MPL license. OpenBao forked Vault from 1.14, the last MPL release, and shipped 2.0.0 on 25 Jul 2024. IBM completed its acquisition of HashiCorp on 27 Feb 2025 at $35 a share, an enterprise value of $6.4 billion. The details (the cease-and-desist over OpenTofu's `removed` block, state encryption, provider economics) are in the Infrastructure as Code part; the playbook's [Terraform and OpenTofu](/docs/delivery/infrastructure-as-code#terraform-and-opentofu) section covers using either.

## Confluent, Grafana, CockroachDB and Sentry

- **Confluent** (14 Dec 2018) moved some of its own components, KSQL among them, from Apache 2.0 to the Confluent Community License: anyone can download, modify, redistribute and embed them in their own SaaS, but not offer "KSQL-as-a-service." Apache Kafka itself was unaffected. Jay Kreps' argument was that "the cloud providers have significant advantages" in running software as a service, and that open source should not become their unpaid R&D.
- **Grafana Labs** (20 Apr 2021) moved Grafana, Loki and Tempo from Apache 2.0 to AGPLv3, deliberately choosing an OSI-approved license over a source-available one, while keeping plugins, agents and some libraries under Apache and switching its CLA to an Apache-style one.
- **Cockroach Labs** (15 Aug 2024) retired CockroachDB Core with version 24.3 in November 2024, leaving one Enterprise license for self-hosted use with a free tier for businesses "under $10M in annual revenues," individuals, students and researchers, renewed annually. Its FAQ adds a condition the announcement didn't: "Clusters will be throttled after 7 days without sending telemetry."
- **Sentry** (17 Nov 2023) wrote the FSL as a two-year, fixed-terms version of the BSL.

## NATS, Redpanda and RabbitMQ

The messaging engines show the remaining levers ([Managed Queues & Streaming](/books/hosting-and-cloud/managed-queues-and-streaming#nats)).

- **NATS** is the trademark case. In April 2025 the CNCF said Synadia had never completed the trademark transfer it promised when NATS joined in 2018, despite a $10,000 CNCF reimbursement, and had proposed taking the project out of the CNCF and relicensing the server under BUSL; the CNCF petitioned the USPTO to cancel the registrations. The 1 May 2025 settlement moved the two trademark registrations to the Linux Foundation, kept the domain and repositories with the CNCF and the code under Apache 2.0, and required any proprietary fork to take a new name.
- **Redpanda** never had an open license to change: its BSL's Additional Use Grant forbids a "Streaming or Queueing Service" in which third parties can create topics, naming cloud and hosting providers, and each release converts to Apache 2.0 after four years.
- **RabbitMQ** under Broadcom kept its MPL 2.0 license and changed support instead: since 1 Jun 2024, core-team support and patches for older releases go to commercial customers, with features such as standby replication reserved for the commercial edition.

The Kubernetes part has the same pattern in service meshes and GitOps: Buoyant stopped publishing open-source stable Linkerd releases from 2.15 in February 2024, covered in [Cluster Networking](/books/hosting-and-cloud/cluster-networking).

## Each Side's Case

In their own words:

- **The engine companies** (MongoDB, Elastic, Redis, Confluent, HashiCorp, Sentry): cloud providers capture the value of hosted open source without proportional contribution; a license is an alternative to litigation (MongoDB); clouds have structural advantages in running software as a service (Confluent); same-named services confuse users (Elastic); commercial sales are "channeled through the largest cloud service providers" (Redis).
- **AWS:** open source must stay free of proprietary code (2019); forks are legitimate when needs diverge, and AWS contributes upstream, citing Lucene (2021); it backs neutral foundations (Valkey, the OpenSearch Software Foundation).
- **The OSI:** source-available licenses are not open source, and "fauxpen" labels mislead (2021).

What each side did matches what it said. The engine companies kept their brands, their trademarks and their own hosted services (MongoDB's Atlas and Elastic Cloud among them), and several reopened once the forks existed. The clouds forked the last permissive release into a foundation, shipped it under a new name at a discount, and signed licensing deals where a fork wasn't worth it (Microsoft with Redis). Ownership changed in several cases after relicensing: HashiCorp and Confluent to IBM, and MariaDB, whose BSL started the category, to K1, whose offer at "$0.55 per MariaDB Share" expired on 23 Jul 2024, with the shares delisted on 26 Aug 2024.

## Foundations as the Settlement

| Foundation | What it holds from these fights | Why it settles them |
| --- | --- | --- |
| **Linux Foundation** | Valkey (Mar 2024), OpenTofu (Sep 2023, before moving to the CNCF), the OpenSearch Software Foundation (Sep 2024), the NATS trademarks (2025) | No single company can relicense or rename the project |
| **CNCF** (part of the Linux Foundation) | Kubernetes, Prometheus (its second project, 2016), OpenTelemetry (graduated 21 May 2026), NATS, OpenTofu (Sandbox, 2025) | Vendor-neutral governance and trademark custody |
| **OpenSSF** (announced 3 Aug 2020) | OpenBao, the Vault fork | Security and continuity for critical projects |
| **Apache Software Foundation** | Kafka (top-level 2012), Pulsar (top-level 2018) | Apache 2.0 projects held by the foundation, not by the companies that sell them as services |

A foundation settles the fight because it holds the two things a company used to change the terms: the copyright license (through contributor agreements or the inbound license) and the trademark. A project whose name and code belong to a foundation can't be relicensed by one of its contributors, which is why the clouds put their forks there and why the NATS dispute was about trademarks rather than code.

## Choosing a License

The options for a company that writes an engine and runs it as a service, with what the chronology shows about each:

| Choice | What it protects | What happened when it was tried | Cost |
| --- | --- | --- | --- |
| **Permissive (Apache, MIT, BSD)** | Adoption | Clouds resold it (Elasticsearch to 2021, Redis to 2024) | No license protection; the service and the brand must carry the business |
| **AGPLv3** | Modifications must be shared with a service's users | Grafana from 2021; Elastic and Redis returned to it in 2024 and 2025 | Copyleft obligations for anyone who modifies and serves it, which some users avoid |
| **SSPL** | A cloud must open its whole stack to resell | No cloud adopted it; compatible reimplementations instead (MongoDB) | Not open source; OSI rejected it |
| **Non-compete source-available** (RSAL, ELv2, Confluent CL) | No competing service | Forks to foundations within weeks (Valkey) | Not open source; distrust from contributors |
| **BSL or FSL** | No competing service until a change date | OpenTofu and OpenBao forks within weeks (HashiCorp) | Same as above, softened by the conversion date |
| **Open core with a commercial edition** | Paid features, not the engine | RabbitMQ under Broadcom; most vendors in practice | The open edition must stay good enough to adopt |
| **Trademark policy** | The name, whatever the license | Decisive for Elastic and NATS | Needs registration, enforcement, and a project that isn't in a foundation |

## My Default

As a provider reselling an engine as a service, my default is to sell only engines with an OSI-approved license and neutral governance (PostgreSQL, Valkey, OpenSearch, OpenTofu, Kafka, Kubernetes), and to record the license of every version I ship, because a source-available release I can't resell can arrive in a minor version and the managed product has to stop at the last open one. Where the customer wants the original engine under a non-compete license, the right answer is a licensing deal with its owner, priced as a pass-through.

As a company writing an engine, I'd pick the AGPL plus a registered trademark and a commercial edition. The chronology is unusually clear: the companies that chose non-compete licenses got forks within weeks, two of them came back to the AGPL within four years, and Grafana, which chose the AGPL first, never had to change course. The tradeoff that would change this is a market where the main competitor is a single cloud that will run the engine regardless; there, a licensing deal of the kind Microsoft signed with Redis is worth more than any license text.

## How to Build It

The chapter adds license fields to `products` and an effective-dated `product_licenses` table naming the upstream project, the license of each version range and its change terms, on top of [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Engine versions on resources come from [Managed Databases](/books/hosting-and-cloud/managed-databases#how-to-build-it) (`engine_versions`, `databases`, `caches`); a license fee paid to an engine's owner is a SKU with `pass_through = 'license'` in the core catalog.

```sql
ALTER TABLE products
  ADD COLUMN upstream_project    TEXT,     -- 'valkey', 'postgresql', 'opentofu'; null: the provider's own code
  ADD COLUMN upstream_relation   TEXT CHECK (upstream_relation IN ('runs_upstream',
                                   'runs_fork', 'compatible_reimplementation',
                                   'licensed_from_owner', 'own_engine')),
  ADD COLUMN upstream_steward    TEXT;     -- 'linux_foundation', 'cncf', 'asf', a company

CREATE TABLE product_licenses (          -- the license of each upstream version range, over time
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id          UUID NOT NULL REFERENCES products (id),
  versions            TEXT NOT NULL,     -- '>= 7.4', '< 1.6.0': the upstream's own version range
  spdx_id             TEXT NOT NULL,     -- 'BSD-3-Clause', 'AGPL-3.0-only', 'SSPL-1.0',
                                         -- 'BUSL-1.1', 'Elastic-2.0', 'LicenseRef-RSALv2'
  osi_approved        BOOLEAN NOT NULL,
  service_use         TEXT NOT NULL CHECK (service_use IN ('allowed', 'allowed_with_source',
                        'requires_agreement', 'prohibited')),  -- for offering it as a service
  change_date_rule    TEXT,              -- BSL/FSL: 'release + 4 years', 'release + 2 years'
  change_license      TEXT,              -- the SPDX id it converts to
  agreement_ref       TEXT,              -- the licensing deal, when service_use needs one
  source_url          TEXT NOT NULL,     -- the LICENSE file or announcement read
  valid_during        TSTZRANGE NOT NULL -- when this license applied to new releases
);
```

Before a new engine version becomes available to customers, a release gate checks that its license allows the product's use:

```sql
-- Engine versions offered as a service whose license doesn't allow it without an agreement.
SELECT p.code, v.engine, v.major_version, l.spdx_id, l.service_use
FROM engine_versions v
JOIN products p ON p.upstream_project = v.engine
JOIN product_licenses l ON l.product_id = p.id
WHERE l.valid_during @> v.announced_at     -- the license in force when the version shipped
  AND l.service_use IN ('requires_agreement', 'prohibited')
  AND (l.agreement_ref IS NULL OR l.service_use = 'prohibited');
```

Matching `versions` ranges is done in application code with the engine's own version semantics; the sketch compares by the time the version was announced, which is the common case (a license change applies to releases after a date).

Notes on the sketch:

- **License is per version range, not per product.** Redis 7.2.4 and Redis 7.4 are the same product under different licenses; Terraform 1.5 and 1.6 likewise. The table records the range, the license and when it applied.
- **Service use is the column that matters.** For a provider, the question isn't "is it open source" but "may I offer this version as a service," and the answer can be yes, yes with source, only with an agreement, or no.
- **The relation to upstream is explicit.** Running upstream, running a fork, reimplementing compatibly or licensing from the owner each carry different obligations and different marketing rules (Elastic's and Redis's trademark terms bar some names).
- **The source of the license fact is stored.** A licensing decision is audited against the LICENSE file or announcement read, with its URL.
- **Events:** `product_license.changed` and `engine_version.blocked_by_license` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to product management, legal and the release pipeline.

## Auditing

- **Which license every shipped version was under,** with its source, for as long as the version runs anywhere in the fleet.
- **Every licensing agreement and its scope,** linked to the pass-through SKUs that collect for it, because the owner will reconcile against usage.
- **Trademark use.** Product names and marketing pages for services based on third-party engines, checked against the owner's trademark policy, since that was where the Elastic case settled.
- **Contributions upstream,** if the provider makes the argument AWS made: the record of patches contributed is the evidence.

## What This Means for the System You Build

- **Record the license of every engine version you run,** with the source, and gate releases on it.
- **Ask "may I offer this as a service,"** not "is it open source," and store the answer per version.
- **Prefer engines whose name and code are held by a foundation;** they can't be relicensed under you.
- **Price licensing deals as pass-through** so the owner's share is visible and reconcilable.
- **If you write an engine, protect it with the AGPL, a trademark and a commercial edition** before reaching for a non-compete license.
- **Treat a license change upstream as a migration event** for every customer on the affected product.

## References

**Licenses and license texts**

- [OSI: GNU Affero General Public License v3](https://opensource.org/license/agpl-v3), section 13 on network use
- [OSI: Mozilla Public License 2.0](https://opensource.org/license/mpl-2-0), file-level copyleft and source for executables
- [MongoDB: SSPL FAQ](https://www.mongodb.com/legal/licensing/server-side-public-license/faq), the effective date, Section 13 and MongoDB's reasoning
- [MariaDB: BSL FAQ](https://mariadb.com/bsl-faq-mariadb/), terms, the change date and MaxScale 2.0
- [MariaDB: Adopting the BSL](https://mariadb.com/bsl-faq-adopting/), the license's authors
- [Sentry: Introducing the Functional Source License](https://blog.sentry.io/introducing-the-functional-source-license-freedom-without-free-riding/), the FSL terms and rationale
- [HashiCorp: Terraform LICENSE](https://github.com/hashicorp/terraform/blob/main/LICENSE), IBM as licensor, the Additional Use Grant and change terms
- [HashiCorp: Packer LICENSE](https://github.com/hashicorp/packer/blob/main/LICENSE), BSL from 1.10.0
- [HashiCorp: Vault LICENSE](https://github.com/hashicorp/vault/blob/main/LICENSE), BSL from 1.15.0
- [Redpanda: Business Source License](https://github.com/redpanda-data/redpanda/blob/dev/licenses/bsl.md), the service restriction and conversion
- [RabbitMQ: LICENSE](https://github.com/rabbitmq/rabbitmq-server/blob/main/LICENSE), MPL 2.0

**The chronology**

- [AWS: Keeping open source open, Open Distro for Elasticsearch](https://aws.amazon.com/blogs/opensource/keeping-open-source-open-open-distro-for-elasticsearch/), the 2019 launch and reasoning
- [Complaint, Elasticsearch, Inc. v. Amazon.com, Inc., N.D. Cal. No. 3:19-cv-06158, Dkt. 1](https://storage.courtlistener.com/recap/gov.uscourts.cand.348946/gov.uscourts.cand.348946.1.0_2.pdf), filed September 27, 2019 (RECAP copy): parties, trademark and false advertising claims
- [Elastic: Licensing change](https://www.elastic.co/blog/licensing-change), the 2021 move to SSPL and the Elastic License
- [Elastic: Amazon: NOT OK](https://www.elastic.co/blog/why-license-change-AWS), the trademark and copying allegations
- [AWS: Stepping up for a truly open source Elasticsearch](https://aws.amazon.com/blogs/opensource/stepping-up-for-a-truly-open-source-elasticsearch/), the fork and Lucene contributions
- [Elastic: Elastic License update](https://www.elastic.co/blog/elastic-license-update), Elastic License 2.0
- [AWS: Amazon OpenSearch Service](https://aws.amazon.com/blogs/aws/amazon-elasticsearch-service-is-now-amazon-opensearch-service-and-supports-opensearch-10/), the 2021 rename
- [Elastic: Elastic and Amazon reach agreement on trademark lawsuit](https://www.elastic.co/about/press/elastic-and-amazon-reach-agreement-on-trademark-infringement-lawsuit), the 2022 resolution
- [Elastic: Elasticsearch is open source, again](https://www.elastic.co/blog/elasticsearch-is-open-source-again), the 2024 AGPL option
- [Linux Foundation: OpenSearch Software Foundation](https://linuxfoundation.org/press/linux-foundation-announces-opensearch-software-foundation-to-foster-open-collaboration-in-search-and-analytics), members and downloads
- [Confluent: License changes for Confluent Platform](https://www.confluent.io/blog/license-changes-confluent-platform/), the Confluent Community License
- [Grafana Labs: Relicensing Grafana, Loki and Tempo to AGPLv3](https://grafana.com/blog/2021/04/20/grafana-loki-tempo-relicensing-to-agplv3/), the AGPL choice
- [HashiCorp: HashiCorp adopts the Business Source License](https://www.hashicorp.com/en/blog/hashicorp-adopts-business-source-license), the 2023 change
- [OpenTofu: Manifesto](https://opentofu.org/manifesto/), the request and the deadline
- [Linux Foundation: Announcing OpenTofu](https://www.linuxfoundation.org/press/announcing-opentofu), the 20 Sep 2023 launch
- [CNCF: OpenTofu](https://www.cncf.io/projects/opentofu/), Sandbox acceptance
- [CNCF Governing Board minutes, 12 Mar 2025](https://www.cncf.io/wp-content/uploads/2025/04/CNCF-Governing-Board-Meeting-Minutes-2025-03-12.pdf), the MPL exception
- [OpenBao: v2.0.0 release](https://github.com/openbao/openbao/releases/tag/v2.0.0), the Vault 1.14 lineage
- [IBM: IBM completes acquisition of HashiCorp](https://newsroom.ibm.com/2025-02-27-IBM-Completes-Acquisition-of-HashiCorp,-Creates-Comprehensive,-End-to-End-Hybrid-Cloud-Platform), price and date
- [Redis: Redis adopts dual source-available licensing](https://redis.io/blog/redis-adopts-dual-source-available-licensing/), the 2024 change and its reasoning
- [Linux Foundation: Valkey](https://www.linuxfoundation.org/press/linux-foundation-launches-open-source-valkey-community), the fork and its backers
- [Redis: AGPLv3](https://redis.io/blog/agplv3/), Redis 8 and Trollope's assessment
- [Cockroach Labs: Enterprise license announcement](https://www.cockroachlabs.com/blog/enterprise-license-announcement/), Core's retirement and the free tier
- [Cockroach Labs: Licensing FAQs](https://docs.cockroachlabs.com/docs/stable/licensing-faqs), the telemetry requirement
- [CNCF: Protecting NATS](https://www.cncf.io/blog/2025/04/24/protecting-nats-and-the-integrity-of-open-source-cncfs-commitment-to-the-community), the 2025 dispute
- [CNCF: CNCF and Synadia align on NATS](https://www.cncf.io/announcements/2025/05/01/cncf-and-synadia-align-on-securing-the-future-of-the-nats-io-project/), the settlement
- [RabbitMQ: New community support policy](https://www.rabbitmq.com/blog/2024/05/31/new-community-support-policy), support under Broadcom
- [Buoyant: Clarifications on the Linkerd 2.15 stable announcement](https://buoyant.io/blog/clarifications-on-linkerd-2-15-stable-announcement), stable releases behind Buoyant Enterprise

**The OSI and foundations**

- [OSI: The SSPL is not an open source license](https://opensource.org/blog/the-sspl-is-not-an-open-source-license), the 2021 position
- [OSI: License review, March 2019](https://opensource.org/blog/licensereview032019), MongoDB's retraction of the SSPL
- [Linux Foundation: OpenSSF](https://www.linuxfoundation.org/press/press-release/technology-and-enterprise-leaders-combine-efforts-to-improve-open-source-security), the 2020 founding
- [Prometheus: Overview](https://prometheus.io/docs/introduction/overview/), the CNCF's second project
- [CNCF: OpenTelemetry graduates](https://www.cncf.io/announcements/2026/05/21/cloud-native-computing-foundation-announces-opentelemetrys-graduation/), 21 May 2026

**Filings**

- [MongoDB: Form 10-K for fiscal 2026](https://www.sec.gov/Archives/edgar/data/1441816/000162828026016799/mdb-20260131.htm), Atlas's share and the SSPL as moat and risk
- [MariaDB: Form 8-K (offer completion)](https://www.sec.gov/Archives/edgar/data/1929589/000114036124034227/ef20033088_8k.htm), the K1 offer's close
- [MariaDB: Form 8-K (delisting)](https://www.sec.gov/Archives/edgar/data/1929589/000114036124037687/ef20034338_8k.htm), the Form 25 and compulsory acquisition
- [MariaDB: Schedule 14D-9/A](https://www.sec.gov/Archives/edgar/data/1929589/000114036124033971/ny20032279x2_sc14d9a.htm), the offer price
