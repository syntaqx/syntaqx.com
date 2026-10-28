+++
title = "NAS & Home Storage"
description = "Unraid, TrueNAS, ZFS and OpenZFS, Synology and QNAP, SnapRAID and mergerfs: parity versus pools, drive lists, ECC, and a ZFS pool built for a homelab."
category = "Hosting & Cloud Industry"
order = 2147
part = "Homelab"
tags = ["homelab", "nas", "zfs", "truenas", "unraid", "synology", "storage"]
+++

A home NAS is a storage provider with one customer: the same disks, redundancy schemes, snapshots and replication a provider sells as block, file and object storage, in a box whose owner chooses every tradeoff a provider would hide. The choices are older than the homelab. Parity or mirrors, one filesystem per disk or one pool over all of them, a vendor appliance with its drive list or a free operating system on any hardware. What makes them hard at home is that the owner usually buys disks a few at a time, of whatever size is cheap that year, and has no second copy of the data unless they build one.

This chapter covers the NAS operating systems and filesystems homelabs choose between: Unraid and its parity array, TrueNAS and its move from FreeBSD to Linux, ZFS and OpenZFS, the Synology and QNAP appliances (including Synology's 2025 drive policy and its reversal), and SnapRAID with mergerfs; then ECC memory as vendors state it, why RAID is not a backup, and a ZFS pool built for a homelab. It adds no provider tables to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model); a home pool is the self-hosted mirror of the volume and bucket resources there. The Stack picks up storage as providers sell it in [Storage: Block, File & Object](/books/hosting-and-cloud/storage#how-the-providers-do-it); storage under a Kubernetes cluster is [Storage & Stateful Workloads](/books/hosting-and-cloud/kubernetes-storage#claims-volumes-and-classes). The wider homelab is [The Homelab](/books/hosting-and-cloud/homelab); the VMs that mount this storage are [Hypervisors at Home](/books/hosting-and-cloud/hypervisors-at-home); the apps whose data lives here, and their backups, are [Self-Hosted Apps & Orchestration](/books/hosting-and-cloud/self-hosted-apps).

## How the Vendors Do It

| System | Owner | License | Storage model | Price (as of October 2026) |
| --- | --- | --- | --- | --- |
| **Unraid** | Lime Technology | Proprietary | Parity array of independent disks, plus Btrfs or ZFS pools | Starter $49, Unleashed $109, Lifetime $249; update extension $36 a year |
| **TrueNAS Community Edition** | iXsystems | Open source | ZFS pools on Linux | Free; Enterprise sold with hardware |
| **TrueNAS CORE** | iXsystems | Open source | ZFS on FreeBSD | Free; final release 13.3-U1.2 |
| **OpenZFS on a general OS** (Debian, Proxmox VE, FreeBSD) | OpenZFS project | CDDL | ZFS pools | Free |
| **Synology DSM** | Synology | Proprietary | Btrfs volumes on Synology Hybrid RAID (SHR) or classic RAID | Sold with the hardware |
| **QNAP QTS and QuTS hero** | QNAP | Proprietary | QTS: classic RAID; QuTS hero: ZFS | Sold with the hardware |
| **SnapRAID and mergerfs** | Open-source maintainers | GPL-3.0 (SnapRAID) | Scheduled parity over independent disks, pooled by a FUSE mount | Free |

Three patterns run through the table. **The split is parity array against pool:** Unraid and SnapRAID keep one ordinary filesystem per disk and add parity beside them, so disks of any size can join and a dead array loses only what was on the failed disks; ZFS and the appliances' RAID stripe data across a group, which is faster and checksummed but grows in fixed shapes. **ZFS won the free tier:** TrueNAS, QuTS hero, Proxmox VE and, since 2023, Unraid's pools all use it. **Appliance vendors sell the whole box,** which is what lets them write a drive list and, as Synology did in 2025, try to enforce it.

## How We Got Here

- **August 26, 2005:** Tom Mortensen ("limetech") announces "a new network-attached media storage server product called Un-RAID" on AVS Forum: up to 12 drives of different sizes, one parity disk, no striping, the OS on a USB flash drive.
- **2005 to May 2, 2011:** Olivier Cochard-Labbé starts FreeNAS on m0n0wall, an embedded FreeBSD firewall; in December 2009 he puts the 0.7 branch into maintenance-only mode; iXsystems continues a BSD-licensed FreeNAS, rewritten modularly, and releases FreeNAS 8.0 on May 2, 2011.
- **September 17, 2013:** OpenZFS is announced as "a cross-platform effort to ensure the continued evolution of the ZFS file system," uniting the illumos, FreeBSD, Linux and macOS communities; co-founder Matt Ahrens had started the ZFS project at Sun.
- **April 20, 2020:** QNAP introduces QuTS hero, a ZFS-based NAS operating system, on three special-edition rackmount models.
- **November 30, 2020:** OpenZFS 2.0.0 renames ZFS on Linux to OpenZFS: "Both Linux and FreeBSD are now supported from the same repository."
- **June 14, 2023:** Unraid 6.12.0 adds ZFS pools.
- **February 19, 2024:** Unraid announces new license tiers with a year of updates included, effective at the end of the first quarter of 2024.
- **March 20, 2024:** iXsystems says TrueNAS CORE "is now entering a sustaining engineering phase" and recommends SCALE for new installations.
- **October 29, 2024:** TrueNAS SCALE 24.10 "Electric Eel" moves the apps backend from Kubernetes (k3s) to Docker.
- **January 9, 2025:** Unraid 7.0.0 makes the parity array optional.
- **January 14, 2025:** OpenZFS 2.3.0 adds RAIDZ expansion: "Add new devices to an existing RAIDZ pool."
- **April 15, 2025:** TrueNAS 25.04 "Fangtooth," the release line now called TrueNAS Community Edition.
- **April 29, 2025:** TrueNAS CORE 13.3-U1.2, "the final release for the TrueNAS CORE 13.3 software train."
- **2025:** Synology's 2025 Plus models ship requiring Synology-branded or certified drives for storage pools.
- **October 8, 2025:** DSM 7.3 lets 2025 Synology models create storage pools on non-validated third-party drives, except M.2.

The arc runs from appliances toward one filesystem. In 2005 a home server meant a parity scheme that tolerated mismatched disks; twenty years later ZFS is the default in nearly every free NAS operating system, and the one limitation that kept home users away from RAIDZ, that a group could not grow by one disk, was removed in 2025.

## Unraid: Parity Array and Pools

The **array** is Unraid's original design. Each data disk carries its own filesystem and its own files; one or two parity disks hold parity computed across all of them in real time; a read spins up only the disk that holds the file. Disks of mixed sizes can join as long as parity is at least as large as the largest data disk, and if more disks fail than parity covers, the surviving disks are still readable on their own. The cost is speed (writes are bounded by the parity disk) and integrity: the array has no checksums of its own, so a parity check finds a mismatch but cannot say which side is right, which is the critique SnapRAID's own comparison page makes of it.

**Pools** sit beside the array for cache, VMs and containers. Unraid 6.12.0 (June 14, 2023) added ZFS pools in raid0, mirrors up to four-way, and RAIDZ1, RAIDZ2 and RAIDZ3, with multiple vdevs; a single-device ZFS disk was allowed inside the array; native ZFS encryption was not supported (LUKS was used instead); and the ARC was capped at one eighth of RAM by default. Shares choose a primary and secondary location, and the **mover** migrates files from a fast pool to the array on a schedule. Unraid 7.0.0 (January 9, 2025) let the number of array slots be "none," made that the default for new installs, and recommended pools for all-flash servers because "Trim/Discard is not supported with unRAID array devices"; it also added hybrid ZFS pools (subpools), LUKS on ZFS, and recovery from multiple drive failures where the pool's protection allows. An Unraid server can now be a ZFS appliance with no array at all.

**Licensing.** On February 19, 2024 Lime Technology announced new tiers for the end of the first quarter of 2024: **Starter** (up to 6 storage devices), **Unleashed** (unlimited) and **Lifetime**. Starter and Unleashed include a year of updates, then an optional paid extension; existing Basic, Plus and Pro keys were grandfathered with all updates. As of October 2026 the prices are Starter $49, Unleashed $109 and Lifetime $249, all perpetual, with the extension at $36 a year for Starter and Unleashed. A server whose extension lapses keeps running and receives patch releases within its minor version until that version's end of life. The license is tied to the GUID of the boot USB drive, with one self-service transfer and then one per 12 months. The 2024 change is the familiar move from perpetual-with-updates to perpetual-plus-maintenance; how vendors change terms under their users is [Open Source and the Clouds](/books/hosting-and-cloud/open-source-and-the-clouds#the-license-spectrum) and Licensing Disputes.

## TrueNAS: From FreeNAS to Community Edition

**FreeNAS** began in 2005 on m0n0wall and became iXsystems' project when its founder stepped back in 2009; FreeNAS 8.0 (May 2, 2011) was the modular rewrite, on FreeBSD with ZFS. It was later renamed **TrueNAS CORE**, and iXsystems added **TrueNAS SCALE**, the same ZFS and middleware on Debian Linux, which gave it Linux containers and KVM.

Two lines became one. On March 20, 2024 iXsystems put CORE into "a sustaining engineering phase," with SCALE as "the software edition where new features and updated components are actively developed and tested." TrueNAS CORE 13.3-U1.2 (April 29, 2025) is "the final release for the TrueNAS CORE 13.3 software train"; its documentation is labelled end of life, and security or data-integrity fixes now go to Community Edition. TrueNAS 25.04 "Fangtooth" (April 15, 2025) is the first release under the **TrueNAS Community Edition** name: SCALE, renamed, with a unified upgrade path from SCALE 24.10 and CORE 13.x. Moving from a FreeBSD-based system "is a one-way operation." 25.04 also added experimental Linux system containers (LXC) and reintroduced classic virtual machines, completed in 25.04.2.

**Apps.** SCALE ran its apps on Kubernetes (k3s) until 24.10 "Electric Eel" (October 29, 2024) moved the backend to Docker. Official catalog apps migrated automatically; third-party catalogs such as TrueCharts did not, and the automatic migration path closed on June 1, 2025. A system that changed its app runtime once is a reason to keep app definitions in a file you own ([Running Apps: Compose and Its Front Ends](/books/hosting-and-cloud/self-hosted-apps#running-apps-compose-and-its-front-ends)).

## ZFS and OpenZFS

**How it works.** ZFS combines volume manager and filesystem. A **pool** is built from **vdevs**: a mirror (N disks holding identical copies, surviving N-1 failures) or a RAIDZ group (RAIDZ1, RAIDZ2 and RAIDZ3 tolerate one, two and three device failures; the documentation recommends 3 to 9 disks per group). Writes stripe across vdevs, so losing any whole vdev loses the pool. Every block is checksummed; on a read with a bad checksum, ZFS repairs the block from redundancy, and a **scrub** reads every block on schedule to find and fix silent corruption before a second failure makes it unrecoverable. Writes are copy-on-write, so **snapshots** are instant, and `zfs send` turns a snapshot or the difference between two into a stream another pool can receive. Datasets are filesystems inside the pool with their own properties (compression, record size, quota, encryption) and their own snapshots. Support vdevs change performance, not redundancy: a **special** vdev holds metadata and optionally small blocks, a **log** device absorbs synchronous writes, and a **cache** device is a second-level read cache. A special vdev is part of the pool, so losing it loses the pool and it gets the same redundancy as the data vdevs; log devices can be mirrored but not RAIDZ, and cache devices can be neither.

**RAIDZ expansion.** Until OpenZFS 2.3.0 (January 14, 2025), a RAIDZ vdev could not be widened: a home user with a four-disk RAIDZ1 who wanted more space had to add a second whole vdev or replace every disk with a larger one. `zpool attach pool raidz2-0 newdisk` now adds a disk to an existing RAIDZ group (feature `raidz_expansion`) while the pool stays online and redundant. Old blocks "retain their old data-to-parity ratio" until rewritten, so a widened group reports less free space than a group created at that width; `zfs rewrite` moves old blocks to the new ratio. Proxmox VE 9.0 shipped OpenZFS 2.3.3 in August 2025.

**Licensing.** OpenZFS is under the CDDL; the Linux kernel is GPLv2, and the OpenZFS project says combining code available only under each in one binary "causes problems," while "nothing in either license prevents distributing it in the form of a binary module." That is why ZFS on Linux ships out of tree, as a module built by DKMS or by the distribution (Proxmox VE and Ubuntu ship it built), and why a kernel upgrade can briefly run ahead of the module.

**Practical rules from the FAQ.** Create pools from whole disks, so ZFS partitions and aligns them; use `ashift=12` for 4K-sector disks, set when a device first joins and never changeable; and name disks by `/dev/disk/by-id`, which the FAQ calls "best for small pools (less than 10 disks)," so the pool imports correctly when cables move.

## Synology and QNAP

**Synology DSM** builds Btrfs volumes on Synology Hybrid RAID (SHR) or classic RAID levels, and SHR is the appliance answer to Unraid's mixed-drive appeal: it uses disks of different sizes more fully than classic RAID. The DS925+ (spring 2025) is representative of the Plus line: AMD Ryzen V1500B, 4 GB of DDR4 ECC memory, two 2.5GbE ports, four bays and two M.2 slots, 37.91 W in access and 12.33 W with disks hibernated.

**The 2025 drive policy.** Synology's 2025 Plus models launched with a policy that required Synology-branded or certified drives for full function; drives not on the list lost storage pool creation, health monitoring, deduplication and firmware updates. On October 8, 2025 Synology announced that 2025 model-year Plus, Value and J series units running DSM 7.3 "will support the installation and storage pool creation of non-validated third-party drives," with one exception: "Creation of M.2 based storage pool and cache still requires drives on the HCL." As of October 2026, then, a 2025 Synology takes third-party hard disks and 2.5-inch SATA SSDs, and its M.2 slots still take only listed drives. The episode is the reason to read an appliance's current compatibility policy before buying it, not the policy that held when the model was reviewed.

**QNAP** ships two operating systems: **QTS**, on ext4 over classic RAID, and **QuTS hero** (April 20, 2020), ZFS-based, with self-healing, inline deduplication and compression, and triple-parity and triple-mirror layouts. QNAP's other history is security: on January 26, 2022 it warned that the DeadBolt ransomware "has been widely targeting all NAS exposed to the Internet without any protection" and told owners to turn off router port forwarding and UPnP for the NAS. Keeping a NAS's management interface off the internet is [Exposing Home Services](/books/hosting-and-cloud/exposing-home-services).

## SnapRAID and mergerfs

**SnapRAID** is parity computed "only upon an explicit request": a `snapraid sync` updates parity over disks that each keep an ordinary filesystem, `snapraid scrub` verifies data against 128-bit SpookyHash checksums, and up to six parity disks protect the set. Disks already full of data can be added, which no striped layout allows. Its cost is the window between syncs: files written since the last sync are unprotected, and a disk that changes constantly makes parity permanently stale. **mergerfs** is a FUSE union filesystem that presents many disks' paths as one mount, with policies for which disk receives a new file; it lists "Redundancy" as a non-feature and points to SnapRAID for it. The pair suits a mostly static media library on mismatched disks, which is the workload Unraid's array was designed for, at no license cost and with checksums the array lacks.

## ECC, as Vendors State It

ECC memory corrects single-bit errors before they reach disk. The OpenZFS FAQ calls it "strongly recommended" for OpenZFS, especially where strong integrity guarantees are needed, and in its hardware section says it "isn't really a requirement, but it's highly recommended," acknowledging that home users may decide the cost isn't worth it. The vendors segment by it: Synology ships ECC in the DS925+ and non-ECC memory in the DS925neo+ variant, and of QNAP's three launch QuTS hero models only the Xeon-based TS-h1283XU-RP is specified with ECC. ZFS without ECC is still safer than a filesystem without checksums; it simply cannot detect a bit flipped in memory before the checksum was computed.

## RAID Is Not a Backup

Every layout in this chapter survives a failed disk and none survives the owner. A deletion, a ransomware encryption, a corrupted database or a bad `rm -rf` reaches every mirror and parity member at once; a house fire takes the whole box. Snapshots on the same pool undo the first three and not the fourth. The rule is 3-2-1 (three copies, two media, one offsite), and the home version of it is snapshots locally, `zfs send` replication to a second machine, and an encrypted copy in object storage, set out in [Backups](/books/hosting-and-cloud/self-hosted-apps#backups) and, as general practice, in the playbook's [Backups](/docs/operations/disaster-recovery#backups) and [Restores Are What Matter](/docs/operations/disaster-recovery#restores-are-what-matter).

## The Alternatives

| Option | Redundancy model | Mixed drive sizes | Grow by one disk | Checksums and self-heal | Failure modes | Cost (as of October 2026) |
| --- | --- | --- | --- | --- | --- | --- |
| **Unraid array plus pools** | 1 or 2 parity disks in real time; ZFS or Btrfs pools beside | Yes (array) | Yes | Pools only | Array writes bound by parity; no checksums on the array | $49, $109 or $249; $36 a year for updates |
| **TrueNAS Community Edition** | ZFS mirrors, RAIDZ1/2/3 | Within a vdev, the smallest disk sets the size | Yes since OpenZFS 2.3 | Yes | App runtime has changed once; CORE users must migrate | Free |
| **OpenZFS on Debian or Proxmox VE** | Same as above | Same | Yes | Yes | All management by hand; module out of tree | Free |
| **SnapRAID plus mergerfs** | 1 to 6 parity disks, synced on schedule | Yes | Yes, even disks already full | Yes, at scrub | New files unprotected until the next sync | Free |
| **Synology DSM** | SHR or classic RAID under Btrfs | Yes (SHR) | Yes | Btrfs checksums | Drive policy set by the vendor; M.2 list-only on 2025 models | Hardware price |
| **QNAP QTS or QuTS hero** | Classic RAID (QTS) or ZFS (hero) | hero: within a vdev | Model-dependent | hero: yes | Ransomware history on exposed units | Hardware price |

## My Default

My default is ZFS: TrueNAS Community Edition on its own box, or ZFS directly under Proxmox VE when one machine does everything. For four to six disks I'd build one RAIDZ2 vdev; for two or four disks, or when the pool also runs VMs, mirrors, which resilver fastest and grow two disks at a time. I'd use ECC memory when the platform supports it for little extra money and not reject a platform that lacks it. Snapshots and nightly replication to a second machine are part of the build, not a later project.

I'd pick Unraid instead when the disks are a mixed collection bought over years and growing one disk at a time matters more than checksums on the bulk data, keeping VMs and app data on a ZFS pool beside the array. I'd pick SnapRAID and mergerfs for a mostly static media library on a budget. I'd buy an appliance when nobody in the house wants to administer an operating system, after reading the vendor's drive policy as it stands that month. What would change this: a dataset that needs more throughput than spinning disks give, which moves the pool to mirrored NVMe; or no second machine, in which case the first purchase is the backup target, not more disks.

## How to Build It

The core data model gets no provider tables from this chapter. The home equivalent of a provider's volume inventory is a pool layout, a dataset per app, and a schedule, all written down next to the app inventory in [Self-Hosted Apps & Orchestration](/books/hosting-and-cloud/self-hosted-apps#infrastructure-as-code-for-the-lab).

**Usable space by layout.** Raw arithmetic for 12 TB disks, before ZFS metadata, reserved slop space, RAIDZ padding and the gap between TB and TiB (a 12 TB disk is about 10.9 TiB), all of which make real figures lower:

| Disks | Mirrors (pairs) | RAIDZ1 | RAIDZ2 | RAIDZ3 | Unraid, 2 parity |
| --- | --- | --- | --- | --- | --- |
| **4** | 24 TB, 1 failure per pair | 36 TB, 1 failure | 24 TB, any 2 failures | 12 TB, any 3 failures | 24 TB, 2 failures |
| **6** | 36 TB | 60 TB | 48 TB | 36 TB | 48 TB |
| **8** | 48 TB | 84 TB | 72 TB | 60 TB | 72 TB |

The table hides the difference that matters most: losing a third disk on Unraid loses only that disk's files, while losing more disks than a vdev's parity loses the whole pool. With disks of 12 TB and up, a resilver takes long enough that a second failure during it is the case RAIDZ2 exists for, which is why I'd not build RAIDZ1 on large disks.

**The pool and its datasets.** Six disks in one RAIDZ2 vdev, a mirrored special vdev for metadata, datasets per app:

```sh
# Pool: whole disks by id, 4K sectors, properties inherited by every dataset.
zpool create -o ashift=12 -o autotrim=on \
  -O compression=lz4 -O atime=off -O xattr=sa -O acltype=posixacl \
  tank raidz2 \
    /dev/disk/by-id/ata-DISK1 /dev/disk/by-id/ata-DISK2 /dev/disk/by-id/ata-DISK3 \
    /dev/disk/by-id/ata-DISK4 /dev/disk/by-id/ata-DISK5 /dev/disk/by-id/ata-DISK6 \
  special mirror /dev/disk/by-id/nvme-SSD1 /dev/disk/by-id/nvme-SSD2

# Datasets: one per app so snapshots, quotas and restores are per app.
zfs create tank/apps
zfs create tank/apps/immich
zfs create tank/apps/vaultwarden
zfs create -o recordsize=1M tank/media                  # large sequential files
zfs create -o encryption=on -o keyformat=passphrase tank/private
zfs create -o quota=2T tank/backups                     # inbound copies from other hosts

# Later: widen the RAIDZ2 vdev by one disk (OpenZFS 2.3+, feature raidz_expansion).
zpool attach -w tank raidz2-0 /dev/disk/by-id/ata-DISK7
```

**Snapshots and replication.** Sanoid (GPL-3.0) is a policy-driven snapshot manager configured in `/etc/sanoid/sanoid.conf`, and its companion syncoid replicates datasets over SSH with incremental `zfs send`:

```ini
# /etc/sanoid/sanoid.conf on the NAS
[tank/apps]
  use_template = critical
  recursive = zfs

[tank/media]
  use_template = bulk

[template_critical]
  hourly = 48
  daily = 30
  monthly = 12
  yearly = 0
  autosnap = yes
  autoprune = yes

[template_bulk]
  hourly = 0
  daily = 7
  monthly = 3
  autosnap = yes
  autoprune = yes
```

```sh
# Nightly from cron or a systemd timer: push app datasets to the backup box.
syncoid -r tank/apps root@backup.lan:vault/apps
```

Encrypted datasets such as `tank/private` are better sent raw (`zfs send -w`), which ships them as they sit on disk so the backup box never holds the key ([Backups](/books/hosting-and-cloud/self-hosted-apps#backups)).

**Scrubs and SMART.** A scrub reads every block and repairs what fails its checksum; SMART self-tests ask each drive to test itself. TrueNAS creates a scrub task with every new pool, set to run every Sunday at midnight; on a general Linux host the schedule is mine to write, and smartd's `-s` directive takes a `T/MM/DD/d/HH` pattern (short tests daily, long tests weekly):

```text
# /etc/smartd.conf: every disk, all checks, short test 02:00 daily, long test Sunday 04:00.
DEVICESCAN -a -o on -S on -s (S/../.././02|L/../../7/04) -m root

# root's crontab: scrub on the first Sunday of the month at 03:00.
0 3 1-7 * * [ "$(date +\%u)" = 7 ] && /usr/sbin/zpool scrub tank
```

| Task | Schedule | What failure looks like | Action |
| --- | --- | --- | --- |
| **Snapshots** | Hourly for apps, daily for bulk | Missing snapshots in `zfs list -t snapshot` | Check the timer and sanoid's log |
| **Replication** | Nightly | The newest snapshot on the backup box is old | Fix before the source prunes the common snapshot |
| **Scrub** | Monthly (weekly on TrueNAS by default) | `zpool status` shows CKSUM errors or repaired bytes | Check the cable, then the disk; replace if errors recur |
| **SMART short test** | Daily | Self-test failure, reallocated or pending sectors rising | Order a replacement |
| **SMART long test** | Weekly | Read failure in the long test | Replace the disk |
| **Restore test** | Quarterly | It doesn't restore | The backups aren't backups yet |

## What This Means for the System You Build

- **Choose parity array or pool on purpose:** independent disks survive partial loss and grow one at a time; pools checksum, stripe and grow in fixed shapes.
- **Use RAIDZ2 or mirrors on large disks,** because the resilver window is when the second failure arrives.
- **Give every app its own dataset,** so snapshots, quotas, replication and restores are per app.
- **Scrub on a schedule and read the result:** checksums only help if something reads every block.
- **Read the appliance's current drive policy** before buying, and expect it to change during the box's life.
- **Keep the NAS's management interface off the internet.**
- **Treat redundancy and backup as separate jobs:** RAID survives disks, replication to another machine and an offsite copy survive everything else.

## References

**History**

- [Unraid: 17th birthday](https://unraid.net/blog/17th-birthday), the August 26, 2005 Un-RAID announcement and its design
- [FreeNAS 8.2 documentation](https://www.ixsystems.com/documentation/freenas/8.2/freenas.html), FreeNAS's 2005 start on m0n0wall, the 2009 hand-off and the 8.0 release of May 2, 2011
- [FreeBSD Foundation: The OpenZFS project launches](https://freebsdfoundation.org/blog/openzfs-project/), September 17, 2013, and Matt Ahrens as ZFS co-founder at Sun
- [QNAP: QuTS hero introduced](https://www.qnap.com/en/news/2020/qnap-introduces-new-zfs-based-quts-hero-operating-system-with-greater-reliability-and-enterprise-quts-hero-nas), April 20, 2020, features, launch models and ECC on the TS-h1283XU-RP
- [GitHub: OpenZFS 2.0.0](https://github.com/openzfs/zfs/releases/tag/zfs-2.0.0), November 30, 2020, one repository for Linux and FreeBSD
- [GitHub: OpenZFS 2.3.0](https://github.com/openzfs/zfs/releases/tag/zfs-2.3.0), January 14, 2025, RAIDZ expansion

**Unraid**

- [Unraid 6.12.0 release notes](https://docs.unraid.net/unraid-os/release-notes/6.12.0/), ZFS pool layouts, LUKS instead of native encryption, the ARC default
- [Unraid 7.0.0 release notes](https://docs.unraid.net/unraid-os/release-notes/7.0.0/), January 9, 2025, optional array, TRIM on array devices, hybrid ZFS pools, LUKS on ZFS
- [Unraid: Pricing change](https://unraid.net/blog/pricing-change), February 19, 2024, Starter, Unleashed and Lifetime and grandfathered keys
- [Unraid: Buy](https://account.unraid.net/buy), prices and the update extension as of October 2026
- [Unraid Docs: Licensing FAQ](https://docs.unraid.net/unraid-os/troubleshooting/licensing-faq/), lapsed extensions, the USB GUID and transfers

**TrueNAS**

- [TrueNAS: TrueNAS CORE 13.3 plans](https://www.truenas.com/blog/truenas-core-13-3-plans/), March 20, 2024, the sustaining engineering phase and SCALE for new installs
- [TrueNAS 24.10 release notes](https://www.truenas.com/docs/scale/24.10/gettingstarted/scalereleasenotes/), October 29, 2024, apps from Kubernetes to Docker, TrueCharts and the June 1, 2025 deadline
- [TrueNAS 25.04 release notes](https://www.truenas.com/docs/scale/25.04/gettingstarted/scalereleasenotes/), April 15, 2025, experimental LXC, VMs and the one-way migration from FreeBSD
- [TrueNAS: Community Edition 25.04](https://www.truenas.com/blog/truenas-community-edition-release-2504), the Community Edition name and CORE's maintenance phase
- [TrueNAS CORE release notes](https://www.truenas.com/docs/core/corereleasenotes/), 13.3-U1.2 of April 29, 2025 as the final CORE release
- [TrueNAS Docs: Scrub tasks](https://www.truenas.com/docs/scale/25.04/scaletutorials/dataprotection/scrubtasksscale/), the default Sunday scrub task

**ZFS**

- [OpenZFS: zpoolconcepts(7)](https://openzfs.github.io/openzfs-docs/man/master/7/zpoolconcepts.7.html), mirror and RAIDZ tolerance, 3 to 9 disks per group, special, log and cache devices
- [OpenZFS: zpool-attach(8)](https://openzfs.github.io/openzfs-docs/man/master/8/zpool-attach.8.html), RAIDZ expansion, the old data-to-parity ratio and the feature flag
- [OpenZFS FAQ](https://openzfs.github.io/openzfs-docs/Project%20and%20Community/FAQ.html), ECC guidance, whole disks, `ashift=12` and `/dev/disk/by-id`
- [OpenZFS: License](https://openzfs.github.io/openzfs-docs/License.html), CDDL, GPLv2 and distribution as a binary module
- [Proxmox: Proxmox VE 9.0](https://www.proxmox.com/en/about/company-details/press-releases/proxmox-virtual-environment-9-0), August 5, 2025, OpenZFS 2.3.3

**Appliances**

- [Synology: DS925+ specifications](https://www.synology.com/en-us/products/DS925+#specs), CPU, ECC memory, ports, bays and power draw; non-ECC DS925neo+
- [APH Networks: Synology walks back its 2025 compatibility policy](https://www.aphnetworks.com/news/30849-synology-walks-back-controversial-compatibility-policy-2025-nas-units), October 8, 2025, what the original policy restricted
- [Synology: DSM 7.3](https://www.synology.com/en-ca/company/news/article/dsm73), October 8, 2025, third-party drives on 2025 models and the M.2 exception
- [QNAP: Stop your NAS from exposing to the Internet](https://www.qnap.com/en/security-news/2022/take-immediate-actions-to-stop-your-nas-from-exposing-to-the-internet-and-update-qts-to-the-latest-available-version-fight-against-ransomware-together), January 26, 2022, DeadBolt and the port forwarding and UPnP advice

**Parity and pooling tools**

- [SnapRAID: Compare](https://www.snapraid.it/compare), on-demand parity, up to six parity levels, SpookyHash, adding filled disks, and its comparison with Unraid
- [GitHub: trapexit/mergerfs](https://github.com/trapexit/mergerfs), the FUSE union filesystem and redundancy as a non-feature
- [GitHub: jimsalterjrs/sanoid](https://github.com/jimsalterjrs/sanoid), Sanoid and syncoid, GPL-3.0
- [Sanoid: example sanoid.conf](https://raw.githubusercontent.com/jimsalterjrs/sanoid/master/sanoid.conf), dataset and template syntax
- [Debian: smartd.conf(5)](https://manpages.debian.org/bookworm/smartmontools/smartd.conf.5.en.html), DEVICESCAN, `-a`, `-o`, `-S`, `-m` and the `-s` schedule pattern
