+++
title = "Choosing & Hosting a Store"
description = "Hosted SaaS, self-hosted open source, headless or your own: what running a store involves, PCI scope by SAQ, total cost, lock-in, exports and when to build."
category = "Commerce Industry"
order = 2304
part = "The Business"
tags = ["commerce", "platforms", "hosting", "pci-dss", "total-cost-of-ownership"]
+++

Every store runs on one of four foundations: a hosted platform the vendor runs, open-source software the merchant runs, a headless platform with a storefront the merchant writes, or software the merchant builds. The choice looks like a feature comparison and is really a decision about who carries five burdens: the servers and their uptime, upgrades and security patches, the payment page's PCI scope, the cost that grows with sales, and the way out if the choice is wrong.

This chapter compares the four, describes what hosting a store yourself involves for the open-source platforms (WooCommerce, Adobe Commerce and Magento, Medusa, Saleor, Sylius, Spree), sets out how the payment page decides PCI scope, prices the options from published rates, and covers lock-in, exports and when building your own is justified. Hosting itself (servers, managed WordPress, the web hosting business, total cost of ownership) is the [Hosting & Cloud](/books/hosting-and-cloud/managed-wordpress) volume's; PCI DSS in depth is the playbook's [PCI DSS](/docs/compliance/pci-dss). It adds `export_runs` to [The Core Data Model](/books/commerce/commerce-business#the-core-data-model).

## How the Platforms Do It

As of October 2026, from vendor pricing pages and documentation:

| Option | Examples | Who runs the servers | Upgrades and patches | Payment page | Cost that grows with sales |
| --- | --- | --- | --- | --- | --- |
| **Hosted SaaS** | Shopify, Commerce.com (BigCommerce), Wix, Squarespace | The vendor | The vendor, continuously | The vendor's checkout; Shopify says its Level 1 PCI DSS compliance "extends by default to all stores powered by Shopify" | Card processing, plus a fee for another payment provider (Shopify 2% on Basic to 0.2% on Plus); sales caps by plan on Commerce.com |
| **Hosted open source** | Medusa Cloud, Saleor Cloud, Adobe Commerce on cloud infrastructure, managed WordPress hosts for WooCommerce | The vendor or host | Shared: the host patches the platform, the merchant upgrades its code | The merchant's integration with a payment provider | Saleor Cloud 0.8% above $200,000 monthly GMV on Select; Medusa Cloud "0% GMV platform fee" |
| **Self-hosted open source** | WooCommerce, Magento Open Source, PrestaShop, Sylius, Spree, Medusa, Saleor | The merchant | The merchant | The merchant's integration | Card processing only |
| **Headless or composable** | commercetools, Shopify or Commerce.com with a custom storefront, Medusa or Saleor | The vendor for the backend; the merchant for the storefront | Split along the same line | Usually the provider's hosted fields or the platform's checkout | The platform's contract or plan |
| **Your own** | A custom order system on your infrastructure | The merchant | The merchant | The merchant's integration | None beyond processing; the cost is the team |

Three patterns run through the table:

- **Hosted platforms trade fees for burdens.** The vendor runs the servers, patches, checkout and PCI validation, and recovers it through plan fees and payments; the merchant gives up control of the checkout and the data model.
- **"Open source" says nothing about who runs it.** The same Medusa or Saleor codebase can be the vendor's cloud or the merchant's cluster; Adobe Commerce runs on a merchant's servers or on Adobe's "automated hosting platform."
- **Headless splits the stack, and the responsibilities with it.** A custom storefront is the merchant's code, servers, performance and, if it touches the payment form, PCI scope, even when the backend is hosted.

## Four Ways to Run a Store

**Hosted SaaS.** The default for nearly every new store, and for many large ones. The vendor's checkout converts, its uptime is someone else's pager, its payments are integrated, and apps fill most gaps. The limits are the vendor's: API rate limits, checkout customization within what the platform allows, data structures (variants per product, metafields) and the fee for using another payment provider. A merchant outgrows SaaS when one of those limits blocks the business, not when it reaches a size.

**Self-hosted open source.** The merchant installs the software on servers it controls, with every line of code changeable and every record in its own database. That buys control and costs operations: the merchant is now the host, the security team, the upgrade team and, depending on the payment page, a larger part of the PCI assessment.

**Headless or composable.** The platform keeps catalog, cart, orders and checkout behind APIs, and the merchant writes the storefront (on Next.js, Hydrogen or anything else) and composes other services around it. It suits brands whose storefront is the product (content-heavy, highly designed, many markets) and teams that can run a web application; it doubles the number of systems that can be down on Black Friday.

**Your own.** The merchant builds the order system itself. Justified rarely, and for specific reasons ([When Building Your Own Is Justified](#when-building-your-own-is-justified)).

## What Hosting Your Own Shop Involves

A self-hosted store is a web application with a database, a cache, a search index, a queue, scheduled jobs and a payment integration, all of which the merchant runs. The parts:

- **Servers and scaling.** Web and application servers sized for peak, not average; a sale or a launch can bring many times normal traffic in minutes ([Peak Season & Drops](/books/commerce/peak-season#capacity-planning-for-a-sale)). Containers or VMs, a load balancer and autoscaling where the platform allows it ([Autoscaling and Cost](/books/hosting-and-cloud/autoscaling-and-cost)).
- **Caching.** Catalog and content pages cache well; carts, checkout, account pages and anything with a session cookie must never be shared between shoppers. A page cache that ignores a commerce cookie serves one shopper's cart to the next ([What Must Never Be Shared](/books/hosting-and-cloud/caching-and-invalidation#what-must-never-be-shared)). Price and stock changes need purges, which is where most caching bugs in commerce live.
- **Search.** Catalog search and faceting run on a search engine (OpenSearch or Elasticsearch for Magento, a hosted service such as Algolia for many others), with its own cluster, index rebuilds and capacity.
- **Queues and jobs.** Order exports, emails, inventory syncs, index updates and marketplace feeds run as background work on a queue and workers ([Background Jobs](/docs/architecture/background-jobs)); a stopped worker means orders that never reached the warehouse.
- **Database.** MySQL or MariaDB for the PHP platforms, PostgreSQL for Medusa and Saleor, with backups, point-in-time recovery and a restore that has been tested ([Managed Databases](/books/hosting-and-cloud/managed-databases)).
- **Upgrades and security patches.** Platform releases, extension updates, language runtime upgrades (PHP, Node.js, Ruby, Python), and security patches applied within days of release; an unpatched store is the classic route for card-skimming code onto a checkout ([Software Updates](/docs/security/software-updates)).
- **Extensions.** Every plugin or module is third-party code running with full access to the store and its customers; vetting, updating and removing them is a continuing job.

### WooCommerce on WordPress Hosting

WooCommerce is a WordPress plugin, so hosting it is hosting WordPress plus a store. WooCommerce's server requirements as of October 2026 are WordPress 6.9 or later, PHP 8.3 or later, MySQL 8.0 or later or MariaDB 10.6 or later, HTTPS, and 256 MB of PHP memory. Most stores run on managed WordPress hosts, which handle the servers, page caching (with cart and checkout pages excluded), updates and backups ([Managed WordPress](/books/hosting-and-cloud/managed-wordpress#caching)). The store's risks are WordPress's: plugins from many authors, admin accounts to protect, and core and plugin updates to apply. The platform's governance is part of the risk too: the dispute between WP Engine and Automattic shows how a host's access to WordPress's own update infrastructure can become a business dispute ([Platform Dependency: WP Engine v. Automattic](/books/hosting-and-cloud/managed-wordpress#platform-dependency-wp-engine-v-automattic)). The data is in the merchant's own MySQL database, which makes WooCommerce the easiest of the platforms to leave.

### Magento and Adobe Commerce

Magento Open Source and Adobe Commerce are the heaviest self-hosted stack. Adobe's system requirements for Commerce 2.4.9, released May 12, 2026, are PHP 8.5, MySQL 8.4 or MariaDB 12.3, OpenSearch 3, Valkey 9 (in place of Redis), RabbitMQ 4.3, Varnish 8, Composer 2.10 and nginx 1.30; 2.4.8 runs on PHP 8.4 or 8.3. Each release line has a support end date, about three years after release: 2.4.9 to May 31, 2029, 2.4.8 to May 31, 2028, 2.4.7 to May 31, 2027 with extended support to May 31, 2028, and 2.4.6's regular support ended August 11, 2026. A Magento store therefore runs six or more services, upgrades its runtime and dependencies on Adobe's schedule, and plans a release-line upgrade every few years, each a project with extension compatibility testing.

Adobe Commerce on cloud infrastructure moves the servers to Adobe: Adobe describes it as "an automated hosting platform with a self-service approach to building, deploying, and managing your Commerce application," pre-provisioned with PHP, MySQL (MariaDB), Redis or Valkey, message queues and search, hosted on AWS and Azure regions, with a Git-based workflow that builds and deploys on each push. The merchant still owns its code, its extensions and its upgrades.

### Medusa, Saleor, Sylius and Spree

The newer open-source platforms are frameworks more than stores, and they assume an engineering team:

| Platform | Stack | What production needs | License |
| --- | --- | --- | --- |
| **Medusa** | Node.js (v22 LTS or later), TypeScript | PostgreSQL and Redis, with the server and background workers deployed separately and at least 2 GB of memory | MIT core |
| **Saleor** | Python and Django, GraphQL API only | PostgreSQL, a cache (Valkey recommended) and a Celery task broker | BSD-3-Clause |
| **Sylius** | PHP 8.2 or later on Symfony 6.4 or 7.2 | A PHP host and a database, like any Symfony application | MIT |
| **Spree** | Ruby 3.2 or later on Rails; version 6.0 shipped October 27, 2026 | A Rails host, a database and a job runner | BSD-3-Clause core |
| **PrestaShop 9** | PHP 8.1 to 8.5 | MySQL 5.7 or MariaDB 10.2 or later, Apache 2.4 or nginx | Open source |

Each is a backend with APIs and an admin; the storefront is a separate application that the merchant deploys and runs. Hosting them is ordinary application hosting ([PaaS and Frontend Clouds](/books/hosting-and-cloud/paas-and-frontend-clouds), [Managed Kubernetes](/books/hosting-and-cloud/managed-kubernetes)), and Medusa Cloud and Saleor Cloud sell it as a service.

## PCI DSS Scope

How the payment page is served decides how much of the PCI DSS standard a merchant validates against, and so how much of its hosting is in scope. The rules are the playbook's [Which SAQ: Architecture Decides](/docs/compliance/pci-dss#which-saq-architecture-decides); the commerce choices map onto them like this:

| How the payment page is served | SAQ | What the merchant's servers carry |
| --- | --- | --- |
| A hosted platform's checkout (Shopify, Commerce.com), or a full redirect to the payment provider's page | **A** | No card data; the merchant still confirms nothing on its own pages can tamper with the checkout, and SAQ A includes external vulnerability scans of its e-commerce pages |
| The provider's iframe or hosted fields embedded in the merchant's own page | **A** | As above, plus the eligibility criterion added in 2025: the merchant confirms its site "is not susceptible to attacks from scripts," by its own script controls or written confirmation from its provider |
| The merchant's page builds the form with the provider's JavaScript, or posts card data directly to the provider | **A-EP** | The web servers serving the page are in scope: hardening, patching, logging, script inventory and tamper detection (requirements 6.4.3 and 11.6.1) |
| Card numbers reach the merchant's servers, or are stored there | **D** | The whole standard, on every system in the card data environment |

The Council's FAQ puts the line plainly: "If any element of a payment page originates from the merchant's website, the implementation is not eligible for SAQ A." For a self-hosted or headless store the practical rule is to use the provider's hosted fields or redirect and keep the merchant's own scripts off the payment page; Magecart-style skimming, which injects code into checkout pages, is why the script requirements exist, and [Store Security & PCI](/books/commerce/store-security-and-pci) covers it. The Payments volume covers the vault and card storage behind SAQ D ([Card Vault](/books/payments/card-vault)).

## Total Cost of Ownership

The cost of a store is the platform's fees plus everything the platform doesn't do. Platform fees, from published prices at monthly billing, for a store selling $100,000 a month, before card processing (my arithmetic):

| Platform and plan | Plan fee | Sales-based fee | Platform cost a month |
| --- | --- | --- | --- |
| Shopify Advanced, Shopify Payments | $399 | None | $399 |
| Shopify Advanced, another payment provider | $399 | 0.6% of sales | $999 |
| Commerce.com Scale | $399 | 0.9% above $33,333 a month | About $999 |
| Saleor Cloud Select | $1,599 | None up to $200,000 a month | $1,599 |
| Medusa Cloud | From $99 to $299 by plan | None | $99 to $299, plus the storefront's hosting |
| WooCommerce, self-hosted | $0 | None | Hosting, extensions and the people who run them |

The table is the smallest part of the bill. Card processing on $100,000 at 2.5% + 30¢ is $2,500 plus 30¢ an order, every month, on every option. The costs not on any platform's pricing page are where self-hosting loses or wins:

- **People.** Someone patches, upgrades, monitors and answers the pager. On hosted SaaS that is the vendor; on a self-hosted store it is the merchant's engineers or an agency retainer. [Counting People](/books/hosting-and-cloud/total-cost-of-ownership#counting-people) prices this.
- **Apps and extensions.** Hosted stores pay monthly fees for apps that a self-hosted store might build or buy once; both pay to keep them working through upgrades.
- **Upgrades as projects.** A Magento release-line upgrade or a major Spree or Medusa version is a project measured in weeks; SaaS upgrades arrive continuously at no project cost, and occasionally break a customization.
- **Compliance.** SAQ A on a hosted checkout is a short questionnaire and quarterly scans; SAQ A-EP or D on a self-hosted payment page is a security program.
- **Downtime.** An hour of checkout outage at peak costs more than a month of most plan fees.

[Total Cost of Ownership](/books/hosting-and-cloud/total-cost-of-ownership) in the Hosting & Cloud volume works through the same comparison for infrastructure in general; the commerce twist is that the payments line usually dwarfs the platform line, so the fee for using a different payment provider can decide the platform.

## Lock-In and the Way Out

Every platform locks in something; the question is what and how hard it is to get out. The general method is the playbook's [Vendor Exports and Lock-In](/docs/architecture/replacing-systems#vendor-exports-and-lock-in); the commerce specifics:

- **Catalog and orders.** Shopify exports products to CSV, without the product images in the file, and large exports arrive by email; its bulk operations API returns JSONL asynchronously with download links that expire after a week. Self-hosted stores hold everything in their own database.
- **Customers.** Shopify's customer export is a CSV, emailed above 50 customers, with no payment methods in it. Account passwords never leave any platform, so customers reset them after a move ([Identities and Passwords](/docs/architecture/replacing-systems#identities-and-passwords)).
- **Saved cards.** Stored card tokens belong to the payment provider, not the platform. Stripe will export card data, but only to another PCI DSS Level 1 processor, with that processor's attestation and a PGP key of at least 4,096 bits. Shopify documents importing payment methods for subscriptions (by token migration on any plan, card-number migration on Plus or Enterprise through its professional services) and doesn't document exporting cards from Shopify Payments. A subscription business that can't move its cards can't move its subscribers without asking each to re-enter a card ([Moving Card Numbers](/books/payments/switching-processors#moving-card-numbers)). <!-- source-gap: shopify-payments-card-export | missing | whether Shopify Payments exports stored cards to another processor | closes with: a Shopify help center or legal page describing outbound card data migration from Shopify Payments; the Shopify Payments FAQ is silent and only community threads discuss it | checked: 2026-10-29 -->
- **Apps.** Each app holds its own data (subscriptions, reviews, loyalty balances, return history) under its own export terms; the app inventory is part of the migration plan.
- **URLs and SEO.** Product and collection URLs follow each platform's patterns; a move needs a redirect for every old URL.
- **Customizations.** Theme code, checkout extensions and platform-specific functions don't move; a headless storefront moves more easily because it talks to the backend only through APIs.

My rule: before choosing, run the export once and check that the result could rebuild the store somewhere else; then schedule it, so the merchant always holds a recent copy of its own business ([How to Build It](#how-to-build-it)). [Replatforming & Migration](/books/commerce/replatforming) covers the move itself.

## When Building Your Own Is Justified

Building the order system is justified when at least one of these is true and stays true:

- **Commerce is the product.** A marketplace operator, a platform selling stores to merchants, or a vertical software company whose customers sell through it can't run their business on someone else's store.
- **The order model doesn't fit.** Rentals and returns of the same unit, configured-to-order goods priced by rules, regulated goods with per-state eligibility, delivery on a clock, or a mix of service and goods that no platform's order object holds without workarounds on every line.
- **The fee exceeds the team.** A sales-based platform fee at high volume can exceed the cost of the engineers who would replace it, though payment processing, the larger line, doesn't go away by building.
- **The checkout is the competitive edge,** and the platform's checkout limits are measured in lost conversion.

Building is not justified to avoid a monthly fee at small scale, to own the code for its own sake, or because a platform lacks one feature an app or a function provides. Even when building, buy the standardized parts (payments and the vault, tax, carrier labels, fraud screening) and keep the payment page on the provider's hosted fields so the build stays on SAQ A ([Build, Buy or Extend](/books/commerce/commerce-landscape#build-buy-or-extend)).

## My Default

For a new brand, a hosted SaaS platform with its own checkout and payments, extended by apps, and a scheduled export of catalog, customers and orders into storage the brand owns from the first month. For a brand that has outgrown it, headless on the same platform before a self-hosted one, so the checkout and its PCI scope stay with the vendor. Self-hosted open source when the team already runs web applications in production and the business needs the control, with the payment page on hosted fields. Building only for a business where commerce is the product.

## How to Build It

The export runs that keep a merchant's copy of its own store current, with enough recorded to prove the copy is complete:

```sql
CREATE TABLE export_runs (               -- scheduled exports out of a platform
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  connected_system_id UUID NOT NULL REFERENCES connected_systems (id),
  object              TEXT NOT NULL CHECK (object IN ('products', 'items', 'customers',
                        'orders', 'inventory', 'subscriptions', 'redirects', 'media')),
  method              TEXT NOT NULL CHECK (method IN ('csv', 'bulk_api', 'paged_api',
                        'database_dump')),
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at         TIMESTAMPTZ,
  status              TEXT NOT NULL CHECK (status IN ('running', 'succeeded', 'failed')),
  record_count        BIGINT,            -- what the export contained
  platform_count      BIGINT,            -- what the platform's API said existed
  storage_key         TEXT,              -- where the file lives, in storage the merchant owns
  sha256              BYTEA,
  error               TEXT
);

-- Exports whose counts don't match the platform's, or that haven't succeeded lately.
SELECT object, MAX(finished_at) FILTER (WHERE status = 'succeeded') AS last_good
FROM export_runs
GROUP BY object
HAVING MAX(finished_at) FILTER (WHERE status = 'succeeded') < NOW() - INTERVAL '7 days'
    OR BOOL_OR(status = 'succeeded' AND record_count <> platform_count);
```

Design notes:

- **Count both sides.** An export that silently drops records is worse than one that fails; comparing the file's count with the platform's own count catches truncation, time-outs and pagination bugs.
- **Download promptly.** Bulk export links expire (a week for Shopify's bulk operations), so the job copies the file into the merchant's storage in the same run.
- **Exports include what migrations need:** media, URL handles for redirects, external IDs and subscription schedules, not only products and orders.

## Auditing

- **Which platform version and extensions ran when.** For a self-hosted store, every release, extension version and patch applied, with dates; a breach investigation or a PCI assessor asks what was running on the day.
- **The SAQ and the evidence behind it.** Which SAQ the merchant validated against, the payment page architecture it relied on, and, for SAQ A with embedded forms, the provider's written confirmation or the script controls used.
- **That exports happened.** Every export run with its counts and checksum, so the merchant can show it held a complete copy of its records.

## What This Means for the System You Build

- **Decide who carries servers, patches, PCI scope, sales-based fees and the exit,** not which feature list is longer.
- **Keep the payment page on the provider's checkout, redirect or hosted fields,** on every option, so scope stays at SAQ A.
- **If you self-host, run it like a production application:** cache rules that never share carts, tested backups, workers that are monitored, and patches within days.
- **Price the whole cost:** plan, sales-based fees, payments, apps, people, upgrades, compliance and downtime.
- **Export your store on a schedule** into storage you own, with counts that prove it's complete.
- **Know where your saved cards live** and whether they can move before you build a subscription business on them.
- **Build your own only when commerce is the product** or the order model doesn't fit, and buy the standardized parts even then.

## References

**Standards**

- [PCI SSC: Important updates for merchants validating to SAQ A (January 30, 2025)](https://blog.pcisecuritystandards.org/important-updates-announced-for-merchants-validating-to-self-assessment-questionnaire-a), the removal of 6.4.3, 11.6.1 and 12.3.1 from SAQ A, the script eligibility criterion and the March 31, 2025 effective date
- [PCI SSC: FAQ 1292](https://www.pcisecuritystandards.org/faq/articles/Frequently_Asked_Question/why-is-there-a-different-approach-for-direct-post-implementations-than-for-iframe-and-url-redirect-what-are-the-technical-differences-and-how-do-they-impact-the-security-of-e-commerce-transactions/), iframe and redirect versus direct post, and any element from the merchant's site ending SAQ A eligibility
- [PCI SSC: FAQ 1588](https://pcisecuritystandards.org/faq/articles/Frequently_Asked_Question/how-does-an-e-commerce-merchant-meet-the-saq-a-eligibility-criteria-for-scripts), the script criterion applies to embedded forms and the two ways to meet it

**Platform documentation**

- [Shopify: PCI compliance](https://www.shopify.com/security/pci-compliant), Level 1 PCI DSS compliance extending to all stores
- [Shopify: Pricing](https://www.shopify.com/pricing), plan prices and the fee for third-party payment providers
- [Shopify Help Center: Exporting products](https://help.shopify.com/en/manual/products/import-export/export-products), CSV without images and emailed exports
- [Shopify Help Center: Exporting customers](https://help.shopify.com/en/manual/customers/import-export-customers), the customer CSV and its columns
- [Shopify: Bulk operations](https://shopify.dev/docs/api/usage/bulk-operations/queries), JSONL output and download links that expire after a week
- [Shopify Help Center: Migrating payment methods](https://help.shopify.com/en/manual/products/purchase-options/subscriptions/migrating-payment-methods), token and card number migration into Shopify
- [Stripe: Request a card data export](https://docs.stripe.com/get-started/data-migrations/pan-export?locale=en-US), exports only to a PCI DSS Level 1 processor, with an AOC and a 4,096-bit PGP key
- [BigCommerce: Pricing](https://www.bigcommerce.com/essentials/pricing/), Scale plan fee, sales threshold and the fee above it
- [Saleor: Pricing](https://saleor.io/pricing), Cloud plans and GMV thresholds
- [Medusa: Pricing](https://medusajs.com/pricing/), Cloud plans and the 0% GMV fee
- [WooCommerce: Server requirements](https://woocommerce.com/document/server-requirements/), WordPress, PHP, database, HTTPS and memory
- [Adobe: Commerce system requirements](https://experienceleague.adobe.com/en/docs/commerce-operations/installation-guide/system-requirements), the 2.4.9 and 2.4.8 stacks
- [Adobe: Commerce release availability](https://experienceleague.adobe.com/en/docs/commerce-operations/release/versions), release dates and support end dates
- [Adobe: Commerce on cloud infrastructure overview](https://experienceleague.adobe.com/en/docs/commerce-on-cloud/user-guide/overview), the automated hosting platform, its pre-provisioned services, regions and Git-based deploys
- [Medusa: Installation](https://docs.medusajs.com/learn/installation), Node.js and PostgreSQL
- [Medusa: General deployment](https://docs.medusajs.com/learn/deployment/general), PostgreSQL, Redis, server and worker deployments and memory
- [Saleor: Configuration](https://docs.saleor.io/setup/configuration), PostgreSQL, cache and Celery broker
- [Sylius: composer.json (2.1)](https://raw.githubusercontent.com/Sylius/Sylius/2.1/composer.json), PHP and Symfony versions
- [Spree: GitHub repository](https://github.com/spree/spree), the BSD-3-Clause core and requirements
- [RubyGems: spree_core](https://rubygems.org/gems/spree_core), version 6.0.0 and its Ruby requirement
- [PrestaShop 9: System requirements](https://devdocs.prestashop-project.org/9/basics/installation/system-requirements/), PHP, database and web server versions
