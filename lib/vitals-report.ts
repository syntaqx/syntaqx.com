/**
 * Slow interactions (INP) and slow loads (LCP) as Sentry reports naming the
 * element and where the time went. Speed Insights shows both per route with
 * no element or breakdown, which leaves a handful of slow visits unexplained.
 */

import type { INPMetricWithAttribution, LCPMetricWithAttribution } from "web-vitals/attribution";
import { routeAt, type ClsReport, type RouteMark } from "@/lib/cls-report";

export type VitalsReport = ClsReport;

const ms = (n: number | undefined) => (n === undefined ? null : Math.round(n));
const noQuery = (url: string) => url.split(/[?#]/)[0];

/** Null when the interaction was good (200ms or under). Fingerprinted by element. */
export function inpReport(
  metric: Pick<INPMetricWithAttribution, "value" | "rating" | "attribution">,
  marks: readonly RouteMark[],
  viewport: readonly [number, number],
): VitalsReport | null {
  if (metric.rating === "good") return null;
  const a = metric.attribution;
  const target = a.interactionTarget || "(unknown)";
  const script = a.longestScript?.entry;
  return {
    fingerprint: ["inp", target],
    tags: {
      inp_target: target.slice(0, 200),
      inp_route: a.interactionTime === undefined ? "(unknown)" : routeAt(marks, a.interactionTime),
      inp_type: a.interactionType ?? "(unknown)",
      inp_load_state: a.loadState,
    },
    extra: {
      value: Math.round(metric.value),
      rating: metric.rating,
      inputDelay: ms(a.inputDelay),
      processingDuration: ms(a.processingDuration),
      presentationDelay: ms(a.presentationDelay),
      script: ms(a.totalScriptDuration),
      styleAndLayout: ms(a.totalStyleAndLayoutDuration),
      paint: ms(a.totalPaintDuration),
      unattributed: ms(a.totalUnattributedDuration),
      longestScript: script
        ? `${script.invoker} ${noQuery(script.sourceURL)}:${script.sourceFunctionName} ${Math.round(script.duration)}ms`
        : null,
      viewport: `${viewport[0]}x${viewport[1]}`,
    },
  };
}

/** Null when the load was good (2.5s or under). Fingerprinted by element. */
export function lcpReport(
  metric: Pick<LCPMetricWithAttribution, "value" | "rating" | "attribution">,
  path: string,
  viewport: readonly [number, number],
): VitalsReport | null {
  if (metric.rating === "good") return null;
  const a = metric.attribution;
  const target = a.target || "(unknown)";
  return {
    fingerprint: ["lcp", target],
    tags: { lcp_target: target.slice(0, 200), lcp_route: path },
    extra: {
      value: Math.round(metric.value),
      rating: metric.rating,
      timeToFirstByte: ms(a.timeToFirstByte),
      resourceLoadDelay: ms(a.resourceLoadDelay),
      resourceLoadDuration: ms(a.resourceLoadDuration),
      elementRenderDelay: ms(a.elementRenderDelay),
      resource: a.url ? noQuery(a.url) : null,
      viewport: `${viewport[0]}x${viewport[1]}`,
    },
  };
}
