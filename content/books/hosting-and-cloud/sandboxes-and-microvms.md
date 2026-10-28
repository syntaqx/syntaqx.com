+++
title = "Sandboxes & MicroVMs"
description = "How providers wall off strangers' code: Lambda's first design, Nitro, gVisor, Kata, Firecracker and Cloud Hypervisor, and their density, boot and syscall costs."
category = "Hosting & Cloud Industry"
order = 2121
part = "The Stack, Bottom to Top"
tags = ["isolation", "microvms", "firecracker", "gvisor", "multi-tenancy"]
+++

A provider that runs code it didn't write is betting the rest of its customers on the wall around that code. For two decades the industry had two walls to choose from. A virtual machine gave each tenant its own kernel on a hypervisor: strong, but each one cost hundreds of megabytes and seconds to boot, so it was priced by the hour and sold to customers who kept it running. A container shared the host's kernel: fast and cheap, but every tenant on the host shared one attack surface, the system-call interface of a general-purpose kernel. Functions and serverless containers needed something in between, a wall as strong as a VM at the cost of a process, created and destroyed per customer, per function, sometimes per request.

This chapter covers how that wall got built: AWS Lambda's first design (containers inside one VM per customer), the Nitro System that took the hypervisor's work off the host, gVisor's user-space kernel, Kata Containers, Firecracker and Cloud Hypervisor, and the wave of agent and code-execution sandboxes built on them. It sets out the isolation vocabulary the rest of this volume uses, explains how each mechanism works at operator depth, and measures them on the three costs that decide a provider's choice: memory per sandbox (density), time to start (boot), and overhead per system call. The hypervisors underneath (Xen, KVM, VMware) are [Virtualization & the VPS](/books/hosting-and-cloud/virtualization-and-vps); the shared-kernel container and why it isn't a tenancy boundary is [From chroot to Containers](/books/hosting-and-cloud/containers); the function products built on these walls are [Functions, Isolates & Edge Compute](/books/hosting-and-cloud/functions-and-edge-compute).

## How the Providers Do It

What each provider documents about the wall between tenants, as of October 2026:

| Provider and product | Isolation | Mechanism, as documented |
| --- | --- | --- |
| **AWS Lambda functions, AWS Fargate** | `microvm` | Firecracker on bare-metal EC2; one microVM per function slot; Fargate tasks don't share a kernel with another task |
| **AWS Lambda MicroVMs** (June 22, 2026) | `microvm` | "Built on Firecracker virtualization," up to 8 hours per microVM with suspend and resume, Arm (Graviton) only |
| **Amazon EC2** | `hardware_vm`, `bare_metal` | Nitro Hypervisor with I/O on Nitro Cards; bare metal instances with no hypervisor at all |
| **Google Cloud Run** | `user_space_kernel` (first generation), `microvm` (second) | First generation "based on gVisor"; second a microVM with "full Linux compatibility"; jobs only second generation |
| **Google Kubernetes Engine, GKE Sandbox** | `user_space_kernel` | gVisor for untrusted pods; Container-Optimized OS only; no privileged containers |
| **Azure Container Instances** | `hardware_vm` | "As isolated in a container as it would be in a VM"; confidential containers in a hardware TEE |
| **Fly.io Machines** | `microvm` | Firecracker microVMs on hosts with 8 to 32 cores and 32 to 256 GB of RAM |
| **Cloudflare Workers** | `language_isolate` | V8 isolates, many per process, in a process sandbox with namespaces and seccomp |
| **Cloudflare Containers and Sandbox SDK** | `microvm` | "Each container instance runs in a Firecracker microVM with its own kernel and network" |
| **Fastly Compute** | `wasm_sandbox` | WebAssembly on Wasmtime; "each request starts a new sandbox" by default |
| **Vercel Sandbox** | `microvm` | "Each sandbox runs in a secure Firecracker microVM with its own filesystem and network" |
| **E2B** | `microvm` | "Firecracker microVMs that resume from a snapshot, run untrusted agent code, and pause when the agent stops" |

Three patterns run through the table:

- **Firecracker became the industry's microVM.** AWS built it for Lambda and Fargate; Fly.io, Cloudflare's container products, Vercel's sandboxes and E2B run on it, and its project page lists Kata Containers and containerd integrations besides. One Apache-licensed VMM, written by one cloud, is now the common wall for everyone else's untrusted code.
- **Google chose a different wall first.** Cloud Run and GKE Sandbox started on gVisor, a user-space kernel that needs no hardware virtualization, and Cloud Run then added a microVM generation for workloads that need full Linux compatibility. Both walls are in production at one provider.
- **The weakest wall is chosen deliberately, for the narrowest code.** Isolates and Wasm sandboxes appear only where the platform also restricts the language (JavaScript and Wasm on Workers, Wasm on Fastly), and they buy start times measured in milliseconds or microseconds. A provider that lets customers bring binaries uses a VM boundary.

## How It Got Here

### 2014 to 2018: containers inside a VM per customer

The Firecracker paper (Agache et al., NSDI 2020) states Lambda's original design directly: "When we first built AWS Lambda, we chose to use Linux containers to isolate functions, and virtualization to isolate between customer accounts. In other words, multiple functions for the same customer would run inside a single VM, but workloads for different customers always run in different VMs." AWS was "unsatisfied with this approach for several reasons, including the necessity of trading off between security and compatibility that containers represent, and the difficulties of efficiently packing workloads onto fixed-size VMs."

**What it solved:** strangers never shared a kernel, from day one. **What it cost:** a whole EC2 instance's worth of capacity per customer however small its usage, so a long tail of small customers stranded most of what the fleet bought, and within a customer, functions relied on container isolation from each other.

### 2013 to 2017: Nitro takes the hypervisor off the host

In parallel, AWS moved the hypervisor's work into hardware. Werner Vogels's history of Nitro gives the steps: "We launched our first Nitro offload card in the C3 instance type in 2013, offloading our network processes into hardware"; "Next came the C4 instance type in 2014, offloading EBS storage into hardware"; AWS "acquired Annapurna Labs in early 2015"; and the C5 instance type, launched November 6, 2017, introduced "a new hypervisor, the full Nitro System." The motivation was capacity: in the earlier Xen-based design, "as much as 30% of the resources in an instance were allocated to the hypervisor and operational management for network, storage, and monitoring."

**What it solved:** nearly the whole server sold to customers, and a hypervisor small enough to have no network stack. **What it cost:** custom silicon, which only a provider at AWS's scale can design, and a platform no one else can run.

### December 2017: Kata Containers

The OpenStack Foundation announced Kata Containers in December 2017, merging Intel's Clear Containers and Hyper's runV ("Both of these projects function together in Kata, where the containers are launched in runV," InfoQ reported on December 11, 2017). Kata runs each container or pod in a lightweight VM that is "OCI (Open Container Initiative) compliant" and plugs into Docker, CRI-O and Kubernetes; the project is now managed by the Open Infrastructure Foundation, separate from OpenStack, and runs on several hypervisors including QEMU and Firecracker.

**What it solved:** a VM boundary under the standard container workflow, so an operator can change the wall without changing the images. **What it cost:** a guest kernel and VMM per pod, which on QEMU meant the memory and boot overhead Firecracker later set out to remove.

### May 2, 2018: gVisor

Google open-sourced gVisor on May 2, 2018: a kernel written in Go that runs in user space, implementing "a large part of the Linux system API (200 system calls and counting), but not all," described as "an extremely paravirtualized operating system with a flexible resource footprint and lower fixed cost than a full VM." Its OCI runtime, `runsc`, "is interchangeable with `runc`." The launch post named the price: "higher per-system call overhead and application compatibility."

**What it solved:** a far smaller host-kernel surface without hardware virtualization, so it runs inside VMs a provider rents from someone else. **What it cost:** every system call pays a toll, and some applications don't run.

### November 26, 2018: Firecracker

AWS announced Firecracker on November 26, 2018, launching microVMs "in as little as 125 ms" with about 5 MiB of memory each; the paper dates the open-source release, under the Apache 2 license, to December 2018. The NSDI 2020 paper gives the design and the production record: about 50,000 lines of Rust, "96% fewer lines than QEMU" (which has more than 1.4 million and can require up to 270 system calls); "memory overhead of less than 5MB per container, boots to application code in less than 125ms, and allows creation of up to 150 MicroVMs per second per host." Starting in 2018, AWS migrated Lambda "from our first isolation solution (based on containers per function, and AWS EC2 instances per customer) to Firecracker running on AWS EC2 bare metal instances, with no interruption to availability, latency or other metrics," a migration that was "uneventful, despite moving arbitrary code provided by hundreds of thousands of AWS customers." In 2026 AWS says Firecracker powers over 15 trillion Lambda invocations a month.

**What it solved:** a VM per function at roughly the density of a container. **What it cost:** a deliberately minimal machine with five emulated devices, lower I/O performance than QEMU, and the need to build orchestration around a VMM that does nothing on its own.

### By 2020: Cloud Hypervisor

Intel's Cloud Hypervisor is a Rust VMM that the Firecracker paper, calling it "recently released," says "shares much code with Firecracker, while targeting a different application space." It is now "governed openly as part of the Linux Foundation," supported by organizations including Alibaba, AMD, Ampere, ARM, ByteDance, Intel, Microsoft and Tencent Cloud, targets "modern cloud workloads" with direct kernel boot reaching userspace in under 100 ms, runs Linux and Windows guests on x86-64 and aarch64, and is one of Kata Containers' VMMs. Its niche is the general-purpose microVM: more devices and guest operating systems than Firecracker, far less than QEMU.

### 2024 to 2026: sandboxes for agents

Code-execution sandboxes for AI agents became a product category on these walls. Vercel Sandbox runs "untrusted or agent-generated code in isolated Linux microVMs," with snapshots and persistence; Cloudflare's Sandbox SDK runs Linux sandboxes on Containers ("Each instance is a microVM with its own kernel and network") or, for JavaScript, Python and Wasm, as Dynamic Workers in isolates; E2B describes its runtime as "Firecracker microVMs that resume from a snapshot"; and AWS launched Lambda MicroVMs on June 22, 2026 for "isolated execution of user and AI-generated code," with "VM-level isolation" and execution that can be suspended and resumed for up to 8 hours. The pattern is the same in each: a microVM per user or per task, snapshotted so it starts fast and paused so it costs little between steps.

## The Isolation Ladder

This volume records the wall around every compute resource with one vocabulary, used in the `isolation` column of `virtual_machines`, `container_services` and `functions`:

| `isolation` | What the tenant gets | What is shared with other tenants | Examples |
| --- | --- | --- | --- |
| `bare_metal` | The whole machine | Nothing on the host; the network and the provider's management plane | EC2 bare metal, dedicated servers |
| `hardware_vm` | A guest kernel on a general-purpose hypervisor | The hypervisor, the host and its devices | EC2 instances on Nitro, KVM VPS plans, Azure Container Instances |
| `microvm` | A guest kernel on a minimal VMM with a few virtual devices | The host kernel's KVM interface and the VMM's small surface | Firecracker, Cloud Hypervisor, Kata, Cloud Run second generation |
| `user_space_kernel` | A sandbox kernel that implements Linux system calls in user space | The host kernel, reached through a small filtered set of calls | gVisor in Cloud Run first generation and GKE Sandbox |
| `os_container` | Namespaces and cgroups on the host kernel | The host kernel's whole system-call surface | runc containers, shared hosting with CageFS, OpenVZ |
| `language_isolate` | A separate heap in a language runtime shared by many tenants | The runtime process, its JIT, and the host kernel through that process | V8 isolates on Cloudflare Workers |
| `wasm_sandbox` | A WebAssembly instance with linear memory and imported capabilities | The Wasm runtime process | Wasmtime on Fastly Compute |

The order isn't a strict ranking. A Wasm sandbox has a smaller interface than an OS container but shares a process with other tenants; an isolate depends on the V8 sandbox, which Cloudflare backs with extra layers rather than trusting alone. What the ladder records is the thing that matters when a vulnerability is published: which tenants share the component it's in.

## How Firecracker Works

Firecracker keeps KVM and replaces QEMU. One Firecracker process runs per microVM and is "responsible for creating and managing the MicroVM, providing device emulation and handling VM exits." The pieces an operator works with:

- **A minimal device model.** "Only 5 emulated devices": virtio-net, virtio-block, virtio-vsock, a serial console, and "a minimal keyboard controller used only to stop the microVM." Fewer devices is fewer lines of emulation code a guest can attack: the paper puts the serial and keyboard emulation at under 300 lines of Rust and the whole virtio block implementation at around 1,400.
- **A REST API over a Unix socket** to configure CPUs, memory, drives, network interfaces and rate limiters before boot. Lambda's paper notes that configuring through several API calls is why "end-to-end" boots are slower than "pre-configured" ones.
- **Rate limiters in the device model.** Network and block I/O limits are enforced in emulation because "we do not trust the guest to implement its own limits"; everything else (CPU credit scheduling, affinity) is left to Linux cgroups on the host.
- **The jailer.** Before the guest boots, the jailer places Firecracker in "a chroot, isolating it in pid and network namespaces, dropping privileges, and setting a restrictive seccomp-bpf profile." The chroot holds only the binary, `/dev/net/tun`, cgroup control files and the microVM's own resources; the seccomp profile allows 24 system calls, each with argument filtering, and 30 ioctls. If a guest escapes into the VMM, the VMM itself is a process with almost nothing it can do.
- **Snapshots.** A snapshot is a guest memory file plus a microVM state file (device and KVM state), restored by mapping memory privately and loading pages on demand. Diff snapshots save only changed pages. The documentation's warning is the provider's problem: resuming one snapshot more than once can duplicate "identifiers, random numbers, and cryptographic tokens," so cloning from one snapshot "is only secure if each snapshot is loaded at most once," with VMGenID reseeding the kernel's random number generator on Linux 5.18 and later and applications responsible for their own state.

In Lambda the microVM is one **slot**: "Each MicroVM contains a single sandbox for a single customer function, along with a minimized Linux kernel and userland, and a shim control process," and each worker runs "hundreds or thousands of MicroVMs." A per-worker MicroManager talks to the shim over TCP inside the microVM and keeps "a small pool of pre-booted MicroVMs," because 125 ms is "not fast enough for the scale-up path of Lambda." Little's law sizes the pool: "at 125ms creation time, one pooled MicroVM is required for every 8 creations per second." SnapStart applies snapshots to the same problem from the customer side, taking "a Firecracker MicroVM snapshot of the memory and disk state of the initialized execution environment" and resuming new environments from it ([Functions, Isolates & Edge Compute](/books/hosting-and-cloud/functions-and-edge-compute)).

## How gVisor Works

gVisor is "an application kernel that implements a Linux-like interface," and it has three parts:

- **The Sentry** is "the largest component of gVisor": it implements system calls, signals, memory management and threading, and doesn't pass the application's system calls through to the host.
- **The Gofer** is "a standard host process which is started with each container," talking to the Sentry over 9P and mediating all filesystem access, so the Sentry itself never opens host files.
- **`runsc`** is the OCI runtime that Docker, containerd and Kubernetes call in place of runc.

How the Sentry catches the application's system calls is its **platform**, and the choice is a provider's tuning decision. `systrap` uses seccomp's `SECCOMP_RET_TRAP` and "replaced `ptrace` as the default gVisor platform in mid-2023," and is the better choice inside a VM; `KVM` uses hardware virtualization so the Sentry acts as guest kernel and VMM at once and performs best on bare metal; `ptrace` runs anywhere but has high context-switch overhead and is no longer supported.

The cost is structural. gVisor's performance guide says system-call interception costs less "the more work an application does," that the sandbox adds "a small, mostly fixed amount of memory overhead," and that the workloads hit hardest do little work per operation (it names Redis and small Node and Ruby web services), plus file-heavy serving through its virtual filesystem. GKE's documentation lists what a provider gives up: no privileged containers, no hostPath storage or raw block volumes, restrictions on seccomp, AppArmor and `NET_RAW`, and partial GPU support that "doesn't mitigate all NVIDIA driver vulnerabilities."

## How Nitro Works

Nitro splits a server into two domains. The **Nitro Cards** are "dedicated hardware components with powerful 64-bit processing capabilities and specialized Application Specific Integrated Circuits" that implement every outward interface: the VPC network, EBS and local NVMe storage, encryption, and the control-plane API. The primary card, the **Nitro Controller**, is the hardware root of trust and "the exclusive gateway between the physical server and the control planes for EC2, Amazon EBS, and Amazon Virtual Private Cloud." The **Nitro Security Chip** on the main board moderates access to firmware and holds the CPUs in reset until the Controller has verified everything, which is what makes bare metal instances safe to rent: customer code on the main CPUs can't rewrite the server's firmware.

The **Nitro Hypervisor** is what's left: it receives start and stop commands from the Controller, partitions CPU and memory with hardware virtualization, and assigns SR-IOV virtual functions of the cards' devices directly to VMs. "Within the Nitro Hypervisor, there is, by design, no networking stack, no general-purpose file system implementations, and no peripheral device driver support," and it "includes neither a shell nor any type of interactive access mode." Because I/O never passes through the hypervisor, the hypervisor is optional: the same server runs as a bare metal instance with the cards still in charge. Nitro is AWS's alone; the general pattern (a card that owns the network and storage so the host can belong entirely to the tenant) is Data Center Networking's DPU story ([Data Center Networking](/books/hosting-and-cloud/data-center-networking)).

## Density, Boot Time and Syscall Cost

The three costs, with the evidence each provider or paper publishes:

| Wall | Memory overhead per sandbox | Start time | Per-operation cost | Source and date |
| --- | --- | --- | --- | --- |
| Firecracker | About 3 MB measured (VMM process beyond the guest size); under 5 MiB claimed | Under 125 ms to application code; 99th percentile 146 ms with 50 booting in parallel, pre-configured | Block I/O limited to about 13,000 IOPS against hardware capable of over 340,000, network about 15 Gb/s against 44 on the host, in the paper's v0.20 tests | NSDI paper, February 2020 |
| Cloud Hypervisor | About 13 MB measured | Marginally faster than pre-configured Firecracker serially; 99th percentile 158 ms in parallel | Slightly higher network throughput than Firecracker in the same tests | NSDI paper, February 2020 |
| QEMU (minimal build) | About 131 MB measured | About twice pre-configured Firecracker's boot time | Most optimized I/O path; flushes on write | NSDI paper, February 2020 |
| gVisor | "Small, mostly fixed" | Mostly the container runtime's own overhead, per gVisor's guide | Every system call intercepted; highest on `ptrace`, lowest on `KVM` on bare metal | gVisor documentation, October 2026 |
| V8 isolate (Workers) | Around 3 MB, against about 35 MB for a basic Node Lambda (Cloudflare's 2018 comparison) | About 5 ms (vendor claim, 2018) | No process context switch; a CPU-time limit per request | Cloudflare blog, November 9, 2018 |
| Wasm (Fastly Compute) | 128 MB heap limit per execution | 35.4 microseconds at the 2019 beta announcement; "<40 microseconds" in the current datasheet (vendor claims) | 50 ms of CPU per request by default | Fastly press release, November 6, 2019; datasheet and limits, October 2026 |

How to read it: memory overhead decides density, because "our goal is to sell all the memory we buy," as the Firecracker paper puts it, and a 131 MB VMM on a 128 MB function triples the memory sold. Boot time decides the size of the warm pool and how often a customer waits. Syscall and I/O cost decide which workloads a wall suits: a microVM pays at device boundaries (disk and network), gVisor pays on every system call, and isolates and Wasm pay almost nothing per operation but forbid anything their runtime doesn't offer. None of the vendor start-time claims comes with an independent benchmark, and they measure different things (a VM to its init process, an isolate to code execution).

## How Providers Choose

A provider choosing a wall answers four questions, and the public choices map onto them:

1. **Can customers bring binaries?** If yes, the wall is a VM or a user-space kernel. Every product in the table that accepts arbitrary images (Fargate, Cloud Run, Container Instances, Fly.io, Cloudflare Containers, Vercel Sandbox, E2B) uses one.
2. **Does the provider own the hardware?** A microVM needs KVM. A provider on bare metal (AWS for Lambda, Fly.io on its own servers) can run Firecracker directly; a provider renting VMs needs nested virtualization or gVisor's `systrap`, which gVisor recommends "inside a VM or on machines without virtualization support."
3. **How fast must it start, and how often?** Request-scoped work (an edge function per HTTP request) can't wait 125 ms, so it gets an isolate or a Wasm instance. Session-scoped work (a function slot reused for hours, an agent sandbox, a CI job on an ephemeral runner as in [Runners & Build Infrastructure](/books/hosting-and-cloud/runners-and-build-infrastructure#containers-or-microvms)) amortizes a microVM's boot and hides it with pools and snapshots.
4. **How much compatibility does the customer expect?** gVisor's 2018 launch implemented about 200 system calls and listed what ran; Cloud Run's second generation exists because some workloads need "full Linux compatibility." A provider should publish which wall a product uses and what it doesn't support, because the customer's bug reports will find out anyway.

## The Alternatives

| Wall | Model | Strengths | Failure modes | Licensing and ownership | Cost to the provider | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Firecracker** | Minimal KVM VMM, one process per microVM, jailer | Small trusted code base, about 3 MB overhead, sub-125 ms boot, snapshots | Five devices, so no GPU passthrough; weaker I/O; needs KVM; orchestration is yours to build | Apache 2.0, AWS-led | Low per sandbox, high to build around | Lambda, Fargate, Fly.io, Cloudflare Containers, Vercel Sandbox, E2B |
| **Cloud Hypervisor** | General-purpose Rust VMM | More devices (PCI passthrough) and guests (Windows), aarch64, Kata integration | Larger than Firecracker; younger than QEMU | Open source under the Linux Foundation | Low to medium | Kata deployments, general microVM hosts |
| **Kata Containers** | A VM per pod behind an OCI and CRI runtime | Drop-in for Kubernetes; choice of VMM | Guest kernel per pod; device support depends on the VMM | Apache 2.0, Open Infrastructure Foundation | Medium | Multi-tenant Kubernetes clusters ([Multi-Tenancy, Policy & Security](/books/hosting-and-cloud/kubernetes-multi-tenancy-and-policy#sandboxed-runtimes-and-runtimeclass)) |
| **gVisor** | User-space kernel per sandbox | No hardware virtualization needed; small host-kernel surface | System-call-heavy and file-heavy workloads slow; incomplete Linux API | Apache 2.0, Google-led | Low memory; CPU tax per syscall | Cloud Run first generation, GKE Sandbox |
| **Nitro-style hardware VM** | Minimal hypervisor with I/O on cards | Near-bare-metal performance; bare metal from the same server | Custom silicon; hours-scale VM products, not per-request | Proprietary, AWS | Very high to build | EC2 |
| **V8 isolates** | Many tenants per process | Start in milliseconds; tiny memory per tenant | Only JavaScript and Wasm; a V8 bug is a cross-tenant bug, so it needs extra layers | workerd (the Workers runtime) is Apache 2.0 | Very low | Cloudflare Workers |
| **Wasm runtimes** | An instance per request or session | Microsecond start; capability-based imports | Language and library support; immature system interfaces (WASI) | Wasmtime is Apache 2.0, Bytecode Alliance | Very low | Fastly Compute |

## My Default

My default for any product that runs customers' binaries is a Firecracker microVM per tenant workload, on hosts the provider owns, with a jailer, a pre-booted pool sized by Little's law and snapshots for cold-start-sensitive runtimes, and the `isolation` recorded on every resource. The facts support it: it's the wall AWS migrated Lambda to across hundreds of thousands of customers without incident, it's what the newer providers (Fly.io, Cloudflare, Vercel, E2B) chose independently, and its measured overhead (about 3 MB and under 125 ms) removed the density argument for shared kernels.

I'd pick gVisor instead when the provider runs on rented VMs without nested virtualization, or for container products where compatibility gaps are acceptable and memory is the binding cost. I'd pick isolates or Wasm only for request-scoped edge code in a restricted language, and I'd pick Cloud Hypervisor or Kata over Firecracker when customers need devices or guests Firecracker deliberately leaves out.

What would change this: GPUs. Firecracker's five-device model has no PCI passthrough, so a GPU means a different VMM or bare metal. Fly.io's account of its GPU product (February 14, 2025) is the public example: GPU Machines ran on Cloud Hypervisor, "a very similar Rust codebase that supports PCI passthrough," on dedicated GPU servers kept apart from other workloads for security, and "those GPU servers were drastically less utilized and thus less cost-effective than our ordinary servers." A GPU product's tenancy decision is one tenant per device, and its economics belong to [GPU & AI Clouds](/books/hosting-and-cloud/gpu-and-ai-clouds).

## How to Build It

The chapter adds the `isolation` column, with the vocabulary above, to `virtual_machines` from [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) and to `container_services` from [From chroot to Containers](/books/hosting-and-cloud/containers#how-to-build-it), plus the sandbox runtime for container services (VMs already record theirs in the `hypervisor` column from [Virtualization & the VPS](/books/hosting-and-cloud/virtualization-and-vps)). [Functions, Isolates & Edge Compute](/books/hosting-and-cloud/functions-and-edge-compute#how-to-build-it) gives `functions` the same column.

```sql
ALTER TABLE virtual_machines
  ADD COLUMN isolation TEXT NOT NULL DEFAULT 'hardware_vm'
    CHECK (isolation IN ('bare_metal', 'hardware_vm', 'microvm', 'user_space_kernel',
      'os_container', 'language_isolate', 'wasm_sandbox')),
  ADD COLUMN snapshot_restored_from TEXT, -- snapshot id when the VM resumed from one
  ADD CONSTRAINT virtual_machines_bare_metal_check
    CHECK ((tenancy = 'bare_metal') = (isolation = 'bare_metal')),
  ADD CONSTRAINT virtual_machines_hypervisor_isolation_check
    CHECK ((hypervisor IN ('openvz', 'virtuozzo', 'lxc')) = (isolation = 'os_container')
       AND (hypervisor <> 'firecracker' OR isolation = 'microvm'));

ALTER TABLE container_services
  ADD COLUMN isolation TEXT NOT NULL
    CHECK (isolation IN ('bare_metal', 'hardware_vm', 'microvm', 'user_space_kernel',
      'os_container', 'language_isolate', 'wasm_sandbox')),
  ADD COLUMN sandbox_runtime TEXT,       -- 'runc', 'runsc', 'kata-fc', 'firecracker'
  ADD CONSTRAINT container_services_shared_kernel_check
    CHECK (isolation <> 'os_container' OR capacity_mode = 'customer_nodes');
```

Notes on the sketch:

- **Isolation is a column, not a product name.** The same product can run on two walls (Cloud Run's generations), and a provider changes walls under a running product (Lambda's 2018 migration). Recording the wall per resource makes "which tenants were on gVisor when this CVE was published" one query against these columns and the placement records from [Schedulers: Borg to Kubernetes](/books/hosting-and-cloud/schedulers#how-to-build-it).
- **The shared kernel is only for one customer's own nodes.** The `container_services` check forbids `os_container` on provider-managed capacity, which is the rule from [From chroot to Containers](/books/hosting-and-cloud/containers#the-shared-kernel-as-a-tenancy-decision) enforced by the database rather than by convention.
- **Bare metal is a tenancy and an isolation at once.** The core model's `virtual_machines.tenancy` says who shares the host; `isolation` says what wall they get. The constraint keeps the two consistent for bare metal, the one case where they're the same fact. A second constraint ties `isolation` to the `hypervisor` column, so an OpenVZ, Virtuozzo or LXC VPS is recorded as the shared kernel it is, however it's marketed.
- **Snapshots are provenance.** `snapshot_restored_from` records which snapshot a VM resumed from, because two VMs restored from one snapshot share whatever randomness and tokens it captured, and the security review after a uniqueness bug needs to find them.
- **Events:** `resource.isolation_changed` (with old and new values and runtime), `sandbox.snapshot_created` and `sandbox.restored` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to the security team and the abuse desk.

## Auditing

- **Which wall every tenant had, when.** The isolation and runtime per resource over time, kept with placements, so a published escape in a VMM, the Sentry or V8 can be scoped to the tenants who shared the affected component ([Audit Trails](/docs/architecture/audit-trails)).
- **Runtime versions in the fleet.** Which Firecracker, gVisor, Kata or V8 version ran on each host and when it was patched, because the patch gap is the exposure window.
- **Snapshot lineage.** Every snapshot, what it was taken from, and every restore, against the rule that a snapshot should resume once.
- **Exceptions.** Any tenant granted a weaker wall than its product's default (a privileged container, a shared-kernel exception) with who approved it and why.

## What This Means for the System You Build

- **Name the wall:** record `isolation` and the runtime on every compute resource, using one vocabulary across products.
- **Put a VM boundary around strangers' binaries,** and reserve shared kernels for one customer's own nodes.
- **Jail the VMM:** chroot, namespaces, dropped privileges and a seccomp allowlist around the process that emulates devices.
- **Size warm pools with Little's law** and use snapshots where boot is still too slow, resuming each snapshot once.
- **Match the wall to the work:** microVMs for sessions and binaries, isolates and Wasm for request-scoped code in a restricted language, gVisor where hardware virtualization isn't available.
- **Publish the trade:** which wall a product uses, and what it doesn't support.

## References

**Papers and standards**

- [Agache et al.: Firecracker: Lightweight Virtualization for Serverless Applications](https://www.usenix.org/conference/nsdi20/presentation/agache), NSDI, February 2020: Lambda's first design, code size, jailer, slots and pools, the migration, boot, memory and I/O measurements
- [AWS: The Security Design of the AWS Nitro System, components](https://docs.aws.amazon.com/whitepapers/latest/security-design-of-aws-nitro-system/the-components-of-the-nitro-system.html), Nitro Cards, Controller, Security Chip and Hypervisor

**Provider documentation**

- [Firecracker](https://firecracker-microvm.github.io/), the five emulated devices, boot, overhead and creation-rate claims, the jailer, and users
- [Firecracker: Snapshot support](https://github.com/firecracker-microvm/firecracker/blob/main/docs/snapshotting/snapshot-support.md), memory and state files, diff snapshots and the uniqueness caveat
- [gVisor: What is gVisor?](https://gvisor.dev/docs/), the Sentry, the Gofer, `runsc` and per-system-call overhead
- [gVisor: Platforms](https://gvisor.dev/docs/architecture_guide/platforms/), systrap, KVM and ptrace, and systrap as the default since mid-2023
- [gVisor: Performance guide](https://gvisor.dev/docs/architecture_guide/performance/), structural costs, memory overhead and the workloads most affected
- [Kata Containers: Learn](https://katacontainers.io/learn/), lightweight VMs, OCI compliance, origins and governance
- [Cloud Hypervisor](https://www.cloudhypervisor.org/), a Rust VMM under the Linux Foundation, its targets and supporters
- [AWS: Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html), Lambda MicroVMs' 8-hour duration and Arm-only support
- [AWS: Improving startup performance with Lambda SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart.html), Firecracker snapshots of the initialized environment
- [AWS: Architect for AWS Fargate for Amazon ECS](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html), per-task isolation boundary
- [Google Cloud: Cloud Run execution environments](https://docs.cloud.google.com/run/docs/about-execution-environments), gVisor-based first generation and microVM second generation
- [Google Cloud: GKE Sandbox](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/sandbox-pods), gVisor for untrusted workloads and its limitations
- [Microsoft Learn: Azure Container Instances overview](https://learn.microsoft.com/en-us/azure/container-instances/container-instances-overview), hypervisor-level isolation and confidential containers
- [Fly.io: Architecture](https://docs.fly.io/architecture), Firecracker microVMs and host sizes
- [Cloudflare: Containers architecture](https://developers.cloudflare.com/containers/platform-details/architecture/), a Firecracker microVM per container instance
- [Cloudflare: Sandbox SDK](https://developers.cloudflare.com/sandbox/), Linux sandboxes on Containers and Dynamic Workers
- [Cloudflare: Workers security model](https://developers.cloudflare.com/workers/reference/security-model/), isolates, trust cordons, the process sandbox and Spectre defenses
- [Fastly: Sandbox execution lifecycle](https://www.fastly.com/documentation/guides/compute/developer-guides/sandbox-lifecycle/), a new sandbox per request by default
- [Fastly: Getting started with Compute](https://www.fastly.com/documentation/guides/compute/getting-started-with-compute/), Wasmtime and WebAssembly
- [Fastly: Compute resource limits](https://docs.fastly.com/products/compute-resource-limits), heap, CPU time and wall-clock limits
- [Fastly: Compute datasheet](https://www.fastly.com/resources/datasheets/fastly-compute), the "<40 microseconds" execution claim
- [Vercel: Sandbox](https://vercel.com/docs/vercel-sandbox), Firecracker microVMs for untrusted and agent-generated code
- [Fly.io: We were wrong about GPUs](https://fly.io/blog/wrong-about-gpu/), February 14, 2025, Cloud Hypervisor for PCI passthrough and dedicated GPU servers
- [GitHub: e2b-dev/infra](https://github.com/e2b-dev/infra), E2B's Firecracker-based sandbox runtime

**Announcements and release notes**

- [All Things Distributed: Reinventing virtualization with the AWS Nitro System](https://www.allthingsdistributed.com/2020/09/reinventing-virtualization-with-nitro.html), September 14, 2020: C3, C4, Annapurna, C5 and the 30% overhead
- [AWS News Blog: Now available, compute-intensive C5 instances](https://aws.amazon.com/blogs/aws/now-available-compute-intensive-c5-instances-for-amazon-ec2/), November 6, 2017
- [InfoQ: OpenStack Foundation announces Kata Containers](https://www.infoq.com/news/2017/12/openstack-kata-containers/), December 11, 2017, Clear Containers and runV
- [Google Cloud: Open-sourcing gVisor](https://cloud.google.com/blog/products/identity-security/open-sourcing-gvisor-a-sandboxed-container-runtime), May 2, 2018, 200 system calls and the overhead trade
- [AWS News Blog: Firecracker](https://aws.amazon.com/blogs/aws/firecracker-lightweight-virtualization-for-serverless-computing/), November 26, 2018
- [Cloudflare: Cloud computing without containers](https://blog.cloudflare.com/cloud-computing-without-containers/), November 9, 2018, isolate start time and memory
- [Fastly: Fastly expands serverless capabilities with the launch of Compute@Edge](https://www.fastly.com/press/press-releases/fastly-expands-serverless-capabilities-launch-compute-edge), November 6, 2019, the 35.4-microsecond claim
- [AWS: Lambda MicroVMs](https://aws.amazon.com/about-aws/whats-new/2026/06/aws-lambda-microvms), June 22, 2026, built on Firecracker, suspend and resume for up to 8 hours
