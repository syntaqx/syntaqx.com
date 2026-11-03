+++
title = "Phone Numbers & Email Addresses"
nav_title = "Phones & Emails"
description = "Phone numbers in E.164 via libphonenumber, email accepted broadly and compared with care, ownership proven, and what was typed kept beside every key."
category = "Fundamentals"
order = 105
tags = ["phone-numbers", "email", "e164", "data-modeling", "standards", "privacy"]
+++

A phone number and an email address look like strings with a format, and both are used as far more than that: a way to reach someone, a sign-in identifier, a key for matching duplicate customers, a recovery channel, a fraud signal and the thing a consent record is attached to. Each use asks a different question of the same value. "Can I send to it?" wants the exact address. "Is this the same person?" wants a normalized key. "Does this person control it?" wants proof, and none of the format checks give you that.

The defaults below are the same for both: parse at the edge with a maintained library, keep what was typed, compare on a normalized key you chose on purpose, prove ownership before the value means anything, and treat both as personal data. Postal addresses follow the same pattern with more moving parts ([Addresses & Geocoding](/docs/fundamentals/addresses)); what you may send to these contact points, and when, is [Notifications & Consent](/docs/building-blocks/notifications) and [Calls, Texts & Email](/docs/compliance/consumer-contact).

## Phone Numbers

### Store E.164, Display National

Store every phone number in E.164, the ITU's international numbering plan ([ITU-T E.164](https://www.itu.int/rec/T-REC-E.164)): a `+`, a country code of one to three digits, then the national number, no more than 15 digits in all and no spaces or punctuation ([Twilio: What is E.164?](https://www.twilio.com/docs/glossary/what-e164)). The same Swiss number is `+41446681800` stored, `044 668 18 00` shown to someone in Switzerland, and `+41 44 668 18 00` shown to anyone else; libphonenumber produces all three from one parsed value ([libphonenumber](https://github.com/google/libphonenumber)).

E.164 is the right stored form because it's the only one that's globally unambiguous. `(415) 555-2671` means nothing without knowing it's American; `0446681800` loses its country the moment it leaves Switzerland. Every SMS and voice provider takes E.164, so the stored value goes to the provider unchanged, and two records of the same number compare equal as strings. Where a URI is needed (a `tel:` link, a vCard), [RFC 3966](https://datatracker.ietf.org/doc/html/rfc3966) builds it from the same value: global numbers are "identified by the leading '+' character."

Display is a separate step, done at render time for the viewer: national format when the viewer and the number share a country, international otherwise. Never store the formatted string as the value, and never reformat a stored number by hand with a regex. Twilio's page puts the second rule plainly: "A regular expression (regex) can't guarantee a match with a valid number."

### Parse With libphonenumber

Google's libphonenumber is the standard parser, formatter and validator, maintained as Java, C++ and JavaScript, with community ports listed in its README, including [nyaruka/phonenumbers](https://github.com/nyaruka/phonenumbers) for Go and [rust-phonenumber](https://github.com/1aim/rust-phonenumber) for Rust ([libphonenumber](https://github.com/google/libphonenumber)). It offers two checks, and they answer different questions:

- **Possible** "quickly guesses whether a number is a possible phone number by using only the length information." Use it while someone types.
- **Valid** does "full validation of a phone number for a region using length and prefix information." Use it on submit.

Neither says the number is in service or belongs to the person typing it. libphonenumber's own [falsehoods list](https://github.com/google/libphonenumber/blob/master/FALSEHOODS.md) is blunt about it: "A phone number which connects today may be disconnected tomorrow," and ranges don't always go live when the plan says they will.

A number typed without a `+` needs a default region to parse against. Take it from something the person told you (the country on their address, the country picker beside the field), not from their IP address: a traveler, a VPN and a cross-border worker all type their home number from somewhere else. Keep the country picker next to the field so the guess is visible and correctable.

```go tab="Go"
import (
	"errors"

	"github.com/nyaruka/phonenumbers"
)

type Phone struct {
	Entered   string // exactly what the person typed
	E164      string // +14155552671: the key for matching and sending
	Extension string // dialed after the call connects; never part of the key
	Region    string // ISO 3166-1 alpha-2 of the number, not of the person
}

var ErrInvalidPhone = errors.New("not a valid number for any region")

func ParsePhone(entered, defaultRegion string) (Phone, error) {
	n, err := phonenumbers.Parse(entered, defaultRegion)
	if err != nil {
		return Phone{}, err
	}
	if !phonenumbers.IsValidNumber(n) {
		return Phone{}, ErrInvalidPhone
	}
	return Phone{
		Entered:   entered,
		E164:      phonenumbers.Format(n, phonenumbers.E164),
		Extension: n.GetExtension(),
		Region:    phonenumbers.GetRegionCodeForNumber(n),
	}, nil
}
```

```rust tab="Rust"
use phonenumber::{country, Mode};

pub struct Phone {
    pub entered: String,             // exactly what the person typed
    pub e164: String,                // +14155552671: the key for matching and sending
    pub extension: Option<String>,   // dialed after the call connects; never part of the key
    pub region: Option<country::Id>, // the number's country, not the person's
}

pub enum PhoneError {
    Parse(phonenumber::ParseError),
    Invalid,
}

pub fn parse_phone(entered: &str, default_region: country::Id) -> Result<Phone, PhoneError> {
    let n = phonenumber::parse(Some(default_region), entered).map_err(PhoneError::Parse)?;
    if !phonenumber::is_valid(&n) {
        return Err(PhoneError::Invalid);
    }
    Ok(Phone {
        entered: entered.to_owned(),
        e164: n.format().mode(Mode::E164).to_string(),
        extension: n.extension().map(|e| e.to_string()),
        region: n.country().id(),
    })
}
```

Given `(415) 555-2671 ext. 204` and `US`, both return `+14155552671` with extension `204`.

### Metadata Is a Dependency That Changes

libphonenumber's knowledge of which ranges are valid lives in metadata that changes as countries renumber and open new ranges. The project releases "fortnightly" for most of the year, and publishes a sub-minor release even "when a release contains only metadata changes" ([libphonenumber](https://github.com/google/libphonenumber)). The ports are "by developers outside the libphonenumber project" and pick up new metadata on their own schedule, so check a port's release history before choosing it.

Two rules follow:

- **Keep it current like any other dependency** ([Dependencies](/docs/development/dependencies)), on every surface that validates: the server, the web client and the mobile app. A mobile build from last year rejecting a new range is a support ticket nobody can reproduce on the web.
- **Validate on entry, not on read.** A number that was valid when stored stays stored. When metadata changes, a number that now fails validation is a reason to ask the person to confirm it at their next visit, never a reason to drop it from a nightly job.

### Extensions

An extension is "dialled after waiting for a tone," and it's part of how to reach someone (libphonenumber's falsehoods list). E.164 has no place for it, so it isn't part of the key: store it in its own column, keep it out of uniqueness and matching, and give it back to a person or a dialer as a separate step. RFC 3966 carries it as an `;ext=` parameter on a `tel:` URI when one is needed. libphonenumber parses a written extension such as `ext. 204` into a separate field, which is where the Go and Rust code above takes it from.

### Line Type Is an Observation, Not a Property

Whether a number is mobile, landline or VoIP decides whether a text can reach it, how much fraud risk it carries and which rules apply to calling it. It is tempting to store it once. It changes:

- **Numbers move between carriers and between kinds of service.** Porting lets a person keep their number across carriers, and libphonenumber's falsehoods list notes a person may keep a number when moving, "even in some cases if it is a fixed-line number." The carrier data libphonenumber ships says which carrier a range was originally assigned to; the project states, "We do not provide data about the current carrier of a phone number."
- **Types themselves change.** The falsehoods list names "Phone numbers of a certain type today (e.g., mobile) will never be reassigned to another type" as false, and "Only mobile phones can receive text messages" as false too.
- **Numbers are recycled.** "Old phone numbers are recycled and get reassigned to other people," which is why consent tied to an old number needs a reassignment check ([Reassigned Numbers](/docs/compliance/consumer-contact#reassigned-numbers)).

So line type is an observation with a date, from a live lookup when it matters. A lookup service such as [Twilio Lookup Line Type Intelligence](https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence) returns a `type` (`mobile`, `landline`, `fixedVoip`, `nonFixedVoip`, `tollFree` and others) for numbers worldwide. Store it with `checked_at`, re-check before a decision that depends on it (sending a verification text, a risk score, an autodialer rule), and never use libphonenumber's `getNumberType` as more than a hint: it reads the number's range, not the line.

### Proving Ownership by SMS or Voice

A phone number belongs to whoever answers it today. Prove it by sending a short-lived one-time code by SMS or voice and asking for it back. That proves control at that moment, nothing more; record `verified_at` and the method, and re-verify when the number is changed or the use gets riskier.

Keep the code's job narrow. NIST classes the phone network as a *restricted* authenticator: "Use of the PSTN for out-of-band verification is _restricted_," verifiers "SHOULD consider risk indicators (e.g., device swap, SIM change, number porting, other abnormal behavior) before using the PSTN," and "Setting or changing the pre-registered telephone number is considered to be the binding of a new authenticator" ([NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html)). Verifying a number for contact is fine; using it as a sign-in factor is a last resort, covered with the other factors in [Multi-Factor Authentication](/docs/security/authentication#multi-factor-authentication).

The verification endpoint is also an open door to your messaging bill. In SMS pumping, "fraudsters take advantage of a phone number input field to receive a one-time passcode" so they share revenue from texts to number ranges they control ([Twilio: Preventing toll fraud](https://www.twilio.com/docs/verify/preventing-toll-fraud)). The defenses Twilio lists are the ones I'd build regardless of provider:

- **Allow only the countries you serve:** "disable all countries that you do not plan to send messages to."
- **Rate-limit sends** per number, per number range, per account, per IP and per device, with stricter limits where you don't expect traffic ([Rate Limiting](/docs/requests/rate-limiting#what-to-key-on)).
- **Turn on the provider's fraud screening**, and alert on spend per destination country, because no provider-side control catches everything.

## Email Addresses

### What the RFCs Allow and What to Accept

The grammar of an address is in [RFC 5322](https://datatracker.ietf.org/doc/html/rfc5322), and it allows quoted local parts, comments and other forms almost nobody uses and many mail systems mishandle. The HTML standard gave up on matching it: its definition of a valid email address, used by `<input type="email">`, "is a willful violation of RFC 5322" in favor of a simpler pattern of letters, digits, a set of symbols and dots before the `@`, and dot-separated domain labels of up to 63 characters after it ([WHATWG: Valid email address](https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address)).

The hard limits come from SMTP, in [RFC 5321](https://datatracker.ietf.org/doc/html/rfc5321): "The maximum total length of a user name or other local-part is 64 octets," a domain is at most 255 octets, and a path at most 256 octets "including the punctuation and element separators," which a verified erratum to RFC 3696 turns into a practical address limit of 254 characters ([RFC Errata 1690](https://errata.rfc-editor.org/eid1690)).

My default for what to accept:

- **Trim surrounding whitespace, then check the shape:** one `@` that isn't first or last, a domain that converts to ASCII (see [Internationalized Email](#internationalized-email)), at most 254 characters. The browser's `type="email"` check matches this closely; repeat it on the server ([Forms & Validation](/docs/frontend/forms)).
- **Don't write your own regex beyond that.** Every hand-written email regex rejects real addresses: apostrophes (`o'brien@`), plus tags, new top-level domains, long ones. OWASP's advice is to "Use well-tested libraries instead of custom regex" and "Reject clearly malformed input only" ([OWASP: Email Validation and Verification](https://cheatsheetseries.owasp.org/cheatsheets/Email_Validation_and_Verification_Cheat_Sheet.html)).
- **Don't check MX records or probe the mailbox at signup** as a gate. A lookup failure blocks a real person on a bad DNS day, and a working mailbox still doesn't prove it's theirs. "Format validation does not prove mailbox access" ([OWASP: Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)). The verification email proves both.
- **Treat disposable domains as a risk signal, not a rule.** OWASP calls a blocklist optional and says "Prefer risk-based controls over strict blocking." A throwaway address on a free trial is a fraud question ([Risk Scoring](/docs/building-blocks/risk-scoring)); on a newsletter it's the person's choice.

### Case, Dots and Plus Tags

Two strings that differ only in letter case may or may not be the same mailbox, and the standards are clear about who decides. RFC 5321: "The local-part of a mailbox MUST BE treated as case sensitive," and "the local-part MUST be interpreted and assigned semantics only by the host specified in the domain part of the address." It also says "exploiting the case sensitivity of mailbox local-parts impedes interoperability and is discouraged," and in practice mail providers treat case as insignificant. Domains are case-insensitive under DNS.

So I keep two values. **The address as entered** is what I send to, byte for byte, because only the receiving host gets to interpret it. **The comparison key** is what I use for uniqueness and lookup: the domain converted to its ASCII form and lowercased, and the local part normalized to NFC and lowercased. Lowercasing the local part is a deliberate decision against the letter of RFC 5321, chosen because two accounts for `Ana@example.com` and `ana@example.com` are far more likely to be one confused person than two people. Write the policy down, as OWASP asks: "Document the comparison policy and apply it consistently across registration, login, password reset, recovery, and account linking."

Dots and plus tags are where I stop normalizing:

- **Gmail ignores dots** in consumer addresses ("Emails sent to any dotted version of your address will only go to you"), but its own help page says that doesn't hold for Workspace accounts, where dots change the address ([Google: Dots in Gmail addresses](https://support.google.com/mail/answer/7436150)). A domain of `gmail.com` tells you which rule applies; a company domain hosted on Google doesn't.
- **Plus tags** (`ana+news@example.com`) are delivered to `ana@` by Gmail and Google Workspace ([Google: plus addressing](https://support.google.com/a/users/answer/9308648)) and by many other providers, but the separator and its meaning are the host's business: the Sieve subaddress standard says "the encoding of detailed addresses are site and/or implementation specific" ([RFC 5233](https://datatracker.ietf.org/doc/html/rfc5233)).

Stripping either in the comparison key merges addresses that a host treats as distinct, and it takes away a person's tool for sorting and tracing mail (a plus tag per site is how people find out who sold their address). OWASP's guidance agrees: "Avoid provider-specific transformations (e.g., Gmail dot removal) unless fully controlled." So the comparison key keeps dots and plus tags.

The one place stripping earns its keep is abuse: the same person farming free trials with `ana+1@`, `ana+2@` and `a.na@`. That's a deliberate, per-provider decision with a cost, so it goes in a **separate abuse key** (dots removed for consumer Gmail, plus tags removed for providers known to use `+`) used only as a [risk signal](/docs/building-blocks/risk-scoring), never for uniqueness, sign-in or sending. A false match on the abuse key sends someone to review; a false match on the identity key gives one person another person's account.

```go tab="Go"
import (
	"errors"
	"strings"

	"golang.org/x/net/idna"
	"golang.org/x/text/unicode/norm"
)

var ErrInvalidEmail = errors.New("not an email address")

// EmailKey is the comparison key: NFC local part and A-label domain,
// both lowercased. Dots and plus tags are kept.
func EmailKey(entered string) (string, error) {
	s := strings.TrimSpace(entered)
	at := strings.LastIndexByte(s, '@')
	if at < 1 || at == len(s)-1 {
		return "", ErrInvalidEmail
	}
	domain, err := idna.Lookup.ToASCII(s[at+1:])
	if err != nil {
		return "", ErrInvalidEmail
	}
	local := norm.NFC.String(s[:at])
	return strings.ToLower(local) + "@" + strings.ToLower(domain), nil
}
```

```rust tab="Rust"
use unicode_normalization::UnicodeNormalization;

pub struct InvalidEmail;

/// The comparison key: NFC local part and A-label domain, both lowercased.
/// Dots and plus tags are kept.
pub fn email_key(entered: &str) -> Result<String, InvalidEmail> {
    let s = entered.trim();
    let at = s.rfind('@').ok_or(InvalidEmail)?;
    let (local, domain) = (&s[..at], &s[at + 1..]);
    if local.is_empty() || domain.is_empty() {
        return Err(InvalidEmail);
    }
    let domain = idna::domain_to_ascii(domain).map_err(|_| InvalidEmail)?;
    let local: String = local.nfc().collect();
    Ok(format!("{}@{}", local.to_lowercase(), domain.to_lowercase()))
}
```

Both turn ` Ana.Lima+news@Bücher.Example ` into `ana.lima+news@xn--bcher-kva.example`. The key is a derived value: compute it in one shared function, store it, and recompute it for every row if the policy ever changes, with the same version everywhere ([Matching, Merging & Many Sources](/docs/building-blocks/record-linkage)).

### Internationalized Email

An address can be non-ASCII in two places. The domain can be an internationalized domain name, which has an ASCII form (the `xn--` A-label) that every mail system can route; browsers "should convert punycode in the domain labels of the value to IDN in the display and vice versa" (WHATWG). The local part can be non-ASCII only under Email Address Internationalization (EAI): [RFC 6530](https://datatracker.ietf.org/doc/html/rfc6530) is the framework, [RFC 6532](https://datatracker.ietf.org/doc/html/rfc6532) allows UTF-8 in headers, and [RFC 6531](https://datatracker.ietf.org/doc/html/rfc6531) adds the `SMTPUTF8` extension so the envelope can carry them. A server that doesn't advertise `SMTPUTF8` can't receive such a message, and the sender must not send it there: the message is rewritten to ASCII by a submission agent where possible, or bounced.

Support is real and uneven. Gmail began sending to and receiving from addresses with accented and non-Latin characters in 2014, while not yet letting people create them ([Google: A first step toward more global email](https://blog.google/products-and-platforms/products/gmail/a-first-step-toward-more-global-email/)). On the receiving side, ICANN surveys the mail servers of second-level domains across generic TLDs each quarter, and reports that "between 2022 and 2026 the number of domains with UA-ready mail servers increased from approximately 20% to 29%" ([ICANN: Universal Acceptance evaluations](https://www.icann.org/ua-evaluations-en)). That leaves most domains unable to receive such an address, and it excludes country-code TLDs. I haven't found a public measurement of how many sending services and email APIs can submit `SMTPUTF8` mail, so I don't state one. <!-- source-gap: eai-support-share | missing | share of email APIs and sending services that support SMTPUTF8 end to end (receiving-side gTLD share is ICANN-measured) | closes with: a current published survey or measurement of SMTPUTF8 support across major ESPs and email APIs | checked: 2026-11-03 -->

My default: accept internationalized addresses and store them in UTF-8, NFC-normalized; compare on the A-label domain; and check that your own sending provider supports `SMTPUTF8` before you let one become a sign-in address. If it doesn't, say so on the form rather than accepting an address you can never verify. Look-alike characters in addresses are a spoofing risk OWASP calls out (Latin and Cyrillic letters that render alike); [Text & Unicode](/docs/fundamentals/text-and-unicode#confusables-and-identifier-security) covers detecting them.

### Verifying Ownership

An address is unverified until its owner clicks a link or types a code sent to it. OWASP's rules for the token: "Use cryptographically secure, random tokens," single-use, time-limited, and invalidated after use or expiry; accounts shouldn't be activated before verification completes ([OWASP: Email Validation and Verification](https://cheatsheetseries.owasp.org/cheatsheets/Email_Validation_and_Verification_Cheat_Sheet.html)). Build the link from a configured base URL, never from the request's `Host` header ([OWASP: Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)).

Changing an address is a recovery path, so it gets the stricter flow: re-authenticate, "Notify the existing email address of the change," "Require confirmation of the new email address," and for high-risk systems require confirmation from both. Until the new address is confirmed, the old one stays the address of record. Responses to "is this address registered?" in signup, sign-in and reset must look the same either way ([Credential Stuffing and Enumeration](/docs/security/authentication#credential-stuffing-and-enumeration)).

## Storing Both

One table of contact points serves both kinds, owned by a person or account, with the raw input, the key and the evidence side by side:

```sql
CREATE TABLE contact_points (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  person_id       UUID NOT NULL REFERENCES people (id),
  kind            TEXT NOT NULL CHECK (kind IN ('phone', 'email')),
  entered         TEXT NOT NULL,           -- exactly as typed; what support sees
  address         TEXT NOT NULL,           -- E.164, or the email as entered, trimmed: what you send to
  match_key       TEXT NOT NULL,           -- E.164, or the email comparison key
  extension       TEXT,                    -- phones only; never part of the key
  abuse_key       TEXT,                    -- provider-specific stripping; risk scoring only
  line_type       TEXT,                    -- an observation, with its date
  line_type_at    TIMESTAMPTZ,
  verified_at     TIMESTAMPTZ,
  verified_method TEXT CHECK (verified_method IN ('sms_code', 'voice_code', 'email_link', 'email_code')),
  key_version     INT NOT NULL,            -- normalization policy and library version that built match_key
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only a verified contact point claims the key.
CREATE UNIQUE INDEX contact_points_kind_match_key_verified_idx
  ON contact_points (kind, match_key) WHERE verified_at IS NOT NULL;
```

- **Uniqueness belongs to verified values.** If an unverified claim held the unique key, anyone could type someone else's address at signup and lock its owner out. Let several unverified rows share a key; the first to verify wins, and verifying evicts the others (with a notice to their owners).
- **`key_version` makes a policy change a migration, not a mystery.** A new libphonenumber version or a revised email policy recomputes `match_key` for every row, and collisions it surfaces go to review rather than failing silently.
- **Consent hangs off the contact point,** not the person ([The Consent Ledger](/docs/building-blocks/notifications#the-consent-ledger)), and duplicate customers are found with the same keys ([Matching, Merging & Many Sources](/docs/building-blocks/record-linkage)).

## Privacy

Phone numbers and email addresses identify people directly, so they are personal data under GDPR and its peers and deserve the controls in [GDPR & Data Privacy](/docs/compliance/gdpr) and [Sensitive Data](/docs/security/sensitive-data):

- **Keep them out of logs, URLs and analytics events.** Log the contact point's ID, or a masked form (`+1 ••• ••• 2671`, `a•••@example.com`) when a human needs a hint.
- **Don't put them in identifiers** that travel: not in URLs, file names, cache keys or third-party event properties.
- **Delete them with the person, but keep the suppression.** When a person is erased, the contact point goes, and a keyed hash of its match key stays on the suppression list so an old import can't bring it back ([Data Retention & Deletion](/docs/building-blocks/data-retention#erasure-requests)).
- **Mask them in support tools by default** and reveal on an audited action ([Support Access](/docs/security/support-access)).

## Checklist

- **Store phones in E.164,** format nationally or internationally only at display, and keep extensions in their own column.
- **Parse with libphonenumber** (or a maintained port), with a default region from what the person told you, and keep its metadata current on every client.
- **Validate on entry, never on read;** treat line type as a dated observation from a live lookup.
- **Verify phones with short-lived codes,** and harden the endpoint against SMS pumping with country allowlists and rate limits.
- **Accept email broadly:** trimmed, one `@`, an IDNA-valid domain, at most 254 characters; no home-made regex, no MX gate.
- **Send to the address as entered; compare on a key** with a lowercased A-label domain and an NFC, lowercased local part; keep dots and plus tags.
- **Strip dots or plus tags only into a separate abuse key,** per provider, for risk scoring.
- **Accept internationalized addresses** once your sending provider supports `SMTPUTF8`.
- **Verify before the value means anything,** confirm changes on both old and new addresses, and make uniqueness apply only to verified values.
- **Keep both out of logs and URLs,** and keep a hashed suppression when a person is erased.

## References

**Specifications**

- [ITU-T E.164](https://www.itu.int/rec/T-REC-E.164), the international public telecommunication numbering plan
- [RFC 3966: The tel URI for Telephone Numbers](https://datatracker.ietf.org/doc/html/rfc3966), global numbers with a leading `+` and the `ext` parameter
- [RFC 5321: Simple Mail Transfer Protocol](https://datatracker.ietf.org/doc/html/rfc5321), local-part case sensitivity, who interprets the local part, and length limits
- [RFC 5322: Internet Message Format](https://datatracker.ietf.org/doc/html/rfc5322), the full address grammar
- [RFC Errata 1690](https://errata.rfc-editor.org/eid1690), the 254-character practical limit on an address
- [RFC 5233: Sieve Subaddress Extension](https://datatracker.ietf.org/doc/html/rfc5233), plus-style detail addresses as site-specific
- [RFC 6530](https://datatracker.ietf.org/doc/html/rfc6530), [RFC 6531](https://datatracker.ietf.org/doc/html/rfc6531) and [RFC 6532](https://datatracker.ietf.org/doc/html/rfc6532), internationalized email: framework, `SMTPUTF8` and UTF-8 headers
- [WHATWG: Valid email address](https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address), the `type="email"` definition and its willful violation of RFC 5322
- [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html), the phone network as a restricted authenticator, and email confirmation codes

**Reference**

- [libphonenumber](https://github.com/google/libphonenumber), parsing, formatting and validation, release cadence and ports
- [libphonenumber: Falsehoods about phone numbers](https://github.com/google/libphonenumber/blob/master/FALSEHOODS.md), portability, changing types, extensions and recycling
- [nyaruka/phonenumbers](https://github.com/nyaruka/phonenumbers), the Go port
- [rust-phonenumber](https://github.com/1aim/rust-phonenumber), a Rust port
- [Twilio: What is E.164?](https://www.twilio.com/docs/glossary/what-e164), the 15-digit limit and country code lengths
- [Twilio: Line Type Intelligence](https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence), live line type lookups and their values
- [Twilio: Preventing toll fraud](https://www.twilio.com/docs/verify/preventing-toll-fraud), SMS pumping and its mitigations
- [OWASP: Email Validation and Verification Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Email_Validation_and_Verification_Cheat_Sheet.html), comparison policy, tokens and email change flows
- [OWASP: Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html), format validation versus mailbox access
- [OWASP: Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), token properties and Host header injection

**In practice**

- [Google: Dots don't matter in Gmail addresses](https://support.google.com/mail/answer/7436150), and the Workspace exception
- [Google Workspace: Plus addressing](https://support.google.com/a/users/answer/9308648), `+` variants delivered to the same inbox
- [Google: A first step toward more global email](https://blog.google/products-and-platforms/products/gmail/a-first-step-toward-more-global-email/), Gmail's 2014 support for non-Latin addresses
- [ICANN: Universal Acceptance evaluations](https://www.icann.org/ua-evaluations-en), the quarterly EAI survey of gTLD mail servers, about 20% of domains UA-ready in 2022 and 29% in 2026
