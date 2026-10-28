+++
title = "Hypervisors at Home"
description = "Proxmox VE, free ESXi's end and partial return, XCP-ng, Hyper-V, Incus, Harvester and KVM: home clusters, quorum, PCIe and GPU passthrough, and a 3-node build."
category = "Hosting & Cloud Industry"
order = 2107
part = "Homelab"
tags = ["homelab", "virtualization", "proxmox", "esxi", "xcp-ng", "incus", "passthrough"]
+++

A home hypervisor is a provider's compute layer with one tenant: the same KVM, Xen or ESXi a cloud or a VPS host runs, carving one machine into VMs and containers, managed by the person who also uses every one of them. The engineering is the same as a provider's and the economics are not. A provider pays for a license once per thousand customers; a homelab pays nothing or walks away, so free tiers, community repositories and the terms on them decide which hypervisor a generation of engineers learns.

This chapter covers the hypervisors homelabs run (Proxmox VE and its backup and multi-cluster products; VMware ESXi, its free edition's end in 2024 and its partial return in 2025; XCP-ng and Xen Orchestra; Hyper-V; Incus and LXD; Harvester; and plain KVM with libvirt), then clustering at home, PCIe and GPU passthrough, and a three-node build. It adds no provider tables to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model); a home VM is the self-hosted mirror of the `virtual_machine` resource there. How virtualization reached the providers, from OpenVZ to KVM, and Broadcom's acquisition of VMware and the end of perpetual licenses, belong to [Virtualization & the VPS](/books/hosting-and-cloud/virtualization-and-vps#how-it-got-here) in The Stack; running these platforms as a provider's private cloud is [Hybrid & On-Prem Cloud](/books/hosting-and-cloud/hybrid-and-on-prem-cloud#who-operates-what). The disks under the VMs are [NAS & Home Storage](/books/hosting-and-cloud/nas-and-home-storage); the apps inside them are [Self-Hosted Apps & Orchestration](/books/hosting-and-cloud/self-hosted-apps); the wider homelab is [The Homelab](/books/hosting-and-cloud/homelab).

## How the Vendors Do It

| Hypervisor | Owner | Base | Containers | Free tier (as of October 2026) | Paid tier |
| --- | --- | --- | --- | --- | --- |
| **Proxmox VE** | Proxmox Server Solutions | Debian with KVM/QEMU | LXC | Every feature; the no-subscription repository | Per-socket subscriptions for the enterprise repository and support |
| **VMware ESXi** | Broadcom | VMware's own kernel | None | vSphere Hypervisor 8 since 8.0U3e: non-production, no vCenter, no support | vSphere subscriptions |
| **XCP-ng** | Vates (project) | Xen | None | Every feature; Xen Orchestra built from source | Vates support plans and the XOA appliance |
| **Hyper-V** | Microsoft | Windows | None in the hypervisor | Feature of Windows 10 and 11 Pro and Enterprise; free Hyper-V Server ended with 2019 | Windows Server licenses |
| **Incus** | Linux Containers community | Linux with LXC and QEMU | System containers | Everything, Apache-2.0 | Third-party support |
| **Harvester** | SUSE | Kubernetes with KubeVirt and Longhorn | Through Kubernetes | Everything, open source | SUSE support subscription |
| **KVM with libvirt** | Linux kernel and libvirt projects | Any Linux | Whatever the host runs | Everything | Distribution support |

Three patterns run through the table. **KVM won the home tier:** Proxmox VE, Incus, Harvester and plain libvirt all use it, and only XCP-ng (Xen) and the two commercial hypervisors don't. **The free product is the funnel:** every vendor gives away the hypervisor and sells updates, support or management, and when a vendor stopped (VMware in 2024, Microsoft's free Hyper-V Server after 2019) the home users who had learned on it had to go somewhere else. **Containers beside VMs is now expected:** LXC in Proxmox VE and Incus runs a Linux service at container cost with its own IP and backups.

## How It Got Here

- **2005 and 2008:** Martin and Dietmar Maurer found Proxmox Server Solutions GmbH in 2005; in 2008 "the first stable version 0.9 of Proxmox Virtual Environment" launches.
- **February 7, 2013:** the Xen Orchestra repository is created.
- **October 6, 2015:** Proxmox VE 4.0 makes LXC the container technology, "replacing OpenVZ," with a new HA manager, on Debian 8 and kernel 4.2.
- **December 22, 2017:** the XCP-ng repository is created, a "friendly fork of XenServer" started after Citrix removed features from free XenServer after 7.3.
- **November 11, 2020:** Proxmox Backup Server 1.0, written in Rust, AGPLv3.
- **December 21, 2021:** SUSE declares Harvester "production-ready and generally available."
- **March 24, 2022:** Microsoft confirms that "the free 'Microsoft Hyper-V Server' product has been deprecated" and that Hyper-V Server 2019 "was the last version of the free download product."
- **July 4, 2023:** Canonical takes LXD out of the Linux Containers project.
- **August 7, 2023:** Incus is announced as a community-led alternative to LXD; v0.1 follows on October 7, 2023.
- **February 12, 2024:** free vSphere Hypervisor is reported gone from VMware's website, marked End of General Availability.
- **October 7, 2024:** XCP-ng 8.3, the last 8.x release; declared LTS on June 16, 2025.
- **April 10, 2025:** ESXi 8.0 Update 3e brings back a free vSphere Hypervisor, with limits.
- **August 5, 2025:** Proxmox VE 9.0 on Debian 13 "Trixie."
- **December 4, 2025:** Proxmox Datacenter Manager 1.0.
- **May 21, 2026:** Proxmox VE 9.2.

## Proxmox VE

**How it works.** Proxmox VE is Debian with KVM and QEMU for VMs, LXC for containers, ZFS and Ceph for storage, Corosync for clustering and an HA manager, all behind a web UI and a REST API (`pvesh` on the command line, `qm` for VMs, `pct` for containers). 9.0 (August 5, 2025) moved to Debian 13 with kernel 6.14, QEMU 10.0, LXC 6.0, OpenZFS 2.3.3 (with RAIDZ expansion) and Ceph Squid 19.2.3, and added snapshots on thick-provisioned LVM for iSCSI and Fibre Channel SANs, SDN fabrics, and HA affinity rules that keep resources together or apart. 9.2 shipped on May 21, 2026.

**Repositories, not features.** Every feature is in the free product; what a subscription buys is the update channel and support. Proxmox VE 9 uses deb822 `.sources` files: `pve-enterprise` ("the most stable packages," "suitable for production use," and needing a subscription key) is enabled by default, `pve-no-subscription` is free and "not recommended to use this on production servers," and `pve-test` is for developers. A home install switches from the first to the second, and the "no valid subscription" dialog at login is the reminder. As of October 2026 subscriptions are priced per CPU socket per year: Community €120 (which the price list marks as non-production), Basic €370, Standard €550 and Premium €1,100, and "all nodes in a cluster must use the same subscription level."

**LXC or VM.** A container shares the host kernel and is unprivileged by default; it starts in seconds, uses almost no memory beyond its processes, and is the right home for a single Linux service. A VM has its own kernel, so it is required for Windows, other kernels, Docker hosts that need full isolation, passthrough, and live migration without restart; Proxmox's own guidance puts nested containers inside a VM ([Running Apps: Compose and Its Front Ends](/books/hosting-and-cloud/self-hosted-apps#running-apps-compose-and-its-front-ends)).

**Proxmox Backup Server** (1.0 on November 11, 2020) is the companion: written in Rust, AGPLv3, it takes incremental backups of VMs, containers and hosts, deduplicates on the server, encrypts on the client with AES-256-GCM, verifies with SHA-256 and syncs to a remote PBS; enterprise support started at €449 at launch. **Proxmox Datacenter Manager 1.0** (December 4, 2025, AGPLv3) gives one view across several Proxmox VE clusters, nodes and PBS instances, with cross-cluster live migration, EVPN SDN configuration and an update panel. A homelab with one cluster doesn't need it; a lab and a colocated cluster ([From Homelab to Colocation](/books/hosting-and-cloud/homelab-to-colocation)) is its use.

## The End of Free ESXi and Its Partial Return

The free vSphere Hypervisor was how many engineers learned VMware at home. Broadcom's acquisition of VMware and the end of perpetual licensing are told later, in [Virtualization & the VPS](/books/hosting-and-cloud/virtualization-and-vps#epilogue-broadcom-and-vmware); at home the consequence was direct. On February 12, 2024 a Veeam forum report noted that "VMware vSphere Hypervisor (free edition) is no longer available on the VMware website," marked End of General Availability.

On April 10, 2025 ESXi 8.0 Update 3e (build 24674464) brought it back. The release notes describe an entry-level, no-charge offering: "No Broadcom support is available for this offering and it is for non-production use"; it "cannot connect to vCenter and therefore cannot be centrally managed"; and it "supports a maximum of 8 virtual CPUs per virtual machine." Broadcom's knowledge base adds "up to 2 physical CPUs supported per host," "no access to vMotion, DRS, HA, VADP-based backups," and that API management "is not supported, and may only provide read-only information." It downloads from the Broadcom Support portal. That is enough to learn the ESXi host client and VM formats; it is not enough to learn what makes VMware worth learning, which is vCenter and the cluster features, and VADP is what third-party backup tools use. The free tier returned as a single standalone host for a lab, not a platform.

## XCP-ng and Xen Orchestra

**XCP-ng** is the Xen line's community answer: a "friendly fork of XenServer" started in 2017 after Citrix pulled features from the free edition after 7.3. 8.3 (October 7, 2024) is the final 8.x release: it embeds **XO Lite** in the host's web page, provisions a virtual TPM for Windows 11 and UEFI guests, adds IPv6 for dom0, drivers for Intel i225-class and Realtek RTL8125 2.5G NICs common in mini PCs, PCI passthrough management and disk health in Xen Orchestra, and drops paravirtualized (PV) guests. It became the LTS on June 16, 2025, with 8.2 supported until September 16, 2025.

**Xen Orchestra** is the management layer for pools of XCP-ng hosts: VM lifecycle, backups, replication and HA. Vates sells it as the XOA appliance with support plans; the same code built from source is free, which is how most homelabs run it. The model is two products to Proxmox's one, and a smaller community; the reason to choose it is Xen itself, or a workplace that runs XenServer or XCP-ng.

## Hyper-V

Microsoft's free standalone **Hyper-V Server** ended with the 2019 release: on March 24, 2022 Elden Christensen wrote that "the free 'Microsoft Hyper-V Server' product has been deprecated" and that 2019 "was the last version of the free download product," supported "until January 2029"; Microsoft's lifecycle list puts its end of support on January 9, 2029. Hyper-V itself continues as a role in Windows Server and an optional feature of Windows 10 and 11 Pro and Enterprise, needing a 64-bit CPU with Second Level Address Translation and at least 4 GB of memory, and not installable on Home editions. At home it is the hypervisor already on a Windows desktop; as a lab platform it fits people who work in Windows Server shops and want Failover Clustering, which needs Windows Server licenses.

## Incus and LXD

**LXD** was the Linux Containers project's manager for system containers and VMs until July 4, 2023, when Canonical took it in house ("now found directly on Canonical's websites"). On August 7, 2023 **Incus** was announced as a "fully community led alternative to Canonical's LXD," created by Aleksa Sarai after LXD 5.16, and published v0.1 on October 7, 2023. Incus manages LXC system containers and QEMU VMs with images, profiles, projects, storage pools, networks and clustering, under Apache-2.0, through one CLI and API. It is driven mainly from that CLI rather than a Proxmox-style web console, which is the tradeoff: it is lighter and scriptable, and suits a container-first lab on any distribution. The fork is one more case of a project's owner and its community parting ways, told across the industry in [Licensing Disputes](/books/hosting-and-cloud/licensing-disputes#broadcom-and-vmware).

## Harvester

**Harvester** is SUSE's hyperconverged platform built on Kubernetes, KubeVirt for VMs and Longhorn for storage, declared generally available on December 21, 2021 and "100% free-to-use, open source," integrating with Rancher. Its requirements are a cluster's, not a homelab's: for testing, 8 cores, 32 GB of memory, 250 GB of SSD or NVMe at "5,000+ random IOPS per disk" and 1 Gbps Ethernet; for production 16 cores, 64 GB, 500 GB (1 TB recommended) and "10 Gbps Ethernet minimum"; a three-node cluster for its multi-node features; and "laptops and nested virtualization are not supported." It fits a lab whose goal is Kubernetes-native VMs on hardware that can meet that floor.

## Plain KVM and libvirt

Every Linux host is already a hypervisor: KVM is in the kernel, QEMU emulates the machine, and libvirt (`virsh`, `virt-install`, virt-manager on a desktop) defines VMs as XML domains with storage pools and networks. There is no cluster manager, no HA and no web UI unless one is added, and nothing to license or update beyond the distribution. It is the minimalist's choice, and the layer every KVM platform above is built on, so time spent here transfers to all of them.

## Clustering at Home

A cluster lets VMs move between nodes and restart on a survivor when a node dies. Proxmox VE's rules come from Corosync and are the ones every home cluster meets:

- **Latency under 5 ms.** The cluster stack "requires a reliable network with latencies under 5 milliseconds" between all nodes. Nodes in one house meet it; a node at a friend's house over the internet does not.
- **Three votes.** HA needs "at least three nodes for reliable quorum." A two-node cluster gets a third vote from a **QDevice**: `corosync-qnetd` on an independent machine (a Raspberry Pi or a small VM on the NAS) and `corosync-qdevice` on each node. Proxmox currently discourages a QDevice on clusters with an odd number of nodes, because if the QNet daemon fails no other node may fail.
- **A dedicated link.** Corosync needs low, steady latency rather than bandwidth ("a dedicated 1 Gbit NIC is enough in most situations"), and storage or backup traffic on the same link can push latency high enough to break quorum. It supports up to 8 links, and a redundant one should be on a different physical network.
- **Storage that survives a node.** HA restarts a VM elsewhere only if its disk is reachable there: shared storage (NFS from the NAS, or Ceph across the nodes) or ZFS replication between local pools on a schedule, which loses whatever changed since the last replication.

The common home shape is three mini PCs: each with a second NIC for Corosync, local ZFS with replication for most VMs, and the NAS for shared and bulk storage. A node out of quorum refuses to change configuration; `pvecm expected 1` forces it quorate for recovery, and Proxmox's documentation reserves it for people who understand the consequences.

## PCIe and GPU Passthrough

Passthrough gives a VM a physical device: an HBA, a GPU or a NIC, with the guest's own driver talking to hardware directly. It is how a homelab runs TrueNAS in a VM, transcodes media in a VM, or puts a GPU under a local model ([AI at Home](/books/hosting-and-cloud/ai-at-home)).

**What the hardware must do.** The CPU and board must support an IOMMU (Intel VT-d or AMD-Vi), enabled in firmware. On Proxmox VE, Intel hosts need `intel_iommu=on` on kernels older than 6.8, while newer kernels and AMD enable it by default; `iommu=pt` is optional. Interrupt remapping must work (`dmesg | grep remapping`), or passthrough fails; `allow_unsafe_interrupts=1` is the documented, and unsafe, workaround.

**IOMMU groups.** The IOMMU isolates devices by group, and only a whole group can be passed through. Each device to pass needs its own group, which depends on the board's PCIe layout and ACS support; consumer boards often put a slot in the same group as the chipset's other devices. The fixes are, in order: enable ACS in firmware, move the card to a slot wired to the CPU, or use the `pcie_acs_override=downstream` kernel option, which Proxmox calls "a last option": it makes the kernel report isolation the hardware does not provide, so a passed-through device may still reach its group's other devices by DMA.

**Host drivers off.** The host must not claim the device. Either bind it to `vfio-pci` by ID, or blacklist its driver: `amdgpu` and `radeon` for AMD, `nouveau` and `nvidia*` for NVIDIA, `i915` for Intel (which also takes away an Intel iGPU from the host). A `softdep` line makes `vfio-pci` load first when a driver races it.

**What it costs.** "VMs with passed-through devices cannot be migrated," so HA can only restart them on a node with the same device, which a cluster-level resource mapping can describe. The device is gone from the host and from every other guest. SR-IOV (virtual functions on NICs) and mediated devices (such as Intel GVT-g) share one device between guests where the hardware and driver support it.

**The usual devices.**

- **An HBA for TrueNAS in a VM.** Pass the whole SAS or SATA controller, so ZFS in the guest sees the disks directly, with their serial numbers and SMART data; passing virtual disks hides failures from the filesystem that is meant to catch them.
- **A GPU for transcoding.** A media server in a VM gets the card or the iGPU; a media server in an LXC container can use the host's `/dev/dri` device without passthrough, which keeps the GPU shared.
- **A GPU for local models.** The same passthrough for a VM; a container with the NVIDIA Container Toolkit avoids it. Sizing the card is [AI at Home](/books/hosting-and-cloud/ai-at-home).

## The Alternatives

| Hypervisor | Model | Strengths | Failure modes | Licensing and cost (as of October 2026) | Home fit |
| --- | --- | --- | --- | --- | --- |
| **Proxmox VE 9.x** | KVM and LXC on Debian, web UI, Corosync cluster | Every feature free; ZFS and Ceph built in; large community | No-subscription repository updates first; cluster rules strict on latency | Open source; €120 to €1,100 per socket a year for subscriptions | The default |
| **XCP-ng 8.3 LTS with Xen Orchestra** | Xen pools managed by XO | Mature Xen; XO backups and replication | Two products to run; smaller community | Free; Vates plans optional | Good, when Xen is the goal |
| **ESXi 8.0U3e free** | Standalone VMware host | Learn the host client | Non-production, no vCenter, no HA or vMotion, 8 vCPUs per VM, 2 CPUs per host | Free, no support | Learning the host only |
| **Hyper-V** | Windows role or feature | Already on Windows Pro; Windows guests | No free server product since 2019; clustering needs Windows Server | Windows licenses | Windows shops |
| **Incus** | LXC and QEMU, CLI and API | Light; container-first; any distribution | Less UI; fewer integrations | Apache-2.0, free | Container-first labs |
| **Harvester** | KubeVirt on Kubernetes with Longhorn | Kubernetes-native VMs | 32 GB and 8 cores per node minimum to test; no nested virtualization | Open source, free | Only with Kubernetes goals and the hardware |
| **KVM with libvirt** | The kernel hypervisor, by hand | Nothing extra; transferable | No cluster, HA or UI | Free | Minimalists |

## My Default

My default is Proxmox VE on the no-subscription repository: one node to start, three mini PCs when HA matters, a dedicated NIC for Corosync on each, and Proxmox Backup Server on separate hardware. I'd run Linux services as LXC containers and use VMs for Windows, Docker hosts, Home Assistant OS, anything with passthrough and anything that should live-migrate. For two nodes I'd add a QDevice rather than a third node I don't need. I'd pass an HBA, not virtual disks, to a TrueNAS VM, and I'd rather run TrueNAS on its own box than in a VM at all.

I'd pick XCP-ng when Xen is what I'm learning or what work runs, Incus for a container-first lab on a distribution I already know, and free ESXi only to learn VMware's host client. What would change this: a workplace standard (vSphere or Hyper-V) worth practicing at home, which justifies its license or limits; or a goal of Kubernetes everywhere, where Harvester or KubeVirt on an existing cluster is the lesson.

## How to Build It

The core data model gets no provider tables from this chapter. The home equivalent of a provider's host inventory is a table and a few files, kept with the lab's repository ([Infrastructure as Code for the Lab](/books/hosting-and-cloud/self-hosted-apps#infrastructure-as-code-for-the-lab)).

**The inventory.** Three nodes, two networks:

| Node | Hardware | LAN and VM bridge (`vmbr0`) | Corosync link0 (dedicated NIC) | Corosync link1 (fallback) | Storage | Role |
| --- | --- | --- | --- | --- | --- | --- |
| **pve1** | Mini PC, 64 GB, 2 NVMe | 10.0.10.11 | 10.0.99.11 | 10.0.10.11 | Local ZFS mirror | VMs, replication source |
| **pve2** | Mini PC, 64 GB, 2 NVMe | 10.0.10.12 | 10.0.99.12 | 10.0.10.12 | Local ZFS mirror | VMs, replication target |
| **pve3** | Tower, 64 GB, GPU, HBA | 10.0.10.13 | 10.0.99.13 | 10.0.10.13 | Local ZFS mirror; HBA for passthrough | GPU and storage VMs (not migratable) |
| **pbs** | Separate box | 10.0.10.20 | n/a | n/a | ZFS datastore | Proxmox Backup Server |
| **nas** | NAS | 10.0.10.30 | n/a | n/a | NFS export for ISOs and shared disks | Shared storage |

**The repository and the cluster.** On each node, the no-subscription repository replaces the enterprise one, then the cluster forms over the dedicated network with the LAN as fallback:

```sh
# Every node: free repository (Proxmox VE 9, deb822 format); disable the enterprise file.
cat > /etc/apt/sources.list.d/proxmox.sources <<'EOF'
Types: deb
URIs: http://download.proxmox.com/debian/pve
Suites: trixie
Components: pve-no-subscription
Signed-By: /usr/share/keyrings/proxmox-archive-keyring.gpg
EOF
mv /etc/apt/sources.list.d/pve-enterprise.sources /root/pve-enterprise.sources.disabled
apt update && apt full-upgrade

# pve1: create the cluster, Corosync on the dedicated network first.
pvecm create homelab --link0 10.0.99.11 --link1 10.0.10.11

# pve2 and pve3: join through pve1, naming their own link addresses.
pvecm add 10.0.10.11 --link0 10.0.99.12 --link1 10.0.10.12
pvecm add 10.0.10.11 --link0 10.0.99.13 --link1 10.0.10.13

# Any node: quorum, votes and link state.
pvecm status
pvecm nodes
```

**A QDevice, for a two-node cluster.** If the lab has only pve1 and pve2, a small always-on machine provides the third vote:

```sh
# The external machine (Debian, e.g. a Raspberry Pi), with key-based root SSH from the nodes.
apt install corosync-qnetd

# Both cluster nodes.
apt install corosync-qdevice

# One node, with both nodes online.
pvecm qdevice setup 10.0.10.40
pvecm status          # shows a Qdevice vote; NA means TCP 5403 on the qnetd host is unreachable
```

**Passthrough on pve3.** The kernel command line, the VFIO modules and the device binding, then the VM:

```sh
# Kernel command line (Intel on kernels older than 6.8 needs intel_iommu=on; iommu=pt optional).
# systemd-boot (ZFS root on UEFI): append to the single line in /etc/kernel/cmdline, then refresh.
sed -i '1 s/$/ intel_iommu=on iommu=pt/' /etc/kernel/cmdline
proxmox-boot-tool refresh
# GRUB instead: add the options to GRUB_CMDLINE_LINUX_DEFAULT in /etc/default/grub, then update-grub.

# VFIO modules at boot.
printf "vfio\nvfio_iommu_type1\nvfio_pci\n" > /etc/modules-load.d/vfio.conf

# Bind the GPU (video and audio functions) to vfio-pci by vendor:device ID from lspci -nn,
# and make sure vfio-pci wins the race against the host driver. The IDs are examples.
cat > /etc/modprobe.d/vfio.conf <<'EOF'
options vfio-pci ids=10de:2684,10de:22ba
softdep nvidia pre: vfio-pci
softdep nouveau pre: vfio-pci
EOF
update-initramfs -u -k all
reboot

# After reboot: IOMMU on, remapping on, each device alone in its group, vfio-pci in use.
dmesg | grep -e DMAR -e IOMMU
dmesg | grep remapping
pvesh get /nodes/pve3/hardware/pci --pci-class-blacklist ""
lspci -nnk -s 01:00

# Give VM 210 the GPU (q35 machine for PCIe) and VM 220 the HBA.
qm set 210 --machine q35 --hostpci0 01:00,pcie=on
qm set 220 --machine q35 --hostpci0 02:00.0,pcie=on
```

**The VMs as code.** With the bpg/proxmox provider for OpenTofu or Terraform, an API token and a cluster resource mapping named `gpu`, the GPU VM is a resource:

```hcl
provider "proxmox" {
  endpoint  = "https://10.0.10.11:8006/"
  api_token = var.proxmox_api_token      # user@realm!tokenid=secret
  insecure  = true                       # self-signed certificate on a lab cluster
  ssh {
    agent    = true
    username = "terraform"               # needed only for snippets and some file uploads
  }
}

resource "proxmox_virtual_environment_vm" "ai" {
  node_name = "pve3"                     # pinned: a passed-through VM cannot migrate
  vm_id     = 210
  name      = "ai"
  tags      = ["gpu", "homelab"]
  machine   = "q35"
  on_boot   = true

  clone { vm_id = 9000 }                 # a cloud-init template

  agent { enabled = true }
  cpu {
    cores = 8
    type  = "host"
  }
  memory { dedicated = 32768 }

  disk {
    datastore_id = "local-zfs"
    interface    = "scsi0"
    size         = 200
  }

  network_device {
    bridge  = "vmbr0"
    vlan_id = 10
  }

  hostpci {
    device  = "hostpci0"
    mapping = "gpu"                      # a mapping works with an API token; a raw id needs root
    pcie    = true
  }

  initialization {
    ip_config {
      ipv4 {
        address = "10.0.10.51/24"
        gateway = "10.0.10.1"
      }
    }
    user_account {
      username = "ops"
      keys     = [var.ssh_public_key]
    }
  }
}
```

| Task | Schedule | Where |
| --- | --- | --- |
| **Package updates** | Monthly, one node at a time, migrating VMs off first | Each node |
| **VM and container backups** | Nightly to PBS, with verify jobs | Datacenter backup job |
| **ZFS replication** | Every 15 minutes for HA-protected VMs on local storage | Between pve1 and pve2 |
| **PBS sync offsite** | Weekly | A remote PBS or object storage ([Backups](/books/hosting-and-cloud/self-hosted-apps#backups)) |
| **Restore test** | Quarterly: one VM restored to a scratch ID | Any node |
| **Quorum check** | After every network change | `pvecm status` |

## What This Means for the System You Build

- **Choose the hypervisor by its free tier's terms** as much as its features: the terms changed for ESXi and Hyper-V, and the users left.
- **Run Linux services as containers and the rest as VMs,** and know which of them can migrate.
- **Give Corosync its own link,** and count votes before the second node: three nodes or a QDevice.
- **Treat a passed-through device as pinning the VM to its host,** and plan HA around it.
- **Check IOMMU groups before buying a board,** not after; the ACS override reports isolation the hardware does not have.
- **Pass the HBA, not the disks,** to a storage VM, so the filesystem sees the drives it protects.
- **Back up VMs to a separate machine** and restore one on a schedule.

## References

**Proxmox**

- [Proxmox: About](https://www.proxmox.com/en/about), founding in 2005 and Proxmox VE 0.9 in 2008
- [Proxmox: Proxmox VE 4.0 released](https://proxmox.com/en/about/company-details/press-releases/proxmox-ve-4-0-released), October 6, 2015, LXC replacing OpenVZ, HA manager, Debian 8, kernel 4.2
- [Proxmox: Proxmox VE 9.0](https://www.proxmox.com/en/about/company-details/press-releases/proxmox-virtual-environment-9-0), August 5, 2025, Debian 13, kernel, QEMU, LXC, ZFS and Ceph versions, LVM snapshots, SDN fabrics, HA affinity
- [Proxmox VE Roadmap](https://pve.proxmox.com/wiki/Roadmap), 9.2 on May 21, 2026
- [Proxmox VE: Package Repositories](https://pve.proxmox.com/wiki/Package_Repositories), enterprise, no-subscription and test repositories and their deb822 files
- [Proxmox VE: Pricing](https://www.proxmox.com/en/products/proxmox-virtual-environment/pricing), per-socket subscription prices as of October 2026 and the same-level rule
- [Proxmox: Proxmox Backup Server 1.0](https://proxmox.com/en/about/company-details/press-releases/proxmox-backup-server-1-0-available), November 11, 2020, Rust, AGPLv3, deduplication, encryption, €449
- [Proxmox: Proxmox Datacenter Manager 1.0](https://www.proxmox.com/en/about/company-details/press-releases/proxmox-datacenter-manager-1-0), December 4, 2025
- [Proxmox VE: Cluster Manager](https://pve.proxmox.com/wiki/Cluster_Manager), latency, quorum, the dedicated NIC, links and `pvecm`
- [Proxmox VE Admin Guide: Cluster Manager](https://pve.proxmox.com/pve-docs/chapter-pvecm.html), QDevice packages and setup, the odd-node advice, port 5403, `pvecm expected`
- [Proxmox VE: PCI Passthrough](https://pve.proxmox.com/wiki/PCI_Passthrough), interrupt remapping, IOMMU groups, the ACS override, driver blacklists and no migration
- [Proxmox VE: PCI(e) Passthrough](https://pve.proxmox.com/wiki/PCI(e)_Passthrough), kernel parameters, VFIO modules, vfio-pci IDs, softdep, hostpci options, SR-IOV and mediated devices
- [Proxmox VE: Host Bootloader](https://pve.proxmox.com/wiki/Host_Bootloader), editing the kernel command line for GRUB and systemd-boot

**VMware**

- [Veeam forums: free ESXi end of general availability](https://forums.veeam.com/viewtopic.php?p=512041), February 12, 2024 report
- [Broadcom: ESXi 8.0 Update 3e release notes](https://techdocs.broadcom.com/us/en/vmware-cis/vsphere/vsphere/8-0/release-notes/esxi-update-and-patch-release-notes/vsphere-esxi-80u3e-release-notes.html), April 10, 2025, the free vSphere Hypervisor and its limits
- [Broadcom KB 399823: ESXi 8.0 Update 3e](https://knowledge.broadcom.com/external/article/399823/vmware-esxi-80-update-3e-now-available-a.html), physical CPU, vMotion, DRS, HA, VADP and API limits

**Xen, Microsoft, containers and Kubernetes**

- [XCP-ng: About](https://docs.xcp-ng.org/project/about/), the friendly fork of XenServer
- [XCP-ng 8.3 release](https://xcp-ng.org/blog/2024/10/07/xcp-ng-8-3/), October 7, 2024, XO Lite, vTPM, IPv6, NIC drivers and PV removal
- [XCP-ng 8.3 is now LTS](https://xcp-ng.org/blog/2025/06/16/xcp-ng-8-3-is-now-lts/), June 16, 2025, and 8.2 support to September 16, 2025
- [Microsoft Tech Community: Hyper-V Server 2022](https://techcommunity.microsoft.com/discussions/windowsserverinsiders/hyper-v-server-2022/2652790), March 24, 2022, the free product deprecated with 2019 as the last
- [Microsoft Lifecycle: Ending support in 2029](https://learn.microsoft.com/en-us/lifecycle/end-of-support/end-of-support-2029), Hyper-V Server 2019 on January 9, 2029
- [Microsoft Learn: Install Hyper-V](https://learn.microsoft.com/en-us/windows-server/virtualization/hyper-v/get-started/install-hyper-v), editions and hardware requirements
- [Linux Containers: LXD](https://linuxcontainers.org/lxd/), Canonical's move of LXD on July 4, 2023
- [Linux Containers: Incus announcement](https://linuxcontainers.org/incus/announcement/), August 7, 2023
- [GitHub: lxc/incus](https://github.com/lxc/incus), Apache-2.0, and the v0.1 release of October 7, 2023
- [SUSE: Harvester GA](https://www.suse.com/c/harvester-ga-announcement/), December 21, 2021, Kubernetes, KubeVirt and Longhorn
- [Harvester: Requirements](https://docs.harvesterhci.io/v1.5/install/requirements), testing and production hardware, three nodes, no laptops or nested virtualization

**Infrastructure as code**

- [bpg/proxmox: provider documentation](https://raw.githubusercontent.com/bpg/terraform-provider-proxmox/main/docs/index.md), the provider block, API token format and when SSH is needed
- [bpg/proxmox: proxmox_virtual_environment_vm](https://raw.githubusercontent.com/bpg/terraform-provider-proxmox/main/docs/resources/virtual_environment_vm.md), VM arguments and `hostpci` with `mapping`
