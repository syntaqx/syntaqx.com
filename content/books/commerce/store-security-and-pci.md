+++
title = "Store Security & PCI"
description = "Magecart e-skimming, PCI DSS 6.4.3 and 11.6.1, SAQ A after 2025, CSP and SRI, tag managers, app scopes, staff 2FA and who secures what on each platform."
category = "Commerce Industry"
order = 2360
part = "Running the Platform"
tags = ["commerce", "security", "pci-dss", "e-skimming", "csp"]
+++

The most valuable page on a store is the one where shoppers type their card numbers, and the most common way it has been attacked is not a break-in to the payment provider but a few lines of JavaScript added to the store's own page. An attacker who can change a script the checkout loads (through a stolen admin password, an unpatched platform, a compromised chat widget or a CDN domain sold to someone new) can copy every card as it's typed and send it to a look-alike domain, for weeks, while every order still succeeds. That family of attacks has a name, Magecart or e-skimming, and since March 31, 2025 PCI DSS has requirements written for it.

This chapter covers the store's security as commerce shapes it: the platform's and the merchant's shares of the work, the e-skimming record from public reports, PCI DSS v4.0.1 requirements 6.4.3 and 11.6.1 for payment pages, SAQ A's eligibility change, Content Security Policy and Subresource Integrity, third-party scripts and tag managers, app and admin permission scopes, staff accounts and two-factor authentication, and patching self-hosted stores, with Adobe Commerce's CosmicSting and SessionReaper as the cautionary cases. PCI DSS itself is the playbook's [PCI DSS](/docs/compliance/pci-dss) (levels, SAQs, the twelve requirements, [Payment Page Scripts](/docs/compliance/pci-dss#payment-page-scripts)); the card vault and keys are the Payments volume's [Card Vault](/books/payments/card-vault) and [Key Management](/books/payments/key-management); the general controls are [Security Headers](/docs/security/security-headers), [Authorization](/docs/security/authorization) and [Vulnerability Management](/docs/security/vulnerability-management). How the payment page sets SAQ scope for each way of running a store is [PCI DSS Scope](/books/commerce/choosing-a-platform#pci-dss-scope). It extends `locations` (the online store) from [The Core Data Model](/books/commerce/commerce-business#the-core-data-model) and `staff` from [Store Operations](/books/commerce/store-operations#how-to-build-it), and adds `payment_page_scripts`, `script_change_events` and `admin_access_grants`.

## How the Platforms Split Responsibility

Every platform is certified for its own part and hands the rest to the merchant. As of October 2026, from their published pages:

| Platform | What the platform covers | What stays with the merchant |
| --- | --- | --- |
| **Shopify** | "Certified Level 1 PCI DSS compliant," covering "all six PCI standard categories," and the compliance "extends by default to all stores powered by Shopify," including "shopping cart and web hosting"; an attestation reissued after each annual assessment and quarterly scan attestations, for logged-in merchants | Staff and collaborator access, the apps it installs and the scopes it grants them, anything it adds to theme pages; checkout customization is limited to sandboxed extensions ([Extending a Hosted Checkout](/books/commerce/cart-and-checkout#extending-a-hosted-checkout)) |
| **Commerce.com (BigCommerce)** | "PCI DSS 4.0 validated at Level 1" as "a PCI-DSS Level 1 Service Provider," with a responsibility matrix that differs for a full storefront, a headless backend and a custom checkout | "Keeping inventory with written justification of any scripts added by the merchant" (through apps and themes too) and "updating Checkout SDK and ensuring the integrity of custom checkout" |
| **Adobe Commerce on cloud infrastructure** | A shared model among "Adobe, the merchant, the cloud service provider, and the content delivery network (CDN) provider"; Adobe "maintains PCI certification for the infrastructure and services used" | "Maintaining security for custom code and integrations with third-party applications" and "applying security and other patches to all custom extensions and code immediately following their release," plus the PCI compliance its customized application needs |
| **Self-hosted open source** (WooCommerce, Magento Open Source, Medusa, Saleor and others) | The payment provider's hosted fields or redirect, if used | Everything else: servers, patches, plugins, admin accounts, scripts, scans |
| **Headless on a hosted backend** | The backend and, if used, its hosted checkout | The storefront's code, hosting and every script on any page that touches payment |

The line moves with one decision: who serves the page where the card is typed. A hosted checkout keeps that page the platform's; a custom checkout, a headless storefront that embeds the provider's form, or a self-hosted store makes it the merchant's, and with it the script requirements below.

## Magecart and E-Skimming

The public record, from regulators' decisions, breach notices and researchers' reports:

| When | Store | What happened | Source |
| --- | --- | --- | --- |
| June 22 to September 5, 2018 | British Airways | Attackers entered through compromised remote-access credentials, then edited "a Javascript file on BA's website" so payment details went to "www.BAways.com"; about 429,612 people affected; the ICO's final penalty, October 16, 2020, was £20 million (proposed at £183.39 million) | ICO penalty notice |
| Fined November 2020 | Ticketmaster UK | A chat bot "installed on its online payment page" was attacked; the ICO fined it £1.25 million in November 2020 over 9.4 million customers across Europe, 1.5 million in the UK, with 60,000 cards subjected to known fraud | ICO annual report |
| August 14 to September 18, 2018 | Newegg | Researchers reported a skimmer of about 15 lines of script sending checkout data to a look-alike domain registered the day before it started (secondary reporting) | Press coverage of the researchers |
| October 7 to 15, 2019 | Macy's | Code added "to two (2) pages on macys.com," the checkout and the account wallet page, captured names, addresses, card numbers, security codes and expiry dates | Notice filed with the California Attorney General |
| June 2024 | polyfill.io | A widely embedded JavaScript CDN domain and its GitHub account changed hands in February 2024, and its script began redirecting mobile visitors on "more than 100 thousand sites"; Cloudflare automatically rewrote polyfill.io links to its own mirror for sites on its free plan | Sansec, Cloudflare |
| Summer 2024 | Adobe Commerce and Magento stores | After CVE-2024-34102 ("CosmicSting"), Sansec reported "seven different groups" hacking "4275 online stores," with about 5% of Adobe Commerce and Magento stores getting a checkout skimmer | Sansec |

Four lessons run through the list:

- **The skimmer runs in the shopper's browser.** The payment provider's systems saw nothing wrong; the cards were copied on the merchant's page before they reached it. That is why the requirements look at the page "as received by the consumer browser," not the server's files.
- **The entry point is rarely the payment code.** Remote access credentials, a chat widget, a CDN domain, an unpatched platform: each was a dependency of the page, not the payment integration.
- **Dwell time is weeks.** British Airways' skimmer ran for more than ten weeks; orders kept succeeding the whole time. Detection has to look for change, because nothing fails.
- **Third parties change hands.** A script that was trustworthy when it was added can be sold, compromised or repurposed later; polyfill.io was a dependency that became an attack overnight.

## PCI DSS v4.0.1 and the Payment Page

PCI DSS v4.0.1, published June 11, 2024, is the current standard; v4.0 retired on December 31, 2024, and the revision added no requirements, though it added applicability notes on payment page scripts and kept the March 31, 2025 date on which the future-dated requirements took effect. Two of those were written for e-skimming:

- **Requirement 6.4.3:** "All payment page scripts that are loaded and executed in the consumer's browser are managed as follows: A method is implemented to confirm that each script is authorized. A method is implemented to assure the integrity of each script. An inventory of all scripts is maintained with written justification as to why each is necessary." It covers the merchant's own scripts and those from third and fourth parties.
- **Requirement 11.6.1:** a change- and tamper-detection mechanism alerts "personnel to unauthorized modification (including indicators of compromise, changes, additions, and deletions) to the HTTP headers and the contents of payment pages as received by the consumer browser," evaluated "at least once every seven days" or at a frequency set by a targeted risk analysis. The standard notes that this does not mean installing software in shoppers' browsers.

In March 2025 the Council published an information supplement, "Payment Page Security and Preventing E-Skimming," as guidance for both. The playbook's [Payment Page Scripts](/docs/compliance/pci-dss#payment-page-scripts) gives the practical reading: a Content Security Policy allowing only inventoried origins, integrity hashes where scripts are versioned, the inventory in the repository beside the page, and a monitor that loads the page from outside and compares what arrives.

For a store the payment page is wider than the card form. A page that embeds the provider's iframe is still a payment page: its own scripts can overlay a fake form or redirect the frame, which is why 6.4.3 applies to the page hosting the iframe but not to the scripts inside it. On a single-page checkout, every script loaded anywhere in the application can be present when the payment step renders, so the inventory is the application's, not one route's.

## SAQ A After 2025

Most stores validate with SAQ A, because their payment page is a redirect or the provider's iframe ([Which SAQ: Architecture Decides](/docs/compliance/pci-dss#which-saq-architecture-decides)). On January 30, 2025 the Council revised it, effective March 31, 2025: it removed requirements 6.4.3, 11.6.1 and 12.3.1 from SAQ A and added an eligibility criterion that the merchant "confirm their site is not susceptible to attacks from scripts that could affect the merchant's e-commerce system(s)," while stating the change does "not remove or diminish the underlying requirements within PCI DSS." FAQ 1588, from February 2025, narrows it: the criterion "only applies to e-commerce merchants with a webpage that includes a TPSP's/payment processor's embedded payment page/form," and is met either with "techniques such as, but not limited to, those detailed in PCI DSS Requirements 6.4.3 and 11.6.1" or by "obtaining confirmation from the merchant's PCI DSS compliant TPSP/payment processor."

What that means by store type:

- **Hosted platform checkout or full redirect.** The criterion doesn't apply; the platform's or provider's attestation covers the payment page. The merchant still answers SAQ A's other questions, including external scans of its e-commerce pages.
- **Embedded iframe or hosted fields on the merchant's page.** The merchant either protects its page itself (script inventory, CSP, integrity, tamper detection) or gets written confirmation from its provider that the embedded form, implemented as instructed, resists script attacks, and follows those instructions exactly.
- **Merchant's own JavaScript building the form.** That is SAQ A-EP, where 6.4.3 and 11.6.1 apply in full ([PCI DSS Scope](/books/commerce/choosing-a-platform#pci-dss-scope)).

My default for a store I build: redirect or the provider's iframe, nothing else on the payment step but what the inventory justifies, and the 6.4.3 and 11.6.1 controls anyway, because a provider's written confirmation covers its form, not the page around it.

## CSP and SRI

The browser's own controls are how a store meets "authorized" and "integrity" without trusting every script it loads:

- **Content Security Policy** lists the origins scripts may load from, per page ([Content Security Policy](/docs/security/security-headers#content-security-policy)). On a payment page the list is the inventory: the store's own origin, the provider's script origin and the few others with a written justification. Nonces (a random value per response, allowed only for scripts that carry it) beat host allowlists, because an allowlisted CDN can serve anyone's file.
- **Report-only first.** `Content-Security-Policy-Report-Only` reports violations without enforcing them; MDN notes it needs `report-to` (the older `report-uri` is deprecated) and can't be set in a `meta` element. A store runs the policy in report-only mode long enough to see every legitimate script, then enforces ([Rolling Out CSP](/docs/security/security-headers#rolling-out-csp)). The reports are also a tamper signal: a new script origin on the checkout is exactly what 11.6.1 wants to alert on.
- **Subresource Integrity** pins a script's content: an `integrity` attribute with a `sha256`, `sha384` or `sha512` hash, and for a cross-origin script the `crossorigin` attribute and CORS, after which a browser that receives different bytes will "refuse to load the resource, and return a network error." Newer browsers also accept an `Integrity-Policy` header that requires integrity on scripts.

SRI only fits versioned files. A provider's script that changes without notice (many payment SDKs and analytics tags are evergreen by design) breaks under a pinned hash, so the pattern is integrity on everything versioned, a nonce-based CSP on everything else, and tamper detection over both. And a store behind a CDN that rewrites or injects scripts (the polyfill.io rewrite skipped responses that carried a CSP header) needs to know what its CDN does to the page.

## Third-Party Scripts and Tag Managers

A typical storefront loads analytics, advertising pixels, reviews, chat, personalization, A/B testing, consent banners and affiliate tags, most of them added by marketing through apps or a tag manager ([Storefronts](/books/commerce/storefronts#speed-and-conversion)). Each is code with the full power of the page, and a tag manager is a script whose job is to load other scripts chosen outside the engineering release process, which is the opposite of an inventory.

What works:

- **Keep tag managers off the payment step.** The checkout page loads the inventory and nothing else; marketing measures checkout through server-side events or a sandboxed pixel that sees events, not the DOM, as Shopify's checkout pixels do ([Extending a Hosted Checkout](/books/commerce/cart-and-checkout#extending-a-hosted-checkout)).
- **Where a tag manager must run, give it a nonce.** Google's guidance for Tag Manager under CSP recommends a nonce in `script-src-elem` with its nonce-aware snippet, after which "Tag Manager will then propagate the nonce to any scripts that it adds to the page"; its custom JavaScript variables then need `'unsafe-eval'` or don't run. That keeps the policy honest about what loads, and the propagation is itself a reason not to run one on a payment page.
- **Self-host what can be self-hosted.** A copy of a library served from the store's own origin with a pinned hash can't be changed by someone who buys the CDN's domain.
- **Review the inventory on a schedule.** Each script has an owner, a justification and a removal date if it's for a campaign; scripts nobody claims are removed.

## App and Admin Permissions

Apps are the other third party, with access to data instead of the page ([Extensibility: Apps, Webhooks and Functions](/books/commerce/commerce-architecture#extensibility-apps-webhooks-and-functions)):

- **Scopes are the permission.** Shopify's `read_orders` "provides read access and `write_orders` provides read and write access" to the last 60 days of orders, with `read_all_orders` for older ones, and the guidance is to "request only the data your app needs to function." Commerce.com's OAuth scopes come in read-only and modify pairs (`store_v2_orders`, `store_v2_orders_read_only`), and store-level tokens' scopes can't be changed after creation: a wider grant means a new token.
- **Customer data is a scope of its own.** Shopify's protected customer data covers "any data that directly relates to a customer," with name, address, phone and email requested field by field at level 2; level 1 requires data minimization, stated purposes, consent and retention limits, and level 2 adds encrypted backups, separated test and production data, restricted staff access and access logs.
- **An app's access is the merchant's decision and the merchant's exposure.** The staff member who approves an install grants the scopes; a review of installed apps (what each can read and write, who approved it, whether it's still used) belongs in the same schedule as the script inventory, and an unused app is uninstalled, which revokes its token.

## Staff Accounts and Two-Factor Authentication

The admin is the attacker's shortest path to everything above: an admin session can add a script to the theme, install an app with wide scopes, issue refunds to a card it controls or change the payout bank account. The controls are ordinary identity hygiene applied to commerce's dangerous actions ([Authentication](/docs/security/authentication), [Least Privilege](/docs/security/authorization#least-privilege)):

- **Two-step authentication on every admin account.** On Shopify it is "recommended for new users" by default and set per user, and Plus stores can "require a secure sign-in method for all users"; partners "must activate two-step authentication to use a collaborator account." A store that can require it should.
- **Collaborators are guests with expiry.** Shopify's collaborator accounts (agencies, developers) need a request code the store generates, can have their permissions edited before acceptance, and lose access automatically after 90 days without a login. The same shape fits any store: outside access is requested, scoped, approved by an owner and time-boxed ([Support Access](/docs/security/support-access)).
- **Permissions by action, not by title.** Theme and checkout code, app installation, refunds above a limit, payout and bank details, staff management and data export are separate permissions, the online counterpart of the register's per-action limits in [Staff, Roles and Permissions](/books/commerce/store-operations#staff-roles-and-permissions).
- **Step-up and a second person for money and code.** A change to the payout account or a new script on the checkout requires re-authentication and, for the payout, a hold or a second approver; DoorDash's step-up for merchant bank account changes is the pattern ([Account Takeover](/books/commerce/refunds-and-delivery-fraud#account-takeover)).
- **Offboarding is immediate and total.** Removing a person removes their admin login, their collaborator access, their API tokens and their apps' approvals at once.

## Patching Self-Hosted Stores

A self-hosted store runs the platform's vulnerabilities on its own servers, and the time between a patch and exploitation is short ([Remediation Targets](/docs/security/vulnerability-management#remediation-targets)). Adobe Commerce is the public case study:

- **CosmicSting (CVE-2024-34102).** An XML external entity flaw that "could result in arbitrary code execution," rated CVSS 9.8, patched in Adobe's security update of June 11, 2024, with an isolated patch on June 28 and a hotfix on July 17; Adobe said it had been "exploited in the wild in very limited attacks," CISA added it to its Known Exploited Vulnerabilities catalog on July 17, 2024, and patching required rotating the store's encryption key as well. Sansec reported that 75% of the install base was unpatched when key-scanning began, and the skimming campaigns above followed.
- **SessionReaper (CVE-2025-54236).** An input validation flaw allowing session takeover (CVSS 9.1), patched in Adobe's emergency bulletin of September 9, 2025 after Adobe privately warned selected customers on September 4; Sansec counted fewer than one in three stores patched on September 19 and 38% on October 23, and reported attacks from October 22, after a public technical write-up. CISA added it to the catalog on October 24, 2025.
- **The patch cadence.** Adobe now "delivers monthly isolated security patches on Patch Tuesday (the second Tuesday of the month)," not cumulative and applied in sequence, alongside cumulative `-pN` releases for supported lines; a store on an unsupported release line gets neither ([Magento and Adobe Commerce](/books/commerce/choosing-a-platform#magento-and-adobe-commerce)).

WooCommerce shows the plugin side of the same risk: on March 22, 2023 a vulnerability in WooCommerce Payments (versions 4.8.0 to 5.6.1) "could permit unauthorized admin access to impacted stores," and WooCommerce and the WordPress.org plugins team pushed updates to affected sites automatically. Every extension is platform code for this purpose.

The practices that follow: a named owner and a deadline for every critical patch (days, not the next sprint), the ability to apply an isolated patch without a full upgrade, secret and key rotation as part of the patch when the vulnerability could have exposed them, a web application firewall rule as a stopgap while patching ([Emergency Rules and Virtual Patching](/books/hosting-and-cloud/waf-bots-and-rate-limits#emergency-rules-and-virtual-patching)), and the script monitor watching the checkout for the skimmer that follows an unpatched window.

## How to Build It

The script inventory, its change history and admin access are records the store keeps for itself and for its assessor:

```sql
CREATE TABLE payment_page_scripts (      -- the 6.4.3 inventory: every script, why, and how pinned
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id      UUID NOT NULL REFERENCES locations (id),  -- the online store
  storefront_id    UUID REFERENCES storefronts (id),
  page             TEXT NOT NULL,          -- 'checkout', 'payment_step', 'account_wallet'
  src              TEXT NOT NULL,          -- the URL, or 'inline:<sha256>'
  owner_party      TEXT NOT NULL CHECK (owner_party IN ('first_party', 'third_party',
                     'fourth_party', 'payment_provider')),
  vendor           TEXT,
  justification    TEXT NOT NULL,          -- written business or technical reason
  owner            TEXT NOT NULL,          -- the person or team accountable for it
  integrity        TEXT,                   -- the SRI hash pinned, null for evergreen scripts
  csp_directive    TEXT NOT NULL,          -- how CSP allows it: 'nonce', 'hash', 'host'
  authorized_by    TEXT NOT NULL,
  authorized_at    TIMESTAMPTZ NOT NULL,
  remove_by        DATE,                   -- for campaign and test scripts
  removed_at       TIMESTAMPTZ,
  UNIQUE (location_id, page, src)
);

CREATE TABLE script_change_events (      -- the 11.6.1 record: what the browser received changed
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  location_id      UUID NOT NULL REFERENCES locations (id),
  page             TEXT NOT NULL,
  source           TEXT NOT NULL CHECK (source IN ('synthetic_monitor', 'csp_report',
                     'deploy', 'vendor_notice')),
  kind             TEXT NOT NULL CHECK (kind IN ('script_added', 'script_removed',
                     'script_content_changed', 'header_changed', 'csp_violation')),
  script_id        UUID REFERENCES payment_page_scripts (id),  -- null: not in the inventory
  observed_src     TEXT,
  observed_hash    TEXT,                   -- sha256 of the bytes as received
  header_name      TEXT,                   -- for header changes: CSP, HSTS, X-Frame-Options
  observed_value   TEXT,
  release_ref      TEXT,                   -- the deploy it matches, if any
  observed_at      TIMESTAMPTZ NOT NULL,
  disposition      TEXT CHECK (disposition IN ('authorized', 'false_positive',
                     'incident')),
  disposed_by      TEXT,
  disposed_at      TIMESTAMPTZ
);
CREATE INDEX script_change_open ON script_change_events (location_id, observed_at)
  WHERE disposition IS NULL;

CREATE TABLE admin_access_grants (       -- online admin access: staff, collaborators, apps
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  merchant_id      UUID NOT NULL REFERENCES merchants (id),
  grantee_kind     TEXT NOT NULL CHECK (grantee_kind IN ('staff', 'collaborator', 'app',
                     'api_token')),
  staff_id         UUID REFERENCES staff (id),
  app_installation_id UUID REFERENCES app_installations (id),
  grantee_ref      TEXT,                   -- the collaborator's account or token name
  permissions      TEXT[] NOT NULL,        -- 'theme.edit', 'checkout.scripts', 'apps.install',
                                           -- 'refunds.issue', 'payouts.edit', 'data.export'
  requires_mfa     BOOLEAN NOT NULL DEFAULT TRUE,
  mfa_enrolled_at  TIMESTAMPTZ,
  granted_by       UUID REFERENCES staff (id),
  during           TSTZRANGE NOT NULL,     -- collaborators and tokens always end
  last_used_at     TIMESTAMPTZ,
  revoked_at       TIMESTAMPTZ,
  revoked_reason   TEXT,
  CHECK ((grantee_kind = 'staff') = (staff_id IS NOT NULL)),
  CHECK ((grantee_kind = 'app') = (app_installation_id IS NOT NULL)),
  CHECK (grantee_kind = 'staff' OR NOT upper_inf(during))
);
```

The monitor compares what it received with the inventory; anything unmatched is an event to dispose of:

```sql
-- Scripts the browser received on the payment page that the inventory doesn't authorize,
-- or whose bytes differ from the pinned hash, in the last monitor run.
SELECT e.observed_src, e.observed_hash, e.observed_at
FROM script_change_events e
LEFT JOIN payment_page_scripts s
  ON s.location_id = e.location_id AND s.page = e.page AND s.src = e.observed_src
 AND s.removed_at IS NULL
WHERE e.location_id = $1 AND e.page = 'payment_step'
  AND e.observed_at >= $run_started
  AND (s.id IS NULL OR (s.integrity IS NOT NULL AND s.integrity <> e.observed_hash));

-- Admin grants that should be reviewed: dangerous permissions without MFA, or idle 90 days.
SELECT id, grantee_kind, permissions, last_used_at
FROM admin_access_grants
WHERE revoked_at IS NULL AND during @> NOW()
  AND ((permissions && '{checkout.scripts,payouts.edit,apps.install,data.export}'
        AND mfa_enrolled_at IS NULL)
       OR last_used_at < NOW() - INTERVAL '90 days');
```

Design notes:

- **The inventory is generated as well as declared.** The deploy pipeline writes the scripts each release puts on the payment page and fails a release that adds one without an inventory row; the monitor's view of the live page is the check that the declaration is true.
- **The monitor sees what the shopper sees.** It loads the payment page from outside, as a browser, on the schedule a targeted risk analysis sets (at least weekly by the standard's default; on every deploy and hourly at peak is my preference), hashes every script and the security headers, and writes an event for each difference; a CSP violation report is an event from the field between runs.
- **Every event gets a disposition.** Authorized (it matches a deploy), false positive, or incident; an undisposed change on the payment page is an open alert, and an incident starts the [When Card Data Is Exposed](/books/payments/operating-the-platform#when-card-data-is-exposed) process.
- **Grants end.** Collaborator and token grants must have an end; staff grants end when the person leaves, through the same `staff` status that stops their PIN at the register.
- **Dangerous permissions are named.** Checkout scripts, payout details, app installation and data export are separate permissions with MFA required, so a review is a query, not an audit of roles.
- **Emit `script_change.detected`, `admin_grant.created`, `admin_grant.revoked` and `app.installed`** to the security channel, with the payment page's events paging someone.

## Auditing

- **The script inventory over time,** with each script's justification, authorizer and removal, as the 6.4.3 evidence an assessor asks for.
- **Every tamper check and its result,** including runs that found nothing, with dispositions for every change, as the 11.6.1 evidence.
- **Provider confirmations,** where SAQ A eligibility relies on the provider's written statement about its embedded form, stored as documents with their dates.
- **Every admin grant, use and revocation,** with MFA status, approver and the actions taken under it ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Every security patch,** with its release date, the date applied, and any key rotation it required.

## What This Means for the System You Build

- **Keep the payment page the provider's or the platform's** wherever you can, and know exactly which page is yours where you can't.
- **Inventory every script on the payment page** with an owner and a justification, enforce it with a nonce-based CSP and integrity hashes, and fail releases that add unlisted scripts.
- **Watch the page as the browser receives it,** on a schedule and from CSP reports, and dispose of every change.
- **Keep tag managers and marketing scripts off the payment step;** measure checkout with server-side events or sandboxed pixels.
- **Grant apps the narrowest scopes,** review installations and remove unused ones.
- **Require two-factor authentication for every admin,** time-box collaborators and tokens, and step up for payouts and code.
- **Patch self-hosted stores in days,** rotate keys when the flaw could have exposed them, and treat every extension as platform code.

## References

**Standards**

- [PCI SSC: Just published, PCI DSS v4.0.1 (June 11, 2024)](https://blog.pcisecuritystandards.org/just-published-pci-dss-v4-0-1), the revision, v4.0's retirement and the March 31, 2025 date
- [PCI SSC: SAQ A v4.0](https://listings.pcisecuritystandards.org/documents/PCI-DSS-v4-0-SAQ-A.pdf), the text of requirements 6.4.3 and 11.6.1
- [PCI SSC: Important updates for merchants validating to SAQ A (January 30, 2025)](https://blog.pcisecuritystandards.org/important-updates-announced-for-merchants-validating-to-self-assessment-questionnaire-a), the removed requirements and the new eligibility criterion
- [PCI SSC FAQ 1588: How does an e-commerce merchant meet the SAQ A eligibility criteria for scripts?](https://www.pcisecuritystandards.org/faq/articles/Frequently_Asked_Question/how-does-an-e-commerce-merchant-meet-the-saq-a-eligibility-criteria-for-scripts/), embedded forms only, and the two ways to meet it
- [PCI SSC: New information supplement, Payment Page Security and Preventing E-Skimming (March 10, 2025)](https://blog.pcisecuritystandards.org/new-information-supplement-payment-page-security-and-preventing-e-skimming), the guidance for 6.4.3 and 11.6.1
- [MDN: Content-Security-Policy-Report-Only](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy-Report-Only), report-only mode and its reporting directives
- [MDN: Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity), hashes, CORS and the failure behavior
- [Google: Use Tag Manager with a Content Security Policy](https://developers.google.com/tag-platform/security/guides/csp), nonces and their propagation

**Regulators and incident records**

- [ICO: Penalty notice to British Airways (October 16, 2020)](https://ico.org.uk/media2/migrated/2618421/ba-penalty-20201016.pdf), the attack, the people affected and the penalty
- [ICO: Annual report 2020/21](https://ico.org.uk/media2/migrated/2620166/hc-354-information-commissioners-ara-2020-21.pdf), the Ticketmaster UK fine and the chat bot on the payment page
- [Macy's: Notice of data breach (California Attorney General, November 14, 2019)](https://oag.ca.gov/system/files/All%20State%20MCOM%20Consumer%20Notice%20Proof%20111419.pdf), the pages and data affected
- [The Hacker News: Newegg credit card hack (September 2018)](https://thehackernews.com/2018/09/newegg-credit-card-hack.html), researchers' account of the Newegg skimmer
- [Sansec: Polyfill supply chain attack (June 25, 2024)](https://sansec.io/research/polyfill-supply-chain-attack), the domain's sale and the sites affected
- [Cloudflare: Automatically replacing polyfill.io links (June 26, 2024)](https://blog.cloudflare.com/automatically-replacing-polyfill-io-links-with-cloudflares-mirror-for-a-safer-internet), the mirror rewrite and its CSP exception
- [NVD: CVE-2024-34102](https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2024-34102), the CosmicSting flaw, its score and its KEV listing
- [CISA: Three known exploited vulnerabilities added (July 17, 2024)](https://www.cisa.gov/news-events/alerts/2024/07/17/cisa-adds-three-known-exploited-vulnerabilities-catalog), CVE-2024-34102 in the catalog
- [Adobe Experience League: Security update for APSB24-40](https://experienceleague.adobe.com/en/docs/commerce-knowledge-base/kb/troubleshooting/known-issues-patches-attached/security-update-available-for-adobe-commerce-apsb24-40-revised-to-include-isolated-patch-for-cve-2024-34102), patch dates, exploitation and key rotation
- [Sansec: CosmicSting fallout (October 1, 2024)](https://sansec.io/research/cosmicsting-fallout), the groups, the stores hacked and the unpatched share
- [NVD: CVE-2025-54236](https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2025-54236), the SessionReaper flaw, its score and its KEV listing
- [Sansec: SessionReaper](https://sansec.io/research/sessionreaper), the private warning, patch rates and the start of attacks
- [WooCommerce Developer Blog: Critical vulnerability detected in WooCommerce Payments (March 23, 2023)](https://developer.woocommerce.com/2023/03/23/critical-vulnerability-detected-in-woocommerce-payments-what-you-need-to-know/), the affected versions and automatic updates

**Platform documentation**

- [Shopify: PCI compliance](https://www.shopify.com/security/pci-compliant), Level 1 certification extending to every store
- [Shopify Help Center: Compliance reports](https://help.shopify.com/en/manual/privacy-and-security/account-security/compliance-reports), the attestation and quarterly scans
- [Shopify: Access scopes](https://shopify.dev/docs/api/usage/access-scopes), order scopes and least privilege
- [Shopify: Protected customer data](https://shopify.dev/docs/apps/launch/protected-customer-data), the two levels and their requirements
- [Shopify Help Center: Two-step authentication](https://help.shopify.com/en/manual/your-account/users/security/two-step-authentication), the default and requiring it on Plus
- [Shopify Help Center: Collaborator accounts](https://help.shopify.com/en/manual/your-account/users/security/collaborator-accounts), request codes, required two-step authentication and expiry
- [Commerce.com Support: PCI compliance](https://support.bigcommerce.com/articles/en_US/Knowledge/PCI-Compliance), the platform's validation and the merchant's responsibilities
- [Commerce.com: API accounts](https://docs.bigcommerce.com/docs/start/authentication/api-accounts), scopes and fixed store-level tokens
- [Adobe Experience League: Shared responsibility security and operational model](https://experienceleague.adobe.com/en/docs/commerce-operations/security-and-compliance/shared-responsibility), the parties and the merchant's duties
- [Adobe Experience League: Monthly isolated security patching policy](https://experienceleague.adobe.com/en/docs/commerce-operations/release/planning/monthly-isolated-security-patches), Patch Tuesday isolated patches and cumulative releases
