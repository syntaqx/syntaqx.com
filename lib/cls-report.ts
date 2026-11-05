/**
 * Turns a session's cumulative layout shift into a Sentry report naming the
 * element that moved most and the route it moved on. Speed Insights shows
 * CLS per route with no element, and charges a whole session's CLS to the
 * page it ended on; this says what shifted, and where.
 */

import type { CLSMetricWithAttribution } from "web-vitals/attribution";

/** Web Vitals' "needs improvement" threshold: anything at or below is good. */
export const CLS_REPORT_THRESHOLD = 0.1;

/** A client-side navigation: when it started, and the path it went to. */
export interface RouteMark {
  at: number;
  path: string;
}

/** The path the visitor was on at time `t` (ms since navigation start). */
export function routeAt(marks: readonly RouteMark[], t: number): string {
  let path = marks[0]?.path ?? "";
  for (const m of marks) if (m.at <= t) path = m.path;
  return path;
}

export interface ClsReport {
  fingerprint: string[];
  tags: Record<string, string>;
  extra: Record<string, unknown>;
}

/** Null when the session's CLS is good. Fingerprinted by element, so each culprit is one issue. */
export function clsReport(
  metric: Pick<CLSMetricWithAttribution, "value" | "rating" | "navigationType" | "attribution">,
  marks: readonly RouteMark[],
  viewport: readonly [number, number],
): ClsReport | null {
  if (metric.value <= CLS_REPORT_THRESHOLD) return null;
  const a = metric.attribution;
  const target = a.largestShiftTarget ?? "(unknown)";
  const shiftRoute = a.largestShiftTime === undefined ? "" : routeAt(marks, a.largestShiftTime);
  return {
    fingerprint: ["cls", target],
    tags: {
      cls_target: target.slice(0, 200),
      cls_route: shiftRoute || "(unknown)",
      cls_load_state: a.loadState ?? "(unknown)",
    },
    extra: {
      value: Number(metric.value.toFixed(4)),
      rating: metric.rating,
      navigationType: metric.navigationType,
      largestShiftValue: a.largestShiftValue,
      largestShiftTime: a.largestShiftTime === undefined ? null : Math.round(a.largestShiftTime),
      endRoute: routeAt(marks, Number.POSITIVE_INFINITY),
      routes: marks.map((m) => `${Math.round(m.at)} ${m.path}`).slice(-20),
      viewport: `${viewport[0]}x${viewport[1]}`,
    },
  };
}
