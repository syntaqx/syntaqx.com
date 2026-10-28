+++
title = "Distributions & Alternatives"
description = "Certified Kubernetes, OpenShift, Rancher, k3s, Talos, Tanzu after Broadcom; Nomad, ECS, Cloud Run, Fly Machines, Swarm, Kamal; and when not to run Kubernetes."
category = "Hosting & Cloud Industry"
order = 2133
part = "Kubernetes"
tags = ["kubernetes", "distributions", "openshift", "nomad", "serverless-containers", "orchestration"]
+++

Kubernetes is a set of APIs and a reference implementation, not a product anyone can run as it ships. Between the upstream release and a working cluster sit an operating system, a container runtime, a network plugin, a storage driver, an ingress or gateway, a policy layer, an upgrade path and someone to call when it breaks. A distribution is a vendor's choice of all of those, tested together and supported for a period, and the managed services of [Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes) are distributions whose vendor also runs the control plane. Around them sit the orchestrators that chose not to be Kubernetes at all: Nomad, ECS, Swarm, and the serverless container platforms that hide the scheduler behind a deploy command.

For a provider this is a market map. A provider can sell managed Kubernetes, ship or certify a distribution for customers' own hardware, offer a simpler container product beside it, or build its own scheduler because placement is the product it sells. The hyperscalers do all of these at once; distribution vendors have been bought, relicensed, folded into larger companies or wound down; and each of those events is a support window or a license change that lands on the customer.

This chapter covers the conformance program that makes "Kubernetes" a checkable claim, the enterprise distributions (OpenShift, Rancher, Tanzu after Broadcom, Nutanix's purchase of D2iQ's platform), lightweight and immutable options (k3s, Talos, Bottlerocket), the platforms that ended, the orchestrators that aren't Kubernetes (Nomad, ECS, Swarm, Cloud Run, Azure Container Apps, Fly Machines, Kamal), and when not to run Kubernetes. Scheduler history before Kubernetes, from Borg to the orchestrator wars, is [Schedulers: Borg to Kubernetes](/books/hosting-and-cloud/schedulers); the operating rules are the playbook's [Kubernetes](/docs/operations/kubernetes) doc; the architecture under every distribution is [Kubernetes Architecture](/books/hosting-and-cloud/kubernetes-architecture).

## How the Providers Do It

| Vendor | Kubernetes offering | Orchestration without Kubernetes | Node operating system | Status, as of October 2026 |
| --- | --- | --- | --- | --- |
| **AWS** | EKS, with Auto Mode, Fargate and Hybrid Nodes ([Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes#how-the-providers-do-it)) | ECS: no extra charge on the EC2 launch type, Fargate per second, ECS Anywhere at $0.01025 per instance-hour, ECS Managed Instances with a per-instance fee | Bottlerocket (GA August 31, 2020); Auto Mode nodes run Bottlerocket variants | Both lines sold side by side |
| **Google Cloud** | GKE Standard and Autopilot; Anthos GA on GKE and GKE On-Prem in April 2019 for clusters outside Google Cloud | Cloud Run (beta April 9, 2019, GA November 14, 2019), with a Knative-compatible API but no longer Knative underneath | Not covered here | Both lines sold side by side |
| **Microsoft Azure** | AKS and AKS Automatic; Azure Arc projects clusters elsewhere into Azure Resource Manager | Azure Container Apps, scaling on "any KEDA-supported scale trigger," with Dapr APIs | Not covered here | Both lines sold side by side |
| **Red Hat** | OpenShift 4: operators upgrade every component "including Kubernetes and the RHEL CoreOS host" | None | RHEL CoreOS, "a fully immutable, container optimized, Linux OS host" | Maintained |
| **SUSE** | Rancher, a multi-cluster management platform, SUSE's since December 1, 2020 | None | k3OS archived (last push December 8, 2023) | Maintained |
| **Broadcom (VMware)** | vSphere Supervisor and vSphere Kubernetes Service (VKS, formerly TKG Service) in VMware Cloud Foundation | None | Not covered here | Standalone TKG ended at 2.5.4; Tanzu Platform SaaS end of availability May 1, 2025; Kubernetes 1.28 the last on VCF 4.x, end of service May 28, 2025 |
| **Nutanix** | D2iQ Kubernetes Platform (DKP), bought with its engineers on January 25, 2024 | DC/OS engineers came with it | Not covered here | DKP "will continue to be available as a standalone product" |
| **HashiCorp (IBM)** | None | Nomad, under the Business Source License for releases after August 10, 2023 | Any | IBM closed its acquisition on February 27, 2025 |
| **Mirantis** | Not covered here | Docker Swarm, supported "without an implied end date" since February 24, 2020 | Any | Maintained |
| **Sidero Labs** | Talos Linux (MPL-2.0) and Omni fleet management (BSL 1.1, SaaS or self-hosted) | Omni can run containers on single-node edge Talos without a cluster | Talos Linux | Maintained |
| **Fly.io** | None | Fly Machines (May 24, 2022) on its own scheduler, `flyd`, which replaced Nomad (February 1, 2023) | Firecracker microVMs | Maintained |

Three patterns run through the table:

- **Every hyperscaler sells a container product that isn't Kubernetes,** next to its Kubernetes product: ECS, Cloud Run, Container Apps. The market's own answer to "when not to run Kubernetes" is a product line.
- **The independent distribution vendors consolidated.** Rancher went to SUSE, VMware's Tanzu to Broadcom, D2iQ's platform to Nutanix, HashiCorp to IBM; the products continue under new owners with new lifecycles.
- **The node operating system became part of the distribution.** RHEL CoreOS, Bottlerocket and Talos are immutable images upgraded as a unit with Kubernetes, rather than a general-purpose OS someone patches.

## Certified Kubernetes

The CNCF launched Certified Kubernetes on November 13, 2017 with 32 conformant distributions and platforms; as of October 2026 its page lists "over 90" certified offerings. A vendor runs the conformance tests with Sonobuoy, opens a pull request with the results to the `cncf/k8s-conformance` repository, and is certified once a reviewer approves it. To stay certified, a vendor must provide "the latest version of Kubernetes yearly or more frequently."

Conformance is what lets the word mean something across vendors: the same APIs answer the same way, so manifests, Helm charts and operators move between a managed service, an enterprise distribution and a laptop. It doesn't certify anything the conformance suite doesn't test: the CNI, the CSI driver, the ingress controller, the upgrade tooling, the support window, or the add-ons each vendor bundles. Two conformant products can still differ in everything that breaks in production, which is why [Cluster Networking](/books/hosting-and-cloud/cluster-networking), [Storage & Stateful Workloads](/books/hosting-and-cloud/kubernetes-storage) and the provider tables in every chapter of this part compare the parts around the API.

## How the Distributions Got Here

| Step | When | What it solved | What it cost |
| --- | --- | --- | --- |
| OpenShift 3 rebased on Kubernetes | About 2015 ("four years ago" in Red Hat's May 8, 2019 post) | A PaaS on the API the industry was converging on | Everything built on OpenShift 2 had to move |
| Docker swarm mode | Announced June 20, 2016 with Docker 1.12 | Orchestration built into the Docker engine | A second API to Kubernetes for the same users |
| Certified Kubernetes | November 13, 2017, 32 products | A checkable definition of "Kubernetes" | Conformance covers the API only |
| Docker adds Kubernetes | October 17, 2017, Docker EE and Docker for Mac support Kubernetes beside Swarm | One toolchain for both | Swarm was no longer Docker's only orchestrator |
| k3s | v0.1.0, February 26, 2019; CNCF Sandbox August 19, 2020 | Kubernetes in one binary under 100 MB, sqlite by default | Bundled choices (Flannel, Traefik) to swap out for production |
| OpenShift 4 | May 8, 2019 | Operators upgrade the platform and RHEL CoreOS hosts as one system | An immutable host the customer doesn't administer |
| Bottlerocket GA | August 31, 2020 | A container-only OS with image-based updates | No package manager or shell on the host |
| SUSE buys Rancher Labs | Closed December 1, 2020, reported at $600 to 700 million, terms undisclosed | Rancher gets an enterprise Linux owner | A new owner's roadmap |
| Nutanix buys DKP | January 25, 2024 | DKP continues as a standalone product | D2iQ, formerly Mesosphere, wound down its own platform business |
| Broadcom's Tanzu changes | TKG 2.5.4 final; Tanzu Platform SaaS ended May 1, 2025; VCF 4.x stopped at Kubernetes 1.28, end of service May 28, 2025 | Kubernetes consolidated into VCF as VKS | Standalone and SaaS customers had to migrate |
| Apache Mesos terminated | August 20, 2025, by the ASF board, "due to inactivity" | The project's software goes to the Attic | Anything still built on Mesos loses its upstream |

## Enterprise Distributions

**OpenShift** is the longest-lived. Red Hat's OpenShift 4 announcement, May 8, 2019, called it "first major release since we completely rebased OpenShift 3 on Kubernetes four years ago." Its two ideas became the template for the others: operators "drive upgrades of any components ... including Kubernetes and the RHEL CoreOS host," and the host is RHEL CoreOS, "a fully immutable, container optimized, Linux OS host." The cluster upgrades itself as one versioned system rather than as a Kubernetes binary on top of an OS someone else patches.

**Rancher** is a management plane for many clusters rather than one distribution: in SiliconANGLE's description, a platform that "makes it easier for companies to set up and manage large Kubernetes environments," used by more than 30,000 engineering teams and earning money through professional services and support. SUSE announced the acquisition in July 2020 and completed it on December 1, 2020, reportedly for $600 million to $700 million; Rancher's former CEO, Sheng Liang, became SUSE's president of engineering and innovation.

**Tanzu after Broadcom** is the case of a distribution restructured by its owner. Broadcom's documentation states that "Tanzu Kubernetes Grid v2.5.4 is the final enterprise release of TKG," with migration to vSphere Supervisor and VKS (formerly TKG Service); Tanzu Platform SaaS reached end of availability on May 1, 2025, after which it could "no longer be available for purchase or use"; and "the last supported version of Kubernetes on VCF 4.x (vCenter 7.x) will be version 1.28," with end of service on May 28, 2025. For customers, the Kubernetes version they could run became a function of the VMware Cloud Foundation version they had bought.

**D2iQ**, formerly Mesosphere, sold its Kubernetes platform: Nutanix announced on January 25, 2024 that it had acquired DKP, "a leading Kubernetes management platform," and the engineers behind DKP and DC/OS, and that DKP "will continue to be available as a standalone product." D2iQ wound down rather than continuing as a distribution vendor. Its origin project ended the next year: the Apache Software Foundation board resolved on August 20, 2025 that "the Apache Mesos project is hereby terminated," following the project's vote to move to the Attic.

## Lightweight and Immutable

**k3s** is Kubernetes cut down for small machines: "half the memory, all in a binary less than 100 MB," a distribution rather than a fork. It removes the in-tree storage drivers and cloud provider (CSI and an external cloud controller manager replace them), uses sqlite3 by default through the Kine shim with etcd, MariaDB, MySQL and Postgres as options, and bundles containerd, Flannel and Traefik, all of which "can be disabled or swapped out." v0.1.0 shipped on February 26, 2019; the CNCF accepted it to the Sandbox on August 19, 2020; it is Apache-2.0. Its companion operating system, k3OS, is archived. For a provider, k3s is the distribution of the edge box, the homelab node and the CI runner: anywhere a full control plane costs more than the workload.

**Immutable node operating systems** take the OS out of the customer's hands:

- **Talos Linux** (Sidero Labs, MPL-2.0): "No SSH, no shell, no package manager"; all management through a gRPC API with mutual TLS; fewer than 50 OS binaries in about 100 MB; the machine's state in one YAML document; the OS and Kubernetes upgraded together as one atomic, rollback-safe image. **Omni**, Sidero's fleet manager for provisioning, upgrades and backups across clusters, is source-available under the Business Source License 1.1, free for non-production installs, with production use through Sidero's sales.
- **Bottlerocket** (AWS, Apache-2.0 and MIT), GA August 31, 2020 as "a new open source Linux-based Operating System (OS) purpose-built to run containers": updates download a whole filesystem image to the inactive of two partition sets and reboot into it, rolling back on a failed boot; there is "no SSH server ... and not even a shell," only an optional control container (on by default, for AWS SSM) and an admin container (off by default); settings change through an API. Variants exist for EKS, ECS and VMware; EKS Auto Mode's nodes are Bottlerocket.
- **RHEL CoreOS**, OpenShift's host, described above.

The common move is from patching machines to replacing images, the playbook's [rebuild, don't repair](/docs/delivery/containers#rebuild-don-t-repair) applied to the node. The cost is debugging: with no shell, every investigation goes through an API, a privileged container or a replaced node.

## The Orchestrators That Aren't Kubernetes

**Amazon ECS** predates Kubernetes 1.0. Jeff Barr announced "a preview of our new container management service, EC2 Container Service" on November 13, 2014; it became generally available in four regions on April 9, 2015; AWS Fargate removed the instances on November 29, 2017; ECS Anywhere was pre-announced at re:Invent on December 1, 2020 for customers' own servers. As of October 2026, ECS on the EC2 launch type has "no additional charge for Amazon EC2 compute," ECS Anywhere costs $0.01025 per registered instance-hour, and ECS Managed Instances adds a per-instance management fee like EKS Auto Mode's. ECS is one provider's API with no portability, and in return there is no control plane to upgrade, no version skew and no extended-support fee.

**Nomad** was HashiCorp's general scheduler, announced by Armon Dadgar on September 28, 2015: one binary that "requires no external services for coordination or storage" (its own Raft and BoltDB), datacenters grouped into regions that federate over Serf gossip, and task drivers for Docker, QEMU virtual machines, Java jars and plain executables. HashiCorp moved its products' future releases from MPL 2.0 to the [Business Source License 1.1](/books/hosting-and-cloud/open-source-and-the-clouds#hashicorp-and-opentofu) on August 10, 2023, allowing use "except where providing a competitive offering to HashiCorp," with APIs and SDKs staying MPL. Nomad's last MPL release is v1.6.5 (December 14, 2023); v1.6.6 and everything after are BSL. IBM completed its acquisition of HashiCorp on February 27, 2025, at an enterprise value of $6.4 billion, $35 a share, with no relicensing announced as of October 2026. For a provider, the BSL is the deciding fact: Nomad can schedule a provider's own infrastructure, but a hosted Nomad product competes with HashiCorp's.

**Docker Swarm** shipped as swarm mode in Docker 1.12, announced June 20, 2016. Docker added Kubernetes beside it on October 17, 2017. Mirantis bought Docker Enterprise in November 2019, first committed to at least two years of Swarm, and on February 24, 2020 extended that "without an implied end date," adding Swarm Jobs for run-to-completion work. Swarm remains the smallest step from `docker compose` to several machines.

**Cloud Run** is Google's serverless container service: beta announced April 9, 2019, GA November 14, 2019, built on Knative, which Google had started more than a year earlier with IBM, Pivotal, Red Hat, SAP and TriggerMesh. The fully managed service "does not use Knative but offers portability with the Knative API"; the Kubernetes-hosted variant became Knative serving. At GA it billed "to the nearest 100 milliseconds" of resources used. **Azure Container Apps** is Microsoft's equivalent, scaling on HTTP traffic, events, CPU, memory and KEDA's scalers, with most apps able to scale to zero (those scaling on CPU or memory can't).

**Fly Machines** are the clearest case of a provider building below Kubernetes. Launched May 24, 2022, they are "VMs with a fast REST API that can boot instances in about 300ms," Firecracker microVMs built from Docker images and placed on specific hardware; "one level lower" than the Nomad that ran Fly's deploys. Stopped Machines pay only for image storage (about $0.15 a month for a 1 GB image at launch). On February 1, 2023, Fly described replacing Nomad's scheduler with its own, `flyd`, for reasons that are a provider's, not a customer's: Nomad wanted federated clusters where Fly wanted one global one (and Fly had concerns about its pricing at that shape); Nomad's asynchronous scheduling can take seconds to days, "no way to handle an HTTP request" that must start a VM from zero on a particular server; its default bin packing onto as few servers as possible overloaded a few hosts in a fleet whose business is keeping headroom in every region; and it ignored which hosts had an image cached. `flyd` keeps each worker's state in a local append-only log with no consensus, treats placement as bids matched by a broker, and fails fast when a region has no capacity.

**Kamal** is a deploy tool, not a scheduler: 37signals introduced it as MRSK on February 28, 2023 ("Deploy web apps anywhere," MIT-licensed, with kamal-proxy switching traffic between containers). DHH's announcement contrasted it with "our sophisticated, Kubernetes backed deployment pipeline for HEY," which "often takes minutes to deploy a new version," against "as little as 20 seconds" with Kamal, and said it made the setup "vendor independent in a way we never managed to truly achieve with Kubernetes." It belongs to 37signals' move to its own hardware, which [From Bare Metal to Cloud](/books/hosting-and-cloud/bare-metal-to-cloud) and [Repatriation](/books/hosting-and-cloud/repatriation#37signals-leaves-2022-to-2026) place in the industry's history.

## The Alternatives

| Choice | Model | Strengths | Failure modes | Licensing and ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Managed Kubernetes** (EKS, GKE, AKS, DOKS, LKE, OKE) | Provider-run control plane, customer or provider nodes | Conformant API, ecosystem, the provider runs etcd and upgrades | Forced upgrades and extended-support fees; the add-ons are still the customer's | Provider | Control-plane fee plus nodes ([Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes)) | The default for teams on a cloud |
| **OpenShift** | Distribution with operator-driven upgrades and an immutable host | One supported stack across data centers and clouds | Opinionated; Red Hat's choices for every layer | Red Hat | Commercial subscription | Enterprises standardizing on-premises and cloud |
| **Rancher** | Management plane over many clusters | Many clusters and distributions in one place | Another control plane to run and upgrade | SUSE since December 2020 | Support and services | Organizations with many clusters |
| **VKS on VCF** | Kubernetes inside VMware Cloud Foundation | Fits existing vSphere estates | Kubernetes versions tied to VCF versions; standalone and SaaS paths ended | Broadcom | Part of VCF | VMware customers |
| **k3s** | Single-binary distribution | Small footprint; sqlite default; quick to install | Bundled defaults to replace; datastore choice matters at scale | Apache-2.0; CNCF Sandbox | Free | Edge, homelab, CI, small clusters |
| **Talos and Omni** | Immutable API-managed OS, optional fleet manager | No shell to attack; atomic OS and Kubernetes upgrades | Debugging only through the API; Omni is source-available | Talos MPL-2.0; Omni BSL 1.1; Sidero Labs | Talos free; Omni commercial for production | Bare metal and edge clusters |
| **Nomad** | One binary, regions and federation, many task drivers | Simple to run; VMs, jars and binaries beside containers | Smaller ecosystem; BSL blocks hosted competitors | BSL 1.1 since v1.6.6; IBM | Free within the BSL terms | Mixed workloads; HashiCorp shops |
| **Amazon ECS** | AWS-native scheduler, EC2 or Fargate | No control plane to upgrade; deep AWS integration | AWS only; no portable API | AWS | No charge on EC2; Fargate per second; ECS Anywhere $0.01025 per instance-hour | AWS-only teams |
| **Cloud Run** | Serverless containers, Knative-compatible API | Deploy a container, get a URL; fine-grained billing | Google only; no cluster-level control | Google | Per use | Stateless services and jobs on Google Cloud |
| **Azure Container Apps** | Serverless containers with KEDA scaling and Dapr | Event scaling and scale to zero without a cluster | Azure only; no cluster access | Microsoft | Per use | Microservices and jobs on Azure |
| **Fly Machines** | MicroVM API on Fly's own scheduler | Sub-second boots, placement per region, stopped machines pay storage only | One provider; the customer owns orchestration policy | Fly.io | Per Machine | Apps that start on demand near users |
| **Docker Swarm** | Orchestration in the Docker engine | Smallest step from Compose | Small ecosystem; one vendor's commitment | Mirantis supports it | Free; Mirantis support | Small fleets already on Docker |
| **Kamal** | Deploy tool: Docker on servers over SSH, a proxy for cutover | No orchestrator; seconds to deploy; any host | No rescheduling, autoscaling or self-healing | MIT; 37signals | Free; the servers | Small fleets of known servers |

## When Not to Run Kubernetes

The playbook's [When Not to Run It](/docs/operations/kubernetes#when-not-to-run-it) gives the rule: Kubernetes earns its cost with many services, long-running workloads, specific hardware or network needs, or a platform team running it as a product, and a handful of stateless web services is better served by a managed container platform or functions. The reason is ownership, and buying the control plane doesn't remove it: even on EKS, GKE or AKS the customer still owns the upgrade treadmill, node pools and their OS, the add-ons, secrets, policy, backup and observability, item by item in [What You Still Own on a Managed Cluster](/books/hosting-and-cloud/managed-kubernetes#what-you-still-own-on-a-managed-cluster). The over-reach I'd warn against is adopting Kubernetes before anyone owns that list. If the people a real cluster needs aren't going to be hired, the managed container services (ECS on Fargate, Cloud Run, Azure Container Apps, Fly Machines) and the platforms in [PaaS & Frontend Clouds](/books/hosting-and-cloud/paas-and-frontend-clouds) are the better buy, because they take the versions, the nodes and the telemetry baseline off the customer's hands. The industry evidence adds four things a provider should know.

**Kubernetes is the default, so the question is who runs it.** The CNCF's survey released January 20, 2026 found 82% of container users running Kubernetes in production, up from 66% in 2023; its 2024 survey (750 respondents, published April 1, 2025) put production use at 80%, and production plus piloting or evaluating at 93%. The top challenge in the 2026 release was "Cultural changes with the development team" (47%), ahead of training and security (36% each) and complexity (34%). The barrier is people, which is what a managed service or a serverless container product sells.

**The providers hedge with their own products.** AWS, Google and Microsoft each sell a container service that isn't Kubernetes beside one that is, and each prices it so the customer never sees a control plane, a version or a node. A provider choosing what to offer customers who don't want a cluster can copy that pattern: the cluster for teams with a platform group, a deploy-a-container product for everyone else.

**Some workloads don't fit, and the write-ups say why.** Gitpod ran developer environments on Kubernetes for six years for about 1.5 million users and left in October 2024: shared CPU and memory produced noisy neighbors developers felt as lag, persistent volumes attached and detached unpredictably, workspace images over 10 GB defeated caching, per-environment Services were unreliable at scale, and developers' need for root-like access fought the security model through user-namespace workarounds and microVM experiments. Its replacement, Gitpod Flex, is "heavily inspired by Kubernetes," and its conclusion was narrow: Kubernetes remains sound for application workloads, not for system workloads like development environments. Fly's move off Nomad has the same shape for a provider: a general scheduler's packing and asynchrony were wrong for a product whose value is placement.

**Deploy speed and independence are reasons on their own.** 37signals' minutes-versus-seconds comparison for HEY, and the vendor independence it said Kubernetes never gave it, are the case for a deploy tool on known servers when a fleet is small and stable.

For a provider the signals to steer a customer away from a cluster are the ones above: few services, no platform team, stateful or interactive workloads that fight the scheduler, or a fleet small enough to name. The ones that make a cluster right are many services, varied hardware, multi-tenancy the customer will operate, and portability across providers that conformance actually delivers.

## My Default

I like Kubernetes and use it gladly, but it isn't the end state and it isn't free to own. For customers on a cloud, my default is the provider's managed container service (ECS on Fargate, Cloud Run, Container Apps), Fly Machines or a PaaS first, and that provider's managed Kubernetes only when there is a platform team to own the cluster (or a plan to staff one) and a need the container service can't meet: portability across providers, extension through CRDs and operators, or enough services that bin packing them pays. The container service removes the control plane, the upgrades and the add-ons, and with them the training and skills the survey's top challenges are about. What would change it is the arrival of those needs, or a workload that has outgrown the container service's limits; the move is then a step up the path, not a failure of the first choice. On owned hardware or at the edge, I'd pick a distribution by who will operate it: Talos for teams that want an immutable, API-driven OS and can live without a shell, k3s for small and edge clusters, OpenShift where an enterprise wants one supported stack across its data centers and clouds. For a few servers that rarely change, Kamal or Swarm is less machinery than any cluster.

For a provider, my default is to sell both a managed Kubernetes and a container product that hides it, and to keep the conformance certificate current, because the certificate is what lets customers bring manifests in and take them out. I'd avoid building a hosted product on source-available software whose license bars competitive offerings (Nomad, Omni) and check every distribution's lifecycle notices as closely as upstream's, since Broadcom's and Nutanix's changes reached customers as end-of-support dates. The tradeoff that would change this is placement as the product: a provider whose business is where and how fast a workload starts, as Fly's is, should expect a general scheduler to be wrong for it and plan to own one.

## How to Build It

The chapter adds no tables, as the [core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) planned. Each alternative maps onto kinds that already exist:

- **A managed or distribution cluster** is a resource of kind `cluster` with [Kubernetes Architecture](/books/hosting-and-cloud/kubernetes-architecture)'s `clusters` side table, and its nodes are `node_pool` and `virtual_machine` resources from [Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes). A cluster's distribution and version are attributes of that side table; a customer cluster running on the customer's own hardware but managed by the provider (ECS Anywhere, Hybrid Nodes, Omni-style fleets) is a `cluster` whose region's `underlay` is the customer site, as [Hybrid & On-Prem Cloud](/books/hosting-and-cloud/hybrid-and-on-prem-cloud) describes.
- **A serverless container service** (a Cloud Run service, an ECS service on Fargate, a container app) is a resource of kind `container_service`, the side table [From chroot to Containers](/books/hosting-and-cloud/containers) defines, metered by vCPU-seconds, memory-seconds and requests in `usage_events`.
- **A microVM** (a Fly Machine) is a `virtual_machine` whose isolation level [Sandboxes & MicroVMs](/books/hosting-and-cloud/sandboxes-and-microvms) adds, with stopped Machines billing their image storage as a `volume`.
- **A license-restricted component** (a BSL scheduler or fleet manager) is a fact about the product, recorded where [Open Source & the Clouds](/books/hosting-and-cloud/open-source-and-the-clouds) puts license fields on `products`.

The point of the mapping is that a provider doesn't need a billing model per orchestrator: clusters, container services and machines are all resources with usage, and the orchestrator is a detail of the side table.

## What This Means for the System You Build

- **Keep the conformance certificate current** and say which add-ons it doesn't cover, since conformance is only the API.
- **Sell a product that hides the cluster** beside the one that exposes it, as every hyperscaler does.
- **Treat a distribution's lifecycle notices as upstream events,** with the same tracking as Kubernetes minors.
- **Read the license before building on a scheduler or fleet manager,** because BSL terms bar competitive hosted offerings.
- **Prefer immutable node images,** upgraded with Kubernetes as a unit, over patched general-purpose hosts.
- **Steer customers by workload, not fashion:** few services or no platform team means a container product; interactive, stateful or root-needing workloads may not fit at all.
- **Own the scheduler only when placement is the product,** and expect to write the policy a general scheduler would have given you.
- **Model every orchestrator as resources with usage,** so the bill doesn't depend on which one ran the workload.

## References

**Specifications and programs**

- [CNCF: Certified Kubernetes software conformance](https://www.cncf.io/training/certification/software-conformance/), over 90 certified offerings, Sonobuoy, the conformance repository, yearly recertification
- [Linux Foundation: CNCF launches Certified Kubernetes program with 32 conformant distributions and platforms](https://www.linuxfoundation.org/press-release/cloud-native-computing-foundation-launches-certified-kubernetes-program-32-conformant-distributions-platforms), November 13, 2017

**Distributions and operating systems**

- [Red Hat: Introducing Red Hat OpenShift 4](https://www.redhat.com/en/blog/introducing-red-hat-openshift-4), May 8, 2019, the rebase of OpenShift 3, operator-driven upgrades, RHEL CoreOS
- [SiliconANGLE: SUSE completes acquisition of Rancher Labs](https://siliconangle.com/2020/12/01/suse-completes-acquisition-rancher-labs/), December 1, 2020, the reported price, undisclosed terms, Sheng Liang, Rancher's description
- [k3s repository](https://github.com/k3s-io/k3s), the binary size, removed in-tree components, sqlite and Kine, bundled components, Apache-2.0
- [k3s v0.1.0 release](https://github.com/k3s-io/k3s/releases/tag/v0.1.0), February 26, 2019
- [CNCF: k3s project page](https://www.cncf.io/projects/k3s/), accepted to the Sandbox August 19, 2020
- [rancher/k3os repository](https://github.com/rancher/k3os), archived, last push December 8, 2023
- [Sidero Labs: Talos Linux](https://www.siderolabs.com/talos-linux/), no SSH, shell or package manager, gRPC with mTLS, binaries and size, single YAML config, atomic upgrades, MPL-2.0, Omni under BSL 1.1
- [Omni repository](https://github.com/siderolabs/omni), BSL 1.1 for the server, non-production free use, production through sales
- [Bottlerocket repository](https://github.com/bottlerocket-os/bottlerocket), A/B image updates, no SSH or shell, control and admin containers, API settings, variants, Apache-2.0 and MIT
- [AWS What's New: Bottlerocket generally available](https://aws.amazon.com/about-aws/whats-new/2020/08/announcing-general-availability-of-bottlerocket/), August 31, 2020
- [Broadcom: Tanzu Kubernetes Grid 2.5 release notes](https://techdocs.broadcom.com/us/en/vmware-tanzu/standalone-components/tanzu-kubernetes-grid/2-5/tkg/mgmt-release-notes.html), v2.5.4 the final enterprise release, migration to vSphere Supervisor and VKS
- [Broadcom KB 399145](https://knowledge.broadcom.com/external/article/399145), Tanzu Platform SaaS end of availability May 1, 2025
- [VMware Cloud Foundation blog: TKr and TKGS end of service](https://blogs.vmware.com/cloud-foundation/2024/12/09/tkr-tkgs-managing-end-of-service-of-kubernetes-versions/), December 9, 2024, Kubernetes 1.28 last on VCF 4.x, end of service May 28, 2025
- [Nutanix: Acquisition of D2iQ's Kubernetes Platform](https://www.nutanix.com/blog/acquisition-of-d2iq-platform), January 25, 2024, DKP and DC/OS engineers, DKP standalone
- [Apache Software Foundation board minutes: Mesos](https://whimsy.apache.org/board/minutes/Mesos.html), Special Order 7C, August 20, 2025, termination due to inactivity

**Orchestrators and platforms**

- [AWS News Blog: Amazon EC2 Container Service preview](https://aws.amazon.com/blogs/aws/cloud-container-management/), November 13, 2014
- [AWS What's New: Amazon EC2 Container Service generally available](https://aws.amazon.com/about-aws/whats-new/2015/04/amazon-ec2-container-service-is-now-generally-available/), April 9, 2015, four regions
- [AWS News Blog: Introducing AWS Fargate](https://aws.amazon.com/blogs/aws/aws-fargate/), November 29, 2017
- [AWS News Blog: re:Invent 2020 pre-announcements for December 1](https://aws.amazon.com/blogs/aws/reinvent-2020-preannouncements-for-tuesday-december-1/), ECS Anywhere
- [Amazon ECS pricing](https://aws.amazon.com/ecs/pricing/), no charge on the EC2 launch type, Fargate metering, ECS Anywhere at $0.01025 per instance-hour, the Managed Instances fee
- [HashiCorp: Nomad announcement](https://www.hashicorp.com/en/blog/nomad-announcement), September 28, 2015, single binary, Raft and BoltDB, regions and federation, task drivers
- [HashiCorp: Adopting the Business Source License](https://www.hashicorp.com/en/blog/hashicorp-adopts-business-source-license), August 10, 2023, BSL 1.1 for future releases, the competitive-offering restriction, MPL for APIs and SDKs
- [Nomad LICENSE at v1.6.5](https://github.com/hashicorp/nomad/blob/v1.6.5/LICENSE), MPL 2.0
- [Nomad LICENSE at v1.6.6](https://github.com/hashicorp/nomad/blob/v1.6.6/LICENSE), BSL
- [IBM: IBM completes acquisition of HashiCorp](https://newsroom.ibm.com/2025-02-27-ibm-completes-acquisition-of-hashicorp,-creates-comprehensive,-end-to-end-hybrid-cloud-platform), February 27, 2025, $6.4 billion enterprise value, $35 a share
- [Docker blog: Docker 1.12, now with built-in orchestration](https://www.docker.com/blog/docker-1-12-built-in-orchestration/), June 20, 2016, swarm mode
- [TechCrunch: Docker offers native Kubernetes support](https://techcrunch.com/2017/10/17/docker-gives-into-invevitable-and-offers-native-kubernetes-support/), October 17, 2017
- [Mirantis: Mirantis will continue to support and develop Docker Swarm](https://www.mirantis.com/blog/mirantis-will-continue-to-support-and-develop-docker-swarm/), February 24, 2020, the two-year commitment, no end date, Swarm Jobs
- [Google Cloud blog: Announcing Cloud Run](https://cloud.google.com/blog/products/serverless/announcing-cloud-run-the-newest-member-of-our-serverless-compute-stack), April 9, 2019, Knative and its founding partners
- [Google Cloud blog: Knative-based Cloud Run services are GA](https://cloud.google.com/blog/products/serverless/knative-based-cloud-run-services-are-ga), November 14, 2019, 100-millisecond billing, the editor's note on Knative
- [Microsoft Learn: Azure Container Apps overview](https://learn.microsoft.com/en-us/azure/container-apps/overview), scaling triggers, KEDA scalers, Dapr, scale to zero except CPU and memory scaling
- [Fly.io: Fly Machines](https://fly.io/blog/fly-machines/), May 24, 2022, the REST API, 300 ms boots, one level below Nomad, stopped-machine storage pricing
- [Fly.io: Carving the scheduler out of our orchestrator](https://fly.io/blog/carving-the-scheduler-out-of-our-orchestrator/), February 1, 2023, why Nomad didn't fit and how `flyd` works
- [DHH: Introducing MRSK](https://world.hey.com/dhh/introducing-mrsk-9330a267), February 28, 2023, the Kubernetes-backed HEY pipeline, 20-second deploys, vendor independence
- [Kamal repository](https://github.com/basecamp/kamal), "Deploy web apps anywhere," kamal-proxy, MIT

**Hybrid and multicloud**

- [Google Cloud blog: 100-plus announcements from Google Cloud Next '19](https://cloud.google.com/blog/topics/inside-google-cloud/100-plus-announcements-from-google-cloud-next19), Anthos GA on GKE and GKE On-Prem, April 2019
- [Microsoft Learn: Azure Arc overview](https://learn.microsoft.com/en-us/azure/azure-arc/overview), Kubernetes clusters projected into Azure Resource Manager

**Surveys**

- [CNCF: Kubernetes established as the de facto operating system](https://www.cncf.io/announcements/2026/01/20/kubernetes-established-as-the-de-facto-operating-system), January 20, 2026, 82% production use, challenges
- [CNCF Annual Survey 2024](https://www.cncf.io/reports/cncf-annual-survey-2024/), 750 respondents, published April 1, 2025
- [CNCF Annual Survey 2024 report (PDF)](https://www.cncf.io/wp-content/uploads/2025/04/cncf_annual_survey24_031225a.pdf), 80% production use, 93% including pilots and evaluation

**In practice**

- [Ona (Gitpod): We are leaving Kubernetes](https://ona.com/stories/we-are-leaving-kubernetes), October 31, 2024, six years and 1.5 million users, the reasons, Gitpod Flex, application versus system workloads
