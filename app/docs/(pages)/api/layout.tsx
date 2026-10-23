import { JsonLd } from "@/components/json-ld";
import { article } from "@/lib/schema";
import { pageMetadata } from "@/lib/metadata";

const title = "Interactive API Reference";
const description =
  "Interactive API reference for the syntaqx API: browse endpoints, parameters, and responses, and try requests directly from your browser.";

export const metadata = pageMetadata("/docs/api", title, description);

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={article({
          headline: title,
          description,
          path: "/docs/api",
          crumbs: [
            { name: "Docs", path: "/docs" },
            { name: "API Reference", path: "/docs/api" },
          ],
        })}
      />
      {children}
    </>
  );
}
