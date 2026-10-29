export function GET() {
  const isDev = process.env.NODE_ENV === "development";
  const baseUrl = isDev ? "/api" : "https://api.syntaqx.com";

  return Response.json(
    {
      healthz_url: `${baseUrl}/healthz`,
      uuid_url: `${baseUrl}/uuid`,
      ip_url: `${baseUrl}/ip`,
      hash_url: `${baseUrl}/hash`,
      base64_url: `${baseUrl}/base64`,
      jwt_decode_url: `${baseUrl}/jwt/decode`,
      timestamp_url: `${baseUrl}/timestamp`,
      flaky_url: `${baseUrl}/flaky`,
      random_url: `${baseUrl}/random`,
      useragent_url: `${baseUrl}/useragent`,
      docs_url: `${baseUrl}/docs`,
      echo_url: `${baseUrl}/echo`,
      secrets_url: `${baseUrl}/secrets`,
      openapi_url: `${baseUrl}/openapi`,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
