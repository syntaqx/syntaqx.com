import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("lets the caller's class win over a base class for the same property", () => {
    expect(cn("px-3 py-1", "py-2")).toBe("px-3 py-2");
    expect(cn("border border-border", "border-accent/50")).toBe("border border-accent/50");
  });

  it("knows the site's theme colors and fonts", () => {
    expect(cn("bg-surface text-dim", "bg-background text-foreground")).toBe("bg-background text-foreground");
    expect(cn("font-sans", "font-voice")).toBe("font-voice");
  });

  it("keeps text colors and text sizes apart", () => {
    expect(cn("text-dim text-xs", "text-sm")).toBe("text-dim text-sm");
    expect(cn("text-dim text-xs", "text-accent")).toBe("text-xs text-accent");
  });

  it("drops falsy values", () => {
    expect(cn("flex", false, undefined, null, "", "gap-2")).toBe("flex gap-2");
    expect(cn("flex", { "text-accent": true, "text-dim": false })).toBe("flex text-accent");
  });

  it("keeps custom utilities", () => {
    expect(cn("inst text-dim", "flex")).toBe("inst text-dim flex");
  });
});
