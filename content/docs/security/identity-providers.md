+++
title = "Choosing an Identity Provider"
nav_title = "Identity Providers"
description = "Hosted platforms, self-hosted servers and in-app libraries for sign-in: Auth0, Clerk, WorkOS, Cognito, Keycloak, FusionAuth, Better Auth, and how to choose."
category = "Security"
order = 703
tags = ["security", "authentication", "identity", "sso", "keycloak", "better-auth", "go"]
+++

[Authentication & Sessions](/docs/security/authentication) argues for buying sign-in instead of writing it. This chapter is about what to buy, or run, or install. The choice isn't one product against another so much as one shape against another: a hosted platform that keeps your users for you, an identity server you run yourself, or a library that lives inside your application and stores users in your database. Each shape moves a different set of problems off your plate and leaves a different set on it, and the products inside a shape differ less than the shapes do.

Everything here is a snapshot as of October 2026. Products in this space merge, rename and reprice often; check the vendor's own pages before you sign anything.

## Three Shapes

![A table of who runs what for each shape. With a hosted platform the vendor runs the sign-in pages, user records, MFA and passkeys, enterprise SSO and on-call. With a self-hosted server the server does that work but you run upgrades and on-call. With a library you build the pages, keep users in your own database and wire plugins. In every shape, your application's session is yours.](/diagrams/identity-shapes.svg "Each shape moves different work off your plate. Hosted platforms keep your users, servers run in your infrastructure, libraries keep users in your own database; in every case the application session stays yours.")

- **A hosted platform** runs the sign-in pages, stores the users, and does MFA, passkeys, social login and often enterprise SSO for you. You redirect to it, get a token back, and start your own session. You give up control of where users live and of pricing that grows with your user count.
- **A self-hosted identity server** is the same idea on your infrastructure. You get the protocols and admin console without the per-user bill, and you take on upgrades, backups, scaling and being paged when sign-in breaks for everyone at once.
- **A library in your application** keeps users in your own database and your own sign-in pages. Nothing leaves your system, and you own every screen, every plugin, and every security fix you're slow to install.

## Hosted Platforms

- **Auth0** is Okta's customer identity product. It's the broadest of the hosted options: enterprise connections for SAML, OIDC, Active Directory and LDAP, Okta Workforce and others. The breadth is the reason to pick it and the reason it takes longer to configure well. Password hashes for database users aren't exposed through the API; you get them by opening a support ticket, and not on the free tier.
- **Clerk** is built for application developers who want sign-in UI as drop-in components, with organizations for B2B and enterprise SSO over SAML and OIDC. It bills by monthly retained users. Admins can export users, including hashed passwords, from the dashboard, which makes it one of the easier ones to leave.
- **WorkOS** started as enterprise SSO and directory sync (SCIM) as an API and added AuthKit for full user management. AuthKit is free up to one million monthly active users; SSO and Directory Sync are priced per connection (listed at $125 each for the first fifteen). That pricing shape fits B2B products well: you pay when a customer asks for SSO, which is usually when they pay you more. Laravel's starter kits ship a WorkOS AuthKit variant.
- **Stytch** is a developer-focused identity platform that now pitches identity for AI agents as well as people. Twilio announced its acquisition in October 2025 and completed it on November 14, 2025.
- **Descope** builds sign-in journeys with a no-code flow editor, with B2B SSO and SCIM.
- **Amazon Cognito** is the default on AWS: user pools, federation, and billing by monthly active users inside the AWS bill you already have. Its migration story is better than its reputation: you can bulk import users with password hashes (bcrypt, scrypt, Argon2id or PBKDF2-SHA256, within stated parameter limits) or migrate them lazily through a migration Lambda trigger on first sign-in.
- **Firebase Authentication** is the fastest start for mobile and web apps already on Firebase. **Google Cloud Identity Platform**, its upgrade, adds SAML and OIDC providers, multi-tenancy, blocking functions and a 99.95% uptime SLA.
- **Supabase Auth** keeps users in your project's own Postgres, in a dedicated schema, and its tokens drive row-level security. Of the hosted options it's the one where the users are most plainly in a database you can reach.
- **Microsoft Entra External ID** is Microsoft's customer identity service, running in a separate "external" tenant from your workforce directory. Azure AD B2C, its predecessor, stopped being sold to new customers on May 1, 2025.

## Self-Hosted Servers

- **Keycloak** is the reference open-source identity server: Apache 2.0, a CNCF incubating project, with realms for isolation, OIDC and SAML as both provider and broker, user federation to LDAP and Active Directory, and an admin console for all of it. Red Hat ships a supported build (26.6 as of this writing). It's heavyweight: a Java server with a database, themes to maintain for custom sign-in pages, and upgrades you have to plan. Teams that run it well treat it as a product with an owner.
- **Zitadel** is newer, written in Go, with multi-tenancy built in as organizations under an instance, OIDC (certified), SAML, a SCIM 2.0 server and passkeys. It's AGPL-3.0 with exceptions for some directories, and Zitadel Cloud runs the same codebase if you want it hosted later.
- **Ory** is a set of Apache 2.0 services, written in Go, that you compose: Kratos for identities, credentials and self-service flows, Hydra as a certified OAuth 2.0 and OIDC provider, Keto for relationship-based permissions, Oathkeeper as an access proxy. Ory Network is the managed version. The split is powerful and means more assembly.
- **Authentik** is an open-source IdP aimed at self-hosting, speaking SAML, OAuth2 and OIDC, LDAP and RADIUS. Its core is MIT, with enterprise features under a separate license. It's common in internal and homelab setups and capable in production.
- **Authelia** is different in kind: an authentication portal, written in Go, that sits beside a reverse proxy and adds 2FA and SSO in front of applications. It has no sign-up; users live in a file or LDAP. Right for protecting internal tools, wrong as a customer user store.
- **Casdoor** is an Apache 2.0 identity server in Go with a React admin UI. It's an OIDC and OAuth 2.0 provider, SAML 2.0 as both IdP and SP, CAS for legacy applications, LDAP in both directions and a SCIM 2.0 server: wide protocol coverage in a single binary.
- **Hanko** is passkey-first, with passwords, passcodes, social login, TOTP and SAML enterprise SSO behind drop-in web components. The Go backend is AGPL-3.0 (the frontend packages are MIT), and Hanko Cloud runs it for you.
- **Dex** is a CNCF sandbox project (Apache 2.0, Go) that isn't a user store at all: it's an OIDC provider in front of other identity sources, through connectors for LDAP, GitHub, Google, Microsoft, generic OIDC and more. It's common for Kubernetes and internal tools. Its SAML connector is marked unmaintained, so don't lean on it for business-customer SSO.
- **Pocket ID** is a small OIDC provider (BSD-2-Clause, Go) that signs users in with passkeys only, no passwords. It's aimed at self-hosted services and simple setups where Keycloak is more than you need.

## Free to Run, Paid to Grow

Between "pay per user" and "free and yours" sits a pricing model worth comparing directly: the software is free to self-host, often without a user cap, and the vendor charges for hosting, support and a set of features held back for paid plans. Zitadel, Ory and Authentik above already work this way. Three more are built around it:

- **FusionAuth** is a full identity server (OIDC, SAML, MFA, passkeys, multi-tenancy) whose Community edition is free to self-host with no user limit. It isn't open source: the core is closed, with client libraries and examples under Apache 2.0. Paid plans start around $160 a month, include hosting, and unlock IdP-initiated SAML, SMS and email MFA, breached-password detection and custom hashing; a SCIM server is Enterprise only. It imports password hashes, and self-hosted, the database is yours to read.
- **SuperTokens** has an Apache 2.0 core, free to self-host without limits, and a managed service free under 5,000 monthly active users, then $0.02 each. The catch is in the add-ons: MFA ($0.01 per user, $100 a month minimum), account linking and multi-tenancy are paid even when you self-host, under a separate enterprise license.
- **Logto** is MPL-2.0, written in TypeScript on Postgres, with OIDC, SAML, organizations and MFA. Logto Cloud is free to 50,000 monthly active users, its Pro plan starts at $24 a month, and enterprise SSO is $48 per connector.

The thing to model is what you'll need in a year, not today. A free tier that covers sign-in rarely covers SCIM, advanced MFA or a support contract, and those are what a B2B customer asks for first.

## Libraries in Your App

- **Better Auth** is a framework-agnostic TypeScript library, MIT-licensed, that stores users and sessions in your own database through adapters (a built-in Kysely adapter for Postgres, MySQL, SQLite and MSSQL, and Drizzle, Prisma and MongoDB adapters). Its plugin model covers 2FA, passkeys, organizations and multi-session; an SSO plugin adds OIDC, OAuth2 and SAML 2.0 with domain verification and automatic organization membership, and a separate SCIM plugin serves inbound SCIM 2.0. In September 2025 Auth.js (formerly NextAuth.js) came under the Better Auth team's maintenance; it still gets security fixes, and the team recommends Better Auth for new projects.
- **Lucia** was deprecated as a library in March 2025. Its site now offers a single-file session implementation and points to a guide for learning how authentication works, which is still worth reading even if you never copy it.
- **Framework-native options** are the right answer more often than people expect, because they share your framework's session, CSRF and ORM conventions:
  - Rails 8 ships an authentication generator (sessions, password reset, `has_secure_password` with bcrypt) but no sign-up flow; Devise remains the full-featured gem.
  - Django has `django.contrib.auth`; django-allauth adds local accounts, a long list of social providers, WebAuthn-based MFA and an OIDC identity provider.
  - Laravel's starter kits use Fortify for login, registration, reset, email verification and TOTP 2FA, with a WorkOS AuthKit variant; Sanctum covers API tokens.
  - Spring Security in Java and ASP.NET Core Identity in .NET are their platforms' defaults, and Passport.js is the long-standing Node strategy library.
  - Go has no default, and the standard library leaves the pieces to you. Teams typically combine a session library with an OIDC client against one of the servers above, which is usually the better design anyway. The pieces worth knowing:
    - `golang.org/x/oauth2` with **go-oidc** (`coreos/go-oidc`) for the OIDC client side: discovery, and verifying ID tokens' signature, issuer, audience and expiry.
    - **SCS** (`alexedwards/scs`) for server-side sessions with pluggable stores (Postgres, Redis and others).
    - **go-webauthn** for passkeys, BSD-3-Clause, continuing Duo Labs' original library.
    - **crewjam/saml** for SAML as a service provider or identity provider, if you take on [business-customer SSO](/docs/security/sso-and-federation) yourself.
    - **Goth** for social login, with sixty-odd OAuth providers behind one interface (MIT).
    - **Authboss** (`aarondl/authboss`, MIT) is the closest Go gets to Devise: registration, confirmation, recovery, lockout, remember-me, OAuth2 and TOTP or SMS 2FA as modules. It ships no storage; you implement its storer interfaces against your own database.

## Side by Side

| Option | Shape | Enterprise SSO and SCIM | Where users live | License or pricing shape | Getting users out |
| ------ | ----- | ----------------------- | ---------------- | ------------------------ | ----------------- |
| Auth0 | Hosted | SAML, OIDC, AD/LDAP connections | Vendor | Plans by users and features | Hashes by support ticket, paid plans |
| Clerk | Hosted | SAML and OIDC; directory sync billed separately | Vendor | By monthly retained users | Dashboard export includes hashes |
| WorkOS | Hosted | SSO and SCIM, per connection | Vendor | AuthKit free to 1M MAU | Check before you commit |
| Cognito | Hosted (AWS) | SAML and OIDC federation | Your AWS account | By monthly active users | Imports hashes; plan the export early |
| Identity Platform | Hosted (Google) | SAML and OIDC | Google | Usage-based | Imports many hash formats |
| Supabase Auth | Hosted | SAML | Your project's Postgres | Project plans | Users are rows in your database |
| Keycloak | Self-hosted | OIDC and SAML, LDAP/AD federation | Your database | Apache 2.0 | Yours |
| Zitadel | Self-hosted or cloud | OIDC, SAML, SCIM server | Yours, or theirs on cloud | AGPL-3.0 | Yours when self-hosted |
| Ory | Self-hosted or network | OIDC via Hydra | Yours, or theirs on network | Apache 2.0 | Yours when self-hosted |
| Casdoor | Self-hosted | OIDC, SAML, CAS, LDAP, SCIM server | Your database | Apache 2.0 | Yours |
| Hanko | Self-hosted or cloud | SAML | Yours, or theirs on cloud | AGPL-3.0 | Yours when self-hosted |
| Dex | Self-hosted | Federates to LDAP, OIDC and social; SAML unmaintained | Upstream providers | Apache 2.0 | Nothing to move |
| FusionAuth | Self-hosted or cloud | OIDC and SAML; SCIM on Enterprise | Yours, or theirs on cloud | Closed source, free Community edition | Yours when self-hosted; cloud by ticket |
| SuperTokens | Self-hosted or managed | SAML; multi-tenancy paid | Yours, or theirs managed | Apache 2.0 core, paid add-ons | Yours when self-hosted |
| Logto | Self-hosted or cloud | OIDC and SAML; SSO per connector on cloud | Yours, or theirs on cloud | MPL-2.0; cloud free to 50K MAU | Yours when self-hosted |
| Better Auth | Library | SSO and SCIM plugins | Your database | MIT | Yours |
| Framework-native | Library | Add a library or a server | Your database | Your framework's license | Yours |

## How I Choose

- **Consumer or business customers first.** A consumer app needs smooth sign-up, social login, passkeys and bot defenses. A B2B product will be asked for SAML SSO and SCIM by its first large customer, and the [business-customer SSO work](/docs/security/sso-and-federation) is real engineering. If B2B is the plan, pick something that does it natively: WorkOS, Auth0, Keycloak or Zitadel, or Better Auth's SSO and SCIM plugins.
- **Where users must live.** Data residency, a regulator, or a customer contract can decide this outright. Self-hosting or a library keeps users in your own region and database; hosted platforms offer regions, at a price and with limits worth reading.
- **Who carries the pager.** Self-hosting an identity server is running a tier-zero system: when it's down, nobody signs in. A team without on-call capacity for it should buy, whatever the license says.
- **Pricing against your margins.** Per-user pricing is cheap at the start and can be the largest line on the bill at scale, especially for free consumer tiers. Model it at ten and a hundred times today's users before you choose.
- **How much the sign-in experience matters.** Hosted pages are themeable, not yours. If sign-in is part of the product, a library or components you control fit better.
- **Tenancy.** For [multi-tenant](/docs/architecture/multi-tenancy) products, check how the option models a customer: organizations, realms, tenants. Retrofitting tenancy onto a flat user store is a migration.

My defaults: a framework's own authentication, or Better Auth in TypeScript, for a product that's starting out and keeps users in its own database; WorkOS or Auth0 when enterprise SSO is on the roadmap and nobody wants to run identity; Keycloak or Zitadel when users must stay in our infrastructure and there's a team to own it.

## Plan the Exit

Every identity choice is a migration later, and the expensive part is passwords, because you can't reset a million users' passwords politely.

- **Know whether hashes come out, and in what algorithm,** before you put users in. Some vendors export them freely, some by support ticket, and the destination has to accept the algorithm and its parameters.
- **Migrate lazily when you can.** On a user's next sign-in, verify against the old system, then write the credential to the new one. Cognito's migration trigger and Clerk's trickle migration both work this way. Users who never return get a reset email at the end.
- **Keep your own user ID as the primary key.** Store the provider's identifier as a mapped column, keyed on issuer and subject as in [SSO & Identity Federation](/docs/security/sso-and-federation). Then every table that references a user survives a change of provider.
- **Keep session creation behind your own boundary.** If your application only ever asks "who is this?" through one module, swapping what's behind it is a project, not a rewrite.

## What You Still Own

Whatever you pick, the list in [Authentication & Sessions](/docs/security/authentication) still applies: your application's own session, what counts as a sensitive action, recovery policy, audit events, and what happens when the provider is down. Buying moves the work; it doesn't remove it.

## This Site

[syntaqx.com](https://github.com/syntaqx/syntaqx.com) has no user accounts. It started with Better Auth for sign-in, and removed it along with accounts and the database behind them, as [ADR 0001](https://github.com/syntaqx/syntaqx.com/blob/main/docs/adr/0001-no-authentication-or-user-identity.md) records. The decision was about not holding user data at all, not about the library.

## References

**Specifications**

- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html), the protocol every option here speaks for sign-in
- [RFC 7644: SCIM 2.0 Protocol](https://www.rfc-editor.org/rfc/rfc7644.html), the provisioning standard behind directory sync

**Reference**

- [Keycloak](https://www.keycloak.org/), CNCF incubating status, brokering, federation and protocols
- [Keycloak on GitHub](https://github.com/keycloak/keycloak), Apache 2.0 license
- [Red Hat build of Keycloak](https://docs.redhat.com/en/documentation/red_hat_build_of_keycloak/), the supported distribution and current version
- [Zitadel on GitHub](https://github.com/zitadel/zitadel), AGPL-3.0 licensing, organizations, protocols and Zitadel Cloud
- [Ory: Projects](https://www.ory.com/docs/ecosystem/projects), Kratos, Hydra, Keto, Oathkeeper, licensing and Ory Network
- [FusionAuth: Pricing](https://fusionauth.io/pricing), the free Community edition and what each paid plan unlocks
- [FusionAuth: License FAQ](https://fusionauth.io/license-faq), the closed core, open-source components and data export
- [SuperTokens: Pricing](https://supertokens.com/pricing), free self-hosting, managed per-user pricing and paid add-ons
- [SuperTokens core on GitHub](https://github.com/supertokens/supertokens-core), Apache 2.0 with a separately licensed `ee` directory
- [Logto on GitHub](https://github.com/logto-io/logto), MPL-2.0 license and protocols
- [Logto: Pricing](https://logto.io/pricing), the cloud free tier, Pro plan and enterprise SSO connectors
- [Casdoor on GitHub](https://github.com/casdoor/casdoor), Apache 2.0 license and protocols
- [Hanko on GitHub](https://github.com/teamhanko/hanko), AGPL-3.0 backend, MIT frontend packages and Hanko Cloud
- [Dex on GitHub](https://github.com/dexidp/dex), connectors and their maintenance status
- [CNCF: Dex](https://www.cncf.io/projects/dex/), sandbox maturity level
- [Pocket ID on GitHub](https://github.com/pocket-id/pocket-id), passkey-only OIDC provider
- [go-oidc](https://github.com/coreos/go-oidc), OIDC client and ID token verification for Go
- [SCS](https://github.com/alexedwards/scs), Go session management with pluggable stores
- [go-webauthn](https://github.com/go-webauthn/webauthn), WebAuthn and passkeys for Go
- [crewjam/saml](https://github.com/crewjam/saml), SAML service provider and identity provider for Go
- [Goth](https://github.com/markbates/goth), multi-provider social login for Go
- [Authboss](https://github.com/aarondl/authboss), modular authentication for Go web applications
- [authentik on GitHub](https://github.com/goauthentik/authentik), protocols and the MIT and enterprise license split
- [Authelia: First Factor](https://www.authelia.com/configuration/first-factor/introduction/), file and LDAP backends and no registration
- [Better Auth: Introduction](https://www.better-auth.com/docs/introduction), what it is and its plugin ecosystem
- [Better Auth: Database](https://www.better-auth.com/docs/concepts/database), adapters and users in your own database
- [Better Auth: SSO plugin](https://www.better-auth.com/docs/plugins/sso), OIDC, OAuth2 and SAML, domain verification and organization provisioning
- [Better Auth: SCIM plugin](https://www.better-auth.com/docs/plugins/scim), inbound SCIM 2.0
- [Better Auth on GitHub](https://github.com/better-auth/better-auth), MIT license
- [Better Auth: Auth.js is now part of Better Auth](https://www.better-auth.com/blog/authjs-joins-better-auth), the September 2025 announcement and guidance for new projects
- [Lucia](https://lucia-auth.com/), its March 2025 deprecation and single-file replacement
- [Auth0: Enterprise Connections](https://auth0.com/docs/authenticate/enterprise-connections), connection types
- [Auth0: Export Data](https://auth0.com/docs/troubleshoot/customer-support/manage-subscriptions/export-data), password hashes by support ticket
- [Clerk: Migrating to Clerk](https://clerk.com/docs/guides/development/migrating/overview), exports with hashed passwords, imports and trickle migration
- [Clerk: Enterprise connections](https://clerk.com/docs/guides/configure/auth-strategies/enterprise-connections/overview), SAML and OIDC
- [WorkOS: Pricing](https://workos.com/pricing), AuthKit's free tier and per-connection SSO and Directory Sync
- [Stytch: Changelog](https://stytch.com/docs/resources/changelog), the Twilio acquisition announced and completed
- [Descope](https://www.descope.com/), no-code identity flows with B2B SSO and SCIM
- [Amazon Cognito: Importing users from a CSV file](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-using-import-tool.html), password hash import and its algorithms
- [Amazon Cognito: Importing users](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-import-users.html), the migration Lambda trigger
- [Firebase: Import users](https://firebase.google.com/docs/auth/admin/import-users), supported hash algorithms
- [Google Cloud: Identity Platform vs Firebase Authentication](https://docs.cloud.google.com/identity-platform/docs/product-comparison), SAML, OIDC, multi-tenancy and the SLA
- [Supabase Auth](https://supabase.com/docs/guides/auth), users in your project's Postgres and row-level security
- [Microsoft Entra External ID overview](https://learn.microsoft.com/en-us/entra/external-id/external-identities-overview), external tenants and Azure AD B2C's end of sale
- [Rails Security Guide](https://guides.rubyonrails.org/security.html), the Rails 8 authentication generator
- [django-allauth](https://docs.allauth.org/en/latest/), accounts, social providers, MFA and its OIDC identity provider
- [Laravel: Starter Kits](https://laravel.com/docs/12.x/starter-kits), Fortify authentication and the WorkOS AuthKit variant

**In practice**

- [ADR 0001: No authentication or user identity](https://github.com/syntaqx/syntaqx.com/blob/main/docs/adr/0001-no-authentication-or-user-identity.md), why this site removed Better Auth with its accounts
