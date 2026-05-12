import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

/**
 * Better Auth catch-all handler.
 *
 * Serves every Better Auth endpoint under /api/auth/*:
 *   POST /api/auth/sign-in/email
 *   POST /api/auth/sign-up/email
 *   POST /api/auth/sign-out
 *   POST /api/auth/forget-password
 *   GET  /api/auth/get-session
 *   ... etc.
 *
 * See: docs/architecture/auth.md
 */
export const { GET, POST } = toNextJsHandler(auth.handler);
