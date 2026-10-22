+++
title = "Sensitive Data"
description = "Handling card data and PII: keep PCI scope small with tokenization, never log secrets, redact by default, and treat access to sensitive data as an event."
category = "Payments"
order = 7.4
tags = ["payments", "security", "pci", "privacy"]
+++

The cheapest sensitive data to protect is the data you never touch. Design so that raw card numbers and secrets don't reach most of the system at all, and treat everything else as sensitive until proven otherwise.

## Keep PCI Scope Small

Every system that stores, processes or transmits cardholder data is in [PCI DSS](https://www.pcisecuritystandards.org/) scope. Scope is the cost driver, so shrink it.

- **Tokenize at the edge.** Card data goes from the browser or device straight to a vault (hosted fields, a processor SDK, or a dedicated tokenization service). The rest of the platform only sees tokens.
- **One small vault.** If you must hold PANs, it's one isolated service with its own network segment, its own keys, and the smallest possible surface: tokenize, detokenize to the processor, nothing else.
- **Never store CVV/CVC.** Not encrypted, not briefly, not in logs. PCI forbids it after authorization.

What the rest of the system may keep:

| Field | Allowed outside the vault |
| ----- | ------------------------- |
| Token | Yes |
| Last 4 digits | Yes |
| BIN (first 6 or 8) | Yes, for routing and fraud |
| Brand, expiry month/year | Yes |
| Full PAN | **No** |
| CVV/CVC | **Never, anywhere** |

## Classify Data

Every field has a classification, and the classification decides how it's handled:

| Class | Examples | Handling |
| ----- | -------- | -------- |
| Secret | API keys, webhook secrets, PANs | Vault or secrets manager only, never logged, never returned after creation |
| Sensitive | Name, email, address, bank account last 4 | Encrypted at rest, masked in logs and support tools |
| Internal | IDs, statuses, amounts | Normal handling |

New fields default to **Sensitive** until someone decides otherwise.

## Logging and Errors

- **Redact by default.** Logging goes through a serializer that drops or masks classified fields. Allow-lists, not deny-lists: a new field isn't logged until it's marked safe.
- **No request bodies in logs** for endpoints that accept sensitive data. Log the [request ID](/docs/observability), the route and the outcome.
- **Errors never echo input.** `"The card number is invalid."`, not `"4242 4242 4242 4241 is invalid."` The [error format](/docs/error-responses) keys `errors` by field name for exactly this reason.
- **Scan for leaks.** CI and log pipelines run a PAN detector ([Luhn](https://en.wikipedia.org/wiki/Luhn_algorithm)-valid 13 to 19 digit runs) and fail or alert on a match.

## Secrets

- API keys are shown **once**, at creation. Afterward only a prefix is displayed (`sk_live_4f2a...`), and only a hash is stored.
- Keys are prefixed by type and environment, the way Stripe's are (`sk_live_`, `sk_test_`, `rk_live_` for restricted keys, `whsec_` for webhook secrets), so a leaked key is easy to identify and secret scanners can find it.
- Prefer restricted keys with only the permissions a caller needs.
- Every secret can be rotated without downtime. As with Stripe, a rolled API key stays valid for up to 7 days and a rolled webhook secret for up to 24 hours while clients switch over. See [API Authentication](/docs/api-authentication).

## Access

- Production access to sensitive data is just-in-time, approved, and time-boxed.
- Every read of sensitive data through support tooling is an audited event: who, what, when, and why.
- Test and staging use synthetic data. Production data is never copied down.

## References

**Specifications**

- [PCI Security Standards Council: Document Library](https://www.pcisecuritystandards.org/document_library/), PCI DSS requirements and scope

**Reference**

- [Wikipedia: Luhn algorithm](https://en.wikipedia.org/wiki/Luhn_algorithm), detecting card numbers in logs

**In practice**

- [Stripe: Integration security guide](https://docs.stripe.com/security/guide), reducing PCI scope and what card data is safe to store
- [Stripe: API keys](https://docs.stripe.com/keys), key prefixes, restricted keys, show-once
- [OWASP: Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html), data to exclude from logs
- [OWASP: Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html), storing and rotating secrets
- [GitHub: About secret scanning](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning), prefixed keys that scanners can find
