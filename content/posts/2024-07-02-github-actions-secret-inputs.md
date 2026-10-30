+++
date = "2024-07-02"
title = "GitHub Actions & Secret Inputs"
description = "An exploration and a working solution for passing secret input values into GitHub Actions manual, self-service workflows, without leaking them in the logs."
images = ["/img/open-graph/github-actions-secret-inputs.png"]
tags = ["GitHub Actions", "GitHub", "DevOps", "Automation"]
+++

I've been using GitHub Actions as my primary CI & CD tool for a while now, and I've been very happy with it. It's easy to use, reasonably flexible with the way actions are created, and has a massive marketplace which makes things all too easy to get what I need.

One of the features that I've been using a lot lately is [manually triggered][] workflows, allowing me to create self-service workflows that can be triggered on demand, saving us from repetitive tasks; one automation at a time.

[manually triggered]: https://docs.github.com/actions/using-workflows/manually-running-a-workflow

A simple example of these self-service workflow would be one that allows engineers to update their own environment variables for a service. The team can simply go to our `ops` repositories Actions, and manually trigger the workflow with the service name, environment, key, and value as inputs:

```yaml
name: Upsert Environment Variable

on:
  workflow_dispatch:
    inputs:
      service:
        description: 'Service Name'
        required: true
        type: choice
        options:
          - 'service-a'
          - 'service-b'
          - 'service-c'
      environment:
        description: 'Environment'
        required: true
        type: choice
        options:
          - 'staging'
          - 'production'
      key:
        description: 'Key'
        required: true
        type: string
      value:
        description: 'Value'
        required: true
        type: string

jobs:

  upsert:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # .. omitted ..
```

And that's it! No more asking operations to update your environment variables.

> [!NOTE]
> In an ideal world, we'd "shift left" and have our K8s manifests stored in application repositories, allowing engineers to maintain their own `ConfigMap` or other settings. Unfortunately, we're not quite there yet.
>
> Depending on the service, updating an environment variable may be as simple as updating a secret in AWS Secrets Manager, or as complex as updating a file on an EC2 instance. This workflow allows us to abstract that complexity away from the engineers, and let them focus on what they do best: writing code.

Automation, done.

Except... not all environment variables are created equal.

## Secrets

In order for this workflow to be successful, we had to make sure that secret values were not exposed in workflow logs, exposing the value to anyone with access to the repository.. and defeating the win of self-service.

Luckily, GitHub supports [masking a value in a log][], so let's just mask the input value and be done with it!

[masking a value in a log]: https://docs.github.com/actions/learn-github-actions/workflow-commands-for-github-actions#masking-a-value-in-a-log

### Failed Attempt

```yaml
- name: Mask secret value securely
  run: |
    echo "SECRET_VALUE=${{ github.event.inputs.secret_value }}" >> $GITHUB_ENV
    echo "::add-mask::${{ github.event.inputs.secret_value }}"
```

```sh
echo "SECRET_VALUE=DONT SHOW THE SECRET" >> $GITHUB_ENV
echo "::add-mask::DONT SHOW THE SECRET"
```

### ... and another

```yaml
  env:
    SECRET_KEY: ${{ github.event.inputs.key }}
    SECRET_VALUE: ${{ github.event.inputs.secret_value }}
  steps:
    - run: echo "::add-mask::$SECRET_VALUE"
```

```sh
echo "::add-mask::$SECRET_VALUE"
shell: /usr/bin/bash -e {0}
env:
  SECRET_KEY: my-secret-key
  SECRET_VALUE: SHHH IM SECRET
```

### ...and on and on and on

All in all, I spent probably 2 hours trying to figure out how to mask the input value, but no matter what I did, the value would always be exposed in the logs.

## 1 Eternity Later

After a reasonable amount of trial and error, and so much searching, I came up with a fairly straightforward solution that allowed me to have a dynamic input without exposing the value until after it was masked. The solution?

A simple one-time link that would provide the secret value workflow.

To initially test my theory, I added a simple handler to my personal API that would behave like most secret sharing services, but without me having to bother picking (or paying for) one until I knew this could work:

- `POST https://api.syntaqx.com/secrets` - Create a new secret, get back a one-time link
- `GET https://api.syntaqx.com/secrets/{id}` - Retrieve the secret, which deletes it

> [!NOTE] Update, October 2026
> The original proof of concept kept values in memory and is long gone. These endpoints are live again, rebuilt so you can follow this post for real: secrets are stored in Redis, encrypted under a key derived from the link (so the stored data alone can't be read), deleted on the first read, and expire unread after an hour by default (`ttl`, from 60 seconds up to a day). The [API reference](/docs/api) has the full schema.
>
> It's still a demo with no SLA, so don't send it production credentials. We ended up going with a self-hosted [Yopass](https://yopass.se/) in our final workflow, which gave Engineers a UI to easily paste their secrets into and get a one-time link to retrieve them without the need for a script.
>
> That UI exists here now too: [One-Time Secrets](/tools/secrets) encrypts in your browser and keeps the key in the link's `#fragment`, so the server only ever holds ciphertext. Tick __For scripts__ and it makes the kind of link this workflow reads instead.
>
> Choose your own adventure.

Here's the round trip with `curl`:

```sh
$ curl -s https://api.syntaqx.com/secrets     -H 'Content-Type: application/json'     -d '{"secret": "SHHH IM SECRET", "ttl": 600}'
{"id":"pX3c0Qb7e1u9KkHn4WfTz2aLr8YdVs6M","url":"https://api.syntaqx.com/secrets/pX3c0Qb7e1u9KkHn4WfTz2aLr8YdVs6M","expires_at":"2026-10-29T15:33:45.000Z"}

$ curl -s https://api.syntaqx.com/secrets/pX3c0Qb7e1u9KkHn4WfTz2aLr8YdVs6M
{"secret":"SHHH IM SECRET"}

$ curl -s https://api.syntaqx.com/secrets/pX3c0Qb7e1u9KkHn4WfTz2aLr8YdVs6M
{"message":"No secret with that id. It was already read, expired, or never existed."}
```

### Creating a secret

To make things easy, I created a simple `create-secret.sh` script that would give me back a one-time link to retrieve the secret value. It prompts for the value rather than taking it as an argument, so it stays out of your shell history:

```sh
#!/usr/bin/env bash
# Usage: ./create-secret.sh [ttl-seconds]
set -euo pipefail

read -rsp 'Secret: ' secret
echo >&2

printf '%s' "$secret"   | jq -Rs --argjson ttl "${1:-3600}" '{secret: ., ttl: $ttl}'   | curl -sSf https://api.syntaqx.com/secrets       -H 'Content-Type: application/json'       --data-binary @-   | jq -r '.url'
```

```sh
$ ./create-secret.sh 600
Secret:
https://api.syntaqx.com/secrets/pX3c0Qb7e1u9KkHn4WfTz2aLr8YdVs6M
```

Not a terminal person? The [One-Time Secrets](/tools/secrets) page makes the same link: paste the value, tick __For scripts__, and copy what it gives you.

Then, I could simply run the workflow, and provide the `key` and `url` as inputs:

```yaml
name: Upsert Secret Environment Variable

on:
  workflow_dispatch:
    inputs:
      key:
        description: 'Key'
        required: true
        type: string
      url:
        description: 'One-time Link (https://api.syntaqx.com/secrets/{id})'
        required: true
        type: string

jobs:

  upsert:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      -
        name: Retrieve the secret value
        id: secret
        env:
          SECRET_URL: ${{ inputs.url }}
        run: |
          set -o pipefail
          if [[ "$SECRET_URL" != https://api.syntaqx.com/secrets/* ]]; then
            echo "::error::url must be a https://api.syntaqx.com/secrets/ link"
            exit 1
          fi
          VALUE=$(curl -sSf "$SECRET_URL" | jq -r '.secret') || {
            echo "::error::That link was already used, has expired, or never existed"
            exit 1
          }
          echo "::add-mask::$VALUE"
          echo "value=$VALUE" >> "$GITHUB_OUTPUT"
      -
        env:
          KEY: ${{ inputs.key }}
          VALUE: ${{ steps.secret.outputs.value }}
        run: |
          echo "$KEY=$VALUE"
```

The inputs go through `env` rather than straight into the script with `${{ }}`, so a crafted input can't [inject commands][script injection] into the step. The link itself does show up in the log, but by the time anyone can read it, the workflow has already used it.

[script injection]: https://docs.github.com/actions/reference/security/secure-use#good-practices-for-mitigating-script-injection-attacks

### Keeping the server out of it

A __For scripts__ link means the server encrypts the secret, so for a moment it sees the value. A regular link from [One-Time Secrets](/tools/secrets) doesn't have that problem: the browser encrypted it, and the key is in the link after the `#`. The runners already have Node, so the workflow can decrypt it the same way the page does. Swap the retrieve step for this one, and pass the page link as `url`:

```yaml
      -
        name: Retrieve the secret value
        id: secret
        env:
          SECRET_URL: ${{ inputs.url }}
        run: |
          if [[ "$SECRET_URL" != https://www.syntaqx.com/tools/secrets#* ]]; then
            echo "::error::url must be a https://www.syntaqx.com/tools/secrets# link"
            exit 1
          fi
          VALUE=$(node --input-type=module -e '
            const [id, key] = new URL(process.argv[1]).hash.slice(1).split("/");
            const res = await fetch(`https://api.syntaqx.com/secrets/${id}`);
            if (!res.ok) throw new Error("That link was already used, has expired, or never existed");
            const bytes = Buffer.from((await res.json()).secret, "base64url");
            const aes = await crypto.subtle.importKey("raw", Buffer.from(key, "base64url"), "AES-GCM", false, ["decrypt"]);
            const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes.subarray(0, 12) }, aes, bytes.subarray(12));
            process.stdout.write(Buffer.from(plain));
          ' "$SECRET_URL")
          echo "::add-mask::$VALUE"
          echo "value=$VALUE" >> "$GITHUB_OUTPUT"
```

The format is small on purpose: the key is 32 random bytes, and the stored value is the 12-byte IV followed by the AES-256-GCM ciphertext, both base64url. Leave __Send the key separately__ off for links you hand to a workflow, since the step expects the key in the link.

Which surprisingly worked! The value was masked and never exposed in the logs.

```sh
SECRET_KEY=***
```

Run it a second time with the same link and the retrieve step fails with "That link was already used", which is exactly what you want from a one-time link. We have a path forward.

## Conclusion

While this isn't perfect (anyone could easily just modify the workflow to `echo $RESPONSE` before the value is masked), assuming proper pull requests and code reviews, this should be secure enough for my use case.

Honestly, I'm pretty happy with the solution, but I'm not happy that I had to come up with it. I would love to see GitHub support dynamic secrets in workflows so that I don't have to jump through hoops to keep my secrets secret.

Until then, I'll keep using this, and hope that it helps someone else.

## Open Letter to GitHub

Please, support dynamic secrets in workflows.

```yaml
  workflow_dispatch:
    inputs:
      key:
        description: 'Key'
        required: true
        type: string
      value:
        description: 'Value'
        required: true
        type: secret
```

I know it's not just me asking.
