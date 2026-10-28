+++
title = "Shared Hosting Isolation"
description = "mod_php to suEXEC, mpm-itk and PHP-FPM pools, CloudLinux LVE limits and CageFS, Plesk and DirectAdmin cgroups, container-per-site hosts, and noisy neighbors."
category = "Hosting & Cloud Industry"
order = 2118
part = "The Stack, Bottom to Top"
tags = ["shared-hosting", "isolation", "php", "cgroups", "multi-tenancy"]
+++

Shared hosting puts hundreds of customers' websites on one server, one kernel and usually one web server, and sells each a slice for a few dollars a month. There is no hypervisor between them. Everything that keeps one customer from reading another's files, exhausting the server's memory or slowing every other site to a crawl is done by Unix users, file permissions, the web server's process model and, since the 2010s, kernel resource controls. Each generation of the stack fixed one of three problems: **identity** (whose user a script runs as), **resources** (how much CPU, memory, I/O and how many processes one account can use) and **visibility** (what an account can see of the server and of other accounts). Each fix cost density or performance, and the stack a host runs today is the sum of the trade-offs.

The general rules for isolating tenants and containing noisy neighbors in an application are the playbook's [Multi-Tenancy](/docs/architecture/multi-tenancy#isolation-models) doc; this chapter covers what a hosting provider does at the kernel and web-server level, where the tenant runs arbitrary code. It walks the history from `mod_php` to suEXEC, suPHP, mod_ruid2 and mpm-itk, through PHP-FPM pools, to CloudLinux's Lightweight Virtual Environment (LVE) limits, CageFS, PHP Selector, mod_lsapi and MySQL Governor; covers how the panels expose them (cPanel and WHM's packages, [EasyApache 4 and MultiPHP](/books/hosting-and-cloud/cpanel-and-whm#easyapache-4-and-multiphp); Plesk's PHP handlers and Cgroups Manager; DirectAdmin's user cgroups); the hosts that put each site in its own container instead; and how a noisy neighbor looks from the kernel. It adds limit columns to `hosting_accounts` and a `resource_limit_events` table to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). The panel itself, its reseller hierarchy, packages and APIs, is the later chapter [cPanel & WHM](/books/hosting-and-cloud/cpanel-and-whm); licensing and the panel market are [Control Panel Licensing & the Alternatives](/books/hosting-and-cloud/control-panel-licensing); plans and upsells are [How Web Hosting Makes Money](/books/hosting-and-cloud/web-hosting-business); the server underneath is [Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers); and the kernel features (namespaces, cgroups) told as container history are [From chroot to Containers](/books/hosting-and-cloud/containers).

## How the Providers Do It

| Platform or host | Isolation as published (as of October 2026) | Limits it enforces | What it shows |
| --- | --- | --- | --- |
| **cPanel & WHM (EasyApache 4)** | Six PHP handlers (CGI, DSO, FPM, FCGId, LSAPI, suPHP); PHP-FPM pool defaults of Max Children 5, Process Idle Timeout 10 seconds, Max Requests 20, per server and per domain in MultiPHP Manager | Panel package limits (disk, bandwidth, mail, databases); kernel limits come from CloudLinux | The panel sets identity and PHP; resource limits come from a kernel layer it doesn't ship |
| **CloudLinux OS** | An LVE per account, enforced through the web server, PAM and the kernel; CageFS per-user filesystem; PHP Selector; mod_lsapi PRO; MySQL Governor | SPEED, PMEM, IO, IOPS, EP, NPROC and inodes per account or package; MySQL CPU, read and write per user | Noisy neighbors turned into a per-account limit with fault counters |
| **Plesk** | PHP handlers: "FPM application" shared per PHP version, "Dedicated FPM application" per site, the latter "recommended ... for shared hosting"; mod_php and CGI "not recommended" | Cgroups Manager: CPU, RAM and disk read and write bandwidth per service plan or subscription, with thresholds that notify (Web Pro and Web Host editions) | A second panel reaching the same answers with its own cgroups extension |
| **DirectAdmin** | User Cgroups on cgroups v2 | `CPUQuota`, `MemoryHigh`, `TasksMax`, I/O bandwidth and IOPS per package, user or reseller; blank means unlimited | Systemd-slice limits without a separate kernel product |
| **Hostinger** | Published per-plan parameters for its Web hosting plans | Web Single: 1 CPU core, 1 GB RAM, 20 PHP workers, 200,000 inodes, 6,144 KB/s I/O; the third Web plan in its table: 2 cores, 3 GB, 60 workers, 600,000 inodes, 20,480 KB/s | Kernel limits as the plan's spec sheet; "Hosting parameters are subject to change without notice" |
| **Kinsta** | "Each site runs in an isolated software container" with Linux, NGINX, PHP and MySQL, on LXC and LXD | Per-container CPU and RAM (live containers up to 12 CPUs and 8 GB by default on standard plans) | Container-per-site managed hosting instead of shared-kernel accounts |

Four patterns run through the table. **Identity is solved by running PHP as the account's user,** and every current panel recommends a per-user PHP-FPM pool or an equivalent (LSAPI, suPHP); running all sites as the web server's user is called outdated or insecure in Plesk's docs and needs extra modules to be safe in cPanel's. **Resource limits are cgroups under a product name:** CloudLinux's LVE "uses cgroups in its latest incarnation," Plesk's extension is named after them, and DirectAdmin's are systemd slices. **The limits are the plan:** what a host publishes as a plan's CPU cores, RAM, PHP workers and inodes are the kernel limits on that account. **The premium end leaves the shared kernel:** managed WordPress hosts that sell isolation put each site in a container with its own processes and resources, at a higher price per site.

## How It Got Here

### Everyone as the web server (the 1990s)

The first shared hosts ran every site's scripts inside the web server. With PHP loaded as an Apache module (`mod_php`, which cPanel calls the DSO handler), every PHP script on the server runs as the Apache user. cPanel's handler documentation says DSO scripts run as `nobody` unless `mod_mpm_itk` or `mod_ruid2` is added, which also makes the owner of a misbehaving script "harder to identify." The consequence is that any site's code can read any other site's files that the web server can read, including database passwords in configuration files, and an attacker who compromises one site has every site. **What it solved:** the fastest PHP there was, one interpreter in the web server. **What it cost:** no isolation between customers at all. cPanel doesn't support DSO with PHP 8.0 and later.

### suEXEC and suPHP: a process per request as the owner

Apache's suEXEC, "introduced in Apache 1.2" (1997), lets the server run CGI and SSI programs under a different user from the web server's. It's a setuid-root wrapper that runs 20 checks before it executes anything: that the caller is the web server user, that the path has no `..`, that the target user and group aren't root and are above `uidmin` and `gidmin` (100 by default), that the directory is inside suEXEC's document root, that neither the directory nor the program is writable by anyone else, and that the program isn't setuid or setgid. A virtual host's `SuexecUserGroup` sets the user its CGI requests run as. The Apache project doesn't install it by default and warns that a misconfigured setuid wrapper "can cause any number of problems." suPHP applied the same idea to PHP: an Apache module and a setuid-root binary that "change the uid of the process executing the PHP interpreter." **What it solved:** each customer's scripts run as that customer, so file permissions separate them. **What it cost:** a new process for every request, no persistent opcode cache, and a setuid-root binary on every server. suPHP's last release, 0.7.2, was on May 20, 2013, and its site now says it "is not maintained any longer and will not receive any further updates not even security patches," pointing to PHP-FPM.

### Switching users inside Apache: mod_ruid2 and mpm-itk

Two modules kept PHP in the web server but changed the process's user per request. mod_ruid2 uses Linux POSIX capabilities to change uid and gid after receiving a request, with `RMode stat` taking them from the script's owner; its own README warns that an attacker who exploits the httpd process "can set effective capabilities and setuid to root." Its repository was archived on February 5, 2025. mpm-itk, an Apache MPM based on prefork, runs each virtual host under its `AssignUserID` at the cost of "an extra fork per request," and its author states that because it must call `setuid()`, "it runs as root ... until the request is parsed and the vhost determined," so "any code execution hole before the request is parsed will be a potential root security hole." Its current release for Apache 2.4 dates from February 14, 2016. **What it solved:** per-user identity with mod_php's speed and Apache's `.htaccess` directives. **What it cost:** a web server that holds root-equivalent power while handling requests from the internet.

### PHP-FPM pools (2010 on)

PHP 5.3.3, released July 22, 2010, "Added FastCGI Process Manager (FPM) SAPI." FPM runs persistent PHP worker processes in **pools**, and each pool has its own Unix `user` and `group`, its own socket with `listen.owner` and `listen.mode` (0660 by default), an optional `chroot`, its own `php_admin_value` settings that scripts "cannot ... override with ini_set()," and its own process manager: `pm = static` (a fixed `pm.max_children`), `dynamic` (between `pm.min_spare_servers` and `pm.max_spare_servers`, starting at `pm.start_servers`), or `ondemand` (spawn on request up to `pm.max_children`, kill after `pm.process_idle_timeout`, 10 seconds by default). `pm.max_requests` recycles a worker after N requests "to work around memory leaks in 3rd party libraries"; `request_terminate_timeout` kills a worker stuck on one request; `request_slowlog_timeout` writes a backtrace to the `slowlog`. One pool per account gives identity and persistent workers together. **What it solved:** suEXEC's isolation at close to mod_php's speed, with an opcode cache per pool. **What it cost:** memory for idle workers across hundreds of pools, which is why shared hosts run `ondemand` with small `max_children`, and the web server talks FastCGI to a socket instead of running PHP itself.

### Kernel limits and caged filesystems (the 2010s)

Identity separates files; it doesn't stop one account from using all the CPU, memory, I/O or processes. Linux 2.6.24 merged control groups on January 24, 2008 ([From Bare Metal to Cloud](/books/hosting-and-cloud/bare-metal-to-cloud)), and CloudLinux built a shared-hosting product on top: the LVE, a kernel-level container per account that limits resources without separating the filesystem, enforced for web requests through `mod_hostinglimits` in Apache, for SSH and cron through a PAM module, and in the kernel. CageFS added the missing visibility wall: a per-user virtual filesystem in which "Users cannot see or detect other users or their usernames on the server." The panels followed with their own cgroup controls (Plesk's Cgroups Manager, DirectAdmin's user cgroups on cgroups v2). **What it solved:** the noisy neighbor became a per-account limit and a support ticket instead of a server outage. **What it cost:** a commercial kernel distribution on every server, or a panel feature that only works on cgroups v2 kernels, and limits that customers hit and have to understand.

## Identity and PHP Handlers in the Panels

cPanel's EasyApache 4 installs Apache and PHP as packages with an `ea-` prefix, supports PHP 7.4 and 8.1 to 8.5, and offers six handlers. Its documentation states what each costs:

| Handler | Runs as | Notes from the cPanel docs |
| --- | --- | --- |
| **CGI** | The virtual host owner with suEXEC; otherwise `nobody` | No `php_value` directives; a custom `php.ini` instead |
| **DSO** (`mod_php`) | `nobody`, unless mod_mpm_itk or mod_ruid2 | Requires the prefork MPM; one PHP version only; not supported with PHP 8.0 and later |
| **suPHP** | The virtual host owner | No Apache directives; not compatible with mpm-itk or mod_ruid2; scripts need at least 0640 permissions; cPanel's version "behaves very differently from the pristine upstream version" |
| **FCGId** (`mod_fcgid`) | Not stated | Not compatible with mod_ruid2 or mpm-itk; for "advanced system administrators" |
| **FPM** | The pool's `user` (a PHP-FPM setting) | Served through `mod_proxy_fcgi`; process management and emergency restarts; may need directive tuning |
| **LSAPI** | Not stated | Included by default; cPanel's build disables CRIU, connection pooling and opcache preservation, and full functionality requires CloudLinux |

MultiPHP Manager sets the server's default PHP version and whether PHP-FPM is enabled by default for new accounts ("Changing it does not affect existing accounts"), and offers an Enable on All Domains action only when the server has enough memory for every pool. Its pool settings, server-wide and per domain, are Max Children (default 5, 1 to 10,000), Process Idle Timeout (10 seconds) and Max Requests (20). Those defaults are the ondemand shared-hosting profile: few workers per account, killed quickly, recycled often.

Plesk's equivalent is the PHP handler per website: "FPM application" served by Apache or nginx shares one PHP-FPM pool across all sites on the same PHP version, so "a single faulty site can affect the others," while "Dedicated FPM application" gives each site its own pool and opcode cache at higher memory use and is "the recommended PHP handler on Plesk for Linux servers used for shared hosting."

## CloudLinux LVE Limits

An LVE is created per account, and the limits are set per account, per package or per reseller. The limits and their defaults, from CloudLinux's documentation:

| Limit | What it caps | Default | When it's hit |
| --- | --- | --- | --- |
| **SPEED** | CPU, as a percentage of one core (100% is one full core) | 100% | Processes are throttled; "the site will start responding slower" |
| **PMEM** | Physical memory, counting RSS, shared memory and page cache | 1024 MB | Cache is reclaimed first, then processes in the LVE are killed; scripts fail with 500 or 503 |
| **VMEM** | Virtual memory | 0 (disabled; CloudLinux recommends leaving it off) | New allocations fail |
| **IO** | Read and write throughput combined | 1024 KB/s | Throttled |
| **IOPS** | Read and write operations per second | 1024 | Throttled |
| **EP** | Entry processes: concurrent entries into the LVE (web requests, SSH sessions, cron) | 20 | Apache returns **HTTP 508** |
| **NPROC** | All processes and threads in the LVE | 100 | 500 or 503 errors; best practice is NPROC greater than EP + 15 |
| **Inodes** | Files and directories, through `/home` quotas | (set per plan) | At the hard limit, the user can't write new files |

The older CPU (25%) and NCPU (one core) limits are deprecated in favor of SPEED. Every time an account hits a limit, the kernel counts a **fault**, and the LVE-Stats service records it with a snapshot of the account's running processes and MySQL queries; faults within 300 seconds of each other count as one incident by default. `lveinfo` reports per-account history with columns such as `aCPU` (average CPU), `lCPU` (the limit), `aEP` and `lEP` (average and limit of entry processes), `EPf` (entry process faults), `aPMem` and `PMemF`, `NprocF` and `IOf`. The administrator's tools are `lvectl` (`set` and `set-user` to set limits, `package-set` and `package-list` for package limits, `list` and `limits` to show loaded LVEs, `apply all` to reapply the configuration, `destroy`), its newer alternative `cloudlinux-limits`, `lveps` for processes per LVE, and `lvetop` to monitor usage. Package limits apply to every account in the package unless the account has its own, but "Limits from the package will not be applied if the package's owner differs from the owner of the account"; resellers can set SPEED, PMEM, IO, IOPS, EP and NPROC for their customers but not inode or MySQL limits.

The EP limit is the one customers meet. A WordPress site with a traffic spike, a slow plugin holding requests open, or a bot crawling uncached pages fills its 20 entry slots, and the 21st concurrent request gets a 508 while the rest of the server is unaffected. That's the design working: the alternative is that one account's spike consumes the server's PHP workers and every site slows down.

## CageFS, PHP Selector, mod_lsapi and MySQL Governor

**CageFS** builds a filesystem template in `/usr/share/cagefs-skeleton` (`cagefsctl --init`) and gives each user a view of it with its own `/etc`, its own `/tmp` and a restricted `/proc`, with per-user state under `/var/cagefs` (about 4 KB per user). Inside the cage, a user can't see other users, their processes or the server's configuration files. It covers scripts run through suEXEC, suPHP, mod_fcgid, LiteSpeed, cron, SSH and other PAM services; "mod_php is not supported, and MPM ITK requires a custom patch." `cagefsctl --enable <user>` cages a user, `--update` refreshes the template after packages change, and `--force-update` applies changed exclusions. Commands that must run outside the cage go through **proxyexec** with a filter list.

**PHP Selector** lets each user choose a PHP version and modules from CloudLinux's `alt-php` builds (5.1 to 8.5, depending on the CloudLinux major version) and edit PHP settings, with defaults in `/etc/cl.selector/defaults.cfg`. It requires CageFS to be enabled for the user, and works with suPHP, mod_fcgid, CGI through suEXEC and LiteSpeed.

**mod_lsapi PRO** is "an Apache HTTP Server module based on LiteSpeed Technologies API" that runs PHP like suPHP or PHP-FPM, with an option (`lsapi_terminate_backends_on_exit` Off) to keep `lsphp` running for opcode caching.

**MySQL Governor** applies the same idea to the shared database server: it monitors CPU (as a percentage of one core) and read and write bytes per MySQL user, not counting cached I/O, and in its default `abusers` mode moves a user's queries into that user's LVE once they exceed limits, marking the account restricted until it stays under them for the `unlimit` period (one minute by default). `dbtop` shows per-user database usage. Without it, one account's runaway query slows every site that shares the database server, and no per-account kernel limit sees it because the query runs as the `mysql` user.

## Noisy Neighbors at the Kernel

Every limit above maps to a Linux cgroup v2 controller, and a host that builds its own isolation instead of buying it uses these directly:

| Problem | Controller | Behavior at the limit |
| --- | --- | --- |
| One account takes the CPU | `cpu.max` ("$MAX $PERIOD") | The group runs at most `$MAX` in each `$PERIOD`; the rest waits |
| One account takes the memory | `memory.high` (throttle) and `memory.max` (hard limit) | Above `memory.high` the group is throttled under "heavy reclaim pressure"; at `memory.max` the OOM killer runs in the group, and `memory.oom.group` kills the group's tasks together or not at all |
| One account saturates the disk | `io.max` (bytes and IOPS per device, per direction) | I/O is delayed |
| A fork bomb | `pids.max` | `fork` and `clone` "return -EAGAIN" |
| A million small files | Filesystem quotas (inodes) | Writes fail at the hard limit |
| One account's queries load the database | Outside the kernel's view of the account | MySQL Governor or per-user database limits |

DirectAdmin's user cgroups expose this layer almost raw: `CPUQuota` ("Percent of CPU Core. >100% for more cores"), `MemoryHigh` ("Throttle Memory above this limit"), `TasksMax`, `IOReadBandwidthMax` and `IOWriteBandwidthMax` (minimum 256K), and `IOReadIOPSMax` and `IOWriteIOPSMax` (minimum 256), set per package, user or reseller, where a reseller's value is "the maximum any of the Reseller's Users can have." Plesk's Cgroups Manager does the same with a limit and a separate threshold that triggers notification, applied per service plan and overridable per subscription; on a Virtuozzo 7 container it can manage RAM and CPU but not disk I/O. Each of these is a resource quota on a tenant; the generic design for quotas, fairness and the noisy-neighbor problem in an application is the playbook's [Noisy Neighbors](/docs/architecture/multi-tenancy#noisy-neighbors) section.

Two things the kernel limits don't fix. **The shared kernel itself:** a kernel vulnerability reaches every account on the server, so kernel patching is part of isolation, and the strongest isolation tier leaves the shared kernel. **Abuse that stays under the limits:** a phishing kit or a spam script uses little CPU, and finding it is the abuse desk's work ([Abuse Desks for Hosts & Registrars](/books/user-generated-platforms/abuse-desks)), not the scheduler's.

## The Alternatives

| Model | Identity | Resources | Visibility | Failure modes | Licensing | Cost and density | Who uses it |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **mod_php (DSO)** | Web server user | None | Everything the web server can read | One compromised site reaches all | PHP's license | Highest density, no isolation | Legacy only; not supported with PHP 8 on cPanel |
| **suEXEC / suPHP** | Owner, per request | None | Unix permissions | Process per request; suPHP unmaintained since 2013 | Apache, GPL | Low performance | Legacy servers |
| **mod_ruid2 / mpm-itk** | Owner, switched in Apache | None | Unix permissions | Root-equivalent web server; mod_ruid2 archived | Open source | Good performance, risky | Some older stacks |
| **PHP-FPM pool per account** | Pool user | Pool size and timeouts | Unix permissions, optional chroot | Idle memory per pool; no CPU or I/O limit | PHP's license | Good | Default on cPanel, Plesk, DirectAdmin |
| **FPM plus kernel limits (LVE or cgroups) and a caged filesystem** | Pool user | CPU, memory, I/O, processes, inodes | Per-user filesystem view | Commercial kernel, or cgroups v2 required; customers hit limits | Commercial (CloudLinux) or panel features | Good, predictable | Most commercial shared hosts |
| **Container per site** | Container | Container limits | Own filesystem and processes | Higher cost per site; still a shared kernel unless VMs underneath | LXC, LXD and others | Lower density, managed | Managed WordPress hosts |
| **VPS per customer** | Own kernel | VM limits | Full | A server to administer | Hypervisor | Lowest density | Customers who outgrow shared ([Virtualization & the VPS](/books/hosting-and-cloud/virtualization-and-vps)) |

## My Default

My default for a shared hosting server today is a PHP-FPM pool per account in `ondemand` mode with a small `max_children`, kernel limits per account on CPU, memory, I/O, processes and inodes, a per-user filesystem view, and per-user database limits, with the limits set by the plan and visible to the customer in the panel. On a cPanel server that means CloudLinux with LVE, CageFS and MySQL Governor; on a server whose panel has its own cgroups v2 controls, I'd use those and add filesystem isolation separately. I'd never run DSO, mpm-itk or mod_ruid2 on a server with more than one customer: identity that depends on a root-capable web server isn't isolation. I'd publish the limits the way Hostinger does, because a customer who knows the plan has 20 entry processes reads a 508 as "upgrade" instead of "outage."

What would change it: a product whose customers pay for site-level isolation (managed WordPress, agencies), where a container per site is worth its density cost; or a customer who needs a kernel feature, root or a long-running process, for whom the answer is a VPS, not a bigger shared plan.

## How to Build It

The chapter adds isolation and limit columns to `hosting_accounts` and a `resource_limit_events` table to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Limits are set by the plan version and copied onto the account when it's provisioned or changes plan, so the enforced value is a fact about the account and a later catalog change doesn't silently move it. The server is a `server` resource with `role = 'hosting_server'` from [Dedicated Servers & Bare Metal](/books/hosting-and-cloud/dedicated-servers#how-to-build-it); the panel package and feature list mapping belong to the [cPanel & WHM](/books/hosting-and-cloud/cpanel-and-whm#packages-and-feature-lists) chapter.

```sql
ALTER TABLE hosting_accounts
  ADD COLUMN php_handler        TEXT NOT NULL DEFAULT 'fpm'
    CHECK (php_handler IN ('fpm', 'dedicated_fpm', 'lsapi', 'fcgid', 'suphp', 'cgi', 'dso')),
  ADD COLUMN php_version        TEXT,              -- '8.3'; per-domain overrides live in the panel
  ADD COLUMN fpm_max_children   SMALLINT,
  ADD COLUMN fpm_idle_timeout_s INT,
  ADD COLUMN fpm_max_requests   INT,
  ADD COLUMN limit_engine       TEXT NOT NULL DEFAULT 'none'
    CHECK (limit_engine IN ('none', 'lve', 'cgroups_v2', 'container')),
  ADD COLUMN fs_isolation       TEXT NOT NULL DEFAULT 'permissions'
    CHECK (fs_isolation IN ('permissions', 'cagefs', 'chroot', 'container')),
  ADD COLUMN cpu_limit_pct      SMALLINT,          -- 100 = one core (LVE SPEED, CPUQuota)
  ADD COLUMN memory_limit_mib   INT,               -- LVE PMEM, memory.max
  ADD COLUMN memory_high_mib    INT,               -- throttle point where the engine has one
  ADD COLUMN io_limit_kbps      INT,               -- read and write combined, or per direction
  ADD COLUMN iops_limit         INT,
  ADD COLUMN entry_procs_limit  SMALLINT,          -- LVE EP; null where the engine has none
  ADD COLUMN nproc_limit        INT,               -- LVE NPROC, pids.max, TasksMax
  ADD COLUMN inodes_soft_limit  INT,
  ADD COLUMN inodes_hard_limit  INT,
  ADD COLUMN db_cpu_limit_pct   SMALLINT,          -- per-user database limits
  ADD COLUMN db_io_limit_kbps   INT,
  ADD COLUMN limits_source      TEXT NOT NULL DEFAULT 'plan'
    CHECK (limits_source IN ('plan', 'account_override', 'reseller_cap', 'abuse')),
  ADD CONSTRAINT ha_no_dso_shared CHECK (php_handler <> 'dso' OR limit_engine = 'container'),
  ADD CONSTRAINT ha_nproc_over_ep CHECK (nproc_limit IS NULL OR entry_procs_limit IS NULL
    OR nproc_limit > entry_procs_limit + 15),
  ADD CONSTRAINT ha_inodes CHECK (inodes_soft_limit IS NULL OR inodes_hard_limit IS NULL
    OR inodes_soft_limit <= inodes_hard_limit);

CREATE TABLE resource_limit_events (     -- faults and limit hits, as the server reports them
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  source           TEXT NOT NULL,        -- 'lve_stats', 'cgroup_exporter', 'db_governor'
  idempotency_key  TEXT NOT NULL,        -- the collector's key; a replay is a no-op
  account_id       UUID NOT NULL REFERENCES accounts (id),
  resource_id      UUID NOT NULL REFERENCES resources (id),  -- kind = 'hosting_account'
  server_id        UUID NOT NULL REFERENCES resources (id),  -- kind = 'server'
  limit_kind       TEXT NOT NULL CHECK (limit_kind IN ('cpu', 'memory', 'io', 'iops',
                     'entry_procs', 'nproc', 'inodes', 'db_cpu', 'db_io')),
  limit_value      NUMERIC NOT NULL,     -- the limit in force at the time
  peak_value       NUMERIC,
  fault_count      INT NOT NULL CHECK (fault_count > 0),
  incident_during  TSTZRANGE NOT NULL,   -- faults grouped into one incident
  user_visible     TEXT CHECK (user_visible IN ('slowdown', 'http_508', 'http_500_503',
                     'write_failed', 'query_restricted')),
  snapshot_ref     TEXT,                 -- processes and queries at the time
  action_taken     TEXT NOT NULL DEFAULT 'none' CHECK (action_taken IN ('none', 'notified',
                     'upgrade_offered', 'limit_raised', 'abuse_case', 'suspended')),
  UNIQUE (source, idempotency_key)
);
```

Notes on the sketch:

- **Limits live on the account, copied from the plan.** The plan version's `included` allowances describe what was sold; the columns here are what the server enforces, set by provisioning and changed only by a plan change, a recorded override or an abuse action, with `limits_source` saying which. A reconciler compares them with what `lvectl` or the cgroup files report and raises drift.
- **Limit vocabulary is the industry's, not one product's.** `cpu_limit_pct` holds LVE SPEED, a cgroup's `cpu.max` as a percentage or DirectAdmin's `CPUQuota`; `entry_procs_limit` is null where the engine has no entry-process concept, which is honest about what a host can promise.
- **The schema refuses the known-bad configurations.** DSO is allowed only inside a per-site container; NPROC must exceed EP plus 15, CloudLinux's stated practice; soft inodes can't exceed hard.
- **Faults are incidents, not metrics.** One row per grouped incident, with the limit then in force and what the customer saw, feeds support ("your site returned 508s at 14:00 because 20 requests were in flight"), upgrade offers, and the abuse desk when an account hits limits because it's compromised.
- **Events:** `hosting_account.limits_changed`, `hosting_account.limit_drift`, `resource_limit.incident`, `resource_limit.repeated` (an account over a threshold of incidents in a window) and `hosting_account.php_changed` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to support, the customer's notifications, sales and the abuse desk.

## Auditing

- **Which limits applied when.** Every change to an account's limits with its source and actor, because a customer disputing an outage or a suspension asks what the server allowed at the time ([Audit Trails](/docs/architecture/audit-trails#amend-don-t-overwrite)).
- **Every limit incident.** What was hit, the snapshot, what the customer saw and what the provider did, so "the host throttled my site" can be answered with facts.
- **Isolation configuration per server.** Handler, limit engine and filesystem isolation per server and per account over time, because after a cross-account compromise the first question is which walls were up.
- **Abuse actions taken through limits.** Lowering a compromised account's limits is a mitigation and belongs in the abuse case, not only in the server's configuration.

## What This Means for the System You Build

- **Run every account's code as its own user,** in a per-account PHP-FPM pool or an equivalent, never as the web server.
- **Put kernel limits on CPU, memory, I/O, processes and inodes per account,** and on the database per user, because identity alone doesn't stop a noisy neighbor.
- **Hide the server from the account** with a per-user filesystem view.
- **Make the plan's limits the enforced limits,** published to the customer and reconciled against the server.
- **Record limit faults as incidents** with what the customer saw, and route repeated ones to sales or the abuse desk.
- **Refuse root-capable identity switching** (DSO with mpm-itk or mod_ruid2) on multi-tenant servers.
- **Offer a container or a VPS** to customers who need more isolation than a shared kernel gives.

## References

**Papers and standards**

- [Linux kernel documentation: Control Group v2](https://docs.kernel.org/admin-guide/cgroup-v2.html), `cpu.max`, `memory.high`, `memory.max`, `memory.oom.group`, `io.max` and `pids.max`

**Provider documentation**

- [Apache HTTP Server: suEXEC support](https://httpd.apache.org/docs/2.4/suexec.html), the setuid wrapper, its 20 checks, `uidmin` and `gidmin`, `SuexecUserGroup` and the warning against default installation
- [Apache 1.2 documentation: suEXEC (Wayback copy)](http://web.archive.org/web/19970709163348/http://www.apache.org:80/docs/suexec.html), "introduced in Apache 1.2"
- [suPHP](http://www.suphp.org/Home.html), the module and setuid binary, the 0.7.2 release of May 20, 2013 and the end of maintenance
- [GitHub: mod_ruid2](https://github.com/mind04/mod-ruid2), POSIX capabilities, `RMode`, the security warning and the February 5, 2025 archive
- [mpm-itk](https://mpm-itk.sesse.net/), `AssignUserID`, the extra fork per request, running as root until the request is parsed, and the 2016 release
- [PHP manual: FPM configuration](https://www.php.net/manual/en/install.fpm.configuration.php), pool `user` and `group`, `listen.owner` and `listen.mode`, `chroot`, `pm` modes, `pm.max_children`, `pm.process_idle_timeout`, `pm.max_requests`, timeouts and `slowlog`
- [cPanel: PHP handlers](https://docs.cpanel.net/ea4/php/php-handlers/), the six handlers, who scripts run as, and DSO's end with PHP 8.0
- [cPanel: MultiPHP Manager for WHM system settings](https://docs.cpanel.net/whm/software/multiphp-manager-for-whm-system-settings/), PHP-FPM defaults and ranges, the default for new accounts and Enable on All Domains
- [cPanel: About EasyApache 4](https://docs.cpanel.net/ea4/basics/about-easyapache-4/), `ea-` packages and supported PHP versions
- [CloudLinux: Limits](https://docs.cloudlinux.com/cloudlinuxos/limits/), SPEED, PMEM, VMEM, IO, IOPS, EP, NPROC and inode limits, defaults, error behavior, the NPROC > EP + 15 practice and cgroups
- [CloudLinux: Components](https://docs.cloudlinux.com/cloudlinuxos/cloudlinux_os_components/), CageFS, PHP Selector, mod_lsapi PRO and MySQL Governor
- [CloudLinux: LVE Manager](https://docs.cloudlinux.com/cloudlinuxos/lve_manager/), faults, snapshots, the 300-second incident window, package and reseller limits
- [CloudLinux: Command-line tools](https://docs.cloudlinux.com/cloudlinuxos/command-line_tools/), `lvectl`, `lveinfo` columns, `lveps`, `lvetop`, `cloudlinux-limits` and `cagefsctl`
- [Plesk: Choosing the PHP handler](https://docs.plesk.com/en-US/obsidian/administrator-guide/75145/), FPM, Dedicated FPM and the handlers not recommended
- [Plesk: Cgroups Manager](https://docs.plesk.com/en-US/current/administrator-guide/plesk-administration/plesk-for-linux-cgroups-manager.78308/), CPU, RAM and disk limits and thresholds per plan and subscription, editions and the Virtuozzo limitation
- [DirectAdmin: User Cgroups](https://docs.directadmin.com/operation-system-level/os-general/user_cgroups.html), cgroups v2, the limit names and per-package, user and reseller settings
- [Hostinger: Parameters and limits of hosting plans](https://www.hostinger.com/support/6976044-parameters-and-limits-of-hosting-plans), per-plan CPU, RAM, PHP workers, inodes and I/O as of October 2026
- [Kinsta: Isolated container technology](https://kinsta.com/blog/isolated-container-technology/), LXC and LXD, a container per site and default container resources

**Announcements and release notes**

- [PHP 5.3.3 release announcement](https://www.php.net/releases/5_3_3.php), "Added FastCGI Process Manager (FPM) SAPI"
- [PHP 5 ChangeLog](https://www.php.net/ChangeLog-5.php), version 5.3.3 released July 22, 2010
- [Kernel Newbies: Linux 2.6.24](https://kernelnewbies.org/Linux_2_6_24), control groups, January 24, 2008
</content>
</invoke>
