+++
title = "cPanel & WHM"
description = "cPanel and WHM in depth: root, resellers, packages, feature lists and accounts; EasyApache 4, MultiPHP, AutoSSL, the APIs and hooks; releases and owners."
category = "Hosting & Cloud Industry"
order = 2156
part = "Web Hosting"
tags = ["cpanel", "whm", "control-panels", "shared-hosting", "resellers", "api"]
+++

cPanel & WHM is the control panel most of the shared hosting industry was built on. One server runs one copy. WHM (WebHost Manager) is the server owner's and the resellers' interface: it creates accounts, sets their limits, manages DNS, mail, PHP and certificates for every site on the machine. cPanel is the customer's interface to one of those accounts: files, databases, mailboxes, subdomains, backups, one-click certificates. A host that sells shared hosting on cPanel doesn't write a hosting product so much as configure one: its plans are WHM packages, its tiers are feature lists, its reseller program is WHM's privilege lists, and its provisioning system is a client of WHM's API.

That is why the panel matters to anyone building the system around it. The panel holds the operational truth of each account (its user, its quota, its PHP version, its suspension), while the host's billing and customer systems hold the commercial truth (the plan the customer bought, the term, the renewal price). Every shared host on a licensed panel runs two databases that have to agree, and most of the hard problems in this chapter are about keeping them in step. This chapter covers the history and ownership of cPanel, its object model from root to account, packages and feature lists, account creation and suspension, EasyApache 4 and MultiPHP, AutoSSL, WHM API 1, UAPI and hooks, the release and operating system calendar, the alternatives, and the tables that map the panel onto [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model). Licence pricing is [Control Panel Licensing & the Alternatives](/books/hosting-and-cloud/control-panel-licensing); backups and the Transfer Tool are [Backups, Restores & Migrations](/books/hosting-and-cloud/backups-and-migrations); panel mail is [Email Hosting](/books/hosting-and-cloud/email-hosting); the kernel-level walls between accounts (suEXEC, PHP-FPM pools, CloudLinux LVE and CageFS) are [Shared Hosting Isolation](/books/hosting-and-cloud/shared-hosting-isolation).

## How the Providers Do It

Shared hosts either license a panel or build their own. The large ones increasingly build:

| Provider or product | Panel | Model | Notes, as of October 2026 |
| --- | --- | --- | --- |
| **cPanel & WHM** (WebPros) | Licensed per server, priced by account count | Root, resellers, packages, feature lists, accounts | Supported on AlmaLinux, CloudLinux, Rocky Linux and Ubuntu; current release 138 (July 2026) |
| **Plesk** (WebPros) | Licensed per server, editions by domain count | Subscriptions and service plans per customer | Same owner as cPanel since WebPros bought a majority of cPanel in 2018 |
| **DirectAdmin** (JBMC Software) | Licensed per server, priced by account count | Admin, reseller, user | Ended new lifetime licences in July 2019 ([Control Panel Licensing](/books/hosting-and-cloud/control-panel-licensing#directadmin)) |
| **GoDaddy** | cPanel and Plesk on its shared hosting | Licensed panels | Its 10-K says a majority of its shared hosting tiers "use industry standard cPanel or Plesk Obsidian control panels" |
| **SiteGround** | Site Tools, in-house | Per site, not per account | Replaced cPanel for new customers from July 30, 2019; had converted "more than 9000 servers" by September 2020 |
| **Hostinger** | hPanel, in-house | Per account and site | Hostinger calls it "our own custom-built hosting control panel" and says "no license fees are incorporated" |

The split is about who owns the product roadmap and who owns the cost curve. A licensed panel gives a host twenty-plus years of features on day one and an API its provisioning can drive; it also makes the vendor's price list part of the host's cost of goods, which became a strategic problem in 2019 when the licence started counting accounts. SiteGround's stated reasons for leaving were about the product (sites rather than accounts, collaborators, white-label sub-clients, adding tools "without depending on a third-party framework"), and Hostinger's are about both product and cost. Hosts that stay on cPanel are buying its ecosystem: the integrations, the migration path in and out, and the fact that a customer or reseller already knows it.

## How cPanel Got Here

| Date | Step | What it solved | What it cost |
| --- | --- | --- | --- |
| 1997 | cPanel "established in 1997 by CEO J. Nick Koston" (Oakley Capital's 2018 announcement), later based in Houston | A web interface for a hosting account, so customers stop filing tickets for mailboxes and databases | One vendor's layout becomes the industry's mental model of a hosting account |
| Aug 10, 2016 | Version 58 adds AutoSSL; an official Let's Encrypt provider plugin ships for 58.0.17 and later; version 56 was the last for CentOS 5 and 32-bit systems | Free certificates on every hosted domain without the customer doing anything | Certificate issuance becomes the panel's nightly job, with the panel's failure modes |
| Nov 17, 2016 | Version 60 enables AutoSSL by default on new servers, then using Comodo's free 90-day certificates | HTTPS as the default state of a shared-hosting site | |
| Aug 21, 2018 | Oakley announces that WebPros BV, owner of Plesk and SolusVM and backed by Oakley Capital's Fund III, has agreed (cPanel signed on Aug 20, 2018) to buy a majority stake in cPanel from Koston, subject to regulatory approval; cPanel then had "over 220 colleagues" | Capital and a parent | The two dominant commercial panels under one owner |
| Jun 27, 2019 | Account-based pricing replaces flat VPS ($20 a month) and Dedicated ($45 a month) licences with Admin $20, Pro $30 and Premier $45 for 100 accounts plus $0.20 per extra account; hosts report increases of 200% (INIZ) to "800%+" (SonicFast) | Vendor revenue that grows with density | Dense shared hosts' panel cost multiplies; several start building or switching ([Control Panel Licensing](/books/hosting-and-cloud/control-panel-licensing#how-panel-licensing-got-here)) |
| Jul 30, 2019 | SiteGround moves new customers to its own Site Tools | | A large host leaves the platform |
| Dec 12, 2019 | Oakley and co-investors agree to sell WebPros to CVC Fund VII; Oakley Capital IV invests $200 million alongside as a minority partner | | |
| Mar 2023 | Version 110 LTS, the last for CentOS 7 and CloudLinux 7, whose servers get critical security updates through January 1, 2028 under Extended Lifecycle Support | A runway off CentOS 7 after its end of life | A fleet split between a frozen version and the current train |
| Jan 2026 to Jul 2026 | Version 134 LTS (January), 136 (April), 138 (July), the current release as of October 2026 | | Two production versions a year to qualify and roll out |

## Root, Resellers, Packages and Accounts

WHM's object model is a strict tree on one server, and it is the shared-hosting catalog in software:

- **Root** owns the server: every account, every service, every setting. Root's packages are global; root sets the nameservers new accounts get and the limits every reseller lives under.
- **A reseller** is a cPanel account with WHM access, created by root ("Make the account a reseller") and given a privilege list, account and resource limits, and its own nameservers. "Make the account own itself" lets the reseller modify its own package and logs bandwidth to the reseller instead of root.
- **A package** is a named set of limits and settings plus one feature list. Packages belong to root or to a reseller.
- **A feature list** says which cPanel tools an account using the package can see.
- **A cPanel account** is one Unix user with a primary domain, its addon, parked and sub domains, its databases, mailboxes and FTP users, created under a package and owned by root or a reseller.

Resellers are where the tree touches the money. Their privileges are access control lists, set per reseller in Edit Reseller Nameservers and Privileges and grouped by how much of the server they expose:

| Group | Examples (ACL name) | What it amounts to |
| --- | --- | --- |
| **Basic** (on by default) | Account summary (`acct-summary`), list packages (`list-pkgs`), manage DNS records (`manage-dns-records`), manage API tokens (`manage-api-tokens`), call cPanel API and UAPI through WHM API (`cpanel-api`) | Read their own book, manage their own tokens and records |
| **Standard** | Create (`create-acct`), terminate (`kill-acct`), suspend (`suspend-acct`) and upgrade or downgrade (`upgrade-account`) accounts; add, park, edit and remove DNS zones; add and edit packages; file and directory restoration (`file-restore`); edit MX entries | Run a hosting business inside their limits |
| **Package** | Create accounts with shell access (`allow-shell`); use root's packages (`viewglobalpackages`); create packages with addon or parked domains, dedicated IPs, shell, unlimited features, custom email limits, unlimited disk or unlimited bandwidth | Decide how generous their own plans may be |
| **Global** | View server status (`status`) and information (`stats`), restart services (`restart`) | See and touch the shared machine |
| **Super** | Modify accounts (`edit-account`), bandwidth limits (`limit-bandwidth`) and quotas (`quota`); rearrange accounts; DNS clustering (`clustering`) | Bypass package limits, which cPanel warns about unless resource limits are also set |
| **Root Access** | All features (`all`) | "Complete access to the entire system" |

Limits sit beside the privileges: a maximum number of accounts, maximum disk and bandwidth in megabytes (unlimited isn't accepted, so both need a value), which packages a reseller may create accounts from and how many of each, and an "Allow Overselling" checkbox per resource. Without overselling, a reseller's quotas can't add up to more than its allocation, the choice [Accounts, Organizations & Resellers](/books/hosting-and-cloud/accounts-and-resellers#resellers-and-white-label) frames as deciding whether the provider absorbs noisy neighbors. Nameservers are inherited from root or set explicitly (primary through quaternary, with A and optional AAAA records on IPs that exist on the server), which is how a reseller's customers see the reseller's brand in their DNS rather than the host's.

Two rules follow for the provider. First, the privilege list is the reseller agreement made executable: a reseller sold "no shell, no dedicated IPs, 50 accounts" is a reseller without `allow-shell` and `add-pkg-ip` and with a 50-account limit, and the two must be generated from the same record or they drift. Second, anything in the Super group or above is effectively root on a shared machine, so it belongs only on a server the reseller rents whole.

## Packages and Feature Lists

A package sets two kinds of thing. The **resource options** are numbers: disk quota and monthly bandwidth in megabytes; maximum FTP accounts, email accounts, per-mailbox quota and mailing lists; maximum SQL databases (applied per database type, so 5 means five MySQL and five PostgreSQL); maximum subdomains, parked and addon domains; maximum Passenger applications; maximum team users; the maximum hourly email relayed per domain, which can be lower than the server-wide limit but not higher; and the maximum percentage of failed or deferred messages a domain may send per hour before its outbound mail is blocked, checked over the previous hour. The **settings** are switches: dedicated IP, shell access (jailshell recommended), CGI, digest authentication for Web Disk, theme, locale and the feature list. Two of them can't be changed later: a package's dedicated IP setting is fixed at creation, and so is its name, so cPanel advises against putting a price in it. Package extensions from third-party software add their own settings when installed.

**Feature lists** control the tools, not the limits. Each package names one; packages apply to accounts. Three lists are predefined:

- `default` is what users get "unless configured otherwise"; disabling a feature there disables it for everyone on the default list.
- `Mail Only` exposes only mail features, for a reseller who runs a mail-only server.
- `disabled` is a server-wide blocklist that "will also override any settings changed in other feature lists." It is never assigned to a package or account.

Deleting a list reassigns its packages and accounts to `default`, and the server owner can deny resellers the Feature Manager altogether.

The provider's catalog maps onto this directly. A plan version in the core model ("Starter: one site, 10 GB, 5 mailboxes, no SSH") becomes a package plus a feature list on each server that sells it. Three traps come with that mapping:

- **A package edit changes every account on it.** Editing a WHM package that a thousand customers bought under different plan versions changes all of them at once. The safe pattern is the core model's: a new plan version gets a new package (cPanel's no-rename rule pushes the same way), and accounts move to it when their terms allow.
- **Limits live in two places.** The plan version says 5 mailboxes; the package says 5 mailboxes. An upgrade has to change both, in the right order, or a customer pays for a limit the server doesn't grant.
- **Servers drift.** Packages and feature lists are per server. A fleet of hundreds of servers needs its packages generated from the catalog and reconciled, not hand-edited in WHM.

## Creating and Suspending an Account

Account creation is the moment the two databases meet. WHM's Create a New Account form, and the `createacct` call behind it, takes a domain (or a temporary `cpanel.site` subdomain), a username, a password, a contact email and either a package or manual resource options. Usernames must be unique, "16 characters or fewer," lowercase letters and numbers only, can't start with a number or with `test`, and need their first eight characters unique when MySQL or PostgreSQL is in use. Mail routing is detected automatically or set to local, backup or remote mail exchanger; DKIM, SPF and DMARC records can be created at the same time. Resellers over their account limit can't create accounts, and resellers without `edit-account` must choose a package.

Because the username is the panel's key and the host's provisioning picks it, the provider decides early how usernames are generated. The constraint that matters most is the eight-character database prefix: two accounts whose usernames share their first eight characters collide in MySQL database names unless prefixing is disabled in Tweak Settings.

Suspension is the panel's enforcement verb. WHM redirects the account's web traffic to an Account Suspended page through Apache virtual host include files, makes the account's password hash invalid so logins fail, and applies the server's configured action to incoming mail for the account. cPanel recommends always recording a reason, and a "Prevent resellers from unsuspending" option locks the suspension so only root can lift it. That lock is what lets a host suspend a reseller's customer for abuse without the reseller quietly reversing it, the panel-level version of the core model's rule that standing is holds, not a status edit ([Account Standing](/books/hosting-and-cloud/accounts-and-resellers#account-standing)). The narrowest action still comes first: an abuse desk that suspends an account for one compromised file has taken down every site, mailbox and database on it ([Suspension Versus Takedown](/books/user-generated-platforms/abuse-desks#suspension-versus-takedown)).

## EasyApache 4 and MultiPHP

EasyApache 4 "installs, configures, updates, and validates your web server and its components, including PHP," as packages through the system package manager. It supports Apache 2.4 only ("You cannot install an older version of Apache") and, as of its July 2026 documentation, PHP 7.4 and 8.1 through 8.5. Preconfigured profiles bundle a working set of modules; the "cPanel Default" profile includes PHP 8.1 and 8.2. For PHP versions EasyApache no longer provides, cPanel points to TuxCare's Extended Lifecycle Support or CloudLinux's PHP Selector.

**MultiPHP** is what makes several PHP versions coexist: the MultiPHP Manager sets the server default and each virtual host's version, and the MultiPHP INI Editor edits `php.ini` settings without hand-editing files. Vendor PHP builds (on non-Ubuntu systems, Software Collection packages without cPanel's `ea-` prefix) can be installed through the package manager and then managed the same way. Per-site PHP versions are the shared-hosting answer to applications that age at different speeds: a customer's old plugin pins PHP 7.4 on one site while the rest of the server moves on.

The **PHP handler** decides who a PHP request runs as, and so whether one account can read another's files:

| Handler | Runs as | Notes from cPanel's documentation |
| --- | --- | --- |
| CGI | The virtual host's owner when suEXEC is installed, otherwise `nobody` | Installed by default; Apache `php_value` directives don't work |
| DSO (Apache module) | `nobody` | Needs the prefork MPM, one PHP version only, not supported on PHP 8.0 and later; files created by scripts belong to `nobody` |
| suPHP | The virtual host's owner | Needs `php.ini` files; PHP cache extensions give no benefit |
| PHP-FPM | Not stated on the handler page | "This method is fast"; included by default through `mod_proxy_fcgi` |
| FCGId | | Recommended "only for advanced system administrators" |
| LSAPI | | Full functionality requires CloudLinux |

The history behind the table, from mod_php running every customer's code as the web server's user to per-user pools and kernel limits, is [Shared Hosting Isolation](/books/hosting-and-cloud/shared-hosting-isolation#identity-and-php-handlers-in-the-panels)'s subject. For the panel, the operational rule is that the handler and the PHP version are per-site settings the host has to inventory: a fleet-wide PHP end of life is a migration of every site still pinned to it, with customer notices, and a handler change changes file ownership on disk.

## AutoSSL

AutoSSL issues and renews a domain-validated certificate for every domain on every account without the customer asking. The ACME pipeline underneath, its rate limits and its scheduling weaknesses are in [ACME & Certificates at Hosting Scale](/books/hosting-and-cloud/acme-at-scale#autossl); the panel side is configuration and policy:

- **Provider.** As of the version 118 and later documentation, Let's Encrypt is the default provider, included with the cPanel licence; the alternative is "Disabled." Providers are compared in WHM on a star rating that counts DCV methods (two stars each where ancestor DCV is supported), unique domains per certificate and rate limits. Earlier versions defaulted to a cPanel-branded Sectigo (originally Comodo) provider, the history in the table above.
- **When it runs.** Nightly during `upcp`, from the task queue after an account is created, and on demand for all users (`/usr/local/cpanel/bin/autossl_check --all`) or one user.
- **Who gets it.** A feature-list switch, overridable per user in the Manage Users tab (enable, disable, or reset to the feature list's default). Turning AutoSSL off in a cheaper plan's feature list is possible; it leaves those customers to buy or install certificates themselves.
- **Ancestor DCV.** A successful check on `example.com` covers `store.example.com`.
- **CAA preflight.** Before ordering, AutoSSL adds a CAA record to the domain's zone as a preflight check, which matters when the domain's DNS is hosted on the same server and when it isn't (CAA itself is in [The Web PKI & Certificate Transparency](/books/hosting-and-cloud/web-pki#caa-the-domain-s-say)).
- **Replacing other certificates.** An option lets AutoSSL replace non-AutoSSL certificates that are invalid or expire within three days; cPanel warns it can replace a paid OV or EV certificate with DV.
- **Notifications and logs.** Users and administrators are notified of failures, warnings and deferrals by default; logs are in `/var/cpanel/logs/autossl` as text and JSON for 30 days.

A host running AutoSSL across a fleet should read those logs centrally rather than per server. The commonest failure is a domain whose DNS doesn't point at the server yet, which is a sales and onboarding problem as much as a certificate one; the second is a server that misses its nightly run. Both show up as certificates nearing expiry in the core model's `certificates` table long before a customer notices, if the table is fed from the panel.

## WHM API 1, UAPI and Hooks

cPanel was automatable long before infrastructure as code had a name, and its APIs are how every billing system and provisioning platform in the industry drives it. WebPros "produces four current and two deprecated APIs"; the two a host's systems use are:

- **WHM API 1** for server and reseller operations: `https://host:2087/json-api/<function>?api.version=1` (for example `listaccts`, `createacct`, `suspendacct`), authenticated with an API token in the header `Authorization: whm username:token`, where the user is root or a reseller. Ports 2086 and 2087 are WHM (2087 secure), 2082 and 2083 cPanel, 2095 and 2096 Webmail. WHM's Remote Access Key (the old access hash) is deprecated, with API tokens "strongly" recommended instead. Tokens can expire, but "when an API token expires, the system will not remove it," so revocation (`api_token_revoke`) is the integrator's job.
- **UAPI** for operations inside one cPanel account: from the shell as `uapi --user=username --output=json Module function parameter=value`, or over a session URL `https://host:2083/execute/Module/function?parameter=value`. cPanel API 2 "is deprecated," and cPanel recommends UAPI wherever a function exists. From WHM, root or a reseller reaches an account's UAPI functions through WHM API 1's `uapi_cpanel`, which cPanel recommends over the older `cpanel` call, and can combine calls with `batch`.

**Standardized Hooks** run the host's code when the panel does something: a hookable event, an action, and a registration made with `/usr/local/cpanel/bin/manage_hooks`, with each event keeping its own registry so several applications' hooks coexist. Hooks are how the panel tells the provider about changes made inside it: an account created by a reseller in WHM, a domain added by a customer in cPanel, a package changed by hand.

The integration pattern that works is two-way. The provider's systems call WHM API 1 to create, change, suspend and terminate accounts from the catalog and the billing state; hooks (or a periodic `listaccts` reconciliation) report every change made in the panel back to the provider, because resellers and customers make changes the billing system didn't order. Without the second half, the provider's `hosting_accounts` rows describe the accounts it meant to create, not the ones that exist. My rule for the API side: one service owns the WHM credentials per server, every call is idempotent on the provider's operation id (`createacct` for a username that already exists on that server is a success if the provider created it, a conflict if it didn't), and API tokens are per server, scoped, rotated and revoked like any other credential ([Identity, IAM and API Keys](/books/hosting-and-cloud/accounts-and-resellers#identity-iam-and-api-keys)).

## Releases and Operating Systems

cPanel's version numbers carry the release policy: "Even major values are production releases that appear in all release tiers"; odd ones are development releases on EDGE only. Servers follow one of five tiers set in Update Preferences: LTS, STABLE, RELEASE (the default for new installations), CURRENT and EDGE ("only received rudimentary testing"). "Only one release each year qualifies for LTS," and a release generally reaches end of life six months after the newest LTS is promoted to RELEASE. As of October 2026:

| Version | Released | End of life |
| --- | --- | --- |
| 110 (LTS) | March 2023 | December 2026 (CentOS 7 and CloudLinux 7 servers: critical security updates through January 1, 2028 under Extended Lifecycle Support) |
| 134 (LTS) | January 2026 | June 2027 |
| 136 | April 2026 | August 2026 |
| 138 | July 2026 | November 2026 |

Supported operating systems are AlmaLinux, CloudLinux, Rocky Linux and Ubuntu. For a fleet, the calendar is a standing project: every server's tier and version is inventory, a version past end of life is a risk register entry, and an operating system end of life is a migration project: cPanel recommends moving CentOS 7 and CloudLinux 7 servers to a supported operating system "as soon as possible," which for a fleet means moving accounts server by server ([Migrations](/books/hosting-and-cloud/backups-and-migrations#migrations)). Partner price lists have charged more for servers on end-of-life operating systems ([Control Panel Licensing](/books/hosting-and-cloud/control-panel-licensing#how-account-based-licensing-works)).

## Licensing

The licence is per server and tied to the server's main public IPv4 address. Since 2019 its price depends on how many accounts the server holds, which turns panel cost from a fixed cost per server into a cost per hosting account and puts a licence pass-through line in the host's cost of goods. Tiers, the 2019 shock, annual increases, partner pricing and the arithmetic of how it reaches the customer's plan price are [Control Panel Licensing & the Alternatives](/books/hosting-and-cloud/control-panel-licensing#how-panel-cost-flows-into-plan-prices); that chapter's `panel_licenses` and `license_seats` tables count each account created by the APIs above.

## The Alternatives

| Option | Model | Strengths | Failure modes | Licensing and ownership | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **cPanel & WHM** | Server panel with root, resellers, packages, feature lists | The ecosystem: reseller model, APIs, AutoSSL, EasyApache, migration in from almost anywhere, customers who already know it | Per-account cost at density; two databases to reconcile; per-server configuration drift | Proprietary, WebPros (CVC) | Hosts selling shared and reseller hosting, VPS customers running their own |
| **Plesk** | Server panel with subscriptions and service plans | Editions by domain count rather than accounts; a second mature commercial panel | Different object model to map; same owner as cPanel, so no pricing independence | Proprietary, WebPros (CVC) | Hosts that license panels, GoDaddy among them |
| **DirectAdmin** | Server panel with admin, reseller, user | Lower list prices than cPanel, and a Standard plan with unlimited accounts ([DirectAdmin](/books/hosting-and-cloud/control-panel-licensing#directadmin)) | A smaller ecosystem of integrations; migrating customers from cPanel is a project | Proprietary, JBMC Software | Hosts that want a per-server price after 2019 |
| **Open-source panels** (Virtualmin, HestiaCP, CyberPanel and others) | Server panel | No licence fee, source available | The host owns security patching and integration; fewer turnkey migrations | Various open-source licences | Self-managed VPS users, small hosts ([Open-Source Panels](/books/hosting-and-cloud/control-panel-licensing#open-source-panels)) |
| **An in-house panel** (SiteGround Site Tools, Hostinger hPanel) | The host's own product over its own provisioning | Owns the roadmap and the cost curve; per-site model; one database | Years of engineering to reach parity; migrating every existing account off the old panel | The host's own | Large hosts with scale to amortize it |

## My Default

My default for a new shared or reseller hosting business is cPanel & WHM, driven entirely through WHM API 1 from the provider's catalog, with hooks or nightly reconciliation feeding every panel-side change back, packages generated per plan version and never hand-edited, and resellers' privilege lists generated from their agreements. It gets a complete, familiar product to market in weeks and leaves the provider's engineering on billing, provisioning and support, where it differentiates.

Two things would change that. At density, the per-account licence becomes a material share of a low-priced plan's cost (the arithmetic is in [Control Panel Licensing](/books/hosting-and-cloud/control-panel-licensing#how-panel-cost-flows-into-plan-prices)), and a host with hundreds of thousands of accounts and the engineering to sustain it should price an in-house panel the way SiteGround and Hostinger did. And a host whose product is the site rather than the account (managed WordPress, or a platform with git deploys) is fighting cPanel's model, and is better served by its own panel over containers or per-site isolation ([Managed WordPress](/books/hosting-and-cloud/managed-wordpress#the-product-shape)).

## How to Build It

The core model has `hosting_accounts` (server, panel, panel user, package name) and resellers as `accounts` of kind `reseller` with `reseller_agreements` ([Accounts, Organizations & Resellers](/books/hosting-and-cloud/accounts-and-resellers#how-to-build-it)). This chapter adds the panel's own objects, generated from the catalog: packages, feature lists, reseller privilege sets, and the reconciliation between what the provider ordered and what the panel holds.

```sql
CREATE TABLE feature_lists (             -- a panel feature list, generated from the catalog
  id             UUID PRIMARY KEY DEFAULT uuidv7(),
  panel          TEXT NOT NULL CHECK (panel IN ('cpanel', 'plesk', 'directadmin', 'own')),
  name           TEXT NOT NULL,          -- the name on the server: 'hc_starter_v3'
  enabled        TEXT[] NOT NULL,        -- the panel's feature keys: 'autossl', 'ssh', ...
  owner_account_id UUID REFERENCES accounts (id),  -- null: root's; else the reseller's
  UNIQUE NULLS NOT DISTINCT (panel, owner_account_id, name)
);

CREATE TABLE panel_packages (            -- a WHM package, one per plan version per owner
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  panel            TEXT NOT NULL CHECK (panel IN ('cpanel', 'plesk', 'directadmin', 'own')),
  name             TEXT NOT NULL,        -- immutable on cPanel; no prices in it
  plan_version_id  UUID REFERENCES plan_versions (id),  -- null: a reseller's own package
  owner_account_id UUID REFERENCES accounts (id),       -- null: root's (global)
  feature_list_id  UUID NOT NULL REFERENCES feature_lists (id),
  limits           JSONB NOT NULL,       -- {"disk_mb": 10240, "email_accounts": 5,
                                         --  "sql_databases": 2, "addon_domains": 0,
                                         --  "hourly_relay_per_domain": 300, "max_defer_pct": 25}
  shell            TEXT NOT NULL CHECK (shell IN ('none', 'jailshell', 'full')),
  dedicated_ip     BOOLEAN NOT NULL,     -- fixed at creation on cPanel
  cgi              BOOLEAN NOT NULL,
  superseded_by    UUID REFERENCES panel_packages (id),  -- new plan version, new package
  UNIQUE NULLS NOT DISTINCT (panel, owner_account_id, name)
);

CREATE TABLE panel_package_deployments ( -- which servers carry which package, as applied
  panel_package_id UUID NOT NULL REFERENCES panel_packages (id),
  server_id        UUID NOT NULL REFERENCES resources (id),   -- kind 'server' or 'virtual_machine'
  applied_hash     BYTEA NOT NULL,       -- hash of limits + features last pushed
  applied_at       TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (panel_package_id, server_id)
);

ALTER TABLE hosting_accounts
  ADD COLUMN panel_package_id   UUID REFERENCES panel_packages (id),  -- replaces the bare name
  ADD COLUMN owner_account_id   UUID REFERENCES accounts (id),  -- root's operator or the reseller
  ADD COLUMN primary_domain     TEXT,              -- A-label; addon domains are resource_identifiers
  ADD COLUMN php_version        TEXT,              -- 'ea-php82', vendor 'alt-php74'
  ADD COLUMN php_handler        TEXT CHECK (php_handler IN ('cgi', 'dso', 'suphp', 'fpm',
                                  'fcgid', 'lsapi')),
  ADD COLUMN suspension_locked  BOOLEAN NOT NULL DEFAULT FALSE,  -- resellers can't unsuspend
  ADD COLUMN panel_seen_at      TIMESTAMPTZ;       -- last reconciliation that found it
  -- panel_user is validated by the provider before createacct: <= 16 chars, [a-z0-9],
  -- not starting with a digit or 'test', first 8 unique per server

CREATE TABLE reseller_panel_privileges ( -- a reseller's ACL set and limits on a server
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  reseller_account_id  UUID NOT NULL REFERENCES accounts (id),      -- kind 'reseller'
  reseller_agreement_id UUID NOT NULL REFERENCES reseller_agreements (id),
  server_id            UUID NOT NULL REFERENCES resources (id),
  acls                 TEXT[] NOT NULL,  -- 'create-acct', 'suspend-acct', ... never 'all'
                                         -- on a shared server
  max_accounts         INT,
  max_disk_mb          BIGINT NOT NULL,  -- WHM won't accept unlimited
  max_bandwidth_mb     BIGINT NOT NULL,
  oversell             TEXT[] NOT NULL DEFAULT '{}',  -- 'disk', 'bandwidth'
  nameservers          TEXT[] NOT NULL,  -- ns1 to ns4, or root's
  valid_during         TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (reseller_account_id WITH =, server_id WITH =, valid_during WITH &&),
  CHECK (NOT acls && ARRAY['all']),      -- Root Access only on a server the reseller rents whole
  CHECK (cardinality(nameservers) BETWEEN 2 AND 4)
);

CREATE TABLE panel_operations (          -- every call the provider makes to a panel
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  server_id        UUID NOT NULL REFERENCES resources (id),
  resource_id      UUID REFERENCES resources (id),   -- the hosting account, when there is one
  api              TEXT NOT NULL CHECK (api IN ('whm_api_1', 'uapi', 'uapi_cpanel', 'cli')),
  function         TEXT NOT NULL,        -- 'createacct', 'suspendacct', 'changepackage', ...
  idempotency_key  TEXT NOT NULL,        -- the provider's operation id
  request          JSONB NOT NULL,       -- secrets redacted
  status           TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed',
                     'conflict')),
  panel_result     JSONB,
  requested_by     TEXT NOT NULL,        -- typed actor: 'system:billing', staff
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at      TIMESTAMPTZ,
  UNIQUE (server_id, idempotency_key)
);

CREATE TABLE panel_drift (               -- what reconciliation or a hook found
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  server_id        UUID NOT NULL REFERENCES resources (id),
  panel_user       TEXT NOT NULL,
  resource_id      UUID REFERENCES resources (id),   -- null: an account the provider never ordered
  kind             TEXT NOT NULL CHECK (kind IN ('unknown_account', 'missing_account',
                     'package_mismatch', 'limits_mismatch', 'suspension_mismatch',
                     'owner_mismatch', 'domain_added', 'domain_removed')),
  observed         JSONB NOT NULL,
  source           TEXT NOT NULL CHECK (source IN ('hook', 'reconciliation')),
  detected_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolution       TEXT CHECK (resolution IN ('adopted', 'reverted', 'billed', 'ignored')),
  resolved_at      TIMESTAMPTZ
);
```

Reconciliation compares the panel's account list (`listaccts` per server) with the provider's records and writes the differences:

```sql
-- Accounts the provider believes are on a server but the latest listing didn't find,
-- and accounts the panel holds that the provider never ordered.
WITH listed AS (
  SELECT panel_user, package, suspended
  FROM panel_listing_snapshot              -- staging rows loaded from listaccts per run
  WHERE server_id = $server AND run_id = $run
)
SELECT 'missing_account' AS kind, ha.panel_user, ha.resource_id
FROM hosting_accounts ha
JOIN resources r ON r.id = ha.resource_id
WHERE ha.server_id = $server
  AND r.state IN ('active', 'suspended')
  AND NOT EXISTS (SELECT 1 FROM listed l WHERE l.panel_user = ha.panel_user)
UNION ALL
SELECT 'unknown_account', l.panel_user, NULL
FROM listed l
WHERE NOT EXISTS (SELECT 1 FROM hosting_accounts ha
                  WHERE ha.server_id = $server AND ha.panel_user = l.panel_user)
UNION ALL
SELECT 'suspension_mismatch', ha.panel_user, ha.resource_id
FROM hosting_accounts ha
JOIN resources r ON r.id = ha.resource_id
JOIN listed l ON l.panel_user = ha.panel_user
WHERE ha.server_id = $server
  AND (r.state = 'suspended') <> l.suspended;
```

Design notes:

- **The catalog generates the panel, never the reverse.** Packages and feature lists are rows derived from plan versions and pushed to servers; `panel_package_deployments.applied_hash` shows which servers carry an outdated copy. A package that must change for existing customers is a new package and a `changepackage` per account, recorded as panel operations.
- **Resellers' panel rights come from their agreement.** `reseller_panel_privileges` references the agreement it implements, and the check constraint keeps Root Access off shared servers.
- **Every panel call is a row.** Idempotency keys make retries safe, `requested_by` says who caused it, and the request is stored redacted, so "who suspended this account and why" is answerable from the provider's database, not the panel's logs ([Audit Trails](/docs/architecture/audit-trails#typed-actors)).
- **Drift is a queue, not a log.** An account a reseller created in WHM is `unknown_account` until it is adopted (a `resources` and `hosting_accounts` row, a `license_seats` row in [Control Panel Licensing](/books/hosting-and-cloud/control-panel-licensing#how-to-build-it)) or removed; a suspension the panel shows but billing doesn't is a support ticket before it is a churned customer.
- **Suspension is mirrored, not owned, by the panel.** An `account_holds` row or a resource state change produces the `suspendacct` call; the lock flag follows the hold's reason, so abuse and fraud holds are locked against reseller unsuspension and non-payment holds by a reseller's own customer are not.
- **Events:** `panel_package.deployed`, `hosting_account.created`, `hosting_account.package_changed`, `hosting_account.suspended`, `hosting_account.unsuspended`, `panel.drift_detected` and `panel.drift_resolved` go through the [outbox](/docs/architecture/events#the-transactional-outbox) to billing, the abuse desk and support.

## Auditing

- **What each account was entitled to, when.** The plan version, the package it mapped to, and every package change with its operation, so a dispute about a limit ("I paid for 10 mailboxes") is answered from records.
- **Every panel operation.** Who requested it, the call, the result, and retries, including calls made by resellers through their own WHM access as reported by hooks.
- **Reseller rights over time.** The privilege set and limits each reseller held on each server, against the agreement that authorized them, because a reseller with more rights than it paid for is a revenue leak and one with Super privileges is a security finding.
- **Suspensions and their locks.** Each suspension's reason, the hold behind it, whether it was locked against reseller unsuspension, and who lifted it.
- **Drift and its resolution.** Every account found that the provider didn't order and what was done about it, since unknown accounts are both unbilled usage and unscreened customers ([Abuse Desks for Hosts & Registrars](/books/user-generated-platforms/abuse-desks#how-to-build-it)).
- **Fleet versions.** Each server's cPanel version, tier and operating system over time, for the security reviews and compliance programs that ask about end-of-life software.

## What This Means for the System You Build

- **Treat the panel as a provisioning target,** driven from the catalog through WHM API 1, with your database as the commercial truth and the panel as the operational one.
- **Generate packages and feature lists from plan versions,** one package per version, never hand-edited, deployed and hash-checked per server.
- **Generate reseller privilege lists from reseller agreements,** keep Super and Root Access off shared servers, and decide overselling explicitly.
- **Validate usernames before you call `createacct`,** including the eight-character database prefix rule, and make every panel call idempotent.
- **Feed panel-side changes back** with hooks or reconciliation, and treat unknown accounts and mismatched suspensions as a work queue.
- **Mirror holds into suspensions,** with the reseller lock for abuse and fraud, and suspend the narrowest thing that stops the harm.
- **Inventory PHP versions, handlers, cPanel versions and operating systems** per site and server, because each end of life is a fleet migration with customer notices.
- **Watch AutoSSL centrally** through the `certificates` table, not server by server.
- **Use API tokens per server,** scoped, rotated and revoked, never the deprecated access hash.

## References

**cPanel documentation**

- [cPanel: Edit Reseller Nameservers and Privileges](https://docs.cpanel.net/whm/resellers/edit-reseller-nameservers-and-privileges/), the privilege groups and ACL names, reseller limits, overselling and nameservers
- [cPanel: Add a Package](https://docs.cpanel.net/whm/packages/add-a-package/), resource options and settings, the hourly relay and failed-or-deferred limits, dedicated IP and name fixed at creation
- [cPanel: Feature Manager](https://docs.cpanel.net/whm/packages/feature-manager/), the default, Mail Only and disabled lists and their precedence
- [cPanel: Create a New Account](https://docs.cpanel.net/whm/account-functions/create-a-new-account/), username rules, mail routing, DNS options, reseller settings and "one step away from root"
- [cPanel: Manage Account Suspension](https://docs.cpanel.net/whm/account-functions/manage-account-suspension/), the suspended page, invalidated password hash, reasons and the reseller lock
- [cPanel: About EasyApache 4](https://docs.cpanel.net/ea4/basics/about-easyapache-4/), what EasyApache 4 manages, Apache 2.4 only, supported PHP versions and profiles
- [cPanel: About PHP](https://docs.cpanel.net/ea4/php/about-php/), MultiPHP Manager, MultiPHP INI Editor and vendor PHP packages
- [cPanel: PHP Handlers](https://docs.cpanel.net/ea4/php/php-handlers/), CGI, DSO, suPHP, PHP-FPM, FCGId and LSAPI and who each runs as
- [cPanel: Manage AutoSSL](https://docs.cpanel.net/whm/ssl-tls/manage-autossl/), the default provider, schedule, ancestor DCV, CAA preflight, replacement option, notifications and logs
- [cPanel: Product versions and the release process](https://docs.cpanel.net/knowledge-base/cpanel-product/product-versions-and-the-release-process/), release tiers, even-numbered production versions, LTS policy, versions 110 to 138 and Extended Lifecycle Support
- [cPanel: System requirements](https://docs.cpanel.net/installation-guide/system-requirements/), supported operating systems

**cPanel API documentation**

- [cPanel API: Access hash authentication](https://api.docs.cpanel.net/guides/guide-to-api-authentication/guide-to-api-authentication-access-hash-authentication), the WHM API 1 URL form, ports and the deprecated Remote Access Key
- [cPanel API: API tokens in WHM](https://api.docs.cpanel.net/guides/guide-to-api-authentication/guide-to-api-authentication-api-tokens-in-whm), the token header and expired tokens not being removed
- [cPanel API: cPanel API 2](https://api.docs.cpanel.net/cpanel-api-2), cPanel API 2 deprecated, UAPI recommended, four current and two deprecated APIs
- [cPanel API: Use WHM API to call cPanel API and UAPI](https://api.docs.cpanel.net/whm/use-whm-api-to-call-cpanel-api-and-uapi), the `uapi_cpanel` recommendation and `batch`
- [cPanel API: UAPI introduction](https://api.docs.cpanel.net/cpanel/introduction), command-line and session URL syntax and ports
- [cPanel API: Guide to Standardized Hooks](https://api.docs.cpanel.net/guides/guide-to-standardized-hooks/), events, actions, `manage_hooks` and per-event registries

**History and ownership**

- [cPanel: Announcing cPanel & WHM's official Let's Encrypt with AutoSSL plugin](https://www.cpanel.net/blog/products/announcing-cpanel-whms-official-lets-encrypt-with-autossl-plugin/), 10 Aug 2016, version 58.0.17, the end of CentOS 5 and 32-bit support at version 56
- [cPanel: Securing your site with Comodo and cPanel AutoSSL](https://www.cpanel.net/blog/products/securing-your-site-comodo-cpanel-autossl/), 17 Nov 2016, AutoSSL in version 58 and on by default for new servers in version 60, Comodo's free 90-day certificates
- [Oakley Capital: Oakley Capital to invest in cPanel (RNS, Investegate)](https://investegate.co.uk/announcement/rns/oakley-capital-investments-ltd-di---oci/oakley-capital-to-invest-in-cpanel/5603880), 21 Aug 2018, WebPros majority stake, established 1997
- [Oakley Capital: Oakley Capital to invest in cPanel](https://oakleycapital.com/latest-news/oakley-capital-to-invest-in-cpanel/), the same announcement on Oakley's news page, Houston, over 220 colleagues, $50 million
- [Plesk: Oakley investment FAQ](https://www.plesk.com/oakley-investment-faq/), cPanel signing the agreement on August 20, 2018
- [CVC: Oakley Capital agrees sale of WebPros to CVC Fund VII](https://www.cvc.com/media/news/2019/2019-12-12-oakley-capital-agrees-sale-of-webpros-to-cvc-fund-vii/), 12 Dec 2019, Oakley Capital IV's $200 million minority investment
- [The Register: cPanel unleashes price hikes on its most dense customers](https://www.theregister.com/on-prem/2019/06/28/cpanel-unleashes-price-hikes-on-its-most-dense-customers/1200192), the old VPS and Dedicated prices, the 2019 tiers and per-account fee, the INIZ and SonicFast reactions

**Other providers**

- [GoDaddy: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1609711/000160971126000010/gddy-20251231.htm), shared hosting with cPanel and Plesk
- [SiteGround: New Client Area and Site Tools](https://www.siteground.com/blog/new-client-area-and-site-tools), 30 Jul 2019, Site Tools replacing cPanel and the reasons given
- [SiteGround: cPanel to Site Tools status report](https://www.siteground.com/blog/cpanel-to-site-tools-status-report), 16 Sep 2020, more than 9,000 servers converted
- [Hostinger: hPanel vs cPanel](https://www.hostinger.com/blog/hpanel), hPanel as an in-house panel with no licence fees
