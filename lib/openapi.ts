import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { CONTACT_EMAIL } from "@/lib/constants";
import { API_VERSIONS } from "@/lib/api";

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

  const versions = API_VERSIONS.map((v) => v.version);
  const generator = new OpenApiGeneratorV31(registry.definitions);
  const doc = generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "syntaqx API",
      // The newest dated API version this document describes.
      version: versions[versions.length - 1],
      description:
        "Public API for syntaqx.com. Pick a dated version with the Api-Version request header (without it, the oldest supported version is used). Breaking changes never ship in place; deprecations are announced with Deprecation and Sunset headers at least 30 days before removal. See https://www.syntaqx.com/docs/versioning.",
      contact: {
        name: "Chase Pierce",
        url: "https://www.syntaqx.com/contact",
        email: CONTACT_EMAIL,
      },
    },
    servers: [server],
  });

  // Every operation accepts the Api-Version header (handled in proxy.ts).
  doc.components = {
    ...doc.components,
    parameters: {
      ...doc.components?.parameters,
      ApiVersion: {
        name: "Api-Version",
        in: "header",
        required: false,
        description:
          "Dated API version (YYYY-MM-DD). Defaults to the oldest supported version. Unsupported values return 400.",
        schema: { type: "string", enum: versions, default: versions[0] },
      },
    },
  };
  for (const ops of Object.values(doc.paths ?? {})) {
    for (const op of Object.values(ops) as { parameters?: unknown[] }[]) {
      op.parameters = [
        ...(op.parameters ?? []),
        { $ref: "#/components/parameters/ApiVersion" },
      ];
    }
  }
  return doc;
}
