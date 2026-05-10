export function GET() {
  const isDev = process.env.NODE_ENV === "development";
  const baseUrl = isDev ? "/api/v1" : "https://api.syntaqx.com/v1";

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
      openapi_url: `${baseUrl}/openapi`,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
