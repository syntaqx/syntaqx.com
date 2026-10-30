"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { Menu, MenuContent, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@/components/menu";
import { cn } from "@/lib/cn";

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
    <Menu>
      <MenuTrigger
        aria-label="Toggle theme"
        className="flex w-12 items-center justify-center border-l border-border text-dim transition-colors hover:text-foreground cursor-pointer"
      >
        <ActiveIcon size={14} />
      </MenuTrigger>
      <MenuContent className="w-32">
        <MenuRadioGroup
          value={theme}
          onValueChange={(v) => selectTheme(v as Theme)}
        >
          {themes.map((t) => {
            const Icon = t.icon;
            const active = theme === t.value;
            return (
              <MenuRadioItem
                key={t.value}
                value={t.value}
                className={cn(
                  "w-full items-center gap-2 py-1.5 text-xs",
                  active ? "text-accent" : "text-dim data-highlighted:text-foreground",
                )}
              >
                <Icon size={12} />
                {t.label}
                {active && <Check size={12} className="ml-auto" />}
              </MenuRadioItem>
            );
          })}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}
