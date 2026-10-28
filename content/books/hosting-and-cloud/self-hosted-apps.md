+++
title = "Self-Hosted Apps & Orchestration"
nav_title = "Self-Hosted Apps"
description = "Compose, NAS app stores and LXC; Home Assistant, Plex vs Jellyfin, Immich, Nextcloud, Vaultwarden; k3s and GitOps; 3-2-1 backups; the offline internet."
category = "Hosting & Cloud Industry"
order = 2151
part = "Homelab"
tags = ["homelab", "self-hosting", "docker-compose", "home-assistant", "media-servers", "backups", "kiwix", "offline"]
+++

A self-hosted app is a hosted service with the provider removed: the same photo library, password vault, media catalog or file sync a SaaS company sells, running on a box in a closet whose owner is operator, security team and only support engineer. The software is rarely the hard part. Most of these projects ship a container image and a sample Compose file, and a working install takes an afternoon. What takes years is everything a provider does without being asked: updates, backups, restores, certificates, and knowing which of fifteen containers holds data nobody else has a copy of.

This chapter covers how apps are packaged and run at home (Docker Compose, Portainer, Unraid's Community Applications, TrueNAS apps, Proxmox LXC), the projects most homelabs converge on (Home Assistant; Plex, Jellyfin and Emby; Immich; Nextcloud; Vaultwarden) and how each is licensed and funded, Kubernetes and GitOps at home, infrastructure as code for the lab, and backups. It ends with the offline internet: Wikipedia, Stack Overflow, maps and documentation kept on local disks. It adds no provider tables to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model); a homelab app is the self-hosted mirror of the resource kinds there, and its inventory is a file in Git. The wider homelab is [The Homelab](/books/hosting-and-cloud/homelab); the disks and datasets under these apps are [NAS & Home Storage](/books/hosting-and-cloud/nas-and-home-storage); the VMs and containers they run in are [Hypervisors at Home](/books/hosting-and-cloud/hypervisors-at-home); reverse proxies, tunnels and remote access are [Exposing Home Services](/books/hosting-and-cloud/exposing-home-services); keeping the lab on its own segment is [Home Routing & Firewalls](/books/hosting-and-cloud/home-routing-and-firewalls); local models are [AI at Home](/books/hosting-and-cloud/ai-at-home).

## How the Projects Do It

| Project | License | Owner and funding | Packaging | Paid tier (as of October 2026) |
| --- | --- | --- | --- | --- |
| **Docker Compose** | Apache-2.0 | Docker, Inc. | Go binary installed as a Docker CLI plugin (`docker compose`) | None for Compose itself |
| **Portainer** | Zlib (Community Edition) | Portainer, a company | Container image | Business Edition: Starter $1,045 a year (5 to 15 nodes), Scale $2,095 a year; a non-commercial Home & Student license |
| **Unraid Community Applications** | Plugin by Andrew Zawadzki ("Squid") | Community-maintained templates on a paid OS | Catalog of Docker templates and plugins | Unraid OS: Starter $49, Unleashed $109, Lifetime $249, one-time |
| **TrueNAS apps** | Open core (Community Edition) | The TrueNAS vendor | Docker since 24.10, catalog or Compose YAML | Enterprise edition; Community Edition free |
| **Proxmox LXC** | Open source (Proxmox VE) | Proxmox | `pct` containers from templates | Commercial support for Proxmox VE |
| **Home Assistant** | Apache-2.0 | Community project; Nabu Casa's subscribers fund development | Home Assistant OS or a container | Home Assistant Link $6.50 a month or $65 a year |
| **Plex Media Server** | Proprietary | Plex, Inc. | Native packages and images | Plex Pass $6.99 a month, $69.99 a year, Lifetime $749.99; Remote Watch Pass $2.99 a month or $29.99 a year |
| **Jellyfin** | GPL-2.0 | Volunteer project | Native packages and images | None: "no premium licenses or features" |
| **Emby** | Proprietary since 4.x | Emby, a company | Native packages and images | Emby Premiere $4.99 a month, $54 a year, $119 lifetime |
| **Immich** | AGPL-3.0, no CLA | Core team employed by FUTO | Compose stack | Optional product key; "will never paywall features" |
| **Nextcloud** | AGPL-3.0 | Nextcloud GmbH | Packages, images, appliances | Enterprise from €71.29 per user a year (100 users) |
| **Vaultwarden** | AGPL-3.0 | Volunteer project, "not associated with Bitwarden" | Container image | None |

Three patterns run through the table. **The container image is the unit of distribution:** every project here ships one, and the NAS vendors' app stores are catalogs of images with a form in front. **Funding decides the paid tier's shape:** venture-style companies (Plex, Emby) charge for features and remote access, foundation or employer-backed projects (Home Assistant, Immich) sell a convenience service or a voluntary key and keep features free, and volunteer projects (Jellyfin, Vaultwarden) charge nothing and carry the bus-factor risk instead. **Licenses are mostly copyleft:** AGPL dominates the data-holding apps (Immich, Nextcloud, Vaultwarden) and Proxmox Backup Server, which is the same lever [Open Source and the Clouds](/books/hosting-and-cloud/open-source-and-the-clouds#the-license-spectrum) describes on the provider side, pulled by projects that want hosted forks to share changes.

## How We Got Here

- **2013:** Home Assistant starts; its fifth-anniversary post is dated September 17, 2018.
- **July 23, 2014:** Docker acquires Orchard Labs, maker of Fig, "a tool that uses a YAML file to define and manage multi-container applications." Compose v1 (Python, `docker-compose`) is first released in 2014, and Compose 1.1.0 announces that "Fig has been renamed to Docker Compose" in February 2015.
- **June 2, 2016:** Frank Karlitschek and former ownCloud core developers fork ownCloud as Nextcloud.
- **September 17, 2018:** Home Assistant announces Nabu Casa, funded "only by its subscribers," running Home Assistant Cloud for $5 a month to pay full-time developers.
- **December 2018:** Jellyfin forks Emby after Emby took its 4.x release closed source.
- **February 2019:** k3s v0.1.0, the "Initial Release" of a single-binary Kubernetes.
- **2020 to September 28, 2021:** Compose v2, a Go rewrite invoked as `docker compose`, is announced in 2020 and reaches v2.0.0 in September 2021; Docker later releases Compose v5 (2025), functionally identical to v2 with a Go SDK.
- **April 30, 2021:** bitwarden_rs becomes Vaultwarden in 1.21.0, "due to user confusion and to avoid any possible trademark/brand issues with the official server."
- **February 2022:** Immich's first commit.
- **May 1, 2024:** Immich's core team goes full-time under FUTO; the license stays AGPL "without a CLA."
- **October 29, 2024:** TrueNAS 24.10 moves its apps backend "from Kubernetes to Docker."
- **April 29, 2025:** Plex raises Plex Pass prices and ends free remote playback of personal media.
- **May 22, 2025:** Home Assistant deprecates the Core and Supervised installation methods, unsupported from 2025.12.
- **October 1, 2025:** Immich v2.0.0, the first stable release, after 271 releases.
- **April 29, 2026:** Plex extends the remote playback requirement to Fire TV, Samsung, LG, Vizio, PlayStation, Xbox and more.
- **June 1 and July 1, 2026:** Plex's Remote Watch Pass leaves introductory pricing; the new Lifetime Plex Pass goes to $749.99.
- **July 17 to 19, 2026:** Jellyfin's project leader and a longtime core member step down, and a co-founder resigns.

The arc is the same one the providers walked: from hand-installed packages, to a declarative file per app, to a reconciler that applies the file. What changed at home is that the NAS vendors absorbed the middle step, and in 2024 TrueNAS, having tried Kubernetes as the app runtime, went back to Docker.

## Running Apps: Compose and Its Front Ends

**Docker Compose** is the homelab's unit of deployment. A `compose.yml` names services (an image, environment, ports), volumes and networks; `docker compose up -d` creates or converges them, and `docker compose pull` followed by `up -d` is an update. The file is the whole contract, so it belongs in Git, diffable and reviewable like any other infrastructure ([Infrastructure as Code](/docs/delivery/infrastructure-as-code#declarative-beats-imperative)). The old Python `docker-compose` (v1) is legacy; the Compose Specification merged the 2.x and 3.x file formats, so the `version:` key at the top of older files is ignored.

**Portainer** is a web UI over Docker, Swarm, Kubernetes and Podman: it lists containers, edits stacks (Compose files) and shows logs, and its Community Edition is "our free, open source option for home users and hobbyists." The Business Edition adds features under paid node-based licenses. It is a good dashboard and a poor source of truth: a stack edited in a browser has no history unless the file also lives in Git.

**Unraid Community Applications** is the catalog in front of Unraid's Docker support: "thousands of applications," most entries built and maintained by community members and vetted for safety and compatibility, plus plugins that extend the OS itself. A template turns an image into a form (paths, ports, variables), which is the easiest on-ramp in the category and the hardest to reproduce, because the configuration lives in the template on the box rather than in a file you own.

**TrueNAS apps** ran on Kubernetes until 24.10 moved the backend to Docker; custom apps can be installed from the wizard or from "a Docker Compose YAML file." The NAS owns the datasets, so app data sits on ZFS next to everything else it holds.

**Proxmox LXC** containers share the host kernel ("Containers use the kernel of the host system") and are unprivileged by default, the container's root mapped to an unprivileged user outside. One service per LXC is the light way to run a single daemon with its own IP and backups. Proxmox's own guidance is that for maximum isolation and live migration "nesting containers inside a Proxmox QEMU VM remains a recommended practice," which is why a Docker host usually goes in a VM ([Hypervisors at Home](/books/hosting-and-cloud/hypervisors-at-home)). Proxmox also lists OCI application containers, converted to LXC on creation, as a technology preview.

## Home Automation

**Home Assistant** (Python, Apache-2.0) is the hub most home labs end up running: integrations with devices and cloud services, automations, dashboards and local voice. The installation page lists two supported types: **Home Assistant OS**, "an embedded, minimalistic operating system" for single-board computers and VMs and the recommended one, and **Home Assistant Container**, where the owner handles updates and apps are not supported. Core and Supervised were deprecated on May 22, 2025, with support ending in 2025.12. Its scale is visible only through opt-in analytics: 713,255 active installations reported as of October 2026, with the project's own caveat that it estimates "less than a fourth of all Home Assistant users opt in," so the real base is several times larger and no audited figure exists.

The funding model is the paid convenience service. Nabu Casa launched Home Assistant Cloud in 2018 at $5 a month, refusing investors and donations; the service is now called Home Assistant Link, at $6.50 a month or $65 a year as of October 2026, and bundles remote access, offsite backups, Alexa and Google voice integration and cloud speech processing. Everything it sells can be self-built (a reverse proxy or tunnel, a backup target, local speech models), which is the point: the subscription buys not having to.

## Media Servers: Plex, Jellyfin and Emby

The three servers do the same job (index a library, fetch metadata, transcode for the client, stream at home and away) and differ in who controls the client apps and what is behind a paywall.

**Plex** is proprietary, with polished clients on almost every TV and console. From April 29, 2025, Plex Pass rose to $6.99 a month and $69.99 a year, the Lifetime pass went from $119.99 to $249.99, and remote playback of personal media stopped being free: watching a server from outside its network now needs Plex Pass or a Remote Watch Pass, introduced at $1.99 a month or $19.99 a year. On April 29, 2026 Plex extended the remote playback requirement to Fire TV, Samsung, LG, Vizio, PlayStation, Xbox and more; the Remote Watch Pass rose to $2.99 a month and $29.99 a year from June 1, 2026, with Plex Pass monthly and yearly prices unchanged; and the price of a new Lifetime Plex Pass went to $749.99 on July 1, 2026, three times the 2025 price and more than six times the pre-2025 one (as of October 2026).

> [!TIP] Lucky me
> I bought a Lifetime Plex Pass in 2014. Every price increase since has made it a better deal, which makes it, by a wide margin, the best subscription decision I have ever made.

**Jellyfin** began in December 2018 "primarily as a result of Emby's decision to take their next release (4.x) closed-source," after a paywall for free users and the removal of client and server code. It is GPL-2.0 with "no premium licenses or features," so remote streaming, hardware transcoding and every client are free. The cost is volunteer capacity: in July 2026 project leader Joshua Boniface (citing severe burnout) and core member Anthony Lavado, who handled app stores, releases and finances, left effective July 19, and co-founder Andrew Rabert resigned on July 17 over development disagreements including his use of AI-assisted tools, taking his desktop client outside the project. The departures were described as a planned transition, and a broad group of contributors continues to maintain it; no new leader had been named in the report.

**Emby** is the proprietary parent: Emby Premiere is $4.99 a month, $54 a year or $119 lifetime for a household with a 30-device limit (as of October 2026), unlocking hardware transcoding, offline downloads, DVR and full access to its apps.

The tradeoff is clients against control. Plex has the best device coverage and now charges someone for every remote viewer; Jellyfin charges no one and depends on volunteers and community clients; Emby sits between with a cheaper pass. A server whose owner holds a Plex Pass covers that server's remote viewers, so the 2025 change mostly moved the bill to whoever runs the server.

## Photos, Files and Passwords

**Immich** is a self-hosted Google Photos: mobile apps that back up the camera roll to a server you run. It reached v2.0.0 on October 1, 2025, its first stable release, with semantic versioning so that any 2.x mobile app works with any 2.x server. Its funding is unusual for the category: FUTO employs the core team, the license stays AGPL without a CLA, donations ended, and an optional product key funds the project with the promise that it "will never paywall features." Its own README carries the warning that matters most: "Always follow 3-2-1 backup plan for your precious photos and videos!" A photo library is the dataset in a homelab most likely to have no other copy.

**Nextcloud** is the AGPL fork of ownCloud (June 2016): file sync and sharing, calendars, contacts, office documents and a large app catalog. The self-hosted server is free and fully open source; Nextcloud GmbH sells Enterprise subscriptions from €71.29 per user a year at 100 users (as of October 2026). It is a platform rather than a single service, and it rewards being treated as one: pinned versions, staged upgrades and a tested restore.

**Vaultwarden** is "written in Rust and compatible with official Bitwarden clients," an unofficial server implementation of the Bitwarden API that runs in a small container. It began as bitwarden_rs and was renamed in April 2021 to avoid confusion with the official server; it states it "is not associated with Bitwarden or Bitwarden, Inc.," though one active maintainer is a Bitwarden employee contributing independently. A password vault is the most sensitive app in the lab and the one whose outage locks the owner out of everything else, so it gets the strictest exposure (never on the open internet without a proxy and an allowlist, see [Exposing Home Services](/books/hosting-and-cloud/exposing-home-services)) and the most frequent backups.

## Kubernetes and GitOps at Home

Kubernetes at home is a learning choice before it is an operational one. Two shapes dominate. **k3s** is "Lightweight Kubernetes... all in a binary of less than 100 MB," bundling containerd, Flannel and Traefik and defaulting to an SQLite datastore, with etcd, MySQL or Postgres for more nodes. **Talos Linux** from Sidero Labs is "the immutable, API-driven operating system purpose-built for Kubernetes," with "No SSH, no shell, no package manager," MPL-2.0. k3s fits a VM or a mini PC beside other workloads; Talos makes the node itself disposable. How they compare as distributions is [Distributions & Alternatives](/books/hosting-and-cloud/kubernetes-distributions-and-alternatives#lightweight-and-immutable) in the Kubernetes part.

GitOps is where a home cluster pays for itself. **Flux** ("a CNCF Graduated project") or **Argo CD** ("a declarative, GitOps continuous delivery tool for Kubernetes") watches a Git repository and reconciles the cluster to it, so the lab's whole state is a repository and a rebuilt cluster converges back to it. The practice is in the playbook's [GitOps](/docs/operations/kubernetes#gitops) and in [GitOps: The Deploy as a Pull](/books/hosting-and-cloud/platform-deploys#gitops-the-deploy-as-a-pull); [Packaging & GitOps](/books/hosting-and-cloud/packaging-and-gitops#argo-cd) owns Flux and Argo CD in depth; images for it come from the registries in [Artifacts & Registries](/books/hosting-and-cloud/artifacts-and-registries); and running CI and deploys from behind NAT is [Deploying From Home](/books/hosting-and-cloud/homelab-to-colocation#deploying-from-home). The cost is time: certificates, storage classes, ingress and upgrades are real work, and a household that just wants photos and a media server is served by Compose.

## Infrastructure as Code for the Lab

The provisioning layer has the same tools as a provider's, scaled down ([Infrastructure as Code](/docs/delivery/infrastructure-as-code)). For Proxmox, the maintained Terraform and OpenTofu provider is **bpg/proxmox** (MPL-2.0), published to both registries, targeting Proxmox VE 9.x (8.x with possible limitations, 7.x unsupported), authenticating with an API token, and needing SSH to the nodes "only for a few operations, such as uploading snippets." The older **Telmate/proxmox** provider (MIT) provisions QEMU VMs and LXC containers and lists known limitations in its README. Configuration inside the guests is Ansible's job: the **community.proxmox** collection manages VMs (`proxmox_kvm`), instances, storage, firewalls and backups, offers a `proxmox` inventory plugin, and connects into LXC containers through `pct` over SSH. The tools themselves are [Provisioning: Terraform, OpenTofu & the Alternatives](/books/hosting-and-cloud/terraform-and-opentofu#how-terraform-works-core-providers-and-the-graph) and [Push & Events: Ansible and Salt](/books/hosting-and-cloud/ansible-and-salt#how-an-ansible-run-works), later in the book.

A workable split: OpenTofu creates the VMs and LXCs with their datasets, Ansible installs Docker and drops the Compose files, and Compose (or Flux) runs the apps. State for a homelab fits in a local backend kept with the backups; the playbook's remote, locked state is the right answer as soon as more than one person applies.

## Backups

The rule is older than the homelab. US-CERT's *Data Backup Options* (Ruggiero and Heckathorn, 2012, citing Peter Krogh's *The DAM Book*) states it: "Keep 3 copies of any important file: 1 primary and 2 backups," "Keep the files on 2 different media types," and "Store 1 copy offsite." The playbook's [Backups](/docs/operations/disaster-recovery#backups) and [Restores Are What Matter](/docs/operations/disaster-recovery#restores-are-what-matter) own the general practice; at home it maps onto four tools.

- **ZFS snapshots and `zfs send`.** Snapshots are instant and cheap, and `zfs send` turns one into a stream; `-i` sends only the changes since an earlier snapshot and `-I` includes the intermediates, so a second box receives nightly increments. Raw sends (`-w`) ship encrypted datasets "exactly as it exists on disk," so the receiver never holds the keys. Snapshots on the same pool are not a backup; replicated to another machine, they are one copy.
- **Proxmox Backup Server** (AGPL-3.0) backs up VMs, containers and hosts incrementally with deduplication, client-side AES-256-GCM encryption, SHA-256 integrity checks and sync to a remote PBS.
- **restic** (BSD-2-Clause) and **BorgBackup** (BSD-3-Clause) are deduplicating file-level backup programs with encryption. restic writes to local disks, SFTP, its REST server, S3 and S3-compatible storage, Backblaze B2, Azure, Google Cloud Storage or anything rclone reaches, and refuses an empty repository password by default; Borg stores to "any remote host accessible over SSH."
- **Object storage offsite.** Backblaze B2 is $6.95 per TB a month pay-as-you-go, with free egress up to three times average monthly storage, then $0.01 per GB, and the first 10 GB free (as of October 2026). A terabyte of photos offsite costs less than one Plex Pass month.

Two rules close the loop. **RAID is not a backup:** mirrors and parity survive a failed disk, and copy a deletion, a ransomware encryption or a corrupted database to every member instantly. **A backup that has never been restored is a hope:** schedule a restore, of one app's data into a scratch VM or a test dataset, and record that it worked.

## The Offline Internet

A homelab with a few terabytes free can hold a working copy of the reference internet. The reasons are practical: an outage (ISP, power, a regional disaster) takes the cloud away exactly when reference material is most useful; travel and remote places have expensive or no connectivity; and preservation, because pages, documentation versions and whole sites disappear, and a dated local copy is the only one under your control.

**Kiwix and ZIM files.** Kiwix, "a nonprofit organisation making free knowledge accessible where the Internet is not," packages websites as ZIM files, "highly compressed archives of web content," readable in its apps or served on a network by **kiwix-serve** ("HTTP daemon serving ZIM files," GPLv3), which also ships as the `ghcr.io/kiwix/kiwix-serve` image: mount the ZIM directory at `/data`, publish port 8080, and pass file names or `'*.zim'`. Wikipedia comes in three flavours: **maxi**, "the default full version"; **nopic**, "full articles, but no images"; and **mini**, "only the introduction of each article, plus the infobox." Sizes from the Kiwix download library as of October 2026:

| ZIM file | Content | Size |
| --- | --- | --- |
| `wikipedia_en_all_maxi_2026-08` | English Wikipedia, full with images | 119 GB |
| `wikipedia_en_all_nopic_2026-06` | English Wikipedia, full text, no images | 49 GB |
| `wikipedia_en_all_mini_2026-09` | English Wikipedia, introductions and infoboxes | 13 GB |
| `wiktionary_en_all_nopic_2026-08` | English Wiktionary, no images (the only English build listed) | 8.5 GB |
| `stackoverflow.com_en_all_2026-07` | Stack Overflow, all questions and answers | 107 GB |
| `superuser.com_en_all_2026-10` | Super User | 3.7 GB |
| `serverfault.com_en_all_2026-10` | Server Fault | 1.5 GB |
| `gutenberg_en_all_2025-11` | Project Gutenberg, English | 206 GB |
| `gutenberg_mul_all_2025-11` | Project Gutenberg, all languages | 236 GB |

The suffix is the build month, and new builds replace old ones on a schedule, so the library is a dated snapshot that needs its own refresh job, like any other mirror.

**Internet-in-a-Box** bundles the offline internet as one installable: content packs from Kiwix, OER2Go and Archive.org; YouTube and Vimeo learning videos; "almost 40 powerful apps" for teachers and students, including Kolibri, Moodle and Nextcloud; and OpenStreetMap and satellite maps by region. Its most popular target is a Raspberry Pi, and the software is free and open source on GitHub.

**Offline maps.** Geofabrik publishes OpenStreetMap extracts "normally updated every day"; as of October 2026 the North America extract is 18.2 GB, Europe 32.9 GB, the United States 11.4 GB and California 1.2 GB in `.osm.pbf`. Raw OSM data needs rendering into tiles. **tileserver-gl** serves vector tiles from MBTiles files to MapLibre GL JS, Leaflet and OpenLayers, with server-side raster rendering by MapLibre GL Native in its full image (`maptiler/tileserver-gl`) and a light image without it. **PMTiles**, from Protomaps, is "a single-file archive format for pyramids of tiled data" that clients read with HTTP range requests, so a static file server or the NAS serves a map with no tile server at all. On phones, **Organic Maps** (Apache 2.0) "supports 100% of features without an active Internet connection," and **OsmAnd** carries "fully offline maps of any region" with offline navigation, both from OpenStreetMap data.

**Offline developer docs.** **DevDocs** (MPL-2.0) has an offline mode that downloads documentation sets into the browser, and a self-hosted image, `ghcr.io/freecodecamp/devdocs`, "built and updated monthly with the latest documentation." **Zeal** is "an offline documentation browser" for Windows and Linux using Dash's docsets (981 as of October 2026). Stack Overflow in Kiwix covers the questions the docs don't.

**ArchiveBox** (MIT) is the personal web archive: feed it URLs, bookmarks, browser history or RSS, and it saves each page as HTML, a SingleFile copy, PDF, PNG screenshot, WARC and media via yt-dlp, so a page you cited survives the site that hosted it. It installs with Docker Compose.

**Local models over the corpus.** A Wikipedia ZIM and a local model make an offline assistant: a model running at home answers against the archive through retrieval, citing the article it read rather than its training data. The pipeline (chunk, embed, store vectors, retrieve) is [Local RAG and Agents](/books/hosting-and-cloud/ai-at-home#local-rag-and-agents) and the serving stack is [How to Build It](/books/hosting-and-cloud/ai-at-home#how-to-build-it) in AI at Home. The ZIM stays the source of truth; the vector index is a rebuildable cache over it.

## The Alternatives

| Layer | Options | Strengths | Failure modes | Cost and licensing |
| --- | --- | --- | --- | --- |
| **App runtime** | Compose in Git; Portainer; Unraid CA; TrueNAS apps; LXC | Compose: portable, diffable; app stores: fastest start | App stores keep config on the box; LXC shares the kernel | Free; Unraid OS from $49 |
| **Orchestration** | Compose; k3s; Talos; Flux or Argo CD | Kubernetes: GitOps, self-healing, transferable skill | Kubernetes: certificates, storage and upgrades are your job | Free, open source |
| **Media** | Plex; Jellyfin; Emby | Plex: clients everywhere; Jellyfin: nothing paywalled | Plex: remote viewers pay; Jellyfin: volunteer capacity | Plex Pass, Remote Watch Pass; Jellyfin free; Emby Premiere |
| **Photos** | Immich; Nextcloud | Immich: purpose-built, stable since 2.0 | The only copy of irreplaceable data | AGPL; optional key |
| **Files** | Nextcloud | Sync, sharing, office and calendars in one | A platform to upgrade carefully | AGPL; Enterprise per user |
| **Passwords** | Vaultwarden | Small; official Bitwarden clients | Unofficial; a lockout if it is down and unbacked | AGPL, free |
| **Home automation** | Home Assistant | Integrations, local control | Container installs update by hand and lack apps | Apache-2.0; Link optional |
| **Provisioning** | bpg/proxmox with OpenTofu or Terraform; Ansible | The lab rebuilds from code | State and secrets to keep safe | MPL-2.0, free |
| **Backups** | ZFS replication; Proxmox Backup Server; restic or Borg to object storage | Snapshots fast, PBS VM-aware, object storage offsite | Untested restores; RAID mistaken for a backup | Free tools; B2 $6.95 per TB a month |

## My Default

My default is Compose files in a Git repository, one Docker VM (or one LXC per single-binary service) on Proxmox, every app on a shared network behind one reverse proxy, and data in named volumes bound to ZFS datasets so that snapshots and replication are per app. The core set is Jellyfin for media, Immich for photos, Vaultwarden for passwords and Home Assistant OS in its own VM. I'd pick Plex instead of Jellyfin when the household's TVs need its clients and the server owner holds a Plex Pass, since that covers every remote viewer of the server. I'd add k3s or Talos with Flux only when learning Kubernetes is the goal, and I'd keep the password vault and the photo library on Compose even then, because the apps whose loss hurts most should depend on the fewest moving parts.

For backups: hourly or daily ZFS snapshots, nightly replication to a second machine, Proxmox Backup Server for the VMs, and restic to object storage for the datasets nobody else has a copy of, with a quarterly restore that someone actually performs. What would change this: a household with no appetite for operations, where the paid convenience tier (Home Assistant Link, a hosted password manager, a cloud photo plan) costs less than the hours; or a lab built to learn, where Kubernetes everywhere is the point.

## How to Build It

The core data model gets no provider tables from this chapter. The self-hosted equivalent of a provider's resource inventory is a repository: one directory per stack, a Compose file, an inventory listing what each app holds and how it is backed up.

```text
homelab/
  inventory.yaml        # every app, its data and its backup class
  proxy/compose.yml     # the reverse proxy and the shared network
  media/compose.yml
  vault/compose.yml
  tofu/                 # bpg/proxmox: VMs, LXCs
  ansible/              # Docker hosts, files, users
```

The proxy owns an external network every stack joins, so no app publishes ports on the host; how the proxy terminates TLS and what reaches it from outside is [Exposing Home Services](/books/hosting-and-cloud/exposing-home-services). Named volumes bind to datasets so each app's data is a ZFS dataset with its own snapshots:

```yaml
# media/compose.yml: Jellyfin on the proxy network, data on ZFS datasets.
# Created once: docker network create proxy; zfs create tank/apps/jellyfin
services:
  jellyfin:
    image: jellyfin/jellyfin:${JELLYFIN_VERSION}   # pinned in .env; an update is a commit
    volumes:
      - jellyfin-config:/config
      - jellyfin-cache:/cache
      - /tank/media:/media:ro          # the library, read-only to the app
    networks: [proxy]                  # the proxy reaches jellyfin:8096 by name
    restart: unless-stopped

volumes:
  jellyfin-config:
    driver: local
    driver_opts: { type: none, o: bind, device: /tank/apps/jellyfin/config }
  jellyfin-cache:
    driver: local
    driver_opts: { type: none, o: bind, device: /tank/apps/jellyfin/cache }

networks:
  proxy:
    external: true
```

```yaml
# vault/compose.yml: Vaultwarden, the strictest app in the lab.
services:
  vaultwarden:
    image: vaultwarden/server:${VAULTWARDEN_VERSION}
    environment:
      DOMAIN: "https://vault.home.example"
      SIGNUPS_ALLOWED: "false"         # invite only, after the first account
    volumes:
      - vault-data:/data
    networks: [proxy]
    restart: unless-stopped

volumes:
  vault-data:
    driver: local
    driver_opts: { type: none, o: bind, device: /tank/apps/vaultwarden }

networks:
  proxy:
    external: true
```

Versions live in each stack's `.env`, pinned to a release rather than `latest`, so an update is a reviewed commit. The inventory is what turns a pile of containers into something you can audit and restore:

```yaml
# inventory.yaml: one entry per app; the backup class sets the schedule below.
apps:
  - name: vaultwarden
    stack: vault
    datasets: [tank/apps/vaultwarden]
    holds: irreplaceable        # irreplaceable | rebuildable | cache
    backup_class: critical
    exposure: proxy-allowlist   # none | lan | proxy-allowlist | public
    restore_tested: 2026-10-01
  - name: immich
    stack: photos
    datasets: [tank/apps/immich, tank/photos]
    holds: irreplaceable
    backup_class: critical
    exposure: proxy-allowlist
    restore_tested: 2026-09-15
  - name: jellyfin
    stack: media
    datasets: [tank/apps/jellyfin/config]   # the media library is its own class
    holds: rebuildable
    backup_class: standard
    exposure: proxy-allowlist
    restore_tested: 2026-07-20
  - name: kiwix
    stack: offline
    datasets: [tank/zim]
    holds: rebuildable          # re-downloadable, but slowly; keep one local copy
    backup_class: none
    exposure: lan
    restore_tested: null
```

The schedule follows the classes, and it is what makes the 3-2-1 rule true for the data that needs it:

| Backup class | What | Local copy | Second machine | Offsite | Retention | Restore test |
| --- | --- | --- | --- | --- | --- | --- |
| **critical** | Vault, photos, documents, Home Assistant | ZFS snapshots hourly | `zfs send -i` nightly, raw if encrypted | restic to object storage nightly | 48 hourly, 30 daily, 12 monthly | Quarterly, into a scratch VM |
| **standard** | App configs and databases | ZFS snapshots daily | `zfs send -i` nightly | restic weekly | 14 daily, 6 monthly | Twice a year |
| **VMs** | Proxmox VMs and LXCs | Proxmox Backup Server nightly | PBS sync to a remote PBS weekly | None, or restic of the PBS datastore | PBS prune: 7 daily, 4 weekly, 6 monthly | Restore one VM a quarter |
| **none** | Media library, ZIM files, caches | Snapshots optional | None | None | n/a | Re-download plan written down |

Media and ZIM files are rebuildable by definition, but the "none" class is a decision, not a default: if a library would take months to rebuild, it moves up a class and gets at least a second machine.

## What This Means for the System You Build

- **Make the Compose file the source of truth** and keep it in Git; dashboards and app stores are views, not records.
- **Give every app's data its own dataset,** so snapshots, replication and restores are per app.
- **Classify data as irreplaceable, rebuildable or cache** before choosing a backup schedule.
- **Follow 3-2-1 for the irreplaceable class,** with one copy offsite and encrypted, and remember RAID protects against disks, not mistakes.
- **Test restores on a schedule** and record the date in the inventory.
- **Pick media and photo servers by funding model as well as features:** a company can change prices and remote-access rules, and a volunteer project can lose its maintainers.
- **Use Kubernetes at home to learn it,** not to run the apps whose loss would hurt most.
- **Keep a dated offline copy** of the reference material you would want during an outage, with a refresh job like any other mirror.

## References

**Packaging and orchestration**

- [Docker Docs: History and development of Docker Compose](https://docs.docker.com/compose/intro/history/), v1 in 2014, v2 announced in 2020 in Go as `docker compose`, the Compose Specification, v5 in 2025
- [InfoQ: Docker Acquires Orchard](https://www.infoq.com/news/2014/07/docker-acquires-orchard), July 23, 2014, Fig and multi-container YAML
- [GitHub: docker/compose 1.1.0](https://github.com/docker/compose/releases/tag/1.1.0), "Fig has been renamed to Docker Compose"
- [GitHub: docker/compose v2.0.0](https://github.com/docker/compose/releases/tag/v2.0.0), the v2 release and compose-switch
- [Portainer Docs](https://docs.portainer.io/), Community and Business Editions and supported environments
- [GitHub: portainer/portainer](https://github.com/portainer/portainer), zlib license
- [Portainer: Pricing](https://www.portainer.io/pricing), Business Edition plans and the Home & Student license
- [Unraid: Community Apps](https://unraid.net/community/apps), the catalog, community maintenance and plugins
- [Unraid: Buy](https://account.unraid.net/buy), license tiers and prices
- [TrueNAS 24.10 release notes](https://www.truenas.com/docs/scale/24.10/gettingstarted/scalereleasenotes/), October 29, 2024, apps from Kubernetes to Docker and Compose YAML custom apps
- [TrueNAS Community Edition](https://www.truenas.com/truenas-community-edition/), free download and app services
- [Proxmox VE: Linux Container](https://pve.proxmox.com/wiki/Linux_Container), shared kernel, unprivileged containers, `pct`
- [Proxmox VE Admin Guide: Proxmox Container Toolkit](https://pve.proxmox.com/pve-docs/chapter-pct.html), nesting in a QEMU VM and OCI application containers as a technology preview
- [K3s Documentation](https://docs.k3s.io/), binary size, bundled components and datastores
- [GitHub: k3s v0.1.0](https://github.com/k3s-io/k3s/releases/tag/v0.1.0), the initial release
- [Sidero Labs: Talos Linux](https://www.siderolabs.com/talos-linux/), immutable, API-driven, no SSH or shell, MPL-2.0
- [Flux](https://fluxcd.io/), a CNCF Graduated project
- [Argo CD Documentation](https://argo-cd.readthedocs.io/en/stable/), declarative GitOps for Kubernetes

**Infrastructure as code**

- [GitHub: bpg/terraform-provider-proxmox](https://github.com/bpg/terraform-provider-proxmox), supported Proxmox VE versions, OpenTofu registry, API token and SSH, MPL-2.0
- [GitHub: Telmate/terraform-provider-proxmox](https://github.com/Telmate/terraform-provider-proxmox), QEMU VMs and LXC, MIT, known limitations
- [Ansible: community.proxmox](https://docs.ansible.com/ansible/latest/collections/community/proxmox/index.html), modules, inventory and connection plugins

**Apps**

- [Home Assistant: Thinking Big](https://www.home-assistant.io/blog/2018/09/17/thinking-big/), September 17, 2018, Nabu Casa and the $5 a month cloud
- [Home Assistant: Installation](https://www.home-assistant.io/installation/), Home Assistant OS and Container
- [Home Assistant: Deprecating Core and Supervised](https://www.home-assistant.io/blog/2025/05/22/deprecating-core-and-supervised-installation-methods-and-32-bit-systems/), May 22, 2025, end of support in 2025.12
- [Home Assistant Analytics](https://analytics.home-assistant.io/), active installations and the opt-in estimate, October 2026
- [GitHub: home-assistant/core](https://github.com/home-assistant/core), Apache-2.0
- [Nabu Casa: Pricing](https://www.nabucasa.com/pricing/), Home Assistant Link price and features
- [Plex: Important 2025 Plex Updates](https://www.plex.tv/blog/important-2025-plex-updates/), April 29, 2025 prices and remote playback, and the April 29, 2026 device extension
- [Android Authority: Plex Remote Watch Pass price increase](https://www.androidauthority.com/plex-remote-watch-pass-price-increase-3663060/), May 4, 2026, $2.99 and $29.99 from June 1, 2026, Plex Pass unchanged
- [Plex Forum: New Lifetime Plex Pass Pricing](https://forums.plex.tv/t/new-lifetime-plex-pass-pricing/938910), May 18, 2026, $749.99 from July 1, 2026
- [Jellyfin: About](https://jellyfin.org/docs/general/about), the Emby fork and no premium features
- [GitHub: jellyfin/jellyfin](https://github.com/jellyfin/jellyfin), GPL-2.0
- [Linuxiac: Jellyfin loses project leader and core team member](https://linuxiac.com/jellyfin-loses-project-leader-and-core-team-member-in-major-shake-up/), July 21, 2026, the departures
- [Emby Premiere](https://emby.media/premiere.html), prices, device limit and features
- [Immich: Stable release](https://immich.app/blog/stable-release), October 1, 2025, first commit, releases, semver, funding
- [Immich: Immich joins FUTO](https://immich.app/blog/immich-joins-futo), May 1, 2024, full-time team, AGPL without a CLA
- [GitHub: immich-app/immich](https://github.com/immich-app/immich), AGPL-3.0 and the 3-2-1 warning
- [Phoronix: ownCloud forked to Nextcloud](https://www.phoronix.com/news/OwnCloud-Forked-To-NextCloud), June 2, 2016
- [GitHub: nextcloud/server](https://github.com/nextcloud/server), AGPL-3.0
- [Nextcloud: Pricing](https://nextcloud.com/pricing/), Enterprise per-user prices
- [GitHub: dani-garcia/vaultwarden](https://github.com/dani-garcia/vaultwarden), Rust, Bitwarden client compatibility, AGPL-3.0, affiliation statement
- [GitHub: vaultwarden 1.21.0](https://github.com/dani-garcia/vaultwarden/releases/tag/1.21.0), the rename and its reason

**Backups**

- [US-CERT: Data Backup Options](https://www.cisa.gov/sites/default/files/publications/data_backup_options.pdf), Ruggiero and Heckathorn, 2012, the 3-2-1 rule and its source
- [OpenZFS: zfs-send](https://openzfs.github.io/openzfs-docs/man/master/8/zfs-send.8.html), full, incremental and raw streams
- [Proxmox Backup Server: Introduction](https://pbs.proxmox.com/docs/introduction.html), deduplication, client-side encryption, remote sync, AGPLv3
- [restic: Preparing a new repository](https://restic.readthedocs.io/en/stable/030_preparing_a_new_repo.html), backends and the password requirement
- [restic](https://restic.net/), BSD 2-Clause
- [BorgBackup Documentation](https://borgbackup.readthedocs.io/en/stable/), deduplication, encryption, SSH remotes, BSD 3-Clause
- [Backblaze: B2 Cloud Storage pricing](https://www.backblaze.com/cloud-storage/pricing), $6.95 per TB a month, egress terms, free 10 GB, October 2026

**The offline internet**

- [Kiwix](https://kiwix.org/en/), the nonprofit and its offline tools
- [Kiwix: FAQ](https://get.kiwix.org/en/faq/), ZIM archives and the mini, nopic and maxi flavours
- [Kiwix download library: Wikipedia](https://download.kiwix.org/zim/wikipedia/), English ZIM names and sizes, October 2026
- [Kiwix download library: Wiktionary](https://download.kiwix.org/zim/wiktionary/), English nopic builds
- [Kiwix download library: Stack Exchange](https://download.kiwix.org/zim/stack_exchange/), Stack Overflow, Super User and Server Fault builds
- [Kiwix download library: Project Gutenberg](https://download.kiwix.org/zim/gutenberg/), English and multilingual builds
- [GitHub: kiwix/kiwix-tools](https://github.com/kiwix/kiwix-tools), kiwix-serve and GPLv3
- [GitHub: kiwix-serve Docker image](https://github.com/kiwix/kiwix-tools/blob/main/docker/server/README.md), `/data`, port 8080 and globbing
- [Internet-in-a-Box](https://internet-in-a-box.org/), content packs, apps, maps and Raspberry Pi hardware
- [Geofabrik downloads](https://download.geofabrik.de/), continent extract sizes and daily updates
- [Geofabrik: United States](https://download.geofabrik.de/north-america/us.html), US and California extract sizes, October 2026
- [GitHub: maptiler/tileserver-gl](https://github.com/maptiler/tileserver-gl), MBTiles serving, MapLibre GL Native rendering, images
- [Protomaps: PMTiles](https://docs.protomaps.com/pmtiles/), single-file tile archives over HTTP range requests
- [Organic Maps](https://organicmaps.app/), offline OpenStreetMap app, Apache 2.0
- [OsmAnd](https://osmand.net/), offline maps and navigation
- [GitHub: freeCodeCamp/devdocs](https://github.com/freeCodeCamp/devdocs), offline mode, Docker image, MPL-2.0
- [Zeal](https://zealdocs.org/), offline documentation browser and docset count
- [GitHub: ArchiveBox](https://github.com/ArchiveBox/ArchiveBox), inputs, output formats, MIT, Docker Compose install
