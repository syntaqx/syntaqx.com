import { describe, it, expect } from "vitest";
import { parseLastModified } from "./doc-dates";

const S = "\u0001";
const log = [
  `${S}c3${S}2026-10-22T12:00:00-06:00`,
  "",
  "content/docs/payments/idempotency.md",
  "content/docs/payments/money.md",
  `${S}c2${S}2026-09-01T09:00:00-06:00`,
  "",
  "content/docs/payments/money.md",
  "content/docs/api-design/webhooks.md",
  `${S}c1${S}2026-05-10T08:00:00-06:00`,
  "",
  "content/docs/fundamentals/time.md",
  "content/docs/api-design/webhooks.md",
].join("\n");

describe("parseLastModified()", () => {
  it("keeps each file's newest commit date", () => {
    const dates = parseLastModified(log);
    expect(dates.get("content/docs/payments/idempotency.md")).toBe("2026-10-22T12:00:00-06:00");
    expect(dates.get("content/docs/payments/money.md")).toBe("2026-10-22T12:00:00-06:00");
    expect(dates.get("content/docs/api-design/webhooks.md")).toBe("2026-09-01T09:00:00-06:00");
    expect(dates.get("content/docs/fundamentals/time.md")).toBe("2026-05-10T08:00:00-06:00");
  });

  it("drops files whose newest commit is a shallow boundary, instead of guessing", () => {
    const dates = parseLastModified(log, new Set(["c1"]));
    // Last changed at the boundary: the real date isn't in the history.
    expect(dates.has("content/docs/fundamentals/time.md")).toBe(false);
    // Changed after the boundary: still known.
    expect(dates.get("content/docs/api-design/webhooks.md")).toBe("2026-09-01T09:00:00-06:00");
  });

  it("follows moves: a pure rename keeps the date of the last real edit", () => {
    const moves = [
      `${S}c3${S}2026-10-26T12:00:00-06:00`,
      "",
      "R100\tcontent/docs/industries/payments/ach.md\tcontent/books/payments/ach.md",
      "R092\tcontent/docs/industries/payments/money.md\tcontent/books/payments/money.md",
      `${S}c2${S}2026-09-01T09:00:00-06:00`,
      "",
      "M\tcontent/docs/industries/payments/ach.md",
      "D\tcontent/docs/old.md",
    ].join("\n");
    const dates = parseLastModified(moves);
    expect(dates.get("content/books/payments/ach.md")).toBe("2026-09-01T09:00:00-06:00");
    // Edited while it moved: the move is its last change.
    expect(dates.get("content/books/payments/money.md")).toBe("2026-10-26T12:00:00-06:00");
    expect(dates.has("content/docs/industries/payments/ach.md")).toBe(false);
    expect(dates.has("content/docs/old.md")).toBe(false);
  });
});
