"use client";

import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw, Info, ExternalLink } from "lucide-react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-dim hover:text-accent hover:border-accent/30 transition-colors cursor-pointer"
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
    </button>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-b-0">
      <span className="text-xs text-dim shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 min-w-0">
        {value ? (
          <>
            <span
              className={`text-xs text-foreground text-right truncate ${mono ? "font-mono" : ""}`}
            >
              {value}
            </span>
            <CopyButton text={value} />
          </>
        ) : (
          <div className="h-4 w-24 rounded bg-border/40 animate-pulse" />
        )}
      </div>
    </div>
  );
}

interface IpData {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  org?: string;
  timezone?: string;
  loc?: string;
}

export default function WhoamiPage() {
  const [ipData, setIpData] = useState<IpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Client-side info
  const [clientInfo, setClientInfo] = useState<{
    userAgent: string;
    language: string;
    languages: string;
    platform: string;
    screenRes: string;
    windowSize: string;
    pixelRatio: string;
    colorDepth: string;
    timezone: string;
    timezoneOffset: string;
    cookiesEnabled: string;
    doNotTrack: string;
    online: string;
    connection: string;
    cores: string;
    memory: string;
    touchPoints: string;
  } | null>(null);

  const fetchIp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("https://ipinfo.io/json?token=");
      if (!res.ok) {
        // Fallback to simpler API
        const fallback = await fetch("https://api.ipify.org?format=json");
        const data = await fallback.json();
        setIpData({ ip: data.ip });
      } else {
        const data = await res.json();
        setIpData(data);
      }
    } catch {
      try {
        const fallback = await fetch("https://api.ipify.org?format=json");
        const data = await fallback.json();
        setIpData({ ip: data.ip });
      } catch {
        setError("Could not determine your IP address");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIp();

    const nav = navigator as Record<string, unknown>;
    const conn = nav.connection as
      | { effectiveType?: string; downlink?: number }
      | undefined;

    setClientInfo({
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages?.join(", ") || navigator.language,
      platform: navigator.platform,
      screenRes: `${screen.width} x ${screen.height}`,
      windowSize: `${window.innerWidth} x ${window.innerHeight}`,
      pixelRatio: `${window.devicePixelRatio}x`,
      colorDepth: `${screen.colorDepth}-bit`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: `UTC${new Date().getTimezoneOffset() <= 0 ? "+" : "-"}${String(Math.floor(Math.abs(new Date().getTimezoneOffset()) / 60)).padStart(2, "0")}:${String(Math.abs(new Date().getTimezoneOffset()) % 60).padStart(2, "0")}`,
      cookiesEnabled: navigator.cookieEnabled ? "Yes" : "No",
      doNotTrack: navigator.doNotTrack === "1" ? "Enabled" : "Not set",
      online: navigator.onLine ? "Online" : "Offline",
      connection: conn
        ? `${conn.effectiveType || "unknown"}${conn.downlink ? ` / ${conn.downlink} Mbps` : ""}`
        : "Unknown",
      cores: navigator.hardwareConcurrency
        ? `${navigator.hardwareConcurrency}`
        : "Unknown",
      memory: (nav.deviceMemory as number)
        ? `${nav.deviceMemory} GB`
        : "Unknown",
      touchPoints: `${navigator.maxTouchPoints}`,
    });
  }, []);

  const location = [ipData?.city, ipData?.region, ipData?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xs font-medium uppercase tracking-widest text-dim mb-2">
          whoami
        </h1>
        <p className="text-sm text-muted">
          See how you appear on the internet. IP, location, browser, device, and
          more. Nothing is stored.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* IP hero */}
          <div className="rounded-lg border border-border bg-surface/50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-xs text-dim">Your Public IP</span>
              <button
                onClick={fetchIp}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-xs text-dim hover:text-accent hover:border-accent/30 transition-colors cursor-pointer disabled:opacity-30"
              >
                <RefreshCw
                  size={12}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
            <div className="px-4 py-6 text-center">
              {error ? (
                <p className="text-sm text-pink">{error}</p>
              ) : ipData ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-accent font-mono tracking-wide">
                      {ipData.ip}
                    </span>
                    <CopyButton text={ipData.ip} />
                  </div>
                  {location && (
                    <span className="text-xs text-dim">{location}</span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-48 rounded bg-border/50 animate-pulse" />
                  <div className="h-4 w-32 rounded bg-border/30 animate-pulse" />
                </div>
              )}
            </div>
          </div>

          {/* Network details */}
          <div className="rounded-lg border border-border bg-surface/50">
            <div className="px-4 py-3 border-b border-border">
              <span className="text-xs font-medium uppercase tracking-widest text-dim">
                Network
              </span>
            </div>
            <div className="px-4">
              <Row label="ISP / Org" value={ipData?.org ?? null} />
              <Row label="Location" value={location || null} />
              <Row label="Timezone" value={ipData?.timezone ?? null} />
              <Row label="Coordinates" value={ipData?.loc ?? null} mono />
            </div>
          </div>

          {/* Browser / client details */}
          <div className="rounded-lg border border-border bg-surface/50">
            <div className="px-4 py-3 border-b border-border">
              <span className="text-xs font-medium uppercase tracking-widest text-dim">
                Browser &amp; Device
              </span>
            </div>
            <div className="px-4">
              <Row label="User Agent" value={clientInfo?.userAgent ?? null} />
              <Row label="Platform" value={clientInfo?.platform ?? null} />
              <Row label="Language" value={clientInfo?.languages ?? null} />
              <Row label="Screen" value={clientInfo?.screenRes ?? null} mono />
              <Row label="Window" value={clientInfo?.windowSize ?? null} mono />
              <Row
                label="Pixel Ratio"
                value={clientInfo?.pixelRatio ?? null}
                mono
              />
              <Row label="Color Depth" value={clientInfo?.colorDepth ?? null} />
              <Row label="Timezone" value={clientInfo?.timezone ?? null} />
              <Row
                label="UTC Offset"
                value={clientInfo?.timezoneOffset ?? null}
                mono
              />
              <Row label="Cookies" value={clientInfo?.cookiesEnabled ?? null} />
              <Row
                label="Do Not Track"
                value={clientInfo?.doNotTrack ?? null}
              />
              <Row label="Status" value={clientInfo?.online ?? null} />
              <Row label="Connection" value={clientInfo?.connection ?? null} />
              <Row label="CPU Cores" value={clientInfo?.cores ?? null} mono />
              <Row label="Memory" value={clientInfo?.memory ?? null} />
              <Row
                label="Touch Points"
                value={clientInfo?.touchPoints ?? null}
                mono
              />
            </div>
          </div>
        </div>

        {/* Right: info sidebar */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-6">
          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border flex items-center gap-1.5">
              <Info size={12} className="text-accent" />
              About IP Addresses
            </h3>
            <div className="px-4 py-3 text-[11px] text-dim leading-relaxed space-y-2.5">
              <p>
                Your <span className="text-muted">public IP address</span> is
                assigned by your ISP and is how other devices on the internet
                identify your connection.
              </p>
              <p>
                It can reveal your approximate location, ISP, and whether
                you&apos;re using a VPN or proxy. It does not reveal your exact
                address.
              </p>
              <p>
                <span className="text-muted">IPv4</span> addresses are 32-bit
                (e.g. 192.168.1.1). <span className="text-muted">IPv6</span>{" "}
                addresses are 128-bit and look like 2001:db8::1.
              </p>
              <p>
                Browser details are read from JavaScript APIs and HTTP headers.
                No fingerprinting libraries are used.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface/50">
            <h3 className="text-xs font-medium uppercase tracking-widest text-dim px-4 py-3 border-b border-border flex items-center gap-1.5">
              <ExternalLink size={12} className="text-accent" />
              References
            </h3>
            <ul className="px-4 py-3 text-[11px] leading-relaxed space-y-1.5">
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/html/rfc791"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  RFC 791 &mdash; Internet Protocol (IPv4)
                </a>
              </li>
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/html/rfc8200"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  RFC 8200 &mdash; IPv6 Specification
                </a>
              </li>
              <li>
                <a
                  href="https://developer.mozilla.org/en-US/docs/Web/API/Navigator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  MDN &mdash; Navigator API
                </a>
              </li>
              <li>
                <a
                  href="https://en.wikipedia.org/wiki/IP_address"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                >
                  Wikipedia &mdash; IP address
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
