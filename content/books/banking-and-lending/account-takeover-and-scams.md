+++
title = "Account Takeover & Scams"
description = "Takeover and scams on deposit accounts: Reg E's unauthorized line, P2P scams and the Zelle suits, interventions, mules, elder exploitation, the UK."
category = "Banking & Lending Industry"
order = 2423
part = "Financial Crime"
tags = ["banking", "fraud", "account-takeover", "scams", "regulation-e", "p2p", "elder-financial-exploitation"]
+++

Most money stolen from deposit accounts now leaves through the front door. Either a criminal gets into the account (a phished password, a one-time code read out to a fake "fraud department", a SIM swap, a stolen unlocked phone) and sends the money themselves, or the customer is talked into sending it: to a romance interest, an investment platform, a fake IRS agent, or a "safe account" the bank's impersonator provided. To the core, both look like an authenticated customer making a P2P transfer, a wire or an instant payment. To the law, they are different events. The first is an **unauthorized electronic fund transfer** under Regulation E, with the liability limits and error resolution clocks that follow; the second, a transfer the customer made themselves, generally is not, and in the United States the loss stays with the customer unless the bank, the network or a court decides otherwise.

That line drives the engineering. The bank has to tell, after the fact, which kind of event a claim describes, run the Reg E process when the law applies, and decide what it owes when it doesn't. And because neither kind can be undone once an instant payment settles, it has to build its real defenses before the money moves: authentication that holds up against social engineering, friction on the changes that precede takeover, interventions on the payments that look like scams, and monitoring of the accounts on the receiving end, which are someone's mules.

This chapter is the account holder's institution's side: the numbers, Reg E's unauthorized line, account takeover, P2P scams and the Zelle litigation, interventions, mules, elder financial exploitation and the UK contrast. How the error claim itself runs (notice, 10 and 45-day clocks, provisional credit, liability tiers) is [Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes); card fraud scoring and authorized push payment fraud on the rails are [Fraud & Risk](/books/payments/fraud-and-risk#bank-rail-fraud); UK reimbursement mechanics are [APP Scam Reimbursement](/books/payments/eu-and-uk#app-scam-reimbursement); the scam industry from the platform side is [Crypto & Investment Scams](/books/user-generated-platforms/crypto-investment-scams).

## How the Platforms Do It

What vendors that sell takeover and scam controls to banks publish, as of October 2026:

| Vendor | What it sells | Signals and outputs it documents |
| --- | --- | --- |
| **Alloy** | Identity and fraud decisioning across onboarding and the account's life | An Events API for ongoing monitoring after onboarding, journeys with step-up states, and case management |
| **BioCatch** | Session and behavior analysis for digital banking | Account Takeover Protection that monitors "beyond the point of login" for remote access, malware and impersonation; Scams360 for cues of hesitation, confusion and outside pressure during a payment; mule account detection across the account's life; device trust including remote access tools; it claims 350+ retail bank customers (its figure) |
| **Early Warning (Certos)** | Bank-shared account and payment data | Verify Account (ownership and status in real time), Payment Chek and Wire Chek risk on outgoing payments, Identity Chek alerts |
| **Plaid Identity Verification** | Identity checks at enrollment or recovery | A `risk_check` step beside document, selfie and SMS steps, with sessions that can be retried or sent to review |
| **Socure** | Identity and fraud scores on RiskOS | Sigma First-Party Fraud beside identity and synthetic scores, and a deceased check |

Three things stand out. **The session is the new unit of evidence.** Takeover and scams both happen in an authenticated session, so the vendors score what happens inside it (is someone else controlling the device, is the customer on a call, are they hesitating at the payee field), not only the login. **Consortium data matters because the money crosses banks.** Early Warning's products exist because the receiving account is at another bank, and a bank that only sees its own customers can't see the mule. **Scores feed decisions the bank owns:** a hold, a warning, a call, a block. None of these vendors decides the Reg E claim, which is the bank's legal determination ([Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes#how-the-platforms-do-it)).

## The Numbers

The FBI's Internet Crime Complaint Center recorded **1,008,597 complaints and $20.877 billion in losses in 2025**, up 26% from 2024, with cyber-enabled fraud 85% of losses. The largest categories by loss were investment fraud ($8.65 billion, with cryptocurrency investment fraud alone $7.2 billion), business email compromise ($3.05 billion), tech support scams ($2.13 billion), confidence and romance scams ($929 million) and government impersonation ($798 million). People 60 and over filed 201,266 complaints reporting $7.7 billion in losses, an average of $38,500, and 12,444 of them lost more than $100,000. The report notes a rise in tech support and account takeover cases referred through its Financial Fraud Kill Chain, and that "ATO-related incidents can contain upwards of 50 or more transactions to different recipient accounts at multiple banks happening simultaneously via ACH." The FTC separately reported 3 million fraud reports and $15.9 billion in reported losses for 2025, the highest on record, $3.5 billion of it to impostor scams.

These are reported losses, a floor. For a bank the useful split is not the category but the mechanism: did someone else move the money (takeover), or did the customer (scam)?

## Unauthorized or Authorized

Regulation E defines an **unauthorized electronic fund transfer** as one "initiated by a person other than the consumer without actual authority to initiate the transfer and from which the consumer receives no benefit" (12 CFR 1005.2(m)). It excludes transfers initiated by someone the consumer gave the access device to (until the consumer tells the institution that person is no longer authorized), transfers initiated with fraudulent intent by the consumer or anyone acting with them, and transfers initiated by the institution or its employee. The official interpretation adds that an unauthorized transfer includes "a transfer initiated by a person who obtained the access device from the consumer through fraud or robbery" (comment 2(m)-3).

The CFPB's Electronic Fund Transfers FAQs, last updated January 15, 2025 and still posted in October 2026, apply this to the cases banks see every day:

- **Stolen credentials are unauthorized.** A third party who obtains the consumer's account credentials and initiates a transfer, including a P2P credit push, makes an unauthorized EFT.
- **Deception doesn't change that.** A consumer "fraudulently induced" to share account access information "has not furnished an access device," so the third party's transfer is still unauthorized.
- **Negligence doesn't shift liability.** "Negligence by the consumer cannot be used as the basis for imposing greater liability" than Reg E allows; the example is a PIN written on the card.
- **Network rules don't reduce it.** Private network rules that are less protective "do not change a financial institution's Regulation E obligations."

What the FAQs don't say is that a transfer the consumer initiates themselves, because a scammer persuaded them, is unauthorized. Read with 1005.2(m), it generally isn't: the consumer had actual authority and initiated it. That is the authorized push payment gap.

### Worked classification

| What happened | Unauthorized under Reg E? | Why |
| --- | --- | --- |
| A phishing site captured the customer's password; a criminal logged in and sent three Zelle payments | Yes | Credentials obtained by fraud; a third party initiated the transfers |
| A caller posing as the bank's fraud team got the customer to read out a one-time code, enrolled a new device and sent money out | Yes for an EFT such as ACH or P2P; a wire transfer is outside Reg E | Fraudulently induced sharing isn't furnishing an access device; coverage depends on the rail ([Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes#what-counts-as-an-error)) |
| The customer's grandson, given the debit card and PIN for groceries, withdrew $2,000 | No, until the customer tells the bank he's no longer authorized | Comment 2(m)-2: the consumer furnished the device |
| The same impersonator persuaded the customer to send money to a "safe account" from the customer's own app | Generally no | The customer initiated the transfer with actual authority |
| A romance scammer asked for money and the customer sent it by P2P | Generally no | Authorized, however induced |
| The customer sent money and then claimed fraud in concert with the recipient | No | Fraudulent intent by the consumer is excluded |

The first two rows are the institution's Reg E liability, limited for the consumer to the $50 and $500 tiers and the 60-day statement rule worked through in [Liability for Unauthorized Transfers](/books/banking-and-lending/deposit-errors-and-disputes#liability-for-unauthorized-transfers). The third and last are the consumer's. The middle two are where the policy fights are, and where a bank's own reimbursement policy, its network's rules, a court or a state law may move the loss.

The classification has to come from facts recorded at the time: who was logged in, from which device, after which security changes, with which confirmation. A claim that arrives as "fraud" gets a Reg E error case if any reading makes it an unauthorized EFT, because the clock starts at notice and the investigation, not the intake form, decides ([The Notice and the Clock](/books/banking-and-lending/deposit-errors-and-disputes#the-notice-and-the-clock)).

## Account Takeover

Takeover is a sequence, and every step before the theft is a chance to stop it:

1. **Get a credential:** phishing, credential stuffing with passwords leaked elsewhere, malware, or a call to the customer.
2. **Get past the second factor:** persuade the customer to read out a one-time code, port or SIM-swap the phone number, or steal an unlocked phone with the banking app on it.
3. **Make it stick:** change the email, phone or password, enroll a new device, turn off alerts.
4. **Prepare the exit:** add a payee or P2P recipient, raise a limit.
5. **Move the money,** fast and to several places at once, which is the pattern IC3 describes.

The CFPB's Zelle complaint named two of these patterns specifically: criminals obtaining one-time passcodes, and stolen phones with banking apps on them ([P2P Scams and the Zelle Suits](#p2p-scams-and-the-zelle-suits)).

The supervisory baseline is the FFIEC's **Authentication and Access to Financial Institution Services and Systems** (August 11, 2021), which replaced the 2005 internet banking guidance and its 2011 supplement. It asks for a risk assessment that determines access and authentication practices for every kind of user (customers, employees, third parties, service accounts), names "the weaknesses in single factor authentication," recommends multifactor authentication or "controls of equivalent strength" for high-risk access, and covers layered security, monitoring and logging, call center and help desk authentication, and customer awareness (how a digital banking platform implements it is in [Authentication and the FFIEC Guidance](/books/banking-and-lending/digital-banking#authentication-and-the-ffiec-guidance)). In practice:

- **Treat SMS codes as the weakest factor,** because both the phone number and the customer's willingness to read the code out are attackable. Passkeys and device-bound credentials resist phishing in a way codes don't ([Passkeys First](/docs/security/authentication#passkeys-first)).
- **Step up on security changes, not only on payments.** A new device, email, phone number or password reset is the takeover's step 3; each gets re-authentication and a notice to the old contact point ([Step-Up for Sensitive Actions](/docs/security/authentication#step-up-for-sensitive-actions), [Recovery Is the Real Login](/docs/security/authentication#recovery-is-the-real-login)).
- **Cool down after changes.** For a period after a new device or contact change, lower limits and hold first payments to new payees. The cost is a day's delay for a legitimate customer who just bought a phone; the benefit is breaking the sequence between steps 3 and 5.
- **Authenticate the call center as hard as the app.** The FFIEC calls out call center and help desk authentication because the reset that a phone agent performs is the bypass the attacker wants. Agents act through delegated, logged sessions ([Support Access](/docs/security/support-access#delegation-not-impersonation)).
- **Watch logins at scale:** credential stuffing shows as many accounts tried from few sources, and it is a rate-limiting and detection problem before it's a fraud one ([Credential Stuffing and Enumeration](/docs/security/authentication#credential-stuffing-and-enumeration)).

## P2P Scams and the Zelle Suits

P2P networks made instant, irrevocable payments to any phone number or email a default feature of a checking account, which is what made them a scam rail. Two lawsuits frame where US liability stands:

- **CFPB v. Early Warning Services, JPMorgan Chase, Bank of America and Wells Fargo.** Filed December 20, 2024 in the District of Arizona, the CFPB alleged that Zelle's operator and three of its largest banks launched the network without adequate fraud protections, failed to share information across banks to stop repeat fraudsters, didn't address the takeover patterns above, and denied consumers' claims despite evidence such as police reports, in violation of the CFPA's prohibition on unfair practices, and, for the banks, of the EFTA and Regulation E. The director's remarks said Americans had lost "over $800 million" at the three banks over seven years. On March 4, 2025 the CFPB voluntarily dismissed it, and on March 5 the court dismissed the case with prejudice.
- **New York v. Early Warning Services.** On August 13, 2025 New York's Attorney General sued Zelle's operator in state court, alleging users lost "over $1 billion" to scams between 2017 and 2023 and seeking restitution, damages and a court order requiring anti-fraud safeguards. A law firm's report says the court denied nearly all of the motion to dismiss on July 20, 2026; I have not found the order or a later primary-source status.<!-- source-gap: ny-ag-ews-zelle | secondary | NY AG v. Early Warning Services: motion to dismiss largely denied July 20, 2026, and status since | closes with: the NY Supreme Court order (Index No. 654753/2025) or an NY AG release | checked: 2026-10-29 -->

Around them: the CFPB's January 2025 order against Block required up to $120 million in redress (at least $75 million) and a $55 million penalty over Cash App's handling of unauthorized-transaction reports, including sending users to their banks and then denying claims, and said "a company cannot simply use fine print to escape these legal requirements." On May 12, 2025 the CFPB withdrew 67 guidance documents; the EFT FAQs above were not among them and remain posted. New York's Senate passed a "Financial App Security Act" (S5500) in June 2025 requiring PINs, user-set thresholds, lockouts and cancellation of possibly fraudulent transactions after timely notice, but not reimbursement; as of October 2026 it sits in an Assembly committee. I have found no US state that has enacted a scam reimbursement mandate.<!-- source-gap: us-state-scam-reimbursement | missing | No US state has enacted a P2P or APP scam reimbursement mandate as of October 2026 | closes with: a primary-source survey of state P2P and scam laws (NCSL or state legislatures) | checked: 2026-10-29 -->

So in October 2026 the US position is: unauthorized transfers, including takeover by deception, are the bank's under Reg E; authorized scam payments are the customer's unless the bank's own policy, its network's rules or litigation says otherwise. A bank's voluntary scam reimbursement policy is a product decision with a ledger: who qualifies, up to what amount, funded from which GL account, and recorded as a policy credit rather than a Reg E credit so the two don't blur.

## Interventions Before the Money Moves

Once an instant payment settles, there is nothing to return. The controls that work act before acceptance:

- **New-payee friction.** A hold, a lower limit or a delayed release on the first payment to a recipient the customer has never paid, scaled by amount and by the customer's history. Most scams pay a new payee; most legitimate large payments go to known ones.
- **Warnings that name the scam.** "Is someone on the phone telling you to move money to protect it?" at the moment of payment, chosen by the payment's purpose and the session's signals, not a generic banner. A customer who proceeds after a specific warning is a fact the claim review will use.
- **Session signals:** remote access software running, the customer on an active call, a new device, unusual hesitation, a payee name that doesn't match the account. These come from the vendors above.
- **A human call** for the payments that score highest, with the customer, not the session, on the line, and a script that doesn't accept "the bank told me to" as a reason.
- **Payee verification where it exists.** The US has no network-wide name check like the UK's Confirmation of Payee ([Confirmation of Payee](/books/payments/eu-and-uk#confirmation-of-payee)); account verification services from consortiums fill part of the gap for ACH and wires.
- **Rail rules that push the same way.** Nacha's 2026 fraud monitoring rules require originators and receiving banks to monitor for entries authorized under false pretenses, and FedNow gives participants limits and negative lists ([Bank-Rail Fraud](/books/payments/fraud-and-risk#bank-rail-fraud)).

Each intervention is a decision with a record: what triggered it, what the customer saw, what they did, and what happened next ([The Decision Record](/docs/architecture/risk-scoring#the-decision-record)). That record is what separates "the bank warned the customer and they proceeded" from "the bank never noticed" when the claim, the complaint or the lawsuit comes.

## Mules and the Receiving Side

Every scam and takeover payment lands in an account: a **money mule**, opened with a stolen or synthetic identity, bought from its owner, or belonging to a recruited person who thinks they have a job. The receiving bank is the one place the money can still be stopped after it leaves the victim's bank, and in the UK it pays half of every reimbursement for that reason. In the US it carries no reimbursement liability, but it has every other reason to look:

- **The money is the receiving bank's AML problem.** Many credits from unrelated senders followed by rapid withdrawal or onward transfer is a monitoring scenario, a SAR and, often, a 314(b) conversation with the sending bank ([Transaction Monitoring](/books/banking-and-lending/bsa-aml#transaction-monitoring), [314(a) and 314(b)](/books/banking-and-lending/bsa-aml#314-a-and-314-b)).
- **Reports from other banks are signals.** A network's or a sending bank's fraud report against a recipient account should restrict outbound activity on it within minutes and open a case, because the next victim's money is on its way.
- **Opening is the first control.** Mules are opened through the same flow as everyone else, which is why [KYC & Account Opening](/books/banking-and-lending/kyc-and-account-opening#synthetic-identities) links applications by shared devices and contact data.
- **Return what can be returned.** Funds still in a mule account after a confirmed report go back through the rail's return or recall process, documented in the case, not by an informal transfer.

## Elder Financial Exploitation

FinCEN's June 15, 2022 advisory (FIN-2022-A002) defines **elder financial exploitation** as "the illegal or improper use of an older adult's funds, property, or assets," with older adults meaning 60 and over, and asks filers to put the key term "EFE FIN-2022-A002" in the SAR and check the elder exploitation box. Its April 2024 trend analysis counted 155,415 EFE-related filings between June 2022 and June 2023 reporting about $27 billion in suspicious activity, with scams (by strangers) in about 80% and theft (by people the victim knew) in about 20%.

The interagency **Statement on Elder Financial Exploitation** (December 4, 2024; FRB, CFPB, FDIC, FinCEN, NCUA, OCC and state regulators) collects the practices banks are encouraged to use, and in June 2026 was revised to remove its references to reputational risk. It is explicitly non-binding and "does not impose new regulatory requirements." What it describes, as a system:

- **Trusted contacts:** a person the customer names whom the bank may contact about suspected exploitation, who "typically would not have authority to view account information or execute transactions." A trusted contact is a party with consent and scope, not an account party with authority.
- **Transaction holds and disbursement delays** where state law permits, which makes holds a state-by-state rule.
- **Training** so front-line staff and agents recognize exploitation, and governance that avoids discriminating on age under ECOA.
- **Reporting** to adult protective services and law enforcement, and expediting records they request; the statement cites earlier interagency guidance that privacy law generally doesn't bar such reporting.

The **Senior Safe Act** (12 USC 3423) gives an institution and its trained supervisory, compliance or legal staff immunity in civil and administrative proceedings for good-faith reports of suspected exploitation of someone 65 or older to regulators, law enforcement or adult protective services, if the employees were trained within a year of taking the role. Brokerage has a codified hold: FINRA Rule 2165 lets a member place a temporary hold on disbursements for a "specified adult" for 15 business days, extendable, with notice to the trusted contact. Banks have no federal equivalent, which is why their holds depend on state law and their account agreements.

Exploitation by someone the customer knows is the hard case for systems, because the person is often an authorized signer, a joint owner or an agent under a power of attorney, and their transfers are authorized. The signals are changes in pattern (new signers, new cash withdrawals, payments to a new person, a sudden change of address or statement delivery), and the response is a case, a call, possibly a hold and a report, not a Reg E claim.

## The UK Contrast

The UK made the opposite choice: since October 7, 2024, payment providers must reimburse victims of authorized push payment scams on Faster Payments (and the Bank of England applies the same to CHAPS) up to £85,000 per claim within five business days, with the receiving provider paying half, subject to a gross-negligence exception that can't be applied to vulnerable consumers. The mechanics and the regulator's review of the first year are in [APP Scam Reimbursement](/books/payments/eu-and-uk#app-scam-reimbursement). For a US bank the contrast shows what a receiving-side liability does to mule controls: when the bank that opened the mule account pays half, account opening and inbound monitoring become a direct cost.

## How to Build It

These are deltas against [the core data model](/books/banking-and-lending/banking-business#the-core-data-model) and [Errors & Disputes on Deposit Accounts](/books/banking-and-lending/deposit-errors-and-disputes#how-to-build-it). A Reg E claim of an unauthorized transfer is a `reg_e_error` case with `error_claims` rows; a scam claim the bank decides is authorized is a `fraud_claim` case; the same report can produce both, linked.

```sql
-- Security-relevant changes and logins: the takeover sequence, as data.
CREATE TABLE account_security_events (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),
  kind                TEXT NOT NULL CHECK (kind IN ('login', 'login_failed', 'device_enrolled',
                        'password_reset', 'phone_changed', 'email_changed', 'address_changed',
                        'mfa_changed', 'payee_added', 'limit_changed', 'alerts_disabled')),
  channel             TEXT NOT NULL CHECK (channel IN ('app', 'web', 'call_center', 'branch', 'api')),
  device_ref          TEXT,
  ip_ref              TEXT,
  authenticated_by    TEXT[] NOT NULL,        -- 'password', 'passkey', 'sms_otp', 'kba', 'agent_verified'
  session_signals     JSONB,                  -- remote access, active call, behavior score, vendor refs
  agent_id            TEXT,                   -- for call center and branch changes
  party_identity_id   UUID REFERENCES party_identities (id),  -- the phone or email changed
  occurred_at         TIMESTAMPTZ NOT NULL,
  cooldown_until      TIMESTAMPTZ             -- lowered limits and new-payee holds after this event
);

-- Every intervention on a payment before it is accepted, and what the customer did.
CREATE TABLE payment_interventions (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  payment_order_ref   TEXT NOT NULL,          -- the order before posting
  transaction_id      UUID REFERENCES transactions (id),  -- set if it posted
  trigger             TEXT[] NOT NULL,        -- 'new_payee', 'cooldown', 'scam_score', 'session_signal', ...
  score               NUMERIC(6, 3),
  model_version       TEXT,
  action              TEXT NOT NULL CHECK (action IN ('warn', 'hold', 'call', 'block', 'none')),
  warning_template    TEXT,                   -- what the customer was shown, by version
  hold_id             UUID REFERENCES holds (id),
  customer_response   TEXT CHECK (customer_response IN ('proceeded', 'cancelled', 'confirmed_by_call',
                        'unreachable')),
  decided_at          TIMESTAMPTZ NOT NULL,
  resolved_at         TIMESTAMPTZ
);

-- Detail for a fraud_claim case: what kind of event, and what the bank owes.
CREATE TABLE fraud_claims (
  case_id             UUID PRIMARY KEY REFERENCES cases (id),
  reg_e_case_id       UUID REFERENCES cases (id),   -- the reg_e_error case, if any reading was unauthorized
  mechanism           TEXT NOT NULL CHECK (mechanism IN ('account_takeover', 'credential_shared_by_deception',
                        'device_furnished', 'authorized_scam', 'first_party', 'undetermined')),
  scam_type           TEXT,                   -- 'impersonation_bank', 'romance', 'investment', 'purchase', ...
  transaction_ids     UUID[] NOT NULL,
  security_event_ids  UUID[] NOT NULL DEFAULT '{}',  -- the evidence for the mechanism
  intervention_ids    UUID[] NOT NULL DEFAULT '{}',
  reimbursement_basis TEXT CHECK (reimbursement_basis IN ('reg_e', 'policy', 'network_rule', 'none')),
  reimbursed_amount   BIGINT,
  reimbursement_transaction_id UUID REFERENCES transactions (id),
  recipient_reports   JSONB NOT NULL DEFAULT '[]',  -- reports sent to receiving banks or networks
  aml_referral_case_id UUID REFERENCES cases (id),  -- the mule side, if this bank holds it
  elder_exploitation  BOOLEAN NOT NULL DEFAULT FALSE,
  CHECK (mechanism <> 'account_takeover' OR reg_e_case_id IS NOT NULL)
);

-- Reports about accounts this bank holds, from networks, other banks and law enforcement.
CREATE TABLE inbound_fraud_reports (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  reporter            TEXT NOT NULL,          -- the network, sending bank or agency
  reporter_ref        TEXT NOT NULL,
  transaction_ids     UUID[] NOT NULL,
  received_at         TIMESTAMPTZ NOT NULL,
  restricted_at       TIMESTAMPTZ,            -- outbound activity stopped
  case_id             UUID REFERENCES cases (id),
  funds_returned      BIGINT NOT NULL DEFAULT 0
);

-- Trusted contacts: consent and scope, no authority over the account.
CREATE TABLE trusted_contacts (
  party_id            UUID NOT NULL REFERENCES parties (id),     -- the customer
  contact_party_id    UUID NOT NULL REFERENCES parties (id),
  consent_disclosure_id UUID NOT NULL REFERENCES disclosures (id),
  scope               TEXT NOT NULL,          -- what the bank may discuss
  valid_during        TSTZRANGE NOT NULL,
  PRIMARY KEY (party_id, contact_party_id, valid_during)
);

-- Reports to adult protective services and law enforcement, with the Senior Safe Act basis.
CREATE TABLE exploitation_reports (
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id             UUID NOT NULL REFERENCES cases (id),
  recipient           TEXT NOT NULL,          -- 'aps:<state>', 'law_enforcement:<agency>', 'regulator'
  reported_by         TEXT NOT NULL,
  reporter_trained_on DATE,                   -- Senior Safe Act training date
  reported_at         TIMESTAMPTZ NOT NULL,
  records_provided    JSONB NOT NULL DEFAULT '[]'
);
```

How it runs:

1. **Security events are written as they happen,** and any event in the takeover sequence (new device, contact change, password reset) sets `cooldown_until` per policy and notifies the old contact point.
2. **Every outbound payment is scored before acceptance** with the account's recent security events, the payee's history and session signals; any action other than `none` writes a `payment_interventions` row, and a hold is a `holds` row with reason `fraud`.
3. **A fraud report opens a case at first contact.** If any reading of the facts makes a transfer unauthorized, a `reg_e_error` case opens with it and runs the Reg E clocks; the `fraud_claims` row records the mechanism the investigation finds and the evidence for it.
4. **Reimbursement is a transaction with its basis:** Reg E credit through `provisional_credits`, or a policy credit from its own GL account, never mixed.
5. **The receiving side runs too:** a report against a recipient at this bank, or an outgoing report about a recipient elsewhere, writes `inbound_fraud_reports` or `recipient_reports`, restricts the account and refers to AML.

The control query: takeover claims without a Reg E case, which should never exist.

```sql
SELECT fc.case_id, c.opened_at
FROM fraud_claims fc
JOIN cases c ON c.id = fc.case_id
WHERE fc.mechanism IN ('account_takeover', 'credential_shared_by_deception')
  AND fc.reg_e_case_id IS NULL;
```

## Auditing

Takeover and scam claims are sampled in consumer compliance exams (as Reg E error resolution), in BSA/AML exams (as SARs and mule monitoring) and in sponsor bank reviews. Keep:

- **The security events around every claim,** with channel, device, factors and agent, so the mechanism can be shown, not asserted.
- **Every intervention:** trigger, score and model version, what the customer was shown by template version, what they did, and the hold or call that followed.
- **Every claim's classification** and its evidence, the linked Reg E case and its clocks, and the reimbursement with its basis.
- **Receiving-side actions:** reports received and sent, time to restrict, funds returned, and the AML referral.
- **Elder exploitation handling:** trusted contacts and their consent, holds and their state-law basis, reports to APS or law enforcement with the reporter's training.

Reg E's two-year retention applies to the error case ([Auditing](/books/banking-and-lending/deposit-errors-and-disputes#auditing)); SAR-related records follow the BSA's five years ([BSA/AML Programs](/books/banking-and-lending/bsa-aml#auditing)). The mechanics are in [Audit Trails](/docs/architecture/audit-trails), and decision records in [Automated and AI Decisions](/docs/architecture/audit-trails#automated-and-ai-decisions).

## What This Means for the System You Build

- **Record the takeover sequence as events:** logins, device enrollments, contact changes, resets and new payees, with channel, factors and agent.
- **Step up and cool down on security changes,** not only on payments, and notify the old contact point.
- **Prefer phishing-resistant factors** and authenticate the call center as hard as the app.
- **Classify every claim by mechanism from recorded facts,** and open a Reg E case whenever any reading makes the transfer unauthorized.
- **Intervene before acceptance** on new payees, cooldowns and scam signals, and record what the customer saw and did.
- **Keep Reg E credits and policy reimbursements separate** in the ledger and the case.
- **Watch the receiving side:** act on reports about your accounts within minutes, and refer mules to AML.
- **Model trusted contacts as consented contacts without authority,** and holds for exploitation as state-law rules.
- **Report exploitation with the Senior Safe Act's training record** attached.

## References

**Law and regulation**

- [12 CFR 1005.2: Definitions](https://www.law.cornell.edu/cfr/text/12/1005.2), the unauthorized electronic fund transfer and its three exclusions
- [12 CFR 1005, Supplement I, comment 2(m)](https://www.consumerfinance.gov/rules-policy/regulations/1005/interp-2/), furnishing an access device and exceeding authority, and devices obtained through fraud or robbery
- [12 USC 3423: Immunity (Senior Safe Act)](https://www.law.cornell.edu/uscode/text/12/3423), immunity for trained employees' good-faith reports of suspected exploitation of people 65 and older
- [FINRA Rule 2165: Financial Exploitation of Specified Adults](https://www.finra.org/rules-guidance/rulebooks/finra-rules/2165), the brokerage temporary hold and trusted contact notice
- [New York Senate: S5500 (2025), Financial App Security Act](https://www.nysenate.gov/legislation/bills/2025/S5500), its requirements and its status in the Assembly

**Regulators and guidance**

- [CFPB: Electronic Fund Transfers FAQs](https://www.consumerfinance.gov/compliance/compliance-resources/deposit-accounts-resources/electronic-fund-transfers/electronic-fund-transfers-faqs/), stolen and fraudulently induced credentials, negligence and private network rules
- [OCC Bulletin 2021-36: Authentication and Access to Financial Institution Services and Systems](https://www.occ.gov/news-issuances/bulletins/2021/bulletin-2021-36.html), the FFIEC guidance: risk assessment, all users, single-factor weakness, MFA or equivalent, call center authentication
- [FinCEN: Advisory on Elder Financial Exploitation, FIN-2022-A002 (June 15, 2022)](https://www.fincen.gov/sites/default/files/advisory/2022-06-15/FinCEN%20Advisory%20Elder%20Financial%20Exploitation%20FINAL%20508.pdf), the definition, age 60 and the SAR key term
- [FinCEN: FinCEN Issues Analysis on Elder Financial Exploitation (April 18, 2024)](https://www.fincen.gov/news/news-releases/fincen-issues-analysis-elder-financial-exploitation), 155,415 filings, about $27 billion, scams and theft
- [Interagency Statement on Elder Financial Exploitation (December 4, 2024, revised June 2026)](https://www.fincen.gov/system/files/2024-12/Interagency-Statement-on-EFE-FINAL-508C.pdf), trusted contacts, holds, training, reporting and the June 2026 revision
- [FinCEN: FinCEN Joins Agencies in Issuing Statement on Elder Financial Exploitation](https://www.fincen.gov/news/news-releases/fincen-joins-agencies-issuing-statement-elder-financial-exploitation), the issuing agencies and date
- [Federal Register: Rescission of guidance documents (May 12, 2025)](https://www.federalregister.gov/documents/full_text/html/2025/05/12/2025-08286.html), the 67 withdrawn CFPB guidance documents

**Enforcement and litigation**

- [CFPB: Early Warning Services, LLC; Bank of America; JPMorgan Chase; Wells Fargo](https://www.consumerfinance.gov/enforcement/actions/early-warning-services-llc-bank-of-america-na-jpmorgan-chase-bank-na-wells-fargo-bank-na/), the December 20, 2024 complaint, the claims and the March 2025 dismissal with prejudice
- [CFPB: Prepared remarks of Director Rohit Chopra on the Zelle lawsuit (December 20, 2024)](https://www.consumerfinance.gov/archive/newsroom/prepared-press-call-remarks-of-cfpb-director-rohit-chopra-on-the-zelle-lawsuit-announcement/), losses over $800 million and the allegations
- [New York Attorney General: Attorney General James Sues Company Behind Zelle (August 13, 2025)](https://ag.ny.gov/press-release/2025/attorney-general-james-sues-company-behind-zelle-enabling-widespread-fraud), the claims, over $1 billion in losses and the relief sought
- [Consumer Finance Monitor: New York court refuses to dismiss Attorney General's fraud case against Zelle operator (July 31, 2026)](https://www.consumerfinancemonitor.com/2026/07/31/new-york-court-refuses-to-dismiss-attorney-generals-sweeping-fraud-case-against-zelle-operator-early-warning-services/), the July 20, 2026 ruling (secondary source)
- [CFPB: CFPB Orders Operator of Cash App to Pay $175 Million (January 16, 2025)](https://www.consumerfinance.gov/about-us/newsroom/cfpb-orders-operator-of-cash-app-to-pay-175-million-and-fix-its-failures-on-fraud/), redress, the penalty and the dispute failures

**Data**

- [FBI IC3: 2025 Internet Crime Report](https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf), complaints and losses, categories, victims 60 and over, and ATO via ACH
- [FTC: FTC Testifies Before the Joint Economic Committee (March 25, 2026)](https://www.ftc.gov/news-events/news/press-releases/2026/03/ftc-testifies-joint-economic-committee-agencys-efforts-combat-fraud), 3 million fraud reports and $15.9 billion in 2025
- [FTC: FTC Data Show People Reported Losing $3.5 Billion to Imposter Scams in 2025 (June 15, 2026)](https://www.ftc.gov/news-events/news/press-releases/2026/06/ftc-data-show-people-reported-losing-3-point-5-billion-imposter-scams-2025), the record total and impostor losses

**Vendor documentation**

- [Alloy: Developer documentation](https://developer.alloy.com/), the Events API, step-up journeys and case management
- [BioCatch](https://www.biocatch.com/), account takeover protection, scam detection, mule detection, device trust and its customer claim
- [Certos (Early Warning): Product overview](https://www.certos.com/product-overview), account verification and payment risk products
- [Plaid: Identity Verification API](https://plaid.com/docs/api/products/identity-verification/), the risk check step and session statuses
- [Socure](https://www.socure.com/), first-party fraud, identity and deceased checks
