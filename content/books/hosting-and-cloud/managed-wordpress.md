+++
title = "Managed WordPress"
description = "What managed WordPress sells: visit-metered plans, staging pushes, page and object caching, updates and cron, and WP Engine v. Automattic as a dependency risk."
category = "Hosting & Cloud Industry"
order = 2158
part = "Web Hosting"
tags = ["wordpress", "managed-hosting", "caching", "staging", "wp-engine", "visits"]
+++

Managed WordPress is shared or containerized hosting narrowed to one application, sold at a premium because the host takes on the parts of running WordPress that its customers get wrong: the PHP and web server tuning, the page cache in front of it, core and plugin updates, backups before every risky step, a staging copy for testing changes, and someone to call when a plugin takes the site down. The narrowing is the product. A general shared host has to run whatever the customer uploads; a WordPress host knows the application's request paths, its cookies, its cron, its database layout and its update channel, and builds the platform around them.

That knowledge changes how the plan is sold. Shared hosting prices by disk, sites and a fair-use clause; managed WordPress prices by **visits**, a unit the customer understands and the host can map to PHP work. It also changes what the host depends on. A WordPress platform's update path for core, themes and plugins runs through WordPress.org, a service the host doesn't run, and from September 2024 the industry watched what happens when access to it becomes a bargaining chip.

This chapter covers how the providers shape the product, how WordPress hosting got here, how visits are counted and billed, staging and the database problem it never fully solves, the caching layers, updates and cron, security, WP Engine v. Automattic as a platform-dependency risk, and extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with a `wordpress_sites` side table and a visit meter. The business of web hosting around it is [How Web Hosting Makes Money](/books/hosting-and-cloud/web-hosting-business); the panel most non-managed WordPress sites run under is [cPanel & WHM](/books/hosting-and-cloud/cpanel-and-whm); backups and moving sites between hosts are [Backups, Restores & Migrations](/books/hosting-and-cloud/backups-and-migrations).

## How the Providers Do It

The managed and WordPress-branded plans, as of October 2026, from each provider's own pricing page:

| Provider | Meter | Entry plan | Beyond the allowance | Staging | Backups | Caching named |
| --- | --- | --- | --- | --- | --- | --- |
| **WP Engine** | Visits (25,000 to 400,000 a month on Essential), storage, bandwidth | Essential from $28/mo billed annually | $2 per 1,000 extra visits on the plans its overage page lists; "Taxes and overages may apply" | "1-Click staging and dev. environments" on all plans | Daily; kept "no less than 30 days and no longer than 60 days" | EverCache page cache, Global CDN, optional object cache |
| **Kinsta** | The customer picks visits or server bandwidth per tier | Single 20GB or Launch, $35/mo ($30 annually) | Extra sites and disk as add-ons | "Free one-click staging environments" | Daily, 14 to 30 days by plan; hourly and six-hourly add-ons | Full-page and edge caching, CDN |
| **Flywheel** (WP Engine) | Visits, storage, bandwidth | Starter $25/mo, 25,000 visits | $1 per 1,000 extra visitors, $1 per GB of storage | Staging sites | Nightly, kept 30 days | FlyCache, Fastly CDN |
| **Pressable** (Automattic) | Visits and storage | Signature 1, $250/yr, 30K visits | Billed per 1,000 visits and per GB | Staging and sandbox per install | Hourly and daily | Edge, page, OPcache and query cache; built on Automattic's WP Cloud |
| **WordPress.com** (Automattic) | None on visits | Plugins from the Personal plan; Business $25/mo billed yearly | "Unlimited pages, posts, users, and visitors" | Staging site | Daily; real-time on Business and up | Global CDN on all plans |
| **Rocket.net** (hosting.com) | Storage and bandwidth; visitors "Unmetered" | Starter $30/mo | Storage $2/GB, bandwidth $0.08/GB | Not listed | Daily, 30-day retention | "Enterprise CDN"; Object Cache Pro on Enterprise |
| **Pantheon** | Site visits and pages served | Basic $55/mo, 25K visits | Overage protection on annual Performance and Elite plans | Dev, Test and Live on every plan | Automated and manual | Global CDN; object cache on Performance and up |
| **SiteGround** | None on traffic ("unlimited traffic") | StartUp $2.99/mo intro, renews $17.99 | Fair use | From GrowBig | Daily | "Multilevel caching", Speed Optimizer plugin |
| **Hostinger** | No visit figures on the WordPress page | Premium $2.49/mo on 48 months, renews $10.99 | Plan limits | "One-click staging tool" | Weekly on Premium, daily on Unlimited | LiteSpeed "smart caching" |
| **Bluehost** | About 40K visits on Starter | Starter $3.99/mo on 36 months, renews $9.99 | Upgrade | "One-click staging tool" | Weekly in the plan table | "Static and object caching" |

GoDaddy lists Managed WordPress among its hosting products in its FY2025 annual report; its plan page refused automated access, so it is not in the table. DreamHost sells DreamPress, which its shared hosting page lists with 14-day backup retention.

What the table shows:

- **Two products share one name.** The specialists (WP Engine, Kinsta, Flywheel, Pressable, Pantheon, Rocket.net) start around $25 to $55 a month and meter traffic; the general hosts (SiteGround, Hostinger, Bluehost) sell "WordPress hosting" at shared-hosting prices with intro terms and no traffic meter beyond fair use. The second is shared hosting with WordPress tooling; the first is a platform.
- **The meter is moving off visits.** Kinsta lets the customer choose bandwidth instead, Rocket.net leaves visitors unmetered and bills bandwidth, WordPress.com doesn't meter traffic at all. Visits survive where the host wants a number the customer can compare with their analytics.
- **Staging, daily backups and a page cache are table stakes.** The differences are in the details: how a push treats the database, how long backups live, and whether an object cache is included or an upsell.
- **Ownership is concentrated.** Flywheel's footer credits WPEngine, Inc.; Pressable describes itself as built on Automattic's WP Cloud; Rocket.net joined hosting.com in August 2025. A customer comparing three brands may be comparing two companies.

## How Managed WordPress Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| 27 May 2003 | "WordPress Now Available": the first release, announced by Matt Mullenweg | A free, self-hosted publishing tool | Every site became a PHP application with a database the owner had to keep patched |
| 2010 | WP Engine founded in Austin, Texas, starting with 30 customers and one product | Shared hosts ran WordPress slowly and left security to the customer | A price several times shared hosting |
| 2011 | WP-CLI begins, maintained by volunteers since | Managing WordPress without a browser: updates, exports, search-replace | Hosts script against a tool they don't control |
| 24 Oct 2013 | WordPress 3.7: "Most sites are now able to automatically apply these updates in the background" | Sites left unpatched for months | A core change applied without the owner's click |
| 11 Aug 2020 | WordPress 5.5: plugins and themes can be set "to update automatically" in the admin | Plugins were where the vulnerabilities were | Unattended plugin updates break sites |
| WordPress 5.6 | New installations get major core updates by default | Major versions lagging | Hosts need rollback and testing to offer it safely |
| 21 to 25 Sep 2024 | Mullenweg's post saying WP Engine "needs a trademark license", then WordPress.org bans WP Engine's servers from its resources | | The update channel shown to be a dependency |
| Early Oct 2024 | WP Engine sues Automattic and Mullenweg in federal court | | |
| 12 Oct 2024 | WordPress.org forks Advanced Custom Fields into Secure Custom Fields under point 18 of its plugin guidelines | | Auto-updating sites were switched automatically |
| 10 Dec 2024 | Preliminary injunction restores WP Engine's access and its ACF listing | | |
| 26 Aug 2025 | Rocket.net joins hosting.com | | Consolidation of the specialists |
| Sep 2025 | WP Engine stops billing suspected bots as visits | Crawlers inflating a human-shaped meter | The host now classifies traffic it bills |
| 24 Sep 2026 | Order (Dkt. 410) reinstating WP Engine's antitrust claims; ten-day jury trial set for 19 Oct 2027 | | |

## The Product Shape

What a managed WordPress plan includes, across the providers above:

- **A tuned stack.** PHP, the web server and the database are configured for WordPress, with a page cache in front and a CDN for static files. The customer chooses a PHP version, not a web server.
- **Environments.** At least a production and a staging copy of each site, often a development one too (WP Engine's "dev. environments", Pressable's sandbox, Pantheon's Dev, Test and Live).
- **Backups as a feature.** Daily at minimum, taken automatically before risky operations, restorable from the dashboard ([Backups, Restores & Migrations](/books/hosting-and-cloud/backups-and-migrations#how-the-providers-do-it)).
- **Managed updates.** Core updates by default; plugin updates as a feature or an add-on (Flywheel sells "Managed Plugin Updates" for $8 a month per site).
- **Isolation tiers.** WP Engine's Essential plan is "Shared" and its Business and Enterprise plans are "Isolated"; the 99.99% SLA comes with isolation. The general case of what sharing a server costs a site is the playbook's [Noisy Neighbors](/docs/architecture/multi-tenancy#noisy-neighbors) and, at the kernel, Shared Hosting Isolation.
- **Migration in.** Free migration is the acquisition channel; every specialist offers a plugin or a team for it ([Migrations](/books/hosting-and-cloud/backups-and-migrations#migrations)).

The trade the customer makes is control for operations. A managed host can refuse plugins that fight its cache, set constants in `wp-config.php` it won't let the customer change, and run cron and updates on its own schedule. Those restrictions are where the platform's reliability comes from, and they are also what a customer runs into first.

## Visit Limits

A visit is a proxy for the work a WordPress site causes: uncached PHP executions and database queries. Hosts meter it because it scales with what they spend and because customers think in traffic, but every host defines it differently, and the definition decides the bill.

| Provider | What counts as one visit | Excluded |
| --- | --- | --- |
| **WP Engine** | "One unique IP address logged per day (UTC)"; all environments on the plan are summed at the end of the billing cycle | Static files; known bot user agents; suspected bots (since September 2025); requests answered 403, including those blocked by its access rules |
| **Rocket.net** | A unique visit in a 24-hour period (visitors are unmetered on its Managed and Agency plans) | |
| **Pantheon** | Site visits count 200-level and some 300-level responses; "pages served" counts CMS-generated requests | |
| **Kinsta** | Estimated visits per tier, or server bandwidth if the customer picks the bandwidth version | |

The overage mechanics matter as much as the definition. WP Engine's overage page lists $2 per 1,000 extra monthly visitors and bills overages monthly "even" on annual plans, so an annual customer gets a monthly invoice for the previous month's excess; Flywheel charges $1 per 1,000; Pressable bills per 1,000 without a published rate on its pricing page. None of them throttle a site for exceeding visits, which is the right call: a site that goes viral should stay up and get a bill, not a 503.

Three consequences for the system behind the meter:

- **The meter has to be explainable.** WP Engine's documentation spends a section on why its counts differ from Google Analytics (pages without the tag, visitors without JavaScript or with ad blockers, non-HTML responses). A customer who disputes a visit overage asks for the daily counts by environment, and the host should be able to show them, with the bot exclusions applied.
- **Bot classification is billing logic.** Once suspected bots are excluded, the classifier's false negatives are revenue and its false positives are free traffic. It needs a version, so a month can be recomputed under the classifier that was in force.
- **Unique IP per day undercounts and overcounts.** Carrier-grade NAT folds many people into one address; IPv6 privacy addresses split one person into many. That's acceptable for a pricing unit if it is the same unit everywhere and the definition is published.

## Staging

Staging is a copy of the site the customer can break. Creating one is easy; the hard part is pushing changes back, because WordPress keeps code in files and content, settings and plugin state in the same database.

WP Engine's copy operation shows the full set of choices. A **Full** copy moves all files and all tables; a **Custom** copy can move files, all tables or selected tables, from the current state or a backup point. The source is backed up first, the destination before and after, and a checkpoint is created at the end. When the database is included, an automated search and replace changes the source domain to the destination's. A file copy is "fully destructive": files that exist only on the destination are removed. Tables present in both are overwritten, source-only tables are added, destination-only tables are left. Redirects, certificates, cache exclusions and server rules are not copied. Kinsta's push makes the same split: files only leaves the live database unchanged, and including the database loses live changes made since staging was created, which its documentation lists as "comments, new content, purchases on ecommerce sites, sign-ups on membership sites, and forum posts."

> [!WARNING]
> Pushing a staging database to production replaces every order, user, comment and form entry written to production since the copy was made. On a store or membership site that is lost revenue and lost accounts. A push that includes the database should require naming the tables, or a confirmation that states how old the staging copy is.

The URL problem is WordPress-specific. Options, widgets and plugin settings are stored as PHP serialized strings with byte lengths embedded, so a plain SQL replace of `staging.example.com` with `example.com` corrupts them. `wp search-replace` "intelligently handles PHP serialized data, and does not change primary key values," with `--dry-run` to report without saving and `--precise` to force PHP processing for every column. Every host's push runs some version of it.

What staging environments differ in, and should say: Kinsta disables full-page caching and OPcache on staging by default, its standard staging "may go to sleep after 24 hours of inactivity," and live cron jobs don't run there. That makes staging safer and less like production at the same time. The general rules on environment parity and promoting changes are the playbook's [Environments](/docs/operations/environments#parity) and [Deployment Strategies](/docs/delivery/deployment-strategies); the WordPress-specific rule is that code moves forward through environments, content moves backward, and a push of the database is a data migration, not a deploy.

## Caching

Most of a managed WordPress host's capacity planning is cache hit rate. WP Engine's documentation lays out the layers most hosts run:

| Layer | What it holds | WP Engine default | Bypassed by |
| --- | --- | --- | --- |
| **Page cache** (Varnish) | The generated HTML of a page | 10 minutes | `wp-admin`, `wp-login.php`, cart and checkout pages, any request with a `wordpress_` cookie set, configured query arguments |
| **Edge full-page cache** (optional, on Cloudflare) | HTML at the CDN | Follows `Cache-Control`, default 10 minutes | The same paths; custom cookie exclusions are not respected |
| **CDN** | Static assets | 365 days | |
| **Object cache** (optional) | Results of database queries and computed values | No expiry, a 1 MB buffer per item | |
| **Browser cache** | Assets on the visitor's device | 365 days | A hard refresh |

Cache-Control headers below 600 seconds aren't accepted; anything shorter needs a full exclusion. Purging is offered from the portal (all, page, network, object or local caches), the WordPress plugin, an API (`POST /installs/{install_id}/purge_cache`, which doesn't clear the object cache) and PHP (`wpecommon::purge_varnish_cache()`, per post or for the whole domain).

The **object cache** is the layer that differs most between hosts. WordPress's `WP_Object_Cache` is "non-persistent" by default: values live in memory for one request. A file in `wp-content` replaces it with a persistent backend (Redis, Memcached and others through plugins), which helps logged-in users, stores and admin screens that the page cache can't serve. Hosts price it as a tier feature: Pantheon includes the object cache and Object Cache Pro on Performance plans and not Basic, Rocket.net adds Object Cache Pro and Relay on Enterprise, Bluehost lists "static and object caching" on its WordPress plans, WP Engine offers it as an option.

Caching is also where managed hosting most often surprises a customer. A page cache that ignores a plugin's cookie serves one user's cart to another; a cache that is too short sends a traffic spike to PHP. The general rules (what never to cache, stampedes, invalidation) are [Application Caching](/docs/architecture/application-caching#never-cache); the host's job is to ship WordPress-aware defaults, like WP Engine's automatic WooCommerce exclusions, and make exclusions configurable without a ticket.

## Updates, Cron and WP-CLI

**Updates.** Since WordPress 3.7, minor core releases and translations update automatically by default; since 5.6, new installations also take major core updates unless a version-control checkout is detected; `WP_AUTO_UPDATE_CORE` accepts `true`, `false` or `'minor'`, and `AUTOMATIC_UPDATER_DISABLED` turns all of it off, which the documentation strongly discourages. Plugin and theme auto-updates exist since 5.5 but by default only "in special cases" signalled by WordPress.org. A managed host adds what core doesn't: a backup before each update, a check that the site still renders afterward, and a rollback when it doesn't.

**Cron.** WP-Cron "is only triggered on page load": it checks the list of scheduled tasks on each request and runs what is due. On a site behind a page cache, requests that hit the cache don't reach PHP, so a quiet or heavily cached site runs its scheduled posts, emails and cleanup late or not at all. The fix is to set `define( 'DISABLE_WP_CRON', true );` and have a system scheduler call `wp-cron.php` on an interval. Hosts do this for the customer, and it belongs on the site record, because "my scheduled post didn't publish" is a support ticket that starts there.

**WP-CLI** ("The command line for WordPress. No browser required.") is how hosts operate WordPress at scale: `wp db export` for backups, `wp search-replace` for pushes and migrations, `wp cache flush` after a deploy, `wp core update` and `wp plugin update` from the update pipeline. A host's automation is mostly WP-CLI run per site in a sandbox with the site's PHP version.

## Security and Compromised Sites

Patchstack's report on 2024 counted 7,966 new WordPress ecosystem vulnerabilities, 96% in plugins and 4% in themes, with seven in core; 33% were not fixed in time for public disclosure, and 1,614 plugins and themes were removed from the WordPress repository for unpatched security issues. For a host, that means the site's risk is its plugin list, and core updates alone don't address it.

What managed hosts do with that: keep an inventory of each site's plugins and versions, match it against vulnerability feeds, update or virtually patch (a WAF rule) the affected ones, and tell the customer which plugin is abandoned. When a site is compromised anyway, the host is also the party that receives the phishing or malware report, and the narrowest action comes first: a quarantined file or a blocked path before a suspended site ([Phishing and Malware](/books/user-generated-platforms/abuse-desks#phishing-and-malware); [Suspension Versus Takedown](/books/user-generated-platforms/abuse-desks#suspension-versus-takedown); Abuse on Infrastructure). Restoring from a backup taken before the compromise is the usual clean-up, which is one more reason backups and restore points are a managed host's core feature.

## Platform Dependency: WP Engine v. Automattic

Every WordPress host depends on services it doesn't run: WordPress.org's update servers, plugin directory and theme directory, and the WordPress trademarks. The dispute between WP Engine and Automattic is the public record of that dependency being tested. What follows is the status as of October 2026, with each side's position as stated in its own filings or press.

**What happened.** On 21 Sep 2024 Matt Mullenweg published a post on WordPress.org arguing that WP Engine "needs a trademark license to continue their business," citing its disabling of post revisions as harm to customers. On 25 Sep 2024 WordPress.org announced that WP Engine's "servers can no longer access our servers for free," listing the services WP Engine would need to run itself, including "update servers, plugin directory, theme directory." On 12 Oct 2024 the WordPress.org security team, "invoking point 18 of the plugin directory guidelines," forked WP Engine's Advanced Custom Fields plugin into Secure Custom Fields; sites on WordPress.org's update service with auto-updates enabled were switched automatically. WP Engine's complaint, filed in early October 2024, accused Mullenweg and Automattic of "abuse of power, extortion and greed" and alleged a royalty demand of 8% of its monthly revenue.

**The preliminary injunction.** On 10 Dec 2024 (reported the next day) the court (N.D. Cal. No. 4:24-cv-06917, Judge Araceli Martínez-Olguín) ordered Automattic and Mullenweg to restore, within 72 hours, the position of 20 Sep 2024: WP Engine's access to WordPress.org and its control of the ACF listing, removal of a customer-list tracker, an end to IP blocking set up around 25 Sep 2024, and removal of a login checkbox added on 8 Oct 2024 asking users to confirm they weren't affiliated with WP Engine. No bond was required. Automattic called it "a preliminary order designed to maintain the status quo." It remains in force until judgment.

**The positions.** Automattic and Mullenweg "vehemently deny all of WP Engine's allegations," moved to strike parts of the complaint under California's anti-SLAPP statute as protected speech, and argued that WP Engine "has never lost the ability to access the WordPress code and plugins" and is not entitled to free hosting and distribution of its plugins on WordPress.org. WP Engine's third amended complaint (reported February 2026) alleges the 8% rate was arbitrary and that similar demands were planned for other hosts; Automattic responded that "the lawsuit is going nowhere."

**Where it stands.** The 24 Sep 2026 order (Dkt. 410) dismissed Automattic's and Mullenweg's trademark counterclaims to the extent asserted in their own right, finding them "neither owners nor registrants of the marks at issue"; reinstated WP Engine's antitrust claims (Sherman Act monopolization and attempted monopolization, Sherman Act and Cartwright Act tying), departing from the court's earlier order; and dismissed WP Engine's Computer Fraud and Abuse Act claim without leave to amend, holding that "hard bargaining does not amount to extortion." A sanctions hearing on preserving messages was set for 7 Oct 2026, and a ten-day jury trial is set for 19 Oct 2027.

What a host takes from it, whatever the verdict:

- **The update channel is a supplier.** For a few months a large host's customers were cut off from the default source of plugin and theme updates, and a plugin's listing changed hands through the directory's own rules. A host should be able to serve core, plugin and theme updates from its own mirror, and know which of its sites would follow a directory-side change automatically.
- **Auto-update is a delegation.** Sites with auto-updates enabled took the Secure Custom Fields switch without a human deciding. A host that manages updates should pin the source of each plugin (`plugin_source` below) and review a change of source the way it reviews a change of version.
- **Trademark use is a contract question.** Whether a host needs a license to say "WordPress" in its product names was in dispute in this case; the ownership finding in the September 2026 order is one ruling, not the end of it. A host's product naming belongs with its counsel, not its marketing team.
- **Concentration cuts both ways.** Automattic runs WordPress.org's infrastructure and also sells hosting (WordPress.com, Pressable, WP Cloud). Customers and competitors alike depend on a commons operated by a competitor, which is the dependency the antitrust counts are about.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **Specialist managed WordPress** | A WordPress-only platform with environments, caching and updates | WordPress-aware caching, pushes, backups, support that knows plugins | Visit overages; restrictions on plugins and config; the database push | WP Engine, Kinsta, Flywheel, Pressable, Rocket.net | From about $25 to $55 a month | Businesses and agencies with revenue on the site |
| **WordPress on shared hosting** | A panel account with WordPress tools and a cache plugin | Cheapest; any plugin; email and many sites on one plan | Noisy neighbors; customer-run updates; cron and cache left to the customer | General hosts (SiteGround, Hostinger, Bluehost and others) | Intro prices of a few dollars, renewals several times higher | Small sites, first sites |
| **Automattic's hosted WordPress** | WordPress.com plans, or Pressable and WP Cloud | Run by the project's main steward; no visit meter on WordPress.com | Plugins only on paid plans; the host is also WordPress.org's operator | Automattic | From $4 a month billed yearly; Business $25 | Publishers, small businesses |
| **Container platform with dev, test and live** | WordPress as one app type on a general web platform | Workflow and isolation of an application platform; Git-based deploys | WordPress specifics left to the customer; higher entry price | Pantheon | From $55 a month | Agencies, universities, larger teams |
| **Self-managed VPS or cloud** | The customer runs the stack, often with a panel or a tool | Full control; no visit meter | Every update, cache and backup is the customer's | The customer | The server plus time | Developers, cost-sensitive high-traffic sites |

## My Default

My default for a site that earns money is a specialist managed host with an isolated tier once the site's revenue depends on uptime, because the caching, pushes, pre-update backups and rollback are the things small teams get wrong and the price difference is less than one bad week. For a brochure site or a first site, WordPress on a general host is the better buy, as long as the customer knows the renewal price and the host runs cron and updates for them.

If I were building the platform, my default would be: visits counted as unique IP per UTC day with published bot exclusions and a versioned classifier, overages billed and never throttled, staging pushes that copy files by default and require named tables for the database, a page cache with WordPress-aware exclusions shipped on, a persistent object cache on every tier rather than as an upsell (it's cheap and it's what makes stores fast), system cron for every site, and an update pipeline that backs up, updates, renders and rolls back, fed from a mirror the host controls. The tradeoff that would change it is the customer mix: a host whose customers are mostly agencies running many sites should meter bandwidth or compute instead of visits, as Kinsta and Rocket.net now allow, because agencies compare by cost per site, not by traffic.

## How to Build It

The chapter adds a `wordpress_sites` side table on `resources` rows of kind `'site'` and a `site.visits` meter on the core `usage_events`. PaaS & Frontend Clouds defines the general `sites` side table; `wordpress_sites` holds what only a WordPress site has and may fold into `sites` when the two are integrated. Backups taken before a push or an update are [Backups, Restores & Migrations](/books/hosting-and-cloud/backups-and-migrations#how-to-build-it)'s `backups` rows with the trigger set.

```sql
CREATE TABLE wordpress_sites (           -- side table: resources.kind = 'site'
  resource_id         UUID PRIMARY KEY REFERENCES resources (id),
  environment         TEXT NOT NULL CHECK (environment IN ('production', 'staging',
                        'development')),
  staging_parent_id   UUID REFERENCES wordpress_sites (resource_id),  -- the production site
  isolation           TEXT NOT NULL CHECK (isolation IN ('shared', 'isolated')),
  visit_meter         TEXT NOT NULL CHECK (visit_meter IN ('unique_ip_utc_day', 'bandwidth',
                        'pages_served', 'none')),     -- the plan's unit, published
  cache_layer         TEXT NOT NULL CHECK (cache_layer IN ('none', 'page', 'edge_full_page')),
  page_cache_ttl      INTERVAL,                       -- e.g. 10 minutes
  object_cache        TEXT NOT NULL CHECK (object_cache IN ('none', 'redis', 'memcached')),
  auto_update_policy  TEXT NOT NULL CHECK (auto_update_policy IN ('core_minor', 'core_all',
                        'core_and_plugins', 'managed_with_rollback', 'off')),
  plugin_source       TEXT NOT NULL CHECK (plugin_source IN ('wordpress_org', 'host_mirror',
                        'composer', 'vendor')),       -- where updates come from
  system_cron         BOOLEAN NOT NULL DEFAULT true,  -- DISABLE_WP_CRON plus a scheduler
  wp_version          TEXT,                           -- observed, from the last scan
  php_version         TEXT NOT NULL,
  CHECK ((environment = 'production') = (staging_parent_id IS NULL)),
  CHECK ((cache_layer = 'none') = (page_cache_ttl IS NULL))
);
```

Visits are ordinary usage events: one per site per UTC day, produced by the log pipeline after bot classification, keyed so a replay is a no-op, and corrected by a new event that references the old one when the classifier is rerun:

```sql
INSERT INTO usage_events (source, idempotency_key, account_id, resource_id, meter,
                          quantity, dimensions, occurred_during)
VALUES ('edge-logs', 'visits:' || $site_id || ':2026-10-26', $account_id, $site_id,
        'site.visits', 18342,
        '{"environment": "production", "excluded_bots": 4110, "excluded_403": 212,
          "classifier": "bots-2025-09"}',
        tstzrange('2026-10-26 00:00+00', '2026-10-27 00:00+00'));
```

Billable visits for a plan's cycle sum every environment of every site on the subscription, as WP Engine's definition does, and compare with the plan version's allowance:

```sql
SELECT s.id AS subscription_id,
       SUM(e.quantity) AS billable_visits,
       (pv.included ->> 'site.visits')::numeric AS included,
       GREATEST(SUM(e.quantity) - (pv.included ->> 'site.visits')::numeric, 0) AS overage
FROM subscriptions s
JOIN plan_versions pv ON pv.id = s.plan_version_id
JOIN resources r ON r.subscription_id = s.id AND r.kind = 'site'
JOIN usage_events e ON e.resource_id = r.id AND e.meter = 'site.visits'
                   AND lower(e.occurred_during) >= lower(s.current_term)
                   AND lower(e.occurred_during) <  $cycle_end
                   AND NOT EXISTS (SELECT 1 FROM usage_events c WHERE c.corrects_id = e.id)
WHERE s.id = $1
GROUP BY s.id, pv.included;
```

Notes on the sketch:

- **Overage is rated, not computed here.** The query explains the number; `rated_usage` against a `site.visits` SKU with `overage_mode = 'bill'` on the plan version produces the invoice line, monthly even on an annual term.
- **The classifier is a dimension.** Recording which bot classifier produced a day's count lets a disputed month be recomputed and the difference issued as a correction event, never an edit.
- **Staging is a site.** A staging environment is its own `resources` row with `parent_id` and `staging_parent_id` pointing at production, so it has its own backups, cache settings and visits (summed into the plan's total).
- **A push is an operation with a backup on each side.** The push job takes a `backups` row with trigger `'pre_copy'` on the destination, runs the copy and the serialized-safe search-replace, takes another backup, purges caches, and emits `site.pushed` with the tables included, through the [outbox](/docs/architecture/events#the-transactional-outbox).
- **Updates run the same way:** backup, update through WP-CLI from `plugin_source`, render check, rollback on failure, `site.updated` or `site.update_rolled_back`.

## Auditing

- **Visit counts and how they were made.** Daily counts per site and environment with the exclusions and classifier version, kept for as long as an invoice can be disputed, so an overage can be explained line by line.
- **Every push.** Who pushed which environment to which, files or tables (and which tables), the backups on each side, and what the confirmation showed, because a lost order after a database push is a support case and sometimes a refund.
- **Every update.** Which plugin went from which version to which, from which source, whether it rolled back, and on whose authority (the customer's auto-update setting or the host's policy).
- **Changes of update source.** When a plugin's source changes (a directory fork, a vendor move, a host mirror), the change and its approver, since that is a supply-chain event.

## What This Means for the System You Build

- **Publish the visit definition** and meter by it exactly: unit, day boundary, environments summed, bot and 403 exclusions, classifier versioned.
- **Bill overages, don't throttle,** and send the overage to the customer before the invoice does.
- **Make the database push explicit:** files by default, named tables for data, a backup before and after, and a statement of how old the copy is.
- **Ship WordPress-aware cache defaults** (admin, login, carts, `wordpress_` cookies) and let customers add exclusions themselves.
- **Run system cron for every site;** WP-Cron behind a page cache doesn't run.
- **Own the update path:** a mirror for core, plugins and themes, a recorded source per plugin, and backup, update, render, rollback.
- **Treat the plugin list as the security surface,** matched against vulnerability feeds, with the abuse desk as the backstop.
- **Plan for the commons changing terms.** Update servers, directories and trademarks are suppliers; know what you would do if one were withdrawn.

## References

**WordPress**

- [WordPress Now Available](https://wordpress.org/news/2003/05/wordpress-now-available/), 27 May 2003, the first release
- [WordPress 3.7 "Basie"](https://wordpress.org/news/2013/10/basie/), 24 Oct 2013, automatic background updates
- [WordPress 5.5 "Eckstine"](https://wordpress.org/news/2020/08/eckstine/), 11 Aug 2020, plugin and theme auto-updates in the admin
- [Upgrading WordPress](https://developer.wordpress.org/advanced-administration/upgrade/upgrading/), background update defaults, major updates for new installs from 5.6, `WP_AUTO_UPDATE_CORE`, `AUTOMATIC_UPDATER_DISABLED`
- [Cron](https://developer.wordpress.org/plugins/cron/), WP-Cron runs on page load
- [Hooking WP-Cron into the system task scheduler](https://developer.wordpress.org/plugins/cron/hooking-wp-cron-into-the-system-task-scheduler/), `DISABLE_WP_CRON` and the scheduler call
- [WP_Object_Cache](https://developer.wordpress.org/reference/classes/wp_object_cache/), non-persistent by default, replaceable from `wp-content`
- [WP-CLI](https://wordpress.org/cli/), the tool, its commands, maintained since 2011
- [wp search-replace](https://developer.wordpress.org/cli/commands/search-replace/), serialized data, `--dry-run`, `--precise`

**Providers (pricing and documentation, as of October 2026)**

- [WP Engine: plans](https://wpengine.com/plans/), Essential and Business prices, visits, storage, bandwidth, staging, backup retention, isolation, SLA
- [WP Engine: understand billable visits](https://wpengine.com/support/count-visits/), unique IP per UTC day, exclusions, suspected bots from September 2025, environments summed
- [WP Engine: overage pricing](https://wpengine.com/overage-pricing/), $2 per 1,000 visits, monthly billing on annual plans
- [WP Engine: cache](https://wpengine.com/support/cache/), layers, TTLs, exclusions, purge methods and API
- [WP Engine: copy an environment](https://wpengine.com/support/copy-site/), full and custom copies, backups around a copy, search and replace, what is overwritten and not copied
- [WP Engine: about us](https://wpengine.com/about-us/), founded 2010 in Austin, 30 first customers
- [Kinsta: pricing](https://kinsta.com/pricing/), visit and bandwidth tiers, staging, backup retention
- [Kinsta: staging environments](https://kinsta.com/docs/wordpress-hosting/staging-environment/), push options, data lost on a database push, caching off on staging, sleep and cron
- [Flywheel: pricing](https://getflywheel.com/pricing/), visits, overage rates, managed plugin updates, ownership
- [Pressable: pricing](https://pressable.com/pricing/), visits, overage basis, staging and sandbox, backups, caches, WP Cloud
- [WordPress.com: pricing](https://wordpress.com/pricing/), plans, plugins on paid plans, unlimited visitors, backups
- [Rocket.net: pricing](https://rocket.net/pricing/), unmetered visitors, storage and bandwidth overages, backups, object cache
- [Pantheon: pricing](https://pantheon.io/plans/pricing), visits and pages served, environments, object cache, overage protection
- [SiteGround: WordPress hosting](https://www.siteground.com/wordpress-hosting.htm), prices, unlimited traffic, staging from GrowBig, caching
- [Hostinger: WordPress hosting](https://www.hostinger.com/wordpress-hosting), prices and term, backups, LiteSpeed caching, staging, auto-updates
- [Bluehost: WordPress hosting](https://www.bluehost.com/wordpress/wordpress-hosting), prices and term, visits, staging, weekly backups in the plan table, caching
- [DreamHost: shared hosting](https://www.dreamhost.com/hosting/shared/), DreamPress price and 14-day backup retention
- [GoDaddy FY2025 Form 10-K](https://www.sec.gov/Archives/edgar/data/1609711/000160971126000010/gddy-20251231.htm), Managed WordPress among hosting products
- [Rocket.net joins hosting.com](https://rocket.net/blog/rocket-net-joins-hosting-com-to-build-and-deliver-industry-leading-saas-web-hosting-platform), 26 Aug 2025

**WP Engine v. Automattic**

- [WP Engine is not WordPress](https://wordpress.org/news/2024/09/wp-engine/), 21 Sep 2024, the trademark license argument and post revisions
- [WP Engine is banned from WordPress.org](https://wordpress.org/news/2024/09/wp-engine-banned/), 25 Sep 2024
- [Secure Custom Fields](https://wordpress.org/news/2024/10/secure-custom-fields/), 12 Oct 2024, the fork under point 18 and automatic switching
- [Engadget: WordPress founder sued](https://engadget.com/big-tech/wordpress-founder-sued-for-alleged-libel-and-attempted-extortion-152957987.html?src=rss), 3 Oct 2024, WP Engine's claims and the 8% demand
- [Automattic: legal response to WP Engine](https://automattic.com/2024/10/31/legal-response-to-wp-engine/), 31 Oct 2024, denial, anti-SLAPP, access to WordPress.org
- [Search Engine Journal: judge sides with WP Engine](https://www.searchenginejournal.com/judge-sides-with-wp-engine-against-automattic-mullenweg-in-wordpress-dispute/535047/), the preliminary injunction's terms, bond, Automattic's response
- [TechCrunch: WP Engine's amended complaint](https://techcrunch.com/?p=3092407), February 2026, the 8% rate allegations and Automattic's response
- [webhosting.today: Automattic is not an owner of the WordPress marks](https://webhosting.today/2026/09/29/automattic-is-not-an-owner-of-the-wordpress-marks-it-asserted-in-court-a-judge-rules/), the 24 Sep 2026 order (Dkt. 410), sanctions hearing, trial date

**Security**

- [Patchstack: State of WordPress Security in 2025](https://patchstack.com/whitepaper/state-of-wordpress-security-in-2025/), 2024 vulnerability counts, plugin share, unpatched share, removals
