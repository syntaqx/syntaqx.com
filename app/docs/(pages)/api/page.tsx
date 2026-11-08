import { openApiSpec } from "@/lib/openapi-spec";
import { ApiConsole, type OpenApiSpec } from "./_components/console";

export default function ApiDocsPage() {
  return <ApiConsole initialSpec={openApiSpec() as unknown as OpenApiSpec} />;
}
