+++
title = "Support Access & Internal Tools"
nav_title = "Support Access"
description = "How staff reach customer data safely: delegation over impersonation, read-only by default, reasons, banners, time limits, approvals and internal consoles."
category = "Security"
order = 710
tags = ["security", "authorization", "support", "internal-tools", "audit"]
+++

Every product grows a back door, and it's usually the support tool. A player says their rare items vanished; a SaaS admin can't find the setting they changed; a merchant can't find a payout; a homeowner wants to know why the technician didn't come. Answering means seeing what the customer sees, and sometimes acting for them, so staff end up with the broadest access in the company through the least-reviewed code. That's why "support needs to see everything" deserves its own rules. The customer's [authorization](/docs/security/authorization) model protects them from each other; this chapter is about protecting them from you, and protecting your staff from being the easiest account to phish.

The big cloud providers show where the bar is. Google's Access Transparency logs record the resource, the action, the time and the reason whenever Google personnel access customer data, and "all access to Customer Data requires a valid justification"; Access Approval lets the customer authorize the request first ([Google Cloud: Access Transparency](https://docs.cloud.google.com/assured-workloads/access-transparency/docs/overview)). Microsoft's Customer Lockbox sends the customer's approvers an access request that expires after four days if nobody acts, and an approval grants access only for the duration stated in the request ([Customer Lockbox](https://learn.microsoft.com/en-us/azure/security/fundamentals/customer-lockbox-overview)). You don't need their machinery, but every product can have their properties: a reason, a time limit, a record and a customer who can find out.

## Delegation, Not Impersonation

"Log in as this customer" comes in two designs, and RFC 8693 names them. With **impersonation**, A is given all of B's rights and "is indistinguishable from B in that context". With **delegation**, "principal A still has its own identity separate from B" and acts as B's agent ([RFC 8693: OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693)). Build delegation. Impersonation turns every action support takes into an action the customer took, which is wrong in the audit trail, wrong in the customer's activity feed, and wrong in front of a judge.

RFC 8693's `act` claim carries the second identity in a token: the subject is the customer, and `act` names who's actually acting.

```json
{
  "sub": "0193a6c4-5b2e-7c10-9f1d-2a7e8b4c6d01",
  "act": { "sub": "staff:0193a6c4-8f3a-7d22-b0e4-6c1d9a2f7e55" },
  "scope": "account:read",
  "sid": "0193a6c5-0a17-7e9b-8c42-3f5d1e6b9a70",
  "exp": 1793001600
}
```

Whatever the mechanism (a token, a server-side session with two user columns), the rules are the same:

- **Every write records the staff member as the actor and the customer as the subject.** The audit trail's typed actors make this a field, not a convention ([Audit Trails](/docs/architecture/audit-trails#typed-actors)).
- **Authorization runs as the intersection.** A delegated session can do what the customer can do *and* what the staff member's role allows, never the union. A support agent can't use a customer's admin role to reach another tenant, and a customer's limits still apply.
- **Sign-in factors are off limits.** No delegated session can see or change the customer's password, passkeys, MFA, recovery contacts or API keys. Those changes go through the customer's own [recovery](/docs/security/authentication#recovery-is-the-real-login) flow, because "support changed my email, then someone else logged in" is the classic account takeover.
- **Chains stay visible.** When an AI agent acts for a staff member who acts for a customer, nest the actors. RFC 8693 treats prior actors in a chain as "informational only", not inputs to access control, so the check still runs against the current actor.

## Read-Only by Default

Most support questions are answered by looking. Start every session read-only, and make acting a separate, deliberate step with its own permission: paying with a saved card, cancelling a subscription, restoring a deleted project, granting items to a player, adding a user to a team. Upgrading a session to act requires a reason specific to the action and, for anything that moves money, changes ownership or can't be undone, the customer's consent (on the call, in the ticket) or a second approver.

Read-only also means **masked by default**. The support view shows the last four digits of a card, a partial email, a redacted gate code; revealing a full value is its own logged action, and some values (full card numbers, secrets, other people's messages) are never revealable through support tooling at all ([Sensitive Data](/docs/payments/sensitive-data#access)).

## A Reason for Every Session

No session starts without a reason: a ticket or case ID (stored as `_xid`, since it lives in another system) and a reason code from a short list (`customer_request`, `incident`, `fraud_review`, `legal_request`). Free text alone gets filled with "checking". A reason makes the access reviewable later, and it makes it scoped now: the session is opened against the account in the ticket, not against "all customers".

```sql
CREATE TABLE support_sessions (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  staff_user_id   UUID NOT NULL REFERENCES staff_users (id),
  tenant_id       UUID NOT NULL REFERENCES tenants (id),
  subject_user_id UUID REFERENCES users (id),
  access          TEXT NOT NULL CHECK (access IN ('read_only', 'act')),
  reason_code     TEXT NOT NULL CHECK (reason_code IN
                    ('customer_request', 'incident', 'fraud_review', 'legal_request', 'break_glass')),
  ticket_xid      TEXT,
  approved_by_id  UUID REFERENCES staff_users (id),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL,
  ended_at        TIMESTAMPTZ,
  CONSTRAINT support_sessions_approved_by_id_check
    CHECK (approved_by_id IS DISTINCT FROM staff_user_id)
);
```

## Visible to Both Sides

**A banner the staff member can't miss.** A delegated session looks different: a colored bar naming the customer, the access level and the time left, with an end-session button. It stops the most common accident, a support agent changing a customer's settings while thinking they were in their own test account.

**A record the customer can see.** Business customers increasingly expect what the cloud providers offer: an access log in their admin settings listing who from your company accessed their account, when, and why. Consumers get a notification for anything done on their behalf that changes their account or their money ("Our support team cancelled your subscription at your request"), sent to their existing contact points. The notification is a control, not a courtesy: a staff member abusing access can't hide it from the person it affects.

**Customer approval where trust demands it.** For enterprise tenants, regulated data or accounts that ask for it, let the customer approve access before it starts, Lockbox-style: the request names the reason and duration, the customer's admins approve or deny, and unanswered requests expire.

## Time-Boxed Sessions

Support access ends on its own. I default to an hour for a read-only session and the duration of the task for acting, with `expires_at` enforced on the server, not a timer in the browser. Extending a session is a new request with a reason. Standing access ("the support team can open any account, any time") is the opposite of the just-in-time model that [Sensitive Data](/docs/payments/sensitive-data#access) requires for production; the same rule applies to the console.

**Break-glass access** exists for incidents where waiting for approval does more harm than the access: a security incident, data at risk, an outage. It skips the approval step and nothing else. It still requires a reason, still expires, pages a second person when used, and every use is reviewed afterwards. Customer Lockbox's own exceptions are of this kind: emergencies to restore service, prevent data loss, or investigate a security incident.

## Approvals, and Nobody Approves Their Own

Some actions need two people: refunds and credits above a threshold, ledger adjustments, ownership transfers, account merges, unbanning a player, raising a limit, exporting a customer's data. The requester and the approver are different people, enforced in the data (as the `CHECK` above does) and not by convention. NIST's separation of duties control exists for exactly this, to reduce "the potential for abuse of authorized privileges" by splitting duties across people ([NIST SP 800-53 Rev. 5, AC-5](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)).

- **Approval is bound to the action, not the person.** The approver approves *this* refund of *this* amount to *this* payment; a changed amount needs a new approval.
- **Approvers see what they're approving:** the customer, the amount, the reason, the requester's history with this account.
- **No approval chains through the same person.** A staff member can't approve a request made in a session they're also in, or one made by a service account they control.

## The Internal Console

The tool support, risk and finance use every day is a product, with users, a design and an owner. Built as an afterthought, it becomes a SQL client with a nicer font.

- **Find anything by any identifier.** Customers quote what they have: an email, a phone number, an order or invoice number, a gamertag, a device ID, a payment reference from their bank statement, a vendor's reference. The console resolves any of them to the record and shows its full history across systems. A search by email is itself access to personal data, so searches are logged too.
- **Act with recorded reasons and approvals.** Every action in the console is a named operation (refund, grant, suspend, restore, transfer) that calls the same domain service the product uses, with the staff actor, the reason and the approval passed through. No raw table edits, and no "fix it in the database" runbooks for things that happen weekly.
- **Adjust balances only by entries.** A goodwill credit, restored in-game currency, a waived fee or a corrected payout is a ledger transaction with a reason code and a second approver, never an edit to a balance ([Payment States & Ledgers](/docs/payments/payment-states#append-only-records)). Adjustments get their own report, reviewed by someone outside support.
- **Scope by role.** Tier-one support sees masked data for the accounts in their queue; fraud and risk see more; very few people can reveal anything. Roles follow [least privilege](/docs/security/authorization#least-privilege), and nobody can grant themselves a role.
- **Separate code path, separate front door.** Cross-tenant access belongs in internal tooling with its own permissions, not behind a flag in tenant code ([Multi-Tenancy](/docs/architecture/multi-tenancy)). The console sits behind staff [SSO](/docs/security/sso-and-federation) with phishing-resistant MFA, on its own origin, and off the public internet where you can manage it.

For examples in one industry, [Operating the Platform](/docs/industries/payments/operating-the-platform#the-internal-console) shows a payments console that finds a payment by a card network reference or an ACH trace number.

## Service Accounts Are Users

Integrations, scheduled jobs, support automations and AI agents act on customer data too. Each gets its own identity, its own scopes and its own entries in the audit trail, so "who changed this?" never answers "the admin account" ([Machines Are Not People](/docs/security/sso-and-federation#machines-are-not-people), [API Authentication](/docs/api-design/authentication#scopes)). A support bot that issues refunds is a staff member with a rate limit: it carries a reason, it's subject to the same thresholds and approvals, and the human who approved its action is recorded beside it. Shared logins for "the support team" are the same mistake with people.

## Logging Support Access

OWASP's list of higher-risk events includes "use of systems administrative privileges or access by application administrators including all actions by those users", along with access to sensitive data and data export ([OWASP: Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)). For support access that means:

- **Sessions:** started, upgraded, extended, ended or expired, with staff member, subject, reason, ticket, approver and access level.
- **Every read, not just every write.** Which records and fields were viewed, which were revealed, which searches ran and what they matched. The read is the abuse in most insider cases: browsing an ex-partner's account, a celebrity's orders, a coworker's payroll ([Audit Trails](/docs/architecture/audit-trails#log-access-not-just-changes)).
- **Every action,** with before and after values, the approval it used, and the domain operation it called.
- **Into the tamper-evident audit store,** not the console's own tables, where the people being audited can't edit their history.

Then look at it. Alert on patterns: sessions without a ticket, one agent opening far more accounts than peers, access to staff members' own accounts or accounts flagged as high-profile, break-glass use. Sample sessions every week and check the reason matched the activity. A log nobody reads catches nothing; a log someone samples weekly changes behavior.

## Checklist

- **Delegated sessions** that carry both identities, record staff as the actor, and authorize on the intersection of permissions.
- **Read-only and masked by default,** with acting and revealing as separate, logged steps.
- **A reason and a ticket** for every session, scoped to the account in question.
- **A banner for staff** and a notification or access log for the customer.
- **Server-enforced expiry,** no standing access, and break-glass that pages someone and gets reviewed.
- **Two-person approval** for money, ownership and irreversible actions, enforced in data, never self-approved.
- **An internal console** that finds by any identifier, acts through domain operations, and adjusts balances only by entries.
- **Service accounts and bots as users,** with their own identity, scopes and audit trail.
- **Every support read and write logged** to the audit store, alerted on, and sampled weekly.

## References

**Specifications**

- [RFC 8693: OAuth 2.0 Token Exchange](https://www.rfc-editor.org/rfc/rfc8693), delegation versus impersonation, the `act` claim, and prior actors as informational only
- [NIST SP 800-53 Rev. 5](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final), AC-5 separation of duties

**Reference**

- [OWASP: Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html), logging all actions by privileged users, sensitive data access and export, and protecting logs

**In practice**

- [Google Cloud: Access Transparency](https://docs.cloud.google.com/assured-workloads/access-transparency/docs/overview), logs of provider staff access with resource, action, time and justification, and Access Approval
- [Microsoft: Customer Lockbox for Microsoft Azure](https://learn.microsoft.com/en-us/azure/security/fundamentals/customer-lockbox-overview), customer approval of engineer access, four-day request expiry, time-limited grants and emergency exclusions
