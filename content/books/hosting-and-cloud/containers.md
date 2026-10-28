+++
title = "From chroot to Containers"
description = "Forty years of OS-level isolation, from chroot and jails to namespaces, cgroups, Docker and OCI, and what a provider sells when it runs containers."
category = "Hosting & Cloud Industry"
order = 2119
part = "The Stack, Bottom to Top"
tags = ["containers", "history", "isolation", "oci", "registries"]
+++

A container is a process the kernel lies to. It sees its own root filesystem, its own process tree, its own hostname, its own network interfaces and its own share of CPU and memory, and none of it is a separate machine: every container on a host runs on the same kernel, and the walls between them are bookkeeping inside that kernel. That's the source of everything good and bad about containers for a hosting business. Because there's no second kernel and no emulated hardware, a container starts as fast as a process and costs little more than one, so a provider can pack far more of them onto a server than virtual machines. Because there's one kernel, a kernel bug is a wall between every tenant on the host, and the provider has to decide whose code is allowed to share one.

The idea is older than the cloud by a quarter century. A root directory that a process can't climb out of appeared in Unix in 1979; FreeBSD turned it into a hosting product in 2000; Solaris, Virtuozzo and OpenVZ sold whole virtual servers on one kernel in the early 2000s; and Linux spent from 2002 to 2016 merging the namespaces and control groups that made it possible on a stock kernel. Docker, in 2013, added no isolation at all. It added the image: a layered, content-addressed filesystem built from a text file, pushed to a registry and pulled anywhere, which made the container the unit of deployment and the registry a product. This chapter tells that history, the kernel machinery a provider runs underneath, the open specifications that let one company's image run on another's runtime, and the provider's side: container services, registries, and the shared kernel as a tenancy decision. How to build and run images well (rebuild instead of repair, minimal bases, non-root, read-only filesystems, signing) is the playbook's [Containers](/docs/delivery/containers) doc, and this chapter doesn't repeat it.

## How the Providers Do It

Every provider that sells "containers" sells one of two things: a scheduler that places the customer's containers on machines the customer pays for, or a service that runs a container image on capacity the provider owns and bills for the container's own size and time. The difference shows in the isolation boundary each documents, as of October 2026:

| Provider and product | What the customer brings | Isolation boundary the provider documents | Unit of sale |
| --- | --- | --- | --- |
| **Amazon ECS on EC2** | Images, task definitions, and its own EC2 instances as capacity | The customer's instances; containers placed on one instance share its kernel | EC2 instance-hours; the scheduler had "no additional charge" at launch |
| **AWS Fargate** | Images and task definitions only | "Each Fargate task has its own isolation boundary and does not share the underlying kernel, CPU resources, memory resources, or elastic network interface with another task" | Task CPU and memory over time |
| **Google Cloud Run** | An image (or source) and a service or job definition | First generation "based on gVisor"; second generation a microVM with "full Linux compatibility"; jobs and worker pools only use the second | Requests or instance time, CPU and memory |
| **Azure Container Instances** | An image and a container group | "As isolated in a container as it would be in a VM" (hypervisor-level security); confidential containers in a hardware trusted execution environment | Per-second core and memory usage |
| **Fly.io Machines** | An image, run as a Machine through a REST API | Firecracker microVMs, "based on strong hardware virtualization" | Per-second while running |
| **Cloudflare Containers** | An image, started on demand from a Worker through a Durable Object | "Each container instance runs in a Firecracker microVM with its own kernel and network" | Workers Paid plan add-on |
| **Kubernetes services** | Pods on a cluster the provider operates | Shared node kernel by default; a sandboxed runtime per pod where offered (GKE Sandbox runs gVisor) | Nodes, or pods on provider capacity (the Kubernetes part) |

Three patterns run through the table:

- **Nobody who runs strangers' containers shares a kernel between them.** Fargate, Cloud Run, Container Instances, Fly.io and Cloudflare all put a virtual machine or a user-space kernel between one customer's container and another's. The shared kernel survives where the customer owns the hosts (ECS on EC2, a customer's Kubernetes nodes), because then the only tenant on the kernel is the customer. The mechanisms behind those walls are [Sandboxes & MicroVMs](/books/hosting-and-cloud/sandboxes-and-microvms).
- **The image is the contract, not the runtime.** Every row takes an OCI or Docker image and none of them runs Docker. The open image and distribution specifications are why a customer's build pipeline doesn't care which provider runs the result.
- **"Serverless containers" is a billing model.** Fargate, Cloud Run, Container Instances and Fly.io bill the container's declared size for the time it runs, per second or finer, and the provider owns the bin-packing problem the customer used to own. That moves utilization risk from the customer to the provider, which is why those products price above the equivalent VM and why the scheduler underneath them is the provider's real product ([Schedulers: Borg to Kubernetes](/books/hosting-and-cloud/schedulers)).

## How It Got Here

### 1979 to 1982: chroot

`chroot` changes the directory a process treats as `/`. It is in Seventh Edition Unix, released in 1979: system call 61 in V7's `sysent.c`. The date often quoted, March 18, 1982, is something else. Kamp and Watson's jail paper quotes Kirk McKusick: "According to the SCCS logs, the chroot call was added by Bill Joy on March 18, 1982," and McKusick's best guess was that it let Joy build 4.2BSD inside its own tree. That's the date chroot entered BSD's source history, not the date it was invented.

**What it solved:** a filesystem view a process can't see past, which became the standard way to confine an anonymous FTP server or a build. **What it cost:** nothing beyond the filesystem was confined. A process inside a chroot shares the process table, the network and every user ID with the host, and root inside one isn't confined at all. It is still in use as one layer among several: Google's Borg paper names "a Linux chroot jail" as Borg's primary isolation between tasks on a machine, and Firecracker's jailer chroots each microVM's monitor ([Sandboxes & MicroVMs](/books/hosting-and-cloud/sandboxes-and-microvms)).

### 2000: jails, built for hosting

FreeBSD 4.0 added the `jail` system call in 2000. Poul-Henning Kamp and Robert Watson's paper, "Jails: Confining the omnipotent root," says what it was for: letting an administrator hand a customer a virtual environment with its own root while keeping that root away from the host and from other jails. Root inside a jail is confined: its system calls are restricted and it can't touch processes outside the jail. Hosting was the motivating case, and the paper's examples are delegating services like Apache, BIND and sendmail.

**What it solved:** root for the customer without root on the server. **What it cost:** one kernel for everyone, and a FreeBSD-only mechanism in a market that went to Linux.

### 2001 to 2005: virtual servers on one kernel

Commercial vendors took the same idea further. Sun's Solaris Zones (Price and Tucker, LISA 2004) gave Solaris "multiple application environments rather than multiple operating system instances," with resource controls and observability built in. On Linux, Virtuozzo for Linux shipped in January 2002 and its core was released as OpenVZ under the GPL in 2005, and Linux-VServer offered the same model. Both carried their own kernel patches for separate process tables, network stacks and resource accounting, and they made the early VPS market: many low-cost virtual private servers were containers sold as machines, a story [Virtualization & the VPS](/books/hosting-and-cloud/virtualization-and-vps) tells from the hypervisor side.

**What it solved:** dozens of customer "servers" with root on one machine at near-native speed. **What it cost:** out-of-tree kernels that lagged mainline, a vendor in the patch path for every kernel update, and the shared-kernel risk in every plan.

### 2002 to 2016: Linux merges the pieces

Mainline Linux absorbed the mechanisms one at a time. Michael Kerrisk's LWN series gives the versions: the mount namespace in 2.4.19 (2002), UTS and IPC namespaces in 2.6.19, PID namespaces in 2.6.24, network namespaces started in 2.6.24 and "largely completed by about Linux 2.6.29," and user namespaces "started in Linux 2.6.23 and completed in Linux 3.8" (early 2013). Control groups began as Paul Menage's "process containers" patches at Google in 2007 and merged in 2.6.24, released January 24, 2008, which kernelnewbies notes was so tools "such as OpenVZ and Vserver" could get separate process lists from the mainline kernel. Later kernels added the cgroup namespace (4.6) and the time namespace (5.6). The second version of cgroups, a single unified hierarchy, was declared stable and mountable as `cgroup2` in Linux 4.5, released March 13, 2016.

LXC, whose repository begins with an "Initial revision" on August 6, 2008, packaged these into userspace tooling: namespaces, AppArmor or SELinux profiles, seccomp policies, `pivot_root`, capabilities and cgroups, "something in the middle between a chroot and a full fledged virtual machine." It is still maintained, with LXC 5.0 supported to June 1, 2027 and 6.0 to June 1, 2029.

**What it solved:** containers on a stock kernel, so no vendor patch set and no lag behind mainline. **What it cost:** isolation assembled from a dozen independent features, each with its own bugs and its own defaults, which every runtime has to combine correctly.

### 2013 to 2014: Docker and the image

Solomon Hykes showed Docker in a PyCon lightning talk in March 2013; the first tag, `v0.1.0`, is dated March 26, 2013, and dotCloud, Inc. renamed itself Docker, Inc. on October 29, 2013. Docker began on LXC. Docker 0.9, on March 10, 2014, replaced it with libcontainer, a Go library calling namespaces, cgroups, capabilities and AppArmor directly ("as of Docker 0.9, LXC is now optional"), behind an execution-driver API whose list of possible backends included OpenVZ, systemd-nspawn, libvirt, qemu/kvm, BSD jails, Solaris Zones and chroot. Docker 1.0 shipped on June 9, 2014 alongside Docker Hub, the hosted registry, after 15 months, 8,741 commits and 2.75 million downloads by Docker's count.

What Docker added was the image. A Dockerfile is a recipe; each step produces a filesystem layer; layers are stacked, identified by a hash of their contents and shared between images that have them in common; and the result is pushed to a registry and pulled by any host. The isolation was the kernel's, the same as LXC's. The packaging was new, and it made the container the unit a team builds, tests and ships ([Containers](/docs/delivery/containers#rebuild-don-t-repair)).

**What it solved:** build once, run on any Linux host, with the dependencies inside the artifact. **What it cost:** a daemon running as root on every host, one company's format for everyone's artifacts, and a registry in the path of every deploy.

### 2015 to 2022: the format becomes a standard

The Open Container Initiative launched under the Linux Foundation on June 22, 2015, and Docker donated "its container format and runtime, runC" to it. OCI published the Runtime Specification v1.0 and the Image Format Specification v1.0 on July 19, 2017, and the Distribution Specification v1.0.0 in May 2021. The runtime moved down the stack at the same time: containerd, which Docker created in 2014 as the lower-level manager under the Docker engine, joined the CNCF in March 2017 and graduated on February 28, 2019. CRI-O, an implementation of Kubernetes' [Container Runtime Interface for the kubelet](/books/hosting-and-cloud/kubernetes-architecture#the-node-kubelet-and-the-container-runtime), joined the CNCF in April 2019 and graduated on July 19, 2023. Kubernetes removed dockershim from the kubelet in v1.24 (May 3, 2022): "After its deprecation in v1.20, the dockershim component has been removed from the kubelet."

**What it solved:** an image is a standard artifact, so the build tool, the registry and the runtime can each come from a different vendor, and a provider can run customers' images with a runtime of its choosing, including one that boots a VM ([Sandboxes & MicroVMs](/books/hosting-and-cloud/sandboxes-and-microvms)). **What it cost:** a stack of components (a CLI, a builder, containerd or CRI-O, runc or a sandbox runtime) where there used to be one binary, and the support question of which layer failed.

### 2013 on: rootless

User namespaces, complete in Linux 3.8, map root inside a container to an unprivileged user outside it. That lets the runtime itself run without root: Docker's rootless mode "lets you run the Docker daemon and containers as a non-root user," with both daemon and containers inside a user namespace, and its setup tool ships in Docker 20.10 and later packages. Podman, "a daemonless, open source, Linux native tool," runs containers by root or by a non-privileged user with no daemon at all. For a provider this is defense in depth on hosts it controls; it doesn't change the fact that the kernel is shared.

## The Kernel Machinery

A provider operating containers runs five mechanisms underneath every one, and each one is a configuration it owns:

| Mechanism | What it isolates or limits | The provider's decision |
| --- | --- | --- |
| **Namespaces** | Mount, PID, network, UTS, IPC, user, cgroup and time views (`CLONE_NEWNS`, `CLONE_NEWPID` and the rest) | Which to unshare. A user namespace is what makes root inside the container unprivileged outside |
| **Control groups** | CPU, memory, I/O, process count and cpusets, with v2's single hierarchy | The limit on every container, and therefore how far the host is oversold |
| **Capabilities** | Root's powers split into units (`CAP_NET_ADMIN`, `CAP_SYS_ADMIN`) | Which to drop by default; a privileged container gets them all and is effectively the host |
| **seccomp** | Which system calls a process may make | The default filter, and whether customers may relax it |
| **LSMs (AppArmor, SELinux)** | Mandatory access control over files and operations | One profile for every tenant, or per workload |

Control groups v2 matter to a provider in two specific ways. The kernel's documentation makes the hierarchy single and enforces the "no internal process" rule: a non-root group can hand resources to children only if it holds no processes itself, so a provider's hierarchy is a tree of accounts, services and containers with processes only at the leaves. And v2 supports delegating a subtree to a less privileged user or to a cgroup namespace, so a customer can manage limits inside its own slice without being able to raise the slice's limits. The memory controller tracks kernel data structures and socket buffers as well as user memory, which is what keeps one tenant's connection storm from exhausting the host. CloudLinux's per-account limits on shared hosting servers run on the same machinery ([Shared Hosting Isolation](/books/hosting-and-cloud/shared-hosting-isolation)).

Oversell is a property of these settings. A container's request is what the scheduler reserves; its limit is what the kernel enforces; the gap between the sum of limits and the size of the host is the provider's bet that tenants don't peak together. Borg's paper puts numbers on the bet: prod jobs in a representative cell were allocated about 70% of CPU and used about 60%, and about 20% of the workload in a median cell ran on resources reclaimed from what other tasks had reserved but weren't using. CPU is compressible (a tenant over its share gets throttled), memory isn't (a tenant over its limit gets killed), and the provider's defaults should follow that difference.

## The Image and the Registry

An OCI image is four things. The **manifest** is "a document describing the components that make up a container image": a config and a list of layers, each named by a descriptor with its media type, size and content digest. The **layers** are filesystem changesets unpacked in order. The **configuration** holds the entrypoint, environment and layer order. An **image index** lists manifests for different platforms, so one name resolves to an `amd64` or an `arm64` image as the host requires. Everything is content-addressed, so a digest names exactly one set of bytes and a host can verify what it pulled.

The **runtime specification** defines the bundle a runtime receives (a root filesystem plus `config.json`), the execution environment and the lifecycle (create, start, kill, delete), with platform sections for Linux, Windows, FreeBSD, Solaris, z/OS and VMs. The VM section is why a sandboxed runtime can stand in for runc without the rest of the stack noticing.

The **distribution specification**, based on the Docker Registry HTTP API V2, defines the registry: pull (required of every conforming registry), push, content discovery (tags and referrers) and content management (deletion, which a registry may disable). A tag is a mutable pointer to a manifest digest; a digest is immutable. Everything a provider records about what ran should name the digest, because the tag can move after the fact ([Containers](/docs/delivery/containers#building-images) on pinning by digest).

A registry is a provider product with its own economics, and the registries price the same three things differently, as of October 2026:

- **Docker Hub** limits pulls: 100 per IPv4 address or IPv6 /64 per six hours unauthenticated, 200 for a Personal account, and unlimited (fair use) on Pro, Team and Business. Enforcement first arrived in November 2020.
- **Amazon ECR**, generally available December 21, 2015, charges for storage ($0.10 per GB-month in the pricing page's example) and egress, with transfer into ECR and to services in the same Region free; public repositories give anonymous users 500 GB a month to the internet.
- **GitHub Container Registry** stores Docker and OCI images under `ghcr.io`, priced with GitHub Packages.

The pattern is that a registry gives away pushes and same-region pulls (which keep customers' compute in its cloud) and charges for storage and cross-network pulls. Pull limits, retention and egress in depth belong to [Artifacts & Registries](/books/hosting-and-cloud/artifacts-and-registries).

## The Shared Kernel as a Tenancy Decision

The multi-tenancy playbook frames [isolation models](/docs/architecture/multi-tenancy#isolation-models) as a trade between cost per tenant and strength of the wall. At the compute layer the same trade has four positions, and a provider has to pick one per product:

1. **Shared kernel, one customer per host.** Containers from many of one customer's services share a kernel; customers never share one. ECS on EC2, a customer's own Kubernetes nodes, and the first Lambda design ("Linux containers to isolate functions, and virtualization to isolate between customer accounts") all work this way. Density is limited by customer size: small customers strand most of a host.
2. **Shared kernel across customers, hardened.** Namespaces, user namespaces, a tight seccomp filter, dropped capabilities and LSM profiles, with many customers per kernel. Shared hosting has lived here for decades ([Shared Hosting Isolation](/books/hosting-and-cloud/shared-hosting-isolation)), and it's acceptable when the code is the provider's own or the customer's code is constrained (PHP behind a panel), not when customers bring arbitrary binaries.
3. **A user-space kernel per sandbox.** gVisor intercepts system calls so the host kernel sees a small, filtered set (Cloud Run's first generation, GKE Sandbox).
4. **A VM or microVM per sandbox.** Each tenant's container gets its own guest kernel on a hypervisor (Fargate, Cloud Run's second generation, Container Instances, Fly.io, Cloudflare Containers, Kata Containers).

Google's GKE Sandbox documentation states the risk in one line: containers running untrusted code "are a potential security risk to the host kernel of your nodes," and multi-tenant clusters running untrusted code "are more exposed to security vulnerabilities than other clusters." The Firecracker paper states the economics from the other side: the container approach forces a trade "between security and compatibility," because a container's security rests on limiting system calls, and a typical Ubuntu installation needs 224 system calls and 52 ioctls to run. Position 2 is a promise that the kernel's attack surface reachable through those calls has no exploitable bug, made on behalf of every tenant on the host. My rule is that a provider makes that promise only for code it wrote or code a runtime constrains, and moves to position 3 or 4 the moment customers can upload a binary.

The cost of the stronger walls is the subject of [Sandboxes & MicroVMs](/books/hosting-and-cloud/sandboxes-and-microvms): memory per sandbox, boot time and system-call overhead. The tenancy decision is recorded per resource there, in the `isolation` column this chapter's tables carry.

## The Alternatives

| Runtime approach | Model | Strengths | Failure modes | Licensing and ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **runc (or crun) under containerd or CRI-O** | Namespaces and cgroups on the host kernel, OCI runtime | Native speed, smallest overhead, the reference behavior | Kernel and runtime bugs are cross-tenant escapes; privileged mode undoes everything | OCI and CNCF projects, Apache 2.0 | Lowest | Single-tenant hosts, customers' own clusters |
| **Docker Engine** | A daemon and CLI over containerd and runc | Developer workflow, build and run in one tool | Root daemon unless rootless; the daemon is a single point of failure on the host | Moby is Apache 2.0, Docker-led | Low | Development, small single-host deployments |
| **Podman** | Daemonless; containers run by root or a non-privileged user | No root daemon | Same shared kernel | Apache 2.0, Containers project | Low | Rootless hosts and CI |
| **LXC and Incus** | System containers: a whole OS userland on the host kernel | VPS-like containers with init and services | Shared kernel; less tooling for application images | Open source; Incus is Apache 2.0 | Low | VPS and homelab hosts, system containers |
| **gVisor (`runsc`)** | User-space kernel per sandbox, OCI runtime | Small host-kernel surface, no hardware virtualization required | System-call-heavy workloads slow; some syscalls and `/proc` paths unsupported | Apache 2.0, Google-led | Medium | Cloud Run first generation, GKE Sandbox |
| **Kata Containers** | A lightweight VM per pod, OCI and CRI compatible | Container workflow with a hardware boundary | A guest kernel per pod costs memory and boot time | Apache 2.0, Open Infrastructure Foundation | Medium to high | Multi-tenant Kubernetes clusters |
| **Firecracker-based services** | A microVM per container, provider-built orchestration | Strongest density at a VM boundary | Provider-specific; not a drop-in runtime without firecracker-containerd | Apache 2.0, AWS-led | Medium | Fargate, Fly.io, Cloudflare Containers |

## My Default

My default is to run containers on the host kernel only where every container on that kernel belongs to the same customer, and to put every multi-tenant container product behind a VM boundary: a microVM per task or pod, with gVisor where nested virtualization isn't available or the provider runs inside someone else's VMs. The facts above make the case. Every provider that runs strangers' images (AWS, Google, Microsoft, Fly.io, Cloudflare) documents a VM or user-space kernel between tenants; the shared-kernel model's security rests on a system-call surface no provider can promise is bug-free; and the cost of a microVM has fallen to a few megabytes and a fraction of a second.

For the image and registry, I'd standardize on OCI images referenced by digest, built in CI and stored in a registry in the same region as the compute that pulls them, and I'd treat the public registry as an upstream to mirror, not a dependency in the deploy path, because its pull limits are per address and a provider's NAT pool is one address to the registry.

What would change this: a product where the provider writes all the code that runs (a managed database, a build cache) can share kernels safely and pocket the density; a customer large enough to fill hosts can be given dedicated hosts with plain runc; and a workload that needs GPUs or device passthrough may not run in the available sandboxes, which pushes it to whole VMs or bare metal.

## How to Build It

The chapter adds two side tables to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model): `container_services` for resources of kind `container_service`, and `images` for resources of kind `image`, both kinds already in the core `resources` CHECK. [Sandboxes & MicroVMs](/books/hosting-and-cloud/sandboxes-and-microvms#how-to-build-it) adds the `isolation` column to `container_services`; [Schedulers: Borg to Kubernetes](/books/hosting-and-cloud/schedulers#how-to-build-it) records where each instance was placed.

```sql
CREATE TABLE images (                    -- side table: kind = 'image'
  resource_id     UUID PRIMARY KEY REFERENCES resources (id),
  image_kind      TEXT NOT NULL CHECK (image_kind IN ('container', 'machine')),
  registry_id     UUID REFERENCES resources (id),   -- kind = 'registry'; null for machine images
  repository      TEXT,                  -- 'acme/api'; the registry's name for it
  digest          TEXT NOT NULL,         -- 'sha256:...'; the identity, never the tag
  media_type      TEXT NOT NULL,         -- OCI manifest or index media type
  platforms       TEXT[] NOT NULL,       -- 'linux/amd64', 'linux/arm64'; from the index
  size_bytes      BIGINT NOT NULL CHECK (size_bytes >= 0),
  origin          TEXT NOT NULL CHECK (origin IN ('customer_push', 'customer_build',
                    'provider_managed', 'public_mirror')),
  base_image_id   UUID REFERENCES resources (id),   -- kind = 'image', when known
  pushed_at       TIMESTAMPTZ NOT NULL,
  UNIQUE (registry_id, digest)
);

CREATE TABLE container_services (        -- side table: kind = 'container_service'
  resource_id      UUID PRIMARY KEY REFERENCES resources (id),
  run_model        TEXT NOT NULL CHECK (run_model IN ('service', 'job', 'machine')),
  capacity_mode    TEXT NOT NULL CHECK (capacity_mode IN ('provider_managed',
                     'customer_nodes')),  -- Fargate-style vs on the customer's own hosts
  cluster_id       UUID REFERENCES resources (id),  -- kind = 'cluster', for customer_nodes
  image_id         UUID NOT NULL REFERENCES resources (id),  -- kind = 'image'
  image_digest     TEXT NOT NULL,        -- copied at deploy: what actually runs
  vcpu             NUMERIC(6,3) NOT NULL CHECK (vcpu > 0),
  memory_mb        INT NOT NULL CHECK (memory_mb > 0),
  ephemeral_gb     INT NOT NULL DEFAULT 0,
  min_instances    INT NOT NULL DEFAULT 0 CHECK (min_instances >= 0),  -- 0: scales to zero
  max_instances    INT CHECK (max_instances IS NULL OR max_instances >= min_instances),
  concurrency      INT,                  -- requests per instance, where the product routes them
  ingress          TEXT NOT NULL CHECK (ingress IN ('public', 'private', 'none')),
  privileged       BOOLEAN NOT NULL DEFAULT FALSE,
  CHECK ((capacity_mode = 'customer_nodes') = (cluster_id IS NOT NULL)),
  CHECK (NOT privileged OR capacity_mode = 'customer_nodes')
);

-- Usage: each running instance reports size-times-time, billed per second or finer.
-- usage_events.meter values: 'container.vcpu_seconds', 'container.memory_gb_seconds',
-- 'container.ephemeral_gb_seconds'; dimensions carry region and architecture.
```

Notes on the sketch:

- **The digest is the identity.** `images.digest` is unique per registry and `container_services.image_digest` is copied at deploy time, so "what was running at 14:02" has one answer even if the tag `latest` has moved three times since. Tag history is registry state owned by [Artifacts & Registries](/books/hosting-and-cloud/artifacts-and-registries).
- **Capacity mode decides who carries utilization.** A `customer_nodes` service bills nothing itself (the customer's VMs bill), while a `provider_managed` one meters vCPU and memory seconds; the same table holds both so the abuse desk, quotas and suspension treat them alike.
- **Privileged means dedicated.** The check forbids a privileged container on provider-managed capacity, because a privileged container holds every capability and is the host. A provider that sells privileged containers must sell them on hosts the customer owns or inside a VM.
- **Machine images live here too.** A VM boots from `images` rows of kind `machine`, which is the `virtual_machines.image_id` reference in the core model; [Baking Images: Packer](/books/hosting-and-cloud/packer-and-images) covers how they're built.
- **Events:** `image.pushed`, `image.deleted`, `container_service.deployed` (with the digest), `container_service.scaled` and `container_service.stopped` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the scheduler, billing and the abuse desk, which needs to map a reported URL or IP to the digest that served it.

## Auditing

- **What ran, by digest.** Every deploy's digest with the time it started and stopped, so a vulnerability disclosure ("which customers ran an image with this layer?") and an abuse report resolve to bytes, not tags ([Audit Trails](/docs/architecture/audit-trails)).
- **Isolation granted.** Which services ran privileged, with which capabilities added and which seccomp profile, and who approved the exception.
- **Image provenance.** The origin of every image (customer push, provider build, public mirror) and its base, so a compromised upstream image can be traced to every service built on it.
- **Registry access.** Pulls of private images by identity and source address, because a leaked registry credential shows up as pulls from somewhere new before it shows up anywhere else.

## What This Means for the System You Build

- **Treat the shared kernel as a tenancy boundary,** and let only one customer's code share a kernel unless the provider wrote the code.
- **Accept OCI images and run them with the runtime you choose,** so the sandbox can change underneath without the customer's pipeline noticing.
- **Record digests, never tags,** for everything that ran.
- **Set cgroup limits as product decisions:** the request is what you reserve, the limit is what you enforce, and the gap is your oversell.
- **Price the registry for what costs you:** storage and cross-network egress, with same-region pulls free to keep compute close.
- **Mirror public registries** so a pull limit on a shared address can't stop a deploy.

## References

**Papers and standards**

- [Kamp and Watson: Jails: Confining the omnipotent root](https://papers.freebsd.org/2000/phk-jails/), FreeBSD jails and their hosting motivation, 2000
- [FreeBSD jail paper, section 9: chroot history](https://docs-archive.freebsd.org/44doc/papers/jail/jail-9.html), McKusick on the March 18, 1982 SCCS entry
- [Price and Tucker: Solaris Zones](https://www.usenix.org/legacy/publications/library/proceedings/lisa04/tech/price.html), LISA 2004, application environments on one OS instance
- [Verma et al.: Large-scale cluster management at Google with Borg](https://research.google/pubs/large-scale-cluster-management-at-google-with-borg/), EuroSys 2015, chroot and cgroups as Borg's isolation, prod allocation and usage, reclaimed resources
- [Agache et al.: Firecracker: Lightweight Virtualization for Serverless Applications](https://www.usenix.org/conference/nsdi20/presentation/agache), NSDI 2020, Lambda's first isolation design and the system-call counts
- [OCI Image Format Specification](https://github.com/opencontainers/image-spec/blob/main/spec.md), manifest, index, layers, configuration and descriptors
- [OCI Runtime Specification](https://github.com/opencontainers/runtime-spec/blob/main/spec.md), configuration, lifecycle and platforms including VMs
- [OCI Distribution Specification](https://github.com/opencontainers/distribution-spec/blob/main/spec.md), pull, push, discovery and management categories, based on the Docker Registry HTTP API V2
- [Linux kernel documentation: Control Group v2](https://docs.kernel.org/admin-guide/cgroup-v2.html), the unified hierarchy, the no-internal-process rule, controllers and delegation

**Provider documentation**

- [TUHS: V7 sysent.c](https://www.tuhs.org/cgi-bin/utree.pl?file=V7/usr/sys/sys/sysent.c), chroot as system call 61 in Seventh Edition Unix
- [man7.org: namespaces(7)](https://man7.org/linux/man-pages/man7/namespaces.7.html), namespace types and the cgroup (4.6) and time (5.6) namespaces
- [LXC: Introduction](https://linuxcontainers.org/lxc/introduction/), features, positioning and LTS dates
- [GitHub: lxc/lxc](https://github.com/lxc/lxc), the initial revision on August 6, 2008
- [Podman documentation](https://docs.podman.io/en/latest/), daemonless containers run by root or a non-privileged user
- [Docker Docs: Rootless mode](https://docs.docker.com/engine/security/rootless/), daemon and containers as a non-root user in a user namespace
- [Docker Docs: Docker Hub usage and limits](https://docs.docker.com/docker-hub/usage/), pull limits per six hours
- [AWS: Amazon ECR pricing](https://aws.amazon.com/ecr/pricing/), storage, same-Region transfer and public repository allowances
- [GitHub Docs: Working with the Container registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry), Docker and OCI images under ghcr.io
- [AWS: Architect for AWS Fargate for Amazon ECS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html), the per-task isolation boundary
- [Google Cloud: Cloud Run execution environments](https://docs.cloud.google.com/run/docs/about-execution-environments), gVisor-based first generation and microVM second generation
- [Microsoft Learn: Azure Container Instances overview](https://learn.microsoft.com/en-us/azure/container-instances/container-instances-overview), hypervisor-level isolation, confidential containers and per-second billing
- [Fly.io: Architecture](https://docs.fly.io/architecture), Firecracker microVMs on hardware virtualization
- [Cloudflare: Containers architecture](https://developers.cloudflare.com/containers/platform-details/architecture/), a Firecracker microVM per container instance
- [Google Cloud: GKE Sandbox](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/sandbox-pods), gVisor for untrusted workloads and the shared-kernel risk

**Announcements and release notes**

- [LWN: Namespaces in operation, part 1](https://lwn.net/Articles/531114/), January 4, 2013, the kernel version of each namespace
- [LWN: Process containers](https://lwn.net/Articles/236038/), Paul Menage's 2007 patches that became cgroups
- [Kernel Newbies: Linux 2.6.24](https://kernelnewbies.org/Linux_2_6_24), control groups and PID and network namespaces, January 24, 2008
- [Kernel Newbies: Linux 4.5](https://kernelnewbies.org/Linux_4.5), the unified cgroup hierarchy declared stable, March 13, 2016
- [OpenVZ: History](https://wiki.openvz.org/History), Virtuozzo in January 2002 and OpenVZ in 2005
- [Solomon Hykes: The future of Linux Containers](https://www.youtube.com/watch?v=wW9CAH9nSLs), PyCon lightning talk, March 2013
- [GitHub: moby/moby tags](https://github.com/moby/moby/tags), Docker v0.1.0 on March 26, 2013
- [Docker: dotCloud is becoming Docker, Inc.](http://web.archive.org/web/20140604001631/http://blog.docker.com:80/2013/10/dotcloud-is-becoming-docker-inc/), October 29, 2013 (archived)
- [Docker: Docker 0.9, introducing execution drivers and libcontainer](https://www.docker.com/blog/docker-0-9-introducing-execution-drivers-and-libcontainer/), March 10, 2014
- [Docker: It's here, Docker 1.0](http://web.archive.org/web/20140614010625/http://blog.docker.com:80/2014/06/its-here-docker-1-0/), June 9, 2014, Docker Hub and the first 15 months' figures (archived)
- [Open Container Initiative: About](https://opencontainers.org/about/overview/), launched June 22, 2015, and Docker's donation of runC
- [Linux Foundation: OCI releases v1.0 of container standards](https://www.linuxfoundation.org/press/press-release/open-container-initiative-oci-releases-v1-0-of-container-standards), runtime and image specifications, July 19, 2017
- [GitHub: distribution-spec v1.0.0](https://github.com/opencontainers/distribution-spec/releases/tag/v1.0.0), May 2021
- [CNCF: containerd graduation](https://www.cncf.io/announcements/2019/02/28/cncf-announces-containerd-graduation/), February 28, 2019, created by Docker in 2014 and accepted in March 2017
- [CNCF: CRI-O graduation](https://www.cncf.io/announcements/2023/07/19/cloud-native-computing-foundation-announces-graduation-of-cri-o/), July 19, 2023, accepted in April 2019
- [Kubernetes: 1.24 release announcement](https://kubernetes.io/blog/2022/05/03/kubernetes-1-24-release-announcement/), dockershim removed, May 3, 2022
- [AWS News Blog: EC2 Container Registry now generally available](https://aws.amazon.com/blogs/aws/ec2-container-registry-now-generally-available), December 21, 2015
- [AWS News Blog: EC2 Container Service](https://aws.amazon.com/blogs/aws/cloud-container-management/), preview on November 13, 2014, scheduling on the customer's EC2 cluster at no extra charge
- [The Register: Docker pull rate limits enforced](https://www.theregister.com/2020/11/19/docker_pull_rate_enforced/), enforcement from November 2020
