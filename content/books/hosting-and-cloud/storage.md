+++
title = "Storage: Block, File & Object"
description = "Block volumes, file shares and object storage: how each works, classes and minimums, what 11 nines means, data-loss rulings, and the S3-compatible challengers."
category = "Hosting & Cloud Industry"
order = 2123
part = "The Stack, Bottom to Top"
tags = ["storage", "object-storage", "block-storage", "durability", "pricing"]
+++

A provider sells storage in three shapes, and each one makes a different promise. A **block volume** is a virtual disk: the customer's operating system formats it, mounts it and writes sectors to it, and the provider promises that the sectors survive a disk or server failure inside one zone. A **file share** is a mounted file system spoken over NFS or SMB to many clients at once, and the provider promises POSIX or Windows semantics, locking and throughput. An **object store** is an HTTP API of buckets and keys, and the provider promises that an object it acknowledged will be there and readable for years, across a whole region, at a price per gigabyte-month that keeps falling. They fail differently, bill differently and protect against different things, and most data-loss stories are a customer (or a provider) treating one shape's promise as another's.

This chapter covers how the three shapes arrived (RAID and network file systems, then S3 in 2006 and EBS in 2008, Google and Azure storage, Ceph, MinIO and its license history, and the late arrival of strong consistency and conditional writes); how block volumes, file shares and object stores work at operator depth; storage classes and their minimum durations; what durability claims such as "11 nines" do and don't cover, with the outages and court rulings that tested them; egress and the S3-compatible challengers; and the storage view of shared hosting, where "unlimited" disk is bounded by inodes. It adds volumes, snapshots, buckets, storage classes and storage meters to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Media storage economics (hot, warm and cold tiers for user uploads, CDN delivery, dedup, orphans) are the UGP volume's [Storage, Dedup & Delivery Economics](/books/user-generated-platforms/storage-and-delivery), linked rather than restated; backup and restore practice is the playbook's [Disaster Recovery](/docs/operations/disaster-recovery); keys and envelope encryption are [Encryption at Rest](/docs/security/encryption-at-rest). Kubernetes volumes are the later chapter [Storage & Stateful Workloads](/books/hosting-and-cloud/kubernetes-storage), managed databases are [Managed Databases](/books/hosting-and-cloud/managed-databases), backups sold as a hosting product are [Backups, Restores & Migrations](/books/hosting-and-cloud/backups-and-migrations), and egress pricing as a market rule is [Egress & Switching](/books/hosting-and-cloud/egress-and-switching).

## How the Providers Do It

As of October 2026, from each provider's own pages:

| Provider | Block | File | Object | What's distinctive |
| --- | --- | --- | --- | --- |
| **AWS** | EBS: SSD (`gp3`, `gp2`, `io2` Block Express, `io1`) and HDD (`st1`, `sc1`) volumes, replicated within one Availability Zone | EFS (managed NFS, Regional or One Zone); FSx for NetApp ONTAP, OpenZFS, Windows File Server and Lustre | S3, eight storage classes from Express One Zone to Glacier Deep Archive | Durability stated per volume as an annual failure rate (0.1% to 0.2% for `gp3`) and per object as "11 nines" |
| **Microsoft Azure** | Managed disks, LRS or ZRS | Azure Files (SMB 3.x or NFS 4.1) | Blob Storage | Redundancy is a storage-account setting: LRS 11 nines, ZRS 12, GRS and GZRS 16, "over a given year" |
| **Google Cloud** | Zonal and regional disks (not covered here) | Filestore (Zonal, Regional, Basic tiers; NFSv3 and NFSv4.1) | Cloud Storage: Rapid, Standard, Nearline, Coldline, Archive | Archive's minimum storage duration is 365 days; every class is "99.999999999% annual durability" |
| **Cloudflare** | None | None | R2, Standard and Infrequent Access | No egress fee; S3 API with documented gaps (no ACLs, versioning or Object Lock through the S3 API) |
| **Backblaze** | None | None | B2 | Free egress up to 3x average monthly storage; no minimum duration or minimum object size |
| **Wasabi** | None | Cloud NAS | Object storage | One flat price per TB; 90-day minimum on pay-as-you-go, 30-day on reserved capacity |
| **Hetzner** | Not covered here | Not covered here | Object Storage in Falkenstein, Nuremberg and Helsinki | A base price per account that includes 1 TB stored and 1 TB of egress |
| **DigitalOcean** | Not covered here | Not covered here | Spaces, with a cold storage tier | $5 a month for 250 GiB and 1,024 GiB of transfer |
| **OVHcloud** | Not covered here | Not covered here | Object Storage in Multi-Zone, Single-Zone and Local Zone deployments | Says there are no charges for ingress, egress or API calls; Cold Archive on tape |
| **Akamai (Linode)** | Block Storage (not in distributed regions) | Not covered here | Object Storage with endpoint types E0 to E3 | No per-request charges, with per-request charges for E3 endpoints under evaluation and not before October 1, 2027 |
| **Self-hosted** | Not covered here | Ceph's file system (the 2006 paper) | Ceph Object Gateway (RGW); MinIO (community edition archived April 25, 2026); Garage, SeaweedFS, RustFS | The S3 API without a provider, with the operator owning durability |

Three patterns run through the table:

- **The S3 API is the object storage interface.** R2, B2, Wasabi, Hetzner, Spaces, OVHcloud and Akamai all describe themselves as S3-compatible, and the self-hosted projects exist to provide it. The cost of that is that "compatible" means "compatible with what the AWS SDK sends this year," which broke several stores in early 2025 (below).
- **Block is zonal, object is regional.** Volumes are replicated inside one zone and die with it; objects in standard classes are spread across zones. Each provider states this differently, and it decides what a customer has to copy themselves.
- **The challengers compete on the bill's shape, not the storage price alone.** R2 removes egress, B2 caps it at a multiple of storage, Wasabi folds it into a flat rate under a fair-use rule, and Hetzner and DigitalOcean bundle a quota. Each removes a meter and adds a condition.

## How It Got Here

### Disks in arrays, files over the network (1987 to 2000s)

Patterson, Gibson and Katz's Berkeley report "A Case for Redundant Arrays of Inexpensive Disks (RAID)" (technical report UCB/CSD-87-391, 1987) argued that arrays of personal-computer disks could beat the single large expensive disks of the day, promising "improvements of an order of magnitude in performance, reliability, power consumption, and scalability," and defined five RAID levels. Sun's NFS protocol was published as RFC 1094 in March 1989, providing "transparent remote access to shared files across networks" with a server that keeps no protocol state about its clients, so a client simply retries until the server answers. NFS version 4 minor version 1 followed as RFC 5661 in January 2010, and it is the version Azure Files and Filestore speak today.

**What it solved:** disks that outlive a single drive failure, and files shared across machines. **What it cost:** an array or a filer is a box in one room; when the room goes, so does every copy, and the customer of a web host or a dedicated server inherited exactly that.

### Storage as an API (2006 to 2011)

AWS announced S3, "storage for the Internet," on March 13, 2006. Its twentieth-anniversary post (March 13, 2026) gives the launch figures: about 1 petabyte across roughly 400 storage nodes in 15 racks in three data centers, 15 Gbps of total bandwidth, a maximum object of 5 GB, and 15 cents per gigabyte. EBS followed on August 20, 2008: volumes of 1 GB to 1 TB attached to one EC2 instance in one Availability Zone, "automatically replicated" within that zone, snapshots to S3 that load lazily into new volumes, $0.10 per GB-month and $0.10 per million I/O requests. Google previewed Google Storage for Developers on May 19, 2010, "a RESTful cloud service built on Google's storage and networking infrastructure" with "read-after-write data consistency," 100 GB of storage and 300 GB of monthly bandwidth free during the preview. Microsoft published the design of Windows Azure Storage at SOSP in October 2011: storage stamps of front-end, partition and stream layers, strong consistency within a stamp, and a partition index "scalable to 100s of billions of objects per storage stamp."

**What it solved:** storage bought per gigabyte-month with no box to buy, replicated across buildings by default. **What it cost:** a new API that applications had to be written against, and, for S3, eventual consistency that took fourteen years to remove.

### Open source and the S3 API (2006 to 2026)

Ceph was published at OSDI in November 2006 by Weil, Brandt, Miller, Long and Maltzahn at UC Santa Cruz: placement by "a pseudo-random data distribution function (CRUSH)" instead of allocation tables, over "clusters of unreliable object storage devices (OSDs)," with metadata handling of "more than 250,000 metadata operations per second." Its Object Gateway (RGW), "an object storage interface built on top of `librados`," is "compatible with a large subset of the Amazon S3 RESTful API" and of OpenStack Swift, with one namespace shared by both.

MinIO became the most common way to run the S3 API on one's own hardware, and its license history is the clearest public record of what that dependency costs. MinIO relicensed from Apache 2.0 to AGPLv3 with a commit dated April 23, 2021, first shipped in the release published May 12, 2021. In March 2023 it announced that it "revokes Weka's license to any and all MinIO software, effective immediately," alleging distribution of its binaries without attribution. In 2025 it removed the administration console from the community edition, leaving a basic object browser and the `mc` command-line client; its co-founder said "Admin actions in the console lack equivalent security protections." By December 2025 the community edition was in maintenance mode, with no new features or pull requests and security fixes evaluated case by case. The GitHub repository was archived on April 25, 2026; its README says "THIS REPOSITORY IS NO LONGER MAINTAINED," the community edition is source-only with no prebuilt binaries, and the commercial line continues as AIStor Free (standalone) and AIStor Enterprise (distributed). The alternatives named in the press are Garage (AGPLv3), SeaweedFS and RustFS (both Apache 2.0), and Ceph.

**What it solved:** the S3 API on owned hardware, for providers and for customers leaving a cloud. **What it cost:** a storage layer that depends on one vendor's licensing decisions, which is the subject of the chapter [Open Source & the Clouds](/books/hosting-and-cloud/open-source-and-the-clouds).

### The semantics catch up (2020 to 2025)

On December 1, 2020, AWS made "all S3 GET, PUT, and LIST operations, as well as operations that change object tags, ACLs, or metadata" strongly consistent for every object in every region, "at no extra charge" and with "no impact on performance," ending the need for client-side consistency layers (EMRFS Consistent View and S3Guard). S3 Express One Zone launched November 28, 2023 as a storage class for "consistent single-digit millisecond request latency" in one chosen Availability Zone, on a new bucket type, directory buckets. Conditional writes arrived on August 20, 2024 (`If-None-Match` on `PutObject` and `CompleteMultipartUpload`, so a write fails if the key exists) and November 25, 2024 (`If-Match` against the object's ETag), which made S3 usable as a coordination primitive for locks and log-structured tables without a separate database. In December 2024 the AWS SDKs began computing CRC-based checksums on uploads by default; stores that didn't implement the new headers broke, and Cloudflare's status page recorded "AWS S3 SDK compatibility inconsistencies with R2" from January 17 to February 3, 2025, with the error "Header 'x-amz-checksum-algorithm' with value 'CRC32' not implemented."

### Faster block storage (2008 to 2024)

Marc Olson's history of EBS (August 22, 2024) explains the block side's path. Early volumes shared hard drives, so one workload could degrade others; in 2013 engineers installed an SSD in each of thousands of existing servers to stage writes, with no customer disruption. Nitro cards then moved EBS processing and encryption off the host ([Sandboxes & MicroVMs](/books/hosting-and-cloud/sandboxes-and-microvms#how-nitro-works)), and work on the SRD transport began in 2014 ([Data Center Networking](/books/hosting-and-cloud/data-center-networking#aws-efa-and-srd)). Average latency went from above 10 ms per I/O to consistent sub-millisecond operations on `io2` Block Express, and EBS now serves "over 140 trillion operations daily."

## Block Volumes

A block volume is a network-attached virtual disk. The VM sees a device; the provider's storage service sees a set of replicas on storage servers in the same zone, a performance budget, and a chain of snapshots. EBS's current types are the reference set because most providers sell some subset of them:

| Type | Media | Size | Max IOPS | Max throughput | Stated durability | Multi-attach |
| --- | --- | --- | --- | --- | --- | --- |
| `gp3` | SSD | 1 GiB to 64 TiB | 80,000 | 2,000 MiB/s | 99.8% to 99.9% (0.1% to 0.2% annual failure rate) | No |
| `gp2` | SSD | 1 GiB to 16 TiB | 16,000 | 250 MiB/s | Same | No |
| `io2` Block Express | SSD | 4 GiB to 64 TiB | 256,000 | 4,000 MiB/s | 99.999% (0.001% annual failure rate) | Yes |
| `io1` | SSD | 4 GiB to 16 TiB | 64,000 | 1,000 MiB/s | 99.8% to 99.9% | Yes |
| `st1` | HDD | 125 GiB to 16 TiB | 500 (1 MiB I/O) | 500 MiB/s | 99.8% to 99.9% | No; not bootable |
| `sc1` | HDD | 125 GiB to 16 TiB | 250 (1 MiB I/O) | 250 MiB/s | 99.8% to 99.9% | No; not bootable |

Three design decisions are visible in it.

**Performance coupled to size, or provisioned separately.** On `gp2`, throughput is tied to volume size (between 128 MiB/s and 250 MiB/s depending on size), so customers bought capacity they didn't need to get speed. `gp3` decouples them: the example price of $0.08 per GB-month includes 3,000 IOPS and 125 MB/s, with extra IOPS at $0.005 per IOPS-month and extra throughput at $0.06 per MB/s-month, against $0.10 per GB-month for `gp2` with I/O included (example rates, as of October 2026). For a provider, the decoupled model is three meters instead of one, and it turns a storage server's IOPS and bandwidth into products sold separately from its bytes. `io2` adds a price per provisioned IOPS ($0.065 per IOPS-month for the first 32,000) on top of $0.125 per GB-month, and `io2` is "designed to deliver an average latency of under 500 microseconds for 16KiB I/O operations." The ceilings depend on the instance too: only Nitro instances reach 256,000 IOPS, and others achieve up to 32,000. The host side of the same queues, and why per-VM IOPS caps exist, is [Virtualization & the VPS](/books/hosting-and-cloud/virtualization-and-vps#disk-and-network).

**Replication inside one zone, durability per volume.** A volume's copies stay in its zone, which is what keeps writes fast enough for a database and what makes a zone outage a volume outage. The durability statement follows: 0.1% to 0.2% of `gp3` volumes are expected to fail in a year, five orders of magnitude weaker than the per-object figure for S3 Standard. A customer running a database on one volume has accepted that rate. Azure states the same choice as a redundancy option: managed disks are LRS or ZRS, and ZRS managed disks carry their own limitations.

**Snapshots are incremental objects.** An EBS snapshot "is an incremental backup," saving only the blocks changed since the previous snapshot, and is stored "in S3 buckets that you can't access directly," replicated "across all Availability Zones in the Region," so a volume can be restored in any zone. Three consequences follow for billing and for customers:

- **Deleting a snapshot may not reduce the bill.** "Data referenced exclusively by a snapshot is removed when that snapshot is deleted, but data referenced by other snapshots is preserved." The billable size of a snapshot is its unique blocks, which change when a neighbor in the chain is deleted.
- **Snapshots are the customer's job.** "AWS does not automatically back up the data stored on your EBS volumes." A provider that offers scheduled snapshots sells it as a separate feature (Data Lifecycle Manager, AWS Backup), and the playbook's [Backups](/docs/operations/disaster-recovery#backups) and [Restores Are What Matter](/docs/operations/disaster-recovery#restores-are-what-matter) rules apply to it.
- **Cold snapshot tiers carry minimums.** Standard snapshot storage is $0.05 per GB-month; the archive tier is $0.0125 with a 90-day minimum and a $0.03 per GB restore fee (example rates). Snapshot lock and block public access exist because snapshots are both the recovery path and an exfiltration path.

**Multi-attach is a shared disk, not a shared file system.** EBS lets one `io1` or `io2` volume attach to up to 16 Nitro instances in the same zone, each with full read and write access, at no extra charge. The documentation is blunt that "Standard file systems, such as XFS and EXT4, are not designed to be accessed simultaneously by multiple servers"; a clustered file system and I/O fencing through NVMe reservations are the customer's responsibility. Multi-attach volumes can't be boot volumes or be enabled at launch, and "Multi-Attach enabled volumes that have an issue at the Amazon EBS infrastructure layer are unavailable to all attached instances." A provider offering shared block storage is selling a clustering problem, and should say so as plainly.

## File Shares

A managed file share is the NFS or SMB server the customer would otherwise run, with the provider owning replication, scaling and the metering.

**Throughput is the product.** EFS sells three throughput modes. **Elastic** (the default) bills for data read and written and suits spiky loads; **Provisioned** bills for throughput above what the stored data includes; **Bursting** gives a baseline of 50 KiB/s per GiB stored and bursts to 100 MiB/s per TiB from credits, so a 100 GiB file system bursts to 100 MiB/s for 72 minutes a day. Two metering rules shape behavior: "Every Network File System (NFS) request is accounted for as 4 kilobyte (KB) of throughput, or its actual request and response size, whichever is larger," and reads are metered at up to one third the rate of writes. A workload of millions of tiny files pays for 4 KB per operation however small the file. EFS list prices in US East (AWS Price List API, as of October 2026): Standard $0.30 per GB-month, Infrequent Access $0.025, Archive $0.008, One Zone $0.16; Elastic reads $0.03 and writes $0.06 per GB.

**Protocol decides the market.** Azure Files serves SMB 3.1.1, 3.0 and 2.1 to Windows, Linux and macOS, or NFS 4.1 to Linux only, never both on one share. SMB shares can be HDD or SSD and use any redundancy option; NFS shares are SSD only, LRS or ZRS. SMB shares authenticate through Active Directory, Entra Domain Services or Entra Kerberos, and the planning guide warns that "Many organizations and internet service providers (ISPs) block port 445," so a share that works from a VM may not mount from an office. Share snapshots are incremental, up to 200 per share, kept up to 10 years, and soft delete is on by default for new storage accounts. Pay-as-you-go HDD shares in East US list at $0.06 per GB-month for the transaction-optimized tier on LRS, $0.0287 for Hot and $0.0228 for Cool (Azure Retail Prices API, as of October 2026), with transactions metered separately.

**Tiers by capacity and zone.** Filestore sells Zonal (1 TiB to 100 TiB) and Regional (100 GiB to 100 TiB) tiers on NFSv3 and NFSv4.1 with backups, snapshots and replication, a Multishares tier for GKE, and legacy Basic HDD and SSD tiers that speak only NFSv3 and scale only up. AWS sells four managed file systems under FSx (NetApp ONTAP, OpenZFS, Windows File Server and Lustre), which are other vendors' file systems run as a service.

### Inodes on shared hosting

The oldest file storage product in hosting is the shared account's home directory, and its real limit is usually files, not bytes. Each file and directory is an inode; the kernel enforces inode quotas through filesystem quotas, as [Shared Hosting Isolation](/books/hosting-and-cloud/shared-hosting-isolation#cloudlinux-lve-limits) describes. What hosts publish, as of October 2026:

| Host | Published inode policy | What enforces it |
| --- | --- | --- |
| **HostGator** | "There is currently a limit of 100k/250k inodes on our shared accounts" | Acceptable Use Policy; accounts over it "may be flagged for review and/or suspension" |
| **Hostinger** | Web Single 200,000 inodes; the top Web plan 600,000 | Plan limits; emails, databases and automated backups don't count |
| **Namecheap** | Stellar and Stellar Plus 300,000; Stellar Business 600,000; resellers 600,000 to 1,500,000 | Accounts over 200,000 inodes are removed from automatic server backups (except Stellar Business) |
| **Bluehost** | 50,000 per cPanel account as a "soft limit"; over 200,000 refers to the AUP's excessive-use section; over 1,000,000 violates the Terms of Service | AUP and Terms of Service; VPS and dedicated plans have no fixed cap |

The pattern: plans sold as unlimited are bounded by file counts, by backup eligibility and by AUP language rather than by bytes. A provider building this should publish the inode limit with the plan, because a customer whose site stops writing files at the hard limit experiences it as an outage, and a customer silently dropped from backups learns about it only during a restore.

## Object Storage Semantics

An object store is a flat namespace of **buckets** holding **objects** under **keys**, read and written whole over HTTP. The nouns below are the S3 API's, because that's what clients speak; other stores map to them or document where they don't.

**Sizes and multipart.** S3 objects range from 0 bytes to 50 TB (48.8 TiB in the multipart limits table). A single PUT can be at most 5 GB; larger objects use multipart upload: up to 10,000 parts of 5 MiB to 5 GiB each, with no minimum on the last part, assembled by `CompleteMultipartUpload`. Incomplete multipart uploads hold storage until aborted, which is why every lifecycle policy needs an abort rule ([The Upload Path](/books/user-generated-platforms/upload-path#resumable-and-chunked-uploads) covers the client side).

**Consistency.** Since December 2020, S3 gives strong read-after-write consistency for GET, PUT and LIST. Google's service claimed read-after-write consistency at its 2010 preview, and Azure's design paper made strong consistency within a stamp a goal from the start. A store that claims S3 compatibility but not strong consistency breaks every client written after 2020 that assumes it.

**Conditional writes.** `If-None-Match` makes a PUT fail if the key exists; `If-Match` makes it fail unless the current ETag matches. Together they give compare-and-swap on a key, which is enough to build a lock or a commit log on object storage alone. Both are free and work on general purpose and directory buckets.

**Versioning and delete markers.** A bucket is unversioned, versioning-enabled or versioning-suspended, and "After you version-enable a bucket, it can never return to an unversioned state." With versioning on, a DELETE without a version ID inserts a **delete marker** that becomes the current version, and an overwrite creates a new version; "Each version of an object is the entire object; it is not just a diff," so three versions bill as three objects. A versioned bucket needs a noncurrent-version expiration rule, or deleted data keeps billing forever.

**Lifecycle.** Rules transition objects to colder classes or expire them, and apply to existing objects as well as new ones. "Billing changes are applied as soon as the object becomes eligible for the lifecycle action," except for transitions into Intelligent-Tiering, and each transition is a billed request. "You can't use a bucket policy to prevent deletions or transitions by an S3 Lifecycle rule": a lifecycle rule is a deletion path that access control doesn't guard, so changes to it belong in the audit trail.

**Object Lock (WORM).** Object Lock "works only in buckets that have S3 Versioning enabled" and protects a specific version. In **compliance** mode no user, including the account's root user, can delete the version or shorten its retention; "The only way to delete an object under the compliance mode before its retention date expires is to delete the associated AWS account." **Governance** mode can be overridden by a principal with `s3:BypassGovernanceRetention` sending `x-amz-bypass-governance-retention:true`. A **legal hold** has no expiry and lasts until removed. **Variable retention** sets the retain-until date when an event hold is released, for retention that starts at a business event such as account closure. A simple DELETE on a locked object still succeeds and adds a delete marker; a DELETE naming the version returns 403. S3 Object Lock has been assessed by Cohasset Associates for SEC 17a-4, CFTC and FINRA environments. The playbook's [Make It Tamper-Evident](/docs/architecture/audit-trails#make-it-tamper-evident) covers WORM for audit logs; the provider-side point is that a store without Object Lock (R2's S3 API, for one) can't host those logs.

**Presigned URLs.** A presigned URL carries the credentials of the principal that signed it and works for anyone who holds it, as many times as they like, until it expires: up to 7 days for an IAM user's Signature Version 4 credentials, and never longer than temporary credentials themselves (an EC2 role's typically last about 6 hours). Expiry is checked when the request starts, so a download that begins a second before expiry completes. AWS's own documentation calls them bearer tokens and recommends restricting them by signature age and network path.

**Global names, regional data.** Bucket names are globally unique, and "all calls to the `CreateBucket` and `DeleteBucket` APIs depend on `us-east-1`" to enforce that, even for a bucket in another region; several bucket-configuration calls (versioning, policy, lifecycle, encryption, replication, Object Lock configuration) share the dependency. AWS's advice is to pre-create buckets and configure them before an incident, never during one, which is the static-stability rule from [Regions, Zones, Cells & Quotas](/books/hosting-and-cloud/regions-zones-and-cells#control-plane-and-data-plane) applied to storage.

## Storage Classes and Their Minimums

A storage class trades price per gigabyte against retrieval time, availability and a set of minimums. The minimums are where customers get surprised, because they turn a cheap class into an expensive one for data that doesn't stay long or is too small.

| Class (provider) | Designed availability (SLA) | Minimum duration | Minimum billable size | Retrieval |
| --- | --- | --- | --- | --- |
| S3 Standard | 99.99% (99.9%) | None | None | Milliseconds |
| S3 Express One Zone | 99.95% (99.9%), one AZ | 1 hour | None stated | Single-digit milliseconds |
| S3 Standard-IA | 99.9% (99%) | 30 days | Not stated on the classes page | Milliseconds, per-GB retrieval fee |
| S3 One Zone-IA | 99.5% (99%), one AZ | 30 days | Not stated on the classes page | Milliseconds |
| S3 Glacier Instant Retrieval | 99.9% (99%) | 90 days | 128 KB | Milliseconds |
| S3 Glacier Flexible Retrieval | 99.99% (99.9%) | 90 days | Not stated on the classes page | Minutes to hours |
| S3 Glacier Deep Archive | 99.99% (99.9%) | 180 days | Not stated on the classes page | Within 12 hours |
| Cloud Storage Nearline / Coldline / Archive | SLA 99.0% (region), 99.9% (multi- and dual-region) | 30 / 90 / 365 days | None stated | Retrieval fees |
| R2 Infrequent Access | Not stated | 30 days | None stated | $0.01 per GB |
| Wasabi (all data) | Not stated | 90 days pay-as-you-go; 30 days reserved | 4 KB | No fee |
| Backblaze B2 | Not stated | None | None | No fee |

Two traps follow from the table:

- **Minimum duration is a deletion fee.** An object deleted or transitioned before its minimum is billed for the rest of the period, so a 90-day class used for 10-day logs costs nine times its list price per gigabyte actually stored. Wasabi applies its minimum to all data, which makes it a poor home for short-lived objects despite the flat price.
- **Minimum size is a small-object fee.** A 4 KB object in a class with a 128 KB minimum bills as 128 KB, 32 times its size. Hetzner bills every object as at least 64 KB and DigitalOcean's cold tier as at least 128 KiB, with a 128 KiB minimum per read.

Choosing tiers for media by access age, and the arithmetic of Intelligent-Tiering, are in UGP's [Hot, Warm and Cold Storage](/books/user-generated-platforms/storage-and-delivery#hot-warm-and-cold-storage).

## What Durability Claims Mean

Every major object store states durability the same way: a probability that an object survives a year. S3 is "designed to exceed 99.999999999% (11 nines) data durability," with data stored across at least three Availability Zones; Cloud Storage states "99.999999999% annual durability" for every class; Azure states "at least" 11 nines for LRS, 12 for ZRS and 16 for GRS and GZRS "of objects over a given year." AWS's 2019 FAQ translated the figure: "if you store 10,000,000 objects with Amazon S3, you can on average expect to incur a loss of a single object once every 10,000 years." The current FAQ no longer carries that sentence.

What the number covers:

- **Independent hardware failure, repaired fast.** S3's FAQ says durability depends on how quickly it can "detect failure and then re-replicate data," and that it runs "end-to-end integrity checking on every object upload" and "periodic integrity checks of all data at rest," repairing "any disparity using redundant data." Azure verifies stored data with CRCs and repairs from redundant copies. Erasure coding, splitting an object into k data shards and m parity shards so any k reconstruct it, is how S3 stores data at a lower overhead than full replicas, and the extra shards also let reads avoid busy disks (Warfield, July 27, 2023).
- **Zone loss, for the multi-zone classes only.** One Zone classes are designed for 11 nines against disk, host and rack failure, but "data in a One Zone storage class may be lost" if an Availability Zone is destroyed. Azure LRS keeps its copies in one datacenter, and "if a disaster such as fire or flooding occurs within the datacenter, all replicas of a storage account that uses LRS might be lost."

What it doesn't cover:

- **The customer's own deletes and overwrites.** "Amazon S3's durability system does not protect against accidental or malicious deletes," and "When you tell Amazon S3 to delete data, that data is immediately deleted, and it cannot be recovered by AWS." Azure: "Redundancy protects against hardware failure, not against data-modifying operations." Versioning, Object Lock, replication to another account and backups are the protections, and they're the customer's to configure.
- **The provider's own mistakes.** Durability models drives and buildings, not tooling. The incidents below were tooling, automation or contract failures.
- **Asynchronous geo-replication.** Azure warns that because geo-replication is asynchronous, "data not yet replicated to the secondary region is lost" in a regional disaster; its Geo priority replication bounds the Block Blob RPO at 15 minutes or less.
- **Block volumes.** A `gp3` volume's 0.1% to 0.2% annual failure rate is the number that applies to a VM's disk, not 11 nines.

### When storage failed in public

| Incident | What happened | What it shows |
| --- | --- | --- |
| **EBS, US East, April 21, 2011** | A network change shifted traffic onto a lower-capacity network, isolating EBS nodes, which then searched for space to re-mirror and ran the cluster out of capacity; about 13% of volumes in the zone stuck, plus about 5% more; slow control-plane calls exhausted a regional thread pool and failed API requests in other zones; 0.07% of volumes in the affected zone "could not be restored in a consistent state"; a 10-day credit | Replica repair is load, and a zonal storage outage reached the region through a shared control plane; EBS's later control-plane store, Physalia (built from 2013), is designed to be "extremely available for only the keys it knows each client needs" ([Regions, Zones, Cells & Quotas](/books/hosting-and-cloud/regions-zones-and-cells#cells-and-shuffle-sharding)) |
| **S3, US East, February 28, 2017** | A mistyped command from an established playbook removed far more servers than intended, including the index and placement subsystems, which needed full restarts; GET, LIST and DELETE returned at 12:26 PM PST, normal service at 1:54 PM; the status dashboard depended on S3 | Capacity-removal tools now remove slowly and refuse to go below a minimum; the index was split into cells; no data loss was reported |
| **OVHcloud Strasbourg fire, March 10, 2021** | SBG2, a five-storey data center, was destroyed; SBG1 partly damaged and later written off; SBG3 and SBG4 unaffected; firefighters' report as summarized cited no automatic fire-suppression system and no emergency power cut-off | Backups in the same building as production are one copy |
| **Bati Courtage v. OVH**, Tribunal de commerce de Lille Métropole, January 26, 2023 (Blocks & Files dates it February 3) | The backup option was described as "physically isolated from the infrastructure in which the VPS server is set up," but the backups sat in the same building; claim over €6.5 million; award €101,102 (€38,530 financial loss, €26,472 loss of an intangible asset, €20,000 reputational harm, €9,100 restoration, €7,000 legal costs); no gross negligence found on fire safety | A backup's location is a contractual promise, and the court enforced the words |
| **Bluepad v. OVH**, same court, March 16, 2023 | Production in SBG1, backups in SBG2, while OVH had said both were in SBG2; the court held the server location contractual and rejected force majeure; OVH was also liable for restarting a recovered backup server with purge scripts that deleted the customer's backups; claim €330,155, award €153,837 | Location data the provider shows the customer is part of the contract; recovery tooling can destroy what the fire spared |
| **Google Cloud VMware Engine, UniSuper, May 2024** | An internal tool used in early 2023 left a parameter blank, which defaulted to a one-year term; at expiry the customer's private cloud was deleted with no notification, because the deletion wasn't customer-initiated; backups in Cloud Storage in the same region and third-party backup software allowed recovery over several days | A provider-side deletion bypasses customer-side safeguards; customer-held backups outside the deleted service are what recovered it |

OVH said it would appeal both rulings; as of October 2026 I found no published appeal decision.

The lessons are the same ones the playbook's [Disaster Recovery](/docs/operations/disaster-recovery#strategies) states generally: a copy in the same failure domain isn't a backup, and a restore that hasn't been tested isn't a plan. The provider-specific additions are that the stated location of every copy is a fact the provider must be able to prove, and that every deletion the provider's own systems perform needs the same notice and delay a customer deletion gets.

## Egress and the S3-Compatible Challengers

S3's internet egress in US East lists at $0.09 per GB for the first 10 TB a month after a free 100 GB, falling to $0.05 above 150 TB; S3 Standard storage is $0.023 per GB-month for the first 50 TB (AWS Price List API, as of October 2026). Egress is the meter the challengers attack:

| Store | Storage (as of October 2026) | Egress | Requests | Conditions |
| --- | --- | --- | --- | --- |
| **S3 Standard (US East)** | $0.023 per GB-month (first 50 TB) | $0.09 per GB after 100 GB free | PUT $0.005 per 1,000; GET $0.004 per 10,000 | None |
| **Cloudflare R2** | $0.015 Standard; $0.01 IA | Free | Class A $4.50, Class B $0.36 per million | IA: 30-day minimum, $0.01 per GB retrieved |
| **Backblaze B2** | $6.95 per TB-month | Free up to 3x average monthly storage, then $0.01 per GB | Classes A to C free; Class D $0.004 per 10,000 | None on duration or size |
| **Wasabi** | $7.99 per TB-month | Free if monthly egress is at most active storage | Free under "reasonable use" | 1 TB minimum charge; 90-day minimum (30 on reserved); regular overuse "may" lead to limits or suspension |
| **Hetzner Object Storage** | €6.49 a month including 1 TB stored and 1 TB egress; then €0.0087 per TB-hour | €1 per TB over the quota | Free | Bucket limits: 100 TB and 50 million objects |
| **DigitalOcean Spaces** | $5 a month including 250 GiB; then $0.02 per GiB | 1,024 GiB included; then $0.01 per GiB | Not separately billed | Cold tier $0.007 per GiB with a 30-day minimum |
| **OVHcloud Object Storage** | Per class, prices on a separate page | "No hidden fees for ingress or egress" | No API charges | Minimums by class: 1 hour, 30, 90 or 180 days |
| **Akamai Object Storage** | Base plan, prices on Akamai's pricing site | Transfer pool with overage | None, as of October 2026 | Per-request charges for E3 endpoints not before October 1, 2027 |

Zero egress (R2) moves the price into requests; capped egress (B2, Wasabi) is free until the customer looks like a CDN origin, when the fair-use language decides; bundled quotas (Hetzner, DigitalOcean) suit small accounts. A provider choosing one is choosing its customers: zero egress attracts delivery-heavy tenants, and a flat price with a 90-day minimum attracts backups and repels caches. The delivery side of the same bill (CDN, egress per viewer) is UGP's [CDN, Egress and the Delivery Bill](/books/user-generated-platforms/storage-and-delivery#cdn-egress-and-the-delivery-bill); egress as a regulated switching cost is [Egress & Switching](/books/hosting-and-cloud/egress-and-switching).

**Compatibility is a matrix, not a checkbox.** R2's S3 API documentation lists what isn't implemented: ACLs, Object Lock, versioning, tagging, website hosting, bucket policies and public access blocks, replication, notifications, inventory, and server-side encryption headers other than SSE-C; the region is `auto`. Hetzner points to a separate list of supported actions. The December 2024 checksum change shows the other half: the S3 API evolves through the AWS SDKs, and a compatible store has to track SDK releases, not a specification. A provider selling S3 compatibility should publish its matrix and test against current SDK versions on every release; a customer should test the operations it uses, not the claim.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Licensing and ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Hyperscaler block volumes** (EBS, managed disks) | Network block device replicated in one zone | Low latency; online resizing; incremental snapshots | Zone outage takes the volume; annual failure rate in tenths of a percent; snapshot bills that don't fall on delete | Proprietary | Per GB-month plus provisioned IOPS and throughput | VM and database disks |
| **Managed file shares** (EFS, Azure Files, Filestore, FSx) | NFS or SMB as a service | Many clients, POSIX or Windows semantics, no file server to run | Per-operation metering punishes small files; SMB port 445 blocked on many networks | Proprietary; FSx resells NetApp, OpenZFS, Windows and Lustre | Per GB-month plus throughput | Lift-and-shift apps, shared home directories, HPC scratch |
| **Hyperscaler object storage** (S3, Blob, Cloud Storage) | HTTP buckets and keys across zones | 11 nines or more; strong consistency; full feature set (versioning, Object Lock, lifecycle, conditional writes) | Egress cost; minimum durations and sizes in cold classes; global-name control-plane dependency | Proprietary | Per GB-month, per request, per GB egress | Nearly everyone |
| **S3-compatible challengers** (R2, B2, Wasabi, Hetzner, Spaces, OVHcloud, Akamai) | The S3 API with a different bill | Low or zero egress; simpler prices | Feature gaps (versioning, Object Lock, policies); fair-use clauses; SDK drift | Proprietary | Per TB-month, often bundled | Media delivery, backups, cost-sensitive storage |
| **Self-hosted Ceph** | A RADOS cluster with CRUSH placement, a file system and an S3 and Swift gateway | File and object from one cluster; no egress fees on owned links | Operational depth; the operator owns durability | Mostly LGPL 2.1 or 3.0 | Hardware, power and staff | Providers building their own storage, private clouds |
| **Self-hosted MinIO, Garage, SeaweedFS, RustFS** | Single-purpose S3 servers | Simple to deploy | MinIO community edition archived April 25, 2026; younger projects' durability unproven at scale | AGPLv3 (MinIO, Garage), Apache 2.0 (SeaweedFS, RustFS) | Hardware and staff | Homelabs, on-prem S3 endpoints, repatriation |
| **Shared-hosting disk** | A home directory under filesystem quotas | Bundled, no API | Inode limits; backup eligibility thresholds; one server, one failure domain | Panel and OS licenses | Inside the plan | Small websites |

## My Default

My default for a provider building storage is all three shapes on a shared fleet of storage servers, with the promises stated exactly. Block volumes replicated within a zone, with capacity, IOPS and throughput priced separately (the `gp3` model), incremental snapshots stored in the object layer across zones, and the per-volume annual failure rate published next to the price. Object storage across at least three zones in any region that has them, strongly consistent with conditional writes, versioning and Object Lock from day one, because those are what customers build backups, audit logs and table formats on, and a store without them is a cache. File shares only when customers ask for them, as NFS 4.1 first, with the 4 KB-per-operation style of metering stated up front.

I'd price object storage with egress included up to a multiple of stored bytes, the B2 shape, rather than at zero or at hyperscaler rates: it removes the surprise bill for normal use and keeps a delivery-heavy tenant from treating the store as a free CDN. I'd keep minimum durations only on genuinely cold tiers, and never on the default class.

On the record-keeping side, every copy's facility is a stored fact, every provider-initiated deletion goes through the same notice and delay as a customer's, and the S3 compatibility matrix is published and tested against current SDKs. The OVH and UniSuper cases are both about the provider's records and tools, not the drives.

For a customer, I'd keep data in the cloud's own object store when compute is there, put backups in a second provider's S3-compatible store under a different account with Object Lock where the store supports it, and never treat a single block volume or a same-building backup as durable.

What would change this: a provider whose customers are mostly backup and archive would choose the Wasabi shape (one flat price, a minimum duration, fair-use egress) and skip block storage entirely; a provider too small to run its own storage fleet should run Ceph rather than a single-vendor S3 server, given MinIO's history; and a provider that also sells CDN would give zero egress from the store to its own edge and meter the edge instead.

## How to Build It

The chapter adds side tables for `volume`, `snapshot` and `bucket` resources (kinds already in the core `resources` CHECK), volume attachments, a storage class catalog, the physical locations of copies, effective-dated bucket configuration, and storage meters to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Storage servers are `hardware_assets` of class `storage_node` from [Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers#how-to-build-it), in the `facilities` of [The Data Center & Colocation](/books/hosting-and-cloud/data-centers-and-colocation#how-to-build-it); the VMs volumes attach to are `virtual_machines`; zones and their facilities are mapped in [Regions, Zones, Cells & Quotas](/books/hosting-and-cloud/regions-zones-and-cells#how-to-build-it).

```sql
-- resources.kind already includes 'volume', 'snapshot', 'bucket'.

CREATE TABLE storage_classes (           -- the catalog facts that rating and lifecycle need
  code               TEXT PRIMARY KEY,   -- 'block.ssd_general', 'object.standard', 'object.archive'
  shape              TEXT NOT NULL CHECK (shape IN ('block', 'file', 'object', 'snapshot')),
  replication_scope  TEXT NOT NULL CHECK (replication_scope IN ('zonal', 'regional',
                       'multi_region')),
  min_duration       INTERVAL,           -- billed to the end if deleted earlier; null: none
  min_billable_bytes BIGINT,             -- 131072 for a 128 KB minimum; null: none
  retrieval_billed   BOOLEAN NOT NULL DEFAULT FALSE,
  stated_durability  TEXT,               -- as published: '99.999999999% per object per year',
                                         -- '0.1% to 0.2% annual failure rate per volume'
  availability_sla   NUMERIC(6,3)        -- percent; the SLA, not the design target
);

CREATE TABLE volumes (                   -- side table: kind = 'volume'; resources.zone_id set
  resource_id        UUID PRIMARY KEY REFERENCES resources (id),
  storage_class      TEXT NOT NULL REFERENCES storage_classes (code),
  volume_type        TEXT NOT NULL,      -- the sellable type: 'ssd-general-v3', 'hdd-throughput'
  size_gib           INT NOT NULL CHECK (size_gib > 0),
  performance_model  TEXT NOT NULL CHECK (performance_model IN ('size_coupled', 'provisioned',
                       'burst_credits')),
  provisioned_iops   INT,                -- above the included baseline, when provisioned
  provisioned_mibps  INT,
  multi_attach       BOOLEAN NOT NULL DEFAULT FALSE,
  bootable           BOOLEAN NOT NULL,
  kms_key_ref        TEXT,               -- the key; Encryption at Rest owns the hierarchy
  source_snapshot_id UUID REFERENCES resources (id),   -- kind = 'snapshot', if restored
  CHECK (performance_model = 'provisioned' OR (provisioned_iops IS NULL
         AND provisioned_mibps IS NULL)),
  CHECK (NOT (multi_attach AND bootable))
);

CREATE TABLE volume_attachments (        -- which VM had the disk, over time
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  volume_id       UUID NOT NULL REFERENCES resources (id),
  vm_id           UUID NOT NULL REFERENCES resources (id),   -- kind = 'virtual_machine'
  device_name     TEXT NOT NULL,
  shared          BOOLEAN NOT NULL,      -- copied from volumes.multi_attach at attach time
  attached_during TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (volume_id WITH =, attached_during WITH &&) WHERE (NOT shared),
  EXCLUDE USING GIST (volume_id WITH =, vm_id WITH =, attached_during WITH &&)
);

CREATE TABLE snapshots (                 -- side table: kind = 'snapshot'
  resource_id        UUID PRIMARY KEY REFERENCES resources (id),
  source_volume_id   UUID REFERENCES resources (id),   -- null once the volume is gone
  parent_snapshot_id UUID REFERENCES resources (id),   -- the previous link in the chain
  storage_class      TEXT NOT NULL REFERENCES storage_classes (code),  -- standard or archive
  logical_bytes      BIGINT NOT NULL,    -- the volume as captured
  unique_bytes       BIGINT NOT NULL,    -- blocks only this snapshot references; what bills
  state              TEXT NOT NULL CHECK (state IN ('pending', 'completed', 'archiving',
                       'archived', 'restoring', 'error')),
  locked_until       TIMESTAMPTZ,        -- snapshot lock
  in_recycle_bin_until TIMESTAMPTZ,      -- deleted but recoverable
  public             BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at       TIMESTAMPTZ
);

CREATE TABLE buckets (                   -- side table: kind = 'bucket'
  resource_id        UUID PRIMARY KEY REFERENCES resources (id),
  name               TEXT NOT NULL UNIQUE,  -- global namespace; held in resource_identifiers too
  default_class      TEXT NOT NULL REFERENCES storage_classes (code),
  bucket_type        TEXT NOT NULL CHECK (bucket_type IN ('general', 'directory')),
  object_lock_enabled BOOLEAN NOT NULL DEFAULT FALSE,  -- set at creation; never turned off
  s3_compat_profile  TEXT                -- the published compatibility matrix version served
);

CREATE TABLE bucket_config_versions (    -- every configuration a bucket had, with its author
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  bucket_id          UUID NOT NULL REFERENCES resources (id),
  versioning         TEXT NOT NULL CHECK (versioning IN ('unversioned', 'enabled', 'suspended')),
  default_retention  JSONB,              -- {"mode": "compliance", "days": 365} or an event hold
  lifecycle_rules    JSONB NOT NULL DEFAULT '[]',  -- transitions, expirations, abort-multipart
  public_access_blocked BOOLEAN NOT NULL DEFAULT TRUE,
  replication        JSONB,              -- destination bucket, account and scope
  valid_during       TSTZRANGE NOT NULL,
  changed_by         TEXT NOT NULL,      -- typed actor
  EXCLUDE USING GIST (bucket_id WITH =, valid_during WITH &&)
);

CREATE TABLE storage_copy_locations (    -- where the copies of a volume, snapshot or bucket are
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  resource_id   UUID NOT NULL REFERENCES resources (id),
  facility_id   UUID NOT NULL REFERENCES facilities (id),
  copy_role     TEXT NOT NULL CHECK (copy_role IN ('primary', 'replica', 'backup',
                  'geo_secondary')),
  promised      BOOLEAN NOT NULL,        -- true when the product or contract states it
  held_during   TSTZRANGE NOT NULL
);

-- usage_events.meter values added by this chapter (egress stays the core 'egress.bytes'):
--   'storage.gb_month'          bytes held, integrated over time; dimensions
--                               {"storage_class": ..., "shape": "volume" | "snapshot" | "bucket"}
--   'storage.requests'          {"request_class": "A" | "B" | "C" | "D", "operation": "PUT" ...}
--   'storage.retrieval_bytes'   reads from classes with retrieval fees; {"storage_class": ...}
--   'storage.early_delete_gb_days'  the unexpired minimum when an object or snapshot leaves early
--   'storage.provisioned_iops_month', 'storage.provisioned_mibps_month'  above the baseline
--   'storage.throughput_bytes'  file-share metered I/O; {"direction": "read" | "write"},
--                               each operation counted at the product's minimum (e.g. 4 KB)
```

Notes on the sketch:

- **Minimums are catalog facts, and leaving early is a meter.** `storage_classes` holds each class's minimum duration and size, so lifecycle rules and rating read the same numbers. When an object or archived snapshot leaves before its minimum, the storage service emits `storage.early_delete_gb_days` for the remainder; the customer's invoice shows a line for it instead of an unexplained storage charge.
- **Snapshots bill their unique bytes, and those change.** `unique_bytes` is recomputed when a neighbor in the chain is deleted, and `storage.gb_month` for snapshots is emitted from it, so a customer asking why deleting a snapshot didn't lower the bill gets an answer from data. Machine images sit on snapshots too, and [Baking Images: Packer](/books/hosting-and-cloud/packer-and-images#how-to-build-it) meters their storage the same way.
- **Attachments are ranges.** A volume that isn't multi-attach can be attached to one VM at a time, enforced by the partial exclusion constraint; a shared volume can have many. "Which instance had this disk at 03:10" is one query, which an abuse report or a data-exposure review needs.
- **Bucket configuration is history.** Versioning, retention, lifecycle and public access change by new rows, never edits, so "who suspended versioning before the deletes" or "when did this bucket become public" is answerable. Versioning can't return to `unversioned` once enabled; the service enforces it on insert by comparing with the previous row.
- **Copies have locations.** `storage_copy_locations` records which facility holds each copy and whether that placement was promised. A report of `backup` copies in the same facility as their `primary` is the check the OVH rulings say a provider should have run; the `promised` flag ties the data to the product description that becomes the contract.
- **Bucket names are identifiers.** A bucket's name is held in `resource_identifiers` with kind `hostname` for its endpoint, so a deleted bucket's name can be kept from reuse for a period, which stops a new owner from receiving traffic and uploads meant for the old one.
- **Events:** `volume.created`, `volume.attached`, `volume.detached`, `volume.modified`, `snapshot.completed`, `snapshot.archived`, `snapshot.deleted`, `bucket.created`, `bucket.config_changed` (with the old and new versions), `bucket.public_access_changed` and `storage.provider_deletion_scheduled` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to billing, the customer's audit log, notifications and the abuse desk. The last one is the UniSuper lesson: a deletion the provider's own systems start is announced to the customer before it happens.

## Auditing

- **Every deletion and who started it.** Customer deletes, lifecycle expirations and provider-initiated deletions with their typed actor, notice and delay, because durability doesn't cover deletes and the first question after a loss is who deleted what ([Audit Trails](/docs/architecture/audit-trails#typed-actors)).
- **Where each copy was.** The facility of every primary, replica and backup copy over time, against what the product promised, since courts have treated stated locations as contract terms.
- **Bucket configuration over time.** Versioning, Object Lock, lifecycle and public access changes with their authors; a lifecycle rule is a deletion path no bucket policy blocks.
- **Snapshot chains and billing.** Each snapshot's unique bytes and the rating of them, so a storage invoice can be rebuilt.
- **Retention past closure.** Locked objects outlive the customer's interest in them; Object Lock in compliance mode outlives even the provider's ability to delete, so account closure has to handle locked data explicitly ([Data Retention & Deletion](/docs/architecture/data-retention#erasure-vs-append-only-records)).

## What This Means for the System You Build

- **Say which promise each shape makes:** a per-volume failure rate for block, per-object durability for object storage, and a plain statement that neither covers deletes.
- **Price capacity, performance and requests separately,** and publish minimum durations and sizes beside the price, never in a footnote.
- **Ship versioning, Object Lock and conditional writes with object storage,** because backups, audit logs and table formats depend on them.
- **Store the facility of every copy** and check backups against primaries, because a same-building backup is one copy.
- **Give provider-initiated deletions the same notice as customer ones.**
- **Treat S3 compatibility as a tested matrix,** published, versioned and run against current SDKs.
- **Publish inode limits and backup thresholds** for shared hosting plans, since that's where "unlimited" storage actually ends.

## References

**Papers and standards**

- [Patterson, Gibson and Katz: A Case for Redundant Arrays of Inexpensive Disks (RAID)](https://www2.eecs.berkeley.edu/Pubs/TechRpts/1987/CSD-87-391.html), UCB/CSD-87-391, 1987, the five RAID levels and the case against single large disks
- [Nowicki: RFC 1094, NFS: Network File System Protocol Specification](https://www.rfc-editor.org/rfc/rfc1094.html), March 1989, transparent remote file access and the stateless server
- [RFC 5661: Network File System (NFS) Version 4 Minor Version 1 Protocol](https://www.rfc-editor.org/rfc/rfc5661.html), January 2010
- [Weil et al.: Ceph: A Scalable, High-Performance Distributed File System](https://www.usenix.org/conference/osdi-06/ceph-scalable-high-performance-distributed-file-system), OSDI 2006, CRUSH, OSDs and metadata throughput
- [Microsoft Azure: SOSP paper, Windows Azure Storage](https://azure.microsoft.com/en-us/blog/sosp-paper-windows-azure-storage-a-highly-available-cloud-storage-service-with-strong-consistency/), November 21, 2011, stamps, strong consistency and the partition index
- [Brooker, Chen and Ping: Millions of Tiny Databases](https://www.usenix.org/conference/nsdi20/presentation/brooker), NSDI 2020, Physalia as EBS's configuration master
- [Bornholt et al.: Using Lightweight Formal Methods to Validate a Key-Value Storage Node in Amazon S3](https://www.amazon.science/publications/using-lightweight-formal-methods-to-validate-a-key-value-storage-node-in-amazon-s3), SOSP 2021, ShardStore and the 16 issues kept from production

**Provider documentation**

- [AWS: Amazon EBS volume types](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volume-types.html), sizes, IOPS, throughput, durability and multi-attach by type
- [AWS: Amazon EBS snapshots](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-snapshots.html), incremental snapshots in S3, cross-zone replication and deletion billing
- [AWS: EBS Multi-Attach](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes-multi.html), 16 Nitro instances, clustered file systems and NVMe reservations
- [AWS: Amazon EBS pricing](https://aws.amazon.com/ebs/pricing/), `gp3`, `gp2`, `io2` and snapshot example rates
- [AWS: Amazon EFS performance specifications](https://docs.aws.amazon.com/efs/latest/ug/performance.html), throughput modes, burst credits and the 4 KB metering rule
- [AWS: EFS price list, US East](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEFS/current/us-east-1/index.json), EFS storage and throughput rates
- [AWS: Amazon FSx](https://aws.amazon.com/fsx/), the four managed file systems
- [AWS: Amazon S3 storage classes](https://aws.amazon.com/s3/storage-classes/), availability, SLAs, minimums and the One Zone caveat
- [AWS: Amazon S3 FAQs](https://aws.amazon.com/s3/faqs/), object sizes, integrity checks and the limits of durability
- [AWS: Amazon S3 FAQs, archived June 2019](http://web.archive.org/web/20190606093334/https://aws.amazon.com/s3/faqs/), the 10,000,000 objects and 10,000 years illustration
- [AWS: Amazon S3 multipart upload limits](https://docs.aws.amazon.com/AmazonS3/latest/userguide/qfacts.html), parts, part sizes and maximum object size
- [AWS: Retaining multiple versions of objects with S3 Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html), bucket versioning states and per-version billing
- [AWS: Managing the lifecycle of objects](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html), transitions, expirations and billing on eligibility
- [AWS: Locking objects with Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html), compliance and governance modes, legal holds, variable retention and the Cohasset assessment
- [AWS: Download and upload objects with presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html), credentials, expiry limits and bearer-token handling
- [AWS: S3 price list, US East](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/current/us-east-1/index.json), storage and request rates
- [AWS: Data transfer price list, US East](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSDataTransfer/current/us-east-1/index.json), internet egress tiers
- [AWS: Fault isolation boundaries, global services](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/global-services.html), `CreateBucket` and bucket configuration dependencies on us-east-1
- [Microsoft Learn: Plan an Azure Files deployment](https://learn.microsoft.com/en-us/azure/storage/files/storage-files-planning), protocols, tiers, redundancy, snapshots, soft delete and port 445
- [Microsoft Learn: Azure Storage redundancy](https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy), durability by option, geo-replication RPO and data integrity checks
- [Microsoft Azure: Retail Prices API, Files v2, East US](https://prices.azure.com/api/retail/prices?$filter=armRegionName%20eq%20%27eastus%27%20and%20productName%20eq%20%27Files%20v2%27), pay-as-you-go Azure Files storage rates
- [Google Cloud: Filestore service tiers](https://docs.cloud.google.com/filestore/docs/service-tiers), tiers, capacities and protocols
- [Google Cloud: Cloud Storage storage classes](https://docs.cloud.google.com/storage/docs/storage-classes), classes, minimum durations, SLAs and durability
- [Cloudflare: R2 pricing](https://developers.cloudflare.com/r2/pricing/), storage, operations, retrieval and free egress
- [Cloudflare: R2 S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/api/), the operations R2 doesn't implement
- [Backblaze: B2 pricing](https://www.backblaze.com/cloud-storage/pricing), storage, egress multiple and API classes
- [Wasabi: Pricing FAQ](https://wasabi.com/pricing/faq), price, minimum charge, minimum durations, 4 KB minimum and egress policy
- [Hetzner: Object Storage](https://www.hetzner.com/storage/object-storage/), base price, included quota and overage
- [Hetzner Docs: Object Storage overview](https://docs.hetzner.com/storage/object-storage/overview/), locations, billing rules and limits
- [DigitalOcean: Spaces pricing](https://docs.digitalocean.com/products/spaces/details/pricing/), subscription, overage and cold storage
- [OVHcloud: Object Storage](https://www.ovhcloud.com/en/public-cloud/object-storage/), classes, deployment modes and the traffic policy
- [Akamai: Object Storage pricing](https://techdocs.akamai.com/cloud-computing/docs/object-storage-pricing), billing basis and the E3 request-charge date
- [HostGator: Inode limits](https://www.hostgator.com/help/article/inode-limits), the 100k/250k limit and AUP enforcement
- [Hostinger: Parameters and limits of hosting plans](https://www.hostinger.com/support/6976044-parameters-and-limits-of-hosting-plans), inode limits by plan
- [Hostinger: What is the inode limit](https://www.hostinger.com/support/1583210-what-is-inode-limit), what counts toward inodes
- [Namecheap: How to check the number of inodes](https://namecheap.com/support/knowledgebase/article.aspx/9331/29/how-to-check-the-number-of-inodes-in-your-hosting-account), inode limits and the backup threshold
- [Bluehost: Hosting inode limits](https://www.bluehost.com/help/article/hosting-inode-limits), soft limit and AUP thresholds
- [Ceph: Ceph Object Gateway](https://docs.ceph.com/en/latest/radosgw/), RGW on librados with S3- and Swift-compatible APIs
- [Ceph on GitHub](https://github.com/ceph/ceph), the LGPL 2.1 or 3.0 licensing
- [Backblaze: S3-compatible API](https://www.backblaze.com/docs/cloud-storage-s3-compatible-api), B2's S3 API
- [Wasabi: S3 API reference](https://docs.wasabi.com/docs/wasabi-api), Wasabi's S3 compatibility claim
- [DigitalOcean: Spaces Object Storage](https://docs.digitalocean.com/products/spaces/), "an S3-compatible service"
- [Akamai: Distributed compute regions](https://techdocs.akamai.com/cloud-computing/docs/distributed-compute-regions), Block Storage and Object Storage not supported in distributed regions
- [MinIO on GitHub](https://github.com/minio/minio), archived April 25, 2026, source-only community edition and AIStor editions

**Announcements and release notes**

- [AWS: Announcing Amazon S3](https://aws.amazon.com/about-aws/whats-new/2006/03/13/announcing-amazon-s3---simple-storage-service/), March 13, 2006
- [AWS News Blog: Twenty years of Amazon S3](https://aws.amazon.com/blogs/aws/twenty-years-of-amazon-s3-and-building-whats-next/), March 13, 2026, launch capacity and price, current scale
- [AWS News Blog: Amazon EBS, Bring Us Your Data](https://aws.amazon.com/blogs/aws/amazon-elastic/), August 20, 2008, sizes, zonal replication, snapshots and prices
- [Google Developers Blog: Google Storage for Developers, a preview](https://developers.googleblog.com/google-storage-for-developers-a-preview/), May 19, 2010
- [AWS News Blog: Amazon S3 strong read-after-write consistency](https://aws.amazon.com/blogs/aws/amazon-s3-update-strong-read-after-write-consistency/), December 1, 2020
- [AWS: Announcing the S3 Express One Zone storage class](https://aws.amazon.com/about-aws/whats-new/2023/11/amazon-s3-express-one-zone-storage-class), November 28, 2023
- [AWS: Amazon S3 now supports conditional writes](https://aws.amazon.com/about-aws/whats-new/2024/08/amazon-s3-conditional-writes), August 20, 2024
- [AWS: Amazon S3 adds new functionality for conditional writes](https://aws.amazon.com/about-aws/whats-new/2024/11/amazon-s3-functionality-conditional-writes/), November 25, 2024, `If-Match`
- [AWS: Amazon S3 default data integrity protections](https://aws.amazon.com/about-aws/whats-new/2024/12/amazon-s3-default-data-integrity-protections), December 2024, CRC checksums by default in the SDKs
- [Cloudflare Status: AWS S3 SDK compatibility inconsistencies with R2](https://www.cloudflarestatus.com/incidents/t5nrjmpxc1cj), January 17 to February 3, 2025
- [MinIO: commit updating the license to AGPLv3](https://github.com/minio/minio/commit/069432566fcfac1f1053677cc925ddafd750730a), April 23, 2021
- [MinIO: RELEASE.2021-05-11T23-27-41Z](https://github.com/minio/minio/releases/tag/RELEASE.2021-05-11T23-27-41Z), the first AGPLv3 release
- [MinIO blog: MinIO is now fully licensed under GNU AGPLv3, archived](http://web.archive.org/web/20210615125424/https://blog.min.io/from-open-source-to-free-and-open-source-minio-is-now-fully-licensed-under-gnu-agplv3/)
- [Marc Olson: Continuous reinvention, a brief history of block storage at AWS](https://www.allthingsdistributed.com/2024/08/continuous-reinvention-a-brief-history-of-block-storage-at-aws.html), August 22, 2024
- [Andy Warfield: Building and operating a pretty big storage system called S3](https://www.allthingsdistributed.com/2023/07/building-and-operating-a-pretty-big-storage-system.html), July 27, 2023, drive IOPS, heat and erasure coding

**In practice**

- [AWS: Summary of the Amazon EC2 and Amazon RDS service disruption](https://aws.amazon.com/message/65648/), April 2011, the EBS re-mirroring storm
- [AWS: Summary of the Amazon S3 service disruption](https://aws.amazon.com/message/41926/), February 28, 2017
- [Blocks & Files: OVHcloud must pay damages for lost backup data](https://blocksandfiles.com/2023/03/23/ovh-cloud-must-pay-damages-for-lost-backup-data/), March 23, 2023, the fire, Bati Courtage and Bluepad
- [Le Monde Informatique: OVH condamné à verser plus de 100 000 euros](https://www.lemondeinformatique.fr/actualites/lire-incendie-sgb2-strasbourg-ovh-condamne-a-verser-plus-de-100-000-eteuro-89434.html), the Bati Courtage judgment date and award items
- [IT-Connect: the firefighters' report on the OVH fire](https://www.it-connect.fr/incendie-ovh-le-rapport-des-pompiers-met-en-avant-des-defaillances/), as summarized March 14, 2022
- [Google Cloud: Details of the Google Cloud VMware Engine incident](https://cloud.google.com/blog/products/infrastructure/details-of-google-cloud-gcve-incident), May 24, 2024, UniSuper
- [Blocks & Files: MinIO revokes Weka's license](https://blocksandfiles.com/2023/03/26/we-object-minio-says-no-more-open-license-for-you-weka/), March 26, 2023
- [Blocks & Files: MinIO removes management features from the community edition](https://blocksandfiles.com/2025/06/19/minio-removes-management-features-from-basic-community-edition-object-storage-code/), June 19, 2025
- [InfoQ: MinIO community edition in maintenance mode](https://www.infoq.com/news/2025/12/minio-s3-api-alternatives/), December 28, 2025, and the alternatives
