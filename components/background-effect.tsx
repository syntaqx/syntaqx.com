// Decorative-only. No hooks, no events, no client behavior — keep this
// as a Server Component so it doesn't ship JS or block hydration on
// every page. (Was "use client" without reason.)
export function BackgroundEffect() {
  return (
    <div
      className="absolute inset-x-0 top-0 -z-10 overflow-hidden pointer-events-none"
      style={{ height: "60vh" }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 hexagon-bg"
        style={{
          backgroundImage: "url(/hexagons.svg)",
          backgroundRepeat: "repeat",
          backgroundSize: "56px 97px",
          backgroundPosition: "0 16px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 20%, var(--background) 100%)",
        }}
      />
    </div>
  );
}
