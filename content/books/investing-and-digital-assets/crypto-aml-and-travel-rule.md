+++
title = "AML & the Travel Rule for Crypto"
nav_title = "AML & the Travel Rule"
description = "FinCEN's Travel Rule for crypto, TRP and TRISA messaging, unhosted wallets, withdrawn mixer rules, the Binance and OKX cases, and Tornado Cash and Samourai."
category = "Investing & Digital Assets Industry"
order = 2572
part = "The Rules"
tags = ["crypto", "aml", "travel-rule", "fincen", "ivms101", "unhosted-wallets", "enforcement"]
+++

A crypto exchange is a money transmitter, so it runs the same anti-money laundering program a payments company does: know the customer, monitor what they do, file suspicious activity reports, keep records, screen against sanctions. What is different about crypto is the rail. A wire carries the sender's name in the message; a blockchain transaction carries two addresses and an amount, visible to everyone and identifying no one. The Travel Rule, written for wires, therefore has to be met out of band, over messaging networks the industry built for it, with a counterparty that has to be discovered first and may not exist at all when the destination is a customer's own wallet. And because the chain is public, the exchange can see where funds came from far beyond its counterparty, which turns monitoring into on-chain analytics ([On-Chain Analytics & Investigations](/books/investing-and-digital-assets/blockchain-analytics)).

This chapter covers only the crypto-specific parts. The program itself (the five pillars, alerts and cases, SAR mechanics, CTRs, 314(a) and (b)) is Banking & Lending's [BSA/AML Programs](/books/banking-and-lending/bsa-aml), and sanctions screening is [Sanctions Screening](/books/banking-and-lending/sanctions-screening). Here: how FinCEN's funds Travel Rule applies to crypto, the protocols that carry it, a $5,000 withdrawal to another exchange and to an unhosted wallet worked through, what happened to FinCEN's unhosted wallet and mixer proposals, the enforcement cases (Binance, BitMEX, KuCoin, OKX), and the Tornado Cash and Samourai prosecutions. It adds `vasp_counterparties` and `unhosted_wallet_attestations` to [The Core Data Model](/books/investing-and-digital-assets/investing-business#the-core-data-model) and reuses the Payments volume's `travel_rule_records`. Where the hooks sit in the withdrawal pipeline is [The Travel Rule Hooks](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals#the-travel-rule-hooks).

## How the Platforms Do It

The Travel Rule infrastructure is shared: a data standard, open protocols and the vendors that implement them, as of November 2026.

| Component | What it is | What its publisher documents |
| --- | --- | --- |
| **IVMS101** | The data model for originator and beneficiary information between VASPs | Published by the Joint Working Group on interVASP Messaging Standards (formed December 2019), first released May 2020; maintained since April 2023 by the interVASP Standards Working Group (GBBC Digital Finance, OpenVASP, VASPnet); current edition IVMS 101.2023, updated June 4, 2024 |
| **TRP (Travel Rule Protocol)** | An open, royalty-free protocol from the OpenVASP Association | Bilateral, encrypted, "peer-to-peer data exchange between VASPs without the consent or support of any third party"; assets identified by ISO 24165 Digital Token Identifiers; version 3.2.1 of July 29, 2024; implementations listed from 21 Analytics, Blockchain Intelligence Group and ospree |
| **TRISA** | An open-source protocol and Go reference implementation | A gRPC API with protocol buffers; a Global Directory Service that issues identity certificates "after extended validation" for mutual TLS, plus sealing keys and a revocation list, replicated across the US, EU and Singapore, with separate TestNet and MainNet certificate authorities; its Envoy node runs both TRISA and TRP |

Three things follow. **Interoperability is the problem, not the format.** Everyone speaks IVMS101 inside the envelope; the networks differ in discovery, identity and transport, which is why TRISA's node also speaks TRP. **Identity is certificates.** Both protocols authenticate the counterparty VASP with X.509 certificates over mutual TLS, so a VASP's Travel Rule identity is a key it manages like any other ([Keys, Signing & Key Management](/books/investing-and-digital-assets/keys-and-signing)). **Discovery is half the work.** A VASP can only send a message to a counterparty it can find; TRP puts the endpoint in a Travel Address the customer pastes, TRISA in a directory lookup.

## The Rule

FinCEN's funds Travel Rule, 31 CFR 1010.410(f), requires a non-bank financial institution sending a transmittal of funds of $3,000 or more to "include in a transmittal order, at the time it is sent" the transmittor's name and account number (when paid from an account), address, the amount, the execution date, the recipient's financial institution, and whatever recipient information it received, plus its own identity; an intermediary passes on what it received; and paragraph (e) requires records retrievable by the transmittor's name and, for an established customer, account number. FinCEN's 2019 guidance (FIN-2019-G001) is what carries the rule to crypto:

- **Crypto transfers are transmittals.** "Because a transmittal order involving CVC is an instruction to pay 'a determinable amount of money,' transactions involving CVC qualify as transmittals of funds," and the $3,000 threshold applies to "$3,000 or more (or its equivalent in CVC)."
- **Out of band is fine; late is not.** The institution must provide the information "either before or at the time of the transmittal of value," and the parties "are not required to use the same system or protocol for both the actual transmission of value and the reception or transmission of the required regulatory information."
- **Difficulty is no excuse.** "A person that chooses to set up a transaction system that makes it difficult to comply with existing regulations may not invoke such difficulty as a justification for non-compliance."
- **No pseudonyms.** Replacing the transmittor's identity "with a pseudonym or reference that may not be decoded by the receiving financial institution" doesn't comply.
- **Position decides the role.** A hosted wallet provider complies "based on the host's position in the transmission chain (either as a transmittor's, intermediary, or recipient's financial institution)," and when its wallet owner is itself a financial institution, the host applies the correspondent account rules (31 CFR 1010.610) to that relationship.

New York adds its own floor for BitLicensees: records of every virtual currency transaction with the customer parties' identities and physical addresses with no threshold, and identity verification for any accountholder initiating a transaction over $3,000 (23 NYCRR 200.15; [Licensing a Crypto Business](/books/investing-and-digital-assets/crypto-licensing) has the rest of Part 200). The global standard is FATF's: Recommendation 15 and its interpretive note apply the wire transfer requirements of Recommendation 16 to virtual asset service providers, with an optional de minimis threshold of USD or EUR 1,000, and the EU applies its version with no threshold; the Payments volume's [The Travel Rule](/books/payments/stablecoins#the-travel-rule) summarizes both, including FATF's June 2025 revision of Recommendation 16. <!-- source-gap: ida-fatf-r16-2025 | missing | FATF's June 2025 revision of R.16, its renaming, the 2030 implementation horizon and the 2026 VASP guidance consultation | closes with: the FATF Recommendations page and the June 2025 R.16 amendment document, opened (fatf-gafi.org refused every fetch with 403 on 2026-11-05) | checked: 2026-11-05 --> FATF's own pages refused my fetches, so I don't restate the 2025 changes' details here.

## Worked Example: a $5,000 Withdrawal, Two Destinations

A customer of a US exchange, Ana Rivera, asks to withdraw 0.05 BTC at a reference price of $100,000, so $5,000, above the $3,000 threshold. The amount in the chain's smallest unit is 0.05 × 100,000,000 = 5,000,000 satoshis.

**Destination 1: an account at another exchange.** The customer pastes a TRP Travel Address the receiving exchange gave her, `ta2W2HPKfHxgSgrzY178knqXHg1H3jfeQrwQ9JrKBs9wv` (the spec's own example), which decodes from base58check to `beneficiary.com/x/12345?t=i`. The originating exchange:

1. **Identifies the counterparty.** It calls `GET /identity` on the decoded host and gets the counterparty's name, LEI and certificate; its `vasp_counterparties` row says whether due diligence on that VASP is complete. If it isn't, the withdrawal holds.
2. **Sends the inquiry** over mutual TLS, an HTTP POST to the decoded URL with `api-version: 3.2.1` and a fresh UUID v4 in `request-identifier`. The body follows the spec's structure; the person, address and LEI are invented, and names and addresses use IVMS101's fields:

```json
{
  "asset": { "dti": "4H95J0R2X" },
  "amount": 5000000,
  "callback": "https://originator.example/trp/resolutions/7f3c2a",
  "IVMS101": {
    "originator": {
      "originatorPersons": [{
        "naturalPerson": {
          "name": { "nameIdentifier": [{ "primaryIdentifier": "Rivera",
                                          "secondaryIdentifier": "Ana",
                                          "nameIdentifierType": "LEGL" }] },
          "geographicAddress": [{ "addressType": "HOME", "streetName": "Elm St",
                                  "buildingNumber": "12", "postCode": "10001",
                                  "townName": "New York", "country": "US" }],
          "customerIdentification": "C-1048576"
        }
      }]
    },
    "beneficiary": {
      "beneficiaryPersons": [{
        "naturalPerson": {
          "name": { "nameIdentifier": [{ "primaryIdentifier": "Rivera",
                                          "secondaryIdentifier": "Ana",
                                          "nameIdentifierType": "LEGL" }] }
        }
      }]
    },
    "originatingVASP": {
      "originatingVASP": {
        "legalPerson": {
          "name": { "nameIdentifier": [{ "legalPersonName": "Originator Exchange LLC",
                                          "legalPersonNameIdentifierType": "LEGL" }] },
          "nationalIdentification": { "nationalIdentifier": "549300EXAMPLELEI0001",
                                      "nationalIdentifierType": "LEIX" }
        }
      }
    }
  }
}
```

3. **Waits for the resolution.** The beneficiary VASP checks that the named beneficiary owns account 12345 and POSTs `approved` with the deposit `address` and a confirmation `callback` (or `rejected` with a comment), answered with 204.
4. **Broadcasts,** to the address the approval returned, not one the customer typed, then POSTs the `txid` to the confirmation callback once the transaction is confirmed.

Against 31 CFR 1010.410(f), the message carried the transmittor's name, account (the customer identifier), address and the recipient; the amount is the inquiry's and the execution date is the confirmation's; the recipient's institution is the counterparty identified in step 1. The record is a `travel_rule_records` row with `counterparty_type = 'vasp'`, `status = 'sent'`, the protocol and both payloads, linked to the withdrawal's `onchain_transactions` and `transfers` rows.

**Destination 2: her own hardware wallet.** There is no recipient institution, so nobody to message: (f) speaks to what is included in a transmittal order sent to the next institution, and here there is none. What the exchange still does:

- **Records the transfer** with the originator's data and the beneficiary as declared: a `travel_rule_records` row with `counterparty_type = 'self_hosted'` and `status = 'not_required'`, because the record and its reason are evidence the check ran.
- **Establishes whose wallet it is** where policy or another jurisdiction's rule requires it: a signed message from the address, or a small test transfer back, stored as an `unhosted_wallet_attestations` row and reused for later withdrawals to the same address. The EU requires this kind of verification for transfers to a self-hosted address controlled by the customer above EUR 1,000. <!-- source-gap: ida-eu-tfr-self-hosted | missing | the EU Transfer of Funds Regulation (2023/1113) rule on verifying ownership of self-hosted addresses above EUR 1,000 and its article number | closes with: the Regulation's text on EUR-Lex or the EBA Travel Rule guidelines, opened (EUR-Lex returned empty pages and the EBA URL 404 on 2026-11-05) | checked: 2026-11-05 -->
- **Screens the destination** with blockchain analytics, as for any withdrawal: an unhosted wallet's history is visible even though its owner isn't ([KYT on Deposits and Withdrawals](/books/investing-and-digital-assets/blockchain-analytics#kyt-on-deposits-and-withdrawals)).

The asymmetry is the policy question exchanges answer differently: a hosted destination costs a protocol round trip and can be rejected by the other side; an unhosted destination costs an ownership proof once and then nothing, which is why the destination type is a risk input and not just a routing choice.

The message flow, as a sequence:

![A sequence diagram with three lifelines: the chain, the originating exchange and the beneficiary exchange. The originator calls GET identity on the beneficiary and receives name, LEI and certificate; sends the transfer inquiry with IVMS101; receives the resolution, approved with an address; broadcasts the transaction to the approved address on the chain, the accented message; the chain returns confirmed; the originator then sends the txid to the beneficiary's confirmation callback. A note says nothing goes on chain until the counterparty approves.](/diagrams/ida-travel-rule-exchange.svg "A Travel Rule Protocol exchange for one withdrawal: identity, inquiry, resolution, then the transaction, then the confirmation. The data goes off chain, before the value moves.")

## Counterparty VASPs

The 2019 guidance treats a hosted wallet whose owner is a financial institution as a correspondent relationship, and the practice extends that to every counterparty an exchange messages: before sending customer data to another VASP, the sender knows who it is, where it is licensed, whether it has a Travel Rule program and can protect the data, and whether its own risk is acceptable. In TRISA, the Global Directory Service publishes verified members' endpoints, public keys and TRIXO form details; in TRP, the counterparty's `/identity` response gives its legal name and LEI. Neither replaces the sender's own decision, so the record of that decision is a row with a review date. A counterparty in a jurisdiction that hasn't implemented the Travel Rule can't receive or send compliant messages; the industry calls this the sunrise problem, and the platform's choices are to send data anyway under its own rule, hold or reject, or treat the destination like an unhosted wallet with an ownership proof.

## Unhosted Wallets and Mixers: What FinCEN Proposed and Withdrew

Two FinCEN proposals would have changed this chapter, and both are gone as of November 2026:

- **The unhosted wallet proposal** of December 2020, "Requirements for Certain Transactions Involving Convertible Virtual Currency or Digital Assets," would have imposed recordkeeping and reporting on transactions between hosted and unhosted wallets. FinCEN withdrew it on October 6, 2026 (Federal Register document 2026-20430), saying it "will not take any further action on this NPRM."
- **The mixing proposal** of October 23, 2023 (88 FR 72701) would have found international crypto mixing to be "a class of transactions of primary money laundering concern" under section 311 of the USA PATRIOT Act and required enhanced recordkeeping and reporting on it. FinCEN withdrew the finding and the proposal effective October 6, 2026 (91 FR 63513).

What remains is the 2019 guidance and ordinary program duties: an anonymizing services provider that accepts and retransmits value is a money transmitter, an anonymizing software supplier is not, and a platform's monitoring still treats mixer exposure as a risk to investigate and, where the facts support it, report. Section 311 itself is still used against specific institutions: FinCEN imposed a special measure on Huione Group, a Cambodian payments business, on October 16, 2025 (Federal Register document 2025-19571), and Chainalysis's 2025 data shows North Korean launderers using Huione at several times the rate of other actors ([Tracing Hacks and DPRK Laundering](/books/investing-and-digital-assets/blockchain-analytics#tracing-hacks-and-dprk-laundering)).

## Enforcement

The crypto cases are the clearest statement of what regulators expect from an exchange's program, and each failure maps to a system:

- **Binance, November 21, 2023.** FinCEN's $3.4 billion penalty found that Binance never filed a single SAR, failed to report "well over 100,000" suspicious transactions, including ones tied to Al Qaeda, ISIS, Hamas's Al-Qassam Brigades and Palestinian Islamic Jihad, was "one of the largest receivers of ransomware proceeds" from at least 24 strains, and failed to perform KYC on "a large number of its users"; it imposed a five-year monitorship with access to "books, records, and systems" and required Binance to exit the US. OFAC's $968 million settlement covered more than 1.67 million trades between US persons and users in Iran, North Korea, Syria and Crimea from August 2017 to October 2022, finding Binance suggested users evade its geofencing with VPNs and that its matching algorithm "made violative trades inevitable." Total payments across the agencies are in [Enforcement Defines the Map](/books/investing-and-digital-assets/regulators-and-licenses#enforcement-defines-the-map).
- **BitMEX, 2021.** The CFTC's order imposed a $100 million civil penalty, up to $50 million of which could be offset by payments under FinCEN's parallel consent, for operating an unregistered swaps facility and FCM and for failing to implement a customer identification program that would identify US persons and an adequate AML program; BitMEX had to certify that all active users completed verification and that US persons and unverified users were blocked from trading and withdrawing. The company's 2025 criminal resolution I could not open. <!-- source-gap: ida-bitmex-2025 | missing | HDR Global Trading's January 2025 guilty plea and fine and the founders' 2025 pardons | closes with: the DOJ release and the court's judgment, opened (justice.gov rendered empty pages on 2026-11-05) | checked: 2026-11-05 -->
- **KuCoin, January 27, 2025.** Its operator, Peken Global, pleaded guilty to one count of operating an unlicensed money transmitting business, agreed to pay more than $297 million and to exit the US market for at least two years, and the Justice Department deferred prosecution of its two indicted founders for two years.
- **OKX, February 2025.** Its operator, Aux Cayes Fintech, pleaded guilty to one count of operating an unlicensed money transmitting business and agreed to pay more than $504 million: $420.3 million of forfeiture and a criminal fine of about $84.4 million. <!-- source-gap: ida-okx-kucoin-doj | secondary | the KuCoin and OKX pleas, amounts, dates and terms as summarized | closes with: the S.D.N.Y. press releases, opened in full (justice.gov rendered empty pages; facts from the search result summaries of those pages) | checked: 2026-11-05 -->

What the cases share, read as engineering requirements:

- **KYC that was optional or grandfathered** (Binance, BitMEX, KuCoin): verification is a gate on every account that can trade or withdraw, not a tier customers opt into, and a change of policy applies to existing accounts too.
- **Geofencing that leaked** (Binance, BitMEX): jurisdiction is a property of the customer from KYC, IP and funding source together, not of the session's IP alone ([Beyond the US](/books/investing-and-digital-assets/beyond-the-us) covers resolving it).
- **A SAR pipeline that didn't exist:** alerts that nobody can escalate to a filing are a program with no outcome; the MSB threshold is $2,000 and the clock is 30 days ([Suspicious Activity Reports](/books/banking-and-lending/bsa-aml#suspicious-activity-reports)).
- **A monitor with access to systems:** the resolution gave Treasury access to Binance's systems, so the data model has to be explainable to an outsider for five years.

## Tornado Cash and Samourai: Developers in Court

The sanctions half of the Tornado Cash story (OFAC's 2022 designation, the Fifth Circuit's *Van Loon* holding that immutable smart contracts aren't property, the March 21, 2025 delisting) is in [OFAC and Tornado Cash](/books/investing-and-digital-assets/freezes-and-onchain-compliance#ofac-and-tornado-cash) and [Sanctions Exposure](/books/investing-and-digital-assets/defi-from-a-regulated-platform#sanctions-exposure). The criminal half tested the 2019 guidance's line between a service and software:

- **Roman Storm (Tornado Cash).** A Manhattan jury convicted Storm in August 2025 of conspiring to operate an unlicensed money transmitting business and could not reach verdicts on conspiracy to commit money laundering and to violate sanctions. As reported on August 26, 2026, Judge Katherine Polk Failla moved the retrial on the hung counts from October 26, 2026 to April 26, 2027, and Storm's motion for acquittal on all three counts was undecided. <!-- source-gap: ida-storm-status | status | Storm's Rule 29 motion, sentencing and the April 26, 2027 retrial | closes with: the S.D.N.Y. docket in United States v. Storm, No. 23-cr-430, opened | checked: 2026-11-05 -->
- **Samourai Wallet.** Its founders, Keonne Rodriguez and William Hill, pleaded guilty in July 2025 to conspiring to operate an unlicensed money transmitting business, with the money laundering charges dropped; Rodriguez was sentenced to five years and Hill, on November 19, 2025, to 48 months and a $250,000 fine, after prosecutors alleged more than 80,000 BTC, worth more than $2 billion, moved through Samourai's mixing tools from 2017 to 2024 and earned the pair about $6 million in fees. <!-- source-gap: ida-samourai-sentences | secondary | the Samourai pleas, sentences, volumes and fees, and whether any pardon followed | closes with: the S.D.N.Y. press releases and judgments, opened | checked: 2026-11-05 -->

For a platform, the cases settle less than the headlines suggest. A custodial mixer is a money transmitter under the 2019 guidance and was before these cases; whether writing and deploying non-custodial mixing software is unlicensed money transmission is what Storm's motion and retrial are still deciding. Funds that passed through either service are still traceable, and an exchange's exposure policy treats them as high risk regardless of how the developers' cases end.

## How to Build It

The Payments volume's `travel_rule_records` ([How to Build It](/books/payments/stablecoins#how-to-build-it)) is the message record; its `onchain_transfer_id` maps here to an `onchain_transactions` row plus its `transfers` row, as in [The Travel Rule Hooks](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals#the-travel-rule-hooks). This chapter adds the counterparty the message went to and the proof behind an unhosted destination:

```sql
CREATE TABLE vasp_counterparties (         -- another VASP the platform messages
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  legal_name           TEXT NOT NULL,
  lei                  CHAR(20),
  jurisdiction         TEXT NOT NULL,
  licenses             JSONB NOT NULL DEFAULT '[]',   -- as verified: regulator, kind, register ref
  protocols            TEXT[] NOT NULL,       -- 'trp', 'trisa', vendor networks
  endpoints            JSONB NOT NULL,        -- per protocol: URL, certificate fingerprint
  travel_rule_regime   TEXT NOT NULL CHECK (travel_rule_regime IN ('implemented',
                         'partial', 'none', 'unknown')),
  dd_status            TEXT NOT NULL CHECK (dd_status IN ('pending', 'approved',
                         'restricted', 'rejected')),
  dd_reviewed_at       DATE,
  dd_next_review_on    DATE,
  risk_rating          TEXT CHECK (risk_rating IN ('low', 'medium', 'high')),
  UNIQUE (lei)
);

CREATE TABLE unhosted_wallet_attestations (  -- proof that a self-hosted address is the customer's
  id                   UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id           UUID NOT NULL REFERENCES accounts (id),
  chain_id             UUID NOT NULL REFERENCES chains (id),
  address              TEXT NOT NULL,
  method               TEXT NOT NULL CHECK (method IN ('signed_message', 'test_transfer',
                         'declaration')),
  challenge            TEXT,                  -- the message signed, with a nonce and date
  proof                TEXT,                  -- signature, or the test transfer's tx hash
  declared_owner       TEXT NOT NULL,         -- as the customer declared it
  verified_at          TIMESTAMPTZ,
  valid_until          TIMESTAMPTZ,
  revoked_at           TIMESTAMPTZ,
  UNIQUE (account_id, chain_id, address, method)
);

ALTER TABLE travel_rule_records
  ADD COLUMN vasp_counterparty_id UUID REFERENCES vasp_counterparties (id),
  ADD COLUMN attestation_id       UUID REFERENCES unhosted_wallet_attestations (id);
```

The decision the `travel_rule` withdrawal check makes, from the destination's type, the amount in dollars at request time, the counterparty's status and any attestation (thresholds per the customer's regime; $3,000 for a US sender):

```go tab="Go"
type Outcome string

const (
	Send       Outcome = "send"        // message the counterparty, then broadcast
	RecordOnly Outcome = "record_only" // unhosted, attested: record and proceed
	Attest     Outcome = "attest"      // unhosted, no proof yet: ask for one
	Hold       Outcome = "hold"        // counterparty unknown or not approved
)

func Decide(dest Destination, usd decimal.Decimal, threshold decimal.Decimal) Outcome {
	switch {
	case dest.Hosted && dest.Counterparty == nil:
		return Hold // a hosted address we can't attribute to an approved VASP
	case dest.Hosted && dest.Counterparty.DDStatus != "approved":
		return Hold
	case dest.Hosted:
		if usd.LessThan(threshold) {
			return RecordOnly
		}
		return Send
	case dest.Attestation != nil && dest.Attestation.Valid():
		return RecordOnly
	default:
		return Attest
	}
}
```

```rust tab="Rust"
pub enum Outcome { Send, RecordOnly, Attest, Hold }

pub fn decide(dest: &Destination, usd: Decimal, threshold: Decimal) -> Outcome {
    if dest.hosted {
        return match &dest.counterparty {
            None => Outcome::Hold, // a hosted address we can't attribute to an approved VASP
            Some(c) if c.dd_status != DdStatus::Approved => Outcome::Hold,
            Some(_) if usd < threshold => Outcome::RecordOnly,
            Some(_) => Outcome::Send,
        };
    }
    match &dest.attestation {
        Some(a) if a.is_valid() => Outcome::RecordOnly,
        _ => Outcome::Attest,
    }
}
```

Design notes:

- **Message before value.** The withdrawal stays in `checking` until the counterparty approves; the broadcast uses the address in the approval, so a rejected or redirected inquiry never sends funds ([The withdrawal state machine](/books/investing-and-digital-assets/crypto-deposits-and-withdrawals#the-withdrawal-state-machine)).
- **Inbound is symmetric.** A deposit over the threshold from an attributed VASP with no matching message goes to `held`; the inquiry endpoint matches incoming messages to the customer's account before approving.
- **Threshold in dollars at the time of the request,** from the same price source the ledger uses for marks, stored on the record; a price that moves between request and broadcast doesn't reopen the decision.
- **Customer data leaves the platform here,** so the counterparty table is also a data-sharing register: only approved counterparties receive personal data, and every message sent is logged for the privacy program as well as the AML one.

## Auditing

- **For every withdrawal and deposit at or over the threshold,** the Travel Rule record, its protocol, counterparty and status, or the attestation behind an unhosted destination.
- **Counterparty due diligence** with review dates, and every message sent to a counterparty whose review had lapsed (there should be none).
- **Holds and their resolution:** inbound transfers held for missing data, how long they waited and what released them.
- **Records retrievable by customer name and account,** as 1010.410(e) and Part 200 require, over the retention period of the strictest regime the entity is under.

## What This Means for the System You Build

- **Send the data before the value,** and broadcast only to the address the counterparty approved.
- **Know every counterparty VASP** you send customer data to, with a dated review.
- **Record the unhosted case explicitly,** with an ownership proof you can reuse, not as an absence of a record.
- **Make KYC a gate, not a tier,** and resolve jurisdiction from more than an IP address; the enforcement record is mostly failures of those two.
- **Track the moving pieces:** the withdrawn FinCEN proposals, FATF's 2025 changes as countries adopt them, and the Storm retrial.

## References

**Law and regulation**

- [31 CFR 1010.410](https://www.law.cornell.edu/cfr/text/31/1010.410), the funds Travel Rule: the transmittor's institution's duty in (f)(1), intermediaries in (f)(2), the exceptions and the recordkeeping and retrieval rules in (e)
- [23 NYCRR 200.15](https://www.law.cornell.edu/regulations/new-york/23-NYCRR-200.15), New York's transaction records without threshold and the $3,000 verification
- [FinCEN: Requirements for Certain Transactions Involving Convertible Virtual Currency or Digital Assets; Withdrawal (Federal Register document 2026-20430, October 6, 2026)](https://www.federalregister.gov/api/v1/documents.json?conditions[term]=convertible%20virtual%20currency&conditions[agencies][]=financial-crimes-enforcement-network&order=newest&per_page=10), the unhosted wallet proposal's withdrawal, the Huione special measure (2025-19571) and the GENIUS AML proposal
- [FinCEN: Proposal of Special Measure Regarding Convertible Virtual Currency Mixing; Withdrawal (91 FR 63513, October 6, 2026)](https://www.federalregister.gov/api/v1/documents/2026-20429.json), the withdrawal of the 2023 section 311 mixing proposal

**Regulators and guidance**

- [FinCEN: FIN-2019-G001 (May 9, 2019)](https://www.fincen.gov/sites/default/files/2019-05/FinCEN%20Guidance%20CVC%20FINAL%20508.pdf), crypto transfers as transmittals, timing and protocols, pseudonyms, hosted wallets' position in the chain, correspondent treatment and anonymizing services
- [Treasury: Binance settlement (November 21, 2023)](https://home.treasury.gov/news/press-releases/jy1925), FinCEN's and OFAC's findings, the monitorship and the exit from the US
- [CFTC: Release 8412-21](https://www.cftc.gov/PressRoom/PressReleases/8412-21), the BitMEX order, the $100 million penalty and offset, the registration, CIP and AML failures and the certifications

**Courts and enforcement**

- [U.S. Attorney, S.D.N.Y.: KuCoin pleads guilty](https://www.justice.gov/usao-sdny/pr/kucoin-pleads-guilty-unlicensed-money-transmission-charge-and-agrees-pay-penalties), the plea, the amount, the US exit and the deferred prosecution (page summary only; see the source-gap note)
- [U.S. Attorney, S.D.N.Y.: OKX pleads guilty](https://www.justice.gov/usao-sdny/pr/okx-pleads-guilty-violating-us-anti-money-laundering-laws-and-agrees-pay-penalties), the plea, forfeiture and fine (page summary only; see the source-gap note)

**Standards and protocols**

- [OpenVASP: Travel Rule Protocol specification, version 3.2.1](https://gitlab.com/OpenVASP/travel-rule-protocol/-/raw/master/core/specification.md), Travel Addresses, the inquiry, resolution and confirmation flow, headers, mutual TLS, `/identity` and errors
- [OpenVASP: TRP](https://www.openvasp.org/trp), the protocol's properties, ISO 24165 identifiers and listed implementations
- [TRISA developer documentation](https://trisa.dev/), the gRPC protocol, the Go reference implementation and Envoy
- [TRISA: Global Directory Service](https://trisa.dev/gds/index.html), certificates after extended validation, sealing keys, revocation, the directory and TestNet vs MainNet
- [interVASP: IVMS 101](https://intervasp.org/), the standard's publishers, dates and current edition

**In practice**

- [Cointelegraph: Roman Storm retrial delayed to April 2027 (August 26, 2026)](https://cointelegraph.com/news/roman-storm-retrial-delayed-april-2027), secondary: the conviction, hung counts, retrial date and pending motion
- [Decrypt: Samourai Wallet developer sentenced (November 20, 2025)](https://decrypt.co/349305), secondary: the pleas, sentences, volumes and fees
- [Chainalysis: Crypto hacking and stolen funds 2026](https://www.chainalysis.com/blog/crypto-hacking-stolen-funds-2026/), DPRK use of Huione relative to other actors
