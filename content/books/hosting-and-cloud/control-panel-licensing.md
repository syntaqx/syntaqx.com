+++
title = "Control Panel Licensing & the Alternatives"
nav_title = "Control Panel Licensing"
description = "How panels are licensed: cPanel's per-account tiers since 2019, Plesk and DirectAdmin, the open-source panels, and how license cost reaches plan prices."
category = "Hosting & Cloud Industry"
order = 2157
part = "Web Hosting"
tags = ["cpanel", "plesk", "directadmin", "control-panels", "licensing", "pass-through", "open-source"]
+++

A shared hosting server runs a control panel, and the panel is usually licensed. For most of the industry's history the license was a fixed fee per server: one price for a VPS, a higher one for a dedicated machine, any number of hosting accounts on it. The cheapest way to run shared hosting was to pack as many accounts as possible onto each licensed server, and the panel vendor's revenue didn't grow when the host's did.

On 27 June 2019 cPanel ended that. Its licenses became tiers by the number of accounts, with a fee for every account over the top tier's cap, and the price of each tier has risen every year since. A license is now a cost per hosting account, which turns the panel vendor into a supplier whose fee scales with the host's customer count, the same position a registry holds for domains. The alternatives (Plesk, which shares cPanel's owner, DirectAdmin, the open-source panels, or a host's own panel) are priced against that change.

This chapter covers how the panels are priced today, how licensing got here, how account-based licensing works and what it counts, how panel cost flows into plan prices, Plesk, DirectAdmin and the open-source panels, and extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with `panel_licenses`, `license_seats` and license pass-through SKUs. What the panel does (root, resellers, packages, feature lists, AutoSSL, the APIs) is [cPanel & WHM](/books/hosting-and-cloud/cpanel-and-whm); how plans are priced on top of it is [How Web Hosting Makes Money](/books/hosting-and-cloud/web-hosting-business).

## How the Providers Do It

Panel licensing as each vendor's own pages show it, as of October 2026:

| Panel | Unit licensed | Entry | Top tier | Beyond the cap | License | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| **cPanel & WHM** | Accounts per server, bound to the server's main public IPv4 | Solo $29.99/mo, 1 account | Premier $69.99/mo, 100 accounts | $0.49 per additional account | Proprietary; store licenses auto-renew | WebPros |
| **WP Squared** (cPanel) | WordPress sites | $84.99/mo, 10 sites | | $0.40 per additional site | Proprietary | WebPros |
| **Plesk** | Domains per server, VPS or dedicated license | Web Admin, 10 domains (€12.04/mo in one listed price set) | Web Host, unlimited domains (€31.38/mo in the same set) | Move up an edition | Proprietary; store licenses auto-renew; 14-day refund | WebPros |
| **DirectAdmin** | Accounts and domains per server | Personal PLUS $5/mo, 2 accounts, 20 domains | Standard $29/mo, unlimited | Move up a plan | Proprietary | JBMC Software, Edmonton |
| **Virtualmin** | Domains (Pro) | GPL edition free; Professional from $7.50/mo or $75/yr for 10 domains | Unlimited domains tier | Move up a tier | GPL edition open source; Pro sold | Virtualmin, "Built on Webmin" |
| **aaPanel** | Server | Core edition "free forever" | Pro, advertised at $399 lifetime in an anniversary sale | | Described as open source; the GitHub repository's license is not a standard SPDX license | aaPanel |
| **CyberPanel** | Server | Free, with OpenLiteSpeed | Paid add-ons and services | | GPL-3.0 | CyberPanel |
| **HestiaCP** | Server | Free | | | GPL-3.0; "based on the VestaCP project" | Community, donation-funded |
| **ISPConfig** | Servers (multi-server from one panel) | Free | Paid Billing Module and Migration Toolkit | | BSD | ISPConfig |
| **CloudPanel** | Server | Free | | | Proprietary freeware: "licensed and not sold"; resale needs written approval | MGT-COMMERCE GmbH, Berlin |
| **Webmin** | Server | Free | | | BSD-3-Clause | Webmin project |

What the table shows:

- **Only cPanel prices by the hosting account with metered overage.** Plesk and DirectAdmin price per server by edition, with domain or account caps you step through; the open-source panels charge nothing per server and sell add-ons or support.
- **The two dominant commercial panels share an owner.** cPanel and Plesk are both WebPros products, and WebPros' partner prices for both rise on the same date each year (the Tier.Net notices below list them together). A host switching from one to the other changes software, not supplier.
- **The free panels differ in what they leave out.** HestiaCP and ISPConfig run web, mail, DNS and databases; CloudPanel runs NGINX and PHP-FPM sites for developers and doesn't list mail; Webmin is a system administration tool that Virtualmin turns into a hosting panel. None ships the reseller hierarchy, migration tooling and third-party integrations at cPanel's depth, which is what the license buys.
- **Store prices aren't what hosts pay.** cPanel's store sells to server owners; hosts buy through partner (NOC) agreements whose prices cPanel doesn't publish. Hosts relay them to their own customers when prices change, which is where the partner figures below come from.

## How Panel Licensing Got Here

| Date | Step | Problem it solved | What it cost |
| --- | --- | --- | --- |
| 1997 | cPanel established; headquartered in Houston with over 220 staff by 2018 (per Oakley Capital's 2018 announcement) | A web panel for hosting accounts | |
| 28 Apr 2017 | Parallels carves out Plesk and sells it to Oakley Capital at an enterprise value of $105 million | A standalone owner for the second commercial panel | |
| 21 Aug 2018 | Oakley Capital's regulatory announcement: WebPros BV, owner of Plesk and SolusVM, is acquiring a majority stake in cPanel from founder J. Nick Koston, subject to regulatory approval; Oakley's Fund III invests a further $50 million in WebPros | | cPanel and Plesk under one owner |
| 27 Jun 2019 | cPanel announces account-based pricing; Tier.Net relays partner tiers the same day | Panel revenue that scales with accounts | Increases reported by hosts of 200% and more (INIZ) to over 800% (SonicFast) |
| 1 Jul 2019 | DirectAdmin stops selling lifetime licenses to new accounts, citing demand from the cPanel change; existing customers may order them until 1 Sep | | A rival ends its cheapest model the week after |
| 1 Sep 2019 | Existing monthly cPanel licenses convert at partner hosts | | |
| 12 Dec 2019 | Oakley and co-investors agree to sell WebPros to CVC Fund VII; Oakley Capital IV invests $200 million alongside as a minority partner | | |
| 17 Nov 2020 | Tier.Net announces 1 Jan 2021 partner prices: Admin $13.50, Pro $19, Plus (50 accounts) $27, Premier $34.50, $0.19 per account over 100 | | The first of the annual increases in the public notices |
| Dec 2021 to Dec 2025 | Annual notices of 1 January increases for 2022, 2023, 2024 (about 10%, per Hosterion), 2025 and 2026; ResellersPanel calls the 2024 round the "fifth consecutive year" of increases | | A supplier price rise every year |
| 3 Dec 2025 | Tier.Net's 2026 notice: Admin $21.00, Pro $32.00, Plus $42.00, Premier $49.50, $0.37 per account over 100, and a higher surcharge for servers on end-of-life operating systems | | |
| 1 Jan 2028 | End of cPanel's Extended Lifecycle Support for CentOS 7 and CloudLinux 7 servers on version 110 | Time to migrate off a dead OS | Servers that haven't moved lose security updates |

Oakley Capital's own news page dates the cPanel announcement "21.10.18"; the regulatory announcement on Investegate is dated 21 August 2018. I use the regulatory announcement's date.

The pre-2019 store prices, as The Register reported them: Solo $15 a month, VPS $20 a month or $200 a year, Dedicated $45 a month or $425 a year, each with unlimited accounts. cPanel's announcement said "Historically, cPanel has based its services and pricing around a VPS or Dedicated license with unlimited cPanel Accounts," and argued that hardware had changed what one server could hold. The new store tiers were Admin $20, Pro $30 and Premier $45 for 100 accounts, plus $0.20 a month for each account over 100; licenses bought or renewed after the announcement took the new prices immediately, monthly licenses kept the old structure until 1 September, and annual licenses moved to monthly at renewal.

Partner prices over the same years, as Tier.Net relayed them to its customers (monthly):

| Effective | Admin (5) | Pro (30) | Plus (50) | Premier (100) | Each account over 100 |
| --- | --- | --- | --- | --- | --- |
| 1 Sep 2019 | $12.50 | $17.50 | | $32.00 | $0.12 |
| 1 Jan 2021 | $13.50 | $19.00 | $27.00 | $34.50 | $0.19 |
| 1 Jan 2025 | $19.75 | $27.25 | $39.25 | $47.00 | $0.31 |
| 1 Jan 2026 | $21.00 | $32.00 | $42.00 | $49.50 | $0.37 |

In just over six years the partner Premier price rose about 55% and the per-account overage about 208%: the overage, which is what dense servers pay, is the line that grew fastest.

## How Account-Based Licensing Works

A cPanel license is bound to a server: "Only the server's main public IPv4 address needs a license." It renews automatically each month (or year, for the annual store options) on the purchase date until cancelled. The tier sets the number of cPanel accounts the server may hold; Solo, Admin and Pro are for cloud and VPS servers, and Premier is also sold for metal and dedicated servers.

**What counts.** An account is a cPanel account: one primary user with its own login, home directory and main domain. Addon domains, subdomains, mailboxes and databases inside it don't count, per InMotion Hosting's July 2026 guide. Status doesn't matter: ChemiCloud told its reseller customers in 2019 that "all accounts no matter the type or status will count against your allocation," and InMotion notes that abandoned accounts still count. A suspended account waiting for its deletion clock is a paid seat.

**What happens at the cap.** On the fixed tiers, WHM won't create an account beyond the licensed count, so automated provisioning fails until the license is upgraded; the upgrade applies without downtime (InMotion). On Premier, accounts over 100 are billed at the per-account rate instead.

**Store and partner.** A server owner can buy from cPanel's store at list price; hosts buy through partner agreements at the lower prices above and resell licenses to VPS and dedicated customers. Because the license is bound to the server's main IPv4 address, a server that changes address or moves to another host has to be relicensed.

**Operating system lifecycle.** The license follows the server's OS. cPanel's system requirements list AlmaLinux, CloudLinux, Rocky Linux and Ubuntu; CentOS 7 and CloudLinux 7 servers on version 110 are in Extended Lifecycle Support with critical security updates through 1 January 2028, and WebPros raised its surcharge for servers on end-of-life systems in the 2026 round (Tier.Net). An old OS is now a line item as well as a risk, which pushes hosts to migrate servers, a project [Backups, Restores & Migrations](/books/hosting-and-cloud/backups-and-migrations#migrations) covers.

**Versions.** Even-numbered cPanel versions are production releases and odd ones development; as of October 2026 the newest LTS is 134 (January 2026) and the newest release 138 (July 2026). A license entitles the server to updates on the tier it's in; the update tiers themselves are [cPanel & WHM](/books/hosting-and-cloud/cpanel-and-whm)'s.

## How Panel Cost Flows Into Plan Prices

Before 2019 the panel was a fixed cost per server, and a host's marginal account was free. After 2019 every account has a license cost, and it depends on how many accounts share the server.

At cPanel's October 2026 Premier store price ($69.99 a month for 100 accounts, $0.49 for each account beyond):

| Accounts on the server | Monthly license | Per account per month |
| --- | --- | --- |
| 100 | $69.99 | $0.70 |
| 200 | $69.99 + 100 × $0.49 = $118.99 | $0.59 |
| 500 | $69.99 + 400 × $0.49 = $265.99 | $0.53 |

At Tier.Net's 2026 partner price ($49.50 plus $0.37), the same 500-account server costs $197.50 a month, $0.40 per account. On the old Dedicated store license, $45 a month with unlimited accounts, 500 accounts cost $0.09 each; on the 2019 store tiers, $45 plus 400 × $0.20, $125, or $0.25 each. Density still lowers the cost per account, but it can no longer drive it toward zero: the floor is the overage rate.

Against the plans in [How Web Hosting Makes Money](/books/hosting-and-cloud/web-hosting-business#how-the-providers-do-it), whose entry plans sell for $2.49 to $4 a month in the intro term, a panel fee of $0.40 to $0.70 per account is 10% to 28% of the intro price before servers, support, domains or acquisition. (GoDaddy's 10-K says its shared hosting runs on cPanel or Plesk; the other hosts' panels aren't stated on the pages cited there, and some run their own.) At renewal prices of $8 to $18 it falls to 2% to 9%. The license is one more reason the intro term loses money and the renewal pays for it.

How hosts passed it on in 2019, from their own notices:

- **Reseller plans got account caps and price increases.** ChemiCloud raised its reseller prices for the first time, capped cPanel accounts per plan ($19.95 to $64.95 a month), gave resellers until 11 August 2019 to get under their new limits, and warned that remaining suspended accounts would be terminated after 1 September.
- **Hosts looked for another panel.** SonicFast, facing an increase of over 800%, considered moving to DirectAdmin; INIZ stopped issuing new licenses (The Register).
- **VPS customers saw the license as its own line.** A one-account VPS needs a Solo license at $29.99 a month at list, more than four times the $6.99 first-year price of DreamHost's entry self-managed VPS; hosts that sell cPanel VPSs pass the license through as a separate charge.

Three ways a host can treat the fee, and when each fits:

- **Absorb it in the plan price** on shared hosting, where the customer never sees the panel license and the host balances density against it. The fee is a cost of revenue per account, allocated from the server's license.
- **Pass it through** on VPS and dedicated servers, as its own invoice line marked as a license pass-through, so a vendor increase can be passed on with notice and the host's margin reporting isn't distorted ([How the Money Is Made](/books/hosting-and-cloud/hosting-and-cloud-business#how-the-money-is-made)).
- **Replace it** with a cheaper or free panel, or the host's own, once the license bill across the fleet costs more than a team to build and maintain the alternative ([Build, Buy or Rent](/books/hosting-and-cloud/provider-landscape#build-buy-or-rent)).

## Plesk

Plesk is licensed per server by edition: Web Admin for up to 10 domains, Web Pro for up to 30, Web Host for unlimited, each as a VPS license (virtual servers only) or a dedicated license (dedicated or virtual), with the same features either way. Its pricing page shows two price sets without saying which billing period each is (one set is €12.04, €18.29 and €31.38 a month; the other €6.60, €9.90 and €16.50), so the only firm reading is the shape: about 2.5 to 2.6 times from the smallest to the unlimited edition in either set. Store licenses renew automatically at the end of each monthly or yearly period, can be refunded within 14 days of a direct purchase, and moved to a revised price structure for renewals from 1 January 2026. Partners sell under business plans with a monthly minimum the page states inconsistently (€250 or $250 in one place, $500 in its FAQ).

Partner prices rose with cPanel's on the same date: Tier.Net's 2026 notice lists Web Admin $16.99 (up $1.99), Web Pro $29.99 (up $3.99), and Web Host $62.99 on VPS (up $14.99) and $69.99 on bare metal.

The licensing difference that matters is the unit. Plesk counts domains in its two lower editions and nothing in Web Host, so a dense Plesk server's license cost is flat once it reaches Web Host, which is where cPanel's used to be before 2019. The ownership difference is none: Plesk and cPanel are both WebPros'.

## DirectAdmin

DirectAdmin, from JBMC Software in Edmonton, prices per server in three monthly plans: Personal PLUS at $5 (2 accounts, 20 domains), Lite at $15 (10 accounts, 50 domains), and Standard at $29 with unlimited accounts and domains. Its page notes that "You do not own a license unless you have purchased it through our directadmin.com website."

On 1 July 2019, four days after cPanel's announcement, DirectAdmin Sales posted that "our traditional lifetime licenses are no longer available" to new accounts, including datacenter licenses, with existing customers able to order them until 1 September. The reason given was demand from cPanel's pricing change, and lifetime licenses had been a loss leader "not sustainable to begin with." Existing lifetime licenses stayed valid. A $299 lifetime license remained available, with the $99-a-year update and support fee after the first year made optional, per a later staff reply in the same thread.

For a host, DirectAdmin's Standard plan is the closest thing left to the pre-2019 model: one price per server whatever the account count. Its tradeoffs are a smaller ecosystem of integrations and a migration from cPanel that is a project in itself.

## Open-Source Panels

The free panels split into three groups by what they're for.

**Hosting panels with mail and DNS.** HestiaCP (GPL-3.0, "based on the VestaCP project") installs Apache or NGINX with PHP-FPM, Exim and Dovecot, BIND, and MariaDB, MySQL or PostgreSQL, on Debian 11 to 13 and Ubuntu 22.04 to 26.04 LTS; it's funded by donations. ISPConfig (BSD) manages one or many servers from one panel, including mirrored clusters, with administrator, reseller, client and email-login levels, on Debian, Ubuntu, AlmaLinux and Rocky Linux; its billing module and migration toolkit are paid add-ons. Virtualmin's GPL edition is a hosting panel "Built on Webmin," and Virtualmin Professional adds tooling from $7.50 a month for 10 domains.

**Server panels for developers.** CloudPanel runs NGINX, PHP-FPM, Node.js and Python sites on Debian and Ubuntu across the major clouds; it's free but proprietary, "licensed and not sold," and its terms bar hosting it for third parties or reselling it without written consent, which rules it out as a host's product panel without an agreement. CyberPanel (GPL-3.0) is built around OpenLiteSpeed and sells add-ons and services. aaPanel offers a free core edition, claims over three million servers, and sells a Pro edition.

**System administration.** Webmin (BSD-3-Clause) is "a web-based system administration tool for Unix-like servers," reporting about one million installations a year. It administers a server rather than selling hosting accounts on it.

What a host weighs before replacing a commercial panel with one of these: whether its license allows the use (CloudPanel's doesn't, without consent; aaPanel's GitHub license isn't a standard one), who ships security fixes and how fast, whether it has the reseller and package model the host sells ([Root, Resellers, Packages and Accounts](/books/hosting-and-cloud/cpanel-and-whm#root-resellers-packages-and-accounts)), whether customers can migrate in from cPanel and out again, and who answers the support ticket when the panel breaks. The license fee is the visible cost; the integration, migration and support work is the larger one.

## The Alternatives

| Approach | Model | Strengths | Failure modes | Licensing and ownership | Cost | Who uses it |
| --- | --- | --- | --- | --- | --- | --- |
| **cPanel & WHM** | Per-account tiers per server, overage beyond 100 | The reseller hierarchy, migration tooling, AutoSSL, integrations, and the panel customers already know | A supplier price rise every year; dense servers pay most; EOL OS surcharges | Proprietary, WebPros (under CVC) | $0.40 to $0.70 per account per month at 2026 partner and list Premier prices on 100 to 500 accounts | GoDaddy's shared hosting (with Plesk), and the hosts relaying partner prices above |
| **Plesk** | Per server by domain edition | Flat cost once on Web Host; same features on VPS and dedicated licenses | Same owner as cPanel; annual increases on the same date | Proprietary, WebPros | Per server, editions about 2.5x to 2.6x apart | GoDaddy's shared hosting (with cPanel) and many VPS hosts |
| **DirectAdmin** | Per server, unlimited accounts on Standard | Closest to the pre-2019 flat model; low price | Smaller ecosystem; migration from cPanel | Proprietary, JBMC Software | $5 to $29 a month per server | Cost-sensitive hosts and resellers |
| **Open-source hosting panels** | Free per server, paid add-ons or support | No license fee; source available; some multi-server | Thinner reseller and migration tooling; security response depends on a small team | GPL or BSD (HestiaCP, ISPConfig, Virtualmin GPL, CyberPanel) | Zero license; engineering and support time | Small hosts, VPS owners, technical customers |
| **Free proprietary server panels** | Free per server, vendor-controlled | Modern stacks for developers | Terms can bar hosting third parties; the vendor can change them | CloudPanel (MGT-COMMERCE), aaPanel | Zero license | Developers on cloud VMs |
| **A host's own panel** | Built in-house on its own provisioning | No per-account fee; product control; one data model | Years of engineering; migrating customers off cPanel; integrations to rebuild | The host | A team | Large hosts once the license bill exceeds that team |

## My Default

My default for a new shared host is to license cPanel and treat the license as a per-account cost of revenue from the first day, with the fleet's license bill on the same dashboard as server cost. The panel is what customers, resellers and migration tools expect, and building a replacement before the host has customers is building the wrong thing. On VPS and dedicated servers I'd pass the license through as its own line, at the vendor's price plus a stated margin, so each annual increase is a pass-through with notice rather than a hit to my margin.

Two numbers would change it. When the fleet's annual license bill exceeds the cost of a team that could build and maintain a panel on the host's own provisioning, a host's own panel pays for itself, and the data model in this volume is most of what it needs. And when most of the fleet is on single-tenant VPSs where a Solo license costs more than the server, DirectAdmin or an open-source panel with a published security process is the better offer to customers, as long as its license permits the use and the host can support it.

## How to Build It

The core model has `skus.pass_through` with a `'license'` value and `hosting_accounts.panel`. This chapter adds the server's license (`panel_licenses`), each account's place on it over time (`license_seats`), and the SKUs that price both. Packages and feature lists are [cPanel & WHM](/books/hosting-and-cloud/cpanel-and-whm#how-to-build-it)'s.

```sql
CREATE TABLE panel_licenses (            -- one panel license on one server, over time
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  server_id           UUID NOT NULL REFERENCES resources (id),  -- kind 'server' or
                                         -- 'virtual_machine'
  vendor              TEXT NOT NULL CHECK (vendor IN ('cpanel', 'plesk', 'directadmin',
                        'virtualmin', 'other')),
  product_tier        TEXT NOT NULL,     -- vendor's name: 'premier_metal', 'web_host_vps'
  tier_sku_id         UUID NOT NULL REFERENCES skus (id),       -- pass_through = 'license'
  overage_sku_id      UUID REFERENCES skus (id),                -- per account beyond the cap
  account_cap         INT,               -- accounts (or domains) included; null: unlimited
  cap_unit            TEXT NOT NULL CHECK (cap_unit IN ('accounts', 'domains', 'sites',
                        'none')),
  bound_ipv4          INET NOT NULL,     -- the server's main public IPv4, as licensed
  billing_source      TEXT NOT NULL CHECK (billing_source IN ('store', 'partner', 'noc')),
  price_book          TEXT NOT NULL,     -- 'vendor_store', 'partner:<agreement>'
  billing_period      TEXT NOT NULL CHECK (billing_period IN ('month', 'year', 'lifetime')),
  auto_renew          BOOLEAN NOT NULL,
  vendor_license_ref  TEXT,              -- the vendor's license id
  resold_to_account   UUID REFERENCES accounts (id),  -- set when the customer's server
                                         -- license is passed through to them
  valid_during        TSTZRANGE NOT NULL,
  CHECK ((account_cap IS NULL) = (cap_unit = 'none')),
  CHECK (overage_sku_id IS NULL OR account_cap IS NOT NULL),
  EXCLUDE USING GIST (server_id WITH =, valid_during WITH &&)  -- one panel per server
);

CREATE TABLE license_seats (             -- an account counted against a license
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  panel_license_id    UUID NOT NULL REFERENCES panel_licenses (id),
  hosting_account_id  UUID NOT NULL REFERENCES hosting_accounts (resource_id),
  counted_during      TSTZRANGE NOT NULL,  -- from creation on the server to removal;
                                           -- suspended accounts still count
  EXCLUDE USING GIST (hosting_account_id WITH =, counted_during WITH &&)
);
```

The license's prices are ordinary SKUs and price versions, in two price books: the vendor's list and the partner agreement the host actually buys under.

```sql
INSERT INTO skus (product_id, code, meter, unit, charge_kind, pass_through) VALUES
  ($panel, 'cpanel.premier.month',    'panel.license',          'license_month', 'recurring', 'license'),
  ($panel, 'cpanel.account_over_cap', 'panel.accounts_over_cap', 'account_month', 'usage',     'license');

INSERT INTO price_versions (sku_id, price_book, currency, unit_price, valid_during, announced_at)
VALUES
  ($premier,  'vendor_store',     'USD', 6999, '[2026-10-01,)', NULL),
  ($over_cap, 'vendor_store',     'USD',   49, '[2026-10-01,)', NULL),
  ($premier,  'partner:tier_net', 'USD', 4950, '[2026-01-01,)', '2025-12-03'),
  ($over_cap, 'partner:tier_net', 'USD',   37, '[2026-01-01,)', '2025-12-03');
```

Notes on the shape:

- **Seats are ranges, not a count.** cPanel's pages don't say whether accounts are counted at a peak, a month end or daily, so the model stores when each account existed on the server and computes any of them. A seat opens when the account is created and closes when it is removed from the server, not when it's suspended.
- **The binding is an identifier.** `bound_ipv4` mirrors the server's address in `resource_identifiers`; a renumbering or a migration to a new server is a license event, and a mismatch between the two is an alert.
- **Pass-through or absorbed is per license.** A license with `resold_to_account` set is invoiced to that customer as a pass-through line at the host's price book for resale; one without it is the host's own cost, allocated across the seats on it.
- **Price changes arrive with notice.** Each annual increase is a new price version with `announced_at` set to the vendor's or partner's notice date, so the cost of a month is computed at the price in force and the notice the host must give its own customers can be measured from it.

A server's license cost for a month, at the peak number of seats on any day of the month:

```sql
WITH days AS (
  SELECT d FROM generate_series($month_start::timestamptz,
                                $month_end::timestamptz - INTERVAL '1 day',
                                INTERVAL '1 day') AS d
),
daily AS (
  SELECT days.d, COUNT(s.id) AS seats
  FROM days
  LEFT JOIN license_seats s ON s.panel_license_id = $1 AND s.counted_during @> days.d
  GROUP BY days.d
)
SELECT pl.id, pl.product_tier, pl.account_cap,
       MAX(daily.seats) AS peak_seats,
       base.unit_price
         + GREATEST(MAX(daily.seats) - pl.account_cap, 0) * COALESCE(ovr.unit_price, 0)
         AS monthly_cost_minor,
       (base.unit_price
         + GREATEST(MAX(daily.seats) - pl.account_cap, 0) * COALESCE(ovr.unit_price, 0))
         / NULLIF(MAX(daily.seats), 0) AS cost_per_seat_minor
FROM panel_licenses pl
CROSS JOIN daily
JOIN price_versions base ON base.sku_id = pl.tier_sku_id
                        AND base.price_book = pl.price_book
                        AND base.valid_during @> $month_start::timestamptz
LEFT JOIN price_versions ovr ON ovr.sku_id = pl.overage_sku_id
                             AND ovr.price_book = pl.price_book
                             AND ovr.valid_during @> $month_start::timestamptz
WHERE pl.id = $1
GROUP BY pl.id, pl.product_tier, pl.account_cap, base.unit_price, ovr.unit_price;
```

At the store price book with a peak of 500 seats that returns 26,599 minor units ($265.99) and about 53.2 cents a seat, the worked example above. For an unlimited license (`account_cap` null) the subtraction is null and PostgreSQL's `GREATEST` ignores nulls, so the cost is the base price, which is what Plesk Web Host and DirectAdmin Standard charge.

The per-account cost then joins the plan each account is sold on, to show how much of each plan's price the panel takes, at the intro and the renewal price:

```sql
SELECT pv.id AS plan_version_id, p.code,
       ROUND(AVG(c.cost_per_seat_minor), 1)                      AS panel_cost_per_month,
       ROUND(pv.intro_amount::numeric   / pv.term_months, 1)     AS intro_per_month,
       ROUND(pv.renewal_amount::numeric / pv.term_months, 1)     AS renewal_per_month,
       ROUND(AVG(c.cost_per_seat_minor) / (pv.renewal_amount::numeric / pv.term_months), 3)
                                                                 AS share_of_renewal
FROM license_cost_by_seat c            -- the query above, per license and month, per seat
JOIN license_seats s     ON s.panel_license_id = c.panel_license_id
JOIN resources r         ON r.id = s.hosting_account_id
JOIN subscriptions sub   ON sub.id = r.subscription_id
JOIN plan_versions pv    ON pv.id = sub.plan_version_id
JOIN plans p             ON p.id = pv.plan_id
WHERE c.month = $month AND s.counted_during @> $month::timestamptz
GROUP BY pv.id, p.code, pv.intro_amount, pv.renewal_amount, pv.term_months;
```

Events: `panel_license.created`, `panel_license.tier_changed`, `panel_license.ip_rebound`, `panel_license.cancelled`, `license_seat.opened` and `license_seat.closed` through the [outbox](/docs/architecture/events#the-transactional-outbox), to the vendor's licensing API (the NOC calls themselves are partner-specific and not public), cost reporting and the server's monitoring.

## Auditing

- **The vendor's invoice against the seats.** Each month, the license bill from the vendor or partner reconciled against the computed cost per license; a difference is either a counting rule the host has wrong or a license the host forgot to cancel.
- **Licenses on servers that no longer exist.** Every `panel_licenses` row with `auto_renew` true whose server is deleted or stopped, which is money spent on nothing.
- **Accounts that should have been removed.** Seats held by accounts suspended past their deletion clock (Invoices, Dunning & Suspension), each a paid seat for a customer who no longer pays.
- **Pass-through lines.** That every resold license appears on the customer's invoice as a pass-through line at the current price version, and that each vendor increase reached customers only after the notice their terms require.
- **Supplier price history.** Each vendor and partner notice, its date and its effective date, kept with the price versions it created, since licensing disputes and competition questions (Licensing Disputes; Competition Cases) start from that record.

## What This Means for the System You Build

- **Model the license as a SKU with price versions** in both the vendor's and the partner's price books, marked as a license pass-through.
- **Record seats as ranges per account per license,** so any counting rule the vendor uses can be computed and reconciled.
- **Count suspended accounts as paid,** and delete accounts on their stated clock so they stop costing a seat.
- **Put license cost per account next to plan price,** at intro and renewal, on the same dashboard as server cost ([Cost and FinOps](/docs/operations/cost-and-finops#measure-cost-per-unit-not-just-in-total)).
- **Pass licenses through on VPS and dedicated,** as their own invoice lines with notice of each increase.
- **Track the OS under every license;** an end-of-life OS is a surcharge and a security deadline.
- **Keep the panel replaceable:** the hosting account, its package and its seats are the host's records, not the panel's, so changing panels is a migration rather than a rebuild.

## References

**cPanel and WebPros**

- [cPanel: pricing](https://www.cpanel.net/pricing/), October 2026 tiers, account limits, per-account price beyond 100, WP Squared, auto-renewal, main public IPv4 binding
- [Oakley Capital: Oakley Capital to invest in cPanel (RNS, Investegate)](https://investegate.co.uk/announcement/rns/oakley-capital-investments-ltd-di---oci/oakley-capital-to-invest-in-cpanel/5603880), 21 Aug 2018, WebPros majority stake, founder, $50 million, established 1997, Houston
- [Oakley Capital: Oakley Capital to invest in cPanel](https://oakleycapital.com/latest-news/oakley-capital-to-invest-in-cpanel/), the same announcement on Oakley's news page, dated "21.10.18"
- [CVC: Oakley Capital agrees sale of WebPros to CVC Fund VII](https://www.cvc.com/media/news/2019/2019-12-12-oakley-capital-agrees-sale-of-webpros-to-cvc-fund-vii/), 12 Dec 2019, Oakley Capital IV $200 million minority
- [Willkie: Parallels sells Plesk to Oakley Capital](https://www.willkie.com/news/2017/05/parallels-sells-plesk-to-oakley-capital), 28 Apr 2017, enterprise value $105 million
- [cPanel: system requirements](https://docs.cpanel.net/installation-guide/system-requirements/), supported operating systems
- [cPanel: product versions and the release process](https://docs.cpanel.net/knowledge-base/cpanel-product/product-versions-and-the-release-process/), even and odd versions, LTS and release dates, Extended Lifecycle Support through 1 Jan 2028

**Account-based pricing and its effects**

- [The Register: cPanel unleashes price hikes on its most dense customers](https://www.theregister.com/on-prem/2019/06/28/cpanel-unleashes-price-hikes-on-its-most-dense-customers/1200192), 28 Jun 2019, old and new store prices, cPanel's statement, conversion timing, SonicFast and INIZ
- [Tier.Net: cPanel/WHM license changes](https://billing.tier.net/announcements/6/cPanelorWHM-license-changes.html), 27 Jun 2019, partner tiers and overage, 1 Sep 2019 conversion
- [Tier.Net: 2021 cPanel/WHM license cost increases](https://billing.tier.net/announcements/9/2021-cPanelorWHM-License-Cost-Increases.html), 17 Nov 2020, 2021 partner prices
- [Tier.Net: announcement archive](https://billing.tier.net/announcements), annual notices for 2022 to 2026
- [Tier.Net: 2025 cPanel, Plesk and WHMCS license cost increases](https://billing.tier.net/announcements/14/2025-cPanel-Plesk-and-WHMCS-license-cost-increases.html), 5 Dec 2024, 2025 partner prices
- [Tier.Net: 2026 cPanel, Plesk and WHMCS license cost increases](https://billing.tier.net/announcements/15/2026-cPanel-Plesk-and-WHMCS-license-cost-increases.html), 3 Dec 2025, 2026 cPanel and Plesk partner prices, EOL OS surcharge
- [Hosterion: cPanel pricing increase for 2024](https://hosterion.com/blog/cpanel-pricing-increase-for-2024), about 10%, effective 1 Jan 2024
- [ResellersPanel: cPanel license price increase](https://blog.resellerspanel.com/?p=20619), 1 Dec 2023, "fifth consecutive year"
- [ChemiCloud: reseller hosting changes](https://chemicloud.com/blog/?p=1176), 23 Jul 2019, all accounts count, reseller caps and prices, deadlines
- [InMotion Hosting: cPanel pricing structure](https://www.inmotionhosting.com/support/edu/cpanel/cpanel-pricing-structure/), July 2026, what counts as an account, abandoned accounts, behavior at the cap

**Other panels (as of October 2026)**

- [Plesk: pricing](https://www.plesk.com/pricing/), editions, domain limits, VPS and dedicated licenses, listed price sets, 2026 renewal revision, auto-renewal, 14-day refund, partner minimums
- [DirectAdmin: pricing](https://www.directadmin.com/pricing.php), plans, account and domain limits, JBMC Software
- [DirectAdmin forum: lifetime licenses](https://forum.directadmin.com/goto/post?id=296625), 1 Jul 2019, end of lifetime licenses for new accounts, 1 Sep deadline, reason, $299 license and optional $99 fee
- [Virtualmin](https://www.virtualmin.com/), GPL and Pro editions, built on Webmin, supported systems
- [Virtualmin: shop](https://www.virtualmin.com/shop/), Professional from $7.50 a month or $75 a year for 10 domains
- [Webmin](https://webmin.com/), what it is, installations a year
- [Webmin on GitHub](https://github.com/webmin/webmin), BSD-3-Clause
- [HestiaCP](https://hestiacp.com/), GPLv3, donation-funded
- [HestiaCP: getting started](https://hestiacp.com/docs/introduction/getting-started.html), supported systems and installed services
- [HestiaCP README](https://github.com/hestiacp/hestiacp), based on VestaCP
- [ISPConfig](https://www.ispconfig.org/ispconfig/), BSD license, multi-server, access levels, add-ons
- [ISPConfig: home](https://www.ispconfig.org/), supported systems, free
- [CyberPanel](https://cyberpanel.net/), free with OpenLiteSpeed, paid add-ons
- [CyberPanel on GitHub](https://github.com/usmannasir/cyberpanel), GPL-3.0
- [aaPanel](https://www.aapanel.com/), free core edition, Pro offer, installs claimed
- [aaPanel on GitHub](https://github.com/aaPanel/aaPanel), non-standard license
- [CloudPanel](https://www.cloudpanel.io/), free, supported systems and clouds, stack
- [CloudPanel: license terms](https://www.cloudpanel.io/license-terms/), proprietary, resale and third-party hosting restrictions, MGT-COMMERCE GmbH

**Filings**

- [GoDaddy: Form 10-K for 2025](https://www.sec.gov/Archives/edgar/data/1609711/000160971126000010/gddy-20251231.htm), shared hosting on cPanel or Plesk
- [DreamHost: shared hosting](https://www.dreamhost.com/hosting/shared/), Stack 4 self-managed VPS first-year price, as of October 2026
