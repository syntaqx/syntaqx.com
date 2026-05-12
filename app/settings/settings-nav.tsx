"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SETTINGS_SECTIONS } from "./_sections";

const GROUPS = [
  { key: "personal", label: "Personal" },
  { key: "access", label: "Access" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {GROUPS.map((group) => {
        const items = SETTINGS_SECTIONS.filter((s) => s.group === group.key);
        return (
          <div key={group.key}>
            <h3 className="text-[10px] font-medium uppercase tracking-widest text-dim mb-2">
              {group.label}
            </h3>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between gap-2 text-xs py-1.5 px-2.5 rounded-md transition-colors ${
                        active
                          ? "text-accent bg-accent/10 font-medium"
                          : "text-muted hover:text-foreground hover:bg-surface"
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {!item.available && (
                        <span className="text-[10px] text-dim/60 uppercase tracking-wider shrink-0">
                          soon
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
