+++
title = "Virtualization & the VPS"
description = "Binary translation, Xen, VT-x and KVM, Virtuozzo and OpenVZ, overcommit and burstable credits, the VPS as a product, and the Broadcom VMware shock."
category = "Hosting & Cloud Industry"
order = 2108
part = "The Stack, Bottom to Top"
tags = ["virtualization", "hypervisors", "vps", "kvm", "burstable-instances"]
+++

A virtual private server is a slice of a physical machine sold as if it were a whole one: its own root account, its own IP address, its own operating system or something that looks like one, and a monthly price a fraction of a dedicated server's. The hypervisor or kernel underneath decides how real the slice is. In one branch of the history, each customer gets a kernel of its own running on emulated or hardware-assisted virtual hardware; in the other, every customer shares the host's kernel and gets a container dressed as a server. Both are sold as "VPS," and the difference shows up in what the customer can run, how many customers fit on a host, and what happens when one of them runs hot.

The business is density. A provider that fits forty virtual machines on a host instead of twenty halves its hardware cost per customer, and every technique in this chapter is a way of fitting more: paravirtualization and hardware assist to cut the overhead, shared kernels to cut it further, memory ballooning and page sharing to promise more memory than the host has, and CPU credits to sell a fraction of a core and charge for bursts. Each one moves risk to the customer as noisy neighbors. This chapter covers how virtualization got here from binary translation to KVM, how the shared-kernel VPS worked, how overcommit and burstable credits work at operator depth, the VPS as it's sold across developer clouds as of October 2026, and Broadcom's VMware licensing change as the epilogue. It adds hypervisor, CPU-model and credit columns to `virtual_machines` and a `cpu_credit_balances` table to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). The hosts are [Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers); the virtual networks between VMs are [Data Center Networking](/books/hosting-and-cloud/data-center-networking); shared-kernel isolation from chroot to Docker is [From chroot to Containers](/books/hosting-and-cloud/containers); microVMs, Nitro and user-space kernels are [Sandboxes & MicroVMs](/books/hosting-and-cloud/sandboxes-and-microvms); and placing a VM on a host is [Schedulers: Borg to Kubernetes](/books/hosting-and-cloud/schedulers).

## How the Providers Do It

| Provider | CPU models sold (as of October 2026) | What's public about sharing | What it shows |
| --- | --- | --- | --- |
| **AWS EC2** | Fixed-performance families, and burstable T-family instances (T2, T3, T3a, T4g, T8i) | A CPU credit is "1 vCPU \* 100% utilization \* 1 minute"; a t3.nano earns 6 credits an hour for a 5% baseline per vCPU and can accrue 144; Standard mode falls back to baseline at zero credits, Unlimited mode bills a "flat additional rate" per vCPU-hour if the 24-hour average exceeds baseline | The noisy-neighbor problem priced as a product, accounted "at a millisecond-level resolution" |
| **Microsoft Azure** | Fixed sizes and the B-series, "the only VM type that use credits for CPU performance provisioning" | Credits bank below base performance and are spent above it; at zero, the VM is "throttled back to its base CPU performance" | The same credit model, with Initial Credits and Max Banked Credits per size |
| **Google Compute Engine** | Fixed machine types and E2 shared-core (e2-micro, e2-small, e2-medium) | Shared-core types "time-share a single physical core" at 0.25, 0.5 or 1.0 of a vCPU, can burst at 100% for 30, 60 or 120 seconds, and "Bursting doesn't incur any additional charges" | Bursting as a short allowance, not a bank |
| **DigitalOcean** | Basic (shared CPU) and dedicated-CPU Droplets (General Purpose, CPU-, Memory- and Storage-Optimized) | A vCPU is "a single hyper-thread"; on shared plans it "may be shared between multiple other Droplets," and cycles available "depend on the workload of the other Droplets sharing that host" | Shared versus dedicated stated plainly, with no credit meter |
| **Akamai (Linode)** | Shared CPU and Dedicated CPU plans | "A small amount of resource contention is possible"; cores can run at 100% "for short bursts" but "should remain below 80% sustained usage on average" | A usage rule in place of a meter |
| **Hetzner Cloud** | Shared Resources and Dedicated Resources server types | Hypervisors "distribute usage rights of CPU resources among several virtual servers"; dedicated types have "dedicated CPU resources" | Shared types on older hardware, dedicated on the newest |

Three patterns run through the table. **Every provider sells shared and dedicated CPU separately,** because the price difference is the overcommit ratio. **Hyperscalers meter the sharing; developer clouds state a rule:** AWS and Azure keep a credit ledger per VM and bill or throttle against it, Google gives a fixed burst window, and DigitalOcean, Linode and Hetzner describe contention and leave it there. **A vCPU is a hardware thread,** not a core: DigitalOcean's definition and AWS's note that each vCPU "is a thread of either an Intel Xeon core or an AMD EPYC core" (except T2 and T4g) say the same thing, which is why two vCPUs can be one physical core.

## How It Got Here

### Binary translation (1998 to 2002)

The x86 processor wasn't designed to be virtualized: some privileged instructions behaved differently in user mode instead of trapping, so a hypervisor couldn't simply run a guest kernel deprivileged and catch what it did. VMware, incorporated in 1998, shipped its first product (Workstation) in 1999 and ESX Server and GSX Server in 2001; its approach, as the Xen paper describes it, was to scan and rewrite the guest kernel's code on the fly (binary translation) and to maintain shadow page tables that mirrored the guest's own, which is expensive for workloads that create many processes. Carl Waldspurger's "Memory Resource Management in VMware ESX Server" (OSDI, December 2002) introduced the tools that made density pay: a **balloon driver** inside the guest that the hypervisor inflates to make the guest give memory back, **content-based page sharing** that merges identical pages across VMs, and an idle memory tax that reclaims memory from guests that aren't using it. **What it solved:** unmodified operating systems, many per server. **What it cost:** CPU overhead on system-call-heavy workloads, and proprietary licenses.

### Paravirtualization (2003)

"Xen and the Art of Virtualization" (Barham and colleagues, Cambridge, SOSP, October 2003) avoided binary translation by changing the guest: a paravirtualized kernel calls the hypervisor instead of executing instructions that would need trapping, reads its page tables directly while the hypervisor validates updates in batches, replaces interrupts with an event mechanism and does I/O through asynchronous shared-memory rings. Xen sat in the top 64 MB of every address space to avoid TLB flushes on entry, and guests did their own paging from a guaranteed reservation so one VM couldn't make others thrash. The paper targeted "hosting up to 100 virtual machine instances simultaneously on a modern server" at an overhead of "at most a few percent," and named "co-located hosting facilities" as a use. AWS ran EC2 on Xen from its beta on August 25, 2006 ([From Bare Metal to Cloud](/books/hosting-and-cloud/bare-metal-to-cloud)). **What it solved:** near-native performance and a free hypervisor. **What it cost:** guests needed modified kernels, so Windows and stock kernels couldn't run paravirtualized.

### Containers sold as servers (2002 to 2010s)

The other branch didn't virtualize hardware at all. SWsoft released Virtuozzo for Linux in January 2002 and released its core under the GPL as OpenVZ in 2005: each container shared the host's kernel but had its own filesystem, process space and IP addresses. OpenVZ's resource controls became the template for shared-kernel limits: two-level disk quotas (blocks and inodes per container, user and group quotas inside), a two-level fair-share CPU scheduler weighted by `cpuunits`, per-container I/O priority, and **User Beancounters**, a set of per-container counters with limits, guarantees and a fail counter that recorded each time a container hit one. Checkpointing and live migration arrived in November 2006, with "a few seconds" of delay; the checkpoint work later became CRIU (started in July 2011, v0.1 in July 2012). SWsoft renamed itself Parallels from January 2008 (announced December 12, 2007), and Virtuozzo was spun out as its own company in 2016. Many VPS plans of the 2000s were OpenVZ containers: a host could put far more of them on a machine than full VMs. **What it solved:** near-zero overhead and high density. **What it cost:** Linux guests only, on the host's kernel version, and a "server" whose memory and process limits could be oversold until every customer's limit was the host's problem.

### Hardware assist and KVM (2005 to 2008)

The processor vendors fixed the instruction set. Intel shipped VT-x in the Pentium 4 662 and 672 on November 14, 2005; AMD's AMD-V arrived with the Socket AM2 Athlon 64 launch on May 23, 2006. Second-level page tables, which remove shadow paging, followed: AMD's Rapid Virtualization Indexing with the quad-core Opteron "Barcelona" on September 10, 2007, and Intel's Extended Page Tables with Nehalem, launched November 17, 2008. With hardware assist, an unmodified guest kernel runs in a hardware mode where privileged operations trap cleanly. KVM, merged into Linux 2.6.20 (released February 5, 2007), used those extensions to make Linux itself a hypervisor: a loadable module (`kvm.ko`, plus `kvm-intel.ko` or `kvm-amd.ko`) on any x86 system with "virtualization extensions (Intel VT or AMD-V)," giving each guest "private virtualized hardware: a network card, disk, graphics adapter, etc."; the userspace half is in mainline QEMU as of 1.3. **What it solved:** unmodified guests, any operating system, near-native CPU performance, with the hypervisor maintained in the Linux kernel. **What it cost:** a whole kernel per customer to boot and patch, and memory per guest that a shared kernel didn't need.

### Credits for bursts (2014 on)

Once full VMs were cheap, the clouds turned overcommit into a product. AWS launched T2 on July 1, 2014: "A CPU Credit provides the performance of a full CPU core for one minute," a t2.micro earned 6 credits an hour for a 10% baseline, and the balance capped at a day's worth (144). The model grew modes (Standard and Unlimited), Azure built the same into the B-series, and Google's E2 shared-core types gave a fixed burst window instead. **What it solved:** a cheap instance for mostly idle workloads, with a meter for the bursts. **What it cost:** a performance cliff when credits run out, and surprise charges in Unlimited mode.

## How a Hypervisor Shares a Host

### CPU

A host with 64 hardware threads can run VMs with far more than 64 vCPUs, because most vCPUs are idle most of the time. The hypervisor's scheduler runs vCPUs on physical threads in turn; when a vCPU is ready to run but its thread is busy with another guest, the guest's clock still advances and Linux guests report the gap as **steal** time in `/proc/stat` ("involuntary wait"). Steal is the customer's only direct view of a noisy neighbor. The provider controls it with the overcommit ratio per host, by pinning dedicated-CPU VMs to threads no other guest uses, and by keeping shared and dedicated SKUs on different hosts (Hetzner's docs say its shared and dedicated types are on different hardware generations).

### Memory

Memory is harder to overcommit than CPU because a guest that has been given memory doesn't know it can be taken back. Waldspurger's three techniques are still the vocabulary: a **balloon** driver in the guest that the host inflates to make the guest's own allocator free pages (the guest chooses which, so it pages out what it can spare), **page sharing** that merges identical pages across VMs copy-on-write, and reclaiming idle memory first. Past those, the host swaps guest memory to disk, which is the failure mode customers notice. A provider that sells dedicated memory doesn't overcommit it; a provider that sells cheap VPS plans often does, and the limit of overcommit is whatever its customers will tolerate during the hour when everyone's memory is busy.

### Disk and network

Disk and network are shared through the host's queues: a VM's virtual disk is a file, a logical volume or a network block device, and its I/O competes with every other guest's on the same devices. Providers cap per-VM IOPS and throughput, and per-VM network bandwidth (with burst allowances on smaller sizes), which is the subject of [Storage: Block, File & Object](/books/hosting-and-cloud/storage#block-volumes) and [Data Center Networking](/books/hosting-and-cloud/data-center-networking). Shared-kernel VPS platforms enforce the same limits with kernel counters, as OpenVZ's beancounters did and CloudLinux's LVE does for shared hosting ([Shared Hosting Isolation](/books/hosting-and-cloud/shared-hosting-isolation)).

## Burstable Credits at Operator Depth

The credit model is a ledger per VM, and AWS's documentation is the most complete public description of one:

- **Unit:** one CPU credit is one vCPU at 100% for one minute, or any equivalent (one vCPU at 50% for two minutes, two vCPUs at 25% for two minutes).
- **Earning:** each instance earns at a fixed rate per hour set by its size (t3.nano 6, t3.micro 12, t3.small and t3.medium 24, t3.large 36, t3.xlarge 96, t3.2xlarge 192), continuously and at millisecond resolution.
- **Baseline:** the utilization at which earning equals spending: `(credits earned per hour / vCPUs) / 60 minutes`, so 5% per vCPU for a t3.nano and 30% for a t3.large.
- **Accrual limit:** a day's earnings (144 for a t3.nano, 288 for a t3.micro); credits earned above it are discarded.
- **Life span:** credits on a running instance don't expire; on T3, T3a, T4g and T8i they persist for seven days after a stop, while a stopped T2 loses them. T2 in Standard mode also gets launch credits, which don't count toward the limit.
- **Standard mode:** spend accrued credits; at zero, the instance "gradually comes down to baseline" until it earns more. T2 defaults to Standard.
- **Unlimited mode:** spend accrued credits, then **surplus** credits, which later earnings pay down; if the average over a rolling 24 hours (or the instance's life, if shorter) exceeds baseline, the excess is billed at a flat rate per vCPU-hour. T3, T3a, T4g and T8i default to Unlimited, except T3 on a Dedicated Host, where Unlimited isn't supported.

Azure's B-series states the same ledger as a formula: credits banked per minute = `((Base CPU performance * vCPUs) - (Percentage CPU * vCPUs)) / 100`, so a Standard_B2ts_v2 (20% base, 2 vCPUs) at 10% banks 0.2 credits a minute, and a Standard_B32as_v2 (40% base, 32 vCPUs) at 60% spends 6.4. Google's shared-core model has no bank: an e2-micro can run at 100% for 30 seconds, "only possible periodically," at no extra charge.

The billing consequence is that a burstable VM has two meters: instance-seconds, and surplus vCPU-hours when Unlimited is on. The surplus is computed over a rolling window, so it can't be rated per event; it is a periodic computation over the credit ledger, emitted as a usage event for the window that produced it.

## The VPS as a Product

Across developer clouds and web hosts, a VPS plan is a fixed bundle: vCPUs (shared or dedicated), memory, a disk, a transfer allowance and an IPv4 address, for a monthly price that caps hourly billing. What varies is everything the bundle doesn't say. The questions a buyer should ask, and a provider should be able to answer from its own records:

- **Which hypervisor or kernel?** A KVM VPS runs its own kernel and any operating system; a container VPS (OpenVZ, Virtuozzo, LXC) runs the host's kernel, so the customer can't choose the kernel version or load kernel modules of its own.
- **Shared or dedicated CPU, and what ratio?** The SKU says which; the ratio is the provider's business, but steal time shows it.
- **Is memory overcommitted?** A plan that promises dedicated memory shouldn't balloon it.
- **What happens on host failure?** A provider with live migration moves VMs off a host before maintenance; one without reboots them. Unplanned host failure restarts the VM elsewhere, or doesn't, depending on whether its disk was local.
- **What's metered beyond the bundle?** Transfer above the allowance, snapshots and backups, extra IPs, and in the hyperscalers, CPU surplus.

The provider's half is the host fleet: hypervisor hosts are dedicated servers held by the provider's internal account ([Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers#how-to-build-it)), each with a capacity in vCPUs, memory and disk, an overcommit policy, and a placement service that decides which VM goes where.

## Epilogue: Broadcom and VMware

Broadcom announced its acquisition of VMware on May 26, 2022, for about $61 billion in cash and stock plus about $8 billion of VMware net debt, the roughly $69 billion figure, and completed it on November 22, 2023. On December 11, 2023, Broadcom announced the end of sale of perpetual licenses and of Support and Subscription (SnS) renewals for perpetual offerings, "beginning today (effective dates will vary)," moving customers to subscriptions. For hosting providers that built VPS and private-cloud products on vSphere, the license became a cost they no longer controlled, and the alternatives they priced against it were KVM-based: open-source stacks on their own hardware, or the clouds. The European cloud trade body CISPE's court challenge to the clearance and the providers' complaints belong to the later chapter Licensing Disputes; at home scale, the end of the free ESXi is the subject of Hypervisors at Home. The lesson for this chapter is the same one the timeline drew for infrastructure-as-code tools: a hypervisor is a dependency with an owner, and the owner can change the price.

## The Alternatives

| Hypervisor or platform | Model | Strengths | Failure modes | Licensing and ownership | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **KVM (with QEMU or a custom VMM)** | Linux kernel module, hardware-assisted | Any guest OS, in-kernel maintenance, broad tooling, near-native CPU | A kernel per guest; the VMM is the attack surface | GPL, in Linux | Most clouds and developer clouds |
| **Xen** | Type 1 hypervisor; paravirtualized or hardware-assisted guests | Small hypervisor, long security record, PV for old guests | Smaller ecosystem than KVM today | Open source (GPL) | Early EC2, some hosts |
| **VMware ESXi (vSphere)** | Proprietary type 1 hypervisor | Mature management, enterprise ecosystem | Subscription-only licensing since December 2023, price under one owner | Proprietary, Broadcom | Enterprises, private clouds, some hosts |
| **Hyper-V** | Microsoft type 1 hypervisor | Windows guests | Windows-centric management | Proprietary, Microsoft | Windows-heavy hosts |
| **Shared-kernel containers (OpenVZ, Virtuozzo, LXC)** | One kernel, many isolated user spaces | Highest density, near-zero overhead | Host kernel only; a kernel bug reaches every tenant; easy to oversell | OpenVZ and LXC open source; Virtuozzo commercial | Low-cost VPS, shared hosting |
| **Dedicated server** | No hypervisor | No overhead, no neighbors | No live migration, hours to provision | Hardware rental | Steady, heavy workloads (Dedicated Servers & Bare Metal) |

| CPU model | How it shares | Strength | Failure mode | Who sells it |
| --- | --- | --- | --- | --- |
| **Dedicated vCPU** | Threads pinned to one VM | Predictable performance | Highest price | All providers above |
| **Shared vCPU, no meter** | Overcommitted, best effort | Cheap, simple | Steal under contention, with no recourse | DigitalOcean Basic, Linode Shared, Hetzner shared |
| **Credit bank (Standard)** | Earn below baseline, spend above, throttle at zero | Bounded cost | Performance cliff at zero credits | AWS T family, Azure B-series |
| **Credit bank (Unlimited)** | Surplus credits, billed above the 24-hour baseline | No cliff | Surprise surplus charges | AWS T family |
| **Burst window** | Short burst at 100%, periodically | No bill shock | Short bursts only | Google E2 shared-core |

## My Default

My default for a provider selling VPS today is KVM with hardware-assisted guests on every host, a shared-CPU SKU and a dedicated-CPU SKU on separate hosts, no memory overcommit beyond what ballooning recovers from idle guests, and live migration for planned maintenance. For the shared SKU I'd publish a usage rule the way Linode does and expose steal time in the customer's metrics rather than build a credit ledger, because a ledger is a second billing system and a support queue about throttling; I'd build the ledger only if I needed to sell sub-core instances to price-sensitive customers at hyperscaler scale, where the meter pays for itself. I'd keep shared-kernel containers out of the VPS product and use them where they belong, under managed services and shared hosting, and I'd keep any proprietary hypervisor to customers who ask for it by name.

What would change it: a customer base that is all Windows (Hyper-V), a need for microVM-grade isolation of untrusted code at function-level density (Sandboxes & MicroVMs), or a private-cloud product whose buyers require vSphere, in which case the license is a pass-through SKU with its own price versions.

## How to Build It

The chapter adds hypervisor, CPU-model, credit and host columns to `virtual_machines` and a `cpu_credit_balances` ledger to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Hosts are `hardware_assets` from [Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers#how-to-build-it); the placement decision that chose the host is Schedulers: Borg to Kubernetes's `placement_decisions`; the isolation level is added by Sandboxes & MicroVMs.

```sql
ALTER TABLE virtual_machines
  ADD COLUMN hypervisor       TEXT NOT NULL DEFAULT 'kvm'
    CHECK (hypervisor IN ('kvm', 'xen', 'esxi', 'hyper_v', 'openvz', 'virtuozzo', 'lxc',
                          'nitro', 'firecracker', 'none')),  -- 'none': a bare-metal instance
  ADD COLUMN host_asset_id    UUID REFERENCES hardware_assets (id),  -- current host; host_ref
                                                                    -- stays as the opaque label
  ADD COLUMN vcpus            SMALLINT NOT NULL,
  ADD COLUMN memory_mib       INT NOT NULL,
  ADD COLUMN cpu_model        TEXT NOT NULL DEFAULT 'dedicated'
    CHECK (cpu_model IN ('dedicated', 'shared', 'burstable', 'shared_core')),
  ADD COLUMN baseline_pct     NUMERIC(5,2),         -- per vCPU, for burstable
  ADD COLUMN credits_per_hour NUMERIC(8,2),         -- earn rate, from the instance type
  ADD COLUMN credit_cap       NUMERIC(10,2),        -- accrual limit
  ADD COLUMN credit_mode      TEXT CHECK (credit_mode IN ('standard', 'unlimited')),
  ADD COLUMN memory_overcommit BOOLEAN NOT NULL DEFAULT FALSE,
  ADD CONSTRAINT vm_credit_fields CHECK (CASE WHEN cpu_model = 'burstable'
    THEN num_nulls(baseline_pct, credits_per_hour, credit_cap, credit_mode) = 0
    ELSE num_nonnulls(baseline_pct, credits_per_hour, credit_cap, credit_mode) = 0 END);

CREATE TABLE vm_host_history (           -- where a VM ran, over time
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  vm_id           UUID NOT NULL REFERENCES resources (id),   -- kind = 'virtual_machine'
  host_asset_id   UUID NOT NULL REFERENCES hardware_assets (id),
  ran_during      TSTZRANGE NOT NULL,
  moved_by        TEXT CHECK (moved_by IN ('live_migration', 'restart', 'host_failure')),
  EXCLUDE USING GIST (vm_id WITH =, ran_during WITH &&)
);

CREATE TABLE cpu_credit_balances (       -- the ledger, one row per VM per interval
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  vm_id            UUID NOT NULL REFERENCES resources (id),
  account_id       UUID NOT NULL REFERENCES accounts (id),
  interval_during  TSTZRANGE NOT NULL,   -- e.g. five minutes
  earned           NUMERIC(12,4) NOT NULL,
  spent            NUMERIC(12,4) NOT NULL,
  discarded        NUMERIC(12,4) NOT NULL DEFAULT 0,  -- earned above the cap
  accrued_balance  NUMERIC(12,4) NOT NULL,             -- after the interval
  surplus_balance  NUMERIC(12,4) NOT NULL DEFAULT 0,   -- unlimited mode only
  launch_credits   NUMERIC(12,4) NOT NULL DEFAULT 0,
  mode             TEXT NOT NULL CHECK (mode IN ('standard', 'unlimited')),
  throttled        BOOLEAN NOT NULL DEFAULT FALSE,     -- standard mode at zero
  UNIQUE (vm_id, interval_during),
  EXCLUDE USING GIST (vm_id WITH =, interval_during WITH &&)
);
```

Notes on the sketch:

- **The ledger is derived, the meter is raw.** Hypervisor CPU samples arrive as `usage_events` with meter `vm.cpu_vcpu_ms`; the credit ledger is computed from them and the VM's earn rate, interval by interval, so it can be recomputed after a sampling bug exactly as rating is rerun.
- **Surplus is billed from the ledger.** For Unlimited VMs, a periodic job reads the rolling 24-hour window, and if average usage exceeded baseline, emits a `usage_events` row with meter `vm.cpu_surplus_vcpu_hours`, an idempotency key of the VM and window, and the window as `occurred_during`; rating applies the per-vCPU-hour SKU. Paid-down surplus never generates a charge.
- **Instance types own the numbers.** Earn rate, cap and baseline are copied from the instance type when the VM is created or resized, so a later change to the catalog doesn't rewrite a running VM's ledger.
- **Hosts are history, not a column.** `host_asset_id` is a cache of the open row in `vm_host_history`; the history answers "which customers were on the host that failed" and "who shared a host with this VM on that date," which noisy-neighbor complaints and side-channel investigations ask.
- **Shared-kernel VPS is a hypervisor value, not a separate kind.** An OpenVZ or LXC VPS is still `kind = 'virtual_machine'` to billing and abuse; the `hypervisor` value tells support and the isolation column added later tells security what it really is.
- **Events:** `vm.created`, `vm.resized`, `vm.migrated`, `vm.host_failed`, `vm.credits_exhausted`, `vm.throttled`, `vm.surplus_billed` and `host.overcommit_exceeded` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to billing, the customer's metrics and capacity planning.

## Auditing

- **Where every VM ran.** Host history with the reason for each move, kept as long as abuse and law enforcement requests can reach back, because a host-level incident has to resolve to every customer on it.
- **How every surplus charge was computed.** The ledger rows, the window and the baseline that produced each surplus line, because the charge is a computation the customer can't see and will dispute ([Audit Trails](/docs/architecture/audit-trails#snapshot-what-changes-underneath-you)).
- **Overcommit by host.** Sold vCPUs and memory against physical capacity per host over time, which answers whether a dedicated-CPU SKU was ever placed on an overcommitted host.
- **Hypervisor and license changes.** Which hosts ran which hypervisor version and which license, because a vendor's license audit counts sockets and cores on dates.

## What This Means for the System You Build

- **Sell shared and dedicated CPU as different SKUs on different hosts,** and show the customer steal time.
- **Treat memory overcommit as a product decision,** stated per SKU, never a silent host setting.
- **Build a credit ledger only if you'll meter bursts,** and compute it from raw CPU samples so it can be recomputed.
- **Bill surplus as a windowed usage event** with an idempotency key per VM and window.
- **Record which host each VM ran on, over time,** so a host incident resolves to its customers.
- **Prefer KVM and keep proprietary hypervisors as pass-through licenses,** because the license owner can change the price.

## References

**Papers and standards**

- [Waldspurger: Memory Resource Management in VMware ESX Server](https://www.usenix.org/conference/osdi-02/memory-resource-management-vmware-esx-server), OSDI, December 2002, ballooning, content-based page sharing and idle memory reclamation
- [Barham et al.: Xen and the Art of Virtualization](https://www.cl.cam.ac.uk/research/srg/netos/papers/2003-xensosp.pdf), SOSP, October 2003, paravirtualization, the 64 MB hypervisor region, event channels, I/O rings, the 100-VM target and VMware's binary translation and shadow page tables
- [Linux kernel documentation: The /proc filesystem](https://docs.kernel.org/filesystems/proc.html), steal as "involuntary wait" in `/proc/stat`

**Filings**

- [VMware: Form S-1 (2007)](https://www.sec.gov/Archives/edgar/data/0001124610/000119312507090409/ds1.htm), incorporation in 1998, Workstation in 1999, ESX Server and GSX Server in 2001
- [Broadcom: Form 8-K exhibit 99.1 (May 2022)](https://www.sec.gov/Archives/edgar/data/1730168/000119312522160371/d323890dex991.htm), the announced acquisition of VMware and its consideration and net debt
- [Broadcom: Form 8-K exhibit 99.1 (November 2023)](https://www.sec.gov/Archives/edgar/data/1730168/000114036123054354/ef20015100_ex99-1.htm), completion on November 22, 2023

**Provider documentation**

- [AWS: Key concepts for burstable performance instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/burstable-credits-baseline-concepts.html), the credit unit, earn rates, accrual limits, life spans, launch and surplus credits, Standard and Unlimited modes and millisecond accounting
- [Microsoft Learn: B-series CPU credit model](https://learn.microsoft.com/en-us/azure/virtual-machines/sizes/b-series-cpu-credit-model), base performance, banked credits and the per-minute formula
- [Google Cloud: General-purpose machine family](https://docs.cloud.google.com/compute/docs/general-purpose-machines), E2 shared-core fractional vCPUs, burst durations and no extra charge
- [DigitalOcean: Choosing a Droplet plan](https://docs.digitalocean.com/products/droplets/concepts/choosing-a-plan/), shared and dedicated CPU and the vCPU as a hyper-thread
- [Akamai: Shared CPU compute instances](https://techdocs.akamai.com/cloud-computing/docs/shared-cpu-compute-instances), contention, short bursts and the 80% sustained guideline
- [Hetzner: Cloud servers overview](https://docs.hetzner.com/cloud/servers/overview/), shared and dedicated resources
- [KVM: Main page](https://www.linux-kvm.org/page/Main_Page), the kernel modules, the VT and AMD-V requirement, private virtualized hardware and mainline inclusion
- [OpenVZ: Features](https://wiki.openvz.org/Features), two-level quotas, the fair-share CPU scheduler, I/O priority and User Beancounters

**Announcements and release notes**

- [Intel: Intel Delivers New Era For Virtualization](https://www.intel.com/pressroom/archive/releases/2005/20051114comp.htm), VT in the Pentium 4 662 and 672, November 14, 2005
- [eWeek: AMD adds virtualization to desktop line](https://www.eweek.com/pc-hardware/amd-adds-virtualization-new-cpus-to-desktop-line/), AMD-V with the Socket AM2 launch, May 23, 2006
- [BetaNews: Barcelona quad-core Opterons feature virtualization support](https://betanews.com/2007/09/10/barcelona-quad-core-opterons-now-feature-virtualization-support), nested paging, September 10, 2007
- [eWeek: Intel Core i7 launches November 17](https://www.eweek.com/pc-hardware/intel-core-i7-processor-launches-nov-17-and-enterprise-chips-to-follow/), Nehalem and Extended Page Tables
- [Kernel Newbies: Linux 2.6.20](https://kernelnewbies.org/Linux_2_6_20), KVM, released February 5, 2007
- [OpenVZ: History](https://wiki.openvz.org/History), Virtuozzo's January 2002 release, OpenVZ in 2005, live migration in November 2006 and CRIU
- [eWeek: SWsoft changing name to Parallels](https://www.eweek.com/networking/swsoft-changing-name-to-parallels/), December 12, 2007
- [Blocks and Files: Virtuozzo storage](https://www.blocksandfiles.com/block/2019/02/07/virtuozzo-storage-is-like-ceph-only-faster/1606215), Virtuozzo's 2016 spin-out
- [AWS News Blog: Low-cost burstable EC2 instances](https://aws.amazon.com/blogs/aws/low-cost-burstable-ec2-instances/), T2 on July 1, 2014, the CPU credit and the t2.micro baseline and cap
- [AWS News Blog: Amazon EC2 Beta](https://aws.amazon.com/blogs/aws/amazon_ec2_beta/), EC2 on Xen, August 25, 2006
- [VMware by Broadcom: Business transformation (Wayback copy)](http://web.archive.org/web/20231216021905/https://news.vmware.com/company/vmware-by-broadcom-business-transformation), December 11, 2023, the end of perpetual licenses and SnS renewals
</content>
</invoke>
