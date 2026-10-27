+++
title = "Encryption at Rest"
description = "Disk, database and field encryption and what each stops: envelope encryption, KMS or HSM, rotation jobs, crypto-shredding, blind indexes and key-use logs."
category = "Security"
order = 713
tags = ["security", "encryption", "kms", "keys", "privacy"]
+++

"Encrypted at rest" is a checkbox every managed database ticks by default, and it's the least useful sentence in a security questionnaire, because it doesn't say *who* can't read the data. Storage encryption stops someone who walks off with a disk or copies a snapshot. It does nothing against an attacker who has your application's database credentials, a SQL injection, an over-broad support role or a leaked backup restored with the same keys, because every one of those reads the data through the layer that decrypts it.

My rule: **decide which reader each layer is meant to stop, and encrypt at the layer that stops them.** For most data, managed storage encryption is enough. For the few fields whose exposure would be a breach on its own (card and bank numbers, government IDs, health details, secrets customers hand you), encrypt in the application with keys the database never sees.

## Three Layers, Three Different Threats

| Layer | Example | Stops | Doesn't stop |
| ----- | ------- | ----- | ------------ |
| **Disk or volume** | Cloud block storage encryption, a managed database's storage encryption | Stolen or discarded disks, a copied snapshot or backup without access to the key | Anyone who can query the database |
| **Database** | Transparent data encryption (TDE) in the engine | The same, plus raw data files copied off the host | Anyone who can query the database |
| **Application or field** | The service encrypts a column before writing it | A database dump, a read replica in the wrong hands, a support console, a SQL injection that reads the column | An attacker running as the service, with its key permissions |

AWS describes RDS storage encryption accurately: it covers "the underlying storage for DB instances, its logs, automated backups, read replicas, and snapshots," and handles decryption "transparently," so "you don't need to modify your database client applications." Transparent is the point and the limit: anyone the database lets in sees plaintext.

Turn storage encryption on everywhere, at creation. On RDS you "can only encrypt an Amazon RDS DB instance when you create it," and encrypting an existing one means restoring from an encrypted copy of a snapshot, which is a migration you don't want to schedule later. Then choose application-level encryption field by field, using the classification in [Sensitive Data](/docs/payments/sensitive-data#classify-every-field). Encrypting everything in the application destroys search, sorting and reporting for no gain on fields that were never sensitive.

## Envelope Encryption

Application-level encryption uses two kinds of key:

- **A data encryption key (DEK)** encrypts the data, with an authenticated cipher. Google's guidance is to use AES-256 in GCM mode, generate DEKs locally, generate a new DEK each time you write data, and not use the same DEK for two different users.
- **A key encryption key (KEK)** wraps the DEK. It lives in a key management service or HSM and never leaves it. The wrapped DEK is stored beside the ciphertext.

The KMS only ever sees small DEKs, never your data; Cloud KMS caps a single encrypt or decrypt request at 64 KiB, which is why bulk data is always encrypted locally. One KEK protects millions of DEKs, so per-record or per-tenant keys don't mean millions of keys in the KMS.

```sql
CREATE TABLE customer_secrets (
  id               UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id        UUID NOT NULL REFERENCES tenants (id),
  kind             TEXT NOT NULL,                -- 'bank_account', 'tax_id'
  ciphertext       BYTEA NOT NULL,               -- AES-256-GCM, nonce prepended
  wrapped_dek      BYTEA NOT NULL,               -- DEK encrypted under the KEK
  kek_id           TEXT NOT NULL,                -- KMS key and version that wrapped it
  dek_version      INTEGER NOT NULL,             -- bumped when the data is re-encrypted
  lookup_hmac      BYTEA,                        -- blind index, see below
  last_four        TEXT,                         -- display value, stored in the clear on purpose
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- **Every ciphertext names its key.** The KEK ID and version sit in the row, so old and new keys can coexist during rotation and a decryption failure points at a key, not a mystery.
- **Bind the ciphertext to its row.** Pass the record ID and tenant as associated data to the cipher (or as the KMS encryption context when unwrapping), so a ciphertext copied into another customer's row fails to decrypt instead of quietly revealing someone else's data.
- **Keep display values separately.** The last four digits, the bank name, the expiry: whatever support and the UI need goes in plain columns, so the decrypt path is only for the few operations that need the full value.
- **Decrypt in one service.** A small service or library owns the KEK permission and the decrypt call. Everything else holds a reference, which keeps the set of code that can see plaintext small enough to review.

## KMS or HSM

A **KMS** is a managed API over keys you can't export: you call encrypt, decrypt or generate-data-key, and the provider runs the hardware. An **HSM** is the hardware itself, a tamper-responsive device that holds keys and uses them without letting them out; a dedicated one gives you exclusive control and payment-specific commands at the price of running it.

Cloud KMSs blur the line by offering protection levels. Google Cloud KMS has `SOFTWARE`, `HSM` (keys stored and used in Google-owned HSMs, which the page describes as "FIPS 140-2 Level 3 validated"), and `EXTERNAL` and `EXTERNAL_VPC`, where keys live in a key manager you operate outside Google. My default is a cloud KMS key at the HSM protection level for anything regulated, and software keys elsewhere. A dedicated HSM is for when a standard or a counterparty requires one: PIN translation, card verification and key exchange with networks are the usual reasons, and [HSMs & Key Management](/books/payments/key-management) covers those specifics.

## The Key Hierarchy

Keys form a tree, each layer protected by the one above:

1. **The root,** inside the KMS or HSM. You never see it.
2. **KEKs,** one per purpose and, where it buys something, per tenant: `bank-accounts`, `tax-ids`, `tenant-<id>`. A separate KEK per purpose means one leaked permission doesn't decrypt everything; a KEK per tenant makes deleting a tenant a key deletion (below).
3. **DEKs,** per record or per batch, stored wrapped.

Rules for the tree:

- **One purpose per key,** enforced by KMS permissions: the service that decrypts bank accounts can't decrypt tax IDs. The same separation as [Authorization](/docs/security/authorization), applied to keys.
- **Nobody holds decrypt alone at scale.** Engineers can deploy the service that decrypts; they can't call decrypt from a laptop. Break-glass access is a separate, alerted role ([Support Access](/docs/security/support-access)).
- **Test and production never share keys.** A test environment with production keys is a production environment.

## Rotation: Re-wrap and Re-encrypt

Rotation in a KMS doesn't do what its name suggests. AWS says it plainly: rotating a KMS key "has no effect on the data that the KMS key protects. It does not rotate the data keys that the KMS key generated or re-encrypt any data," and "will not mitigate the effect of a compromised data key." The KMS keeps old key material to decrypt old wraps, and AWS's default automatic rotation period is 365 days. So rotation is really two jobs:

- **Re-wrap** DEKs under the new KEK version: unwrap with the old, wrap with the new, update `kek_id`. Cheap, because DEKs are tiny and the data is untouched. Do this when a KEK rotates, when you move to a new KEK, or when you suspect someone held the old KEK's permission.
- **Re-encrypt** the data itself under a new DEK when a DEK reaches the end of its cryptoperiod or might be exposed. This touches every affected row, so build it as a resumable [background job](/docs/architecture/background-jobs): batches, checkpoints, a decrypt-and-compare check on the new ciphertext before committing each batch, and the old key kept able to decrypt (never encrypt) until the job reports zero rows left.

NIST SP 800-57 sets the scale. A data-encryption key used for smaller volumes of data "might have an originator-usage period of up to two years," with recipient use "no more than three years beyond the end of the originator-usage period"; one encrypting large volumes over a short time should change on the order of a day or a week. Key-wrapping keys follow the same pattern. A DEK per write, as Google recommends, makes DEK cryptoperiods a non-issue for new data; it's legacy shared DEKs that need the re-encrypt job.

## Crypto-Shredding

Deleting data from a database is easy. Deleting it from every backup, replica, export and log is not, and backups are usually immutable by design ([Data Retention](/docs/architecture/data-retention#backups)). Crypto-shredding solves the backup problem: encrypt the data under a key that exists only for that data, and to delete the data, destroy the key. Every copy, including the backup from six months ago, becomes ciphertext nobody can read. NIST SP 800-57 names the technique for large volumes of encrypted key information: "cryptographic sanitization (i.e., destroying the key used to decrypt or unwrap the key information)."

- **Scope the key to what you'll delete together:** a tenant, a user, a record. A tenant offboarding becomes one key deletion; a [GDPR erasure request](/docs/compliance/gdpr#data-subject-rights) for one person needs a per-person key for the fields that identify them.
- **Destruction is deliberate and delayed.** AWS requires a waiting period of 7 to 30 days before a KMS key is deleted (30 by default), during which it can't be used and the deletion can be cancelled. After that, "you can no longer decrypt the data that was encrypted under that KMS key, which means that data becomes unrecoverable." Disable first, alarm on any attempted use during the wait, then let it delete.
- **Check where the key itself is copied.** A key that also lives in an HSM backup, an escrow or a cache isn't destroyed until every copy is.
- **Plaintext copies defeat it.** Search indexes, analytics exports, logs and caches that hold the decrypted value have to be deleted the ordinary way. Crypto-shredding covers the encrypted copies only.

## Looking Things Up Without Decrypting

Encrypted columns can't be indexed or compared, and "find the customer with this bank account" can't mean decrypting every row. Three ways around it:

- **A blind index:** a keyed HMAC of the normalized plaintext, stored beside the ciphertext and indexed. An equality lookup computes the same HMAC and queries it. The HMAC key is separate from the encryption keys and lives in the KMS too. A plain unkeyed hash is not a blind index: a nine-digit number has a billion possible values, and an attacker with the table can hash all of them in minutes.
- **Truncate to leak less.** A full HMAC maps one value to one index entry, so the index reveals how often each value occurs. AWS's Database Encryption SDK calls its blind indexes beacons and truncates them on purpose, so that "multiple distinct plaintext values can map to the same beacon"; the collisions limit frequency analysis, at the cost of false positives you filter out after decrypting. Its standard beacons "can only perform equality searches." Ranges, prefixes and sorting on the plaintext are gone.
- **Tokenization:** replace the value with a random token everywhere outside one vault, and look up through the vault. It's envelope encryption with the lookup moved into one service, and it's how card data is kept out of most of a system ([Running a Card Vault](/books/payments/card-vault)).

Store the derived values you need as their own columns instead (last four, the year of a birth date, a postal-code prefix), and decide each one deliberately: every derived column is a small leak of the encrypted value.

## Logging Key Use

Application-level encryption turns "who read this?" into a question the KMS can answer, because every unwrap is an API call. AWS CloudTrail records KMS cryptographic operations "such as GenerateDataKey and Decrypt" along with key management changes, and the encryption context appears in the log entry. Use it:

- **Alert on unusual decrypt volume** per caller. A service that unwraps 1,000 keys an hour and suddenly unwraps 100,000 is either a bug or an exfiltration.
- **Alert on any decrypt from an unexpected principal,** and on every key policy, rotation or deletion change.
- **Keep the application's own reveal log** too: which user, which record, which reason ([Audit Trails](/docs/architecture/audit-trails#log-access-not-just-changes)). The KMS log knows the service unwrapped a key; only the application knows on whose behalf.
- **Don't let logging be switched off quietly.** CloudTrail can exclude KMS events from a trail, and AWS warns that doing so "can obscure actions that use your KMS keys." Restrict that permission and alert on it.

## What Goes Wrong

- **Treating storage encryption as protection from the application's own users.** It isn't; that's what access control and field encryption are for.
- **The KEK beside the data.** A key in an environment variable, a config file or the same database it protects is a password taped to the safe.
- **No key ID on the ciphertext,** so rotation means guessing which key made which row.
- **Unkeyed hashes as lookup columns,** reversible by brute force for anything with a small value space.
- **Plaintext escaping through the side door:** request logs, error trackers, analytics events and search indexes that receive the decrypted value ([Sensitive Data](/docs/payments/sensitive-data#logging-and-errors)).
- **A key deleted by accident.** Deletion is irreversible by design, so it goes through review, a waiting period and an alarm.

## Checklist

- **Storage encryption on every database, volume, bucket and backup,** enabled at creation.
- **Fields classified,** and the sensitive ones encrypted in the application with envelope encryption and AES-256-GCM.
- **KEKs in a KMS or HSM,** one per purpose, per tenant where deletion needs it; DEKs per write, stored wrapped beside the data with the key ID.
- **Ciphertext bound to its row** with associated data or encryption context.
- **Re-wrap and re-encrypt jobs** built, resumable and rehearsed; cryptoperiods written down.
- **Crypto-shredding keys scoped** to what gets deleted together, with deletion delayed and alarmed.
- **Blind indexes keyed and truncated** where lookups are needed; derived display columns chosen deliberately.
- **Key use logged and alerted on,** with an application-level reveal log beside it.

## References

**Specifications**

- [NIST SP 800-57 Part 1 Rev. 5](https://doi.org/10.6028/NIST.SP.800-57pt1r5), cryptoperiods for data-encryption and key-wrapping keys, and cryptographic sanitization by destroying keys

**Reference**

- [Google Cloud KMS: Envelope encryption](https://docs.cloud.google.com/kms/docs/envelope-encryption), DEKs and KEKs, a new DEK per write, AES-256-GCM and the 64 KiB request limit
- [Google Cloud KMS: Protection levels](https://docs.cloud.google.com/kms/docs/protection-levels), software, HSM and external key protection
- [AWS KMS: Rotate keys](https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html), why rotation doesn't rotate data keys or re-encrypt data, retained key material and the 365-day default
- [AWS KMS: Delete an AWS KMS key](https://docs.aws.amazon.com/kms/latest/developerguide/deleting-keys.html), the 7 to 30 day waiting period and unrecoverable data after deletion
- [AWS KMS: Logging AWS KMS API calls with AWS CloudTrail](https://docs.aws.amazon.com/kms/latest/developerguide/logging-using-cloudtrail.html), logged cryptographic operations, encryption context and the warning about excluding KMS events
- [AWS: Encrypting Amazon RDS resources](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Overview.Encryption.html), what storage encryption covers, transparent decryption, and encryption only at creation
- [AWS Database Encryption SDK: Beacons](https://docs.aws.amazon.com/database-encryption-sdk/latest/devguide/beacons.html), truncated HMAC beacons, frequency analysis and equality-only search
