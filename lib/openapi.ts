import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { CONTACT_EMAIL } from "@/lib/constants";

extendZodWithOpenApi(z);

// ---------------------------------------------------------------------------
// Registry — every route registers its schemas here
// ---------------------------------------------------------------------------

export const registry = new OpenAPIRegistry();

// ---------------------------------------------------------------------------
// Shared schemas
// ---------------------------------------------------------------------------

export const ErrorSchema = z
  .object({
    message: z.string(),
    errors: z
      .record(z.string(), z.array(z.string()))
      .optional()
      .openapi({ description: "Field-level validation errors" }),
  })
  .openapi("Error");

registry.register("Error", ErrorSchema);

// ---------------------------------------------------------------------------
// Spec generator
// ---------------------------------------------------------------------------

export function generateOpenApiSpec() {
  const isDev = process.env.NODE_ENV === "development";
  const server = isDev
    ? { url: "http://localhost:3000/api/v1", description: "Local development" }
    : { url: "https://api.syntaqx.com/v1", description: "Production" };

  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "syntaqx API",
      version: "1.0.0",
      description:
        "Public API for syntaqx.com. Breaking changes never ship in place; deprecations are announced with Deprecation and Sunset headers at least 30 days before removal. See https://www.syntaqx.com/docs/versioning.",
      contact: {
        name: "Chase Pierce",
        url: "https://www.syntaqx.com/contact",
        email: CONTACT_EMAIL,
      },
    },
    servers: [server],
  });
}
