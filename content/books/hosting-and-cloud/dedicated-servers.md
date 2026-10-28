+++
title = "Dedicated Servers & Bare Metal"
description = "Renting whole machines from Rackspace and SoftLayer to bare-metal clouds: PXE, IPMI and Redfish provisioning, reimaging and wiping, spares and inventory."
category = "Hosting & Cloud Industry"
order = 2106
part = "The Stack, Bottom to Top"
tags = ["bare-metal", "dedicated-servers", "provisioning", "hardware", "lifecycle"]
+++

A dedicated server is a whole machine rented by the month or the hour: the customer gets every core, every disk and the root password, and the provider owns the hardware, the rack, the network, the spare parts and the job of making a returned machine safe for the next customer. It's the oldest product in hosting after the shared account and the one that never went away. Dedicated servers still sell where a virtual machine's overhead, noisy neighbors or licensing rules don't fit: databases that want every IOPS, game servers that want a fixed clock, workloads licensed per physical socket, GPU nodes, and providers that build their own clouds on someone else's machines. The clouds came back to it too: AWS, IBM, Oracle and the developer clouds all sell bare-metal instances, provisioned through an API in minutes instead of a ticket in days.

What makes the product hard isn't the server; it's the fleet. A provider with thousands of machines in many facilities needs to know where every asset is and what state it's in, power and console it without a person on site, install an operating system on it from the network, wipe it so the next tenant can't read the last one's data, and keep enough spare parts and spare machines to replace failures inside the SLA. This chapter covers how the business got here, how the providers sell it as of October 2026, and how provisioning works at operator depth: PXE and iPXE, IPMI and Redfish, rescue systems, reimaging, sanitization, spares and inventory. It adds `servers`, `hardware_assets` and `reimage_jobs` to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). The building and cabinets are [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation); the switches and private networks between servers are [Data Center Networking](/books/hosting-and-cloud/data-center-networking); slicing a server into virtual machines is [Virtualization & the VPS](/books/hosting-and-cloud/virtualization-and-vps); and the hypervisor-free bare-metal instance as an isolation level is [Sandboxes & MicroVMs](/books/hosting-and-cloud/sandboxes-and-microvms).

## How the Providers Do It

| Provider | Product as published (as of October 2026) | Provisioning and access | What it shows |
| --- | --- | --- | --- |
| **Hetzner** | Dedicated root servers by the month; a Server Auction of used machines from €72.70 a month, "All without setup fees"; setup fees on new servers raised again in April 2026 because RAM and NVMe prices "have continued to rise" | Robot console; a Debian-based Rescue System booted by Robot, then `installimage` from the rescue shell; a KVM console attached by a technician on request, free for 3 hours; Remote Hands at €21 per 15 minutes | Low price by reusing hardware; out-of-band access as a staffed service, not a self-service BMC |
| **OVHcloud** | Ranges from Kimsufi and Rise to Advance, Scale and High Grade, priced monthly; Rise lists an installation fee per plan (RISE-1: $64) | "Deploy your servers in less than 120 seconds," stated as non-contractual; IPMI with an HTML or Java KVM, serial over LAN in the browser or over SSH, and ISO mounting | Self-service BMC access as a feature, tiered by range |
| **Vultr Bare Metal** | Bare metal on the same API and console as its cloud | Reinstall, change OS, restart, stop, tag, monitor or destroy from the API or console | A bare-metal SKU inside a developer cloud |
| **Latitude.sh** | Hourly, monthly ("50% cheaper than hourly") and yearly ("65% cheaper") billing | Custom operating systems installed over IPMI | Hourly bare metal priced to push commitment |
| **phoenixNAP Bare Metal Cloud** | Billed by the hour, with monthly or yearly reservations that "save up to 30%" | "Deployed in as little as 60 seconds" (60 seconds to two or three minutes by OS); one API call; CLI, Terraform and Ansible | Bare metal as infrastructure as code |
| **IBM Cloud** | Classic bare metal billed hourly or monthly; VPC bare metal billed in arrears from provision to cancellation | Classic fast-provisioned servers ready "30 - 40 minutes after provisioning"; VPC "in 10 minutes or less when resources are available" | SoftLayer's dedicated business inside a cloud, with two generations side by side |
| **Oracle Cloud (OCI)** | Bare metal compute instances for "dedicated physical server access" and "strong isolation" | Serial console on bare metal instances launched in November 2017 or later | Bare metal as a first-class instance shape |
| **AWS** | `.metal` instances since the i3.metal preview on November 28, 2017; Mac instances only as bare metal on Dedicated Hosts with a 24-hour minimum allocation | Launches like any instance; a Mac host runs "a scrubbing workflow" when stopped or terminated, and takes about 6 to 20 minutes to launch | The hypervisor removed, with the provider's card still in control of I/O |
| **Equinix Metal** | Equinix stopped commercial sales in late 2024 and planned to shut the platform down by June 30, 2026 (as reported) | API-driven bare metal | Even a large operator exits bare metal when the margin isn't there |

Four patterns run through the table. **The price is the hardware's age and the setup fee:** a used-server auction with no setup fee, a new server with one, and an hourly instance that pays for its own idle time are three ways to recover the same capital. **Out-of-band access is the differentiator:** OVHcloud and Latitude.sh expose the BMC, Hetzner attaches a KVM by hand, and the clouds hide the BMC entirely behind an API, a serial console and their own management card. **Provisioning time went from days to seconds by not racking anything:** every "60 seconds" or "120 seconds" claim is a machine already racked, cabled and powered, waiting in a pool, and the stated times are non-contractual. **The exit is part of the product:** Equinix Metal's shutdown is the case every bare-metal customer should plan for, and a returned server is wiped before it's resold.

## How It Got Here

### Managed servers by the month (1998 to 2008)

Rackspace's operations began in 1998 as a limited partnership in San Antonio renting managed servers; it incorporated in Delaware as Rackspace.com, Inc. on March 7, 2000 and listed on the NYSE on August 8, 2008, selling 15,000,000 shares at $12.50 ($187.5 million gross), with "Fanatical Support" as its brand. The model was a server the provider bought, racked and supported, rented under a term contract. **What it solved:** a machine without a building or a hardware budget. **What it cost:** days to provision, one customer per box, and support staff for each.

### Automation at scale (2005 to 2013)

The next generation of dedicated providers competed on how little a person had to do between an order and a running server. SoftLayer was one of them: when IBM announced its definitive agreement to acquire SoftLayer on June 4, 2013 (terms not disclosed), SoftLayer had about 21,000 customers and 13 data centers in the US, Asia and Europe, and was majority-owned by GI Partners; IBM said it expected $7 billion a year of cloud revenue by the end of 2015. The same years produced the standards automation needed. Intel's Preboot Execution Environment (PXE) specification version 2.1 is dated September 20, 1999 and let a server boot from the network into an installer. Dell, HP, Intel and NEC announced IPMI version 2.0 on February 18, 2004, adding Serial over LAN for remote interaction with "BIOS and operating system" and "new authentication and encryption algorithms" for remote management access. **What it solved:** a server ready in hours from a portal, reinstalled without a ticket. **What it cost:** a fleet of identical machines held in stock, and a management network to every BMC.

### Bare metal behind an API (2015 to now)

The DMTF released Redfish 1.0 in August 2015, which The Register called the "heir to IPMI," a RESTful API that "departs from IPMI by not assuming a particular vendor or server is present." AWS previewed i3.metal on November 28, 2017, an EC2 instance "with direct access to hardware," made possible because its Nitro cards and Nitro Security Chip, not a hypervisor, own I/O and the hardware root of trust; trade press reported general availability on May 22, 2018. Tinkerbell, a bare-metal provisioning engine (network and ISO booting, BMC interactions, a metadata service and a workflow engine), was accepted into the CNCF sandbox on November 10, 2020. Rackspace went private to Apollo in 2016 for $32 a share, about $4.3 billion, and returned to the market on Nasdaq in 2020 with terms set at 33.5 million shares at $21 to $24. Equinix stopped selling its bare-metal service in late 2024 and set its end of life for June 2026. **What it solved:** a whole machine in minutes, billed by the hour, managed like a VM. **What it cost:** pools of idle racked hardware the provider pays for, and a hardware-level security problem every time a machine changes hands.

## Provisioning: Power, Console and Boot

Every automated dedicated platform rests on three things the provider controls without touching the machine.

**The baseboard management controller (BMC).** A small computer on the motherboard with its own network port, powered whenever the chassis has power, that can turn the server on and off, read its sensors, set its next boot device and give a console. It speaks **IPMI** (version 2.0 since 2004, which added Serial over LAN and stronger authentication and encryption) and, on current servers, **Redfish** (a REST API, with "Serial console access via SSH" among its functions in DMTF's 2016 introduction). The BMC network is the most sensitive network the provider runs: anyone on it can power-cycle, reinstall or console into any server. Providers keep it on a separate management network, never reachable from the tenant's interfaces, and expose it to customers, if at all, through a proxy: OVHcloud's browser KVM and serial over LAN, Latitude.sh's IPMI for custom installs, Hetzner's technician-attached KVM.

**Network boot.** The server's firmware asks DHCP for an address and a boot file, fetches a small loader over TFTP (PXE) and runs it. **iPXE**, "the leading open source network boot firmware," extends that to HTTP, iSCSI and other transports, so the loader can fetch a kernel, an initramfs and a script from the provisioning service over HTTP with per-machine parameters. Tinkerbell's Smee component is exactly this: a "DHCP & iPXE Server."

**An in-memory operating system.** The netbooted environment runs entirely in RAM and does the work: inventories the hardware, runs burn-in tests, wipes disks, partitions, writes an image and sets the bootloader. Hetzner's Rescue System is the customer-facing version, "a Debian based Linux live environment" activated in Robot, followed by a reboot; its `installimage` script installs a distribution "directly from the Rescue System." Tinkerbell's Hook, its in-memory operating system, is a provider-side version.

The two open-source provisioning systems most providers learn from encode the lifecycle as states:

| Stage | Canonical MAAS | OpenStack Ironic | What happens |
| --- | --- | --- | --- |
| Discovery | New (enlisted when it PXE or iPXE boots on a MAAS subnet) | `enroll` | The machine is registered with its BMC address and credentials |
| Inspection | Commissioning | `manageable` | Hardware inventory and tests in the RAM environment |
| Ready | Ready | `available` | In the pool, wiped, waiting for an allocation |
| Allocated | Allocated | (claimed by a workload) | Assigned to a tenant; nothing installed yet |
| Install | Deploying | `deploying` | Image written, bootloader set, network configured |
| In use | Deployed | `active` | The customer's machine |
| Return | Releasing (disk wipe "if secure erase options are selected") | `cleaning` ("scrubbed and reprogrammed into a known configuration") | Wiped and reset before returning to the pool |

Ironic drives power and boot through hardware types named for the management protocol: the IPMI driver, Intel IPMI, Redfish and iDRAC. Tinkerbell splits the same jobs into Tink (workflows), Smee (DHCP and iPXE), Tootles (metadata), Rufio (BMC interactions) and Hook (the in-memory OS).

## Reimaging and Sanitization

A reimage is the provider's most frequent operation on a dedicated server, and it runs for three reasons: the customer asks for a reinstall, a server is allocated to a new customer, or a server is released. The first is a convenience; the other two are security boundaries.

The job sequence is the same in every system: set the next boot to network through the BMC, power-cycle, boot the in-memory environment, check the hardware against the inventory record, wipe, partition, write the image, inject the customer's SSH keys and network configuration (from a metadata service, Tinkerbell's Tootles or a cloud-init datasource), set the boot device back to disk, reboot, and verify the machine answers on its public address. Each step can fail, and a failed reimage leaves a machine that is neither the customer's nor in the pool, so the job's state has to be persisted and retried, not held in a script's memory.

Sanitization is the part that can't be skipped. NIST SP 800-88 Rev. 2 (September 2025, superseding Rev. 1 of December 2014) is the reference for media sanitization, rendering "access to target data on the media infeasible for a given level of effort," and names cryptographic erase and secure erase among its methods. A provider's release workflow chooses one per media type and records it: a drive's built-in secure erase or a cryptographic erase for self-encrypting drives, overwrite where neither is trusted, and physical destruction for a drive leaving the fleet. MAAS describes the release step as wiping disks so "sensitive data isn't passed to the next user"; Ironic's `cleaning` state is the same gate. Firmware is part of it: a tenant with root on a whole machine is in a position to tamper with device firmware, so a release workflow should check firmware versions against the expected set, and the clouds solve it in hardware (AWS's Nitro Security Chip as a root of trust is what makes its bare-metal instances safe to resell; a Mac host runs "a scrubbing workflow" when it's stopped or terminated).

## Spares, Inventory and Failure

A dedicated provider's SLA is a promise about parts. When a disk or a power supply fails, the time to repair is the time to get a technician and the right part to the cabinet; when a motherboard fails, it's the time to move the customer to another machine. Backblaze's 2025 drive statistics, from 344,196 analyzed drives, put the year's annualized failure rate at 1.36%, down from 1.55% in 2024: a fleet of 10,000 such drives loses more than 130 a year, every week of the year. The arithmetic decides the stock:

- **Spare parts per facility,** by component and model, sized from the fleet's own failure rates and the vendor's replacement lead time, because a warranty replacement in five days doesn't help a customer down now.
- **Spare machines per configuration,** racked and wiped in the `available` pool, so a dead server becomes a migration to an identical one.
- **Warranty and end-of-life dates** per asset, because a machine past warranty turns every failure into a purchase.
- **Burn-in before sale:** new and repaired machines run tests in the in-memory environment before they enter the pool; Ironic's and MAAS's commissioning steps exist for this.

The inventory itself is the system of record: every asset with its serial number, location to the rack unit, BMC address, configuration, lifecycle state and history. A machine that is "somewhere in Frankfurt" can't be repaired, reallocated, wiped or audited.

## The Alternatives

| Model | Strengths | Failure modes | Ownership and licensing | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **Own servers in colocation** | Full hardware choice, lowest unit cost at steady load | Capital, spares and remote hands; procurement lead times | Owned hardware; the provider runs the provisioning stack | Hardware amortization plus colo | Clouds, larger hosts, repatriating companies |
| **Monthly dedicated rental** | No capital; provider handles parts and reimaging | Fixed configurations, setup fees, slower provisioning, the provider's network only | Rented; OS licenses per server | Per server per month | Hosts, game servers, databases, budget-sensitive steady load |
| **Hourly bare-metal cloud** | API provisioning in minutes, hourly billing, infrastructure as code | Higher unit price than monthly; the provider can exit the product (Equinix Metal) | Rented by the hour | Hourly, with reservations | CI fleets, bursty HPC, Kubernetes on metal |
| **Hyperscaler `.metal` instances** | The cloud's network, storage and IAM on a whole machine | Highest price; limited configurations; the provider's card still controls I/O | Usage terms | Instance-hours | Hypervisor and nested-virtualization workloads, per-socket licensing, macOS builds |
| **Virtual machines** | Seconds to provision, live migration, many sizes | Hypervisor overhead, noisy neighbors, per-socket licensing problems | Usage terms | Per second | Most workloads (Virtualization & the VPS) |

| Provisioning stack | Model | Strengths | Failure modes | License |
| --- | --- | --- | --- | --- |
| **MAAS** | A machine lifecycle from enlistment to release | Complete lifecycle, Ubuntu integration | One vendor's project | Open source, Canonical |
| **OpenStack Ironic** | Bare metal as an OpenStack compute driver, or standalone | Driver breadth (IPMI, Redfish, iDRAC), cleaning steps | OpenStack's operational weight | Open source, OpenStack |
| **Tinkerbell** | Workflows of containerized actions over iPXE | Small, composable, Kubernetes-native | Fewer turnkey features | CNCF sandbox project |
| **Vendor tools** | The server vendor's deployment suite over its own BMC | Firmware and BMC depth for one vendor | Lock-in to one hardware vendor | Proprietary |
| **Hand-built PXE and scripts** | DHCP, TFTP, kickstart or preseed | Simple to start | State in scripts, no wipe gate, no inventory | Whatever is used |

## My Default

My default for a provider selling dedicated servers is Redfish where the hardware supports it and IPMI only where it doesn't, both on a management network no tenant interface can reach; iPXE over HTTP from a provisioning service with a state machine like Ironic's or MAAS's rather than scripts; and a release workflow that won't return a machine to the pool until a sanitization step for every drive and a firmware check have succeeded and been recorded. I'd sell monthly servers with a setup fee for configurations I hold in stock and hourly bare metal only for configurations I keep a pool of, because the hourly price has to pay for the idle machines. I'd give customers a console (serial over LAN or a browser KVM through a proxy) and a rescue system, and never direct BMC access on shared management networks.

What would change it: a fleet small enough that a person with a crash cart is cheaper than a provisioning stack (a few dozen machines in one cabinet), or a customer base that needs only virtual machines, in which case the dedicated product becomes the hypervisor hosts behind Virtualization & the VPS.

## How to Build It

The chapter adds a `servers` side table for kind `server`, a `hardware_assets` table for every physical asset (servers, switches, PDUs, storage and GPU nodes, DPU cards), its state history, and `reimage_jobs` to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Assets sit in the cabinets and facilities of [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation#how-to-build-it). A resource is what a customer holds; an asset is what the provider owns, and a server resource points at the asset behind it for as long as it holds it.

```sql
CREATE TABLE hardware_assets (           -- every physical asset the provider owns or leases
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  asset_tag        TEXT NOT NULL UNIQUE,
  asset_class      TEXT NOT NULL CHECK (asset_class IN ('server', 'gpu_node', 'storage_node',
                     'switch', 'pdu', 'dpu_card', 'nic', 'drive', 'other')),
  vendor           TEXT NOT NULL,
  model            TEXT NOT NULL,
  serial           TEXT NOT NULL,
  parent_asset_id  UUID REFERENCES hardware_assets (id),  -- a drive or DPU card in a server
  facility_id      UUID REFERENCES facilities (id),
  cabinet_id       UUID REFERENCES resources (id),        -- kind = 'cabinet'
  rack_unit        SMALLINT,             -- lowest U occupied
  rack_units       SMALLINT,             -- height
  bmc_address      INET,                 -- on the management network only
  bmc_protocol     TEXT CHECK (bmc_protocol IN ('redfish', 'ipmi', 'vendor')),
  config_code      TEXT,                 -- the sellable configuration it matches
  lifecycle_state  TEXT NOT NULL CHECK (lifecycle_state IN ('ordered', 'received', 'commissioning',
                     'available', 'allocated', 'repair', 'spare', 'quarantined',
                     'decommissioning', 'disposed')),
  warranty_ends    DATE,
  acquired_at      DATE,
  disposed_method  TEXT CHECK (disposed_method IN ('resold', 'recycled', 'destroyed', 'returned')),
  UNIQUE (vendor, serial),
  CHECK ((lifecycle_state = 'disposed') = (disposed_method IS NOT NULL))
);

CREATE TABLE hardware_asset_events (     -- append-only history; lifecycle_state is its cache
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  asset_id      UUID NOT NULL REFERENCES hardware_assets (id),
  from_state    TEXT,
  to_state      TEXT NOT NULL,
  location      TEXT,                    -- facility, cabinet and U at the time
  reason        TEXT NOT NULL,           -- 'burn_in_failed', 'disk_failure', 'customer_release'
  actor         TEXT NOT NULL,           -- typed actor: provisioning service, technician
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE servers (                   -- side table: kind = 'server'
  resource_id        UUID PRIMARY KEY REFERENCES resources (id),
  config_code        TEXT NOT NULL,      -- what was sold: CPU, RAM, disks, NICs
  billing_basis      TEXT NOT NULL CHECK (billing_basis IN ('monthly', 'hourly', 'reserved')),
  os_image           TEXT,               -- the image last installed by the provider
  console_access     TEXT NOT NULL CHECK (console_access IN ('none', 'serial_proxy',
                       'kvm_proxy', 'kvm_on_request')),
  role               TEXT NOT NULL CHECK (role IN ('customer', 'hypervisor_host',
                       'hosting_server', 'internal'))  -- hosts behind VMs and shared hosting too
);

CREATE TABLE server_assignments (        -- which asset backs which server, over time
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  server_id     UUID NOT NULL REFERENCES resources (id),        -- kind = 'server'
  asset_id      UUID NOT NULL REFERENCES hardware_assets (id),
  held_during   TSTZRANGE NOT NULL,
  ended_reason  TEXT CHECK (ended_reason IN ('released', 'hardware_failure', 'migration')),
  EXCLUDE USING GIST (asset_id WITH =, held_during WITH &&),    -- one holder per machine
  EXCLUDE USING GIST (server_id WITH =, held_during WITH &&)    -- one machine per server
);

CREATE TABLE reimage_jobs (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  asset_id        UUID NOT NULL REFERENCES hardware_assets (id),
  server_id       UUID REFERENCES resources (id),   -- null for a pool wipe
  trigger         TEXT NOT NULL CHECK (trigger IN ('customer_reinstall', 'allocation',
                    'release', 'repair_return', 'commissioning')),
  image           TEXT,                  -- null for wipe-only jobs
  sanitize_method TEXT NOT NULL CHECK (sanitize_method IN ('none', 'crypto_erase',
                    'secure_erase', 'overwrite')),
  state           TEXT NOT NULL CHECK (state IN ('queued', 'power_cycling', 'netbooting',
                    'inspecting', 'sanitizing', 'installing', 'configuring', 'verifying',
                    'succeeded', 'failed', 'cancelled')),
  attempt         SMALLINT NOT NULL DEFAULT 1,
  firmware_ok     BOOLEAN,               -- firmware versions matched the expected set
  failure_reason  TEXT,
  requested_by    TEXT NOT NULL,         -- typed actor
  started_at      TIMESTAMPTZ,
  finished_at     TIMESTAMPTZ,
  idempotency_key TEXT NOT NULL UNIQUE,  -- a retried API call doesn't start a second job
  CHECK (trigger NOT IN ('release', 'allocation') OR sanitize_method <> 'none')
);
```

Notes on the sketch:

- **Resources and assets are different things.** A customer's `server` resource keeps its ID, IP addresses and bill when the motherboard dies and the provider moves it to another machine; `server_assignments` records which asset backed it when, so an abuse report or a law enforcement request for a past date resolves to the hardware, and a hardware fault resolves to the customer.
- **The pool is a state, not a list.** `available` assets of a `config_code` are what an order or an hourly launch draws from; an allocation moves one to `allocated` in the same transaction as the assignment row, so two orders can't take the same machine.
- **Wiping is enforced by the schema.** The check on `reimage_jobs` refuses a release or allocation job with no sanitization, and the release workflow returns the asset to `available` only from a `succeeded` job with `firmware_ok` true.
- **The BMC address is an asset fact, never a resource fact.** It lives on `hardware_assets` and is reachable only from the provisioning service; customer console access is a column on `servers` that names the proxy, so no customer-visible row carries a BMC address.
- **Hypervisor and hosting servers are servers too.** `servers.role` lets the hosts behind [Virtualization & the VPS](/books/hosting-and-cloud/virtualization-and-vps) and [Shared Hosting Isolation](/books/hosting-and-cloud/shared-hosting-isolation) be the same resource kind on the same assets, held by the provider's internal account.
- **Events:** `asset.received`, `asset.state_changed`, `asset.failed`, `server.allocated`, `server.migrated`, `reimage.started`, `reimage.succeeded`, `reimage.failed` and `asset.disposed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to support, remote hands dispatch, billing and the customer's notifications.

## Auditing

- **Every asset's chain of custody.** Received, commissioned, allocated, repaired, wiped and disposed, with location, actor and reason, so the provider can say where a drive was and who held the server it was in on any date ([Audit Trails](/docs/architecture/audit-trails#typed-actors)).
- **Every wipe.** The method per drive, the job that ran it, and its result, because a customer's auditor (and a regulator after a breach) will ask how the provider knows the previous tenant's data was gone.
- **Who touched the BMC.** Every power action, boot-device change and console session, with the actor, because the management network can do anything a tenant can and more.
- **Which hardware backed which customer.** The assignment history, kept as long as abuse and law enforcement requests can reach back.

## What This Means for the System You Build

- **Separate the customer's server from the provider's asset,** and record which asset backs which server over time.
- **Keep the BMC network unreachable from tenants,** prefer Redfish, and log every out-of-band action.
- **Run provisioning as a persisted state machine** with retries, never as a script whose state lives in memory.
- **Refuse to return a machine to the pool unwiped,** and record the sanitization method per drive.
- **Size spares from the fleet's own failure rates** and the vendor's lead time, per facility and configuration.
- **Price hourly bare metal for its idle pool,** and treat provisioning-time claims as properties of the pool, not the hardware.
- **Plan the exit,** because providers retire bare-metal products and customers need their data and their addresses out first.

## References

**Papers and standards**

- [Intel: Preboot Execution Environment (PXE) Specification Version 2.1](https://wiki.cs.umbc.edu/images/3/3d/Pxespec.pdf), September 20, 1999 (university mirror of the specification)
- [Intel: Intel Boot Agent](https://edc.intel.com/content/www/us/en/design/products/ethernet/adapters-and-devices-user-guide/intel-boot-agent), compliance with PXE 2.1
- [Intel: IPMI 2.0 announcement](https://intel.com/pressroom/archive/releases/2004/20040218corp_a.htm), February 18, 2004, Serial over LAN and new authentication and encryption
- [Intel: IPMI second generation specification update](https://www.intel.com/content/dam/www/public/us/en/documents/specification-updates/ipmi-intelligent-platform-mgt-interface-spec-2nd-gen-v2-0-spec-update.pdf), the initial release on February 12, 2004
- [DMTF: Introduction to Redfish (May 2016)](https://www.dmtf.org/sites/default/files/SPMF%20Introduction%20to%20Redfish%20May%202016.pdf), v1.0 released August 2015 and serial console access via SSH
- [NIST SP 800-88 Rev. 2: Guidelines for Media Sanitization](https://csrc.nist.gov/pubs/sp/800/88/r2/final), September 2025, cryptographic and secure erase, superseding Rev. 1

**Filings**

- [Rackspace: 2008 prospectus (424B1)](https://www.sec.gov/Archives/edgar/data/0001107694/000119312508170930/d424b1.htm), operations from 1998, incorporation on March 7, 2000, the IPO terms and Fanatical Support
- [Rackspace: Form 10-K for 2008](https://www.sec.gov/Archives/edgar/data/0001107694/000119312509041402/d10k.htm), the August 8, 2008 listing

**Provider documentation**

- [Hetzner: Rescue System](https://docs.hetzner.com/robot/dedicated-server/troubleshooting/hetzner-rescue-system/), the Debian-based live environment activated in Robot
- [Hetzner: installimage](https://docs.hetzner.com/robot/dedicated-server/operating-systems/installimage/), installing from the Rescue System
- [Hetzner: KVM Console](https://docs.hetzner.com/robot/dedicated-server/maintainance/kvm-console/), a technician-attached KVM over IP, free for 3 hours
- [Hetzner: Price list for additional products](https://docs.hetzner.com/robot/general/pricing/price-list-for-additional-products), KVM console and Remote Hands prices
- [Hetzner: Server Auction](https://www.hetzner.com/sb/), no setup fees and the starting price as of October 2026
- [OVHcloud: Bare metal servers](https://www.ovhcloud.com/en/bare-metal/), ranges and the non-contractual 120-second delivery
- [OVHcloud: Rise servers](https://eco.ovhcloud.com/en/rise/), per-plan installation fees
- [OVHcloud: Using IPMI](https://docs.ovhcloud.com/en/guides/bare-metal-cloud/dedicated-servers/ipmi), browser KVM, serial over LAN and ISO mounting
- [Vultr: Bare Metal](https://docs.vultr.com/products/compute/bare-metal), self-service reinstall and lifecycle actions
- [Latitude.sh: Pricing](https://www.latitude.sh/pricing), hourly, monthly and yearly discounts
- [Latitude.sh: Documentation](https://www.latitude.sh/docs), custom OS installs over IPMI
- [phoenixNAP: Bare Metal Cloud](https://phoenixnap.com/bare-metal-cloud), deployment times, API and billing
- [IBM Cloud: Getting started with bare metal servers (classic)](https://cloud.ibm.com/docs/bare-metal?topic=bare-metal-getting-started), provisioning times and billing options
- [IBM Cloud: About bare metal servers for VPC](https://cloud.ibm.com/docs/vpc?topic=vpc-about-bare-metal-servers), provisioning in 10 minutes or less and billing in arrears
- [Oracle Cloud: Compute overview](https://docs.oracle.com/en-us/iaas/Content/Compute/Concepts/computeoverview.htm), bare metal instances
- [Oracle Cloud: Serial console](https://docs.oracle.com/en-us/iaas/Content/Compute/References/serialconsole.htm), bare metal instances launched in November 2017 or later
- [AWS: Amazon EC2 Mac instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-mac-instances.html), bare metal on Dedicated Hosts, the 24-hour minimum and the scrubbing workflow
- [AWS: The components of the Nitro System](https://docs.aws.amazon.com/whitepapers/latest/security-design-of-aws-nitro-system/the-components-of-the-nitro-system.html), Nitro Cards and the Nitro Security Chip
- [Canonical MAAS: About the machine life cycle](https://canonical.com/maas/docs/about-the-machine-life-cycle), states, PXE and iPXE enlistment and disk wiping on release
- [OpenStack Ironic: Bare metal states](https://docs.openstack.org/ironic/latest/user/states.html), enroll, manageable, available, deploying, active and cleaning
- [OpenStack Ironic: Drivers](https://docs.openstack.org/ironic/latest/admin/drivers.html), IPMI, Intel IPMI, Redfish and iDRAC hardware types
- [Tinkerbell](https://tinkerbell.org/), Tink, Smee, Tootles, Rufio and Hook
- [iPXE](https://ipxe.org/), open source network boot firmware and its transports

**Announcements and release notes**

- [IBM: IBM to acquire SoftLayer (Wayback copy)](http://web.archive.org/web/20130608133704/http://www-03.ibm.com:80/press/us/en/pressrelease/41191.wss), June 4, 2013, customers, data centers and the cloud revenue target
- [AWS News Blog: EC2 bare metal instances](https://aws.amazon.com/blogs/aws/new-amazon-ec2-bare-metal-instances-with-direct-access-to-hardware/), the i3.metal preview on November 28, 2017
- [AWS Insider: EC2 bare-metal instances generally available](https://awsinsider.net/articles/2018/05/22/aws-ec2-bare-metal-instances.aspx), May 22, 2018
- [CNCF: Tinkerbell](https://www.cncf.io/projects/tinkerbell/), sandbox acceptance on November 10, 2020
- [The Register: DMTF signs off Redfish 1.0](https://www.theregister.com/2015/08/05/dmtf_signs_off_redfish_server_management_spec_v_10/), August 5, 2015, the RESTful API and its relation to IPMI
- [Hetzner: Statement on the latest adjustment to setup fees](https://www.hetzner.com/pressroom/statement-on%20the-latest-adjustment-to%20setup-fees/), April 29, 2026
- [VentureBeat: Rackspace goes private in $4.3 billion acquisition](https://venturebeat.com/business/cloud-giant-rackspace-goes-private-in-4-3-billion-acquisition), Apollo at $32 a share, 2016
- [Renaissance Capital: Rackspace sets terms for $754 million IPO](https://www.renaissancecapital.com/IPO-Center/News/69825/cloud-hosting-services-provider-rackspace-sets-terms-for-754-million-ipo), 33.5 million shares at $21 to $24, 2020
- [Network World: Equinix to end its bare metal service](https://www.networkworld.com/article/3626462/equinix-to-end-its-bare-metal-service.html), December 17, 2024, sales stopped and end of life by June 2026

**In practice**

- [Backblaze: Drive Stats for 2025](https://www.backblaze.com/blog/backblaze-drive-stats-for-2025/), February 12, 2026, the 1.36% annualized failure rate and fleet size
- [Latitude.sh: Equinix Metal sunset](https://www.latitude.sh/blog/equinix-metal-sunset-how-to-reduce-the-migration-burden), September 8, 2025, the June 30, 2026 shutdown
</content>
</invoke>
