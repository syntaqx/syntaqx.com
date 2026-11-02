/**
 * A post's date as the calendar day it was written for. Front matter dates
 * are UTC midnights, so formatting one in local time (a dev machine, or a
 * browser, west of UTC) shows the day before; this keeps the day the same
 * wherever it's rendered. Its own module, free of `fs`, so client
 * components can use it too.
 */
export function postDay(date: string): Date {
  const d = new Date(date);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
