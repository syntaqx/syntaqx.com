import { describe, expect, it } from "vitest";
import { clsReport, routeAt, type RouteMark } from "./cls-report";

const marks: RouteMark[] = [
  { at: 0, path: "/books" },
  { at: 4000, path: "/books/payments" },
  { at: 9000, path: "/books/payments/glossary/the-business" },
];

const metric = (value: number, attribution: Record<string, unknown> = {}) => ({
  value,
  rating: value > 0.25 ? ("poor" as const) : ("needs-improvement" as const),
  navigationType: "navigate" as const,
  attribution: {
    largestShiftTarget: "main>article>header",
    largestShiftTime: 5000,
    largestShiftValue: 0.4,
    loadState: "complete" as const,
    ...attribution,
  },
});

describe("routeAt", () => {
  it("finds the route a time falls on", () => {
    expect(routeAt(marks, 0)).toBe("/books");
    expect(routeAt(marks, 3999)).toBe("/books");
    expect(routeAt(marks, 4000)).toBe("/books/payments");
    expect(routeAt(marks, 1e9)).toBe("/books/payments/glossary/the-business");
  });
});

describe("clsReport", () => {
  it("stays quiet at or below the 0.1 threshold", () => {
    expect(clsReport(metric(0.1), marks, [1440, 900])).toBeNull();
    expect(clsReport(metric(0.02), marks, [1440, 900])).toBeNull();
  });

  it("groups by the element that moved and tags the route it moved on, not the exit page", () => {
    const r = clsReport(metric(0.7), marks, [1440, 900])!;
    expect(r.fingerprint).toEqual(["cls", "main>article>header"]);
    expect(r.tags.cls_route).toBe("/books/payments");
    expect(r.tags.cls_load_state).toBe("complete");
    expect(r.extra).toMatchObject({
      value: 0.7,
      endRoute: "/books/payments/glossary/the-business",
      viewport: "1440x900",
    });
  });

  it("still reports when the browser couldn't attribute the shift", () => {
    const r = clsReport(
      metric(0.3, { largestShiftTarget: undefined, largestShiftTime: undefined }),
      marks,
      [390, 844],
    )!;
    expect(r.fingerprint).toEqual(["cls", "(unknown)"]);
    expect(r.tags.cls_route).toBe("(unknown)");
  });
});
