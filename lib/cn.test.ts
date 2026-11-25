import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("lets the caller's class win over a base class for the same property", () => {
    expect(cn("px-3 py-1", "py-2")).toBe("px-3 py-2");
    expect(cn("border border-border", "border-primary/50")).toBe("border border-primary/50");
  });

  it("knows the site's theme colors and fonts", () => {
    expect(cn("bg-card text-muted-foreground", "bg-background text-foreground")).toBe(
      "bg-background text-foreground",
    );
    expect(cn("font-sans", "font-voice")).toBe("font-voice");
  });

  it("keeps text colors and text sizes apart", () => {
    expect(cn("text-muted-foreground text-xs", "text-sm")).toBe("text-muted-foreground text-sm");
    expect(cn("text-muted-foreground text-xs", "text-primary")).toBe("text-xs text-primary");
  });

  it("drops falsy values", () => {
    expect(cn("flex", false, undefined, null, "", "gap-2")).toBe("flex gap-2");
    expect(cn("flex", { "text-primary": true, "text-muted-foreground": false })).toBe(
      "flex text-primary",
    );
  });

  it("keeps leading next to a text size, unless the size sets its own line height", () => {
    expect(cn("leading-snug", "text-lg")).toBe("leading-snug text-lg");
    expect(cn("text-lg", "leading-snug")).toBe("text-lg leading-snug");
    expect(cn("leading-snug", "text-lg/7")).toBe("text-lg/7");
  });

  it("keeps custom utilities", () => {
    expect(cn("inst text-muted-foreground", "flex")).toBe("inst text-muted-foreground flex");
  });
});
