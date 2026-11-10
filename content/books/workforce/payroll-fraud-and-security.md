+++
title = "Payroll Fraud & Security"
nav_title = "Fraud & Security"
description = "Direct deposit diversion and email compromise, W-2 phishing, ghost employees, time theft, portal takeover, insider risk, SSN and bank data, and what works."
category = "Workforce Industry"
order = 2661
part = "Running the Platform"
tags = ["payroll", "fraud", "security", "bec", "account-takeover", "sensitive-data"]
+++

Payroll is a target because it is a scheduled, trusted, recurring outflow of money to bank accounts that a few people can change, wrapped around a file of every employee's Social Security number. The fraud follows the two assets. Against the money, a criminal redirects a real employee's paycheck to an account they control, invents an employee who doesn't exist, pads hours, or takes over the employer's own account to run a payroll to themselves. Against the data, a criminal asks payroll, convincingly, for every employee's W-2, and files tax returns in their names. The controls that stop most of it are unglamorous: verify changes out of band, notify the person whose account changed, separate the people who add, change and approve, look at what's different this run, and keep the SSNs and account numbers where a stolen login can't read them in bulk.

This chapter covers direct deposit change fraud and business email compromise, W-2 phishing and the IRS's reporting steps, ghost employees and time theft, account takeover of employee and admin portals, insider risk at providers, SSN and bank data protection, and the controls that work, as a platform builds them. The fraud that makes an employer's debit fail (fake employers and bust-outs) is in [When the Debit Fails](/books/workforce/failed-debits-and-recovery#fraud-patterns); the account verification steps are in [Direct Deposit, Pay Cards & Checks](/books/workforce/paying-employees#verification-and-account-changes); the rail-level fraud tooling is Payments' [Fraud & Risk](/books/payments/fraud-and-risk#bank-rail-fraud).

## How the Platforms Do It

What agencies and providers publish about payroll fraud and its controls, as of November 2026:

| Source | What it says |
| --- | --- |
| **ADP** | A November 2024 account takeover alert: fraudsters "trick users into compromising their sign-on credentials on malicious websites," and "frequently use paid ads to trick users"; users should bookmark the login, check URLs, "Use Multi-Factor Authentication (MFA) whenever offered," and know "ADP will never call you and ask you for" a one-time code; further alerts in 2026 on phishing campaigns themed "Revised Payroll Agreement" and "Employee Payroll Review" |
| **Check** | Taxes and net pay locked at the `reopen_deadline`, so a change after it can't redirect the run in flight ([Embedded Payroll](/books/workforce/embedded-payroll#the-payroll-state-machine)) |
| **FBI IC3** | A 2018 public service announcement on payroll diversion: employees phished for their login credentials, after which "Direct deposits are then changed and redirected to an account controlled by the cybercriminal," with education, healthcare and commercial airway transportation most affected; a 2024 announcement putting business email compromise's exposed losses at $55,499,915,582 from October 2013 to December 2023 and advising "secondary channels and/or two-factor authentication to verify requests for changes in account information" |
| **Finch** | Unified API access tokens stored on the backend and never returned to the frontend ([Unified HR & Payroll APIs](/books/workforce/unified-hr-apis#consent-tokens-and-security)) |
| **IRS** | W-2 data theft: spoofed emails that appear to come from an executive asking payroll or HR for "a list of all employees and their Forms W-2"; a reporting procedure for victims and for those who only received the email; and for businesses, "Beware of phishing emails, the most common tactic used to steal data" |

Three patterns. **The attack is on people, not systems.** Every published scheme begins with a convincing message (a phishing page, a spoofed executive, a fake login ad) and ends with an authorized user or a legitimate-looking request doing the damage. **The defense is a second channel.** IC3's advice for account changes and the IRS's advice for unexpected requests are the same: confirm through a channel the requester didn't supply. **Timing is the tell.** Diversion happens right before payday, W-2 theft right before filing season, and an account takeover right before a run, because each needs the money or the data to move before anyone notices.

## The Size of It

The IC3's 2025 report counts 1,008,597 complaints and $20.877 billion in reported losses, a 26% increase in losses over 2024; business email compromise losses were $3,046,598,558, up from $2,770,151,146 in 2024 and $2,946,830,270 in 2023, and "businesses reported losses over $30 million to BEC scams involving AI." The IC3 defines BEC as "a scam targeting businesses or individuals working with suppliers and/or businesses regularly performing wire transfer payments," carried out by "compromising email accounts and other forms of communication ... through social engineering or computer intrusion techniques to conduct unauthorized transfer of funds." The reports don't break out payroll diversion, so the payroll share of those losses isn't public.
<!-- source-gap: wf-payroll-diversion-losses | missing | the number of payroll diversion incidents or losses as a share of BEC | closes with: an IC3 or FinCEN publication that breaks out payroll diversion | checked: 2026-11-10 -->

## Direct Deposit Change Fraud and Business Email Compromise

The scheme comes in two forms, and both end with a real employee's paycheck in a criminal's account:

- **Credential phishing.** The IC3 describes it: "Cybercriminals target employees through phishing emails designed to capture an employee's login credentials," log into the self-service portal, change the direct deposit, often to a prepaid card, and alter the account so the employee doesn't receive alerts of the change.
- **Impersonation to HR.** An email that appears to come from the employee (a lookalike address, or the employee's real mailbox after a compromise) asks payroll to update the bank account "before Friday." A helpful administrator makes the change. This is business email compromise aimed at payroll rather than accounts payable.

The employee notices on payday, when nothing arrives. By then the credit has settled to an account the criminal controls and is withdrawn. Whether the employer pays the employee again (it usually must; the wages are still owed) and whether the provider or the bank recovers anything are the aftermath. The receiving account is often at a prepaid or fintech bank, and a reversal of a credit is possible under the ACH rules only for narrow reasons ([Returns: When Money Is Really Yours](/books/payments/ach#returns-when-money-is-really-yours)).

The controls that work, in the order they stop the fraud:

- **Step-up authentication on the change.** A bank account change in a portal requires a fresh second factor, not just an active session ([Step-Up for Sensitive Actions](/docs/security/authentication#step-up-for-sensitive-actions)).
- **Out-of-band verification for changes requested by message.** An administrator never changes an account because of an email; the employee makes the change in the portal, or the administrator confirms by calling a number already on file, which is IC3's "secondary channels."
- **Notify the old contacts.** Every account change sends a notice to the employee's previous email and phone on file, not only the current ones, so a takeover that changed the email also gets seen.
- **Lock destinations at approval.** A change after a run is approved applies to the next run, never the current one.
- **Hold or split the first payroll to a new account.** A first deposit to a changed account within a few days of the check date goes to verification, or pays a small amount to the new account and the rest to the old one, or is paid by check.
- **Watch the receiving side.** Several employees changing to accounts at the same bank, routing number or prepaid program in one week is a campaign, not a coincidence.

### Worked Numbers: A Hold Rule

Invented: a platform pays 1,000,000 direct deposits a month. Its rule holds a deposit for verification when the account was changed within 5 days of the check date and the new account has never received a deposit. Say 0.5% of deposits go to accounts changed in the last 5 days, 5,000 a month, and the employee confirms 96% of them within a business day by the in-app prompt or a call to the number on file. The other 4%, 200, take longer: most are employees who changed banks and missed the prompt, and a handful are diversions.

| | Without the rule | With the rule |
| --- | --- | --- |
| Deposits held per month | 0 | 5,000, of which 4,800 released the same day |
| Late paychecks from holds | 0 | About 200, released as soon as confirmed |
| Diversions paid out (say 20 a month at an average $2,400 net) | $48,000 a month | Stopped before release |

The rule converts a loss the employer or provider absorbs into a delay a legitimate employee resolves with one confirmation. The window and the trigger are the levers: holding every change catches more and delays more, and a change made weeks before payday is less suspicious than one made the night before. A state's final pay and payday rules still apply to a held paycheck, so the hold has to end in payment by the deadline, by another method if the new account can't be confirmed ([Pay Frequency, Pay Statements & Final Pay](/books/workforce/pay-frequency-statements-and-final-pay)).

## W-2 Phishing

W-2 data theft targets the file, not a paycheck. The IRS describes the scam as a spoofed email that appears to come from an executive and is sent to payroll or HR, "requesting a list of all employees and their Forms W-2"; it calls the scheme business email compromise or business email spoofing. The data feeds fraudulent tax returns: "Criminals also target businesses and payroll companies by email to steal Form W-2 data," and "They file fraudulent returns in other people's names for refunds."

The IRS's steps for an employer that lost data:

- **Email `dataloss@irs.gov`** with "W2 Data Loss" in the subject, the business name, EIN, a contact name and phone, a summary of how the loss occurred and the number of employees affected; "Do not attach any employee personally identifiable information (PII) data." "If notified quickly after the loss, the IRS may be able to take steps" to protect the employees.
- **Notify the states** through `statealert@taxadmin.org`, and file a complaint with the IC3; victims "may be asked to file a report with their local law enforcement agency."
- **Point employees to identity theft resources,** including Publications 5027 and 4524 and the FTC's data breach guide for businesses.

An employer that only received the email saves it with full headers as plain text and sends it to `phishing@irs.gov` with "W2 Scam" in the subject, without attaching sensitive data; forwarding the email normally "strips important data to identify and stop the scammer."

The product controls are about making the request impossible to satisfy by email. No feature exports every employee's W-2s, or a census with full SSNs, as a file an administrator can attach; bulk W-2 access is a report viewed in the product, behind step-up authentication, logged and alerted on. SSNs are masked by default on screens and exports ([SSNs on Statements, W-2s and Screens](/books/workforce/employee-records-and-privacy#ssns-on-statements-w-2s-and-screens)). And the season is known: January and February, when W-2 requests look routine, are when a platform should warn administrators about the scam inside the product.

## Ghost Employees and Time Theft

**Ghost employees** are workers on the payroll who don't work there: an invented person added by someone with access, or a real former employee who was never terminated and whose pay now goes to a different account. The paychecks look normal to everyone except the person who would know the worker doesn't exist. Signals a platform can compute:

- **Shared bank accounts.** Two or more workers paid to the same account, especially when one was recently changed.
- **Missing paper.** An active employee with no I-9 record ([Onboarding: I-9, E-Verify & New Hire Reporting](/books/workforce/onboarding-i9-and-new-hires)), no W-4 on file, no time entries for a salaried role that requires them, no manager, or a home address shared with the administrator who added them.
- **No reductions.** A worker never takes leave, never changes benefit elections, and has no logins to self-service.
- **Created and approved by one person.** The hire, the bank account and the approval of the first run all by the same user.
- **Terminated in the HRIS, active in payroll.** The reconciliation in [HRIS-to-Payroll Integration](/books/workforce/hris-record-of-truth#hris-to-payroll-integration) catches the leaver who was never removed.

The control is a periodic master file review: every manager confirms their active reports, and every worker without a confirming manager is investigated. It's the one control that catches the ghost the signals miss.

**Time theft** is padding hours: a coworker clocking in for an absent colleague, a manager editing punches upward, or a worker clocking in from home. The capture side is covered in [Buddy Punching](/books/workforce/time-clocks-and-biometrics#buddy-punching) and [Mobile and Geofenced Punches](/books/workforce/time-clocks-and-biometrics#mobile-and-geofenced-punches); the payroll side is keeping raw punches and every edit with its actor and reason ([Edits, Approvals and Locks](/books/workforce/time-and-attendance#edits-approvals-and-locks)), so an edit pattern (one manager adding time to the same two workers every week) is a query.

## Account Takeover of Portals

There are two portals and two kinds of takeover. **Employee self-service** takeovers redirect one paycheck, as above. **Administrator** takeovers are worse: an attacker in an employer's admin account can add workers, change any account, approve an off-cycle run and, in the extreme, change the employer's own funding account. ADP's alert describes the entry: credentials typed into a fake login page reached through a paid search ad. Credential stuffing (passwords reused from other breaches) is the other common route ([Credential Stuffing and Enumeration](/docs/security/authentication#credential-stuffing-and-enumeration)).

The defenses are the playbook's authentication controls, applied with payroll's priorities:

- **Strong authentication for administrators by default:** passkeys or MFA required, not offered ([Passkeys First](/docs/security/authentication#passkeys-first), [Multi-Factor Authentication](/docs/security/authentication#multi-factor-authentication)).
- **Recovery as hard as login.** Resetting an admin's MFA by a support call is the takeover; the recovery path needs the same verification as the original enrollment ([Recovery Is the Real Login](/docs/security/authentication#recovery-is-the-real-login)).
- **Step-up and second approval for the dangerous actions:** bank account changes, adding an administrator, changing the funding account, approving an off-cycle run outside the normal schedule.
- **New-session alerts** to the user and to the company's other administrators, and alerts on logins outside normal hours, which the IC3 also recommends.
- **Rate limits per company** on bank account changes and new workers, so a takeover can't change every account in one sitting.

## Insider Risk at Providers

A provider's own staff can see every client's SSNs and bank accounts and, in some roles, move money. Two public cases show the extreme: MyPayrollHR rerouted client debits to an account its owner controlled, and Pinnacle Workforce Solutions altered the coded file to send client funds to itself ([When Payroll Providers Fail](/books/workforce/when-providers-fail#the-public-record)). The controls are dual control and the absence of standing access:

- **Support access is delegated, read-only by default, time-boxed and visible to the client** ([Delegation, Not Impersonation](/docs/security/support-access#delegation-not-impersonation), [Visible to Both Sides](/docs/security/support-access#visible-to-both-sides)).
- **No one person can change where money goes.** Changes to a client's funding account, settlement accounts, file routing or the bank's ODFI configuration need two people, and nobody approves their own ([Approvals, and Nobody Approves Their Own](/docs/security/support-access#approvals-and-nobody-approves-their-own)).
- **Money movement files are generated from approved rows only,** and their totals reconcile to approved runs before transmission; a file that adds an entry the rows don't contain doesn't leave.
- **Reconciliation independent of operations.** Funds held against obligations, deposits against liabilities, reconciled daily by people who don't run the payrolls ([Reconciling Funds Held to Obligations](/books/workforce/client-funds-and-impounds#reconciling-funds-held-to-obligations)).

## SSN and Bank Data Protection

The core model already stores identifiers the safe way: `persons.tin_token` and `tin_last4`, never the SSN; `bank_accounts.account_token` and `account_last4`, never the account number. The rest is where those tokens resolve and who can make them:

- **Classify every field** (SSN, date of birth, bank account, pay rate, garnishment type, medical leave) and apply handling rules per class: masked in the UI, excluded from logs and error messages, never in analytics ([Classify Every Field](/docs/security/sensitive-data#classify-every-field), [Logging and Errors](/docs/security/sensitive-data#logging-and-errors)).
- **A vault resolves tokens,** and only the services that need the clear value call it: the filing service writing a W-2 file, the ACH file builder, the new hire report. Every detokenization is logged with its purpose ([Logging Key Use](/docs/security/encryption-at-rest#logging-key-use)).
- **Look up without decrypting.** Duplicate SSN checks and "find employee by SSN" use a keyed hash, not a decrypted scan ([Looking Things Up Without Decrypting](/docs/security/encryption-at-rest#looking-things-up-without-decrypting)).
- **Bulk access is an event.** A user who views more than a threshold of SSNs or bank accounts in a session triggers an alert ([Log Access, Not Just Changes](/docs/building-blocks/audit-trails#log-access-not-just-changes)).
- **Integrations get scopes.** A benefits integration doesn't get bank accounts; a time clock doesn't get SSNs ([Read Scopes](/books/workforce/unified-hr-apis#read-scopes)).

## Controls That Work

The controls, against the frauds they stop:

| Control | Diversion | W-2 theft | Ghost employee | Time theft | Admin takeover | Insider |
| --- | --- | --- | --- | --- | --- | --- |
| Step-up authentication on sensitive actions | Yes | Yes | | | Yes | |
| Out-of-band verification of requested changes | Yes | Yes | | | | |
| Notify old contacts on account and profile changes | Yes | | | | Yes | |
| Lock destinations at approval; hold first pay to a new account | Yes | | Yes | | Yes | |
| Separate who adds, changes and approves | | | Yes | Yes | Yes | Yes |
| Variance review per run ([Worked Numbers: A Variance Review](/books/workforce/controls-audits-and-soc1#worked-numbers-a-variance-review)) | | | Yes | Yes | Yes | |
| Periodic master file review by managers | | | Yes | | | |
| No bulk W-2 or SSN export; masked by default | | Yes | | | | Yes |
| Dual control on funding and file routing | | | | | Yes | Yes |
| Shared-account and receiving-bank signals | Yes | | Yes | | Yes | |

No single control covers everything; separation of duties and the per-run variance review cover the most. My default for a platform is to ship all of them on, with the employer able to tune thresholds but not to turn off step-up on bank changes or the notice to old contacts.

## How to Build It

These are deltas against [the core data model](/books/workforce/workforce-business#the-core-data-model). `bank_accounts`, `pay_distributions` and `workers` exist; [Direct Deposit, Pay Cards & Checks](/books/workforce/paying-employees#how-to-build-it) added `prenotes`. This chapter adds holds on changed accounts, fraud signals and security events.

```sql
-- A change to where money goes, held until verified; the run reads only released destinations.
CREATE TABLE account_change_holds (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  worker_id           UUID REFERENCES workers (id),       -- a deposit account change
  employer_id         UUID REFERENCES employers (id),     -- a funding account change
  pay_distribution_id UUID REFERENCES pay_distributions (id),
  new_bank_account_id UUID NOT NULL REFERENCES bank_accounts (id),
  previous_bank_account_id UUID REFERENCES bank_accounts (id),
  changed_by          TEXT NOT NULL,         -- the worker, an admin, an integration
  changed_via         TEXT NOT NULL CHECK (changed_via IN ('self_service', 'admin', 'import',
                        'api', 'support')),
  step_up_method      TEXT,                  -- 'passkey', 'totp', 'sms', null if none
  notified_previous_contacts_at TIMESTAMPTZ,
  reason              TEXT NOT NULL,         -- 'near_check_date', 'first_deposit', 'signal', ...
  verification        TEXT CHECK (verification IN ('in_app_confirm', 'callback_on_file',
                        'prenote', 'micro_entries', 'manager_confirm')),
  status              TEXT NOT NULL CHECK (status IN ('held', 'released', 'rejected', 'expired')),
  decided_by          TEXT,
  decided_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((worker_id IS NULL) <> (employer_id IS NULL))
);

-- What a detector saw, scored, and what happened to it; labels arrive later.
CREATE TABLE fraud_signals (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID NOT NULL REFERENCES companies (id),
  subject_table       TEXT NOT NULL,         -- 'workers', 'bank_accounts', 'pay_runs', 'time_entries'
  subject_id          UUID NOT NULL,
  signal              TEXT NOT NULL,         -- 'shared_account', 'change_near_check_date',
                                             -- 'receiving_bank_cluster', 'no_i9', 'self_approved',
                                             -- 'edit_pattern', 'bulk_ssn_view', ...
  detector_version    TEXT NOT NULL,
  score               NUMERIC(5, 4),
  detail              JSONB NOT NULL DEFAULT '{}',
  action              TEXT NOT NULL CHECK (action IN ('none', 'review', 'hold', 'block')),
  account_change_hold_id UUID REFERENCES account_change_holds (id),
  label               TEXT CHECK (label IN ('fraud', 'legitimate', 'unknown')),
  labeled_by          TEXT,
  labeled_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Authentication and access events that matter to payroll fraud.
CREATE TABLE security_events (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  company_id          UUID REFERENCES companies (id),
  actor               TEXT NOT NULL,         -- user, staff member or integration
  actor_kind          TEXT NOT NULL CHECK (actor_kind IN ('employee', 'admin', 'staff',
                        'integration')),
  event               TEXT NOT NULL,         -- 'login', 'login_failed', 'mfa_reset', 'new_device',
                                             -- 'step_up', 'admin_added', 'sensitive_view',
                                             -- 'export', 'support_session', ...
  sensitive_count     INT,                   -- SSNs or account numbers revealed, for views
  ip                  INET,
  user_agent          TEXT,
  occurred_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Accounts receiving pay for more than one worker in the same employer: a ghost or diversion signal.
SELECT b.routing_number, b.account_token, r.employer_id, COUNT(DISTINCT d.worker_id) AS workers
FROM pay_distributions d
JOIN bank_accounts b ON b.id = d.bank_account_id
JOIN workers r ON r.id = d.worker_id
WHERE d.valid_during @> CURRENT_DATE
GROUP BY 1, 2, 3
HAVING COUNT(DISTINCT d.worker_id) > 1;
```

Design notes:

- **The run reads only released destinations.** Distribution resolution at approval skips any `pay_distributions` row whose bank account has a `held` hold and falls back to the previous account or a check, so a hold can never be bypassed by timing.
- **Tokens make the shared-account query possible without detokenizing,** because the same account produces the same token in the vault's deterministic mode; a vault without one stores a keyed hash for matching.
- **Signals are decisions with labels.** `fraud_signals` keeps the detector version, the action and the eventual label, so thresholds are tuned on outcomes, not complaints ([The Decision Record](/docs/building-blocks/risk-scoring#the-decision-record), [Labels Arrive Late](/docs/building-blocks/risk-scoring#labels-arrive-late)).
- **Security events are separate from the audit trail** of data changes, retained on their own schedule, and feed alerts for MFA resets, new administrators and bulk views.
- **Events:** `bank_account.changed` (to notification, with previous contacts), `account_change_hold.created`, `admin.added` and `sensitive.bulk_view` go to the employer's administrators and the provider's fraud queue.

## Auditing

Fraud cases end in disputes about who did what, and the records have to settle them:

- **Every change to a bank account or distribution** with the actor, channel, step-up method, notices sent and hold outcome.
- **Every authentication event** for administrators and employees, including MFA resets and new devices.
- **Every view and export of SSNs and account numbers,** with counts.
- **Every fraud signal** with its detector version, action and label.
- **Every staff support session** with its reason, scope, approver and duration.

These records are also what a SOC 1 auditor samples for the logical access objective ([Controls, Audits & SOC 1](/books/workforce/controls-audits-and-soc1#what-a-payroll-soc-1-covers)) and what the IRS asks about in a data loss.

## What This Means for the System You Build

- **Require step-up for bank account changes,** and notify the old email and phone, not just the new.
- **Never change an account because of an email;** make employees change their own, or confirm through a channel on file.
- **Lock destinations at approval and hold first pay to a changed account** near the check date, with a payment fallback that meets payday law.
- **Make bulk W-2 and SSN exports impossible by email,** mask by default, and warn administrators in January.
- **Separate adding, changing and approving,** run a variance review every payroll, and have managers confirm their reports periodically.
- **Default administrators to passkeys or MFA,** guard recovery as hard as login, and rate-limit dangerous actions per company.
- **Give staff no standing access and no single-person control of money routing.**
- **Tokenize identifiers, log every reveal, and alert on bulk views.**

## References

**Agency guidance and forms**

- [IRS: Form W-2/SSN data theft, information for businesses and payroll service providers](https://www.irs.gov/newsroom/form-w-2-ssn-data-theft-information-for-businesses-and-payroll-service-providers), the scam, reporting a loss to `dataloss@irs.gov` and the states, and reporting the email to `phishing@irs.gov`
- [IRS: Report phishing](https://www.irs.gov/privacy-disclosure/report-phishing), subject lines and why forwarding strips header data
- [IRS: Tax scams and consumer alerts](https://www.irs.gov/newsroom/tax-scams-consumer-alerts), criminals targeting businesses and payroll companies for W-2 data
- [IRS: Identity theft information for businesses](https://www.irs.gov/identity-theft-central/identity-theft-information-for-businesses), phishing as the most common tactic and confirming senders
- [FBI IC3: Payroll diversion PSA (September 18, 2018)](https://www.ic3.gov/PSA/2018/PSA180918), credential phishing, redirected direct deposits, suppressed alerts, affected sectors and recommendations
- [FBI IC3: Business Email Compromise, the $55 billion scam (September 11, 2024)](https://www.ic3.gov/PSA/2024/PSA240911), exposed losses from 2013 to 2023 and verifying account changes through secondary channels
- [FBI IC3: 2025 Internet Crime Report](https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf), complaints, losses and business email compromise losses for 2023 to 2025, and AI-assisted BEC
- [FBI IC3: 2024 Internet Crime Report](https://www.ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf), the definition of business email compromise

**Vendor documentation**

- [ADP: Security alert, account takeover (November 2024)](https://www.adp.com/about-adp/data-security/alerts/account-takeover-ato-11082024), credential phishing through paid ads and recommended controls
- [ADP: Security alerts](https://www.adp.com/about-adp/data-security/alerts.aspx), the 2026 payroll-themed phishing campaigns
- [Check: Life of a payroll](https://docs.checkhq.com/docs/life-of-a-payroll.md), taxes and net pay locked at the reopen deadline
- [Finch: Backend security](https://developer.tryfinch.com/implementation-guide/Backend-Application/Backend-Security.md), access tokens kept on the backend
