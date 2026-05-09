export function GET() {
  const isDev = process.env.NODE_ENV === "development";
  const baseUrl = isDev ? "/api/v1" : "https://api.syntaqx.com/v1";

  return Response.json(
    {
      healthz_url: `${baseUrl}/healthz`,
      openapi_url: `${baseUrl}/openapi`,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
