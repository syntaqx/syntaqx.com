+++
title = "SMART on FHIR & App Platforms"
nav_title = "SMART on FHIR & Apps"
description = "How apps get into EHRs: SMART App Launch, v2 scopes, EHR and standalone launch, backend services, Epic and Oracle app programs, and patient access apps."
category = "Health Tech Industry"
order = 1909
part = "Records and Interoperability"
tags = ["health-tech", "smart-on-fhir", "oauth", "app-platforms", "patient-access", "epic"]
+++

A FHIR API without authorization is a public database of medical records, so every production FHIR server sits behind OAuth 2.0, and the health care profile of OAuth is **SMART App Launch**. SMART answers the questions general OAuth leaves open: how an app opened from inside the EHR learns which patient and encounter the clinician is looking at, how an app a patient downloads finds their hospital's authorization server, how scopes name FHIR resources and operations, and how a backend service with no user gets a token. ASTP/ONC certification requires it: health IT certified for the standardized API had to support SMART App Launch 2.0.0 by December 31, 2025. Any app that runs inside an EHR, that a patient connects to their records, or that a vendor's servers use to pull data, is a SMART client.

Authorization is only half of getting an app into an EHR. The other half is commercial and operational: registering with the EHR vendor, passing whatever review it runs, being turned on by each health system that buys the app, and, for apps patients choose, the rules that say an EHR can't block them. This chapter covers the protocol and the platforms; the general OAuth patterns are the playbook's [OAuth 2.0 for Delegated Access](/docs/api-design/authentication#oauth-2-0-for-delegated-access) and [Scopes](/docs/api-design/authentication#scopes), and the FHIR API underneath is [FHIR](/books/health-tech/fhir).

## How the Platforms Do It

As of October 2026, from public pages:

| Platform | Registration and programs | What its public pages describe |
| --- | --- | --- |
| **Epic** | Client registration on Epic on FHIR; Showroom for listings; Connection Hub (opened January 9, 2023, "open to all vendors") for vendors to self-report successful exchange; Vendor Services replacing the old App Market | Epic on FHIR is "a free resource for developers"; open.epic cites 3,339 live apps using its web services and 322 billion annual web service transactions on its public APIs |
| **Oracle Health (Millennium)** | Developer documentation for secured endpoints with SMART | SMART v1 and v2 scopes, `launch`, `fhirUser`, `openid`, `online_access`, `offline_access`, and per-interaction notes on whether patient, provider or system authorization is accepted |
| **CMS (Medicare)** | Health Technology Ecosystem pledges and a Medicare App Library | Apps align voluntarily with a shared data and access framework; a National Provider Directory; CMS's page was last modified October 21, 2026 |

Fees are the least public part. Epic says its FHIR developer resource is free and that USCDI v3 support is free for app developers, but publishes no price list for Vendor Services or Showroom listings on the pages this chapter could open, and athenahealth's developer and marketplace pages were not readable for this chapter. <!-- source-gap: ehr-app-program-fees | missing | Epic Vendor Services and Showroom fees, athenahealth Marketplace partner fees, Oracle Health app validation fees | closes with: each vendor's own published program terms | checked: 2026-10-29 --> The program terms are each vendor's own and change, so a vendor plans for them per EHR and confirms them under contract. The structural point holds across EHRs: **API access under certification is the floor, and marketing, listing, deeper APIs and support are the paid layer on top.**

## SMART App Launch Versions

| Version | Published | What changed |
| --- | --- | --- |
| 1.0.0 | November 13, 2018 | First release: EHR and standalone launch, v1 scopes such as `patient/*.read` |
| **2.0.0** | November 26, 2021 | The v2 scope syntax (`.cruds`); the HTI-1 certification baseline |
| 2.1.0 | April 18, 2023 | Trial-use update |
| 2.2.0 | April 30, 2024 | Trial-use update; the current release, which requires PKCE with S256 |

Servers that support both scope syntaxes advertise `permission-v1` and map v1 to v2: `.read` becomes `.rs`, `.write` becomes `.cud`, `.*` becomes `.cruds`. Oracle Health's documentation shows the coexistence in practice, listing `patient/Patient.read` and `user/Encounter.crus` side by side.

## The Two Launches

**EHR launch.** A clinician is in the chart and clicks the app. The EHR opens the app's registered launch URL with two parameters: `iss`, the EHR's FHIR base URL, and `launch`, an opaque id for this session. The app discovers the authorization server, then sends the user to authorize with the `launch` value echoed back and the `launch` scope, which "ties the authorization to the current EHR session." The token response carries the context the EHR chose, such as `patient`, so the app opens on the right chart without asking.

**Standalone launch.** A user opens the app on their own: a patient's phone app, a clinician's web tool. There's no `launch` parameter; the app asks for context with scopes such as `launch/patient`, and the EHR's authorization flow lets the user pick (a patient picks themselves; a clinician picks a patient).

Both continue the same way:

1. **Discovery.** `GET [iss]/.well-known/smart-configuration` returns the `authorization_endpoint`, `token_endpoint` and capabilities.
2. **Authorize.** Redirect with `response_type=code`, `client_id`, `redirect_uri`, `scope`, `state`, `aud` and a PKCE challenge. `aud` is required and names the FHIR server the app wants, which "prevents leaking a genuine bearer token to a counterfeit resource server." Servers "SHALL support the `S256` `code_challenge_method` and SHALL NOT support the `plain` method."
3. **Token.** Exchange the code. **Public clients** (browser and native apps that can't keep a secret) send only `client_id`; **confidential clients** authenticate, preferably with asymmetric keys.
4. **Refresh.** `offline_access` gets a refresh token usable whether or not the user is online; `online_access` one usable only while the user remains online. A refresh "can't obtain new permissions": the scope must be a subset of the original grant.

`openid fhirUser` adds an id token whose `fhirUser` claim is the FHIR URL of the person signed in (a Patient, Practitioner, PractitionerRole, RelatedPerson or Person), which is how an app knows whether a parent or the patient is using it.

## Scopes

A v2 scope is a context, a resource type and permission letters from the ordered string `cruds`: create, read, update, delete, search.

| Scope | Grants |
| --- | --- |
| `patient/Observation.rs` | Read and search Observations for the patient in context |
| `patient/Observation.rs?category=http://terminology.hl7.org/CodeSystem/observation-category\|laboratory` | Only laboratory observations (query parameters narrow a scope; some advanced features are experimental) |
| `user/Patient.rs` | Patients the signed-in user may see, e.g. to pick one |
| `system/Observation.rs` | Direct client access with no user, for a backend service |
| `launch`, `launch/patient`, `launch/encounter` | Launch context |
| `openid fhirUser` | Who the user is |
| `offline_access`, `online_access` | A refresh token |

Three practical rules. **Ask for the minimum.** EHRs and health systems review requested scopes, and patients see them on the consent screen; an app that asks for `patient/*.cruds` to show a medication list will be questioned, and minimum necessary is a HIPAA principle for the covered entity granting access ([The Three Rules](/docs/compliance/hipaa#the-three-rules)). **Expect fewer than you asked for.** The server or the user may grant a subset; the token response's `scope` is what you got, and the app degrades rather than fails. **Scopes aren't authorization by themselves.** A `user/` scope is bounded by what the user may see in the EHR; the EHR's own access controls still apply.

## Backend Services

A service with no user (a nightly export, a population health engine, a reminder platform syncing appointments) uses **SMART Backend Services**: the OAuth client credentials grant with a signed JWT as the client's proof. The client registers a public key (or a JWKS URL) with the server out of band, then requests a token with `grant_type=client_credentials`, `client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer`, a `client_assertion` JWT it signed, and `system/` scopes. Access tokens should be short-lived: the spec says `expires_in` "SHOULD NOT exceed 300," five minutes.

```go tab="Go"
// The assertion: iss and sub are the client_id, aud is the token endpoint,
// jti is unique per request, exp at most five minutes out.
claims := map[string]any{
	"iss": clientID,
	"sub": clientID,
	"aud": tokenURL,
	"jti": uuid.NewString(),
	"exp": time.Now().Add(4 * time.Minute).Unix(),
}
assertion, err := signer.SignJWT(claims, keyID) // the private key behind your registered JWKS
if err != nil {
	return err
}

form := url.Values{
	"grant_type":            {"client_credentials"},
	"scope":                 {"system/Patient.rs system/Appointment.rs"},
	"client_assertion_type": {"urn:ietf:params:oauth:client-assertion-type:jwt-bearer"},
	"client_assertion":      {assertion},
}
resp, err := client.PostForm(tokenURL, form)
```

```sh tab="Shell"
curl -s "$TOKEN_URL" \
  -d grant_type=client_credentials \
  -d scope="system/Patient.rs system/Appointment.rs" \
  -d client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer \
  -d client_assertion="$SIGNED_JWT"
```

Backend access is the most powerful credential in health tech: no user, no patient context, a whole population. Health systems grant it per app and per tenant, often with a narrower data set than the scope suggests, and the private key is a secret that belongs in a KMS with use logged ([Logging Key Use](/docs/security/encryption-at-rest#logging-key-use)). A vendor with one key across all customers has one breach across all customers; my rule is **one key pair per customer connection**, rotated on a schedule.

## Getting an App Into an EHR

The technical registration is a form; the work is everything around it.

1. **Register with the EHR vendor.** Create a client in the developer program, declare app type (patient, clinician, backend), redirect URIs, JWKS URL and scopes, and test in the vendor's sandbox. Epic's Epic on FHIR offers a testing sandbox and client registration; Oracle Health publishes open sandbox endpoints whose CapabilityStatement needs no credentials.
2. **Pass the vendor's program, if you need one.** Listing in a marketplace, access to non-certified APIs, and the vendor's own security or design review are program benefits with program terms. Epic's Connection Hub, opened January 9, 2023, is the lighter path: "open to all vendors" with at least one Epic connection to self-report successful exchange.
3. **Sell to each health system.** The health system decides whether to activate your client in its instance, which scopes it grants, which users or patients see the app, and on what timeline. Its security review, BAA and integration team are the long pole; Selling Software into Health Care in Part 1 covers the review, and Hospitals & Health Systems in Part 6 what a health system clears before go-live.
4. **Configure per tenant.** Each activation is a different `iss`, client id (sometimes), set of granted scopes, and sometimes a different FHIR version or IG. The app stores all of it per connection.

Patient-facing apps are the exception to step 3. A patient connecting their own records with an app they chose is exercising their right of access, and the certified API must let them, which is why consumer apps can connect to many health systems without a contract with each.

## Patient Access and Third-Party Apps

Three regimes push EHRs to let patients use any app:

- **Certification** requires the standardized API to serve a single patient's data to an app the patient authorizes, with revocation within one hour of the patient's request (45 CFR 170.315(g)(10)), and certified API developers to publish their service base URLs at no charge in a standardized FHIR format (an HTI-1 requirement by December 31, 2024), so an app can find a patient's provider.
- **Information blocking** rules make unreasonable interference with that access a violation for providers, developers and networks; the actors, exceptions and penalties are Cures Act, Information Blocking & Certification in Part 3.
- **CMS payer rules** require the payers CMS regulates to offer patient access APIs under the 2020 Interoperability and Patient Access rule, extended to providers, other payers and prior authorization by CMS-0057-F ([FHIR](/books/health-tech/fhir#how-the-platforms-do-it)).

What happens to the data once it reaches a patient's app is the hard part. An app the patient chose, that isn't acting for the covered entity, is generally not the covered entity's business associate, and OCR's guidance addresses whether the provider is responsible for what the app then does with the data. <!-- source-gap: ocr-patient-app-faq | missing | OCR's FAQ on covered entity liability for PHI sent to a patient-designated third-party app | closes with: the HHS OCR FAQ page on access right, health apps and APIs (blocked to automated fetching on 2026-10-29) | checked: 2026-10-29 --> Consumer health apps outside HIPAA fall under the FTC's Health Breach Notification Rule and state health privacy laws instead (Selling Software into Health Care in Part 1, and State Health Privacy & Sensitive Data in Part 3). For a product, the consequence is a fork in the data model: records a patient brought in through their own authorization are the patient's data in your app, governed by your privacy terms and those laws, while records a covered entity customer sent you are PHI under your BAA, and the two must never be mixed by accident.

Networks are the other patient path. TEFCA's Individual Access Services let an approved app query on a patient's behalf after the patient's identity is proofed to NIST IAL2, covered in [Networks & Exchange](/books/health-tech/health-information-exchange#individual-access-services) and [Patient Matching & Identity](/books/health-tech/patient-matching-and-identity#identity-proofing-and-ial2).

## How to Build It

The deltas against [The Core Data Model](/books/health-tech/health-tech-business#the-core-data-model). A SMART client registration is per EHR vendor and per customer instance; a grant is a user's or service's authorization at one instance, with the scopes actually granted and tokens encrypted.

```sql
CREATE TABLE smart_apps (                   -- this app's registration at an authorization server
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),  -- the customer
  integration_id     UUID NOT NULL REFERENCES integrations (id),
  iss                TEXT NOT NULL,            -- FHIR base URL; the instance
  client_id          TEXT NOT NULL,
  client_type        TEXT NOT NULL CHECK (client_type IN ('public', 'confidential_asymmetric',
                       'confidential_symmetric', 'backend')),
  launch_types       TEXT[] NOT NULL,          -- 'ehr', 'standalone'
  requested_scopes   TEXT[] NOT NULL,
  approved_scopes    TEXT[],                   -- what the customer agreed to enable
  key_id             TEXT,                     -- kid of the key pair, per connection
  jwks_url           TEXT,
  smart_configuration JSONB,                   -- .well-known/smart-configuration as fetched
  status             TEXT NOT NULL CHECK (status IN ('registered', 'sandbox', 'pending_customer',
                       'active', 'suspended', 'retired')),
  activated_at       TIMESTAMPTZ,
  UNIQUE (iss, client_id)
);

CREATE TABLE oauth_grants (                    -- one authorization: a user, a patient, or a service
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  smart_app_id    UUID NOT NULL REFERENCES smart_apps (id),
  grant_kind         TEXT NOT NULL CHECK (grant_kind IN ('ehr_launch', 'standalone_clinician',
                       'standalone_patient', 'backend')),
  fhir_user          TEXT,                     -- fhirUser claim, e.g. Practitioner/abc
  context_patient    TEXT,                     -- remote Patient id from the token response
  context_encounter  TEXT,
  granted_scopes     TEXT[] NOT NULL,          -- from the token response, not the request
  refresh_token_enc  BYTEA,                    -- envelope-encrypted; null for backend
  access_expires_at  TIMESTAMPTZ,
  data_origin        TEXT NOT NULL CHECK (data_origin IN ('covered_entity_customer',
                       'patient_directed')),   -- decides which privacy regime the data falls under
  granted_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at         TIMESTAMPTZ,
  revoked_reason     TEXT
);

CREATE INDEX oauth_grants_active_idx ON oauth_grants (smart_app_id) WHERE revoked_at IS NULL;

CREATE TABLE smart_launches (                  -- each EHR launch, before and after authorization
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  organization_id    UUID NOT NULL REFERENCES organizations (id),
  smart_app_id       UUID NOT NULL REFERENCES smart_apps (id),
  iss                TEXT NOT NULL,            -- must match the registration's instance
  launch_param_sha256 BYTEA,                   -- the opaque launch value, hashed
  state_sha256       BYTEA NOT NULL,           -- OAuth state, to bind the callback
  pkce_verifier_enc  BYTEA NOT NULL,           -- encrypted until the code exchange
  started_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  oauth_grant_id     UUID REFERENCES oauth_grants (id),  -- set when the token arrives
  outcome            TEXT CHECK (outcome IN ('authorized', 'denied', 'expired', 'error'))
);
```

Design decisions:

- **A registration is per instance.** The same app at two health systems has two `smart_apps` rows, often with different client ids, approved scopes and FHIR versions; `iss` is the instance's identity and every request is routed by it.
- **A launch is a short-lived record.** `smart_launches` binds the EHR's `iss` and `launch` values, the OAuth `state` and the PKCE verifier to the callback, refuses an `iss` that doesn't match a registered instance, and expires unfinished launches; a finished one points at the grant it produced.
- **Store what was granted.** `granted_scopes` comes from the token response, and the app's features check it; a grant narrower than the request is normal.
- **Tokens are secrets.** Refresh tokens are envelope-encrypted and never logged; access tokens live in memory or a short-lived cache ([Envelope Encryption](/docs/security/encryption-at-rest#envelope-encryption)). Backend services keep no refresh token and mint access tokens as needed.
- **Keys are per connection.** `key_id` points at a key pair used only for one customer instance, held in a KMS and rotated by publishing the new key in the JWKS before switching.
- **Origin decides the regime.** `data_origin` marks whether data arrived under a covered entity's BAA or a patient's own authorization, and every record pulled through a grant inherits it, so retention, sharing and deletion follow the right rules.
- **Revocation is a first-class event.** A patient revoking access at the EHR shows up as a failed refresh; the app records the revocation, stops syncing and keeps what its terms and the law allow, nothing more.

## Auditing

- **Every grant:** who authorized, at which instance, which scopes were requested and which granted, the launch context, and when it was revoked and why.
- **Every token use:** the grant, the FHIR requests made under it and the patients they touched, so "what did this app read about me?" has an answer for the patient and the health system ([Log Access, Not Just Changes](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Registrations and approvals per customer,** including the scopes each health system approved and the review records behind them.
- **Key lifecycle:** creation, publication, rotation and retirement of each connection's signing key, and every signing operation.
- **Data origin,** so records from patient-directed grants can be separated from customer PHI on request.

## What This Means for the System You Build

- **Implement SMART App Launch 2.x:** discovery, PKCE with S256, `aud`, v2 scopes, and v1 compatibility where a server still needs it.
- **Support both launches** if clinicians use the app: EHR launch for in-workflow use, standalone for everything else.
- **Use Backend Services for server-to-server sync,** with short-lived tokens and a key pair per customer connection.
- **Request the minimum scopes** and build features against what was granted.
- **Plan each EHR's program as a business process,** with per-customer activation, review and configuration, and confirm fees under contract.
- **Keep patient-directed data apart from customer PHI,** because different laws govern each.
- **Treat revocation as normal,** and stop using data you're no longer allowed to have.

## References

**Specifications**

- [HL7: SMART App Launch package list](https://hl7.org/fhir/smart-app-launch/package-list.json), versions 1.0.0 through 2.2.0 and their dates
- [HL7: SMART App Launch, app launch](https://hl7.org/fhir/smart-app-launch/app-launch.html), EHR and standalone flows, iss, launch and aud, PKCE S256, discovery, public and confidential clients, refresh
- [HL7: SMART App Launch, scopes and launch context](https://hl7.org/fhir/smart-app-launch/scopes-and-launch-context.html), v2 scope syntax, v1 mapping, launch context, openid and fhirUser, offline and online access, query-parameter scopes
- [HL7: SMART Backend Services](https://hl7.org/fhir/smart-app-launch/backend-services.html), client credentials with a JWT assertion, system scopes, five-minute tokens, out-of-band registration

**Regulation**

- [45 CFR 170.315: Certification criteria (Cornell LII)](https://www.law.cornell.edu/cfr/text/45/170.315), (g)(10) patient and group access, revocation within one hour
- [ASTP/ONC: HTI-1 Final Rule Overview and Key Dates (PDF, October 2025)](https://www.healthit.gov/sites/default/files/2024-03/Overview-and-Key-Dates-2024_508.pdf), SMART App Launch 2.0.0 by December 31, 2025, service base URLs published at no charge by December 31, 2024
- [CMS: Health Technology Ecosystem](https://www.cms.gov/health-tech-ecosystem), pledges, the Medicare App Library, the National Provider Directory

**In practice**

- [Epic on FHIR](https://fhir.epic.com/), free developer resource, sandbox, client registration, Showroom listings
- [open.epic](https://open.epic.com/), live apps and annual web service transactions, free USCDI v3 support
- [Epic: Epic launches Connection Hub](https://epic.com/epic/post/epic-launches-connection-hub), opening January 9, 2023, open to all vendors, App Market vendors moving to Vendor Services
- [Oracle Health: Millennium FHIR R4 overview](https://docs.oracle.com/en/industries/health/millennium-platform-apis/mfrap/r4_overview.html), SMART v1 and v2 scopes and authorization types per interaction
