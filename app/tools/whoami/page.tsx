"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/registry/syntaqx/ui/button";
import { CopyButton } from "@/registry/syntaqx/ui/copy-button";
import { Skeleton } from "@/registry/syntaqx/ui/skeleton";
import { ToolHeader } from "@/components/tool-header";
import { ReferencesCard, ToolAside, ToolCard, ToolPanel } from "@/components/tool-controls";

function Row({ label, value, mono }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div className="flex min-h-10 items-center justify-between gap-4 border-b px-4 py-1.5 last:border-b-0">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5 min-w-0">
        {value ? (
          <>
            <span
              className={cn("truncate text-right text-sm text-foreground", mono && "font-mono")}
            >
              {value}
            </span>
            <CopyButton value={value} size="icon-xs" />
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="size-6" />
          </div>
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
  const [ipv4, setIpv4] = useState<string | null>(null);
  const [ipv6, setIpv6] = useState<string | null>(null);
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
    setIpv4(null);
    setIpv6(null);

    // Fetch IPv4 and IPv6 in parallel
    const v4 = fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((d) => d.ip as string)
      .catch(() => null);

    const v6 = fetch("https://api64.ipify.org?format=json")
      .then((r) => r.json())
      .then((d) => d.ip as string)
      .catch(() => null);

    const [v4Result, v6Result] = await Promise.all([v4, v6]);

    setIpv4(v4Result);
    // Only set IPv6 if it's actually different from IPv4 (and looks like IPv6)
    if (v6Result && v6Result !== v4Result && v6Result.includes(":")) {
      setIpv6(v6Result);
    }

    // Use whichever IP we got for geo lookup
    const primaryIp = v4Result || v6Result;
    if (!primaryIp) {
      setError("Could not determine your IP address");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`https://ipinfo.io/${primaryIp}/json?token=`);
      if (res.ok) {
        const data = await res.json();
        setIpData(data);
      } else {
        setIpData({ ip: primaryIp });
      }
    } catch {
      setIpData({ ip: primaryIp });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchId = requestAnimationFrame(() => {
      fetchIp();
    });

    const nav = navigator as unknown as Record<string, unknown>;
    const conn = nav.connection as { effectiveType?: string; downlink?: number } | undefined;

    const id = requestAnimationFrame(() => {
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
        cores: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency}` : "Unknown",
        memory: (nav.deviceMemory as number) ? `${nav.deviceMemory} GB` : "Unknown",
        touchPoints: `${navigator.maxTouchPoints}`,
      });
    });

    return () => {
      cancelAnimationFrame(fetchId);
      cancelAnimationFrame(id);
    };
  }, []);

  const location = [ipData?.city, ipData?.region, ipData?.country].filter(Boolean).join(", ");

  return (
    <div>
      <ToolHeader title="whoami">
        <p className="max-w-2xl text-muted-foreground">
          See how you appear on the internet. IP, location, browser, device, and more. Nothing is
          stored.
        </p>
      </ToolHeader>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* IP hero */}
          <ToolPanel
            title="Your public IP"
            action={
              <Button variant="outline" size="sm" onClick={fetchIp} disabled={loading}>
                <RefreshCw className={cn(loading && "animate-spin")} />
                Refresh
              </Button>
            }
            contentClassName="py-6"
          >
            <div className="text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">IPv4</span>
                  {error ? (
                    <span className="text-sm text-destructive">Could not determine IP</span>
                  ) : ipv4 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary font-mono tracking-wide">
                        {ipv4}
                      </span>
                      <CopyButton value={ipv4} size="icon-sm" />
                    </div>
                  ) : (
                    <Skeleton className="h-8 w-56" />
                  )}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">IPv6</span>
                  {ipv6 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary font-mono tracking-wide break-all">
                        {ipv6}
                      </span>
                      <CopyButton value={ipv6} size="icon-sm" />
                    </div>
                  ) : loading ? (
                    <Skeleton className="h-5 w-64 max-w-full" />
                  ) : (
                    <span className="text-xs text-muted-foreground">Unavailable</span>
                  )}
                </div>
                {!location && loading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <span className="text-xs text-muted-foreground">{location || "\u00A0"}</span>
                )}
              </div>
            </div>
          </ToolPanel>

          {/* Network details */}
          <ToolPanel title="Network" flush>
            <Row label="IPv4" value={ipv4} mono />
            <Row label="IPv6" value={ipv6 ?? (loading ? null : "Unavailable")} mono />
            <Row label="ISP / Org" value={ipData?.org ?? null} />
            <Row label="Location" value={location || null} />
            <Row label="Timezone" value={ipData?.timezone ?? null} />
            <Row label="Coordinates" value={ipData?.loc ?? null} mono />
          </ToolPanel>

          {/* Browser / client details */}
          <ToolPanel title="Browser &amp; device" flush>
            <Row label="User Agent" value={clientInfo?.userAgent ?? null} />
            <Row label="Platform" value={clientInfo?.platform ?? null} />
            <Row label="Language" value={clientInfo?.languages ?? null} />
            <Row label="Screen" value={clientInfo?.screenRes ?? null} mono />
            <Row label="Window" value={clientInfo?.windowSize ?? null} mono />
            <Row label="Pixel Ratio" value={clientInfo?.pixelRatio ?? null} mono />
            <Row label="Color Depth" value={clientInfo?.colorDepth ?? null} />
            <Row label="Timezone" value={clientInfo?.timezone ?? null} />
            <Row label="UTC Offset" value={clientInfo?.timezoneOffset ?? null} mono />
            <Row label="Cookies" value={clientInfo?.cookiesEnabled ?? null} />
            <Row label="Do Not Track" value={clientInfo?.doNotTrack ?? null} />
            <Row label="Status" value={clientInfo?.online ?? null} />
            <Row label="Connection" value={clientInfo?.connection ?? null} />
            <Row label="CPU Cores" value={clientInfo?.cores ?? null} mono />
            <Row label="Memory" value={clientInfo?.memory ?? null} />
            <Row label="Touch Points" value={clientInfo?.touchPoints ?? null} mono />
          </ToolPanel>
        </div>

        {/* Right: info sidebar */}
        <ToolAside>
          <ToolCard icon={<Info />} title="About IP Addresses">
            <p>
              Your <span className="text-foreground">public IP address</span> is assigned by your
              ISP and is how other devices on the internet identify your connection.
            </p>
            <p>
              It can reveal your approximate location, ISP, and whether you&apos;re using a VPN or
              proxy. It does not reveal your exact address.
            </p>
            <p>
              <span className="text-foreground">IPv4</span> addresses are 32-bit (e.g. 192.168.1.1).{" "}
              <span className="text-foreground">IPv6</span> addresses are 128-bit and look like
              2001:db8::1.
            </p>
            <p>
              Browser details are read from JavaScript APIs and HTTP headers. No fingerprinting
              libraries are used.
            </p>
          </ToolCard>

          <ReferencesCard
            links={[
              {
                href: "https://datatracker.ietf.org/doc/html/rfc791",
                label: "RFC 791 - Internet Protocol (IPv4)",
              },
              {
                href: "https://datatracker.ietf.org/doc/html/rfc8200",
                label: "RFC 8200 - IPv6 Specification",
              },
              {
                href: "https://developer.mozilla.org/en-US/docs/Web/API/Navigator",
                label: "MDN - Navigator API",
              },
              { href: "https://en.wikipedia.org/wiki/IP_address", label: "Wikipedia - IP address" },
            ]}
          />
        </ToolAside>
      </div>
    </div>
  );
}
