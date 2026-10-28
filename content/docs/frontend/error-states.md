+++
title = "Error & Empty States"
description = "Designing every view's loading, empty, error, partial and success states up front, with messages that explain what to do, retries, and no blank pages."
category = "Frontend"
order = 605
tags = ["frontend", "ux", "errors", "resilience"]
+++

Designs usually show the happy path: the dashboard full of data, the request that came back in 80 milliseconds. Production shows everything else. The list is empty on a new account, the API is slow on a bad connection, one widget's request fails while the rest succeed. If nobody designed those states, the code decides, and its default is a blank area, a spinner that never stops, or `undefined` in the middle of the page. The fix is cheap up front: every view that loads data gets its states designed alongside the happy path, not discovered in a bug report.

## Five States, Not One

| State | What the user should see |
| --- | --- |
| Loading | That something is happening, without the layout jumping when it finishes |
| Empty | Why there's nothing, and the next step to get something |
| Error | What went wrong, what to do now, and a way to retry |
| Partial | The parts that worked, with the failed part marked, not the whole view thrown away |
| Success | The content, and confirmation when the user just did something |

As a checklist in design review, this catches most problems before code exists. As a state machine in the component (one `status`, not a cluster of `isLoading`, `hasError` and `data` booleans that can contradict each other), it makes impossible combinations like loading-and-error unrepresentable.

## Loading Without Layout Shift

How long the wait is decides what to show. Below about a second people barely notice, and a spinner that flashes for 200 ms is worse than nothing. NN/g's research puts the thresholds at 0.1 s (feels instant), 1 s (noticeable, but flow is kept) and 10 s (attention is lost), and past 10 s people need a real progress indicator with some sense of how long ([response time limits](https://www.nngroup.com/articles/response-times-3-important-limits/)).

For page and section loads, I prefer **skeletons** over spinners: placeholder shapes in the layout's real dimensions. They show what's coming and reserve the space, so the page doesn't jump when content arrives. That jump is [Cumulative Layout Shift](https://web.dev/articles/cls), a Core Web Vital ([Web Performance](/docs/frontend/web-performance)), and it's how people end up clicking the wrong thing. NN/g recommends skeletons for full-page loads under about 10 seconds and spinners for a single module ([skeleton screens](https://www.nngroup.com/articles/skeleton-screens/)).

Two rules that prevent common bugs: don't show "No results" while the request is still in flight (a flash of the empty state reads as a real answer), and give every loading state a timeout that turns into an error state, so a hung request can't leave a spinner forever.

## Error Messages People Can Act On

"Something went wrong" is the most common error message and the least useful: it doesn't say whether to retry, wait, fix something or give up. A good message answers what happened, in plain terms, and what to do now.

- **Specific beats generic.** "We couldn't save your changes because the connection dropped. They're still here; try again" tells the person their work is safe and what to do. "Error 500" tells them nothing.
- **No blame, no codes in the headline.** NN/g's [error message guidelines](https://www.nngroup.com/articles/error-message-guidelines/) recommend plain language, avoiding words like "invalid" and "illegal", and keeping technical codes out of the main message.
- **Severity matches impact.** A failed background refresh is a small inline notice, not a modal that blocks the whole page.
- **Keep what the user did.** A failed save keeps the form filled in ([Forms & Validation](/docs/frontend/forms)).

### Give Support Something to Search For

The API returns a `Request-Id` header on every response, including errors ([Error Responses](/docs/requests/error-responses)). When an error is worth contacting support about, show it in small text with a copy button. One line of UI turns "it didn't work yesterday" into a log search that takes seconds ([Request IDs](/docs/observability/overview#request-ids)).

## Retry and Offline

Most frontend errors are transient: a dropped connection, a timeout, a `503` during a deploy. Every error state for a read gets a retry button, and many reads can retry once automatically first. The rules are the same as anywhere ([Retries & Timeouts](/docs/architecture/retries-and-timeouts)): reads are safe to repeat, writes only with an [idempotency key](/docs/payments/idempotency), and automatic retries back off.

When the device is offline, say so once, globally, instead of letting every widget fail separately. The browser's [`online` and `offline` events](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine) are a hint, not proof (a device can be "online" with no route to your server), so treat a failed request as the real signal and the event as a cue to retry when connectivity returns.

## Empty States Teach the Next Step

An empty state is the first thing every new user sees, some of the most-viewed design in the product, and "No projects" wastes it. NN/g recommends that empty states communicate status, help people learn the feature, and give a direct path to act ([empty state design](https://www.nngroup.com/articles/empty-state-interface-design/)): "You haven't created a project yet. Projects group your API keys and webhooks. **Create a project**."

Distinguish the kinds of empty, because they need different words: nothing exists yet (onboarding), a search or filter matched nothing (offer to clear it), and everything is done (an inbox at zero is a success, not a void).

## Optimistic UI and Rolling Back

For quick, likely-to-succeed actions (starring, toggling, reordering), updating the UI before the server confirms makes the product feel instant. The cost is handling failure: roll the change back visibly and say why, rather than showing something the server never accepted. React's [`useOptimistic`](https://react.dev/reference/react/useOptimistic) models exactly this: the optimistic state lasts while the action is pending and reverts to the real state when it settles.

Don't be optimistic about things that are expensive to be wrong about. A payment, a deletion or anything irreversible waits for the server.

## Never a Blank Page

A rendering error in one component shouldn't take down the whole page. In React that's an error boundary: a component that catches errors thrown while rendering its children and shows a fallback. Error boundaries are still class components (libraries such as `react-error-boundary` wrap one), and they don't catch errors in event handlers or ordinary async code, which need their own handling ([React docs](https://react.dev/reference/react/Component)).

Place them around each independent widget, so one failing chart doesn't blank the dashboard, and at the route level as a backstop. Next.js builds this in with an `error` file per route segment and a `global-error` file for the root layout ([Next.js error handling](https://nextjs.org/docs/app/getting-started/error-handling)). Every boundary reports to monitoring: a fallback the user sees and the team never hears about is a bug that lives forever.

Announce dynamic changes for screen reader users too. A status message that appears without moving focus, like "Saved" or "3 results", needs a live region ([WCAG 4.1.3, Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)).

## References

**Specifications**

- [W3C: Understanding WCAG 2.2, Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), announcing changes without moving focus

**Reference**

- [React: Component, catching rendering errors with an error boundary](https://react.dev/reference/react/Component), what error boundaries catch and don't
- [React: useOptimistic](https://react.dev/reference/react/useOptimistic), optimistic state that reverts when an action settles
- [Next.js: Error Handling](https://nextjs.org/docs/app/getting-started/error-handling), route-segment error files and global errors
- [MDN: Navigator.onLine](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine), online and offline signals and their limits
- [web.dev: Cumulative Layout Shift](https://web.dev/articles/cls), measuring layout shift

**In practice**

- [NN/g: Response Time Limits](https://www.nngroup.com/articles/response-times-3-important-limits/), when people need feedback while waiting
- [NN/g: Skeleton Screens 101](https://www.nngroup.com/articles/skeleton-screens/), skeletons vs spinners vs progress bars
- [NN/g: Error-Message Guidelines](https://www.nngroup.com/articles/error-message-guidelines/), wording, placement and recovery
- [NN/g: Designing Empty States in Complex Applications](https://www.nngroup.com/articles/empty-state-interface-design/), status, learnability and next steps
