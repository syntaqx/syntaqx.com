+++
title = "SSO & Identity Federation"
nav_title = "SSO & Federation"
description = "Signing people in through someone else's identity provider: OIDC with PKCE, validating ID tokens, SAML for enterprises, per-tenant SSO, SCIM and logout."
category = "Security"
order = 704
tags = ["security", "authentication", "sso", "oidc", "saml", "scim"]
+++

[Authentication & Sessions](/docs/security/authentication) covers signing people in yourself. Most products end up trusting someone else to do it: "Sign in with Google" for consumers, the customer's Okta or Entra ID for enterprises, a managed identity provider for everyone. That's federation: another system proves who the user is, and your application decides whether to believe it. Done right, it's more secure than anything you'd build, because the provider brings MFA, passkeys and its own security team. Done wrong, it's a way to sign in as anyone, because the bugs live in how the application checks what the provider sent.

## OpenID Connect Is the Default

For sign-in, I use [OpenID Connect](https://openid.net/specs/openid-connect-core-1_0.html): an identity layer on OAuth 2.0 that adds an **ID token**, a signed JWT saying who the user is, who issued it, and for which application. Every new integration uses the authorization code flow with PKCE.

![OpenID Connect sign-in with PKCE: the app creates a code verifier, state and nonce; it redirects the browser to the identity provider with the code challenge, state and nonce; the user signs in with MFA at the provider; the browser returns to the app with a one-time code and the state, which the app checks; the app exchanges the code and the verifier for an ID token and access token server to server; it validates the ID token's issuer, audience, expiry, nonce and signature, then starts its own session. The back channel and the session start are accented.](/diagrams/oidc-pkce.svg "Tokens never touch the browser. The browser only carries a one-time code; the app trades it for tokens over the back channel, proves it started the flow with the verifier, and validates the ID token before starting its own session.")

- **PKCE everywhere.** The app makes a random `code_verifier`, sends its hash as the `code_challenge`, and has to present the verifier to redeem the code, so a code intercepted on the way back is useless. [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700) requires PKCE for public clients and recommends it for confidential ones; I use it for both. The [OAuth 2.1 draft](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/), still an Internet-Draft, consolidates these practices.
- **The older flows are out.** RFC 9700 says clients should not use the implicit flow, which put tokens in the URL fragment, and must not use the password grant, which hands the user's password to the client.
- **Exact redirect URIs.** The provider must match registered redirect URIs exactly; a wildcard is how codes end up at an attacker's page.
- **`state` and `nonce` are different checks.** `state` ties the response to the browser that started the flow, stopping login CSRF. `nonce` goes into the ID token and ties the token to this sign-in, stopping replay.

**Validate the ID token, all of it.** The [validation steps](https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation) are short and every one matters: `iss` exactly matches the provider; `aud` contains your client ID and nothing you don't trust; the signature verifies with the provider's published keys and the algorithm you expect; `exp` hasn't passed; the `nonce` matches the one you sent. Fetch keys from the provider's JWKS endpoint, cache them, and refetch when a token arrives signed with a key ID you haven't seen, which is how providers rotate keys without breaking you. The JWT pitfalls in [RFC 8725](https://datatracker.ietf.org/doc/html/rfc8725), like accepting `alg: none`, apply here too; use a maintained library and configure it strictly.

**ID tokens and access tokens aren't interchangeable.** The ID token tells your application who signed in, and it's addressed to you. The access token is for calling an API, and it's addressed to that API. Never send an ID token to an API as a credential, and never treat an access token as proof of who the user is.

**Then start your own session.** After validation, map the provider's stable identifier (`iss` plus `sub`, never the email, which can change or be reassigned) to your user, and issue your own session as in [Authentication & Sessions](/docs/security/authentication). The provider's tokens aren't your session.

## SAML for Enterprise Customers

Large customers often still run [SAML 2.0](https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf), and selling to them means supporting it. It does the same job as OIDC with signed XML assertions, and XML signatures are where it breaks. In 2012, researchers [examined 14 major SAML frameworks](https://www.usenix.org/conference/usenixsecurity12/technical-sessions/presentation/somorovsky) and found critical XML Signature Wrapping flaws in 11, including Salesforce and Shibboleth: an attacker moves the signed assertion aside and inserts their own, and the application verifies one element but reads another.

- **Don't parse SAML yourself.** Use a well-maintained library, keep it patched, and treat its advisories as urgent.
- **Use only what the signature covered.** Validate the XML against the schema first, then read the assertion the verified signature references, never an element found by searching for a tag name ([OWASP SAML Security](https://cheatsheetseries.owasp.org/cheatsheets/SAML_Security_Cheat_Sheet.html)).
- **Check every condition.** `Audience` is your entity ID, `Destination` and `Recipient` are your assertion consumer URL, `NotOnOrAfter` hasn't passed, `InResponseTo` matches a request you sent, and an assertion ID is never accepted twice.
- **Be careful with IdP-initiated sign-in.** When the user starts at the customer's portal, there's no request to match, so there's no login CSRF protection. Prefer SP-initiated flows; where customers need IdP-initiated, add replay detection and allowlist any `RelayState` redirect.

## SSO for Business Customers

B2B SSO is mostly a multi-tenancy problem ([Multi-Tenancy](/docs/architecture/multi-tenancy)): each customer brings its own identity provider, and the application has to send the right people to the right one. Building all of it is a lot; [Choosing an Identity Provider](/docs/security/identity-providers) covers the products and libraries that do it for you.

- **Per-tenant configuration.** Each organization gets its own OIDC or SAML connection: issuer, client credentials or certificates, and the claims to read.
- **Verify domains before trusting them.** A tenant claims `acme.com` by proving control (a DNS record), so a stranger can't configure SSO for someone else's domain and capture their employees' sign-ins.
- **Home-realm discovery.** The sign-in page asks for an email and routes `@acme.com` to Acme's provider. Don't reveal which domains have SSO to anonymous visitors more than routing requires.
- **Enforce it when the customer asks.** Once a tenant turns SSO on, its members can't fall back to a password, or offboarding in their provider doesn't actually lock anyone out.

## Provisioning and Deprovisioning

Signing people in is half of it. The security-critical half is noticing when they leave.

- **Just-in-time provisioning** creates a user the first time someone signs in through SSO. It's easy, but it never removes anyone: a fired employee's account and data stay until someone notices, and if your sessions are long-lived, so does their access.
- **SCIM** ([RFC 7643](https://datatracker.ietf.org/doc/html/rfc7643) and [RFC 7644](https://datatracker.ietf.org/doc/html/rfc7644)) lets the customer's identity provider create, update and deactivate users in your application through a standard API. Deactivation sets `active` to `false` or deletes the user, and that event has to end every session that user has, right away. It's why I won't sell SSO without SCIM to customers who care about offboarding.
- **Groups to roles.** Map the provider's groups to your roles explicitly, per tenant, and recompute on every sign-in and SCIM update, so a removed group removes the permission ([Authorization](/docs/security/authorization)). Don't let an unmapped group grant anything.

## Logging Out Everywhere

Logging out of your application ends your session; it doesn't end the provider's, and the next "sign in with" click may go straight through. Single logout across applications is best effort:

- **RP-initiated logout** sends the user to the provider's logout endpoint after ending your own session.
- **[Back-channel logout](https://openid.net/specs/openid-connect-backchannel-1_0.html)** has the provider POST a signed logout token directly to each application when the user's provider session ends. It doesn't depend on the browser, so it's the one to rely on, but your logout endpoint must be reachable from the provider and must be able to find and end the right sessions by `sub` or `sid`.
- **Front-channel logout** loads each application's logout URL in the browser, and fails whenever the user has navigated away or the browser blocks it.

The dependable control is still on your side: short sessions, revocation that works, and SCIM deactivation that ends sessions immediately.

## Machines Are Not People

Services, jobs and CI pipelines need identities too, and they shouldn't borrow a person's. Give them their own credentials, scoped and rotated as in [API Authentication](/docs/api-design/authentication), and prefer workload identity federation to stored secrets: a pipeline proves who it is with a short-lived token from its platform ([GitHub Actions' OIDC tokens](https://docs.github.com/en/actions/concepts/security/openid-connect), for example) and exchanges it for cloud credentials that expire with the job, so there's no long-lived key to leak ([Environments & Configuration](/docs/operations/environments)).

## References

**Specifications**

- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html), the ID token and its validation steps
- [OpenID Connect Back-Channel Logout 1.0](https://openid.net/specs/openid-connect-backchannel-1_0.html), logout tokens sent directly from the provider, and how they compare with front-channel logout
- [RFC 9700: OAuth 2.0 Security Best Current Practice](https://datatracker.ietf.org/doc/html/rfc9700), PKCE, retiring the implicit and password grants, exact redirect URI matching
- [RFC 7636: Proof Key for Code Exchange](https://datatracker.ietf.org/doc/html/rfc7636), the code verifier and challenge
- [The OAuth 2.1 Authorization Framework (Internet-Draft)](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/), the consolidated successor, still in progress
- [RFC 8725: JSON Web Token Best Current Practices](https://datatracker.ietf.org/doc/html/rfc8725), algorithm and validation pitfalls that apply to ID tokens
- [OASIS: SAML 2.0 Core](https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf), assertions, conditions and signatures
- [RFC 7643: SCIM Core Schema](https://datatracker.ietf.org/doc/html/rfc7643), the user resource and its `active` attribute
- [RFC 7644: SCIM Protocol](https://datatracker.ietf.org/doc/html/rfc7644), creating, updating and deleting users over HTTP

**Reference**

- [OWASP: SAML Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SAML_Security_Cheat_Sheet.html), schema validation, signed-element processing, assertion checks and IdP-initiated risks
- [Somorovsky et al.: On Breaking SAML (USENIX Security 2012)](https://www.usenix.org/conference/usenixsecurity12/technical-sessions/presentation/somorovsky), XML Signature Wrapping in 11 of 14 frameworks

**In practice**

- [GitHub: OpenID Connect in GitHub Actions](https://docs.github.com/en/actions/concepts/security/openid-connect), short-lived cloud credentials for workflows instead of stored secrets
