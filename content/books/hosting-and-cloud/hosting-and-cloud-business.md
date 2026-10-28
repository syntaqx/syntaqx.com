+++
title = "The Hosting & Cloud Business"
description = "How companies that rent out infrastructure work: the parties, every way they earn, how big they are, four lifecycles, and the core data model."
category = "Hosting & Cloud Industry"
order = 2101
part = "The Business"
tags = ["hosting", "cloud", "business-models", "data-model", "billing"]
+++

A hosting or cloud company rents out infrastructure it owns, leases or resells, by the month or by the unit. A web host rents a slice of a shared server with a control panel on top; a cloud rents a virtual machine by the second, a gigabyte of object storage by the month and a million function invocations at a time; a registrar rents a domain name by the year on a registry's behalf; a certificate authority vouches for that name for weeks at a time; an edge network rents the path between the server and the visitor; a communications platform rents phone numbers and carries texts over carriers it doesn't own. The customer never sees the building, the hardware or the contracts underneath. What it sees is an account, a bill, and a set of things that are running, and every company in this market has the same three problems: keeping those things running for millions of strangers on shared equipment, measuring and charging for exactly what each one used, and dealing with the share of customers who use the infrastructure to attack, defraud or spam everyone else.

The software is hard because provisioning, money and law hang off the same few records. A single virtual machine is a placement on a host, a quota decrement, a public IPv4 address that costs the provider money every hour, a stream of usage records that become an invoice line, a target for cryptominers if its owner's keys leak, and the subject of an abuse report that has to resolve, by IP and timestamp, to whoever held it at the time. A single domain is a registry object with its own state machine, a fee owed to the registry and to ICANN, a renewal the customer agreed to under automatic renewal law, and a name a court can order transferred. This chapter is the map the rest of the volume uses: how to read it, the system it describes, who the parties are, every way these companies make money, how big they are, the life of a site, a VM, a domain and a text, and the data model every later chapter extends. Terms will be collected in the volume's glossary.

## How to Read This Volume

The chapters follow infrastructure from the building to the bill, in seventeen parts plus a reference. The stack is told bottom to top and through its history: each layer, the problem it solved, and what it cost.

- **The Business.** This chapter, then [The Provider Landscape](/books/hosting-and-cloud/provider-landscape) (hyperscalers, developer clouds, European providers, PaaS and frontend clouds, web hosts, registrars, edge networks and communications platforms; who resells whom; build, buy or rent), [Accounts, Organizations & Resellers](/books/hosting-and-cloud/accounts-and-resellers) (account hierarchies, IAM and API keys, sub-accounts, reseller and white-label models, account standing) and [From Bare Metal to Cloud: The Timeline](/books/hosting-and-cloud/bare-metal-to-cloud) (dated eras from colocation to serverless and back to hybrid, with deployment and infrastructure as code milestones).
- **The Stack, Bottom to Top.** The Data Center & Colocation (power, cooling, Uptime tiers, cross-connects, remote hands); Dedicated Servers & Bare Metal (provisioning, reimaging, spares); Data Center Networking (leaf-spine fabrics, virtual networks and VPCs, SmartNICs and DPUs, InfiniBand, RoCE and AI fabrics); Virtualization & the VPS (binary translation, Xen, hardware assist, KVM, Virtuozzo and OpenVZ, burstable credits); Shared Hosting Isolation (mod_php to suEXEC, PHP-FPM pools, CloudLinux LVE and CageFS); From chroot to Containers (jails, Zones, namespaces, cgroups, LXC, Docker, OCI); Schedulers: Borg to Kubernetes (Borg, Omega, Mesos, Swarm, ECS, Nomad); Sandboxes & MicroVMs (Nitro, gVisor, Kata, Firecracker); Functions, Isolates & Edge Compute (Lambda, Workers isolates, Wasm, WASI); Storage: Block, File & Object (volumes, snapshots, object semantics, durability claims); Regions, Zones, Cells & Quotas (footprint, cells, shuffle sharding, control and data planes); Hybrid & On-Prem Cloud (Outposts, Arc and Azure Local, Google Distributed Cloud, Oxide); and Repatriation (Dropbox's and 37signals' numbers; when owning wins).
- **Kubernetes.** Kubernetes Architecture (API server, etcd, controllers, the scheduler, CRDs and operators, support windows); Managed Kubernetes (EKS, GKE, AKS and the developer clouds; control plane and extended support fees); Cluster Networking (CNI, eBPF, Gateway API, service meshes); Storage & Stateful Workloads (CSI, StatefulSets, operators, backup); Packaging & GitOps (Helm, Kustomize, Argo CD, Flux, progressive delivery); Multi-Tenancy, Policy & Security (RBAC, virtual clusters, admission and image policy); Autoscaling & Cost (HPA, KEDA, Karpenter, bin packing, spot); and Distributions & Alternatives (OpenShift, Rancher, k3s, Talos, and when not to run Kubernetes).
- **Managed Services.** Managed Databases (RDS, Aurora, DynamoDB, Atlas, managed caches, extended support fees); Serverless & Edge Databases (serverless Postgres and branching, SQLite at the edge, key-value and durable objects, pricing per request and row); Managed Queues & Streaming (RabbitMQ, SQS and SNS, Pub/Sub, Kafka as a service, NATS; pricing by message); Observability Platforms (pricing by host, gigabyte and cardinality; OpenTelemetry; bill shock); and Open Source & the Clouds (the license wars and the forks that settled them).
- **Deployment.** How Code Got to Servers (FTP, SFTP, File Manager, rsync, Capistrano); Platforms Take Over the Deploy (git push, twelve-factor, blue/green and canary, GitOps, preview deploys, immutable URLs); and PaaS & Frontend Clouds (what they resell, how they meter, where the underlay shows through).
- **CI/CD Platforms.** From Tinderbox to Jenkins: How CI Began; The CI/CD Platform Business (per-minute pricing, OS multipliers, free tiers for open source); Runners & Build Infrastructure (hosted and self-hosted runners, ephemeral VMs, macOS fleets, caching); Continuous Delivery Platforms (Spinnaker, Argo, Harness, Octopus, approvals); Artifacts & Registries (pull limits, retention, egress); and Pipeline Supply-Chain Security (the CI breaches, OIDC federation, pinning, SLSA, Sigstore, SBOMs).
- **Infrastructure as Code.** Convergence: CFEngine to Puppet; Chef; Push & Events: Ansible and Salt; Baking Images: Packer; Provisioning: Terraform, OpenTofu & the Alternatives; and Testing, Policy, Secrets & IaC Platforms.
- **Homelab.** The Homelab (why people run infrastructure at home, the community, the hardware, power and noise); NAS & Home Storage (Unraid, TrueNAS, ZFS, Synology and QNAP); Hypervisors at Home (Proxmox VE, the end of free ESXi, XCP-ng, Incus); Home Networks: Ethernet, Wi-Fi & Cabling; Home Routing, Firewalls & DNS (pfSense and OPNsense, UniFi, VLANs, local DNS, IPv6 and CGNAT); Self-Hosted Apps & Orchestration (Compose, Home Assistant, media servers, k3s and GitOps at home, backups); Exposing Home Services (port forwarding, reverse proxies, tunnels, WireGuard and Tailscale, ISP terms); AI at Home (open-weight models on home hardware: memory, runtimes, quantization, model licenses); and From Homelab to Colocation (deploying from home, upload limits, redundant lines and BGP, power, and when a residence gives way to colocation).
- **Web Hosting.** How Web Hosting Makes Money (intro terms and renewals, bundles, upsells, ratable revenue); cPanel & WHM (root, reseller, package, feature list, account; AutoSSL; the APIs); Control Panel Licensing & the Alternatives (account-based pricing since 2019, Plesk, DirectAdmin); Managed WordPress (visit limits, staging, caching, platform-dependency risk); Backups, Restores & Migrations; and Email Hosting.
- **Domains and DNS.** ICANN, Registries & Registrars (roles, contracts, the fee stack); The Domain Data Model & EPP; The Domain Lifecycle (grace periods, expiry notices, redemption, drop catching); Transfers, Locks & Registrar Security; Registration Data & RDAP; DNS Abuse at the Registrar; Domain Disputes (UDRP, URS, court orders); New gTLDs & ccTLDs; and DNS Hosting & DNSSEC.
- **Certificates.** The Web PKI & Certificate Transparency (CAs, root programs, the CA/Browser Forum, validation, CAA, CT logs); ACME & Certificates at Hosting Scale; and Shorter Lifetimes, Revocation & Distrust.
- **The Edge.** The Edge Business; Networks, Peering & IP Addresses (anycast, PoPs, IXPs, IPv4 scarcity and markets); Caching & Invalidation; TLS & Protocols at the Edge; DDoS Mitigation; and WAF, Bots & Rate Limits.
- **Communications Platforms.** The CPaaS Business (owned network versus aggregator, usage revenue, pass-through fees); Phone Numbers & Porting; Business Texting Registration (10DLC, toll-free verification, short codes, RCS); Sending a Text (segments, throughput, delivery receipts, STOP, carrier fines); Voice Platforms (SIP trunking, STIR/SHAKEN, the Robocall Mitigation Database); 911, CPNI & Telecom Duties; Telecom Fraud; Email Sending Platforms; and Inbox Rules.
- **Metering and Billing.** Metering & Rating; Pricing Catalogs; Free Tiers, Credits & Startup Programs; Commitments, Discounts & Marketplaces; Subscriptions, Renewals & Cancellation Law; Invoices, Dunning & Suspension; Tax on Hosting & Cloud; SLAs & Service Credits; and Cost Data, FinOps & Surprise Bills.
- **Abuse, Trust and the Law.** Abuse on Infrastructure (hosted versus pass-through services, AUPs, termination decisions); Free-Tier Fraud & Stolen Keys; Conduits, Caches & Blocking Orders; Sanctions, Exports & Bulletproof Hosts; and Law Enforcement at Infrastructure Providers.
- **Market Rules and Compliance.** Shared Responsibility & Compliance Programs (SOC 2, ISO 27001, PCI for hosts, FedRAMP 20x, sovereign cloud); Egress & Switching (exit waivers, the EU Data Act); Competition Cases (CMA, EU DMA, FTC); and Licensing Disputes (Microsoft and CISPE, Broadcom VMware).
- **Running the Provider.** Provider Architecture (control plane, provisioning, the metering pipeline, billing, support and abuse); GPU & AI Clouds; Where AI Runs: Home, Colo, Cloud or Frontier; Outages, Post-Mortems & Status Pages; Operating Metrics (ARR, NDR, churn, renewal rates, gross margin, utilization); and Migrations, Shutdowns & End of Life.
- **Reference.** A glossary of every term the volume defines, grouped by part.

The volume covers what renting out infrastructure adds. The general engineering lives in the playbook, and chapters here link to it rather than repeat it: [Infrastructure as Code](/docs/delivery/infrastructure-as-code), [Containers](/docs/delivery/containers), [CI Pipelines](/docs/delivery/ci-pipelines), [Deployment Strategies](/docs/delivery/deployment-strategies), [Environments](/docs/operations/environments), [Kubernetes](/docs/operations/kubernetes), [Cost & FinOps](/docs/operations/cost-and-finops), [Disaster Recovery](/docs/operations/disaster-recovery), [Multi-Tenancy](/docs/architecture/multi-tenancy), [Rules as Data](/docs/architecture/rules-as-data), [Audit Trails](/docs/architecture/audit-trails), [Data Retention & Deletion](/docs/architecture/data-retention), [Events & Async Messaging](/docs/architecture/events), [Notifications & Consent](/docs/architecture/notifications), [Calls, Texts & Email](/docs/compliance/consumer-contact), [GDPR](/docs/compliance/gdpr), [PCI DSS](/docs/compliance/pci-dss), [Money & Amounts](/docs/payments/money), [Idempotency](/docs/payments/idempotency), [Subscriptions & Recurring Billing](/docs/payments/subscriptions) and [Sales Tax](/docs/payments/sales-tax). Two other volumes own topics this one leans on: [Payments](/books/payments/card-payments) for the money once it moves ([Stored Cards & Recurring Billing](/books/payments/stored-credentials), [Checkout, Invoicing & Payment Links](/books/payments/checkout-and-invoicing), [Disputes & Chargebacks](/books/payments/disputes-and-chargebacks)); and [User-Generated Platforms](/books/user-generated-platforms/platform-business) for the law and operations of hosting other people's content ([Abuse Desks for Hosts & Registrars](/books/user-generated-platforms/abuse-desks), [The Law of Hosting User Content](/books/user-generated-platforms/hosting-liability), [Copyright at Scale](/books/user-generated-platforms/copyright), [Law Enforcement Requests & User Data](/books/user-generated-platforms/law-enforcement-requests)).

The volume is US-centric, with EU and UK rules covered wherever they bind a provider that serves customers there. No single provider is the model: the vocabulary and tables are the industry's, benchmarked across AWS, Azure, Google Cloud, Oracle, DigitalOcean, Akamai and Linode, Vultr, Hetzner, OVHcloud, Vercel, Netlify, Heroku, Render, Fly.io, Railway, Cloudflare, Fastly, Bunny, GoDaddy, Newfold (Bluehost, HostGator), Hostinger, SiteGround, IONOS, DreamHost, WP Engine, Verisign, Let's Encrypt, Twilio, Bandwidth, Sinch, Vonage, Telnyx, Plivo, Amazon SES and Postmark, and a provider's own product name appears only where the chapter is describing that provider.

## The System You're Building

Read end to end, the volume describes the components of a company that rents out infrastructure. Few providers run all of them: a web host runs a panel, a domain business and a mail service on someone else's servers; a cloud runs everything from the building up and sells hosting as one product among hundreds; a CPaaS runs almost none of the stack and all of the registration and rating. Each component has a part:

| Component | What it does | Where |
| --- | --- | --- |
| Accounts and core model | Accounts, projects, catalog, subscriptions, resources, usage, invoices, credits, quotas | This chapter, [Accounts, Organizations & Resellers](/books/hosting-and-cloud/accounts-and-resellers) |
| Physical layer | Buildings, power, racks, servers, fabrics | The Stack, Bottom to Top |
| Compute layer | VMs, shared hosting, containers, microVMs, functions, clusters | The Stack, Bottom to Top; Kubernetes |
| Managed services | Databases, queues, edge data stores, observability | Managed Services |
| Delivery | Getting customer code onto the platform: deploys, CI runners, registries, image and IaC pipelines | Deployment; CI/CD Platforms; Infrastructure as Code |
| Self-hosted end | The same layers run at home by their own customer, and the path to colocation | Homelab |
| Web hosting products | Plans, control panels, WordPress, backups, mail | Web Hosting |
| Names and trust | Registrations, DNS, certificates | Domains and DNS; Certificates |
| Edge | Caching, TLS, DDoS, WAF, bots, IP addressing | The Edge |
| Communications | Numbers, carrier registration, texts, calls, email sending | Communications Platforms |
| Money | Metering, rating, catalogs, credits, commitments, invoices, dunning, tax, SLAs, cost data | Metering and Billing, then the [Payments](/books/payments/card-payments) volume |
| Trust and law | Abuse handling, fraud, conduits and blocking orders, sanctions, law enforcement | Abuse, Trust and the Law, on top of the [UGP abuse desks](/books/user-generated-platforms/abuse-desks) chapter |
| Market rules | Compliance programs, egress and switching, competition and licensing | Market Rules and Compliance |
| Platform | Architecture, GPUs, outages, metrics, end of life | Running the Provider |
| Vendors | Which layers to build, buy or rent | [The Provider Landscape](/books/hosting-and-cloud/provider-landscape#build-buy-or-rent) |

## Who's Who

The same running thing looks different to each party, and the provider has to serve all of them from one set of records:

| Party | Who they are | What they need from the provider |
| --- | --- | --- |
| **Providers** | Clouds, developer clouds, web hosts, PaaS and frontend clouds, edge networks, registrars, CAs, communications platforms | Utilization, low cost per unit, predictable revenue, customers who pay and don't abuse |
| **Resellers and partners** | Agencies, WHM resellers, registrar resellers, managed service providers, cloud channel partners, ISVs who register their customers for texting | A wholesale price, sub-accounts they control, their own brand on the bill, and someone to escalate to |
| **Customers** | Developers, small businesses, agencies, enterprises, governments, and at the self-hosted end a homelab operator who is also their own customer | Things that stay up, a bill they can predict and explain, their data back when they leave |
| **End users** | The visitors, recipients and callers who reach the customer's site, inbox or phone number | Pages that load, mail that arrives, texts they asked for, and no fraud |
| **Underlay suppliers** | Data center operators, hardware and chip vendors, network carriers, the hyperscaler under a PaaS, software licensors (control panels, hypervisors, operating systems) | Their fees, often passed through, and their terms followed |
| **Registries and ICANN** | Verisign and the other TLD operators; ICANN, which accredits registrars and sets consensus policy | Registry and ICANN fees per name-year, contract compliance, abuse handling |
| **Carriers and their registries** | Mobile and wireline carriers, The Campaign Registry, the toll-free and short code administrators | Registered senders, carrier fees per message, and fines when traffic breaks the rules |
| **CAs and root programs** | Certificate authorities and the browser and operating system vendors that decide which CAs to trust | Validation done to the Baseline Requirements, certificates logged, renewals automated |
| **Abuse reporters** | Security researchers, brands, blocklists, mailbox providers, rights holders, other providers | A working abuse contact, an acknowledgment, and action on evidence |
| **Regulators, courts and law enforcement** | The FTC and state attorneys general, the FCC, ICANN Compliance, OFAC and BIS, the European Commission and national authorities, the CMA, courts and police | Rules followed in their format, orders answered on their clock, records on demand |

The parties form a spectrum rather than a list. At one end a homelab operator runs servers in a closet and is their own provider and customer at once; then the same person rents a quarter rack in colocation, then capacity in a cloud, and often ends up hybrid, with some of each. Every step moves a layer from "mine" to "rented" and adds a contract, a bill and someone else's rules, and the Homelab part follows that path from the residence to the colocation cage. AI inference crosses every tier on that path: the same model can run on a GPU at home, in colocation, on a cloud's GPUs, or behind a model provider's API billed per token, which is why the core model meters tokens like any other usage. The rest of this volume is written from the provider's side of each step.

The split that shapes the data model is **who pays versus what runs.** One contracting customer pays for many projects, a reseller pays for many customers it bills itself, and each project holds many resources: a VM, a bucket, a domain, a phone number. Designs that hang the bill on the resource can't consolidate an organization's spend, apply a commitment across it, or let a reseller mark up a sub-account; designs that hang resources on the bill can't tell which machine a usage record belongs to, which customer held an IP address on a given day, or what to suspend when an invoice goes unpaid. The core model keeps them separate: an account contracts and pays, a project scopes and isolates, a resource runs, and usage connects them.

The second split is **provider versus underlay.** Almost every provider in this market resells someone else's layer: a PaaS runs on a hyperscaler's regions, a host on a cloud, a registrar on a registry, a texting platform on carriers. Heroku's regions map to AWS regions (its Frankfurt region to `eu-central-1`), SiteGround says it runs on Google Cloud, and every registrar pays a registry and ICANN for each name-year. The underlay's fees, outages, policy changes and price increases flow through to the provider's customers whether the provider's contract says so or not, which is why fees passed through from the layer below are a first-class line in the catalog, and why [The Provider Landscape](/books/hosting-and-cloud/provider-landscape#who-resells-whom) maps who sits on whom.

## How the Money Is Made

Every strategy below is a way of charging for capacity the provider has already paid for, or for a fee it must pass to the layer below. The map is here so the rest of the volume can refer to it; the Metering and Billing part covers each in depth.

| Strategy | Who pays | How it shows up | Audited or published figure |
| --- | --- | --- | --- |
| **Prepaid subscriptions with intro terms** | Small businesses and individuals | A plan bought for one to four years upfront at an introductory rate, renewing at a higher list price | Hostinger's Premium plan is $2.49 a month on a 48-month prepay and renews at $10.99 for the same term; SiteGround's StartUp is $2.99 on a 12-month prepay and renews at $17.99 (as of October 2026). GoDaddy recognizes subscription revenue ratably over terms of up to ten years |
| **Metered usage** | Developers and businesses | Per-second, per-request, per-gigabyte or per-message charges rated from usage records | EC2 bills Linux instances per second with a 60-second minimum. Twilio's usage-based revenue was 74% of its 2025 total; DigitalOcean says its pricing is "primarily consumption-based" |
| **Plans with included usage** | Developers and teams | A monthly fee that includes an allowance, then metered overage or a pause | Cloudflare Workers Paid: $5 a month including 10 million requests and 30 million CPU milliseconds, then $0.30 per million requests and $0.02 per million CPU milliseconds. Netlify pauses every project of a team that exhausts its monthly credits |
| **Commitments** | Larger customers | A spend or usage commitment for one to three years in exchange for a discount, with a shortfall if usage falls short | AWS Savings Plans save "up to 72%" for a one- or three-year commitment. A Microsoft Azure Consumption Commitment not met by its end date is charged as a shortfall, taken as Azure prepayment credit |
| **Pass-through fees** | Customers, collected for the layer below | Registry and ICANN fees per name-year; carrier fees per message; license fees per account | Bandwidth reported $192.4 million of messaging surcharges in 2025, out of $753.8 million revenue. A .com name costs the registrar Verisign's $10.26 plus ICANN's $0.20 per year before any margin |
| **Add-ons and upsells** | Existing customers | Privacy, backups, security scanning, email, dedicated IPs, support tiers | AWS charges $0.005 per public IPv4 address per hour since February 1, 2024 |
| **Marketplaces** | Software vendors selling to the provider's customers | A listing fee on every sale through the provider's marketplace | AWS Marketplace takes 3% of public SaaS offers and 20% of server products; private offers pay 3% below $1 million of contract value, down to 1.5% at $10 million and above |
| **Credits and free tiers** | Nobody directly: a cost of acquisition | Promotional, referral and startup credits that draw down usage | DigitalOcean records credits earned with a purchase as contract liabilities, recognized at the earlier of redemption or expiry; its promotional credits typically expire in two months or less |

Three patterns run through the table:

- **Hosting is a renewal business.** The intro price buys the customer; the renewal pays for them. GoDaddy reports retaining about 85% of customers in each of the last five years (about 84% in 2024), and its revenue lags bookings because a prepaid term is recognized month by month. That shape puts the renewal notice, the renewal price and the cancellation path at the center of the business and of the law that governs it (Subscriptions, Renewals & Cancellation Law).
- **Cloud is a utilization business with a float of commitments.** Usage is billed in tiny units, the provider's margin is the gap between what a server earns at its utilization and what it cost, and commitments buy predictability in exchange for discount. Oracle's FY2026 10-K reports remaining performance obligations of $638 billion, against $138 billion a year earlier: contracted capacity, not usage, now headlines the largest deals.
- **Pass-through money changes the margin, not the profit.** Twilio's 10-K says passing a carrier fee increase to customers typically raises revenue and cost of revenue so that gross profit dollars are unaffected, and Bandwidth says the same of its surcharges. Gross margin percentage falls as surcharges rise, so a provider must report pass-through lines separately or its own margin becomes unreadable (Metering & Rating).

My rule: every one of these flows is modeled as a priced SKU with an effective-dated price, a meter and an owner (the provider, or the registry, carrier or licensor it collects for), never as a constant in code. Prices change (Verisign's .com fee rose from $9.59 to $10.26 on September 1, 2024), terms migrate, and the old price still governs the usage and the prepaid terms already sold under it.

## How Big It Is

Audited annual filings give the scale. Marketing figures are left out, and so are private companies' self-reported numbers, which [The Provider Landscape](/books/hosting-and-cloud/provider-landscape) labels where it uses them:

| Measure | Figure | Source |
| --- | --- | --- |
| AWS | $128.7 billion net sales and $45.6 billion operating income (2025), up from $107.6 billion and $39.8 billion | Amazon 10-K |
| Microsoft Intelligent Cloud | $137.8 billion revenue and $57.0 billion operating income (fiscal year to June 30, 2026), up from $106.3 billion; "Azure and other cloud services revenue grew 41%" | Microsoft 10-K |
| Google Cloud | $58.7 billion revenue and $13.9 billion operating income (2025), up from $43.2 billion and $6.1 billion | Alphabet 10-K |
| Oracle cloud infrastructure | $18.1 billion revenue (fiscal year to May 31, 2026), up 77% from $10.2 billion | Oracle 10-K |
| DigitalOcean | $901.4 million revenue and $970 million ARR (2025) | DigitalOcean 10-K |
| Akamai | $4.21 billion revenue: $2.24 billion security, $1.26 billion delivery, $708 million cloud computing (2025) | Akamai 10-K |
| Cloudflare | $2.17 billion revenue, about 332,000 paying customers (2025) | Cloudflare 10-K |
| Fastly | $624.0 million revenue, 628 enterprise customers (2025) | Fastly 10-K |
| Equinix | $9.22 billion revenue; 280 data centers in 77 markets in 36 countries (2025) | Equinix 10-K |
| GoDaddy | $4.95 billion revenue, 20.4 million customers, about 81 million domains under management (2025) | GoDaddy 10-K |
| Verisign | $1.66 billion revenue; 173.5 million .com and .net names (December 31, 2025) | Verisign 10-K |
| Twilio | $5.07 billion revenue, over 402,000 active customer accounts (2025) | Twilio 10-K |
| Bandwidth | $753.8 million revenue, $192.4 million of it messaging surcharges (2025) | Bandwidth 10-K |

Two operating counts complete the picture. Verisign's Domain Name Industry Brief counts 401.6 million registrations across all top-level domains at the end of the second quarter of 2026, up 8.1% in a year. Let's Encrypt says it frequently issues ten million certificates a day, a rate it first passed in late September 2025.

Two shapes matter for the system. **The bill is long-tailed and the revenue is not.** Cloudflare's 4,298 customers paying more than $100,000 a year produced 73% of its fourth-quarter 2025 revenue, while hundreds of thousands of customers pay a few dollars or nothing; the same database has to rate a free account's three requests and an enterprise's billions, and the support, fraud and abuse load comes disproportionately from the cheap end. **Pass-through is a big share of some providers' revenue.** A quarter of Bandwidth's 2025 revenue was surcharges, and a registrar's cost of goods is mostly registry fees, so a pricing model that can't tell the provider's own margin from money collected for someone else misstates both.

## The Life of a Site


A site can live at any point on the path this volume follows, from a server at home to colocation to a cloud to a hybrid of them; the life below is the most common one, a site on a shared hosting plan.

**Buy a plan.** A small business picks a shared hosting plan at an introductory monthly price that is only offered with a long prepaid term, often with a free domain for the first year. The checkout shows the renewal price and the term, captures consent to automatic renewal with the terms shown, and charges the whole term upfront (How Web Hosting Makes Money; Subscriptions, Renewals & Cancellation Law; and the playbook's [The Law of Automatic Renewal](/docs/payments/subscriptions#the-law-of-automatic-renewal)).

**Provision.** The order creates a hosting account on a shared server: a control panel account inside a package that sets disk, bandwidth, databases, mailboxes and the feature list, with per-account resource limits enforced at the kernel. When a busy site hits its entry-process limit under CloudLinux, its extra requests get HTTP 508 while the other sites on the server are unaffected (cPanel & WHM; Shared Hosting Isolation).

**Point the domain and get a certificate.** The domain's nameservers or records point at the server, and the panel requests a certificate for every hostname. cPanel's AutoSSL runs during the nightly update and from the task queue after an account is created, validating over HTTP or DNS. Lifetimes are shrinking: Let's Encrypt's default profile moves to 64-day certificates on February 10, 2027 and to 45 days on February 16, 2028, and it warns that renewing on a hardcoded 60-day interval will no longer be enough (ACME & Certificates at Hosting Scale; Shorter Lifetimes, Revocation & Distrust).

**Deploy and run.** The customer uploads files over SFTP or the panel's file manager, or pushes from git; backups run on the host's schedule; plugins and PHP versions age (How Code Got to Servers; Backups, Restores & Migrations; Managed WordPress).

**Renew, or not.** At the end of the term the plan renews at list price unless the customer cancels, after the reminders the law requires. A failed renewal payment starts dunning and, if it fails for good, suspension and then deletion on stated clocks (Invoices, Dunning & Suspension; [Dunning](/books/payments/stored-credentials#dunning)).

**Abuse and suspension.** A phishing kit lands on the site through an outdated plugin. A report arrives at the abuse desk, resolves to this hosting account, and the narrowest action that stops the harm is taken first: a blocked path or a quarantined file, then the site, then the account ([Suspension Versus Takedown](/books/user-generated-platforms/abuse-desks#suspension-versus-takedown); Abuse on Infrastructure).

## The Life of a VM

**Account, project and quota.** A developer's account holds a project; launching a machine first checks the project's quota in the chosen region. AWS's Service Quotas describes the shape most clouds share: a default value per account or per Region, applied quotas as overrides, adjustable and fixed quotas, and increase requests support may approve, deny or partially approve (Regions, Zones, Cells & Quotas).

**Place it.** The control plane picks a host in a zone with capacity for the instance type, attaches a boot volume cloned from the image, a network interface in the customer's virtual network, and, if asked, a public IPv4 address (Virtualization & the VPS; Data Center Networking; Storage: Block, File & Object).

**Meter it.** From the moment it runs, the machine emits usage: instance-seconds, volume gigabyte-months, egress gigabytes, address-hours. EC2 bills Linux instances per second with a 60-second minimum; AWS has charged $0.005 per public IPv4 address per hour since February 1, 2024, in use or idle. The usage records are ingested idempotently and rated against the price in effect when the usage happened (Metering & Rating; Pricing Catalogs; Networks, Peering & IP Addresses).

**Discount and invoice.** At the end of the month the rated usage is netted against any commitment and credit, taxed by the seller entity's rules, and becomes invoice lines (Commitments, Discounts & Marketplaces; Free Tiers, Credits & Startup Programs; Tax on Hosting & Cloud).

**Stop, snapshot, terminate.** A stopped machine stops billing compute but keeps billing its storage and its address; a snapshot outlives the machine; termination releases the address back to the pool, where the next holder inherits its reputation. Who held that address and when is the record an abuse report or a subpoena will ask for months later (Abuse on Infrastructure; Law Enforcement at Infrastructure Providers).

**Or get stolen.** A leaked access key launches a hundred GPU instances in a region the customer never uses; the provider's anomaly detection, quota and fraud controls, and its bill-forgiveness policy decide who pays (Free-Tier Fraud & Stolen Keys; Cost Data, FinOps & Surprise Bills).

## The Life of a Domain

**Search and price.** The customer searches for a name; the registrar checks availability at the registry and prices it from the registry's wholesale fee, ICANN's fee and its own margin, with premium names priced by the registry (ICANN, Registries & Registrars).

**Register.** The registrar creates the domain at the registry over EPP with contacts, nameservers and a period in years. For five calendar days after creation the name is in the Add Grace Period, during which a deletion is refunded, within ICANN's cap of the greater of 10% of the registrar's net new registrations or 50 names a month per TLD (The Domain Data Model & EPP).

**Lock, renew, transfer.** A registrar may deny a transfer requested within 60 days of creation or of a prior transfer, and must impose a 60-day transfer lock after a change of registrant unless the registrant opted out. Each year the name renews under the customer's auto-renew setting (Transfers, Locks & Registrar Security).

**Expire.** ICANN's Expired Registration Recovery Policy requires at least two notices before expiry (about a month and about a week out) and one within five days after; DNS resolution must be interrupted for at least the last eight days the name can still be renewed. A deleted name then enters a 30-day Redemption Grace Period in which the registrant can still redeem it, then pending delete for several days, then the registry releases it to whoever catches the drop (The Domain Lifecycle).

**Disputes, abuse and orders.** At any point a trademark complaint can lock the name under the UDRP, an abuse report can put it on hold, or a court can order it transferred (Domain Disputes; DNS Abuse at the Registrar; Registration Data & RDAP).

## The Life of a Text

**Lease a number.** A software company leases a local number from a CPaaS and registers its brand (tax identity) and campaign (use case, opt-in, sample messages) with The Campaign Registry through the platform, paying pass-through fees: Telnyx lists $4.50 per brand registration, $15 per campaign vetting and $10 a month for most campaign types, as of its July 22, 2025 table (Phone Numbers & Porting; Business Texting Registration).

**Send.** Each message is split into segments: 160 GSM-7 characters fit in one, 153 per segment when concatenated, and a single emoji switches the whole message to UCS-2 at 70 and 67. The platform looks up the recipient's carrier, applies that carrier's throughput limit for the brand or campaign, and sends (Sending a Text).

**Rate it.** The message is billed per segment plus the recipient carrier's fee: Twilio lists $0.0083 per outbound SMS segment on a US long code, plus $0.0035 for AT&T recipients, $0.0045 for T-Mobile and $0.005 for Verizon, and $0.001 for a message that ends in a failed state, as of October 2026. The carrier fee is a pass-through line, not Twilio's margin (Metering & Rating; The CPaaS Business).

**Deliver, opt out, report.** A delivery receipt arrives from the carrier; a recipient replies STOP and the number is suppressed for that sender; a carrier fines the platform for a campaign that sent content it wasn't registered for, and the platform passes the fine to the customer under its terms (Sending a Text; [Calls, Texts & Email](/docs/compliance/consumer-contact#texting-the-carrier-layer); Telecom Fraud).

## The Core Data Model

Every provider converges on the same concepts under different names. AWS has an organization of accounts, Google Cloud an organization of folders and projects tied to a billing account, Azure a tenant of subscriptions and resource groups billed through a billing account, Vercel and DigitalOcean teams of projects, cPanel a root server of resellers, packages and accounts. A droplet, an EC2 instance, a Compute Engine VM and a Hetzner cloud server are all virtual machines; a domain registration, a leased phone number and a certificate are all things the customer holds for a period and the provider must renew, account for and possibly take away. This volume uses one set of names, and every later chapter's "How to Build It" extends it rather than redefining it:

| Entity | Table | What it is |
| --- | --- | --- |
| **account** | `accounts` | The contracting customer: agrees to the terms, pays, holds standing. A reseller's customer is an account whose parent is the reseller |
| **project** | `projects` | A scope inside an account for resources, permissions and quotas: a cloud project or member account, a subscription, a team project, a hosting account |
| **region and zone** | `regions`, `zones` | Where a resource runs, and its failure domain |
| **product and SKU** | `products`, `skus` | What is sold, and each billable unit of it with its meter |
| **price** | `price_versions` | The price of a SKU in a price book and currency over a period |
| **plan** | `plans`, `plan_versions` | A packaged offer: a set of SKUs with included allowances and a term, versioned as the playbook's [Subscriptions](/docs/payments/subscriptions#plan-changes-and-proration) doc describes |
| **subscription** | `subscriptions`, `subscription_periods` | An account's commitment to a plan for a term, renewing, with the playbook's periods |
| **resource** | `resources` plus side tables | Anything running or held: a server, VM, cluster, function, database, queue, bucket, network, site, domain, certificate, phone number, sender identity |
| **identifier** | `resource_identifiers` | A name or address a resource holds over time: IP, hostname, domain, phone number |
| **usage** | `usage_events`, `rated_usage` | Raw measurements as received, and their priced result |
| **credit and commitment** | `credit_grants`, `commitments` | Money the customer may draw down, and money it promised to spend |
| **quota** | `quotas` | A limit on how much a project or account may hold or do, per region |
| **hold** | `account_holds` | A restriction on an account: suspended for non-payment, abuse or fraud, with a validity range |
| **invoice and payment** | `invoices`, `invoice_lines`, `payments`, ledger tables | The [Payments](/books/payments/card-payments#the-core-data-model) volume's tables, linked to accounts, subscriptions and rated usage |
| **abuse case** | `moderation_cases`, `reports`, `abuse_mitigations` | The [UGP abuse desks](/books/user-generated-platforms/abuse-desks#how-to-build-it) tables, pointed at resources |

The split that matters most is **subscription versus resource versus usage.** The subscription is what the customer agreed to pay for a term: a hosting plan, a domain registration year, a support tier, a commitment. The resource is the thing that exists: a site on a server, a VM in a zone, a number on a carrier. Usage is what the resource did: seconds, requests, gigabytes, segments. A shared hosting plan is a subscription with one resource and no billed usage; a VM is a resource with usage and no subscription; a domain is a resource renewed by a subscription; a Workers plan is a subscription whose usage is billed beyond an allowance. Designs that make the subscription the resource can't hold a VM with no plan or a plan with many sites; designs that make usage a column on the resource can't rate it, correct it or prove it later.

### Tenancy, money and time

Four decisions sit under every table.

- **The account is the tenant.** It is the party to the contract, the payer, the holder of standing and the boundary of data access: every row below carries `account_id` and is enforced as the playbook's [`tenant_id` everywhere](/docs/architecture/multi-tenancy#tenant-id-everywhere) rule describes. Projects are scopes inside a tenant, not tenants of their own: they carry permissions and quotas, but they don't sign contracts or get suspended for non-payment. A reseller is a tenant whose customers are tenants under it, the [tenant hierarchy](/docs/architecture/multi-tenancy#tenant-hierarchies) pattern: the reseller sees and bills its sub-accounts, the provider bills the reseller, and abuse or non-payment can act at either level. [Accounts, Organizations & Resellers](/books/hosting-and-cloud/accounts-and-resellers#how-to-build-it) adds organizations, members, roles and credentials on top.
- **Money is integer minor units, but unit prices aren't.** Invoices, credits and commitments are `BIGINT` minor units with an explicit currency, per [Money & Amounts](/docs/payments/money). A unit price for a CPU-millisecond or an SMS segment is a fraction of a cent, so `price_versions` stores unit prices as exact `NUMERIC` in minor units per unit, and rounding happens once, when rated usage is summed into an invoice line, by the [written rule](/docs/payments/money#rounding).
- **Prices, plans, quotas and holdings are effective-dated.** Every price version, plan version, quota and identifier assignment has a closed-open `TSTZRANGE`, per [Effective Dating & History](/docs/database/temporal-data#effective-dated-rows). Usage is rated at the price in effect when it happened, not when it was processed; an IP address resolves to the account that held it at the reported instant.
- **Usage ingestion is idempotent and append-only.** Meters retry, pipelines replay and collectors double-send. Every usage event carries the producer's idempotency key, unique per source, so a replay is a no-op ([Idempotency Beyond the API](/docs/payments/idempotency#idempotency-beyond-the-api)); a correction is a new event that references the one it amends, never an update; rating is a deterministic function of events and price versions, so it can be rerun for a closed period and diffed. Late events for a closed period become adjustments on the next invoice, not edits to an issued one.

### One resource table

Resources are one polymorphic table with a `kind`, plus a side table per kind for what's specific. The alternatives were considered and rejected for the core:

| Design | What it buys | What it costs |
| --- | --- | --- |
| **One `resources` table plus side tables** (chosen) | One foreign key for usage, abuse cases, quotas, tags, holds, audit and law enforcement lookups; one suspend path; new kinds without touching billing | Kind-specific constraints live in side tables; a join to read details |
| A table per kind, no shared parent | Strong per-kind constraints, simple queries per product | Every cross-cutting feature (usage, abuse, holds, tags, lookups by IP) is built once per kind, and a new product has to be wired into each |
| One table with a JSONB `attributes` column | Fast to add products | No constraints, no foreign keys into kind-specific data, and every consumer parses its own idea of the schema |

The common columns are what every cross-cutting process needs: who holds it (`account_id`, `project_id`), where it is (`region_id`, `zone_id`), what it is (`kind`), what contains it (`parent_id`: a site on a server, a subnet in a network, a record set in a zone), what bills it (`subscription_id`), its lifecycle state, and the period it existed. Kind-specific columns go to side tables named for the kind. This chapter defines the side tables the four lifecycles need (`virtual_machines`, `hosting_accounts`, `domains`, `certificates`, `phone_numbers`, `sender_identities`); each later chapter adds its own. The [UGP abuse desks](/books/user-generated-platforms/abuse-desks#how-to-build-it) chapter defines `hosted_resources` for a provider that only runs an abuse desk; a provider running this model uses `resources` and `resource_identifiers` in its place, and the abuse tables point here.

The spine, in the playbook's [naming conventions](/docs/database/naming-conventions):

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Tenancy -------------------------------------------------------------------

CREATE TABLE accounts (                  -- the contracting customer; the tenant
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  parent_account_id    UUID REFERENCES accounts (id),  -- the reseller, for a sub-account
  kind                 TEXT NOT NULL CHECK (kind IN ('direct', 'reseller', 'sub_account')),
  legal_name           TEXT,                -- null for an individual until billing needs it
  country              CHAR(2) NOT NULL,    -- ISO 3166-1; tax, sanctions and law resolve here
  subdivision          TEXT,                -- ISO 3166-2
  billing_mode         TEXT NOT NULL CHECK (billing_mode IN ('self_serve', 'invoiced',
                         'billed_by_parent')),
  seller_merchant_id   UUID NOT NULL REFERENCES merchants (id),  -- the provider entity that sells
  payments_customer_id UUID REFERENCES customers (id),           -- Payments volume
  status               TEXT NOT NULL CHECK (status IN ('pending_verification', 'active',
                         'restricted', 'suspended', 'closed')),  -- cache of account_holds
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at            TIMESTAMPTZ,
  CHECK ((kind = 'sub_account') = (parent_account_id IS NOT NULL)),
  CHECK ((billing_mode = 'billed_by_parent') = (kind = 'sub_account')),
  CHECK ((status = 'closed') = (closed_at IS NOT NULL))
);

CREATE TABLE projects (                  -- a scope for resources, permissions and quotas
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id  UUID NOT NULL REFERENCES accounts (id),
  slug        TEXT NOT NULL,
  name        TEXT NOT NULL,
  environment TEXT,                      -- 'production', 'staging': a label, not a tenant
  status      TEXT NOT NULL CHECK (status IN ('active', 'pending_deletion', 'deleted')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (account_id, slug)
);

CREATE TABLE account_holds (             -- standing is rows, not a status edit
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id     UUID NOT NULL REFERENCES accounts (id),
  reason         TEXT NOT NULL CHECK (reason IN ('non_payment', 'abuse', 'fraud',
                   'verification', 'sanctions', 'legal_order', 'customer_request')),
  effect         TEXT NOT NULL CHECK (effect IN ('no_new_resources', 'read_only',
                   'stop_resources', 'full_suspension')),
  case_id        UUID REFERENCES moderation_cases (id),  -- the abuse case, when there is one
  invoice_id     UUID REFERENCES invoices (id),          -- the unpaid invoice, when there is one
  valid_during   TSTZRANGE NOT NULL,                     -- open-ended until lifted
  lifted_reason  TEXT,
  created_by     TEXT NOT NULL                           -- typed actor: 'system:dunning', staff
);

-- Footprint -----------------------------------------------------------------

CREATE TABLE regions (
  id           TEXT PRIMARY KEY,         -- the provider's code, e.g. 'nyc3', 'eu-central-1'
  name         TEXT NOT NULL,
  country      CHAR(2) NOT NULL,         -- data residency and tax
  underlay     TEXT,                     -- the cloud or colo it runs on, if not owned
  status       TEXT NOT NULL CHECK (status IN ('preview', 'available', 'restricted',
                 'retiring', 'retired'))
);

CREATE TABLE zones (                     -- a failure domain inside a region
  id        TEXT PRIMARY KEY,
  region_id TEXT NOT NULL REFERENCES regions (id),
  status    TEXT NOT NULL CHECK (status IN ('available', 'constrained', 'retired'))
);

-- Catalog and price ---------------------------------------------------------

CREATE TABLE products (                  -- a service line
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  code        TEXT NOT NULL UNIQUE,      -- 'compute', 'shared_hosting', 'domains', 'messaging'
  name        TEXT NOT NULL,
  tax_code    TEXT                       -- the tax engine's code; Tax on Hosting & Cloud
);

CREATE TABLE skus (                      -- one billable unit and how it's measured
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id     UUID NOT NULL REFERENCES products (id),
  code           TEXT NOT NULL UNIQUE,   -- 'vm.2vcpu-4gb.second', 'sms.us.segment.outbound'
  meter          TEXT NOT NULL,          -- what usage_events.meter it rates
  unit           TEXT NOT NULL,          -- 'second', 'gb_month', 'request', 'segment', 'name_year',
                                         -- 'token', 'gpu_hour'
  region_id      TEXT REFERENCES regions (id),   -- null: global SKU
  charge_kind    TEXT NOT NULL CHECK (charge_kind IN ('recurring', 'usage', 'one_time')),
  pass_through   TEXT CHECK (pass_through IN ('registry', 'icann', 'carrier', 'license',
                   'regulatory', 'marketplace_vendor')),  -- null: the provider's own revenue
  min_billable   NUMERIC,                -- e.g. 60 seconds
  billing_increment NUMERIC              -- e.g. 1 second, 100 ms
);

CREATE TABLE price_versions (            -- a SKU's price in a book, over time
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  sku_id         UUID NOT NULL REFERENCES skus (id),
  price_book     TEXT NOT NULL,          -- 'list', 'reseller_wholesale', a contract id
  currency       CHAR(3) NOT NULL,
  unit_price     NUMERIC(24,12) NOT NULL CHECK (unit_price >= 0),  -- minor units per unit
  tiers          JSONB,                  -- volume tiers; Pricing Catalogs owns the shape
  valid_during   TSTZRANGE NOT NULL,
  announced_at   TIMESTAMPTZ,            -- notice given; price-change rules are measured here
  EXCLUDE USING GIST (sku_id WITH =, price_book WITH =, currency WITH =,
    valid_during WITH &&)                -- one price per SKU, book and currency at a time
);

CREATE TABLE plans (
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  product_id  UUID NOT NULL REFERENCES products (id),
  code        TEXT NOT NULL UNIQUE,      -- 'hosting.starter', 'workers.paid', 'domain.com'
  name        TEXT NOT NULL
);

CREATE TABLE plan_versions (             -- the terms a subscriber agreed to
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  plan_id          UUID NOT NULL REFERENCES plans (id),
  version          INT NOT NULL,
  term_months      SMALLINT NOT NULL,    -- 1, 12, 36, 48; a domain year is 12
  currency         CHAR(3) NOT NULL,
  intro_amount     BIGINT,               -- first term, minor units; null if no intro price
  renewal_amount   BIGINT NOT NULL,      -- every later term, disclosed at sign-up
  included         JSONB NOT NULL DEFAULT '{}',  -- allowances by SKU code: {"workers.request": 10000000}
  overage_mode     TEXT NOT NULL CHECK (overage_mode IN ('bill', 'pause', 'throttle', 'none')),
  valid_during     TSTZRANGE NOT NULL,   -- when it can be sold
  UNIQUE (plan_id, version)
);

-- Subscriptions -------------------------------------------------------------

CREATE TABLE subscriptions (             -- the playbook's subscription, with terms
  id                UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id        UUID NOT NULL REFERENCES accounts (id),
  plan_version_id   UUID NOT NULL REFERENCES plan_versions (id),
  status            TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'past_due',
                      'paused', 'ended')),
  auto_renew        BOOLEAN NOT NULL,
  current_term      TSTZRANGE NOT NULL,
  cancel_at         TIMESTAMPTZ,
  ended_reason      TEXT CHECK (ended_reason IN ('cancelled', 'non_payment', 'term_completed',
                      'fraud', 'abuse', 'migrated')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- subscription_periods and renewal_consents are the playbook's tables, unchanged; a
-- period records pricing_phase so an intro term and a renewal term are distinguishable:
ALTER TABLE subscription_periods
  ADD COLUMN pricing_phase TEXT NOT NULL DEFAULT 'standard'
    CHECK (pricing_phase IN ('intro', 'renewal', 'standard'));

-- Resources -----------------------------------------------------------------

CREATE TABLE resources (                 -- anything running or held
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  project_id       UUID REFERENCES projects (id),    -- null for account-level holdings
  kind             TEXT NOT NULL CHECK (kind IN (
                     'server', 'virtual_machine', 'volume', 'snapshot', 'image',
                     'network', 'subnet', 'interconnect', 'placement_group', 'ip_address',
                     'load_balancer', 'cluster', 'node_pool', 'container_service', 'function',
                     'database', 'cache', 'queue', 'topic', 'edge_store', 'bucket',
                     'registry', 'ci_pipeline', 'gpu_reservation', 'model_endpoint',
                     'hosting_account', 'site', 'mailbox',
                     'domain', 'dns_zone', 'certificate', 'cdn_zone',
                     'phone_number', 'sender_identity')),
  parent_id        UUID REFERENCES resources (id),   -- site on a server, subnet in a network
  region_id        TEXT REFERENCES regions (id),     -- null: global (a domain, a zone)
  zone_id          TEXT REFERENCES zones (id),
  subscription_id  UUID REFERENCES subscriptions (id), -- what renews it, if anything
  external_ref     TEXT,                 -- the identifier customers see: 'i-0abc', a droplet id
  state            TEXT NOT NULL CHECK (state IN ('provisioning', 'active', 'stopped',
                     'suspended', 'deleting', 'deleted', 'failed')),
  exists_during    TSTZRANGE NOT NULL,   -- from provisioning to deletion
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (zone_id IS NULL OR region_id IS NOT NULL)
);

CREATE TABLE resource_identifiers (      -- names and addresses held over time
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  resource_id   UUID NOT NULL REFERENCES resources (id),
  kind          TEXT NOT NULL CHECK (kind IN ('ipv4', 'ipv6_prefix', 'hostname', 'domain',
                  'e164', 'email_domain', 'arn_like')),
  value         TEXT NOT NULL,           -- normalized: A-label, E.164, canonical address
  held_during   TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (kind WITH =, value WITH =, held_during WITH &&)
                                         -- one holder of an address or name at a time
);

CREATE TABLE virtual_machines (          -- side table: kind = 'virtual_machine'
  resource_id    UUID PRIMARY KEY REFERENCES resources (id),
  instance_type  TEXT NOT NULL,
  image_id       UUID REFERENCES resources (id),     -- kind = 'image'
  host_ref       TEXT,                   -- placement; never shown to the customer
  tenancy        TEXT NOT NULL CHECK (tenancy IN ('shared', 'dedicated_host', 'bare_metal')),
  purchase_option TEXT NOT NULL CHECK (purchase_option IN ('on_demand', 'spot', 'reserved'))
);

CREATE TABLE hosting_accounts (          -- side table: kind = 'hosting_account'
  resource_id   UUID PRIMARY KEY REFERENCES resources (id),
  server_id     UUID NOT NULL REFERENCES resources (id),  -- kind = 'server'
  panel         TEXT NOT NULL CHECK (panel IN ('cpanel', 'plesk', 'directadmin', 'own')),
  panel_user    TEXT NOT NULL,           -- the account name on that server
  package       TEXT NOT NULL,           -- the panel package that sets its limits
  UNIQUE (server_id, panel_user)
);

CREATE TABLE domains (                   -- side table: kind = 'domain'
  resource_id      UUID PRIMARY KEY REFERENCES resources (id),
  name             TEXT NOT NULL,        -- A-label, lowercase
  tld              TEXT NOT NULL,
  registry_roid    TEXT,                 -- the registry's object id, once created
  expires_at       TIMESTAMPTZ,          -- the registry's expiry, mirrored
  role             TEXT NOT NULL CHECK (role IN ('registered_here', 'dns_only', 'external'))
);

CREATE TABLE certificates (              -- side table: kind = 'certificate'
  resource_id   UUID PRIMARY KEY REFERENCES resources (id),
  issuer        TEXT NOT NULL,           -- the CA
  profile       TEXT,                    -- the CA's profile, e.g. a 45-day profile
  serial        TEXT,
  not_before    TIMESTAMPTZ,
  not_after     TIMESTAMPTZ,
  renew_after   TIMESTAMPTZ              -- from the CA's renewal window when it offers one
);

CREATE TABLE phone_numbers (             -- side table: kind = 'phone_number'
  resource_id   UUID PRIMARY KEY REFERENCES resources (id),
  e164          TEXT NOT NULL,
  number_type   TEXT NOT NULL CHECK (number_type IN ('local', 'toll_free', 'short_code',
                  'mobile', 'national')),
  country       CHAR(2) NOT NULL,
  capabilities  TEXT[] NOT NULL          -- 'sms', 'mms', 'voice'
);

CREATE TABLE sender_identities (         -- side table: kind = 'sender_identity'
  resource_id   UUID PRIMARY KEY REFERENCES resources (id),
  channel       TEXT NOT NULL CHECK (channel IN ('email_domain', 'email_address',
                  'sms_brand', 'sms_campaign', 'toll_free_verification', 'voice_caller_id')),
  identifier    TEXT NOT NULL,           -- the domain, the registry's brand or campaign id
  status        TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'rejected',
                  'suspended', 'expired'))
);

-- Credits, commitments and quotas -------------------------------------------

CREATE TABLE credit_grants (             -- money the customer may draw down
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  kind          TEXT NOT NULL CHECK (kind IN ('promotional', 'startup_program', 'referral',
                  'sla', 'goodwill', 'commitment_shortfall', 'migration')),
  currency      CHAR(3) NOT NULL,
  amount        BIGINT NOT NULL CHECK (amount > 0),
  applies_to    TEXT[],                  -- product or SKU codes; null: any eligible usage
  valid_during  TSTZRANGE NOT NULL,      -- expiry is the upper bound
  source_ref    TEXT                     -- the program, SLA claim or support case
);
-- Each drawdown is a customer_credits row (Payments volume) or a credit line on the
-- invoice, so the remaining balance is a sum, never a column.

CREATE TABLE commitments (               -- money or usage the customer promised
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id      UUID NOT NULL REFERENCES accounts (id),
  kind            TEXT NOT NULL CHECK (kind IN ('spend', 'hourly_spend', 'resource')),
  currency        CHAR(3),
  amount          BIGINT,                -- total, or per hour for 'hourly_spend'
  discount_terms  JSONB NOT NULL,        -- Commitments, Discounts & Marketplaces owns the shape
  term            TSTZRANGE NOT NULL,
  shortfall_mode  TEXT NOT NULL CHECK (shortfall_mode IN ('invoice', 'prepayment_credit',
                    'none')),
  contract_ref    TEXT
);

CREATE TABLE quotas (                    -- limits, defaults and overrides, over time
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  quota_code   TEXT NOT NULL,            -- 'vcpus.on_demand', 'phone_numbers', 'domains'
  account_id   UUID REFERENCES accounts (id),   -- null with project_id null: the default
  project_id   UUID REFERENCES projects (id),
  region_id    TEXT REFERENCES regions (id),    -- null: global quota
  limit_value  NUMERIC NOT NULL,
  source       TEXT NOT NULL CHECK (source IN ('default', 'applied', 'risk', 'abuse')),
  valid_during TSTZRANGE NOT NULL
);

-- Usage ---------------------------------------------------------------------

CREATE TABLE usage_events (              -- raw, append-only, as received
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  source           TEXT NOT NULL,        -- the producing meter or collector
  idempotency_key  TEXT NOT NULL,        -- the producer's key; a replay is a no-op
  account_id       UUID NOT NULL REFERENCES accounts (id),
  resource_id      UUID REFERENCES resources (id),
  meter            TEXT NOT NULL,        -- 'vm.seconds', 'egress.bytes', 'sms.segments',
                                         -- 'model.input_tokens', 'model.output_tokens'
  quantity         NUMERIC NOT NULL,
  dimensions       JSONB NOT NULL DEFAULT '{}',  -- region, carrier, direction, OS
  occurred_during  TSTZRANGE NOT NULL,   -- the window measured, in event time
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  corrects_id      UUID REFERENCES usage_events (id),  -- a correction, never an update
  UNIQUE (source, idempotency_key)
);

CREATE TABLE rated_usage (               -- priced usage per account, SKU and window
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  resource_id      UUID REFERENCES resources (id),
  sku_id           UUID NOT NULL REFERENCES skus (id),
  price_version_id UUID NOT NULL REFERENCES price_versions (id),
  rated_during     TSTZRANGE NOT NULL,   -- the hour or day aggregated
  quantity         NUMERIC NOT NULL,     -- after minimums and increments
  included_quantity NUMERIC NOT NULL DEFAULT 0,  -- covered by the plan's allowance
  currency         CHAR(3) NOT NULL,
  amount           NUMERIC(24,6) NOT NULL,  -- unrounded; rounded once on the invoice line
  commitment_id    UUID REFERENCES commitments (id),
  rating_run_id    UUID NOT NULL,        -- which run produced it; reruns are diffable
  invoice_line_id  UUID REFERENCES invoice_lines (id),  -- set when invoiced
  UNIQUE (account_id, sku_id, resource_id, rated_during, rating_run_id)
);

-- Money: the Payments volume's tables. The provider's selling entity is a merchant; each
-- account is a customer of it; invoices are the Payments volume's invoices.
ALTER TABLE invoices
  ADD COLUMN account_id     UUID REFERENCES accounts (id),
  ADD COLUMN billing_period TSTZRANGE;   -- the usage month; prepaid terms ride on lines

ALTER TABLE invoice_lines
  ADD COLUMN line_kind       TEXT NOT NULL DEFAULT 'charge' CHECK (line_kind IN ('charge',
                               'usage', 'pass_through', 'credit', 'commitment_shortfall',
                               'adjustment', 'tax')),
  ADD COLUMN sku_id          UUID REFERENCES skus (id),
  ADD COLUMN subscription_id UUID REFERENCES subscriptions (id),
  ADD COLUMN resource_id     UUID REFERENCES resources (id),
  ADD COLUMN service_period  TSTZRANGE;  -- what the line pays for

-- Abuse: the UGP abuse desks tables, pointed at resources instead of hosted_resources.
ALTER TABLE moderation_cases
  DROP CONSTRAINT moderation_cases_subject_type_check,
  ADD CONSTRAINT moderation_cases_subject_type_check CHECK (subject_type IN ('account',
    'resource', 'resource_identifier'));
ALTER TABLE abuse_mitigations
  RENAME COLUMN hosted_resource_id TO resource_id;  -- references resources (id)
```

Resource states and subscription states are this volume's vocabulary, not one provider's; the chapters that own each kind map them to the providers' names (a droplet's `off`, an instance's `stopped`, a cPanel account's suspension). A domain's expiry, a VM's monthly cost and an account's balance are never authoritative columns here: the registry is authoritative for expiry and `domains.expires_at` mirrors it; cost is a sum of `rated_usage`; balances are sums of ledger entries.

Design decisions behind it:

- **The account pays; the project isolates.** Quotas, permissions, budgets and resources attach to projects, so a team can isolate production from staging without a second contract. Commitments, credits, invoices, tax and standing attach to the account, because those are contract facts. A consolidated organization of many accounts is [Accounts, Organizations & Resellers](/books/hosting-and-cloud/accounts-and-resellers#how-to-build-it)'s addition.
- **Standing is holds, not a status edit.** `accounts.status` is a cache of the holds in force, the same rule the UGP model uses for penalties and the abuse desks chapter uses for mitigations. Non-payment, abuse, fraud and a sanctions match each add a dated `account_holds` row with its effect, so lifting one never erases another, and a suspension can be proved later with its reason and the invoice or case behind it.
- **Pass-through is a property of the SKU.** A registry fee, an ICANN fee, a carrier fee or a license fee is a SKU marked `pass_through` with its own price versions, so the provider's revenue and the money it collects for others are separable on every invoice, in every margin report and in the tax engine.
- **Identifiers are held, not owned.** IPs, hostnames, domains and phone numbers move between customers. The exclusion constraint on `resource_identifiers` makes it impossible for two resources to hold the same address at the same instant, and the range answers "who had 203.0.113.7 at 14:02 UTC" for an abuse report, a subpoena or a reputation lookup.
- **Usage is two tables.** Raw events stay as received, with their idempotency keys and corrections, for audit and re-rating; rated usage is derived, tagged with the run that produced it, so a pricing bug can be fixed by rerating and the difference issued as an adjustment.
- **Plans carry their renewal price.** `intro_amount` and `renewal_amount` live on the plan version the customer bought, and each period records whether it was an intro or a renewal term, so the price the renewal notice quotes is the price the customer was shown at sign-up, and a price change is a new version with notice, never an edit.
- **Money is the Payments model.** Invoices, invoice lines, credit notes, customer credits and payments are the Payments volume's ([Checkout, Invoicing & Payment Links](/books/payments/checkout-and-invoicing#how-to-build-it)); this volume adds the account, SKU, subscription, resource and service period to lines, and a provider's own revenue is a ledger account, not a column.
- **Emit life-cycle events.** `account.held`, `account.released`, `resource.provisioned`, `resource.suspended`, `resource.deleted`, `identifier.assigned`, `identifier.released`, `subscription.renewed`, `usage.rated`, `invoice.finalized`, `quota.changed` and `credit.expired` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to provisioning, billing, the abuse desk, notifications and cost exports.

Each later chapter extends a defined part of this spine. Table names here are the ones each chapter is expected to own; a chapter that needs a table another owns uses it rather than defining its own:

| Chapter | What it adds |
| --- | --- |
| 2102 The Provider Landscape | `regions.underlay` as the place the underlay shows; no tables |
| 2103 Accounts, Organizations & Resellers | `organizations`, `organization_units`, `users`, `account_members`, `roles`, `role_bindings`, `api_credentials`, `reseller_agreements`, `white_label_brands`, hold reasons by level |
| 2104 From Bare Metal to Cloud | No tables; maps each era to the kinds above |
| 2105 The Data Center & Colocation | Colocation kinds (`cabinet`, `cross_connect`, `power_circuit`) and `remote_hands_tickets` |
| 2106 Dedicated Servers & Bare Metal | `servers` side table, `hardware_assets`, `reimage_jobs` |
| 2107 Data Center Networking | `networks`, `subnets`, `security_groups`, `interconnects`, `placement_groups` side tables |
| 2108 Virtualization & the VPS | `virtual_machines` columns (hypervisor, CPU credits), `cpu_credit_balances` |
| 2109 Shared Hosting Isolation | `hosting_accounts` limit columns, `resource_limit_events` |
| 2110 From chroot to Containers | `container_services` side table, `images` side table |
| 2111 Schedulers: Borg to Kubernetes | Placement and scheduling records on `resources` |
| 2112 Sandboxes & MicroVMs | Isolation level on compute side tables |
| 2113 Functions, Isolates & Edge Compute | `functions` side table, invocation and CPU-time meters |
| 2114 Storage: Block, File & Object | `volumes`, `snapshots`, `buckets` side tables, storage-class meters |
| 2115 Regions, Zones, Cells & Quotas | `cells`, `cell_assignments`, `quota_requests` |
| 2116 Hybrid & On-Prem Cloud | Regions with `underlay` set to a customer site, `outpost_sites` |
| 2117 Repatriation | No tables; cost comparison over `rated_usage` |
| 2118 Kubernetes Architecture | `clusters` side table, version and support window columns |
| 2119 Managed Kubernetes | `node_pools` side table, control-plane and extended-support SKUs |
| 2120 Cluster Networking | Load balancer and gateway kinds on `resources` |
| 2121 Storage & Stateful Workloads | Persistent volume links from clusters to `volumes` |
| 2122 Packaging & GitOps | `deployments` records for cluster workloads |
| 2123 Multi-Tenancy, Policy & Security | `cluster_tenants` for providers running customer workloads on shared clusters |
| 2124 Autoscaling & Cost | Cost allocation dimensions on `usage_events` |
| 2125 Distributions & Alternatives | No tables |
| 2126 Managed Databases | `databases` and `caches` side tables, engine version and extended-support SKUs |
| 2127 Serverless & Edge Databases | `edge_stores` side table, row-read, row-write and request meters |
| 2128 Managed Queues & Streaming | `queues` and `topics` side tables, message and retention meters |
| 2129 Observability Platforms | Ingest, host and cardinality meters |
| 2130 Open Source & the Clouds | License fields on `products` |
| 2131 How Code Got to Servers | `deploy_credentials` (FTP, SFTP, SSH) on hosting accounts |
| 2132 Platforms Take Over the Deploy | `deployments`, `deployment_aliases` |
| 2133 PaaS & Frontend Clouds | `sites` side table, spend caps on projects |
| 2134 From Tinderbox to Jenkins | No tables |
| 2135 The CI/CD Platform Business | `ci_pipelines` side table, build-minute meters with OS multipliers |
| 2136 Runners & Build Infrastructure | `runners`, `ci_runs` |
| 2137 Continuous Delivery Platforms | `release_approvals` |
| 2138 Artifacts & Registries | `registries` side table, pull and storage meters |
| 2139 Pipeline Supply-Chain Security | `workload_identity_bindings`, `attestations` |
| 2140 to 2145 Infrastructure as Code | `iac_states` and `image_builds` where the provider hosts them; resource `external_ref` conventions |
| 2146 The Homelab | No tables: the operator and the customer are the same person, and the model still applies |
| 2147 to 2152 Homelab storage, hypervisors, networks, routing, apps and exposure | No provider tables; the self-hosted mirror of the kinds above |
| 2153 AI at Home | No tables; token meters at home are the same `usage_events` with a cost of zero |
| 2154 From Homelab to Colocation | No tables; the bridge to colocation kinds in 2105 |
| 2155 How Web Hosting Makes Money | Bundle and upsell rows on `plan_versions` |
| 2156 cPanel & WHM | Panel package and feature list mapping on `hosting_accounts` |
| 2157 Control Panel Licensing | `license_seats`, license pass-through SKUs |
| 2158 Managed WordPress | `sites` columns (visits, staging), visit meters |
| 2159 Backups, Restores & Migrations | `backup_policies`, `backups`, `restores`, `migrations` |
| 2160 Email Hosting | `mailboxes` side table |
| 2161 ICANN, Registries & Registrars | `registries`, `tld_pricing`, registry and ICANN pass-through SKUs |
| 2162 The Domain Data Model & EPP | `domain_contacts`, `domain_hosts`, `domain_statuses`, `epp_transactions` |
| 2163 The Domain Lifecycle | `domain_lifecycle_events`, `expiry_notices` |
| 2164 Transfers, Locks & Registrar Security | `domain_transfers`, `domain_locks` |
| 2165 Registration Data & RDAP | `registrant_data`, `disclosure_requests` |
| 2166 DNS Abuse at the Registrar | DNS abuse categories on `reports`; ICANN evidence on `abuse_mitigations` |
| 2167 Domain Disputes | `domain_disputes` |
| 2168 New gTLDs & ccTLDs | Registry policy rows on `registries` |
| 2169 DNS Hosting & DNSSEC | `dns_zones` side table, `dns_records`, `dnssec_keys`, query meters |
| 2170 to 2172 Certificates | `certificate_orders`, `dcv_challenges`, `ct_submissions`, revocation and distrust records |
| 2173 to 2178 The Edge | `cdn_zones` side table, `cache_purges`, `waf_rules`, `rate_limit_rules`, `ddos_events`, IP block and lease records on `resource_identifiers` |
| 2179 The CPaaS Business | Carrier fee SKUs, `carriers` |
| 2180 Phone Numbers & Porting | `number_inventory`, `port_requests` |
| 2181 Business Texting Registration | `sms_brands`, `sms_campaigns`, `campaign_numbers` on `sender_identities` |
| 2182 Sending a Text | `messages`, `message_segments`, `delivery_receipts`, `opt_outs`, `carrier_fines` |
| 2183 Voice Platforms | `calls`, `attestations`, `rmd_filings` |
| 2184 911, CPNI & Telecom Duties | `emergency_addresses`, `cpni_breach_reports` |
| 2185 Telecom Fraud | `geo_permissions`, `fraud_blocks` |
| 2186 Email Sending Platforms | `ip_pools`, `email_streams`, `email_events` |
| 2187 Inbox Rules | `sender_reputation_samples`, enforcement holds on `sender_identities` |
| 2188 Metering & Rating | `meters`, `rating_runs`, `usage_corrections` |
| 2189 Pricing Catalogs | Tier shapes on `price_versions`, `price_change_notices` |
| 2190 Free Tiers, Credits & Startup Programs | `credit_programs`, `spending_limits` |
| 2191 Commitments, Discounts & Marketplaces | `commitment_drawdowns`, `marketplace_listings`, `marketplace_orders`, `private_offers` |
| 2192 Subscriptions, Renewals & Cancellation Law | `renewal_notices`, `cancellation_requests` (the playbook's), jurisdiction rules |
| 2193 Invoices, Dunning & Suspension | `invoice_runs`, `dunning_schedules`, suspension and deletion clocks on `account_holds` |
| 2194 Tax on Hosting & Cloud | Seller entities as `merchants`, tax lines (the playbook's `invoice_line_taxes`) |
| 2195 SLAs & Service Credits | `sla_definitions`, `sla_claims` producing `credit_grants` |
| 2196 Cost Data, FinOps & Surprise Bills | `budgets`, `budget_alerts`, `cost_exports`, `anomalies` |
| 2197 Abuse on Infrastructure | AUP categories; hosted versus pass-through service on `resources` |
| 2198 Free-Tier Fraud & Stolen Keys | `credential_exposures`, risk quotas |
| 2199 Conduits, Caches & Blocking Orders | `blocking_orders` (extending UGP `legal_notices`) |
| 2200 Sanctions, Exports & Bulletproof Hosts | `sanctions_screenings`, sanctions holds |
| 2201 Law Enforcement at Infrastructure Providers | Identifier lookups over `resource_identifiers` (UGP `legal_requests`) |
| 2202 to 2205 Market Rules and Compliance | `compliance_attestations`, `egress_waivers`, data residency on `regions` |
| 2206 Provider Architecture | Partitioning of `usage_events` and `resources` by account |
| 2207 GPU & AI Clouds | GPU capacity reservations as `commitments` of kind `resource` |
| 2208 Where AI Runs: Home, Colo, Cloud or Frontier | Placement comparison over token and GPU-hour `rated_usage` across tiers |
| 2209 Outages, Post-Mortems & Status Pages | `status_components`, `incidents` |
| 2202 Operating Metrics | `metric_definitions`, `metric_values` |
| 2203 Migrations, Shutdowns & End of Life | `product_sunsets`, `data_exports` |

What goes wrong most often is building for one product and bolting on the rest: a host whose billing knows only plans and can't rate a gigabyte, a cloud whose resources can't carry a renewal, a registrar whose domains live outside the resource model and so outside the abuse desk, a CPaaS whose carrier fees are folded into its own price. My rule: decide the shape of accounts, resources, subscriptions and usage together, even if you launch with one product.

## Auditing

The records in this chapter are the ones customers, auditors, registries, carriers, regulators and courts ask about later:

- **What the customer agreed to.** The plan version, its intro and renewal amounts, the term, the auto-renewal consent and the disclosure shown, so a renewal charge can be defended against a dispute or an attorney general ([Consent and Reminders as Data](/docs/payments/subscriptions#consent-and-reminders-as-data)).
- **Every usage event and how it was rated.** Raw events with their keys and corrections, the price version applied, and the rating run, so any invoice line can be rebuilt from facts and a disputed bill traced to the meter.
- **Who held what, when.** Every identifier assignment with its range, every resource's existence range and owner, so an abuse report, a law enforcement request or a reputation complaint resolves to the right customer.
- **Every hold and why.** Who suspended an account or a resource, for what reason, under which case or invoice, and when it was lifted ([Audit Trails](/docs/architecture/audit-trails#typed-actors)).
- **Pass-through collected and remitted.** Registry, ICANN and carrier fees billed to customers against what the provider paid, because registries and carriers reconcile against their own counts.
- **Prices and their notice.** Every price version with when it was announced, because contracts and law measure notice from that date.

Retention runs past account closure: billing and tax records for the periods the law requires, consent records for as long as the strictest renewal rule requires, and identifier history for as long as abuse and law enforcement requests can reach back ([Data Retention & Deletion](/docs/architecture/data-retention#erasure-vs-append-only-records)).

## What This Means for the System You Build

- **Make the account the tenant and the payer,** with projects as scopes inside it and resellers as tenants above their customers.
- **Keep subscriptions, resources and usage separate,** linked by keys, so a plan, a running thing and what it did can each change on its own schedule.
- **Use one resource table with side tables per kind,** so usage, abuse, holds, quotas and lookups are built once.
- **Hold identifiers over time** with an exclusion constraint, and attribute every report by the instant it names.
- **Store unit prices exactly and round once,** in integer minor units on the invoice line.
- **Effective-date every price, plan, quota and assignment,** and rate usage at the price in effect when it happened.
- **Ingest usage idempotently and append-only,** with corrections as new events and rating as a rerunnable function.
- **Mark pass-through fees on the SKU,** so the provider's margin and the money it collects for registries, carriers and licensors stay separable.
- **Model standing as dated holds,** never as a status field someone edits.
- **Use the Payments model for invoices and money** and the UGP abuse tables for cases, pointed at these resources.

## References

**Filings**

- [Amazon: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm), AWS segment net sales and operating income for 2025 and 2024
- [Microsoft: Form 10-K for fiscal year 2026](https://www.sec.gov/Archives/edgar/data/789019/000119312526323660/msft-20260630.htm), Intelligent Cloud revenue and operating income, Azure and other cloud services growth
- [Alphabet: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm), Google Cloud revenues and operating income for 2025 and 2024
- [Oracle: Form 10-K for fiscal year 2026](https://www.sec.gov/Archives/edgar/data/1341439/000119312526277521/orcl-20260531.htm), cloud infrastructure revenue and remaining performance obligations
- [DigitalOcean: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1582961/000158296126000019/docn-20251231.htm), revenue, ARR and its definition, consumption-based pricing, credits as contract liabilities and their expiry
- [Akamai: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1086222/000108622226000022/akam-20251231.htm), revenue by security, delivery and cloud computing
- [Cloudflare: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1477333/000147733326000016/cloud-20251231.htm), revenue and paying customers
- [Cloudflare: Q4 2025 earnings call transcript](https://cloudflare.net/files/doc_financials/2025/q4/CORRECTED-TRANSCRIPT-Cloudflare-Inc-NET-US-Q4-2025-Earnings-Call-10-February-2026-5-00-PM-ET.pdf), 4,298 customers above $100,000 a year and their 73% share of fourth-quarter revenue
- [Fastly: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1517413/000151741326000053/fsly-20251231.htm), revenue and enterprise customers
- [Equinix: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1101239/000110123926000032/eqix-20251231.htm), revenue, data centers, markets and countries
- [GoDaddy: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1609711/000160971126000010/gddy-20251231.htm), revenue, customers, domains under management, retention, ratable recognition over terms up to ten years, Verisign and ICANN fees
- [VeriSign: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1014473/000101447326000006/vrsn-20251231.htm), revenue, the .com and .net base, the .com fee
- [Twilio: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1447669/000144766926000021/twlo-20251231.htm), revenue, usage-based share, active customer accounts, fee pass-through and gross profit
- [Bandwidth: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1514416/000151441626000017/band-20251231.htm), revenue, messaging surcharges and their effect on gross profit

**Pricing and terms**

- [Hostinger: Pricing](https://www.hostinger.com/pricing), the Premium plan's intro price, 48-month term and same-term renewal price
- [SiteGround: Web hosting plans](https://world.siteground.com/web-hosting.htm), the StartUp plan's intro and renewal price
- [AWS: EC2 On-Demand pricing](https://aws.amazon.com/ec2/pricing/on-demand/), per-second billing with a 60-second minimum
- [AWS News Blog: New AWS public IPv4 address charge](https://aws.amazon.com/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights/), $0.005 per address-hour from February 1, 2024
- [AWS: What are Savings Plans](https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html), savings up to 72% for one- or three-year commitments
- [Microsoft Learn: Track your Microsoft Azure Consumption Commitment](https://learn.microsoft.com/en-us/azure/cost-management-billing/benefits/macc/track-consumption-commitment), the shortfall charge as Azure prepayment credit
- [AWS Marketplace: Listing fees](https://docs.aws.amazon.com/marketplace/latest/userguide/listing-fees.html), public and private offer fees
- [Cloudflare: Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), the Paid plan's minimum, allowances and overage, billing on CPU time
- [Netlify: Resume paused projects](https://docs.netlify.com/manage/accounts-and-billing/billing/resume-paused-projects/), pausing every project when a team's credits run out, auto recharge
- [Twilio: SMS pricing for the United States](https://www.twilio.com/en-us/sms/pricing/us), per-segment price, carrier fees and the failed message fee
- [Telnyx: 10DLC fees and charges](https://support.telnyx.com/en/articles/5634625-10dlc-fees-and-charges), brand registration, campaign vetting and monthly campaign fees
- [Heroku Dev Center: Regions](https://devcenter.heroku.com/articles/regions), Heroku regions mapped to AWS regions
- [SiteGround: Google Cloud hosting](https://www.siteground.com/google-cloud-hosting.htm), SiteGround running on Google Cloud

**Policy and specifications**

- [ICANN: Add Grace Period Limits Policy](https://www.icann.org/resources/pages/agp-policy-2008-12-17-en), the five-day Add Grace Period and the refund cap
- [ICANN: Transfer Policy](https://www.icann.org/resources/pages/transfer-policy-2016-06-01-en), transfer denial within 60 days and the post-change-of-registrant lock
- [ICANN: Expired Registration Recovery Policy](https://www.icann.org/resources/pages/errp-2013-02-28-en), expiry notices, DNS interruption and the Redemption Grace Period
- [ICANN: EPP status codes](https://www.icann.org/resources/pages/epp-status-codes-2014-06-16-en), redemptionPeriod for 30 days, pendingDelete, client and server hold
- [Twilio: What is the SMS character limit](https://www.twilio.com/docs/glossary/what-sms-character-limit), GSM-7 and UCS-2 segment sizes

**Reference**

- [Verisign: Domain Name Industry Brief, Q2 2026](https://blog.verisign.com/domain-names/q2-2026-domain-name-industry-brief-quarterly-report/), 401.6 million registrations across all TLDs
- [Let's Encrypt: Ten years](https://letsencrypt.org/2025/12/09/10-years), ten million certificates a day
- [Let's Encrypt: Decreasing certificate lifetimes to 45 days](https://letsencrypt.org/2025/12/02/from-90-to-45), the 64-day and 45-day dates and the warning about hardcoded renewal
- [cPanel: Manage AutoSSL](https://docs.cpanel.net/whm/ssl-tls/manage-autossl/88/), when AutoSSL runs and its validation methods
- [CloudLinux: Limits](https://docs.cloudlinux.com/cloudlinuxos/limits/), the entry processes limit and HTTP 508
- [AWS: What is Service Quotas](https://docs.aws.amazon.com/servicequotas/latest/userguide/intro.html), default and applied quotas, adjustable quotas and increase requests
