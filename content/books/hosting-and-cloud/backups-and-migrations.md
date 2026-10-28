+++
title = "Backups, Restores & Migrations"
nav_title = "Backups & Migrations"
description = "How hosts back up accounts and sites: schedules, retention, offsite targets, restores, panel-to-panel transfers and the DNS and MX cutover that ends a move."
category = "Hosting & Cloud Industry"
order = 2159
part = "Web Hosting"
tags = ["backups", "restores", "migrations", "cpanel", "dns", "retention"]
+++

Every hosting plan says "backups," and the word covers very different promises. One host keeps thirty daily copies in another location and lets the customer restore a single file from the dashboard; another takes a copy every few days "for server restoration purposes only," skips accounts above a file count, and restores on request. Both are honest descriptions of real products. The customer usually learns which one they bought on the day they need a restore, which is why backups are a product a host should describe in numbers: how often, how long, where, who can restore what, and how fast.

Migrations are the same machinery pointed the other way. Moving an account between servers, or a customer between hosts, is a backup taken in one place and restored in another, followed by the step that actually moves the customer: changing DNS so the world's resolvers send web and mail traffic to the new server. Free migration is how hosts win customers from each other, and a botched cutover is how they lose them in the first week.

This chapter covers how the providers do it, how host backups got here (rsync, hard-link snapshots, object storage, the cPanel backup system), how panel backups work, retention and placement, restores, the court cases that made backup location a contractual promise, migrations between servers and hosts, and the DNS and MX cutover, and extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with `backup_policies`, `backups`, `restores` and `migrations`. The generic engineering is the playbook's: [Disaster Recovery](/docs/operations/disaster-recovery) for targets, backup rules and restore drills, and [Replacing Systems](/docs/architecture/replacing-systems) for cutovers. Storage pricing for backup targets is Storage: Block, File & Object; ending a product and exporting customers' data is Migrations, Shutdowns & End of Life.

## How the Providers Do It

Backups as each host's public pages describe them, as of October 2026:

| Provider | Frequency | Retention | Customer restore | Notes |
| --- | --- | --- | --- | --- |
| **SiteGround** | Daily on all plans; on-demand from GrowBig | Up to 30 daily copies on shared, 7 on Cloud; 5 manual slots | Self-serve: everything, files, databases or email | Stored "across geodistributed locations" |
| **Hostinger** | Weekly by default; daily on Business, Unlimited and up (add-on for others) | Daily backups kept for the last 7 days | Self-serve in hPanel: files, database or full | |
| **DreamHost** | Not stated | "An average of 2 weeks of website backups and 5 days of database backups" | | "Long-term backups are not included in any hosting plan" |
| **Bluehost** | Weekly on the basic shared plans | Not stated | | CodeGuard offered as an add-on |
| **Namecheap** | "Once every 3-7 days depending on the account type" | | On request; "made for server restoration purposes only" | Shared accounts over 25 GB or 200,000 inodes are excluded |
| **IONOS** | Daily, files and databases | 14 days | Self-serve, files restored into a separate folder | |
| **GoDaddy** | Daily, in its Website Backup product | | "Entire website or just a single file" | Sold as a product, with malware scanning |
| **WP Engine** | Daily checkpoints | 30 days on the restore page; "no less than 30 days and no longer than 60 days" on the plans page | Self-serve, overwrites the environment | Offsite on Amazon S3 in the site's region |
| **Kinsta** | Daily; six-hourly ($20/site/mo) and hourly ($100/site/mo) add-ons | 14, 20 or 30 days by plan; add-on backups 24 hours | Self-serve, to live or to staging | External backups to S3 or Google Cloud Storage, weekly or monthly, not restorable from the dashboard |
| **Pressable** | Hourly and daily | | | |
| **Rocket.net** | Daily | 30 days | | |

What the table shows:

- **Frequency splits by price.** Weekly backups are the entry-level shared promise (Hostinger's default, Bluehost's basic plans, Namecheap's few-day cycle); daily is the norm for mid-tier shared and every managed WordPress host; hourly is an add-on or a premium tier.
- **Retention is short.** Seven to thirty days is the range. Nobody in the sample includes long-term retention in a plan; DreamHost says so outright. A compromise discovered after a month is outside every window here.
- **"Unlimited" plans have backup limits.** Namecheap's exclusion at 200,000 inodes is the clearest public example of a backup system sized by file count, not plan marketing. HostGator states a 100k/250k inode limit on shared accounts under its acceptable use policy.
- **Restore scope is the real differentiator.** A single file, a database, a mailbox, a whole account, or "for server restoration purposes only": each is a different system behind the same word.

## How Host Backups Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| 19 Jun 1996 | Andrew Tridgell and Paul Mackerras announce rsync, "rcp replacement" | Copying large trees over slow links by sending only differences | Both sides read every file to find them |
| Jun 1996 | ANU technical report TR-CS-96-05, "The rsync algorithm" | The rolling-checksum method, published | |
| 14 Mar 2006 | Amazon S3 launches at $0.15 per GB-month and $0.20 per GB transferred | Offsite storage without a second data center | Egress and request charges; a new failure domain to manage |
| 22 Sep 2015 | Backblaze B2 announced at $0.005 per GB-month | Cheaper object storage as a backup target | |
| cPanel versions 82 and later | The current backup system replaces "Legacy Backups", which "only allows you to retain one retention point for incremental backups" | Multiple incremental restore points, more destinations | Hosts migrated configurations; cPanel says it plans to remove the legacy interface |
| 10 Mar 2021 | Fire at OVHcloud's Strasbourg site destroys SBG2's 14,046 servers in operation | | Customers whose backups were in the same building lost both |
| Early 2023 | Lille commercial court rules against OVH in Bati Courtage and Bluepad | | Backup location becomes a contractual promise a court enforces |

The technique that made nightly backups of whole servers affordable came out of rsync itself. Its `--link-dest` option makes unchanged files "hard linked from DIR to the destination directory," so each night's snapshot looks like a complete copy but stores only what changed; rsnapshot, a "filesystem snapshot utility based on rsync," packaged the rotation of hourly, daily and weekly snapshots around it. The cost is that hard links tie every snapshot to one filesystem, and a file that changes by one byte is stored whole again. cPanel's incremental backup type is this technique, which is why it works only with rsync-style destinations rather than object storage.

## How Panel Backups Work

On a cPanel & WHM server, backups are a root-level service configured once per server in **Backup Configuration** (versions 108 and later); the panel itself, its packages and feature lists are [cPanel & WHM](/books/hosting-and-cloud/cpanel-and-whm#packages-and-feature-lists). The settings that define the product:

- **Type.** *Compressed* uses less disk and runs slower; *uncompressed* runs faster and uses more; *incremental* saves the directory tree and hard-links unchanged files between runs, the rsync snapshot technique.
- **Schedule.** Daily on chosen weekdays, weekly on one day, monthly on the 1st and/or 15th; at least one must be on. The backup job runs from cron, by default at 2:00 AM server time.
- **Retention.** A count of each schedule's copies, "any number between `1` and `9999`." With *Strictly enforce retention* on, copies beyond the count are removed whether or not the latest run succeeded; with it off, failed runs don't push good copies out.
- **Databases.** For MySQL and MariaDB: *Per Account Only* (a `mysqldump` per account), *Entire MySQL Directory* (`/var/lib/mysql/`), or both. PostgreSQL is off by default.
- **Where.** Locally in `/backup` by default, plus additional destinations: another local directory, Amazon S3, S3-compatible storage, Backblaze B2, Google Drive, SFTP, FTP, rsync, WebDAV or a custom script. A *Maximum Destination Backup Timeout* bounds the upload of each file.
- **Who.** **Backup User Selection** excludes accounts from scheduled backups; accounts are included by default.

Two scripts underlie both backups and moves. `pkgacct` packages one account into a `cpmove-USERNAME.tar.gz` archive, with options to skip the home directory (to move it with rsync instead), dump all databases or only their schemas, reuse the latest backup, split the archive, or skip compression; it needs free space of more than twice the largest account plus 1 GB. `restorepkg` restores an account from such an archive (or a dated backup file), optionally as a new user, on a different IP, with DNS zone updates; its `--restricted` mode exists, but the documentation warns not to treat it as "an effective security control," which matters when the archive came from a customer.

The customer's side is smaller. cPanel's **Backup** interface offers a full backup for download and partial backups (home directory, databases, email forwarders and filters) that the customer can restore themselves; "You cannot automatically restore a full backup file in cPanel." The **Backup Wizard** sends a full backup to the home directory or a remote FTP or SCP server.

Plesk takes the same shape with different words. Backups are full or incremental ("only data that was changed since the time of the last previously created backup"), retention counts periods of the full-backup schedule, and remote storage options include FTP, Amazon S3, S3-compatible services, Google Drive and Microsoft OneDrive; "By default, Plesk stores backups on the server," and storing scheduled backups in cloud storage "is a premium feature," with an extension adding Dropbox and SFTP.

Above a few hundred accounts per server, the host's own design takes over from the panel's: backup windows staggered across servers so they don't saturate the same storage, inode and size ceilings that keep one account from consuming the window (Namecheap's 200,000), and monitoring of every server's last successful run, not just of storage use.

## Retention and Placement

The playbook's rules hold here: back up by policy, keep copies in a separate failure domain, encrypt them, and make at least one immutable ([Backups](/docs/operations/disaster-recovery#backups)), with targets set from the impact of losing the data ([Set Targets From Impact](/docs/operations/disaster-recovery#set-targets-from-impact)). What is specific to hosts:

- **A local copy is a convenience, not a backup.** `/backup` on the same server protects against a customer's mistake, not the server's loss. The offsite destination is the backup.
- **"Offsite" has to mean another building.** S3 in the same region (WP Engine's choice) is a different failure domain from the server; a second disk in the same rack is not. The question a contract will be read against is where the copies physically are.
- **Retention is a tradeoff with erasure.** A customer who closes an account or asks for deletion is still in the backups until they age out, so the retention period is also the deletion delay, and should be stated as one ([Backups](/docs/architecture/data-retention#backups)).
- **Backups are a cost line per account.** Thirty daily copies of a 20 GB account with a few percent daily change are a few tens of gigabytes as hard-linked incrementals, or 600 GB as thirty full copies before compression. The type and retention chosen in Backup Configuration are a pricing decision.

## Restores

[Restores are what matter](/docs/operations/disaster-recovery#restores-are-what-matter): a backup that hasn't been restored is a hope. The host-specific parts are scope, destination and who can push the button.

| Restore | Panel tool | Limits stated in the docs |
| --- | --- | --- |
| **Whole account** | WHM Backup Restoration, by account or by date | Subdomains, mail configuration and MySQL restored by default |
| **Files and directories** | WHM File and Directory Restoration | Local backups only; can't restore `.cpanel` or mail directories; overwrites existing files |
| **Partial, by the customer** | cPanel Backup | Home directory, databases, forwarders and filters; not a full backup |
| **From an archive** | Transfer or Restore a cPanel Account, `restorepkg` | Archive in `/home`, `/root` or similar; free space at least twice the archive |

The managed hosts make the same choices visible in their dashboards. WP Engine's restore is self-serve and destructive: it overwrites the environment. Kinsta lets the customer "Restore to" live or to staging, which is the safer default: restore beside production, check, then promote. Kinsta's external backups to the customer's S3 or Google Cloud Storage bucket can't be restored from its dashboard at all; they are an exit copy, not an undo button. Namecheap's server backups are for restoring servers, with customer data recovered on request (and a $15 fee for suspended or terminated accounts).

My rule for a restore system: every restore takes a backup of the target first, restores to a new location by default, and records who asked, what was restored and whether it was verified. A restore that overwrites production with yesterday's copy is itself a data-loss event for everything written since.

## When Backups Are a Promise: The OVH Rulings

On 10 Mar 2021 a fire at OVHcloud's Strasbourg site destroyed the 14,046 servers in operation in the SBG2 data center and damaged rooms in SBG1; OVHcloud reported 120,000 services fully or partially affected. Two customers took the loss of their backups to the Tribunal de commerce de Lille Métropole.

- **Bati Courtage.** The customer's backup option was described as "physically isolated from the infrastructure in which the VPS server is set up," but the backups were stored in the same building as the server. The customer claimed over €6.5 million; the court, in a judgment Le Monde Informatique dates to 26 January 2023, awarded about €101,102 in five items: €38,530 of financial loss for 2021, €26,472 for loss of an intangible asset, €20,000 of reputational harm, €9,100 for restoring hosting, data and sites, and €7,000 of legal costs. It did not find gross negligence on fire safety.
- **Bluepad.** Production ran in SBG1 and backups in SBG2; OVH had told the customer both were in SBG2. On 16 Mar 2023 the court held the server location was contractual, rejected force majeure, and held OVH liable for restarting a recovered backup server whose purge scripts deleted the customer's backup. The customer claimed €330,155 and was awarded €153,837.

OVH said it would appeal both; an appeal outcome was not found as of October 2026. The rule a host takes from them doesn't depend on the appeal: whatever the product page or contract says about where backups are and how they are isolated is what a court will hold the host to, so the backup system has to record, per copy, where it physically is, and the marketing has to say no more than that record shows.

## Migrations

A migration moves a customer's sites, databases and usually mail from a source to a destination, then moves the traffic. Hosts do three kinds.

**Panel to panel, root to root.** WHM's **Transfer Tool** copies "one or more cPanel accounts, packages, and configurations from a source server to a destination server," over port 2087, with cPanel and Plesk as supported sources. What it doesn't carry is the list a migration plan needs: two-factor authentication settings, DNS zone templates, and, from Plesk, forwarded domains (which must first become hosting accounts), email users with `+` and FTP users with `_` in their names. Databases with the same name as one on the destination are renamed. **Live Transfer**, cPanel to cPanel only, goes further: it updates the A records, nameserver entries and MX records ("If the domain uses remote mail servers, the system will not update the MX records"), proxies web and mail traffic from the source to the destination, and suspends the source accounts, with the warning that "You must update your DNS before removing your old account from your previous server." For large accounts the archive route is `pkgacct --skiphomedir` plus rsync of the home directory, then `restorepkg`.

**Between panels.** Plesk Migrator moves subscriptions (one at a time is the unit) from Plesk 8.6 and later, cPanel 11.5 and later, Confixx, Helm, Plesk Expand, Parallels Pro and DirectAdmin; PHP handlers, Fail2Ban, ModSecurity and firewall settings are not migrated.

**Host to host, for one site.** The acquisition channel. SiteGround, Hostinger, Kinsta and Bluehost all advertise free migrations; Kinsta offers "unlimited free migrations from all hosting providers for sites using standard WordPress installations." They split into host-run services and plugins:

| Method | Example | What it moves | Limits stated |
| --- | --- | --- | --- |
| **Host's migration team** | Hostinger (credentials or a backup, done by its team) | Files and databases | "Email is not part of website migration"; WordPress.com and multisite not in the automated flow |
| **Host's destination-only plugin** | SiteGround Migrator (transfer token), WP Engine's site migration plugin (to WP Engine or Flywheel) | One WordPress site, URLs rewritten | SiteGround's can't move multisite networks or non-WordPress content and "can't be used to transfer a WordPress instance to another hosting provider"; WP Engine's earlier plugin was closed on 3 May 2024 |
| **General plugin** | All-in-One WP Migration (a single `.wpress` file), Duplicator (files and database in one package) | One WordPress site, any host to any host | Import size limited by the host or the free version; Duplicator's free version doesn't support multisite |
| **Panel transfer** | WHM Transfer Tool, Live Transfer | Whole accounts, including mail | Root access on both ends |

The rule behind all of them is the playbook's [Cutover and the Rollback Window](/docs/architecture/replacing-systems#cutover-and-the-rollback-window): copy, verify, cut over, keep the source until the rollback window closes. What is specific to hosting is that the cutover is DNS, which the host often doesn't control, and that mail keeps arriving at the old server until it isn't.

## DNS and MX Cutover

A resolver may cache a record for its TTL, "the time interval that the resource record may be cached before the source of the information should again be consulted" (RFC 1035), so the TTL in force before the change sets how long traffic keeps going to the old server after it. Negative answers are cached too, for the lesser of the SOA's `MINIMUM` field and the SOA record's own TTL (RFC 2308, which calls one to three hours a sensible default and values over a day "problematic"), which matters when a migration adds a hostname that resolvers recently saw as missing.

The sequence the providers document:

1. **Lower TTLs ahead.** Route 53's migration guide recommends 60 to 900 seconds and notes the typical NS TTL is 172,800 seconds, two days; Cloudflare's suggests lowering TTLs "at least 24-48 hours" ahead, with 300 seconds a common migration value, and considering the SOA `MINIMUM`. Then wait out the old TTL before changing anything.
2. **Copy and verify** on the destination, browsing it through a hosts-file entry or a temporary hostname.
3. **Change records or nameservers.** Records for a site whose DNS stays put; nameservers for a site whose zone moves. With DNSSEC on, remove the DS record first (Route 53's guidance), or validating resolvers will reject the new zone.
4. **Watch, and be ready to revert.** Route 53's guide is to monitor traffic and switch the NS records back if it drops.
5. **Raise TTLs again** once the cutover holds.

Mail is the hard part, because a message delivered to the old server after the MX change is in a mailbox nobody reads. Google's own MX setup guidance says new MX records can take "up to 72 hours" to be recognized and that "Your email might not work correctly if you keep old or incorrect MX records." So a mail migration copies mailboxes, changes MX, then copies again (or proxies, as Live Transfer does) until the old server stops receiving, and only then suspends the source. Zones, DNSSEC and the DNS host's side are DNS Hosting & DNSSEC; mailbox moves between providers are [Email Hosting](/books/hosting-and-cloud/email-hosting#migrating-mail).

## The Alternatives

| Approach | Model | Strengths | Failure modes | Ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Panel-native backups** (WHM, Plesk) | Per-account archives on a schedule, local plus remote destinations | Restores per account, file or database; transfers use the same archives | Backup windows on busy servers; the local copy mistaken for the backup | Panel vendor's feature, the host's storage | Storage and egress | Shared hosts on cPanel or Plesk |
| **Block-level snapshots** of the server or volume | Snapshots by the hypervisor or storage layer | Fast, crash-consistent, whole server | Restore is all or nothing per volume; same provider and often same region | Cloud or storage vendor | Per GB-month of changed blocks | VPS and cloud fleets |
| **Platform checkpoints** (managed WordPress) | Daily site copies in the platform's storage, restore from the dashboard | Customer self-serve; automatic before risky operations | Short retention; destructive restores | The managed host | Included, add-ons for frequency | WP Engine, Kinsta, Pressable |
| **Customer-held offsite copies** | Exports to the customer's own bucket or a plugin's storage | Survive the host's failure or the account's closure | Often not restorable by the host's tools; the customer's credentials | The customer | The customer's storage | Agencies, regulated customers |
| **Replication instead of backup** | Live copies in a second location | Low recovery time | Replicates deletions and corruption; not a backup | The host | A second footprint | Databases and HA tiers |

## My Default

My default for a shared or managed host is daily incremental account backups to object storage in a different region, thirty days of retention, one weekly copy kept for a quarter in an immutable bucket, per-account database dumps alongside the files, and a self-serve restore that takes a pre-restore backup and restores beside production by default. The local copy on the server is kept only as a speed-up for recent restores. Each backup row records the physical location of its copy, and the product page says exactly what that record supports and nothing more. Restore drills run on a sample of accounts every week, measured by time to a verified, browsable site.

For migrations my default is the archive route the host controls (Transfer Tool or `pkgacct` plus rsync), DNS TTLs lowered two days ahead, a proxy or repeat sync for mail until the old server goes quiet, and the source kept suspended, not deleted, for the rollback window. The tradeoff that would change the backup default is account size: above a few hundred gigabytes, or millions of inodes, file-level incrementals stop fitting a nightly window, and block-level snapshots with file-level restore on top become the cheaper way to meet the same promise.

## How to Build It

The chapter owns `backup_policies`, `backups`, `restores` and `migrations`. Backups are rows, not resources: they have no lifecycle of their own beyond expiry, no identifiers, and aren't billed per copy, so they stay out of `resources`. A volume snapshot a customer creates and pays for is a `resources` row of kind `'snapshot'`, which Storage: Block, File & Object owns.

```sql
CREATE TABLE backup_policies (           -- what is promised for a resource
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  resource_id        UUID NOT NULL REFERENCES resources (id),  -- hosting_account or site
  scope              TEXT NOT NULL CHECK (scope IN ('account', 'files', 'databases',
                       'mailboxes')),
  method             TEXT NOT NULL CHECK (method IN ('compressed', 'uncompressed',
                       'incremental', 'block_snapshot')),
  frequency          TEXT NOT NULL CHECK (frequency IN ('hourly', 'six_hourly', 'daily',
                       'weekly', 'monthly')),
  retain_count       INT NOT NULL CHECK (retain_count BETWEEN 1 AND 9999),
  destination        TEXT NOT NULL CHECK (destination IN ('local', 'object_storage', 'sftp',
                       'customer_bucket')),
  destination_region TEXT REFERENCES regions (id),
  immutable          BOOLEAN NOT NULL DEFAULT false,
  max_bytes          BIGINT,             -- eligibility ceilings, published
  max_inodes         BIGINT,             -- e.g. 200000
  source             TEXT NOT NULL CHECK (source IN ('plan', 'addon', 'customer')),
  sku_id             UUID REFERENCES skus (id),               -- the add-on, if paid
  valid_during       TSTZRANGE NOT NULL,
  CHECK ((source = 'addon') = (sku_id IS NOT NULL))
);

CREATE TABLE backups (                   -- one copy that exists, or failed to
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  resource_id        UUID NOT NULL REFERENCES resources (id),
  policy_id          UUID REFERENCES backup_policies (id),    -- null: on demand
  trigger            TEXT NOT NULL CHECK (trigger IN ('scheduled', 'on_demand', 'pre_restore',
                       'pre_copy', 'pre_update', 'pre_migration')),
  method             TEXT NOT NULL,
  base_backup_id     UUID REFERENCES backups (id),            -- incremental chain
  status             TEXT NOT NULL CHECK (status IN ('running', 'succeeded', 'failed',
                       'skipped_ineligible', 'expired', 'deleted')),
  skipped_reason     TEXT,               -- 'over_inode_limit', 'account_excluded'
  bytes              BIGINT,
  file_count         BIGINT,
  storage_uri        TEXT,               -- where the archive is
  storage_region     TEXT REFERENCES regions (id),
  storage_site       TEXT NOT NULL,      -- the building or facility: the contractual fact
  checksum           TEXT,
  started_at         TIMESTAMPTZ NOT NULL,
  completed_at       TIMESTAMPTZ,
  expires_at         TIMESTAMPTZ,        -- from retention; null while on legal hold
  legal_hold         BOOLEAN NOT NULL DEFAULT false,
  CHECK ((status = 'succeeded') = (completed_at IS NOT NULL AND checksum IS NOT NULL)),
  CHECK (NOT legal_hold OR expires_at IS NULL)
);

CREATE TABLE restores (
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  backup_id          UUID NOT NULL REFERENCES backups (id),
  target_resource_id UUID NOT NULL REFERENCES resources (id),
  scope              TEXT NOT NULL CHECK (scope IN ('full', 'files', 'databases', 'mailboxes',
                       'paths')),
  paths              TEXT[],
  mode               TEXT NOT NULL CHECK (mode IN ('overwrite', 'new_location', 'staging')),
  pre_restore_backup_id UUID REFERENCES backups (id),
  drill              BOOLEAN NOT NULL DEFAULT false,          -- a test, not a request
  requested_by       TEXT NOT NULL,      -- typed actor
  status             TEXT NOT NULL CHECK (status IN ('queued', 'running', 'succeeded',
                       'failed', 'verified')),
  started_at         TIMESTAMPTZ,
  completed_at       TIMESTAMPTZ,
  verified_at        TIMESTAMPTZ,        -- a person or a check confirmed it works
  CHECK ((scope = 'paths') = (paths IS NOT NULL)),
  CHECK (mode <> 'overwrite' OR pre_restore_backup_id IS NOT NULL)
);

CREATE TABLE migrations (                -- moving a customer's service between places
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  direction          TEXT NOT NULL CHECK (direction IN ('inbound', 'internal', 'outbound')),
  source_kind        TEXT NOT NULL CHECK (source_kind IN ('cpanel', 'plesk', 'directadmin',
                       'wordpress', 'other_host', 'archive_upload')),
  source_host        TEXT,
  source_resource_id UUID REFERENCES resources (id),          -- internal moves
  target_resource_id UUID REFERENCES resources (id),
  method             TEXT NOT NULL CHECK (method IN ('transfer_tool', 'live_transfer',
                       'archive_and_rsync', 'migration_plugin', 'staff_copy', 'export')),
  includes_mail      BOOLEAN NOT NULL,
  status             TEXT NOT NULL CHECK (status IN ('requested', 'copying', 'verifying',
                       'awaiting_dns', 'cut_over', 'completed', 'rolled_back', 'failed')),
  ttl_lowered_at     TIMESTAMPTZ,
  dns_cutover_at     TIMESTAMPTZ,
  mx_cutover_at      TIMESTAMPTZ,
  last_mail_sync_at  TIMESTAMPTZ,
  source_suspended_at TIMESTAMPTZ,
  rollback_until     TIMESTAMPTZ,        -- source kept until then
  not_carried        TEXT[],             -- '2fa', 'zone_template', 'plus_addressed_users'
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (NOT includes_mail OR mx_cutover_at IS NULL OR dns_cutover_at IS NOT NULL)
);
```

The check that matters most is whether every policy is being met. A policy is out of compliance when its most recent successful copy is older than its frequency allows:

```sql
SELECT p.id, p.resource_id, p.frequency, MAX(b.completed_at) AS last_success
FROM backup_policies p
LEFT JOIN backups b ON b.policy_id = p.id AND b.status = 'succeeded'
WHERE p.valid_during @> NOW()
GROUP BY p.id
HAVING MAX(b.completed_at) IS NULL
    OR MAX(b.completed_at) < NOW() - CASE p.frequency
         WHEN 'hourly'     THEN INTERVAL '2 hours'
         WHEN 'six_hourly' THEN INTERVAL '12 hours'
         WHEN 'daily'      THEN INTERVAL '36 hours'
         WHEN 'weekly'     THEN INTERVAL '8 days'
         ELSE                   INTERVAL '32 days' END;
```

Notes on the sketch:

- **`storage_site` is required.** It is the fact the OVH cases turned on. A policy that promises a different facility from the server can be checked against every copy's site, and a mismatch is an alert, not a discovery in court.
- **Skips are rows.** An account excluded for its inode count or size gets a `skipped_ineligible` row each cycle, so the customer can be told and the host can show it told them.
- **Expiry is computed, not hand-edited.** A retention job sets `expires_at` from the policy and deletes after it; a legal hold clears `expires_at` and blocks deletion, with the hold recorded in audit.
- **Pre-operation backups are the same table.** Staging pushes and updates in [Managed WordPress](/books/hosting-and-cloud/managed-wordpress#how-to-build-it), restores and migrations all write `backups` rows with their trigger, so "what did the site look like before we touched it" has one answer.
- **A migration is a state machine with clocks.** `ttl_lowered_at` before `dns_cutover_at`, mail synced after `mx_cutover_at`, source suspended only after, deleted only after `rollback_until`. Events `backup.failed`, `backup.policy_breached`, `restore.completed`, `migration.cut_over` and `migration.completed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to notifications and on-call.

## Auditing

- **Every copy and where it is.** Time, size, checksum, storage region and facility per backup, kept beyond the copy's own life, because a dispute about a lost backup asks where it was.
- **Every skip and every failure,** with the reason and the notice sent, so "you never told me my account wasn't backed up" can be answered.
- **Every restore,** who requested it, what was overwritten, the pre-restore backup and whether it was verified; drills recorded separately from requests.
- **Every deletion of a backup,** by retention, by request or by account closure, since backup expiry is also the end of a deletion request ([Erasure Requests](/docs/architecture/data-retention#erasure-requests)).
- **Every migration's cutover times** and what was not carried, so a post-migration problem (lost two-factor settings, a missing mail user) can be traced.

## What This Means for the System You Build

- **Describe backups in numbers:** frequency, retention, location, eligibility limits, restore scope and who can restore.
- **Keep the copy in another building,** record which one per copy, and promise no more than the record shows.
- **Restore beside production by default,** with a backup of the target before any overwrite.
- **Monitor policies, not storage:** alert when an account's last good copy is older than its promise.
- **Drill restores** on a sample of real accounts and measure time to a verified site.
- **Plan migrations around DNS:** TTLs lowered days ahead, DS records handled, mail synced past the MX change, the source kept until the rollback window closes.
- **List what the tool doesn't carry** (two-factor settings, zone templates, edge-case usernames) and check it after every move.

## References

**Panels**

- [cPanel: Backup Configuration](https://docs.cpanel.net/whm/backup/backup-configuration/), types, schedules, retention 1 to 9999, strict retention, database options, `/backup`, destinations, timeouts
- [cPanel: Configure cPanel cron jobs](https://docs.cpanel.net/whm/server-configuration/configure-cpanel-cron-jobs/), backup at 2:00 AM by default
- [cPanel: Backup User Selection](https://docs.cpanel.net/whm/backup/backup-user-selection/), excluding accounts
- [cPanel: Backup System Migration](https://docs.cpanel.net/whm/backup/backup-system-migration/), legacy backups' single incremental retention point, planned removal
- [cPanel: Backup Restoration](https://docs.cpanel.net/whm/backup/backup-restoration/), restore by account or date
- [cPanel: File and Directory Restoration](https://docs.cpanel.net/whm/backup/file-and-directory-restoration-for-whm/), local only, exclusions, overwrites
- [cPanel: the pkgacct script](https://docs.cpanel.net/whm/scripts/the-pkgacct-script/), archive format, options, free space
- [cPanel: the restorepkg script](https://docs.cpanel.net/whm/scripts/the-restorepkg-script/), accepted archives, options, the `--restricted` warning
- [cPanel: Backup](https://docs.cpanel.net/cpanel/files/backup-for-cpanel/), partial backups the customer restores, full backups they can't
- [cPanel: Backup Wizard](https://docs.cpanel.net/cpanel/files/backup-wizard/), full backup destinations, partial choices
- [cPanel: Transfer Tool](https://docs.cpanel.net/whm/transfers/transfer-tool/), sources, Live Transfer's DNS, MX and suspension behavior, what isn't transferred
- [cPanel: Transfer or Restore a cPanel Account](https://docs.cpanel.net/whm/transfers/transfer-or-restore-a-cpanel-account/), archive locations and space
- [Plesk: backing up and restoration](https://docs.plesk.com/en-US/obsidian/administrator-guide/backup-and-restoration/scheduling-backups.59256/), full and incremental backups
- [Plesk: scheduledbackup](https://docs.plesk.com/en-US/obsidian/cli-linux/using-command-line-utilities/scheduledbackup-managing-scheduled-backup-tasks.80003/), frequency, retention by periods, storage targets
- [Plesk: configuring remote storage](https://docs.plesk.com/en-US/obsidian/customer-guide/backing-up-and-restoring-websites/configuring-remote-storage.78922/), targets, server storage by default, cloud storage as premium
- [Plesk: Backup to Cloud Pro](https://www.plesk.com/extensions/offer-complete-backup-solution/), Dropbox and SFTP
- [Plesk Migrator](https://docs.plesk.com/en-US/obsidian/migration-guide/75496/), supported sources, per-subscription migration, what isn't migrated

**History**

- [First release of rsync](https://static.lwn.net/2001/0614/a/rsync.php3), 19 Jun 1996
- [The rsync algorithm, TR-CS-96-05](https://openresearch-repository.anu.edu.au/items/15a1c428-0ad3-49d6-bb54-9238250cbbf0/full), ANU, June 1996
- [rsync(1)](https://download.samba.org/pub/rsync/rsync.1), `--link-dest`
- [rsnapshot](https://github.com/rsnapshot/rsnapshot), rsync-based snapshots with hard links
- [Amazon Web Services launches](https://press.aboutamazon.com/2006/3/amazon-web-services-launches), S3, 14 Mar 2006, prices
- [Backblaze B2 Cloud Storage](https://www.backblaze.com/blog/b2-cloud-storage-provider/), 22 Sep 2015, price

**Providers (as of October 2026)**

- [SiteGround: web hosting](https://www.siteground.com/web-hosting.htm), daily and on-demand backups, free migrations
- [SiteGround: backup service](https://www.siteground.com/kb/backup-service), copies kept, manual slots, restore options
- [Hostinger: web hosting](https://www.hostinger.com/web-hosting), backups per plan, free migration
- [Hostinger: daily backups](https://www.hostinger.com/support/1665153-how-to-activate-daily-backups/), plans, add-on, 7 days
- [Hostinger: backups](https://docs.hostinger.com/websites/backups), weekly default, self-serve restore
- [Hostinger: migrate a website](https://docs.hostinger.com/websites/migrate-website), process, email excluded
- [DreamHost: hosting plan FAQs](https://help.dreamhost.com/hc/en-us/articles/214878798-Hosting-plan-FAQs), retention, no long-term backups
- [Bluehost: shared hosting](https://www.bluehost.com/hosting/shared), weekly backups, CodeGuard add-on, free migration tool
- [Namecheap: server backups](https://www.namecheap.com/support/knowledgebase/article.aspx/156/22/do-you-have-server-backups/), frequency, eligibility, purpose, recovery fee
- [Namecheap: inode limits](https://namecheap.com/support/knowledgebase/article.aspx/9331/29/how-to-check-the-number-of-inodes-in-your-hosting-account), limits by plan, backup exclusion over 200,000
- [HostGator: inode limits](https://www.hostgator.com/help/article/inode-limits), 100k/250k, AUP
- [IONOS: restoring files](https://www.ionos.com/help/hosting/backup-restore-files/restoring-deletedoverwritten-files-for-linux-web-hosting-packages/), daily, 14 days
- [IONOS: restoring databases](https://www.ionos.com/help/hosting/mysql-datenbank-sichern-wiederherstellen/restoring-databases-from-an-automatic-backup/), daily, 14 days
- [GoDaddy: introducing Website Backup](https://www.godaddy.com/resources/au/stories/introducing-godaddys-automatic-set-and-forget-website-backup), daily, single-file restore, malware scanning
- [WP Engine: plans](https://wpengine.com/plans/), retention wording
- [WP Engine: restore](https://wpengine.com/support/restore/), daily checkpoints, 30 days, S3 in the same region, destructive restore
- [Kinsta: backups](https://kinsta.com/docs/wordpress-hosting/backups/), retention, add-ons and prices, external backups
- [Kinsta: migrations](https://kinsta.com/docs/wordpress-hosting/migrations/), unlimited free migrations
- [Pressable: pricing](https://pressable.com/pricing/), hourly and daily backups
- [Rocket.net: pricing](https://rocket.net/pricing/), daily backups, 30 days
- [SiteGround Migrator](https://wordpress.org/plugins/siteground-migrator/), transfer token, limits
- [WP Engine Automated Migration](https://wordpress.org/plugins/wp-site-migrate/), closed 3 May 2024
- [WP Engine: site migration plugin](https://wpengine.com/support/wp-engine-site-migration/), destinations and requirements
- [All-in-One WP Migration](https://wordpress.org/plugins/all-in-one-wp-migration/), `.wpress` export, import limits
- [Duplicator](https://wordpress.org/plugins/duplicator/), packages, no multisite in the free version

**DNS**

- [RFC 1035: Domain names, implementation and specification](https://www.rfc-editor.org/rfc/rfc1035.txt), TTL and SOA `MINIMUM`
- [RFC 2308: Negative caching of DNS queries](https://www.rfc-editor.org/rfc/rfc2308.txt), negative TTL and recommended values
- [Amazon Route 53: migrating DNS service for a domain that's in use](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/migrate-dns-domain-in-use.html), TTL values, NS TTL, DS removal, monitor and revert
- [Cloudflare: DNS best practices, preparation](https://developers.cloudflare.com/learning-paths/dns-best-practices/concepts/phase-2), lowering TTLs ahead, 300 seconds, SOA minimum
- [Google Workspace: set up MX records](https://knowledge.workspace.google.com/admin/domains/set-up-mx-records-for-google-workspace), up to 72 hours, old MX records

**Backup cases**

- [OVHcloud: information on the Strasbourg site](https://corporate.ovhcloud.com/en/newsroom/news/informations-site-strasbourg/), 10 Mar 2021, servers destroyed, services affected
- [Le Monde Informatique: OVH ordered to pay over €100,000](https://www.lemondeinformatique.fr/actualites/lire-incendie-sgb2-strasbourg-ovh-condamne-a-verser-plus-de-100-000-eteuro-89434.html), Bati Courtage, the court, the date, the five items, backups in the same building
- [Blocks & Files: OVH must pay damages for lost backup data](https://blocksandfiles.com/2023/03/23/ovh-cloud-must-pay-damages-for-lost-backup-data/), the isolation promise, amounts claimed and awarded, Bluepad, appeals
