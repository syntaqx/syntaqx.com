"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Check,
  CircleAlert,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Flame,
  Info,
  KeyRound,
  Link2,
  Lock,
  Plus,
  Terminal,
} from "lucide-react";
import {
  ClearButton,
  OptionCheckbox,
  OptionSelect,
  PanelFooter,
  PanelHeader,
  Stat,
  codeArea,
} from "@/components/tool-controls";
import { Alert, AlertDescription } from "@/registry/syntaqx/ui/alert";
import { Button } from "@/registry/syntaqx/ui/button";
import { CopyButton } from "@/registry/syntaqx/ui/copy-button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/registry/syntaqx/ui/field";
import { Input } from "@/registry/syntaqx/ui/input";
import { InputGroup, InputGroupTextarea } from "@/registry/syntaqx/ui/input-group";
import { Kbd, KbdGroup } from "@/registry/syntaqx/ui/kbd";
import { PasteButton } from "@/registry/syntaqx/ui/paste-button";
import { Skeleton } from "@/registry/syntaqx/ui/skeleton";
import {
  MAX_PLAINTEXT_BYTES,
  PAGE_PATH,
  decrypt,
  encrypt,
  newKey,
  pageLink,
  parseFragment,
  parseLink,
  validKey,
  type SecretLink,
} from "@/lib/secret-link";
import { cn } from "@/lib/cn";

// --- Link intake --------------------------------------------------------------

const STORAGE_KEY = "syntaqx:secret-link";

/**
 * Take the secret's fragment out of the address bar, so the key doesn't sit
 * in history or reach analytics and error reports. It's kept for this tab
 * only (sessionStorage) until the secret is revealed, so a reload before
 * then still works.
 */
function takeFragment(): SecretLink | null {
  const link = parseFragment(location.hash);
  if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
  try {
    if (link) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(link));
    else {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as SecretLink) : null;
    }
  } catch {
    // Storage blocked: the link still works, just not across a reload.
  }
  return link;
}

function forgetLink() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// Runs as soon as this page's code loads, ahead of the analytics script.
let earlyLink: SecretLink | null =
  typeof window !== "undefined" && location.pathname === PAGE_PATH ? takeFragment() : null;

// --- API ------------------------------------------------------------------------

/** The public API in production; this deployment's own /api elsewhere. */
const apiBase = () =>
  location.hostname === "www.syntaqx.com" ? "https://api.syntaqx.com" : `${location.origin}/api`;

const TTLS = [
  { value: "600", label: "10 minutes" },
  { value: "3600", label: "1 hour" },
  { value: "86400", label: "1 day" },
];

async function apiMessage(res: Response): Promise<string> {
  try {
    return (
      ((await res.json()) as { message?: string }).message ?? `Request failed (${res.status}).`
    );
  } catch {
    return `Request failed (${res.status}).`;
  }
}

// --- Time -----------------------------------------------------------------------

function useNow(interval = 15_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(timer);
  }, [interval]);
  return now;
}

function timeLeft(expiresAt: string, now: number): string {
  const seconds = Math.max(0, Math.round((Date.parse(expiresAt) - now) / 1000));
  if (seconds < 60) return "less than a minute";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours} hour${hours === 1 ? "" : "s"}${rest ? ` ${rest} min` : ""}`;
}

const clock = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });

function byteSize(bytes: number): string {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
}

// --- Pieces ---------------------------------------------------------------------

function Panel({
  title,
  icon,
  children,
  footer,
}: {
  title: ReactNode;
  icon: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2 text-sm font-medium">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      <div className="p-3">{children}</div>
      {footer && <div className="border-t border-border px-3 py-2">{footer}</div>}
    </div>
  );
}

/** A read-only value with a copy button, selected whole on focus. */
function CopyField({ label, value }: { label: string; value: string }) {
  return (
    <Field>
      <div className="flex items-center justify-between gap-2">
        <FieldLabel>{label}</FieldLabel>
        <CopyButton value={value} variant="outline" size="sm" />
      </div>
      <Input
        readOnly
        value={value}
        onFocus={(e) => e.currentTarget.select()}
        spellCheck={false}
        className="font-mono"
      />
    </Field>
  );
}

function Note({
  tone = "dim",
  icon,
  children,
}: {
  tone?: "dim" | "accent";
  icon: ReactNode;
  children: ReactNode;
}) {
  const tones = { dim: "text-muted-foreground", accent: "text-primary" };
  return (
    <p className={cn("flex items-start gap-1.5 text-sm/relaxed", tones[tone])}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span>{children}</span>
    </p>
  );
}

// --- Create ---------------------------------------------------------------------

interface Created {
  link: string;
  key?: string;
  expiresAt: string;
  forScripts: boolean;
  sentBytes: number;
}

function CreateSecret({ onOpen }: { onOpen: (link: SecretLink) => void }) {
  const [secret, setSecret] = useState("");
  const [ttl, setTtl] = useState("3600");
  const [separateKey, setSeparateKey] = useState(false);
  const [forScripts, setForScripts] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);
  const [pasted, setPasted] = useState("");
  const now = useNow();

  const bytes = new TextEncoder().encode(secret).length;
  const tooBig = bytes > MAX_PLAINTEXT_BYTES;

  const create = useCallback(async () => {
    if (!secret || tooBig || busy) return;
    setBusy(true);
    setError(null);
    try {
      const key = forScripts ? undefined : newKey();
      const body = key ? await encrypt(key, secret) : secret;
      const res = await fetch(`${apiBase()}/secrets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: body, ttl: Number(ttl) }),
      });
      if (!res.ok) throw new Error(await apiMessage(res));
      const data = (await res.json()) as { id: string; url: string; expires_at: string };
      setCreated({
        link: key ? pageLink(location.origin, data.id, separateKey ? undefined : key) : data.url,
        key: key && separateKey ? key : undefined,
        expiresAt: data.expires_at,
        forScripts,
        sentBytes: body.length,
      });
      // The link is the only copy now; don't leave the plaintext on screen.
      setSecret("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't create the link.");
    } finally {
      setBusy(false);
    }
  }, [secret, tooBig, busy, forScripts, ttl, separateKey]);

  const pastedLink = pasted ? parseLink(pasted) : null;

  if (created) {
    return (
      <div className="flex flex-col gap-4">
        <Panel
          icon={<Check size={12} />}
          title="Link ready"
          footer={
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock size={12} />
                Works once, or expires in {timeLeft(created.expiresAt, now)} (
                {clock(created.expiresAt)})
              </span>
              <Button variant="outline" size="sm" onClick={() => setCreated(null)}>
                <Plus />
                New secret
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <CopyField
              label={created.key ? "Link (send this one way)" : "One-time link"}
              value={created.link}
            />
            {created.key && <CopyField label="Key (send this another way)" value={created.key} />}
            {created.forScripts ? (
              <div className="flex flex-col gap-2">
                <Note icon={<Terminal size={12} />}>
                  This link returns the secret as JSON, so it works anywhere <code>curl</code> does,
                  like a GitHub Actions <code>workflow_dispatch</code> input. The server encrypted
                  it, so the server could read it.
                </Note>
                <pre className="overflow-x-auto border border-border bg-background px-3 py-2 font-mono text-xs text-foreground">
                  {`curl -s ${created.link} | jq -r .secret`}
                </pre>
              </div>
            ) : (
              <Note tone="accent" icon={<Lock size={12} />}>
                Encrypted in this browser before it was sent. The server holds{" "}
                {created.sentBytes.toLocaleString()} characters of ciphertext and never saw the key,
                which only exists in the {created.key ? "key above" : "link after the #"}.
              </Note>
            )}
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Field id="secret" invalid={tooBig}>
        <InputGroup>
          <PanelHeader>
            <FieldLabel>Secret</FieldLabel>
            <div className="flex items-center gap-1.5">
              {secret && (
                <Stat className={cn(tooBig && "text-destructive")}>
                  {byteSize(bytes)} / {byteSize(MAX_PLAINTEXT_BYTES)}
                </Stat>
              )}
              <PasteButton variant="outline" size="sm" onPaste={setSecret} />
              {secret && <ClearButton onClick={() => setSecret("")} />}
            </div>
          </PanelHeader>
          <InputGroupTextarea
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                void create();
              }
            }}
            placeholder="A password, API token, private key, .env line..."
            rows={7}
            spellCheck={false}
            autoComplete="off"
            autoFocus
            className={codeArea}
          />
          <PanelFooter>
            <OptionSelect label="Expires" value={ttl} onValueChange={setTtl} options={TTLS} />
            {!forScripts && (
              <OptionCheckbox
                checked={separateKey}
                onCheckedChange={setSeparateKey}
                label="Send the key separately"
                hint="Split the link and its key, so you can send them over two channels (say, chat and SMS). Whoever opens the link has to paste the key."
              />
            )}
            <OptionCheckbox
              checked={forScripts}
              onCheckedChange={setForScripts}
              label="For scripts"
              hint="Make a plain API link that returns the secret to curl, for a GitHub Actions input or a script. The server does the encryption instead of your browser, so it sees the secret."
            />
          </PanelFooter>
        </InputGroup>
      </Field>

      {error && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => void create()} disabled={!secret || tooBig || busy}>
          <Link2 />
          {busy ? "Encrypting..." : "Create one-time link"}
        </Button>
        <KbdGroup className="hidden text-muted-foreground sm:inline-flex">
          <Kbd>Ctrl</Kbd>/<Kbd>⌘</Kbd>+<Kbd>Enter</Kbd>
        </KbdGroup>
      </div>

      <Field
        id="open-link"
        invalid={!!pasted && !pastedLink}
        className="mt-4 border-t border-border pt-6"
      >
        <FieldLabel>Got a link? Open it here</FieldLabel>
        <div className="flex gap-2">
          <Input
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && pastedLink) onOpen(pastedLink);
            }}
            placeholder="https://www.syntaqx.com/tools/secrets#..."
            spellCheck={false}
            autoComplete="off"
            className="flex-1 font-mono"
          />
          <Button onClick={() => pastedLink && onOpen(pastedLink)} disabled={!pastedLink}>
            Open
          </Button>
        </div>
        <FieldError>{pasted && !pastedLink ? "That isn't a secret link or id." : null}</FieldError>
        <FieldDescription>
          Opening checks the link. Nothing is revealed until you say so.
        </FieldDescription>
      </Field>
    </div>
  );
}

// --- Reveal ---------------------------------------------------------------------

type OpenState =
  | { status: "checking" }
  | { status: "ready"; expiresAt: string | null }
  | { status: "revealing" }
  | { status: "revealed"; secret: string }
  | { status: "gone" }
  | { status: "error"; message: string };

function RevealSecret({ link, onDone }: { link: SecretLink; onDone: () => void }) {
  const [state, setState] = useState<OpenState>({ status: "checking" });
  const [key, setKey] = useState(link.kind === "browser" ? (link.key ?? "") : "");
  const [shown, setShown] = useState(true);
  const now = useNow();

  const needsKey = link.kind === "browser" && !link.key;
  const keyOk = link.kind === "api" || validKey(key.trim());

  useEffect(() => {
    let cancelled = false;
    fetch(`${apiBase()}/secrets/${link.id}`, { method: "HEAD", cache: "no-store" })
      .then((res) => {
        if (cancelled) return;
        if (res.status === 404) {
          forgetLink();
          setState({ status: "gone" });
        } else if (res.ok)
          setState({ status: "ready", expiresAt: res.headers.get("Secret-Expires-At") });
        else
          setState({
            status: "error",
            message: "Couldn't check this link. Try again in a moment.",
          });
      })
      .catch(
        () => !cancelled && setState({ status: "error", message: "Couldn't reach the server." }),
      );
    return () => {
      cancelled = true;
    };
  }, [link.id]);

  const reveal = async () => {
    setState({ status: "revealing" });
    try {
      const res = await fetch(`${apiBase()}/secrets/${link.id}`, { cache: "no-store" });
      if (res.status === 404) {
        forgetLink();
        return setState({ status: "gone" });
      }
      if (!res.ok) return setState({ status: "error", message: await apiMessage(res) });
      // Read: the server copy is gone now, whatever happens next.
      forgetLink();
      const { secret } = (await res.json()) as { secret: string };
      if (link.kind === "api") return setState({ status: "revealed", secret });
      try {
        setState({ status: "revealed", secret: await decrypt(key.trim(), secret) });
      } catch {
        setState({
          status: "error",
          message:
            "That key doesn't match this secret. Opening it deleted it from the server, so ask the sender for a new link.",
        });
      }
    } catch {
      setState({
        status: "error",
        message: "Couldn't reach the server. The secret wasn't read; try again.",
      });
    }
  };

  const done = () => {
    forgetLink();
    onDone();
  };

  const another = (
    <Button variant="outline" size="sm" onClick={done}>
      <Plus />
      Create your own
    </Button>
  );

  if (state.status === "checking") {
    return (
      <Panel icon={<KeyRound size={12} />} title="Checking the link">
        <Skeleton className="h-16" />
      </Panel>
    );
  }

  if (state.status === "gone") {
    return (
      <Panel icon={<Flame size={12} />} title="This secret is gone" footer={another}>
        <p className="text-sm text-foreground">
          It was already viewed, or it expired before anyone opened it. Secrets here work once, so
          if you didn&apos;t open it yourself, let the sender know: someone else may have.
        </p>
      </Panel>
    );
  }

  if (state.status === "error") {
    return (
      <Panel icon={<Info size={12} />} title="Something went wrong" footer={another}>
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      </Panel>
    );
  }

  if (state.status === "revealed") {
    return (
      <Panel
        icon={<Eye size={12} />}
        title="Your secret"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Flame size={12} className="text-primary" />
              Deleted from the server. Copy it now: this page can&apos;t show it again.
            </span>
            <Button variant="outline" size="sm" onClick={done}>
              <Check />
              Done
            </Button>
          </div>
        }
      >
        <div className="mb-1.5 flex items-center justify-end gap-1.5">
          <Button variant="outline" size="sm" onClick={() => setShown(!shown)}>
            {shown ? <EyeOff /> : <Eye />}
            {shown ? "Hide" : "Show"}
          </Button>
          <CopyButton value={state.secret} variant="outline" size="sm" />
        </div>
        <pre
          className={cn(
            "max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground transition-[filter]",
            shown ? "" : "blur-sm select-none",
          )}
        >
          {state.secret}
        </pre>
      </Panel>
    );
  }

  return (
    <Panel
      icon={<Lock size={12} />}
      title="Someone shared a secret with you"
      footer={
        state.status === "ready" && state.expiresAt ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={12} />
            Expires in {timeLeft(state.expiresAt, now)} if nobody opens it
          </span>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-foreground">
          You can view it once. Revealing it deletes it from the server, so have somewhere ready to
          put it.
        </p>
        {needsKey && (
          <Field id="key" invalid={!!key && !keyOk}>
            <FieldLabel>Key (sent to you separately)</FieldLabel>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="43 characters"
              spellCheck={false}
              autoComplete="off"
              className="font-mono"
            />
            <FieldError>
              {key && !keyOk ? "A key is 43 letters, digits, - and _." : null}
            </FieldError>
          </Field>
        )}
        <div>
          <Button onClick={() => void reveal()} disabled={!keyOk || state.status === "revealing"}>
            <Eye />
            {state.status === "revealing" ? "Revealing..." : "Reveal secret"}
          </Button>
        </div>
      </div>
    </Panel>
  );
}

// --- Page -----------------------------------------------------------------------

export default function SecretsPage() {
  const [opened, setOpened] = useState<SecretLink | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL fragment, which only exists in the browser
    setOpened(earlyLink ?? takeFragment());
    earlyLink = null;
    const onHash = () => {
      const link = takeFragment();
      if (link) setOpened(link);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-3 text-3xl leading-[0.95] sm:text-4xl">One-Time Secrets</h1>
        <p className="max-w-2xl text-muted-foreground">
          Share a password or token through a link that works once. It&apos;s encrypted in your
          browser and the key stays in the link, so the server only ever holds ciphertext, and
          deletes it the moment it&apos;s read.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="min-w-0 flex-1">
          {opened ? (
            <RevealSecret key={opened.id} link={opened} onDone={() => setOpened(null)} />
          ) : (
            <CreateSecret onOpen={setOpened} />
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-6 lg:w-80">
          <div className="border border-border bg-card">
            <h3 className="flex items-center gap-1.5 border-b border-border px-4 py-3 text-xs font-medium text-foreground">
              <Info size={12} className="text-primary" />
              How it works
            </h3>
            <ol className="list-decimal space-y-2.5 py-3 pr-4 pl-8 text-[11px] leading-relaxed text-muted-foreground">
              <li>
                Your browser makes a random 256-bit key and encrypts the secret with{" "}
                <span className="text-foreground">AES-256-GCM</span>.
              </li>
              <li>
                Only the ciphertext is sent. The key goes after the{" "}
                <span className="text-foreground">#</span> in the link, and browsers never send that
                part to a server.
              </li>
              <li>
                The server keeps the ciphertext in Redis until it&apos;s read once or expires,
                whichever comes first.
              </li>
              <li>
                Opening the link only checks it. Revealing fetches the ciphertext, deletes it, and
                decrypts it here.
              </li>
            </ol>
            <p className="border-t border-border px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
              <span className="text-foreground">Still a demo:</span> there&apos;s no SLA, so
              don&apos;t trust it with production credentials. For that, self-host something like{" "}
              <a
                href="https://yopass.se/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors"
              >
                Yopass
              </a>
              .
            </p>
          </div>

          <div className="border border-border bg-card">
            <h3 className="flex items-center gap-1.5 border-b border-border px-4 py-3 text-xs font-medium text-foreground">
              <Terminal size={12} className="text-primary" />
              From a script
            </h3>
            <div className="space-y-2 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
              <pre className="overflow-x-auto border border-border bg-background px-2 py-1.5 font-mono text-[10px] text-foreground">
                {`curl -s https://api.syntaqx.com/secrets \\
  -H 'Content-Type: application/json' \\
  -d '{"secret":"hunter2","ttl":600}'`}
              </pre>
              <p>
                Returns a <span className="text-foreground">url</span> that hands the secret back
                once. That&apos;s what &quot;For scripts&quot; makes too.
              </p>
            </div>
          </div>

          <div className="border border-border bg-card">
            <h3 className="flex items-center gap-1.5 border-b border-border px-4 py-3 text-xs font-medium text-foreground">
              <ExternalLink size={12} className="text-primary" />
              References
            </h3>
            <ul className="space-y-1.5 px-4 py-3 text-[11px] leading-relaxed">
              <li>
                <Link
                  href="/posts/github-actions-secret-inputs"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  GitHub Actions &amp; Secret Inputs
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/api"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  API reference: /secrets
                </Link>
              </li>
              <li>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#aes-gcm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  MDN: AES-GCM in the Web Crypto API
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
