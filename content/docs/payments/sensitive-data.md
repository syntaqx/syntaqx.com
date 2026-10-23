+++
title = "Sensitive Data"
description = "Handling card data and PII: keep PCI scope small with tokenization, never log secrets, redact by default, and treat access to sensitive data as an event."
category = "Payments"
order = 805
tags = ["payments", "security", "pci", "privacy"]
aliases = ["sensitive-data"]
+++

Payments, ledgers and webhooks all carry data an attacker wants: card numbers, bank details, names and addresses. The cheapest sensitive data to protect is the data you never touch. Every system that sees a card number has to be secured, audited and explained to an assessor, and every log line with an email address in it is a privacy liability for as long as the log is kept. So the design goal isn't "protect sensitive data everywhere"; it's "make sure most of the system never sees it", and then protect the small part that does.

## Keep PCI Scope Small

[PCI DSS](https://www.pcisecuritystandards.org/) applies to every system that stores, processes or transmits cardholder data, and to everything connected to those systems. Scope is the cost driver. A business that takes raw card numbers on its own servers owns the full standard, dedicated tooling and, at volume, an annual external assessment; one that never touches them answers a short questionnaire. The levels, questionnaires and assessments are in [PCI DSS](/docs/compliance/pci-dss); this chapter is about the engineering that keeps scope small.

- **Tokenize at the edge.** Card data goes from the browser or device straight to a vault (hosted payment fields, a processor SDK, a tokenization service), and your servers receive a token. A token is useless outside your processor account, so the rest of the platform, its logs, backups and engineers' laptops fall out of scope.
- **One small vault, if you need one at all.** Some businesses must hold card numbers, to route between processors for example. Then it's one isolated service on its own network segment, with its own keys and the smallest interface: tokenize, and detokenize only toward the processor. A vault with a convenient "get card number" endpoint is no longer a vault. [Running a Card Vault](/docs/industries/payments/card-vault) covers the design.
- **Never store the card verification code.** PCI DSS forbids it after authorization, even encrypted: it proves the cardholder has the card right now, and a stored one proves only that you were breached.

What the rest of the system may keep:

| Field | Allowed outside the vault | Why |
| ----- | ------------------------- | --- |
| Token | Yes | Only meaningful through your processor account |
| Last 4 digits | Yes | Lets a customer recognize their card |
| BIN (first 6 or 8) | Yes | Card routing and fraud signals |
| Brand, expiry month and year | Yes | Display and expiry reminders |
| Full card number | **No** | Brings the whole system into scope |
| Card verification code | **Never, anywhere** | Forbidden after authorization |

## Classify Every Field

Rules like "don't log PII" fail because nobody agrees what counts, so every field gets a classification that decides its handling:

| Class | Examples | Handling |
| ----- | -------- | -------- |
| Secret | API keys, webhook secrets, card numbers | Vault or secrets manager only, never logged, never returned after creation |
| Sensitive | Name, email, address, bank account last 4 | Encrypted at rest, masked in logs and support tools |
| Internal | IDs, statuses, amounts | Normal handling |

**New fields default to Sensitive** until someone decides otherwise; the opposite default means every new field leaks until someone notices, usually in an incident review.

## Logging and Errors

Logs are copied, shipped to vendors, kept for months and searched by many people. They're where sensitive data escapes most often, usually because someone logged a whole request object while debugging.

- **Redact by default, with allow-lists.** Logging goes through a serializer that drops classified fields. A deny-list ("never log `card_number`") fails the first time someone adds `cardNumber` or `pan`. An allow-list means a new field isn't logged until it's marked safe, so the mistake is a missing log line, not a leak.
- **No request bodies in logs** for endpoints that accept sensitive data. Log the [request ID](/docs/operations/observability), the route and the outcome. The request ID is enough to find everything else.
- **Errors never echo input.** `"The card number is invalid."`, not `"4242 4242 4242 4241 is invalid."` Error messages end up in client logs, support tickets and screenshots. The [error format](/docs/requests/error-responses) keys `errors` by field name partly for this reason: it can say which field is wrong without repeating it.
- **Scan for leaks.** CI and the log pipeline run a card-number detector ([Luhn](https://en.wikipedia.org/wiki/Luhn_algorithm)-valid runs of 13 to 19 digits) and alert on a match. Redaction is the control; scanning is how you find out it failed.

## Secrets

- **Show API keys once, store only a hash.** After creation, only a prefix is displayed (`sk_live_4f2a...`). If the database leaks, the keys don't, for the same reason passwords are hashed.
- **Prefix keys by type and environment:** `sk_live_`, `sk_test_`, `rk_live_` for restricted keys, `whsec_` for webhook secrets, as Stripe does. A leaked key is recognizable in a log or a paste, live can't be mistaken for test, and scanners like [GitHub's](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning) detect a fixed format reliably.
- **Prefer restricted keys** with only the permissions a caller needs: a key that can only create payments can't issue refunds to an attacker.
- **Rotation without downtime:** a rolled API key stays valid for up to **7 days** because it may be deployed across many services and teams, and a rolled webhook secret for **24 hours** because it lives in one endpoint. Key design and rotation are covered in [API Authentication](/docs/api-design/authentication).

## Access

- **Production access is just-in-time,** approved and time-boxed. Standing access means every engineer's laptop is a path to customer data.
- **Every read of sensitive data through support tooling is an audited event:** who, what, when and why. Audits don't only catch abuse; they answer the customer who asks who looked at their account.
- **Test and staging use synthetic data.** A production copy in staging is production data with weaker controls. See [Environments](/docs/operations/environments).

## References

**Specifications**

- [PCI Security Standards Council: Document Library](https://www.pcisecuritystandards.org/document_library/), PCI DSS requirements and scope

**Reference**

- [Wikipedia: Luhn algorithm](https://en.wikipedia.org/wiki/Luhn_algorithm), detecting card numbers in logs

**In practice**

- [Stripe: Integration security guide](https://docs.stripe.com/security/guide), why tokenized integrations cut PCI obligations, and which card details are safe to store
- [Stripe: API keys](https://docs.stripe.com/keys), key prefixes, restricted keys, show-once and rotation
- [OWASP: Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html), data to exclude from logs
- [OWASP: Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html), storing and rotating secrets
- [GitHub: About secret scanning](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning), prefixed keys that scanners can find
