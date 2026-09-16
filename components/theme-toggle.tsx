"use client";

import { useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Sun, Moon, Monitor, Check } from "lucide-react";

type Theme = "light" | "dark" | "system";

const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    // No class → globals.css `@media (prefers-color-scheme)` drives
    // the values. This is what avoids a first-paint flash for users who
    // never pick a theme.
    root.classList.remove("dark", "light");
  } else {
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const initial = stored ?? "system";
    const id = requestAnimationFrame(() => setTheme(initial));
    applyTheme(initial);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if ((localStorage.getItem("theme") ?? "system") === "system") {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", handler);
    return () => {
      cancelAnimationFrame(id);
      mq.removeEventListener("change", handler);
    };
  }, []);

  function selectTheme(t: Theme) {
    setTheme(t);
    localStorage.setItem("theme", t);
    applyTheme(t);
  }

  const ActiveIcon = themes.find((t) => t.value === theme)!.icon;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label="Toggle theme"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface/50 text-dim hover:text-muted hover:border-border-hover transition-colors cursor-pointer"
      >
        <ActiveIcon size={14} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="w-32 rounded-lg border border-border bg-surface py-1 shadow-lg z-100"
        >
          <DropdownMenu.RadioGroup
            value={theme}
            onValueChange={(v) => selectTheme(v as Theme)}
          >
            {themes.map((t) => {
              const Icon = t.icon;
              const active = theme === t.value;
              return (
                <DropdownMenu.RadioItem
                  key={t.value}
                  value={t.value}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs transition-colors cursor-pointer outline-none data-highlighted:bg-background ${
                    active ? "text-accent" : "text-dim data-highlighted:text-foreground"
                  }`}
                >
                  <Icon size={12} />
                  {t.label}
                  {active && <Check size={12} className="ml-auto" />}
                </DropdownMenu.RadioItem>
              );
            })}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
