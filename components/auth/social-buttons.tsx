"use client";

import { SimpleIcon } from "@/components/simple-icon";
import { SOCIAL_PROVIDERS } from "./providers";

export function SocialButtons() {
  return (
    <div className="flex flex-col gap-2">
      {SOCIAL_PROVIDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          disabled={!p.enabled}
          className="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-border-hover hover:bg-surface disabled:cursor-not-allowed enabled:cursor-pointer"
        >
          <SimpleIcon name={p.iconSlug} size={16} />
          <span>{p.label}</span>
        </button>
      ))}
    </div>
  );
}
