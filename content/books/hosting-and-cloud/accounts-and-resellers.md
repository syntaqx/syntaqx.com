+++
title = "Accounts, Organizations & Resellers"
nav_title = "Accounts & Resellers"
description = "Account hierarchies across clouds and hosts, IAM and API keys, reseller and white-label models, and account standing from warning to suspension and closure."
category = "Hosting & Cloud Industry"
order = 2103
part = "The Business"
tags = ["accounts", "iam", "resellers", "multi-tenancy", "suspension"]
+++

Every provider answers the same three questions with its account model: who pays, who may do what, and where do policies and limits apply. The answers differ in shape. AWS answers with an organization of accounts, Azure with a tenant of management groups and subscriptions billed through a separate billing hierarchy, Google Cloud with an organization of folders and projects linked to billing accounts, DigitalOcean and Vercel with teams of projects, Cloudflare with accounts of zones and a tenant layer for partners, and cPanel with a root server that hands resellers a slice of itself. Underneath, each model separates the payer from the scope from the person, and each one has had to add a layer for the customers who resell to their own customers.

The model matters beyond billing. A suspension for non-payment has to know which resources to stop; an abuse report has to resolve to the account holding an address; a leaked API key has to be scoped tightly enough that its blast radius is one project, not the company; a reseller's customer has to be suspendable without suspending the reseller, and the reseller's unpaid invoice has to be able to stop all of them. This chapter surveys how providers build the hierarchy, the credentials, the reseller layer and account standing, and extends [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with organizations of projects, members, roles, credentials and reseller agreements.

## How the Providers Do It

| Provider | Payer | Scope for resources and policy | Grouping above scope | Notes, as of October 2026 |
| --- | --- | --- | --- | --- |
| **AWS** | The organization's management account "is responsible for paying all charges accrued by the accounts in its organization" | Member accounts; each belongs to one organization at a time | Organizational units under one root, nested five levels deep | Default quota of 10 accounts per organization, adjustable; service control policies set maximum permissions and "do not grant permissions" |
| **Azure** | A billing account, with billing profiles (one invoice each) and invoice sections under the Microsoft Customer Agreement | Subscriptions, then resource groups | Management groups up to six levels below the tenant root group, which shares the Microsoft Entra tenant's ID | The billing hierarchy and the resource hierarchy are separate trees |
| **Google Cloud** | A Cloud Billing account, which "defines who pays for a given set of Google Cloud resources" | Projects, "the fundamental organizing entity" | Folders (optional, nestable) under an organization | IAM granted on a folder is inherited by every folder and project in it; projects don't inherit IAM from the billing account |
| **DigitalOcean** | The team, unless the team is in an organization that consolidates billing | Projects group resources | Organizations above teams | Six predefined team roles: Owner, Biller, Billing Viewer, Member, Modifier, Resource Viewer |
| **Cloudflare** | The account | Zones (domains) inside the account | Tenants, for channel and alliance partners: "a special type of Cloudflare account that contains other accounts" | Roles are account-scoped or domain-scoped; an Administrator "cannot manage members nor billing profile" |
| **Vercel** | The personal account or the team (Pro and Enterprise) | Projects | None | A "default team" is used when an API or CLI call names none |
| **cPanel & WHM** | The server's owner (root), who bills resellers | cPanel accounts on one server | Resellers with access control lists and resource limits | Packages and feature lists set each account's limits and tools |

Three patterns run through the table:

- **The payer is a separate object from the scope.** Only Vercel and Cloudflare (for most customers) make the account both; everyone at scale splits them, because one company pays for many teams' environments and one team's environment can move between payers.
- **Policy flows down a tree, and denial beats permission.** AWS requires an SCP allow at every level from the root to the account, and a deny at any level applies to everything below it; Google Cloud's effective policy on a resource is its own plus everything it inherits. The tree exists so a security team can set a ceiling once and every project lives under it.
- **The partner layer is bolted on.** Cloudflare's tenant, Google Cloud's billing subaccounts, AWS Billing Conductor and Microsoft's Cloud Solution Provider program each arrived after the core account model and each adds a parent that pays, sees or administers its customers' accounts without being them.

## Payer, Scope and Person

Every hierarchy has the same three kinds of node, whatever it calls them:

- **The payer** signs the contract, gets the invoice and holds standing. In this volume it is the `account`, and it is the tenant ([Tenancy, money and time](/books/hosting-and-cloud/hosting-and-cloud-business#tenancy-money-and-time)).
- **The scope** holds resources, permissions, quotas and budgets. In this volume it is the `project`: an AWS member account, an Azure subscription, a Google Cloud project, a Vercel or DigitalOcean project, a cPanel account. Scopes nest under organization units (OUs, management groups, folders) for policy, never for payment.
- **The person or workload** acts. Human users belong to the account through memberships with roles; workloads act through service principals with credentials. Neither is the account: a person can belong to several accounts, and an account outlives every employee who set it up.

The mapping isn't perfect, and the places it strains are the places to decide deliberately. An AWS member account is technically an account with its own root user, so a provider modeling AWS-style isolation gives each project its own credentials boundary even though the payer is above it. An Azure billing profile is a sub-invoice inside one contract; in this model it is an invoice grouping on the account, not a second payer. A DigitalOcean organization consolidating several teams' billing is an account whose teams are sub-accounts billed by the parent, the same shape as a reseller without the markup.

## Identity, IAM and API Keys

The general rules for authentication and authorization are the playbook's ([Authentication](/docs/api-design/authentication), [Authorization](/docs/security/authorization)). What a provider adds is that its credentials can launch infrastructure that costs money by the second and can be abused at the provider's expense, so the industry's defaults have converged on a few hard rules:

- **The account's original owner credential is for emergencies.** AWS "strongly recommend[s]" not using the root user unless a task requires it, and creating an administrative user for everyday work instead; it advises against creating root access keys at all.
- **Temporary credentials over long-lived keys.** AWS's IAM best practices require humans to use federation with temporary credentials and workloads to use roles, "relying on temporary credentials instead of creating long-term credentials such as access keys." Google Cloud tells customers to treat user-managed service account keys "as an exception rather than the norm" and to set the organization policy that disables key creation at the organization root.
- **A key says what it is.** AWS long-term access key IDs begin `AKIA` and temporary STS key IDs `ASIA`, and an IAM user can hold at most two access keys, enough to rotate without downtime. Prefixes like these are what let secret scanners recognize a leaked key, the practice the playbook's [Prefixes Say What a Key Is](/docs/api-design/authentication#prefixes-say-what-a-key-is) recommends.
- **Scope keys narrowly, and make them expire.** DigitalOcean's personal access tokens take custom scopes, each "correlat[ing] to one public API endpoint," that can't be edited after creation, and an expiry chosen at creation. Vercel tokens are scoped to the full account, a single team or a single project, with an expiration. Cloudflare says to use API tokens instead of the Global API Key, which has the user's full permissions, can't be restricted by IP and doesn't expire.
- **Plan for leaks.** GitHub's secret scanning partner program lets a provider register its token formats, and GitHub sends a payload to the provider's endpoint when one appears in a public repository. A provider that registers can revoke or quarantine the key before it is used, the subject of [Free-Tier Fraud & Stolen Keys](/books/hosting-and-cloud/free-tier-fraud-and-stolen-keys#stolen-keys).

Staff access to customer accounts is a separate problem with its own playbook doc, [Support Access](/docs/security/support-access): delegation rather than impersonation, a reason for every session, time-boxed and visible to the customer.

## Resellers and White Label

A reseller buys from the provider and sells to its own customers, under its own brand or the provider's, at its own price. The models differ in who the end customer contracts with, who holds the accreditation or license, and who answers for abuse:

| Model | Who contracts with the end customer | What the provider gives the reseller | Who answers for the end customer |
| --- | --- | --- | --- |
| **WHM reseller** | The reseller | A share of a server: account, disk and bandwidth limits, privileges grouped as Basic, Standard, Package, Global, Super and Root Access, its own nameservers (ns1 to ns4) | The reseller first; the server owner ultimately, because the server and IPs are its own |
| **Registrar reseller** | The reseller, under an agreement that must identify the sponsoring registrar | Registration through the registrar's accreditation, usually white-label (OpenSRS sells storefronts, control panels and an API with no monthly fees) | The registrar: under the 2013 RAA it "is responsible for the provision of Registrar Services" for names sold through resellers and must enforce its reseller agreements |
| **ISV under 10DLC** | The ISV's customer, as a separate texting brand | Registration APIs: a primary customer profile for the ISV's own brands, and Twilio's preferred design of a secondary customer profile and a brand per customer in that customer's subaccount | Each brand, for its own campaigns; the ISV for registering them truthfully |
| **Microsoft Cloud Solution Provider** | The partner (direct bill) or an indirect reseller buying through a distributor | Licenses and Azure at partner prices, and administration through granular delegated admin privileges the customer must grant | The partner bills and supports; the customer must still accept the Microsoft Customer Agreement |
| **AWS channel partner** | The partner, billing its customers | AWS Billing Conductor: billing groups, pricing plans and rules, and custom line items that produce pro forma cost data with markups or discounts, without changing the actual AWS invoice | The partner for its customers; AWS for the underlying accounts |
| **Google Cloud reseller** | The reseller | Billing subaccounts, "intended for resellers," paid by a parent billing account on invoiced billing; the Cloud Channel API for distributors, resellers and customer entitlements | The reseller for its customers |
| **Cloudflare partner** | The partner | A tenant containing customer accounts and zones, provisioned through the Tenant API; tenant admins are Super Administrators of every account inside | The partner first |

Three things decide whether a reseller program holds up:

- **Overselling is a choice, and it should be explicit.** WHM lets the server owner enable overselling per resource; without it, "resellers can only assign quotas that add up to the amount that you set." A provider that allows it has decided to absorb noisy neighbors; one that doesn't has decided to sell capacity it can guarantee.
- **The accreditation holder stays responsible.** ICANN's contract puts the registrar on the hook for its resellers' conduct: resellers may not use ICANN's logo or claim accreditation (section 3.12.1), their agreements must carry the required terms and name the sponsoring registrar (3.12.2), and the registrar must enforce its agreement to cure a reseller's breach (3.12.6). Carriers treat texting registration the same way, through the ISV. The data model has to record which end customer sits behind each reseller sub-account, because the accredited party must be able to answer for them.
- **Know-your-customer reaches through resellers, or it doesn't.** The Commerce Department's 2024 proposed rule for infrastructure-as-a-service providers (RIN 0694-AJ35) would have required US providers to verify the identity of foreign customers and to deal only with foreign resellers that maintain their own customer identification programs. The Unified Agenda lists the rulemaking as withdrawn on December 16, 2025, as of October 2026. Nothing requires reseller-level KYC for US IaaS today, but the design question it raised remains: a provider whose sub-accounts are opaque can't screen, attribute abuse or respond to a court order for the people behind them ([Sanctions, Exports & Bulletproof Hosts](/books/hosting-and-cloud/sanctions-and-bulletproof-hosts)).

The payments version of this problem, with sub-merchants, ISOs and residuals, is in [Payments for Software Platforms](/books/payments/software-platforms#the-hierarchy) and [Partners & Residuals](/books/payments/partners-and-residuals); the hosting version differs mainly in that the reseller's customers run things on the provider's infrastructure, so their abuse is the provider's abuse.

## Account Standing

Every provider has a ladder from good standing to deletion, and every ladder has the same rungs: a warning, a restriction that stops new spending, a suspension that stops running things, a closure with a window to recover, and deletion. What varies is how long each rung lasts and whether the provider publishes it:

| Provider | States or stages | Clocks published, as of October 2026 |
| --- | --- | --- |
| **AWS** | Suspension "immediately upon notice" for security risk, harm, liability or fraud; material breach; breach of payment obligations; or the customer ceasing operations or entering bankruptcy (Customer Agreement, section 4.1). Account closure, then reopening possible during a post-closure period | Post-closure period of 90 days, after which content is deleted and the account ID is never reused. For 30 days after termination of the agreement, AWS won't remove content because of termination, and retrieval requires all amounts paid (section 5.3(b)). Termination for convenience needs at least 30 days' notice (5.2(a)) |
| **Azure** | Active; Past Due (payment outstanding, everything still works); Warned (read and delete only, resources offline but recoverable); Disabled (VMs deallocated, temporary IPs freed, storage read-only); Expired (cancelled, reactivatable); Deleted | A disabled subscription can stay disabled from 1 to 90 days, depending on type, before permanent deletion |
| **Google Cloud** | Billing disabled on a project: "all billable services within that project are stopped," and some resources may be deleted. Under the terms: suspension for an AUP violation after notice and 24 hours to correct (section 4.1), immediate suspension to protect the services or for unauthorized access (4.2), and for late payment (2.4) | A shut-down project is recoverable for 30 days, then deleted; recovery doesn't relink billing |
| **DigitalOcean** | Past due (resources run, no new ones); suspended (resources powered down, logins redirected to the payment page); deletion, after which "deleted resources cannot be recovered" | "DigitalOcean does not publish fixed timelines for these stages" |

The ladder maps onto [the core model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model)'s holds. Past due is a `no_new_resources` hold for `non_payment`; Azure's Warned and DigitalOcean's suspended are `stop_resources`; Disabled with storage read-only is `read_only`; an abuse or fraud suspension is `full_suspension` with its case. Closure sets `accounts.status = 'closed'` and starts the retention clock. My default ladder for a new provider: restrict new resources the day a payment fails, stop running resources only after notices and a stated grace period, keep data intact and retrievable for at least 30 days after suspension or closure, and publish each clock, because a customer who knows the timeline pays before it ends and a regulator reading the terms can see it's fair. [Invoices, Dunning & Suspension](/books/hosting-and-cloud/invoices-dunning-and-suspension) owns the dunning side; [Abuse on Infrastructure](/books/hosting-and-cloud/abuse-on-infrastructure) owns the abuse side.

Two rules make standing safe for resellers:

- **Holds cascade down, not up.** A hold on a reseller for non-payment applies to every sub-account it bills, because the provider's money comes from the reseller; a hold on one sub-account for abuse doesn't touch the reseller or its other customers.
- **The narrowest hold first.** Abuse on one site is a mitigation on that resource ([Suspension Versus Takedown](/books/user-generated-platforms/abuse-desks#suspension-versus-takedown)); a pattern across a sub-account is a hold on it; only a pattern across the reseller's book, or the reseller's own conduct, holds the reseller.

## How to Build It

The chapter adds organization units, users and memberships, roles and bindings, service principals and their credentials, reseller agreements and white-label brands to [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model), and a cascade flag on holds. Accounts remain the tenant; everything here carries `account_id`.

```sql
CREATE TABLE organization_units (        -- OUs, management groups, folders: policy, not payment
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id  UUID NOT NULL REFERENCES accounts (id),
  parent_id   UUID REFERENCES organization_units (id),  -- null: directly under the account
  name        TEXT NOT NULL,
  depth       SMALLINT NOT NULL CHECK (depth BETWEEN 1 AND 6),  -- a stated limit, like Azure's
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE projects
  ADD COLUMN organization_unit_id UUID REFERENCES organization_units (id);

CREATE TABLE users (                     -- a person; belongs to accounts through memberships
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  email         TEXT NOT NULL,
  email_key     TEXT NOT NULL UNIQUE,    -- normalized
  mfa_enrolled  BOOLEAN NOT NULL DEFAULT FALSE,
  status        TEXT NOT NULL CHECK (status IN ('active', 'locked', 'deactivated')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE account_members (
  id            UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id    UUID NOT NULL REFERENCES accounts (id),
  user_id       UUID NOT NULL REFERENCES users (id),
  is_owner      BOOLEAN NOT NULL DEFAULT FALSE,  -- the emergency credential holder
  valid_during  TSTZRANGE NOT NULL,
  EXCLUDE USING GIST (account_id WITH =, user_id WITH =, valid_during WITH &&)
);

CREATE TABLE service_principals (        -- a workload identity; never a person
  id          UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id  UUID NOT NULL REFERENCES accounts (id),
  project_id  UUID REFERENCES projects (id),
  name        TEXT NOT NULL,
  created_by  UUID REFERENCES users (id),
  disabled_at TIMESTAMPTZ
);

CREATE TABLE roles (                     -- named permission sets; provider-defined or custom
  id           UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id   UUID REFERENCES accounts (id),     -- null: a provider-defined role
  code         TEXT NOT NULL,            -- 'owner', 'biller', 'billing_viewer', 'member', ...
  permissions  TEXT[] NOT NULL,          -- action names, e.g. 'compute.vm.create'
  UNIQUE NULLS NOT DISTINCT (account_id, code)
);

CREATE TABLE role_bindings (             -- who holds which role where; allow-only
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  role_id              UUID NOT NULL REFERENCES roles (id),
  member_id            UUID REFERENCES account_members (id),
  service_principal_id UUID REFERENCES service_principals (id),
  scope_kind           TEXT NOT NULL CHECK (scope_kind IN ('account', 'organization_unit',
                         'project', 'resource')),
  scope_id             UUID NOT NULL,    -- the account, unit, project or resource
  valid_during         TSTZRANGE NOT NULL,       -- time-boxed grants end on their own
  granted_by           TEXT NOT NULL,            -- typed actor
  CHECK (num_nonnulls(member_id, service_principal_id) = 1)
);

CREATE TABLE permission_ceilings (       -- SCP-style limits; deny beats allow
  id                    UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id            UUID NOT NULL REFERENCES accounts (id),
  organization_unit_id  UUID REFERENCES organization_units (id),  -- null: whole account
  denied_actions        TEXT[] NOT NULL,
  denied_regions        TEXT[],          -- residency: no resources outside these
  valid_during          TSTZRANGE NOT NULL
);

CREATE TABLE api_credentials (           -- keys and tokens; the secret is never stored
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  member_id            UUID REFERENCES account_members (id),
  service_principal_id UUID REFERENCES service_principals (id),
  prefix               TEXT NOT NULL,    -- the public, scannable part: 'hc_live_'
  key_hash             BYTEA NOT NULL UNIQUE,
  scopes               TEXT[] NOT NULL,  -- fixed at creation
  project_ids          UUID[],           -- null: every project the holder can reach
  allowed_cidrs        CIDR[],
  expires_at           TIMESTAMPTZ NOT NULL,  -- no credential without an end
  last_used_at         TIMESTAMPTZ,
  revoked_at           TIMESTAMPTZ,
  revoked_reason       TEXT CHECK (revoked_reason IN ('rotated', 'user_request',
                         'leak_reported', 'leak_detected', 'account_closed', 'abuse')),
  CHECK (num_nonnulls(member_id, service_principal_id) = 1),
  CHECK ((revoked_at IS NULL) = (revoked_reason IS NULL))
);

CREATE TABLE reseller_agreements (       -- the terms a reseller sells under
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  reseller_account_id  UUID NOT NULL REFERENCES accounts (id),  -- kind = 'reseller'
  model                TEXT NOT NULL CHECK (model IN ('rebill', 'agency', 'referral',
                         'isv_registration', 'white_label')),
  price_book           TEXT NOT NULL,    -- price_versions.price_book it buys at
  products             TEXT[] NOT NULL,  -- product codes it may sell
  oversell_allowed     TEXT[] NOT NULL DEFAULT '{}',  -- resources it may oversell, if any
  max_sub_accounts     INT,
  first_line_support   TEXT NOT NULL CHECK (first_line_support IN ('reseller', 'provider')),
  first_line_abuse     TEXT NOT NULL CHECK (first_line_abuse IN ('reseller', 'provider')),
  end_customer_identity TEXT NOT NULL CHECK (end_customer_identity IN ('collected',
                         'on_request', 'not_collected')),  -- can it answer for them?
  valid_during         TSTZRANGE NOT NULL,
  contract_ref         TEXT
);

CREATE TABLE white_label_brands (        -- what the end customer sees instead of the provider
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  reseller_account_id  UUID NOT NULL REFERENCES accounts (id),
  name                 TEXT NOT NULL,
  panel_hostname       TEXT,             -- the reseller's control panel address
  nameservers          TEXT[],           -- reseller nameservers, ns1 to ns4
  support_email        TEXT NOT NULL,
  abuse_email          TEXT NOT NULL,    -- published; reports route to the reseller first
  sponsoring_disclosure TEXT             -- e.g. the sponsoring registrar, where a contract requires it
);

ALTER TABLE accounts
  ADD COLUMN white_label_brand_id UUID REFERENCES white_label_brands (id);

ALTER TABLE account_holds
  ADD COLUMN cascade_to_sub_accounts BOOLEAN NOT NULL DEFAULT FALSE;  -- reseller non-payment
```

Notes on the sketch:

- **Permissions are allow-only bindings under deny-only ceilings.** A role binding grants; a ceiling on a unit or the account denies, and a deny anywhere above wins, the evaluation AWS documents for SCPs. Keeping the two in separate tables keeps the evaluator simple and the audit question ("why could this key do that") answerable from rows. Ceilings are the organization layer of a wider set of guardrails, beside plan-time, admission and detective rules ([Guardrails by Layer](/books/hosting-and-cloud/governance-and-catalog#guardrails-by-layer)).
- **Membership is ranged; credentials expire.** A departing employee's membership ends with its range; their bindings end with it; credentials have no null expiry, so an unbounded key can't be created by accident.
- **Credentials are hashed, prefixed and scoped at birth.** The secret is shown once and stored as a hash; the prefix is registered with secret scanning programs; scopes can't widen after creation, matching DigitalOcean's rule, so rotation is the only way to change what a key can do ([Store a Hash, Show the Key Once](/docs/api-design/authentication#store-a-hash-show-the-key-once)).
- **A reseller's terms are data.** Which products it may sell, at which price book, whether it may oversell, who answers support and abuse first, and whether it collects its end customers' identities are columns, because each decides a workflow: rating, provisioning limits, report routing and law enforcement responses.
- **Holds cascade explicitly.** A reseller's non-payment hold sets `cascade_to_sub_accounts`, and the effective standing of a sub-account is the strongest hold on it or on any ancestor with cascade set, computed in one place.
- **Events:** `member.added`, `member.removed`, `role_binding.granted`, `role_binding.expired`, `credential.created`, `credential.revoked`, `credential.leak_reported`, `reseller_agreement.changed` and `account.held` (with cascade) go through the outbox to the authorization cache, the abuse desk and billing ([Caching Decisions Safely](/docs/security/authorization#caching-decisions-safely)).

## Auditing

- **Who could do what, when.** Every binding, ceiling and membership with its range and grantor, so the access a leaked key or a departed employee had on a given day can be reconstructed ([Audit Trails](/docs/architecture/audit-trails)).
- **Every credential's life.** Creation, scopes, last use, revocation and its reason, including leak reports from scanning partners and how long the key stayed live after the report.
- **Who sits behind each sub-account.** The reseller agreement in force, whether end-customer identity was collected, and the end customer's details where it was, because registries, carriers and courts will ask the accredited party.
- **Every hold and every cascade.** Which holds applied to which accounts because of a parent, so a suspended sub-account can see why.

## What This Means for the System You Build

- **Separate payer, scope and person:** accounts pay, projects hold, users and service principals act.
- **Nest scopes under units for policy,** and put ceilings on units with deny beating allow.
- **Default to temporary, scoped, expiring credentials,** with a scannable prefix and a leak-revocation path.
- **Model resellers as accounts with children and an agreement,** with support, abuse and identity responsibilities as columns.
- **Know who is behind every sub-account,** whether or not a rule currently requires it.
- **Publish the standing ladder** with its clocks, and implement it as dated holds that cascade from reseller to sub-account.

## References

**Provider documentation**

- [AWS Organizations: Terminology and concepts](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_getting-started_concepts.html), the management account as payer, member accounts, the root, feature sets
- [AWS Organizations: Service control policies](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html), SCPs set maximum permissions and grant none
- [AWS Organizations: SCP evaluation](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps_evaluation.html), allow at every level, deny at any level
- [AWS Organizations: Quotas](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_reference_limits.html), the default of 10 accounts and five levels of OUs
- [AWS: Closing an account](https://docs.aws.amazon.com/accounts/latest/reference/manage-acct-closing.html), the 90-day post-closure period
- [AWS IAM: Root user best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/root-user-best-practices.html), not using the root user for everyday tasks
- [AWS IAM: Security best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html), federation and temporary credentials over access keys
- [AWS IAM: Identifiers](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_identifiers.html), the AKIA and ASIA prefixes
- [AWS IAM: Access keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html), two access keys per user
- [AWS Billing Conductor](https://docs.aws.amazon.com/billingconductor/latest/userguide/what-is-billingconductor.html), billing groups, pricing rules and pro forma cost data for channel partners
- [Microsoft Learn: Management groups](https://learn.microsoft.com/en-us/azure/governance/management-groups/overview), six levels of depth and the tenant root group
- [Microsoft Learn: Microsoft Customer Agreement billing roles](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/understand-mca-roles), billing account, billing profiles and invoice sections
- [Microsoft Learn: Azure subscription states](https://learn.microsoft.com/en-us/azure/cost-management-billing/manage/subscription-states), Active, Past Due, Warned, Disabled, Expired and Deleted
- [Microsoft Learn: Cloud Solution Provider program](https://learn.microsoft.com/en-us/partner-center/enroll/csp-overview), direct-bill and indirect models and their requirements
- [Microsoft Learn: Granular delegated admin privileges](https://learn.microsoft.com/en-us/partner-center/customers/gdap-introduction), least-privileged, time-bound partner access
- [Google Cloud: Resource hierarchy](https://docs.cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy), organization, folders and projects, IAM inheritance
- [Google Cloud: Billing concepts](https://docs.cloud.google.com/billing/docs/concepts), billing accounts and subaccounts for resellers
- [Google Cloud: Shutting down and restoring projects](https://docs.cloud.google.com/resource-manager/docs/delete-restore-projects), the 30-day recovery window
- [Google Cloud: Enable, disable or change billing for a project](https://docs.cloud.google.com/billing/docs/how-to/modify-project), services stopped when billing is disabled
- [Google Cloud: Cloud Channel API overview](https://docs.cloud.google.com/channel/docs/overview), distributors, resellers and entitlements
- [Google Cloud: Best practices for managing service account keys](https://docs.cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys), keys as an exception and the policy that disables them
- [DigitalOcean: Teams](https://docs.digitalocean.com/platform/teams/), teams and organizations with consolidated billing
- [DigitalOcean: Predefined roles](https://docs.digitalocean.com/platform/teams/roles/predefined/), the six team roles
- [DigitalOcean: Projects](https://docs.digitalocean.com/products/projects/), grouping resources
- [DigitalOcean: Create a personal access token](https://docs.digitalocean.com/reference/api/create-personal-access-token/), custom scopes and expiry
- [DigitalOcean: Late payments](https://docs.digitalocean.com/platform/billing/late-payments/), past due, suspended and deleted, without fixed timelines
- [Cloudflare: Roles](https://developers.cloudflare.com/fundamentals/manage-members/roles/), account-scoped and domain-scoped roles
- [Cloudflare: API keys](https://developers.cloudflare.com/fundamentals/api/get-started/keys/), API tokens over the Global API Key
- [Cloudflare: Tenant API](https://developers.cloudflare.com/tenant/), provisioning for channel and alliance partners
- [Cloudflare: Tenant structure](https://developers.cloudflare.com/tenant/structure/), tenants containing customer accounts
- [Vercel: Accounts](https://vercel.com/docs/accounts), personal accounts, teams and the default team
- [Vercel: Using an API access token](https://vercel.com/kb/guide/how-do-i-use-a-vercel-api-access-token), account, team and project scopes and expiration
- [GitHub: Secret scanning partner program](https://docs.github.com/en/code-security/secret-scanning/secret-scanning-partnership-program/secret-scanning-partner-program), providers receiving leaked token reports
- [cPanel: Edit Reseller Nameservers and Privileges](https://docs.cpanel.net/whm/resellers/edit-reseller-nameservers-and-privileges/), privilege groups, limits and overselling
- [Twilio: A2P 10DLC onboarding for ISVs](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/onboarding-isv), primary and secondary customer profiles and a brand per customer
- [OpenSRS: Become a domain reseller](https://opensrs.com/become-a-domain-reseller/), white-label storefront, control panel and API

**Contracts and regulation**

- [AWS Customer Agreement](https://aws.amazon.com/agreement/), suspension grounds (4.1), termination for convenience (5.2) and the 30-day retrieval period (5.3)
- [Google Cloud Terms of Service](https://cloud.google.com/terms), suspension for AUP violations, to protect the services and for late payment
- [ICANN: 2013 Registrar Accreditation Agreement](https://www.icann.org/resources/pages/approved-with-specs-2013-09-17-en), section 3.12 reseller obligations
- [Federal Register: Taking Additional Steps To Address the National Emergency With Respect to Significant Malicious Cyber-Enabled Activities (proposed rule, January 29, 2024)](https://www.govinfo.gov/content/pkg/FR-2024-01-29/html/2024-01580.htm), the proposed customer identification programs for IaaS providers and foreign resellers
- [Unified Agenda: RIN 0694-AJ35](https://www.reginfo.gov/public/do/eAgendaViewRule?pubId=202510&RIN=0694-AJ35), the rulemaking listed as withdrawn on December 16, 2025
