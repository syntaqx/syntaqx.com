import * as Sentry from "@sentry/nextjs";
import { errorResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

// A faulty API route to test Sentry's error monitoring.
// Captures the exception via Sentry, then returns a normalized 500 so the
// response still complies with the documented error envelope and carries
// the X-Request-ID / rate-limit headers attached by proxy.
export function GET() {
  Sentry.logger.info("Sentry example API called");
  const error = new SentryExampleAPIError(
    "This error is raised on the backend called by the example page.",
  );
  Sentry.captureException(error);
  return errorResponse(500, error.message);
}
