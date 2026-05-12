"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Menu,
  X,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { Avatar } from "@/components/avatar";

const links = [
  { href: "/posts", label: "posts" },
  { href: "/projects", label: "projects" },
  { href: "/docs", label: "docs" },
  { href: "/misc", label: "misc" },
  { href: "/about", label: "about" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="hidden sm:flex items-center gap-5">
      {links.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm transition-colors ${
              isActive
                ? "text-accent font-medium"
                : "text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileMenu() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as
    | {
        name?: string | null;
        username?: string | null;
        image?: string | null;
      }
    | undefined;
  const username = user ? (user.username ?? user.name ?? null) : null;
  const displayName = user?.name ?? null;
  const image = user?.image ?? null;
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close on route change (derived state pattern)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const signedIn = Boolean(username);
  const profileHref = username ? `/${username}` : "/login";

  async function onSignOut() {
    setSigningOut(true);
    await signOut();
    setOpen(false);
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 text-dim hover:text-foreground transition-colors cursor-pointer"
        aria-label="Toggle menu"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      {open &&
        createPortal(
          <div
            className="fixed inset-x-0 top-12.25 bottom-0 z-100 bg-background backdrop-blur-md"
            onClick={() => setOpen(false)}
          >
            <nav
              className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              {links.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`text-lg transition-colors ${
                      isActive
                        ? "text-accent font-medium"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="border-t border-border pt-6">
                {signedIn && username ? (
                  <div className="flex flex-col gap-4">
                    <Link
                      href={profileHref}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3"
                    >
                      <Avatar
                        src={image}
                        label={username}
                        size={36}
                        alt={displayName ?? username}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm text-foreground truncate">
                          {displayName ?? username}
                        </span>
                        <span className="text-xs text-dim truncate">
                          @{username}
                        </span>
                      </div>
                    </Link>
                    <Link
                      href={profileHref}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 text-base text-muted hover:text-foreground transition-colors"
                    >
                      <UserIcon size={16} className="text-dim" aria-hidden />
                      <span>Your profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 text-base text-muted hover:text-foreground transition-colors"
                    >
                      <SettingsIcon
                        size={16}
                        className="text-dim"
                        aria-hidden
                      />
                      <span>Settings</span>
                    </Link>
                    <button
                      type="button"
                      onClick={onSignOut}
                      disabled={signingOut}
                      className="flex items-center gap-2 text-base text-muted hover:text-foreground transition-colors disabled:opacity-60 enabled:cursor-pointer text-left"
                    >
                      <LogOut size={16} className="text-dim" aria-hidden />
                      <span>{signingOut ? "Signing out…" : "Sign out"}</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className={`text-lg transition-colors ${
                      pathname === "/login"
                        ? "text-accent font-medium"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    sign in
                  </Link>
                )}
              </div>
            </nav>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-1.5 flex items-center gap-1.5 text-xs text-dim min-w-0 overflow-hidden">
        <Link href="/" className="shrink-0 hover:text-accent transition-colors">
          home
        </Link>
        {segments.length === 0 && (
          <span className="flex items-center gap-1.5 min-w-0 shrink-0 last:shrink">
            <span>/</span>
            <span className="text-muted truncate">index</span>
          </span>
        )}
        {segments.map((segment, i) => {
          const href = "/" + segments.slice(0, i + 1).join("/");
          const isLast = i === segments.length - 1;
          return (
            <span
              key={href}
              className="flex items-center gap-1.5 min-w-0 shrink-0 last:shrink"
            >
              <span>/</span>
              {isLast ? (
                <span className="text-muted truncate">{segment}</span>
              ) : (
                <Link
                  href={href}
                  className="shrink-0 hover:text-accent transition-colors"
                >
                  {segment}
                </Link>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
