+++
title = "How Code Got to Servers"
description = "FTP, FTPS and SFTP, the panel file manager, rsync and Capistrano: how code reached hosted servers before platforms owned the deploy, and its credentials."
category = "Hosting & Cloud Industry"
order = 2139
part = "Deployment"
tags = ["deployment", "ftp", "sftp", "rsync", "capistrano", "history"]
+++

For most of the web's history, deploying meant copying files onto a machine someone else ran. The host gave the customer a login, a home directory and a protocol, and the customer's code was whatever bytes sat in that directory at the moment a request arrived. Every later deployment model in this volume is a reaction to what that arrangement cost: credentials sent in the clear, half-uploaded releases serving traffic, no record of what changed, and no way back except uploading the old files again, if anyone still had them.

This chapter covers the file-copy era and the tools that disciplined it: FTP and its secured variants, the control panel's file manager and FTP accounts, SSH and SFTP, rsync's delta transfer, and Capistrano's release directories, which introduced the atomic switch and the rollback that platforms later made a product. It extends the [core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) with the deploy credentials a host issues. The platforms that took the deploy away from the customer are [Platforms Take Over the Deploy](/books/hosting-and-cloud/platform-deploys); hosted build servers are [From Tinderbox to Jenkins: How CI Began](/books/hosting-and-cloud/ci-history); the panel itself is [cPanel & WHM](/books/hosting-and-cloud/cpanel-and-whm); configuration management, which converged servers rather than copying files to them, is the Infrastructure as Code part, starting with [Convergence: CFEngine to Puppet](/books/hosting-and-cloud/cfengine-and-puppet).

## How the Providers Do It

Every shared and managed host still offers some form of file deploy, and the shape is remarkably stable across them:

| Provider or tool | How code arrives | Credential | What it shows |
| --- | --- | --- | --- |
| **cPanel and WHM hosts** | FTP accounts, the File Manager in the browser, SSH and SFTP when the package allows shell access | Per-account FTP users; the cPanel password; SSH keys | The number of FTP accounts is a package limit set in WHM, so file access is a sold feature |
| **Plesk and DirectAdmin hosts** | FTP users per subscription or domain, a web file manager, SSH where enabled | Per-subscription FTP and system users | The same model under another panel's names |
| **Managed WordPress hosts** | SFTP per site or environment, plus the CMS's own uploader | Per-environment SFTP users | File access is scoped to one site and one environment |
| **VPS and dedicated servers** | Anything over SSH: `scp`, SFTP, rsync, git pulls, scripted deploys | The customer's own keys | The host provides the machine; the deploy is the customer's |
| **rsync** | Delta transfer over SSH or its own daemon | SSH keys, or rsync daemon secrets | Only changed blocks move, so mirroring a release to many servers is cheap |
| **Capistrano and its descendants** | Scripted SSH to many servers: check out, build, link shared files, switch a symlink | A deploy user's SSH key, often with agent forwarding | Releases are directories, the live one is a pointer, and rollback moves the pointer |

Three patterns run through the table. **Access is a product limit.** File and shell access are features of a plan, counted and priced, because every login is a support load and an attack surface. **The credential is the deploy.** Whoever holds the FTP password or the SSH key can change the site, so the host's real deploy system is its credential system. **Atomicity arrived late.** Copying files into the directory being served means visitors see a mix of old and new for as long as the copy takes; only the release-directory pattern made a deploy a single switch.

## FTP: The Protocol That Shipped the Web

The File Transfer Protocol predates the web by two decades: its first proposal is RFC 114 (1971), and the version every server speaks is RFC 959, published in October 1985 by Jon Postel and Joyce Reynolds. RFC 959 splits a session into a control connection, where the client sends commands like `USER`, `PASS`, `STOR` and `RETR`, and a separate data connection for each transfer. In active mode the server connects back to the client; the `PASV` command reverses that so the client opens the data connection, which is what made FTP usable from behind NAT and firewalls.

What it solved was universal: every operating system had a client, so any customer could put files on any host. What it cost was everything that later became a security requirement. The username, the password and the files cross the network in the clear. The second connection on a negotiated port is hostile to firewalls and load balancers, so hosts run passive port ranges and FTP-aware middleboxes. And the protocol has no notion of a release: a `STOR` overwrites a file in place, one file at a time, while the site keeps serving.

**FTPS** (RFC 4217, "Securing FTP with TLS," October 2005) added TLS to both channels with `AUTH TLS`, `PBSZ` and `PROT P`. It fixed the cleartext password and kept the two-connection design, so an encrypted control channel now hides from the firewall the port numbers the firewall needs to see. Hosts that still offer FTP usually offer explicit FTPS on the same port and push customers toward SFTP.

## SSH and SFTP

SSH replaced FTP not by being a better file protocol but by being a shell: once a customer could log in, the deploy could be any command. The SSH File Transfer Protocol rides inside one SSH channel, so it has one connection, one port and the same authentication as the shell. It has an odd standards history for something so widely deployed: the IETF's `draft-ietf-secsh-filexfer` reached revision 13 on July 18, 2006 and expired without ever becoming an RFC, so what interoperates is the implementations' reading of an expired draft rather than a published standard.

The hosting twist is confinement. A shared host wants to give a customer file transfer without a shell, or a shell without the rest of the server. OpenSSH supports both directly: `ForceCommand internal-sftp` runs an in-process SFTP server whatever the client asked for, and `ChrootDirectory` confines the session, which `sshd` permits only when every component of the path is a root-owned directory not writable by group or others, checked unconditionally at session start. A misconfiguration can produce an unsafe environment that `sshd` can't detect, which is why panels generate this configuration rather than letting staff hand-edit it. Shell access proper is a package feature: WHM's packages carry whether the account gets a shell at all, and on CloudLinux hosts the shell itself runs inside the account's jailed view of the filesystem ([Shared Hosting Isolation](/books/hosting-and-cloud/shared-hosting-isolation)).

Keys changed the economics of support. OpenSSH's defaults still allow password authentication and read keys from `~/.ssh/authorized_keys`; a host that requires keys removes credential stuffing as a way in, at the cost of a support conversation with every customer who has never made one.

## The File Manager and the FTP Account

For the customer who will never install a client, the control panel put the server's filesystem in the browser. cPanel's File Manager uploads, edits, extracts archives and sets permissions inside the account's home directory, and its FTP accounts let the account holder create additional logins, each confined to a directory: a designer who may touch `public_html/images`, an agency that may touch everything. In WHM the maximum number of FTP accounts is one of the package limits, beside disk, bandwidth, databases and mailboxes, so the reseller hierarchy prices file access the way it prices storage ([cPanel & WHM](/books/hosting-and-cloud/cpanel-and-whm#packages-and-feature-lists)).

That design made the hosting account a small identity system. The account has a primary user, any number of FTP users with their own passwords and home directories, SSH keys, and the panel session itself, and a compromise of any one of them is a compromise of the site. A password saved in a desktop client on an infected laptop reaches every site it was ever used for, which is why a host's advice converges on SFTP with keys, per-person logins, and disabling plain FTP where customers will tolerate it.

## rsync: Send Only What Changed

Andrew Tridgell and Paul Mackerras described the rsync algorithm in an ANU technical report in 1996: the receiver splits its copy of a file into blocks and sends a weak rolling checksum and a strong hash for each; the sender slides a window over its own copy, finds blocks the receiver already has, and sends only the literal bytes in between plus instructions to reassemble. Over a slow link, updating a large tree where a few files changed costs roughly the size of the changes, not the size of the tree.

For deployment, rsync turned "upload the site" into "mirror a build directory to a server," and then to many servers in a loop. It runs over SSH, so it inherits SSH's authentication; `--delete` removes files the source no longer has, which is what makes the target an exact copy; `--checksum` compares content rather than size and time. What it didn't fix was atomicity: rsync updates the live directory in place, file by file, so a visitor can still get a new template with an old stylesheet halfway through, unless the target is a fresh directory that is switched into place afterward.

## Capistrano: Releases, a Symlink and a Rollback

Capistrano is where file copying became a deploy process. Jamis Buck's SwitchTower was previewed on the Rails blog on August 22, 2005 as "a new part of Rails in the next release," and was already being described as an automated deployment archetype by November 29, 2005; it was renamed Capistrano on March 6, 2006 after Raindance Communications sent a cease and desist over its SWITCHTOWER trademark. The tool ran tasks over SSH on many servers at once, in sequence or in parallel, written in Ruby, and outlived Rails' own deployment story to become the reference model for every scripted deploy that followed.

The directory layout is the idea that survived:

| Path | What it holds |
| --- | --- |
| `releases/<timestamp>/` | One complete checkout and build per deploy, never modified after it's made |
| `current` | A symlink to the live release; the web server's document root points here |
| `shared/` | Files that persist across releases (uploads, logs, configuration with secrets), linked into each release |
| `repo/` | A cached clone, so each deploy fetches only new commits |
| `revisions.log` | One line per deploy and rollback: branch, commit, release directory, user |

A deploy builds the new release beside the old ones, links the shared files into it, runs any migrations and checks, and only then moves `current`. Changing a symlink is a single rename on the filesystem, so the switch is atomic: every request sees either the old release or the new one. Rollback points `current` back at the previous directory, and old releases are pruned to a configured count. The costs moved rather than vanished: every server needs the build toolchain and access to the repository, the deploy user's key reaches every machine, a migration has already run by the time the symlink moves (the constraint the playbook's [The Database Is the Real Constraint](/docs/delivery/deployment-strategies#the-database-is-the-real-constraint) describes), and a server added later has none of the history.

Every scripted deploy since, from Fabric scripts to the deploy tools bundled with frameworks, reuses the same three ideas: immutable release directories, a pointer that moves atomically, and a log of what was live when. Platforms later moved the build off the server and the pointer into a router ([Platforms Take Over the Deploy](/books/hosting-and-cloud/platform-deploys#how-the-providers-do-it)), but the shape is Capistrano's.

## What the Era Left Behind

The file-copy era is not over. Shared hosting customers still upload over SFTP and the file manager, managed WordPress hosts still issue SFTP users per environment, and a VPS customer's first deploy is usually `rsync` or `git pull` over SSH. A host therefore still runs all of it: an FTP daemon with a passive port range, `sshd` with per-account confinement, a panel file manager, and the credential records behind them. What changed is what it's for: file access is now the fallback and the debugging tool, not the release path, and the providers that care about safety treat each credential as something that expires, is scoped to one directory and one person, and is logged when used.

## The Alternatives

| Method | Model | Strengths | Failure modes | Cost and ownership | Who uses it |
| --- | --- | --- | --- | --- | --- |
| **FTP** | Upload files over a cleartext control and data connection (RFC 959) | Universal clients; works for anyone | Cleartext credentials; firewall pain; partial uploads serve live | Free, every server ships a daemon | Legacy shared hosting customers |
| **FTPS** | FTP over TLS (RFC 4217) | Encrypted credentials with FTP clients customers already have | Still two connections; NAT and firewall problems worse | Free; certificate on the daemon | Hosts keeping FTP compatibility |
| **SFTP** | File transfer inside SSH | One port, key authentication, chrootable | Not a published RFC; still not atomic | Free (OpenSSH) | Every host and VPS |
| **Panel file manager** | Browser-based file operations in the account | No client needed; editing in place | Edits on production; panel session is the credential | Part of the panel license | Non-technical customers |
| **rsync over SSH** | Delta sync of a directory tree | Fast incremental updates; exact mirrors with `--delete` | Updates in place unless paired with release directories | Free (GPL) | VPS and dedicated deploys, mirrors |
| **Capistrano-style releases** | Scripted SSH: build a release directory, switch a symlink | Atomic switch, instant rollback, deploy log | Toolchain on every server; deploy key everywhere; migrations not reversible by symlink | Free (MIT); a deploy user to manage | Server fleets before platforms and containers |

## My Default

My default for anything I run on a server I control is the Capistrano shape, whatever tool performs it: build once off the server, ship the artifact (rsync or an archive over SSH), unpack it into a new release directory, link shared state, switch the pointer, keep the last few releases and the log. For a host offering file access to customers, my default is SFTP only, with keys encouraged, a separate login per person scoped to one directory, plain FTP disabled for new accounts, and FTPS kept only where an existing customer base depends on FTP clients. I'd keep the file manager, because customers who need it have no alternative, but I'd log every write it makes.

What would change this: as soon as there are more than a handful of servers, or any need for previews, the deploy belongs on a platform or in a pipeline that builds an image ([Platforms Take Over the Deploy](/books/hosting-and-cloud/platform-deploys#my-default)), and file access becomes a debugging tool rather than the release path.

## How to Build It

The chapter adds the credentials a host issues for getting files onto a hosting account. They hang off the `hosting_account` resource from [the core data model](/books/hosting-and-cloud/hosting-and-cloud-business#the-core-data-model) and follow the rules [Accounts, Organizations & Resellers](/books/hosting-and-cloud/accounts-and-resellers#how-to-build-it) sets for `api_credentials`: the secret is never stored, every credential has an end, and revocation has a reason.

```sql
CREATE TABLE deploy_credentials (        -- FTP, FTPS, SFTP and SSH logins on a hosting account
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  resource_id        UUID NOT NULL REFERENCES resources (id),  -- kind = 'hosting_account'
  member_id          UUID REFERENCES account_members (id),     -- the person it was issued to, if known
  protocol           TEXT NOT NULL CHECK (protocol IN ('ftp', 'ftps', 'sftp', 'ssh_shell')),
  username           TEXT NOT NULL,          -- unique per server, e.g. 'designer@example.com'
  auth_method        TEXT NOT NULL CHECK (auth_method IN ('password', 'public_key')),
  password_hash      TEXT,                   -- a slow hash; never the password
  public_key_fingerprint TEXT,               -- SHA256:... of the authorized key
  root_path          TEXT NOT NULL,          -- the directory the login is confined to
  read_only          BOOLEAN NOT NULL DEFAULT FALSE,
  allowed_cidrs      CIDR[],
  valid_during       TSTZRANGE NOT NULL,     -- open-ended only for the account's primary login
  last_used_at       TIMESTAMPTZ,
  revoked_reason     TEXT CHECK (revoked_reason IN ('user_request', 'rotated', 'leak_reported',
                       'malware_cleanup', 'account_suspended', 'account_closed')),
  created_by         TEXT NOT NULL,          -- typed actor: 'customer:<member>', 'system:provision'
  CHECK ((auth_method = 'password') = (password_hash IS NOT NULL)),
  CHECK ((auth_method = 'public_key') = (public_key_fingerprint IS NOT NULL)),
  CHECK (protocol <> 'ftp' OR auth_method = 'password')
);

CREATE UNIQUE INDEX deploy_credentials_live_username
  ON deploy_credentials (resource_id, username)
  WHERE upper_inf(valid_during);

CREATE TABLE deploy_sessions (           -- who logged in and what they changed
  id                 UUID PRIMARY KEY DEFAULT uuidv7(),
  account_id         UUID NOT NULL REFERENCES accounts (id),
  credential_id      UUID REFERENCES deploy_credentials (id),  -- null: panel file manager session
  channel            TEXT NOT NULL CHECK (channel IN ('ftp', 'ftps', 'sftp', 'ssh_shell',
                       'file_manager')),
  source_ip          INET NOT NULL,
  session_during     TSTZRANGE NOT NULL,
  files_written      INT NOT NULL DEFAULT 0,
  files_deleted      INT NOT NULL DEFAULT 0,
  bytes_in           BIGINT NOT NULL DEFAULT 0
);
```

The package limit on FTP accounts is a quota, not a column: a `quotas` row with `quota_code = 'ftp_accounts'` for the project that holds the hosting account, checked when a credential is created. A Capistrano-style release on a server the host manages is a `deployments` row from [Platforms Take Over the Deploy](/books/hosting-and-cloud/platform-deploys#how-to-build-it) with `source = 'ssh_release'`; this chapter's tables cover the file access underneath it.

When an abuse case finds injected files, the first question is which login wrote them:

```sql
-- Sessions that wrote to an account in the window before injected files appeared.
SELECT s.channel, c.username, c.protocol, s.source_ip, s.session_during, s.files_written
FROM deploy_sessions s
LEFT JOIN deploy_credentials c ON c.id = s.credential_id
WHERE s.account_id = $1
  AND s.files_written > 0
  AND s.session_during && tstzrange($2, $3)
ORDER BY lower(s.session_during);
```

## Auditing

- **Every credential and its scope:** who it was issued to, which directory it reaches, the protocol and authentication method, and when it was revoked and why, so "who could write here on that date" has an answer.
- **Every session that wrote files,** with source address and counts, retained as long as abuse and incident investigations reach back; this is the evidence that separates a customer's own upload from a stolen password.
- **Revocations after a malware cleanup,** linked to the abuse case, because the fix for injected files includes rotating every login that could have written them ([Abuse Desks for Hosts & Registrars](/books/user-generated-platforms/abuse-desks#how-to-build-it)).
- **Changes to confinement settings** (chroot paths, shell access, read-only flags), as staff actions with [typed actors](/docs/architecture/audit-trails#typed-actors).

## What This Means for the System You Build

- **Treat file access as an identity system:** one login per person, scoped to a directory, expiring, with the secret hashed and the use logged.
- **Default to SFTP with keys,** disable plain FTP for new accounts, and keep FTPS only for compatibility.
- **Confine every login** with `ChrootDirectory` and `internal-sftp` generated by the panel, never hand-edited.
- **Count logins as a package limit** through quotas, so the reseller hierarchy can price and cap them.
- **Make deploys atomic:** build a new release directory and switch a pointer, never copy into the live directory.
- **Keep a release log and old releases,** so rollback is moving the pointer and "what was live at 14:02" has an answer.
- **Rotate every credential on compromise,** not just the one that was seen.

## References

**Standards**

- [RFC 959: File Transfer Protocol](https://datatracker.ietf.org/doc/html/rfc959), Postel and Reynolds, October 1985, control and data connections and `PASV`; it cites RFC 114 (1971) as the first proposal
- [RFC 4217: Securing FTP with TLS](https://datatracker.ietf.org/doc/html/rfc4217), October 2005
- [IETF: draft-ietf-secsh-filexfer](https://datatracker.ietf.org/doc/draft-ietf-secsh-filexfer/), the SSH File Transfer Protocol draft, revision 13 of July 18, 2006, expired and never published as an RFC
- [Tridgell and Mackerras: The rsync algorithm](https://openresearch-repository.anu.edu.au/handle/1885/40765), ANU technical report TR-CS-96-05, 1996
- [rsync: Technical report](https://rsync.samba.org/tech_report/), the rolling checksum and block matching

**Documentation**

- [OpenBSD: sshd_config(5)](https://man.openbsd.org/sshd_config), `ChrootDirectory` ownership checks, `internal-sftp`, `ForceCommand`, the `PasswordAuthentication` and `AuthorizedKeysFile` defaults
- [cPanel: Add a Package](https://docs.cpanel.net/whm/packages/add-a-package/), the maximum FTP accounts and other package limits
- [Capistrano: What is Capistrano?](https://capistranorb.com/documentation/overview/what-is-capistrano/), scripted deploys over SSH to many servers
- [Capistrano: Structure](https://capistranorb.com/documentation/getting-started/structure/), `releases`, `current`, `shared`, `repo` and `revisions.log`

**History**

- [Ruby on Rails blog: SwitchTower, automating application deployment](https://web.archive.org/web/20200918163752/https://weblog.rubyonrails.org/2005/8/22/switchtower-automating-application-deployment/), August 22, 2005 (archived copy)
- [Ruby on Rails blog: SwitchTower as an automated deployment archetype](https://rubyonrails.org/2005/11/29/switchtower-as-an-automated-deployment-archetype), November 29, 2005
- [Ruby on Rails blog: SwitchTower is now Capistrano](http://web.archive.org/web/20070105022406/http://weblog.rubyonrails.org/2006/3/6/switchtower-is-now-capistrano), March 6, 2006, the rename after the trademark cease and desist (archived copy)
