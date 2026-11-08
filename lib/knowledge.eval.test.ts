import { describe, it, expect } from "vitest";
import { search, searchDetailed } from "@/lib/knowledge";

/**
 * Search quality over the real content: questions phrased the way people
 * ask them, and the page that answers each. A miss here means the MCP server
 * sends a client to the wrong page, so changes to ranking, or content that
 * moves a page, should keep this green.
 */
const CASES: [query: string, expected: string | string[]][] = [
  // Either-or and "which should I use" questions.
  [
    "should I use postgres or a message broker for background jobs",
    "/docs/architecture/background-jobs",
  ],
  ["jobs table or a workflow engine like temporal", "/docs/building-blocks/workflows"],
  ["react native or a PWA for offline", "/docs/building-blocks/offline-sync"],
  ["native or cross-platform mobile app", "/docs/frontend/mobile-apps"],
  ["rules engine or just code", "/docs/building-blocks/rules-as-data"],
  ["soft delete or hard delete", "/docs/building-blocks/data-retention"],
  ["rewrite or strangler fig", "/docs/development/tech-debt"],
  ["build or buy a unified api for integrations", "/docs/building-blocks/integrations"],
  ["star schema or wide tables", "/docs/data/data-modeling"],
  ["batch or online inference", "/docs/data/data-science-platforms"],
  ["commands vs events", "/docs/architecture/events"],
  ["sync or async calls between services", "/docs/architecture/service-boundaries"],
  ["elasticsearch or postgres for search", "/docs/building-blocks/search"],
  ["401 or 403", "/docs/api-design/authentication"],
  ["websockets or server-sent events", "/docs/architecture/realtime-connections"],
  ["big bang or phased migration", "/docs/architecture/replacing-systems"],
  ["rest vs graphql vs grpc", "/docs/api-design/api-styles"],
  ["cursor or offset pagination", "/docs/requests/pagination"],
  ["uuid or ulid", "/docs/fundamentals/identifier-conventions"],
  ["header or url versioning", "/docs/api-design/versioning"],
  ["monorepo or one repo per service", "/docs/development/repositories"],
  ["k8s or managed containers", "/docs/delivery/where-to-run"],
  ["continuous delivery vs continuous deployment", "/docs/delivery/ci-pipelines"],
  // Product comparisons, where the options meet in the body, not a heading.
  ["postgres or mongodb", "/books/hosting-and-cloud/managed-databases"],
  ["dynamodb vs postgres", "/books/hosting-and-cloud/managed-databases"],
  ["terraform or pulumi", "/books/hosting-and-cloud/terraform-and-opentofu"],
  ["kafka or rabbitmq", "/books/hosting-and-cloud/managed-queues-and-streaming"],
  [
    "jenkins or github actions",
    ["/books/hosting-and-cloud/ci-history", "/docs/delivery/ci-pipelines"],
  ],
  [
    "ecs or kubernetes",
    [
      "/docs/delivery/where-to-run",
      "/books/hosting-and-cloud/kubernetes-distributions-and-alternatives",
    ],
  ],
  ["lambda or containers", "/docs/delivery/where-to-run"],
  ["cloudflare workers or vercel functions", "/books/hosting-and-cloud/functions-and-edge-compute"],
  [
    "chef or puppet",
    ["/books/hosting-and-cloud/cfengine-and-puppet", "/books/hosting-and-cloud/chef"],
  ],
  ["playwright or cypress", "/docs/quality/automated-testing"],
  ["vitest or jest", "/docs/quality/automated-testing"],
  ["auth0 or self-hosted auth", "/docs/security/identity-providers"],
  [
    "datadog or opentelemetry",
    ["/docs/observability/collector", "/docs/observability/errors-and-profiling"],
  ],
  // Plain lookups.
  ["idempotency keys", "/docs/requests/idempotency"],
  ["webhook signatures", "/docs/api-design/webhooks"],
  ["feature flag cleanup", "/docs/delivery/feature-flags"],
  ["ach returns", "/books/payments/ach"],
  ["chargebacks", "/books/payments/disputes-and-chargebacks"],
  [
    "hipaa business associate agreement",
    ["/docs/compliance/hipaa", "/books/health-tech/hipaa-in-practice"],
  ],
];

const TOP = 3;

describe("search eval", () => {
  it.each(CASES)("%s → %s", (query, expected) => {
    const paths = [...new Set(search(query, { limit: 10 }).map((r) => r.path))].slice(0, TOP);
    expect(paths).toEqual(expect.arrayContaining([expect.toBeOneOf([expected].flat())]));
  });

  // An either-or question opens on a section that weighs every option, not
  // one that happens to mention just one of them.
  it.each(CASES.filter(([q]) => searchDetailed(q).comparison?.together))(
    "%s opens on a section covering every option",
    (query) => {
      const { results, comparison } = searchDetailed(query);
      expect(results[0].covers).toHaveLength(comparison!.options.length);
    },
  );
});
