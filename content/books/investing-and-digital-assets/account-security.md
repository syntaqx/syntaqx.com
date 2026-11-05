+++
title = "Account Security & Fraud"
description = "Takeover, SIM swaps, phished support and senior exploitation at brokers and exchanges: device binding, withdrawal holds, allowlists and restitution."
category = "Investing & Digital Assets Industry"
order = 2578
part = "Running the Platform"
tags = ["investing", "crypto", "security", "account-takeover", "fraud", "withdrawals"]
+++

Most customers who lose money at a broker or a crypto exchange don't lose it to a hack of the platform. They lose it from their own account: a phished password and code, a phone number moved to an attacker's SIM, a call from someone posing as the exchange who talks them into moving coins to a "safe" wallet, a stranger who opens an account in their name somewhere else and pulls their brokerage account over by ACATS. The platform's ledger is right in every one of those cases; the instruction was authenticated, the withdrawal was signed, the coins went where they were told. What failed was the platform's judgment about who was giving the instruction, and in crypto that judgment is final, because an on-chain withdrawal can't be pulled back.

The chapter covers how the platforms describe their controls, the attack paths particular to brokers and exchanges, device binding and step-up, withdrawal holds and allowlists with a hold decision in worked numbers, social engineering of support after the Coinbase incident, breach notice, senior investors, and restitution. The account takeover sequence on bank accounts, P2P scams and the bank's side of elder exploitation are the Banking & Lending volume's [Account Takeover & Scams](/books/banking-and-lending/account-takeover-and-scams); investment scams run on social platforms are the User-Generated Platforms volume's [Crypto Investment Scams](/books/user-generated-platforms/crypto-investment-scams); attacks on the exchange's own wallets are [Exchange Security & Hacks](/books/investing-and-digital-assets/exchange-security). The general engineering is the playbook's [Authentication](/docs/security/authentication) and [Support Access](/docs/security/support-access). The chapter reuses Banking & Lending's `account_security_events` and adds `device_bindings`, `withdrawal_holds` and `restitution_payments` to [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model).

## How the Platforms Do It

As of November 2026, from the firms' filings and help pages and from regulators:

| Who | What's public | Source |
| --- | --- | --- |
| **Coinbase** | Support contractors and employees outside the US were paid to pull customer data from internal tools; no passwords or keys were taken, and the data was used to socially engineer customers into sending funds; Coinbase said it would "voluntarily reimburse" eligible retail customers who did, estimated $180 million to $400 million in costs, fired the people involved, added fraud monitoring and warnings, and opened a US support hub ([Coinbase, May 2025](/books/investing-and-digital-assets/exchange-security#coinbase-may-2025)) | Form 8-K, May 14, 2025 |
| **Kraken** | Two-factor authentication set separately for sign-in, funding (deposits and withdrawals) and trading; "Step-up 2FA" requires a code to add, edit or remove 2FA settings ("Without the Step-up 2FA code no changes can be made"); a Global Settings Lock, which Kraken says to enable only after a Master Key; email confirmations for adding new withdrawal addresses ([The Checks](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals#the-checks)) | Support center |
| **Gemini** | Withdrawals restricted to allowlisted addresses and 2FA required for withdrawals by default ([The Checks](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals#the-checks)) | Support center, via that chapter |
| **FINRA** | ACATS takeover: an account opened in the victim's name at a receiving firm pulls their real account over, with effective practices for both firms ([Transfer Fraud](/books/investing-and-digital-assets/funding-and-transfers#transfer-fraud)); Rule 2165 holds for specified adults ([Trusted Contacts and Senior Holds](/books/investing-and-digital-assets/opening-accounts#trusted-contacts-and-senior-holds)) | Regulatory Notices 22-21 and 23-06; Rule 2165 |
| **FCC** | Wireless carriers must use secure authentication before moving a number to a new device or carrier and notify customers immediately of SIM change and port-out requests | Report and Order (88 FR 85794, December 8, 2023) |

Three patterns run through it:

- **Separate the factors by action.** Kraken's split of sign-in, funding and trading 2FA, plus a code to change 2FA itself, is the industry's answer to an attacker who gets one session: the session isn't enough to move money or to weaken the account's defenses.
- **Value leaves through a short list of doors.** A crypto withdrawal to a new address, a new bank link, an ACATS transfer out, an API key with withdrawal rights. Every control worth having sits at one of them.
- **The attack moved to people.** Coinbase's incident took no keys; it took data that made impersonation convincing. Controls on support tooling and on what customers are told to expect are now as important as controls on keys.

## The Attack Paths

The takeover sequence (get a credential, get past the second factor, make it stick, prepare the exit, move the value) is the same as at a bank ([Account Takeover](/books/banking-and-lending/account-takeover-and-scams#account-takeover)). Brokers and exchanges add their own versions of each step:

- **Credential phishing and stuffing.** Look-alike login pages for exchanges, and passwords reused from other breaches; a rate-limiting and detection problem first ([Credential Stuffing and Enumeration](/docs/security/authentication#credential-stuffing-and-enumeration)).
- **SIM swaps and port-outs.** An attacker persuades a carrier to move the victim's number, then receives the SMS codes. The FCC's 2023 order requires carriers to authenticate customers securely before redirecting a number and to notify them immediately of SIM change or port-out requests; the platform still treats SMS as the weakest factor it accepts and never as the only one for a withdrawal or a security change.
- **Support impersonation.** A call or message "from the exchange's security team" warning of a compromise and walking the customer through moving funds to a "safe" address, or installing remote-access software. Leaked support data makes it believable.
- **ACATS takeover.** An identity thief opens an account at another broker and requests a full transfer of the victim's account ([Transfer Fraud](/books/investing-and-digital-assets/funding-and-transfers#transfer-fraud)).
- **Changed bank link.** The attacker links a new bank account, sells the positions and withdraws cash; at a broker this is the takeover's exit.
- **API keys.** A trading key leaked from a bot or a script lets an attacker trade, and if the key has withdrawal rights, withdraw. Keys are scoped (read, trade, withdraw), withdrawal keys are bound to allowlisted addresses and IP ranges, and creating one is a security change like any other.
- **Wallet-side drains.** A customer's self-custody wallet signs an approval or a permit for a drainer; the exchange sees only the deposit that never arrives or a withdrawal to an address the customer later regrets ([Approval Phishing, Drainers and Address Poisoning](/books/investing-and-digital-assets/wallets#approval-phishing-drainers-and-address-poisoning)).
- **Authorized but deceived.** The customer moves the money themselves, to a scammer they trust. The withdrawal is authenticated by every factor the platform has; only friction and warnings help ([Friction](/books/user-generated-platforms/crypto-investment-scams#friction) covers the social platform's side).

What makes these worse than at a bank is the exit. A bank's wire or P2P payment can sometimes be recalled; a confirmed on-chain withdrawal can't, and a stock sold and wired out is gone at the speed of the wire. The controls have to act before value leaves, which means at the moment of the instruction and on the security changes that precede it.

## Device Binding and Step-Up

Authentication is the playbook's ([Passkeys First](/docs/security/authentication#passkeys-first), [Multi-Factor Authentication](/docs/security/authentication#multi-factor-authentication)); the platform-specific parts are which actions need which proof, and what counts as a known device:

- **Bind devices.** A device is bound when the customer enrolls a passkey or a device key on it after a strong login, and the binding is a record (`device_bindings`, below). A bound device that has been in use for weeks is the strongest evidence the platform has that an instruction comes from the customer; a device bound an hour ago is the weakest, because binding a new device is takeover step 3.
- **Step up on security changes, not only on money.** Changing the email, phone, password, 2FA method, bank link or withdrawal addresses, binding a device and creating an API key each require re-authentication from an already-bound device or a recovery path, and each sends a notice to the contact points that existed before the change ([Step-Up for Sensitive Actions](/docs/security/authentication#step-up-for-sensitive-actions), [Recovery Is the Real Login](/docs/security/authentication#recovery-is-the-real-login)).
- **Separate factors by action,** as Kraken does: a session that can view and trade can't, on its own, withdraw or change the factors that protect withdrawals.
- **Record every security event.** The Banking & Lending volume's `account_security_events` is the takeover sequence as data: login, device enrolled, password reset, phone or email changed, 2FA changed, payee added. A broker or exchange adds the doors it has: a withdrawal address allowlisted, a bank link added, an API key created (How to Build It, below).

## Withdrawal Holds and Allowlists

Every withdrawal path (crypto to an address, cash to a bank, ACATS out, an internal transfer to another customer) runs through checks before value leaves ([The Checks](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals#the-checks)). This chapter owns the holds those checks place for account security. The kinds:

| Hold | Trigger | Typical length | Released by |
| --- | --- | --- | --- |
| **Cooling period on a new destination** | A withdrawal address or bank account added | A day or more, set by policy | The timer, if nothing else fires |
| **Security change hold** | Password, email, phone, 2FA or device change in the lookback window | One to several days from the change | The timer, or a confirmation from the pre-change contact point |
| **Risk review** | A score over threshold: new device, new destination, share of balance, velocity, a fresh deposit that can still be returned, destination screening | Until reviewed | A reviewer, after contact with the customer |
| **Customer-requested lock** | The customer turns on a lock (Kraken's Global Settings Lock is one) | As set | Only the customer, through the lock's own procedure |
| **Senior investor hold** | Reasonable belief of financial exploitation of a specified adult (FINRA 2165) | 15 business days, extendable to 55 | Internal review, or a regulator or court ([Trusted Contacts and Senior Holds](/books/investing-and-digital-assets/opening-accounts#trusted-contacts-and-senior-holds)) |
| **Legal or compliance** | A legal order, a sanctions hit, an AML investigation | As the order or rule says | Compliance |

**Allowlists** are the strongest single control: a customer who turns them on can withdraw only to addresses they confirmed earlier, through a second channel, after a cooling period ([`address_allowlists`](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals#how-to-build-it)). A withdrawal form that picks from the allowlist instead of accepting pasted text also defeats address poisoning. The cost is that a legitimate customer can't withdraw to a new address today; the benefit is that an attacker with the customer's session can't either.

![A withdrawal hold's states: placed, awaiting_customer, under_review and released in a row, with the path from placed to the terminal released state accented, labeled notice to old contact, customer confirms and signals cleared. Above, an arrow from placed straight to released when the cooling period ends with no other signal. Below, dashed exits to the terminal state upheld: from awaiting_customer when the customer says not me, and from under_review when takeover is confirmed.](/diagrams/ida-withdrawal-hold-states.svg "A hold placed on a takeover signal is released by the customer through the contact points that existed before the change, or by the timer when nothing else fires; an upheld hold stops the withdrawal and opens a takeover case.")

### Worked numbers: a hold on a takeover signal

A hypothetical exchange of my own, and a hypothetical bitcoin price of $100,000. A customer's account has held about 2.4 BTC for two years, always used from one bound phone. On one night, in UTC:

| Time | Event (from `account_security_events`) |
| --- | --- |
| 01:31 | Password reset through the email link |
| 01:33 | Login and device binding on a new browser |
| 01:36 | 2FA method changed from the authenticator app to SMS |
| 01:40 | New withdrawal address added; confirmation link opened from the same new browser |
| 02:14 | Withdrawal request: 2.30 BTC ($230,000, 96% of the balance) to the new address |

The platform's policy, written as rules:

1. **Cooling period on a new address: 24 hours.** The address is usable from 01:40 the next day.
2. **Security change hold: 48 hours from the last change** when a withdrawal goes to a destination added after it, with a notice to every contact point that existed before the first change. The last change is the 2FA change at 01:36, so the hold runs to 01:36 two days later.
3. **Share of balance over 80% with a new device and a new destination** sends the withdrawal to `under_review` after the customer's answer, not straight to release.

The hold placed at 02:14 is the latest of the three: release no earlier than 01:36 two days later, and only after review. The notice goes to the email address that was on file before 01:31 (which the attacker may also control, since the reset used it), the phone number on file before 01:36, and the long-bound phone's app, which is the channel the attacker almost certainly doesn't have.

Why the policy is worth its cost, in my own illustrative numbers: suppose that of 10,000 withdrawals a year matching rule 3, one in 25 (400) is a takeover, averaging $18,000. Releasing them would lose $7.2 million that is unrecoverable on chain. Holding all 10,000 for 48 hours delays 9,600 legitimate customers, most of whom confirm from their bound phone within minutes and are released at the end of review, not the end of the timer. The friction falls on a customer who just changed every credential on their account and wants nearly all their money out at once, which is exactly the population where a delay is cheapest to justify.

The outcomes:

- **The bound phone answers "not me".** The hold is upheld, the withdrawal rejected, every session and the new device revoked, the 2FA change reversed through recovery, the email and phone checked with the customer, and an `account_takeover` case opened. Nothing left.
- **The bound phone confirms.** The customer bought a new laptop and moved everything to a hardware wallet. Review clears it, the withdrawal goes to `approved` in the withdrawal pipeline, and the customer is released hours, not days, after asking.
- **Nobody answers.** The timer runs to its end and review decides; a review that can't reach the customer through any pre-change channel leaves the hold in place rather than releasing on silence.

## Social Engineering of Support

Coinbase's May 2025 incident is the template: the threat actor paid "multiple contractors or employees working in support roles outside the United States" for data from internal tools, then used it to impersonate Coinbase to customers. The insider controls on support tooling (show the minimum, watch the queries, narrow access for outsourced staff) are in [Insiders and Support Tooling](/books/investing-and-digital-assets/exchange-security#insiders-and-support-tooling). The account security controls are the other half:

- **Support can't move money or weaken an account.** An agent can't remove a hold, change a contact point, add a withdrawal address or reset 2FA on the customer's say-so over the phone. Those actions require the customer's step-up from a bound device, or a recovery process with identity verification that the agent starts but doesn't complete ([Delegation, Not Impersonation](/docs/security/support-access#delegation-not-impersonation)).
- **An agent trying is a signal.** An agent who opens a hold, attempts a contact change or views many high-balance accounts outside their queue generates an alert to someone else.
- **Inbound calls are not the exchange.** The platform tells customers, standing and in the app, that it will never ask them to move funds, never ask for a code, and never call to warn about a compromise without the same message appearing in the app. In-app messaging is the only channel that can ask for anything.
- **Reimbursement decisions are policy.** Coinbase reimbursed customers socially engineered "as a direct result of this Incident"; a firm that wants that option needs to know which customers were in the leaked data and which losses followed from it, which is a join between the incident's affected accounts and the takeover cases (below).

## Breach Notice

A breach of customer data at a broker-dealer is now a notice duty with a clock. The 2024 amendments to Regulation S-P require an incident response program and notice to affected individuals "as soon as practicable, but not later than 30 days" after the firm becomes aware of unauthorized access to sensitive customer information, with compliance dates of December 3, 2025 for larger entities and June 3, 2026 for smaller ones ([Regulation S-P: Incidents and Notice](/books/investing-and-digital-assets/books-records-and-cat#regulation-s-p-incidents-and-notice)). A public company adds a Form 8-K under Item 1.05 when it determines an incident is material, as Coinbase did. Crypto-only entities fall under state breach laws and, in New York, the DFS cybersecurity regulation ([Security, Resilience & Incident Notice](/books/banking-and-lending/security-and-resilience#nydfs-part-500)). For account security the point is what follows the notice: the customers in a breached dataset are the ones attackers will call next, so their accounts get stricter holds and a direct warning, recorded as a tag on the account with the incident that set it.

## Senior Investors and Exploitation

Exploitation of older customers is the case where the customer is giving the instruction, sincerely, on someone else's behalf. The broker's tools are the trusted contact (FINRA Rule 4512) and the temporary hold under Rule 2165, with its notice within two business days and its 15, 10 and 30 business day clocks, worked through in [Trusted Contacts and Senior Holds](/books/investing-and-digital-assets/opening-accounts#trusted-contacts-and-senior-holds). FINRA's proposed Rule 2166, which would allow a delay of up to five business days for any adult, was put out for comment in Regulatory Notice 26-02 (January 8, 2026), and the notice shows no adoption as of November 2026 (same section). In the model, a 2165 hold is a `withdrawal_holds` row with reason `senior_exploitation` pointing at the `senior_investor_holds` record that carries the rule's clocks, so the withdrawal pipeline reads one table for every hold and the 2165 record keeps its own. The bank's side, including suspicious activity reporting, is in [Elder Financial Exploitation](/books/banking-and-lending/account-takeover-and-scams#elder-financial-exploitation).

## Restitution

When a takeover succeeds, who pays depends on terms, facts and forum:

- **The firm's own error.** If the platform released a withdrawal its own policy should have held, or support changed a contact point without the required proof, the loss is the firm's to make good, and paying it quickly is cheaper than defending it.
- **Voluntary programs.** Coinbase's reimbursement of customers socially engineered after its data theft is the public example; it was tied to an incident the firm caused.
- **Regulators and arbitration.** FINRA orders restitution in enforcement actions (Robinhood's 2021 order included restitution for outages and other failures, [Paying for Outages](/books/investing-and-digital-assets/peak-days-and-outages#paying-for-outages)), and customer disputes with broker-dealers go to FINRA arbitration under the customer agreement.
- **Recovery.** Funds sent to another exchange can sometimes be frozen if that exchange acts quickly, and stablecoins can be frozen by their issuers ([Freezes, Blacklists & Seizures](/books/investing-and-digital-assets/freezes-and-onchain-compliance)); every takeover case records the destination and the freeze requests sent.

Restitution is a payment, not a balance edit: a firm-to-customer journal entry with approvals, linked to the case, so statements, tax records and the case agree. Reimbursements tied to a security incident at the platform use `customer_reimbursements` from [Exchange Security & Hacks](/books/investing-and-digital-assets/exchange-security#how-to-build-it); everything else uses `restitution_payments` (below).

## How to Build It

Banking & Lending's `account_security_events` records the takeover sequence; this volume uses it unchanged with three more kinds for the doors a broker or exchange has. `parties` here is the same concept as there, so `party_id` maps directly:

```sql
ALTER TABLE account_security_events
  DROP CONSTRAINT account_security_events_kind_check,
  ADD CONSTRAINT account_security_events_kind_check CHECK (kind IN ('login', 'login_failed',
    'device_enrolled', 'password_reset', 'phone_changed', 'email_changed', 'address_changed',
    'mfa_changed', 'payee_added', 'limit_changed', 'alerts_disabled',
    'withdrawal_address_added', 'bank_link_added', 'api_key_created'));

CREATE TABLE device_bindings (             -- a device the customer proved, and how
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  party_id            UUID NOT NULL REFERENCES parties (id),
  credential_ref      TEXT NOT NULL,         -- passkey credential ID or device key fingerprint
  platform            TEXT NOT NULL,         -- 'ios', 'android', 'web'
  bound_at            TIMESTAMPTZ NOT NULL,
  bound_via           TEXT NOT NULL CHECK (bound_via IN ('passkey_from_bound_device',
                        'recovery_with_id_check', 'first_device_at_opening', 'support_assisted')),
  security_event_id   UUID NOT NULL REFERENCES account_security_events (id),
  last_seen_at        TIMESTAMPTZ,
  revoked_at          TIMESTAMPTZ,
  revoked_reason      TEXT,
  UNIQUE (party_id, credential_ref)
);

CREATE TABLE withdrawal_holds (            -- every security hold on value leaving an account
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  transfer_id         UUID NOT NULL REFERENCES transfers (id),  -- any method: onchain, ach, wire, acats
  reason              TEXT NOT NULL CHECK (reason IN ('new_destination_cooling', 'security_change',
                        'risk_review', 'customer_lock', 'senior_exploitation', 'legal',
                        'breach_exposure')),
  trigger_event_ids   UUID[] NOT NULL DEFAULT '{}',  -- account_security_events that caused it
  score               NUMERIC(6, 3),
  rule_version        TEXT NOT NULL,
  placed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  release_not_before  TIMESTAMPTZ,           -- the timer; null when only a person can release
  notices             JSONB NOT NULL DEFAULT '[]',   -- channel, contact point, sent_at, answered_at
  status              TEXT NOT NULL CHECK (status IN ('placed', 'awaiting_customer',
                        'under_review', 'released', 'upheld')),
  senior_hold_id      UUID REFERENCES senior_investor_holds (id),
  case_id             UUID REFERENCES cases (id),     -- opened when upheld
  decided_by          TEXT,                  -- 'timer', 'customer:<device>', 'reviewer:<id>'
  decided_at          TIMESTAMPTZ,
  CHECK ((reason = 'senior_exploitation') = (senior_hold_id IS NOT NULL))
);

CREATE TABLE restitution_payments (        -- losses the firm makes good outside a platform incident
  id                  UUID PRIMARY KEY DEFAULT uuidv7(),
  case_id             UUID NOT NULL REFERENCES cases (id),
  account_id          UUID NOT NULL REFERENCES accounts (id),
  instrument_id       UUID NOT NULL REFERENCES instruments (id),
  quantity            NUMERIC(78, 0) NOT NULL CHECK (quantity > 0),
  basis               TEXT NOT NULL CHECK (basis IN ('firm_error', 'voluntary', 'regulatory_order',
                        'arbitration_award', 'settlement', 'recovered_funds')),
  order_ref           TEXT,                  -- the regulator's order or award, where there is one
  approved_by         UUID[] NOT NULL,
  journal_entry_id    UUID REFERENCES journal_entries (id),
  status              TEXT NOT NULL CHECK (status IN ('proposed', 'approved', 'paid', 'rejected')),
  UNIQUE (case_id, account_id, instrument_id)
);
```

The hold decision, as code the withdrawal pipeline calls in its `checking` stage with the account's recent security events. It returns the latest release time any rule sets, and whether a person must review:

```go tab="Go"
type HoldDecision struct {
	Hold             bool
	ReleaseNotBefore time.Time
	Review           bool
	Reasons          []string
}

func DecideHold(w Withdrawal, events []SecurityEvent, p Policy) HoldDecision {
	var d HoldDecision
	if w.DestinationAddedAt.After(w.RequestedAt.Add(-p.NewDestCooling)) {
		d.extend(w.DestinationAddedAt.Add(p.NewDestCooling), "new_destination_cooling")
	}
	for _, e := range events {
		if e.IsSecurityChange() && e.At.After(w.RequestedAt.Add(-p.Lookback)) &&
			w.DestinationAddedAt.After(e.At) {
			d.extend(e.At.Add(p.SecurityChangeHold), "security_change")
		}
	}
	if d.Hold && w.ShareOfBalance > p.ReviewShare && w.NewDevice {
		d.Review = true
		d.Reasons = append(d.Reasons, "risk_review")
	}
	return d
}

func (d *HoldDecision) extend(until time.Time, reason string) {
	d.Hold = true
	if until.After(d.ReleaseNotBefore) {
		d.ReleaseNotBefore = until
	}
	d.Reasons = append(d.Reasons, reason)
}
```

```rust tab="Rust"
#[derive(Default)]
pub struct HoldDecision {
    pub hold: bool,
    pub release_not_before: Option<DateTime<Utc>>,
    pub review: bool,
    pub reasons: Vec<&'static str>,
}

impl HoldDecision {
    fn extend(&mut self, until: DateTime<Utc>, reason: &'static str) {
        self.hold = true;
        self.release_not_before = Some(self.release_not_before.map_or(until, |t| t.max(until)));
        self.reasons.push(reason);
    }
}

pub fn decide_hold(w: &Withdrawal, events: &[SecurityEvent], p: &Policy) -> HoldDecision {
    let mut d = HoldDecision::default();
    if w.destination_added_at > w.requested_at - p.new_dest_cooling {
        d.extend(w.destination_added_at + p.new_dest_cooling, "new_destination_cooling");
    }
    for e in events {
        if e.is_security_change()
            && e.at > w.requested_at - p.lookback
            && w.destination_added_at > e.at
        {
            d.extend(e.at + p.security_change_hold, "security_change");
        }
    }
    if d.hold && w.share_of_balance > p.review_share && w.new_device {
        d.review = true;
        d.reasons.push("risk_review");
    }
    d
}
```

With the worked numbers' policy (24-hour cooling, 48-hour security change hold, 80% review share), the 02:14 request gets all three kinds of reason (cooling, security change, review) and a release no earlier than 01:36 two days later, pending review.

Customers in a breached dataset, for the stricter policy and the direct warning; the incident's affected accounts come from the incident record:

```sql
SELECT a.id AS account_id
FROM security_incidents si
CROSS JOIN LATERAL jsonb_array_elements_text(si.affected_accounts) AS x(account_id)
JOIN accounts a ON a.id = x.account_id::uuid
WHERE si.id = :incident_id
  AND a.status IN ('active', 'restricted');
```

That query assumes the incident record lists the accounts whose data was exposed, which `security_incidents` doesn't yet carry; the chapter adds it:

```sql
ALTER TABLE security_incidents
  ADD COLUMN affected_accounts JSONB NOT NULL DEFAULT '[]';  -- accounts whose data was exposed
```

Design notes:

- **Holds attach to transfers, not to accounts.** A hold stops one instruction with its reason and timer; an account-wide restriction is the account's status. Mixing them is how a released hold leaves an account frozen, or a frozen account's withdrawal slips through.
- **Notices go to the pre-change contact points.** `notices` records which channel and which contact point, so a review can see that the bound phone, not the new email, confirmed.
- **The timer never releases a reviewed hold.** `release_not_before` is a floor; `under_review` needs a person.
- **Rules are versioned.** `rule_version` on every hold lets the firm show which policy held a withdrawal and measure each rule's hold rate and takeover catch rate ([Measuring It](/docs/building-blocks/risk-scoring#measuring-it)).
- **Events:** `withdrawal_hold.placed`, `.released` and `.upheld` through the outbox; `upheld` opens the takeover case, revokes sessions and device bindings created since the first trigger, and sends freeze requests for any value already sent.

## Auditing

The records a regulator, an arbitrator, a court or the customer asks for after a takeover:

- **The sequence.** Every security event on the account with its channel, device, authentication and agent, in order, so the takeover can be shown step by step.
- **Every device and how it was bound,** and when and why each was revoked.
- **Every hold:** its reason, triggering events, rule version, timer, notices with their channels and answers, and who released or upheld it.
- **What support did.** Every agent session on the account, every attempted change, and every alert it raised ([Logging Support Access](/docs/security/support-access#logging-support-access)).
- **The money's path.** Every transfer out with its checks and holds, the destination, any freeze requests sent and their outcomes.
- **Restitution decisions,** with the basis, approvals and the entry that paid them, and the Rule 2165 records for senior holds.

## What This Means for the System You Build

- **Put the controls at the doors value leaves through:** new withdrawal addresses, bank links, ACATS out, API keys with withdrawal rights.
- **Bind devices and separate factors by action,** so a session alone can't withdraw or weaken the account.
- **Step up and notify on every security change,** to the contact points that existed before it.
- **Hold withdrawals to destinations added after a security change,** for longer than a takeover can wait, and release through the bound device or review, never on silence.
- **Offer allowlists and pick destinations from them,** which also defeats address poisoning.
- **Take support out of the money path,** and alert on agents who try to put themselves back in.
- **Treat a breached dataset as a target list,** with stricter holds and direct warnings for those customers.
- **Keep one hold table for every reason,** with the 2165 record carrying its own clocks.
- **Pay restitution as entries with approvals,** linked to the case.

## References

**Law and regulation**

- [FINRA Rule 2165 (Financial Exploitation of Specified Adults)](https://www.finra.org/rules-guidance/rulebooks/finra-rules/2165), temporary holds on disbursements and transactions for specified adults: 15 business days, extendable by 10 and then 30, with notice within two business days

**Regulators and guidance**

- [FINRA Regulatory Notice 22-21 (October 6, 2022)](https://www.finra.org/rules-guidance/notices/22-21), fraudulent ACATS transfers using accounts opened in victims' names
- [FINRA Regulatory Notice 23-06 (March 28, 2023)](https://www.finra.org/rules-guidance/notices/23-06), effective practices against fraudulent ACATS transfers
- [FINRA Regulatory Notice 26-02 (January 8, 2026)](https://www.finra.org/rules-guidance/notices/26-02), the proposed Rule 2166 delay of up to five business days, out for comment
- [Federal Register: Protecting Consumers From SIM-Swap and Port-Out Fraud (FCC Report and Order, 88 FR 85794, December 8, 2023)](https://www.federalregister.gov/documents/2023/12/08/2023-26338/protecting-consumers-from-sim-swap-and-port-out-fraud), secure authentication before a number is redirected and immediate notice of SIM change and port-out requests
- [SEC: SEC adopts amendments to Regulation S-P (press release 2024-58, May 16, 2024)](https://www.sec.gov/newsroom/press-releases/2024-58), the 30-day notice and the 18 and 24 month compliance periods
- [Federal Register: Regulation S-P, Privacy of Consumer Financial Information and Safeguarding Customer Information (89 FR 47688, June 3, 2024)](https://www.federalregister.gov/documents/2024/06/03/2024-11116/regulation-s-p-privacy-of-consumer-financial-information-and-safeguarding-customer-information), the incident response program, customer notice, the 72-hour service provider notice and the August 2, 2024 effective date

**Filings**

- [Coinbase Global: Form 8-K, Item 1.05 (May 14, 2025)](https://www.sec.gov/Archives/edgar/data/1679788/000167978825000094/coin-20250514.htm), the paid support contractors, the data taken, no passwords or keys, the cost estimate, voluntary reimbursement and the remediations

**Vendor documentation**

- [Kraken: Secure your account with two-factor authentication (2FA)](https://support.kraken.com/hc/en-us/articles/360000426923-Global-Settings-Lock-GSL-), separate sign-in, funding and trading 2FA, Step-up 2FA, and enabling the Global Settings Lock only after a Master Key
- [Kraken: Security](https://www.kraken.com/features/security), email confirmations for new withdrawal addresses and the global settings time lock
